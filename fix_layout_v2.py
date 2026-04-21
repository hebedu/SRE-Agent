
import sys

path = '/Users/hebe/Downloads/ai-sre-console_v2 2/src/App.tsx'
with open(path, 'r') as f:
    lines = f.readlines()

# Indent size 9 + 3 for subsequent levels based on view_file output
# Line numbers in view_file:
# 6067:                 <div className="w-[30%] ...
# 6068:                    <KnowledgeSidebar 
# ...
# 6077:                    />

# Let's find the main line
target_line_idx = -1
for i, line in enumerate(lines):
    if "activeMenu === 'knowledge' ? (" in line:
        target_line_idx = i
        break

if target_line_idx != -1:
    print(f"Found target at line {target_line_idx + 1}")
    # Replace lines from 6067 to 6099 (indices 6066 to 6098)
    # The view_file output used 1-based indexing.
    # Lines 6066 to 6098 should be replaced.
    
    # New block construction
    new_knowledge_block = [
        "               {!isLeftPanelCollapsed && (\n",
        "                 <div className={`${knowledgeNavLevel === 'docs' ? 'w-1/2' : 'w-[30%]'} border-r border-slate-800 flex flex-col min-h-0 shrink-0 transition-all duration-500 ease-in-out relative z-10 shadow-2xl overflow-hidden`}>\n",
        "                    {knowledgeNavLevel === 'libs' ? (\n",
        "                      <KnowledgeSidebar \n",
        "                        selectedLibIds={selectedKLibIds} \n",
        "                        onSelectLibs={setSelectedKLibIds} \n",
        "                        activeLibId={activeKLibId} \n",
        "                        setActiveLibId={setActiveKLibId} \n",
        "                        onEnterLib={(id: string) => {\n",
        "                          setActiveLibId(id);\n",
        "                          setKnowledgeNavLevel('docs');\n",
        "                        }}\n",
        "                      />\n",
        "                    ) : (\n",
        "                      <KnowledgeDocViewer \n",
        "                        activeLibId={activeKLibId}\n",
        "                        selectedDocId={selectedKDocId}\n",
        "                        onSelectDoc={setSelectedKDocId}\n",
        "                        onAction={handleAction}\n",
        "                        onBack={() => {\n",
        "                          setKnowledgeNavLevel('libs');\n",
        "                          setSelectedKDocId(null);\n",
        "                        }}\n",
        "                      />\n",
        "                    )}\n",
        "                 </div>\n",
        "               )}\n",
        "               <div className=\"flex-1 flex flex-col min-h-0 relative bg-black/40 z-0\">\n",
        "                  <KnowledgeChatPanel \n",
        "                    messages={messages} \n",
        "                    chatEndRef={chatEndRef} \n",
        "                    renderInput={renderInput} \n",
        "                    selectedLibIds={selectedKLibIds} \n",
        "                    isCollapsed={isLeftPanelCollapsed} \n",
        "                    onToggle={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)} \n",
        "                    onAction={handleAction} \n",
        "                  />\n",
        "               </div>\n"
    ]
    
    # Indices in the list (0-based)
    # lines[6066..6098]
    start_idx = 6066
    end_idx = 6099
    
    # Verify content at start_idx
    print(f"Start content: {lines[start_idx].strip()}")
    if "{!isLeftPanelCollapsed && (" in lines[start_idx]:
        lines[start_idx:end_idx] = new_knowledge_block
        with open(path, 'w') as f:
            f.writelines(lines)
        print("Replacement successful via line index.")
    else:
        print("Content mismatch at expected start index.")
else:
    print("Could not find activeMenu === 'knowledge'")
