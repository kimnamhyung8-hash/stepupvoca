
import os

path = r'd:\antigravity\stepupvoca\app\src\ConversationScreens.tsx'
with open(path, 'rb') as f:
    lines = f.readlines()

for i in range(216, len(lines)):
    try:
        decoded = lines[i].decode('utf-8')
        if "id: '" in decoded and "subScenarios" not in decoded and i > 400:
            print(f"Potential stable point at {i+1}: {decoded.strip()}")
            break
    except:
        continue
