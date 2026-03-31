
import os
import re

def fix_i18n():
    for f_name in ['ko.ts', 'en.ts']:
        path = f'd:\\antigravity\\stepupvoca\\app\\src\\i18n\\{f_name}'
        if not os.path.exists(path): continue
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Add missing keys if they don't exist
        if 'mastery_title' not in content:
            val = '마스터리' if f_name == 'ko.ts' else 'Mastery'
            content = content.replace('mastery:', f'mastery_title: "{val}",\n  mastery:')
        
        if 'study_mode' not in content:
            val = '학습 모드' if f_name == 'ko.ts' else 'Study Mode'
            content = content.replace('study_tab:', f'study_mode: "{val}",\n  study_tab:')
        
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {f_name}")

def fix_app_state():
    path = r'd:\antigravity\stepupvoca\app\src\App.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix NaN in state initialization
    content = content.replace(
        "const [userPoints, setUserPoints] = useState(() => { const saved = localStorage.getItem('vq_points'); return saved ? parseInt(saved) : 1250; });",
        "const [userPoints, setUserPoints] = useState(() => { const saved = localStorage.getItem('vq_points'); const val = saved ? parseInt(saved) : 1250; return isNaN(val) ? 1250 : val; });"
    )
    content = content.replace(
        "const [currentLevel, setCurrentLevel] = useState(() => { const saved = localStorage.getItem('vq_level'); return saved ? parseInt(saved) : 1; });",
        "const [currentLevel, setCurrentLevel] = useState(() => { const saved = localStorage.getItem('vq_level'); const val = saved ? parseInt(saved) : 1; return isNaN(val) ? 1 : val; });"
    )
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed App.tsx state")

def fix_admin():
    path = r'd:\antigravity\stepupvoca\app\src\AdminScreens.tsx'
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        text = f.read()

    # Normalize gaps
    text = re.sub(r'\n\s*\n\s*\n', '\n\n', text)
    
    # Fix StatCard syntax
    text = re.sub(r'title="가입 회원수"[^>]*isUp', 'title="가입 회원수" value={users.length} change="+3" isUp', text)
    text = re.sub(r'title="보유 포인트"[^>]*isUp', 'title="보유 포인트" value={points.toLocaleString()} change="-2.4%" isUp', text)
    text = text.replace('title="매출"', 'title="총 매출"')
    text = text.replace('title="미처문의"', 'title="미처리 문의"')

    # Fix Korean fragments
    fixes = {
        '?체': '전체', '가?오?': '가져옴', '?인?': '확인', '?로고침': '새로고침',
        '로드 ?패': '로드 실패', '?원 ?보': '회원 정보', '?데?트': '업데이트',
        '?규 ?원': '신규 회원', '?록': '등록', '관리자 ?널': '관리자 패널',
        '?택': '선택', '기기 ?보 ?음': '기기 정보 없음', '?????음': '정보 없음',
        '?성': '활성', '계정 ??': '계정 정지', '??': '로드', '관?': '관리'
    }
    for old, new in fixes.items():
        text = text.replace(old, new)

    # Fix systematic typos again (just in case)
    text = text.replace('Sectiot', 'Section')
    text = text.replace('Screet', 'Screen')
    text = text.replace('collectiot', 'collection')
    text = text.replace('handleActiot', 'handleAction')
    text = text.replace('DashboardSectiot', 'DashboardSection')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    print("AdminScreens.tsx deep cleaned.")

def fix_others():
    screens = ['ProfileScreen', 'StoreScreen', 'HomeScreen', 'StatsScreen', 'OnboardingScreen']
    for s in screens:
        path = f'd:\\antigravity\\stepupvoca\\app\\src\\screens\\{s}.tsx'
        if not os.path.exists(path): continue
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            text = f.read()
        
        # Typos
        text = text.replace('setScreet', 'setScreen')
        text = text.replace('handleBuySkit', 'handleBuySkin')
        
        # Skin emojis
        skins_array = """    const skins: Record<string, string> = {
        default: '🐣',
        ninja: '🥷',
        wizard: '🧙‍♂️',
        king: '👑',
        dragon: '🐉',
        alien: '👽',
        robot: '🤖'
    };"""
        text = re.sub(r'const skins: Record<string, string> = \{.*?\};', skins_array, text, flags=re.DOTALL)

        with open(path, 'w', encoding='utf-8') as f:
            f.write(text)
        print(f"{s}.tsx fixed.")

fix_i18n()
fix_app_state()
fix_admin()
fix_others()
print("Final polish complete.")
