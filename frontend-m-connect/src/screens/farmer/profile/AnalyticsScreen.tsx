// src/screens/farmer/profile/AnalyticsScreen.tsx

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  BarChart3,
  TrendingUp,
  ShoppingBag,
  MapPin,
  Package,
  Calendar,
  Users,
  DollarSign,
  Clock,
  Star,
} from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getFarmerOrders } from "@/services/farmerOrderService";
import api from "@/services/productsapi";

// Create a simple theme hook if you don't have one
const useTheme = () => {
  // For now, return light theme. You can replace this with your actual theme hook
  return {
    theme: {
      background: "#FFFFFF",
      surface: "#F9FAFB",
      text: "#111827",
      textSecondary: "#6B7280",
      textTertiary: "#9CA3AF",
      primary: "#10B981",
      primaryLight: "#D1FAE5",
      border: "#E5E7EB",
    },
    isDark: false,
  };
};

type AnalyticsData = {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalProducts: number;
  totalRevenue: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  growthRate: number;
  topProduct: { name: string; sales: number } | null;
  topLocation: { name: string; count: number } | null;
  averageOrderValue: number;
  peakDay: string;
  topBuyer: { name: string; orders: number } | null;
};

const DEFAULT_ANALYTICS: AnalyticsData = {
  totalOrders: 0,
  completedOrders: 0,
  pendingOrders: 0,
  totalProducts: 0,
  totalRevenue: 0,
  thisMonthRevenue: 0,
  lastMonthRevenue: 0,
  growthRate: 0,
  topProduct: null,
  topLocation: null,
  averageOrderValue: 0,
  peakDay: 'N/A',
  topBuyer: null,
};

