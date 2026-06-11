import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText } from "lucide-react";
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
import { generatePolicy, saveGenerationEdit } from "@/lib/hr.functions";

export const Route = createFileRoute("/_authenticated/policies")({
  head: () => ({ meta: [{ title: "Policies — HR Assistant" }] }),
  component: Page,
});

const SUGGESTIONS = ["Leave Policy", "Code of Conduct", "Remote Work Policy", "Anti-Harassment Policy", "Travel & Expense Policy"];

function Page() {
  const qc = useQueryClient();
  const genFn = useServerFn(generatePolicy);
  const saveFn = useServerFn(saveGenerationEdit);

  const [form, setForm] = useState({
    policyName: "",
    scope: "All employees",
    jurisdiction: "",
    notes: "",
  });
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
      title="Policy & Document Assistant"
      description="Generate compliance-friendly HR policies and documents."
      icon={FileText}
      inputs={
        <>
          <Card className="p-4 space-y-3">
            <div className="space-y-1.5">
              <Label>Policy name</Label>
              <Input
                value={form.policyName}
                onChange={(e) => setForm({ ...form, policyName: e.target.value })}
                placeholder="Leave Policy"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm({ ...form, policyName: s })}
                    className="text-[11px] px-2 py-1 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Scope</Label>
              <Input
                value={form.scope}
                onChange={(e) => setForm({ ...form, scope: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Jurisdiction</Label>
              <Input
                value={form.jurisdiction}
                onChange={(e) => setForm({ ...form, jurisdiction: e.target.value })}
                placeholder="EU / California / India"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Special notes</Label>
              <Textarea
                rows={5}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any specific rules to include (e.g. accrual rates, approval workflows)."
              />
            </div>
            <Button
              className="w-full"
              onClick={() => gen.mutate(undefined)}
              disabled={gen.isPending || !form.policyName.trim()}
            >
              {gen.isPending ? "Drafting…" : "Generate policy"}
            </Button>
          </Card>
          <HistoryList
            module="policies"
            activeId={activeId}
            onSelect={(row) => {
              setActiveId(row.id);
              setOutput(row.output);
              setForm({
                policyName: row.inputs.policyName ?? "",
                scope: row.inputs.scope ?? "All employees",
                jurisdiction: row.inputs.jurisdiction ?? "",
                notes: row.inputs.notes ?? "",
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
          filename="hr-policy.md"
          emptyHint="Enter a policy name to draft it."
        />
      }
    />
  );
}