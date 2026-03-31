import os

def fix_admin():
    path = r"d:\antigravity\stepupvoca\app\src\AdminScreens.tsx"
    with open(path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    # 756: index 755
    if "disabled={loading}}" in lines[755]:
        lines[755] = lines[755].replace("disabled={loading}}", "disabled={loading}")
    
    # 814: index 813
    if "}}" in lines[813] and "onClick" not in lines[813]:
        # Check if it looks like a stray brace
        lines[813] = "\n"

    # 891: index 890
    if "toggleSelectAll(); }" in lines[890]:
        lines[890] = lines[890].replace("toggleSelectAll(); }", "toggleSelectAll(); }}")

    with open(path, "w", encoding="utf-8") as f:
        f.writelines(lines)

def fix_study():
    path = r"d:\antigravity\stepupvoca\app\src\screens\StudyModeScreen.tsx"
    with open(path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    lines[181] = lines[181].replace("setScreen('HOME'); }", "setScreen('HOME'); }}")
    lines[251] = lines[251].replace("setScreen('MASTERY'); }", "setScreen('MASTERY'); }}")
    
    with open(path, "w", encoding="utf-8") as f:
        f.writelines(lines)

def fix_review():
    path = r"d:\antigravity\stepupvoca\app\src\screens\ReviewScreen.tsx"
    with open(path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    lines[252] = lines[252].replace("Set()); }", "Set()); }}")
    lines[288] = lines[288].replace("setWeaknessReport(null); }", "setWeaknessReport(null); }}")
    lines[472] = lines[472].replace("card.word); } }", "card.word); }}}")
    # Wait, line 472 in ReviewScreen was:
    # 473: onClick={() => { if (!flipped && !userInput) { setFlipped(true); playTTS(card.word); } }
    # Let's be safer:
    if "playTTS(card.word); } }" in lines[472]:
        lines[472] = lines[472].replace("playTTS(card.word); } }", "playTTS(card.word); }}}")
    
    lines[509] = lines[509].replace("checkPronunciation(); }", "checkPronunciation(); }}")
    lines[536] = lines[536].replace("card.word); }", "card.word); }}")

    with open(path, "w", encoding="utf-8") as f:
        f.writelines(lines)

fix_admin()
fix_study()
fix_review()
print("Surgical fix completed.")
