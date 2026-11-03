// pinterest_refs.mjs — Pinterest reference research for Tab's motion kit (READ ONLY on Pinterest).
//
// USAGE
//   cd /home/user/tools/motion-kit
//   TAB_TASK_ID=<any task id> nice -n 10 timeout -k 10 900 node pinterest_refs.mjs "<topic>" [count=16] [--scope=videos|pins] [--videos=8] [--no-video]
//   → references/<topic_slug>/ : pins.json, thumbs/NN.jpg, vids/NN.mp4 (≤720p, ≤30 s, kept only if small),
//     frames/NN_k.jpg (6 per video), sheet.jpg (all thumbnails, numbered), frames_sheet.jpg (6 frames per video, one row each)
//   Then: look at sheet.jpg + frames_sheet.jpg (attach_image) and write <topic_slug>/STYLE.md by hand.
//
// HOW IT WORKS (measured 2026-11-03)
//   - One Browserbase session (US region, mac) opens https://www.pinterest.com/search/videos/?q=… and, from inside the page,
//     calls Pinterest's own /resource/BaseSearchResource/get/ (same origin, its csrftoken cookie) — the page's own data call.
//     Plain curl/requests to that endpoint answers 403 "Invalid Resource Request"; the HTML has no pins (JS-rendered).
//   - Logged out, Pinterest gates pin pages: ids come back as "e1_…" tokens and there is no public /pin/<id>/ URL.
//     We record the creator, the creator's board URL and outbound link instead. With a signed-in context
//     (env PINTEREST_CONTEXT=<browserbase context id>, see /home/user/tab/browser-notes/pinterest.md) numeric ids → real pin URLs.
//   - Video files: v1.pinimg.com HLS (.m3u8) is fetchable straight from this box (no cookies) → ffmpeg picks the ≤720p variant.
//   - The session is one-shot (keepAlive:false) and ends when the search step returns. Nothing is clicked, saved, pinned or followed.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { withBrowserStep } from "/home/user/tab/browser-step.mjs";

const args = process.argv.slice(2);
const topic = args.find(a => !a.startsWith("--") && isNaN(Number(a)));
if (!topic) { console.error('usage: node pinterest_refs.mjs "<topic>" [count] [--scope=videos|pins] [--videos=8] [--no-video]'); process.exit(2); }
const count = Number(args.find(a => /^\d+$/.test(a)) || 16);
const opt = k => (args.find(a => a.startsWith(`--${k}=`)) || "").split("=")[1];
const scope = opt("scope") || "videos";
const maxVideos = args.includes("--no-video") ? 0 : Number(opt("videos") || 8);
const ctxId = process.env.PINTEREST_CONTEXT || null;
const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 60);
const OUT = path.join(path.dirname(new URL(import.meta.url).pathname), "references", slug);
for (const d of ["thumbs", "vids", "frames"]) fs.mkdirSync(path.join(OUT, d), { recursive: true });
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const run = (cmd, argv, t = 120) => spawnSync("timeout", ["-k", "5", String(t), "nice", "-n", "10", cmd, ...argv], { encoding: "utf8", maxBuffer: 64 << 20 });

