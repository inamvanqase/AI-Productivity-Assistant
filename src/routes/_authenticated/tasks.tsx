import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ListTodo } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { ModuleShell } from "@/components/module-shell";
import { OutputCard } from "@/components/output-card";
import { HistoryList } from "@/components/history-list";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { generateTaskPlan, saveGenerationEdit } from "@/lib/hr.functions";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({ meta: [{ title: "Task Planner — HR Assistant" }] }),
  component: Page,
});

function Page() {
  const qc = useQueryClient();
  const genFn = useServerFn(generateTaskPlan);
  const saveFn = useServerFn(saveGenerationEdit);

  const [form, setForm] = useState({ objective: "", deadline: "", constraints: "" });
  const [output, setOutput] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const gen = useMutation({
    mutationFn: (existingId?: string) => genFn({ data: { ...form, existingId } }),
    onSuccess: (r) => {
      setOutput(r.output);
      setActiveId(r.id);
      qc.invalidateQueries({ queryKey: ["history"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  return (
    <ModuleShell
      title="HR Task Planner"
      description="Plan onboarding, training, or performance review workflows end-to-end."
      icon={ListTodo}
      inputs={
        <>
          <Card className="p-4 space-y-3">
            <div className="space-y-1.5">
              <Label>Objective</Label>
              <Input
                value={form.objective}
                onChange={(e) => setForm({ ...form, objective: e.target.value })}
                placeholder="Onboard 5 new engineers"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Deadline</Label>
              <Input
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                placeholder="In 2 weeks / by 2025-03-15"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Constraints / context</Label>
              <Textarea
                rows={6}
                value={form.constraints}
                onChange={(e) => setForm({ ...form, constraints: e.target.value })}
                placeholder="Remote-first, EU GDPR, only 2 HRBPs available, etc."
              />
            </div>
            <Button
              className="w-full"
              onClick={() => gen.mutate(undefined)}
              disabled={gen.isPending || !form.objective.trim()}
            >
              {gen.isPending ? "Planning…" : "Generate plan"}
            </Button>
          </Card>
          <HistoryList
            module="tasks"
            activeId={activeId}
            onSelect={(row) => {
              setActiveId(row.id);
              setOutput(row.output);
              setForm({
                objective: row.inputs.objective ?? "",
                deadline: row.inputs.deadline ?? "",
                constraints: row.inputs.constraints ?? "",
              });
            }}
          />
        </>
      }
      output={
        <OutputCard
          output={output}
          onChange={setOutput}
          isLoading={gen.isPending}
          onRegenerate={() => gen.mutate(activeId ?? undefined)}
          onSave={
            activeId
              ? async () => {
                  await saveFn({ data: { id: activeId, output } });
                  toast.success("Saved");
                  qc.invalidateQueries({ queryKey: ["history"] });
                }
              : undefined
          }
          filename="hr-plan.md"
          emptyHint="Describe an HR objective to plan it out."
        />
      }
    />
  );
}