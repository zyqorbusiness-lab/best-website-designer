// Colour Theory, by Zyqor Studio. One module for both builds:
// desktop (index.html) adds GSAP + ScrollTrigger + Lenis; phone (m.html) uses native scroll + IntersectionObserver.
import { CONCEPTS } from "../lab/_kit/registry.js";

const D = document, R = D.documentElement;
const isM = R.dataset.build === "m";
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, el = D) => el.querySelector(s);
const $$ = (s, el = D) => [...el.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const G = () => (!isM && !reduced && window.gsap) ? window.gsap : null;

/* ================= colour maths ================= */
const hex2rgb = h => { h = h.replace("#", ""); if (h.length === 3) h = h.split("").map(c => c + c).join(""); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const rgb2hex = (r, g, b) => "#" + [r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0")).join("").toUpperCase();
const validHex = s => /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s.trim());
const normHex = s => { s = s.trim().replace("#", ""); if (s.length === 3) s = s.split("").map(c => c + c).join(""); return "#" + s.toUpperCase(); };
const toLin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const fromLin = c => 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
function lum(hex) { const [r, g, b] = hex2rgb(hex).map(toLin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; }
function ratio(a, b) { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
// WCAG says no rounding up: 4.49 fails 4.5. Show two decimals, floor-truncated.
const fmt = r => (Math.floor(r * 100) / 100).toFixed(2);
function hsl2rgb(h, s, l) { s /= 100; l /= 100; const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l); const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); return [255 * f(0), 255 * f(8), 255 * f(4)]; }
function rgb2hsl(r, g, b) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2; if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return [h, s * 100, l * 100]; }
const hexHue = hex => rgb2hsl(...hex2rgb(hex))[0];
// OKLab / OKLCH (Bjorn Ottosson)
function hex2oklch(hex) {
  const [r, g, b] = hex2rgb(hex).map(toLin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b), s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s, A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s, B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
  return [L, Math.hypot(A, B), (Math.atan2(B, A) * 180 / Math.PI + 360) % 360];
}
function oklchLin(L, C, H) {
  const a = C * Math.cos(H * Math.PI / 180), b = C * Math.sin(H * Math.PI / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s];
}
const inGamut = c => c.every(v => v >= -1e-4 && v <= 1 + 1e-4);
function oklch2hex(L, C, H) { // clamp chroma into sRGB
  let lo = 0, hi = C, c = oklchLin(L, C, H);
  if (!inGamut(c)) { for (let i = 0; i < 22; i++) { const mid = (lo + hi) / 2; if (inGamut(oklchLin(L, mid, H))) lo = mid; else hi = mid; } c = oklchLin(L, lo, H); }
  return rgb2hex(...c.map(v => fromLin(clamp(v, 0, 1))));
}
// warmth: chroma-weighted pull towards orange (OKLCH hue ~60) vs blue (~240)
const warmth = hex => { const [, C, H] = hex2oklch(hex); return C * Math.cos((H - 60) * Math.PI / 180); };
const readable = (bg, a = "#17423C", b = "#F3EDE1") => ratio(bg, a) >= ratio(bg, b) ? a : b;

/* ================= small UI helpers ================= */
const toast = $("#toast"), toastT = $("#toastT"), toastSw = $("#toastSw");
let tt;
async function copy(text, swatch, label) {
  let ok = false;
  try { await navigator.clipboard.writeText(text); ok = true; } catch (e) {
    const ta = D.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", ""); ta.style.cssText = "position:fixed;opacity:0;left:-9999px"; D.body.appendChild(ta); ta.select();
    try { ok = D.execCommand("copy"); } catch (e2) { ok = false; } ta.remove();
  }
  toastT.textContent = ok ? (label || ("Copied " + text)) : "Copy blocked here: " + text;
  toastSw.style.background = swatch || "transparent"; toastSw.style.display = swatch ? "block" : "none";
  toast.classList.add("on"); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove("on"), 1900);
}
const icon = id => $("#ic-" + id).innerHTML;

