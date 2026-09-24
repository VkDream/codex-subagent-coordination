# 共享回包生成与发送前校验

本适配器落实 `kb-stage-relay.md` 的回传协议，不改变接单授权、真实批准台账、角色状态机、单次发送或防重复规则。01–05 只在准备回包时加载，不作为每次工程动作的额外门。

## 唯一数据源与格式

使用 `{SKILLS_ROOT}/codex-workflow-router/scripts/relay-callback-guard.mjs`。它是无文件写入、无网络、无业务执行副作用的本地模块，不是宿主级工具拦截器。不要自行再写 `includes` 检查器、另一套字段别名表或手拼回包。

`prepareCallback({context, fields})` 生成并复验唯一 `{threadId, prompt}`；`validateRequest({context, request})` 检查最终发送对象与派发绑定；`parseCapsule` / `renderCapsule` 仅负责格式，不代表验证或放行。`parseLegacyCapsule` / `validateLegacyRequest` 是显式、只读的旧格式入口，不自动发送或消费 relay。

- `context` 来自当前原派发和已核对的活动合同，绝不能从待验证回包反向复制来让它通过。必须含 `PROJECT_ID`、`MILESTONE_ID`、`RELAY_ID`、当前精确 `ROLE`、`MASTER_RUN`、`RETURN_TO_THREAD_ID`、`HARD_STOP_RETURN_TO_THREAD_ID`；后者必须已经确认是当前 00。03 另含原派发的 `REVIEW_MODE=CONTRACT_REVIEW|IMPLEMENTATION_REVIEW`。
- `context.expected` 仅装应当与当前权威来源逐字相等的上游字段，不装这次尚未产生的测试结果。02/04 完成需 `EXECUTOR_KIND_ACTUAL`、`CONTRACT_REVISION_EXECUTED`、`APPROVAL_UPDATE_ID`、`APPROVAL_STATUS`；03 合同前审仅需 `CONTRACT_REVISION_REVIEWED`，实现审查需保留执行四字段并加 `REVIEWED`；05 保留执行/审查链并加 `VALIDATED`。revision 的预期值从当前合同获得，实际值仍由执行证据独立提供。当前合同要求的 `APPROVED_RELAY_ID`、`USER_AUTHORIZATION_UPDATE_ID` 等额外绑定也放入 expected，不因不在最小列表而省略。
- 仅元数据补正派发须显式带 `CALLBACK_MODE=METADATA_CORRECTION`；执行方放入 context，并在 expected 中绑定原 `SOURCE_EXECUTION_RELAY_ID` 和原数值型 `FIX_CYCLES`，实际 fields 独立提供两者。源 relay 不得等于当前新 relay，补正本轮 `ACTUAL_CHANGES=NONE`、`VALIDATION_RESULT=NOT_RUN`；原业务修改、验收结果与层级通过源 relay / `SOURCE_EVIDENCE` 精确指针引用，不能再次宣称为本轮动作。接收方先识别模式，再读取原证据；不能仅凭沿用的业务 `RESULT_CODE` 推进。普通回包模式是 `STANDARD`，不能把补正伪装成标准业务执行；模式来自调度，不由执行方自选以绕门。
- `fields` 是当前事实，显式填 `CALLBACK_KIND`、`SERVICE_TIER_ACTUAL`、MCP 三字段、进程两字段、`ACTUAL_CHANGES`、`VALIDATION_LEVEL`、`VALIDATION_RESULT`、数值型 `FIX_CYCLES`、`FINDINGS_OR_RESOLUTION`、`UNKNOWN`、`UNEXECUTED`、`BLOCKER`、`RECOMMENDED_NEXT_GATE`、`RESULT_CODE`，以及适用的上述执行/审查链。02 另填 `VALIDATION_BUDGET_ACTUAL`、`EXPAND_TRIGGER`。未测试明确填 `NOT_RUN`，无修改明确填 `NONE`，服务层不明填 `unknown`；这些事实由当前角色确认，脚本不自动补 PASS、批准或测试结果。
- 项目/里程碑/relay/角色/主 RUN/主 Skill/唯一目标由 context 与 kind 生成；调用方若重复提供但值冲突则拒绝。`CALLBACK_STATUS`、`CALLBACK_TARGET` 不是标准字段；出站回包禁止混入 `TARGET_THREAD_ID`、`RETURN_TO_THREAD_ID`、`HARD_STOP_RETURN_TO_THREAD_ID`、`EXECUTOR_KIND` 等入站影子控制名。批准信息不能只塞进 `APPROVAL_CHAIN` 叙述来代替字段。03 合同前审正常结果只允许 `CONTRACT_APPROVED` 或 `CONTRACT_REVISION_REQUIRED`，硬停不受这两个正常结果限制。
- 输出仍为 `KEY=value` 胶囊，值用 JSON 标量转义，每行至多四字段、总计不超过 20 行；分号、换行、引号和 Windows 路径在值内保真，不会冒充新的控制字段。额外大写下划线事实字段可保留，长证据改用精确指针。接收方按结构解析，不凭正文中的 `includes` 判断完整性。

