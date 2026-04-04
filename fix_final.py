import os
import re

path = r'd:\antigravity\stepupvoca\app\src\AdminScreens.tsx.stripped'
output = r'd:\antigravity\stepupvoca\app\src\AdminScreens_fixed.tsx'

with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Fix StatCard lines
text = text.replace(
    'title="가입 회원수"+3" isUp={true}',
    'title="가입 회원수" value={users.length} change="+3" isUp={true}'
)
text = text.replace(
    'title="보유 포인트"-2.4%" isUp={false}',
    'title="보유 포인트" value={points.toLocaleString()} change="-2.4%" isUp={false}'
)

# Fix common corrupted Korean patterns based on context
# ?? -> 상태 / 통계? -> 통계 / ?고? -> 신고 / ?드? -> 피드백
replacements = {
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
}

for old, new in replacements.items():
    text = text.replace(old, new)

with open(output, 'w', encoding='utf-8') as f:
    f.write(text)

print("Created AdminScreens_fixed.tsx")
