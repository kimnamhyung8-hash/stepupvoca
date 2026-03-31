import os
import re

def robust_brace_fix(path):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Fix patterns like onClick={() => { ... } 
    # This regex looks for { followed by () => { and some content, but only ONE closing } before the next attribute or tag end
    # Actually, let's just target the specific known ones.
    
    # ConversationScreens.tsx specific
    if "ConversationScreens" in path:
        # Fix 1797 and 1801
        content = re.sub(
            r"(onClick=\{\(\) => \{\s*stop\(\);\s*setIsListening\(false\);\s*)\}(?!\})",
            r"\1}}",
            content
        )
    
    # LiveChatScreen.tsx specific
    if "LiveChatScreen" in path:
        # Fix 1832 area (Cancel button in Incoming Request or Matching)
        content = re.sub(
            r"(onClick=\{\(\) => \{\s*stopActualRecording\(\);\s*setRecordingStatus\('idle'\);\s*)\}(?!\})",
            r"\1}}",
            content
        )
        # Fix 1891 area
        content = re.sub(
            r"(onClick=\{\(e\) => \{\s*e\.stopPropagation\(\);\s*handleSpeak\(msg\.translatedEn\);\s*)\}(?!\})",
            r"\1}}",
            content
        )
        # Fix 1915 area
        content = re.sub(
            r"(onClick=\{\(e\) => \{\s*e\.stopPropagation\(\);\s*handleSpeak\(msg\.translatedEn \|\| msg\.text\);\s*)\}(?!\})",
            r"\1}}",
            content
        )
        # Fix any others with similar pattern
        content = re.sub(r"(setShowRecordings\(false\);\s*)\}(?!\})", r"\1}}", content)
        
        # Finally ensure the end of file is clean
        content = re.sub(r"\s*}\)\s*\}\)\s*</div>\s*\);\s*}\s*$", "\n            )}\n        </div>\n    );\n}\n", content)
        content = re.sub(r"\s*}\)\s*</div>\s*\);\s*}\s*$", "\n            )}\n        </div>\n    );\n}\n", content)

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

robust_brace_fix(r"d:\antigravity\stepupvoca\app\src\ConversationScreens.tsx")
robust_brace_fix(r"d:\antigravity\stepupvoca\app\src\LiveChatScreen.tsx")

print("Robustly fixed both files.")
