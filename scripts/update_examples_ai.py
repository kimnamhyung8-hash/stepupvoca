import os
import json
import time

try:
    from google import genai
except ImportError:
    print("[준비 사항] 구글 AI 라이브러리가 설치되어 있지 않습니다.")
    print("터미널 창에 다음을 입력하여 먼저 라이브러리를 설치해주세요:")
    print("pip install google-genai")
    exit(1)

# -------------------------------------------------------------
# [VocaQuest] 기존 단어의 '획일화된 예문'을 AI로 완벽하게 재생성 및 다국어 번역하는 스크립트!
# 터미널에서 아래 명령어로 API 키를 환경변수에 등록 후 실행해주세요:
# Windows (PowerShell): $env:GEMINI_API_KEY="자신의_API_키"; python scripts/update_examples_ai.py
# -------------------------------------------------------------

def process_batch(client, words_batch):
    word_list = [w['word'] for w in words_batch]
    
    prompt = f"""
    당신은 VocaQuest 단어장 앱의 5개 국어(영/한/일/중/베) 전문 커리큘럼 설계자입니다.
    기존에 "The word X is used in daily conversation." 처럼 똑같이 반복복사되던 바보같은 기계적 예문을 버리고, 제공된 {len(word_list)}개의 영단어 각각에 대하여 '상황이 연상되는 가장 매력적이고 완전히 다른 실생활 문맥의 영어 예문'을 새롭게 작성해주세요.
    (예: Book -> "I always read a book before going to sleep.", Run -> "He had to run to catch the bus.")
    
    [대상 단어 목록]
    {', '.join(word_list)}
    
    엄격하게 다음 JSON 배열(Array) 데이터만 응답해야 합니다. 마크다운 기호(```json)나 요약 없이 100% 순수 JSON만 반환하세요.
    [
      {{
        "word": "단어1",
        "example_en": "원어민이 쓰는 다채롭고 자연스러운 실생활 영어 예문",
        "example_ko": "해당 예문의 한국어 해석",
        "examples_loc": {{
          "ko": "한국어 해석",
          "en": "위 example_en과 동일",
          "ja": "자연스러운 일본어 번역",
          "zh": "자연스러운 중국어 번역",
          "vi": "자연스러운 베트남어 번역"
        }}
      }}
    ]
    """
    
    retries = 3
    for attempt in range(retries):
        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
            )
            result_text = response.text.replace('```json', '').replace('```', '').strip()
            data = json.loads(result_text)
            
            # 소문자로 통일하여 기존 단어와 맵핑 (업데이트)
            update_map = {item['word'].lower(): item for item in data}
            
            for w in words_batch:
                target = w['word'].lower()
                if target in update_map:
                    nw = update_map[target]
                    w['example_en'] = nw['example_en']
                    w['example_ko'] = nw['example_ko']
                    w['examples_loc'] = nw.get('examples_loc', w['examples_loc'])
            return True
        except Exception as e:
            print(f"[AI 요청 실패 - 재시도 {attempt+1}/{retries}] 오류: {e}")
            time.sleep(2)
            
    return False

def main():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("[ERROR] GEMINI_API_KEY 환경 변수가 설정되어 있지 않습니다.")
        print("터미널에 다음을 입력하여 키를 설정하세요: $env:GEMINI_API_KEY=\"발급받은키\"")
        return
        
    client = genai.Client()
    path = r'd:\antigravity\stepupvoca\app\src\data\vocaDB.json'

    print("[VocaQuest] 기존 단어장(vocaDB.json) 예문 전체 리모델링을 시작합니다...")
    
    with open(path, 'r', encoding='utf-8') as f:
        db = json.load(f)

    # 모든 단어를 추출하여 30개씩 청크 분할 (한 번의 요청으로 너무 많이 보내면 누락 발생)
    all_words_ref = []
    for lvl in db:
        all_words_ref.extend(lvl['words'])
        
    batch_size = 30
    total_batches = (len(all_words_ref) + batch_size - 1) // batch_size
    
    print(f"총 단어 개수: {len(all_words_ref)}개 (작업 그룹: {total_batches}번 분할 처리)")
    
    # 예시로 첫 3개의 그룹(약 90개 단어)만 우선 샘플 처리하시고 싶다면 아래 범위를 제한할 수 있으나,
    # 여기선 1번 그룹(레벨 1, 30개)만 우선 돌려보겠습니다.
    # 선생님께서 전체 5000개를 한 방에 변환하시려면 아래 '[0:1]'을 지우고 진행하시면 됩니다!
    
    # ----------------------------------------------------
    # (선택) 부분 업데이트 모드: 현재는 첫 30개 단어만 시범 구동
    start_batch = 0
    end_batch = total_batches # 전체 단어를 적용하려면 이 부분을 total_batches 로 바꾸세요!
    # ----------------------------------------------------

    for i in range(start_batch, end_batch):
        batch = all_words_ref[i*batch_size : (i+1)*batch_size]
        print(f"[{i+1}/{total_batches}] 단어 {i*batch_size+1} ~ {(i+1)*batch_size} 예문 다국어 AI 변환 중...")
        
        success = process_batch(client, batch)
        if success:
            print(f"  -> 그룹 {i+1} 변환 성공! (데이터 중간 저장 완료)")
            # 덮어쓰기 저장 (중간에 취소해도 저장되도록 실시간 세이브)
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(db, f, ensure_ascii=False, indent=2)
        else:
            print(f"  -> 그룹 {i+1} 변환 최종 실패. 데이터를 건너뜁니다.")
            
        time.sleep(1.5) # 구글 API 트래픽 제한 휴식

    print(f"\n[적용 완료] 재생성된 데이터가 저장되었습니다: {path}")
    print("앱을 다시 켜어보시고 올바르게 다양한 예문이 나오는지 확인해주세요!")
    
if __name__ == "__main__":
    main()
