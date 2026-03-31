import os

def final_polish_v14():
    # 1. EvalScreen.tsx (105라인 과잉 중괄호 제거)
    p1 = r"d:\antigravity\stepupvoca\app\src\screens\EvalScreen.tsx"
    with open(p1, "r", encoding="utf-8") as f:
        c1 = f.read()
    # "HOME'); }}}}" 를 "HOME'); }}" 로 교체
    c1 = c1.replace("setScreen('HOME'); }}}}", "setScreen('HOME'); }}")
    with open(p1, "w", encoding="utf-8") as f:
        f.write(c1)

    # 2. AdminScreens.tsx (3096라인 과잉 중괄호 제거)
    p2 = r"d:\antigravity\stepupvoca\app\src\AdminScreens.tsx"
    with open(p2, "r", encoding="utf-8") as f:
        c2 = f.read()
    c2 = c2.replace("disabled={isLoading}}", "disabled={isLoading}")
    with open(p2, "w", encoding="utf-8") as f:
        f.write(c2)

final_polish_v14()
print("Final polish v14 complete.")
