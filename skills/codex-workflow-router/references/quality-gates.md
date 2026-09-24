# Optional Workflow Quality Gates

Read only the gate selected by the current request or milestone. These gates refine evidence, design, and context handling without replacing project rules, the primary domain Skill, the six-role relay, or current authorization.

## Selector

Use these exact values when a durable contract benefits from an explicit gate:

```text
EVIDENCE_GATE=OFF | CLAIM_SOURCE_LOCATOR
DESIGN_GATE=OFF | WEB_AUDIT | WEB_BUILD | INDUSTRIAL_WPF
CONTEXT_COMPRESSION=OFF | SIMULATION | MCP_ON_DEMAND
```

Default every gate to `OFF`. Activate the smallest useful gate. A gate may add acceptance checks but cannot authorize an install, external write, proxy, MCP registration, GUI, hardware, release, production action, or a higher evidence claim.

## Evidence gate: CLAIM_SOURCE_LOCATOR

Use for source-sensitive research, external technical claims, publication facts, precise versions or numbers, and disputed conclusions. Do not impose it mechanically on ordinary local code edits or facts already proven by current physical evidence.

Minimum record for each decision-driving external claim:

```text
CLAIM_ID=<stable local id>
CLAIM=<exact proposition being judged>
SOURCE=<primary source or best available source>
LOCATOR=<page/section/table/heading/file anchor>
SOURCE_DATE_OR_RETRIEVED_AT=<date or timestamp>
SUPPORT_STATUS=CONFIRMED | PARTIAL | CONFLICT | UNKNOWN
```

Rules:

- Judge source authenticity and claim support separately. A real source can fail to support the wording attributed to it.
- Keep coverage explicit: searched, inaccessible, not searched, conflicting, and superseded are different states.
- Prefer current owning sources; use secondary sources for discovery or labelled context.
- In engineering, keep static, build, automated, GUI, DLL, NoHardware, hardware, release, security, and production evidence separate. Literature does not promote an engineering validation layer.
- Do not create a second orchestrator, hidden memory tree, routine reading note, hash manifest, or report for every file. Use hashes only for a real freeze, release, transfer identity, tamper risk, or explicit request.
- Surface unresolved `PARTIAL`, `CONFLICT`, and `UNKNOWN` rows that could change the decision.

## Design gate

Choose exactly one mode for the affected deliverable.

### WEB_AUDIT

Use the available Product Design audit route for a current URL, screenshot, or built flow. Evaluate hierarchy, task clarity, responsive behavior, accessibility, interaction states, consistency, and obvious template-like or decorative UI that weakens the task. A screenshot alone is not interaction proof.

### WEB_BUILD

Use the available Product Design build/image-to-code/url-to-code route that matches the input. Freeze a compact design contract before broad implementation:

- primary user and task;
- hierarchy and high-frequency actions;
- semantic color/type/spacing system;
- loading, empty, error, permission, disabled, selected, and success states as applicable;
- keyboard/focus/contrast and responsive targets;
- same-size visual comparison plus functional validation.

Do not load several overlapping public design Skills. Hallmark and UI/UX Pro Max remain reference candidates unless their installation and runtime discovery are separately authorized and confirmed. For a reference URL/screenshot, prefer one audit/study route; for a new web system, prefer one build/system route.

### INDUSTRIAL_WPF

Use `wpf-industrial-ui-design` as the primary Skill. Preserve operator task density, alarm/status hierarchy, command ownership, permissions, offline/fault/recovery states, localization, DPI assumptions, keyboard/touch operation, and project evidence boundaries. Generic web aesthetics cannot replace or override those contracts.

Across all modes, polished visuals never prove backend capability, device readiness, release readiness, or user acceptance.

## Context compression gate

First reduce context at the source: make the query narrower, cap the result, preserve stable anchors, and avoid rereading. Consider compression only for large, repetitive output where this is insufficient. Initial routing heuristics such as roughly 8,000-10,000 tokens or more than 200 repetitive log/JSON rows are evaluation triggers, not universal thresholds.

Candidate inputs:

- repetitive JSON arrays or database rows;
- verbose build/test logs after the exact failure is preserved;
- broad search or retrieval results;
- duplicated RAG/context blocks.

Never compress as the working authority:

- current contracts, master RUNs, relay/continuation capsules, or approval boundaries;
- source code, patches, exact diffs, public interfaces, or serialization contracts;
- exact error strings, result codes, paths, line numbers, or critical call-chain evidence;
- security, release, hardware, safety, MES, production, or destructive-action evidence;
- already compact results.

### SIMULATION

Use an isolated environment and representative sanitized samples. Do not call an LLM, alter Codex/Claude/OpenCode configuration, register an MCP, start a proxy, or enable persistent memory/learning. Preserve the original sample outside the compressed result.

Pass only when all are true:

- weighted average token savings are at least 15%;
- every declared critical marker remains present in the optimized messages;
- no tool-call/tool-result pairing is broken;
- every input kind is on the allowlist and every denied evidence kind is rejected;
- package/version, latency, errors, and platform workarounds are recorded.

Isolation uses a clean allowlist: snapshot and clear all inherited `HEADROOM_*` variables before import, set only the simulation-specific temporary paths/stateless/CCR choices, then restore the caller's environment. Do not let a shell-level model, savings, TOIN, subscription, or future Headroom path override silently change the result.

Use `../scripts/headroom_offline_eval.py` when the Python package is available in an isolated environment. Its result proves only the supplied offline samples.

The input is UTF-8 JSON with a non-empty `cases` array. Each case needs `name`, an allowlisted `kind`, `content`, and one or more `critical_markers` that already occur in that content. The evaluator verifies each marker only inside the matching optimized tool-result message; a copy in the user query or another message cannot satisfy the gate. It rejects an empty marker list, unknown/denied kinds, malformed or duplicated tool pairs, and a non-numeric savings threshold.

### MCP_ON_DEMAND

This state requires a separately authorized and completed simulation on representative data. Register only the MCP tools needed for on-demand compression/retrieval; do not enable the transparent proxy or wrapper as a side effect. The router must enforce the allowlist before a call and must retain the original/retrieval handle.

If the MCP tool is unavailable, report `MCP_UNAVAILABLE:Headroom`; package installation or configuration is not proof that Codex can call it. Re-check current official documentation and the installed version before activation.

### Optional Headroom evaluation note

Optional setup, side effects, and evidence limits are described in `headroom-offline-evaluation.md`. This sharing package contains no prior environment's evaluation result. Re-check official documentation and runtime dependencies before any authorized evaluation or activation.

## Review and closeout

Review the activated gate independently from implementation intent:

- evidence: can another reviewer locate and judge every material claim?
- design: are required states and functional constraints present, not just visual polish?
- compression: are savings weighted correctly and all critical markers preserved?

Report each gate as `OFF`, `PASS` at the exact tested layer, `PARTIAL`, or `BLOCKED`. Never combine three partial gates into an overall PASS.
