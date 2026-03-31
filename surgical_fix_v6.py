import os

def surgical_fix_v6():
    # 1. OnboardingScreen (205라인 따옴표 누락 복구)
    p1 = r"d:\antigravity\stepupvoca\app\src\screens\OnboardingScreen.tsx"
    with open(p1, "r", encoding="utf-8") as f:
        c1 = f.read()
    # emoji: "?, color: 부분을 찾아서 교체
    c1 = c1.replace('emoji: "?, color:', 'emoji: "😊", color:')
    with open(p1, "w", encoding="utf-8") as f:
        f.write(c1)

    # 2. AdminScreens (889라인 과잉 중괄호 제거)
    p3 = r"d:\antigravity\stepupvoca\app\src\AdminScreens.tsx"
    with open(p3, "r", encoding="utf-8") as f:
        c3 = f.read()
    c3 = c3.replace('toggleSelectAll(); }}}', 'toggleSelectAll(); }}')
    with open(p3, "w", encoding="utf-8") as f:
        f.write(c3)

surgical_fix_v6()
print("Surgical fix v6 complete.")
