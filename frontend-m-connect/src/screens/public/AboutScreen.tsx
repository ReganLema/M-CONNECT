// src/screens/AboutScreen.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

export default function AboutScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <LinearGradient
        colors={["#059669", "#10b981", "#34d399"]}
        className="px-6 pt-12 pb-8"
      >
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-2 rounded-full bg-white/20"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white ml-4">
            About Mkulima Connect
          </Text>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8">
          {/* Hero Section */}
          <View className="items-center mb-10">
            <View className="w-32 h-32 rounded-full bg-emerald-100 items-center justify-center mb-6">
              <Ionicons name="leaf" size={64} color="#059669" />
            </View>
            <Text className="text-3xl font-bold text-gray-900 text-center mb-3">
              Fresh & Organic
            </Text>
            <Text className="text-gray-600 text-center text-lg">
              Connecting Farmers with Consumers
            </Text>
          </View>

          {/* Mission Section */}
          <View className="mb-10">
            <Text className="text-2xl font-bold text-gray-900 mb-4">
              Our Mission
            </Text>
            <Text className="text-gray-700 text-base leading-7">
              At Mkulima Connect, we're dedicated to bridging the gap between 
              local farmers and consumers. We ensure that fresh, organic produce 
              reaches your table directly from verified farms while supporting 
              sustainable agriculture practices.
            </Text>
          </View>

          {/* Features Grid */}
          <View className="mb-10">
            <Text className="text-2xl font-bold text-gray-900 mb-6">
              Why Choose Us?
            </Text>
            
            <View className="flex-row flex-wrap justify-between">
              {[
                {
                  icon: 'checkmark-circle',
                  title: 'Verified Farmers',
                  description: 'All farmers undergo strict verification',
                },
                {
                  icon: 'time',
                  title: 'Fresh Delivery',
                  description: 'Harvested within 24 hours',
                },
                {
                  icon: 'shield-checkmark',
                  title: 'Quality Guarantee',
                  description: '100% quality assurance',
                },
                {
                  icon: 'cash',
                  title: 'Fair Prices',
                  description: 'Direct from farm, no middlemen',
                },
              ].map((feature, index) => (
                <View key={index} className="w-[48%] mb-6">
                  <View className="p-4 rounded-2xl bg-emerald-50 items-center">
                    <View className="w-16 h-16 rounded-full bg-emerald-100 items-center justify-center mb-3">
                      <Ionicons name={feature.icon as any} size={28} color="#059669" />
                    </View>
                    <Text className="font-bold text-gray-900 text-center mb-1">
                      {feature.title}
                    </Text>
                    <Text className="text-gray-600 text-sm text-center">
                      {feature.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Detailed Info */}
          <View className="mb-10">
            <Text className="text-2xl font-bold text-gray-900 mb-4">
              How We Work
            </Text>
            
            {[
              {
                step: '1',
                title: 'Farmer Verification',
                description: 'We conduct thorough background checks and farm visits to verify all our farmers.',
              },
              {
                step: '2',
                title: 'Quality Inspection',
                description: 'Every product is inspected for freshness and quality before listing.',
              },
              {
                step: '3',
                title: 'Direct Connection',
                description: 'Consumers connect directly with farmers for transparent transactions.',
              },
              {
                step: '4',
                title: 'Fast Delivery',
                description: 'Products are delivered fresh from farm to your doorstep.',
              },
            ].map((item, index) => (
              <View key={index} className="flex-row mb-6">
                <View className="w-10 h-10 rounded-full bg-emerald-600 items-center justify-center mr-4">
                  <Text className="text-white font-bold">{item.step}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900 mb-1">
                    {item.title}
                  </Text>
                  <Text className="text-gray-600">
                    {item.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Contact/CTA */}
          <View className="rounded-3xl bg-gradient-to-r from-emerald-500 to-emerald-600 p-6">
            <Text className="text-2xl font-bold text-white text-center mb-3">
              Want to Learn More?
            </Text>
            <Text className="text-emerald-100 text-center mb-6">
              Contact us for partnerships, farmer registration, or inquiries
            </Text>
            <TouchableOpacity
              className="py-4 bg-white rounded-2xl items-center"
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Contact' as never)}
            >
              <Text className="text-emerald-700 font-bold text-lg">
                Contact Us
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="mt-10 pt-6 border-t border-gray-200">
            <Text className="text-gray-500 text-center">
              © {new Date().getFullYear()} Mkulima Connect. All rights reserved.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}