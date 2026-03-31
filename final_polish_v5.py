import os
import re

def final_polish_v5():
    # 1. OnboardingScreen 정밀 수정
    p1 = r"d:\antigravity\stepupvoca\app\src\screens\OnboardingScreen.tsx"
    with open(p1, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    for i, line in enumerate(lines):
        if '""더 정확한 학습을 위해!"' in line:
            lines[i] = '  {lang === "ko" ? "더 정확한 학습을 위해!" : "Help us personalize!"}\n'
        if '""몇 가지 정보를 알려주시면"?"맞춤형 코스를 추천해 드려요.""' in line:
            lines[i] = '  {lang === "ko" ? "몇 가지 정보를 알려주시면 맞춤형 코스를 추천해 드려요." : "Just a few more details to find your perfect course."}\n'
    
    with open(p1, "w", encoding="utf-8") as f:
        f.writelines(lines)

    # 2. AdminScreens 정밀 수정
    p3 = r"d:\antigravity\stepupvoca\app\src\AdminScreens.tsx"
    with open(p3, "r", encoding="utf-8") as f:
        content = f.read()
    
    # 816라인 근처의 꼬인 중괄호 블록을 통째로 교체
    # current: setSelectedIds([]); \n }} \n className=
    # target:  setSelectedIds([]); \n } \n } \n } \n className=
    # regex를 사용하여 공백 유연하게 대처
    content = re.sub(r'setSelectedIds\(\[\]\);\s*\}\}\s*className=', 
                     'setSelectedIds([]);\n      }\n    }\n  }\n  className=', content)
    
    # nickname 에러 재확인 (혹시 모르니)
    content = content.replace('nickname: u.nickname,', 'nickname: u.nickname || "",')
    content = content.replace('nickname_lower: u.nickname.toLowerCase(),', 'nickname_lower: (u.nickname || "").toLowerCase(),')

    with open(p3, "w", encoding="utf-8") as f:
        f.write(content)

    print("Final clean polish complete.")

if __name__ == "__main__":
    final_polish_v5()
