import os
import re

root_dir = r"d:\antigravity\stepupvoca\app\src"

def fix_jsx_braces(content):
    props = ['onClick', 'onChange', 'disabled', 'value', 'onRefresh', 'onUpdateUser', 'key', 'style', 'onSave', 'onCancel', 'onDelete', 'onSubmit']
    
    for prop in props:
        # Avoid f-string issues with braces
        pattern1 = prop + r'=\{\{(.*?)\}\n?(\s*)([a-zA-Z]+)='
        replacement1 = prop + r'={{\1}}\n\2\3='
        content = re.sub(pattern1, replacement1, content)
        
        pattern2 = prop + r'=\{(.*?)\}\n?(\s*)([a-zA-Z]+)='
        replacement2 = prop + r'={\1}\n\2\3='
        content = re.sub(pattern2, replacement2, content)

    # Specific fix for StudyModeScreen multiline onClick
    # onClick={() => { ...; }
    # disabled=
    content = re.sub(r'onClick=\{\(\) => \{ ([^\}]*?;) \}\n?(\s+)([a-z]+)=', r'onClick={() => { \1 }} \n\2\3=', content)
    content = re.sub(r'onClick=\{async \(\) => \{ ([^\}]*?;) \}\n?(\s+)([a-z]+)=', r'onClick={async () => { \1 }} \n\2\3=', content)
    
    # Fix for {lang === 'ko' ? "..." " : "..."}
    content = re.sub(r'\? "([^"]*?)"\s+" :', r'? "\1" :', content)
    content = re.sub(r'\? "([^"]*?)"\s*" :', r'? "\1" :', content)
    
    return content

def repair_file(file_path):
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    original = content
    content = fix_jsx_braces(content)
    
    # Cleanup
    content = content.replace("}} }", "}}")
    content = content.replace("}}}", "}}")
    content = content.replace("`${h }%` }", "`${h}%` }}")
    
    # Corrupted strings
    content = content.replace('?스"?료!"', '"테스트 완료!"')
    content = content.replace('계속?기 (?벨?스" "', '"계속하기 (레벨 테스트)"')
    content = content.replace('?가지 ?보""려주시"', '"몇 가지 정보를 알려주시면"')
    content = content.replace('맞는 코스?추천?드?요.', '"맞춤형 코스를 추천해 드려요."')
    content = content.replace('"?확"?습"?해!"', '"더 정확한 학습을 위해!"')
    content = content.replace('회회원관리', '회원관리')
    content = content.replace('대시수정보로드', '대시보드')
    content = content.replace('채팅신신고', '채팅신고')

    if content != original:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)

# Scan all TSX files
for root, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith(".tsx"):
            repair_file(os.path.join(root, file))

print("V19 Global repair completed.")
