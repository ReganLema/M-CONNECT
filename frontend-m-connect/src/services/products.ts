// src/services/products.ts
import { fetchImage } from './imageService';
import { getFallbackImageForCategory } from '@/data/localImages';

export interface Product {
  id: number;
  name: string;
  price: string;
  location: string;
  image: string;
  category: string;
  rating?: number;
  farmerName?: string;
  stock?: number;
}

// Product-specific queries for better image matching
export const PRODUCT_QUERIES: Record<string, string> = {
  tomato: 'fresh tomatoes vegetables Tanzania',
  tomatoes: 'fresh tomatoes vegetables Tanzania',
  onion: 'onions vegetables market Africa',
  onions: 'onions vegetables market Africa',
  mango: 'mangoes tropical fruits Tanzania',
  mangoes: 'mangoes tropical fruits Tanzania',
  maize: 'maize corn grains agriculture',
  avocado: 'avocados fruits Tanzania',
  avocados: 'avocados fruits Tanzania',
  banana: 'bananas bunch fruits market',
  bananas: 'bananas bunch fruits market',
  watermelon: 'watermelon fruits market',
  rice: 'rice grains agriculture Tanzania',
  cassava: 'cassava roots agriculture',
  carrot: 'fresh carrots vegetables',
  carrots: 'fresh carrots vegetables',
  pepper: 'green peppers vegetables',
  peppers: 'green peppers vegetables',
  potato: 'potatoes vegetables Tanzania',
  potatoes: 'potatoes vegetables Tanzania',
  chicken: 'live chickens poultry farming',
  egg: 'fresh eggs poultry farming',
  eggs: 'fresh eggs poultry farming',
  seed: 'sunflower seeds agriculture',
  seeds: 'sunflower seeds agriculture',
  bean: 'beans pulses Tanzania',
  beans: 'beans pulses Tanzania',
  lemon: 'lemons citrus fruits Tanzania',
  lemons: 'lemons citrus fruits Tanzania',
  cabbage: 'cabbage vegetables market',
  goat: 'goat livestock Tanzania',
  pineapple: 'pineapple tropical fruit',
  pineapples: 'pineapple tropical fruit',
  spinach: 'spinach leafy greens vegetables',
  fish: 'tilapia fish fresh Tanzania',
  orange: 'oranges citrus fruits',
  oranges: 'oranges citrus fruits',
  pea: 'green peas vegetables',
  peas: 'green peas vegetables'
};

