import os
import re

def collapse_file(path):
    print(f"Processing {path}...")
    with open(path, 'rb') as f:
        content = f.read()
    
    # Replace long stretches of whitespace (spaces or tabs) with a single space
    # but only if they are longer than, say, 10 characters and in the middle of a line
    # Actually, the problem seems to be huge indents or gaps.
    
    # Try to decode as utf-8, ignore errors
    try:
        text = content.decode('utf-8', errors='ignore')
    except:
        print(f"Failed to decode {path}")
        return

    # Remove massive whitespace gaps
    text = re.sub(r'[ \t]{10,}', ' ', text)
    
    # Remove NULL bytes if any
    text = text.replace('\x00', '')

    # Fix specific corruption artifacts like '  ))\r\n                )}\r\n' at the end
    # Actually, we should find the last '}' that closes the main exports
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)

files_to_fix = [
    r'd:\antigravity\stepupvoca\app\src\AdminScreens.tsx',
    r'd:\antigravity\stepupvoca\app\src\screens\HomeScreen.tsx',
    r'd:\antigravity\stepupvoca\app\src\screens\OnboardingScreen.tsx',
    r'd:\antigravity\stepupvoca\app\src\screens\ProfileScreen.tsx',
    r'd:\antigravity\stepupvoca\app\src\screens\StatsScreen.tsx',
    r'd:\antigravity\stepupvoca\app\src\screens\StoreScreen.tsx',
]

for f in files_to_fix:
    if os.path.exists(f):
        collapse_file(f)
