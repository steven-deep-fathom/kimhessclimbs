import React, { useEffect, useMemo, useRef, useState } from 'react';
import MockupNav from './MockupNav';
import { STORY_STOPS } from './storyData';

// M5: a fresh take on the old #private/mountain-scene mockup (procedural terrain
// behind the hero title). This version is lightweight SVG, not WebGL, so it loads
// instantly and runs on any phone: six layered ridgelines taken from real rows of
// the Everest heightmap, hazier with distance, with gentle scroll and pointer
// parallax and a dawn sky. Unlisted mockup.

const HEIGHTMAP = '/heightmaps/everest.png';
const LAYERS = 6;
const SAMPLES = 180;
// Far → near: hazy and light to the page's own dark navy.
const FILLS = ['#d8b9b8', '#a7a6c4', '#7383ab', '#465a85', '#253457', '#0f172a'];

function useRidgeProfiles(): number[][] | null {
  const [profiles, setProfiles] = useState<number[][] | null>(null);
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const { data, width, height } = ctx.getImageData(0, 0, img.width, img.height);
      const h = (x: number, y: number) => data[(y * width + x) * 4] / 255;
      const result: number[][] = [];
      for (let layer = 0; layer < LAYERS; layer++) {
        // Each layer is the skyline of a band of rows, further bands further away.
        const y0 = Math.floor((0.08 + layer * 0.14) * height);
        const y1 = Math.min(height - 1, y0 + Math.floor(0.14 * height));
        const raw: number[] = [];
        for (let i = 0; i < SAMPLES; i++) {
          const x = Math.floor((i / (SAMPLES - 1)) * (width - 1));
          let top = 0;
          for (let y = y0; y <= y1; y += 2) top = Math.max(top, h(x, y));
          raw.push(top);
        }
        // Light smoothing so the silhouette reads as a ridge, not noise.
        result.push(raw.map((_, i) => {
          const a = raw[Math.max(0, i - 1)], b = raw[i], c = raw[Math.min(SAMPLES - 1, i + 1)];
          return (a + 2 * b + c) / 4;
        }));
      }
      setProfiles(result);
    };
    img.src = HEIGHTMAP;
    return () => { cancelled = true; };
  }, []);
  return profiles;
}

export default function RidgelineHero() {
  const profiles = useRidgeProfiles();
  const layerRefs = useRef<(SVGGElement | null)[]>([]);

  const paths = useMemo(() => {
    if (!profiles) return [];
    return profiles.map((profile, i) => {
      const base = 560 + i * 62;
      const amp = 230 + i * 34;
      const pts = profile.map((p, j) => `${((j / (SAMPLES - 1)) * 1800 - 100).toFixed(1)},${(base - p * amp).toFixed(1)}`);
      return `M-100,1000 L${pts.join(' L')} L1700,1000 Z`;
    });
  }, [profiles]);

  // Parallax: nearer layers move more with scroll and pointer.
  useEffect(() => {
    let pointerX = 0;
    let raf = 0;
    const update = () => {
      const y = window.scrollY;
      layerRefs.current.forEach((g, i) => {
        if (!g) return;
        const depth = (i + 1) / LAYERS;
        g.setAttribute('transform', `translate(${(pointerX * 30 * depth).toFixed(1)} ${(y * (0.35 - depth * 0.3)).toFixed(1)})`);
      });
      raf = 0;
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
    const onPointer = (e: PointerEvent) => { pointerX = e.clientX / window.innerWidth - 0.5; schedule(); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('pointermove', onPointer);
    update();
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('pointermove', onPointer);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [paths]);

  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <MockupNav current="#private/ridgeline-hero" />

      <section className="relative h-[100svh] min-h-[560px] overflow-hidden" style={{ background: 'linear-gradient(180deg, #081228 0%, #203a66 45%, #b9838a 78%, #f1b07c 100%)' }}>
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
          <defs>
            <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#fff1d6" stopOpacity="0.95" />
              <stop offset="0.25" stopColor="#ffd199" stopOpacity="0.55" />
              <stop offset="1" stopColor="#ffb170" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.16" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <circle cx="1080" cy="560" r="360" fill="url(#sun)" />
          {paths.map((d, i) => (
            <g key={i} ref={(el) => { layerRefs.current[i] = el; }}>
              <path d={d} fill={FILLS[i]} />
              {i < LAYERS - 1 && <rect x="-100" y={600 + i * 62} width="1800" height="90" fill="url(#mist)" className="animate-pulse" style={{ animationDuration: `${7 + i}s` }} />}
            </g>
          ))}
        </svg>

        <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col items-center justify-start px-5 pt-[16vh] text-center [text-shadow:0_2px_16px_rgba(8,18,40,0.7)] md:pt-[18vh]">
          <p className="font-bold uppercase tracking-[0.3em] text-brand-teal">Mountaineer • Motivator • Storyteller</p>
          <h1 className="mt-5 font-heading text-6xl font-bold uppercase tracking-tight drop-shadow-2xl md:text-8xl">Kim Hess</h1>
          <p className="mt-6 max-w-2xl text-lg font-light text-gray-100 md:text-2xl">
            Less than 60 people have completed the Explorers Grand Slam. Only 12 are women.
          </p>
          <div className="mt-10 flex gap-3">
            <span className="rounded-full bg-brand-teal px-7 py-3.5 text-sm font-bold uppercase tracking-widest">Book Kim</span>
            <span className="rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-bold uppercase tracking-widest backdrop-blur">My story</span>
          </div>
        </div>
      </section>

      {/* A following section, so the parallax has something to scroll into */}
      <section className="relative mx-auto max-w-6xl px-5 py-20">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-teal">Seven down, two to go</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {STORY_STOPS.map((s) => (
            <div key={s.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs text-gray-400">{s.year}</p>
              <p className="mt-1 font-heading font-bold">{s.name}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 max-w-xl text-sm text-gray-500">
          Mockup note: the ridgelines are drawn from the Everest heightmap in the repo. This is a lightweight alternative
          or companion to the photo hero, not a replacement for Kim's photo.
        </p>
      </section>
    </div>
  );
}
