// =====================================================
//  SonicDNA — Mandala.jsx  (v6 — native canvas, no react-p5)
//  Place at: src/components/Mandala.jsx
//
//  Removed react-p5 entirely. Uses a plain <canvas> ref +
//  requestAnimationFrame so there is exactly ONE canvas element
//  with no wrapper div offset — one centre, always.
//
//  KEY TUNING KNOBS (easy to adjust):
//  ─────────────────────────────────────────────────
//  NOISE_SPEED_MULTIPLIER  → overall swirl speed
//  NOISE_SCALE_BASE        → particle grain size
//  DRIFT_X / Y / Z         → how fast each axis drifts
//  STEP                    → pixel resolution (1=sharp, 2=fast)
//  ─────────────────────────────────────────────────
//
//  Visual mappings:
//    BPM               → swirl speed (noiseSpeed)
//    energy_rmse       → sphere brightness + fill spread
//    brightness_centroid → noise octaves (detail level)
// =====================================================

import { useRef, useEffect } from 'react';

// ── Genre palettes ─────────────────────────────────────
const PALETTES = {
  electronic:   { inner: [185, 100, 100], mid: [210, 95, 100], outer: [270, 90, 100], glow: [195, 90, 100] },
  classical:    { inner: [55,  85, 100],  mid: [220, 60, 100], outer: [260, 50, 100], glow: [50,  70, 100] },
  jazz:         { inner: [35, 100, 100],  mid: [20, 100, 100], outer: [42,  90, 100], glow: [28,  90, 100] },
  'hip-hop':    { inner: [50, 100, 100],  mid: [280, 95, 100], outer: [300, 90, 100], glow: [45,  90, 100] },
  rap:          { inner: [50, 100, 100],  mid: [280, 95, 100], outer: [300, 90, 100], glow: [45,  90, 100] },
  rock:         { inner: [10, 100, 100],  mid: [25, 100, 100], outer: [200, 80, 100], glow: [8,   95, 100] },
  metal:        { inner: [0,  100, 100],  mid: [15, 100, 100], outer: [210, 75, 100], glow: [5,   90, 100] },
  pop:          { inner: [330, 95, 100],  mid: [180, 90, 100], outer: [55, 100, 100], glow: [320, 85, 100] },
  ambient:      { inner: [170, 85, 100],  mid: [200, 75, 100], outer: [220, 65, 100], glow: [180, 70, 100] },
  country:      { inner: [42, 100, 100],  mid: [32,  95, 100], outer: [65,  80, 100], glow: [38,  80, 100] },
  'r&b':        { inner: [290, 95, 100],  mid: [320, 90, 100], outer: [25, 100, 100], glow: [285, 85, 100] },
  soul:         { inner: [290, 95, 100],  mid: [320, 90, 100], outer: [25, 100, 100], glow: [285, 85, 100] },
  blues:        { inner: [215, 95, 100],  mid: [235, 90, 100], outer: [250, 85, 100], glow: [220, 85, 100] },
  folk:         { inner: [45,  95, 100],  mid: [62,  85, 100], outer: [85,  75, 100], glow: [50,  75, 100] },
  latin:        { inner: [18, 100, 100],  mid: [38, 100, 100], outer: [55, 100, 100], glow: [22,  95, 100] },
  instrumental: { inner: [180, 90, 100],  mid: [210, 85, 100], outer: [245, 75, 100], glow: [195, 75, 100] },
};

const DEFAULT_PALETTE = {
  inner: [42, 100, 100], mid: [28, 100, 100], outer: [195, 85, 100], glow: [38, 85, 100],
};

function getPalette(genre = '') {
  const key = genre.toLowerCase().trim();
  if (PALETTES[key]) return PALETTES[key];
  const match = Object.keys(PALETTES).find((k) => key.includes(k));
  return match ? PALETTES[match] : DEFAULT_PALETTE;
}

// ── Perlin noise ────────────────────────────────────────
const _perm = (() => {
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  const out = new Uint8Array(512);
  for (let i = 0; i < 512; i++) out[i] = p[i & 255];
  return out;
})();

const _g2 = Array.from({ length: 256 }, () => {
  const a = Math.random() * 2 * Math.PI;
  return [Math.cos(a), Math.sin(a)];
});

function _noise2(x, y) {
  const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
  const xf = x - Math.floor(x), yf = y - Math.floor(y);
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a, b, t) => a + t * (b - a);
  const dot  = (g, dx, dy) => g[0] * dx + g[1] * dy;
  const u = fade(xf), v = fade(yf);
  const aa = _perm[X + _perm[Y]], ab = _perm[X + _perm[Y + 1]];
  const ba = _perm[X + 1 + _perm[Y]], bb = _perm[X + 1 + _perm[Y + 1]];
  return lerp(
    lerp(dot(_g2[aa], xf, yf),     dot(_g2[ba], xf - 1, yf),     u),
    lerp(dot(_g2[ab], xf, yf - 1), dot(_g2[bb], xf - 1, yf - 1), u),
    v
  );
}

