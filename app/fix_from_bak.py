import os
import re

path = r'd:\antigravity\stepupvoca\app\src\AdminScreens.tsx'

with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

# Fix Typos
text = text.replace('function DashboardSectiot(', 'function DashboardSection(')
text = text.replace('handleActiot', 'handleAction')
text = text.replace('.assigt', '.assign')
text = text.replace('.jsot', '.json')
text = text.replace('console.wart', 'console.warn')
text = text.replace('joit', 'join')

# Fix Syntax errors (Missing quotes due to encoding issues)
# Looking at: title="가???원?? value={users.length}
# We should try to find title=" followed by a bunch of ? and then value={
text = re.sub(r'title="[^"]*value=\{', 'title="회원수" value={', text)
text = re.sub(r'title="[^"]*change="', 'title="스탯" change="', text)

# Specific fixes for Dashboard stats
text = text.replace('title="?매출"', 'title="총 매출"')
text = text.replace('title="미처?문의"', 'title="미처리 문의"')

# Fix Korean fragments
replacements = {
    '?체': '전체',
    '가?오?': '가져옴',
    '?인?': '확인',
    '?로고침': '새로고침',
    '로드 ?패': '로드 실패',
    '?원 ?보': '회원 정보',
    '?데?트': '업데이트',
    '?규 ?원': '신규 회원',
    '?록': '등록',
    '관리자 ?널': '관리자 패널',
    '?택': '선택',
    '기기 ?보 ?음': '기기 정보 없음',
    '?세 ?유': '상세 사유',
    '?용????': '사용자 정지',
    '?고 무시': '신고 무시',
}
for old, new in replacements.items():
    text = text.replace(old, new)

# Import t from i18n and replace N with t
if "import { t } from './i18n';" not in text:
    text = text.replace("import { vocaDBJson } from './data/vocaData';", "import { vocaDBJson } from './data/vocaData';\nimport { t } from './i18n';")

# Replaces N(g, ...) with t(g, ...)
text = re.sub(r'N\(g,', 't(g,', text)
text = re.sub(r'N\(lang,', 't(lang,', text)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Fixed AdminScreens.tsx from backup")
