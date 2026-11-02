/* v0.4.0: local demonstration only. No real opportunities or host identities. */
(function(root){
  'use strict';
  const labels={draft:'下書き',awaiting_confirmation:'地域側の確認待ち',confirmed:'人による確認済み（デモ）',published:'閲覧用に反映済み（デモ）',needs_reconfirmation:'期限切れ・要再確認',withdrawn:'取り下げ',rejected:'却下'};
  const fields={activity:'活動',host:'窓口',eligibility:'対象',schedule:'日程',cost:'費用',contact:'連絡先',diy:'DIY許可',work:'通信・仕事',mobility:'移動'};
  const today=()=>new Date().toISOString().slice(0,10);
  const addDays=(date,n)=>new Date(Date.parse(date+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);
  const validDate=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isFinite(Date.parse(d))&&new Date(d+'T00:00:00Z').toISOString().slice(0,10)===d;
  const safeUrl=u=>{try{return new URL(u).protocol==='https:'}catch{return false}};
  function draft(city,text,source,now=today()){
    const values={},evidence={};
    for(const [key,label] of Object.entries(fields)){
      const line=text.split('\n').find(l=>l.startsWith(label+'：'));
      const value=line?.slice(label.length+1).trim();
      values[key]=value&&!/^(未確認|不明)$/.test(value)?value:null;
      evidence[key]=line||null;
    }
    return {city,demo:true,values,evidence,text,source,owner:'模擬資料作成者：まちホリ！',sourceUpdated:null,retrieved:now,status:'draft',reviewed:null,reviewer:null,expires:addDays(now,7),gates:{authority:false,reuse:false,privacy:false},history:[{date:now,action:'下書き作成'}]};
  }
  function status(r,now=today()){
    if(['withdrawn','rejected'].includes(r.status))return r.status;
    if(['confirmed','published'].includes(r.status)&&(!validDate(r.expires)||r.expires<now))return 'needs_reconfirmation';
    return r.status;
  }
  function errors(r,now=today()){
    const e=[];
    if(!r.demo)e.push('この試作では実在の募集を登録できません');
    if(!r.text.trim()||!r.values.activity)e.push('原文と活動の記載が必要です');
    if(!safeUrl(r.source))e.push('httpsの出典URLが必要です');
    if(!validDate(r.expires)||r.expires<now||r.expires>addDays(now,30))e.push('確認期限は今日から30日以内にしてください');
    if(!['authority','reuse','privacy'].every(k=>r.gates[k]))e.push('確認権限・利用条件・個人情報の3項目を確認してください');
    return e;
  }
  function transition(r,action,now=today()){
    const current=status(r,now);
    const next={request:'awaiting_confirmation',confirm:'confirmed',publish:'published',withdraw:'withdrawn',reject:'rejected',invalidate:'needs_reconfirmation'}[action];
    const allowed={request:['draft','needs_reconfirmation','rejected','withdrawn'],confirm:['awaiting_confirmation'],publish:['confirmed'],withdraw:['draft','awaiting_confirmation','confirmed','published','needs_reconfirmation'],reject:['draft','awaiting_confirmation'],invalidate:['confirmed','published']};
    if(!next||!allowed[action].includes(current))throw Error('この状態では操作できません');
    if(['confirm','publish'].includes(action)){const e=errors(r,now);if(e.length)throw Error(e.join('。'));}
    if(action==='publish'&&(!r.reviewed||!r.reviewer))throw Error('人による確認が必要です');
    const out={...r,status:next,history:[...r.history,{date:now,action:labels[next]}]};
    if(action==='confirm'){out.reviewed=now;out.reviewer='模擬地域担当（実在しません）';}
    if(action==='request'){out.reviewed=null;out.reviewer=null;out.gates={authority:false,reuse:false,privacy:false};}
    return out;
  }
  const visible=(r,city,now=today())=>!!r&&r.city===city&&status(r,now)==='published'&&errors(r,now).length===0;
  const api={labels,fields,today,addDays,draft,status,errors,transition,visible};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MACHI_OPPORTUNITY=api;
})(typeof window==='undefined'?globalThis:window);
