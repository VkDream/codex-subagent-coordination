# {KB_ROOT} 智能体入口

本文件只负责低 Token 启动路由；知识库治理以 `00_Governance\RULES.md` 为准，通用授权与工程硬约束以全局 `AGENTS.md` 为准。不得把本页扩写成工程规范、接力流水或历史归档。

## 精确启动顺序

1. 读取 `00_Governance\RULES.md`。
2. 根据用户当前保存项目、项目 ID、精确路径和上下文定位 `01_Projects\【项目名】`；身份不唯一时只问一个最小问题，不得猜测或混用相似项目。
3. 先读项目 `START_HERE.md`。阶段接力再读当前合同和该 `MILESTONE_ID` 的精确 `MASTER_RUN`；尚无主 RUN 时才定向读取一份最近相关的既往主 RUN 作背景。
4. 信息仍不足时，只读取 `PATHS.md`、`STATUS.md`、`TODO.md`、`RISKS.md` 的相关段落；没有 `START_HERE.md` 时再从 `PROJECT.md` 与 `PATHS.md` 建立边界。
5. `DONE.md`、`FAQ.md`、`CHANGELOG.md`、`LESSONS.md`、`AGENT_NOTES.md`、全部 RUN、长报告和归档，只在当前证据不足或用户明确追溯时读取。

禁止默认扫描全知识库、磁盘、工程、旧聊天或完整历史。当前入口、当前物理证据和用户当前更正优先；来源冲突不能裁决时标记 `UNKNOWN / 冲突待人工确认`。

## 强制转向

- 文件职责、事实记录、唯一主 RUN、两层写回、归档、新项目与收口：执行 `00_Governance\RULES.md`，本页不重复正文。
- 六角色接力：只有用户已开启当前精确项目的接力时，才读取 `{SKILLS_ROOT}\codex-workflow-router\references\kb-stage-relay.md`；角色、回传、revision、续页和胶囊按该协议执行。
- 原生父子子智能体的职责、派发、并发和回包：按 00_Governance\AGENT_COLLABORATION.md；它不增加任务授权。
- 授权、Git、MCP、模型与子智能体、进程所有权、工程质量和验证层级：执行全局 `AGENTS.md`。知识库中的路径只证明位置，不扩大权限。
- 用户说“不读知识库 / 不使用知识库”时不读取；说“知识库也不要写 / 全局只读 / 任何文件都不要修改 / 本轮不要落盘”时不写入。

新项目只有用户明确同意后才能创建最小事实模板。项目工程目标仍按 `RULES.md` 收口唯一主 RUN；普通聊天不创建 RUN。
