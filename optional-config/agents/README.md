# 个性化子智能体配置

这里的 19 份 TOML 是按一套个人工作流整理的参考角色。模型和推理强度是配置偏好，不保证当前客户端或账号可用；应先检查工具支持和现行配置，不要整份覆盖自己的设置。

00·总监由主任务承担。kb-01 至 kb-05 是可选的专业角色，允许在父任务授权、运行时支持时派发白名单专项助手；专项助手不得继续创建子智能体。其他配置作为叶节点。

| 文件 | 职责 | 模型 | 推理 | 子智能体 |
|---|---|---|---|---|
| [default.toml](default.toml) | 处理主任务派发的清晰、独立、边界明确的通用子任务。 | gpt-6-luna | max | 关闭 |
| [doc-writer.toml](doc-writer.toml) | 文档交付：依据已有事实制作文档、汇报、方案或表格，缺失数据标 UNKNOWN。 | gpt-6-luna | max | 关闭 |
| [explorer.toml](explorer.toml) | 通用只读探索与复核：按父任务限定范围返回可核验证据。 | gpt-6-luna | max | 关闭 |
| [fe-designer.toml](fe-designer.toml) | 前端设计与实现：页面、组件、交互、响应式与可访问性。 | gpt-6-sol | max | 关闭 |
| [image-analyst.toml](image-analyst.toml) | 图像只读取证：截图、设备照片、条码及表格的可见事实与排查线索。 | gpt-6-luna | max | 关闭 |
| [kb-01-diagnosis.toml](kb-01-diagnosis.toml) | 01诊断：只读定位根因，优先最小、充分的修复方向；结论简短、依据准确。 | gpt-6-sol | max | 允许白名单助手 |
| [kb-02-development.toml](kb-02-development.toml) | 02开发：按明确合同完成最小充分实现和聚焦自检。 | gpt-6-sol | max | 允许白名单助手 |
| [kb-03-review.toml](kb-03-review.toml) | 03审查：独立只读审查诊断、合同或实现，输出可执行发现。 | gpt-6-sol | ultra | 允许白名单助手 |
| [kb-04-remediation.toml](kb-04-remediation.toml) | 04修复：按已确认发现做最小修复并聚焦复验，不扩展无关范围。 | gpt-6-sol | max | 允许白名单助手 |
| [kb-05-validation.toml](kb-05-validation.toml) | 05验证：独立运行合同授权的构建、测试或边界验证，不修改源码。 | gpt-6-luna | max | 允许白名单助手 |
| [log-forensics.toml](log-forensics.toml) | 日志取证：整理时间线、异常签名和候选因果链。 | gpt-6-sol | max | 关闭 |
| [luna-worker.toml](luna-worker.toml) | 处理清晰、重复性、适合并行的子任务，并返回精炼且可核验的结果。 | gpt-6-luna | max | 关闭 |
| [mini-coder.toml](mini-coder.toml) | 轻量编码：边界清晰的小范围脚本或代码修改和聚焦验证。 | gpt-6-luna | max | 关闭 |
| [night-guard.toml](night-guard.toml) | 有界只读值守：按明确观察窗口检查状态，仅回报完成、失败或需处理变化。 | gpt-6-luna | max | 关闭 |
| [run-trace-auditor.toml](run-trace-auditor.toml) | 证据链审计：核对合同、运行记录、变更与验证之间的闭合、缺口和冲突。 | gpt-6-sol | max | 关闭 |
| [spc-data-analyst.toml](spc-data-analyst.toml) | SPC与质量数据分析：检查数据质量、分布、趋势、Pareto和控制图，保留可复核口径。 | gpt-6-luna | max | 关闭 |
| [worker.toml](worker.toml) | 执行边界明确、可并行且写入范围互不重叠的实现或验证子任务。 | gpt-6-luna | max | 关闭 |
| [wpf-designer.toml](wpf-designer.toml) | WPF界面设计与实现：布局、样式、绑定及职责内交互，遵循现有工程栈。 | gpt-6-sol | max | 关闭 |
| [x-topic-scout.toml](x-topic-scout.toml) | 选题侦察：核验高价值技术候选，提供口语化草稿和来源，不发布。 | gpt-6-luna | max | 关闭 |

只读角色在 TOML 中带有 sandbox_mode = "read-only"。其余角色仍只能在父任务授权范围内操作。配置文件的存在不证明角色已加载；也不要把模型与服务层字段当作运行态证据。