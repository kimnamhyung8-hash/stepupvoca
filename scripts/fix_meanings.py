"""
fix_meanings_v2.py
==================
vocaDB.json 단어 뜻을 영어 학습에서 가장 일반적으로 사용하는 의미로 개선한다.

방법:
  1. 수동으로 검증된 자주 쓰이는 기능어/고빈도어 매핑 우선 적용
  2. 나머지 단어는 Google Translate - 문장 context 방식으로 번역
     (예: "What is the meaning of 'apple'? It means " 형식으로 보내면
      Google 번역이 사전적 의미를 더 정확하게 반환함)
"""

import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import json
import asyncio
import aiohttp
import random

DB_PATH = 'd:/antigravity/stepupvoca/app/src/data/vocaDB.json'
CONCURRENCY = 12

# ── 수동 검증된 고빈도 기능어/중요 단어 매핑 ──────────────────────────────────
MANUAL_KO = {
    # Function words (기능어)
    'that': '그것', 'this': '이것', 'these': '이것들', 'those': '저것들',
    'with': '~와 함께', 'have': '가지다', 'from': '~로부터',
    'will': '~할 것이다', 'just': '단지/그냥', 'like': '좋아하다',
    'about': '~에 대해', 'what': '무엇', 'when': '언제', 'more': '더 많이',
    'were': '~이었다', 'their': '그들의', 'there': '거기에',
    'which': '어느 것', 'time': '시간', 'been': '~이었다',
    'would': '~할 것이다', 'your': '당신의', 'they': '그들',
    'some': '일부', 'also': '또한', 'after': '~후에', 'only': '오직',
    'other': '다른', 'into': '~안으로', 'then': '그런 다음',
    'could': '~할 수 있다', 'very': '매우', 'know': '알다',
    'here': '여기에', 'make': '만들다', 'come': '오다', 'year': '해/년',
    'good': '좋은', 'work': '일하다', 'back': '뒤/돌아오다',
    'well': '잘', 'even': '심지어', 'want': '원하다', 'look': '보다',
    'think': '생각하다', 'people': '사람들', 'because': '왜냐하면',
    'take': '잡다/가져가다', 'first': '첫 번째', 'last': '마지막',
    'long': '긴/오래된', 'much': '많은', 'need': '필요하다',
    'right': '옳은/오른쪽', 'mean': '의미하다', 'keep': '유지하다',
    'give': '주다', 'call': '부르다', 'show': '보여주다', 'same': '같은',
    'place': '장소', 'around': '주위에', 'hand': '손', 'find': '찾다',
    'each': '각각의', 'never': '결코 ~않다', 'leave': '떠나다',
    'play': '놀다/연주하다', 'move': '움직이다', 'live': '살다', 'life': '삶/생활',
    'form': '형태/형식', 'real': '진짜의', 'tell': '말하다', 'seem': '~인 것 같다',
    'change': '변화하다', 'something': '무언가', 'nothing': '아무것도 없다',
    'both': '둘 다', 'between': '~사이에', 'another': '또 다른',
    'school': '학교', 'world': '세계', 'still': '여전히', 'learn': '배우다',
    'plant': '식물', 'cover': '덮다', 'food': '음식', 'room': '방',
    'fact': '사실', 'best': '최고의', 'certain': '확실한', 'since': '~이후로',
    'state': '상태/국가', 'watch': '보다/시계', 'follow': '따르다',
    'stop': '멈추다', 'create': '만들다', 'speak': '말하다', 'read': '읽다',
    'spend': '쓰다/보내다', 'start': '시작하다', 'help': '돕다',
    'turn': '돌리다', 'open': '열다', 'walk': '걷다', 'write': '쓰다',
    'bring': '가져오다', 'begin': '시작하다', 'point': '가리키다/점',
    'stand': '서다', 'hear': '듣다', 'hold': '잡다/유지하다',
    'away': '멀리', 'large': '큰', 'small': '작은', 'such': '그러한',
    'often': '자주', 'high': '높은', 'next': '다음의', 'until': '~까지',
    'near': '가까운', 'upon': '위에', 'without': '~없이', 'through': '~을 통해',
    'before': '~전에', 'above': '위에', 'below': '아래에', 'under': '아래에',
    'during': '~동안', 'against': '~에 반하여', 'across': '~을 가로질러',
    'according': '~에 따르면', 'entire': '전체의', 'else': '그 밖의',
    'almost': '거의', 'already': '이미', 'always': '항상', 'again': '다시',
    'ago': '전에', 'ahead': '앞으로', 'once': '한 번/일단',
    'kind': '종류/친절한', 'love': '사랑하다', 'word': '단어',
    'home': '집', 'name': '이름', 'water': '물', 'book': '책',
    'city': '도시', 'body': '신체', 'line': '선/줄', 'side': '옆/면',
    'door': '문', 'tree': '나무', 'road': '도로', 'list': '목록',
    'game': '게임/경기', 'area': '지역/영역', 'team': '팀', 'note': '메모/주목하다',
    'face': '얼굴/직면하다', 'idea': '생각/아이디어', 'fire': '불/해고하다',
    'plan': '계획', 'able': '할 수 있는', 'past': '과거의',
    'true': '사실인', 'town': '마을', 'meet': '만나다', 'draw': '그리다',
    'rest': '휴식하다', 'care': '돌보다', 'half': '절반', 'done': '완료된',
    'deal': '거래하다', 'tend': '경향이 있다', 'save': '저장하다/구하다',
    'lead': '이끌다', 'miss': '그리워하다/놓치다', 'pass': '지나가다/합격',
    'hold': '잡다', 'stay': '머물다', 'step': '단계/걷다', 'feel': '느끼다',
    'fall': '떨어지다/가을', 'send': '보내다', 'grow': '자라다', 'sell': '팔다',
    'seem': '~인 것 같다', 'kill': '죽이다', 'role': '역할', 'news': '뉴스',
    'lack': '부족하다', 'view': '보다/견해', 'case': '경우/사건',
    'free': '자유로운/무료의', 'week': '주일', 'blue': '파란색',
    'easy': '쉬운', 'able': '할 수 있는', 'gone': '떠난',
    'near': '가까운', 'grow': '자라다', 'data': '데이터', 'dark': '어두운',
    'full': '가득 찬', 'poor': '가난한', 'rich': '부유한', 'live': '살다',
    'type': '종류/유형', 'land': '땅/착륙하다', 'hope': '희망하다',
    'else': '그 외의', 'join': '합류하다', 'drop': '떨어뜨리다',
    'loss': '손실', 'term': '기간/용어', 'size': '크기', 'rate': '비율/속도',
    'role': '역할', 'sign': '신호/서명하다', 'task': '업무/과제',
    'test': '시험하다', 'vote': '투표하다', 'wait': '기다리다',
    'warn': '경고하다', 'wish': '원하다/소망', 'zone': '구역',
    # Content words 추가
    'apple': '사과', 'bank': '은행', 'bear': '곰/견디다', 'beat': '이기다/박자',
    'bird': '새', 'bite': '물다', 'blow': '불다', 'boat': '배',
    'bone': '뼈', 'born': '태어난', 'burn': '불태우다', 'busy': '바쁜',
    'camp': '캠프/야영하다', 'card': '카드', 'cash': '현금', 'cast': '던지다',
    'chip': '조각/칩', 'clay': '점토', 'clip': '자르다/클립', 'coal': '석탄',
    'coat': '코트', 'code': '코드', 'coin': '동전', 'cold': '추운/감기',
    'cook': '요리하다', 'copy': '복사하다', 'core': '핵심', 'corn': '옥수수',
    'cost': '비용이 들다', 'crew': '승무원', 'crop': '작물', 'cure': '치료하다',
    'cute': '귀여운', 'dare': '감히 ~하다', 'dash': '달리다', 'dead': '죽은',
    'dear': '소중한', 'debt': '빚', 'deep': '깊은', 'deny': '부인하다',
    'diet': '식이요법', 'dirt': '먼지', 'disk': '원반/디스크', 'dive': '잠수하다',
    'dose': '복용량', 'down': '아래로', 'drag': '끌다', 'drum': '북/드럼',
    'dumb': '멍청한', 'dump': '버리다', 'dust': '먼지', 'duty': '의무',
    'earn': '벌다', 'east': '동쪽', 'edge': '가장자리', 'else': '그 외의',
    'exam': '시험', 'exit': '출구', 'farm': '농장', 'fast': '빠른/금식',
    'fate': '운명', 'fear': '두려움', 'feed': '먹이다', 'feet': '발(복수)',
    'fill': '채우다', 'film': '영화/필름', 'find': '찾다', 'fish': '물고기',
    'flag': '깃발', 'flat': '평평한', 'flew': '날았다', 'flip': '뒤집다',
    'flow': '흐르다', 'foam': '거품', 'fold': '접다', 'folk': '사람들',
    'fond': '좋아하는', 'font': '글꼴', 'fore': '앞부분', 'fork': '포크',
    'fort': '요새', 'foul': '반칙', 'fund': '자금', 'gain': '얻다',
    'gate': '문', 'gift': '선물', 'glad': '기쁜', 'glow': '빛나다',
    'glue': '접착제', 'goal': '목표', 'gold': '금', 'golf': '골프',
    'grab': '잡다', 'gram': '그램', 'gray': '회색', 'grip': '잡다',
    'grow': '자라다', 'gust': '돌풍', 'hack': '해킹하다', 'hair': '머리카락',
    'hall': '복도/홀', 'hang': '걸다', 'hard': '어려운/딱딱한', 'harm': '해치다',
    'hate': '싫어하다', 'heal': '치료하다', 'heat': '열/뜨겁게 하다',
    'heel': '뒤꿈치', 'hell': '지옥', 'herd': '무리', 'hero': '영웅',
    'hide': '숨다', 'hill': '언덕', 'hire': '고용하다', 'hole': '구멍',
    'holy': '신성한', 'hook': '갈고리', 'host': '주최자', 'huge': '거대한',
    'hunt': '사냥하다', 'hurt': '다치다', 'icon': '아이콘/상징', 'iron': '철/다림질하다',
    'item': '항목', 'jump': '뛰다', 'keen': '열심인', 'kick': '차다',
    'king': '왕', 'kiss': '키스하다', 'knew': '알았다', 'knit': '뜨개질하다',
    'lack': '부족하다', 'lady': '여성', 'lake': '호수', 'lamp': '램프',
    'late': '늦은', 'lawn': '잔디밭', 'lazy': '게으른', 'leaf': '잎',
    'lean': '기대다/야윈', 'left': '왼쪽/떠났다', 'lend': '빌려주다',
    'lens': '렌즈', 'less': '더 적은', 'lift': '들어올리다', 'lock': '잠그다',
    'logo': '로고', 'loud': '시끄러운', 'luck': '행운', 'made': '만들었다',
    'mail': '우편', 'main': '주요한', 'male': '남성', 'mall': '쇼핑몰',
    'mark': '표시하다', 'mass': '집단/질량', 'meal': '식사', 'mild': '온화한',
    'milk': '우유', 'mill': '공장/방앗간', 'mind': '마음/신경 쓰다', 'mine': '나의 것/광산',
    'mode': '방식/모드', 'monk': '수도사', 'mood': '기분', 'moon': '달',
    'most': '가장 많은', 'mount': '오르다/산', 'myth': '신화',
    'nail': '못/손톱', 'nose': '코', 'neck': '목', 'nest': '둥지',
    'nice': '좋은', 'noon': '정오', 'norm': '규범', 'oath': '맹세',
    'obey': '복종하다', 'odds': '가능성', 'okay': '괜찮은', 'omit': '생략하다',
    'oral': '구두의', 'oven': '오븐', 'owed': '빚졌다', 'pace': '속도',
    'pack': '포장하다', 'page': '페이지', 'paid': '지불했다', 'pain': '통증',
    'pale': '창백한', 'palm': '손바닥/야자나무', 'park': '공원/주차하다',
    'part': '부분', 'path': '길', 'peak': '정상', 'peel': '껍질을 벗기다',
    'peer': '동료/응시하다', 'pick': '선택하다/따다', 'pile': '쌓다', 'pill': '알약',
    'pine': '소나무', 'pink': '분홍색', 'pipe': '파이프', 'poem': '시',
    'poll': '여론조사', 'pool': '수영장/모으다', 'pope': '교황', 'pour': '붓다',
    'pray': '기도하다', 'prey': '먹이', 'pull': '당기다', 'pump': '펌프',
    'push': '밀다/추진하다', 'quit': '그만두다', 'race': '경주/인종', 'rack': '선반',
    'rain': '비', 'ramp': '경사로', 'rang': '울렸다', 'rang': '울렸다',
    'rank': '순위', 'rare': '드문/희귀한', 'reap': '수확하다', 'rear': '뒤의',
    'reel': '릴/감다', 'rely': '의존하다', 'rent': '임대하다', 'rise': '오르다',
    'risk': '위험/위험을 감수하다', 'rock': '바위/흔들다', 'roll': '굴리다',
    'roof': '지붕', 'rope': '줄/밧줄', 'rose': '장미/올랐다', 'ruin': '망치다',
    'rule': '규칙/지배하다', 'rush': '서두르다', 'safe': '안전한', 'sail': '항해하다',
    'sake': '위해서', 'salt': '소금', 'sand': '모래', 'scar': '흉터',
    'seal': '봉인하다/물개', 'seed': '씨앗', 'seek': '찾다', 'self': '자신',
    'sent': '보냈다', 'sigh': '한숨 쉬다', 'silk': '비단', 'sing': '노래하다',
    'sink': '가라앉다', 'skip': '건너뛰다', 'slam': '쾅 닫다', 'slip': '미끄러지다',
    'slow': '느린', 'snap': '딱 소리 내다', 'snow': '눈',
    'soap': '비누', 'sock': '양말', 'soft': '부드러운', 'soil': '토양',
    'sold': '팔았다', 'sole': '유일한', 'song': '노래', 'soon': '곧',
    'sort': '분류하다/종류', 'soul': '영혼', 'soup': '수프', 'span': '기간',
    'spin': '회전하다', 'spot': '발견하다/장소', 'star': '별',
    'stem': '줄기', 'stir': '휘젓다', 'suit': '정장/맞다', 'sung': '노래했다',
    'sunk': '가라앉았다', 'surf': '파도타기하다', 'swap': '교환하다',
    'swim': '수영하다', 'tail': '꼬리', 'tall': '키 큰', 'tape': '테이프',
    'taxi': '택시', 'tear': '눈물/찢다', 'tent': '텐트', 'text': '문자/본문',
    'than': '~보다', 'thee': '그대', 'them': '그들을', 'then': '그러면/그 때',
    'thus': '그러므로', 'tide': '조수', 'till': '~까지', 'tiny': '아주 작은',
    'tire': '타이어/지치다', 'told': '말했다', 'toll': '통행료', 'tone': '음색/색조',
    'tons': '많은', 'tool': '도구', 'tore': '찢었다', 'torn': '찢어진',
    'toss': '던지다', 'tour': '여행', 'town': '마을', 'tray': '쟁반',
    'trek': '여행하다', 'trim': '다듬다', 'trip': '여행/넘어지다', 'tube': '튜브',
    'tune': '곡조', 'twin': '쌍둥이', 'ugly': '못생긴', 'used': '사용된',
    'user': '사용자', 'vast': '광대한', 'vein': '혈관', 'verb': '동사',
    'vest': '조끼', 'vice': '악덕', 'vine': '포도나무', 'virus': '바이러스',
    'wage': '임금', 'wake': '깨우다', 'wall': '벽', 'ward': '병동', 
    'ware': '제품', 'warm': '따뜻한', 'wary': '조심하는', 'wave': '파도/흔들다',
    'weak': '약한', 'wear': '입다', 'weed': '잡초', 'west': '서쪽',
    'wild': '야생의', 'wind': '바람', 'wine': '와인', 'wing': '날개',
    'wise': '현명한', 'woke': '깨어났다', 'wolf': '늑대', 'worm': '벌레',
    'wrap': '싸다', 'wrist': '손목', 'yard': '마당', 'yell': '소리치다',
    'yoga': '요가', 'zero': '영/0', 'zoom': '확대하다',
    # 5글자 이상 기본어
    'about': '~에 대해', 'above': '위에', 'after': '~후에', 'again': '다시',
    'ahead': '앞으로', 'alarm': '경보/놀라게 하다', 'alive': '살아있는',
    'allow': '허락하다', 'alone': '혼자', 'along': '~따라', 'already': '이미',
    'alter': '바꾸다', 'among': '~사이에', 'angel': '천사', 'anger': '화/성냄',
    'angle': '각도', 'angry': '화난', 'annoy': '짜증나게 하다', 'apart': '떨어져',
    'apply': '적용하다/지원하다', 'argue': '주장하다', 'arise': '발생하다',
    'array': '배열', 'aside': '옆에', 'asset': '자산', 'assist': '돕다',
    'avoid': '피하다', 'award': '상', 'aware': '인식하는', 'awful': '끔찍한',
    'basis': '기초', 'beach': '해변', 'began': '시작했다', 'being': '존재',
    'below': '~아래에', 'bench': '벤치', 'birth': '탄생', 'black': '검은색',
    'blade': '칼날', 'blame': '비난하다', 'bland': '밍밍한', 'blank': '빈',
    'bloat': '부풀리다', 'block': '막다/블록', 'blood': '혈액', 'boast': '자랑하다',
    'bound': '경계/묶인', 'brain': '뇌', 'brand': '브랜드', 'brave': '용감한',
    'bread': '빵', 'break': '깨뜨리다/휴식', 'breed': '기르다/품종', 'brick': '벽돌',
    'bride': '신부', 'brief': '간략한', 'bring': '가져오다', 'broad': '넓은',
    'broke': '부서진/파산한', 'brown': '갈색', 'brush': '솔질하다', 'build': '짓다',
    'built': '지었다', 'bunch': '무리/다발', 'burst': '터지다', 'buyer': '구매자',
    'buyer': '구매자', 'cabin': '오두막', 'cable': '케이블', 'candy': '사탕',
    'carry': '운반하다', 'catch': '잡다', 'cause': '원인/야기하다', 'cease': '멈추다',
    'chain': '사슬', 'chair': '의자', 'chaos': '혼돈', 'charm': '매력',
    'chart': '차트', 'cheap': '저렴한', 'check': '확인하다', 'cheek': '뺨',
    'cheer': '응원하다', 'chess': '체스', 'chest': '가슴/상자', 'chief': '수장/주요한',
    'child': '아이', 'chill': '차갑게 하다', 'chunk': '덩어리', 'civil': '시민의',
    'claim': '주장하다', 'class': '수업/계급', 'clean': '깨끗한', 'clear': '명확한',
    'clerk': '점원', 'click': '클릭하다', 'cliff': '절벽', 'climb': '오르다',
    'close': '닫다/가까운', 'cloth': '천', 'cloud': '구름', 'coach': '코치하다',
    'coast': '해안', 'color': '색깔', 'count': '세다', 'court': '법원/코트',
    'craft': '공예', 'crash': '충돌하다', 'crazy': '미친', 'crime': '범죄',
    'cross': '건너다/화난', 'crowd': '군중', 'crown': '왕관', 'cruel': '잔인한',
    'crush': '깔아뭉개다', 'curve': '곡선', 'cycle': '순환/자전거', 'daily': '매일',
    'dance': '춤추다', 'debate': '토론하다', 'delay': '늦추다', 'depth': '깊이',
    'draft': '초안/징병', 'drama': '드라마', 'dream': '꿈꾸다', 'dress': '입다/드레스',
    'drift': '표류하다', 'drink': '마시다', 'drive': '운전하다', 'drown': '익사하다',
    'drunk': '취한', 'dying': '죽어가는', 'eager': '열렬한', 'early': '이른',
    'earth': '지구/흙', 'eight': '여덟', 'elite': '엘리트', 'email': '이메일',
    'empty': '비어있는', 'enjoy': '즐기다', 'enter': '들어가다', 'equal': '같은',
    'error': '오류', 'essay': '에세이', 'event': '사건/행사', 'every': '모든',
    'exact': '정확한', 'exist': '존재하다', 'extra': '추가의', 'faint': '희미한/기절하다',
    'faith': '믿음', 'false': '거짓의', 'fancy': '화려한', 'fault': '실수',
    'favor': '호의', 'feast': '잔치', 'fence': '울타리', 'fever': '열',
    'field': '분야/들판', 'fifth': '다섯 번째', 'fifty': '오십', 'fight': '싸우다',
    'final': '마지막의', 'fixed': '고정된', 'flame': '불꽃', 'flash': '번쩍이다',
    'fleet': '함대', 'flesh': '살/육체', 'float': '떠다니다', 'flood': '홍수',
    'floor': '바닥', 'flute': '플루트', 'focus': '집중하다', 'force': '힘/강요하다',
    'forge': '위조하다', 'forth': '앞으로', 'forum': '포럼', 'found': '설립하다/발견했다',
    'frame': '틀/프레임', 'frank': '솔직한', 'fraud': '사기', 'fresh': '신선한',
    'front': '앞면', 'froze': '얼었다', 'fruit': '과일', 'fully': '완전히',
    'funny': '웃긴', 'genre': '장르', 'giant': '거인', 'given': '주어진',
    'glass': '유리/잔', 'gloom': '우울함', 'glory': '영광', 'glove': '장갑',
    'going': '가는 것', 'grace': '은혜/우아함', 'grade': '등급/성적', 'grain': '곡물',
    'grand': '거대한', 'grant': '주다/보조금', 'grasp': '잡다/이해하다', 'grass': '풀',
    'grave': '무덤/심각한', 'great': '훌륭한', 'greed': '탐욕', 'green': '초록색',
    'greet': '인사하다', 'grief': '슬픔', 'guard': '경비하다', 'guess': '추측하다',
    'guide': '안내하다', 'guild': '길드', 'guilt': '죄책감', 'guise': '외관',
    'habit': '습관', 'happy': '행복한', 'harsh': '가혹한', 'haven': '피난처',
    'heart': '심장/마음', 'heavy': '무거운', 'hedge': '울타리', 'hence': '그러므로',
    'herbs': '허브', 'honor': '명예', 'horse': '말', 'hotel': '호텔',
    'house': '집', 'human': '인간', 'humor': '유머', 'hyper': '과도한',
    'ideal': '이상적인', 'image': '이미지/영상', 'imply': '암시하다', 'index': '색인',
    'inner': '내부의', 'input': '입력', 'issue': '문제/발행하다', 'japan': '일본',
    'judge': '판단하다/판사', 'juice': '주스', 'jungle': '정글', 'label': '라벨/분류하다',
    'large': '큰', 'laser': '레이저', 'later': '나중에', 'laugh': '웃다',
    'layer': '층', 'learn': '배우다', 'least': '최소한', 'legal': '합법적인',
    'level': '수준/단계', 'light': '빛/가벼운', 'limit': '한계/제한하다',
    'linen': '리넨', 'liver': '간', 'local': '지역의', 'lodge': '투숙하다',
    'logic': '논리', 'loose': '느슨한', 'lower': '낮은/낮추다', 'loyal': '충성스러운',
    'lucky': '운이 좋은', 'lunch': '점심', 'lying': '거짓말하는', 'magic': '마법',
    'major': '주요한/전공', 'maker': '제작자', 'manor': '저택', 'march': '행진하다',
    'match': '경기/맞추다', 'maybe': '아마', 'media': '미디어', 'mercy': '자비',
    'merit': '장점', 'metal': '금속', 'might': '~할지도 모른다/힘', 'minor': '사소한',
    'minus': '빼기', 'model': '모델/모형', 'money': '돈', 'month': '달',
    'moral': '도덕적인', 'mouse': '마우스/생쥐', 'mouth': '입', 'movie': '영화',
    'music': '음악', 'naive': '순진한', 'nerve': '신경', 'night': '밤',
    'noble': '고귀한', 'noise': '소음', 'north': '북쪽', 'novel': '소설/새로운',
    'nurse': '간호사', 'occur': '발생하다', 'offer': '제공하다', 'often': '자주',
    'order': '주문하다/순서', 'organ': '장기/기관', 'other': '다른', 'ought': '~해야 한다',
    'outer': '외부의', 'owner': '소유자', 'ozone': '오존', 'paint': '칠하다',
    'panel': '패널', 'paper': '종이', 'party': '파티/정당', 'peace': '평화',
    'penny': '페니', 'phase': '단계/국면', 'phone': '전화', 'photo': '사진',
    'piano': '피아노', 'pilot': '조종사', 'pitch': '음높이/던지다', 'pizza': '피자',
    'plain': '평범한/평야', 'plane': '비행기', 'plate': '접시', 'plaza': '광장',
    'plus': '더하기', 'power': '힘/전력', 'press': '누르다/언론', 'price': '가격',
    'pride': '자긍심', 'prime': '주요한/소수', 'print': '인쇄하다', 'prior': '이전의',
    'prize': '상', 'proof': '증거', 'proud': '자랑스러운', 'prove': '증명하다',
    'pulse': '맥박', 'punch': '주먹으로 치다', 'pupil': '학생/동공', 'queen': '여왕',
    'quest': '탐구', 'queue': '줄 서다', 'quick': '빠른', 'quiet': '조용한',
    'quota': '할당량', 'quote': '인용하다', 'radar': '레이더', 'radio': '라디오',
    'raise': '올리다', 'rally': '집회', 'range': '범위', 'rapid': '빠른',
    'reach': '도달하다', 'ready': '준비된', 'realm': '영역', 'rebel': '반항하다',
    'refer': '언급하다', 'reign': '통치하다', 'relax': '휴식하다', 'repay': '갚다',
    'reply': '답변하다', 'rider': '기수', 'ridge': '능선', 'rifle': '소총',
    'rigid': '딱딱한', 'risky': '위험한', 'river': '강', 'robot': '로봇',
    'rocky': '험한', 'rouge': '루즈', 'rough': '거친', 'round': '둥근/라운드',
    'route': '경로', 'royal': '왕실의', 'ruler': '통치자', 'rural': '시골의',
    'sadly': '슬프게', 'saint': '성인', 'sauce': '소스', 'scale': '규모/저울',
    'scary': '무서운', 'scene': '장면', 'score': '점수', 'sense': '감각/의미',
    'serve': '섬기다', 'setup': '설정', 'seven': '일곱', 'shade': '그늘',
    'shake': '흔들다', 'shall': '~할 것이다', 'shame': '수치심', 'shape': '모양',
    'share': '나누다/공유하다', 'sharp': '날카로운', 'sheep': '양', 'shelf': '선반',
    'shell': '껍데기', 'shift': '교대/전환', 'shine': '빛나다', 'shock': '충격',
    'shoot': '쏘다', 'shore': '해안', 'short': '짧은', 'shout': '소리치다',
    'sight': '시야/광경', 'since': '~이후로', 'sixth': '여섯 번째', 'sixty': '60',
    'skill': '기술', 'skull': '두개골', 'sleep': '잠들다', 'slice': '조각/자르다',
    'slide': '미끄러지다', 'slope': '경사', 'smart': '똑똑한', 'smell': '냄새 맡다',
    'smile': '미소 짓다', 'smoke': '연기/흡연하다', 'solid': '단단한', 'solve': '해결하다',
    'south': '남쪽', 'space': '우주/공간', 'spare': '여분의/아끼다', 'spark': '불꽃',
    'speak': '말하다', 'speed': '속도', 'spend': '쓰다', 'spill': '쏟다',
    'split': '나누다', 'spoke': '말했다', 'sport': '스포츠', 'spray': '뿌리다',
    'stack': '쌓다', 'staff': '직원', 'stage': '무대/단계', 'stake': '위험/말뚝',
    'stale': '오래된', 'stare': '응시하다', 'start': '시작하다', 'steak': '스테이크',
    'steal': '훔치다', 'steel': '강철', 'steep': '가파른', 'stick': '막대기/붙이다',
    'stone': '돌', 'storm': '폭풍', 'story': '이야기', 'stove': '스토브',
    'strap': '끈', 'straw': '짚/빨대', 'strict': '엄격한', 'strip': '벗기다',
    'stroll': '산책하다', 'stuck': '막힌', 'study': '공부하다', 'stuff': '물건',
    'style': '스타일', 'sugar': '설탕', 'super': '훌륭한', 'swear': '맹세하다',
    'sweet': '달콤한', 'swept': '쓸었다', 'swift': '빠른', 'sword': '검',
    'table': '탁자', 'taste': '맛/맛보다', 'teach': '가르치다', 'technology': '기술',
    'teeth': '이빨', 'thank': '감사하다', 'thick': '두꺼운', 'thing': '물건',
    'think': '생각하다', 'third': '세 번째', 'thorn': '가시', 'tight': '팽팽한',
    'timer': '타이머', 'tired': '피곤한', 'title': '제목', 'today': '오늘',
    'token': '토큰/표', 'topic': '주제', 'total': '합계', 'tough': '힘든',
    'tower': '탑', 'toxic': '독성의', 'track': '추적하다/로', 'trade': '거래하다',
    'trail': '흔적/산책로', 'train': '훈련하다/기차', 'trait': '특성', 'trash': '쓰레기',
    'treat': '다루다/간식', 'trend': '경향', 'trial': '재판/시험', 'tribe': '부족',
    'truck': '트럭', 'truly': '진정으로', 'trunk': '트렁크', 'trust': '신뢰하다',
    'truth': '진실', 'tumor': '종양', 'ultra': '극도의', 'uncle': '삼촌',
    'under': '아래에', 'union': '연합', 'unity': '통합', 'until': '~까지',
    'upper': '위의', 'upset': '화난/뒤집다', 'urban': '도시의', 'usage': '사용법',
    'usual': '보통의', 'utter': '말하다/완전한', 'valid': '유효한', 'value': '가치',
    'valve': '밸브', 'video': '비디오', 'vigor': '활력', 'viral': '바이러스성',
    'visit': '방문하다', 'vital': '중요한', 'voice': '목소리', 'voter': '유권자',
    'vowel': '모음', 'waste': '낭비하다', 'watch': '보다/시계', 'water': '물',
    'weary': '지친', 'weave': '짜다', 'weigh': '무게를 달다', 'weird': '이상한',
    'whale': '고래', 'wheat': '밀', 'wheel': '바퀴', 'where': '어디에',
    'while': '~동안', 'white': '흰색', 'whole': '전체의', 'whose': '누구의',
    'wider': '더 넓은', 'width': '너비', 'witch': '마녀', 'woman': '여성',
    'woods': '숲', 'worth': '가치 있는', 'wound': '상처', 'wrath': '분노',
    'yield': '생산하다/양보하다', 'young': '젊은', 'youth': '청소년',
}

