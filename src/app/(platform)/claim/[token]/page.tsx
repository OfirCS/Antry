"use client";

import { useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/supabase/auth-context";
import { claimProject } from "../../admin/discovery/actions";

export default function ClaimPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [error, setError] = useState("");
  const [claimed, setClaimed] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleClaim() {
    setError("");
    startTransition(async () => {
      const result = await claimProject(token);
      if (result.success) {
        setClaimed(true);
        setTimeout(() => router.push(`/projects/${result.projectId}`), 2000);
      } else {
        setError(result.error || "Failed to claim project");
      }
    });
  }

  if (authLoading) {
    return (
      <div className="max-w-[600px] mx-auto px-6 py-20">
        <div className="animate-pulse space-y-3">
          <div className="h-7 bg-background-secondary rounded-lg w-48" />
          <div className="h-4 bg-background-secondary rounded-lg w-72" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-[600px] mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-md border border-border-primary bg-surface p-10"
        >
          <AlertCircle className="w-10 h-10 text-text-tertiary mx-auto mb-4" />
          <h1 className="text-[20px] font-semibold text-text-primary mb-2">
            Sign in to claim this project
          </h1>
          <p className="text-[14px] text-text-secondary mb-6">
            You need an Antry account to claim ownership of this discovered
            project.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button asChild>
              <a href={`/login?redirect=/claim/${token}`}>Log in</a>
            </Button>
            <Button variant="outline" asChild>
              <a href={`/signup?redirect=/claim/${token}`}>Sign up</a>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (claimed) {
    return (
      <div className="max-w-[600px] mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-md border border-green-200 bg-green-50 p-10"
        >
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <h1 className="text-[20px] font-semibold text-green-900 mb-2">
            Project claimed!
          </h1>
          <p className="text-[14px] text-green-700">
            Redirecting you to your project page...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-[600px] mx-auto px-6 py-16 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold tracking-tight text-text-primary mb-2">
          Claim your project
        </h1>
        <p className="text-[14px] text-text-secondary mb-8">
          This project was discovered by the Antry Discovery Agent. Confirm
          ownership to add it to your profile.
        </p>

        <div className="rounded-md border border-border-primary bg-surface p-6 mb-6">
          <p className="text-[13px] text-text-tertiary mb-4">
            Click the button below to claim this project. It will be added to
            your Antry profile and visible in the project directory.
          </p>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-[13px] text-red-700">
              {error}
            </div>
          )}

          <Button
            onClick={handleClaim}
            disabled={isPending}
            className="w-full"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            Confirm &amp; claim project
          </Button>
        </div>

        <p className="text-[12px] text-text-tertiary text-center">
          By claiming, you confirm you are the owner or authorized contributor
          of this project.
        </p>
      </motion.div>
    </div>
  );
}
