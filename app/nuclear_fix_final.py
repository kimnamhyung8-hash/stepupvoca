import os
import re

def fix_everything():
    screens = [
        r'd:\antigravity\stepupvoca\app\src\AdminScreens.tsx',
        r'd:\antigravity\stepupvoca\app\src\screens\ProfileScreen.tsx',
        r'd:\antigravity\stepupvoca\app\src\screens\StoreScreen.tsx',
        r'd:\antigravity\stepupvoca\app\src\screens\HomeScreen.tsx',
        r'd:\antigravity\stepupvoca\app\src\screens\StatsScreen.tsx',
        r'd:\antigravity\stepupvoca\app\src\screens\OnboardingScreen.tsx'
    ]
    
    for path in screens:
        if not os.path.exists(path): continue
        print(f"Deep fixing {path}...")
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            text = f.read()

        # Normalize newlines
        text = text.replace('\r\r\n', '\n').replace('\r\n', '\n').replace('\r', '\n')
        
        # 1. Truncate GHOST CONTENT
        lines = text.split('\n')
        clean_lines = []
        for line in lines:
            # If a line contains jumbled end-of-file markers, stop or clean it
            if " )) )}" in line:
                line = line.split(" )) )}")[0]
            clean_lines.append(line)
        text = '\n'.join(clean_lines)

        # 2. Fix Broken Tags (e.g. /span> -> </span>)
        text = re.sub(r'([^<])/span>', r'\1</span>', text)
        text = re.sub(r'([^<])/div>', r'\1</div>', text)
        text = re.sub(r'([^<])/p>', r'\1</p>', text)
        text = re.sub(r'([^<])/h3>', r'\1</h3>', text)
        text = re.sub(r'([^<])/h4>', r'\1</h4>', text)
        text = re.sub(r'([^<])/td>', r'\1</td>', text)
        text = re.sub(r'([^<])/tr>', r'\1</tr>', text)
        text = re.sub(r'([^<])/button>', r'\1</button>', text)
        
        # 3. Fix Quote corruption
        text = text.replace('?? :', '":')
        text = text.replace('??', '"')
        text = text.replace('"? :', '":')
        text = text.replace('"? ', '" ')
        
        # 4. Korean common sense fixes
        fixes = {
            '?체': '전체', '가?오?': '가져옴', '?인?': '확인', '?인전체': '포인트',
            '?로고침': '새로고침', '로드 ?패': '로드 실패', '?원 ?보': '회원 정보',
            '?데?트': '업데이트', '?규 ?원': '신규 회원', '?록': '등록',
            '관리자 ?널': '관리자 패널', '?택': '선택', '?고 ?역': '신고 내역',
            '기기 ?보 ?음': '기기 정보 없음', '?세 ?유': '상세 사유',
            '?용????': '사용자 정지', '?고 무시': '신고 무시',
            '?통 ?인??': '보유 포인트', '?매출': '총 매출', '미처?문의': '미처리 문의',
            '비활??': '비활성', '??': '정지', '?성': '활성', '????..': '저장중...',
            '?작?기!': '시작하기!', '?속?기': '계속하기', '로드?': '로드완료',
            '?인?? ?족': '포인트 부족'
        }
        for old, new in fixes.items():
            text = text.replace(old, new)

        # 5. Math and Typos
        text = text.replace('Math.mit(', 'Math.min(')
        text = text.replace('DashboardSectiot', 'DashboardSection')
        text = text.replace('handleActiot', 'handleAction')
        text = text.replace('.assigt', '.assign')
        text = text.replace('.jsot', '.json')
        text = text.replace('console.wart', 'console.warn')
        
        # 6. Formatting
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        with open(path, 'w', encoding='utf-8') as f:
            f.write(text)

fix_everything()
print("Final Nuclear fix complete.")
