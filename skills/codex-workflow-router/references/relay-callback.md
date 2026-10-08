# 共享回包生成与发送前校验

本适配器分别处理默认原生父子回包和用户明确启用的页面接力；先选择模式再使用对应分支，不改变真实授权、批准、单次回包与防重复要求。01–05 只在准备回包时加载。

## 原生父子模式（默认）

先按当前派单确定传输模式；用户没有明确开启页面接力时一律使用本节。本节不调用下文页面适配脚本，不要求页面 UUID、RELAY_ID、活动页登记或 send_message_to_thread。

- 派单必须给出 PROJECT_ID、MILESTONE_ID、DISPATCH_ID、角色、CONTRACT_REVISION、精确直接父级 RETURN_TARGET、必要输入/允许范围、结果分支和累计预算；真实工程另保留当前主 RUN 与已核对的批准状态。专项助手保留其直接父角色和更窄权限。
- 角色只通过一次 final 返回直接父级；包含原 DISPATCH_ID、角色、合同 revision、实际改动/证据/验证层级、未验证/阻断、累计修正次数与剩余预算、MCP 三字段和进程两字段。适用的执行/审查/验证 revision 和批准链沿用真实证据。可以建议 NEXT_ROLE，由父任务决定派发；不向同级角色或用户页面发送业务消息。
- 父任务核对实际工具来源、DISPATCH_ID、预期角色/项目/revision、权限、证据与预算，再统一收口。消费过、被取代、重复或错来源回包不能推进。final 已自然回到父级时不再 send_message 复制一份结果。
- 硬停也只返回当前精确父级，保留真实原因和 UNKNOWN。父级无法确定时在当前回包说明未知，不猜页面、不广播。
- 长上下文接续先返回 CONTINUATION_CHECKPOINT 并停稳。父级保存目标、合同、已完成/未完成、文件/证据、权限、累计失败/剩余预算及资源清理状态，再以新 DISPATCH_ID 和 CONTINUES_DISPATCH_ID 派新的同名实例，优先最小上下文、不复制完整历史。合同、主 RUN、授权和预算不重置；未暴露生命周期工具时不承诺旧实例已删除或名额已释放。
- 专业角色配置保持 default；未暴露服务层只记 UNKNOWN 并在没有相反证据时继续，观察到明确冲突或拒绝才停止。不以配置冒充运行态非 Fast 证明。

以下所有页面 UUID、RELAY_ID、脚本和发送步骤仅在用户明确启用页面式阶段接力时适用。

## 页面模式：唯一数据源与格式

使用 `{SKILLS_ROOT}/codex-workflow-router/scripts/relay-callback-guard.mjs`。它是无文件写入、无网络、无业务执行副作用的本地模块，不是宿主级工具拦截器。不要自行再写 `includes` 检查器、另一套字段别名表或手拼回包。

`prepareCallback({context, fields})` 生成并复验唯一 `{threadId, prompt}`；`validateRequest({context, request})` 检查最终发送对象与派发绑定；`parseCapsule` / `renderCapsule` 仅负责格式，不代表验证或放行。`parseLegacyCapsule` / `validateLegacyRequest` 是显式、只读的旧格式入口，不自动发送或消费 relay。