// Static product data with local image URLs (Unsplash as fallback)
const staticProducts: Product[] = [
  {
    id: 1,
    name: "Fresh Tomatoes",
    price: "Tsh 2,000 / Kg",
    location: "Morogoro",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80",
    category: "Vegetables",
    rating: 4.5,
    farmerName: "Juma Hassan",
    stock: 50
  },
  {
    id: 2,
    name: "Onions",
    price: "Tsh 1,600 / Kg",
    location: "Arusha",
    image: "https://images.unsplash.com/photo-1581089781785-603411fa81f5?w=400&q=80",
    category: "Vegetables",
    rating: 4.2,
    farmerName: "Asha Mohamed",
    stock: 80
  },
  {
    id: 3,
    name: "Mangoes (Ndoto)",
    price: "Tsh 500 / Piece",
    location: "Tanga",
    image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=80",
    category: "Fruits",
    rating: 4.7,
    farmerName: "Rajabu Simba",
    stock: 120
  },
  {
    id: 4,
    name: "Yellow Maize",
    price: "Tsh 900 / Kg",
    location: "Dodoma",
    image: "https://images.unsplash.com/photo-1590189182194-89d6cdf81bc4?w=400&q=80",
    category: "Cereals",
    rating: 4.3,
    farmerName: "John Mwita",
    stock: 200
  },
  {
    id: 5,
    name: "Avocados (Hass)",
    price: "Tsh 1,200 / Piece",
    location: "Njombe",
    image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&q=80",
    category: "Fruits",
    rating: 4.6,
    farmerName: "Grace Paul",
    stock: 75
  },
  {
    id: 6,
    name: "Bananas (Ndizi)",
    price: "Tsh 1,800 / Bunch",
    location: "Kilimanjaro",
    image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400&q=80",
    category: "Fruits",
    rating: 4.4,
    farmerName: "Moses Kato",
    stock: 40
  },
  {
    id: 7,
    name: "Watermelon",
    price: "Tsh 3,000 / Piece",
    location: "Pwani",
    image: "https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?w=400&q=80",
    category: "Fruits",
    rating: 4.8,
    farmerName: "Fatuma Ali",
    stock: 30
  },
  {
    id: 8,
    name: "Rice (Mbeya Super)",
    price: "Tsh 2,200 / Kg",
    location: "Mbeya",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80",
    category: "Cereals",
    rating: 4.9,
    farmerName: "David Mwenda",
    stock: 150
  },
  {
    id: 9,
    name: "Cassava (Mihogo)",
    price: "Tsh 700 / Kg",
    location: "Mtwara",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80",
    category: "Cereals",
    rating: 4.1,
    farmerName: "Salma Juma",
    stock: 90
  },
  {
    id: 10,
    name: "Carrots",
    price: "Tsh 1,400 / Kg",
    location: "Iringa",
    image: "https://images.unsplash.com/photo-1598170845058-78132e1b46d0?w=400&q=80",
    category: "Vegetables",
    rating: 4.5,
    farmerName: "Robert Chacha",
    stock: 60
  },
  {
    id: 11,
    name: "Green Pepper",
    price: "Tsh 1,500 / Kg",
    location: "Dar es Salaam",
    image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&q=80",
    category: "Vegetables",
    rating: 4.3,
    farmerName: "Sarah William",
    stock: 45
  },
  {
    id: 12,
    name: "Potatoes (Viazi)",
    price: "Tsh 900 / Kg",
    location: "Njombe",
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80",
    category: "Vegetables",
    rating: 4.4,
    farmerName: "Elias Peter",
    stock: 110
  },
  {
    id: 13,
    name: "Local Chicken",
    price: "Tsh 12,000 / Kg",
    location: "Dar es Salaam",
    image: "https://images.unsplash.com/photo-1560763228-1c5ee0c55d7c?w=400&q=80",
    category: "Livestock",
    rating: 4.7,
    farmerName: "Mohamed Salim",
    stock: 25
  },
  {
    id: 14,
    name: "Fresh Eggs (Kuku)",
    price: "Tsh 450 / Piece",
    location: "Morogoro",
    image: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=400&q=80",
    category: "Poultry",
    rating: 4.6,
    farmerName: "Anna Charles",
    stock: 200
  },
  {
    id: 15,
    name: "Sunflower Seeds",
    price: "Tsh 3,500 / Kg",
    location: "Singida",
    image: "https://images.unsplash.com/photo-1592921870789-04563d55041c?w=400&q=80",
    category: "Seeds",
    rating: 4.8,
    farmerName: "Joseph Kimaro",
    stock: 85
  },
  {
    id: 16,
    name: "Beans (Maharage)",
    price: "Tsh 2,500 / Kg",
    location: "Rukwa",
    image: "https://images.unsplash.com/photo-1596040033221-a3824e8f4c20?w=400&q=80",
    category: "Cereals",
    rating: 4.5,
    farmerName: "Mariam Kondo",
    stock: 120
  },
  {
    id: 17,
    name: "Lemons (Ndimu)",
    price: "Tsh 300 / Piece",
    location: "Tabora",
    image: "https://images.unsplash.com/photo-1589820296156-2454bb8a6ad1?w=400&q=80",
    category: "Fruits",
    rating: 4.4,
    farmerName: "Hassan Omar",
    stock: 180
  },
  {
    id: 18,
    name: "Cabbage",
    price: "Tsh 1,800 / Head",
    location: "Iringa",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80",
    category: "Vegetables",
    rating: 4.2,
    farmerName: "Ester Michael",
    stock: 65
  },
  {
    id: 19,
    name: "Goat Meat",
    price: "Tsh 15,000 / Kg",
    location: "Manyara",
    image: "https://images.unsplash.com/photo-1500479694472-551d1fb6258d?w=400&q=80",
    category: "Livestock",
    rating: 4.9,
    farmerName: "Yusuf Mwinyi",
    stock: 15
  },
  {
    id: 20,
    name: "Pineapples (Nanasi)",
    price: "Tsh 2,500 / Piece",
    location: "Mbeya",
    image: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400&q=80",
    category: "Fruits",
    rating: 4.7,
    farmerName: "Daniel Ngalawa",
    stock: 50
  },
  {
    id: 21,
    name: "Spinach (Mchicha)",
    price: "Tsh 800 / Bunch",
    location: "Morogoro",
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80",
    category: "Vegetables",
    rating: 4.3,
    farmerName: "Rehema Juma",
    stock: 100
  },
  {
    id: 22,
    name: "Fish (Tilapia)",
    price: "Tsh 8,000 / Kg",
    location: "Mwanza",
    image: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=400&q=80",
    category: "Livestock",
    rating: 4.8,
    farmerName: "Jackson Mwamba",
    stock: 35
  },
  {
    id: 23,
    name: "Oranges (Machungwa)",
    price: "Tsh 400 / Piece",
    location: "Tanga",
    image: "https://images.unsplash.com/photo-1547514701-42782101795e?w=400&q=80",
    category: "Fruits",
    rating: 4.6,
    farmerName: "Catherine Lucas",
    stock: 200
  },
  {
    id: 24,
    name: "Green Peas",
    price: "Tsh 1,200 / Kg",
    location: "Arusha",
    image: "https://images.unsplash.com/photo-1569507629401-438a6e6d2d04?w=400&q=80",
    category: "Vegetables",
    rating: 4.4,
    farmerName: "James Mollel",
    stock: 70
  }
];

