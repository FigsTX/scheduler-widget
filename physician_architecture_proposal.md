# Physician & Embeddable Widget Architecture

## 1. Goal
Scale to 10-100 physicians and enable a "Drop-in" scheduling widget (JS Snippet/Iframe) for any website.

## 2. Core Architecture Changes

### A. Data Model (The "Brain")
Define a `Provider` to drive the UI configuration.

```typescript
// src/services/MockProviderService.ts
export interface Provider {
  id: string; // "dr-sarah-smith"
  name: string;
  avatarUrl: string;
  specialty: string;
  location: { city: string; state: string };
  availability: {
    days: number[]; // 0=Sun...
    hours: { start: string; end: string };
  };
  // Widget customization
  theme?: {
    primaryColor: string;
  };
}
```

### B. Widget Strategy (The "Snippet")
To allow "dropping" the scheduler into any page, we will use an **Iframe-based Widget** approach. This ensures isolation (no CSS conflicts with the host site) and leverages Next.js SSR.

**The "Snippet" code provided to clients:**
```html
<script src="https://our-app.com/widget.js" data-provider="dr-sarah-smith" data-element="booking-widget"></script>
```
*This script injects an iframe pointing to our `/embed/...` route.*

### C. Routing Structure
1.  **`/embed/[providerId]/page.tsx`**:
    - **Purpose**: The "Mini" view optimized for small containers (300-400px width).
    - **Layout**: No navigation bar, no footer. Minimal padding.
    - **Behavior**: Shows `ProviderHeader` + `AppointmentPicker`.
2.  **`/book/[providerId]/page.tsx`**:
    - **Purpose**: The standalone full-page view (fallback or direct link).

### D. "Escalation" to Popup
When a user clicks a time slot in the widget:
1.  **State Change**: The Widget (inside the iframe) switches view from "Calendar" to "Intake Form".
2.  **UX**: The Intake Form slides up or overlays the calendar *within the widget area*.
    - *Constraint*: If the widget is small (snippet), the Intake Form must be compact/mobile-responsive.
    - *Alternative*: The widget triggers a `postMessage` to the parent page to open a full-screen modal (more complex integration, but better UX).
    - **Recommendation for MVP**: Keep the flow *inside* the widget. The "Card" simply expands or slides to show the form.

## 3. Implementation Steps

### Phase 1: The Embed Route
1.  Create `src/app/embed/[providerId]/page.tsx`.
2.  Create a `WidgetLayout` (transparent background, autosizing).
3.  Refactor `AppointmentPicker` to be a "Controlled Component" that can switch modes (Calendar <-> Form).

### Phase 2: The "Snippet" Script
1.  Create `public/widget.js`.
2.  Logic: Find target element -> Insert Iframe (`src="/embed/${providerId}"`) -> Handle resizing.

### Phase 3: Dynamic Data
1.  Implement `MockProviderService`.
2.  Wire up the route to fetch data based on `[providerId]`.

## 4. User Flow (Widget Mode)
1.  **Host Page**: Shows Physician Card (Photo, Rating, "Next Available").
2.  **interaction**: User clicks "See Availability" or just sees the slots immediately.
3.  **Selection**: User clicks "9:00 AM".
4.  **Escalation**: Code detects "Widget Mode".
    - Instead of navigating to `/new-page`, it renders the `IntakeForm` in place (Overlay/Slide-over).
5.  **Completion**: detailed confirmation screen shown in-widget.
