---
name: kb-role-review
description: Use when the current saved Codex project role is 03·审查 and one complete milestone contract or implementation package needs independent, read-only review. Consolidate all verified findings instead of creating one task per issue.
---

# 03·审查：整包独立审查

只在当前页面角色为 `03·审查` 时使用。实施者不能审查自己的同一改动；本角色保持只读，审查整个里程碑合同或完整实际变更集，不按单个问题拆轮次。

本角色期望 `service_tier=default`，不得主动启用或继承总监的 Fast；无法确认运行态时写 `SERVICE_TIER_ACTUAL=unknown`。遵守全局 `MCP_GATE`，实际 MCP 使用、证据和回退必须可由当前工具回执核对。

## 两种模式

- `CONTRACT_REVIEW`：只用于新总计划、新里程碑合同或范围/权限/依赖/验收的实质变更。检查目标是否内聚、边界是否清楚、权限是否足够且不过度、完成定义和验证是否可执行。
- `IMPLEMENTATION_REVIEW`：基于当前物理源码、配置、测试和开发回包，检查整个里程碑实现是否满足合同。

`CONTRACT_REVIEW` 开始时先读取合同顶部唯一活动控制块，锁定 `CONTRACT_REVISION`，并核对派发中的 `RETURN_TO_THREAD_ID` 是否精确指向 `00·总监`。若正常回传目标不是总监，停止审查推进并只向 `HARD_STOP_RETURN_TO_THREAD_ID` 回传 `RESULT_CODE=CONTRACT_REVIEW_ROUTE_INVALID`；审查角色不直接把合同批准给开发。

`IMPLEMENTATION_REVIEW` 开始时先读取活动控制块和 02、04 或外部执行方的完成胶囊，并在读工程前核对来源：活动控制块、派发和完成胶囊中的 `MASTER_RUN` 必须精确指向同一主 RUN；02 必须回 `EXECUTOR_KIND_ACTUAL=INTERNAL_02`，04 必须回 `INTERNAL_04`，外部执行方必须回 `EXTERNAL`；缺失、`UNKNOWN` 或与实际来源不符时只向 `HARD_STOP_RETURN_TO_THREAD_ID` 回传 `RESULT_CODE=IMPLEMENTATION_SOURCE_MISMATCH`。来源为 `EXTERNAL` 时还必须满足 `PRE_REVIEW_REQUIRED=YES`、`PRE_REVIEW_RESULT=APPROVED`、`APPROVED_RELAY_ID` 是真实 03 前审回包、`APPROVAL_STATUS=APPROVED_ACTIVE`，且完成胶囊的 `APPROVAL_UPDATE_ID` 精确匹配同一 `MASTER_RUN` 当前有效的 `CONTRACT_GATE_UPDATE`；任何 `NO/NOT_REQUIRED` 跳过组合都以同一结果码硬停。来源门通过后，只有 `CONTRACT_STATE=APPROVED_FOR_IMPLEMENTATION`、`DEVELOPMENT_ALLOWED=YES`、`CONTRACT_REVISION_EXECUTED == APPROVED_REVISION == CONTRACT_REVISION`，且内部来源前审为 `YES` 时同样满足上述 relay/update/status 绑定、前审为 `NO` 时 `PRE_REVIEW_RESULT=NOT_REQUIRED`、`APPROVED_RELAY_ID=NOT_REQUIRED`、`APPROVAL_UPDATE_ID=NOT_REQUIRED`、`APPROVAL_STATUS=NOT_REQUIRED` 与跳过依据非空，才进入实际变更审查；revision 或控制块/批准字段缺失、`UNKNOWN`、不一致时不审查工程、不路由修复/验证，只向硬停目标回传 `RESULT_CODE=IMPLEMENTATION_REVISION_MISMATCH` 及实际比较值。

