import type { ReactNode } from "react";

export function ModuleShell({
  title,
  description,
  icon: Icon,
  inputs,
  output,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  inputs: ReactNode;
  output: ReactNode;
}) {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="grid lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] gap-6">
        <section className="space-y-4">{inputs}</section>
        <section className="space-y-4">{output}</section>
      </div>
    </div>
  );
}