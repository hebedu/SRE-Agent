# 巡检报告 Markdown 生成规范

> 版本：v1.0　适用：SRE-Agent 巡检报告导出（Markdown / HTML）
> 说明：本规范描述后端生成巡检报告 Markdown 的结构、字段与分支差异，并附完整 JSON 数据契约。

---

## 1. 文件约定

| 项目 | 约定 |
|------|------|
| 文件格式 | UTF-8 编码的 Markdown（`.md`） |
| 文件命名 | `巡检报告_{报告ID}_{分支}.md`，如 `巡检报告_INSP-20260705-002_abnormal.md` |
| 分支类型 | `normal`（正常）/ `abnormal`（异常）/ `failed`（失败） |
| 单元格换行 | 表格单元格内换行用 `<br>` |
| 段落分隔 | 段落之间用空行 |

---

## 2. 整体结构

报告固定为**报告头 + 三个一级章节**：

```
# SRE-Agent 自动巡检报告        （报告头）
一、巡检基本状态概览             （固定）
二、巡检对象分析                 （固定）
三、最终结论                     （固定）
```

> 三个一级标题在所有分支中**完全一致**，差异只体现在各章节内部内容。

---

## 3. 报告头

```markdown
# SRE-Agent 自动巡检报告

报告名称: {报告名称}
报告 ID: {报告ID}
巡检分支: {分支标签}
生成时间: {生成时间}

---
```

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| 报告名称 | string | 巡检计划名称 | 核心交易数据库实例高可用巡检 |
| 报告 ID | string | 报告唯一标识 | INSP-20260705-002 |
| 分支标签 | string | `健康 (normal)` / `异常 (abnormal)` / `失败 (failed)` | 异常 (abnormal) |
| 生成时间 | string | 报告生成的本地时间 | 2026/7/8 09:30:00 |

---

## 4. 一、巡检基本状态概览

包含两个子模块，所有分支结构一致。

### 4.1 巡检计划信息

```markdown
### 1. 巡检计划信息
| 配置项 | 配置内容 |
| --- | --- |
| 巡检计划名称 | {planName} |
| 任务 ID | {taskId} |
| 调度策略 | {schedulePolicy} |
| 数据采样范围 | {samplingRange} |
| 判定结论 | {verdictLabel} |
```

| 字段 | 类型 | 说明 |
|------|------|------|
| planName | string | 巡检计划名称 |
| taskId | string | 任务 ID |
| schedulePolicy | string | 调度策略，如"每小时自动巡检"/"单次手动触发"/"故障触发联动巡检" |
| samplingRange | string | 数据采样时间范围，如"近 30 分钟 (10:00 - 10:30)" |
| verdictLabel | string | 判定结论，如"正常 (Completed)"/"异常 (Abnormal)"/"失败 (Failed)" |

### 4.2 状态统计看板

```markdown
### 2. 状态统计看板
| 统计项 | 统计数量 |
| --- | --- |
| 巡检对象总数 | {totalNodes} 个 |
| 正常对象数 | {healthyNodes} 个 |
| 异常对象数 | {abnormalNodes} 个 |
| 失败对象数 | {failedNodes} 个 |
```

| 字段 | 类型 | 说明 |
|------|------|------|
| totalNodes | int | 巡检对象总数 |
| healthyNodes | int | 正常对象数 |
| abnormalNodes | int | 异常对象数 |
| failedNodes | int | 失败对象数 |

### 4.3 巡检任务脚本

列出本次巡检执行的任务脚本，所有分支结构一致。**仅当存在任务时输出**。

```markdown
### 3. 巡检任务脚本

**1. 连通性与环境检查**
- 执行范围：23个对象（HOST）
- 执行内容：采集 CPU、内存、磁盘（含 Inode）、系统负载、网络连接、进程数等7项指标，按阈值分级告警并输出 JSON 结构化报告。

**2. JVM 堆内存分析**
- 执行范围：3个对象（JVM）
- 执行内容：采集 JVM 堆内存使用率、GC 频率、老年代占用百分比、元空间使用情况，判断是否存在内存泄漏风险。
```

**任务字段定义：**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 任务序号，从 1 递增 |
| name | string | 任务名称 |
| scopeCount | int | 执行范围（对象数量） |
| resourceType | enum | 资源类型：`HOST` / `JVM` / `MYSQL` / `REDIS` 等 |
| scriptContent | string | 执行内容（脚本采集描述） |