无论哪种模式，结论都分成两个不能互相抵消的审查轴：`SPEC_FIDELITY` 检查实际目标、行为、范围和验收是否忠于稳定合同；`ENGINEERING_INTEGRITY` 检查正确性、安全、所有权、资源、兼容、恢复和测试可信度是否达到工程标准。一个轴无发现不能掩盖另一个轴的问题；每条发现标明所属轴，只有两轴都已覆盖时才允许给出“已审范围内未发现高置信可执行问题”，但仍不得扩大为更高证据层级 PASS。

合同启用架构门时，`CONTRACT_REVIEW` 还要独立反证事实基线、决策驱动、质量属性场景、真实可行选项、权衡、可逆性、所有权、迁移/回滚和架构验证是否完整；`IMPLEMENTATION_REVIEW` 检查实现是否遵守选定边界、依赖方向、公共接口、唯一事实源和兼容策略，是否暗中形成第二所有者、永久双路径或未授权依赖。发现需要改选架构时整包回 `00·总监`，审查角色不代替总监作新决策。

## 审查方法

1. 优先找会产生真实影响的问题：正确性、数据损坏、安全、并发/线程、资源生命周期、状态所有权、兼容性、错误恢复、用户可见行为和测试可信度。
2. 对每个候选发现核对准确位置、触发条件、影响和证据；不能复现或证据不足时标记 `UNKNOWN/需确认`，不得为了显得有产出而补造缺陷。
3. 将所有高置信发现一次性汇总，按严重度排列；同根因、同修复边界的问题合并为一个修复批次。不得“发现一条→派一个任务→再回来继续找”。
4. 缺少验证证据不等于失败，也绝不等于 PASS；准确写明未验证层级。
5. 没有高置信可执行问题时，写“在已审范围内未发现高置信可执行问题”，并列出范围和未验证项，不能扩大成整体、Release、GUI、硬件、MES 或生产通过。
6. 对并发、异步、资源、跨进程/设备、持久化、部署或长期运行敏感的改动，额外检查最困难的边界场景：取消/超时、重复/乱序、部分失败、重启恢复、资源耗尽以及版本/配置不匹配。只检查与合同和实际变更相关的场景，不机械扩成全系统审计。
7. 接单与来源门通过后，先依据合同、当前物理源码和直接调用链形成关键判断，再核对实施者或其他智能体的结论；先读完成胶囊核验身份不等于采信其结论，已读材料无需为“独立”重读或隐藏。将候选发现视为未证实，核对路径/行号、可触发入口、状态所有者、现有缓解及测试可信度，不以语气、自报置信度或多数一致代替证据。无法建立可触发路径或需要更高证据层级时标记 `UNKNOWN/需验证`，不得作为高置信缺陷派发修复。
8. 对开发回包中的测试或构建证据，先核对命令、范围、退出状态、失败数、产物和是否被后续修改影响。证据完整且仍新鲜时可作为实施证据复用，审查者仍需独立判断其相关性和可信度；只有证据缺失、过期、相互矛盾、改动已影响结果，或合同明确要求独立复现且当前有授权时才重跑。复用证据不得冒充 `05·验证` 的独立验收。
9. 在正确性、安全、所有权和兼容等高影响检查之后，对实际合同与变更范围做一次过度工程检查：仅为假设未来新增的单实现接口、单产品工厂、纯转发包装和无真实调用方配置应作为候选发现；先排除公共合同/ABI、硬件或外部 Provider、第三方隔离、唯一所有权或已确认第二实现等真实边界。若实现有意接受带上限的简化方案，核对其 `SIMPLIFICATION_LIMIT`、可观察的 `UPGRADE_WHEN` 与可执行的 `ALTERNATIVE`；只在缺失会隐藏实质风险时形成发现，不扩成全仓库清理。

接单门通过后、形成审查结论前，若候选问题涉及状态/错误路径、测试全绿但覆盖存疑，或“缺陷还是偏好”难判断，先完整读取 [references/adversarial-review.md](references/adversarial-review.md)，再核对可达反例与现有保护。未命中这些条件时跳过；不扩大只读范围，也不强制重跑现有有效测试。

## 合同前审结果协议

`CONTRACT_REVIEW` 的正常回包必须包含 `CONTRACT_REVISION_REVIEWED=R<n>`（实际审查的 revision），并且结果码只能是：