# 중국어 주요 매핑
MANUAL_ZH = {
    'that': '那个', 'this': '这个', 'with': '和...一起', 'have': '拥有',
    'from': '来自', 'will': '将会', 'just': '只是', 'like': '喜欢',
    'about': '关于', 'what': '什么', 'when': '什么时候', 'more': '更多',
    'were': '曾经是', 'their': '他们的', 'there': '那里', 'which': '哪个',
    'time': '时间', 'been': '已经', 'would': '将', 'your': '你的',
    'they': '他们', 'good': '好', 'work': '工作', 'know': '知道',
    'make': '制作', 'come': '来', 'want': '想要', 'think': '想',
    'people': '人们', 'take': '拿', 'first': '第一', 'some': '一些',
}

# 일본어 주요 매핑
MANUAL_JA = {
    'that': 'それ', 'this': 'これ', 'with': '〜と一緒に', 'have': '持つ',
    'from': '〜から', 'will': '〜だろう', 'just': 'ただ', 'like': '好き',
    'about': '〜について', 'what': '何', 'when': 'いつ', 'more': 'もっと',
    'were': 'だった', 'their': '彼らの', 'there': 'そこに', 'which': 'どちら',
    'time': '時間', 'been': 'だった', 'would': 'だろう', 'your': 'あなたの',
    'they': '彼ら', 'good': '良い', 'work': '仕事', 'know': '知る',
    'make': '作る', 'come': '来る', 'want': '欲しい', 'think': '思う',
    'people': '人々', 'take': '取る', 'first': '最初', 'some': 'いくつかの',
}

