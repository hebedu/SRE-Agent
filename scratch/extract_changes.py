import json
import os

jsonl_path = '/Users/admin/Downloads/SRE-Agent-main/scratch/yesterday_replaces.jsonl'
output_path = '/Users/admin/Downloads/SRE-Agent-main/scratch/yesterday_code_changes.txt'

if not os.path.exists(jsonl_path):
    print("Source JSONL not found!")
    exit(1)

extracted = []

with open(jsonl_path, 'r', encoding='utf-8') as f:
    for line in f:
        if not line.strip():
            continue
        try:
            data = json.loads(line)
            created_at = data.get('created_at', '')
            # 过滤昨天 6 月 2 号的记录
            if '2026-06-02' in created_at:
                step = data.get('step_index', 0)
                tool_calls = data.get('tool_calls', [])
                for tc in tool_calls:
                    if tc.get('name') == 'replace_file_content':
                        args = tc.get('args', {})
                        # 如果是修改 App.tsx
                        if 'App.tsx' in args.get('TargetFile', ''):
                            extracted.append({
                                'step': step,
                                'created_at': created_at,
                                'desc': args.get('Description', ''),
                                'start': args.get('StartLine', 0),
                                'end': args.get('EndLine', 0),
                                'target': args.get('TargetContent', ''),
                                'replacement': args.get('ReplacementContent', '')
                            })
        except Exception as e:
            print(f"Error parsing line: {e}")

extracted.sort(key=lambda x: x['step'])

with open(output_path, 'w', encoding='utf-8') as out:
    for item in extracted:
        out.write("="*80 + "\n")
        out.write(f"Step: {item['step']} | Time: {item['created_at']}\n")
        out.write(f"Description: {item['desc']}\n")
        out.write(f"Lines: {item['start']} -> {item['end']}\n")
        out.write("-" * 40 + " TARGET " + "-" * 40 + "\n")
        out.write(item['target'] + "\n")
        out.write("-" * 40 + " REPLACEMENT " + "-" * 40 + "\n")
        out.write(item['replacement'] + "\n\n")

print(f"Successfully extracted {len(extracted)} changes to {output_path}")
