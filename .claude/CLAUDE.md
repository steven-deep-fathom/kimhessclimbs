# Kim Hess Climbs - Claude Code Configuration

> Project memory and coding standards for Claude Code

## Project Overview

Personal website for Kim Hess, mountaineer pursuing the **Explorers Grand Slam** (Seven Summits + North/South Poles). This is a static React portfolio site deployed to GitHub Pages at **kimhessclimbs.com**.

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19 | UI Framework |
| Vite | 6 | Build Tool (port 8849) |
| TypeScript | 5.8 | Type Safety |
| Three.js | 0.182 | 3D Globe & Terrain |
| Framer Motion | 12.x | Animations |
| Tailwind CSS | CDN | Styling |
| D3.js | 7.9 | Data Visualization |
| Lucide React | Icons | Icon Library |

## Quick Commands

```bash
npm run dev      # Start dev server (port 8849)
npm run build    # Production build to dist/
npm run preview  # Preview production build
```

## Project Structure

```
kim-hess-site/
├── components/           # React components (14 main + 3 UI)
│   └── ui/              # 3D components (RotatingGlobe, terrain, mountain-scene)
├── pages/               # Route pages (GlobePage, private sandbox)
├── public/images/       # Static assets (~28MB)
│   ├── expeditions/     # 83 photos across 7 summits
│   ├── blog/            # 36 blog images
│   ├── partners/        # Sponsor logos
│   ├── heightmaps/      # Terrain data for Three.js
├── utils/               # Utility functions
├── scripts/             # Build scripts (heightmap generator)
├── constants.ts         # EXPEDITIONS, PRESS_LINKS, VIDEOS, PARTNERS data
├── blogData.ts          # 18 full blog posts
├── types.ts             # TypeScript interfaces
└── App.tsx              # Hash-based router (#home, #globe, #private)
```

## Code Conventions

### Component Structure
- Functional components with TypeScript
- Named exports preferred
- Props interface defined above component
- displayName for debugging

```typescript
interface ExpeditionCardProps {
  expedition: Expedition
  onClick: () => void
}

export const ExpeditionCard: React.FC<ExpeditionCardProps> = ({ expedition, onClick }) => {
  // Component logic
}
ExpeditionCard.displayName = 'ExpeditionCard'
```

### Styling
- Use Tailwind CSS utility classes
- Brand colors: `brand-teal`, `brand-dark`, `brand-slate`, `brand-light`
- Font classes: `font-heading` (Montserrat), `font-sans` (Open Sans)
- Responsive: Use `sm:`, `md:`, `lg:` breakpoints

### Animations
- Use Framer Motion for scroll-triggered effects
- Standard pattern with `whileInView`:
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6 }}
>
```

### Three.js Components
- Place in `components/ui/`
- Use lazy loading for heavy 3D components
- Monitor performance with stats.js in development
- Optimize meshes and textures for web

## Data Management

### Adding New Expedition
1. Add images to `public/images/expeditions/{mountain}/`
2. Update `constants.ts` EXPEDITIONS array
3. Add SVG profile to expedition object

### Adding New Blog Post
1. Add image to `public/images/blog/`
2. Add post object to `blogData.ts`
3. Include: id, title, date, excerpt, content, image, tags

## Image Conventions

- Expedition format: `{Mountain}_{XX}-1340x891.jpg`
- Blog format: `{description}-small-{width}x{height}.jpg`
- Use WebP where possible for better compression
- Keep images optimized (use squoosh.app or similar)

## Routing

Hash-based routing (no React Router):
- `#home` or default - Main site
- `#globe` - Interactive 3D globe
- `#private` - Sandbox pages index
- `#private/{page}` - Individual sandbox pages

## Deployment

GitHub Pages via GitHub Actions:
- Push to `main` triggers deploy
- Custom domain: kimhessclimbs.com
- CNAME file in `public/`

## Important Files

| File | Purpose |
|------|---------|
| `constants.ts` | All structured data (expeditions, press, partners) |
| `blogData.ts` | Full blog post content |
| `types.ts` | TypeScript interfaces |
| `vite.config.ts` | Build configuration |
| `.github/workflows/deploy.yml` | CI/CD pipeline |

## Testing Checklist

Before deploying:
- [ ] `npm run build` succeeds without errors
- [ ] All images load correctly
- [ ] Lightbox galleries work
- [ ] Blog carousel scrolls properly
- [ ] 3D globe renders
- [ ] Contact form submits
- [ ] Mobile responsive

## Archive Reference

Old WordPress export at `../archive/wordpress-export-2020/` for historical reference.
