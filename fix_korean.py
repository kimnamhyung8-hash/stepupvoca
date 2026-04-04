
import os
import re

path = r'd:\antigravity\stepupvoca\app\src\AdminScreens.tsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Fix common broken Korean patterns (including those introduced by previous '로드' replacement)
replacements = {
    '?체': '전체',
    '?원': '회원',
    '?태': '상태',
    '?인': '확인',
    '?록': '등록',
    '?패': '실패',
    '?데?트': '업데이트',
    '?보': '정보',
    '?정': '설정',
    '?스?': '시스템',
    '?이?': '데이터',
    '?로고침': '새로고침',
    '컬렉로드': '컬렉션',
    '가?오로드': '가져와야',
    '로드?함': '포함',
    '로드로드?음': '정보 없음',
    '?습?다': '했습니다',
    '?니로드': '합니다',
    '?세로드': '하세요',
    '지?': '지급',
    '관?': '관리',
    '?널': '패널',
    '??보로드': '대시보드',
    '?터': '필터',
    '?규': '신규'
}

for old, new in replacements.items():
    text = text.replace(old, new)

# Cleanup any remaining lone '로드' that look like they shouldn't be there
text = text.replace('컬렉로드', '컬렉션')
text = text.replace('로드?', '포함')

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("AdminScreens.tsx Korean strings polished.")
