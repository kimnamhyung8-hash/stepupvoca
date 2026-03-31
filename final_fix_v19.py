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

# 1. ConversationScreens.tsx 938
flexible_fix(
    r"d:\antigravity\stepupvoca\app\src\ConversationScreens.tsx",
    r"stopTTS\(\);\s*onClose\(\);\s*\}",
    "stopTTS(); onClose(); }}"
)

# 2. LiveChatScreen.tsx 1891 (there was msg.translatedEn without OR)
flexible_fix(
    r"d:\antigravity\stepupvoca\app\src\LiveChatScreen.tsx",
    r"handleSpeak\(msg\.translatedEn\);\s*\}",
    "handleSpeak(msg.translatedEn); } }"
)
