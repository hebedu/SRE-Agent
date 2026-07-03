"                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => setSelectedTaskForEdit(taskItem)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white text-[10px] font-black transition-all border border-indigo-500/20 active:scale-95"
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

        {/* 底部控制栏 */}
        <div className="p-6 border-t border-slate-800/60 bg-slate-900/20 shrink-0 flex justify-end items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs font-bold transition-all"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95 border border-blue-500/20"
          >
            <Save size={14} /> 保存计划
          </button>
        </div>

        {/* 在一阶抽屉内部挂载二级 Modal，实现状态局部控制，消除 App 级全局重渲染卡顿 */}
        {selectedTaskForEdit !== null && (
          <InspectionTaskEditModal
            isOpen={true}
            onClose
<truncated 167 bytes>