
f_path = r'd:\antigravity\stepupvoca\app\src\LiveChatScreen.tsx'
with open(f_path, 'rb') as f:
    lines = f.readlines()

start = 2620
end = 2660

for i in range(start-1, min(len(lines), end)):
    line = lines[i]
    # Print line number and the line as string, replacing unprintable chars
    s = ""
    for b in line:
        if b < 32 or b > 126:
            if b == ord('\n'): s += "\\n"
            elif b == ord('\r'): s += "\\r"
            else: s += f"<{b:02x}>"
        else:
            s += chr(b)
    print(f"{i+1:4}: {s}")
