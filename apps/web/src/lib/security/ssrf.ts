/**
 * SSRF protection helpers (server-only).
 *
 * Before fetching any user-supplied URL (custom-link scraper), we resolve its
 * hostname and reject private, loopback, link-local, and cloud-metadata IP
 * ranges so an attacker cannot make the server reach internal resources.
 * See SECURITY.md §4.
 */
import { lookup } from 'node:dns/promises';

/** True if an IPv4/IPv6 address is private, loopback, link-local, or reserved. */
export function isBlockedIp(ip: string): boolean {
  // IPv6
  if (ip.includes(':')) {
    const lower = ip.toLowerCase();
    if (lower === '::1' || lower === '::') return true; // loopback / unspecified
    if (lower.startsWith('fe80')) return true; // link-local
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true; // unique-local fc00::/7
    // IPv4-mapped IPv6 (::ffff:a.b.c.d)
    const mapped = lower.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isBlockedIp(mapped[1]!);
    return false;
  }

  // IPv4
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return true;
  const [a, b] = parts as [number, number, number, number];
  if (a === 0) return true; // 0.0.0.0/8
  if (a === 10) return true; // 10/8
  if (a === 127) return true; // loopback
  if (a === 169 && b === 254) return true; // link-local + AWS metadata 169.254.169.254
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16/12
  if (a === 192 && b === 168) return true; // 192.168/16
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT 100.64/10
  return false;
}

/** Resolve a hostname and ensure NONE of its addresses are blocked. */
export async function assertSafeHost(hostname: string): Promise<void> {
  const addrs = await lookup(hostname, { all: true });
  if (addrs.length === 0) throw new Error('DNS_UNRESOLVED');
  for (const { address } of addrs) {
    if (isBlockedIp(address)) throw new Error('BLOCKED_IP');
  }
}
