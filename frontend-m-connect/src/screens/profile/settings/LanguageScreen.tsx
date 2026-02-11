import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LanguageScreen() {
  const navigation = useNavigation();
  const [selectedLang, setSelectedLang] = useState("en");
  const [isLoading, setIsLoading] = useState(true);

  const languages = [
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "sw", label: "Swahili (Kiswahili)", flag: "🇹🇿" },
    { code: "fr", label: "French", flag: "🇫🇷" },
    { code: "ar", label: "Arabic", flag: "🇸🇦" },
  ];

  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLang = await AsyncStorage.getItem("appLanguage");
      if (savedLang) {
        setSelectedLang(savedLang);
      }
    } catch (error) {
      console.error("Failed to load language:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem("appLanguage", selectedLang);
      
      Alert.alert(
        "Success",
        `Language changed to ${getLanguageName(selectedLang)}`,
        [
          { 
            text: "OK", 
            onPress: () => navigation.goBack() 
          }
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to save language preference");
    }
  };

  const getLanguageName = (code: string) => {
    const lang = languages.find(l => l.code === code);
    return lang?.label || code.toUpperCase();
  };

  const FlagIcon = ({ code }: { code: string }) => {
    const lang = languages.find(l => l.code === code);
    return <Text className="text-xl mr-3">{lang?.flag || "🏳️"}</Text>;
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-10 pb-4 bg-white shadow-sm">
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          className="p-2"
        >
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Language</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingVertical: 25 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Language Selection Card */}
        <View className="bg-white rounded-2xl p-6 shadow-md mb-6">
          <View className="mb-4">
            <Text className="text-lg font-semibold text-gray-700 mb-1">
              Choose App Language
            </Text>
            <Text className="text-gray-500 text-sm">
              Current: {getLanguageName(selectedLang)}
            </Text>
          </View>

          {languages.map((lang, index) => (
            <TouchableOpacity
              key={lang.code}
              className={`flex-row justify-between items-center py-4 ${
                index !== languages.length - 1 ? "border-b border-gray-200" : ""
              }`}
              onPress={() => setSelectedLang(lang.code)}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <Text className="text-xl mr-3">{lang.flag}</Text>
                <Text className="text-gray-700 text-base">{lang.label}</Text>
              </View>

              {selectedLang === lang.code ? (
                <Ionicons name="checkmark-circle" size={24} color="#059669" />
              ) : (
                <Ionicons name="ellipse-outline" size={24} color="#9ca3af" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Buttons */}
        <View className="space-y-4">
          <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={handleSave}
            className="mb-2"
          >
            <LinearGradient
              colors={["#10B981", "#059669"]}
              start={[0, 0]}
              end={[1, 0]}
              className="py-4 rounded-2xl shadow-lg"
            >
              <Text className="text-center text-white text-lg font-bold">
                Save Language
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="py-4 rounded-2xl bg-gray-200 shadow-sm"
          >
            <Text className="text-center text-gray-700 text-lg font-medium">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>

        {/* Language Info */}
        <View className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <Text className="text-blue-800 font-medium mb-2">
            Language Settings
          </Text>
          <Text className="text-blue-700 text-sm mb-2">
            • Changing language will update the entire app interface
          </Text>
          <Text className="text-blue-700 text-sm mb-2">
            • Some content may remain in English if not translated
          </Text>
          <Text className="text-blue-700 text-sm">
            • You can change this anytime in settings
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}