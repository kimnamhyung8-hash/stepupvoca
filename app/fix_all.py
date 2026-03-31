import os
import re

def fix_admin():
    path = r'd:\antigravity\stepupvoca\app\src\AdminScreens.tsx.stripped'
    output = r'd:\antigravity\stepupvoca\app\src\AdminScreens.tsx'

    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        text = f.read()

    # Restoration of intentionally broken lines during stripping or previous corruptions
    text = text.replace(
        'title="가입 회원수"+3" isUp={true}',
        'title="가입 회원수" value={users.length} change="+3" isUp={true}'
    )
    text = text.replace(
        'title="보유 포인트"-2.4%" isUp={false}',
        'title="보유 포인트" value={points.toLocaleString()} change="-2.4%" isUp={false}'
    )

    # Dictionary of corrupted Korean strings
    # Mapping broken fragments to correct Korean words
    kor_fixes = {
        '?체': '전체',
        '가?오?': '가져옴',
        '?이': '차이',
        '?함': '포함',
        '?인?': '확인',
        '?로고침': '새로고침',
        '로드 ?패': '로드 실패',
        '?원 ?보': '회원 정보',
        '?데?트': '업데이트',
        '?규 ?원': '신규 회원',
        '?록': '등록',
        '관리자 ?널': '관리자 패널',
        '?택': '선택',
        '?고 ?역': '신고 내역',
        '기기 ?보 ?음': '기기 정보 없음',
        '?세 ?유': '상세 사유',
        '?용????': '사용자 정지',
        '?고 무시': '신고 무시',
        '?한': '권한',
        '?인': '확인',
        '??': '나가기',
        '?': '로드',
        '?계': '통계',
        '?드?': '피드백',
        '?고': '신고',
        '?세': '상세',
        '?유': '사유',
        '?용': '사용',
        '?원': '회원',
        '?메': '이메일',
        '?형': '유형',
        '?태': '상태',
        '?인': '확인',
        '관?': '관리',
        '?택': '선택',
        '?령': '수량',
        '?력': '입력',
        '?세': '하세요',
        '지?': '지급',
        '??': '정지',
        '?명': '명',
        '?성': '활성',
        '??': '해제',
        '?규': '신규',
        '?록': '등록',
        '?수': '필수',
        '?택': '선택',
        '결제 ?정': '결제 예정',
        '?스???태': '시스템 상태',
        '?버 ?상': '서버 정상',
        '?영 ?': '운영 중',
        '?동 최적': '자동 최적화',
        '?약': '예약',
        '처리?료': '처리완료',
        '?체 보': '전체 보기',
        '관?': '관리',
        '?????음': '정보 없음',
        '??': '전체',
        '?': '명',
    }

    for old, new in kor_fixes.items():
        text = text.replace(old, new)

    # Some manual fixes for logic or missed translations
    text = text.replace('handleActiot', 'handleAction')
    text = text.replace('.assigt', '.assign')
    text = text.replace('.jsot', '.json')
    text = text.replace('console.wart', 'console.warn')
    text = text.replace('joit', 'join')
    
    # Fix the tabs array manually if needed (it looked okay in stripped)
    
    with open(output, 'w', encoding='utf-8') as f:
        f.write(text)
    print("Fixed AdminScreens.tsx")

def fix_store():
    path = r'd:\antigravity\stepupvoca\app\src\screens\StoreScreen.tsx'
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        text = f.read()
    
    # Typos
    text = text.replace('setScreet', 'setScreen')
    text = text.replace('handleBuySkit', 'handleBuySkin')
    
    # Emojis and corrupted strings
    text = text.replace("emoji: '?'", "emoji: '🐣'")
    text = text.replace("emoji: '?'", "emoji: '🥷'") # Note: duplication, will fix by ID
    
    # Better to replace the whole array
    skins_block = """    const skins = [
        { id: 'default', emoji: '🐣', label: 'Classic', price: 0 },
        { id: 'ninja', emoji: '🥷', label: 'Ninja', price: 1000 },
        { id: 'wizard', emoji: '🧙‍♂️', label: 'Wizard', price: 2000 },
        { id: 'king', emoji: '👑', label: 'King', price: 5000 },
        { id: 'dragon', emoji: '🐉', label: 'Dragon', price: 10000 },
        { id: 'alien', emoji: '👽', label: 'Alien', price: 15000 },
        { id: 'robot', emoji: '🤖', label: 'Robot', price: 20000 }
    ];"""
    
    text = re.sub(r'const skins = \[.*?\];', skins_block, text, flags=re.DOTALL)
    
    # Korean strings
    text = text.replace('?인?? 부족합?다.', '포인트가 부족합니다.')
    text = text.replace('구매?시겠습?까?', '구매하시겠습니까?')
    text = text.replace('?킨??', '스킨을')
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    print("Fixed StoreScreen.tsx")

fix_admin()
fix_store()
