import os
import re

# Final cleanup for LiveChatScreen.tsx
with open(r"d:\antigravity\stepupvoca\app\src\LiveChatScreen.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Fix 1240 extra brace
content = content.replace("setRecordingStatus('idle'); } }", "setRecordingStatus('idle'); }")

# 2. Fix 2290 extra brace
# Search for )} )} </div> ); } at the end
content = re.sub(r"\s*}\)\s*}\)\s*</div>\s*\);\s*}\s*$", "\n            )}\n        </div>\n    );\n}\n", content)

with open(r"d:\antigravity\stepupvoca\app\src\LiveChatScreen.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Cleaned LiveChatScreen.tsx")
