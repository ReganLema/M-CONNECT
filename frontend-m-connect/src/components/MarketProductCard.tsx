// src/components/MarketProductCard.tsx

import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Product } from "@/types/Product";

type Props = {
  product: Product;
};

export default function MarketProductCard({ product }: Props) {
  const navigation = useNavigation<any>();

  const handlePress = () => {
    //  Pass FULL product object
    navigation.navigate("ProductDetails", {
      product,
    });
  };

  const imageUrl = product.image ?? null;

  const displayPrice =
    product.formatted_price ??
    `Tsh ${Number(product.price).toLocaleString()}`;

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.container}
      activeOpacity={0.9}
    >
      {/* Product Image */}
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>🌱</Text>
          <Text style={styles.placeholderSubText}>No Image</Text>
        </View>
      )}

      {/* Category Badge */}
      <View style={styles.categoryBadge}>
        <Text style={styles.categoryText}>{product.category}</Text>
      </View>

      {/* Product Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>

        <Text style={styles.price}>{displayPrice}</Text>

        <View style={styles.detailsRow}>
          <Text style={styles.quantity}>{product.quantity}</Text>

          <Text style={styles.location} numberOfLines={1}>
            📍 {product.location}
          </Text>
        </View>

        {/* Farmer Info */}
        <View style={styles.farmerRow}>
          <View style={styles.farmerPlaceholder}>
            <Text style={styles.farmerIcon}>👨‍🌾</Text>
          </View>

          <Text style={styles.farmerName} numberOfLines={1}>
            {product.farmer_name}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    width: "48%",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
  },
  imagePlaceholder: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 32,
    marginBottom: 4,
  },
  placeholderSubText: {
    color: "#9ca3af",
    fontSize: 12,
  },
  categoryBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "rgba(37, 99, 235, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#059669",
    marginBottom: 6,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  quantity: {
    fontSize: 12,
    color: "#6b7280",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  location: {
    fontSize: 11,
    color: "#6b7280",
    flex: 1,
    marginLeft: 8,
  },
  farmerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  farmerPlaceholder: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  farmerIcon: {
    fontSize: 10,
  },
  farmerName: {
    fontSize: 11,
    color: "#4b5563",
    fontStyle: "italic",
    flex: 1,
  },
});
