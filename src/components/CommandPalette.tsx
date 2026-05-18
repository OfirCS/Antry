"use client";

/**
 * CommandPalette — global Cmd/Ctrl+K search.
 *
 * Mounted once in Nav.tsx. It owns its own open/close state and the
 * global keyboard shortcut. The Nav also renders a visible trigger button
 * so the feature is discoverable for mouse/touch users.
 *
 * Searches builders + projects + hackathons + briefs via the
 * `searchEverything` server action. Fully keyboard-navigable:
 *   - Cmd/Ctrl+K     open
 *   - Esc            close
 *   - ↑ / ↓          move selection
 *   - Enter          open the highlighted result
 */

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Loader2,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  User,
  Rocket,
  Trophy,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import {
  searchEverything,
  type SearchResult,
  type SearchResultType,
} from "@/app/(platform)/search-actions";

/* ── Result-type presentation ──────────────────────────── */

const TYPE_META: Record<
  SearchResultType,
  { label: string; icon: typeof User }
> = {
  builder: { label: "Builder", icon: User },
  project: { label: "Project", icon: Rocket },
  hackathon: { label: "Hackathon", icon: Trophy },
  brief: { label: "Brief", icon: FileText },
};

const GROUP_ORDER: SearchResultType[] = [
  "builder",
  "project",
  "hackathon",
  "brief",
];

/* ── Hook: detect mac for the ⌘ vs Ctrl hint ───────────── */

const noopSubscribe = () => () => {};

function useIsMac(): boolean {
  // navigator is browser-only — read it via useSyncExternalStore so the
  // server snapshot (false) and client snapshot stay hydration-safe without
  // a setState-in-effect.
  return useSyncExternalStore(
    noopSubscribe,
    () =>
      typeof navigator !== "undefined" &&
      /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent),
    () => false,
  );
}

/* ── Visible trigger (rendered inside the Nav) ─────────── */

export function CommandPaletteTrigger({
  onOpen,
  className,
}: {
  onOpen: () => void;
  className?: string;
}) {
  const isMac = useIsMac();
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Search Antry"
      className={cn(
        "group flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3 h-9",
        "text-[13px] font-medium text-[#9CA3AF] transition-colors hover:border-[#D1D5DB] hover:text-[#4B5563]",
        className,
      )}
    >
      <Search className="h-4 w-4" />
      <span className="hidden xl:inline">Search</span>
      <kbd className="hidden xl:inline-flex items-center gap-0.5 rounded border border-[#E5E7EB] bg-[#F7F8FA] px-1.5 py-0.5 text-[10px] font-semibold text-[#9CA3AF]">
        {isMac ? "⌘" : "Ctrl"} K
      </kbd>
    </button>
  );
}

