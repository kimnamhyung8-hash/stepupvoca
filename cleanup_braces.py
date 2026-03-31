import os

path = r"d:\antigravity\stepupvoca\app\src\AdminScreens.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("{{", "{")
content = content.replace("}}", "}")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Repair complete: removed double braces")
