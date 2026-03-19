"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/supabase/auth-context";

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="max-w-[740px] mx-auto px-6 py-20">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded w-48" />
          <div className="h-4 bg-gray-100 rounded w-72" />
        </div>
      </div>
    );
  }

  const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Builder";

  return (
    <div className="max-w-[740px] mx-auto px-6 py-10 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-display text-[28px] md:text-[36px] text-text-primary leading-snug mb-2">
          Hey, {name}
        </h1>
        <p className="text-[14px] text-text-secondary mb-10">
          Your builder dashboard. Ship something great.
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 mb-10">
        <Link
          href="/submit"
          className="flex items-center gap-4 p-6 border border-border-tertiary rounded-xl hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[14px] font-medium text-text-primary group-hover:text-blue-600 transition-colors">
              Submit a project
            </div>
            <div className="text-[12px] text-text-tertiary">
              Showcase what you've built
            </div>
          </div>
        </Link>

        <Link
          href="/hackathons"
          className="flex items-center gap-4 p-6 border border-border-tertiary rounded-xl hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center text-white shrink-0">
            <ArrowRight className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[14px] font-medium text-text-primary group-hover:text-blue-600 transition-colors">
              Join a hackathon
            </div>
            <div className="text-[12px] text-text-tertiary">
              Build with the community
            </div>
          </div>
        </Link>
      </div>

      <div className="border border-border-tertiary rounded-xl p-8 text-center">
        <p className="text-[14px] text-text-tertiary mb-4">
          You haven't submitted any projects yet.
        </p>
        <Link
          href="/submit"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Submit your first project
        </Link>
      </div>
    </div>
  );
}
