import os
import re

def clean_file(path, kor_fixes={}):
    print(f"Cleaning {path}...")
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        text = f.read()

    # Normalize newlines
    text = text.replace('\r\r\n', '\n')
    text = text.replace('\r\n', '\n')
    text = text.replace('\r', '\n')
    
    # Remove massive whitespace gaps
    text = re.sub(r'[ \t]{10,}', ' ', text)

    # Apply Korean fixes
    for old, new in kor_fixes.items():
        text = text.replace(old, new)
    
    # Fix emojis and array in Store/Profile/Stats
    skins_block = """    const skins = {
        default: '🐣',
        ninja: '🥷',
        wizard: '🧙‍♂️',
        king: '👑',
        dragon: '🐉',
        alien: '👽',
        robot: '🤖'
    };"""
    
    # Profile specific skins object
    text = re.sub(r'const skins: Record<string, string> = \{.*?\};', f'const skins: Record<string, string> = {skins_block[17:-1]};', text, flags=re.DOTALL)
    
    # Store specific skins array
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

    # Fix typos
    text = text.replace('handleActiot', 'handleAction')
    text = text.replace('handleBuySkit', 'handleBuySkin')
    text = text.replace('setScreet', 'setScreen')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)

# Common Korean fixes
admin_kor_fixes = {
    '?체': '전체', '가?오?': '가져옴', '?이': '차이', '?함': '포함', '?인?': '확인',
    '?로고침': '새로고침', '로드 ?패': '로드 실패', '?원 ?보': '회원 정보',
    '?데?트': '업데이트', '?규 ?원': '신규 회원', '?록': '등록',
    '관리자 ?널': '관리자 패널', '?택': '선택', '?고 ?역': '신고 내역',
    '기기 ?보 ?음': '기기 정보 없음', '?세 ?유': '상세 사유',
    '?용????': '사용자 정지', '?고 무시': '신고 무시',
    '?통 ?인??': '보유 포인트', '?매출': '총 매출', '미처?문의': '미처리 문의'
}

clean_file(r'd:\antigravity\stepupvoca\app\src\AdminScreens.tsx', admin_kor_fixes)
clean_file(r'd:\antigravity\stepupvoca\app\src\screens\ProfileScreen.tsx')
clean_file(r'd:\antigravity\stepupvoca\app\src\screens\StoreScreen.tsx')
clean_file(r'd:\antigravity\stepupvoca\app\src\screens\HomeScreen.tsx')
clean_file(r'd:\antigravity\stepupvoca\app\src\screens\StatsScreen.tsx')
clean_file(r'd:\antigravity\stepupvoca\app\src\screens\OnboardingScreen.tsx')

print("All screens cleaned.")
