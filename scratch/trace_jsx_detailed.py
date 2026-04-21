import sys
import re

path = '/Users/admin/Downloads/ai-sre-console_v2/src/App.tsx'
with open(path, 'r') as f:
    lines = f.readlines()

stack = []
for i, line in enumerate(lines):
    if i < 3084: continue
    if i > 3215: break
    
    # Matching <div but not self-closing <div ... />
    opens = re.findall(r'<div(?![^>]*/>)', line)
    closes = re.findall(r'</div', line)
    
    for _ in opens:
        stack.append(i + 1)
    for _ in closes:
        if stack:
            stack.pop()
        else:
            print(f"ERROR: Extra close at line {i+1}")
            
    if stack:
        print(f"Line {i+1}: Stack size {len(stack)}, deepest open from line {stack[0]}")
    else:
        print(f"Line {i+1}: Stack EMPTY")

print(f"Final unclosed lines: {stack}")
