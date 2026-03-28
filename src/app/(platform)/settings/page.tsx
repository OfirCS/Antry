"use client";

import { useActionState, useEffect, useState, useRef, useCallback } from "react";
import {
  ArrowLeft,
  Trash2,
  User,
  Settings,
  Bell,
  Puzzle,
  Camera,
  Check,
  X,
  Github,
  Twitter,
  Globe,
  ExternalLink,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/supabase/auth-context";
import { createClient } from "@/lib/supabase/client";
import { updateProfile, deleteAccount, type FormState } from "../actions";

const ease = [0.22, 1, 0.36, 1] as const;

type TabKey = "profile" | "account" | "notifications" | "integrations";

const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
  { key: "account", label: "Account", icon: <Settings className="w-4 h-4" /> },
  {
    key: "notifications",
    label: "Notifications",
    icon: <Bell className="w-4 h-4" />,
  },
  {
    key: "integrations",
    label: "Integrations",
    icon: <Puzzle className="w-4 h-4" />,
  },
];

/* ── Inline validation helpers ──────────────────────────────── */

function validateFullName(v: string) {
  if (!v.trim()) return "Full name is required";
  if (v.trim().length < 2) return "Must be at least 2 characters";
  return null;
}

function validateUsername(v: string) {
  if (!v.trim()) return "Username is required";
  if (!/^[a-z0-9_-]+$/i.test(v)) return "Only letters, numbers, dashes, underscores";
  if (v.length < 3) return "Must be at least 3 characters";
  return null;
}

function validateUrl(v: string) {
  if (!v) return null;
  try {
    new URL(v);
    return null;
  } catch {
    return "Must be a valid URL";
  }
}

/* ── Toast Component ────────────────────────────────────────── */

