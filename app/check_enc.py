import os

def check_encodings(path):
    if not os.path.exists(path):
        print(f"File not found: {path}")
        return
    
    with open(path, 'rb') as f:
        content = f.read()
    
    for enc in ['utf-8', 'utf-8-sig', 'cp949', 'euc-kr', 'utf-16']:
        try:
            text = content.decode(enc)
            print(f"--- Encoding: {enc} ---")
            print(text[:500])
            print("\n")
        except Exception as e:
            print(f"--- Encoding: {enc} failed ---\n")

check_encodings(r'd:\antigravity\stepupvoca\app\src\AdminScreens.tsx.bak')
