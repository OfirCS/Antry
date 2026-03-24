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
      <div className="max-w-[740px] mx-auto px-8 py-20">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-border-secondary rounded-lg w-48" />
          <div className="h-4 bg-border-secondary rounded-lg w-72" />
        </div>
      </div>
    );
  }

  const name =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Builder";

  return (
    <div className="max-w-[800px] mx-auto px-6 py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-[clamp(2rem,5vw,2.5rem)] text-text-primary tracking-[-0.03em]">
            Welcome, {name}
          </h1>
          <Link
            href="/settings"
            className="h-10 w-10 flex items-center justify-center rounded-full border border-border-primary text-text-tertiary hover:text-text-primary hover:bg-background-secondary transition-all"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </Link>
        </div>
        <p className="text-[16px] text-text-secondary mb-12 max-w-[500px] leading-relaxed">
          Manage your verified shipping history and discover new opportunities.
        </p>
      </motion.div>

      {profileIncomplete && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 p-5 rounded-xl border border-accent/20 bg-accent/[0.04] flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
            <UserCircle className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-text-primary">
              Complete your profile
            </p>
            <p className="text-[13px] text-text-secondary">
              Add a bio and skills so companies and builders can find you.
            </p>
          </div>
          <Link
            href="/settings"
            className="px-5 py-2 bg-accent text-white rounded-lg text-[13px] font-semibold hover:opacity-90 transition-opacity shrink-0"
          >
            Edit profile
          </Link>
        </motion.div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 mb-16">
        <Link
          href="/submit"
          className="card-premium p-8 flex flex-col group h-full"
        >
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-[#0a0b0d] mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-accent/20">
            <Plus className="w-6 h-6" />
          </div>
          <h3 className="text-[18px] font-bold text-text-primary mb-2 tracking-tight group-hover:text-accent transition-colors">
            Submit a project
          </h3>
          <p className="text-[14px] text-text-secondary leading-relaxed">
            Add new proof of work to your profile and build your technical reputation.
          </p>
        </Link>

        <Link
          href="/hackathons"
          className="card-premium p-8 flex flex-col group h-full"
        >
          <div className="w-12 h-12 rounded-xl bg-background-secondary flex items-center justify-center text-text-primary mb-6 group-hover:scale-110 transition-transform duration-500 border border-border-primary">
            <ArrowRight className="w-6 h-6" />
          </div>
          <h3 className="text-[18px] font-bold text-text-primary mb-2 tracking-tight group-hover:text-accent transition-colors">
            Join a hackathon
          </h3>
          <p className="text-[14px] text-text-secondary leading-relaxed">
            Collaborate with other builders and earn verified badges for your work.
          </p>
        </Link>
      </div>

      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-[12px] font-bold text-text-primary uppercase tracking-[0.15em]">
          Verified History ({projects.length})
        </h2>
      </div>

      {projects.length === 0 ? (
        <div className="card-premium p-12 text-center bg-background-secondary/30">
          <p className="text-[15px] text-text-tertiary mb-6">
            No projects verified yet. Start by shipping your first project.
          </p>
          <Button asChild className="rounded-full px-8">
            <Link href="/submit">
              <Plus className="w-4 h-4 mr-2" /> Submit Project
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex items-center gap-6 p-6 card-premium group"
            >
              <div className="flex-1 min-w-0">
                <Link
                  href={`/projects/${project.id}`}
                  className="text-[16px] font-bold text-text-primary hover:text-accent transition-colors truncate block tracking-tight"
                >
                  {project.title}
                </Link>
                <p className="text-[13px] text-text-tertiary truncate mt-1">
                  {project.tagline}
                </p>
              </div>
              <div className="flex items-center gap-2 text-[12px] font-bold text-text-tertiary uppercase tracking-wider shrink-0">
                <Zap className="w-3.5 h-3.5 text-accent" />
                {project.likes_count} SIGNAL
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {project.demo_url && (
                  <a
                    href={project.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 w-8 flex items-center justify-center rounded-full border border-border-primary text-text-tertiary hover:text-accent hover:bg-accent-muted transition-all"
                    title="Live demo"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                )}
                <Link
                  href={`/projects/${project.id}/edit`}
                  className="h-8 w-8 flex items-center justify-center rounded-full border border-border-primary text-text-tertiary hover:text-text-primary hover:bg-background-secondary transition-all"
                  title="Edit"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Link>
                <form action={deleteProject}>
                  <input type="hidden" name="project_id" value={project.id} />
                  <button
                    type="submit"
                    className="h-8 w-8 flex items-center justify-center rounded-full border border-border-primary text-text-tertiary hover:text-red-500 hover:bg-red-500/5 transition-all"
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
