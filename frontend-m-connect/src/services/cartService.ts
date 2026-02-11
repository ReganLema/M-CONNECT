

// cartService.ts

import api from "@/api/api";
import { Product } from "@/types/Product";

export type CartItem = Product & {
  cartQuantity: number;
};

/* ---------------- GET CART ---------------- */
export async function getCart(): Promise<CartItem[]> {
  try {
    const res = await api.get("/cart");

    // 🔥 map backend items → frontend CartItem
    return (res.data.items ?? []).map((item: any) => ({
      id: item.product.id,
      name: item.product.name,
      price: item.price,
      cartQuantity: item.quantity,
    }));
  } catch (error: any) {
    console.error("❌ Failed to fetch cart", error.response?.data || error.message);
    return [];
  }
}


/* ---------------- ADD TO CART ---------------- */
export async function addToCart(productId: number, quantity = 1) {
  try {
    await api.post("/cart/add", { product_id: productId, quantity });
  } catch (error: any) {
    console.error("❌ Failed to add to cart", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to add to cart");
  }
}

/* ---------------- UPDATE QUANTITY ---------------- */
export async function updateCartQuantity(productId: number, change: number) {
  try {
    await api.put("/cart/update", { product_id: productId, change });
  } catch (error: any) {
    console.error("❌ Failed to update cart quantity", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to update cart");
  }
}

/* ---------------- REMOVE ITEM ---------------- */
export async function removeFromCart(productId: number) {
  try {
    await api.delete(`/cart/remove/${productId}`);
  } catch (error: any) {
    console.error("❌ Failed to remove item", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to remove item");
  }
}

/* ---------------- CLEAR CART ---------------- */
export async function clearCart() {
  try {
    await api.post("/cart/clear");
  } catch (error: any) {
    console.error("❌ Failed to clear cart", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to clear cart");
  }
}