const AnalyticsScreen: React.FC = () => {
  const { theme, isDark } = useTheme();
  const [analytics, setAnalytics] = useState<AnalyticsData>(DEFAULT_ANALYTICS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch products
      const productsResponse = await api.get('/products');
      const productsData = productsResponse.data?.data?.products || productsResponse.data?.products || [];
      const totalProducts = Array.isArray(productsData) ? productsData.length : 0;

      // Fetch all orders
      const allOrders = await getFarmerOrders();

      // Basic counts
      const totalOrders = allOrders.length;
      const completedOrders = allOrders.filter(o => o.status === 'completed').length;
      const pendingOrders = allOrders.filter(o => o.status === 'pending').length;

      // Revenue calculations
      const totalRevenue = allOrders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + o.total_amount, 0);

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const thisMonthRevenue = allOrders
        .filter(o => {
          const orderDate = new Date(o.created_at);
          return o.status === 'completed' &&
                 orderDate.getMonth() === currentMonth &&
                 orderDate.getFullYear() === currentYear;
        })
        .reduce((sum, o) => sum + o.total_amount, 0);

      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      const lastMonthRevenue = allOrders
        .filter(o => {
          const orderDate = new Date(o.created_at);
          return o.status === 'completed' &&
                 orderDate.getMonth() === lastMonth &&
                 orderDate.getFullYear() === lastMonthYear;
        })
        .reduce((sum, o) => sum + o.total_amount, 0);

      // Calculate growth rate
      let growthRate = 0;
      if (lastMonthRevenue > 0) {
        growthRate = ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
      } else if (thisMonthRevenue > 0) {
        growthRate = 100;
      }

      // Find top selling product
      const productSales: { [key: string]: number } = {};
      allOrders
        .filter(o => o.status === 'completed')
        .forEach(order => {
          order.items.forEach(item => {
            productSales[item.product_name] = (productSales[item.product_name] || 0) + item.quantity;
          });
        });

      const topProduct = Object.entries(productSales).length > 0
        ? Object.entries(productSales).reduce((max, [name, sales]) =>
            sales > max.sales ? { name, sales } : max,
            { name: '', sales: 0 }
          )
        : null;

      // Find top buyer location
      const locationCounts: { [key: string]: number } = {};
      allOrders.forEach(order => {
        if (order.buyer_location) {
          locationCounts[order.buyer_location] = (locationCounts[order.buyer_location] || 0) + 1;
        }
      });

      const topLocation = Object.entries(locationCounts).length > 0
        ? Object.entries(locationCounts).reduce((max, [name, count]) =>
            count > max.count ? { name, count } : max,
            { name: '', count: 0 }
          )
        : null;

      // Calculate average order value
      const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;

      // Find peak day (most orders)
      const dayCounts: { [key: string]: number } = {};
      allOrders.forEach(order => {
        const day = new Date(order.created_at).toLocaleDateString('en-US', { weekday: 'long' });
        dayCounts[day] = (dayCounts[day] || 0) + 1;
      });

      const peakDay = Object.entries(dayCounts).length > 0
        ? Object.entries(dayCounts).reduce((max, [day, count]) =>
            count > max.count ? { day, count } : max,
            { day: 'N/A', count: 0 }
          ).day
        : 'N/A';

      // Find top buyer
      const buyerCounts: { [key: string]: number } = {};
      allOrders.forEach(order => {
        buyerCounts[order.buyer_name] = (buyerCounts[order.buyer_name] || 0) + 1;
      });

      const topBuyer = Object.entries(buyerCounts).length > 0
        ? Object.entries(buyerCounts).reduce((max, [name, orders]) =>
            orders > max.orders ? { name, orders } : max,
            { name: '', orders: 0 }
          )
        : null;

      setAnalytics({
        totalOrders,
        completedOrders,
        pendingOrders,
        totalProducts,
        totalRevenue,
        thisMonthRevenue,
        lastMonthRevenue,
        growthRate,
        topProduct,
        topLocation,
        averageOrderValue,
        peakDay,
        topBuyer,
      });

      console.log('📊 Analytics calculated:', {
        totalOrders,
        completedOrders,
        totalRevenue,
        growthRate: `${growthRate.toFixed(1)}%`,
        topProduct: topProduct?.name,
      });

    } catch (error: any) {
      console.error('❌ Error fetching analytics:', error);
      Alert.alert('Error', 'Failed to load analytics data');

      // Reset to defaults on error
      setAnalytics(DEFAULT_ANALYTICS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAnalytics();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAnalytics();
  }, []);

  const formatNumber = (num: number) => num.toLocaleString();
  const formatPercentage = (num: number) => `${num >= 0 ? '+' : ''}${num.toFixed(1)}%`;

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: theme.textSecondary, marginTop: 16 }}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
      }
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.text }}>
            Sales Analytics
          </Text>
          <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 4 }}>
            Your business insights
          </Text>
        </View>
        <TouchableOpacity 
          onPress={fetchAnalytics}
          style={{ backgroundColor: theme.primaryLight, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}
        >
          <Text style={{ color: theme.primary, fontSize: 14, fontWeight: '600' }}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Key Metrics Grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        {/* Total Orders */}
        <MetricCard
          theme={theme}
          icon={<ShoppingBag size={20} color={theme.primary} />}
          iconBg={theme.primaryLight}
          label="Total Orders"
          value={analytics.totalOrders.toString()}
          subtitle={`${analytics.completedOrders} completed`}
        />

        {/* Growth Rate */}
        <MetricCard
          theme={theme}
          icon={<TrendingUp size={20} color="#3B82F6" />}
          iconBg={isDark ? '#1E3A8A' : '#DBEAFE'}
          label="Growth Rate"
          value={formatPercentage(analytics.growthRate)}
          subtitle="vs last month"
        />

        {/* Best Product */}
        <MetricCard
          theme={theme}
          icon={<Star size={20} color="#F59E0B" />}
          iconBg={isDark ? '#78350F' : '#FEF3C7'}
          label="Best Product"
          value={analytics.topProduct?.name || 'N/A'}
          subtitle={`${analytics.topProduct?.sales || 0} sold`}
        />

        {/* Top Location */}
        <MetricCard
          theme={theme}
          icon={<MapPin size={20} color="#EF4444" />}
          iconBg={isDark ? '#7F1D1D' : '#FEE2E2'}
          label="Top Location"
          value={analytics.topLocation?.name || 'N/A'}
          subtitle={`${analytics.topLocation?.count || 0} orders`}
        />
      </View>

      {/* Revenue Overview */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text, marginBottom: 12 }}>
        Revenue Overview
      </Text>
      
      <View style={{ backgroundColor: theme.surface, borderRadius: 24, padding: 20, marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 4 }}>Total Revenue</Text>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.primary }}>
              {formatNumber(analytics.totalRevenue)} TZS
            </Text>
          </View>
          <View style={{ backgroundColor: theme.primaryLight, borderRadius: 20, padding: 12 }}>
            <DollarSign size={24} color={theme.primary} />
          </View>
        </View>

        <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 16 }} />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 4 }}>This Month</Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text }}>
              {formatNumber(analytics.thisMonthRevenue)}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 4 }}>Last Month</Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text }}>
              {formatNumber(analytics.lastMonthRevenue)}
            </Text>
          </View>
        </View>
      </View>

      {/* Performance Metrics */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text, marginBottom: 12 }}>
        Performance Metrics
      </Text>

      <PerformanceItem
        theme={theme}
        icon={<Package size={20} color="#9333EA" />}
        iconBg={isDark ? '#581C87' : '#F3E8FF'}
        label="Total Products"
        value={`${analytics.totalProducts} products listed`}
      />

      <PerformanceItem
        theme={theme}
        icon={<DollarSign size={20} color="#4F46E5" />}
        iconBg={isDark ? '#3730A3' : '#E0E7FF'}
        label="Avg Order Value"
        value={`${formatNumber(analytics.averageOrderValue)} TZS`}
      />

      <PerformanceItem
        theme={theme}
        icon={<Users size={20} color="#EC4899" />}
        iconBg={isDark ? '#831843' : '#FCE7F3'}
        label="Top Buyer"
        value={analytics.topBuyer?.name || 'N/A'}
        subtitle={`${analytics.topBuyer?.orders || 0} orders`}
        isLast
      />

      {/* Insights */}
      {analytics.peakDay !== 'N/A' && (
        <InsightCard
          theme={theme}
          isDark={isDark}
          icon={<Calendar size={18} color="#3B82F6" />}
          title="Peak Sales Day"
          message={`${analytics.peakDay} has the highest order volume. Consider special promotions on this day!`}
          type="info"
        />
      )}

      {analytics.completedOrders > 0 && analytics.totalRevenue > 0 && (
        <InsightCard
          theme={theme}
          isDark={isDark}
          icon={<TrendingUp size={18} color="#10B981" />}
          title="Performance Update"
          message={`You've completed ${analytics.completedOrders} order${analytics.completedOrders !== 1 ? 's' : ''} with ${formatNumber(analytics.totalRevenue)} TZS in revenue!`}
          type="info"
        />
      )}

      {analytics.pendingOrders > 0 && (
        <InsightCard
          theme={theme}
          isDark={isDark}
          icon={<Clock size={18} color="#F59E0B" />}
          title="Action Required"
          message={`You have ${analytics.pendingOrders} pending order${analytics.pendingOrders !== 1 ? 's' : ''} waiting for processing.`}
          type="warning"
        />
      )}

      {/* Empty State */}
      {analytics.totalOrders === 0 && (
        <View style={{ backgroundColor: theme.surface, borderRadius: 24, padding: 32, alignItems: 'center', marginBottom: 24 }}>
          <View style={{ backgroundColor: theme.border, borderRadius: 50, padding: 24, marginBottom: 16 }}>
            <BarChart3 size={40} color={theme.textTertiary} />
          </View>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text, marginBottom: 8 }}>
            No Data Yet
          </Text>
          <Text style={{ fontSize: 14, color: theme.textSecondary, textAlign: 'center' }}>
            Start selling to see your analytics here
          </Text>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

