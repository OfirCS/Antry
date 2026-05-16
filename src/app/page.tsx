import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Mail, MapPin, MessageSquareText } from "lucide-react";

const TITLE = "GTA Fix N Clean | Window & Door Repair in the GTA";
const DESCRIPTION =
  "Window and door repair, installation, sealing, hardware fixes, screens, clean finishing, and related property repairs across the Greater Toronto Area.";

const CONTACT = {
  email: "hello@gtafixnclean.ca",
};

const quoteMailto = `mailto:${CONTACT.email}?subject=${encodeURIComponent(
  "GTA Fix N Clean quote request",
)}`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  keywords: [
    "GTA window repair",
    "GTA door repair",
    "door installation Toronto",
    "window installation Toronto",
    "screen repair GTA",
    "weatherstripping repair",
    "door lock repair",
    "glass door repair",
    "property repair GTA",
    "GTA Fix N Clean",
  ],
  openGraph: {
    type: "website",
    siteName: "GTA Fix N Clean",
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    images: [
      {
        url: "/gtafixnclean/white-door-after.jpeg",
        width: 1536,
        height: 2048,
        alt: "Freshly repaired white exterior door by GTA Fix N Clean.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/gtafixnclean/white-door-after.jpeg"],
  },
};

const serviceLines = [
  {
    symbol: "door",
    label: "Doors",
    title: "Entry, storm, patio, and glass doors",
    body: "Alignment, rubbing, hinges, closers, sweeps, thresholds, handles, locks, and new door installs.",
  },
  {
    symbol: "window",
    label: "Windows",
    title: "Windows, screens, tracks, and seals",
    body: "Drafts, tired caulking, loose hardware, damaged screens, sticky tracks, locks, and weather protection.",
  },
  {
    symbol: "hardware",
    label: "Hardware",
    title: "Locks, handles, latches, and small fixes",
    body: "Door hardware replacement, loose parts, rental turnover lists, condo touch-ups, and storefront details.",
  },
  {
    symbol: "finish",
    label: "Finish",
    title: "Clean finishing after the repair",
    body: "Trim lines, silicone removal, caulking, paint-ready edges, tidy cleanup, and details that do not look patched.",
  },
] as const;

const workNotes = [
  "Repair before replacement when the frame and hardware still have life.",
  "Correct the closing action so the door feels solid every day.",
  "Seal the edge cleanly for weather, drafts, and water protection.",
  "Leave the opening, trim, and surrounding area ready to use.",
];

const areaRows = [
  "Toronto",
  "North York",
  "Etobicoke",
  "Scarborough",
  "Mississauga",
  "Brampton",
  "Vaughan",
  "Markham",
  "Richmond Hill",
  "Nearby GTA suburbs",
];

export default function Home() {
  return (
    <main className="gta-site bg-[#f1eee7] text-[#191814]">
      <SiteHeader />
      <Hero />
      <PromiseBand />
      <ServiceIndex />
      <WorkSection />
      <AreaAndQuote />
      <SiteFooter />
    </main>
  );
}

