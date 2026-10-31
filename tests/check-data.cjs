const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('dist/data.js','utf8'),ctx);const d=ctx.window.MACHI_DATA;
let n=0;function test(name,fn){fn();console.log('PASS',name);n++}
test('44 original sample properties',()=>assert.equal(d.places.length,44));
test('five municipalities',()=>assert.equal(new Set(d.places.map(p=>p.CITY)).size,5));
test('all property identifiers unique',()=>assert.equal(new Set(d.places.map(p=>p.PROPERTY_NUMBER_ID)).size,44));
test('every property links exactly to municipality plan',()=>{for(const p of d.places)assert(d.plans.some(x=>x.PLAN_ID===p.planId&&x.MUNICIPALITY_NAME===p.CITY))});
test('source row and source provenance on each property',()=>{for(const p of d.places){assert(p.sourceRow>0);assert(d.sources.some(s=>s.id===p.sourceId))}});
test('actual DIY record 7011578 retained',()=>{const p=d.places.find(x=>x.PROPERTY_NUMBER_ID==='7011578');assert(p.STRONG_POINTS.includes('ＤＩＹ可能'));assert.equal(p['AMOUNT/RENT'],'38000');assert.equal(p.CITY,'伊勢市')});
test('sale and rental categories not conflated',()=>{assert.equal(d.places.filter(x=>x.PROPERTY_CATEGORY==='売買居住用').length,3);assert.equal(d.places.filter(x=>x.PROPERTY_CATEGORY==='賃貸居住用').length,41)});
test('all linked KPI plan IDs exist',()=>{for(const k of d.kpis)assert(d.plans.some(p=>p.PLAN_ID===k.PLAN_ID))});
test('source urls and dates present',()=>{for(const s of d.sources){assert(s.url.startsWith('https://'));assert(s.asOf);assert(s.license)}});
test('no invented host, coordinates or availability fields',()=>{for(const p of d.places){assert(!p.host);assert(!p.available);assert(!p.latitude);assert(!p.longitude)}});
test('UI discloses provisional scenarios and local-only behavior',()=>{const app=fs.readFileSync('dist/app.js','utf8');assert(app.includes('提案シナリオ'));assert(app.includes('受け入れ未確認'));assert(app.includes('過去の計画の達成状況'));assert(app.includes('月額')===false);assert(!/\bfetch\s*\(/.test(app));assert(!/localStorage/.test(app))});
console.log(`${n} tests passed`);