/* ================= themes: scroll-driven colour ================= */
const THEMES = {
  ivory: { bg: "#F3EDE1", ink: "#17423C", acc: "#B5832F", dark: 0 },
  ivory2: { bg: "#EEE6D6", ink: "#17423C", acc: "#8F6420", dark: 0 },
  paper: { bg: "#FAF6EE", ink: "#17423C", acc: "#8F6420", dark: 0 },
  pine: { bg: "#17423C", ink: "#F3EDE1", acc: "#D9B56A", dark: 1 },
  ochre: { bg: "#B5832F", ink: "#17423C", acc: "#F3EDE1", dark: 0 },
};
const mix = (hex, a) => { const [r, g, b] = hex2rgb(hex); return `rgba(${r},${g},${b},${a})`; };
let curTheme = "";
function applyTheme(name) {
  if (name === curTheme) return; curTheme = name;
  const t = THEMES[name]; if (!t) return;
  const vars = { "--bg": t.bg, "--ink": t.ink, "--acc": t.acc, "--mut": mix(t.ink, name === "ochre" ? .86 : .68), "--line": mix(t.ink, .17) };
  R.classList.toggle("is-dark", !!t.dark);
  const meta = $('meta[name="theme-color"]'); if (meta) meta.content = t.bg;
  const g = G();
  if (g) g.to(R, { ...vars, duration: 1.05, ease: "power3.inOut", overwrite: "auto" });
  else for (const k in vars) R.style.setProperty(k, vars[k]);
}
function themeWatch() {
  const secs = $$("[data-theme]");
  const rail = $$(".rail a");
  const io = new IntersectionObserver(es => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      applyTheme(e.target.dataset.theme);
      rail.forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id));
      R.classList.toggle("in-hero", e.target.id === "top");
    });
  }, { rootMargin: "-48% 0px -48% 0px" });
  secs.forEach(s => io.observe(s));
}
function reveals() {
  const els = $$("[data-rv]");
  if (reduced || !("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("in")); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
  els.forEach((e, i) => { e.style.transitionDelay = (e.matches(".h2,.kick") ? 0 : 0.08) + "s"; io.observe(e); });
}

/* ================= hero ring: 14 Lab palettes, radial bands at 60/30/10 ================= */
function ring() {
  const svg = $("#ring svg"), tip = $("#ringTip"), box = $("#ring");
  const NS = "http://www.w3.org/2000/svg", n = CONCEPTS.length, gap = 1.1;
  const bands = [[480, 396], [396, 354], [354, 340]]; // 84 / 42 / 14 = 60 / 30 / 10 of the ring's depth
  const arc = (r0, r1, a0, a1) => {
    const p = (r, a) => [(r * Math.sin(a * Math.PI / 180)).toFixed(2), (-r * Math.cos(a * Math.PI / 180)).toFixed(2)];
    const L = a1 - a0 > 180 ? 1 : 0, [x0, y0] = p(r1, a0), [x1, y1] = p(r1, a1), [x2, y2] = p(r0, a1), [x3, y3] = p(r0, a0);
    return `M${x0} ${y0}A${r1} ${r1} 0 ${L} 1 ${x1} ${y1}L${x2} ${y2}A${r0} ${r0} 0 ${L} 0 ${x3} ${y3}Z`;
  };
  const gEl = D.createElementNS(NS, "g"); gEl.setAttribute("id", "ringG"); svg.appendChild(gEl);
  CONCEPTS.forEach((c, i) => {
    const a0 = i * 360 / n + gap / 2, a1 = (i + 1) * 360 / n - gap / 2;
    const seg = D.createElementNS(NS, "g"); seg.setAttribute("class", "seg"); seg.style.cursor = "pointer";
    c.palette.forEach((col, k) => {
      const p = D.createElementNS(NS, "path"); p.setAttribute("d", arc(bands[k][1], bands[k][0], a0, a1)); p.setAttribute("fill", col);
      p.setAttribute("stroke", "rgba(23,66,60,.14)"); p.setAttribute("stroke-width", "1"); seg.appendChild(p);
    });
    const tx = D.createElementNS(NS, "text"); const am = (a0 + a1) / 2, rr = 500;
    tx.setAttribute("x", (rr * Math.sin(am * Math.PI / 180)).toFixed(1)); tx.setAttribute("y", (-rr * Math.cos(am * Math.PI / 180)).toFixed(1));
    tx.setAttribute("text-anchor", "middle"); tx.setAttribute("dominant-baseline", "middle");
    tx.setAttribute("transform", `rotate(${(am > 90 && am < 270 ? am + 180 : am).toFixed(1)} ${tx.getAttribute("x")} ${tx.getAttribute("y")})`); // keep the numbers upright
    tx.setAttribute("style", "font:800 15px var(--f-d);letter-spacing:.08em;fill:var(--ink);opacity:.55"); tx.textContent = c.n;
    seg.appendChild(tx);
    seg.addEventListener("pointerenter", e => { tip.textContent = `${c.n}  ${c.brand}  ${c.palette.join("  ")}`; tip.style.opacity = 1; seg.style.opacity = 1; gEl.classList.add("hov"); seg.classList.add("hi"); });
    seg.addEventListener("pointermove", e => { const b = box.getBoundingClientRect(); tip.style.left = (e.clientX - b.left) + "px"; tip.style.top = (e.clientY - b.top) + "px"; });
    seg.addEventListener("pointerleave", () => { tip.style.opacity = 0; seg.classList.remove("hi"); gEl.classList.remove("hov"); });
    seg.addEventListener("click", () => { location.href = isM ? `../lab/${c.slug}/m.html` : `../lab/${c.slug}/`; });
    gEl.appendChild(seg);
  });
  const st = D.createElement("style"); st.textContent = "#ringG .seg{transition:opacity .35s}#ringG.hov .seg{opacity:.35}#ringG.hov .seg.hi{opacity:1}"; D.head.appendChild(st);
  return gEl;
}

/* ================= 01 wheel + harmonies ================= */
const HARM = {
  comp: { t: "Complementary", d: "Two hues straight across the wheel. Maximum tension, so one of them has to be the quiet one.", o: [0, 180], n: ["Base", "Complement"] },
  ana: { t: "Analogous", d: "Neighbours within about 30 degrees. Calm and natural, the way a forest or a cup of coffee is one family of colour.", o: [-30, 0, 30], n: ["Left", "Base", "Right"] },
  tri: { t: "Triadic", d: "Three hues a third of the wheel apart. Lively and balanced; let one lead and mute the other two.", o: [0, 120, 240], n: ["Base", "Second", "Third"] },
  split: { t: "Split complementary", d: "The base plus the two neighbours of its complement. Most of the punch of complementary with less of the fight.", o: [0, 150, 210], n: ["Base", "Split A", "Split B"] },
};
function wheel() {
  const box = $("#wheelBox"), cv = $("#wheelCv"), svg = $("#wheelSvg"), ctx = cv.getContext("2d", { willReadFrequently: false });
  const NS = "http://www.w3.org/2000/svg";
  const st = { hue: 168, sat: 62, L: 50, mode: "comp", offs: HARM.comp.o.slice(), model: "hsl" };
  let drawn = -1, raf = 0;
  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, isM ? 1.5 : 2);
    const px = Math.round(box.clientWidth * dpr); if (px && cv.width !== px) { cv.width = cv.height = px; drawn = -1; }
  }
  function draw() {
    const key = st.model + st.L; if (drawn === key || !cv.width) return; drawn = key;
    const N = cv.width, img = ctx.createImageData(N, N), d = img.data, c = N / 2;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const dx = x - c + .5, dy = y - c + .5, r = Math.hypot(dx, dy) / c; const i = (y * N + x) * 4;
      if (r > 1.004) { d[i + 3] = 0; continue; }
      const h = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360; const [R1, G1, B1] = st.model === "ok" ? okFast(h, Math.min(r, 1)) : hsl2rgb(h, Math.min(r, 1) * 100, st.L);
      d[i] = R1; d[i + 1] = G1; d[i + 2] = B1; d[i + 3] = r > 1 ? Math.round(255 * (1.004 - r) / .004) : 255;
    }
    ctx.putImageData(img, 0, 0);
  }
  // overlay
  const gLines = D.createElementNS(NS, "g"), gPts = D.createElementNS(NS, "g"); svg.append(gLines, gPts);
  const poly = D.createElementNS(NS, "polygon"); poly.setAttribute("fill", "rgba(255,255,255,.12)"); poly.setAttribute("stroke", "#fff"); poly.setAttribute("stroke-width", ".8"); poly.setAttribute("stroke-dasharray", "2 2"); gLines.appendChild(poly);
  const ticks = D.createElementNS(NS, "g"); ticks.setAttribute("aria-hidden", "true");
  for (let a = 0; a < 360; a += 15) { const r0 = a % 90 === 0 ? 88 : a % 30 === 0 ? 92 : 95, t = D.createElementNS(NS, "line"); const s = Math.sin(a * Math.PI / 180), c0 = -Math.cos(a * Math.PI / 180); t.setAttribute("x1", (r0 * s).toFixed(2)); t.setAttribute("y1", (r0 * c0).toFixed(2)); t.setAttribute("x2", (98.5 * s).toFixed(2)); t.setAttribute("y2", (98.5 * c0).toFixed(2)); t.setAttribute("stroke", "rgba(255,255,255,.55)"); t.setAttribute("stroke-width", a % 90 === 0 ? ".9" : ".5"); ticks.appendChild(t); }
  svg.insertBefore(ticks, gLines);
  const pts = [];
  const chips = $("#harmChips");
  function pos(h, s) { const a = h * Math.PI / 180, r = s; return [r * Math.sin(a), -r * Math.cos(a)]; }
  const okL = () => .3 + (st.L - 25) / 50 * .6; // slider 25..75 -> OKLCH lightness .30..90
  function okFast(h, r) { const c = oklchLin(okL(), r * .2, h); return c.map(v => fromLin(clamp(v, 0, 1))); } // per-pixel: clip, fast
  function colAt(h) { h = ((h % 360) + 360) % 360; return st.model === "ok" ? oklch2hex(okL(), st.sat / 100 * .2, h) : rgb2hex(...hsl2rgb(h, st.sat, st.L)); }
  function render() {
    const hs = st.offs.map(o => st.hue + o);
    while (pts.length < hs.length) {
      const g = D.createElementNS(NS, "g"); const ln = D.createElementNS(NS, "line"); ln.setAttribute("stroke", "rgba(255,255,255,.7)"); ln.setAttribute("stroke-width", ".6");
      const c = D.createElementNS(NS, "circle"); c.setAttribute("r", "6.2"); c.setAttribute("stroke", "#fff"); c.setAttribute("stroke-width", "2.2");
      gLines.appendChild(ln); g.appendChild(c); gPts.appendChild(g); pts.push({ g, c, ln });
    }
    pts.forEach((p, i) => { const on = i < hs.length; p.g.style.display = p.ln.style.display = on ? "" : "none"; });
    const baseIdx = st.offs.indexOf(0) >= 0 ? st.offs.findIndex(o => Math.abs(o) < .01) : 0;
    const P = hs.map((h, i) => {
      const [x, y] = pos(h, st.sat); const p = pts[i];
      p.c.setAttribute("cx", x.toFixed(2)); p.c.setAttribute("cy", y.toFixed(2)); p.c.setAttribute("fill", colAt(h));
      p.c.setAttribute("r", i === baseIdx ? "8.4" : "6.2"); p.g.setAttribute("class", i === baseIdx ? "h-base" : "");
      p.ln.setAttribute("x1", 0); p.ln.setAttribute("y1", 0); p.ln.setAttribute("x2", x.toFixed(2)); p.ln.setAttribute("y2", y.toFixed(2));
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    });
    poly.setAttribute("points", P.join(" "));
    svg.setAttribute("aria-valuenow", Math.round(((st.hue % 360) + 360) % 360));
    svg.setAttribute("aria-valuetext", `Base hue ${Math.round(((st.hue % 360) + 360) % 360)} degrees, ${HARM[st.mode].t}: ${hs.map(colAt).join(", ")}`);
    const names = HARM[st.mode].n;
    chips.innerHTML = hs.map((h, i) => { const c = colAt(h); return `<button class="chip" type="button" data-hex="${c}" aria-label="Copy ${names[i] || ""} ${c}"><i style="background:${c}"></i><span>${names[i] || ""}<small class="mono">${c}</small></span></button>`; }).join("");
  }
  chips.addEventListener("click", e => { const b = e.target.closest(".chip"); if (b) copy(b.dataset.hex, b.dataset.hex); });
  function setMode(m) {
    st.mode = m; $("#harmT").textContent = HARM[m].t; $("#harmD").textContent = HARM[m].d;
    $$("#harmBtns .pill").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.h === m)));
    const target = HARM[m].o.slice(); const g = G();
    if (g && target.length === st.offs.length) {
      const o = { v: 0 }, from = st.offs.slice();
      g.to(o, { v: 1, duration: .9, ease: "expo.out", onUpdate: () => { st.offs = from.map((f, i) => f + (target[i] - f) * o.v); render(); }, onComplete: () => { st.offs = target; render(); } });
    } else { st.offs = target; render(); }
  }
  $$("#harmBtns .pill").forEach(b => b.addEventListener("click", () => setMode(b.dataset.h)));
  // drag
  function fromEvent(e) {
    const b = svg.getBoundingClientRect(); const x = (e.clientX - b.left) / b.width * 200 - 100, y = (e.clientY - b.top) / b.height * 200 - 100;
    st.hue = (Math.atan2(x, -y) * 180 / Math.PI + 360) % 360; st.sat = clamp(Math.hypot(x, y), 12, 100); render();
  }
  let dragging = false;
  svg.addEventListener("pointerdown", e => { dragging = true; box.classList.add("drag"); svg.setPointerCapture(e.pointerId); fromEvent(e); e.preventDefault(); });
  svg.addEventListener("pointermove", e => { if (dragging) fromEvent(e); });
  const up = () => { dragging = false; box.classList.remove("drag"); };
  svg.addEventListener("pointerup", up); svg.addEventListener("pointercancel", up);
  svg.addEventListener("keydown", e => {
    const k = e.key, step = e.shiftKey ? 15 : 3;
    if (k === "ArrowRight" || k === "ArrowUp") st.hue = (st.hue + step) % 360; else if (k === "ArrowLeft" || k === "ArrowDown") st.hue = (st.hue - step + 360) % 360; else return;
    e.preventDefault(); render();
  });
  $$("#modelBtns .pill").forEach(b => b.addEventListener("click", () => {
    st.model = b.dataset.m; $$("#modelBtns .pill").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    $("#modelNote").textContent = st.model === "ok" ? "OKLCH: equal steps look equal. Every hue at the same lightness really looks the same lightness, which is why the studio picks in it." : "HSL: the wheel everyone learns. Fast, but its yellows glow and its blues sink at the same 'lightness'.";
    draw(); render();
  }));
  $("#lightR").addEventListener("input", e => { st.L = +e.target.value; render(); cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); });
  const ro = new ResizeObserver(() => { size(); draw(); }); ro.observe(box);
  size(); draw(); render();
  // idle demo: a slow half-turn when the wheel first comes into view (desktop, motion allowed)
  const g = G();
  if (g) {
    let done = false;
    new IntersectionObserver((es, io) => { if (es[0].isIntersecting && !done) { done = true; io.disconnect(); const o = { h: st.hue }; g.to(o, { h: st.hue + 140, duration: 2.4, ease: "power3.inOut", delay: .3, onUpdate: () => { if (!dragging) { st.hue = o.h % 360; render(); } } }); } }, { threshold: .5 }).observe(box);
  }
}

