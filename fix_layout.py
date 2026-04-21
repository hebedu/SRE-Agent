import sys

path = '/Users/hebe/Downloads/ai-sre-console_v2 2/src/App.tsx'
with open(path, 'r') as f:
    content = f.read()

# Target block for Knowledge Sidebar area
old_block = """               {!isLeftPanelCollapsed && (
                 <div className="w-[30%] border-r border-slate-800 flex flex-col min-h-0 shrink-0 transition-all duration-300 relative z-10 shadow-2xl">
                    <KnowledgeSidebar 
                      selectedLibIds={selectedKLibIds} 
                      onSelectLibs={setSelectedKLibIds}
                      activeLibId={activeKLibId}
                      setActiveLibId={setActiveLibId}
                      navLevel={knowledgeNavLevel}
                      setNavLevel={setKnowledgeNavLevel}
                      selectedDocId={selectedKDocId}
                      onSelectDoc={setSelectedKDocId}
                    />
                 </div>
               )}
               <div className="flex-1 flex flex-col min-h-0 relative bg-black/40 z-0">
                  {selectedKDocId ? (
                    <KnowledgeDocViewer 
                      activeLibId={activeKLibId}
                      selectedDocId={selectedKDocId}
                      onSelectDoc={setSelectedKDocId}
                      onAction={handleAction}
                    />
                  ) : (
                    <KnowledgeChatPanel 
                      messages={messages} 
                      chatEndRef={chatEndRef} 
                      renderInput={renderInput}
                      selectedLibIds={selectedKLibIds}
                      isCollapsed={isLeftPanelCollapsed}
                      onToggle={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
                      onAction={handleAction}
                    />
                  )}
               </div>"""

new_block = """               {!isLeftPanelCollapsed && (
                 <div className={`${knowledgeNavLevel === 'docs' ? 'w-1/2' : 'w-[30%]'} border-r border-slate-800 flex flex-col min-h-0 shrink-0 transition-all duration-500 ease-in-out relative z-10 shadow-2xl overflow-hidden`}>
                    {knowledgeNavLevel === 'libs' ? (
                      <KnowledgeSidebar 
                        selectedLibIds={selectedKLibIds} 
                        onSelectLibs={setSelectedKLibIds}
                        activeLibId={activeKLibId}
                        setActiveLibId={setActiveLibId}
                        onEnterLib={(id: string) => {
                          setActiveKLibId(id);
                          setKnowledgeNavLevel('docs');
                        }}
                      />
                    ) : (
                      <KnowledgeDocViewer 
                        activeLibId={activeKLibId}
                        selectedDocId={selectedKDocId}
                        onSelectDoc={setSelectedKDocId}
                        onAction={handleAction}
                        onBack={() => {
                          setKnowledgeNavLevel('libs');
                          setSelectedKDocId(null);
                        }}
                      />
                    )}
                 </div>
               )}
               <div className="flex-1 flex flex-col min-h-0 relative bg-black/40 z-0">
                  <KnowledgeChatPanel 
                    messages={messages} 
                    chatEndRef={chatEndRef} 
                    renderInput={renderInput}
                    selectedLibIds={selectedKLibIds}
                    isCollapsed={isLeftPanelCollapsed}
                    onToggle={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
                    onAction={handleAction}
                  />
               </div>"""

if old_block in content:
    new_content = content.replace(old_block, new_block)
    with open(path, 'w') as f:
        f.write(new_content)
    print("Successfully replaced.")
else:
    # Try with more flexible matching or print snippet for debugging
    print("Old block not found. First 100 chars of expected old block:")
    print(old_block[:100])
    # Search for a substring to see where it deviates
    if "activeMenu === 'knowledge'" in content:
        print("Knowledge menu found.")
        idx = content.find("activeMenu === 'knowledge'")
        print("Surrounding text:")
        print(content[idx:idx+500])
    else:
        print("Knowledge menu NOT found.")
