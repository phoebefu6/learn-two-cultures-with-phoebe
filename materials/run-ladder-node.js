const fs=require('fs'), R=require('path').resolve(process.argv[2]||'.');
global.window={}; eval(fs.readFileSync(R+'/assets/two-cultures-data.js','utf8'));
const B=require(R+'/assets/two-cultures-bench.js');
const d=B.prepare(window.TC_DATA);
const r0=B.mulberry32(2001); console.log('rng', [r0(),r0(),r0()]);
const out={};
for (const L of B.LADDER){ const t=Date.now(); const r=B.evaluate(d,L.opts);
  out[L.id]={n:r.nRows,base:r.base,lr_ok:r.lr.ok,rf_ok:r.rf.ok,lr_numbers:r.lr.numbers,rf_nodes:r.rf.nodes,rf_depth:r.rf.depth,dis:[r.disagree,r.lrOnly,r.rfOnly],lr_surprises:r.lr.surprises,
   lr_top:r.lr.top.map(t=>[d.names[t.f],+t.w.toFixed(4)]), rf_top:r.rf.top.map(t=>[d.names[t.f],+t.drop.toFixed(4)]), ms:Date.now()-t};
  if(L.id==='all30') out[L.id].lr_w=r.lr.w.map(v=>+v.toFixed(8));
}
console.log(JSON.stringify(out,null,1));
fs.writeFileSync(process.argv[3], JSON.stringify(out));
