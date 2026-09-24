# Knowledge-Base Stage Relay V3.5

仅在用户已为一个精确保存项目开启知识库阶段接力、要求自动路由，或当前固定角色需要继续当前里程碑时读取。该协议管理 Codex 任务页和紧凑回传，不配置 DSH、MCP、模型默认值、Git、工程权限或外部系统。

## 1. 权限与项目身份

- 接力只授权在已确认的保存项目 ID 和精确路径中查找、首次创建、命名、复用和消息连接六个固定角色页，并按知识库规则维护一个里程碑主 RUN。
- 接力本身不授权工程修改、构建、运行、GUI、外部写入、Git、数据库、硬件、MES、发布或生产。工程权限必须来自用户当前合同。
- 项目 ID、路径或活动角色不唯一时停止并提出一个最小问题，绝不从相似标题或历史路径猜测。
- 用户禁止知识库写入时，不声称已建立可持久接力；只给 20 行内手工胶囊并停止。

## 2. 初始化当前项目

口令“创建当前新项目并开启阶段接力”只授权：确认当前保存项目和路径、创建最小知识库项目、创建一份初始化主 RUN、将当前页设置为 00·总监 并启用接力。它不授权工程或外部操作。

1. 必须确认唯一保存项目 ID 和精确本地路径。
2. 将当前页标题直接设置为字面量 00·总监，读取一次任务元数据并核对严格相等；不相等时返回 RELAY_TITLE_MISMATCH，最多纠正一次。
3. 只创建已确认事实，不臆造里程碑、架构、接口、路径或验证。
4. 现有代码只有确需当前技术基线时才首次创建 01·诊断；空项目留在总监讨论路线图。
5. 不创建“立项·建档”“R000·规划”或六个空白角色页。

## 3. 六个固定角色与 Skill

每个项目只维护以下活动角色页，进入后必须加载且只加载对应主 Skill：

| 活动标题 | 主 Skill | 完整职责 |
|---|---|---|
| 00·总监 | kb-role-director | 一份路线图、一个完整里程碑合同、阶段决定、主 RUN 与最终收口；不改工程、不自审 |
| 01·诊断 | kb-role-diagnosis | 一次交付完整基线或根因包；默认只读 |
| 02·开发 | kb-role-development | 一次完成完整实现、普通同根修正、聚焦验证和自检 |
| 03·审查 | kb-role-review | 独立只读地一次审完整合同或完整实现，并汇总全部高置信发现 |
| 04·修复 | kb-role-remediation | 一次批量修复同合同内已验证发现，聚焦复验后回独立审查 |
| 05·验证 | kb-role-validation | 一次完成合同指定层级的独立验收，不改工程 |

活动标题必须逐字等于表中名称，不加项目、模型、里程碑或命令。其他角色页首次真正需要时才创建，之后复用。六个标题是职责槽位，不要求六页始终同时存在。

模型、推理强度、service tier、Fast/Sol 和子智能体默认值只由全局 `{GLOBAL_AGENTS}` 规范，本接力协议不另设默认值。已授权创建角色新页时，读取其中“六角色新页模型默认表”，按目标角色显式向 `create_thread` 传入 `model`、`thinking`；用户当前对该目标页的明确覆盖优先，不继承发送方或旧页。复用现有页的普通派发/回包保持原设置，不附带模型覆盖；子智能体不套用角色页模型表。派发胶囊记录期望值，完成胶囊只记录运行态可确认的实际值；无法确认时写 `unknown`，不得把期望值或配置值冒充已生效。

## 4. 工作粒度

### 里程碑

一个完整、内聚、用户可感知、可一次验收的业务流、功能、缺陷族或阶段结果。全程保持同一 MILESTONE_ID、主合同和主 RUN。

### 角色阶段

同一里程碑中的一次角色激活。角色完成后只发一个证据胶囊，不创建自己的 RUN。

### 微动作

文件读取/修改、命令、构建、测试、一个失败、一条发现、一个修复项或一次复验。微动作全部留在当前角色内，不得创建任务、合同、接力、里程碑或 RUN。

