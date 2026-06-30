/**
 * Mobile Supabase client (anon key, RLS-bound).
 *
 * Security: auth tokens are persisted in expo-secure-store (encrypted
 * keychain/keystore), NEVER in plain AsyncStorage. See SECURITY.md §3.
 *
 * When EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY are not set,
 * we fall back to placeholders so the app bundle can compile and run in demo mode.
 */
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

/** SecureStore-backed storage adapter for Supabase auth. */
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'placeholder-anon-key';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_KEY;

export const supabase = createClient(url, anonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/** Returns true when Supabase is configured (not just placeholders). */
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.EXPO_PUBLIC_SUPABASE_URL &&
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  );
}
