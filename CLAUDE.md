# Kim Hess Climbs - Website Documentation

Personal website for Kim Hess, mountaineer pursuing the Explorers Grand Slam (Seven Summits + North/South Poles).

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS (via CDN + custom config in index.html)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Fonts**: Montserrat (headings), Open Sans (body) via Google Fonts

## Quick Start

```bash
npm install
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```

## Project Structure

```
kim-hess-site/
├── components/          # React components
│   ├── Navbar.tsx       # Fixed navigation with smooth scroll
│   ├── Hero.tsx         # Full-screen hero with cloud overlay
│   ├── Story.tsx        # Kim's bio section
│   ├── GrandSlam.tsx    # Interactive Seven Summits tracker
│   ├── Speaking.tsx     # Speaking engagement info
│   ├── JointSpeaking.tsx # Joint speaking with Kim's husband
│   ├── Blog.tsx         # Horizontal scrolling blog carousel
│   ├── Expeditions.tsx  # Photo gallery with lightbox
│   ├── Partners.tsx     # Sponsor logos
│   ├── Press.tsx        # Press coverage links
│   ├── Contact.tsx      # Contact form section
│   ├── Footer.tsx       # Site footer
│   └── CloudOverlay.tsx # Animated cloud effect for hero
├── public/images/
│   ├── expeditions/     # 83 expedition photos (Seven Summits)
│   ├── blog/            # 36 blog post images
│   ├── partners/        # 7 sponsor/partner logos
│   ├── portraits/       # Kim's portrait photos
│   └── backgrounds/     # Background images
├── App.tsx              # Main app component
├── index.tsx            # React entry point
├── index.html           # HTML template with Tailwind config
├── constants.ts         # Expeditions, press, videos, partners data
├── blogData.ts          # Full blog post content (18 posts)
├── types.ts             # TypeScript interfaces
└── vite.config.ts       # Vite configuration
```

## Data Files

### constants.ts
Contains structured data for:
- `EXPEDITIONS` - Seven Summits + future poles (images, descriptions, SVG profiles)
- `PRESS_LINKS` - Press coverage from Denver Post, 9 News, Coloradan, etc.
- `VIDEOS` - YouTube video embeds
- `PARTNERS` - Sponsor logos (Korbel, UCHealth, Big Agnes, Honey Stinger, Hestra)

### blogData.ts
Contains 18 full blog posts with:
- Complete article content
- Publication dates (2014-2018)
- Featured images
- Tags for categorization

## Key Features

### Expedition Gallery (Expeditions.tsx)
- Grid of completed expeditions (7 summits)
- Click to open lightbox modal
- Multi-image galleries with:
  - Arrow navigation
  - Keyboard support (arrows, escape)
  - Thumbnail strip
  - Image counter

### Blog Carousel (Blog.tsx)
- Horizontal scrolling carousel
- 18 blog posts, most recent first
- Click to open full article modal
- Smooth scroll with arrow buttons
- Snap-to-card behavior

### Grand Slam Tracker (GrandSlam.tsx)
- Interactive map showing all Seven Summits
- SVG mountain profiles for each peak
- Progress indicator (7/9 completed)
- Future goals: North Pole, South Pole

## Styling

### Brand Colors (defined in index.html Tailwind config)
```javascript
brand: {
  teal: '#14b8a6',    // Primary accent color
  dark: '#0f172a',    // Background (Slate 900)
  slate: '#1e293b',   // Card backgrounds (Slate 800)
  light: '#f8fafc',   // Text (Slate 50)
}
```

### Typography
- Headings: `font-heading` (Montserrat) - bold, uppercase, wide tracking
- Body: `font-sans` (Open Sans)

## Image Naming Conventions

### Expeditions
- Standard format: `{Mountain}_{XX}-{width}x{height}.jpg`
- Examples: `Aconcagua_06-1340x891.jpg`, `Denali_01-1340x891.jpg`
- Some use camera codes: `IMGP0536-small-1340x891.jpg`, `DSC02781-small-1340x891.jpg`

### Blog
- Format varies by source: `{description}-small-{width}x{height}.jpg`
- Example: `IMG_5848-small-1500x1000.jpg`

## Completed Expeditions (in order)

1. **Aconcagua** (2011) - South America, 22,841 ft - 9 photos
2. **Mt. Elbrus** (2012) - Europe, 18,510 ft - 9 photos
3. **Mt. Kilimanjaro** (2012) - Africa, 19,340 ft - 9 photos
4. **Denali** (2013) - North America, 20,320 ft - 9 photos
5. **Mt. Everest** (2016) - Asia, 29,035 ft - 18 photos
6. **Mt. Vinson** (2017) - Antarctica, 16,066 ft - 10 photos
7. **Mt. Kosciuszko** (2018) - Australia, 7,310 ft - 9 photos

## Future Goals (marked as incomplete)

- North Pole
- South Pole

## Archive Location

Old WordPress site files archived at:
```
../archive/
├── wordpress-export-2020/   # Original static export (857MB)
├── assets/                  # Old theme fonts
├── assets-external/         # Old CDN resources
└── home.html               # Old homepage
```

## Development Notes

- All images served from `/public/images/` (Vite serves static assets)
- No backend required - fully static site
- Blog content stored in `blogData.ts` (no CMS)
- Responsive design with Tailwind breakpoints (sm, md, lg)
- Animations use Framer Motion's `whileInView` for scroll-triggered effects

## Deployment

Build produces static files in `dist/` folder:
```bash
npm run build
```

Can be deployed to any static hosting:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
