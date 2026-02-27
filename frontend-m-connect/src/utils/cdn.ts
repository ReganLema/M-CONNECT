// src/utils/cdn.ts

/**
 * CDN Configuration for M-CONNECT
 * Handles Cloudflare R2 CDN URLs
 */
export const CDN_CONFIG = {
  enabled: true,
  // Your Cloudflare R2 public URL
  baseUrl: 'https://pub-830fc031162b476396c6a260d2baec03.r2.dev',
};

/**
 * Get CDN URL for an image path
 *
 */
export function getCdnUrl(path: string | null | undefined): string | null {
  if (!path) return null;

  // Your Laravel already returns full URLs - just return them
  return path;
}

/**
 * FOR DEBUGGING ONLY - Log what URLs you're getting
 */
export function debugImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  
  console.log('🔍 Image URL debug:', {
    original: path,
    isFullUrl: path.startsWith('http'),
    source: path.includes('r2.dev') ? 'R2 CDN' : 'Other'
  });
  
  return path;
}

/**
 * Get optimized CDN URL with cache busting
 */
export function getCdnUrlWithCache(path: string | null | undefined): string | null {
  const url = getCdnUrl(path);
  if (!url) return null;

  // Add timestamp for cache busting
  const timestamp = Date.now();
  return `${url}?t=${timestamp}`;
}