// Local, side-effect-free callback formatting gate. This does not grant authority,
// check the live approval ledger, send messages, or provide durable deduplication.
const SKILLS = Object.freeze({
  '01·诊断': 'kb-role-diagnosis', '02·开发': 'kb-role-development',
  '03·审查': 'kb-role-review', '04·修复': 'kb-role-remediation',
  '05·验证': 'kb-role-validation',
});
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const KEY = /^[A-Z][A-Z0-9_]*$/;
const ALIASES = new Set(['CALLBACK_STATUS', 'CALLBACK_TARGET', 'VALIDATED', 'SKILL',
  // Inbound dispatch routing cannot appear as a competing outbound route.
  'TARGET_THREAD_ID', 'RETURN_TO_THREAD_ID', 'HARD_STOP_RETURN_TO_THREAD_ID', 'EXECUTOR_KIND']);
const FACTS = ['SERVICE_TIER_ACTUAL', 'MCP_ROUTE', 'MCP_EVIDENCE', 'MCP_FALLBACK',
  'PROCESS_OWNERSHIP', 'PROCESS_CLEANUP', 'ACTUAL_CHANGES', 'VALIDATION_LEVEL',
  'VALIDATION_RESULT', 'FIX_CYCLES', 'FINDINGS_OR_RESOLUTION', 'UNKNOWN',
  'UNEXECUTED', 'BLOCKER', 'RECOMMENDED_NEXT_GATE', 'RESULT_CODE'];
const CHAIN = ['EXECUTOR_KIND_ACTUAL', 'CONTRACT_REVISION_EXECUTED',
  'APPROVAL_UPDATE_ID', 'APPROVAL_STATUS'];
const PLACEHOLDER = /^(?:UNKNOWN|NOT_RUN|N\/A|NONE|\.\.\.|待填|未知)$/i;

