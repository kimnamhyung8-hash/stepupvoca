import os
import re

root_dir = r"d:\antigravity\stepupvoca\app\src"

def final_polish(file_path):
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
    
    original = content
    
    # Fix extra braces in attributes
    content = content.replace("disabled={loading}}", "disabled={loading}")
    content = content.replace("loading={loading}}", "loading={loading}")
    content = content.replace("}} }", "}}")
    content = content.replace("}}}", "}}")
    
    # Specific fix for StudyModeScreen/ReviewScreen if any triple braces left
    # But I rewrote them, so it's fine.
    
    # Fix for AdminScreens toggleSelectAll
    content = content.replace("toggleSelectAll(); }", "toggleSelectAll(); }}")
    # Avoid quadruple braces if it was already fixed
    content = content.replace("toggleSelectAll(); }}}}", "toggleSelectAll(); }}")
    content = content.replace("toggleSelectAll(); }}}", "toggleSelectAll(); }}")

    if content != original:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)

for root, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith(".tsx"):
            final_polish(os.path.join(root, file))

print("Final polish completed.")
