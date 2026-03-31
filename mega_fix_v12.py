import os

def mega_surgical_fix_v12():
    # 1. MyPhraseScreen.tsx (597, 616)
    p1 = r"d:\antigravity\stepupvoca\app\src\MyPhraseScreen.tsx"
    with open(p1, "r", encoding="utf-8") as f:
        c1 = f.read()
    c1 = c1.replace("setTranslated(null); }", "setTranslated(null); }}")
    c1 = c1.replace("setShowCatPicker(false); }", "setShowCatPicker(false); }}")
    with open(p1, "w", encoding="utf-8") as f:
        f.write(c1)

    # 2. EvalScreen.tsx (105)
    p2 = r"d:\antigravity\stepupvoca\app\src\screens\EvalScreen.tsx"
    with open(p2, "r", encoding="utf-8") as f:
        c2 = f.read()
    c2 = c2.replace("setScreen('HOME'); }", "setScreen('HOME'); }}")
    with open(p2, "w", encoding="utf-8") as f:
        f.write(c2)

    # 3. AdminScreens.tsx (Multiple points)
    p3 = r"d:\antigravity\stepupvoca\app\src\AdminScreens.tsx"
    with open(p3, "r", encoding="utf-8") as f:
        c3 = f.read()
    
    # 1817: translateWord
    c3 = c3.replace("translateWord(lang.langName, lang.code); }", "translateWord(lang.langName, lang.code); }}")
    
    # 2764: disabled extra brace
    c3 = c3.replace("!newNotice.trim()}}", "!newNotice.trim()}")
    
    # 2902: startEditing
    c3 = c3.replace("startEditing(n) }", "startEditing(n); }}")
    
    # Re-fix the nickname error just in case
    c3 = c3.replace('nickname: u.nickname,', 'nickname: u.nickname || "",')

    # Also check the 1802 area for TS1005 (maybe corrupted chars)
    # { code: 'ko', label: '국(Korean)', langName: 'Korean' }, -> 
    # Ensuring the block is clean
    c3 = c3.replace("label: '국(Korean)", "label: '한국어(Korean)")
    c3 = c3.replace("label: '본(Japanese)", "label: '일본어(Japanese)")
    
    # General cleanup for buttons
    c3 = c3.replace("setEditingUser(u); }", "setEditingUser(u); }}")
    c3 = c3.replace("setEditingUser(null); }", "setEditingUser(null); }}")

    with open(p3, "w", encoding="utf-8") as f:
        f.write(c3)

mega_surgical_fix_v12()
print("Mega surgical fix v12 complete.")
