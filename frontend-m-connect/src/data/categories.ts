// src/data/categories.ts

// Local fallback images (in case Pexels API fails or for development)
const LOCAL_IMAGES = {
  vegetables: 'https://images.unsplash.com/photo-1540420828642-fca2c5c18abb?w=800&h=600&fit=crop',
  fruits: 'https://images.unsplash.com/photo-1574226516831-e1dff420e862?w=800&h=600&fit=crop',
  cereals: 'https://images.unsplash.com/photo-1606788075767-36c5d43de239?w=800&h=600&fit=crop',
  livestock: 'https://images.unsplash.com/photo-1574101989763-1ed5e1517b6d?w=800&h=600&fit=crop',
  poultry: 'https://images.unsplash.com/photo-1581888220999-a3d9f3c00b07?w=800&h=600&fit=crop',
  seeds: 'https://images.unsplash.com/photo-1617196033208-1a1b0f345678?w=800&h=600&fit=crop'
};

// Define categories without images initially
export const getCategories = async () => {
  let images = LOCAL_IMAGES;
  
  try {
    // Try to fetch from Pexels if online
    const { fetchAllCategoryImages } = await import('../services/pexels');
    const pexelsImages = await fetchAllCategoryImages();
    
    // Merge with fallback - use Pexels if available, otherwise fallback
    images = { ...LOCAL_IMAGES, ...pexelsImages };
  } catch (error) {
    console.log('Using local category images:', error);
  }
  
  return [
    {
      id: 1,
      name: "Vegetables",
      description: "Fresh vegetables from East Africa",
      image: images.vegetables,
      pexelsQuery: "fresh vegetables market Tanzania"
    },
    {
      id: 2,
      name: "Fruits",
      description: "Sweet and fresh seasonal fruits",
      image: images.fruits,
      pexelsQuery: "tropical fruits market Africa"
    },
    {
      id: 3,
      name: "Cereals",
      description: "Common cereals in the Tanzanian market",
      image: images.cereals,
      pexelsQuery: "grains cereals agriculture Tanzania"
    },
    {
      id: 4,
      name: "Livestock",
      description: "Cattle, goats, sheep & more",
      image: images.livestock,
      pexelsQuery: "cattle farming Tanzania"
    },
    {
      id: 5,
      name: "Poultry",
      description: "Locally raised poultry",
      image: images.poultry,
      pexelsQuery: "chicken farming poultry Africa"
    },
    {
      id: 6,
      name: "Seeds",
      description: "Agricultural seeds for planting",
      image: images.seeds,
      pexelsQuery: "agricultural seeds planting"
    }
  ];
};

// For backward compatibility, export a default static version
export const staticCategories = [
  {
    id: 1,
    name: "Vegetables",
    description: "Fresh vegetables from East Africa",
    image: LOCAL_IMAGES.vegetables,
    pexelsQuery: "fresh vegetables market Tanzania"
  },
  {
    id: 2,
    name: "Fruits",
    description: "Sweet and fresh seasonal fruits",
    image: LOCAL_IMAGES.fruits,
    pexelsQuery: "tropical fruits market Africa"
  },
  {
    id: 3,
    name: "Cereals",
    description: "Common cereals in the Tanzanian market",
    image: LOCAL_IMAGES.cereals,
    pexelsQuery: "grains cereals agriculture Tanzania"
  },
  {
    id: 4,
    name: "Livestock",
    description: "Cattle, goats, sheep & more",
    image: LOCAL_IMAGES.livestock,
    pexelsQuery: "cattle farming Tanzania"
  },
  {
    id: 5,
    name: "Poultry",
    description: "Locally raised poultry",
    image: LOCAL_IMAGES.poultry,
    pexelsQuery: "chicken farming poultry Africa"
  },
  {
    id: 6,
    name: "Seeds",
    description: "Agricultural seeds for planting",
    image: LOCAL_IMAGES.seeds,
    pexelsQuery: "agricultural seeds planting"
  }
];