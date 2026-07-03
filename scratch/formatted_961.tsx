"const InspectionPlanDetailDrawer = ({
  isOpen,
  onClose,
  plan,
  onSave,
  onDelete,
  onEditTask
}: InspectionPlanDetailDrawerProps) => {
  // 采用安全克隆防崩溃
  const [editedPlan, setEditedPlan] = useState<any>(() => plan ? safeClonePlan(plan) : {});
  // 二级编辑局部状态
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<any>(null);

  if (!isOpen || !editedPlan) return null;

  const handleSave = () => {
    onSave(editedPlan);
  };

  const handleToggleEnable = () => {
    if (editedPlan.executionType === 'immediate') return; // 立即执行不支持修改启用状态
    setEditedPlan({ ...editedPlan, enabled: !editedPlan.enabled });
  };

  // 本地合并二级任务修改逻辑，不触发 App 大树刷新
  const handleSaveTaskLocal = (updatedTask: any) => {
    const updatedTasksList = editedPlan.tasks.map((t: any) => 
      t.taskId === updatedTask.taskId ? updatedTask : t
    );
    const updatedRules = updatedTasksList.map((t: any) => t.name.replace('监测', ''));
    setEditedPlan({ 
      ...editedPlan, 
      tasks: updatedTasksList,
      rules: updatedRules,
      updatedAt: new Date().toLocaleString()
    });
    setSelectedTaskForEdit(null);
  };

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
      {/* 抽屉：修改宽度为 45% 自适应 */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
        className="fixed top-0 right-0 h-full w-[45%] min-w-[500px] max-w-[900px] bg-[var(--bg-deep-alt)] border-l border-slate-700/80 z-[102] flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.5)] text-slate-200"
      >
        {/* 头部：主标题为计划名称，副标
<truncated 1011 bytes>