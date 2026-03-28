"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Bot, Search, Users, Trophy, Code2 } from "lucide-react";
import { AgentHome } from "@/components/AgentHome";
import type { AgentHomeHandle } from "@/components/AgentHome";

const ease = [0.22, 1, 0.36, 1] as const;

const EXAMPLE_QUERIES = [
  { icon: Search, label: "Find React builders with AI experience" },
  { icon: Users, label: "Build a team for the AI hackathon" },
  { icon: Code2, label: "Show projects using LangChain" },
  { icon: Trophy, label: "What hackathons are active?" },
];

export default function AgentPageClient() {
  const agentRef = useRef<AgentHomeHandle>(null);

  const handleExampleClick = (query: string) => {
    agentRef.current?.triggerSearch(query);
  };

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF7" }}>
      {/* Compact header */}
      <div className="mx-auto max-w-[800px] px-6 pt-12 pb-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
          className="inline-flex items-center gap-2 rounded-full bg-[#111] px-3 py-1.5 text-[12px] font-semibold text-[#C6F135] mb-4"
        >
          <Bot className="h-3.5 w-3.5" />
          Scout AI
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease }}
          className="font-display text-[clamp(1.8rem,4vw,2.8rem)] font-bold tracking-[-0.03em] text-[#111]"
        >
          Ask anything about the network
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease }}
          className="mt-2 text-[15px] text-gray-500 max-w-[460px] mx-auto"
        >
          Find builders, explore projects, build teams, and discover hackathons.
        </motion.p>

        {/* Quick prompts */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease }}
          className="mt-6 flex flex-wrap justify-center gap-2"
        >
          {EXAMPLE_QUERIES.map((q, i) => (
            <button
              key={i}
              onClick={() => handleExampleClick(q.label)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[12px] font-medium text-gray-600 transition-all hover:border-gray-300 hover:text-[#111] hover:shadow-sm"
            >
              <q.icon className="h-3 w-3" />
              {q.label}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Agent interface - the star of the page */}
      <div className="pb-20">
        <AgentHome ref={agentRef} embedded />
      </div>
    </div>
  );
}
