import assert from 'node:assert/strict';

// Synthetic thread IDs only. No messages, filesystem mutations or network calls.
export function runSuite(g) {
  const roles = Object.fromEntries(['00·总监','01·诊断','02·开发','03·审查','04·修复','05·验证'].map((r,i)=>[r,'00000000-0000-0000-0000-'+String(i+1).padStart(12,'0')]));
  const rows=[];
  function test(name,fn){try{fn();rows.push({name,result:'PASS'});}catch(e){rows.push({name,result:'FAIL',error:e.message});}}
  function context(role, result, target, mode, used=0) {
    const c={PROJECT_ID:'synthetic-project',MILESTONE_ID:'synthetic-batch',RELAY_ID:'synthetic-relay-'+role,MASTER_RUN:'C:/isolated/master.md',ROLE:role,HARD_STOP_RETURN_TO_THREAD_ID:roles['00·总监'],RETURN_TO_THREAD_ID:roles['00·总监'],routing:{roles:{...roles},onResult:{[result]:target},retryUsed:used,retryLimit:2},expected:{}};
    if(mode)c.REVIEW_MODE=mode;
    if(role==='03·审查'&&mode==='CONTRACT_REVIEW') c.expected={CONTRACT_REVISION_REVIEWED:'R1'};
    else if(!['01·诊断'].includes(role)&&mode!=='DIAGNOSIS_REVIEW') {
      c.expected={EXECUTOR_KIND_ACTUAL:role==='02·开发'?'INTERNAL_02':'INTERNAL_04',CONTRACT_REVISION_EXECUTED:'R1',APPROVAL_UPDATE_ID:'NOT_REQUIRED',APPROVAL_STATUS:'NOT_REQUIRED'};
      if(['03·审查','05·验证'].includes(role)) c.expected.CONTRACT_REVISION_REVIEWED='R1';
      if(role==='05·验证')c.expected.CONTRACT_REVISION_VALIDATED='R1';
    }
    return c;
  }
  function facts(c,result){return {CALLBACK_KIND:'COMPLETE',SERVICE_TIER_ACTUAL:'unknown',MCP_ROUTE:'NONE:NO_RELEVANT_MCP',MCP_EVIDENCE:'NONE',MCP_FALLBACK:'NONE',PROCESS_OWNERSHIP:'NONE',PROCESS_CLEANUP:'NOT_NEEDED',ACTUAL_CHANGES:'NONE',VALIDATION_LEVEL:'SYNTHETIC',VALIDATION_RESULT:'NOT_RUN',FIX_CYCLES:0,FINDINGS_OR_RESOLUTION:'synthetic finding; evidence at C:/isolated/report.md',UNKNOWN:'NONE',UNEXECUTED:'live project work',BLOCKER:'NONE',RECOMMENDED_NEXT_GATE:'Consume evidence once and perform the contract-authorized next stage',RESULT_CODE:result,...c.expected,...(c.ROLE==='02·开发'?{VALIDATION_BUDGET_ACTUAL:'FOCUSED',EXPAND_TRIGGER:'NONE'}:{})};}
  function send(c,result,extra={}){const request=g.prepareCallback({context:c,fields:{...facts(c,result),...extra}});const body=g.validateRequest({context:c,request});return {request,body};}
  function rejects(fn,code){assert.throws(fn,e=>e.code===code);}
  test('diagnosis directly reaches review, not director',()=>{const c=context('01·诊断','DIAGNOSIS_COMPLETE','03·审查');const r=send(c,'DIAGNOSIS_COMPLETE');assert.equal(r.request.threadId,roles['03·审查']);assert.equal(r.body.RELAY_RETRIES_USED,0);});
  test('diagnostic review can request bounded supplementation',()=>{const c=context('03·审查','DIAGNOSIS_INCOMPLETE','01·诊断','DIAGNOSIS_REVIEW');assert.equal(send(c,'DIAGNOSIS_INCOMPLETE').body.RELAY_RETRIES_USED,1);});
  for(const target of ['02·开发','04·修复'])test('approved diagnosis reaches '+target,()=>{const c=context('03·审查','DIAGNOSIS_ACCEPTED',target,'DIAGNOSIS_REVIEW');c.routing.implementationAuthorized=true;const r=send(c,'DIAGNOSIS_ACCEPTED');assert.equal(r.request.threadId,roles[target]);assert.equal(r.body.RELAY_RETRIES_USED,0);assert.equal(r.body.CONTRACT_REVISION_EXECUTED,undefined);});
  test('diagnosis cannot invent implementation permission',()=>{const c=context('03·审查','DIAGNOSIS_ACCEPTED','04·修复','DIAGNOSIS_REVIEW');rejects(()=>send(c,'DIAGNOSIS_ACCEPTED'),'CALLBACK_CONTEXT_INVALID');});
  test('incomplete diagnosis cannot dispatch implementation',()=>{const c=context('03·审查','DIAGNOSIS_INCOMPLETE','04·修复','DIAGNOSIS_REVIEW');c.routing.implementationAuthorized=true;rejects(()=>send(c,'DIAGNOSIS_INCOMPLETE'),'CALLBACK_CONTEXT_INVALID');});
  test('new approval need reaches director',()=>{const c=context('03·审查','DIRECTOR_DECISION_REQUIRED','00·总监','DIAGNOSIS_REVIEW');assert.equal(send(c,'DIRECTOR_DECISION_REQUIRED').request.threadId,roles['00·总监']);});
  test('contract approval always reaches director',()=>{const c=context('03·审查','CONTRACT_APPROVED','00·总监','CONTRACT_REVIEW');assert.equal(send(c,'CONTRACT_APPROVED').request.threadId,roles['00·总监']);});
  test('contract approval cannot route straight to execution',()=>{const c=context('03·审查','CONTRACT_APPROVED','02·开发','CONTRACT_REVIEW');rejects(()=>send(c,'CONTRACT_APPROVED'),'CALLBACK_CONTEXT_INVALID');});
  test('diagnostic mode cannot assert contract approval',()=>{const c=context('03·审查','CONTRACT_APPROVED','00·总监','DIAGNOSIS_REVIEW');rejects(()=>send(c,'CONTRACT_APPROVED'),'CALLBACK_CONTEXT_INVALID');});
  test('development reaches independent review',()=>{const c=context('02·开发','IMPLEMENTED','03·审查');assert.equal(send(c,'IMPLEMENTED').request.threadId,roles['03·审查']);});
  test('implementation review findings reach remediation',()=>{const c=context('03·审查','FINDINGS','04·修复','IMPLEMENTATION_REVIEW');assert.equal(send(c,'FINDINGS').body.RELAY_RETRIES_USED,1);});
  test('validation failure reaches remediation directly',()=>{const c=context('05·验证','FAILED','04·修复');const r=send(c,'FAILED');assert.equal(r.request.threadId,roles['04·修复']);assert.equal(r.body.RELAY_RETRIES_USED,1);});
  test('validation unknown root reaches diagnosis with chain intact',()=>{const c=context('05·验证','NEEDS_DIAGNOSIS','01·诊断');const r=send(c,'NEEDS_DIAGNOSIS');assert.equal(r.body.RELAY_RETRIES_USED,1);assert.equal(r.body.CONTRACT_REVISION_VALIDATED,'R1');});
  test('completed remediation reaches review and preserves usage',()=>{const c=context('04·修复','FIXED','03·审查',undefined,1);assert.equal(send(c,'FIXED').body.RELAY_RETRIES_USED,1);});
  test('review acceptance reaches validation',()=>{const c=context('03·审查','REVIEWED','05·验证','IMPLEMENTATION_REVIEW');assert.equal(send(c,'REVIEWED').request.threadId,roles['05·验证']);});
  test('final validation reaches director',()=>{const c=context('05·验证','VALIDATED','00·总监');assert.equal(send(c,'VALIDATED').request.threadId,roles['00·总监']);});
  test('shared retry budget spans diagnosis and remediation',()=>{
    const c1=context('03·审查','DIAGNOSIS_INCOMPLETE','01·诊断','DIAGNOSIS_REVIEW');const first=send(c1,'DIAGNOSIS_INCOMPLETE');
    const c2=context('05·验证','FAILED','04·修复',undefined,first.body.RELAY_RETRIES_USED);const second=send(c2,'FAILED');assert.equal(second.body.RELAY_RETRIES_USED,2);
    const c3=context('03·审查','FINDINGS','04·修复','IMPLEMENTATION_REVIEW',second.body.RELAY_RETRIES_USED);rejects(()=>send(c3,'FINDINGS'),'CALLBACK_RETRY_EXHAUSTED');
    assert.equal(send(c3,'RETRY_EXHAUSTED',{CALLBACK_KIND:'HARD_STOP',BLOCKER:'same batch unresolved; shared retries exhausted'}).request.threadId,roles['00·总监']);
  });
  test('callback cannot reset its computed retry counter',()=>{const c=context('05·验证','FAILED','04·修复',undefined,1);rejects(()=>send(c,'FAILED',{RELAY_RETRIES_USED:0}),'CALLBACK_CONTEXT_CONFLICT');});
  test('unknown result cannot use fixed route as fallback',()=>{const c=context('01·诊断','DIAGNOSIS_COMPLETE','03·审查');rejects(()=>send(c,'UNRECOGNIZED'),'CALLBACK_CONTEXT_INVALID');});
  test('unregistered destination is rejected',()=>{const c=context('01·诊断','DIAGNOSIS_COMPLETE','03·审查');delete c.routing.roles['03·审查'];rejects(()=>send(c,'DIAGNOSIS_COMPLETE'),'CALLBACK_CONTEXT_INVALID');});
  test('same thread cannot impersonate two roles',()=>{const c=context('01·诊断','DIAGNOSIS_COMPLETE','03·审查');c.routing.roles['03·审查']=roles['00·总监'];rejects(()=>send(c,'DIAGNOSIS_COMPLETE'),'CALLBACK_CONTEXT_INVALID');});
  test('diagnosis cannot bypass independent review',()=>{const c=context('01·诊断','DIAGNOSIS_COMPLETE','04·修复');rejects(()=>send(c,'DIAGNOSIS_COMPLETE'),'CALLBACK_CONTEXT_INVALID');});
  test('malformed normal plan cannot prevent hard-stop notification',()=>{const c=context('01·诊断','DIAGNOSIS_COMPLETE','03·审查');c.routing=null;delete c.RETURN_TO_THREAD_ID;assert.equal(send(c,'BLOCKED',{CALLBACK_KIND:'HARD_STOP',BLOCKER:'missing confirmed role mapping'}).request.threadId,roles['00·总监']);});
  test('tool target tampering is rejected',()=>{const c=context('01·诊断','DIAGNOSIS_COMPLETE','03·审查');const r=send(c,'DIAGNOSIS_COMPLETE');rejects(()=>g.validateRequest({context:c,request:{...r.request,threadId:roles['00·总监']}}),'CALLBACK_CONTEXT_CONFLICT');});
  test('revision mismatch is still rejected',()=>{const c=context('05·验证','VALIDATED','00·总监');rejects(()=>send(c,'VALIDATED',{CONTRACT_REVISION_EXECUTED:'R2'}),'CALLBACK_CONTEXT_CONFLICT');});
  test('external execution cannot skip prereview',()=>{const c=context('03·审查','REVIEWED','05·验证','IMPLEMENTATION_REVIEW');c.expected.EXECUTOR_KIND_ACTUAL='EXTERNAL';rejects(()=>send(c,'REVIEWED'),'CALLBACK_CONTEXT_CONFLICT');});
  test('fixed in-flight route remains unchanged',()=>{const c=context('01·诊断','DIAGNOSIS_COMPLETE','03·审查');delete c.routing;assert.equal(send(c,'DIAGNOSIS_COMPLETE').request.threadId,roles['00·总监']);});
  test('fixed contract prereview cannot bypass director',()=>{const c=context('03·审查','CONTRACT_APPROVED','02·开发','CONTRACT_REVIEW');delete c.routing;c.RETURN_TO_THREAD_ID=roles['02·开发'];rejects(()=>send(c,'CONTRACT_APPROVED'),'CALLBACK_CONTEXT_CONFLICT');});
  test('metadata correction preserves fixed binding and original count',()=>{const c=context('01·诊断','DIAGNOSIS_COMPLETE','03·审查');c.CALLBACK_MODE='METADATA_CORRECTION';c.expected={SOURCE_EXECUTION_RELAY_ID:'prior-execution',FIX_CYCLES:1};const r=send(c,'DIAGNOSIS_COMPLETE');assert.equal(r.request.threadId,roles['00·总监']);assert.equal(r.body.FIX_CYCLES,1);});
  test('unicode, newlines and apparent fields remain evidence text',()=>{const c=context('01·诊断','DIAGNOSIS_COMPLETE','03·审查');const value='证据；CALLBACK_TARGET_THREAD_ID=other\nC:\\test';const r=send(c,'DIAGNOSIS_COMPLETE',{FINDINGS_OR_RESOLUTION:value});assert.equal(r.body.FINDINGS_OR_RESOLUTION,value);assert.equal(r.request.threadId,roles['03·审查']);});
  test('legacy receipt remains explicitly readable',()=>{const c=context('01·诊断','DIAGNOSIS_COMPLETE','03·审查');delete c.routing;const r=send(c,'DIAGNOSIS_COMPLETE',{FINDINGS_OR_RESOLUTION:'evidence'});const body={...r.body};delete body.CALLBACK_MODE;const legacy=Object.entries(body).map(([k,v])=>k+'='+v).join('；');assert.equal(g.validateLegacyRequest({context:c,request:{threadId:r.request.threadId,prompt:legacy}}).ROLE,'01·诊断');});
  test('normal direct handoff still requires a confirmed director',()=>{const c=context('01·诊断','DIAGNOSIS_COMPLETE','03·审查');delete c.HARD_STOP_RETURN_TO_THREAD_ID;delete c.routing.roles['00·总监'];rejects(()=>send(c,'DIAGNOSIS_COMPLETE'),'CALLBACK_CONTEXT_INVALID');});
  return {total:rows.length,passed:rows.filter(x=>x.result==='PASS').length,failed:rows.filter(x=>x.result==='FAIL').length,rows};
}
