'use strict';
// ---------- 画面の組み立て ----------
const app = document.getElementById('app');
let S = { screen:'start', lv:0, i:0, picks:[], orders:[] };
const L = () => LEVELS[S.lv];
const Qs = () => L().questions;

function loadBest(){ try { return JSON.parse(localStorage.getItem('wana-best') || '{}'); } catch(e){ return {}; } }
function saveBest(id, n){ try { const b = loadBest(); if (!(b[id] >= n)){ b[id] = n; localStorage.setItem('wana-best', JSON.stringify(b)); } } catch(e){} }

// 途中経過を保存し、参照元を見て戻ってきても続きから再開できるようにする
const PROGRESS_KEY = 'wana-progress';
let resumed = false;
function saveProgress(){
  try {
    if (S.screen === 'start') localStorage.removeItem(PROGRESS_KEY);
    else localStorage.setItem(PROGRESS_KEY, JSON.stringify({ S, y: window.scrollY, t: Date.now() }));
  } catch(e){}
}
function loadProgress(){
  try {
    const d = JSON.parse(localStorage.getItem(PROGRESS_KEY) || 'null');
    if (!d || !d.S || Date.now() - d.t > 24*60*60*1000 || !LEVELS[d.S.lv]) return null;
    d.S.picks = (d.S.picks || []).map(p => p === null ? undefined : p);
    return d;
  } catch(e){ return null; }
}

