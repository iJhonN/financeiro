import { createBrowserClient } from "@supabase/ssr";

import { env } from "@/env";

/**
 * Cliente Supabase para o navegador (chave anônima + RLS).
 * A sessão é gerida por cookies (padrão @supabase/ssr), nunca por localStorage.
 */
export function createClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
