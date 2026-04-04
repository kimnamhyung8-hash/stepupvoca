import os

path = r'd:\antigravity\stepupvoca\app\src\AdminScreens.tsx'

with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    # Trim leading whitespace but keep some structure if possible
    # Actually, let's just trim all leading spaces and see what we have
    stripped = line.strip()
    if stripped:
        new_lines.append(stripped + '\n')
    else:
        new_lines.append('\n')

with open(path + '.stripped', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Created AdminScreens.tsx.stripped")
