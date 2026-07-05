import React, { useState, useRef, useEffect, useMemo, type ReactNode } from 'react';
import {
  AlertCircle, Search, Calendar, TrendingUp, Mic, Image as ImageIcon, Send, Info,
  Bot, User, CheckCircle2, Clock, Zap, MoreHorizontal, Terminal, Activity,
  ShieldAlert, Settings, ClipboardList, BarChart2, BookOpen, HeartPulse,
  FileText, Download, Play, Check, ChevronDown, ChevronRight, Home,
  Plus, Bell, Network, CheckSquare, Database, Shield, ChevronLeft, ChevronUp, Paperclip, X, Save, Lock, Edit, HelpCircle,
  AlertTriangle, Box, Filter, SlidersHorizontal, ArrowUpDown, Cpu, Server, Layers, HardDrive, Brain, Flame, Sparkles, Minus, Maximize,
  PlusCircle, BarChart3, LayoutDashboard, ListTodo, FilePieChart, ArrowUpRight, ArrowDownRight, RefreshCw, History, Maximize2, Folder, PanelLeft, PanelLeftClose, ShieldCheck, MessageSquare,
  Monitor, ArrowRight, Code, ClipboardCheck, Target, ArrowLeft, Book, Files, Share2, Quote, ExternalLink, Library, Loader2, Copy, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';

// --- Types ---
type MessageType = 'user' | 'ai' | 'system';
type ContentType = 'text' | 'voice' | 'image' | 'confirm' | 'analysis' | 'sop' | 'report' | 'target_select' | 'rule_draft' | 'frequency_select' | 'task_summary' | 'rule_review' | 'schedule_review' | 'task_success' | 'incident_report' | 'change_list' | 'recovery_action' | 'inspection_type' | 'inspection_cron_confirm' | 'inspection_progress' | 'inspection_result_table' | 'action_confirm' | 'action_execution' | 'alarm_context' | 'inspection_task_select' | 'log_cluster_selection' | 'inspection_diagnostic_report' | 'inspection_conclusion' | 'inspection_deep_dive' | 'inspection_closure' | 'log_analysis_init' | 'log_analysis_retrieval' | 'log_analysis_correlation' | 'log_analysis_evidence' | 'log_analysis_diagnosis' | 'log_analysis_action' | 'mysql_task_edit_list' | 'self_heal_recommendation' | 'remediation_offer' | 'remediation_review' | 'remediation_confirm';
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
      className={`bg-[#161a29] ${hideStatusBorder ? '' : `border-l-4 ${statusColors[status]}`} ${useStandardRounded ? 'rounded-2xl' : 'rounded-r-lg'} p-4 mb-4 shadow-sm relative overflow-hidden group hover:bg-[#1a1f33] transition-all ${onClick ? 'cursor-pointer hover:ring-1 hover:ring-indigo-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]' : ''}`}
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
          <h3 className="font-bold text-sm text-slate-100 group-hover:text-white transition-colors">{title}</h3>
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
        className={`group cursor-pointer transition-colors border-b border-slate-800/50 hover:bg-white/[0.02] ${isExpanded ? 'bg-white/[0.03]' : ''}`}
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

  let displayedTargets = MOCK_TARGETS.filter(t => t.type === activeType && (t.name.toLowerCase().includes(search.toLowerCase()) || t.cluster.toLowerCase().includes(search.toLowerCase())));
  if (data?.isMysql && activeType === 'DB') {
    displayedTargets = displayedTargets.filter(t => t.name.toLowerCase().includes('mysql'));
  }

  return (
    <div className="bg-[#141418] border border-slate-800 rounded-xl overflow-hidden shadow-2xl w-full max-w-[480px]">
      <div className={`p-2 border-b border-slate-800 flex items-center justify-center transition-all min-h-[32px] ${status.bg}`}>
        <span className={`text-[10px] font-bold ${status.color}`}>
          {status.hasIcon && <span className="mr-1">⚠️</span>}
          {status.text}
        </span>
      </div>
      <div className="p-3 border-b border-slate-800 bg-white/[0.02] flex items-center gap-2">
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
                className={`flex items-center justify-between px-3 py-2.5 text-[11px] font-bold transition-all ${activeType === type.key ? 'bg-blue-600/10 text-blue-400 border-r-2 border-blue-500' : 'text-slate-400 hover:bg-white/[0.02]'}`}
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
              className="px-4 py-2 bg-white/[0.03] border-b border-slate-800 flex items-center gap-3 cursor-pointer hover:bg-white/[0.05] transition-all"
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
      <div className="p-3 bg-[#1a1a20] border-t border-slate-800 flex items-center justify-between">
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
  <div className="bg-[#141418] border border-slate-800 rounded-xl overflow-hidden shadow-2xl w-full max-w-[340px]">
    <div className="p-3 border-b border-slate-800 bg-white/[0.02] flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Zap size={14} className="text-blue-400" />
        <span className="text-xs font-bold text-slate-300">巡检规则转译确认</span>
      </div>
      <div className="text-[10px] text-slate-600 font-mono tracking-tighter">NLP to Structured v2</div>
    </div>
    <div className="p-4 space-y-4">
      <div className="p-2.5 rounded bg-white/[0.03] border border-slate-800 italic text-[10px] text-slate-500 mb-2">
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
    <div className="p-3 bg-white/[0.02] border-t border-slate-800 flex gap-2">
      <button onClick={() => onAction('RETRY_RULE')} className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded border border-slate-700/50 transition-all">修改</button>
      <button onClick={() => onAction('STEP_SCHEDULE')} className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded shadow-lg shadow-blue-500/20 transition-all">确认规则</button>
    </div>
  </div>
);

const ScheduleReviewCard: React.FC<{ data: any, onAction: any }> = ({ data, onAction }) => (
  <div className="bg-[#141418] border border-slate-800 rounded-xl overflow-hidden shadow-2xl w-full max-w-[340px]">
    <div className="p-3 border-b border-slate-800 bg-white/[0.02] flex items-center gap-2">
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
    <div className="p-3 bg-white/[0.02] border-t border-slate-800 flex gap-2">
      <button 
        onClick={() => onAction('STEP_SCHEDULE_BACK')} 
        className="flex items-center justify-center px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-300 text-[10px] font-bold rounded border border-slate-700/50 transition-all active:scale-95"
      >
        修改
      </button>
      <button onClick={() => onAction('STEP_FINISH')} className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded shadow-lg shadow-blue-500/20">创建巡检计划</button>
    </div>
  </div>
);

const TaskSuccessCard: React.FC<{ data: any, onAction: any }> = ({ data, onAction }) => (
  <div className="bg-[#141418] border border-emerald-500/30 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.1)] w-full max-w-[340px]">
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

      <div className="w-full bg-black/40 rounded-xl border border-slate-800 p-3 mb-6 flex flex-col gap-2">
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
      <div className="bg-[#141418] border border-slate-800 rounded-xl px-5 py-4 flex items-center shadow-2xl relative overflow-visible group/header">
        <div className="absolute top-0 right-0 w-64 h-full bg-blue-500/[0.02] -skew-x-12 translate-x-32 pointer-events-none" />

        <div className="flex items-center gap-5 z-20 w-full">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase whitespace-nowrap">级别:</span>
            <div className="relative">
              <button
                onClick={() => setIsLevelOpen(!isLevelOpen)}
                onBlur={() => setTimeout(() => setIsLevelOpen(false), 200)}
                className="flex items-center justify-between gap-3 px-3 py-1.5 bg-black/40 border border-slate-700/50 rounded-lg min-w-[100px] hover:border-slate-500 transition-all text-xs group/btn"
              >
                <div className="flex items-center gap-2">
                  {selectedLevelObj.dot && <span className={`w-1.5 h-1.5 rounded-full ${selectedLevelObj.dot}`} />}
                  <span className={`font-bold ${selectedLevelObj.clr}`}>{selectedLevelObj.label}</span>
                </div>
                <ChevronDown size={12} className={`text-slate-500 transition-transform ${isLevelOpen ? 'rotate-180' : ''}`} />
              </button>
              {isLevelOpen && (
                <div className="absolute top-full left-0 mt-2 w-full bg-[#1c1c22] border border-slate-700 rounded-lg shadow-2xl overflow-hidden z-50">
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
                className="flex items-center justify-between gap-3 px-3 py-1.5 bg-black/40 border border-slate-700/50 rounded-lg min-w-[100px] hover:border-slate-500 transition-all text-xs group/btn"
              >
                <span className={`font-bold ${filterType === '全部' ? 'text-slate-400' : 'text-blue-400'}`}>{filterType}</span>
                <ChevronDown size={12} className={`text-slate-500 transition-transform ${isTypeOpen ? 'rotate-180' : ''}`} />
              </button>
              {isTypeOpen && (
                <div className="absolute top-full left-0 mt-2 w-full bg-[#1c1c22] border border-slate-700 rounded-lg shadow-2xl overflow-hidden z-50">
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
              className="bg-black/40 border border-slate-800 text-[11px] pl-9 pr-4 py-1.5 rounded-lg w-full focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600 font-medium"
            />
            {searchQuery && <X size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 cursor-pointer hover:text-white" onClick={() => setSearchQuery('')} />}
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
      <div className="bg-[#141418] border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
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
              <tr className="bg-white/[0.03] border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
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
          <button className="text-[11px] text-slate-500 hover:text-white flex items-center gap-1 transition-colors"><ChevronLeft size={14} /> 上一页</button>
          <div className="flex items-center gap-1 px-4">
            {[1, 2, 3, 4, 5].map(p => (
              <button key={p} className={`w-6 h-6 rounded flex items-center justify-center text-[11px] transition-all ${p === 1 ? 'bg-blue-600 text-white font-bold' : 'text-slate-500 hover:bg-slate-800'}`}>{p}</button>
            ))}
          </div>
          <button className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 transition-colors">下一页 <ChevronRight size={14} /></button>
        </div>
        <span className="text-[11px] text-slate-500">显示第 1-{filteredAlarms.length} 条 / 共 {filteredAlarms.length} 条 (已过滤)</span>
      </div>
    </div>
  );
};
const IncidentReportCard = ({ data, onAction }: any) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 bg-[#141418] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
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
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 bg-[#141418] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
    <div className="bg-blue-500/10 p-4 border-b border-slate-800">
      <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
        <ClipboardList size={16} className="text-blue-400" /> {data.service} 近 {data.time_window_minutes} 分钟变更记录
      </h4>
    </div>
    <div className="divide-y divide-slate-800">
      {data.changes.map((chg: any) => (
        <div key={chg.id} className="p-4 hover:bg-white/[0.02] transition-colors">
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
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 bg-[#141418] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
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
    <div className="bg-[#141418] border border-slate-800 rounded-xl overflow-hidden shadow-2xl w-full max-w-[360px] animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="p-3 border-b border-slate-800 bg-white/[0.02] flex items-center gap-2">
        <Search size={14} className="text-slate-500" />
        <input type="text" placeholder="搜索或选择计划..." className="bg-transparent border-none text-[11px] text-slate-300 focus:outline-none w-full" />
      </div>
      <div className="p-3 space-y-4 max-h-[400px] overflow-y-auto no-scrollbar">
        <div className="space-y-2">
          <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> 最近有异常的计划 (2个)
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
                诊断此计划
              </button>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 全部计划
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
                诊断此计划
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="p-3 bg-white/[0.02] border-t border-slate-800 text-[10px] text-slate-500 italic">
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
    { id: 3, title: '结果汇总与修复方案', status: currentStep >= 3 ? 'done' : 'waiting' },
  ];

  return (
    <div className="bg-[#141418] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl w-full max-w-[420px] animate-in fade-in duration-500">
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
              <div className="flex items-center gap-2 px-2 py-1.5 bg-black/40 rounded-lg border border-slate-800/50 overflow-hidden">
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
                  <div key={i} className="bg-black/40 p-2 rounded-lg border border-slate-800/50 flex items-start justify-between">
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
                  <Zap size={12} /> 一键执行修复
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
        <div className="p-3 bg-white/[0.02] border-t border-slate-800 text-center">
          <span className="text-[9px] text-slate-600 italic font-medium tracking-tight">已完成告警事件根因分析 · 状态已归档</span>
        </div>
      )}
    </div>
  );
};

const InspectionConclusionCard: React.FC<{ data: any, onAction: any }> = ({ data, onAction }) => (
  <div className="bg-[#141418] border border-blue-500/30 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.1)] w-full max-w-[400px] animate-in zoom-in-95 duration-500">
    <div className="p-4 border-b border-slate-800 bg-white/[0.02] flex items-center gap-2">
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
              <span className="text-slate-300 text-xs">临时暂停该巡检计划</span>
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
    <div className="p-4 bg-white/[0.02] border-t border-slate-800 flex flex-wrap gap-2">
      <button onClick={() => onAction('DEEP_DIVE')} className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded shadow-lg shadow-blue-600/20 transition-all active:scale-95">🔬 深入分析</button>
      <button className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-bold rounded border border-slate-700 transition-all">📋 复制报告</button>
      <button onClick={() => onAction('MARK_SOLVED')} className="flex-1 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-500 text-[10px] font-bold rounded border border-emerald-500/30 transition-all">✅ 已解决</button>
    </div>
  </div>
);

const InspectionDeepDiveCard: React.FC<{ data: any, onAction: any }> = ({ data, onAction }) => (
  <div className="bg-[#141418] border border-purple-500/30 rounded-xl overflow-hidden shadow-2xl w-full max-w-[400px] animate-in slide-in-from-left-4 duration-500">
    <div className="p-3 border-b border-slate-800 bg-purple-500/5 flex items-center gap-2">
      <Brain size={16} className="text-purple-400" />
      <span className="text-sm font-bold text-slate-200">🔬 深度探测报告 (备用通道)</span>
    </div>
    <div className="p-4 space-y-4">
      <div className="p-3 bg-black/40 rounded-lg border border-slate-800 space-y-3">
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
    <div className="p-3 bg-white/[0.02] border-t border-slate-800 flex gap-2">
      <button className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded">👤 查看操作审计</button>
      <button className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded transition-all shadow-lg shadow-blue-600/30">📞 通知运维处理</button>
    </div>
  </div>
);

const InspectionClosureCard: React.FC<{ onAction: any }> = ({ onAction }) => (
  <div className="bg-[#141418] border border-emerald-500/30 rounded-xl overflow-hidden shadow-2xl w-full max-w-[360px] animate-in fade-in zoom-in-95 duration-500">
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
        <button onClick={() => onAction('RESUME_TASK')} className="py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg transition-all shadow-lg shadow-emerald-600/20">▶️ 恢复计划</button>
        <button onClick={() => onAction('GO_HOME')} className="py-2 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold rounded-lg border border-slate-700 transition-all">🏠 回到首页</button>
      </div>
    </div>
  </div>
);

const InspectionTypeCard = ({ onAction }: any) => (
  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 grid grid-cols-2 gap-4 w-full max-w-[500px]">
    <div
      onClick={() => onAction?.('SET_INSPECTION_MODE', { mode: 'scheduled' })}
      className="bg-[#1a1a20] border border-slate-800 hover:border-blue-500/50 hover:bg-blue-500/[0.02] p-6 rounded-2xl cursor-pointer transition-all group shadow-xl relative overflow-hidden"
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
      className="bg-[#1a1a20] border border-slate-800 hover:border-orange-500/50 hover:bg-orange-500/[0.02] p-6 rounded-2xl cursor-pointer transition-all group shadow-xl relative overflow-hidden"
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
  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 bg-[#1a1a20] border border-blue-500/30 rounded-xl p-5 shadow-2xl w-full max-w-[340px]">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
        <Calendar size={18} className="text-blue-400" />
      </div>
      <div>
        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">定时策略确认</h4>
        <p className="text-xs font-bold text-slate-200">AI 已解析调度计划</p>
      </div>
    </div>
    <div className="bg-black/30 rounded-lg p-3 mb-5 border border-slate-800 space-y-3">
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
      <button onClick={() => onAction?.('STEP_FINISH')} className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded transition-all">确认创建计划</button>
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
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 bg-[#141418] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl w-full max-w-[800px]">
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
          <div key={rule.id} className="bg-black/40 border border-slate-800/80 rounded-xl px-4 py-2 group hover:border-slate-700 transition-all">
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
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 bg-[#141418] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl w-full max-w-[400px]">
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
                  : 'bg-black/40 border-slate-800 text-slate-500 hover:border-slate-700'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-2">计划名称</label>
            <input 
              type="text" 
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="例如: 订单库生产环境日巡检" 
              className="w-full bg-black/50 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50 focus:bg-black/80 transition-all font-bold"
            />
          </div>
          <div>
             <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest block mb-2">首次运行时间</label>
             <div className="text-xs text-slate-400 font-mono bg-black/40 p-3 rounded-xl border border-slate-800 inline-block w-full">
                2026-04-12 03:00:00 (UTC+8)
             </div>
          </div>
        </div>
      </div>

      <div className="p-5 bg-black/40 border-t border-slate-800/60 flex gap-3">
        <button onClick={() => onAction?.('STEP_RULE_BACK')} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold rounded-lg border border-slate-700/50 transition-all">上一步</button>
        <button onClick={() => onAction?.('STEP_CONFIRMATION')} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black rounded-lg transition-all shadow-lg shadow-indigo-500/20 active:scale-95">生成计划预览</button>
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
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 bg-[#141418] border border-blue-500/30 rounded-2xl overflow-hidden shadow-2xl w-full max-w-[360px] relative">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-blue-400"><ClipboardCheck size={80} /></div>
      <div className="p-5 flex items-center justify-between border-b border-white/[0.03]">
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
  
         <div className="p-3 bg-black/40 rounded-xl border border-slate-800/80 space-y-1">
            <div className="text-[9px] text-slate-600 font-black uppercase tracking-widest">预计生效时间</div>
            <div className="text-xs text-slate-400 font-mono tracking-tighter">立即生效 (2026-04-15)</div>
         </div>
      </div>
  
      <div className="p-5 bg-white/[0.02] border-t border-white/[0.05] flex gap-3">
         <button onClick={() => onAction?.('STEP_SCHEDULE_BACK')} className="flex-1 py-1.5 bg-slate-800/50 hover:bg-slate-800 text-slate-500 hover:text-slate-300 text-[10px] font-bold rounded-lg border border-slate-700/50 transition-all uppercase tracking-widest">返回修改</button>
         <button onClick={() => onAction?.('STEP_FINISH')} className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black rounded-lg transition-all shadow-lg shadow-blue-500/20 active:scale-95 uppercase tracking-widest">确认创建计划</button>
      </div>
    </motion.div>
  );
};

const InspectionProgressCard = ({ data }: any) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 bg-[#141418] border border-slate-800 rounded-xl overflow-hidden shadow-2xl w-full max-w-[340px]">
    <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-white/[0.02]">
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
  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 bg-[#141418] border border-slate-800 rounded-xl overflow-hidden shadow-2xl w-full max-w-[400px]">
    <div className="bg-emerald-500/10 p-4 border-b border-slate-800 flex justify-between items-center relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-full bg-emerald-500/5 -skew-x-12 translate-x-16 pointer-events-none" />
      <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2 z-10">
        <CheckCircle2 size={16} className="text-emerald-500" /> 巡检计划执行报告
      </h4>
      <span className="text-[9px] text-slate-500 font-mono z-10 px-2 py-0.5 bg-black/40 rounded border border-slate-800 uppercase tracking-widest">Done</span>
    </div>
    <div className="p-5">
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-black/40 p-3.5 rounded-xl border border-slate-800/50 relative group">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">检查通过率</div>
          <div className="text-2xl font-bold text-slate-200">100<span className="text-xs text-slate-500 ml-1.5 font-normal tracking-normal">% Success</span></div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-emerald-500/20 group-hover:bg-emerald-500/40 transition-colors" />
        </div>
        <div className="bg-black/40 p-3.5 rounded-xl border border-slate-800/50 relative group">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">风险评级</div>
          <div className="text-2xl font-bold text-emerald-500">LOW</div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-emerald-500/20 group-hover:bg-emerald-500/40 transition-colors" />
        </div>
      </div>

      <div className="border border-slate-800/80 rounded-xl overflow-hidden mb-6 bg-black/20 shadow-inner">
        <table className="w-full text-left text-[11px]">
          <thead className="bg-white/[0.03] text-slate-500 border-b border-slate-800/80 uppercase">
            <tr>
              <th className="px-4 py-2.5 font-bold tracking-widest">审计项 / Checklist</th>
              <th className="px-4 py-2.5 font-bold tracking-widest text-right">结果 / Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            <tr className="hover:bg-white/[0.01] transition-colors">
              <td className="px-4 py-2.5 text-slate-400">证书生命周期合规检测</td>
              <td className="px-4 py-2.5 text-emerald-500 font-bold text-right">PASS</td>
            </tr>
            <tr className="hover:bg-white/[0.01] transition-colors">
              <td className="px-4 py-2.5 text-slate-400">外部暴露面安全审计</td>
              <td className="px-4 py-2.5 text-emerald-500 font-bold text-right">PASS</td>
            </tr>
            <tr className="hover:bg-white/[0.01] transition-colors">
              <td className="px-4 py-2.5 text-slate-400">Kubernetes 资源配额校验</td>
              <td className="px-4 py-2.5 text-orange-400 font-bold text-right">WARN</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex gap-3 pt-5 border-t border-slate-800/80">
        <button onClick={() => onAction?.('STEP_SCHEDULE')} className="flex-1 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-[11px] font-bold rounded-lg border border-blue-500/20 flex items-center justify-center gap-2 transition-all group">
          <Clock size={14} className="group-hover:rotate-12 transition-transform" /> 转为定时计划
        </button>
        <button className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold rounded-lg border border-slate-700/50 transition-all flex items-center justify-center gap-2">
          <FileText size={14} /> 查看报告
        </button>
      </div>
    </div>
  </motion.div>
);



const RISK: Record<string, { label: string, cls: string }> = {
  low: { label: "低", cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  mid: { label: "中", cls: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  high: { label: "高", cls: "text-rose-400 bg-rose-500/10 border-rose-500/30" }
};
const ORD: Record<string, number> = { low: 0, mid: 1, high: 2 };
const TRUST: Record<string, { label: string, cls: string }> = {
  high: { 
    label: "可信度较高", 
    cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25 shadow-[0_0_10px_rgba(16,185,129,0.08)]" 
  },
  mid: { 
    label: "可信度中等", 
    cls: "text-amber-400 bg-amber-500/10 border-amber-500/25 shadow-[0_0_10px_rgba(245,158,11,0.08)]" 
  },
  low: { 
    label: "可信度偏低", 
    cls: "text-rose-400 bg-rose-500/10 border-rose-500/25 shadow-[0_0_10px_rgba(239,68,68,0.08)]" 
  }
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

  if (/(drop\s+table|truncate)\b|delete\s+from/.test(s)) {
    findings.push({ sev: 'high', t: '破坏性数据操作（delete / drop / truncate）' });
    bump('high');
    destructive = true;
  }
  if (/(kill|restart|reboot|shutdown)\b/.test(s)) {
    findings.push({ sev: 'high', t: '进程 / 服务重启类操作' });
    bump('high');
    destructive = true;
  }
  if (/maximumpoolsize|max_connections|capacity|\bscale\b/.test(s)) {
    findings.push({ sev: 'high', t: '容量 / 连接池调整，可能放大下游共享资源压力' });
    bump('high');
  }
  if (/alter\s+table/.test(s)) {
    findings.push({ sev: 'mid', t: '表结构变更，可能加锁阻塞' });
    bump('mid');
  }
  if (/ratelimit|circuitbreaker|fallback|degrade/.test(s)) {
    findings.push({ sev: 'mid', t: '流量整形（限流 / 熔断 / 降级）' });
    bump('mid');
  }
  if (/add\s+index/.test(s)) {
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
  const flags: { sev: 'high' | 'mid' | 'low'; title: string; desc: string }[] = [];
  
  if (ORD[sc.derived] > ORD[cand.declaredRisk]) {
    flags.push({ 
      title: "风险等级冲突", 
      desc: `大模型自评为「${RISK[cand.declaredRisk].label}风险」，但静态分析该脚本包含参数扩容操作，安全等级已被强行上调为「${RISK[sc.derived].label}风险」。`, 
      sev: 'high' 
    });
  }
  if (sc.destructive) {
    flags.push({ 
      title: "含破坏性指令", 
      desc: "检测到脚本中包含了具备删除或截断倾向的物理指令，上线运行需提供最高级别的授权并进行受控沙盒仿真。", 
      sev: 'high' 
    });
  }
  if (!cand.reasonConsistent) {
    flags.push({ 
      title: "执行逻辑矛盾", 
      desc: "大模型推荐原因中声称的处置动作与脚本内生成的 SQL 实际动作不一致，存在大模型表达幻觉的风险。", 
      sev: 'high' 
    });
  }
  if (ungrounded.length) {
    flags.push({ 
      title: "引用实体越界", 
      desc: `脚本中引用了本次故障关联上下文之外的物理实体 (${ungrounded.join("、")})，需仔细核查该操作是否会扩大故障爆炸半径。`, 
      sev: 'mid' 
    });
  }
  if (!cand.scopeVerified) {
    flags.push({ 
      title: "影响范围未核验", 
      desc: "该修复方案的影响范围纯属大模型自我声明，系统未能通过物理网络及配置拓扑对其完成合规性物理校对。", 
      sev: 'mid' 
    });
  }
  
  const effective = ORD[sc.derived] > ORD[cand.declaredRisk] ? sc.derived : cand.declaredRisk;
  let conf = cand.confidence - flags.reduce((a, f) => a + (f.sev === 'high' ? 0.2 : 0.1), 0);
  const trust = conf >= 0.7 ? 'high' : conf >= 0.45 ? 'mid' : 'low';
  
  return { ...sc, ungrounded, flags, effective, trust };
}

const getRemediationMockData = (id: string) => {
  return {
    name: "清理临时归档日志并重启 mysql-user-slave-01 复制线程",
    risk: "中",
    confidence: "94%",
    sourceId: "SCRIPT-MYSQL-CLEANUP-v2.1",
    script: `#!/bin/bash
echo "[INFO] Checking replica status on mysql-user-slave-01..."
mysql -u root -e "SHOW SLAVE STATUS" | grep "Seconds_Behind_Master"
echo "[WARN] Disk space critical (95%). Executing safe binlog truncation..."
rm -rf /var/log/mysql/mysql-bin.000*
echo "[SUCCESS] Disk space freed. Current usage: 41%."`,
    steps: [
      { id: 1, desc: "检查从库节点 SSH 可达性与只读状态", duration: 1200 },
      { id: 2, desc: "执行临时 binlog 日志安全截断与磁盘清理", duration: 1800 },
      { id: 3, desc: "向主库重新对齐 binlog 指针并重启复制服务", duration: 1500 }
    ],
    riskTips: {
      type: "磁盘清理与复制线程重置",
      reversible: "是 (已配套回滚脚本)",
      dependency: "SSH 及 MySQL 复制端口就绪",
      sideEffects: "重置期间可能发生 5-10s 复制延迟短暂上升",
      rollback: "SCR-MYSQL-CLEANUP-RB-v2.1 (重新挂载并同步 binlog)"
    },
    blastRadius: {
      targets: ["mysql-user-slave-01", "mysql-pay-db-01"],
      impactServices: ["user-service-backend", "payment-service-api"]
    }
  };
};

const RemediationOfferCard = ({ data, onAction }: any) => {
  const { title = '', risk = '', confidence = '', targetCount = 0, remediation } = data || {};

  return (
    <div className="w-full max-w-xl rounded-xl border border-white/[0.08] bg-[#131622] overflow-hidden shadow-xl mt-3">
      <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-[11px]">⚡</div>
          <span className="text-xs font-black text-slate-200 uppercase tracking-wider">自愈处理方案</span>
        </div>
        <span className="text-[10px] font-black text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded-md font-mono">置信度: {confidence}</span>
      </div>
      
      <div className="p-5 space-y-4">
        <div className="space-y-1.5">
          <h4 className="text-sm font-bold text-slate-200 leading-normal">{title}</h4>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase tracking-tight">
            <span>操作风险: <span className={risk === '高' ? 'text-rose-400' : 'text-amber-400'}>{risk}</span></span>
            <span>·</span>
            <span>影响: {targetCount} 个对象</span>
          </div>
        </div>



        {/* ① 脚本预览 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-0.5">
            <div className={`w-1 h-3.5 rounded-full ${risk === '高' ? 'bg-rose-500' : 'bg-amber-500'}`} />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">① 脚本预览 (Shell)</span>
          </div>
          <pre className="p-3.5 bg-black/60 border border-slate-800/80 rounded-xl font-mono text-xs text-emerald-400 max-h-36 overflow-y-auto whitespace-pre no-scrollbar leading-relaxed">
            {remediation?.script || ''}
          </pre>
        </div>

        {/* ② 风险提示 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-0.5">
            <div className={`w-1 h-3.5 rounded-full ${risk === '高' ? 'bg-rose-500' : 'bg-amber-500'}`} />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">② 风险提示</span>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-3.5 text-xs space-y-3">
            <div className="flex justify-between border-b border-slate-800/40 pb-2">
              <span className="text-slate-500 font-bold">操作类型</span>
              <span className="text-slate-300 font-medium">{remediation?.riskTips?.type || '—'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/40 pb-2">
              <span className="text-slate-500 font-bold">是否可逆</span>
              <span className="text-slate-300 font-medium">{remediation?.riskTips?.reversible || '—'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/40 pb-2">
              <span className="text-slate-500 font-bold">前置条件</span>
              <span className="text-slate-300 font-medium">{remediation?.riskTips?.dependency || '—'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/40 pb-2">
              <span className="text-slate-500 font-bold">已知副作用</span>
              <span className="text-rose-400 font-bold">{remediation?.riskTips?.sideEffects || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-bold">回滚方案</span>
              <span className="text-indigo-400 font-bold">{remediation?.riskTips?.rollback || '—'}</span>
            </div>
          </div>
        </div>

        {/* ③ 影响范围 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-0.5">
            <div className={`w-1 h-3.5 rounded-full ${risk === '高' ? 'bg-rose-500' : 'bg-amber-500'}`} />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">③ 受影响的对象</span>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-3.5 text-xs space-y-3.5">
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase mb-1.5">受影响对象</div>
              <div className="flex flex-wrap gap-2">
                {remediation?.blastRadius?.targets?.map((t: string, i: number) => (
                  <span key={i} className="px-2.5 py-0.5 bg-slate-950 border border-slate-800/80 rounded text-[10.5px] text-slate-300 font-mono">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2.5 pt-1.5 border-t border-white/[0.08]">
          <button
            onClick={() => onAction?.('TRIGGER_HEAL_FLOW', data)}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-md shadow-amber-900/10"
          >
            确认执行
          </button>
        </div>
      </div>
    </div>
  );
};

const SelfHealDetailDrawer = ({ data, onClose, onConfirm }: any) => {
  const [activeTab, setActiveTab] = useState<'script' | 'risk' | 'blast'>('script');
  const { title = '', risk = '', confidence = '', targetCount = 0, remediation } = data || {};
  const { script = '', riskTips, blastRadius, sourceId = '' } = remediation || {};

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-xl h-full bg-[#0d0d12] border-l border-slate-800 shadow-2xl flex flex-col font-sans"
      >
        <div className="p-5 border-b border-slate-800 bg-[#14141a] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Zap size={18} fill="currentColor" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-tighter">自愈处理方案详情</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">置信度: {confidence} · 风险系数: {risk}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">

            <button onClick={onClose} className="p-1.5 hover:bg-slate-850 rounded-md text-slate-500 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="px-5 border-b border-slate-800/60 bg-[#0d0d12] flex gap-6 text-xs shrink-0">
          {(['script', 'risk', 'blast'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3.5 font-bold transition-all relative border-b-2 ${
                activeTab === tab 
                  ? 'text-amber-400 border-amber-400' 
                  : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
            >
              {tab === 'script' ? '① 脚本内容' : tab === 'risk' ? '② 风险评估' : '③ 受影响的对象'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
          {activeTab === 'script' && (
            <div className="space-y-3 h-full flex flex-col">
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase shrink-0">
                <span>只读代码视图 ({sourceId || 'DEFAULT'})</span>
                <span className="text-amber-500/70 font-mono">★ sandbox executable</span>
              </div>
              <div className="flex-1 bg-black/60 border border-slate-800/80 rounded-xl p-4 font-mono text-[11px] text-emerald-400 overflow-auto whitespace-pre no-scrollbar leading-relaxed">
                {script}
              </div>
            </div>
          )}

          {activeTab === 'risk' && (
            <div className="space-y-4">
              <div className="bg-[#161c2e] border border-amber-500/10 rounded-xl p-4 flex gap-3">
                <AlertTriangle size={18} className="text-amber-400 shrink-0" />
                <div className="text-[11px] text-slate-400 leading-normal">
                  <span className="font-bold text-slate-200">操作影响通知：</span>
                  该脚本会执行磁盘归档安全截断并重启 slave 线程，存在瞬时延迟毛刺风险，已预置回滚脚本防范突发错误。
                </div>
              </div>

              <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl overflow-hidden text-xs">
                <div className="grid grid-cols-3 border-b border-slate-800/60 bg-white/[0.02] p-3 text-[10px] text-slate-500 font-bold uppercase">
                  <div>核验维度</div>
                  <div className="col-span-2">核验值 / 说明</div>
                </div>
                <div className="p-3 grid grid-cols-3 border-b border-slate-800/40">
                  <div className="text-slate-500 font-bold">变更类型</div>
                  <div className="col-span-2 text-slate-200 font-medium">{riskTips?.type}</div>
                </div>
                <div className="p-3 grid grid-cols-3 border-b border-slate-800/40">
                  <div className="text-slate-500 font-bold">操作可逆性</div>
                  <div className="col-span-2 text-slate-200 font-medium">{riskTips?.reversible}</div>
                </div>
                <div className="p-3 grid grid-cols-3 border-b border-slate-800/40">
                  <div className="text-slate-500 font-bold">依赖前置条件</div>
                  <div className="col-span-2 text-slate-200 font-medium">{riskTips?.dependency}</div>
                </div>
                <div className="p-3 grid grid-cols-3">
                  <div className="text-slate-500 font-bold">已知副作用</div>
                  <div className="col-span-2 text-rose-400 font-bold">{riskTips?.sideEffects}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'blast' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                系统核对的自愈脚本直接关联的物理实体或运行节点：
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">受影响对象</div>
                  <div className="flex flex-wrap gap-2">
                    {blastRadius?.targets?.map((t: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-300 font-mono italic">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-slate-800 bg-[#14141a] flex gap-3 shrink-0">
          <button
            onClick={() => onConfirm(data)}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-amber-900/20 active:scale-95 uppercase tracking-wide flex items-center justify-center gap-2"
          >
            <Zap size={14} fill="currentColor" /> 确认执行
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const SelfHealNotExecuteDialog = ({ data, onClose, onAction }: any) => {
  const [ignoreReason, setIgnoreReason] = useState('');
  
  const handleConfirmIgnore = () => {
    if (!ignoreReason.trim()) {
      alert('请填写忽略原因');
      return;
    }
    onAction('CLOSE_REMEDIATION_TASK_WITH_IGNORE', { alarmId: data?.alarmId, reason: ignoreReason });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 transition-opacity duration-200"
      />
      <div
        className="relative w-full max-w-md bg-[#161622] border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl p-6 text-slate-200 z-10 font-sans"
      >
        <div className="flex justify-between items-center pb-4 border-b border-slate-800/80 mb-5">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            暂不执行自愈
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-200 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="sub text-xs text-slate-400 mb-4 leading-relaxed">
          选择一个出口，本次推荐不会丢失。
        </div>

        <div className="flex flex-col gap-2.5 mb-4">
          <button
            onClick={() => onAction('SAVE_REMEDIATION_PLAN', data)}
            className="w-full py-2.5 px-4 bg-slate-800/80 hover:bg-slate-850 border border-slate-700/50 hover:border-slate-600 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center justify-start gap-2"
          >
            💾 保存方案待用（挂在该告警上，稍后可再发起）
          </button>
          <button
            onClick={() => onAction('FORCE_UPGRADE_MANUAL', { alarmId: data?.alarmId })}
            className="w-full py-2.5 px-4 bg-slate-800/80 hover:bg-slate-850 border border-slate-700/50 hover:border-slate-600 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center justify-start gap-2"
          >
            👤 转人工处理（生成工单，带上根因与方案）
          </button>
        </div>

        <div className="flex flex-col gap-2 mb-5">
          <label className="text-[10px] font-bold text-slate-400 uppercase">或：忽略本次推荐（需填写原因，用于优化匹配）</label>
          <textarea
            value={ignoreReason}
            onChange={(e) => setIgnoreReason(e.target.value)}
            rows={2}
            placeholder="例如：该实例计划内维护中，无需自愈"
            className="bg-slate-950/60 border border-slate-800 focus:border-indigo-500/80 focus:outline-none text-slate-200 rounded-xl py-2 px-3 text-xs min-h-[60px] transition-all"
          />
        </div>

        <div className="flex gap-2 justify-end border-t border-slate-800 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all"
          >
            返回
          </button>
          <button
            onClick={handleConfirmIgnore}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all active:scale-95"
          >
            确认忽略
          </button>
        </div>
      </div>
    </div>
  );
};
const RemediationConfirmCard = ({ data, onAction }: any) => {
  const [agreed, setAgreed] = useState(false);
  const [confirmed, setConfirmed] = useState(data?.confirmed || false);
  const [cancelled, setCancelled] = useState(data?.cancelled || false);
  const { title = '', risk = '' } = data || {};

  const handleConfirm = () => {
    setConfirmed(true);
    onAction('AUTHORIZE_HEAL_EXECUTION_FROM_BUBBLE', data);
  };

  const handleCancel = () => {
    setCancelled(true);
    onAction('CANCEL_HEAL_FLOW_FROM_BUBBLE', data);
  };

  if (cancelled) {
    return (
      <div className="w-full max-w-xl rounded-xl border border-white/[0.04] bg-slate-950/20 p-4 text-xs text-slate-500 italic mt-3 animate-in fade-in slide-in-from-top-1 duration-250">
        ✕ 自愈授权操作已取消
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl rounded-xl border border-white/[0.08] bg-[#131622] overflow-hidden shadow-xl mt-3 font-sans animate-in fade-in slide-in-from-top-1 duration-250">
      <div className="p-4 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500">
          <ShieldAlert size={18} />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-200">中风险自愈操作二次确认</h4>
          <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest">⚠️ RISK LEVEL: {risk}</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="space-y-1">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">准备执行自愈操作:</div>
          <div className="text-xs font-bold text-slate-200 leading-normal">{title}</div>
        </div>

        <div className="bg-black/30 border border-slate-800/80 rounded-xl p-3.5 space-y-2 text-xs text-slate-400 leading-relaxed">
          <div className="font-bold text-slate-200 flex items-center gap-1.5 mb-1 text-amber-400 font-sans">
            <Info size={12} /> 操作说明:
          </div>
          该操作涉及临时 binlog 清理和从实例复制线程重启状态，可能短暂产生从库读瞬间毛刺。系统将安全完成该操作的全套步骤并自动复核指标状态。
        </div>

        {!confirmed ? (
          <>
            <div className="flex gap-2.5 pt-1.5 border-t border-white/[0.08]">
              <button
                onClick={handleConfirm}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/10 active:scale-95 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5"
              >
                <Zap size={12} fill="currentColor" /> 授权并提交执行
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-all"
              >
                取消
              </button>
            </div>
          </>
        ) : (
          <div className="pt-2 border-t border-white/[0.08] text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            ✓ 已授权执行自愈流程，自愈控制台正在下方初始化日志...
          </div>
        )}
      </div>
    </div>
  );
};

const RemediationReviewCard = ({ data, onAction }: any) => {
  const { alarmId = '', status = 'success', rollbackStatus, audit, archived: initialArchived } = data || {};
  const isRolledBack = rollbackStatus === 'success';
  const [localArchived, setLocalArchived] = useState(false);
  const archived = initialArchived || localArchived;

  return (
    <div className={`w-full max-w-xl rounded-xl border overflow-hidden shadow-xl mt-3 ${
      isRolledBack
        ? 'border-indigo-500/20 bg-[#161722]'
        : status === 'success' 
          ? 'border-emerald-500/30 bg-[#0e1716]' 
          : 'border-rose-500/20 bg-[#1f1618]'
    }`}>
      <div className={`p-3.5 border-b flex items-center justify-between ${
        isRolledBack
          ? 'bg-indigo-500/10 border-indigo-500/20'
          : status === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20' 
            : 'bg-rose-500/10 border-rose-500/20'
      }`}>
        <div className="flex items-center gap-2">
          {isRolledBack ? (
            <>
              <span className="text-xs">🔄</span>
              <span className="text-xs font-black text-indigo-200 uppercase tracking-wider">自愈任务已撤销</span>
            </>
          ) : (
            <>
              <span className="text-xs">🛡️</span>
              <span className="text-xs font-black text-emerald-200 uppercase tracking-wider">执行成功：原告警已自动关闭</span>
            </>
          )}
        </div>
        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
          isRolledBack
            ? 'bg-indigo-500/20 text-indigo-400'
            : status === 'success' 
              ? 'bg-emerald-500/20 text-emerald-400' 
              : 'bg-rose-500/20 text-rose-400'
        }`}>
          {isRolledBack ? '已回滚' : status === 'success' ? '已关闭' : '建议回滚'}
        </span>
      </div>

      <div className="p-4 space-y-4">
        {isRolledBack ? (
          <div className="text-xs text-slate-400 leading-relaxed font-sans">
            已成功运行配套回滚脚本，恢复了 binlog 指针与复制延迟状态，告警已重新流转至人工待处理队列。
          </div>
        ) : (
          <>
            <div className="text-xs text-slate-300 font-bold font-sans">
              AI 专家自愈后指标核对看板 (Before vs After) ：
            </div>

            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="bg-[#0b0c10] p-2.5 rounded-lg border border-slate-800/40 flex items-center justify-between">
                <span className="text-slate-400 font-medium">磁盘空间使用率</span>
                <span className="font-bold text-slate-300 font-mono">95% ➔ <span className="text-emerald-400">41%</span></span>
              </div>
              <div className="bg-[#0b0c10] p-2.5 rounded-lg border border-slate-800/40 flex items-center justify-between">
                <span className="text-slate-400 font-medium">Seconds_Behind_Master</span>
                <span className="font-bold text-slate-300 font-mono">320s ➔ <span className="text-emerald-400">0.2s</span></span>
              </div>
              <div className="bg-[#0b0c10] p-2.5 rounded-lg border border-slate-800/40 flex items-center justify-between">
                <span className="text-slate-400 font-medium">主从复制异常告警</span>
                <span className="font-bold text-emerald-400 font-bold flex items-center gap-1">已消除 ✓</span>
              </div>
            </div>

            {audit && (
              <div className="bg-[#0a0a0f] border border-slate-800/80 rounded-xl p-3 space-y-2">
                <h5 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">📋 自愈审计与特征归档</h5>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-sans">
                  <div className="flex justify-between"><span className="text-slate-500 font-bold">操作人</span><span className="text-slate-300 font-medium">{audit.operator}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500 font-bold">审批人</span><span className="text-slate-300 font-medium">{audit.approver}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500 font-bold">执行时间</span><span className="text-slate-300 font-medium">{audit.time}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500 font-bold">所用脚本</span><span className="text-indigo-400 font-medium">{audit.script}</span></div>
                  <div className="col-span-2 flex justify-between pt-1 border-t border-slate-800/40"><span className="text-slate-500 font-black">执行结果</span><span className="text-emerald-400 font-bold">{audit.result}</span></div>
                </div>
              </div>
            )}

            <div className="text-xs text-slate-400 leading-relaxed bg-emerald-500/5 p-2 rounded border border-emerald-500/10 font-sans">
              💡 <span className="font-bold text-slate-200">复核结果：</span>所有关键指标已经全面恢复正常基线，未检测到次生故障。告警已自动关闭。
            </div>
          </>
        )}

        <div className="flex gap-2 border-t border-slate-800/40 pt-3">
          {isRolledBack ? (
            <button
              onClick={() => onAction?.('FORCE_UPGRADE_MANUAL', { alarmId })}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-all"
            >
              升级为人工高优工单
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setLocalArchived(true);
                  onAction?.('ARCHIVE_KNOWLEDGE_BASE', { alarmId });
                }}
                disabled={archived}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  archived 
                    ? 'bg-slate-800/60 text-slate-500 cursor-not-allowed border border-slate-850' 
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95 shadow-md shadow-emerald-950/20'
                }`}
              >
                {archived ? '已归档' : '归档'}
              </button>
              <button
                onClick={() => onAction?.('TRIGGER_REMEDIATION_ROLLBACK', { alarmId })}
                className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-all"
              >
                申请回滚撤销
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const SelfHealRecommendationCard = ({ data, onAction }: any) => {
  const currentData = data;
  const { alertTitle = '', rootCauseText = '', knownEntities = [], candidates = [], regenerated } = currentData || {};

  const [detailId, setDetailId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [question, setQuestion] = useState("");

  useEffect(() => {
    if (!currentData) return;
    const currentCandidates = currentData.candidates || [];
    if (currentCandidates.length === 1) {
      setDetailId(currentCandidates[0].id);
      setSelected(currentCandidates[0].id);
    } else {
      setDetailId(null);
      setSelected(null);
    }
  }, [currentData]);

  const handleAsk = (schemeId: string, schemeTitle: string) => {
    if (!question.trim()) return;
    onAction?.('ASK_HEAL_SCHEME', { schemeId, schemeTitle, question });
    setQuestion("");
  };

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setSelected(null);
    setDetailId(null);
    onAction?.('REGENERATE_HEAL_SCHEMES');
    setTimeout(() => {
      setIsRegenerating(false);
    }, 1500);
  };

  const items = useMemo(() => {
    return candidates.map((c: any) => ({ cand: c, ev: assess(c, knownEntities) }));
  }, [candidates, knownEntities]);

  const isUserOptimized = useMemo(() => {
    return candidates.some((c: any) => c.title?.includes('(用户优化版)'));
  }, [candidates]);

  const [sortBy, setSortBy] = useState<'trust' | 'risk'>('trust');
  const sorted = useMemo(() => {
    const arr = [...items];
    if (sortBy === 'risk') {
      arr.sort((a, b) => ORD[a.ev.effective] - ORD[b.ev.effective]);
    } else {
      const t: Record<string, number> = { high: 0, mid: 1, low: 2 };
      arr.sort((a, b) => t[a.ev.trust] - t[b.ev.trust]);
    }
    return arr;
  }, [items, sortBy]);



  const copyScript = (it: any) => {
    navigator.clipboard?.writeText(DISCLAIMER + "\n" + it.cand.script).catch(() => {});
  };

  const exportPlan = (it: any) => {
    const head = `# 全 AI 生成推荐修复方案（仅供参考，系统不执行）\n# 告警：${alertTitle}\n# 根因：${rootCauseText}\n# 方案：${it.cand.title}\n# 模型声明风险：${RISK[it.cand.declaredRisk].label} · 核验推导：${RISK[it.ev.derived].label} · 操作风险：${RISK[it.ev.effective].label}\n# 核验告警：${it.ev.flags.map((f:any)=>f.t).join(" | ")||"无"}\n${DISCLAIMER}\n\n`;
    try {
      const b = new Blob([head + it.cand.script], { type: "text/plain" });
      const u = URL.createObjectURL(b);
      const a = document.createElement("a");
      a.href = u;
      a.download = `AI修复方案_${it.cand.title}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(u);
    } catch(e) {}
  };

  return (
    <div className="w-full max-w-4xl font-sans mt-3">
      <div className="rounded-2xl border border-white/8 bg-[#161c2e] p-5 shadow-2xl">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-violet-400">✦</span>
          <h3 className="font-bold text-slate-100 text-sm">AI推荐修复方案</h3>
        </div>
        <div className="text-[11px] text-rose-200 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2.5 mt-3 mb-4 leading-relaxed font-bold shadow-inner">
          ⚠ 本方案由 AI 生成,其脚本与风险评级、适用范围、推荐原因均为模型产出,可能存在幻觉。<span className="text-rose-100">系统不会自动执行任何脚本</span>，请务必人工充分评估后,再在受控环境中落地。
        </div>



        {sorted.length > 1 && (
          <div className="flex items-center gap-3 mb-3 text-[11px]">
            <span className="text-slate-400 font-bold">{sorted.length} 个 AI 生成方案</span>
            <div className="ml-auto flex items-center gap-1.5 font-bold">
              <span className="text-slate-500">排序</span>
              <button onClick={() => setSortBy("trust")} className={`px-2 py-1 rounded border transition-colors ${sortBy === "trust" ? "border-indigo-400/50 bg-indigo-500/15 text-indigo-300" : "border-slate-700/50 text-slate-400 hover:bg-slate-800/50"}`}>按可信度</button>
              <button onClick={() => setSortBy("risk")} className={`px-2 py-1 rounded border transition-colors ${sortBy === "risk" ? "border-indigo-400/50 bg-indigo-500/15 text-indigo-300" : "border-slate-700/50 text-slate-400 hover:bg-slate-800/50"}`}>低风险优先</button>
            </div>
          </div>
        )}

        <div className={`space-y-3 transition-opacity duration-300 ${isRegenerating ? "opacity-30 pointer-events-none" : ""}`}>
          {sorted.map((it: any) => {
            const { cand, ev } = it;
            const open = detailId === cand.id;
            const sel = selected === cand.id;

            const mismatch = ev.derived !== cand.declaredRisk;
            const hi = ev.effective === "high";

            return (
              <div key={cand.id} className={`rounded-xl border p-3.5 transition-all duration-200 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.3)] ${sel ? "border-indigo-500 bg-indigo-500/[0.04] shadow-[0_0_15px_rgba(99,102,241,0.15)]" : "border-slate-600 bg-[#0d101d] hover:border-indigo-500/50 hover:bg-[#0d101d]/80"}`} onClick={() => { setSelected(cand.id); setDetailId(p => p === cand.id ? null : cand.id); }}>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`text-[9px] font-black border rounded px-1.5 py-0.5 uppercase ${RISK[ev.effective].cls}`}>操作风险 {RISK[ev.effective].label}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border inline-flex items-center gap-1 transition-all ${TRUST[ev.trust].cls}`}>
                    <span className={`w-1 h-1 rounded-full ${
                      ev.trust === 'high' ? 'bg-emerald-400 animate-pulse' :
                      ev.trust === 'mid' ? 'bg-amber-400' : 'bg-rose-400'
                    }`} />
                    {TRUST[ev.trust].label}
                  </span>

                </div>
                <div className="flex justify-between items-start gap-4 mb-1.5">
                  <div className="flex-1">
                    {/* 方案主标题 */}
                    <div className="text-sm font-bold text-slate-200">{cand.title}</div>
                    
                    {/* 新增：高危警告标签（仅在高风险时显示） */}
                    {hi && (
                      <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-bold text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded px-2.5 py-1">
                        <ShieldAlert size={12} className="text-rose-500 animate-pulse" /> 
                        极高风险动作，建议寻求资深 SRE 协助评估后再执行。
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 text-slate-500 font-bold text-[11px] hover:text-indigo-400 transition-colors">
                    <span>{open ? "收起详情" : "查看详情"}</span>
                    <ChevronDown size={14} className={`transform transition-transform duration-200 ${open ? "rotate-180 text-indigo-400" : "text-slate-500"}`} />
                  </div>
                </div>
                
                {open && (
                  <div className="mt-4 pt-3 border-t border-slate-800/60 space-y-3" onClick={e => e.stopPropagation()}>
                    {ev.flags.length > 0 && (
                      <div>
                        <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-widest">
                          风险提示
                        </div>
                        <div className="space-y-1.5 mt-1">
                          {ev.flags.map((f: any, i: number) => (
                            <div key={i} className="text-[11px] text-slate-300 font-medium leading-relaxed">
                              <span className="mr-1.5">
                                [{f.title}]
                              </span>
                              <span>{f.desc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
                    <div className="flex justify-between items-center pt-2.5 border-t border-slate-800/60 mt-3 flex-wrap gap-2">
                      <div className="flex-1 min-w-[280px] max-w-md flex items-center gap-1.5 bg-slate-950/60 border border-slate-800/80 rounded-lg px-2.5 py-1.5 focus-within:border-indigo-500/50 transition-colors">
                        <MessageSquare size={13} className="text-slate-500" />
                        <input
                          type="text"
                          placeholder="针对该修复方案向 AI 提问并讨论..."
                          className="bg-transparent text-[11px] text-slate-300 placeholder-slate-600 outline-none flex-1 font-bold"
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.stopPropagation();
                              handleAsk(cand.id, cand.title);
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          disabled={!question.trim()}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAsk(cand.id, cand.title);
                          }}
                          className={`text-[10px] font-black tracking-wide transition-colors ${question.trim() ? "text-indigo-400 hover:text-indigo-300" : "text-slate-650 cursor-not-allowed"}`}
                        >
                          发送
                        </button>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); exportPlan(it); }} className="flex items-center gap-1 text-[10px] font-bold border border-slate-700/80 rounded-lg px-3 py-1.5 hover:bg-slate-800/60 text-slate-300 transition-colors shrink-0"><Download size={12}/> 导出完整方案</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {!isUserOptimized && (
          <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-800/80">
            <button
              disabled={isRegenerating || regenerated}
              onClick={handleRegenerate}
              className={`text-xs font-bold border rounded-lg px-4 py-2.5 flex items-center gap-2 transition-all ${(isRegenerating || regenerated) ? "border-slate-800 text-slate-600 bg-slate-800/20 cursor-not-allowed" : "border-slate-700 hover:bg-slate-800 text-slate-300 active:scale-95"}`}
            >
              <RefreshCw size={14} className={isRegenerating ? "animate-spin text-slate-500" : "text-slate-400"} />
              {isRegenerating ? "重新生成中..." : regenerated ? "已重新生成" : "重新生成推荐方案"}
            </button>
          </div>
        )}
      </div>

    </div>
  );
};


const ActionConfirmCard = ({ data, onAction }: any) => {
  const { title, impact, risk, preview, targets } = data;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#1a1a24] border border-rose-500/30 rounded-2xl overflow-hidden shadow-2xl max-w-sm"
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

const StepCircle = ({ status, num }: { status: 'pending' | 'running' | 'success' | 'aborted'; num: number }) => {
  if (status === 'success') {
    return (
      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow-lg shadow-emerald-500/20 shrink-0">
        ✓
      </div>
    );
  }
  if (status === 'aborted') {
    return (
      <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold shadow-lg shadow-rose-500/20 shrink-0">
        ✕
      </div>
    );
  }
  if (status === 'running') {
    return (
      <div className="w-5 h-5 rounded-full border border-blue-500 bg-blue-500/10 text-blue-400 flex items-center justify-center text-[10px] font-bold shadow-lg shadow-blue-500/30 animate-pulse shrink-0">
        <Loader2 size={10} className="animate-spin" />
      </div>
    );
  }
  return (
    <div className="w-5 h-5 rounded-full border border-slate-800 bg-slate-900/20 text-slate-500 flex items-center justify-center text-[10px] font-bold shrink-0">
      {num}
    </div>
  );
};

const StepLine = ({ status }: { status: 'pending' | 'running' | 'success' | 'aborted' }) => {
  if (status === 'success') {
    return <div className="flex-1 h-[3px] min-w-[16px] mx-1 bg-emerald-500 transition-all duration-500 rounded-full" />;
  }
  if (status === 'running') {
    return <div className="flex-1 h-[3px] min-w-[16px] mx-1 bg-gradient-to-r from-emerald-500 to-blue-500 animate-pulse transition-all duration-500 rounded-full" />;
  }
  return <div className="flex-1 h-[3px] min-w-[16px] mx-1 bg-slate-800 transition-all duration-500 rounded-full" />;
};

const getStepTextClass = (status: 'pending' | 'running' | 'success' | 'aborted') => {
  if (status === 'success') return 'text-emerald-400 font-bold transition-colors duration-500';
  if (status === 'running') return 'text-blue-400 font-bold transition-colors duration-500';
  if (status === 'aborted') return 'text-rose-400 transition-colors duration-500';
  return 'text-slate-500 transition-colors duration-500';
};

const ActionExecutionCard = ({ data, onAction }: any) => {
  const { status, progress, logs, rollbackStatus, audit, archived: initialArchived, mode } = data || {};
  const isRollbackExecution = mode === 'rollback';
  const isRolledBack = rollbackStatus === 'success';
  const isRollbackRunning = rollbackStatus === 'running';
  const [localArchived, setLocalArchived] = useState(false);
  const archived = initialArchived || localArchived;
  const isComplete = status === 'success' && (audit || isRollbackExecution);

  const [archiveState, setArchiveState] = useState<'initial' | 'expanded' | 'archiving'>('initial');
  const [selectedKB, setSelectedKB] = useState('kb_sre_cases');
  const [showDropdown, setShowDropdown] = useState(false);

  const consoleLogsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleLogsRef.current) {
      consoleLogsRef.current.scrollTo({
        top: consoleLogsRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [logs]);

  const kbOptions = [
    { id: 'kb_sre_cases', name: 'SRE 故障案例库', icon: '📚' },
    { id: 'kb_middleware', name: '中间件最佳实践', icon: '⚙️' },
    { id: 'kb_team_shared', name: '团队共享知识库', icon: '👥' },
  ];

  const selectedKBName = kbOptions.find(opt => opt.id === selectedKB)?.name || '';

  const getStepStatus = (stepIndex: number) => {
    if (status === 'success') return 'success';
    if (status === 'aborted') return 'aborted';
    
    if (stepIndex === 1) {
      if (progress < 30) return 'running';
      return 'success';
    }
    if (stepIndex === 2) {
      if (progress < 30) return 'pending';
      if (status !== 'success' && status !== 'aborted') return 'running';
      return 'success';
    }
    if (stepIndex === 3) {
      return 'pending';
    }
    return 'pending';
  };

  return (
    <div className="w-full max-w-2xl mt-4 font-sans text-slate-300 space-y-6 p-2">
      {/* ================= 环节一：自动化自愈执行 ================= */}
      <div className="flex gap-4">
        {/* 左侧列：时间轴圆圈与竖线 */}
        <div className="flex flex-col items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shadow-lg shrink-0 ${
            status === 'success' 
              ? 'bg-emerald-500 text-white shadow-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.4)]' 
              : status === 'aborted'
                ? 'bg-rose-500 text-white shadow-rose-500/20'
                : 'bg-indigo-600 text-white animate-pulse shadow-indigo-600/20 shadow-[0_0_10px_rgba(79,70,229,0.4)]'
          }`}>
            {status === 'success' ? '✓' : status === 'aborted' ? '✕' : '1'}
          </div>
          <div className={`w-px flex-1 ${isComplete ? (status === 'success' ? 'bg-emerald-500/40' : 'bg-indigo-600/40') : 'bg-slate-800/30'}`} />
        </div>

        {/* 右侧列：环节一内容 */}
        <div className="flex-1 pb-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span>环节一：{isRollbackExecution ? '自动化回滚执行' : '自动化自愈执行'}</span>
            {status === 'running' && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />}
          </div>

          {/* 环节一卡片内容区域 */}
          <div className="bg-slate-900/50 border border-white/[0.03] rounded-xl p-4 space-y-3.5 shadow-xl">
            {/* 实时动态 Steps 步骤条 */}
            <div className="flex items-center justify-between text-[11px] bg-slate-950/60 p-3 rounded-lg border border-slate-900/60 shadow-inner">
              {/* 步骤 1 */}
              <div className="flex items-center gap-2">
                <StepCircle status={getStepStatus(1)} num={1} />
                <span className={getStepTextClass(getStepStatus(1))}>
                  {isRollbackExecution ? '启动回滚引擎' : '启动自愈引擎'}
                </span>
              </div>

              {/* 连接线 1 -> 2 */}
              <StepLine status={getStepStatus(2)} />

              {/* 步骤 2 */}
              <div className="flex items-center gap-2">
                <StepCircle status={getStepStatus(2)} num={2} />
                <span className={getStepTextClass(getStepStatus(2))}>
                  {isRollbackExecution ? '回滚执行中' : '自愈执行中'}
                </span>
              </div>

              {/* 连接线 2 -> 3 */}
              <StepLine status={getStepStatus(3)} />

              {/* 步骤 3 */}
              <div className="flex items-center gap-2">
                <StepCircle status={getStepStatus(3)} num={3} />
                <span className={getStepTextClass(getStepStatus(3))}>
                  {status === 'success' 
                    ? (isRollbackExecution ? '回滚脚本成功' : '自愈修复成功') 
                    : status === 'aborted'
                      ? (isRollbackExecution ? '回退已中止' : '自愈已中止')
                      : (isRollbackExecution ? '等待回滚成功' : '等待自愈成功')}
                </span>
              </div>
            </div>

            {/* 阶段一说明文字融合 */}
            <div className="text-[11px] text-slate-400 bg-slate-900/20 border border-slate-800/20 p-2.5 rounded-lg leading-relaxed">
              💡 {isRollbackExecution ? '回滚流程已启动，正在执行反向撤销操作。' : '已启动自愈执行流水线，正在对目标实例进行物理修复。'}
            </div>

            {/* 控制台终端日志 */}
            <div 
              ref={consoleLogsRef}
              className="bg-black/50 border border-white/[0.02] p-3.5 rounded-lg font-mono text-[11px] space-y-1.5 h-36 overflow-y-auto no-scrollbar scroll-smooth"
            >
              {logs?.map((log: string, i: number) => (
                <div key={i} className="flex gap-2.5">
                  <span className="text-slate-600 shrink-0 select-none">[{new Date().toLocaleTimeString(undefined, { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                  <span className={log.includes('✓') || log.includes('SUCCESS') || log.includes('✅') ? 'text-emerald-400 font-bold' : log.includes('■') || log.includes('ER') ? 'text-rose-400 font-bold' : 'text-slate-300'}>{log}</span>
                </div>
              ))}
              {status !== 'success' && status !== 'aborted' && <div className="animate-pulse text-blue-400 inline-block">_</div>}
            </div>

            {/* 进度控制与中止按钮 */}
            {status === 'running' && !isRollbackExecution && (
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => onAction?.('ABORT_HEAL_EXECUTION', data)}
                  className="px-3 py-1 bg-rose-600/80 hover:bg-rose-600 text-[10px] font-bold text-white rounded transition-colors active:scale-95 shadow-md shadow-rose-950/20"
                >
                  ■ 中止自愈执行
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= 环节二：自愈效果复核与审计归档 / 回滚结果复核与线下排查 ================= */}
      {isComplete && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex gap-4"
        >
          {/* 左侧列：时间轴圆圈与竖线 */}
          <div className="flex flex-col items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shadow-lg shrink-0 ${
              isRolledBack
                ? 'bg-amber-500 text-white shadow-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                : isComplete && !isRollbackExecution
                  ? 'bg-indigo-600 text-white shadow-indigo-600/20 shadow-[0_0_10px_rgba(79,70,229,0.4)]'
                  : 'bg-emerald-500 text-white shadow-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
            }`}>
              2
            </div>
            <div className="w-px flex-1 bg-slate-800/20" />
          </div>

          {/* 右侧列：环节二内容 */}
          <div className="flex-1 pb-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              {isRollbackExecution ? '环节二：回滚结果复核与线下排查' : '环节二：自愈效果复核与审计归档'}
            </div>

            {/* 阶段二说明文字融合 */}
            <div className="text-[11px] text-slate-400 bg-slate-900/20 border border-slate-800/20 p-2.5 rounded-lg leading-relaxed mb-3 flex items-start gap-1.5">
              <span className="shrink-0 select-none">💡</span>
              <div>
                {isRollbackExecution ? (
                  <>
                    <span className="text-amber-400 font-extrabold mr-1">【回退成功】</span>
                    <span>已成功运行配套回滚脚本，恢复了 binlog 指针与复制延迟状态，告警已重新流转至人工待处理队列。</span>
                  </>
                ) : (
                  <>
                    <span className="text-emerald-400 font-extrabold mr-1">【自愈成功】</span>
                    <span>系统已安全关闭原告警，正在对自愈后各项性能指标进行复核核算。</span>
                  </>
                )}
              </div>
            </div>

            {isRollbackExecution ? (
              // ================= 回滚结果复核与排查面板 (方案 D: 只读无按钮) =================
              <div className="space-y-4 animate-in fade-in-50 duration-300">
                {/* 上下卡片堆叠展示 */}
                <div className="flex flex-col gap-3">
                  {/* 指标状态回退 */}
                  <div className="border border-amber-500/20 bg-amber-500/[0.02] rounded-xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-300">📈 指标状态回退</span>
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">已恢复</span>
                    </div>
                    <div className="space-y-1.5 text-[10.5px]">
                      <div className="flex justify-between"><span className="text-slate-400">磁盘空间</span><span className="font-mono text-slate-200 font-bold">41% (未引入次生)</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">复制延迟</span><span className="font-mono text-slate-200 font-bold">0.2s ➔ <span className="text-amber-300 font-bold">320s</span></span></div>
                      <div className="flex justify-between"><span className="text-rose-400 font-bold">已重新打开 ⚠️</span></div>
                    </div>
                  </div>

                  {/* 回滚审计记录 */}
                  <div className="border border-slate-700/50 bg-slate-800/[0.05] rounded-xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-300">📋 回滚审计记录</span>
                      <span className="text-[9px] bg-slate-700/40 text-slate-400 px-1.5 py-0.2 rounded font-bold">已完成</span>
                    </div>
                    <div className="space-y-1.5 text-[10.5px]">
                      <div className="flex justify-between"><span className="text-slate-400">操作人</span><span className="text-slate-200 font-medium">超管（超）</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">回滚对象</span><span className="text-slate-200 font-medium">mysql-user-slave-01</span></div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">回滚时间</span>
                        <span className="text-slate-200 font-medium">
                          {(() => {
                            const now = new Date();
                            return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                          })()}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2.5 space-y-1.5 border-t border-slate-800/40 pt-2">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">回滚脚本</div>
                      <pre className="p-3 bg-black/60 border border-slate-800/80 rounded-lg font-mono text-[10.5px] text-emerald-400 max-h-36 overflow-y-auto whitespace-pre no-scrollbar leading-relaxed">
{`#!/bin/bash
echo "[INFO] Starting rollback sequence for MySQL slave binlog sync..."
echo "[INFO] Restoring binlog index parameters from backup..."
mysql -u root -e "START SLAVE"
echo "[SUCCESS] Slave replication thread restarted. Replication latency restored."`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* 友情排查小字提示 */}
                <div className="text-xs text-slate-400 bg-amber-500/[0.025] border border-amber-500/10 p-3 rounded-lg leading-relaxed">
                  💡 <span className="font-bold text-slate-200">回滚复核结果：</span>当前实例已被安全还原至自愈前初始故障状态。自动化自愈流程已结束，请运维人员线下排查故障根因。
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 上下卡片堆叠展示 */}
                <div className="flex flex-col gap-3">
                  {/* 看板卡片 */}
                  <div className="border border-emerald-500/20 bg-emerald-500/[0.02] rounded-xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-400">📈 指标对比复核</span>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 py-0.2 rounded font-bold">已核对</span>
                    </div>
                    <div className="space-y-1.5 text-[10.5px]">
                      <div className="flex justify-between"><span className="text-slate-400">磁盘空间</span><span className="font-mono text-slate-200 font-bold">95% ➔ <span className="text-emerald-400">41%</span></span></div>
                      <div className="flex justify-between"><span className="text-slate-400">复制延迟</span><span className="font-mono text-slate-200 font-bold">320s ➔ <span className="text-emerald-400">0.2s</span></span></div>
                      <div className="flex justify-between"><span className="text-slate-400">异常告警</span><span className="text-emerald-400 font-bold">已消除 ✓</span></div>
                    </div>
                  </div>

                  {/* 审计日志卡片 */}
                  <div className="border border-indigo-500/20 bg-indigo-500/[0.02] rounded-xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-indigo-400">📋 自愈审计记录</span>
                      <span className="text-[9px] bg-indigo-500/20 text-indigo-400 px-1 py-0.2 rounded font-bold">已就绪</span>
                    </div>
                    <div className="space-y-1.5 text-[10.5px]">
                      <div className="flex justify-between"><span className="text-slate-400">操作人</span><span className="text-slate-200 font-medium">超管（超）</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">操作结果</span><span className="text-emerald-400 font-bold">自愈成功</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">操作时间</span><span className="text-slate-200 font-medium overflow-hidden text-ellipsis whitespace-nowrap" title={audit?.time || ''}>{audit?.time || '—'}</span></div>
                    </div>
                    <div className="mt-2.5 space-y-1.5 border-t border-indigo-500/10 pt-2">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">操作脚本</div>
                      <pre className="p-3 bg-black/60 border border-slate-800/80 rounded-lg font-mono text-[10.5px] text-emerald-400 max-h-36 overflow-y-auto whitespace-pre no-scrollbar leading-relaxed">
{`#!/bin/bash
echo "[INFO] Checking replica status on mysql-user-slave-01..."
mysql -u root -e "SHOW SLAVE STATUS" | grep "Seconds_Behind_Master"
echo "[WARN] Disk space critical (95%). Executing safe binlog truncation..."
rm -rf /var/log/mysql/mysql-bin.000*
echo "[SUCCESS] Disk space freed. Current usage: 41%."`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* 指标状态及说明 */}
                {isRolledBack ? (
                  <div className="text-xs text-slate-400 bg-amber-500/[0.025] border border-amber-500/10 p-3 rounded-lg leading-relaxed">
                    💡 <span className="font-bold text-slate-200">撤销提示：</span>自愈成效已被反向回滚，故障恢复至初始状态。
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 bg-emerald-500/[0.03] border border-emerald-500/10 p-2.5 rounded-lg space-y-1.5 animate-in fade-in duration-350">
                    <div>
                      💡 <span className="font-bold text-emerald-400">复核结果：</span>所有关键指标已经全面恢复正常基线，未检测到次生故障。告警已自动关闭。
                    </div>
                    <div className="text-[10.5px] text-slate-500 border-t border-slate-800/40 pt-1.5 mt-1.5 leading-relaxed flex items-start gap-1">
                      <span className="text-amber-500/80 shrink-0 select-none">⚠️</span>
                      <span>
                        建议运维人员线下登录数据库控制台，进一步复核并确认数据一致性。如人工复核发现异常，可点击下方<span className="text-slate-400 font-bold">「申请回滚撤销」</span>将实例物理还原。
                      </span>
                    </div>
                  </div>
                )}

                {/* 动作按钮栏与归档折叠区 */}
                <div className="space-y-3">
                  {archived ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex flex-col items-center gap-1.5"
                    >
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10.5px]">
                        <CheckCircle2 size={14} /> 已成功归档至知识库
                      </div>
                      <button 
                        onClick={() => onAction?.('SWITCH_TO_KNOWLEDGE_PAGE')}
                        className="text-[9.5px] text-emerald-500 hover:text-emerald-400 font-black uppercase underline decoration-1 underline-offset-2"
                      >
                        查看知识库
                      </button>
                    </motion.div>
                  ) : archiveState === 'initial' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setArchiveState('expanded')}
                        disabled={isRollbackRunning || isRolledBack}
                        className="flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95 shadow-md shadow-emerald-950/20"
                      >
                        归档
                      </button>
                      <button
                        onClick={() => onAction?.('TRIGGER_REMEDIATION_ROLLBACK', { alarmId: data?.alarmId })}
                        disabled={isRollbackRunning || isRolledBack}
                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-all active:scale-95 border ${
                          isRolledBack 
                            ? 'bg-slate-800/40 text-slate-500 border-slate-850 cursor-not-allowed'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700/50'
                        }`}
                      >
                        {isRollbackRunning ? '回滚执行中' : isRolledBack ? '已回滚' : '申请回滚撤销'}
                      </button>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full p-3 bg-slate-900/40 border border-white/[0.05] rounded-xl space-y-3 shadow-inner"
                    >
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
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
                          onClick={() => {
                            setArchiveState('archiving');
                            setTimeout(() => {
                              setLocalArchived(true);
                              onAction?.('ARCHIVE_KNOWLEDGE_BASE', { alarmId: data?.alarmId });
                              setArchiveState('initial');
                            }, 1500);
                          }}
                          disabled={archiveState === 'archiving'}
                          className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 disabled:bg-slate-700 text-white text-xs font-black rounded-lg transition-all active:scale-95 flex items-center gap-2 min-w-[70px] justify-center shadow-lg shadow-indigo-950/20"
                        >
                          {archiveState === 'archiving' ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            '确认'
                          )}
                        </button>
                        <button
                          onClick={() => setArchiveState('initial')}
                          disabled={archiveState === 'archiving'}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-all active:scale-95"
                        >
                          取消
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

const KnowledgeArchiveSection = ({ data, onAction }: { data: any; onAction?: any }) => {
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
        <button 
          onClick={() => onAction?.('SWITCH_TO_KNOWLEDGE_PAGE')}
          className="mt-1 text-[10px] text-emerald-500 hover:text-emerald-400 font-black uppercase tracking-widest underline decoration-2 underline-offset-4"
        >
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
          className="w-full mt-4 p-4 bg-slate-900/40 border border-white/[0.05] rounded-xl space-y-4 shadow-inner"
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

const MySQLTaskEditListCard = ({ onAction, data }: any) => {
  const [tasks, setTasks] = useState<any[]>(() => data?.tasks || []);
  const [activeTaskIndex, setActiveTaskIndex] = useState<number>(0);
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [tempScriptData, setTempScriptData] = useState({ type: 'shell', content: '' });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const BOILERPLATE = {
    shell: '#!/bin/bash\n\n# 在此编写您的 Shell 脚本逻辑\n',
    python: '#!/usr/bin/env python3\n\n# 在此编写您的 Python 脚本逻辑\n'
  };

  const openScriptModal = () => {
    const currentTask = tasks[activeTaskIndex];
    if (currentTask) {
      const type = currentTask.scriptType || 'shell';
      const content = currentTask.scriptContent || BOILERPLATE[type as keyof typeof BOILERPLATE];
      setTempScriptData({ type, content });
      setIsScriptModalOpen(true);
    }
  };

  const saveScriptModal = () => {
    const updated = [...tasks];
    updated[activeTaskIndex].scriptType = tempScriptData.type;
    updated[activeTaskIndex].scriptContent = tempScriptData.content;
    setTasks(updated);
    setIsScriptModalOpen(false);
  };

  const handleScriptTypeChange = (newType: string) => {
    const isCustomContent = tempScriptData.content.trim() && !Object.values(BOILERPLATE).some(bp => tempScriptData.content.trim() === bp.trim());
    if (isCustomContent) {
      showToast(`已切换为 ${newType === 'python' ? 'Python' : 'Shell'} 环境，原有代码已保留，请自行确保语法兼容`);
      setTempScriptData(prev => ({ ...prev, type: newType }));
    } else {
      setTempScriptData({ type: newType, content: BOILERPLATE[newType as keyof typeof BOILERPLATE] });
    }
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const value = target.value;
      const newContent = value.substring(0, start) + '    ' + value.substring(end);
      setTempScriptData(prev => ({ ...prev, content: newContent }));
      
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }
  };

  const handleFieldChange = (index: number, field: string, value: any) => {
    const updated = [...tasks];
    updated[index][field] = value;
    setTasks(updated);
  };

  const handleVariableChange = (taskIndex: number, varIndex: number, val: string) => {
    const updated = [...tasks];
    updated[taskIndex].variables[varIndex].value = val;
    setTasks(updated);
  };

  const handleSubmit = () => {
    onAction('MYSQL_TASK_EDIT_DONE', { tasks });
  };

  const currentTask = tasks[activeTaskIndex];
  const targetList = currentTask?.target ? currentTask.target.split(',').map((s: string) => s.trim()).filter(Boolean) : [];

  return (
    <>
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }} 
      className="mt-4 bg-[var(--bg-card)] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl w-full max-w-[620px]"
    >
      {/* Header */}
      <div className="p-5 border-b border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
            <ClipboardList size={20} className="text-blue-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100 uppercase tracking-tight">自定义巡检子任务</h4>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">共 {tasks.length} 个任务</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 px-3 bg-slate-900/30 overflow-x-auto no-scrollbar">
        {tasks.map((t, idx) => (
          <button
            key={t.taskId || idx}
            onClick={() => setActiveTaskIndex(idx)}
            className={`px-4 py-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTaskIndex === idx 
                ? 'border-blue-500 text-blue-400 bg-blue-500/5' 
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Body Form */}
      {currentTask && (
        <div className="p-5 space-y-4 max-h-[550px] overflow-y-auto no-scrollbar">
          {/* 资源类型（只读） */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">资源类型</label>
            <input
              type="text"
              disabled
              value={currentTask.resourceType || ''}
              className="bg-slate-950/30 border border-slate-800/50 text-slate-500 rounded-lg py-2 px-3 text-xs cursor-not-allowed"
            />
          </div>

          {/* 资源对象 */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">资源对象 ({targetList.length})</span>
            <div className="flex flex-wrap gap-1.5 relative group/more-targets">
              {targetList.slice(0, 3).map((inst: string, idx: number) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono cursor-default">
                  {inst}
                </span>
              ))}
              {targetList.length > 3 && (
                <span className="px-2 py-0.5 rounded border border-dashed border-slate-600 text-slate-400 group-hover/more-targets:text-slate-200 group-hover/more-targets:border-slate-400 transition-colors text-[10px] font-mono cursor-default flex items-center h-full">
                  +{targetList.length - 3}
                </span>
              )}
              
              {/* Hover Popover, positioned relative to the full container width */}
              {targetList.length > 3 && (
                <div className="absolute top-full mt-2 left-0 w-[95%] hidden group-hover/more-targets:block bg-[#161622] border border-slate-700 p-3 rounded-lg shadow-2xl z-20">
                  <div className="text-[10px] font-bold text-slate-400 mb-2 border-b border-slate-800 pb-2 uppercase tracking-wider">全部资源对象 ({targetList.length})</div>
                  <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                    {targetList.map((inst: string, idx: number) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-slate-300 text-[10px] font-mono hover:bg-slate-700 transition-colors cursor-pointer">
                        {inst}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">任务名称</label>
            <input
              type="text"
              value={currentTask.name || ''}
              onChange={(e) => handleFieldChange(activeTaskIndex, 'name', e.target.value)}
              className="bg-slate-950/60 border border-slate-800 focus:border-indigo-500/80 focus:outline-none text-slate-200 rounded-lg py-2 px-3 text-xs transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">任务描述</label>
            <textarea
              value={currentTask.description || ''}
              onChange={(e) => handleFieldChange(activeTaskIndex, 'description', e.target.value)}
              className="bg-slate-950/60 border border-slate-800 focus:border-indigo-500/80 focus:outline-none text-slate-200 rounded-lg py-2 px-3 text-xs min-h-[50px] transition-all"
            />
          </div>

          {/* 脚本配置单行入口 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">脚本配置</label>
            <div 
              onClick={openScriptModal}
              className="group/script cursor-pointer flex items-center gap-3 bg-slate-950/50 border border-slate-800/80 hover:border-indigo-500/50 rounded-xl p-2.5 transition-all"
            >
              <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 uppercase">
                {currentTask.scriptType === 'python' ? 'Python' : 'Shell'}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-mono text-slate-400 group-hover/script:text-slate-300 truncate block">
                  {currentTask.scriptContent ? currentTask.scriptContent.split('\n')[0] : '点击配置脚本内容...'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 mx-1">
                <span className="text-xs font-medium leading-none text-slate-500 group-hover/script:text-indigo-400 transition-colors">展开编辑</span>
                <Maximize2 size={14} className="text-slate-500 group-hover/script:text-indigo-400 transition-colors" />
              </div>
            </div>
          </div>

          {/* Variables configuration */}
          {Array.isArray(currentTask.variables) && currentTask.variables.length > 0 && (
            <div className="pt-1 space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase">变量配置</label>
              <div className="grid grid-cols-1 gap-2">
                {currentTask.variables.map((v: any, varIdx: number) => (
                  <div key={varIdx} className="flex items-center gap-3 bg-slate-950/30 border border-slate-800/50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 w-1/3">
                      {!v.editable && <Lock size={10} className="text-slate-500 shrink-0" />}
                      <span className="text-[10.5px] font-mono font-bold text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap" title={v.name}>{v.name}</span>
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        disabled={!v.editable}
                        value={v.value || ''}
                        onChange={(e) => handleVariableChange(activeTaskIndex, varIdx, e.target.value)}
                        className={`w-full bg-slate-950/60 border rounded-lg py-1.5 px-3 text-xs transition-all focus:outline-none ${v.editable ? 'border-slate-800 focus:border-indigo-500/85 text-slate-200' : 'border-slate-800/20 text-slate-500 cursor-not-allowed'}`}
                        placeholder="暂无值"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Submit Button */}
      <div className="p-4 border-t border-slate-800/60 bg-slate-900/20 shrink-0 flex justify-end">
        <button
          onClick={handleSubmit}
          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-all shadow-lg shadow-blue-500/20 active:scale-95 border border-blue-500/20"
        >
          确认任务配置
        </button>
      </div>
    </motion.div>

      {/* 脚本编辑弹窗 Modal */}
      {isScriptModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          {toastMessage && (
            <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[110] bg-[#1a1500]/90 border border-orange-500/30 text-orange-400 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300">
              <AlertCircle size={14} />
              {toastMessage}
            </div>
          )}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-5xl bg-[#161622] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-white/[0.02]">
              <h3 className="text-sm font-bold text-slate-200">编辑脚本</h3>
              <button onClick={() => setIsScriptModalOpen(false)} className="text-slate-500 hover:text-slate-300">
                <X size={16} />
              </button>
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">脚本类型</label>
                <div className="flex gap-2">
                  {(['shell', 'python'] as const).map((type) => {
                    const isActive = tempScriptData.type === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleScriptTypeChange(type)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 cursor-pointer ${
                          isActive
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/5'
                            : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        {type === 'shell' ? 'Shell 脚本' : 'Python 脚本'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">脚本内容</label>
                <textarea
                  value={tempScriptData.content}
                  onChange={(e) => setTempScriptData(prev => ({ ...prev, content: e.target.value }))}
                  onKeyDown={handleTextareaKeyDown}
                  placeholder="在此编写您的脚本逻辑..."
                  className="w-full bg-[#0d0f1a] border border-slate-800 focus:border-indigo-500/50 rounded-xl p-4 text-xs font-mono text-slate-300 min-h-[600px] focus:outline-none transition-colors leading-relaxed"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-white/[0.02] flex justify-end gap-3">
              <button onClick={() => setIsScriptModalOpen(false)} className="px-5 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors">
                取消
              </button>
              <button onClick={saveScriptModal} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-indigo-500/20">
                确认配置
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

const PREDEFINED_NODE_DETAILS = {
  '172.30.34.73:8001': {
    detailTable: [
      ['对象', '172.30.34.73:8001'],
      ['状态', 'completed'],
      ['结果', 'abnormal'],
      ['严重级别', 'critical'],
      ['摘要', 'Python: RSS=1821MB threads=7 fd=19'],
      ['问题描述', '该对象存在资源使用异常，RSS 内存较高，CPU 使用率持续升高，需关注资源压力。'],
      ['影响范围', '当前服务实例，可能影响响应性能与稳定性。']
    ],
    baseMetrics: [
      ['FD 数', 'fd_count', '19', '个'],
      ['进程 ID', 'pid', '1', '-'],
      ['进程存活状态', 'process_alive', 'true', '存活'],
      ['RSS 内存', 'rss_mb', '1821', 'MB'],
      ['线程数', 'threads', '7', '个']
    ],
    evalMetrics: [
      ['CPU 使用率', '92%', '80%', '异常'],
      ['内存使用率', '88%', '80%', '偏高'],
      ['错误率', '3.2%', '1%', '异常']
    ],
    anomalies: [
      'CPU 使用率异常升高（92%）',
      '内存使用率接近上限（88%）',
      '错误率高于阈值（3.2%）'
    ],
    charts: [
      {
        title: 'CPU 使用率趋势 (近30分钟)',
        labels: ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25', '10:30'],
        data: [65, 70, 75, 82, 88, 90, 92],
        events: [{ time: '10:15', label: '异常开始' }]
      },
      {
        title: '内存使用率趋势 (近30分钟)',
        labels: ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25', '10:30'],
        data: [60, 65, 70, 75, 80, 85, 88]
      },
      {
        title: '错误率趋势 (近30分钟)',
        labels: ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25', '10:30'],
        data: [0.5, 0.8, 1.0, 1.5, 2.2, 2.8, 3.2]
      }
    ],
    historyTable: [
      ['CPU 使用率', '92%', '68%', '80%', '明显偏高'],
      ['内存使用率', '88%', '64%', '80%', '明显偏高'],
      ['错误率', '3.2%', '0.8%', '1%', '明显偏高']
    ],
    diagnosis: {
      candidates: [
        ['资源压力', 'CPU + 内存同步上升', '资源占用持续增加'],
        ['异常负载', '错误率上升', '但未与流量直接关联']
      ],
      evidences: [
        'CPU 与内存呈现高度同步上升趋势',
        '内存未观察到明显回收行为',
        '错误率存在异常波动'
      ],
      unconfirmed: [
        '未获取详细日志',
        '未获取线程堆栈',
        '未确认近期发布变更'
      ]
    },
    verdict: {
      summary: [
        ['分析对象', '172.30.34.73:8001'],
        ['问题类型', '资源使用异常'],
        ['影响范围', '当前服务实例'],
        ['状态', '持续中'],
        ['严重级别', 'critical']
      ],
      findings: [
        'CPU 使用率持续 high 位运行',
        '内存持续增长且未明显回落',
        '错误率高于历史基线'
      ],
      judgment: '当前对象存在资源压力风险，可能影响服务稳定性与响应性能。当前仍需持续关注。',
      recommendations: [
        '建议查看当前对象对应时间段日志',
        '建议持续关注当前对象资源变化趋势',
        '建议确认当前对象近期是否存在发布或配置变更'
      ],
      boundary: [
        '详细日志',
        '线程堆栈',
        'Heap Dump',
        '应用代码链路'
      ]
    }
  },
  '172.30.34.81:8001': {
    detailTable: [
      ['对象', '172.30.34.81:8001'],
      ['状态', 'completed'],
      ['结果', 'abnormal'],
      ['严重级别', 'critical'],
      ['摘要', 'Python: RSS=486MB threads=12 fd=980'],
      ['问题描述', '文件句柄数已接近系统允许上限，存在句柄泄漏风险。'],
      ['影响范围', '可能导致新连接无法建立，引发服务崩溃。']
    ],
    baseMetrics: [
      ['FD 数', 'fd_count', '980', '个'],
      ['进程 ID', 'pid', '12', '-'],
      ['进程存活状态', 'process_alive', 'true', '存活'],
      ['RSS 内存', 'rss_mb', '486', 'MB'],
      ['线程数', 'threads', '12', '个']
    ],
    evalMetrics: [
      ['CPU 使用率', '28%', '80%', '正常'],
      ['内存使用率', '45%', '80%', '正常'],
      ['FD 使用数', '980', '800', '异常']
    ],
    anomalies: [
      'FD文件描述符使用率过高（95%）',
      '接近系统句柄上限（1024）'
    ],
    charts: [
      {
        title: 'FD 使用数趋势 (近30分钟)',
        labels: ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25', '10:30'],
        data: [300, 350, 420, 510, 700, 880, 980],
        events: [{ time: '10:20', label: '急剧上升' }]
      },
      {
        title: 'CPU 使用率趋势 (近30分钟)',
        labels: ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25', '10:30'],
        data: [25, 26, 28, 27, 28, 29, 28]
      },
      {
        title: '内存使用率趋势 (近30分钟)',
        labels: ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25', '10:30'],
        data: [40, 42, 43, 44, 45, 45, 45]
      }
    ],
    historyTable: [
      ['FD使用数', '980', '150', '800', '接近上限'],
      ['CPU使用率', '28%', '25%', '80%', '正常']
    ],
    diagnosis: {
      candidates: [
        ['句柄泄漏', 'FD 数量突增且持续不下降', '疑似连接或文件流未关闭'],
        ['连接池泄露', '与上游调用增加相关', '资源句柄耗尽']
      ],
      evidences: [
        'FD 句柄在近 30 分钟内呈指数级上涨',
        '未见任何句柄释放行为'
      ],
      unconfirmed: [
        '未确认底层文件流是否合理关闭',
        '未确认 Socket 连接重试策略'
      ]
    },
    verdict: {
      summary: [
        ['分析对象', '172.30.34.81:8001'],
        ['问题类型', 'FD 句柄数超限'],
        ['影响范围', '当前服务实例'],
        ['状态', '持续中'],
        ['严重级别', 'critical']
      ],
      findings: [
        '文件句柄数已达 980，逼近 1024 限制',
        '未观察到文件句柄回收动作'
      ],
      judgment: '当前对象已达临界限制，随时可能因 Out of FDs 拒绝连接，建议尽快核查。',
      recommendations: [
        '建议查看该实例打开的文件 and 连接详情 (lsof)',
        '确认底层资源是否在 finally 中正确释放'
      ],
      boundary: [
        '当前文件流堆栈',
        '未释放的 HTTP/TCP 连接链'
      ]
    }
  },
  '172.30.34.90:8001': {
    detailTable: [
      ['对象', '172.30.34.90:8001'],
      ['状态', 'failed'],
      ['结果', 'failed'],
      ['严重级别', 'critical'],
      ['失败原因', '连接超时'],
      ['错误信息', '无法连接目标对象，巡检脚本未执行'],
      ['影响范围', '当前对象所有配置检查项均未完成']
    ],
    uncollectedMetrics: [
      ['CPU 使用率', '否', '连接失败，无法采集'],
      ['内存使用率', '否', '连接失败，无法采集'],
      ['RSS 内存', '否', '连接失败，无法采集'],
      ['线程数', '否', '连接失败，无法采集'],
      ['FD 数', '否', '连接失败，无法采集']
    ],
    diagnosis: {
      candidates: [
        ['网络连接异常', '连接超时', '无法连接目标对象']
      ],
      unconfirmed: [
        '未确认目标对象网络是否可达',
        '未确认 Agent 是否正常运行',
        '未确认巡检脚本权限配置',
        '未确认目标对象是否发生重启或迁移'
      ]
    },
    verdict: {
      summary: [
        ['分析对象', '172.30.34.90:8001'],
        ['巡检结果', 'failed'],
        ['影响范围', '当前对象所有检查项未完成'],
        ['当前状态', '巡检未完整完成'],
        ['严重级别', 'critical']
      ],
      findings: [
        '当前对象巡检执行失败',
        '失败对象无法采集 CPU、内存、RSS、线程数、FD 数等指标',
        '当前数据不足以判断该对象的服务健康状态',
        '本次失败会影响该对象的巡检完整性'
      ],
      judgment: '当前问题属于巡检执行失败，不等同于服务业务异常。当前对象的实际运行状态未知。需要先恢复巡检采集能力，再进行健康判断。',
      recommendations: [
        '建议确认当前对象网络连通性',
        '建议确认当前对象 Agent 是否在线',
        '建议确认当前对象巡检脚本权限配置',
        '建议重新执行当前对象巡检'
      ],
      boundary: [
        '当前对象实时指标',
        '当前对象历史趋势',
        '当前对象日志',
        '目标主机实际运行状态'
      ]
    }
  },
  '172.30.34.91:8001': {
    detailTable: [
      ['对象', '172.30.34.91:8001'],
      ['状态', 'failed'],
      ['结果', 'failed'],
      ['严重级别', 'critical'],
      ['失败原因', 'Agent 离线'],
      ['错误信息', 'SRE Agent 已丢失心跳超过 5 分钟'],
      ['影响范围', '当前对象所有指标和配置检查均未完成']
    ],
    uncollectedMetrics: [
      ['CPU 使用率', '否', 'Agent 离线，无法采集'],
      ['内存使用率', '否', 'Agent 离线，无法采集'],
      ['RSS 内存', '否', 'Agent 离线，无法采集'],
      ['线程数', '否', 'Agent 离线，无法采集'],
      ['FD 数', '否', 'Agent 离线，无法采集']
    ],
    diagnosis: {
      candidates: [
        ['Agent 离线', 'Agent 状态不可用', '目标对象无法执行巡检脚本']
      ],
      unconfirmed: [
        '未确认目标对象网络是否可达',
        '未确认 Agent 服务是否被强杀',
        '未确认目标主机系统资源负载是否已满导致假死'
      ]
    },
    verdict: {
      summary: [
        ['分析对象', '172.30.34.91:8001'],
        ['巡检结果', 'failed'],
        ['影响范围', '当前对象所有检查项未完成'],
        ['当前状态', '巡检未完整完成'],
        ['严重级别', 'critical']
      ],
      findings: [
        '当前对象 Agent 心跳丢失已超 5 分钟',
        '无法读取系统实时及历史状态',
        '本次失败导致检查无法闭环'
      ],
      judgment: '由于 Agent 离线，无法判断其业务状态，可能主机故障或 Agent 进程死亡，需要优先排查 Agent 服务状态。',
      recommendations: [
        '建议登录主机执行 systemctl status sre-agent 检查 Agent 服务状态',
        '检查 Agent 配置文件中的心跳上报地址是否正确'
      ],
      boundary: [
        '当前对象实时指标',
        '当前对象历史趋势',
        'Agent 运行日志'
      ]
    }
  },
  '172.30.34.92:8001': {
    detailTable: [
      ['对象', '172.30.34.92:8001'],
      ['状态', 'failed'],
      ['结果', 'failed'],
      ['严重级别', 'warning'],
      ['失败原因', '权限不足'],
      ['错误信息', '执行巡检脚本时返回 Permission Denied'],
      ['影响范围', '部分高特权系统指标未完成采集']
    ],
    uncollectedMetrics: [
      ['CPU 使用率', '是', '正常'],
      ['内存使用率', '是', '正常'],
      ['RSS 内存', '否', '无权读取 /proc 目录'],
      ['线程数', '否', '无权读取 /proc 目录'],
      ['FD 数', '否', '无权读取 /proc 目录']
    ],
    diagnosis: {
      candidates: [
        ['权限配置不足', '返回权限错误', '脚本无权限访问部分指标']
      ],
      unconfirmed: [
        '未确认执行账号的用户组配置',
        '未确认 sudoers 文件中巡检指令的免密权限配置'
      ]
    },
    verdict: {
      summary: [
        ['分析对象', '172.30.34.92:8001'],
        ['巡检结果', 'failed'],
        ['影响范围', '部分高特权配置检查项未完成'],
        ['当前状态', '巡检未完整完成'],
        ['严重级别', 'warning']
      ],
      findings: [
        '部分基础系统信息采集受限',
        '未完成 RSS、线程数、FD 数采集'
      ],
      judgment: '巡检部分失败，权限配置不全。部分指标正常采集，但不完整。建议排查账户权限设置。',
      recommendations: [
        '建议核查巡检脚本在目标主机上的执行账号所属用户组',
        '核查 /etc/sudoers 配置文件中赋予该账号的权限'
      ],
      boundary: [
        '高特权指标数据',
        '内核级别文件描述符监控'
      ]
    }
  }
};

const generateInspectionAnalysisData = (task) => {
  let branch = 'abnormal';
  if (task.status === '健康' || task.status === '正常') {
    branch = 'normal';
  } else if (task.status === '失败') {
    branch = 'failed';
  }

  const name = task.name || 'Python 应用综合巡检计划_20260612_152439';
  const updatedAt = task.updatedAt || '2026-06-12 15:24:39';

  let stage1 = {};
  let stage2 = {};
  let stage3 = {};
  let stage4 = {};
  let priorityObjects = [];
  const nodeDetails = PREDEFINED_NODE_DETAILS;

  if (branch === 'normal') {
    const planInfo = [
      ['巡检计划名称', name],
      ['执行结果', 'normal'],
      ['执行时间', updatedAt],
      ['严重级别', 'info']
    ];

    const normalFirstFive = [
      ['1', '172.30.34.73:8001', 'normal', 'info', 'RSS=512MB CPU=32%'],
      ['2', '172.30.34.81:8001', 'normal', 'info', 'RSS=486MB CPU=28%'],
      ['3', '172.30.34.90:8001', 'normal', 'info', 'RSS=530MB CPU=35%'],
      ['4', '172.30.34.91:8001', 'normal', 'info', 'RSS=498MB CPU=31%'],
      ['5', '172.30.34.92:8001', 'normal', 'info', 'RSS=520MB CPU=33%']
    ];
    const objectsTable = [...normalFirstFive];
    for (let i = 6; i <= 23; i++) {
      objectsTable.push([
        i.toString(),
        `172.30.34.${72 + i}:8001`,
        'normal',
        'info',
        `RSS=${480 + (i * 3) % 40}MB CPU=${28 + (i * 2) % 10}%`
      ]);
    }

    stage1 = {
      planInfo,
      objectCount: 23,
      objectsTable,
      objectStats: [
        ['巡检对象总数', 23],
        ['正常对象数', 23],
        ['异常对象数', 0],
        ['失败对象数', 0]
      ],
      healthSummary: '本次巡检共覆盖 23 个对象，所有对象均执行成功，未发现异常对象或失败对象。关键资源指标整体处于正常范围内，CPU、内存、错误率均未出现超阈值情况，当前系统运行状态稳定。'
    };

    const trendTable = [
      ['172.30.34.73:8001', 28, 30, 31, 32, 31, 33, 32, '平稳'],
      ['172.30.34.81:8001', 25, 26, 28, 27, 28, 29, 28, '平稳'],
      ['172.30.34.90:8001', 30, 31, 30, 32, 31, 30, 32, '平稳'],
      ['172.30.34.91:8001', 29, 30, 30, 31, 31, 32, 31, '平稳'],
      ['172.30.34.92:8001', 27, 28, 29, 29, 30, 30, 31, '平稳']
    ];
    for (let i = 6; i <= 23; i++) {
      trendTable.push([
        `172.30.34.${72 + i}:8001`,
        25 + (i % 5), 26 + (i % 4), 28 - (i % 3), 27 + (i % 2), 28, 29 - (i % 4), 28, '平稳'
      ]);
    }

    stage2 = {
      trendTable,
      trendSummary: '近 30 分钟内，核心巡检对象的 CPU、内存和错误率整体保持平稳，未观察到持续上升、突增或异常波动。当前趋势与正常巡检状态一致，暂无潜在恶化迹象。'
    };

    stage3 = {
      judgmentTable: [
        ['执行完整性', '通过', '所有对象巡检成功'],
        ['结果检查', '通过', '无异常对象，无失败对象'],
        ['阈值检查', '通过', '关键指标均低于阈值'],
        ['趋势检查', '通过', '近 30 分钟无持续恶化趋势']
      ],
      evidenceList: [
        '本次巡检覆盖 23 个对象',
        '所有对象均执行成功',
        '未发现异常或失败对象',
        '关键指标整体处于正常范围',
        '关键趋势整体平稳'
      ]
    };

    stage4 = {
      verdictTable: [
        ['巡检结果', '正常'],
        ['影响范围', '无异常影响'],
        ['当前状态', '稳定'],
        ['严重级别', 'info']
      ],
      verdictJudgments: [
        '当前系统运行状态稳定',
        '暂未发现资源压力或错误率异常',
        '无需立即处理'
      ],
      verdictSuggestions: [
        '建议保持当前巡检策略',
        '建议继续按计划执行后续巡检',
        '如业务高峰期临近，可持续关注核心服务指标'
      ]
    };

  } else if (branch === 'abnormal') {
    const planInfo = [
      ['巡检计划名称', name],
      ['执行结果', 'abnormal'],
      ['执行时间', updatedAt],
      ['严重级别', 'critical']
    ];

    const abnormalFirstFive = [
      ['1', '172.30.34.73:8001', 'abnormal', 'critical', 'RSS=1821MB CPU=92%'],
      ['2', '172.30.34.81:8001', 'abnormal', 'critical', 'FD=980 接近上限'],
      ['3', '172.30.34.90:8001', 'failed', 'critical', '连接超时'],
      ['4', '172.30.34.91:8001', 'normal', 'info', 'RSS=512MB CPU=32%'],
      ['5', '172.30.34.92:8001', 'normal', 'info', 'RSS=498MB CPU=31%']
    ];
    const objectsTable = [...abnormalFirstFive];
    for (let i = 6; i <= 23; i++) {
      objectsTable.push([
        i.toString(),
        `172.30.34.${72 + i}:8001`,
        'normal',
        'info',
        `RSS=${480 + (i * 3) % 40}MB CPU=${28 + (i * 2) % 10}%`
      ]);
    }

    priorityObjects = [
      { ip: '172.30.34.73:8001', type: 'abnormal', severity: 'critical', reason: 'CPU=92%，RSS=1821MB' },
      { ip: '172.30.34.81:8001', type: 'abnormal', severity: 'critical', reason: 'FD=980 接近上限' },
      { ip: '172.30.34.90:8001', type: 'failed', severity: 'critical', reason: '连接超时' }
    ];

    stage1 = {
      planInfo,
      objectCount: 23,
      objectsTable,
      objectStats: [
        ['巡检对象总数', 23],
        ['正常对象数', 20],
        ['异常对象数', 2],
        ['失败对象数', 1]
      ]
    };

    const trendTable = [
      ['172.30.34.73:8001', 65, 70, 75, 82, 88, 90, 92, '稳步上升'],
      ['172.30.34.81:8001', 40, 42, 45, 48, 70, 88, 95, '突增'],
      ['172.30.34.91:8001', 30, 31, 30, 32, 31, 30, 32, '平稳']
    ];
    for (let i = 4; i <= 23; i++) {
      trendTable.push([
        `172.30.34.${72 + i}:8001`,
        25 + (i % 5), 26 + (i % 4), 28 - (i % 3), 27 + (i % 2), 28, 29 - (i % 4), 28, '平稳'
      ]);
    }

    stage2 = {
      trendTable
    };

  } else if (branch === 'failed') {
    const planInfo = [
      ['巡检计划名称', name],
      ['执行结果', 'failed'],
      ['执行时间', updatedAt],
      ['严重级别', 'critical']
    ];

    const failedFirstFive = [
      ['1', '172.30.34.90:8001', 'failed', 'critical', '连接超时'],
      ['2', '172.30.34.91:8001', 'failed', 'critical', 'Agent 离线'],
      ['3', '172.30.34.92:8001', 'failed', 'warning', '权限不足'],
      ['4', '172.30.34.73:8001', 'normal', 'info', 'RSS=512MB CPU=32%'],
      ['5', '172.30.34.81:8001', 'normal', 'info', 'RSS=486MB CPU=28%']
    ];
    const objectsTable = [...failedFirstFive];
    for (let i = 6; i <= 23; i++) {
      objectsTable.push([
        i.toString(),
        `172.30.34.${72 + i}:8001`,
        'normal',
        'info',
        `RSS=${480 + (i * 3) % 40}MB CPU=${28 + (i * 2) % 10}%`
      ]);
    }

    priorityObjects = [
      { ip: '172.30.34.90:8001', reason: '连接超时', severity: 'critical', impact: '所有检查项未完成' },
      { ip: '172.30.34.91:8001', reason: 'Agent 离线', severity: 'critical', impact: '所有检查项未完成' },
      { ip: '172.30.34.92:8001', reason: '权限不足', severity: 'warning', impact: '部分检查项未完成' }
    ];

    stage1 = {
      planInfo,
      objectCount: 23,
      objectsTable,
      objectStats: [
        ['巡检对象总数', 23],
        ['正常对象数', 20],
        ['异常对象数', 0],
        ['失败对象数', 3]
      ]
    };

    stage2 = {
      failedDistribution: [
        ['连接超时', 1, '172.30.34.90:8001'],
        ['Agent 离线', 1, '172.30.34.91:8001'],
        ['权限不足', 1, '172.30.34.92:8001']
      ],
      failedImpact: [
        ['影响对象数', '3'],
        ['未完成检查项', 'CPU、内存、RSS、线程数、FD 数'],
        ['是否影响本次巡检完整性', '是'],
        ['是否可判断服务健康', '否，部分对象数据缺失']
      ]
    };

    stage3 = {
      reasonsTable: [
        ['网络连接异常', '1', '172.30.34.90:8001', '连接超时', '巡检系统无法连接目标对象，导致检查脚本未执行'],
        ['Agent 离线', '1', '172.30.34.91:8001', 'Agent 状态不可用', '目标对象无法响应巡检任务，指标无法采集'],
        ['权限配置不足', '1', '172.30.34.92:8001', '返回权限错误', '巡检脚本无权限访问部分系统指标']
      ],
      ratioTable: [
        ['网络连接异常', '1', '33.3%'],
        ['Agent 离线', '1', '33.3%'],
        ['权限配置不足', '1', '33.3%']
      ],
      judgments: [
        '网络连接异常：目标对象不可达或连接超时，导致巡检脚本无法执行。',
        'Agent 状态异常：目标对象 Agent 离线或无响应，导致巡检任务无法下发或执行。',
        '权限配置不足：巡检脚本缺少必要权限，导致部分指标无法采集。'
      ],
      unconfirmed: [
        '是否存在网络连通性问题，例如目标对象不可达、端口不通、防火墙限制。',
        '是否存在 Agent 离线、异常退出、心跳中断等情况。',
        '是否存在巡检脚本权限不足、账号授权缺失、指标访问受限等问题。',
        '是否存在目标对象重启、迁移、下线或配置变更情况。'
      ],
      conclusion: '本次失败属于巡检执行层面的失败，当前数据不足以判断失败对象的真实服务健康状态。需要先恢复巡检采集能力，再重新执行失败对象巡检，之后才能继续判断是否存在资源异常或业务异常。'
    };

    stage4 = {
      verdictTable: [
        ['巡检结果', '失败'],
        ['巡检对象总数', '23'],
        ['失败对象数', '3'],
        ['失败占比', '13%'],
        ['主要失败原因', '连接超时、Agent 离线、权限不足'],
        ['巡检完整性', '受影响'],
        ['服务健康判断', '部分对象数据缺失，无法完整判断']
      ],
      findings: [
        '本次巡检共覆盖 23 个对象，其中 3 个对象执行失败。',
        '失败对象主要集中在连接超时、Agent 离线、权限不足三类原因。',
        '失败对象无法采集 CPU、内存、RSS、线程数、FD 数等关键指标。',
        '由于部分对象数据缺失，本次巡检完整性受到影响。',
        '当前无法基于失败对象判断其真实服务健康状态。'
      ],
      judgments: [
        '当前问题属于巡检执行失败，不等同于服务业务异常。',
        '本次巡检结果不完整，失败对象的实际运行状态未知。',
        '需要优先恢复失败对象的巡检采集能力。',
        '只有重新采集到指标后，才能继续判断失败对象是否存在业务或资源异常。'
      ],
      recommendationsTable: [
        ['连接超时', '确认目标对象网络连通性、端口访问状态、防火墙策略'],
        ['Agent 离线', '确认 Agent 是否在线、是否正常运行、心跳是否恢复'],
        ['权限不足', '确认巡检脚本执行权限、指标访问权限、账号授权配置']
      ],
      supplementaryRecommendations: [
        '建议优先处理严重级别较高的失败对象。',
        '建议恢复采集能力后，重新执行失败对象巡检。',
        '建议重新巡检后再生成健康判断或异常分析结论。'
      ]
    };
  }

  return {
    format: '0412_phased',
    branch,
    name,
    updatedAt,
    status: task.status,
    priorityObjects,
    nodeDetails,
    stage1,
    stage2,
    stage3,
    stage4
  };
};

const AllObjectsModal = ({ isOpen, onClose, title, objects, selectedIp, onSelectIp }: any) => {
  const [search, setSearch] = useState('');
  const [filterResult, setFilterResult] = useState('全部');
  const [filterSeverity, setFilterSeverity] = useState('全部');

  if (!isOpen) return null;

  const filtered = objects.filter((row: any) => {
    const ip = row[1] || '';
    const result = row[2] || '';
    const severity = row[3] || '';
    
    const matchesSearch = ip.toLowerCase().includes(search.toLowerCase());
    const matchesResult = filterResult === '全部' || result === filterResult ||
      (filterResult === 'normal' && result === '正常') ||
      (filterResult === 'abnormal' && result === '异常') ||
      (filterResult === 'failed' && result === '失败');
    const matchesSeverity = filterSeverity === '全部' || severity === filterSeverity ||
      (filterSeverity === 'info' && severity === '普通') ||
      (filterSeverity === 'warning' && severity === '警告') ||
      (filterSeverity === 'critical' && severity === '严重');
    
    return matchesSearch && matchesResult && matchesSeverity;
  });

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-[#0b0b10] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden text-left font-sans">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#101016]">
          <h3 className="text-sm font-bold text-slate-200">{title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-4 bg-slate-900/20 border-b border-slate-800 flex gap-4 items-center">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="输入 IP 搜索..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={filterResult} 
              onChange={(e) => setFilterResult(e.target.value)}
              className="bg-black/40 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none bg-[#0a0a0f]"
            >
              <option value="全部">全部结果</option>
              <option value="normal">正常 (normal)</option>
              <option value="abnormal">异常 (abnormal)</option>
              <option value="failed">失败 (failed)</option>
            </select>
            <select 
              value={filterSeverity} 
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-black/40 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none bg-[#0a0a0f]"
            >
              <option value="全部">全部级别</option>
              <option value="info">普通 (info)</option>
              <option value="warning">警告 (warning)</option>
              <option value="critical">严重 (critical)</option>
            </select>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">巡检对象</th>
                <th className="px-3 py-2">结果</th>
                <th className="px-3 py-2">严重级别</th>
                <th className="px-3 py-2">摘要/原因</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row: any, i: number) => {
                const isSelected = selectedIp === row[1];
                return (
                  <tr 
                    key={i} 
                    onClick={() => { onSelectIp(row[1]); onClose(); }}
                    className={`border-b border-slate-800/30 last:border-0 hover:bg-blue-600/5 cursor-pointer transition-colors ${isSelected ? 'bg-blue-600/10' : ''}`}
                  >
                    <td className="px-3 py-2 text-slate-500">{row[0]}</td>
                    <td className="px-3 py-2 font-mono text-slate-200">{row[1]}</td>
                    <td className="px-3 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                        row[2] === 'normal' || row[2] === '正常' ? 'bg-emerald-500/10 text-emerald-400' :
                        row[2] === 'abnormal' || row[2] === '异常' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-rose-500/10 text-rose-400'
                      }`}>
                        {row[2] === 'normal' ? '正常' : row[2] === 'abnormal' ? '异常' : row[2] === 'failed' ? '失败' : row[2]}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                        row[3] === 'info' || row[3] === '普通' ? 'bg-slate-800 text-slate-400' :
                        row[3] === 'warning' || row[3] === '警告' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-rose-500/10 text-rose-500'
                      }`}>
                        {row[3] === 'info' ? '普通' : row[3] === 'warning' ? '警告' : row[3] === 'critical' ? '严重' : row[3]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-400 truncate max-w-[200px]">{row[4]}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">未找到匹配的对象</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const exportReport = (data: any, branch: string, format: string) => {
  const branchLabel = branch === 'normal' ? '健康 (normal)' : branch === 'abnormal' ? '异常 (abnormal)' : '失败 (failed)';
  
  // Define metadata per branch
  let planName = '';
  let taskId = '';
  let schedulePolicy = '';
  let samplingRange = '近 30 分钟 (10:00 - 10:30)';
  let verdictLabel = '';
  let totalNodes = 23;
  let healthyNodes = 0;
  let abnormalNodes = 0;
  let failedNodes = 0;

  if (branch === 'normal') {
    planName = '生产主干核心服务健康巡检';
    taskId = 'INSP-20260705-001';
    schedulePolicy = '每小时自动巡检';
    verdictLabel = '正常 (Completed)';
    healthyNodes = 23;
  } else if (branch === 'abnormal') {
    planName = '核心交易数据库实例高可用巡检';
    taskId = 'INSP-20260705-002';
    schedulePolicy = '单次手动触发';
    verdictLabel = '异常 (Abnormal)';
    healthyNodes = 20;
    abnormalNodes = 2;
    failedNodes = 1;
  } else {
    planName = '数据同步集群网络连通性巡检';
    taskId = 'INSP-20260705-003';
    schedulePolicy = '故障触发联动巡检';
    verdictLabel = '失败 (Failed)';
    failedNodes = 23;
  }

  // 1. Plan Info & Stats HTML / MD
  const planInfoMarkdown = `
### 1. 巡检计划信息
| 配置项 | 配置内容 |
| --- | --- |
| 巡检计划名称 | ${planName} |
| 任务 ID | ${taskId} |
| 调度策略 | ${schedulePolicy} |
| 数据采样范围 | ${samplingRange} |
| 判定结论 | ${verdictLabel} |
`;

  const planInfoHtml = `
    <div class="info-card">
      <h3 style="margin-top: 0; color: #f8fafc; font-size: 14px; border-bottom: 1px solid #334155; padding-bottom: 6px;">1. 巡检计划信息</h3>
      <table style="margin: 10px 0; width: 100%;">
        <tbody>
          <tr><td style="color: #94a3b8; width: 180px; padding: 8px; border: 1px solid #334155;">巡检计划名称</td><td style="font-weight: bold; padding: 8px; border: 1px solid #334155;">${planName}</td></tr>
          <tr><td style="color: #94a3b8; padding: 8px; border: 1px solid #334155;">任务 ID</td><td style="font-family: monospace; padding: 8px; border: 1px solid #334155;">${taskId}</td></tr>
          <tr><td style="color: #94a3b8; padding: 8px; border: 1px solid #334155;">调度策略</td><td style="padding: 8px; border: 1px solid #334155;">${schedulePolicy}</td></tr>
          <tr><td style="color: #94a3b8; padding: 8px; border: 1px solid #334155;">数据采样范围</td><td style="padding: 8px; border: 1px solid #334155;">${samplingRange}</td></tr>
          <tr><td style="color: #94a3b8; padding: 8px; border: 1px solid #334155;">判定结论</td><td style="padding: 8px; border: 1px solid #334155;"><span class="badge ${branch === 'normal' ? 'badge-normal' : branch === 'abnormal' ? 'badge-abnormal' : 'badge-failed'}">${verdictLabel}</span></td></tr>
        </tbody>
      </table>
    </div>
  `;

  const statsMarkdown = `
### 2. 状态统计看板
| 统计项 | 统计数量 |
| --- | --- |
| 巡检对象总数 | ${totalNodes} 个 |
| 正常对象数 | ${healthyNodes} 个 |
| 异常对象数 | ${abnormalNodes} 个 |
| 失败对象数 | ${failedNodes} 个 |
`;

  const statsHtml = `
    <div class="info-card">
      <h3 style="margin-top: 0; color: #f8fafc; font-size: 14px; border-bottom: 1px solid #334155; padding-bottom: 6px;">2. 状态统计看板</h3>
      <div style="display: flex; gap: 20px; margin-top: 15px;">
        <div style="flex: 1; background: #1e293b; padding: 12px; border-radius: 6px; text-align: center;">
          <div style="font-size: 10px; color: #94a3b8; font-weight: bold;">对象总数</div>
          <div style="font-size: 20px; font-weight: 800; color: #f8fafc; margin-top: 4px;">${totalNodes}</div>
        </div>
        <div style="flex: 1; background: rgba(16, 185, 129, 0.1); padding: 12px; border-radius: 6px; text-align: center; border: 1px solid rgba(16, 185, 129, 0.2);">
          <div style="font-size: 10px; color: #34d399; font-weight: bold;">正常对象</div>
          <div style="font-size: 20px; font-weight: 800; color: #34d399; margin-top: 4px;">${healthyNodes}</div>
        </div>
        <div style="flex: 1; background: rgba(244, 63, 94, 0.1); padding: 12px; border-radius: 6px; text-align: center; border: 1px solid rgba(244, 63, 94, 0.2);">
          <div style="font-size: 10px; color: #fb7185; font-weight: bold;">异常对象</div>
          <div style="font-size: 20px; font-weight: 800; color: #fb7185; margin-top: 4px;">${abnormalNodes}</div>
        </div>
        <div style="flex: 1; background: rgba(245, 158, 11, 0.1); padding: 12px; border-radius: 6px; text-align: center; border: 1px solid rgba(245, 158, 11, 0.2);">
          <div style="font-size: 10px; color: #fbbf24; font-weight: bold;">失败对象</div>
          <div style="font-size: 20px; font-weight: 800; color: #fbbf24; margin-top: 4px;">${failedNodes}</div>
        </div>
      </div>
    </div>
  `;

  // Objects Table
  let fullObjectsTableRows = '';
  let fullObjectsTableMarkdown = '| 序号 | 巡检对象 | 状态 | 严重级别 | 核心摘要 |\n| --- | --- | --- | --- | --- |\n';
  
  let allObjects: any[] = [];
  if (branch === 'normal') {
    for (let i = 1; i <= 23; i++) {
      allObjects.push([
        String(i),
        `172.30.38.${10 + i}:8001`,
        'completed',
        'info',
        `RSS=${480 + (i * 3) % 40}MB CPU=${28 + (i * 2) % 10}%`
      ]);
    }
  } else if (branch === 'abnormal') {
    allObjects.push(['1', '172.30.34.73:8001', 'abnormal', 'critical', 'CPU / 内存超限，出现错误率']);
    allObjects.push(['2', '172.30.34.81:8001', 'abnormal', 'critical', '活动文件描述符 (FD) 过高']);
    allObjects.push(['3', '172.30.34.90:8001', 'failed', 'critical', '连接超时']);
    for (let i = 4; i <= 23; i++) {
      allObjects.push([
        String(i),
        `172.30.38.${10 + i}:8001`,
        'completed',
        'info',
        `RSS=${480 + (i * 3) % 40}MB CPU=${28 + (i * 2) % 10}%`
      ]);
    }
  } else {
    for (let i = 1; i <= 23; i++) {
      allObjects.push([
        String(i),
        `172.30.40.${10 + i}:8001`,
        'failed',
        'critical',
        '连接超时 (Connection Timeout)'
      ]);
    }
  }

  allObjects.forEach((obj: any) => {
    const statusText = obj[2] === 'completed' ? '正常' : obj[2] === 'abnormal' ? '异常' : '失败';
    const severityText = obj[3] === 'info' ? '普通' : obj[3] === 'warning' ? '警告' : '严重';
    fullObjectsTableMarkdown += `| ${obj[0]} | ${obj[1]} | ${statusText} | ${severityText} | ${obj[4]} |\n`;
    fullObjectsTableRows += `
      <tr>
        <td style="padding: 10px; border: 1px solid #334155;">${obj[0]}</td>
        <td style="padding: 10px; border: 1px solid #334155; font-family: monospace; font-weight: bold;">${obj[1]}</td>
        <td style="padding: 10px; border: 1px solid #334155;"><span class="badge ${obj[2] === 'completed' ? 'badge-normal' : obj[2] === 'abnormal' ? 'badge-abnormal' : 'badge-failed'}">${statusText}</span></td>
        <td style="padding: 10px; border: 1px solid #334155;">${severityText}</td>
        <td style="padding: 10px; border: 1px solid #334155;">${obj[4]}</td>
      </tr>
    `;
  });

  // Trends Table
  let trendTableMarkdown = '| 指标名称 | 绑定参数 | 评估状态 | 10:00 | 10:10 | 10:20 | 10:30 | 趋势 |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n';
  let trendTableRows = '';
  
  let trendData: any[] = [];
  if (branch === 'normal') {
    trendData = [
      ['CPU 使用率', 'cpu_usage', '正常', '28%', '32%', '30%', '32%', '平稳'],
      ['内存使用率', 'mem_usage', '正常', '42%', '45%', '44%', '45%', '平稳'],
      ['错误率', 'error_rate', '正常', '0.0%', '0.0%', '0.0%', '0.0%', '平稳'],
      ['FD 文件描述符', 'fd_count', '正常', '15', '18', '16', '18', '平稳'],
      ['网络流入 (KB/s)', 'net_in', '正常', '120', '140', '135', '142', '平稳'],
      ['网络流出 (KB/s)', 'net_out', '正常', '240', '280', '270', '285', '平稳']
    ];
  } else if (branch === 'abnormal') {
    trendData = [
      ['CPU 使用率 (172.30.34.73)', 'cpu_usage', '异常', '65%', '75%', '88%', '92%', '突增'],
      ['内存使用率 (172.30.34.73)', 'mem_usage', '警告', '60%', '70%', '80%', '88%', '稳步上升'],
      ['错误率 (172.30.34.73)', 'error_rate', '异常', '0.5%', '1.0%', '2.2%', '3.2%', '突增'],
      ['FD 文件描述符 (172.30.34.81)', 'fd_count', '异常', '120', '340', '720', '980', '突增'],
      ['网络连接数 (172.30.34.81)', 'net_conn', '警告', '150', '320', '680', '950', '稳步上升']
    ];
  } else {
    trendData = [
      ['服务端口存活', 'service_port', '异常', 'Down', 'Down', 'Down', 'Down', '异常'],
      ['网络连通性', 'ping_ok', '异常', 'Fail', 'Fail', 'Fail', 'Fail', '异常']
    ];
  }

  trendData.forEach((row: any) => {
    trendTableMarkdown += `| ${row[0]} | ${row[1]} | ${row[2]} | ${row[3]} | ${row[4]} | ${row[5]} | ${row[6]} | ${row[7]} |\n`;
    trendTableRows += `
      <tr>
        <td style="padding: 10px; border: 1px solid #334155;">${row[0]}</td>
        <td style="padding: 10px; border: 1px solid #334155; font-family: monospace;">${row[1]}</td>
        <td style="padding: 10px; border: 1px solid #334155;"><span class="badge ${row[2] === '正常' ? 'badge-normal' : 'badge-failed'}">${row[2]}</span></td>
        <td style="padding: 10px; border: 1px solid #334155;">${row[3]}</td>
        <td style="padding: 10px; border: 1px solid #334155;">${row[4]}</td>
        <td style="padding: 10px; border: 1px solid #334155;">${row[5]}</td>
        <td style="padding: 10px; border: 1px solid #334155;">${row[6]}</td>
        <td style="padding: 10px; border: 1px solid #334155;"><span class="badge ${row[7] === '平稳' ? 'badge-normal' : row[7] === '稳步上升' ? 'badge-failed' : row[7] === '突增' ? 'badge-abnormal' : 'badge-failed'}">${row[7]}</span></td>
      </tr>
    `;
  });

  // Diagnostics & Verdict HTML / MD
  let diagMarkdown = '';
  let diagHtml = '';

  if (branch === 'normal') {
    diagMarkdown = `
## 三、根因分析 (Root Cause Analysis)
当前分支为健康巡检分支，系统未检测到异常或错误指标，**无需进行根因分析**。

## 四、最终结论与自愈建议 (Verdict & Recommendations)
### 1. 问题汇总与关键发现
经巡检多维关联分析，当前巡检计划下 **23** 个实例全部运行状态健康，无故障发现。
- 资源使用率均在安全水位内（CPU < 35%，内存 < 50%）。
- 复制延迟与文件描述符正常。
- 端口监听与服务连通性 100% 成功。

### 2. 自愈与处置修复方案
建议维持现状，定期自动巡检。无需执行任何自愈脚本或人工处置。
`;
    diagHtml = `
      <h2 style="color: #38bdf8; margin-top: 30px; border-bottom: 1px solid #334155; padding-bottom: 8px;">三、根因分析 (Root Cause Analysis)</h2>
      <div class="info-card" style="background-color: rgba(30, 41, 59, 0.3); border: 1px solid #334155; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <p style="color: #10b981; font-weight: bold;">✓ 当前分支为健康巡检分支，系统未检测到任何异常指标，无需进行根因分析。</p>
      </div>

      <h2 style="color: #38bdf8; margin-top: 30px; border-bottom: 1px solid #334155; padding-bottom: 8px;">四、最终结论与自愈建议 (Verdict & Recommendations)</h2>
      <div class="info-card" style="background-color: rgba(30, 41, 59, 0.3); border: 1px solid #334155; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #e2e8f0; margin-top: 15px;">1. 问题汇总与关键发现</h3>
        <p>经巡检多维关联分析，当前巡检计划下 <strong>23</strong> 个实例全部运行状态健康，无故障发现。</p>
        <ul>
          <li>资源使用率均在安全水位内（CPU &lt; 35%，内存 &lt; 50%）。</li>
          <li>复制延迟与文件描述符正常。</li>
          <li>端口监听与服务连通性 100% 成功。</li>
        </ul>
      </div>
      <div class="info-card" style="background-color: rgba(30, 41, 59, 0.3); border: 1px solid #334155; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #e2e8f0; margin-top: 15px;">2. 自愈与处置修复方案</h3>
        <p>建议维持现状，定期自动巡检。无需执行任何自愈脚本或人工处置。</p>
      </div>
    `;
  } else if (branch === 'abnormal') {
    diagMarkdown = `
## 三、根因分析 (Root Cause Analysis)

### 诊断对象: 172.30.34.73:8001 (异常)
#### 根因候选表
| 可能原因 | 支撑证据 | 说明 |
| --- | --- | --- |
| 资源压力 | CPU + 内存同步上升 | 资源占用持续增加 |
| 异常负载 | 错误率上升 | 但未与流量直接关联 |

#### 关键证据总结
- CPU 与内存呈现高度同步上升趋势
- 内存未观察到明显回收行为
- 错误率存在异常波动

---

### 诊断对象: 172.30.34.81:8001 (异常)
#### 根因候选表
| 可能原因 | 支撑证据 | 说明 |
| --- | --- | --- |
| 句柄泄漏 | FD文件描述符单调上升 | 新增连接未正常释放 |

#### 关键证据总结
- 文件描述符计数从 120 持续单调增长至 980
- 连接池未复用，不断建立新 Socket 连接

---

### 诊断对象: 172.30.34.90:8001 (失败)
> 提示：当前对象为巡检失败，无法基于指标进行根因分析

---

## 四、最终结论与自愈建议 (Verdict & Recommendations)
### 1. 问题汇总与关键发现
经巡检多维关联分析，当前巡检计划下共发现 **2** 个异常实例和 **1** 个失败实例，核心关键发现如下：
- 对于 **172.30.34.73:8001**：系统检测到其 CPU 使用率异常升高（达 92%）且内存使用率接近上限（达 88%），呈现明显的双高压力，同时伴随错误率的异常波动。
- 对于 **172.30.34.81:8001**：系统检测到其 activity 文件描述符数（FD Count）达到 980 并单调上升，已高度逼近单实例 resource 上限，存在显著的连接/句柄泄漏风险。
- 对于 **172.30.34.90:8001**：该实例在巡检期间连接超时（Connection Timeout），端口无法访问，提示处于服务阻断或宕机状态。

※ 总体判定：两台异常实例分别存在高负载和句柄泄漏风险，一台失败实例疑似宕机或网络阻断。均需尽快执行排查或自愈预案。

### 2. 自愈与处置修复方案
| 异常实例 | 根因诊断结论 | 建议处置措施 |
| --- | --- | --- |
| 172.30.34.73:8001 | 系统资源双高压力，疑似内存泄漏与突增负载叠加。 | 1. 建议人工介入 Dump 堆内存进行泄漏点分析；<br>2. 临时进行实例重启或扩容释放 CPU / 内存压力，保障服务可用性。 |
| 172.30.34.81:8001 | 文件描述符计数（FD Count）单调递增，发生连接句柄泄漏。 | 1. 检查底层 TCP 连接及网络套接字释放逻辑；<br>2. 在测试环境复现连接管理逻辑并定位未关闭连接句柄的代码段。 |
| 172.30.34.90:8001 | 巡检连接超时，实例可能发生宕机或网络策略拦截。 | 1. 检查目标节点服务端口监听与网络可达性；<br>2. 核验防火墙或安全组拦截规则；<br>3. 确认进程/容器存活状态，必要时执行实例重启。 |
`;
    diagHtml = `
      <h2 style="color: #38bdf8; margin-top: 30px; border-bottom: 1px solid #334155; padding-bottom: 8px;">三、根因分析 (Root Cause Analysis)</h2>
      <div class="info-card" style="background-color: rgba(30, 41, 59, 0.3); border: 1px solid #334155; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3>诊断对象: 172.30.34.73:8001 (异常)</h3>
        <h4>1. 根因候选表</h4>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
          <thead>
            <tr style="background-color: #1e293b; color: #94a3b8; font-weight: 600; text-align: left;"><th style="padding: 10px; border: 1px solid #334155;">可能原因</th><th style="padding: 10px; border: 1px solid #334155;">支撑证据</th><th style="padding: 10px; border: 1px solid #334155;">说明</th></tr>
          </thead>
          <tbody>
            <tr><td style="padding: 10px; border: 1px solid #334155;">资源压力</td><td style="padding: 10px; border: 1px solid #334155;">CPU + 内存同步上升</td><td style="padding: 10px; border: 1px solid #334155;">资源占用持续增加</td></tr>
            <tr style="background-color: #0f172a;"><td style="padding: 10px; border: 1px solid #334155;">异常负载</td><td style="padding: 10px; border: 1px solid #334155;">错误率上升</td><td style="padding: 10px; border: 1px solid #334155;">但未与流量直接关联</td></tr>
          </tbody>
        </table>
        <h4>2. 关键证据总结</h4>
        <ul>
          <li>CPU 与内存呈现高度同步上升趋势</li>
          <li>内存未观察到明显回收行为</li>
          <li>错误率存在异常波动</li>
        </ul>
      </div>

      <div class="info-card" style="background-color: rgba(30, 41, 59, 0.3); border: 1px solid #334155; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3>诊断对象: 172.30.34.81:8001 (异常)</h3>
        <h4>1. 根因候选表</h4>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
          <thead>
            <tr style="background-color: #1e293b; color: #94a3b8; font-weight: 600; text-align: left;"><th style="padding: 10px; border: 1px solid #334155;">可能原因</th><th style="padding: 10px; border: 1px solid #334155;">支撑证据</th><th style="padding: 10px; border: 1px solid #334155;">说明</th></tr>
          </thead>
          <tbody>
            <tr><td style="padding: 10px; border: 1px solid #334155;">句柄泄漏</td><td style="padding: 10px; border: 1px solid #334155;">FD文件描述符单调上升</td><td style="padding: 10px; border: 1px solid #334155;">新连接未正常释放</td></tr>
          </tbody>
        </table>
        <h4>2. 关键证据总结</h4>
        <ul>
          <li>文件描述符计数从 120 持续单调增长至 980</li>
          <li>连接池未复用，不断建立新 Socket 连接</li>
        </ul>
      </div>

      <div class="info-card" style="background-color: rgba(30, 41, 59, 0.3); border: 1px solid #ef4444/30; padding: 15px; border-radius: 8px; margin-bottom: 20px; background-color: rgba(239, 68, 68, 0.05);">
        <h3>诊断对象: 172.30.34.90:8001 (失败)</h3>
        <p style="color: #f87171; font-weight: bold;">⚠️ 当前对象为巡检失败，无法基于指标进行根因分析</p>
      </div>

      <h2 style="color: #38bdf8; margin-top: 30px; border-bottom: 1px solid #334155; padding-bottom: 8px;">四、最终结论与自愈建议 (Verdict & Recommendations)</h2>
      <div class="info-card" style="background-color: rgba(30, 41, 59, 0.3); border: 1px solid #334155; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #e2e8f0; margin-top: 15px;">1. 问题汇总与关键发现</h3>
        <p>经巡检多维关联分析，当前巡检计划下共发现 <strong>2</strong> 个异常实例和 <strong>1</strong> 个失败实例，核心关键发现如下：</p>
        <ul>
          <li>对于 <strong>172.30.34.73:8001</strong>：系统检测到其 CPU 使用率异常升高（达 92%）且内存使用率接近上限（达 88%），呈现明显的双高压力，同时伴随错误率的异常波动。</li>
          <li>对于 <strong>172.30.34.81:8001</strong>：系统检测到其 activity 文件描述符数（FD Count）达到 980 并单调上升，已高度逼近单实例 resource 上限，存在显著 of 连接/句柄泄漏风险。</li>
          <li>对于 <strong>172.30.34.90:8001</strong>：该实例在巡检期间连接超时（Connection Timeout），端口无法访问，提示处于服务阻断或宕机状态。</li>
        </ul>
        <p style="color: #fbbf24; font-size: 11px; margin-top: 10px;">※ 总体判定：两台异常实例分别存在高负载和句柄泄漏风险，一台失败实例疑似宕机或网络阻断。均需尽快执行排查或自愈预案。</p>
      </div>

      <div class="info-card" style="background-color: rgba(30, 41, 59, 0.3); border: 1px solid #334155; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #e2e8f0; margin-top: 15px;">2. 自愈与处置修复方案</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
          <thead>
            <tr style="background-color: #1e293b; color: #94a3b8; font-weight: 600; text-align: left;"><th style="padding: 10px; border: 1px solid #334155;">异常实例</th><th style="padding: 10px; border: 1px solid #334155;">根因诊断结论</th><th style="padding: 10px; border: 1px solid #334155;">建议处置措施</th></tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 10px; border: 1px solid #334155; font-family: monospace; font-weight: bold;">172.30.34.73:8001</td>
              <td style="padding: 10px; border: 1px solid #334155;">系统资源双高压力，疑似内存泄漏与突增负载叠加。</td>
              <td style="padding: 10px; border: 1px solid #334155;">1. 建议人工介入 Dump 堆内存进行泄漏点分析；<br>2. 临时进行实例重启或扩容释放 CPU / 内存压力，保障服务可用性。</td>
            </tr>
            <tr style="background-color: #0f172a;">
              <td style="padding: 10px; border: 1px solid #334155; font-family: monospace; font-weight: bold;">172.30.34.81:8001</td>
              <td style="padding: 10px; border: 1px solid #334155;">文件描述符计数（FD Count）单调递增，发生连接句柄泄漏。</td>
              <td style="padding: 10px; border: 1px solid #334155;">1. 检查底层 TCP 连接及网络套接字释放逻辑；<br>2. 在测试环境复现连接管理逻辑并定位未关闭连接句柄的代码段。</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #334155; font-family: monospace; font-weight: bold;">172.30.34.90:8001</td>
              <td style="padding: 10px; border: 1px solid #334155;">巡检连接超时，实例可能发生宕机或网络策略拦截。</td>
              <td style="padding: 10px; border: 1px solid #334155;">1. 检查目标节点服务端口监听与网络可达性；<br>2. 核验防火墙或安全组拦截规则；<br>3. 确认进程/容器存活状态，必要时执行实例重启。</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  } else {
    diagMarkdown = `
## 三、根因分析 (Root Cause Analysis)
当前分支为全量巡检失败分支。由于所有 **23** 个实例在数据采集阶段全部响应超时（Connection Timeout），系统无法获取到性能指标，**无法基于指标进行针对性根因分析**。

## 四、最终结论与自愈建议 (Verdict & Recommendations)
### 1. 问题汇总与关键发现
经巡检多维关联分析，当前巡检计划下 **23** 个实例全部响应超时，表现为网络连通性阻断。
- 端口监听失败，网络无法建连。
- 判定为系统性网络割接阻断、DNS 配置故障、或安全组策略批量拦截。

### 2. 自愈与处置修复方案
建议运维人员排查以下集群底层底座状态：
1. **网络与安全策略**：核验交换机、路由器路由策略及防火墙安全组规则，确认是否存在全局断连规则。
2. **DNS 与注册中心**：核验内部服务域名解析是否正确，是否因配置中心同步失败导致 IP 整体漂移。
3. **Pod/容器宿主机**：确认对应集群宿主机物理状态是否存活，节点是否发生僵死或磁盘写满保护。
`;
    diagHtml = `
      <h2 style="color: #38bdf8; margin-top: 30px; border-bottom: 1px solid #334155; padding-bottom: 8px;">三、根因分析 (Root Cause Analysis)</h2>
      <div class="info-card" style="background-color: rgba(30, 41, 59, 0.3); border: 1px solid #ef4444/30; padding: 15px; border-radius: 8px; margin-bottom: 20px; background-color: rgba(239, 68, 68, 0.05);">
        <p style="color: #f87171; font-weight: bold;">⚠️ 当前分支为全量巡检失败分支。由于所有 23 个实例全部响应超时，系统无法获取性能指标，无法进行指标根因分析。</p>
      </div>

      <h2 style="color: #38bdf8; margin-top: 30px; border-bottom: 1px solid #334155; padding-bottom: 8px;">四、最终结论与自愈建议 (Verdict & Recommendations)</h2>
      <div class="info-card" style="background-color: rgba(30, 41, 59, 0.3); border: 1px solid #334155; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #e2e8f0; margin-top: 15px;">1. 问题汇总与关键发现</h3>
        <p>经巡检多维关联分析，当前巡检计划下 <strong>23</strong> 个实例全部响应超时，表现为网络连通性阻断。</p>
        <ul>
          <li>端口监听失败，网络无法建连。</li>
          <li>判定为系统性网络割接阻断、DNS 配置故障、或安全组策略批量拦截。</li>
        </ul>
      </div>
      <div class="info-card" style="background-color: rgba(30, 41, 59, 0.3); border: 1px solid #334155; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #e2e8f0; margin-top: 15px;">2. 自愈与处置修复方案</h3>
        <p>建议运维人员排查以下集群底层底座状态：</p>
        <ol>
          <li><strong>网络与安全策略</strong>：核验交换机、路由器路由策略及防火墙安全组规则，确认是否存在全局断连规则。</li>
          <li><strong>DNS 与注册中心</strong>：核验内部服务域名解析是否正确，是否因配置中心同步失败导致 IP 整体漂移。</li>
          <li><strong>Pod/容器宿主机</strong>：确认对应集群宿主机物理状态是否存活，节点是否发生僵死或磁盘写满保护。</li>
        </ol>
      </div>
    `;
  }

  if (format === 'md') {
    const mdContent = `# SRE-Agent 自动巡检报告\n
报告名称: ${data.name}
报告 ID: ${data.id || 'INSP-CURRENT'}
巡检分支: ${branchLabel}
生成时间: ${new Date().toLocaleString()}\n
---

## 一、巡检基本状态概览 (Basic Status Overview)
${planInfoMarkdown}
${statsMarkdown}
### 3. 全量巡检对象列表
${fullObjectsTableMarkdown}\n
## 二、指标对比与趋势概览 (Metrics and Trends Overview)
${trendTableMarkdown}\n
${diagMarkdown}
`;
    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `巡检报告_${data.id || 'INSP'}_${branch}.md`;
    link.click();
    URL.revokeObjectURL(url);
  } else {
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>SRE-Agent 巡检报告 - ${data.name}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #0b0f19;
      color: #cbd5e1;
      padding: 40px;
      max-width: 1000px;
      margin: 0 auto;
      line-height: 1.6;
    }
    h1 { color: #f8fafc; border-bottom: 2px solid #1e293b; padding-bottom: 12px; }
    h2 { color: #38bdf8; margin-top: 30px; border-bottom: 1px solid #334155; padding-bottom: 8px; }
    h3 { color: #e2e8f0; margin-top: 15px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
    th { background-color: #1e293b; color: #94a3b8; font-weight: 600; text-align: left; padding: 10px; border: 1px solid #334155; }
    td { padding: 10px; border: 1px solid #334155; }
    tr:nth-child(even) { background-color: #0f172a; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
    .badge-normal { background-color: rgba(16, 185, 129, 0.1); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.2); }
    .badge-abnormal { background-color: rgba(244, 63, 94, 0.1); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.2); }
    .badge-failed { background-color: rgba(245, 158, 11, 0.1); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.2); }
    .code { font-family: monospace; background-color: #020617; padding: 12px; border-radius: 8px; border: 1px solid #1e293b; color: #34d399; white-space: pre-wrap; }
    .info-card { background-color: rgba(30, 41, 59, 0.3); border: 1px solid #334155; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <h1>SRE-Agent 自动巡检报告</h1>
  <div class="info-card">
    <p><strong>报告名称：</strong> ${data.name}</p>
    <p><strong>报告 ID：</strong> ${data.id || 'INSP-CURRENT'}</p>
    <p><strong>巡检分支：</strong> ${branchLabel}</p>
    <p><strong>生成时间：</strong> ${new Date().toLocaleString()}</p>
  </div>

  <h2>一、巡检基本状态概览 (Basic Status Overview)</h2>
  ${planInfoHtml}
  ${statsHtml}
  
  <div class="info-card">
    <h3 style="margin-top: 0; color: #f8fafc; font-size: 14px; border-bottom: 1px solid #334155; padding-bottom: 6px;">3. 全量巡检对象列表</h3>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
      <thead>
        <tr style="background-color: #1e293b; color: #94a3b8; font-weight: 600; text-align: left;"><th style="padding: 10px; border: 1px solid #334155;">序号</th><th style="padding: 10px; border: 1px solid #334155;">巡检对象</th><th style="padding: 10px; border: 1px solid #334155;">状态</th><th style="padding: 10px; border: 1px solid #334155;">严重级别</th><th style="padding: 10px; border: 1px solid #334155;">核心摘要</th></tr>
      </thead>
      <tbody>
        ${fullObjectsTableRows}
      </tbody>
    </table>
  </div>

  <h2>二、指标对比与趋势概览 (Metrics and Trends Overview)</h2>
  <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
    <thead>
      <tr style="background-color: #1e293b; color: #94a3b8; font-weight: 600; text-align: left;"><th style="padding: 10px; border: 1px solid #334155;">指标名称</th><th style="padding: 10px; border: 1px solid #334155;">绑定参数</th><th style="padding: 10px; border: 1px solid #334155;">评估状态</th><th style="padding: 10px; border: 1px solid #334155;">10:00</th><th style="padding: 10px; border: 1px solid #334155;">10:10</th><th style="padding: 10px; border: 1px solid #334155;">10:20</th><th style="padding: 10px; border: 1px solid #334155;">10:30</th><th style="padding: 10px; border: 1px solid #334155;">趋势</th></tr>
    </thead>
    <tbody>
      ${trendTableRows}
    </tbody>
  </table>

  ${diagHtml}
</body>
</html>
`;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `巡检报告_${data.id || 'INSP'}_${branch}.html`;
    link.click();
    URL.revokeObjectURL(url);
  }
};


const getFallbackNodeDetails = (nodeIp: string, branch: string) => {
  const isFailed = nodeIp === '172.30.34.90:8001' || branch === 'failed';
  return {
    detailTable: [
      ['对象', nodeIp],
      ['状态', isFailed ? 'failed' : 'completed'],
      ['结果', isFailed ? 'failed' : 'normal'],
      ['严重级别', isFailed ? 'critical' : 'info'],
      ['摘要', isFailed ? '连接超时' : 'Python: RSS=512MB CPU=32%'],
      ['问题描述', isFailed ? '该对象巡检失败，无法连接到目标服务。' : '该对象运行状态良好，各项指标均在安全阈值内。'],
      ['影响范围', isFailed ? '当前实例状态不可知，可能存在阻断风险。' : '无异常影响。']
    ],
    baseMetrics: [
      ['FD 数', 'fd_count', '15', '个'],
      ['进程 ID', 'pid', '45', '-'],
      ['进程存活状态', 'process_alive', 'true', '存活'],
      ['RSS 内存', 'rss_mb', '512', 'MB'],
      ['线程数', 'threads', '8', '个']
    ],
    evalMetrics: [
      ['CPU 使用率', '32%', '80%', '正常'],
      ['内存使用率', '45%', '80%', '正常'],
      ['错误率', '0.0%', '1%', '正常']
    ],
    anomalies: [],
    charts: [
      {
        title: 'CPU 使用率趋势 (近30分钟)',
        labels: ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25', '10:30'],
        data: [28, 30, 31, 32, 31, 33, 32]
      },
      {
        title: '内存使用率趋势 (近30分钟)',
        labels: ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25', '10:30'],
        data: [42, 43, 44, 45, 45, 45, 45]
      }
    ],
    historyTable: [
      ['CPU 使用率', '32%', '30%', '80%', '正常'],
      ['内存使用率', '45%', '44%', '80%', '正常']
    ],
    diagnosis: {
      candidates: [],
      evidences: ['各项指标整体平稳', '无异常告警触发'],
      unconfirmed: []
    },
    verdict: {
      summary: [
        ['分析对象', nodeIp],
        ['问题类型', '正常'],
        ['影响范围', '无'],
        ['状态', '稳定'],
        ['严重级别', 'info']
      ],
      findings: ['指标均处于正常安全水位'],
      judgment: '当前运行平稳，无异常风险。',
      recommendations: ['无需处理，继续保持常规监控。'],
      boundary: []
    }
  };
};


const AllMetricsModal = ({ isOpen, onClose, title, data }: any) => {
  const [search, setSearch] = useState('');
  const [filterTrend, setFilterTrend] = useState('全部');

  if (!isOpen) return null;

  const filtered = data.filter((row: any) => {
    const ip = row[0] || '';
    const trend = row[8] || '';
    
    const matchesSearch = ip.toLowerCase().includes(search.toLowerCase());
    const matchesTrend = filterTrend === '全部' || trend === filterTrend;
    
    return matchesSearch && matchesTrend;
  });

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-[#0b0b10] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden text-left font-sans">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#101016]">
          <h3 className="text-sm font-bold text-slate-200">{title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-4 bg-slate-900/20 border-b border-slate-800 flex gap-4 items-center">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="输入 IP 搜索..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <select 
              value={filterTrend} 
              onChange={(e) => setFilterTrend(e.target.value)}
              className="bg-black/40 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none bg-[#0a0a0f]"
            >
              <option value="全部">全部趋势</option>
              <option value="平稳">平稳</option>
              <option value="稳步上升">稳步上升</option>
              <option value="突增">突增</option>
            </select>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">巡检对象</th>
                <th className="px-3 py-2">10:00</th>
                <th className="px-3 py-2">10:10</th>
                <th className="px-3 py-2">10:20</th>
                <th className="px-3 py-2">10:30</th>
                <th className="px-3 py-2">趋势</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row: any, i: number) => {
                // If the row data passed in is already mapped to 6 elements, use them directly.
                // Otherwise, map them on the fly.
                const mappedRow = row.length === 6 ? row : [row[0], row[1], row[3], row[5], row[7], row[8]];
                return (
                  <tr 
                    key={i} 
                    className="border-b border-slate-800/30 last:border-0 hover:bg-blue-600/5 transition-colors"
                  >
                    <td className="px-3 py-2 text-slate-500">{i + 1}</td>
                    <td className="px-3 py-2 font-mono text-slate-200">{mappedRow[0]}</td>
                    <td className="px-3 py-2 text-slate-300">{mappedRow[1]}%</td>
                    <td className="px-3 py-2 text-slate-300">{mappedRow[2]}%</td>
                    <td className="px-3 py-2 text-slate-300">{mappedRow[3]}%</td>
                    <td className="px-3 py-2 text-slate-300">{mappedRow[4]}%</td>
                    <td className="px-3 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                        mappedRow[5] === '平稳' ? 'bg-emerald-500/10 text-emerald-400' :
                        mappedRow[5] === '稳步上升' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-rose-500/10 text-rose-400'
                      }`}>
                        {mappedRow[5]}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">未找到匹配的指标数据</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


const MultiLineTrendChart = ({ title, labels, lines, events }: {
  title: string,
  labels: string[],
  lines: { name: string, data: number[], color: string }[],
  events?: { time: string, label: string }[]
}) => {
  const allData = lines.flatMap(l => l.data);
  const max = Math.max(...allData, 100);
  const min = 0;

  return (
    <div className="bg-[#0f0f15] border border-slate-800 rounded-xl p-4 my-3 text-left font-sans">
      <div className="border-b border-slate-800/40 pb-2 mb-3">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Activity size={12} className="text-blue-500" /> {title}
          </h4>
          <span className="text-[9px] font-mono text-slate-500 bg-slate-900/60 border border-slate-800/50 rounded px-1.5 py-0.5 shrink-0">
            10:00 - 10:30
          </span>
        </div>
      </div>
      <div className="relative h-24 w-full">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
          <line x1="0" y1="80" x2="100" y2="80" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />

          {lines.map((l, lineIdx) => {
            const points = l.data.map((val, i) => {
              const x = (i / (l.data.length - 1)) * 100;
              const y = 100 - ((val - min) / (max - min)) * 100;
              return `${x},${y}`;
            }).join(' ');

            return (
              <polyline
                key={lineIdx}
                points={points}
                fill="none"
                stroke={l.color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}
        </svg>
      </div>
      <div className="flex justify-between text-[8px] text-slate-600 font-mono mt-1.5">
        <span>{labels[0]}</span>
        <span>{labels[Math.floor(labels.length / 2)]}</span>
        <span>{labels[labels.length - 1]}</span>
      </div>
      <div className="flex flex-wrap gap-x-2.5 gap-y-1.5 items-center justify-center mt-3 pt-2 border-t border-slate-800/40">
        {lines.map((l, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 bg-slate-900/40 px-2 py-0.5 rounded-md border border-slate-800/50 shadow-inner">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: l.color }} />
            <span className="font-mono">{l.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};




const ExpertDiagnosticCard = ({ data, onAction }: any) => {
  const currentStep = data.currentStep || 0;
  const isPhased = data.format === '0412_phased';
  const branch = data.branch || 'abnormal';

  const [selectedNodeIp, setSelectedNodeIp] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalObjects, setModalObjects] = useState<any[]>([]);
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  const [modalMetrics, setModalMetrics] = useState<any[]>([]);
  
  // Trend chart metric selection
  const [selectedMetric, setSelectedMetric] = useState('CPU');

  const defaultSelectedIp = branch === 'abnormal' ? '172.30.34.73:8001' : branch === 'failed' ? '172.30.34.90:8001' : '';
  const activeIp = selectedNodeIp || defaultSelectedIp;
  const activeDetails = data.nodeDetails?.[activeIp] || getFallbackNodeDetails(activeIp, branch);

  const openObjectsModal = (title: string, list: any[]) => {
    setModalTitle(title);
    setModalObjects(list);
    setIsModalOpen(true);
  };

  if (isPhased) {
    return (
      <div className="bg-[var(--bg-surface)] border border-slate-800/80 rounded-xl overflow-hidden shadow-2xl max-w-4xl font-sans text-left">
        <div className="p-4 border-b border-slate-800/50 bg-[var(--bg-panel-alt)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Brain size={18} />
            </div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-tighter">AI巡检分析</h3>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Phase 1: 开始分析 */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className={`w-6 h-6 rounded-full ${currentStep >= 1 ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-slate-800 text-slate-500'} flex items-center justify-center text-[10px] font-bold transition-all`}>1</div>
              <div className={`w-px flex-1 ${currentStep > 1 ? 'bg-blue-600' : 'bg-slate-800/50'}`} />
            </div>
            <div className="flex-1 min-w-0 pb-4">
              <div className="text-[13px] font-bold text-slate-300 uppercase tracking-wider mb-3">01 / 开始分析</div>
              {currentStep >= 1 && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  {/* normal 分支 */}
                  {branch === 'normal' && (
                    <div className="space-y-4">
                      {/* 1. 巡检计划信息 */}
                      <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4">
                        <div className="flex items-center gap-2.5 mb-3">
                          <div className="w-1 h-3.5 bg-emerald-500 rounded-full" />
                          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">1. 巡检计划信息</span>
                        </div>
                        <div className="overflow-x-auto border border-slate-800/60 rounded-xl bg-slate-950/10 overflow-hidden">
                          <table className="w-full text-left border-collapse text-xs">
                            <tbody>
                              <tr className="border-b border-slate-800/30">
                                <td className="px-3.5 py-2 font-medium text-slate-400">巡检计划名称</td>
                                <td className="px-3.5 py-2 font-medium text-slate-200">{data.name}</td>
                              </tr>
                              <tr className="border-b border-slate-800/30">
                                <td className="px-3.5 py-2 font-medium text-slate-400">执行结果</td>
                                <td className="px-3.5 py-2 font-medium">
                                  <span className="inline-flex items-center justify-center h-5 px-1.5 rounded-sm text-[10px] font-black border uppercase bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                    正常 (normal)
                                  </span>
                                </td>
                              </tr>
                              <tr className="border-b border-slate-800/30">
                                <td className="px-3.5 py-2 font-medium text-slate-400">执行时间</td>
                                <td className="px-3.5 py-2 font-medium text-slate-200">{data.updatedAt}</td>
                              </tr>
                              <tr>
                                <td className="px-3.5 py-2 font-medium text-slate-400">严重级别</td>
                                <td className="px-3.5 py-2 font-medium">
                                  <span className="inline-flex items-center justify-center h-5 px-1.5 rounded-sm text-[10px] font-black border uppercase bg-slate-800 text-slate-400">
                                    普通 (info)
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* 2. 巡检对象统计 */}
                      {data.stage1?.objectStats && (
                        <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4">
                          <div className="flex items-center gap-2.5 mb-3">
                            <div className="w-1 h-3.5 bg-emerald-500 rounded-full" />
                            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">2. 巡检对象统计</span>
                          </div>
                          <div className="overflow-x-auto border border-slate-800/60 rounded-xl bg-slate-950/10 overflow-hidden">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="border-b border-slate-800/80 bg-slate-900/30 text-slate-400">
                                  <th className="px-3.5 py-2 font-bold uppercase tracking-wider">统计项</th>
                                  <th className="px-3.5 py-2 font-bold uppercase tracking-wider text-right">数量</th>
                                </tr>
                              </thead>
                              <tbody>
                                {data.stage1.objectStats.map((row: any[], idx: number) => (
                                  <tr key={idx} className="border-b border-slate-800/30 last:border-0 hover:bg-white/[0.01]">
                                    <td className="px-3.5 py-2 font-medium text-slate-400">{row[0]}</td>
                                    <td className="px-3.5 py-2 font-mono text-slate-200 text-right">{row[1]}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* 3. 全部巡检对象列表 */}
                      {data.stage1?.objectsTable && (
                        <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-3.5 bg-emerald-500 rounded-full" />
<span className="text-xs font-bold text-slate-200 uppercase tracking-wider">3. 全部巡检对象列表</span>
                          </div>
                          <AnalysisTable 
                            title="" 
                            columns={['#', '巡检对象', '结果', '严重级别', '摘要']} 
                            data={data.stage1.objectsTable.slice(0, 5)} 
                          />
                          <div className="flex justify-center mt-2.5">
                            <button 
                              onClick={() => openObjectsModal('全部巡检对象', data.stage1.objectsTable)}
                              className="px-4 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 rounded-lg transition-all active:scale-95 flex items-center gap-1 shadow-md shadow-black/10"
                            >
                              查看全部巡检对象 ↓
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 整体健康摘要 */}
                      {data.stage1?.healthSummary && (
                        <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-4">
                          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">整体健康摘要</div>
                          <p className="text-xs text-slate-300 leading-relaxed font-medium">{data.stage1.healthSummary}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* abnormal 分支 */}
                  {branch === 'abnormal' && (
                    <div className="space-y-4">
                      {/* 1. 巡检计划信息 */}
                      <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4">
                        <div className="flex items-center gap-2.5 mb-3">
                          <div className="w-1 h-3.5 bg-blue-500 rounded-full" />
                          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">1. 巡检计划信息</span>
                        </div>
                        <div className="overflow-x-auto border border-slate-800/60 rounded-xl bg-slate-950/10 overflow-hidden">
                          <table className="w-full text-left border-collapse text-xs">
                            <tbody>
                              <tr className="border-b border-slate-800/30">
                                <td className="px-3.5 py-2 font-medium text-slate-400">巡检计划名称</td>
                                <td className="px-3.5 py-2 font-medium text-slate-200">{data.name}</td>
                              </tr>
                              <tr className="border-b border-slate-800/30">
                                <td className="px-3.5 py-2 font-medium text-slate-400">执行结果</td>
                                <td className="px-3.5 py-2 font-medium">
                                  <span className="inline-flex items-center justify-center h-5 px-1.5 rounded-sm text-[10px] font-black border uppercase bg-amber-500/10 text-amber-400 border-amber-500/20">
                                    异常 (abnormal)
                                  </span>
                                </td>
                              </tr>
                              <tr className="border-b border-slate-800/30">
                                <td className="px-3.5 py-2 font-medium text-slate-400">执行时间</td>
                                <td className="px-3.5 py-2 font-medium text-slate-200">{data.updatedAt}</td>
                              </tr>
                              <tr>
                                <td className="px-3.5 py-2 font-medium text-slate-400">严重级别</td>
                                <td className="px-3.5 py-2 font-medium">
                                  <span className="inline-flex items-center justify-center h-5 px-1.5 rounded-sm text-[10px] font-black border uppercase bg-rose-500/10 text-rose-500 border-rose-500/20">
                                    严重 (critical)
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* 2. 巡检对象统计 */}
                      {data.stage1?.objectStats && (
                        <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4">
                          <div className="flex items-center gap-2.5 mb-3">
                            <div className="w-1 h-3.5 bg-blue-500 rounded-full" />
                            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">2. 巡检对象统计</span>
                          </div>
                          <div className="overflow-x-auto border border-slate-800/60 rounded-xl bg-slate-950/10 overflow-hidden">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="border-b border-slate-800/80 bg-slate-900/30 text-slate-400">
                                  <th className="px-3.5 py-2 font-bold uppercase tracking-wider">统计项</th>
                                  <th className="px-3.5 py-2 font-bold uppercase tracking-wider text-right">数量</th>
                                </tr>
                              </thead>
                              <tbody>
                                {data.stage1.objectStats.map((row: any[], idx: number) => (
                                  <tr key={idx} className="border-b border-slate-800/30 last:border-0 hover:bg-white/[0.01]">
                                    <td className="px-3.5 py-2 font-medium text-slate-400">{row[0]}</td>
                                    <td className="px-3.5 py-2 font-mono text-slate-200 text-right">{row[1]}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* 3. 全部巡检对象列表 */}
                      {data.stage1?.objectsTable && (
                        <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4 space-y-2">
                          <div className="flex items-center gap-2.5 mb-3">
                            <div className="w-1 h-3.5 bg-blue-500 rounded-full" />
                            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">3. 全部巡检对象列表</span>
                          </div>
                          <AnalysisTable 
                            title="" 
                            columns={['#', '巡检对象', '结果', '严重级别', '摘要']} 
                            data={data.stage1.objectsTable.slice(0, 5)} 
                          />
                          <div className="flex justify-center mt-2.5">
                            <button 
                              onClick={() => openObjectsModal('全部巡检对象', data.stage1.objectsTable)}
                              className="px-4 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 rounded-lg transition-all active:scale-95 flex items-center gap-1 shadow-md shadow-black/10"
                            >
                              查看全部巡检对象 ↓
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 4. 巡检对象分析 */}
                      <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4 space-y-6">
                        <div className="flex items-center gap-2 border-b border-slate-800/40 pb-2 mb-1">
                          <div className="w-1 h-3.5 bg-blue-500 rounded-full" />
<span className="text-xs font-bold text-slate-200 uppercase tracking-wider">4. 巡检对象分析</span>
                        </div>

                        {/* （1）重点分析对象列表 */}
                        {data.priorityObjects && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 pl-3.5 my-3">
                              <div className="w-1.5 h-1.5 rounded-full border border-slate-700 bg-slate-900" />
                              <span className="text-[11px] font-bold text-slate-400">（1）异常对象列表</span>
                            </div>
                            <div className="overflow-x-auto border border-slate-800/60 rounded-xl bg-slate-950/10 overflow-hidden">
                              <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                  <tr className="border-b border-slate-800/80 bg-slate-900/30 text-slate-400 font-bold uppercase tracking-wider">
                                    <th className="px-3.5 py-2">#</th>
                                    <th className="px-3.5 py-2">对象</th>
                                    <th className="px-3.5 py-2">类型</th>
                                    <th className="px-3.5 py-2">严重级别</th>
                                    <th className="px-3.5 py-2">重点原因</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {data.priorityObjects.slice(0, 5).map((row: any, idx: number) => {
                                    const isSelected = activeIp === row.ip;
                                    return (
                                      <tr 
                                        key={idx} 
                                        onClick={() => setSelectedNodeIp(row.ip)}
                                        className={`border-b border-slate-800/30 last:border-0 hover:bg-white/[0.02] cursor-pointer transition-colors ${isSelected ? 'bg-blue-600/10 font-bold' : ''}`}
                                      >
                                        <td className="px-3.5 py-2 text-slate-500">{idx + 1}</td>
                                        <td className="px-3.5 py-2 font-mono text-slate-200">{row.ip}</td>
                                        <td className="px-3.5 py-2">
                                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                                            row.type === 'normal' || row.reason === 'normal' ? 'bg-emerald-500/10 text-emerald-400' :
                                            row.type === 'failed' || row.reason === '连接超时' || row.reason === 'Agent 离线' ? 'bg-rose-500/10 text-rose-400' :
                                            'bg-amber-500/10 text-amber-400'
                                          }`}>
                                            {row.type === 'normal' ? '正常' : row.type === 'abnormal' ? '异常' : row.type === 'failed' ? '失败' : (row.type || row.reason)}
                                          </span>
                                        </td>
                                        <td className="px-3.5 py-2">
                                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                                            row.severity === 'info' ? 'bg-slate-800 text-slate-400' :
                                            row.severity === 'warning' ? 'bg-amber-500/10 text-amber-550' :
                                            'bg-rose-500/10 text-rose-500'
                                          }`}>
                                            {row.severity === 'info' ? '普通' : row.severity === 'warning' ? '警告' : row.severity === 'critical' ? '严重' : row.severity}
                                          </span>
                                        </td>
                                        <td className="px-3.5 py-2 text-slate-300 font-bold">{row.reason || row.impact}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                            {data.priorityObjects.length > 5 && (
                              <button 
                                onClick={() => {
                                  const modalObjs = data.priorityObjects.map((o: any, i: number) => [
                                    (i + 1).toString(),
                                    o.ip,
                                    o.type || 'failed',
                                    o.severity,
                                    o.reason || o.impact
                                  ]);
                                  openObjectsModal('全部重点分析对象', modalObjs);
                                }}
                                className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                查看全部重点对象 &rarr;
                              </button>
                            )}
                          </div>
                        )}

                        {/* （2）当前对象详情 */}
                        <div className="space-y-3 pt-4 border-t border-slate-800/40">
                          <div className="flex items-center gap-2 pl-3.5 my-3">
                            <div className="w-1.5 h-1.5 rounded-full border border-slate-700 bg-slate-900" />
                            <span className="text-[11px] font-bold text-slate-400">（2）异常对象详情</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 py-1">
                            {data.priorityObjects.map((obj: any) => {
                              const isSelected = activeIp === obj.ip;
                              const isFailed = obj.type === 'failed' || obj.reason === '连接超时' || obj.reason === 'Agent 离线';
                              return (
                                <button
                                  key={obj.ip}
                                  onClick={() => setSelectedNodeIp(obj.ip)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                    isSelected 
                                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                                      : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 border border-slate-800/80'
                                  }`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${isFailed ? 'bg-rose-500' : 'bg-amber-500'}`} />
                                  <span className="font-mono">{obj.ip}</span>
                                  <span className="opacity-70">
                                    ({isFailed ? '失败' : '异常'})
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Subordinate details card panel representing active tab state */}
                          <div className="bg-slate-950/40 border border-slate-800/50 rounded-xl p-4 mt-2.5 space-y-5">
                            {/* 运行时基础指标 */}
                            {activeDetails.baseMetrics && (
                              <div className="space-y-2.5">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                  <div className="w-1 h-1 rounded-full bg-blue-500/60" />
                                  运行时基础指标
                                </div>
                                <AnalysisTable title="" columns={['指标名称', '字段 Key', '当前值', '单位 / 状态说明']} data={activeDetails.baseMetrics} />
                              </div>
                            )}

                            {/* 异常判断指标 */}
                            {activeDetails.evalMetrics && (
                              <div className="space-y-2.5 pt-4 border-t border-slate-800/30">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                  <div className="w-1 h-1 rounded-full bg-blue-500/60" />
                                  异常判断指标
                                </div>
                                <AnalysisTable title="" columns={['指标', '当前值', '阈值', '状态']} data={activeDetails.evalMetrics} />
                              </div>
                            )}

                            {/* 运行时未采集指标 */}
                            {activeDetails.uncollectedMetrics && (
                              <div className="space-y-2.5 pt-4 border-t border-slate-800/30">
                                <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                                  <div className="w-1 h-1 rounded-full bg-rose-500/60" />
                                  运行时未采集指标
                                </div>
                                <AnalysisTable title="" columns={['检查项', '是否采集', '说明']} data={activeDetails.uncollectedMetrics} />
                              </div>
                            )}

                            {/* 异常判断摘要 */}
                            {activeDetails.anomalies && activeDetails.anomalies.length > 0 && (
                              <div className="space-y-2 pt-4 border-t border-slate-800/30">
                                <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                                  <div className="w-1 h-1 rounded-full bg-rose-500/60" />
                                  异常判断摘要
                                </div>
                                <ul className="space-y-1.5 bg-rose-500/[0.01] border border-rose-500/10 rounded-xl p-3.5">
                                  {activeDetails.anomalies.map((item: string, idx: number) => (
                                    <li key={idx} className="text-xs text-rose-300 font-medium flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* failed 分支 */}
                  {branch === 'failed' && (
                    <div className="space-y-4">
                      {/* 1. 巡检计划信息 */}
                      <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4">
                        <div className="flex items-center gap-2.5 mb-3">
                          <div className="w-1 h-3.5 bg-rose-500 rounded-full" />
                          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">1. 巡检计划信息</span>
                        </div>
                        <div className="overflow-x-auto border border-slate-800/60 rounded-xl bg-slate-950/10 overflow-hidden">
                          <table className="w-full text-left border-collapse text-xs">
                            <tbody>
                              <tr className="border-b border-slate-800/30">
                                <td className="px-3.5 py-2 font-medium text-slate-400">巡检计划名称</td>
                                <td className="px-3.5 py-2 font-medium text-slate-200">{data.name}</td>
                              </tr>
                              <tr className="border-b border-slate-800/30">
                                <td className="px-3.5 py-2 font-medium text-slate-400">执行结果</td>
                                <td className="px-3.5 py-2 font-medium">
                                  <span className="inline-flex items-center justify-center h-5 px-1.5 rounded-sm text-[10px] font-black border uppercase bg-rose-500/10 text-rose-400 border-rose-500/20">
                                    失败 (failed)
                                  </span>
                                </td>
                              </tr>
                              <tr className="border-b border-slate-800/30">
                                <td className="px-3.5 py-2 font-medium text-slate-400">执行时间</td>
                                <td className="px-3.5 py-2 font-medium text-slate-200">{data.updatedAt}</td>
                              </tr>
                              <tr>
                                <td className="px-3.5 py-2 font-medium text-slate-400">严重级别</td>
                                <td className="px-3.5 py-2 font-medium">
                                  <span className="inline-flex items-center justify-center h-5 px-1.5 rounded-sm text-[10px] font-black border uppercase bg-rose-500/10 text-rose-500 border-rose-500/20">
                                    严重 (critical)
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* 2. 巡检对象统计 */}
                      {data.stage1?.objectStats && (
                        <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4">
                          <div className="flex items-center gap-2.5 mb-3">
                            <div className="w-1 h-3.5 bg-rose-500 rounded-full" />
                            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">2. 巡检对象统计</span>
                          </div>
                          <div className="overflow-x-auto border border-slate-800/60 rounded-xl bg-slate-950/10 overflow-hidden">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="border-b border-slate-800/80 bg-slate-900/30 text-slate-400">
                                  <th className="px-3.5 py-2 font-bold uppercase tracking-wider">统计项</th>
                                  <th className="px-3.5 py-2 font-bold uppercase tracking-wider text-right">数量</th>
                                </tr>
                              </thead>
                              <tbody>
                                {data.stage1.objectStats.map((row: any[], idx: number) => (
                                  <tr key={idx} className="border-b border-slate-800/30 last:border-0 hover:bg-white/[0.01]">
                                    <td className="px-3.5 py-2 font-medium text-slate-400">{row[0]}</td>
                                    <td className="px-3.5 py-2 font-mono text-slate-200 text-right">{row[1]}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* 3. 全部巡检对象列表 */}
                      {data.stage1?.objectsTable && (
                        <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4 space-y-2">
                          <div className="flex items-center gap-2.5 mb-3">
                            <div className="w-1 h-3.5 bg-rose-500 rounded-full" />
                            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">3. 全部巡检对象列表</span>
                          </div>
                          <AnalysisTable 
                            title="" 
                            columns={['#', '巡检对象', '结果', '严重级别', '摘要']} 
                            data={data.stage1.objectsTable.slice(0, 5)} 
                          />
                          <div className="flex justify-center mt-2.5">
                            <button 
                              onClick={() => openObjectsModal('全部巡检对象', data.stage1.objectsTable)}
                              className="px-4 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 rounded-lg transition-all active:scale-95 flex items-center gap-1 shadow-md shadow-black/10"
                            >
                              查看全部巡检对象 ↓
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 4. 重点失败对象 */}
                      <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4 space-y-6">
                        <div className="flex items-center gap-2 border-b border-slate-800/40 pb-2 mb-1">
                          <div className="w-1 h-3.5 bg-rose-500 rounded-full" />
<span className="text-xs font-bold text-slate-200 uppercase tracking-wider">4. 重点失败对象</span>
                        </div>

                        {/* （1）重点失败对象列表 */}
                        {data.priorityObjects && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 pl-3.5 my-3">
                              <div className="w-1.5 h-1.5 rounded-full border border-slate-700 bg-slate-900" />
                              <span className="text-[11px] font-bold text-slate-400">（1）重点失败对象列表</span>
                            </div>
                            <div className="overflow-x-auto border border-slate-800/60 rounded-xl bg-slate-950/10 overflow-hidden">
                              <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                  <tr className="border-b border-slate-800/80 bg-slate-900/30 text-slate-400 font-bold uppercase tracking-wider">
                                    <th className="px-3.5 py-2">#</th>
                                    <th className="px-3.5 py-2">对象</th>
                                    <th className="px-3.5 py-2">失败原因</th>
                                    <th className="px-3.5 py-2">严重级别</th>
                                    <th className="px-3.5 py-2">影响</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {data.priorityObjects.slice(0, 5).map((row: any, idx: number) => {
                                    const isSelected = activeIp === row.ip;
                                    return (
                                      <tr 
                                        key={idx} 
                                        onClick={() => setSelectedNodeIp(row.ip)}
                                        className={`border-b border-slate-800/30 last:border-0 hover:bg-white/[0.02] cursor-pointer transition-colors ${isSelected ? 'bg-blue-600/10 font-bold' : ''}`}
                                      >
                                        <td className="px-3.5 py-2 text-slate-500">{idx + 1}</td>
                                        <td className="px-3.5 py-2 font-mono text-slate-200">{row.ip}</td>
                                        <td className="px-3.5 py-2">
                                          <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-rose-500/10 text-rose-400">
                                            {row.reason}
                                          </span>
                                        </td>
                                        <td className="px-3.5 py-2">
                                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                                            row.severity === 'info' ? 'bg-slate-800 text-slate-400' :
                                            row.severity === 'warning' ? 'bg-amber-500/10 text-amber-550' :
                                            'bg-rose-500/10 text-rose-500'
                                          }`}>
                                            {row.severity === 'info' ? '普通' : row.severity === 'warning' ? '警告' : row.severity === 'critical' ? '严重' : row.severity}
                                          </span>
                                        </td>
                                        <td className="px-3.5 py-2 text-slate-300 font-bold">{row.impact}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* （2）当前对象详情 */}
                        <div className="space-y-3 pt-4 border-t border-slate-800/40">
                          <div className="flex items-center gap-2 pl-3.5 my-3">
                            <div className="w-1.5 h-1.5 rounded-full border border-slate-700 bg-slate-900" />
                            <span className="text-[11px] font-bold text-slate-400">（2）当前对象详情</span>
                          </div>
                          <div className="flex flex-wrap gap-2 my-2.5">
                            {data.priorityObjects.map((obj: any) => {
                              const isSelected = activeIp === obj.ip;
                              const isFailed = obj.type === 'failed' || obj.reason === '连接超时' || obj.reason === 'Agent 离线';
                              return (
                                <button
                                  key={obj.ip}
                                  onClick={() => setSelectedNodeIp(obj.ip)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                    isSelected 
                                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                                      : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 border border-slate-800/80'
                                  }`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${isFailed ? 'bg-rose-500' : 'bg-amber-500'}`} />
                                  <span className="font-mono">{obj.ip}</span>
                                  <span className="opacity-70">
                                    ({isFailed ? '失败' : '异常'})
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {activeDetails.uncollectedMetrics && (
                            <div className="pt-3 border-t border-slate-800/40">
                              <AnalysisTable title="未采集指标说明" columns={['检查项', '是否采集', '说明']} data={activeDetails.uncollectedMetrics} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
              {currentStep === 1 && (
                <div className="flex items-center gap-2 text-xs text-slate-500 uppercase font-black animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600" /> 分析指标发展路径中...
                </div>
              )}
            </div>
          </div>

          {/* Phase 2: 分析指标发展路径 / 路径与证据探索 / 失败证据说明 */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className={`w-6 h-6 rounded-full ${currentStep >= 2 ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'bg-slate-800 text-slate-500'} flex items-center justify-center text-[10px] font-bold transition-all`}>2</div>
              <div className={`w-px flex-1 ${currentStep > 2 ? 'bg-purple-600' : 'bg-slate-800/50'}`} />
            </div>
            <div className="flex-1 min-w-0 pb-4">
              <div className="text-[13px] font-bold text-slate-300 uppercase tracking-wider mb-3">
                {branch === 'normal' ? '02 / 分析指标发展路径' : branch === 'abnormal' ? '02 / 路径与证据探索' : '02 / 失败证据说明'}
              </div>
              {currentStep >= 2 && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  {/* normal 分支 */}
                  {branch === 'normal' && (
                    <div className="space-y-4">
                      {data.stage2?.trendTable && (
                        <AnalysisTable 
                          title="CPU 使用率趋势概览（近 30 分钟）" 
                          columns={['巡检对象', '10:00', '10:10', '10:20', '10:30', '趋势']} 
                          data={data.stage2.trendTable.slice(0, 5).map((row: any) => [row[0], row[1], row[3], row[5], row[7], row[8]])} 
                        />
                      )}
                      <div className="flex justify-center mt-2.5">
                        <button 
                          onClick={() => openObjectsModal('全部趋势数据', data.stage2.trendTable.map((row: any) => [row[0], row[1], row[3], row[5], row[7], row[8]]))}
                          className="px-4 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 rounded-lg transition-all active:scale-95 flex items-center gap-1 shadow-md shadow-black/10"
                        >
                          查看全部趋势数据 ↓
                        </button>
                      </div>
                      {data.stage2?.trendSummary && (
                        <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 mt-2">
                          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">健康趋势摘要</div>
                          <p className="text-xs text-slate-300 leading-relaxed font-medium">{data.stage2.trendSummary}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* abnormal 分支 */}
                  {branch === 'abnormal' && (() => {
                    const abnormalIps = ['172.30.34.73:8001', '172.30.34.81:8001'];
                    const labels = ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25', '10:30'];
                    
                    const cpuLines = abnormalIps.map((ip, idx) => {
                      const details = data.nodeDetails?.[ip] || getFallbackNodeDetails(ip, 'abnormal');
                      const chart = details?.charts?.find((c: any) => c.title.includes('CPU'));
                      return {
                        name: ip,
                        data: chart ? chart.data : [0,0,0,0,0,0,0],
                        color: idx === 0 ? '#f43f5e' : '#3b82f6'
                      };
                    });
                    
                    const memoryLines = abnormalIps.map((ip, idx) => {
                      const details = data.nodeDetails?.[ip] || getFallbackNodeDetails(ip, 'abnormal');
                      const chart = details?.charts?.find((c: any) => c.title.includes('内存') || c.title.includes('Memory'));
                      return {
                        name: ip,
                        data: chart ? chart.data : [0,0,0,0,0,0,0],
                        color: idx === 0 ? '#f43f5e' : '#3b82f6'
                      };
                    });

                    const errorLines = [
                      { name: '172.30.34.73:8001', data: [0.5, 0.8, 1.0, 1.5, 2.2, 2.8, 3.2], color: '#f43f5e' },
                      { name: '172.30.34.81:8001', data: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], color: '#3b82f6' }
                    ];

                    const isFailedNode = activeDetails.detailTable.find((r: any) => r[0] === '结果')?.[1] === 'failed';

                    return (
                      <div className="space-y-6">
                        {/* 1. 指标趋势概览表 */}
                        {data.stage2?.trendTable && (
                          <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4">
                            <div className="flex items-center gap-2.5 mb-3">
                              <div className="w-1 h-3.5 bg-purple-500 rounded-full" />
                              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">1. 指标趋势概览表</span>
                            </div>
                            <AnalysisTable 
                              title="" 
                              columns={['巡检对象', '10:00', '10:10', '10:20', '10:30', '趋势']} 
                              data={data.stage2.trendTable.slice(0, 10).map((row: any) => [row[0], row[1], row[3], row[5], row[7], row[8]])} 
                            />
                            {data.stage2.trendTable.length > 10 && (
                              <div className="flex justify-center mt-2.5">
                                <button 
                                  onClick={() => {
                                    setModalTitle('指标趋势概览表 - 全部指标数据');
                                    setModalMetrics(data.stage2.trendTable.map((row: any) => [row[0], row[1], row[3], row[5], row[7], row[8]]));
                                    setIsMetricsModalOpen(true);
                                  }}
                                  className="px-4 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 rounded-lg transition-all active:scale-95 flex items-center gap-1 shadow-md shadow-black/10"
                                >
                                  查看全部指标 ↓
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 2. 异常对象趋势图 */}
                        <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4">
                          <div className="flex items-center gap-2.5 mb-3">
                            <div className="w-1 h-3.5 bg-purple-500 rounded-full" />
                            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">2. 异常对象趋势图</span>
                          </div>
                          <div className="space-y-3">
                            <MultiLineTrendChart title="CPU 使用率趋势图 (所有异常对象)" labels={labels} lines={cpuLines} />
                            <MultiLineTrendChart title="内存使用率趋势图 (所有异常对象)" labels={labels} lines={memoryLines} />
                            <MultiLineTrendChart title="错误率趋势图 (所有异常对象)" labels={labels} lines={errorLines} />
                          </div>
                        </div>

                        {/* 3. 历史对比表 */}
                        <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4">
                          <div className="flex items-center gap-2.5 mb-3">
                            <div className="w-1 h-3.5 bg-purple-500 rounded-full" />
                            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">3. 历史对比表</span>
                          </div>
                          {data.priorityObjects && data.priorityObjects.length >= 2 ? (
                            <div className="flex items-center flex-wrap gap-2.5 my-2">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">分析对象:</span>
                              <div className="flex flex-wrap gap-1.5">
                                {data.priorityObjects.map((node: any) => {
                                  const isSelected = activeIp === node.ip;
                                  return (
                                    <button
                                      key={node.ip}
                                      onClick={() => setSelectedNodeIp(node.ip)}
                                      className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                                        isSelected
                                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/50 font-bold shadow-sm shadow-blue-500/10'
                                          : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                                      }`}
                                    >
                                      {node.ip}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-500 font-mono tracking-tight my-2">
                              分析对象: {activeIp}
                            </div>
                          )}
                          {isFailedNode ? (
                            <div className="bg-slate-950/20 border border-slate-800 rounded-lg p-3 text-center text-slate-500 text-xs">
                              当前对象无可用历史对比数据
                            </div>
                          ) : (
                            activeDetails.historyTable && activeDetails.historyTable.length > 0 ? (
                              <AnalysisTable 
                                title="" 
                                columns={['指标', '当前值', '昨日同时间', '阈值', '对比结论']} 
                                data={activeDetails.historyTable} 
                              />
                            ) : (
                              <div className="bg-slate-950/20 border border-slate-800 rounded-lg p-3 text-center text-slate-500 text-xs">
                                当前对象无可用历史对比数据
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* failed 分支 */}
                  {branch === 'failed' && (
                    <div className="space-y-4">
                      {data.stage2?.failedDistribution && (
                        <AnalysisTable 
                          title="失败对象分布表" 
                          columns={['失败原因', '对象数量', '示例对象']} 
                          data={data.stage2.failedDistribution} 
                        />
                      )}
                      {data.stage2?.failedImpact && (
                        <AnalysisTable 
                          title="失败影响范围" 
                          columns={['影响项', '内容']} 
                          data={data.stage2.failedImpact} 
                        />
                      )}
                    </div>
                  )}
                </motion.div>
              )}
              {currentStep === 2 && (
                <div className="flex items-center gap-2 text-xs text-slate-500 uppercase font-black animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600" /> 筛查推演根因模式中...
                </div>
              )}
            </div>
          </div>

          {/* Phase 3: 健康状态判断 / 根因分析 / 失败原因判断 */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className={`w-6 h-6 rounded-full ${currentStep >= 3 ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'bg-slate-800 text-slate-500'} flex items-center justify-center text-[10px] font-bold transition-all`}>3</div>
              <div className={`w-px flex-1 ${currentStep > 3 ? 'bg-purple-600' : 'bg-slate-800/50'}`} />
            </div>
            <div className="flex-1 min-w-0 pb-4">
              <div className="text-[13px] font-bold text-slate-300 uppercase tracking-wider mb-3">
                {branch === 'normal' ? '03 / 健康状态判断' : branch === 'abnormal' ? '03 / 根因分析' : '03 / 失败原因判断'}
              </div>
              {currentStep >= 3 && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  {/* normal 分支 */}
                  {branch === 'normal' && (
                    <div className="space-y-4">
                      {data.stage3?.judgmentTable && (
                        <AnalysisTable 
                          title="健康判断表" 
                          columns={['判断项', '结果', '说明']} 
                          data={data.stage3.judgmentTable} 
                        />
                      )}
                      {data.stage3?.evidenceList && (
                        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-1 h-3.5 bg-blue-500 rounded-full" />
<span className="text-xs font-bold text-slate-200 uppercase tracking-wider">关键依据</span>
                          </div>
                          <ul className="space-y-1.5">
                            {data.stage3.evidenceList.map((e: string, i: number) => (
                              <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-blue-500" /> {e}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                                                                                                            {/* abnormal 分支 */}
                  {branch === 'abnormal' && (
                    <div className="space-y-6">
                      {data.priorityObjects && data.priorityObjects.length >= 2 ? (
                        <div className="space-y-6">
                          {data.priorityObjects.map((node: any) => {
                            const nodeIp = node.ip;
                            const nodeDetails = data.nodeDetails?.[nodeIp] || getFallbackNodeDetails(nodeIp, branch);
                            const isFailedNode = nodeDetails.detailTable?.find((r: any) => r[0] === '结果')?.[1] === 'failed';
                            
                            return (
                              <div key={nodeIp} className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4 space-y-4">
                                <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                  <span className="text-[11px] font-bold text-blue-400 font-mono">诊断对象: {nodeIp}</span>
                                </div>

                                {isFailedNode ? (
                                  <div className="bg-slate-950/20 border border-slate-800 rounded-lg p-4 text-center text-slate-500 text-xs">
                                    当前对象为巡检失败，无法基于指标进行根因分析
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    {/* 1. 根因候选表 */}
                                    {nodeDetails.diagnosis?.candidates && (
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2 pl-3.5 my-2">
                                          <div className="w-1.5 h-1.5 rounded-full border border-slate-700 bg-slate-900" />
                                          <span className="text-[11px] font-bold text-slate-400">1. 根因候选表</span>
                                        </div>
                                        <AnalysisTable 
                                          title="" 
                                          columns={['可能原因', '支撑证据', '说明']} 
                                          data={nodeDetails.diagnosis.candidates} 
                                        />
                                      </div>
                                    )}

                                    {/* 2. 关键证据总结 */}
                                    {nodeDetails.diagnosis?.evidences && (
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2 pl-3.5 my-2">
                                          <div className="w-1.5 h-1.5 rounded-full border border-slate-700 bg-slate-900" />
                                          <span className="text-[11px] font-bold text-slate-400">2. 关键证据总结</span>
                                        </div>
                                        <ul className="space-y-1.5 bg-slate-900/30 border border-slate-800 rounded-xl p-4">
                                          {nodeDetails.diagnosis.evidences.map((e: string, i: number) => (
                                            <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                                              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" /> {e}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4 space-y-4">
                          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <span className="text-[11px] font-bold text-blue-400 font-mono">诊断对象: {activeIp}</span>
                          </div>
                          
                          {(() => {
                            const isFailedNode = activeDetails.detailTable?.find((r: any) => r[0] === '结果')?.[1] === 'failed';
                            if (isFailedNode) {
                              return (
                                <div className="bg-slate-950/20 border border-slate-800 rounded-lg p-4 text-center text-slate-500 text-xs">
                                  当前对象为巡检失败，无法基于指标进行根因分析
                                </div>
                              );
                            }
                            return (
                              <div className="space-y-4">
                                {/* 1. 根因候选表 */}
                                {activeDetails.diagnosis?.candidates && (
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 pl-3.5 my-2">
                                      <div className="w-1.5 h-1.5 rounded-full border border-slate-700 bg-slate-900" />
                                      <span className="text-[11px] font-bold text-slate-400">1. 根因候选表</span>
                                    </div>
                                    <AnalysisTable 
                                      title="" 
                                      columns={['可能原因', '支撑证据', '说明']} 
                                      data={activeDetails.diagnosis.candidates} 
                                    />
                                  </div>
                                )}

                                {/* 2. 关键证据总结 */}
                                {activeDetails.diagnosis?.evidences && (
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 pl-3.5 my-2">
                                      <div className="w-1.5 h-1.5 rounded-full border border-slate-700 bg-slate-900" />
                                      <span className="text-[11px] font-bold text-slate-400">2. 关键证据总结</span>
                                    </div>
                                    <ul className="space-y-1.5 bg-slate-900/30 border border-slate-800 rounded-xl p-4">
                                      {activeDetails.diagnosis.evidences.map((e: string, i: number) => (
                                        <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" /> {e}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  )}
                  
{/* failed 分支 */}
                  {branch === 'failed' && data.stage3 && (
                    <div className="space-y-6">
                      {/* 1. 失败原因归纳表 */}
                      {data.stage3.reasonsTable && (
                        <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4">
                          <div className="flex items-center gap-2.5 mb-3">
                            <div className="w-1 h-3.5 bg-purple-500 rounded-full" />
                            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">1. 失败原因归纳表</span>
                          </div>
                          <AnalysisTable 
                            title="" 
                            columns={['失败原因', '失败对象数', '示例对象', '支撑信息', '说明']} 
                            data={data.stage3.reasonsTable} 
                          />
                        </div>
                      )}

                      {/* 2. 失败原因占比 */}
                      {data.stage3.ratioTable && (
                        <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4">
                          <div className="flex items-center gap-2.5 mb-3">
                            <div className="w-1 h-3.5 bg-purple-500 rounded-full" />
                            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">2. 失败原因占比</span>
                          </div>
                          <AnalysisTable 
                            title="" 
                            columns={['失败原因', '对象数', '占失败对象比例']} 
                            data={data.stage3.ratioTable} 
                          />
                        </div>
                      )}

                      {/* 3. 失败原因判断 */}
                      {data.stage3.judgments && (
                        <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-1 h-3.5 bg-purple-500 rounded-full" />
<span className="text-xs font-bold text-slate-200 uppercase tracking-wider">3. 失败原因判断</span>
                          </div>
                          <ul className="space-y-1.5">
                            {data.stage3.judgments.map((item: string, idx: number) => (
                              <li key={idx} className="text-xs text-slate-200 font-bold flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full shrink-0 mt-1.5" /> 
                                <span className="leading-relaxed">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* 4. 未确认信息 */}
                      {data.stage3.unconfirmed && (
                        <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-1 h-3.5 bg-amber-500 rounded-full" />
<span className="text-xs font-bold text-slate-200 uppercase tracking-wider">4. 未确认信息</span>
                          </div>
                          <ul className="space-y-1.5">
                            {data.stage3.unconfirmed.map((item: string, idx: number) => (
                              <li key={idx} className="text-xs text-slate-200 font-bold flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0 mt-1.5" /> 
                                <span className="leading-relaxed">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* 5. 阶段结论 */}
                      {data.stage3.conclusion && (
                        <div className="bg-gradient-to-r from-purple-500/[0.03] to-transparent border border-purple-500/10 rounded-xl p-4 relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-purple-500/40 to-transparent" />
                          <div className="text-[11px] text-slate-400 font-bold mb-2">5. 阶段结论</div>
                          <p className="text-xs text-slate-200 font-bold leading-relaxed">{data.stage3.conclusion}</p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
              {currentStep === 3 && (
                <div className="flex items-center gap-2 text-xs text-slate-500 uppercase font-black animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600" /> 总结并生成排查建议中...
                </div>
              )}
            </div>
          </div>

          {/* Phase 4: 最终建议 */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className={`w-6 h-6 rounded-full ${currentStep >= 4 ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-slate-800 text-slate-500'} flex items-center justify-center text-[10px] font-bold transition-all`}>4</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold text-slate-300 uppercase tracking-wider mb-3">
                {branch === 'normal' ? '04 / 巡检结论' : branch === 'abnormal' ? '04 / 最终建议' : '04 / 失败处理建议'}
              </div>
              {currentStep >= 4 && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  {/* normal 分支 */}
                  {branch === 'normal' && (
                    <div className="space-y-4">
                      {data.stage4?.verdictTable && (
                        <AnalysisTable title="巡检结果概览" columns={['维度', '内容']} data={data.stage4.verdictTable} />
                      )}
                      
                      {data.stage4?.verdictJudgments && (
                        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-1 h-3.5 bg-blue-500 rounded-full" />
<span className="text-xs font-bold text-slate-200 uppercase tracking-wider">当前判断</span>
                          </div>
                          <ul className="space-y-1.5">
                            {data.stage4.verdictJudgments.map((item: string, idx: number) => (
                              <li key={idx} className="text-xs text-slate-200 font-bold flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" /> {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {data.stage4?.verdictSuggestions && (
                        <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-1 h-3.5 bg-emerald-500 rounded-full" />
<span className="text-xs font-bold text-slate-200 uppercase tracking-wider">总体建议</span>
                          </div>
                          <ul className="space-y-1.5">
                            {data.stage4.verdictSuggestions.map((item: string, idx: number) => (
                              <li key={idx} className="text-xs text-slate-200 font-bold flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" /> {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                                                                                                            {/* abnormal 分支 */}
                  {branch === 'abnormal' && activeDetails.verdict && (
                    <div className="space-y-6">
                      {/* 1. 问题汇总与关键发现 */}
                      <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-1">
                          <div className="w-1.5 h-3.5 bg-blue-500 rounded-full" />
                          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">1. 问题汇总与关键发现</span>
                        </div>
                        <div className="bg-blue-950/10 border border-blue-500/10 rounded-xl p-4 text-xs text-slate-300 leading-relaxed space-y-3 shadow-inner">
                          <p className="font-medium">
                            经巡检多维关联分析，当前巡检计划下共发现 <span className="text-rose-400 font-bold">2</span> 个异常实例和 <span className="text-amber-400 font-bold">1</span> 个失败实例，核心关键发现如下：
                          </p>
                          <ul className="space-y-2.5">
                            <li className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0 mt-1.5" />
                              <span>
                                对于 <strong className="font-mono text-rose-300">172.30.34.73:8001</strong>：系统检测到其 CPU 使用率异常升高（达 <strong>92%</strong>）且内存使用率接近上限（达 <strong>88%</strong>），呈现明显的双高压力，同时伴随错误率 the 异常波动。
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0 mt-1.5" />
                              <span>
                                对于 <strong className="font-mono text-rose-300">172.30.34.81:8001</strong>：系统检测到其 activity 文件描述符数（FD Count）达到 <strong>980</strong> 并单调上升，已高度逼近单实例 resource 上限，存在显著的连接/句柄泄漏风险。
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0 mt-1.5" />
                              <span>
                                对于 <strong className="font-mono text-amber-300">172.30.34.90:8001</strong>：该实例在巡检期间连接超时（Connection Timeout），端口无法访问，提示处于服务阻断或宕机状态。
                              </span>
                            </li>
                          </ul>
                          <p className="text-[11px] text-slate-400 border-t border-slate-800/40 pt-2 mt-1">
                            ※ 总体判定：两台异常实例分别存在高负载和句柄泄漏风险，一台失败实例疑似宕机或网络阻断。均需尽快执行排查或自愈预案。
                          </p>
                        </div>
                      </div>

                      {/* 2. 自愈与处置修复方案 */}
                      <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-1">
                          <div className="w-1.5 h-3.5 bg-emerald-500 rounded-full" />
                          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">2. 自愈与处置修复方案</span>
                        </div>
                        <div className="overflow-hidden border border-slate-800 rounded-xl bg-slate-950/10">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-slate-800 bg-slate-950/30 text-slate-400 font-medium">
                                <th className="px-3.5 py-2.5 font-semibold">异常实例</th>
                                <th className="px-3.5 py-2.5 font-semibold">根因诊断结论</th>
                                <th className="px-3.5 py-2.5 font-semibold">建议处置措施</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b border-slate-800/30 hover:bg-slate-900/10">
                                <td className="px-3.5 py-3 font-mono text-slate-200 font-bold break-all whitespace-normal min-w-[120px]">172.30.34.73:8001</td>
                                <td className="px-3.5 py-3 text-slate-300 break-words whitespace-normal min-w-[160px]">系统资源双高压力，疑似内存泄漏与突增负载叠加。</td>
                                <td className="px-3.5 py-3 text-slate-300 break-words whitespace-normal min-w-[200px]">
                                  1. 建议人工介入 Dump 堆内存进行泄漏点分析；<br />
                                  2. 临时进行实例重启或扩容释放 CPU / 内存压力，保障服务可用性。
                                </td>
                              </tr>
                              <tr className="border-b border-slate-800/30 hover:bg-slate-900/10">
                                <td className="px-3.5 py-3 font-mono text-slate-200 font-bold break-all whitespace-normal min-w-[120px]">172.30.34.81:8001</td>
                                <td className="px-3.5 py-3 text-slate-300 break-words whitespace-normal min-w-[160px]">文件描述符计数（FD Count）单调递增，发生连接句柄泄漏。</td>
                                <td className="px-3.5 py-3 text-slate-300 break-words whitespace-normal min-w-[200px]">
                                  1. 检查底层 TCP 连接及网络套接字释放逻辑；<br />
                                  2. 在测试环境复现连接管理逻辑并定位未关闭连接句柄的代码段。
                                </td>
                              </tr>
                              <tr className="hover:bg-slate-900/10">
                                <td className="px-3.5 py-3 font-mono text-slate-200 font-bold break-all whitespace-normal min-w-[120px]">172.30.34.90:8001</td>
                                <td className="px-3.5 py-3 text-slate-300 break-words whitespace-normal min-w-[160px]">巡检连接超时，实例可能发生宕机或网络策略拦截。</td>
                                <td className="px-3.5 py-3 text-slate-300 break-words whitespace-normal min-w-[200px]">
                                  1. 检查目标节点服务端口监听与网络可达性；<br />
                                  2. 核验防火墙或安全组拦截规则；<br />
                                  3. 确认进程/容器存活状态，必要时执行实例重启。
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                  
{/* failed 分支 */}
                  {branch === 'failed' && data.stage4 && (
                    <div className="space-y-6">
                      {/* 1. 失败结果概览 */}
                      {data.stage4.verdictTable && (
                        <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4">
                          <div className="flex items-center gap-2.5 mb-3">
                            <div className="w-1 h-3.5 bg-rose-500 rounded-full" />
                            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">1. 失败结果概览</span>
                          </div>
                          <AnalysisTable 
                            title="" 
                            columns={['维度', '内容']} 
                            data={data.stage4.verdictTable} 
                          />
                        </div>
                      )}

                      {/* 2. 关键发现 */}
                      {data.stage4.findings && (
                        <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-1 h-3.5 bg-rose-500 rounded-full" />
<span className="text-xs font-bold text-slate-200 uppercase tracking-wider">2. 关键发现</span>
                          </div>
                          <ul className="space-y-1.5">
                            {data.stage4.findings.map((item: string, idx: number) => (
                              <li key={idx} className="text-xs text-slate-200 font-bold flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0 mt-1.5" /> 
                                <span className="leading-relaxed">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* 3. 当前判断 */}
                      {data.stage4.judgments && (
                        <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-1 h-3.5 bg-rose-500 rounded-full" />
<span className="text-xs font-bold text-slate-200 uppercase tracking-wider">3. 当前判断</span>
                          </div>
                          <ul className="space-y-1.5">
                            {data.stage4.judgments.map((item: string, idx: number) => (
                              <li key={idx} className="text-xs text-slate-200 font-bold flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0 mt-1.5" /> 
                                <span className="leading-relaxed">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* 4. 总体建议 */}
                      {data.stage4.recommendationsTable && (
                        <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4 space-y-4">
                          <div className="flex items-center gap-2.5 mb-3">
                            <div className="w-1 h-3.5 bg-rose-500 rounded-full" />
                            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">4. 总体建议</span>
                          </div>
                          
                          <AnalysisTable 
                            title="" 
                            columns={['失败原因', '建议动作']} 
                            data={data.stage4.recommendationsTable} 
                          />

                          {data.stage4.supplementaryRecommendations && (
                            <div className="bg-gradient-to-r from-rose-500/[0.03] to-transparent border border-rose-500/10 rounded-xl p-4 relative overflow-hidden mt-3">
                              <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-rose-500/40 to-transparent" />
                              <ul className="space-y-1.5">
                                {data.stage4.supplementaryRecommendations.map((item: string, idx: number) => (
                                  <li key={idx} className="text-[11px] text-slate-300 font-bold leading-relaxed flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500/30 shrink-0 mt-1.5" /> 
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => onAction?.('VIEW_REPORT', data)}
                    className="w-full py-3 mt-4 border border-slate-700 hover:border-indigo-500/50 text-slate-400 hover:text-indigo-400 text-xs font-black rounded-md transition-all active:scale-95 uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <FileText size={14} /> 查看完整深度报告
                  </button>
                </motion.div>
              )}
              {currentStep === 3 && (
                <div className="flex items-center gap-2 text-xs text-slate-500 uppercase font-black animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600" /> 总结并生成排查建议中...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* IP Modal */}
        <AllObjectsModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={modalTitle}
          objects={modalObjects}
          selectedIp={activeIp}
          onSelectIp={(ip: string) => setSelectedNodeIp(ip)}
        />

        <AllMetricsModal 
          isOpen={isMetricsModalOpen}
          onClose={() => setIsMetricsModalOpen(false)}
          title={modalTitle}
          data={modalMetrics}
        />
      </div>
    );
  }

  // 默认原始告警分析模式
  const { topology, agents, conclusion } = data;
  return (
    <div className="bg-[#111118] border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl max-w-4xl font-sans text-left">
      <div className="p-4 border-b border-white/[0.05] bg-[#16161d] flex items-center justify-between">
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
            <div className={`w-6 h-6 rounded-full ${currentStep >= 1 ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(79,70,229,0.4)]' : 'bg-slate-800 text-slate-500'} flex items-center justify-center text-[10px] font-bold transition-colors`} >1</div>
            <div className={`w-px flex-1 ${currentStep > 1 ? 'bg-indigo-600' : 'bg-slate-800/50'}`} />
          </div>
          <div className="flex-1 pb-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">环节一：拓扑路径自动发现</div>
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
            <div className={`w-6 h-6 rounded-full ${currentStep >= 2 ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(79,70,229,0.4)]' : 'bg-slate-800 text-slate-500'} flex items-center justify-center text-[10px] font-bold transition-colors`} >2</div>
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

                    <div className="mt-2 pt-2 border-t border-white/[0.05] flex justify-between items-center">
                      <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">置信度: 98%</span>
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40" />
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500/20" />
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
            <div className={`w-6 h-6 rounded-full ${currentStep >= 3 ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-slate-800 text-slate-500'} flex items-center justify-center text-[10px] font-bold transition-colors`} >3</div>
          </div>
          <div className="flex-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">环节三：诊断结论与修复方案</div>
            {currentStep >= 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 mb-5 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                  <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity"><Brain size={48} /></div>
                  <h4 className="text-xs font-black text-emerald-400 mb-2 uppercase tracking-tight flex items-center gap-2">
                    故障确认 (已确认根因)
                  </h4>
                  <p className="text-[12px] text-emerald-50/80 font-bold leading-relaxed">
                    {conclusion}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => onAction?.('ACT_SELF_HEAL', data)}
                    className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-emerald-900/20 active:scale-95 uppercase tracking-wide flex items-center justify-center gap-2"
                  >
                    <Zap size={14} fill="currentColor" />
                    {data?.id === 'A001' ? '生成修复方案' : '一键执行自愈 ⚡'}
                  </button>
                  <button
                    onClick={() => onAction?.('VIEW_REPORT', data)}
                    className="px-6 py-3 border border-slate-700 hover:border-blue-500/50 text-slate-400 hover:text-blue-400 text-xs font-bold rounded-xl transition-all active:scale-95 uppercase tracking-wide flex items-center justify-center gap-2"
                  >
                    <FileText size={14} />
                    根因分析报告
                  </button>

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
    <div className="bg-[#141b2d]/50 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl max-w-2xl font-sans mb-2 text-left">
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
              <div className="bg-black/40 rounded-lg border border-slate-800 p-3 font-mono text-[10px] text-slate-400 space-y-1 text-left">
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
    <div className="w-72 border-r border-white/5 bg-[#08080c] flex flex-col shrink-0">
      <div className="p-6 border-b border-white/5">
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
                : 'bg-transparent border-transparent hover:bg-white/[0.03] hover:border-white/10'
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

// 安全克隆辅助函数，防止循环引用或 React 元素等非 JSON 数据导致崩溃
const safeClonePlan = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(safeClonePlan);
  }
  const clone: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const val = obj[key];
      if (typeof val === 'function') continue;
      if (val && typeof val === 'object' && (val.$$typeof || val instanceof Event)) continue;
      clone[key] = safeClonePlan(val);
    }
  }
  return clone;
};

// ==========================================
// 巡检子任务编辑二级弹窗 (InspectionTaskEditModal)
// ==========================================
interface InspectionTaskEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: any;
  onSave: (updatedTask: any) => void;
}

const InspectionTaskEditModal = React.memo(({ isOpen, onClose, task, onSave }: InspectionTaskEditModalProps) => {
  // ── ① 所有 Hook 必须在 early return 之前声明，保证 Hook 调用顺序固定 ──
  const [editedTask, setEditedTask] = React.useState<any>(() => task ? structuredClone(task) : null);
  const [localScript, setLocalScript] = React.useState<string>(() => (task && task.scriptContent) ? task.scriptContent : '');

  // ② 已选资源独立 state，完全与 editedTask 大对象解耦
  const [selectedTargets, setSelectedTargets] = React.useState<string[]>(() => {
    if (!task) return [];
    if (Array.isArray(task.targets)) return task.targets;
    if (typeof task.target === 'string' && task.target) {
      return task.target.split(',').map((t: string) => t.trim()).filter(Boolean);
    }
    return [];
  });

  const [showResourceDropdown, setShowResourceDropdown] = React.useState(false);
  const resourceDropdownRef = React.useRef<HTMLDivElement>(null);
  // 用 ref 追踪下拉开关状态，供 always-on 监听器读取，避免频繁重注册
  const dropdownOpenRef = React.useRef(false);
  dropdownOpenRef.current = showResourceDropdown;

  // ③ useEffect 空依赖，只注册一次 mousedown 监听，不随状态变化重复注册
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!dropdownOpenRef.current) return;
      if (resourceDropdownRef.current && !resourceDropdownRef.current.contains(e.target as Node)) {
        setShowResourceDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []); // 空依赖：只注册/销毁一次

  // ④ 可选资源列表，仅依赖资源类型
  const resourceObjects = React.useMemo(() => {
    const type = editedTask?.resourceType;
    if (type === 'Kubernetes 集群') return ['集群 (K8s-Prod-Main)', '集群 (VPC-Prod-Main)', '集群 (Kubernetes-Core)'];
    if (type === 'MySQL 实例') return ['MySQL-Order-Primary', 'MySQL-User-Backup', 'MySQL-Log-Static'];
    return ['默认服务器节点-01', '默认服务负载节点-02'];
  }, [editedTask?.resourceType]);

  // ⑤ handleToggleTarget：只更新 selectedTargets 轻量数组，不碰 editedTask 大对象
  const handleToggleTarget = React.useCallback((objName: string) => {
    setSelectedTargets(prev => {
      if (prev.includes(objName)) return prev.filter(t => t !== objName);
      return [...prev, objName];
    });
  }, []); // 空依赖，函数引用永远稳定

  const handleSave = React.useCallback(() => {
    onSave({
      ...editedTask,
      scriptContent: localScript,
      targets: selectedTargets,
      target: selectedTargets.join(', '),
    });
  }, [editedTask, localScript, selectedTargets, onSave]);

  const handleVariableChange = React.useCallback((index: number, val: string) => {
    setEditedTask((prev: any) => {
      const updatedVars = [...prev.variables];
      updatedVars[index] = { ...updatedVars[index], value: val };
      return { ...prev, variables: updatedVars };
    });
  }, []);

  if (!isOpen || !editedTask) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* 背景遮罩：使用标准原生 CSS 动画 */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 transition-opacity duration-200 animate-fade-in"
      />
      {/* 弹窗主体：使用标准原生 CSS 动画 */}
      <div
        className="relative w-full max-w-[620px] bg-[var(--bg-deep-alt)] border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl p-6 text-slate-200 z-10 transform transition-all duration-200 ease-out animate-scale-up"
      >
          {/* Header */}
          <div className="flex justify-between items-center pb-4 border-b border-slate-800/80 mb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                编辑巡检子任务
              </h3>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-200 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Form Content */}
          <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1 no-scrollbar">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">子任务名称</label>
              <input
                type="text"
                value={editedTask.name || ''}
                onChange={(e) => setEditedTask({ ...editedTask, name: e.target.value })}
                className="bg-slate-950/60 border border-slate-800 focus:border-indigo-500/80 focus:outline-none text-slate-200 rounded-lg py-2 px-3 text-xs transition-all"
              />
            </div>

            {/* 子任务 ID */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">子任务 ID</label>
              <input
                type="text"
                value={editedTask.taskId || ''}
                disabled
                className="w-full bg-slate-950/20 border border-slate-800/40 text-slate-500 rounded-lg py-2 px-3 text-xs font-mono cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">任务描述</label>
              <textarea
                value={editedTask.description || ''}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                className="bg-slate-950/60 border border-slate-800/80 focus:border-indigo-500/80 focus:outline-none text-slate-200 rounded-lg py-2 px-3 text-xs min-h-[60px] transition-all"
              />
            </div>

            {/* 资源类型 (只读) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">资源类型</label>
              <input
                type="text"
                disabled
                value={editedTask.resourceType || ''}
                className="bg-slate-950/30 border border-slate-800/50 text-slate-500 rounded-lg py-2 px-3 text-xs cursor-not-allowed"
              />
            </div>

            {/* 资源对象：方案C 下拉多选 */}
            <div className="flex flex-col gap-2" ref={resourceDropdownRef}>
              <label className="text-[10px] font-bold text-slate-400 uppercase">资源对象</label>
              {/* 触发框：显示已选 tag + ⌄ */}
              <div
                onClick={() => setShowResourceDropdown(v => !v)}
                className={`relative min-h-[40px] flex flex-wrap gap-1.5 items-center p-2 pr-8 bg-slate-950/40 border rounded-xl cursor-pointer transition-all ${
                  showResourceDropdown ? 'border-indigo-500/70' : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {selectedTargets.length === 0 ? (
                  <span className="text-xs text-slate-500 px-1">点击选择资源对象…</span>
                ) : (
                  <>
                    {selectedTargets.slice(0, 2).map((obj: string) => (
                      <span
                        key={obj}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-600/20 border border-indigo-500/70 text-indigo-300"
                      >
                        {obj}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleToggleTarget(obj); }}
                          className="ml-0.5 hover:text-white transition-colors leading-none"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                    {selectedTargets.length > 2 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-lg text-[11px] font-bold border border-dashed border-slate-600 text-slate-400 bg-slate-900/50 cursor-default">
                        +{selectedTargets.length - 2}
                      </span>
                    )}
                  </>
                )}
                <ChevronDown
                  size={12}
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none transition-transform duration-200 ${
                    showResourceDropdown ? 'rotate-180' : ''
                  }`}
                />
              </div>
              {/* 下拉 checkbox 列表 */}
              {showResourceDropdown && (
                <div className="border border-slate-700/80 bg-[var(--bg-deep-alt)] rounded-xl overflow-hidden shadow-xl shadow-black/40 z-10">
                  {resourceObjects.map((obj: string) => {
                    const isSelected = selectedTargets.includes(obj);
                    return (
                      <label
                        key={obj}
                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors text-xs ${
                          isSelected
                            ? 'bg-indigo-600/10 text-indigo-200'
                            : 'text-slate-300 hover:bg-slate-800/60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleTarget(obj)}
                          className="accent-indigo-500 w-3.5 h-3.5 cursor-pointer"
                        />
                        <span>{obj}</span>
                        {isSelected && <Check size={11} className="ml-auto text-indigo-400" />}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 脚本类型：平铺 Tab 标签 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">脚本类型</label>
              <div className="flex gap-2">
                {(['shell', 'python'] as const).map((type) => {
                  const isActive = (editedTask.scriptType || 'shell') === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setEditedTask({ ...editedTask, scriptType: type })}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/5'
                          : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      {type === 'shell' ? 'Shell 脚本' : 'Python 脚本'}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">脚本内容</label>
              <textarea
                value={localScript}
                onChange={(e) => setLocalScript(e.target.value)}
                onBlur={() => setEditedTask({ ...editedTask, scriptContent: localScript })}
                className="bg-slate-950/90 border border-slate-800 focus:border-indigo-500/80 focus:outline-none text-slate-300 font-mono rounded-lg py-2 px-3 text-[10px] min-h-[100px] transition-all leading-normal"
              />
            </div>

            {/* Variables Panel */}
            {Array.isArray(editedTask.variables) && editedTask.variables.length > 0 && (
              <div className="border-t border-slate-800/40 pt-4 space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">运行变量配置</label>
                <div className="grid grid-cols-1 gap-2.5">
                  {editedTask.variables.map((v: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 bg-slate-950/30 border border-slate-800/50 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 w-1/3">
                        {!v.editable && <Lock size={10} className="text-slate-500 shrink-0" />}
                        <span className="text-[10.5px] font-mono font-bold text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap" title={v.name}>{v.name}</span>
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          disabled={!v.editable}
                          value={v.value || ''}
                          onChange={(e) => handleVariableChange(index, e.target.value)}
                          className={`w-full bg-slate-950/60 border rounded-lg py-1.5 px-3 text-xs transition-all focus:outline-none ${v.editable ? 'border-slate-800 focus:border-indigo-500/85 text-slate-200' : 'border-slate-800/20 text-slate-500 cursor-not-allowed'}`}
                          placeholder="暂未设置值"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80 mt-5 bg-slate-900/20 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs font-bold transition-all"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95 border border-blue-500/20"
            >
              保存修改
            </button>
          </div>
        </div>
      </div>
    );
  }, (prevProps, nextProps) => {
    return prevProps.isOpen === nextProps.isOpen && prevProps.task?.taskId === nextProps.task?.taskId;
  });

// ==========================================
// 巡检计划配置一阶抽屉 (InspectionPlanDetailDrawer)
// ==========================================
interface InspectionPlanDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  plan: any;
  onSave: (updatedPlan: any) => void;
}

const InspectionPlanDetailDrawer = ({
  isOpen,
  onClose,
  plan,
  onSave
}: InspectionPlanDetailDrawerProps) => {
  const [editedPlan, setEditedPlan] = useState<any>(() => plan ? structuredClone(plan) : null);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<any>(null);

  if (!isOpen || !editedPlan) return null;

  const handleSave = () => {
    onSave(editedPlan);
    onClose();
  };

  const handleToggleEnable = () => {
    if (editedPlan.executionType === 'immediate') return;
    setEditedPlan({ ...editedPlan, enabled: !editedPlan.enabled });
  };

  const handleCloseSubTask = React.useCallback(() => {
    setSelectedTaskForEdit(null);
  }, []);

  const handleSaveSubTask = React.useCallback((updatedTask: any) => {
    setEditedPlan(prev => {
      if (!prev) return prev;
      const updatedTasksList = prev.tasks.map((t: any) => 
        t.taskId === updatedTask.taskId ? updatedTask : t
      );
      const updatedRules = updatedTasksList.map((t: any) => t.name.replace('监测', '').replace('检测', ''));
      return {
        ...prev,
        tasks: updatedTasksList,
        rules: updatedRules
      };
    });
    setSelectedTaskForEdit(null);
  }, []);

  return (
    <AnimatePresence>
      {/* 蒙层 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-[101]"
      />
      {/* 抽屉 */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
        className="fixed top-0 right-0 h-full w-[45%] min-w-[500px] max-w-[900px] bg-[var(--bg-deep-alt)] border-l border-slate-700/80 z-[102] flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.5)] text-slate-200"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800/60 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-base font-black text-slate-100 flex items-center gap-2">
              编辑巡检计划
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-300 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Content Panel */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          {/* 1. Basic Fields */}
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">计划名称</label>
              <input
                type="text"
                value={editedPlan.name || ''}
                onChange={(e) => setEditedPlan({ ...editedPlan, name: e.target.value })}
                className="bg-slate-950/60 border border-slate-800 focus:border-indigo-500/80 focus:outline-none text-slate-200 rounded-lg py-2 px-3 text-xs transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">计划ID</label>
              <div className="bg-slate-950/30 border border-slate-800/50 text-slate-500 rounded-lg py-2 px-3 text-xs cursor-not-allowed select-all font-mono">
                {editedPlan.id} (计划ID: {editedPlan.planId})
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400">计划描述</label>
              <textarea
                value={editedPlan.description || ''}
                onChange={(e) => setEditedPlan({ ...editedPlan, description: e.target.value })}
                placeholder="请输入巡检计划描述..."
                className="bg-slate-950/60 border border-slate-800 focus:border-indigo-500/80 focus:outline-none text-slate-200 rounded-lg py-2 px-3 text-xs min-h-[60px] transition-all placeholder:text-slate-600/50"
              />
            </div>
          </div>

          {/* 2. Run Control */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">运行状态</label>
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleToggleEnable}
                disabled={editedPlan.executionType === 'immediate'}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${editedPlan.enabled ? 'bg-indigo-600' : 'bg-slate-800'} ${editedPlan.executionType === 'immediate' ? 'opacity-30 cursor-not-allowed' : ''}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${editedPlan.enabled ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
              <span className={`text-xs font-bold ${editedPlan.enabled ? 'text-indigo-400' : 'text-slate-500'}`}>
                {editedPlan.enabled ? '已开启' : '已关闭'}
              </span>
            </div>
          </div>

          {/* 3. Exec Type Badge */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400">巡检类型</label>
            <div className="pt-1">
              {editedPlan.executionType === 'scheduled' ? (
                <span className="px-2.5 py-1 rounded-[6px] text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 inline-flex items-center gap-1.5 cursor-not-allowed">
                  <Clock size={12} />
                  定时巡检
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-[6px] text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 inline-flex items-center gap-1.5 cursor-not-allowed">
                  <Zap size={12} />
                  立即执行
                </span>
              )}
            </div>
          </div>

          {/* 4. Scheduling Config */}
          {editedPlan.executionType === 'scheduled' && (
            <div className="grid grid-cols-2 gap-4 pt-1.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Cron 表达式</label>
                <input
                  type="text"
                  value={editedPlan.cronExpression || ''}
                  onChange={(e) => setEditedPlan({ ...editedPlan, cronExpression: e.target.value })}
                  className="bg-slate-950/60 border border-slate-800 focus:border-indigo-500/80 focus:outline-none text-slate-200 rounded-lg py-2 px-3 text-xs transition-all font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">频率描述</label>
                <input
                  type="text"
                  value={editedPlan.cronDescription || ''}
                  onChange={(e) => setEditedPlan({ ...editedPlan, cronDescription: e.target.value })}
                  className="bg-slate-950/60 border border-slate-800 focus:border-indigo-500/80 focus:outline-none text-slate-200 rounded-lg py-2 px-3 text-xs transition-all"
                />
              </div>
            </div>
          )}

          {/* 5. Subtasks Table */}
          <div className="border-t border-slate-800/40 pt-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                子任务列表
                <span className="text-xs text-slate-500 font-medium font-mono">
                  ({Array.isArray(editedPlan.tasks) ? editedPlan.tasks.length : 0})
                </span>
              </h3>
            </div>
            
            <div className="border border-slate-800/80 bg-slate-950/20 rounded-xl overflow-hidden">
              <table className="w-full text-[11px] text-slate-300">
                <thead>
                  <tr className="bg-slate-950/55 border-b border-slate-800 text-left text-slate-500 font-bold uppercase tracking-wider">
                    <th className="px-4 py-2">任务 ID & 名称</th>
                    <th className="px-4 py-2">资源类型</th>
                    <th className="px-4 py-2 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {Array.isArray(editedPlan.tasks) && editedPlan.tasks.length > 0 ? (
                    editedPlan.tasks.map((taskItem: any) => (
                      <tr key={taskItem.taskId} className="hover:bg-slate-900/35 transition-colors">
                        <td className="px-4 py-2.5">
                          <div className="font-bold text-slate-200">{taskItem.name}</div>
                          <div className="text-[9px] text-slate-500 font-mono mt-0.5">{taskItem.taskId}</div>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 font-mono text-[9px] border border-slate-800">
                            {taskItem.resourceType}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => setSelectedTaskForEdit(taskItem)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white text-[10px] font-black transition-all border border-indigo-500/20 active:scale-95 cursor-pointer"
                          >
                            <Edit size={10} /> 编辑
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-slate-500 italic">
                        暂无子任务项
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="p-6 border-t border-slate-800/60 bg-slate-900/20 shrink-0 flex justify-end items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs font-bold transition-all"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95 border border-blue-500/20"
          >
            保存计划
          </button>
        </div>

        {selectedTaskForEdit !== null && createPortal(
          <InspectionTaskEditModal
            isOpen={true}
            onClose={handleCloseSubTask}
            task={selectedTaskForEdit}
            onSave={handleSaveSubTask}
          />,
          document.body
        )}
      </motion.div>
    </AnimatePresence>
  );
};

const DiagnosticReportDrawer = ({ isOpen, onClose, data }: { isOpen: boolean, onClose: () => void, data: any }) => {
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  const [selectedReportNodeIp, setSelectedReportNodeIp] = useState<string>('');
  const [selectedMetric, setSelectedMetric] = useState('CPU');
  const [isObjectsExpanded, setIsObjectsExpanded] = useState(false);
  const [isReportMetricsModalOpen, setIsReportMetricsModalOpen] = useState(false);
  const [reportModalMetrics, setReportModalMetrics] = useState<any[]>([]);
  const [reportModalTitle, setReportModalTitle] = useState('');
  
  useEffect(() => {
    if (data?.id) {
      setSelectedReportId('current');
      setSelectedReportNodeIp('');
    }
  }, [data?.id]);

  if (!data) return null;
  const isPhased = data.format === '0412_phased';
  const branch = data.branch || 'abnormal';

  const defaultReportSelectedIp = branch === 'abnormal' ? '172.30.34.73:8001' : branch === 'failed' ? '172.30.34.90:8001' : '';
  const activeReportIp = selectedReportNodeIp || defaultReportSelectedIp;
  const activeReportDetails = data.nodeDetails?.[activeReportIp] || getFallbackNodeDetails(activeReportIp, branch);

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
            className={`fixed top-0 right-0 h-full ${isPhased ? 'w-[92%]' : 'w-[85%]'} max-w-7xl bg-[#0a0a0f] border-l border-white/10 z-[101] flex shadow-[0_0_100px_rgba(0,0,0,0.8)]`}
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
              <div className="sticky top-0 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5 p-6 flex justify-between items-center z-10 shrink-0">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tighter flex items-center gap-3">
                    <div className={`p-2 ${isPhased ? 'bg-indigo-600/20 text-indigo-400' : 'bg-blue-600/20 text-blue-400'} rounded-xl`}>
                      {isPhased ? <ClipboardCheck size={24} /> : <FileText size={24} />}
                    </div>
                    {isPhased ? 'AI 巡检深度报告' : '根因分析深度报告'}
                    {selectedReportId !== 'current' && <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-500 rounded border border-white/5 ml-2">存档历史报告</span>}
                  </h2>
                  <div className="flex items-center gap-4 mt-2 text-[10px] uppercase font-bold tracking-widest text-slate-500">
                    <span>ID: {data.id || (isPhased ? 'INSP-' : 'INC-') + Date.now().toString().slice(-8)}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-800" />
                    <span>生成时间日期: {selectedReportId === 'current' ? (data.updatedAt || new Date().toLocaleString()) : fullHistory.find(h => h.id === selectedReportId)?.updatedAt}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => exportReport(data, branch, 'md')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700 hover:border-slate-600"
                    title="导出全量巡检数据的 Markdown 报告文档"
                  >
                    <Download size={13} /> 导出 Markdown
                  </button>
                  <button
                    onClick={() => exportReport(data, branch, 'html')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all border border-indigo-500 shadow-md shadow-indigo-900/10 active:scale-95"
                    title="导出带精美排版和高亮主题的 HTML 报告网页"
                  >
                    <Download size={13} /> 导出 HTML
                  </button>
                  <button onClick={onClose} className="p-2 rounded-xl hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 transition-all border border-transparent hover:border-rose-500/20 ml-2">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-10 space-y-12 max-w-4xl mx-auto flex-1 text-left font-sans relative">
                {/* 界面全量数据导出提示 */}
                <div className="text-[11px] text-amber-400 bg-amber-950/10 border border-amber-500/10 rounded-xl px-4 py-3 leading-relaxed flex items-start gap-2 shadow-inner">
                  <span className="shrink-0 select-none">💡</span>
                  <span>
                    <strong>提示：</strong>为优化网页加载与交互性能，当前界面仅精简展示 Top 关键对象与参数趋势。若需获取全部 23 个实例及完整历史趋势数据，请点击右上角 <strong>[导出 Markdown]</strong> 或 <strong>[导出 HTML]</strong> 获取完整报告文档。
                  </span>
                </div>

                {isPhased ? (
                  <>
                    {/* Phase 1: 开始分析 */}
                    <section className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-slate-800/40 pb-2 mb-4">
                        <h3 className="text-base font-black text-slate-100 tracking-tight flex items-center gap-2">
                          一、巡检基本状态概览 (Basic Status Overview)
                        </h3>
                      </div>

                      {/* normal 分支 */}
                      {branch === 'normal' && (
                        <div className="space-y-4">
                          {/* 1. 巡检计划信息 */}
                          <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4">
                            <div className="flex items-center gap-2.5 mb-3">
                              <div className="w-1 h-3.5 bg-emerald-500 rounded-full" />
                              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">1. 巡检计划信息</span>
                            </div>
                            <div className="overflow-x-auto border border-slate-800/60 rounded-xl bg-slate-950/10 overflow-hidden">
                              <table className="w-full text-left border-collapse text-xs">
                                <tbody>
                                  <tr className="border-b border-slate-800/30">
                                    <td className="px-3.5 py-2 font-medium text-slate-400">巡检计划名称</td>
                                    <td className="px-3.5 py-2 font-medium text-slate-200">{data.name}</td>
                                  </tr>
                                  <tr className="border-b border-slate-800/30">
                                    <td className="px-3.5 py-2 font-medium text-slate-400">执行结果</td>
                                    <td className="px-3.5 py-2 font-medium">
                                      <span className="inline-flex items-center justify-center h-5 px-1.5 rounded-sm text-[10px] font-black border uppercase bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                        正常 (normal)
                                      </span>
                                    </td>
                                  </tr>
                                  <tr className="border-b border-slate-800/30">
                                    <td className="px-3.5 py-2 font-medium text-slate-400">执行时间</td>
                                    <td className="px-3.5 py-2 font-medium text-slate-200">{data.updatedAt}</td>
                                  </tr>
                                  <tr>
                                    <td className="px-3.5 py-2 font-medium text-slate-400">严重级别</td>
                                    <td className="px-3.5 py-2 font-medium">
                                      <span className="inline-flex items-center justify-center h-5 px-1.5 rounded-sm text-[10px] font-black border uppercase bg-slate-800 text-slate-400">
                                        普通 (info)
                                      </span>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* 2. 巡检对象统计 */}
                          {data.stage1?.objectStats && (
                            <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4">
                              <div className="flex items-center gap-2.5 mb-3">
                                <div className="w-1 h-3.5 bg-emerald-500 rounded-full" />
                                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">2. 巡检对象统计</span>
                              </div>
                              <div className="overflow-x-auto border border-slate-800/60 rounded-xl bg-slate-950/10 overflow-hidden">
                                <table className="w-full text-left border-collapse text-xs">
                                  <thead>
                                    <tr className="border-b border-slate-800/80 bg-slate-900/30 text-slate-400">
                                      <th className="px-3.5 py-2 font-bold uppercase tracking-wider">统计项</th>
                                      <th className="px-3.5 py-2 font-bold uppercase tracking-wider text-right">数量</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {data.stage1.objectStats.map((row: any[], idx: number) => (
                                      <tr key={idx} className="border-b border-slate-800/30 last:border-0 hover:bg-white/[0.01]">
                                        <td className="px-3.5 py-2 font-medium text-slate-400">{row[0]}</td>
                                        <td className="px-3.5 py-2 font-mono text-slate-200 text-right">{row[1]}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {/* 3. 全部巡检对象列表 */}
                          {data.stage1?.objectsTable && (
                            <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4 space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="w-1 h-3.5 bg-emerald-500 rounded-full" />
<span className="text-xs font-bold text-slate-200 uppercase tracking-wider">3. 全部巡检对象列表</span>
                              </div>
                              <AnalysisTable 
                                title="" 
                                columns={['#', '巡检对象', '结果', '严重级别', '摘要']} 
                                data={data.stage1.objectsTable} 
                              />
                            </div>
                          )}

                          {/* 整体健康摘要 */}
                          {data.stage1?.healthSummary && (
                            <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-4">
                              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">整体健康摘要</div>
                              <p className="text-xs text-slate-300 leading-relaxed font-medium">{data.stage1.healthSummary}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* abnormal 分支 */}
                      {branch === 'abnormal' && (
                        <div className="space-y-4">
                          {/* 1. 巡检计划信息 */}
                          <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4">
                            <div className="flex items-center gap-2.5 mb-3">
                              <div className="w-1 h-3.5 bg-blue-500 rounded-full" />
                              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">1. 巡检计划信息</span>
                            </div>
                            <div className="overflow-x-auto border border-slate-800/60 rounded-xl bg-slate-950/10 overflow-hidden">
                              <table className="w-full text-left border-collapse text-xs">
                                <tbody>
                                  <tr className="border-b border-slate-800/30">
                                    <td className="px-3.5 py-2 font-medium text-slate-400">巡检计划名称</td>
                                    <td className="px-3.5 py-2 font-medium text-slate-200">{data.name}</td>
                                  </tr>
                                  <tr className="border-b border-slate-800/30">
                                    <td className="px-3.5 py-2 font-medium text-slate-400">执行结果</td>
                                    <td className="px-3.5 py-2 font-medium">
                                      <span className="inline-flex items-center justify-center h-5 px-1.5 rounded-sm text-[10px] font-black border uppercase bg-amber-500/10 text-amber-400 border-amber-500/20">
                                        异常 (abnormal)
                                      </span>
                                    </td>
                                  </tr>
                                  <tr className="border-b border-slate-800/30">
                                    <td className="px-3.5 py-2 font-medium text-slate-400">执行时间</td>
                                    <td className="px-3.5 py-2 font-medium text-slate-200">{data.updatedAt}</td>
                                  </tr>
                                  <tr>
                                    <td className="px-3.5 py-2 font-medium text-slate-400">严重级别</td>
                                    <td className="px-3.5 py-2 font-medium">
                                      <span className="inline-flex items-center justify-center h-5 px-1.5 rounded-sm text-[10px] font-black border uppercase bg-rose-500/10 text-rose-500 border-rose-500/20">
                                        严重 (critical)
                                      </span>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* 2. 巡检对象统计 */}
                          {data.stage1?.objectStats && (
                            <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4">
                              <div className="flex items-center gap-2.5 mb-3">
                                <div className="w-1 h-3.5 bg-blue-500 rounded-full" />
                                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">2. 巡检对象统计</span>
                              </div>
                              <div className="overflow-x-auto border border-slate-800/60 rounded-xl bg-slate-950/10 overflow-hidden">
                                <table className="w-full text-left border-collapse text-xs">
                                  <thead>
                                    <tr className="border-b border-slate-800/80 bg-slate-900/30 text-slate-400">
                                      <th className="px-3.5 py-2 font-bold uppercase tracking-wider">统计项</th>
                                      <th className="px-3.5 py-2 font-bold uppercase tracking-wider text-right">数量</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {data.stage1.objectStats.map((row: any[], idx: number) => (
                                      <tr key={idx} className="border-b border-slate-800/30 last:border-0 hover:bg-white/[0.01]">
                                        <td className="px-3.5 py-2 font-medium text-slate-400">{row[0]}</td>
                                        <td className="px-3.5 py-2 font-mono text-slate-200 text-right">{row[1]}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {/* 3. 全部巡检对象列表 */}
                          {data.stage1?.objectsTable && (
                            <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4 space-y-2">
                              <div className="flex items-center gap-2.5 mb-3">
                                <div className="w-1 h-3.5 bg-blue-500 rounded-full" />
                                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">3. 全部巡检对象列表</span>
                              </div>
                              <AnalysisTable 
                                title="" 
                                columns={['#', '巡检对象', '结果', '严重级别', '摘要']} 
                                data={isObjectsExpanded ? data.stage1.objectsTable : data.stage1.objectsTable.slice(0, 5)} 
                              />
                              {data.stage1.objectsTable.length > 5 && (
                                <div className="flex justify-center mt-2.5">
                                  <button 
                                    onClick={() => setIsObjectsExpanded(!isObjectsExpanded)}
                                    className="px-4 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 rounded-lg transition-all active:scale-95 flex items-center gap-1 shadow-md shadow-black/10"
                                  >
                                    {isObjectsExpanded ? '收起巡检对象列表 ↑' : '查看全部巡检对象列表 ↓'}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* 4. 巡检对象分析 */}
                          <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4 space-y-6">
                            <div className="flex items-center gap-2 border-b border-slate-800/40 pb-2 mb-1">
                              <div className="w-1 h-3.5 bg-blue-500 rounded-full" />
<span className="text-xs font-bold text-slate-200 uppercase tracking-wider">4. 巡检对象分析</span>
                            </div>

                            {/* （1）重点分析对象列表 */}
                            {data.priorityObjects && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 pl-3.5 my-3">
                                  <div className="w-1.5 h-1.5 rounded-full border border-slate-700 bg-slate-900" />
                                  <span className="text-[11px] font-bold text-slate-400">（1）异常对象列表</span>
                                </div>
                                <div className="overflow-x-auto border border-slate-800/60 rounded-xl bg-slate-950/10 overflow-hidden">
                                  <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                      <tr className="border-b border-slate-800/80 bg-slate-900/30 text-slate-400 font-bold uppercase tracking-wider">
                                        <th className="px-3.5 py-2">#</th>
                                        <th className="px-3.5 py-2">对象</th>
                                        <th className="px-3.5 py-2">类型</th>
                                        <th className="px-3.5 py-2">严重级别</th>
                                        <th className="px-3.5 py-2">重点原因</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {data.priorityObjects.slice(0, 5).map((row: any, idx: number) => {
                                        const isSelected = activeReportIp === row.ip;
                                        return (
                                          <tr 
                                            key={idx} 
                                            onClick={() => setSelectedReportNodeIp(row.ip)}
                                            className={`border-b border-slate-800/30 last:border-0 hover:bg-white/[0.02] cursor-pointer transition-colors ${isSelected ? 'bg-blue-600/10 font-bold' : ''}`}
                                          >
                                            <td className="px-3.5 py-2 text-slate-500">{idx + 1}</td>
                                            <td className="px-3.5 py-2 font-mono text-slate-200">{row.ip}</td>
                                            <td className="px-3.5 py-2">
                                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                                                row.type === 'normal' || row.reason === 'normal' ? 'bg-emerald-500/10 text-emerald-400' :
                                                row.type === 'failed' || row.reason === '连接超时' || row.reason === 'Agent 离线' ? 'bg-rose-500/10 text-rose-400' :
                                                'bg-amber-500/10 text-amber-400'
                                              }`}>
                                                {row.type === 'normal' ? '正常' : row.type === 'abnormal' ? '异常' : row.type === 'failed' ? '失败' : (row.type || row.reason)}
                                              </span>
                                            </td>
                                            <td className="px-3.5 py-2">
                                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                                                row.severity === 'info' ? 'bg-slate-800 text-slate-400' :
                                                row.severity === 'warning' ? 'bg-amber-500/10 text-amber-550' :
                                                'bg-rose-500/10 text-rose-500'
                                              }`}>
                                                {row.severity === 'info' ? '普通' : row.severity === 'warning' ? '警告' : row.severity === 'critical' ? '严重' : row.severity}
                                              </span>
                                            </td>
                                            <td className="px-3.5 py-2 text-slate-300 font-bold">{row.reason || row.impact}</td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* （2）当前对象详情 */}
                            <div className="space-y-3 pt-4 border-t border-slate-800/40">
                              <div className="flex items-center gap-2 pl-3.5 my-3">
                                <div className="w-1.5 h-1.5 rounded-full border border-slate-700 bg-slate-900" />
                                <span className="text-[11px] font-bold text-slate-400">（2）异常对象详情</span>
                              </div>
                              
                              <div className="flex overflow-x-auto no-scrollbar border-b border-slate-800/60 gap-1 mb-2 p-0.5">
                                {data.priorityObjects.map((obj: any) => {
                                  const isSelected = activeReportIp === obj.ip;
                                  const isFailed = obj.type === 'failed' || obj.reason === '连接超时' || obj.reason === 'Agent 离线';
                                  return (
                                    <button
                                      key={obj.ip}
                                      onClick={() => setSelectedReportNodeIp(obj.ip)}
                                      className={`px-3.5 py-2 text-[10px] font-mono font-bold tracking-tight rounded-t-lg border-t border-x transition-all flex items-center gap-1.5 relative top-[1px] ${
                                        isSelected 
                                          ? 'bg-slate-900/60 border-slate-800 text-slate-200 shadow-inner' 
                                          : 'bg-transparent border-transparent text-slate-500 hover:text-slate-400'
                                      }`}
                                    >
                                      <span className={`w-1.5 h-1.5 rounded-full ${isFailed ? 'bg-rose-500' : 'bg-amber-500'}`} />
                                      <span className="font-mono">{obj.ip}</span>
                                      <span className="opacity-70">
                                        ({isFailed ? '失败' : '异常'})
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Subordinate details card panel representing active tab state */}
                              <div className="bg-slate-950/40 border border-slate-800/50 rounded-xl p-4 mt-2.5 space-y-5">
                                {/* 运行时基础指标 */}
                                {activeReportDetails.baseMetrics && (
                                  <div className="space-y-2.5">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                      <div className="w-1 h-1 rounded-full bg-blue-500/60" />
                                      运行时基础指标
                                    </div>
                                    <AnalysisTable title="" columns={['指标名称', '字段 Key', '当前值', '单位 / 状态说明']} data={activeReportDetails.baseMetrics} />
                                  </div>
                                )}

                                {/* 异常判断指标 */}
                                {activeReportDetails.evalMetrics && (
                                  <div className="space-y-2.5 pt-4 border-t border-slate-800/30">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                      <div className="w-1 h-1 rounded-full bg-blue-500/60" />
                                      异常判断指标
                                    </div>
                                    <AnalysisTable title="" columns={['指标', '当前值', '阈值', '状态']} data={activeReportDetails.evalMetrics} />
                                  </div>
                                )}

                                {/* 运行时未采集指标 */}
                                {activeReportDetails.uncollectedMetrics && (
                                  <div className="space-y-2.5 pt-4 border-t border-slate-800/30">
                                    <div className="text-[10px] font-bold text-rose-450 uppercase tracking-wider flex items-center gap-1.5">
                                      <div className="w-1 h-1 rounded-full bg-rose-500/60" />
                                      运行时未采集指标
                                    </div>
                                    <AnalysisTable title="" columns={['检查项', '是否采集', '说明']} data={activeReportDetails.uncollectedMetrics} />
                                  </div>
                                )}

                                {/* 异常判断摘要 */}
                                {activeReportDetails.anomalies && activeReportDetails.anomalies.length > 0 && (
                                  <div className="space-y-2 pt-4 border-t border-slate-800/30">
                                    <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                                      <div className="w-1 h-1 rounded-full bg-rose-500/60" />
                                      异常判断摘要
                                    </div>
                                    <ul className="space-y-1.5 bg-rose-500/[0.01] border border-rose-500/10 rounded-xl p-3.5">
                                      {activeReportDetails.anomalies.map((item: string, idx: number) => (
                                        <li key={idx} className="text-xs text-rose-300 font-medium flex items-center gap-2">
                                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                                          {item}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* failed 分支 */}
                      {branch === 'failed' && (
                        <div className="space-y-4">
                          {/* 1. 巡检计划信息 */}
                          <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4">
                            <div className="flex items-center gap-2.5 mb-3">
                              <div className="w-1 h-3.5 bg-rose-500 rounded-full" />
                              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">1. 巡检计划信息</span>
                            </div>
                            <div className="overflow-x-auto border border-slate-800/60 rounded-xl bg-slate-950/10 overflow-hidden">
                              <table className="w-full text-left border-collapse text-xs">
                                <tbody>
                                  <tr className="border-b border-slate-800/30">
                                    <td className="px-3.5 py-2 font-medium text-slate-400">巡检计划名称</td>
                                    <td className="px-3.5 py-2 font-medium text-slate-200">{data.name}</td>
                                  </tr>
                                  <tr className="border-b border-slate-800/30">
                                    <td className="px-3.5 py-2 font-medium text-slate-400">执行结果</td>
                                    <td className="px-3.5 py-2 font-medium">
                                      <span className="inline-flex items-center justify-center h-5 px-1.5 rounded-sm text-[10px] font-black border uppercase bg-rose-500/10 text-rose-400 border-rose-500/20">
                                        失败 (failed)
                                      </span>
                                    </td>
                                  </tr>
                                  <tr className="border-b border-slate-800/30">
                                    <td className="px-3.5 py-2 font-medium text-slate-400">执行时间</td>
                                    <td className="px-3.5 py-2 font-medium text-slate-200">{data.updatedAt}</td>
                                  </tr>
                                  <tr>
                                    <td className="px-3.5 py-2 font-medium text-slate-400">严重级别</td>
                                    <td className="px-3.5 py-2 font-medium">
                                      <span className="inline-flex items-center justify-center h-5 px-1.5 rounded-sm text-[10px] font-black border uppercase bg-rose-500/10 text-rose-500 border-rose-500/20">
                                        严重 (critical)
                                      </span>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* 2. 巡检对象统计 */}
                          {data.stage1?.objectStats && (
                            <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4">
                              <div className="flex items-center gap-2.5 mb-3">
                                <div className="w-1 h-3.5 bg-rose-500 rounded-full" />
                                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">2. 巡检对象统计</span>
                              </div>
                              <div className="overflow-x-auto border border-slate-800/60 rounded-xl bg-slate-950/10 overflow-hidden">
                                <table className="w-full text-left border-collapse text-xs">
                                  <thead>
                                    <tr className="border-b border-slate-800/80 bg-slate-900/30 text-slate-400">
                                      <th className="px-3.5 py-2 font-bold uppercase tracking-wider">统计项</th>
                                      <th className="px-3.5 py-2 font-bold uppercase tracking-wider text-right">数量</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {data.stage1.objectStats.map((row: any[], idx: number) => (
                                      <tr key={idx} className="border-b border-slate-800/30 last:border-0 hover:bg-white/[0.01]">
                                        <td className="px-3.5 py-2 font-medium text-slate-400">{row[0]}</td>
                                        <td className="px-3.5 py-2 font-mono text-slate-200 text-right">{row[1]}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {/* 3. 全部巡检对象列表 */}
                          {data.stage1?.objectsTable && (
                            <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4 space-y-2">
                              <div className="flex items-center gap-2.5 mb-3">
                                <div className="w-1 h-3.5 bg-rose-500 rounded-full" />
                                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">3. 全部巡检对象列表</span>
                              </div>
                              <AnalysisTable 
                                title="" 
                                columns={['#', '巡检对象', '结果', '严重级别', '摘要']} 
                                data={isObjectsExpanded ? data.stage1.objectsTable : data.stage1.objectsTable.slice(0, 5)} 
                              />
                              {data.stage1.objectsTable.length > 5 && (
                                <div className="flex justify-center mt-2.5">
                                  <button 
                                    onClick={() => setIsObjectsExpanded(!isObjectsExpanded)}
                                    className="px-4 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 rounded-lg transition-all active:scale-95 flex items-center gap-1 shadow-md shadow-black/10"
                                  >
                                    {isObjectsExpanded ? '收起巡检对象列表 ↑' : '查看全部巡检对象列表 ↓'}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* 4. 重点失败对象 */}
                          <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4 space-y-6">
                            <div className="flex items-center gap-2 border-b border-slate-800/40 pb-2 mb-1">
                              <div className="w-1 h-3.5 bg-rose-500 rounded-full" />
<span className="text-xs font-bold text-slate-200 uppercase tracking-wider">4. 重点失败对象</span>
                            </div>

                            {/* （1）重点失败对象列表 */}
                            {data.priorityObjects && (
                              <div className="space-y-3">
                                <div className="text-[10px] font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                                  <div className="w-1.5 h-2.5 bg-rose-500 rounded-sm" />
                                  （1）重点失败对象列表
                                </div>
                                <div className="overflow-x-auto border border-slate-800/60 rounded-xl bg-slate-950/10 overflow-hidden">
                                  <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                      <tr className="border-b border-slate-800/80 bg-slate-900/30 text-slate-400 font-bold uppercase tracking-wider">
                                        <th className="px-3.5 py-2">#</th>
                                        <th className="px-3.5 py-2">对象</th>
                                        <th className="px-3.5 py-2">失败原因</th>
                                        <th className="px-3.5 py-2">严重级别</th>
                                        <th className="px-3.5 py-2">影响</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {data.priorityObjects.slice(0, 5).map((row: any, idx: number) => {
                                        const isSelected = activeReportIp === row.ip;
                                        return (
                                          <tr 
                                            key={idx} 
                                            onClick={() => setSelectedReportNodeIp(row.ip)}
                                            className={`border-b border-slate-800/30 last:border-0 hover:bg-white/[0.02] cursor-pointer transition-colors ${isSelected ? 'bg-blue-600/10 font-bold' : ''}`}
                                          >
                                            <td className="px-3.5 py-2 text-slate-500">{idx + 1}</td>
                                            <td className="px-3.5 py-2 font-mono text-slate-200">{row.ip}</td>
                                            <td className="px-3.5 py-2">
                                              <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-rose-500/10 text-rose-400">
                                                {row.reason}
                                              </span>
                                            </td>
                                            <td className="px-3.5 py-2">
                                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                                                row.severity === 'info' ? 'bg-slate-800 text-slate-400' :
                                                row.severity === 'warning' ? 'bg-amber-500/10 text-amber-550' :
                                                'bg-rose-500/10 text-rose-500'
                                              }`}>
                                                {row.severity === 'info' ? '普通' : row.severity === 'warning' ? '警告' : row.severity === 'critical' ? '严重' : row.severity}
                                              </span>
                                            </td>
                                            <td className="px-3.5 py-2 text-slate-300 font-bold">{row.impact}</td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* （2）当前对象详情 */}
                            <div className="space-y-3 pt-4 border-t border-slate-800/40">
                              <div className="text-[10px] font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                                <div className="w-1.5 h-2.5 bg-rose-500 rounded-sm" />
                                （2）当前对象详情
                              </div>
                              <div className="flex overflow-x-auto no-scrollbar border-b border-slate-800/60 gap-1 mb-2 p-0.5">
                                {data.priorityObjects.map((obj: any) => {
                                  const isSelected = activeReportIp === obj.ip;
                                  const isFailed = obj.type === 'failed' || obj.reason === '连接超时' || obj.reason === 'Agent 离线';
                                  return (
                                    <button
                                      key={obj.ip}
                                      onClick={() => setSelectedReportNodeIp(obj.ip)}
                                      className={`px-3.5 py-2 text-[10px] font-mono font-bold tracking-tight rounded-t-lg border-t border-x transition-all flex items-center gap-1.5 relative top-[1px] ${
                                        isSelected 
                                          ? 'bg-slate-900/60 border-slate-800 text-slate-200 shadow-inner' 
                                          : 'bg-transparent border-transparent text-slate-500 hover:text-slate-400'
                                      }`}
                                    >
                                      <span className={`w-1.5 h-1.5 rounded-full ${isFailed ? 'bg-rose-500' : 'bg-amber-500'}`} />
                                      <span className="font-mono">{obj.ip}</span>
                                      <span className="opacity-70">
                                        ({isFailed ? '失败' : '异常'})
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>

                              {activeReportDetails.uncollectedMetrics && (
                                <div className="pt-3 border-t border-slate-800/40">
                                  <AnalysisTable title="未采集指标说明" columns={['检查项', '是否采集', '说明']} data={activeReportDetails.uncollectedMetrics} />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </section>

                    {/* Phase 2: 分析指标发展路径 / 路径与证据探索 / 失败证据说明 */}
                    <section className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-slate-800/40 pb-2 mb-4">
                        <h3 className="text-base font-black text-slate-100 tracking-tight flex items-center gap-2">
                          二、{branch === 'normal' ? '指标健康与趋势' : branch === 'abnormal' ? '指标趋势与数据演进' : '采集失败证据说明'} (Trends & Evidences)
                        </h3>
                      </div>

                      {/* normal 分支 */}
                      {branch === 'normal' && (
                        <div className="space-y-4">
                          {data.stage2?.trendTable && (
                            <AnalysisTable 
                              title="CPU 使用率趋势概览（近 30 分钟）" 
                              columns={['巡检对象', '10:00', '10:10', '10:20', '10:30', '趋势']} 
                              data={data.stage2.trendTable.map((row: any) => [row[0], row[1], row[3], row[5], row[7], row[8]])} 
                            />
                          )}
                          {data.stage2?.trendSummary && (
                            <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 mt-2">
                              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">健康趋势摘要</div>
                              <p className="text-xs text-slate-300 leading-relaxed font-medium">{data.stage2.trendSummary}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* abnormal 分支 */}
                      {branch === 'abnormal' && (() => {
                        const abnormalIps = ['172.30.34.73:8001', '172.30.34.81:8001'];
                        const labels = ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25', '10:30'];
                        
                        const cpuLines = abnormalIps.map((ip, idx) => {
                          const details = data.nodeDetails?.[ip] || getFallbackNodeDetails(ip, 'abnormal');
                          const chart = details?.charts?.find((c: any) => c.title.includes('CPU'));
                          return {
                            name: ip,
                            data: chart ? chart.data : [0,0,0,0,0,0,0],
                            color: idx === 0 ? '#f43f5e' : '#3b82f6'
                          };
                        });
                        
                        const memoryLines = abnormalIps.map((ip, idx) => {
                          const details = data.nodeDetails?.[ip] || getFallbackNodeDetails(ip, 'abnormal');
                          const chart = details?.charts?.find((c: any) => c.title.includes('内存') || c.title.includes('Memory'));
                          return {
                            name: ip,
                            data: chart ? chart.data : [0,0,0,0,0,0,0],
                            color: idx === 0 ? '#f43f5e' : '#3b82f6'
                          };
                        });

                        const errorLines = [
                          { name: '172.30.34.73:8001', data: [0.5, 0.8, 1.0, 1.5, 2.2, 2.8, 3.2], color: '#f43f5e' },
                          { name: '172.30.34.81:8001', data: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], color: '#3b82f6' }
                        ];

                        const isFailedNode = activeReportDetails.detailTable.find((r: any) => r[0] === '结果')?.[1] === 'failed';

                        return (
                          <div className="space-y-6">
                            {/* 1. 指标趋势概览表 */}
                            {data.stage2?.trendTable && (
                              <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4">
                                <div className="flex items-center gap-2.5 mb-3">
                                  <div className="w-1 h-3.5 bg-purple-500 rounded-full" />
                                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">1. 指标趋势概览表</span>
                                </div>
                                <AnalysisTable 
                                  title="" 
                                  columns={['巡检对象', '10:00', '10:10', '10:20', '10:30', '趋势']} 
                                  data={data.stage2.trendTable.slice(0, 10).map((row: any) => [row[0], row[1], row[3], row[5], row[7], row[8]])} 
                                />
                                {data.stage2.trendTable.length > 10 && (
                                  <div className="flex justify-center mt-2.5">
                                    <button 
                                      onClick={() => {
                                        setReportModalTitle('指标趋势概览表 - 全部指标数据');
                                        setReportModalMetrics(data.stage2.trendTable.map((row: any) => [row[0], row[1], row[3], row[5], row[7], row[8]]));
                                        setIsReportMetricsModalOpen(true);
                                      }}
                                      className="px-4 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 rounded-lg transition-all active:scale-95 flex items-center gap-1 shadow-md shadow-black/10"
                                    >
                                      查看全部指标 ↓
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* 2. 异常对象趋势图 */}
                            <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4">
                              <div className="flex items-center gap-2.5 mb-3">
                                <div className="w-1 h-3.5 bg-purple-500 rounded-full" />
                                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">2. 异常对象趋势图</span>
                              </div>
                              <div className="space-y-3">
                                <MultiLineTrendChart title="CPU 使用率趋势图 (所有异常对象)" labels={labels} lines={cpuLines} />
                                <MultiLineTrendChart title="内存使用率趋势图 (所有异常对象)" labels={labels} lines={memoryLines} />
                                <MultiLineTrendChart title="错误率趋势图 (所有异常对象)" labels={labels} lines={errorLines} />
                              </div>
                            </div>

                            {/* 3. 历史对比表 */}
                            <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4">
                              <div className="flex items-center gap-2.5 mb-3">
                                <div className="w-1 h-3.5 bg-purple-500 rounded-full" />
                                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">3. 历史对比表</span>
                              </div>
                                                              {data.priorityObjects && data.priorityObjects.length >= 2 ? (
                                  <div className="flex items-center flex-wrap gap-2.5 my-2">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">分析对象:</span>
                                    <div className="flex flex-wrap gap-1.5">
                                      {data.priorityObjects.map((node: any) => {
                                        const isSelected = activeReportIp === node.ip;
                                        return (
                                          <button
                                            key={node.ip}
                                            onClick={() => setSelectedReportNodeIp(node.ip)}
                                            className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                                              isSelected
                                                ? 'bg-blue-500/20 text-blue-400 border-blue-500/50 font-bold shadow-sm shadow-blue-500/10'
                                                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                                            }`}
                                          >
                                            {node.ip}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-[10px] text-slate-500 font-mono tracking-tight my-2">
                                    分析对象: {activeReportIp}
                                  </div>
                                )}
                              {isFailedNode ? (
                                <div className="bg-slate-950/20 border border-slate-800 rounded-lg p-3 text-center text-slate-500 text-xs">
                                  当前对象无可用历史对比数据
                                </div>
                              ) : (
                                activeReportDetails.historyTable && activeReportDetails.historyTable.length > 0 ? (
                                  <AnalysisTable 
                                    title="" 
                                    columns={['指标', '当前值', '昨日同时间', '阈值', '对比结论']} 
                                    data={activeReportDetails.historyTable} 
                                  />
                                ) : (
                                  <div className="bg-slate-950/20 border border-slate-800 rounded-lg p-3 text-center text-slate-500 text-xs">
                                    当前对象无可用历史对比数据
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* failed 分支 */}
                      {branch === 'failed' && (
                        <div className="space-y-4">
                          {data.stage2?.failedDistribution && (
                            <AnalysisTable 
                              title="失败对象分布表" 
                              columns={['失败原因', '对象数量', '示例对象']} 
                              data={data.stage2.failedDistribution} 
                            />
                          )}
                          {data.stage2?.failedImpact && (
                            <AnalysisTable 
                              title="失败影响范围" 
                              columns={['影响项', '内容']} 
                              data={data.stage2.failedImpact} 
                            />
                          )}
                        </div>
                      )}
                    </section>

                    {/* Phase 3: 健康状态判断 / 根因分析 / 失败原因判断 */}
                    <section className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-slate-800/40 pb-2 mb-4">
                        <h3 className="text-base font-black text-slate-100 tracking-tight flex items-center gap-2">
                          三、{branch === 'normal' ? '健康状态审查' : branch === 'abnormal' ? '深度根因剖析与诊断依据' : '原因归纳与排查建议'} (Diagnostics & Analysis)
                        </h3>
                      </div>

                      {/* normal 分支 */}
                      {branch === 'normal' && (
                        <div className="space-y-4">
                          {data.stage3?.judgmentTable && (
                            <AnalysisTable 
                              title="健康判断表" 
                              columns={['判断项', '结果', '说明']} 
                              data={data.stage3.judgmentTable} 
                            />
                          )}
                          {data.stage3?.evidenceList && (
                            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-1 h-3.5 bg-blue-500 rounded-full" />
<span className="text-xs font-bold text-slate-200 uppercase tracking-wider">关键依据</span>
                              </div>
                              <ul className="space-y-1.5">
                                {data.stage3.evidenceList.map((e: string, i: number) => (
                                  <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-blue-500" /> {e}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                                                                                                                                    {/* abnormal 分支 */}
                      {branch === 'abnormal' && (
                        <div className="space-y-6">
                          {data.priorityObjects && data.priorityObjects.length >= 2 ? (
                            <div className="space-y-6">
                              {data.priorityObjects.map((node: any) => {
                                const nodeIp = node.ip;
                                const nodeDetails = data.nodeDetails?.[nodeIp] || getFallbackNodeDetails(nodeIp, branch);
                                const isFailedNode = nodeDetails.detailTable?.find((r: any) => r[0] === '结果')?.[1] === 'failed';
                                
                                return (
                                  <div key={nodeIp} className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4 space-y-4">
                                    <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-1">
                                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                      <span className="text-[11px] font-bold text-blue-400 font-mono">诊断对象: {nodeIp}</span>
                                    </div>

                                    {isFailedNode ? (
                                      <div className="bg-slate-950/20 border border-slate-800 rounded-lg p-4 text-center text-slate-500 text-xs">
                                        当前对象为巡检失败，无法基于指标进行根因分析
                                      </div>
                                    ) : (
                                      <div className="space-y-4">
                                        {/* 1. 根因候选表 */}
                                        {nodeDetails.diagnosis?.candidates && (
                                          <div className="space-y-2">
                                            <div className="flex items-center gap-2 pl-3.5 my-2">
                                              <div className="w-1.5 h-1.5 rounded-full border border-slate-700 bg-slate-900" />
                                              <span className="text-[11px] font-bold text-slate-400">1. 根因候选表</span>
                                            </div>
                                            <AnalysisTable 
                                              title="" 
                                              columns={['可能原因', '支撑证据', '说明']} 
                                              data={nodeDetails.diagnosis.candidates} 
                                            />
                                          </div>
                                        )}

                                        {/* 2. 关键证据总结 */}
                                        {nodeDetails.diagnosis?.evidences && (
                                          <div className="space-y-2">
                                            <div className="flex items-center gap-2 pl-3.5 my-2">
                                              <div className="w-1.5 h-1.5 rounded-full border border-slate-700 bg-slate-900" />
                                              <span className="text-[11px] font-bold text-slate-400">2. 关键证据总结</span>
                                            </div>
                                            <ul className="space-y-1.5 bg-[#0a0a0f] border border-slate-800 rounded-xl p-4">
                                              {nodeDetails.diagnosis.evidences.map((e: string, i: number) => (
                                                <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                                                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" /> {e}
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4 space-y-4">
                              <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                <span className="text-[11px] font-bold text-blue-400 font-mono">诊断对象: {activeReportIp}</span>
                              </div>
                              
                              {(() => {
                                const isFailedNode = activeReportDetails.detailTable?.find((r: any) => r[0] === '结果')?.[1] === 'failed';
                                if (isFailedNode) {
                                  return (
                                    <div className="bg-slate-950/20 border border-slate-800 rounded-lg p-4 text-center text-slate-500 text-xs">
                                      当前对象为巡检失败，无法基于指标进行根因分析
                                    </div>
                                  );
                                }
                                return (
                                  <div className="space-y-4">
                                    {/* 1. 根因候选表 */}
                                    {activeReportDetails.diagnosis?.candidates && (
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2 pl-3.5 my-2">
                                          <div className="w-1.5 h-1.5 rounded-full border border-slate-700 bg-slate-900" />
                                          <span className="text-[11px] font-bold text-slate-400">1. 根因候选表</span>
                                        </div>
                                        <AnalysisTable 
                                          title="" 
                                          columns={['可能原因', '支撑证据', '说明']} 
                                          data={activeReportDetails.diagnosis.candidates} 
                                        />
                                      </div>
                                    )}

                                    {/* 2. 关键证据总结 */}
                                    {activeReportDetails.diagnosis?.evidences && (
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2 pl-3.5 my-2">
                                          <div className="w-1.5 h-1.5 rounded-full border border-slate-700 bg-slate-900" />
                                          <span className="text-[11px] font-bold text-slate-400">2. 关键证据总结</span>
                                        </div>
                                        <ul className="space-y-1.5 bg-[#0a0a0f] border border-slate-800 rounded-xl p-4">
                                          {activeReportDetails.diagnosis.evidences.map((e: string, i: number) => (
                                            <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                                              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" /> {e}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      )}
                      
{/* failed 分支 */}
                      {branch === 'failed' && data.stage3 && (
                        <div className="space-y-6">
                          {/* 1. 失败原因归纳表 */}
                          {data.stage3.reasonsTable && (
                            <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4">
                              <div className="flex items-center gap-2.5 mb-3">
                                <div className="w-1 h-3.5 bg-purple-500 rounded-full" />
                                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">1. 失败原因归纳表</span>
                              </div>
                              <AnalysisTable 
                                title="" 
                                columns={['失败原因', '失败对象数', '示例对象', '支撑信息', '说明']} 
                                data={data.stage3.reasonsTable} 
                              />
                            </div>
                          )}

                          {/* 2. 失败原因占比 */}
                          {data.stage3.ratioTable && (
                            <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4">
                              <div className="flex items-center gap-2.5 mb-3">
                                <div className="w-1 h-3.5 bg-purple-500 rounded-full" />
                                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">2. 失败原因占比</span>
                              </div>
                              <AnalysisTable 
                                title="" 
                                columns={['失败原因', '对象数', '占失败对象比例']} 
                                data={data.stage3.ratioTable} 
                              />
                            </div>
                          )}

                          {/* 3. 失败原因判断 */}
                          {data.stage3.judgments && (
                            <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-1 h-3.5 bg-purple-500 rounded-full" />
<span className="text-xs font-bold text-slate-200 uppercase tracking-wider">3. 失败原因判断</span>
                              </div>
                              <ul className="space-y-1.5">
                                {data.stage3.judgments.map((item: string, idx: number) => (
                                  <li key={idx} className="text-xs text-slate-200 font-bold flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full shrink-0 mt-1.5" /> 
                                    <span className="leading-relaxed">{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* 4. 未确认信息 */}
                          {data.stage3.unconfirmed && (
                            <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-1 h-3.5 bg-amber-500 rounded-full" />
<span className="text-xs font-bold text-slate-200 uppercase tracking-wider">4. 未确认信息</span>
                              </div>
                              <ul className="space-y-1.5">
                                {data.stage3.unconfirmed.map((item: string, idx: number) => (
                                  <li key={idx} className="text-xs text-slate-200 font-bold flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0 mt-1.5" /> 
                                    <span className="leading-relaxed">{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* 5. 阶段结论 */}
                          {data.stage3.conclusion && (
                            <div className="bg-gradient-to-r from-purple-500/[0.03] to-transparent border border-purple-500/10 rounded-xl p-4 relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-purple-500/40 to-transparent" />
                              <div className="text-[11px] text-slate-400 font-bold mb-2">5. 阶段结论</div>
                              <p className="text-xs text-slate-200 font-bold leading-relaxed">{data.stage3.conclusion}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </section>

                    {/* Phase 4: 最终建议 */}
                    <section className="space-y-6 pb-6">
                      <div className="flex items-center gap-3 border-b border-slate-800/40 pb-2 mb-4">
                        <h3 className="text-base font-black text-slate-100 tracking-tight flex items-center gap-2">
                          四、{branch === 'normal' ? '审定结论与后续策略' : branch === 'abnormal' ? '处置决策与修复方案' : '失败总结与自愈处置'} (Verdict & Remediation)
                        </h3>
                      </div>

                      {/* normal 分支 */}
                      {branch === 'normal' && (
                        <div className="space-y-4">
                          {data.stage4?.verdictTable && (
                            <AnalysisTable title="巡检结果概览" columns={['维度', '内容']} data={data.stage4.verdictTable} />
                          )}
                          
                           {data.stage4?.verdictJudgments && (
                            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-1 h-3.5 bg-blue-500 rounded-full" />
<span className="text-xs font-bold text-slate-200 uppercase tracking-wider">当前判断</span>
                              </div>
                              <ul className="space-y-1.5">
                                {data.stage4.verdictJudgments.map((item: string, idx: number) => (
                                  <li key={idx} className="text-xs text-slate-200 font-bold flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" /> {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {data.stage4?.verdictSuggestions && (
                            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-1 h-3.5 bg-emerald-500 rounded-full" />
<span className="text-xs font-bold text-slate-200 uppercase tracking-wider">总体建议</span>
                              </div>
                              <ul className="space-y-1.5">
                                {data.stage4.verdictSuggestions.map((item: string, idx: number) => (
                                  <li key={idx} className="text-xs text-slate-200 font-bold flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" /> {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                                                                                                                                     {/* abnormal 分支 */}
                      {branch === 'abnormal' && activeReportDetails.verdict && (
                        <div className="space-y-6">
                          {/* 1. 问题汇总与关键发现 */}
                          <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4 space-y-3">
                            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-1">
                              <div className="w-1.5 h-3.5 bg-blue-500 rounded-full" />
                              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">1. 问题汇总与关键发现</span>
                            </div>
                            <div className="bg-blue-950/10 border border-blue-500/10 rounded-xl p-4 text-xs text-slate-300 leading-relaxed space-y-3 shadow-inner">
                              <p className="font-medium">
                                经巡检多维关联分析，当前巡检计划下共发现 <span className="text-rose-400 font-bold">2</span> 个异常实例和 <span className="text-amber-400 font-bold">1</span> 个失败实例，核心关键发现如下：
                              </p>
                              <ul className="space-y-2.5">
                                <li className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0 mt-1.5" />
                                  <span>
                                    对于 <strong className="font-mono text-rose-300">172.30.34.73:8001</strong>：系统检测到其 CPU 使用率异常升高（达 <strong>92%</strong>）且内存使用率接近上限（达 <strong>88%</strong>），呈现明显的双高压力，同时伴随错误率 the 异常波动。
                                  </span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0 mt-1.5" />
                                  <span>
                                    对于 <strong className="font-mono text-rose-300">172.30.34.81:8001</strong>：系统检测到其 activity 文件描述符数（FD Count）达到 <strong>980</strong> 并单调上升，已高度逼近单实例 resource 上限，存在显著 of 连接/句柄泄漏风险。
                                  </span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0 mt-1.5" />
                                  <span>
                                    对于 <strong className="font-mono text-amber-300">172.30.34.90:8001</strong>：该实例在巡检期间连接超时（Connection Timeout），端口无法访问，提示处于服务阻断或宕机状态。
                                  </span>
                                </li>
                              </ul>
                              <p className="text-[11px] text-slate-400 border-t border-slate-800/40 pt-2 mt-1">
                                ※ 总体判定：两台异常实例分别存在高负载和句柄泄漏风险，一台失败实例疑似宕机或网络阻断。均需尽快执行排查或自愈预案。
                              </p>
                            </div>
                          </div>

                          {/* 2. 自愈与处置修复方案 */}
                          <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4 space-y-3">
                            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-1">
                              <div className="w-1.5 h-3.5 bg-emerald-500 rounded-full" />
                              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">2. 自愈与处置修复方案</span>
                            </div>
                            <div className="overflow-hidden border border-slate-800 rounded-xl bg-slate-950/10">
                              <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                  <tr className="border-b border-slate-800 bg-slate-950/30 text-slate-400 font-medium">
                                    <th className="px-3.5 py-2.5 font-semibold">异常实例</th>
                                    <th className="px-3.5 py-2.5 font-semibold">根因诊断结论</th>
                                    <th className="px-3.5 py-2.5 font-semibold">建议处置措施</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="border-b border-slate-800/30 hover:bg-slate-900/10">
                                    <td className="px-3.5 py-3 font-mono text-slate-200 font-bold break-all whitespace-normal min-w-[120px]">172.30.34.73:8001</td>
                                    <td className="px-3.5 py-3 text-slate-300 break-words whitespace-normal min-w-[160px]">系统资源双高压力，疑似内存泄漏与突增负载叠加。</td>
                                    <td className="px-3.5 py-3 text-slate-300 break-words whitespace-normal min-w-[200px]">
                                      1. 建议人工介入 Dump 堆内存进行泄漏点 analysis；<br />
                                      2. 临时进行实例重启或扩容释放 CPU / 内存压力，保障服务可用性。
                                    </td>
                                  </tr>
                                  <tr className="border-b border-slate-800/30 hover:bg-slate-900/10">
                                    <td className="px-3.5 py-3 font-mono text-slate-200 font-bold break-all whitespace-normal min-w-[120px]">172.30.34.81:8001</td>
                                    <td className="px-3.5 py-3 text-slate-300 break-words whitespace-normal min-w-[160px]">文件描述符计数（FD Count）单调递增，发生连接句柄泄漏。</td>
                                    <td className="px-3.5 py-3 text-slate-300 break-words whitespace-normal min-w-[200px]">
                                      1. 检查底层 TCP 连接及网络套接字释放逻辑；<br />
                                      2. 在测试环境复现连接 management 逻辑并定位未关闭连接句柄的代码段。
                                    </td>
                                  </tr>
                                  <tr className="hover:bg-slate-900/10">
                                    <td className="px-3.5 py-3 font-mono text-slate-200 font-bold break-all whitespace-normal min-w-[120px]">172.30.34.90:8001</td>
                                    <td className="px-3.5 py-3 text-slate-300 break-words whitespace-normal min-w-[160px]">巡检连接超时，实例可能发生宕机或网络策略拦截。</td>
                                    <td className="px-3.5 py-3 text-slate-300 break-words whitespace-normal min-w-[200px]">
                                      1. 检查目标节点服务端口监听与网络可达性；<br />
                                      2. 核验防火墙或安全组拦截规则；<br />
                                      3. 确认进程/容器存活状态，必要时执行实例重启。
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}
                      
{/* failed 分支 */}
                       {branch === 'failed' && data.stage4 && (
                         <div className="space-y-6">
                           {/* 1. 失败结果概览 */}
                           {data.stage4.verdictTable && (
                             <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4">
                               <div className="flex items-center gap-2.5 mb-3">
                                 <div className="w-1 h-3.5 bg-rose-500 rounded-full" />
                                 <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">1. 失败结果概览</span>
                               </div>
                               <AnalysisTable 
                                 title="" 
                                 columns={['维度', '内容']} 
                                 data={data.stage4.verdictTable} 
                               />
                             </div>
                           )}

                           {/* 2. 关键发现 */}
                           {data.stage4.findings && (
                             <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4">
                               <div className="flex items-center gap-2 mb-3">
                                 <div className="w-1 h-3.5 bg-rose-500 rounded-full" />
<span className="text-xs font-bold text-slate-200 uppercase tracking-wider">2. 关键发现</span>
                               </div>
                               <ul className="space-y-1.5">
                                 {data.stage4.findings.map((item: string, idx: number) => (
                                   <li key={idx} className="text-xs text-slate-200 font-bold flex items-start gap-2">
                                     <div className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0 mt-1.5" /> 
                                     <span className="leading-relaxed">{item}</span>
                                   </li>
                                 ))}
                               </ul>
                             </div>
                           )}

                           {/* 3. 当前判断 */}
                           {data.stage4.judgments && (
                             <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4">
                               <div className="flex items-center gap-2 mb-3">
                                 <div className="w-1 h-3.5 bg-rose-500 rounded-full" />
<span className="text-xs font-bold text-slate-200 uppercase tracking-wider">3. 当前判断</span>
                               </div>
                               <ul className="space-y-1.5">
                                 {data.stage4.judgments.map((item: string, idx: number) => (
                                   <li key={idx} className="text-xs text-slate-200 font-bold flex items-start gap-2">
                                     <div className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0 mt-1.5" /> 
                                     <span className="leading-relaxed">{item}</span>
                                   </li>
                                 ))}
                               </ul>
                             </div>
                           )}

                           {/* 4. 总体建议 */}
                           {data.stage4.recommendationsTable && (
                             <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4 space-y-4">
                               <div className="flex items-center gap-2.5 mb-3">
                                 <div className="w-1 h-3.5 bg-rose-500 rounded-full" />
                                 <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">4. 总体建议</span>
                               </div>
                               
                               <AnalysisTable 
                                 title="" 
                                 columns={['失败原因', '建议动作']} 
                                 data={data.stage4.recommendationsTable} 
                               />

                               {data.stage4.supplementaryRecommendations && (
                                 <div className="bg-gradient-to-r from-rose-500/[0.03] to-transparent border border-rose-500/10 rounded-xl p-4 relative overflow-hidden mt-3">
                                   <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-rose-500/40 to-transparent" />
                                   <ul className="space-y-1.5">
                                     {data.stage4.supplementaryRecommendations.map((item: string, idx: number) => (
                                       <li key={idx} className="text-[11px] text-slate-300 font-bold leading-relaxed flex items-start gap-2">
                                         <div className="w-1.5 h-1.5 rounded-full bg-rose-500/30 shrink-0 mt-1.5" /> 
                                         <span>{item}</span>
                                       </li>
                                     ))}
                                   </ul>
                                 </div>
                               )}
                             </div>
                           )}
                         </div>
                       )}
                     
                     {/* Report Footer / Signature / Disclaimer */}
                     <div className="border-t border-slate-800/60 pt-6 mt-12 text-[10px] text-slate-500 font-mono space-y-2 pb-16">
                       <div className="flex justify-between items-center">
                         <span>报告审定签名: SRE-AI AUTOPILOT ENGINE V3.2</span>
                         <span>数据源校验: PROMETHEUS / TEGRAF API OK</span>
                       </div>
                       <p className="leading-relaxed">
                         声明：本诊断报告是基于当前检查点前后30分钟内的时序指标、进程日志及配置快照，通过AI自愈分析引擎自动推导生成。报告中的诊断候选根因、置信度及操作命令仅作为辅助排查决策参考，高危变更执行前请由人工二次核验确认，本系统不对执行变更产生的二次影响承担责任。
                       </p>
                     </div>
                    </section>
                  </>
                ) : (
                  <>
                    {/* Section 1: Fault Overview */}
                    <section className="space-y-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-6 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                          <h3 className="text-lg font-bold text-slate-100 uppercase tracking-tight">1. 故障概述 (Fault Overview)</h3>
                        </div>
                        {data.confidence && (
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            <span className="text-[10px] font-bold text-emerald-400">AI 置信度: {data.confidence}</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="p-4 bg-slate-900/40 border border-white/[0.03] rounded-xl">
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">故障时间</div>
                            <div className="text-sm font-medium text-slate-200">{data.updatedAt || new Date().toLocaleString()}</div>
                          </div>
                          <div className="p-4 bg-slate-900/40 border border-white/[0.03] rounded-xl">
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">受影响节点</div>
                            <div className="text-sm font-medium text-slate-200 font-mono italic">{data.node || 'payment-gateway-0'}</div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="p-4 bg-slate-900/40 border border-white/[0.03] rounded-xl">
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">故障现象</div>
                            <div className="text-sm font-medium text-slate-200">{data.summary || '未知异常'}</div>
                          </div>
                          <div className="p-4 bg-slate-900/40 border border-white/[0.03] rounded-xl">
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">诊断引擎</div>
                            <div className="text-sm font-medium text-slate-200">多智能体协同诊断引擎 (V3.2)</div>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Section 2: Fault Details */}
                    <section className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                        <h3 className="text-lg font-bold text-slate-100 uppercase tracking-tight">2. 故障详情与链路 (Fault Details & Trace)</h3>
                      </div>
                      
                      <div className="p-5 bg-slate-900/20 border border-white/[0.05] rounded-2xl space-y-4">
                        <div className="text-xs text-slate-400 font-medium">✨ 受影响拓扑节点分布：</div>
                        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scroll-hidden py-1">
                          {(data.topology || ['服务A', '服务B', '服务C']).map((node: string, i: number) => (
                            <React.Fragment key={i}>
                              <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-center gap-2 font-mono italic text-xs text-slate-200">
                                <Monitor size={12} className="text-blue-400" />
                                {node}
                              </div>
                              {i < (data.topology?.length || 0) - 1 && <ArrowRight size={14} className="text-slate-700 shrink-0" />}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </section>

                    {/* Section 3: Root Cause Analysis */}
                    <section className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                        <h3 className="text-lg font-bold text-slate-100 uppercase tracking-tight">3. 根因推导与依据 (Root Cause Analysis)</h3>
                      </div>

                      <div className="p-5 bg-amber-500/[0.03] border border-amber-500/10 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                        <h4 className="text-sm font-black text-amber-400 mb-3 flex items-center gap-2">智能诊断链条记录</h4>
                        <div className="space-y-4 text-xs text-slate-300 font-medium leading-relaxed">
                          <p>{data.conclusion || '诊断中...'}</p>
                        </div>
                      </div>
                    </section>

                    {/* Section 4: Self-Healing Suggestion */}
                    <section className="space-y-6 pb-20">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        <h3 className="text-lg font-bold text-slate-100 uppercase tracking-tight">4. 处置建议与一键自愈 (Remediation & Self-Healing)</h3>
                      </div>

                      {data.recommendations && data.recommendations.length > 0 && (
                        <div className="space-y-3">
                          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">智能决策推荐的处置动作</div>
                          <div className="grid gap-3">
                            {data.recommendations.map((rec: any, i: number) => (
                              <div key={i} className="p-4 bg-slate-900/40 border border-white/[0.03] rounded-xl flex items-center justify-between group hover:border-emerald-500/20 transition-all">
                                <div>
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-xs font-bold text-slate-200">{rec.action}</span>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${rec.risk === '低' || rec.risk === '极低' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>Risk: {rec.risk}</span>
                                  </div>
                                  <p className="text-xs text-slate-500 font-medium">{rec.desc}</p>
                                </div>
                                <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all active:scale-95 flex items-center gap-1.5 shadow-lg shadow-emerald-950/20 border border-emerald-500/10">
                                  <Zap size={12} fill="currentColor" /> 执行
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </section>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
      
      <AllMetricsModal 
        isOpen={isReportMetricsModalOpen}
        onClose={() => setIsReportMetricsModalOpen(false)}
        title={reportModalTitle}
        data={reportModalMetrics}
      />
    </AnimatePresence>
  );
};















const AnalysisTable = ({ title, columns, data }: { title?: string, columns: string[], data: any[][] }) => (
  <div className="w-full my-3">
    {title && (
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
        <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{title}</span>
      </div>
    )}
    <div className="overflow-x-auto no-scrollbar border border-slate-800/60 rounded-xl bg-slate-950/10 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800/80 bg-slate-900/30">
            {columns.map((col, i) => (
              <th key={i} className="px-3.5 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-slate-800/30 last:border-0 hover:bg-white/[0.01]">
              {row.map((cell, j) => {
                let displayCell = cell;
                if (cell === 'normal') displayCell = '正常';
                else if (cell === 'abnormal') displayCell = '异常';
                else if (cell === 'failed') displayCell = '失败';
                else if (cell === 'completed') displayCell = '已完成';
                else if (cell === 'warning') displayCell = '警告';
                else if (cell === 'critical') displayCell = '严重';
                else if (cell === 'info') displayCell = '普通';

                return (
                  <td key={j} className="px-3.5 py-2 text-xs font-medium text-slate-300 break-words whitespace-normal min-w-[80px]">
                    {displayCell === '异常' || displayCell === '未存活' || displayCell === '失败' || displayCell === '严重' || displayCell === '突增' ? (
                      <span className="inline-flex items-center justify-center h-5 px-1.5 rounded-sm text-[10px] font-black bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase">
                        {displayCell}
                      </span>
                    ) : displayCell === '偏高' || displayCell === '警告' || displayCell === '稳步上升' ? (
                      <span className="inline-flex items-center justify-center h-5 px-1.5 rounded-sm text-[10px] font-black bg-orange-500/10 text-orange-400 border border-orange-500/20 uppercase">
                        {displayCell}
                      </span>
                    ) : displayCell === '正常' || displayCell === '存活' || displayCell === '已完成' || displayCell === '普通' || displayCell === '平稳' ? (
                      <span className={`inline-flex items-center justify-center h-5 px-1.5 rounded-sm text-[10px] font-black border uppercase ${
                        displayCell === '普通' 
                          ? 'bg-slate-800 text-slate-400 border-slate-700/50' 
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {displayCell}
                      </span>
                    ) : (
                      displayCell
                    )}
                  </td>
                );
              })}
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
    <div className="bg-[#0f0f15] border border-slate-800 rounded-xl p-4 my-3 overflow-visible">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <Activity size={12} className="text-blue-500" /> {title}
        </h4>
        <div className="text-[9px] text-slate-600 font-mono italic">单位: %</div>
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
    <div className="bg-[#1a1a24] border border-slate-800/80 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
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
                <div className="text-xs text-slate-400 leading-relaxed bg-black/30 p-2 rounded-lg border border-white/5">
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
        : 'bg-[#1a1a24] border border-slate-800/80 rounded-3xl w-full'
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
    <div className="bg-[#141418] border border-slate-800 rounded-xl overflow-hidden mb-4 shadow-xl w-full max-w-[700px]">
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
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-white uppercase tracking-widest font-black transition-colors">
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
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${visibleStep > idx + 1 ? 'bg-emerald-500 text-black' : 'bg-slate-800 border-2 border-slate-700 animate-pulse'}`}>
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
                      <div className="text-[11px] text-slate-500 font-medium leading-relaxed bg-white/[0.02] px-3 py-1.5 rounded-lg border border-slate-800/50">
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
        
        <p>针对上述提到的关键指标，我们建议 SRE 团队采用自动化的监控策略。特别是当 P99 延迟超过 2s 或错误率突增时，应立即触发预警并调用相应的修复脚本。</p>
        
        <p>该文档的部署架构应充分考虑高可用性（HA）。建议跨可用区部署，并配置合理的 Pod 阻断策略。此外，针对大规模集群，引入 Service Mesh（如 Istio）可以极大地提升链路的可观测性。</p>
      </div>
    `;

    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }} 
        animate={{ opacity: 1, x: 0 }} 
        className="space-y-6"
      >
        <div className="bg-[#141418] border border-slate-800 p-6 rounded-2xl shadow-inner relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <BookOpen size={120} />
          </div>
          
          <div className="relative z-10">

            
            <h4 className="text-lg font-black text-slate-100 mb-6 leading-snug">
              {doc.title}
            </h4>

            {doc.libId === 'sop' ? (
              <div className="rounded-xl border border-slate-800/50 overflow-hidden bg-[#0d0d11] h-[650px] mb-6 relative group ring-1 ring-white/5 shadow-2xl">
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

        <div className="bg-slate-800/20 border border-white/5 p-4 rounded-xl flex items-center justify-between">
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
    <div className="w-1/2 h-full bg-[#0d0d11] border-l border-slate-800 flex flex-col shrink-0 relative shadow-2xl z-20">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#111115]">
        <div className="flex items-center gap-3">
          {viewingDoc && (
            <button 
              onClick={() => setViewingDoc(null)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Target size={16} className="text-indigo-400" />
            {viewingDoc ? '文档详情' : '溯源详情'}
          </h3>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
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
              <div key={idx} className="bg-[#141418] border border-slate-800 p-4 rounded-xl space-y-3 hover:border-slate-700 transition-all group">
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
                  <div className="p-3 bg-black/40 rounded-lg border border-slate-800 text-[11px] text-slate-400 leading-relaxed relative overflow-hidden group-hover:bg-black/60 transition-colors">
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
    className="bg-[#1a1a24] border border-indigo-500/30 rounded-2xl p-5 shadow-xl w-full max-w-[540px] relative overflow-hidden group"
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
      className="bg-[#141418] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl w-full max-w-[600px]"
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
          <div className="bg-black/30 p-2 rounded-lg border border-slate-800/50">
            <div className="text-[9px] text-slate-500 mb-1 uppercase tracking-tight">时间范围</div>
            <div className="text-[11px] text-slate-300 font-bold">{data.metrics?.timeRange}</div>
          </div>
          <div className="bg-black/30 p-2 rounded-lg border border-slate-800/50">
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
          <div className={`bg-black/40 border border-slate-800 rounded-xl p-4 font-mono text-[11px] leading-relaxed relative transition-all duration-300 ${isExpanded ? 'max-h-[400px]' : 'max-h-[120px] overflow-hidden'}`}>
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
    className="bg-[#141418] border border-slate-800 rounded-2xl p-5 shadow-2xl w-full max-w-[540px]"
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
    
    <div className="bg-black/30 rounded-2xl border border-slate-800/50 p-6 mb-4">
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
    className="bg-[#1a1a24] border border-blue-500/20 rounded-2xl p-5 shadow-xl w-full max-w-[500px] relative overflow-hidden"
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
    className="bg-[#141418] border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl w-full max-w-[600px]"
  >
    <div className="px-5 py-4 bg-white/[0.02] border-b border-slate-800 flex items-center gap-2">
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
              <div key={aIdx} className="group/item flex items-center justify-between p-3 bg-black/40 border border-slate-800 hover:border-slate-600 rounded-xl transition-all">
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
  <div className="bg-[#1a1b26] border border-slate-800 rounded-2xl p-4 shadow-xl w-full max-w-[320px]">
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
    <div className={`flex flex-col mb-6 group ${isAI ? 'items-start' : 'items-end'} w-full`}>
      <div className={`flex ${isAI ? 'justify-start' : 'justify-end'} w-full`}>
        <div className={`flex gap-3 max-w-[85%] ${isAI ? 'flex-row' : 'flex-row-reverse'} w-full`}>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isAI ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-700 text-slate-300'}`}>
          {isAI ? <Bot size={18} /> : <User size={18} />}
        </div>

        <div className="space-y-2 w-full">
          {message.contentType !== 'action_execution' && (
            <div className={`p-4 rounded-2xl ${isAI
              ? 'bg-[#1a1a20] border border-slate-800/50 text-slate-200'
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
                <div className="mt-4 bg-[#141418] border border-slate-800 rounded-lg p-3">
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
            </div>
          )}

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
              className="bg-[#1f1f27] border border-rose-500/30 rounded-xl p-4 shadow-xl"
            >
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert size={16} className="text-rose-500" />
                <h4 className="text-xs font-bold text-rose-500 uppercase tracking-wider">紧急操作建议</h4>
              </div>
              <p className="text-xs text-slate-300 mb-4">重启 Pod <code className="bg-black/30 px-1 rounded text-blue-400">payment-svc-7d4f8b9c</code> (影响 3% 流量)</p>
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
          {message.contentType === 'mysql_task_edit_list' && <MySQLTaskEditListCard data={message.data} onAction={onAction} />}
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
          {message.contentType === 'self_heal_recommendation' && <SelfHealRecommendationCard data={message.data} onAction={onAction} />}
          {message.contentType === 'remediation_offer' && <RemediationOfferCard data={message.data} onAction={onAction} />}
          {message.contentType === 'remediation_confirm' && <RemediationConfirmCard data={message.data} onAction={onAction} />}

          <div className={`flex items-center gap-2 text-[10px] text-slate-500 ${isAI ? 'justify-start' : 'justify-end'}`}>
            <span>{message.timestamp}</span>
            {isAI && <span className="flex items-center gap-1"><Zap size={10} className="text-indigo-500" /> AI 诊断助手</span>}
          </div>
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

  const safeText = text || '';

  useEffect(() => {
    let i = 0;
    setDisplayedLength(0);
    setIsTyping(true);
    const timer = setInterval(() => {
      i++;
      setDisplayedLength(i);
      if (i >= safeText.length) {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [safeText, speed]);

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
            className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-black bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-sm mx-0.5 cursor-pointer transition-all border border-indigo-500/30 vertical-top align-top -mt-1 group/cite shadow-lg shadow-indigo-500/10"
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
        {renderContent(safeText.slice(0, displayedLength))}
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
    <div className="rounded-2xl border border-white/5 overflow-hidden bg-[#0d0d11] shadow-2xl h-full w-full flex flex-col relative group">
      {/* 极简自定义工具栏 */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 bg-[#16161d]/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0 ring-1 ring-white/5">
        <div className="flex items-center gap-3 border-r border-white/5 pr-4">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Page</span>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[10px] text-white font-black">{page}</span>
            <span className="text-[9px] text-slate-500 font-bold">/ {totalPages}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 border-r border-white/5 pr-4">
          <button onClick={handleZoomOut} className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all active:scale-90">
            <Minus size={14} />
          </button>
          <div className="w-12 text-center">
             <span className="text-[10px] font-black text-slate-200 font-mono">{Math.round(zoom * 100)}%</span>
          </div>
          <button onClick={handleZoomIn} className="p-1.5 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all active:scale-90">
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
      <div className="flex-1 overflow-auto bg-[#0a0a0e] no-scrollbar overflow-x-hidden">
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
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0d0d11] to-transparent pointer-events-none z-10" />
    </div>
  );
};

const CapacityHeader = () => (
  <div className="h-16 border-b border-slate-800/80 flex items-center justify-between px-6 bg-[#141418] shrink-0 z-20">
    <div className="flex-1 max-w-2xl relative group">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
      <input
        type="text"
        placeholder="全局搜索：请输入服务名、主机名或集群名称..."
        className="w-full bg-black/40 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
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
  <div className="h-10 shrink-0 bg-[#0a0a0c] border-t border-slate-800/80 flex items-center px-6 justify-between text-[11px] text-slate-500 z-30">
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
    <div className="flex-1 flex flex-col min-h-0 bg-[#0d0d11]">
      <div className="p-4 border-b border-slate-800/50 space-y-4">
        <div className="relative group">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400" />
          <input type="text" placeholder="搜索资源、主机、服务..." className="w-full bg-black/40 border border-slate-700/50 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-300 focus:border-indigo-500/50 outline-none" />
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
    <div className="flex-1 flex flex-col min-h-0 bg-[#050508] p-6 gap-8 overflow-y-auto no-scrollbar">
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
          className="bg-gradient-to-br from-[#1a1c2e] to-[#0d0e1a] border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden group shadow-2xl"
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
          <div className="w-full flex justify-between bg-[#0a0a0f] border border-slate-800/80 rounded-3xl p-6 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[40px] -mr-16 -mt-16 pointer-events-none" />
            <div className="absolute -top-3 left-8 px-3 py-0.5 bg-blue-600 text-white text-[9px] font-bold rounded-full shadow-lg shadow-blue-600/30 uppercase tracking-wider">Logic Services Layer</div>
            <div className="flex gap-4 w-full justify-around flex-wrap">
              {fullStats.services.map(s => (
                <div 
                  key={s.id} 
                  className={`w-40 p-3 rounded-2xl border transition-all duration-300 ${selectedResource?.id === s.id ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.2)] scale-105' : 'bg-black/40 border-slate-800/80'}`}
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
          <div className="w-full flex justify-between bg-[#0a0a0f] border border-slate-800/80 rounded-3xl p-6 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[40px] -mr-16 -mt-16 pointer-events-none" />
            <div className="absolute -top-3 left-8 px-3 py-0.5 bg-orange-600 text-white text-[9px] font-bold rounded-full shadow-lg shadow-orange-600/30 uppercase tracking-wider">Host & OS Layer (Compute Pool)</div>
            <div className="flex gap-4 w-full justify-around flex-wrap">
              {fullStats.nodes.map(n => (
                <div 
                  key={n.id} 
                  className={`w-40 p-3 rounded-2xl border transition-all duration-300 ${selectedResource?.name.includes('Node-03') || (selectedResource?.id === 'r1' && n.id === 'n3') ? 'bg-orange-500/10 border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.2)] scale-105' : 'bg-black/40 border-slate-800/80'}`}
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
          <div className="w-full flex justify-between bg-[#0a0a0f] border border-slate-800/80 rounded-3xl p-6 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[40px] -mr-16 -mt-16 pointer-events-none" />
            <div className="absolute -top-3 left-8 px-3 py-0.5 bg-emerald-600 text-white text-[9px] font-bold rounded-full shadow-lg shadow-emerald-600/30 uppercase tracking-wider">Infrastructure & Storage Layer</div>
            <div className="flex gap-4 w-full justify-around flex-wrap">
              {fullStats.infra.map(i => (
                <div 
                  key={i.id} 
                  className={`w-52 p-3 rounded-2xl bg-black/40 border border-slate-800/80 transition-all duration-300 ${selectedResource?.name.includes('mysql') || (selectedResource?.id === 'r3' && i.id === 'i1') ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'hover:border-slate-700'}`}
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
    <div className="flex-1 flex flex-col min-h-0 bg-[#0a0a0e] relative">
      <div className="h-12 border-b border-slate-800/60 flex items-center px-4 justify-between bg-[#111116] shrink-0">
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
                  className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 hover:text-white hover:border-indigo-500/50 transition-all font-bold"
                 >
                   {tag}
                 </button>
               ))}
             </div>
             <div className="bg-[#111116] border border-slate-800/80 rounded-2xl p-3 shadow-xl focus-within:border-indigo-500/40 transition-all">
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
    <div className="flex-1 flex flex-col min-h-0 bg-[#0a0b14] overflow-hidden">
      <div className="flex-1 flex min-h-0">
        {!isCollapsed && (
          <div className="w-[320px] shrink-0 flex flex-col border-r border-slate-800/50">
            <CapacityResourceScanner 
              selectedId={selectedResource?.id} 
              onSelect={(r) => onAction('SELECT_RESOURCE', r)} 
            />
          </div>
        )}
        
        <div className="flex-1 min-w-[500px] flex flex-col bg-[#050508] relative">
          <CapacityAnalysisCenter selectedResource={selectedResource} />
        </div>

        <div className={`${isCollapsed ? 'flex-1' : 'w-[25%] min-w-[320px]'} flex flex-col border-l border-slate-800/50 transition-all duration-300`}>
          <div className="absolute top-1/2 -left-3 transform -translate-y-1/2 z-10 px-0.5">
             <button
               onClick={onToggle}
               className="w-6 h-12 bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all shadow-xl active:scale-90"
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
      className={`mb-4 bg-[#1a1a24]/90 backdrop-blur-xl border rounded-2xl p-4 shadow-2xl relative overflow-hidden group/banner transition-all ${
        isAnalyzing 
        ? 'border-indigo-500/50 state-analyzing animate-shimmer' 
        : 'border-white/10 hover:border-white/20'
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
                }`}>巡检计划: {task.riskLevel}风险</span>
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
      className="bg-[#141b2d]/80 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-6 mb-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden group"
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
    <div className="bg-[#1a1a24]/90 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-4 shadow-2xl relative overflow-hidden group/banner transition-all hover:border-indigo-500/50">
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
    <div className="flex-1 flex flex-col min-h-0 bg-[#0b1220] overflow-hidden">
      <div className="flex-1 flex min-h-0">
        {!isCollapsed && (
          <div className="w-1/3 min-w-[360px] border-r border-slate-800/60 bg-[#0d1425] flex flex-col overflow-y-auto no-scrollbar">
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
                      className={`p-4 rounded-xl border border-slate-800 cursor-pointer transition-all ${activeLogCluster?.id === c.id ? 'bg-indigo-500/10 border-indigo-500/40' : 'bg-[#141b2d]'}`}
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
        <div className="flex-1 flex flex-col bg-[#0b1220] relative min-w-0 border-l border-slate-800/20 shadow-[-20px_0_30px_-15px_rgba(0,0,0,0.5)]">
          <div className="h-12 border-b border-slate-800/60 flex items-center px-6 justify-between bg-[#0d1425]/80 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-2">
              <button
                onClick={onToggle}
                className="p-1 px-2 hover:bg-white/5 rounded-md transition-all flex items-center gap-1.5 text-slate-500 hover:text-indigo-400 group"
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
                <motion.h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 mb-4 tracking-tight">AI 日志助手</motion.h2>
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

          <div className="p-6 bg-gradient-to-t from-[#141418] via-[#141418]/95 to-transparent shrink-0">
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
      <div className="h-10 shrink-0 bg-[#070b14] border-t border-slate-800/60 flex items-center px-6 justify-between text-[11px] text-slate-500 z-30">
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
              className="relative bg-[#141b2d] border border-slate-700 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
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
    className={`bg-[#141b2d]/80 backdrop-blur-md rounded-2xl border transition-all ${isExpanded ? 'border-slate-700 shadow-xl' : 'border-slate-800/50'
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
        { label: '总计划数', val: '24', change: '↑2 较昨日', color: 'text-blue-400', icon: <ClipboardList size={20} /> },
        { label: '今日成功率', val: '95.8%', change: '↓1.2%', color: 'text-emerald-400', icon: <CheckCircle2 size={20} /> },
        { label: '异常/失败', val: '3', change: '⚠️ 需优先处理', color: 'text-rose-400', icon: <AlertCircle size={20} /> },
        { label: '覆盖实例数', val: '156', change: '🟢 正常', color: 'text-purple-400', icon: <Server size={20} /> }
      ].map((card, idx) => (
        <div key={idx} onClick={(e) => e.stopPropagation()} className="bg-[#141418] border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all group">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{card.label}</span>
            <span className={card.color}>{card.icon}</span>
          </div>
          <div className="text-2xl font-bold text-slate-100 mb-1">{card.val}</div>
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
          <button onClick={onBack} className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white transition-all">
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
          <div className="bg-[#141418] border border-slate-800 rounded-xl p-5">
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
          <div className="bg-[#141418] border border-slate-800 rounded-xl p-5">
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
        <div className="bg-[#141418] border border-slate-800 rounded-xl p-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><FileText size={14} className="text-blue-400" /> 日志摘要 (Logs)</h3>
          <div className="space-y-2 font-mono text-[10px]">
            <div className="p-2 rounded bg-rose-500/5 border border-rose-500/10 text-rose-400">14:05:12 [ERROR] payment-gw - Connection timeout to upstream bank-api (10.0.4.12)</div>
            <div className="p-2 rounded bg-slate-800/20 border border-slate-700/30 text-slate-500">14:05:10 [INFO] payment-gw - Retrying payment request #PO-9923</div>
            <div className="p-2 rounded bg-rose-500/5 border border-rose-500/10 text-rose-400">14:05:08 [ERROR] payment-gw - SocketException: Broken pipe</div>
          </div>
        </div>
        <div className="bg-[#141418] border border-slate-800 rounded-xl p-5">
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
const InspectionTaskList: React.FC<{ tasks: any[], onAction?: any, setShowBanner?: any, setSelectedTask?: any, analysisStatus?: any, selectedTask?: any }> = ({ tasks, onAction, setShowBanner, setSelectedTask, analysisStatus, selectedTask }) => {
  const [executingTasks, setExecutingTasks] = React.useState<Record<string, { status: 'running' | 'flashing', timestamp: string }>>({});

  const handleRunImmediate = (e: React.MouseEvent, task: any) => {
    e.stopPropagation();
    // Simulate execution start
    setExecutingTasks(prev => ({ ...prev, [task.name]: { status: 'running', timestamp: '' } }));
    
    // Simulate API call completion after 1.5 seconds
    setTimeout(() => {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const newTimestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      
      setExecutingTasks(prev => ({ ...prev, [task.name]: { status: 'flashing', timestamp: newTimestamp } }));
      
      // End flash animation after 1.5 seconds
      setTimeout(() => {
        setExecutingTasks(prev => {
          const next = { ...prev };
          delete next[task.name];
          return next;
        });
      }, 1500);
    }, 1500);

    onAction?.('RUN_IMMEDIATE', { task });
  };

  return (
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
      @keyframes bg-flash {
        0% { background-color: rgba(16, 185, 129, 0.4); color: #34d399; }
        100% { background-color: transparent; color: #94a3b8; }
      }
      .animate-bg-flash {
        animation: bg-flash 1.5s ease-out forwards;
        border-radius: 4px;
        padding: 0 4px;
        margin-left: -4px;
      }
    `}</style>
    {/* ... 筛选区域保持不变 ... */}
    <div className="flex flex-col gap-4 mb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Filter icon and label removed */}
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-600 font-bold">结果:</span>
              <div className="flex gap-1.5">
                {[
                  { label: '全部', active: true },
                  { label: '健康', cls: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' },
                  { label: '异常', cls: 'bg-amber-500/15 border-amber-500/30 text-amber-400' },
                  { label: '失败', cls: 'bg-rose-500/15 border-rose-500/30 text-rose-400' },
                ].map(({ label, active, cls }) => (
                  <button key={label} className={`px-2.5 py-0.5 rounded text-[9px] font-bold border transition-all ${
                    active ? 'bg-blue-500/20 border-blue-500/40 text-blue-400' : cls ?? 'bg-slate-800/40 border-slate-700/50 text-slate-500 hover:text-slate-300'
                  }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-px h-3 bg-slate-800" />

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-600 font-bold">按状态:</span>
              <div className="flex gap-1.5">
                {['全部', '待巡检', '巡检中', '已结束', '未开启'].map((tag, i) => (
                  <button key={i} className={`px-2.5 py-0.5 rounded text-[9px] font-bold border transition-all ${
                    i === 0 ? 'bg-blue-500/20 border-blue-500/40 text-blue-400' :
                    tag === '待巡检' ? 'bg-slate-800/40 border-slate-700/50 text-slate-500 hover:text-slate-300' :
                    tag === '巡检中' ? 'bg-slate-800/40 border-slate-700/50 text-slate-500 hover:text-slate-300' :
                    tag === '已结束' ? 'bg-slate-800/40 border-slate-700/50 text-slate-500 hover:text-slate-300' :
                    'bg-slate-800/40 border-slate-700/50 text-slate-500 hover:text-slate-300'
                  }`}>
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
            <input type="text" placeholder="搜索计划名称/摘要..." className="bg-black/30 border border-slate-800 rounded-md pl-8 pr-3 py-1.5 text-[10px] text-slate-300 focus:outline-none focus:border-blue-500/50 w-64 transition-all" />
          </div>
        </div>
      </div>
    </div>

    <div className="space-y-4">
      {tasks.map((task, idx) => {
        const execState = executingTasks[task.name];
        return (
        <div
          key={idx}
          onClick={(e) => { e.stopPropagation(); setSelectedTask(task); setShowBanner(true); }}
          className={`bg-[#141418] border rounded-xl p-4 transition-all group cursor-pointer relative ${
            selectedTask?.name === task.name 
            ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)] bg-blue-600/[0.04]' 
            : 'border-slate-800 hover:border-blue-500/50 hover:bg-blue-600/[0.02]'
          }`}
        >
          <div className="mb-3">
            <div className="flex items-center gap-3 mb-1">
              <div className={`w-1.5 h-1.5 rounded-full ${task.status === '健康' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`} />
              <h4 className="text-sm font-bold text-slate-100 group-hover:text-blue-400 transition-colors uppercase tracking-tight font-mono">{task.name}</h4>
              <div className="flex items-center gap-1.5 ml-auto">
                {/* 任务结果 badge */}
                {task.status === '异常' && (
                  <div className="relative group/tooltip">
                    <span className="px-1.5 py-0.5 rounded-[4px] text-[9px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/30 cursor-help flex items-center gap-0.5">
                      ⚠️ 异常
                    </span>
                    <div className="absolute bottom-full right-0 mb-2 w-56 hidden group-hover/tooltip:block bg-[#161622] border border-slate-700 p-2.5 rounded-lg text-[10px] text-slate-300 shadow-xl z-20 leading-relaxed">
                      <div className="font-bold text-amber-400 mb-1 border-b border-slate-800 pb-1">异常预警：</div>
                      {task.name.includes('支付')
                        ? '支付网关 (payment-gw) 近 5 分钟 5xx 错误率突增至 15%，触发严重预警水位。'
                        : task.name.includes('慢查询')
                        ? '监测到 12 条超过 3s 的慢 SQL，主要集中在 order_info 表的全表扫描。'
                        : '检测到关键监控指标超出安全上限，系统已触发专家分析。'}
                    </div>
                  </div>
                )}
                {task.status === '失败' && (
                  <span className="px-1.5 py-0.5 rounded-[4px] text-[9px] font-black text-rose-400 bg-rose-500/10 border border-rose-500/30 flex items-center gap-0.5">
                    🔴 失败
                  </span>
                )}
                {task.executionType === 'immediate' && (
                  <div className="relative flex items-center group/btn-run">
                    <button
                      onClick={(e) => handleRunImmediate(e, task)}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {execState?.status === 'running' ? <RefreshCw size={13} className="animate-spin text-blue-400" /> : <Play size={13} />}
                    </button>
                    <div className="absolute bottom-full mb-1.5 right-0 hidden group-hover/btn-run:block whitespace-nowrap bg-[#161622] border border-slate-700 px-2 py-1 rounded-md text-[10px] text-slate-300 shadow-xl z-20 pointer-events-none">
                      点击后将再次执行该计划
                    </div>
                  </div>
                )}
                <div className="relative flex items-center group/btn-cfg">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction?.('CONFIGURE_PLAN', task);
                    }}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <Settings size={13} />
                  </button>
                  <div className="absolute bottom-full mb-1.5 right-0 hidden group-hover/btn-cfg:block whitespace-nowrap bg-[#161622] border border-slate-700 px-2 py-1 rounded-md text-[10px] text-slate-300 shadow-xl z-20 pointer-events-none">
                    配置
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-[11px] text-slate-500 leading-relaxed font-bold italic ml-4.5 border-l border-slate-800 pl-3">
              {task.summary}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-y-2 gap-x-8 mb-4 py-2 border-y border-slate-800/50">
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-slate-500 font-bold uppercase w-16">巡检对象</span>
              <span className="text-[11px] text-slate-300 font-medium">{task.target}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-slate-500 font-bold uppercase w-16">当前状态</span>
              <span 
                className={`group relative text-[11px] font-black flex items-center gap-1 ${
                  execState?.status === 'running' || task.inspectionStatus === '巡检中' ? 'text-orange-400' :
                  task.inspectionStatus === '已结束' ? 'text-emerald-400' :
                  task.inspectionStatus === '未开启' ? 'text-slate-600 cursor-help' :
                  'text-slate-400'
                }`}
              >
                {(execState?.status === 'running' || task.inspectionStatus === '巡检中') && <RefreshCw size={9} className="animate-spin" />}
                {execState?.status === 'running' ? '巡检中' : (task.inspectionStatus || '待巡检')}
                
                {task.inspectionStatus === '未开启' && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-slate-800 text-slate-200 text-[10px] rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-slate-700/50 flex flex-col items-center">
                    当前计划未开启，请前往配置中开启
                    <div className="absolute top-full w-2 h-2 -mt-1 bg-slate-800 border-b border-r border-slate-700/50 transform rotate-45"></div>
                  </div>
                )}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-slate-500 font-bold uppercase w-16">计划类型</span>
              {task.executionType === 'scheduled' ? (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/20">定时巡检</span>
              ) : task.executionType === 'immediate' ? (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20">立即执行</span>
              ) : (
                <span className="text-[11px] text-slate-600">—</span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-slate-500 font-bold uppercase w-16">计划结果</span>
              {task.status === '健康' ? (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">🟢 健康</span>
              ) : task.status === '异常' ? (
                <div className="relative group/tooltip">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 cursor-help">⚠️ 异常</span>
                  <div className="absolute bottom-full left-0 mb-2 w-56 hidden group-hover/tooltip:block bg-[#161622] border border-slate-700 p-2.5 rounded-lg text-[10px] text-slate-300 shadow-xl z-20 leading-relaxed">
                    <div className="font-bold text-amber-400 mb-1 border-b border-slate-800 pb-1">异常预警：</div>
                    {task.name.includes('支付') ? '支付网关 (payment-gw) 近 5 分钟 5xx 错误率突增至 15%，触发严重预警水位。'
                      : task.name.includes('慢查询') ? '监测到 12 条超过 3s 的慢 SQL，主要集中在 order_info 表的全表扫描。'
                      : '检测到关键监控指标超出安全上限，系统已触发专家分析。'}
                  </div>
                </div>
              ) : task.status === '失败' ? (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black text-rose-400 bg-rose-500/10 border border-rose-500/20">🔴 失败</span>
              ) : (
                <span className="text-[11px] text-slate-600">—</span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-slate-500 font-bold uppercase w-16">最近执行</span>
              <span className={`text-[11px] text-slate-400 font-mono tracking-tight ${execState?.status === 'flashing' ? 'animate-bg-flash' : ''}`}>
                {execState?.timestamp || task.updatedAt || '无'}
              </span>
            </div>
            {task.executionType !== 'immediate' && (
              <div className="flex items-center gap-4">
                <span className="text-[10px] text-slate-500 font-bold uppercase w-16">下次执行</span>
                <span className="text-[11px] text-slate-400 font-mono tracking-tight">
                  {task.nextExecutionTime || '2026-06-04 00:00:00'}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end items-center gap-2">
            {(() => {
              const currentStatus = analysisStatus?.[task.name];
              const isAnalyzing = currentStatus === 'analyzing';
              const isCompleted = currentStatus === 'completed' || currentStatus === 'done';
              const isFailed = currentStatus === 'failed';
              const hasReport = task.hasReport || isCompleted;

              // --- 已有历史报告 ---
              if (hasReport) {
                return (
                  <>
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

              // --- 从未生成过报告 ---
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
      );
      })}
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
  );
};

const InspectionDetailReport = ({ analysisStatus, onAction }: any) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="text-xs font-bold text-slate-400 uppercase">当前计划:</div>
        <div className="px-3 py-1.5 bg-[#1e1e24] border border-slate-700 rounded-lg flex items-center gap-4 cursor-pointer hover:border-blue-500 transition-all">
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
          <div className="absolute top-full left-0 mt-2 w-48 bg-[#1a1a24] border border-slate-700 rounded-xl shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover/version:opacity-100 group-hover/version:translate-y-0 group-hover/version:pointer-events-auto transition-all z-50 p-2">
            {['2024-04-12', '2024-04-11', '2024-04-10'].map((date, i) => (
              <div key={date} className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${i === 0 ? 'bg-blue-500/10 text-blue-400' : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'}`}>
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

    <div className="bg-[#141418] border border-slate-800 rounded-xl overflow-hidden">
      <table className="w-full text-left text-[11px]">
        <thead className="bg-white/[0.02] border-b border-slate-800">
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
            <tr key={i} className="hover:bg-white/[0.01] transition-colors">
              <td className="px-4 py-3 font-mono text-slate-300">{row.ip}</td>
              <td className="px-4 py-3 text-slate-300">{row.cpu}</td>
              <td className="px-4 py-3 text-slate-300">{row.mem}</td>
              <td className="px-4 py-3 text-slate-300">{row.disk}</td>
              <td className="px-4 py-3 text-slate-300">{row.load}</td>
              <td className="px-4 py-3">{row.status}</td>
            </tr>
          ))}
          <tr className="bg-white/[0.02] font-bold">
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
      <div className="bg-[#141418] border border-slate-800 rounded-xl p-5">
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

      <div className="bg-[#141418] border border-slate-800 rounded-xl p-5 flex flex-col">
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
    id: 'PLAN-001',
    planId: 'PLAN-ID-1000',
    name: '核心支付链路稳定性巡检',
    target: '集群 (K8s-Prod-Main)',
    status: '异常',
    inspectionStatus: '巡检中',
    riskLevel: '高',
    rules: ['5xx 错误率', '延迟 P99', '三方依赖状态'],
    summary: '检测到支付网关 (payment-gw) 近 5 分钟 5xx 错误率突增至 15%，疑似三方依赖超时。',
    updatedAt: '2024-04-12 14:05:12',
    availableDates: ['2024-04-12', '2024-04-11', '2024-04-10'],
    hasReport: false,
    executionType: 'scheduled',
    enabled: true,
    cronExpression: '*/30 * * * *',
    cronDescription: '每 30 分钟一次',
    tasks: [
      {
        taskId: 'TASK-K8S-01',
        name: 'Kubernetes Pod 重启率检测',
        description: '核查 payment-svc 命名空间下 Pod 的重启次数和崩溃环回状态',
        resourceType: 'Kubernetes 集群',
        target: '集群 (K8s-Prod-Main)',
        scriptType: 'shell',
        scriptContent: '#!/bin/bash\n# 巡检 K8s 异常 Pod\nkubectl get pods -n prod -o wide | grep -E "CrashLoopBackOff|Error"',
        variables: [
          { name: 'RESTART_LIMIT', value: '3', editable: true },
          { name: 'NAMESPACE', value: 'production', editable: false }
        ]
      }
    ]
  },
  {
    id: 'PLAN-002',
    planId: 'PLAN-ID-2000',
    name: '数据库慢查询扫描',
    target: '实例 (MySQL-Order-Primary)',
    status: '异常',
    inspectionStatus: '已结束',
    executionType: 'immediate',
    riskLevel: '中',
    rules: ['查询时长 > 3s', '全表扫描检测', '索引命中率'],
    summary: '存在 12 条执行超过 3s 的慢 SQL，主要集中在 order_info 表的全表扫描。',
    updatedAt: '2024-04-12 13:50:45',
    nextExecutionTime: '2026-06-04 02:00:00',
    availableDates: ['2024-04-12', '2024-04-11', '2024-04-09'],
    hasReport: true,
    tasks: []
  },
  {
    id: 'PLAN-003',
    planId: 'PLAN-ID-3000',
    name: '全站 SSL 证书有效性监控',
    target: '主机 (Slb-External-Node)',
    status: '失败',
    inspectionStatus: '已结束',
    executionType: 'immediate',
    riskLevel: '高',
    rules: ['剩余天数 < 30', '证书链完整性', '算法强度'],
    summary: '有多个节点 Agent 离线，网络握手超时，部分高特权系统指标未采集成功。',
    updatedAt: '2024-04-12 10:20:00',
    availableDates: ['2024-04-12', '2024-04-10', '2024-04-08'],
    hasReport: true,
    tasks: []
  },
  {
    id: 'PLAN-004',
    planId: 'PLAN-ID-4000',
    name: '基础架构存储空间巡检',
    target: '集群 (Ceph-Storage-01)',
    status: '健康',
    inspectionStatus: '已结束',
    executionType: 'scheduled',
    riskLevel: '低',
    rules: ['分区使用率 > 80%', 'IOPS 饱和度', '持久化延迟'],
    summary: '存储系统各分区使用率均在 60% 以下，IOPS 及延时指标正常，整体运行稳定。',
    updatedAt: '2024-04-12 09:15:33',
    nextExecutionTime: '2026-06-04 06:00:00',
    availableDates: ['2024-04-12', '2024-04-11', '2024-04-07'],
    tasks: []
  },
  {
    id: 'PLAN-005',
    planId: 'PLAN-ID-5000',
    name: '消息队列集群堆积巡检',
    target: '集群 (Kafka-Prod-Main)',
    status: '异常',
    inspectionStatus: '已结束',
    executionType: 'immediate',
    riskLevel: '中',
    rules: ['落后 Offset > 100w', '分区均衡度', 'ISR 副本状态'],
    summary: '检测到 billing-topic 存在消费延迟，Offset 堆积量达 250w，疑似下游消费能力不足。',
    updatedAt: '2024-04-12 15:30:12',
    tasks: []
  },
  {
    id: 'PLAN-006',
    planId: 'PLAN-ID-6000',
    name: '入口网关 Nginx 并发连接核查',
    target: '主机 (Nginx-LB-01)',
    status: '异常',
    inspectionStatus: '未开启',
    executionType: 'scheduled',
    riskLevel: '低',
    rules: ['Active Connections', 'Waiting Connections', 'Error Rate'],
    summary: '当前活动连接数接近系统限额 (80%)，建议检查连接复用配置。',
    updatedAt: '2024-04-12 16:45:00',
    nextExecutionTime: '—',
    tasks: []
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
    <div className="flex flex-col h-full bg-[#0d0d11]">
      {/* Header with Search */}
      <div className="p-6 border-b border-slate-800/50 bg-[#111115] shrink-0 space-y-4">
        <div className="flex items-center justify-between group cursor-pointer" onClick={toggleAll}>
          <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors uppercase tracking-widest">知识资源库</span>
          <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${selectedLibIds.length === MOCK_KNOWLEDGE_LIBS.length ? 'bg-[#4f46e5] border-[#4f46e5] shadow-[0_0_12px_rgba(79,70,229,0.4)]' : 'border-slate-700 bg-black/30 group-hover:border-slate-500'}`}>
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
            className="w-full bg-black/40 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
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
                className={`flex flex-col p-4 rounded-2xl hover:bg-white/[0.03] transition-all group cursor-pointer border ${activeLibId === lib.id ? 'bg-indigo-500/[0.04] border-indigo-500/30' : 'border-slate-800/40 hover:border-slate-700'}`}
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
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${selectedLibIds.includes(lib.id) ? 'bg-[#4f46e5] border-[#4f46e5] shadow-[0_0_8px_rgba(79,70,229,0.2)]' : 'border-slate-700 bg-black/30 hover:border-slate-500'}`}
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

      <div className="p-6 border-t border-slate-800 bg-[#0d0d11] shrink-0">
        <div className="relative group/search">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/search:text-indigo-500" />
          <input type="text" placeholder="全库搜索..." className="w-full bg-black/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-400 focus:outline-none focus:border-indigo-500/50 transition-all" />
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
    <div className="flex flex-col h-full bg-[#0a0a0c]">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 bg-[#141418] shrink-0 shadow-sm z-10 transition-all">
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
              className="p-8 pb-20 bg-[#0d0d11]"
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
              className="p-6 space-y-3 bg-[#0d0d11]"
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
      className={`absolute left-0 w-80 bg-[#1a1a24] border border-slate-800 rounded-2xl z-50 overflow-hidden transition-all duration-300 shadow-2xl ${
        direction === 'up' 
          ? 'bottom-full mb-3 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-2' 
          : 'top-full mt-3 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] animate-in slide-in-from-top-2'
      }`}
    >
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-white/[0.02]">
        <h4 className="text-[11px] font-black text-slate-200 uppercase tracking-widest flex items-center gap-2">
          <BookOpen size={14} className="text-indigo-400" /> 选择检索范围
        </h4>
        <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-md text-slate-500 transition-colors">
          <X size={14} />
        </button>
      </div>
      <div className="max-h-72 overflow-y-auto no-scrollbar p-2 space-y-1.5 bg-[#0d0d12]">
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
            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 ${isAllSelected ? 'bg-indigo-600 border-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.4)]' : 'border-slate-700 bg-black/40 group-hover/all:border-slate-500'}`}>
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
              className={`flex flex-col p-3 rounded-xl border transition-all cursor-pointer group ${isSelected ? 'bg-indigo-500/[0.08] border-indigo-500/40' : 'bg-transparent border-transparent hover:bg-white/[0.03] hover:border-slate-800'}`}
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
    <div className="flex flex-col h-full bg-[#0a0a0c]">
      {/* Context Header */}
      <div className="h-14 border-b border-slate-800/80 flex items-center justify-between px-6 bg-[#141418] shrink-0">
        <div className="flex items-center gap-2">
          {/* Subtle title to match Inspection style */}
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI 知识专家</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-slate-500 hover:text-white transition-colors"><Maximize2 size={16} /></button>
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

      <div className="p-6 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/95 to-transparent shrink-0">
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
    <div className="flex flex-col h-full bg-[#0d0d11]">
      <div className="p-4 border-b border-slate-800 bg-[#141418] shrink-0">
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
              className="w-full bg-black/40 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500/50 transition-all font-medium"
            />
            {searchQuery && <X size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 cursor-pointer hover:text-white" onClick={() => setSearchQuery('')} />}
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
                <div className="absolute top-full left-0 mt-2 w-full bg-[#1c1c22] border border-slate-700 rounded-lg shadow-2xl overflow-hidden z-50">
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
                <div className="absolute top-full left-0 mt-2 w-full bg-[#1c1c22] border border-slate-700 rounded-lg shadow-2xl overflow-hidden z-50">
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
                  : alarm.status === 'resolved'
                    ? 'bg-emerald-500/[0.03] border-emerald-500/20 hover:border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.05)]'
                    : alarm.level === 'P0'
                      ? 'bg-rose-500/[0.03] border-rose-500/20 hover:border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.05)]'
                      : 'bg-slate-800/20 border-slate-800/60 hover:border-slate-700'
                }`}
            >
              <div className="flex justify-between items-start mb-2.5">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    alarm.level === 'P0'
                      ? 'bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                      : 'bg-orange-500'
                  }`} />
                  <span className={`text-[10px] font-bold ${
                    alarm.level === 'P0'
                      ? 'text-rose-500'
                      : 'text-orange-500'
                  }`}>
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

              <h4 className="text-xs font-bold text-slate-200 mb-3 leading-relaxed group-hover:text-white transition-colors line-clamp-2">{alarm.title}</h4>

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
      <div className="bg-[#1a1a20]/80 backdrop-blur-md border border-purple-500/30 rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden group">
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
  <div className="flex-1 flex flex-col min-h-0 bg-[#0a0a0c]">
    <div className="h-12 flex items-center px-6 border-b border-slate-800/50 shrink-0 bg-[#141418]">
      <button
        onClick={() => onToggle?.()}
        className="p-1 px-2 hover:bg-white/5 rounded-md border border-slate-800/50 transition-all flex items-center gap-1.5 text-slate-500 hover:text-indigo-400 group"
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
            className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 mb-4 tracking-tight"
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

    <div className="p-6 bg-gradient-to-t from-[#141418] via-[#141418]/95 to-transparent shrink-0">
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
                <div className="bg-[#1a1a24]/90 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-4 shadow-2xl shadow-black/40 relative overflow-hidden group/banner transition-all hover:border-indigo-500/40">
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
  <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 bg-[#0a0a0c]">
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
        <div key={stat.label} className="bg-[#141418] border border-slate-800/50 p-4 rounded-2xl">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] text-slate-500 font-bold uppercase">{stat.label}</span>
            <stat.icon size={14} className={stat.color} />
          </div>
          <div className={`text-xl font-mono font-bold ${stat.color}`}>{stat.value}</div>
        </div>
      ))}
    </div>
    <div className="bg-[#141418] border border-slate-800/50 rounded-2xl p-6">
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
    className="flex-1 flex flex-col min-h-0 bg-[#0a0a0c]"
    onClick={() => { setShowBanner(false); setSelectedTask(null); }}
  >
    {/* Header banner always visible */}
    <div onClick={(e) => e.stopPropagation()} className="px-6 py-3 border-b border-slate-800/50 bg-[#111115] flex items-center justify-between shrink-0">
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
                <ListTodo size={18} className="text-blue-500" /> 巡检计划列表
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
  <div className="flex-1 flex flex-col border-l border-slate-800/50 bg-[#0d0d11] shrink-0 min-w-0">
    {/* Page Toggle & Agent Label */}
    <div className="h-10 border-b border-slate-800/60 flex items-center px-4 justify-between bg-[#0d0f1a] shrink-0">
       <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            className="p-1 px-2 hover:bg-white/5 rounded-md transition-all flex items-center gap-1.5 text-slate-500 hover:text-orange-400 group"
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

    <div className="h-[44px] px-3 border-t border-slate-800/50 flex items-center gap-2 bg-[#0d0f1a] shrink-0 overflow-x-auto no-scrollbar">
      {[
        { id: 'NEW_TASK', icon: <PlusCircle size={12} />, label: '新建计划', color: 'text-blue-400' },
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

    <div className="p-4 bg-[#111324] border-t border-slate-800/80 shrink-0">
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
  <div className="flex-1 flex min-h-0 bg-[#0a0b14]">
    <div className="w-1/4 border-r border-slate-800/50 bg-[#0d0d11] p-6 space-y-6 hidden md:flex flex-col">
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
    <div className="flex-1 flex flex-col min-h-0 bg-[#0b1220]">
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
  <div className="flex-1 flex flex-col min-h-0 bg-[#0a0a0f] relative">
    {/* Page Toggle & Agent Label */}
    <div className="h-10 border-b border-slate-800/60 flex items-center px-4 justify-between bg-[#0d0f1a] shrink-0">
       <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            className="p-1 px-2 hover:bg-white/5 rounded-md transition-all flex items-center gap-1.5 text-slate-500 hover:text-indigo-400 group"
          >
            {isCollapsed ? <PanelLeftClose size={14} className="text-indigo-500" /> : <PanelLeft size={14} />}
            <span className="text-[10px] font-bold uppercase tracking-tight">{isCollapsed ? '展开面板' : '收起面板'}</span>
          </button>
          <div className="w-px h-3 bg-slate-800 mx-1" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest">SRE 超级助手 (General AI)</span>
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
              我是您的 SRE 超级助手
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
       <div className="bg-[#111324] border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden focus-within:border-indigo-500/30 transition-all">
          {renderInput()}
       </div>
    </div>
  </div>
);

const GUIDE_TABS = [
  {
    id: 'home',
    title: '首页',
    icon: <Home size={16} />,
    children: [
      { id: 'home-rules', title: '首页交互规则', content: `# SRE Agent 首页 PRD / 测试用例版

## 1. 文档信息
- **文档名称**：SRE Agent 首页交互规则 PRD / 测试用例
- **适用范围**：SRE Agent 首页
- **文档目的**：用于产品、设计、开发、测试对齐首页各入口、输入区、上传能力、卡片跳转、空状态与排序规则
- **当前状态**：含已确认规则 + 待确认建议项

---

## 2. 产品目标
SRE Agent 首页作为平台统一入口，承载以下能力：
- 快速进入告警相关分析流程
- 通过输入框发起不同场景的智能助手任务
- 快速跳转至各核心模块页面
- 在首页预览关键业务信息，并在无数据时保持可理解的状态反馈

---

## 3. 页面范围
本次规则覆盖以下区域：

1. 顶部通知条
2. 首页输入框区域
3. 首页核心能力卡片
   - 故障根因分析
   - 告警收敛
   - 运维知识专家
   - 智能巡检助手
4. 首页空状态
5. 附件/图片上传规则
6. 告警排序规则

---

## 4. 术语说明

### 4.1 \`@标签\`
指输入框底部可选的场景标签，用于指定当前消息的目标能力模块。
当前包含：
- \`@诊断专家\`
- \`@巡检助手\`
- \`@知识专家\`


### 4.2 快捷指令
指输入框下方的常用指令按钮，点击后可将预设内容写入输入框。

### 4.3 空状态
指模块在无数据时展示的占位内容，用于反馈当前无内容可展示。

### 4.4 空数据状态
与空状态语义一致，强调当前模块暂无数据，非系统异常。

---

## 5. 功能需求说明（PRD）

---

## 5.1 顶部通知条

### 5.1.1 功能说明
顶部通知条用于展示待处理告警信息，支持轮播查看，并可快捷进入单条告警分析流程。

### 5.1.2 交互规则
1. 顶部通知条同一时刻仅展示 **1 条告警信息**
2. 当存在多条告警时，通知条以 **滚动轮播** 形式依次展示
3. 当首页 **没有告警数据时**：
   - 通知条整体隐藏
   - 不占据页面布局空间
4. 点击通知条内操作按钮后：
   - 进入 **AI 诊断助手页面**
   - 自动带入当前通知条对应的 **单条告警上下文**
   - 并 **直接开始分析**

### 5.1.3 输出要求
- 当前展示的告警需可被识别为单条告警对象
- 跳转后分析上下文应与通知条当前展示内容一致

---

## 5.2 首页输入框区域

### 5.2.1 功能说明
输入框为首页统一任务发起入口，支持文本输入、附件上传、图片上传、\`@标签\` 路由以及快捷指令辅助输入。

### 5.2.2 输入框能力范围
输入框支持：
- 文本输入
- 上传附件
- 上传图片
- 选择 \`@标签\`
- 点击快捷指令
- 发送消息

---

## 5.3 \`@标签\` 规则

### 5.3.1 标签选择规则
1. \`@标签\` **不支持多选**
2. 用户可在 **输入前** 选择 \`@标签\`
3. 用户也可在 **输入完成后** 再选择 \`@标签\`

### 5.3.2 标签替换规则
1. 当用户点击新的 \`@标签\` 时：
   - 当前已选中的 \`@标签\` 被替换
   - 新标签成为当前唯一生效标签
2. 切换标签时：
   - 已输入文本内容保留
   - 不清空已有输入内容

### 5.3.3 标签取消规则
1. 当某个 \`@标签\` 已选中时，用户再次点击输入框下方同一个标签：
   - 取消该标签选中状态
   - 输入框内对应标签同步移除
2. 取消后，当前消息恢复为 **无标签状态**

### 5.3.4 标签与快捷指令联动规则
1. 当用户已选择 \`@标签\` 后，再点击输入框下方快捷指令：
   - 快捷指令内容写入输入框
   - 当前 \`@标签\` 保持不变
   - 不触发标签替换或取消
2. 快捷指令仅补充输入内容，不改变当前路由目标

---

## 5.4 输入发送路由规则

### 5.4.1 路由映射
- \`@诊断专家\` → **AI 诊断专家页面**
- \`@巡检助手\` → **AI巡检助手页面**
- \`@知识专家\` → **AI知识专家页面**

### 5.4.2 发送时携带内容
发送时需带入以下内容（如当前场景支持）：
- 用户输入文本
- 当前选中 \`@标签\`
- 已上传附件
- 已上传图片
- 已选择知识库


### 5.4.3 用户输入内容发送后的意图识别
参考下面的md文档（1.2首页通用智能体意图识别）


---

## 5.5 附件与图片上传

### 5.5.1 功能说明
用户可在首页输入框区域上传附件和图片，作为输入上下文的一部分参与后续任务处理。

### 5.5.2 附件展示规则（已确认）
附件上传成功后，输入框区域展示附件卡片，卡片内容包括：
- 文件类型 icon
- 文件名
- 格式名称（展示在文件名下方）

### 5.5.3 文件名展示规则（已确认 + 待确认）
1. 文件名需限制展示字符数，避免撑开布局
2. 文件名单行展示
3. 超出展示长度后以省略号截断

#### 建议值（待确认）
- 建议最多展示 **10 个中文字符**

### 5.5.4 图片与文件展示规则
建议图片上传成功后展示图片卡片，包含：
- 图片缩略图

建议图片上传成功后展示文件卡片，包含：
- 文件icon
- 文件名称
- 文件格式名称

### 5.5.5 上传成功后行为
建议支持：
- 展示已上传的文件与图片卡片

### 5.5.6 上传限制
建议补充明确以下规则：
- 支持的文件格式（目前Aone支持的所有）
- 最大上传数量（10个）
- 单文件大小限制（待定）
- 上传失败提示文案

---



## 5.6 首页核心能力卡片

---

### 5.6.1 故障根因分析模块

#### 功能说明
用于展示当前重点告警（前5条），并支持进入诊断页面或直接对单条告警发起分析。

#### 交互规则
1. 点击模块整块：
   - 进入 **AI 诊断专家页面**
2. 点击模块内某条告警卡片：
   - 进入 **AI 诊断专家页面**
   - 自动带入该条告警上下文
   - 并 **直接开始分析**
3. 当模块 **无告警数据时**：
   - 展示 **空状态**

#### 告警排序规则
1. 一级排序：按告警严重级别降序排列  
   \`严重 > 重要 > 次要 > 警告 > 信息\`
2. 二级排序：同级别下按 **最新更新时间倒序**

---

### 5.6.2 告警收敛模块

#### 交互规则
- 点击卡片整块：
  - 进入 **告警收敛页面**

---

### 5.6.3 运维知识专家模块

#### 交互规则
- 点击卡片整块：
  - 进入 **告警收敛页面**
- 当模块无数据时：
  - 展示 **空状态**

---

### 5.6.4 智能巡检助手模块

#### 交互规则
- 点击卡片整块：
  - 进入 **AI巡检助手页面**
- 当模块无数据时：
  - 展示 **空数据状态**

---

## 5.7 首页空状态规则

### 5.7.1 顶部通知条
- 无告警数据时隐藏

### 5.7.2 故障根因分析模块
- 无告警数据时展示空状态

### 5.7.3 运维知识专家模块
- 无数据时展示空状态

### 5.7.4 智能巡检助手模块
- 无数据时展示空数据状态

---

## 6. 验收标准（Acceptance Criteria）

### AC-01 顶部通知条展示
- 当存在告警数据时，首页顶部展示通知条
- 同一时刻仅展示 1 条告警

### AC-02 顶部通知条轮播
- 当存在多条告警时，通知条按滚动轮播形式展示

### AC-03 顶部通知条隐藏
- 当无告警数据时，通知条隐藏且不占位

### AC-04 顶部通知条按钮跳转
- 点击通知条操作按钮后，进入 AI 诊断助手页面
- 自动带入当前展示的单条告警
- 进入后直接开始分析

### AC-05 \`@标签\` 单选
- \`@标签\` 不支持多选
- 选择新标签时替换旧标签

### AC-06 \`@标签\` 选择时机
- 用户可在输入前选择标签
- 用户可在输入后再选择标签

### AC-07 \`@标签\` 替换不清空内容
- 用户切换标签时，输入内容保留

### AC-08 \`@标签\` 取消
- 点击已选中的同一个标签后，标签被取消

### AC-09 \`@标签\` 与快捷指令联动
- 已选标签后点击快捷指令，标签保持不变
- 快捷指令内容写入输入框

### AC-10 输入发送路由
- 根据当前选中的唯一标签跳转到对应页面

### AC-11 附件卡片展示
- 附件上传成功后展示附件卡片
- 卡片展示 icon、文件名、格式名称

### AC-12 文件名截断
- 文件名超出展示限制后，以省略号截断，不影响布局

### AC-13 根因分析整块跳转
- 点击根因分析整块进入 AI 诊断助手页面

### AC-14 根因分析单条告警直达分析
- 点击根因分析模块内某条告警卡片后：
  - 进入 AI 诊断助手页面
  - 自动带入告警
  - 直接开始分析

### AC-15 根因分析排序
- 告警按严重级别降序展示
- 同级别下按最新更新时间倒序展示

### AC-16 告警收敛跳转
- 点击告警收敛卡片进入告警收敛页面

### AC-17 运维知识专家跳转
- 点击运维知识专家卡片进入 AI知识专家页面

### AC-18 智能巡检助手跳转
- 点击智能巡检助手卡片进入 AI巡检助手页面

### AC-19 根因分析空状态
- 根因分析无告警数据时展示空状态

### AC-20 运维知识专家空状态
- 运维知识专家无数据时展示空状态

### AC-21 智能巡检助手空数据状态
- 智能巡检助手无数据时展示空数据状态

---

## 7. 测试用例

---

### TC-01 顶部通知条单条展示
- **前置条件**：存在 1 条以上的告警数据
- **操作步骤**：进入首页
- **预期结果**：
  - 顶部通知条展示
  - 仅显示 1 条告警内容
  - **单条规则**：告警单条规则为：告警设备+告警名称

---

### TC-02 顶部通知条轮播展示
- **前置条件**：存在多条告警数据
- **操作步骤**：进入首页并观察通知条
- **预期结果**：
  - 顶部通知条以轮播方式展示多条告警
  - 任一时刻仅显示 1 条

---

### TC-03 顶部通知条隐藏
- **前置条件**：无告警数据
- **操作步骤**：进入首页
- **预期结果**：
  - 顶部通知条不展示
  - 页面布局正常，无空白占位

---

### TC-04 顶部通知条按钮跳转分析
- **前置条件**：首页存在顶部告警通知条
- **操作步骤**：点击通知条操作按钮
- **预期结果**：
  - 跳转至 AI 诊断助手页面
  - 自动带入当前告警
  - 自动开始分析

---

### TC-05 输入前选择 \`@标签\`
- **前置条件**：进入首页
- **操作步骤**：
  1. 先点击任一 \`@标签\`
  2. 再输入文本
- **预期结果**：
  - 标签处于选中态
  - 输入内容正常保留

---

### TC-06 输入后选择 \`@标签\`
- **前置条件**：进入首页
- **操作步骤**：
  1. 先输入文本
  2. 再点击任一 \`@标签\`
- **预期结果**：
  - 标签选中成功
  - 已输入文本不丢失

---

### TC-07 \`@标签\` 替换
- **前置条件**：已选中一个 \`@标签\`
- **操作步骤**：点击另一个 \`@标签\`
- **预期结果**：
  - 原标签取消
  - 新标签选中
  - 输入内容保留

---

### TC-08 \`@标签\` 取消
- **前置条件**：已选中一个 \`@标签\`
- **操作步骤**：再次点击当前已选标签
- **预期结果**：
  - 当前标签取消选中
  - 输入框中的对应标签同步移除

---

### TC-09 \`@标签\` 与快捷指令联动
- **前置条件**：已选中任一 \`@标签\`
- **操作步骤**：点击底部任一快捷指令
- **预期结果**：
  - 快捷指令内容写入输入框
  - 当前标签保持不变

---

### TC-10 \`@诊断专家\` 路由
- **前置条件**：已选中 \`@诊断专家\`
- **操作步骤**：输入内容并发送
- **预期结果**：
  - 跳转至 AI 诊断助手页面
  - 带入当前输入内容及上下文

---

### TC-12 \`@巡检助手\` 路由
- **前置条件**：已选中 \`@巡检助手\`
- **操作步骤**：输入内容并发送
- **预期结果**：
  - 跳转至 AI巡检助手页面

---

### TC-13 \`@知识专家\` 路由
- **前置条件**：已选中 \`@知识专家\`
- **操作步骤**：输入内容并发送
- **预期结果**：
  - 跳转至 AI知识专家页面

---

### TC-14 附件卡片展示
- **前置条件**：选择并成功上传附件
- **操作步骤**：观察输入框上传区域
- **预期结果**：
  - 展示附件卡片
  - 包含 icon、文件名、格式名称

---

### TC-15 文件名超长截断
- **前置条件**：上传超长文件名附件
- **操作步骤**：观察附件卡片
- **预期结果**：
  - 文件名按规则截断
  - 不撑开布局
  - 显示省略号

---

### TC-16 根因分析整块跳转
- **前置条件**：首页展示根因分析模块
- **操作步骤**：点击模块整块
- **预期结果**：
  - 跳转至 AI 诊断助手页面

---

### TC-17 根因分析单条告警直接分析
- **前置条件**：根因分析模块存在告警卡片
- **操作步骤**：点击某条告警卡片
- **预期结果**：
  - 跳转至 AI 诊断助手页面
  - 自动带入该条告警
  - 自动开始分析
  - **单条规则**：告警单条规则为：告警级别+告警设备+告警名称

---

### TC-18 根因分析排序验证
- **前置条件**：根因分析模块存在多条不同等级及不同更新时间的告警
- **操作步骤**：观察告警顺序
- **预期结果**：
  - 按严重级别降序排列
  - 同级别下按最新更新时间倒序排列

---

### TC-19 告警收敛跳转
- **前置条件**：首页展示告警收敛模块
模块中数据内容可参考「告警收敛」页面
- **操作步骤**：点击告警收敛卡片
- **预期结果**：
  - 跳转至告警收敛页面

---

### TC-20 运维知识专家跳转
- **前置条件**：首页展示运维知识专家模块
- **操作步骤**：点击运维知识专家卡片
- **预期结果**：
  - 跳转至 AI知识专家页面

---

### TC-21 智能巡检助手跳转
- **前置条件**：首页展示智能巡检助手模块
- **操作步骤**：点击智能巡检助手卡片
- **预期结果**：
  - 跳转至 AI巡检助手页面

---

### TC-22 根因分析空状态
- **前置条件**：根因分析模块无告警数据
- **操作步骤**：进入首页
- **预期结果**：
  - 模块展示空状态

---

### TC-23 运维知识专家空状态
- **前置条件**：知识专家模块无数据
- **操作步骤**：进入首页
- **预期结果**：
  - 模块展示空状态
  - 页面列表为用户发出提问的高频问题，从最多次到最低次展示，当次数一样时，按照最新时间排序

---

### TC-24 智能巡检助手空数据状态
- **前置条件**：巡检助手模块无数据
- **操作步骤**：进入首页
- **预期结果**：
  - 模块展示空数据状态

---

## 8. 待确认项

以下内容建议在后续评审中补齐，以完善测试边界：

1. 无 \`@标签\` 时发送消息的默认去向超级智能体助手
2. 支持的文件格式清单（目前Aone支持的所有）
3. 最大上传数量（10）
4. 单文件大小限制（待定）
5. 上传失败提示文案与样式
6. 输入内容为空时发送按钮是否禁用


---` },
      { id: 'home-intent', title: '首页输入内容意图识别', content: `# 通用智能体页「系统推荐转交」交互流程（含意图识别优先级）

## 一、补充目标
本补充规则用于完善首页「SRE超级助手」页面（以下称为通用智能体页）的以下能力：
- 用户问题的意图识别优先级
- 推荐转交按钮的触发条件
- 问题留在通用智能体时的回答方式
- 意图不明确场景下的引导逻辑

---

## 二、意图识别优先级

### 1. 路由原则
系统对用户在首页提出的问题的处理优先级如下：

#### 第一优先级：显式标签优先
当用户输入中包含显式标签时，优先按显式标签路由：
- \`@诊断专家\`
- \`@巡检助手\`
- \`@知识专家\`

若命中显式标签：
- 直接按标签进入对应智能体
- 不再进入通用智能体的意图判断逻辑

---

#### 第二优先级：关键词匹配（高置信度）
当用户未使用显式标签时，系统优先根据关键词进行高置信度匹配。

##### 诊断类关键词示例
- 怎么回事
- 原因
- 报错
- 异常
- 慢
- 高延迟
- P99
- P95
- 超时
- 失败
- 错误
- 故障
- 分析

##### 巡检类关键词示例
- 检查
- 告警
- 巡检
- 扫描
- 健康
- 状态
- 有没有问题
- SLA
- 达标
- 风险
- 配置检查

##### 知识类关键词示例
- SOP
- 文档
- 怎么做
- 如何
- 步骤
- 流程
- 最佳实践
- 规范
- 手册
- 知识
- 知识库

##### 通用类关键词示例
- 你好
- 帮我
- 什么
- 介绍
- 能做什么
- 最近
- 总结
- 概览

---

#### 第三优先级：上下文延续
当用户当前问题为明显追问，且当前会话已有上一个智能体上下文时：
- 若识别为追问问题，则优先延续上一轮智能体上下文
- 避免用户在连续追问时频繁跳转页面

适用示例：
- 上一轮已进入通用智能体场景语境，用户继续问：\`那根因更可能是什么？\`
- 上一轮已进入诊断语境，用户继续问：\`那这个 SOP 的前置条件呢？\`

---

#### 第四优先级：LLM 意图分类（中等置信度）
当显式标签、关键词匹配、上下文延续都无法明确判断时：
- 由 LLM 进行意图分类
- 当分类置信度大于阈值（建议 \`0.8\`）时，按其识别结果处理

---

#### 第五优先级：兜底到通用智能体
当以上规则均无法形成明确结论时：
- 问题留在通用智能体
- 通用智能体先进行初步回答与引导

---

## 三、通用智能体与推荐转交的关系

### 1. 什么时候直接转交
满足以下任一条件时，可推荐转交到专业智能体：
- 命中显式专业标签
- 关键词命中明显，且场景高度明确
- LLM 意图分类置信度高
- 用户问题具有明确执行目标（如创建巡检任务、排查异常、查看 SOP 来源）

---

### 2. 什么时候留在通用智能体
满足以下任一条件时，问题继续留在通用智能体：
- 问题属于简单泛问答
- 问题属于平台能力咨询
- 问题属于概览 / 汇总 / 复合信息协调
- 问题意图不明确
- 当前更适合先做一轮澄清，而不是立即转交

---

## 四、问题留在通用智能体时的回答模式

当问题最终未被直接转交，而是留在通用智能体中时，通用智能体应根据问题类型采用不同回答模式。

---

### 模式 1：简单问题直接回答

#### 适用场景
- 用户咨询平台能力
- 用户进行泛问题提问
- 用户问题无需进入专业智能体也可直接回答

#### 示例
用户问题：
- \`你能做什么？\`

通用智能体回答方式：
- 直接说明能力范围，同时支持点击操作
- 给出可继续操作的方向
- 不强制推荐转交

#### 示例回答结构
- 我是 SRE 智能助手，可以帮你：
  - [诊断故障和性能问题→] **（支持点击，并提示转到 AI诊断专家）**
  - [巡检系统健康状态→] **（支持点击，并提示转到 AI巡检助手）**
  - [查询运维知识和 SOP→] **（支持点击，并提示转到 AI知识专家）**
  - [处理和分析告警→] **（支持点击，并提示转到 AI诊断专家）**
- 欢迎您继续提问
---

### 模式 2：复合问题协调回答

#### 适用场景
- 用户的问题不是单一子任务
- 用户更像在问“整体情况”
- 用户希望先看到概览，再决定深入哪个方向

#### 示例
用户问题：
- \`最近系统有什么问题吗？\`

通用智能体回答方式：
- 不立即强制跳去某个专业智能体
- 先给出多维度汇总结果
- 再在不同模块结果中给出对应入口

#### 示例回答结构
- 告警情况（最近24小时）
  - 3 条严重告警，2 条已处理
  - \`[查看详情 →]\`
- 性能诊断
  - payment-svc P99 偏高（245ms）
  - \`[深入分析 →]\`
- 巡检结果
  - 整体健康度 87%，有 3 个待优化项
  - \`[查看报告 →]\`

#### 交互特点
- 此类回答不是单一“转交按钮”
- 而是“通用协调回答 + 多入口继续深入”
- 当用户点击其中一个入口后，跳转到对应的专业智能体页面，不需要用户确认，直接点击后跳转到专业智能体页面

---

### 模式 3：意图不明确时引导

#### 适用场景
- 用户描述过于模糊
- 系统无法准确判断其目标场景
- 若直接转交，容易误判

#### 示例
用户问题：
- \`帮我看看\`

通用智能体回答方式：
- 不直接转交
- 给出可选方向，引导用户补充
- 降低误跳转概率

#### 示例回答结构
- 好的，我可以帮你：
  - 诊断某个服务的问题
  - 巡检系统健康状态
  - 查询运维文档
- 请告诉我你想看什么？

#### 推荐交互形式
可在回答下方给出引导按钮：
- \`诊断问题\`
- \`查看巡检\`
- \`选择文档查询\`

---

## 五、推荐转交按钮触发规则（补充版）

### 1. 诊断助手推荐触发
当问题满足以下特征时，在回答下方展示：
- \`转到 AI诊断专家\`

#### 典型特征
- 性能指标异常
- 服务报错
- 超时 / 失败 / 高延迟
- 根因分析诉求
- 日志分析诉求

#### 示例问题
- \`payment-svc 为什么 P99 飙升？\`
- \`为什么最近接口老是超时？\`
- \`这段报错日志帮我看下\`

---

### 2. 知识专家推荐触发
当问题满足以下特征时，在回答下方展示：
- \`转到 AI知识专家\`

#### 典型特征
- 查询 SOP
- 查询步骤 / 流程
- 查询最佳实践
- 查询规范 / 手册 / 文档

#### 示例问题
- \`K8s OOMKill 的 SOP 是什么？\`
- \`Redis timeout 一般怎么处理？\`
- \`这个流程在哪份文档里？\`

---

### 3. 巡检助手推荐触发
当问题满足以下特征时，在回答下方展示：
- \`进入 AI巡检助手\`

#### 典型特征
- 创建巡检任务
- 巡检规则配置
- 定时巡检
- 风险检查 / 健康检查

#### 示例问题
- \`帮我创建一个每日巡检任务\`
- \`我想检查服务健康状态\`
- \`想配一个 CPU 和内存巡检\`

---

## 六、通用智能体推荐转交的最终判断逻辑

### 判断顺序
1. 是否存在显式标签（首页）  
2. 是否命中高置信度关键词  
3. 是否应延续上一轮上下文  
4. 是否可由 LLM 高置信度分类  
5. 若仍不明确，则留在通用智能体

### 输出方式
- 若识别明确：  
  - 先给简要回答  
  - 再推荐转交按钮
- 若识别不明确：  
  - 留在通用智能体  
  - 用澄清式回答引导用户补充
- 若属于复合问题：  
  - 通用智能体先协调输出概览  
  - 再提供多个方向入口

---

## 七、测试关注点（补充）

### 1. 意图识别优先级是否生效
- 显式标签是否覆盖关键词判断
- 关键词匹配是否先于 LLM 分类
- 上下文追问是否正确延续
- 未命中时是否正确兜底到通用智能体

### 2. 通用智能体回答模式是否符合问题类型
- 简单问题是否直接回答
- 复合问题是否输出协调型概览
- 模糊问题是否先澄清再引导

### 3. 推荐按钮是否与问题类型一致
- 诊断类 → AI诊断助手
- 知识类 → AI知识专家
- 巡检类 → AI巡检助手

### 4. 跳转交互保持一致
- 当用户点击其中一个入口后，跳转到对应的专业智能体页面

---` }
    ]
  },
  {
    id: 'diagnostic',
    title: '诊断专家',
    icon: <Activity size={16} />,
    children: [

      { id: 'diag-rules', title: '诊断通用交互规则', content: `# AI 诊断助手页面交互说明（测试版）

---

## 1. 文档目的

本文档用于明确 **AI 诊断助手页面** 的页面结构、核心交互、状态流转、异常处理与测试关注点，供测试人员进行功能验证、交互验收与边界场景覆盖。

---

## 2. 页面定位

AI 诊断助手页面用于帮助运维人员从告警列表中快速发起故障诊断，并基于 AI 完成根因分析、修复建议查看、报告查阅与知识归档。

页面由两部分组成：

- 左侧：告警列表区
- 右侧：诊断工作区

---

## 3. 页面结构说明

### 3.1 左侧告警列表区

包含以下模块：

- 告警列表标题区
- 搜索框
- 筛选区
- 告警卡片列表

### 3.2 右侧诊断工作区

包含以下模块：

- 面包屑/当前功能标识区
- 欢迎态 / 空状态内容区
- AI 对话 / 任务流展示区
- 底部输入框
- 输入框上方的“已选告警吸附区”

---

## 4. 告警列表规则

### 4.1 排序规则

左侧告警列表默认按以下规则排序：

#### 一级排序：告警严重级别降序
排序优先级为：

1. 严重
2. 重要
3. 次要
4. 警告
5. 信息

#### 二级排序：同级别内按最新更新时间倒序
即：
- 同一严重级别下，更新时间越新，越靠上展示

---

### 4.2 告警卡片基础信息

每张告警卡片需至少展示：

- 告警级别
- 告警类型
- 告警标题
- 所属对象/服务名
- 收敛数量（如有）
- 触发时间（当天触发：HH:MM:SS； 非当天触发：MM-DD HH:mm； 跨年触发：YYYY-MM-DD HH:mm；）
- 操作按钮：\`一键诊断\`

---

### 4.3 告警卡片可执行动作

每张告警卡片支持两类独立操作：

#### 操作 A：点击卡片主体
用于“选中告警”，不直接启动诊断流程，将吸附在右侧输入框顶部，支持与自然语言一起发送给AI。

#### 操作 B：点击「一键诊断」
用于直接启动该告警的根因分析流程。

---

## 5. 告警卡片交互规则

### 5.1 点击卡片主体：选中逻辑

当用户点击告警卡片主体时：

#### 系统行为
- 该卡片进入“选中态”
- 右侧输入框上方生成一条“已选告警吸附卡片”
- 右侧不立即进入根因分析流程
- 输入框保留可继续输入的能力

#### 设计意图
- 支持用户先绑定告警上下文，再补充问题后发起诊断
- 满足“带上下文提问”而不是“立即分析”的使用场景

---

### 5.2 吸附卡片规则

当左侧告警被选中后，右侧输入框上方需展示对应的吸附卡片。

#### 吸附卡片展示内容建议
- 告警标题
- 严重级别
- 来源
- 类型（指标/链路/日志/拨测/其他）
- 持续时间
- 触发时间
- 可选：移除按钮 / 取消选择按钮

#### 吸附规则
- 同一时刻仅允许吸附 1 条告警
- 若用户再次点击其他告警卡片，则替换当前吸附内容
- 吸附后输入框仍可继续输入文本
- 吸附卡片仅表示“上下文绑定成功”，不代表已启动分析

---

### 5.3 点击「一键诊断」：直接诊断逻辑

当用户点击某张告警卡片上的 \`一键诊断\` 按钮时：

#### 系统行为
- 自动将该告警作为当前诊断对象
- 若右侧已有其他吸附告警，则替换为当前告警
- 直接进入根因分析流程
- 右侧从空状态切换为“AI 任务流执行态”

#### 设计原则
根据既有规范，点击告警卡片仅完成上下文绑定，必须点击 \`一键诊断\` 才真正启动诊断流程。

---

## 6. 右侧工作区状态定义

### 6.1 空状态

触发条件：
- 页面初次进入
- 当前未选中任何告警
- 未发起任何诊断任务

展示内容：
- AI 诊断专家说明文案
- 输入框占位提示
- 不展示任务流内容

---

### 6.2 已选中未诊断状态

触发条件：
- 用户点击左侧告警卡片主体
- 尚未点击 \`一键诊断\`
- 尚未发送输入框内容触发诊断

展示内容：
- 输入框上方显示吸附告警卡片
- AI 主体区域仍可为默认态，或进入“待发起诊断”提示态
- 用户可继续补充文本后发起分析

---

### 6.3 诊断进行中状态

触发条件：
- 用户点击 \`一键诊断\`
- 或用户在吸附告警后，通过输入框发送诊断请求

展示内容：
- 右侧进入任务流执行区
- 展示阶段进度、执行状态、关键结果
- 输入框可根据产品策略设为可继续追问，或在执行中临时限制重复触发

---

### 6.4 诊断完成状态

触发条件：
- 根因分析流程全部执行完成

展示内容：
- 根因结论
- 推荐操作
- 根因分析报告入口
- 归档到知识库入口

---

## 7. 根因分析主流程

根因分析流程采用三步任务流结构：

### Step 1：告警解析与拓扑发现
对应阶段：初始化调查与范围界定。

#### 触发方式
- 用户点击 \`一键诊断\`

#### 系统动作
- 自动提取告警元数据：对象、时间、级别等
- 调用拓扑图谱 API，识别受影响调用链路
- 在任务流中展示关键调用路径
- 当前步骤状态更新为“解析完成 / 拓扑调用成功”

---

### Step 2：多智能体并行诊断
对应阶段：深度证据探索与路径验证。

#### 系统动作
- 分配多个分析智能体并行执行
- 分析链路
- 采集指标
- 识别监控缺失、调用失败、接口异常等证据
- 实时展示各分析器状态：运行中 / 成功 / 失败

#### 页面要求
- 每个分析节点需有状态标识
- 失败与异常证据需可见，不可静默吞掉

---

### Step 3：结果汇总与修复方案
对应阶段：根因确认、结论输出与操作落地。

#### 系统动作
- 汇总所有分析证据
- 输出结构化根因结论
- 输出推荐操作建议
- 提供三个核心操作入口：
  - \`一键执行修复\`
  - \`根因分析报告\`
  - \`归档\`

#### 页面要求
- 根因结论需清晰可读
- 推荐操作与报告入口需在分析完成后出现
- 任务流状态更新为“已完成”

---

## 8. 结果区后续交互

### 8.1 点击「一键执行修复」

点击后不弹窗，而是在 AI 对话流中插入一张“操作授权卡片”。

#### 卡片需包含
- 风险提示
- 执行预览（Dry Run）
- 影响范围
- 操作按钮：
  - \`取消\`
  - \`授权并执行\`

#### 用户点击授权并执行后
- 卡片切换为执行日志视图
- 实时滚动展示执行日志
- 最终输出执行成功或失败结论

---

### 8.2 点击「根因分析报告」

点击后从右侧滑出全屏抽屉，或以宽屏模态形式展示完整报告。

#### 报告内容应包含
1. Header 区
2. 执行摘要
3. 故障时间轴
4. 拓扑与证据快照
5. 后续预防建议

#### 支持操作
- 导出
- 分享
- 关联知识库/工单

---

### 8.3 点击「归档到知识库」

该入口应出现在根因分析完成后的结果区域底部，为弱化按钮，不打断主流程。

#### 初始态
- 展示按钮： \`归档\`

#### 点击后
在按钮下方 Inline 展开归档区，不使用弹窗。

展开后字段：
- 知识库选择器
- 确认归档按钮

#### 交互规则
- 未选择知识库时，确认按钮禁用
- 选择知识库后，确认按钮可点击
- 点击确认后调用归档接口
- 成功后展示：
  - \`已归档到 xxx 知识库\`
  - \`文档名称\`
  - \`查看知识库\`

---

## 9. 状态流转关系

### 9.1 左侧告警卡片状态

告警卡片可存在以下状态：

- 默认态
- Hover态
- 选中态
- 诊断中态
- 不可操作态（异常情况下）

---

### 9.2 右侧工作区状态流转

主状态流转如下：

\`空状态\`
→ \`已选中未诊断\`
→ \`诊断进行中\`
→ \`诊断完成\`
→ \`修复执行中 / 报告查看 / 归档展开\`

---

## 10. 异常与边界场景

### 10.1 告警选择相关

#### 场景 1：重复点击同一张卡片
预期：
- 保持选中态
- 不重复生成多个吸附卡片

#### 场景 2：已有吸附卡片时再选另一张
预期：
- 替换为新卡片
- 不允许多条同时吸附

#### 场景 3：点击卡片后未做任何操作
预期：
- 仅完成绑定，不自动分析

---

### 10.2 一键诊断相关

#### 场景 4：连续快速点击一键诊断
预期：
- 仅触发一次有效请求
- 按钮进入 loading 或禁用态，防止重复发起

#### 场景 5：诊断接口失败
预期：
- 右侧显示失败提示
- 保留当前告警上下文
- 支持重试

#### 场景 6：拓扑接口失败但基础诊断仍可继续
预期：
- 明确提示拓扑获取失败
- 保留后续步骤可继续执行的能力，或按策略中断并提示原因

---

### 10.3 归档相关

#### 场景 7：未选择知识库直接确认
预期：
- 按钮不可点击

#### 场景 8：归档接口失败
预期：
- 展示失败提示
- 支持重试
- 不影响已有诊断结果查看

---

### 10.4 修复相关

#### 场景 9：执行授权后日志中断
预期：
- 显示执行异常状态
- 输出失败原因或超时提示
- 不可只停留在 loading

---

## 11. 测试重点建议

### 11.1 核心功能验证
- 告警列表排序是否符合“严重级别优先 + 同级按更新时间倒序”
- 点击卡片是否仅选中，不触发诊断
- 点击一键诊断是否直接进入根因分析
- 吸附卡片是否只允许单条存在
- 诊断流程是否严格按步骤流转
- 分析完成后是否展示推荐操作、报告入口、归档入口

### 11.2 状态验证
- 卡片选中态是否清晰
- 任务流各步骤状态是否正确
- 按钮 loading / disabled / success / error 是否完整

### 11.3 边界验证
- 快速重复点击
- 网络慢 / 超时 / 接口失败
- 告警切换时上下文替换是否正确
- 报告与归档入口在异常情况下是否仍能正确展示或禁用

### 11.4 一致性验证
- 左侧当前操作对象与右侧诊断对象是否始终一致
- 一键诊断触发对象是否与吸附对象一致
- 归档内容是否对应当前分析结果，而非历史结果

---

## 12. 验收口径

满足以下条件可视为交互验收通过：

1. 左侧列表排序规则准确无误
2. 卡片点击与一键诊断两类动作语义清晰且不混淆
3. 右侧吸附机制稳定，仅单条存在
4. 根因分析流程可完整执行并正确展示状态
5. 分析结果后的修复、报告、归档入口完整可用
6. 异常场景下有明确反馈，不出现静默失败或状态错乱` },
      { id: 'diag-archive', title: '归档交互流程', content: `# AI SRE - 根因分析报告归档交互方案

---

## 一、设计目标

在 AI 完成根因分析后，提供一个轻量入口，引导用户将本次分析报告归档到指定知识库，形成可复用的运维知识资产。

设计原则：
- 不打断主流程（诊断 / 执行操作）
- 操作路径最短（1次选择 + 1次点击）
- 无额外填写成本
- 渐进式交互（按需展开）

---

## 二、交互位置

所属区域：右侧 AI 诊断结果面板底部

层级关系（从上到下）：
1. 根因结论（ROOT CAUSE）
2. 推荐操作（RECOMMENDED PLANS）
3. 主操作按钮（建议执行修复 / 根因分析报告）
4. ↓（新增按钮）
5. [归档到知识库]

界面结构：

[建议执行修复]   [根因分析报告]  
↓  
[归档到知识库]

---

## 三、交互方式（按钮触发）

初始形态：

[归档到知识库]

类型：Secondary Button（弱于主操作）

设计意图：
- 不打断用户主任务（处理故障）
- 提供明确但低干扰的知识沉淀入口

---

## 四、点击后展开（Inline 展开，不弹窗）：

📚 归档到知识库  
[选择知识库 ▼]     [确认归档]

展开方式说明：
- 默认采用 Inline 展开（按钮下方展开）
- 不遮挡当前诊断内容
- 不允许使用 Modal（避免打断流程）
- 空间不足时可降级为 Popover

---

## 五、字段设计

1. 知识库选择器

类型：Dropdown（下拉选择）

默认值策略：
- 优先使用「最近使用的知识库」
- 若无历史记录 → 默认「SRE故障案例库」

下拉内容：
- 最近使用的知识库
- 没有使用过的展示系统默认知识库

---

2. 标题（系统自动生成，不展示）

标题由系统自动生成，不在当前界面展示，也不可编辑。

生成规则：
{服务名} + {问题描述} + {告警ID}

示例：
- order-service 错误率升高根因分析报告
- payment P99 延迟告警根因分析报告
- 数据库连接异常根因分析报告

---

3. 确认归档按钮

类型：Primary Button

状态规则：
- 未选择知识库 → disabled
- 已选择知识库 → active（可点击）

---

## 六、交互流程

Step 1：AI分析完成  
系统展示：
- 根因结论
- 推荐操作
- 页面底部出现「归档」按钮

---

Step 2：用户点击按钮  
系统行为：
- 在按钮下方展开归档操作区域

---

Step 3：用户选择知识库  
用户行为：
- 点击下拉框
- 选择目标知识库

系统行为：
- 激活「确认归档」按钮

---

Step 4：用户确认归档  
用户行为：
- 点击「确认归档」

系统行为：
- 调用归档接口
- 将本次根因分析报告写入知识库

---

Step 5：归档成功反馈  

界面状态更新为：

✅ 已归档到「SRE故障案例库」  
[查看知识库]

同时提示 Toast：

根因分析报告已成功归档到知识库

---

## 七、状态设计

初始态：
[归档到知识库]

---

展开态（未选择）：

📚 归档到知识库  
[选择知识库 ▼]     [确认归档（disabled）]

---

展开态（已选择）：

📚 归档到知识库  
[已选择：SRE故障案例库 ▼]     [确认归档]

---

成功态：

✅ 已归档到「SRE故障案例库」  
[查看知识库]
点击后跳转新窗口打开该知识库

---

异常态（可选）：

归档失败，请稍后重试  
[重试]

---

## 八、交互约束

- 不弹窗（避免打断诊断流程）
- 不强制用户归档
- 不提供“取消/不归档”按钮（用户可忽略）
- 不展示标签、分类、结构化字段
- 不展示内容预览
- 不允许编辑标题
- 保持最小操作路径（选择 + 点击）

---

## 九、设计总结

该方案实现：
- 极简交互（最低操作成本）
- 非侵入式体验（不打断用户主流程）
- 清晰闭环（诊断 → 归档 → 知识沉淀）
- 可扩展能力（未来可接入AI推荐、分类、去重等）

---

## 十、未来扩展（非当前版本）

（不在本期实现）

- AI推荐知识库
- 相似案例检测（去重）
- 自动分类（问题类型）
- 知识库结构化增强
- 与AI知识助手联动（RAG）` },
    ]
  },
  {
    id: 'knowledge',
    title: '知识专家',
    icon: <BookOpen size={16} />,
    children: [

      { id: 'know-flow', title: '知识检索交互流程规则', content: `# AI 运维知识助手 Markdown 文档

## 一、产品定位

AI 运维知识助手是一个融合以下能力的运维知识工作台：

- 知识浏览（Browse）
- AI 问答（Ask）
- 数据溯源（Trace）

系统基于企业内部知识库，为用户提供：

- 标准操作流程（SOP）查询
- 架构与系统说明
- 故障排查与复盘经验
- 结构化运维建议
- 可验证的答案来源

---

## 二、设计目标

### 核心目标

1. 提供 AI + 文档双路径获取知识
2. 提升运维问题定位效率
3. 确保答案可信（可溯源）
4. 支持从“查文档”到“问问题”的自然过渡

### 设计原则

- 所有回答支持可溯源
- 默认简洁，按需展开信息
- 输出结构化优于对话式
- 明确能力边界（避免误导）
- 浏览与问答分离但可切换
- 检索过程透明化（增强可信度）

---

## 三、关键能力边界（必须明确）

- AI 回答粒度：知识库级（Knowledge Base Level）

### 当前不支持

- 基于单文档回答
- 限定某一文档范围提问

---

## 四、页面信息架构

页面结构分为：

- 主工作区（知识库选择/问答）
- 右侧：溯源抽屉（默认隐藏，按需触发）

---

## 五、核心模式划分


---

## 六、知识浏览流程

### 流程 1：进入知识库

#### 用户操作

- 点击选择知识库

#### 气泡展示

- 知识库名称
- 标签
- 更新时间
- xx 篇文档
- 全选按钮


#### 操作区

- ✔ 去 AI 助手提问（基于当前选择的知识库/未选择时按照通用场景考虑）
- ✔ 加入当前问答范围（知识库级）

#### 关键提示

- AI 回答基于整个知识库生成，而非当前文档

---

## 七、AI 问答流程（增强版）

### 流程 3：选择知识库

当前知识范围：

- [标准 SOP]
- [架构文档]



### 流程 4：输入问题

请输入运维问题、故障现象或日志信息。

### 流程 5：AI 检索与生成（核心增强）

#### 5.1 检索阶段总览

正在基于所选知识库检索相关内容...

#### 5.2 检索过程分阶段展示

##### 阶段 1：问题解析

- 阶段 1：问题语义理解

识别信息：

- 故障对象：pod
- 故障现象：持续重启
- 关键词：CrashLoopBackOff / 启动失败

##### 阶段 2：知识库检索

- 阶段 2：检索方式

已检索关键词：

- 标准 SOP
- Kubernetes 手册


##### 阶段 3：命中文档筛选

- 阶段 3：候选文档召回

高相关文档片段统计（Top 8），并根据初步分值进行第一次过滤，并保留x篇核心文档：


##### 阶段 4：证据提取与归纳

- 阶段 4：重排序&片段精提

提取结果：

- 保留最相关片段：x 段
- 相似度：0.91/0.87


##### 阶段 5：生成回答

- 阶段 5：构建上下文

#### 5.3 展示策略

- 检索过程中：默认展示
- 检索完成后：自动收起
- 支持「查看知识检索过程」展开完整过程
---


## 九、数据溯源机制（增强版）

### 9.1 来源摘要

- [查看来源]

### 9.2 来源详情（抽屉）

每条来源包含：

- 文档名称：Pod 重启排查 SOP
- 相关度：0.92
- 命中章节：pod 重启
- 标签
- [跳转查看原文]


### 9.3 原文片段

- 高亮展示
- 标识引用位置
- 展示所属的页码 


---

## 十、推荐追问

- 标准 SOP 是什么？
- 历史案例有哪些？
- 如何确认根因？

---

## 十一、继续追问

- 保持上下文
- 基于当前知识范围

---

## 十二、异常与边界

### 未选择知识库

支持通用回答

### 未命中

建议扩大范围或补充信息。

### 命中不足

当前回答基于少量资料，请谨慎参考。

### 文档异常

- 空
- 加载失败

---

## 十三、核心流程总结


### 问答路径

选择知识库 → 输入问题 → 检索 → 回答 → 查看来源 → 抽屉 → 继续追问

---

## 十四、设计策略总结

### 1. 双路径

问答

### 2. 渐进式信息

默认简洁 → 按需展开

### 3. 检索透明化（核心升级）

让用户看到：

- 检索范围
- 命中数量
- 文档质量
- 证据来源

### 4. 用溯源建立信任

- AI 总结
- 用户验证

### 5. 明确能力边界

避免误解 AI 精度

---

## 十五、组件定位

### 组件名称

检索过程摘要组件（Retrieval Summary）

### 放置位置（非常关键）

👉 放在 AI 回答卡片顶部


### 二、默认展示（核心 UI）

#### 2.1 完成态（最终效果）
 
[知识检索过程]

#### 2.2 加载态

🔍 知识检索过程...



### 三、交互行为

#### 4.1 点击行为

点击「知识检索过程」  
👉 展开一个折叠面板（Accordion）

#### 4.2 收起行为

- 再次点击 → 收起


---` },
    ]
  },
  {
    id: 'inspection',
    title: '巡检助手',
    icon: <FileText size={16} />,
    children: [
      { id: 'ins-targets', title: '巡检对象选择提示交互逻辑', content: `# AI巡检助手 - 巡检对象选择数量提示交互（原型生成版）

## 一、页面说明
该页面为「AI巡检助手 - 新建任务」流程中的「巡检对象选择」步骤。  
用户在右侧面板中选择巡检对象，系统在底部实时反馈选择数量及对应的报告生成成本（时间 & 性能风险）。

---

## 二、页面结构

### 布局
- 左侧：巡检对象分类列表（数据库 / Redis / MQ / 应用服务 / 云主机 / VPC 等）
- 右侧：对象选择列表（支持勾选）
- 顶部：搜索框（按名称筛选对象）
- 底部：状态提示区 + 操作按钮

---

## 三、底部状态提示区（核心交互）

### 位置
固定在选择面板底部，紧邻「确认执行」按钮

### 结构
--------------------------------------------------
| 共选中：X 项 | 状态提示信息                     |
|                                                |
|                          [确认执行]             |
--------------------------------------------------

---

## 四、交互逻辑

### 1. 初始状态（未选择）
- 共选中：0 项  
- 提示文案：
  将根据所选巡检对象生成 AI 巡检报告，选择数量越多，生成耗时越长  
- 按钮状态：
  [确认执行] 禁用

---

### 2. 实时反馈机制
用户每勾选 / 取消勾选对象时：
- 实时更新：
  - 已选数量（X）
  - 预计生成时间
  - 风险提示等级
- 无需点击确认即可动态变化

---

## 五、数量分级策略

| 等级 | 数量范围 | 状态 | UI表现 | 是否允许执行 |
|------|----------|------|--------|--------------|
| L1 | 1 ~ 10 | 正常 | 默认颜色（灰） | 是 |
| L2 | 11 ~ 20 | 提醒 | 蓝色提示 | 是 |
| L3 | 21 ~ 30 | 警告 | 黄色提示 | 是 |
| L4 | > 30 | 超限 | 红色提示 | 否 |

---

## 六、提示文案规则

### L1 正常状态（1~10）
共选中：6 项  
预计报告生成时长：约 30s ~ 1min  

---

### L2 提醒状态（11~20）
共选中：14 项  
巡检范围较大，预计报告生成时间将有所增加（约 1~3 分钟）

---

### L3 警告状态（21~30）
共选中：26 项  
当前巡检范围较大，可能导致报告生成时间明显变长，建议缩小范围或分批执行（约 3~6 分钟）

UI要求：
- 文案颜色：黄色
- 可配警告图标（⚠️）

---

### L4 超限状态（>30）
共选中：32 项  
已超出单次巡检建议上限，可能影响系统性能与报告稳定性，请减少巡检对象数量后再执行

UI要求：
- 文案颜色：红色
- 按钮禁用

---

## 七、按钮状态逻辑

### 「确认执行」按钮规则
- 未选择：禁用
- L1 / L2 / L3：可点击
- L4：禁用

---

### 禁用提示（hover 或下方提示）
当前选择数量已超出上限（最多 30 项）

---

## 八、时间估算规则（用于显示，待定）

| 数量范围 | 时间估算 |
|----------|----------|
| 1~5 | 30s 内 |
| 6~10 | 30s ~ 1min |
| 11~20 | 1~3 min |
| 21~30 | 3~6 min |
| >30 | 不支持 |

说明：
- 时间为区间估算，不要求精确
- 可根据后端能力动态调整

---

## 九、辅助信息（顶部说明）

在选择面板顶部增加一行说明：

建议单次巡检对象不超过 30 项

---

## 十、用户完整流程

1. 用户点击「新建任务」
2. 进入巡检对象选择界面
3. 用户开始勾选巡检对象
4. 底部状态区实时反馈：
   - 已选数量
   - 预计耗时
   - 风险等级
5. 当数量增加：
   - 提示从正常 → 提醒 → 警告
6. 当超过上限：
   - 提示变为红色
   - 「确认执行」禁用
7. 用户调整选择数量
8. 点击「确认执行」
9. 进入 AI 巡检分析流程

---

## 十一、设计原则

- 即时反馈：选择即看到成本变化
- 渐进提示：从轻提示到强限制
- 明确边界：提供清晰上限（30项）
- 避免打断：仅在超限时强制拦截

---` },
      { id: 'ins-full-flow', title: '巡检整体交互流程', content: `# AI 巡检助手交互与分析方案

## 1. 巡检对象类型

系统支持多类型巡检对象（统一抽象），根据当前采集情况判断：

- 主机（Host）
- 应用服务（Service）
- 容器 / Pod（Container）
- 数据库（Database）
- 中间件（Middleware）

---

## 2. 每个巡检对象的基础信息

### 2.1 基础属性

- 对象名称（如：\`order-service\` / \`10.0.1.45\`）
- 类型（Service / Host 等）
- 所属环境（\`prod\` / \`staging\`）
- 所属集群
- 最近部署时间（可选）

---

## 3. 核心指标结构（用于详情页展示）

### 3.1 资源类指标

- CPU 使用率（%）
- 内存使用率（%）
- 磁盘使用率（%）

### 3.2 运行状态指标

- 线程数（Thread Count）
- 负载（Load Average）
- 进程状态（Running / Crash）

### 3.3 JVM / 应用指标（如适用）

- Heap 使用率（Eden / Old Gen）
- GC 次数（Minor / Full）
- GC 停顿时间（Pause Time）

### 3.4 业务与错误指标

- 错误率（Error Rate）
- 请求成功率
- QPS / TPS
- 异常日志数量

---

## 4. 整体架构

### 4.1 页面结构

**一级页面：巡检任务面板**

- 左侧：任务列表
- 右侧：AI 对话面板（支持分析选中任务）

↓

**二级页面：任务详情页**

- 左侧：任务详情（数据与证据）
- 右侧：AI 对话面板（分析当前任务）

↑ 支持返回一级页面

---

## 5. 核心设计原则

- 分层结构：列表页 → 详情页
- 左侧负责数据（What）
- 右侧负责分析（Why + Next）
- AI 分析由用户手动触发
- 页面支持返回，保持操作路径清晰

---

## 6. 主流程（核心用户路径）

### 6.1 用户进入巡检任务面板

- 浏览任务列表
- 识别异常 / 高风险任务

### 6.2 用户选择任务

路径：

- 点击「开始分析」
- 右侧 AI 面板开始分析（不跳转页面）

### 6.3 AI 输出结果

- 右侧 AI 输出分析过程与结果
- 用户执行推荐动作

---

## 7. 一级页面：巡检任务面板

### 7.1 任务列表

#### 功能

- 展示巡检任务卡片
- 支持任务选择
- 支持任务分析

#### 卡片信息结构

每个巡检任务卡片包含：

- 任务名称
- 巡检对象（根据当前采集的资源类型）
- 当前状态（根据当前可采集到的状态：巡检中 / 已结束）
- 风险等级（根据当前可采集到的等级：健康 / 异常）
- 异常摘要（简要描述问题，根据可实现情况可选展示）
- 最近更新时间

#### 卡片操作

- 主按钮：「开始分析」
- 点击卡片：吸附在输入框上方，作为提问上下文

#### 状态流转

\`未分析 → 分析中 → 查看报告\`

---

### 7.2 AI 对话面板（右侧）

#### 功能

- 支持分析当前选中任务
- 展示分析过程与结果

#### 未分析状态

当未触发分析时：

> 当前任务尚未进行 AI 分析

按钮：

- 「开始分析」

#### 分析触发

用户点击「开始分析」后：

- AI 开始分阶段分析
- 右侧展示分析过程

---

## 8. 关键交互补充

### 8.1 分析中

- 按钮显示 Loading 状态
- AI 流式输出分析过程

### 8.2 已分析

- 展示「查看报告」
- 支持重新分析
- 若定时巡检任务完成后需要自动分析，则自动生成巡检报告，无需人工手动点击分析

---

## 9. 系统能力边界

### 9.1 当前支持

- 异常识别
- 分阶段分析
- 推荐分析动作

### 9.2 暂不支持

- 自动修复
- 长期优化建议

---

## 10. AI 分析流程（分阶段 · 可视化增强版）

### 阶段 1：启动调查（Initialization）

#### 目标

识别巡检对象与异常入口，建立分析上下文。

#### AI 行为

- 确认巡检对象（类型 / 名称 / 环境）
- 加载基础指标数据（CPU / 内存 / GC / 错误率等）
- 获取最近时间窗口数据（如近 30 分钟）
- 初步识别异常指标（超过阈值或明显偏离基线）

#### 输出（结构化 + 数据化）

##### （1）巡检对象信息

| 字段 | 内容 |
|---|---|
| 对象名称 | order-service |
| 类型 | Service |
| 环境 | prod |
| 集群 | cluster-A |

##### （2）关键指标快照

| 指标 | 当前值 | 阈值 | 状态 |
|---|---:|---:|---|
| CPU 使用率 | 92% | 80% | 异常 |
| 内存使用率 | 88% | 80% | 偏高 |
| 错误率 | 3.2% | 1% | 异常 |

##### （3）异常指标列表

- CPU 使用率异常升高（92%）
- 内存使用率接近上限（88%）
- 错误率明显上升（3.2%）

---

### 阶段 2：路径与证据探索（Exploration）

#### 目标

基于时间维度与多指标关系，分析异常发展路径。

#### AI 行为

- 分析指标趋势（时间序列）
- 识别趋势模式（上升 / 波动 / 突变）
- 关联指标关系（CPU ↔ 内存 ↔ 错误率）
- 对比历史数据（昨日 / 基线）
- 检查异常时间点（如发布 / 波动）

#### 输出（图表 + 表格 + 描述）

##### （1）指标趋势图（必须）

**CPU Usage Trend (Last 30 min)**

- x: [10:00, 10:05, 10:10, 10:15, 10:20, 10:25, 10:30]
- y: [65, 70, 75, 82, 88, 90, 92]

**Memory Usage Trend (Last 30 min)**

- x: [10:00, 10:05, 10:10, 10:15, 10:20, 10:25, 10:30]
- y: [60, 65, 70, 75, 80, 85, 88]

##### （2）趋势摘要

- CPU 使用率在过去 30 分钟持续上升
- 内存使用率同步增长，未出现明显回落
- 错误率存在波动上升趋势

##### （3）历史对比表

| 指标 | 当前值 | 昨日同时间 | 阈值 |
|---|---:|---:|---:|
| CPU 使用率 | 92% | 68% | 80% |
| 内存使用率 | 88% | 64% | 80% |
| 错误率 | 3.2% | 0.8% | 1% |

##### （4）多指标关联分析

| 指标 | 当前状态 | 趋势 | 关联关系 |
|---|---|---|---|
| CPU | 高 | 持续上升 | 与线程数相关 |
| 内存 | 高 | 持续上升 | 无明显回收 |
| 错误率 | 异常 | 波动上升 | 与流量无明显关联 |

##### （5）异常时间点标记（可选）

**CPU Usage with Event**

- x: [10:00, 10:05, 10:10, 10:15, 10:20]
- y: [60, 65, 70, 85, 92]
- events:
  - time: 10:15
  - label: 异常开始

---

### 阶段 3：确认原因（Diagnosis）

#### 目标

基于证据收敛可能原因（不做绝对判断）。

#### AI 行为

- 综合多指标趋势与关系
- 匹配常见异常模式（如资源压力 / 异常负载）
- 排除明显不相关因素
- 标识信息缺口（未验证数据）

#### 输出（结构化推理）

##### （1）可能原因（候选）

| 可能原因 | 支撑证据 | 说明 |
|---|---|---|
| 资源压力 | CPU + 内存同步上升 | 资源占用持续增加 |
| 异常请求 | 错误率上升 | 但未与流量直接关联 |

##### （2）关键证据总结

- CPU 与内存同步上升
- 内存未观察到明显回收行为
- 错误率存在异常波动

##### （3）未确认信息（重要）

- 未获取线程堆栈信息
- 未分析 Heap 结构
- 未确认请求类型变化

---

### 阶段 4：最终结论（Conclusion）

#### 目标

输出当前阶段分析结果（基于已有数据）。

#### 输出（结构化结论）

##### （1）问题概览

| 维度 | 内容 |
|---|---|
| 问题类型 | 资源使用异常 |
| 影响范围 | 当前服务实例 |
| 状态 | 持续中 |

##### （2）关键发现

- CPU 使用率持续高位（92%）
- 内存使用率持续上升（88%）
- 错误率出现异常波动（3.2%）

##### （3）指标关系总结

- CPU 与内存同步增长
- 未观察到明显资源释放行为
- 错误率未与流量变化形成直接关联

##### （4）当前判断

- 存在资源压力风险
- 可能影响服务稳定性与响应性能

##### （5）不确定性说明（必须）

- 当前分析基于指标数据
- 未进行深度诊断（如线程 / Heap）
- 结论存在一定不确定性

##### （6）下一步建议（简化版）

- 建议查看详细日志
- 建议持续关注资源变化趋势
- 建议确认近期是否存在发布或配置变更

---

## 11. 总体输出结构（统一规范）

\`\`\`text
指标快照
↓
趋势图（至少 1 个）
↓
对比表（至少 1 个）
↓
多指标关联表
↓
原因分析
↓
\`\`\`` },
      { id: 'ins-new-flow', title: '巡检新建任务整体流程', content: `# AI SRE 平台 - AI巡检助手「新建巡检任务」重构版交互文档（可直接用于 AI 生成原型）

## 一、需求背景

当前「AI巡检助手」在新建巡检任务时，用户需要先选择巡检对象类型与具体对象，然后再自行输入巡检规则，或从快捷指令中手动选择规则。

该方案存在以下问题：

1. 用户仍需自己思考“应该配置哪些规则”，使用门槛较高。
2. 不同巡检对象类型所关注的核心指标不同，当前规则推荐不够贴合对象特征。
3. 规则创建路径偏手动，效率不高，无法体现 AI 在运维场景中的辅助价值。
4. 用户更希望系统先给出一套“可直接使用”的规则草案，而不是从零开始写。

因此，本次交互重构目标为：

- 在用户确定巡检对象后，由 AI 根据对象类型、对象角色、常见风险自动生成一套推荐巡检规则草案。
- 用户只需要对推荐规则进行确认、少量调整或新增，即可完成任务创建。
- 整体交互从“用户手动写规则”升级为“系统先生成规则草案，用户再编辑确认”。

---

## 二、设计目标

### 1. 降低任务创建门槛
用户无需从零思考巡检规则，系统自动生成推荐内容。

### 2. 提升推荐规则的场景贴合度
推荐规则应结合巡检对象类型、角色特征、常见健康风险进行生成，而不是仅展示固定通用规则。

### 3. 强化 AI 的辅助感
AI 不只是提供几条快捷规则，而是输出一套可直接使用的“巡检规则草案”。

### 4. 保留用户控制权
用户可以对 AI 推荐的规则进行启用、禁用、编辑和新增，避免系统完全自动决定。

---

## 三、适用范围

适用于 AI SRE 平台中「AI巡检助手」页面的「新建任务」流程，重点覆盖以下巡检对象类型（具体根据资源采集类型）：

- 数据库
- 应用服务
- 云主机
- Redis
- MQ
- 负载均衡
- VPC
- 网络类资源

---

## 四、核心交互思路

在用户完成“巡检对象类型 + 巡检对象选择”后，系统不再要求用户立即手动输入巡检规则，而是进入：

## 第二步：AI 自动生成推荐巡检规则草案

系统根据已选对象，自动生成一套可编辑的规则草案，草案由三部分组成：

### 1. 基础推荐规则
基于对象类型自动装配的一组通用核心指标规则，默认勾选。

### 2. 自定义补充规则
用户可以在 AI 推荐基础上，自行新增自定义巡检规则。

---

## 五、整体流程

### 流程步骤

1. 用户进入「AI巡检助手」页面
2. 点击「新建任务」
3. 在 AI 对话流中选择巡检对象类型
4. 选择具体巡检对象
5. 点击「确认执行」
6. 系统进入“AI 生成推荐巡检规则草案”阶段
7. 用户查看规则草案
8. 用户对规则进行编辑、删除、新增
9. 用户确认规则后，进入“设置执行频率”
10. 用户设置任务名称、执行频率、执行时间等信息
11. 用户确认创建巡检任务
12. 系统创建成功，返回任务详情或任务列表

---

## 六、页面交互结构

## 1. 新建任务入口区

页面底部保留原有快捷入口：

- 新建任务
- 今日报告
- 诊断任务

用户点击「新建任务」后，进入 AI 对话式任务创建流程。

---

## 2. 第一步：选择巡检对象
（保留当前交互）

## 七、第二步：AI 自动生成推荐巡检规则草案

当用户确认巡检对象后，进入该阶段。

### AI 对话提示文案

**已为您选定的 3 个巡检对象生成推荐巡检规则草案。您可以直接使用，也可以按需调整。**

次级说明：

**系统会根据对象类型、对象角色和常见健康风险自动推荐指标规则，您也可以新增自定义规则。**

---

## 八、规则草案生成逻辑

系统推荐逻辑采用“模板装配 + AI增强”的方式：

### 1. 模板装配
按巡检对象类型自动带出通用规则模板。

### 2. AI增强
结合以下信息进行规则补充、排序 and 差异化推荐：

- 巡检对象类型
- 对象名称特征
- 所属集群
- 主从角色
- 服务角色
- 常见风险类型
- 历史高频巡检指标
- 最近变更信息（若系统可获取）
- 环境属性（生产 / 测试）

---

## 九、规则草案展示结构

规则草案区分为两个层级：

### 1. 基础推荐规则
- 默认展开
- 默认勾选
- 面向绝大多数用户
- 用于快速创建任务

---

## 十、规则草案区域布局

### 区域标题
**推荐巡检规则草案**

### 区域摘要信息
展示一行摘要：

**已为 3 个数据库对象生成 6 条推荐规则，重点覆盖资源使用、主从健康与查询性能风险。**

---

## 十一、按类型分组展示规则

若用户所选对象包含多种类型，则按对象类型分组展示。

### 示例分组标题
#### 数据库（3个对象）

每组下展示对应推荐规则列表。

---

## 十二、单条规则卡片结构

每条规则以可编辑卡片形式展示，而不是纯文本标签。

### 单条规则卡片示例

#### 规则名称
CPU 使用率

#### 适用对象
mysql-order-primary、mysql-order-replica、pg-user-master

#### 规则内容
- 指标：CPU 使用率
- 条件：>
- 阈值：80%
- 持续时间：5 分钟
- 严重等级：高

#### 推荐理由
适用于数据库资源瓶颈的基础健康巡检，可用于识别高负载风险。

#### 交互操作
- 输入框内直接编辑
- 按钮：[删除]

---

## 十三、基础推荐规则示例（数据库场景）

当用户选择数据库类型对象时，系统可默认推荐以下基础规则：

1. CPU 使用率 > 80% 持续 5 分钟
2. 内存使用率 > 80% 持续 5 分钟
3. 磁盘使用率 > 85% 持续 10 分钟
4. 主从延迟 > 30 秒 持续 3 分钟
5. 数据库连接数持续异常升高
6. 慢查询数量异常升高

---

## 十五、不同对象类型的推荐规则策略

## 1. 云主机类
基础推荐：
- CPU 使用率
- 内存使用率
- 磁盘使用率
- 网络延迟
- 网络丢包率

## 2. 应用服务类
基础推荐：
- 服务错误率 > 5% 持续 3 分钟
- 响应时间 P95 异常升高
- 实例异常退出
- CPU / 内存使用率持续升高

## 3. Redis 类
基础推荐：
- 内存使用率过高
- 连接数异常增长
- 命中率下降
- 主从同步异常

## 4. MQ 类
基础推荐：
- 消息堆积异常
- 消费延迟异常
- 消费失败率升高

---

## 十六、规则编辑交互

用户点击某条规则的【编辑】后，展开该规则的可编辑表单。

### 可编辑字段

- 指标名称
- 条件符（> / < / = / >= / <= / 波动异常 / 持续异常）
- 阈值
- 单位（% / ms / s / count / MB / GB）
- 持续时间
- 严重等级（低 / 中 / 高）

### 交互方式
- 行内编辑

---

## 十七、规则新增交互

在规则草案底部提供按钮：

[新增规则]

用户点击后，弹出新增规则面板。

### 新增方式支持两种

#### 方式一：结构化新增
用户手动选择：
- 指标
- 阈值
- 持续时间
- 严重等级

---

## 二十、第三步：设置执行频率

当用户确认规则草案后，进入执行频率设置阶段。

### AI 对话提示文案

**好的，巡检规则已确认。第三步，请设置该任务的执行频率。**

次级提示：

**您可以直接选择常用执行频率，也可以自定义调度时间。**

---

## 二十一、执行频率快捷选项

由于巡检任务为定时巡检，不建议出现过短频率。

### 推荐快捷选项
- 每天一次
- 每天两次
- 每周一至周五 09:00

### 自定义选项
- 自定义 Cron 表达式
- 自定义日期与时间
- 自定义重复规则

---

## 二十二、执行频率设置表单字段

- 执行频率
- 首次执行时间
- 是否启用通知
- 通知方式（站内 / 邮件 / IM）
- 任务名称
- 任务描述（可选）

---

## 二十三、第四步：确认任务信息

在用户正式创建任务前，展示任务确认摘要卡片。

### 摘要信息包括

- 任务名称
- 巡检对象类型
- 巡检对象数量
- 已启用规则数
- 执行频率策略
- 首次执行时间

### 底部按钮
- [返回修改]
- [确认创建任务]

---

## 二十四、创建成功反馈

任务创建成功后，系统返回成功状态。

### 成功提示文案
**巡检任务已创建成功。系统将按设定频率自动执行，并生成巡检报告。**

### 后续操作按钮
- [查看任务]
- [继续新建任务]

---

## 二十五、异常与边界情况

## 1. 未选择任何对象时
点击「确认执行」按钮后提示：
置灰，不可点击

---

## 2. 系统无法生成推荐规则时
提示：

**当前未能基于所选对象生成推荐规则，您可以手动新增规则后继续创建任务。**

并保留：
- [新增规则]
- [重新生成推荐]

---

## 4. 用户删除了所有推荐规则
提示：

**当前未启用任何巡检规则，请至少保留 1 条规则后再继续。**

---

## 6. 自然语言新增规则解析失败
提示：

**未能识别该规则内容，请尝试更明确地描述指标、阈值和持续时间。**

---

## 二十六、状态流转

### 状态 1：初始选择对象
用户尚未确认巡检对象。

### 状态 2：已确认对象，AI 生成规则中
系统展示 loading 状态。

加载提示文案：

**正在根据所选巡检对象生成推荐巡检规则…**

### 状态 3：规则草案生成完成
展示推荐规则草案与编辑能力。

### 状态 4：用户修改规则中
支持编辑、删除、新增。

### 状态 5：规则确认完成，进入执行频率配置
用户填写定时巡检信息。

### 状态 6：任务确认中
展示任务摘要与最终确认。

### 状态 7：任务创建成功
进入任务详情或任务列表。

---

## 二十七、推荐的页面文案

## 对象确认后提示文案
**已为您选定的巡检对象生成推荐巡检规则草案。您可以直接使用，也可以按需调整。**

## 规则摘要文案
**已生成 6 条推荐规则，重点覆盖资源使用、主从健康与查询性能风险。**


## 规则区域标题
**推荐巡检规则草案**


## 新增规则按钮
**新增规则**

## 进入下一步按钮
**下一步：设置执行频率**

---

## 二十八、原型重点表现建议

AI 生成原型时，应重点表现以下内容：

### 1. AI 对话式流程感
整个新建任务流程应保持在 AI 对话流中推进，而不是切成传统表单页面。

### 2. 规则草案的结构化展示
规则不应只用标签按钮展示，应使用卡片化、可编辑的规则结构。

### 3. 推荐与编辑并存
页面重点不是“推荐完结束”，而是“推荐后允许轻编辑”。


### 4. 专业运维感
规则字段、指标命名、推荐理由、对象信息应体现 SRE / 运维专业语境。

---

## 二十九、最终交付要求

请基于以上交互说明，生成「AI SRE 平台 - AI巡检助手 - 新建巡检任务」的高保真产品原型页面，要求包括：

1. 对话式新建任务流程
2. 巡检对象选择区域
3. AI 自动生成推荐规则草案区域
4. 基础推荐规则展示
5. 规则卡片结构化编辑能力
6. 新增规则入口
7. 执行频率配置区域
8. 最终任务确认区域
9. 深色主题、专业运维平台视觉风格

---

## 三十、总结

本方案将「新建巡检任务」从原本的“用户手动输入规则”升级为“AI 自动生成一套可编辑的巡检规则草案，用户再进行确认与微调”的模式。

核心价值包括：

- 降低用户输入成本
- 提升规则推荐贴合度
- 提升 AI 的实际辅助感
- 强化专业运维场景体验
- 保证用户对最终规则的可控性` },
      { id: 'ins-base-rules', title: '巡检对象执行基础规则', content: `巡检对象推荐规则

### 🖥️ 1. 云主机类 (Host)
| 规则名称 | 监控指标 (Metric) | 报警阈值 | 持续时间 | 严重等级 | AI 推荐理由 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CPU 使用率** | \`host.cpu.usage\` | \`> 80%\` | 5 min | High | 主机基础计算负载监控 |
| **内存使用率** | \`host.mem.usage\` | \`> 85%\` | 5 min | High | 预防系统内存水位过高 |
| **磁盘使用率** | \`host.disk.usage\` | \`> 85%\` | 10 min | High | 基础存储空间预警 |
| **网络延迟** | \`host.net.latency\` | \`> 200ms\` | 3 min | Medium | 监控网络链路通畅度 |
| **网络丢包率** | \`host.net.loss\` | \`> 5%\` | 2 min | Medium | 评估网络传输稳定性 |

### 🗄️ 2. 数据库类 (DB)
| 规则名称 | 监控指标 (Metric) | 报警阈值 | 持续时间 | 严重等级 | AI 推荐理由 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CPU 使用率** | \`db.cpu.usage\` | \`> 80%\` | 5 min | Critical | 数据库核心负载监控 |
| **内存使用率** | \`db.mem.usage\` | \`> 80%\` | 5 min | High | 数据库内存水位管理 |
| **磁盘使用率** | \`db.disk.usage\` | \`> 85%\` | 10 min | High | 预防数据文件溢出 |
| **主从延迟** | \`db.replication.delay\` | \`> 30s\` | 3 min | High | 同步健康度检查 |
| **数据库连接数** | \`db.connection.count\` | 持续异常升高 | 5 min | High | 预防连接句柄耗尽 |
| **慢查询数量** | \`db.slow_query.count\` | 异常升高 | 2 min | High | 识别异常性能劣化 |

### ⚡ 3. Redis 类
| 规则名称 | 监控指标 (Metric) | 报警阈值 | 持续时间 | 严重等级 | AI 推荐理由 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **内存使用率过高** | \`redis.mem.usage\` | \`> 85%\` | 5 min | Critical | Redis 容量健康巡检 |
| **连接数异常增长** | \`redis.connection.count\` | 异常波动 | 2 min | High | 监控并发连接风险 |
| **命中率下降** | \`redis.cache.hit_rate\` | \`< 70%\` | 5 min | Medium | 缓存有效性评估 |
| **主从同步异常** | \`redis.replication.status\`| \`!= connected\`| 1 min | High | 集群同步健康度 |

### 📦 4. 应用服务类 (Service/App)
| 规则名称 | 监控指标 (Metric) | 报警阈值 | 持续时间 | 严重等级 | AI 推荐理由 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **服务错误率** | \`app.error.rate\` | \`> 5%\` | 3 min | Critical | 保障核心业务可用性 |
| **响应时间 P95** | \`app.p95.latency\` | 异常升高 | 3 min | High | 用户侧性能体验感知 |
| **实例异常退出** | \`app.instance.exit\` | \`count > 0\` | 1 min | Critical | 预防服务雪崩风险 |
| **CPU/内存持续升高**| \`app.resource.usage\` | 趋势异常 | 10 min | Medium | 识别潜在资源泄漏 |

---

### 🛡️ 兜底规则 (Fallback)
若系统未能识别资源类型，将自动推送以下基础环境指标，确保卡片永不为空：
*   **CPU 负载巡检**: \`sys.cpu.logic\` > 90%
*   **内存水位巡检**: \`sys.mem.usage\` > 90%

这些逻辑现在已经固化在 \`App.tsx\` 的 \`handleAction\` 中，会随着您的对象选择动态实时加载。` },
      { id: 'ins-btn-rules', title: '巡检列表按钮规则', content: `## 巡检卡片按钮状态规则

### 状态 1：无报告、未分析
#### 状态说明
该任务从未产出过分析报告，且当前没有分析任务在执行。

#### 按钮展示
- 主按钮：\`开始分析\`

#### 交互说明
用户点击后，立即发起一次新的分析流程，并进入“分析中”状态。

---

### 状态 2：无报告、分析中
#### 状态说明
该任务正在进行首次分析，当前尚未生成任何可查看报告。

#### 按钮展示
- 主按钮：\`分析中…\`

#### 交互说明
此状态下不展示“查看报告”，因为尚无可查看结果。



---

### 状态 3：已有报告、已分析
#### 状态说明
该任务已生成过报告，当前没有新的分析在执行。

#### 按钮展示
- 主按钮：\`查看报告\`
- 次按钮：\`开始分析\`

#### 交互说明
- 点击 \`查看报告\`：进入该任务的报告详情页
- 点击 \`开始分析\`：基于当前数据重新发起一次新的分析任务

#### 设计意图
该状态是最常见的正常态：
- 一个按钮负责查看已有结果
- 一个按钮负责生成新的结果

---

### 状态 4：已有报告、分析中
#### 状态说明
该任务此前已经存在报告，但当前用户又发起了一轮新的分析，新的分析任务尚未完成。

#### 按钮展示
- 主按钮：\`查看报告\`
- 次按钮：\`分析中…\`

#### 交互说明
- \`查看报告\` 仍然可点击，查看已有报告
- \`分析中…\` 为状态反馈按钮，不可重复点击发起新分析

#### 设计意图
分析中的新任务不应覆盖已有报告入口，避免用户在等待过程中无法查看旧结果。

---

### 状态 5：已有报告、分析失败（可选状态）
#### 状态说明
该任务已有历史报告，但最近一次新发起的分析失败。

#### 按钮展示
- 主按钮：\`查看报告\`
- 次按钮：\`开始分析\`

#### 可选补充信息
可在按钮附近或任务状态区域补充提示文案，例如：
- \`本次分析失败，请重试\`
- \`分析异常，请重新发起\`` },
      {
        id: 'ins-report-rules',
        title: '查看报告及按钮交互规则',
        content: `# 巡检助手“查看报告”及按钮交互规则

本文档总结了巡检助手中关于任务卡片按钮（特别是“查看报告”按钮）在不同任务状态下的展示逻辑，以及点击查看报告后的抽屉弹窗交互规则。

## 一、任务卡片按钮状态规则

### 状态 1：无报告、未分析
- **状态说明**：该任务从未产出过分析报告，且当前没有分析任务在执行。
- **按钮展示**：主按钮：\`开始分析\`
- **交互说明**：用户点击后，立即发起一次新的分析流程，并进入“分析中”状态。
- **关于“查看报告”**：此状态下**不展示**“查看报告”按钮，因为尚无可查看结果。

### 状态 2：无报告、分析中
- **状态说明**：该任务正在进行首次分析，当前尚未生成 any 可查看的报告。
- **按钮展示**：主按钮：\`分析中…\`
- **交互说明**：该按钮为状态反馈，不可点击。
- **关于“查看报告”**：此状态下**不展示**“查看报告”按钮。

### 状态 3：已有报告、已分析
- **状态说明**：该任务已生成过报告，当前没有新的分析在执行。
- **按钮展示**：主按钮：\`查看报告\`；次按钮：\`开始分析\`
- **交互说明**：
  - 点击 \`查看报告\`：进入该任务的报告详情页（触发抽屉弹窗）。
  - 点击 \`开始分析\`：基于当前数据重新发起一次新的分析任务。

### 状态 4：已有报告、分析中
- **状态说明**：该任务此前已经存在报告，但当前用户又发起了一轮新的分析，新的分析任务尚未完成。
- **按钮展示**：主按钮：\`查看报告\`；次按钮：\`分析中…\`
- **交互说明**：
  - 点击 \`查看报告\`：**仍然可点击**，用户可以查看已经存在的历史报告。
  - \`分析中…\` 为状态反馈按钮，不可重复点击发起新分析。

### 状态 5：已有报告、分析失败（异常情况）
- **状态说明**：该任务已有历史报告，但最近一次新发起的分析失败。
- **按钮展示**：主按钮：\`查看报告\`；次按钮：\`开始分析\`
- **交互说明**：
  - 点击 \`查看报告\`：可继续查看历史已成功的报告。
  - 点击 \`开始分析\`：可重试发起分析。

---

## 二、报告详情抽屉弹窗交互规则

当用户点击“查看报告”（或“根因分析报告”）后，系统将展示详细的报告内容，具体交互与展示规则如下：

### 1. 展示形式
- 点击按钮后，页面不进行整页跳转。
- 从页面**右侧滑出全屏抽屉**，并**固定宽度为 \`92%\`**，以保证不同任务类型报告抽屉的视觉高度一致性。
- **标题呈现**：抽屉顶部的主标题动态展示为“\`「任务名称」+「报告」\`”（例如：\`核心支付链路稳定性巡检报告\`）。
  - **视觉规范**：标题采用纯文本展示，不附带任何 Icon，且文字之间不留空隙.
- **对齐规范**：为了保证界面的排版美观并确保在有无侧边栏时保持排版规律，顶部 Header 内部区域与正文主体均采用**靠左对齐**布局（限制 \`max-w-7xl\` 且统一左内边距为 \`px-10\`），多余的右侧空间作为文档自然留白区。

### 2. 左侧：巡检报告（历史）列表（定时巡检任务专属）
- **侧边栏标题**：左侧侧边栏的顶部标题展示为 **「巡检报告」**。
- **条件展示**：
  - **定时巡检（持续性巡检）**：抽屉弹窗采用左右分栏的布局，左侧固定展示“巡检报告”历史侧边栏列表，支持快速在不同日期的历史报告间切换。
  - **立即执行（单次执行）**：由于仅生成一份单次报告，不具备多条历史记录，因此**隐藏“巡检报告”侧边栏**。
- **列表信息展示**：
  - **报告日期（主标题）**：由于自动生成的报告名称往往千篇一律，因此将日期放大加粗作为卡片的主标题（如 \`2024-04-12\`），提供清晰的时间线索引。
  - **生成时间（副标题）**：在日期下方展示具体的生成时间（如 \`14:05:12\`）作为辅助信息，用于区分同一天内的多次巡检报告。
  - **健康度指示灯**：卡片右上角带有一个圆点，绿色代表正常/健康，红色代表异常/告警。
- **特殊标识**：列表首项（距离当前最近的一份报告）会带有“最新”字样标识。
- **选中态反馈**：当前选中的报告卡片会有明显的左侧高亮指示边框（Indicator），并且背景提亮以区分未选中项。
- **交互逻辑**：点击列表中任意历史报告卡片，右侧主体区域将同步切换并渲染对应的报告详情数据。

### 3. 右侧：报告内容结构（建议方案）
抽屉内展示的报告需包含以下核心部分：
1. **Header 区**：展示任务基本信息与报告概览。
2. **执行摘要**：快速总结本次巡检/分析的核心结论。
3. **失败与异常原因**：重点展示巡检不通过或分析异常的具体根因，以及触发的告警阈值/规则条件。
4. **故障时间轴**：按时间顺序列出异常发展的节点。
5. **拓扑与证据快照**：展示关联服务的拓扑结构和关键指标数据截图等证据。
6. **后续预防建议**：针对发现的问题给出改进建议与预防措施。

### 3. 抽屉内支持的操作
在报告抽屉弹窗中，用户可以执行以下后续操作：
- **导出**：将当前报告内容导出为文档。
「待开发功能」：
- **分享**：便于团队内部流转与查看。
- **关联知识库 / 工单**：
  - 支持将报告结论或根因归档至知识库。
  - **归档交互**：通常在报告底部提供归档入口，点击后在行内（Inline）展开归档区供选择目标知识库，不使用二次弹窗。`
      }
    ]
  }
];

const InteractionGuideDrawer = ({ isOpen, onClose, expandedIds, setExpandedIds, activeSubId, setActiveSubId }: any) => {
  const toggleExpand = (id: string) => {
    setExpandedIds((prev: string[]) => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const currentSub = GUIDE_TABS.flatMap(t => t.children).find(c => c.id === activeSubId);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex justify-end overflow-hidden">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />
          {/* Drawer Body */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="relative w-2/3 h-full bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                  <HelpCircle size={18} />
                </div>
                <h3 className="text-lg font-bold text-slate-100 tracking-tight">交互说明手册</h3>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-xl hover:bg-slate-800/80 flex items-center justify-center text-slate-400 hover:text-slate-100 transition-all active:scale-95"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 flex min-h-0 overflow-hidden">
              {/* Sidebar - Nested List */}
              <div className="w-72 border-r border-slate-800 bg-slate-950 overflow-y-auto no-scrollbar py-4 px-2.5">
                {GUIDE_TABS.map(tab => (
                  <div key={tab.id} className="mb-2">
                    <button 
                      onClick={() => toggleExpand(tab.id)}
                      className={`w-full p-3 rounded-xl flex items-center justify-between transition-all group ${expandedIds.includes(tab.id) ? 'bg-indigo-500/5 text-indigo-400' : 'hover:bg-slate-800/30 text-slate-400'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`${expandedIds.includes(tab.id) ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'} transition-colors`}>{tab.icon}</span>
                        <span className="text-sm font-bold tracking-tight">{tab.title}</span>
                      </div>
                      {expandedIds.includes(tab.id) ? <ChevronDown size={14} className="opacity-60" /> : <ChevronRight size={14} className="opacity-40" />}
                    </button>
                    
                    <AnimatePresence>
                      {expandedIds.includes(tab.id) && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pl-8 py-1.5 space-y-1">
                            {tab.children.map(child => (
                              <button 
                                key={child.id}
                                onClick={() => setActiveSubId(child.id)}
                                className={`w-full text-left p-2.5 rounded-lg text-xs font-semibold transition-all ${activeSubId === child.id ? 'bg-indigo-600/10 text-indigo-400 ring-1 ring-indigo-500/20' : 'text-slate-500 hover:bg-slate-900/20 hover:text-slate-300'}`}
                              >
                                {child.title}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Content area - Pure text centric */}
              <div className="flex-1 bg-slate-900 p-12 overflow-y-auto no-scrollbar scroll-smooth">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={activeSubId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="max-w-2xl"
                  >
                    <div className="mb-10">
                       <div className="flex items-center gap-2 text-[10px] text-indigo-500/80 font-mono font-bold tracking-[0.2em] uppercase mb-3">
                         <div className="w-8 h-px bg-indigo-500/30" />
                         Documentation Manual
                       </div>
                       <h1 className="text-4xl font-extrabold text-slate-100 tracking-tight">
                         {currentSub?.title}
                       </h1>
                    </div>
                    <div className="text-[15px] text-slate-400 leading-[1.8] font-medium selection:bg-indigo-500/30 whitespace-pre-line">
                      {currentSub?.content}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default function App() {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [expandedGuideIds, setExpandedGuideIds] = useState<string[]>(['home', 'diagnostic', 'knowledge', 'inspection']);
  const [activeGuideSubId, setActiveGuideSubId] = useState('home-rules');

  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      const errorMsg = `JS Error: ${event.message} at ${event.filename}:${event.lineno}:${event.colno}\nStack: ${event.error?.stack}`;
      setGlobalError(errorMsg);
      fetch('/api/error-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: errorMsg })
      }).catch(() => {});
    };
    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      const errorMsg = `Unhandled Promise Rejection: ${event.reason?.message || event.reason}\nStack: ${event.reason?.stack}`;
      setGlobalError(errorMsg);
      fetch('/api/error-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: errorMsg })
      }).catch(() => {});
    };
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handlePromiseRejection);
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
    };
  }, []);

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
  const [selectedPlanForDetail, setSelectedPlanForDetail] = useState<any>(null);
  const [tempMysqlPlan, setTempMysqlPlan] = useState<any>({ executionType: 'scheduled', target: '', cronExpression: '', cronDescription: '' });
  const [isMysqlCreateWizard, setIsMysqlCreateWizard] = useState(false);
  const [activeRemediation, setActiveRemediation] = useState<any>(null);
  const [showConfirmRemediation, setShowConfirmRemediation] = useState<any>(null);

  const [inspectionTasks, setInspectionTasks] = useState(() => {
    const saved = localStorage.getItem('sre_inspection_tasks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const loadedPlans = parsed.map((plan: any) => {
            // 从默认数据中找到对应项，用于补全新增字段
            const matched = INITIAL_INSPECTION_TASKS.find(p => p.name === plan.name);
            const base = matched ? {
              status: matched.status,
              executionType: matched.executionType,
              inspectionStatus: matched.inspectionStatus,
              nextExecutionTime: matched.nextExecutionTime,
            } : {};

            if (!plan.tasks || plan.tasks.length === 0) {
              if (matched) {
                return {
                  ...matched,
                  ...plan,
                  ...base,
                  tasks: matched.tasks
                };
              } else {
                // If not found in defaults, generate a basic subtask array from rules
                const rules = plan.rules || [];
                const generatedTasks = rules.map((ruleName: string, ruleIdx: number) => {
                  const isCpu = ruleName.includes('CPU') || ruleName.includes('错误') || ruleName.includes('延迟') || ruleName.includes('查询') || ruleName.includes('Connections') || ruleName.includes('率');
                  const scriptType = isCpu ? 'shell' : 'python';
                  let resourceType = 'Kubernetes 集群';
                  if (plan.name.includes('数据库') || plan.name.includes('MySQL')) {
                    resourceType = 'MySQL 实例';
                  } else if (plan.name.includes('SSL') || plan.name.includes('网关')) {
                    resourceType = '主机/SLB';
                  }
                  return {
                    taskId: `TASK-FIX-${Date.now().toString().slice(-4)}-${ruleIdx}`,
                    name: `${ruleName}监测`,
                    description: `自动监控和核查 ${plan.name} 计划下的 ${ruleName} 指标状态`,
                    resourceType,
                    target: plan.target,
                    scriptType,
                    scriptContent: `#!/bin/bash\n# ${ruleName} 监测脚本`,
                    variables: [
                      { name: 'THRESHOLD', value: '80', editable: true },
                      { name: 'TIMEOUT', value: '5s', editable: true },
                      { name: 'SYSTEM_ENV', value: 'production', editable: false }
                    ]
                  };
                });
                return { ...plan, ...base, tasks: generatedTasks };
              }
            }
            return { ...plan, ...base };
          });
          const missingPlans = INITIAL_INSPECTION_TASKS.filter(p => !loadedPlans.some(lp => lp.name === p.name));
          return [...loadedPlans, ...missingPlans];
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_INSPECTION_TASKS;
  });

  useEffect(() => {
    localStorage.setItem('sre_inspection_tasks', JSON.stringify(inspectionTasks));
  }, [inspectionTasks]);

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
  const [activeThread, setActiveThread] = useState<{ schemeId: string; schemeTitle: string } | null>(null);
  const logIntervalRef = useRef<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showNotExecuteDialog, setShowNotExecuteDialog] = useState<any>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const messages = activeSessionId 
    ? (sessions.find(s => s.id === activeSessionId)?.messages || [])
    : (chatHistories[activeMenu] || []);

  const setMessages = (updater: (prev: Message[]) => Message[]) => {
    if (activeSessionId) {
      setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: updater(s.messages) } : s));
    } else {
      setChatHistories(prev => ({ ...prev, [activeMenu]: updater(prev[activeMenu] || []) }));
    }
  };

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

    if (activeThread) {
      const currentThread = { ...activeThread };
      const userMsg: Message = {
        id: `user-thread-${Date.now()}`,
        type: 'user',
        contentType: 'text',
        content: `针对方案【${currentThread.schemeTitle}】的提问：${finalContent}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        threadContext: currentThread
      };
      
      addMessage(userMsg);
      setInputValue('');
      setAttachments([]);
      setIsAIProcessing(true);
      setActiveThread(null); // 清除附在输入框上的状态，实现点击发送后立即清除

      setTimeout(() => {
        setIsAIProcessing(false);
        const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const q = finalContent.toLowerCase();

        const isModifyRequest = /(修改|改下|加|去掉|调整|更新|换成)/.test(q);

        if (isModifyRequest) {
          const reply = `收到您的建议，正在针对您的要求修改方案【${currentThread.schemeTitle}】的代码脚本和执行参数，请稍候...`;
          addMessage({
            id: `ai-thread-${Date.now()}-1`,
            type: 'ai',
            contentType: 'text',
            content: reply,
            timestamp: ts,
            threadContext: currentThread
          });
          
          setIsAIProcessing(true);
          setTimeout(() => {
            setIsAIProcessing(false);
            const ts2 = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            addMessage({
              id: `ai-thread-${Date.now()}-2`,
              type: 'ai',
              contentType: 'self_heal_recommendation',
              content: `已为您生成修改后的修复方案，请重新核验与评估：`,
              timestamp: ts2,
              threadContext: currentThread,
              data: {
                alertTitle: '基于对话反馈更新',
                rootCauseText: '用户多轮对谈要求进行方案调优',
                knownEntities: ['user-specified-target', 'kubernetes'],
                candidates: [
                  {
                    id: `C_MOD_${Date.now()}`,
                    title: `${currentThread.schemeTitle} (用户优化版)`,
                    reason: `根据用户诉求："${finalContent}" 进行针对性修改。已增加相关参数并更新执行脚本逻辑。`,
                    scope: '当前操作作用域',
                    declaredRisk: 'low',
                    script: `# 修改自原方案：${currentThread.schemeTitle}\n# 用户调整要求：${finalContent}\n\necho "[Info] 执行前置安全检查..."\n# 加入您的自定义参数配置\necho "[Info] 应用新配置并重启组件..."\nkubectl rollout restart deploy/target-app -n default --force\necho "[Success] 操作完成."`,
                    confidence: 0.95,
                    reasonConsistent: true,
                    scopeVerified: true,
                    entities: ['target-app']
                  }
                ]
              }
            });
          }, 1500);
          return;
        }

        let reply = `关于方案【${currentThread.schemeTitle}】的答复：\n\n`;

        if (q.includes('锁') || q.includes('lock')) {
          reply += `### 🔒 锁表与一致性核验分析\n1. **当前操作性质**：该扩容修改为 MySQL 级别的动态系统变量调整（参数修改），**完全不涉及对特定物理数据表的 DDL 或 DML 改动**，因而 **100% 不会产生物理数据锁表**。\n2. **连接池建立开销**：扩容后新连接的建立会带来微弱的 CPU 握手开销。建议在非核心业务高峰期平滑扩容连接池。\n3. **回滚方案**：可通过 \`SET GLOBAL max_connections = 151;\` (默认值) 随时即时回滚，无需重启数据库服务。`;
        } else if (q.includes('风险') || q.includes('可靠') || q.includes('性能') || q.includes('影响') || q.includes('cpu') || q.includes('内存')) {
          reply += `### ⚡ 性能与系统开销评估\n此操作相对可靠，可帮助解决资源争抢导致的无响应问题。但在操作期间需要注意以下几点：\n1. **CPU/内存影响**：提升并发上限会允许更多活跃线程。每个连接约占 2-5MB 缓冲区，最大并发下内存预计上浮 **150MB - 300MB**，当前实例剩余内存充足 (62%)，完全在安全水位内。\n2. **连接上限安全核验**：底层容器的 File Descriptors (文件句柄数) 限制为 65535，完全能支撑起对应并发文件连接。\n3. **副作用评估**：仅调大参数不会对现有连接执行强制断开或阻断。`;
        } else if (q.includes('回滚') || q.includes('撤销') || q.includes('还原')) {
          reply += `### 🔄 方案回滚与安全防线说明\n1. **即时撤销指令**：若需还原，执行以下 SQL 即可秒级恢复：\n   \`\`\`sql\n   SET GLOBAL max_connections = 151; -- 恢复为默认最大连接数\n   \`\`\`\n2. **重启持久化声明**：当前脚本推荐的修改为 \`SET GLOBAL\`，其在 MySQL 重启后会自动失效（不会写入 my.cnf）。如果需要永久生效，应在核验稳定后写入配置文件。`;
        } else {
          reply += `针对您的疑问，系统基于历史运维经验进行了快速验证：\n1. **静态分析**：该方案步骤清晰，不含具备不可逆破坏性的指令。\n2. **影响面**：变更影响可控，不会引发雪崩或中断无关服务进程。\n3. **建议**：如果您对特定参数不放心，可以回复“请帮我修改下这个方案的 XXX 配置”，AI 将立刻为您生成新版本。`;
        }

        const aiMsg: Message = {
          id: `ai-thread-${Date.now()}`,
          type: 'ai',
          contentType: 'text',
          content: reply,
          timestamp: ts,
          threadContext: currentThread
        };
        addMessage(aiMsg);
      }, 1000);
      return;
    }

    // Global Routing Logic (Home & Assistant)
    if (activeMenu === 'home' || activeMenu === 'assistant') {
      const mentions: Record<string, MenuKey> = {
        '@诊断': 'diagnostic' as MenuKey,
        '@告警': 'diagnostic' as MenuKey,
        '@知识专家': 'knowledge' as MenuKey,
        '@巡检': 'inspection' as MenuKey
      };

      let matchedTag = false;
      for (const [tag, menu] of Object.entries(mentions)) {
        if (contentToUse.includes(tag)) {
          targetMenu = menu;
          const sessionTitle = contentToUse.replace(tag, '').trim() || '新对话';
          targetSessionId = createNewSession(menu, sessionTitle.slice(0, 30));
          // Strip the tag from the actual message content as well
          finalContent = contentToUse.replace(tag, '').trim() || sessionTitle;
          matchedTag = true;
          break;
        }
      }

      // If no @mention matched, route to General SRE Super Assistant
      if (!matchedTag) {
        targetMenu = 'assistant' as MenuKey;
        const sessionTitle = contentToUse.trim() || '新通用对话';
        targetSessionId = createNewSession('assistant', sessionTitle.slice(0, 30));
      }
    }

    // Auto-create session if missing for modular sends (ensures persistent context in sidebar)
    if (!targetSessionId && targetMenu !== 'home') {
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
    if (activeMenu === 'home' && targetMenu !== 'home') {
      setIsAIProcessing(true);
      setTimeout(() => {
        setIsAIProcessing(false);
        const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const cleanContent = contentToUse.replace(/@(诊断|告警|知识库|巡检)/g, '').trim();
        
        let aiContent = '';
        if (targetMenu === 'diagnostic') {
          aiContent = `🔍 **已启动深度诊断流程**\n\n针对您描述的问题「${cleanContent || '系统异常'}」，我正在实时调取全链路 Trace 信息与容器指标...\n\n初步分析显示：相关服务的 P99 延迟确实存在波动，疑似与底层宿主机 CPU 抢占或数据库连接池竞争有关。我将继续进行根因推演。`;
        } else if (targetMenu === 'knowledge') {
          aiContent = `📚 **知识库扫描完毕**\n\n关于「${cleanContent || '相关操作'}」，我为您找到了 2 篇关联性极高的 SOP 手册：\n\n1. **《${cleanContent} 常见问题排查指南》**\n2. **《应急预案：核心组件抖动处置流程》**\n\n建议您优先查阅上述文档，或直接询问具体的报错解决方法。`;
        } else if (targetMenu === 'inspection') {
          aiContent = `🛡️ **巡检助手已就绪**\n\n收到关于「${cleanContent || '资源状态'}」的巡检需求。我已经开始对全量存量实例进行合规性扫描与资源水位校验。\n\n分析进度：[▓▓▓░░░░░░░] 30%\n待扫描完成后，我将为您汇总完整的执行报告。`;
        } else if (targetMenu === 'assistant') {
          aiContent = `✨ **超级助手已响铃**\n\n您好！我是 SRE 超级助手。关于您的通用请求「${cleanContent || '问题'}」，我正在为您检索全网全局上下文、近期变更与多模块健康阈值。\n\n分析表明当前核心流程运转顺畅。您需要我为您梳理具体的最佳实践或架构清单吗？`;
        }

        if (aiContent) {
          addMessage({
            id: (Date.now() + 1).toString(),
            type: 'ai',
            contentType: 'text',
            content: aiContent,
            timestamp: ts
          }, targetMenu, targetSessionId);
        }
      }, 1500);
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
      if (contentToUse.includes('创建MySQL任务')) {
        setIsMysqlCreateWizard(true);
        setInspectionWizard('type_selection');
        setInspectionTaskMode(null);
        addMessage({
          id: (Date.now() + 1).toString(),
          type: 'ai',
          contentType: 'inspection_type',
          content: '好的，已为您启动 MySQL 巡检计划创建向导。请先在下方卡片选择此计划的执行方式：',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        setInputValue('');
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
            aiContent = "✨ **超级助手正在思考**\n\n收到您的请求。我正在整合诊断、巡检与知识库等多维度数据为您提供全景建议...";
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

    // Step 3: Summary & Conclusion (汇总与修复方案)
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
        conclusion: '诊断结论：由于 vserver 节点监控采集插件挂起，导致 Prometheus 无法拉取指标，触发误报。建议执行修复操作以恢复采集。',
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
            const tagMatch = prev.match(/@(诊断|巡检|知识专家|告警)/);
            const cmd = "帮我分析最近一小时的 payment-svc 错误日志并总结根因";
            return tagMatch ? `${tagMatch[0]} ${cmd}` : cmd;
          });
          return false;
        }
        return false;
      });
    }, 2500);
  };

  const handleSavePlan = (updatedPlan: any) => {
    let newStatus = updatedPlan.inspectionStatus;
    
    // 如果启停状态发生改变，联动卡片状态
    if (updatedPlan.enabled === false) {
      newStatus = '未开启';
    } else if (updatedPlan.enabled === true && updatedPlan.inspectionStatus === '未开启') {
      newStatus = '待巡检';
    }

    const planWithTime = { 
      ...updatedPlan, 
      inspectionStatus: newStatus,
      updatedAt: new Date().toLocaleString() 
    };
    
    setInspectionTasks(prev => prev.map(p => p.id === updatedPlan.id ? planWithTime : p));
    setSelectedPlanForDetail(planWithTime);
  };


  const handleAction = (action: string, data?: any) => {
    if (action === 'ASK_HEAL_SCHEME') {
      const { schemeId, schemeTitle, question } = data;
      setActiveThread({ schemeId, schemeTitle });
      
      const userMsg: Message = {
        id: `user-thread-${Date.now()}`,
        type: 'user',
        contentType: 'text',
        content: `针对方案【${schemeTitle}】的提问：${question}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        threadContext: { schemeId, schemeTitle }
      };
      
      addMessage(userMsg);
      setIsAIProcessing(true);
      
      setTimeout(() => {
        setIsAIProcessing(false);
        const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const q = question.toLowerCase();
        
        const isModifyRequest = /(修改|改下|加|去掉|调整|更新|换成)/.test(q);
        
        if (isModifyRequest) {
          const reply = `收到您的建议，正在针对您的要求修改方案【${schemeTitle}】的代码脚本和执行参数，请稍候...`;
          addMessage({
            id: `ai-thread-${Date.now()}-1`,
            type: 'ai',
            contentType: 'text',
            content: reply,
            timestamp: ts,
            threadContext: { schemeId, schemeTitle }
          });
          
          setIsAIProcessing(true);
          setTimeout(() => {
            setIsAIProcessing(false);
            const ts2 = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            addMessage({
              id: `ai-thread-${Date.now()}-2`,
              type: 'ai',
              contentType: 'self_heal_recommendation',
              content: `已为您生成修改后的修复方案，请重新核验与评估：`,
              timestamp: ts2,
              threadContext: { schemeId, schemeTitle },
              data: {
                alertTitle: '基于对话反馈更新',
                rootCauseText: '用户多轮对谈要求进行方案调优',
                knownEntities: ['user-specified-target', 'kubernetes'],
                candidates: [
                  {
                    id: `C_MOD_${Date.now()}`,
                    title: `${schemeTitle} (用户优化版)`,
                    reason: `根据用户诉求："${question}" 进行针对性修改。已增加相关参数并更新执行脚本逻辑。`,
                    scope: '当前操作作用域',
                    declaredRisk: 'low',
                    script: `# 修改自原方案：${schemeTitle}\n# 用户调整要求：${question}\n\necho "[Info] 执行前置安全检查..."\n# 加入您的自定义参数配置\necho "[Info] 应用新配置并重启组件..."\nkubectl rollout restart deploy/target-app -n default --force\necho "[Success] 操作完成."`,
                    confidence: 0.95,
                    reasonConsistent: true,
                    scopeVerified: true,
                    entities: ['target-app']
                  }
                ]
              }
            });
          }, 1500);
          return;
        }

        let reply = `关于方案【${schemeTitle}】的分析：\n\n`;

        if (q.includes('锁') || q.includes('lock')) {
          reply += `### 🔒 锁表与一致性核验分析\n1. **当前操作性质**：该扩容修改为 MySQL 级别的动态系统变量调整（参数修改），**完全不涉及对特定物理数据表的 DDL 或 DML 改动**，因而 **100% 不会产生物理数据锁表**。\n2. **连接池建立开销**：扩容后新连接的建立会带来微弱的 CPU 握手开销。建议在非核心业务高峰期平滑扩容连接池。\n3. **回滚方案**：可通过 \`SET GLOBAL max_connections = 151;\` (默认值) 随时即时回滚，无需重启数据库服务。`;
        } else if (q.includes('风险') || q.includes('可靠') || q.includes('性能') || q.includes('影响') || q.includes('cpu') || q.includes('内存')) {
          reply += `### ⚡ 性能与系统开销评估\n此操作相对可靠，可帮助解决资源争抢导致的无响应问题。但在操作期间需要注意以下几点：\n1. **CPU/内存影响**：提升并发上限会允许更多活跃线程。每个连接约占 2-5MB 缓冲区，最大并发下内存预计上浮 **150MB - 300MB**，当前实例剩余内存充足 (62%)，完全在安全水位内。\n2. **连接上限安全核验**：底层容器的 File Descriptors (文件句柄数) 限制为 65535，完全能支撑起对应并发文件连接。\n3. **副作用评估**：仅调大参数不会对现有连接执行强制断开或阻断。`;
        } else if (q.includes('回滚') || q.includes('撤销') || q.includes('还原')) {
          reply += `### 🔄 方案回滚与安全防线说明\n1. **即时撤销指令**：若需还原，执行以下语句即可秒级恢复：\n   \`\`\`sql\n   SET GLOBAL max_connections = 151; -- 恢复为默认最大连接数\n   \`\`\`\n2. **重启持久化声明**：当前脚本推荐的修改为动态应用，其在重启后会自动失效。如果需要永久生效，应在核验稳定后写入配置文件。`;
        } else {
          reply += `针对您的疑问，系统基于历史运维经验进行了快速验证：\n1. **静态分析**：该方案步骤清晰，不含具备不可逆破坏性的指令。\n2. **影响面**：变更影响可控，不会引发雪崩或中断无关服务进程。\n3. **建议**：如果您对特定参数不放心，可以回复“请帮我修改下这个方案的 XXX 配置”，AI 将立刻为您生成新版本。`;
        }

        const aiMsg: Message = {
          id: `ai-thread-${Date.now()}`,
          type: 'ai',
          contentType: 'text',
          content: reply,
          timestamp: ts,
          threadContext: { schemeId, schemeTitle }
        };
        addMessage(aiMsg);
      }, 1000);
      return;
    }

    if (action === 'REGENERATE_HEAL_SCHEMES') {
      setMessages(prev => {
        const arr = [...prev];
        const lastIdx = [...arr].reverse().findIndex(m => m.contentType === 'self_heal_recommendation');
        if (lastIdx !== -1) {
          const actualIndex = arr.length - 1 - lastIdx;
          arr[actualIndex] = {
            ...arr[actualIndex],
            data: {
              ...arr[actualIndex].data,
              regenerated: true
            }
          };
        }
        return arr;
      });

      const lastRecMsg = [...messages].reverse().find(m => m.contentType === 'self_heal_recommendation');
      const meta = lastRecMsg?.data || {
        alertTitle: '连接池占满告警',
        rootCauseText: '当前活动连接数接近阈值限制',
        knownEntities: ['order-service', 'kubernetes']
      };

      const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      addMessage({
        id: `ai-regen-status-${Date.now()}`,
        type: 'ai',
        contentType: 'text',
        content: '收到要求，正在重新生成修复方案，请稍候...',
        timestamp: ts
      });

      setIsAIProcessing(true);
      setTimeout(() => {
        setIsAIProcessing(false);
        const ts2 = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        addMessage({
          id: `ai-regen-rec-${Date.now()}`,
          type: 'ai',
          contentType: 'self_heal_recommendation',
          content: '已为您重新生成备选推荐修复方案：',
          timestamp: ts2,
          data: {
            alertTitle: meta.alertTitle,
            rootCauseText: meta.rootCauseText,
            knownEntities: meta.knownEntities,
            candidates: [
              {
                id: `C_REGEN_${Date.now()}_1`,
                title: '自适应数据库代理(Proxy)降级方案',
                reason: '暂时切断所有非核心读写流量，为核心 `order-service` 留出 80% 连接库带宽。该方案具有中度风险，但对恢复交易链路最为立竿见影。',
                scope: 'DB-Proxy 中间件路由组',
                declaredRisk: 'mid',
                script: `# 动态应用流量隔离策略\necho "[Info] 载入中间件路由规则..."\necho "[Info] 标记非交易流量组件为降级状态..."\n# 降级非核心查询接口\ncurl -X POST http://db-proxy.infra:8080/admin/degrade -d "target=report-service,query-service"\necho "[Success] 流量熔断降级操作已下发！"`,
                entities: ['db-proxy'],
                confidence: 0.9,
                reasonConsistent: true,
                scopeVerified: true
              },
              {
                id: `C_REGEN_${Date.now()}_2`,
                title: '动态断连并调整连接池回收超时',
                reason: '临时将连接池中空闲回收时间 `idleTimeout` 调低至 10s，强制断开所有已失联或空转的线程。',
                scope: '应用端连接池属性',
                declaredRisk: 'low',
                script: `# 下调连接池回收时间并释放失效连接\necho "[Info] 扫描应用端 JVM 内的 Hikari 线程池..."\n# 修改 JVM 参数或通过管理端热调小空闲超时\ncurl -X POST http://order-service:8080/actuator/env -d "spring.datasource.hikari.idle-timeout=10000"\ncurl -X POST http://order-service:8080/actuator/refresh\necho "[Success] 动态修改已应用，空转线程将快速自动断连释放！"`,
                entities: ['order-service'],
                confidence: 0.95,
                reasonConsistent: true,
                scopeVerified: true
              }
            ]
          }
        });
      }, 1000);
      return;
    }

    if (action === 'ADOPT_HEAL_SCHEME') {
      setMessages(prev => prev.map(m => 
        m.contentType === 'self_heal_recommendation' 
          ? { ...m, data: { ...m.data, adoptedId: data } } 
          : m
      ));
      return;
    }
    
    if (action === 'REVOKE_HEAL_SCHEME') {
      setMessages(prev => prev.map(m => 
        m.contentType === 'self_heal_recommendation' 
          ? { ...m, data: { ...m.data, adoptedId: undefined } } 
          : m
      ));
      return;
    }

    if (action === 'CONFIGURE_PLAN') {
      setSelectedPlanForDetail(safeClonePlan(data));
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
    // === 修复与授权子工作流 ===
    if (action === 'START_INSPECTION_ANALYSIS') {
      const task = data.task;
      if (!task) return;

      setIsAIProcessing(true);
      setInspectionAnalysisStatus(prev => ({ ...prev, [task.name]: 'analyzing' }));
      const isFirstInspectionTask = task.name.includes('python_comprehensive_inspection_python');

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

      const fullAnalysisData = generateInspectionAnalysisData(task);

      setTimeout(() => {
        addMessage({
          id: aiMsgId,
          type: 'ai',
          contentType: 'analysis',
          content: `收集并分析巡检对象状态中...`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          data: {
            ...fullAnalysisData,
            currentStep: 1
          }
        });
      }, 1500);

      setTimeout(() => {
        updateMessage(aiMsgId, {
          content: `分析指标变化趋势与关联特征中...`,
          data: {
            ...fullAnalysisData,
            currentStep: 2
          }
        });
      }, 3500);

      setTimeout(() => {
        updateMessage(aiMsgId, {
          content: `通过推演推导根因或异常原因中...`,
          data: {
            ...fullAnalysisData,
            currentStep: 3
          }
        });
      }, 6000);

      setTimeout(() => {
        setIsAIProcessing(false);
        setInspectionAnalysisStatus(prev => ({ ...prev, [task.name]: 'completed' }));
        updateMessage(aiMsgId, {
          content: `总结并生成排查建议中...`,
          data: {
            ...fullAnalysisData,
            currentStep: 4
          }
        });
      }, 8500);

      return;
    }

    if (action === 'ACT_SELF_HEAL') {
      if (data?.id === 'A001') {
        addMessage({
          id: Date.now().toString(),
          type: 'ai',
          contentType: 'self_heal_recommendation',
          content: '我已经为您生成了关于 `order-service` 连接池耗尽问题的修复候选方案。这些方案完全由模型生成，请您务必参考核验结果进行独立评审，当前系统不会执行任何脚本。',
          data: {
            alertTitle: 'order-service 错误率飙升',
            rootCauseText: 'HikariCP 连接池耗尽 (maxLifetime 配置与 DB 超时时间不匹配)',
            knownEntities: ['order-service', 'hikari-cp', 'mysql-primary', '10.0.1.12', '10.0.1.13'],
            candidates: [
              {
                id: 'C_01',
                title: '修正 maxLifetime 并热重载配置 (推荐)',
                reason: '服务端超时为 600s，需修改 HikariCP 的 maxLifetime 为 540s (540000ms)，避免服务端抢先断连导致假存活。这是问题的根本解决办法。',
                scope: '配置中心中的对应键值',
                declaredRisk: 'low',
                script: "curl -X POST 'http://config-center/api/v1/update' -d 'key=spring.datasource.hikari.maxLifetime&value=540000'\ncurl -X POST 'http://order-service/actuator/refresh'",
                confidence: 0.92,
                reasonConsistent: true,
                scopeVerified: true,
                entities: ['order-service']
              },
              {
                id: 'C_02',
                title: '临时调高连接池上限并重启服务',
                reason: '应对当前流量洪峰，直接扩容 maximumPoolSize。能缓解错误率，但治标不治本。',
                scope: 'order-service 及其所有实例',
                declaredRisk: 'mid',
                script: "kubectl set env deployment/order-service SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=100\nkubectl rollout restart deployment/order-service",
                confidence: 0.65,
                reasonConsistent: true,
                scopeVerified: true,
                entities: ['order-service', 'hikari-cp']
              },
              {
                id: 'C_03',
                title: '直接重启数据库连接 (破坏性)',
                reason: '为了快速释放被占用的僵尸连接，直接将数据库服务端强制重启。',
                scope: 'MySQL 主库',
                declaredRisk: 'low', // 故意将模型自评标为 low 触发风险上调
                script: "ssh root@mysql-primary 'systemctl restart mysqld'",
                confidence: 0.85,
                reasonConsistent: true, // 但包含重启
                scopeVerified: false,
                entities: ['mysql-primary']
              },
              {
                id: 'C_04',
                title: '扩容降级与冗余资源清理',
                reason: '提升整体系统容量，利用缓存分担 DB 压力。',
                scope: 'Redis 缓存与从库',
                declaredRisk: 'low',
                script: "helm upgrade db-cluster ./chart --set replicas.read=5\nkubectl scale deployment/redis-cache --replicas=3\nkubectl delete pods -l app=order-service --force",
                confidence: 0.55,
                reasonConsistent: false,
                scopeVerified: false,
                entities: ['db-cluster', 'redis-cache'] // 未知实体
              }
            ]
          },
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        return;
      }

      if (data?.id) {
        // 轨 2：新自愈执行闭环状态机入口 (非 A001 的具体告警，如 A004)
        addMessage({
          id: Date.now().toString(),
          type: 'ai',
          contentType: 'remediation_offer',
          content: '基于诊断结论，我已为您生成了自愈修复方案。此方案专为解决数据库从实例复制延迟而设计。请您点击下方按钮以查看或执行自愈操作。',
          data: {
            alarmId: data.id,
            alertTitle: data.title || '数据库从实例复制延迟严重',
            title: '清理临时归档日志并重启 mysql-user-slave-01 复制线程',
            risk: '中',
            confidence: '94%',
            targetCount: 2,
            remediation: getRemediationMockData(data.id)
          },
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        return;
      }

      addMessage({
        id: Date.now().toString(),
        type: 'ai',
        contentType: 'action_confirm',
        content: '基于诊断结论，系统已生成针对性修复方案。该操作属于高危指令，请在核对 Dry-run 预览后进行最终授权执行。',
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

    if (action === 'TRIGGER_HEAL_FLOW') {
      addMessage({
        id: `confirm-${Date.now()}`,
        type: 'ai',
        contentType: 'remediation_confirm',
        content: '为了保障自愈操作的安全与合规，请核对并确认下方自愈授权风险。',
        data: {
          ...data,
          confirmed: false,
          cancelled: false
        },
        timestamp: new Date().toLocaleTimeString()
      });
      return;
    }

    if (action === 'AUTHORIZE_HEAL_EXECUTION_FROM_BUBBLE') {
      // 锁定当前气泡消息的状态
      const confirmMsg = [...messages].reverse().find(m => m.contentType === 'remediation_confirm' && m.data?.alarmId === data?.alarmId);
      if (confirmMsg) {
        updateMessage(confirmMsg.id, {
          data: {
            ...confirmMsg.data,
            confirmed: true
          }
        });
      }
      // 真正下发命令行实时控制台日志
      handleAction('AUTHORIZE_HEAL_EXECUTION', data);
      return;
    }

    if (action === 'CANCEL_HEAL_FLOW_FROM_BUBBLE') {
      const confirmMsg = [...messages].reverse().find(m => m.contentType === 'remediation_confirm' && m.data?.alarmId === data?.alarmId);
      if (confirmMsg) {
        updateMessage(confirmMsg.id, {
          data: {
            ...confirmMsg.data,
            cancelled: true
          }
        });
      }
      showToast('自愈授权操作已取消');
      return;
    }

    if (action === 'VIEW_HEAL_DETAILS') {
      setActiveRemediation(data);
      return;
    }

    if (action === 'CLOSE_REMEDIATION_TASK') {
      const alarmId = data?.alarmId || 'A004';
      const alarm = MOCK_ALARMS.find(a => a.id === alarmId);
      if (alarm) {
        alarm.status = 'resolved';
      }
      setAnomalyResolved(prev => !prev);
      addMessage({
        id: `close-${Date.now()}`,
        type: 'ai',
        contentType: 'text',
        content: `✓ 告警 ${alarmId}（${alarm ? alarm.title : ''}）已标记自愈闭环。自愈策略已被成功归档至故障特征库，相关实例状态同步变更为已恢复。`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      return;
    }

    if (action === 'NOT_EXECUTE_HEAL_FLOW') {
      addMessage({
        id: `not-execute-flow-${Date.now()}`,
        type: 'ai',
        contentType: 'text',
        content: '该方案暂时不执行，稍后您可在告警卡片上重新发起。',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      return;
    }

    if (action === 'SAVE_REMEDIATION_PLAN') {
      showToast('方案已保存，可稍后再发起');
      return;
    }

    if (action === 'CLOSE_REMEDIATION_TASK_WITH_IGNORE') {
      const alarmId = data?.alarmId || 'A004';
      addMessage({
        id: `ignore-${Date.now()}`,
        type: 'ai',
        contentType: 'text',
        content: `已忽略本次自愈推荐。反馈原因：「${data?.reason || ''}」已成功提交用于优化模型算法。`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      showToast('已忽略本次推荐');
      return;
    }

    if (action === 'ARCHIVE_KNOWLEDGE_BASE') {
      const alarmId = data?.alarmId || 'A004';
      const reviewMsg = [...messages].reverse().find(m => (m.contentType === 'remediation_review' || m.contentType === 'action_execution') && m.data?.alarmId === alarmId);
      if (reviewMsg) {
        updateMessage(reviewMsg.id, {
          data: {
            ...reviewMsg.data,
            archived: true
          }
        });
      }
      showToast('本次自愈故障排查过程及脚本已成功归档。');
      return;
    }

    if (action === 'SWITCH_TO_KNOWLEDGE_PAGE') {
      setActiveMenu('knowledge');
      showToast('已跳转至运维知识库');
      return;
    }

    if (action === 'ABORT_HEAL_EXECUTION') {
      if (logIntervalRef.current) {
        clearInterval(logIntervalRef.current);
        logIntervalRef.current = null;
      }
      const targetMsg = [...messages].reverse().find(m => m.contentType === 'action_execution');
      if (targetMsg) {
        updateMessage(targetMsg.id, {
          data: {
            ...targetMsg.data,
            status: 'aborted',
            logs: [...(targetMsg.data?.logs || []), '■ [ER] 用户主动中止执行，自愈流水线挂起。']
          }
        });
      }
      showToast('自愈执行已中止');
      return;
    }

    if (action === 'TRIGGER_REMEDIATION_ROLLBACK') {
      const alarmId = data?.alarmId || 'A004';
      const reviewMsg = [...messages].reverse().find(m => (m.contentType === 'remediation_review' || m.contentType === 'action_execution') && m.data?.alarmId === alarmId);
      if (reviewMsg) {
        updateMessage(reviewMsg.id, {
          data: {
            ...reviewMsg.data,
            rollbackStatus: 'success'
          }
        });
      }

      const alarm = MOCK_ALARMS.find(a => a.id === alarmId);
      if (alarm) {
        alarm.status = 'unresolved';
      }
      setAnomalyResolved(prev => !prev);
      
      const rollbackExecId = Date.now().toString();
      addMessage({
        id: rollbackExecId,
        type: 'ai',
        contentType: 'action_execution',
        content: '回滚流程已启动，正在执行反向撤销操作...',
        data: {
          mode: 'rollback',
          status: 'running',
          progress: 0,
          logs: [
            '[INIT] 启动回滚任务 HEAL-ROLLBACK-A004',
            '[PRE] 检测 mysql-user-slave-01 当前指针状态...',
            '[EXEC] 执行从实例复制线程停止 (STOP SLAVE)...',
            '[EXEC] 重置 MySQL 从实例同步指针到变更前状态...',
            '[EXEC] 启动从实例复制线程，恢复初始延迟基线...',
            '[FINAL] 回滚完成，已完全恢复至自愈前原始状态。'
          ]
        },
        timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
      });
      
      setTimeout(() => {
        updateMessage(rollbackExecId, {
          data: {
            mode: 'rollback',
            status: 'success',
            progress: 100,
            logs: [
              '[INIT] 启动回滚任务 HEAL-ROLLBACK-A004',
              '[PRE] 检测 mysql-user-slave-01 当前指针状态...',
              '[EXEC] 执行从实例复制线程停止 (STOP SLAVE)...',
              '[EXEC] 重置 MySQL 从实例同步指针到变更前状态...',
              '[EXEC] 启动从实例复制线程，恢复初始延迟基线...',
              '[FINAL] 回滚完成，已完全恢复至自愈前原始状态。'
            ]
          }
        });
      }, 2000);
      return;
    }

    if (action === 'FORCE_UPGRADE_MANUAL') {
      showToast('已成功升级为人工高优工单，正在派发中...');
      return;
    }

    if (action === 'AUTHORIZE_HEAL_EXECUTION') {
      const alarmId = data?.alarmId || 'A004';
      if (alarmId === 'A001') {
        return;
      }
      
      const executionId = Date.now().toString();
      const isOtelFallback = !data?.alarmId && data?.title?.includes('OTel');
      
      if (isOtelFallback) {
        const initialData = {
          status: 'running',
          progress: 0,
          logs: ['[INIT] 执行引擎就绪，分配任务 ID: HEAL-99201', '[AUTH] 权限校验成功: SRE-Admin-Role (已确认)']
        };

        addMessage({
          id: executionId,
          type: 'ai',
          contentType: 'action_execution',
          content: '修复执行流水线已启动，正在实时同步执行日志...',
          data: initialData,
          timestamp: new Date().toLocaleTimeString()
        });

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

        logIntervalRef.current = setInterval(() => {
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
            if (logIntervalRef.current) {
              clearInterval(logIntervalRef.current);
              logIntervalRef.current = null;
            }
            updateMessage(executionId, { 
              data: { ...currentExecData, status: 'success', progress: 100 } 
            });
          }
        }, 1000);
        return;
      }
      
      // 轨 2：新自愈执行（非 A001 告警，主要是 A004）
      const initialData = {
        status: 'running',
        progress: 0,
        logs: [
          '[INIT] 自愈任务启动，任务 ID: HEAL-EXEC-A004',
          '[AUTH] 权限核对成功: SRE-Admin-Role 授权通过',
          '[PRE] 目标实例 mysql-user-slave-01 SSH 连通性测试中...'
        ]
      };

      addMessage({
        id: executionId,
        type: 'ai',
        contentType: 'action_execution',
        content: "🔄 阶段一：自动化自愈执行\n已启动自愈执行流水线，正在对目标实例进行物理修复：",
        data: initialData,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      const fullLogs = [
        '[PRE] 节点 mysql-user-slave-01 (10.0.3.15) 连通性正常，只读属性确认 [READ-ONLY=ON] ✅',
        '[EXEC] 开始安全截断临时归档 binlog 文件 (rm -rf /var/log/mysql/mysql-bin.000*)...',
        '[EXEC] 正在截断 binlog 文件...',
        '[EXEC] 临时磁盘空间已释放。当前磁盘使用率: 41% ✅',
        '[EXEC] 执行从库复制指针与主库重新对齐 (CHANGE MASTER TO)...',
        '[EXEC] 启动从实例复制线程 (START SLAVE)...',
        '[POST] 正在检测主从同步状态 (Seconds_Behind_Master)...',
        '[POST] 复制线程运行中 (Slave_IO_Running: Yes, Slave_SQL_Running: Yes) ✅',
        '[POST] 主从延迟 Seconds_Behind_Master: 0.2s (已恢复正常基线)',
        '[FINAL] 自愈处理方案执行完毕，正在调用 AI 专家进行自愈后指标核对与自愈质量评估...'
      ];

      let currentLogIndex = 0;
      let currentExecData = { ...initialData };

      logIntervalRef.current = setInterval(() => {
        if (currentLogIndex < fullLogs.length) {
          const logEntry = fullLogs[currentLogIndex];
          currentExecData = {
            ...currentExecData,
            progress: Math.min(10 + (currentLogIndex * 9), 95),
            logs: [...currentExecData.logs, logEntry]
          };
          updateMessage(executionId, { data: currentExecData });
          currentLogIndex++;
        } else {
          if (logIntervalRef.current) {
            clearInterval(logIntervalRef.current);
            logIntervalRef.current = null;
          }

          const auditData = {
            alarmId: alarmId,
            status: 'success',
            audit: {
              operator: "超管（超）",
              approver: "—",
              time: (() => {
                const now = new Date();
                return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
              })(),
              script: "SCR-MYSQL-CLEANUP-v2.1 (预置)",
              result: "执行成功（已归档至故障特征库）"
            }
          };

          updateMessage(executionId, { 
            content: "🔄 阶段一：自动化自愈执行\n已启动自愈执行流水线，正在对目标实例进行物理修复：\n\n📈 阶段二：自愈效果复核与审计归档\n系统已安全关闭原告警，正在对自愈后各项性能指标进行复核核算：",
            data: { 
              ...currentExecData, 
              status: 'success', 
              progress: 100,
              ...auditData
            } 
          });

          // 联动自动关闭告警并变绿
          const alarm = MOCK_ALARMS.find(a => a.id === alarmId);
          if (alarm) {
            alarm.status = 'resolved';
          }
          setAnomalyResolved(prev => !prev);
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
      const fullAnalysisData = generateInspectionAnalysisData(data);
      const enrichedData = {
        format: '0412_phased',
        currentStep: 4,
        ...fullAnalysisData,
        ...data
      };
      setActiveReportData(enrichedData);
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
            data: isMysqlCreateWizard ? { isMysql: true } : {},
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
        const targets = data?.targets || [];
        setSelectedInspectionTargets(targets);

        if (isMysqlCreateWizard) {
          setInspectionWizard('rule');
          // Mock 更多数据以便展示多资源对象的收起交互
          const targetStr = targets.length > 5 ? targets.map((t: any) => t.name).join(', ') : 'mysql-order-primary, mysql-order-replica-01, mysql-order-replica-02, mysql-user-master, mysql-user-slave-01, mysql-user-slave-02, mysql-pay-db-01, mysql-pay-db-02, mysql-inventory-master, mysql-inventory-slave, mysql-log-db, mysql-archive-db';
          const mysqlTasks = [
            {
              taskId: 'TASK-MYSQL-01',
              name: 'MySQL数据库连接数监测',
              description: '监控当前活动连接数，预防数据库句柄耗尽',
              resourceType: 'MySQL 实例',
              target: targetStr,
              scriptType: 'shell',
              scriptContent: '#!/bin/bash\n# MySQL 连接数监测脚本\n/scripts/check_mysql_conn.sh --threshold ${MAX_CONN} --warning ${WARN_CONN}',
              variables: [
                { name: 'MAX_CONN', value: '800', editable: true },
                { name: 'WARN_CONN', value: '500', editable: true },
                { name: 'MYSQL_PORT', value: '3306', editable: false }
              ]
            },
            {
              taskId: 'TASK-MYSQL-02',
              name: 'MySQL慢查询监测',
              description: '捕获并分析慢 SQL 数量，诊断数据库性能瓶颈',
              resourceType: 'MySQL 实例',
              target: targetStr,
              scriptType: 'python',
              scriptContent: 'import sys\n# MySQL 慢查询扫描脚本\nprint("Scanning slow queries...")\nsys.exit(0)',
              variables: [
                { name: 'SLOW_LIMIT_SEC', value: '3', editable: true },
                { name: 'WARN_SLOW_COUNT', value: '10', editable: true }
              ]
            },
            {
              taskId: 'TASK-MYSQL-03',
              name: 'MySQL主从同步延迟监测',
              description: '测量 Seconds_Behind_Master 延迟指标，确保副本同步正常',
              resourceType: 'MySQL 实例',
              target: targetStr,
              scriptType: 'shell',
              scriptContent: '#!/bin/bash\n# MySQL 主从延迟监测脚本\n/scripts/check_mysql_repl.sh --max-delay ${MAX_DELAY_SEC}',
              variables: [
                { name: 'MAX_DELAY_SEC', value: '30', editable: true }
              ]
            }
          ];

          setTempMysqlPlan(prev => ({
            ...prev,
            name: `MySQL-${targetStr.split(',')[0].trim()}-自动拨测`,
            target: targetStr,
            tasks: mysqlTasks
          }));

          const userMsg: Message = {
            id: Date.now().toString(),
            type: 'user',
            contentType: 'text',
            content: `🎯 已选定巡检对象: ${targetStr}`,
            timestamp: new Date().toLocaleTimeString()
          };
          addMessage(userMsg);

          setTimeout(() => {
            addMessage({
              id: (Date.now() + 1).toString(),
              type: 'ai',
              contentType: 'mysql_task_edit_list',
              content: '已为您的 MySQL 实例生成了 3 个标准的巡检子任务。您可以在下方 Tab 页签中微调其运行变量与参数：',
              data: { tasks: mysqlTasks },
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
          }, 600);
          return;
        }

        setInspectionWizard('rule');
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

    if (action === 'MYSQL_TASK_EDIT_DONE') {
      const updatedTasks = data?.tasks || [];
      const updatedRules = updatedTasks.map((t: any) => t.name.replace('监测', '').replace('检测', ''));
      setTempMysqlPlan(prev => ({
        ...prev,
        tasks: updatedTasks,
        rules: updatedRules
      }));

      addMessage({
        id: Date.now().toString(),
        type: 'user',
        contentType: 'text',
        content: '✍️ 已确认并微调 MySQL 巡检子任务变量配置',
        timestamp: new Date().toLocaleTimeString()
      });

      if (inspectionTaskMode === 'immediate') {
        setInspectionWizard('confirmation');
        setTimeout(() => {
          handleAction('MYSQL_PLAN_SUBMIT_FINAL', { executionType: 'immediate' });
        }, 600);
      } else {
        setInspectionWizard('schedule');
        setTimeout(() => {
          addMessage({
            id: Date.now().toString(),
            type: 'ai',
            contentType: 'frequency_select',
            content: '配置保存成功。接下来请在下方卡片中设定 MySQL 巡检任务的执行频次及名称：',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }, 600);
      }
      return;
    }

    if (action === 'MYSQL_PLAN_SUBMIT_FINAL') {
      const execType = data?.executionType || tempMysqlPlan.executionType || 'scheduled';
      const targetStr = tempMysqlPlan.target || 'MySQL-Order-Primary';
      
      const newPlan = {
        ...tempMysqlPlan,
        id: `PLAN-${(inspectionTasks.length + 1).toString().padStart(3, '0')}`,
        planId: `PLAN-ID-${1000 + inspectionTasks.length}`,
        name: execType === 'immediate' ? `MySQL-${targetStr.split(',')[0].trim()}-临时核查` : (inspectionTaskName || tempMysqlPlan.name || `MySQL-${targetStr.split(',')[0].trim()}-定时巡检`),
        enabled: true,
        status: '健康',
        inspectionStatus: execType === 'immediate' ? '巡检中' : '已结束',
        riskLevel: '低',
        summary: execType === 'immediate' 
          ? '立即执行任务已成功启动，AI 拨测引擎正在对 3 个子任务进行在线核查。' 
          : '巡检计划已启用，系统将按照设定的周期频率自动执行深度检查。',
        updatedAt: new Date().toLocaleString(),
        executionType: execType,
        cronExpression: execType === 'scheduled' ? (inspectionCronValue || '0 0 * * *') : '',
        cronDescription: execType === 'scheduled' ? (inspectionFrequency || '每天一次') : '',
        nextExecutionTime: execType === 'scheduled' ? '2024-04-13 00:00:00' : ''
      };

      setInspectionTasks(prev => [newPlan, ...prev]);
      setInspectionWizard('success');
      setIsMysqlCreateWizard(false);

      setTimeout(() => {
        addMessage({
          id: Date.now().toString(),
          type: 'ai',
          contentType: 'task_success',
          content: execType === 'immediate'
            ? `⚡ 立即执行 MySQL 巡检任务创建成功并已启动！任务名称：${newPlan.name}，已关联对象：${newPlan.target}。`
            : `✨ 定时调度 MySQL 巡检计划创建成功！任务名称：${newPlan.name}，调度周期：${newPlan.cronDescription}。`,
          data: { hostCount: 3 },
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }, 800);
      return;
    }

      if (action === 'STEP_FINISH') {
        if (isMysqlCreateWizard) {
          handleAction('MYSQL_PLAN_SUBMIT_FINAL', { 
            executionType: 'scheduled', 
            cronExpression: inspectionCronValue, 
            cronDescription: inspectionFrequency 
          });
          return;
        }

        const generatedTasks = (selectedInspectionTargets || []).map((targetItem: any, idx: number) => {
          return {
            taskId: `TASK-GEN-${Date.now().toString().slice(-4)}-${idx}`,
            name: `${targetItem.name || '核心指标'}监控`,
            description: `针对 ${targetItem.name || '资源'} 的性能和稳定性自动巡检`,
            resourceType: targetItem.type === 'DB' ? 'MySQL 实例' : targetItem.type === 'Host' ? '主机/SLB' : 'Kubernetes 集群',
            target: targetItem.name,
            scriptType: 'shell',
            scriptContent: `#!/bin/bash\n# 自动生成的 ${targetItem.name} 监测脚本\nexit 0`,
            variables: [
              { name: 'TIMEOUT', value: '5s', editable: true },
              { name: 'SYSTEM_ENV', value: 'production', editable: false }
            ]
          };
        });

        const newPlan = {
          id: `PLAN-${(inspectionTasks.length + 1).toString().padStart(3, '0')}`,
          planId: `PLAN-ID-${1000 + inspectionTasks.length}`,
          name: inspectionTaskName || '核心链路稳定性巡检任务',
          target: selectedInspectionTargets.map((t: any) => t.name).join(', ') || '集群 (VPC-Prod-Main)',
          status: '健康',
          inspectionStatus: '已结束',
          riskLevel: '低',
          rules: selectedInspectionTargets.map((t: any) => `${t.name}指标`),
          summary: '任务已成功创建。系统将根据设定的频率自动调度 AI 专家执行深度诊断。',
          updatedAt: new Date().toLocaleString(),
          executionType: 'scheduled',
          cronExpression: inspectionCronValue || '0 0 * * *',
          cronDescription: inspectionFrequency || '每天凌晨 00:00',
          tasks: generatedTasks,
          enabled: true
        };

        setInspectionTasks(prev => [newPlan, ...prev]);
        setInspectionWizard('success');
        setTimeout(() => {
          addMessage({
            id: Date.now().toString(),
            type: 'ai',
            contentType: 'task_success',
            content: '✨ 巡检任务创建成功！',
            data: { hostCount: selectedInspectionTargets.length || 5 },
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
      <div className="h-[64px] overflow-hidden relative mt-1 border-t border-white/[0.03] pt-2">
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
      <div className="h-[80px] overflow-hidden relative mt-1 border-t border-white/[0.03] pt-2">
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
          <div onClick={() => createNewSession('diagnostic', 'AI 诊断专家')} className="bg-[#1e1e2d] border border-slate-800/60 rounded-2xl p-5 flex flex-col hover:border-slate-700 transition-all cursor-pointer group shadow-lg">
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
          <div onClick={() => createNewSession('diagnostic', 'AI 诊断专家')} className="bg-[#1e1e2d] border border-slate-800/60 rounded-2xl p-5 flex flex-col hover:border-slate-700 transition-all cursor-pointer group shadow-lg">
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
          <div onClick={() => createNewSession('knowledge', 'AI 知识专家')} className="bg-[#1e1e2d] border border-slate-800/60 rounded-2xl p-5 flex flex-col hover:border-slate-700 transition-all cursor-pointer group shadow-lg">
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
                    const tagMatch = prev.match(/@(诊断|巡检|知识专家|告警)/);
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
                    const tagMatch = prev.match(/@(诊断|巡检|知识专家|告警)/);
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
                    const tagMatch = prev.match(/@(诊断|巡检|知识专家|告警)/);
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
          <div onClick={() => createNewSession('inspection', 'AI 巡检助手')} className="bg-[#1e1e2d] border border-slate-800/60 rounded-2xl p-5 flex flex-col hover:border-slate-700 transition-all cursor-pointer group shadow-lg">
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
                <div className="bg-[#141418] rounded border border-rose-500/20 overflow-hidden">
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

                <div className="bg-[#141418] rounded border border-orange-500/20 overflow-hidden">
                  <div className="p-1.5 flex justify-between items-center cursor-pointer hover:bg-white/5">
                    <div className="flex items-center gap-1 text-[11px] text-orange-500 font-bold">
                      <ChevronRight size={14} /> k8s-node 资源告警 (聚合 2 条)
                    </div>
                  </div>
                </div>

                {/* Single Alerts */}
                <div>
                  <div className="text-[10px] text-slate-500 mb-1.5 font-bold px-1 uppercase tracking-wider">独立散发告警 (2)</div>
                  <div className="space-y-1.5 text-[10px]">
                    <div className="flex flex-col px-1 hover:bg-white/5 rounded py-1 pb-1.5">
                      <div className="flex justify-between"><span>user-service: 网络延迟突增</span><span className="text-orange-500">1m</span></div>
                      <div className="flex gap-2 mt-2 text-xs">
                        <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded cursor-pointer hover:bg-emerald-500/20 border border-emerald-500/20">👉 开启降级预案</span>
                      </div>
                    </div>
                    <div className="flex justify-between px-1 hover:bg-white/5 rounded py-0.5 opacity-60"><span>gateway: CPU 瞬时 90%</span><span className="text-slate-500">10s</span></div>
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
              <div className="bg-[#141418] border border-slate-800 rounded p-2 text-slate-500 flex items-center mb-2">
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
              <div className="space-y-1 text-[10px] bg-black/30 p-2 rounded max-h-32 overflow-y-auto no-scrollbar">
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
              <div className="bg-[#141418] border border-slate-800 rounded p-2 text-slate-500 flex items-center mb-2">
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
                <div className="flex justify-between items-center border-t border-white/[0.03] pt-1.5 mt-0.5">
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
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-xs">2026-04-07 日报</span>
                <Download size={12} className="text-slate-500 cursor-pointer hover:text-blue-400" />
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-xs text-slate-500">2026-W14 周报</span>
                <Download size={12} className="text-slate-600 cursor-pointer hover:text-blue-400" />
              </div>
              <div className="flex justify-between items-center py-1 border-t border-white/5 mt-1 pt-1">
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
          ? 'bg-[#111324] border-2 border-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.25)] ring-4 ring-indigo-500/10'
          : (activeMenu === 'home' || activeMenu === 'assistant')
            ? 'bg-[#111324] border border-indigo-500/30 shadow-[0_0_40px_rgba(99,102,241,0.08)] focus-within:border-indigo-500/60 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:shadow-[0_0_60px_rgba(99,102,241,0.15)]'
            : 'bg-[#161a29] border border-slate-800 shadow-2xl focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/30'
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
                activeThread ? `针对方案「${activeThread.schemeTitle}」继续提问，如：这个脚本执行后会有什么风险吗？` :
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
                        className="flex items-center gap-2.5 px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-xl shrink-0 hover:bg-white/[0.08] hover:border-indigo-500/40 transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20 text-indigo-400">
                          {attr.type === 'log' ? <Terminal size={14} /> : <ClipboardList size={14} />}
                        </div>
                        <div className="flex flex-col gap-0 pr-2 min-w-0">
                          <span className="text-[12px] text-slate-100 font-bold truncate leading-tight">
                            {fileName.length > 5 ? `${fileName.substring(0, 5)}...` : fileName}
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
              {(activeMenu === 'knowledge' || activeMenu === 'home') && (
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
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-medium text-slate-300 ${isKLibPickerOpen ? 'bg-[#9882ff]/10 border-[#9882ff]/50 text-[#9882ff] shadow-lg shadow-[#9882ff]/10' : 'bg-transparent border-transparent hover:text-slate-100 hover:bg-white/5'}`}
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
                    { title: 'payment_error_trace.log', type: 'log' },
                    { title: 'cluster_metrics_report.pdf', type: 'file' },
                    { title: 'nginx_access_summary.csv', type: 'file' },
                    { title: 'system_topology_v2.yaml', type: 'file' }
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
                  const mockImages = ['p99_latency_spike.png', 'k8s_node_oom_error.jpg', 'database_iops_trend.png'];
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
                      { id: '@诊断', icon: Activity },
                      { id: '@巡检', icon: HeartPulse },
                      { id: '@知识专家', icon: BookOpen },
                      { id: '@告警', icon: Bell }
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
                            const clean = prev.replace(/@(诊断|巡检|知识专家|告警)/g, '').replace(/\s\s+/g, ' ').trim();
                            return `${tag.id} ${clean}`.trim();
                          });
                        }} 
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all text-xs font-bold font-mono ${inputValue.includes(tag.id) ? 'bg-[#9882ff]/20 border-[#9882ff]/50 text-[#9882ff]' : 'border-slate-700/50 bg-[#161a29]/50 text-slate-400 hover:text-[#9882ff] hover:border-[#9882ff]/30'}`}
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
    <div className="flex flex-col h-screen bg-[#11121d] font-sans overflow-hidden selection:bg-indigo-500/30">

      {/* Global Header */}
      <header className="h-16 border-b border-slate-800/60 flex items-center bg-[#13141f] shrink-0 z-30">
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
          {/* 交互说明按钮 (移至顶导) */}
          <button 
            onClick={() => setIsGuideOpen(true)}
            className="px-3 py-1.5 bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 rounded-lg transition-all flex items-center gap-2 group cursor-pointer"
          >
            <HelpCircle size={14} className="text-indigo-400 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold text-slate-300 tracking-tight">交互说明</span>
          </button>
          <div className="w-px h-4 bg-slate-800/60 mx-1" />
          <button className="text-slate-500 hover:text-slate-300 transition-colors"><Settings size={18} /></button>
          <div className="w-8 h-8 rounded-full bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <User size={16} />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Primary Navigation Bar (Sidebar) */}
        <aside className="w-[68px] bg-[#13141f] flex flex-col shrink-0 border-r border-slate-800/60 relative z-[100] shadow-[4px_0_20px_rgba(0,0,0,0.3)]">
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
                        ? 'bg-[#2b2d3b] shadow-sm border border-slate-700/50'
                        : 'hover:bg-slate-800/50 border border-transparent'}
                      `}
                  >
                    <Icon size={22} strokeWidth={1.5} className={`
                        transition-colors duration-200
                        ${isActive && item.id === 'home' ? 'text-slate-200' : ''}
                        ${isActive && item.id !== 'home' ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}
                      `} />
                    
                    {/* Premium Popover Tooltip */}
                    <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 pointer-events-none opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 z-[100]">
                      <div className="relative flex items-center">
                        {/* Triangle Arrow */}
                        <div className="w-1.5 h-1.5 bg-[#1e202e] border-l border-b border-slate-700/50 rotate-45 transform -translate-x-1" />
                        {/* Label Content */}
                        <div className="bg-[#1e202e]/95 backdrop-blur-md border border-slate-700/50 text-slate-100 px-3 py-1.5 rounded-lg whitespace-nowrap shadow-2xl shadow-black/40">
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
              className={`w-11 h-11 flex items-center justify-center relative group rounded-xl transition-all duration-200 cursor-pointer ${isHistoryOpen ? 'bg-indigo-600 shadow-lg shadow-indigo-500/20 border border-indigo-400/50' : 'bg-[#141624] border border-slate-800'}`}
              title="会话历史"
            >
              <History size={20} className={isHistoryOpen ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'} />
              {sessions.length > 0 && !isHistoryOpen && (
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-indigo-500 border border-[#0d0f1a]" />
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
              className="fixed left-[68px] top-0 bottom-0 w-[300px] bg-[#0d0f1a]/fb border-r border-slate-800 shadow-2xl z-30 flex flex-col backdrop-blur-xl"
            >
              <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <History size={16} className="text-indigo-400" /> 会话历史记录
                </h3>
                <button onClick={() => setIsHistoryOpen(false)} className="text-slate-500 hover:text-white transition-colors">
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
                        className={`p-3 rounded-xl mb-1 cursor-pointer transition-all border ${isActive ? 'bg-indigo-600/10 border-indigo-500/30 ring-1 ring-indigo-500/10' : 'bg-transparent border-transparent hover:bg-white/[0.03] hover:border-slate-800'}`}
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
          <aside className="w-[360px] bg-[#0f0f12] border-r border-slate-800/50 flex flex-col shrink-0">
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
        <main className="flex-1 flex flex-col bg-[#11121d] relative min-h-0 min-w-0">
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
                  <div className="flex-1 flex flex-col min-h-0 bg-[#0a0b14]">
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
                  <div className="flex-1 flex min-h-0 bg-[#0a0a0c]">
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
                  <div className="flex-1 flex min-h-0 bg-[#0a0a0c] relative overflow-hidden">
                    <div className="flex-1 flex flex-col min-h-0 relative bg-black/40 z-0">
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
                  <div className="flex-1 flex flex-col min-h-0 bg-[#0a0a0c] relative overflow-hidden">
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
                              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 border border-white/10 shadow-[0_4px_20px_rgba(99,102,241,0.4)] flex items-center justify-center relative z-10 transition-transform hover:scale-105 duration-300">
                                <Bot size={22} className="text-white relative z-20" />
                              </div>
                              <h2 className="text-2xl font-extrabold text-white tracking-tight">SRE 智能助手</h2>
                            </div>
                            <p className="text-slate-400 text-xs font-medium max-w-xl text-center leading-relaxed">
                              今日 <span className="text-rose-500 font-bold mx-0.5">3 条活跃告警</span>待处理。直接描述问题，或从下方场景快速发起。
                            </p>
                          </div>

                          <div className="w-full relative shadow-2xl space-y-4">
                            {/* Active Alert Banner - Dynamic Scrolling with Animation */}
                            <div 
                              className="w-full bg-[#1e0f15]/80 border border-rose-500/20 rounded-2xl px-4 py-3 flex items-center justify-between shadow-lg relative overflow-hidden group/banner"
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
                                const tagMatch = prev.match(/@(诊断|巡检|知识专家|告警)/);
                                return tagMatch ? `${tagMatch[0]} 帮我分析当前活跃告警根因` : '帮我分析当前活跃告警根因';
                              })} className="px-3 py-1.5 bg-[#1e1e2d] hover:bg-[#2c2d3c] border border-slate-700/50 rounded-lg text-[11px] text-slate-300 transition-all flex items-center gap-1.5 font-bold shadow-sm">
                                 <Activity size={12} className="text-indigo-400" /> 分析当前活跃告警根因
                               </button>
                               <button onClick={() => setInputValue(prev => {
                                const tagMatch = prev.match(/@(诊断|巡检|知识专家|告警)/);
                                return tagMatch ? `${tagMatch[0]} 当前服务响应慢，帮我排查链路瓶颈` : '当前服务响应慢，帮我排查链路瓶颈';
                              })} className="px-3 py-1.5 bg-[#1e1e2d] hover:bg-[#2c2d3c] border border-slate-700/50 rounded-lg text-[11px] text-slate-300 transition-all flex items-center gap-1.5 font-bold shadow-sm">
                                 <Network size={12} className="text-indigo-400" /> 服务响应慢，排查链路瓶颈
                               </button>
                               <button onClick={() => setInputValue(prev => {
                                const tagMatch = prev.match(/@(诊断|巡检|知识专家|告警)/);
                                return tagMatch ? `${tagMatch[0]} 查询 payment 服务的故障处置 SOP` : '查询 payment 服务的故障处置 SOP';
                              })} className="px-3 py-1.5 bg-[#1e1e2d] hover:bg-[#2c2d3c] border border-slate-700/50 rounded-lg text-[11px] text-slate-300 transition-all flex items-center gap-1.5 font-bold shadow-sm">
                                 <BookOpen size={12} className="text-indigo-400" /> 查询故障处​置 SOP
                               </button>
                               <button onClick={() => setInputValue(prev => {
                                const tagMatch = prev.match(/@(诊断|巡检|知识专家|告警)/);
                                return tagMatch ? `${tagMatch[0]} 帮我生成今日运维巡检报告` : '帮我生成今日运维巡检报告';
                              })} className="px-3 py-1.5 bg-[#1e1e2d] hover:bg-[#2c2d3c] border border-slate-700/50 rounded-lg text-[11px] text-slate-300 transition-all flex items-center gap-1.5 font-bold shadow-sm">
                                 <FileText size={12} className="text-indigo-400" /> 生成今日运维巡检报告
                               </button>
                               <button onClick={() => setInputValue(prev => {
                                const tagMatch = prev.match(/@(诊断|巡检|知识专家|告警)/);
                                return tagMatch ? `${tagMatch[0]} 今日告警收效和降噪情况如何？` : '今日告警收效和降噪情况如何？';
                              })} className="px-3 py-1.5 bg-[#1e1e2d] hover:bg-[#2c2d3c] border border-slate-700/50 rounded-lg text-[11px] text-slate-300 transition-all flex items-center gap-1.5 font-bold shadow-sm">
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
        {selectedPlanForDetail !== null && (
          <InspectionPlanDetailDrawer
            isOpen={true}
            onClose={() => setSelectedPlanForDetail(null)}
            plan={selectedPlanForDetail}
            onSave={handleSavePlan}
          />
        )}

        <DiagnosticReportDrawer
          isOpen={isReportDrawerOpen}
          onClose={() => setIsReportDrawerOpen(false)}
          data={activeReportData}
        />

        {globalError && (
          <div className="fixed inset-0 bg-red-950/95 border-4 border-red-500 z-[9999] overflow-auto p-10 text-white font-mono text-xs">
            <h1 className="text-xl font-bold text-red-400 mb-4">React App 崩溃捕获器 (Runtime Error Caught)</h1>
            <pre className="whitespace-pre-wrap leading-relaxed bg-black/40 p-5 rounded-lg border border-red-800">
              {globalError}
            </pre>
            <button
              onClick={() => {
                setGlobalError(null);
                window.location.reload();
              }}
              className="mt-6 px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-all"
            >
              清除错误并重新加载页面
            </button>
          </div>
        )}

        <InteractionGuideDrawer 
          isOpen={isGuideOpen}
          onClose={() => setIsGuideOpen(false)}
          expandedIds={expandedGuideIds}
          setExpandedIds={setExpandedGuideIds}
          activeSubId={activeGuideSubId}
          setActiveSubId={setActiveGuideSubId}
        />

        <AnimatePresence>
          {activeRemediation && (
            <SelfHealDetailDrawer
              data={activeRemediation}
              onClose={() => setActiveRemediation(null)}
              onConfirm={(data: any) => {
                setActiveRemediation(null);
                setShowConfirmRemediation(data);
              }}
            />
          )}

          {showNotExecuteDialog && (
            <SelfHealNotExecuteDialog
              data={showNotExecuteDialog}
              onClose={() => setShowNotExecuteDialog(null)}
              onAction={(act: string, payload: any) => {
                setShowNotExecuteDialog(null);
                handleAction(act, payload);
              }}
            />
          )}
        </AnimatePresence>
        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[250] px-4 py-2.5 bg-slate-900/90 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-xs font-black rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <span className="text-emerald-500 font-bold">✓</span>
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}