/* ── Main palette ──────────────────────────────────────── */

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  // Guards against out-of-order server-action responses.
  const requestSeq = useRef(0);
  const listboxId = useId();

  useEffect(() => setMounted(true), []);

  // Reset transient state every time the palette opens.
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setActive(0);
      const t = window.setTimeout(() => inputRef.current?.focus(), 40);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Debounced search.
  useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const seq = ++requestSeq.current;
    const t = window.setTimeout(async () => {
      try {
        const res = await searchEverything(trimmed);
        if (seq !== requestSeq.current) return; // stale
        setResults(res.results);
        setActive(0);
      } catch {
        if (seq === requestSeq.current) setResults([]);
      } finally {
        if (seq === requestSeq.current) setLoading(false);
      }
    }, 180);
    return () => window.clearTimeout(t);
  }, [query, open]);

  // Group results while preserving the relevance order within each group.
  const grouped = useMemo(() => {
    const map = new Map<SearchResultType, SearchResult[]>();
    for (const r of results) {
      const arr = map.get(r.type) ?? [];
      arr.push(r);
      map.set(r.type, arr);
    }
    return GROUP_ORDER.filter((t) => map.has(t)).map((t) => ({
      type: t,
      items: map.get(t)!,
    }));
  }, [results]);

  // Flat list mirrors render order so arrow-key indices line up.
  const flat = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);

  const go = useCallback(
    (result: SearchResult | undefined) => {
      if (!result) return;
      onClose();
      router.push(result.href);
    },
    [onClose, router],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (flat.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => (i + 1) % flat.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => (i - 1 + flat.length) % flat.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        go(flat[active]);
      }
    },
    [flat, active, go, onClose],
  );

  // Keep the active row scrolled into view.
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(
      `[data-result-index="${active}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]"
          role="dialog"
          aria-modal="true"
          aria-label="Search Antry"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="relative w-full max-w-[600px] overflow-hidden rounded-xl bg-white shadow-[0_24px_64px_-12px_rgba(0,0,0,0.28)] border border-[#E5E7EB]"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            onKeyDown={onKeyDown}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-[#F3F4F6] px-4">
              {loading ? (
                <Loader2 className="h-[18px] w-[18px] shrink-0 animate-spin text-[#9CA3AF]" />
              ) : (
                <Search className="h-[18px] w-[18px] shrink-0 text-[#9CA3AF]" />
              )}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search builders, projects, hackathons, briefs..."
                aria-label="Search query"
                aria-controls={listboxId}
                aria-activedescendant={
                  flat.length > 0 ? `${listboxId}-opt-${active}` : undefined
                }
                className="h-14 flex-1 bg-transparent text-[15px] font-medium text-[#111111] outline-none placeholder:text-[#9CA3AF]"
              />
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded border border-[#E5E7EB] bg-[#F7F8FA] px-1.5 py-0.5 text-[10px] font-semibold text-[#9CA3AF] hover:text-[#4B5563]"
              >
                ESC
              </button>
            </div>

            {/* Results */}
            <div
              ref={listRef}
              id={listboxId}
              role="listbox"
              aria-label="Search results"
              className="max-h-[52vh] overflow-y-auto"
            >
              {query.trim().length < 2 ? (
                <div className="px-4 py-10 text-center">
                  <p className="text-[13px] text-[#9CA3AF]">
                    Type at least 2 characters to search the network.
                  </p>
                </div>
              ) : !loading && flat.length === 0 ? (
                <div className="p-4">
                  <EmptyState
                    icon={<Search className="h-6 w-6" />}
                    title="No matches found"
                    description={`Nothing matched "${query.trim()}". Try a different name, tech, or category.`}
                  />
                </div>
              ) : (
                grouped.map((group) => {
                  const meta = TYPE_META[group.type];
                  return (
                    <div key={group.type} className="py-1.5">
                      <p className="px-4 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#9CA3AF]">
                        {meta.label}s
                      </p>
                      {group.items.map((item) => {
                        const flatIndex = flat.indexOf(item);
                        const isActive = flatIndex === active;
                        const Icon = meta.icon;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            id={`${listboxId}-opt-${flatIndex}`}
                            data-result-index={flatIndex}
                            role="option"
                            aria-selected={isActive}
                            onClick={() => go(item)}
                            onMouseMove={() => setActive(flatIndex)}
                            className={cn(
                              "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                              isActive ? "bg-[#F3F4F6]" : "bg-transparent",
                            )}
                          >
                            <span
                              className={cn(
                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
                                isActive ? "bg-[#111111]" : "bg-[#F3F4F6]",
                              )}
                            >
                              <Icon
                                className={cn(
                                  "h-[18px] w-[18px]",
                                  isActive ? "text-white" : "text-[#6B7280]",
                                )}
                              />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[14px] font-semibold text-[#111111]">
                                {item.title}
                              </span>
                              <span className="block truncate text-[12px] text-[#9CA3AF]">
                                {item.subtitle}
                              </span>
                            </span>
                            {item.tags.length > 0 && (
                              <span className="hidden shrink-0 items-center gap-1 sm:flex">
                                {item.tags.slice(0, 2).map((tag) => (
                                  <span
                                    key={tag}
                                    className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[10px] font-medium text-[#6B7280]"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </span>
                            )}
                            {isActive && (
                              <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer hint */}
            <div className="flex items-center justify-between border-t border-[#F3F4F6] px-4 py-2.5 text-[11px] text-[#9CA3AF]">
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-[#E5E7EB] bg-[#F7F8FA] p-0.5">
                    <ArrowUp className="h-3 w-3" />
                  </kbd>
                  <kbd className="rounded border border-[#E5E7EB] bg-[#F7F8FA] p-0.5">
                    <ArrowDown className="h-3 w-3" />
                  </kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-[#E5E7EB] bg-[#F7F8FA] px-1 py-0.5">
                    <CornerDownLeft className="h-3 w-3" />
                  </kbd>
                  open
                </span>
              </span>
              {flat.length > 0 && (
                <span className="tabular-nums">
                  {flat.length} result{flat.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
