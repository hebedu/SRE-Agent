import json

def format_file(input_path, output_path):
    with open(input_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 将所有的 \\n 替换为 \n，有些字符如果被双重转义也可以还原
    # 如果是用 json 导出的，通常最外层是带引号的 JSON 字符串。
    # 我们可以尝试用 json.loads 把它彻底还原成原始字符串。
    try:
        # 如果是 JSON 字符串形式的
        if not content.startswith('"'):
            # 补上引号使之成为合法 json string
            content_json = '"' + content + '"'
        else:
            content_json = content
        
        parsed = json.loads(content_json)
        # 写入
        with open(output_path, 'w', encoding='utf-8') as out:
            out.write(parsed)
        print(f"Parsed and saved to {output_path}")
    except Exception as e:
        print(f"JSON load failed, fallback to simple replace for {input_path}: {e}")
        # fallback
        # 如果实在不行，我们就做普通替换
        content = content.replace('\\n', '\n').replace('\\t', '\t').replace('\\"', '"').replace('\\\\', '\\')
        with open(output_path, 'w', encoding='utf-8') as out:
            out.write(content)
        print(f"Fallback saved to {output_path}")

format_file('/Users/admin/Downloads/SRE-Agent-main/scratch/step_961_content.txt', '/Users/admin/Downloads/SRE-Agent-main/scratch/formatted_961.tsx')
format_file('/Users/admin/Downloads/SRE-Agent-main/scratch/step_967_content.txt', '/Users/admin/Downloads/SRE-Agent-main/scratch/formatted_967.tsx')
