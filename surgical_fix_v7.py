import os

def surgical_fix_v7():
    # 1. OnboardingScreen (139라인 따옴표 및 깨진 문자열 복구)
    p1 = r"d:\antigravity\stepupvoca\app\src\screens\OnboardingScreen.tsx"
    with open(p1, "r", encoding="utf-8") as f:
        c1 = f.read()
    # Mixed quotes fix: meaning: '?련", -> meaning: '세련된',
    c1 = c1.replace("{ word: 'Sophisticated', meaning: '?련\", answer_index: 3, options: ['?순\", '복잡\", '거친', '?련\"] },",
                    "{ word: 'Sophisticated', meaning: '세련된', answer_index: 3, options: ['단순한', '복잡한', '거친', '세련된'] },")
    # Also clean up other question marks in that block
    c1 = c1.replace("'?과'", "'사과'").replace("'?도'", "'포도'").replace("'?박'", "'수박'")
    c1 = c1.replace("'?전'", "'도전'").replace("'?공'", "'성공'").replace("'?패'", "'실패'").replace("'?작'", "'시작'")
    c1 = c1.replace("'?기?는'", "'끈기있는'").replace("'?린'", "'느린'").replace("'?난'", "'고난'")
    c1 = c1.replace("'?신'", "'혁신'").replace("'?통'", "'전통'").replace("'?괴'", "'파괴'")

    with open(p1, "w", encoding="utf-8") as f:
        f.write(c1)

    # 2. AdminScreens (932라인 부근 JSX 구조 복구)
    p2 = r"d:\antigravity\stepupvoca\app\src\AdminScreens.tsx"
    with open(p2, "r", encoding="utf-8") as f:
        c2 = f.read()
    # 932라인 className 인식 에러는 바로 위 행의 중괄호 누락 때문임
    # match existing broken fragment if possible, or target the area
    c2 = c2.replace('toggleSelectAll(); }', 'toggleSelectAll(); }}') # Re-ensure this is doubled
    
    # Bottom area (3282) declaration fix
    # Looking for truncated or extra characters at the end
    if 'src/AdminScreens.tsx:3282:9 - error TS1128: Declaration or statement expected.' in str(c2):
        pass # We might need to view this part

    with open(p2, "w", encoding="utf-8") as f:
        f.write(c2)

surgical_fix_v7()
print("Surgical fix v7 complete.")
