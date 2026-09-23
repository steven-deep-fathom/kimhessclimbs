import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import FpsMeter from './FpsMeter';
import IllustrativeTag from './IllustrativeTag';
import MockupNav from './MockupNav';
import StoryPostModal from './StoryPostModal';
import { createTerrain, Terrain, TerrainWaypoint } from './TerrainLayer';
import { STORY_STOPS } from './storyData';
import { assetPath } from '../../../utils/assetPath';

// M4: a fresh take on the old #private/everest and #private/kilimanjaro hero
// mockups. Same idea (a mountain hero with real terrain behind the title), but the
// terrain is framed and lit properly: a timed sun sweep instead of mouse lighting
// (so it works on phones), sky-coloured haze so the relief sits in the scene, and a
// slow orbiting camera. Unlisted mockup.

interface SummitLook {
  id: string;
  eyebrow: string;
  heightmap: string;
  sky: [string, string, string]; // top, middle, horizon
  sun: string;
  fog: string;
  postId: string | null;
  route: (s: { u: number; v: number }) => TerrainWaypoint[];
}

const LOOKS: SummitLook[] = [
  {
    id: 'everest',
    eyebrow: 'The roof of the world',
    heightmap: '/heightmaps/everest.png',
    sky: ['#07122a', '#2c4a7a', '#f3b27a'],
    sun: '#ffd9a8',
    fog: '#8aa3c7',
    postId: 'rush-hour-death-zone',
    route: (s) => [
      { label: 'Base Camp', u: s.u - 0.28, v: s.v + 0.34 },
      { label: 'Camp 2', u: s.u - 0.1, v: s.v + 0.14 },
      { label: 'Camp 4', u: s.u - 0.02, v: s.v + 0.035 },
      { label: 'Summit', u: s.u, v: s.v },
    ],
  },
  {
    id: 'kilimanjaro',
    eyebrow: 'The roof of Africa',
    heightmap: '/heightmaps/kilimanjaro.png',
    sky: ['#140b22', '#6b3350', '#f5a55f'],
    sun: '#ffc07a',
    fog: '#b48a86',
    postId: null,
    route: (s) => [
      { label: 'Trailhead', u: s.u + 0.02, v: s.v + 0.4 },
      { label: 'Camp 2', u: s.u + 0.03, v: s.v + 0.17 },
      { label: 'High camp', u: s.u + 0.01, v: s.v + 0.07 },
      { label: 'Summit', u: s.u, v: s.v },
    ],
  },
];

interface HeroTerrainProps {
  look: SummitLook;
  showRoute: boolean;
}

