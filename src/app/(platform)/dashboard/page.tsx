"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, ArrowRight, Settings, Trash2, Pencil, ArrowUpRight, Zap, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileIncomplete, setProfileIncomplete] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const supabase = createClient();

      const [projectsResult, profileResult] = await Promise.all([
        supabase
          .from("projects")
          .select("id, title, tagline, category, likes_count, created_at, demo_url")
          .eq("builder_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("profiles")
          .select("bio, skills")
          .eq("id", user.id)
          .single(),
      ]);

      setProjects(projectsResult.data || []);

      if (profileResult.data) {
        const { bio, skills } = profileResult.data;
        const emptyBio = !bio || bio.trim() === "";
        const emptySkills = !skills || skills.length === 0;
        setProfileIncomplete(emptyBio && emptySkills);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="max-w-[860px] mx-auto px-6 py-20">
        <div className="animate-pulse space-y-3">
          <div className="h-7 bg-background-secondary rounded-lg w-48" />
          <div className="h-4 bg-background-secondary rounded-lg w-72" />
        </div>
      </div>
    );
  }

  const name =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Builder";

  return (
    <div className="max-w-[860px] mx-auto px-6 py-16 sm:py-20 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between gap-6 mb-10"
      >
        <div>
          <h1 className="text-[clamp(2rem,4vw,3rem)] tracking-tight text-text-primary mb-1">
            {name.split(" ")[0]}
          </h1>
          <p className="text-[15px] text-text-secondary">
            Your workspace and shipped projects
          </p>
        </div>
        <Link
          href="/settings"
          className="h-10 w-10 flex items-center justify-center rounded-lg border border-border-primary bg-surface text-text-tertiary hover:text-text-primary hover:border-text-tertiary/40 transition-all"
          title="Settings"
        >
          <Settings className="w-4.5 h-4.5" />
        </Link>
      </motion.div>

      {/* Profile incomplete */}
      {profileIncomplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5 flex items-center gap-4"
        >
          <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <UserCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-amber-900">Complete your profile</p>
            <p className="text-[13px] text-amber-700">Add a bio and skills so teams can discover you.</p>
          </div>
          <Button size="sm" asChild>
            <Link href="/settings">Update profile</Link>
          </Button>
        </motion.div>
      )}

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-3 mb-12">
        <Link
          href="/submit"
          className="group rounded-xl border border-border-primary bg-surface p-5 flex items-center gap-4 hover:border-text-tertiary/30 hover:shadow-sm transition-all"
        >
          <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-text-primary">Ship a project</h3>
            <p className="text-[13px] text-text-tertiary">Add verified work to your profile</p>
          </div>
        </Link>

        <Link
          href="/hackathons"
          className="group rounded-xl border border-border-primary bg-surface p-5 flex items-center gap-4 hover:border-text-tertiary/30 hover:shadow-sm transition-all"
        >
          <div className="h-10 w-10 rounded-lg bg-background-secondary flex items-center justify-center text-text-primary shrink-0 group-hover:scale-105 transition-transform">
            <ArrowRight className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-text-primary">Find opportunities</h3>
            <p className="text-[13px] text-text-tertiary">Browse bounties and hackathons</p>
          </div>
        </Link>
      </div>

      {/* Projects */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[20px] font-semibold text-text-primary font-[family-name:var(--font-display)] italic">
            Your projects
          </h2>
          <span className="text-[13px] text-text-tertiary">
            {projects.length} {projects.length === 1 ? "project" : "projects"}
          </span>
        </div>

        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-dashed border-border-primary bg-background-secondary/30 py-16 text-center"
          >
            <Zap className="w-10 h-10 text-text-tertiary mx-auto mb-4 opacity-30" />
            <p className="text-[15px] font-medium text-text-secondary mb-1">No projects yet</p>
            <p className="text-[13px] text-text-tertiary mb-6">Ship your first project to start building your reputation.</p>
            <Button size="default" asChild>
              <Link href="/submit">
                Ship your first project <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </motion.div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="space-y-2"
          >
            {projects.map((project, idx) => (
              <motion.div
                key={project.id}
                variants={fadeUp}
                className="group rounded-xl border border-border-primary bg-surface p-5 hover:border-text-tertiary/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1">
                    <h3 className="text-[15px] font-semibold text-text-primary group-hover:text-accent-bright transition-colors truncate">
                      {project.title}
                    </h3>
                    {project.category && (
                      <span className="text-[11px] font-medium text-text-tertiary bg-background-secondary px-2 py-0.5 rounded shrink-0">
                        {project.category}
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-text-tertiary line-clamp-1">
                    {project.tagline}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[13px] font-medium text-text-secondary tabular-nums">
                    {project.likes_count} signals
                  </span>

                  <div className="flex items-center gap-1.5">
                    {project.demo_url && (
                      <a
                        href={project.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-8 w-8 flex items-center justify-center rounded-lg border border-border-primary bg-surface text-text-tertiary hover:text-text-primary hover:border-text-tertiary/40 transition-all"
                        title="Live demo"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <Link
                      href={`/projects/${project.id}/edit`}
                      className="h-8 w-8 flex items-center justify-center rounded-lg border border-border-primary bg-surface text-text-tertiary hover:text-text-primary hover:border-text-tertiary/40 transition-all"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Link>
                    <form action={deleteProject}>
                      <input type="hidden" name="project_id" value={project.id} />
                      <button
                        type="submit"
                        className="h-8 w-8 flex items-center justify-center rounded-lg border border-border-primary bg-surface text-text-tertiary hover:text-red-500 hover:border-red-200 transition-all"
                        title="Delete"
                        onClick={(e) => {
                          if (!confirm("Delete this project?")) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </form>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/projects/${project.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
