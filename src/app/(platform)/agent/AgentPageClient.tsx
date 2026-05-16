"use client";

import { FormEvent, useState } from "react";
import { ArrowUp, Code2, Compass, Loader2, Search, Trophy, Users } from "lucide-react";

const EXAMPLE_QUERIES = [
  { icon: Search, label: "Find React builders with agent experience" },
  { icon: Users, label: "Build a team for the hackathon" },
  { icon: Code2, label: "Show projects using LangChain" },
  { icon: Trophy, label: "What hackathons are active?" },
];

export default function AgentPageClient() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState(
    "Ask about builders, projects, hackathons, or teams. Scout will return a short answer with the strongest matches first."
  );
  const [isLoading, setIsLoading] = useState(false);

  async function runQuery(nextQuery: string) {
    const message = nextQuery.trim();
    if (!message || isLoading) return;

    setQuery(message);
    setIsLoading(true);
    setAnswer("Searching the network...");

    try {
      const response = await fetch("/api/agent/scout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history: [] }),
      });

      if (!response.ok) throw new Error(`Request failed (${response.status})`);

      const data = (await response.json()) as { response?: string };
      setAnswer(data.response || "No matching signal found yet.");
    } catch {
      setAnswer("Scout could not complete that search. Try a more specific builder, skill, or project query.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runQuery(query);
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#0A0A0A]">
      <section className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto max-w-[960px] px-6 pb-14 pt-16 sm:px-10">
          <div className="inline-flex items-center gap-2 rounded-md border border-[#E5E7EB] bg-[#F7F8FA] px-3 py-1.5 text-[12px] font-semibold text-[#4B5563]">
            <Compass className="h-3.5 w-3.5" />
            Scout
          </div>
          <h1 className="mt-5 max-w-[760px] text-[42px] font-semibold leading-[1] tracking-[-0.04em] sm:text-[58px]">
            Ask anything about the network.
          </h1>
          <p className="mt-5 max-w-[560px] text-[16px] leading-[1.6] text-[#4B5563]">
            Search builders, compare shipped projects, find active Briefs, and
            assemble a shortlist from real work.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[960px] px-6 py-10 sm:px-10">
        <form
          onSubmit={handleSubmit}
          className="rounded-md border border-[#E5E7EB] bg-white p-3 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <Search className="ml-2 h-4 w-4 shrink-0 text-[#9CA3AF]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find builders by skill, project, or brief..."
              className="min-h-12 flex-1 bg-transparent text-[15px] text-[#0A0A0A] outline-none placeholder:text-[#9CA3AF]"
            />
            <button
              type="submit"
              disabled={!query.trim() || isLoading}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#0A0A0A] text-white transition-colors hover:bg-[#2A2A2A] disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Ask Scout"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
            </button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {EXAMPLE_QUERIES.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => runQuery(item.label)}
                className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px] font-medium text-[#4B5563] transition-colors hover:border-[#D1D5DB] hover:text-[#0A0A0A]"
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="mt-8 rounded-md border border-[#E5E7EB] bg-white p-6">
          <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">
            Result
          </div>
          <div className="mt-4 whitespace-pre-wrap text-[15px] leading-[1.7] text-[#374151]">
            {answer}
          </div>
        </div>
      </section>
    </div>
  );
}
