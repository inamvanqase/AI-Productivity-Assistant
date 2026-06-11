import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Mail,
  ClipboardList,
  ListTodo,
  FileText,
  MessageSquare,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listGenerations } from "@/lib/hr.functions";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Dashboard — HR Assistant" },
      { name: "description", content: "Your HR productivity workspace." },
    ],
  }),
  component: Dashboard,
});

const MODULES = [
  {
    title: "Employee Communication",
    description: "Generate offers, rejections, announcements, and updates.",
    href: "/communication",
    icon: Mail,
    color: "from-indigo-500 to-violet-500",
  },
  {
    title: "Interview & Meeting Summarizer",
    description: "Turn notes into insights, decisions and action items.",
    href: "/meetings",
    icon: ClipboardList,
    color: "from-teal-500 to-emerald-500",
  },
  {
    title: "HR Task Planner",
    description: "Plan onboarding, training, and reviews end-to-end.",
    href: "/tasks",
    icon: ListTodo,
    color: "from-amber-500 to-orange-500",
  },
  {
    title: "Policy & Document Assistant",
    description: "Draft compliant policies and HR documents.",
    href: "/policies",
    icon: FileText,
    color: "from-sky-500 to-blue-500",
  },
  {
    title: "HR Chat Assistant",
    description: "Ask anything — get HR-grounded answers in seconds.",
    href: "/chat",
    icon: MessageSquare,
    color: "from-fuchsia-500 to-pink-500",
  },
] as const;

const MODULE_LABEL: Record<string, string> = {
  communication: "Communication",
  meetings: "Meetings",
  tasks: "Tasks",
  policies: "Policies",
};

function Dashboard() {
  const fetchHistory = useServerFn(listGenerations);
  const { data: history = [] } = useQuery({
    queryKey: ["history", "all"],
    queryFn: () => fetchHistory({ data: { limit: 6 } }),
  });

  return (
    <div className="p-4 md:p-6 space-y-8">
      <section className="rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground p-6 md:p-8">
        <div className="flex items-center gap-2 text-sm/none opacity-90">
          <Sparkles className="h-4 w-4" /> AI-powered HR workspace
        </div>
        <h1 className="mt-2 text-2xl md:text-3xl font-semibold">
          Good to see you. What should we work on?
        </h1>
        <p className="mt-2 text-primary-foreground/85 max-w-2xl">
          Draft communication, summarize meetings, plan workflows, or write
          policies. Every output is editable and saved to your history.
        </p>
      </section>

      <section>
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-lg font-semibold">Modules</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map((m) => (
            <Link key={m.href} to={m.href} className="group">
              <Card className="p-5 h-full hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${m.color} text-white grid place-items-center`}>
                  <m.icon className="h-5 w-5" />
                </div>
                <div className="mt-4 flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-tight">{m.title}</h3>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-sm text-muted-foreground mt-1">{m.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-lg font-semibold">Recent activity</h2>
        </div>
        {history.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <p className="text-sm text-muted-foreground">
              No activity yet. Pick a module above to generate your first HR document.
            </p>
          </Card>
        ) : (
          <Card className="divide-y">
            {history.map((row: any) => (
              <Link
                key={row.id}
                to={`/${row.module}` as any}
                className="flex items-center gap-3 p-4 hover:bg-muted/40 transition"
              >
                <Badge variant="secondary" className="capitalize shrink-0">
                  {MODULE_LABEL[row.module] ?? row.module}
                </Badge>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{row.title}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {row.output.replace(/[#*`>\-\n]/g, " ").slice(0, 120)}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground shrink-0">
                  {formatDistanceToNow(new Date(row.updated_at), { addSuffix: true })}
                </div>
              </Link>
            ))}
          </Card>
        )}
      </section>
    </div>
  );
}