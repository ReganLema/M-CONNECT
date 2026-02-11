import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function HelpCenterScreen() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqData = [
    {
      question: "How do I edit my profile?",
      answer:
        "Go to Settings → Edit Profile. From there, you can update your picture, name, email, and phone.",
    },
    {
      question: "How do I enable notifications?",
      answer:
        "Open Settings → Preferences → Notifications to toggle push notifications.",
    },
    {
      question: "How can I contact support?",
      answer:
        "Scroll down to the contact options and choose Call or WhatsApp support.",
    },
  ];

  return (
    <ScrollView
      className="flex-1 bg-gray-100 px-5"
      contentContainerStyle={{ paddingVertical: 25 }}
    >
      {/* Header */}
      <Text className="text-3xl font-bold text-green-700 mb-8">
        Help Center
      </Text>

      {/* FAQ Section */}
      <View className="bg-white rounded-2xl p-6 shadow-md mb-6">
        <Text className="text-lg font-semibold text-gray-700 mb-3">
          Frequently Asked Questions
        </Text>

        {faqData.map((item, index) => (
          <View key={index}>
            <TouchableOpacity
              className={`flex-row justify-between items-center py-4 ${
                index !== faqData.length - 1 ? "border-b border-gray-200" : ""
              }`}
              onPress={() => toggleFAQ(index)}
            >
              <Text className="text-gray-800 text-base w-[85%]">
                {item.question}
              </Text>

              <Ionicons
                name={openFAQ === index ? "chevron-up" : "chevron-down"}
                size={22}
                color="#059669"
              />
            </TouchableOpacity>

            {openFAQ === index && (
              <Text className="text-gray-600 mt-2 mb-4 leading-5">
                {item.answer}
              </Text>
            )}
          </View>
        ))}
      </View>

      {/* Contact Support */}
      <View className="bg-white rounded-2xl p-6 shadow-md mb-6">
        <Text className="text-lg font-semibold text-gray-700 mb-4">
          Need More Help?
        </Text>

        {/* Call */}
        <TouchableOpacity
          className="flex-row items-center justify-between py-4 border-b border-gray-200"
          onPress={() => Linking.openURL("tel:+255626229217")}
        >
          <View className="flex-row items-center gap-3">
            <Ionicons name="call-outline" size={24} color="#059669" />
            <Text className="text-gray-700 text-base">Call Support</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        {/* WhatsApp */}
        <TouchableOpacity
          className="flex-row items-center justify-between py-4"
          onPress={() =>
            Linking.openURL("https://wa.me/255626229217?text=Hello+Support")
          }
        >
          <View className="flex-row items-center gap-3">
            <Ionicons name="logo-whatsapp" size={24} color="#059669" />
            <Text className="text-gray-700 text-base">WhatsApp Support</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
