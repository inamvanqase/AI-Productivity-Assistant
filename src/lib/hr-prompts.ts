export const HR_SYSTEM = `You are an expert HR Productivity Assistant for HR professionals.
You help draft employee communication, summarize HR meetings and interviews,
plan HR workflows, and write company policies.

Guidelines:
- Be professional, empathetic, and concise.
- Use inclusive, compliance-friendly language.
- Format output in clean Markdown with clear structure.
- Never invent confidential facts. If important details are missing,
  use sensible placeholders like [Employee Name] or [Company Name].
- Remind users that AI-generated HR content should be reviewed before use.`;

export function emailPrompt(input: {
  employeeName: string;
  role: string;
  purpose: string;
  tone: string;
  context?: string;
}) {
  return `Write a professional HR email.

Recipient: ${input.employeeName || "[Employee Name]"}
Role: ${input.role || "[Role]"}
Purpose: ${input.purpose}
Tone: ${input.tone}
Additional context: ${input.context || "(none)"}

Return Markdown with exactly this structure:

## Subject
<one concise subject line>

## Email
<the full email body with greeting, body, and sign-off>

## Alternative tone
<one shorter alternative version of the email body in a different tone variation>`;
}

export function summaryPrompt(input: { notes: string; meetingType: string }) {
  return `Summarize the following ${input.meetingType} notes for HR records.

Notes:
"""
${input.notes}
"""

Return Markdown with these sections:
## Summary
## Key Insights
## Decisions
## Action Items
- Use a checkbox list, e.g. "- [ ] Owner — task — due date".`;
}

export function taskPlanPrompt(input: {
  objective: string;
  deadline: string;
  constraints: string;
}) {
  return `Create an HR workflow plan.

Objective: ${input.objective}
Deadline: ${input.deadline || "(flexible)"}
Constraints: ${input.constraints || "(none)"}

Return Markdown with:
## Overview
## Timeline
A table with columns: Phase | Dates | Owner.
## Task Checklist
Grouped by phase, each task as "- [ ] task description".
## Risks & Mitigations`;
}

export function policyPrompt(input: {
  policyName: string;
  scope: string;
  jurisdiction: string;
  notes: string;
}) {
  return `Draft a professional company HR policy document.

Policy: ${input.policyName}
Scope / who it applies to: ${input.scope}
Jurisdiction / region: ${input.jurisdiction || "Generic / multi-region"}
Special notes: ${input.notes || "(none)"}

Return a Markdown policy with these sections:
# ${input.policyName}
## Purpose
## Scope
## Policy Statement
## Procedures
## Responsibilities
## Compliance & Enforcement
## Review & Revisions

Use compliance-friendly, neutral, inclusive language.`;
}