# Patient Intake Widget - Project Context & Rules

## 1. Project Goal
Develop a "Patient Intake Widget" using **Next.js**, **Tailwind CSS**, and **Shadcn/UI**. The widget must allow patients to select an appointment slot and fill out their intake forms, with data persisted to `localStorage`.

## 2. Design Tokens (Medical Modern)
- **Primary Color:** `#0D9488` (Teal 600) for "Safe" actions.
- **Background:** `#F8FAFC` (Slate 50) for the page, `#FFFFFF` for the widget card.
- **Accents:** Soft blues for "Soft Hold" states.
- **Border Radius:** `12px` (Standardized across inputs and buttons).
- **Typography:** System Sans or Inter. Headers should be `font-semibold`.

## 3. Development Standards
- **Framework:** Next.js App Router (latest).
- **Icons:** Use `lucide-react`.
- **Form Handling:** Use `react-hook-form` with `zod` for validation.
- **Components:** Clean, modular components. Use `shadcn/ui` patterns if applicable.
- **Persistence:** Use `localStorage` with `uuid` to simulate a backend.
- **Constraint:** Ensure the "Middle Name" and "Suffix" fields are present but styled smaller/secondary as seen in reference.

## 4. Workflow & Protocol for Agent
1.  **Check Status:** Always review `tasklist.md` to identify the next unfinished step `[ ]`.
2.  **Plan:** Briefly state your plan for the step before writing code.
3.  **Implement:** Write the code, strictly adhering to the **Design Tokens** above.
4.  **Verify:** ensure the code compiles and matches the design visual constraints.
5.  **Update:** Mark the step as completed `[x]` in `tasklist.md`.