function reject(code, detail) {
  const error = new Error(`${code}: ${detail}`);
  error.code = code;
  throw error;
}
function record(value, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      ![Object.prototype, null].includes(Object.getPrototypeOf(value))) {
    reject('CALLBACK_FORMAT_INVALID', `${name} must be a plain object`);
  }
}
function textValue(value, name) {
  if (typeof value !== 'string' || !value.trim()) reject('CALLBACK_FORMAT_INVALID', `${name} missing/empty`);
}
function known(value, name) {
  textValue(value, name);
  if (PLACEHOLDER.test(value.trim())) reject('CALLBACK_CONTEXT_INVALID', `${name} must come from the dispatch/current contract`);
}
function exact(actual, expected, name) {
  if (actual !== expected) reject('CALLBACK_CONTEXT_CONFLICT', `${name} differs from the trusted context`);
}
function scalars(fields) {
  record(fields, 'fields');
  for (const [key, value] of Object.entries(fields)) {
    if (!KEY.test(key) || ALIASES.has(key)) reject('CALLBACK_FORMAT_INVALID', `noncanonical field ${key}`);
    if (typeof value === 'string') textValue(value, key);
    else if (typeof value !== 'number' || !Number.isFinite(value)) reject('CALLBACK_FORMAT_INVALID', `${key} must be a string or finite number`);
  }
}
function identity(context, kind) {
  record(context, 'context');
  if (!Object.hasOwn(SKILLS, context.ROLE)) reject('CALLBACK_CONTEXT_INVALID', 'ROLE must be an exact 01–05 role');
  const ids = {};
  for (const key of ['PROJECT_ID', 'MILESTONE_ID', 'RELAY_ID', 'MASTER_RUN']) {
    if (kind === 'HARD_STOP' && (typeof context[key] !== 'string' || !context[key].trim())) ids[key] = 'UNKNOWN';
    else { textValue(context[key], key); ids[key] = context[key]; }
    if (kind === 'COMPLETE') known(ids[key], key);
  }
  if (kind === 'COMPLETE' && !/^(?:[A-Za-z]:[\\/]|\\\\)/.test(ids.MASTER_RUN)) reject('CALLBACK_CONTEXT_INVALID', 'MASTER_RUN must be an absolute Windows path');
  // A rejected intake must still be able to report to the confirmed director even
  // when its normal return route is missing or corrupt.
  const routeKey = kind === 'HARD_STOP' ? 'HARD_STOP_RETURN_TO_THREAD_ID' : 'RETURN_TO_THREAD_ID';
  if (!UUID.test(context[routeKey] ?? '')) reject('CALLBACK_CONTEXT_INVALID', `${routeKey} must be an exact confirmed thread UUID`);
  if (context.ROLE === '03·审查' && kind === 'COMPLETE' &&
      !['CONTRACT_REVIEW', 'IMPLEMENTATION_REVIEW'].includes(context.REVIEW_MODE)) {
    reject('CALLBACK_CONTEXT_INVALID', '03 requires REVIEW_MODE from the dispatch');
  }
  const mode = context.CALLBACK_MODE ?? 'STANDARD';
  if (!['STANDARD', 'METADATA_CORRECTION'].includes(mode)) reject('CALLBACK_CONTEXT_INVALID', 'unknown CALLBACK_MODE');
  return {
    ...ids, ROLE: context.ROLE,
    PRIMARY_SKILL: SKILLS[context.ROLE], CALLBACK_KIND: kind,
    CALLBACK_MODE: mode,
    CALLBACK_TARGET_THREAD_ID: context[routeKey],
    ...(context.ROLE === '03·审查' && context.REVIEW_MODE ? {REVIEW_MODE: context.REVIEW_MODE} : {}),
  };
}
function chainKeys(context) {
  if (context.ROLE === '01·诊断') return [];
  if (context.ROLE === '03·审查' && context.REVIEW_MODE === 'CONTRACT_REVIEW') return ['CONTRACT_REVISION_REVIEWED'];
  return [...CHAIN,
    ...(['03·审查', '05·验证'].includes(context.ROLE) ? ['CONTRACT_REVISION_REVIEWED'] : []),
    ...(context.ROLE === '05·验证' ? ['CONTRACT_REVISION_VALIDATED'] : [])];
}
function check(context, fields) {
  scalars(fields);
  if (!['COMPLETE', 'HARD_STOP'].includes(fields.CALLBACK_KIND)) reject('CALLBACK_FORMAT_INVALID', 'CALLBACK_KIND must be COMPLETE or HARD_STOP');
  const bound = identity(context, fields.CALLBACK_KIND);
  for (const [key, value] of Object.entries(bound)) exact(fields[key], value, key);
  for (const key of FACTS) {
    if (key !== 'FIX_CYCLES') textValue(fields[key], key);
  }
  if (!Number.isSafeInteger(fields.FIX_CYCLES) || fields.FIX_CYCLES < 0) reject('CALLBACK_FORMAT_INVALID', 'FIX_CYCLES must be an explicit nonnegative integer');
  if (!['fast', 'default', 'unknown'].includes(fields.SERVICE_TIER_ACTUAL)) reject('CALLBACK_FORMAT_INVALID', 'SERVICE_TIER_ACTUAL must be fast/default/unknown');
  if (fields.PROCESS_OWNERSHIP === 'NONE' && fields.PROCESS_CLEANUP !== 'NOT_NEEDED') reject('CALLBACK_FORMAT_INVALID', 'no owned processes: PROCESS_CLEANUP must be NOT_NEEDED');
  if (fields.PROCESS_OWNERSHIP !== 'NONE' && !/^(?:PASS|PERSISTENT_AUTHORIZED|UNKNOWN|FAILED:.+)$/.test(fields.PROCESS_CLEANUP)) reject('CALLBACK_FORMAT_INVALID', 'owned/unknown processes require an explicit cleanup outcome');
  if (fields.CALLBACK_KIND === 'HARD_STOP') {
    if (/^(NONE|N\/A)$/i.test(fields.BLOCKER.trim())) reject('CALLBACK_FORMAT_INVALID', 'HARD_STOP requires an actual blocker');
    // Preserve unknown or conflicting upstream values as evidence. The existing
    // intake gate, not this formatting helper, determines whether work may start.
    return fields;
  }
  const expected = context.expected ?? {};
  scalars(expected);
  if (fields.CALLBACK_MODE === 'METADATA_CORRECTION') {
    known(expected.SOURCE_EXECUTION_RELAY_ID, 'context.expected.SOURCE_EXECUTION_RELAY_ID');
    textValue(fields.SOURCE_EXECUTION_RELAY_ID, 'SOURCE_EXECUTION_RELAY_ID');
    if (expected.SOURCE_EXECUTION_RELAY_ID === context.RELAY_ID) reject('CALLBACK_CONTEXT_CONFLICT', 'correction relay must differ from its source execution relay');
    if (!Number.isSafeInteger(expected.FIX_CYCLES) || expected.FIX_CYCLES < 0) reject('CALLBACK_CONTEXT_INVALID', 'metadata correction must bind the original FIX_CYCLES');
    if (fields.ACTUAL_CHANGES !== 'NONE' || fields.VALIDATION_RESULT !== 'NOT_RUN') reject('CALLBACK_CONTEXT_CONFLICT', 'metadata correction cannot claim new engineering changes or validation; reference source execution evidence');
  }
  for (const key of chainKeys(context)) {
    known(expected[key], `context.expected.${key}`);
    textValue(fields[key], key);
  }
  for (const [key, value] of Object.entries(expected)) {
    if (!Object.hasOwn(fields, key)) reject('CALLBACK_FORMAT_INVALID', `missing ${key}; never infer it from context.expected`);
    exact(fields[key], value, key);
  }
  const revisions = chainKeys(context).filter(key => key.startsWith('CONTRACT_REVISION_'));
  for (const key of revisions) {
    if (!/^R[0-9]+$/.test(fields[key])) reject('CALLBACK_CONTEXT_CONFLICT', `${key} must be an actual R<n> revision`);
    exact(fields[key], fields[revisions[0]], key);
  }
  if (chainKeys(context).includes('EXECUTOR_KIND_ACTUAL')) {
    if (!['INTERNAL_02', 'INTERNAL_04', 'EXTERNAL'].includes(fields.EXECUTOR_KIND_ACTUAL)) reject('CALLBACK_CONTEXT_CONFLICT', 'illegal executor source');
    if (context.ROLE === '02·开发') exact(fields.EXECUTOR_KIND_ACTUAL, 'INTERNAL_02', 'EXECUTOR_KIND_ACTUAL');
    if (context.ROLE === '04·修复') exact(fields.EXECUTOR_KIND_ACTUAL, 'INTERNAL_04', 'EXECUTOR_KIND_ACTUAL');
    if (!['APPROVED_ACTIVE', 'NOT_REQUIRED'].includes(fields.APPROVAL_STATUS)) reject('CALLBACK_CONTEXT_CONFLICT', 'illegal approval status');
    if (fields.APPROVAL_STATUS === 'NOT_REQUIRED') {
      if (fields.EXECUTOR_KIND_ACTUAL === 'EXTERNAL') reject('CALLBACK_CONTEXT_CONFLICT', 'external execution cannot skip prereview');
      exact(fields.APPROVAL_UPDATE_ID, 'NOT_REQUIRED', 'APPROVAL_UPDATE_ID');
    } else if (fields.APPROVAL_UPDATE_ID === 'NOT_REQUIRED') reject('CALLBACK_CONTEXT_CONFLICT', 'active approval cannot use NOT_REQUIRED');
  }
  if (context.ROLE === '02·开发') {
    if (!['FOCUSED', 'RISK_EXPANDED'].includes(fields.VALIDATION_BUDGET_ACTUAL)) reject('CALLBACK_FORMAT_INVALID', '02 requires VALIDATION_BUDGET_ACTUAL');
    textValue(fields.EXPAND_TRIGGER, 'EXPAND_TRIGGER');
  }
  if (context.ROLE === '03·审查' && context.REVIEW_MODE === 'CONTRACT_REVIEW' &&
      !['CONTRACT_APPROVED', 'CONTRACT_REVISION_REQUIRED'].includes(fields.RESULT_CODE)) {
    reject('CALLBACK_FORMAT_INVALID', 'contract review requires its canonical result code');
  }
  return fields;
}

