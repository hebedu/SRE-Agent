import sys

path = '/Users/admin/Downloads/ai-sre-console_v2/src/App.tsx'
with open(path, 'r') as f:
    lines = f.readlines()

content = "".join(lines)

# Component starts around 3084
start_tag = "const InspectionTaskList"
end_tag = "const InspectionDetailReport"

start_idx = content.find(start_tag)
end_idx = content.find(end_tag)

if start_idx != -1 and end_idx != -1:
    relevant_content = content[start_idx:end_idx]
    
    # Count Div tags
    open_divs = relevant_content.count("<div")
    # subtract self-closing if any (though unlikely for div)
    close_divs = relevant_content.count("</div")
    
    print(f"Open Divs: {open_divs}")
    print(f"Close Divs: {close_divs}")
    
    # Check for adjacent divs at the end
    # We expect the component to return a single div.
    # So Open Divs should equal Close Divs + any self-closing (0).
else:
    print("Could not find component tags.")
