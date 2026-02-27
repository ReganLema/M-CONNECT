// orderService.ts

import api from "@/api/api";

export type OrderItem = {
  id: number;
  product_name: string;
  price: number;
  quantity: number;
};

export type Order = {
  id: number;
  total_amount: number;
  status: string; 
  payment_status: string;
  items_count: number;
  items: OrderItem[];
  created_at: string;
};

/* ---------------- PLACE ORDER ---------------- */
export async function placeOrder(): Promise<{ message: string; order: Order }> {
  try {
    const res = await api.post("/orders/place");
    return res.data;
  } catch (error: any) {
    console.error("❌ Failed to place order", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to place order");
  }
}

/* ---------------- GET MY ORDERS ---------------- */
export async function getOrders(): Promise<Order[]> {
  try {
    const res = await api.get("/orders");
    
    //  Map backend response to frontend Order type
    const orders = (res.data.orders ?? []).map((order: any) => ({
      id: order.id,
      total_amount: order.total_amount,
      status: order.status, 
      payment_status: order.payment_status,
      items_count: order.items_count,
      items: order.items,
      created_at: order.created_at,
    }));
    
    return orders;
  } catch (error: any) {
    console.error("❌ Failed to fetch orders", error.response?.data || error.message);
    return [];
  }
}

/* ---------------- CANCEL ORDER ---------------- */
export async function cancelOrder(orderId: number): Promise<{ message: string }> {
  try {
    const res = await api.post(`/orders/${orderId}/cancel`);
    return res.data;
  } catch (error: any) {
    console.error("❌ Failed to cancel order", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to cancel order");
  }
}