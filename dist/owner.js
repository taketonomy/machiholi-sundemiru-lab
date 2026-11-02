'use strict';
/* v0.3.0 owner entry point UI. In-memory only; reload clears everything. */
(()=>{
  const M=window.MACHI_OWNER,$=s=>document.querySelector(s);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const el=document.createElement('section');el.id='owners';el.className='section';$('#sources').before(el);
  const example='【架空の例・実在しません】祖父母が住んでいた木造の平屋です。荷物はほとんどそのまま残っています。雨漏りがあるかは不明です。電気と水道は止めています。駅から車で15分、庭に車を2台とめられます。秋の週末なら使ってもらっても構いません。草刈りだけでも誰かに手伝ってほしいです。';
  let offer=null,text='',city='',message='';

  const cities=()=>[...document.querySelectorAll('#region option')].map(o=>o.value).filter(Boolean);

  function draftTable(o){
    return `<dl class="data-table">${M.fields.map(f=>`<div><dt>${esc(f.label)}</dt><dd>${o.evidence[f.key]?o.evidence[f.key].map(s=>`「${esc(s)}」`).join('<br>'):'<span class="unknown">記載なし（推定しません）</span>'}</dd></div>`).join('')}<div><dt>躯体の安全</dt><dd><strong>${esc(o.structure)}</strong></dd></div></dl>${o.unknown.length?`<p class="notice">確認が必要な点：${o.unknown.map(esc).join('、')}</p>`:''}`;
  }

  function levelPicker(o){
    return `<fieldset class="owner-levels"><legend>どこまで貸すかを選ぶ（進めなくてもよい）</legend>${Object.entries(M.levels).map(([k,l])=>`<label class="chip"><input type="radio" name="owner-level" value="${k}" ${o.level===k?'checked':''}><span><strong>${esc(l.label)}</strong><br><small>${esc(l.example)} · ${esc(l.prep)}</small></span></label>`).join('')}</fieldset>`;
  }

  function checks(o){
    if(!M.levels[o.level])return '';
    return `<fieldset class="owner-checks"><legend>安全チェックリスト（すべて確認するまで公開できません）</legend>${M.required(o.level).map(c=>`<label><input type="checkbox" data-check="${c.id}" ${o.checks[c.id]?'checked':''}> ${esc(c.label)}<br><small>${esc(c.why)}</small></label>`).join('')}</fieldset><p class="notice">${esc(M.legalStatus(o))}</p>`;
  }

  function money(o){
    const r=M.revenue(o.price);
    return `<label class="review-field" for="owner-price">1回の利用料の例（円・任意）</label><input id="owner-price" type="number" min="0" step="500" value="${o.price??''}" placeholder="例：8000"><p class="small-note">${r?`利用料 ${r.price.toLocaleString()}円のうち、運営手数料 ${r.fee.toLocaleString()}円（${r.feeRate*100}%）を引いて、オーナーの受け取り ${r.owner.toLocaleString()}円。<strong>表示上の仮定です。料金・手数料・支払いを約束するものではありません。</strong>`:'料金は未設定です。'}</p>`;
  }

  function gates(o){
    return `<fieldset class="owner-gates"><legend>公開前の二つの確認</legend><label><input type="checkbox" data-gate="owner" ${o.gates.owner?'checked':''}> オーナー本人が内容を確認した（デモ）</label><label><input type="checkbox" data-gate="operator" ${o.gates.operator?'checked':''}> 運営が安全・法令・個人情報を確認した（デモ・実在の運営ではありません）</label></fieldset><button class="button primary" id="owner-publish">訪問者向けに反映する（デモ）</button>`;
  }

  function preview(o){
    if(!M.visible(o))return `<div class="panel"><h3>訪問者に表示される内容</h3><p>まだ反映されていません。AIの下書きだけでは公開されません。</p></div>`;
    const l=M.levels[o.level],r=M.revenue(o.price);
    return `<article class="panel" id="owner-offer"><span class="status-label">架空データ・デモ表示</span><h3>${esc(o.city||'地域未選択')}：${esc(l.short)}</h3><p>${esc(l.example)}</p><ul><li>躯体の安全：専門家確認済み（デモ）</li><li>${esc(M.legalStatus(o))}</li><li>立ち入り範囲・鍵・保険・近隣説明：確認済み（デモ）</li>${r?`<li>利用料の例：${r.price.toLocaleString()}円（仮定）</li>`:''}</ul><p class="small-note">実在の物件・オーナー・募集ではありません。予約・送信は行いません。正確な場所は表示しません。</p></article>`;
  }

  function render(){
    el.innerHTML=`<div class="section-heading"><div><p class="eyebrow">FOR OWNERS · v0.3.0</p><h2>まず一度、<em>そのままで</em>。</h2></div><a href="#discover">訪問者の画面へ ↑</a></div>
    <p>空き家を「貸す」準備ができていなくても大丈夫。片付けずに、ゴーストハウス体験や撮影などで一度だけ使ってもらうところから始められます。続けるかどうかは、反応を見てオーナーが決めます。</p>
    <p class="notice">これはデモです。入力は端末のメモリだけに残り、再読み込みで消えます。氏名・正確な住所・連絡先は入力しないでください。下書きはAIではなく、キーワードで文を拾う簡易処理です（Claudeによる下書きは次の段階で追加）。</p>
    <div class="detail-grid"><div class="panel"><h3>1. 今の状態を、そのまま書く</h3><label class="review-field" for="owner-city">地域（市町村まで）</label><select id="owner-city"><option value="">選ばない</option>${cities().map(c=>`<option ${c===city?'selected':''}>${esc(c)}</option>`).join('')}</select><label class="review-field" for="owner-text">建物の様子（自由記述）</label><textarea id="owner-text" rows="8" maxlength="2000" placeholder="例：祖母の家。荷物はそのまま。雨漏りは不明。">${esc(text)}</textarea><button class="button secondary" id="owner-example">架空の例を入れる</button> <button class="button secondary" id="owner-draft">下書きを作る</button></div>
    <div class="panel"><h3>2. 下書きを確かめる</h3>${offer?draftTable(offer):'<p>左で書いた内容から、項目ごとに原文を拾って並べます。書かれていないことは空欄のまま残します。</p>'}</div></div>
    ${offer?`<div class="detail-grid"><div class="panel"><h3>3. 段階と安全を決める</h3>${levelPicker(offer)}${checks(offer)}${money(offer)}${gates(offer)}<p id="owner-feedback" class="notice" role="status">${esc(message)}</p></div>${preview(offer)}</div>`:''}`;
  }

  el.addEventListener('click',e=>{
    const id=e.target.id;
    if(id==='owner-example'){text=example;$('#owner-text').value=example;return;}
    if(id==='owner-draft'){text=$('#owner-text').value;city=$('#owner-city').value;if(!text.trim()){message='';offer=null;render();return;}offer=M.draft(city,text);message='下書きを作りました。段階を選び、安全項目を確認してください。';render();return;}
    if(id==='owner-publish'){try{offer=M.publish(offer);message='訪問者向けに反映しました（デモ）。';}catch(err){message=err.message;}render();}
  });

  el.addEventListener('change',e=>{
    if(!offer)return;
    const t=e.target,hadGates=offer.gates.owner||offer.gates.operator||offer.status==='published';
    if(t.name==='owner-level')offer=M.edit(offer,{level:t.value,checks:{}});
    else if(t.dataset.check)offer=M.edit(offer,{checks:{...offer.checks,[t.dataset.check]:t.checked}});
    else if(t.id==='owner-price')offer=M.edit(offer,{price:t.value===''?null:Number(t.value)});
    else if(t.dataset.gate)offer={...offer,gates:{...offer.gates,[t.dataset.gate]:t.checked}};
    else if(t.id==='owner-city'){city=t.value;return;}
    else return;
    if(!t.dataset.gate)message=hadGates?'内容が変わったため、公開前の確認をやり直してください。':'';
    render();
  });

  el.addEventListener('input',e=>{if(e.target.id==='owner-text')text=e.target.value;});
  render();
})();
