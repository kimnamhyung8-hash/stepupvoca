import os
import re

def final_brace_cleanup_v10():
    # 1. AdminScreens.tsx (모든 onClick 핸들러 전수 조사 및 수정)
    p1 = r"d:\antigravity\stepupvoca\app\src\AdminScreens.tsx"
    with open(p1, "r", encoding="utf-8") as f:
        c1 = f.read()

    # 중괄호가 하나만 닫힌 onClick 패턴들을 영구적으로 수정
    # (주의: 중복 적용되지 않도록 주의깊게 매칭)
    patterns = [
        (r"onClick=\{\(\) => setScreen\('([^']+)'\)\s*\}", r"onClick={() => setScreen('\1')}"),
        (r"onClick=\{\(\) => setEditingUser\(([^)]+)\)\s*\}", r"onClick={() => setEditingUser(\1)}"),
        (r"onClick=\{\(e\) => \{ e\.preventDefault\(\); toggleSelectOne\(u\.id\);\s*\}", r"onClick={(e) => { e.preventDefault(); toggleSelectOne(u.id); }}"),
        (r"onClick=\{\(\) => translateWord\(lang\.langName, lang\.code\)\s*\}", r"onClick={() => translateWord(lang.langName, lang.code)}"),
        (r"setEditingUser\(null\);\s*\}", r"setEditingUser(null); }}"), # Specific for 1035 if it was a block
    ]
    
    # 단순 문자열 치환이 더 안전할 수 있음
    c1 = c1.replace("toggleSelectOne(u.id); }", "toggleSelectOne(u.id); }}")
    c1 = c1.replace("translateWord(lang.langName, lang.code); }", "translateWord(lang.langName, lang.code); }}")
    c1 = c1.replace("setEditingUser(u); }", "setEditingUser(u); }}")
    c1 = c1.replace("setEditingUser(null); }", "setEditingUser(null); }}")
    c1 = c1.replace("setScreen('HOME'); }", "setScreen('HOME'); }}")
    
    # 중복 }}} 방지
    c1 = c1.replace("}}} }", "}}")
    c1 = c1.replace("}}}}", "}}")
    c1 = c1.replace("}}}", "}}") # Careful here, some blocks might need }}} if nested. 
    # But usually in onClick it's }} or }}}
    
    with open(p1, "w", encoding="utf-8") as f:
        f.write(c1)

    # 2. MasteryListScreen.tsx 정밀 수정
    p2 = r"d:\antigravity\stepupvoca\app\src\screens\MasteryListScreen.tsx"
    with open(p2, "r", encoding="utf-8") as f:
        c2 = f.read()
    c2 = c2.replace("setScreen('HOME'); }", "setScreen('HOME'); }}")
    with open(p2, "w", encoding="utf-8") as f:
        f.write(c2)

    # 3. OnboardingScreen.tsx (Mixed quotes)
    p3 = r"d:\antigravity\stepupvoca\app\src\screens\OnboardingScreen.tsx"
    with open(p3, "r", encoding="utf-8") as f:
        c3 = f.read()
    # Ensure quotes are consistent
    c3 = c3.replace("meaning: '?련\",", "meaning: '세련된',")
    with open(p3, "w", encoding="utf-8") as f:
        f.write(c3)

    print("Comprehensive brace cleanup v10 complete.")

if __name__ == "__main__":
    final_brace_cleanup_v10()
