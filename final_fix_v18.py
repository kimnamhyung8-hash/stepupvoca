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

# 1. DailyGuidePopup.tsx 54
flexible_fix(
    r"d:\antigravity\stepupvoca\app\src\components\DailyGuidePopup.tsx",
    r"onClose\(\);\s*\}",
    "onClose(); }}"
)

# 2. LiveChatScreen.tsx 1729 (triple brace needed for if(confirm) { if(activeRoom) { ... } })
# Wait, 1729: { if (confirm(...)) { if (activeRoom) ...; handleCancelMatching(); } }
# It has 3 nested blocks: () => { ... if(...) { ... if(...) { ... } } }
# So it needs 3 closing braces.
flexible_fix(
    r"d:\antigravity\stepupvoca\app\src\LiveChatScreen.tsx",
    r"handleCancelMatching\(\);\s*\}\s*\}",
    "handleCancelMatching(); } } }"
)

# 3. LiveChatScreen.tsx 1832
flexible_fix(
    r"d:\antigravity\stepupvoca\app\src\LiveChatScreen.tsx",
    r"setRecordingStatus\('idle'\);\s*\}",
    "setRecordingStatus('idle'); } }"
)

# 4. LiveChatScreen.tsx 1915
flexible_fix(
    r"d:\antigravity\stepupvoca\app\src\LiveChatScreen.tsx",
    r"handleSpeak\(msg\.translatedEn \|\| msg\.text\);\s*\}",
    "handleSpeak(msg.translatedEn || msg.text); } }"
)

# 5. LiveChatScreen.tsx 2065
flexible_fix(
    r"d:\antigravity\stepupvoca\app\src\LiveChatScreen.tsx",
    r"setShowRecordings\(false\);\s*\}",
    "setShowRecordings(false); } }"
)
