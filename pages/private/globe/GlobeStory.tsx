import React, { useEffect, useMemo, useRef, useState } from 'react';
import EarthGlobe, { EarthGlobeHandle, GlobeArc } from './EarthGlobe';
import FpsMeter from './FpsMeter';
import IllustrativeTag from './IllustrativeTag';
import MockupNav from './MockupNav';
import StoryPostModal from './StoryPostModal';
import { AIR_MILES, POLES, STORY_STOPS } from './storyData';
import { assetPath } from '../../../utils/assetPath';

// M3: scroll-driven story, 2011 → 2018, ending on the Poles. Unlisted mockup.
// The story column and the globe never overlap, and the globe (with its arcs)
// always fits its frame: stops rotate the globe rather than zooming in.
// Step 0 is the intro, steps 1..7 are the climbs, the last step is the Poles.
const FINAL = STORY_STOPS.length + 1;

export default function GlobeStory() {
  const globeRef = useRef<EarthGlobeHandle>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const [step, setStep] = useState(0);
  const [arcs, setArcs] = useState<GlobeArc[]>([]);
  const [postId, setPostId] = useState<string | null>(null);
  const [poleLabels, setPoleLabels] = useState<{ id: string; x: number; y: number; visible: boolean }[]>([]);

  const markers = useMemo(
    () => [
      ...STORY_STOPS.map((s) => ({ id: s.id, lat: s.lat, lng: s.lng })),
      ...(step === FINAL ? POLES.map((p) => ({ id: p.id, lat: p.lat, lng: p.lng, color: '#e2e8f0' })) : []),
    ],
    [step],
  );
  const activeId = step >= 1 && step <= STORY_STOPS.length ? STORY_STOPS[step - 1].id : null;

  // The section at the reading line drives the globe. On phones the reading
  // line sits in the text area below the pinned globe.
  useEffect(() => {
    const phone = window.innerWidth < 768;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setStep(Number((entry.target as HTMLElement).dataset.step));
        });
      },
      { rootMargin: phone ? '-70% 0px -24% 0px' : '-45% 0px -45% 0px' },
    );
    sectionRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    const full = (upTo: number): GlobeArc[] =>
      STORY_STOPS.slice(1, upTo + 1).map((s, i) => ({ from: STORY_STOPS[i], to: s, progress: 1 }));

    if (step === 0) {
      setArcs([]);
      globe.flyTo(10, -40);
      return;
    }
    if (step === FINAL) {
      setArcs(full(STORY_STOPS.length - 1));
      // Side-on at the equator: both poles sit on the globe's outline.
      globe.flyTo(0, 20, { duration: 1800 });
      return;
    }
    const stop = STORY_STOPS[step - 1];
    globe.flyTo(stop.lat, stop.lng, { duration: 1500 });
    if (step === 1) {
      setArcs([]);
      return;
    }
    // Earlier arcs stay drawn; the arc into this stop draws in over ~1.1 s.
    const done = full(step - 2);
    const prev = STORY_STOPS[step - 2];
    let raf = 0;
    const start = performance.now();
    const grow = () => {
      const t = Math.min((performance.now() - start) / 1100, 1);
      setArcs([...done, { from: prev, to: stop, progress: t }]);
      if (t < 1) raf = requestAnimationFrame(grow);
    };
    grow();
    return () => cancelAnimationFrame(raf);
  }, [step]);

  // "Still to come" labels follow the pole markers, hidden when a pole faces away.
  useEffect(() => {
    if (step !== FINAL) {
      setPoleLabels([]);
      return;
    }
    let raf = 0;
    const loop = () => {
      const g = globeRef.current;
      if (g) {
        setPoleLabels(
          POLES.map((p) => {
            const pos = g.project(p.lat, p.lng, 1.03);
            return { id: p.id, x: pos?.x ?? 0, y: pos?.y ?? 0, visible: !!pos?.visible };
          }),
        );
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [step]);

  useEffect(() => {
    const w = window as unknown as Record<string, unknown>;
    w.__story = {
      step: () => step,
      stops: STORY_STOPS.length,
      arcs: () => arcs.length,
      frame: () => {
        const r = frameRef.current?.getBoundingClientRect();
        const text = document.querySelector('main')?.getBoundingClientRect();
        return r && text
          ? { frame: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)], textRight: Math.round(text.right), vw: innerWidth, vh: innerHeight }
          : null;
      },
    };
    return () => { delete w.__story; };
  });

  const register = (i: number) => (el: HTMLElement | null) => { sectionRefs.current[i] = el; };

  return (
    <div className="min-h-screen bg-black text-white">
      <MockupNav current="#private/globe-story" />
      <FpsMeter />

      <div className="md:grid md:grid-cols-[42%_58%]">
        {/* Globe: pinned under the switcher on phones, its own sticky column on desktop */}
        <div className="sticky top-10 z-10 flex justify-center bg-black pb-2 md:order-2 md:top-0 md:h-screen md:items-center md:self-start md:pb-0">
          <div ref={frameRef} className="relative aspect-square w-[min(92vw,44vh)] md:w-[min(52vw,84vh)]">
            <EarthGlobe
              ref={globeRef}
              className="absolute inset-0"
              markers={markers}
              activeMarker={activeId}
              arcs={arcs}
              sunMode="camera"
              fitRadius={1.28}
              initialView={{ lat: 10, lng: -40 }}
            />
            <div className="absolute -bottom-1 left-0 right-0 flex justify-center gap-1.5">
              {Array.from({ length: FINAL + 1 }, (_, i) => (
                <button
                  key={i}
                  aria-label={`Go to step ${i}`}
                  onClick={() => sectionRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                  className={`h-1.5 rounded-full transition-all ${i === step ? 'w-5 bg-brand-teal' : 'w-1.5 bg-white/30 hover:bg-white/60'}`}
                />
              ))}
            </div>
            {poleLabels.filter((l) => l.visible).map((l) => (
              <div
                key={l.id}
                className="pointer-events-none absolute -translate-x-1/2 whitespace-nowrap rounded-full border border-white/30 bg-black/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-100 md:text-[11px]"
                style={{ left: l.x, top: l.id === 'north-pole' ? l.y - 30 : l.y + 10 }}
              >
                {POLES.find((p) => p.id === l.id)?.name} · Still to come
              </div>
            ))}
          </div>
        </div>

        {/* Story column */}
        <main className="relative md:order-1">
          <section ref={register(0)} data-step={0} className="flex min-h-[38vh] items-center px-5 py-8 md:min-h-[68vh] md:px-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-teal">2011 – 2018</p>
              <h1 className="mt-3 font-heading text-4xl font-bold uppercase leading-tight md:text-5xl">Seven summits.<br />Seven continents.</h1>
              <p className="mt-4 max-w-md text-gray-300">Scroll to follow Kim's climbs in the order she made them.</p>
            </div>
          </section>

          {STORY_STOPS.map((s, i) => (
            <section key={s.id} ref={register(i + 1)} data-step={i + 1} className="flex min-h-[46vh] items-center px-5 py-6 md:min-h-[58vh] md:px-10">
              <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-5 md:p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-teal">{i + 1} of 7 · {s.year} · {s.continent}</p>
                <h2 className="mt-2 font-heading text-3xl font-bold uppercase">{s.name}</h2>
                <p className="mt-1 text-sm text-gray-400">{s.elevation}</p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {s.photos.map((src) => (
                    <img key={src} src={assetPath(src)} alt="" loading="lazy" className="aspect-square w-full rounded-lg object-cover" />
                  ))}
                </div>
                {s.postId ? (
                  <button
                    onClick={() => setPostId(s.postId)}
                    className="mt-5 rounded-full bg-brand-teal px-5 py-2.5 text-sm font-bold uppercase tracking-wider"
                  >
                    Read the story
                  </button>
                ) : (
                  <blockquote className="mt-5 border-l-2 border-brand-teal pl-4 text-sm italic text-gray-300">{s.quote}</blockquote>
                )}
              </div>
            </section>
          ))}

          <section ref={register(FINAL)} data-step={FINAL} className="flex min-h-[52vh] items-center px-5 pb-24 pt-6 md:min-h-[70vh] md:px-10">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-5 md:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-teal">By the numbers</p>
              <p className="mt-3 font-heading text-5xl font-bold text-white md:text-6xl">{AIR_MILES.toLocaleString()}</p>
              <p className="mt-1 text-sm uppercase tracking-wider text-gray-400">miles traveled by air</p>
              <h2 className="mt-10 font-heading text-3xl font-bold uppercase">Two poles to go</h2>
              <p className="mt-3 max-w-md text-gray-300">The North and South Poles complete the Explorers Grand Slam.</p>
            </div>
          </section>
        </main>
      </div>

      <IllustrativeTag visible={arcs.length > 0} text="Illustrative — arcs connect peaks in climb order, not actual flights" />
      <StoryPostModal postId={postId} onClose={() => setPostId(null)} />
    </div>
  );
}
