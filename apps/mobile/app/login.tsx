import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { signIn } from '../src/lib/auth';

/** Email/password login screen. */
export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    const res = await signIn(email, password);
    setLoading(false);
    if (!res.ok) {
      setError(res.error ?? 'Giriş başarısız.');
      return;
    }
    router.replace('/');
  }

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 justify-center px-6">
        <Text className="font-serif text-3xl font-bold text-ink">Tekrar hoş geldin</Text>
        <Text className="mb-8 mt-2 text-base text-ink-soft">Listeni yönetmek için giriş yap.</Text>

        <Text className="mb-1.5 text-sm font-medium text-ink">E-posta</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          placeholder="ad@ornek.com"
          placeholderTextColor="#9b9ba3"
          className="mb-4 h-12 rounded-xl border border-blush-100 bg-white px-4 text-ink"
        />

        <Text className="mb-1.5 text-sm font-medium text-ink">Parola</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="current-password"
          className="h-12 rounded-xl border border-blush-100 bg-white px-4 text-ink"
        />

        {error && <Text className="mt-3 text-sm text-blush-700">{error}</Text>}

        <Pressable
          onPress={onSubmit}
          disabled={loading}
          className="mt-6 h-12 items-center justify-center rounded-xl bg-blush-500 active:opacity-80"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-base font-medium text-white">Giriş yap</Text>
          )}
        </Pressable>

        <View className="mt-6 flex-row justify-center">
          <Text className="text-sm text-ink-soft">Hesabın yok mu? </Text>
          <Link href="/signup" className="text-sm font-medium text-blush-700">
            Kayıt ol
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
