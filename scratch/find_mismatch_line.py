import sys

path = '/Users/admin/Downloads/ai-sre-console_v2/src/App.tsx'
with open(path, 'r') as f:
    lines = f.readlines()

stack = []
for i, line in enumerate(lines):
    if i < 3083: continue
    if i > 3215: break
    
    # Simple tag finder (ignores strings/comments for now, which might be the issue)
    content = line.strip()
    
    # Find all <div and </div
    import re
    opens = re.findall(r'<div(?![^>]*/>)', line)
    closes = re.findall(r'</div', line)
    
    for _ in opens:
        stack.append(i+1)
    for _ in closes:
        if stack:
            stack.pop()
        else:
            print(f"Extra closing div at line {i+1}")

print(f"Open tags at the end: {stack}")
