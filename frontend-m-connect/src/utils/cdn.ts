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
 * @param path - The image path (could be full URL or just path)
 * @returns Full CDN URL or null if no path
 */
export function getCdnUrl(path: string | null | undefined): string | null {
  if (!path) return null;

  // ✅ If it's already a full URL (http:// or https://), return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    console.log('✅ Already full URL:', path);
    return path;
  }

  // ✅ Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // ✅ Construct the full CDN URL
  const fullUrl = `${CDN_CONFIG.baseUrl}/${cleanPath}`;
  
  console.log('📸 Generated CDN URL:', {
    original: path,
    cleanPath: cleanPath,
    fullUrl: fullUrl
  });
  
  return fullUrl;
}

/**
 * FOR DEBUGGING ONLY - Log what URLs you're getting
 */
export function debugImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  
  const result = getCdnUrl(path);
  
  console.log('🔍 Image URL debug:', {
    original: path,
    isFullUrl: path.startsWith('http'),
    source: path.includes('r2.dev') ? 'R2 CDN' : 'Local path',
    final: result
  });
  
  return result;
}

/**
 * Get optimized CDN URL with cache busting
 */
export function getCdnUrlWithCache(path: string | null | undefined): string | null {
  const url = getCdnUrl(path);
  if (!url) return null;

  // Add timestamp for cache busting
  const timestamp = Date.now();
  return `${url}${url.includes('?') ? '&' : '?'}t=${timestamp}`;
}