/* ================= 02 proportion ================= */
function proportion() {
  const mock = $("#mock"), bar = $("#bar"), cap = $("#barCap"), ver = $("#verdict"), pick = $("#propPal");
  const pals = [{ slug: "studio", brand: "Zyqor Studio", palette: ["#F3EDE1", "#17423C", "#B5832F"] }, ...CONCEPTS.filter(c => ["stride", "signal", "verdant", "dew", "volta"].includes(c.slug))];
  let pal = pals[0].palette, preset = "good";
  const V = {
    good: ["Calm, and it looks expensive.", "The ground does the work, the ink carries the words, and the accent is the first thing your eye finds: the button."],
    even: ["Nothing leads.", "With the three colours in near-equal amounts the eye has nowhere to land, and the button stops being special."],
    flip: ["Loud, tiring, cheap.", "When the accent becomes the ground it stops being an accent. The button now has to fight the whole page."],
  };
  // role map per preset: which palette index paints each region
  const MAP = {
    good: { bg: 0, art: 1, orb: 2, txt: 1, acc: 2, band: null },
    even: { bg: 0, art: 2, orb: 1, txt: 1, acc: 1, band: 1 },
    flip: { bg: 2, art: 1, orb: 0, txt: 1, acc: 0, band: null },
  };
  let band = $(".mk-band", mock);
  if (!band) { band = D.createElement("i"); band.className = "mk-band"; band.style.cssText = "position:absolute;left:0;right:0;bottom:0;height:0;transition:height .8s var(--ease),background-color .7s var(--ease)"; mock.prepend(band); }
  function paint() {
    const m = MAP[preset], c = i => pal[i];
    mock.style.background = c(m.bg);
    mock.style.setProperty("--sec", c(m.txt)); mock.style.setProperty("--acc", c(m.acc)); mock.style.setProperty("--dom", c(m.orb));
    $(".mk-art", mock).style.background = c(m.art);
    band.style.background = m.band == null ? "transparent" : c(m.band); band.style.height = m.band == null ? "0%" : "24%";
    $(".mk-art", mock).style.zIndex = 1;
    ver.innerHTML = `<b>${V[preset][0]}</b>${V[preset][1]}`;
    setTimeout(measure, isM || reduced ? 30 : 850);
  }
  function measure() {
    const mb = mock.getBoundingClientRect(); const total = mb.width * mb.height; if (!total) return;
    const rect = el => el.getBoundingClientRect(), area = el => { const r = rect(el); return r.width * r.height; };
    const inter = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    const m = MAP[preset], acc = [0, 0, 0];
    const art = $(".mk-art", mock), orb = $(".orb", mock), tag = $(".tag", mock), btn = $(".mk-btn", mock), cta = $(".mk-cta", mock), logo = $(".mk-logo", mock);
    const lines = $$(".mk-links i,.mk-p i", mock);
    const aArt = area(art), aOrb = Math.PI * (rect(orb).width / 2) ** 2, aTag = area(tag) * .86;
    const aBtns = (area(btn) + area(cta)) * .86, aLogo = area(logo), aLines = lines.reduce((s, e) => s + area(e) * .5, 0);
    let aBand = 0;
    if (m.band != null) { const br = rect(band); aBand = br.width * br.height - inter(br, rect(art)) - inter(br, rect(btn)) * .86; }
    acc[m.art] += aArt - aOrb - aTag; acc[m.orb] += aOrb; acc[m.acc] += aTag + aBtns; acc[m.txt] += aLogo + aLines;
    if (m.band != null) acc[m.band] += aBand;
    acc[m.bg] += total - aArt - aBtns - aLogo - aLines - aBand;
    const P = acc.map(v => Math.max(0, v / total * 100));
    const order = [0, 1, 2].sort((a, b) => P[b] - P[a]);
    const divs = $$("div", bar);
    order.forEach((idx, k) => { const d = divs[k]; d.style.flexBasis = P[idx] + "%"; d.style.flexGrow = 0; d.style.background = pal[idx]; d.style.color = readable(pal[idx], pal[1], pal[0]); d.textContent = Math.round(P[idx]) + "%"; d.title = pal[idx]; });
    cap.textContent = `Measured live from the mock: ${order.map(i => `${pal[i]} ${Math.round(P[i])}%`).join(" · ")}. Type strokes excluded.`;
  }
  $$("#propBtns .pill").forEach(b => b.addEventListener("click", () => { preset = b.dataset.p; $$("#propBtns .pill").forEach(x => x.setAttribute("aria-pressed", String(x === b))); paint(); }));
  pick.innerHTML = pals.map((p, i) => `<button type="button" aria-pressed="${i === 0}" aria-label="${p.brand} palette" title="${p.brand}">${p.palette.map(c => `<i style="background:${c}"></i>`).join("")}</button>`).join("");
  $$("button", pick).forEach((b, i) => b.addEventListener("click", () => { pal = pals[i].palette; $$("button", pick).forEach(x => x.setAttribute("aria-pressed", String(x === b))); paint(); }));
  new ResizeObserver(() => measure()).observe(mock);
  paint();
}

