"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Building2,
  FileText,
  Fingerprint,
  Newspaper,
  Plus,
  Search,
  Send,
  Trophy,
  Users,
} from "lucide-react";
import { AntryLogoFull } from "@/components/AntryLogo";
import type { AiNewsItem } from "@/lib/ai-news";

type ChatMode = "news" | "coders" | "briefs" | "receipts" | "hackathons" | "companies";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

type FeaturedBuilder = {
  username: string;
  name: string;
  tagline: string;
  skills: string[];
  projectCount: number;
};

type FeaturedBrief = {
  slug: string;
  title: string;
  company: string;
  difficulty: string;
  attempts: number;
  receipts: number;
};

type FeaturedReceipt = {
  id: string;
  title: string;
  builder: string;
  company: string;
  score: number;
};

type FeaturedHackathon = {
  slug: string;
  title: string;
  theme: string;
  status: string;
  participants: number;
};

type AntryChatHomeProps = {
  news: AiNewsItem[];
  builders: FeaturedBuilder[];
  briefs: FeaturedBrief[];
  receipts: FeaturedReceipt[];
  hackathons: FeaturedHackathon[];
};

const CHAT_MODES: Array<{
  id: ChatMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  prompt: string;
}> = [
  { id: "news", label: "AI news", icon: Newspaper, prompt: "Latest serious AI news" },
  { id: "coders", label: "Vibe coders", icon: Users, prompt: "Find vibe coders" },
  { id: "briefs", label: "Briefs", icon: FileText, prompt: "Browse briefs" },
  { id: "receipts", label: "Receipts", icon: Fingerprint, prompt: "Review receipts" },
  { id: "hackathons", label: "Hackathons", icon: Trophy, prompt: "Post a hackathon" },
  { id: "companies", label: "Companies", icon: Building2, prompt: "Hire builders" },
];

const MODE_REPLIES: Record<ChatMode, string> = {
  news: "Here are the most serious AI headlines I found.",
  coders: "Here are AI-native builders with visible shipping signal.",
  briefs: "Here are live Briefs you can open now.",
  receipts: "Here are recent proof objects with scores and verifier paths.",
  hackathons: "Here are hackathon lanes you can run or join.",
  companies: "Here are the fastest company actions.",
};

