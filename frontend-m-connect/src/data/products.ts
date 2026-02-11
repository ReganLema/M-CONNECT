// src/data/products.ts
import { Product } from '../services/products';

export const products: Product[] = [
  {
    id: 1,
    name: "Fresh Tomatoes",
    price: "Tsh 2,000 / Kg",
    location: "Morogoro",
    image: "https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg",
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
    image: "https://images.pexels.com/photos/1431330/pexels-photo-1431330.jpeg",
    category: "Vegetables",
    rating: 4.2,
    farmerName: "Asha Mohamed",
    stock: 80
  },
  // ... Add the rest of your products with enhanced data
];

// Export function to get products with dynamic images
export const getProducts = async (): Promise<Product[]> => {
  try {
    const { getEnhancedProducts } = await import('../services/products');
    return await getEnhancedProducts();
  } catch (error) {
    console.log('Using static products:', error);
    return products;
  }
};