function SuccessToast({
  show,
  onClose,
}: {
  show: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (show) {
      const t = setTimeout(onClose, 3500);
      return () => clearTimeout(t);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.4, ease }}
          className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 shadow-lg"
          style={{
            background: "#111111",
            borderRadius: "14px",
            border: "1px solid rgba(198,241,53,0.2)",
          }}
        >
          <div
            className="w-6 h-6 flex items-center justify-center"
            style={{
              borderRadius: "9999px",
              background: "#C6F135",
            }}
          >
            <Check className="w-3.5 h-3.5" style={{ color: "#111111" }} />
          </div>
          <span
            className="text-[14px] font-semibold"
            style={{ color: "#ffffff" }}
          >
            Settings saved successfully
          </span>
          <button
            onClick={onClose}
            className="ml-2 opacity-50 hover:opacity-100 transition-opacity"
            style={{ color: "#ffffff" }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Main Settings Page ─────────────────────────────────────── */

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const [showToast, setShowToast] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inline validation state
  const [fieldTouched, setFieldTouched] = useState<Record<string, boolean>>({});
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [inlineErrors, setInlineErrors] = useState<Record<string, string | null>>(
    {}
  );

  const [state, formAction, pending] = useActionState<FormState, FormData>(
    updateProfile,
    null
  );

  // Show toast on successful save
  useEffect(() => {
    if (state?.success) {
      setShowToast(true);
    }
  }, [state]);

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
      if (data) {
        setFieldValues({
          full_name: data.full_name || "",
          username: data.username || "",
          bio: data.bio || "",
          skills: data.skills?.join(", ") || "",
          github_url: data.github_url || "",
          twitter_url: data.twitter_url || "",
          website_url: data.website_url || "",
        });
        setAvatarPreview(data.avatar_url || null);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleBlur = useCallback(
    (field: string) => {
      setFieldTouched((prev) => ({ ...prev, [field]: true }));
      const val = fieldValues[field] || "";
      let err: string | null = null;
      if (field === "full_name") err = validateFullName(val);
      else if (field === "username") err = validateUsername(val);
      else if (
        field === "github_url" ||
        field === "twitter_url" ||
        field === "website_url"
      )
        err = validateUrl(val);
      setInlineErrors((prev) => ({ ...prev, [field]: err }));
    },
    [fieldValues]
  );

  const handleFieldChange = (field: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [field]: value }));
    // Clear inline error on change
    if (inlineErrors[field]) {
      setInlineErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-[860px] mx-auto px-8 py-24">
        <div className="animate-pulse space-y-6">
          <div
            className="h-10 rounded-lg w-48"
            style={{ background: "#EBEBEB" }}
          />
          <div
            className="h-14 rounded-xl w-full mt-10"
            style={{ background: "#EBEBEB" }}
          />
          <div
            className="h-14 rounded-xl w-full"
            style={{ background: "#EBEBEB" }}
          />
        </div>
      </div>
    );
  }

  const hasFieldError = (field: string) =>
    (state?.fieldErrors?.[field]?.length ?? 0) > 0;

  const serverError = (field: string) => state?.fieldErrors?.[field]?.[0];

  const getFieldError = (field: string) => {
    if (hasFieldError(field)) return serverError(field);
    if (fieldTouched[field] && inlineErrors[field]) return inlineErrors[field];
    return null;
  };

  const inputCls = (field: string) =>
    cn(
      "w-full px-5 py-3.5 text-[14px] font-medium outline-none transition-all duration-300",
      getFieldError(field)
        ? "border-red-400 focus:ring-2 focus:ring-red-400/20"
        : "focus:border-[#C6F135] focus:ring-4 focus:ring-[rgba(198,241,53,0.1)]"
    );

  const githubConnected = !!fieldValues.github_url;
  const twitterConnected = !!fieldValues.twitter_url;

  return (
    <>
      <SuccessToast show={showToast} onClose={() => setShowToast(false)} />

      <div className="max-w-[860px] mx-auto px-6 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest transition-colors mb-10"
            style={{ color: "#A3A3A3" }}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease }}
          className="mb-10"
        >
          <h1
            className="font-display text-[clamp(2rem,4vw,2.5rem)] mb-3 tracking-[-0.03em] font-bold"
            style={{ color: "#111111" }}
          >
            Account Settings
          </h1>
          <p className="text-[16px] leading-relaxed" style={{ color: "#737373" }}>
            Manage your builder identity, connected networks, and preferences.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease }}
          className="flex gap-1 mb-8 p-1 overflow-x-auto"
          style={{
            background: "#F5F5F5",
            borderRadius: "14px",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="relative flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold whitespace-nowrap transition-all duration-300"
              style={{
                borderRadius: "10px",
                background:
                  activeTab === tab.key ? "#ffffff" : "transparent",
                color:
                  activeTab === tab.key ? "#111111" : "#737373",
                boxShadow:
                  activeTab === tab.key
                    ? "0 1px 3px rgba(0,0,0,0.06)"
                    : "none",
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </motion.div>

        {state?.error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-5 rounded-xl text-[14px] font-medium"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.15)",
              color: "#ef4444",
              borderRadius: "16px",
            }}
          >
            {state.error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* ── Profile Tab ──────────────────────────────────── */}
          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Form */}
                <div className="lg:col-span-2">
                  <form
                    action={formAction}
                    className="space-y-10 p-8 sm:p-10"
                    style={{
                      background: "#ffffff",
                      borderRadius: "20px",
                      border: "1px solid #EBEBEB",
                    }}
                  >
                    {/* Avatar Upload */}
                    <div className="flex items-center gap-6">
                      <div
                        className="relative group cursor-pointer"
                        onClick={handleAvatarClick}
                      >
                        <div
                          className="w-20 h-20 flex items-center justify-center overflow-hidden"
                          style={{
                            borderRadius: "9999px",
                            background: avatarPreview
                              ? "transparent"
                              : "rgba(198,241,53,0.12)",
                            border: "2px solid #EBEBEB",
                          }}
                        >
                          {avatarPreview ? (
                            <img
                              src={avatarPreview}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User
                              className="w-8 h-8"
                              style={{ color: "#C6F135" }}
                            />
                          )}
                        </div>
                        <div
                          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          style={{
                            borderRadius: "9999px",
                            background: "rgba(17,17,17,0.5)",
                          }}
                        >
                          <Camera
                            className="w-5 h-5"
                            style={{ color: "#ffffff" }}
                          />
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                      </div>
                      <div>
                        <p
                          className="text-[14px] font-semibold"
                          style={{ color: "#111111" }}
                        >
                          Profile photo
                        </p>
                        <p className="text-[13px]" style={{ color: "#A3A3A3" }}>
                          Click to upload. JPG, PNG under 2MB.
                        </p>
                      </div>
                    </div>

                    {/* Builder Profile Section */}
                    <div>
                      <div className="mb-6 border-b pb-4" style={{ borderColor: "#F5F5F5" }}>
                        <h2
                          className="text-[14px] font-bold mb-1"
                          style={{ color: "#111111" }}
                        >
                          Builder Profile
                        </h2>
                        <p className="text-[12px]" style={{ color: "#A3A3A3" }}>
                          This information appears on your public builder card and profile page.
                        </p>
                      </div>
                      <div className="space-y-6">
                        {/* Full name */}
                        <div>
                          <label
                            className="block text-[11px] font-bold uppercase tracking-[0.1em] mb-2.5 pl-1"
                            style={{ color: "#737373" }}
                          >
                            Full name *
                          </label>
                          <input
                            type="text"
                            name="full_name"
                            value={fieldValues.full_name || ""}
                            onChange={(e) =>
                              handleFieldChange("full_name", e.target.value)
                            }
                            onBlur={() => handleBlur("full_name")}
                            placeholder="Your name"
                            className={inputCls("full_name")}
                            style={{
                              background: "#F5F5F5",
                              border: getFieldError("full_name")
                                ? "1px solid #ef4444"
                                : "1px solid #EBEBEB",
                              borderRadius: "12px",
                              color: "#111111",
                            }}
                          />
                          <AnimatePresence>
                            {getFieldError("full_name") && (
                              <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="text-[12px] font-medium mt-2 pl-1"
                                style={{ color: "#ef4444" }}
                              >
                                {getFieldError("full_name")}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Username */}
                        <div>
                          <label
                            className="block text-[11px] font-bold uppercase tracking-[0.1em] mb-2.5 pl-1"
                            style={{ color: "#737373" }}
                          >
                            Username *
                          </label>
                          <input
                            type="text"
                            name="username"
                            value={fieldValues.username || ""}
                            onChange={(e) =>
                              handleFieldChange("username", e.target.value)
                            }
                            onBlur={() => handleBlur("username")}
                            placeholder="your-username"
                            className={inputCls("username")}
                            style={{
                              background: "#F5F5F5",
                              border: getFieldError("username")
                                ? "1px solid #ef4444"
                                : "1px solid #EBEBEB",
                              borderRadius: "12px",
                              color: "#111111",
                            }}
                          />
                          <AnimatePresence>
                            {getFieldError("username") && (
                              <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="text-[12px] font-medium mt-2 pl-1"
                                style={{ color: "#ef4444" }}
                              >
                                {getFieldError("username")}
                              </motion.p>
                            )}
                          </AnimatePresence>
                          <p
                            className="text-[12px] mt-2 pl-1 font-mono"
                            style={{ color: "#A3A3A3" }}
                          >
                            antry.dev/builders/
                            {fieldValues.username || "username"}
                          </p>
                        </div>

                        {/* Bio */}
                        <div>
                          <label
                            className="block text-[11px] font-bold uppercase tracking-[0.1em] mb-2.5 pl-1"
                            style={{ color: "#737373" }}
                          >
                            Bio
                          </label>
                          <textarea
                            name="bio"
                            rows={4}
                            value={fieldValues.bio || ""}
                            onChange={(e) =>
                              handleFieldChange("bio", e.target.value)
                            }
                            placeholder="Tell others what you build and care about"
                            className={cn(inputCls("bio"), "resize-none")}
                            style={{
                              background: "#F5F5F5",
                              border: "1px solid #EBEBEB",
                              borderRadius: "12px",
                              color: "#111111",
                            }}
                          />
                        </div>

                        {/* Skills */}
                        <div>
                          <label
                            className="block text-[11px] font-bold uppercase tracking-[0.1em] mb-2.5 pl-1"
                            style={{ color: "#737373" }}
                          >
                            Skills
                          </label>
                          <SkillsTagInput
                            value={fieldValues.skills || ""}
                            onChange={(val) =>
                              handleFieldChange("skills", val)
                            }
                          />
                          <input
                            type="hidden"
                            name="skills"
                            value={fieldValues.skills || ""}
                          />
                          <p
                            className="text-[12px] mt-2 pl-1"
                            style={{ color: "#A3A3A3" }}
                          >
                            Press Enter or comma to add a skill. Click a tag to remove it.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Network Links */}
                    <div>
                      <div className="mb-6 border-b pb-4" style={{ borderColor: "#F5F5F5" }}>
                        <h2
                          className="text-[14px] font-bold mb-1"
                          style={{ color: "#111111" }}
                        >
                          Network Links
                        </h2>
                        <p className="text-[12px]" style={{ color: "#A3A3A3" }}>
                          Connect your social profiles so others can find and follow you.
                        </p>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <label
                            className="block text-[11px] font-bold uppercase tracking-[0.1em] mb-2.5 pl-1"
                            style={{ color: "#737373" }}
                          >
                            GitHub
                          </label>
                          <input
                            type="url"
                            name="github_url"
                            value={fieldValues.github_url || ""}
                            onChange={(e) =>
                              handleFieldChange("github_url", e.target.value)
                            }
                            onBlur={() => handleBlur("github_url")}
                            placeholder="https://github.com/..."
                            className={inputCls("github_url")}
                            style={{
                              background: "#F5F5F5",
                              border: getFieldError("github_url")
                                ? "1px solid #ef4444"
                                : "1px solid #EBEBEB",
                              borderRadius: "12px",
                              color: "#111111",
                            }}
                          />
                          <AnimatePresence>
                            {getFieldError("github_url") && (
                              <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="text-[12px] font-medium mt-2 pl-1"
                                style={{ color: "#ef4444" }}
                              >
                                {getFieldError("github_url")}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>

                        <div>
                          <label
                            className="block text-[11px] font-bold uppercase tracking-[0.1em] mb-2.5 pl-1"
                            style={{ color: "#737373" }}
                          >
                            Twitter / X
                          </label>
                          <input
                            type="url"
                            name="twitter_url"
                            value={fieldValues.twitter_url || ""}
                            onChange={(e) =>
                              handleFieldChange("twitter_url", e.target.value)
                            }
                            onBlur={() => handleBlur("twitter_url")}
                            placeholder="https://twitter.com/..."
                            className={inputCls("twitter_url")}
                            style={{
                              background: "#F5F5F5",
                              border: getFieldError("twitter_url")
                                ? "1px solid #ef4444"
                                : "1px solid #EBEBEB",
                              borderRadius: "12px",
                              color: "#111111",
                            }}
                          />
                          <AnimatePresence>
                            {getFieldError("twitter_url") && (
                              <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="text-[12px] font-medium mt-2 pl-1"
                                style={{ color: "#ef4444" }}
                              >
                                {getFieldError("twitter_url")}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>

                        <div>
                          <label
                            className="block text-[11px] font-bold uppercase tracking-[0.1em] mb-2.5 pl-1"
                            style={{ color: "#737373" }}
                          >
                            Personal Website
                          </label>
                          <input
                            type="url"
                            name="website_url"
                            value={fieldValues.website_url || ""}
                            onChange={(e) =>
                              handleFieldChange("website_url", e.target.value)
                            }
                            onBlur={() => handleBlur("website_url")}
                            placeholder="https://..."
                            className={inputCls("website_url")}
                            style={{
                              background: "#F5F5F5",
                              border: getFieldError("website_url")
                                ? "1px solid #ef4444"
                                : "1px solid #EBEBEB",
                              borderRadius: "12px",
                              color: "#111111",
                            }}
                          />
                          <AnimatePresence>
                            {getFieldError("website_url") && (
                              <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="text-[12px] font-medium mt-2 pl-1"
                                style={{ color: "#ef4444" }}
                              >
                                {getFieldError("website_url")}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="pt-6 border-t" style={{ borderColor: "#F5F5F5" }}>
                      <button
                        type="submit"
                        disabled={pending}
                        className="w-full sm:w-auto px-8 py-4 text-[14px] font-bold transition-all duration-300 disabled:opacity-50"
                        style={{
                          background: "#C6F135",
                          color: "#111111",
                          borderRadius: "9999px",
                        }}
                      >
                        {pending ? "Saving..." : "Save Profile"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Right: Profile Preview */}
                <div className="lg:col-span-1">
                  <div className="sticky top-28">
                    <div className="flex items-center gap-2 mb-4">
                      <Eye className="w-4 h-4" style={{ color: "#A3A3A3" }} />
                      <p
                        className="text-[11px] font-bold uppercase tracking-widest"
                        style={{ color: "#A3A3A3" }}
                      >
                        Profile Preview
                      </p>
                    </div>
                    <motion.div
                      layout
                      className="p-6 text-center"
                      style={{
                        background: "#ffffff",
                        borderRadius: "20px",
                        border: "1px solid #EBEBEB",
                      }}
                    >
                      {/* Avatar */}
                      <div
                        className="w-16 h-16 mx-auto mb-4 flex items-center justify-center overflow-hidden"
                        style={{
                          borderRadius: "9999px",
                          background: avatarPreview
                            ? "transparent"
                            : "rgba(198,241,53,0.12)",
                          border: "2px solid #EBEBEB",
                        }}
                      >
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User
                            className="w-7 h-7"
                            style={{ color: "#C6F135" }}
                          />
                        )}
                      </div>

                      {/* Name */}
                      <p
                        className="text-[16px] font-bold mb-0.5"
                        style={{ color: "#111111" }}
                      >
                        {fieldValues.full_name || "Your Name"}
                      </p>
                      <p
                        className="text-[13px] font-mono mb-3"
                        style={{ color: "#A3A3A3" }}
                      >
                        @{fieldValues.username || "username"}
                      </p>

                      {/* Bio */}
                      {fieldValues.bio && (
                        <p
                          className="text-[13px] leading-relaxed mb-4"
                          style={{ color: "#737373" }}
                        >
                          {fieldValues.bio.length > 100
                            ? fieldValues.bio.slice(0, 100) + "..."
                            : fieldValues.bio}
                        </p>
                      )}

                      {/* Skills */}
                      {fieldValues.skills && (
                        <div className="flex flex-wrap gap-1.5 justify-center mb-4">
                          {fieldValues.skills
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean)
                            .slice(0, 5)
                            .map((skill) => (
                              <span
                                key={skill}
                                className="text-[11px] font-semibold px-2.5 py-1"
                                style={{
                                  background:
                                    "rgba(198,241,53,0.12)",
                                  color: "#111111",
                                  borderRadius: "9999px",
                                }}
                              >
                                {skill}
                              </span>
                            ))}
                        </div>
                      )}

                      {/* Social links */}
                      <div className="flex items-center justify-center gap-2 pt-3 border-t" style={{ borderColor: "#F5F5F5" }}>
                        {fieldValues.github_url && (
                          <div
                            className="w-8 h-8 flex items-center justify-center"
                            style={{
                              borderRadius: "8px",
                              background: "#F5F5F5",
                            }}
                          >
                            <Github
                              className="w-3.5 h-3.5"
                              style={{ color: "#737373" }}
                            />
                          </div>
                        )}
                        {fieldValues.twitter_url && (
                          <div
                            className="w-8 h-8 flex items-center justify-center"
                            style={{
                              borderRadius: "8px",
                              background: "#F5F5F5",
                            }}
                          >
                            <Twitter
                              className="w-3.5 h-3.5"
                              style={{ color: "#737373" }}
                            />
                          </div>
                        )}
                        {fieldValues.website_url && (
                          <div
                            className="w-8 h-8 flex items-center justify-center"
                            style={{
                              borderRadius: "8px",
                              background: "#F5F5F5",
                            }}
                          >
                            <Globe
                              className="w-3.5 h-3.5"
                              style={{ color: "#737373" }}
                            />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Account Tab ──────────────────────────────────── */}
          {activeTab === "account" && (
            <motion.div
              key="account"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease }}
            >
              <div
                className="p-8 sm:p-10 mb-8"
                style={{
                  background: "#ffffff",
                  borderRadius: "20px",
                  border: "1px solid #EBEBEB",
                }}
              >
                <div className="mb-6 border-b pb-4" style={{ borderColor: "#F5F5F5" }}>
                  <h2
                    className="text-[14px] font-bold mb-1"
                    style={{ color: "#111111" }}
                  >
                    Account Information
                  </h2>
                  <p className="text-[12px]" style={{ color: "#A3A3A3" }}>
                    Your login credentials and membership details.
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label
                      className="block text-[11px] font-bold uppercase tracking-[0.1em] mb-2.5 pl-1"
                      style={{ color: "#737373" }}
                    >
                      Email
                    </label>
                    <div
                      className="w-full px-5 py-3.5 text-[14px] font-medium"
                      style={{
                        background: "#F5F5F5",
                        border: "1px solid #EBEBEB",
                        borderRadius: "12px",
                        color: "#111111",
                      }}
                    >
                      {user?.email}
                    </div>
                    <p className="text-[12px] mt-2 pl-1" style={{ color: "#A3A3A3" }}>
                      Email cannot be changed. Contact support for help.
                    </p>
                  </div>

                  <div>
                    <label
                      className="block text-[11px] font-bold uppercase tracking-[0.1em] mb-2.5 pl-1"
                      style={{ color: "#737373" }}
                    >
                      Member since
                    </label>
                    <div
                      className="w-full px-5 py-3.5 text-[14px] font-medium"
                      style={{
                        background: "#F5F5F5",
                        border: "1px solid #EBEBEB",
                        borderRadius: "12px",
                        color: "#111111",
                      }}
                    >
                      {profile?.created_at
                        ? new Date(profile.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            }
                          )
                        : "Unknown"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div
                className="p-8 sm:p-10"
                style={{
                  background: "rgba(239,68,68,0.03)",
                  borderRadius: "20px",
                  border: "1px solid rgba(239,68,68,0.12)",
                }}
              >
                <h2
                  className="text-[11px] font-bold uppercase tracking-widest mb-6"
                  style={{ color: "#ef4444" }}
                >
                  Danger Zone
                </h2>
                <div className="mb-4">
                  <h3
                    className="text-[16px] font-bold mb-2"
                    style={{ color: "#111111" }}
                  >
                    Delete Account
                  </h3>
                  <p className="text-[14px]" style={{ color: "#737373" }}>
                    Permanently remove your account and all associated data. This
                    action cannot be undone.
                  </p>
                </div>

                {!showDelete ? (
                  <button
                    onClick={() => setShowDelete(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 font-bold text-[13px] transition-all"
                    style={{
                      borderRadius: "9999px",
                      border: "1px solid rgba(239,68,68,0.3)",
                      color: "#ef4444",
                      background: "transparent",
                    }}
                  >
                    <Trash2 className="w-4 h-4" /> Delete Account
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 shadow-lg"
                    style={{
                      background: "#ffffff",
                      border: "1px solid rgba(239,68,68,0.2)",
                      borderRadius: "16px",
                    }}
                  >
                    <p
                      className="text-[14px] font-medium mb-6"
                      style={{ color: "#ef4444" }}
                    >
                      This action is irreversible. All projects, metrics, and
                      identity data will be permanently wiped.
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                      <form action={deleteAccount}>
                        <button
                          type="submit"
                          className="px-6 py-3 text-[13px] font-bold shadow-md transition-colors"
                          style={{
                            background: "#ef4444",
                            color: "#ffffff",
                            borderRadius: "9999px",
                          }}
                        >
                          Confirm Deletion
                        </button>
                      </form>
                      <button
                        onClick={() => setShowDelete(false)}
                        className="px-6 py-3 text-[13px] font-bold transition-colors"
                        style={{
                          border: "1px solid #EBEBEB",
                          background: "#F5F5F5",
                          borderRadius: "9999px",
                          color: "#737373",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── Notifications Tab ────────────────────────────── */}
          {activeTab === "notifications" && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease }}
            >
              <div
                className="p-8 sm:p-10"
                style={{
                  background: "#ffffff",
                  borderRadius: "20px",
                  border: "1px solid #EBEBEB",
                }}
              >
                <div className="mb-6 border-b pb-4" style={{ borderColor: "#F5F5F5" }}>
                  <h2
                    className="text-[14px] font-bold mb-1"
                    style={{ color: "#111111" }}
                  >
                    Email Notifications
                  </h2>
                  <p className="text-[12px]" style={{ color: "#A3A3A3" }}>
                    Choose which emails you want to receive. You can change these at any time.
                  </p>
                </div>

                <div className="space-y-5">
                  {[
                    {
                      label: "Project likes",
                      desc: "Get notified when someone likes your project",
                      defaultOn: true,
                    },
                    {
                      label: "Hackathon updates",
                      desc: "Announcements and reminders for hackathons you joined",
                      defaultOn: true,
                    },
                    {
                      label: "New follower",
                      desc: "When someone follows your builder profile",
                      defaultOn: false,
                    },
                    {
                      label: "Recruiter interest",
                      desc: "When a recruiter bookmarks your profile",
                      defaultOn: true,
                    },
                    {
                      label: "Weekly digest",
                      desc: "A summary of platform activity each week",
                      defaultOn: false,
                    },
                    {
                      label: "Product updates",
                      desc: "New features, improvements, and blog posts",
                      defaultOn: true,
                    },
                  ].map((item) => (
                    <NotificationToggle
                      key={item.label}
                      label={item.label}
                      description={item.desc}
                      defaultOn={item.defaultOn}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Integrations Tab ─────────────────────────────── */}
          {activeTab === "integrations" && (
            <motion.div
              key="integrations"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease }}
            >
              <div
                className="p-8 sm:p-10"
                style={{
                  background: "#ffffff",
                  borderRadius: "20px",
                  border: "1px solid #EBEBEB",
                }}
              >
                <div className="mb-6 border-b pb-4" style={{ borderColor: "#F5F5F5" }}>
                  <h2
                    className="text-[14px] font-bold mb-1"
                    style={{ color: "#111111" }}
                  >
                    Connected Services
                  </h2>
                  <p className="text-[12px]" style={{ color: "#A3A3A3" }}>
                    Linked accounts and external integrations.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* GitHub */}
                  <IntegrationCard
                    icon={<Github className="w-5 h-5" />}
                    name="GitHub"
                    description={
                      githubConnected
                        ? fieldValues.github_url
                        : "Connect your GitHub to auto-import projects"
                    }
                    connected={githubConnected}
                    accentColor="#111111"
                  />

                  {/* Twitter / X */}
                  <IntegrationCard
                    icon={<Twitter className="w-5 h-5" />}
                    name="Twitter / X"
                    description={
                      twitterConnected
                        ? fieldValues.twitter_url
                        : "Link your Twitter profile to your builder card"
                    }
                    connected={twitterConnected}
                    accentColor="#1DA1F2"
                  />

                  {/* Website */}
                  <IntegrationCard
                    icon={<Globe className="w-5 h-5" />}
                    name="Personal Website"
                    description={
                      fieldValues.website_url
                        ? fieldValues.website_url
                        : "Add a personal website or portfolio link"
                    }
                    connected={!!fieldValues.website_url}
                    accentColor="#C6F135"
                  />
                </div>

                <p
                  className="text-[13px] mt-6 pt-4 border-t"
                  style={{ color: "#A3A3A3", borderColor: "#F5F5F5" }}
                >
                  Manage your network links in the{" "}
                  <button
                    onClick={() => setActiveTab("profile")}
                    className="font-semibold underline"
                    style={{ color: "#111111" }}
                  >
                    Profile tab
                  </button>
                  .
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

/* ── Skills Tag Input ──────────────────────────────────────── */

function SkillsTagInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const tags = value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  function addTag(raw: string) {
    const tag = raw.trim();
    if (!tag) return;
    // Avoid duplicates (case-insensitive)
    if (tags.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      setInputValue("");
      return;
    }
    const next = [...tags, tag].join(", ");
    onChange(next);
    setInputValue("");
  }

  function removeTag(index: number) {
    const next = tags.filter((_, i) => i !== index).join(", ");
    onChange(next);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    }
    if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  }

  return (
    <div
      className="flex flex-wrap items-center gap-2 min-h-[48px] px-4 py-2.5 cursor-text"
      style={{
        background: "#F5F5F5",
        border: "1px solid #EBEBEB",
        borderRadius: "12px",
      }}
      onClick={() => inputRef.current?.focus()}
    >
      <AnimatePresence mode="popLayout">
        {tags.map((tag, i) => (
          <motion.button
            key={tag}
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => {
              e.stopPropagation();
              removeTag(i);
            }}
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 transition-colors duration-150 hover:opacity-70 group"
            style={{
              background: "rgba(198,241,53,0.15)",
              color: "#111111",
              borderRadius: "9999px",
              border: "1px solid rgba(198,241,53,0.3)",
            }}
          >
            {tag}
            <X
              className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity"
              style={{ color: "#111111" }}
            />
          </motion.button>
        ))}
      </AnimatePresence>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value.replace(",", ""))}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (inputValue.trim()) addTag(inputValue);
        }}
        placeholder={tags.length === 0 ? "Type a skill and press Enter..." : "Add more..."}
        className="flex-1 min-w-[120px] bg-transparent text-[14px] font-medium outline-none placeholder:text-[#A3A3A3]"
        style={{ color: "#111111" }}
      />
    </div>
  );
}

/* ── Notification Toggle ────────────────────────────────────── */

function NotificationToggle({
  label,
  description,
  defaultOn,
}: {
  label: string;
  description: string;
  defaultOn: boolean;
}) {
  const [on, setOn] = useState(defaultOn);

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-[14px] font-semibold" style={{ color: "#111111" }}>
          {label}
        </p>
        <p className="text-[13px]" style={{ color: "#A3A3A3" }}>
          {description}
        </p>
      </div>
      <button
        onClick={() => setOn(!on)}
        className="relative shrink-0 w-11 h-6 transition-colors duration-300"
        style={{
          borderRadius: "9999px",
          background: on ? "#C6F135" : "#EBEBEB",
        }}
      >
        <motion.div
          animate={{ x: on ? 20 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 shadow-sm"
          style={{
            borderRadius: "9999px",
            background: on ? "#111111" : "#ffffff",
          }}
        />
      </button>
    </div>
  );
}

/* ── Integration Card ───────────────────────────────────────── */

function IntegrationCard({
  icon,
  name,
  description,
  connected,
  accentColor,
}: {
  icon: React.ReactNode;
  name: string;
  description: string;
  connected: boolean;
  accentColor: string;
}) {
  return (
    <div
      className="flex items-center gap-4 p-5 transition-all duration-200"
      style={{
        borderRadius: "16px",
        border: connected
          ? `1px solid ${accentColor}20`
          : "1px solid #EBEBEB",
        background: connected ? `${accentColor}08` : "#FAFAFA",
      }}
    >
      <div
        className="w-10 h-10 flex items-center justify-center shrink-0"
        style={{
          borderRadius: "12px",
          background: connected ? `${accentColor}15` : "#F5F5F5",
          color: connected ? accentColor : "#A3A3A3",
        }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className="text-[14px] font-semibold"
            style={{ color: "#111111" }}
          >
            {name}
          </p>
          {connected && (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5"
              style={{
                borderRadius: "9999px",
                background: "#C6F135",
                color: "#111111",
              }}
            >
              <Check className="w-3 h-3" />
              Connected
            </span>
          )}
        </div>
        <p
          className="text-[13px] truncate mt-0.5"
          style={{ color: "#A3A3A3" }}
        >
          {description}
        </p>
      </div>
      {connected && (
        <ExternalLink
          className="w-4 h-4 shrink-0"
          style={{ color: "#A3A3A3" }}
        />
      )}
    </div>
  );
}
