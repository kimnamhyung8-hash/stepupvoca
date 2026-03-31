import os
import re

def find_mismatch_v3(path):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Remove comments completely
    content = re.sub(r'//.*', '', content)
    content = re.sub(r'/\*[\s\S]*?\*/', '', content)
    
    # Remove strings carefully
    # Use a placeholder to avoid empty lines affecting count if needed
    content = re.sub(r'`[\s\S]*?`', '""', content)
    content = re.sub(r'"[^"\\]*(?:\\.[^"\\]*)*"', '""', content)
    content = re.sub(r"'[^'\\]*(?:\\.[^'\\]*)*'", "''", content)
    
    lines = content.split('\n')
    depth = 0
    for i, line in enumerate(lines):
        for j, char in enumerate(line):
            if char == '{':
                depth += 1
            elif char == '}':
                depth -= 1
                if depth < 0:
                    print(f"ERROR: Extra }} at {path}:{i+1}:{j+1}")
                    depth = 0
    print(f"Final depth for {path}: {depth}")

find_mismatch_v3(r"d:\antigravity\stepupvoca\app\src\ConversationScreens.tsx")
find_mismatch_v3(r"d:\antigravity\stepupvoca\app\src\LiveChatScreen.tsx")
