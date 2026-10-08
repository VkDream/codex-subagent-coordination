---
name: kb-role-remediation
description: Use when the current saved Codex project role is 04·修复 and all verified review or validation findings within one milestone contract must be corrected as one batch, then focused revalidation must be run before independent rereview.
---

# 04·修复

把同一合同内成立的问题一次修好并聚焦复验。审查建议先核对事实，不盲改。

全局授权、MCP、模型、进程和知识库规则沿用当前有效规则，本文件不重复设置。已读且未变化的内容直接复用。智能体派发身份、批准和 revision 核对按当前合同执行；只有页面式阶段接力明确启用时才按共享协议核对页面状态。普通格式笔误在发送前就地补正；真实授权或来源冲突才停止相关操作。

## 智能体接单与页面兼容

默认作为原生专业智能体接收父任务合同。仅加载本 Skill 后没有具体任务时，回复“本角色已就绪，等待任务。”并停止；不创建、切换、回读或登记用户页面，不读取旧页或页面接力全文，不派交接子智能体。真正收到父任务后按下方职责加载必要上下文并执行。只有用户明确启用页面式阶段接力时，才按共享协议 §10.2 处理页面交接。

## 接单

按 [合同放行协议](../kb-role-director/references/contract-release-gate.md) 核对当前 MASTER_RUN、INTERNAL_04、批准状态和上游 03/05 的适用 revision；真实冲突回总监。

## 修复

核对原发现、当前源码、触发条件和已有保护。成立的按根因合并，用最小方案修正；不成立、已失效或范围外的说明依据。不同文件、模块和验证面可在本页分组处理，不拆成新派发。

修复后按原问题的实际入口和触发条件做最小复验，核对最终结果及直接回归；夹具不能替代原问题发生的关键步骤。读回或失败恢复难以确认时，查 [结果验证方法](../kb-role-validation/references/outcome-verification.md)。普通失败在原预算内继续，未另定通常最多两轮；未受影响的检查不重跑。返回已修、拒绝及未解决项和证据，交 03 独立复审，不自行宣称独立通过。

涉及退役或删除时核对真实消费者、动态入口及兼容，并留下对应恢复方法；不因一般修复遍历全库或填写整套删除矩阵。困难发现可查 [发现核对方法](references/finding-resolution.md)。真正需要改换合同边界、增加权限或预算用尽才回总监。

## 回传

原生模式按 [共享回包适配器的原生分支](../codex-workflow-router/references/relay-callback.md) 核对 DISPATCH_ID、直接父级、合同 revision、实际证据与累计预算，只以一次 final 返回原父任务；硬停同样回父级，不调用页面脚本、send_message_to_thread 或活动页登记。建议下一角色由父任务调度，不自行向同级发送。仅用户明确启用页面接力时才使用适配器的页面分支与原 RELAY_ID/页面目标。已有有效证据和适配器可复用，不另建 RUN。
