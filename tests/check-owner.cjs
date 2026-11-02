const assert=require('node:assert/strict'),M=require('../dist/owner-model.js');
let n=0;function test(name,f){f();console.log('PASS',name);n++;}
const text='【架空の例】木造の平屋です。荷物はそのまま残っています。雨漏りがあるかは不明です。電気と水道は止めています。';
const allChecks=level=>Object.fromEntries(M.required(level).map(c=>[c.id,true]));
const ready=(level='asis')=>{const o=M.edit(M.draft('伊勢市',text),{level,checks:allChecks(level)});return {...o,gates:{owner:true,operator:true}};};

test('draft keeps source sentences and leaves unmentioned fields empty',()=>{const o=M.draft('伊勢市',text);assert.deepEqual(o.evidence.contents,['荷物はそのまま残っています。']);assert.equal(o.values.access,null);assert.equal(o.values.timing,null);assert(o.unknown.some(u=>u.startsWith('行き方・駐車')))});
test('"unknown" in the source is flagged, not resolved',()=>{const o=M.draft('伊勢市',text);assert(o.unknown.some(u=>u.startsWith('傷み・心配な点')&&u.includes('不明')))});
test('structural safety is never inferred from text',()=>{const o=M.draft('伊勢市','柱はしっかりしていて安全です。');assert.equal(o.structure,'専門家による確認が必要（未確認）');assert(M.errors({...o,level:'asis',gates:{owner:true,operator:true}}).some(e=>e.includes('躯体')))});
test('draft cannot be published',()=>assert.throws(()=>M.publish(M.draft('伊勢市',text))));
test('every required safety item blocks publication',()=>{for(const level of Object.keys(M.levels))for(const c of M.required(level)){const o=ready(level);o.checks={...o.checks,[c.id]:false};assert.throws(()=>M.publish(o),new RegExp(c.label.slice(0,6)))}});
test('both owner and operator confirmation are required',()=>{for(const g of ['owner','operator']){const o=ready();o.gates={...o.gates,[g]:false};assert.throws(()=>M.publish(o))}});
test('fully confirmed offer publishes and becomes visible',()=>{const o=M.publish(ready());assert.equal(o.status,'published');assert(M.visible(o))});
test('any edit after publication returns to draft and clears confirmations',()=>{const o=M.publish(ready());for(const patch of [{price:5000},{level:'trial'},{checks:{}}]){const e=M.edit(o,patch);assert.equal(e.status,'draft');assert.deepEqual(e.gates,{owner:false,operator:false});assert(!M.visible(e))}});
test('stay levels say "needs confirmation" until the lodging law item is checked',()=>{for(const level of ['trial','diy']){const o=M.edit(M.draft('伊勢市',text),{level});assert(M.legalStatus(o).includes('要確認'));assert(M.legalStatus({...o,checks:{lodging:true}}).includes('確認済み'))}assert(M.legalStatus(ready('asis')).includes('宿泊なし'))});
test('real (non-demo) offers cannot be registered',()=>assert(M.errors({...ready(),demo:false}).some(e=>e.includes('実在'))));
test('revenue is an explicit assumption and ignores invalid prices',()=>{const r=M.revenue(8000);assert.deepEqual([r.fee,r.owner,r.assumption],[800,7200,true]);for(const p of [null,'',0,-1,'abc'])assert.equal(M.revenue(p),null)});
test('keyword collisions do not misfile sentences (水道 is not a road, 家財 is not the building)',()=>{const o=M.draft('伊勢市','水道は止めています。家財が多いです。');assert.equal(o.values.access,null);assert.equal(o.values.building,null);assert(o.values.utilities.includes('水道'));assert(o.values.contents.includes('家財'))});
test('levels: as-is use has no stay; trial and DIY involve a stay',()=>{assert.equal(M.levels.asis.stay,false);assert(M.levels.trial.stay&&M.levels.diy.stay)});
console.log(`${n} owner tests passed`);