## 准备后原样发送一次

优先通过实际可调用的本地 Node MCP 导入模块，无需安装 Node 包或开后台服务。模块无 `process` 依赖。下面为代码模式桥接模式；`input` 替换为本轮已经核对的 `{context,fields}` JSON 对象，不是把示例值当事实：

```javascript
const input = /* 本轮已核对的 context 与事实 fields */;
const prepared = await tools.mcp__node_repl__js({
  code: `var callbackGuard = await import('{SKILLS_ROOT_URI}/codex-workflow-router/scripts/relay-callback-guard.mjs?v=20260905-r1'); var callbackRequest = callbackGuard.prepareCallback(${JSON.stringify(input)}); nodeRepl.write(JSON.stringify(callbackRequest));`,
  title: '生成并校验本次唯一回包'
});
if (prepared.isError) throw new Error('回包预检失败；尚未发送');
const chunks = prepared.content.filter(x => x.type === 'text');
if (chunks.length !== 1) throw new Error('预检返回不唯一；尚未发送');
const request = JSON.parse(chunks[0].text);
if (!request || Object.keys(request).sort().join(',') !== 'prompt,threadId' ||
    typeof request.prompt !== 'string' || typeof request.threadId !== 'string') {
  throw new Error('预检返回无效；尚未发送');
}
// 只传预检返回的同一个对象；不重新拼 prompt/目标，不添加 model/thinking。
const receipt = await tools.mcp__codex_app__send_message_to_thread(request);
text(receipt);
// 依据 receipt 区分成功、失败或 UNKNOWN，随后立即结束；不得自动重试。
```

脚本刚更新而同一 Node 会话已 import 旧版本时，先改 import URL 的有界版本 query 再验证，不声称文件更新自动刷新已缓存模块。Node MCP 不可用时按 MCP 门做一次允许的有界本地运行回退；无可执行环境则报告回包工具阻断，不升级/安装运行时、不重跑业务。不得把“能 import”或“生成成功”当成消息已发送。

## 错误处理与接收兼容

- `CALLBACK_FORMAT_INVALID`：在本角色内补正缺字段、标准键名或标量类型，用仍然有效的已执行证据重新生成；格式补正不增加 `FIX_CYCLES`、业务合同 revision 或修复轮次，不重测、不重启、不动数据库。不知道的实质内容不能靠换字段名造出来。
- `CALLBACK_CONTEXT_CONFLICT/INVALID`：先只核对当前原派发和活动控制块。若只是录入笔误且原始证据唯一，可在本页改回证据值；若真实身份、来源、批准或 revision 冲突/未知，则按原协议硬停回 00，不自动把输入改成期望值。
- `HARD_STOP` 不要求已批准或已执行：保留实际冲突值、`UNKNOWN` 与适用的 `NOT_RUN`，必须有实际 `BLOCKER`，只允许发给已经确认的 00。接单时 context 的 project/milestone/relay/master run 缺失、空白、null 或类型无效，均显式为 `UNKNOWN`，只作告警，不作为可消费完成回包；非空冲突文本保留。硬停目标本身不明时不猜、不广播，只在当前页报告阻断。
- 00 和各接收角色继续核对当前项目、预期 relay/来源角色、批准台账、revision、消费状态和实际来源页。结构校验通过不证明事实真实，也不证明 relay 未消费；`HARD_STOP` 永远不推进正常链。
- 对已在途的旧版 `KEY=未加引号值` 胶囊，不仅因为序列化方式不同而拒收。明确识别历史格式后，调用 `validateLegacyRequest({context,request})`，request 必须来自原实际发送回执；它只接受唯一键、无别名、值内无分号/换行的无歧义旧格式，并走同一语义校验。不能在规范格式校验失败后自动降级到 legacy。旧包缺少当前完整字段或值本身含分隔符时，返回有界证据核对，不凭解析失败新增工程失败或重跑；只读核对原派发、原发送回执和当前证据后按原协议处理，仍不得猜别名/目标、补造批准或绕过防重门。
- 已经发送且被拒的回包不能沿已消费 relay 自行再发一次。只有当前调度方明确下发 `CALLBACK_MODE=METADATA_CORRECTION` 时，才使用它给出的新技术 `RELAY_ID`，并按前述绑定原 `SOURCE_EXECUTION_RELAY_ID` 和修复次数；原业务 `MILESTONE_ID`/合同 revision 不变。补正方不伪装调度方、不自造派发，不把元数据补正记成新的工程执行或验收。
- 工具调用失败或结果未知时，按原协议记录 `RELAY_CALLBACK_FAILED` 并结束，不因本地校验成功而报“已同步”，不自动重发。脚本不提供持久幂等状态，也不会在旧任务中自动热加载；现有运行页须在下一次派发/回包时读取本适配器。
