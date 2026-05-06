"use client";

import { useActionState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { resetPassword, type AuthState } from "../actions";

function LoadingSpinner() {
  return (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(resetPassword, null);

  const baseInputStyles =
    "w-full px-4 h-[48px] bg-white border rounded-xl text-[15px] outline-none placeholder:text-gray-400";

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#111111";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(198, 241, 53, 0.2)";
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#EBEBEB";
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-[420px] mx-auto">
      <motion.div variants={itemVariants} className="mb-10">
        <h1 className="text-[32px] font-bold text-black tracking-tight font-display">Reset your password</h1>
        <p className="text-[15px] text-gray-500 mt-2">
          Enter your email and we&apos;ll send you a secure reset link.
        </p>
      </motion.div>

      <motion.form variants={itemVariants} action={formAction} className="space-y-5">
        <div>
          <label className="block text-[13px] font-medium text-gray-600 mb-2">Email address</label>
          <input
            type="email"
            name="email"
            required
            placeholder="name@example.com"
            className={`${baseInputStyles} border-gray-200 text-gray-900`}
            style={{ transition: "border-color 0.3s ease, box-shadow 0.3s ease" }}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>

        {state?.error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3"
          >
            <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            </svg>
            <p className="text-[13px] text-red-700 font-medium">{state.error}</p>
          </motion.div>
        )}

        {state?.success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 rounded-xl px-4 py-3"
            style={{ background: "rgba(198, 241, 53, 0.15)", border: "1px solid rgba(198, 241, 53, 0.4)" }}
          >
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="#0A0A0A" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-[13px] text-black font-medium">{state.success}</p>
          </motion.div>
        )}

        {state?.fieldErrors &&
          Object.values(state.fieldErrors)
            .flat()
            .map((msg) => (
              <p key={msg} className="text-[13px] text-red-600 font-medium">
                {msg}
              </p>
            ))}

        <motion.button
          type="submit"
          disabled={pending}
          whileHover={pending ? {} : { scale: 1.005, boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
          whileTap={pending ? {} : { scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="w-full h-[52px] rounded-xl bg-black text-white text-[15px] font-medium transition-colors duration-200 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed mt-1 flex items-center justify-center"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }}
        >
          {pending && <LoadingSpinner />}
          {pending ? "Sending..." : "Send reset link"}
        </motion.button>
      </motion.form>

      <motion.p variants={itemVariants} className="text-center text-[14px] text-gray-400 mt-10">
        Remembered it?{" "}
        <Link href="/login" className="text-black font-semibold hover:underline underline-offset-2">
          Sign in
        </Link>
      </motion.p>
    </motion.div>
  );
}
