import json
import os

app_path = '/Users/admin/Downloads/SRE-Agent-main/src/App.tsx'
log_path = '/Users/admin/.gemini/antigravity/brain/3b6aa547-3177-43b6-a678-6e8c730e05fb/.system_generated/logs/transcript_full.jsonl'

# 1. 确保读取的是最干净的 checkout 版本作为起点
os.system('git checkout src/App.tsx')

with open(app_path, 'r', encoding='utf-8') as f:
    current_content = f.read()

content_lines = current_content.splitlines()
print(f"Initial clean App.tsx size: {len(current_content)} chars, lines: {len(content_lines)}")

# 2. 提取所有对 App.tsx 的 replaces 动作
replaces = []
with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        if not line.strip():
            continue
        try:
            step = json.loads(line)
            step_idx = step.get('step_index')
            for tc in step.get('tool_calls', []):
                name = tc.get('name')
                if name in ('replace_file_content', 'multi_replace_file_content'):
                    args = tc.get('args', {})
                    if 'App.tsx' in args.get('TargetFile', ''):
                        replaces.append({
                            'step': step_idx,
                            'tool': name,
                            'args': args
                        })
        except Exception as e:
            pass

# 3. 按 step_index 排序
replaces.sort(key=lambda x: x['step'])
print(f"Total SRE replace transactions to execute: {len(replaces)}")

def locate_and_replace(content_lines, target, replacement, start_line, end_line):
    n = len(content_lines)
    win_start = max(0, start_line - 150)
    win_end = min(n, end_line + 150)
    
    sub_lines = content_lines[win_start:win_end]
    sub_content = "\n".join(sub_lines)
    
    if target in sub_content:
        new_sub = sub_content.replace(target, replacement, 1)
        new_lines = new_sub.split("\n")
        content_lines[win_start:win_end] = new_lines
        return True
    
    win_start = max(0, start_line - 300)
    win_end = min(n, end_line + 300)
    sub_lines = content_lines[win_start:win_end]
    sub_content = "\n".join(sub_lines)
    
    if target in sub_content:
        new_sub = sub_content.replace(target, replacement, 1)
        new_lines = new_sub.split("\n")
        content_lines[win_start:win_end] = new_lines
        return True
        
    full_content = "\n".join(content_lines)
    if target in full_content:
        if full_content.count(target) == 1 or len(target) > 15:
            new_full = full_content.replace(target, replacement, 1)
            content_lines[:] = new_full.split("\n")
            return True
            
    return False

success_count = 0
failed_steps = []

# 4. 依次重放
for r in replaces:
    tool = r['tool']
    args = r['args']
    idx = r['step']
    desc = args.get('Description', args.get('Instruction', ''))
    
    chunks = []
    if tool == 'replace_file_content':
        target = args.get('TargetContent')
        replacement = args.get('ReplacementContent')
        start = args.get('StartLine', 1)
        end = args.get('EndLine', len(content_lines))
        if target and replacement is not None:
            chunks.append((target, replacement, start, end))
    elif tool == 'multi_replace_file_content':
        for chunk in args.get('ReplacementChunks', []):
            target = chunk.get('TargetContent')
            replacement = chunk.get('ReplacementContent')
            start = chunk.get('StartLine', 1)
            end = chunk.get('EndLine', len(content_lines))
            if target and replacement is not None:
                chunks.append((target, replacement, start, end))
                
    step_ok = True
    temp_lines = list(content_lines)
    for target, replacement, start, end in chunks:
        if not locate_and_replace(temp_lines, target, replacement, start, end):
            step_ok = False
            break
            
    if step_ok:
        content_lines = temp_lines
        success_count += 1
    else:
        failed_steps.append(r)

print(f"Successfully replayed {success_count}/{len(replaces)} transactions.")

# 5. 写回
with open(app_path, 'w', encoding='utf-8') as f:
    f.write("\n".join(content_lines))
    
print(f"Reconstructed App.tsx lines: {len(content_lines)}")
