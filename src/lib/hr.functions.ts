import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider, DEFAULT_MODEL } from "./ai-gateway.server";
import {
  HR_SYSTEM,
  emailPrompt,
  policyPrompt,
  summaryPrompt,
  taskPlanPrompt,
} from "./hr-prompts";

function provider() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key)(DEFAULT_MODEL);
}

const ModuleEnum = z.enum(["communication", "meetings", "tasks", "policies"]);

async function runAndSave(opts: {
  context: { supabase: any; userId: string };
  module: z.infer<typeof ModuleEnum>;
  title: string;
  prompt: string;
  inputs: Record<string, unknown>;
  existingId?: string;
}) {
  const { text } = await generateText({
    model: provider(),
    system: HR_SYSTEM,
    prompt: opts.prompt,
  });
  const { supabase, userId } = opts.context;
  if (opts.existingId) {
    await supabase
      .from("generations")
      .update({ output: text, inputs: opts.inputs, title: opts.title })
      .eq("id", opts.existingId)
      .eq("user_id", userId);
    return { id: opts.existingId, output: text };
  }
  const { data, error } = await supabase
    .from("generations")
    .insert({
      user_id: userId,
      module: opts.module,
      title: opts.title,
      inputs: opts.inputs,
      output: text,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return { id: data!.id as string, output: text };
}

/* -------- Email -------- */
const EmailInput = z.object({
  employeeName: z.string().default(""),
  role: z.string().default(""),
  purpose: z.string().min(1),
  tone: z.string().default("Professional"),
  context: z.string().default(""),
  existingId: z.string().uuid().optional(),
});
export const generateEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => EmailInput.parse(d))
  .handler(async ({ data, context }) =>
    runAndSave({
      context,
      module: "communication",
      title: data.purpose.slice(0, 80),
      prompt: emailPrompt(data),
      inputs: data,
      existingId: data.existingId,
    }),
  );

/* -------- Summary -------- */
const SummaryInput = z.object({
  notes: z.string().min(1),
  meetingType: z.string().default("interview"),
  existingId: z.string().uuid().optional(),
});
export const generateSummary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SummaryInput.parse(d))
  .handler(async ({ data, context }) =>
    runAndSave({
      context,
      module: "meetings",
      title: `${data.meetingType} summary`,
      prompt: summaryPrompt(data),
      inputs: data,
      existingId: data.existingId,
    }),
  );

/* -------- Task Plan -------- */
const TaskInput = z.object({
  objective: z.string().min(1),
  deadline: z.string().default(""),
  constraints: z.string().default(""),
  existingId: z.string().uuid().optional(),
});
export const generateTaskPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => TaskInput.parse(d))
  .handler(async ({ data, context }) =>
    runAndSave({
      context,
      module: "tasks",
      title: data.objective.slice(0, 80),
      prompt: taskPlanPrompt(data),
      inputs: data,
      existingId: data.existingId,
    }),
  );

/* -------- Policy -------- */
const PolicyInput = z.object({
  policyName: z.string().min(1),
  scope: z.string().default("All employees"),
  jurisdiction: z.string().default(""),
  notes: z.string().default(""),
  existingId: z.string().uuid().optional(),
});
export const generatePolicy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => PolicyInput.parse(d))
  .handler(async ({ data, context }) =>
    runAndSave({
      context,
      module: "policies",
      title: data.policyName,
      prompt: policyPrompt(data),
      inputs: data,
      existingId: data.existingId,
    }),
  );

/* -------- History -------- */
export const listGenerations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ module: ModuleEnum.optional(), limit: z.number().optional() }).parse(d ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("generations")
      .select("id,module,title,output,inputs,created_at,updated_at")
      .eq("user_id", context.userId)
      .order("updated_at", { ascending: false })
      .limit(data.limit ?? 50);
    if (data.module) q = q.eq("module", data.module);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const saveGenerationEdit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), output: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("generations")
      .update({ output: data.output })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteGeneration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("generations")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });