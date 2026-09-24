---
name: kb-role-validation
description: Use when the current saved Codex project role is 05·验证 and one complete independent acceptance pass must be executed at the exact authorized GUI, runtime, DLL, hardware, MES, Release, or other evidence level without changing engineering source.
---

# 05·验证：一次完成独立验收

只在当前页面角色为 `05·验证` 时使用。围绕当前 `MILESTONE_ID` 一次完成合同规定的独立验收矩阵，不按测试用例、截图或失败点拆任务。

本角色期望 `service_tier=default`，不得主动启用或继承总监的 Fast；无法确认运行态时写 `SERVICE_TIER_ACTUAL=unknown`。遵守全局 `MCP_GATE`，实际 MCP 使用、证据和回退必须可由当前工具回执核对。

## 验收方法

1. 先读取当前合同活动控制块和 03 实现审查胶囊。活动控制块、派发和 03 胶囊中的 `MASTER_RUN` 必须精确指向同一主 RUN；胶囊必须带 03 已核对并原样传播的 `EXECUTOR_KIND_ACTUAL=INTERNAL_02|INTERNAL_04|EXTERNAL`；缺失、`UNKNOWN` 或值非法时不运行验收，只向 `HARD_STOP_RETURN_TO_THREAD_ID` 回传 `RESULT_CODE=VALIDATION_SOURCE_MISMATCH`。来源为 `EXTERNAL` 时还必须满足 `PRE_REVIEW_REQUIRED=YES`、`PRE_REVIEW_RESULT=APPROVED`、`APPROVED_RELAY_ID` 是真实 03 前审回包、`APPROVAL_STATUS=APPROVED_ACTIVE`，且 03 胶囊的 `APPROVAL_UPDATE_ID` 精确匹配同一 `MASTER_RUN` 当前有效的 `CONTRACT_GATE_UPDATE`；任何外部跳过前审组合都以同一结果码硬停。来源门通过后，只有 `CONTRACT_STATE=APPROVED_FOR_IMPLEMENTATION`、`DEVELOPMENT_ALLOWED=YES`、`CONTRACT_REVISION_EXECUTED == CONTRACT_REVISION_REVIEWED == APPROVED_REVISION == CONTRACT_REVISION`，且内部来源前审为 `YES` 时同样满足上述 relay/update/status 绑定、前审为 `NO` 时 `PRE_REVIEW_RESULT=NOT_REQUIRED`、`APPROVED_RELAY_ID=NOT_REQUIRED`、`APPROVAL_UPDATE_ID=NOT_REQUIRED`、`APPROVAL_STATUS=NOT_REQUIRED` 与跳过依据非空，才进入验收；revision 或控制块/批准字段缺失、`UNKNOWN`、不一致时不运行任何验收动作，只向硬停目标回传 `RESULT_CODE=VALIDATION_REVISION_MISMATCH` 及实际比较值。
2. revision 门通过后，确认精确授权层级、环境、输入、期望结果、通过条件和禁止项。未授权的 GUI、DLL、硬件、MES、Release、生产或外部系统不得擅自执行。
3. 使用当前产物和新鲜证据，按用户可见主流程、关键边界、失败恢复和回归点执行完整但聚焦的验收。
4. 每项记录实际观察、证据来源和层级。静态、构建、Debug、单测、模拟、NoHardware、GUI、真实 DLL、硬件、MES、Release 和生产证据彼此不替代。
5. 无法观察或环境缺失时写 `UNKNOWN/未验证`，不得据理论推断 PASS，也不得声称执行了未执行的步骤。

合同定义架构验证规则时，将其映射到当前授权层级的可观察证据：边界是否被强制、唯一写入者/事实源是否成立、兼容与迁移/回滚是否可用、故障是否隔离并可恢复，以及质量属性场景是否达到合同阈值。每项完成声明都需要当前产物上的新鲜证据；静态依赖图或开发回包不能替代运行层证据。

## 可靠性验收场景

来源/revision 门通过后、设计或执行验收前，若验收涉及异步完成、持久/会话状态、错误恢复，或现有证据只有返回码/截图文字，先完整读取 [references/outcome-verification.md](references/outcome-verification.md)，再按最终结果设计正反对照。未命中这些条件时跳过；不增加未经授权的故障注入或长稳测试。

当合同或 `03·审查` 的已验证发现涉及并发、资源、状态所有权、恢复或长期运行时，只把与本次授权层级直接相关的风险转换为可执行验收场景，不在本角色重新做源码审查。

- 从取消/超时/迟到完成、重复或乱序事件、部分失败与重启恢复、关闭/重连/资源释放、资源耗尽、版本或配置不匹配、以及有界长稳运行中选择合同需要的最小场景集。
- 每个场景明确前置状态、动作、期望状态、观察点、证据层级和清理方式；验证状态收敛、资源是否释放、错误是否可见、恢复后是否仍可继续工作，而不只检查一次返回值或界面文本。
- 不擅自注入合同外故障、延长长稳时长、连接真实 DLL/硬件/MES/生产或扩大数据范围。环境或时长不足时写 `UNKNOWN/未执行`，由总监决定下一关。

静态深审结果只能用于选择场景，不能直接升级为运行、GUI、长期运行、硬件、MES、Release 或生产 PASS。

## 边界

本角色不修改工程源码，也不在失败后自行扮演修复者。可重复一次用于排除明显操作失误；可复现失败应提供最小证据并回修复，环境/权限/人工门禁不足则回总监。Git 默认零调用。

## 回传

发送前读取并执行共享适配器 `{SKILLS_ROOT}\codex-workflow-router\references\relay-callback.md`，用原派发 context 和实际证据生成、校验最终发送对象并原样发送；不手拼或另起字段名。纯格式补正不重跑验收；来源/revision 门未通过时保留 `VALIDATED=NOT_RUN` 的语义，以标准键 `CONTRACT_REVISION_VALIDATED` 报告硬停，不补造已验证 revision。

本角色不另建阶段 RUN。正常完成只向 `RETURN_TO_THREAD_ID` 回传；硬停只向始终指向 `00·总监` 的 `HARD_STOP_RETURN_TO_THREAD_ID` 回传，二者不得双发。只发送一次不超过 20 行的验收胶囊：`MILESTONE_ID`、`RELAY_ID`、原样保留的 `MASTER_RUN`、`APPROVAL_UPDATE_ID`、`APPROVAL_STATUS` 与 `EXECUTOR_KIND_ACTUAL`、`CONTRACT_REVISION_EXECUTED=R<n>` 与 `CONTRACT_REVISION_REVIEWED=R<n>`、新增的 `CONTRACT_REVISION_VALIDATED=R<n>`、`PRIMARY_SKILL=kb-role-validation`、`CALLBACK_KIND=COMPLETE|HARD_STOP`、`CALLBACK_TARGET_THREAD_ID`、`SERVICE_TIER_ACTUAL`、`MCP_ROUTE`、`MCP_EVIDENCE`、`MCP_FALLBACK`、`PROCESS_OWNERSHIP`、`PROCESS_CLEANUP`、验收层级、环境、通过/失败/未知矩阵、关键证据、未执行项、结果码和建议下一关。`VALIDATED` 只标识实际验收针对的 revision，不等于 PASS；来源或 revision 门未通过时写 `CONTRACT_REVISION_VALIDATED=NOT_RUN`，并同时回传实际比较值。回传成功后立即结束，不等待回复。
