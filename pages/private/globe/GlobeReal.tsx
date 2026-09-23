import React, { useEffect, useMemo, useRef, useState } from 'react';
import EarthGlobe, { EarthGlobeHandle, subsolarPoint } from './EarthGlobe';
import FpsMeter from './FpsMeter';
import MockupNav from './MockupNav';
import { STORY_STOPS, StoryStop } from './storyData';
import { assetPath } from '../../../utils/assetPath';

const POSTER = '/sandbox-assets/globe-poster.jpg';

// M1: photo-real Earth in a fixed round frame (at most ~2/3 of the page).
// Zooming and fly-to change the view inside the frame; the frame never grows.
// Unlisted mockup.
export default function GlobeReal() {
  const globeRef = useRef<EarthGlobeHandle>(null);
  const [selected, setSelected] = useState<StoryStop | null>(null);
  const [started, setStarted] = useState(() => window.innerWidth >= 768);
  // Open on the sunlit side; the day/night line is live.
  const [initialView] = useState(() => ({ lat: 15, lng: subsolarPoint(new Date()).lng }));
  const markers = useMemo(() => STORY_STOPS.map((s) => ({ id: s.id, lat: s.lat, lng: s.lng })), []);

  const select = (stop: StoryStop) => {
    setSelected(stop);
    // Zoom in inside the frame so the region reads, without the frame changing size.
    globeRef.current?.flyTo(stop.lat, stop.lng, { distance: 2.05, duration: 2400 });
  };

  const reset = () => {
    const g = globeRef.current;
    const cam = g?.cameraLatLng();
    setSelected(null);
    if (g && cam) g.flyTo(cam.lat, cam.lng, { duration: 1600 });
  };

  // Test hook for the Playwright fly-to check (unlisted mockup page).
  useEffect(() => {
    const w = window as unknown as Record<string, unknown>;
    w.__globe = {
      peaks: STORY_STOPS.map((s) => ({ id: s.id, lat: s.lat, lng: s.lng })),
      select: (id: string) => {
        const stop = STORY_STOPS.find((s) => s.id === id);
        if (stop) select(stop);
      },
      camera: () => globeRef.current?.cameraLatLng(),
      cardVisible: () => !!document.querySelector('[data-testid="peak-card"]'),
      frame: () => {
        const el = document.querySelector('[data-testid="globe-frame"]')?.getBoundingClientRect();
        return el ? { w: Math.round(el.width), h: Math.round(el.height), vw: innerWidth, vh: innerHeight } : null;
      },
    };
    return () => { delete w.__globe; };
  });

  return (
    <div className="min-h-[100dvh] bg-black text-white">
      <MockupNav current="#private/globe-real" />
      <FpsMeter />

      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 pb-10 pt-16 lg:flex-row lg:items-center lg:justify-center lg:gap-10 lg:pt-12 lg:min-h-[100dvh]">
        {/* Peak list: chips on phones, a column on desktop */}
        <aside className="order-2 flex w-full gap-2 overflow-x-auto scrollbar-hide lg:order-1 lg:w-56 lg:flex-none lg:flex-col lg:overflow-visible">
          <p className="hidden text-xs font-bold uppercase tracking-[0.25em] text-brand-teal lg:block">Seven summits</p>
          {STORY_STOPS.map((s) => (
            <button
              key={s.id}
              onClick={() => select(s)}
              className={`shrink-0 rounded-xl border px-3 py-2 text-left transition lg:w-full ${
                selected?.id === s.id ? 'border-brand-teal bg-brand-teal/15' : 'border-white/10 bg-white/[0.03] hover:bg-white/10'
              }`}
            >
              <span className="block text-sm font-bold">{s.name}</span>
              <span className="block text-xs text-gray-400">{s.year} · {s.elevation}</span>
            </button>
          ))}
        </aside>

        {/* Fixed-size round frame: min(62vw, 70vh) on desktop, min(92vw, 60vh) on phones */}
        <div className="order-1 flex-none lg:order-2">
          <div
            data-testid="globe-frame"
            className="relative aspect-square w-[min(92vw,60vh)] overflow-hidden rounded-full shadow-[0_0_80px_rgba(56,140,255,0.25)] lg:w-[min(62vw,70vh)]"
          >
            {started ? (
              <EarthGlobe
                ref={globeRef}
                className="absolute inset-0"
                markers={markers}
                activeMarker={selected?.id ?? null}
                autoRotate={!selected}
                fitRadius={1.16}
                minZoomDistance={1.35}
                initialView={initialView}
                onMarkerClick={(id) => {
                  const stop = STORY_STOPS.find((s) => s.id === id);
                  if (stop) select(stop);
                }}
              />
            ) : (
              <button
                className="absolute inset-0 flex items-end justify-center bg-black bg-cover bg-center pb-8"
                style={{ backgroundImage: `url(${POSTER})` }}
                onClick={() => setStarted(true)}
              >
                <span className="rounded-full bg-brand-teal px-6 py-3 text-sm font-bold uppercase tracking-widest shadow-lg">
                  Tap to explore
                </span>
              </button>
            )}
          </div>
          <p className="mt-3 text-center text-xs text-gray-500">Drag to rotate · scroll or pinch to zoom inside the frame</p>
        </div>

        {/* Selected peak */}
        <section className="order-3 w-full lg:w-72 lg:flex-none">
          {selected ? (
            <div data-testid="peak-card" className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
              <img src={assetPath(selected.photos[0])} alt="" className="h-40 w-full object-cover" />
              <div className="p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-teal">{selected.continent} · {selected.year}</p>
                <h2 className="mt-1 font-heading text-xl font-bold">{selected.name}</h2>
                <p className="mt-1 text-sm text-gray-300">{selected.elevation}</p>
                <button onClick={reset} className="mt-4 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white">
                  ← Whole globe
                </button>
              </div>
            </div>
          ) : (
            <p className="hidden text-sm text-gray-500 lg:block">Pick a summit to fly there.</p>
          )}
        </section>
      </div>

      <p className="pb-4 text-center text-[10px] text-gray-600">Imagery: NASA Earth Observatory (Blue Marble, Black Marble)</p>
    </div>
  );
}