export function AntryChatHome({
  news,
  builders,
  briefs,
  receipts,
  hackathons,
}: AntryChatHomeProps) {
  const [activeMode, setActiveMode] = useState<ChatMode>("news");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro",
      role: "assistant",
      text: "What should we build today?",
    },
  ]);

  const activeModeMeta = useMemo(
    () => CHAT_MODES.find((mode) => mode.id === activeMode) ?? CHAT_MODES[0],
    [activeMode],
  );

  function runMode(mode: ChatMode, prompt = CHAT_MODES.find((item) => item.id === mode)?.prompt ?? "Ask Antry") {
    setActiveMode(mode);
    setMessages((current) => [
      ...current,
      {
        id: `user-${Date.now()}`,
        role: "user",
        text: prompt,
      },
      {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: MODE_REPLIES[mode],
      },
    ]);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const prompt = input.trim();

    if (!prompt) {
      return;
    }

    const mode = inferMode(prompt);
    setInput("");
    runMode(mode, prompt);
  }

  function resetChat() {
    setActiveMode("news");
    setInput("");
    setMessages([
      {
        id: "intro",
        role: "assistant",
        text: "What should we build today?",
      },
    ]);
  }

  return (
    <main className="h-[100svh] overflow-hidden bg-white text-black">
      <div className="grid h-full grid-cols-1 lg:grid-cols-[244px_minmax(0,1fr)] xl:grid-cols-[244px_minmax(0,1fr)_340px]">
        <aside className="hidden min-h-0 border-r border-black bg-white lg:flex lg:flex-col">
          <div className="border-b border-black p-5">
            <Link href="/" className="inline-flex items-center gap-3 font-display text-[18px] font-bold uppercase">
              <AntryLogoFull size={32} tone="dark" />
            </Link>
          </div>

          <div className="border-b border-black p-4">
            <button
              type="button"
              onClick={resetChat}
              className="inline-flex h-11 w-full items-center justify-center gap-2 border border-black bg-black px-4 text-[14px] font-bold text-white transition-colors hover:bg-white hover:text-black"
            >
              <Plus className="h-4 w-4" />
              New chat
            </button>
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto p-3">
            <p className="px-2 py-2 text-[11px] font-bold uppercase">Ask</p>
            <div className="space-y-1">
              {CHAT_MODES.map((mode) => {
                const Icon = mode.icon;
                const selected = activeMode === mode.id;

                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => runMode(mode.id, mode.prompt)}
                    className={[
                      "flex h-10 w-full items-center gap-3 border border-black px-3 text-left text-[14px] font-bold transition-colors",
                      selected ? "bg-black text-white" : "bg-white text-black hover:bg-black hover:text-white",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4" />
                    {mode.label}
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-black p-3">
            <LinkRow href="/dashboard" label="Dashboard" />
            <LinkRow href="/submit" label="Submit project" />
            <LinkRow href="/pricing" label="Pricing" />
          </div>
        </aside>

        <section className="flex min-h-0 flex-col bg-white">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-black px-4 lg:px-6">
            <Link href="/" className="inline-flex items-center gap-3 font-display text-[17px] font-bold uppercase lg:hidden">
              <AntryLogoFull size={32} tone="dark" />
            </Link>
            <div className="hidden items-center gap-2 lg:flex">
              <span className="inline-flex h-8 items-center border border-black px-3 text-[12px] font-bold uppercase">
                Ask Antry
              </span>
              <span className="inline-flex h-8 items-center border border-black px-3 text-[12px] font-bold uppercase">
                {activeModeMeta.label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/briefs"
                className="hidden h-10 items-center border border-black px-4 text-[13px] font-bold transition-colors hover:bg-black hover:text-white sm:inline-flex"
              >
                Briefs
              </Link>
              <Link
                href="/builders"
                className="hidden h-10 items-center border border-black px-4 text-[13px] font-bold transition-colors hover:bg-black hover:text-white sm:inline-flex"
              >
                Vibe coders
              </Link>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto flex min-h-full w-full max-w-[920px] flex-col px-4 py-6 sm:px-6 lg:px-8">
              <div className="mb-8 pt-4 text-center sm:pt-8">
                <h1 className="font-display text-[42px] font-bold leading-none text-black sm:text-[64px]">
                  Ask Antry
                </h1>
                <p className="mx-auto mt-5 max-w-[520px] text-[18px] font-bold leading-snug text-black">
                  What should we build today?
                </p>
              </div>

              <div className="mb-8 flex flex-wrap justify-center gap-2">
                {CHAT_MODES.slice(0, 5).map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => runMode(mode.id, mode.prompt)}
                    className="h-10 border border-black bg-white px-3 text-[13px] font-bold text-black transition-colors hover:bg-black hover:text-white"
                  >
                    {mode.prompt}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {messages.map((message) => (
                  <ChatBubble key={message.id} message={message} />
                ))}
              </div>

              <ModePanel
                mode={activeMode}
                news={news}
                builders={builders}
                briefs={briefs}
                receipts={receipts}
                hackathons={hackathons}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="shrink-0 border-t border-black bg-white p-3 sm:p-4">
            <div className="mx-auto flex max-w-[920px] items-center gap-2 border border-black bg-white p-2">
              <Search className="h-5 w-5 shrink-0 text-black" />
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Message Antry..."
                autoComplete="off"
                className="h-11 min-w-0 flex-1 bg-white px-2 text-[15px] font-bold text-black placeholder:text-black focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 bg-black px-4 text-[14px] font-bold text-white transition-colors hover:bg-white hover:text-black"
              >
                <span className="hidden sm:inline">Send</span>
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </section>

        <aside className="hidden min-h-0 border-l border-black bg-white xl:flex xl:flex-col">
          <div className="border-b border-black p-5">
            <p className="text-[11px] font-bold uppercase">Live context</p>
            <h2 className="mt-2 font-display text-[26px] font-bold leading-none">Platform feed</h2>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <RailSection title="AI news">
              {news.slice(0, 3).map((item) => (
                <RailLink key={item.id} href={item.url} label={item.title} meta={item.source} external />
              ))}
            </RailSection>

            <RailSection title="Vibe coders">
              {builders.slice(0, 4).map((builder) => (
                <RailLink
                  key={builder.username}
                  href={`/builders/${builder.username}`}
                  label={builder.name}
                  meta={`${builder.projectCount} projects`}
                />
              ))}
            </RailSection>

            <RailSection title="Fast actions">
              <RailLink href="/briefs" label="Browse live Briefs" meta="Open work" />
              <RailLink href="/hackathons/new" label="Run a hackathon" meta="Create event" />
              <RailLink href="/receipts/methodology" label="Receipt methodology" meta="Trust layer" />
            </RailSection>
          </div>
        </aside>
      </div>
    </main>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={[
          "max-w-[720px] border border-black px-4 py-3 text-[15px] font-bold leading-relaxed",
          isUser ? "bg-black text-white" : "bg-white text-black",
        ].join(" ")}
      >
        {message.text}
      </div>
    </div>
  );
}

function ModePanel({
  mode,
  news,
  builders,
  briefs,
  receipts,
  hackathons,
}: {
  mode: ChatMode;
  news: AiNewsItem[];
  builders: FeaturedBuilder[];
  briefs: FeaturedBrief[];
  receipts: FeaturedReceipt[];
  hackathons: FeaturedHackathon[];
}) {
  return (
    <section className="mt-5 border border-black bg-white">
      <div className="flex items-center justify-between border-b border-black p-4">
        <p className="text-[12px] font-bold uppercase">{CHAT_MODES.find((item) => item.id === mode)?.label}</p>
        <span className="text-[12px] font-bold uppercase">Live</span>
      </div>

      {mode === "news" && (
        <div>
          {news.length > 0 ? (
            news.map((item) => (
              <ResultLink
                key={item.id}
                href={item.url}
                title={item.title}
                meta={`${item.label} / ${item.source} / ${formatNewsTime(item.publishedAt)}`}
                external
              />
            ))
          ) : (
            <EmptyState label="No live headlines available." />
          )}
        </div>
      )}

      {mode === "coders" && (
        <div>
          {builders.map((builder) => (
            <ResultLink
              key={builder.username}
              href={`/builders/${builder.username}`}
              title={builder.name}
              meta={`${builder.tagline} / ${builder.skills.join(", ")} / ${builder.projectCount} projects`}
            />
          ))}
        </div>
      )}

      {mode === "briefs" && (
        <div>
          {briefs.map((brief) => (
            <ResultLink
              key={brief.slug}
              href={`/briefs/${brief.slug}`}
              title={brief.title}
              meta={`${brief.company} / ${brief.difficulty} / ${brief.attempts} attempts / ${brief.receipts} receipts`}
            />
          ))}
        </div>
      )}

      {mode === "receipts" && (
        <div>
          {receipts.map((receipt) => (
            <ResultLink
              key={receipt.id}
              href={`/receipts/${receipt.id}`}
              title={receipt.title}
              meta={`${receipt.builder} / ${receipt.company} / score ${receipt.score}`}
            />
          ))}
        </div>
      )}

      {mode === "hackathons" && (
        <div>
          {hackathons.map((hackathon) => (
            <ResultLink
              key={hackathon.slug}
              href={`/h/${hackathon.slug}`}
              title={hackathon.title}
              meta={`${hackathon.status} / ${hackathon.participants} builders / ${hackathon.theme}`}
            />
          ))}
          <div className="border-t border-black p-4">
            <Link
              href="/hackathons/new"
              className="inline-flex h-11 items-center justify-center border border-black bg-black px-4 text-[14px] font-bold text-white transition-colors hover:bg-white hover:text-black"
            >
              Post a hackathon
            </Link>
          </div>
        </div>
      )}

      {mode === "companies" && (
        <div>
          <ResultLink href="/companies" title="Hire from Receipts" meta="Review builders by evidence." />
          <ResultLink href="/hackathons/new" title="Post a Brief or hackathon" meta="Create real work and collect proof." />
          <ResultLink href="/pricing" title="See pricing" meta="Pick the company plan." />
          <ResultLink href="/api/v1/receipts" title="Receipts API" meta="Pull verified candidate signal." />
        </div>
      )}
    </section>
  );
}

function ResultLink({
  href,
  title,
  meta,
  external = false,
}: {
  href: string;
  title: string;
  meta: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="group grid gap-2 border-b border-black p-4 text-black last:border-b-0 transition-colors hover:bg-black hover:text-white sm:grid-cols-[1fr_auto] sm:items-center"
    >
      <span>
        <span className="block text-[17px] font-bold leading-snug">{title}</span>
        <span className="mt-2 block text-[13px] font-bold leading-snug">{meta}</span>
      </span>
      <ArrowUpRight className="h-5 w-5" />
    </a>
  );
}

function RailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-black p-4">
      <h3 className="mb-3 text-[12px] font-bold uppercase">{title}</h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function RailLink({
  href,
  label,
  meta,
  external = false,
}: {
  href: string;
  label: string;
  meta: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="block border border-black p-3 text-black transition-colors hover:bg-black hover:text-white"
    >
      <span className="block text-[13px] font-bold leading-snug">{label}</span>
      <span className="mt-1 block text-[11px] font-bold uppercase">{meta}</span>
    </a>
  );
}

function LinkRow({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex h-10 items-center justify-between border border-black px-3 text-[13px] font-bold text-black transition-colors hover:bg-black hover:text-white [&+&]:mt-2"
    >
      {label}
      <ArrowUpRight className="h-4 w-4" />
    </Link>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="p-4 text-[14px] font-bold text-black">{label}</div>;
}

function inferMode(prompt: string): ChatMode {
  const value = prompt.toLowerCase();

  if (/\b(news|headline|perplexity|x|twitter|serious|regulation|lawsuit|safety)\b/.test(value)) {
    return "news";
  }

  if (/\b(receipt|receipts|proof|score|verify|methodology)\b/.test(value)) {
    return "receipts";
  }

  if (/\b(coder|coders|builder|builders|vibe|talent|candidate)\b/.test(value)) {
    return "coders";
  }

  if (/\b(hackathon|hackathons|event|challenge|competition)\b/.test(value)) {
    return "hackathons";
  }

  if (/\b(company|companies|hire|pricing|post|recruit)\b/.test(value)) {
    return "companies";
  }

  return "briefs";
}

function formatNewsTime(value: string) {
  const time = Date.parse(value);

  if (!Number.isFinite(time)) {
    return "recent";
  }

  const seconds = Math.round((time - Date.now()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(days) >= 1) {
    return formatter.format(days, "day");
  }

  if (Math.abs(hours) >= 1) {
    return formatter.format(hours, "hour");
  }

  return formatter.format(minutes, "minute");
}