/* ================= 03 contrast ================= */
function contrast() {
  const fgC = $("#fgC"), fgT = $("#fgT"), bgC = $("#bgC"), bgT = $("#bgT"), pre = $("#cxPre"), n = $("#ratioN");
  let fg = "#17423C", bg = "#F3EDE1";
  const setB = (id, ok) => { const el = $(id); el.classList.toggle("ok", ok); el.classList.toggle("no", !ok); };
  let shown = 9.58;
  function upd(fromInput) {
    pre.style.setProperty("--fg", fg); pre.style.setProperty("--bgc", bg);
    if (fromInput !== "fgC") fgC.value = fg.toLowerCase(); if (fromInput !== "bgC") bgC.value = bg.toLowerCase();
    if (fromInput !== "fgT") fgT.value = fg; if (fromInput !== "bgT") bgT.value = bg;
    const r = ratio(fg, bg); const g = G();
    if (g) { const o = { v: shown }; g.to(o, { v: r, duration: .6, ease: "power3.out", overwrite: true, onUpdate: () => { n.textContent = fmt(o.v); }, onComplete: () => { n.textContent = fmt(r); } }); } else n.textContent = fmt(r);
    shown = r;
    setB("#bAA", r >= 4.5); setB("#bAAL", r >= 3); setB("#bAAA", r >= 7); setB("#bUI", r >= 3);
    $("#cxFix").disabled = r >= 4.5; $("#cxFix").style.opacity = r >= 4.5 ? .45 : 1;
  }
  fgC.addEventListener("input", () => { fg = normHex(fgC.value); upd("fgC"); });
  bgC.addEventListener("input", () => { bg = normHex(bgC.value); upd("bgC"); });
  fgT.addEventListener("input", () => { if (validHex(fgT.value)) { fg = normHex(fgT.value); upd("fgT"); } });
  bgT.addEventListener("input", () => { if (validHex(bgT.value)) { bg = normHex(bgT.value); upd("bgT"); } });
  [fgT, bgT].forEach(t => t.addEventListener("blur", () => upd()));
  $("#cxSwap").addEventListener("click", () => { [fg, bg] = [bg, fg]; upd(); });
  $("#cxFix").addEventListener("click", () => {
    const [L, C, H] = hex2oklch(fg), lb = lum(bg);
    const tryDir = dir => { for (let l = L; l >= 0 && l <= 1; l += dir * .004) { const h = oklch2hex(l, C, H); if (ratio(h, bg) >= 4.5) return h; } return null; };
    const first = lum(fg) < lb ? -1 : 1; const out = tryDir(first) || tryDir(-first);
    if (out) { fg = out; upd(); copy(out, out, `Nudged to ${out}, ${fmt(ratio(out, bg))}:1. Copied.`); }
  });
  upd();
  // matrix of the studio's own pairs
  const pairs = [["#17423C", "#F3EDE1", "Pine on Ivory"], ["#B5832F", "#F3EDE1", "Ochre on Ivory"], ["#8F6420", "#F3EDE1", "Dark ochre on Ivory"], ["#F3EDE1", "#17423C", "Ivory on Pine"], ["#D9B56A", "#17423C", "Gold on Pine"], ["#17423C", "#B5832F", "Pine on Ochre"]];
  const verdict = r => r >= 7 ? "AAA, any size" : r >= 4.5 ? "AA, any size" : r >= 3 ? "Large type and UI only" : "Decoration only";
  $("#mx").innerHTML = pairs.map(([f, b, l]) => { const r = ratio(f, b); return `<button type="button" class="mxb" data-f="${f}" data-b="${b}" style="background:${b};color:${f}" aria-label="Load ${l} into the checker"><b>${fmt(r)}</b><span>${l}<br>${verdict(r)}</span></button>`; }).join("");
  $$("#mx .mxb").forEach(b => b.addEventListener("click", () => { fg = b.dataset.f; bg = b.dataset.b; upd(); }));
  $("#mxO").textContent = fmt(ratio("#B5832F", "#F3EDE1")) + ":1"; $("#mxOd").textContent = fmt(ratio("#8F6420", "#F3EDE1")) + ":1";
}

