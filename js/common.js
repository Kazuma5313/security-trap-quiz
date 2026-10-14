'use strict';
// ---------- 共通ヘルパーと再現画面のパーツ ----------
const CHAR_NAMES = {
  'а':'キリル文字の а','о':'キリル文字の о','е':'キリル文字の е','ο':'ギリシャ文字の ο（オミクロン）',
  'I':'大文字のアイ','l':'小文字のエル','q':'小文字のキュー','g':'小文字のジー',
  '‮':'右から左に並べ替える見えない制御文字（RLO）'
};
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isCtl = cp => (cp >= 0x200B && cp <= 0x200F) || (cp >= 0x202A && cp <= 0x202E) || (cp >= 0x2066 && cp <= 0x2069);
function puny(host){ try { return new URL('http://' + host).hostname; } catch(e){ return host; } }

function glyphRow(str, opts = {}){
  const watch = opts.watch || [];
  const flag = ch => ch.codePointAt(0) > 127 && !opts.allowNonAscii || watch.includes(ch) || isCtl(ch.codePointAt(0));
  const chars = [...str].map(ch => {
    const cp = ch.codePointAt(0);
    const face = isCtl(cp) ? '<b class="ctl">RLO</b>' : `<b>${esc(ch)}</b>`;
    return `<span class="gl-c${flag(ch)?' bad':''}">${face}<i>${cp.toString(16).toUpperCase().padStart(4,'0')}</i></span>`;
  }).join('');
  const odd = [...new Set([...str].filter(flag))];
  const show = c => isCtl(c.codePointAt(0)) ? '（見えない文字）' : `<span class="mono">${esc(c)}</span>`;
  let note = odd.length
    ? '混ざっている文字：' + odd.map(c => `${show(c)} = ${CHAR_NAMES[c] || 'U+' + c.codePointAt(0).toString(16).toUpperCase()}`).join('、')
    : (opts.okText || 'すべて半角英数字。これが本物です。');
  if (!opts.noHost){
    const host = str.split('/')[0], p = puny(host);
    if (p !== host) note += `<br>ブラウザ内部での本当の名前：<span class="mono">${esc(p)}</span>`;
  }
  return `<div class="gl-row"><div class="gl-chars">${chars}</div><div class="gl-note">${note}</div></div>`;
}

const LOCK = '<svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17 9V7a5 5 0 0 0-10 0v2H5v13h14V9h-2Zm-8-2a3 3 0 0 1 6 0v2H9V7Z"/></svg>';
const browser = (url, body) => `<div class="browser"><div class="bbar"><span class="dots"><i></i><i></i><i></i></span><div class="addr">${LOCK}<span>${url}</span></div></div><div class="bbody">${body}</div></div>`;
const phone = (top, inner) => `<div class="phone"><div class="ph-top">${top}</div>${inner}</div>`;

function qrSvg(seed){
  // 見た目だけのQR風パターン（読み取れません）
  let s = seed; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const n = 21, c = 5; let r = '';
  const finder = (x,y) => `<rect x="${x*c}" y="${y*c}" width="${7*c}" height="${7*c}" fill="#000"/><rect x="${(x+1)*c}" y="${(y+1)*c}" width="${5*c}" height="${5*c}" fill="#fff"/><rect x="${(x+2)*c}" y="${(y+2)*c}" width="${3*c}" height="${3*c}" fill="#000"/>`;
  for (let y=0;y<n;y++) for (let x=0;x<n;x++){
    const inF = (x<8&&y<8)||(x>12&&y<8)||(x<8&&y>12);
    if (!inF && rnd() > .52) r += `<rect x="${x*c}" y="${y*c}" width="${c}" height="${c}" fill="#000"/>`;
  }
  return `<svg width="105" height="105" viewBox="0 0 105 105" role="img" aria-label="QRコード風の図"><rect width="105" height="105" fill="#fff"/>${r}${finder(0,0)}${finder(14,0)}${finder(0,14)}</svg>`;
}

const LEVELS = [];
