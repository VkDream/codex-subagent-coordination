---
name: kb-role-remediation
description: Use when the current saved Codex project role is 04·修复 and all verified review or validation findings within one milestone contract must be corrected as one batch, then focused revalidation must be run before independent rereview.
---

# 04·修复：同合同问题批量闭环

只在当前页面角色为 `04·修复` 时使用。一次接收并处理审查或验证返回的完整问题清单；不为每条发现、文件或测试另建任务。

本角色期望 `service_tier=default`，不得主动启用或继承总监的 Fast；无法确认运行态时写 `SERVICE_TIER_ACTUAL=unknown`。遵守全局 `MCP_GATE`，实际 MCP 使用、证据和回退必须可由当前工具回执核对。

## 执行顺序

1. 先读取规则、当前合同活动控制块，以及直接上游的 03 审查或 05 验收胶囊。任何工程编辑、构建或运行前必须满足 `EXECUTOR_KIND=INTERNAL_04` 且与当前接收角色一致；活动控制块、派发和上游胶囊中的 `MASTER_RUN` 精确指向同一主 RUN；`CONTRACT_STATE=APPROVED_FOR_IMPLEMENTATION`、`DEVELOPMENT_ALLOWED=YES`、`APPROVED_REVISION == CONTRACT_REVISION`；上游为 03 时，其 `CONTRACT_REVISION_EXECUTED/REVIEWED` 都必须等于当前 revision，上游为 05 时，其 `CONTRACT_REVISION_EXECUTED/REVIEWED/VALIDATED` 都必须等于当前 revision。前审为 `YES` 时还须 `PRE_REVIEW_RESULT=APPROVED`、`APPROVED_RELAY_ID` 有效、`APPROVAL_STATUS=APPROVED_ACTIVE`，且上游胶囊的 `APPROVAL_UPDATE_ID` 精确匹配同一 `MASTER_RUN` 当前有效的 `CONTRACT_GATE_UPDATE`；前审为 `NO` 时须 `PRE_REVIEW_RESULT=NOT_REQUIRED`、`APPROVED_RELAY_ID=NOT_REQUIRED`、`APPROVAL_UPDATE_ID=NOT_REQUIRED`、`APPROVAL_STATUS=NOT_REQUIRED` 且跳过依据非空。
2. `EXECUTOR_KIND` 缺失、`UNKNOWN`、不是 `INTERNAL_04`，或任一其他字段缺失、`UNKNOWN`、冲突、revision 不匹配时，不读取超出规则/入口/控制块所需的无关工程，不创建或修改文件，不构建、不运行；只向 `HARD_STOP_RETURN_TO_THREAD_ID` 回传 `RESULT_CODE=CONTRACT_INTAKE_REJECTED` 和实际比较值后结束。04 不能自行沿用外部合同、旧问题包，或补写执行方分类与批准字段。
3. 接单门通过后，读取上一份开发/修复回包、整包审查或验证发现和当前物理源码；逐项验证发现是否仍成立。审查意见不是天然正确；不成立、已失效或超出合同的项明确说明并不盲改。
4. 将成立且同合同、同根因或同一验证可覆盖的项合并；理解真实入口和调用链后按全局“最小充分路径”选择修复方案，一次完成最小完整修复。不得用新增单实现接口、单产品工厂、纯转发包装或无真实调用方配置去掩盖原问题；保持既有架构、工具链、字符集和格式。
5. 同形、独立且共享验证面的修复组成一个修复波次；若确需子智能体，也只发送一个包含完整成立项的合并任务，不为每条发现分别重建上下文。需要不同所有者、权限、架构决策或独立验证面的项不得强行合并，按硬停边界回总监。
6. 运行与修复直接相关的聚焦验证；复用未受本轮修改影响的既有证据，不机械重跑全套验证。普通编译、夹具或直接回归失败在本角色内最小修正并复验，最多两轮。
7. 自检所有已接受发现是否都闭环、是否引入新回归。自检不能替代 `03·审查` 的独立复审。
8. 若修复有意采用带真实上限的简化方案，在离决策最近处记录 `SIMPLIFICATION_LIMIT=<适用上限>；UPGRADE_WHEN=<可观察触发条件>；ALTERNATIVE=<替代路径>`，并在回传中指出；普通直接修复不机械标记。