// JSON scalar values keep semicolons, newlines, quotes, Unicode, and Windows
// paths inside evidence from becoming control fields. No substring matching.
export function renderCapsule(fields) {
  scalars(fields);
  const tokens = Object.entries(fields).map(([key, value]) => `${key}=${JSON.stringify(value)}`);
  const lines = [];
  for (let i = 0; i < tokens.length; i += 4) lines.push(tokens.slice(i, i + 4).join('；'));
  if (lines.length > 20) reject('CALLBACK_FORMAT_INVALID', 'capsule exceeds 20 lines; use precise evidence pointers');
  return lines.join('\n');
}

export function parseCapsule(prompt) {
  textValue(prompt, 'prompt');
  if (prompt.length > 65536 || prompt.split(/\r?\n/).length > 20) reject('CALLBACK_FORMAT_INVALID', 'capsule too large');
  const result = Object.create(null);
  const token = /([A-Z][A-Z0-9_]*)=("(?:[^"\\\r\n]|\\[^\r\n])*"|-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?)/y;
  let pos = 0;
  while (pos < prompt.length) {
    token.lastIndex = pos;
    const match = token.exec(prompt);
    if (!match) reject('CALLBACK_FORMAT_INVALID', `invalid canonical field near offset ${pos}`);
    if (Object.hasOwn(result, match[1])) reject('CALLBACK_FORMAT_INVALID', `duplicate field ${match[1]}`);
    try { result[match[1]] = JSON.parse(match[2]); }
    catch { reject('CALLBACK_FORMAT_INVALID', `invalid JSON scalar ${match[1]}`); }
    pos = token.lastIndex;
    if (pos === prompt.length) break;
    const separator = /^(?:；|;|\r?\n)/.exec(prompt.slice(pos));
    if (!separator) reject('CALLBACK_FORMAT_INVALID', `unexpected content near offset ${pos}`);
    pos += separator[0].length;
    if (pos === prompt.length) reject('CALLBACK_FORMAT_INVALID', 'trailing separator');
  }
  scalars(result);
  return result;
}

