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

# 1. ConversationScreens.tsx 1801
flexible_fix(
    r"d:\antigravity\stepupvoca\app\src\ConversationScreens.tsx",
    r"stop\(\);\s*setIsListening\(false\);\s*\}",
    "stop(); setIsListening(false); }}"
)

# 2. LiveChatScreen.tsx end of file
# Current end:
#         </div>
#     );
# }
# Needs:
#             )}
#         </div>
#     );
# }
flexible_fix(
    r"d:\antigravity\stepupvoca\app\src\LiveChatScreen.tsx",
    r"\s*</div>\s*\r?\n\s*\);\s*\r?\n\s*\}",
    "\n            )}\n        </div>\n    );\n}"
)