/* ================= 04 temperature ================= */
function temperature() {
  const scene = $("#scene"), r = $("#tempR"), mood = $("#mood"), note = $("#tnote");
  scene.innerHTML = `<svg viewBox="0 0 500 400" role="img" aria-label="A still life: an arched window with the sun, a vase and a fruit on a table, recoloured by temperature">
    <defs><linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop id="sk1" offset="0"/><stop id="sk2" offset="1"/></linearGradient>
    <radialGradient id="sunG"><stop id="su1" offset="0"/><stop id="su2" offset="1" stop-opacity="0"/></radialGradient>
    <linearGradient id="vaseG" x1="0" x2="1"><stop id="va1" offset="0"/><stop id="va2" offset="1"/></linearGradient>
    <clipPath id="archC"><path d="M170 300V150a80 80 0 0 1 160 0v150z"/></clipPath></defs>
    <rect id="wall" width="500" height="400"/>
    <g clip-path="url(#archC)"><rect x="160" y="60" width="180" height="250" fill="url(#skyG)"/><circle id="sun" cx="282" cy="196" r="34"/><circle cx="282" cy="196" r="90" fill="url(#sunG)"/><path id="hill1" d="M160 260q60-34 110-14t90 0V310H160z"/><path id="hill2" d="M160 280q70-20 120-4t80-8V310H160z"/></g>
    <path d="M170 300V150a80 80 0 0 1 160 0v150" fill="none" id="archS" stroke-width="10"/>
    <rect id="table" y="296" width="500" height="104"/><rect id="edge" y="296" width="500" height="6"/>
    <ellipse id="shadow" cx="236" cy="322" rx="92" ry="12" opacity=".35"/>
    <path id="vase" fill="url(#vaseG)" d="M212 318c-22-8-30-34-24-58 5-20 18-28 18-48v-16h28v16c0 20 13 28 18 48 6 24-2 50-24 58z"/>
    <circle id="fruit" cx="292" cy="300" r="20"/><circle id="fruitHi" cx="286" cy="293" r="6" opacity=".45"/>
    <path id="stem" d="M220 196c-6-30 10-56 34-70M228 196c4-24 20-40 46-44" fill="none" stroke-width="3" stroke-linecap="round"/>
  </svg>`;
  const S = id => scene.querySelector("#" + id);
  const lists = { warm: $("#tWarm"), cool: $("#tCool") };
  // Lab concepts by palette temperature (chroma-weighted at 60 / 30 / 10)
  CONCEPTS.forEach(c => {
    const w = .6 * warmth(c.palette[0]) + .3 * warmth(c.palette[1]) + .1 * warmth(c.palette[2]);
    const a = D.createElement("a"); a.href = isM ? `../lab/${c.slug}/m.html` : `../lab/${c.slug}/`;
    a.innerHTML = `<i style="background:linear-gradient(135deg,${c.palette[0]} 0 50%,${c.palette[1]} 50% 80%,${c.palette[2]} 80%)"></i>${c.brand}`;
    (w >= 0 ? lists.warm : lists.cool).appendChild(a);
  });
  const MOODS = [
    [0, "Calm, <em>clinical</em>, trustworthy.", "Cool hues recede and slow the eye down. Health, finance and hardware lean this way because cool reads as precise and safe."],
    [.38, "Balanced, <em>quiet</em>, considered.", "Near-neutral temperature is where most premium brands live: nothing shouts, so the product and the typography do the talking."],
    [.64, "Appetite, <em>energy</em>, closeness.", "Warm hues advance and feel touchable. Food, coffee and hospitality lean warm because warmth reads as taste and comfort."],
  ];
  let last = -1;
  function upd() {
    const t = r.value / 100;
    // White balance, not hue rotation: lerp in OKLab between a cool and a warm version of each tone.
    // The straight line passes through neutral grey, never through purple.
    const lab = (L, C, H) => [C * Math.cos(H * Math.PI / 180), C * Math.sin(H * Math.PI / 180)];
    const c = (L, C, dh = 0) => { const [ac, bc] = lab(L, C, 238 + dh), [aw, bw] = lab(L, C, 62 + dh); const a = ac + (aw - ac) * t, b = bc + (bw - bc) * t; return oklch2hex(L, Math.hypot(a, b), (Math.atan2(b, a) * 180 / Math.PI + 360) % 360); };
    const neutralC = 0.045;
    S("wall").setAttribute("fill", c(.9, neutralC * .7, 10));
    S("sk1").setAttribute("stop-color", c(.74, .11, -8)); S("sk2").setAttribute("stop-color", c(.9, .07, 8));
    S("su1").setAttribute("stop-color", c(.95, .1, 12)); S("sun").setAttribute("fill", c(.97, .06, 14));
    S("hill1").setAttribute("fill", c(.6, .08, -20)); S("hill2").setAttribute("fill", c(.48, .08, -28));
    S("archS").setAttribute("stroke", c(.84, neutralC, 6));
    S("table").setAttribute("fill", c(.58, .07, 4)); S("edge").setAttribute("fill", c(.5, .06, 4));
    S("shadow").setAttribute("fill", c(.22, .05, -10));
    S("va1").setAttribute("stop-color", c(.42, .08, -6)); S("va2").setAttribute("stop-color", c(.3, .07, -6));
    S("fruit").setAttribute("fill", oklch2hex(.66, .15, 250 - 215 * t)); S("fruitHi").setAttribute("fill", "#fff");
    S("stem").setAttribute("stroke", oklch2hex(.42, .07, 150 - 40 * t));
    const m = MOODS.filter(x => t >= x[0]).pop(); const k = MOODS.indexOf(m);
    if (k !== last) { last = k; mood.innerHTML = m[1]; note.textContent = m[2]; const g = G(); if (g) g.fromTo(mood, { yPercent: 20, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .6, ease: "expo.out" }); }
    r.setAttribute("aria-valuetext", t < .38 ? "Cool" : t < .64 ? "Neutral" : "Warm");
  }
  r.addEventListener("input", upd); upd();
}

