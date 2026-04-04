import os
import re

def fix_admin():
    path = r'd:\antigravity\stepupvoca\app\src\AdminScreens.tsx'
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        text = f.read()

    # 1. Normalize massive gaps and double newlines
    text = re.sub(r'\n\s*\n\s*\n', '\n\n', text)
    text = re.sub(r'\n\s*\n', '\n\n', text)
    
    # 2. Fix the StatCard syntax errors (which were likely causing the 470 errors)
    text = re.sub(r'title="가입 회원수"[^>]*isUp', 'title="가입 회원수" value={users.length} change="+3" isUp', text)
    text = re.sub(r'title="보유 포인트"[^>]*isUp', 'title="보유 포인트" value={points.toLocaleString()} change="-2.4%" isUp', text)
    text = text.replace('title="매출"', 'title="총 매출"')
    text = text.replace('title="미처문의"', 'title="미처리 문의"')

    # 3. Fix missing quotes in Korean segments
    # Pattern: ?substring'
    text = text.replace("'비활??", "'비활성'")
    text = text.replace("'??'", "'정지'")
    text = text.replace("'?성'", "'활성'")
    text = text.replace("'????..'", "'저장중...'")
    text = text.replace("'?선?위 ?어????", "'우선순위 단어 등록'")
    text = text.replace("'?인?? 부족합?다.'", "'포인트가 부족합니다.'")
    
    # 4. Fix TaskItem lines
    text = re.sub(r'<TaskItem label="([^"]*)"? desc="([^"]*)"? status=', r'<TaskItem label="\1" desc="\2" status=', text)
    
    # 5. Fix the end of file jumble
    text = re.sub(r'\}\s*\)\s*\)\s*\}\s*\}\s*$', '}\n                )}\n            </div>\n        </div>\n    );\n}\n', text)

    # 6. Typos
    text = text.replace('DashboardSectiot', 'DashboardSection')
    text = text.replace('handleActiot', 'handleAction')
    
    # 7. Translations N -> t
    if "import { t } from './i18n';" not in text:
        text = text.replace("import { vocaDBJson } from './data/vocaData';", "import { vocaDBJson } from './data/vocaData';\nimport { t } from './i18n';")
    text = re.sub(r'N\(g,', 't(g,', text)
    text = re.sub(r'N\(lang,', 't(lang,', text)

    # 8. Massive Korean cleanup based on ? patterns
    fixes = {
        '?체': '전체', '가?오?': '가져옴', '?인?': '확인', '?로고침': '새로고침',
        '로드 ?패': '로드 실패', '?원 ?보': '회원 정보', '?데?트': '업데이트',
        '?규 ?원': '신규 회원', '?록': '등록', '관리자 ?널': '관리자 패널',
        '?택': '선택', '?고 ?역': '신고 내역', '기기 ?보 ?음': '기기 정보 없음',
        '?세 ?유': '상세 사유', '?용????': '사용자 정지', '?고 무시': '신고 무시',
        '?정': '설정', '??': '로드', '?계': '통계', '?드?': '피드백',
        '?고': '신고', '?세': '상세', '?유': '사유', '?용': '사용',
        '?원': '회원', '?메': '이메일', '?형': '유형', '?태': '상태',
        '?인': '확인', '관?': '관리', '?택': '선택', '?령': '수량',
        '?력': '입력', '?세': '하세요', '지?': '지급', '?명': '명',
        '?성': '활성', '?규': '신규', '?록': '등록', '?수': '필수',
        '?택': '선택', '결제 ?정': '결제 예정', '?스???태': '시스템 상태',
        '?버 ?상': '서버 정상', '?영 ?': '운영 중', '?동 최적': '자동 최적화',
        '?약': '예약', '처리?료': '처리완료', '?체 보': '전체 보기',
        '?????음': '정보 없음', '??': '전체', '공? ?록': '공지 등록',
        '?고??': '신고자', '?고???': '피신고자', '?세 ?유': '상세 사유',
        '?세 ?유 ?음': '상세 사유 없음',
    }
    for old, new in fixes.items():
        text = text.replace(old, new)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    print("AdminScreens.tsx deep cleaned and fixed.")

def fix_others():
    screens = ['ProfileScreen', 'StoreScreen', 'HomeScreen', 'StatsScreen', 'OnboardingScreen']
    for s in screens:
        path = f'd:\\antigravity\\stepupvoca\\app\\src\\screens\\{s}.tsx'
        if not os.path.exists(path): continue
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            text = f.read()
        
        # Typos & Syntax
        text = text.replace('setScreet', 'setScreen')
        text = text.replace('handleBuySkit', 'handleBuySkin')
        
        # Emojis in skins array
        skins_array = """    const skins = [
        { id: 'default', emoji: '🐣', label: 'Classic', price: 0 },
        { id: 'ninja', emoji: '🥷', label: 'Ninja', price: 1000 },
        { id: 'wizard', emoji: '🧙‍♂️', label: 'Wizard', price: 2000 },
        { id: 'king', emoji: '👑', label: 'King', price: 5000 },
        { id: 'dragon', emoji: '🐉', label: 'Dragon', price: 10000 },
        { id: 'alien', emoji: '👽', label: 'Alien', price: 15000 },
        { id: 'robot', emoji: '🤖', label: 'Robot', price: 20000 }
    ];"""
    
        text = re.sub(r'const skins = \[.*?\];', skins_array, text, flags=re.DOTALL)
        
        # Profile specific skins object
        skins_obj = """    const skins: Record<string, string> = {
        default: '🐣',
        ninja: '🥷',
        wizard: '🧙‍♂️',
        king: '👑',
        dragon: '🐉',
        alien: '👽',
        robot: '🤖'
    };"""
        text = re.sub(r'const skins: Record<string, string> = \{.*?\};', skins_obj, text, flags=re.DOTALL)

        # Fix specific missing quotes in ProfileScreen/OnboardingScreen
        text = text.replace('?작?기!', '시작하기!')
        text = text.replace('Next (Level Test)', '다음 (레벨 테스트)')
        text = text.replace('?속?기', '계속하기')
        
        # Double spacing
        text = re.sub(r'\n\s*\n\s*\n', '\n\n', text)

        with open(path, 'w', encoding='utf-8') as f:
            f.write(text)
        print(f"{s}.tsx fixed.")

fix_admin()
fix_others()
