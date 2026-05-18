"use client";

import { useActionState, useState, useCallback, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Code2,
  Globe,
  Layers,
  Link2,
  Pencil,
  Rocket,
  Search,
  Bot,
  Smartphone,
  Palette,
  Database,
  Wrench,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createProject, type FormState } from "../actions";

/* ── Constants ─────────────────────────────────────── */

const STORAGE_KEY = "antry-submit-draft";

const categories = [
  { value: "ai-agents", label: "Agents", icon: Bot, description: "Agent workflows" },
  { value: "web-apps", label: "Web Apps", icon: Globe, description: "Full-stack web & SaaS" },
  { value: "tools", label: "Tools", icon: Wrench, description: "Dev tools & CLIs" },
  { value: "design", label: "Design", icon: Palette, description: "Creative tech & UI" },
  { value: "data-ml", label: "Data / ML", icon: Database, description: "ML & analytics" },
  { value: "mobile", label: "Mobile", icon: Smartphone, description: "iOS, Android, cross-platform" },
];

const POPULAR_TECH = [
  "Next.js", "React", "TypeScript", "Python", "Node.js", "Tailwind CSS",
  "Supabase", "PostgreSQL", "OpenAI", "Claude API", "LangChain", "FastAPI",
  "Vercel", "Docker", "Redis", "GraphQL", "Prisma", "Firebase",
  "TensorFlow", "PyTorch", "Go", "Rust", "Swift", "Kotlin",
  "Three.js", "Framer Motion", "D3.js", "WebSockets",
];

const ease = [0.16, 1, 0.3, 1] as const;

/* ── Types ─────────────────────────────────────────── */

interface DraftState {
  title: string;
  tagline: string;
  description: string;
  category: string;
  techStack: string[];
  demoUrl: string;
  step: number;
}

const DEFAULT_DRAFT: DraftState = {
  title: "",
  tagline: "",
  description: "",
  category: "",
  techStack: [],
  demoUrl: "",
  step: 1,
};

/* ── Hooks ─────────────────────────────────────────── */

function useDraft() {
  const [loaded, setLoaded] = useState(false);
  const [draft, setDraftState] = useState<DraftState>(DEFAULT_DRAFT);

  // Load from localStorage on mount
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as Partial<DraftState>;
          setDraftState((prev) => ({ ...prev, ...parsed }));
        }
      } catch {
        // ignore parse errors
      }
      setLoaded(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // ignore quota errors
    }
  }, [draft, loaded]);

  const setDraft = useCallback((update: Partial<DraftState>) => {
    setDraftState((prev) => ({ ...prev, ...update }));
  }, []);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setDraftState(DEFAULT_DRAFT);
  }, []);

  return { draft, setDraft, clearDraft, loaded };
}

/* ── Preview Card ──────────────────────────────────── */

function PreviewCard({
  title,
  tagline,
  category,
  techStack,
}: {
  title: string;
  tagline: string;
  category: string;
  techStack: string[];
}) {
  const categoryObj = categories.find((c) => c.value === category);

  return (
    <motion.div
      layout
      className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] overflow-hidden"
    >
      {/* Mini banner */}
      <div
        className="h-20 -mx-6 -mt-6 mb-5 relative"
        style={{
          background: "#111111",
        }}
      >
        {title && (
          <span className="absolute bottom-2 right-4 text-white/[0.06] text-[48px] font-display font-bold select-none leading-none tracking-tighter">
            {title.slice(0, 2)}
          </span>
        )}
      </div>

      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="text-[17px] font-semibold text-[#111111] mb-1 truncate tracking-tight">
            {title || "Project name"}
          </h3>
          <p className="text-[13px] text-[#4B5563] line-clamp-2 leading-relaxed">
            {tagline || "Your project tagline will appear here"}
          </p>
        </div>
        <div className="h-8 w-8 rounded-md bg-[#F3F4F6] flex items-center justify-center shrink-0">
          <ArrowUpRight className="h-4 w-4 text-[#6B7280]" />
        </div>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="h-6 w-6 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[11px] font-semibold text-[#4B5563]">
          {(title || "P").slice(0, 1).toUpperCase()}
        </div>
        <span className="text-[13px] font-medium text-[#111111]">You</span>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[#E5E7EB]">
        <div className="flex gap-2 flex-wrap">
          {techStack.length > 0 ? (
            techStack.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center rounded-full bg-[#F3F4F6] px-2.5 py-0.5 text-[11px] font-medium text-[#4B5563]"
              >
                {tech}
              </span>
            ))
          ) : (
            <span className="text-[11px] text-[#9CA3AF]">Tech stack</span>
          )}
        </div>
        {categoryObj && (
          <span className="text-[11px] font-medium text-[#9CA3AF]">
            {categoryObj.label}
          </span>
        )}
      </div>
    </motion.div>
  );
}

