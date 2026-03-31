import os

# Final-Final-Final Repair
lc_path = r"d:\antigravity\stepupvoca\app\src\LiveChatScreen.tsx"

with open(lc_path, "r", encoding="utf-8") as f:
    content = f.read()

import re
# Correct the end structure
# Target the specific mess at the end:
#             )}
#             )}
#         </div>
#     );
# }
new_content = re.sub(
    r"\s*}\)\s*}\)\s*</div>\s*\);\s*}\s*$",
    "\n            )}\n        </div>\n    );\n}\n",
    content
)

# Also fix the 1832 issue if still exists
new_content = new_content.replace(
    "stopActualRecording(); setRecordingStatus('idle'); }",
    "stopActualRecording(); setRecordingStatus('idle'); } }"
)

with open(lc_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Final repair for LiveChatScreen.tsx done.")
