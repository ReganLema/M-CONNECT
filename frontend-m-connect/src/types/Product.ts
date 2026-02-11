export type Product = {
  seller_id: number | undefined;
  farmer(farmer: any): void;
  // Basic product info
  id: number;
  name: string;
  price: number;
  formatted_price?: string;
  image: string | null;
  image_url?: string | null;
  category: string;
  quantity: string;
  location: string;
  description?: string;
  created_at?: string;

  // ✅ FIXED: user_id should be a NUMBER, not a function!
  user_id?: number;

  // Seller/Farmer information (from API)
  seller_name?: string;
  seller_email?: string;
  seller_phone?: string;
  seller_location?: string;
  seller_verified?: boolean;
  seller_avatar?: string;

  // Alternative naming (for backwards compatibility)
  farmer_id?: number;
  farmer_name?: string;
  farmer_location?: string;
  farmer_image?: string | null;
};