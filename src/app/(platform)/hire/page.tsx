"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Clock,
  ArrowRight,
  Briefcase,
  Filter,
  Star,
  Building2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { builders, companies, projects } from "@/lib/mock-data";
import type { Builder, Company } from "@/lib/mock-data";

const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};
const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};

const allSkills = Array.from(
  new Set(builders.flatMap((b) => b.skills))
).sort();

const availabilityLabels: Record<string, string> = {
  available: "Available now",
  "open-to-offers": "Open to offers",
  busy: "Busy",
};

const availabilityColors: Record<string, string> = {
  available: "bg-emerald-500",
  "open-to-offers": "bg-amber-500",
  busy: "bg-red-400",
};

function TalentCard({ builder }: { builder: Builder }) {
  const builderProjects = projects.filter(
    (p) => p.builder.username === builder.username
  );
  const totalLikes = builderProjects.reduce((s, p) => s + p.likes, 0);

  return (
    <motion.div variants={fadeUp}>
      <Link
        href={`/builders/${builder.username}`}
        className="group block rounded-xl border border-border-primary bg-surface p-6 hover:border-text-tertiary/30 hover:shadow-md transition-all"
      >
        <div className="flex items-start gap-4">
          <div
            className="h-12 w-12 rounded-full flex items-center justify-center text-[16px] font-semibold text-white shrink-0"
            style={{ background: builder.gradient }}
          >
            {builder.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-[16px] font-semibold text-text-primary group-hover:text-accent-bright transition-colors truncate">
                {builder.name}
              </h3>
              {builder.availability && (
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-text-tertiary">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      availabilityColors[builder.availability] || "bg-gray-400"
                    }`}
                  />
                  {availabilityLabels[builder.availability]}
                </span>
              )}
            </div>
            <p className="text-[13px] text-text-secondary mb-3">
              {builder.tagline}
            </p>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {builder.skills.slice(0, 5).map((s) => (
                <span
                  key={s}
                  className="text-[11px] font-medium text-text-tertiary bg-background-secondary px-2 py-0.5 rounded"
                >
                  {s}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-4 text-[12px] text-text-tertiary">
              {builder.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {builder.location}
                </span>
              )}
              {builder.hourlyRate && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {builder.hourlyRate}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" /> {totalLikes} signals
              </span>
              <span>
                {builderProjects.length}{" "}
                {builderProjects.length === 1 ? "project" : "projects"}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function RoleCard({ role, company }: { role: (typeof companies)[0]["openRoles"][0]; company: Company }) {
  return (
    <motion.div variants={fadeUp}>
      <div className="rounded-xl border border-border-primary bg-surface p-5 hover:border-text-tertiary/30 hover:shadow-sm transition-all">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white"
            style={{ background: company.gradient }}
          >
            {company.name.charAt(0)}
          </div>
          <span className="text-[12px] font-medium text-text-tertiary">
            {company.name}
          </span>
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-background-secondary text-text-tertiary font-medium">
            {role.type}
          </span>
        </div>
        <h4 className="text-[15px] font-semibold text-text-primary mb-2">
          {role.title}
        </h4>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {role.skills.map((s) => (
            <span
              key={s}
              className="text-[10px] font-medium text-text-tertiary bg-background-secondary px-1.5 py-0.5 rounded"
            >
              {s}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between">
          {role.salary && (
            <span className="text-[13px] font-medium text-text-secondary">
              {role.salary}
            </span>
          )}
          {role.remote && (
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Remote
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function HirePage() {
  const [query, setQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<string>("all");
  const [availFilter, setAvailFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"talent" | "roles">("talent");

  const filteredBuilders = useMemo(() => {
    return builders.filter((b) => {
      const matchesQuery =
        !query ||
        b.name.toLowerCase().includes(query.toLowerCase()) ||
        b.skills.some((s) => s.toLowerCase().includes(query.toLowerCase())) ||
        b.tagline.toLowerCase().includes(query.toLowerCase());

      const matchesSkill =
        selectedSkill === "all" || b.skills.includes(selectedSkill);

      const matchesAvail =
        availFilter === "all" || b.availability === availFilter;

      return matchesQuery && matchesSkill && matchesAvail;
    });
  }, [query, selectedSkill, availFilter]);

  const allRoles = companies.flatMap((c) =>
    c.openRoles.map((r) => ({ ...r, company: c }))
  );

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-16 sm:py-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="mb-10"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Briefcase className="h-4 w-4 text-blue-500" />
          </div>
          <span className="text-[12px] font-semibold uppercase tracking-widest text-blue-500">
            Hiring Hub
          </span>
        </div>
        <h1 className="text-[clamp(2rem,4vw,3rem)] tracking-tight text-text-primary mb-2">
          Hire proven builders
        </h1>
        <p className="text-[16px] text-text-secondary max-w-[500px]">
          Find engineers by what they&apos;ve shipped, not what they claim.
          Every builder is verified by their project history.
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 p-1 bg-background-secondary rounded-lg w-fit">
        {(["talent", "roles"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-[13px] font-semibold transition-all ${
              activeTab === tab
                ? "bg-surface text-text-primary shadow-sm"
                : "text-text-tertiary hover:text-text-secondary"
            }`}
          >
            {tab === "talent" ? "Browse Talent" : "Open Roles"}
          </button>
        ))}
      </div>

      {activeTab === "talent" ? (
        <>
          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-8 space-y-3"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
              <input
                type="text"
                placeholder="Search by name, skill, or role..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-surface border border-border-primary rounded-xl text-[14px] outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/10 text-text-primary placeholder:text-text-tertiary transition-all"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-text-tertiary" />
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="text-[12px] font-medium px-3 py-1.5 rounded-lg border border-border-primary bg-surface text-text-secondary outline-none"
              >
                <option value="all">All Skills</option>
                {allSkills.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                value={availFilter}
                onChange={(e) => setAvailFilter(e.target.value)}
                className="text-[12px] font-medium px-3 py-1.5 rounded-lg border border-border-primary bg-surface text-text-secondary outline-none"
              >
                <option value="all">Any Availability</option>
                <option value="available">Available now</option>
                <option value="open-to-offers">Open to offers</option>
              </select>
              <span className="text-[12px] text-text-tertiary ml-auto">
                {filteredBuilders.length} builders found
              </span>
            </div>
          </motion.div>

          {/* Builder List */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {filteredBuilders.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-[15px] text-text-tertiary">
                  No builders match your filters.
                </p>
                <button
                  onClick={() => {
                    setQuery("");
                    setSelectedSkill("all");
                    setAvailFilter("all");
                  }}
                  className="text-[13px] text-accent font-medium mt-2 hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              filteredBuilders.map((b) => (
                <TalentCard key={b.id} builder={b} />
              ))
            )}
          </motion.div>
        </>
      ) : (
        <>
          {/* Open Roles */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-6"
          >
            <p className="text-[14px] text-text-secondary">
              {allRoles.length} open positions from{" "}
              {companies.length} companies
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid sm:grid-cols-2 gap-3"
          >
            {allRoles.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                company={role.company}
              />
            ))}
          </motion.div>

          {/* Companies Section */}
          <div className="mt-12">
            <h2 className="text-[20px] font-semibold text-text-primary mb-5">
              Companies hiring on Antry
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {companies.map((c) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="rounded-xl border border-border-primary bg-surface p-5 hover:border-text-tertiary/30 transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center text-[14px] font-bold text-white"
                      style={{ background: c.gradient }}
                    >
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-[15px] font-semibold text-text-primary">
                        {c.name}
                      </h3>
                      <p className="text-[12px] text-text-tertiary">
                        {c.industry} &middot; {c.size} people
                      </p>
                    </div>
                  </div>
                  <p className="text-[13px] text-text-secondary mb-3">
                    {c.tagline}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-text-tertiary">
                      {c.openRoles.length} open{" "}
                      {c.openRoles.length === 1 ? "role" : "roles"}
                    </span>
                    <Building2 className="h-3.5 w-3.5 text-text-tertiary" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16 rounded-2xl border border-border-primary bg-surface p-8 sm:p-10 text-center"
      >
        <h2 className="text-[clamp(1.4rem,3vw,2rem)] tracking-tight text-text-primary mb-2">
          Looking to hire?
        </h2>
        <p className="text-[14px] text-text-secondary mb-6 max-w-[400px] mx-auto">
          Post your open roles and get matched with verified builders
          who&apos;ve proven their skills through shipped projects.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/signup">
              Post a role <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/companies">
              Learn more <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