// ---------- 1. search (one browser session) ----------
async function search() {
  const launch = { keepAlive: false, timeout: 900, region: "us-east-1",
    browserSettings: { os: "mac", recordSession: false, logSession: false, viewport: { width: 1440, height: 900 },
      ...(ctxId ? { context: { id: ctxId, persist: true } } : {}) },
    userMetadata: { site: "pinterest", task: process.env.TAB_TASK_ID || "none", purpose: "pinterest-refs-readonly" } };
  return withBrowserStep({ launch }, async ({ page, browser }) => {
    const src = `/search/${scope}/?q=${encodeURIComponent(topic)}&rs=typed`;
    await page.goto("https://www.pinterest.com" + src, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(6000);
    const r = await page.evaluate(async ({ topic, src, scope, want }) => {
      const csrf = (document.cookie.match(/csrftoken=([^;]+)/) || [])[1] || "";
      const signedIn = !/Log in/.test(document.body.innerText.slice(0, 300));
      let bookmark = null, results = [], pages = 0, status = null;
      while (results.length < want && pages < 5) {
        const options = { query: topic, scope, rs: "typed", page_size: 25, redux_normalize_feed: true, source_url: src };
        if (bookmark) options.bookmarks = [bookmark];
        const u = "/resource/BaseSearchResource/get/?source_url=" + encodeURIComponent(src) + "&data=" + encodeURIComponent(JSON.stringify({ options, context: {} })) + "&_=" + Date.now();
        const res = await fetch(u, { credentials: "include", headers: { Accept: "application/json, text/javascript, */*, q=0.01", "X-Requested-With": "XMLHttpRequest", "X-CSRFToken": csrf, "X-Pinterest-AppState": "active", "X-Pinterest-Source-Url": src, "X-Pinterest-PWS-Handler": "www/search/[scope].js" } });
        status = res.status; if (!res.ok) break;
        const j = await res.json(); pages++;
        const d = j.resource_response?.data; const got = (d?.results || d || []).filter(p => p && p.type === "pin");
        results.push(...got); bookmark = j.resource_response?.bookmark; if (!bookmark || !got.length) break;
      }
      return { status, pages, signedIn, results };
    }, { topic, src, scope, want: count + 10 });
    return { session: browser.sessionId, ...r };
  });
}

const pick = (o, ...ks) => ks.map(k => k.split(".").reduce((x, y) => x?.[y], o)).find(v => v != null && v !== "");
function norm(p) {
  const vl = p.videos?.video_list || p.story_pin_data?.pages?.[0]?.blocks?.find(b => b.video)?.video?.video_list || null;
  const vk = vl ? Object.keys(vl) : [];
  const mp4 = vk.map(k => vl[k]).find(v => /\.mp4/.test(v.url)) || null;
  const hls = vk.map(k => vl[k]).find(v => /\.m3u8/.test(v.url)) || null;
  const v = mp4 || hls;
  const numeric = /^\d+$/.test(String(p.id));
  return {
    id: p.id, pin_url: numeric ? `https://www.pinterest.com/pin/${p.id}/` : null,
    title: pick(p, "title", "grid_title") || null,
    description: (pick(p, "description", "closeup_unified_description", "auto_alt_text") || "").slice(0, 600),
    creator: p.pinner ? { username: p.pinner.username, name: p.pinner.full_name, followers: p.pinner.follower_count, profile: `https://www.pinterest.com/${p.pinner.username}/` } : null,
    board: p.board ? { name: p.board.name, url: "https://www.pinterest.com" + p.board.url } : null,
    outbound_link: p.link || null, domain: p.domain || null,
    image_url: pick(p, "images.orig.url", "images.736x.url", "images.474x.url", "images.236x.url") || null,
    is_video: !!v, video_url: v?.url || null, video_hls: hls?.url || null, video_mp4: mp4?.url || null,
    video_w: v?.width || null, video_h: v?.height || null, duration_s: v?.duration ? +(v.duration / 1000).toFixed(1) : null,
    saves: p.aggregated_pin_data?.aggregated_stats?.saves ?? null, created_at: p.created_at || null, dominant_color: p.dominant_color || null,
  };
}

// ---------- 2. downloads (straight from the box) ----------
async function get(url, file) {
  const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", Referer: "https://www.pinterest.com/" } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
}
async function bestHls(master) {
  // returns { video, audio|null }: the ≤720p (short side) video variant + the separate audio rendition Pinterest uses
  const txt = await (await fetch(master)).text();
  if (!/#EXT-X-STREAM-INF/.test(txt)) return { video: master, audio: null };
  const lines = txt.split("\n"); const vars = [];
  const am = txt.match(/#EXT-X-MEDIA:TYPE=AUDIO[^\n]*URI="([^"]+)"/);
  for (let i = 0; i < lines.length; i++) if (lines[i].startsWith("#EXT-X-STREAM-INF")) {
    const m = lines[i].match(/RESOLUTION=(\d+)x(\d+)/); const bw = +(lines[i].match(/BANDWIDTH=(\d+)/) || [0, 0])[1];
    let j = i + 1; while (j < lines.length && !lines[j].trim()) j++;
    vars.push({ w: m ? +m[1] : 0, h: m ? +m[2] : 0, bw, url: new URL(lines[j].trim(), master).href });
  }
  const short = v => Math.min(v.w, v.h) || 99999;
  const ok = vars.filter(v => short(v) <= 720).sort((a, b) => short(b) - short(a) || b.bw - a.bw);
  return { video: (ok[0] || vars.sort((a, b) => short(a) - short(b))[0]).url, audio: am ? new URL(am[1], master).href : null };
}
function freeGB() { const r = run("df", ["-BG", "--output=avail", "/home/user"], 10); return parseInt(r.stdout.split("\n")[1]); }

// ---------- main ----------
log(`topic="${topic}" scope=${scope} count=${count} videos=${maxVideos} context=${ctxId || "public (logged out)"}`);
const s = await search();
log(`search: http ${s.status}, ${s.pages} page(s), ${s.results.length} raw pins, signedIn=${s.signedIn}, session ${s.session} (ended)`);
const seen = new Set();
// dedupe: same media URL, or same creator + same length (the same edit re-uploaded)
let pins = s.results.map(norm).filter(p => { const ks = [p.video_url || p.image_url || p.id, p.is_video && p.creator && p.duration_s ? `${p.creator.username}|${p.duration_s}` : null].filter(Boolean); if (ks.some(k => seen.has(k))) return false; ks.forEach(k => seen.add(k)); return true; });
if (scope === "videos") pins.sort((a, b) => (b.is_video - a.is_video));
pins = pins.slice(0, count).map((p, i) => ({ n: String(i + 1).padStart(2, "0"), ...p }));

for (const p of pins) {
  const thumb = p.image_url; if (!thumb) continue;
  try { await get(thumb, path.join(OUT, "thumbs", p.n + ".jpg")); p.thumb = `thumbs/${p.n}.jpg`; } catch (e) { p.thumb_error = String(e.message); }
}
let vidsDone = 0, keptBytes = 0;
for (const p of pins.filter(p => p.is_video).slice(0, maxVideos)) {
  if (freeGB() < 2) { log("disk under 2 GB free — skipping further video downloads"); break; }
  const mp4 = path.join(OUT, "vids", p.n + ".mp4");
  try {
    const src = p.video_mp4 ? { video: p.video_mp4, audio: null } : await bestHls(p.video_hls);
    const inputs = ["-i", src.video, ...(src.audio ? ["-i", src.audio] : [])];
    const maps = src.audio ? ["-map", "0:v:0", "-map", "1:a:0?"] : ["-map", "0:v:0", "-map", "0:a:0?"];
    const r = run("ffmpeg", ["-nostdin", "-y", "-loglevel", "error", ...inputs, ...maps, "-t", "30", "-c", "copy", "-bsf:a", "aac_adtstoasc", "-shortest", mp4], 180);
    if (!fs.existsSync(mp4) || fs.statSync(mp4).size < 10000) throw new Error("ffmpeg: " + (r.stderr || "").slice(-300));
    const dur = parseFloat(run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mp4], 30).stdout) || 10;
    const wh = run("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", mp4], 30).stdout.trim();
    p.frames = [];
    for (let k = 0; k < 6; k++) {
      const t = (dur * (k + 0.5) / 6).toFixed(2), f = path.join(OUT, "frames", `${p.n}_${k + 1}.jpg`);
      run("ffmpeg", ["-nostdin", "-y", "-loglevel", "error", "-ss", t, "-i", mp4, "-frames:v", "1", "-vf", "scale=360:-2", "-q:v", "4", f], 60);
      if (fs.existsSync(f)) p.frames.push({ t: +t, file: `frames/${p.n}_${k + 1}.jpg` });
    }
    // pacing: hard cuts by scene change (>0.3); sound: does the pin carry audio, and its integrated loudness
    const sc = run("ffmpeg", ["-nostdin", "-i", mp4, "-vf", "select='gt(scene,0.3)',showinfo", "-an", "-f", "null", "-"], 120).stderr || "";
    const cuts = (sc.match(/pts_time:([\d.]+)/g) || []).map(x => +x.split(":")[1]);
    const lu = run("ffmpeg", ["-nostdin", "-i", mp4, "-vn", "-af", "ebur128", "-f", "null", "-"], 120).stderr || "";
    const I = (lu.match(/I:\s+(-?[\d.]+) LUFS/g) || []).pop();
    p.pacing = { hard_cuts: cuts.length, cut_times_s: cuts.map(x => +x.toFixed(2)), avg_shot_s: +(dur / (cuts.length + 1)).toFixed(2) };
    p.audio = I ? { integrated_lufs: parseFloat(I.split(":")[1]) } : { integrated_lufs: null, note: "no audio track" };
    const size = fs.statSync(mp4).size;
    p.downloaded = { resolution: wh, seconds: +dur.toFixed(1), bytes: size };
    if (size > 25e6 || keptBytes + size > 120e6) { fs.unlinkSync(mp4); p.downloaded.kept = false; } else { keptBytes += size; p.downloaded.kept = true; p.local_video = `vids/${p.n}.mp4`; }
    vidsDone++; log(`video ${p.n}: ${wh} ${dur.toFixed(1)}s ${(size / 1e6).toFixed(1)} MB kept=${p.downloaded.kept} cuts=${cuts.length} audio=${p.audio.integrated_lufs ?? 'none'} LUFS`);
  } catch (e) { p.video_error = String(e.message).slice(0, 300); log(`video ${p.n} failed: ${p.video_error}`); try { fs.unlinkSync(mp4); } catch {} }
}

fs.writeFileSync(path.join(OUT, "pins.json"), JSON.stringify({ topic, slug, scope, searched_at: new Date().toISOString(), mode: s.signedIn ? "signed-in" : "public (logged out)", context: ctxId, session: s.session, count: pins.length, videos_downloaded: vidsDone, pins }, null, 1));
const sheet = run("python3", [path.join(path.dirname(new URL(import.meta.url).pathname), "pinterest_sheet.py"), OUT], 120);
log((sheet.stdout + sheet.stderr).trim());
log(`done → ${OUT} (${pins.length} pins, ${pins.filter(p => p.is_video).length} video pins, ${vidsDone} videos fetched, ${(keptBytes / 1e6).toFixed(0)} MB kept)`);
