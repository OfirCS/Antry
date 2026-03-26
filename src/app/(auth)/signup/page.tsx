"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Code2, Building2, TrendingUp, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { signup, signInWithGoogle, signInWithGithub, type AuthState } from "../actions";

const roles = [
  {
    id: "builder",
    icon: Code2,
    title: "Builder",
    description: "Ship projects, build your reputation, and get discovered by companies.",
    color: "#3B82F6",
  },
  {
    id: "company",
    icon: Building2,
    title: "Company",
    description: "Find and hire proven builders based on their shipped work.",
    color: "#8B5CF6",
  },
  {
    id: "investor",
    icon: TrendingUp,
    title: "Investor",
    description: "Discover promising startups and ideas from verified builders.",
    color: "#10B981",
  },
] as const;

const ease = [0.16, 1, 0.3, 1] as const;

export default function SignupPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    signup,
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
    <div className="min-h-[80vh] flex items-center justify-center p-6 py-12">
      <AnimatePresence mode="wait">
        {!selectedRole ? (
          /* Step 1: Role Selection */
          <motion.div
            key="role-select"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease }}
            className="w-full max-w-[520px]"
          >
            <div className="text-center mb-8">
              <h1 className="font-display text-[clamp(1.8rem,4vw,2.4rem)] font-bold text-text-primary mb-3 tracking-[-0.03em]">
                Join the Network
              </h1>
              <p className="text-[15px] text-text-secondary">
                How will you use Antry?
              </p>
            </div>

            <div className="space-y-3">
              {roles.map((role) => (
                <motion.button
                  key={role.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedRole(role.id)}
                  className="w-full group rounded-xl border border-border-primary bg-surface p-5 flex items-center gap-4 hover:border-text-tertiary/30 hover:shadow-md transition-all text-left"
                >
                  <div
                    className="h-11 w-11 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${role.color}10` }}
                  >
                    <role.icon className="h-5 w-5" style={{ color: role.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[16px] font-semibold text-text-primary mb-0.5">
                      {role.title}
                    </h3>
                    <p className="text-[13px] text-text-tertiary leading-relaxed">
                      {role.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-text-tertiary group-hover:text-text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </motion.button>
              ))}
            </div>

            <p className="text-center text-[14px] text-text-tertiary mt-8">
              Already have an account?{" "}
              <Link href="/login" className="text-accent font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </motion.div>
        ) : (
          /* Step 2: Account Creation */
          <motion.div
            key="signup-form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease }}
            className="w-full max-w-[440px] card-premium p-10 sm:p-12"
          >
            <button
              onClick={() => setSelectedRole(null)}
              className="flex items-center gap-1.5 text-[13px] text-text-tertiary hover:text-text-primary transition-colors mb-6"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>

            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-3">
                {(() => {
                  const role = roles.find((r) => r.id === selectedRole);
                  if (!role) return null;
                  return (
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold"
                      style={{ backgroundColor: `${role.color}10`, color: role.color }}
                    >
                      <role.icon className="h-3.5 w-3.5" />
                      {role.title}
                    </span>
                  );
                })()}
              </div>
              <h1 className="font-display text-[clamp(1.6rem,3.5vw,2rem)] font-bold text-text-primary mb-2 tracking-[-0.03em]">
                Create your account
              </h1>
              <p className="text-[14px] text-text-secondary">
                {selectedRole === "builder" && "Start shipping and get discovered"}
                {selectedRole === "company" && "Find and hire top builders"}
                {selectedRole === "investor" && "Discover the next big startup"}
              </p>
            </div>

            <div className="space-y-3 mb-8">
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

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-border-primary" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-text-tertiary">or email</span>
              <div className="flex-1 h-px bg-border-primary" />
            </div>

            <form action={formAction} className="space-y-4">
              <input type="hidden" name="role" value={selectedRole} />
              <div>
                <label className="block text-[12px] font-bold text-text-secondary uppercase tracking-[0.1em] mb-2 pl-1">
                  {selectedRole === "company" ? "Company name" : "Full name"}
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder={selectedRole === "company" ? "Acme Corp" : "Alex Rivera"}
                  className={inputCls("name")}
                />
              </div>
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
                  placeholder="Min. 8 characters"
                  className={inputCls("password")}
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-text-secondary uppercase tracking-[0.1em] mb-2 pl-1">
                  Invite code <span className="normal-case font-medium text-text-tertiary tracking-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  name="invite"
                  placeholder="e.g. ANTRY-2026"
                  className="w-full px-5 py-4 bg-background-secondary border border-border-primary rounded-xl text-[15px] outline-none text-text-primary placeholder:text-text-tertiary focus:bg-surface focus:border-accent/40 focus:ring-4 focus:ring-accent/10 transition-all duration-300"
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
                className="w-full h-14 bg-text-primary text-background-primary rounded-full text-[15px] font-bold hover:opacity-90 transition-all duration-300 active:scale-[0.98] mt-3 disabled:opacity-50"
              >
                {pending ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="text-center text-[14px] text-text-tertiary mt-8">
              Already have an account?{" "}
              <Link href="/login" className="text-accent font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
