import os

# Final Final Final Final Final Fix
lc_path = r"d:\antigravity\stepupvoca\app\src\LiveChatScreen.tsx"

with open(lc_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix the 2051 issue
content = content.replace("            )}}", "            )}")

# Ensure no hidden extra braces at the end
# 2282: );
# 2283: }
# Let's count depth one more time locally
opened = content.count('{')
closed = content.count('}')
print(f"Final Count for LC: {{={opened}, }}={closed}, Diff={opened-closed}")

with open(lc_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Absolute final fix done.")
