"use client";

import { useActionState, useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Trophy,
  Users,
  Zap,
  LogOut,
  Send,
  Clock,
  Flame,
  Sparkles,
  ExternalLink,
  Building2,
} from "lucide-react";
import { getInitials } from "@/lib/mock-data";
import {
  joinHackathon,
  leaveHackathon,
  submitToHackathon,
} from "../../actions";
import type { FormState } from "../../actions";

const ease = [0.16, 1, 0.3, 1] as const;

/* ── Types ─────────────────────────────────────────────── */

interface SubmissionItem {
  id: string;
  title: string;
  tagline: string;
  gradient: string;
  builder: {
    name: string;
    gradient: string;
  };
}

interface ParticipantAvatar {
  name: string;
  gradient: string;
}

interface HackathonData {
  id: string;
  title: string;
  theme: string;
  description: string;
  status: "active" | "upcoming" | "completed";
  gradient: string;
  prizes: { place: string; reward: string }[];
  sponsors: string[];
  participantCount: number;
  submissionCount: number;
  startDate: string;
  endDate: string;
  participantAvatars: ParticipantAvatar[];
  submissions: SubmissionItem[];
}

/* ── Countdown hook ────────────────────────────────────── */

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const tick = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = Math.max(0, target - now);

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

/* ── Countdown digit ───────────────────────────────────── */