// Helper Components
const MetricCard = ({ theme, icon, iconBg, label, value, subtitle }: any) => (
  <View style={{ width: '48%', backgroundColor: theme.surface, borderRadius: 16, padding: 16 }}>
    <View style={{ backgroundColor: iconBg, borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
      {icon}
    </View>
    <Text style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 4 }}>{label}</Text>
    <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.text }} numberOfLines={1}>{value}</Text>
    <Text style={{ fontSize: 10, color: theme.textTertiary, marginTop: 4 }}>{subtitle}</Text>
  </View>
);

const PerformanceItem = ({ theme, icon, iconBg, label, value, subtitle, isLast }: any) => (
  <View style={{ backgroundColor: theme.surface, borderRadius: 16, padding: 16, marginBottom: isLast ? 24 : 12 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ backgroundColor: iconBg, borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 4 }}>{label}</Text>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.text }}>{value}</Text>
        {subtitle && <Text style={{ fontSize: 10, color: theme.textTertiary, marginTop: 2 }}>{subtitle}</Text>}
      </View>
    </View>
  </View>
);

const InsightCard = ({ theme, isDark, icon, title, message, type }: any) => {
  const colors = {
    info: { bg: isDark ? '#1E3A8A' : '#DBEAFE', border: isDark ? '#3B82F6' : '#93C5FD', text: isDark ? '#BFDBFE' : '#1E40AF' },
    warning: { bg: isDark ? '#78350F' : '#FEF3C7', border: isDark ? '#F59E0B' : '#FCD34D', text: isDark ? '#FDE68A' : '#92400E' },
    success: { bg: isDark ? '#064E3B' : '#D1FAE5', border: isDark ? '#10B981' : '#34D399', text: isDark ? '#A7F3D0' : '#065F46' },
  };
  
  const style = colors[type as 'info' | 'warning' | 'success'] || colors.info;
  
  return (
    <View style={{ backgroundColor: style.bg, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: style.border, marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View style={{ backgroundColor: style.border, borderRadius: 16, padding: 8, marginRight: 12 }}>
          {icon}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: 'bold', color: style.text, marginBottom: 4 }}>{title}</Text>
          <Text style={{ fontSize: 14, color: style.text }}>{message}</Text>
        </View>
      </View>
    </View>
  );
};

export default AnalyticsScreen;