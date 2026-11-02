/* v0.4.0: owner entry point (spec-v0.3.md). Local demonstration only.
   No real owners, properties or bookings. draft() is a deterministic keyword
   reader; fromQuotes() turns a Claude draft (server-side, api/owner-draft.js)
   into the same shape and keeps only quotes that appear verbatim in the text. */
(function(root){
  'use strict';

  const levels={
    asis:{label:'1. そのまま一回利用',short:'そのまま体験',example:'ゴーストハウス体験・撮影・地域イベント',stay:false,prep:'片付け不要。立ち入り範囲を決めるだけ'},
    trial:{label:'2. 短期の試し住み',short:'試し住み',example:'数泊〜数週間の滞在',stay:true,prep:'最低限の清掃と水回り'},
    diy:{label:'3. DIY付き滞在',short:'DIY滞在',example:'内装を手直ししながら住む',stay:true,prep:'作業範囲と禁止事項を決める'}
  };

  const checklist={
    common:[
      {id:'structure',label:'躯体（柱・床・屋根）を専門家が確認した',why:'素人では判断できない。アプリは確認済みかどうかを表示するだけ'},
      {id:'offlimits',label:'立ち入り禁止の場所を決めた',why:'危険箇所・私物の保管場所を分ける'},
      {id:'insurance',label:'保険の扱いを確認した',why:'利用中のけが・破損の負担先'},
      {id:'neighbors',label:'近隣に説明した',why:'夜間の出入りや騒音、心霊表現への配慮'},
      {id:'keys',label:'鍵の受け渡し方法を決めた',why:'無断の立ち入りを防ぐ'},
      {id:'fire',label:'火気・照明・避難経路を確認した',why:'古い配線・暗所での転倒・火災'}
    ],
    asis:[
      {id:'night',label:'夜間に使う場合の照明と付き添いを決めた',why:'ゴーストハウス体験は暗い時間が多い'},
      {id:'wildlife',label:'獣害（クマ等）の情報を確認した',why:'山あいの空き家では来訪者の安全に直結'}
    ],
    trial:[
      {id:'lodging',label:'宿泊の法的な扱い（旅館業法・住宅宿泊事業法など）を確認した',why:'宿泊を伴うと許可・届出が必要な場合がある'},
      {id:'water',label:'水回りと最低限の清掃を済ませた',why:'滞在の前提'},
      {id:'network',label:'通信環境を確認した',why:'リモートワークの前提'}
    ],
    diy:[
      {id:'lodging',label:'宿泊の法的な扱い（旅館業法・住宅宿泊事業法など）を確認した',why:'宿泊を伴うと許可・届出が必要な場合がある'},
      {id:'diyscope',label:'DIYの範囲と禁止事項に合意した（躯体には触れない）',why:'所有者同意の範囲を明確にする'},
      {id:'guidance',label:'作業の指導体制と作業中の保険を決めた',why:'素人作業の事故を防ぐ'}
    ]
  };

  /* Free-text reader. Each field keeps the sentence it came from; nothing is inferred. */
  const fields=[
    {key:'building',label:'建物の様子',words:['築','木造','平屋','二階','2階','一軒家','古民家','住宅','建物']},
    {key:'contents',label:'家財・荷物',words:['荷物','家財','家具','そのまま','仏壇']},
    {key:'condition',label:'傷み・心配な点',words:['雨漏り','傷','腐','傾','シロアリ','カビ','割れ','壊れ']},
    {key:'utilities',label:'電気・水道・ガス',words:['電気','水道','ガス','井戸','トイレ']},
    {key:'access',label:'行き方・駐車',words:['駅','バス','駐車','車で','台','徒歩','道路','坂道','山道']},
    {key:'timing',label:'貸せる時期',words:['週末','夏','秋','冬','春','月','期間','いつでも']},
    {key:'wish',label:'オーナーの希望',words:['したい','ほしい','欲しい','困','手放','活用','誰か']}
  ];
  const unknownWords=['不明','わからない','分からない','未確認','知らない'];

  function sentences(text){
    return String(text||'').split(/(?<=[。！？!?\n])/).map(s=>s.trim()).filter(Boolean);
  }

  /* Builds the draft object from per-field quotes. Shared by both draft sources. */
  function build(city,text,quotes,notes,source){
    const values={},evidence={},unknown=[];
    for(const f of fields){
      const hit=quotes[f.key]||[];
      evidence[f.key]=hit.length?hit:null;
      values[f.key]=hit.length?hit.join(' '):null;
      if(hit.some(s=>unknownWords.some(w=>s.includes(w))))unknown.push(f.label+'（原文に「不明」等の記載）');
      if(!hit.length)unknown.push(f.label+'（記載なし）');
      for(const n of notes[f.key]||[])unknown.push(f.label+'（'+n+'）');
    }
    return {
      city:String(city||''),demo:true,text:String(text||''),source,values,evidence,unknown,
      structure:'専門家による確認が必要（未確認）',
      level:null,checks:{},price:null,status:'draft',
      gates:{owner:false,operator:false},history:[{action:source==='claude'?'下書き作成（Claude）':'下書き作成（簡易処理）'}]
    };
  }

  function draft(city,text){
    const ss=sentences(text),quotes={};
    for(const f of fields)quotes[f.key]=ss.filter(s=>f.words.some(w=>s.includes(w)));
    return build(city,text,quotes,{},'keyword');
  }

  /* Accepts untrusted model output. A quote survives only if it appears verbatim in
     the owner's text; anything else (paraphrase, inference, injected text) is dropped.
     Notes are short plain strings attached to a known field. Returns null if unusable. */
  const LIMITS={quotes:6,quote:300,notes:3,note:80};
  function fromQuotes(city,text,raw){
    const t=String(text||'');
    if(!raw||typeof raw!=='object'||!raw.fields||typeof raw.fields!=='object')return null;
    const quotes={},notes={};let kept=0;
    for(const f of fields){
      const list=Array.isArray(raw.fields[f.key])?raw.fields[f.key]:[];
      quotes[f.key]=[...new Set(list.filter(q=>typeof q==='string').map(q=>q.trim()).filter(q=>q&&q.length<=LIMITS.quote&&t.includes(q)))].slice(0,LIMITS.quotes);
      kept+=quotes[f.key].length;
    }
    for(const u of Array.isArray(raw.unknown)?raw.unknown:[]){
      if(!u||!fields.some(f=>f.key===u.field)||typeof u.note!=='string'||!u.note.trim())continue;
      (notes[u.field]=notes[u.field]||[]);
      if(notes[u.field].length<LIMITS.notes)notes[u.field].push(u.note.trim().slice(0,LIMITS.note));
    }
    if(!kept&&t.trim())return null;
    return build(city,t,quotes,notes,'claude');
  }

  const required=level=>levels[level]?[...checklist.common,...checklist[level]]:[];

  function errors(o){
    const e=[];
    if(!o.demo)e.push('この試作では実在の物件を登録できません');
    if(!o.text.trim())e.push('建物の様子を書いてください');
    if(!levels[o.level])e.push('利用の段階を選んでください');
    const missing=required(o.level).filter(c=>!o.checks[c.id]);
    if(missing.length)e.push('未確認の安全項目があります：'+missing.map(c=>c.label).join('／'));
    if(!o.gates.owner)e.push('オーナー本人の確認が必要です');
    if(!o.gates.operator)e.push('運営による安全・法令・個人情報の確認が必要です');
    return e;
  }

  function legalStatus(o){
    if(!levels[o.level])return '段階が未選択';
    if(!levels[o.level].stay)return '宿泊なし（一回利用）';
    return o.checks.lodging?'宿泊の扱い：確認済み（デモ）':'宿泊の扱い：要確認（可能とは示しません）';
  }

  function publish(o){
    const e=errors(o);
    if(e.length)throw Error(e.join('。'));
    return {...o,status:'published',history:[...o.history,{action:'閲覧用に反映（デモ）'}]};
  }

  /* Any edit to text, level or checks returns the offer to draft without inherited confirmation. */
  function edit(o,patch){
    return {...o,...patch,status:'draft',gates:{owner:false,operator:false},history:[...o.history,{action:'編集のため下書きに戻す'}]};
  }

  function revenue(price,feeRate=0.1){
    const p=Number(price);
    if(!Number.isFinite(p)||p<=0)return null;
    const fee=Math.round(p*feeRate);
    return {price:Math.round(p),fee,owner:Math.round(p)-fee,feeRate,assumption:true};
  }

  const visible=o=>!!o&&o.status==='published'&&errors(o).length===0;

  const api={levels,checklist,fields,draft,fromQuotes,LIMITS,required,errors,legalStatus,publish,edit,revenue,visible};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MACHI_OWNER=api;
})(typeof window==='undefined'?globalThis:window);
