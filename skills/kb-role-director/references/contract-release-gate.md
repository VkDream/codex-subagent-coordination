# 可执行合同版本与放行门

仅在 `00·总监` 生成、修订、批准、派发或收口会直接驱动 `02·开发`、`04·修复`、Kimi、DSH、DeepSeek、Qwen 等执行方修改工程、生成可运行候选、构建或运行的合同、开发计划、修复包、开发 MD 或执行提示词时读取。本规则不新增里程碑、角色页或 RUN。

## 原生身份与页面身份

本协议的授权、活动控制块、执行来源、revision、独立审查与累计预算对两种模式均有效。默认原生父子模式使用 DISPATCH_ID、RETURN_TARGET 和 APPROVED_DISPATCH_ID；本文件后续页面术语 RELAY_ID、RETURN_TO_THREAD_ID、APPROVED_RELAY_ID 在原生模式分别按这三个原生字段核对，不要求另造页面字段或页面 UUID。原生 APPROVED_DISPATCH_ID 必须指向实际有效的 03 回包；可跳过前审时仍为 NOT_REQUIRED，不能猜填批准。

原生 03 及其他角色始终 final 返回直接父任务，所有下一角色建议由父任务调度，不按后文页面式直接接力发送。父任务只消费工具实际来源、项目、DISPATCH_ID、角色、合同 revision 与当前授权均相符的回包。页面协议仅在用户明确启用页面接力时使用原页面字段。

长上下文换新实例只改变 DISPATCH_ID 并增加 CONTINUES_DISPATCH_ID，不改变合同 revision、有效批准、主 RUN、权限或累计修正预算；合同实质变化才按本协议更新 revision。迟到的旧派单结果不推进新派单。

## 唯一活动控制块

可执行合同顶部必须保留以下唯一活动控制块；它是当前能否进入开发的唯一真值：

```text
CONTRACT_REVISION=R<n>
CONTRACT_STATE=DRAFT|PRE_REVIEW_REQUIRED|REVISION_REQUIRED|APPROVED_FOR_IMPLEMENTATION
PRE_REVIEW_REQUIRED=YES|NO
PRE_REVIEW_BASIS=<触发或跳过依据>
PRE_REVIEW_RESULT=PENDING|APPROVED|REVISION_REQUIRED|NOT_REQUIRED
APPROVED_REVISION=<R<n>|NONE>
APPROVED_RELAY_ID=<03回传RELAY_ID|NOT_REQUIRED|NONE>
APPROVAL_UPDATE_ID=<当前有效CONTRACT_GATE_UPDATE的唯一ID|NOT_REQUIRED|NONE>
APPROVAL_STATUS=NONE|APPROVED_ACTIVE|NOT_REQUIRED|STALE
DEVELOPMENT_ALLOWED=YES|NO
```

字段缺失、值冲突、`APPROVED_REVISION != CONTRACT_REVISION`、不满足下述“执行方接单门”中与实际执行方及 `PRE_REVIEW_REQUIRED` 对应的放行条件，或任何状态无法唯一解释时，默认 `DEVELOPMENT_ALLOWED=NO`。历史审查与修订记录只能放在后文，不得让文件开头保留已失效的 READY/APPROVED。

## 直接接力与诊断评审

当前有效批准属于精确合同 revision、范围和执行角色，不属于某次转发。已批准范围内角色按预置分支直接接力，不重复创建批准/前审或要求 00 转发；接收方仍核对下面的接单门。DIAGNOSIS_REVIEW 只检查根因与方案，不生成 CONTRACT_APPROVED，不写实现已审 revision，也不改变活动控制块。诊断/补诊沿用现有边界且实施已获准时，03 可直接交预定内部执行角色；尚未批准、需实质改变合同或命中强制前审时回 00 处理真实放行事项。

修复页接收诊断评审时核对诊断针对的当前合同及已有批准；返修链补诊还保留之前实际执行/审查字段。不得要求未执行的诊断凭空填 CONTRACT_REVISION_EXECUTED/REVIEWED；也不得拿诊断评审替代首次合同前审、修改后的独立审查或外部执行强制批准。

## 作者自检与强制前审

新 revision 先进入 `DRAFT` 且禁止开发。总监只核对当前目标、范围、授权和验收是否相互一致，补齐放行字段，不重复执行角色的工程审查。以下情况仍独立前审：

- 外部执行方将修改工程、生成可运行候选、构建或运行；
- `PROCESS_DEPTH=ARCHITECTURAL`；
- 实质改变进程、共享状态或并发、资源所有权、权限安全、公共兼容、持久化、部署/迁移边界，且错误方案会造成具体安全、数据或外部副作用风险。沿既定边界完成局部修复，不因代码包含异步、状态或接口就自动追加前审。

命中任一项时设置：

```text
CONTRACT_STATE=PRE_REVIEW_REQUIRED
PRE_REVIEW_REQUIRED=YES
PRE_REVIEW_RESULT=PENDING
APPROVED_REVISION=NONE
APPROVED_RELAY_ID=NONE
APPROVAL_UPDATE_ID=NONE
APPROVAL_STATUS=NONE
DEVELOPMENT_ALLOWED=NO
```

