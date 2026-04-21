import sys
import re

path = '/Users/admin/Downloads/ai-sre-console_v2/src/App.tsx'
with open(path, 'r') as f:
    content = f.read()

# 1. Define the correct ExpertDiagnosticCard component
new_card_code = r"""const ExpertDiagnosticCard = ({ data, onAction }: any) => {
  const currentStep = data.currentStep || 0;
  const isPhased = data.format === '0412_phased';

  // 如果是0412分阶段可视化模式
  if (isPhased) {
    return (
      <div className="bg-[#111118] border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl max-w-4xl font-sans">
        <div className="p-4 border-b border-white/[0.05] bg-[#16161d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Brain size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-tighter">AI 分析报告 · 分阶段可视化版</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Phase: {currentStep}/4 · 深度巡检诊断</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-bold px-2 py-0.5 rounded bg-slate-800/50 border border-slate-700">0412 规格</span>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Phase 1: Initialization */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className={`w-6 h-6 rounded-full ${currentStep >= 1 ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-slate-800 text-slate-500'} flex items-center justify-center text-[10px] font-bold transition-all`}>1</div>
              <div className={`w-px flex-1 ${currentStep > 1 ? 'bg-blue-600' : 'bg-slate-800/50'}`} />
            </div>
            <div className="flex-1 pb-4">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">阶段1：启动调查 (Initialization)</div>
              {currentStep >= 1 && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                   {data.stage1?.objectTable && (
                     <AnalysisTable title="（1）巡检对象信息" columns={['字段', '内容']} data={data.stage1.objectTable} />
                   )}
                   {data.stage1?.metricsTable && (
                     <AnalysisTable title="（2）关键指标快照" columns={['指标', '当前值', '阈值', '状态']} data={data.stage1.metricsTable} />
                   )}
                </motion.div>
              )}
            </div>
          </div>

          {/* Phase 2: Exploration */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className={`w-6 h-6 rounded-full ${currentStep >= 2 ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(79,70,229,0.3)]' : 'bg-slate-800 text-slate-500'} flex items-center justify-center text-[10px] font-bold transition-all`}>2</div>
              <div className={`w-px flex-1 ${currentStep > 2 ? 'bg-indigo-600' : 'bg-slate-800/50'}`} />
            </div>
            <div className="flex-1 pb-4">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">阶段2：证据探索 (Exploration)</div>
              {currentStep >= 2 && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                   {data.stage2?.charts?.map((chart: any, i: number) => (
                     <AnalysisTrendChart key={i} {...chart} />
                   ))}
                   {data.stage2?.comparisonTable && (
                     <AnalysisTable title="（3）历史对比表" columns={['指标', '当前值', '昨日同时间', '阈值']} data={data.stage2.comparisonTable} />
                   )}
                   {data.stage2?.correlationTable && (
                     <AnalysisTable title="（4）多指标关联分析" columns={['指标', '当前状态', '趋势', '关联关系']} data={data.stage2.correlationTable} />
                   )}
                </motion.div>
              )}
              {currentStep === 1 && (
                <div className="flex items-center gap-2 text-[10px] text-slate-600 uppercase font-black animate-pulse">
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-600" /> 分析趋势中...
                </div>
              )}
            </div>
          </div>

          {/* Phase 3: Diagnosis */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className={`w-6 h-6 rounded-full ${currentStep >= 3 ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'bg-slate-800 text-slate-500'} flex items-center justify-center text-[10px] font-bold transition-all`}>3</div>
              <div className={`w-px flex-1 ${currentStep > 3 ? 'bg-purple-600' : 'bg-slate-800/50'}`} />
            </div>
            <div className="flex-1 pb-4">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">阶段3：确认原因 (Diagnosis)</div>
              {currentStep >= 3 && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                   {data.stage3?.candidateTable && (
                     <AnalysisTable title="（1）可能原因（候选）" columns={['可能原因', '支撑证据', '说明']} data={data.stage3.candidateTable} />
                   )}
                   <div className="bg-slate-900/50 border border-white/[0.03] rounded-xl p-4">
                      <div className="text-[10px] font-black text-slate-500 uppercase mb-2">（2）关键证据总结</div>
                      <ul className="space-y-1.5">{data.stage3?.evidenceList?.map((e: string, i: number) => (
                        <li key={i} className="text-[11px] text-slate-400 flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-purple-500" /> {e}
                        </li>
                      ))}</ul>
                   </div>
                </motion.div>
              )}
              {currentStep === 2 && (
                <div className="flex items-center gap-2 text-[10px] text-slate-600 uppercase font-black animate-pulse">
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-600" /> 匹配异常模型中...
                </div>
              )}
            </div>
          </div>

          {/* Phase 4: Conclusion */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className={`w-6 h-6 rounded-full ${currentStep >= 4 ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-slate-800 text-slate-500'} flex items-center justify-center text-[10px] font-bold transition-all`}>4</div>
            </div>
            <div className="flex-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">阶段4：最终结论 (Conclusion)</div>
              {currentStep >= 4 && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                   {data.stage4?.summaryTable && (
                     <AnalysisTable columns={['维度', '内容']} data={data.stage4.summaryTable} />
                   )}
                   <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                      <div className="text-[10px] font-black text-emerald-500 uppercase mb-2">最终判断 (Final Report)</div>
                      <p className="text-[12px] text-emerald-50/80 font-bold leading-relaxed">{data.stage4?.judgment}</p>
                   </div>
                   <button 
                     onClick={() => onAction?.('VIEW_REPORT', data)}
                     className="w-full py-3 border border-slate-700 hover:border-blue-500/50 text-slate-400 hover:text-blue-400 text-xs font-black rounded-xl transition-all active:scale-95 uppercase tracking-widest flex items-center justify-center gap-2"
                   >
                     <FileText size={14} /> 生成完整深度报告
                   </button>
                </motion.div>
              )}
              {currentStep === 3 && (
                <div className="flex items-center gap-2 text-[10px] text-slate-600 uppercase font-black animate-pulse">
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-600" /> 撰写分析结论中...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 默认原始告警分析模式
  const { topology, agents, conclusion } = data;

  return (
    <div className="bg-[#111118] border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl max-w-4xl font-sans">
      <div className="p-4 border-b border-white/[0.05] bg-[#16161d] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <Brain size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-tighter">AI 专家诊断报告</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Workflow-ID: {Date.now().toString().slice(-8)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <div className="flex -space-x-2">
              {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-[#16161d] bg-slate-800 flex items-center justify-center text-[8px] text-slate-400 font-bold">U{i}</div>)}
           </div>
           <span className="text-[10px] text-slate-500 font-bold ml-1">3 分析引擎并行中</span>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Step 1: Topology Discovery */}
        <div className="flex gap-4">
           <div className="flex flex-col items-center gap-2">
              <div className={`w-6 h-6 rounded-full ${currentStep >= 1 ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(79,70,229,0.4)]' : 'bg-slate-800 text-slate-500'} flex items-center justify-center text-[10px] font-bold transition-colors`}>1</div>
              <div className={`w-px flex-1 ${currentStep > 1 ? 'bg-indigo-600' : 'bg-slate-800/50'}`} />
           </div>
           <div className="flex-1 pb-4">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">环节一：拓扑路径自动发现 (Topology Discovery)</div>
              {currentStep >= 1 && (
                <div className="bg-slate-900/50 border border-white/[0.03] rounded-xl p-4">
                   <div className="flex items-center gap-3 overflow-x-auto whitespace-nowrap scroll-hidden py-1">
                      {(topology || ['服务A', '服务B', '服务C']).map((node: string, i: number) => (
                        <React.Fragment key={i}>
                          <div className="flex items-center gap-2 pr-2">
                             <div className="p-2 rounded-lg bg-slate-800 border border-slate-700/50 flex items-center gap-2">
                                <Monitor size={12} className="text-indigo-400" />
                                <span className="text-xs text-slate-200 font-mono italic">{node}</span>
                             </div>
                          </div>
                          {i < (topology?.length || 0) - 1 && <ArrowRight size={14} className="text-slate-600 shrink-0" />}
                        </React.Fragment>
                      ))}
                   </div>
                   <div className="mt-3 text-[10px] text-indigo-400 font-medium">✨ 已基于当前告警溯源并锁定了关联受影响的服务节点。</div>
                </div>
              )}
           </div>
        </div>

        {/* Step 2: Multi-Agent Diagnosis */}
        <div className="flex gap-4">
           <div className="flex flex-col items-center gap-2">
              <div className={`w-6 h-6 rounded-full ${currentStep >= 2 ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(79,70,229,0.4)]' : 'bg-slate-800 text-slate-500'} flex items-center justify-center text-[10px] font-bold transition-colors`}>2</div>
              <div className={`w-px flex-1 ${currentStep > 2 ? 'bg-indigo-600' : 'bg-slate-800/50'}`} />
           </div>
           <div className="flex-1 pb-4">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">环节二：多智能体并行专家诊断 (Multi-Agent Analysis)</div>
              {currentStep >= 2 && (
                <div className="grid grid-cols-2 gap-3">
                  {(agents || []).map((agent: any, i: number) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded-xl border ${agent.status === 'warning' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-emerald-500/5 border-emerald-500/20'} relative group cursor-help`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Cpu size={14} className={agent.status === 'warning' ? 'text-amber-500' : 'text-emerald-500'} />
                          <span className="text-[11px] font-bold text-slate-300 truncate tracking-tight">{agent.name}</span>
                        </div>
                        {agent.status === 'success' ? <CheckCircle2 size={12} className="text-emerald-500" /> : <ShieldAlert size={12} className="text-amber-500" />}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-medium line-clamp-2">{agent.detail}</p>
                      
                      <div className="mt-2 pt-2 border-t border-white/[0.05] flex justify-between items-center">
                         <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Confidence: 98%</span>
                         <div className="flex gap-1">
                            <div className="w-1 h-1 rounded-full bg-blue-500" />
                            <div className="w-1 h-1 rounded-full bg-blue-500/40" />
                            <div className="w-1 h-1 rounded-full bg-blue-500/20" />
                         </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              {currentStep === 2 && (
                <div className="flex items-center gap-2 mt-4 text-[10px] text-slate-500 font-bold uppercase animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" /> 正在汇聚分析结论中...
                </div>
              )}
           </div>
        </div>

        {/* Step 3: Conclusion & Action */}
        <div className="flex gap-4">
           <div className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full ${currentStep >= 3 ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-slate-800 text-slate-500'} flex items-center justify-center text-[10px] font-bold transition-colors`}>3</div>
           </div>
           <div className="flex-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">环节三：诊断结论与自愈方案 (Conclusion & Insight)</div>
              {currentStep >= 3 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 mb-5 relative overflow-hidden group">
                     <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                     <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity"><Brain size={48} /></div>
                     <h4 className="text-xs font-black text-emerald-400 mb-2 uppercase tracking-tight flex items-center gap-2">
                       故障确认 (Root Cause Confirmed) 
                     </h4>
                     <p className="text-[12px] text-emerald-50/80 font-bold leading-relaxed">
                        {conclusion}
                     </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => onAction?.('ACT_SELF_HEAL')}
                      className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-emerald-900/20 active:scale-95 uppercase tracking-wide flex items-center justify-center gap-2"
                    >
                      <Zap size={14} fill="currentColor" />
                      建议执行自愈 (Recommended)
                    </button>
                    <button 
                      onClick={() => onAction?.('VIEW_REPORT', data)}
                      className="px-6 py-3 border border-slate-700 hover:border-blue-500/50 text-slate-400 hover:text-blue-400 text-xs font-bold rounded-xl transition-all active:scale-95 uppercase tracking-wide flex items-center justify-center gap-2"
                    >
                      <FileText size={14} />
                      根因分析报告
                    </button>
                  </div>
                </motion.div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};"""

