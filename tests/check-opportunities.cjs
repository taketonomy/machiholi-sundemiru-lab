const assert=require('node:assert/strict'),M=require('../dist/opportunity-model.js');
const now='2026-10-31';let n=0;function test(name,f){f();console.log('PASS',name);n++;}
const make=()=>M.draft('伊勢市','活動：架空の相談\n費用：未確認\nDIY許可：不明','https://example.invalid/demo',now);
const ready=()=>{let r=M.transition(make(),'request',now);r.gates={authority:true,reuse:true,privacy:true};return M.transition(r,'confirm',now)};
test('unknown fields stay null with literal evidence',()=>{const r=make();assert.equal(r.values.cost,null);assert.equal(r.values.host,null);assert.equal(r.evidence.diy,'DIY許可：不明')});
test('draft cannot publish',()=>assert.throws(()=>M.transition(make(),'publish',now)));
test('human gates required',()=>assert.throws(()=>M.transition(M.transition(make(),'request',now),'confirm',now)));
test('confirmed is not published',()=>assert.equal(M.visible(ready(),'伊勢市',now),false));
test('explicit publication and municipality match',()=>{const r=M.transition(ready(),'publish',now);assert(M.visible(r,'伊勢市',now));assert(!M.visible(r,'壱岐市',now))});
test('expired records excluded',()=>{const r=M.transition(ready(),'publish',now);assert(!M.visible(r,'伊勢市','2026-11-08'));assert.equal(M.status(r,'2026-11-08'),'needs_reconfirmation')});
test('withdrawal and important change exclude immediately',()=>{const r=M.transition(ready(),'publish',now);for(const a of ['withdraw','invalidate'])assert(!M.visible(M.transition(r,a,now),'伊勢市',now))});
test('reconfirmation resets previous gates',()=>{let r=M.transition(ready(),'withdraw',now);r=M.transition(r,'request',now);assert.equal(r.reviewer,null);assert(!r.gates.authority);assert.throws(()=>M.transition(r,'confirm',now))});
test('rejected never visible',()=>assert(!M.visible(M.transition(make(),'reject',now),'伊勢市',now)));
test('bad dates and missing provenance blocked',()=>{for(const patch of [{expires:'2026-02-30'},{expires:'2026-12-31'},{source:'javascript:alert(1)'},{demo:false}])assert(M.errors({...ready(),...patch},now).length)});
test('edits restart as draft without inherited review',()=>{const old=ready(),r=M.draft(old.city,'活動：変更',old.source,now);assert.equal(r.status,'draft');assert.equal(r.reviewed,null)});
console.log(`${n} opportunity tests passed`);
