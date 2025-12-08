// Utility to handle asset paths for GitHub Pages deployment
// In production, prepends the base path; in development, returns path as-is

const BASE_PATH = import.meta.env.BASE_URL || '/';

export function assetPath(path: string): string {
  // If path is external URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Remove leading slash from path if present, since BASE_URL ends with /
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // Combine base path with asset path
  return `${BASE_PATH}${cleanPath}`;
}
