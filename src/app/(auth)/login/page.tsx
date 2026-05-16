"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Github } from "lucide-react";
import { login, signInWithGoogle, signInWithGithub, type AuthState } from "../actions";

/* ── Spinner component ────────────────────────────────────────────── */
function LoadingSpinner() {
  return (
    <svg
      className="animate-spin -ml-1 mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/* ── Staggered children animation ─────────────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "";
  const authError = searchParams.get("error");

  const [state, formAction, pending] = useActionState<AuthState, FormData>(login, null);

  const hasFieldError = (field: string) =>
    (state?.fieldErrors?.[field]?.length ?? 0) > 0;

  const baseInputStyles =
    "w-full px-4 h-[48px] bg-white border rounded-md text-[15px] outline-none placeholder:text-gray-400";

  const inputCls = (field: string) =>
    hasFieldError(field)
      ? `${baseInputStyles} border-red-300 focus:border-red-400`
      : `${baseInputStyles} border-gray-200 text-gray-900`;

  /* Inline style for enhanced focus glow */
  const inputFocusStyle = (field: string): React.CSSProperties => ({
    transition: "border-color 0.3s ease, box-shadow 0.3s ease, background-color 0.2s ease",
    ...(hasFieldError(field)
      ? {}
      : {}),
  });

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>, isError: boolean) => {
    if (isError) {
      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(239, 68, 68, 0.1)";
    } else {
      e.currentTarget.style.borderColor = "#111111";
      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(17, 24, 39, 0.06)";
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>, isError: boolean) => {
    if (isError) {
      e.currentTarget.style.boxShadow = "none";
    } else {
      e.currentTarget.style.borderColor = "#E5E7EB";
      e.currentTarget.style.boxShadow = "none";
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-[420px] mx-auto"
    >
      {/* Heading */}
      <motion.div variants={itemVariants} className="mb-10">
        <h1 className="text-[32px] font-bold text-black tracking-tight font-display">
          Welcome back
        </h1>
        <p className="text-[15px] text-gray-500 mt-2">
          Sign in to your builder account
        </p>
      </motion.div>

      {/* Auth error banner */}
      {authError === "auth" && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 flex items-center gap-3 rounded-md bg-red-50 border border-red-200 px-4 py-3.5"
        >
          <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
          </svg>
          <p className="text-[13px] text-red-700 font-medium">
            Authentication failed. Please try again.
          </p>
        </motion.div>
      )}

      {/* OAuth buttons */}
      <motion.div variants={itemVariants} className="space-y-3 mb-8">
        <form action={signInWithGoogle}>
          <motion.button
            type="submit"
            whileHover={{ y: -1, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
            whileTap={{ scale: 0.985 }}
            transition={{ duration: 0.2 }}
            className="w-full flex items-center justify-center gap-3 rounded-md border border-gray-200 bg-white px-4 h-[48px] text-[14px] font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50 hover:border-gray-300"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </motion.button>
        </form>

        <form action={signInWithGithub}>
          <motion.button
            type="submit"
            whileHover={{ y: -1, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
            whileTap={{ scale: 0.985 }}
            transition={{ duration: 0.2 }}
            className="w-full flex items-center justify-center gap-3 rounded-md border border-gray-200 bg-white px-4 h-[48px] text-[14px] font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50 hover:border-gray-300"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
          >
            <Github className="w-[18px] h-[18px]" />
            Continue with GitHub
          </motion.button>
        </form>
      </motion.div>

      {/* Divider */}
      <motion.div variants={itemVariants} className="flex items-center gap-4 mb-8">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-[12px] font-medium text-gray-400 uppercase tracking-wider">or email</span>
        <div className="flex-1 h-px bg-gray-200" />
      </motion.div>

      {/* Email form */}
      <motion.form variants={itemVariants} action={formAction} className="space-y-5">
        <input type="hidden" name="redirect" value={redirectTo} />

        <div>
          <label className="block text-[13px] font-medium text-gray-600 mb-2">
            Email address
          </label>
          <input
            type="email"
            name="email"
            placeholder="name@example.com"
            className={inputCls("email")}
            style={inputFocusStyle("email")}
            onFocus={(e) => handleFocus(e, hasFieldError("email"))}
            onBlur={(e) => handleBlur(e, hasFieldError("email"))}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[13px] font-medium text-gray-600">
              Password
            </label>
            <Link
              href="/reset-password"
              className="text-[12px] text-gray-400 hover:text-gray-600 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            className={inputCls("password")}
            style={inputFocusStyle("password")}
            onFocus={(e) => handleFocus(e, hasFieldError("password"))}
            onBlur={(e) => handleBlur(e, hasFieldError("password"))}
          />
        </div>

        {/* Errors */}
        {state?.error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[13px] text-red-600 font-medium"
          >
            {state.error}
          </motion.p>
        )}
        {state?.fieldErrors &&
          Object.values(state.fieldErrors)
            .flat()
            .map((msg) => (
              <motion.p
                key={msg}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[13px] text-red-600 font-medium"
              >
                {msg}
              </motion.p>
            ))}

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={pending}
          whileHover={pending ? {} : { scale: 1.005, boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
          whileTap={pending ? {} : { scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="w-full h-[52px] rounded-md bg-black text-white text-[15px] font-medium transition-colors duration-200 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed mt-1 flex items-center justify-center"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }}
        >
          {pending && <LoadingSpinner />}
          {pending ? "Signing in..." : "Sign in"}
        </motion.button>
      </motion.form>

      {/* Footer link */}
      <motion.p variants={itemVariants} className="text-center text-[14px] text-gray-400 mt-10">
        New here?{" "}
        <Link
          href="/signup"
          className="text-black font-semibold hover:underline underline-offset-2"
        >
          Create an account
        </Link>
      </motion.p>
    </motion.div>
  );
}
