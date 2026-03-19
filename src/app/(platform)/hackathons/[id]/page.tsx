"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Users, Trophy, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getHackathon, formatDate } from "@/lib/mock-data";

export default function HackathonDetailPage() {
  const { id } = useParams() as { id: string };
  const h = getHackathon(id);

  if (!h) {
    return (
      <div className="max-w-[740px] mx-auto px-6 py-20 text-center">
        <p className="text-text-tertiary text-[14px]">Hackathon not found.</p>
        <Link href="/hackathons" className="text-[13px] text-accent mt-3 inline-block">Back</Link>
      </div>
    );
  }

  const dotColor = h.status === "active" ? "bg-green-500" : h.status === "upcoming" ? "bg-accent" : "bg-text-tertiary";
  const label = h.status === "active" ? "Live now" : h.status === "upcoming" ? "Upcoming" : "Ended";
  const total = h.prizes.map((p) => parseInt(p.reward.replace(/\D/g, "")) || 0).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
      <Link href="/hackathons" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-blue-600 transition-colors mb-12">
        <ArrowLeft className="w-4 h-4" /> Back to Hackathons
      </Link>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-8">
          <span className={cn("w-2.5 h-2.5 rounded-full shadow-sm", dotColor)} />
          <span className={cn("text-xs font-bold uppercase tracking-widest", h.status === "active" ? "text-green-600" : h.status === "upcoming" ? "text-blue-600" : "text-gray-400")}>{label}</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-[1.1]">{h.title}</h1>
        <p className="text-xl text-gray-500 mb-12 leading-relaxed max-w-2xl">{h.theme}</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-16 p-8 bg-gray-50 rounded-3xl border-2 border-gray-100">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Timeline</span>
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <Calendar className="w-4 h-4 text-blue-600" />
              {formatDate(h.startDate)} — {formatDate(h.endDate)}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Prize Pool</span>
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <Trophy className="w-4 h-4 text-yellow-500" />
              ${total.toLocaleString()} total
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Builders</span>
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <Users className="w-4 h-4 text-purple-500" />
              {h.participantCount} registered
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
        <div className="lg:col-span-8 space-y-12">
          <section>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">About</h3>
            <p className="text-lg text-gray-600 leading-relaxed whitespace-pre-wrap">{h.description}</p>
          </section>

          <section>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Schedule</h3>
            <div className="space-y-4">
              {[
                { time: "Day 1 AM", event: "Kickoff & team formation", icon: <Users className="w-4 h-4" /> },
                { time: "Day 1 PM", event: "Development phase begins", icon: <Clock className="w-4 h-4" /> },
                { time: "Day 2", event: "Deep building — mentor check-ins", icon: <Clock className="w-4 h-4" /> },
                { time: "Day 3 AM", event: "Final submissions due", icon: <Calendar className="w-4 h-4" /> },
                { time: "Day 3 PM", event: "Live demos & awards", icon: <Trophy className="w-4 h-4" /> },
              ].map((item, i) => (
                <div key={i} className="flex gap-6 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm transition-all hover:border-gray-200">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                    {item.icon}
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{item.time}</span>
                    <p className="text-base font-semibold text-gray-900">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-12">
          <section>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Prize Tiers</h3>
            <div className="space-y-3">
              {h.prizes.map((p) => (
                <div key={p.place} className="bg-white border-2 border-gray-50 rounded-2xl p-5 shadow-sm">
                  <div className="text-2xl font-bold text-gray-900">${p.reward}</div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{p.place}</div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Partners</h3>
            <div className="flex flex-wrap gap-2">
              {h.sponsors.map((s) => (
                <span key={s} className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-full text-sm font-bold text-gray-600 shadow-sm">
                  {s}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>

      {h.status !== "completed" ? (
        <div className="sticky bottom-8 left-0 right-0 max-w-2xl mx-auto">
          <div className="bg-white p-6 rounded-3xl shadow-2xl shadow-gray-200 border border-gray-50 flex items-center justify-between gap-6 animate-in slide-in-from-bottom-8">
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-gray-900">Ready to build?</p>
              <p className="text-xs text-gray-500 font-medium">{h.status === "active" ? `${h.submissionCount} projects shipped` : "Free to enter solo or as a team"}</p>
            </div>
            <Link href="/signup" className="flex-1 sm:flex-none inline-flex items-center justify-center gap-3 px-10 py-4 bg-blue-600 text-white rounded-2xl text-base font-bold hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 transition-all active:scale-[0.98]">
              {h.status === "active" ? "Submit Project" : "Register Now"} <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="pt-12 border-t border-gray-100 text-center">
          <p className="text-lg text-gray-500 font-medium">{h.submissionCount} projects created by {h.participantCount} builders.</p>
          <Link href="/discover" className="text-blue-600 font-bold mt-4 inline-flex items-center gap-2 hover:underline">
            Browse the projects <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      )}
    </div>
  );
}