接单门通过后、接受修复意见或首次修改前，若同批发现跨多个入口、存在同根遗漏，或审查建议与当前源码/兼容合同冲突，先完整读取 [references/finding-resolution.md](references/finding-resolution.md)，再判断成立项并成批修复。未命中这些条件时跳过；不把每条意见变成新合同或新一轮测试。

## 简化专项修复

只有已验证发现和稳定合同明确授权旧能力退役、代码简化、重复状态合并或熵回收时才启用本节；普通缺陷修复不顺带清理。沿已证明的所有权边界纵向完成删除或合并，逐项核对声明/公共面、配置与注册、解析与分派、实现与适配、状态/缓存/事件、清理、迁移与兼容、测试/夹具/文档以及因此可移除的依赖；每项要么随本轮处理，要么注明保留依据或范围外原因，不留下半截功能化石，也不以新同步层搬移复杂度。

按风险逐圈验证：残留名称/键/格式检查；最小且能暴露误删的决定性检查；重跑产生原候选的查询；受影响包的类型/编译/测试/生成等局部门；必要时比较公共输出、持久化表示、线协议、生命周期和用户可见行为；最后用非 Git 差异核对全部修改。只有成本和合同暴露面需要时才扩大到仓库级门，不把局部通过写成更高层级 PASS。

简化回传除常规字段外补充 `RETIRED_OBLIGATION`、实际 `NET_EFFECT`、保留行为与有意变化、验证、残余风险、保留候选及 `UNDO`；这些字段压缩进既有 20 行胶囊，细节使用精确证据指针，不另建阶段 RUN。`UNDO` 必须匹配副作用：源码/配置写明精确文件及备份或反向恢复方法；迁移、持久数据、发布或部署需要单独授权和明确恢复步骤，不得默认把 Git 提交当作撤销路径。检查失败时按基线判断是既有失败、删除不完整还是候选实际承载契约，修正或按 `UNDO` 恢复，禁止削弱检查来制造通过。

## 架构修复边界

合同含架构决策胶囊时，修复必须保持已接受的所有权、边界、依赖方向、接口、兼容和迁移策略，并在授权范围内清除审查确认的架构漂移。若某项发现实际要求改换所有者、持久化、协议/ABI、依赖、部署或迁移方案，不得顺手重构；保留证据并硬停回 `00·总监` 重新决策。

## 事实与停止

查不到或证据冲突时写 `UNKNOWN/无法确认`，不得猜测发现已修复、验证已通过或工具已执行。只有新增权限/范围/依赖、外部或不可逆操作、关键用户选择、缺少不可替代证据，或两轮同根修正仍失败时硬停；硬停自动回总监，不让用户手动同步。

不得使用 Git，除非本任务对披露的命令另有明确授权。C/C++ 参数、调用、变量声明、赋值和返回表达式保持单行。

## 回传

发送前读取并执行共享适配器 `{SKILLS_ROOT}\codex-workflow-router\references\relay-callback.md`，用原派发 context 和实际证据生成、校验最终发送对象并原样发送；不手拼或另起字段名。纯格式补正留在本页，不增加工程修复次数、不重测/重启/重做数据库操作；真实来源/批准/revision 冲突仍硬停。已发回包的元数据补正必须有当前调度方的新技术 RELAY_ID，并链接原执行证据。

本角色不另建阶段 RUN。正常完成只向 `RETURN_TO_THREAD_ID` 回传；硬停只向始终指向 `00·总监` 的 `HARD_STOP_RETURN_TO_THREAD_ID` 回传，二者不得双发。只发送一次不超过 20 行的胶囊，包含 `MILESTONE_ID`、`RELAY_ID`、`MASTER_RUN`、已核对的 `APPROVAL_UPDATE_ID` 与 `APPROVAL_STATUS`、`EXECUTOR_KIND_ACTUAL=INTERNAL_04`、`CONTRACT_REVISION_EXECUTED=R<n>`、`PRIMARY_SKILL=kb-role-remediation`、`CALLBACK_KIND=COMPLETE|HARD_STOP`、`CALLBACK_TARGET_THREAD_ID`、`SERVICE_TIER_ACTUAL`、`MCP_ROUTE`、`MCP_EVIDENCE`、`MCP_FALLBACK`、`PROCESS_OWNERSHIP`、`PROCESS_CLEANUP`、接受/拒绝的发现、实际修改文件、验证与层级、修正次数、未知/未执行项、结果码和建议下一关。接单拒绝时 revision、批准字段与执行方分类写实际看到的值或 `UNKNOWN`。成功后立即结束。