const HeroTerrain: React.FC<HeroTerrainProps> = ({ look, showRoute }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const terrainRef = useRef<Terrain | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    terrainRef.current?.setRouteVisible(showRoute);
  }, [showRoute, ready]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;
    setReady(false);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(look.fog, 2.2, 6.5);
    const camera = new THREE.PerspectiveCamera(35, mount.clientWidth / mount.clientHeight, 0.01, 50);

    const sun = new THREE.DirectionalLight(look.sun, 3.2);
    const sunTarget = new THREE.Object3D();
    sun.target = sunTarget;
    scene.add(sun, sunTarget, new THREE.HemisphereLight('#c9dcff', '#2a2028', 0.75));

    let summit = new THREE.Vector3();
    const onResize = () => {
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(onResize);
    observer.observe(mount);

    let pointer = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      pointer = { x: e.clientX / window.innerWidth - 0.5, y: e.clientY / window.innerHeight - 0.5 };
    };
    window.addEventListener('pointermove', onPointer);

    createTerrain(look.heightmap, look.route, { lights: false, showRoute })
      .then((terrain) => {
        if (disposed) return terrain.dispose();
        terrainRef.current = terrain;
        terrain.group.scale.set(1, 1.25, 1);
        terrain.mesh.material.roughness = 1;
        scene.add(terrain.group);
        const s = terrain.summit;
        summit = new THREE.Vector3((s.u - 0.5) * 2, terrain.heightAt(s.u, s.v) * 0.45 * 1.25, (s.v - 0.5) * 2);
        sunTarget.position.copy(summit);
        setReady(true);
      })
      .catch(() => { /* heightmap missing: hero shows the sky only */ });

    const start = performance.now();
    let opacity = 0;
    let raf = 0;
    const tick = () => {
      const t = (performance.now() - start) / 1000;
      // Slow orbit around the summit, low over the ridges.
      const az = -0.6 + t * 0.05 + pointer.x * 0.15;
      const dist = 2.35;
      const elev = 0.34 + pointer.y * -0.05;
      camera.position.set(
        summit.x + Math.sin(az) * dist * Math.cos(elev),
        summit.y + Math.sin(elev) * dist,
        summit.z + Math.cos(az) * dist * Math.cos(elev),
      );
      camera.lookAt(summit.x, summit.y - 0.18, summit.z);
      // Sun sweeps slowly across a low arc so the relief keeps changing.
      const sunAz = 2.2 + Math.sin(t * 0.08) * 0.9;
      sun.position.set(summit.x + Math.cos(sunAz) * 4, summit.y + 1.3, summit.z + Math.sin(sunAz) * 4);
      if (terrainRef.current && opacity < 1) {
        opacity = Math.min(1, opacity + 0.02);
        terrainRef.current.setOpacity(opacity);
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('pointermove', onPointer);
      terrainRef.current?.dispose();
      terrainRef.current = null;
      renderer.forceContextLoss();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
    // Rebuild when the mountain changes; route visibility is handled separately.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [look]);

  return <div ref={mountRef} className="absolute inset-0" />;
};

export default function SummitHero() {
  const [lookId, setLookId] = useState('everest');
  const [showRoute, setShowRoute] = useState(false);
  const [postId, setPostId] = useState<string | null>(null);
  const look = LOOKS.find((l) => l.id === lookId) ?? LOOKS[0];
  const stop = STORY_STOPS.find((s) => s.id === look.id);
  if (!stop) return null;

  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <MockupNav current="#private/summit-hero" />
      <FpsMeter />

      {/* Hero */}
      <section
        className="relative h-[72vh] min-h-[480px] overflow-hidden md:h-[82vh]"
        style={{ background: `linear-gradient(180deg, ${look.sky[0]} 0%, ${look.sky[1]} 48%, ${look.sky[2]} 100%)` }}
      >
        <HeroTerrain key={look.id} look={look} showRoute={showRoute} />
        {/* Ground the terrain into the page below */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-brand-dark" />

        <div className="absolute right-4 top-14 z-10 flex gap-1 rounded-full bg-black/40 p-1 backdrop-blur md:right-8">
          {LOOKS.map((l) => (
            <button
              key={l.id}
              onClick={() => { setLookId(l.id); setShowRoute(false); }}
              className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${l.id === lookId ? 'bg-white text-brand-dark' : 'text-white/80 hover:text-white'}`}
            >
              {STORY_STOPS.find((s) => s.id === l.id)?.name}
            </button>
          ))}
        </div>

        <div className="absolute inset-x-0 bottom-10 z-10 mx-auto max-w-6xl px-5 md:bottom-16 md:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/80">{look.eyebrow}</p>
          <h1 className="mt-2 font-heading text-5xl font-bold uppercase leading-none drop-shadow-lg md:text-7xl">{stop.name}</h1>
          <p className="mt-3 text-lg text-white/90 md:text-xl">{stop.elevation} · Summited {stop.year}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {look.postId && (
              <button onClick={() => setPostId(look.postId)} className="rounded-full bg-brand-teal px-6 py-3 text-sm font-bold uppercase tracking-widest">
                Read the story
              </button>
            )}
            <button
              onClick={() => setShowRoute((v) => !v)}
              className="rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-bold uppercase tracking-widest backdrop-blur hover:bg-white/20"
            >
              {showRoute ? 'Hide route' : 'Show route'}
            </button>
          </div>
        </div>
      </section>

      {/* Facts and photos below the hero */}
      <section className="mx-auto max-w-6xl px-5 py-12 md:px-8">
        <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            ['Elevation', stop.elevation],
            ['Summited', stop.year],
            ['Continent', stop.continent],
            ['Coordinates', `${Math.abs(stop.lat).toFixed(2)}°${stop.lat >= 0 ? 'N' : 'S'}, ${Math.abs(stop.lng).toFixed(2)}°${stop.lng >= 0 ? 'E' : 'W'}`],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <dt className="text-xs uppercase tracking-wider text-gray-400">{k}</dt>
              <dd className="mt-1 font-heading text-xl font-bold">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-8 max-w-2xl text-gray-300">{stop.quote}</p>
        <div className="mt-8 grid grid-cols-3 gap-3">
          {stop.photos.map((src) => (
            <img key={src} src={assetPath(src)} alt="" loading="lazy" className="aspect-[4/3] w-full rounded-xl object-cover" />
          ))}
        </div>
      </section>

      <IllustrativeTag visible={showRoute} text="Illustrative — route and camps are placeholders, not Kim's actual route" />
      <StoryPostModal postId={postId} onClose={() => setPostId(null)} />
    </div>
  );
}
