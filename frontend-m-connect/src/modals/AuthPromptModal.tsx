import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AppButton from "@/components/common/AppButton";

type AuthPromptModalProps = {
  visible: boolean;
  onClose: () => void;
  message?: string;
};

const AuthPromptModal: React.FC<AuthPromptModalProps> = ({
  visible,
  onClose,
  message = "You need to login to continue",
}) => {
  const navigation = useNavigation<any>();

  const handleLogin = () => {
    onClose();
    navigation.navigate("Auth", { screen: "Login" });
  };

  const handleRegister = () => {
    onClose();
    navigation.navigate("Auth", { screen: "Register" });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/40 justify-center items-center px-6">
          <TouchableWithoutFeedback>
            <View className="bg-white w-full rounded-2xl p-6">
              <Text className="text-xl font-semibold text-gray-900 text-center">
                Authentication Required
              </Text>

              <Text className="text-gray-600 text-center mt-3">
                {message}
              </Text>

              <View className="mt-6 space-y-3">
                <AppButton title="Login" onPress={handleLogin} />
                <AppButton
                  title="Create Account"
                  variant="outline"
                  onPress={handleRegister}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default AuthPromptModal;
