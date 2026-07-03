import json
import os

jsonl_path = '/Users/admin/Downloads/SRE-Agent-main/scratch/yesterday_replaces.jsonl'

with open(jsonl_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

def find_replacement_by_step(step_idx):
    for line in lines:
        if not line.strip():
            continue
        try:
            data = json.loads(line)
            if data.get('step_index') == step_idx:
                tool_calls = data.get('tool_calls', [])
                for tc in tool_calls:
                    if tc.get('name') == 'replace_file_content':
                        return tc.get('args', {}).get('ReplacementContent', '')
        except Exception as e:
            pass
    return None

def write_formatted(step_idx, filename):
    content = find_replacement_by_step(step_idx)
    if content:
        # 如果 content 本身是被 python 反序列化得到的，直接写入就是正常文本
        # 但如果是从 json 原始文件中提取的，可能含有 \\n 等，我们需要把它写入后是正常文本。
        # 由于 json.loads 已经对 yesterday_replaces.jsonl 进行了 loads，所以 content 已经是 normal string
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Saved and formatted step {step_idx} to {filename}")

# 1. 提取 Step 883 (包含了 InspectionPlanDetailDrawer 和 safeClonePlan 的完整定义)
write_formatted(883, '/Users/admin/Downloads/SRE-Agent-main/scratch/step_883_formatted.tsx')

# 2. 提取 Step 893 (包含了 InspectionTaskEditModal)
write_formatted(893, '/Users/admin/Downloads/SRE-Agent-main/scratch/step_893_formatted.tsx')

# 3. 提取 Step 1669 (重写的 MySQLTaskEditListCard 组件)
write_formatted(1669, '/Users/admin/Downloads/SRE-Agent-main/scratch/step_1669_formatted.tsx')

# 4. 提取 Step 1735 (注入 MySQLTaskEditListCard 组件定义)
write_formatted(1735, '/Users/admin/Downloads/SRE-Agent-main/scratch/step_1735_formatted.tsx')
