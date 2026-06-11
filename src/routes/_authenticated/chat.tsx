import { createFileRoute, Outlet, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { listThreads, createThread, deleteThread } from "@/lib/chat.functions";

export const Route = createFileRoute("/_authenticated/chat")({
  head: () => ({ meta: [{ title: "HR Chat — HR Assistant" }] }),
  component: ChatLayout,
});

function ChatLayout() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { threadId?: string };
  const activeId = params.threadId;

  const listFn = useServerFn(listThreads);
  const createFn = useServerFn(createThread);
  const deleteFn = useServerFn(deleteThread);

  const { data: threads = [] } = useQuery({
    queryKey: ["threads"],
    queryFn: () => listFn({}),
  });

  // If on /chat with no thread, pick or create one.
  useEffect(() => {
    if (activeId) return;
    if (threads.length > 0) {
      navigate({ to: "/chat/$threadId", params: { threadId: threads[0].id }, replace: true });
    }
  }, [activeId, threads, navigate]);

  async function startNew() {
    const t = await createFn({ data: {} });
    qc.invalidateQueries({ queryKey: ["threads"] });
    navigate({ to: "/chat/$threadId", params: { threadId: t.id } });
  }

  async function remove(id: string) {
    await deleteFn({ data: { id } });
    qc.invalidateQueries({ queryKey: ["threads"] });
    if (activeId === id) navigate({ to: "/chat" });
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <aside className="w-72 border-r bg-card flex flex-col shrink-0 hidden md:flex">
        <div className="p-3 border-b">
          <Button onClick={startNew} className="w-full">
            <Plus className="h-4 w-4 mr-1" /> New conversation
          </Button>
        </div>
        <ScrollArea className="flex-1">
          {threads.length === 0 ? (
            <div className="p-4 text-xs text-muted-foreground">No conversations yet.</div>
          ) : (
            <ul className="p-1">
              {threads.map((t: any) => (
                <li key={t.id} className="relative group">
                  <Link
                    to="/chat/$threadId"
                    params={{ threadId: t.id }}
                    className={`block px-3 py-2 rounded-md text-sm hover:bg-muted/60 ${
                      activeId === t.id ? "bg-primary/10 text-primary font-medium" : ""
                    }`}
                  >
                    <div className="truncate pr-7">{t.title}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {formatDistanceToNow(new Date(t.updated_at), { addSuffix: true })}
                    </div>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      remove(t.id);
                    }}
                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        {activeId ? (
          <Outlet />
        ) : (
          <div className="flex-1 grid place-items-center text-center p-6">
            <div className="max-w-md">
              <div className="h-12 w-12 mx-auto rounded-xl bg-primary/10 text-primary grid place-items-center mb-3">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold">HR Chat Assistant</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Ask anything — “Write an onboarding email”, “Summarize these interview notes”, “Draft a remote work policy”.
              </p>
              <Button className="mt-4" onClick={startNew}>
                <Plus className="h-4 w-4 mr-1" /> Start a conversation
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}