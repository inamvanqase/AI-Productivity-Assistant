import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";

import {
  createLovableAiGatewayProvider,
  DEFAULT_MODEL,
} from "@/lib/ai-gateway.server";
import { HR_SYSTEM } from "@/lib/hr-prompts";

async function authUser(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  const sb = createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await sb.auth.getClaims(token);
  if (error || !data?.claims?.sub) return null;
  return { userId: data.claims.sub as string, sb };
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const me = await authUser(request);
        if (!me) return new Response("Unauthorized", { status: 401 });

        const body = (await request.json()) as {
          messages?: UIMessage[];
          threadId?: string;
        };
        if (!body.messages || !body.threadId) {
          return new Response("Bad request", { status: 400 });
        }

        // verify thread ownership
        const { data: thread } = await me.sb
          .from("chat_threads")
          .select("id,title")
          .eq("id", body.threadId)
          .eq("user_id", me.userId)
          .maybeSingle();
        if (!thread) return new Response("Thread not found", { status: 404 });

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        const gateway = createLovableAiGatewayProvider(key);

        // Persist the latest user message (idempotency: skip if id already exists)
        const lastUser = [...body.messages].reverse().find((m) => m.role === "user");
        if (lastUser) {
          const text = lastUser.parts
            .map((p: any) => (p.type === "text" ? p.text : ""))
            .join("");
          await me.sb.from("chat_messages").insert({
            thread_id: body.threadId,
            user_id: me.userId,
            role: "user",
            content: text,
            parts: lastUser.parts as any,
          });
          // Auto-title on first message
          if (thread.title === "New conversation" && text) {
            await me.sb
              .from("chat_threads")
              .update({ title: text.slice(0, 60) })
              .eq("id", body.threadId);
          } else {
            await me.sb
              .from("chat_threads")
              .update({ updated_at: new Date().toISOString() })
              .eq("id", body.threadId);
          }
        }

        const result = streamText({
          model: gateway(DEFAULT_MODEL),
          system: HR_SYSTEM,
          messages: await convertToModelMessages(body.messages),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: body.messages,
          onFinish: async ({ messages }) => {
            const last = messages[messages.length - 1];
            if (!last || last.role !== "assistant") return;
            const text = last.parts
              .map((p: any) => (p.type === "text" ? p.text : ""))
              .join("");
            await me.sb.from("chat_messages").insert({
              thread_id: body.threadId,
              user_id: me.userId,
              role: "assistant",
              content: text,
              parts: last.parts as any,
            });
          },
        });
      },
    },
  },
});