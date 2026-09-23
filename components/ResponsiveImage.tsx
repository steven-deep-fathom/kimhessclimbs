import React from 'react';
import manifest from '../utils/imageManifest.json';
import { assetPath } from '../utils/assetPath';

// path -> [width, height, ...WebP variant widths]; written by scripts/optimize-images.mjs.
const IMAGES = manifest as Record<string, number[]>;

const variantPath = (src: string, w: number) => assetPath(src.replace(/\.(jpe?g|png)$/i, `-${w}.webp`));

/** WebP srcset for a manifest path, or undefined for paths the manifest doesn't know. */
export function webpSrcSet(src: string): string | undefined {
  const entry = IMAGES[src];
  if (!entry) return undefined;
  return entry.slice(2).map((w) => `${variantPath(src, w)} ${w}w`).join(', ');
}

/** The smallest WebP variant, for thumbnails; falls back to the original. */
export function smallestVariant(src: string): string {
  const entry = IMAGES[src];
  return entry ? variantPath(src, entry[2]) : assetPath(src);
}

interface ResponsiveImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  /** The `sizes` attribute: how wide the image renders at each breakpoint. */
  sizes: string;
  eager?: boolean;
  highPriority?: boolean;
}

/**
 * <picture> with a WebP srcset from utils/imageManifest.json and the original
 * file as the fallback. Lazy by default. Paths not in the manifest (external
 * URLs) render as a plain <img>.
 */
export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({ src, sizes, eager = false, highPriority = false, ...img }) => {
  const entry = IMAGES[src];
  const common = {
    ...img,
    src: assetPath(src),
    loading: eager ? ('eager' as const) : ('lazy' as const),
    decoding: 'async' as const,
    ...(highPriority ? { fetchPriority: 'high' as const } : {}),
  };
  if (!entry) return <img {...common} />;
  return (
    <picture>
      <source type="image/webp" srcSet={webpSrcSet(src)} sizes={sizes} />
      <img {...common} width={entry[0]} height={entry[1]} />
    </picture>
  );
};
ResponsiveImage.displayName = 'ResponsiveImage';
