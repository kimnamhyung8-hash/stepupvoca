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

# 1. MyPhraseScreen triple brace
flexible_fix(
    r"d:\antigravity\stepupvoca\app\src\MyPhraseScreen.tsx",
    r"setTranslated\(null\);\s*\}\}\}",
    "setTranslated(null); }}"
)

# 2. ArcadeScreen missing braces (GAME1)
flexible_fix(
    r"d:\antigravity\stepupvoca\app\src\ArcadeScreen.tsx",
    r"setGameState\('GAME1'\);\s*\}",
    "setGameState('GAME1'); }}"
)

# 3. ArcadeScreen missing braces (GAME2)
flexible_fix(
    r"d:\antigravity\stepupvoca\app\src\ArcadeScreen.tsx",
    r"setGameState\('GAME2'\);\s*\}",
    "setGameState('GAME2'); }}"
)

# 4. ArcadeScreen missing braces (MENU)
flexible_fix(
    r"d:\antigravity\stepupvoca\app\src\ArcadeScreen.tsx",
    r"setGameState\('MENU'\);\s*\}",
    "setGameState('MENU'); }}"
)

# 5. AdminScreens.tsx 3096
flexible_fix(
    r"d:\antigravity\stepupvoca\app\src\AdminScreens.tsx",
    r"disabled=\{isLoading\}\}",
    "disabled={isLoading}"
)
