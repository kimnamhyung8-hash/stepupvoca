import os

path = r"d:\antigravity\stepupvoca\app\src\AdminScreens.tsx"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

def check_balance(text):
    stack = []
    for i, char in enumerate(text):
        if char == '{':
            stack.append(('{', i))
        elif char == '}':
            if not stack:
                print(f"Unmatched }} at {i}")
            else:
                stack.pop()
        elif char == '(':
            stack.append(('(', i))
        elif char == ')':
            if not stack:
                print(f"Unmatched ) at {i}")
            else:
                stack.pop()
    
    while stack:
        typ, i = stack.pop()
        print(f"Unclosed {typ} starting at {i} (Line roughly {text.count('\n', 0, i) + 1})")

check_balance(content)
