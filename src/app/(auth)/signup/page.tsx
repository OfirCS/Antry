"use client";

import { useActionState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Github } from "lucide-react";
import { cn } from "@/lib/utils";
import { signup, signInWithGoogle, signInWithGithub, type AuthState } from "../actions";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    signup,
    null
  );

  const hasFieldError = (field: string) =>
    (state?.fieldErrors?.[field]?.length ?? 0) > 0;

  const inputCls = (field: string) =>
    cn(
      "w-full px-5 py-3.5 bg-background-secondary border border-border-primary shadow-sm rounded-lg text-[14px] font-medium outline-none transition-all duration-300",
      hasFieldError(field)
        ? "border-red-400 focus:ring-2 focus:ring-red-400/20"
        : "focus:border-accent/40 focus:ring-2 focus:ring-accent/20 text-text-primary placeholder:text-text-tertiary"
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-[420px] bg-surface p-10 rounded-lg border border-border-primary shadow-sm"
    >
      <div className="text-center mb-8">
        <h1 className="font-display text-[28px] text-text-primary mb-2 tracking-[-0.02em]">
          Join Antry
        </h1>
        <p className="text-[14px] text-text-secondary">Create your builder profile</p>
      </div>

      <div className="space-y-3 mb-8">
        <form action={signInWithGoogle}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-border-primary rounded-lg text-[14px] font-semibold text-text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300 ease-out"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign up with Google
          </button>
        </form>
        <form action={signInWithGithub}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-border-primary rounded-lg text-[14px] font-semibold text-text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300 ease-out"
          >
            <Github className="w-5 h-5" /> Sign up with GitHub
          </button>
        </form>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 h-px bg-border-primary" />
        <span className="text-[12px] font-medium text-text-tertiary">or use email</span>
        <div className="flex-1 h-px bg-border-primary" />
      </div>

      <form action={formAction} className="space-y-4">
        <div>
          <label className="block text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">
            Full name
          </label>
          <input
            type="text"
            name="name"
            placeholder="Alex Rivera"
            className={inputCls("name")}
          />
        </div>
        <div>
          <label className="block text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">
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
          <label className="block text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">
            Password
          </label>
          <input
            type="password"
            name="password"
            placeholder="Min. 8 characters"
            className={inputCls("password")}
          />
        </div>
        <div>
          <label className="block text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">
            Invite code <span className="normal-case font-normal">(optional)</span>
          </label>
          <input
            type="text"
            name="invite"
            placeholder="e.g. ANTRY-2026"
            className="w-full px-5 py-3.5 bg-background-secondary border border-border-primary shadow-sm rounded-lg text-[14px] font-medium text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/20 transition-all duration-300"
          />
        </div>
        {state?.error && (
          <p className="text-[12px] text-red-500 font-medium">{state.error}</p>
        )}
        {state?.fieldErrors &&
          Object.values(state.fieldErrors)
            .flat()
            .map((msg) => (
              <p key={msg} className="text-[12px] text-red-500 font-medium">
                {msg}
              </p>
            ))}
        <button
          type="submit"
          disabled={pending}
          className="w-full px-4 py-3.5 bg-text-primary text-background-primary rounded-lg text-[14px] font-semibold hover:opacity-80 transition-all duration-300 active:scale-[0.98] mt-2 disabled:opacity-50"
        >
          {pending ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-center text-[14px] text-text-secondary mt-10">
        Already have an account?{" "}
        <Link href="/login" className="text-accent font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