/* ================= 05 the Lab, decoded ================= */
const WHY = {
  stride: "Speed on a quiet ground. Bone keeps the shoe the loudest thing on the page, petrol does the reading, and the coral sits almost opposite petrol on the wheel, so every pill pops.",
  meridian: "Parchment and bottle green come off a watchmaker's bench. Brass sits a third of the wheel from the green and is too light to read on parchment, so it is kept for hairlines and indices, never for words.",
  hush: "Quiet is cool. Mist and slate navy hold the calm; amber, straight across the wheel, is the single warm note, saved for the one control that matters.",
  ember: "The only palette in the Lab led by a dark ground. Roast brown, crema and burnt copper all sit within a few degrees of hue: analogous, like looking into the cup.",
  verdant: "Leaf and terracotta: the plant and its pot. They sit about a third of the wheel apart, and the pale sage ground stops it turning into a garden-centre flyer.",
  dew: "Skin, not sugar. Blush and dusty rose stay in one hue family; cocoa replaces black for the type, so the page never goes clinical.",
  volt: "The loud one, on purpose. Midnight navy lets the acid lime glow as if it were backlit, and orange is the flavour flood. High chroma is the product here.",
  umami: "Ramen counter colours. Chilli red and scallion green sit near-opposite; the green is deep enough to carry small text, so the red is free to shout in big type.",
  signal: "An agency should look decisive. Ultramarine and safety orange are a split-complementary pair; the warm off-white stops it reading as a flag.",
  volta: "Engineering calm. Pale cool grey, deep teal for trust, and a coral almost opposite the teal for the charge state and the night switch.",
  nook: "Furniture lives in rooms. Linen, olive and rust are earth pigments; keeping the chroma low across all three reads as material rather than screen.",
  carmine: "Ink is the product, so the accent is the ink: carmine at full strength on paper white, with oxblood doing the type. One red family, three depths.",
  longway: "Road and sun. Night-slate ink on a pale sky ground, with a road-sign amber straight across the wheel, used the way a road uses it: as a marker.",
  rise: "Strawberry on cream. A vanilla ground, berry-skin dark and a bright strawberry red: one warm family, so the footage stays the hero.",
};
// Posters that exist on disk (checked at build time) so a concept registered before its poster never 404s.
const POSTERS = new Set(["carmine", "dew", "ember", "hush", "longway", "meridian", "nook", "rise", "signal", "stride", "umami", "verdant", "volt", "volta"]);
function relation(gap) { return gap < 45 ? "Analogous" : gap < 100 ? "Near neighbours" : gap < 135 ? "Triadic spacing" : gap < 165 ? "Split complementary" : "Complementary"; }
function labGrid() {
  const grid = $("#labGrid"), arrow = icon("arrow");
  grid.innerHTML = CONCEPTS.map(c => {
    const [a, b, d] = c.palette; let gap = Math.abs(hexHue(b) - hexHue(d)); gap = Math.min(gap, 360 - gap);
    const mono = gap < 45 && Math.abs(hexHue(a) - hexHue(b)) < 45;
    const rel = relation(gap), why = WHY[c.slug] || `${c.brand}: ${rel.toLowerCase()} accent on a ${lum(a) > .5 ? "light" : "dark"} ground, ink at ${fmt(ratio(a, b))}:1.`;
    const href = isM ? `../lab/${c.slug}/m.html` : `../lab/${c.slug}/`;
    const poster = `../lab/${c.slug}/${isM ? "poster-m" : "poster"}.webp`;
    const sw = c.palette.map((h, i) => `<div style="background:${h};color:${readable(h, "#17423C", "#F8F4EC")}">${h}</div>`).join("");
    return `<a class="lp" href="${href}" data-rv aria-label="${c.brand}, concept ${c.n}: open the demo">
      <div class="lp-sw">${sw}</div>
      <span class="lp-go" aria-hidden="true">${arrow}</span>
      <div class="lp-body">
        <span class="lp-n">CONCEPT ${c.n}</span>
        <h3 class="lp-t">${c.brand}</h3>
        <span class="lp-k">${c.kind}</span>
        ${POSTERS.has(c.slug) ? `<img class="lp-poster" src="${poster}" alt="" loading="lazy" decoding="async" width="236" height="148">` : `<span class="lp-poster lp-poster--n" style="background:${c.palette[1]};color:${c.palette[2]}" aria-hidden="true">${c.n}</span>`}
        <p class="lp-why">${why}</p>
        <div class="lp-facts"><span>${rel}${gap >= 45 ? `, ${Math.round(gap)}°` : ""}</span><span>Ink on ground ${fmt(ratio(a, b))}:1</span><span>Accent on ground ${fmt(ratio(a, d))}:1</span><span>${.6 * warmth(a) + .3 * warmth(b) + .1 * warmth(d) >= 0 ? "Warm" : "Cool"}</span></div>
      </div></a>`;
  }).join("");
  $$(".lp-poster", grid).forEach(img => img.addEventListener("error", () => img.remove(), { once: true }));
  $$(".lp-sw div", grid).forEach(d => d.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); copy(d.textContent.trim(), d.textContent.trim()); }));
}

