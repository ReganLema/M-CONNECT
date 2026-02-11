// OrdersScreen.tsx

import React, { useCallback, useState } from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { getOrders, Order } from "@/services/orderService";

const { width } = Dimensions.get("window");

// Define sort options
type SortOption = "newest" | "oldest" | "amount_high" | "amount_low";
type FilterPeriod = "all" | "today" | "week" | "month" | "3months" | "custom";

export default function OrdersScreen({ navigation }: any) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("all");
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders();

      console.log("📦 Fetched orders:", data);

      // ✅ Data is already properly mapped in orderService
      const ordersArray = Array.isArray(data) ? data : [];
      setOrders(ordersArray);
      applyFiltersAndSort(ordersArray, sortBy, filterPeriod);
    } catch (e) {
      console.error("❌ Failed to load orders", e);
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = (
    ordersList: Order[],
    sortOption: SortOption,
    period: FilterPeriod
  ) => {
    // First filter by date period
    let filtered = [...ordersList];
    
    const now = new Date();
    
    // Get today's date at start of day (midnight)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    // Get tomorrow's date at start of day (midnight)
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfToday.getDate() + 1);
    
    if (period === "today") {
      filtered = filtered.filter(order => {
        if (!order.created_at) return false;
        const orderDate = new Date(order.created_at);
        return orderDate >= startOfToday && orderDate < startOfTomorrow;
      });
    } else if (period === "week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      filtered = filtered.filter(order => 
        order.created_at && new Date(order.created_at) >= oneWeekAgo
      );
    } else if (period === "month") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);
      filtered = filtered.filter(order => 
        order.created_at && new Date(order.created_at) >= oneMonthAgo
      );
    } else if (period === "3months") {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(now.getMonth() - 3);
      filtered = filtered.filter(order => 
        order.created_at && new Date(order.created_at) >= threeMonthsAgo
      );
    }
    // "all" and "custom" show everything for now

    // Then sort
    let sorted = [...filtered];
    switch (sortOption) {
      case "newest":
        sorted.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case "oldest":
        sorted.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateA - dateB;
        });
        break;
      case "amount_high":
        sorted.sort((a, b) => Number(b.total_amount || 0) - Number(a.total_amount || 0));
        break;
      case "amount_low":
        sorted.sort((a, b) => Number(a.total_amount || 0) - Number(b.total_amount || 0));
        break;
    }

    setFilteredOrders(sorted);
  };

  const handleSort = (option: SortOption) => {
    setSortBy(option);
    applyFiltersAndSort(orders, option, filterPeriod);
    setShowSortModal(false);
  };

  const handleFilter = (period: FilterPeriod) => {
    setFilterPeriod(period);
    applyFiltersAndSort(orders, sortBy, period);
    setShowFilterModal(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  const renderOrder = ({ item }: { item: Order }) => {
    const statusText = item?.status || "pending";
    
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("OrderDetails", { orderId: item.id })}
        className="bg-white rounded-3xl p-5 mb-4 mx-4 shadow-xl"
      >
        <View className="flex-row justify-between mb-3">
          <View>
            <Text className="text-gray-500 text-sm">ORDER #{item.id}</Text>
            <Text className="text-2xl font-bold text-gray-900">
              {Number(item.total_amount || 0).toLocaleString()} TZS
            </Text>
          </View>

          <View className="items-end">
            <Text className="text-green-600 font-semibold">
              {statusText.toUpperCase()}
            </Text>
            <Text className="text-gray-500 text-xs mt-1">
              {item.created_at
                ? new Date(item.created_at).toDateString()
                : "N/A"}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between pt-4 border-t border-gray-100">
          <Text className="text-gray-600">{item.items_count || 0} items</Text>
          <Text className="text-green-600 font-medium">View Details →</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Render sort modal
  const renderSortModal = () => (
    <Modal
      visible={showSortModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowSortModal(false)}
    >
      <TouchableWithoutFeedback onPress={() => setShowSortModal(false)}>
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableWithoutFeedback>
            <View className="bg-white rounded-t-3xl p-6">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-2xl font-bold">Sort Orders</Text>
                <TouchableOpacity onPress={() => setShowSortModal(false)}>
                  <Ionicons name="close" size={28} color="#666" />
                </TouchableOpacity>
              </View>
              
              {(["newest", "oldest", "amount_high", "amount_low"] as SortOption[]).map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => handleSort(option)}
                  className={`py-4 px-2 border-b border-gray-100 last:border-b-0 flex-row justify-between items-center ${sortBy === option ? 'bg-green-50' : ''}`}
                >
                  <Text className={`text-lg ${sortBy === option ? 'text-green-600 font-bold' : 'text-gray-700'}`}>
                    {option === "newest" && "Newest First"}
                    {option === "oldest" && "Oldest First"}
                    {option === "amount_high" && "Amount: High to Low"}
                    {option === "amount_low" && "Amount: Low to High"}
                  </Text>
                  {sortBy === option && (
                    <Ionicons name="checkmark-circle" size={24} color="#16A34A" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  // Render filter modal
  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <TouchableWithoutFeedback onPress={() => setShowFilterModal(false)}>
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableWithoutFeedback>
            <View className="bg-white rounded-t-3xl p-6">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-2xl font-bold">Filter by Period</Text>
                <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                  <Ionicons name="close" size={28} color="#666" />
                </TouchableOpacity>
              </View>
              
              {(["all", "today", "week", "month", "3months"] as FilterPeriod[]).map((period) => (
                <TouchableOpacity
                  key={period}
                  onPress={() => handleFilter(period)}
                  className={`py-4 px-2 border-b border-gray-100 last:border-b-0 flex-row justify-between items-center ${filterPeriod === period ? 'bg-green-50' : ''}`}
                >
                  <View className="flex-row items-center">
                    {period === "today" && <Ionicons name="today-outline" size={20} color="#16A34A" className="mr-3" />}
                    {period === "week" && <Ionicons name="calendar-outline" size={20} color="#16A34A" className="mr-3" />}
                    {period === "month" && <Ionicons name="calendar" size={20} color="#16A34A" className="mr-3" />}
                    {period === "3months" && <Ionicons name="calendar-sharp" size={20} color="#16A34A" className="mr-3" />}
                    {period === "all" && <Ionicons name="time-outline" size={20} color="#16A34A" className="mr-3" />}
                    
                    <Text className={`text-lg ${filterPeriod === period ? 'text-green-600 font-bold' : 'text-gray-700'}`}>
                      {period === "all" && "All Time"}
                      {period === "today" && "Today"}
                      {period === "week" && "Last Week"}
                      {period === "month" && "Last Month"}
                      {period === "3months" && "Last 3 Months"}
                    </Text>
                  </View>
                  
                  {filterPeriod === period && (
                    <Ionicons name="checkmark-circle" size={24} color="#16A34A" />
                  )}
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity
                onPress={() => {
                  // Custom period implementation - you can add date picker here
                  setShowFilterModal(false);
                  alert("Custom period selection - Implement date picker here");
                }}
                className="py-4 px-2 flex-row justify-between items-center"
              >
                <View className="flex-row items-center">
                  <Ionicons name="calendar-outline" size={20} color="#666" className="mr-3" />
                  <Text className="text-lg text-gray-700">Custom Period</Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color="#666" />
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  if (!loading && orders.length === 0) {
    return (
      <LinearGradient
        colors={["#F8FAFC", "#F1F5F9"]}
        className="flex-1 justify-center items-center px-6"
      >
        <Text className="text-2xl font-bold mb-3">No Orders Yet</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("Market")}
          className="bg-green-500 px-8 py-4 rounded-2xl w-full"
        >
          <Text className="text-white text-center font-bold">
            Start Shopping
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#F8FAFC", "#F1F5F9"]} className="flex-1">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="px-6 pt-16 pb-4">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-3xl font-bold">My Orders</Text>
            <Text className="text-gray-500">
              {filteredOrders.length} {filterPeriod === "today" ? "today's orders" : "orders"}
            </Text>
          </View>
          
          {/* Filter/Sort Buttons */}
          <View className="flex-row bg-white rounded-2xl p-1 shadow-sm">
            <TouchableOpacity
              onPress={() => setShowFilterModal(true)}
              className={`flex-row items-center px-4 py-2 rounded-xl ${filterPeriod !== "all" ? 'bg-green-100' : ''}`}
            >
              <Ionicons 
                name={filterPeriod === "today" ? "today-outline" : "filter-outline"} 
                size={18} 
                color={filterPeriod !== "all" ? "#16A34A" : "#666"} 
              />
              <Text className={`ml-2 ${filterPeriod !== "all" ? 'text-green-700 font-semibold' : 'text-gray-600'}`}>
                Filter
              </Text>
            </TouchableOpacity>
            
            <View className="w-px bg-gray-200 mx-1" />
            
            <TouchableOpacity
              onPress={() => setShowSortModal(true)}
              className={`flex-row items-center px-4 py-2 rounded-xl ${sortBy !== "newest" ? 'bg-blue-100' : ''}`}
            >
              <Ionicons 
                name="swap-vertical-outline" 
                size={18} 
                color={sortBy !== "newest" ? "#3B82F6" : "#666"} 
              />
              <Text className={`ml-2 ${sortBy !== "newest" ? 'text-blue-700 font-semibold' : 'text-gray-600'}`}>
                Sort
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Filters Display */}
        {(filterPeriod !== "all" || sortBy !== "newest") && (
          <View className="flex-row flex-wrap mt-3">
            {filterPeriod !== "all" && (
              <View className="bg-green-100 px-3 py-1.5 rounded-full mr-2 mb-2 flex-row items-center">
                <Ionicons 
                  name={filterPeriod === "today" ? "today-outline" : "time-outline"} 
                  size={14} 
                  color="#16A34A" 
                />
                <Text className="text-green-700 text-sm font-medium ml-1">
                  {filterPeriod === "today" && "Today"}
                  {filterPeriod === "week" && "Last Week"}
                  {filterPeriod === "month" && "Last Month"}
                  {filterPeriod === "3months" && "Last 3 Months"}
                </Text>
                <TouchableOpacity 
                  onPress={() => handleFilter("all")}
                  className="ml-2"
                >
                  <Ionicons name="close-circle-outline" size={16} color="#16A34A" />
                </TouchableOpacity>
              </View>
            )}
            {sortBy !== "newest" && (
              <View className="bg-blue-100 px-3 py-1.5 rounded-full mb-2 flex-row items-center">
                <Ionicons name="funnel-outline" size={14} color="#3B82F6" />
                <Text className="text-blue-700 text-sm font-medium ml-1">
                  {sortBy === "oldest" && "Oldest First"}
                  {sortBy === "amount_high" && "Highest Amount"}
                  {sortBy === "amount_low" && "Lowest Amount"}
                </Text>
                <TouchableOpacity 
                  onPress={() => handleSort("newest")}
                  className="ml-2"
                >
                  <Ionicons name="close-circle-outline" size={16} color="#3B82F6" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Sort Modal */}
      {renderSortModal()}

      {/* Filter Modal */}
      {renderFilterModal()}

      {/* Empty state for today filter */}
      {!loading && filterPeriod === "today" && filteredOrders.length === 0 && (
        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-white rounded-3xl p-8 items-center shadow-lg">
            <Ionicons name="today-outline" size={64} color="#CBD5E1" />
            <Text className="text-2xl font-bold mt-4 text-gray-700">No Orders Today</Text>
            <Text className="text-gray-500 text-center mt-2">
              You haven't placed any orders today. Start shopping now!
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Market")}
              className="bg-green-500 px-8 py-4 rounded-2xl mt-6 w-full"
            >
              <Text className="text-white text-center font-bold">
                Browse Products
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Loading State */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#16A34A" />
        </View>
      ) : filterPeriod !== "today" || filteredOrders.length > 0 ? (
        <FlatList
          data={filteredOrders}
          keyExtractor={(i) => i.id.toString()}
          renderItem={renderOrder}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchOrders} />
          }
          contentContainerStyle={{ paddingBottom: 24, paddingTop: 10 }}
          showsVerticalScrollIndicator={false}
        />
      ) : null}
    </LinearGradient>
  );
}