// CartScreen.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import {
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  CartItem,
} from "@/services/cartService";
import { placeOrder } from "@/services/orderService";

const { width } = Dimensions.get("window");

export default function CartScreen({ navigation }: any) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    try {
      setLoading(true);
      const data = await getCart();

      // Ensure cart is always an array
      setCart(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("❌ Failed to load cart", e);
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  // Safe total calculation
  const total = cart?.reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * (item.cartQuantity || 0),
    0
  );

  const handlePlaceOrder = async () => {
    // ✅ Check BEFORE trying to place order
    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }

    if (loading) return; // Prevent double submission

    try {
      setLoading(true);
      await placeOrder();
      
      // ✅ Clear local cart state after successful order
      setCart([]);
      
      alert("Order placed successfully!");
      
      // ✅ Go back automatically instead of navigating to Orders
      navigation.goBack();
    } catch (e) {
      console.error("❌ Failed to place order", e);
      alert("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View className="bg-white rounded-3xl p-5 mb-4 shadow-xl">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-gray-900">{item.name}</Text>
        <Text className="text-green-600 font-bold">
          {Number(item.price || 0).toLocaleString()} TZS
        </Text>
      </View>

      <View className="flex-row justify-between items-center">
        {/* Quantity */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2">
          <TouchableOpacity
            disabled={loading}
            onPress={async () => {
              await updateCartQuantity(item.id, -1);
              refresh();
            }}
          >
            <Text className="text-xl font-bold px-3">−</Text>
          </TouchableOpacity>

          <Text className="mx-4 font-bold">{item.cartQuantity || 0}</Text>

          <TouchableOpacity
            disabled={loading}
            onPress={async () => {
              await updateCartQuantity(item.id, 1);
              refresh();
            }}
          >
            <Text className="text-xl font-bold px-3">+</Text>
          </TouchableOpacity>
        </View>

        {/* Remove */}
        <TouchableOpacity
          disabled={loading}
          onPress={async () => {
            await removeFromCart(item.id);
            refresh();
          }}
        >
          <Ionicons name="trash-outline" size={22} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  /* ---------------- EMPTY CART ---------------- */
  if (!loading && (!cart || cart.length === 0)) {
    return (
      <LinearGradient
        colors={["#F8FAFC", "#F1F5F9"]}
        className="flex-1 justify-center items-center"
      >
        <Text className="text-2xl font-bold mb-4">Your cart is empty</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="bg-green-500 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-bold">Browse Market</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  /* ---------------- MAIN CART ---------------- */
  return (
    <LinearGradient colors={["#F8FAFC", "#F1F5F9"]} className="flex-1">
      <StatusBar barStyle="dark-content" />

      <View className="px-6 pt-16 pb-4">
        <Text className="text-3xl font-bold">My Cart</Text>
        <Text className="text-gray-500">
          {cart?.length || 0} item{cart?.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#16A34A" />
        </View>
      ) : (
        <View className="flex-1 px-4">
          <FlatList
            data={cart}
            keyExtractor={(i) => i.id.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* Summary */}
      <View className="px-6 pb-8">
        <View className="bg-white rounded-3xl p-6">
          <View className="flex-row justify-between mb-4">
            <Text>Total</Text>
            <Text className="text-xl font-bold">
              {total?.toLocaleString() || 0} TZS
            </Text>
          </View>

          <TouchableOpacity onPress={handlePlaceOrder}>
            <LinearGradient
              colors={["#16A34A", "#22C55E"]}
              className="py-4 rounded-2xl"
            >
              <Text className="text-white text-center font-bold text-lg">
                Place Order
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}