/* Zyqor Studio — Type Specimen. One script for both builds (body[data-build] = d | m). */
(function(){
"use strict";
var M = document.body.getAttribute('data-build') === 'm';
var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
var $ = function(s, r){ return (r || document).querySelector(s); };
var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
var clamp = function(v, a, b){ return Math.max(a, Math.min(b, v)); };
var MET = {"bricolage": {"A": 0.93, "D": 0.27, "cap": 0.66, "xh": 0.528, "asc": 0.7, "desc": 0.148, "capU": 660, "xhU": 528, "ascU": 700, "descU": 148, "upm": 1000, "glyphs": 212}, "fraunces": {"A": 0.978, "D": 0.255, "cap": 0.7, "xh": 0.482, "asc": 0.755, "desc": 0.233, "capU": 1400, "xhU": 964, "ascU": 1510, "descU": 466, "upm": 2000, "glyphs": 213}, "satoshi": {"A": 1.01, "D": 0.24, "cap": 0.74, "xh": 0.5, "asc": 0.754, "desc": 0.24, "capU": 740, "xhU": 500, "ascU": 754, "descU": 240, "upm": 1000, "glyphs": 234}, "cabinet": {"A": 0.87, "D": 0.28, "cap": 0.67, "xh": 0.494, "asc": 0.67, "desc": 0.186, "capU": 670, "xhU": 494, "ascU": 670, "descU": 186, "upm": 1000, "glyphs": 214}, "zodiak": {"A": 0.99, "D": 0.28, "cap": 0.7, "xh": 0.52, "asc": 0.72, "desc": 0.2, "capU": 700, "xhU": 520, "ascU": 720, "descU": 200, "upm": 1000, "glyphs": 218}, "general": {"A": 1.01, "D": 0.24, "cap": 0.718, "xh": 0.538, "asc": 0.718, "desc": 0.193, "capU": 718, "xhU": 538, "ascU": 718, "descU": 193, "upm": 1000, "glyphs": 220}, "instrument": {"A": 0.99, "D": 0.31, "cap": 0.72, "xh": 0.51, "asc": 0.74, "desc": 0.205, "capU": 720, "xhU": 510, "ascU": 740, "descU": 205, "upm": 1000, "glyphs": 206}};

/* ---------- families ---------- */
var FAM = [
 {k:'bricolage', name:'Bricolage Grotesque', css:"'Bricolage V'", w0:420, w1:800, fvs:'"opsz" 96', role:'Display with three axes', use:'Hero lines, posters, narrow interface headings',
  designer:'Mathieu Triay', lic:'SIL Open Font License 1.1', src:'https://github.com/ateliertriay/bricolage', axes:'opsz 12–96 · wdth 75–100 · wght 200–800',
  weights:[200,300,400,500,600,700,800], sample:'Narrow at 75, generous at 100: one file, every headline width.',
  pa:'Bricolage carries three axes in one file. We push width down to fit long names on a phone and let optical size open the spacing when a line drops to caption size.',
  pb:'It is our default when a brand needs personality without a novelty face. The ink traps and slightly irregular curves survive at 400 pixels, where most grotesks start to look like every other grotesk. Below 14 pixels we hand over to Satoshi.'},
 {k:'fraunces', name:'Fraunces', css:"'Fraunces V'", w0:300, w1:900, fvs:'"opsz" 144, "SOFT" 100, "WONK" 1', role:'Soft old-style serif', use:'Menus, food and hospitality, long reads',
  designer:'Phaedra Charles & Flavia Zimbardi, Undercase Type', lic:'SIL Open Font License 1.1', src:'https://github.com/undercasetype/Fraunces', axes:'opsz 9–144 · wght 100–900 · SOFT 0–100 · WONK',
  weights:[100,300,400,600,900], sample:'Soft serifs for menus, labels and slow Sunday reading.',
  pa:'Fraunces swings from crisp to doughy on its SOFT axis and grows leaning, "wonky" letters at large optical sizes. Few free serifs give that much range.',
  pb:'We set it soft and large for restaurants, bakeries and anything that should feel made by hand, and sharp at small sizes for body copy. Its optical size axis changes contrast and spacing automatically, so 12-pixel footnotes stay sturdy.'},
 {k:'satoshi', name:'Satoshi', css:"'Satoshi V'", w0:400, w1:900, fvs:'', role:'Workhorse text and UI', use:'Body copy, interfaces, tables and labels',
  designer:'Deni Anggara, Indian Type Foundry', lic:'ITF Free Font License', src:'https://www.fontshare.com/fonts/satoshi', axes:'wght 300–900',
  weights:[300,400,500,700,900], sample:'The 14px line that has to work on a budget phone in direct sun.',
  pa:'Satoshi is the face this page is set in. Geometric enough to feel current, with open apertures and a tall x-height that hold up on small, cheap screens.',
  pb:'It has the features a working site needs: tabular and proportional figures, real fractions, superiors and case-sensitive punctuation. That makes it our default for price tables, timetables and dashboards as well as plain reading.'},
 {k:'cabinet', name:'Cabinet Grotesk', css:"'Cabinet V'", w0:400, w1:900, fvs:'', role:'Tight display grotesk', use:'Product launches, big claims, short headlines',
  designer:'Shiva Nallaperumal, Indian Type Foundry', lic:'ITF Free Font License', src:'https://www.fontshare.com/fonts/cabinet-grotesk', axes:'wght 100–900',
  weights:[100,300,400,500,700,800,900], sample:'Tight, loud and still legible at 140 pixels.',
  pa:'Cabinet Grotesk has small apertures and a compact rhythm, so heavy weights pack tightly without the letters bleeding into each other.',
  pb:'We use it for product headlines that need to land in two seconds, usually at 700 to 900 with negative tracking. It is too tight for paragraphs, which is exactly why it pairs well with an open text face.'},
 {k:'zodiak', name:'Zodiak', css:"'Zodiak V'", w0:300, w1:900, fvs:'', role:'High-contrast display serif', use:'Posters, fashion, editorial covers',
  designer:'Jérémie Hornus, Gaëtan Baehr, J.-B. Morizot, Alisa Nowak, Théo Guillard (ITF)', lic:'ITF Free Font License', src:'https://www.fontshare.com/fonts/zodiak', axes:'wght 100–900',
  weights:[100,300,400,700,800,900], sample:'Wedge serifs with a sharp sense of occasion.',
  pa:'Zodiak runs from a hairline Thin to a heavy Black with sharp wedge serifs throughout, so one family covers both the whisper and the shout.',
  pb:'Its contrast needs room: we keep it above 32 pixels and let a neutral grotesk handle anything smaller. Mixing Thin and Black in the same headline is often all the contrast a poster needs.'},
 {k:'general', name:'General Sans', css:"'General Sans V'", w0:400, w1:700, fvs:'', role:'Neutral sans for small sizes', use:'Captions, ingredient lists, legal lines',
  designer:'Indian Type Foundry', lic:'ITF Free Font License', src:'https://www.fontshare.com/fonts/general-sans', axes:'wght 200–700',
  weights:[200,300,400,500,600,700], sample:'Plain, sturdy and quietly modern at caption sizes.',
  pa:'General Sans is the quiet one. Slightly squarer than Satoshi, with even colour that keeps small text calm next to an expressive display face.',
  pb:'We reach for it when the headline face is loud and the supporting copy should disappear: menu descriptions, product specs, footers. It sets well at 11 to 13 pixels with a touch of positive tracking.'},
 {k:'instrument', name:'Instrument Serif', css:"'Instrument Serif'", w0:400, w1:400, fvs:'', italic:true, role:'Condensed editorial serif', use:'Magazine headlines, pull quotes, decks',
  designer:'Rodrigo Fuenzalida & Jordan Egstad, Instrument', lic:'SIL Open Font License 1.1', src:'https://github.com/Instrument/instrument-serif', axes:'Regular + Italic (static)',
  weights:['Regular','Italic'], sample:'A narrow serif that fits a magazine headline in two lines.',
  pa:'Instrument Serif is condensed and high-contrast with a lively italic, so headlines read as editorial while taking very little width.',
  pb:'It only comes in one weight, which keeps us honest: hierarchy has to come from size, italics and space, not from bolding. We set it large, tracked slightly tight, with a grotesk underneath for everything practical.'}
];
var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789&@?!.,:;‘’“”()[]/-–—*+=%#₹$€§¶'.split('');

/* ---------- range fill ---------- */
function fill(r){ var p = (r.value - r.min) / (r.max - r.min) * 100; r.style.setProperty('--p', p + '%'); }
$$('input[type=range]').forEach(function(r){ fill(r); r.addEventListener('input', function(){ fill(r); }); });

/* ---------- reveals ---------- */
function reveals(root){
  var els = $$('[data-rv]:not(.in)', root);
  if (reduced || !('IntersectionObserver' in window)) { els.forEach(function(e){ e.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); }, {rootMargin:'0px 0px -8% 0px'});
  els.forEach(function(e){ io.observe(e); });
}

/* ---------- hero: live variable axes ---------- */
(function hero(){
  var word = $('#hWord'); if (!word) return;
  var txt = word.textContent; word.textContent = '';
  var spans = txt.split('').map(function(ch){ var s = document.createElement('span'); s.textContent = ch; s.setAttribute('aria-hidden','true'); word.appendChild(s); return s; });
  var aW = $('#aW'), aS = $('#aS'), aO = $('#aO'), read = $('#axRead'), stage = $('#hStage'), lines = $('#hLines');
  var oW = $('#oW'), oS = $('#oS'), oO = $('#oO');
  var wave = !M, px = -1, inside = false;
  var cur = spans.map(function(){ return {w:200, s:75, b:0}; });
  var t0 = performance.now(), introDur = reduced ? 0 : 1600;
  function base(){ return {w:+aW.value, s:+aS.value, o:+aO.value}; }
  function placeLines(){
    if (!lines) return;
    var fs = parseFloat(getComputedStyle(word).fontSize), m = MET.bricolage;
    var top = word.offsetTop, baseY = top + m.A * fs;
    var y = [baseY - m.asc*fs, baseY - m.cap*fs, baseY - m.xh*fs, baseY, baseY + m.desc*fs];
    $$('i', lines).forEach(function(l, i){ l.style.top = y[i] + 'px'; });
  }
  function frame(now){
    var b = base(), k = introDur ? clamp((now - t0) / introDur, 0, 1) : 1;
    var rect = word.getBoundingClientRect(), hot = -1, best = 1e9;
    spans.forEach(function(s, i){
      var r = s.getBoundingClientRect(), cx = r.left + r.width/2;
      var bump = 0;
      if (wave && inside && px >= 0){ var d = (px - cx) / (rect.width * 0.16); bump = Math.exp(-d*d); if (Math.abs(px-cx) < best){ best = Math.abs(px-cx); hot = i; } }
      var stag = clamp(k * 1.6 - i * 0.12, 0, 1), e = 1 - Math.pow(1 - stag, 4);
      var tw = 200 + (b.w - 200) * e, ts = 75 + (b.s - 75) * e;
      tw = tw + (800 - tw) * bump * 0.95; ts = ts + (100 - ts) * bump * 0.6;
      var c = cur[i], f = reduced ? 1 : 0.16;
      c.w += (tw - c.w) * f; c.s += (ts - c.s) * f;
      s.style.setProperty('--w', c.w.toFixed(1)); s.style.setProperty('--s', c.s.toFixed(2) + '%'); s.style.setProperty('--o', b.o);
    });
    spans.forEach(function(s, i){ s.classList.toggle('hot', i === hot && best < rect.width * 0.12); });
    requestAnimationFrame(frame);
  }
  function out(){ oW.textContent = aW.value; oS.textContent = aS.value; oO.textContent = aO.value;
    read.textContent = 'opsz ' + aO.value + ' · wdth ' + aS.value + ' · wght ' + aW.value; }
  [aW, aS, aO].forEach(function(r){ r.addEventListener('input', out); });
  out();
  if (stage && !M){
    stage.addEventListener('pointermove', function(e){ px = e.clientX; inside = true; });
    stage.addEventListener('pointerleave', function(){ inside = false; });
  }
  var cW = $('#cWave'), cO = $('#cOff');
  if (cW && cO){
    var setWave = function(v){ wave = v; cW.setAttribute('aria-pressed', v); cO.setAttribute('aria-pressed', !v); };
    cW.addEventListener('click', function(){ setWave(true); }); cO.addEventListener('click', function(){ setWave(false); });
    if (reduced) setWave(false);
  }
  addEventListener('resize', placeLines);
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(function(){ placeLines(); t0 = performance.now(); requestAnimationFrame(frame); });
  placeLines();
})();

/* ---------- shelf ---------- */
var specPanel = $('#specPanel'), tabs = $('#tabs'), current = 0;
var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
(function shelf(){
  var ul = $('#shelfList'); if (!ul) return;
  ul.innerHTML = FAM.map(function(f, i){
    return '<li data-rv><button type="button" data-i="' + i + '" style="--w0:' + f.w0 + ';--w1:' + f.w1 + '">' +
      '<span class="i">' + String(i+1).padStart(2,'0') + '</span>' +
      '<span class="nm" style="font-family:' + f.css + ';font-variation-settings:' + (f.fvs || 'normal') + '">' + esc(f.name) + '</span>' +
      '<span class="rl">' + esc(f.role) + '<small>' + esc(f.use) + '</small></span>' +
      '<span class="ax">' + esc(f.axes) + '<br>' + esc(f.lic) + '</span>' +
      (M ? '' : '<span class="go">' + ARROW + '</span>') + '</button></li>';
  }).join('');
  $$('button', ul).forEach(function(b){ b.addEventListener('click', function(){ var i = +b.dataset.i;
    if (M){ var d = $$('#specList details')[i]; if (d){ d.open = true; d.scrollIntoView({behavior: reduced ? 'auto' : 'smooth', block:'start'}); } return; }
    select(i, false); go('#specimens'); }); });
})();


/* ---------- specimens ---------- */
function specHTML(f){
  var m = MET[f.k], fv = f.fvs ? ';font-variation-settings:' + f.fvs : '';
  var fam = 'font-family:' + f.css + fv;
  var grid = GLYPHS.map(function(g, i){ return '<button type="button" data-g="' + i + '" aria-label="Inspect ' + (g === ' ' ? 'space' : esc(g)) + '"' + (i === 32 ? ' class="on"' : '') + '>' + esc(g) + '</button>'; }).join('');
  var sizes = M ? [56, 32, 20, 14] : [112, 72, 48, 32, 20, 14];
  var fall = sizes.map(function(s){ return '<div><small>' + s + ' px</small><p style="font-size:' + s + 'px;letter-spacing:' + (s > 40 ? '-0.03em' : s > 24 ? '-0.015em' : '0') + '">' + esc(f.sample) + '</p></div>'; }).join('');
  var wts = f.weights.map(function(w){
    var st = f.italic ? (w === 'Italic' ? 'font-style:italic' : '') : 'font-weight:' + w;
    return '<span style="' + st + '"><small>' + w + '</small>Ag</span>'; }).join('');
  var meta = '<div><span class="lbl lbl--mute">Designer</span><b>' + esc(f.designer) + '</b></div>' +
    '<div><span class="lbl lbl--mute">Licence</span><b>' + esc(f.lic) + '</b></div>' +
    '<div><span class="lbl lbl--mute">Axes</span><b>' + esc(f.axes) + '</b></div>' +
    '<div><span class="lbl lbl--mute">Glyphs shipped</span><b>' + m.glyphs + ' Latin &middot; <a href="' + f.src + '" target="_blank" rel="noopener">source</a></b></div>';
  if (M){
    return '<div class="sp-meta">' + meta + '</div>' +
      '<div class="sp-grid" style="' + fam + '">' + grid + '</div>' +
      '<div class="sp-fall" style="' + fam + '">' + fall + '</div>' +
      '<div class="sp-weights" style="' + fam + '"><span class="lbl">Weights</span><div class="w">' + wts + '</div></div>' +
      '<div class="sp-par" style="' + fam + '"><p class="a">' + esc(f.pa) + '</p></div>';
  }
  return '<div class="spec" style="' + fam + '">' +
    '<h3 class="sp-name" style="font-weight:' + (f.italic ? 400 : Math.min(f.w1, 760)) + '">' + esc(f.name) + '</h3>' +
    '<div class="sp-meta" style="font-family:var(--f-text);font-variation-settings:normal">' + meta + '</div>' +
    '<div class="sp-insp" id="insp" aria-live="polite"></div>' +
    '<div class="sp-grid">' + grid + '</div>' +
    '<div class="sp-fall">' + fall + '</div>' +
    '<div class="sp-weights"><span class="lbl" style="font-family:var(--f-text)">Weight run</span><div class="w">' + wts + '</div></div>' +
    '<div class="sp-par"><span class="lbl" style="font-family:var(--f-text)">Setting &middot; 19/28 and 13.5/21</span><p class="a">' + esc(f.pa) + '</p><p class="b">' + esc(f.pb) + '</p></div>' +
    '</div>';
}
function inspect(f, g){
  var box = $('#insp'); if (!box) return;
  var m = MET[f.k], H = box.clientHeight, G = H * 0.56, base = H * 0.72;
  var off = ((1 - (m.A + m.D)) / 2 + m.A) * G;
  var L = [['Ascender', m.ascU, base - m.asc*G], ['Cap height', m.capU, base - m.cap*G], ['x-height', m.xhU, base - m.xh*G], ['Baseline', 0, base], ['Descender', -m.descU, base + m.desc*G]];
  var fv = f.fvs ? 'font-variation-settings:' + f.fvs + ';' : '';
  box.innerHTML = L.map(function(l, i){ return '<div class="ml' + (i === 3 ? ' b' : '') + '" style="top:' + l[2].toFixed(1) + 'px"><span>' + l[0] + '</span><em>' + l[1] + '</em></div>'; }).join('') +
    '<div class="gl" style="top:' + (base - off).toFixed(1) + 'px;font-size:' + G.toFixed(1) + 'px;line-height:1;font-family:' + f.css + ';' + fv + 'font-weight:' + (f.italic ? 400 : f.w0 + 120) + '">' + esc(g) + '</div>' +
    '<div class="cap"><span>' + esc(f.name) + '</span><span>U+' + g.codePointAt(0).toString(16).toUpperCase().padStart(4,'0') + ' &middot; ' + m.upm + ' upm</span></div>';
}
function select(i, focus){
  current = i; var f = FAM[i];
  $$('[role=tab]', tabs).forEach(function(t, j){ t.setAttribute('aria-selected', j === i); t.tabIndex = j === i ? 0 : -1; if (j === i && focus) t.focus(); });
  specPanel.setAttribute('aria-labelledby', 'tab-' + f.k);
  specPanel.innerHTML = specHTML(f);
  inspect(f, GLYPHS[32]);
  var grid = $('.sp-grid', specPanel);
  var pick = function(b){ $$('.on', grid).forEach(function(x){ x.classList.remove('on'); }); b.classList.add('on'); inspect(f, GLYPHS[+b.dataset.g]); };
  grid.addEventListener('pointerover', function(e){ var b = e.target.closest('button'); if (b) pick(b); });
  grid.addEventListener('focusin', function(e){ var b = e.target.closest('button'); if (b) pick(b); });
  grid.addEventListener('click', function(e){ var b = e.target.closest('button'); if (b) pick(b); });
  if (!reduced) specPanel.animate([{opacity:0, transform:'translateY(14px)'}, {opacity:1, transform:'none'}], {duration:700, easing:'cubic-bezier(.2,.75,.15,1)'});
}
if (tabs && specPanel){
  tabs.innerHTML = FAM.map(function(f, i){ return '<button type="button" role="tab" id="tab-' + f.k + '" aria-controls="specPanel" aria-selected="false" tabindex="-1" style="font-family:' + f.css + (f.fvs ? ';font-variation-settings:' + f.fvs : '') + ';font-weight:' + (f.italic ? 400 : 560) + '">' + esc(f.name) + '</button>'; }).join('');
  $$('[role=tab]', tabs).forEach(function(t, i){ t.addEventListener('click', function(){ select(i, false); }); });
  tabs.addEventListener('keydown', function(e){
    var n = FAM.length, k = e.key, i = current;
    if (k === 'ArrowRight') i = (current + 1) % n; else if (k === 'ArrowLeft') i = (current - 1 + n) % n; else if (k === 'Home') i = 0; else if (k === 'End') i = n - 1; else return;
    e.preventDefault(); select(i, true);
  });
  select(0, false);
  addEventListener('resize', function(){ var b = $('.sp-grid .on', specPanel); inspect(FAM[current], b ? GLYPHS[+b.dataset.g] : GLYPHS[32]); });
}
/* phone accordion */
(function acc(){
  var list = $('#specList'); if (!list) return;
  list.innerHTML = FAM.map(function(f, i){
    return '<details data-i="' + i + '"><summary><span class="i">' + String(i+1).padStart(2,'0') + '</span><span class="nm" style="font-family:' + f.css + (f.fvs ? ';font-variation-settings:' + f.fvs : '') + ';font-weight:' + (f.italic ? 400 : 640) + '">' + esc(f.name) + '</span><span class="pl" aria-hidden="true"></span></summary><div class="body"></div></details>';
  }).join('');
  $$('details', list).forEach(function(d){ d.addEventListener('toggle', function(){
    if (!d.open) return;
    $$('details', list).forEach(function(o){ if (o !== d) o.open = false; });
    var b = $('.body', d); if (!b.innerHTML) b.innerHTML = specHTML(FAM[+d.dataset.i]);
  }); });
})();


/* ---------- tester ---------- */
var PAIR = [
 {d:"'Cabinet V'", dn:'Cabinet Grotesk', dcss:'"Cabinet Grotesk"', t:"'Satoshi V'", tn:'Satoshi', fvs:'', st:'', w:800, wr:[100,900], track:-30, lead:92, size:96},
 {d:"'Fraunces V'", dn:'Fraunces', dcss:'"Fraunces"', t:"'General Sans V'", tn:'General Sans', fvs:'"opsz" 144, "SOFT" 100, "WONK" 1', st:'', w:560, wr:[100,900], track:-20, lead:96, size:92},
 {d:"'Instrument Serif'", dn:'Instrument Serif', dcss:'"Instrument Serif"', t:"'Satoshi V'", tn:'Satoshi', fvs:'', st:'', w:400, wr:[400,400], track:-25, lead:90, size:110},
 {d:"'Bricolage V'", dn:'Bricolage Grotesque', dcss:'"Bricolage Grotesque"', t:"'Satoshi V'", tn:'Satoshi', fvs:'"opsz" 96', st:'78%', w:720, wr:[200,800], track:-30, lead:92, size:100},
 {d:"'Zodiak V'", dn:'Zodiak', dcss:'"Zodiak"', t:"'Bricolage V'", tn:'Bricolage Grotesque', fvs:'', st:'', w:880, wr:[100,900], track:-40, lead:88, size:104, tst:'88%'}
];
(function tester(){
  var H = $('#tH'); if (!H) return;
  var P = $('#tP'), chips = $$('#tChips button'), sel = $('#tPair');
  var tS = $('#tS'), tT = $('#tT'), tL = $('#tL'), tW = $('#tW'), code = $('#tCode'), name = $('#tName'), al = 'left', pi = 0;
  function setR(r, v){ if (!r) return; r.value = v; fill(r); }
  function apply(){
    var p = PAIR[pi], s = +tS.value, tr = (tT ? +tT.value : p.track) / 1000, ld = (tL ? +tL.value : p.lead) / 100, w = tW ? +tW.value : p.w;
    H.style.fontFamily = p.d; H.style.fontVariationSettings = p.fvs || 'normal'; H.style.fontStretch = p.st || '100%';
    H.style.fontWeight = w; H.style.fontSize = s + 'px'; H.style.letterSpacing = tr + 'em'; H.style.lineHeight = ld; H.style.textAlign = al;
    P.style.fontFamily = p.t; P.style.fontStretch = p.tst || '100%'; P.style.textAlign = al; P.style.marginLeft = al === 'center' ? 'auto' : ''; P.style.marginRight = al === 'center' ? 'auto' : '';
    $('#otS').textContent = s + 'px';
    if (tT) $('#otT').textContent = (tr >= 0 ? '+' : '') + tr.toFixed(3) + 'em';
    if (tL) $('#otL').textContent = ld.toFixed(2);
    if (tW){ $('#otW').textContent = w; tW.disabled = p.wr[0] === p.wr[1]; }
    if (name) name.textContent = p.dn + ' ' + w + ' / ' + p.tn + ' 420';
    if (code) code.textContent =
      '.headline {\n  font-family: ' + p.dcss + ', serif;\n  font-weight: ' + w + ';\n' + (p.st ? '  font-stretch: ' + p.st + ';\n' : '') + (p.fvs ? '  font-variation-settings: ' + p.fvs + ';\n' : '') +
      '  font-size: ' + s + 'px;\n  line-height: ' + ld.toFixed(2) + ';\n  letter-spacing: ' + tr.toFixed(3) + 'em;\n}\n' +
      '.body {\n  font-family: "' + p.tn + '", sans-serif;\n  font-size: 18px;\n  line-height: 1.55;\n  max-width: 62ch;\n}';
  }
  function pick(i, keep){
    pi = i; var p = PAIR[i];
    chips.forEach(function(c, j){ c.setAttribute('aria-pressed', j === i); });
    if (sel) sel.value = i;
    if (!keep){ if (tW){ tW.min = p.wr[0]; tW.max = p.wr[1]; } setR(tW, p.w); setR(tT, p.track); setR(tL, p.lead); setR(tS, M ? Math.round(p.size * 0.5) : p.size); }
    apply();
  }
  chips.forEach(function(c, i){ c.addEventListener('click', function(){ pick(i); }); });
  if (sel) sel.addEventListener('change', function(){ pick(+sel.value); });
  [tS, tT, tL, tW].forEach(function(r){ if (r) r.addEventListener('input', apply); });
  $$('[data-al]').forEach(function(b){ b.addEventListener('click', function(){ al = b.dataset.al; $$('[data-al]').forEach(function(x){ x.setAttribute('aria-pressed', x === b); }); apply(); }); });
  var reset = $('#tReset'); if (reset) reset.addEventListener('click', function(){ H.textContent = 'Your brand name, set properly.'; pick(pi); });
  var copy = $('#tCopy');
  if (copy) copy.addEventListener('click', function(){
    var t = code.textContent, lab = $('span', copy);
    var done = function(){ lab.textContent = 'Copied'; setTimeout(function(){ lab.textContent = 'Copy CSS'; }, 1600); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(done, done);
    else { var ta = document.createElement('textarea'); ta.value = t; ta.setAttribute('readonly',''); ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch(e){} ta.remove(); done(); }
  });
  H.addEventListener('keydown', function(e){ if (e.key === 'Enter'){ e.preventDefault(); H.blur(); } });
  pick(0);
})();

/* ---------- rules ---------- */
(function rules(){
  var sc = $('#scale');
  if (sc){
    var draw = function(r){
      var steps = M ? 6 : 7, out = '', avail = sc.clientWidth, sizes = [];
      for (var i = 0; i < steps; i++) sizes.push(16 * Math.pow(r, i));
      var need = sizes.reduce(function(a, s){ return a + s * 1.15 + 10; }, 0), tall = (M ? 110 : 168) / (sizes[steps - 1] * .82), k = Math.min(avail / need, tall);
      sizes.forEach(function(s){ out += '<div><b style="font-size:' + (s * k).toFixed(1) + 'px">Aa</b><small>' + Math.round(s) + '</small></div>'; });
      sc.innerHTML = out;
    };
    var btns = $$('#ratio button');
    btns.forEach(function(b){ b.addEventListener('click', function(){ btns.forEach(function(x){ x.setAttribute('aria-pressed', x === b); }); draw(+b.dataset.r); }); });
    draw(1.25);
    addEventListener('resize', function(){ var on = $('#ratio [aria-pressed=true]'); draw(on ? +on.dataset.r : 1.25); });
  }
  var mT = $('#mText'), mW = $('#mW');
  if (mT && mW){
    var cnv = document.createElement('canvas').getContext('2d'), ruler = $('#mRuler'), zone = $('#mZone'), cnt = $('#mCnt'), omW = $('#omW');
    var avg = 0;
    var measure = function(){
      var cs = getComputedStyle(mT); cnv.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
      var t = mT.textContent.replace(/\s+/g, ' ').trim(); avg = cnv.measureText(t).width / t.length;
      var full = ruler.clientWidth;
      var lo = +(ruler.dataset.lo || 60), hi = +(ruler.dataset.hi || 75);
      zone.style.left = Math.min(full, lo * avg) + 'px'; zone.style.width = Math.max(0, Math.min(full, hi * avg) - Math.min(full, lo * avg)) + 'px';
      var w = full * (+mW.value / 100); mT.style.maxWidth = w + 'px';
      var ch = Math.round(w / avg); cnt.textContent = ch; cnt.classList.toggle('bad', ch < lo || ch > hi);
      if (omW) omW.textContent = Math.round(+mW.value) + '%';
    };
    mW.addEventListener('input', measure); addEventListener('resize', measure);
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(function(){
      var full = ruler.clientWidth, cs = getComputedStyle(mT); cnv.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
      var t = mT.textContent.replace(/\s+/g, ' ').trim(); avg = cnv.measureText(t).width / t.length;
      var v = clamp(Math.round((M ? 42 : 68) * avg / full * 100), +mW.min, +mW.max); mW.value = v; fill(mW); measure();
    });
  }
  var on = $('#trOn'), off = $('#trOff');
  if (on && off){
    var setT = function(v){ on.setAttribute('aria-pressed', v); off.setAttribute('aria-pressed', !v);
      $$('#track p').forEach(function(p){ p.style.letterSpacing = v ? p.dataset.t + 'em' : '0em'; }); };
    on.addEventListener('click', function(){ setT(true); }); off.addEventListener('click', function(){ setT(false); }); setT(true);
  }
})();

/* ---------- nav, smooth scroll ---------- */
var lenis = null;
function go(sel){
  var el = $(sel); if (!el) return;
  if (lenis) lenis.scrollTo(el, {offset: -10, duration: 1.4});
  else el.scrollIntoView({behavior: reduced ? 'auto' : 'smooth', block: 'start'});
}
$$('a[href^="#"]').forEach(function(a){ a.addEventListener('click', function(e){
  var h = a.getAttribute('href'); if (h.length < 2 || !$(h)) return; e.preventDefault(); go(h); history.replaceState(null, '', h); }); });
if (!M && !reduced && window.Lenis){
  lenis = new window.Lenis({lerp: 0.09, wheelMultiplier: 0.95});
  var raf = function(t){ lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf);
}
var links = $$('.bar nav a');
if (links.length && 'IntersectionObserver' in window){
  var nio = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting){ var id = '#' + e.target.id; links.forEach(function(l){ l.classList.toggle('on', l.getAttribute('href') === id); }); } }); }, {rootMargin: '-45% 0px -50% 0px'});
  links.forEach(function(l){ var s = $(l.getAttribute('href')); if (s) nio.observe(s); });
}
reveals(document);

})();