// Fetch product images with fallback system
export const fetchProductImage = async (productName: string, category: string): Promise<string> => {
  try {
    // Find matching query from PRODUCT_QUERIES
    const productKey = Object.keys(PRODUCT_QUERIES).find(key => 
      productName.toLowerCase().includes(key.toLowerCase())
    );

    let query = productKey ? PRODUCT_QUERIES[productKey] : `${productName} ${category} agriculture Tanzania`;
    
    // Use the unified image service with fallback (Pexels → Unsplash → Local)
    const imageUrl = await fetchImage(query, 'square', 'medium');
    
    return imageUrl;
  } catch (error) {
    console.warn(`Failed to fetch image for ${productName}:`, error);
    // Use category-based fallback
    return getFallbackImageForCategory(category);
  }
};

// Enhance static products with dynamic images using fallback system
export const getEnhancedProducts = async (useDynamicImages: boolean = true): Promise<Product[]> => {
  // If dynamic images are disabled, return static products immediately
  if (!useDynamicImages) {
    console.log('📦 Using static product images');
    return staticProducts;
  }

  console.log('🔄 Enhancing products with dynamic images...');
  
  try {
    const enhancedProducts = await Promise.all(
      staticProducts.map(async (product, index) => {
        try {
          // Stagger requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, index * 100));
          
          const dynamicImage = await fetchProductImage(product.name, product.category);
          
          console.log(`✅ Enhanced image for: ${product.name}`);
          return { ...product, image: dynamicImage };
        } catch (error) {
          console.log(`⚠️ Image fetch failed for ${product.name}, using static image`);
          return product; // Keep original static image
        }
      })
    );

    console.log(`✅ Successfully enhanced ${enhancedProducts.length} products`);
    return enhancedProducts;
  } catch (error) {
    console.error('❌ Error enhancing products, using static data:', error);
    return staticProducts;
  }
};

// Get static products (no API calls)
export const getStaticProducts = (): Product[] => {
  return staticProducts;
};

// Helper functions for product filtering
export const filterProductsByCategory = (products: Product[], category: string): Product[] => {
  if (category.toLowerCase() === 'all') return products;
  
  return products.filter(product => 
    product.category.toLowerCase() === category.toLowerCase()
  );
};

export const filterProductsByLocation = (products: Product[], location: string): Product[] => {
  if (!location.trim()) return products;
  
  return products.filter(product => 
    product.location.toLowerCase().includes(location.toLowerCase())
  );
};

export const searchProducts = (products: Product[], query: string): Product[] => {
  if (!query.trim()) return products;
  
  const lowerQuery = query.toLowerCase();
  return products.filter(product =>
    product.name.toLowerCase().includes(lowerQuery) ||
    product.category.toLowerCase().includes(lowerQuery) ||
    product.location.toLowerCase().includes(lowerQuery) ||
    product.farmerName?.toLowerCase().includes(lowerQuery)
  );
};

// Get featured products (high rating + good stock)
export const getFeaturedProducts = (products: Product[], count: number = 6): Product[] => {
  return products
    .filter(product => product.rating && product.rating >= 4.0)
    .filter(product => product.stock && product.stock > 20)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, count);
};

// Get products with low stock (for farmers to manage)
export const getLowStockProducts = (products: Product[], threshold: number = 20): Product[] => {
  return products
    .filter(product => product.stock && product.stock <= threshold)
    .sort((a, b) => (a.stock || 0) - (b.stock || 0));
};

// Get products by category for home screen
export const getProductsByCategory = (category: string, limit?: number): Product[] => {
  const filtered = filterProductsByCategory(staticProducts, category);
  return limit ? filtered.slice(0, limit) : filtered;
};

// Get all unique categories
export const getAllCategories = (): string[] => {
  const categories = new Set(staticProducts.map(product => product.category));
  return Array.from(categories);
};

// Get product by ID
export const getProductById = (id: number): Product | undefined => {
  return staticProducts.find(product => product.id === id);
};

// Get random products for home screen
export const getRandomProducts = (count: number = 6): Product[] => {
  const shuffled = [...staticProducts].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};