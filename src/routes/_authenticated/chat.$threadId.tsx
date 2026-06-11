import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import { Send, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { loadThreadMessages } from "@/lib/chat.functions";

export const Route = createFileRoute("/_authenticated/chat/$threadId")({
  component: ThreadPage,
});

function ThreadPage() {
  const { threadId } = Route.useParams();
  const loadFn = useServerFn(loadThreadMessages);
  const { data, isLoading } = useQuery({
    queryKey: ["thread", threadId],
    queryFn: () => loadFn({ data: { threadId } }),
  });

  if (isLoading || !data) {
    return <div className="p-6 text-sm text-muted-foreground">Loading conversation…</div>;
  }
  return <ChatWindow key={threadId} threadId={threadId} initialMessages={data.messages as UIMessage[]} />;
}

function ChatWindow({ threadId, initialMessages }: { threadId: string; initialMessages: UIMessage[] }) {
  const [input, setInput] = useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const transport = new DefaultChatTransport({
    api: "/api/chat",
    body: { threadId },
    fetch: async (url, init) => {
      const { data } = await supabase.auth.getSession();
      const headers = new Headers(init?.headers);
      if (data.session?.access_token) {
        headers.set("Authorization", `Bearer ${data.session.access_token}`);
      }
      return fetch(url, { ...init, headers });
    },
  });

  const { messages, sendMessage, status } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    taRef.current?.focus();
  }, [threadId, status]);

  async function submit() {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    await sendMessage({ text });
  }

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollerRef} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-5">
          {messages.length === 0 && (
            <div className="text-center py-10">
              <div className="h-10 w-10 mx-auto rounded-lg bg-primary/10 text-primary grid place-items-center mb-2">
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="text-sm text-muted-foreground">
                Ask anything HR — drafting, summarizing, planning, policies.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 justify-center">
                {[
                  "Write an onboarding email for a new designer",
                  "Summarize these interview notes…",
                  "Draft a remote work policy",
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-primary/10 hover:text-primary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m) => {
            const text = m.parts
              .map((p: any) => (p.type === "text" ? p.text : ""))
              .join("");
            const isUser = m.role === "user";
            return (
              <div key={m.id} className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
                {!isUser && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">AI</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    isUser
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-card border rounded-bl-sm"
                  }`}
                >
                  {isUser ? (
                    <div className="whitespace-pre-wrap">{text}</div>
                  ) : (
                    <div className="prose-hr">
                      <ReactMarkdown>{text || "…"}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {status === "submitted" && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">AI</AvatarFallback>
              </Avatar>
              <div className="bg-card border rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0.15s]" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t bg-card p-3">
        <div className="max-w-3xl mx-auto flex gap-2 items-end">
          <Textarea
            ref={taRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder="Message the HR assistant…"
            className="resize-none min-h-[44px] max-h-40"
          />
          <Button onClick={submit} disabled={isLoading || !input.trim()} size="icon" className="h-11 w-11 shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="max-w-3xl mx-auto mt-2 text-[11px] text-muted-foreground text-center">
          AI-generated content should be reviewed before use.
        </p>
      </div>
    </div>
  );
}