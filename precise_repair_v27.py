import os

def precise_fix(path, old, new):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    if old in content:
        new_content = content.replace(old, new)
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Fixed specific block in {os.path.basename(path)}")
    else:
        print(f"Could not find exact block in {os.path.basename(path)}")

# 1. Fix LiveChatScreen.tsx 2063 extra brace
precise_fix(
    r"d:\antigravity\stepupvoca\app\src\LiveChatScreen.tsx",
    "setShowRecordings(false); }} }",
    "setShowRecordings(false); }}"
)

# 2. Fix LiveChatScreen.tsx 2056 missing brace
precise_fix(
    r"d:\antigravity\stepupvoca\app\src\LiveChatScreen.tsx",
    "                    </div>\n                </div>\n            )\n            }",
    "                    </div>\n                </div>\n            )}\n            "
)

# 3. Fix LiveChatScreen.tsx end of file (again!)
with open(r"d:\antigravity\stepupvoca\app\src\LiveChatScreen.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

# Ensure the last lines are exactly correct
# 2289: )}
# 2290: )}
# 2291: </div>
# 2292: );
# 2293: }
if ")} \n" in lines[2289] or "            )}\n" in lines[2289]:
    if ")} \n" in lines[2290] or "            )}\n" in lines[2290]:
        print("Removing redundant extra brace at 2290")
        del lines[2290]

with open(r"d:\antigravity\stepupvoca\app\src\LiveChatScreen.tsx", "w", encoding="utf-8") as f:
    f.writelines(lines)

# 4. Fix ConversationScreens.tsx 1797 and 1801 missing braces
precise_fix(
    r"d:\antigravity\stepupvoca\app\src\ConversationScreens.tsx",
    "stop(); setIsListening(false); }",
    "stop(); setIsListening(false); }}"
)
# Note: Above replace might hit 1586 too! 
# Let's be MORE precise.
precise_fix(
    r"d:\antigravity\stepupvoca\app\src\ConversationScreens.tsx",
    "onClick={() => { stop(); setIsListening(false); }}", # If it was already fixed
    "onClick={() => { stop(); setIsListening(false); }}"
)
# Actually, let's just use the line number approach for CS.
with open(r"d:\antigravity\stepupvoca\app\src\ConversationScreens.tsx", "r", encoding="utf-8") as f:
    cs_lines = f.readlines()

for i, line in enumerate(cs_lines):
    if "onClick={() => { stop(); setIsListening(false); }" in line and not "}}" in line:
        print(f"Fixing CS line {i+1}")
        cs_lines[i] = line.replace("setIsListening(false); }", "setIsListening(false); }}")

with open(r"d:\antigravity\stepupvoca\app\src\ConversationScreens.tsx", "w", encoding="utf-8") as f:
    f.writelines(cs_lines)