> **格式规则：**
> - 执行范围输出为 `{scopeCount}个对象（{resourceType}）`
> - 每个任务为独立小节，任务名加粗，执行范围/执行内容用无序列表

---

## 5. 二、巡检对象分析

包含两个子模块。

### 5.1 全部巡检对象列表

**全量**列出所有巡检对象（不截断）：

```markdown
### 1. 全部巡检对象列表
| 序号 | 巡检对象 | 状态 | 严重级别 | 核心摘要 |
| --- | --- | --- | --- | --- |
| 1 | 172.30.34.73:8001 | 异常 | 严重 | CPU / 内存超限，出现错误率 |
| 2 | 172.30.34.81:8001 | 异常 | 严重 | 活动文件描述符 (FD) 过高 |
| 3 | 172.30.34.90:8001 | 失败 | 严重 | 连接超时 |
| ... | ... | ... | ... | ... |
```

| 列 | 类型 | 取值 |
|----|------|------|
| 序号 | int | 从 1 递增 |
| 巡检对象 | string | IP:端口 |
| 状态 | enum | `正常` / `异常` / `失败` |
| 严重级别 | enum | `普通` / `警告` / `严重` |
| 核心摘要 | string | 一句话摘要 |

### 5.2 巡检对象分析

由**文本摘要**开头，之后**仅当存在异常/失败对象时**列出逐对象详情。

```markdown
### 2. 巡检对象分析
{objectAnalysis 文本摘要}

#### 异常或失败对象详情

**172.30.34.73:8001** — 异常 (abnormal)
| 项目 | 内容 |
| --- | --- |
| IP地址 | 172.30.34.73:8001 |
| 类型 | 异常 (abnormal) |
| 严重级别 | 严重 (critical) |

影响说明：可能影响响应时延和吞吐量

异常指标：
| 指标名称 | 当前值 | 阈值 | 状态 |
| --- | --- | --- | --- |
| CPU 使用率 | 92% | 80% | 异常 |
| RSS 内存 | 1821MB | 1500MB | 异常 |

异常原因分析：CPU持续高位运行可能由批量任务未限流导致；RSS内存持续上涨疑似存在内存泄漏，建议检查长生命周期对象。

---
```

**逐对象详情的构成规则（重点）：**

| 区块 | 出现条件 | 内容 |
|------|---------|------|
| 基础信息表 | 总是 | IP地址、类型、严重级别 |
| ├ 失败原因行 | **仅 type=failed** | `\| 失败原因 \| {reason} \|` |
| 影响说明 | 存在 `impact` 时 | `影响说明：{impact}` |
| 异常指标表 | **仅 type=abnormal** | 指标名称/当前值/阈值/状态 |
| 异常原因分析 | **仅 type=abnormal 且存在 rootCause** | `异常原因分析：{rootCause}` |

> **关键差异：**
> - **异常对象 (abnormal)**：基础信息表**无**"失败原因"行；**有**异常指标表 + 异常原因分析。
> - **失败对象 (failed)**：基础信息表**有**"失败原因"行；**无**异常指标表和异常原因分析（失败对象无法采集指标）。

**异常指标表生成规则**：由 `reason` 字段解析。`reason` 形如 `CPU=92%，RSS=1821MB`，按 `，`/`,` 分隔为多项，每项为 `指标名=当前值`。阈值按内置映射填充：

| 指标名 | 显示名 | 阈值 |
|--------|--------|------|
| CPU | CPU 使用率 | 80% |
| RSS | RSS 内存 | 1500MB |
| FD | FD 数 | 900 |
| 内存 | 内存 | 80% |
| 其他 | 原样 | - |

状态列固定为"异常"。

---

## 6. 三、最终结论

固定两个子模块：**1. 当前判断**（列表）+ **2. 总体建议**（列表或表格，随分支不同）。

### 6.1 normal 分支

```markdown
## 三、最终结论 (Final Conclusion)
### 1. 当前判断
- 当前系统运行状态稳定
- 暂未发现资源压力或错误率异常
- 无需立即处理
### 2. 总体建议
- 建议保持当前巡检策略
- 建议继续按计划执行后续巡检
- 如业务高峰期临近，可持续关注核心服务指标
```

- 当前判断：`verdictJudgments: string[]`
- 总体建议：`verdictSuggestions: string[]`

### 6.2 abnormal 分支

