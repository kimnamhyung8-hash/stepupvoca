
import os
import re

def fix_file(path, replacements):
    if not os.path.exists(path):
        print(f"File not found: {path}")
        return
    
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    for old, new in replacements.items():
        content = content.replace(old, new)
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Fixed: {path}")

# --- StoreScreen.tsx Fixes ---
store_path = r'd:\antigravity\stepupvoca\app\src\screens\StoreScreen.tsx'
store_reps = {
    # Fix the skins array
    "emoji: '?',": "emoji: '🐣',",
    "emoji: '??♂?,": "emoji: '🧙‍♂️',",
    "emoji: '??,": "emoji: '🧙‍♂️',", # fallback
}
# Actually let's just replace the whole array block to be safe
with open(store_path, 'r', encoding='utf-8', errors='ignore') as f:
    store_content = f.read()

skins_block_old = re.search(r'const skins = \[.*?\];', store_content, re.DOTALL)
if skins_block_old:
    skins_block_new = """const skins = [
        { id: 'default', emoji: '🐣', label: 'Classic', price: 0 },
        { id: 'ninja', emoji: '🥷', label: 'Ninja', price: 1000 },
        { id: 'wizard', emoji: '🧙‍♂️', label: 'Wizard', price: 2000 },
        { id: 'king', emoji: '👑', label: 'King', price: 5000 },
        { id: 'dragon', emoji: '🐉', label: 'Dragon', price: 10000 },
        { id: 'alien', emoji: '👽', label: 'Alien', price: 15000 },
        { id: 'robot', emoji: '🤖', label: 'Robot', price: 20000 }
    ];"""
    store_content = store_content[:skins_block_old.start()] + skins_block_new + store_content[skins_block_old.end():]

# Fix Korean fragments in StoreScreen
store_content = store_content.replace('?인?? 부족합?다.', '포인트가 부족합니다.')
store_content = store_content.replace('?킨??구매?시겠습?까?', '스킨을 구매하시겠습니까?')

with open(store_path, 'w', encoding='utf-8') as f:
    f.write(store_content)


# --- ProfileScreen.tsx Fixes ---
profile_path = r'd:\antigravity\stepupvoca\app\src\screens\ProfileScreen.tsx'
with open(profile_path, 'r', encoding='utf-8', errors='ignore') as f:
    profile_content = f.read()

profile_skins_old = re.search(r'const skins: Record<string, string> = \{.*?\};', profile_content, re.DOTALL)
if profile_skins_old:
    profile_skins_new = """const skins: Record<string, string> = {
        default: '🐣',
        ninja: '🥷',
        wizard: '🧙‍♂️',
        king: '👑',
        dragon: '🐉',
        alien: '👽',
        robot: '🤖'
    };"""
    profile_content = profile_content[:profile_skins_old.start()] + profile_skins_new + profile_content[profile_skins_old.end():]

with open(profile_path, 'w', encoding='utf-8') as f:
    f.write(profile_content)


# --- AdminScreens.tsx Large Cleanup ---
admin_path = r'd:\antigravity\stepupvoca\app\src\AdminScreens.tsx'
with open(admin_path, 'r', encoding='utf-8', errors='ignore') as f:
    admin_content = f.read()

