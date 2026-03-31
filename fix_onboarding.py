import os

# Robust fix for OnboardingScreen.tsx
path = r"d:\antigravity\stepupvoca\app\src\screens\OnboardingScreen.tsx"

with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    # Fix typo
    if "setSelectedOptiot" in line:
        lines[i] = line.replace("setSelectedOptiot", "setSelectedOption")
    
    # Fix the missing sync logic
    if "if (firebaseUser?.uid) {" in line and (i+1 < len(lines) and "// Re-implement" in lines[i+1]):
        # Find the closing bracket of this IF block
        j = i + 1
        while j < len(lines) and "}" not in lines[j]:
            j += 1
        
        # Replace the whole block
        indent = line[:line.find("if")]
        new_block = [
            f"{line}",
            f"{indent}    await upsertUser(firebaseUser.uid, {{ ...finalUserInfo, points: userPoints, equippedSkin, lang }});\n",
            f"{indent}}}\n"
        ]
        # Skip original lines until j
        lines[i:j+1] = new_block

with open(path, "w", encoding="utf-8") as f:
    f.writelines(lines)

print("OnboardingScreen.tsx fixed.")