/* ================= 06 generator ================= */
function generator() {
  const sw = $("#genSw"), code = $("#gpCode"), chk = $("#gpChk"), card = $("#gpCard"), btn = $("#gpB");
  const ROLES = ["Ground · 60", "Ink · 30", "Accent · 10"];
  const OFF = { comp: [180], split: [150, 210], tri: [120, 240], ana: [35, -35] };
  let mode = "comp", locks = [false, false, false], pal = ["#F3EDE1", "#17423C", "#B5832F"];
  const rnd = (a, b) => a + Math.random() * (b - a);
  const noPurple = h => { h = ((h % 360) + 360) % 360; return (h > 262 && h < 352) ? (h < 305 ? 250 : 12) : h; }; // house rule: no purple, violet or magenta (OKLCH hue 262-352)
  sw.innerHTML = ROLES.map((r, i) => `<div class="gs" data-i="${i}"><div class="gs-top"><span>${r}</span><button class="gs-lock" type="button" aria-pressed="false" aria-label="Lock ${r.split(" ")[0]}">${icon("lock")}</button></div><div><button class="gs-hex" type="button" aria-label="Copy"><span></span>${icon("copy")}</button><div class="gs-meta"></div></div></div>`).join("");
  const cells = $$(".gs", sw);
  cells.forEach((c, i) => {
    $(".gs-lock", c).addEventListener("click", e => { locks[i] = !locks[i]; e.currentTarget.setAttribute("aria-pressed", String(locks[i])); });
    $(".gs-hex", c).addEventListener("click", () => copy(pal[i], pal[i]));
  });
  function make() {
    const base = locks[1] ? hex2oklch(pal[1])[2] : locks[0] ? hex2oklch(pal[0])[2] : noPurple(rnd(0, 360));
    const out = pal.slice();
    if (!locks[1]) out[1] = oklch2hex(rnd(.26, .34), rnd(.05, .085), noPurple(base));
    if (!locks[0]) { const hd = noPurple(base + (85 - base) * .6); out[0] = oklch2hex(rnd(.94, .965), rnd(.012, .028), (hd + 360) % 360); }
    if (!locks[2]) { const offs = OFF[mode]; const ha = noPurple((base + offs[Math.floor(Math.random() * offs.length)] + rnd(-8, 8) + 720) % 360); out[2] = oklch2hex(rnd(.62, .74), rnd(.12, .17), ha); }
    // guarantee the ink reads: darken until AAA on the ground
    let [L, C, H] = hex2oklch(out[1]); let guard = 0;
    while (!locks[1] && ratio(out[1], out[0]) < 7 && guard++ < 60) { L -= .01; out[1] = oklch2hex(L, C, H); }
    pal = out; paint();
  }
  function paint() {
    cells.forEach((c, i) => {
      const h = pal[i], ink = readable(h, pal[1] === h ? "#F3EDE1" : pal[1], pal[0] === h ? "#17423C" : pal[0]);
      c.style.background = h; c.style.color = ratio(h, ink) >= 3 ? ink : readable(h); $(".gs-hex span", c).textContent = h;
      const [L, C, H] = hex2oklch(h); $(".gs-meta", c).textContent = `oklch(${(L * 100).toFixed(1)}% ${C.toFixed(3)} ${H.toFixed(0)})`;
      $(".gs-hex", c).setAttribute("aria-label", `Copy ${h}`);
    });
    card.style.background = pal[0]; card.style.color = pal[1];
    const bt = ratio(pal[2], pal[1]) >= ratio(pal[2], pal[0]) ? pal[1] : pal[0];
    btn.style.background = pal[2]; btn.style.color = bt;
    code.textContent = `:root {\n  --ground: ${pal[0]};\n  --ink:    ${pal[1]};\n  --accent: ${pal[2]};\n}`;
    const r1 = ratio(pal[1], pal[0]), r2 = ratio(pal[2], pal[0]), r3 = ratio(bt, pal[2]);
    const tag = r => r >= 7 ? "AAA" : r >= 4.5 ? "AA" : r >= 3 ? "large type only" : "fills only";
    chk.textContent = `Ink on ground ${fmt(r1)}:1 (${tag(r1)}). Accent on ground ${fmt(r2)}:1 (${tag(r2)}). Button label ${fmt(r3)}:1 (${tag(r3)}).`;
  }
  $$("#genMode .pill").forEach(b => b.addEventListener("click", () => { mode = b.dataset.g; $$("#genMode .pill").forEach(x => x.setAttribute("aria-pressed", String(x === b))); make(); }));
  $("#genGo").addEventListener("click", make);
  $("#gpCopy").addEventListener("click", () => copy(code.textContent, pal[2], "CSS variables copied"));
  let inView = false;
  new IntersectionObserver(es => { inView = es[0].isIntersecting; }, { threshold: .25 }).observe($("#generator"));
  D.addEventListener("keydown", e => {
    if (e.code !== "Space" || !inView || e.repeat) return;
    const t = e.target; if (t && t.closest && t.closest("input,textarea,button,a,[role=slider],select,summary")) return;
    e.preventDefault(); make();
  });
  paint();
}

