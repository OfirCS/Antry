// Testimonial source-of-truth.
// As real quotes come in from seeded builders, replace the placeholder block
// below with verified entries. Keep `verified: true` for anything that came
// from a real claim conversation or interview — never invent quotes.

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  initials: string;
  gradient: string;
  verified: boolean;
  source?: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "Demo-first portfolios. The whole platform feels like the antidote to resume theater.",
    name: "Early-access builder",
    role: "AI Engineer",
    initials: "EB",
    gradient: "linear-gradient(135deg, #2563eb 0%, #0891b2 100%)",
    verified: false,
  },
  {
    quote:
      "Antathons changed my shipping pace. Building under 48-hour pressure with a public deadline produces work I never would have shipped on my own.",
    name: "Early-access builder",
    role: "Full-Stack Builder",
    initials: "FB",
    gradient: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)",
    verified: false,
  },
  {
    quote:
      "It finally feels fair. Teams judge me on depth, polish, and momentum instead of buzzwords or company logos.",
    name: "Early-access builder",
    role: "Design Engineer",
    initials: "DE",
    gradient: "linear-gradient(135deg, #0ea5e9 0%, #4338ca 100%)",
    verified: false,
  },
];

// Use this to gate visibility of the verified badge / "Builders shipping on Antry" section.
export const hasVerifiedTestimonials = testimonials.some((t) => t.verified);
