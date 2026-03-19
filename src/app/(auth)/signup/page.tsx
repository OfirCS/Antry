"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Github } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [invite, setInvite] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];
    if (!name) errs.push("name");
    if (!email || !email.includes("@")) errs.push("email");
    if (!password || password.length < 8) errs.push("password");
    setErrors(errs);
  };

  const bad = (f: string) => errors.includes(f);
  const inputCls = (f: string) => cn(
    "w-full px-3.5 py-2.5 bg-background-primary border rounded-lg text-[13px] outline-none transition-colors",
    bad(f) ? "border-red-400" : "border-border-secondary focus:border-accent text-text-primary placeholder:text-text-tertiary"
  );

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-[360px]">
      <h1 className="font-display text-[24px] text-text-primary mb-1">Join the colony</h1>
      <p className="text-[13px] text-text-tertiary mb-8">Create your builder profile</p>

      <div className="space-y-2 mb-5">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-border-secondary rounded-lg text-[13px] text-text-primary hover:bg-background-secondary transition-colors">
          <Github className="w-4 h-4" /> GitHub
        </button>
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-border-secondary rounded-lg text-[13px] text-text-primary hover:bg-background-secondary transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Google
        </button>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-border-tertiary" />
        <span className="text-[10px] font-mono text-text-tertiary">or</span>
        <div className="flex-1 h-px bg-border-tertiary" />
      </div>

      <form onSubmit={submit} className="space-y-2.5">
        <input type="text" value={name} onChange={(e) => { setName(e.target.value); setErrors((p) => p.filter((x) => x !== "name")); }} placeholder="Name" className={inputCls("name")} />
        <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors((p) => p.filter((x) => x !== "email")); }} placeholder="Email" className={inputCls("email")} />
        <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setErrors((p) => p.filter((x) => x !== "password")); }} placeholder="Password (8+ chars)" className={inputCls("password")} />
        <input type="text" value={invite} onChange={(e) => setInvite(e.target.value)} placeholder="Invite code (optional)"
          className="w-full px-3.5 py-2.5 bg-background-primary border border-border-secondary rounded-lg text-[13px] text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent transition-colors" />
        {errors.length > 0 && <p className="text-[11px] text-red-500">Fill in all required fields.</p>}
        <button type="submit" className="w-full px-4 py-2.5 bg-text-primary text-background-primary rounded-lg text-[13px] font-medium hover:opacity-85 transition-opacity">Create account</button>
      </form>

      <p className="text-center text-[12px] text-text-tertiary mt-6">
        Have an account? <Link href="/login" className="text-accent hover:underline">Sign in</Link>
      </p>
    </motion.div>
  );
}
