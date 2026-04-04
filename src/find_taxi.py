
import os

path = r'd:\antigravity\stepupvoca\app\src\ConversationScreens.tsx'
with open(path, 'rb') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if b"id: 'taxi'" in line:
        print(f"Index {i}: {line}")
    if i > 170 and i < 200:
        print(f"{i}: {line}")
