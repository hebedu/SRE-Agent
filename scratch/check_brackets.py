with open('/Users/admin/Downloads/SRE-Agent-main/src/App.tsx', 'r') as f:
    lines = f.readlines()

depth = 0
for idx, line in enumerate(lines[:3200]):
    line_num = idx + 1
    if line_num < 2700:
        # 跟踪前面的大括号
        for char in line:
            if char == '{': depth += 1
            elif char == '}': depth -= 1
        continue
        
    old_depth = depth
    for char in line:
        if char == '{': depth += 1
        elif char == '}': depth -= 1
    
    if depth != old_depth:
        print(f"Line {line_num}: depth changed from {old_depth} to {depth} | {line.strip()[:60]}")
