import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { listGenerations, deleteGeneration } from "@/lib/hr.functions";

export function HistoryList({
  module,
  activeId,
  onSelect,
}: {
  module: "communication" | "meetings" | "tasks" | "policies";
  activeId?: string | null;
  onSelect: (row: any) => void;
}) {
  const qc = useQueryClient();
  const fetchFn = useServerFn(listGenerations);
  const delFn = useServerFn(deleteGeneration);
  const { data = [] } = useQuery({
    queryKey: ["history", module],
    queryFn: () => fetchFn({ data: { module } }),
  });

  async function remove(id: string) {
    await delFn({ data: { id } });
    qc.invalidateQueries({ queryKey: ["history", module] });
    qc.invalidateQueries({ queryKey: ["history", "all"] });
  }

  return (
    <Card>
      <div className="px-4 py-3 border-b">
        <h3 className="text-sm font-semibold">History</h3>
      </div>
      <ScrollArea className="h-[280px]">
        {data.length === 0 ? (
          <div className="p-4 text-xs text-muted-foreground">No history yet.</div>
        ) : (
          <ul>
            {data.map((row: any) => (
              <li
                key={row.id}
                className={`group flex items-start gap-2 px-3 py-2 border-b last:border-0 cursor-pointer hover:bg-muted/40 ${
                  activeId === row.id ? "bg-primary/5" : ""
                }`}
                onClick={() => onSelect(row)}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{row.title}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {formatDistanceToNow(new Date(row.updated_at), { addSuffix: true })}
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(row.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
    </Card>
  );
}