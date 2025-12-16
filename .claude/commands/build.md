---
description: Build for production and report results
allowed-tools: Bash, Read
---

Build the Kim Hess Climbs site for production:

1. First, run the production build:
```bash
npm run build
```

2. Check for any TypeScript errors:
```bash
npx tsc --noEmit
```

3. Report the build results including:
   - Success/failure status
   - Output directory size
   - Any warnings or errors
   - Number of chunks generated

After successful build, the `dist/` folder is ready for deployment to GitHub Pages.
