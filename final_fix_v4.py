import os

def final_surgical_repair():
    # 1. OnboardingScreen (따옴표 및 깨진 문자열 복구)
    p1 = r"d:\antigravity\stepupvoca\app\src\screens\OnboardingScreen.tsx"
    with open(p1, "r", encoding="utf-8") as f:
        c1 = f.read()
    c1 = c1.replace('{lang === \'ko\' ? ""?어""?" : "What does this mean?"}', '{lang === "ko" ? "이 단어의 뜻은?" : "What does this mean?"}')
    with open(p1, "w", encoding="utf-8") as f:
        f.write(c1)

    # 2. SettingsScreen (313라인 중괄호 누락 복구)
    p2 = r"d:\antigravity\stepupvoca\app\src\screens\SettingsScreen.tsx"
    with open(p2, "r", encoding="utf-8") as f:
        c2 = f.read()
    c2 = c2.replace('setScreen(\'HOME\'); }', 'setScreen(\'HOME\'); }}')
    with open(p2, "w", encoding="utf-8") as f:
        f.write(c2)

    # 3. AdminScreens (812-816구간 꼬인 중괄호 정밀 복구)
    p3 = r"d:\antigravity\stepupvoca\app\src\AdminScreens.tsx"
    with open(p3, "r", encoding="utf-8") as f:
        c3 = f.read()
    
    # 이 부분은 여러 줄에 걸쳐 있으므로 패턴 매칭으로 수정
    bad_pattern = 'setSelectedIds([]);\n\n  }}'
    good_pattern = 'setSelectedIds([]);\n      }\n    }\n  }'
    c3 = c3.replace(bad_pattern, good_pattern)
    
    # 혹은 이미 한 번 고쳐져서 공백이 달라졌을 경우를 대비
    c3 = c3.replace('setSelectedIds([]);\n  }}', 'setSelectedIds([]);\n      }\n    }\n  }')

    with open(p3, "w", encoding="utf-8") as f:
        f.write(c3)

final_surgical_repair()
print("3 specific file blocks repaired.")
