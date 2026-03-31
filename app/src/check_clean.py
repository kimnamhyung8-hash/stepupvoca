
import os

path = r'd:\antigravity\stepupvoca\app\src\ConversationScreens.tsx'
with open(path, 'rb') as f:
    lines = f.readlines()

clean_indices = []
for i in range(174, 1018):
    try:
        decoded = lines[i].decode('utf-8')
        if "title_ko" in decoded:
            clean_indices.append(i)
    except:
        continue

print(f"Clean indices found: {len(clean_indices)}")
if clean_indices:
    print(f"First 5: {clean_indices[:5]}")
    print(f"Last 5: {clean_indices[-5:]}")
