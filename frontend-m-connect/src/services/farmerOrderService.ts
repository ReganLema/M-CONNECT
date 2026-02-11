// src/services/farmerOrderService.ts
import api from "@/api/api";

export type FarmerOrderItem = {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
  total: number;
};

export type FarmerOrder = {
  id: number;
  buyer_name: string;
  buyer_phone?: string;
  buyer_location?: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  payment_status: 'unpaid' | 'paid' | 'partially_paid';
  items_count: number;
  items: FarmerOrderItem[];
  created_at: string;
  updated_at: string;
  is_new?: boolean;
};

/* ---------------- GET FARMER ORDERS ---------------- */
export async function getFarmerOrders(status?: string): Promise<FarmerOrder[]> {
  try {
    // If you want to filter by status, add it as query parameter
    const url = status ? `/farmer/orders?status=${status}` : '/farmer/orders';
    const res = await api.get(url);
    
    console.log("✅ Farmer orders response:", res.data);
    
    // Handle response structure
    const orders = res.data.orders || res.data.data || [];
    
    // ✅ Validate orders array
    if (!Array.isArray(orders)) {
      console.error("❌ Invalid response: orders is not an array", orders);
      return [];
    }
    
    return orders.map((order: any) => {
      // ✅ Validate required fields
      if (!order.id || order.total_amount === undefined) {
        console.warn("⚠️ Invalid order data:", order);
        return null;
      }
      
      return {
        id: order.id,
        buyer_name: order.buyer?.name || 'Unknown Customer',
        buyer_phone: order.buyer?.phone || '',
        buyer_location: order.buyer?.location || '',
        
        // ✅ This is now ONLY the farmer's portion
        total_amount: Number(order.total_amount || 0),
        
        // ✅ Use consistent field name (backend sends order_status)
        status: (order.order_status || order.status || 'pending').toLowerCase() as 'pending' | 'processing' | 'completed' | 'cancelled',
        payment_status: (order.payment_status || 'unpaid').toLowerCase() as 'unpaid' | 'paid' | 'partially_paid',
        
        items_count: order.items_count || order.items?.length || 0,
        items: (order.items || []).map((item: any) => ({
          id: item.id,
          product_name: item.product_name || 'Unknown Product',
          quantity: Number(item.quantity || 0),
          price: Number(item.price || 0),
          total: Number(item.total || 0),
        })),
        
        created_at: order.created_at || new Date().toISOString(),
        updated_at: order.updated_at || new Date().toISOString(),
        
        // Mark as new if created within last 24 hours
        is_new: order.created_at ? 
          (Date.now() - new Date(order.created_at).getTime()) < 24 * 60 * 60 * 1000 : 
          false,
      };
    }).filter(Boolean) as FarmerOrder[]; // Remove null entries
    
  } catch (error: any) {
    console.error("❌ Failed to fetch farmer orders", error.response?.data || error.message);
    
    // ✅ Better error handling
    if (error.response?.status === 403) {
      throw new Error("You don't have permission to view orders. Please ensure you're logged in as a farmer.");
    }
    
    if (error.response?.status === 401) {
      throw new Error("Session expired. Please login again.");
    }
    
    return [];
  }
}

/* ---------------- UPDATE ORDER STATUS ---------------- */
export async function updateOrderStatus(
  orderId: number, 
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await api.put(`/farmer/orders/${orderId}/status`, { status });
    return {
      success: true,
      message: res.data.message || 'Order status updated successfully'
    };
  } catch (error: any) {
    console.error("❌ Failed to update order status", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to update order status');
  }
}

/* ---------------- GET ORDER DETAILS ---------------- */
export async function getFarmerOrderDetails(orderId: number): Promise<FarmerOrder | null> {
  try {
    const res = await api.get(`/farmer/orders/${orderId}`);
    const order = res.data.order || res.data.data;
    
    if (!order) return null;
    
    return {
      id: order.id,
      buyer_name: order.buyer?.name || 'Unknown Customer',
      buyer_phone: order.buyer?.phone || '',
      buyer_location: order.buyer?.location || '',
      total_amount: Number(order.total_amount || 0),
      status: (order.order_status || order.status || 'pending').toLowerCase() as 'pending' | 'processing' | 'completed' | 'cancelled',
      payment_status: (order.payment_status || 'unpaid').toLowerCase() as 'unpaid' | 'paid' | 'partially_paid',
      items_count: order.items_count || order.items?.length || 0,
      items: (order.items || []).map((item: any) => ({
        id: item.id,
        product_name: item.product_name || 'Unknown Product',
        quantity: Number(item.quantity || 0),
        price: Number(item.price || 0),
        total: Number(item.total || 0),
      })),
      created_at: order.created_at || new Date().toISOString(),
      updated_at: order.updated_at || new Date().toISOString(),
      is_new: order.created_at ? 
        (Date.now() - new Date(order.created_at).getTime()) < 24 * 60 * 60 * 1000 : 
        false,
    };
  } catch (error: any) {
    console.error("❌ Failed to fetch order details", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch order details');
  }
}

/* ---------------- GET STATISTICS (New Function) ---------------- */
export async function getFarmerStats(): Promise<{
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalEarnings: number;
}> {
  try {
    const allOrders = await getFarmerOrders(); // Get all orders
    
    return {
      totalOrders: allOrders.length,
      pendingOrders: allOrders.filter(o => o.status === 'pending').length,
      completedOrders: allOrders.filter(o => o.status === 'completed').length,
      totalEarnings: allOrders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + o.total_amount, 0),
    };
  } catch (error) {
    console.error("❌ Failed to fetch farmer stats", error);
    return {
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      totalEarnings: 0,
    };
  }
}