不要把“大轮次”误解成无限范围。一个里程碑应能由同一合同、同一权限边界和同一验收矩阵闭环；若用户价值、权限、依赖或验收实质不同，再拆为下一个里程碑。

00·总监在形成合同时将过程深度标为 `PROBE`、`BOUNDED` 或 `ARCHITECTURAL`：分别对应可行性/假设验证、现有清晰流程的边界改动、以及实质改变系统边界或关键质量属性的架构工作。分类不新增角色、RUN 或审批；隐藏复杂度只能升级并回总监重裁，不能为了省流程降级。

## 5. 默认完整路径

默认路径：

00 → [01，仅当前根因/基线确实未知] → 00 → [03，命中合同放行门时前审并回 00] → 00 放行 →（内部：02 → 03；外部：执行方 → 00 核对 revision → 03）→ [04 → 03] → [05，仅合同要求独立 GUI/人工/硬件等验收] → 00

- 小而清楚、权限完备的常规改动由 00 直接派 02。
- 可执行合同是否做 `CONTRACT_REVIEW` 由 `kb-role-director/references/contract-release-gate.md` 的强制触发条件决定；普通澄清不重新前审，实质修订必须递增 revision 并使旧批准失效。
- 02 一次实现整个内聚里程碑，普通失败和同根遗漏在页内最多两轮最小修正。
- 03 一次扫描并汇总全部高置信问题，同根项形成一个修复批次，不“一条发现一个任务”。
- 默认一次 04→03 修复复审。只有同根因、同白名单、无新权限/依赖且代价明确时允许第二次；两次仍失败自动回 00 硬停。
- 05 只在静态/构建/自动化证据不足以满足合同验收时进入，不机械增加。
- 用户指定 DSH、DeepSeek、Kimi 或其他外部执行方时，只有当前 revision 已完成 03 独立前审并由 00 放行后才生成或发送一个 `EXECUTOR_KIND=EXTERNAL` 的完整外部合同；外部合同必须为 `PRE_REVIEW_REQUIRED=YES`、`PRE_REVIEW_RESULT=APPROVED` 且携带真实 `APPROVED_RELAY_ID`，不得继承内部 BOUNDED 路线的 `NO/NOT_REQUIRED` 跳过组合。这里“真实”表示 00 能在同一 `MASTER_RUN` 的活动控制块或 `CONTRACT_GATE_UPDATE` 中定位到同一 `PROJECT_ID`、`MILESTONE_ID`、`CONTRACT_REVISION`、`ROLE=03·审查`、返回 00 的 `CALLBACK_TARGET_THREAD_ID` 且 `APPROVAL_STATUS=APPROVED_ACTIVE` 的前审回包，并且 `APPROVAL_UPDATE_ID` 精确指向该主 RUN 当前唯一有效的 `CONTRACT_GATE_UPDATE`；缺失、过期、重复、错主 RUN/更新/项目/里程碑/revision/角色/回传目标均不得派发。外部执行方正常完成先回 00，由 00 核对 `CONTRACT_REVISION_EXECUTED` 后再派 03 做 `IMPLEMENTATION_REVIEW`，不重复派内部开发/修复。

## 6. 里程碑合同

00·总监为每个里程碑定义：

- MILESTONE_ID、用户价值目标、完成定义；
- PROCESS_DEPTH（`PROBE/BOUNDED/ARCHITECTURAL`）及升级条件；
- 保存项目 ID、工程路径、当前事实和显式 UNKNOWN；
- 允许、禁止、授权来源、改动边界；
- 交付物、验收矩阵、验证预算和不代表的层级；
- 依赖、自动修正预算、修复复审次数；
- MASTER_RUN 精确路径；
- 预期角色路径和硬停条件。
- 影响范围、方案、所有权、兼容、验收或风险的关键 `RULING`；每条包含依据、错判代价和重审条件，普通实现细节不记录。

合同在整个里程碑内稳定。只有目标、范围、权限、依赖、数据处理或验收实质变化时回 00 变更合同；技术 RELAY_ID 的变化不构成新合同。

## 7. 事件驱动回传

每次跨页派发都包含：