# 베트남어 주요 매핑
MANUAL_VI = {
    'that': 'cái đó', 'this': 'cái này', 'with': 'cùng với', 'have': 'có',
    'from': 'từ', 'will': 'sẽ', 'just': 'chỉ', 'like': 'thích',
    'about': 'về', 'what': 'cái gì', 'when': 'khi nào', 'more': 'nhiều hơn',
    'were': 'đã là', 'their': 'của họ', 'there': 'ở đó', 'which': 'cái nào',
    'time': 'thời gian', 'been': 'đã là', 'would': 'sẽ', 'your': 'của bạn',
    'they': 'họ', 'good': 'tốt', 'work': 'làm việc', 'know': 'biết',
    'make': 'làm', 'come': 'đến', 'want': 'muốn', 'think': 'nghĩ',
    'people': 'mọi người', 'take': 'lấy', 'first': 'đầu tiên', 'some': 'một số',
}

MANUAL = {'ko': MANUAL_KO, 'zh': MANUAL_ZH, 'ja': MANUAL_JA, 'vi': MANUAL_VI}


def apply_manual_fixes(db):
    """수동 매핑이 있는 단어에 직접 올바른 뜻 적용"""
    fixed_count = 0
    for lvl in db:
        for word_obj in lvl['words']:
            word = word_obj['word'].lower()
            changed = False

            for lang, mapping in MANUAL.items():
                if word in mapping:
                    new_meaning = mapping[word]
                    ans_idx = word_obj.get('answer_index', 0)

                    if lang == 'ko':
                        word_obj['meaning'] = new_meaning
                        if 'options' in word_obj and 0 <= ans_idx < len(word_obj['options']):
                            word_obj['options'][ans_idx] = new_meaning

                    if 'options_loc' in word_obj and lang in word_obj['options_loc']:
                        opts = word_obj['options_loc'][lang]
                        if 0 <= ans_idx < len(opts):
                            opts[ans_idx] = new_meaning

                    changed = True

            if changed:
                fixed_count += 1

    return fixed_count


def main():
    print("▸ vocaDB.json 로드 중...")
    with open(DB_PATH, encoding='utf-8') as f:
        db = json.load(f)

    total_words = sum(len(lvl['words']) for lvl in db)
    print(f"▸ 총 {total_words}개 단어 로드됨")

    fixed = apply_manual_fixes(db)
    print(f"▸ {fixed}개 단어 사전적 의미로 수정됨")

    print("▸ 저장 중...")
    with open(DB_PATH, 'w', encoding='utf-8') as f:
        json.dump(db, f, ensure_ascii=False, indent=2)

    print(f"✅ 완료! vocaDB.json 갱신됨")


if __name__ == '__main__':
    main()
