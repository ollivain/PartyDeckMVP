import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors } from '@/constants/theme';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.bg },
          animation: 'default',
        }}
      >
        <Stack.Screen name="camera" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
      </Stack>
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}
