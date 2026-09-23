import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Unlisted mockup (see docs/plans/2026-09-22_globe-concept-mockups.md).
// Textures live in public/sandbox-assets/ and are fetched only when a mockup opens.
const TEXTURES = {
  large: { day: '/sandbox-assets/textures/earth-day-4096.jpg', night: '/sandbox-assets/textures/earth-night-4096.jpg' },
  small: { day: '/sandbox-assets/textures/earth-day-2048.jpg', night: '/sandbox-assets/textures/earth-night-2048.jpg' },
};

const FOV = 40;

export interface GlobeMarker {
  id: string;
  lat: number;
  lng: number;
  color?: string;
}

export interface GlobeArc {
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  progress: number; // 0..1, portion of the arc drawn
}

export interface ThreeParts {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  globe: THREE.Group;
  markers: THREE.Group;
  // Runs every frame before rendering; returns an unsubscribe function.
  addFrameHook: (fn: () => void) => () => void;
  // While true, OrbitControls is not updated, so a scripted camera path owns the camera.
  frozen: { value: boolean };
}

export interface CameraMove {
  position: THREE.Vector3;
  target?: THREE.Vector3;
  duration?: number;
  // Called every frame with the eased progress 0..1 (for coordinated fades, rotations).
  onProgress?: (t: number) => void;
}

export interface EarthGlobeHandle {
  flyTo: (lat: number, lng: number, opts?: { distance?: number; duration?: number }) => Promise<void>;
  move: (m: CameraMove) => Promise<void>;
  restDistance: () => number;
  cameraLatLng: () => { lat: number; lng: number; distance: number };
  project: (lat: number, lng: number, altitude?: number) => { x: number; y: number; visible: boolean } | null;
  three: () => ThreeParts | null;
}

interface EarthGlobeProps {
  markers?: GlobeMarker[];
  activeMarker?: string | null;
  arcs?: GlobeArc[];
  onMarkerClick?: (id: string) => void;
  autoRotate?: boolean;
  // 'live' lights the Earth for the current time; 'camera' keeps the view in daylight.
  sunMode?: 'live' | 'camera';
  // Radius (in globe radii) that must fit inside the frame at rest, e.g. 1.1 for the
  // globe plus atmosphere, 1.3 when arcs rise above it.
  fitRadius?: number;
  // Closest zoom as a camera distance; null disables zooming.
  minZoomDistance?: number | null;
  initialView?: { lat: number; lng: number };
  className?: string;
}

