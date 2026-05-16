"use client";

import { useActionState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, Mail } from "lucide-react";
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
    "w-full px-4 h-[48px] bg-white border rounded-md text-[15px] outline-none placeholder:text-gray-400";

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#0A0A0A";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(17, 24, 39, 0.06)";
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#E5E7EB";
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-[420px] mx-auto">
      <motion.div variants={itemVariants} className="mb-8">
        <div
          className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-5"
          style={{
            background: "#F7F8FA",
            border: "1px solid #E5E7EB",
          }}
        >
          <Mail className="w-5 h-5" style={{ color: "#0A0A0A" }} />
        </div>
        <h1 className="text-[clamp(1.8rem,4vw,2rem)] font-bold text-black tracking-[-0.025em] font-display leading-[1.1]">
          Reset your password
        </h1>
        <p className="text-[15px] text-gray-500 mt-3 leading-relaxed">
          Enter your email and we&apos;ll send you a secure reset link. Lands in your inbox in seconds.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {state?.success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-md px-5 py-6 relative overflow-hidden"
            style={{
              background: "rgba(32, 245, 160, 0.12)",
              border: "1px solid rgba(32, 245, 160, 0.24)",
            }}
          >
            <div className="relative flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "#0A0A0A" }} />
              <div>
                <p className="text-[14px] font-semibold text-black leading-[1.5]">{state.success}</p>
                <p className="mt-2 text-[13px] text-gray-700">
                  Check your spam folder if it doesn&apos;t arrive in 5 minutes. Still missing? Email{" "}
                  <a className="font-semibold underline" href="mailto:[email protected]">support@antry</a>.
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            variants={itemVariants}
            action={formAction}
            className="space-y-5"
          >
            <div>
              <label className="block text-[13px] font-medium text-gray-600 mb-2">Email address</label>
              <input
                type="email"
                name="email"
                required
                placeholder="name@example.com"
                className={`${baseInputStyles} border-gray-200 text-gray-900`}
                style={{ transition: "border-color 0.25s ease, box-shadow 0.25s ease" }}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            {state?.error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 rounded-md bg-red-50 border border-red-200 px-4 py-3"
              >
                <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                </svg>
                <p className="text-[13px] text-red-700 font-medium">{state.error}</p>
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
              whileHover={pending ? {} : { scale: 1.005 }}
              whileTap={pending ? {} : { scale: 0.985 }}
              transition={{ duration: 0.15 }}
              className="w-full h-[52px] rounded-md text-[15px] font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: "#0A0A0A",
                color: "#fff",
                boxShadow: "none",
              }}
            >
              {pending ? (
                <>
                  <LoadingSpinner /> Sending...
                </>
              ) : (
                <>
                  Send reset link <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      <motion.p variants={itemVariants} className="text-center text-[14px] text-gray-400 mt-10">
        Remembered it?{" "}
        <Link href="/login" className="text-black font-semibold hover:underline underline-offset-2">
          Sign in
        </Link>
      </motion.p>
    </motion.div>
  );
}
