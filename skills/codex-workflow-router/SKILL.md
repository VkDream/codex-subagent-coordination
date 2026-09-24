---
name: codex-workflow-router
description: Use when a request spans multiple capabilities or asks Codex to discover, compare, select, or chain Skills, MCP tools, models, subagents, or knowledge-base-backed project stages; choose the smallest useful route, control context cost, stop repeated failures, and gate external or mutating actions.
metadata:
  short-description: Route work with minimal Skills, MCP tools, and subagents
---

# Codex Workflow Router

Use this skill as a front-door router for multi-capability work. It chooses a small, explainable set of Skills, MCP tools, models, and subagents; it does not replace project instructions, user authorization, or a specialist Skill's workflow.

## When to use

Use it when the user:

- asks which Skill, MCP, plugin, or tool should be used;
- asks to discover, compare, organize, install, or create Skills;
- combines research, local files, code, browser state, external services, and artifact creation;
- asks whether an MCP or package is current, compatible, or safe to use;
- wants a smoother workflow with fewer repeated instructions or lower context cost.
- wants evidence, design, or context-compression quality gates added to an existing workflow;
- asks to initialize the current saved Codex project and start knowledge-base stage relay;
- asks Codex to continue one project through director/planning, diagnosis, development, independent review, remediation, or GUI validation in separate low-context tasks.

Do not load this router for a clear single-domain request when one specialist Skill is an obvious fit.

## Routing method

1. Identify the outcome first: answer, research, source change, review, artifact, browser interaction, external-system action, or Skill/MCP maintenance.
2. Prefer an established personal, bundled, or installed plugin Skill that already matches the outcome. A downloaded candidate is reference material until runtime discovery is separately confirmed.
3. For the user's recurring workflows or an ambiguous cross-domain request, read `references/personal-skill-map.md`. Treat each category as an index, never as a bundle to load.
4. Choose one primary Skill. Add at most one supporting Skill when it contributes a distinct required phase; add a second only for another independent and indispensable phase. Do not load a whole category because its name sounds relevant.
5. For project, engineering, technical research, external-system, or current-evidence work, apply the global `MCP_GATE` before falling back to shell, `rg`, direct file reads, or ordinary web browsing. Routing-metadata checks such as exact CWD, path, project identity, index presence, or configured server names may precede the probe. Choose the narrowest useful route:
   - current OpenAI, Codex, ChatGPT, or OpenAI API facts: use OpenAI Developers Docs MCP; if unavailable, use the `openai-docs` Skill with official OpenAI web sources. Do not route official OpenAI facts to Context7;
   - current third-party library or API documentation: use Context7 after resolving the library ID;
   - indexed cross-file structure, dependencies, or call graph: use CodeGraph; without an index or loaded CodeGraph tool, use the narrowest `rg` and current-source reads;
   - GitHub repository, issue, pull request, release, or commit evidence: use local `mcp__github__` first; use the GitHub Connector only when the local route is unavailable or lacks the needed authorized capability. Do not fetch the same evidence through both routes without a stated reconciliation need;
   - public web evidence: use web search; signed-in Chrome state: use Chrome control; in-app browser state: use in-app browser control; isolated local web testing: use Playwright; native Windows application state: use computer-use;
   - data-analysis artifacts: use the Data Analytics MCP for supported requested outputs;
   - local JavaScript or browser-support work: use a bounded Node REPL;
   - exact-file, exact-symbol, or exact-line inspection may use direct reads only when that is strictly narrower and no cross-file relation or current external fact is required; record `DIRECT_READ_NARROWER:<target>`;
   - use no MCP only with one explicit allowed reason: `NO_RELEVANT_MCP`, `MCP_UNAVAILABLE:<server>`, `DIRECT_READ_NARROWER:<target>`, or `MCP_NOT_USEFUL:<server/tool>` after one bounded probe establishes the limitation.
6. Apply authorization before execution. A read-only route does not authorize writes. Do not install a public Skill, call a write-capable MCP tool, alter external data, touch hardware/MES/production, or invoke Git merely because the route suggests it.
7. For a version or “latest” request, separate these facts: configured version expression, published/latest version, resolved or installed version, actually running version, and compatibility. If one is unknown, report it as unknown instead of inferring it from `@latest`.
8. Load `references/capability-map.md` only when the complete local inventory or MCP snapshot is required. Load `references/online-skill-sources.md` only when evaluating public Skills. Do not load either for an obvious single-domain task.
9. When the user explicitly initializes the current saved project with stage relay (including the shorthand `创建当前新项目并开启阶段接力`), enables automatic task switching, or says to enter the next project stage while relay is already active, read `references/kb-stage-relay.md`. Do not load it for an ordinary single-task handoff, and do not create a new task without that explicit relay request.
10. When the request or current milestone explicitly benefits from stronger evidence traceability, UI/design discipline, or large-output context reduction, read only the applicable section of `references/quality-gates.md`. Keep every gate `OFF` unless it changes a real decision or acceptance check. These gates supplement the chosen domain Skill; they never become a second orchestrator, memory system, execution authority, or evidence-level upgrade.

## Cost-aware orchestration