- 同一 MILESTONE_ID；
- 唯一 RELAY_ID；
- 精确 TARGET_THREAD_ID、正常完成使用的 RETURN_TO_THREAD_ID，以及始终指向 `00·总监` 的 HARD_STOP_RETURN_TO_THREAD_ID；
- 当前角色、预期接收角色、正常完成或硬停时唯一允许的回传动作；
- MASTER_RUN 路径、当前修复复审计数和完整权限边界。
- 可执行合同派发还包含与实际接收方一致的 `EXECUTOR_KIND=INTERNAL_02|INTERNAL_04|EXTERNAL`、`CONTRACT_REVISION`、`CONTRACT_STATE`、`PRE_REVIEW_REQUIRED/RESULT`、`APPROVED_REVISION/RELAY_ID`、`APPROVAL_UPDATE_ID`、`APPROVAL_STATUS` 和 `DEVELOPMENT_ALLOWED`；执行方不能只收到一个其可能无法访问的主 RUN 路径。00 在外部派发前必须完成上述批准绑定核对，执行方仍需检查胶囊字段完整且 revision 一致。外部执行方看到 `EXECUTOR_KIND` 缺失/不符、批准字段缺失/不一致或任何 `NO/NOT_REQUIRED` 跳过组合时，必须在工程动作前以 `CONTRACT_INTAKE_REJECTED` 硬停回 00。

发送成功后发送方立即结束，不等待、不监工。接收方只调用 send_message_to_thread 一次并立即结束：正常完成只发给 RETURN_TO_THREAD_ID；硬停只发给 HARD_STOP_RETURN_TO_THREAD_ID，禁止双发。胶囊必须写明 `PRIMARY_SKILL`、`CALLBACK_KIND` 和实际 `CALLBACK_TARGET_THREAD_ID`。

发送前执行共享适配器 `{SKILLS_ROOT}\codex-workflow-router\references\relay-callback.md`：用原派发/活动合同作为独立 context，生成并校验最终 `{threadId,prompt}`，然后原样发送一次，不手拼另一份回包。字段笔误在本角色内补正，不增加业务修复轮次或重跑已执行工作；真实身份/来源/批准/revision 冲突仍硬停。硬停允许携带缺失/冲突的上游信息，只向已确认的 00 告警。适配器不替代接单、批准台账、去重或发送回执门，旧格式在途包按适配器兼容段处理。

可执行合同的来源与 revision 必须沿实际路径被下游消费并向终点传播：02、04 和外部工程执行方回与真实来源一致的 `EXECUTOR_KIND_ACTUAL` 及 `CONTRACT_REVISION_EXECUTED`；03 实现审查先核对来源分类，外部来源还核对强制前审，再回 `CONTRACT_REVISION_REVIEWED` 并保留已核对的执行方分类与 `EXECUTED`；05 保留执行链并新增 `CONTRACT_REVISION_VALIDATED`。03/04/05 在实际审查、修改或验收前必须将适用的上游字段与活动合同比较；缺失、`UNKNOWN` 或不一致时只硬停回 00，不走普通发现、修复或验收路线。

角色若启动过后台或长驻进程，必须在完成或硬停回传前按全局进程所有权门处理精确会话/进程树，并在胶囊中写明 `PROCESS_OWNERSHIP`、`PROCESS_CLEANUP`；未启动则写 `NONE/NOT_NEEDED`。不得为清理而扫描或终止用户后台、其他角色页或 Codex/MCP 宿主进程。

禁止：

- wait_threads 使用正超时；
- 循环 read_thread、list_threads 或状态轮询；
- 固定间隔唤醒、心跳消息或同一阶段重复派发；
- 一个角色自行创建孙任务或向多个页面广播；
- 把“回总监/回审查”文字当成已经执行的消息。

只有用户明确问“检查接力状态”时，才允许一次 timeoutMs: 0 的即时快照，返回后结束。

正常完成目的地（硬停不走此表）：

