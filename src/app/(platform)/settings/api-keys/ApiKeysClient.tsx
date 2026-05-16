"use client";

import { useState } from "react";
import { Key, Plus, Copy, Check, Trash2, Terminal, Shield } from "lucide-react";

export type ApiKeyRow = {
  id: string;
  label: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
};

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
    if (!confirm("Revoke this token? Cursor will lose access immediately.")) return;
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
    <main className="min-h-screen" style={{ background: "#F7F8FA" }}>
      <div className="mx-auto max-w-[920px] px-6 sm:px-10 py-12 sm:py-16">
        <div className="mb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-3 inline-flex items-center gap-2">
            <Key className="w-3 h-3" />
            API keys
          </p>
          <h1
            className="font-display font-bold tracking-[-0.03em] text-black leading-[1.05]"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)" }}
          >
            Cursor MCP tokens
          </h1>
          <p className="mt-4 max-w-[560px] text-[15px] leading-[1.6] text-gray-700">
            Each token authenticates your IDE against the Antry MCP gateway.
            Plaintext is shown <span className="font-bold">once</span> at mint
            time — copy it into your Cursor config immediately.
          </p>
        </div>

        {/* Just-minted reveal */}
        {justMinted && (
          <div
            className="mb-10 rounded-lg p-6"
            style={{
              background: "rgba(32,245,160,0.10)",
              border: "1.5px solid rgba(32,245,160,0.5)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-black" />
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-black">
                New token · {justMinted.label}
              </span>
            </div>
            <p className="text-[13px] text-gray-700 mb-3">
              Copy this now. We only store the HMAC — you can&apos;t retrieve
              it later.
            </p>
            <div
              className="rounded-[12px] p-3 flex items-center gap-2 mb-3"
              style={{ background: "#0A0A0A" }}
            >
              <code className="flex-1 font-mono text-[12px] text-white break-all">
                {justMinted.token}
              </code>
              <button
                type="button"
                onClick={copyToken}
                className="inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors shrink-0"
                style={{ background: "#20F5A0", color: "#0A0A0A" }}
                aria-label="Copy"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <details className="text-[13px]">
              <summary className="cursor-pointer font-semibold text-black inline-flex items-center gap-1.5">
                <Terminal className="w-3 h-3" />
                Paste into ~/.cursor/mcp.json
              </summary>
              <pre
                className="mt-3 rounded-[12px] p-4 text-[11px] leading-[1.55] font-mono text-gray-800 overflow-x-auto whitespace-pre"
                style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}
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
            </details>
          </div>
        )}

        {/* Mint form */}
        <div
          className="rounded-lg p-6 sm:p-7 mb-8"
          style={{ background: "white", border: "1px solid #E5E7EB" }}
        >
          <h2 className="text-[14px] font-bold tracking-[-0.005em] text-black mb-4">
            Mint a new token
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Label (e.g. Cursor MCP)"
              maxLength={80}
              className="flex-1 min-w-[200px] px-4 h-[44px] rounded-[12px] text-[14px] outline-none border-2 transition-colors"
              style={{ borderColor: "#E5E7EB", background: "#F7F8FA" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#0A0A0A")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
            <button
              type="button"
              onClick={mint}
              disabled={minting}
              className="inline-flex items-center justify-center gap-1.5 rounded-[12px] px-5 h-[44px] text-[13px] font-semibold whitespace-nowrap transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "#0A0A0A", color: "#FFFFFF" }}
            >
              {minting ? (
                "Minting…"
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  Mint token
                </>
              )}
            </button>
          </div>
          {error && (
            <p className="mt-3 text-[13px] font-semibold text-red-600">
              {error}
            </p>
          )}
        </div>

        {/* Active keys */}
        <h2 className="text-[12px] font-bold uppercase tracking-[0.22em] text-gray-500 mb-3">
          Active ({live.length})
        </h2>
        {live.length === 0 ? (
          <div
            className="rounded-lg p-6 text-center text-[13px] text-gray-500 mb-10"
            style={{ background: "white", border: "1px dashed #E5E7EB" }}
          >
            No active tokens. Mint one to start using Antry from Cursor.
          </div>
        ) : (
          <ul className="space-y-2 mb-10">
            {live.map((k) => (
              <KeyRow key={k.id} k={k} onRevoke={() => revoke(k.id)} />
            ))}
          </ul>
        )}

        {/* Revoked keys */}
        {revoked.length > 0 && (
          <>
            <h2 className="text-[12px] font-bold uppercase tracking-[0.22em] text-gray-400 mb-3">
              Revoked ({revoked.length})
            </h2>
            <ul className="space-y-2 opacity-60">
              {revoked.map((k) => (
                <KeyRow key={k.id} k={k} disabled />
              ))}
            </ul>
          </>
        )}
      </div>
    </main>
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
    <li
      className="rounded-lg p-4 grid grid-cols-[1fr_auto] items-center gap-3"
      style={{ background: "white", border: "1px solid #E5E7EB" }}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[14px] font-bold tracking-[-0.005em] text-black truncate">
            {k.label}
          </span>
          <code className="text-[10px] font-mono text-gray-500">{k.id}</code>
        </div>
        <p className="text-[11px] text-gray-500">
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
          className="inline-flex items-center justify-center w-9 h-9 rounded-md transition-colors text-gray-500 hover:text-red-600 hover:bg-red-50"
          aria-label="Revoke"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </li>
  );
}
