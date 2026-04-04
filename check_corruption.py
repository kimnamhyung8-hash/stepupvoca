
import os

files = [
    r'd:\antigravity\stepupvoca\app\src\AdminScreens.tsx',
    r'd:\antigravity\stepupvoca\app\src\screens\StoreScreen.tsx',
    r'd:\antigravity\stepupvoca\app\src\LiveChatScreen.tsx'
]

for f_path in files:
    if not os.path.exists(f_path):
        print(f"{f_path} not found")
        continue
    
    with open(f_path, 'rb') as f:
        data = f.read()
    
    print(f"File: {f_path}")
    print(f"Size: {len(data)} bytes")
    print(f"Null bytes: {data.count(b'\0')}")
    print(f"CR count: {data.count(b'\r')}")
    print(f"LF count: {data.count(b'\n')}")
    
    # Check for \r\r\n
    print(f"CRCRLF count: {data.count(b'\r\r\n')}")
    
    # Try decoding as utf-8 and count lines
    try:
        text = data.decode('utf-8', errors='replace')
        lines = text.split('\n')
        print(f"Lines (split by \\n): {len(lines)}")
        if len(lines) > 0:
            print(f"Last 5 lines preview:")
            for l in lines[-5:]:
                print(f"  {repr(l)}")
    except Exception as e:
        print(f"Decode error: {e}")
    print("-" * 40)