| 当前角色/结果 | 唯一目的地 |
|---|---|
| 01 完整诊断 | 00 |
| 03 合同前审通过 | 00（核对精确 revision，执行 `CONTRACT_GATE_UPDATE` 后才可派 02/外部执行方） |
| 03 合同前审有问题或关键 UNKNOWN | 00（修订并递增 revision 后重新前审） |
| 02 实现完成 | 03（IMPLEMENTATION_REVIEW） |
| 外部执行方实现完成 | 00（核对执行 revision 后派 03 做 IMPLEMENTATION_REVIEW） |
| 03 实现审查有整包发现 | 04 |
| 03 无高置信发现且合同要求独立验收 | 05 |
| 03 无高置信发现且无需更高验收 | 00 |
| 04 批量修复完成 | 03（IMPLEMENTATION_REVIEW） |
| 05 PASS | 00 |
| 05 可复现失败且仍在合同修复预算内 | 04 |

任一角色硬停、扩权、两轮失败、合同接单拒绝、执行方来源/revision 链不一致或关键证据冲突时不按正常完成表路由，只向 `HARD_STOP_RETURN_TO_THREAD_ID` 指定的 00·总监回传。`CONTRACT_REVIEW` 的 `RETURN_TO_THREAD_ID` 必须也是 00；否则 03 以 `CONTRACT_REVIEW_ROUTE_INVALID` 硬停，不能直接批准给开发。实现审查的来源错误使用 `IMPLEMENTATION_SOURCE_MISMATCH`，revision 错误使用 `IMPLEMENTATION_REVISION_MISMATCH`；修复接单错误使用 `CONTRACT_INTAKE_REJECTED`；验证的来源错误使用 `VALIDATION_SOURCE_MISMATCH`，revision 错误使用 `VALIDATION_REVISION_MISMATCH`。00 收口的来源错误使用 `CONTRACT_EXECUTION_SOURCE_MISMATCH`，revision 错误使用 `CONTRACT_REVISION_CHAIN_MISMATCH`。

## 8. 未知与硬停

角色先在授权范围内做有限核查。仍查不到或证据冲突时明确 UNKNOWN / 无法确认，不能补造路径、接口、版本、根因、执行、修改或 PASS。

UNKNOWN 会改变行为、范围、权限、数据处理或验收时，硬停并在回总监胶囊中给一个最小用户问题；低影响 UNKNOWN 可保留后继续安全工作。

硬停不是丢包：必须只向合同中精确指向 00·总监 的 HARD_STOP_RETURN_TO_THREAD_ID 回传一次，包含已完成的安全工作、实际修改、验证、未知/阻断、未执行项、当前工程状态和建议下一关。不得同时向正常返回页发送，不得让用户手动转发，不得自动扩大权限或在预算外重跑。

回传失败时：

1. 不做近似参数盲重试，不使用计算机控制绕过；
2. 若知识库允许写入，只向既定 MASTER_RUN 追加一段 RELAY_CALLBACK_FAILED 胶囊，不创建新 RUN；
3. 若知识库也写入失败，当前页报告双重阻断并保留可复制胶囊；
4. 不声称总监已经收到。

接收方在推进前核对项目、MILESTONE_ID、RELAY_ID、预期角色、当前待处理状态，以及本路径适用的 `CONTRACT_REVISION_EXECUTED/REVIEWED/VALIDATED`。过期、重复、错项目、非预期回传或 revision 不匹配只拒绝并记录；一个有效回传最多触发一个下一阶段。

## 9. 一份主 RUN

里程碑首次派发前由 00 创建或核验一个 MASTER_RUN；整个 00–05 流程只维护该文件。过程中只允许为准确续页追加 `CONTINUATION_CHECKPOINT`、在回传失败时追加 `RELAY_CALLBACK_FAILED`，或由 00 在合同前审回包后、实现派发前执行一次 `CONTRACT_GATE_UPDATE`：原位更新活动控制块和必要合同正文，并追加一条紧凑 revision 裁决。不得借此粘贴完整回包、记录普通流水或另建 RUN。普通派发、回传、失败、发现、修复和复验不追加流水。普通角色胶囊不是 RUN。总监在完成或硬停时统一汇总：

