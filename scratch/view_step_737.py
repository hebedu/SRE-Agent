import json

jsonl_path = '/Users/admin/Downloads/SRE-Agent-main/scratch/yesterday_replaces.jsonl'

with open(jsonl_path, 'r', encoding='utf-8') as f:
    for line in f:
        if not line.strip():
            continue
        try:
            data = json.loads(line)
            step_idx = data.get('step_index')
            if step_idx == 737:
                tool_calls = data.get('tool_calls', [])
                for tc in tool_calls:
                    if tc.get('name') == 'replace_file_content':
                        args = tc.get('args', {})
                        replacement = args.get('ReplacementContent')
                        print(f"Step 737 raw replacement length: {len(replacement)}")
                        # 尝试将它写入文件
                        with open('/Users/admin/Downloads/SRE-Agent-main/scratch/step_737_full.txt', 'w', encoding='utf-8') as out:
                            out.write(replacement)
                        print("Saved to scratch/step_737_full.txt")
        except Exception as e:
            print("Error:", e)
