"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Github } from "lucide-react";
import { cn } from "@/lib/utils";
import { login, signInWithGoogle, signInWithGithub, type AuthState } from "../actions";

export default function LoginPage() {
  return (
    <Suspense>
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <LoginForm />
      </div>
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "";
  const authError = searchParams.get("error");

  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    login,
    null
  );

  const hasFieldError = (field: string) =>
    (state?.fieldErrors?.[field]?.length ?? 0) > 0;

  const inputCls = (field: string) =>
    cn(
      "w-full px-5 py-4 bg-background-secondary border border-border-primary rounded-xl text-[15px] outline-none transition-all duration-300",
      hasFieldError(field)
        ? "border-red-400 focus:ring-2 focus:ring-red-400/20"
        : "focus:bg-surface focus:border-accent/40 focus:ring-4 focus:ring-accent/10 text-text-primary placeholder:text-text-tertiary"
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[440px] card-premium p-10 sm:p-12"
    >
      <div className="text-center mb-10">
        <h1 className="font-display text-[clamp(1.8rem,4vw,2.2rem)] font-bold text-text-primary mb-3 tracking-[-0.03em]">
          Welcome back
        </h1>
        <p className="text-[15px] text-text-secondary">Sign in to your builder account</p>
      </div>

      {authError === "auth" && (
        <p className="text-[13px] text-red-500 font-medium mb-6 text-center bg-red-500/10 py-3 rounded-lg">
          Authentication failed. Please try again.
        </p>
      )}

      <div className="space-y-3 mb-10">
        <form action={signInWithGoogle}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-surface border border-border-primary rounded-full text-[14px] font-bold text-text-primary hover:bg-background-secondary transition-all shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
        </form>
        <form action={signInWithGithub}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-surface border border-border-primary rounded-full text-[14px] font-bold text-text-primary hover:bg-background-secondary transition-all shadow-sm"
          >
            <Github className="w-5 h-5" /> Continue with GitHub
          </button>
        </form>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 h-px bg-border-primary" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-text-tertiary">or email</span>
        <div className="flex-1 h-px bg-border-primary" />
      </div>

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="redirect" value={redirectTo} />
        <div>
          <label className="block text-[12px] font-bold text-text-secondary uppercase tracking-[0.1em] mb-2 pl-1">
            Email address
          </label>
          <input
            type="email"
            name="email"
            placeholder="name@example.com"
            className={inputCls("email")}
          />
        </div>
        <div>
          <label className="block text-[12px] font-bold text-text-secondary uppercase tracking-[0.1em] mb-2 pl-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            className={inputCls("password")}
          />
        </div>
        {state?.error && (
          <p className="text-[13px] text-red-500 font-medium pl-1">{state.error}</p>
        )}
        {state?.fieldErrors &&
          Object.values(state.fieldErrors)
            .flat()
            .map((msg) => (
              <p key={msg} className="text-[13px] text-red-500 font-medium pl-1">
                {msg}
              </p>
            ))}
        <button
          type="submit"
          disabled={pending}
          className="w-full h-14 bg-text-primary text-background-primary rounded-full text-[15px] font-bold hover:opacity-90 transition-all duration-300 active:scale-[0.98] mt-4 disabled:opacity-50"
        >
          {pending ? "Signing in..." : "Sign in to Antry"}
        </button>
      </form>

      <p className="text-center text-[14px] text-text-tertiary mt-10">
        New here?{" "}
        <Link href="/signup" className="text-accent font-bold hover:underline">
          Create an account
        </Link>
      </p>
    </motion.div>
  );
}
