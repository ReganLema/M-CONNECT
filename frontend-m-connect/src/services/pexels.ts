// src/services/pexels.ts
const PEXELS_API_KEY = 'LwtdNfpDNieGzdbEp5eOxe6XmGNV0KhzEahNTujTv85XHveEPJGsQzmd'; 
const PEXELS_BASE_URL = 'https://api.pexels.com/v1';

// Cache with expiration
const imageCache: Record<string, { url: string; timestamp: number }> = {};
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export const fetchPexelsImage = async (
  query: string,
  orientation: 'landscape' | 'portrait' | 'square' = 'landscape',
  size: 'small' | 'medium' | 'large' = 'medium'
): Promise<string | null> => {
  try {
    // Check cache first (with expiration)
    const cacheKey = `pexels-${query}-${orientation}-${size}`;
    const cached = imageCache[cacheKey];
    
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
      return cached.url;
    }

    // Clean expired cache entries
    Object.keys(imageCache).forEach(key => {
      if (Date.now() - imageCache[key].timestamp > CACHE_EXPIRY) {
        delete imageCache[key];
      }
    });

    console.log(`🔍 Pexels API call: ${query}`);
    const response = await fetch(
      `${PEXELS_BASE_URL}/search?query=${encodeURIComponent(query)}&orientation=${orientation}&per_page=1`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        console.warn('❌ Pexels API key may be invalid or expired');
        return null;
      }
      if (response.status === 429) {
        console.warn('⚠️ Pexels API rate limit exceeded');
        return null;
      }
      throw new Error(`Pexels API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.photos && data.photos.length > 0) {
      let imageUrl = '';
      
      switch (size) {
        case 'small':
          imageUrl = data.photos[0].src.small;
          break;
        case 'medium':
          imageUrl = data.photos[0].src.medium;
          break;
        case 'large':
          imageUrl = data.photos[0].src.large;
          break;
        default:
          imageUrl = data.photos[0].src.medium;
      }
      
      // Cache the result
      imageCache[cacheKey] = {
        url: imageUrl,
        timestamp: Date.now()
      };
      
      console.log(`✅ Pexels found image for: ${query}`);
      return imageUrl;
    }
    
    console.log(`⚠️ Pexels no images found for: ${query}`);
    return null;
    
  } catch (error) {
    console.warn('❌ Pexels API failed:', error);
    return null;
  }
};

// Keep your existing functions
export const CATEGORY_IMAGES = {
  vegetables: 'fresh vegetables market Tanzania',
  fruits: 'tropical fruits market Africa',
  cereals: 'grains cereals agriculture Tanzania',
  livestock: 'cattle farming Tanzania',
  poultry: 'chicken farming poultry Africa',
  seeds: 'agricultural seeds planting'
};

export const fetchAllCategoryImages = async (): Promise<Record<string, string>> => {
  const images: Record<string, string> = {};
  
  console.log('🔄 Fetching all category images from Pexels...');
  
  for (const [key, query] of Object.entries(CATEGORY_IMAGES)) {
    const imageUrl = await fetchPexelsImage(query);
    if (imageUrl) {
      images[key] = imageUrl;
    }
    // Delay between requests
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log(`✅ Category images fetched: ${Object.keys(images).length}/6 successful`);
  return images;
};