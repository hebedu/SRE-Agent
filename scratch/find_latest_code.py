import json

jsonl_path = '/Users/admin/Downloads/SRE-Agent-main/scratch/yesterday_replaces.jsonl'

with open(jsonl_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Total lines in JSONL: {len(lines)}")

# 我们按 step_index 从后往前找，找包含 InspectionPlanDetailDrawer 核心渲染逻辑的替换
found_drawer = False
found_modal = False

for line in reversed(lines):
    if not line.strip():
        continue
    try:
        data = json.loads(line)
        tool_calls = data.get('tool_calls', [])
        for tc in tool_calls:
            if tc.get('name') == 'replace_file_content':
                args = tc.get('args', {})
                replacement = args.get('ReplacementContent', '')
                
                # 寻找包含 InspectionPlanDetailDrawerProps 且包含实际组件逻辑（如 w-[45%]）的最晚一个 replace_file_content
                if not found_drawer and 'InspectionPlanDetailDrawerProps' in replacement and 'w-[45%]' in replacement:
                    print(f"Found Drawer in step {data.get('step_index')} at {data.get('created_at')}")
                    print(f"Description: {args.get('Description')}")
                    with open('/Users/admin/Downloads/SRE-Agent-main/scratch/extracted_drawer.txt', 'w') as out:
                        out.write(replacement)
                    print("Saved to scratch/extracted_drawer.txt")
                    found_drawer = True
                
                # 寻找包含 InspectionTaskEditModalProps 且包含实际组件逻辑（如 Code size 或 编辑巡检任务）的最晚一个 replace_file_content
                if not found_modal and 'InspectionTaskEditModalProps' in replacement:
                    print(f"Found Modal in step {data.get('step_index')} at {data.get('created_at')}")
                    print(f"Description: {args.get('Description')}")
                    with open('/Users/admin/Downloads/SRE-Agent-main/scratch/extracted_modal.txt', 'w') as out:
                        out.write(replacement)
                    print("Saved to scratch/extracted_modal.txt")
                    found_modal = True
                    
        if found_drawer and found_modal:
            break
    except Exception as e:
        pass