function shuffled(n){
  const a = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function begin(lv){
  S = { screen:'q', lv, i:0, picks:[], orders: LEVELS[lv].questions.map(q => shuffled(q.choices.length)) };
  render(); window.scrollTo(0,0);
}
const correctCount = () => S.picks.filter((p,i)=>p===Qs()[i].answer).length;

function header(){
  let right = '';
  if (S.screen !== 'start'){
    const pips = Qs().map((q,i)=>{
      const p = S.picks[i];
      const cls = p===undefined ? (i===S.i && S.screen==='q' ? 'now':'') : (p===q.answer?'ok':'ng');
      return `<span class="pip ${cls}"></span>`;
    }).join('');
    const meta = S.screen==='q' ? `<span>${L().name}　${S.i+1} / ${Qs().length}</span>` : `<span>${L().name}</span>`;
    right = `<div class="prog">${meta}<span class="pips" aria-hidden="true">${pips}</span></div>`;
  }
  return `<header class="top"><button class="brand brand-btn" id="home" aria-label="トップに戻る">ワナ見破り検定<small>情報セキュリティ</small></button>${right}</header><div class="tape" aria-hidden="true"></div>`;
}
function bindHome(){ const h = document.getElementById('home'); if (h) h.onclick = () => { S.screen='start'; render(); window.scrollTo(0,0); }; }

function renderStart(){
  const best = loadBest();
  app.innerHTML = header() + `
  <section class="hero">
    <h1>この2つ、同じに見えますか？</h1>
    <div class="twin">
      <div class="url"><span class="lab">リンク A</span>amazon.com</div>
      <div class="url"><span class="lab">リンク B</span>${HOMO[0]}</div>
    </div>
    <p>片方は本物、もう片方は偽サイトへのリンクです。見た目では区別できません。こうした「知らないと防げないワナ」を、実際の画面に近い形で出題します。答えるとすぐに、手口の名前と対策が分かります。</p>
    <div class="row"><button class="btn" id="go">レベル1をはじめる</button><button class="btn ghost" id="peek">AとBの中身を見る</button></div>
    <div id="peekbox" hidden><div class="glyphs">${glyphRow('amazon.com')}${glyphRow(HOMO[0])}</div></div>
  </section>
  <section class="levels">${LEVELS.map((lv,k)=>`
    <button class="level-card" data-lv="${k}">
      <span class="lv">${lv.name} ・ 全${lv.questions.length}問</span>
      <b>${lv.label}</b>
      <span>${lv.sub}</span>
      <span>${lv.stages.map((s,i)=>`${s}（${lv.stageDesc[i]}）`).join(' ／ ')}</span>
      <span class="best">${best[lv.id]!==undefined ? `自己ベスト ${best[lv.id]} / ${lv.questions.length}` : 'まだ挑戦していません'}</span>
    </button>`).join('')}
  </section>
  <p class="foot">登場する銀行・配送会社・企業・アプリ名は架空です。画面はすべて再現で、リンクは押しても飛びません。答えや点数はどこにも送信されず、自己ベストだけがこのブラウザに保存されます。</p>`;
  bindHome();
  document.getElementById('go').onclick = () => begin(0);
  document.getElementById('peek').onclick = () => { const b = document.getElementById('peekbox'); b.hidden = !b.hidden; };
  app.querySelectorAll('.level-card').forEach(b => b.onclick = () => begin(+b.dataset.lv));
}

function renderQ(){
  const q = Qs()[S.i], picked = S.picks[S.i], done = picked !== undefined;
  const order = S.orders[S.i] || q.choices.map((_,k)=>k);
  const stageNo = Qs().slice(0,S.i+1).filter(x=>x.stage===q.stage).length;
  const choices = order.map((k,pos)=>{
    const c = q.choices[k];
    let cls = '';
    if (done){ if (k===q.answer) cls='right'; else if (k===picked) cls='wrong'; }
    const why = done && c.why && (k===picked || k===q.answer) ? `<span class="why">${c.why}</span>` : '';
    return `<button class="choice ${cls}" data-k="${k}" ${done?'disabled':''}><span class="k">${pos+1}</span><span class="t${c.big?' big':''}">${c.t}${why}</span></button>`;
  }).join('');
  const ok = picked === q.answer;
  const verdict = done ? `
    <section class="verdict" aria-live="polite">
      <div class="v-head ${ok?'ok':'ng'}"><span class="stamp">${ok?'見破った':'ワナに掛かった'}</span><div class="v-trap">手口<b>${q.trap}</b></div></div>
      <div class="v-body">
        <div class="surprise">${q.surprise}</div>
        <p>${q.why}</p>
        ${q.extra ? q.extra() : ''}
        <div class="fix"><h3>対策</h3><ul>${q.fix.map(f=>`<li>${f}</li>`).join('')}</ul></div>
        ${q.src && q.src.length ? `<div class="src"><h3>参照元・もっと詳しく</h3><p class="src-help">リンクは新しいタブで開きます。「該当箇所」の文は、多くのブラウザでリンク先に黄色く表示されます。</p><ul>${q.src.map(s=>`<li><a href="${esc(srcHref(s))}" target="_blank" rel="noopener noreferrer">${esc(s.t)}</a><span class="src-by">${esc(s.by)}${s.en?'<span class="src-en">英語</span>':''}</span>${s.hl||s.note?`<div class="src-note"><b>該当箇所</b>${s.hl?`<q>${esc(s.hl)}</q>`:''}<span>${esc(s.note||'')}</span></div>`:''}</li>`).join('')}</ul></div>` : ''}
        <div class="row"><button class="btn" id="next">${S.i===Qs().length-1?'結果を見る':'次の問題へ'}</button></div>
      </div>
    </section>` : '';
  app.innerHTML = header() + `
    ${resumed ? '<p class="resume-note">前回の続きから再開しました。</p>' : ''}
    <section class="qhead"><span class="eyebrow">${L().name} ステージ${q.stage+1}「${L().stages[q.stage]}」 第${stageNo}問</span><h2>${q.title}</h2><p>${q.lead}</p></section>
    <section class="scene">${q.scene()}</section>
    <section class="choices" role="group" aria-label="選択肢">${choices}</section>${verdict}`;
  bindHome();
  app.querySelectorAll('.choice:not([disabled])').forEach(b => b.onclick = () => pick(+b.dataset.k));
  const nx = document.getElementById('next');
  if (nx){
    nx.onclick = next; nx.focus({preventScroll:true});
    app.querySelector('.verdict').scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth', block:'start'});
  }
}
function pick(k){ resumed = false; if (S.picks[S.i]!==undefined) return; S.picks[S.i]=k; render(); }
function next(){
  resumed = false;
  if (S.i < Qs().length-1){ S.i++; }
  else { S.screen='result'; if (S.picks.length===Qs().length) saveBest(L().id, correctCount()); }
  render(); window.scrollTo(0,0);
}

function renderResult(){
  const n = correctCount(), total = Qs().length;
  const rank = n===total ? 'ワナ見破りマスター' : n>=12 ? '上級ガードマン' : n>=8 ? '見習いガードマン' : 'ワナの伸びしろ大';
  const comment = n===total ? '全問見破りました。この問題を、身近な人にも出してみてください。'
    : n>=12 ? 'ほとんどのワナを避けられます。下の「掛かったワナ」だけ押さえておけば十分です。'
    : n>=8 ? '半分以上は見破れました。掛かったワナは、知っていれば次は避けられるものばかりです。'
    : '知らなければ掛かって当然の手口ばかりです。今日知ったことが、そのまま守りになります。';
  const missed = Qs().map((q,i)=>({q,i})).filter(({q,i})=>S.picks[i]!==q.answer);
  const nextLv = S.lv < LEVELS.length-1 ? S.lv+1 : null;
  app.innerHTML = header() + `
  <section class="result">
    <span class="eyebrow">${L().name} 検定結果</span>
    <div class="score"><b>${n}</b><span>/ ${total} 問 見破り</span></div>
    <div class="rank">${rank}</div>
    <p class="m0">${comment}</p>
    <div class="bystage">${L().stages.map((s,si)=>{const idx=Qs().map((q,i)=>i).filter(i=>Qs()[i].stage===si);const c=idx.filter(i=>S.picks[i]===Qs()[i].answer).length;return `<div><span>${s}</span><b>${c} / ${idx.length}</b></div>`;}).join('')}</div>
    ${missed.length ? `<div class="missed"><h3 class="h-sm">掛かったワナ</h3>${missed.map(({q,i})=>`<div class="missed-item"><span class="no">Q${i+1}</span><b>${q.trap}</b><span>${q.fix[0]}</span></div>`).join('')}</div>` : ''}
    <div class="habits"><h3 class="h-sm">明日からの5つの習慣</h3><ol>${L().habits.map(h=>`<li>${h}</li>`).join('')}</ol></div>
    <div class="row">
      ${nextLv!==null ? `<button class="btn" id="nextlv">${LEVELS[nextLv].name}（アドバンスト）に進む</button>` : ''}
      <button class="btn ${nextLv!==null?'ghost':''}" id="again">もう一度挑戦する</button>
      <button class="btn ghost" id="review">1問目から解説を見直す</button>
    </div>
  </section>
  <p class="foot">参考：<a href="https://www.ipa.go.jp/security/10threats/10threats2026.html" target="_blank" rel="noopener noreferrer">IPA 情報セキュリティ10大脅威 2026</a> ／ 警察庁・警視庁の注意喚起。被害に遭ったかもと思ったら、警察相談専用電話 #9110、消費者ホットライン 188 へ。</p>`;
  bindHome();
  const nl = document.getElementById('nextlv'); if (nl) nl.onclick = () => begin(nextLv);
  document.getElementById('again').onclick = () => begin(S.lv);
  document.getElementById('review').onclick = () => { S.screen='q'; S.i=0; render(); window.scrollTo(0,0); };
}

function render(){ if (S.screen==='start') renderStart(); else if (S.screen==='q') renderQ(); else renderResult(); saveProgress(); }

// キーボード：1〜4で選択（表示の番号）、Enterで次へ（ボタンにフォーカス済み）
document.addEventListener('keydown', e => {
  if (S.screen!=='q' || e.altKey || e.ctrlKey || e.metaKey) return;
  const n = parseInt(e.key,10), order = S.orders[S.i];
  if (order && n>=1 && n<=order.length && S.picks[S.i]===undefined) pick(order[n-1]);
});

const saved = loadProgress();
if (saved){ S = saved.S; resumed = S.screen === 'q'; }
render();
if (saved) requestAnimationFrame(() => window.scrollTo(0, saved.y || 0));
// 参照元を開く前・タブを離れる前に、スクロール位置も含めて保存する
window.addEventListener('pagehide', saveProgress);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveProgress(); });
app.addEventListener('click', e => { if (e.target.closest('.src a')) saveProgress(); });
