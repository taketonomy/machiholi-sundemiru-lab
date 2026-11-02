const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
  const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  const p=await b.newPage({viewport:{width:1280,height:900}}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>{errors.push('dialog: '+d.message());d.dismiss();});
  await p.goto(process.env.MACHI_TEST_URL||'http://127.0.0.1:8765');
  assert.equal(await p.locator('#owners').count(),1);
  assert.equal(await p.locator('nav a[href="#owners"]').count(),1);

  // Empty text produces no draft.
  await p.click('#owner-draft');assert.equal(await p.locator('[name=owner-level]').count(),0);

  // Example → draft keeps source sentences; structural safety stays unconfirmed.
  await p.click('#owner-example');await p.selectOption('#owner-city',{index:1});await p.click('#owner-draft');
  const draft=await p.locator('#owners').innerText();
  assert(draft.includes('「荷物はほとんどそのまま残っています。」'));
  assert(draft.includes('専門家による確認が必要（未確認）'));
  assert(draft.includes('不明'));

  // Publishing is blocked until every safety item and both confirmations are done.
  await p.check('[name=owner-level][value=asis]');
  await p.click('#owner-publish');assert((await p.locator('#owner-feedback').innerText()).includes('未確認の安全項目'));
  assert.equal(await p.locator('#owner-offer').count(),0);
  for(const box of await p.locator('[data-check]').all())await box.check();
  await p.click('#owner-publish');assert((await p.locator('#owner-feedback').innerText()).includes('オーナー本人'));
  await p.check('[data-gate=owner]');await p.check('[data-gate=operator]');
  await p.click('#owner-publish');
  assert.equal(await p.locator('#owner-offer').count(),1);
  assert((await p.locator('#owner-offer').innerText()).includes('架空データ'));

  // Changing anything after publication withdraws the preview and asks for re-confirmation.
  await p.fill('#owner-price','8000');await p.locator('#owner-price').dispatchEvent('change');
  assert.equal(await p.locator('#owner-offer').count(),0);
  assert((await p.locator('#owner-feedback').innerText()).includes('確認をやり直して'));
  assert((await p.locator('#owners').innerText()).includes('表示上の仮定'));

  // Stay levels show the legal status as "needs confirmation".
  await p.check('[name=owner-level][value=trial]');
  assert((await p.locator('#owners').innerText()).includes('宿泊の扱い：要確認'));

  // HTML in owner text is escaped.
  await p.fill('#owner-text','木造の家です。<img src=x onerror=alert(1)>');await p.click('#owner-draft');
  assert.equal(await p.locator('#owners img').count(),0);

  await p.setViewportSize({width:390,height:844});
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
  await p.reload();assert.equal(await p.locator('#owner-offer').count(),0);
  assert.equal(errors.length,0,errors.join('\n'));
  await b.close();
  console.log('PASS Chromium owner flow: empty input, source-quoted draft, safety gate, two confirmations, publish preview, edit withdraws, stay legal status, XSS escape, mobile width, reload reset; no page errors');
})().catch(e=>{console.error(e);process.exit(1);});
