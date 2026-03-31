import os
import re

root_dir = r"d:\antigravity\stepupvoca\app\src"

def fix_jsx_braces(content):
    # This function tries to find JSX props that are missing their closing brace
    # and also removes extra ones.
    
    # props that usually contain braces
    props = ['onClick', 'onChange', 'disabled', 'value', 'onRefresh', 'onUpdateUser', 'key', 'style', 'onSave', 'onCancel', 'onDelete', 'onSubmit', 'onFocus', 'onBlur', 'onMouseEnter', 'onMouseLeave']
    
    for prop in props:
        # Match prop={ ... } where it might be missing the closing brace
        # We look for prop={ followed by non-closing-brace content up to the next prop or tag end
        # This is high-risk, so we'll be specific.
        
        # 1. Fix onClick={() => { ... } missing the last }
        # Pattern: onClick={() => { [ANYTHING NO CHILD BRACES OR BALANCED BRACES] } [MISSING NEXT BRACE] prop=
        # Actually, let's just fix the most common ones found:
        # onClick={() => { ... } className=
        content = re.sub(re.escape(prop) + r'=\{\{(.*?)\}\n?(\s*)([a-zA-Z]+)=', prop + r'={{\1}}\n\2\3=', content)
        content = re.sub(re.escape(prop) + r'=\{(.*?)\}\n?(\s*)([a-zA-Z]+)=', prop + r'={\1}\n\2\3=', content)

    # Specific fix for StudyModeScreen where I saw:
    # onClick={async () => { await showAdIfFree(); setScreen('HOME'); } className=
    content = re.sub(r'onClick=\{async \(\) => \{ (.*?) \}\s+className=', r'onClick={async () => { \1 }} className=', content)
    content = re.sub(r'onClick=\{\(\) => \{ (.*?) \}\s+className=', r'onClick={() => { \1 }} className=', content)
    
    # Fix disabled={...} missing }
    # disabled={studyIndex === 0} [missing] className=
    # content = re.sub(r'disabled=\{([^\}]*?)\}\s+className=', r'disabled={\1} className=', content) # This one is usually okay if it has one }
    
    # Wait, the log said: src/screens/StudyModeScreen.tsx:320:25 - error TS1005: '}' expected.
    # 320: disabled={studyIndex === 0}
    # Let's see if it HAD a brace or not in the view.
    # From Step 1048:
    # 319: <button onClick={() => { setStudyIndex(i => Math.max(0, i - 1)); setShowMeaning(false); setFeedbackMsg(null); }
    # 320:     disabled={studyIndex === 0}
    
    # AHA! Line 319's onClick is NOT closed. It starts with { and has an internal { for the arrow function body, but only ONE } at the end of 319.
    # So it's missing the outer }.
    
    # Fix for { () => { ... } } pattern missing last brace
    content = re.sub(r'onClick=\{\(\) => \{ ([^\}]*?;) \}\n?(\s+)disabled=', r'onClick={() => { \1 }} \n\2disabled=', content)
    content = re.sub(r'onClick=\{\(\) => \{ ([^\}]*?;) \}\n?(\s+)className=', r'onClick={() => { \1 }} \n\2className=', content)
    
    # Also for OnboardingScreen:
    # {lang === 'ko' ? "계속하기 (레벨 테스트)" " : "다음 (레벨 테스트) "}
    # Wait, the global_repair.py already had a fix for this. Let's make it better.
    content = re.sub(r'\? "([^"]*?)"\s+" :', r'? "\1" :', content)
    
    return content

def repair_file(file_path):
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    original = content
    content = fix_jsx_braces(content)
    
    # Fix the double closing } } in StudyModeScreen and others
    content = content.replace("}} }", "}}")
    content = content.replace("}}}", "}}")
    
    # Fix specific style issue in AdminScreens
    content = content.replace("`${h }%` }", "`${h}%` }}")
    
    # Fix corrupted strings
    content = content.replace('?스"?료!"', '"테스트 완료!"')
    content = content.replace('계속?기 (?벨?스" "', '"계속하기 (레벨 테스트)"')
    content = content.replace('?가지 ?보""려주시"', '"몇 가지 정보를 알려주시면"')
    content = content.replace('맞는 코스?추천?드?요.', '"맞춤형 코스를 추천해 드려요."')
    content = content.replace('"?확"?습"?해!"', '"더 정확한 학습을 위해!"')

    if content != original:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)

# Scan all TSX files
for root, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith(".tsx"):
            repair_file(os.path.join(root, file))

print("V18 Global repair completed.")