# Fix common corrupted markers
admin_content = admin_content.replace('?체', '전체')
admin_content = admin_content.replace('가?오?', '가져옴')
admin_content = admin_content.replace('로드?함', '포함')
admin_content = admin_content.replace('?덱포함', '인덱스 ')
admin_content = admin_content.replace('로드포함음', '정보 없음')
admin_content = admin_content.replace('?드백', '피드백')
admin_content = admin_content.replace('?고 ?역', '신고 내역')
admin_content = admin_content.replace('?이로드로드 ?패', '데이터 로드 실패')
admin_content = admin_content.replace('?원 ?이?? 불러?는로드?패?습?다.', '회원 데이터를 불러오는데 실패했습니다.')
admin_content = admin_content.replace('?인?주?요.', '확인해주세요.')
admin_content = admin_content.replace('?원 ?보가 ?데?트?었?니로드', '회원 정보가 업데이트되었습니다.')
admin_content = admin_content.replace('?원 ?보 ?데?트로드?패?습?다.', '회원 정보 업데이트에 실패했습니다.')
admin_content = admin_content.replace('?규 ?원로드?록?었?니로드', '신규 회원이 등록되었습니다.')
admin_content = admin_content.replace('?규 ?원 ?록로드?패?습?다.', '신규 회원 등록에 실패했습니다.')
admin_content = admin_content.replace('??보로드', '대시보드')
admin_content = admin_content.replace('마켓?로드터', '마케팅 센터')
admin_content = admin_content.replace('?스로드', '시스템')
admin_content = admin_content.replace('관리자 ?널', '관리자 패널')
admin_content = admin_content.replace('???', '나가기')
admin_content = admin_content.replace('로드원로드', '총 회원수')
admin_content = admin_content.replace('?네로드 ?메?로 검로드', '닉네임 또는 이메일로 검색')
admin_content = admin_content.replace('?택로드', '선택한 ')
admin_content = admin_content.replace('?로드시겠습?까?', '하시겠습니까?')
admin_content = admin_content.replace('지급할 ?인로드?량로드?력?세로드', '지급할 포인트 수량을 입력하세요')
admin_content = admin_content.replace('?인로드지?', '포인트 지급')
admin_content = admin_content.replace('?메로드', '이메일')
admin_content = admin_content.replace('비활로드', '비활성')
admin_content = admin_content.replace('?인로드&', '포인트 &')
admin_content = admin_content.replace('?재 ?벨', '현재 레벨')
admin_content = admin_content.replace('?리미엄', '프리미엄')
admin_content = admin_content.replace('변경사로드?로드', '변경사항 저장')
admin_content = admin_content.replace('?동?로 ?원로드?록?니로드', '관리자가 회원을 등록합니다')
admin_content = admin_content.replace('?네로드?력', '닉네임 입력')
admin_content = admin_content.replace('?력?세로드', '입력하세요')
admin_content = admin_content.replace('처리?료 ?체 보?', '처리완료 전체 보기')
admin_content = admin_content.replace('?태가 ?데?트?었?니로드', '상태가 업데이트되었습니다.')
admin_content = admin_content.replace('?태 ?데?트로드?패?습?다.', '상태 업데이트에 실패했습니다.')
admin_content = admin_content.replace('?인 ?요 ', '확인 필요 ')
admin_content = admin_content.replace('?로드셋', '리셋')
admin_content = admin_content.replace('?로드', '문의')
admin_content = admin_content.replace('?스로드?태', '시스템 상태')
admin_content = admin_content.replace('최적로드?약로드', '최적화 예약')
admin_content = admin_content.replace('?로고침', '새로고침')
admin_content = admin_content.replace('가로드?원로드', '가입 회원수')
admin_content = admin_content.replace('?통 ?인로드', '유통 포인트')
admin_content = admin_content.replace('?계', '통계')
admin_content = admin_content.replace('2로드20로드', '2월 20일')
admin_content = admin_content.replace('3로드1로드', '3월 1일')
admin_content = admin_content.replace('로드', '내역')
admin_content = admin_content.replace('로드셋', '리셋')
admin_content = admin_content.replace('?인 ???', '확인 내역')
admin_content = admin_content.replace('로드createdAt', 'createdAt')
admin_content = admin_content.replace('컬렉션로드', '컬렉션 ')
admin_content = admin_content.replace('?이 로드', '데이터 ')

# Missing quotes fix in AdminScreens
admin_content = admin_content.replace("status: 'banned'", "status: 'banned'") # ensure simple
admin_content = admin_content.replace("'비활성'", "'비활성'") # double check

with open(admin_path, 'w', encoding='utf-8') as f:
    f.write(admin_content)

print("Emergency fixes for Store, Profile, and Admin screens completed.")
