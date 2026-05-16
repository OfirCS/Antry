import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { attachAuthBypass, isAuthBypassEnabled } from "@/lib/auth-bypass";

export async function createClient() {
  const cookieStore = await cookies();

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component — can't set cookies.
            // Proxy will refresh the session on the next request.
          }
        },
      },
    }
  );

  if (!isAuthBypassEnabled()) {
    return client;
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return attachAuthBypass(client);
  }

  return attachAuthBypass(
    createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  ) as unknown as typeof client;
}

/**
 * Admin client using service role key — bypasses RLS.
 * Only use in server actions that require admin privileges (e.g., deleting auth users).
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