- `context` 来自当前原派发和已核对的活动合同，绝不能从待验证回包反向复制来让它通过。必须含 `PROJECT_ID`、`MILESTONE_ID`、`RELAY_ID`、当前精确 `ROLE`、`MASTER_RUN`、`HARD_STOP_RETURN_TO_THREAD_ID` 及固定 `RETURN_TO_THREAD_ID` 或下述 `routing`；硬停目标必须已经确认是当前 00。03 另含原派发的 `REVIEW_MODE=CONTRACT_REVIEW|IMPLEMENTATION_REVIEW|DIAGNOSIS_REVIEW`。
- `context.expected` 仅装应当与当前权威来源逐字相等的上游字段，不装这次尚未产生的测试结果。02/04 完成需 `EXECUTOR_KIND_ACTUAL`、`CONTRACT_REVISION_EXECUTED`、`APPROVAL_UPDATE_ID`、`APPROVAL_STATUS`；03 诊断评审不制造执行/实现审查/批准字段，返修链已有字段放入 expected 原样保留；03 合同前审仅需 `CONTRACT_REVISION_REVIEWED`，实现审查需保留执行四字段并加 `REVIEWED`；05 保留执行/审查链并加 `VALIDATED`。revision 的预期值从当前合同获得，实际值仍由执行证据独立提供。当前合同要求的 `APPROVED_RELAY_ID`、`USER_AUTHORIZATION_UPDATE_ID` 等额外绑定也放入 expected，不因不在最小列表而省略。
- 仅元数据补正派发须显式带 `CALLBACK_MODE=METADATA_CORRECTION`；执行方放入 context，并在 expected 中绑定原 `SOURCE_EXECUTION_RELAY_ID` 和原数值型 `FIX_CYCLES`，实际 fields 独立提供两者。源 relay 不得等于当前新 relay，补正本轮 `ACTUAL_CHANGES=NONE`、`VALIDATION_RESULT=NOT_RUN`；原业务修改、验收结果与层级通过源 relay / `SOURCE_EVIDENCE` 精确指针引用，不能再次宣称为本轮动作。接收方先识别模式，再读取原证据；不能仅凭沿用的业务 `RESULT_CODE` 推进。普通回包模式是 `STANDARD`，不能把补正伪装成标准业务执行；模式来自调度，不由执行方自选以绕门。
- `fields` 是当前事实，显式填 `CALLBACK_KIND`、`SERVICE_TIER_ACTUAL`、MCP 三字段、进程两字段、`ACTUAL_CHANGES`、`VALIDATION_LEVEL`、`VALIDATION_RESULT`、数值型 `FIX_CYCLES`、`FINDINGS_OR_RESOLUTION`、`UNKNOWN`、`UNEXECUTED`、`BLOCKER`、`RECOMMENDED_NEXT_GATE`、`RESULT_CODE`，以及适用的上述执行/审查链。02 另填 `VALIDATION_BUDGET_ACTUAL`、`EXPAND_TRIGGER`。未测试明确填 `NOT_RUN`，无修改明确填 `NONE`，服务层不明填 `unknown`；这些事实由当前角色确认，脚本不自动补 PASS、批准或测试结果。
- 项目/里程碑/relay/角色/主 RUN/主 Skill/唯一目标由 context 与 kind 生成；调用方若重复提供但值冲突则拒绝。`CALLBACK_STATUS`、`CALLBACK_TARGET` 不是标准字段；出站回包禁止混入 `TARGET_THREAD_ID`、`RETURN_TO_THREAD_ID`、`HARD_STOP_RETURN_TO_THREAD_ID`、`EXECUTOR_KIND` 等入站影子控制名。批准信息不能只塞进 `APPROVAL_CHAIN` 叙述来代替字段。03 合同前审正常结果只允许 `CONTRACT_APPROVED` 或 `CONTRACT_REVISION_REQUIRED`，硬停不受这两个正常结果限制。
- 输出仍为 `KEY=value` 胶囊，值用 JSON 标量转义，每行至多四字段、总计不超过 20 行；分号、换行、引号和 Windows 路径在值内保真，不会冒充新的控制字段。额外大写下划线事实字段可保留，长证据改用精确指针。接收方按结构解析，不凭正文中的 `includes` 判断完整性。

## 结果分支与直接接力

新派发默认由 00 在合同中预设允许分支，后续角色沿用并按自己的角色/模式取子集。context.routing 的结构为：

~~~javascript
routing: {
  roles: { '00·总监': '<已确认UUID>', '01·诊断': '<已确认UUID>', '03·审查': '<已确认UUID>' },
  onResult: { DIAGNOSIS_COMPLETE: '03·审查', DIRECTOR_DECISION_REQUIRED: '00·总监' },
  retryUsed: 0,
  retryLimit: 2
}
~~~

roles 只收录本合同已确认的活动页且含来源角色与 00；onResult 是该阶段允许的结果码与下一角色。不能根据回包自行添加目标来通过校验。脚本按真实 RESULT_CODE 选定 CALLBACK_TARGET_THREAD_ID/ROLE，并计算 RELAY_RETRIES_USED；调用者重复提供这些字段时必须完全一致。补诊与实现审查/验证退回 04 共用 retryLimit，预算耗尽拒绝继续返修，但 HARD_STOP 仍能发给已确认 00。该计数不替代 FIX_CYCLES 页内修正预算。

03 DIAGNOSIS_REVIEW 使用 DIAGNOSIS_ACCEPTED、DIAGNOSIS_INCOMPLETE 或 DIRECTOR_DECISION_REQUIRED。只有从当前控制块确认同一范围与执行角色已经获准，才可在原派发 routing 中设置 implementationAuthorized=true 并允许转 02/04；该布尔值不是批准证据，接收执行角色仍检查真实控制块。CONTRACT_REVIEW 的批准/要求修订永远回 00；METADATA_CORRECTION 仍绑定固定原返回页，不选择业务分支。

