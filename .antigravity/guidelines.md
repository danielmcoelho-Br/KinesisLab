# Antigravity General Guidelines

These rules are mandatory and must be observed in every session.

## 1. Mandatory Implementation Plan Approval
- Before executing any significant code change or running system commands, Antigravity **MUST** create an `implementation_plan.md`.
- No modifications to the source code are allowed until the user has explicitly approved the plan (e.g., via a message like "Approved" or "Pode prosseguir").

## 2. No Autonomous Browser Previews
- Antigravity shall **NOT** use the browsing tools (browser_subagent, etc.) to autonomously preview the application or perform automated tests unless explicitly requested by the user.
- Verification should rely on unit tests or user-guided checks instead of independent browsing.

## 3. Localization
- Always support Brazilian clinical standards (e.g., decimal commas `10,5` via `safeParse` helper).
- Maintain form labels and clinical statuses in Portuguese as defined in `questionnaires.ts`.
