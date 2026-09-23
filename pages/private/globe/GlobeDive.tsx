import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import EarthGlobe, { EarthGlobeHandle, latLngToVector, ThreeParts } from './EarthGlobe';
import FpsMeter from './FpsMeter';
import IllustrativeTag from './IllustrativeTag';
import MockupNav from './MockupNav';
import { createTerrain, Terrain, TerrainWaypoint } from './TerrainLayer';
import { STORY_STOPS } from './storyData';

// M2: orbit → mountain close-up for the two peaks that have heightmaps.
//
// The move keeps one perspective until the very end:
//   1. the globe turns to centre the peak (same framed size as M1),
//   2. the camera zooms straight down onto it, still looking top-down,
//   3. the relief map resolves in place over the satellite texture,
//   4. only then does the camera tilt gracefully to an oblique view.
// The return plays the same path backwards. Routes and camps are illustrative.
const PEAKS: { id: string; heightmap: string; route: (s: { u: number; v: number }) => TerrainWaypoint[] }[] = [
  {
    id: 'everest',
    heightmap: '/heightmaps/everest.png',
    route: (s) => [
      { label: 'Base Camp', u: s.u - 0.28, v: s.v + 0.34 },
      { label: 'Camp 1', u: s.u - 0.18, v: s.v + 0.22 },
      { label: 'Camp 2', u: s.u - 0.1, v: s.v + 0.14 },
      { label: 'Camp 3', u: s.u - 0.05, v: s.v + 0.08 },
      { label: 'Camp 4', u: s.u - 0.02, v: s.v + 0.035 },
      { label: 'Summit', u: s.u, v: s.v },
    ],
  },
  {
    id: 'kilimanjaro',
    heightmap: '/heightmaps/kilimanjaro.png',
    route: (s) => [
      { label: 'Trailhead', u: s.u + 0.02, v: s.v + 0.4 },
      { label: 'Camp 1', u: s.u + 0.05, v: s.v + 0.28 },
      { label: 'Camp 2', u: s.u + 0.03, v: s.v + 0.17 },
      { label: 'High camp', u: s.u + 0.01, v: s.v + 0.07 },
      { label: 'Summit', u: s.u, v: s.v },
    ],
  },
];

// Patch width in globe radii (exaggerated for readability; not to scale).
const PATCH = 0.08;
const SURFACE = 1.0004;
// After the peak is turned to the top of the world (y axis):
const TOP_ALT = 0.15; // top-down altitude where the relief resolves, above where the satellite texture pixelates
const CLOSE_TARGET = new THREE.Vector3(0, SURFACE + 0.008, 0);
const CLOSE_OFFSET = new THREE.Vector3(0.04, 0.056, 0.084); // oblique view from the south-east

// Timeline (ms), after the rotate-to-peak.
const ZOOM = [0, 2400];
const RESOLVE = [1500, 3300];
const TILT = [2900, 5200];
const TOTAL = TILT[1];

type Mode = 'orbit' | 'diving' | 'terrain';

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => x * x * (3 - 2 * x);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const span = (t: number, [a, b]: number[]) => clamp01((t - a) / (b - a));

// Orientation mapping the terrain's local frame (x east, y up, z south) onto the
// globe surface at lat/lng.
function surfaceFrame(lat: number, lng: number): THREE.Quaternion {
  const up = latLngToVector(lat, lng).normalize();
  const north = new THREE.Vector3(0, 1, 0).sub(up.clone().multiplyScalar(up.y)).normalize();
  const south = north.clone().negate();
  const east = new THREE.Vector3().crossVectors(up, south).normalize();
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(east, up, south));
}

