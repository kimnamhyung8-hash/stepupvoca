import os
import re

def fix_quotes(path):
    print(f"Fixing quotes in {path}...")
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        text = f.read()

    # Broken patterns like: "Start ?? : "Go ??)}
    # We replace ?? followed by space/colon with "
    text = re.sub(r'\?\?\s*:', '" :', text)
    # We replace ?? followed by ) or } with "
    text = re.sub(r'\?\?\s*([\)\},])', r'"\1', text)
    # Replace ?? at end of line
    text = re.sub(r'\?\?\s*$', '"', text, flags=re.MULTILINE)
    
    # Fix the specific Onboarding line
    text = text.replace(' "시작하기! ??', ' "시작하기!"')
    text = text.replace(' "Get Started! ??', ' "Get Started!"')
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)

screens = [
    r'd:\antigravity\stepupvoca\app\src\AdminScreens.tsx',
    r'd:\antigravity\stepupvoca\app\src\screens\ProfileScreen.tsx',
    r'd:\antigravity\stepupvoca\app\src\screens\StoreScreen.tsx',
    r'd:\antigravity\stepupvoca\app\src\screens\HomeScreen.tsx',
    r'd:\antigravity\stepupvoca\app\src\screens\StatsScreen.tsx',
    r'd:\antigravity\stepupvoca\app\src\screens\OnboardingScreen.tsx'
]

for s in screens:
    if os.path.exists(s):
        fix_quotes(s)