/* ── Dot Stepper ───────────────────────────────────── */

function DotStepper({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2.5">
      {Array.from({ length: total }, (_, i) => {
        const stepNum = i + 1;
        const isActive = current === stepNum;
        const isCompleted = current > stepNum;

        return (
          <div key={stepNum} className="flex items-center gap-2.5">
            <motion.div
              animate={{
                width: isActive ? 28 : 10,
                background: isActive || isCompleted ? "#111111" : "#E5E7EB",
              }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="h-[10px] rounded-full"
            />
          </div>
        );
      })}
    </div>
  );
}

/* ── Tech Pill Grid ────────────────────────────────── */

function TechPillGrid({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (items: string[]) => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return POPULAR_TECH;
    return POPULAR_TECH.filter((t) =>
      t.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const toggle = useCallback(
    (tech: string) => {
      if (selected.includes(tech)) {
        onChange(selected.filter((t) => t !== tech));
      } else {
        onChange([...selected, tech]);
      }
    },
    [selected, onChange]
  );

  const addCustom = useCallback(
    (tech: string) => {
      const trimmed = tech.trim();
      if (trimmed && !selected.includes(trimmed)) {
        onChange([...selected, trimmed]);
      }
      setSearch("");
    },
    [selected, onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && search.trim()) {
        e.preventDefault();
        addCustom(search);
      }
    },
    [search, addCustom]
  );

  const showCustomAdd = search.trim() && !POPULAR_TECH.some(
    (t) => t.toLowerCase() === search.trim().toLowerCase()
  );

  return (
    <div className="space-y-4">
      {/* Hidden input for form submission */}
      <input type="hidden" name="tech_stack" value={selected.join(", ")} />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search or type to add..."
          className="w-full pl-10 pr-4 py-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-md text-[14px] font-medium text-[#111111] placeholder:text-[#9CA3AF] outline-none transition-all duration-200 focus:border-[#111111] focus:bg-white focus:shadow-[0_0_0_3px_rgba(17,17,17,0.04)]"
        />
      </div>

      {/* Pill grid */}
      <div className="flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((tech) => {
            const isSelected = selected.includes(tech);
            return (
              <motion.button
                key={tech}
                type="button"
                onClick={() => toggle(tech)}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-[13px] font-medium transition-all duration-200 cursor-pointer border",
                  isSelected
                    ? "bg-[#111111] text-white border-[#111111] shadow-[0_2px_8px_rgba(17,17,17,0.12)]"
                    : "bg-white text-[#4B5563] border-[#E5E7EB] hover:border-[#D1D5DB] hover:text-[#111111] hover:bg-[#FAFAFA]"
                )}
              >
                {isSelected && <Check className="w-3 h-3" />}
                {tech}
              </motion.button>
            );
          })}
        </AnimatePresence>

        {/* Custom add pill */}
        {showCustomAdd && (
          <motion.button
            type="button"
            onClick={() => addCustom(search)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-[13px] font-medium cursor-pointer border border-dashed border-[#D1D5DB] text-[#111111] bg-white hover:border-[#111111] hover:bg-[#FAFAFA] transition-colors"
          >
            <span className="text-[#111111] font-bold">+</span> Add &ldquo;{search.trim()}&rdquo;
          </motion.button>
        )}
      </div>

      {/* Selected count */}
      {selected.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-1.5 text-[12px] font-medium"
          style={{ color: "#4B5563" }}
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> {selected.length} selected
        </motion.p>
      )}
    </div>
  );
}

/* ── Demo URL Preview ──────────────────────────────── */

