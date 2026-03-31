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

# 1. LiveChatScreen.tsx 1240 (extra brace)
flexible_fix(
    r"d:\antigravity\stepupvoca\app\src\LiveChatScreen.tsx",
    r"setRecordingStatus\('idle'\);\s*\}\s*\}\s*\n\s*\};",
    "setRecordingStatus('idle'); }\n    };"
)

# 2. LiveChatScreen.tsx end of file (fixing the mess I made)
with open(r"d:\antigravity\stepupvoca\app\src\LiveChatScreen.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Match the logic exactly from 2252 showPreChatRecordModal onwards
# We need to find the REAL end of the function body.
pattern_end = r"\{showPreChatRecordModal && \([\s\S]*?\)\s*\}\s*</div>\s*\r?\n\s*\);\s*\r?\n\s*\}"
# But wait, my previous failed fix might have already changed this.
# Let's just target the LAST few lines.
new_content = re.sub(
    r"\s*}\)\s*}\)\s*</div>\s*\);\s*}\s*$",
    "\n            )}\n        </div>\n    );\n}\n",
    content
)
if content == new_content:
    # Try another pattern if the first one failed
    new_content = re.sub(
        r"}\)\s*</div>\s*\);\s*}\s*$",
        "\n            )}\n        </div>\n    );\n}\n",
        content
    )

with open(r"d:\antigravity\stepupvoca\app\src\LiveChatScreen.tsx", "w", encoding="utf-8") as f:
    f.write(new_content)

# 3. ConversationScreens.tsx end check
# There was an error at 1832. Let's see if there are too many or too few.
# It looked like:
# 1829:             </div>
# 1830:         </div>
# 1831:     );
# 1832: }
# This is correct if it was 2 levels deep.
# Level 1: <div class="screen"> (1346)
# Level 2 (NOT THERE?): 1345 return ( NO DIV?
# Wait!
# 1339:         <div className="fixed inset-0 ...">
# So Level 1 is <div className="fixed ...">.
# Level 2 IS </div> at 1830.
# Wait! 1829 is Level 3?
# Let's check 1815-1830 of ConversationScreens.tsx.
