import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { Heart, LogOut } from 'lucide-react-native';
import { formatDate } from '@hediyola/shared';
import { useAuth } from '../src/lib/auth-context';

/**
 * Home screen. Acts as the auth gate: unauthenticated users are redirected to
 * the login screen; authenticated couples see their companion dashboard stub.
 */
export default function HomeScreen() {
  const { session, loading, signOut } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator color="#C97D90" />
      </SafeAreaView>
    );
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  const name = (session.user.user_metadata?.full_name as string) ?? session.user.email;

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 px-6 pt-8">
        <View className="mb-6 self-start rounded-2xl bg-blush-50 p-4">
          <Heart color="#C97D90" size={28} />
        </View>
        <Text className="font-serif text-3xl font-bold text-ink">Merhaba, {name}</Text>
        <Text className="mt-2 text-base text-ink-soft">
          Misafirleriniz hediye gönderdikçe burada anında göreceksiniz.
        </Text>
        <Text className="mt-6 text-sm text-olive-600">Bugün: {formatDate(new Date())}</Text>

        <Pressable
          onPress={async () => {
            await signOut();
            router.replace('/login');
          }}
          className="mb-6 mt-auto flex-row items-center justify-center gap-2 rounded-xl border border-blush-300 py-3 active:opacity-80"
        >
          <LogOut color="#C97D90" size={18} />
          <Text className="text-base font-medium text-blush-700">Çıkış yap</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
