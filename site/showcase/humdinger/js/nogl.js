// Humdinger: the fallback when WebGL is off or the context is lost. Stills rendered from this same scene by us,
// placed with the same poses as the 3D (position + size + swing), crossfading per section. The pads become a 2D grid.
export class Fallback {
  constructor(root, keys) {
    this.imgs = [...root.querySelectorAll('img')]; this.front = 0; this.key = null; this.keys = keys;
    for (const k of Object.keys(keys)) { const i = new Image(); i.decoding = 'async'; i.src = `stills/${k}.webp`; }   // warm the cache
  }
  show(key, pose, vw, vh) {
    if (key !== this.key) {
      this.key = key; this.front = 1 - this.front;
      const a = this.imgs[this.front], b = this.imgs[1 - this.front];
      a.src = `stills/${key}.webp`; a.alt = ''; a.style.opacity = '1'; b.style.opacity = '0';
    }
    const h = (pose.s / 0.86) * vh, x = vw / 2 + pose.x * vw - h / 2, y = vh / 2 - pose.y * vh - h / 2;
    for (const img of this.imgs) { img.style.width = img.style.height = h + 'px'; img.style.transform = `translate3d(${x}px,${y}px,0) rotate(${-(pose.swing || 0)}rad)`; }
  }
}
