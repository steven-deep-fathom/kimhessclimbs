import * as THREE from 'three';

// Terrain mesh for the mountain close-up mockup. It is built in a local frame
// (x east, y up, z south, 2 units across) and placed on EarthGlobe's globe at the
// peak, inside the same WebGL context. Edges fade out so the patch blends into the
// globe surface. Heights are sampled on the CPU so markers and the route line sit
// on the ground. Lighting is fixed in the local frame, so it works on touch devices.
//
// Heightmaps are 256x256 grayscale PNGs (brightness = elevation, normalised to the
// data range). Referenced by URL string only; see public/heightmaps/.

export interface TerrainWaypoint {
  label: string;
  u: number; // 0..1 across the heightmap (west → east)
  v: number; // 0..1 down the heightmap (north → south)
}

export interface Terrain {
  group: THREE.Group;
  mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
  summit: { u: number; v: number };
  waypoints: { label: string; position: THREE.Vector3 }[];
  heightAt: (u: number, v: number) => number;
  setOpacity: (value: number) => void;
  setRouteVisible: (visible: boolean) => void;
  dispose: () => void;
}

const SIZE = 2; // world units across
const HEIGHT_SCALE = 0.45;

function loadHeights(url: string): Promise<{ data: Float32Array; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return reject(new Error('2D canvas unavailable'));
      ctx.drawImage(img, 0, 0);
      const pixels = ctx.getImageData(0, 0, img.width, img.height).data;
      const data = new Float32Array(img.width * img.height);
      for (let i = 0; i < data.length; i++) data[i] = pixels[i * 4] / 255;
      resolve({ data, width: img.width, height: img.height });
    };
    img.onerror = () => reject(new Error(`Could not load ${url}`));
    img.src = url;
  });
}

export interface TerrainOptions {
  lights?: boolean; // add the built-in fixed lights (default true)
  showRoute?: boolean; // draw the illustrative route and camps (default true)
}

export async function createTerrain(
  heightmapUrl: string,
  route: (summit: { u: number; v: number }) => TerrainWaypoint[],
  options: TerrainOptions = {},
): Promise<Terrain> {
  const { lights = true, showRoute = true } = options;
  const { data, width, height } = await loadHeights(heightmapUrl);

  const heightAt = (u: number, v: number) => {
    const x = Math.min(width - 1, Math.max(0, u * (width - 1)));
    const y = Math.min(height - 1, Math.max(0, v * (height - 1)));
    const x0 = Math.floor(x), y0 = Math.floor(y);
    const x1 = Math.min(width - 1, x0 + 1), y1 = Math.min(height - 1, y0 + 1);
    const fx = x - x0, fy = y - y0;
    const h = (xx: number, yy: number) => data[yy * width + xx];
    return (h(x0, y0) * (1 - fx) + h(x1, y0) * fx) * (1 - fy) + (h(x0, y1) * (1 - fx) + h(x1, y1) * fx) * fy;
  };

  let summitIndex = 0;
  for (let i = 1; i < data.length; i++) if (data[i] > data[summitIndex]) summitIndex = i;
  const summit = { u: (summitIndex % width) / (width - 1), v: Math.floor(summitIndex / width) / (height - 1) };

  const toWorld = (u: number, v: number, lift = 0) =>
    new THREE.Vector3((u - 0.5) * SIZE, heightAt(u, v) * HEIGHT_SCALE + lift, (v - 0.5) * SIZE);

  // Mesh with CPU displacement and elevation-based vertex colours.
  const segments = Math.min(width, 256) - 1;
  const geometry = new THREE.PlaneGeometry(SIZE, SIZE, segments, segments);
  geometry.rotateX(-Math.PI / 2);
  const pos = geometry.attributes.position as THREE.BufferAttribute;
  const colors = new Float32Array(pos.count * 4);
  const rock = new THREE.Color('#5b5147');
  const scree = new THREE.Color('#8a7d6e');
  const snow = new THREE.Color('#eef3f8');
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const u = pos.getX(i) / SIZE + 0.5;
    const v = pos.getZ(i) / SIZE + 0.5;
    const h = heightAt(u, v);
    pos.setY(i, h * HEIGHT_SCALE);
    if (h < 0.45) c.copy(rock).lerp(scree, h / 0.45);
    else c.copy(scree).lerp(snow, Math.min(1, (h - 0.45) / 0.3));
    // Fade the outer 14% so the square patch dissolves into the globe texture.
    const edge = Math.min(u, 1 - u, v, 1 - v);
    const alpha = Math.min(1, Math.max(0, edge / 0.14));
    colors.set([c.r, c.g, c.b, alpha * alpha * (3 - 2 * alpha)], i * 4);
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 4));
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0, transparent: true, opacity: 0 });
  const mesh = new THREE.Mesh(geometry, material);

  const group = new THREE.Group();
  group.add(mesh);

  if (lights) {
    const sunLight = new THREE.DirectionalLight('#fff4e0', 2.4);
    sunLight.position.set(-2, 2.5, 1.5);
    const lightTarget = new THREE.Object3D();
    sunLight.target = lightTarget;
    group.add(sunLight, lightTarget);
    group.add(new THREE.HemisphereLight('#bcd4ff', '#3a2f25', 0.9));
  }

  // Illustrative route: hand-placed waypoints, drawn just above the ground.
  const points = route(summit);
  const linePoints: THREE.Vector3[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i], b = points[i + 1];
    for (let t = 0; t < 1; t += 0.02) linePoints.push(toWorld(a.u + (b.u - a.u) * t, a.v + (b.v - a.v) * t, 0.012));
  }
  linePoints.push(toWorld(points[points.length - 1].u, points[points.length - 1].v, 0.012));
  const routeMaterial = new THREE.MeshBasicMaterial({ color: '#fbbf24', transparent: true, opacity: 0 });
  const routeMesh = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(linePoints), linePoints.length * 2, 0.006, 6, false), routeMaterial);
  routeMesh.visible = showRoute;
  group.add(routeMesh);

  const campMaterial = new THREE.MeshBasicMaterial({ color: '#14b8a6', transparent: true, opacity: 0 });
  const campGeometry = new THREE.SphereGeometry(0.018, 12, 12);
  const campDots: THREE.Mesh[] = [];
  const waypoints = points.map((p) => {
    const position = toWorld(p.u, p.v, 0.02);
    const dot = new THREE.Mesh(campGeometry, campMaterial);
    dot.visible = showRoute;
    dot.position.copy(position);
    group.add(dot);
    campDots.push(dot);
    return { label: p.label, position };
  });

  return {
    group,
    mesh,
    summit,
    waypoints,
    heightAt,
    setOpacity: (value) => {
      material.opacity = value;
      routeMaterial.opacity = value * 0.95;
      campMaterial.opacity = value;
      group.visible = value > 0.001;
    },
    setRouteVisible: (visible) => {
      routeMesh.visible = visible;
      campDots.forEach((d) => { d.visible = visible; });
    },
    dispose: () => {
      geometry.dispose();
      material.dispose();
      routeMesh.geometry.dispose();
      routeMaterial.dispose();
      campGeometry.dispose();
      campMaterial.dispose();
    },
  };
}
