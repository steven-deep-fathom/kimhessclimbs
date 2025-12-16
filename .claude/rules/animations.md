---
paths: "components/**/*.tsx"
---

# Animation Rules

## Framer Motion

Use Framer Motion for all animations. Standard scroll-trigger pattern:

```tsx
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6 }}
>
  {/* content */}
</motion.div>
```

## Animation Guidelines

### Performance
- Animate `transform` and `opacity` only (GPU accelerated)
- Use `once: true` in viewport to prevent re-animation
- Keep durations between 0.3s - 0.8s

### Stagger Children
```tsx
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
}
```

### Hover Effects
```tsx
<motion.div
  whileHover={{ scale: 1.05 }}
  transition={{ type: 'spring', stiffness: 300 }}
>
```

## Avoid
- Complex keyframe animations
- Animating layout properties (width, height, top, left)
- Long animation durations (> 1s)
- Animation on mobile scroll (battery drain)
