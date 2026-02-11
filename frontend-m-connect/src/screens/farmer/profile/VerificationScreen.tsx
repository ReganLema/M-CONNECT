import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ShieldCheck, Upload, CheckCircle, ImageIcon } from "lucide-react-native";

export default function VerificationScreen() {
  const [idImage, setIdImage] = useState<string | null>(null);
  const [farmProof, setFarmProof] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const pickImage = async (type: "id" | "farm") => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Allow gallery access");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      type === "id" ? setIdImage(uri) : setFarmProof(uri);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 px-5 pt-6">
      {/* Header */}
      <Text className="text-2xl font-bold text-gray-900 mb-1">
        Account Verification
      </Text>
      <Text className="text-gray-500 mb-6">
        Verify your identity to unlock full access
      </Text>

      {/* Status */}
      <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
        <View className="flex-row items-center">
          <ShieldCheck size={22} color="#22C55E" />
          <Text className="ml-2 text-green-600 font-semibold">
            Verification Required
          </Text>
        </View>
        <Text className="text-gray-600 text-sm mt-2">
          Upload valid documents for review (24–48 hrs).
        </Text>
      </View>

      {/* Form */}
      <View className="bg-white rounded-2xl p-5 shadow-sm">
        <Text className="font-semibold text-lg mb-4">
          Personal Information
        </Text>

        <TextInput
          placeholder="Full Name"
          className="border border-gray-200 rounded-xl px-4 py-3 mb-4"
        />

        <TextInput
          placeholder="National ID Number"
          className="border border-gray-200 rounded-xl px-4 py-3 mb-4"
        />

        <TextInput
          placeholder="Farm Location"
          className="border border-gray-200 rounded-xl px-4 py-3 mb-6"
        />

        {/* ID Upload */}
        <TouchableOpacity
          onPress={() => pickImage("id")}
          className="border border-dashed border-gray-300 rounded-xl p-4 mb-4 items-center"
        >
          {idImage ? (
            <Image
              source={{ uri: idImage }}
              className="w-full h-40 rounded-xl"
            />
          ) : (
            <>
              <Upload size={22} color="#6B7280" />
              <Text className="text-gray-600 mt-2 font-medium">
                Upload National ID
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Farm Proof Upload */}
        <TouchableOpacity
          onPress={() => pickImage("farm")}
          className="border border-dashed border-gray-300 rounded-xl p-4 mb-6 items-center"
        >
          {farmProof ? (
            <Image
              source={{ uri: farmProof }}
              className="w-full h-40 rounded-xl"
            />
          ) : (
            <>
              <ImageIcon size={22} color="#6B7280" />
              <Text className="text-gray-600 mt-2 font-medium">
                Upload Farm Proof (Optional)
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Submit */}
        <TouchableOpacity
          disabled={!idImage || submitted}
          onPress={() => setSubmitted(true)}
          className={`py-4 rounded-xl items-center ${
            !idImage || submitted ? "bg-green-300" : "bg-green-600"
          }`}
        >
          <Text className="text-white font-semibold text-base">
            {submitted ? "Submitted" : "Submit for Verification"}
          </Text>
        </TouchableOpacity>

        {submitted && (
          <View className="flex-row justify-center items-center mt-4">
            <CheckCircle size={18} color="#22C55E" />
            <Text className="ml-2 text-green-600 font-medium">
              Verification submitted successfully
            </Text>
          </View>
        )}
      </View>

      <View className="h-10" />
    </ScrollView>
  );
}
