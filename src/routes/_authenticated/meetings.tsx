import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ClipboardList } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { ModuleShell } from "@/components/module-shell";
import { OutputCard } from "@/components/output-card";
import { HistoryList } from "@/components/history-list";
import { Card } from "@/components/ui/card";
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
import { generateSummary, saveGenerationEdit } from "@/lib/hr.functions";

export const Route = createFileRoute("/_authenticated/meetings")({
  head: () => ({ meta: [{ title: "Meetings — HR Assistant" }] }),
  component: Page,
});

function Page() {
  const qc = useQueryClient();
  const genFn = useServerFn(generateSummary);
  const saveFn = useServerFn(saveGenerationEdit);

  const [form, setForm] = useState({ notes: "", meetingType: "interview" });
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
      title="Interview & Meeting Summarizer"
      description="Paste raw notes — get structured insights, decisions, and action items."
      icon={ClipboardList}
      inputs={
        <>
          <Card className="p-4 space-y-3">
            <div className="space-y-1.5">
              <Label>Meeting type</Label>
              <Select value={form.meetingType} onValueChange={(v) => setForm({ ...form, meetingType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["interview", "1:1", "performance review", "team meeting", "HR sync"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Raw notes</Label>
              <Textarea
                rows={14}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Paste interview transcript or meeting notes here…"
              />
            </div>
            <Button
              className="w-full"
              onClick={() => gen.mutate(undefined)}
              disabled={gen.isPending || !form.notes.trim()}
            >
              {gen.isPending ? "Summarizing…" : "Summarize"}
            </Button>
          </Card>
          <HistoryList
            module="meetings"
            activeId={activeId}
            onSelect={(row) => {
              setActiveId(row.id);
              setOutput(row.output);
              setForm({
                notes: row.inputs.notes ?? "",
                meetingType: row.inputs.meetingType ?? "interview",
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
          filename="meeting-summary.md"
          emptyHint="Paste your notes and click Summarize."
        />
      }
    />
  );
}