import os

def check_braces(path):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Remove string literals and comments to avoid false hits
    # Simple version: remove backtick strings, single quotes, double quotes
    content = re.sub(r'`[\s\S]*?`', '', content)
    content = re.sub(r'"[\s\S]*?"', '', content)
    content = re.sub(r"'[\s\S]*?'", '', content)
    content = re.sub(r'//.*', '', content)
    content = re.sub(r'/\*[\s\S]*?\*/', '', content)
    
    opened = content.count('{')
    closed = content.count('}')
    print(f"{os.path.basename(path)}: {{ = {opened}, }} = {closed}, Diff = {opened - closed}")

import re
check_braces(r"d:\antigravity\stepupvoca\app\src\ConversationScreens.tsx")
check_braces(r"d:\antigravity\stepupvoca\app\src\LiveChatScreen.tsx")

# 1. Fix LiveChatScreen.tsx 1832
with open(r"d:\antigravity\stepupvoca\app\src\LiveChatScreen.tsx", "r", encoding="utf-8") as f:
    lc_content = f.read()

# Pattern for 1832: setRecordingStatus('idle'); }
# Needs: setRecordingStatus('idle'); } }
lc_content = lc_content.replace(
    "stopActualRecording(); setRecordingStatus('idle'); }",
    "stopActualRecording(); setRecordingStatus('idle'); } }"
)

with open(r"d:\antigravity\stepupvoca\app\src\LiveChatScreen.tsx", "w", encoding="utf-8") as f:
    f.write(lc_content)
