// Pixel difference between two PNG screenshots, computed by the browser itself
// (no image libraries needed). Returns the share of pixels that changed.
export async function pixelDiff(context, a, b) {
  const page = await context.newPage();
  try {
    await page.setContent('<canvas></canvas>');
    return await page.evaluate(async ([a, b]) => {
      const load = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
      const [ia, ib] = await Promise.all([load(a), load(b)]);
      const w = Math.min(ia.width, ib.width, 480), h = Math.round(w * ia.height / ia.width);
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const g = c.getContext('2d', { willReadFrequently: true });
      g.drawImage(ia, 0, 0, w, h); const da = g.getImageData(0, 0, w, h).data;
      g.clearRect(0, 0, w, h); g.drawImage(ib, 0, 0, w, h); const db = g.getImageData(0, 0, w, h).data;
      let changed = 0, x0 = w, y0 = h, x1 = -1, y1 = -1;
      const out = g.createImageData(w, h);
      for (let i = 0, p = 0; i < da.length; i += 4, p++) {
        const hit = Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]) > 30;
        const lum = (db[i] * .3 + db[i + 1] * .59 + db[i + 2] * .11) * .55 + 110;
        out.data[i] = hit ? 224 : lum; out.data[i + 1] = hit ? 69 : lum; out.data[i + 2] = hit ? 31 : lum; out.data[i + 3] = 255;
        if (hit) { changed++; const x = p % w, y = (p / w) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      }
      g.putImageData(out, 0, 0);
      const pct = v => Math.round(v * 100);
      return {
        percent: Math.round(changed / (w * h) * 1000) / 10,
        box: changed ? { left: pct(x0 / w), top: pct(y0 / h), right: pct((x1 + 1) / w), bottom: pct((y1 + 1) / h) } : null,
        image: changed ? c.toDataURL('image/jpeg', 0.8) : null,
      };
    }, ['data:image/png;base64,' + a.toString('base64'), 'data:image/png;base64,' + b.toString('base64')]);
  } finally { await page.close(); }
}
