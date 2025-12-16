---
description: Add a new blog post
argument-hint: [blog-title]
allowed-tools: Read, Edit, Glob
---

# Add New Blog Post: $ARGUMENTS

Help add a new blog post to the Kim Hess Climbs website.

## Steps:

1. **Read current posts** from `blogData.ts`
2. **Check for images** in `public/images/blog/`
3. **Create blog post object** following the existing format
4. **Add to blogPosts array** (newest posts first)

## Blog Post Template:

```typescript
{
  id: '{unique-slug}',
  title: '{Blog Post Title}',
  date: '{YYYY-MM-DD}',
  excerpt: '{Brief excerpt for carousel card - 1-2 sentences}',
  content: `
{Full blog post content here}

Can span multiple paragraphs.

Include personal stories and climbing experiences.
  `,
  image: '/images/blog/{image-name}-small-{width}x{height}.jpg',
  tags: ['{tag1}', '{tag2}']
}
```

## Writing Guidelines:

- First person narrative
- Personal, engaging voice
- Include specific details (altitude, weather, challenges)
- Keep excerpts compelling but brief
- Use descriptive, SEO-friendly titles

## Common Tags:
- adventure, climbing, mountaineering
- seven-summits, everest, denali
- training, preparation, gear
- inspiration, reflection, lessons
