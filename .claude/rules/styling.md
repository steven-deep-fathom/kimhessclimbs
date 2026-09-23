---
paths: "**/*.tsx"
---

# Styling Rules

## Tailwind CSS
- Tailwind 3.4 is built through PostCSS: theme in `tailwind.config.js`, global styles in `index.css`. There is no CDN script
- Write class names as complete literal strings; the build purges any class it can't find in the source
- Use utility classes, avoid custom CSS
- Use brand color classes for consistency

## Brand Colors
- `brand-teal` (#14b8a6) - Primary accent
- `brand-dark` (#0f172a) - Background
- `brand-slate` (#1e293b) - Card backgrounds
- `brand-light` (#f8fafc) - Text

## Typography
- Headings: `font-heading` (Montserrat)
- Body: `font-sans` (Open Sans)
- Headings style: `font-bold uppercase tracking-wider`

## Common Patterns

### Section Container
```tsx
<section className="py-20 px-4 bg-brand-dark">
  <div className="max-w-6xl mx-auto">
    {/* content */}
  </div>
</section>
```

### Card Style
```tsx
<div className="bg-brand-slate rounded-lg overflow-hidden">
  {/* content */}
</div>
```

### Responsive
- Mobile first: base styles
- Tablet: `md:` prefix
- Desktop: `lg:` prefix
- The nav's full link bar starts at `xl:` (1280 px); below that it uses the menu button
