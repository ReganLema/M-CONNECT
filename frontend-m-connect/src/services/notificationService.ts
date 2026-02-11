// src/services/notificationService.ts

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import api from './api'; // Your API service

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Register for push notifications and save token to backend
 */
export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.warn('Push notifications only work on physical devices');
    return null;
  }

  try {
    // Request permissions based on platform
    let { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      // Platform-specific permission requests
      if (Platform.OS === 'ios') {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            // 'allowAnnouncements' was removed in newer versions
            // 'provideAppNotificationSettings' is available in some versions
          },
        });
        finalStatus = status;
      } else {
        // Android and other platforms
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
    }

    if (finalStatus !== 'granted') {
      console.warn('Permission not granted for push notifications');
      return null;
    }

    // Get Expo push token
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });

    console.log('📱 Push token:', token.data);

    // ✅ Save token to backend
    await savePushTokenToBackend(token.data);

    // Configure Android channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#10B981',
        enableVibrate: true,
        enableLights: true,
        sound: 'default',
        showBadge: true,
      });
      
      // Also create important channels for different notification types
      await Notifications.setNotificationChannelAsync('orders', {
        name: 'Orders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3B82F6',
      });
      
      await Notifications.setNotificationChannelAsync('messages', {
        name: 'Messages',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#8B5CF6',
      });
    }

    return token.data;

  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
}

/**
 * Save push token to Laravel backend
 */
async function savePushTokenToBackend(token: string) {
  try {
    const response = await api.post('/push-token', { token });
    console.log('✅ Push token saved to backend:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to save push token:', error.response?.data || error.message);
    // Don't throw, just log
    return null;
  }
}

/**
 * Remove push token from backend (on logout)
 */
export async function removePushToken() {
  try {
    await api.delete('/push-token');
    console.log('✅ Push token removed from backend');
  } catch (error: any) {
    console.error('❌ Failed to remove push token:', error.response?.data || error.message);
  }
}

/**
 * Listen for incoming push notifications
 */
export function setupNotificationListeners() {
  // Listen for notifications received while app is foregrounded
  const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
    console.log('📱 Notification received (foreground):', notification);
  });

  // Listen for user interaction with notifications
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('📱 Notification response:', response);
    const data = response.notification.request.content.data;
    
    // Navigate based on notification data
    handleNotificationNavigation(data);
  });

  return () => {
    foregroundSubscription.remove();
    responseSubscription.remove();
  };
}

/**
 * Handle navigation based on notification data
 */
function handleNotificationNavigation(data: any) {
  console.log('📱 Notification data for navigation:', data);
  
  // Example navigation logic
  if (data.screen === 'OrderDetails') {
    // Navigate to order details screen
    // navigation.navigate('OrderDetails', { orderId: data.orderId });
  } else if (data.screen === 'ChatScreen') {
    // Navigate to chat screen
    // navigation.navigate('Chat', { chatId: data.chatId });
  }
}

/**
 * Get current notification permissions status
 */
export async function getNotificationPermissionsStatus() {
  try {
    const settings = await Notifications.getPermissionsAsync();
    return settings;
  } catch (error) {
    console.error('Error getting notification permissions:', error);
    return null;
  }
}

/**
 * Schedule a local notification (for testing or reminders)
 */
export async function scheduleLocalNotification(title: string, body: string, data?: any) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: 'default',
      },
      trigger: null, // Send immediately
    });
    console.log('📱 Local notification scheduled');
  } catch (error) {
    console.error('Error scheduling local notification:', error);
  }
}