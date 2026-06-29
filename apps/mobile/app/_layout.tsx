import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/lib/auth-context';

/** Root layout: provides auth state to the whole app and configures navigation. */
export default function RootLayout() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShadowVisible: false,
            headerStyle: { backgroundColor: '#FBF8F4' },
            headerTitleStyle: { color: '#2B2B33', fontWeight: '600' },
            contentStyle: { backgroundColor: '#FBF8F4' },
          }}
        >
          <Stack.Screen name="index" options={{ title: 'Hediyola' }} />
          <Stack.Screen name="login" options={{ title: 'Giriş Yap' }} />
          <Stack.Screen name="signup" options={{ title: 'Kayıt Ol' }} />
        </Stack>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
