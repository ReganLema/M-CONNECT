// src/screens/orders/ProductDetailsScreen.tsx
import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Modal,
  Linking,
  FlatList,
  Dimensions
} from "react-native";
import { User, X, MapPin, Phone, Mail, MessageCircle, ShoppingBag, ChevronRight } from "lucide-react-native";
import { addToCart } from "@/services/cartService"; 
import { farmerService, Farmer, FarmerProduct } from "@/services/farmerService";
import { Product } from "@/types/Product";

type Props = {
  route: {
    params: {
      product: Product;
    };
  };
  navigation: any;
};

const { width } = Dimensions.get('window');
const PRODUCT_CARD_WIDTH = (width - 64) / 2; // For 2 columns with padding

export default function ProductDetailsScreen({ route, navigation }: Props) {
  const { product } = route.params;
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [farmerModalVisible, setFarmerModalVisible] = useState(false);
  const [productsModalVisible, setProductsModalVisible] = useState(false);
  const [farmerDetails, setFarmerDetails] = useState<Farmer | null>(null);
  const [farmerProducts, setFarmerProducts] = useState<FarmerProduct[]>([]);
  const [loadingFarmer, setLoadingFarmer] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Fetch farmer details when modal opens
  useEffect(() => {
    if (farmerModalVisible) {
      fetchFarmerDetails();
    }
  }, [farmerModalVisible]);

  // Fetch farmer products when products modal opens
  useEffect(() => {
    if (productsModalVisible) {
      fetchFarmerProducts();
    }
  }, [productsModalVisible]);

  const fetchFarmerDetails = async () => {
    setLoadingFarmer(true);
    try {
      const farmerId = product.farmer_id || product.user_id || product.seller_id;
      
      if (farmerId) {
        const farmer = await farmerService.getFarmerById(farmerId);
        setFarmerDetails(farmer);
      } else {
        if (product.seller_email) {
          Alert.alert("Info", "Farmer details not available");
        }
      }
    } catch (error) {
      console.error("❌ Error fetching farmer details:", error);
    } finally {
      setLoadingFarmer(false);
    }
  };

  const fetchFarmerProducts = async () => {
    setLoadingProducts(true);
    try {
      const farmerId = product.farmer_id || product.user_id || product.seller_id;
      
      if (farmerId) {
        const products = await farmerService.getFarmerProducts(farmerId);
        setFarmerProducts(products);
      }
    } catch (error) {
      console.error("❌ Error fetching farmer products:", error);
      Alert.alert("Error", "Failed to load farmer products");
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      setLoading(true);
      await addToCart(product.id, 1);
      setAdded(true);
      Alert.alert("Success", "Product added to cart!");
    } catch (error: any) {
      console.error("❌ Failed to add to cart", error);
      Alert.alert("Error", error.message || "Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProductToCart = async (productId: number) => {
    try {
      await addToCart(productId, 1);
      Alert.alert("Success", "Product added to cart!");
    } catch (error: any) {
      console.error("❌ Failed to add to cart", error);
      Alert.alert("Error", error.message || "Failed to add to cart");
    }
  };

  const handleViewProduct = (productItem: FarmerProduct) => {
    // Convert FarmerProduct to Product type if needed
    const productToView: any = {
      ...productItem,
      seller_name: getFarmerName(),
      seller_phone: getFarmerPhone(),
      seller_email: product.seller_email || farmerDetails?.email,
      seller_location: getFarmerLocation(),
    };
    
    // Close modals and navigate to product details
    setFarmerModalVisible(false);
    setProductsModalVisible(false);
    navigation.push("ProductDetails", { product: productToView });
  };

  const getFarmerAvatar = (): string => {
    const farmerAvatar = product.seller_avatar || product.farmer_image;
    if (farmerAvatar && typeof farmerAvatar === 'string' && farmerAvatar.trim() !== '') {
      return farmerAvatar;
    }
    const farmerName = farmerDetails?.name || product.seller_name || product.farmer_name || "Farmer";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(farmerName)}&background=10b981&color=fff&size=128`;
  };

  const getProductImage = (): string => {
    const productImage = product.image || product.image_url;
    if (productImage && typeof productImage === 'string' && productImage.trim() !== '') {
      return productImage;
    }
    return "https://via.placeholder.com/400";
  };

  const getFarmerName = (): string => {
    return farmerDetails?.name || product.seller_name || product.farmer_name || "Local Farmer";
  };

  const getFarmerLocation = (): string => {
    return farmerDetails?.location || product.seller_location || product.farmer_location || product.location || "Location not specified";
  };

  const getFarmerPhone = (): string | null => {
    return farmerDetails?.phone || product.seller_phone || null;
  };

  const handleCallFarmer = () => {
    const phone = getFarmerPhone();
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleMessageFarmer = () => {
    const phone = getFarmerPhone();
    if (phone) {
      Linking.openURL(`sms:${phone}`);
    }
  };

  const handleUpdatePhone = () => {
    Alert.prompt(
      "Update Phone Number",
      "Enter farmer's phone number:",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Update", 
          onPress: async (phone?: string) => {
            if (phone && phone.trim()) {
              const farmerId = product.farmer_id || product.user_id;
              if (farmerId) {
                const result = await farmerService.updateFarmerPhone(farmerId, phone);
                if (result.success) {
                  Alert.alert("Success", result.message);
                  fetchFarmerDetails();
                } else {
                  Alert.alert("Error", result.message);
                }
              }
            } else {
              Alert.alert("Error", "Phone number cannot be empty");
            }
          }
        }
      ],
      "plain-text",
      "",
      "phone-pad"
    );
  };

  const renderProductItem = ({ item }: { item: FarmerProduct }) => (
    <TouchableOpacity
      onPress={() => handleViewProduct(item)}
      style={{
        width: PRODUCT_CARD_WIDTH,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: "hidden",
      }}
      activeOpacity={0.7}
    >
      {/* Product Image */}
      <Image
        source={{ 
          uri: item.image && item.image.trim() !== '' 
            ? item.image 
            : "https://via.placeholder.com/200x150"
        }}
        style={{ width: "100%", height: 120 }}
        resizeMode="cover"
      />
      
      {/* Product Info */}
      <View style={{ padding: 12 }}>
        <Text 
          numberOfLines={1} 
          ellipsizeMode="tail"
          style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}
        >
          {item.name}
        </Text>
        
        <Text 
          numberOfLines={2} 
          ellipsizeMode="tail"
          style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}
        >
          {item.description}
        </Text>
        
        <Text style={{ fontSize: 16, fontWeight: "bold", color: "#16A34A", marginTop: 8 }}>
          {item.formatted_price || `TZS ${item.price}`}
        </Text>
        
        <TouchableOpacity
          onPress={() => handleAddProductToCart(item.id)}
          style={{
            backgroundColor: "#10B981",
            paddingVertical: 8,
            borderRadius: 8,
            marginTop: 12,
          }}
          activeOpacity={0.7}
        >
          <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "600", textAlign: "center" }}>
            Add to Cart
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Product Image */}
        <View style={{ backgroundColor: "#FFFFFF", borderRadius: 32, marginHorizontal: 20, marginTop: 80, marginBottom: 20, overflow: "hidden" }}>
          <Image
            source={{ uri: getProductImage() }}
            style={{ width: "100%", height: 320 }}
            resizeMode="cover"
          />
        </View>

        {/* Content */}
        <View style={{ backgroundColor: "#FFFFFF", borderRadius: 32, marginHorizontal: 20, padding: 28 }}>
          {/* Product Info */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
            <View style={{ flex: 1, marginRight: 20 }}>
              <Text style={{ fontSize: 26, fontWeight: "bold", color: "#111827" }}>
                {product.name}
              </Text>
              <Text style={{ marginTop: 8, color: "#6B7280" }}>
                📍 {product.location} • {product.category}
              </Text>
            </View>
            <Text style={{ fontSize: 28, fontWeight: "bold", color: "#16A34A" }}>
              {product.formatted_price ?? `${product.price} TZS`}
            </Text>
          </View>

          <View style={{ height: 1, backgroundColor: "#F3F4F6", marginVertical: 20 }} />

          <Text style={{ fontSize: 16, color: "#4B5563", lineHeight: 24 }}>
            {product.description || "Fresh farm product directly from the farmer."}
          </Text>

          {/* Farmer Info Section */}
          <View style={{ 
            marginTop: 24, 
            backgroundColor: "#F9FAFB", 
            padding: 16, 
            borderRadius: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <View style={{ 
                width: 48, 
                height: 48, 
                borderRadius: 24, 
                backgroundColor: "#10B981",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12
              }}>
                <Text style={{ fontSize: 20 }}>👨‍🌾</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: "#6B7280", marginBottom: 2 }}>
                  Sold by
                </Text>
                <Text style={{ fontSize: 16, fontWeight: "600", color: "#111827" }}>
                  {getFarmerName()}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setFarmerModalVisible(true)}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                padding: 12,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: getFarmerAvatar() }}
                style={{ width: 40, height: 40, borderRadius: 20 }}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>

          {/* Add to Cart Button */}
          <TouchableOpacity
            onPress={handleAddToCart}
            disabled={added || loading}
            style={{
              backgroundColor: added ? "#9CA3AF" : "#16A34A",
              paddingVertical: 18,
              borderRadius: 18,
              marginTop: 28,
              opacity: loading ? 0.6 : 1,
            }}
            activeOpacity={0.7}
          >
            <Text style={{ color: "#FFF", fontSize: 18, fontWeight: "600", textAlign: "center" }}>
              {loading ? "Adding..." : added ? "✓ Added to Cart" : "Add to Cart"}
            </Text>
          </TouchableOpacity>

          {/* View Cart Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Cart")}
            style={{
              backgroundColor: "#1F2937",
              paddingVertical: 18,
              borderRadius: 18,
              marginTop: 16,
            }}
            activeOpacity={0.7}
          >
            <Text style={{ color: "#FFF", fontSize: 18, fontWeight: "600", textAlign: "center" }}>
              View Cart
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Back Button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          position: "absolute",
          top: 40,
          left: 20,
          backgroundColor: "#FFF",
          width: 50,
          height: 50,
          borderRadius: 16,
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
        activeOpacity={0.7}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>←</Text>
      </TouchableOpacity>

      {/* Farmer Details Modal */}
      <Modal
        visible={farmerModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFarmerModalVisible(false)}
      >
        <View style={{ 
          flex: 1, 
          backgroundColor: "rgba(0,0,0,0.5)", 
          justifyContent: "flex-end" 
        }}>
          <View style={{ 
            backgroundColor: "#FFFFFF", 
            borderTopLeftRadius: 32, 
            borderTopRightRadius: 32,
            paddingBottom: 40,
            maxHeight: "80%"
          }}>
            {/* Modal Header */}
            <View style={{ 
              flexDirection: "row", 
              alignItems: "center", 
              justifyContent: "space-between",
              padding: 24,
              borderBottomWidth: 1,
              borderBottomColor: "#F3F4F6"
            }}>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: "#111827" }}>
                Farmer Profile
              </Text>
              <TouchableOpacity
                onPress={() => setFarmerModalVisible(false)}
                style={{
                  backgroundColor: "#F3F4F6",
                  borderRadius: 12,
                  padding: 8,
                }}
                activeOpacity={0.7}
              >
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {loadingFarmer ? (
                <View style={{ padding: 40, alignItems: "center" }}>
                  <Text>Loading farmer details...</Text>
                </View>
              ) : (
                <>
                  {/* Farmer Avatar & Name */}
                  <View style={{ alignItems: "center", paddingVertical: 32, paddingHorizontal: 24 }}>
                    <View style={{ position: "relative" }}>
                      <Image
                        source={{ uri: getFarmerAvatar() }}
                        style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: "#E5E7EB" }}
                        resizeMode="cover"
                      />
                      {product.seller_verified && (
                        <View style={{
                          position: "absolute",
                          bottom: 0,
                          right: 0,
                          backgroundColor: "#10B981",
                          borderRadius: 12,
                          padding: 4,
                        }}>
                          <Text style={{ fontSize: 12, color: "#FFF" }}>✓</Text>
                        </View>
                      )}
                    </View>

                    <Text style={{ 
                      fontSize: 24, 
                      fontWeight: "bold", 
                      color: "#111827", 
                      marginTop: 16 
                    }}>
                      {getFarmerName()}
                    </Text>

                    {product.seller_verified && (
                      <View style={{
                        backgroundColor: "#D1FAE5",
                        paddingHorizontal: 16,
                        paddingVertical: 6,
                        borderRadius: 999,
                        marginTop: 8,
                        flexDirection: "row",
                        alignItems: "center"
                      }}>
                        <Text style={{ fontSize: 12, color: "#059669" }}>✓</Text>
                        <Text style={{ 
                          color: "#059669", 
                          fontSize: 12, 
                          fontWeight: "600",
                          marginLeft: 4
                        }}>
                          Verified Seller
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Contact Information */}
                  <View style={{ paddingHorizontal: 24 }}>
                    <Text style={{ 
                      fontSize: 18, 
                      fontWeight: "bold", 
                      color: "#111827", 
                      marginBottom: 16 
                    }}>
                      Contact Information
                    </Text>

                    {/* Location */}
                    <View style={{
                      backgroundColor: "#F9FAFB",
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 12,
                      flexDirection: "row",
                      alignItems: "center"
                    }}>
                      <View style={{
                        backgroundColor: "#DBEAFE",
                        borderRadius: 12,
                        padding: 10,
                        marginRight: 12
                      }}>
                        <MapPin size={20} color="#3B82F6" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}>
                          Location
                        </Text>
                        <Text style={{ fontSize: 16, fontWeight: "500", color: "#111827" }}>
                          {getFarmerLocation()}
                        </Text>
                      </View>
                    </View>

                    {/* Phone */}
                    <View style={{
                      backgroundColor: "#F9FAFB",
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 12,
                      flexDirection: "row",
                      alignItems: "center"
                    }}>
                      <View style={{
                        backgroundColor: "#D1FAE5",
                        borderRadius: 12,
                        padding: 10,
                        marginRight: 12
                      }}>
                        <Phone size={20} color="#10B981" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}>
                          Phone
                        </Text>
                        <Text style={{ fontSize: 16, fontWeight: "500", color: "#111827" }}>
                          {getFarmerPhone() || "Not provided"}
                        </Text>
                      </View>
                      {!getFarmerPhone() && (
                        <TouchableOpacity
                          onPress={handleUpdatePhone}
                          style={{
                            backgroundColor: "#3B82F6",
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 8,
                          }}
                        >
                          <Text style={{ color: "#FFF", fontSize: 12 }}>Add</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Email */}
                    <View style={{
                      backgroundColor: "#F9FAFB",
                      borderRadius: 16,
                      padding: 16,
                      flexDirection: "row",
                      alignItems: "center"
                    }}>
                      <View style={{
                        backgroundColor: "#EDE9FE",
                        borderRadius: 12,
                        padding: 10,
                        marginRight: 12
                      }}>
                        <Mail size={20} color="#9333EA" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}>
                          Email
                        </Text>
                        <Text 
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={{ fontSize: 16, fontWeight: "500", color: "#111827" }}
                        >
                          {product.seller_email || farmerDetails?.email || "Not provided"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={{ padding: 24 }}>
                    {getFarmerPhone() && (
                      <>
                        <TouchableOpacity
                          style={{
                            backgroundColor: "#10B981",
                            paddingVertical: 16,
                            borderRadius: 16,
                            alignItems: "center",
                            marginBottom: 12,
                            flexDirection: "row",
                            justifyContent: "center"
                          }}
                          activeOpacity={0.7}
                          onPress={handleCallFarmer}
                        >
                          <Phone size={20} color="#FFF" style={{ marginRight: 8 }} />
                          <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "600" }}>
                            Call Farmer
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={{
                            backgroundColor: "#3B82F6",
                            paddingVertical: 16,
                            borderRadius: 16,
                            alignItems: "center",
                            marginBottom: 12,
                            flexDirection: "row",
                            justifyContent: "center"
                          }}
                          activeOpacity={0.7}
                          onPress={handleMessageFarmer}
                        >
                          <MessageCircle size={20} color="#FFF" style={{ marginRight: 8 }} />
                          <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "600" }}>
                            Message Farmer
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}

                    <TouchableOpacity
                      style={{
                        backgroundColor: "#1F2937",
                        paddingVertical: 16,
                        borderRadius: 16,
                        alignItems: "center",
                        marginBottom: 12,
                        flexDirection: "row",
                        justifyContent: "center"
                      }}
                      activeOpacity={0.7}
                      onPress={() => {
                        setFarmerModalVisible(false);
                        setProductsModalVisible(true);
                      }}
                    >
                      <ShoppingBag size={20} color="#FFF" style={{ marginRight: 8 }} />
                      <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "600" }}>
                        View All Products
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{
                        backgroundColor: "#F3F4F6",
                        paddingVertical: 16,
                        borderRadius: 16,
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: "#E5E7EB"
                      }}
                      activeOpacity={0.7}
                      onPress={() => {
                        setFarmerModalVisible(false);
                        navigation.getParent()?.navigate("Market", { 
                          farmer: getFarmerName(),
                          farmerId: product.farmer_id || product.user_id
                        });
                      }}
                    >
                      <Text style={{ color: "#374151", fontSize: 16, fontWeight: "600" }}>
                        Go to Market
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Farmer Products Modal */}
      <Modal
        visible={productsModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setProductsModalVisible(false)}
      >
        <View style={{ 
          flex: 1, 
          backgroundColor: "rgba(0,0,0,0.5)", 
          justifyContent: "flex-end" 
        }}>
          <View style={{ 
            backgroundColor: "#FFFFFF", 
            borderTopLeftRadius: 32, 
            borderTopRightRadius: 32,
            paddingBottom: 40,
            maxHeight: "90%"
          }}>
            {/* Modal Header */}
            <View style={{ 
              flexDirection: "row", 
              alignItems: "center", 
              justifyContent: "space-between",
              padding: 24,
              borderBottomWidth: 1,
              borderBottomColor: "#F3F4F6"
            }}>
              <View>
                <Text style={{ fontSize: 20, fontWeight: "bold", color: "#111827" }}>
                  {getFarmerName()}'s Products
                </Text>
                <Text style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>
                  {farmerProducts.length} product{farmerProducts.length !== 1 ? 's' : ''} available
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setProductsModalVisible(false)}
                style={{
                  backgroundColor: "#F3F4F6",
                  borderRadius: 12,
                  padding: 8,
                }}
                activeOpacity={0.7}
              >
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {loadingProducts ? (
              <View style={{ padding: 40, alignItems: "center" }}>
                <Text>Loading products...</Text>
              </View>
            ) : farmerProducts.length === 0 ? (
              <View style={{ padding: 40, alignItems: "center" }}>
                <ShoppingBag size={48} color="#9CA3AF" />
                <Text style={{ fontSize: 16, color: "#6B7280", marginTop: 16 }}>
                  No products available
                </Text>
                <Text style={{ fontSize: 14, color: "#9CA3AF", marginTop: 8 }}>
                  This farmer hasn't listed any products yet
                </Text>
              </View>
            ) : (
              <FlatList
                data={farmerProducts}
                renderItem={renderProductItem}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={{ 
                  justifyContent: "space-between",
                  paddingHorizontal: 24,
                  marginTop: 16
                }}
                contentContainerStyle={{ paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                  <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
                    <Text style={{ fontSize: 16, color: "#4B5563" }}>
                      Browse all products from {getFarmerName()}
                    </Text>
                  </View>
                }
              />
            )}

            {/* Close Button */}
            <TouchableOpacity
              style={{
                backgroundColor: "#F3F4F6",
                paddingVertical: 16,
                borderRadius: 16,
                alignItems: "center",
                marginHorizontal: 24,
                marginTop: 16,
                borderWidth: 1,
                borderColor: "#E5E7EB"
              }}
              activeOpacity={0.7}
              onPress={() => setProductsModalVisible(false)}
            >
              <Text style={{ color: "#374151", fontSize: 16, fontWeight: "600" }}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}