function DemoUrlPreview({ url }: { url: string }) {
  if (!url) return null;

  let hostname = "";
  try {
    hostname = new URL(url).hostname;
  } catch {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-2 overflow-hidden"
    >
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-3 rounded-[12px] bg-[#F3F4F6] border border-[#E5E7EB] hover:border-[#D1D5DB] transition-colors group"
      >
        <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center">
          <ExternalLink className="w-3.5 h-3.5 text-[#9CA3AF]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-[#111111] truncate">{hostname}</p>
          <p className="text-[11px] text-[#9CA3AF] truncate">{url}</p>
        </div>
        <ArrowUpRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#111111] transition-colors shrink-0" />
      </a>
    </motion.div>
  );
}

/* ── Main Component ────────────────────────────────── */

export default function SubmitPage() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createProject,
    null
  );

  const { draft, setDraft, clearDraft, loaded } = useDraft();
  const { title, tagline, description, category, techStack, demoUrl, step } = draft;

  const formRef = useRef<HTMLFormElement>(null);

  const setStep = useCallback((s: number) => setDraft({ step: s }), [setDraft]);

  const hasFieldError = (field: string) =>
    (state?.fieldErrors?.[field]?.length ?? 0) > 0;

  const fieldError = (field: string) => state?.fieldErrors?.[field]?.[0];

  // Step 1 now consolidates the former steps 1 + 2 (basics + category +
  // tech + demo). Step 2 is the final review. Everything needed to submit
  // must be valid before the user can advance to review.
  const canProceed = useCallback((): boolean => {
    switch (step) {
      case 1:
        return title.length >= 2 && tagline.length >= 5 && category !== "";
      case 2:
        return true;
      default:
        return true;
    }
  }, [step, title, tagline, category]);

  const nextStep = useCallback(() => {
    if (canProceed() && step < 2) setStep(step + 1);
  }, [canProceed, step, setStep]);

  const prevStep = useCallback(() => {
    if (step > 1) setStep(step - 1);
  }, [step, setStep]);

  const inputCls = (field: string) =>
    cn(
      "w-full px-5 py-3.5 bg-white border rounded-md text-[14px] font-medium outline-none transition-all duration-200",
      hasFieldError(field)
        ? "border-red-400 focus:ring-2 focus:ring-red-400/20"
        : "border-[#E5E7EB] focus:border-[#111111] focus:shadow-[0_0_0_3px_rgba(17,17,17,0.04)] text-[#111111] placeholder:text-[#9CA3AF]"
    );

  // Clear draft on successful submit
  useEffect(() => {
    if (state?.success) {
      clearDraft();
    }
  }, [state?.success, clearDraft]);

  // Don't render form until draft is loaded from localStorage
  if (!loaded) {
    return (
      <div className="max-w-[1100px] mx-auto px-6 py-12 md:py-20">
        <div className="h-[400px] flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-[#111111] border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-12 md:py-20">
      {/* Back */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-[13px] font-medium text-[#9CA3AF] hover:text-[#111111] transition-colors mb-8 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> Back to Dashboard
        </Link>
      </motion.div>

      {/* Header + Stepper row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10"
      >
        <div>
          <h1 className="font-display text-[clamp(1.75rem,4vw,2.25rem)] text-[#111111] mb-2 tracking-[-0.03em] font-bold leading-[1.05]">
            Submit a Project
          </h1>
          <p className="text-[15px] text-[#4B5563] leading-relaxed">
            One form, then a quick review. Under 60 seconds.
          </p>
        </div>
        <DotStepper current={step} total={2} />
      </motion.div>

      {/* Global error */}
      {state?.error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-5 bg-red-500/5 border border-red-500/15 rounded-lg text-[14px] font-medium text-red-500 flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          {state.error}
        </motion.div>
      )}

      {/* ── Main layout: Form + Preview ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-8 items-start">
        {/* Form */}
        <form ref={formRef} action={formAction}>
          {/* Hidden fields to carry all values on final submit */}
          <input type="hidden" name="title" value={title} />
          <input type="hidden" name="tagline" value={tagline} />
          <input type="hidden" name="description" value={description} />
          <input type="hidden" name="category" value={category} />
          <input type="hidden" name="tech_stack" value={techStack.join(", ")} />
          <input type="hidden" name="demo_url" value={demoUrl} />
          <input type="hidden" name="source_url" value="" />
          <input type="hidden" name="build_time" value="" />

          <AnimatePresence mode="wait">
            {/* ── Step 1: Everything (basics + category + tech + demo) ── */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease }}
                className="space-y-6"
              >
                <div className="rounded-lg bg-white border border-[#E5E7EB] p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-md bg-[#111111] flex items-center justify-center">
                    <Pencil className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-semibold text-[#111111] tracking-tight">The basics</h2>
                    <p className="text-[13px] text-[#6B7280]">Name and describe your project</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-[11px] font-bold text-[#6B7280] uppercase tracking-[0.1em] mb-2 pl-0.5">
                      Project name *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setDraft({ title: e.target.value })}
                      placeholder="e.g. Sentinel AI"
                      className={inputCls("title")}
                      autoFocus
                    />
                    {fieldError("title") && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1.5 text-[12px] font-medium text-red-500 mt-2 pl-1"
                      >
                        <AlertCircle className="w-3.5 h-3.5" /> {fieldError("title")}
                      </motion.p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#6B7280] uppercase tracking-[0.1em] mb-2 pl-0.5">
                      Tagline *
                    </label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setDraft({ tagline: e.target.value })}
                      placeholder="One-liner describing what it does"
                      className={inputCls("tagline")}
                    />
                    <div className="flex items-center justify-between mt-1.5 px-1">
                      {fieldError("tagline") ? (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-1.5 text-[12px] font-medium text-red-500"
                        >
                          <AlertCircle className="w-3.5 h-3.5" /> {fieldError("tagline")}
                        </motion.p>
                      ) : (
                        <span />
                      )}
                      <span className="text-[11px] text-[#9CA3AF] font-medium">{tagline.length}/200</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#6B7280] uppercase tracking-[0.1em] mb-2 pl-0.5">
                      Description <span className="normal-case font-medium text-[#9CA3AF] tracking-normal">(optional)</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDraft({ description: e.target.value })}
                      rows={3}
                      placeholder="What problem does it solve? How did you build it?"
                      className={cn(inputCls("description"), "resize-none")}
                    />
                  </div>
                </div>
                </div>

                {/* Category cards */}
                <div className="rounded-lg bg-white border border-[#E5E7EB] p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-md bg-[#111111] flex items-center justify-center">
                      <Layers className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-[18px] font-semibold text-[#111111] tracking-tight">Category *</h2>
                      <p className="text-[13px] text-[#6B7280]">Pick the best fit</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {categories.map((cat) => {
                      const CatIcon = cat.icon;
                      const isSelected = category === cat.value;

                      return (
                        <motion.button
                          key={cat.value}
                          type="button"
                          onClick={() => setDraft({ category: cat.value })}
                          whileTap={{ scale: 0.97 }}
                          className={cn(
                            "flex flex-col items-center gap-2.5 p-4 sm:p-5 rounded-lg border-2 text-center transition-all duration-200 cursor-pointer",
                            isSelected
                              ? "border-[#111111] bg-[#F3F4F6] shadow-[0_0_0_1px_rgba(17,17,17,0.12)]"
                              : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB] hover:bg-[#FAFAFA]"
                          )}
                        >
                          <div
                            className="w-11 h-11 rounded-md flex items-center justify-center transition-all duration-200"
                            style={{
                              background: isSelected ? "#111111" : "#F3F4F6",
                            }}
                          >
                            <CatIcon
                              className="w-5 h-5 transition-colors duration-200"
                              style={{ color: isSelected ? "#111111" : "#6B7280" }}
                            />
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-[#111111] mb-0.5">{cat.label}</p>
                            <p className="text-[11px] text-[#9CA3AF] leading-snug">{cat.description}</p>
                          </div>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-1 -right-1"
                            >
                              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#111111" }}>
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                  {fieldError("category") && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-1.5 text-[12px] font-medium text-red-500 mt-3 pl-1"
                    >
                      <AlertCircle className="w-3.5 h-3.5" /> {fieldError("category")}
                    </motion.p>
                  )}
                </div>

                {/* Tech stack pills */}
                <div className="rounded-lg bg-white border border-[#E5E7EB] p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-md bg-[#111111] flex items-center justify-center">
                      <Code2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-[18px] font-semibold text-[#111111] tracking-tight">Tech stack</h2>
                      <p className="text-[13px] text-[#6B7280]">Tap to select technologies</p>
                    </div>
                  </div>

                  <TechPillGrid selected={techStack} onChange={(items) => setDraft({ techStack: items })} />
                </div>

                {/* Demo URL */}
                <div className="rounded-lg bg-white border border-[#E5E7EB] p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-md bg-[#111111] flex items-center justify-center">
                      <Link2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-[18px] font-semibold text-[#111111] tracking-tight">Demo link</h2>
                      <p className="text-[13px] text-[#6B7280]">Where can people try it?</p>
                    </div>
                  </div>

                  <input
                    type="url"
                    value={demoUrl}
                    onChange={(e) => setDraft({ demoUrl: e.target.value })}
                    placeholder="https://your-project.vercel.app"
                    className={inputCls("demo_url")}
                  />
                  {fieldError("demo_url") && (
                    <p className="flex items-center gap-1.5 text-[12px] font-medium text-red-500 mt-2 pl-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {fieldError("demo_url")}
                    </p>
                  )}
                  <AnimatePresence>
                    <DemoUrlPreview url={demoUrl} />
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Review ───────────────────────── */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease }}
                className="rounded-lg bg-white border border-[#E5E7EB] p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-md bg-[#111111] flex items-center justify-center">
                    <Rocket className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-semibold text-[#111111] tracking-tight">Looking good!</h2>
                    <p className="text-[13px] text-[#6B7280]">Review and submit your project</p>
                  </div>
                </div>

                {/* Preview card inline */}
                <div className="mb-6">
                  <PreviewCard
                    title={title}
                    tagline={tagline}
                    category={category}
                    techStack={techStack}
                  />
                </div>

                {/* Editable summary */}
                <div className="space-y-1 rounded-md bg-[#FAFAFA] border border-[#E5E7EB] divide-y divide-[#E5E7EB] overflow-hidden">
                  {[
                    { label: "Name", value: title || "Not set", editStep: 1 },
                    { label: "Tagline", value: tagline || "Not set", editStep: 1 },
                    {
                      label: "Description",
                      value: description ? (description.length > 60 ? `${description.slice(0, 60)}...` : description) : "Not provided",
                      editStep: 1,
                    },
                    {
                      label: "Category",
                      value: categories.find((c) => c.value === category)?.label || "Not selected",
                      editStep: 1,
                    },
                    {
                      label: "Tech stack",
                      value: techStack.length > 0 ? techStack.join(", ") : "Not provided",
                      editStep: 1,
                    },
                    { label: "Demo URL", value: demoUrl || "Not provided", editStep: 1 },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-4 px-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.06em]">
                          {item.label}
                        </span>
                        <p className="text-[13px] text-[#111111] font-medium truncate mt-0.5">
                          {item.value}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(item.editStep)}
                        className="shrink-0 text-[12px] font-medium text-[#9CA3AF] hover:text-[#111111] transition-colors px-2 py-1 rounded-lg hover:bg-white"
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Navigation Buttons ──────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex items-center justify-between mt-8 gap-4"
          >
            <div>
              {step > 1 && (
                <motion.button
                  type="button"
                  onClick={prevStep}
                  whileHover={{ x: -2 }}
                  className="flex items-center gap-2 px-5 py-3 rounded-md border border-[#E5E7EB] bg-white text-[14px] font-semibold text-[#4B5563] hover:border-[#D1D5DB] hover:text-[#111111] transition-all duration-200"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </motion.button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {step < 2 ? (
                <motion.button
                  type="button"
                  onClick={nextStep}
                  whileHover={{ x: 2 }}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 px-6 py-3 rounded-md text-[14px] font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: canProceed() ? "#111111" : "#E5E5E5",
                    color: canProceed() ? "#ffffff" : "#9CA3AF",
                  }}
                >
                  Next <ArrowRight className="w-4 h-4" />
                </motion.button>
              ) : (
                <motion.button
                  type="submit"
                  disabled={pending}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-8 py-3 rounded-md text-[14px] font-bold transition-all duration-200 disabled:opacity-50"
                  style={{ background: "#111111", color: "#ffffff" }}
                >
                  {pending ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Project <Rocket className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </motion.div>
        </form>

        {/* ── Live Preview Panel (desktop) ─────────── */}
        <div className="hidden lg:block">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease }}
            className="sticky top-24"
          >
            <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.1em] mb-3 pl-1">
              Live preview
            </p>
            <PreviewCard
              title={title}
              tagline={tagline}
              category={category}
              techStack={techStack}
            />

            {/* Completion checklist */}
            <div className="mt-4 p-4 rounded-lg bg-[#FAFAFA] border border-[#E5E7EB]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[12px] font-semibold text-[#4B5563]">Completion</p>
                <p className="text-[12px] font-bold text-[#111111]">
                  {Math.round(
                    ([title, tagline, category, techStack.length > 0, demoUrl].filter(Boolean).length / 5) * 100
                  )}%
                </p>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#E5E7EB] overflow-hidden mb-3">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "#111111" }}
                  animate={{
                    width: `${([title, tagline, category, techStack.length > 0, demoUrl].filter(Boolean).length / 5) * 100}%`,
                  }}
                  transition={{ duration: 0.5, ease }}
                />
              </div>
              <div className="space-y-2">
                {[
                  { done: !!title, label: "Project name" },
                  { done: !!tagline, label: "Tagline" },
                  { done: !!category, label: "Category" },
                  { done: techStack.length > 0, label: "Tech stack" },
                  { done: !!demoUrl, label: "Demo URL" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center transition-colors"
                      style={{
                        background: item.done ? "#111111" : "#E5E7EB",
                      }}
                    >
                      {item.done && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span
                      className="text-[12px] font-medium"
                      style={{ color: item.done ? "#111111" : "#9CA3AF" }}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Auto-save indicator */}
            <p className="text-[11px] text-[#9CA3AF] mt-3 pl-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3" /> Draft auto-saved
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
