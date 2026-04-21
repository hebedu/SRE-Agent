
import sys

path = '/Users/hebe/Downloads/ai-sre-console_v2 2/src/App.tsx'
with open(path, 'r') as f:
    lines = f.readlines()

keyword = "activeMenu === 'knowledge' ? ("
target_line_idx = -1
for i, line in enumerate(lines):
    if keyword in line and i > 5000: # We want the one near the end
        target_line_idx = i
        break

if target_line_idx == -1:
    print("Keyword not found")
    sys.exit(1)

print(f"Target found at index {target_line_idx}")

# We want to replace the block from target_line_idx + 1 until the next ) : activeMenu === 'report' ? (
# or the closing block of knowledge.

# Let's find the closing of the knowledge block.
# Usually it's followed by ) : activeMenu === 'report' ? (
end_keyword = ") : activeMenu === 'report' ? ("
end_idx = -1
for i in range(target_line_idx, len(lines)):
    if end_keyword in lines[i]:
        end_idx = i
        break

if end_idx == -1:
    print("End keyword not found")
    sys.exit(1)

print(f"End found at index {end_idx}")

# New block content
new_block = [
    "            <div className=\"flex-1 flex min-h-0 bg-[#0a0a0c] relative overflow-hidden\">\n",
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
    "                    renderInput={renderInput}\n",
    "                    selectedLibIds={selectedKLibIds}\n",
    "                    isCollapsed={isLeftPanelCollapsed}\n",
    "                    onToggle={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}\n",
    "                    onAction={handleAction}\n",
    "                  />\n",
    "               </div>\n",
    "               <SourceTraceDrawer \n",
    "                 isOpen={isSourceDrawerOpen} \n",
    "                 onClose={() => setIsSourceDrawerOpen(false)} \n",
    "                 data={activeSourceData} \n",
    "               />\n",
    "            </div>\n"
]

lines[target_line_idx + 1 : end_idx] = new_block

with open(path, 'w') as f:
    f.writelines(lines)

print("Replacement successful.")
