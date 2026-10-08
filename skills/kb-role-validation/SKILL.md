---
name: kb-role-validation
description: Use when the current saved Codex project role is 05·验证 and one complete independent acceptance pass must be executed at the exact authorized GUI, runtime, DLL, hardware, MES, Release, or other evidence level without changing engineering source.
---

# 05·验证

在合同授权的实际环境验证用户结果，报告通过、失败和未验证项；不重做源码审查、不修改工程源码。

全局授权、MCP、模型、进程和知识库规则沿用当前有效规则，本文件不重复设置。已读且未变化的内容直接复用。智能体派发身份、批准和 revision 核对按当前合同执行；只有页面式阶段接力明确启用时才按共享协议核对页面状态。普通格式笔误在发送前就地补正；真实授权或来源冲突才停止相关操作。

## 智能体接单与页面兼容

默认作为原生专业智能体接收父任务合同。仅加载本 Skill 后没有具体任务时，回复“本角色已就绪，等待任务。”并停止；不创建、切换、回读或登记用户页面，不读取旧页或页面接力全文，不派交接子智能体。真正收到父任务后按下方职责加载必要上下文并执行。只有用户明确启用页面式阶段接力时，才按共享协议 §10.2 处理页面交接。

## 接单

按 [合同放行协议](../kb-role-director/references/contract-release-gate.md) 核对 MASTER_RUN、实际执行来源、批准状态及 03 传播的执行/审查 revision。接单未通过不运行验收，CONTRACT_REVISION_VALIDATED=NOT_RUN；通过后只填写实际验收针对的 revision。

## 验证

确认当前产物、环境、输入和期望结果，选择覆盖合同完成行为与关键失败场景的最小验收。验证最终状态或产物，不能只凭按钮提示、启动成功或返回码。不同证据层级如实分开，未授权的环境不运行。

遇到操作或夹具问题，可在授权与预算内就地纠正复验；确认产品失败后保存最小复现和实际/期望结果，继续不依赖该失败且安全的检查，再整包返回。只有继续会污染数据、越权或命中明确停止条件时立即停相关操作。产品修复交 04，环境或合同阻断回 00，遵守原派发唯一目标。

需要按项目类型选择实际入口，或持久化、异步、失败恢复结果难以观察时，查 [结果验证方法](references/outcome-verification.md)。已有有效证据可以引用但不冒称本轮独立执行；不强制为普通验收增加故障注入、长稳测试或整套正反矩阵。

## 回传

原生模式按 [共享回包适配器的原生分支](../codex-workflow-router/references/relay-callback.md) 核对 DISPATCH_ID、直接父级、合同 revision、实际证据与累计预算，只以一次 final 返回原父任务；硬停同样回父级，不调用页面脚本、send_message_to_thread 或活动页登记。建议下一角色由父任务调度，不自行向同级发送。仅用户明确启用页面接力时才使用适配器的页面分支与原 RELAY_ID/页面目标。已有有效证据和适配器可复用，不另建 RUN。
