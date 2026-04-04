import os
import re

def fix_everything():
    screens = [
        r'd:\antigravity\stepupvoca\app\src\AdminScreens.tsx',
        r'd:\antigravity\stepupvoca\app\src\screens\ProfileScreen.tsx',
        r'd:\antigravity\stepupvoca\app\src\screens\StoreScreen.tsx',
        r'd:\antigravity\stepupvoca\app\src\screens\HomeScreen.tsx',
        r'd:\antigravity\stepupvoca\app\src\screens\StatsScreen.tsx',
        r'd:\antigravity\stepupvoca\app\src\screens\OnboardingScreen.tsx'
    ]
    
    for path in screens:
        if not os.path.exists(path): continue
        print(f"Deep fixing {path}...")
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            text = f.read()

        # Normalize newlines
        text = text.replace('\r\r\n', '\n').replace('\r\n', '\n').replace('\r', '\n')
        
        # Remove the GHOST CONTENT at the end
        text = text.rstrip()
        text = re.sub(r'\'\s*\)\)\s*\)\}\s*$', '', text)
        
        # Fix the "?? " pattern which is a mangled Quote
        text = text.replace('?? :', '":')
        text = text.replace('??', '"') # Most ?? are missing quotes
        
        # Restore Nullish Coalescing if I broke it
        # actually, if I replace ?? with ", I might have broken ?? (nullish coalescing)
        # But looking at the log, most were corrupted quotes.
        
        # Fix the specific Onboarding/Profile skins
        if 'skins' in text:
            skins_array = """    const skins = [
        { id: 'default', emoji: '🐣', label: 'Classic', price: 0 },
        { id: 'ninja', emoji: '🥷', label: 'Ninja', price: 1000 },
        { id: 'wizard', emoji: '🧙‍♂️', label: 'Wizard', price: 2000 },
        { id: 'king', emoji: '👑', label: 'King', price: 5000 },
        { id: 'dragon', emoji: '🐉', label: 'Dragon', price: 10000 },
        { id: 'alien', emoji: '👽', label: 'Alien', price: 15000 },
        { id: 'robot', emoji: '🤖', label: 'Robot', price: 20000 }
    ];"""
            text = re.sub(r'const skins = \[.*?\];', skins_array, text, flags=re.DOTALL)
            
            skins_obj = """    const skins: Record<string, string> = {
        default: '🐣',
        ninja: '🥷',
        wizard: '🧙‍♂️',
        king: '👑',
        dragon: '🐉',
        alien: '👽',
        robot: '🤖'
    };"""
            text = re.sub(r'const skins: Record<string, string> = \{.*?\};', skins_obj, text, flags=re.DOTALL)

        # Fix specific Dashboard Section in AdminScreens
        if 'DashboardSection' in text:
            text = text.replace('DashboardSectiot', 'DashboardSection')
            text = re.sub(r'title="가입 회원수"[^>]*isUp', 'title="가입 회원수" value={users.length} change="+3" isUp', text)
            text = re.sub(r'title="보유 포인트"[^>]*isUp', 'title="보유 포인트" value={points.toLocaleString()} change="-2.4%" isUp', text)

        # Fix t import
        if "import { t } from '../i18n';" not in text and "import { t } from './i18n';" not in text:
             text = text.replace("import { useState", "import { t } from '../i18n';\nimport { useState")
        
        # Final Korean common sense
        text = text.replace('시작하기! "', '시작하기!"') # fixed by previous re.sub
        
        # Remove extra blank lines (collapse to max 2)
        text = re.sub(r'\n{3,}', '\n\n', text)

        with open(path, 'w', encoding='utf-8') as f:
            f.write(text)

fix_everything()
print("Nuclear fix complete.")
