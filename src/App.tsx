import React, { useState, useRef, useEffect, type ReactNode } from 'react';
import {
  AlertCircle, Search, Calendar, TrendingUp, Mic, Image as ImageIcon, Send, Info,
  Bot, User, CheckCircle2, Clock, Zap, MoreHorizontal, Terminal, Activity,
  ShieldAlert, Settings, ClipboardList, BarChart2, BookOpen, HeartPulse,
  FileText, Download, Play, Check, ChevronDown, ChevronRight, Home,
  Plus, Bell, Network, CheckSquare, Database, Shield, ChevronLeft, ChevronUp, Paperclip, X,
  AlertTriangle, Box, Filter, SlidersHorizontal, ArrowUpDown, Cpu, Server, Layers, HardDrive, Brain, Flame, Sparkles, Minus, Maximize,
  PlusCircle, BarChart3, LayoutDashboard, ListTodo, FilePieChart, ArrowUpRight, ArrowDownRight, RefreshCw, History, Maximize2, Folder, PanelLeft, PanelLeftClose, ShieldCheck,
  Monitor, ArrowRight, Code, ClipboardCheck, Target, ArrowLeft, Book, Files, Share2, Quote, ExternalLink, Library, Loader2,
  Sun, Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
type MessageType = 'user' | 'ai' | 'system';
type ContentType = 'text' | 'voice' | 'image' | 'confirm' | 'analysis' | 'sop' | 'report' | 'target_select' | 'rule_draft' | 'frequency_select' | 'task_summary' | 'rule_review' | 'schedule_review' | 'task_success' | 'incident_report' | 'change_list' | 'recovery_action' | 'inspection_type' | 'inspection_cron_confirm' | 'inspection_progress' | 'inspection_result_table' | 'action_confirm' | 'action_execution' | 'alarm_context' | 'inspection_task_select' | 'log_cluster_selection' | 'inspection_diagnostic_report' | 'inspection_conclusion' | 'inspection_deep_dive' | 'inspection_closure' | 'log_analysis_init' | 'log_analysis_retrieval' | 'log_analysis_correlation' | 'log_analysis_evidence' | 'log_analysis_diagnosis' | 'log_analysis_action';
type MenuKey = 'home' | 'diagnostic' | 'logs' | 'capacity' | 'knowledge' | 'inspection' | 'report' | 'alerts' | 'network' | 'settings' | 'tasks' | 'assistant';

interface InspectionTarget {
  id: string;
  name: string;
  type: 'DB' | 'Redis' | 'MQ' | 'Service' | 'LB' | 'Host' | 'VPC' | 'Pod';
  environment: 'prod' | 'staging';
  cluster: string;
  status: 'online' | 'warning' | 'offline';
}

const MOCK_TARGETS: InspectionTarget[] = [
  // 数据库实例 (DB)
  { id: 'db-1', name: 'mysql-order-primary', type: 'DB', environment: 'prod', cluster: 'db-cluster-01', status: 'online' },
  { id: 'db-2', name: 'mysql-order-replica', type: 'DB', environment: 'prod', cluster: 'db-cluster-01', status: 'online' },
  { id: 'db-3', name: 'pg-user-master', type: 'DB', environment: 'prod', cluster: 'db-cluster-02', status: 'warning' },
  // Redis
  { id: 'redis-1', name: 'redis-cache-main', type: 'Redis', environment: 'prod', cluster: 'redis-cluster-01', status: 'online' },
  { id: 'redis-2', name: 'redis-session-store', type: 'Redis', environment: 'prod', cluster: 'redis-cluster-02', status: 'online' },
  // MQ
  { id: 'mq-1', name: 'kafka-broker-node-1', type: 'MQ', environment: 'prod', cluster: 'kafka-prod-01', status: 'online' },
  { id: 'mq-2', name: 'rocketmq-namesrv-A', type: 'MQ', environment: 'prod', cluster: 'rocketmq-core', status: 'online' },
  { id: 'mq-3', name: 'rabbitmq-vhost-main', type: 'MQ', environment: 'staging', cluster: 'rabbitmq-test', status: 'warning' },
  // 应用服务 (Service)
  { id: 'svc-1', name: 'order-api-service', type: 'Service', environment: 'prod', cluster: 'k8s-prod-1', status: 'online' },
  { id: 'svc-2', name: 'payment-processor', type: 'Service', environment: 'prod', cluster: 'k8s-prod-1', status: 'online' },
  { id: 'svc-3', name: 'auth-gateway', type: 'Service', environment: 'prod', cluster: 'k8s-prod-1', status: 'online' },
  // 负载均衡 (LB)
  { id: 'lb-1', name: 'clb-external-ingress', type: 'LB', environment: 'prod', cluster: 'clb-sh-main', status: 'online' },
  { id: 'lb-2', name: 'slb-internal-grpc', type: 'LB', environment: 'prod', cluster: 'slb-sh-core', status: 'online' },
  // 云主机 (Host)
  { id: 'h-1', name: 'cvm-jumpbox-01', type: 'Host', environment: 'prod', cluster: 'cvm-manage', status: 'online' },
  { id: 'h-2', name: 'cvm-worker-node-102', type: 'Host', environment: 'prod', cluster: 'cvm-worker-pool', status: 'warning' },
  { id: 'h-3', name: 'cvm-db-backup-svr', type: 'Host', environment: 'prod', cluster: 'cvm-storage', status: 'online' },
  // VPC
  { id: 'vpc-1', name: 'vpc-prod-main-sh', type: 'VPC', environment: 'prod', cluster: 'network-region-1', status: 'online' },
  { id: 'vpc-2', name: 'vpc-test-sandbox', type: 'VPC', environment: 'staging', cluster: 'network-region-1', status: 'online' },
  // Pod
  { id: 'pod-1', name: 'nginx-ingress-controller-p9x', type: 'Pod', environment: 'prod', cluster: 'k8s-prod-1', status: 'online' },
  { id: 'pod-2', name: 'redis-sentinel-pod-a21', type: 'Pod', environment: 'prod', cluster: 'k8s-prod-1', status: 'online' },
  { id: 'pod-3', name: 'app-error-logger-v2', type: 'Pod', environment: 'staging', cluster: 'k8s-test-1', status: 'offline' },
  { id: 'pod-4', name: 'worker-pod-res-01', type: 'Pod', environment: 'prod', cluster: 'k8s-prod-1', status: 'online' },
  { id: 'pod-5', name: 'worker-pod-res-02', type: 'Pod', environment: 'prod', cluster: 'k8s-prod-1', status: 'online' },
  { id: 'pod-6', name: 'worker-pod-res-03', type: 'Pod', environment: 'prod', cluster: 'k8s-prod-1', status: 'online' },
  { id: 'pod-7', name: 'batch-job-pod-77', type: 'Pod', environment: 'prod', cluster: 'k8s-prod-2', status: 'online' },
  { id: 'pod-8', name: 'batch-job-pod-78', type: 'Pod', environment: 'prod', cluster: 'k8s-prod-2', status: 'online' },
  { id: 'pod-9', name: 'batch-job-pod-79', type: 'Pod', environment: 'prod', cluster: 'k8s-prod-2', status: 'online' },
  { id: 'pod-10', name: 'test-env-pod-tmp', type: 'Pod', environment: 'staging', cluster: 'k8s-test-1', status: 'online' },
  { id: 'pod-11', name: 'api-gateway-pod-1', type: 'Pod', environment: 'prod', cluster: 'k8s-prod-1', status: 'online' },
  { id: 'pod-12', name: 'api-gateway-pod-2', type: 'Pod', environment: 'prod', cluster: 'k8s-prod-1', status: 'online' },
  { id: 'pod-13', name: 'api-gateway-pod-3', type: 'Pod', environment: 'prod', cluster: 'k8s-prod-1', status: 'online' },
];

const MOCK_INSPECTION_HISTORY: Record<string, any[]> = {
  'TENCENT-DB-001': [
    { id: 'h1', updatedAt: '2024-04-14 10:00:00', status: '健康', summary: '各项指标运行正常，主从同步延迟 < 1ms。' },
    { id: 'h2', updatedAt: '2024-04-13 14:30:00', status: '健康', summary: '连接数略有波动但处于安全阈值内。' },
    { id: 'h3', updatedAt: '2024-04-12 09:15:00', status: '异常', summary: '发现 2 条慢查询 SQL，已命中索引优化建议。' },
  ],
  'REDIS-CLUSTER-PROD': [
    { id: 'r1', updatedAt: '2024-04-14 11:20:00', status: '正常', summary: '内存碎片率 1.05，运行平稳。' },
    { id: 'r2', updatedAt: '2024-04-11 20:05:00', status: '异常', summary: '发现热 Key 冲突，影响 QPS 约 5%。' },
  ],
  'CORE-PAYMENT-SVC': [
    { id: 'p1', updatedAt: '2024-04-14 12:00:00', status: '健康', summary: '错误率 0.01%，SLA 达标。' },
    { id: 'p2', updatedAt: '2024-04-10 18:45:00', status: '高风险', summary: 'Pod 频繁重启，疑似 OOM 问题前兆。' },
  ],
};

interface Message {
  id: string;
  type: MessageType;
  contentType: ContentType;
  content: string;
  timestamp: string;
  data?: any;
  retrievalData?: {
    libCount: number;
    docCount: number;
    hitCount: number;
    evidenceCount: number;
    keywords: string;
    topDocs: { title: string; score: number; }[];
    sources: any[];
  };
  hideRetrievalCard?: boolean;
  hideSourceButton?: boolean;
}

interface Attachment {
  id: string;
  type: 'log' | 'template' | 'image' | 'file';
  title: string;
  content: string;
}

interface Session {
  id: string;
  menuId: string;
  title: string;
  messages: Message[];
  timestamp: number;
}

interface Alarm {
  id: string;
  level: 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
  status: 'active' | 'recovered' | 'silenced' | 'converged';
  title: string;
  service: string;
  startTime: string;
  duration?: string;
  metrics: string;
  threshold: string;
  tags: string[];
  convergenceStrategy?: 'time' | 'topo' | 'semantic' | 'root' | 'dup';
  filterStrategy?: 'jitter' | 'maintenance' | 'cascade' | 'dup_filter';
  isPrimary?: boolean;
  convergedCount?: number;
  convergenceDetails?: string;
  recoveredTime?: string;
  type: '指标' | '链路' | '日志' | '拨测' | '其他';
}

const QUICK_RULES = [
  '检测 CPU 使用率 > 80% 持续 5 分钟',
  '检测 内存使用率 > 80% 持续 5 分钟',
  '检测 GC 平均耗时 > 200ms 且频率异常升高',
  '检测 网络延迟 > 200ms 或丢包率 > 5%',
  '检测 服务错误率 > 5% 持续 3 分钟'
];

// --- Menu Configuration ---
const MENU_ITEMS = [
  { id: 'home', label: '新会话', icon: Plus },
  { id: 'diagnostic', label: '根因分析', icon: ShieldAlert },
  { id: 'logs', label: '告警收敛', icon: Zap },
  { id: 'inspection', label: '智能巡检', icon: Activity },
  { id: 'knowledge', label: '知识库', icon: BookOpen },
  { id: 'network', label: '资源拓扑', icon: Network },
  { id: 'capacity', label: '采控集成', icon: Cpu },
  { id: 'settings', label: '集成设置', icon: Settings },
  { id: 'tasks', label: '模型接入', icon: Brain },
];

// --- Components ---

const SRECard = ({
  status,
  title,
  icon: Icon,
  badge,
  children,
  footer,
  pulse = false,
  statusColorHex,
  onClick,
  useStandardRounded = false,
  hideStatusBorder = false
}: {
  status: 'critical' | 'running' | 'normal' | 'warning' | 'custom',
  title: string,
  icon: any,
  badge?: string,
  children: ReactNode,
  footer?: ReactNode,
  pulse?: boolean,
  statusColorHex?: string,
  onClick?: () => void,
  useStandardRounded?: boolean,
  hideStatusBorder?: boolean
}) => {
  const statusColors = {
    critical: 'border-l-[#f43f5e]',
    running: 'border-l-[#6366f1]', // 切换至 Indigo
    normal: 'border-l-[#10b981]',
    warning: 'border-l-[#f97316]',
    custom: '',
  };

  const style = status === 'custom' && statusColorHex && !hideStatusBorder ? { borderLeftColor: statusColorHex } : {};

  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-[var(--bg-alarm)] ${hideStatusBorder ? '' : `border-l-4 ${statusColors[status]}`} ${useStandardRounded ? 'rounded-2xl' : 'rounded-r-lg'} p-4 mb-4 shadow-sm relative overflow-hidden group hover:bg-[var(--bg-alarm-hover)] transition-all ${onClick ? 'cursor-pointer hover:ring-1 hover:ring-indigo-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]' : ''}`}
      style={style}
    >
      {pulse && (
        <motion.div
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-indigo-500/5 pointer-events-none"
        />
      )}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3">
          {Icon && (
            <div
              className={`p-2 rounded-xl border flex items-center justify-center transition-all ${status === 'critical' ? 'bg-rose-500/10 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]' :
                  status === 'running' ? 'bg-indigo-500/10 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]' :
                    status === 'normal' ? 'bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' :
                      status === 'warning' ? 'bg-orange-500/10 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]' :
                        'bg-slate-800/50 border-slate-700/50'
                }`}
              style={status === 'custom' && statusColorHex ? {
                backgroundColor: `${statusColorHex}15`,
                borderColor: `${statusColorHex}30`,
                boxShadow: `0 0 15px ${statusColorHex}20`
              } : {}}
            >
              <Icon
                size={18}
                className={
                  status === 'critical' ? 'text-rose-500' :
                    status === 'running' ? 'text-indigo-500' :
                      status === 'normal' ? 'text-emerald-500' :
                        status === 'warning' ? 'text-orange-500' :
                          'text-slate-400'
                }
                style={status === 'custom' && statusColorHex ? { color: statusColorHex } : {}}
              />
            </div>
          )}
          <h3 className="font-bold text-sm text-slate-100 group-hover:text-slate-100 transition-colors">{title}</h3>
        </div>
        {badge && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${status === 'critical' ? 'bg-rose-500/20 text-rose-500' : 'bg-slate-800 text-slate-400'}`}>
            {badge}
          </span>
        )}
      </div>
      <div className="text-xs text-slate-400 font-mono space-y-1">
        {children}
      </div>
      {footer && (
        <div className="mt-4 pt-3 border-t border-slate-800/50">
          {footer}
        </div>
      )}
    </motion.div>
  );
};

// --- Components ---

const AlarmTableRow: React.FC<{ alarm: Alarm, onDiagnose: (a: Alarm) => void }> = ({ alarm, onDiagnose }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusMap = {
    active: { label: '进行中', icon: Zap, color: 'text-rose-500', char: '🔥' },
    recovered: { label: '已恢复', icon: CheckCircle2, color: 'text-emerald-500', char: '✅' },
    silenced: { label: '已静默', icon: Bell, color: 'text-slate-400', char: '🔇' },
    converged: { label: '已收敛', icon: Box, color: 'text-blue-400', char: '📦' },
  };

  const levelColors = {
    P0: 'text-rose-500',
    P1: 'text-orange-500',
    P2: 'text-yellow-500',
    P3: 'text-blue-500',
    P4: 'text-slate-500'
  };

  const st = statusMap[alarm.status];

  return (
    <>
      <tr
        onClick={() => setIsExpanded(!isExpanded)}
        className={`group cursor-pointer transition-colors border-b border-slate-800/50 hover:bg-slate-900/20 ${isExpanded ? 'bg-slate-900/30' : ''}`}
      >
        <td className="py-4 pl-4 whitespace-nowrap">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${st.color.replace('text-', 'bg-')}/10 ${st.color} ${st.color.replace('text-', 'border-')}/20`}>
            {st.label}
          </span>
        </td>
        <td className="py-4">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800/50 border border-slate-700/50 ${levelColors[alarm.level]}`}>
            {alarm.level === 'P0' ? '严重' : alarm.level === 'P1' ? '重要' : alarm.level === 'P2' ? '次要' : alarm.level === 'P3' ? '警告' : '信息'}
          </span>
        </td>
        <td className="py-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-200 group-hover:text-blue-400 transition-colors flex items-center gap-2">
              {alarm.title}
              {isExpanded ? <ChevronDown size={14} className="text-slate-600" /> : <ChevronRight size={14} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-all" />}
            </span>
          </div>
        </td>
        <td className="py-4 text-xs text-slate-400 font-mono italic">{alarm.service}</td>
        <td className="py-4 text-xs text-slate-400">{alarm.startTime.split(' ')[1]}</td>
        <td className="py-4 text-xs font-mono">
          <span className="text-blue-400 font-bold">{alarm.metrics.split('=')[1] || alarm.metrics}</span>
          <span className="text-slate-600 ml-1 text-[10px]">{alarm.threshold}</span>
        </td>
        <td className="py-4">

          {alarm.status === 'converged' && (
            <span className="text-[10px] text-slate-500 flex items-center gap-1">📦 被收敛</span>
          )}
        </td>
        <td className="py-4 pr-4 text-right">
          <button
            onClick={(e) => { e.stopPropagation(); onDiagnose(alarm); }}
            className="text-[11px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 ml-auto"
          >
            <Search size={12} /> 诊断
          </button>
        </td>
      </tr>

      <AnimatePresence>
        {isExpanded && (
          <motion.tr
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-black/20"
          >
            <td colSpan={8} className="p-0">
              <div className="px-14 py-4 border-b border-blue-500/10 flex flex-col gap-4">
                <div className="flex items-center gap-6 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">标签:</span>
                    <div className="flex gap-1">
                      {alarm.tags.map(t => <span key={t} className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded">#{t}</span>)}
                    </div>
                  </div>
                  <div className="w-px h-3 bg-slate-800" />
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">收敛键:</span>
                    <span className="text-blue-400/70 font-mono italic">alertname=HighErrorRate,service={alarm.service}</span>
                  </div>
                </div>

                {alarm.convergenceDetails && (
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-slate-500">相关上下文:</span>
                    <span className="text-slate-300 italic">{alarm.convergenceDetails}</span>
                  </div>
                )}

                <div className="flex gap-2 mt-2">
                  <button onClick={() => onDiagnose(alarm)} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-lg flex items-center gap-2 transition-all shadow-lg active:scale-95">
                    <Search size={14} /> 一键诊断
                  </button>
                  <button className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold rounded-lg border border-slate-700/50">
                    关联告警
                  </button>
                  <button className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold rounded-lg border border-slate-700/50">
                    静默 2h
                  </button>
                  <button className="px-4 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-500 text-[11px] font-bold rounded-lg border border-emerald-500/30">
                    标记恢复
                  </button>
                  <button className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold rounded-lg border border-slate-700/50">
                    完整详情
                  </button>
                </div>
              </div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
};

// --- Inspection Flow Components ---

const TargetSelectionCard: React.FC<{ data: any, onAction: any }> = ({ data, onAction }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState<string>('DB');

  const types = [
    { key: 'DB', label: '数据库实例' },
    { key: 'Redis', label: 'Redis' },
    { key: 'MQ', label: 'MQ' },
    { key: 'Service', label: '应用服务' },
    { key: 'LB', label: '负载均衡' },
    { key: 'Host', label: '云主机' },
    { key: 'VPC', label: 'VPC' },
    { key: 'Pod', label: 'Pod' },
  ];

  const toggleOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    const allDisplayedIds = displayedTargets.map(t => t.id);
    const areAllSelected = allDisplayedIds.every(id => selectedIds.includes(id));
    
    if (areAllSelected) {
      setSelectedIds(prev => prev.filter(id => !allDisplayedIds.includes(id)));
    } else {
      setSelectedIds(prev => {
        const newIds = [...prev];
        allDisplayedIds.forEach(id => {
          if (!newIds.includes(id)) newIds.push(id);
        });
        return newIds;
      });
    }
  };

  const getSelectionStatus = (count: number) => {
    if (count === 0) return { color: 'text-slate-500', bg: 'bg-slate-500/5', text: '将根据所选巡检对象生成 AI 巡检报告，选择数量越多，生成耗时越长', canExecute: false };
    if (count <= 10) return { color: 'text-slate-400', bg: 'bg-slate-400/10', text: `预计报告生成时长：约 30s ~ 1min`, canExecute: true };
    if (count <= 20) return { color: 'text-blue-400', bg: 'bg-blue-400/10', text: '巡检范围较大，预计报告生成时间将有所增加（约 1~3 分钟）', canExecute: true };
    if (count <= 30) return { color: 'text-yellow-500', bg: 'bg-yellow-500/10', text: '当前巡检范围较大，可能导致报告生成时间明显变长，建议缩小范围或分批执行（约 3~6 分钟）', canExecute: true, hasIcon: true };
    return { color: 'text-rose-500', bg: 'bg-rose-500/10', text: '已超出单次巡检建议上限，可能影响系统性能与报告稳定性，请减少巡检对象数量后再执行', canExecute: false };
  };

  const status = getSelectionStatus(selectedIds.length);

  const displayedTargets = MOCK_TARGETS.filter(t => t.type === activeType && (t.name.includes(search) || t.cluster.includes(search)));

  return (
    <div className="bg-[var(--bg-card)] border border-slate-800 rounded-xl overflow-hidden shadow-2xl w-full max-w-[480px]">
      <div className={`p-2 border-b border-slate-800 flex items-center justify-center transition-all min-h-[32px] ${status.bg}`}>
        <span className={`text-[10px] font-bold ${status.color}`}>
          {status.hasIcon && <span className="mr-1">⚠️</span>}
          {status.text}
        </span>
      </div>
      <div className="p-3 border-b border-slate-800 bg-slate-900/20 flex items-center gap-2">
        <span className="text-xs font-bold text-slate-300">🛠️ 请选择本次巡检的目标对象</span>
      </div>
      <div className="flex h-64">
        {/* Left Panel */}
        <div className="w-[30%] bg-black/20 border-r border-slate-800 flex flex-col py-1 overflow-y-auto no-scrollbar">
          {types.map(type => {
            const typeTargetsCount = MOCK_TARGETS.filter(t => t.type === type.key).length;
            return (
              <button
                key={type.key}
                onClick={() => setActiveType(type.key)}
                className={`flex items-center justify-between px-3 py-2.5 text-[11px] font-bold transition-all ${activeType === type.key ? 'bg-blue-600/10 text-blue-400 border-r-2 border-blue-500' : 'text-slate-400 hover:bg-slate-900/20'}`}
              >
                <span>{type.label}({typeTargetsCount})</span>
              </button>
            );
          })}
        </div>

        {/* Right Panel */}
        <div className="w-[70%] flex flex-col">
          <div className="p-2 border-b border-slate-800 bg-black/10">
            <div className="relative">
              <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="搜索对象名称..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded py-1.5 pl-7 pr-2 text-[10px] text-slate-300 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          {displayedTargets.length > 0 && (
            <div 
              onClick={toggleAll}
              className="px-4 py-2 bg-slate-900/30 border-b border-slate-800 flex items-center gap-3 cursor-pointer hover:bg-white/[0.05] transition-all"
            >
              <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${displayedTargets.map(t => t.id).every(id => selectedIds.includes(id)) ? 'bg-blue-600 border-blue-500' : 'border-slate-600'}`}>
                {displayedTargets.map(t => t.id).every(id => selectedIds.includes(id)) && <Check size={10} className="text-white" />}
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">全选当前列表 ({displayedTargets.length})</span>
            </div>
          )}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 no-scrollbar">
            {displayedTargets.length === 0 ? (
              <div className="text-[11px] text-slate-500 text-center py-4 italic">无匹配数据</div>
            ) : (
              displayedTargets.map(t => (
                <div
                  key={t.id}
                  onClick={() => toggleOne(t.id)}
                  className={`flex items-center gap-3 p-2 rounded border cursor-pointer transition-all ${selectedIds.includes(t.id) ? 'bg-blue-600/10 border-blue-500/50' : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600'}`}
                >
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${selectedIds.includes(t.id) ? 'bg-blue-600 border-blue-500' : 'border-slate-600'}`}>
                    {selectedIds.includes(t.id) && <Check size={10} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-200 truncate">{t.name}</span>
                    <span className="text-[10px] text-slate-500 truncate">{t.cluster}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <div className="p-3 bg-[var(--bg-elevated-alt)] border-t border-slate-800 flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-300">共选中: <span className={selectedIds.length > 30 ? 'text-rose-500' : 'text-blue-400'}>{selectedIds.length}</span> 项</span>
        <button
          disabled={!status.canExecute}
          onClick={() => onAction('STEP_RULE', { targets: MOCK_TARGETS.filter(t => selectedIds.includes(t.id)) })}
          className={`text-[11px] font-bold py-1.5 px-6 rounded shadow-lg transition-all ${status.canExecute ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
        >
          确认执行并生成规则草案
        </button>
      </div>
    </div>
  );
};

const RuleReviewCard: React.FC<{ data: any, onAction: any }> = ({ data, onAction }) => (
  <div className="bg-[var(--bg-card)] border border-slate-800 rounded-xl overflow-hidden shadow-2xl w-full max-w-[340px]">
    <div className="p-3 border-b border-slate-800 bg-slate-900/20 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Zap size={14} className="text-blue-400" />
        <span className="text-xs font-bold text-slate-300">巡检规则转译确认</span>
      </div>
      <div className="text-[10px] text-slate-600 font-mono tracking-tighter">NLP to Structured v2</div>
    </div>
    <div className="p-4 space-y-4">
      <div className="p-2.5 rounded bg-slate-900/30 border border-slate-800 italic text-[10px] text-slate-500 mb-2">
        " {data.input} "
      </div>
      <div className="space-y-1.5">
        <div className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          触发条件
        </div>
        <div className="p-3 rounded bg-blue-500/5 border border-blue-500/20 text-[11px] text-slate-200 font-bold leading-relaxed">
          {data.triggers?.length > 0 ? (
            <ul className="list-disc list-inside space-y-1">
              {data.triggers.map((t: string, idx: number) => <li key={idx} className="marker:text-blue-400">{t}</li>)}
            </ul>
          ) : (
            '检测核心服务的资源限制与证书有效期'
          )}
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          执行动作
        </div>
        <div className="p-3 rounded bg-emerald-500/5 border border-emerald-500/20 font-mono text-[10px] text-emerald-400/80 space-y-1">
          {data.actions?.length > 0 ? (
            data.actions.map((a: string, idx: number) => <div key={idx} className="flex gap-2"><span>$</span> {a}</div>)
          ) : (
            <>
              <div>$ /scripts/check_load.sh --threshold 80</div>
              <div>$ /scripts/notify_sre.py --webhook "DingTalk"</div>
            </>
          )}
        </div>
      </div>
    </div>
    <div className="p-3 bg-slate-900/20 border-t border-slate-800 flex gap-2">
      <button onClick={() => onAction('RETRY_RULE')} className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded border border-slate-700/50 transition-all">修改</button>
      <button onClick={() => onAction('STEP_SCHEDULE')} className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded shadow-lg shadow-blue-500/20 transition-all">确认规则</button>
    </div>
  </div>
);

const ScheduleReviewCard: React.FC<{ data: any, onAction: any }> = ({ data, onAction }) => (
  <div className="bg-[var(--bg-card)] border border-slate-800 rounded-xl overflow-hidden shadow-2xl w-full max-w-[340px]">
    <div className="p-3 border-b border-slate-800 bg-slate-900/20 flex items-center gap-2">
      <Clock size={14} className="text-purple-400" />
      <span className="text-xs font-bold text-slate-300">定时设定确认</span>
    </div>
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between p-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
        <div className="space-y-1">
          <div className="text-[9px] font-bold text-slate-500 uppercase">频率描述</div>
          <div className="text-xs font-bold text-slate-200">{data.description || '每天凌晨 03:00'}</div>
          {data.literal && (
            <div className="text-[10px] text-slate-500 font-medium italic mt-0.5 leading-tight">
              {data.literal}
            </div>
          )}
        </div>
        <div className="text-right space-y-1">
          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Cron</div>
          <code className="text-[10px] text-purple-400 font-bold tracking-widest">{data.cron || '0 3 * * *'}</code>
        </div>
      </div>
      <div className="flex items-start gap-2 p-3 rounded-lg bg-black/20 border border-slate-800/50">
        <Calendar size={14} className="text-slate-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="text-[9px] font-bold text-slate-500 uppercase">下次执行时间</div>
          <div className="text-[10px] text-slate-300">2026-04-10 03:00 (预计 7 小时 15 分后)</div>
        </div>
      </div>
    </div>
    <div className="p-3 bg-slate-900/20 border-t border-slate-800 flex gap-2">
      <button 
        onClick={() => onAction('STEP_SCHEDULE_BACK')} 
        className="flex items-center justify-center px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-300 text-[10px] font-bold rounded border border-slate-700/50 transition-all active:scale-95"
      >
        修改
      </button>
      <button onClick={() => onAction('STEP_FINISH')} className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded shadow-lg shadow-blue-500/20">创建巡检任务</button>
    </div>
  </div>
);

const TaskSuccessCard: React.FC<{ data: any, onAction: any }> = ({ data, onAction }) => (
  <div className="bg-[var(--bg-card)] border border-emerald-500/30 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.1)] w-full max-w-[340px]">
    <div className="p-6 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 10 }}
        >
          <CheckCircle2 size={32} className="text-emerald-500" />
        </motion.div>
      </div>
      <h3 className="text-lg font-bold text-slate-200 mb-1">巡检任务创建成功</h3>
      <p className="text-xs text-slate-500 leading-relaxed mb-6">任务已进入自动编排队列，将于设定的周期内自动触发脚本并生成报告。</p>

      <div className="w-full bg-slate-900/40 rounded-xl border border-slate-800 p-3 mb-6 flex flex-col gap-2">
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-slate-500">任务 ID</span>
          <span className="text-slate-300 font-mono">INS-7729-X</span>
        </div>
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-slate-500">覆盖节点</span>
          <span className="text-blue-400 font-bold">{data.hostCount || 4} 台主机</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full">
        <button onClick={() => onAction('VIEW_TASK')} className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg border border-slate-700/50 transition-all">查看任务</button>
        <button onClick={() => onAction('NEW_TASK')} className="py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-lg transition-all shadow-lg shadow-blue-500/10">再建一个</button>
      </div>
    </div>
  </div>
);

const AlarmMonitoringSection: React.FC<{ onDiagnose: (a: Alarm) => void }> = ({ onDiagnose }) => {
  const [filterLevel, setFilterLevel] = useState<string>('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('全部');
  const [onlyPrimary, setOnlyPrimary] = useState(true);

  const [isLevelOpen, setIsLevelOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);

  // Filter Logic
  const filteredAlarms = MOCK_ALARMS.filter(alarm => {
    const matchLevel = filterLevel === '全部' || alarm.level === filterLevel;
    const matchType = filterType === '全部' || alarm.type === filterType;
    const matchSearch = alarm.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alarm.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alarm.service.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPrimary = !onlyPrimary || alarm.isPrimary || alarm.status !== 'converged';

    return matchLevel && matchType && matchSearch && matchPrimary;
  });

  const levelOptions = [
    { label: '全部', key: '全部', clr: 'text-slate-400' },
    { label: '严重', key: 'P0', clr: 'text-rose-500', dot: 'bg-rose-500' },
    { label: '重要', key: 'P1', clr: 'text-orange-500', dot: 'bg-orange-500' },
    { label: '次要', key: 'P2', clr: 'text-yellow-500', dot: 'bg-yellow-500' },
    { label: '警告', key: 'P3', clr: 'text-blue-500', dot: 'bg-blue-500' },
    { label: '信息', key: 'P4', clr: 'text-slate-500', dot: 'bg-slate-500' },
  ];

  const statusOptions = [
    { label: '进行中', char: '🔥', clr: 'text-rose-500' },
    { label: '已恢复', char: '✅', clr: 'text-emerald-500' },
    { label: '静默', char: '🔇', clr: 'text-slate-400' },
    { label: '已收敛', char: '📦', clr: 'text-blue-400' },
  ];

  const typeOptions = ['全部', '指标', '链路', '日志', '拨测', '其他'];

  const selectedLevelObj = levelOptions.find(l => l.key === filterLevel) || levelOptions[0];

  return (
    <div className="w-full space-y-4 flex flex-col">
      {/* Unified Intelligent Control Header - Dropdown Refactor */}
      <div className="bg-[var(--bg-card)] border border-slate-800 rounded-xl px-5 py-4 flex items-center shadow-2xl relative overflow-visible group/header">
        <div className="absolute top-0 right-0 w-64 h-full bg-blue-500/[0.02] -skew-x-12 translate-x-32 pointer-events-none" />

        <div className="flex items-center gap-5 z-20 w-full">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase whitespace-nowrap">级别:</span>
            <div className="relative">
              <button
                onClick={() => setIsLevelOpen(!isLevelOpen)}
                onBlur={() => setTimeout(() => setIsLevelOpen(false), 200)}
                className="flex items-center justify-between gap-3 px-3 py-1.5 bg-slate-900/40 border border-slate-700/50 rounded-lg min-w-[100px] hover:border-slate-500 transition-all text-xs group/btn"
              >
                <div className="flex items-center gap-2">
                  {selectedLevelObj.dot && <span className={`w-1.5 h-1.5 rounded-full ${selectedLevelObj.dot}`} />}
                  <span className={`font-bold ${selectedLevelObj.clr}`}>{selectedLevelObj.label}</span>
                </div>
                <ChevronDown size={12} className={`text-slate-500 transition-transform ${isLevelOpen ? 'rotate-180' : ''}`} />
              </button>
              {isLevelOpen && (
                <div className="absolute top-full left-0 mt-2 w-full bg-[var(--bg-dropdown)] border border-slate-700 rounded-lg shadow-2xl overflow-hidden z-50">
                  {levelOptions.map(l => (
                    <button
                      key={l.key}
                      onClick={() => { setFilterLevel(l.key); setIsLevelOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold hover:bg-white/[0.05] transition-colors ${filterLevel === l.key ? 'bg-blue-500/5 text-blue-400' : 'text-slate-400'}`}
                    >
                      {l.dot && <span className={`w-1.5 h-1.5 rounded-full ${l.dot}`} />}
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="w-px h-4 bg-slate-800" />

          <div className="flex items-center gap-2.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase whitespace-nowrap">类型:</span>
            <div className="relative">
              <button
                onClick={() => setIsTypeOpen(!isTypeOpen)}
                onBlur={() => setTimeout(() => setIsTypeOpen(false), 200)}
                className="flex items-center justify-between gap-3 px-3 py-1.5 bg-slate-900/40 border border-slate-700/50 rounded-lg min-w-[100px] hover:border-slate-500 transition-all text-xs group/btn"
              >
                <span className={`font-bold ${filterType === '全部' ? 'text-slate-400' : 'text-blue-400'}`}>{filterType}</span>
                <ChevronDown size={12} className={`text-slate-500 transition-transform ${isTypeOpen ? 'rotate-180' : ''}`} />
              </button>
              {isTypeOpen && (
                <div className="absolute top-full left-0 mt-2 w-full bg-[var(--bg-dropdown)] border border-slate-700 rounded-lg shadow-2xl overflow-hidden z-50">
                  {typeOptions.map(t => (
                    <button
                      key={t}
                      onClick={() => { setFilterType(t); setIsTypeOpen(false); }}
                      className={`w-full flex items-center px-3 py-2 text-[11px] font-bold hover:bg-white/[0.05] transition-colors ${filterType === t ? 'bg-blue-500/5 text-blue-400' : 'text-slate-400'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="w-px h-4 bg-slate-800" />

          <div className="flex-1 relative group/search">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/search:text-blue-400 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="检索报错关键字、故障 ID、关联服务..."
              className="bg-slate-900/40 border border-slate-800 text-[11px] pl-9 pr-4 py-1.5 rounded-lg w-full focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600 font-medium"
            />
            {searchQuery && <X size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 cursor-pointer hover:text-slate-100" onClick={() => setSearchQuery('')} />}
          </div>

          <div className="w-px h-4 bg-slate-800" />

          <div className="flex items-center gap-6 ml-auto">
            <label className="flex items-center gap-2 cursor-pointer group/check">
              <div
                onClick={() => setOnlyPrimary(!onlyPrimary)}
                className={`w-3.5 h-3.5 rounded border transition-all flex items-center justify-center ${onlyPrimary ? 'bg-blue-600 border-blue-500' : 'border-slate-700 bg-slate-800/50 group-hover/check:border-slate-500'}`}
              >
                {onlyPrimary && <Check size={10} className="text-white" />}
              </div>
              <span className={`text-[10px] font-bold whitespace-nowrap transition-all ${onlyPrimary ? 'text-blue-400' : 'text-slate-500'}`}>仅看主告警</span>
            </label>
            <div className="flex items-center gap-1.5 ml-2">
              <button className="p-1.5 bg-slate-800/30 hover:bg-slate-700 text-slate-500 rounded-md transition-all border border-slate-800">
                <SlidersHorizontal size={12} />
              </button>
              <button className="p-1.5 bg-slate-800/30 hover:bg-slate-700 text-slate-500 rounded-md transition-all border border-slate-800">
                <ArrowUpDown size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Alarm Table */}
      <div className="bg-[var(--bg-card)] border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
        {filteredAlarms.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-600 gap-3 bg-black/20">
            <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800">
              <Search size={20} className="text-slate-700" />
            </div>
            <p className="text-xs font-medium italic">未匹配到相关告警...</p>
            <button onClick={() => { setFilterLevel('全部'); setFilterType('全部'); setSearchQuery(''); }} className="text-blue-500 text-[10px] hover:underline">清空所有筛选条件</button>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/30 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <th className="py-3 pl-4 w-12 text-center">状态</th>
                <th className="py-3 w-20">级别</th>
                <th className="py-3">告警标题</th>
                <th className="py-3 w-24">服务</th>
                <th className="py-3 w-24">触发时间</th>
                <th className="py-3 w-32">告警值 / 阈值</th>
                <th className="py-3 w-28">收敛状态</th>
                <th className="py-3 pr-4 text-right w-20">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlarms.map(alarm => (
                <AlarmTableRow key={alarm.id} alarm={alarm} onDiagnose={onDiagnose} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 4. Pagination (Simplified) */}
      <div className="flex items-center justify-between px-2 pt-2">
        <div className="flex items-center gap-2">
          <button className="text-[11px] text-slate-500 hover:text-slate-100 flex items-center gap-1 transition-colors"><ChevronLeft size={14} /> 上一页</button>
          <div className="flex items-center gap-1 px-4">
            {[1, 2, 3, 4, 5].map(p => (
              <button key={p} className={`w-6 h-6 rounded flex items-center justify-center text-[11px] transition-all ${p === 1 ? 'bg-blue-600 text-white font-bold' : 'text-slate-500 hover:bg-slate-800'}`}>{p}</button>
            ))}
          </div>
          <button className="text-[11px] text-slate-300 hover:text-slate-100 flex items-center gap-1 transition-colors">下一页 <ChevronRight size={14} /></button>
        </div>
        <span className="text-[11px] text-slate-500">显示第 1-{filteredAlarms.length} 条 / 共 {filteredAlarms.length} 条 (已过滤)</span>
      </div>
    </div>
  );
};
const IncidentReportCard = ({ data, onAction }: any) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 bg-[var(--bg-card)] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
    <div className="bg-rose-500/10 p-4 border-b border-slate-800 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Critical P0</div>
        <h4 className="text-sm font-bold text-slate-200">{data.service} 错误率突增</h4>
      </div>
      <span className="text-[10px] text-slate-500 font-mono">{data.id}</span>
    </div>
    <div className="p-5 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-white/5 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">当前指标</div>
          <div className="text-lg font-bold text-rose-500 font-mono">{data.current_value}% <span className="text-xs text-slate-400 font-normal ml-1">/ 阈值 {data.threshold}%</span></div>
        </div>
        <div className="p-3 bg-white/5 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">SLO 错误预算</div>
          <div className="text-lg font-bold text-orange-500 font-mono">{data.slo_burn_rate}x <span className="text-xs text-slate-400 font-normal ml-1">燃烧率</span></div>
        </div>
      </div>
      <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
        <div className="text-[10px] text-blue-400 uppercase font-bold mb-2 flex items-center gap-2">
          <Zap size={10} /> 智能关联：最近变更
        </div>
        <div className="text-xs text-slate-300 flex justify-between items-center">
          <span>{data.related_change.time} | {data.related_change.description}</span>
          <span className="text-[10px] bg-blue-500/20 px-1.5 py-0.5 rounded text-blue-300">{data.related_change.operator}</span>
        </div>
      </div>
    </div>
    <div className="px-5 pb-5 flex gap-3">
      <button onClick={() => onAction?.('D_ANALYZE_ROOT_CAUSE', { id: data.id })} className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-lg transition-all shadow-lg shadow-blue-600/20">开始根因分析</button>
      <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold rounded-lg transition-all">查看监控大盘</button>
    </div>
  </motion.div>
);

const ChangeListCard = ({ data, onAction }: any) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 bg-[var(--bg-card)] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
    <div className="bg-blue-500/10 p-4 border-b border-slate-800">
      <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
        <ClipboardList size={16} className="text-blue-400" /> {data.service} 近 {data.time_window_minutes} 分钟变更记录
      </h4>
    </div>
    <div className="divide-y divide-slate-800">
      {data.changes.map((chg: any) => (
        <div key={chg.id} className="p-4 hover:bg-slate-900/20 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${chg.type === 'config' ? 'bg-orange-500/20 text-orange-400' : 'bg-purple-500/20 text-purple-400'}`}>
                {chg.type}
              </span>
              <span className="text-xs font-bold text-slate-200">{chg.description}</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">{chg.time}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-[10px] text-slate-500">操作人: {chg.operator}</div>
            <div className="flex gap-3">
              <button className="text-[10px] text-blue-400 hover:underline">查看 Diff</button>
              {chg.rollback_available && <button onClick={() => onAction?.('D_RECOMMENDATIONS', { id: chg.id })} className="text-[10px] text-rose-400 hover:underline font-bold">执行回滚</button>}
            </div>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

const RecoveryRecommendationCard = ({ data, onAction }: any) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 bg-[var(--bg-card)] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
    <div className="bg-purple-500/10 p-4 border-b border-slate-800">
      <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
        <Zap size={16} className="text-purple-400" /> 智能止损方案建议
      </h4>
    </div>
    <div className="p-5 space-y-5">
      {data.recommendations.map((rec: any, idx: number) => (
        <div key={idx} className={`p-4 rounded-xl border ${idx === 0 ? 'bg-purple-500/5 border-purple-500/30 ring-1 ring-purple-500/20' : 'bg-white/5 border-slate-800'}`}>
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${idx === 0 ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-300'}`}>{idx + 1}</div>
              <span className={`text-xs font-bold ${idx === 0 ? 'text-purple-400' : 'text-slate-300'}`}>{idx === 0 ? '首选推荐' : '备选方案'}</span>
            </div>
            <div className="text-[10px] text-slate-500 font-bold">历史成功率 {Math.round(rec.historical_success_rate * 100)}%</div>
          </div>
          <h5 className="text-sm font-bold text-slate-200 mb-2">{rec.description}</h5>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed italic">✦ {rec.expected_outcome}</p>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-500">风险: <span className={rec.risk === '低' ? 'text-emerald-500' : 'text-orange-500'}>{rec.risk}</span></span>
            <button
              onClick={() => onAction?.('D_EXECUTE_ACTION', { action: rec.action })}
              className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${idx === 0 ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-600/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              {idx === 0 ? '一键执行止损' : '尝试此方案'}
            </button>
          </div>
        </div>
      ))}
      {data.not_recommended && (
        <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-lg">
          <div className="text-[10px] text-rose-400 font-bold flex items-center gap-1.5 mb-1">
            <ShieldAlert size={12} /> 系统警告：不建议重启
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">{data.not_recommended[0].reason}</p>
        </div>
      )}
    </div>
  </motion.div>
);


const InspectionTaskSelectCard: React.FC<{ onAction: any }> = ({ onAction }) => {
  const tasks = [
    { name: 'Nginx日志巡检', status: '🔴 失败', time: '13:00', type: 'abnormal' },
    { name: '磁盘清理巡检-测试环境', status: '🟡 部分成功', time: '02:00', type: 'abnormal' },
    { name: 'CPU巡检-生产环境', status: '🟢 成功', time: '14:20', type: 'all' },
    { name: '内存巡检-生产环境', status: '🟢 成功', time: '14:10', type: 'all' },
  ];

  return (
    <div className="bg-[var(--bg-card)] border border-slate-800 rounded-xl overflow-hidden shadow-2xl w-full max-w-[360px] animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="p-3 border-b border-slate-800 bg-slate-900/20 flex items-center gap-2">
        <Search size={14} className="text-slate-500" />
        <input type="text" placeholder="搜索或选择任务..." className="bg-transparent border-none text-[11px] text-slate-300 focus:outline-none w-full" />
      </div>
      <div className="p-3 space-y-4 max-h-[400px] overflow-y-auto no-scrollbar">
        <div className="space-y-2">
          <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> 最近有异常的任务 (2个)
          </div>
          {tasks.filter(t => t.type === 'abnormal').map(task => (
            <div key={task.name} className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-all group flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-slate-200">{task.name}</div>
                <div className="text-[10px] text-slate-500">上次: {task.time} · {task.status}</div>
              </div>
              <button
                onClick={() => onAction('START_DIAGNOSTIC', { taskName: task.name })}
                className="text-[10px] font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2.5 py-1 rounded transition-colors"
              >
                诊断此任务
              </button>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 全部任务
          </div>
          {tasks.filter(t => t.type === 'all').map(task => (
            <div key={task.name} className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-all group flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-slate-200">{task.name}</div>
                <div className="text-[10px] text-slate-500">上次: {task.time} · {task.status}</div>
              </div>
              <button
                onClick={() => onAction('START_DIAGNOSTIC', { taskName: task.name })}
                className="text-[10px] font-bold text-blue-400 hover:text-blue-300 border border-blue-500/20 px-2.5 py-1 rounded transition-colors"
              >
                诊断此任务
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="p-3 bg-slate-900/20 border-t border-slate-800 text-[10px] text-slate-500 italic">
        也可以直接告诉我任务名称，比如：“诊断一下 Nginx日志巡检”
      </div>
    </div>
  );
};

const InspectionDiagnosticReportCard: React.FC<{ data: any, onAction: any }> = ({ data, onAction }) => {
  const { currentStep = 0, taskName, topology, agents, conclusion } = data;

  const steps = [
    { id: 1, title: '告警解析与拓扑发现', status: currentStep >= 1 ? 'done' : 'waiting' },
    { id: 2, title: '多智能体并行诊断', status: currentStep >= 2 ? 'done' : 'waiting' },
    { id: 3, title: '结果汇总与自愈方案', status: currentStep >= 3 ? 'done' : 'waiting' },
  ];

  return (
    <div className="bg-[var(--bg-card)] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl w-full max-w-[420px] animate-in fade-in duration-500">
      <div className="p-4 border-b border-slate-800 bg-blue-500/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-blue-400 animate-pulse" />
          <span className="text-sm font-bold text-slate-200">🔍 AI 根因诊断任务流</span>
        </div>
        <span className="text-[9px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-mono uppercase tracking-widest">Multi-Agent v2</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Progress Overview */}
        <div className="flex gap-1.5 mb-2">
          {steps.map(s => (
            <div key={s.id} className="flex-1 space-y-1.5">
              <div className={`h-1 rounded-full transition-all duration-500 ${currentStep >= s.id ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-slate-800'}`} />
              <div className={`text-[8px] font-bold uppercase text-center ${currentStep >= s.id ? 'text-blue-400' : 'text-slate-600'}`}>{s.title}</div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {/* Step 1: Topology */}
          {currentStep >= 1 && (
            <div className={`p-3 rounded-xl border transition-all ${currentStep === 1 ? 'bg-blue-500/5 border-blue-500/30' : 'bg-slate-900/50 border-slate-800'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Network size={14} className={currentStep === 1 ? 'text-blue-400' : 'text-slate-500'} />
                  <span className="text-[11px] font-bold text-slate-200">受影响调用链路发现</span>
                </div>
                {currentStep > 1 ? <Check size={12} className="text-emerald-500" /> : <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />}
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-900/40 rounded-lg border border-slate-800/50 overflow-hidden">
                {(topology || ['接入网关', 'beehive', 'vserver']).map((node: string, i: number, arr: any[]) => (
                  <React.Fragment key={i}>
                    <span className={`text-[10px] font-bold ${i === arr.length - 1 ? 'text-rose-400' : 'text-slate-400'}`}>{node}</span>
                    {i < arr.length - 1 && <ChevronRight size={10} className="text-slate-700" />}
                  </React.Fragment>
                ))}
              </div>
              <div className="mt-2 text-[9px] text-slate-500 flex items-center gap-1.5 ml-1">
                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                拓扑路径解析成功，共涉及 {topology?.length || 3} 个核心节点
              </div>
            </div>
          )}

          {/* Step 2: Multi-Agent Analysis */}
          {currentStep >= 2 && (
            <div className={`p-3 rounded-xl border transition-all ${currentStep === 2 ? 'bg-indigo-500/5 border-indigo-500/30' : 'bg-slate-900/50 border-slate-800'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Brain size={14} className={currentStep === 2 ? 'text-indigo-400' : 'text-slate-500'} />
                  <span className="text-[11px] font-bold text-slate-200">专家智能体并行诊断</span>
                </div>
                {currentStep > 2 ? <Check size={12} className="text-emerald-500" /> : <RefreshCw size={12} className="text-indigo-400 animate-spin" />}
              </div>
              <div className="space-y-2">
                {(agents || [
                  { name: 'Analyzer-01 (链路解析)', status: 'success', detail: '调用链响应正常' },
                  { name: 'Analyzer-02 (指标采集)', status: 'warning', detail: '发现节点监控数据缺失', error: true }
                ]).map((agent: any, i: number) => (
                  <div key={i} className="bg-slate-900/40 p-2 rounded-lg border border-slate-800/50 flex items-start justify-between">
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-bold text-slate-300">{agent.name}</div>
                      <div className={`text-[9px] ${agent.error ? 'text-rose-400' : 'text-slate-500'}`}>{agent.detail}</div>
                    </div>
                    {agent.status === 'success' ? <Check size={12} className="text-emerald-500" /> : <AlertTriangle size={12} className="text-rose-500" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Conclusion & Actions */}
          {currentStep >= 3 && (
            <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 animate-in zoom-in-95 duration-500">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={14} className="text-blue-400" />
                <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider">诊断结论汇总</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-bold mb-4 border-l-2 border-blue-500 pl-3">
                {conclusion || '经过全链路证据扫描，确认为 vserver 节点监控采集失联，排除业务逻辑故障，建议重新下发采集配置。'}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => onAction('EXECUTE_HEAL')}
                  className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-lg shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <Zap size={12} /> 一键执行自愈
                </button>
                <button
                  onClick={() => onAction('VIEW_RCA_REPORT')}
                  className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg border border-slate-700 transition-all"
                >
                  根因分析报告
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {currentStep === 3 && (
        <div className="p-3 bg-slate-900/20 border-t border-slate-800 text-center">
          <span className="text-[9px] text-slate-600 italic font-medium tracking-tight">已完成告警事件根因分析 · 状态已归档</span>
        </div>
      )}
    </div>
  );
};

const InspectionConclusionCard: React.FC<{ data: any, onAction: any }> = ({ data, onAction }) => (
  <div className="bg-[var(--bg-card)] border border-blue-500/30 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.1)] w-full max-w-[400px] animate-in zoom-in-95 duration-500">
    <div className="p-4 border-b border-slate-800 bg-slate-900/20 flex items-center gap-2">
      <HeartPulse size={16} className="text-blue-500" />
      <span className="text-sm font-bold text-slate-200">🏥 诊断结论</span>
    </div>
    <div className="p-5 space-y-5">
      <div className="space-y-2">
        <div className="text-[11px] font-bold text-slate-400 uppercase">根本原因:</div>
        <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-lg text-xs text-slate-300 leading-relaxed italic">
          3 台 Nginx 服务器 (10.0.1.23-25) 的 <span className="text-rose-400 font-bold underline decoration-rose-500/50">SSH 服务不可达</span>，导致巡检任务无法登录执行检查命令。问题始于 2026-04-10 11:00，怀疑与同时段的运维操作有关。
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-[11px] font-bold text-slate-400 uppercase">可能原因 (按概率排序):</div>
        {[
          { label: 'SSH 服务异常停止', prob: 80, color: 'bg-rose-500', note: '端口 22 不可达，建议检查 sshd 状态' },
          { label: '防火墙规则变更', prob: 40, color: 'bg-orange-500', note: '端口被过滤，建议检查 iptables 规则' },
          { label: '主机宕机或网络断开', prob: 20, color: 'bg-slate-500', note: 'ping 完全失败，建议带外管理检查' },
        ].map((item, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-slate-300">{item.label}</span>
              <span className="font-mono text-slate-500">{item.prob}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${item.prob}%` }} className={`h-full ${item.color}`} />
            </div>
            <p className="text-[9px] text-slate-600 italic">建议: {item.note}</p>
          </div>
        ))}
      </div>

      <div className="h-px bg-slate-800" />

      <div className="space-y-3">
        <div className="text-[11px] font-bold text-slate-400 uppercase">📋 建议操作:</div>
        <div className="space-y-2">
          <button className="w-full p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs text-left rounded-lg border border-slate-700 transition-all flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <span className="text-blue-400 font-bold">[🔧]</span>
              <span>检查 SSH 服务状态 (通过跳板机)</span>
            </div>
            <ArrowUpRight size={14} className="text-slate-600 group-hover:text-blue-400" />
          </button>
          <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-orange-400 font-bold">[⏸️]</span>
              <span className="text-slate-300 text-xs">临时暂停该巡检任务</span>
            </div>
            <button className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 text-[10px] font-bold px-3 py-1 rounded transition-colors" onClick={() => onAction('PAUSE_TASK')}>一键暂停</button>
          </div>
          <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <span className="text-purple-400 font-bold">[📧]</span>
              <span>通知运维组处理</span>
            </div>
            <button className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-[10px] font-bold px-3 py-1 rounded transition-colors">发送报告</button>
          </div>
        </div>
      </div>
    </div>
    <div className="p-4 bg-slate-900/20 border-t border-slate-800 flex flex-wrap gap-2">
      <button onClick={() => onAction('DEEP_DIVE')} className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded shadow-lg shadow-blue-600/20 transition-all active:scale-95">🔬 深入分析</button>
      <button className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-bold rounded border border-slate-700 transition-all">📋 复制报告</button>
      <button onClick={() => onAction('MARK_SOLVED')} className="flex-1 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-500 text-[10px] font-bold rounded border border-emerald-500/30 transition-all">✅ 已解决</button>
    </div>
  </div>
);

const InspectionDeepDiveCard: React.FC<{ data: any, onAction: any }> = ({ data, onAction }) => (
  <div className="bg-[var(--bg-card)] border border-purple-500/30 rounded-xl overflow-hidden shadow-2xl w-full max-w-[400px] animate-in slide-in-from-left-4 duration-500">
    <div className="p-3 border-b border-slate-800 bg-purple-500/5 flex items-center gap-2">
      <Brain size={16} className="text-purple-400" />
      <span className="text-sm font-bold text-slate-200">🔬 深度探测报告 (备用通道)</span>
    </div>
    <div className="p-4 space-y-4">
      <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800 space-y-3">
        <div className="text-[11px] font-bold text-slate-400 uppercase border-b border-slate-800 pb-2">探测结果综述:</div>
        <div className="space-y-3">
          {['10.0.1.23', '10.0.1.24', '10.0.1.25'].map(ip => (
            <div key={ip} className="space-y-1">
              <div className="text-[10px] font-bold text-slate-300">{ip}:</div>
              <div className="grid grid-cols-2 gap-2 text-[9px] pl-2">
                <div className="flex items-center gap-1.5 text-emerald-400"><span>• 主机在线:</span> <Check size={8} /></div>
                <div className="flex items-center gap-1.5 text-rose-400"><span>• SSH 进程:</span> <X size={8} /></div>
                <div className="flex items-center gap-1.5 text-slate-500"><span>• 最近重启:</span> <span>10:58 (2h前)</span></div>
                <div className="flex items-center gap-1.5 text-rose-500 font-bold"><span>• 日志:</span> <span>sshd failed</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20 flex gap-3">
        <AlertCircle size={16} className="text-blue-400 shrink-0" />
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-blue-400">🔍 新发现</div>
          <p className="text-[10px] text-slate-400 leading-relaxed italic">这 3 台机器在 10:58 左右几乎同时重启过，可能是由于批量维护导致 SSH 服务未随系统自启动。</p>
        </div>
      </div>
    </div>
    <div className="p-3 bg-slate-900/20 border-t border-slate-800 flex gap-2">
      <button className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded">👤 查看操作审计</button>
      <button className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded transition-all shadow-lg shadow-blue-600/30">📞 通知运维处理</button>
    </div>
  </div>
);

const InspectionClosureCard: React.FC<{ onAction: any }> = ({ onAction }) => (
  <div className="bg-[var(--bg-card)] border border-emerald-500/30 rounded-xl overflow-hidden shadow-2xl w-full max-w-[360px] animate-in fade-in zoom-in-95 duration-500">
    <div className="p-4 border-b border-slate-800 bg-emerald-500/5 flex items-center gap-2">
      <CheckSquare size={16} className="text-emerald-500" />
      <span className="text-sm font-bold text-slate-200">✅ 诊断已闭环</span>
    </div>
    <div className="p-5 space-y-5">
      <div className="space-y-3">
        <div className="text-[10px] font-bold text-slate-500 uppercase">解决方式确认:</div>
        <div className="space-y-2">
          {[
            { label: '重启了 SSH 服务', checked: true },
            { label: '调整了防火墙规则', checked: false },
            { label: '主机已离线恢复', checked: false },
          ].map((opt, i) => (
            <div key={i} className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${opt.checked ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}>
              <span className="text-[11px] font-bold">{opt.label}</span>
              {opt.checked && <Check size={12} />}
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <div className="text-[10px] font-bold text-slate-500 uppercase">根本原因归档:</div>
        <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-[11px] text-slate-300 font-bold border-l-4 border-l-emerald-500">
          运维批量重启导致 SSH 未自启
        </div>
      </div>
      <div className="bg-black/20 p-3 rounded-lg border border-slate-800 text-[9px] text-slate-500 leading-relaxed italic">
        本次诊断记录已存入知识库。下次遇到类似问题时，系统将自动提示参考本次解决方案。
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => onAction('RESUME_TASK')} className="py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg transition-all shadow-lg shadow-emerald-600/20">▶️ 恢复任务</button>
        <button onClick={() => onAction('GO_HOME')} className="py-2 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold rounded-lg border border-slate-700 transition-all">🏠 回到首页</button>
      </div>
    </div>
  </div>
);

const InspectionTypeCard = ({ onAction }: any) => (
  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 grid grid-cols-2 gap-4 w-full max-w-[500px]">
    <div
      onClick={() => onAction?.('SET_INSPECTION_MODE', { mode: 'scheduled' })}
      className="bg-[var(--bg-elevated-alt)] border border-slate-800 hover:border-blue-500/50 hover:bg-blue-500/[0.02] p-6 rounded-2xl cursor-pointer transition-all group shadow-xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
        <Calendar size={64} className="text-blue-500" />
      </div>
      <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Calendar size={24} className="text-blue-400" />
      </div>
      <h4 className="text-base font-bold text-slate-200 mb-2">定时巡检</h4>
      <p className="text-[11px] text-slate-500 leading-relaxed uppercase tracking-widest font-bold mb-3">Scheduled Mode</p>
      <p className="text-xs text-slate-400 leading-relaxed">适用于例行健康检查，支持灵活的 Cron 调度策略与自动化报告生成。</p>
    </div>
    <div
      onClick={() => onAction?.('SET_INSPECTION_MODE', { mode: 'immediate' })}
      className="bg-[var(--bg-elevated-alt)] border border-slate-800 hover:border-orange-500/50 hover:bg-orange-500/[0.02] p-6 rounded-2xl cursor-pointer transition-all group shadow-xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
        <Zap size={64} className="text-orange-500" />
      </div>
      <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Zap size={24} className="text-orange-400" />
      </div>
      <h4 className="text-base font-bold text-slate-200 mb-2">立即执行</h4>
      <p className="text-[11px] text-slate-500 leading-relaxed uppercase tracking-widest font-bold mb-3">Immediate Run</p>
      <p className="text-xs text-slate-400 leading-relaxed">适用于紧急故障排查或临时合规性校验，实时反馈执行进度与结果摘要。</p>
    </div>
  </motion.div>
);

const CronConfirmCard = ({ data, onAction }: any) => (
  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 bg-[var(--bg-elevated-alt)] border border-blue-500/30 rounded-xl p-5 shadow-2xl w-full max-w-[340px]">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
        <Calendar size={18} className="text-blue-400" />
      </div>
      <div>
        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">定时策略确认</h4>
        <p className="text-xs font-bold text-slate-200">AI 已解析调度计划</p>
      </div>
    </div>
    <div className="bg-slate-900/30 rounded-lg p-3 mb-5 border border-slate-800 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-slate-500 font-bold uppercase">Cron Expr</span>
        <code className="text-blue-400 text-[10px] font-mono bg-blue-400/10 px-2 py-0.5 rounded">{data.cron || '0 3 * * *'}</code>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-slate-500 font-bold uppercase">Next Execution</span>
        <span className="text-[10px] text-slate-300 font-bold">{data.nextTime || '明天 03:00'}</span>
      </div>
    </div>
    <div className="flex gap-3">
      <button onClick={() => onAction?.('STEP_FINISH')} className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded transition-all">确认创建任务</button>
      <button className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded transition-all">修改</button>
    </div>
  </motion.div>
);

// --- 巡检规则极简版：全行内可编辑卡片 ---
const RuleDraftCard = ({ data, onAction }: any) => {
  const [internalRules, setInternalRules] = useState<any[]>(data.rules || []);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInternalRules(data.rules || []);
  }, [data.rules]);

  const updateRule = (id: string, field: string, value: string) => {
    const updated = internalRules.map(r => r.id === id ? { ...r, [field]: value } : r);
    setInternalRules(updated);
    onAction('SYNC_RULES', { rules: updated });
  };

  const removeRule = (id: string) => {
    const updated = internalRules.filter(r => r.id !== id);
    setInternalRules(updated);
    onAction('SYNC_RULES', { rules: updated });
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [internalRules.length]);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 bg-[var(--bg-card)] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl w-full max-w-[800px]">
      <div className="bg-blue-600/10 p-4 border-b border-slate-800/60 relative">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Sparkles size={48} className="text-blue-400" />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h4 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-0.5">
              <ShieldCheck size={18} className="text-blue-400" /> 推荐巡检规则草案
            </h4>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
              基于 {data.targetCount || 0} 个巡检对象生成的指标配置
            </p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="p-3 space-y-2 max-h-[600px] overflow-y-auto no-scrollbar">
        {internalRules.length === 0 && (
          <div className="py-10 text-center border border-dashed border-slate-800 rounded-xl">
            <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">暂无配置规则</p>
          </div>
        )}
        {internalRules.map((rule: any) => (
          <div key={rule.id} className="bg-slate-900/40 border border-slate-800/80 rounded-xl px-4 py-2 group hover:border-slate-700 transition-all">
            <div className="flex justify-between items-center mb-1.5">
              <input 
                type="text" 
                value={rule.name}
                onChange={(e) => updateRule(rule.id, 'name', e.target.value)}
                placeholder="规则名称..."
                className="bg-transparent border-none text-[13px] font-bold text-slate-300 focus:outline-none w-full mr-4 placeholder:text-slate-800"
              />
              <button 
                onClick={() => removeRule(rule.id)}
                className="p-1 text-slate-600 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4 items-end">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-600 font-bold uppercase tracking-tight">查询指标 (Metric)</label>
                <input 
                  type="text" 
                  value={rule.metric}
                  onChange={(e) => updateRule(rule.id, 'metric', e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded px-2.5 py-1.5 text-[12px] text-slate-400 font-mono outline-none focus:border-blue-500/50"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-600 font-bold uppercase tracking-tight">报警阈值 (Threshold)</label>
                <input 
                  type="text" 
                  value={rule.threshold}
                  onChange={(e) => updateRule(rule.id, 'threshold', e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded px-2.5 py-1.5 text-[12px] text-emerald-400 font-bold outline-none focus:border-blue-500/50"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-600 font-bold uppercase tracking-tight">持续时间 (Duration)</label>
                <input 
                  type="text" 
                  value={rule.duration}
                  onChange={(e) => updateRule(rule.id, 'duration', e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded px-2.5 py-1.5 text-[12px] text-slate-300 outline-none focus:border-blue-500/50"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-600 font-bold uppercase tracking-tight">严重等级 (Severity)</label>
                <select 
                  value={rule.severity}
                  onChange={(e) => updateRule(rule.id, 'severity', e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded px-2 py-1.5 text-[12px] text-slate-400 outline-none focus:border-blue-500/50 appearance-none uppercase font-bold"
                >
                  <option value="Critical">严重/紧急</option>
                  <option value="High">高危</option>
                  <option value="Medium">中等</option>
                  <option value="Low">低风险</option>
                </select>
              </div>
            </div>
            {rule.reason && (
              <div className="mt-1.5 flex items-center gap-1.5 opacity-50">
                <Sparkles size={10} className="text-blue-500" />
                <span className="text-[10px] text-slate-600 italic tracking-tight">{rule.reason}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 底部功能交互区 - 承接用户查阅后的操作决策 */}
      <div className="bg-black/60 backdrop-blur-md p-4 border-t border-slate-800/80 flex items-center justify-between">
        <button 
          onClick={() => onAction('ADD_CUSTOM_RULE')} 
          className="flex items-center gap-2 text-[11px] font-bold text-slate-500 hover:text-blue-400 transition-colors group"
        >
          <Plus size={14} className="group-hover:rotate-90 transition-transform" /> 
          <span>新增自定义规则项</span>
        </button>
        <button 
          onClick={() => onAction('STEP_FREQUENCY')} 
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[12px] font-black rounded-xl hover:opacity-90 shadow-xl shadow-blue-500/10 active:scale-[0.98] transition-all flex items-center gap-2 group"
        >
          确认并设置执行规则 <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

    </motion.div>
  );
};

// --- 新巡检流程：频率设定卡片 ---
const FrequencySettingCard = ({ onAction, taskName, setTaskName, frequency, setFrequency }: any) => {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 bg-[var(--bg-card)] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl w-full max-w-[400px]">
      <div className="p-5 border-b border-slate-800/60 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
          <Clock size={20} className="text-indigo-400" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-100 uppercase tracking-tight">设定执行频率</h4>
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">周期性巡检任务调度</p>
        </div>
      </div>

      <div className="p-5 space-y-6">
        <div>
          <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-3">常选项</label>
          <div className="grid grid-cols-2 gap-2">
            {['每天一次', '每天早晚二次', '每周一至周五', '自定义 Cron'].map(opt => (
              <button 
                key={opt}
                onClick={() => setFrequency(opt)}
                className={`px-4 py-2.5 rounded-xl border text-[11px] font-black transition-all ${
                  frequency === opt 
                  ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-400 shadow-inner shadow-indigo-500/10' 
                  : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:border-slate-700'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-2">任务名称</label>
            <input 
              type="text" 
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="例如: 订单库生产环境日巡检" 
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50 focus:bg-black/80 transition-all font-bold"
            />
          </div>
          <div>
             <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-2">首次运行时间</label>
             <div className="text-xs text-slate-400 font-mono bg-slate-900/40 p-3 rounded-xl border border-slate-800 inline-block w-full">
                2026-04-12 03:00:00 (UTC+8)
             </div>
          </div>
        </div>
      </div>

      <div className="p-5 bg-slate-900/40 border-t border-slate-800/60 flex gap-3">
        <button onClick={() => onAction?.('STEP_RULE_BACK')} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold rounded-lg border border-slate-700/50 transition-all">上一步</button>
        <button onClick={() => onAction?.('STEP_CONFIRMATION')} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black rounded-lg transition-all shadow-lg shadow-indigo-500/20 active:scale-95">生成任务预览</button>
      </div>
    </motion.div>
  );
};

// --- 新巡检流程：任务确认摘要卡片 ---
const TaskConfirmationCard = ({ onAction, data }: any) => {
  const finalRulesCount = data?.ruleDraft?.rules?.length || 0;
  const targetsCount = data?.targets?.length || 0;
  const targetTypes = Array.from(new Set(data?.targets?.map((t: any) => t.type) || [])).join(', ');

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 bg-[var(--bg-card)] border border-blue-500/30 rounded-2xl overflow-hidden shadow-2xl w-full max-w-[360px] relative">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-blue-400"><ClipboardCheck size={80} /></div>
      <div className="p-5 flex items-center justify-between border-b border-slate-800/30">
         <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">任务确认摘要</h4>
         <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
      </div>
      
      <div className="p-6 space-y-6">
         <div className="space-y-4">
            <div className="flex justify-between items-start">
               <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">任务名称</span>
               <span className="text-xs text-slate-200 font-bold text-right ml-4">{data.taskName || '未命名巡检任务'}</span>
            </div>
            <div className="flex justify-between items-center">
               <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">巡检资源</span>
               <span className="text-[10px] text-slate-300 px-2 py-0.5 bg-slate-800/80 rounded border border-slate-700/50 max-w-[180px] truncate text-right">
                 {targetsCount}x 资源 ({targetTypes || '通用'})
               </span>
            </div>
            <div className="flex justify-between items-center">
               <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">启用规则</span>
               <span className="text-xs text-slate-300 font-mono font-black">{String(finalRulesCount).padStart(2, '0')} 条自定义规则</span>
            </div>
            <div className="flex justify-between items-center">
               <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">执行策略</span>
               <span className="text-[10px] text-indigo-400 font-black tracking-widest uppercase bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30">
                 {data.frequency || '立即执行'}
               </span>
            </div>
            <div className="flex justify-between items-center">
               <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">通知模式</span>
               <span className="text-xs text-slate-400">IM / 邮件 / 站内消息</span>
            </div>
         </div>
  
         <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/80 space-y-1">
            <div className="text-[9px] text-slate-600 font-black uppercase tracking-widest">预计生效时间</div>
            <div className="text-xs text-slate-400 font-mono tracking-tighter">立即生效 (2026-04-15)</div>
         </div>
      </div>
  
      <div className="p-5 bg-slate-900/20 border-t border-slate-800/50 flex gap-3">
         <button onClick={() => onAction?.('STEP_SCHEDULE_BACK')} className="flex-1 py-1.5 bg-slate-800/50 hover:bg-slate-800 text-slate-500 hover:text-slate-300 text-[10px] font-bold rounded-lg border border-slate-700/50 transition-all uppercase tracking-widest">返回修改</button>
         <button onClick={() => onAction?.('STEP_FINISH')} className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black rounded-lg transition-all shadow-lg shadow-blue-500/20 active:scale-95 uppercase tracking-widest">确认创建任务</button>
      </div>
    </motion.div>
  );
};

const InspectionProgressCard = ({ data }: any) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 bg-[var(--bg-card)] border border-slate-800 rounded-xl overflow-hidden shadow-2xl w-full max-w-[340px]">
    <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/20">
      <div className="flex items-center gap-2">
        <RefreshCw size={14} className="text-orange-400 animate-spin" />
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-tight">临时巡检执行中</h4>
      </div>
      <span className="text-xs font-mono text-orange-400 font-bold">{data.progress}%</span>
    </div>
    <div className="h-1 bg-slate-800 w-full relative">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${data.progress}%` }}
        className="absolute h-full bg-gradient-to-r from-orange-600 to-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.3)] transition-all duration-300"
      />
    </div>
    <div className="p-4 space-y-3 max-h-48 overflow-y-auto no-scrollbar bg-black/10">
      {(data.hosts || ['prod-node-01', 'prod-node-02', 'prod-node-03']).map((host: any, idx: number) => {
        const hName = typeof host === 'string' ? host : host.name;
        const hProgress = data.progress;
        const isSuccess = hProgress > (idx + 1) * 25;
        const isRunning = !isSuccess && hProgress > idx * 25;

        return (
          <div key={idx} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isSuccess ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : isRunning ? 'bg-orange-500 animate-pulse' : 'bg-slate-700'}`} />
              <span className={`text-[11px] transition-colors ${isSuccess ? 'text-slate-200' : 'text-slate-500'}`}>{hName}</span>
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-widest ${isSuccess ? 'text-emerald-500' : isRunning ? 'text-orange-400' : 'text-slate-600'}`}>
              {isSuccess ? '已完成' : isRunning ? '运行中' : '等待中'}
            </span>
          </div>
        );
      })}
    </div>
  </motion.div>
);

const InspectionResultGrid = ({ data, onAction }: any) => (
  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 bg-[var(--bg-card)] border border-slate-800 rounded-xl overflow-hidden shadow-2xl w-full max-w-[400px]">
    <div className="bg-emerald-500/10 p-4 border-b border-slate-800 flex justify-between items-center relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-full bg-emerald-500/5 -skew-x-12 translate-x-16 pointer-events-none" />
      <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2 z-10">
        <CheckCircle2 size={16} className="text-emerald-500" /> 巡检任务执行报告
      </h4>
      <span className="text-[9px] text-slate-500 font-mono z-10 px-2 py-0.5 bg-slate-900/40 rounded border border-slate-800 uppercase tracking-widest">Done</span>
    </div>
    <div className="p-5">
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-slate-900/40 p-3.5 rounded-xl border border-slate-800/50 relative group">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">检查通过率</div>
          <div className="text-2xl font-bold text-slate-200">100<span className="text-xs text-slate-500 ml-1.5 font-normal tracking-normal">% Success</span></div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-emerald-500/20 group-hover:bg-emerald-500/40 transition-colors" />
        </div>
        <div className="bg-slate-900/40 p-3.5 rounded-xl border border-slate-800/50 relative group">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">风险评级</div>
          <div className="text-2xl font-bold text-emerald-500">LOW</div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-emerald-500/20 group-hover:bg-emerald-500/40 transition-colors" />
        </div>
      </div>

      <div className="border border-slate-800/80 rounded-xl overflow-hidden mb-6 bg-black/20 shadow-inner">
        <table className="w-full text-left text-[11px]">
          <thead className="bg-slate-900/30 text-slate-500 border-b border-slate-800/80 uppercase">
            <tr>
              <th className="px-4 py-2.5 font-bold tracking-widest">审计项 / Checklist</th>
              <th className="px-4 py-2.5 font-bold tracking-widest text-right">结果 / Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            <tr className="hover:bg-slate-900/10 transition-colors">
              <td className="px-4 py-2.5 text-slate-400">证书生命周期合规检测</td>
              <td className="px-4 py-2.5 text-emerald-500 font-bold text-right">PASS</td>
            </tr>
            <tr className="hover:bg-slate-900/10 transition-colors">
              <td className="px-4 py-2.5 text-slate-400">外部暴露面安全审计</td>
              <td className="px-4 py-2.5 text-emerald-500 font-bold text-right">PASS</td>
            </tr>
            <tr className="hover:bg-slate-900/10 transition-colors">
              <td className="px-4 py-2.5 text-slate-400">Kubernetes 资源配额校验</td>
              <td className="px-4 py-2.5 text-orange-400 font-bold text-right">WARN</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex gap-3 pt-5 border-t border-slate-800/80">
        <button onClick={() => onAction?.('STEP_SCHEDULE')} className="flex-1 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-[11px] font-bold rounded-lg border border-blue-500/20 flex items-center justify-center gap-2 transition-all group">
          <Clock size={14} className="group-hover:rotate-12 transition-transform" /> 转为定时任务
        </button>
        <button className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold rounded-lg border border-slate-700/50 transition-all flex items-center justify-center gap-2">
          <FileText size={14} /> 查看报告
        </button>
      </div>
    </div>
  </motion.div>
);


const ActionConfirmCard = ({ data, onAction }: any) => {
  const { title, impact, risk, preview, targets } = data;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[var(--bg-elevated)] border border-rose-500/30 rounded-2xl overflow-hidden shadow-2xl max-w-sm"
    >
      <div className="p-4 bg-rose-500/10 border-b border-rose-500/20 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-500">
          <ShieldAlert size={18} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-200 uppercase tracking-tighter">操作授权确认</h4>
          <p className="text-[9px] text-rose-500 font-black uppercase tracking-widest">{risk || '⚠️ HIGH RISK'}</p>
        </div>
      </div>
      <div className="p-5 space-y-4">
        <div className="space-y-1.5">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">准备执行操作:</div>
          <div className="text-sm font-bold text-slate-200">{title || '重置采集插件配置'}</div>
        </div>

        <div className="space-y-2">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight flex items-center gap-1.5">
            <Code size={12} /> 执行预览 (Dry Run)
          </div>
          <div className="bg-black/60 border border-slate-800 rounded-lg p-2.5 font-mono text-[9px] text-emerald-400 overflow-x-auto whitespace-pre">
            {preview || `+ agent.config:\n+   interval: 15s\n+   reconnect: true\n+   targets: ["vserver-prod"]`}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight flex items-center gap-1.5">
            <Monitor size={12} /> 影响范围
          </div>
          <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-400">
            {(targets || ['vserver-prod (172.29.235.218)']).map((t: string, i: number) => (
              <span key={i} className="bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700/50 font-mono italic">{t}</span>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onAction?.('AUTHORIZE_HEAL_EXECUTION', { title })}
            className="flex-1 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-black py-2.5 rounded-xl transition-all shadow-lg shadow-rose-900/20 active:scale-95 uppercase tracking-wide"
          >
            授权并提交执行
          </button>
          <button
            onClick={() => onAction?.('CANCEL_ACTION')}
            className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold py-2.5 rounded-xl transition-all"
          >
            取消
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const RuleShortcutsCard = ({ onAction }: { onAction: any }) => (
  <div className="flex flex-wrap gap-2 mt-3 max-w-[460px] animate-in fade-in slide-in-from-top-1 duration-500">
    {QUICK_RULES.map(rule => (
      <button
        key={rule}
        onClick={() => onAction?.('FILL_RULE', { text: rule })}
        className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded-lg border border-blue-500/20 transition-all active:scale-95 hover:border-blue-500/50 text-left shadow-lg shadow-blue-500/5"
      >
        {rule}
      </button>
    ))}
  </div>
);

const ActionExecutionCard = ({ data }: any) => {
  const { status, progress, logs } = data;

  return (
    <div className={`bg-[var(--bg-muted)] border ${status === 'success' ? 'border-emerald-500/40' : 'border-blue-500/20'} rounded-2xl overflow-hidden shadow-2xl max-w-sm w-full font-mono`}>
      <div className={`p-4 ${status === 'success' ? 'bg-emerald-500/5' : 'bg-blue-500/5'} border-b border-slate-800/50 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg ${status === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'} flex items-center justify-center`}>
            {status === 'success' ? <CheckCircle2 size={18} /> : <Terminal size={18} className="animate-pulse" />}
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 tracking-tight">{status === 'success' ? '✓ TASK COMPLETED' : '⚡ EXECUTING...'}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="h-1 w-20 bg-slate-800 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className={`h-full ${status === 'success' ? 'bg-emerald-500' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'}`} />
              </div>
              <span className="text-[9px] text-slate-500">{progress}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="bg-slate-900/40 rounded-xl border border-slate-800/30 p-3 font-mono text-[9px] space-y-1.5 h-44 overflow-y-auto no-scrollbar scroll-smooth">
          {logs?.map((log: string, i: number) => (
            <div key={i} className="flex gap-2">
              <span className="text-slate-600 shrink-0 select-none">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
              <span className={log.includes('✓') || log.includes('SUCCESS') ? 'text-emerald-400 font-bold' : 'text-slate-300'}>{log}</span>
            </div>
          ))}
          {status !== 'success' && <div className="animate-pulse text-blue-400">_</div>}
        </div>
        {status === 'success' && (
          <div className="pt-2">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg flex items-center gap-2.5 animate-in slide-in-from-bottom-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500"><Check size={12} strokeWidth={4} /></div>
              <span className="text-[10px] text-emerald-400 font-bold tracking-tight">自愈执行成功，监控采集已恢复正常。</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const KnowledgeArchiveSection = ({ data }: { data: any }) => {
  const [state, setState] = useState<'initial' | 'expanded' | 'archiving' | 'success'>('initial');
  const [selectedKB, setSelectedKB] = useState('kb_sre_cases');
  const [showDropdown, setShowDropdown] = useState(false);

  const kbOptions = [
    { id: 'kb_sre_cases', name: 'SRE 故障案例库', icon: '📚' },
    { id: 'kb_middleware', name: '中间件最佳实践', icon: '⚙️' },
    { id: 'kb_team_shared', name: '团队共享知识库', icon: '👥' },
  ];

  // 生成归档标题规则：告警标题 + (告警ID)
  const alertTitle = data.alertTitle || data.taskName || data.title;
  const alertId = data.alertId || data.id || data.incidentId;
  const isTitleValid = alertTitle && alertId && alertTitle !== '未知告警' && alertTitle !== '未知服务';

  const archiveTitle = isTitleValid
    ? `${alertTitle}（${alertId}）`
    : (data.conclusion || alertTitle || '根因分析报告');

  const handleConfirm = () => {
    setState('archiving');
    setTimeout(() => {
      setState('success');
    }, 1500);
  };

  const selectedKBName = kbOptions.find(opt => opt.id === selectedKB)?.name || '';

  if (state === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex flex-col items-center gap-2"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <CheckCircle2 size={16} /> 已归档到「{selectedKBName}」
          </div>
          <div className="text-[10px] text-emerald-500/70 font-mono italic">
            {archiveTitle}
          </div>
        </div>
        <button className="mt-1 text-[10px] text-emerald-500 hover:text-emerald-400 font-black uppercase tracking-widest underline decoration-2 underline-offset-4">
          查看知识库
        </button>
      </motion.div>
    );
  }

  return (
    <>
      {state === 'initial' ? (
        <button
          onClick={() => setState('expanded')}
          className="px-4 py-3 border border-slate-700 hover:border-indigo-500/50 text-slate-400 hover:text-indigo-400 text-xs font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 group whitespace-nowrap"
        >
          <Library size={14} className="group-hover:rotate-12 transition-transform" />
          归档
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full mt-4 p-4 bg-slate-900/40 border border-slate-800/50 rounded-xl space-y-4 shadow-inner"
        >
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <Library size={12} /> 归档到知识库
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center justify-between hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span>{kbOptions.find(opt => opt.id === selectedKB)?.icon}</span>
                  <span className="font-medium truncate">{selectedKBName}</span>
                </div>
                <ChevronDown size={14} className={`text-slate-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="absolute bottom-full mb-2 left-0 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-20 overflow-hidden"
                    >
                      {kbOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setSelectedKB(opt.id);
                            setShowDropdown(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-indigo-500/20 transition-colors ${selectedKB === opt.id ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-300'}`}
                        >
                          <span>{opt.icon}</span>
                          <span className="font-medium">{opt.name}</span>
                          {selectedKB === opt.id && <Check size={12} className="ml-auto" />}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={handleConfirm}
              disabled={state === 'archiving'}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white text-xs font-black rounded-lg transition-all active:scale-95 flex items-center gap-2 min-w-[90px] justify-center"
            >
              {state === 'archiving' ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                '确认归档'
              )}
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
};

const ExpertDiagnosticCard = ({ data, onAction }: any) => {
  const currentStep = data.currentStep || 0;
  const isPhased = data.format === '0412_phased';

  // 如果是0412分阶段可视化模式
  if (isPhased) {
    return (
      <div className="bg-[var(--bg-surface)] border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl max-w-4xl font-sans">
        <div className="p-4 border-b border-slate-800/50 bg-[var(--bg-panel-alt)] flex items-center justify-between">
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
                  <div className="bg-slate-900/50 border border-slate-800/30 rounded-xl p-4">
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
                    <p className="text-[12px] text-emerald-800 font-bold leading-relaxed">{data.stage4?.judgment}</p>
                  </div>
                  <button
                    onClick={() => onAction?.('VIEW_REPORT', data)}
                    className="w-full py-3 border border-slate-700 hover:border-blue-500/50 text-slate-400 hover:text-blue-400 text-xs font-black rounded-xl transition-all active:scale-95 uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <FileText size={14} /> 查看完整深度报告
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
    <div className="bg-[var(--bg-surface)] border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl max-w-4xl font-sans">
      <div className="p-4 border-b border-slate-800/50 bg-[var(--bg-panel-alt)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <Brain size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-tighter">AI 专家诊断</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">环节一：拓扑路径自动发现</div>
            {currentStep >= 1 && (
              <div className="bg-slate-900/50 border border-slate-800/30 rounded-xl p-4">
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
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">环节二：多智能体并行专家诊断</div>
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

                    <div className="mt-2 pt-2 border-t border-slate-800/50 flex justify-between items-center">
                      <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">置信度: 98%</span>
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
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">环节三：诊断结论与自愈方案</div>
            {currentStep >= 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 mb-5 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                  <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity"><Brain size={48} /></div>
                  <h4 className="text-xs font-black text-emerald-400 mb-2 uppercase tracking-tight flex items-center gap-2">
                    故障确认 (已确认根因)
                  </h4>
                  <p className="text-[12px] text-slate-300 font-bold leading-relaxed">
                    {conclusion}
                  </p>
                </div>

                {data.recommendations && (
                  <div className="mb-5 space-y-3">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Zap size={12} className="text-purple-400" /> 推荐自愈方案
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {data.recommendations.map((rec: any, i: number) => (
                        <div key={i} className="bg-[var(--bg-elevated)] border border-slate-800/50 rounded-xl p-3 flex justify-between items-center group/item hover:border-purple-500/30 transition-all shadow-sm">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[11px] font-bold text-slate-200">{rec.title}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${rec.risk === '低' || rec.risk === '极低' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'}`}>风险: {rec.risk}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium italic">{rec.description}</div>
                          </div>
                          <div className="text-[10px] text-slate-400 font-bold px-3 py-1 bg-white/5 rounded-lg opacity-0 group-item-hover:opacity-100 transition-opacity">
                            预期效果: {rec.effect}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => onAction?.('ACT_SELF_HEAL')}
                    className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-emerald-900/20 active:scale-95 uppercase tracking-wide flex items-center justify-center gap-2"
                  >
                    <Zap size={14} fill="currentColor" />
                    建议执行自愈
                  </button>
                  <button
                    onClick={() => onAction?.('VIEW_REPORT', data)}
                    className="px-6 py-3 border border-slate-700 hover:border-blue-500/50 text-slate-400 hover:text-blue-400 text-xs font-bold rounded-xl transition-all active:scale-95 uppercase tracking-wide flex items-center justify-center gap-2"
                  >
                    <FileText size={14} />
                    根因分析报告
                  </button>

                  {/* 新增归档入口，现在位于右侧 */}
                  <KnowledgeArchiveSection data={data} />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const LogAnalysisChatCard = ({ data, onAction }: any) => {
  const step = data.step || 0;
  const cluster = data.cluster || {};
  const [expandedSteps, setExpandedSteps] = useState<number[]>([1, 2, 3, 4, 5, 6]);

  const toggleStep = (s: number) => {
    setExpandedSteps(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  if (!cluster.title) return null;

  return (
    <div className="bg-[var(--bg-navy-alt)]/50 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl max-w-2xl font-sans mb-2 text-left">
      {/* Header Summary */}
      <div className="p-4 bg-indigo-500/5 border-b border-slate-800/50 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/20">
          <Brain size={20} />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-xs font-bold text-white uppercase tracking-tight">AI 日志分析报告</h3>
            <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">置信度 87%</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
            {cluster.service} 服务异常分析中... 原因是数据库连接池连接失败。
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Stage 1: Initialization */}
        {step >= 1 && (
          <AnalysisStepCard
            step={1}
            title="阶段1: Initialization (问题识别)"
            isExpanded={expandedSteps.includes(1)}
            onToggle={() => toggleStep(1)}
            isComplete={step > 1}
          >
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-bold uppercase w-16">分析对象:</span>
                <span className="text-rose-400 font-mono font-bold">{cluster.title}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-slate-500 font-bold uppercase w-16 shrink-0">影响服务:</span>
                <div className="flex gap-1.5 flex-wrap">
                  {['payment-service', 'order-service'].map(s => (
                    <span key={s} className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[9px] text-slate-300 font-bold">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </AnalysisStepCard>
        )}

        {/* Stage 2: Retrieval */}
        {step >= 2 && (
          <AnalysisStepCard
            step={2}
            title="阶段2: Retrieval (日志检索)"
            isExpanded={expandedSteps.includes(2)}
            onToggle={() => toggleStep(2)}
            isComplete={step > 2}
          >
            <div className="space-y-3">
              <div className="flex gap-4 pb-2 border-b border-slate-800/30">
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-500 font-bold uppercase">命中日志</span>
                  <span className="text-xs font-mono font-bold text-slate-200">1,245条</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-500 font-bold uppercase">召回率</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">92%</span>
                </div>
              </div>
              <div className="bg-slate-900/40 rounded-lg border border-slate-800 p-3 font-mono text-[10px] text-slate-400 space-y-1 text-left">
                <div className="flex gap-2">
                  <span className="text-rose-500 font-bold">[ERROR]</span>
                  <span>Connection refused to database pool</span>
                </div>
                <div className="text-slate-600 pl-10">at ConnectionPool.getConnection(...)</div>
              </div>
            </div>
          </AnalysisStepCard>
        )}

        {/* Stage 3: Correlation */}
        {step >= 3 && (
          <AnalysisStepCard
            step={3}
            title="阶段3: Correlation (关联分析)"
            isExpanded={expandedSteps.includes(3)}
            onToggle={() => toggleStep(3)}
            isComplete={step > 3}
          >
            <div className="flex items-center gap-2 p-3 bg-slate-900/50 rounded-xl border border-slate-800/50 justify-center">
              <div className="w-12 h-12 rounded-full border border-indigo-500/30 flex items-center justify-center text-[8px] text-indigo-400 font-bold">Ingress</div>
              <ArrowRight size={12} className="text-slate-700" />
              <div className="w-14 h-14 rounded-full border-2 border-indigo-500 flex items-center justify-center text-[9px] text-indigo-100 font-bold bg-indigo-500/10">Payment</div>
              <ArrowRight size={12} className="text-slate-700" />
              <div className="w-12 h-12 rounded-full border border-rose-500 flex items-center justify-center text-[8px] text-rose-500 font-bold bg-rose-500/10 animate-pulse">DB Pool</div>
            </div>
          </AnalysisStepCard>
        )}

        {/* Stage 4: Evidence */}
        {step >= 4 && (
          <AnalysisStepCard
            step={4}
            title="阶段4: Evidence (证据收敛)"
            isExpanded={expandedSteps.includes(4)}
            onToggle={() => toggleStep(4)}
            isComplete={step > 4}
          >
            <div className="space-y-2">
              {[
                { icon: <FileText size={10} />, text: '1245条 DB 连接失败日志' },
                { icon: <Activity size={10} />, text: 'DB 节点失败率：87% (平均 2%)' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-400 text-[10px] font-medium">
                  <div className="text-indigo-400">{item.icon}</div>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </AnalysisStepCard>
        )}

        {/* Stage 5: Diagnosis */}
        {step >= 5 && (
          <AnalysisStepCard
            step={5}
            title="阶段5: Diagnosis (根因分析)"
            isExpanded={expandedSteps.includes(5)}
            onToggle={() => toggleStep(5)}
            isComplete={step > 5}
          >
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              <span className="text-[9px] text-indigo-400 font-black uppercase mb-1 block">主因确认</span>
              <p className="text-xs text-indigo-100 font-bold leading-relaxed text-left">数据库连接池无法建立连接 (Connection Pool Exhaustion)</p>
            </div>
          </AnalysisStepCard>
        )}

        {/* Stage 6: Action */}
        {step >= 6 && (
          <AnalysisStepCard
            step={6}
            title="阶段6: Action (操作建议)"
            isExpanded={expandedSteps.includes(6)}
            onToggle={() => toggleStep(6)}
            isComplete={step > 6}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl">
                <div className="flex items-center gap-2">
                  <RefreshCw size={14} className="text-rose-400" />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-200">重启连接池</span>
                    <span className="text-[9px] text-slate-500 uppercase font-medium tracking-tight">Immediate Action</span>
                  </div>
                </div>
                <button
                  onClick={() => onAction?.('EXECUTE_LOG_ACTION', { action: 'RESTART_POOL' })}
                  className="px-3 py-1 bg-rose-500 text-white text-[10px] font-bold rounded hover:bg-rose-600 transition-all active:scale-95"
                >
                  执行
                </button>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[10px] font-bold text-slate-400 flex items-center justify-center gap-1.5">
                  <Search size={12} /> 执行 Heap Dump
                </button>
                <button className="flex-1 p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[10px] font-bold text-slate-400 flex items-center justify-center gap-1.5">
                  <Sparkles size={12} /> 扩容连接池
                </button>
              </div>
            </div>
          </AnalysisStepCard>
        )}
      </div>

      {step < 6 && (
        <div className="px-4 pb-4">
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(step / 6) * 100}%` }}
              className="h-full bg-gradient-to-r from-indigo-500 to-blue-500"
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[9px] text-slate-500 font-bold uppercase animate-pulse">AI 深度分析引擎运行中...</span>
            <span className="text-[9px] text-indigo-400 font-mono font-bold">{Math.round((step / 6) * 100)}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

const ReportHistorySidebar = ({ history, selectedId, onSelect }: { history: any[], selectedId: string, onSelect: (id: string) => void }) => {
  return (
    <div className="w-72 border-r border-slate-800/50 bg-[var(--bg-deepest)] flex flex-col shrink-0">
      <div className="p-6 border-b border-slate-800/50">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">报告历史</h3>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
        {history.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`w-full p-4 rounded-xl border text-left transition-all relative group ${
              selectedId === item.id 
                ? 'bg-indigo-600/10 border-indigo-500/40 shadow-[0_4px_20px_rgba(99,102,241,0.1)]' 
                : 'bg-transparent border-transparent hover:bg-slate-900/30 hover:border-slate-700'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className={`text-[10px] font-mono ${selectedId === item.id ? 'text-indigo-400' : 'text-slate-500'}`}>
                {item.updatedAt.split(' ')[0]}
              </span>
              <div className={`w-1.5 h-1.5 rounded-full ${item.status === '正常' || item.status === '健康' ? 'bg-emerald-500' : 'bg-rose-500'} shadow-[0_0_8px_currentColor]`} />
            </div>
            <div className={`text-[11px] font-bold leading-relaxed ${selectedId === item.id ? 'text-slate-200' : 'text-slate-400'}`}>
              {item.summary}
            </div>
            {idx === 0 && (
              <span className="absolute top-3 right-8 text-[9px] font-black text-indigo-500/60 uppercase">最新</span>
            )}
            {selectedId === item.id && (
              <motion.div layoutId="active-indicator" className="absolute left-0 top-4 bottom-4 w-1 bg-indigo-500 rounded-r-lg" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

const DiagnosticReportDrawer = ({ isOpen, onClose, data }: { isOpen: boolean, onClose: () => void, data: any }) => {
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  
  useEffect(() => {
    if (data?.id) setSelectedReportId('current');
  }, [data?.id]);

  if (!data) return null;
  const isPhased = data.format === '0412_phased';

  // Get history from mock data based on task name if it's a phased report
  const historyData = isPhased ? (MOCK_INSPECTION_HISTORY[data.name] || []) : [];
  
  // Combine current data with history for display
  const fullHistory = data ? [
    { id: 'current', updatedAt: data.updatedAt || new Date().toLocaleString(), status: data.status, summary: '本次巡检详情' },
    ...historyData
  ] : historyData;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed top-0 right-0 h-full ${isPhased ? 'w-[92%]' : 'w-[85%]'} max-w-7xl bg-[var(--bg-deep-alt)] border-l border-slate-700 z-[101] flex shadow-[0_0_100px_rgba(0,0,0,0.8)]`}
          >
            {/* Sidebar for History (Only for Phase-style Inspection Reports) */}
            {isPhased && (
              <ReportHistorySidebar 
                history={fullHistory} 
                selectedId={selectedReportId} 
                onSelect={setSelectedReportId} 
              />
            )}

            <div className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col">
              <div className="sticky top-0 bg-[var(--bg-deep-alt)]/80 backdrop-blur-md border-b border-slate-800/50 p-6 flex justify-between items-center z-10 shrink-0">
                <div>
                  <h2 className="text-2xl font-black text-slate-100 tracking-tighter flex items-center gap-3">
                    <div className={`p-2 ${isPhased ? 'bg-indigo-600/20 text-indigo-400' : 'bg-blue-600/20 text-blue-400'} rounded-xl`}>
                      {isPhased ? <ClipboardCheck size={24} /> : <FileText size={24} />}
                    </div>
                    {isPhased ? 'AI 巡检深度报告' : '根因分析深度报告'}
                    {selectedReportId !== 'current' && <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-500 rounded border border-slate-800/50 ml-2">存档历史报告</span>}
                  </h2>
                  <div className="flex items-center gap-4 mt-2 text-[10px] uppercase font-bold tracking-widest text-slate-500">
                    <span>ID: {data.id || (isPhased ? 'INSP-' : 'INC-') + Date.now().toString().slice(-8)}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-800" />
                    <span>生成时间日期: {selectedReportId === 'current' ? (data.updatedAt || new Date().toLocaleString()) : fullHistory.find(h => h.id === selectedReportId)?.updatedAt}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700">
                    <Download size={14} /> 导出为 PDF
                  </button>
                  <button onClick={onClose} className="p-2.5 rounded-xl hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 transition-all border border-transparent hover:border-rose-500/20">
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-10 space-y-12 max-w-4xl mx-auto flex-1">
                {isPhased ? (
                  <>
                    {/* Phase 1: Overview */}
                    <section>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-1.5 h-6 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                        <h3 className="text-lg font-bold text-slate-100 uppercase tracking-tight">1. 巡检执行概览 (Executive Summary)</h3>
                      </div>
                      <div className="bg-[var(--bg-deep-alt)] border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden group mb-6 shadow-inner">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><ClipboardCheck size={100} /></div>
                        
                        <div className="relative z-10 flex flex-col gap-6">
                          {/* Top Info Bar */}
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                              <AlertTriangle size={14} /> 风险等级：中高风险
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                              <Target size={14} /> 影响范围：3 个实例
                            </div>
                          </div>

                          {/* Overview Text */}
                          <p className="text-sm text-blue-100/80 leading-relaxed font-bold">
                            针对「{data.stage1?.objectTable?.[0]?.[1] || '指定对象'}」的专家级深度巡检已完成。本次分析历经四阶段全自动推演，通过对 CPU、内存、错误率等多维指标的交叉穿透，识别出 {data.stage3?.evidenceList?.length || 0} 项运维核心证据。
                          </p>
                          
                          {/* Main Issues */}
                          <div>
                            <h4 className="text-[10px] font-black text-rose-400/80 uppercase tracking-widest mb-3 flex items-center gap-2">
                              主要问题
                            </h4>
                            <ul className="space-y-2">
                              <li className="flex items-center gap-3 text-sm font-bold text-slate-300">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" /> CPU 持续高负载
                              </li>
                              <li className="flex items-center gap-3 text-sm font-bold text-slate-300">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" /> 错误率升高
                              </li>
                            </ul>
                          </div>

                          {/* Recommendations */}
                          <div className="pt-2">
                            <h4 className="text-[10px] font-black text-emerald-400/80 uppercase tracking-widest mb-3 flex items-center gap-2">
                              AI 修复建议
                            </h4>
                            <div className="flex flex-wrap items-center gap-3">
                              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 text-xs font-bold transition-all border border-emerald-500/30">
                                👉 立即执行 Heap Dump
                              </button>
                              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700 shadow-sm">
                                👉 查看最近变更
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      {data.stage1?.objectTable && <AnalysisTable title="（1）巡检对象详细快照" columns={['名称', '描述']} data={data.stage1.objectTable} />}
                      {data.stage1?.metricsTable && <AnalysisTable title="（2）关键指标运行基准" columns={['指标', '当前值', '阈值', '状态']} data={data.stage1.metricsTable} />}
                    </section>

                    {/* Phase 2: Evidence Gallery */}
                    <section>
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-1.5 h-6 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                        <h3 className="text-lg font-bold text-slate-100 uppercase tracking-tight">2. 深度证据链 (Deep Evidence Chain)</h3>
                      </div>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          {data.stage2?.charts?.map((chart: any, i: number) => (
                            <div key={i} className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-4">
                              <AnalysisTrendChart {...chart} />
                            </div>
                          ))}
                        </div>
                        {data.stage2?.comparisonTable && <AnalysisTable title="（1）历史趋势对比明细" columns={['指标', '当前值', '昨日同期', '阈值']} data={data.stage2.comparisonTable} />}
                        {data.stage2?.correlationTable && <AnalysisTable title="（2）多维度指标关联分析" columns={['维度', '状态', '趋势', '关联性']} data={data.stage2.correlationTable} />}
                      </div>
                    </section>

                    {/* Phase 3: Reasoning */}
                    <section>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-1.5 h-6 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                        <h3 className="text-lg font-bold text-slate-100 uppercase tracking-tight">3. 归因推演逻辑 (Diagnosis Reasoning)</h3>
                      </div>
                      <div className="space-y-4">
                        {data.stage3?.candidateTable && <AnalysisTable title="分析候选原因与权重" columns={['可能原因', '证据强度', '推演结论']} data={data.stage3.candidateTable} />}
                        <div className="bg-slate-900/50 border border-slate-800/30 rounded-2xl p-8 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-5"><Brain size={48} /></div>
                          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">关键异常链路证据汇总</div>
                          <ul className="space-y-4">
                            {data.stage3?.evidenceList?.map((e: string, i: number) => (
                              <li key={i} className="text-sm text-slate-300 flex items-start gap-3 group">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0 group-hover:scale-150 transition-transform" />
                                <span className="leading-relaxed leading-6">{e}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </section>

                    {/* Phase 4: Conclusion */}
                    <section className="pb-20">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        <h3 className="text-lg font-bold text-slate-100 uppercase tracking-tight">4. 巡检审定结论 (Final Verdict)</h3>
                      </div>
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-10 relative overflow-hidden mb-8 group">
                        <div className="absolute -bottom-8 -right-8 opacity-5 group-hover:opacity-10 transition-opacity"><Brain size={160} /></div>
                        <div className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-4">AI 专家系统终审意见</div>
                        <p className="text-xl text-emerald-50/90 font-bold leading-relaxed italic relative z-10 antialiased">
                          “{data.stage4?.judgment}”
                        </p>
                      </div>
                      {data.stage4?.summaryTable && <AnalysisTable title="巡检判定维表明细" columns={['评估维度', '自动化判定结果']} data={data.stage4.summaryTable} />}
                    </section>
                  </>
                ) : (
                  <>
                    {/* Section 1: Fault Overview (故障概述) */}
                    <section>
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-6 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                          <h3 className="text-lg font-bold text-slate-100 uppercase tracking-tight">1. 故障概述 (Fault Overview)</h3>
                        </div>
                        {data.confidence && (
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">分析置信度: {data.confidence}%</span>
                          </div>
                        )}
                      </div>
                      <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Zap size={80} /></div>
                        <p className="text-base text-blue-100/80 leading-relaxed font-bold italic relative z-10">
                          {data.faultOverview || data.conclusion || "本次故障由系统组件异常引起，已自动完成链路锁定与根因推导。"}
                        </p>
                      </div>
                  </section>

                  {/* Section 2: Impact Scope (影响范围) */}
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1.5 h-6 bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                      <h3 className="text-lg font-bold text-slate-100 uppercase tracking-tight">2. 影响范围 (Impact Scope)</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-4">
                        <div className="text-[10px] font-black text-rose-500 uppercase mb-2">受波及服务节点</div>
                        <div className="flex flex-wrap gap-2">
                          {(data.impactScope?.nodes || ['vserver-prod']).map((node: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 bg-rose-500/10 text-rose-400 rounded text-[10px] font-mono border border-rose-500/20">{node}</span>
                          ))}
                        </div>
                      </div>
                      <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-4">
                        <div className="text-[10px] font-black text-rose-500 uppercase mb-2">影响用户规模</div>
                        <div className="text-xl font-black text-slate-200">{data.impactScope?.userVolume || '暂无统计'}</div>
                      </div>
                      <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-4">
                        <div className="text-[10px] font-black text-rose-500 uppercase mb-2">故障定级</div>
                        <div className="text-lg font-black text-rose-400 tracking-tighter">{data.impactScope?.level || 'P2'}</div>
                      </div>
                    </div>
                  </section>

                  {/* Section 3: Root Cause Analysis (根因分析) */}
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1.5 h-6 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                      <h3 className="text-lg font-bold text-slate-100 uppercase tracking-tight">3. 根因深度剖析 (Root Cause Analysis)</h3>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5"><Brain size={64} /></div>
                        <div className="text-xs font-black text-amber-500 uppercase tracking-widest mb-3">核心诊断结论 (Core Conclusion)</div>
                        <p className="text-base text-amber-50/90 font-bold leading-relaxed">{data.rootCause?.coreConclusion || data.conclusion}</p>
                      </div>

                      <div className="bg-black/20 border border-slate-800 rounded-2xl p-6">
                        <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                          <Activity size={14} className="text-amber-500" /> 故障传播链 (Propagation Chain)
                        </div>
                        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2">
                          {(data.rootCause?.propagationChain || [
                            { from: '入口服务', to: '业务应用', reason: '请求超时', status: 'error' },
                            { from: '业务应用', to: '数据库', reason: '连接拒绝', status: 'active' }
                          ]).map((item: any, i: number) => (
                            <React.Fragment key={i}>
                              <div className="flex flex-col items-center gap-3 shrink-0">
                                <div className={`px-4 py-2 rounded-xl border ${item.status === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'} text-xs font-bold tracking-tight shadow-sm`}>
                                  {item.from}
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono italic tracking-tighter opacity-80">{item.reason}</span>
                              </div>
                              {i < (data.rootCause?.propagationChain?.length || 2) - 1 && (
                                <ArrowRight size={16} className="text-slate-700 mt-[-18px]" />
                              )}
                              {i === (data.rootCause?.propagationChain?.length || 2) - 1 && (
                                <React.Fragment>
                                  <ArrowRight size={16} className="text-slate-700 mt-[-18px]" />
                                  <div className="px-4 py-2 rounded-xl border bg-slate-800 border-slate-700 text-slate-400 text-xs font-bold tracking-tight">
                                    {item.to}
                                  </div>
                                </React.Fragment>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>

                      {data.rootCause?.evidenceMetrics && (
                        <AnalysisTable 
                          title="关键证据指标" 
                          columns={['监控指标', '当前值', '基准线', '异常状态']} 
                          data={data.rootCause.evidenceMetrics} 
                        />
                      )}
                    </div>
                  </section>

                  {/* Section 4: Handling Suggestions (处理方案) */}
                  <section className="pb-20">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                      <h3 className="text-lg font-bold text-slate-100 uppercase tracking-tight">4. 处理建议与自愈方案 (Actionable Plans)</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {(data.recommendations || [
                        { title: '建议一', description: '描述信息', risk: '低' },
                        { title: '建议二', description: '描述信息', risk: '高' }
                      ]).map((rec: any, i: number) => (
                        <div key={i} className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5 hover:bg-emerald-500/[0.08] transition-all group">
                          <div className="flex justify-between items-start mb-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${rec.risk === '低' || rec.risk === '极低' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>Risk: {rec.risk}</span>
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Zap size={14} />
                            </div>
                          </div>
                          <h4 className="text-sm font-bold text-slate-200 mb-1.5">{rec.title}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">{rec.description}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const AnalysisTable = ({ title, columns, data }: { title?: string, columns: string[], data: any[][] }) => (
  <div className="bg-black/20 border border-slate-800 rounded-xl overflow-hidden my-3">
    {title && (
      <div className="px-3 py-1.5 bg-slate-900/30 border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
        {title}
      </div>
    )}
    <div className="overflow-x-auto no-scrollbar">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800/50">
            {columns.map((col, i) => (
              <th key={i} className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter whitespace-nowrap">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-slate-800/20 last:border-0 hover:bg-slate-900/10">
              {row.map((cell, j) => (
                <td key={j} className={`px-3 py-2 text-[11px] font-medium whitespace-nowrap ${cell === '异常' ? 'text-rose-500' :
                    cell === '偏高' ? 'text-orange-500' :
                      cell === '正常' ? 'text-emerald-500' : 'text-slate-300'
                  }`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const AnalysisTrendChart = ({ title, labels, data, events }: { title: string, labels: string[], data: number[], events?: { time: string, label: string }[] }) => {
  const max = Math.max(...data, 100);
  const min = 0;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((val - min) / (max - min)) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-[var(--bg-deep)] border border-slate-800 rounded-xl p-4 my-3 overflow-visible">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Activity size={12} className="text-blue-500" /> {title}
        </h4>
        <div className="text-[9px] text-slate-600 font-mono italic">UNIT: %</div>
      </div>

      <div className="relative h-24 w-full">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
          <line x1="0" y1="80" x2="100" y2="80" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />

          <path
            d={`M 0,100 L ${points} L 100,100 Z`}
            fill="url(#chartGradient)"
            className="opacity-20"
          />

          <polyline
            points={points}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {events?.map((e, idx) => {
            const timeIdx = labels.indexOf(e.time);
            if (timeIdx === -1) return null;
            const x = (timeIdx / (labels.length - 1)) * 100;
            return (
              <g key={idx}>
                <line x1={x} y1="0" x2={x} y2="100" stroke="#f43f5e" strokeWidth="0.5" strokeDasharray="2 2" />
                <circle cx={x} cy={100 - ((data[timeIdx] - min) / (max - min)) * 100} r="1.5" fill="#f43f5e" />
              </g>
            );
          })}

          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>

        {events?.map((e, idx) => {
          const timeIdx = labels.indexOf(e.time);
          if (timeIdx === -1) return null;
          const x = (timeIdx / (labels.length - 1)) * 100;
          return (
            <div key={idx} className="absolute -top-3 -translate-x-1/2 px-1.5 py-0.5 bg-rose-600 text-white text-[8px] font-black rounded uppercase shadow-lg shadow-rose-900/20 whitespace-nowrap z-10" style={{ left: `${x}%` }}>
              {e.label}
            </div>
          );
        })}
      </div>

      <div className="flex justify-between mt-3 text-[8px] text-slate-600 font-mono tracking-tighter">
        <span>{labels[0]}</span>
        <span>{labels[Math.floor(labels.length / 2)]}</span>
        <span>{labels[labels.length - 1]}</span>
      </div>
    </div>
  );
};

const InspectionTaskSnapshotCard = ({ data }: { data: any }) => {
  return (
    <div className="bg-[var(--bg-elevated)] border border-slate-800/80 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
      <div className="relative p-6 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />

        <div className="flex items-start gap-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-500 border border-blue-500/30 flex items-center justify-center shrink-0 shadow-2xl">
            <ClipboardCheck size={28} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-black leading-tight tracking-tight text-slate-100">
                {data.name}
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Target size={12} className="text-blue-400" /> 巡检对象
                </div>
                <div className="text-sm font-mono text-slate-300">{data.target}</div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <ShieldAlert size={12} className="text-orange-400" /> 风险等级
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black px-2 py-0.5 rounded leading-none ${data.riskLevel === '高' ? 'bg-rose-600 text-white' : 'bg-orange-600 text-white'
                    }`}>
                    {data.riskLevel}风险
                  </span>
                </div>
              </div>

              <div className="col-span-2 space-y-1.5 pt-2">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <History size={12} className="text-emerald-400" /> 异常摘要
                </div>
                <div className="text-xs text-slate-400 leading-relaxed bg-slate-900/30 p-2 rounded-lg border border-slate-800/50">
                  {data.summary}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AlarmContextChatCard = ({ data, isEmbedded }: { data: Alarm; isEmbedded?: boolean }) => {
  return (
    <div className={`overflow-hidden shadow-2xl transition-all ${isEmbedded
        ? 'bg-white/10 backdrop-blur-md border border-white/20 rounded-xl w-full'
        : 'bg-[var(--bg-elevated)] border border-slate-800/80 rounded-3xl w-full'
      } max-w-4xl`}>
      <div className={`relative p-6 ${isEmbedded ? '' : 'bg-gradient-to-br from-slate-800/20 via-transparent to-transparent'}`}>
        {!isEmbedded && <div className={`absolute top-0 left-0 w-1.5 h-full ${data.level === 'P0' ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]' : 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]'}`} />}

        <div className="flex items-start gap-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl ${data.level === 'P0'
              ? (isEmbedded ? 'bg-rose-500/30 text-rose-100' : 'bg-rose-500/20 text-rose-500 border border-rose-500/30')
              : (isEmbedded ? 'bg-orange-500/30 text-orange-100' : 'bg-orange-500/20 text-orange-500 border border-orange-500/30')
            }`}>
            <ShieldAlert size={28} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h4 className={`text-xl font-black leading-tight tracking-tight ${isEmbedded ? 'text-white' : 'text-slate-100'}`}>
                {data.title}
              </h4>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Box size={12} className="text-blue-400" /> 告警 ID
                </div>
                <div className="text-sm font-mono text-slate-300">{data.id}</div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <AlertTriangle size={12} className="text-orange-400" /> 告警级别
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black px-2 py-0.5 rounded leading-none ${data.level === 'P0' ? 'bg-rose-600 text-white' :
                      data.level === 'P1' ? 'bg-orange-600 text-white' :
                        'bg-amber-600 text-white'
                    }`}>{data.level}</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={12} className="text-emerald-400" /> 告警触发时间
                </div>
                <div className="text-sm font-bold text-slate-200">{data.startTime}</div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Filter size={12} className="text-indigo-400" /> 告警类型
                </div>
                <div className="text-sm font-bold text-slate-300">{data.type}</div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Server size={12} className="text-purple-400" /> 告警来源
                </div>
                <div className="text-sm font-bold text-slate-300">{data.service}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Zap size={12} className="text-amber-400" /> 收敛策略
                </div>
                <div className="text-sm font-bold text-indigo-400 flex items-center gap-1.5 line-clamp-1">
                   {(() => {
                      const strategyMap: Record<string, { label: string; icon: any }> = {
                        time: { label: '时间窗口', icon: Clock },
                        topo: { label: '拓扑感知', icon: Network },
                        semantic: { label: '语义相似', icon: Quote },
                        root: { label: '根因溯源', icon: Target },
                        dup: { label: '去重收敛', icon: RefreshCw }
                      };
                      const strategy = strategyMap[data.convergenceStrategy || 'time'];
                      const Icon = strategy.icon;
                      return <><Icon size={12} className="text-amber-400/80 animate-pulse" /> {strategy.label}</>;
                    })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RetrievalSummaryCard: React.FC<{ data: any }> = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [visibleStep, setVisibleStep] = useState(0);

  const steps = [
    {
      title: '问题语义理解',
      content: '识别意图: 故障排查 / 服务 P99 延迟飙升的根因...， 类型: 操作流程',
      icon: <Search size={12} className="text-indigo-400" />
    },
    {
      title: '向量检索',
      content: `已检索关键词: ${data.keywords || 'JVM 性能调优 / 垃圾回收机制'}`,
      icon: <Layers size={12} className="text-blue-400" />
    },
    {
      title: '候选文档召回',
      content: (
        <span>
          召回候选 <span className="text-emerald-400 font-bold">Top 8</span>，过滤后保留 <span className="text-emerald-400 font-bold">5 篇</span>
        </span>
      ),
      icon: <Files size={12} className="text-emerald-400" />
    },
    {
      title: '重排序 & 片段精提',
      content: (
        <span>
          精排保留最相关片段 <span className="text-emerald-400 font-bold">3 段</span>，相似度 <span className="text-emerald-400 font-bold">0.91 / 0.87 / 0.83</span>
        </span>
      ),
      icon: <Target size={12} className="text-purple-400" />
    },
    {
      title: '构建上下文',
      content: '上下文组装完毕 ( ~1200 tokens )，开始生成...',
      icon: <Zap size={12} className="text-orange-400" />
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleStep(prev => {
        if (prev >= steps.length) {
          clearInterval(interval);
          // 检索流程全部圆满完成，1.5 秒后自动收起卡片
          setTimeout(() => setIsExpanded(false), 1500);
          return prev + 1; // 额外一步，让最后一步“构建上下文”也亮起绿色
        }
        return prev + 1;
      });
    }, 700);
    return () => clearInterval(interval);
  }, [steps.length]);

  if (!data) return null;

  return (
    <div className="bg-[var(--bg-card)] border border-slate-800 rounded-xl overflow-hidden mb-4 shadow-xl w-full max-w-[700px]">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3.5 bg-indigo-500/[0.04] hover:bg-indigo-500/[0.08] cursor-pointer flex items-center justify-between transition-colors border-b border-transparent"
        style={isExpanded ? { borderBottomColor: 'rgba(51, 65, 85, 0.5)' } : {}}
      >
        <div className="flex items-center gap-2.5 text-xs font-bold text-slate-300">
          <Brain size={16} className="text-indigo-400 shrink-0" />
          <span className="flex items-center gap-2 uppercase tracking-wide">
            知识检索过程
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse delay-100" />
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse delay-200" />
            </div>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-slate-100 uppercase tracking-widest font-black transition-colors">
          {isExpanded ? 'Hide Trace' : 'Show Trace'} <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-black/20 text-xs px-5 py-4 space-y-4"
          >
            {steps.map((step, idx) => (
              visibleStep >= idx + 1 && (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  className="relative group"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex flex-col items-center">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${visibleStep > idx + 1 ? 'bg-emerald-500 text-white' : 'bg-slate-800 border-2 border-slate-700 animate-pulse'}`}>
                        {visibleStep > idx + 1 ? <CheckCircle2 size={12} strokeWidth={3} /> : step.icon}
                      </div>
                      {idx < steps.length - 1 && (
                        <div className={`w-px h-10 my-1 transition-colors ${visibleStep > idx + 1 ? 'bg-emerald-500/50' : 'bg-slate-800'}`} />
                      )}
                    </div>
                    <div className="space-y-1 py-0.5">
                      <div className="text-[11px] font-black text-slate-200 uppercase tracking-tight flex items-center gap-2">
                        {step.title}
                        {visibleStep === idx + 1 && <span className="text-[9px] text-indigo-400 animate-pulse">检索中...</span>}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium leading-relaxed bg-slate-900/20 px-3 py-1.5 rounded-lg border border-slate-800/50">
                        {step.content}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SourceTraceDrawer: React.FC<{ isOpen: boolean, onClose: () => void, data: any, onAction?: (action: string, payload?: any) => void }> = ({ isOpen, onClose, data, onAction }) => {
  const [viewingDoc, setViewingDoc] = useState<any | null>(null);

  // Reset viewingDoc when drawer closes/opens with new data
  useEffect(() => {
    if (data?.targetDocIndex !== undefined && data.sources?.[data.targetDocIndex]) {
      setViewingDoc(data.sources[data.targetDocIndex]);
    } else {
      setViewingDoc(null);
    }
  }, [data]);

  if (!isOpen) return null;
  const sources = data?.sources || [];

  const renderDocDetail = (doc: any) => {
    // Generate some mock full text around the fragment to simulate drill down
    const mockFullText = `
      <div class="mb-6 space-y-4 text-slate-300">
        <p>在云计算与微服务架构的演进过程中，<strong>${doc.title}</strong> 作为核心组件发挥了至关重要的作用。本章节将深入探讨其内部机制、常见性能瓶颈以及在生产环境中的最佳实践。</p>
        
        <p>针对运维排查，我们通常关注其核心链路的连通性与资源占用配额。以下是从知识库提取的关键内容截断：</p>
        
        <div class="my-6 p-4 bg-indigo-500/10 border-l-4 border-indigo-500 rounded-lg font-medium text-slate-100 shadow-lg shadow-indigo-500/5 ring-1 ring-indigo-500/20">
          <div class="text-[10px] text-indigo-400 font-black uppercase mb-2 tracking-widest">命中原文片段：</div>
          ${doc.fragment}
        </div>
        
        <p>针对上述提到的关键指标，我们建议 SRE 团队采用自动化的监控策略。特别是当 P99 延迟超过 2s 或错误率突增时，应立即触发预警并调用相应的自愈脚本。</p>
        
        <p>该文档的部署架构应充分考虑高可用性（HA）。建议跨可用区部署，并配置合理的 Pod 阻断策略。此外，针对大规模集群，引入 Service Mesh（如 Istio）可以极大地提升链路的可观测性。</p>
      </div>
    `;

    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }} 
        animate={{ opacity: 1, x: 0 }} 
        className="space-y-6"
      >
        <div className="bg-[var(--bg-card)] border border-slate-800 p-6 rounded-2xl shadow-inner relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <BookOpen size={120} />
          </div>
          
          <div className="relative z-10">

            
            <h4 className="text-lg font-black text-slate-100 mb-6 leading-snug">
              {doc.title}
            </h4>

            {doc.libId === 'sop' ? (
              <div className="rounded-xl border border-slate-800/50 overflow-hidden bg-[var(--bg-deep)] h-[650px] mb-6 relative group ring-1 ring-white/5 shadow-2xl">
                <CustomPDFViewer 
                  url="/assets/docs/sop_detail.pdf" 
                  title={doc.title} 
                  mockHighlight={true}
                />
              </div>
            ) : (
              <div 
                className="text-xs leading-relaxed text-slate-400" 
                dangerouslySetInnerHTML={{ __html: mockFullText }} 
              />
            )}
          </div>
        </div>

        <div className="bg-slate-800/20 border border-slate-800/50 p-4 rounded-xl flex items-center justify-between">
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-[10px] text-slate-500 font-bold uppercase">相关系数</div>
              <div className="text-sm font-black text-emerald-400 font-mono">{doc.score}</div>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-center">
              <div className="text-[10px] text-slate-500 font-bold uppercase">更新于</div>
              <div className="text-sm font-black text-slate-300 font-mono">2026-03-24</div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="w-1/2 h-full bg-[var(--bg-deep)] border-l border-slate-800 flex flex-col shrink-0 relative shadow-2xl z-20">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[var(--bg-panel-deep)]">
        <div className="flex items-center gap-3">
          {viewingDoc && (
            <button 
              onClick={() => setViewingDoc(null)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-100 transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Target size={16} className="text-indigo-400" />
            {viewingDoc ? '文档详情' : '溯源详情'}
          </h3>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-100 transition-colors">
          <X size={16} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 no-scrollbar space-y-4">
        {viewingDoc ? (
          renderDocDetail(viewingDoc)
        ) : (
          <>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-black/20 p-3 rounded-lg border border-slate-800/50">
              当前回答由 <span className="text-indigo-400">{sources.length}</span> 篇核心文档支撑
            </div>
            {sources.map((src: any, idx: number) => (
              <div key={idx} className="bg-[var(--bg-card)] border border-slate-800 p-4 rounded-xl space-y-3 hover:border-slate-700 transition-all group">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText size={12} className="text-indigo-500" />
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">来源文档</span>
                    </div>
                    <div className="text-xs font-bold text-slate-200 truncate">{idx + 1}. {src.title}</div>
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded shrink-0">
                    S:{src.score}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {src.attributes?.map((attr: string, i: number) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800/50 border border-slate-700/50 text-slate-500 text-[9px] font-bold uppercase">
                      {attr}
                    </span>
                  ))}
                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-bold uppercase">
                    {src.author || '运维专家'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                    <Book size={10} className="text-indigo-400" />
                    <span>命中章节: <span className="text-slate-200">{src.chapter || '正文内容'}</span></span>
                  </div>
                  <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800 text-[11px] text-slate-400 leading-relaxed relative overflow-hidden group-hover:bg-black/60 transition-colors">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/20" />
                    <div dangerouslySetInnerHTML={{ __html: src.fragment || "" }} className="italic" />
                  </div>
                </div>

                <button
                  onClick={() => setViewingDoc(src)}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/30 hover:bg-indigo-500/10 border border-slate-700/50 hover:border-indigo-500/30 text-[10px] font-bold text-slate-400 hover:text-indigo-400 transition-all group/btn"
                >
                  <span>跳转查看原文</span>
                  <ArrowUpRight size={12} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

// --- Log Analysis Stage Components ---

const LogAnalysisInitCard: React.FC<{ data: any }> = ({ data }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[var(--bg-elevated)] border border-indigo-500/30 rounded-2xl p-5 shadow-xl w-full max-w-[540px] relative overflow-hidden group"
  >
    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50" />
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
        <Terminal size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
          问题识别完成 <CheckCircle2 size={14} className="text-emerald-500" />
        </h4>
        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">分析对象</span>
            <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/10 w-fit">{data.object}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">影响服务范围</span>
            <div className="flex flex-wrap gap-2">
              {data.services?.map((s: string) => (
                <span key={s} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

const LogAnalysisRetrievalCard: React.FC<{ data: any }> = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--bg-card)] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl w-full max-w-[600px]"
    >
      <div className="p-4 bg-indigo-500/[0.03] border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search size={16} className="text-indigo-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">阶段 2: 日志检索与语义提取</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase font-bold">命中条数</span>
            <span className="text-xs font-mono text-emerald-500 font-bold">{data.metrics?.hitCount}</span>
          </div>
          <div className="w-px h-6 bg-slate-800" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase font-bold">查全率</span>
            <span className="text-xs font-mono text-blue-400 font-bold">{data.metrics?.recallRate}</span>
          </div>
        </div>
      </div>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900/30 p-2 rounded-lg border border-slate-800/50">
            <div className="text-[9px] text-slate-500 mb-1 uppercase tracking-tight">时间范围</div>
            <div className="text-[11px] text-slate-300 font-bold">{data.metrics?.timeRange}</div>
          </div>
          <div className="bg-slate-900/30 p-2 rounded-lg border border-slate-800/50">
            <div className="text-[9px] text-slate-500 mb-1 uppercase tracking-tight">覆盖服务</div>
            <div className="text-[11px] text-slate-300 font-bold">{data.metrics?.serviceCount} 个应用</div>
          </div>
        </div>
        <div className="relative group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5"><Terminal size={12} /> 关键日志片段</span>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
            >
              {isExpanded ? '收起' : '展开完整堆栈'}
            </button>
          </div>
          <div className={`bg-slate-900/40 border border-slate-800 rounded-xl p-4 font-mono text-[11px] leading-relaxed relative transition-all duration-300 ${isExpanded ? 'max-h-[400px]' : 'max-h-[120px] overflow-hidden'}`}>
            {!isExpanded && <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />}
            <pre className="text-slate-400 whitespace-pre-wrap">
              {data.snippet.split('\n').map((line: string, i: number) => (
                <div key={i} className={`flex gap-3 ${line.includes('ERROR') ? 'text-rose-400 border-l-2 border-rose-500/50 pl-2 -ml-2 bg-rose-500/5' : ''}`}>
                  <span className="text-slate-700 select-none w-4">{i + 1}</span>
                  <span>{line}</span>
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const LogAnalysisCorrelationCard: React.FC<{ data: any }> = ({ data }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[var(--bg-card)] border border-slate-800 rounded-2xl p-5 shadow-2xl w-full max-w-[540px]"
  >
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <Activity size={16} className="text-purple-400" />
        <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">阶段 3: 链路追踪与级联分析</span>
      </div>
      <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5 bg-rose-500/5 text-rose-400 px-2 py-1 rounded-full border border-rose-500/10">
        <Flame size={12} /> 异常传播率: {data.failureRate}
      </div>
    </div>
    
    <div className="bg-slate-900/30 rounded-2xl border border-slate-800/50 p-6 mb-4">
      <div className="flex items-center justify-around relative pt-4 pb-2">
        {/* Horizontal Arrows Background */}
        <div className="absolute top-1/2 left-12 right-12 h-px bg-slate-800 -translate-y-1/2" />
        
        {data.nodes.map((node: any, idx: number) => (
          <div key={node.id} className="relative flex flex-col items-center gap-3 z-10">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.2 }}
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-lg transition-all ${
              node.status === 'critical' ? 'bg-rose-500/20 border-rose-500 text-rose-500 shadow-rose-500/20' :
              node.status === 'warning' ? 'bg-orange-500/20 border-orange-500 text-orange-500' :
              'bg-blue-500/10 border-blue-500 text-blue-400'
            }`}>
              {node.status === 'critical' ? <X size={18} /> : 
               node.status === 'warning' ? <AlertTriangle size={18} /> : 
               <Check size={18} />}
            </motion.div>
            <span className={`text-[10px] font-bold uppercase tracking-tight ${
              node.status === 'critical' ? 'text-rose-400' : 
              node.status === 'warning' ? 'text-orange-400' : 
              'text-slate-500'
            }`}>{node.label}</span>
            {idx < data.nodes.length - 1 && (
              <div className="absolute top-[18px] -right-full w-full translate-x-1/2">
                <ArrowRight size={14} className={node.status === 'critical' || data.nodes[idx+1].status === 'critical' ? 'text-rose-500/50' : 'text-slate-700'} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
    <div className="text-[10px] text-slate-500 leading-relaxed italic text-center">
      分析结论: 异常模式从下游 <span className="text-rose-400 font-bold">DB Pool</span> 向上传导，导致 <span className="text-orange-400 font-bold">Order-service</span> 级联超时。
    </div>
  </motion.div>
);

const LogAnalysisEvidenceCard: React.FC<{ data: any }> = ({ data }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-[var(--bg-elevated)] border border-blue-500/20 rounded-2xl p-5 shadow-xl w-full max-w-[500px] relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/[0.03] blur-3xl pointer-events-none" />
    <div className="flex items-center gap-2 mb-4">
      <ClipboardCheck size={16} className="text-blue-400" />
      <span className="text-xs font-bold text-slate-200 uppercase tracking-widest">阶段 4: 证据逻辑收敛</span>
    </div>
    <div className="space-y-4 relative z-10">
      {data.evidence.map((item: string, idx: number) => (
        <motion.div 
          key={idx}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="flex items-start gap-3 bg-black/20 p-3 rounded-xl border border-slate-800/40"
        >
          <div className="w-5 h-5 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{idx + 1}</div>
          <p className="text-[11px] text-slate-300 leading-relaxed font-medium">{item}</p>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

const LogAnalysisDiagnosisCard: React.FC<{ data: any }> = ({ data }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-indigo-600/5 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl w-full max-w-[540px] relative"
  >
    <div className="absolute top-6 right-6">
      <Sparkles size={24} className="text-indigo-500/30 animate-pulse" />
    </div>
    <div className="flex items-center gap-2 mb-5">
      <Brain size={18} className="text-indigo-400" />
      <span className="text-xs font-bold text-slate-200 uppercase tracking-widest">阶段 5: AI 专家诊断结论</span>
    </div>
    
    <div className="space-y-6">
      <div>
        <div className="text-[10px] text-indigo-400 font-bold uppercase mb-2 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" /> 核心根因 (Root Cause)
        </div>
        <p className="text-sm font-bold text-slate-100 leading-snug">{data.rootCause}</p>
      </div>
      
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="text-[10px] text-slate-500 font-bold uppercase mb-2">推理逻辑链</div>
          <p className="text-[11px] text-slate-400 italic line-clamp-2">{data.logicChain}</p>
        </div>
        <div className="w-px bg-slate-800" />
        <div className="flex-1">
          <div className="text-[10px] text-slate-500 font-bold uppercase mb-2">置信度</div>
          <div className="flex items-end gap-1">
            <span className="text-lg font-bold text-emerald-400 font-mono italic">87</span>
            <span className="text-[10px] text-slate-500 mb-1 font-bold">%</span>
          </div>
        </div>
      </div>

      <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
        <div className="flex items-center gap-2 mb-1.5 text-amber-400">
          <Info size={12} />
          <span className="text-[10px] font-bold uppercase tracking-tight">不确定性提示</span>
        </div>
        <p className="text-[10px] text-amber-200/70 font-medium">{data.uncertainty}</p>
      </div>
    </div>
  </motion.div>
);

const LogAnalysisActionCard: React.FC<{ data: any, onAction: any }> = ({ data, onAction }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-[var(--bg-card)] border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl w-full max-w-[600px]"
  >
    <div className="px-5 py-4 bg-slate-900/20 border-b border-slate-800 flex items-center gap-2">
      <Zap size={16} className="text-amber-400" />
      <span className="text-xs font-bold text-slate-200 uppercase tracking-widest">阶段 6: 响应决策建议 (Action Group)</span>
    </div>
    
    <div className="p-5 space-y-6">
      {data.groups.map((group: any, gIdx: number) => (
        <div key={gIdx} className="space-y-4">
          <div className={`text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 ${
            group.type === 'critical' ? 'text-rose-500' :
            group.type === 'warning' ? 'text-amber-500' :
            'text-blue-500'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${
              group.type === 'critical' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' :
              group.type === 'warning' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
              'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
            }`} />
            {group.title}
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {group.actions.map((action: any, aIdx: number) => (
              <div key={aIdx} className="group/item flex items-center justify-between p-3 bg-slate-900/40 border border-slate-800 hover:border-slate-600 rounded-xl transition-all">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-200 group-hover/item:text-white transition-colors">{action.label}</span>
                  <span className="text-[10px] text-slate-500 font-medium">{action.desc}</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onAction('EXECUTE_LOG_ACTION', action)}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all shadow-lg ${
                    group.type === 'critical' ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/20' :
                    group.type === 'warning' ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/20' :
                    'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20'
                  }`}
                  >
                    执行
                  </button>
                  <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold rounded-lg text-[10px] transition-all">
                    详情
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

const LogClusterChatCard: React.FC<{ data: any }> = ({ data }) => (
  <div className="bg-[var(--bg-elevated)] border border-slate-800 rounded-2xl p-4 shadow-xl w-full max-w-[320px]">
    <div className="flex justify-between items-start mb-2">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold text-slate-200">{data.title}</span>
        <span className="text-[10px] text-slate-500 font-bold tracking-tight uppercase">{data.service}</span>
      </div>
      <span className="text-xs font-mono font-bold text-slate-500 bg-slate-800/50 px-1.5 py-0.5 rounded leading-none">{data.count}</span>
    </div>
    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800/50">
      <div className="w-6 h-6 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400">
        <Terminal size={12} />
      </div>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">已发送 AI 深度分析请求</span>
    </div>
  </div>
);

const ChatBubble: React.FC<{ 
  message: Message, 
  onAction?: (action: string, payload?: any) => void,
  inspectionContext?: {
    taskName: string,
    setTaskName: (val: string) => void,
    frequency: string,
    setFrequency: (val: string) => void,
    ruleDraft: any,
    targets: any[]
  }
}> = ({ message, onAction, inspectionContext }) => {
  const isAI = message.type === 'ai';
  const isSystem = message.type === 'system';

  // 渲染独立的快照消息，按照发送者身份进行左右对齐，并带有头像
  if (message.contentType === 'alarm_context' || message.contentType === 'inspection_task_select' || message.contentType === 'log_cluster_selection') {
    return (
      <div className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-6`}>
        <div className={`flex gap-3 max-w-[85%] ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
          {/* 头像 */}
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isAI ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-700 text-slate-300'}`}>
            {isAI ? <Bot size={18} /> : <User size={18} />}
          </div>

          {/* 卡片内容 */}
          <div className={`flex flex-col gap-2 ${isAI ? 'items-start' : 'items-end'}`}>
            {message.contentType === 'alarm_context' ? (
              <AlarmContextChatCard data={message.data} />
            ) : message.contentType === 'inspection_task_select' ? (
              <InspectionTaskSnapshotCard data={message.data} />
            ) : (
              <LogClusterChatCard data={message.data} />
            )}
            <div className={`flex items-center gap-2 text-[10px] text-slate-500 ${isAI ? 'justify-start' : 'justify-end'}`}>
              <span>{message.timestamp}</span>
              <span className="flex items-center gap-1">
                {message.contentType === 'alarm_context' ? (
                  <ShieldAlert size={10} className="text-purple-500" />
                ) : message.contentType === 'inspection_task_select' ? (
                  <ClipboardCheck size={10} className="text-blue-500" />
                ) : (
                  <Terminal size={10} className="text-indigo-500" />
                )}
                场景快照
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-slate-800/30 backdrop-blur-sm px-4 py-1.5 rounded-full border border-slate-700/50 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-500" />
          <span className="text-sm text-slate-400">{message.content}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-6 group`}>
      <div className={`flex gap-3 max-w-[85%] ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isAI ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-700 text-slate-300'}`}>
          {isAI ? <Bot size={18} /> : <User size={18} />}
        </div>

        <div className="space-y-2 w-full">
          <div className={`p-4 rounded-2xl ${isAI
            ? 'bg-[var(--bg-elevated-alt)] border border-slate-800/50 text-slate-200'
            : 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
            }`}>
            {isAI ? (
              <TypewriterText 
                text={message.content} 
                onCitationClick={(index) => {
                  if (message.retrievalData) {
                    onAction?.('OPEN_SOURCE_TRACE', { 
                      ...message.retrievalData, 
                      targetDocIndex: index - 1 
                    });
                  }
                }}
              />
            ) : (
              <p className="text-base leading-relaxed whitespace-pre-wrap font-medium">{message.content}</p>
            )}

            {message.retrievalData && isAI && !message.hideSourceButton && (
              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => onAction?.('OPEN_SOURCE_TRACE', message.retrievalData)}
                  className="text-xs flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 px-3 rounded-md transition-colors border border-slate-700/50"
                >
                  <Target size={12} className="text-indigo-400" /> [查看来源]
                </button>
              </div>
            )}

            {message.contentType === 'sop' && message.data?.steps && (
              <div className="mt-4 bg-[var(--bg-card)] border border-slate-800 rounded-lg p-3">
                <h4 className="text-base font-bold text-slate-200 mb-2 border-b border-slate-800 pb-2">{message.data.title}</h4>
                <div className="space-y-3 mt-2">
                  {message.data.steps.map((step: any, idx: number) => (
                    <div key={idx} className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 cursor-pointer hover:text-blue-400">
                        <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-500 flex items-center justify-center text-xs shrink-0 font-bold">{idx + 1}</div>
                        <span className="text-sm">{step.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-800">
                  <button className="text-xs bg-slate-800 hover:bg-slate-700 py-1 px-3 rounded">复制全文</button>
                  <button className="text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 py-1 px-3 rounded">关联到当前故障</button>
                </div>
              </div>
            )}
            {message.data?.transferOptions && (
              <div className="mt-4 pt-4 border-t border-slate-800/50 flex flex-col items-start gap-2">
                {message.data.transferOptions.map((opt: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => onAction?.('REQUEST_TRANSFER', opt)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/40 text-indigo-400 rounded-lg text-xs font-medium transition-all"
                  >
                    {opt.label}
                    <ChevronRight size={12} className="opacity-70" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {message.contentType === 'rule_shortcuts' && (
            <RuleShortcutsCard onAction={onAction} />
          )}

          {message.retrievalData && isAI && !message.hideRetrievalCard && (
            <RetrievalSummaryCard data={message.retrievalData} />
          )}

          {message.contentType === 'confirm' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[var(--bg-item)] border border-rose-500/30 rounded-xl p-4 shadow-xl"
            >
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert size={16} className="text-rose-500" />
                <h4 className="text-xs font-bold text-rose-500 uppercase tracking-wider">紧急操作建议</h4>
              </div>
              <p className="text-xs text-slate-300 mb-4">重启 Pod <code className="bg-slate-900/30 px-1 rounded text-blue-400">payment-svc-7d4f8b9c</code> (影响 3% 流量)</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onAction?.('restart')}
                  className="bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold py-2 px-4 rounded-md transition-colors"
                >
                  立即重启 (高危)
                </button>
                <button className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-[10px] font-bold py-2 px-4 rounded-md transition-colors">
                  先看监控
                </button>
              </div>
            </motion.div>
          )}

          {message.contentType === 'incident_report' && <IncidentReportCard data={message.data} onAction={onAction} />}
          {message.contentType === 'change_list' && <ChangeListCard data={message.data} onAction={onAction} />}
          {message.contentType === 'recovery_action' && <RecoveryRecommendationCard data={message.data} onAction={onAction} />}
          {message.contentType === 'target_select' && <TargetSelectionCard data={message.data} onAction={onAction} />}
          {message.contentType === 'rule_draft' && <RuleDraftCard data={message.data} onAction={onAction} />}
          {message.contentType === 'frequency_select' && (
            <FrequencySettingCard 
              onAction={onAction} 
              taskName={inspectionContext?.taskName || ''} 
              setTaskName={inspectionContext?.setTaskName || (() => {})} 
              frequency={inspectionContext?.frequency || '每天一次'} 
              setFrequency={inspectionContext?.setFrequency || (() => {})} 
            />
          )}
          {message.contentType === 'task_summary' && (
            <TaskConfirmationCard 
              onAction={onAction} 
              data={{
                taskName: inspectionContext?.taskName || '',
                targets: inspectionContext?.targets || [],
                ruleDraft: inspectionContext?.ruleDraft || null,
                frequency: inspectionContext?.frequency || '每天一次'
              }} 
            />
          )}
          {message.contentType === 'rule_review' && <RuleReviewCard data={message.data} onAction={onAction} />}
          {message.contentType === 'schedule_review' && <ScheduleReviewCard data={message.data} onAction={onAction} />}
          {message.contentType === 'task_success' && <TaskSuccessCard data={message.data} onAction={onAction} />}
          {message.contentType === 'inspection_type' && <InspectionTypeCard onAction={onAction} />}
          {message.contentType === 'inspection_cron_confirm' && <CronConfirmCard data={message.data} onAction={onAction} />}
          {message.contentType === 'inspection_progress' && <InspectionProgressCard data={message.data} onAction={onAction} />}
          {message.contentType === 'inspection_result_table' && <InspectionResultGrid data={message.data} onAction={onAction} />}
          {message.contentType === 'analysis' && <ExpertDiagnosticCard data={message.data} onAction={onAction} />}
          {message.contentType === 'action_confirm' && <ActionConfirmCard data={message.data} onAction={onAction} />}
          {message.contentType === 'action_execution' && <ActionExecutionCard data={message.data} onAction={onAction} />}
          {message.contentType === 'alarm_context' && <AlarmContextChatCard data={message.data} />}
          {message.contentType === 'inspection_task_select' && <InspectionTaskSelectCard onAction={onAction} />}
          {message.contentType === 'inspection_diagnostic_report' && <InspectionDiagnosticReportCard data={message.data} />}
          {message.contentType === 'inspection_conclusion' && <InspectionConclusionCard data={message.data} onAction={onAction} />}
          {message.contentType === 'inspection_deep_dive' && <InspectionDeepDiveCard data={message.data} onAction={onAction} />}
          {message.contentType === 'inspection_closure' && <InspectionClosureCard onAction={onAction} />}
          {message.contentType === 'log_analysis_init' && <LogAnalysisInitCard data={message.data} />}
          {message.contentType === 'log_analysis_retrieval' && <LogAnalysisRetrievalCard data={message.data} />}
          {message.contentType === 'log_analysis_correlation' && <LogAnalysisCorrelationCard data={message.data} />}
          {message.contentType === 'log_analysis_evidence' && <LogAnalysisEvidenceCard data={message.data} />}
          {message.contentType === 'log_analysis_diagnosis' && <LogAnalysisDiagnosisCard data={message.data} />}
          {message.contentType === 'log_analysis_action' && <LogAnalysisActionCard data={message.data} onAction={onAction} />}

          <div className={`flex items-center gap-2 text-[10px] text-slate-500 ${isAI ? 'justify-start' : 'justify-end'}`}>
            <span>{message.timestamp}</span>
            {isAI && <span className="flex items-center gap-1"><Zap size={10} className="text-indigo-500" /> AI 诊断助手</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

const MOCK_HISTORIES: Record<string, Message[]> = {
  home: [],
  diagnostic: [],
  logs: [],
  capacity: [],
  knowledge: [],
  inspection: [],
  report: [
    { id: 'r1', type: 'system', contentType: 'text', content: '📄 运维报告助手已就绪，支持导出 PDF 或发送邮件。', timestamp: '17:00 PM' },
    { id: 'r2', type: 'ai', contentType: 'text', content: '👋 这里有一些快捷报告生成模板，需要我帮你一键拉取今日的 SLO 指标数据并撰写日报吗？', timestamp: '17:01 PM' }
  ]
};

const MOCK_ALARMS: Alarm[] = [
  {
    id: 'A001',
    level: 'P0',
    status: 'active',
    title: 'order-service 错误率飙升',
    service: 'order-svc',
    startTime: '2026-04-09 15:00:23',
    duration: '12m 34s',
    metrics: 'error_rate = 5.3%',
    threshold: '>1%',
    tags: ['k8s', 'prod', 'critical', 'order'],
    isPrimary: true,
    convergedCount: 4,
    convergenceDetails: 'payment-error · inventory-timeout · cart-latency',
    convergenceStrategy: 'root',
    filterStrategy: 'jitter',
    type: '指标'
  },
  {
    id: 'A002',
    level: 'P1',
    status: 'converged',
    title: 'payment P99 延迟告警',
    service: 'payment',
    startTime: '2026-04-09 15:02:15',
    duration: '10m 42s',
    metrics: 'latency = 2.3s',
    threshold: '>500ms',
    tags: ['k8s', 'prod', 'high', 'payment'],
    convergenceDetails: '已收敛至主告警 A001',
    convergenceStrategy: 'topo',
    filterStrategy: 'cascade',
    type: '指标'
  },
  {
    id: 'A003',
    level: 'P2',
    status: 'active',
    title: 'inventory CPU 限流告警',
    service: 'inventory',
    startTime: '2026-04-09 14:58:32',
    duration: '8m 15s',
    metrics: 'cpu_usage = 85%',
    threshold: '>70%',
    tags: ['prod', 'k8s'],
    convergenceDetails: '📋 独立告警',
    convergenceStrategy: 'semantic',
    filterStrategy: 'maintenance',
    type: '指标'
  },
  {
    id: 'A004',
    level: 'P1',
    status: 'active',
    title: '数据库连接池告警(主)',
    service: 'mysql-pri',
    startTime: '2026-04-09 14:50:00',
    duration: '22m',
    metrics: 'conn_pool = 95%',
    threshold: '>80%',
    tags: ['db', 'prod'],
    isPrimary: true,
    convergedCount: 7,
    convergenceDetails: 'order-db-conn(2) · payment-db-conn(3) · inventory-db-conn(2)',
    convergenceStrategy: 'dup',
    filterStrategy: 'dup_filter',
    type: '其他'
  },
  {
    id: 'A005',
    level: 'P0',
    status: 'converged',
    title: '网络抖动引发级联超时',
    service: 'networking',
    startTime: '2026-04-09 14:45:12',
    duration: '27m',
    metrics: 'packet_loss = 0.5%',
    threshold: '>0.1%',
    tags: ['network', 'infrastructure'],
    convergedCount: 124,
    convergenceDetails: '全站 124 个微服务调用超时收敛',
    convergenceStrategy: 'topo',
    filterStrategy: 'cascade',
    type: '指标'
  },
  {
    id: 'A006',
    level: 'P1',
    status: 'converged',
    title: 'auth-svc 线程池爆满',
    service: 'auth-svc',
    startTime: '2026-04-09 14:30:00',
    duration: '42m',
    metrics: 'thread_pool_usage = 98%',
    threshold: '>90%',
    tags: ['auth', 'prod'],
    convergedCount: 15,
    convergenceDetails: '相关权限校验请求超时收敛',
    convergenceStrategy: 'semantic',
    filterStrategy: 'jitter',
    type: '指标'
  },
  {
    id: 'A007',
    level: 'P2',
    status: 'converged',
    title: '日志磁盘空间告警',
    service: 'log-collector',
    startTime: '2026-04-09 14:00:00',
    duration: '1h 12m',
    metrics: 'disk_usage = 92%',
    threshold: '>90%',
    tags: ['infra', 'log'],
    convergedCount: 2,
    convergenceDetails: 'collector-a · collector-b',
    convergenceStrategy: 'dup',
    filterStrategy: 'maintenance',
    type: '指标'
  },
  {
    id: 'A008',
    level: 'P2',
    status: 'recovered',
    title: 'cart 内存使用率告警',
    service: 'cart-svc',
    startTime: '2026-04-09 14:45:10',
    recoveredTime: '2026-04-09 15:00:00',
    metrics: 'mem_usage = 82%',
    threshold: '>80%',
    tags: ['k8s', 'prod'],
    convergenceDetails: '📋 独立告警',
    type: '指标'
  },
  {
    id: 'A009',
    level: 'P3',
    status: 'silenced',
    title: '日志采集器 CPU 告警',
    service: 'fluentd',
    startTime: '2026-04-09 14:40:05',
    metrics: 'cpu_usage = 2.1核',
    threshold: '>1核',
    tags: ['infra'],
    convergenceDetails: '📋 独立告警',
    type: '日志'
  }
];

const TypewriterText: React.FC<{ text: string, speed?: number, onCitationClick?: (index: number) => void }> = ({ text, speed = 20, onCitationClick }) => {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let i = 0;
    setDisplayedLength(0);
    setIsTyping(true);
    const timer = setInterval(() => {
      i++;
      setDisplayedLength(i);
      if (i >= text.length) {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  const renderContent = (visibleText: string) => {
    const parts = visibleText.split(/(\[\d+\])/g);
    return parts.map((part, i) => {
      const match = part.match(/^\[(\d+)\]$/);
      if (match) {
        const index = parseInt(match[1]);
        return (
          <motion.span
            key={i}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={() => onCitationClick?.(index)}
            className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-black bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-slate-100 rounded-sm mx-0.5 cursor-pointer transition-all border border-indigo-500/30 vertical-top align-top -mt-1 group/cite shadow-lg shadow-indigo-500/10"
            title={`查看参考来源 [${index}]`}
          >
            {index}
          </motion.span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="relative">
      <div className="text-base leading-relaxed whitespace-pre-wrap font-medium text-slate-200">
        {renderContent(text.slice(0, displayedLength))}
        {isTyping && <span className="inline-block w-1 h-4 ml-1 bg-indigo-500 animate-pulse align-middle" />}
      </div>
    </div>
  );
};

const CustomPDFViewer = ({ url, title, mockHighlight }: { url: string; title: string; mockHighlight?: boolean }) => {
  const [zoom, setZoom] = useState(1);
  const [page] = useState(1);
  const totalPages = 11; // 模拟页数

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));

  return (
    <div className="rounded-2xl border border-slate-800/50 overflow-hidden bg-[var(--bg-deep)] shadow-2xl h-full w-full flex flex-col relative group">
      {/* 极简自定义工具栏 */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 bg-[var(--bg-panel-alt)]/90 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0 ring-1 ring-white/5">
        <div className="flex items-center gap-3 border-r border-slate-800/50 pr-4">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Page</span>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-white/5 border border-slate-700 rounded-md text-[10px] text-white font-black">{page}</span>
            <span className="text-[9px] text-slate-500 font-bold">/ {totalPages}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 border-r border-slate-800/50 pr-4">
          <button onClick={handleZoomOut} className="p-1.5 hover:bg-slate-800/50 rounded-lg text-slate-400 hover:text-slate-100 transition-all active:scale-90">
            <Minus size={14} />
          </button>
          <div className="w-12 text-center">
             <span className="text-[10px] font-black text-slate-200 font-mono">{Math.round(zoom * 100)}%</span>
          </div>
          <button onClick={handleZoomIn} className="p-1.5 hover:bg-slate-800/50 rounded-xl text-slate-400 hover:text-slate-100 transition-all active:scale-90">
            <Plus size={14} />
          </button>
        </div>

        <div className="flex items-center">
           <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-all flex items-center justify-center shadow-lg shadow-indigo-500/20 active:scale-95"
            title="全屏预览"
          >
            <Maximize size={14} />
          </a>
        </div>
      </div>

      {/* PDF 内容区 - 通过 CSS Scale 模拟缩放 */}
      <div className="flex-1 overflow-auto bg-[var(--bg-deepest)] no-scrollbar overflow-x-hidden">
        <div 
          className="transition-transform duration-300 ease-out origin-top py-10 relative"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* 轻量级高亮 Mock Overlay：利用绝对方位模拟选中 */}
          {mockHighlight && (
            <>
              <div className="absolute top-[28%] left-[22%] w-[45%] h-[2.5%] bg-yellow-500/30 ring-1 ring-yellow-500/50 rounded-sm pointer-events-none mix-blend-multiply flex items-center justify-center animate-pulse z-20">
                 <span className="text-yellow-500/80 text-[10px] font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">Match: CrashLoopBackOff</span>
              </div>
              <div className="absolute top-[32%] left-[15%] w-[68%] h-[2%] bg-yellow-500/30 ring-1 ring-yellow-500/50 rounded-sm pointer-events-none mix-blend-multiply z-20" />
              <div className="absolute top-[34.5%] left-[15%] w-[40%] h-[2%] bg-yellow-500/30 ring-1 ring-yellow-500/50 rounded-sm pointer-events-none mix-blend-multiply z-20" />
            </>
          )}

          <iframe 
            src={`${url}#toolbar=0&navpanes=0&scrollbar=1`} 
            className="w-full h-[1200px] border-none opacity-90 hover:opacity-100 transition-opacity"
            title={title}
          />
        </div>
      </div>
      
      {/* 渐变遮罩增强专注感 */}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[var(--bg-deep)] to-transparent pointer-events-none z-10" />
    </div>
  );
};

const CapacityHeader = () => (
  <div className="h-16 border-b border-slate-800/80 flex items-center justify-between px-6 bg-[var(--bg-card)] shrink-0 z-20">
    <div className="flex-1 max-w-2xl relative group">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
      <input
        type="text"
        placeholder="全局搜索：请输入服务名、主机名或集群名称..."
        className="w-full bg-slate-900/40 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
      />
    </div>
    <div className="flex items-center gap-4 ml-6">
      <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700/60 border border-slate-700/50 rounded-lg text-xs text-slate-300 transition-all">
        <Settings size={14} />
        <span>阈值设置</span>
      </button>
    </div>
  </div>
);
const CapacityFooter = () => (
  <div className="h-10 shrink-0 bg-[var(--bg-deepest)] border-t border-slate-800/80 flex items-center px-6 justify-between text-[11px] text-slate-500 z-30">
    <div className="flex items-center gap-8">
      <span className="font-bold text-slate-400 uppercase tracking-widest">库存全量总览</span>
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5 font-medium"><Server size={12} className="text-blue-500/70" /> 主机: <span className="text-slate-300 font-mono italic">1245 / 1500</span></span>
        <span className="flex items-center gap-1.5 font-medium"><HardDrive size={12} className="text-purple-500/70" /> 存储池: <span className="text-slate-300 font-mono italic">420TB / 500TB</span></span>
        <span className="flex items-center gap-1.5 font-medium"><Database size={12} className="text-emerald-500/70" /> IP池: <span className="text-emerald-500 font-bold font-mono italic">230 Available</span></span>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <span className="flex items-center gap-1.5 italic"><Clock size={12} className="text-slate-600" /> 数据延迟: 45ms (自动刷新)</span>
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-slate-400 font-bold uppercase tracking-tighter">采集核心在线</span>
      </div>
    </div>
  </div>
);

const CapacityResourceScanner: React.FC<{ selectedId?: string, onSelect: (resource: any) => void }> = ({ selectedId, onSelect }) => {
  const scanners = [
    { id: 'hud-1', label: 'CPU Load', value: '67%', trend: '+2.4%', status: 'warning' },
    { id: 'hud-2', label: 'Memory', value: '82%', trend: '+0.8%', status: 'critical' },
    { id: 'hud-3', label: 'Storage', value: '45%', trend: '+5.2%', status: 'normal' },
    { id: 'hud-4', label: 'Risk Nodes', value: '12', trend: '-2', status: 'warning' },
  ];

  const resources = [
    { id: 'r1', name: 'payment-svc', spec: '8C 16G', usage: '92%', tag: 'CPU Overload', conclusions: '建议水平扩容 +2 实例' },
    { id: 'r2', name: 'order-api', spec: '4C 8G', usage: '78%', tag: 'Mem Spike', conclusions: '内存波动较大，建议观察' },
    { id: 'r3', name: 'mysql-primary', spec: '32C 128G', usage: '65%', tag: 'IOPS High', conclusions: '存储IO达到阈值，存在延迟风险' },
    { id: 'r4', name: 'auth-gateway', spec: '2C 4G', usage: '12%', tag: 'Redundant', conclusions: '利用率极低，建议缩容' },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[var(--bg-card)]">
      <div className="p-4 border-b border-slate-800/50 space-y-4">
        <div className="relative group">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400" />
          <input type="text" placeholder="搜索资源、主机、服务..." className="w-full bg-slate-900/40 border border-slate-700/50 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-300 focus:border-indigo-500/50 outline-none" />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {scanners.map(s => (
            <div key={s.id} className="bg-slate-900/40 border border-slate-800/50 p-2 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] text-slate-500 font-bold uppercase">{s.label}</span>
                <span className={`text-[9px] font-mono ${s.status === 'critical' ? 'text-rose-500' : s.status === 'warning' ? 'text-orange-500' : 'text-emerald-500'}`}>{s.trend}</span>
              </div>
              <div className="text-sm font-mono font-bold text-slate-200">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">风险资源列表</h3>
        {resources.map(r => (
          <div 
            key={r.id} 
            onClick={() => onSelect(r)}
            className={`p-3 rounded-xl border transition-all cursor-pointer group ${selectedId === r.id ? 'bg-indigo-500/10 border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : 'bg-slate-900/30 border-slate-800/50 hover:border-slate-700'}`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{r.name}</div>
                <div className="text-[9px] text-slate-500 font-mono mt-0.5">{r.spec}</div>
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded leading-none ${r.usage.startsWith('9') ? 'bg-rose-500/20 text-rose-500' : 'bg-orange-500/20 text-orange-400'}`}>{r.usage}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] font-black px-1 py-0.5 rounded bg-slate-800 text-slate-400 uppercase tracking-tighter">{r.tag}</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed italic">{r.conclusions}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const CapacityAnalysisCenter: React.FC<{ selectedResource: any }> = ({ selectedResource }) => {
  const fullStats = {
    services: [
      { id: 'r1', name: 'payment-svc', status: 'critical', load: '92%' },
      { id: 'r2', name: 'order-api', status: 'warning', load: '78%' },
      { id: 'r3', name: 'auth-gateway', status: 'normal', load: '12%' },
      { id: 'r4', name: 'user-service', status: 'normal', load: '45%' },
    ],
    nodes: [
      { id: 'n1', name: 'Node-01', status: 'normal', cpu: '45%' },
      { id: 'n2', name: 'Node-02', status: 'normal', cpu: '56%' },
      { id: 'n3', name: 'Node-03', status: 'critical', cpu: '87%' },
      { id: 'n4', name: 'Node-04', status: 'warning', cpu: '72%' },
    ],
    infra: [
      { id: 'i1', name: 'mysql-primary', status: 'warning' },
      { id: 'i2', name: 'redis-cluster', status: 'normal' },
      { id: 'i3', name: 'ceph-pool-A', status: 'normal' },
    ]
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[var(--bg-overlay)] p-6 gap-8 overflow-y-auto no-scrollbar">
      {/* Top Status HUD */}
      <div className="flex items-center gap-6 pb-2 border-b border-slate-800/40">
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-bold">环境</span>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/40 rounded-lg cursor-pointer group hover:bg-indigo-500/20 transition-all">
            <span className="text-xs text-slate-200 font-bold">全部环境</span>
            <ChevronDown size={14} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
          </div>
        </div>
        
        <div className="w-px h-6 bg-slate-800/80" />
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Network size={16} className="text-indigo-400" />
            <span className="text-xs font-mono font-bold text-slate-300">23</span>
            <span className="text-[11px] text-slate-500 font-bold">逻辑资源</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span className="text-xs font-mono font-bold text-slate-300">21</span>
            <span className="text-[11px] text-slate-500 font-bold">健康</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-orange-500" />
            <span className="text-xs font-mono font-bold text-slate-300">2</span>
            <span className="text-[11px] text-slate-500 font-bold">告警</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-500" />
            <span className="text-xs font-mono font-bold text-slate-300">0</span>
            <span className="text-[11px] text-slate-500 font-bold">异常</span>
          </div>
        </div>
      </div>

      {/* 1. AI容量结论总览卡 - Only shown when a resource is selected */}
      {selectedResource && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-deep)] border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden group shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -mr-32 -mt-32" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
                   <Brain size={20} />
                 </div>
                 <div>
                   <h3 className="text-lg font-bold text-white tracking-tight">AI 对目标 [{selectedResource.name}] 的诊断结论</h3>
                   <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-rose-500 font-black uppercase tracking-widest italic animate-pulse">High Risk Identified</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Confidence: 94%</span>
                   </div>
                 </div>
               </div>
            </div>
            <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
               <p className="text-sm text-slate-200 leading-relaxed italic">
                 针对 <span className="text-indigo-400 font-bold">{selectedResource.name}</span> 的资源瓶颈点指向 <span className="text-orange-400 font-bold italic">Node-03</span>。
                 由于 POD 分布不均导致单节点 CPU 调度延迟激增，预计在业务高峰期触发 OOM 重启。
               </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* 2. 全量资源拓扑视图 */}
      <div className="flex flex-col gap-6">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <Layers size={16} className="text-indigo-500" /> 全量资源分层拓扑 (Full Cluster Topology)
        </h3>
        
        <div className="flex flex-col items-center gap-8 relative">
          {/* L1: Services */}
          <div className="w-full flex justify-between bg-[var(--bg-deep-alt)] border border-slate-800/80 rounded-3xl p-6 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[40px] -mr-16 -mt-16 pointer-events-none" />
            <div className="absolute -top-3 left-8 px-3 py-0.5 bg-blue-600 text-white text-[9px] font-bold rounded-full shadow-lg shadow-blue-600/30 uppercase tracking-wider">Logic Services Layer</div>
            <div className="flex gap-4 w-full justify-around flex-wrap">
              {fullStats.services.map(s => (
                <div 
                  key={s.id} 
                  className={`w-40 p-3 rounded-2xl border transition-all duration-300 ${selectedResource?.id === s.id ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.2)] scale-105' : 'bg-slate-900/40 border-slate-800/80'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[11px] font-bold text-slate-300 tracking-tight">{s.name}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${s.status === 'critical' ? 'bg-rose-500 animate-pulse' : s.status === 'warning' ? 'bg-orange-500' : 'bg-emerald-500/70'}`} />
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-[9px] text-slate-600 font-black uppercase">Load</span>
                    <span className={`text-[11px] font-mono font-bold ${s.status === 'critical' ? 'text-rose-500' : 'text-slate-400'}`}>{s.load}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Connection L1 -> L2 */}
          <div className="flex gap-16 h-8 opacity-30">
            <ChevronDown size={24} className="text-slate-700" />
            <ChevronDown size={24} className="text-slate-800" />
            <ChevronDown size={24} className="text-slate-700" />
          </div>

          {/* L2: Host / Nodes */}
          <div className="w-full flex justify-between bg-[var(--bg-deep-alt)] border border-slate-800/80 rounded-3xl p-6 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[40px] -mr-16 -mt-16 pointer-events-none" />
            <div className="absolute -top-3 left-8 px-3 py-0.5 bg-orange-600 text-white text-[9px] font-bold rounded-full shadow-lg shadow-orange-600/30 uppercase tracking-wider">Host & OS Layer (Compute Pool)</div>
            <div className="flex gap-4 w-full justify-around flex-wrap">
              {fullStats.nodes.map(n => (
                <div 
                  key={n.id} 
                  className={`w-40 p-3 rounded-2xl border transition-all duration-300 ${selectedResource?.name.includes('Node-03') || (selectedResource?.id === 'r1' && n.id === 'n3') ? 'bg-orange-500/10 border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.2)] scale-105' : 'bg-slate-900/40 border-slate-800/80'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[11px] font-bold text-slate-300 tracking-tight">{n.name}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${n.status === 'critical' ? 'bg-rose-500 animate-pulse' : n.status === 'warning' ? 'bg-orange-500' : 'bg-emerald-500/70'}`} />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px] text-slate-500 uppercase font-black tracking-tighter"><span>CPU Usage</span><span>{n.cpu}</span></div>
                    <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden shadow-inner font-bold"><div className={`h-full ${n.status === 'critical' ? 'bg-rose-600' : 'bg-indigo-500'}`} style={{ width: n.cpu }} /></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Connection L2 -> L3 */}
          <div className="flex gap-16 h-8 opacity-30">
            <ChevronDown size={24} className="text-slate-700" />
            <ChevronDown size={24} className="text-slate-800" />
          </div>

          {/* L3: Storage */}
          <div className="w-full flex justify-between bg-[var(--bg-deep-alt)] border border-slate-800/80 rounded-3xl p-6 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[40px] -mr-16 -mt-16 pointer-events-none" />
            <div className="absolute -top-3 left-8 px-3 py-0.5 bg-emerald-600 text-white text-[9px] font-bold rounded-full shadow-lg shadow-emerald-600/30 uppercase tracking-wider">Infrastructure & Storage Layer</div>
            <div className="flex gap-4 w-full justify-around flex-wrap">
              {fullStats.infra.map(i => (
                <div 
                  key={i.id} 
                  className={`w-52 p-3 rounded-2xl bg-slate-900/40 border border-slate-800/80 transition-all duration-300 ${selectedResource?.name.includes('mysql') || (selectedResource?.id === 'r3' && i.id === 'i1') ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'hover:border-slate-700'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-slate-600 border border-slate-800">
                      {i.name.includes('mysql') ? <Database size={14} /> : i.name.includes('redis') ? <Zap size={14} /> : <HardDrive size={14} />}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-300 tracking-tight">{i.name}</div>
                      <div className={`text-[9px] font-black uppercase tracking-widest ${i.status === 'warning' ? 'text-orange-500' : 'text-emerald-500/70'}`}>{i.status}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

const CapacityAISidebar: React.FC<{ messages: Message[], onAction: (action: string, data?: any) => void, renderInput: () => React.ReactNode, inspectionContext?: any }> = ({ messages, onAction, renderInput, inspectionContext }) => {
  const quickTags = [
    '哪些服务需要扩容？',
    '哪里存在资源浪费？',
    '为什么 node-03 负载偏高？',
    '未来7天容量风险'
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[var(--bg-deepest)] relative">
      <div className="h-12 border-b border-slate-800/60 flex items-center px-4 justify-between bg-[var(--bg-surface-alt)] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] animate-pulse">AI 容量助手</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
        {/* 对话区域 */}
        <div className="flex-1 p-5 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
            {messages.length === 0 ? (
               <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                 <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-6 border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
                   <Layers size={42} className="text-emerald-500" />
                 </div>
                 <h3 className="text-xl font-black text-white mb-3 tracking-tight">AI 容量管家</h3>
                 <p className="text-sm text-slate-500 max-w-[240px] leading-relaxed font-medium">
                   我是您的 AI 容量专家。您可以选择左侧资源启动诊断，或直接向我提问关于集群容量的任何问题。
                 </p>
               </div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <ChatBubble key={msg.id} message={msg} onAction={onAction} inspectionContext={inspectionContext} />
                ))}
              </AnimatePresence>
            )}
          </div>
          
          <div className="pt-4 space-y-4">
             <div className="flex flex-wrap gap-2">
               {quickTags.map(tag => (
                 <button 
                  key={tag}
                  onClick={() => onAction('SEND_PROMPT', tag)}
                  className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 hover:text-slate-100 hover:border-indigo-500/50 transition-all font-bold"
                 >
                   {tag}
                 </button>
               ))}
             </div>
             <div className="bg-[var(--bg-surface-alt)] border border-slate-800/80 rounded-2xl p-3 shadow-xl focus-within:border-indigo-500/40 transition-all">
                {renderInput()}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CapacityAssistantView = ({
  messages,
  chatEndRef,
  onAction,
  renderInput,
  isCollapsed,
  onToggle,
  selectedResource,
  isAnalyzingCapacity,
  inspectionContext
}: any) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[var(--bg-input)] overflow-hidden">
      <div className="flex-1 flex min-h-0">
        {!isCollapsed && (
          <div className="w-[320px] shrink-0 flex flex-col border-r border-slate-800/50">
            <CapacityResourceScanner 
              selectedId={selectedResource?.id} 
              onSelect={(r) => onAction('SELECT_RESOURCE', r)} 
            />
          </div>
        )}
        
        <div className="flex-1 min-w-[500px] flex flex-col bg-[var(--bg-overlay)] relative">
          <CapacityAnalysisCenter selectedResource={selectedResource} />
        </div>

        <div className={`${isCollapsed ? 'flex-1' : 'w-[25%] min-w-[320px]'} flex flex-col border-l border-slate-800/50 transition-all duration-300`}>
          <div className="absolute top-1/2 -left-3 transform -translate-y-1/2 z-10 px-0.5">
             <button
               onClick={onToggle}
               className="w-6 h-12 bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-100 transition-all shadow-xl active:scale-90"
             >
               {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
             </button>
          </div>
          <CapacityAISidebar messages={messages} onAction={onAction} renderInput={renderInput} inspectionContext={inspectionContext} />
        </div>
      </div>
      <CapacityFooter />
    </div>
  );
};

const InspectionTaskContextBanner = ({ task, onClose, isAnalyzing }: { task: any, onClose: () => void, isAnalyzing?: boolean }) => {
  if (!task) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`mb-4 bg-[var(--bg-elevated)]/90 backdrop-blur-xl border rounded-2xl p-4 shadow-2xl relative overflow-hidden group/banner transition-all ${
        isAnalyzing 
        ? 'border-indigo-500/50 state-analyzing animate-shimmer' 
        : 'border-slate-700 hover:border-white/20'
      }`}
    >
      <div className={`absolute top-0 left-0 w-1 h-full ${task.riskLevel === '高' ? 'bg-rose-500/60' : 'bg-blue-500/60'}`} />
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${task.riskLevel === '高' ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30' : 'bg-orange-500/20 text-orange-500 border border-orange-500/30'
            }`}>
            <ClipboardCheck size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded leading-none ${task.riskLevel === '高' ? 'bg-rose-500 text-white' : 'bg-orange-500 text-white'
                }`}>巡检任务: {task.riskLevel}风险</span>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{task.target}</span>
            </div>
            <h3 className="text-sm font-black text-slate-100 truncate group-hover/banner:text-indigo-400 transition-colors uppercase tracking-tight">{task.name}</h3>
            <p className="text-[10px] text-slate-400 mt-1 line-clamp-1 italic font-medium opacity-80">{task.summary}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 ml-4 rounded-xl bg-slate-800/50 text-slate-500 hover:bg-rose-500/20 hover:text-rose-500 transition-all border border-slate-700/50"
        >
          <X size={14} />
        </button>
      </div>
    </motion.div>
  );
};
const LogAnalysisSummaryCard: React.FC<{ summary: any, isAnalyzing: boolean }> = ({ summary, isAnalyzing }) => {
  if (!summary) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--bg-navy-alt)]/80 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-6 mb-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden group"
    >
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[80px] -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500/50 via-indigo-500/20 to-transparent" />

      <div className="flex items-start justify-between gap-6 relative z-10">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.8)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]'}`} />
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">
              {isAnalyzing ? '深度诊断中' : '诊断建议已生成'}
            </span>
          </div>
          
          <h2 className="text-2xl font-black text-white mb-2 tracking-tight truncate">
            {summary.title}
          </h2>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Server size={14} className="text-slate-500" />
              <span>服务: <span className="text-slate-200">{summary.service}</span></span>
            </div>
            <div className="w-px h-3 bg-slate-800" />
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Target size={14} className="text-slate-500" />
              <span>置信度: <span className={summary.confidence > 80 ? 'text-emerald-400' : 'text-orange-400'}>{summary.confidence}%</span></span>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed font-medium bg-black/20 p-3 rounded-xl border border-slate-800/50">
            {summary.summary}
          </p>
        </div>

        {!isAnalyzing && summary.confidence > 0 && (
          <div className="flex flex-col items-center gap-2 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/20">
            <div className="relative">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-800" />
                <motion.circle 
                  cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={175.9}
                  initial={{ strokeDashoffset: 175.9 }}
                  animate={{ strokeDashoffset: 175.9 - (175.9 * summary.confidence) / 100 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="text-emerald-500" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-black text-emerald-400">{summary.confidence}%</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-500/60 uppercase">Conf score</span>
          </div>
        )}
      </div>

      {isAnalyzing && (
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
            <span>引擎处理进度 (Engine Progress)</span>
            <span>85%</span>
          </div>
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
              initial={{ width: "0%" }}
              animate={{ width: "85%" }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
};


const LogContextBanner: React.FC<{ cluster: any, onRemove: () => void }> = ({ cluster, onRemove }) => (
  <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="mb-4"
  >
    <div className="bg-[var(--bg-elevated)]/90 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-4 shadow-2xl relative overflow-hidden group/banner transition-all hover:border-indigo-500/50">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0 shadow-lg">
            <Terminal size={20} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-indigo-500 text-white uppercase tracking-wider">日志聚类联动</span>
              <span className="text-[9px] font-bold text-indigo-400/60 uppercase tracking-widest">{cluster.service}</span>
            </div>
            <h3 className="text-sm font-bold text-slate-200 truncate group-hover/banner:text-white transition-colors">
              {cluster.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-4">
          <div className="flex flex-col items-end mr-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Occurrences</span>
            <span className="text-xs font-mono font-bold text-indigo-400">{cluster.count}</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-2 rounded-xl bg-slate-800/50 text-slate-500 hover:bg-rose-500/20 hover:text-rose-500 transition-all border border-slate-700/50 group/close"
          >
            <X size={14} className="group-hover/close:rotate-90 transition-transform" />
          </button>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
    </div>
  </motion.div>
);


const LogsAssistantView = ({
  messages,
  chatEndRef,
  onAction,
  renderInput,
  isCollapsed,
  onToggle,
  activeLogCluster,
  activeLogAnalysisSummary,
  isAnalyzingLogs,
  showLogContextBanner,
  inspectionContext
}: any) => {
  const [isExecutionModalOpen, setIsExecutionModalOpen] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);

  const clusters = [
    { id: 'c1', title: 'DB Connection Refused', count: 1245, isNew: true, service: 'payment-service' },
    { id: 'c2', title: 'Slow Query Detected', count: 892, isNew: false, service: 'order-service' },
    { id: 'c3', title: 'Timeout Upstream', count: 431, isNew: false, service: 'api-gateway' },
  ];

  const timeline = [
    { time: '10:20', status: '正常', type: 'info' },
    { time: '10:23', status: 'ERROR 激增', type: 'error' },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[var(--bg-navy)] overflow-hidden">
      <div className="flex-1 flex min-h-0">
        {!isCollapsed && (
          <div className="w-1/3 min-w-[360px] border-r border-slate-800/60 bg-[var(--bg-muted-alt)] flex flex-col overflow-y-auto no-scrollbar">
            <div className="p-6 space-y-8">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Activity size={16} className="text-indigo-400" /> 异常概览
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
                    <div className="text-xs text-rose-400 font-bold mb-1 uppercase">Error</div>
                    <div className="text-xl font-mono font-bold text-rose-500">2,415</div>
                  </div>
                  <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-xl">
                    <div className="text-xs text-orange-400 font-bold mb-1 uppercase">Warn</div>
                    <div className="text-xl font-mono font-bold text-orange-500">1,245</div>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl">
                    <div className="text-xs text-blue-400 font-bold mb-1 uppercase">Info</div>
                    <div className="text-xl font-mono font-bold text-blue-500">12.4k</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <ClipboardList size={16} className="text-indigo-400" /> 异常聚类
                </h3>
                <div className="space-y-3">
                  {[
                    { id: 'c1', title: 'DB Connection Refused', count: 1245, service: 'payment-service' },
                    { id: 'c2', title: 'Slow Query Detected', count: 892, service: 'order-service' },
                    { id: 'c3', title: 'Timeout Upstream', count: 431, service: 'api-gateway' },
                  ].map(c => (
                    <motion.div
                      key={c.id}
                      onClick={() => onAction('SELECT_LOG_CLUSTER', c)}
                      className={`p-4 rounded-xl border border-slate-800 cursor-pointer transition-all ${activeLogCluster?.id === c.id ? 'bg-indigo-500/10 border-indigo-500/40' : 'bg-[var(--bg-navy-alt)]'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-slate-200">{c.title}</span>
                          <span className="text-[10px] text-slate-500 font-bold">{c.service}</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-400">{c.count}</span>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                          <Clock size={10} /> 3分钟前
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onAction('START_LOG_ANALYSIS', c); }}
                          className="px-3 py-1.5 bg-indigo-600/80 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 active:scale-95"
                        >
                          <Sparkles size={12} /> AI 分析
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 右侧：AI 分析助手 (2/3) */}
        <div className="flex-1 flex flex-col bg-[var(--bg-navy)] relative min-w-0 border-l border-slate-800/20 shadow-[-20px_0_30px_-15px_rgba(0,0,0,0.5)]">
          <div className="h-12 border-b border-slate-800/60 flex items-center px-6 justify-between bg-[var(--bg-muted-alt)]/80 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-2">
              <button
                onClick={onToggle}
                className="p-1 px-2 hover:bg-slate-800/50 rounded-md transition-all flex items-center gap-1.5 text-slate-500 hover:text-indigo-400 group"
              >
                {isCollapsed ? <PanelLeftClose size={14} className="text-indigo-500" /> : <PanelLeft size={14} />}
                <span className="text-[10px] font-bold uppercase tracking-tight">{isCollapsed ? '展开面板' : '收起面板'}</span>
              </button>
              <div className="w-px h-3 bg-slate-800 mx-2" />
              <div className="text-[10px] font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <Brain size={14} className="text-indigo-400" /> AI 日志分析引擎
              </div>
            </div>
            <button
              onClick={() => onAction('CLEAR_LOGS_HISTORY')}
              title="清除分析记录"
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-rose-400 transition-all active:scale-90"
            >
              <History size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 no-scrollbar relative max-w-[900px] mx-auto w-full">
            {messages.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-24 h-24 rounded-[32px] bg-indigo-500/10 flex items-center justify-center mb-10 border border-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.15)]"
                >
                  <Terminal size={48} className="text-indigo-400" />
                </motion.div>
                <motion.h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-slate-100 to-slate-500 mb-4 tracking-tight">AI 日志助手</motion.h2>
                <motion.p className="text-slate-400 text-base max-w-[420px] leading-relaxed font-medium mb-10">
                  智能日志聚类与根因分析系统，自动识别异常模式，关联 Trace，输出故障定位与操作建议。
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-12 flex items-center gap-3 text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]"
                >
                  <div className="h-px w-8 bg-slate-800" />
                  智能日志分析语义库已就绪
                </motion.div>
              </div>
            ) : (
              <div className="space-y-6 pb-20">
                <AnimatePresence initial={false}>
                  {messages.map((msg: any) => (
                    <ChatBubble
                      key={msg.id}
                      message={msg}
                      onAction={onAction}
                      inspectionContext={inspectionContext}
                    />
                  ))}
                </AnimatePresence>
                <div ref={chatEndRef} className="h-20" />
              </div>
            )}
          </div>

          <div className="p-6 bg-gradient-to-t from-[var(--bg-card)] via-[var(--bg-card)]/95 to-transparent shrink-0">
            <div className="max-w-4xl mx-auto">
              <AnimatePresence>
                {showLogContextBanner && activeLogCluster && (
                  <LogContextBanner 
                    cluster={activeLogCluster} 
                    onRemove={() => onAction('REMOVE_LOG_CONTEXT')}
                  />
                )}
              </AnimatePresence>
              {renderInput()}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Meta */}
      <div className="h-10 shrink-0 bg-[var(--bg-deepest)] border-t border-slate-800/60 flex items-center px-6 justify-between text-[11px] text-slate-500 z-30">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="font-bold text-slate-400">引擎状态: 处理就绪</span>
          </div>
          <span className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors cursor-pointer"><Database size={14} /> 集群: k8s-prod-china-01</span>
          <span className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors cursor-pointer"><Share2 size={14} /> 数据流: 1.2 GB/min</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-600">v4.2.0-stable</span>
        </div>
      </div>

      {/* 交互反馈: 执行确认弹窗 (Execution Modal) */}
      <AnimatePresence>
        {isExecutionModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExecutionModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-[var(--bg-navy-alt)] border border-slate-700 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-6">
                  <AlertTriangle size={32} />
                </div>
                <h2 className="text-xl font-bold text-white mb-3">确认执行重启连接池？</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-8 font-medium">
                  该操作由 AI 日志助手发起，将触发底层数据库连接池的主动回收与重建。在此期间，<span className="text-rose-400 font-bold">约 200ms 的请求响应波动</span>。建议在非核心流量窗口执行。
                </p>
                {!executionResult ? (
                  <div className="flex gap-3 mt-8">
                    <button
                      onClick={() => {
                        setExecutionResult({ success: true, file: 'pool_restart_dump.txt' });
                      }}
                      className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold h-12 rounded-xl transition-all shadow-lg shadow-rose-500/20 active:scale-95"
                    >
                      提交并执行
                    </button>
                    <button
                      onClick={() => setIsExecutionModalOpen(false)}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold h-12 rounded-xl transition-all"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                        <Check size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-emerald-400 tracking-tight">执行成功</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Transaction ID: TX-902148</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-800/40 border border-slate-800 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <FileText size={20} className="text-indigo-400" />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-200">{executionResult.file}</span>
                          <span className="text-[10px] text-slate-500 uppercase">342 KB • Log Dump</span>
                        </div>
                      </div>
                      <button className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"><Download size={18} /></button>
                    </div>
                    <button
                      onClick={() => {
                        setIsExecutionModalOpen(false);
                        setExecutionResult(null);
                      }}
                      className="w-full h-12 bg-slate-100 hover:bg-white text-slate-900 font-bold rounded-xl transition-all active:scale-98"
                    >
                      完成并返回
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 辅助组件: 步骤卡片
const AnalysisStepCard = ({ step, title, isExpanded, onToggle, isComplete, children }: any) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ step: 0.1 }}
    className={`bg-[var(--bg-navy-alt)]/80 backdrop-blur-md rounded-2xl border transition-all ${isExpanded ? 'border-slate-700 shadow-xl' : 'border-slate-800/50'
      }`}
  >
    <div
      onClick={onToggle}
      className="p-4 flex items-center justify-between cursor-pointer group/header"
    >
      <div className="flex items-center gap-3">
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${isComplete ? 'bg-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-800 text-slate-500'
          }`}>
          {isComplete ? <Check size={14} /> : step}
        </div>
        <span className={`text-xs font-bold transition-colors ${isExpanded ? 'text-white' : 'text-slate-400 group-hover/header:text-slate-200'
          }`}>{title}</span>
      </div>
      <div className="flex items-center gap-3">
        {isComplete && <span className="text-[10px] text-indigo-400 font-black tracking-widest uppercase">已校验</span>}
        <div className={`text-slate-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
          <ChevronRight size={14} />
        </div>
      </div>
    </div>
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="px-5 pb-5 pt-1 border-t border-slate-800/30">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);


const InspectionOverview = ({ onAction }: { onAction?: any }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-4 gap-4">
      {[
        { label: '总任务数', val: '24', change: '↑2 较昨日', color: 'text-blue-400', icon: <ClipboardList size={20} /> },
        { label: '今日成功率', val: '95.8%', change: '↓1.2%', color: 'text-emerald-400', icon: <CheckCircle2 size={20} /> },
        { label: '异常任务', val: '3', change: '⚠️ 需优先处理', color: 'text-rose-400', icon: <AlertCircle size={20} /> },
        { label: '覆盖实例数', val: '156', change: '🟢 正常', color: 'text-purple-400', icon: <Server size={20} /> }
      ].map((card, idx) => (
        <div key={idx} onClick={(e) => e.stopPropagation()} className="bg-[var(--bg-card)] border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all group">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{card.label}</span>
            <span className={card.color}>{card.icon}</span>
          </div>
          <div className="text-2xl font-bold text-slate-200 mb-1">{card.val}</div>
          <div className={`text-[10px] font-bold ${card.change.includes('↑') ? 'text-emerald-500' : card.change.includes('↓') ? 'text-rose-500' : 'text-slate-500'}`}>{card.change}</div>
        </div>
      ))}
    </div>


  </div>
);

const InspectionDetailPanel = ({ task, onBack, onAction, analysisStatus }: any) => {
  if (!task) return null;
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-slate-100 transition-all">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-100 uppercase tracking-tight">{task.name}</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Task Detail & Evidence View</p>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onAction('START_INSPECTION_ANALYSIS', { task }); }}
          disabled={analysisStatus === 'analyzing'}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-black hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50"
        >
          {analysisStatus === 'analyzing' ? <RefreshCw size={14} className="animate-spin" /> : <Bot size={14} />}
          {analysisStatus === 'analyzing' ? 'AI 分析中...' : '开始 AI 深度分析'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-6">
          <div className="bg-[var(--bg-card)] border border-slate-800 rounded-xl p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Info size={14} className="text-blue-500" /> 基础信息</h3>
            <div className="space-y-4">
              {[
                { label: '巡检对象', value: task.target },
                { label: '当前状态', value: task.status, color: task.status === '正常' ? 'text-emerald-500' : 'text-rose-500' },
                { label: '风险等级', value: task.riskLevel, color: task.riskLevel === '高' ? 'text-rose-500' : task.riskLevel === '中' ? 'text-orange-500' : 'text-blue-500' },
                { label: '更新时间', value: task.updatedAt, font: 'font-mono' }
              ].map((item, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">{item.label}</span>
                  <span className={`text-xs font-black ${item.color || 'text-slate-200'} ${item.font || ''}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-2 space-y-6">
          <div className="bg-[var(--bg-card)] border border-slate-800 rounded-xl p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Activity size={14} className="text-orange-500" /> 核心指标预览 (Anomaly Metrics)</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'CPU Usage', value: '85%', trend: 'up', color: 'text-rose-500' },
                { label: 'Memory', value: '4.2GB', trend: 'stable', color: 'text-slate-300' },
                { label: 'GC Pause', value: '1.2s', trend: 'up', color: 'text-orange-500' },
                { label: 'Error Rate', value: '0.05%', trend: 'down', color: 'text-emerald-500' }
              ].map((metric, i) => (
                <div key={i} className="p-3 bg-black/20 border border-slate-800/50 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">{metric.label}</span>
                    <TrendingUp size={10} className={metric.color} />
                  </div>
                  <div className={`text-lg font-black ${metric.color}`}>{metric.value}</div>
                </div>
              ))}
            </div>
            <div className="h-32 mt-6 bg-slate-900/50 rounded-lg border border-slate-800/30 overflow-hidden relative">
              <svg className="w-full h-full opacity-30" viewBox="0 0 400 100" preserveAspectRatio="none">
                <path d="M0,80 L40,70 L80,90 L120,40 L160,50 L200,20 L240,60 L280,30 L320,40 L360,10 L400,15" fill="none" stroke="#3b82f6" strokeWidth="2" />
              </svg>
              <div className="absolute inset-x-0 bottom-2 flex justify-between px-4 text-[8px] text-slate-600 font-mono">
                <span>14:00</span><span>14:15</span><span>14:30</span><span>14:45</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[var(--bg-card)] border border-slate-800 rounded-xl p-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><FileText size={14} className="text-blue-400" /> 日志摘要 (Logs)</h3>
          <div className="space-y-2 font-mono text-[10px]">
            <div className="p-2 rounded bg-rose-500/5 border border-rose-500/10 text-rose-400">14:05:12 [ERROR] payment-gw - Connection timeout to upstream bank-api (10.0.4.12)</div>
            <div className="p-2 rounded bg-slate-800/20 border border-slate-700/30 text-slate-500">14:05:10 [INFO] payment-gw - Retrying payment request #PO-9923</div>
            <div className="p-2 rounded bg-rose-500/5 border border-rose-500/10 text-rose-400">14:05:08 [ERROR] payment-gw - SocketException: Broken pipe</div>
          </div>
        </div>
        <div className="bg-[var(--bg-card)] border border-slate-800 rounded-xl p-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><History size={14} className="text-purple-400" /> 变更记录 (Recent Changes)</h3>
          <div className="space-y-3">
            {[
              { time: '13:50', title: 'Pod 镜像更新', desc: 'payment-gw: v1.4.2 -> v1.4.3', user: 'Admin' },
              { time: '10:20', title: '配置热更新', desc: '调整 dubbo 线程池核心数: 20 -> 50', user: 'System' }
            ].map((c, i) => (
              <div key={i} className="flex gap-3 relative pl-4 border-l border-slate-800">
                <div className="absolute left-[-4.5px] top-1 w-2 h-2 rounded-full bg-slate-700 border border-slate-600" />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-[10px] text-slate-300 font-bold">{c.title}</span>
                    <span className="text-[9px] text-slate-600 font-mono">{c.time}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


// --- 注入巡检任务按钮动态特效组件 ---
const InspectionTaskList: React.FC<{ tasks: any[], onAction?: any, setShowBanner?: any, setSelectedTask?: any, analysisStatus?: any, selectedTask?: any }> = ({ tasks, onAction, setShowBanner, setSelectedTask, analysisStatus, selectedTask }) => (
  <div className="space-y-4">
    <style>{`
      @keyframes analytic-shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 5px rgba(99, 102, 241, 0.2); }
        50% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.6); }
      }
      .animate-shimmer {
        position: relative;
        overflow: hidden;
      }
      .animate-shimmer::after {
        content: "";
        position: absolute;
        top: 0; left: 0; width: 30%; height: 100%;
        background: linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent);
        transform: skewX(-20deg);
        animation: analytic-shimmer 2s infinite linear;
      }
      .state-analyzing {
        animation: pulse-glow 2s infinite ease-in-out;
        background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%) !important;
      }
    `}</style>
    {/* ... 筛选区域保持不变 ... */}
    <div className="flex flex-col gap-4 mb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Filter icon and label removed */}
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-600 font-bold">按风险:</span>
              <div className="flex gap-1.5">
                {['全部', '健康', '异常'].map((tag, i) => (
                  <button key={i} className={`px-2.5 py-0.5 rounded text-[9px] font-bold border transition-all ${i === 2 ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-slate-800/40 border-slate-700/50 text-slate-500 hover:text-slate-300'}`}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-px h-3 bg-slate-800" />

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-600 font-bold">按状态:</span>
              <div className="flex gap-1.5">
                {['全部', '巡检中', '已结束'].map((tag, i) => (
                  <button key={i} className={`px-2.5 py-0.5 rounded text-[9px] font-bold border transition-all ${i === 0 ? 'bg-blue-500/20 border-blue-500/40 text-blue-400 px-3' : 'bg-slate-800/40 border-slate-700/50 text-slate-500 hover:text-slate-300'}`}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" placeholder="搜索任务名称/摘要..." className="bg-slate-900/30 border border-slate-800 rounded-md pl-8 pr-3 py-1.5 text-[10px] text-slate-300 focus:outline-none focus:border-blue-500/50 w-64 transition-all" />
          </div>
        </div>
      </div>
    </div>

    <div className="space-y-4">
      {tasks.map((task, idx) => (
        <div
          key={idx}
          onClick={(e) => { e.stopPropagation(); setSelectedTask(task); setShowBanner(true); }}
          className={`bg-[var(--bg-card)] border rounded-xl p-4 transition-all group cursor-pointer relative ${
            selectedTask?.name === task.name 
            ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)] bg-blue-600/[0.04]' 
            : 'border-slate-800 hover:border-blue-500/50 hover:bg-blue-600/[0.02]'
          }`}
        >
          <div className="mb-3">
            <div className="flex items-center gap-3 mb-1">
              <div className={`w-1.5 h-1.5 rounded-full ${task.status === '健康' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`} />
              <h4 className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors uppercase tracking-tight font-mono">{task.name}</h4>
              <div className="flex items-center gap-1.5 ml-auto">
                <span className={`px-1.5 py-0.5 rounded-[4px] text-[9px] font-black border ${
                  task.inspectionStatus === '巡检中' 
                  ? 'bg-orange-500/10 border-orange-500/30 text-orange-500' 
                  : 'bg-slate-800/50 border-slate-700/50 text-slate-500'
                }`}>
                  {task.inspectionStatus === '巡检中' && <RefreshCw size={8} className="inline mr-1 animate-spin" />}
                  {task.inspectionStatus}
                </span>
                {task.status !== '健康' && (
                  <span className="px-1.5 py-0.5 rounded-[4px] text-[9px] font-black uppercase text-white bg-rose-600">
                    异常
                  </span>
                )}
              </div>
            </div>
            
            <p className="text-[11px] text-slate-500 leading-relaxed font-bold italic ml-4.5 border-l border-slate-800 pl-3">
              {task.summary}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-y-2 gap-x-8 mb-4 py-2 border-y border-slate-800/50 pointer-events-none">
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

          <div className="flex justify-end items-center gap-2">
            {(() => {
              const currentStatus = analysisStatus?.[task.name];
              const isAnalyzing = currentStatus === 'analyzing';
              const isCompleted = currentStatus === 'completed' || currentStatus === 'done';
              const isFailed = currentStatus === 'failed';
              const hasReport = task.hasReport || isCompleted;

              // --- 状态 3, 4, 5：已有历史报告 ---
              if (hasReport) {
                return (
                  <>
                    {/* 状态 5 补充提示 */}
                    {isFailed && (
                      <span className="text-[10px] text-rose-500 font-bold mr-2 animate-pulse flex items-center gap-1">
                        <AlertCircle size={10} /> 本次分析失败，请重试
                      </span>
                    )}

                    {/* 主按钮：查看报告 */}
                    <button
                      onClick={(e) => { e.stopPropagation(); onAction?.('VIEW_REPORT', { format: '0412_phased', ...task }); }}
                      className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black transition-all shadow-lg shadow-emerald-500/20 active:scale-95 border border-emerald-500/20 order-2"
                    >
                      <FileText size={14} /> 查看报告
                    </button>

                    {/* 次按钮：开始分析 / 分析中... */}
                    {isAnalyzing ? (
                      <button
                        disabled
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/40 text-slate-500 border border-slate-700/30 cursor-wait order-1"
                      >
                        <RefreshCw size={11} className="animate-spin text-slate-600" />
                        <span className="text-[10px] font-bold tracking-tight">分析中…</span>
                      </button>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); onAction?.('START_INSPECTION_ANALYSIS', { task }); }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/5 hover:bg-blue-500/10 text-blue-400/80 hover:text-blue-300 transition-all border border-blue-500/30 hover:border-blue-500/50 group/retry order-1"
                        title="重新发起 AI 深度分析"
                      >
                        <RefreshCw size={11} className="group-hover/retry:rotate-180 transition-transform duration-500" />
                        <span className="text-[10px] font-bold tracking-tight">开始分析</span>
                      </button>
                    )}
                  </>
                );
              }

              // --- 状态 1, 2：从未生成过报告 ---
              return (
                <button
                  onClick={(e) => { e.stopPropagation(); onAction?.('START_INSPECTION_ANALYSIS', { task }); }}
                  disabled={isAnalyzing}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg text-[11px] font-black transition-all active:scale-95 group-hover:scale-105 disabled:opacity-100 shadow-lg ${
                    isAnalyzing 
                    ? 'state-analyzing animate-shimmer text-indigo-100 cursor-wait' 
                    : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/20'
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span className="tracking-widest">分析中…</span>
                    </>
                  ) : (
                    <>
                      <Bot size={12} />
                      <span>开始分析</span>
                    </>
                  )}
                </button>
              );
            })()}
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
        <button className="px-3 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700/50 hover:bg-slate-700 hover:text-slate-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed font-bold" disabled>PREV</button>
        <button className="px-3.5 py-1.5 bg-blue-600 rounded-lg text-white font-black shadow-lg shadow-blue-500/20">1</button>
        <button className="px-3.5 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700/50 hover:bg-slate-700 hover:text-slate-100 transition-all font-bold">2</button>
        <button className="px-3 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700/50 hover:bg-slate-700 hover:text-slate-100 transition-all font-bold">NEXT</button>
      </div>
    </div>
  </div>
);

const InspectionDetailReport = ({ analysisStatus, onAction }: any) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="text-xs font-bold text-slate-400 uppercase">当前任务:</div>
        <div className="px-3 py-1.5 bg-[var(--bg-hover)] border border-slate-700 rounded-lg flex items-center gap-4 cursor-pointer hover:border-blue-500 transition-all">
          <span className="text-xs text-slate-200">CPU巡检-生产环境</span>
          <ChevronDown size={14} className="text-slate-500" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-1">报告版本:</span>
        <div className="group/version relative">
          <div className="px-3 py-1.5 bg-slate-800/80 border border-slate-700 hover:border-blue-500/50 rounded-lg flex items-center gap-3 text-[11px] text-slate-300 font-bold cursor-pointer transition-all hover:bg-slate-700/50">
            <Calendar size={14} className="text-blue-400" />
            <span>2026-04-12 (最新)</span>
            <ChevronDown size={14} className="text-slate-500 group-hover/version:text-blue-400 transition-colors" />
          </div>
          
          {/* 预留的历史版本浮窗 */}
          <div className="absolute top-full left-0 mt-2 w-48 bg-[var(--bg-elevated)] border border-slate-700 rounded-xl shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover/version:opacity-100 group-hover/version:translate-y-0 group-hover/version:pointer-events-auto transition-all z-50 p-2">
            {['2024-04-12', '2024-04-11', '2024-04-10'].map((date, i) => (
              <div key={date} className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${i === 0 ? 'bg-blue-500/10 text-blue-400' : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'}`}>
                <span className="text-[10px] font-mono font-bold">{date}</span>
                {i === 0 && <CheckCircle2 size={10} />}
              </div>
            ))}
            <div className="mt-2 pt-2 border-t border-slate-800 text-center">
               <span className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">查看更多历史归档</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-[var(--bg-card)] border border-slate-800 rounded-xl overflow-hidden">
      <table className="w-full text-left text-[11px]">
        <thead className="bg-slate-900/20 border-b border-slate-800">
          <tr>
            {['主机IP', 'CPU%', '内存%', '磁盘%', '负载', '状态'].map(h => (
              <th key={h} className="px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {[
            { ip: '10.0.1.23', cpu: '12%', mem: '45%', disk: '32%', load: '0.8', status: '🟢 正常' },
            { ip: '10.0.1.24', cpu: '23%', mem: '51%', disk: '28%', load: '1.2', status: '🟢 正常' },
            { ip: '10.0.1.25', cpu: '87%', mem: '62%', disk: '45%', load: '3.5', status: '🟡 关注' },
            { ip: '10.0.1.26', cpu: '45%', mem: '38%', disk: '67%', load: '1.8', status: '🟢 正常' },
            { ip: '10.0.1.27', cpu: '92%', mem: '71%', disk: '52%', load: '4.2', status: '🔴 告警' },
            { ip: '10.0.1.28', cpu: '31%', mem: '44%', disk: '39%', load: '1.1', status: '🟢 正常' }
          ].map((row, i) => (
            <tr key={i} className="hover:bg-slate-900/10 transition-colors">
              <td className="px-4 py-3 font-mono text-slate-300">{row.ip}</td>
              <td className="px-4 py-3 text-slate-300">{row.cpu}</td>
              <td className="px-4 py-3 text-slate-300">{row.mem}</td>
              <td className="px-4 py-3 text-slate-300">{row.disk}</td>
              <td className="px-4 py-3 text-slate-300">{row.load}</td>
              <td className="px-4 py-3">{row.status}</td>
            </tr>
          ))}
          <tr className="bg-slate-900/20 font-bold">
            <td className="px-4 py-3 text-slate-400">汇总/平均</td>
            <td className="px-4 py-3 text-slate-200">48%</td>
            <td className="px-4 py-3 text-slate-200">52%</td>
            <td className="px-4 py-3 text-slate-200">44%</td>
            <td className="px-4 py-3 text-slate-200">2.1</td>
            <td className="px-4 py-3 text-rose-500 italic">2台异常</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div className="grid grid-cols-2 gap-6">
      <div className="bg-[var(--bg-card)] border border-slate-800 rounded-xl p-5">
        <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2 mb-6"><TrendingUp size={14} className="text-blue-500" /> 📊 趋势对比: 10.0.1.27 CPU使用率</h3>
        <div className="h-40 relative flex items-end justify-between px-2">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,80 Q25,70 50,20 T100,10" fill="none" stroke="#3b82f6" strokeWidth="2" />
            <path d="M0,90 Q25,85 50,60 T100,55" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
          </svg>
          <div className="absolute top-0 right-0 text-[10px] space-y-1">
            <div className="flex items-center gap-2"><div className="w-2 h-0.5 bg-blue-500"></div><span className="text-slate-300">今日</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-0.5 bg-slate-600 border-dashed border-t"></div><span className="text-slate-500">昨日 (对比上涨 15%)</span></div>
          </div>
        </div>
        <div className="flex justify-between mt-4 text-[9px] text-slate-600 font-mono">
          <span>00:00</span><span>08:00</span><span>16:00</span><span>23:59</span>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-slate-800 rounded-xl p-5 flex flex-col">
        <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2 mb-4"><Zap size={14} className="text-purple-500" /> 操作建议 (AI 生成)</h3>
        <div className="flex-1 space-y-3">
          <div className="text-[11px] text-slate-400 leading-relaxed">• 10.0.1.25 CPU 持续走高，建议检查 Java 进程堆栈状况</div>
          <div className="text-[11px] text-slate-400 leading-relaxed">• 10.0.1.27 负载过高，疑似流量突增，建议开启弹性扩容</div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold hover:bg-slate-700 transition-all"><Download size={12} /> 导出报告</button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 text-white text-[10px] font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"><Bot size={12} /> 深度分析</button>
        </div>
      </div>
    </div>
  </div>
);

const INITIAL_INSPECTION_TASKS = [
  {
    name: '核心支付链路稳定性巡检',
    target: '集群 (K8s-Prod-Main)',
    status: '异常',
    inspectionStatus: '巡检中',
    riskLevel: '高',
    rules: ['5xx 错误率', '延迟 P99', '三方依赖状态'],
    summary: '检测到支付网关 (payment-gw) 近 5 分钟 5xx 错误率突增至 15%，疑似三方依赖超时。',
    updatedAt: '2024-04-12 14:05:12',
    availableDates: ['2024-04-12', '2024-04-11', '2024-04-10'],
    hasReport: false
  },
  {
    name: '数据库慢查询扫描',
    target: '实例 (MySQL-Order-Primary)',
    status: '异常',
    inspectionStatus: '已结束',
    riskLevel: '中',
    rules: ['查询时长 > 3s', '全表扫描检测', '索引命中率'],
    summary: '存在 12 条执行超过 3s 的慢 SQL，主要集中在 order_info 表的全表扫描。',
    updatedAt: '2024-04-12 13:50:45',
    availableDates: ['2024-04-12', '2024-04-11', '2024-04-09'],
    hasReport: true
  },
  {
    name: '全站 SSL 证书有效性监控',
    target: '主机 (Slb-External-Node)',
    status: '异常',
    inspectionStatus: '已结束',
    riskLevel: '低',
    rules: ['剩余天数 < 30', '证书链完整性', '算法强度'],
    summary: '有 2 个域名的证书即将于 15 天后过期，请及时更新。',
    updatedAt: '2024-04-12 10:20:00',
    availableDates: ['2024-04-12', '2024-04-10', '2024-04-08'],
    hasReport: true
  },
  {
    name: '基础架构存储空间巡检',
    target: '集群 (Ceph-Storage-01)',
    status: '健康',
    inspectionStatus: '已结束',
    riskLevel: '低',
    rules: ['分区使用率 > 80%', 'IOPS 饱和度', '持久化延迟'],
    summary: '存储系统各分区使用率均在 60% 以下，IOPS 及延时指标正常。',
    updatedAt: '2024-04-12 09:15:33',
    availableDates: ['2024-04-12', '2024-04-11', '2024-04-07']
  },
  {
    name: '消息队列集群堆积巡检',
    target: '集群 (Kafka-Prod-Main)',
    status: '异常',
    inspectionStatus: '已结束',
    riskLevel: '中',
    rules: ['落后 Offset > 100w', '分区均衡度', 'ISR 副本状态'],
    summary: '检测到 billing-topic 存在消费延迟，Offset 堆积量达 250w，疑似下游消费能力不足。',
    updatedAt: '2024-04-12 15:30:12'
  },
  {
    name: '入口网关 Nginx 并发连接核查',
    target: '主机 (Nginx-LB-01)',
    status: '异常',
    inspectionStatus: '已结束',
    riskLevel: '低',
    rules: ['Active Connections', 'Waiting Connections', 'Error Rate'],
    summary: '当前活动连接数接近系统限额 (80%)，建议检查连接复用配置。',
    updatedAt: '2024-04-12 16:45:00'
  }
];

const MOCK_LOG_EVENTS = [
  { id: 'l1', service: 'payment-svc', type: 'Error', content: 'Connection refused', count: 47, time: '14:05:12' },
  { id: 'l2', service: 'inventory-svc', type: 'Critical', content: 'OOM 内存溢出', count: 3, time: '13:50:45' },
  { id: 'l3', service: 'order-db', type: 'Warning', content: 'Slow SQL (> 3s)', count: 12, time: '10:20:00' },
  { id: 'l4', service: 'auth-gateway', type: 'Error', content: '504 Gateway Timeout', count: 15, time: '15:30:12' },
  { id: 'l5', service: 'cache-node-01', type: 'Warning', content: 'Redis Read Timeout', count: 8, time: '16:45:00' }
];

const MOCK_KNOWLEDGE_LIBS = [
  {
    id: 'sop',
    name: '标准 SOP',
    icon: ClipboardList,
    type: 'txt',
    count: 24,
    updatedAt: '2024-03-24 14:20',
    category: 'SOP',
    documents: [
      {
        id: 's1', title: 'Payment-svc 内存溢出处理预案', author: '张三', date: '2024-03-24', hot: true,
        pdfUrl: '/assets/docs/sop_detail.pdf',
        content: "### 1. 现象描述\nPayment-svc 在业务高峰期偶发 OOM (OutOfMemoryError)，导致实例崩溃并自动重启，期间相关支付请求全部失败。\n\n### 2. 应急响应步骤\n- **第一步：流量隔离与熔断**\n  在入口网关（如 Kong/Nginx）或者 SLB 层面，将报错实例权重调为 0，防止新的请求被分配至异常节点。\n- **第二步：现场线索提取**\n  不要立刻删除 Pod。通过预置的 Sidecar 或手动进入容器，使用 JDK 工具提取内存快照：`jmap -dump:format=b,file=/tmp/heap_$(date +%s).hprof <pid>`\n- **第三步：安全重启**\n  确认核心业务流量已转移后，执行滚动重启：`kubectl rollout restart deploy payment-svc -n prod`\n\n### 3. 后续排查指南\n将导出的 hprof 文件传至 OSS，并使用 MAT (Memory Analyzer Tool) 分析大对象（如巨大无界的 List 或被阻塞的 ThreadLocal）。\n\n### 4. 预防与治理\n- 在部署配置中对 JVM 内存设置硬性限制`-XX:MaxRAMPercentage=75.0`。\n- 添加 Prometheus 告警规则，当 Old Gen 使用率连续 3 分钟超过 85% 时触发 P2 告警。"
      },
      {
        id: 's2', title: 'Redis 热 Key 治理方案', author: '李四', date: '2024-03-22', hot: false,
        pdfUrl: '/assets/docs/sop_detail.pdf',
        content: "### 背景\n大促期间，特定商品 and 配置数据频繁触发单 Redis 分片的高 CPU 占用甚至引发阻塞故障。\n\n### 破局思路：多级缓存与打散\n\n#### 方案 1：应用端二级缓存 (L1)\n引入 Caffeine 作为进程内缓存：\n- **适用场景**：数据量小、变动极度不频繁的黑白名单或字典配置。\n- **TTL 设置**：通常 3-5 秒，接受极端情况下的短暂非一致性。\n\n#### 方案 2：分桶打散 (L2)\n对于秒杀类业务（如库存扣减）：\n- 将原来的全局单 Key (`sku_stock_1024`)，拆分为多个子 Key (`sku_stock_1024_01`, `sku_stock_1024_02`...)\n- 业务方在查询或写入时，针对随机后缀进行操作，并在后端汇总计算。\n\n#### 方案 3：热 Key 自动探测系统\n部署 Sidecar 代理（如基于 eBPF 或定制中间件），实时汇总统计热点 Key，一旦 QPS 超限，自动在代理层降级或者直接返回缓存数据。"
      },
      {
        id: 's3', title: 'Kubernetes 集群扩容流水线 SOP', author: '王五', date: '2024-03-20', hot: false,
        pdfUrl: '/assets/docs/sop_detail.pdf',
        content: "### 集群自动横向扩容(CA)操作规范\n\n1. **前置检查**\n   - 确认当前可用区(AZ)配额是否充足。\n   - 检查集群证书是否要在接下来 30 天内过期。\n\n2. **触发扩容**\n   - 登陆 SRE 控制台，选择对应集群。\n   - 在“容量规划”面板，申请目标节点规格（如 `ecs.g7.8xlarge`），并指定扩容台数。\n   - 提交工单由 Tech Lead 审批。\n\n3. **验证与交付**\n   - 等待云提供商回调，确认节点加入 Kubernetes 集群且状态为 `Ready`。\n   - 给新节点打上相应的业务隔离污点 (Toleration & Taints)。\n   - 执行网络连通性拨测，确认 CNI 插件在新生节点上正常工作。\n\n> ⚠️ 注意：不要在业务最高峰的整点时刻发起并发数极高的大规模扩容（>100台），以免拉爆云厂商管控面 API 并导致整个扩容流程挂起。"
      },
      {
        id: 's4', title: '数据库 CPU 100% 应急处理', author: '刘SRE', date: '2024-03-15', hot: true,
        pdfUrl: '/assets/docs/sop_detail.pdf',
        content: "### 现象\n监控报警显示 MySQL 主库 CPU 飙升至 100%，慢查询日志突增，接口大面积响应超时。\n\n### 应急干预\n1. 立刻通过数据库后台（如 DMS）查看活跃会话(`SHOW PROCESSLIST`)。\n2. 若发现大量相同的慢 SQL 阻塞了执行通道，立即执行 `KILL <ID>` 清理。\n3. 联系研发确认该 SQL 归属。如果没有紧急业务需求，可通过中间件层下发 SQL 阻断规则。\n4. 若业务流量确实 because of normal operation and promotional events突增，立即触发“计算包临时升级（弹性升配）”功能，扩充至更高 CPU 规格。\n\n### 规避方案\n- 所有线上查询表必须具有合规索引。\n- 禁止在前台系统执行大屏复杂的连表报表查询，应引流至 ClickHouse 等分析型数据库处理。"
      },
      {
        id: 's5', title: 'Kafka 消息堆积处理流程', author: '张三', date: '2024-02-28', hot: false,
        pdfUrl: '/assets/docs/sop_detail.pdf',
        content: "### 发现堆积\n一般由 Burrow 或自建 Exporter 触发：`kafka_consumergroup_lag > 50000`。\n\n### 处理措施\n1. **确认消费者状态**：排查消费者是否出现 Full GC 或崩溃假死。\n2. **观察单条消费耗时**：如果耗时过高，考虑临时关闭慢速写入下游（如 MySQL 落表操作），先将消息转储至 Redis 或本地日志。\n3. **扩容并发**：若 Topic 的 Partition 数量充裕，直接增加 Consumer Pod 的数量副本。\n4. **重置 Offset**（谨慎使用）：若积压数据已经过期失效并被业务方确认允许丢弃，可以直接通过工具重置 Consumer Group 的 Offset 到 latest。"
      }
    ]
  },
  {
    id: 'arch',
    name: '核心架构',
    icon: Network,
    type: 'pdf',
    count: 12,
    updatedAt: '2024-04-10 09:15',
    category: '架构',
    documents: [
      {
        id: 'a1', title: '支付系统双机房高可用架构', author: '赵六', date: '2024-04-01', hot: true,
        content: "### 架构拓扑\n采用多活架构，A/B 机房通过专线互联。数据库使用云原生分布式架构。\n\n### 故障切换逻辑\n- **机房故障**：全量入口流量秒级切至备用机房。\n- **应用故障**：跨机房跨节点自动剔除异常实例。"
      },
      { id: 'a2', title: '全链路压测指标模型', author: '钱七', date: '2023-12-15', hot: false, content: "内容正在整理中..." },
    ]
  },
  {
    id: 'incident',
    name: '故障复盘库',
    icon: History,
    type: 'txt',
    count: 48,
    updatedAt: '2024-04-12 11:30',
    category: '故障复盘',
    documents: [
      {
        id: 'f1', title: '20240315-核心结算链路 P0 级事故复盘', author: '运维团队', date: '2024-03-18', hot: true,
        content: "### 故障描述\n2024-03-15 14:00 支付核心接口失败率从 0.1% 突增至 45%，影响交易笔数约 10k。\n\n### 根因分析\n上游营销系统在未通知的情况下开启了全网推券，导致 QPS 从 5k 瞬间暴增至 50k，触发了数据库连接池瓶颈。"
      },
      { id: 'f2', title: 'DB 连接池爆满导致交易中断分析', author: 'DBA', date: '2024-03-10', hot: false, content: "内容正在补充中..." },
    ]
  },
  {
    id: 'rules',
    name: '监控告警规则',
    icon: ShieldCheck,
    type: 'yml',
    count: 156,
    updatedAt: '2024-04-11 18:45',
    category: '监控规则',
    documents: [
      { id: 'r1', title: '基础资源 CPU/内存 阈值规范', author: '架构组', date: '2024-04-11', hot: true, content: "规范全站服务的告警基准线..." },
      { id: 'r2', title: 'Prometheus 核心服务告警模板', author: '监控组', date: '2024-04-05', hot: false, content: "包含标准的黄金指标告警定义..." },
    ]
  }
];

const KnowledgeSidebar = ({ selectedLibIds, onSelectLibs, activeLibId, setActiveLibId, onEnterLib }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');

  const categories = ['全部', ...new Set(MOCK_KNOWLEDGE_LIBS.map(lib => lib.category))];

  const filteredLibs = MOCK_KNOWLEDGE_LIBS.filter(lib => {
    const matchesSearch = lib.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lib.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === '全部' || lib.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleAll = () => {
    if (selectedLibIds.length === MOCK_KNOWLEDGE_LIBS.length) {
      onSelectLibs([]);
    } else {
      onSelectLibs(MOCK_KNOWLEDGE_LIBS.map(l => l.id));
    }
  };

  const toggleLib = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedLibIds.includes(id)) {
      onSelectLibs(selectedLibIds.filter((libId: string) => libId !== id));
    } else {
      onSelectLibs([...selectedLibIds, id]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-card)]">
      {/* Header with Search */}
      <div className="p-6 border-b border-slate-800/50 bg-[var(--bg-card)] shrink-0 space-y-4">
        <div className="flex items-center justify-between group cursor-pointer" onClick={toggleAll}>
          <span className="text-sm font-bold text-slate-200 group-hover:text-slate-100 transition-colors uppercase tracking-widest">知识资源库</span>
          <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${selectedLibIds.length === MOCK_KNOWLEDGE_LIBS.length ? 'bg-[#4f46e5] border-[#4f46e5] shadow-[0_0_12px_rgba(79,70,229,0.4)]' : 'border-slate-700 bg-slate-900/30 group-hover:border-slate-500'}`}>
            {selectedLibIds.length === MOCK_KNOWLEDGE_LIBS.length && <Check size={14} strokeWidth={4} className="text-white" />}
          </div>
        </div>

        <div className="relative group">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          <input
            type="text"
            placeholder="搜索库名称或分类标签..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/40 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
          />
        </div>

        {/* Category Tags */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all border ${
                activeCategory === cat 
                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.1)]' 
                : 'bg-slate-800/30 border-slate-800/50 text-slate-500 hover:border-slate-700 hover:text-slate-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar">
        <div className="space-y-3">
          <AnimatePresence>
            {filteredLibs.map(lib => (
              <motion.div
                key={lib.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`flex flex-col p-4 rounded-2xl hover:bg-slate-900/30 transition-all group cursor-pointer border ${activeLibId === lib.id ? 'bg-indigo-500/[0.04] border-indigo-500/30' : 'border-slate-800/40 hover:border-slate-700'}`}
                onClick={() => onEnterLib(lib.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform`}>
                      <lib.icon size={18} />
                    </div>
                    <div>
                      <div className={`text-sm font-bold truncate transition-colors ${activeLibId === lib.id ? 'text-indigo-400' : 'text-slate-200'}`}>
                        {lib.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 font-medium">
                        <span className="flex items-center gap-1"><Files size={10} /> {lib.count} 篇</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                        <span className="flex items-center gap-1"><Clock size={10} /> {lib.updatedAt.split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => toggleLib(lib.id, e)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${selectedLibIds.includes(lib.id) ? 'bg-[#4f46e5] border-[#4f46e5] shadow-[0_0_8px_rgba(79,70,229,0.2)]' : 'border-slate-700 bg-slate-900/30 hover:border-slate-500'}`}
                  >
                    {selectedLibIds.includes(lib.id) && <Check size={14} strokeWidth={4} className="text-white" />}
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${lib.category === 'SOP' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      lib.category === '架构' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        lib.category === '故障复盘' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                    {lib.category}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="p-6 border-t border-slate-800 bg-[var(--bg-card)] shrink-0">
        <div className="relative group/search">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/search:text-indigo-500" />
          <input type="text" placeholder="全库搜索..." className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-400 focus:outline-none focus:border-indigo-500/50 transition-all" />
        </div>
      </div>
    </div>
  );
};

const KnowledgeDocViewer = ({ activeLibId, selectedDocId, onSelectDoc, onAction, onBack }: any) => {
  const currentLib = MOCK_KNOWLEDGE_LIBS.find(l => l.id === activeLibId);
  if (!currentLib) return <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">请在左侧选择知识库进行浏览</div>;

  const selectedDoc = currentLib.documents.find(d => d.id === selectedDocId);

  return (
    <div className="flex flex-col h-full bg-[var(--bg-deepest)]">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 bg-[var(--bg-card)] shrink-0 shadow-sm z-10 transition-all">
        <button
          onClick={() => selectedDocId ? onSelectDoc(null) : onBack()}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-400 transition-colors mb-4 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-tight">
            {selectedDocId ? '返回文章列表' : '返回知识库列表'}
          </span>
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              {selectedDocId ? <FileText size={20} /> : <BookOpen size={20} />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-slate-200 truncate flex items-center gap-2">
                {selectedDocId ? selectedDoc?.title : currentLib.name}
              </h3>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest mt-1">
                {selectedDocId ? (
                  <span className="flex items-center gap-2">
                    <User size={10} /> {selectedDoc?.author} · <Clock size={10} /> {selectedDoc?.date}
                  </span>
                ) : (
                  `包含 ${currentLib.count} 份归档文献 · 最近更新: ${currentLib.updatedAt}`
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait">
          {selectedDocId ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-8 pb-20 bg-[var(--bg-card)]"
            >
              <div className="prose prose-invert max-w-none">
                {(selectedDoc as any).pdfUrl ? (
                  <CustomPDFViewer url={(selectedDoc as any).pdfUrl} title={selectedDoc.title} />
                ) : (
                  <div className="bg-slate-800/20 rounded-2xl border border-slate-800/50 p-6 text-[13px] text-slate-300 leading-relaxed whitespace-pre-wrap font-sans selection:bg-indigo-500/30">
                    {selectedDoc?.content}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="p-6 space-y-3 bg-[var(--bg-card)]"
            >
              {currentLib.documents.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => onSelectDoc(doc.id)}
                  className="w-full text-left p-4 rounded-xl border bg-slate-800/10 border-slate-800/60 hover:border-indigo-500/40 hover:bg-indigo-500/[0.03] transition-all group flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <h5 className="text-[13px] font-bold text-slate-200 group-hover:text-indigo-300 transition-colors truncate">{doc.title}</h5>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-2 font-medium">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800/50 text-slate-400 text-[9px] font-bold uppercase border border-slate-700/30">
                        {currentLib.type.toUpperCase()}
                      </span>
                      <span className="flex items-center gap-1"><User size={10} /> {doc.author}</span>
                      <span className="flex items-center gap-1"><Clock size={10} /> {doc.date}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-600 group-hover:text-indigo-400 transform group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- Knowledge Library Picker Components ---

const KnowledgeLibTag = ({ name, onRemove }: { name: string, onRemove: () => void }) => (
  <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg group hover:bg-indigo-500/20 transition-all">
    <span className="text-[10px] font-bold text-indigo-400 whitespace-nowrap">{name}</span>
    <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="text-indigo-400/50 hover:text-rose-400 transition-colors">
      <X size={10} strokeWidth={3} />
    </button>
  </div>
);

const KnowledgeLibPicker = ({ isOpen, selectedIds, onSelect, onClose, direction = 'up', containerRef }: any) => {
  if (!isOpen) return null;

  const isAllSelected = selectedIds.length === MOCK_KNOWLEDGE_LIBS.length;

  return (
    <div 
      ref={containerRef}
      className={`absolute left-0 w-80 bg-[var(--bg-elevated)] border border-slate-800 rounded-2xl z-50 overflow-hidden transition-all duration-300 shadow-2xl ${
        direction === 'up' 
          ? 'bottom-full mb-3 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-2' 
          : 'top-full mt-3 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] animate-in slide-in-from-top-2'
      }`}
    >
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/20">
        <h4 className="text-[11px] font-black text-slate-200 uppercase tracking-widest flex items-center gap-2">
          <BookOpen size={14} className="text-indigo-400" /> 选择检索范围
        </h4>
        <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-md text-slate-500 transition-colors">
          <X size={14} />
        </button>
      </div>
      <div className="max-h-72 overflow-y-auto no-scrollbar p-2 space-y-1.5 bg-[var(--bg-muted)]">
        {/* Select All Toggle - Precision Aligned */}
        <div className="px-3 py-2 mb-1">
          <button 
            onClick={() => {
              if (isAllSelected) {
                onSelect([]);
              } else {
                onSelect(MOCK_KNOWLEDGE_LIBS.map(lib => lib.id));
              }
            }}
            className="flex items-center gap-4 text-slate-400 hover:text-indigo-400 transition-colors group/all w-full"
          >
            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 ${isAllSelected ? 'bg-indigo-600 border-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.4)]' : 'border-slate-700 bg-slate-900/40 group-hover/all:border-slate-500'}`}>
               {isAllSelected && <Check size={10} strokeWidth={4} className="text-white" />}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">全选</span>
          </button>
        </div>
        
        <div className="h-px bg-slate-800/40 mx-3 mb-2" />
        {MOCK_KNOWLEDGE_LIBS.map(lib => {
          const isSelected = selectedIds.includes(lib.id);
          return (
            <div 
              key={lib.id}
              onClick={() => {
                const newIds = isSelected ? selectedIds.filter((id: string) => id !== lib.id) : [...selectedIds, lib.id];
                onSelect(newIds);
              }}
              className={`flex flex-col p-3 rounded-xl border transition-all cursor-pointer group ${isSelected ? 'bg-indigo-500/[0.08] border-indigo-500/40' : 'bg-transparent border-transparent hover:bg-slate-900/30 hover:border-slate-800'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 ${isSelected ? 'bg-[#4f46e5] border-[#4f46e5]' : 'border-slate-700 bg-black/20 group-hover:border-slate-500'}`}>
                  {isSelected && <Check size={10} strokeWidth={4} className="text-white" />}
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-indigo-500/20 text-indigo-400 font-bold' : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'}`}>
                    <lib.icon size={16} />
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${isSelected ? 'text-indigo-400' : 'text-slate-200'}`}>{lib.name}</div>
                    <div className="text-[9px] text-slate-500 font-medium mb-1.5">更新于 {lib.updatedAt.split(' ')[0]}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] px-1 py-0.5 bg-slate-800/80 rounded text-slate-500 font-bold border border-slate-700/50 uppercase leading-none">{lib.category}</span>
                      <span className="text-[9px] text-slate-600 font-mono italic leading-none">{lib.count} 篇文档</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-3 border-t border-slate-800 bg-indigo-500/[0.02]">
        <button onClick={onClose} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-lg transition-all shadow-lg shadow-indigo-600/20 uppercase tracking-widest">
          确认选项 ({selectedIds.length})
        </button>
      </div>
    </div>
  );
};

const KnowledgeChatPanel = ({ messages, chatEndRef, renderInput, selectedLibIds, selectedDocId, isCollapsed, onToggle, onAction, inspectionContext }: any) => {
  const selectedLibs = MOCK_KNOWLEDGE_LIBS.filter(l => selectedLibIds.includes(l.id));
  const doc = selectedLibs.flatMap(l => l.documents).find(d => d.id === selectedDocId);

  return (
    <div className="flex flex-col h-full bg-[var(--bg-deepest)]">
      {/* Context Header */}
      <div className="h-14 border-b border-slate-800/80 flex items-center justify-between px-6 bg-[var(--bg-card)] shrink-0">
        <div className="flex items-center gap-2">
          {/* Subtle title to match Inspection style */}
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI 知识专家</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-slate-500 hover:text-slate-100 transition-colors"><Maximize2 size={16} /></button>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto p-8 no-scrollbar bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.03),transparent_40%)] flex flex-col`}>
        <div className={`max-w-4xl mx-auto w-full ${messages.length === 0 ? 'flex-1 flex flex-col items-center justify-center' : 'space-y-6'}`}>
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div
                key="knowledge-welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center text-center w-full max-w-2xl px-10 -mt-10"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-20 h-20 rounded-[28px] mx-auto bg-indigo-500/10 border border-indigo-500/20 shadow-[0_0_40px_rgba(99,102,241,0.1)] flex items-center justify-center mb-6"
                >
                  <Brain size={40} className="text-indigo-400" />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xl font-bold text-slate-200 mb-3"
                >
                  AI 知识专家
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-base text-slate-500 leading-relaxed max-w-[480px]"
                >
                  您的企业级智能知识引擎。无缝对接各类文档源，智能解析结构化与非结构化数据，打造会说话的内部百科全书，全面赋能团队的高效协同与知识创新。
                </motion.p>

              </motion.div>
            ) : (
              <motion.div
                key="knowledge-messages"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {messages.map((msg: any) => (
                  <ChatBubble key={msg.id} message={msg} onAction={onAction} inspectionContext={inspectionContext} />
                ))}
                <div ref={chatEndRef} className="h-20" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-t from-[var(--bg-deepest)] via-[var(--bg-deepest)]/95 to-transparent shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            {['生成摘要', '发布后 pod 持续重启怎么排查？', 'CPU 突增如何定位？'].map(cmd => (
              <button
                key={cmd}
                onClick={() => onAction('SEND_PROMPT', cmd)}
                className="px-3 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold hover:bg-blue-500/20 transition-all font-mono"
              >
                {cmd}
              </button>
            ))}
          </div>
          {renderInput()}
        </div>
      </div>
    </div>
  );
};

const DiagnosticAlertPanel = ({ onDiagnose, onSelect, selectedAlarmId, onToggle, diagnosedAlarms, onAction }: any) => {
  const [filterLevel, setFilterLevel] = useState<string>('全部');
  const [filterType, setFilterType] = useState<string>('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLevelOpen, setIsLevelOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);

  const levelOptions = [
    { label: '全部', key: '全部', dot: 'bg-slate-400', clr: 'text-slate-400' },
    { label: '严重', key: 'P0', dot: 'bg-rose-500', clr: 'text-rose-500' },
    { label: '重要', key: 'P1', dot: 'bg-orange-500', clr: 'text-orange-500' },
    { label: '次要', key: 'P2', dot: 'bg-yellow-500', clr: 'text-yellow-500' },
    { label: '警告', key: 'P3', dot: 'bg-blue-500', clr: 'text-blue-500' },
    { label: '信息', key: 'P4', dot: 'bg-slate-500', clr: 'text-slate-500' },
  ];

  const typeOptions = ['全部', '指标', '链路', '日志', '拨测', '其他'];

  const filteredAlarms = MOCK_ALARMS.filter(alarm => {
    const matchLevel = filterLevel === '全部' || alarm.level === filterLevel;
    const matchType = filterType === '全部' || alarm.type === filterType;
    const matchSearch = alarm.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alarm.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alarm.service.toLowerCase().includes(searchQuery.toLowerCase());
    return matchLevel && matchType && matchSearch;
  });

  const selectedLevelObj = levelOptions.find(l => l.key === filterLevel) || levelOptions[0];

  return (
    <div className="flex flex-col h-full bg-[var(--bg-card)]">
      <div className="p-4 border-b border-slate-800 bg-[var(--bg-card)] shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Bell size={16} className="text-rose-500" /> 实时告警监控
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 px-2 py-0.5 rounded bg-slate-800/50 border border-slate-700/50">
              {filteredAlarms.length} 活动
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="relative group/search">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/search:text-purple-400 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="粘贴告警ID或内容进行搜索"
              className="w-full bg-slate-900/40 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500/50 transition-all font-medium"
            />
            {searchQuery && <X size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 cursor-pointer hover:text-slate-100" onClick={() => setSearchQuery('')} />}
          </div>

          <div className="flex items-center gap-2">
            {/* Level Dropdown */}
            <div className="flex-1 relative">
              <button
                onClick={() => setIsLevelOpen(!isLevelOpen)}
                className="w-full flex items-center justify-between gap-1.5 px-2.5 py-1.5 bg-slate-800/40 border border-slate-700/50 rounded-lg hover:border-slate-500 transition-all text-[10px]"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <div className={`w-1.5 h-1.5 rounded-full ${selectedLevelObj.dot}`} />
                  <span className={`font-bold uppercase tracking-tight ${selectedLevelObj.clr}`}>{selectedLevelObj.label}</span>
                </div>
                <ChevronDown size={10} className={`text-slate-500 transition-transform ${isLevelOpen ? 'rotate-180' : ''}`} />
              </button>
              {isLevelOpen && (
                <div className="absolute top-full left-0 mt-2 w-full bg-[var(--bg-dropdown)] border border-slate-700 rounded-lg shadow-2xl overflow-hidden z-50">
                  <div className="max-h-48 overflow-y-auto no-scrollbar">
                    {levelOptions.map(l => (
                      <button
                        key={l.key}
                        onClick={() => { setFilterLevel(l.key); setIsLevelOpen(false); }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold hover:bg-white/[0.05] transition-colors ${filterLevel === l.key ? 'bg-purple-500/5 text-purple-400' : 'text-slate-400'}`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${l.dot}`} />
                        <span>{l.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Type Dropdown */}
            <div className="flex-1 relative">
              <button
                onClick={() => setIsTypeOpen(!isTypeOpen)}
                className="w-full flex items-center justify-between gap-1.5 px-2.5 py-1.5 bg-slate-800/40 border border-slate-700/50 rounded-lg hover:border-slate-500 transition-all text-[10px]"
              >
                <span className={`font-bold uppercase tracking-tight truncate ${filterType === '全部' ? 'text-slate-400' : 'text-purple-400'}`}>
                  {filterType === '全部' ? '所有类型' : filterType}
                </span>
                <ChevronDown size={10} className={`text-slate-500 transition-transform ${isTypeOpen ? 'rotate-180' : ''}`} />
              </button>
              {isTypeOpen && (
                <div className="absolute top-full left-0 mt-2 w-full bg-[var(--bg-dropdown)] border border-slate-700 rounded-lg shadow-2xl overflow-hidden z-50">
                  <div className="max-h-48 overflow-y-auto no-scrollbar">
                    {typeOptions.map(t => (
                      <button
                        key={t}
                        onClick={() => { setFilterType(t); setIsTypeOpen(false); }}
                        className={`w-full flex items-center px-3 py-2 text-[10px] font-bold hover:bg-white/[0.05] transition-colors ${filterType === t ? 'bg-purple-500/5 text-purple-400' : 'text-slate-400'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 no-scrollbar space-y-3">
        {filteredAlarms.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-40 text-center py-20 px-4">
            <Search size={32} className="text-slate-600 mb-3" />
            <p className="text-[11px] text-slate-400 font-medium">未匹配到相关告警...</p>
            <button onClick={() => { setFilterLevel('全部'); setFilterType('全部'); setSearchQuery(''); }} className="mt-2 text-[10px] text-purple-400 font-bold hover:underline">重置条件</button>
          </div>
        ) : (
          filteredAlarms.map((alarm) => (
            <div
              key={alarm.id}
              onClick={() => onSelect?.(alarm)}
              className={`group relative p-4 rounded-xl border transition-all duration-300 cursor-pointer ${selectedAlarmId === alarm.id
                  ? 'bg-purple-500/10 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/30'
                  : alarm.level === 'P0'
                    ? 'bg-rose-500/[0.03] border-rose-500/20 hover:border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.05)]'
                    : 'bg-slate-800/20 border-slate-800/60 hover:border-slate-700'
                }`}
            >
              <div className="flex justify-between items-start mb-2.5">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${alarm.level === 'P0' ? 'bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'bg-orange-500'}`} />
                  <span className={`text-[10px] font-bold ${alarm.level === 'P0' ? 'text-rose-500' : 'text-orange-500'}`}>
                    {alarm.level === 'P0' ? '严重' : alarm.level === 'P1' ? '重要' : alarm.level === 'P2' ? '次要' : alarm.level === 'P3' ? '警告' : '信息'}
                  </span>
                  <span className="text-[9px] text-slate-500 px-1.5 py-0.5 bg-slate-800/80 rounded border border-slate-700/50 uppercase tracking-tighter font-bold">{alarm.type}</span>
                </div>
                <div className="flex items-center gap-2">

                  {(alarm.status === 'converged' || (alarm.convergedCount && alarm.convergedCount > 0)) && (
                    <span className="text-[11px] px-2 py-0.5 bg-slate-800/80 text-slate-400 border border-slate-700/50 rounded font-bold shadow-sm whitespace-nowrap">📦 收敛 {alarm.convergedCount > 99 ? '99+' : (alarm.convergedCount || 1)} 条</span>
                  )}
                  <span className="text-[10px] text-slate-600 font-medium font-mono">{alarm.startTime.split(' ')[1]}</span>
                </div>
              </div>

              <h4 className="text-xs font-bold text-slate-200 mb-3 leading-relaxed group-hover:text-slate-100 transition-colors line-clamp-2">{alarm.title}</h4>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 ">
                  <Server size={10} className="text-slate-500" />
                  <span className="text-[10px] text-slate-400 font-mono tracking-tight">{alarm.service}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDiagnose(alarm);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all active:scale-95 shadow-sm"
                  >
                    <Zap size={12} />
                    <span>一键诊断</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const DiagnosticContextBanner = ({ alarm }: { alarm: Alarm | null }) => {
  if (!alarm) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 mx-auto max-w-4xl"
    >
      <div className="bg-[var(--bg-elevated-alt)]/80 backdrop-blur-md border border-purple-500/30 rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 flex gap-2">
          <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] text-emerald-400 font-bold">
            <Check size={10} /> 根因分析已完成
          </div>
          <button className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-[10px] text-purple-300 font-bold hover:bg-purple-500/30 transition-all">
            <FileText size={10} /> 查看复盘报告
          </button>
        </div>

        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${alarm.level === 'P0' ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30' : 'bg-orange-500/20 text-orange-500 border border-orange-500/30'
            }`}>
            <ShieldAlert size={24} />
          </div>

          <div className="flex-1 min-w-0 pr-32">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{alarm.id}</span>
              <div className="w-1 h-1 rounded-full bg-slate-700" />
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded leading-none ${alarm.level === 'P0' ? 'bg-rose-500 text-white' : 'bg-orange-500 text-white'
                }`}>{alarm.level} 告警</span>
            </div>
            <h3 className="text-sm font-bold text-slate-200 truncate mb-2">{alarm.title}</h3>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4">
              <div className="flex items-center gap-1.5">
                <Server size={12} className="text-purple-400" />
                <span className="text-[11px] text-slate-400 font-bold">来源: <span className="text-slate-200">{alarm.service}</span></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Activity size={12} className="text-blue-400" />
                <span className="text-[11px] text-slate-400 font-bold">类型: <span className="text-blue-400 font-mono">{alarm.type || '指标'}</span></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={12} className="text-slate-500" />
                <span className="text-[11px] text-slate-400 font-bold">持续: <span className="text-slate-300">{alarm.duration || '进行中'}</span></span>
              </div>
              <div className="flex items-center gap-1.5">
                <History size={12} className="text-slate-500" />
                <span className="text-[11px] text-slate-400 font-bold">触发时间: <span className="text-slate-300">{alarm.startTime}</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const DiagnosticChatPanel = ({ messages, chatEndRef, onAction, renderInput, isCollapsed, onToggle, selectedAlarm, showBanner, inspectionContext }: any) => (
  <div className="flex-1 flex flex-col min-h-0 bg-[var(--bg-deepest)]">
    <div className="h-12 flex items-center px-6 border-b border-slate-800/50 shrink-0 bg-[var(--bg-card)]">
      <button
        onClick={() => onToggle?.()}
        className="p-1 px-2 hover:bg-slate-800/50 rounded-md border border-slate-800/50 transition-all flex items-center gap-1.5 text-slate-500 hover:text-indigo-400 group"
        title={isCollapsed ? "展开侧边栏" : "收起侧边栏"}
      >
        {isCollapsed ? <PanelLeft size={14} className="text-indigo-500" /> : <PanelLeftClose size={14} className="text-rose-500" />}
        <span className="text-[10px] font-bold uppercase tracking-tight">{isCollapsed ? '展开面板' : '收起面板'}</span>
      </button>
      <div className="w-px h-3 bg-slate-800 mx-3" />
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
        <Bot size={12} className="text-indigo-400" /> AI诊断专家
      </div>
    </div>
    <div className="flex-1 overflow-y-auto p-8 no-scrollbar relative">
      {messages.length === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-24 h-24 rounded-[32px] bg-indigo-500/10 flex items-center justify-center mb-8 border border-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.15)]"
          >
            <Bot size={48} className="text-indigo-400" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-slate-100 to-slate-500 mb-4 tracking-tight"
          >
            AI 诊断专家
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-sm max-w-[320px] leading-relaxed font-medium"
          >
            为您提供全天候、高精度的故障诊断与根因分析服务，为业务连续性保驾护航
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 flex items-center gap-3 text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]"
          >
            <div className="h-px w-8 bg-slate-800" />
            智能推演模式已就绪
            <div className="h-px w-8 bg-slate-800" />
          </motion.div>

        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          <AnimatePresence>
            {messages.map((msg: any) => (
              <ChatBubble key={msg.id} message={msg} onAction={onAction} inspectionContext={inspectionContext} />
            ))}
          </AnimatePresence>
          <div ref={chatEndRef} className="h-20" />
        </div>
      )}
    </div>

    <div className="p-6 bg-gradient-to-t from-[var(--bg-card)] via-[var(--bg-card)]/95 to-transparent shrink-0">
      <div className="max-w-4xl mx-auto">
        <AnimatePresence>
          {selectedAlarm && showBanner ? (
            <motion.div
              key={selectedAlarm.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-4 space-y-3"
            >


              {/* 增强型吸附看板 (Enhanced Context Banner) */}
              <div className="flex flex-col">
                <div className="bg-[var(--bg-elevated)]/90 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-4 shadow-2xl shadow-black/40 relative overflow-hidden group/banner transition-all hover:border-indigo-500/40">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50" />

                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Icon / Level Section */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${selectedAlarm.level === 'P0' ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30' : 'bg-orange-500/20 text-orange-500 border border-orange-500/30'
                        }`}>
                        <ShieldAlert size={20} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">

                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded leading-none ${selectedAlarm.level === 'P0' ? 'bg-rose-500 text-white' : 'bg-orange-500 text-white'
                            }`}>{selectedAlarm.level} 告警联动</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-200 truncate group-hover/banner:text-white transition-colors">{selectedAlarm.title}</h3>

                        <div className="flex flex-wrap items-center gap-x-4 mt-2">
                          <div className="flex items-center gap-1.5">
                            <Server size={12} className="text-indigo-400" />
                            <span className="text-[10px] text-slate-400 font-bold">来源: <span className="text-slate-200">{selectedAlarm.service}</span></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Activity size={12} className="text-emerald-400" />
                            <span className="text-[10px] text-slate-400 font-bold">类型: <span className="text-emerald-400 font-mono">{selectedAlarm.type || '指标'}</span></span>
                          </div>
                          {selectedAlarm.duration && (
                            <div className="flex items-center gap-1.5">
                              <Clock size={12} className="text-slate-500" />
                              <span className="text-[10px] text-slate-400 font-bold">已持续: <span className="text-slate-300">{selectedAlarm.duration}</span></span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <History size={12} className="text-slate-500" />
                            <span className="text-[10px] text-slate-400 font-bold">触发时间: <span className="text-slate-300">{selectedAlarm.startTime}</span></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); onAction?.('CLEAR_ALARM'); }}
                        className="p-2 rounded-xl bg-slate-800/50 text-slate-500 hover:bg-rose-500/20 hover:text-rose-500 transition-all border border-slate-700/50"
                        title="取消关联告警"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
        {renderInput()}
      </div>
    </div>
  </div>
);


// --- Capacity Manager Components ---

const ResourceInspector = () => (
  <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 bg-[var(--bg-deepest)]">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
        <Cpu size={16} className="text-indigo-400" /> 资源详情探测
      </h3>
      <span className="text-[10px] text-slate-500 font-mono">NODE: k8s-node-01</span>
    </div>
    <div className="grid grid-cols-2 gap-4">
      {[
        { label: 'CPU Usage', value: '67.4%', color: 'text-orange-500', icon: Activity },
        { label: 'Memory', value: '82.1%', color: 'text-rose-500', icon: Layers },
        { label: 'Disk I/O', value: '12.4MB/s', color: 'text-blue-500', icon: HardDrive },
        { label: 'Network', value: '450Mbps', color: 'text-emerald-500', icon: Zap },
      ].map(stat => (
        <div key={stat.label} className="bg-[var(--bg-card)] border border-slate-800/50 p-4 rounded-2xl">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] text-slate-500 font-bold uppercase">{stat.label}</span>
            <stat.icon size={14} className={stat.color} />
          </div>
          <div className={`text-xl font-mono font-bold ${stat.color}`}>{stat.value}</div>
        </div>
      ))}
    </div>
    <div className="bg-[var(--bg-card)] border border-slate-800/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs font-bold text-slate-200">Pod 分布拓扑</span>
        <button className="text-[10px] text-indigo-400 font-bold hover:underline">查看全量</button>
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.random() * 60 + 20}%` }}
                className="h-full bg-indigo-500/40"
              />
            </div>
            <span className="text-[10px] text-slate-500 font-mono">pod-xxx-0{i}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// --- Inspection Assistant Components ---

const InspectionDashboard = ({ tasks, activeTab, setActiveTab, onAction, setShowBanner, selectedTask, setSelectedTask, analysisStatus }: any) => (
  <div
    className="flex-1 flex flex-col min-h-0 bg-[var(--bg-card)]"
    onClick={() => { setShowBanner(false); setSelectedTask(null); }}
  >
    {/* Header banner always visible */}
    <div onClick={(e) => e.stopPropagation()} className="px-6 py-3 border-b border-slate-800/50 bg-[var(--bg-card)] flex items-center justify-between shrink-0">
       <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
             <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter shadow-sm">实时巡检中</span>
          </div>
       </div>
       <div className="text-[10px] text-indigo-400/60 font-medium font-mono uppercase tracking-widest">实时状态大盘</div>
    </div>

    <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
       <div className="space-y-10">
         <InspectionOverview onAction={onAction} />
         <div className="pt-8 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <ListTodo size={18} className="text-blue-500" /> 巡检任务列表
              </h3>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Tasks: 24</div>
            </div>
            <InspectionTaskList
              tasks={tasks}
              onAction={onAction}
              setShowBanner={setShowBanner}
              setSelectedTask={setSelectedTask}
              analysisStatus={analysisStatus}
              selectedTask={selectedTask}
            />
         </div>
       </div>
    </div>
  </div>
);

const InspectionChat = ({ messages, chatEndRef, onAction, renderInput, isCollapsed, onToggle, selectedTask, showBanner, setShowBanner, analysisStatus, inspectionContext }: any) => (
  <div className="flex-1 flex flex-col border-l border-slate-800/50 bg-[var(--bg-deepest)] shrink-0 min-w-0">
    {/* Page Toggle & Agent Label */}
    <div className="h-10 border-b border-slate-800/60 flex items-center px-4 justify-between bg-[var(--bg-card)] shrink-0">
       <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            className="p-1 px-2 hover:bg-slate-800/50 rounded-md transition-all flex items-center gap-1.5 text-slate-500 hover:text-orange-400 group"
            title={isCollapsed ? "展开侧边栏" : "收起侧边栏"}
          >
            {isCollapsed ? <PanelLeftClose size={14} className="text-orange-500" /> : <PanelLeft size={14} />}
            <span className="text-[10px] font-bold uppercase tracking-tight">{isCollapsed ? '展开面板' : '收起面板'}</span>
          </button>
          <div className="w-px h-3 bg-slate-800 mx-1" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI 巡检助手</span>
       </div>
    </div>

    <div className="flex-1 overflow-y-auto p-4 no-scrollbar relative">
       {messages.length === 0 ? (
         <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-20 h-20 rounded-[28px] bg-orange-500/10 flex items-center justify-center mb-6 border border-orange-500/20 shadow-[0_0_40px_rgba(249,115,22,0.1)]"
            >
               <Activity size={40} className="text-orange-500" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl font-bold text-slate-200 mb-3"
            >
              AI 巡检助手
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-slate-500 leading-relaxed max-w-[280px]"
            >
              您的自动化合规巡检引擎。通过无缝对接底层监控与资产平台，实现自动化数据采集与规则校验。
            </motion.p>
         </div>
       ) : (
         <div className="space-y-4">
           <AnimatePresence>
             {messages.map((msg: any) => (
               <ChatBubble key={msg.id} message={msg} onAction={onAction} inspectionContext={inspectionContext} />
             ))}
           </AnimatePresence>
           <div ref={chatEndRef} className="h-4" />
         </div>
       )}
    </div>

    <div className="h-[44px] px-3 border-t border-slate-800/50 flex items-center gap-2 bg-[var(--bg-card)] shrink-0 overflow-x-auto no-scrollbar">
      {[
        { id: 'NEW_TASK', icon: <PlusCircle size={12} />, label: '新建任务', color: 'text-blue-400' },
        { id: 'REPORT', icon: <FilePieChart size={12} />, label: '今日报告', color: 'text-emerald-400' },
        { id: 'DIAG', icon: <Search size={12} />, label: '诊断任务', color: 'text-purple-400' }
      ].map(cmd => (
        <button
          key={cmd.label}
          onClick={() => {
            if (cmd.id === 'NEW_TASK') onAction('NEW_TASK');
            if (cmd.id === 'DIAG') onAction('DIAG_TASK');
            if (cmd.id === 'REPORT') onAction('GENERATE_REPORT');
          }}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/60 transition-all whitespace-nowrap group"
        >
          <span className={cmd.color}>{cmd.icon}</span>
          <span className="text-[10px] text-slate-400 font-bold italic tracking-tighter group-hover:text-slate-200 transition-colors">{cmd.label}</span>
        </button>
      ))}
    </div>

    <div className="p-4 bg-[var(--bg-panel)] border-t border-slate-800/80 shrink-0">
       <AnimatePresence>
         {showBanner && selectedTask && (
           <InspectionTaskContextBanner
             task={selectedTask}
             onClose={() => setShowBanner(false)}
             isAnalyzing={analysisStatus?.[selectedTask.name] === 'analyzing'}
           />
         )}
       </AnimatePresence>
       {renderInput()}
    </div>
  </div>
);

// --- Report Assistant Components ---

const ReportAssistantView = ({ messages, chatEndRef, onAction, renderInput, isCollapsed, onToggle, inspectionContext }: any) => (
  <div className="flex-1 flex min-h-0 bg-[var(--bg-input)]">
    <div className="w-1/4 border-r border-slate-800/50 bg-[var(--bg-card)] p-6 space-y-6 hidden md:flex flex-col">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">报告管理</h3>
      <div className="space-y-2">
        {['今日日报', '本周周报', '资源水位月报'].map(r => (
          <div key={r} className="p-3 rounded-xl bg-slate-800/30 border border-transparent hover:border-indigo-500/30 cursor-pointer transition-all">
            <div className="text-xs text-slate-200 font-bold mb-1">{r}</div>
            <div className="text-[9px] text-slate-500">2026-04-12 10:00</div>
          </div>
        ))}
      </div>
    </div>
    <div className="flex-1 flex flex-col min-h-0 bg-[var(--bg-navy)]">
      <div className="flex-1 overflow-y-auto p-8 no-scrollbar max-w-[900px] mx-auto w-full">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-[28px] bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-6">
              <FilePieChart size={40} className="text-pink-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-200 mb-4">运维报告助手</h2>
            <p className="text-slate-500 max-w-[400px] mb-8">自动汇总巡检、诊断与容量数据，一键生成多维度专业运维报告。</p>
            <div className="w-full max-w-sm">{renderInput()}</div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg: any) => <ChatBubble key={msg.id} message={msg} onAction={onAction} inspectionContext={inspectionContext} />)}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>
      {messages.length > 0 && <div className="p-6 border-t border-slate-800/40">{renderInput()}</div>}
    </div>
  </div>
);

// --- Assistant Chat View ---
const AssistantChatView = ({ messages, chatEndRef, onAction, renderInput, isCollapsed, onToggle, inspectionContext }: any) => (
  <div className="flex-1 flex flex-col min-h-0 bg-[var(--bg-deepest)] relative">
    {/* Page Toggle & Agent Label */}
    <div className="h-10 border-b border-slate-800/60 flex items-center px-4 justify-between bg-[var(--bg-card)] shrink-0">
       <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            className="p-1 px-2 hover:bg-slate-800/50 rounded-md transition-all flex items-center gap-1.5 text-slate-500 hover:text-indigo-400 group"
          >
            {isCollapsed ? <PanelLeftClose size={14} className="text-indigo-500" /> : <PanelLeft size={14} />}
            <span className="text-[10px] font-bold uppercase tracking-tight">{isCollapsed ? '展开面板' : '收起面板'}</span>
          </button>
          <div className="w-px h-3 bg-slate-800 mx-1" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest">SRE 智能助手 (General AI)</span>
          </div>
       </div>
    </div>

    <div className="flex-1 overflow-y-auto p-10 no-scrollbar relative min-h-0">
       {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-24 h-24 rounded-[32px] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/10"
            >
               <Sparkles size={48} className="text-indigo-400" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl font-black text-slate-100 mb-4 tracking-tight"
            >
              我是您的 SRE 智能助手
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base text-slate-500 leading-relaxed max-w-[480px]"
            >
              已接入全量运维数据与知识专家。在这里，您可以咨询系统架构、排查异常、或规划运维任务，我将为您提供跨领域的智能决策支持。
            </motion.p>
          </div>
       ) : (
          <div className="space-y-6 max-w-[900px] mx-auto w-full">
            <AnimatePresence>
              {messages.map((msg: any) => (
                <ChatBubble key={msg.id} message={msg} onAction={onAction} inspectionContext={inspectionContext} />
              ))}
            </AnimatePresence>
            <div ref={chatEndRef} className="h-4" />
          </div>
       )}
    </div>

    <div className="p-8 max-w-[900px] mx-auto w-full shrink-0">
       <div className="bg-[var(--bg-panel)] border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden focus-within:border-indigo-500/30 transition-all">
          {renderInput()}
       </div>
    </div>
  </div>
);

export default function App() {

  const [isDarkMode, setIsDarkMode] = useState(true);

  const [activeMenu, setActiveMenu] = useState<MenuKey>('home');
  const [activeLogAnalysisSummary, setActiveLogAnalysisSummary] = useState<any>(null);
  const [isAnalyzingLogs, setIsAnalyzingLogs] = useState(false);
  const [activeGlobalMenu, setActiveGlobalMenu] = useState<string>('robot');
  const [inspectionState, setInspectionState] = useState<'idle' | 'running' | 'done'>('idle');
  const [anomalyResolved, setAnomalyResolved] = useState(false);
  const [diagnosticMode, setDiagnosticMode] = useState<'overview' | 'chat'>('overview');
  const [inspectionTab, setInspectionTab] = useState<'overview' | 'list' | 'report'>('overview');
  const [inspectionPageLevel, setInspectionPageLevel] = useState<'list' | 'detail'>('list');
  const [selectedInspectionTask, setSelectedInspectionTask] = useState<any>(null);
  const [showInspectionBanner, setShowInspectionBanner] = useState(false);
  const [inspectionAnalysisStatus, setInspectionAnalysisStatus] = useState<Record<string, 'idle' | 'analyzing' | 'done'>>({});
  const [isListening, setIsListening] = useState(false);
  const [selectedKLibIds, setSelectedKLibIds] = useState<string[]>([]);
  const [activeKLibId, setActiveKLibId] = useState<string | null>(null);
  const [knowledgeNavLevel, setKnowledgeNavLevel] = useState<'libs' | 'docs'>('libs');
  const [selectedKDocId, setSelectedKDocId] = useState<string | null>(null);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [inspectionTasks, setInspectionTasks] = useState(INITIAL_INSPECTION_TASKS);
  const [inspectionWizard, setInspectionWizard] = useState<'idle' | 'type_selection' | 'host' | 'rule' | 'schedule' | 'confirmation' | 'success' | 'executing' | 'result'>('idle');
  const [inspectionTaskMode, setInspectionTaskMode] = useState<'scheduled' | 'immediate' | null>(null);
  const [inspectionExecutionProgress, setInspectionExecutionProgress] = useState(0);
  const [inspectionRuleDraft, setInspectionRuleDraft] = useState<any>(null);
  const [inspectionFrequency, setInspectionFrequency] = useState<any>('每天一次');
  const [inspectionTaskName, setInspectionTaskName] = useState('');
  const [selectedInspectionTargets, setSelectedInspectionTargets] = useState<any[]>([]);
  
  // --- Home Notification Banner Scrolling State ---
  const HOT_ALERTS = [
    { id: 'h1', level: '严重', service: 'payment-svc', title: 'P99 延迟 > 2s, 持续 8 分钟', color: 'rose' },
    { id: 'h2', level: '重要', service: 'order-svc', title: 'Connection refused × 581', color: 'orange' },
    { id: 'h3', level: '紧急', service: 'auth-gateway', title: 'HTTP 502 Bad Gateway 突增', color: 'rose' },
    { id: 'h4', level: '重要', service: 'user-profile', title: 'Redis Read Timeout > 500ms', color: 'orange' }
  ];
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);
  const [isHoveringBanner, setIsHoveringBanner] = useState(false);

  useEffect(() => {
    if (isHoveringBanner) return;
    const timer = setInterval(() => {
      setCurrentAlertIndex((prev) => (prev + 1) % HOT_ALERTS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [isHoveringBanner, HOT_ALERTS.length]);

  const handleDiagFromNotification = (alert: any) => {
    const sId = createNewSession('diagnostic', `针对 [${alert.service}] 的实时诊断`);
    const alarmObj = {
      id: alert.id,
      level: alert.level === '严重' || alert.level === '紧急' ? 'P0' : 'P1',
      title: alert.title,
      service: alert.service,
      type: '指标异常',
      startTime: new Date().toLocaleTimeString(),
      duration: '5分钟'
    };
    
    // 直接复用 ActiveIncidentsView 的“一键诊断”底层逻辑函数
    // 延迟一点以确保路由跳转状态过渡顺畅
    setTimeout(() => {
      handleOneClickDiagnose(alarmObj as any, 'general', 'diagnostic', sId);
    }, 100);
  };
  const [editingRule, setEditingRule] = useState<any>(null);
  const handleSyncRules = (updatedRules: any[]) => {
    if (!inspectionRuleDraft) return;
    setInspectionRuleDraft((prev: any) => ({
      ...prev,
      rules: updatedRules,
      rulesCount: updatedRules.length
    }));
  };
  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>(MOCK_HISTORIES);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [showContextBanner, setShowContextBanner] = useState(false);
  const [isKLibPickerOpen, setIsKLibPickerOpen] = useState(false);
  const [pickerDirection, setPickerDirection] = useState<'up' | 'down'>('up');
  const pickerButtonRef = useRef<HTMLButtonElement>(null);
  const pickerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isKLibPickerOpen && 
          pickerContainerRef.current && !pickerContainerRef.current.contains(event.target as Node) &&
          pickerButtonRef.current && !pickerButtonRef.current.contains(event.target as Node)) {
        setIsKLibPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isKLibPickerOpen]);
  
  // Session History States
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const messages = activeSessionId 
    ? (sessions.find(s => s.id === activeSessionId)?.messages || [])
    : (chatHistories[activeMenu] || []);

  const createNewSession = (menuId: string, initialTitle: string = '新对话') => {
    const newId = `session-${Date.now()}`;
    const newSession: Session = {
      id: newId,
      menuId,
      title: initialTitle,
      messages: [],
      timestamp: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    setActiveMenu(menuId as MenuKey);
    // 同时清除该菜单下的旧缓存，以对应新会话
    setChatHistories(prev => ({ ...prev, [menuId]: [] }));
    return newId;
  };

  const loadSession = (session: Session) => {
    setActiveSessionId(session.id);
    setActiveMenu(session.menuId as MenuKey);
    setIsHistoryOpen(false);
  };

  const addMessage = (msg: Message, targetMenu?: MenuKey, targetSessionId?: string | null) => {
    const mId = targetMenu || activeMenu;
    const sId = targetSessionId !== undefined ? targetSessionId : activeSessionId;

    // 1. 更新传统的 chatHistories
    setChatHistories(prev => ({
      ...prev,
      [mId]: [...(prev[mId] || []), msg]
    }));

    // 2. 如果当前有 targetSessionId，更新 sessions 列表
    if (sId) {
      setSessions(prev => prev.map(s => {
        if (s.id === sId) {
          const newMessages = [...s.messages, msg];
          // 如果是第一次用户消息，更新标题
          let newTitle = s.title;
          if (msg.type === 'user' && (s.title === '新对话' || s.title.startsWith('AI '))) {
            newTitle = msg.content.slice(0, 15) + (msg.content.length > 15 ? '...' : '');
          }
          return { ...s, messages: newMessages, title: newTitle };
        }
        return s;
      }));
    }
  };

  const updateMessage = (id: string, updates: Partial<Message>, targetMenu?: MenuKey, targetSessionId?: string | null) => {
    const mId = targetMenu || activeMenu;
    const sId = targetSessionId !== undefined ? targetSessionId : activeSessionId;

    setChatHistories(prev => ({
      ...prev,
      [mId]: (prev[mId] || []).map(m => m.id === id ? { ...m, ...updates } : m)
    }));

    if (sId) {
      setSessions(prev => prev.map(s => {
        if (s.id === sId) {
          return {
            ...s,
            messages: s.messages.map(m => m.id === id ? { ...m, ...updates } : m)
          };
        }
        return s;
      }));
    }
  };

  const [inputValue, setInputValue] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const [selectedAlarm, setSelectedAlarm] = useState<Alarm | null>(null);
  const [isReportDrawerOpen, setIsReportDrawerOpen] = useState(false);
  const [activeReportData, setActiveReportData] = useState<any>(null);
  const [diagnosedAlarms, setDiagnosedAlarms] = useState<Record<string, any>>({});
  const [activeSourceData, setActiveSourceData] = useState<any>(null);
  const [isSourceDrawerOpen, setIsSourceDrawerOpen] = useState(false);


  // AI 日志助手相关状态 (AI Log Assistant States)
  const [currentLogAnalysis, setCurrentLogAnalysis] = useState<any | null>(null);
  const [logAnalysisStep, setLogAnalysisStep] = useState(0);
  const [isExecutionModalOpen, setIsExecutionModalOpen] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [activeLogCluster, setActiveLogCluster] = useState<any>(null);
  const [showLogContextBanner, setShowLogContextBanner] = useState(false);
  const [selectedCapacityResource, setSelectedCapacityResource] = useState<any>(null);
  const [isAnalyzingCapacity, setIsAnalyzingCapacity] = useState(false);

  const handleAlarmClick = (alarm: Alarm) => {
    setSelectedAlarm(alarm);
    setShowContextBanner(true); // 只有点击卡片才自动显胶囊
  };

  const handleMenuChange = (id: string) => {
    setActiveMenu(id as MenuKey);
    // 如果切换到了与当前 activeSession 不匹配的菜单，则清除 activeSessionId，走传统缓存或空会话
    if (activeSessionId) {
      const activeSess = sessions.find(s => s.id === activeSessionId);
      if (activeSess && activeSess.menuId !== id) {
        setActiveSessionId(null);
      }
    }
    // 进入 AI 助手模块时默认展开左侧面板
    if (id !== 'home') {
      setIsLeftPanelCollapsed(false);
    }
  };

  const handleSend = (textOverride?: string) => {
    const contentToUse = textOverride !== undefined ? textOverride : inputValue;
    if (!contentToUse.trim() && attachments.length === 0) return;

    let finalContent = contentToUse;
    let targetMenu: MenuKey = activeMenu;
    let targetSessionId: string | null = activeSessionId;

    // Global Routing Logic (Home & Assistant)
    let detectedIntent = 'general-clarify'; // 默认模糊意图
    let matchedAgent: MenuKey | null = null;
    let cleanContent = contentToUse;

    if (activeMenu === 'home' || activeMenu === 'assistant') {
      const explicitMentions: Record<string, MenuKey> = {
        '@诊断专家': 'diagnostic' as MenuKey,
        '@知识专家': 'knowledge' as MenuKey,
        '@巡检助手': 'inspection' as MenuKey
      };

      // 第一优先级：显式标签
      for (const [tag, menu] of Object.entries(explicitMentions)) {
        if (contentToUse.includes(tag)) {
          detectedIntent = menu;
          matchedAgent = menu;
          cleanContent = contentToUse.replace(tag, '').trim() || '新对话';
          break;
        }
      }

      // 第二优先级：关键词匹配（高置信度）
      if (!matchedAgent) {
        const diagKeywords = ['怎么回事', '原因', '报错', '异常', '慢', '高延迟', 'P99', 'P95', '超时', '失败', '错误', '故障', '分析'];
        const inspectKeywords = ['检查', '巡检', '扫描', '健康', '状态', '有没有问题', 'SLA', '达标', '风险', '配置检查'];
        const knowKeywords = ['知识', '知识库', 'SOP', '文档', '怎么做', '如何', '步骤', '流程', '最佳实践', '规范', '手册'];
        const genCompositeKeywords = ['最近', '总结', '概览', '情况'];
        const genSimpleKeywords = ['你好', '帮我', '什么', '介绍', '能做什么'];

        if (diagKeywords.some(k => contentToUse.includes(k))) {
          detectedIntent = 'diagnostic';
        } else if (inspectKeywords.some(k => contentToUse.includes(k))) {
          detectedIntent = 'inspection';
        } else if (knowKeywords.some(k => contentToUse.includes(k))) {
          detectedIntent = 'knowledge';
        } else if (genCompositeKeywords.some(k => contentToUse.includes(k))) {
          detectedIntent = 'general-composite';
        } else if (genSimpleKeywords.some(k => contentToUse.includes(k))) {
          detectedIntent = 'general-simple';
        } else {
          // LLM Fallback -> general clarify
          detectedIntent = 'general-clarify';
        }
      }

      if (matchedAgent) {
        targetMenu = matchedAgent;
        handleMenuChange(matchedAgent);
        const sessionTitle = cleanContent.slice(0, 30) || '新对话';
        targetSessionId = createNewSession(matchedAgent, sessionTitle);
        finalContent = cleanContent;
      } else {
        // 对于所有 Home 发出的消息（且没有显式标签），先保存在 assistant 里面给用户展示回应
        targetMenu = 'assistant' as MenuKey;
        const sessionTitle = cleanContent.slice(0, 30) || '通用助手';
        targetSessionId = activeSessionId || createNewSession('assistant', sessionTitle);
        finalContent = cleanContent;
      }
    }

    // Auto-create session if missing for modular sends (ensures persistent context in sidebar)
    if (!targetSessionId && targetMenu !== 'home' && targetMenu !== 'assistant') {
      const sessionTitle = contentToUse.trim() || '新对话';
      targetSessionId = createNewSession(targetMenu, sessionTitle.slice(0, 30));
    }

    if (attachments.length > 0) {
      finalContent += "\n\n[附件数据]:\n" + attachments.map(a => `- ${a.title}: ${a.content}`).join("\n");
    }

    const newMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      contentType: 'text',
      content: finalContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // 告警快照自动注入逻辑：当有吸附告警时，先发送快照
    if (showContextBanner && selectedAlarm) {
      addMessage({
        id: (Date.now() - 1).toString(),
        type: 'user',
        contentType: 'alarm_context',
        content: `已关联告警快照: ${selectedAlarm.title}`,
        data: selectedAlarm,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      setShowContextBanner(false);
    }

    // 日志聚类快照自动注入逻辑
    if (showLogContextBanner && activeLogCluster) {
      addMessage({
        id: (Date.now() - 1).toString(),
        type: 'user',
        contentType: 'log_cluster_selection',
        content: '',
        data: activeLogCluster,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      setShowLogContextBanner(false);
    }

    // 巡检快照自动注入逻辑
    if (showInspectionBanner && selectedInspectionTask) {
      addMessage({
        id: (Date.now() - 1).toString(),
        type: 'user',
        contentType: 'inspection_task_select',
        content: `已关联巡检上下文: [${selectedInspectionTask.name}]`,
        data: selectedInspectionTask,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      setShowInspectionBanner(false);
    }

    addMessage(newMsg, targetMenu, targetSessionId);
    setInputValue('');
    setAttachments([]);

    // Homepage Routing Mock AI Response
    if ((activeMenu === 'home' || activeMenu === 'assistant') && !matchedAgent) {
      setIsAIProcessing(true);
      setTimeout(() => {
        setIsAIProcessing(false);
        const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        let aiContent = '';
        let transferOptions: any[] = [];
        
        const attachInput = (opts: any[]) => opts.map(opt => ({ ...opt, originalInput: cleanContent }));

        if (detectedIntent === 'diagnostic') {
          aiContent = `🔍 **识别到系统诊断/故障分析需求**\n\n针对您提出的这类问题，建议使用专门的**诊断专家**模块。它能够整合系统关键指标、异常链路与变更记录，为您提供更具针对性的排查深度与分析视角。您可以点击下方按钮开始：`;
          transferOptions = attachInput([{ id: 'diagnostic', label: '确认转交至 诊断专家' }]);
        } else if (detectedIntent === 'knowledge') {
          aiContent = `📚 **已解析为知识检索意图**\n\n关于「${cleanContent || '相关知识'}」，知识专家能为您直接检索最佳实践手册及过往工单库，帮助迅速定位标准方案。`;
          transferOptions = attachInput([{ id: 'knowledge', label: '确认转交至 知识专家' }]);
        } else if (detectedIntent === 'inspection') {
          aiContent = `🛡️ **识别到系统巡检/状态扫描需求**\n\n针对您提出的这类问题，建议使用专门的**巡检助手**模块。它支持自动化执行巡检任务、扫描存量风险并全面评估系统运行水位。您可以点击下方按钮进入：`;
          transferOptions = attachInput([{ id: 'inspection', label: '确认进入 巡检助手' }]);
        } else if (detectedIntent === 'general-simple') {
          aiContent = `👋 您好！我是您的 SRE 智能助手（SRE Copilot），也是您运维工作的全能中枢。\n\n我不仅可以通过对话直接为您解答日常运维问题、汇总基础信息，还能化身“调度员”，为您一键拉起下方更专业的细分领域专家，开启深度的分析与执行：`;
          transferOptions = attachInput([
            { id: 'diagnostic', label: '诊断专家：分析故障和性能延迟' },
            { id: 'inspection', label: '巡检助手：深度健康扫描巡检' },
            { id: 'knowledge', label: '知识专家：查阅运维 SOP 知识库' }
          ]);
        } else if (detectedIntent === 'general-composite') {
          aiContent = `📊 **系统近期活跃事件与告警全景**\n\n**当前在线报警 (Active Alarms)**\n- 🔴 1 项未恢复 (order-service 错误率飙升)\n- 🟡 2 项低优关注 (Redis 连接池抖动)\n\n**系统整体水位情况**\n- 核心应用延迟上升至 P99 ~ 2.4s (异常波动)\n- CPU 平均水位 72%，状态平稳。`;
          transferOptions = attachInput([
            { id: 'diagnostic', label: '前往 诊断专家 深度分析' },
            { id: 'inspection', label: '通过 巡检助手 扫描详情' }
          ]);
        } else {
          // general-clarify
          aiContent = `🤔 关于您的输入「${cleanContent || '...' }」，意图似乎存在歧义或指向不明确。请问您需要我为您启动哪个特定的专家分析？`;
          transferOptions = attachInput([
            { id: 'diagnostic', label: '诊断专家 (精准故障诊断)' },
            { id: 'inspection', label: '巡检助手 (自动化定期巡检)' },
            { id: 'knowledge', label: '知识专家 (翻阅既有 SOP 和手册)' }
          ]);
        }

        addMessage({
          id: (Date.now() + 1).toString(),
          type: 'ai',
          contentType: 'text',
          content: aiContent,
          data: { transferOptions },
          timestamp: ts
        }, 'assistant', targetSessionId);

      }, 1000);
      return;
    }

    // Inspection Wizard Logic
    if (activeMenu === 'inspection') {
      if (inspectionWizard === 'rule') {
        const originalInput = contentToUse;
        setInspectionRuleInput(originalInput);
        setTimeout(() => {
          // 模拟 NLP 解析逻辑
          const lowerInput = originalInput.toLowerCase();
          const isCpu = lowerInput.includes('cpu');
          const isMem = lowerInput.includes('内存') || lowerInput.includes('mem');
          const isCert = lowerInput.includes('证书') || lowerInput.includes('ssl');

          let triggers = [];
          let actions = [];

          if (isCpu) {
            triggers.push('CPU 使用率 > 80% (持续周期: 5m)');
            actions.push('/scripts/check_cpu_process.sh --threshold 80');
          }
          if (isMem) {
            triggers.push('可用内存 < 15%');
            actions.push('/scripts/dump_memory_stats.py');
          }
          if (isCert) {
            triggers.push('SSL 证书有效期 < 30 天');
            actions.push('/scripts/cert_check.sh --days 30');
          }

          if (triggers.length === 0) {
            triggers.push('全指标健康度综合检测');
            actions.push('/scripts/standard_health_check.sh');
          }

          addMessage({
            id: (Date.now() + 1).toString(),
            type: 'ai',
            contentType: 'rule_review',
            content: "已从您的自然语言中解析并生成了如下结构化规则：",
            data: {
              input: originalInput,
              triggers: triggers,
              actions: actions
            },
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }, 800);
        return;
      }
      if (inspectionWizard === 'schedule') {
        setTimeout(() => {
          // 简单的语义解析逻辑
          let scheduleData = {
            cron: '0 3 * * *',
            description: '每天凌晨 03:00',
            literal: 'Every day at 03:00'
          };

          if (contentToUse.includes('小时') || contentToUse.includes('hour')) {
            scheduleData = { cron: '0 * * * *', description: '每小时整点执行', literal: 'Every hour on the hour' };
          } else if (inputValue.includes('分钟') || inputValue.includes('min')) {
            scheduleData = { cron: '*/15 * * * *', description: '每隔 15 分钟执行', literal: 'Every 15 minutes' };
          } else if (inputValue.includes('周') || inputValue.includes('week')) {
            scheduleData = { cron: '0 0 * * 0', description: '每周日凌晨 00:00', literal: 'Every Sunday at 00:00' };
          }

          addMessage({
            id: (Date.now() + 1).toString(),
            type: 'ai',
            contentType: 'schedule_review',
            content: "已为您完成 Cron 定时任务的转译与对齐：",
            data: { 
              input: inputValue,
              ...scheduleData,
              nextTime: '2026-04-10 03:00 (预计 7 小时 15 分后)'
            },
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }, 800);
        return;
      }
      if (contentToUse.includes('新建巡检任务') || contentToUse.toLowerCase().includes('new task')) {
        handleAction('NEW_TASK');
        setInputValue('');
        return;
      }
    }

    // Simulate AI response for attachments
    if (attachments.length > 0) {
      setTimeout(() => {
        addMessage({
          id: (Date.now() + 1).toString(),
          type: 'ai',
          contentType: 'text',
          content: `收到了你挂载的 ${attachments.length} 个附件。正在针对这些日志模版/详情进行深度推演分析...\n\n初步发现：其中包含的 ${attachments[0].title} 显示该异常主要集中在 ${activeMenu === 'logs' ? 'payment-svc' : '当前上下文'} 的数据库连接池，建议检查网络隔离策略。`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }, 1000);
    } else if (activeMenu === 'knowledge') {
      setIsAIProcessing(true);


      const aiStatusMsgId = (Date.now() + 1).toString();
      const aiConclusionMsgId = (Date.now() + 2).toString();
      const currentTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // 命中特定案例：Pod 持续重启
      const isPodRestartQ = contentToUse.includes('pod') && contentToUse.includes('重启');

      const libStatusPrefix = selectedKLibIds.length > 0 
        ? `正在针对 [${selectedKLibIds.length}] 个知识库检索`
        : "正在进行全局知识库检索";

      addMessage({
        id: aiStatusMsgId,
        type: 'ai',
        contentType: 'text',
        content: isPodRestartQ ? "🔍 正在针对 'Pod 持续重启' 场景检索标准化 SOP..." : `🔍 ${libStatusPrefix}并解析问题...`,
        timestamp: currentTimestamp,
        hideSourceButton: true
      });

      // Step 2: Add Retrieval Card to the first message after delay
      setTimeout(() => {
        const podRetrievalData = {
          libCount: selectedKLibIds.length,
          docCount: 156,
          hitCount: 4,
          evidenceCount: 8,
          keywords: "Pod 重启, CrashLoopBackOff, 探针策略",
          topDocs: [
            { title: 'Kubernetes 稳定性治理规范', score: 0.98 },
            { title: 'Pod 重启故障排查 SOP', score: 0.95 },
            { title: '核心业务发布校验准则', score: 0.82 }
          ],
          sources: [
            {
              libId: 'sop', docId: 's1', title: 'Pod 重启故障排查 SOP', chapter: '2. 常见原因分析',
              author: '架构组', attributes: ['SOP', '高频'], score: 0.95,
              fragment: '发布后最常见的重启原因为 <span class=\"text-indigo-400 font-bold bg-indigo-500/10 px-1 rounded\">CrashLoopBackOff</span>。这通常由启动脚本依赖缺失、环境变量配置错误或健康检查（Liveness Probe）配置不当导致...'
            },
            {
              libId: 'sop', docId: 's4', title: 'Kubernetes 稳定性治理规范', chapter: '4.2 资源限制策略',
              author: '运维部', attributes: ['规范', '核心'], score: 0.98,
              fragment: '若应用启动瞬间内存消耗激增（如加载大字典文件），极易触发 <span class=\"text-indigo-400 font-bold bg-indigo-500/10 px-1 rounded\">OOM Killer</span>。建议设置合理的 memory requests 与 limits...'
            }
          ]
        };

        const defaultRetrievalData = {
          libCount: selectedKLibIds.length,
          docCount: 128,
          hitCount: 5,
          evidenceCount: 12,
          keywords: contentToUse.slice(0, 15) + (contentToUse.length > 15 ? '...' : ''),
          topDocs: [
            { title: 'Pod 重启排查 SOP', score: 0.94 },
            { title: 'Kubernetes 资源调度深度解析', score: 0.88 },
            { title: '核心结算链路 P0 级事故复盘', score: 0.79 }
          ],
          sources: [
            {
              libId: 'sop', docId: 's1', title: 'Payment-svc 内存溢出处理预案', chapter: '2. 应急响应步骤',
              author: '张三', attributes: ['SOP', '紧急'], score: 0.94,
              fragment: '当观察到 Pod 处于 <span class=\"text-indigo-400 font-bold bg-indigo-500/10 px-1 rounded\">CrashLoopBackOff</span> 时，通常意味着应用进程启动后立即退出，应优先检查环境变量与配置映射...'
            },
            {
              libId: 'sop', docId: 's4', title: '数据库 CPU 100% 应急处理', chapter: '1. 应急干预',
              author: '刘SRE', attributes: ['SOP', '高压'], score: 0.88,
              fragment: '若发现大量相同的 <span class=\"text-indigo-400 font-bold bg-indigo-500/10 px-1 rounded\">慢 SQL</span> 阻塞了执行通道，立即执行 KILL 清理并下发阻断规则。'
            }
          ]
        };

        updateMessage(aiStatusMsgId, {
          content: "📖 正在从选中的知识库中深度提取相关证据...",
          retrievalData: isPodRestartQ ? podRetrievalData : defaultRetrievalData
        });
        scrollToBottom();

        // Step 3: Wait for animations to finish, then send the Conclusion Message (Separate Bubble)
        setTimeout(() => {
          // Finalize Status Message
          updateMessage(aiStatusMsgId, { content: "📖 检索完成。已从选中的知识库中提取核心证据。" });

          const retrievalData = isPodRestartQ ? podRetrievalData : defaultRetrievalData;

 
          const podConclusion = `针对您反馈的 **“发布后 Pod 持续重启”** 问题，基于知识库中的标准化排查 SOP [1]，深度分析结论如下：

### 1. 快速诊断建议 (Triage Path)
*   **🚩 检查启动依赖** [1]：确认 ConfigMap 或 Secret 是否已正确挂载。排查发现 40% 的重启由环境变量未解密或配置文件路径错误导致。
*   **🚩 核查探针参数** [2]：Liveness 探针 \`initialDelaySeconds\` 是否短于应用真实启动时间（当前建议设为 30s+），防止应用尚未就绪即被杀死。

### 2. 状态深度解析 (Status Deep Dive)
| 状态标识 | 核心诱因 | 典型解决方案 |
| :--- | :--- | :--- |
| **OOMKilled** | 内存 Limit 触发 | 调整 \`resources.limits.memory\` 或优化应用内存分配 |
| **CrashLoopBackOff** | 进程启动后立即退出 | 检查 Entrypoint 权限、数据库连接超时或启动 Panic 日志 |
| **ImagePullFailure** | 镜像仓库认证失效 | 核查 \`imagePullSecrets\` 配置及私有仓库网络通达性 |

### 3. 专家排查指令 (Expert Commands)
请在控制台依次执行以下标准诊断命令：
\`\`\`bash
# 1. 查看最后一次崩溃前的容器日志
kubectl logs <pod-name> --previous -n <namespace>

# 2. 检索导致 Pod 异常的核心集群事件 (Events)
kubectl describe pod <pod-name> | grep -A 10 Events

# 3. 查看资源规格与实时限制状态
kubectl get pod <pod-name> -o yaml | grep -A 5 resources
\`\`\`

### 4. 优化建议 [1]
建议在预发环境开启 **StartupProbe**（启动探针），利用其特有的容错期保护，避免在大规模发布时因冷启动延迟引发的集群级重启级联反应。`;

          const defaultConclusion = `基于您提供的问题，我已从选中的核心知识库中为您提取了相关的标准排查流程 [1]。主要涉及以下核心步骤：\n\n**1. 初步分析结论：**\n该现象通常由 Pod 持续发生的 [CrashLoopBackOff] 状态引起 [1]，这与配置参数错误、启动探针超时或底层资源分配不均（CPU Throttle）密切相关 [2]。\n\n**2. 核心排查建议：**\n- **探测器配置**：检查存活探针（liveness）和就绪探针（readiness）的 \`initialDelaySeconds\` 是否预留了足够的启动预热时间 [1]。`;

          const fullContent = isPodRestartQ ? podConclusion : defaultConclusion;

          addMessage({
            id: aiConclusionMsgId,
            type: 'ai',
            contentType: 'text',
            content: fullContent,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            hideRetrievalCard: true,
            retrievalData: retrievalData
          });
          setIsAIProcessing(false);
          scrollToBottom();
        }, 3400); 
      }, 1500);
    } else if (activeMenu !== 'home' && !isAIProcessing) {
      // Default Fallback AI Response for other modules
      setIsAIProcessing(true);
      setTimeout(() => {
        setIsAIProcessing(false);
        const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        let aiContent = '';
        switch(activeMenu) {
          case 'diagnostic':
            aiContent = "🔧 **诊断引擎已接收**\n\n我已将该信息纳入当前的故障分析上下文。正在调取相关指标的分钟级对齐数据，请稍候...";
            break;
          case 'logs':
            aiContent = "📝 **日志解析中**\n\n已尝试在大规模日志流水中匹配您描述的关键词。正在通过多维聚类寻找异常模式...";
            break;
          case 'capacity':
            aiContent = "📊 **容量模型重算**\n\n已调取该资源的实时负载历史。正在进行资源水位推演以预测未来 24 小时内的瓶颈风险...";
            break;
          case 'assistant':
            aiContent = "✨ **智能助手正在思考**\n\n收到您的请求。我正在整合诊断、巡检与知识库等多维度数据为您提供全景建议...";
            break;
          default:
            aiContent = "🤖 **AI 正在处理**\n\n我已经收到了您的信息，正在为您检索相关上下文并在后台处理中。您可以继续补充更多细节。";
        }

        addMessage({
          id: (Date.now() + 1).toString(),
          type: 'ai',
          contentType: 'text',
          content: aiContent,
          timestamp: ts
        }, targetMenu, targetSessionId);
      }, 1200);
    }
  };

  const addAttachment = (item: Omit<Attachment, 'id'>) => {
    const newAttr: Attachment = {
      ...item,
      id: Date.now().toString()
    };
    setAttachments(prev => [...prev, newAttr]);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleOneClickDiagnose = (alarm: Alarm, theme: 'general' | 'slow_query' = 'general', targetMenu?: MenuKey, targetSessionId?: string | null) => {
    setDiagnosticMode('chat');
    setIsAIProcessing(true);
    setSelectedAlarm(alarm);    // 保留上下文，但接下来不显胶囊
    setShowContextBanner(false); // 一键诊断不带胶囊

    // 0. 自动注入告警上下文快照 (Snapshot Injection)
    const contextMsg: Message = {
      id: `ctx-${Date.now()}`,
      type: 'user',
      contentType: 'alarm_context',
      content: `[Snapshot] ${alarm.title}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      data: alarm
    };
    addMessage(contextMsg, targetMenu, targetSessionId);

    // 1. 系统发起诊断
    const userPrompt = theme === 'slow_query'
      ? `基于当前告警上下文，启动针对数据库慢查询的深度调查。`
      : `针对告警 ID: ${alarm.id} (${alarm.title}) 进行标准化三步诊断流程。`;

    const diagnoseMsg: Message = {
      id: (Date.now() + 1).toString(),
      type: 'user',
      contentType: 'text',
      content: userPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    addMessage(diagnoseMsg, targetMenu, targetSessionId);

    const messageId = (Date.now() + 2).toString();

    // Step 1: Topology Discovery
    setTimeout(() => {
      addMessage({
        id: messageId,
        type: 'ai',
        contentType: 'analysis',
        content: theme === 'slow_query' ? '正在检索数据库调用链路拓扑...' : 'AI 诊断专家正在深度分析拓扑结构，精准识别受影响链路...',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        data: {
          currentStep: 1,
          taskName: alarm.title,
          topology: ['智能运维平台', 'beehive-core', 'vserver-prod']
        }
      }, targetMenu, targetSessionId);
    }, 800);

    // Step 2: Multi-Agent Parallel Analysis (专家并行诊断)
    setTimeout(() => {
      updateMessage(messageId, {
        data: {
          currentStep: 2,
          taskName: alarm.title,
          topology: ['智能运维平台', 'beehive-core', 'vserver-prod'],
          agents: [
            { name: 'Analyzer-01 (全链路响应分析)', status: 'success', detail: '已确认链路延迟在合理范围 (P99 < 50ms)' },
            { name: 'Analyzer-02 (监控指标核查)', status: 'warning', detail: '检测到 vserver 监控数据缺失断点', error: true }
          ]
        }
      }, targetMenu, targetSessionId);
    }, 2500);

    // Step 3: Summary & Conclusion (汇总与自愈方案)
    setTimeout(() => {
      setIsAIProcessing(false);
      const reportData = {
        id: alarm.id,
        currentStep: 3,
        taskName: alarm.title,
        topology: ['智能运维平台', 'beehive-core', 'vserver-prod'],
        agents: [
          { name: 'Analyzer-01 (全链路响应分析)', status: 'success', detail: '已确认链路延迟在合理范围 (P99 < 50ms)' },
          { name: 'Analyzer-02 (监控指标核查)', status: 'warning', detail: '检测到 vserver 监控数据缺失断点', error: true }
        ],
        conclusion: '诊断结论：由于 vserver 节点监控采集插件挂起，导致 Prometheus 无法拉取指标，触发误报。建议执行自愈操作以恢复采集。',
        recommendations: [
          { title: '重启监控采集插件', description: '执行脚本：/usr/local/bin/restart_exporter.sh', risk: '低', effect: '恢复 Prometheus 指标采集' },
          { title: '清理僵尸进程', description: '扫描并清理 node-exporter 相关的僵尸进程', risk: '极低', effect: '释放系统资源' }
        ],
        // 深度报告字段
        faultOverview: '本次故障由 vserver 节点监控采集配置丢失引起，导致智能体无法获取实时指标，触发系统级误报。',
        impactScope: {
          nodes: ['vserver-prod-01', 'vserver-prod-02'],
          userVolume: '约 12,400 用户',
          level: 'P2 - 业务监控受损'
        },
        rootCause: {
          coreConclusion: '核心诱因为 node-exporter 进程于 15:10 进入挂起状态，导致指标采集链路中断。',
          propagationChain: [
            { from: 'vserver', to: 'Prometheus', reason: '连接拒绝', status: 'error' },
            { from: 'Prometheus', to: 'Grafana', reason: '数据断流', status: 'warning' },
            { from: 'AlertManager', to: 'SRE Console', reason: '异常告警', status: 'active' }
          ],
          evidenceMetrics: [
            ['scrape_duration', '0ms', '150ms', '异常'],
            ['up_status', '0', '1', '异常'],
            ['samples_scraped', '0', '1240', '异常']
          ]
        },
        confidence: 98
      };

      setDiagnosedAlarms(prev => ({ ...prev, [alarm.id]: reportData }));
      updateMessage(messageId, { data: reportData }, targetMenu, targetSessionId);
    }, 4500);
  };


  const handleMicClick = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    // Mock Transcription logic: Fill a relevant SRE command after 2.5s
    setTimeout(() => {
      setIsListening((current) => {
        if (current) {
          setInputValue(prev => {
            const tagMatch = prev.match(/@(诊断专家|巡检助手|知识专家)/);
            const cmd = "帮我分析最近一小时的 payment-svc 错误日志并总结根因";
            return tagMatch ? `${tagMatch[0]} ${cmd}` : cmd;
          });
          return false;
        }
        return false;
      });
    }, 2500);
  };

  const handleAction = (action: string, data?: any) => {
    if (action === 'REQUEST_TRANSFER') {
      if (data && data.id) {
        const targetMenu = data.id;
        handleMenuChange(targetMenu);
        const originalInput = data.originalInput || '新转交查询';
        const sessionTitle = originalInput.slice(0, 30) || '转交会话';
        const newSessionId = createNewSession(targetMenu as MenuKey, sessionTitle);

        setTimeout(() => {
          // Send automatic prompt simulating the jump context
          addMessage({
            id: Date.now().toString(),
            type: 'user',
            contentType: 'text',
            content: `[系统推荐转交]\n已从通用助手转出，相关上下文需求：${originalInput}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }, targetMenu as MenuKey, newSessionId);

          setTimeout(() => {
            addMessage({
              id: (Date.now() + 1).toString(),
              type: 'ai',
              contentType: 'text',
              content: `您好，我已经接收了由智能助手转交的相关上下文指令并分析「${originalInput}」，正在为您进行深度研判...您也可以在我的专业操作面板上继续提问。`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }, targetMenu as MenuKey, newSessionId);
          }, 800);
        }, 300);
      }
      return;
    }

    if (action === 'SELECT_LOG_CLUSTER') {
      setActiveLogCluster(data);
      setShowLogContextBanner(true);
      return;
    }

    if (action === 'REMOVE_LOG_CONTEXT') {
      setShowLogContextBanner(false);
      return;
    }

    if (action === 'SELECT_RESOURCE') {
      const resource = data;
      setSelectedCapacityResource(resource);
      if (activeMenu === 'capacity') {
        setIsAnalyzingCapacity(true);
        // Clear previous capacity chat
        setChatHistories(prev => ({ ...prev, capacity: [] }));
        
        const addCapMessage = (msg: Omit<Message, 'timestamp' | 'id'>) => {
          const newMsg: Message = {
            ...msg,
            id: `cap-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setChatHistories(prev => ({ ...prev, capacity: [...(prev.capacity || []), newMsg] }));
        };

        // Step 1: Resource Scan
        setTimeout(() => {
          addCapMessage({
            type: 'ai',
            contentType: 'text',
            content: `🔍 正在对 ${resource.name} 进行全维度水位扫描...`
          });
        }, 800);

        // Step 2: Anomaly Detection
        setTimeout(() => {
          addCapMessage({
            type: 'ai',
            contentType: 'text',
            content: `⚠️ 检测到 ${resource.name} 在 24h 内 CPU 持续升高，当前利用率已达 ${resource.usage}，处于 ${resource.tag} 状态。`
          });
        }, 2500);

        // Step 3: Correlation Analysis
        setTimeout(() => {
          addCapMessage({
            type: 'ai',
            contentType: 'text',
            content: `🔗 关联分析显示：该节点平均负载 (Load) 明显高于集群均值，且 mysql-primary IOPS 同步上升，存在资源争抢风险。`
          });
        }, 4500);

        // Step 4: Final Recommendation
        setTimeout(() => {
          addCapMessage({
            type: 'ai',
            contentType: 'text',
            content: `💡 决策建议：建议结合 HPA 策略紧急扩容容器副本，并核查 Node-03 的物理瓶颈。已为您在中间面板更新了分层因果拓扑视图。`
          });
          setIsAnalyzingCapacity(false);
        }, 6500);
      }
      return;
    }

    if (action === 'START_LOG_ANALYSIS') {
      const cluster = data;
      setActiveLogCluster(cluster);
      
      // Clear previous log messages to start fresh
      setChatHistories(prev => ({ ...prev, logs: [] }));
      setIsAnalyzingLogs(true);
      setShowLogContextBanner(false); // 开启直接分析时隐藏吸附条
      
      const addLogMessage = (msg: Omit<Message, 'timestamp' | 'id'>) => {
        const newMsg: Message = {
          ...msg,
          id: `log-f-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatHistories(prev => ({
          ...prev,
          logs: [...(prev.logs || []), newMsg]
        }));
      };

      // Step 0: User Message (The selected cluster)
      addLogMessage({
        type: 'user',
        contentType: 'log_cluster_selection',
        content: `开始分析异常聚类: ${cluster.title}`,
        data: cluster
      });

      setActiveLogAnalysisSummary({
        title: cluster.title,
        service: cluster.service,
        status: 'analyzing',
        confidence: 0,
        summary: '正在智能聚类分析并提取日志上下文...'
      });

      // Stage 1: Initialization
      setTimeout(() => {
        addLogMessage({
          type: 'ai',
          contentType: 'log_analysis_init',
          content: '问题识别完成。分析对象已确认为：' + cluster.title,
          data: { object: cluster.title, services: [cluster.service, 'order-service'] }
        });
      }, 500);

      // Stage 2: Retrieval
      setTimeout(() => {
        addLogMessage({
          type: 'ai',
          contentType: 'log_analysis_retrieval',
          content: '正在检索相关日志并提取关键上下文信息...',
          data: {
            metrics: { hitCount: 1245, timeRange: '最近5分钟', serviceCount: 3, recallRate: '92%' },
            snippet: `[ERROR] Connection refused to database pool\nat ConnectionPool.getConnection(...)\nat com.example.service.DBClient.query(DBClient.java:124)\nat com.example.payment.PaymentService.processOrder(PaymentService.java:452)`
          }
        });
      }, 2000);

      // Stage 3: Correlation
      setTimeout(() => {
        addLogMessage({
          type: 'ai',
          contentType: 'log_analysis_correlation',
          content: '已完成全路径链路关联分析，发现异常传递路径：',
          data: {
            nodes: [
              { id: 'n1', label: 'Ingress', status: 'normal' },
              { id: 'n2', label: 'Payment', status: 'normal' },
              { id: 'n3', label: 'Order', status: 'warning' },
              { id: 'n4', label: 'DB Pool', status: 'critical' }
            ],
            failureRate: '87%'
          }
        });
      }, 4000);

      // Stage 4: Evidence
      setTimeout(() => {
        addLogMessage({
          type: 'ai',
          contentType: 'log_analysis_evidence',
          content: '经过多维证据收敛，当前锁定以下核心事实：',
          data: {
            evidence: [
              '1245条数据库连接失败相关日志，堆栈指向同一连接池实例',
              '故障开始时间点（10:23:15）与 Payment-service CPU 抖动完全重合',
              'DB 代理节点后端连接池健康检查失败率在 2 分钟内由 1% 飙升至 87%'
            ]
          }
        });
      }, 6000);

      // Stage 5: Diagnosis
      setTimeout(() => {
        addLogMessage({
          type: 'ai',
          contentType: 'log_analysis_diagnosis',
          content: '最终诊断报告：',
          data: {
            rootCause: '数据库侧主从切换引发的连接池实例僵死（Stale Connections）',
            logicChain: '连接失效 → 连接池回收失败 → 阻塞主线程 → 业务超时',
            uncertainty: '数据库底层物理节点监控数据当前不可达，需人工核查存储层状态'
          }
        });
        setActiveLogAnalysisSummary(prev => ({
          ...prev,
          status: 'completed',
          confidence: 87,
          summary: '支付服务错误率激增，初步确认为数据库连接池实例僵死（Stale Connections）。'
        }));
      }, 8000);

      // Stage 6: Action Recommendations
      setTimeout(() => {
        addLogMessage({
          type: 'ai',
          contentType: 'log_analysis_action',
          content: '根据诊断结论，系统为您生成了以下止损与修复方案：',
          data: {
            groups: [
              {
                title: '立即缓解',
                type: 'critical',
                actions: [
                  { label: '执行连接池手动重启', desc: '清空并重新初始化当前支付服务连接池', payload: 'RESTART_POOL' },
                  { label: '检查数据库主从状态', desc: '确认是否存在物理节点只读或锁定状态', payload: 'CHECK_DB' }
                ]
              },
              {
                title: '排查辅助',
                type: 'warning',
                actions: [
                  { label: '生成堆栈快照', desc: '分析是否存在未回收的幽灵连接', payload: 'HEAP_DUMP' },
                  { label: '查看连接池实时配置', desc: '确认超时设置是否符合预期', payload: 'VIEW_CONFIG' }
                ]
              },
              {
                title: '远期修复 (Long-term)',
                type: 'info',
                actions: [
                  { label: '扩容连接池队列深度', desc: '增强数据库切换时的鲁棒性', payload: 'CONFIG_EXPAND' },
                  { label: '优化慢连接心跳检测频率', desc: '加速死连接的检测与回收', payload: 'CONFIG_OPTIMIZE' }
                ]
              }
            ]
          }
        });
        setIsAnalyzingLogs(false);
      }, 10000);
      
      return;
    }

    if (action === 'CLEAR_LOGS_HISTORY') {
      setChatHistories(prev => ({
        ...prev,
        logs: []
      }));
      setActiveLogCluster(null);
      return;
    }

    if (action === 'EXECUTE_LOG_ACTION') {
      setIsExecutionModalOpen(true);
      return;
    }
    if (action === 'OPEN_SOURCE_TRACE') {
      setActiveSourceData(data);
      setIsSourceDrawerOpen(true);
      return;
    }
    if (action === 'SEND_PROMPT') {
      handleSend(data);
      return;
    }
    if (action === 'VIEW_FULL_TEXT') {
      setActiveKLibId(data.libId);
      setKnowledgeNavLevel('docs');
      setSelectedKDocId(data.docId);
      setIsSourceDrawerOpen(false); // Close drawer after jumping
      return;
    }
    if (action === 'SWITCH_TO_AI_QA') {
      setSelectedKDocId(null);
      return;
    }
    if (action === 'JOIN_QA_SCOPE') {
      const docId = data?.docId;
      addMessage({
        id: Date.now().toString(),
        type: 'user',
        contentType: 'text',
        content: `请重点参考 ${docId} 文档解答我的问题。`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      setSelectedKDocId(null);
      return;
    }
    // === 自愈与授权子工作流 ===
    if (action === 'START_INSPECTION_ANALYSIS') {
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
        updateMessage(aiMsgId, {
          data: {
            format: '0412_phased',
            currentStep: 2,
            stage1: {
              objectTable: [['对象名称', task.target], ['类型', 'Service'], ['环境', 'prod'], ['集群', 'cluster-A']],
              metricsTable: [['CPU使用率', '92%', '80%', '异常'], ['内存使用率', '88%', '80%', '偏高'], ['错误率', '3.2%', '1%', '异常']]
            },
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
              comparisonTable: [['CPU使用率', '92%', '68%', '80%'], ['内存使用率', '88%', '64%', '80%'], ['错误率', '3.2%', '0.8%', '1%']],
              correlationTable: [['CPU', '高', '持续上升', '与线程数正相关'], ['内存', '高', '持续上升', '无明显 GC 回收'], ['错误率', '异常', '波动上升', '与流量无直接关联']]
            }
          }
        });
      }, 3500);

      // Step 3: Diagnosis (6s)
      setTimeout(() => {
        updateMessage(aiMsgId, {
          data: {
            format: '0412_phased',
            currentStep: 3,
            stage1: {
              objectTable: [['对象名称', task.target], ['类型', 'Service'], ['环境', 'prod'], ['集群', 'cluster-A']],
              metricsTable: [['CPU使用率', '92%', '80%', 'Critical'], ['内存使用率', '88%', '80%', 'High'], ['错误率', '3.2%', '1%', 'Critical']]
            },
            stage2: {
              charts: [
                { title: 'CPU Usage Trend', labels: ['10:00', '10:30'], data: [65, 92] },
                { title: 'Memory Usage Trend', labels: ['10:00', '10:30'], data: [60, 88] }
              ],
              comparisonTable: [['CPU使用率', '92%', '68%', '80%']],
              correlationTable: [['CPU', '高', '持续上升', '与线程数正相关']]
            },
            stage3: {
              candidateTable: [['资源压力', 'CPU + 内存同步上升', '资源占用持续增加'], ['异常负载', '错误率上升', '但未与流量直接关联']],
              evidenceList: ['CPU 与内存呈现高度同步上升趋势', '内存未观测到明显回收行为', '错误率存在异常波动']
            }
          }
        });
      }, 6000);

      // Step 4: Conclusion (8.5s)
      setTimeout(() => {
        setIsAIProcessing(false);
        setInspectionAnalysisStatus(prev => ({ ...prev, [task.name]: 'completed' }));
        updateMessage(aiMsgId, {
          data: {
            format: '0412_phased',
            currentStep: 4,
            stage1: {
              objectTable: [['对象名称', task.target], ['类型', 'Service'], ['环境', 'prod'], ['集群', 'cluster-A']],
              metricsTable: [['CPU使用率', '92%', '80%', 'Critical'], ['内存使用率', '88%', '80%', 'High'], ['错误率', '3.2%', '1%', 'Critical']]
            },
            stage2: {
              charts: [{ title: 'CPU Usage Trend', labels: ['10:00', '10:30'], data: [65, 92] }],
              comparisonTable: [['CPU使用率', '92%', '68%', '80%']],
              correlationTable: [['CPU', '高', '持续上升', '与线程数正相关']]
            },
            stage3: {
              candidateTable: [['资源压力', 'CPU + 内存同步上升', '资源占用持续增加']],
              evidenceList: ['CPU 与内存呈现高度同步上升趋势', '内存未观测到明显回收行为']
            },
            stage4: {
              summaryTable: [['问题类型', '资源使用异常'], ['影响范围', '当前服务实例'], ['状态', '持续中']],
              judgment: '基于当前指标趋势与关联分析，初步判断存在资源压力风险，可能影响服务稳定性。建议查看详细日志并关注近期变更。',
            }
          }
        });
      }, 8500);
      return;
    }

    if (action === 'ACT_SELF_HEAL') {
      addMessage({
        id: Date.now().toString(),
        type: 'ai',
        contentType: 'action_confirm',
        content: '基于诊断结论，系统已生成针对性自愈方案。该操作属于高危指令，请在核对 Dry-run 预览后进行最终授权执行。',
        data: {
          title: '重置并重启监控采集插件 (OTel)',
          risk: '⚠️ CRITICAL / 核心中间件变更',
          preview: `+ config.yaml (Patch):\n+   receivers:\n+     prometheus:\n+       config:\n+         scrape_interval: 15s\n+         scrape_timeout: 10s\n-   scrape_interval: 1m`,
          targets: ['vserver-prod-01 (172.29.23.11)', 'vserver-prod-02 (172.29.23.12)']
        },
        timestamp: new Date().toLocaleTimeString()
      });
      return;
    }

    if (action === 'AUTHORIZE_HEAL_EXECUTION') {
      const executionId = Date.now().toString();
      const initialData = {
        status: 'running',
        progress: 0,
        logs: ['[INIT] 执行引擎就绪，分配任务 ID: HEAL-99201', '[AUTH] 权限校验成功: SRE-Admin-Role (已确认)']
      };

      addMessage({
        id: executionId,
        type: 'ai',
        contentType: 'action_execution',
        content: '自愈执行流水线已启动，正在实时同步执行日志...',
        data: initialData,
        timestamp: new Date().toLocaleTimeString()
      });

      // 实时日志流模拟
      const fullLogs = [
        '[PRE] 目标节点连通性测试 (Connectivity Check)...',
        '[PRE] 节点 [vserver-prod-01] 在线，磁盘/内存水位正常 ✅',
        '[EXEC] 下发配置重置指令 (Apply Config Patch)...',
        '[EXEC] 正在停止旧采集进程 [PID: 2351]...',
        '[EXEC] 启动新进程并加载 Patch 配置 (Hot Reload)...',
        '[POST] 正在检测数据回传链路 (Sink Verification)...',
        '[POST] Prometheus 指标抓取已恢复 (HTTP 200 OK) ✅',
        '[FINAL] 监控采集链路已完整恢复，诊断任务完成。'
      ];

      let currentLogIndex = 0;
      let currentExecData = { ...initialData };

      const logInterval = setInterval(() => {
        if (currentLogIndex < fullLogs.length) {
          const logEntry = fullLogs[currentLogIndex];
          currentExecData = {
            ...currentExecData,
            progress: Math.min(10 + (currentLogIndex * 12), 95),
            logs: [...currentExecData.logs, logEntry]
          };
          
          updateMessage(executionId, { data: currentExecData });
          currentLogIndex++;
        } else {
          clearInterval(logInterval);
          updateMessage(executionId, { 
            data: { ...currentExecData, status: 'success', progress: 100 } 
          });
        }
      }, 1000);
      return;
    }

    // 专题诊断触发逻辑
    if (action === 'ACT_SLOW_QUERRY' && selectedAlarm) {
      handleOneClickDiagnose(selectedAlarm, 'slow_query');
      return;
    }
    if ((action === 'ACT_ROOT_CASE' || action === 'ACT_METRIC_DRILL') && selectedAlarm) {
      handleOneClickDiagnose(selectedAlarm, 'general');
      return;
    }

    // 操作建议执行全流程逻辑
    if (action === 'restart_pod' || action === 'dump_heap') {
      const isRestart = action === 'restart_pod';
      addMessage({
        id: Date.now().toString(),
        type: 'ai',
        contentType: 'action_confirm',
        content: isRestart ? '准备执行服务重启操作...' : '准备执行 Heap Dump 采样...',
        data: {
          title: isRestart ? '滚动重启 order-service 负载实例' : '生成 order-service 内存堆栈快照',
          impact: isRestart ? '当前服务将中断约 30 秒，健康检查路径将短暂失效。' : '导出过程将占用约 10% 的磁盘 I/O，并可能短暂卡顿 GC。',
          risk: isRestart ? 'High' : 'Low',
          action: isRestart ? 'CONFIRM_RESTART' : 'CONFIRM_DUMP'
        },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      return;
    }

    if (action === 'EXECUTE_ACTION') {
      const executionId = Date.now().toString();
      const isDump = data?.title?.includes('Dump');

      addMessage({
        id: executionId,
        type: 'ai',
        contentType: 'action_execution',
        content: '正在启动自动化流水线...',
        data: {
          status: 'running',
          progress: 0,
          logs: ['初始化执行引擎...', '正在进行安全合规校验 (Pre-check)...', '权限验证通过，准备下发指令...']
        },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      // 模拟执行进度
      setTimeout(() => {
        updateMessage(executionId, {
          data: {
            status: 'running',
            progress: 45,
            logs: [
              '初始化执行引擎...',
              '正在进行安全合规校验 (Pre-check)...',
              '权限验证通过，准备下发指令...',
              isDump ? '开启内核级采样跟踪...' : '正在停止后端实例 (payment-svc-7d4f)...',
              isDump ? '正在导出 HPROF 文件至 OSS...' : '实例已停止，正在拉起新负载...'
            ]
          }
        });
      }, 1500);

      setTimeout(() => {
        updateMessage(executionId, {
          data: {
            status: 'success',
            progress: 100,
            logs: [
              '初始化执行引擎...',
              '正在进行安全合规校验 (Pre-check)...',
              '权限验证通过，准备下发指令...',
              isDump ? '开启内核级采样跟踪...' : '正在停止后端实例 (payment-svc-7d4f)...',
              isDump ? '正在导出 HPROF 文件至 OSS...' : '实例已停止，正在拉起新负载...',
              isDump ? '文件导出成功: order_1502.hprof ✅' : '服务启动成功，健康检查通过 ✅',
              '开始进行后置自动化指标回检...'
            ]
          }
        });
      }, 3500);
      return;
    }

    if (action === 'CANCEL_ACTION' || action === 'CLEAR_ALARM') {
      setSelectedAlarm(null);
      setShowContextBanner(false);
      if (action === 'CANCEL_ACTION') {
        addMessage({
          id: Date.now().toString(),
          type: 'ai',
          contentType: 'text',
          content: '❌ 操作已取消。已锁定当前环境状态，您可以继续提问或尝试其他诊断路径对话。',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
      return;
    }

    if (action === 'VIEW_REPORT') {
      setActiveReportData(data);
      setIsReportDrawerOpen(true);
      return;
    }

    // AI 诊断专家流程逻辑
    if (activeMenu === 'diagnostic') {
      // 处理来自胶囊上方的快速指令按钮
      if (action.startsWith('ACT_')) {
        setShowContextBanner(false);

        const labels: Record<string, string> = {
          'ACT_PROC': '分析高负载进程',
          'ACT_STACK': '拉取堆栈日志',
          'ACT_RESTART': '尝试重启实例',
          'ACT_TRACE': '链路追踪',
          'ACT_PING': '测试连通性',
          'ACT_SLOW': '查看慢查询',
          'ACT_LOCK': '检查死锁状态',
          'ACT_ROOT': '智能根因推演',
          'ACT_IMPACT': '影响范围分析'
        };

        if (action === 'ACT_RESTART') {
          handleAction('REBOOT');
          return;
        }

        // 核心变更：分两条消息发送
        // 1. 发送独立的告警快照消息（用户发出）
        const contextMsg: Message = {
          id: `ctx-${Date.now()}`,
          type: 'user', // 由用户发出，将右对齐展示
          contentType: 'alarm_context',
          data: selectedAlarm,
          content: '',
          timestamp: new Date().toLocaleTimeString()
        };
        addMessage(contextMsg);

        // 2. 发送用户指令消息（蓝色气泡）
        const userMsg: Message = {
          id: Date.now().toString(),
          type: 'user',
          contentType: 'text',
          content: labels[action] || action,
          timestamp: new Date().toLocaleTimeString()
        };
        addMessage(userMsg);
        setIsAIProcessing(true);

        setTimeout(() => {
          setIsAIProcessing(false);
          const ts = new Date().toLocaleTimeString();
          const baseId = Date.now();

          if (action === 'ACT_PROC') {
            addMessage({
              id: (baseId + 1).toString(),
              type: 'ai',
              contentType: 'text',
              content: `🔍 **实时进程分析结果**\n\n正在扫描节点 \`node-12\` 进程瞬间快照... 发现 \`java\` 进程 (PID: 1502) CPU 占用严重偏离基线 (382.4%)。\n\n**主要耗时堆栈：**\n\`at com.example.service.OrderExportTask.process(OrderExportTask.java:45)\` \n\n疑似原因：大批量订单导出任务未进行流式读写，导致内存分页频繁触发 Full GC。`,
              timestamp: ts
            });
          } else if (action === 'ACT_SLOW') {
            addMessage({
              id: (baseId + 1).toString(),
              type: 'ai',
              contentType: 'text',
              content: `🐢 **慢查询深挖报告**\n\n抓取到最近 1 分钟内耗时最高的 SQL 条目：\n\n\`SELECT * FROM orders WHERE status = 'PENDING' AND created_at > '2024-04-01'\` \n\n• **平均耗时**: 12.5s\n• **扫描行数**: 1,204,552 (Full Table Scan)\n• **优化建议**: 该查询缺少 \`status_created_at\` 联合索引，建议立即补全。`,
              timestamp: ts
            });
          } else if (action === 'ACT_TRACE') {
            addMessage({
              id: (baseId + 1).toString(),
              type: 'ai',
              contentType: 'text',
              content: `🔗 **链路追踪 (Trace) 分析**\n\n针对当前延迟尖峰，已提取 TraceID: \`8f2e...9a12\`。分析显示瓶颈点位于：\n\n• **payment-gateway** -> **auth-service**: 🔴 延迟 2.4s (Timeout)\n• **auth-service** -> **ldap-server**: ❌ 连接被拒绝\n\n结论：由于上游 Auth 服务无法连接 LDAP 认证中心，导致全链路级联阻塞。`,
              timestamp: ts
            });
          } else if (action === 'ACT_ROOT') {
            handleAction('D_ANALYZE_ROOT_CAUSE');
          } else {
            addMessage({
              id: (baseId + 1).toString(),
              type: 'ai',
              contentType: 'text',
              content: `✅ 已执行 \`${labels[action]}\` 指令。分析结果表明当前组件健康度良好，暂未发现明显的系统级风险。您可以继续通过对话询问更多细节。`,
              timestamp: ts
            });
          }
        }, 1500);
        return;
      }

      if (action === 'D_ACTIVE_INCIDENTS') {
        const userMsg: Message = { id: Date.now().toString(), type: 'user', contentType: 'text', content: '查看当前活跃故障', timestamp: new Date().toLocaleTimeString() };
        addMessage(userMsg);
        setTimeout(() => {
          addMessage({
            id: (Date.now() + 1).toString(),
            type: 'ai',
            contentType: 'incident_report',
            content: '🔥 **当前检测到 1 个 P0 级核心业务故障**\n\n该故障已持续 12 分钟，正在影响 `order-service` 和 `checkout-service`。',
            data: {
              id: selectedAlarm?.id || 'inc-20260410-001',
              service: selectedAlarm?.service || 'payment-gateway',
              current_value: selectedAlarm && selectedAlarm.level === 'P0' ? 12.3 : 1.2,
              threshold: 1.0,
              slo_burn_rate: selectedAlarm?.level === 'P0' ? 8.2 : 0.5,
              related_change: { time: '10:05', description: '更新 Nginx upstream 超时配置', operator: '张三' }
            },
            timestamp: new Date().toLocaleTimeString()
          });
        }, 800);
      }
      if (action === 'D_RECENT_CHANGES' || action === 'D_ANALYZE_ROOT_CAUSE') {
        const userMsg: Message = { id: Date.now().toString(), type: 'user', contentType: 'text', content: action === 'D_RECENT_CHANGES' ? '查询最近变更记录' : '分析该故障根因', timestamp: new Date().toLocaleTimeString() };
        addMessage(userMsg);
        setTimeout(() => {
          addMessage({
            id: (Date.now() + 1).toString(),
            type: 'ai',
            contentType: 'change_list',
            content: `📋 **关联分析结果**\n\n在故障发生前 2 分钟，检测到 \`${selectedAlarm?.service || 'payment-gateway'}\` 有一笔配置变更。由于时间高度重合，该变更被标记为最大嫌疑根因。`,
            data: {
              service: selectedAlarm?.service || 'payment-gateway',
              time_window_minutes: 30,
              total_changes: 2,
              changes: [
                { id: 'chg-001', type: 'config', operator: '张三', time: '10:05', description: '更新 Nginx upstream 超时配置', rollback_available: true },
                { id: 'chg-002', type: 'deploy', operator: '李四', time: '09:45', description: '发布推荐算法模型 v2.3.0', rollback_available: false }
              ]
            },
            timestamp: new Date().toLocaleTimeString()
          });
        }, 800);
      }
      if (action === 'D_RECOMMENDATIONS') {
        const userMsg: Message = { id: Date.now().toString(), type: 'user', contentType: 'text', content: '获取止损方案建议', timestamp: new Date().toLocaleTimeString() };
        addMessage(userMsg);
        setTimeout(() => {
          addMessage({
            id: (Date.now() + 1).toString(),
            type: 'ai',
            contentType: 'recovery_action',
            content: '🛠️ **止损方案建议**\n\n基于当前故障特征（配置变更后错误率飙升），推荐优先回滚相关配置。',
            data: {
              recommendations: [
                { action: 'rollback', priority: 1, description: '执行配置回滚：入参超时参数恢复', expected_outcome: '错误率预计在 2 分钟内恢复正常', risk: '低', historical_success_rate: 0.96 },
                { action: 'scale', priority: 2, description: '临时扩容支付网关实例', expected_outcome: '可分摊流量压力，但无法根除根因', risk: '低', historical_success_rate: 0.45 }
              ],
              not_recommended: [{ action: 'restart', reason: '指标显示非内存溢出或死锁，重启大概率无效且会造成流量中断。' }]
            },
            timestamp: new Date().toLocaleTimeString()
          });
        }, 800);
      }
      if (action === 'D_DEPENDENCY_HEALTH') {
        const userMsg: Message = { id: Date.now().toString(), type: 'user', contentType: 'text', content: '检查依赖健康状态', timestamp: new Date().toLocaleTimeString() };
        addMessage(userMsg);
        setTimeout(() => {
          addMessage({
            id: (Date.now() + 1).toString(),
            type: 'ai',
            contentType: 'text',
            content: '🔗 **全栈依赖检查报告**\n\n• **payment-gateway**: 🔴 异常 (错误率 12.3%)\n• **order-service**: 🟡 延迟升高 (P99 800ms)\n• **inventory-db**: 🟢 正常 (连接数 15%)\n• **redis-cache**: 🟢 正常 (命中率 98%)\n\n结论：压力主要集中在入口网关层，下游组件表现正常。',
            timestamp: new Date().toLocaleTimeString()
          });
        }, 800);
      }
      if (action === 'D_ALERT_NOISE') {
        const userMsg: Message = { id: Date.now().toString(), type: 'user', contentType: 'text', content: '查看降噪建议', timestamp: new Date().toLocaleTimeString() };
        addMessage(userMsg);
        setTimeout(() => {
          addMessage({
            id: (Date.now() + 1).toString(),
            type: 'ai',
            contentType: 'text',
            content: '💡 **智能降噪分析**\n\n检测到当前 12 条活跃告警中，有 8 条为级联抖动产生的“次生告警”。\n\n✅ **建议抑制**：`checkout-timeout`, `user-latency-alert` 等 8 项。\n🎯 **建议聚焦**：`payment-gateway-error` (故障根源)。',
            timestamp: new Date().toLocaleTimeString()
          });
        }, 800);
      }
      if (action === 'D_EXECUTE_ACTION') {
        addMessage({
          id: Date.now().toString(),
          type: 'system',
          contentType: 'text',
          content: `🚀 已触发自动化止损指令：执行配置回滚 [${selectedAlarm?.service || 'payment-gateway'}-timeout]。正在监控执行结果...`,
          timestamp: new Date().toLocaleTimeString()
        });
        setTimeout(() => {
          addMessage({
            id: (Date.now() + 1).toString(),
            type: 'system',
            contentType: 'text',
            content: `✅ 执行成功！${selectedAlarm?.service || 'payment-gateway'} 错误率已回落至 0.5%，故障已解除。`,
            timestamp: new Date().toLocaleTimeString()
          });
        }, 3000);
      }
    }

    if (activeMenu === 'inspection') {
      if (action === 'NEW_TASK') {
        const userMsg: Message = {
          id: Date.now().toString(),
          type: 'user',
          contentType: 'text',
          content: '我想新建一则巡检任务。',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        addMessage(userMsg);
        setInspectionWizard('type_selection');
        setInspectionTaskMode(null);
        setTimeout(() => {
          addMessage({
            id: (Date.now() + 1).toString(),
            type: 'ai',
            contentType: 'inspection_type',
            content: '没问题。首先，请选择您希望执行的巡检模式：',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }, 600);
      }

      if (action === 'SET_INSPECTION_MODE') {
        const mode = data?.mode;
        setInspectionTaskMode(mode);
        const userMsg: Message = {
          id: Date.now().toString(),
          type: 'user',
          contentType: 'text',
          content: mode === 'scheduled' ? '⏰ 设置为定时巡检计划' : '⚡ 立即执行本次巡检',
          timestamp: new Date().toLocaleTimeString()
        };
        addMessage(userMsg);

        setInspectionWizard('host');
        setTimeout(() => {
          addMessage({
            id: (Date.now() + 1).toString(),
            type: 'ai',
            contentType: 'target_select',
            content: mode === 'scheduled' ? '已选择定时模式。请先勾选该计划要覆盖的巡检对象范围：' : '已选择立即执行。请先确认本次临时执行的巡检对象：',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }, 600);
      }
    }

    if (activeMenu === 'inspection') {
      if (action === 'SYNC_RULES') {
        const updatedRules = data.rules;
        handleSyncRules(updatedRules);
        
        // 关键：实时更新对话历史中的消息数据，否则 UI 不会重绘
        setChatHistories(prev => ({
          ...prev,
          [activeMenu]: prev[activeMenu].map(msg => 
            msg.contentType === 'rule_draft' ? { ...msg, data: { ...msg.data, rules: updatedRules } } : msg
          )
        }));
        if (activeSessionId) {
          setSessions(prev => prev.map(s => 
            s.id === activeSessionId 
              ? { ...s, messages: s.messages.map(msg => msg.contentType === 'rule_draft' ? { ...msg, data: { ...msg.data, rules: updatedRules } } : msg) } 
              : s
          ));
        }
      }

      if (action === 'ADD_CUSTOM_RULE') {
        const newRule = {
          id: 'custom_' + Date.now(),
          name: '',
          metric: 'new.metric',
          threshold: '> 0',
          duration: '1 min',
          severity: 'Medium',
          reason: '手动新增的规则项'
        };
        const currentRules = inspectionRuleDraft?.rules || [];
        const updatedRules = [...currentRules, newRule];
        
        handleSyncRules(updatedRules);

        // 同步更新消息卡片
        setChatHistories(prev => ({
          ...prev,
          [activeMenu]: prev[activeMenu].map(msg => 
            msg.contentType === 'rule_draft' ? { ...msg, data: { ...msg.data, rules: updatedRules } } : msg
          )
        }));
        if (activeSessionId) {
          setSessions(prev => prev.map(s => 
            s.id === activeSessionId 
              ? { ...s, messages: s.messages.map(msg => msg.contentType === 'rule_draft' ? { ...msg, data: { ...msg.data, rules: updatedRules } } : msg) } 
              : s
          ));
        }
      }

      if (action === 'STEP_RULE') {
        setInspectionWizard('rule');
        const targets = data?.targets || [];
        // 增强匹配：统一大写并去除首尾空格
        const types = Array.from(new Set(targets.map((t: any) => String(t.type || '').trim().toUpperCase())));
        
        let rules: any[] = [];

        // 1. 云主机类 (Host) - 依据文档十五.1
        if (types.includes('HOST')) {
          rules.push(
            { id: 'h1', name: 'CPU 使用率', metric: 'host.cpu.usage', threshold: '> 80%', duration: '5 min', severity: 'High', reason: '主机基础计算负载监控' },
            { id: 'h2', name: '内存使用率', metric: 'host.mem.usage', threshold: '> 85%', duration: '5 min', severity: 'High', reason: '预防系统内存水位过高' },
            { id: 'h3', name: '磁盘使用率', metric: 'host.disk.usage', threshold: '> 85%', duration: '10 min', severity: 'High', reason: '基础存储空间预警' },
            { id: 'h4', name: '网络延迟', metric: 'host.net.latency', threshold: '> 200ms', duration: '3 min', severity: 'Medium', reason: '监控网络链路通畅度' },
            { id: 'h5', name: '网络丢包率', metric: 'host.net.loss', threshold: '> 5%', duration: '2 min', severity: 'Medium', reason: '评估网络传输稳定性' }
          );
        }

        // 2. 数据库 (DB) - 依据文档十三
        if (types.includes('DB')) {
          rules.push(
            { id: 'db1', name: 'CPU 使用率', metric: 'db.cpu.usage', threshold: '> 80%', duration: '5 min', severity: 'Critical', reason: '数据库核心负载监控' },
            { id: 'db2', name: '内存使用率', metric: 'db.mem.usage', threshold: '> 80%', duration: '5 min', severity: 'High', reason: '数据库内存水位管理' },
            { id: 'db3', name: '磁盘使用率', metric: 'db.disk.usage', threshold: '> 85%', duration: '10 min', severity: 'High', reason: '预防数据文件溢出' },
            { id: 'db4', name: '主从延迟', metric: 'db.replication.delay', threshold: '> 30s', duration: '3 min', severity: 'High', reason: '同步健康度检查' },
            { id: 'db5', name: '数据库连接数', metric: 'db.connection.count', threshold: '持续异常升高', duration: '5 min', severity: 'High', reason: '预防连接句柄耗尽' },
            { id: 'db6', name: '慢查询数量', metric: 'db.slow_query.count', threshold: '异常升高', duration: '2 min', severity: 'High', reason: '识别异常性能劣化' }
          );
        }

        // 3. Redis 类 - 依据文档十五.3
        if (types.includes('REDIS')) {
          rules.push(
            { id: 'rd1', name: '内存使用率过高', metric: 'redis.mem.usage', threshold: '> 85%', duration: '5 min', severity: 'Critical', reason: 'Redis 容量健康巡检' },
            { id: 'rd2', name: '连接数异常增长', metric: 'redis.connection.count', threshold: '异常波动', duration: '2 min', severity: 'High', reason: '监控并发连接风险' },
            { id: 'rd3', name: '命中率下降', metric: 'redis.cache.hit_rate', threshold: '< 70%', duration: '5 min', severity: 'Medium', reason: '缓存有效性评估' },
            { id: 'rd4', name: '主从同步异常', metric: 'redis.replication.status', threshold: '!= connected', duration: '1 min', severity: 'High', reason: '集群同步健康度' }
          );
        }

        // 4. 应用服务类 (App Service) - 依据文档十五.2
        if (types.includes('APP') || types.includes('SERVICE')) {
          rules.push(
            { id: 'app1', name: '服务错误率', metric: 'app.error.rate', threshold: '> 5%', duration: '3 min', severity: 'Critical', reason: '保障核心业务可用性' },
            { id: 'app2', name: '响应时间 P95', metric: 'app.p95.latency', threshold: '异常升高', duration: '3 min', severity: 'High', reason: '用户侧性能体验感知' },
            { id: 'app3', name: '实例异常退出', metric: 'app.instance.exit', threshold: 'count > 0', duration: '1 min', severity: 'Critical', reason: '预防服务雪崩风险' },
            { id: 'app4', name: 'CPU/内存持续升高', metric: 'app.resource.usage', threshold: '趋势异常', duration: '10 min', severity: 'Medium', reason: '识别潜在资源泄漏' }
          );
        }

        // --- 容错兜底：若全未匹配，提供极简基础项 ---
        if (rules.length === 0) {
          rules.push(
            { id: 'def1', name: 'CPU 负载巡检', metric: 'sys.cpu.logic', threshold: '> 90%', duration: '5 min', severity: 'High', reason: '通用计算性能底线监控' },
            { id: 'def2', name: '内存水位巡检', metric: 'sys.mem.usage', threshold: '> 90%', duration: '5 min', severity: 'High', reason: '预防基础资源被耗尽' }
          );
        }

        const draftData = {
          targetCount: targets.length,
          rulesCount: rules.slice(0, 5).length,
          rules: rules.slice(0, 5)
        };

        setInspectionRuleDraft(draftData);

        setTimeout(() => {
          addMessage({
            id: Date.now().toString(),
            type: 'ai',
            contentType: 'rule_draft',
            content: `已为您选定的 ${targets.length} 个巡检对象生成了核心推荐规则。您可以直接在下方修改参数或新增规则。`,
            data: draftData,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }, 600);
      }

      if (action === 'STEP_FREQUENCY') {
        setInspectionWizard('schedule');
        addMessage({
          id: Date.now().toString(),
          type: 'user',
          contentType: 'text',
          content: '规则已确认，进入频率设定。',
          timestamp: new Date().toLocaleTimeString()
        });
        setTimeout(() => {
          addMessage({
            id: (Date.now() + 1).toString(),
            type: 'ai',
            contentType: 'frequency_select',
            content: '好的，巡检规则已确认。第三步，请设置该任务的执行频率：',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }, 600);
      }

      if (action === 'SET_FREQUENCY_STR') {
        setInspectionFrequency(data.frequency);
      }

      if (action === 'STEP_CONFIRMATION') {
        setInspectionWizard('confirmation');
        addMessage({
          id: Date.now().toString(),
          type: 'user',
          contentType: 'text',
          content: '频率已设定，请生成任务预览。',
          timestamp: new Date().toLocaleTimeString()
        });
        setTimeout(() => {
          addMessage({
            id: (Date.now() + 1).toString(),
            type: 'ai',
            contentType: 'task_summary',
            content: '已为您汇总任务核心配置，请进行最后核对：',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }, 600);
      }

      if (action === 'STEP_FINISH') {
        setInspectionTasks(prev => [
          {
            name: '核心链路稳定性巡检任务',
            target: '集群 (VPC-Prod-Main)',
            status: '健康',
            inspectionStatus: '待运行',
            riskLevel: '低',
            rules: ['CPU 监控', '慢查询检测', '同步延迟'],
            summary: '任务已成功创建。系统将根据设定的频率自动调度 AI 专家执行深度诊断。',
            updatedAt: new Date().toLocaleString()
          },
          ...prev
        ]);
        setInspectionWizard('success');
        setTimeout(() => {
          addMessage({
            id: Date.now().toString(),
            type: 'ai',
            contentType: 'task_success',
            content: '✨ 巡检任务创建成功！',
            data: { hostCount: 5 },
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }, 800);
      }
      
      if (action === 'VIEW_TASK') {
        const newTask = inspectionTasks.find(t => t.name === '核心链路稳定性巡检任务');
        if (newTask) {
          setSelectedInspectionTask(newTask);
          setShowInspectionBanner(true);
        }
      }

      if (action === 'STEP_RULE_BACK') {
        setInspectionWizard('rule');
        addMessage({
          id: Date.now().toString(),
          type: 'ai',
          contentType: 'rule_draft',
          content: '请重新核对推荐的巡检规则草案：',
          data: inspectionRuleDraft,
          timestamp: new Date().toLocaleTimeString()
        });
      }
      
      if (action === 'STEP_SCHEDULE_BACK') {
        setInspectionWizard('schedule');
        addMessage({
          id: Date.now().toString(),
          type: 'ai',
          contentType: 'frequency_select',
          content: '请重新设定任务执行频率：',
          timestamp: new Date().toLocaleTimeString()
        });
      }
    }
    if (action === 'log_anomaly') {
      setAnomalyResolved(true);
      addMessage({
        id: Date.now().toString(),
        type: 'ai',
        contentType: 'text',
        content: '分析这 47 次 "Connection refused"：\n\n📌 **根因：** 该错误大概率由下游服务 `inventory-svc` 不可达引起。检测到在同一时段 `inventory-svc` 重启了 3 次。\n💡 **建议：** 检查 `inventory-svc` 服务发现配置和存活探针状态。',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } else if (action === 'read_sop') {
      addMessage({
        id: Date.now().toString(),
        type: 'ai',
        contentType: 'sop',
        content: '已为您检索到标准 SOP 文档：',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        data: {
          title: 'GC 频繁问题排查 SOP',
          steps: [
            { desc: '1. 查看该节点 Full GC 发起频次和耗时监控' },
            { desc: '2. 捞取 Heap Dump 并分析占用超 50% 的大对象' },
            { desc: '3. 检查是否有长耗时 Query 导致的未释放对象' }
          ]
        }
      });
    } else if (action === 'run_inspection') {
      setInspectionState('running');
      addMessage({
        id: Date.now().toString(),
        type: 'system',
        contentType: 'text',
        content: '⏳ 巡检中... 正在检查节点健康状态...',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      setTimeout(() => {
        setInspectionState('done');
        addMessage({
          id: Date.now().toString(),
          type: 'ai',
          contentType: 'text',
          content: '全量巡检完成！\n\n✅ 所有节点状态正常\n❌ 发现 2 个证书即将于 7 天后过期\n⚠️ 发现 payment-svc 存在内存泄漏风险\n\n总体健康度：87 分。是否需要我帮您创建更新证书的工单？',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }, 3000);
    } else if (action === 'restart') {
      addMessage({
        id: Date.now().toString(),
        type: 'system',
        contentType: 'text',
        content: '✅ payment-svc Pod 重启成功 | P99 延迟已恢复至 45ms | 已生成 Jira 单 SRE-2026',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }

    // --- AI Diagnostic Flow for Inspection Tasks ---
    if (action === 'DIAG_TASK') {
      const taskName = data?.taskName;
      if (!taskName) {
        // Scenario A: No context - ask user to select task
        addMessage({
          id: Date.now().toString(),
          type: 'ai',
          contentType: 'inspection_task_select',
          content: '请选择或搜索您想要进行深度诊断的巡检任务：',
          timestamp: new Date().toLocaleTimeString()
        });
      } else {
        // Scenario B: With context - start diagnosis directly
        handleAction('START_DIAGNOSTIC', { taskName });
      }
    }

    if (action === 'START_DIAGNOSTIC') {
      const taskName = data?.taskName;
      const diagId = Date.now().toString();

      addMessage({
        id: diagId,
        type: 'ai',
        contentType: 'inspection_diagnostic_report',
        content: `正在针对任务 [${taskName}] 启动深度诊断分析...`,
        data: { taskName, currentPhase: 1 },
        timestamp: new Date().toLocaleTimeString()
      });

      // Phase progress simulation
      [2, 3, 4].forEach((phase, idx) => {
        setTimeout(() => {
          updateMessage(diagId, {
            data: { taskName, currentPhase: phase }
          });

          if (phase === 4) {
            // Show Conclusion after phases complete
            setTimeout(() => {
              addMessage({
                id: (Date.now() + 1).toString(),
                type: 'ai',
                contentType: 'inspection_conclusion',
                content: '根据以上采集到的多维数据，我已完成初步推断：',
                data: { taskName },
                timestamp: new Date().toLocaleTimeString()
              });
            }, 1000);
          }
        }, (idx + 1) * 2000);
      });
    }

    if (action === 'DEEP_DIVE') {
      addMessage({
        id: Date.now().toString(),
        type: 'ai',
        contentType: 'inspection_deep_dive',
        content: '正在通过专用备用通道进行底层探测...',
        timestamp: new Date().toLocaleTimeString()
      });
    }

    if (action === 'MARK_SOLVED') {
      addMessage({
        id: Date.now().toString(),
        type: 'ai',
        contentType: 'inspection_closure',
        content: '请协助确认问题的解决情况，以便我完善此次诊断知识库：',
        timestamp: new Date().toLocaleTimeString()
      });
    }

    if (action === 'PAUSE_TASK') {
      addMessage({
        id: Date.now().toString(),
        type: 'system',
        contentType: 'text',
        content: '⏸️ 巡检任务 [Nginx日志巡检] 已临时暂停。您可以随时在任务列表中恢复执行。',
        timestamp: new Date().toLocaleTimeString()
      });
    }

    if (action === 'RESUME_TASK') {
      addMessage({
        id: Date.now().toString(),
        type: 'system',
        contentType: 'text',
        content: '▶️ 巡检任务 [Nginx日志巡检] 已恢复执行。当前状态：正在进行中...',
        timestamp: new Date().toLocaleTimeString()
      });
    }

    if (action === 'GO_HOME') {
      handleMenuChange('home');
    }

    if (action === 'GENERATE_REPORT') {
      addMessage({
        id: Date.now().toString(),
        type: 'ai',
        contentType: 'report',
        content: '📊 已为您生成今日运维质量摘要报告。各组件运行平稳，风险点共计 2 项（已标记），请查阅：',
        timestamp: new Date().toLocaleTimeString()
      });
    }

    if (action === 'FILL_RULE') {
      setInputValue(data.text);
    }
  };

  // --- Dynamic Placeholders by Menu ---
  const AlarmTicker = () => {
    const [index, setIndex] = useState(0);
    const severityWeight: Record<string, number> = { 'P0': 4, 'P1': 3, 'P2': 2, 'P3': 1, 'P4': 0 };
    
    // 按严重程度排序并取 Top 10
    const topAlarms = React.useMemo(() => [...MOCK_ALARMS]
      .sort((a, b) => (severityWeight[b.level] || 0) - (severityWeight[a.level] || 0))
      .slice(0, 10), []);

    useEffect(() => {
      if (topAlarms.length <= 3) return;
      const timer = setInterval(() => {
        setIndex((prev) => (prev + 3) % topAlarms.length);
      }, 2000);
      return () => clearInterval(timer);
    }, [topAlarms.length]);

    // 每次展示 3 条
    const displayAlarms = [
      topAlarms[index],
      topAlarms[(index + 1) % topAlarms.length],
      topAlarms[(index + 2) % topAlarms.length]
    ].filter(Boolean);

    return (
      <div className="h-[105px] overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="space-y-3"
          >
            {displayAlarms.map((alarm, idx) => (
              <div key={`${alarm.id}-${idx}`} className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-tighter font-bold">
                  <span className="truncate max-w-[140px] flex items-center gap-1">
                     <span className={`w-1 h-1 rounded-full ${alarm.level === 'P0' ? 'bg-rose-500 animate-pulse' : 'bg-orange-500'}`} />
                     {alarm.service} 实时告警
                  </span>
                  <span className={alarm.level === 'P0' ? 'text-rose-500/80' : 'text-orange-500/80'}>{alarm.startTime.split(' ')[1]}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-300">
                  <span className="truncate pr-4 font-medium">{alarm.title}</span>
                  <span className={`font-black text-[10px] px-1 rounded ${
                    alarm.level === 'P0' ? 'bg-rose-500/10 text-rose-500' : 'bg-orange-500/10 text-orange-500'
                  }`}>{alarm.level}</span>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  };
  
  const InspectionTaskTicker = () => {
    const [index, setIndex] = useState(0);
    
    // 过滤出异常任务并按时间排序取 Top 10
    const topAnomalies = React.useMemo(() => [...inspectionTasks]
      .filter(t => t.status === '异常')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10), [inspectionTasks]);

    useEffect(() => {
      if (topAnomalies.length <= 2) return;
      const timer = setInterval(() => {
        setIndex((prev) => (prev + 2) % topAnomalies.length);
      }, 2000);
      return () => clearInterval(timer);
    }, [topAnomalies.length]);

    if (topAnomalies.length === 0) return null;

    // 每次展示 2 条
    const displayItems = [
      topAnomalies[index],
      topAnomalies[(index + 1) % topAnomalies.length]
    ].filter(Boolean);

    return (
      <div className="h-[64px] overflow-hidden relative mt-1 border-t border-slate-800/30 pt-2">
        <div className="text-[10px] text-rose-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 px-1">
          <div className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
          异常任务轮播
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="space-y-2 px-1"
          >
            {displayItems.map((task, idx) => (
              <div key={`${task.name}-${idx}`} className="flex flex-col gap-0.5">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-200 font-medium truncate pr-2">{task.name}</span>
                  <span className="text-rose-400 font-black uppercase text-[8px] bg-rose-500/10 px-1 rounded">异常</span>
                </div>
                <div className="text-[9px] text-slate-500 font-mono flex justify-between">
                  <span>{task.target}</span>
                  <span>{task.updatedAt.split(' ')[1]}</span>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  };

  const LogEventTicker = () => {
    const [index, setIndex] = useState(0);
    useEffect(() => {
      if (MOCK_LOG_EVENTS.length <= 2) return;
      const timer = setInterval(() => {
        setIndex((prev) => (prev + 2) % MOCK_LOG_EVENTS.length);
      }, 2000);
      return () => clearInterval(timer);
    }, []);
    const displayLogs = [
      MOCK_LOG_EVENTS[index],
      MOCK_LOG_EVENTS[(index + 1) % MOCK_LOG_EVENTS.length]
    ].filter(Boolean);

    return (
      <div className="h-[80px] overflow-hidden relative mt-1 border-t border-slate-800/30 pt-2">
        <div className="text-[10px] text-rose-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 px-1">
          <div className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
          异常日志轮播
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="space-y-2 px-1"
          >
            {displayLogs.map((log, idx) => (
              <div key={`${log.id}-${idx}`} className="flex flex-col gap-0.5">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-200 font-medium truncate pr-2">"{log.content}"</span>
                  <span className="text-rose-400 font-black uppercase text-[8px] bg-rose-500/10 px-1 rounded">{log.service}</span>
                </div>
                <div className="text-[9px] text-slate-500 font-mono flex justify-between">
                  <span>共计 {log.count} 次</span>
                  <span>{log.time}</span>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  };

  const renderHomeDashboard = () => {
    const handleDirectDiagnoseClick = (e: React.MouseEvent, alarmId: string) => {
      e.stopPropagation();
      const alarm = MOCK_ALARMS.find(a => a.id === alarmId);
      if (alarm) {
        // 1. 设置诊断相关的基础状态
        setSelectedAlarm(alarm);
        setDiagnosticMode('chat');
        setIsAIProcessing(true);
        setShowContextBanner(false);
        
        // 2. 创建新会话并跳转
        const newSessionId = createNewSession('diagnostic', `AI 诊断: ${alarm.title}`);
        
        // 3. 延迟启动分析流程，确保新会话已在 state 中就绪
        setTimeout(() => {
          handleOneClickDiagnose(alarm, alarm.id === 'A004' ? 'slow_query' : 'general', 'diagnostic', newSessionId);
        }, 300);
      }
    };

    return (
      <div className="flex flex-col w-full pb-20">
        <div className="flex items-center gap-4 mb-8 mt-4 px-2 lg:px-6">
          <div className="h-px bg-slate-800 flex-1" />
          <span className="text-[11px] font-bold text-slate-500 tracking-widest uppercase">核心能力</span>
          <div className="h-px bg-slate-800 flex-1" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-2 lg:px-4">
          {/* Card 1: 故障根因分析 */}
          <div onClick={() => createNewSession('diagnostic', 'AI 诊断专家')} className="bg-[var(--bg-card)] border border-slate-800/60 rounded-2xl p-5 flex flex-col hover:border-slate-700 transition-all cursor-pointer group shadow-lg">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col items-center justify-center relative shrink-0">
                <Activity size={18} className="text-indigo-500" />
                <span className="absolute -bottom-2 -right-2 px-1.5 py-0.5 bg-rose-500 text-white text-[8px] font-black rounded flex items-center gap-0.5 shadow-lg shadow-rose-500/20"><span className="w-1 h-1 bg-white rounded-full animate-pulse" /> 实时</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="text-[15px] font-extrabold text-slate-200 mb-1 group-hover:text-blue-400 transition-colors truncate">故障根因分析</h3>
                <p className="text-[10px] text-slate-500 font-medium truncate">AI 驱动链路追踪 • 自动定位根因</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 mb-6 flex-1 text-xs">
              <div onClick={(e) => handleDirectDiagnoseClick(e, 'A002')} className="flex items-center justify-between p-2 rounded-lg bg-black/20 border border-slate-800/50 group-hover:border-slate-700 transition-colors hover:bg-slate-800/40">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="bg-rose-500/20 text-rose-500 text-[9px] font-bold px-1 rounded shrink-0">严重</span>
                  <span className="text-slate-300 text-[11px] truncate">payment-svc • P99 &gt; 2s</span>
                </div>
                <ChevronRight size={12} className="text-slate-600 shrink-0 group-hover:text-indigo-400" />
              </div>
              <div onClick={(e) => handleDirectDiagnoseClick(e, 'A001')} className="flex items-center justify-between p-2 rounded-lg bg-black/20 border border-slate-800/50 group-hover:border-slate-700 transition-colors hover:bg-slate-800/40">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="bg-orange-500/20 text-orange-500 text-[9px] font-bold px-1 rounded shrink-0">重要</span>
                  <span className="text-slate-300 text-[11px] truncate">order-svc • Connection re...</span>
                </div>
                <ChevronRight size={12} className="text-slate-600 shrink-0 group-hover:text-indigo-400" />
              </div>
              <div onClick={(e) => handleDirectDiagnoseClick(e, 'A003')} className="flex items-center justify-between p-2 rounded-lg bg-black/20 border border-slate-800/50 group-hover:border-slate-700 transition-colors hover:bg-slate-800/40">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="bg-yellow-500/20 text-yellow-500 text-[9px] font-bold px-1 rounded shrink-0">次要</span>
                  <span className="text-slate-300 text-[11px] truncate">user-db • 内存余量 18%</span>
                </div>
                <ChevronRight size={12} className="text-slate-600 shrink-0 group-hover:text-indigo-400" />
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/50 mt-auto">
              <span className="text-[11px] font-bold text-rose-500 flex items-center gap-1 group-hover:gap-2 transition-all">→ 进入AI诊断专家</span>
              <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[9px] font-bold px-1.5 py-0.5 rounded">4 条活跃</span>
            </div>
          </div>

          {/* Card 2: 告警收效 */}
          <div onClick={() => createNewSession('diagnostic', 'AI 诊断专家')} className="bg-[var(--bg-card)] border border-slate-800/60 rounded-2xl p-5 flex flex-col hover:border-slate-700 transition-all cursor-pointer group shadow-lg">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col items-center justify-center relative shrink-0">
                <Bell size={18} className="text-indigo-500" />
                <div className="absolute top-2 right-2 w-0.5 h-6 bg-indigo-500 -rotate-45 block" />
                <span className="absolute -bottom-2 -right-2 px-1.5 py-0.5 bg-orange-500 text-white text-[8px] font-black rounded flex items-center gap-0.5 shadow-lg shadow-orange-500/20">处置中</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="text-[15px] font-extrabold text-slate-200 mb-1 group-hover:text-blue-400 transition-colors truncate">告警收敛</h3>
                <p className="text-[10px] text-slate-500 font-medium whitespace-nowrap truncate">降噪 • 聚合 • 智能分级 • 自动过滤</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between gap-4 mb-6 flex-1 px-1">
              {/* Circular Chart placeholder */}
              <div className="relative w-[72px] h-[72px] shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="36" cy="36" r="30" stroke="currentColor" strokeWidth="5" fill="none" className="text-orange-500/10" />
                  <circle cx="36" cy="36" r="30" stroke="currentColor" strokeWidth="5" fill="none" className="text-orange-500" strokeDasharray="188.4" strokeDashoffset="24" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-orange-500 leading-none">87</span>
                  <span className="text-[8px] text-slate-400 font-bold transform scale-75">降噪率</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 flex-1 w-full text-[11px] font-medium">
                <div className="flex justify-between items-center"><span className="text-slate-400">原始告警</span><span className="text-slate-200 font-bold">214</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-400">自动过滤</span><span className="text-emerald-500 font-bold">28</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-400">自动收敛</span><span className="text-blue-400 font-bold">14</span></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/50 mt-auto">
              <span className="text-[11px] font-bold text-orange-500 flex items-center gap-1 group-hover:gap-2 transition-all">→ 进入实时监控</span>
              <span className="bg-slate-800/50 text-slate-500 border border-slate-700/50 text-[9px] font-bold px-1.5 py-0.5 rounded">今日 214 条原始</span>
            </div>
          </div>

          {/* Card 3: 运维知识专家 */}
          <div onClick={() => createNewSession('knowledge', 'AI 知识专家')} className="bg-[var(--bg-card)] border border-slate-800/60 rounded-2xl p-5 flex flex-col hover:border-slate-700 transition-all cursor-pointer group shadow-lg">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col items-center justify-center relative shrink-0">
                <BookOpen size={18} className="text-indigo-500" />
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="text-[15px] font-extrabold text-slate-200 mb-1 group-hover:text-blue-400 transition-colors truncate">运维知识专家</h3>
                <p className="text-[10px] text-slate-500 font-medium truncate">SOP • 故障手册 • 智能问答</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 mb-6 flex-1 text-[11px]">
              <div className="flex justify-end mb-[-4px]">
                 <span className="bg-blue-600/20 border border-blue-600/30 text-blue-400 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg shadow-blue-500/10">219 篇文档</span>
              </div>
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  createNewSession('knowledge', 'AI 知识专家');
                  setInputValue(prev => {
                    const tagMatch = prev.match(/@(诊断专家|巡检助手|知识专家)/);
                    return tagMatch ? `${tagMatch[0]} GC_频繁问题排查_SOP` : 'GC_频繁问题排查_SOP';
                  });
                }}
                className="flex items-center justify-between p-1.5 pb-2 hover:bg-black/20 rounded-lg group/item transition-colors"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)] shrink-0" />
                  <span className="text-slate-300 truncate">GC_频繁问题排查_SOP</span>
                </div>
                <span className="text-blue-400 font-bold shrink-0 ml-2 scale-90">命中 12</span>
              </div>
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  createNewSession('knowledge', 'AI 知识专家');
                  setInputValue(prev => {
                    const tagMatch = prev.match(/@(诊断专家|巡检助手|知识专家)/);
                    return tagMatch ? `${tagMatch[0]} 数据库连接池耗尽排查指南` : '数据库连接池耗尽排查指南';
                  });
                }}
                className="flex items-center justify-between p-1.5 pb-2 hover:bg-black/20 rounded-lg group/item transition-colors"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)] shrink-0" />
                  <span className="text-slate-300 truncate">数据库连接池耗尽排查指南</span>
                </div>
                <span className="text-blue-400 font-bold shrink-0 ml-2 scale-90">命中 8</span>
              </div>
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  createNewSession('knowledge', 'AI 知识专家');
                  setInputValue(prev => {
                    const tagMatch = prev.match(/@(诊断专家|巡检助手|知识专家)/);
                    return tagMatch ? `${tagMatch[0]} K8s Pod OOMKilled 处置流程` : 'K8s Pod OOMKilled 处置流程';
                  });
                }}
                className="flex items-center justify-between p-1.5 pb-2 hover:bg-black/20 rounded-lg group/item transition-colors"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] shrink-0" />
                  <span className="text-slate-300 truncate">K8s Pod OOMKilled 处置流程</span>
                </div>
                <span className="text-blue-400 font-bold shrink-0 ml-2 scale-90">命中 6</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/50 mt-auto">
              <span className="text-[11px] font-bold text-blue-500 flex items-center gap-1 group-hover:gap-2 transition-all">→ 进入AI知识专家</span>
              <span className="bg-slate-800/50 text-slate-500 border border-slate-700/50 text-[9px] font-bold px-1.5 py-0.5 rounded">8 个知识库</span>
            </div>
          </div>

          {/* Card 4: 智能巡检助手 */}
          <div onClick={() => createNewSession('inspection', 'AI 巡检助手')} className="bg-[var(--bg-card)] border border-slate-800/60 rounded-2xl p-5 flex flex-col hover:border-slate-700 transition-all cursor-pointer group shadow-lg">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col items-center justify-center relative shrink-0">
                <HeartPulse size={18} className="text-indigo-500" />
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="text-[15px] font-extrabold text-slate-200 mb-1 group-hover:text-blue-400 transition-colors truncate">智能巡检助手</h3>
                <p className="text-[10px] text-slate-500 font-medium truncate">定时巡检 • 预警推送</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 mb-6 flex-1 text-[11px]">
              <div className="flex justify-end mb-[-4px]">
                 <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-bold px-1.5 py-0.5 rounded">今日已巡检</span>
              </div>
              
              <div className="flex items-center gap-3 mb-2 px-1">
                <span className="text-3xl font-black text-orange-500 leading-none">87<span className="text-base tracking-tighter">%</span></span>
                <div className="flex flex-col justify-center">
                  <span className="text-[10px] text-slate-500 font-bold mb-1">任务成功率</span>
                  <span className="text-[9px] font-bold text-rose-500 flex items-center">↓ 较上周下降 1%</span>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-between p-1.5 rounded-lg bg-black/20 border border-slate-800/50">
                <span className="text-slate-400 font-medium">核心任务健康</span>
                <span className="text-orange-500 font-bold">121/128</span>
              </div>
              <div className="flex items-center gap-2 justify-between p-1.5 rounded-lg bg-black/20 border border-slate-800/50">
                <span className="text-slate-400 font-medium">巡检异常对象</span>
                <span className="text-rose-500 font-bold">3 台</span>
              </div>
              <div className="flex items-center gap-2 justify-between p-1.5 rounded-lg bg-black/20 border border-slate-800/50">
                <span className="text-slate-400 font-medium">SLA 达成率</span>
                <span className="text-emerald-500 font-bold">99.2%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/50 mt-auto">
              <span className="text-[11px] font-bold text-indigo-500 flex items-center gap-1 group-hover:gap-2 transition-all">→ 查看巡检报告</span>
              <span className="bg-slate-800/50 text-slate-500 border border-slate-700/50 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1"><ListTodo size={10} className="text-slate-400"/> 128 项巡检任务</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAgentCards = () => {
    switch (activeMenu) {
      case 'diagnostic':
        return (
          <>
            <SRECard status="critical" title="实时告警聚合" icon={AlertCircle} badge="3 严重"
              footer={<button className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-[10px] font-bold rounded transition-colors">一键静默非核心告警</button>}
            >
              <div className="space-y-3 pb-1">
                {/* Aggregated Block */}
                <div className="bg-[var(--bg-card)] rounded border border-rose-500/20 overflow-hidden">
                  <div className="p-1.5 bg-rose-500/10 flex justify-between items-center cursor-pointer">
                    <div className="flex items-center gap-1 font-bold text-[11px] text-rose-500">
                      <ChevronDown size={14} /> payment-svc 级联故障 (聚合并收敛 6 条)
                    </div>
                    <span className="text-[9px] bg-rose-500/20 px-1.5 rounded text-rose-400">严重</span>
                  </div>
                  <div className="p-2 space-y-1.5 text-[10px] bg-black/20">
                    <div className="flex flex-col mb-1.5 mt-2">
                      <div className="flex justify-between text-slate-300"><span>• payment-svc: P99 &gt; 2s</span><span className="text-rose-500">5m</span></div>
                      <div className="flex gap-2 pl-2 mt-1.5 mb-1 text-xs">
                        <span className="bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded cursor-pointer hover:bg-blue-500/20 border border-blue-500/20">👉 建议重启 Pod</span>
                        <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded cursor-pointer hover:bg-slate-700">提取链路 Trace</span>
                      </div>
                    </div>
                    <div className="flex flex-col mb-1.5">
                      <div className="flex justify-between text-slate-300"><span>• inventory-db: 连接数达上限</span><span className="text-rose-500">4m</span></div>
                      <div className="flex gap-2 pl-2 mt-1.5 mb-1 text-xs">
                        <span className="bg-orange-500/10 text-orange-400 px-2.5 py-1 rounded cursor-pointer hover:bg-orange-500/20 border border-orange-500/20">👉 临时扩容连接池</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-slate-300"><span>• user-db: 慢查询突增</span><span className="text-rose-500">2m</span></div>
                    <div className="text-center text-slate-500 pt-1 text-[9px] cursor-pointer hover:text-blue-400">... 查看其余 3 条</div>
                  </div>
                </div>

                <div className="bg-[var(--bg-card)] rounded border border-orange-500/20 overflow-hidden">
                  <div className="p-1.5 flex justify-between items-center cursor-pointer hover:bg-slate-800/50">
                    <div className="flex items-center gap-1 text-[11px] text-orange-500 font-bold">
                      <ChevronRight size={14} /> k8s-node 资源告警 (聚合 2 条)
                    </div>
                  </div>
                </div>

                {/* Single Alerts */}
                <div>
                  <div className="text-[10px] text-slate-500 mb-1.5 font-bold px-1 uppercase tracking-wider">独立散发告警 (2)</div>
                  <div className="space-y-1.5 text-[10px]">
                    <div className="flex flex-col px-1 hover:bg-slate-800/50 rounded py-1 pb-1.5">
                      <div className="flex justify-between"><span>user-service: 网络延迟突增</span><span className="text-orange-500">1m</span></div>
                      <div className="flex gap-2 mt-2 text-xs">
                        <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded cursor-pointer hover:bg-emerald-500/20 border border-emerald-500/20">👉 开启降级预案</span>
                      </div>
                    </div>
                    <div className="flex justify-between px-1 hover:bg-slate-800/50 rounded py-0.5 opacity-60"><span>gateway: CPU 瞬时 90%</span><span className="text-slate-500">10s</span></div>
                  </div>
                </div>
              </div>
            </SRECard>
            <SRECard status="running" title="智能诊断与根因分析" icon={Search} pulse={true}>
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-blue-400">
                  <Zap size={12} /><span>JVM Full GC 频繁 <span className="ml-1 text-[10px] opacity-60">(85%)</span></span>
                </div>
              </div>
            </SRECard>
            <SRECard status="normal" title="变更日历与关联分析" icon={Calendar}>
              <div className="text-[10px] text-emerald-500/80 bg-emerald-500/5 p-2 rounded">
                AI 洞察：当前时段无冲突变更风险
              </div>
            </SRECard>
          </>
        );
      case 'logs':
        return (
          <>
            <SRECard status="custom" statusColorHex="#3b82f6" title="智能日志检索" icon={Search}
              footer={
                <div className="flex gap-2">
                  <button className="flex-1 py-1 bg-slate-800 text-slate-300 text-[10px] rounded hover:bg-slate-700">高级过滤</button>
                  <button className="flex-1 py-1 bg-slate-800 text-slate-300 text-[10px] rounded hover:bg-slate-700">时间范围</button>
                </div>
              }
            >
              <div className="bg-[var(--bg-card)] border border-slate-800 rounded p-2 text-slate-500 flex items-center mb-2">
                <Search size={12} className="mr-2" /> 输入 Lucene 或自然语言...
              </div>
              <div className="flex gap-1.5 flex-wrap">
                <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">error</span>
                <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">payment-svc</span>
              </div>
            </SRECard>
            <SRECard status="custom" statusColorHex="#8b5cf6" title="实时异常检测" icon={Zap}>
              <div
                className={`p-2 rounded cursor-pointer transition-colors ${anomalyResolved ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20'}`}
                onClick={() => !anomalyResolved && handleAction('log_anomaly')}
              >
                {anomalyResolved ?
                  <div className="flex items-center gap-1"><CheckCircle2 size={12} /> <span>已分析: payment-svc (47 异常)</span></div> :
                  <div>⚠️ payment-svc 出现 47 次 "Connection refused"</div>
                }
              </div>
            </SRECard>
            <SRECard status="custom" statusColorHex="#3f3f46" title="当前上下文日志" icon={ClipboardList}>
              <div className="space-y-1 text-[10px] bg-slate-900/30 p-2 rounded max-h-32 overflow-y-auto no-scrollbar">
                {anomalyResolved ? (
                  <>
                    <div className="text-slate-400">03:00:12 [ERROR] payment-svc: Connection refused to inventory-svc:8080</div>
                    <div className="text-slate-400">03:00:13 [ERROR] payment-svc: OutOfMemoryError: Java heap space</div>
                    <div className="text-slate-400">03:00:13 [WARN] payment-svc: Failed to fallback to downgrade logic</div>
                    <div className="text-slate-400 flex"><div className="text-blue-500 shrink-0 border-l-2 border-blue-500 pl-1">03:00:14 [INFO]  payment-svc: Initiating graceful shutdown...</div></div>
                  </>
                ) : (
                  <div className="text-center py-4 text-slate-500">
                    暂无选中上下文，请在对话框粘贴日志或点击异常条目
                  </div>
                )}
              </div>
            </SRECard>
          </>
        );
      case 'capacity':
        return (
          <>
            <SRECard status="warning" title="集群资源水位" icon={Activity} footer={<button className="w-full py-1 bg-slate-800 text-xs rounded hover:bg-slate-700">查看详细指标</button>}>
              <div className="space-y-2 mt-2">
                <div>
                  <div className="flex justify-between text-[10px] mb-1"><span>CPU</span><span className="text-orange-500">67%</span></div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full"><div className="h-full bg-orange-500 rounded-full" style={{ width: '67%' }}></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] mb-1"><span>内存</span><span className="text-rose-500">82%</span></div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full"><div className="h-full bg-rose-500 rounded-full" style={{ width: '82%' }}></div></div>
                </div>
              </div>
            </SRECard>
            <SRECard status="normal" title="成本洞察" icon={TrendingUp} footer={
              <div className="flex gap-2">
                <button className="flex-1 py-1 bg-emerald-600/20 text-emerald-500 text-[10px] rounded font-bold">一键优化</button>
                <button className="flex-1 py-1 bg-slate-800 text-slate-300 text-[10px] rounded">查看建议</button>
              </div>
            }>
              <div className="text-sm">本月预计: <span className="font-bold text-slate-200">$12,450</span></div>
              <div className="text-sm">可优化: <span className="font-bold text-emerald-500">$2,100</span></div>
              <div className="text-[10px] text-slate-500 mt-1">3 个闲置资源可释放</div>
            </SRECard>
          </>
        );
      case 'knowledge':
        return (
          <>
            <SRECard status="custom" statusColorHex="#64748b" title="智能知识检索" icon={Search}>
              <div className="bg-[var(--bg-card)] border border-slate-800 rounded p-2 text-slate-500 flex items-center mb-2">
                <Search size={12} className="mr-2" /> 搜索 K8s, JVM...
              </div>
              <div className="flex gap-1.5 flex-wrap">
                <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">K8s</span>
                <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">MySQL</span>
                <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">JVM</span>
              </div>
            </SRECard>
            <SRECard status="custom" statusColorHex="#3b82f6" title="与你相关的阅读" icon={BookOpen}>
              <div className="space-y-2">
                <div className="flex items-center justify-between cursor-pointer hover:bg-slate-800 p-1 rounded" onClick={() => handleAction('read_sop')}>
                  <span className="text-xs text-blue-400 underline decoration-slate-600 underline-offset-2">GC 频繁问题排查 SOP</span>
                  <Play size={10} className="text-slate-500" />
                </div>
                <div className="flex items-center justify-between p-1 cursor-pointer hover:bg-slate-800 rounded">
                  <span className="text-xs">payment-svc 内存调优最佳实践</span>
                  <Play size={10} className="text-slate-500" />
                </div>
                <div className="flex items-center justify-between p-1 cursor-pointer hover:bg-slate-800 rounded">
                  <span className="text-xs">凌晨故障处理 Checklist</span>
                  <Play size={10} className="text-slate-500" />
                </div>
              </div>
            </SRECard>
            <SRECard status="normal" title="相似故障案例" icon={Clock}>
              <div className="space-y-2">
                <div className="text-xs">
                  <div className="font-bold text-slate-300">SRE-1923: payment-svc OOM</div>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5"><span>相似度 89%</span><span>1个月前</span></div>
                </div>
                <div className="text-xs pt-1 border-t border-slate-800">
                  <div className="text-slate-300">SRE-1845: JVM 参数配置不当</div>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5"><span>相似度 76%</span><span>2个月前</span></div>
                </div>
              </div>
            </SRECard>
          </>
        );
      case 'inspection':
        return (
          <>
            <SRECard status="normal" title="今日巡检成功率" icon={Activity} badge="极致稳定" hideStatusBorder={true}>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-emerald-500 leading-none">99.2%</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-800/30 pt-1.5 mt-0.5">
                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">今日巡检任务</span>
                  <span className="text-xs font-black text-slate-300">24</span>
                </div>
              </div>
            </SRECard>
            <SRECard status="normal" title="巡检项 (12/15 通过)" icon={CheckCircle2}
              footer={<button onClick={() => handleAction('run_inspection')} disabled={inspectionState !== 'idle'} className={`w-full py-1.5 text-xs rounded transition-colors ${inspectionState === 'running' ? 'bg-slate-800 text-slate-500' : 'bg-indigo-600/20 text-indigo-500 hover:bg-indigo-600/30'}`}>{inspectionState === 'running' ? '⏳ 巡检中...' : '执行全量巡检'}</button>}
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> 节点状态检查</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> Pod 健康检查</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> 网络连通性测试</div>
                <div className={`flex items-center gap-1.5 ${inspectionState === 'done' ? 'text-rose-500' : ''}`}>{inspectionState === 'done' ? <AlertCircle size={12} className="text-rose-500" /> : <CheckCircle2 size={12} className="text-emerald-500" />} {inspectionState === 'done' ? <span>证书过期检查 (2 个即将过期)</span> : '证书状态检查'}</div>
              </div>
            </SRECard>
            <SRECard status="critical" title="待处理风险 (3)" icon={ShieldAlert}>
              <div className="text-xs space-y-1">
                <p>• 证书将在 7 天后过期</p>
                <p>• payment-svc 内存泄漏风险</p>
                <p className="opacity-80">• 核心数据库备份任务延迟 2 小时</p>
                <p className="opacity-80 text-orange-500">• 1 个节点磁盘使用率 &gt; 80%</p>
              </div>
            </SRECard>
          </>
        );
      case 'report':
        return (
          <>
            <SRECard status="running" title="快速生成报告" icon={FileText}>
              <div className="flex gap-2">
                <button className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs flex flex-col items-center justify-center gap-1"><FileText size={16} />日报</button>
                <button className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs flex flex-col items-center justify-center gap-1"><FileText size={16} className="text-slate-400" />周报</button>
              </div>
            </SRECard>
            <SRECard status="normal" title="历史报告" icon={Clock}>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                <span className="text-xs">2026-04-07 日报</span>
                <Download size={12} className="text-slate-500 cursor-pointer hover:text-blue-400" />
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-xs text-slate-500">2026-W14 周报</span>
                <Download size={12} className="text-slate-600 cursor-pointer hover:text-blue-400" />
              </div>
              <div className="flex justify-between items-center py-1 border-t border-slate-800/50 mt-1 pt-1">
                <span className="text-xs text-orange-400/80">SRE-2026 故障复盘 (草稿)</span>
                <FileText size={12} className="text-orange-400 cursor-pointer hover:text-orange-300" />
              </div>
            </SRECard>
          </>
        );
      default:
        return null;
    }
  };

  const renderInput = () => {
    const VoiceWaveform = () => (
      <div className="flex items-center gap-0.5 h-3 px-2">
        {[1, 2, 3, 2, 1].map((h, i) => (
          <motion.div
            key={i}
            animate={{ height: [h * 2, h * 6, h * 2] }}
            transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
            className="w-0.5 bg-indigo-400 rounded-full"
          />
        ))}
      </div>
    );

    return (
      <div className="flex flex-col w-full gap-2 relative">

        <div className={`rounded-2xl p-3 transition-all w-full flex flex-col ${
          isListening 
          ? 'bg-[var(--bg-panel)] border-2 border-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.25)] ring-4 ring-indigo-500/10'
          : (activeMenu === 'home' || activeMenu === 'assistant')
            ? 'bg-[var(--bg-panel)] border border-indigo-500/30 shadow-[0_0_40px_rgba(99,102,241,0.08)] focus-within:border-indigo-500/60 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:shadow-[0_0_60px_rgba(99,102,241,0.15)]'
            : 'bg-[var(--bg-alarm)] border border-slate-800 shadow-2xl focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/30'
          }`}>
          {/* Knowledge Context Tags Area (Embedded - Top Header Style) */}
          {/* Knowledge Context Tags Area Removed as per request */}

          <div className="flex gap-3">
            {(activeMenu === 'home' || activeMenu === 'assistant') && (
              <div className="mt-1 flex-shrink-0">
                <Sparkles size={18} className="text-[#a78bfa] drop-shadow-[0_0_8px_rgba(167,139,250,0.6)]" fill="currentColor" />
              </div>
            )}
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                isListening ? "正在倾听语音中... 请直接说话" :
                isAIProcessing ? "AI 专家正在进行深度排查中，请稍候..." :
                  activeMenu === 'home' ? "描述故障现象、粘贴错误日志、或直接问：\npayment-svc 为何 P99 飙升？帮我做根因分析..." :
                    activeMenu === 'diagnostic' ? "粘贴告警ID进行故障诊断与根因分析..." :
                      activeMenu === 'capacity' ? "输入指令规划容量流或查询特定资源分配情况..." :
                        activeMenu === 'database' ? "查询数据资产详情，输入如：'帮我查看 MySQL 核心集群的拓扑与状态'..." :
                          activeMenu === 'network' ? "描述你要探索的网络节点或链路，如：'展示 payment 相关的全量拓扑'..." :
                            activeMenu === 'logs' ? "粘贴日志内容或描述你要查询的日志..." :
                              activeMenu === 'inspection' ? "请输入巡检任务名称进行诊断分析" :
                                activeMenu === 'knowledge' ? "输入运维问题，例如：发布后 pod 持续重启，可能原因和排查步骤是什么？" : "输入自然语言指令 (Shift+Enter 换行)..."
              }
              disabled={isAIProcessing}
              className={`w-full bg-transparent border-none focus-visible:outline-none focus:ring-0 text-slate-200 resize-none no-scrollbar p-0 placeholder:text-slate-500/60 leading-relaxed ${(activeMenu === 'home' || activeMenu === 'assistant')
                ? 'min-h-[80px] text-base'
                : 'min-h-[44px] text-sm'
                }`}
              rows={(activeMenu === 'home' || activeMenu === 'assistant') ? 3 : 1}
            />
          </div>

          {/* Compact Attachment Pill Strip */}
          <AnimatePresence>
            {attachments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 py-2 mt-1 overflow-x-auto no-scrollbar scroll-smooth">
                  {attachments.map((attr) => {
                    const lastDot = attr.title.lastIndexOf('.');
                    const fileName = lastDot !== -1 ? attr.title.substring(0, lastDot) : attr.title;
                    const fileExt = lastDot !== -1 ? attr.title.substring(lastDot) : '';

                    return (
                      <div 
                        key={attr.id} 
                        className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-800/40 border border-slate-800/80 rounded-xl shrink-0 hover:bg-slate-800/80 hover:border-indigo-500/40 transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20 text-indigo-400">
                          {attr.type === 'log' ? <Terminal size={14} /> : <ClipboardList size={14} />}
                        </div>
                        <div className="flex flex-col gap-0 pr-2 min-w-0">
                          <span className="text-[12px] text-slate-100 font-bold truncate leading-tight">
                            {fileName.length > 10 ? `${fileName.substring(0, 10)}...` : fileName}
                          </span>
                          <span className="text-[9px] text-indigo-400/80 font-black uppercase tracking-wider">{fileExt || attr.type}</span>
                        </div>
                        <button
                          onClick={() => removeAttachment(attr.id)}
                          className="w-5 h-5 rounded-md flex items-center justify-center text-slate-600 hover:bg-rose-500/20 hover:text-rose-400 transition-all ml-0.5"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    );
                  })}
                  
                  {attachments.length > 1 && (
                    <button 
                      onClick={() => setAttachments([])}
                      className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-400 transition-colors shrink-0"
                    >
                      清空全部
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>


          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/30 relative">
            <div className="flex items-center gap-1.5 -ml-1">
              {/* Integrated Library Selector */}
              {(activeMenu === 'knowledge') && (
                <>
                  <button
                    ref={pickerButtonRef}
                    onClick={() => {
                      if (!isKLibPickerOpen && pickerButtonRef.current) {
                        const rect = pickerButtonRef.current.getBoundingClientRect();
                        const spaceAbove = rect.top;
                        // If space above is less than 400px, open downwards
                        setPickerDirection(spaceAbove < 400 ? 'down' : 'up');
                      }
                      setIsKLibPickerOpen(!isKLibPickerOpen);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-medium text-slate-300 ${isKLibPickerOpen ? 'bg-[#9882ff]/10 border-[#9882ff]/50 text-[#9882ff] shadow-lg shadow-[#9882ff]/10' : 'bg-transparent border-transparent hover:text-slate-100 hover:bg-slate-800/50'}`}
                  >
                    <BookOpen size={15} className={isKLibPickerOpen ? 'text-[#9882ff]' : 'text-slate-400'} />
                    <span>{selectedKLibIds.length > 0 ? `已选 ${selectedKLibIds.length} 个知识库` : '选择知识库'}</span>
                    <ChevronDown size={14} className={isKLibPickerOpen ? 'text-[#9882ff]' : 'text-slate-500'} />
                  </button>
                  <div className="w-[1px] h-4 bg-slate-800/80 mx-1" />

                  <KnowledgeLibPicker
                    isOpen={isKLibPickerOpen}
                    selectedIds={selectedKLibIds}
                    onSelect={setSelectedKLibIds}
                    onClose={() => setIsKLibPickerOpen(false)}
                    direction={pickerDirection}
                    containerRef={pickerContainerRef}
                  />
                </>
              )}

              <button
                onClick={() => {
                  const mockFiles = [
                    { title: 'payment_error_trace_20240420_final.log', type: 'log' },
                    { title: 'cluster_performance_metrics_detailed_report.pdf', type: 'file' },
                    { title: 'nginx_access_summary_export_v2.csv', type: 'file' },
                    { title: 'infrastructure_system_topology_complex_v2.yaml', type: 'file' }
                  ];
                  const picked = mockFiles[Math.floor(Math.random() * mockFiles.length)];
                  addAttachment({ type: picked.type, title: picked.title, content: 'Mock SRE log data...' });
                }}
                className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                title="上传附件"
              >
                <Paperclip size={16} />
              </button>
              <button 
                onClick={() => {
                  const mockImages = ['p99_latency_spike_analysis_graph.png', 'k8s_node_oom_error_stack_trace_capture.jpg', 'database_iops_trend_monthly_comparison.png'];
                  const picked = mockImages[Math.floor(Math.random() * mockImages.length)];
                  addAttachment({ type: 'image', title: picked, content: 'Mock diagnostic image...' });
                }}
                className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all" 
                title="上传图片"
              >
                <ImageIcon size={16} />
              </button>

              {(activeMenu === 'home') && (
                <>
                  <div className="w-[1px] h-4 bg-slate-800/80 mx-2" />
                  <div className="flex items-center gap-1.5">
                    {/* Mutual exclusivity logic for @ tags */}
                    {[
                      { id: '@诊断专家', icon: Activity },
                      { id: '@巡检助手', icon: HeartPulse },
                      { id: '@知识专家', icon: BookOpen }
                    ].map(tag => (
                      <button 
                        key={tag.id}
                        onClick={() => {
                          setInputValue(prev => {
                            // If tag is already there, remove it (Toggle Off)
                            if (prev.includes(tag.id)) {
                              return prev.replace(tag.id, '').replace(/\s\s+/g, ' ').trim();
                            }
                            // Otherwise, replace existing tags with this one (Toggle On/Switch)
                            const clean = prev.replace(/@(诊断专家|知识专家|巡检助手)/g, '').replace(/\s\s+/g, ' ').trim();
                            return `${tag.id} ${clean}`.trim();
                          });
                        }} 
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all text-xs font-bold font-mono ${inputValue.includes(tag.id) ? 'bg-[#9882ff]/20 border-[#9882ff]/50 text-[#9882ff]' : 'border-slate-700/50 bg-[var(--bg-alarm)]/50 text-slate-400 hover:text-[#9882ff] hover:border-[#9882ff]/30'}`}
                      >
                        <tag.icon size={12} className={inputValue.includes(tag.id) ? 'text-[#9882ff]' : 'text-slate-500'} /> 
                        <span>{tag.id}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isListening && <VoiceWaveform />}
              <button 
                onClick={handleMicClick}
                className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all active:scale-90 group/mic ${
                  isListening 
                  ? 'bg-indigo-500/20 text-indigo-400 shadow-lg shadow-indigo-500/20' 
                  : 'text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10'
                }`}
                title="语音输入"
              >
                <div className="relative">
                  <Mic size={18} className={`relative z-10 ${isListening ? 'animate-pulse' : ''}`} />
                  {!isListening && (
                    <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-md opacity-0 group-hover/mic:opacity-100 transition-opacity animate-pulse" />
                  )}
                </div>
              </button>

              <button
                onClick={() => handleSend()}
              disabled={!inputValue.trim() && attachments.length === 0}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-xl transition-all ${inputValue.trim() || attachments.length > 0
                ? 'bg-gradient-to-r from-[#8b5cf6] to-[#a855f7] text-white hover:opacity-90 shadow-lg shadow-[#8b5cf6]/30 hover:scale-[1.02]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
            >
              <Send size={15} className="-ml-0.5" />
              <span className="text-xs font-bold tracking-wide">发送</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    );
  };

  const renderGlobalHeaderContent = () => {
    switch (activeMenu) {
      case 'diagnostic':
        return (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/5 border border-indigo-500/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">AI Inference Engine Active</span>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">SRE Copilot Ready</span>
          </div>
        );
    }
  };

  const inspectionContext = {
    taskName: inspectionTaskName,
    setTaskName: setInspectionTaskName,
    frequency: inspectionFrequency,
    setFrequency: setInspectionFrequency,
    ruleDraft: inspectionRuleDraft,
    targets: selectedInspectionTargets
  };

  return (
    <div className={`flex flex-col h-screen bg-[var(--bg-app)] font-sans overflow-hidden selection:bg-indigo-500/30 ${isDarkMode ? '' : 'light'}`}>

      {/* Global Header */}
      <header className="h-16 border-b border-slate-800/60 flex items-center bg-[var(--bg-header)] shrink-0 z-30">
        <div className="w-[180px] flex items-center px-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-500 flex items-center justify-center border border-indigo-500/20 shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
              <Activity size={20} />
            </div>
            <h1 className="font-bold text-slate-100 tracking-wide text-[15px] whitespace-nowrap">
              SRE Agent
            </h1>
          </div>
        </div>
        <div className="w-px h-8 bg-slate-800/60" />
        <div className="flex-1 flex items-center px-6">
          {renderGlobalHeaderContent()}
        </div>
        <div className="flex items-center gap-4 px-6">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1.5 rounded-lg hover:bg-slate-800/50"
            title={isDarkMode ? '切换到亮色模式' : '切换到暗色模式'}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="text-slate-500 hover:text-slate-300 transition-colors"><Settings size={18} /></button>
          <div className="w-8 h-8 rounded-full bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <User size={16} />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Primary Navigation Bar (Sidebar) */}
        <aside className="w-[68px] bg-[var(--bg-header)] flex flex-col shrink-0 border-r border-slate-800/60 relative z-[100] shadow-[4px_0_20px_rgba(0,0,0,0.3)]">
          {/* Menu Items */}
          <div className="flex-1 pt-6 pb-2 w-[68px] flex flex-col items-center relative z-[100]">
            {MENU_ITEMS.map((item) => {
              const isActive = activeMenu === item.id && activeMenu !== 'logs';
              const Icon = item.icon;

              return (
                <React.Fragment key={item.id}>
                  <button
                    onClick={() => handleMenuChange(item.id)}
                    className={`w-11 h-11 mb-5 mx-auto flex items-center justify-center relative group rounded-xl transition-all duration-200
                        ${isActive && item.id !== 'home'
                        ? 'bg-indigo-600 shadow-lg shadow-indigo-500/20 border border-indigo-400/50'
                        : 'hover:bg-slate-800/50 border border-transparent'}
                      `}
                  >
                    <Icon size={22} strokeWidth={1.5} className={`
                        transition-colors duration-200
                        ${isActive && item.id === 'home' ? 'text-slate-200' : ''}
                        ${isActive && item.id !== 'home' ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'}
                      `} />

                    {/* Premium Popover Tooltip */}
                    <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 pointer-events-none opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 z-[100]">
                      <div className="relative flex items-center">
                        {/* Triangle Arrow */}
                        <div className="w-1.5 h-1.5 bg-[var(--bg-tooltip)] border-l border-b border-slate-700/50 rotate-45 transform -translate-x-1" />
                        {/* Label Content */}
                        <div className="bg-[var(--bg-tooltip)]/95 backdrop-blur-md border border-slate-700/50 text-white px-3 py-1.5 rounded-lg whitespace-nowrap shadow-2xl shadow-black/40">
                           <span className="text-[11px] font-bold tracking-wider uppercase">{item.label}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                  {item.id === 'home' && (
                    <div className="w-8 h-px bg-slate-800 mb-5" />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Bottom History Area */}
          <div className="p-4 flex flex-col items-center gap-6 pb-6">
            <div 
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className={`w-11 h-11 flex items-center justify-center relative group rounded-xl transition-all duration-200 cursor-pointer ${isHistoryOpen ? 'bg-indigo-600 shadow-lg shadow-indigo-500/20 border border-indigo-400/50' : 'bg-[var(--bg-sidebar-btn)] border border-slate-800'}`}
              title="会话历史"
            >
              <History size={20} className={isHistoryOpen ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'} />
              {sessions.length > 0 && !isHistoryOpen && (
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-indigo-500 border border-slate-800" />
              )}
            </div>
          </div>
        </aside>

        {/* Session History Drawer */}
        <AnimatePresence>
          {isHistoryOpen && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="fixed left-[68px] top-0 bottom-0 w-[300px] bg-[var(--bg-deep)]/fb border-r border-slate-800 shadow-2xl z-30 flex flex-col backdrop-blur-xl"
            >
              <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <History size={16} className="text-indigo-400" /> 会话历史记录
                </h3>
                <button onClick={() => setIsHistoryOpen(false)} className="text-slate-500 hover:text-slate-100 transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
                {sessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-600 italic text-xs gap-3">
                    <History size={32} strokeWidth={1} opacity={0.3} />
                    暂无历史会话记录
                  </div>
                ) : (
                  sessions.map(session => {
                    const menuIcon = MENU_ITEMS.find(m => m.id === session.menuId)?.icon || Bot;
                    const Icon = menuIcon;
                    const isActive = activeSessionId === session.id;
                    return (
                      <div
                        key={session.id}
                        onClick={() => loadSession(session)}
                        className={`p-3 rounded-xl mb-1 cursor-pointer transition-all border ${isActive ? 'bg-indigo-600/10 border-indigo-500/30 ring-1 ring-indigo-500/10' : 'bg-transparent border-transparent hover:bg-slate-900/30 hover:border-slate-800'}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                            <Icon size={16} />
                          </div>
                          <div className="flex-1 min-w-0 pr-2">
                            <div className={`text-xs font-bold truncate ${isActive ? 'text-indigo-400' : 'text-slate-300'}`}>
                              {session.title}
                            </div>
                            <div className="text-[10px] text-slate-600 mt-1 font-medium">
                              {MENU_ITEMS.find(m => m.id === session.menuId)?.label} · {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="p-4 border-t border-slate-800">
                <button 
                  onClick={() => { setSessions([]); setActiveSessionId(null); }}
                  className="w-full py-2.5 text-[10px] text-slate-500 hover:text-rose-400 font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                  清除所有历史
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. Agent Card Panel (360px - hidden on most specialist tools) */}
        {activeMenu !== 'home' && activeMenu !== 'logs' && activeMenu !== 'diagnostic' && activeMenu !== 'capacity' && activeMenu !== 'inspection' && activeMenu !== 'knowledge' && activeMenu !== 'report' && activeMenu !== 'assistant' && (
          <aside className="w-[360px] bg-[var(--bg-card)] border-r border-slate-800/50 flex flex-col shrink-0">
            <div className="h-16 p-4 border-b border-slate-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-200">
                  {MENU_ITEMS.find(m => m.id === activeMenu)?.label} · 智能体卡片
                </span>
              </div>
              <button className="text-slate-500 hover:text-slate-300 transition-colors">
                <MoreHorizontal size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 no-scrollbar relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeMenu}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderAgentCards()}
                </motion.div>
              </AnimatePresence>
            </div>
          </aside>
        )}

        {/* 3. Right Main Panel (Chat & Logs) */}
        <main className="flex-1 flex flex-col bg-[var(--bg-app)] relative min-h-0 min-w-0">
          {(() => {
            switch (activeMenu) {
              case 'logs':
                return (
                  <LogsAssistantView
                    messages={messages}
                    chatEndRef={chatEndRef}
                    onAction={handleAction}
                    renderInput={renderInput}
                    isCollapsed={isLeftPanelCollapsed}
                    onToggle={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
                    activeLogCluster={activeLogCluster}
                    activeLogAnalysisSummary={activeLogAnalysisSummary}
                    isAnalyzingLogs={isAnalyzingLogs}
                    showLogContextBanner={showLogContextBanner}
                    inspectionContext={inspectionContext}
                  />
                );
              case 'capacity':
                return (
                  <CapacityAssistantView
                    messages={messages}
                    chatEndRef={chatEndRef}
                    onAction={handleAction}
                    renderInput={renderInput}
                    isCollapsed={isLeftPanelCollapsed}
                    onToggle={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
                    selectedResource={selectedCapacityResource}
                    isAnalyzingCapacity={isAnalyzingCapacity}
                    inspectionContext={inspectionContext}
                  />
                );
              case 'inspection':
                return (
                  <div className="flex-1 flex flex-col min-h-0 bg-[var(--bg-input)]">
                    <div className="flex-1 flex min-h-0">
                      {!isLeftPanelCollapsed && (
                        <InspectionDashboard
                          tasks={inspectionTasks}
                          activeTab={inspectionTab}
                          setActiveTab={setInspectionTab}
                          onAction={handleAction}
                          setShowBanner={setShowInspectionBanner}
                          selectedTask={selectedInspectionTask}
                          setSelectedTask={setSelectedInspectionTask}
                          analysisStatus={inspectionAnalysisStatus}
                        />
                      )}
                      <InspectionChat
                        messages={messages}
                        chatEndRef={chatEndRef}
                        onAction={handleAction}
                        renderInput={renderInput}
                        isCollapsed={isLeftPanelCollapsed}
                        onToggle={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
                        selectedTask={selectedInspectionTask}
                        showBanner={showInspectionBanner}
                        setShowBanner={setShowInspectionBanner}
                        analysisStatus={inspectionAnalysisStatus}
                        inspectionContext={inspectionContext}
                      />
                    </div>
                  </div>
                );
              case 'diagnostic':
                return (
                  <div className="flex-1 flex min-h-0 bg-[var(--bg-deepest)]">
                    {!isLeftPanelCollapsed && (
                      <div className="w-1/4 border-r border-slate-800 flex flex-col min-h-0 transition-all duration-300">
                        <DiagnosticAlertPanel
                          onDiagnose={handleOneClickDiagnose}
                          onSelect={handleAlarmClick}
                          selectedAlarmId={selectedAlarm?.id}
                          onToggle={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
                          diagnosedAlarms={diagnosedAlarms}
                          onAction={handleAction}
                        />
                      </div>
                    )}
                    <div className="flex-1 flex flex-col min-h-0 relative border-l border-slate-800/10">
                      <DiagnosticChatPanel
                        messages={messages}
                        chatEndRef={chatEndRef}
                        onAction={handleAction}
                        renderInput={renderInput}
                        isCollapsed={isLeftPanelCollapsed}
                        onToggle={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
                        selectedAlarm={selectedAlarm}
                        showBanner={showContextBanner}
                        inspectionContext={inspectionContext}
                      />
                    </div>
                  </div>
                );
              case 'knowledge':
                return (
                  <div className="flex-1 flex min-h-0 bg-[var(--bg-deepest)] relative overflow-hidden">
                    <div className="flex-1 flex flex-col min-h-0 relative bg-slate-900/40 z-0">
                      <KnowledgeChatPanel
                        messages={messages}
                        chatEndRef={chatEndRef}
                        renderInput={renderInput}
                        selectedLibIds={selectedKLibIds}
                        selectedDocId={selectedKDocId}
                        isCollapsed={isLeftPanelCollapsed}
                        onToggle={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
                        onAction={handleAction}
                        inspectionContext={inspectionContext}
                      />
                    </div>
                    <SourceTraceDrawer
                      isOpen={isSourceDrawerOpen}
                      onClose={() => setIsSourceDrawerOpen(false)}
                      data={activeSourceData}
                      onAction={handleAction}
                    />
                  </div>
                );
              case 'network':
              case 'database':
                return (
                  <div className="flex-1 flex flex-col min-h-0 bg-[var(--bg-deepest)] relative overflow-hidden">
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4 opacity-40">
                      {activeMenu === 'network' ? <Network size={64} strokeWidth={1} /> : <Database size={64} strokeWidth={1} />}
                      <div className="text-sm font-bold tracking-widest uppercase">
                        {activeMenu === 'network' ? '网络拓扑可视化引擎' : '数据资产智能索引'} · 建设中
                      </div>
                    </div>
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6">
                      {renderInput()}
                    </div>
                  </div>
                );
              case 'report':
                return (
                  <ReportAssistantView
                    messages={messages}
                    chatEndRef={chatEndRef}
                    onAction={handleAction}
                    renderInput={renderInput}
                    isCollapsed={isLeftPanelCollapsed}
                    onToggle={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
                    inspectionContext={inspectionContext}
                  />
                );
              case 'assistant':
                return (
                  <AssistantChatView
                    messages={messages}
                    chatEndRef={chatEndRef}
                    onAction={handleAction}
                    renderInput={renderInput}
                    isCollapsed={isLeftPanelCollapsed}
                    onToggle={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
                    inspectionContext={inspectionContext}
                  />
                );
              case 'home':
              default:
                return (
                  <div className="flex-1 overflow-y-auto w-full no-scrollbar scroll-smooth">
                    <div className="flex flex-col min-h-full mx-auto px-4 md:px-8">
                      <div className="my-auto w-full flex flex-col items-center py-6">
                        <div className="max-w-4xl w-full mb-8">
                          
                          {/* Top Header matching screenshot */}
                          <div className="flex flex-col items-center mb-6 relative">
                            <div className="flex items-center justify-center gap-3 mb-2">
                              {/* Robot Logo Icon */}
                              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 border border-slate-700 shadow-[0_4px_20px_rgba(99,102,241,0.4)] flex items-center justify-center relative z-10 transition-transform hover:scale-105 duration-300">
                                <Bot size={22} className="text-white relative z-20" />
                              </div>
                              <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">SRE 智能助手</h2>
                            </div>
                            <p className="text-slate-400 text-xs font-medium max-w-xl text-center leading-relaxed">
                              今日 <span className="text-rose-500 font-bold mx-0.5">3 条活跃告警</span>待处理。直接描述问题，或从下方场景快速发起。
                            </p>
                          </div>

                          <div className="w-full relative space-y-4">
                            {/* Active Alert Banner - Dynamic Scrolling with Animation */}
                            <div 
                              className="w-full bg-[var(--bg-app)]/80 border border-rose-500/20 rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm relative overflow-hidden group/banner"
                              onMouseEnter={() => setIsHoveringBanner(true)}
                              onMouseLeave={() => setIsHoveringBanner(false)}
                            >
                              <div className="flex-1 min-w-0 relative h-5 overflow-hidden">
                                <AnimatePresence mode="wait">
                                  <motion.div
                                    key={currentAlertIndex}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    className="flex items-center gap-2 text-xs truncate"
                                  >
                                    <AlertTriangle size={14} className={HOT_ALERTS[currentAlertIndex].level === '严重' || HOT_ALERTS[currentAlertIndex].level === '紧急' ? 'text-rose-500' : 'text-orange-500'} />
                                    <span className={`${HOT_ALERTS[currentAlertIndex].level === '严重' || HOT_ALERTS[currentAlertIndex].level === '紧急' ? 'text-rose-500' : 'text-orange-500'} font-bold shrink-0`}>
                                      [{HOT_ALERTS[currentAlertIndex].level}]
                                    </span>
                                    <span className="text-slate-400 font-mono font-bold shrink-0">{HOT_ALERTS[currentAlertIndex].service}</span>
                                    <span className="text-slate-200 font-medium truncate">{HOT_ALERTS[currentAlertIndex].title}</span>
                                  </motion.div>
                                </AnimatePresence>
                              </div>
                              <button 
                                onClick={() => handleDiagFromNotification(HOT_ALERTS[currentAlertIndex])}
                                className="shrink-0 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 active:scale-95 ml-4"
                              >
                                立即诊断 <ArrowRight size={10} className="ml-0.5 group-hover/banner:translate-x-0.5 transition-transform" />
                              </button>
                            </div>

                            {/* Render AI Chat Input */}
                            {renderInput()}

                            {/* Quick Action Tag Bubbles matching screenshot */}
                            <div className="flex flex-wrap items-center gap-2 mt-4">
                              <button onClick={() => setInputValue(prev => {
                                const tagMatch = prev.match(/@(诊断专家|巡检助手|知识专家)/);
                                return tagMatch ? `${tagMatch[0]} 帮我分析当前活跃告警根因` : '帮我分析当前活跃告警根因';
                              })} className="px-3 py-1.5 bg-[var(--bg-hover)] hover:bg-[var(--bg-active-alt)] border border-slate-700/50 rounded-lg text-[11px] text-slate-300 transition-all flex items-center gap-1.5 font-bold shadow-sm">
                                 <Activity size={12} className="text-indigo-400" /> 分析当前活跃告警根因
                               </button>
                               <button onClick={() => setInputValue(prev => {
                                const tagMatch = prev.match(/@(诊断专家|巡检助手|知识专家)/);
                                return tagMatch ? `${tagMatch[0]} 当前服务响应慢，帮我排查链路瓶颈` : '当前服务响应慢，帮我排查链路瓶颈';
                              })} className="px-3 py-1.5 bg-[var(--bg-hover)] hover:bg-[var(--bg-active-alt)] border border-slate-700/50 rounded-lg text-[11px] text-slate-300 transition-all flex items-center gap-1.5 font-bold shadow-sm">
                                 <Network size={12} className="text-indigo-400" /> 服务响应慢，排查链路瓶颈
                               </button>
                               <button onClick={() => setInputValue(prev => {
                                const tagMatch = prev.match(/@(诊断专家|巡检助手|知识专家)/);
                                return tagMatch ? `${tagMatch[0]} 查询 payment 服务的故障处置 SOP` : '@知识专家 查询 payment 服务的故障处置 SOP';
                              })} className="px-3 py-1.5 bg-[var(--bg-hover)] hover:bg-[var(--bg-active-alt)] border border-slate-700/50 rounded-lg text-[11px] text-slate-300 transition-all flex items-center gap-1.5 font-bold shadow-sm">
                                 <BookOpen size={12} className="text-indigo-400" /> 查询故障处​置 SOP
                               </button>
                               <button onClick={() => setInputValue(prev => {
                                const tagMatch = prev.match(/@(诊断专家|巡检助手|知识专家)/);
                                return tagMatch ? `${tagMatch[0]} 帮我生成今日运维巡检报告` : '@巡检助手 帮我生成今日运维巡检报告';
                              })} className="px-3 py-1.5 bg-[var(--bg-hover)] hover:bg-[var(--bg-active-alt)] border border-slate-700/50 rounded-lg text-[11px] text-slate-300 transition-all flex items-center gap-1.5 font-bold shadow-sm">
                                 <FileText size={12} className="text-indigo-400" /> 生成今日运维巡检报告
                               </button>
                               <button onClick={() => setInputValue(prev => {
                                const tagMatch = prev.match(/@(诊断专家|巡检助手|知识专家)/);
                                return tagMatch ? `${tagMatch[0]} 今日告警收效和降噪情况如何？` : '今日告警收效和降噪情况如何？';
                              })} className="px-3 py-1.5 bg-[var(--bg-hover)] hover:bg-[var(--bg-active-alt)] border border-slate-700/50 rounded-lg text-[11px] text-slate-300 transition-all flex items-center gap-1.5 font-bold shadow-sm">
                                 <Bell size={12} className="text-indigo-400" /> 今日告警收效汇总
                               </button>
                            </div>
                          </div>
                        </div>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-6xl">
                          {renderHomeDashboard()}
                        </motion.div>
                      </div>
                    </div>
                  </div>
                );
            }
          })()}
        </main>



        <DiagnosticReportDrawer
          isOpen={isReportDrawerOpen}
          onClose={() => setIsReportDrawerOpen(false)}
          data={activeReportData}
        />
      </div>
    </div>
  );
}
