import json

jsonl_path = '/Users/admin/Downloads/SRE-Agent-main/scratch/yesterday_replaces.jsonl'

with open(jsonl_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for line in lines:
    if not line.strip():
        continue
    try:
        data = json.loads(line)
        step_idx = data.get('step_index', 0)
        if step_idx in [961, 967]:
            tool_calls = data.get('tool_calls', [])
            for tc in tool_calls:
                if tc.get('name') == 'replace_file_content':
                    args = tc.get('args', {})
                    replacement = args.get('ReplacementContent', '')
                    desc = args.get('Description', '')
                    filename = f'/Users/admin/Downloads/SRE-Agent-main/scratch/step_{step_idx}_content.txt'
                    with open(filename, 'w', encoding='utf-8') as out:
                        out.write(replacement)
                    print(f"Saved step {step_idx} content to {filename} (Desc: {desc})")
    except Exception as e:
        print(e)