- 各角色实际执行者、页面、模型或未知、时间和来源；
- 实际修改文件与最终状态；
- 已执行验证及精确层级；
- 所有高置信发现、已接受/拒绝修复、修正次数；
- 当前批准 revision 的有效链中，02/04/外部执行、03 审查和实际进入的 05 验证所回传的 revision 是否全部等于最终 `APPROVED_REVISION`；未进入的阶段不造字段，已作废 revision 的历史回包不参与当前等值判断；
- UNKNOWN、未执行、风险、关键 RELAY_ID 和回传状态；
- 最终结果码、置信度和下一关。

核心 STATUS/TODO/RISKS/DONE/START_HERE 也只在里程碑完成或硬停时由总监同步真实差量。派发、回传、状态查询、一次失败、单条发现和复验不创建 RUN。

## 10. 同角色准确续页：可执行检查点 V3.2

续页的目标是让同一角色的新页无需重读旧聊天，也能准确知道“现在为什么停在这里、第一步该做什么、什么已经做过不能重来”。页面创建、改名、线程 ID 和导航只是载体，不是交接结果。本协议同时适用于用户手工新建页面和 Codex 获得授权后创建页面。

续页模型设置：本次默认表授权不等于授权现在换页；仍须先到当前安全边界并获得用户换页确认。旧页在创建前重新读取全局模型表，按目标角色或用户当前明确覆盖确定 `MODEL_EXPECTED`、`THINKING_EXPECTED`，写入同一检查点并用于 `create_thread` 的实际参数，不沿用旧模型快照。仅传工具支持的参数，不能伪造 `service_tier` 参数；01–05 仍期望非 Fast，实际服务层单独核验。手工新页由用户在 UI 核对；不使用给当前页发消息或另启一条业务消息的方式改模型。设置失败或明确不匹配时暂停新页业务启动并报告，不自动降级或重建；运行回执未提供实际值时保留 `unknown`，不能只因标题/创建成功就声称已切换或已完成交接。

### 10.1 旧页必须先写可执行检查点

旧页先完成当前最小安全边界，再生成唯一 `CONTINUATION_ID`，在同一 `MASTER_RUN` 追加 `CONTINUATION_CHECKPOINT:<ID>`，并把同一不超过 20 行的胶囊放进新页初始提示。主 RUN 检查点是权威来源；提示与检查点冲突时不得继续。

检查点必须让一个没有旧聊天的新页直接回答：

1. 用户最终想得到什么；
2. 本角色当前正在完成哪一件事；
3. 刚刚完成了什么，哪些证据已经成立；
4. 下一步唯一第一动作是什么；
5. 哪些内容不得重做，做到什么算完成，什么情况必须停。

`NEXT_ACTION` 必须包含动作、精确目标、预期证据和停止位置，例如“定向读取合同 X 的验收段，与最新审查胶囊 Y 对照；若无权限变化则生成 02 派发胶囊并结束”。禁止使用“继续推进”“按计划处理”“接着完成”“进入下一阶段”等不能直接执行的空话。

`READ_FIRST` 只列新页完成下一动作所需的精确路径、章节或锚点；不得要求读取旧聊天全文、全部 RUN、完整历史或无关项目。`DO_NOT_REDO` 必须列出已经完成且未被后续变化影响的读取、裁决、修改和验证，避免新页重新研究同一问题。

如果当前真实状态就是等待用户反馈、外部回包或环境变化，必须写成明确动作，例如 `NEXT_ACTION=等待用户对 A/B 方向作选择；收到前不派发、不改合同`，不能让新页为了显得有进展而自行制造工作。

### 10.2 新页先语义回读，再直接继续

新页只读全局/知识库规则、项目 `START_HERE.md`、当前合同、`MASTER_RUN` 的精确 `CONTINUATION_CHECKPOINT:<ID>` 和胶囊指定的 `READ_FIRST`。不得先浏览旧聊天或宽泛历史来“找感觉”。

开始实际工作前，新页先输出紧凑 `CONTINUATION_ACK`，逐项写明理解到的用户目标、当前状态、唯一下一动作、禁止重做项和关键阻断：

