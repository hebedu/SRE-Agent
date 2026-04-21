import sys

path = '/Users/admin/Downloads/ai-sre-console_v2/src/App.tsx'
with open(path, 'r') as f:
    lines = f.readlines()

# Look for the pattern in the inspection task list
# The target is around line 3195-3197
# We want to remove the extra </div>

target_lines = [
    '          </div>\n',
    '        </div>\n',
    '        </div>\n',
    '      ))}\n'
]

# Let's find the specific block. 
# It follows "开始分析" button block.
found = False
for i in range(len(lines) - 4):
    if '开始分析' in lines[i-5] and '</div>' in lines[i] and '</div>' in lines[i+1] and '</div>' in lines[i+2] and '))}' in lines[i+3]:
        # We found the problematic block
        # lines[i] is footer end, lines[i+1] is card end, lines[i+2] is EXTRA.
        print(f"Found problematic block at lines {i+1} to {i+4}")
        del lines[i+2]
        found = True
        break

if found:
    with open(path, 'w') as f:
        f.writelines(lines)
    print("JSX fix applied successfully.")
else:
    print("Could not find the problematic block with exact match. Trying fallback.")
    # Fallback: search for three consecutive </div> followed by ))}.
    for i in range(len(lines) - 3):
        if '</div>' in lines[i] and '</div>' in lines[i+1] and '</div>' in lines[i+2] and '))}' in lines[i+3]:
            print(f"Found sequence at {i+1}")
            del lines[i+2]
            found = True
            break
    if found:
        with open(path, 'w') as f:
            f.writelines(lines)
        print("JSX fix (fallback) applied successfully.")
    else:
        print("Failed to find the problematic block.")
