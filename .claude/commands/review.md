---
description: Review recent code changes for quality and conventions
allowed-tools: Read, Grep, Glob, Bash
---

# Code Review

Review recent changes for the Kim Hess Climbs project.

## Check recent changes:
```bash
git diff HEAD~1 --stat
git diff HEAD~1
```

## Review Criteria:

### TypeScript Quality
- No `any` types
- Proper interface definitions
- Correct return types

### React Best Practices
- Functional components
- Proper hook dependencies
- No unnecessary re-renders
- Keys on list items

### Project Conventions
- Tailwind CSS utility classes
- Brand colors (brand-teal, brand-dark, etc.)
- Framer Motion animations
- Named exports with displayName

### Performance
- Image optimization
- Lazy loading for heavy components
- Efficient animations

### Accessibility
- Alt text on images
- Keyboard navigation
- ARIA labels

## Output a review summary with:
1. Overall assessment
2. Issues found (with file:line references)
3. Suggestions for improvement
4. Approval status
