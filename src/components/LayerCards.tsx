"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const layers = [
  {
    num: "01",
    title: "Project Showcase",
    desc: "A dedicated profile for every builder. Live demos, technical walkthroughs, and shipped work — focusing on what you've actually built, not just your job title.",
    accent: "group-hover:border-blue-100",
  },
  {
    num: "02",
    title: "Build Challenges",
    desc: "Participate in sponsored events with real prizes and visibility. Developers compete to build high-quality solutions, with the best projects rising to the top.",
    accent: "group-hover:border-blue-100",
  },
  {
    num: "03",
    title: "Launch Support",
    desc: "We identify high-potential prototypes within the community and provide the support needed to turn them into validated, scalable products.",
    accent: "group-hover:border-blue-100",
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

export function LayerCards({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      {layers.map((layer, i) => (
        <motion.div
          key={layer.num}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: i * 0.1, ease }}
          className={cn(
            "group flex flex-col md:flex-row items-center gap-10 border border-gray-100 rounded-2xl p-8 transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-gray-200/40",
            layer.accent
          )}
        >
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors">
            <span className="text-lg font-bold text-blue-600 tracking-tight">{layer.num}</span>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{layer.title}</h3>
            <p className="text-gray-500 leading-relaxed max-w-2xl">{layer.desc}</p>
          </div>
          <div className="hidden md:block">
             <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-300 group-hover:text-blue-600 group-hover:border-blue-200 transition-all">
                <ArrowRight className="w-4 h-4" />
             </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
