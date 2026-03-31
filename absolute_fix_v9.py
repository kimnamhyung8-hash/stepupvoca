import os
import re

def absolute_fix_v9():
    # 1. OnboardingScreen.tsx (데이터 블록 통째로 교체)
    p1 = r"d:\antigravity\stepupvoca\app\src\screens\OnboardingScreen.tsx"
    with open(p1, "r", encoding="utf-8") as f:
        c1 = f.read()

    # languages 배열 교환
    languages_start = "    const languages = ["
    languages_end = "    ];"
    new_languages = """    const languages = [
        { code: 'ko', label: '한국어', flag: 'KR' },
        { code: 'ja', label: '日本語', flag: 'JP' },
        { code: 'zh', label: '简体中文', flag: 'CN' },
        { code: 'zh-TW', label: '繁體中文', flag: 'TW' },
        { code: 'vi', label: 'Tiếng Việt', flag: 'VN' },
        { code: 'en', label: 'English', flag: 'US' }
    ];"""
    
    # steps 객체 교환
    steps_start = "    const steps = {"
    steps_end = "    };"
    new_steps = """    const steps = {
        ko: ["언어 선택", "맞춤 정보", "레벨 테스트", "결과 확인", "프로필 설정"],
        en: ["Language", "Goal/Age", "Mini Quiz", "Your Level", "Profile"]
    };"""

    # 정규표현식을 사용하지 않고 가장 안전하게 문자열 치환 시도
    # (파일 내에서 고유한 패턴을 찾아서 교체)
    if 'const languages = [' in c1:
        # Simple string surgery
        before = c1.split('const languages = [')[0]
        after = c1.split('];')[1] # This might be risky if there are multiple ];
        # Let's find the closing ]; of the languages array specifically
        parts = c1.split('const languages = [')
        middle_and_end = parts[1].split('];', 1)
        c1 = parts[0] + new_languages + middle_and_end[1]

    if 'const steps = {' in c1:
        parts = c1.split('const steps = {')
        middle_and_end = parts[1].split('};', 1)
        c1 = parts[0] + new_steps + middle_and_end[1]

    with open(p1, "w", encoding="utf-8") as f:
        f.write(c1)

    # 2. AdminScreens.tsx (중괄호 과잉/부족 문제 영구 해결)
    p2 = r"d:\antigravity\stepupvoca\app\src\AdminScreens.tsx"
    with open(p2, "r", encoding="utf-8") as f:
        c2 = f.read()
    
    # toggleSelectAll(); }}} -> toggleSelectAll(); }}
    c2 = c2.replace('toggleSelectAll(); }}}', 'toggleSelectAll(); }}')
    c2 = c2.replace('toggleSelectOne(u.id); }', 'toggleSelectOne(u.id); }}')
    
    with open(p2, "w", encoding="utf-8") as f:
        f.write(c2)

    print("Absolute fix v9 complete.")

if __name__ == "__main__":
    absolute_fix_v9()
