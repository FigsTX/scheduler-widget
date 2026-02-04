# Patient Intake Widget - Project Context & Rules

## 1. Project Goal
Develop a "Patient Intake Widget" using **Next.js**, **Tailwind CSS**, and **Shadcn/UI**. The widget must allow patients to select an appointment slot and fill out their intake forms, with data persisted to `localStorage`.

## 2. Design Tokens (Medical Modern)
- **Primary Color:** `#0D9488` (Teal 600) for "Safe" actions.
- **Background:** `#F8FAFC` (Slate 50) for the page, `#FFFFFF` for the widget card.
- **Accents:** Soft blues (`#EFF6FF`) for "Soft Hold" states.
- **Border Radius:** `12px` (Standardized across inputs and buttons).
- **Typography:** System Sans or Inter. Headers should be `font-semibold`.

## 3. Development Standards & Architectural Principles
- **Framework:** Next.js App Router (latest).
- **Icons:** Use `lucide-react`.
- **Form Handling:** Use `react-hook-form` with `zod` for validation.
- **Components:** Clean, modular components. Use `shadcn/ui` patterns if applicable.
- **Persistence:** Use `localStorage` with `uuid` to simulate a backend.
- **Scalability First:** Even when building for one provider, design data structures (e.g., `Provider` interface) to handle 10-100 instances. Avoid hardcoding strings that should be configuration-driven.
- **Modular Embedding:** Components should be "container-aware" (responsive to their parent width) to support iframe or snippet-based embedding without layout breakage.

## 4. Workflow & Protocol for AI Agent
1.  **Plan & Research:** State the plan. If a task involves new architecture, research the existing codebase first to ensure alignment.
2.  **Proactive Validation:** Before completing a step, verify accessibility (ARIA labels), mobile responsiveness, and design token compliance.
3.  **Review Progress:** Summarize what was accomplished and confirm next steps with the user.

## 5. Best Practices for Tool Guidance (Rule-Making)
When adding new rules or guiding the AI, follow these principles:
- **Be Explicit**: Use hex codes, pixel values, and specific library names. Avoid vague terms like "make it look nice."
- **Set Negative Constraints**: Explicitly state what NOT to do (e.g., "Do not use external state management like Redux for this simple widget").
- **Define "Definition of Done"**: Specify what success looks like for a task (e.g., "The form must validate all fields before showing the success toast").
- **Modularize Instructions**: If a feature is complex, break it into a separate `.md` guidance file rather than bloating this main context file.
- **Post-Action Review**: If the agent makes a mistake, update the rules in this file to prevent that specific type of error in the future.
