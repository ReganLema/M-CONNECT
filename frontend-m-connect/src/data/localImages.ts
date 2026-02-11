// src/data/localImages.ts
export const localBannerImages = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1505253668822-42074d58a7c6?w=800&q=80",
    title: "Farm Fresh",
    description: "Direct from local farms"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1517817748493-49ec54a32465?w=800&q=80",
    title: "Organic Vegetables",
    description: "100% natural, no pesticides"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
    title: "Seasonal Fruits",
    description: "Freshly harvested daily"
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1500479694472-551d1fb6258d?w=800&q=80",
    title: "Healthy Livestock",
    description: "Premium quality meat"
  }
];

export const localCategoryImages = {
  vegetables: "https://images.unsplash.com/photo-1517817748493-49ec54a32465?w=400&q=80",
  fruits: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80",
  cereals: "https://images.unsplash.com/photo-1505253668822-42074d58a7c6?w=400&q=80",
  livestock: "https://images.unsplash.com/photo-1500479694472-551d1fb6258d?w=400&q=80",
  poultry: "https://images.unsplash.com/photo-1560763228-1c5ee0c55d7c?w=400&q=80",
  seeds: "https://images.unsplash.com/photo-1592921870789-04563d55041c?w=400&q=80",
  dairy: "https://images.unsplash.com/photo-1550583721-e6d6e7e21c4c?w=400&q=80",
  herbs: "https://images.unsplash.com/photo-1513530176992-0cf39c4cbed4?w=400&q=80",
};

// Generic fallback images for products
export const productFallbackImages = [
  "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80", // Tomatoes
  "https://images.unsplash.com/photo-1581089781785-603411fa81f5?w=400&q=80", // Onions
  "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=80", // Mangoes
  "https://images.unsplash.com/photo-1590189182194-89d6cdf81bc4?w=400&q=80", // Maize
  "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&q=80", // Avocados
  "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400&q=80", // Bananas
  "https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?w=400&q=80", // Watermelon
];

export const getRandomFallbackImage = (): string => {
  const randomIndex = Math.floor(Math.random() * productFallbackImages.length);
  return productFallbackImages[randomIndex];
};

export const getFallbackImageForCategory = (category: string): string => {
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes('vegetable')) {
    return localCategoryImages.vegetables;
  } else if (categoryLower.includes('fruit')) {
    return localCategoryImages.fruits;
  } else if (categoryLower.includes('cereal') || categoryLower.includes('grain')) {
    return localCategoryImages.cereals;
  } else if (categoryLower.includes('livestock') || categoryLower.includes('meat')) {
    return localCategoryImages.livestock;
  } else if (categoryLower.includes('poultry') || categoryLower.includes('chicken')) {
    return localCategoryImages.poultry;
  } else if (categoryLower.includes('seed')) {
    return localCategoryImages.seeds;
  } else {
    return getRandomFallbackImage();
  }
};