import json

jsonl_path = '/Users/admin/Downloads/SRE-Agent-main/scratch/yesterday_replaces.jsonl'

with open(jsonl_path, 'r', encoding='utf-8') as f:
    for line in f:
        if not line.strip():
            continue
        try:
            data = json.loads(line)
            step_idx = data.get('step_index')
            tool_calls = data.get('tool_calls', [])
            for tc in tool_calls:
                args = tc.get('args', {})
                content = args.get('ReplacementContent', '')
                if 'InspectionTaskEditListCard' in content:
                    print(f"Found InspectionTaskEditListCard in step {step_idx}")
                    with open(f'/Users/admin/Downloads/SRE-Agent-main/scratch/step_{step_idx}_content.txt', 'w', encoding='utf-8') as out:
                        out.write(content)
                if 'STEP_RULE' in content and 'initialTasks.push' in content:
                    print(f"Found STEP_RULE handler in step {step_idx}")
                    with open(f'/Users/admin/Downloads/SRE-Agent-main/scratch/step_{step_idx}_step_rule.txt', 'w', encoding='utf-8') as out:
                        out.write(content)
                if 'PLAN_SUBMIT_FINAL' in content and 'isMysqlCreateWizard' in content:
                    print(f"Found PLAN_SUBMIT_FINAL handler in step {step_idx}")
                    with open(f'/Users/admin/Downloads/SRE-Agent-main/scratch/step_{step_idx}_plan_submit.txt', 'w', encoding='utf-8') as out:
                        out.write(content)
        except Exception as e:
            pass