export function latLngToVector(lat: number, lng: number, radius = 1): THREE.Vector3 {
  // Matches THREE.SphereGeometry UVs with an equirectangular texture (u = 0 at -180°).
  const phi = ((lng + 180) * Math.PI) / 180;
  const theta = ((90 - lat) * Math.PI) / 180;
  return new THREE.Vector3(
    -radius * Math.cos(phi) * Math.sin(theta),
    radius * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

export function vectorToLatLng(v: THREE.Vector3): { lat: number; lng: number } {
  const n = v.clone().normalize();
  const lat = 90 - (Math.acos(n.y) * 180) / Math.PI;
  let lng = (Math.atan2(n.z, -n.x) * 180) / Math.PI - 180;
  if (lng < -180) lng += 360;
  return { lat, lng };
}

// Approximate subsolar point for the current time, for the day/night line.
export function subsolarPoint(date: Date): { lat: number; lng: number } {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const day = (date.getTime() - start) / 86400000;
  const declination = -23.44 * Math.cos(((2 * Math.PI) / 365) * (day + 10));
  const hours = date.getUTCHours() + date.getUTCMinutes() / 60;
  return { lat: declination, lng: (12 - hours) * 15 };
}

// Camera distance at which a sphere of `radius` just fits the smaller frame dimension.
function fitDistance(radius: number, aspect: number): number {
  const halfV = (FOV * Math.PI) / 360;
  const halfH = Math.atan(Math.tan(halfV) * aspect);
  return radius / Math.sin(Math.min(halfV, halfH));
}

function arcPoints(from: { lat: number; lng: number }, to: { lat: number; lng: number }, segments = 96): THREE.Vector3[] {
  const a = latLngToVector(from.lat, from.lng);
  const b = latLngToVector(to.lat, to.lng);
  const angle = a.angleTo(b);
  // Kept low so arcs stay inside the framed radius.
  const lift = Math.min(0.2, 0.04 + angle * 0.07);
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const p = new THREE.Vector3();
    if (angle > 1e-4) {
      const s = Math.sin(angle);
      p.copy(a).multiplyScalar(Math.sin((1 - t) * angle) / s).add(b.clone().multiplyScalar(Math.sin(t * angle) / s));
    } else {
      p.copy(a);
    }
    points.push(p.multiplyScalar(1.004 + Math.sin(t * Math.PI) * lift));
  }
  return points;
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const EarthGlobe = forwardRef<EarthGlobeHandle, EarthGlobeProps>(
  (
    {
      markers = [],
      activeMarker = null,
      arcs = [],
      onMarkerClick,
      autoRotate = false,
      sunMode = 'live',
      fitRadius = 1.12,
      minZoomDistance = null,
      initialView,
      className,
    },
    ref,
  ) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const partsRef = useRef<ThreeParts | null>(null);
    const arcGroupRef = useRef<THREE.Group | null>(null);
    const flightRef = useRef<number | null>(null);
    const restRef = useRef(3);
    const clickRef = useRef(onMarkerClick);
    clickRef.current = onMarkerClick;
    const autoRotateRef = useRef(autoRotate);
    autoRotateRef.current = autoRotate;

    useEffect(() => {
      const mount = mountRef.current;
      if (!mount) return;
      const small = window.innerWidth < 768;
      const tex = small ? TEXTURES.small : TEXTURES.large;
      const width = () => Math.max(1, mount.clientWidth);
      const height = () => Math.max(1, mount.clientHeight);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width(), height());
      mount.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(FOV, width() / height(), 0.01, 80);
      restRef.current = fitDistance(fitRadius, camera.aspect);
      const start = initialView ?? { lat: 20, lng: 10 };
      camera.position.copy(latLngToVector(start.lat, start.lng, restRef.current));
      camera.lookAt(0, 0, 0);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.enablePan = false;
      controls.rotateSpeed = 0.5;
      controls.autoRotate = autoRotate;
      controls.autoRotateSpeed = 0.35;
      controls.enableZoom = minZoomDistance !== null;
      controls.minDistance = minZoomDistance ?? restRef.current;
      controls.maxDistance = restRef.current;

      const globe = new THREE.Group();
      scene.add(globe);

      const loader = new THREE.TextureLoader();
      const dayTex = loader.load(tex.day);
      const nightTex = loader.load(tex.night);
      dayTex.colorSpace = THREE.SRGBColorSpace;
      nightTex.colorSpace = THREE.SRGBColorSpace;
      dayTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

      const sun = subsolarPoint(new Date());
      const sunDir = latLngToVector(sun.lat, sun.lng).normalize();
      const sunLocal = new THREE.Vector3();

      const earthMaterial = new THREE.ShaderMaterial({
        uniforms: {
          dayMap: { value: dayTex },
          nightMap: { value: nightTex },
          sunDirection: { value: sunLocal },
          opacity: { value: 1 },
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vNormal;
          void main() {
            vUv = uv;
            vNormal = normalize(normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: `
          uniform sampler2D dayMap;
          uniform sampler2D nightMap;
          uniform vec3 sunDirection;
          uniform float opacity;
          varying vec2 vUv;
          varying vec3 vNormal;
          void main() {
            float light = dot(normalize(vNormal), sunDirection);
            float dayMix = smoothstep(-0.12, 0.18, light);
            vec3 day = texture2D(dayMap, vUv).rgb * (0.35 + 0.75 * max(light, 0.0));
            vec3 night = texture2D(nightMap, vUv).rgb * 1.4;
            gl_FragColor = vec4(mix(night, day, dayMix), opacity);
            #include <colorspace_fragment>
          }`,
        transparent: true,
      });
      globe.add(new THREE.Mesh(new THREE.SphereGeometry(1, 128, 128), earthMaterial));

      const atmosphereMaterial = new THREE.ShaderMaterial({
        uniforms: { opacity: { value: 1 } },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vView;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vView = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: `
          uniform float opacity;
          varying vec3 vNormal;
          varying vec3 vView;
          void main() {
            float rim = 1.0 - max(dot(vNormal, vView), 0.0);
            gl_FragColor = vec4(0.35, 0.7, 1.0, pow(rim, 3.0) * 0.9 * opacity);
          }`,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      });
      globe.add(new THREE.Mesh(new THREE.SphereGeometry(1.06, 96, 96), atmosphereMaterial));

      const starGeo = new THREE.BufferGeometry();
      const starPos = new Float32Array(1500 * 3);
      for (let i = 0; i < 1500; i++) {
        const v = new THREE.Vector3().randomDirection().multiplyScalar(30 + Math.random() * 20);
        starPos.set([v.x, v.y, v.z], i * 3);
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
      scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x8899aa, size: 0.08 })));

      const markerGroup = new THREE.Group();
      globe.add(markerGroup);
      const arcGroup = new THREE.Group();
      globe.add(arcGroup);
      arcGroupRef.current = arcGroup;

      const inverse = new THREE.Quaternion();
      const hooks = new Set<() => void>();
      const frozen = { value: false };
      let raf = 0;
      const tick = () => {
        hooks.forEach((fn) => fn());
        if (!frozen.value) controls.update();
        // Sun direction in world space, then into the globe's frame (the globe may rotate).
        if (sunMode === 'camera') {
          sunDir.copy(camera.position).sub(controls.target).normalize();
          if (sunDir.lengthSq() < 1e-6) sunDir.set(0, 1, 0);
          sunDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.45);
          sunDir.y += 0.3;
          sunDir.normalize();
        }
        inverse.copy(globe.quaternion).invert();
        sunLocal.copy(sunDir).applyQuaternion(inverse);
        // Keep marker size constant on screen.
        const dist = camera.position.distanceTo(controls.target);
        markerGroup.children.forEach((m) => m.scale.setScalar(Math.max(0.35, dist * 0.35)));
        renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
      };
      tick();

      const observer = new ResizeObserver(() => {
        renderer.setSize(width(), height());
        camera.aspect = width() / height();
        camera.updateProjectionMatrix();
        const rest = fitDistance(fitRadius, camera.aspect);
        const atRest = Math.abs(camera.position.distanceTo(controls.target) - restRef.current) < 1e-3;
        restRef.current = rest;
        if (controls.target.lengthSq() < 1e-8) {
          controls.maxDistance = rest;
          if (minZoomDistance === null) controls.minDistance = rest;
          if (atRest && !flightRef.current) camera.position.setLength(rest);
        }
      });
      observer.observe(mount);

      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      let downAt = { x: 0, y: 0 };
      const onDown = (e: PointerEvent) => { downAt = { x: e.clientX, y: e.clientY }; };
      const onUp = (e: PointerEvent) => {
        if (Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 6) return; // it was a drag
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(markerGroup.children, false)[0];
        if (hit && hit.object.userData.id) clickRef.current?.(hit.object.userData.id);
      };
      renderer.domElement.addEventListener('pointerdown', onDown);
      renderer.domElement.addEventListener('pointerup', onUp);

      partsRef.current = {
        scene, camera, renderer, controls, globe, markers: markerGroup, frozen,
        addFrameHook: (fn) => { hooks.add(fn); return () => { hooks.delete(fn); }; },
      };

      return () => {
        cancelAnimationFrame(raf);
        hooks.clear();
        if (flightRef.current) cancelAnimationFrame(flightRef.current);
        flightRef.current = null;
        observer.disconnect();
        renderer.domElement.removeEventListener('pointerdown', onDown);
        renderer.domElement.removeEventListener('pointerup', onUp);
        controls.dispose();
        scene.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else if (mat) mat.dispose();
        });
        dayTex.dispose();
        nightTex.dispose();
        renderer.forceContextLoss();
        renderer.dispose();
        mount.removeChild(renderer.domElement);
        partsRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      const controls = partsRef.current?.controls;
      if (controls && !flightRef.current) controls.autoRotate = autoRotate;
    }, [autoRotate]);

    // Markers
    useEffect(() => {
      const group = partsRef.current?.markers;
      if (!group) return;
      group.children.forEach((c) => {
        const mesh = c as THREE.Mesh;
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });
      group.clear();
      markers.forEach((m) => {
        const active = m.id === activeMarker;
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(active ? 0.022 : 0.016, 16, 16),
          new THREE.MeshBasicMaterial({ color: active ? '#14b8a6' : m.color ?? '#f59e0b' }),
        );
        mesh.position.copy(latLngToVector(m.lat, m.lng, 1.012));
        mesh.userData.id = m.id;
        group.add(mesh);
      });
    }, [markers, activeMarker]);

    // Arcs
    useEffect(() => {
      const group = arcGroupRef.current;
      if (!group) return;
      group.children.forEach((c) => {
        const mesh = c as THREE.Mesh;
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });
      group.clear();
      arcs.forEach((arc) => {
        if (arc.progress <= 0) return;
        const points = arcPoints(arc.from, arc.to);
        const count = Math.max(2, Math.round(points.length * Math.min(arc.progress, 1)));
        const curve = new THREE.CatmullRomCurve3(points.slice(0, count));
        group.add(
          new THREE.Mesh(
            new THREE.TubeGeometry(curve, count * 2, 0.0045, 6, false),
            new THREE.MeshBasicMaterial({ color: '#fbbf24', transparent: true, opacity: 0.9 }),
          ),
        );
      });
    }, [arcs]);

    // Camera move: direction is slerped around the look-at point, distance is
    // interpolated logarithmically (reads as a smooth zoom), target is lerped.
    const move = ({ position, target = new THREE.Vector3(), duration = 2200, onProgress }: CameraMove) =>
      new Promise<void>((resolve) => {
        const parts = partsRef.current;
        if (!parts) return resolve();
        if (flightRef.current) cancelAnimationFrame(flightRef.current);
        const { camera, controls } = parts;
        const fromTarget = controls.target.clone();
        const fromOffset = camera.position.clone().sub(fromTarget);
        const toOffset = position.clone().sub(target);
        const fromDir = fromOffset.clone().normalize();
        const toDir = toOffset.clone().normalize();
        const fromLog = Math.log(fromOffset.length());
        const toLog = Math.log(toOffset.length());
        const angle = fromDir.angleTo(toDir);
        const startTime = performance.now();
        controls.enabled = false;
        controls.autoRotate = false;
        parts.frozen.value = true;
        const step = () => {
          if (!partsRef.current) return resolve();
          const t = Math.min((performance.now() - startTime) / duration, 1);
          const e = ease(t);
          let dir = toDir.clone();
          if (angle > 1e-4) {
            const s = Math.sin(angle);
            dir = fromDir.clone().multiplyScalar(Math.sin((1 - e) * angle) / s).add(toDir.clone().multiplyScalar(Math.sin(e * angle) / s));
          }
          controls.target.lerpVectors(fromTarget, target, e);
          camera.position.copy(controls.target).add(dir.normalize().multiplyScalar(Math.exp(fromLog + (toLog - fromLog) * e)));
          camera.lookAt(controls.target);
          onProgress?.(e);
          if (t < 1) {
            flightRef.current = requestAnimationFrame(step);
          } else {
            flightRef.current = null;
            parts.frozen.value = false;
            controls.enabled = true;
            controls.autoRotate = autoRotateRef.current;
            resolve();
          }
        };
        step();
      });

    useImperativeHandle(ref, () => ({
      // Rotate-only by default: the globe keeps its framed size.
      flyTo: (lat, lng, opts) => {
        const globe = partsRef.current?.globe;
        const local = latLngToVector(lat, lng, opts?.distance ?? restRef.current);
        if (globe) local.applyQuaternion(globe.quaternion);
        return move({ position: local, duration: opts?.duration ?? 2200 });
      },
      move,
      restDistance: () => restRef.current,
      cameraLatLng: () => {
        const parts = partsRef.current;
        if (!parts) return { lat: 0, lng: 0, distance: 0 };
        const local = parts.camera.position.clone().applyQuaternion(parts.globe.quaternion.clone().invert());
        return { ...vectorToLatLng(local), distance: parts.camera.position.length() };
      },
      project: (lat, lng, altitude = 1.02) => {
        const parts = partsRef.current;
        if (!parts) return null;
        const p = latLngToVector(lat, lng, altitude).applyQuaternion(parts.globe.quaternion);
        const facing = p.clone().normalize().dot(parts.camera.position.clone().normalize()) > 0.05;
        const v = p.project(parts.camera);
        const el = parts.renderer.domElement;
        return { x: ((v.x + 1) / 2) * el.clientWidth, y: ((1 - v.y) / 2) * el.clientHeight, visible: facing };
      },
      three: () => partsRef.current,
    }));

    return <div ref={mountRef} className={className} style={{ touchAction: 'none' }} />;
  },
);

EarthGlobe.displayName = 'EarthGlobe';

export default EarthGlobe;