# Use regex to replace the entire ExpertDiagnosticCard component
pattern = r'const ExpertDiagnosticCard = \(.*?ResultGrid data=\{message\.data\} onAction=\{onAction\} \/\>\}'
# Actually, ExpertDiagnosticCard ends right before it's used in ChatBubble. 
# But wait, grep shows it at 1407.

# Let's find the start and end indices manually by searching for the start and a reliable end point
start_marker = "const ExpertDiagnosticCard = ({ data, onAction }: any) => {"
end_marker = "const DiagnosticReportDrawer = ({ isOpen, onClose, data }: { isOpen: boolean, onClose: () => void, data: any }) => {"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + new_card_code + "\n\n" + content[end_idx:]
    
    # 2. ALSO FIX handleAction if it's still incorrect. 
    # Let's check for 'phasedAnalysis: true' in handleAction and replace it with 'format: "0412_phased"'
    
    # Find the START_INSPECTION_ANALYSIS block
    action_marker = "if (action === 'START_INSPECTION_ANALYSIS') {"
    new_action_code = """    if (action === 'START_INSPECTION_ANALYSIS') {
      const task = data.task;
      if (!task) return;

      setIsAIProcessing(true);
      setInspectionAnalysisStatus(prev => ({ ...prev, [task.name]: 'analyzing' }));

      // Add user message (Context Injection)
      addMessage({
        id: `insp-user-${Date.now()}`,
        type: 'user',
        contentType: 'inspection_task_select',
        content: `针对巡检项目 [${task.name}] 启动专家级深度分析。`,
        data: task,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      const aiMsgId = `insp-ai-${Date.now()}`;
      
      // Step 1: Initialization (1s)
      setTimeout(() => {
        addMessage({
          id: aiMsgId,
          type: 'ai',
          contentType: 'analysis',
          content: `正在识别巡检对象 [${task.target}] 并加载指标快照...`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          data: {
            format: '0412_phased',
            currentStep: 1,
            stage1: {
              objectTable: [
                ['对象名称', task.target],
                ['类型', 'Service'],
                ['环境', 'prod'],
                ['集群', 'cluster-A']
              ],
              metricsTable: [
                ['CPU使用率', '92%', '80%', '异常'],
                ['内存使用率', '88%', '80%', '偏高'],
                ['错误率', '3.2%', '1%', '异常']
              ]
            }
          }
        });
      }, 1000);

      // Step 2: Exploration (3.5s)
      setTimeout(() => {
        setChatHistories(prev => ({
          ...prev,
          [activeMenu]: (prev[activeMenu] || []).map(m => m.id === aiMsgId ? {
            ...m,
            data: {
              ...m.data,
              currentStep: 2,
              stage2: {
                charts: [
                  {
                    title: 'CPU Usage Trend (Last 30 min)',
                    labels: ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25', '10:30'],
                    data: [65, 70, 75, 82, 88, 90, 92],
                    events: [{ time: '10:15', label: '异常开始' }]
                  },
                  {
                    title: 'Memory Usage Trend (Last 30 min)',
                    labels: ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25', '10:30'],
                    data: [60, 65, 70, 75, 80, 85, 88]
                  }
                ],
                comparisonTable: [
                  ['CPU使用率', '92%', '68%', '80%'],
                  ['内存使用率', '88%', '64%', '80%'],
                  ['错误率', '3.2%', '0.8%', '1%']
                ],
                correlationTable: [
                  ['CPU', '高', '持续上升', '与线程数正相关'],
                  ['内存', '高', '持续上升', '无明显 GC 回收'],
                  ['错误率', '异常', '波动上升', '与流量无直接关联']
                ]
              }
            }
          } : m)
        }));
      }, 3500);

      // Step 3: Diagnosis (6s)
      setTimeout(() => {
        setChatHistories(prev => ({
          ...prev,
          [activeMenu]: (prev[activeMenu] || []).map(m => m.id === aiMsgId ? {
            ...m,
            data: {
              ...m.data,
              currentStep: 3,
              stage3: {
                candidateTable: [
                  ['资源压力', 'CPU + 内存同步上升', '资源占用持续增加'],
                  ['异常负载', '错误率上升', '但未与流量直接关联']
                ],
                evidenceList: [
                  'CPU 与内存呈现高度同步上升趋势',
                  '内存未观测到明显回收行为',
                  '错误率存在异常波动'
                ]
              }
            }
          } : m)
        }));
      }, 6000);

      // Step 4: Conclusion (8.5s)
      setTimeout(() => {
        setIsAIProcessing(false);
        setInspectionAnalysisStatus(prev => ({ ...prev, [task.name]: 'completed' }));
        setChatHistories(prev => ({
          ...prev,
          [activeMenu]: (prev[activeMenu] || []).map(m => m.id === aiMsgId ? {
            ...m,
            data: {
              ...m.data,
              currentStep: 4,
              stage4: {
                summaryTable: [
                  ['问题类型', '资源使用异常'],
                  ['影响范围', '当前服务实例'],
                  ['状态', '持续中']
                ],
                judgment: '基于当前指标趋势与关联分析，初步判断存在资源压力风险，可能影响服务稳定性。建议查看详细日志并关注近期变更。',
              }
            }
          } : m)
        }));
      }, 8500);
      return;
    }"""
    
    # Replace the handleAction block. We need to find where it ends.
    # It ends before the next if (action === ...) or before the end of handleAction function.
    action_start_idx = new_content.find(action_marker)
    # Search for the next high-level if or the end of the function
    # actually let's just find the next 'if (action ===' and replace up to there
    # or find 'if (action === 'ACT_SELF_HEAL') {'
    next_action_marker = "if (action === 'ACT_SELF_HEAL') {"
    action_end_idx = new_content.find(next_action_marker)
    
    if action_start_idx != -1 and action_end_idx != -1:
        final_content = new_content[:action_start_idx] + new_action_code + "\n\n    " + new_content[action_end_idx:]
        with open(path, 'w') as f:
            f.write(final_content)
        print("Full restoration complete.")
    else:
        print("Failed to find handleAction block.")
else:
    print("Failed to find ExpertDiagnosticCard block.")
