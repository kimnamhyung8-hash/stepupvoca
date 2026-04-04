
f_path = r'd:\antigravity\stepupvoca\app\src\LiveChatScreen.tsx'
with open(f_path, 'rb') as f:
    lines = f.readlines()

def print_hex_line(ln_num):
    if 1 <= ln_num <= len(lines):
        line = lines[ln_num-1]
        print(f"Line {ln_num}: {repr(line)}")
        print(f"Hex: {line.hex(' ')}")

print_hex_line(2630)
print_hex_line(2631)
print_hex_line(2654)
