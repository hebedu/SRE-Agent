import sys

path = '/Users/admin/Downloads/ai-sre-console_v2/src/App.tsx'
with open(path, 'r') as f:
    content = f.read()

# Precise replacement of the InspectionTaskList component
new_component = r"""const InspectionTaskList: React.FC<{ onAction?: any, setShowBanner?: any, setSelectedTask?: any, analysisStatus?: any }> = ({ onAction, setShowBanner, setSelectedTask, analysisStatus }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between mb-2">
      <div className="flex gap-2">
        {['全部', '异常/风险', '待处理', '已解决'].map((tag, i) => (
          <button key={i} className={`px-3 py-1 rounded text-[10px] font-bold border transition-all ${i === 0 ? 'bg-blue-500/20 border-blue-500/40 text-blue-400' : 'bg-slate-800/40 border-slate-700/50 text-slate-500 hover:text-slate-300'}`}>
            {tag}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative group">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="搜索任务名称/摘要..." className="bg-black/30 border border-slate-800 rounded-md pl-8 pr-3 py-1.5 text-[10px] text-slate-300 focus:outline-none focus:border-blue-500/50 w-64 transition-all" />
        </div>
      </div>
    </div>

    <div className="space-y-4">
      {[
        { 
          name: '核心支付链路稳定性巡检', 
          target: '集群 (K8s-Prod-Main)', 
          status: '高风险', 
          riskLevel: '高', 
          summary: '检测到支付网关 (payment-gw) 近 5 分钟 5xx 错误率突增至 15%，疑似三方依赖超时。',
          updatedAt: '2024-04-12 14:05:12'
        },
        { 
          name: '数据库慢查询扫描', 
          target: '实例 (MySQL-Order-Primary)', 
          status: '异常', 
          riskLevel: '中', 
          summary: '存在 12 条执行超过 3s 的慢 SQL，主要集中在 order_info 表的全表扫描。',
          updatedAt: '2024-04-12 13:50:45'
        },
        { 
          name: '全站 SSL 证书有效性监控', 
          target: '主机 (Slb-External-Node)', 
          status: '待查看', 
          riskLevel: '低', 
          summary: '有 2 个域名的证书即将于 15 天后到期，请及时更新。',
          updatedAt: '2024-04-12 10:20:00'
        },
        { 
          name: '基础架构存储空间巡检', 
          target: '集群 (Ceph-Storage-01)', 
          status: '正常', 
          riskLevel: '低', 
          summary: '存储系统各分区使用率均在 60% 以下，IOPS 及延时指标正常。',
          updatedAt: '2024-04-12 09:15:33'
        }
      ].map((task, idx) => (
        <div 
          key={idx} 
          onClick={() => { setSelectedTask(task); setShowBanner(true); }}
          className="bg-[#141418] border border-slate-800 rounded-xl p-5 hover:border-blue-500/50 hover:bg-blue-600/[0.02] transition-all group cursor-pointer relative"
        >
          {/* Title & Summary Section */}
          <div className="mb-5">
            <div className="flex items-center gap-3 mb-2.5">
               <div className={`w-1.5 h-1.5 rounded-full ${task.status === '正常' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : task.status === '高风险' ? 'bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]'}`} />
               <h4 className="text-sm font-bold text-slate-100 group-hover:text-blue-400 transition-colors uppercase tracking-tight font-mono">{task.name}</h4>
               <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase text-white ${task.riskLevel === '高' ? 'bg-rose-600' : task.riskLevel === '中' ? 'bg-orange-600' : 'bg-blue-600'}`}>
                 风险:{task.riskLevel}
               </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-bold italic ml-4.5 border-l border-slate-800 pl-3">
               {task.summary}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-y-3 gap-x-8 mb-5 py-3 border-y border-slate-800/50 pointer-events-none">
             <div className="flex items-center gap-4">
                <span className="text-[10px] text-slate-500 font-bold uppercase w-16">巡检对象</span>
                <span className="text-[11px] text-slate-300 font-medium">{task.target}</span>
             </div>
             <div className="flex items-center gap-4">
                <span className="text-[10px] text-slate-500 font-bold uppercase w-16">当前状态</span>
                <span className={`text-[11px] font-black ${task.status === '正常' ? 'text-emerald-500' : task.status === '高风险' ? 'text-rose-500' : 'text-orange-500'}`}>{task.status}</span>
             </div>
             <div className="flex items-center gap-4">
                <span className="text-[10px] text-slate-500 font-bold uppercase w-16">最近更新</span>
                <span className="text-[11px] text-slate-400 font-mono tracking-tight">{task.updatedAt}</span>
             </div>
          </div>

          {/* Action Footer */}
          <div className="flex justify-end items-center gap-3">
            {analysisStatus?.[task.name] === 'completed' && (
              <button 
                onClick={(e) => { e.stopPropagation(); onAction?.('VIEW_REPORT', { format: '0412_phased', ...task }); }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 hover:border-blue-500/50 text-slate-400 hover:text-blue-400 text-[11px] font-bold transition-all active:scale-95"
              >
                <FileText size={14} /> 查看分析报告
              </button>
            )}
            <button 
              onClick={(e) => { e.stopPropagation(); onAction?.('START_INSPECTION_ANALYSIS', { task }); }}
              disabled={analysisStatus?.[task.name] === 'analyzing'}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 text-white text-[11px] font-black hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 active:scale-95 group-hover:scale-105 disabled:opacity-50"
            >
              {analysisStatus?.[task.name] === 'analyzing' ? <RefreshCw size={14} className="animate-spin" /> : <Bot size={12} />}
              {analysisStatus?.[task.name] === 'analyzing' ? '分析中...' : '开始分析'}
            </button>
          </div>
        </div>
      ))}
    </div>

    <div className="flex items-center justify-between pt-6 border-t border-slate-800/80 text-[10px] text-slate-500">
      <div className="flex items-center gap-4">
         <span className="font-bold">第 1-4 条，共 24 条</span>
         <div className="flex items-center gap-1.5">
            <span className="opacity-50">每页显示:</span>
            <select className="bg-transparent border-none focus:ring-0 cursor-pointer font-bold text-slate-300">
               <option>10</option>
               <option>20</option>
               <option>50</option>
            </select>
         </div>
      </div>
      <div className="flex gap-2">
        <button className="px-3 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700/50 hover:bg-slate-700 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed font-bold" disabled>PREV</button>
        <button className="px-3.5 py-1.5 bg-blue-600 rounded-lg text-white font-black shadow-lg shadow-blue-500/20">1</button>
        <button className="px-3.5 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700/50 hover:bg-slate-700 hover:text-white transition-all font-bold">2</button>
        <button className="px-3 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700/50 hover:bg-slate-700 hover:text-white transition-all font-bold">NEXT</button>
      </div>
    </div>
  </div>
);"""

start_marker = "const InspectionTaskList: React.FC<{"
end_marker = "const InspectionDetailReport = () => ("

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    final_content = content[:start_idx] + new_component + "\n\n" + content[end_idx:]
    with open(path, 'w') as f:
        f.write(final_content)
    print("InspectionTaskList fully rewritten and fixed.")
else:
    print("Markers not found.")
