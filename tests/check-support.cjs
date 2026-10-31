const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');const c={window:{}};vm.runInNewContext(fs.readFileSync('dist/support-data.js','utf8'),c);const rows=c.window.MACHI_SUPPORT_DATA;
assert.equal(rows.length,6);assert.equal(new Set(rows.map(r=>r.city)).size,5);
for(const r of rows){assert.equal(r.checked,'2026-10-31');assert.equal(r.dataType,'official_public_information');assert(r.updated&&r.fiscalYear&&r.shortStay&&r.status);for(const s of [r,...r.additionalSources])assert(/^https:\/\/www\.city\.[a-z.]+\.jp\//.test(s.url));}
assert(rows.find(r=>r.id==='iki-relocation-paused').status.includes('受付一旦停止'));
assert.equal(rows.find(r=>r.id==='iki-short-stay').updated,'2024-12-10');
assert(rows.find(r=>r.id==='toba-vacant-home-renovation').shortStay.includes('取得・定住'));
console.log('PASS support: 6 official programs / 5 cities, URLs and provenance, paused Iki, old short-stay source, Toba residency restriction');