function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#191814]/86 text-white backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="#top" className="flex items-center gap-3" aria-label="GTA Fix N Clean home">
          <LogoMark size="small" />
          <span className="text-base font-black tracking-[0]">GTA Fix N Clean</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-bold text-white/68 md:flex">
          <Link className="transition hover:text-white" href="#services">
            Services
          </Link>
          <Link className="transition hover:text-white" href="#work">
            Work
          </Link>
          <Link className="transition hover:text-white" href="#quote">
            Quote
          </Link>
        </nav>
        <a
          href={quoteMailto}
          className="hidden h-10 items-center gap-2 rounded-sm bg-[#c8102e] px-4 text-sm font-black text-white transition hover:bg-[#e4233e] md:inline-flex"
        >
          Email photos <Mail className="h-4 w-4" />
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative min-h-[100svh] overflow-hidden bg-[#191814] pt-16 text-white">
      <Image
        src="/gtafixnclean/glass-door-repair.jpeg"
        alt="Glass door repair by GTA Fix N Clean."
        fill
        priority
        sizes="100vw"
        className="object-cover object-[58%_50%]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(25,24,20,0.95)_0%,rgba(25,24,20,0.78)_42%,rgba(25,24,20,0.2)_100%)]" />
      <div className="absolute left-0 top-16 h-[calc(100%-4rem)] w-2 bg-[#c8102e]" />
      <div className="relative mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.98fr_0.72fr] lg:px-8">
        <div className="gta-hero-copy">
          <div className="mb-8">
            <LogoMark size="large" />
          </div>
          <p className="mb-5 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-[#ff4057]">
            <MapleLeaf className="h-4 w-4" />
            GTA / Ontario / Canada
          </p>
          <h1 className="max-w-5xl text-[clamp(3.8rem,8vw,8.7rem)] font-black leading-[0.86] tracking-[0]">
            Fixed clean.
          </h1>
          <p className="mt-6 max-w-2xl text-xl font-semibold leading-8 text-white/82">
            Door and window repair across the GTA, done with straight answers, practical parts, and a finish that belongs on the property.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#quote"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-sm bg-[#c8102e] px-5 text-base font-black text-white transition hover:-translate-y-0.5 hover:bg-[#e4233e]"
            >
              Start a quote <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={quoteMailto}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-sm border border-white/22 bg-white/8 px-5 text-base font-black text-white transition hover:-translate-y-0.5 hover:bg-white/14"
            >
              Send photos <MessageSquareText className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div className="gta-hero-note hidden self-end border-l border-white/20 pl-5 text-white/72 lg:block">
          <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-white/48">
            <MapleLeaf className="h-4 w-4 text-[#ff4057]" />
            Canadian weather calls
          </p>
          <p className="mt-3 text-2xl font-black leading-tight text-white">
            A door sticks, a seal leaks, a lock fails, or a window lets the weather in.
          </p>
          <p className="mt-4 max-w-sm text-sm leading-6">
            Send the photos first. The repair plan comes from the actual opening, not a generic package.
          </p>
        </div>
      </div>
    </section>
  );
}

function PromiseBand() {
  return (
    <section className="border-y border-[#191814]/12 bg-[#fbf9f4]">
      <div className="mx-auto grid max-w-7xl divide-y divide-[#191814]/12 px-4 sm:px-6 md:grid-cols-3 md:divide-x md:divide-y-0 lg:px-8">
        <PromiseItem label="Repair first" text="Replace only when repair is not the better move." />
        <PromiseItem label="Fit matters" text="Doors and windows should close, lock, and seal properly." />
        <PromiseItem label="Leave it clean" text="Edges, caulking, trim, and cleanup are part of the job." />
      </div>
    </section>
  );
}

