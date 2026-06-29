import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { signUp } from '../src/lib/auth';

/** Email/password sign-up screen. */
export default function SignupScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    const res = await signUp(fullName, email, password);
    setLoading(false);
    if (!res.ok) {
      setError(res.error ?? 'Kayıt başarısız.');
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-cream px-6">
        <Text className="text-center font-serif text-2xl font-bold text-olive-600">
          Neredeyse hazır!
        </Text>
        <Text className="mt-2 text-center text-base text-ink-soft">
          E-postana gönderdiğimiz doğrulama bağlantısına tıklayarak hesabını etkinleştir.
        </Text>
        <Pressable onPress={() => router.replace('/login')} className="mt-6">
          <Text className="text-base font-medium text-blush-700">Girişe dön</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <View className="flex-1 justify-center px-6">
        <Text className="font-serif text-3xl font-bold text-ink">Hesap oluştur</Text>
        <Text className="mb-8 mt-2 text-base text-ink-soft">
          Birkaç dakikada hediye listeni hazırla.
        </Text>

        <Text className="mb-1.5 text-sm font-medium text-ink">Ad Soyad</Text>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          autoComplete="name"
          placeholder="Ayşe Yılmaz"
          placeholderTextColor="#9b9ba3"
          className="mb-4 h-12 rounded-xl border border-blush-100 bg-white px-4 text-ink"
        />

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
          autoComplete="new-password"
          className="h-12 rounded-xl border border-blush-100 bg-white px-4 text-ink"
        />
        <Text className="mt-1 text-xs text-ink-soft">
          En az 8 karakter; büyük harf, küçük harf ve rakam içermeli.
        </Text>

        {error && <Text className="mt-3 text-sm text-blush-700">{error}</Text>}

        <Pressable
          onPress={onSubmit}
          disabled={loading}
          className="mt-6 h-12 items-center justify-center rounded-xl bg-blush-500 active:opacity-80"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-base font-medium text-white">Kayıt ol</Text>
          )}
        </Pressable>

        <View className="mt-6 flex-row justify-center">
          <Text className="text-sm text-ink-soft">Zaten hesabın var mı? </Text>
          <Link href="/login" className="text-sm font-medium text-blush-700">
            Giriş yap
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
