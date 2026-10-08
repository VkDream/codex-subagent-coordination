# 个性化子智能体配置

这里的 19 份 TOML 是按一套个人工作流整理的参考角色。模型和推理强度是配置偏好，不保证当前客户端或账号可用；应先检查工具支持和现行配置，不要整份覆盖自己的设置。

00·总监由主任务承担。kb-01 至 kb-05 是可选的专业角色，允许在父任务授权、运行时支持时派发白名单专项助手；专项助手不得继续创建子智能体。其他配置作为叶节点。原生 kb 角色也加载对应唯一主 Skill；页面分支仅在用户明确启用时执行。全树执行上限8个，不含主任务，主任务统一分配名额；当前合同或运行时更低时服从较低限制。

| 文件 | 职责 | 模型 | 推理 | 子智能体 |
|---|---|---|---|---|
| [default.toml](default.toml) | 处理主任务派发的清晰、独立、边界明确的通用子任务；默认使用 Luna 非 Fast。 | gpt-6-luna | max | 关闭 |
| [doc-writer.toml](doc-writer.toml) | 文档交付：依据已有事实制作 Word/PPT/Excel/PDF，缺失数据标 UNKNOWN。 | gpt-6-luna | max | 关闭 |
| [explorer.toml](explorer.toml) | 通用只读探索与复核：GPT-6 Luna Max 非 Fast，按父任务限定范围返回可核验证据。 | gpt-6-luna | max | 关闭 |
| [fe-designer.toml](fe-designer.toml) | 前端设计与实现：页面、组件、交互、响应式与可访问性。 | gpt-6.1-sol | ultra | 关闭 |
| [image-analyst.toml](image-analyst.toml) | 图像只读取证：截图、设备照片、条码及表格的可见事实与排查线索。 | gpt-6-luna | max | 关闭 |
| [kb-01-diagnosis.toml](kb-01-diagnosis.toml) | 01诊断：只读定位根因，优先最小、最快的充分修复方案；结论简短、依据准确。 | gpt-6.1-sol | ultra | 允许白名单助手 |
| [kb-02-development.toml](kb-02-development.toml) | 02开发：以最小、最快的充分方案完成合同和聚焦自检；代码与回包少而精。 | gpt-6.1-sol | ultra | 允许白名单助手 |
| [kb-03-review.toml](kb-03-review.toml) | 03审查：独立只读审查诊断、合同或实现，输出可执行发现与最小修复方向。 | gpt-6-astra | ultra | 允许白名单助手 |
| [kb-04-remediation.toml](kb-04-remediation.toml) | 04修复：按已确认发现用最小、最快的充分方案修复并聚焦复验；不扩展无关工作。 | gpt-6.1-sol | ultra | 允许白名单助手 |
| [kb-05-validation.toml](kb-05-validation.toml) | 05验证：独立运行合同授权的构建/测试/边界验证，不修改源码。 | gpt-6-luna | max | 允许白名单助手 |
| [log-forensics.toml](log-forensics.toml) | 日志取证：时间线、异常签名聚类、已证事实与候选因果链。 | gpt-6.1-sol | ultra | 关闭 |
| [luna-worker.toml](luna-worker.toml) | 处理清晰、重复性、适合并行的 Codex 子任务，并返回精炼且可核验的结果。 | gpt-6-luna | max | 关闭 |
| [mini-coder.toml](mini-coder.toml) | 轻量编码：边界清晰的小范围脚本、代码修正和聚焦验证。 | gpt-6-luna | max | 关闭 |
| [night-guard.toml](night-guard.toml) | 有界只读值守：按明确观察窗口检查状态，仅回报完成、失败或需处理变化。 | gpt-6-luna | max | 关闭 |
| [run-trace-auditor.toml](run-trace-auditor.toml) | 证据链审计：核对合同、RUN、变更与验证记录之间的闭合、缺口和冲突。 | gpt-6.1-sol | ultra | 关闭 |
| [spc-data-analyst.toml](spc-data-analyst.toml) | SPC/质量数据分析：数据质量、分布、趋势、Pareto与控制图，保留可复核口径。 | gpt-6-luna | max | 关闭 |
| [worker.toml](worker.toml) | 执行边界明确、可并行且写入范围互不重叠的实现或验证子任务；默认使用 Luna 非 Fast。 | gpt-6-luna | max | 关闭 |
| [wpf-designer.toml](wpf-designer.toml) | WPF界面设计与实现：布局、样式、绑定及职责内交互，遵循现有工程栈。 | gpt-6.1-sol | ultra | 关闭 |
| [x-topic-scout.toml](x-topic-scout.toml) | X选题侦察：核验高价值技术候选，提供口语化草稿和来源，不发布。 | gpt-6-luna | max | 关闭 |

只读角色在 TOML 中带有 sandbox_mode = "read-only"。其余角色仍只能在父任务授权范围内操作。配置文件的存在不证明角色已加载；也不要把模型与服务层字段当作运行态证据。
所有角色参考 service_tier=default。未暴露服务层且没有相反证据时可继续并记录 SERVICE_TIER_ACTUAL=UNKNOWN；features.fast_mode 只是选择能力，不能证明实际 Fast 或非 Fast。明确冲突、角色不可用或拒绝时报告 SUBAGENT_TIER_BLOCKED，不静默换模型或回退 Fast。luna-worker.toml 的运行角色名为 luna_worker。
