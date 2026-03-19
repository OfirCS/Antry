"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, ArrowRight, Settings, Trash2, Pencil, ArrowUpRight } from "lucide-react";
import { useAuth } from "@/lib/supabase/auth-context";
import { createClient } from "@/lib/supabase/client";
import { deleteProject } from "../actions";

type Project = {
  id: string;
  title: string;
  tagline: string;
  category: string;
  likes_count: number;
  created_at: string;
  demo_url: string | null;
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchProjects = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("projects")
        .select("id, title, tagline, category, likes_count, created_at, demo_url")
        .eq("builder_id", user.id)
        .order("created_at", { ascending: false });
      setProjects(data || []);
      setLoading(false);
    };

    fetchProjects();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="max-w-[740px] mx-auto px-6 py-20">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded w-48" />
          <div className="h-4 bg-gray-100 rounded w-72" />
        </div>
      </div>
    );
  }

  const name =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Builder";

  return (
    <div className="max-w-[740px] mx-auto px-6 py-10 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-[28px] md:text-[36px] font-bold text-gray-900 leading-snug">
            Hey, {name}
          </h1>
          <Link
            href="/settings"
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </Link>
        </div>
        <p className="text-[14px] text-gray-500 mb-10">
          Your builder dashboard. Ship something great.
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 mb-10">
        <Link
          href="/submit"
          className="flex items-center gap-4 p-6 border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[14px] font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
              Submit a project
            </div>
            <div className="text-[12px] text-gray-400">
              Showcase what you've built
            </div>
          </div>
        </Link>

        <Link
          href="/hackathons"
          className="flex items-center gap-4 p-6 border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center text-white shrink-0">
            <ArrowRight className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[14px] font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
              Join an antathon
            </div>
            <div className="text-[12px] text-gray-400">
              Build with the community
            </div>
          </div>
        </Link>
      </div>

      {/* User's projects */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Your projects ({projects.length})
        </h2>
      </div>

      {projects.length === 0 ? (
        <div className="border border-gray-100 rounded-xl p-8 text-center">
          <p className="text-[14px] text-gray-400 mb-4">
            You haven't submitted any projects yet.
          </p>
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Submit your first project
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex items-center gap-4 p-5 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <Link
                  href={`/projects/${project.id}`}
                  className="text-[14px] font-medium text-gray-900 hover:text-blue-600 transition-colors truncate block"
                >
                  {project.title}
                </Link>
                <p className="text-[12px] text-gray-400 truncate">
                  {project.tagline}
                </p>
              </div>
              <div className="flex items-center gap-1 text-[12px] text-gray-400 shrink-0">
                {project.likes_count} likes
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {project.demo_url && (
                  <a
                    href={project.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    title="Live demo"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                )}
                <Link
                  href={`/projects/${project.id}/edit`}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Edit"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Link>
                <form action={deleteProject}>
                  <input type="hidden" name="project_id" value={project.id} />
                  <button
                    type="submit"
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete"
                    onClick={(e) => {
                      if (!confirm("Delete this project? This cannot be undone.")) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
