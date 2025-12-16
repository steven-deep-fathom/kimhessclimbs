---
description: Add a new expedition to the site
argument-hint: [expedition-name]
allowed-tools: Read, Edit, Glob
---

# Add New Expedition: $ARGUMENTS

Help add a new expedition to the Kim Hess Climbs website.

## Steps:

1. **Check for existing images** in `public/images/expeditions/`
2. **Read current expeditions** from `constants.ts`
3. **Create expedition object** with:
   - id: lowercase-hyphenated
   - name: Display name
   - year: Completion year
   - description: Brief expedition description
   - image: Primary image path
   - images: Array of all expedition images
   - completed: true/false
   - profileSvg: Mountain silhouette SVG (can be placeholder)

4. **Add to EXPEDITIONS array** in constants.ts

## Image Naming Convention
`{Mountain}_{XX}-1340x891.jpg`

Example: `Everest_01-1340x891.jpg`

## Template for new expedition:
```typescript
{
  id: '{expedition-id}',
  name: '{Expedition Name}',
  year: {YYYY},
  description: '{Brief description of the climb and experience}',
  image: '/images/expeditions/{folder}/{Mountain}_01-1340x891.jpg',
  images: [
    '/images/expeditions/{folder}/{Mountain}_01-1340x891.jpg',
    // ... more images
  ],
  completed: true,
  profileSvg: `<svg viewBox="0 0 100 50"><!-- mountain profile --></svg>`
}
```
