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
      <div className="max-w-[600px] mx-auto px-6 py-20">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded w-48" />
          <div className="h-4 bg-gray-100 rounded w-72" />
          <div className="h-12 bg-gray-100 rounded w-full mt-8" />
          <div className="h-12 bg-gray-100 rounded w-full" />
          <div className="h-12 bg-gray-100 rounded w-full" />
        </div>
      </div>
    );
  }

  const hasFieldError = (field: string) =>
    (state?.fieldErrors?.[field]?.length ?? 0) > 0;

  const fieldError = (field: string) =>
    state?.fieldErrors?.[field]?.[0];

  const inputCls = (field: string) =>
    cn(
      "w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm outline-none transition-all",
      hasFieldError(field)
        ? "border-red-400"
        : "border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-50 text-gray-900 placeholder:text-gray-400"
    );

  return (
    <div className="max-w-[600px] mx-auto px-6 py-10 md:py-16">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-gray-600 transition-colors mb-8"
      >
        <ArrowLeft className="w-3 h-3" /> Dashboard
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
      <p className="text-sm text-gray-500 mb-10">
        Manage your profile and account.
      </p>

      {state?.success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600">
          Profile updated.
        </div>
      )}

      {state?.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-6">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Profile
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
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
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
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
          <p className="text-[11px] text-gray-400 mt-1">
            antry.dev/builders/{profile?.username || "your-username"}
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
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
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
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

        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider pt-4">
          Links
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
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
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
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
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
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
            disabled={pending}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {pending ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>

      {/* Account info */}
      <div className="mt-16 pt-8 border-t border-gray-100">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
          Account
        </div>
        <div className="text-sm text-gray-500 mb-6">
          Signed in as <span className="text-gray-900 font-medium">{user?.email}</span>
        </div>

        {!showDelete ? (
          <button
            onClick={() => setShowDelete(true)}
            className="text-sm text-red-400 hover:text-red-600 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete account
          </button>
        ) : (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600 mb-4">
              This will permanently delete your account, profile, and all projects. This cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <form action={deleteAccount}>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
                >
                  Yes, delete my account
                </button>
              </form>
              <button
                onClick={() => setShowDelete(false)}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
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