function CountdownDigit({
  value,
  label,
  large,
}: {
  value: number;
  label: string;
  large?: boolean;
}) {
  const size = large ? "w-20 h-20" : "w-14 h-14";
  const fontSize = large ? "text-[32px]" : "text-[22px]";

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative ${size} rounded-lg flex items-center justify-center ${fontSize} font-bold tabular-nums`}
        style={{
          background: "#FFFFFF",
          color: "#111111",
          border: "1px solid #E5E7EB",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: -8, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 8, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
          >
            {String(value).padStart(2, "0")}
          </motion.span>
        </AnimatePresence>
      </div>
      <span
        className="text-[10px] font-bold uppercase tracking-widest mt-2"
        style={{ color: "rgba(17,17,17,0.5)" }}
      >
        {label}
      </span>
    </div>
  );
}

/* ── Main Component ────────────────────────────────────── */

export default function HackathonDetailClient({
  event,
  isLoggedIn,
  hasJoined,
  userProjects,
  submittedProjectIds,
}: {
  event: HackathonData | null;
  isLoggedIn: boolean;
  hasJoined: boolean;
  userProjects: { id: string; title: string }[];
  submittedProjectIds: string[];
}) {
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submitState, submitAction, isSubmitting] = useActionState<
    FormState,
    FormData
  >(submitToHackathon, null);

  if (!event) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-8"
        style={{ background: "#FAFAFA" }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(17, 17, 17, 0.04)" }}
          >
            <Trophy
              className="w-6 h-6"
              style={{ color: "rgba(17, 17, 17, 0.2)" }}
            />
          </div>
          <p
            className="text-[15px] mb-4 font-medium"
            style={{ color: "rgba(17, 17, 17, 0.4)" }}
          >
            This hackathon doesn&apos;t exist yet.
          </p>
          <Link
            href="/hackathons"
            className="font-semibold hover:underline text-[14px]"
            style={{ color: "#20F5A0" }}
          >
            All hackathons
          </Link>
        </div>
      </div>
    );
  }

  const availableProjects = userProjects.filter(
    (p) => !submittedProjectIds.includes(p.id)
  );

  const targetDate =
    event.status === "active" ? event.endDate : event.startDate;
  const isLive = event.status === "active";
  const spotsText =
    event.participantCount < 100
      ? `${100 - event.participantCount} spots remaining`
      : `${event.participantCount} builders joined`;

  return (
    <div className="min-h-screen" style={{ background: "#FAFAFA" }}>
      {/* ── Hero Banner ───────────────────────────────────── */}
      <HeroBanner
        event={event}
        targetDate={targetDate}
        isLive={isLive}
        spotsText={spotsText}
        isLoggedIn={isLoggedIn}
        hasJoined={hasJoined}
      />

      {/* ── Community Info ─────────────────────────────────── */}
      <CommunityInfo event={event} />

      {/* ── Participant Avatars + Join CTA ─────────────────── */}
      <ParticipantBar
        event={event}
        isLoggedIn={isLoggedIn}
        hasJoined={hasJoined}
        showSubmitForm={showSubmitForm}
        setShowSubmitForm={setShowSubmitForm}
        availableProjects={availableProjects}
      />

      {/* ── Submit project form ────────────────────────────── */}
      <AnimatePresence>
        {showSubmitForm && hasJoined && (
          <motion.section
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease }}
            className="overflow-hidden border-b"
            style={{
              borderColor: "rgba(17, 17, 17, 0.06)",
              background: "rgba(17, 17, 17, 0.02)",
            }}
          >
            <div className="max-w-[960px] mx-auto px-8 py-6">
              <h3
                className="text-[14px] font-semibold mb-4"
                style={{ color: "#111111" }}
              >
                Submit a project to this hackathon
              </h3>
              <form
                action={submitAction}
                className="flex items-center gap-4"
              >
                <input
                  type="hidden"
                  name="hackathon_id"
                  value={event.id}
                />
                <select
                  name="project_id"
                  required
                  className="flex-1 max-w-sm px-4 py-2.5 border rounded-md text-[13px] outline-none transition-colors"
                  style={{
                    background: "#FFFFFF",
                    borderColor: "rgba(17, 17, 17, 0.08)",
                    color: "#111111",
                  }}
                >
                  <option value="">Select a project...</option>
                  {availableProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-md font-semibold text-[13px] transition-opacity disabled:opacity-50"
                  style={{ background: "#20F5A0", color: "#111111" }}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </form>
              {submitState?.error && (
                <p className="text-red-500 text-[13px] mt-2">
                  {submitState.error}
                </p>
              )}
              {submitState?.success && (
                <p className="text-[13px] mt-2" style={{ color: "#7A9A00" }}>
                  Project submitted successfully!
                </p>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Description ────────────────────────────────────── */}
      <section className="py-16 px-8">
        <div className="max-w-[960px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease }}
          >
            <h2
              className="font-display text-[clamp(1.5rem,3vw,2rem)] tracking-[-0.02em] mb-6"
              style={{ color: "#111111" }}
            >
              About this hackathon
            </h2>
            <p
              className="text-[16px] leading-relaxed max-w-2xl"
              style={{ color: "rgba(17, 17, 17, 0.6)" }}
            >
              {event.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Submissions Showcase ───────────────────────────── */}
      <SubmissionsGrid submissions={event.submissions} />

      {/* ── Sponsors ───────────────────────────────────────── */}
      {event.sponsors.length > 0 && (
        <SponsorsSection sponsors={event.sponsors} />
      )}

      {/* ── Sponsor CTA ────────────────────────────────────── */}
      <section
        className="py-20 px-8 border-t"
        style={{ borderColor: "rgba(17, 17, 17, 0.06)" }}
      >
        <div className="max-w-[960px] mx-auto flex items-center justify-between flex-wrap gap-6">
          <div>
            <h3
              className="font-display text-[clamp(1.25rem,3vw,1.75rem)] tracking-[-0.02em] mb-1"
              style={{ color: "#111111" }}
            >
              Sponsor the next hackathon
            </h3>
            <p
              className="text-[14px]"
              style={{ color: "rgba(17, 17, 17, 0.4)" }}
            >
              Put your tools in the hands of top builders.
            </p>
          </div>
          <Link
            href="#"
            className="px-6 py-2.5 border rounded-md text-[13px] font-semibold transition-colors"
            style={{
              borderColor: "rgba(17, 17, 17, 0.1)",
              color: "#111111",
            }}
          >
            Get in touch
          </Link>
        </div>
      </section>
    </div>
  );
}

/* ── Hero Banner ───────────────────────────────────────── */

function HeroBanner({
  event,
  targetDate,
  isLive,
  spotsText,
  isLoggedIn,
  hasJoined,
}: {
  event: HackathonData;
  targetDate: string;
  isLive: boolean;
  spotsText: string;
  isLoggedIn: boolean;
  hasJoined: boolean;
}) {
  const countdown = useCountdown(targetDate);

  return (
    <section className="relative overflow-hidden pt-32 pb-20 px-8">
      {/* Background layers - warm light */}
      <div className="absolute inset-0" style={{ background: "#F7F8FA" }} />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: isLive
            ? "radial-gradient(ellipse 100% 70% at 30% 0%, rgba(32, 245, 160, 0.12) 0%, transparent 60%)"
            : "radial-gradient(ellipse 100% 70% at 70% 0%, rgba(32, 245, 160, 0.08) 0%, transparent 60%)",
        }}
      />
      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(17,17,17,0.08) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="max-w-[960px] mx-auto relative z-10">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease }}
        >
          <Link
            href="/hackathons"
            className="inline-flex items-center gap-2 text-[12px] font-medium transition-colors mb-12 uppercase tracking-widest"
            style={{ color: "rgba(17,17,17,0.4)" }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All hackathons
          </Link>
        </motion.div>

        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="mb-6"
        >
          <span
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest"
            style={{
              background: isLive
                ? "rgba(32, 245, 160, 0.15)"
                : "rgba(17,17,17,0.04)",
              color: "#111111",
              border: `1px solid ${isLive ? "rgba(32, 245, 160, 0.25)" : "rgba(17,17,17,0.08)"}`,
            }}
          >
            {isLive ? (
              <>
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{
                    background: "#20F5A0",
                    boxShadow: "0 0 12px rgba(32, 245, 160, 0.6)",
                  }}
                />
                Live Now
              </>
            ) : event.status === "upcoming" ? (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Upcoming
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5" />
                Completed
              </>
            )}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease }}
          className="font-display text-[clamp(2.5rem,7vw,5rem)] leading-[0.95] tracking-[-0.04em] mb-4"
          style={{ color: "#111111" }}
        >
          {event.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease }}
          className="text-[18px] max-w-xl leading-relaxed mb-12"
          style={{ color: "#4B5563" }}
        >
          {event.theme}
        </motion.p>

        {/* Countdown timer */}
        {event.status !== "completed" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease }}
            className="mb-12"
          >
            <p
              className="text-[11px] font-bold uppercase tracking-widest mb-4"
              style={{ color: "rgba(17,17,17,0.4)" }}
            >
              {isLive ? "Hacking ends in" : "Starts in"}
            </p>
            <div className="flex items-center gap-3">
              <CountdownDigit value={countdown.days} label="Days" large />
              <span
                className="text-[28px] font-bold mt-[-22px]"
                style={{ color: "#20F5A0" }}
              >
                :
              </span>
              <CountdownDigit value={countdown.hours} label="Hours" large />
              <span
                className="text-[28px] font-bold mt-[-22px]"
                style={{ color: "#20F5A0" }}
              >
                :
              </span>
              <CountdownDigit
                value={countdown.minutes}
                label="Minutes"
                large
              />
              <span
                className="text-[28px] font-bold mt-[-22px]"
                style={{ color: "#20F5A0" }}
              >
                :
              </span>
              <CountdownDigit
                value={countdown.seconds}
                label="Seconds"
                large
              />
            </div>
          </motion.div>
        )}

        {/* Community stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease }}
          className="flex flex-wrap items-center gap-8 mb-10"
        >
          {[
            {
              icon: Users,
              label: "Builders joined",
              value: event.participantCount.toString(),
              accent: true,
            },
            {
              icon: Zap,
              label: "Projects submitted",
              value: event.submissionCount.toString(),
            },
            {
              icon: Clock,
              label: "Format",
              value: "48h sprint",
            },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-md flex items-center justify-center"
                style={{
                  background: stat.accent
                    ? "rgba(32, 245, 160, 0.12)"
                    : "rgba(17,17,17,0.04)",
                }}
              >
                <stat.icon
                  className="w-4.5 h-4.5"
                  style={{
                    color: stat.accent
                      ? "#20F5A0"
                      : "rgba(17,17,17,0.4)",
                  }}
                />
              </div>
              <div>
                <span
                  className="block text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: "rgba(17,17,17,0.4)" }}
                >
                  {stat.label}
                </span>
                <span className="text-[18px] font-bold" style={{ color: "#111111" }}>
                  {stat.value}
                </span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Urgent CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease }}
          className="flex flex-wrap items-center gap-4"
        >
          {!isLoggedIn ? (
            <Link
              href={`/login?redirect=/hackathons/${event.id}`}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-lg text-[15px] font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "#111111",
                color: "#FFFFFF",
                boxShadow: "0 4px 14px rgba(17,17,17,0.15)",
              }}
            >
              <Flame className="w-5 h-5" />
              Sign in to join
            </Link>
          ) : hasJoined ? (
            <div className="flex items-center gap-3">
              <span
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-[14px] font-bold"
                style={{
                  background: "rgba(32, 245, 160, 0.12)",
                  color: "#111111",
                  border: "1px solid rgba(32, 245, 160, 0.25)",
                }}
              >
                <Sparkles className="w-4 h-4" style={{ color: "#20F5A0" }} />
                You&apos;re in!
              </span>
            </div>
          ) : (
            <form action={joinHackathon}>
              <input
                type="hidden"
                name="hackathon_id"
                value={event.id}
              />
              <button
                type="submit"
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-lg text-[15px] font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "#111111",
                  color: "#FFFFFF",
                  boxShadow: "0 4px 14px rgba(17,17,17,0.15)",
                }}
              >
                <Flame className="w-5 h-5" />
                Join Hackathon Now
              </button>
            </form>
          )}

          {/* Urgency text */}
          {!hasJoined && event.status !== "completed" && (
            <span
              className="text-[13px] font-medium"
              style={{ color: "rgba(17,17,17,0.5)" }}
            >
              {spotsText}
            </span>
          )}
        </motion.div>
      </div>

    </section>
  );
}

/* ── Community Info ────────────────────────────────────── */

function CommunityInfo({ event }: { event: HackathonData }) {
  const highlights = [
    {
      icon: Users,
      title: `${event.participantCount}+ builders`,
      desc: "Join a growing community of makers shipping real products",
      bg: "rgba(32, 245, 160, 0.08)",
      border: "rgba(32, 245, 160, 0.15)",
    },
    {
      icon: Zap,
      title: "Ship in 48 hours",
      desc: "Build fast, learn faster. Prove what you can do under pressure",
      bg: "rgba(17, 17, 17, 0.02)",
      border: "rgba(17, 17, 17, 0.06)",
    },
    {
      icon: Trophy,
      title: "Build your portfolio",
      desc: "Every submission becomes part of your builder profile and track record",
      bg: "rgba(17, 17, 17, 0.02)",
      border: "rgba(17, 17, 17, 0.06)",
    },
  ];

  return (
    <section
      className="py-16 px-8 border-b"
      style={{
        background: "#FFFFFF",
        borderColor: "rgba(17, 17, 17, 0.06)",
      }}
    >
      <div className="max-w-[960px] mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="font-display text-[clamp(1.5rem,3vw,2rem)] tracking-[-0.02em] mb-10 text-center"
          style={{ color: "#111111" }}
        >
          Why join this hackathon
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {highlights.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease }}
              whileHover={{ y: -4 }}
              className="relative rounded-lg p-6 text-center transition-all duration-300"
              style={{
                background: item.bg,
                border: `1px solid ${item.border}`,
              }}
            >
              <div
                className="w-12 h-12 rounded-md mx-auto mb-4 flex items-center justify-center"
                style={{
                  background: "rgba(32, 245, 160, 0.12)",
                }}
              >
                <item.icon className="w-5 h-5" style={{ color: "#20F5A0" }} />
              </div>

              <span
                className="text-[16px] font-bold block mb-2"
                style={{ color: "#111111" }}
              >
                {item.title}
              </span>
              <span
                className="text-[13px] leading-relaxed block"
                style={{ color: "#4B5563" }}
              >
                {item.desc}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Participant Bar ───────────────────────────────────── */

function ParticipantBar({
  event,
  isLoggedIn,
  hasJoined,
  showSubmitForm,
  setShowSubmitForm,
  availableProjects,
}: {
  event: HackathonData;
  isLoggedIn: boolean;
  hasJoined: boolean;
  showSubmitForm: boolean;
  setShowSubmitForm: (v: boolean) => void;
  availableProjects: { id: string; title: string }[];
}) {
  const avatars = event.participantAvatars;
  const overflow = Math.max(0, event.participantCount - avatars.length);

  return (
    <section
      className="border-b"
      style={{ borderColor: "rgba(17, 17, 17, 0.06)" }}
    >
      <div className="max-w-[960px] mx-auto px-8 py-6 flex items-center justify-between flex-wrap gap-6">
        {/* Participant avatars */}
        <div className="flex items-center gap-4">
          <div className="flex items-center -space-x-2">
            {avatars.map((avatar, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 shrink-0"
                style={{
                  background: avatar.gradient,
                  borderColor: "#FAFAFA",
                }}
                title={avatar.name}
              >
                {getInitials(avatar.name)}
              </motion.div>
            ))}
            {overflow > 0 && (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2 shrink-0"
                style={{
                  background: "rgba(17, 17, 17, 0.06)",
                  borderColor: "#FAFAFA",
                  color: "rgba(17, 17, 17, 0.5)",
                }}
              >
                +{overflow}
              </div>
            )}
          </div>
          <span
            className="text-[13px] font-medium"
            style={{ color: "rgba(17, 17, 17, 0.5)" }}
          >
            {event.participantCount} builder
            {event.participantCount !== 1 ? "s" : ""} joined
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          {!isLoggedIn ? (
            <Link
              href={`/login?redirect=/hackathons/${event.id}`}
              className="px-6 py-2.5 rounded-md font-semibold text-[13px] transition-all duration-300 hover:scale-[1.02]"
              style={{ background: "#20F5A0", color: "#111111" }}
            >
              Sign in to join
            </Link>
          ) : hasJoined ? (
            <>
              {event.status === "active" &&
                availableProjects.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowSubmitForm(!showSubmitForm)}
                    className="px-6 py-2.5 rounded-md font-semibold text-[13px] transition-all duration-300 inline-flex items-center gap-2 hover:scale-[1.02]"
                    style={{
                      background: "#20F5A0",
                      color: "#111111",
                    }}
                  >
                    <Send className="w-3.5 h-3.5" />
                    Submit project
                  </button>
                )}
              <form action={leaveHackathon}>
                <input
                  type="hidden"
                  name="hackathon_id"
                  value={event.id}
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 border rounded-md font-semibold text-[13px] transition-colors inline-flex items-center gap-2 hover:border-red-400 hover:text-red-500"
                  style={{
                    borderColor: "rgba(17, 17, 17, 0.1)",
                    color: "rgba(17, 17, 17, 0.5)",
                  }}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Leave
                </button>
              </form>
            </>
          ) : (
            <form action={joinHackathon}>
              <input
                type="hidden"
                name="hackathon_id"
                value={event.id}
              />
              <button
                type="submit"
                className="px-6 py-2.5 rounded-md font-semibold text-[13px] transition-all duration-300 active:scale-[0.97] hover:scale-[1.02]"
                style={{
                  background: "#20F5A0",
                  color: "#111111",
                }}
              >
                Join hackathon
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

/* ── Submissions Grid ──────────────────────────────────── */

function SubmissionsGrid({
  submissions,
}: {
  submissions: SubmissionItem[];
}) {
  return (
    <section className="py-16 px-8">
      <div className="max-w-[960px] mx-auto">
        <div className="flex items-baseline justify-between mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease }}
            className="font-display text-[clamp(1.5rem,3vw,2rem)] tracking-[-0.02em]"
            style={{ color: "#111111" }}
          >
            Submissions
          </motion.h2>
          <span
            className="text-[12px] font-medium tracking-wide"
            style={{ color: "rgba(17, 17, 17, 0.35)" }}
          >
            {submissions.length} project
            {submissions.length !== 1 && "s"}
          </span>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-20">
            <div
              className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(17, 17, 17, 0.04)" }}
            >
              <Zap
                className="w-6 h-6"
                style={{ color: "rgba(17, 17, 17, 0.15)" }}
              />
            </div>
            <p
              className="text-[14px]"
              style={{ color: "rgba(17, 17, 17, 0.4)" }}
            >
              No submissions yet. Be the first to submit.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {submissions.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08, ease }}
                whileHover={{ y: -4 }}
                className="group relative rounded-lg overflow-hidden border cursor-pointer transition-all duration-300 hover:shadow-lg"
                style={{
                  background: "#FFFFFF",
                  borderColor: "rgba(17, 17, 17, 0.06)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                {/* Gradient top band */}
                <div className="h-28 w-full relative overflow-hidden">
                  <div
                    className="absolute inset-0"
                    style={{ background: p.gradient }}
                  />
                  {/* Hover overlay */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                    style={{
                      background: "rgba(17, 17, 17, 0.5)",
                    }}
                  >
                    <ExternalLink className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="p-5">
                  {/* Builder */}
                  <div className="flex items-center gap-2.5 mb-4">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                      style={{ background: p.builder.gradient }}
                    >
                      {getInitials(p.builder.name)}
                    </div>
                    <span
                      className="text-[12px] font-medium truncate"
                      style={{ color: "rgba(17, 17, 17, 0.5)" }}
                    >
                      {p.builder.name}
                    </span>
                  </div>

                  {/* Project info */}
                  <h3
                    className="text-[16px] font-semibold mb-1.5 transition-colors"
                    style={{ color: "#111111" }}
                  >
                    {p.title}
                  </h3>
                  <p
                    className="text-[13px] leading-relaxed line-clamp-2"
                    style={{ color: "rgba(17, 17, 17, 0.5)" }}
                  >
                    {p.tagline}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Sponsors Section ──────────────────────────────────── */

function SponsorsSection({ sponsors }: { sponsors: string[] }) {
  return (
    <section
      className="py-16 px-8 border-t"
      style={{
        borderColor: "rgba(17, 17, 17, 0.06)",
        background: "#FFFFFF",
      }}
    >
      <div className="max-w-[960px] mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="text-[11px] font-bold uppercase tracking-widest text-center mb-10"
          style={{ color: "rgba(17, 17, 17, 0.3)" }}
        >
          Powered by
        </motion.h2>

        <div className="flex items-center justify-center gap-10 flex-wrap">
          {sponsors.map((sponsor, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1, ease }}
              className="flex items-center gap-3 px-6 py-4 rounded-lg transition-all duration-300 hover:shadow-md"
              style={{
                background: "rgba(17, 17, 17, 0.02)",
                border: "1px solid rgba(17, 17, 17, 0.04)",
              }}
            >
              <div
                className="w-10 h-10 rounded-md flex items-center justify-center"
                style={{
                  background: "#111111",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
              >
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span
                className="text-[16px] font-bold"
                style={{ color: "#111111" }}
              >
                {sponsor}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
