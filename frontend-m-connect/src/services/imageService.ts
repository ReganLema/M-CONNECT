// src/services/imageService.ts
// Import all image services
import { fetchPexelsImage as pexelsFetch } from './pexels';

// Unsplash API configuration
const UNSPLASH_ACCESS_KEY = 'wxagt-DiOX457IbdAjs_f4ySjcJVaDAk84gRte3WeBA';
const UNSPLASH_BASE_URL = 'https://api.unsplash.com';

// Local fallback images
import { localCategoryImages, productFallbackImages } from '@/data/localImages';

// Cache for all image sources
const imageCache: Record<string, string> = {};
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Unsplash API service
const fetchUnsplashImage = async (
  query: string,
  orientation: 'landscape' | 'portrait' | 'square' = 'landscape',
  size: 'small' | 'medium' | 'large' = 'medium'
): Promise<string | null> => {
  try {
    // Check cache first
    const cacheKey = `unsplash-${query}-${orientation}-${size}`;
    const cached = imageCache[cacheKey];
    
    if (cached) {
      return cached;
    }

    const orientationParam = orientation === 'square' ? 'squarish' : orientation;
    const response = await fetch(
      `${UNSPLASH_BASE_URL}/search/photos?query=${encodeURIComponent(query)}&orientation=${orientationParam}&per_page=1`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          'Accept-Version': 'v1'
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      let imageUrl = '';
      
      switch (size) {
        case 'small':
          imageUrl = data.results[0].urls.small;
          break;
        case 'medium':
          imageUrl = data.results[0].urls.regular;
          break;
        case 'large':
          imageUrl = data.results[0].urls.full;
          break;
        default:
          imageUrl = data.results[0].urls.regular;
      }
      
      // Cache the result
      imageCache[cacheKey] = imageUrl;
      return imageUrl;
    }
    
    return null;
  } catch (error) {
    console.warn('❌ Unsplash API failed:', error);
    return null;
  }
};

// Local fallback images
const getLocalFallback = (query: string): string | null => {
  // Map queries to local category images
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes('tomato')) return localCategoryImages.vegetables;
  if (queryLower.includes('onion')) return localCategoryImages.vegetables;
  if (queryLower.includes('mango')) return localCategoryImages.fruits;
  if (queryLower.includes('maize') || queryLower.includes('corn')) return localCategoryImages.cereals;
  if (queryLower.includes('avocado')) return localCategoryImages.fruits;
  if (queryLower.includes('banana')) return localCategoryImages.fruits;
  if (queryLower.includes('watermelon')) return localCategoryImages.fruits;
  if (queryLower.includes('rice')) return localCategoryImages.cereals;
  if (queryLower.includes('cassava')) return localCategoryImages.cereals;
  if (queryLower.includes('carrot')) return localCategoryImages.vegetables;
  if (queryLower.includes('pepper')) return localCategoryImages.vegetables;
  if (queryLower.includes('potato')) return localCategoryImages.vegetables;
  if (queryLower.includes('chicken')) return localCategoryImages.poultry;
  if (queryLower.includes('egg')) return localCategoryImages.poultry;
  if (queryLower.includes('seed')) return localCategoryImages.seeds;
  if (queryLower.includes('bean')) return localCategoryImages.cereals;
  if (queryLower.includes('lemon')) return localCategoryImages.fruits;
  if (queryLower.includes('cabbage')) return localCategoryImages.vegetables;
  if (queryLower.includes('goat')) return localCategoryImages.livestock;
  if (queryLower.includes('pineapple')) return localCategoryImages.fruits;
  if (queryLower.includes('spinach')) return localCategoryImages.vegetables;
  if (queryLower.includes('fish')) return localCategoryImages.livestock;
  if (queryLower.includes('orange')) return localCategoryImages.fruits;
  if (queryLower.includes('pea')) return localCategoryImages.vegetables;
  
  // Generic fallbacks
  if (queryLower.includes('vegetable')) return localCategoryImages.vegetables;
  if (queryLower.includes('fruit')) return localCategoryImages.fruits;
  if (queryLower.includes('cereal')) return localCategoryImages.cereals;
  if (queryLower.includes('livestock')) return localCategoryImages.livestock;
  if (queryLower.includes('poultry')) return localCategoryImages.poultry;
  
  // Return random fallback from productFallbackImages
  const randomIndex = Math.floor(Math.random() * productFallbackImages.length);
  return productFallbackImages[randomIndex];
};