export default function GlobeDive() {
  const globeRef = useRef<EarthGlobeHandle>(null);
  const terrainRef = useRef<Terrain | null>(null);
  const mountedRef = useRef(true);
  const busyRef = useRef(false);
  // Rotation that turns the peak to the world top; applied rigidly to globe and camera.
  const swapRef = useRef<THREE.Quaternion | null>(null);
  const stateRef = useRef({ startAlt: 1, upTop: new THREE.Vector3(0, 0, -1) });
  const [mode, setMode] = useState<Mode>('orbit');
  const [peakId, setPeakId] = useState<string | null>(null);
  const [labels, setLabels] = useState<{ label: string; x: number; y: number }[]>([]);
  const markers = useMemo(
    () => STORY_STOPS.filter((s) => PEAKS.some((p) => p.id === s.id)).map((s) => ({ id: s.id, lat: s.lat, lng: s.lng })),
    [],
  );

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      terrainRef.current?.dispose();
      terrainRef.current = null;
    };
  }, []);

  // Camera and fades at time t (ms) on the dive timeline, in the swapped frame
  // where the peak sits at the top of the world.
  const pose = useCallback((parts: ThreeParts, t: number) => {
    const { camera, controls, globe } = parts;
    const { startAlt, upTop } = stateRef.current;

    // 2. Straight zoom down: altitude falls logarithmically, looking top-down.
    const z = easeInOut(span(t, ZOOM));
    const alt = Math.exp(Math.log(startAlt) + (Math.log(TOP_ALT) - Math.log(startAlt)) * z);
    const topPos = new THREE.Vector3(0, 1 + alt, 0);

    // 4. Tilt: swing from top-down to the oblique view around the patch centre, while
    // the camera's up vector eases from "north" on screen to world up.
    const k = easeInOut(span(t, TILT));
    const fromOffset = topPos.clone().sub(CLOSE_TARGET);
    const toOffset = CLOSE_OFFSET.clone();
    const fromDir = fromOffset.clone().normalize();
    const toDir = toOffset.clone().normalize();
    const angle = fromDir.angleTo(toDir);
    const dir = angle > 1e-4
      ? fromDir.clone().multiplyScalar(Math.sin((1 - k) * angle) / Math.sin(angle))
          .add(toDir.clone().multiplyScalar(Math.sin(k * angle) / Math.sin(angle))).normalize()
      : toDir;
    const length = fromOffset.length() + (toOffset.length() - fromOffset.length()) * k;
    // Looking straight down, the centre and the patch lie on the same ray, so moving
    // the target is invisible until the tilt starts.
    const target = new THREE.Vector3(0, 0, 0).lerp(CLOSE_TARGET, k > 0 ? 1 : 0);
    camera.position.copy(k > 0 ? CLOSE_TARGET.clone().add(dir.multiplyScalar(length)) : topPos);
    camera.up.copy(upTop).lerp(new THREE.Vector3(0, 1, 0), smooth(k)).normalize();
    controls.target.copy(target);
    camera.lookAt(target);

    // 3. Resolve: the relief fades in over the texture, the atmosphere thins, markers go.
    const r = smooth(span(t, RESOLVE));
    terrainRef.current?.setOpacity(r);
    const atmosphere = globe.children[1] as THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>;
    atmosphere.material.uniforms.opacity.value = 1 - smooth(clamp01((0.35 - alt) / 0.3));
    parts.markers.visible = alt > 0.6;
  }, []);

  const play = useCallback((parts: ThreeParts, from: number, to: number) =>
    new Promise<void>((resolve) => {
      const start = performance.now();
      const duration = Math.abs(to - from);
      const unhook = parts.addFrameHook(() => {
        if (!mountedRef.current) { unhook(); return resolve(); }
        const p = clamp01((performance.now() - start) / duration);
        pose(parts, from + (to - from) * p);
        if (p >= 1) { unhook(); resolve(); }
      });
    }), [pose]);

  const dive = useCallback(async (id: string) => {
    const globe = globeRef.current;
    const parts = globe?.three();
    const peak = PEAKS.find((p) => p.id === id);
    const stop = STORY_STOPS.find((s) => s.id === id);
    if (!globe || !parts || !peak || !stop || busyRef.current) return;
    busyRef.current = true;
    setPeakId(id);
    setMode('diving');

    // Load the relief while the globe turns to the peak.
    const terrainPromise = createTerrain(peak.heightmap, peak.route).catch(() => null);
    await globe.flyTo(stop.lat, stop.lng, { duration: 1600 });
    const terrain = await terrainPromise;
    if (!mountedRef.current) { terrain?.dispose(); return; }
    if (!terrain) { busyRef.current = false; setMode('orbit'); setPeakId(null); return; }

    const frame = surfaceFrame(stop.lat, stop.lng);
    terrain.group.quaternion.copy(frame);
    terrain.group.position.copy(latLngToVector(stop.lat, stop.lng, SURFACE));
    terrain.group.scale.setScalar(PATCH / 2);
    terrain.setOpacity(0);
    parts.globe.add(terrain.group);
    terrainRef.current = terrain;

    // Rigid swap: rotate globe and camera together so the peak is at the world top.
    // Nothing on screen changes.
    const { camera, controls } = parts;
    parts.frozen.value = true;
    controls.enabled = false;
    controls.autoRotate = false;
    const swap = frame.clone().invert();
    swapRef.current = swap;
    parts.globe.quaternion.premultiply(swap);
    camera.position.applyQuaternion(swap);
    camera.up.set(0, 1, 0).applyQuaternion(swap);
    camera.lookAt(0, 0, 0);
    camera.near = 0.0005;
    camera.updateProjectionMatrix();
    stateRef.current = { startAlt: camera.position.length() - 1, upTop: camera.up.clone() };

    await play(parts, 0, TOTAL);
    if (!mountedRef.current) return;
    camera.up.set(0, 1, 0);
    controls.target.copy(CLOSE_TARGET);
    controls.minDistance = 0.024;
    controls.maxDistance = 0.4;
    controls.maxPolarAngle = 1.35;
    controls.enableZoom = true;
    controls.enabled = true;
    parts.frozen.value = false;
    busyRef.current = false;
    setMode('terrain');
  }, [play]);

  const backToOrbit = useCallback(async () => {
    const globe = globeRef.current;
    const parts = globe?.three();
    const swap = swapRef.current;
    if (!globe || !parts || !swap || busyRef.current) return;
    busyRef.current = true;
    setMode('diving');
    const { camera, controls } = parts;
    controls.enabled = false;
    // Ease back to the default close-up if the user orbited away, then reverse the path.
    await globe.move({ position: CLOSE_TARGET.clone().add(CLOSE_OFFSET), target: CLOSE_TARGET.clone(), duration: 700 });
    parts.frozen.value = true;
    controls.enabled = false;
    await play(parts, TOTAL, 0);
    if (!mountedRef.current) return;

    // Undo the rigid swap (invisible), remove the relief, restore orbit controls.
    const unswap = swap.clone().invert();
    parts.globe.quaternion.premultiply(unswap);
    camera.position.applyQuaternion(unswap);
    camera.up.set(0, 1, 0);
    controls.target.set(0, 0, 0);
    camera.lookAt(0, 0, 0);
    camera.near = 0.01;
    camera.updateProjectionMatrix();
    const terrain = terrainRef.current;
    if (terrain) {
      parts.globe.remove(terrain.group);
      terrain.dispose();
    }
    terrainRef.current = null;
    swapRef.current = null;
    const rest = globe.restDistance();
    controls.minDistance = rest;
    controls.maxDistance = rest;
    controls.maxPolarAngle = Math.PI;
    controls.enableZoom = false;
    controls.enabled = true;
    parts.frozen.value = false;
    parts.markers.visible = true;
    busyRef.current = false;
    setPeakId(null);
    setMode('orbit');
  }, [play]);

  // Camp labels follow their markers on screen.
  useEffect(() => {
    if (mode !== 'terrain') {
      setLabels([]);
      return;
    }
    let raf = 0;
    const loop = () => {
      const parts = globeRef.current?.three();
      const terrain = terrainRef.current;
      if (parts && terrain) {
        const el = parts.renderer.domElement;
        setLabels(
          terrain.waypoints.map((w) => {
            const v = terrain.group.localToWorld(w.position.clone()).project(parts.camera);
            return { label: w.label, x: ((v.x + 1) / 2) * el.clientWidth, y: ((1 - v.y) / 2) * el.clientHeight };
          }),
        );
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [mode]);

  useEffect(() => {
    const w = window as unknown as Record<string, unknown>;
    w.__dive = {
      mode: () => mode,
      dive: (id: string) => { void dive(id); },
      back: () => { void backToOrbit(); },
      canvases: () => document.querySelectorAll('canvas').length,
      camera: () => {
        const c = globeRef.current?.three()?.camera;
        return c ? { distance: c.position.length() } : null;
      },
      renderer: () => {
        const r = globeRef.current?.three()?.renderer;
        return r ? { programs: r.info.programs?.length ?? 0, geometries: r.info.memory.geometries, textures: r.info.memory.textures } : null;
      },
    };
    return () => { delete w.__dive; };
  });

  const peakName = STORY_STOPS.find((s) => s.id === peakId)?.name;

  return (
    <div className="min-h-[100dvh] bg-black text-white">
      <MockupNav current="#private/globe-dive" />
      <FpsMeter />

      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 pb-10 pt-16 lg:min-h-[100dvh] lg:flex-row lg:justify-center lg:gap-10 lg:pt-12">
        {/* Fixed-size stage: at most ~2/3 of the page */}
        <div
          data-testid="globe-frame"
          className="relative aspect-[4/5] w-[min(92vw,62vh)] flex-none overflow-hidden rounded-3xl border border-white/10 lg:aspect-[4/3] lg:w-[min(64vw,90vh)]"
        >
          <EarthGlobe
            ref={globeRef}
            className="absolute inset-0"
            markers={markers}
            activeMarker={peakId}
            autoRotate={mode === 'orbit'}
            sunMode="camera"
            fitRadius={1.14}
            onMarkerClick={(id) => mode === 'orbit' && dive(id)}
          />
          {labels.map((l) => (
            <div
              key={l.label}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-full whitespace-nowrap rounded bg-black/70 px-2 py-0.5 text-[11px] font-semibold text-white"
              style={{ left: l.x, top: l.y - 6 }}
            >
              {l.label}
            </div>
          ))}
        </div>

        <aside className="w-full lg:w-72 lg:flex-none">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-teal">Mountain close-up</p>
          <h2 className="mt-2 font-heading text-2xl font-bold">{mode === 'terrain' ? peakName : 'Fly down to a summit'}</h2>
          <p className="mt-2 text-sm text-gray-400">
            {mode === 'terrain'
              ? 'Terrain from a 256×256 heightmap, exaggerated for readability. Drag to orbit, scroll or pinch to zoom.'
              : 'Zoom straight in, let the relief resolve, then tilt into the mountain.'}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {mode === 'terrain' ? (
              <button onClick={backToOrbit} className="rounded-full bg-white/15 px-5 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-white/25">
                ← Back to orbit
              </button>
            ) : (
              PEAKS.map((p) => (
                <button
                  key={p.id}
                  disabled={mode !== 'orbit'}
                  onClick={() => dive(p.id)}
                  className="rounded-full bg-brand-teal px-5 py-2.5 text-sm font-bold uppercase tracking-wider disabled:opacity-40"
                >
                  {STORY_STOPS.find((s) => s.id === p.id)?.name}
                </button>
              ))
            )}
          </div>
        </aside>
      </div>

      <IllustrativeTag visible={mode === 'terrain'} text="Illustrative — route and camps are placeholders, not Kim's actual route" />
    </div>
  );
}
