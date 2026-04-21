import sys

path = '/Users/admin/Downloads/ai-sre-console_v2/src/App.tsx'
with open(path, 'r') as f:
    lines = f.readlines()

# Patterns to find:
# 3189:         </div>
# 3190:         </div>
# 3191:       ))}

found = False
for i in range(len(lines) - 2):
    if '</div>' in lines[i] and '</div>' in lines[i+1] and '))}' in lines[i+2]:
        # Check if line numbers are around 3189
        if i > 3100 and i < 3300:
            print(f"Found problematic block at internal lines {i+1}-{i+3}")
            # lines[i] is card end, lines[i+1] is EXTRA, lines[i+2] is map end.
            del lines[i+1]
            found = True
            break

if found:
    with open(path, 'w') as f:
        f.writelines(lines)
    print("JSX fix (v4) applied successfully.")
else:
    print("Could not find the problematic block.")