export function prepareCallback({context, fields}) {
  scalars(fields);
  if (!['COMPLETE', 'HARD_STOP'].includes(fields.CALLBACK_KIND)) reject('CALLBACK_FORMAT_INVALID', 'CALLBACK_KIND must be explicit');
  const bound = identity(context, fields.CALLBACK_KIND);
  for (const [key, value] of Object.entries(bound)) {
    if (Object.hasOwn(fields, key)) exact(fields[key], value, key);
  }
  const complete = {...bound, ...fields};
  check(context, complete);
  const request = Object.freeze({threadId: complete.CALLBACK_TARGET_THREAD_ID, prompt: renderCapsule(complete)});
  validateRequest({context, request});
  return request;
}

export function validateRequest({context, request}) {
  record(request, 'request');
  if (Object.keys(request).sort().join(',') !== 'prompt,threadId') reject('CALLBACK_FORMAT_INVALID', 'send request must contain only threadId and prompt');
  const fields = check(context, parseCapsule(request.prompt));
  exact(request.threadId, fields.CALLBACK_TARGET_THREAD_ID, 'tool.threadId');
  return Object.freeze(fields);
}

// Explicit READ-ONLY compatibility for unambiguous historical KEY=bare-value
// capsules. Never retry a failed canonical parse through this branch implicitly.
// No alias inference, evidence fabrication, sending, or relay consumption.
export function parseLegacyCapsule(prompt) {
  textValue(prompt, 'prompt');
  if (prompt.length > 65536 || prompt.split(/\r?\n/).length > 20) reject('CALLBACK_FORMAT_INVALID', 'legacy capsule too large');
  const result = Object.create(null);
  for (const part of prompt.trimEnd().split(/[；;]|\r?\n/)) {
    const match = /^([A-Z][A-Z0-9_]*)=([^\r\n]+)$/.exec(part);
    if (!match || !match[2].trim()) reject('CALLBACK_FORMAT_INVALID', 'legacy capsule ambiguous; inspect the original evidence, do not guess');
    if (Object.hasOwn(result, match[1])) reject('CALLBACK_FORMAT_INVALID', `duplicate field ${match[1]}`);
    if (match[2].startsWith('"')) reject('CALLBACK_FORMAT_INVALID', 'quoted/mixed values require canonical parsing or source inspection');
    if (match[1] === 'FIX_CYCLES') {
      if (!/^(?:0|[1-9][0-9]*)$/.test(match[2])) reject('CALLBACK_FORMAT_INVALID', 'legacy FIX_CYCLES is not an exact integer');
      result[match[1]] = Number(match[2]);
    } else result[match[1]] = match[2];
  }
  scalars(result);
  return result;
}

export function validateLegacyRequest({context, request}) {
  record(request, 'request');
  if (Object.keys(request).sort().join(',') !== 'prompt,threadId') reject('CALLBACK_FORMAT_INVALID', 'legacy receipt must contain only threadId and prompt');
  const fields = parseLegacyCapsule(request.prompt);
  // CALLBACK_MODE did not exist in historical normal callbacks. This explicit
  // compatibility default cannot select correction mode or fill any evidence.
  if (!Object.hasOwn(fields, 'CALLBACK_MODE')) fields.CALLBACK_MODE = 'STANDARD';
  check(context, fields);
  exact(request.threadId, fields.CALLBACK_TARGET_THREAD_ID, 'tool.threadId');
  return Object.freeze(fields);
}
