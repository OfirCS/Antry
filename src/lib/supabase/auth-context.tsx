"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "./client";
import type { User } from "@supabase/supabase-js";
import { AUTH_BYPASS_USER, isAuthBypassEnabled } from "@/lib/auth-bypass";

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const bypassAuth = isAuthBypassEnabled();
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const [user, setUser] = useState<User | null>(
    bypassAuth ? AUTH_BYPASS_USER : null
  );
  const [loading, setLoading] = useState(!bypassAuth && supabaseConfigured);
  const supabase = bypassAuth || !supabaseConfigured ? null : createClient();

  useEffect(() => {
    if (bypassAuth || !supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [bypassAuth, supabase]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
