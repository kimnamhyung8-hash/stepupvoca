import re
import os

path = r"d:\antigravity\stepupvoca\app\src\AdminScreens.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix style props to have double braces
content = re.sub(r'style=\{\s*([\w]+:)', r'style={{ \1', content)
content = re.sub(r'(: [\'"]?[^}]*?)\s*\}', r'\1 }}', content)

# But avoid double-closing existing correct ones
content = content.replace("}}}", "}}")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Restored style double braces")
