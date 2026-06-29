/**
 * Passcode hashing for private registries (server-only).
 *
 * Private-list passcodes are never stored in plain text. We use scrypt (a
 * memory-hard KDF from Node's crypto) with a per-passcode random salt, and a
 * constant-time comparison on verify. See SECURITY.md §7.
 */
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const KEYLEN = 64;

/** Hash a passcode → "salt:derivedKey" (both hex). */
export async function hashPasscode(passcode: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derived = (await scryptAsync(passcode, salt, KEYLEN)) as Buffer;
  return `${salt}:${derived.toString('hex')}`;
}

/** Verify a passcode against a stored "salt:hash" value, in constant time. */
export async function verifyPasscode(passcode: string, stored: string): Promise<boolean> {
  const [salt, key] = stored.split(':');
  if (!salt || !key) return false;
  const keyBuffer = Buffer.from(key, 'hex');
  const derived = (await scryptAsync(passcode, salt, KEYLEN)) as Buffer;
  if (derived.length !== keyBuffer.length) return false;
  return timingSafeEqual(derived, keyBuffer);
}
