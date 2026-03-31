import os
import json
import time

# pip install google-genai
from google import genai
from google.genai import types

# -------------------------------------------------------------
# [VocaQuest] 단어 DB 자동 생성 AI 파이프라인 스크립트
# -------------------------------------------------------------
# 목표: 1레벨(기초)부터 99레벨(고급)까지 단어 쌍을 생성
# 필수 환경 변수: GEMINI_API_KEY (구글 API 키 필요)
# -------------------------------------------------------------

def generate_voca_batch(client, level: int, word_count: int = 10) -> list:
    """특정 레벨의 단어 데이터를 AI로 생성"""
    
    # 레벨별 프롬프트 가이드 (CEFR 체계 및 교육 과정 기준)
    level_guides = {
        1: "초등 저학년 파닉스, 극초급 (Apple, Book 등)",
        30: "수능 필수 어휘 (Environment, Provide 등)",
        50: "토플/토익 중상급 (Ubiquitous, Mitigate 등)",
        99: "최고급, 영어 문학/논문 수준 (Ephemeral, Obfuscate 등)"
    }
    
    # 가장 가까운 가이드 수준 선택
    guide = next((v for k, v in sorted(level_guides.items(), reverse=True) if level >= k), "기본 어휘")
    
    prompt = f"""
    당신은 VocaQuest 앱의 전문적인 영단어 커리큘럼 설계자입니다.
    난이도 [레벨 {level} / 99]에 해당하는 영단어 {word_count}개를 생성해주세요.
    수준 기준: {guide}
    
    [가장 중요한 필수 조건]
    모든 단어의 'example_en'과 'example_ko'는 절대로 동일한 패턴("The word 'X' is used...")를 반복해서는 안 됩니다.
    반드시 해당 단어가 문맥 속에 자연스럽게 쓰이는 **완전히 새롭고 다양한 실생활 예문**을 각각 작성하세요.
    (예: Book -> "I am reading an interesting book.", Apple -> "She ate a red apple for breakfast.")
    
    엄격하게 다음 JSON 배열(Array) 형식만 응답해야 합니다. 기호 없이 순수 JSON만 반환하세요.
    [
      {{
        "word": "단어",
        "meaning": "한국어 뜻",
        "example_en": "해당 단어가 사용된 아주 자연스러운 영어 예문",
        "example_ko": "해당 예문의 한국어 해석",
        "options": ["정답뜻", "매력적인오답1", "매력적인오답2", "매력적인오답3"]
      }}
    ]
    """

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        
        # JSON 형식 정제 (백틱 마크다운 제거)
        result_text = response.text.replace('```json', '').replace('```', '').strip()
        data = json.loads(result_text)
        
        # 검증 통과한 단어만 ID 부여
        final_batch = []
        for index, item in enumerate(data):
            if len(item.get('options', [])) == 4:
                # 정답 인덱스 찾기
                try:
                    answer_idx = item['options'].index(item['meaning'])
                except ValueError:
                    answer_idx = 0 # 예외처리
                
                final_batch.append({
                    "id": f"w_{level}_{index+1}",
                    "word": item['word'],
                    "meaning": item['meaning'],
                    "example_en": item['example_en'],
                    "example_ko": item['example_ko'],
                    "options": item['options'],
                    "answer_index": answer_idx
                })
        return final_batch
        
    except Exception as e:
        print(f"[Error] 오류 발생 (Level {level}): {e}")
        return []


def main():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("[ERROR] GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.")
        print("[GUIDE] 발급 받은 구글 API 키를 'set GEMINI_API_KEY=당신의_키' 명령어로 설정하고 실행해주세요.")
        return

    client = genai.Client()
    
    # ---------------------------------------------------------
    # 우선 1레벨, 5레벨, 10레벨의 단어 5개씩만 시범 생성
    # ---------------------------------------------------------
    target_levels = [1, 5, 10]
    words_per_level = 5
    
    database = []
    
    print("[START] [VocaQuest] AI 단어 DB 생성 파이프라인 가동 준비 완료...")
    
    for level in target_levels:
        print(f"[WAIT] Level {level} 데이터 생성 중 ({words_per_level}개)...")
        words = generate_voca_batch(client, level, words_per_level)
        
        if words:
            database.append({
                "level": level,
                "description": f"자동 생성된 레벨 {level} 어휘",
                "words": words
            })
            print(f"[SUCCESS] Level {level} 생성 완료!")
        else:
            print(f"[FAIL] Level {level} 생성 실패.")
            
        time.sleep(2) # 무료 API 한도 초과(Rate Limit) 방지

    # 결과 저장
    output_path = r"d:\antigravity\stepupvoca\data\voca_db_production.json"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(database, f, ensure_ascii=False, indent=2)
        
    print(f"[DONE] 성공적으로 데이터베이스를 저장했습니다! 위치: {output_path}")


if __name__ == "__main__":
    main()
