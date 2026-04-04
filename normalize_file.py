
import os

f_path = r'd:\antigravity\stepupvoca\app\src\LiveChatScreen.tsx'

if os.path.exists(f_path):
    with open(f_path, 'rb') as f:
        content = f.read()
    
    # Normalize: Replace \r\n with \n, then stray \r with \n
    normalized = content.replace(b'\r\n', b'\n').replace(b'\r', b'\n')
    
    with open(f_path, 'wb') as f:
        f.write(normalized)
    print(f"Normalized {f_path}")
else:
    print(f"File not found: {f_path}")
