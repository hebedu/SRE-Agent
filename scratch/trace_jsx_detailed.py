import re

path = '/Users/admin/Downloads/SRE-Agent-main/src/App.tsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

stack = []
for idx, line in enumerate(lines):
    line_num = idx + 1
    # 忽略注释和字符串以减少噪点（极简处理）
    # 去除单行注释
    clean_line = re.sub(r'//.*$', '', line)
    
    # 检查大括号
    for char in clean_line:
        if char == '{':
            stack.append(line_num)
        elif char == '}':
            if stack:
                stack.pop()
            else:
                print(f"Extra closing brace at line {line_num}")

    # 如果到了 7547 行
    if line_num == 7547:
        print(f"Brace depth at line 7547: {len(stack)}")
        if stack:
            print("Unclosed braces opened at lines:")
            # 打印最深的前 10 个 unclosed
            for opened in stack[-10:]:
                print(f"  Line {opened}: {lines[opened-1].strip()[:60]}")
        break
