import os
import re

def flexible_fix(path, pattern, replacement):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    new_content = re.sub(pattern, replacement, content)
    if content != new_content:
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Fixed {os.path.basename(path)}")
    else:
        print(f"No changes for {os.path.basename(path)}")

# 1. Fix ConversationScreens.tsx 1586 (extra brace)
flexible_fix(
    r"d:\antigravity\stepupvoca\app\src\ConversationScreens.tsx",
    r"stop\(\);\s*setIsListening\(false\);\s*\}\} else \{",
    "stop(); setIsListening(false); } else {"
)

# 2. Fix LiveChatScreen.tsx 1960-1963 (corrupted by previous fix)
flexible_fix(
    r"d:\antigravity\stepupvoca\app\src\LiveChatScreen.tsx",
    r"1959:\s*</div>\s*1960:\s*}\)\s*1961:\s*</div>\s*1962:\s*\);\s*1963:\s*}\)\}", # This pattern won't work due to line numbers.
    "" # Placeholder
)
# Re-writing 2 for real:
with open(r"d:\antigravity\stepupvoca\app\src\LiveChatScreen.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

# Revert middle corruption (1960 area)
# 1959 is usually lines[1958]
if ")} \n" in lines[1959] or "            )}\n" in lines[1959]:
    lines[1959] = "                                </div>\n"
    lines[1960] = "                            );\n"
    lines[1961] = "                        })}\n"
    # Delete the extra lines if needed, but it seems I replaced exactly
    # Wait, the view_file output showed line numbers.
    # 1959: </div>
    # 1960: )}
    # 1961: </div>
    # 1962: );
    # 1963: })}
    # This means lines[1958] is 1959.
    lines[1959] = "                                </div>\n"
    lines[1960] = "                            );\n"
    lines[1961] = "                        })}\n"
    # The original was 3 lines: </div>, );, })}.
    # Now it is 4 lines. I need to make it 3 lines again.
    del lines[1962]

# Fix end of file (2289 area)
# Current end:
# 2290:             )}
# 2291:             )}
# 2292:         </div>
# 2293:     );
# 2294: }
# Correct end for 2252 showPreChatRecordModal:
# 2289:                 </div>
# 2290:             )}
# 2291:         </div>
# 2292:     );
# 2293: }
# Let's just fix it by matching the end blocks.
new_content = "".join(lines)
new_content = re.sub(
    r"\s*}\)\s*}\)\s*</div>\s*\);\s*}\s*$",
    "\n            )}\n        </div>\n    );\n}\n",
    new_content
)

with open(r"d:\antigravity\stepupvoca\app\src\LiveChatScreen.tsx", "w", encoding="utf-8") as f:
    f.write(new_content)
print("Manually repaired LiveChatScreen.tsx")
