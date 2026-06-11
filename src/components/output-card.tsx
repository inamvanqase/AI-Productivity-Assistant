import { useEffect, useState } from "react";
import { Copy, Download, RefreshCw, Save, Pencil, Eye } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function OutputCard({
  output,
  onChange,
  onRegenerate,
  onSave,
  isLoading,
  filename = "hr-output.md",
  emptyHint,
}: {
  output: string;
  onChange: (v: string) => void;
  onRegenerate?: () => void;
  onSave?: () => void;
  isLoading?: boolean;
  filename?: string;
  emptyHint?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(output);

  useEffect(() => setLocal(output), [output]);

  function commit(v: string) {
    setLocal(v);
    onChange(v);
  }

  function copy() {
    navigator.clipboard.writeText(local);
    toast.success("Copied to clipboard");
  }

  function download() {
    const blob = new Blob([local], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  if (!output && !isLoading) {
    return (
      <Card className="p-10 text-center text-sm text-muted-foreground border-dashed">
        {emptyHint ?? "Your AI-generated output will appear here."}
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-1 border-b px-3 py-2 bg-muted/30">
        <Button size="sm" variant="ghost" onClick={() => setEditing((e) => !e)} className="h-8">
          {editing ? <Eye className="h-4 w-4 mr-1" /> : <Pencil className="h-4 w-4 mr-1" />}
          {editing ? "Preview" : "Edit"}
        </Button>
        <div className="flex-1" />
        {onRegenerate && (
          <Button size="sm" variant="ghost" onClick={onRegenerate} disabled={isLoading} className="h-8">
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Regenerate
          </Button>
        )}
        {onSave && (
          <Button size="sm" variant="ghost" onClick={onSave} className="h-8">
            <Save className="h-4 w-4 mr-1" /> Save
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={copy} className="h-8">
          <Copy className="h-4 w-4 mr-1" /> Copy
        </Button>
        <Button size="sm" variant="ghost" onClick={download} className="h-8">
          <Download className="h-4 w-4 mr-1" /> Export
        </Button>
      </div>

      <div className="p-5 min-h-[280px]">
        {isLoading && !local ? (
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded animate-pulse w-1/3" />
            <div className="h-3 bg-muted rounded animate-pulse w-5/6" />
            <div className="h-3 bg-muted rounded animate-pulse w-4/6" />
          </div>
        ) : editing ? (
          <Textarea
            value={local}
            onChange={(e) => commit(e.target.value)}
            className="min-h-[400px] font-mono text-sm"
          />
        ) : (
          <div className="prose-hr text-foreground">
            <ReactMarkdown>{local}</ReactMarkdown>
          </div>
        )}
      </div>

      <div className="px-5 py-3 border-t bg-muted/20 text-[11px] text-muted-foreground">
        AI-generated content should be reviewed before use.
      </div>
    </Card>
  );
}