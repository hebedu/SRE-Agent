import json

jsonl_path = '/Users/admin/Downloads/SRE-Agent-main/scratch/yesterday_replaces.jsonl'

# 收集相关的 step 列表
target_steps = [737, 775, 777, 795, 859, 883, 893, 961, 967, 1141, 1157, 1161, 1173, 1207, 1231, 1235, 1279, 1283, 1311]

# 从 jsonl 加载它们的数据
steps_data = {}
with open(jsonl_path, 'r', encoding='utf-8') as f:
    for line in f:
        if not line.strip():
            continue
        try:
            data = json.loads(line)
            step_idx = data.get('step_index')
            if step_idx in target_steps:
                tool_calls = data.get('tool_calls', [])
                for tc in tool_calls:
                    if tc.get('name') == 'replace_file_content':
                        args = tc.get('args', {})
                        steps_data[step_idx] = {
                            'desc': args.get('Description'),
                            'target': args.get('TargetContent'),
                            'replacement': args.get('ReplacementContent')
                        }
        except:
            pass

# 从 Step 737 开始作为初始的组件代码
if 737 not in steps_data:
    print("Step 737 (initial component code) not found in JSONL!")
    exit(1)

# 注意，Step 737 在 App.tsx 中是在 DiagnosticReportDrawer 之前插入这两个组件，
# 所以它的 ReplacementContent 里除了两个组件定义外，还有原来的 DiagnosticReportDrawer 部分。
# 我们需要从它的 ReplacementContent 中截取我们关心的组件部分，或者把整个 ReplacementContent 作为一个文本，在它上面应用修改。
# 我们先看 Step 737 的 ReplacementContent
initial_text = steps_data[737]['replacement']

print(f"Step 737 length: {len(initial_text)}")

current_text = initial_text

# 依次应用其他步骤的替换
for step_idx in sorted(target_steps):
    if step_idx == 737:
        continue
    if step_idx not in steps_data:
        print(f"Step {step_idx} details not found in JSONL!")
        continue
    
    step = steps_data[step_idx]
    target = step['target']
    replacement = step['replacement']
    
    # 尝试在 current_text 中进行替换
    if target in current_text:
        current_text = current_text.replace(target, replacement)
        print(f"Step {step_idx} applied successfully: {step['desc']}")
    else:
        # 如果不完全匹配，可能是因为 target string 里有空格、缩进或者换行的不一致，或者前面的修改改变了它
        # 我们进行不区分空白符的 fuzzy replace 或是分析为什么不匹配
        # 这里先尝试做普通替换，看有几个会失败
        print(f"Step {step_idx} FAILED to apply: {step['desc']}")
        # 我们可以打印出这一步的 target 和当前的 current_text 以做诊断
        # 我们还可以尝试去除空格/换行的比对
        # 比如：我们把 \r\n 换成 \n
        target_norm = target.replace('\r\n', '\n')
        current_norm = current_text.replace('\r\n', '\n')
        if target_norm in current_norm:
            current_norm = current_norm.replace(target_norm, replacement.replace('\r\n', '\n'))
            current_text = current_norm
            print(f"Step {step_idx} applied successfully with normalization!")
        else:
            # 记录失败详情
            print("--- Target Sample ---")
            print(target[:200])
            print("--- Current Text Contains Drawer? ---")
            print("InspectionPlanDetailDrawer" in current_text)

# 保存最终的组件合并文件
with open('/Users/admin/Downloads/SRE-Agent-main/scratch/rebuilt_components.tsx', 'w', encoding='utf-8') as f:
    f.write(current_text)

print("Rebuilt component file saved to scratch/rebuilt_components.tsx")
