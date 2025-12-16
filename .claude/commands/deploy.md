---
description: Deploy site to GitHub Pages
allowed-tools: Bash, Read
---

# Deploy to GitHub Pages

Deploy the Kim Hess Climbs site to production at kimhessclimbs.com.

## Deployment Steps:

1. **Verify build succeeds:**
```bash
npm run build
```

2. **Check git status:**
```bash
git status
```

3. **If changes exist, commit them:**
```bash
git add .
git commit -m "Update: [describe changes]"
```

4. **Push to main branch:**
```bash
git push origin main
```

5. **Monitor GitHub Actions:**
The `.github/workflows/deploy.yml` workflow will automatically:
- Build the site
- Deploy to GitHub Pages

Check progress at: https://github.com/[repo]/actions

## Post-Deploy Verification:

After deployment (usually 1-2 minutes):
1. Visit https://kimhessclimbs.com
2. Hard refresh (Cmd+Shift+R) to clear cache
3. Test key functionality:
   - Navigation
   - Gallery lightbox
   - Blog carousel
   - Contact section

## Rollback (if needed):

```bash
git revert HEAD
git push origin main
```
