import os
import re

# Final-Final Repair
with open(r"d:\antigravity\stepupvoca\app\src\ConversationScreens.tsx", "r", encoding="utf-8") as f:
    cs_content = f.read()

# Fix 1347 and 1586 and 1801 and 1797... let's be VERY specific.
# Line 1586: if (isListening) { stop(); setIsListening(false); }
cs_content = re.sub(r"if \(isListening\) \{\s*stop\(\);\s*setIsListening\(false\);\s*\}\}", "if (isListening) { stop(); setIsListening(false); }", cs_content)
# Line 1347: if (isListening) { stop(); setIsListening(false); }
cs_content = re.sub(r"if \(isListening\) \{\s*stop\(\);\s*setIsListening\(false\);\s*\}\}", "if (isListening) { stop(); setIsListening(false); }", cs_content)

with open(r"d:\antigravity\stepupvoca\app\src\ConversationScreens.tsx", "w", encoding="utf-8") as f:
    f.write(cs_content)

with open(r"d:\antigravity\stepupvoca\app\src\LiveChatScreen.tsx", "r", encoding="utf-8") as f:
    lc_content = f.read()

# Fix 1240
lc_content = lc_content.replace(
    "setRecordingStatus('idle'); } }",
    "setRecordingStatus('idle'); }"
)

# Fix 2290
lc_content = re.sub(r"\s*}\)\s*}\)\s*</div>\s*\);\s*}\s*$", "\n            )}\n        </div>\n    );\n}\n", lc_content)

with open(r"d:\antigravity\stepupvoca\app\src\LiveChatScreen.tsx", "w", encoding="utf-8") as f:
    f.write(lc_content)

print("Repaired both files.")
