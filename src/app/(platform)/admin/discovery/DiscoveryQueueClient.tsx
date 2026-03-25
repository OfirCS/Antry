"use client";

import { useState, useTransition } from "react";
import {
  Search,
  ExternalLink,
  Check,
  X,
  Link2,
  Loader2,
  RefreshCw,
  Plus,
  Star,
  Clock,
  GitBranch
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  triggerScan,
  approveProject,
  rejectProject,
  generateClaimToken,
  importFromUrl,
} from "./actions";
import type { DiscoveredProject, ScanResult } from "@/lib/discovery/types";

type Tab = "pending" | "approved" | "rejected" | "all";

export function DiscoveryQueueClient({
  projects: initialProjects,
}: {
  projects: DiscoveredProject[];
}) {
  const [projects, setProjects] = useState(initialProjects);
  const [tab, setTab] = useState<Tab>("pending");
  const [importUrl, setImportUrl] = useState("");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [claimLinks, setClaimLinks] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);
  const [importError, setImportError] = useState("");

  const tabs: { value: Tab; label: string }[] = [
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "all", label: "All" },
  ];

  const filtered =
    tab === "all" ? projects : projects.filter((p) => p.status === tab);

  const counts = {
    pending: projects.filter((p) => p.status === "pending").length,
    approved: projects.filter((p) => p.status === "approved").length,
    rejected: projects.filter((p) => p.status === "rejected").length,
    all: projects.length,
  };

  function handleScan() {
    setScanResult(null);
    startTransition(async () => {
      const result = await triggerScan();
      setScanResult(result);
      // Reload page to get fresh data
      window.location.reload();
    });
  }

  function handleApprove(id: string) {
    setActionId(id);
    startTransition(async () => {
      await approveProject(id);
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "approved" as const } : p))
      );
      setActionId(null);
    });
  }

  function handleReject(id: string) {
    setActionId(id);
    startTransition(async () => {
      await rejectProject(id);
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "rejected" as const } : p))
      );
      setActionId(null);
    });
  }

  function handleGenerateLink(id: string) {
    setActionId(id);
    startTransition(async () => {
      const link = await generateClaimToken(id);
      setClaimLinks((prev) => ({ ...prev, [id]: link }));
      setActionId(null);
    });
  }

  function handleImport() {
    if (!importUrl.trim()) return;
    setImportError("");
    startTransition(async () => {
      const result = await importFromUrl(importUrl.trim());
      if (result.success) {
        setImportUrl("");
        window.location.reload();
      } else {
        setImportError(result.error || "Import failed");
      }
    });
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = Date.now();
    const days = Math.floor((now - d.getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return "today";
    if (days === 1) return "1 day ago";
    if (days < 30) return `${days} days ago`;
    return d.toLocaleDateString();
  }

  return (
    <div className="max-w-[960px] mx-auto px-6 py-16 sm:py-20 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 mb-8">
        <div>
          <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold tracking-tight text-text-primary mb-1">
            Discovery Queue
          </h1>
          <p className="text-[14px] text-text-secondary">
            Auto-discovered projects from GitHub. Review, approve, and share
            claim links.
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleScan}
          disabled={isPending}
        >
          {isPending && !actionId ? (
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          )}
          Trigger Scan
        </Button>
      </div>

      {/* Scan result */}
      {scanResult && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-[13px] text-green-800">
          Scan complete: {scanResult.discovered} new,{" "}
          {scanResult.skipped} skipped
          {scanResult.errors.length > 0 && (
            <span className="text-red-600">
              , {scanResult.errors.length} errors
            </span>
          )}
        </div>
      )}

      {/* Import from URL */}
      <div className="mb-8 rounded-xl border border-border-primary bg-surface p-5">
        <h3 className="text-[14px] font-semibold text-text-primary mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Import from URL
        </h3>
        <div className="flex gap-2">
          <input
            type="url"
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            placeholder="Paste GitHub repo or X post URL..."
            className="flex-1 h-9 rounded-lg border border-border-primary bg-background-primary px-3 text-[13px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleImport}
            disabled={isPending || !importUrl.trim()}
          >
            {isPending && !actionId ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              "Import"
            )}
          </Button>
        </div>
        {importError && (
          <p className="mt-2 text-[12px] text-red-500">{importError}</p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-border-primary">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${
              tab === t.value
                ? "border-accent text-text-primary"
                : "border-transparent text-text-tertiary hover:text-text-secondary"
            }`}
          >
            {t.label}
            <span className="ml-1.5 text-[11px] text-text-tertiary">
              {counts[t.value]}
            </span>
          </button>
        ))}
      </div>

      {/* Project list */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-primary bg-background-secondary/30 py-16 text-center">
          <Search className="w-10 h-10 text-text-tertiary mx-auto mb-4 opacity-30" />
          <p className="text-[15px] font-medium text-text-secondary mb-1">
            No projects
          </p>
          <p className="text-[13px] text-text-tertiary">
            {tab === "pending"
              ? 'Click "Trigger Scan" to discover projects from GitHub.'
              : `No ${tab} projects yet.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((project) => (
            <div
              key={project.id}
              className="rounded-xl border border-border-primary bg-surface p-5 transition-all hover:border-text-tertiary/30"
            >
              {/* Top row: score + title */}
              <div className="flex items-start gap-4 mb-3">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <span className="text-[14px] font-bold text-accent">
                    {project.quality_score}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-[15px] font-semibold text-text-primary truncate">
                      {project.title}
                    </h3>
                    {project.repo_url && (
                      <a
                        href={project.repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-tertiary hover:text-text-primary transition-colors shrink-0"
                      >
                        <GitBranch className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <p className="text-[13px] text-text-tertiary line-clamp-1">
                    {project.tagline}
                  </p>
                </div>
              </div>

              {/* Meta row */}
              <div className="flex items-center flex-wrap gap-3 mb-4 text-[12px] text-text-tertiary">
                {project.tech_stack.length > 0 && (
                  <span>{project.tech_stack.slice(0, 4).join(", ")}</span>
                )}
                {project.github_stars > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {project.github_stars}
                  </span>
                )}
                {project.github_last_pushed_at && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(project.github_last_pushed_at)}
                  </span>
                )}
                {project.demo_url && (
                  <a
                    href={project.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-accent hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Demo
                  </a>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                {project.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(project.id)}
                      disabled={isPending && actionId === project.id}
                    >
                      {isPending && actionId === project.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5 mr-1" />
                      )}
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(project.id)}
                      disabled={isPending && actionId === project.id}
                    >
                      <X className="w-3.5 h-3.5 mr-1" />
                      Reject
                    </Button>
                  </>
                )}

                {project.status === "approved" && !claimLinks[project.id] && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleGenerateLink(project.id)}
                    disabled={isPending && actionId === project.id}
                  >
                    <Link2 className="w-3.5 h-3.5 mr-1" />
                    Generate Claim Link
                  </Button>
                )}

                {claimLinks[project.id] && (
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={claimLinks[project.id]}
                      className="h-8 rounded-lg border border-border-primary bg-background-secondary px-3 text-[12px] text-text-secondary w-72 font-mono"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(claimLinks[project.id]);
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                )}

                {project.status === "rejected" && (
                  <span className="text-[12px] text-text-tertiary italic">
                    Rejected
                  </span>
                )}

                {project.status === "claimed" && (
                  <span className="text-[12px] text-green-600 font-medium">
                    Claimed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
