---
name: content-management
description: Add or update content like expeditions, blog posts, press links, or partners. Use when managing site content in constants.ts or blogData.ts.
---

# Content Management

Manage content for the Kim Hess Climbs website.

## Data Files

| File | Purpose |
|------|---------|
| `constants.ts` | Expeditions, press, videos, partners |
| `blogData.ts` | Full blog post content |
| `types.ts` | TypeScript interfaces |

## Adding a New Expedition

### 1. Prepare Images

```
public/images/expeditions/{mountain-name}/
├── {Mountain}_01-1340x891.jpg
├── {Mountain}_02-1340x891.jpg
└── ...
```

### 2. Update constants.ts

```typescript
{
  id: 'mountain-id',
  name: 'Mountain Name',
  year: 2024,
  description: 'Brief description of the climb...',
  image: '/images/expeditions/mountain-name/Mountain_01-1340x891.jpg',
  images: [
    '/images/expeditions/mountain-name/Mountain_01-1340x891.jpg',
    '/images/expeditions/mountain-name/Mountain_02-1340x891.jpg',
    // ...
  ],
  completed: true,
  profileSvg: `<svg>...</svg>` // Mountain profile silhouette
}
```

## Adding a New Blog Post

### 1. Prepare Image

Place in `public/images/blog/` with format: `{description}-small-{width}x{height}.jpg`

### 2. Update blogData.ts

```typescript
{
  id: 'unique-slug',
  title: 'Blog Post Title',
  date: '2024-01-15',
  excerpt: 'Brief excerpt shown in carousel...',
  content: `
Full blog post content here.
Can span multiple paragraphs.

Supports markdown-like formatting.
  `,
  image: '/images/blog/image-name-small-1500x1000.jpg',
  tags: ['adventure', 'climbing']
}
```

## Adding Press Coverage

```typescript
// In constants.ts PRESS_LINKS array
{
  title: 'Article Title',
  source: 'Publication Name',
  url: 'https://...',
  date: '2024-01-15'
}
```

## Adding a Partner/Sponsor

### 1. Add Logo

Place in `public/images/partners/` - use PNG with transparent background

### 2. Update constants.ts

```typescript
// In PARTNERS array
{
  name: 'Partner Name',
  logo: '/images/partners/partner-logo.png',
  url: 'https://partner-website.com'
}
```

## Content Guidelines

### Writing Style
- First person for blog posts
- Active, engaging voice
- Focus on personal experience and emotion
- Include specific details (altitude, dates, challenges)

### Image Guidelines
- Expedition images: 1340x891 px (landscape)
- Blog images: Various sizes, prefer 1500px width
- Partner logos: PNG with transparency
- Optimize all images before adding

### SEO Considerations
- Use descriptive titles
- Include relevant keywords naturally
- Write compelling excerpts
- Use proper date formatting (YYYY-MM-DD)

## Completed Expeditions

1. Aconcagua (2011) - South America - 22,841 ft
2. Mt. Elbrus (2012) - Europe - 18,510 ft
3. Mt. Kilimanjaro (2012) - Africa - 19,340 ft
4. Denali (2013) - North America - 20,320 ft
5. Mt. Everest (2016) - Asia - 29,035 ft
6. Mt. Vinson (2017) - Antarctica - 16,066 ft
7. Mt. Kosciuszko (2018) - Australia - 7,310 ft

## Future Goals

- North Pole
- South Pole