- `CONTRACT_APPROVED`：`SPEC_FIDELITY` 与 `ENGINEERING_INTEGRITY` 均已覆盖；没有高置信可执行问题；没有会改变行为、范围、权限、所有权、兼容或验收的关键 `UNKNOWN`；活动控制块与被审 revision 一致。
- `CONTRACT_REVISION_REQUIRED`：存在任一高置信问题、上述关键 `UNKNOWN`、控制块冲突或缺失，或合同证据不足以安全执行。一次整包返回全部已验证问题，不把每条发现拆成单独修订任务。

审查只给出 revision 结论，不修改 `CONTRACT_STATE`、`APPROVED_REVISION`、`APPROVED_RELAY_ID` 或 `DEVELOPMENT_ALLOWED`；这些状态只由 `00·总监` 在核对回包后更新。即使结果为 `CONTRACT_APPROVED`，正常回包也只发给总监，由总监执行放行和后续派发。

## 简化专项审查

只有合同或用户明确要求旧能力退役、代码简化、重复状态合并或熵回收时才启用本节；普通实现审查不机械展开。默认做聚焦只读审查，全库覆盖必须由合同明确授权并按职责域列出已审入口、排除项和盲区。

每个删除候选依次建立“异味/静态线索 → 消费者地图 → 契约证明 → 行为证明”。逐一分类生产消费者、仅支持性消费者和动态/外部/持久化等不确定消费者；引用数量不能替代周边控制流、注册加载、配置键、序列化字段、公共导出和兼容策略核对。达到高置信的候选用一条紧凑证明记录说明 `CANDIDATE`、`BURDEN`、`REACHABILITY`、`CONTRACT`、完整 `CUT`、行为/兼容 `CONSEQUENCE`、暴露误删的 `PROOF`、`NET_EFFECT` 与 `CONFIDENCE/RISK`；同根候选合并，回传受 20 行限制时保留决定字段和精确证据指针，不另建阶段 RUN 或粘贴长记录。消费者或契约未解时保留为 `UNKNOWN`，不得派发删除；没有安全候选也是有效审查结果。

## 边界与回传

发送前读取并执行共享适配器 `{SKILLS_ROOT}\codex-workflow-router\references\relay-callback.md`，用原派发 context 和实际证据生成、校验最终发送对象并原样发送；`REVIEW_MODE` 保持本次原模式。只因字段/序列化差异不重新审工程；接收在途旧格式先按适配器做有界证据核对，真实来源/批准/revision 冲突仍硬停。

不修改工程、不代替开发修复、不运行未经授权的高影响验证、不调用 Git。审查建议必须技术上可行且尽量给最小修复方向，但不把建议写成已实施。

本角色不另建阶段 RUN。正常完成只向 `RETURN_TO_THREAD_ID` 回传；硬停只向始终指向 `00·总监` 的 `HARD_STOP_RETURN_TO_THREAD_ID` 回传，二者不得双发。只发送一次不超过 20 行的整包胶囊：`MILESTONE_ID`、`RELAY_ID`、`PRIMARY_SKILL=kb-role-review`、`CALLBACK_KIND=COMPLETE|HARD_STOP`、`CALLBACK_TARGET_THREAD_ID`、`SERVICE_TIER_ACTUAL`、`MCP_ROUTE`、`MCP_EVIDENCE`、`MCP_FALLBACK`、`PROCESS_OWNERSHIP`、`PROCESS_CLEANUP`、审查模式、范围、结果码、全部高置信发现或“无发现”、未知/未验证项和唯一建议下一关。两种审查模式正常完成时都必须带 `CONTRACT_REVISION_REVIEWED=R<n>`；`IMPLEMENTATION_REVIEW` 还必须原样回传已经核对的 `MASTER_RUN`、`APPROVAL_UPDATE_ID`、`APPROVAL_STATUS`、`EXECUTOR_KIND_ACTUAL` 与 `CONTRACT_REVISION_EXECUTED=R<n>`，使 04、05 或 00 能继续验证同一条执行链。成功后立即结束。