function ServiceIndex() {
  return (
    <section id="services" className="bg-[#f1eee7] py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.14em] text-[#c8102e]">What we take on</p>
          <h2 className="mt-4 max-w-lg text-4xl font-black leading-[0.95] tracking-[0] text-[#191814] sm:text-6xl">
            Not a showroom pitch. A repair list that gets handled.
          </h2>
          <p className="mt-6 max-w-md text-lg leading-8 text-[#625d52]">
            One visit can cover a door, a window, a lock, a screen, a draft, and the small finish work around it.
          </p>
        </div>
        <div className="divide-y divide-[#191814]/14 border-y border-[#191814]/14">
          {serviceLines.map((item) => (
            <article key={item.label} className="gta-service-line grid gap-5 py-7 sm:grid-cols-[96px_1fr]">
              <ServiceSymbol kind={item.symbol} />
              <div>
                <p className="text-sm font-black uppercase tracking-[0.14em] text-[#c8102e]">{item.label}</p>
                <h3 className="mt-2 text-2xl font-black tracking-[0] text-[#191814]">{item.title}</h3>
                <p className="mt-3 max-w-2xl text-base leading-7 text-[#625d52]">{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkSection() {
  return (
    <section id="work" className="bg-[#191814] py-20 text-white sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-[#ff4057]">
              <MapleLeaf className="h-4 w-4" />
              Jobsite proof
            </p>
            <h2 className="mt-4 max-w-2xl text-4xl font-black leading-[0.96] tracking-[0] sm:text-6xl">
              Real doors. Real frames. Real finish work.
            </h2>
          </div>
          <ul className="grid gap-3 text-sm font-semibold leading-6 text-white/72 sm:grid-cols-2">
            {workNotes.map((note) => (
              <li key={note} className="flex gap-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#ff4057]" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <figure className="gta-work-photo relative min-h-[620px] overflow-hidden bg-white/5">
            <Image
              src="/gtafixnclean/white-door-after.jpeg"
              alt="Completed exterior door repair with clean trim and threshold."
              fill
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover"
            />
            <PhotoCaption label="Door repair" text="After alignment, hardware, threshold, and clean edge work." />
          </figure>
          <div className="grid gap-4">
            <figure className="gta-work-photo relative min-h-[302px] overflow-hidden bg-white/5">
              <Image
                src="/gtafixnclean/white-door-before.jpeg"
                alt="Exterior door before repair and finishing."
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover"
              />
              <PhotoCaption label="Before" text="The opening tells you what the job actually needs." />
            </figure>
            <figure className="gta-work-photo relative min-h-[302px] overflow-hidden bg-white/5">
              <Image
                src="/gtafixnclean/site-entry-handle.jpeg"
                alt="Commercial style entry door hardware and handle."
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover"
              />
              <PhotoCaption label="Hardware" text="Handles, locks, closers, sweeps, and daily-use details." />
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}

function AreaAndQuote() {
  return (
    <section id="quote" className="bg-[#fbf9f4] py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-[#c8102e]">
            <MapleLeaf className="h-4 w-4" />
            GTA service
          </p>
          <h2 className="mt-4 max-w-xl text-4xl font-black leading-[0.96] tracking-[0] text-[#191814] sm:text-6xl">
            Send photos. Get the right next move.
          </h2>
          <p className="mt-6 max-w-md text-lg leading-8 text-[#625d52]">
            Include one close-up, one wider shot, the service area, and what is not working. That is enough to start.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {areaRows.map((area) => (
              <span key={area} className="inline-flex items-center gap-2 border border-[#c8102e]/22 bg-white/50 px-3 py-2 text-sm font-black text-[#191814]">
                <MapPin className="h-4 w-4 text-[#c8102e]" />
                {area}
              </span>
            ))}
          </div>
        </div>

        <form action={quoteMailto} method="post" encType="text/plain" className="bg-[#191814] p-4 text-white sm:p-6 lg:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" name="name" placeholder="Your name" />
            <Field label="Phone" name="phone" placeholder="Best callback number" />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Service area" name="area" placeholder="Toronto, Vaughan, etc." />
            <label className="block">
              <span className="text-sm font-black text-white">Job type</span>
              <select
                name="job"
                className="mt-2 h-12 w-full rounded-none border border-white/14 bg-white px-3 text-base font-bold text-[#191814]"
                defaultValue="Door repair"
              >
                <option>Door repair</option>
                <option>Window repair</option>
                <option>Installation</option>
                <option>Weatherstripping / sealing</option>
                <option>Cleaning / finishing</option>
                <option>Other property fix</option>
              </select>
            </label>
          </div>
          <label className="mt-4 block">
            <span className="text-sm font-black text-white">What needs fixing?</span>
            <textarea
              name="message"
              rows={6}
              placeholder="Describe the door, window, lock, screen, seal, trim, or cleanup issue."
              className="mt-2 w-full resize-none rounded-none border border-white/14 bg-white px-3 py-3 text-base font-semibold leading-7 text-[#191814]"
            />
          </label>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-sm bg-[#c8102e] px-5 text-base font-black text-white transition hover:-translate-y-0.5 hover:bg-[#e4233e]"
            >
              Open email quote <ArrowRight className="h-4 w-4" />
            </button>
            <a href={quoteMailto} className="inline-flex h-12 items-center justify-center gap-2 px-1 text-base font-black text-white/82 transition hover:text-white">
              {CONTACT.email}
            </a>
          </div>
        </form>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-[#191814]/12 bg-[#f1eee7]">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link href="#top" className="inline-flex items-center gap-3">
          <LogoMark size="small" />
          <span className="text-xl font-black tracking-[0] text-[#191814]">GTA Fix N Clean</span>
        </Link>
        <div className="flex flex-wrap gap-4 text-sm font-black text-[#625d52]">
          <Link className="hover:text-[#191814]" href="/llm.txt">
            llm.txt
          </Link>
          <Link className="hover:text-[#191814]" href="/llms.txt">
            llms.txt
          </Link>
          <a className="hover:text-[#191814]" href={quoteMailto}>
            {CONTACT.email}
          </a>
        </div>
      </div>
    </footer>
  );
}

function PromiseItem({ label, text }: { label: string; text: string }) {
  return (
    <div className="py-6 md:px-6">
      <p className="text-sm font-black uppercase tracking-[0.14em] text-[#c8102e]">{label}</p>
      <p className="mt-2 max-w-sm text-lg font-black leading-6 text-[#191814]">{text}</p>
    </div>
  );
}

function PhotoCaption({ label, text }: { label: string; text: string }) {
  return (
    <figcaption className="absolute inset-x-0 bottom-0 bg-[linear-gradient(0deg,rgba(25,24,20,0.84),rgba(25,24,20,0))] p-5 pt-20">
      <p className="text-sm font-black uppercase tracking-[0.14em] text-[#ff4057]">{label}</p>
      <p className="mt-1 max-w-md text-lg font-black leading-6 text-white">{text}</p>
    </figcaption>
  );
}

function Field({
  label,
  name,
  placeholder,
}: {
  label: string;
  name: string;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-white">{label}</span>
      <input
        name={name}
        placeholder={placeholder}
        className="mt-2 h-12 w-full rounded-none border border-white/14 bg-white px-3 text-base font-bold text-[#191814]"
      />
    </label>
  );
}

function LogoMark({ size }: { size: "small" | "large" }) {
  const dimensions = size === "large" ? "h-20 w-20" : "h-10 w-10";

  return (
    <span className={`inline-flex ${dimensions} shrink-0 items-center justify-center rounded-sm bg-[#c8102e]`}>
      <svg viewBox="0 0 64 64" aria-hidden="true" className="h-[76%] w-[76%]">
        <path d="M12 10h22v44H12V10Z" fill="#191814" />
        <path d="M17 15h12v34H17V15Z" fill="#f1eee7" />
        <path d="M34 15h18v34H34V15Z" fill="#191814" />
        <path d="M39 20h8v11h-8V20Zm0 16h8v8h-8v-8Z" fill="#f1eee7" />
        <path d="M31 47c6.5 2.6 15.5 2.2 24-1.6" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
        <path d="M25 7l2.3 5.1 5.4-1.6-2.7 5 4.8 2.9-5.6 1.1.6 5.6-4.8-3-4.8 3 .6-5.6-5.6-1.1 4.8-2.9-2.7-5 5.4 1.6L25 7Z" fill="#ffffff" />
      </svg>
    </span>
  );
}

function ServiceSymbol({ kind }: { kind: (typeof serviceLines)[number]["symbol"] }) {
  return (
    <span className="gta-symbol flex h-20 w-20 items-center justify-center bg-[#191814] text-[#f1eee7]">
      <svg viewBox="0 0 80 80" aria-hidden="true" className="h-16 w-16">
        {kind === "door" ? (
          <>
            <path d="M22 14h34v52H22V14Z" fill="none" stroke="currentColor" strokeWidth="5" />
            <path d="M31 20l18 5v36l-18-4V20Z" fill="#c8102e" />
            <circle cx="45" cy="42" r="3" fill="#191814" />
            <path d="M14 66h52" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
          </>
        ) : null}
        {kind === "window" ? (
          <>
            <path d="M18 16h44v46H18V16Z" fill="none" stroke="currentColor" strokeWidth="5" />
            <path d="M40 18v42M20 39h40" stroke="currentColor" strokeWidth="5" />
            <path d="M25 57h30" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            <path d="M28 30l8-8M31 44l16-16" stroke="#c8102e" strokeWidth="4" strokeLinecap="round" />
          </>
        ) : null}
        {kind === "hardware" ? (
          <>
            <rect x="17" y="13" width="22" height="54" rx="10" fill="currentColor" />
            <path d="M28 33h35" stroke="#c8102e" strokeWidth="8" strokeLinecap="round" />
            <circle cx="28" cy="33" r="10" fill="none" stroke="#f1eee7" strokeWidth="4" />
            <path d="M26 51h8" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
          </>
        ) : null}
        {kind === "finish" ? (
          <>
            <path d="M43 13l20 20-11 11-20-20 11-11Z" fill="currentColor" />
            <path d="M25 29l25 25" stroke="#c8102e" strokeWidth="5" strokeLinecap="round" />
            <path d="M18 58c9-8 22-9 37-5" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
            <path d="M15 66c10-5 20-6 31-3" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity=".74" />
          </>
        ) : null}
      </svg>
    </span>
  );
}

function MapleLeaf({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="m12 2 1.58 4.34 4.34-1.36-2.02 4.07 3.86 2.12-4.33.88.43 4.48L12 14.1l-3.86 2.43.43-4.48-4.33-.88L8.1 9.05 6.08 4.98l4.34 1.36L12 2Z"
      />
    </svg>
  );
}