随后把精确 revision 交给 `03·审查` 的 `CONTRACT_REVIEW`。该前审的 `RETURN_TO_THREAD_ID` 必须是 `00·总监`；总监拥有活动状态，审查角色只读且不能直接把合同派给开发。

## 审查回包与状态转换

有效前审回包必须同时包含 `CONTRACT_REVISION_REVIEWED=R<n>` 以及下列唯一结果之一：

- `RESULT_CODE=CONTRACT_APPROVED`：两条审查轴均覆盖，无高置信可执行问题，也无会改变行为、范围、权限、所有权、兼容或验收的关键 `UNKNOWN`。
- `RESULT_CODE=CONTRACT_REVISION_REQUIRED`：存在高置信问题、关键 `UNKNOWN`、控制块冲突或缺少可执行证据。

总监先核对项目、`MILESTONE_ID`、`RELAY_ID`、角色、回传目标和 `CONTRACT_REVISION_REVIEWED`。只有全部匹配时才消费回包：

- 批准：使用一次带唯一 `APPROVAL_UPDATE_ID` 的 `CONTRACT_GATE_UPDATE`，将同一 revision 更新为 `APPROVED_FOR_IMPLEMENTATION`、`PRE_REVIEW_RESULT=APPROVED`、`APPROVED_REVISION=<当前 revision>`、`APPROVED_RELAY_ID=<实际 03 RELAY_ID>`、`APPROVAL_UPDATE_ID=<本次更新ID>`、`APPROVAL_STATUS=APPROVED_ACTIVE`、`DEVELOPMENT_ALLOWED=YES`，再派执行方。该 ID 在同一 `MASTER_RUN` 内唯一且稳定，派发胶囊复制同一值，不能由执行方补造。
- 要求修订：先将当前 revision 标记为 `REVISION_REQUIRED`、`PRE_REVIEW_RESULT=REVISION_REQUIRED`、`APPROVAL_STATUS=STALE`、批准 revision/relay/update 字段清空并禁止开发；整包修订时递增 revision，旧批准与旧更新 ID 保留为历史但自动失效，新 revision 以 `APPROVAL_STATUS=NONE` 回到 `PRE_REVIEW_REQUIRED/PENDING` 并重新前审。

只有不改变行为、范围、权限、所有权、兼容、验收或风险判断的文字纠正可不递增 revision；总监必须留下简短依据，不能用“只是小改”绕过复审。

## 有依据地跳过前审

仅内部 `02·开发` 的低风险 `BOUNDED` 常规改动可跳过独立前审。总监仍须写明具体风险依据，并将同一 revision 设置为：

```text
CONTRACT_STATE=APPROVED_FOR_IMPLEMENTATION
PRE_REVIEW_REQUIRED=NO
PRE_REVIEW_RESULT=NOT_REQUIRED
APPROVED_REVISION=<当前 revision>
APPROVED_RELAY_ID=NOT_REQUIRED
APPROVAL_UPDATE_ID=NOT_REQUIRED
APPROVAL_STATUS=NOT_REQUIRED
DEVELOPMENT_ALLOWED=YES
```

“任务很小”“赶时间”或用户未主动要求审查都不是跳过依据。

该 `PRE_REVIEW_REQUIRED=NO` 组合只属于内部执行路线；同一已批准内部合同后续进入 03、04 或 05 时可以继续核对它，但不得复制给 Kimi、DSH、DeepSeek、Qwen 或其他外部执行方。把执行方从内部改为外部会改变授权与风险判断，属于实质变更：必须递增 revision、清空旧批准，并按强制前审路线重新取得 03 批准。

## 执行方接单门

内部开发、修复和外部工程执行方在任何工程编辑、构建或运行前必须先确认与实际接收方一致的 `EXECUTOR_KIND=INTERNAL_02|INTERNAL_04|EXTERNAL`，再核对活动控制块：

- `CONTRACT_STATE=APPROVED_FOR_IMPLEMENTATION`；
- `DEVELOPMENT_ALLOWED=YES`；
- `APPROVED_REVISION == CONTRACT_REVISION`；
- `EXECUTOR_KIND=EXTERNAL` 时，只接受 `PRE_REVIEW_REQUIRED=YES`、`PRE_REVIEW_RESULT=APPROVED`、`APPROVED_RELAY_ID` 是真实 03 回包、`APPROVAL_STATUS=APPROVED_ACTIVE`，且 `APPROVAL_UPDATE_ID` 精确匹配同一 `MASTER_RUN` 当前有效的 `CONTRACT_GATE_UPDATE`；外部执行方不得接受 `NO/NOT_REQUIRED` 跳过组合；
- `EXECUTOR_KIND=INTERNAL_02|INTERNAL_04` 时，前审为 `YES` 须 `PRE_REVIEW_RESULT=APPROVED`、`APPROVED_RELAY_ID` 是真实 03 回包、`APPROVAL_STATUS=APPROVED_ACTIVE` 且 `APPROVAL_UPDATE_ID` 匹配当前有效更新，前审为 `NO` 须 `PRE_REVIEW_RESULT=NOT_REQUIRED`、`APPROVED_RELAY_ID=NOT_REQUIRED`、`APPROVAL_UPDATE_ID=NOT_REQUIRED`、`APPROVAL_STATUS=NOT_REQUIRED` 且跳过依据非空。

