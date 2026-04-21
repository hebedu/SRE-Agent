
import sys

path = '/Users/hebe/Downloads/ai-sre-console_v2 2/src/App.tsx'
with open(path, 'r') as f:
    lines = f.readlines()

# Line numbers in view_file were 1-indexed.
# 4421 starts the else if (activeMenu === 'knowledge')
# indices are line_num - 1
start_idx = 4420
end_idx = 4480 # Line 4480 included

new_knowledge_block = [
    "    } else if (activeMenu === 'knowledge') {\n",
    "      if (selectedKLibIds.length === 0) {\n",
    "        setTimeout(() => {\n",
    "          addMessage({\n",
    "            id: (Date.now() + 1).toString(),\n",
    "            type: 'ai',\n",
    "            contentType: 'text',\n",
    "            content: \"⚠️ 您尚未选择知识范围。请先在左侧选择一个或多个知识库，这样我才能在指定的范围内为您搜索答案。\",\n",
    "            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })\n",
    "          });\n",
    "        }, 600);\n",
    "        return;\n",
    "      }\n",
    "\n",
    "      const aiMsgId = (Date.now() + 1).toString();\n",
    "      const currentTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });\n",
    "\n",
    "      // Step 1: Initial Processing State\n",
    "      addMessage({\n",
    "        id: aiMsgId,\n",
    "        type: 'ai', \n",
    "        contentType: 'text', \n",
    "        content: \"🔍 正在解析问题并进行多维知识库检索...\", \n",
    "        timestamp: currentTimestamp\n",
    "      });\n",
    "\n",
    "      // Step 2: Show Retrieval Card after delay\n",
    "      setTimeout(() => {\n",
    "        updateMessage(aiMsgId, {\n",
    "          content: \"📖 检索完成。已从选中的知识库中提取核心证据，正在生成专业解答...\",\n",
    "          retrievalData: {\n",
    "            libCount: selectedKLibIds.length,\n",
    "            docCount: 128,\n",
    "            hitCount: 5,\n",
    "            evidenceCount: 12, \n",
    "            keywords: inputValue.slice(0, 15) + (inputValue.length > 15 ? '...' : ''),\n",
    "            topDocs: [\n",
    "              { title: 'Pod 重启排查 SOP', score: 0.94 },\n",
    "              { title: 'Kubernetes 资源调度深度解析', score: 0.88 },\n",
    "              { title: '核心结算链路 P0 级事故复盘', score: 0.79 }\n",
    "            ],\n",
    "            sources: [\n",
    "              { title: 'Pod 重启排查 SOP', score: 0.94, reason: '包含 CrashLoopBackOff 的标准定义与恢复步骤', fragment: '当观察到 Pod 处于 CrashLoopBackOff 时，通常意味着应用进程启动后立即退出，应优先检查环境变量与配置映射...' },\n",
    "              { title: 'Kubernetes 资源调度深度解析', score: 0.88, reason: '解释了探针失败导致容器重启的底层机制', fragment: 'Liveness Probe 失败会直接触发 Kubelet 发起容器重启指令，若 initialDelaySeconds 过短，则会陷入持续重启的死循环。' }\n",
    "            ]\n",
    "          }\n",
    "        });\n",
    "        scrollToBottom();\n",
    "\n",
    "        // Step 3: Streaming Final Content\n",
    "        const fullContent = `基于您提供的问题，我已从选中的核心知识库中为您提取了相关的标准排查流程。主要涉及以下核心步骤：\\n\\n**1. 初步分析结论：**\\n该现象通常由 Pod 持续发生的 [CrashLoopBackOff] 状态引起，这与配置参数错误、启动探针超时或底层资源分配不均（CPU Throttle）密切相关。\\n\\n**2. 核心排查建议：**\\n- **探测器配置**：检查存活探针（liveness）和就绪探针（readiness）的 \\`initialDelaySeconds\\` 是否预留了足够的启动预热时间。\\n- **配置一致性**：确认挂载的 ConfigMap 或 Secret 权限是否配置正确，是否存在导致启动加载失败的项目缺失。\\n- **环境详情**：运行 \\`kubectl describe pod <pod-name>\\` 查看具体 Event，确认是由于拉取失败（ImagePullBackOff）导致，还是程序由于 Panic 而被动退出。\\n\\n**3. 补充说明：**\\n你可以点击上方的列表查看检索来源。如果需要精确到特定的集群环境，可以挂载对应的 Event Log 附件进行深度诊断。`;\n",
    "\n",
    "        const paragraphs = fullContent.split('\\n\\n');\n",
    "        let currentProgress = \"\";\n",
    "        \n",
    "        paragraphs.forEach((p, idx) => {\n",
    "          setTimeout(() => {\n",
    "            currentProgress += (idx === 0 ? \"\" : \"\\n\\n\") + p;\n",
    "            updateMessage(aiMsgId, { content: currentProgress });\n",
    "            scrollToBottom();\n",
    "          }, (idx + 1) * 800);\n",
    "        });\n",
    "      }, 1500);\n",
    "    }\n"
]

# Replacement
# lines[4420:4480] is line 4421 up to 4480
# current lines[4420] = '    } else if (activeMenu === \'knowledge\') {\n'
# current lines[4479] = '      }, 1200);\n'

print(f"Current start line: {lines[start_idx]}")
print(f"Current end line: {lines[end_idx-1]}")

lines[start_idx:end_idx] = new_knowledge_block

with open(path, 'w') as f:
    f.writelines(lines)

print("Replacement successful.")
