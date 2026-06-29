/**
 * @hediyola/db — public entrypoint.
 *
 * - `prisma`           : server-only ORM client.
 * - `createSupabaseClient` : anon client (web/mobile, RLS-bound).
 * - `getSupabaseAdmin` : service-role client (server-only, bypasses RLS).
 */
export { prisma } from './prisma.js';
export * from './prisma.js';
export { createSupabaseClient, getSupabaseEnv } from './supabase.js';
export { getSupabaseAdmin } from './supabase-admin.js';
export type { SupabaseClient } from './supabase.js';
