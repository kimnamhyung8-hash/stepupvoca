import os
import re

root_dir = r"d:\antigravity\stepupvoca\app\src"

def repair_file(file_path):
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    # 1. Fix double-closing braces in JSX props
    # Pattern: prop={...}} where it should be prop={...}
    # This is tricky because some legitimate JSX has }} (like style={{}})
    # Let's target onClick/onChange/value specifically
    content = re.sub(r'(onClick|onChange|value|onRefresh|onUpdateUser|onDelete|onSave|handleAction)=\{(.*?)\}\}', r'\1={\2}', content)
    
    # 2. Fix the specific style={{ height: ... } } issue
    content = re.sub(r'style=\{\{ height: `\$\{h \}%` \}', r'style={{ height: `${h}%` }}', content)

    # 3. Fix corrupted strings in OnboardingScreen.tsx and others
    # Example: {lang === 'ko' ? "계속?기 (?벨?스" " : "다음 (레벨 테스트) "}
    # We want to match ? "some text" " :
    content = re.sub(r'\? "([^"]*?)"\s*" :', r'? "\1" :', content)
    
    # 4. Fix specific corrupted phrases found in logs
    content = content.replace('?스"?료!"', '"테스트 완료!"')
    content = content.replace('계속?기 (?벨?스" "', '"계속하기 (레벨 테스트)"')
    content = content.replace('?가지 ?보""려주시"', '"몇 가지 정보를 알려주시면"')
    content = content.replace('맞는 코스?추천?드?요.', '"맞춤형 코스를 추천해 드려요."')
    content = content.replace('"?확"?습"?해!"', '"더 정확한 학습을 위해!"')
    
    # 5. Fix AdminScreens EXIT button
    content = content.replace("setScreen('HOME')}}", "setScreen('HOME')}")
    content = content.replace("setActiveTab(tab.id)}}", "setActiveTab(tab.id)}")

    # 6. Final sweep for double braces that aren't styles
    # If we see something like {variable}} and it's not preceded by style={{
    # but that's too risky. Let's just fix known ones.

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

# Scan all TSX files
for root, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith(".tsx"):
            repair_file(os.path.join(root, file))

print("Global repair process completed.")