```markdown
## 三、最终结论 (Final Conclusion)
### 1. 当前判断
- 本次巡检发现 2 个异常实例和 1 个失败实例，存在资源压力和连接泄漏风险。
- 172.30.34.73:8001：CPU 使用率达 92%...
### 2. 总体建议
| 异常实例 | 根因诊断结论 | 建议处置措施 |
| --- | --- | --- |
| 172.30.34.73:8001 | 系统资源双高压力... | 1. Dump 堆内存分析；<br>2. 重启或扩容... |
| 172.30.34.81:8001 | 文件描述符单调递增... | 1. 检查 TCP 连接释放逻辑；<br>2. ... |
```

- 当前判断：`judgments: string[]`
- 总体建议：`recommendations: [异常实例, 根因诊断结论, 建议处置措施][]`（处置措施内换行用 `<br>`）

### 6.3 failed 分支

```markdown
## 三、最终结论 (Final Conclusion)
### 1. 当前判断
- 本次巡检共覆盖 23 个对象，其中 3 个对象执行失败，失败占比 13%。
- 失败对象主要集中在连接超时、Agent 离线、权限不足三类原因。
### 2. 总体建议
| 失败原因 | 建议动作 |
| --- | --- |
| 连接超时 | 确认目标对象网络连通性、端口访问状态、防火墙策略 |
| Agent 离线 | 确认 Agent 是否在线、是否正常运行、心跳是否恢复 |
| 权限不足 | 确认巡检脚本执行权限、指标访问权限、账号授权配置 |

补充建议：
- 建议优先处理严重级别较高的失败对象。
- 建议恢复采集能力后，重新执行失败对象巡检。
```

- 当前判断：`judgments: string[]`
- 总体建议：`recommendationsTable: [失败原因, 建议动作][]`
- 补充建议：`supplementaryRecommendations: string[]`（可选）

### 6.4 各分支数据源对照表

| 分支 | 当前判断字段 | 总体建议字段 | 总体建议形态 |
|------|------------|------------|------------|
| normal | `verdictJudgments` | `verdictSuggestions` | 无序列表 |
| abnormal | `judgments` | `recommendations` | 三列表格 |
| failed | `judgments` | `recommendationsTable` + `supplementaryRecommendations` | 两列表格 + 补充列表 |

---

## 7. JSON 数据契约

后端按以下结构返回，前端/生成器据此渲染 Markdown / HTML。

### 7.1 顶层结构

```jsonc
{
  "name": "核心交易数据库实例高可用巡检",   // 报告名称
  "id": "INSP-20260705-002",              // 报告 ID
  "branch": "abnormal",                    // normal | abnormal | failed
  "updatedAt": "2026-07-08 09:30:00",      // 生成/执行时间
  "meta": {                                // 计划信息（对应 4.1）
    "planName": "核心交易数据库实例高可用巡检",
    "taskId": "INSP-20260705-002",
    "schedulePolicy": "单次手动触发",
    "samplingRange": "近 30 分钟 (10:00 - 10:30)",
    "verdictLabel": "异常 (Abnormal)"
  },
  "stats": {                               // 状态统计（对应 4.2）
    "totalNodes": 23,
    "healthyNodes": 20,
    "abnormalNodes": 2,
    "failedNodes": 1
  },
  "stage1": {                              // 阶段一附加数据
    "inspectionTasks": [                   // 巡检任务脚本（对应 4.3）
      {
        "id": 1,
        "name": "连通性与环境检查",
        "scopeCount": 23,
        "resourceType": "HOST",
        "scriptContent": "采集 CPU、内存、磁盘（含 Inode）、系统负载、网络连接、进程数等7项指标……"
      }
    ]
  },
  "objectsTable": [                        // 全部对象（对应 5.1，全量）
    ["1", "172.30.34.73:8001", "abnormal", "critical", "CPU / 内存超限，出现错误率"],
    ["2", "172.30.34.81:8001", "abnormal", "critical", "活动文件描述符 (FD) 过高"],
    ["3", "172.30.34.90:8001", "failed", "critical", "连接超时"]
    // ... 其余对象
  ],
  "objectAnalysis": "本次巡检共覆盖 23 个对象，发现 2 个异常对象、1 个失败对象……",
  "priorityObjects": [                     // 异常/失败重点对象（对应 5.2）
    {
      "ip": "172.30.34.73:8001",
      "type": "abnormal",                  // abnormal | failed
      "severity": "critical",              // critical | warning
      "reason": "CPU=92%，RSS=1821MB",     // abnormal: 解析为异常指标; failed: 显示为失败原因
      "rootCause": "CPU持续高位运行……",    // 仅 abnormal
      "impact": "可能影响响应时延和吞吐量"   // 可选
    },
    {
      "ip": "172.30.34.90:8001",
      "type": "failed",
      "severity": "critical",
      "reason": "连接超时",
      "impact": "所有检查项未完成"
    }
  ],
  "stage4": { /* 见 7.2，按分支不同 */ }
}
```

