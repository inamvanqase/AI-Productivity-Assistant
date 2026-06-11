import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateEmail, saveGenerationEdit } from "@/lib/hr.functions";

export const Route = createFileRoute("/_authenticated/communication")({
  head: () => ({ meta: [{ title: "Communication — HR Assistant" }] }),
  component: Page,
});

const PURPOSES = ["Offer letter", "Rejection", "Announcement", "Policy update", "Welcome", "Performance feedback", "Custom"];
const TONES = ["Professional", "Warm", "Formal", "Encouraging", "Concise"];

function Page() {
  const qc = useQueryClient();
  const genFn = useServerFn(generateEmail);
  const saveFn = useServerFn(saveGenerationEdit);

  const [form, setForm] = useState({
    employeeName: "",
    role: "",
    purpose: "Offer letter",
    tone: "Professional",
    context: "",
  });
  const [output, setOutput] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const gen = useMutation({
    mutationFn: (existingId?: string) =>
      genFn({ data: { ...form, existingId } }),
    onSuccess: (r) => {
      setOutput(r.output);
      setActiveId(r.id);
      qc.invalidateQueries({ queryKey: ["history"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Failed"),
  });

  async function save() {
    if (!activeId) return;
    await saveFn({ data: { id: activeId, output } });
    toast.success("Saved");
    qc.invalidateQueries({ queryKey: ["history"] });
  }

  return (
    <ModuleShell
      title="Employee Communication Generator"
      description="Draft HR emails with the right tone — offers, rejections, announcements, and updates."
      icon={Mail}
      inputs={
        <>
          <Card className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Employee name</Label>
                <Input value={form.employeeName} onChange={(e) => setForm({ ...form, employeeName: e.target.value })} placeholder="Jane Smith" />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Product Designer" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Purpose</Label>
                <Select value={form.purpose} onValueChange={(v) => setForm({ ...form, purpose: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PURPOSES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Tone</Label>
                <Select value={form.tone} onValueChange={(v) => setForm({ ...form, tone: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TONES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Context / key details</Label>
              <Textarea
                rows={5}
                value={form.context}
                onChange={(e) => setForm({ ...form, context: e.target.value })}
                placeholder="Salary, start date, benefits, reason for rejection, announcement details…"
              />
            </div>
            <Button
              className="w-full"
              onClick={() => gen.mutate(undefined)}
              disabled={gen.isPending}
            >
              {gen.isPending ? "Generating…" : "Generate email"}
            </Button>
          </Card>
          <HistoryList
            module="communication"
            activeId={activeId}
            onSelect={(row) => {
              setActiveId(row.id);
              setOutput(row.output);
              setForm({
                employeeName: row.inputs.employeeName ?? "",
                role: row.inputs.role ?? "",
                purpose: row.inputs.purpose ?? "Offer letter",
                tone: row.inputs.tone ?? "Professional",
                context: row.inputs.context ?? "",
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
          onSave={activeId ? save : undefined}
          filename="hr-email.md"
          emptyHint="Fill in the form and generate to draft your email."
        />
      }
    />
  );
}