执行方分类缺失、`UNKNOWN`、与实际接收方不符，或任一放行项不满足时，执行方立即以 `RESULT_CODE=CONTRACT_INTAKE_REJECTED` 硬停回 `00·总监`；除读取规则、入口和控制块所需的安全发现外，不读取无关工程、不创建或修改文件、不构建、不运行。正常实现回包必须带 `CONTRACT_REVISION_EXECUTED=R<n>`。

单独开发 MD 或外部提示词必须复制与实际接收方一致的 `EXECUTOR_KIND`、同一 `MILESTONE_ID`、完整活动控制块和精确 revision；不能只给一个执行方可能无法访问的主 RUN 路径，也不能形成第二份可独立改写的需求真值。

## Revision 回传链与收口

revision 字段必须有明确消费者，不能只写进回包：

- `02·开发`、`04·修复` 和外部工程执行方正常完成时写与实际来源一致的 `EXECUTOR_KIND_ACTUAL` 及 `CONTRACT_REVISION_EXECUTED=R<n>`；
- `03·审查` 的 `CONTRACT_REVIEW` 正常完成时写 `CONTRACT_REVISION_REVIEWED=R<n>`；`IMPLEMENTATION_REVIEW` 先核对执行方分类和外部强制前审，再原样保留已核对的 `EXECUTOR_KIND_ACTUAL` 与 `CONTRACT_REVISION_EXECUTED`；
- `05·验证` 正常完成时原样保留 03 胶囊中的 `EXECUTOR_KIND_ACTUAL` 与 `CONTRACT_REVISION_EXECUTED/REVIEWED`，并写 `CONTRACT_REVISION_VALIDATED=R<n>`。

每个下游角色在实际工作前，将上游字段与活动控制块比较：`CONTRACT_REVISION_EXECUTED/REVIEWED/VALIDATED` 中本路径适用的值必须等于 `APPROVED_REVISION` 和 `CONTRACT_REVISION`。`CONTRACT_REVIEW` 发生在批准前，只要求其 `CONTRACT_REVISION_REVIEWED` 等于被派发的当前 revision，由 00 消费并决定是否放行。

执行方分类缺失、`UNKNOWN`、与来源不符，或外部执行使用跳过前审组合时，03 不做实现审查并以 `IMPLEMENTATION_SOURCE_MISMATCH` 硬停回 00；分类正确但执行 revision 不匹配时使用 `IMPLEMENTATION_REVISION_MISMATCH`。04 接收的 03 审查或 05 验证 revision 不匹配时以 `CONTRACT_INTAKE_REJECTED` 硬停；05 接收的 03 实现审查 revision 不匹配时以 `VALIDATION_REVISION_MISMATCH` 硬停。硬停不得被普通发现、修复或验证路线吞掉。

00 在每次继续派发及最终收口前，只核对当前批准 revision 的有效链中实际经过阶段所需字段。终点为 03 或 05 时，最终胶囊必须携带合法的 `EXECUTOR_KIND_ACTUAL`；若为 `EXTERNAL`，活动合同必须仍是已批准的强制前审组合。执行方分类缺失、`UNKNOWN`、非法或外部来源使用跳过前审组合时，结果为 `CONTRACT_EXECUTION_SOURCE_MISMATCH`。来源门通过后，终点为 03 时最终 03 胶囊必须同时携带相等的 `CONTRACT_REVISION_EXECUTED/REVIEWED`；进入 05 时最终 05 胶囊还必须携带相等的 `CONTRACT_REVISION_VALIDATED`。被新 revision 作废的旧回包保留为历史证据，但不参与当前链等值判断。任何当前必需 revision 字段缺失、值为 `UNKNOWN` 或不等于当前批准 revision 时，结果为 `CONTRACT_REVISION_CHAIN_MISMATCH`；两类错链都不得写完成、PASS 或继续下一阶段。

## 主 RUN 更新边界

前审回包后的状态变化只允许一次 `CONTRACT_GATE_UPDATE`：由 `00·总监` 在实现派发前，为该更新分配同一 `MASTER_RUN` 内唯一且稳定的 `APPROVAL_UPDATE_ID`，原位更新活动控制块和必要的修订合同正文，并追加一条携带同一 ID 与 `APPROVAL_STATUS=APPROVED_ACTIVE` 的紧凑 revision 裁决。不得另建 RUN、复用旧 revision 的更新 ID、粘贴完整回包、记录普通流水，或借此改写无关事实。实现或修复派发前，总监再次读取活动控制块，按上方“执行方接单门”核对实际接收方、共同条件与对应前审分支，全部满足才可发送。
