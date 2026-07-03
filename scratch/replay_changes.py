import json
import os

app_path = '/Users/admin/Downloads/SRE-Agent-main/src/App.tsx'
jsonl_path = '/Users/admin/Downloads/SRE-Agent-main/scratch/yesterday_replaces.jsonl'

# 备份当前的 App.tsx
backup_path = app_path + '.bak'
if not os.path.exists(backup_path):
    with open(app_path, 'r', encoding='utf-8') as f:
        original_content = f.read()
    with open(backup_path, 'w', encoding='utf-8') as f:
        f.write(original_content)
    print(f"Backed up App.tsx to {backup_path}")
else:
    with open(backup_path, 'r', encoding='utf-8') as f:
        original_content = f.read()
    print(f"Loaded original content from backup {backup_path}")

current_content = original_content

# 提取昨天的所有修改
steps = []
with open(jsonl_path, 'r', encoding='utf-8') as f:
    for line in f:
        if not line.strip():
            continue
        try:
            data = json.loads(line)
            step_idx = data.get('step_index', 0)
            tool_calls = data.get('tool_calls', [])
            for tc in tool_calls:
                if tc.get('name') == 'replace_file_content':
                    args = tc.get('args', {})
                    # 匹配 TargetFile
                    target_file = args.get('TargetFile', '')
                    if 'App.tsx' in target_file:
                        steps.append({
                            'step_index': step_idx,
                            'created_at': data.get('created_at', ''),
                            'description': args.get('Description', ''),
                            'target': args.get('TargetContent', ''),
                            'replacement': args.get('ReplacementContent', '')
                        })
        except Exception as e:
            pass

# 按 step_index 升序排序
steps.sort(key=lambda x: x['step_index'])
print(f"Total steps to apply: {len(steps)}")

success_count = 0
failed_steps = []

for step in steps:
    target = step['target']
    replacement = step['replacement']
    desc = step['description']
    idx = step['step_index']
    
    # 尝试在当前内容中匹配并替换
    if target in current_content:
        current_content = current_content.replace(target, replacement)
        print(f"Step {idx} applied: {desc[:50]}")
        success_count += 1
    else:
        # 如果不完全匹配，可能是因为之前的修改已经影响了这一部分，或者空格/换行微调
        # 我们这里先记录失败
        failed_steps.append(step)

print(f"Successfully applied {success_count}/{len(steps)} steps.")

if failed_steps:
    print(f"Failed steps: {len(failed_steps)}")
    # 保存剩余未应用成功的步骤，方便我们排查
    with open('/Users/admin/Downloads/SRE-Agent-main/scratch/failed_steps.json', 'w', encoding='utf-8') as f:
        json.dump(failed_steps, f, indent=2, ensure_ascii=False)
    print("Saved failed steps details to scratch/failed_steps.json")

# 将最终内容写回 App.tsx 
with open(app_path, 'w', encoding='utf-8') as f:
    f.write(current_content)
print("Updated App.tsx with replayed changes.")