/* ================= desktop motion layer ================= */
function desktopMotion(ringG) {
  const g = window.gsap, ST = window.ScrollTrigger;
  if (!g || !ST || isM) return;
  g.registerPlugin(ST); D.body.classList.add("gsap");
  if (!reduced && window.Lenis) {
    const lenis = new window.Lenis({ lerp: .09, wheelMultiplier: 1 });
    lenis.on("scroll", ST.update); g.ticker.add(t => lenis.raf(t * 1000)); g.ticker.lagSmoothing(0);
    D.addEventListener("click", e => { const a = e.target.closest('a[href^="#"]'); if (!a) return; const id = a.getAttribute("href"); const el = id.length > 1 && D.querySelector(id); if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: id === "#main" ? 0 : -20, duration: 1.4 }); } });
  }
  if (reduced) { settleTrio(); return; }
  // intro
  g.from(".h1 .ln>span", { yPercent: 110, duration: 1.3, ease: "expo.out", stagger: .09, delay: .1 });
  g.from(".h1 .by,.hero .kick,.hero-foot", { opacity: 0, y: 24, duration: 1.1, ease: "expo.out", stagger: .08, delay: .45 });
  g.from("#ring", { opacity: 0, scale: .86, rotate: -40, duration: 1.8, ease: "expo.out", delay: .15 });
  // ring: idle spin + scroll spin
  const spin = { a: 0 }; let sc = 0;
  g.ticker.add(() => { spin.a += .02; ringG.setAttribute("transform", `rotate(${(spin.a + sc).toFixed(2)})`); });
  ST.create({ trigger: ".hero", start: "top top", end: "bottom top", scrub: true, onUpdate: s => { sc = s.progress * 120; } });
  g.to("#ring", { yPercent: 18, scale: .9, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  g.to(".hero .h1", { yPercent: -14, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  // the house palette: equal thirds settle into 60 / 30 / 10, scrubbed by scroll
  const bands = $$("#trio .tb"), nums = $$("#trio .tb-n");
  const tl = g.timeline({ scrollTrigger: { trigger: "#trio", start: "top top", end: "bottom bottom", scrub: .6 } });
  const roll = { a: 33.3, b: 33.3, c: 33.3 };
  tl.to(roll, { a: 60, b: 30, c: 10, ease: "power2.inOut", duration: 1, onUpdate: () => {
      bands[0].style.flexBasis = roll.a + "%"; bands[1].style.flexBasis = roll.b + "%"; bands[2].style.flexBasis = roll.c + "%";
      nums[0].textContent = Math.round(roll.a); nums[1].textContent = Math.round(roll.b); nums[2].textContent = Math.round(roll.c);
    } }, .1)
    .fromTo(".trio-cap", { opacity: 0, yPercent: 6 }, { opacity: 1, yPercent: -4, ease: "power2.out", duration: .55 }, .38)
    .to({}, { duration: .25 });
  // section headings: scrubbed letter-spacing settle
  $$(".h2").forEach(h => g.fromTo(h, { letterSpacing: "-.01em" }, { letterSpacing: "-.035em", ease: "none", scrollTrigger: { trigger: h, start: "top 95%", end: "top 45%", scrub: true } }));
  // Lab cards: swatch bars grow as they scroll in
  $$(".lp").forEach(card => g.from($$(".lp-sw div", card), { scaleY: 0, transformOrigin: "50% 100%", duration: 1, ease: "expo.out", stagger: .07, scrollTrigger: { trigger: card, start: "top 88%" } }));
  // magnetic buttons
  $$(".btn").forEach(b => {
    b.addEventListener("pointermove", e => { const r = b.getBoundingClientRect(); g.to(b, { x: (e.clientX - r.left - r.width / 2) * .22, y: (e.clientY - r.top - r.height / 2) * .3, duration: .5, ease: "power3.out" }); });
    b.addEventListener("pointerleave", () => g.to(b, { x: 0, y: 0, duration: .8, ease: "elastic.out(1,.4)" }));
  });
  // fonts can shift layout: refresh once they are in
  D.fonts && D.fonts.ready.then(() => ST.refresh());
}

function settleTrio() { const t = $("#trio"); if (!t) return; t.classList.add("settled"); $$("#trio .tb-n").forEach(n => n.textContent = n.dataset.to); }

/* ================= boot ================= */
function boot() {
  const ringG = ring();
  reveals(); themeWatch(); wheel(); proportion(); contrast(); temperature(); labGrid(); generator();
  reveals2();
  if (!isM) { if (window.gsap && window.ScrollTrigger) desktopMotion(ringG); else settleTrio(); }
  else settleTrio(); // phone: static ring, settled bands, native scroll only
}
function reveals2() { // cards generated after the first reveal pass
  const els = $$("#labGrid [data-rv]:not(.in)");
  if (reduced) { els.forEach(e => e.classList.add("in")); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -6% 0px" });
  els.forEach((e, i) => { e.style.transitionDelay = (i % 2) * .08 + "s"; io.observe(e); });
}
if (isM) boot();
else if (D.readyState === "complete") boot(); else addEventListener("load", boot, { once: true }); // wait for deferred GSAP / Lenis
