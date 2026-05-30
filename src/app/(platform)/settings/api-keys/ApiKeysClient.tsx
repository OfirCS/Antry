"use client";

import { useState } from "react";
import { Copy, Check, Trash2, Terminal, Shield, Plus } from "lucide-react";
import { SettingsCard } from "../_components/SettingsCard";

export type ApiKeyRow = {
  id: string;
  label: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
};

/**
 * Cursor tokens — mint, reveal, revoke.
 *
 * The dark reveal card autosizes around the secret and offers a single
 * copy action. Revoked tokens stay visible (dimmed) so the audit trail
 * is readable; they don't take a destructive action. "Test in Cursor"
 * hint sits below the snippet to bridge the user to the IDE.
 */
export function ApiKeysClient({
  initialKeys,
}: {
  initialKeys: ApiKeyRow[];
}) {
  const [keys, setKeys] = useState<ApiKeyRow[]>(initialKeys);
  const [label, setLabel] = useState("Cursor MCP");
  const [minting, setMinting] = useState(false);
  const [justMinted, setJustMinted] = useState<{
    id: string;
    token: string;
    label: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mint = async () => {
    setMinting(true);
    setError(null);
    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      });
      const j = (await res.json()) as
        | { id: string; token: string; label: string }
        | { error: string };
      if ("error" in j) {
        setError(j.error);
        return;
      }
      setJustMinted({ id: j.id, token: j.token, label: j.label });
      setKeys((prev) => [
        {
          id: j.id,
          label: j.label,
          created_at: new Date().toISOString(),
          last_used_at: null,
          revoked_at: null,
        },
        ...prev,
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setMinting(false);
    }
  };

  const revoke = async (id: string) => {
    if (!confirm("Revoke this token? Cursor will lose access immediately."))
      return;
    const res = await fetch(`/api/api-keys?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setKeys((prev) =>
        prev.map((k) =>
          k.id === id ? { ...k, revoked_at: new Date().toISOString() } : k
        )
      );
    }
  };

  const copyToken = async () => {
    if (!justMinted) return;
    await navigator.clipboard.writeText(justMinted.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const live = keys.filter((k) => !k.revoked_at);
  const revoked = keys.filter((k) => k.revoked_at);

  return (
    <>
      {/* Just-minted reveal — autosizing dark card */}
      {justMinted && (
        <SettingsCard
          title="New token"
          caption="Copy this now. We only store the HMAC — you can't retrieve it later."
        >
          <div className="p-6 sm:p-7">
            <div className="mb-3 flex items-center gap-2">
              <Shield className="h-3.5 w-3.5" style={{ color: "#0A0A0A" }} />
              <span
                className="text-[11px] font-bold uppercase tracking-[0.22em]"
                style={{ color: "#0A0A0A" }}
              >
                {justMinted.label}
              </span>
            </div>
            <div
              className="flex items-start gap-2 rounded-[12px] p-3"
              style={{ background: "#0A0A0A" }}
            >
              <code
                className="flex-1 break-all font-mono text-[12px] leading-[1.55]"
                style={{ color: "#FFFFFF" }}
              >
                {justMinted.token}
              </code>
              <button
                type="button"
                onClick={copyToken}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-transform hover:-translate-y-0.5"
                style={{ background: "#C6F135", color: "#0A0A0A" }}
                aria-label="Copy token"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            <details className="mt-4 text-[13px]">
              <summary
                className="inline-flex cursor-pointer items-center gap-1.5 font-semibold"
                style={{ color: "#0A0A0A" }}
              >
                <Terminal className="h-3 w-3" />
                Paste into ~/.cursor/mcp.json
              </summary>
              <pre
                className="mt-3 overflow-x-auto rounded-[12px] p-4 text-[11px] leading-[1.55]"
                style={{
                  background: "#FAFAF7",
                  border: "1px solid #EBEBEB",
                  color: "#0A0A0A",
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, monospace",
                }}
              >
{`{
  "mcpServers": {
    "antry": {
      "url": "https://antry.com/api/mcp",
      "headers": {
        "Authorization": "Bearer ${justMinted.token}"
      }
    }
  }
}`}
              </pre>
              <p
                className="mt-3 text-[12px]"
                style={{ color: "#737373" }}
              >
                Test in Cursor{" "}
                <span aria-hidden="true">&rarr;</span> open the chat, ask
                &ldquo;list my Antry receipts&rdquo;. If you see your feed, the
                handshake worked.
              </p>
            </details>
          </div>
        </SettingsCard>
      )}

      {/* Mint form */}
      <SettingsCard
        title="Mint"
        caption="Name a token for the surface that will use it (e.g. Cursor, work laptop, CI)."
      >
        <div className="p-6 sm:p-7">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Cursor MCP"
              maxLength={80}
              className="h-[42px] min-w-[200px] flex-1 rounded-[10px] border bg-white px-4 text-[14px] font-medium outline-none transition-colors focus:border-[#0A0A0A]"
              style={{ borderColor: "#EBEBEB" }}
            />
            <button
              type="button"
              onClick={mint}
              disabled={minting || !label.trim()}
              className="inline-flex h-[42px] items-center justify-center gap-1.5 rounded-full px-5 text-[13px] font-bold transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: "#0A0A0A", color: "#FFFFFF" }}
            >
              {minting ? (
                "Minting…"
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                  Mint token
                </>
              )}
            </button>
          </div>
          {error && (
            <p
              className="mt-3 text-[13px] font-semibold"
              style={{ color: "#dc2626" }}
            >
              {error}
            </p>
          )}
        </div>
      </SettingsCard>

      {/* Active keys */}
      <SettingsCard title={`Active · ${live.length}`}>
        {live.length === 0 ? (
          <div
            className="p-8 text-center"
            style={{ color: "#737373" }}
          >
            <p className="text-[14px] font-semibold" style={{ color: "#0A0A0A" }}>
              Mint your first token to connect Cursor.
            </p>
            <p className="mt-1.5 text-[12px]">
              One token per surface. Revoke anytime.
            </p>
          </div>
        ) : (
          <ul className="divide-y" style={{ borderColor: "#EBEBEB" }}>
            {live.map((k) => (
              <KeyRow key={k.id} k={k} onRevoke={() => revoke(k.id)} />
            ))}
          </ul>
        )}
      </SettingsCard>

      {/* Revoked keys — dimmed, not hidden */}
      {revoked.length > 0 && (
        <SettingsCard title={`Revoked · ${revoked.length}`}>
          <ul
            className="divide-y opacity-60"
            style={{ borderColor: "#EBEBEB" }}
          >
            {revoked.map((k) => (
              <KeyRow key={k.id} k={k} disabled />
            ))}
          </ul>
        </SettingsCard>
      )}
    </>
  );
}

function KeyRow({
  k,
  onRevoke,
  disabled,
}: {
  k: ApiKeyRow;
  onRevoke?: () => void;
  disabled?: boolean;
}) {
  return (
    <li className="grid grid-cols-[1fr_auto] items-center gap-3 px-6 py-4 sm:px-7">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="truncate text-[14px] font-bold tracking-[-0.005em]"
            style={{ color: "#0A0A0A" }}
          >
            {k.label}
          </span>
          <code
            className="font-mono text-[10px]"
            style={{ color: "#A3A3A3" }}
          >
            {k.id.slice(0, 8)}
          </code>
        </div>
        <p className="mt-1 text-[11px]" style={{ color: "#737373" }}>
          Created {new Date(k.created_at).toLocaleDateString()}
          {k.last_used_at
            ? ` · Last used ${new Date(k.last_used_at).toLocaleDateString()}`
            : " · Never used"}
          {k.revoked_at
            ? ` · Revoked ${new Date(k.revoked_at).toLocaleDateString()}`
            : ""}
        </p>
      </div>
      {!disabled && onRevoke && (
        <button
          type="button"
          onClick={onRevoke}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-red-50 hover:text-red-600"
          style={{ color: "#737373" }}
          aria-label="Revoke token"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </li>
  );
}
