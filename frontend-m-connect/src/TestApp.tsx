// Create a new file: src/TestApp.tsx
import React from 'react';
import { View, Text } from 'react-native';

export default function TestApp() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Test App - No Styling</Text>
      <Text style={{ marginTop: 20 }}>No SafeAreaView, No CSS Interop</Text>
    </View>
  );
}