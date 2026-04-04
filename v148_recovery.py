
import os
import re

def fix_content(text):
    # Fix systematic typos
    text = text.replace('Sectiot', 'Section')
    text = text.replace('Screet', 'Screen')
    text = text.replace('collectiot', 'collection')
    text = text.replace('handleActiot', 'handleAction')
    text = text.replace('DashboardSectiot', 'DashboardSection')
    text = text.replace('const { updateDoc, doc } = await import(', 'const { updateDoc, doc } = await import(') # No change needed here but just in case
    text = text.replace('console.wart', 'console.warn')
    return text

def restore_file(src_bak, dest):
    if not os.path.exists(src_bak):
        print(f"Skipping {src_bak}: Not found")
        return
    
    print(f"Restoring {dest} from {src_bak}...")
    with open(src_bak, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    fixed_content_str = fix_content(content)
    
    with open(dest, 'w', encoding='utf-8') as f:
        f.write(fixed_content_str)

# 1. Revert versions
package_json_path = r'd:\antigravity\stepupvoca\app\package.json'
if os.path.exists(package_json_path):
    with open(package_json_path, 'r', encoding='utf-8') as f:
        pj = f.read()
    pj = pj.replace('"version": "1.5.0"', '"version": "1.4.8"')
    with open(package_json_path, 'w', encoding='utf-8') as f:
        f.write(pj)

app_constants_path = r'd:\antigravity\stepupvoca\app\src\constants\appConstants.ts'
if os.path.exists(app_constants_path):
    with open(app_constants_path, 'r', encoding='utf-8') as f:
        ac = f.read()
    ac = ac.replace("APP_VERSION = '1.5.0'", "APP_VERSION = '1.4.8'")
    with open(app_constants_path, 'w', encoding='utf-8') as f:
        f.write(ac)

# 2. Restore from .bak
backups = [
    (r'd:\antigravity\stepupvoca\app\src\AdminScreens.tsx.bak', r'd:\antigravity\stepupvoca\app\src\AdminScreens.tsx'),
    (r'd:\antigravity\stepupvoca\app\src\screens\HomeScreen.tsx.bak', r'd:\antigravity\stepupvoca\app\src\screens\HomeScreen.tsx'),
    (r'd:\antigravity\stepupvoca\app\src\screens\OnboardingScreen.tsx.bak', r'd:\antigravity\stepupvoca\app\src\screens\OnboardingScreen.tsx'),
    (r'd:\antigravity\stepupvoca\app\src\screens\ProfileScreen.tsx.bak', r'd:\antigravity\stepupvoca\app\src\screens\ProfileScreen.tsx'),
    (r'd:\antigravity\stepupvoca\app\src\screens\StatsScreen.tsx.bak', r'd:\antigravity\stepupvoca\app\src\screens\StatsScreen.tsx'),
    (r'd:\antigravity\stepupvoca\app\src\screens\StoreScreen.tsx.bak', r'd:\antigravity\stepupvoca\app\src\screens\StoreScreen.tsx'),
]

for bak, dest in backups:
    restore_file(bak, dest)

print("Restoration complete.")
