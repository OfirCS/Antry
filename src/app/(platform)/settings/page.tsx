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
      <div className="max-w-[700px] mx-auto px-8 py-24">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-border-secondary rounded-lg w-48" />
          <div className="h-14 bg-border-secondary rounded-xl w-full mt-10" />
          <div className="h-14 bg-border-secondary rounded-xl w-full" />
        </div>
      </div>
    );
  }

  const hasFieldError = (field: string) =>
    (state?.fieldErrors?.[field]?.length ?? 0) > 0;

  const fieldError = (field: string) => state?.fieldErrors?.[field]?.[0];

  const inputCls = (field: string) =>
    cn(
      "w-full px-5 py-3.5 bg-background-secondary border border-border-primary shadow-sm rounded-xl text-[14px] font-medium outline-none transition-all duration-300",
      hasFieldError(field)
        ? "border-red-400 focus:ring-2 focus:ring-red-400/20"
        : "focus:bg-surface focus:border-accent/40 focus:ring-4 focus:ring-accent/10 text-text-primary placeholder:text-text-tertiary"
    );

  return (
    <div className="max-w-[700px] mx-auto px-6 py-16 md:py-24">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-text-tertiary hover:text-text-primary transition-colors mb-10"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </Link>

      <div className="mb-12">
        <h1 className="font-display text-[clamp(2rem,4vw,2.5rem)] text-text-primary mb-3 tracking-[-0.03em] font-bold">
          Account Settings
        </h1>
        <p className="text-[16px] text-text-secondary leading-relaxed">
          Manage your builder identity, connected networks, and preferences.
        </p>
      </div>

      {state?.success && (
        <div className="mb-8 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[14px] font-medium text-emerald-600">
          Profile updated successfully.
        </div>
      )}

      {state?.error && (
        <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-xl text-[14px] font-medium text-red-500">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-10 card-premium p-8 sm:p-10">
        <div>
          <h2 className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest mb-6 border-b border-border-tertiary pb-4">
            Builder Profile
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-[0.1em] mb-2.5 pl-1">
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
                <p className="text-[12px] font-medium text-red-500 mt-2 pl-1">{fieldError("full_name")}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-[0.1em] mb-2.5 pl-1">
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
                <p className="text-[12px] font-medium text-red-500 mt-2 pl-1">{fieldError("username")}</p>
              )}
              <p className="text-[12px] text-text-tertiary mt-2 pl-1 font-mono">
                antry.dev/builders/{profile?.username || "username"}
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-[0.1em] mb-2.5 pl-1">
                Bio
              </label>
              <textarea
                name="bio"
                rows={4}
                defaultValue={profile?.bio || ""}
                placeholder="Tell others what you build and care about"
                className={cn(inputCls("bio"), "resize-none")}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-[0.1em] mb-2.5 pl-1">
                Skills
              </label>
              <input
                type="text"
                name="skills"
                defaultValue={profile?.skills?.join(", ") || ""}
                placeholder="React, TypeScript, Go (comma-separated)"
                className={inputCls("skills")}
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest mb-6 border-b border-border-tertiary pb-4">
            Network Links
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-[0.1em] mb-2.5 pl-1">
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
                <p className="text-[12px] font-medium text-red-500 mt-2 pl-1">{fieldError("github_url")}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-[0.1em] mb-2.5 pl-1">
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
                <p className="text-[12px] font-medium text-red-500 mt-2 pl-1">{fieldError("twitter_url")}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-[0.1em] mb-2.5 pl-1">
                Personal Website
              </label>
              <input
                type="url"
                name="website_url"
                defaultValue={profile?.website_url || ""}
                placeholder="https://..."
                className={inputCls("website_url")}
              />
              {fieldError("website_url") && (
                <p className="text-[12px] font-medium text-red-500 mt-2 pl-1">{fieldError("website_url")}</p>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-border-tertiary">
          <button
            type="submit"
            disabled={pending}
            className="w-full sm:w-auto px-8 py-4 bg-text-primary text-background-primary rounded-full text-[14px] font-bold hover:opacity-90 transition-all duration-300 ease-out disabled:opacity-50 shadow-md"
          >
            {pending ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="mt-16 pt-10 border-t border-border-tertiary">
        <h2 className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest mb-6">
          System State
        </h2>
        <div className="card-premium p-8 sm:p-10 border-red-500/20 bg-red-500/5">
          <div className="mb-8">
            <h3 className="text-[16px] font-bold text-text-primary mb-2">Connected Account</h3>
            <p className="text-[14px] text-text-secondary">
              Currently signed in as <span className="text-text-primary font-bold">{user?.email}</span>
            </p>
          </div>

          {!showDelete ? (
            <button
              onClick={() => setShowDelete(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-red-500/30 text-red-500 font-bold text-[13px] hover:bg-red-500 hover:text-white transition-all"
            >
              <Trash2 className="w-4 h-4" /> Terminate Account
            </button>
          ) : (
            <div className="p-6 bg-surface border border-red-500/30 rounded-xl shadow-lg">
              <p className="text-[14px] font-medium text-red-500 mb-6">
                This action is irreversible. All projects, metrics, and identity data will be permanently wiped.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <form action={deleteAccount}>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-red-500 text-white rounded-full text-[13px] font-bold hover:bg-red-600 transition-colors shadow-md"
                  >
                    Confirm Termination
                  </button>
                </form>
                <button
                  onClick={() => setShowDelete(false)}
                  className="px-6 py-3 border border-border-primary bg-background-secondary rounded-full text-[13px] font-bold text-text-secondary hover:text-text-primary transition-colors"
                >
                  Abort
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
