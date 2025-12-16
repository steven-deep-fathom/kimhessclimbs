---
name: threejs-optimization
description: Optimize Three.js 3D components for web performance. Use when working on RotatingGlobe, mountain scenes, or adding new 3D features.
allowed-tools: Read, Grep, Glob, Edit
---

# Three.js Performance Optimization

Optimize Three.js components in the Kim Hess Climbs project.

## Current 3D Components

- `components/ui/RotatingGlobe.tsx` - Interactive world globe
- `components/ui/heightmap-terrain.tsx` - Terrain mesh generator
- `components/ui/mountain-scene.tsx` - Mountain landscape renderer

## Optimization Checklist

### 1. Geometry Optimization
- [ ] Use BufferGeometry instead of Geometry
- [ ] Reduce polygon count where possible
- [ ] Use LOD (Level of Detail) for distant objects
- [ ] Merge static geometries

### 2. Material Optimization
- [ ] Reuse materials across meshes
- [ ] Use simpler materials when possible (MeshBasicMaterial vs MeshStandardMaterial)
- [ ] Compress textures (use ASTC or KTX2 format)

### 3. Rendering Optimization
- [ ] Implement frustum culling
- [ ] Use on-demand rendering when scene is static
- [ ] Limit draw calls (< 1000, ideally < 500)
- [ ] Use instancing for repeated objects

### 4. Loading Optimization
- [ ] Lazy load 3D components with React.lazy
- [ ] Use Draco compression for GLTF models
- [ ] Preload critical assets
- [ ] Show loading states

## Performance Monitoring

```typescript
// Development only - add stats
import Stats from 'stats.js'

useEffect(() => {
  if (import.meta.env.DEV) {
    const stats = new Stats()
    stats.showPanel(0) // FPS
    document.body.appendChild(stats.dom)

    const animate = () => {
      stats.begin()
      // render frame
      stats.end()
      requestAnimationFrame(animate)
    }
    animate()
  }
}, [])
```

## Heightmap Best Practices

For terrain heightmaps in `public/heightmaps/`:

1. Use grayscale PNG format
2. Reduce resolution for distant terrain
3. Apply gaussian blur for smoother terrain
4. Cache generated geometry

## React Integration Pattern

```typescript
import { lazy, Suspense } from 'react'

const RotatingGlobe = lazy(() => import('./ui/RotatingGlobe'))

function GlobePage() {
  return (
    <Suspense fallback={<GlobeLoadingState />}>
      <RotatingGlobe />
    </Suspense>
  )
}
```

## Target Performance

- 60 FPS on desktop
- 30+ FPS on mobile
- Initial load < 3 seconds
- Interactive within 2 seconds
