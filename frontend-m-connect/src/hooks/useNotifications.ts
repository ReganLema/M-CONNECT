// src/hooks/useNotifications.ts

import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { registerForPushNotifications } from '../services/notificationService';
import { useSettings } from '../contexts/SettingsContext';

export const useNotifications = () => {
  const navigation = useNavigation<any>();
  const { notifications: notificationsEnabled } = useSettings();

  useEffect(() => {
    if (!notificationsEnabled) return;

    // Register and save token to backend
    registerForPushNotifications();

    // Listen for notifications received while app is open
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('📬 Notification received:', notification);
      }
    );

    // Listen for notification taps
    const responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('👆 Notification tapped:', response);
        
        const data = response.notification.request.content.data as any;
        
        // Navigate based on notification data
        if (data?.screen === 'SellerOrderDetails' && data?.orderId) {
          navigation.navigate('SellerOrderDetails', { orderId: data.orderId });
        } else if (data?.screen === 'OrderDetails' && data?.orderId) {
          navigation.navigate('OrderDetails', { orderId: data.orderId });
        }
      }
    );

    // Cleanup
    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, [notificationsEnabled, navigation]);
};