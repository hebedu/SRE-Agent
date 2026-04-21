import sys

path = '/Users/admin/Downloads/ai-sre-console_v2/src/App.tsx'
with open(path, 'r') as f:
    lines = f.readlines()

# Target lines: 5298 to 5310 approx
# We want to restore the Logo/Title
header_start = -1
for i, line in enumerate(lines):
    if 'header className="h-16 border-b' in line:
        header_start = i
        break

if header_start != -1:
    # Replace the div content
    header_restoration = [
        '        <div className="w-[180px] flex items-center px-4 shrink-0">\n',
        '          <div className="flex items-center gap-3">\n',
        '            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-500 flex items-center justify-center border border-indigo-500/20 shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.15)]">\n',
        '              <Activity size={20} />\n',
        '            </div>\n',
        '            <h1 className="font-bold text-slate-100 tracking-wide text-[15px] whitespace-nowrap">\n',
        '              SRE Agent\n',
        '            </h1>\n',
        '          </div>\n',
        '        </div>\n'
    ]
    # Find the end of the corrupted div
    corrupted_end = -1
    for j in range(header_start + 1, header_start + 30):
        if '<div className="w-px h-8 bg-slate-800/60"' in lines[j]:
            corrupted_end = j
            break
    
    if corrupted_end != -1:
        lines[header_start+1:corrupted_end] = header_restoration

# Fix Diagnostic branch props
diagnostic_start = -1
for i, line in enumerate(lines):
    if 'activeMenu === \'diagnostic\'' in line:
        diagnostic_start = i
        # We don't break here just in case there are other matches? No, it should be unique.
        break

if diagnostic_start != -1:
    diag_chat_start = -1
    for j in range(diagnostic_start, diagnostic_start + 30):
        if '<DiagnosticChatPanel' in lines[j]:
            diag_chat_start = j
            break
    
    if diag_chat_start != -1:
        # Find the closing tag
        diag_chat_end = -1
        for k in range(diag_chat_start + 1, diag_chat_start + 20):
            if '/>' in lines[k]:
                diag_chat_end = k
                break
        
        if diag_chat_end != -1:
            diag_fix = [
                '                  <DiagnosticChatPanel \n',
                '                    messages={messages} \n',
                '                    chatEndRef={chatEndRef} \n',
                '                    onAction={handleAction} \n',
                '                    renderInput={renderInput} \n',
                '                    isCollapsed={isLeftPanelCollapsed} \n',
                '                    onToggle={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)} \n',
                '                    selectedAlarm={selectedAlarm} \n',
                '                    showBanner={showContextBanner} \n',
                '                  />\n'
            ]
            lines[diag_chat_start:diag_chat_end+1] = diag_fix

with open(path, 'w') as f:
    f.writelines(lines)

print("Restoration complete.")