> **objectsTable 行格式**：`[序号, IP:端口, 状态码, 严重码, 核心摘要]`
> - 状态码：`completed`(正常) / `abnormal`(异常) / `failed`(失败)
> - 严重码：`info`(普通) / `warning`(警告) / `critical`(严重)

### 7.2 stage4（最终结论，按分支）

**normal：**

```jsonc
"stage4": {
  "verdictJudgments": ["当前系统运行状态稳定", "暂未发现资源压力或错误率异常", "无需立即处理"],
  "verdictSuggestions": ["建议保持当前巡检策略", "建议继续按计划执行后续巡检"]
}
```

**abnormal：**

```jsonc
"stage4": {
  "judgments": ["本次巡检发现 2 个异常实例和 1 个失败实例……", "172.30.34.73:8001：CPU 使用率达 92%……"],
  "recommendations": [
    ["172.30.34.73:8001", "系统资源双高压力，疑似内存泄漏与突增负载叠加。", "1. Dump 堆内存分析；\n2. 重启或扩容释放压力。"],
    ["172.30.34.81:8001", "文件描述符单调递增，连接句柄泄漏。", "1. 检查 TCP 连接释放逻辑；\n2. 定位未关闭句柄。"]
  ]
}
```
> `recommendations` 行格式：`[异常实例, 根因诊断结论, 建议处置措施]`；处置措施内的 `\n` 渲染为 `<br>`。

**failed：**

```jsonc
"stage4": {
  "judgments": ["本次巡检共覆盖 23 个对象，其中 3 个执行失败……", "失败对象主要集中在连接超时、Agent 离线、权限不足三类原因。"],
  "recommendationsTable": [
    ["连接超时", "确认目标对象网络连通性、端口访问状态、防火墙策略"],
    ["Agent 离线", "确认 Agent 是否在线、是否正常运行、心跳是否恢复"]
  ],
  "supplementaryRecommendations": ["建议优先处理严重级别较高的失败对象。", "建议恢复采集能力后，重新执行失败对象巡检。"]
}
```
> `recommendationsTable` 行格式：`[失败原因, 建议动作]`。

### 7.3 字段出现性总览

| 字段 | normal | abnormal | failed | 说明 |
|------|:------:|:--------:|:------:|------|
| meta / stats / objectsTable / objectAnalysis | ✅ | ✅ | ✅ | 通用 |
| stage1.inspectionTasks | ✅ | ✅ | ✅ | 巡检任务脚本 |
| priorityObjects | 空数组 | ✅ | ✅ | normal 无重点对象 |
| stage4.verdictJudgments / verdictSuggestions | ✅ | — | — | normal 专属 |
| stage4.judgments | — | ✅ | ✅ | 当前判断 |
| stage4.recommendations | — | ✅ | — | abnormal 处置表 |
| stage4.recommendationsTable | — | — | ✅ | failed 建议表 |
| stage4.supplementaryRecommendations | — | — | 可选 | failed 补充建议 |
| priorityObject.rootCause | — | ✅ | — | 仅异常对象 |

---

## 8. 生成器渲染要点（给后端的实现提示）

1. **三章节标题固定**，不随分支变化；分支差异只在 stage4 与 priorityObjects 详情。
2. **对象列表全量输出**，不做前 N 条截断（截断是前端界面行为，导出需完整）。
3. **priorityObjects 逐对象渲染**时严格按 `type` 分流：
   - `abnormal` → 基础信息(无失败原因行) + 影响说明 + 异常指标表(解析 reason) + 异常原因分析(rootCause)
   - `failed` → 基础信息(含失败原因行) + 影响说明
4. **表格单元格换行**统一用 `<br>`；列表项用 `- ` 前缀。
5. **空数据处理**：某数组为空时，对应子模块整体省略（不输出空标题）。
6. **巡检任务脚本**（一章节 4.3）：`stage1.inspectionTasks` 为空时省略整个"3. 巡检任务脚本"模块；所有分支结构一致。
