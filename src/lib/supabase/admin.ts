import "server-only";

import { createClient } from "@supabase/supabase-js";

import { env } from "@/env";

/**
 * Cliente Supabase com service_role (bypass de RLS).
 * ESTRITAMENTE server-only: usar apenas em Route Handlers admin auditados
 * e webhooks. Nunca importar em componentes ou código de cliente.
 */
export function createAdminClient() {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
