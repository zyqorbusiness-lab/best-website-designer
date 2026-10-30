#!/usr/bin/env node
// storyboard.mjs: turn a one-line idea into a chapter storyboard skeleton, and check an idea sentence against the
// "[product] as [physical thing or place]" test. No dependencies. Node 18+.
//   node storyboard.mjs --idea "a music school as a ukulele whose strings are the menu" --category education --chapters 5
//   node storyboard.mjs --check "modern website for a bakery"          -> FAIL with the reason
//   add --json for machine output
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
// camera grammar by concept (scroll-world SKILL L411-436, prompts L92-115), extended for web chapters
const GRAMMAR = {
  product: 'slow half-orbit around the object, then carry on forward; exploded view in the middle chapter',
  luxury: 'slow half-orbit, macro close-up on the material, long linger on the finish',
  realestate: 'steadicam through doorways, crane up in tall rooms, end on the view from the window',
  industrial: 'low lateral track with foreground parallax, then a reveal of scale',
  travel: 'rise and reveal over the landscape, then swoop down to the arrival',
  food: 'push in close on the dish or the hands, ease back to the room',
  craft: 'push in close on the hands and the material, ease back to the workshop',
  education: 'locked, calm isometric view; each chapter adds one object to the scene',
  music: 'object in the centre, camera breathes with the sound; one close-up on the moving part',
  services: 'locked camera, the layout rearranges around one travelling object',
  default: 'one continuous forward move, slowing (linger) where the copy peaks',
};
const ARC = [
  ['Arrive', 'The idea in one picture and one line; the object/place is already on screen.'],
  ['Problem or desire', 'Why someone needs this, shown with the object, not a stock photo.'],
  ['How it works', 'The signature interaction: the visitor does the thing (pluck, flip, drag, configure).'],
  ['Proof', 'Real proof only: the product itself up close, real specs, materials, a working demo.'],
  ['Details', 'Prices, options, FAQ as a ledger; the object still visible.'],
  ['Act', 'One calm CTA; the finale wordmark; Privacy, Terms, Contact.'],
];
export function checkIdea(s) {
  const reasons = []; const t = (s || '').toLowerCase();
  if (!/\b(as|is|where|whose|inside|becomes|like)\b/.test(t)) reasons.push('no metaphor: write it as "[product] as [a physical thing or a place]" (Messenger: "a messaging app as a tiny planet you deliver letters on")');
  if (/\b(modern|clean|sleek|beautiful|stunning|innovative|premium|website|landing page)\b/.test(t)) reasons.push('uses a vague or generic word (modern / clean / premium / website): name the THING instead');
  if (t.split(/\s+/).length > 22) reasons.push('longer than about 20 words: if it needs more, it is two ideas');
  if (t.split(/\s+/).length < 5) reasons.push('too short to carry a picture');
  return { ok: reasons.length === 0, reasons };
}
export function storyboard({ idea, category = 'default', chapters = 5 }) {
  const n = Math.min(6, Math.max(4, chapters)); const picks = n === 6 ? ARC : n === 5 ? [ARC[0], ARC[1], ARC[2], ARC[3], ARC[5]] : [ARC[0], ARC[2], ARC[3], ARC[5]];
  return { idea, check: checkIdea(idea), camera: GRAMMAR[category] || GRAMMAR.default, staysOnScreen: 'the object or place named after "as" in the idea sentence', chapters: picks.map(([name, job], i) => ({ n: i + 1, name, job, line: '(one sentence, 3-6 word title)', picture: '(one picture: what the object is doing)', interaction: name === 'How it works' ? '(the signature interaction, with a touch equivalent)' : '-', phone: '(how this chapter is re-composed at 390px)' })) };
}
if (typeof process !== 'undefined' && process.argv && import.meta.url === `file://${process.argv[1]}`) {
  const chk = opt('check');
  if (chk) { const r = checkIdea(chk); console.log(r.ok ? 'PASS ' + chk : 'FAIL ' + chk + '\n  - ' + r.reasons.join('\n  - ')); process.exit(r.ok ? 0 : 1); }
  const sbd = storyboard({ idea: opt('idea', ''), category: opt('category', 'default'), chapters: +opt('chapters', 5) });
  if (args.includes('--json')) { console.log(JSON.stringify(sbd, null, 2)); process.exit(sbd.check.ok ? 0 : 1); }
  console.log(`# Storyboard\n\nIdea: ${sbd.idea}\nIdea check: ${sbd.check.ok ? 'PASS' : 'FAIL - ' + sbd.check.reasons.join('; ')}\nCamera grammar: ${sbd.camera}\nStays on screen from first chapter to last: ${sbd.staysOnScreen}\n`);
  console.log('| # | Chapter | Its job | Line | Picture | Interaction | Phone |\n|---|---|---|---|---|---|---|');
  for (const c of sbd.chapters) console.log(`| ${c.n} | ${c.name} | ${c.job} | ${c.line} | ${c.picture} | ${c.interaction} | ${c.phone} |`);
  process.exit(sbd.check.ok ? 0 : 1);
}
