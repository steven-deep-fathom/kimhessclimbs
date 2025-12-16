---
description: Verify all images exist and are properly linked
allowed-tools: Bash, Read, Grep, Glob
---

# Check Image References

Verify all image references in the Kim Hess Climbs site are valid.

## Steps:

1. **List all images in public/images:**
```bash
find public/images -type f \( -name "*.jpg" -o -name "*.png" -o -name "*.webp" \) | wc -l
```

2. **Check expeditions images exist for each expedition in constants.ts**

3. **Check blog images exist for each post in blogData.ts**

4. **Check partner logos exist**

5. **Look for broken references:**
```bash
grep -r "images/" --include="*.ts" --include="*.tsx" | grep -v node_modules
```

## Report:
- Total images found
- Missing images (referenced but not found)
- Orphan images (exist but not referenced)
- Image size summary
