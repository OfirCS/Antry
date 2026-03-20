"use client";

import { useActionState, useEffect, useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/supabase/auth-context";
import { createClient } from "@/lib/supabase/client";
import { updateProfile, deleteAccount, type FormState } from "../actions";

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);

  const [state, formAction, pending] = useActionState<FormState, FormData>(
    updateProfile,
    null
  );

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="max-w-[600px] mx-auto px-8 py-20">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-border-secondary rounded-lg w-48" />
          <div className="h-4 bg-border-secondary rounded-lg w-72" />
          <div className="h-12 bg-border-secondary rounded-lg w-full mt-8" />
          <div className="h-12 bg-border-secondary rounded-lg w-full" />
          <div className="h-12 bg-border-secondary rounded-lg w-full" />
        </div>
      </div>
    );
  }

  const hasFieldError = (field: string) =>
    (state?.fieldErrors?.[field]?.length ?? 0) > 0;

  const fieldError = (field: string) => state?.fieldErrors?.[field]?.[0];

  const inputCls = (field: string) =>
    cn(
      "w-full px-5 py-3.5 bg-background-secondary border border-black/5 dark:border-white/5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] rounded-2xl text-[14px] font-medium outline-none transition-all duration-300",
      hasFieldError(field)
        ? "border-red-400 focus:ring-2 focus:ring-red-400/20"
        : "focus:border-accent/40 focus:ring-2 focus:ring-accent/20 text-text-primary placeholder:text-text-tertiary"
    );

  return (
    <div className="max-w-[600px] mx-auto px-8 py-10 md:py-16">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-[12px] text-text-tertiary hover:text-text-primary transition-colors mb-8 font-medium"
      >
        <ArrowLeft className="w-3 h-3" /> Dashboard
      </Link>

      <h1 className="font-display text-[28px] text-text-primary mb-2 tracking-[-0.02em]">
        Settings
      </h1>
      <p className="text-[14px] text-text-secondary mb-10">
        Manage your profile and account.
      </p>

      {state?.success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-[13px] text-green-600 dark:bg-green-900/10 dark:border-green-800">
          Profile updated.
        </div>
      )}

      {state?.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-600 dark:bg-red-900/10 dark:border-red-800">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-6">
        <div className="text-[12px] font-semibold text-text-tertiary uppercase tracking-wider">
          Profile
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">
            Full name *
          </label>
          <input
            type="text"
            name="full_name"
            defaultValue={profile?.full_name || ""}
            placeholder="Your name"
            className={inputCls("full_name")}
          />
          {fieldError("full_name") && (
            <p className="text-[11px] text-red-500 mt-1">{fieldError("full_name")}</p>
          )}
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">
            Username *
          </label>
          <input
            type="text"
            name="username"
            defaultValue={profile?.username || ""}
            placeholder="your-username"
            className={inputCls("username")}
          />
          {fieldError("username") && (
            <p className="text-[11px] text-red-500 mt-1">{fieldError("username")}</p>
          )}
          <p className="text-[11px] text-text-tertiary mt-1">
            antry.dev/builders/{profile?.username || "your-username"}
          </p>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">
            Bio
          </label>
          <textarea
            name="bio"
            rows={3}
            defaultValue={profile?.bio || ""}
            placeholder="Tell others what you build"
            className={cn(inputCls("bio"), "resize-none")}
          />
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">
            Skills
          </label>
          <input
            type="text"
            name="skills"
            defaultValue={profile?.skills?.join(", ") || ""}
            placeholder="React, TypeScript, Python (comma-separated)"
            className={inputCls("skills")}
          />
        </div>

        <div className="text-[12px] font-semibold text-text-tertiary uppercase tracking-wider pt-4">
          Links
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">
            GitHub
          </label>
          <input
            type="url"
            name="github_url"
            defaultValue={profile?.github_url || ""}
            placeholder="https://github.com/..."
            className={inputCls("github_url")}
          />
          {fieldError("github_url") && (
            <p className="text-[11px] text-red-500 mt-1">{fieldError("github_url")}</p>
          )}
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">
            Twitter / X
          </label>
          <input
            type="url"
            name="twitter_url"
            defaultValue={profile?.twitter_url || ""}
            placeholder="https://twitter.com/..."
            className={inputCls("twitter_url")}
          />
          {fieldError("twitter_url") && (
            <p className="text-[11px] text-red-500 mt-1">{fieldError("twitter_url")}</p>
          )}
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-2">
            Website
          </label>
          <input
            type="url"
            name="website_url"
            defaultValue={profile?.website_url || ""}
            placeholder="https://..."
            className={inputCls("website_url")}
          />
          {fieldError("website_url") && (
            <p className="text-[11px] text-red-500 mt-1">{fieldError("website_url")}</p>
          )}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="px-6 py-3.5 bg-accent text-white rounded-full text-[14px] font-semibold hover:shadow-[0_4px_14px_0_rgba(232,89,12,0.2)] dark:hover:shadow-[0_4px_14px_0_rgba(249,115,22,0.2)] hover:opacity-90 transition-all duration-300 ease-out disabled:opacity-50"
          >
            {pending ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>

      {/* Account */}
      <div className="mt-16 pt-8 border-t border-border-primary">
        <div className="text-[12px] font-semibold text-text-tertiary uppercase tracking-wider mb-4">
          Account
        </div>
        <div className="text-[14px] text-text-secondary mb-6">
          Signed in as{" "}
          <span className="text-text-primary font-medium">{user?.email}</span>
        </div>

        {!showDelete ? (
          <button
            onClick={() => setShowDelete(true)}
            className="text-[14px] text-red-400 hover:text-red-600 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete account
          </button>
        ) : (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl dark:bg-red-900/10 dark:border-red-800">
            <p className="text-[13px] text-red-600 mb-4">
              This will permanently delete your account, profile, and all
              projects. This cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <form action={deleteAccount}>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-[13px] font-semibold hover:bg-red-700 transition-colors"
                >
                  Yes, delete my account
                </button>
              </form>
              <button
                onClick={() => setShowDelete(false)}
                className="text-[13px] text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
