# Implementation Plan - Embeddable "Smart Snippet" Widgets

# Goal
Enable a "Drop-in" scheduling widget that fits into any page and escalates to a full popup form for the intake process.

# Why Iframes? (Addressing "Brittleness")
We are choosing an **Iframe** approach for the *content* because:
1.  **Style Isolation**: It prevents the host website's CSS (e.g., `h1 { color: red }`) from breaking our widget, and prevents our Tailwind styles from breaking the host site. This is the "Industry Standard" (Calendly, Stripe, Intercom) for this reason.
2.  **Next.js Compatibility**: It allows us to use specific server-side rendering and routing for the widget without complex bundling.

**How we fix the "UI Brittleness" (The "Smart Snippet"):**
Instead of a dumb fixed iframe, we will write a **Smart JS Snippet** that handles the "Escalation".
1.  **State 1 (Inline)**: Iframe sits in the page (showing calendar).
2.  **State 2 (Popup)**: When user clicks, the Snippet *expands* the Iframe to cover the screen (Modal Mode) via `postMessage`.

## Proposed Changes

### 1. Data Layer
#### [NEW] [MockProviderService.ts](file:///c%3A/Users/PatrickFigures/Projects/Appointment%20Scheduler/src/services/MockProviderService.ts)
- `Provider` interface: `id`, `name`, `specialty`, `availability`, `themeColor`.
- Mock Data: 3 providers.

### 2. Next.js Application (The Content)
#### [NEW] `src/app/embed/[providerId]/page.tsx`
- **Mini Calendar View**: Optimized for narrow widths.
- **Intake Form View**: Optimized for mobile/narrow widths.
- **Message Protocol**:
    - When user selects slot: `window.parent.postMessage({ type: 'WIDGET_EXPAND' }, '*')`
    - When user closes: `window.parent.postMessage({ type: 'WIDGET_COLLAPSE' }, '*')`

#### [MODIFY] `Confirmation.tsx` / `IntakeForm.tsx`
- Ensure they look good in narrow containers.

### 3. The "Smart Snippet" (The Glue)
#### [NEW] `public/widget-loader.js`
- This is the script clients paste into their site.
- **Logic**:
    - Inject Iframe into target `div`.
    - Listen for `message` events.
    - **On 'WIDGET_EXPAND'**: Change Iframe style to `position: fixed; inset: 0; z-index: 9999; height: 100vh; width: 100vw`.
    - **On 'WIDGET_COLLAPSE'**: Revert styles to inline.

## Verification Plan

### Manual Verification
1.  **Local Test Page**: Create `public/test-widget.html` importing `widget-loader.js`.
2.  **Flow**:
    - Load page -> See "Inline" calendar.
    - Click Slot -> Verify Iframe expands to full screen overlay.
    - Fill Form -> Submit.
    - Close -> Verify Iframe shrinks back.