- ACK 与检查点一致、路径存在、权限清楚且无关键阻断：写 `READY=TRUE`，并在同一轮直接执行 `NEXT_ACTION`，不要求用户再次说“继续”；
- 提示与主 RUN 检查点冲突、下一动作仍含糊、关键路径不存在或权限会改变结果：写 `READY=FALSE`，只提出一个最小问题或返回旧页修正检查点，不猜测；
- 新物理证据与旧裁决冲突：保留冲突证据并按 `REOPEN_WHEN` 重审，不能为了“准确交接”盲从错误，也不能无新证据自行推翻已裁决方向。

只有 ACK 语义一致并从正确 `NEXT_ACTION` 开始，才算续页就位。文件读取成功、页面标题正确或复述了项目背景都不构成交接成功。

### 10.3 在途角色与回包状态也属于工作内容

`INFLIGHT_RELAYS` 必须列出仍在执行的 `RELAY_ID`、目标角色、预期回包内容和当前返回页；没有则写 `NONE`。新页不得把“已派发”误写成“已完成”，也不得在回包前重复派发。若回包仍会进入旧页，旧页只保留为回包入口，并在收到后按既定协议向当前页同步一次；这只是防丢包措施，不替代准确续页检查点。

### 10.4 总监页必须保留方向思考

`00·总监` 除通用字段外，还必须写：当前推荐方向与理由、已拒绝方案及理由、用户已经表明的偏好、仍未裁决的问题、总监认为用户可能判断错误的点、以及下一轮与用户讨论的一个具体问题。新页不能只知道“下一阶段是 02”，却不知道为何这样走、哪些方向已经否决、还在等用户决定什么。

### 10.5 交接质量门

| 失败表现 | 处理 |
|---|---|
| `NEXT_ACTION` 是空话或包含多个互斥动作 | 旧页重写检查点后才能换页 |
| 新页只能说出项目背景，说不出当前第一动作 | `READY=FALSE`，不得开始工作 |
| 新页准备重做 `DO_NOT_REDO` 中的有效证据 | 停止重做，使用现有证据继续 |
| 提示胶囊与主 RUN 检查点不一致 | 以主 RUN 为准并报告冲突；关键差异未解决前停止 |
| 需要旧聊天才能理解下一步 | 检查点不合格，返回旧页补齐，不读取整段旧聊天代偿 |
| ACK 一致且下一动作可执行 | `READY=TRUE`，同一轮直接继续 |

续页前后的 `MILESTONE_ID`、合同、权限和主 RUN 保持不变；`CONTINUATION_ID` 只标识本次检查点，不代表新阶段、角色派发或新 RUN。

## 11. 20 行胶囊

派发胶囊：

    MILESTONE_ID=...；RELAY_ID=...；CYCLE=0/1/2
    TARGET_THREAD_ID=...；RETURN_TO_THREAD_ID=...
    HARD_STOP_RETURN_TO_THREAD_ID=<00·总监的精确 thread ID>
    PROJECT_ID=...；PATH=...；ROLE=...；EXECUTOR_KIND=INTERNAL_02|INTERNAL_04|EXTERNAL（允许修改、构建或运行时必填）
    SERVICE_TIER_EXPECTED=<按全局规则与当前合同填写；无法确认写 unknown>
    MASTER_RUN=...
    CONTRACT_REVISION=...；CONTRACT_STATE=...
    PRE_REVIEW_REQUIRED=...；PRE_REVIEW_RESULT=...
    APPROVED_REVISION=...；APPROVED_RELAY_ID=...；APPROVAL_UPDATE_ID=...；APPROVAL_STATUS=...；DEVELOPMENT_ALLOWED=...
    GOAL=一个完整可验收结果
    CURRENT_FACTS=...；UNKNOWN=...
    ALLOW=...；FORBID=...
    AUTHORITY_SOURCE=...
    DELIVERABLES=...；VALIDATION=...
    DONE_WHEN=...
    HARD_STOP=扩权/新依赖/关键冲突/不可替代缺失/两轮失败
    CALLBACK_ON_COMPLETE=只向 RETURN_TO_THREAD_ID 发送一次后结束
    CALLBACK_ON_HARD_STOP=只向 HARD_STOP_RETURN_TO_THREAD_ID 发送一次后结束；禁止双发

