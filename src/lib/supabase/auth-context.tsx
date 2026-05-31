"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "./client";
import type { User } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const hasSupabaseEnv = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(hasSupabaseEnv);
  const supabase = useMemo(
    () => (hasSupabaseEnv ? createClient() : null),
    [hasSupabaseEnv]
  );

  useEffect(() => {
    if (!supabase) return;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
