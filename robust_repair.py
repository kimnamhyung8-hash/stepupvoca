import os

# Robust Repair
cs_path = r"d:\antigravity\stepupvoca\app\src\ConversationScreens.tsx"
lc_path = r"d:\antigravity\stepupvoca\app\src\LiveChatScreen.tsx"

with open(cs_path, "r", encoding="utf-8") as f:
    cs_lines = f.readlines()

for i, line in enumerate(cs_lines):
    # Fix 1349 (originally 1347 area)
    if "stop(); setIsListening(false); }}" in line:
        print(f"Fixing CS line {i+1}")
        cs_lines[i] = line.replace("stop(); setIsListening(false); }}", "stop(); setIsListening(false); }")

with open(cs_path, "w", encoding="utf-8") as f:
    f.writelines(cs_lines)

with open(lc_path, "r", encoding="utf-8") as f:
    lc_lines = f.readlines()

for i, line in enumerate(lc_lines):
    if "setRecordingStatus('idle'); } }" in line:
        print(f"Fixing LC line {i+1}")
        lc_lines[i] = line.replace("setRecordingStatus('idle'); } }", "setRecordingStatus('idle'); }")

# Fix LC end of file
# Find the line with multiple )} 
for i in range(len(lc_lines)-1, len(lc_lines)-10, -1):
    if ")} )}" in lc_lines[i] or ")}  )}" in lc_lines[i] or (")}" in lc_lines[i] and i > 0 and ")}" in lc_lines[i-1]):
        # This is tricky. Let's just use the last few lines.
        pass

content = "".join(lc_lines)
import re
# Correct the end specifically
content = re.sub(r"}\s*\)\s*;\s*}\s*$", "\n            )}\n        </div>\n    );\n}\n", content)
# Wait, the previous check_braces said Diff = 3.
# Let's count again.
opened = content.count('{')
closed = content.count('}')
print(f"LC Diff after preliminary fix: {opened - closed}")

with open(lc_path, "w", encoding="utf-8") as f:
    f.write(content)
