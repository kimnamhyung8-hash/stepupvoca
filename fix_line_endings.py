import os

files = [
    r'd:\antigravity\stepupvoca\app\src\AdminScreens.tsx',
    r'd:\antigravity\stepupvoca\app\src\screens\StoreScreen.tsx'
]

for path in files:
    if os.path.exists(path):
        with open(path, 'rb') as f:
            data = f.read()
        
        # Normalize line endings
        data = data.replace(b'\r\n', b'\n')
        data = data.replace(b'\r', b'\n')
        
        with open(path, 'wb') as f:
            f.write(data)
        print(f"Fixed line endings in {path}")
    else:
        print(f"File not found: {path}")