完成胶囊：

    MILESTONE_ID=...；RELAY_ID=...；ROLE=...；RESULT_CODE=...
    02/04/外部执行写 EXECUTOR_KIND_ACTUAL 与 CONTRACT_REVISION_EXECUTED；03 合同前审写 CONTRACT_REVISION_REVIEWED；03 实现审查保留执行方分类并写 EXECUTED 与 REVIEWED；05 保留执行链并写 CONTRACT_REVISION_VALIDATED；revision 值均精确
    PRIMARY_SKILL=与 ROLE 唯一匹配的 kb-role-* Skill
    CALLBACK_KIND=COMPLETE/HARD_STOP；CALLBACK_TARGET_THREAD_ID=实际唯一目的地
    SERVICE_TIER_ACTUAL=fast/default/unknown
    MCP_ROUTE=实际 server/tool 或 NONE:允许原因；MCP_EVIDENCE=事实或 NONE；MCP_FALLBACK=回退及原因或 NONE
    PROCESS_OWNERSHIP=NONE 或本角色精确会话/PID/用途；PROCESS_CLEANUP=NOT_NEEDED/PASS/PERSISTENT_AUTHORIZED/FAILED:原因/UNKNOWN
    ACTUAL_CHANGES=...
    VALIDATION_LEVEL=...；VALIDATION_RESULT=...
    FIX_CYCLES=...
    FINDINGS_OR_RESOLUTION=...
    RULINGS=仅填写本阶段新增的关键裁决；无则省略
    UNKNOWN=...；UNEXECUTED=...
    BLOCKER=...
    RECOMMENDED_NEXT_GATE=...

续页检查点胶囊（不超过 20 行）：

    CONTINUATION_ID=...；ROLE=...；MILESTONE_ID=...；MODEL_EXPECTED=...；THINKING_EXPECTED=...
    PROJECT_ID=...；PATH=...
    MASTER_RUN=...；CONTRACT=...；RESUME_ANCHOR=CONTINUATION_CHECKPOINT:<ID>
    USER_GOAL=用户最终要得到的可观察结果
    CURRENT_OBJECTIVE=本角色当前只在完成什么
    JUST_COMPLETED=刚完成的动作与结果
    CURRENT_STATE=当前事实状态，不是计划
    NEXT_ACTION=动作+精确目标+预期证据+停止位置
    NEXT_ACTION_REASON=为什么现在先做这一步
    READ_FIRST=仅下一动作需要的精确路径/章节/锚点
    DO_NOT_REDO=仍有效且不得重复的工作与证据
    VERIFIED_EVIDENCE=已验证层级与结果
    UNEXECUTED=尚未执行且不得冒充完成的事项
    INFLIGHT_RELAYS=RELAY_ID/角色/预期回包/返回页；无则 NONE
    DIRECTION_AND_RULINGS=总监方向、理由与 REOPEN_WHEN；非总监可省略
    REJECTED_OPTIONS=已拒绝方案及理由；无则 NONE
    USER_STANCE_AND_OPEN_DECISIONS=已知用户立场与仍待裁决项
    AUTHORITY=ALLOW/FORBID/授权来源
    DONE_WHEN=本续页目标完成条件
    STOP_IF=硬停条件、关键 UNKNOWN 或等待对象

续页语义回读胶囊：

    CONTINUATION_ID=...；RESULT_CODE=CONTINUATION_ACK；MODEL_ACTUAL=已确认值或 unknown；THINKING_ACTUAL=已确认值或 unknown
    GOAL_UNDERSTOOD=...
    CURRENT_STATE_UNDERSTOOD=...
    NEXT_ACTION_UNDERSTOOD=...
    DO_NOT_REDO=...
    BLOCKER=NONE 或准确阻断
    READY=TRUE/FALSE；TRUE 时本轮直接执行 NEXT_ACTION

胶囊只传当前角色所需事实，不粘贴旧聊天、完整日志或背景故事。