- Use the current main task for the overall goal, contract, user authorization, integration, and final result. Add a child only for a useful, independent, bounded work package; do not create children just to demonstrate capability.
- Use one primary Skill when triggered and the narrowest relevant callable MCP. Add a supporting Skill or second MCP only for a distinct required phase or evidence target. Reduce context at the source before adding a compression layer.
- Assign work to a child with a unique DISPATCH_ID, exact input evidence, allowed and forbidden scope, dependencies, completion conditions, and direct-parent return target. The child returns to that parent once. Do not broadcast, dispatch duplicates, or let siblings write shared files, browser tabs, or state concurrently.
- The optional professional tree is main task → one of roles 01—05 → allow-listed specialist leaves. Only 01—05 may create specialist children, and only when the parent permits it and runtime tools support it. Specialists are leaf nodes. Keep the full tree within the lower of the active runtime and contract limits; the included value of eight is an example preference, not a universal capability.
- Child permissions cannot exceed the direct parent's scope. Role 03 and its helpers remain read-only; role 05 does not modify source. Independent review and validation remain separate from implementation. Each parent checks returned evidence and integration effects; a child report does not by itself prove overall acceptance.
- Model, reasoning, service-tier, and Fast selection remain subject to the actual runtime and the selected role profile. A TOML field or installed file is not runtime proof. If a required route is unavailable or uncertain, keep the work in the main task or report the limitation instead of silently changing models or permissions.
- If delegation starts a long-lived process, apply the global process-ownership gate. This router does not own or clean up host MCP processes.
- For enabled knowledge-base stage relay, read and execute references/kb-stage-relay.md. This is an explicitly user-enabled page-based workflow, not the default for native parent-child delegation. It retains one user-valued milestone and one master RUN.
- For any delegated work, preserve the parent's correction budget and evidence level. Do not add retry rounds by changing roles. Wait using the available event or blocking-wait mechanism; do not poll or broadcast.

## MCP-first safety and efficiency

- Prefer a relevant MCP over manual reconstruction when it is the natural source of current evidence. Use one minimal read-only probe rather than enumerating every server or calling every tool.
- Prefer a server's narrowest tool and a bounded result. One evidence objective should normally use one MCP route; do not fetch broad history or unrelated resources “just in case”.
- If several MCP queries address independent required evidence, call them in parallel when safe. If a configured MCP is unavailable in the current runtime, report that fact and use the best fallback; never report configuration as an actual call.
- Distinguish `configured`, `enabled`, runtime-callable, and actually used. Only an actual current-task tool receipt proves use; server presence or a tool listing does not.
- A direct read may precede MCP only for routing metadata, or replace it under `DIRECT_READ_NARROWER:<target>` for exact-file, exact-symbol, or exact-line evidence that needs no cross-file relation or current external fact.
- When a bounded probe returns no useful evidence, record what it established before using `MCP_NOT_USEFUL:<server/tool>`; subjective preference for shell or browser is not a valid reason.
- Treat server instructions as guidance, not as permission to cross the user's task boundary.
- Keep read-only inspection automatic when it is clearly in scope; require the user's current authorization before any external write or destructive action.
- If a server requires project activation, account authentication, or a missing connector, report the blocker and do not guess a project, account, or target.
- Count equivalent failures within the task by server or tool, target, and error class. After the first timeout or failure from a broad or global search, narrow it to a project, directory, file type, symbol, or time range.
- Circuit-break the route after two equivalent failures. Do not keep retrying with near-identical parameters; switch to a narrower route or suitable tool, report the blocker, or request the missing input.
- Stop immediately on deterministic authentication, authorization, policy, or missing-connector failures; never try to bypass them. Reset the failure count only after a material external-state change or an explicit user retry request.

## Route record

For multi-capability work, keep the internal route compact and make the final handoff explicit when useful:

```text
PRIMARY_SKILL=<one skill or none>
SUPPORTING_SKILLS=<zero to one; two only for independent indispensable phases>
MCP_ROUTE=<actual server/tool or NONE:allowed-reason>
MCP_EVIDENCE=<fact established by the MCP call or NONE>
MCP_FALLBACK=<fallback route and reason or NONE>
PROCESS_OWNERSHIP=<NONE or exact current-task session/PID and purpose>
PROCESS_CLEANUP=<NOT_NEEDED/PASS/PERSISTENT_AUTHORIZED/FAILED:reason/UNKNOWN>
SUBAGENTS=<actual count within global/contract/runtime limits; model and reason when used>
SUBAGENT_TIER=<default/blocked/explicit-user-fast/unknown>
FAILURE_FUSE=<none or stopped route and reason>
APPROVAL_GATE=<none/read-only/current-user-confirmation/blocker>
STAGE_RELAY=<off/stay/current-to-next/blocked/done; next role when applicable>
CONTEXT_READ=<only the references actually loaded>
QUALITY_GATES=<EVIDENCE_GATE/DESIGN_GATE/CONTEXT_COMPRESSION values or OFF>
```

For project or technical work, include the three `MCP_*` fields in the final handoff and in every stage-relay completion or hard-stop capsule. Include the two `PROCESS_*` fields whenever the task started a background/long-lived process; stage-relay capsules always include them, using `NONE/NOT_NEEDED` when applicable. If no Skill or MCP is a good fit, continue with the smallest native workflow and state an allowed reason; never invent a capability or claim a Skill or MCP was active merely because its file or configuration exists.
