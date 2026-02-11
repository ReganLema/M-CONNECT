import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SettingsScreen from "../screens/profile/settings/SettingsScreen";
import LanguageScreen from "../screens/profile/settings/LanguageScreen";
{/*import NotificationScreen from "../screens/settings/NotificationScreen";*/}
import PrivacyScreen from "../screens/profile/settings/PrivacyPolicyScreen";
import HelpCenterScreen from "../screens/profile/settings/HelpCenterScreen";
import ChangePasswordScreen from "../screens/profile/settings/ChangePasswordScreen";

export type SettingsStackParamList = {
  SettingsHome: undefined;
  Language: undefined;
  Notifications: undefined;
  Privacy: undefined;
  HelpCenter: undefined;
  AboutApp: undefined;
  ChangePassword: undefined;
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export default function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsHome" component={SettingsScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />
      {/*<Stack.Screen name="Notifications" component={NotificationScreen} />*/}
     <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Stack.Navigator>
  );
}
