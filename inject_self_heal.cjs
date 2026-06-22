const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `const ActionConfirmCard = ({ data, onAction }: any) => {`;

const insertStr = `
const RISK: Record<string, { label: string, cls: string }> = {
  low: { label: "低", cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  mid: { label: "中", cls: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  high: { label: "高", cls: "text-rose-400 bg-rose-500/10 border-rose-500/30" }
};
const ORD: Record<string, number> = { low: 0, mid: 1, high: 2 };
const TRUST: Record<string, { label: string, cls: string }> = {
  high: { label: "较高", cls: "text-emerald-400" },
  mid: { label: "中等", cls: "text-amber-400" },
  low: { label: "偏低", cls: "text-rose-400" }
};

const DISCLAIMER = "# 本脚本及其风险/范围/理由均由 AI 生成，未经真实环境校验。系统未执行/未下发。请人工独立核验后在受控环境执行。";

export function staticCheck(script: string) {
  const s = script.toLowerCase();
  const findings: { sev: 'high' | 'mid' | 'low'; t: string }[] = [];
  let derived: 'low' | 'mid' | 'high' = 'low';
  let destructive = false;

  const bump = (r: 'low' | 'mid' | 'high') => {
    if (ORD[r] > ORD[derived]) derived = r;
  };

  if (/\b(drop\\s+table|truncate)\\b|delete\\s+from/.test(s)) {
    findings.push({ sev: 'high', t: '破坏性数据操作（delete / drop / truncate）' });
    bump('high');
    destructive = true;
  }
  if (/\b(kill|restart|reboot|shutdown)\\b/.test(s)) {
    findings.push({ sev: 'high', t: '进程 / 服务重启类操作' });
    bump('high');
    destructive = true;
  }
  if (/maximumpoolsize|max_connections|capacity|\\bscale\\b/.test(s)) {
    findings.push({ sev: 'high', t: '容量 / 连接池调整，可能放大下游共享资源压力' });
    bump('high');
  }
  if (/alter\\s+table/.test(s)) {
    findings.push({ sev: 'mid', t: '表结构变更，可能加锁阻塞' });
    bump('mid');
  }
  if (/ratelimit|circuitbreaker|fallback|degrade/.test(s)) {
    findings.push({ sev: 'mid', t: '流量整形（限流 / 熔断 / 降级）' });
    bump('mid');
  }
  if (/add\\s+index/.test(s)) {
    findings.push({ sev: 'mid', t: '在线索引新增，DDL 可能锁表' });
    bump('mid');
  }
  if (findings.length === 0) {
    findings.push({ sev: 'low', t: '未匹配到已知高危模式（不代表安全）' });
  }
  return { derived, findings, destructive };
}

export function assess(cand: any, known: string[]) {
  const sc = staticCheck(cand.script);
  const ungrounded = cand.entities.filter((e: string) => !known.includes(e));
  const flags: { sev: 'high' | 'mid' | 'low'; t: string }[] = [];
  
  if (ORD[sc.derived] > ORD[cand.declaredRisk]) {
    flags.push({ t: \`风险被上调：模型评「\${RISK[cand.declaredRisk].label}」/ 核验「\${RISK[sc.derived].label}」\`, sev: 'high' });
  }
  if (sc.destructive) flags.push({ t: '含破坏性操作，采纳需额外确认', sev: 'high' });
  if (!cand.reasonConsistent) flags.push({ t: '推荐原因与脚本实际动作不一致', sev: 'high' });
  if (ungrounded.length) flags.push({ t: \`引用了根因未包含的实体：\${ungrounded.join("、")}\`, sev: 'mid' });
  if (!cand.scopeVerified) flags.push({ t: '影响范围为模型声明，未能核验', sev: 'mid' });
  
  const effective = ORD[sc.derived] > ORD[cand.declaredRisk] ? sc.derived : cand.declaredRisk;
  let conf = cand.confidence - flags.reduce((a, f) => a + (f.sev === 'high' ? 0.2 : 0.1), 0);
  const trust = conf >= 0.7 ? 'high' : conf >= 0.45 ? 'mid' : 'low';
  
  return { ...sc, ungrounded, flags, effective, trust };
}

const SelfHealRecommendationCard = ({ data, onAction }: any) => {
  const { alertTitle, rootCauseText, knownEntities, candidates } = data;
  const [detailId, setDetailId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const items = useMemo(() => {
    return candidates.map((c: any) => ({ cand: c, ev: assess(c, knownEntities) }));
  }, [candidates, knownEntities]);

  const [sortBy, setSortBy] = useState<'trust' | 'risk'>('trust');
  const sorted = useMemo(() => {
    const arr = [...items];
    if (sortBy === 'risk') {
      arr.sort((a, b) => ORD[b.ev.effective] - ORD[a.ev.effective]);
    } else {
      const t: Record<string, number> = { high: 0, mid: 1, low: 2 };
      arr.sort((a, b) => t[a.ev.trust] - t[b.ev.trust]);
    }
    return arr;
  }, [items, sortBy]);



  const copyScript = (it: any) => {
    navigator.clipboard?.writeText(DISCLAIMER + "\\n" + it.cand.script).catch(() => {});
  };

  const exportPlan = (it: any) => {
    const head = \`# 全 AI 生成推荐修复方案（仅供参考，系统不执行）\\n# 告警：\${alertTitle}\\n# 根因：\${rootCauseText}\\n# 方案：\${it.cand.title}\\n# 模型声明风险：\${RISK[it.cand.declaredRisk].label} · 核验推导：\${RISK[it.ev.derived].label} · 操作风险：\${RISK[it.ev.effective].label}\\n# 核验告警：\${it.ev.flags.map((f:any)=>f.t).join(" | ")||"无"}\\n\${DISCLAIMER}\\n\\n\`;
    try {
      const b = new Blob([head + it.cand.script], { type: "text/plain" });
      const u = URL.createObjectURL(b);
      const a = document.createElement("a");
      a.href = u;
      a.download = \`AI修复方案_\${it.cand.title}.txt\`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(u);
    } catch(e) {}
  };

  return (
    <div className="w-full max-w-4xl font-sans mt-3">
      <div className="rounded-2xl border border-white/8 bg-[#161c2e] p-5 shadow-2xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-violet-400">✦</span>
          <h3 className="font-bold text-slate-100 text-sm">推荐修复方案（全部由 AI 生成）</h3>
        </div>
        <div className="text-[11px] text-rose-200 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2.5 mt-3 mb-4 leading-relaxed font-bold shadow-inner">
          ⚠ 本方案由 AI 生成,其脚本与风险评级、适用范围、推荐原因均为模型产出,可能存在幻觉。<span className="text-rose-100">系统不会自动执行任何脚本</span>，请务必人工充分评估后,再在受控环境中落地。
        </div>

        <div className="flex items-center gap-3 mb-3 text-[11px]">
          <span className="text-slate-400 font-bold">{sorted.length} 个 AI 候选</span>
          <div className="ml-auto flex items-center gap-1.5 font-bold">
            <span className="text-slate-500">排序</span>
            <button onClick={() => setSortBy("trust")} className={\`px-2 py-1 rounded border transition-colors \${sortBy === "trust" ? "border-indigo-400/50 bg-indigo-500/15 text-indigo-300" : "border-slate-700/50 text-slate-400 hover:bg-slate-800/50"}\`}>按可信度</button>
            <button onClick={() => setSortBy("risk")} className={\`px-2 py-1 rounded border transition-colors \${sortBy === "risk" ? "border-indigo-400/50 bg-indigo-500/15 text-indigo-300" : "border-slate-700/50 text-slate-400 hover:bg-slate-800/50"}\`}>高风险优先</button>
          </div>
        </div>

        <div className="space-y-3">
          {sorted.map((it: any) => {
            const { cand, ev } = it;
            const open = detailId === cand.id;
            const sel = selected === cand.id;

            const mismatch = ev.derived !== cand.declaredRisk;
            const hi = ev.effective === "high";

            return (
              <div key={cand.id} className={\`rounded-xl border p-3.5 transition-all cursor-pointer \${sel ? "border-indigo-500/50 bg-indigo-500/[0.04] shadow-[0_0_15px_rgba(99,102,241,0.08)]" : "border-slate-800/80 bg-slate-900/30 hover:bg-slate-900/60"}\`} onClick={() => { setSelected(cand.id); setDetailId(p => p === cand.id ? null : cand.id); }}>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={\`text-[9px] font-black border rounded px-1.5 py-0.5 uppercase \${RISK[ev.effective].cls}\`}>操作风险 {RISK[ev.effective].label}</span>
                  <span className={\`text-[9px] font-bold border rounded px-1.5 py-0.5 inline-flex items-center gap-1 \${TRUST[ev.trust].cls}\`}>可信度 {TRUST[ev.trust].label}</span>

                </div>
                <div className="text-sm font-bold text-slate-200 mb-1.5">{cand.title}</div>
                {ev.flags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {ev.flags.map((f: any, i: number) => (
                      <span key={i} className={\`text-[9px] font-bold rounded px-1.5 py-0.5 border flex items-center gap-1 \${f.sev === "high" ? "text-rose-300 bg-rose-500/10 border-rose-500/30" : "text-amber-300 bg-amber-500/10 border-amber-500/25"}\`}>
                        <AlertTriangle size={10} /> {f.t}
                      </span>
                    ))}
                  </div>
                )}
                
                {open && (
                  <div className="mt-4 pt-3 border-t border-slate-800/60 space-y-3" onClick={e => e.stopPropagation()}>
                    <div className={\`text-[10px] font-bold rounded-lg px-3 py-2 border \${hi ? "text-rose-200 bg-rose-500/10 border-rose-500/30" : "text-amber-200 bg-amber-500/8 border-amber-500/20"}\`}>
                      {hi ? "⚠ 操作风险高 · 系统不会执行，请人工充分评估后在受控环境落地" : "仅供参考 · 系统不执行，请人工在受控环境落地"}
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-widest">推荐原因</div>
                      <div className="text-[11px] text-slate-300 font-medium leading-relaxed">{cand.reason}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-widest">影响范围</div>
                      <div className="text-[11px] text-slate-300 font-medium leading-relaxed">{cand.scope}</div>
                    </div>
                    <div>
                      <div className="flex items-center mb-1.5 gap-2">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">生成脚本预览</span>
                        <span className="text-[9px] text-slate-400 font-bold border border-slate-700 rounded px-1.5 py-0.5 uppercase">只读</span>
                        <button onClick={(e) => { e.stopPropagation(); copyScript(it); }} className="ml-auto flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 rounded px-2 py-1 bg-indigo-500/10 transition-colors"><Copy size={12}/> 复制内容</button>
                      </div>
                      <pre className="font-mono text-[11px] leading-relaxed bg-slate-950/80 border border-slate-800/80 rounded-lg p-3 overflow-auto max-h-48 text-slate-300 whitespace-pre-wrap select-text">{cand.script}</pre>
                    </div>
                    <div className="flex justify-end pt-1">
                      <button onClick={(e) => { e.stopPropagation(); exportPlan(it); }} className="flex items-center gap-1 text-[10px] font-bold border border-slate-700/80 rounded-lg px-3 py-1.5 hover:bg-slate-800/60 text-slate-300 transition-colors"><Download size={12}/> 导出完整方案</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        

      </div>
    </div>
  );
};
if (!content.includes('const SelfHealRecommendationCard')) {
  content = content.replace(targetStr, insertStr + '\\n' + targetStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Injection successful');
} else {
  console.log('Already injected');
}
