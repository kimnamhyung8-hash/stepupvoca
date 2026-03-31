
import os

with open(r'd:\antigravity\stepupvoca\app\src\ConversationScreens.tsx', 'rb') as f:
    content = f.read()

# Try to decode or just find the problematic area
lines = content.splitlines()
for i in range(170, min(200, len(lines))):
    print(f"{i+1}: {lines[i]}")