发送后对方先核对合同、活动页、来源回执、已消费状态和累计预算，从原合同的角色分支建立新的唯一阶段 RELAY_ID/context，保留上一条的来源与证据。下一阶段 retryUsed 必须等于本次实际 RELAY_RETRIES_USED，不能从旧模板重新填 0；页内 FIX_CYCLES 也按实际问题包保留。FINDINGS_OR_RESOLUTION 给证据入口，RECOMMENDED_NEXT_GATE 写清选择理由、下一任务及完成条件，不能仅填“请继续”。无新的裁决事项不抄送总监。

旧在途 context 没有 routing 时保留原固定目标，不从新规则推断已授权分支；下一次真实派发再由调度方结合当前权限采用新结构。模块不读取活动页登记、不判定根因、不自动批准、不持久计数或发消息；这些仍由实际派发/接收角色核对。

## 准备后原样发送一次

优先通过实际可调用的本地 Node MCP 导入模块，无需安装 Node 包或开后台服务。模块无 `process` 依赖。下面为代码模式桥接模式；`input` 替换为本轮已经核对的 `{context,fields}` JSON 对象，不是把示例值当事实：

```javascript
const input = /* 本轮已核对的 context 与事实 fields */;
const prepared = await tools.mcp__node_repl__js({
  code: `var callbackGuard = await import('{SKILLS_ROOT_URI}/codex-workflow-router/scripts/relay-callback-guard.mjs?v=20260917-r2'); var callbackRequest = callbackGuard.prepareCallback(${JSON.stringify(input)}); nodeRepl.write(JSON.stringify(callbackRequest));`,
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

- `CALLBACK_RETRY_EXHAUSTED`：共用退回预算耗尽。保留累计和未解问题，只回已确认总监请求具体方案裁决，不修改 context 上限或换页重试；这不是普通格式错误。
- `CALLBACK_FORMAT_INVALID`：在本角色内补正缺字段、标准键名或标量类型，用仍然有效的已执行证据重新生成；格式补正不增加 `FIX_CYCLES`、业务合同 revision 或修复轮次，不重测、不重启、不动数据库。不知道的实质内容不能靠换字段名造出来。
- `CALLBACK_CONTEXT_CONFLICT/INVALID`：先只核对当前原派发和活动控制块。若只是录入笔误且原始证据唯一，可在本页改回证据值；若真实身份、来源、批准或 revision 冲突/未知，则按原协议硬停回 00，不自动把输入改成期望值。
- `HARD_STOP` 不要求已批准或已执行：保留实际冲突值、`UNKNOWN` 与适用的 `NOT_RUN`，必须有实际 `BLOCKER`，只允许发给已经确认的 00。接单时 context 的 project/milestone/relay/master run 缺失、空白、null 或类型无效，均显式为 `UNKNOWN`，只作告警，不作为可消费完成回包；非空冲突文本保留。硬停目标本身不明时不猜、不广播，只在当前页报告阻断。
- 00 和各接收角色继续核对当前项目、预期 relay/来源角色、批准台账、revision、消费状态和实际来源页。结构校验通过不证明事实真实，也不证明 relay 未消费；`HARD_STOP` 永远不推进正常链。
- 对已在途的旧版 `KEY=未加引号值` 胶囊，不仅因为序列化方式不同而拒收。明确识别历史格式后，调用 `validateLegacyRequest({context,request})`，request 必须来自原实际发送回执；它只接受唯一键、无别名、值内无分号/换行的无歧义旧格式，并走同一语义校验。不能在规范格式校验失败后自动降级到 legacy。旧包缺少当前完整字段或值本身含分隔符时，返回有界证据核对，不凭解析失败新增工程失败或重跑；只读核对原派发、原发送回执和当前证据后按原协议处理，仍不得猜别名/目标、补造批准或绕过防重门。
- 已经发送且被拒的回包不能沿已消费 relay 自行再发一次。只有当前调度方明确下发 `CALLBACK_MODE=METADATA_CORRECTION` 时，才使用它给出的新技术 `RELAY_ID`，并按前述绑定原 `SOURCE_EXECUTION_RELAY_ID` 和修复次数；原业务 `MILESTONE_ID`/合同 revision 不变。补正方不伪装调度方、不自造派发，不把元数据补正记成新的工程执行或验收。
- 工具调用失败或结果未知时，按原协议记录 `RELAY_CALLBACK_FAILED` 并结束，不因本地校验成功而报“已同步”，不自动重发。脚本不提供持久幂等状态，也不会在旧任务中自动热加载；现有运行页须在下一次派发/回包时读取本适配器。