function fbm(x, y, octaves = 5) {
  let val = 0, amp = 0.5, freq = 1, max = 0;
  for (let i = 0; i < octaves; i++) {
    val += _noise2(x * freq, y * freq) * amp;
    max += amp; freq *= 2.1; amp *= 0.48;
  }
  return val / max;
}

// HSB (0-360, 0-100, 0-100) → [r, g, b] 0-255
function hsbToRgb(h, s, b) {
  s /= 100; b /= 100;
  const k = (n) => (n + h / 60) % 6;
  const f = (n) => b * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1)));
  return [Math.round(f(5) * 255), Math.round(f(3) * 255), Math.round(f(1) * 255)];
}

const C = 500; // canvas logical size in px

export default function Mandala({ dsp_metrics, genre }) {
  const canvasRef = useRef(null);
  const propsRef  = useRef({ dsp_metrics, genre });
  const timeRef   = useRef(0);
  const rafRef    = useRef(null);

  // Keep latest props readable inside the RAF loop without re-running the effect
  useEffect(() => {
    propsRef.current = { dsp_metrics, genre };
  }, [dsp_metrics, genre]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set the backing-store size once — CSS width/height match so no DPR scaling issues
    canvas.width  = C;
    canvas.height = C;

    const ctx = canvas.getContext('2d');

    function frame() {
      rafRef.current = requestAnimationFrame(frame);

      const { dsp_metrics: dsp, genre: g } = propsRef.current;

      const bpm        = Math.min(220, Math.max(40,    dsp?.bpm                 ?? 120));
      const energy     = Math.min(1,   Math.max(0,     dsp?.energy_rmse         ?? 0.40));
      const brightness = Math.min(12000, Math.max(100, dsp?.brightness_centroid ?? 3500));

      const pal = getPalette(g);

      // ── Time / speed ─────────────────────────────────────
      const NOISE_SPEED_MULTIPLIER = 0.0008;
      timeRef.current += (bpm / 120) * NOISE_SPEED_MULTIPLIER;
      const T = timeRef.current;

      // ── Geometry ─────────────────────────────────────────
      // cx and cy are always exactly C/2 — every drawing call below
      // uses the same values so there is only one geometric centre.
      const cx = C / 2;
      const cy = C / 2;
      const R  = Math.floor(C * 0.40);

      // ── Noise params ──────────────────────────────────────
      const noiseScale   = 0.009 + (brightness / 12000) * 0.006;
      const noiseOctaves = Math.round(4 + (brightness / 12000) * 2); // 4-6
      // Energy remapped to [0.4, 1.0] floor so even quiet songs look vivid
      const energyLifted = 0.4 + energy * 0.6;
      const fillDensity  = 0.88 + energyLifted * 0.12;  // was 0.70 + energy*0.30
      const brightMult   = 3.2  + energyLifted * 1.8;   // was 1.8  + energy*1.4

      // ── 1. Background ─────────────────────────────────────
      ctx.clearRect(0, 0, C, C);
      ctx.fillStyle = '#05080f';
      ctx.fillRect(0, 0, C, C);

      // ── 2. Outer ambient halo ─────────────────────────────
      const [gr, gg, gb] = hsbToRgb(pal.glow[0], pal.glow[1], pal.glow[2]);
      const ambientGlow  = ctx.createRadialGradient(cx, cy, R * 0.7, cx, cy, R * 1.6);
      ambientGlow.addColorStop(0,   `rgba(${gr},${gg},${gb},${0.45 + energy * 0.25})`);
      ambientGlow.addColorStop(0.5, `rgba(${gr},${gg},${gb},0.15)`);
      ambientGlow.addColorStop(1,   `rgba(${gr},${gg},${gb},0)`);
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.6, 0, Math.PI * 2);
      ctx.fillStyle = ambientGlow; ctx.fill();

      // ── 3. Sphere clip ────────────────────────────────────
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();

      // Dark base inside sphere
      const baseGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      baseGrad.addColorStop(0,   '#1c2240');
      baseGrad.addColorStop(0.5, '#080c1c');
      baseGrad.addColorStop(1,   '#020408');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

      // ── 4. Nebula pixel loop ──────────────────────────────
      const DRIFT_X = 12, DRIFT_Y = 8, DRIFT_Z = 6, STEP = 2;
      const diameter = Math.ceil(R * 2);
      const imgData  = ctx.createImageData(diameter, diameter);

      const [ir, ig, ib]  = hsbToRgb(pal.inner[0], pal.inner[1], pal.inner[2]);
      const [mr, mg, mb]  = hsbToRgb(pal.mid[0],   pal.mid[1],   pal.mid[2]);
      const [or2, og, ob] = hsbToRgb(pal.outer[0], pal.outer[1], pal.outer[2]);

      for (let py = 0; py < diameter; py += STEP) {
        for (let px = 0; px < diameter; px += STEP) {
          const nx = (px / diameter - 0.5) * 2;
          const ny = (py / diameter - 0.5) * 2;
          const d2 = nx * nx + ny * ny;
          if (d2 >= 0.98) continue;

          const r  = Math.sqrt(d2);
          const nz = Math.sqrt(Math.max(0, 1 - d2));
          const limbFade = Math.pow(1 - r * r, 0.40);

          const sx = nx * noiseScale * 800 + T * DRIFT_X;
          const sy = ny * noiseScale * 800 + T * DRIFT_Y;
          const sz = nz * noiseScale * 400 + T * DRIFT_Z;

          const n1 = fbm(sx,              sy + sz,   noiseOctaves);
          const n2 = fbm(sx + sz,         sy,        noiseOctaves - 1);
          const n3 = fbm(sx * 1.8 + 0.5,  sy * 1.8,  Math.max(3, noiseOctaves - 1));

          const w1 = Math.pow(Math.max(0, n1 * 0.5 + 0.62), 1.3);  // raised floor, softer power
          const w2 = Math.pow(Math.max(0, n2 * 0.5 + 0.58), 1.3);
          const w3 = Math.pow(Math.max(0, n3 * 0.5 + 0.55), 1.5);  // finer sparks

          const coreGlow  = Math.pow(Math.max(0, 1 - r * 1.8), 3.0);
          const innerWarm = Math.pow(Math.max(0, 1 - r * 1.3), 2.0) * 0.85;

          const totalW      = w1 + w2 + w3 + 0.001;
          const blR         = (w1 * ir + w2 * mr + w3 * or2) / totalW;
          const blG         = (w1 * ig + w2 * mg + w3 * og)  / totalW;
          const blB         = (w1 * ib + w2 * mb + w3 * ob)  / totalW;
          const noiseEnergy = (w1 * 0.5 + w2 * 0.32 + w3 * 0.18) * limbFade * fillDensity;
          const warmMix     = Math.min(1, coreGlow + innerWarm * 0.55);

          const fR = Math.min(255, blR * (1 - warmMix) * noiseEnergy * brightMult + 255 * warmMix * (noiseEnergy + coreGlow) * 2.0);
          const fG = Math.min(255, blG * (1 - warmMix) * noiseEnergy * brightMult + 225 * warmMix * (noiseEnergy + coreGlow) * 1.9);
          const fB = Math.min(255, blB * (1 - warmMix) * noiseEnergy * brightMult + 150 * warmMix * (noiseEnergy + coreGlow) * 1.4);

          const alpha = Math.min(255, Math.round(
            (noiseEnergy * 3.5 + coreGlow * 2.2 + innerWarm * 1.2) * 255
          ));
          if (alpha < 4) continue;  // was 8 — lower = denser cloud

          for (let dy = 0; dy < STEP && py + dy < diameter; dy++) {
            for (let dx = 0; dx < STEP && px + dx < diameter; dx++) {
              const idx = ((py + dy) * diameter + (px + dx)) * 4;
              imgData.data[idx]     = Math.round(fR);
              imgData.data[idx + 1] = Math.round(fG);
              imgData.data[idx + 2] = Math.round(fB);
              imgData.data[idx + 3] = alpha;
            }
          }
        }
      }

      // The nebula image occupies exactly the bounding box of the clip circle:
      // top-left = (cx - R, cy - R).  Both use the same cx/cy/R → one centre.
      ctx.putImageData(imgData, Math.floor(cx - R), Math.floor(cy - R));

      // ── 5. Screen-blend light bursts ──────────────────────
      ctx.globalCompositeOperation = 'screen';
      const cols = [pal.inner, pal.mid, pal.outer, pal.inner];
      for (let i = 0; i < 4; i++) {
        const angle = T * 18 + i * (Math.PI * 2 / 4);
        const dist  = R * 0.22 * (0.5 + 0.5 * Math.sin(T * 12 + i * 1.3));
        const lx    = cx + Math.cos(angle) * dist;
        const ly    = cy + Math.sin(angle) * dist;
        const lr    = R * (0.30 + energy * 0.15);
        const [br2, bg2, bb2] = hsbToRgb(cols[i][0], cols[i][1], cols[i][2]);
        const burst = ctx.createRadialGradient(lx, ly, 0, lx, ly, lr);
        burst.addColorStop(0,    `rgba(${br2},${bg2},${bb2},${0.60 + energy * 0.35})`);
        burst.addColorStop(0.45, `rgba(${br2},${bg2},${bb2},0.18)`);
        burst.addColorStop(1,    `rgba(${br2},${bg2},${bb2},0)`);
        ctx.beginPath(); ctx.arc(lx, ly, lr, 0, Math.PI * 2);
        ctx.fillStyle = burst; ctx.fill();
      }

      // Central white core
      const coreBurst = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.28);
      coreBurst.addColorStop(0,    `rgba(255,255,255,${0.85 + energy * 0.15})`);
      coreBurst.addColorStop(0.18, 'rgba(255,240,190,0.50)');
      coreBurst.addColorStop(0.55, 'rgba(255,210,100,0.12)');
      coreBurst.addColorStop(1,    'rgba(255,180,40,0)');
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.28, 0, Math.PI * 2);
      ctx.fillStyle = coreBurst; ctx.fill();

      ctx.globalCompositeOperation = 'source-over';
      ctx.restore(); // end sphere clip

      // ── 6. Glass shell ────────────────────────────────────
      const innerRim = ctx.createRadialGradient(cx, cy, R * 0.80, cx, cy, R);
      innerRim.addColorStop(0,   'rgba(0,0,0,0)');
      innerRim.addColorStop(0.7, 'rgba(0,5,22,0.30)');
      innerRim.addColorStop(1,   'rgba(0,10,45,0.70)');
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = innerRim; ctx.fill();

      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${gr},${gg},${gb},${0.70 + energy * 0.20})`;
      ctx.lineWidth   = 2.5;
      ctx.stroke();

      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${gr},${gg},${gb},0.30)`;
      ctx.lineWidth   = 18;
      ctx.stroke();

      // ── 7. Glass sheen + catchlight ───────────────────────
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();

      const sheen = ctx.createRadialGradient(
        cx - R * 0.40, cy - R * 0.42, R * 0.02,
        cx - R * 0.16, cy - R * 0.20, R * 0.72
      );
      sheen.addColorStop(0,    'rgba(255,255,255,0.22)');
      sheen.addColorStop(0.28, 'rgba(255,255,255,0.06)');
      sheen.addColorStop(0.65, 'rgba(255,255,255,0.015)');
      sheen.addColorStop(1,    'rgba(255,255,255,0)');
      ctx.fillStyle = sheen;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

      const catchlight = ctx.createRadialGradient(
        cx - R * 0.44, cy - R * 0.46, 0,
        cx - R * 0.44, cy - R * 0.46, R * 0.11
      );
      catchlight.addColorStop(0,   'rgba(255,255,255,0.82)');
      catchlight.addColorStop(0.4, 'rgba(255,255,255,0.22)');
      catchlight.addColorStop(1,   'rgba(255,255,255,0)');
      ctx.fillStyle = catchlight;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      ctx.restore();

      // ── 8. Bokeh particles outside sphere ─────────────────
      const bokehCount = 14;
      for (let i = 0; i < bokehCount; i++) {
        const angle = (i / bokehCount) * Math.PI * 2 + i * 1.618;
        const dist  = R * (1.28 + (i % 3) * 0.20);
        const bx    = cx + Math.cos(angle) * dist;
        const by    = cy + Math.sin(angle) * dist;
        const bs    = R * (0.025 + (i % 4) * 0.012);
        const ba    = 0.07 + (i % 3) * 0.05;
        const [bhr, bhg, bhb] = hsbToRgb(
          (pal.glow[0] + i * 22) % 360, pal.glow[1] * 0.65, pal.glow[2]
        );
        const bokeh = ctx.createRadialGradient(bx, by, 0, bx, by, bs);
        bokeh.addColorStop(0,   `rgba(${bhr},${bhg},${bhb},${ba})`);
        bokeh.addColorStop(0.5, `rgba(${bhr},${bhg},${bhb},${ba * 0.35})`);
        bokeh.addColorStop(1,   `rgba(${bhr},${bhg},${bhb},0)`);
        ctx.beginPath(); ctx.arc(bx, by, bs, 0, Math.PI * 2);
        ctx.fillStyle = bokeh; ctx.fill();
      }
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []); // intentionally empty — props are read via ref on every frame

  // A bare <canvas> — no wrapper div, no extra DOM nodes.
  // The parent component positions it however it needs to.
  return (
    <canvas
      ref={canvasRef}
      className="mandala-canvas"
      style={{
        display: 'block',
        width: C,
        height: C,
        background: 'transparent',
      }}
    />
  );
}