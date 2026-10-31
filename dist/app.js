'use strict';
(() => {
  const DATA = window.MACHI_DATA || {sources:[],places:[],plans:[],kpis:[]};
  const $ = s => document.querySelector(s);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeUrl = value => { try { const u=new URL(value); return ['https:','http:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } };
  const number = value => value!=='' && value!=null && Number.isFinite(Number(value)) ? Number(value).toLocaleString('ja-JP') : 'データなし';
  const raw = p => p.raw || p;
  const val = (p,key) => raw(p)[key] ?? p[key] ?? '';
  const municipality = p => p.city || val(p,'CITY') || '';
  const pref = p => p.prefecture || val(p,'PREFECTURE') || '';
  const id = p => String(p.id || val(p,'PROPERTY_NUMBER_ID') || '');
  const places = DATA.places || [];
  const plans = DATA.plans || [];
  const kpis = DATA.kpis || [];
  let selected=null;
  let lastCard=null;
  let checks={};
  const checkDefinitions=[
    ['property','物件を使えるか','現在の募集状況、短期滞在・契約条件をオーナーに確認'],
    ['mobility','希望の時間に移動できるか','駅からの経路、実際の時刻表・運賃、帰りの便を確認'],
    ['work','仕事を続けられるか','通信速度、電源、作業場所、勤務先のルールを確認'],
    ['host','迎えてくれる人はいるか','地域の窓口・受け入れ担当者と、参加の条件を確認'],
    ['diy','DIYに参加できるか','所有者の同意、作業範囲、安全対策・費用負担を確認'],
    ['life','日々の生活ができるか','買い物・通院の経路、営業日、必要な支援を確認']
  ];
  function sourceLink(sourceId){const s=DATA.sources.find(s=>s.id===sourceId);return s&&safeUrl(s.url)?`<a class="source-link" href="${escape(safeUrl(s.url))}" target="_blank" rel="noopener noreferrer">${escape(s.title)} ↗</a>`:'';}
  function currentInterests(){return [...document.querySelectorAll('input[name="interest"]:checked')].map(x=>x.value);}
  function planFor(p){return plans.find(x=>x.PLAN_ID===p.planId)||plans.find(x=>x.MUNICIPALITY_NAME===municipality(p));}
  function renderCards(){
    const region=$('#region').value;
    const list=places.filter(p=>!region||`${pref(p)} ${municipality(p)}`===region);
    $('#result-count').textContent=`実サンプルから ${list.length} 件の候補`;
    $('#candidates').innerHTML=list.length?list.map(p=>{
      const category=val(p,'PROPERTY_CATEGORY'), price=val(p,'AMOUNT/RENT');
      const rent=category.startsWith('賃貸')?price:'', amount=category.startsWith('売買')?price:'';
      const diy=/DIY|ＤＩＹ/i.test(val(p,'STRONG_POINTS'));
      const station=val(p,'NEAREST_STATION'), distance=val(p,'DISTANCE_TO_NEAREST_STATION_ON_FOOT');
      const plan=planFor(p);
      return `<article class="place-card"><div class="place-visual" aria-hidden="true"><span class="pref">${escape(pref(p))}</span><span class="data-kind">空き家バンク掲載サンプル · イメージ図</span></div><div class="card-body"><h3>${escape(municipality(p))}で暮らしてみる</h3><p class="address">${escape(category||'物件')} · 匿名化ID ${escape(id(p))}</p><div class="facts">${diy?'<span class="tag">原文にDIYの記載あり</span>':''}${rent?`<span class="tag">賃料 ${number(rent)}円</span>`:amount?`<span class="tag">売買価格 ${number(amount)}円</span>`:''}<span class="tag ${plan?'':'unknown'}">${plan?'地域の計画データあり':'地域の計画は未連携'}</span></div><p class="description">${station?`${escape(station)}${station.endsWith('駅')?'':'駅'}`:'最寄り駅の情報は要確認'}<br>短期滞在・DIY・受け入れは要確認</p><button class="button secondary" data-place="${escape(id(p))}">この地域の暮らしを考える <span aria-hidden="true">→</span></button><p class="evidence-caption">掲載時点の記録です。現時点の募集を示しません。</p></div></article>`;
    }).join(''):'<div class="empty">この条件の実サンプルはありません。地域の選択を変更してください。</div>';
    document.querySelectorAll('[data-place]').forEach(b=>b.addEventListener('click',()=>{lastCard=b;selectPlace(b.dataset.place)}));
  }
  function field(label,value,unit=''){return `<div><dt>${label}</dt><dd>${value!==''&&value!=null?escape(value)+unit:'データなし・要確認'}</dd></div>`;}
  function transportHtml(p){
    const plan=planFor(p);
    if(!plan)return '<p>この物件の市町村に対応する交通計画は、収録サンプル内では未連携です。</p>';
    const allRows=kpis.filter(k=>String(k.PLAN_ID)===String(plan.PLAN_ID));
    const currentRows=allRows.filter(k=>!/(目標達成状況|評価結果)/.test(k.CHAPTER_TITLE||''));
    const rows=(currentRows.length?currentRows:allRows).slice(0,3);
    return `<div class="transport-box"><strong>${escape(plan.MUNICIPALITY_NAME)}の計画データ</strong><p>資料年度 ${escape(plan.DOCUMENT_FISCAL_YEAR)} / 計画期間 ${escape(plan.PLAN_PERIOD_START_YEAR)}–${escape(plan.PLAN_PERIOD_END_YEAR)}</p><p>照合キー：CITY ↔ MUNICIPALITY_NAME / PLAN_ID ${escape(plan.PLAN_ID)}</p></div>${rows.map(k=>`<div class="transport-box"><strong>${escape(k.GOAL_OR_MEASURE_NAME || k.KPI_NAME)}</strong><p>${escape(k.CHAPTER_TITLE)}${k.SECTION_TITLE?' / '+escape(k.SECTION_TITLE):''}</p><p>${escape(k.KPI_NAME)}</p><p>基準値 ${escape(k.BASELINE_VALUE || '記載なし')} → 目標値 ${escape(k.TARGET_VALUE || '記載なし')} ${escape(k.KPI_UNIT)}</p><p>出典内計画名：${escape(k.SOURCE_PLAN_NAME)}</p></div>`).join('')}<p class="small-note">これらは計画資料に記載された指標です。過去の計画の達成状況を含む場合があります。今使える交通手段、時刻表、将来の運行を保証しません。市町村名で照合した情報で、物件の近くを走る路線と確認できたものではありません。</p>${sourceLink('links-public-transport-plan')}`;
  }
  function weekPlan(){
    const duration=$('#duration').value, transport=$('#transport').value, interests=currentInterests();
    const labels=duration==='month'?['滞在前〜第1週','第2〜3週','第4週']:duration==='weekend'?['訪問前','土曜日','日曜日']:['出発前〜1日目','2〜5日目','6〜7日目'];
    return [
      {day:labels[0],title:'行ける・暮らせるを確かめる',text:`${transport==='public'?'公共交通と駅からの移動':transport==='car'?'車と公共交通の組み合わせ':'現地の移動手段'}、通信、物件の利用条件を確認。受け入れ先に相談する。`},
      {day:labels[1],title:'仕事と地域の時間をつくる',text:`リモートワークを続けながら、${interests.includes('DIY')?'許可されたDIY作業':interests.includes('自然')?'自然を楽しむ時間':'地域を知る時間'}を相談。${interests.includes('交流')?'地域の人との交流機会も探す。':'無理のない過ごし方を考える。'}`},
      {day:labels[2],title:'自分に合う暮らしを振り返る',text:'移動や仕事のしやすさ、出会い、家の手入れを振り返る。続けて通いたいか、地域の人とも話す。'}
    ];
  }
  function selectPlace(placeId){
    selected=places.find(p=>id(p)===placeId);
    if(!selected)return;
    checks={};renderDetail();
    document.dispatchEvent(new CustomEvent('machiholi:place',{detail:{city:municipality(selected),id:id(selected)}}));
    $('#detail').hidden=false;$('#detail').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});$('#detail').focus({preventScroll:true});
  }
  function renderDetail(){
    if(!selected)return;
    const p=selected, duration=$('#duration').selectedOptions[0].textContent;
    $('#detail').innerHTML=`<div class="detail-header"><div><p class="eyebrow">STEP 02 / IMAGINE YOUR STAY</p><h2>${escape(municipality(p))}で、${escape(duration)}。</h2><p class="small-note">匿名化物件ID ${escape(id(p))} · 希望に合わせた計画のたたき台です</p></div><button class="close-button" id="close-detail" aria-label="詳細を閉じる">×</button></div><div class="detail-grid"><section class="panel"><h3>家と、日々のアクセス</h3><span class="status-label">実サンプルの記載情報</span><dl class="data-table">${field('都道府県・市町村',`${pref(p)} ${municipality(p)}`)}${field('物件区分',val(p,'PROPERTY_CATEGORY'))}${field(val(p,'PROPERTY_CATEGORY').startsWith('賃貸')?'賃料（原データ）':'売買価格（原データ）',val(p,'AMOUNT/RENT')?number(val(p,'AMOUNT/RENT')):'','円')}${field('建築時期（原データ）',val(p,'DATE_OF_CONSTRUCTION'))}${field('専有面積',val(p,'OCCUPATION_AREA'),'㎡')}${field('最寄り路線',val(p,'NEAREST_TRAIN_LINE'))}${field('最寄り駅',val(p,'NEAREST_STATION'))}${field('駅距離の原データ値',val(p,'DISTANCE_TO_NEAREST_STATION_ON_FOOT'))}${field('スーパーまで',val(p,'DISTANCE_TO_SUPERMARKET')?number(val(p,'DISTANCE_TO_SUPERMARKET')):'','m')}${field('病院まで',val(p,'DISTANCE_TO_HOSPITAL')?number(val(p,'DISTANCE_TO_HOSPITAL')):'','m')}${field('庭',val(p,'GARDEN'))}${field('駐車場',val(p,'PARKING'))}</dl><p>駅距離の仕様はmですが、数値と物件原文に不整合があるため、徒歩分数や移動可否に換算していません。距離・経路・所要時間は確認が必要です。賃料の対象期間・費用内訳は原掲載先で確認してください。</p><h4>物件紹介の原文</h4><p class="original-copy">${escape(val(p,'STRONG_POINTS')||'原文の記載なし')}</p><p class="small-note">出典CSV 行 ${escape(p.sourceRow)} / 匿名化ID ${escape(id(p))}。原文のDIY記載も、現在の所有者同意や作業範囲を保証しません。</p>${p.dataWarnings?.length?`<p class="notice">${p.dataWarnings.map(escape).join('<br>')}</p>`:''}${sourceLink(p.sourceId||'links-vacant-house')}<h4>地域への入口</h4><a class="source-link" href="#community">参加機会と問い合わせ文案を確認する →</a><p>受け入れ担当者、活動日、参加条件、現在のDIYの許可範囲は、このサンプルだけでは確認できません。物件があることと、地域に参加できることを分けて確かめます。</p><span class="status-label">受け入れ未確認</span></section><section class="panel"><h3>地域は、どこへ向かっている？</h3>${transportHtml(p)}</section></div><div class="section-heading" style="margin-top:32px"><div><p class="eyebrow">STEP 03 / MAKE A PLAN</p><h2>ここで過ごす時間を、考えてみる。</h2></div><span class="status-label">提案シナリオ · 実施予定ではありません</span></div><div class="plan">${weekPlan().map(x=>`<article class="plan-item"><span class="day">${x.day}</span><h4>${x.title}</h4><p>${x.text}</p></article>`).join('')}</div><section class="panel" style="margin-top:24px"><h3>「行ってみたい」を「行けそう」にする確認リスト</h3><p>チェックは「確認する項目を計画に入れた」の意味です。現地確認が済んだことや安全を保証するものではありません。</p><div class="progress-wrap"><span id="check-progress">${Object.values(checks).filter(Boolean).length} / 6 項目を計画に追加</span><div class="progress-track" aria-hidden="true"><div class="progress-fill" id="check-fill"></div></div></div><div class="checklist">${checkDefinitions.map(([key,title,desc])=>`<label class="check-row"><input type="checkbox" data-check="${key}" ${checks[key]?'checked':''}><span><strong>${title}</strong><small>${desc}</small></span></label>`).join('')}</div><div class="plan-actions"><button class="button primary" id="download-plan">検討メモを保存 ↓</button><button class="button secondary" id="back-candidates">ほかの候補を見る</button></div><p id="save-status" class="small-note" role="status">検討メモは端末にテキストとして保存されます。外部への送信はありません。</p></section>`;
    $('#close-detail').addEventListener('click',closeDetail);
    $('#back-candidates').addEventListener('click',()=>{$('#discover').scrollIntoView({behavior:'smooth'});$('#region').focus({preventScroll:true})});
    document.querySelectorAll('[data-check]').forEach(c=>c.addEventListener('change',()=>{checks[c.dataset.check]=c.checked;updateProgress()}));
    $('#download-plan').addEventListener('click',downloadPlan);updateProgress();
  }
  function updateProgress(){const n=Object.values(checks).filter(Boolean).length;$('#check-progress').textContent=`${n} / 6 項目を計画に追加`;$('#check-fill').style.width=`${n/6*100}%`;}
  function closeDetail(){$('#detail').hidden=true;selected=null;if(lastCard&&lastCard.isConnected)lastCard.focus();else $('#region').focus();}
  function downloadPlan(){
    const p=selected;const lines=['まちホリ！ 住んでみるラボ — 検討メモ',`地域：${pref(p)} ${municipality(p)}`,`匿名化物件ID：${id(p)}`,`滞在希望：${$('#duration').selectedOptions[0].textContent}`,`移動希望：${$('#transport').selectedOptions[0].textContent}`,`やってみたいこと：${currentInterests().join('、')||'未選択'}`,'','【提案シナリオ（実施予定・予約ではありません）】',...weekPlan().map(x=>`${x.day}：${x.title}\n${x.text}`),'','【計画に入れる確認項目】',...checkDefinitions.map(([key,title,desc])=>`${checks[key]?'[計画に追加]':'[未選択]'} ${title}：${desc}`),'','【データ出典】',...DATA.sources.map(s=>`${s.title}\n${s.url||'イベント提供資料'}\n${s.asOf||''}`),'','現時点の募集・運行・通信・地域の受け入れ・DIY許可は未確認。データ上の距離は時間ではありません。チェックは現地確認済みの意味ではありません。'];
    const blob=new Blob(['\ufeff'+lines.join('\n')],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`まちホリ_検討メモ_${municipality(p)}.txt`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);$('#save-status').textContent='検討メモの保存を開始しました。予約や問い合わせは送信していません。';
  }
  const cities=[...new Set(places.map(p=>`${pref(p)} ${municipality(p)}`))].sort((a,b)=>a.localeCompare(b,'ja'));
  cities.forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;$('#region').append(o)});
  $('#preferences').addEventListener('change',e=>{if(e.target.id==='region'){renderCards();if(selected)closeDetail();}if(selected)renderDetail()});
  if(DATA.meta?.notice)$('#data-notice').innerHTML=`<p class="notice">${escape(DATA.meta.notice)}</p>`;
  $('#source-list').innerHTML=DATA.sources.map(s=>`<article class="source-card"><h3>${escape(s.title)}</h3><p>基準時点：${escape(s.asOf||'原資料で確認')} · ${escape(s.scope||'')}</p>${s.provider?`<p>提供：${escape(s.provider)} / 原提供：${escape(s.originalProvider||s.provider)}</p>`:''}${s.license?`<p>利用条件：${escape(s.license)}</p>`:''}${s.usedRows?`<p>使用：全${number(s.sourceRows)}行から${number(s.usedRows)}物件。${escape(s.selection||'')}</p>`:''}${s.files?`<p>使用ファイル：${escape(s.files.join(' / '))}</p>`:''}${s.limitations?`<p>${escape(s.limitations.join('。'))}</p>`:''}${safeUrl(s.url)?`<a href="${escape(safeUrl(s.url))}" target="_blank" rel="noopener noreferrer">原データ・提供元を開く ↗</a>`:'<p>出典リンクを確認中</p>'}${safeUrl(s.specUrl)?` · <a href="${escape(safeUrl(s.specUrl))}" target="_blank" rel="noopener noreferrer">データ仕様 ↗</a>`:''}${safeUrl(s.kpiUrl)?` · <a href="${escape(safeUrl(s.kpiUrl))}" target="_blank" rel="noopener noreferrer">指標データ ↗</a>`:''}</article>`).join('');
  renderCards();
})();
