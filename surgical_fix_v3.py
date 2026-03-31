import os

def fix_admin_screens():
    path = r"d:\antigravity\stepupvoca\app\src\AdminScreens.tsx"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # 1. Fix nickname type error (Line 389 approx)
    content = content.replace('nickname: u.nickname,', 'nickname: u.nickname || "",')
    content = content.replace('nickname_lower: u.nickname.toLowerCase(),', 'nickname_lower: (u.nickname || "").toLowerCase(),')
    
    # 2. Fix JSX braces
    content = content.replace('disabled={loading}}', 'disabled={loading}')
    content = content.replace('toggleSelectAll(); }', 'toggleSelectAll(); }}')
    
    # 3. Fix the specific triple-brace issue at the handleUpdate area or handleDelete area
    # Looking for the pattern where }} is followed by className but missing one }
    # Let's target the exact text sequence seen in view_file
    content = content.replace('setSelectedIds([]);\n\n  }}\n\n \n\n \n\n  className=', 'setSelectedIds([]);\n  }\n  }\n  }\n  className=')

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("AdminScreens fixed.")

def fix_onboarding():
    path = r"d:\antigravity\stepupvoca\app\src\screens\OnboardingScreen.tsx"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Fix the double quotes
    content = content.replace('""테스트 완료!"', '"테스트 완료!"')
    # Fix corrupted korean and ternary
    content = content.replace('`?신? "${getResult().label}" ?계?니"`', '`당신의 레벨은 "${getResult().label}" 입니다.`')
    
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("OnboardingScreen fixed.")

if __name__ == "__main__":
    fix_admin_screens()
    fix_onboarding()
