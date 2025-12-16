---
paths: "components/ui/**/*.tsx,pages/**/*.tsx"
---

# Three.js Rules

## Performance First
- Always lazy load Three.js components
- Monitor FPS in development
- Target 60 FPS desktop, 30 FPS mobile

## Lazy Loading Pattern
```tsx
import { lazy, Suspense } from 'react'

const RotatingGlobe = lazy(() => import('./ui/RotatingGlobe'))

<Suspense fallback={<LoadingSpinner />}>
  <RotatingGlobe />
</Suspense>
```

## Optimization Checklist
- Use BufferGeometry
- Reuse materials
- Implement frustum culling
- Use instancing for repeated objects
- Dispose of geometries and materials on unmount

## Cleanup Pattern
```tsx
useEffect(() => {
  // setup scene

  return () => {
    geometry.dispose()
    material.dispose()
    renderer.dispose()
  }
}, [])
```

## Heightmaps
- Location: `public/heightmaps/`
- Format: Grayscale PNG
- Use lower resolution for distant terrain
- Cache generated geometry

## File Organization
- Place 3D components in `components/ui/`
- Use descriptive names: `mountain-scene.tsx`, `RotatingGlobe.tsx`
