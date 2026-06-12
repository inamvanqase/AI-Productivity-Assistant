import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  Mail,
  ClipboardList,
  ListTodo,
  FileText,
  MessageSquare,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Play,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Live Demo — HR Productivity Assistant" },
      {
        name: "description",
        content:
          "Walk through the HR Productivity Assistant: AI-generated emails, meeting summaries, task plans, policies, and a threaded HR chat.",
      },
      { property: "og:title", content: "Live Demo — HR Productivity Assistant" },
      {
        property: "og:description",
        content: "A guided, interactive tour of the AI-powered HR workspace.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: DemoPresentation,
});

type Slide = {
  id: string;
  kicker?: string;
  render: () => React.ReactElement;
};

function DemoPresentation() {
  const slides = useMemo<Slide[]>(
    () => [
      { id: "intro", kicker: "Welcome", render: IntroSlide },
      { id: "problem", kicker: "The problem", render: ProblemSlide },
      { id: "modules", kicker: "What's inside", render: ModulesSlide },
      { id: "communication", kicker: "Module 01", render: CommunicationSlide },
      { id: "meetings", kicker: "Module 02", render: MeetingsSlide },
      { id: "tasks", kicker: "Module 03", render: TasksSlide },
      { id: "policies", kicker: "Module 04", render: PoliciesSlide },
      { id: "chat", kicker: "Module 05", render: ChatSlide },
      { id: "responsible", kicker: "Responsible AI", render: ResponsibleSlide },
      { id: "cta", kicker: "Get started", render: CtaSlide },
    ],
    [],
  );

  const [index, setIndex] = useState(0);
  const total = slides.length;

  const next = useCallback(() => setIndex((i) => Math.min(i + 1, total - 1)), [total]);
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        prev();
      } else if (e.key === "Home") {
        setIndex(0);
      } else if (e.key === "End") {
        setIndex(total - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, total]);

  const Slide = slides[index].render;
  const kicker = slides[index].kicker;

  return (
    <div className="min-h-screen bg-[#0b1020] text-white overflow-hidden relative">
      {/* Ambient gradient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute top-1/2 -right-40 h-[520px] w-[520px] rounded-full bg-accent/25 blur-3xl" />
        <div className="absolute bottom-[-200px] left-1/3 h-[420px] w-[420px] rounded-full bg-fuchsia-500/15 blur-3xl" />
      </div>

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-10 py-5">
        <Link to="/" className="flex items-center gap-2 text-sm text-white/80 hover:text-white">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-semibold tracking-tight">HR Assistant</span>
          <span className="hidden sm:inline text-white/40">/ Live demo</span>
        </Link>
        <div className="flex items-center gap-3 text-xs text-white/60">
          <span className="hidden md:inline">Use ← → or space to navigate</span>
          <span className="tabular-nums">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>
      </header>

      {/* Slide */}
      <main className="relative z-10 px-6 md:px-12 pb-32">
        <div className="mx-auto max-w-6xl">
          {kicker && (
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {kicker}
            </div>
          )}
          <div key={slides[index].id} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Slide />
          </div>
        </div>
      </main>

      {/* Controls */}
      <footer className="fixed bottom-0 inset-x-0 z-20 px-6 md:px-10 pb-6 pt-3 bg-gradient-to-t from-[#0b1020] via-[#0b1020]/85 to-transparent">
        <div className="mx-auto max-w-6xl flex items-center gap-4">
          <button
            onClick={prev}
            disabled={index === 0}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
              style={{ width: `${((index + 1) / total) * 100}%` }}
            />
          </div>
          <div className="hidden sm:flex gap-1">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 w-2 rounded-full transition ${
                  i === index ? "bg-white scale-125" : "bg-white/25 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
          <button
            onClick={next}
            disabled={index === total - 1}
            className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}

/* ─────────────── Slides ─────────────── */

function Title({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent">
      {children}
    </h1>
  );
}

function Lede({ children }: { children: React.ReactNode }) {
  return <p className="mt-5 max-w-2xl text-base md:text-lg text-white/70">{children}</p>;
}

function IntroSlide() {
  return (
    <div className="pt-6">
      <Title>
        Your AI co-pilot
        <br />
        for everyday HR work.
      </Title>
      <Lede>
        Draft polished communication, summarize meetings, plan onboarding, and write
        policies — all in one place. Every output is editable and saved to your history.
      </Lede>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 rounded-md bg-white text-[#0b1020] px-5 py-2.5 text-sm font-semibold hover:bg-white/90"
        >
          <Play className="h-4 w-4" /> Open the app
        </Link>
        <span className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white/80">
          Press <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[11px]">→</kbd> to begin
        </span>
      </div>
    </div>
  );
}

function ProblemSlide() {
  const points = [
    { n: "6h", l: "spent each week on routine HR writing" },
    { n: "40%", l: "of onboarding tasks slip through tracking" },
    { n: "1 in 3", l: "policies get out of date within a year" },
  ];
  return (
    <div>
      <Title>HR teams write the same things, every week.</Title>
      <Lede>Offers, rejections, announcements, summaries, plans, policies. Repetitive — and high-stakes.</Lede>
      <div className="mt-10 grid sm:grid-cols-3 gap-4">
        {points.map((p) => (
          <div
            key={p.l}
            className="rounded-xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur"
          >
            <div className="text-4xl font-semibold bg-gradient-to-br from-white to-accent bg-clip-text text-transparent">
              {p.n}
            </div>
            <div className="mt-2 text-sm text-white/70">{p.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const MODULES = [
  { i: Mail, t: "Communication", d: "Offers, rejections, announcements", c: "from-indigo-500 to-violet-500" },
  { i: ClipboardList, t: "Meetings", d: "Interview & meeting summaries", c: "from-teal-500 to-emerald-500" },
  { i: ListTodo, t: "Tasks", d: "Onboarding & review planning", c: "from-amber-500 to-orange-500" },
  { i: FileText, t: "Policies", d: "Compliant HR documents", c: "from-sky-500 to-blue-500" },
  { i: MessageSquare, t: "HR Chat", d: "Threaded AI assistant", c: "from-fuchsia-500 to-pink-500" },
];

function ModulesSlide() {
  return (
    <div>
      <Title>Five modules. One workspace.</Title>
      <Lede>Each module is purpose-built around an HR workflow, and shares the same history and chat.</Lede>
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODULES.map((m) => (
          <div key={m.t} className="rounded-xl border border-white/10 bg-white/[0.04] p-5 hover:bg-white/[0.07] transition">
            <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${m.c} grid place-items-center`}>
              <m.i className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-semibold">{m.t}</h3>
            <p className="text-sm text-white/65 mt-1">{m.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModuleDemo({
  icon: Icon,
  title,
  blurb,
  bullets,
  preview,
  href,
}: {
  icon: any;
  title: string;
  blurb: string;
  bullets: string[];
  preview: React.ReactNode;
  href: string;
}) {
  return (
    <div className="grid md:grid-cols-2 gap-10 items-start">
      <div>
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center">
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-white/60 text-sm">{title}</span>
        </div>
        <Title>{blurb}</Title>
        <ul className="mt-6 space-y-2.5 text-white/80">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2">
              <ChevronRight className="h-4 w-4 mt-1 text-accent shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <Link
          to={href}
          className="mt-7 inline-flex items-center gap-1.5 rounded-md bg-white/10 hover:bg-white/15 border border-white/15 px-4 py-2 text-sm"
        >
          Try it live <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-5 shadow-2xl backdrop-blur">
        {preview}
      </div>
    </div>
  );
}

function MockField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">{label}</div>
      <div className="rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white/85">{value}</div>
    </div>
  );
}

function CommunicationSlide() {
  return (
    <ModuleDemo
      icon={Mail}
      title="Employee Communication"
      blurb="Write HR emails in seconds, not hours."
      bullets={[
        "Offer letters, rejections, announcements, policy updates",
        "Pick a tone — professional, warm, formal, direct",
        "Editable Markdown output, one-click copy & export",
      ]}
      href="/communication"
      preview={
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <MockField label="Employee" value="Priya Shah" />
            <MockField label="Role" value="Senior Product Designer" />
          </div>
          <MockField label="Purpose" value="Send offer letter for Senior Designer role" />
          <div className="rounded-md bg-black/40 border border-white/10 p-4 text-sm leading-relaxed text-white/90">
            <div className="text-white/50 text-xs mb-2">DRAFT · GENERATED</div>
            Hi Priya, <br />
            We're delighted to offer you the role of <b>Senior Product Designer</b> at
            Northwind. Your portfolio and conversations with the team made it clear you'd
            be a wonderful fit…
          </div>
        </div>
      }
    />
  );
}

function MeetingsSlide() {
  return (
    <ModuleDemo
      icon={ClipboardList}
      title="Interview & Meeting Summarizer"
      blurb="Turn raw notes into clear decisions."
      bullets={[
        "Structured summary: highlights, decisions, action items",
        "Works for interviews, 1:1s, performance reviews",
        "Saved to history with searchable titles",
      ]}
      href="/meetings"
      preview={
        <div className="space-y-3 text-sm">
          <div className="rounded-md bg-black/40 border border-white/10 p-4 text-white/80">
            <div className="text-white/50 text-xs mb-2">NOTES</div>
            "Candidate strong on systems thinking, hesitant on stakeholder pushback…
            wants remote, 2 weeks notice…"
          </div>
          <div className="rounded-md bg-white/5 border border-white/10 p-4">
            <div className="text-white/50 text-xs mb-2">SUMMARY</div>
            <ul className="space-y-1.5 text-white/85">
              <li>• Strengths: systems thinking, technical depth</li>
              <li>• Concerns: stakeholder negotiation</li>
              <li>• Next step: panel interview with Design Ops</li>
            </ul>
          </div>
        </div>
      }
    />
  );
}

function TasksSlide() {
  return (
    <ModuleDemo
      icon={ListTodo}
      title="HR Task Planner"
      blurb="From objective to step-by-step plan."
      bullets={[
        "Onboarding, training, review cycles, offboarding",
        "Deadlines, owners, dependencies — all generated",
        "Export to your tracker or refine in chat",
      ]}
      href="/tasks"
      preview={
        <div className="space-y-2.5 text-sm">
          <div className="text-white/60 text-xs">2-week onboarding · Senior Designer</div>
          {[
            { d: "Day 1", t: "Welcome, equipment, system access" },
            { d: "Day 3", t: "Intro 1:1s with cross-functional partners" },
            { d: "Week 1", t: "Design system walkthrough + shadow review" },
            { d: "Week 2", t: "First scoped project handoff" },
          ].map((s) => (
            <div key={s.d} className="flex items-center gap-3 rounded-md bg-white/5 border border-white/10 px-3 py-2.5">
              <span className="text-xs rounded bg-accent/20 text-accent px-2 py-0.5 font-medium">{s.d}</span>
              <span className="text-white/85">{s.t}</span>
            </div>
          ))}
        </div>
      }
    />
  );
}

function PoliciesSlide() {
  return (
    <ModuleDemo
      icon={FileText}
      title="Policy & Document Assistant"
      blurb="Draft compliant policies in minutes."
      bullets={[
        "Remote work, leave, code of conduct, DEI",
        "Scope, jurisdiction, and tone are all configurable",
        "Markdown output — versioned in your history",
      ]}
      href="/policies"
      preview={
        <div className="rounded-md bg-black/40 border border-white/10 p-5 text-sm text-white/85 space-y-3">
          <div className="text-white/50 text-xs">REMOTE WORK POLICY · DRAFT</div>
          <h4 className="text-white font-semibold">1. Purpose</h4>
          <p>This policy outlines expectations for employees who perform their roles remotely…</p>
          <h4 className="text-white font-semibold">2. Eligibility</h4>
          <p>Full-time employees in eligible roles may request remote arrangements subject to manager approval…</p>
        </div>
      }
    />
  );
}

function ChatSlide() {
  return (
    <ModuleDemo
      icon={MessageSquare}
      title="HR Chat Assistant"
      blurb="One conversation away from anything HR."
      bullets={[
        "Multiple threaded conversations, saved per user",
        "Streaming answers grounded in HR best practice",
        "Auto-titled threads, easy to revisit later",
      ]}
      href="/chat"
      preview={
        <div className="space-y-3 text-sm">
          <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-primary/80 px-4 py-2.5 text-white">
            Draft a friendly Slack announcement that Maya joined as Head of People.
          </div>
          <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white/10 px-4 py-2.5 text-white/90">
            👋 Big news, team! Please join me in welcoming <b>Maya Chen</b> as our new
            Head of People. Maya brings 10+ years building thoughtful, scalable people
            programs…
          </div>
        </div>
      }
    />
  );
}

function ResponsibleSlide() {
  return (
    <div>
      <div className="inline-flex items-center gap-2 mb-4">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 grid place-items-center">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <span className="text-white/60 text-sm">Responsible AI</span>
      </div>
      <Title>You're always in the driver's seat.</Title>
      <Lede>
        AI-generated content should be reviewed before use. Every output is editable,
        every action is logged to your history, and your data stays scoped to your account.
      </Lede>
      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        {[
          { t: "Review before use", d: "Built-in disclaimer on every generated document." },
          { t: "Editable outputs", d: "Tweak, regenerate, or rewrite in place." },
          { t: "Private by default", d: "Row-level security keeps your data yours." },
        ].map((x) => (
          <div key={x.t} className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
            <div className="font-medium">{x.t}</div>
            <div className="text-sm text-white/65 mt-1">{x.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CtaSlide() {
  return (
    <div className="text-center py-10">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent grid place-items-center mb-6">
        <Sparkles className="h-7 w-7" />
      </div>
      <Title>Ready to give your HR team back their week?</Title>
      <Lede>
        <span className="block mx-auto">
          Sign in, generate your first document, and feel the difference in 60 seconds.
        </span>
      </Lede>
      <div className="mt-8 flex justify-center gap-3">
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 rounded-md bg-white text-[#0b1020] px-6 py-3 text-sm font-semibold hover:bg-white/90"
        >
          Start free <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-5 py-3 text-sm hover:bg-white/10"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
