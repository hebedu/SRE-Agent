import json

paths = [
    '/Users/admin/Downloads/SRE-Agent-main/scratch/yesterday_replaces.jsonl',
    '/Users/admin/Downloads/SRE-Agent-main/scratch/failed_steps.json'
]

for path in paths:
    print(f"Searching in {path}...")
    try:
        with open(path, 'r', encoding='utf-8') as f:
            if path.endswith('jsonl'):
                for idx, line in enumerate(f):
                    if 'InspectionPlanDetailDrawer' in line and 'truncated' not in line:
                        data = json.loads(line)
                        tc_calls = data.get('tool_calls', [])
                        for tc in tc_calls:
                            repl = tc.get('args', {}).get('ReplacementContent', '')
                            if 'InspectionPlanDetailDrawer' in repl and 'truncated' not in repl:
                                print(f"  Found full drawer in JSONL at line {idx}, step {data.get('step_index')}, len: {len(repl)}")
            else:
                data = json.load(f)
                # data is a list of steps
                for idx, step in enumerate(data):
                    repl = step.get('replacement', '')
                    if 'InspectionPlanDetailDrawer' in repl and 'truncated' not in repl:
                        print(f"  Found full drawer in failed_steps at index {idx}, step {step.get('step_index')}, len: {len(repl)}")
    except Exception as e:
        print(f"Error reading {path}: {e}")