// Main image fetching service with fallback
export const fetchImage = async (
  query: string,
  orientation: 'landscape' | 'portrait' | 'square' = 'landscape',
  size: 'small' | 'medium' | 'large' = 'medium'
): Promise<string> => {
  // Check cache first
  const cacheKey = `image-${query}-${orientation}-${size}`;
  const cached = imageCache[cacheKey];
  
  if (cached) {
    return cached;
  }

  let imageUrl: string | null = null;
  let source = 'local';
  
  try {
    // Try Pexels first (1st priority)
    console.log(`🔄 [1/3] Trying Pexels for: ${query}`);
    imageUrl = await pexelsFetch(query, orientation, size);
    
    if (imageUrl) {
      source = 'pexels';
      console.log(`✅ Pexels success for: ${query}`);
    } else {
      // Fallback to Unsplash (2nd priority)
      console.log(`🔄 [2/3] Pexels failed, trying Unsplash for: ${query}`);
      imageUrl = await fetchUnsplashImage(query, orientation, size);
      
      if (imageUrl) {
        source = 'unsplash';
        console.log(`✅ Unsplash success for: ${query}`);
      } else {
        // Fallback to local images (3rd priority)
        console.log(`🔄 [3/3] Unsplash failed, using local fallback for: ${query}`);
        imageUrl = getLocalFallback(query);
        source = 'local';
      }
    }
    
    // Ultimate fallback
    if (!imageUrl) {
      console.log(`⚠️ All sources failed, using ultimate fallback for: ${query}`);
      imageUrl = 'https://images.unsplash.com/photo-1505253668822-42074d58a7c6?w=400&q=80';
      source = 'ultimate';
    }
    
    // Cache the result
    imageCache[cacheKey] = imageUrl;
    
    console.log(`📸 Image for "${query}" from ${source}: ${imageUrl.substring(0, 50)}...`);
    
    return imageUrl;
    
  } catch (error) {
    console.error(`❌ All image sources failed for: ${query}`, error);
    return getLocalFallback(query) || 'https://images.unsplash.com/photo-1505253668822-42074d58a7c6?w=400&q=80';
  }
};

// Batch fetch images with progress
export const fetchMultipleImages = async (
  queries: Array<{ key: string; query: string; orientation?: 'landscape' | 'portrait' | 'square'; size?: 'small' | 'medium' | 'large' }>
): Promise<Record<string, string>> => {
  const results: Record<string, string> = {};
  
  console.log(`🔄 Batch fetching ${queries.length} images...`);
  
  for (let i = 0; i < queries.length; i++) {
    const item = queries[i];
    try {
      // Add delay between requests to avoid rate limiting
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      results[item.key] = await fetchImage(
        item.query,
        item.orientation || 'landscape',
        item.size || 'medium'
      );
      
      console.log(`✅ [${i + 1}/${queries.length}] Fetched: ${item.key}`);
    } catch (error) {
      console.error(`❌ Failed to fetch image for ${item.key}:`, error);
      results[item.key] = getLocalFallback(item.query) || 'https://images.unsplash.com/photo-1505253668822-42074d58a7c6?w=400&q=80';
    }
  }
  
  console.log(`✅ Batch fetch complete: ${Object.keys(results).length}/${queries.length} successful`);
  return results;
};

// Clear image cache
export const clearImageCache = (): void => {
  Object.keys(imageCache).forEach(key => {
    delete imageCache[key];
  });
  console.log('🧹 Image cache cleared');
};