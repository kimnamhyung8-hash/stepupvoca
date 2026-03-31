import re

def find_double_braces(path):
    with open(path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    for i, line in enumerate(lines):
        if "}}" in line:
            print(f"{i+1}: {line.strip()}")

print("--- ConversationScreens.tsx ---")
find_double_braces(r"d:\antigravity\stepupvoca\app\src\ConversationScreens.tsx")
print("\n--- LiveChatScreen.tsx ---")
find_double_braces(r"d:\antigravity\stepupvoca\app\src\LiveChatScreen.tsx")
