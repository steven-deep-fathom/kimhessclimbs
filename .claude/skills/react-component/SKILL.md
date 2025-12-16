---
name: react-component
description: Create new React components following project conventions. Use when adding new UI components, sections, or features to the Kim Hess site.
---

# React Component Creator

Create new React components following the Kim Hess Climbs project conventions.

## Component Template

```typescript
import { motion } from 'framer-motion'

interface {ComponentName}Props {
  // Define props here
}

export const {ComponentName}: React.FC<{ComponentName}Props> = ({ /* props */ }) => {
  return (
    <section id="{section-id}" className="py-20 px-4 bg-brand-dark">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-heading font-bold text-brand-light text-center mb-12"
        >
          Section Title
        </motion.h2>

        {/* Component content */}
      </div>
    </section>
  )
}

{ComponentName}.displayName = '{ComponentName}'
```

## Checklist

1. [ ] Use TypeScript with proper interface
2. [ ] Use Framer Motion for scroll animations
3. [ ] Use Tailwind CSS with brand classes
4. [ ] Add displayName for debugging
5. [ ] Use named export
6. [ ] Follow existing component patterns

## Brand Classes

- Colors: `brand-teal`, `brand-dark`, `brand-slate`, `brand-light`
- Fonts: `font-heading` (Montserrat), `font-sans` (Open Sans)
- Container: `max-w-6xl mx-auto`
- Section padding: `py-20 px-4`

## Animation Pattern

```typescript
initial={{ opacity: 0, y: 20 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
transition={{ duration: 0.6 }}
```

## File Location

Place new components in:
- `components/` - Main site components
- `components/ui/` - 3D and advanced UI components
- `pages/` - Full page components
