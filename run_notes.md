# Run Notes

## Step 1: Scaffolding (Completed)

### What was done
- Scaffolded a **Next.js 16.1.6** project with TypeScript, Tailwind CSS v4, App Router, and `src/` directory structure.
- Installed core dependencies:
  - `lucide-react` — icons
  - `react-hook-form` + `@hookform/resolvers` — form handling
  - `zod` — schema validation
  - `uuid` + `@types/uuid` — ID generation for localStorage persistence
- Initialized **shadcn/ui** and added base components: `button`, `input`, `label`, `card`, `select`.
- Configured **Medical Modern design tokens** in `src/app/globals.css`:
  - Primary color: `#0D9488` (Teal 600)
  - Page background: `#F8FAFC` (Slate 50)
  - Card background: `#FFFFFF`
  - Border radius: `0.75rem` (12px)
  - Accent: `#DBEAFE` (soft blue for Soft Hold states)
  - Ring/focus: `#0D9488` (matches primary)
- Swapped default Geist font for **Inter** in `src/app/layout.tsx`.
- Replaced Next.js boilerplate in `src/app/page.tsx` with a minimal placeholder.
- Verified the build compiles cleanly with `npm run build`.
- Marked Step 1 as complete in `tasklist.md`.

## Step 2: The Provider Header (Completed)

### What was done
- Created `src/components/ProviderHeader.tsx` — a card-based doctor profile component featuring:
  - Initials-based avatar with a green "online" indicator dot
  - Doctor name: **Dr. Sarah Smith**
  - Specialty: Family Medicine · Board Certified
  - **Telehealth** badge with `Video` icon (teal primary color)
  - Star rating: **4.9** (127 reviews) with filled amber star
  - Location: Austin, TX (MapPin icon)
  - Availability: "Next available today" (Clock icon)
- Uses `lucide-react` icons (`Star`, `MapPin`, `Clock`, `Video`) and the shadcn `Card` component.
- Integrated the component into `src/app/page.tsx` inside a centered `max-w-2xl` layout container.
- Build compiles cleanly.
- Marked Step 2 as complete in `tasklist.md`.

## Step 3: Horizontal Calendar (Completed)

### What was done
- Created three new components:
  - **`src/components/AppointmentPicker.tsx`** — parent wrapper that manages state (selected date, week offset, selected time) and generates mock time slots per date. Includes chevron navigation to page through weeks. Sundays have no slots.
  - **`src/components/DatePicker.tsx`** — horizontal scrollable 7-day strip. Each day shows abbreviated name + date number. Selected day is highlighted in primary teal. Today gets a "Today" sub-label. Sundays are disabled/dimmed.
  - **`src/components/TimeSlots.tsx`** — responsive grid (3 cols mobile, 4 cols desktop) of time buttons. Selected slot highlighted in primary teal. Empty state shows a clock icon with "No available slots" message.
- Mock slot generation varies availability by day for a realistic feel (seeded by date).
- Integrated `AppointmentPicker` below `ProviderHeader` in `src/app/page.tsx`.
- All components use 12px (`rounded-xl`) border radius per design tokens.
- Build compiles cleanly.
- Marked Step 3 as complete in `tasklist.md`.

## Step 4: Soft-Hold Logic (Completed)

### What was done
- Created **`src/hooks/useSoftHold.ts`** — a custom hook managing soft-hold state:
  - `placeHold(date, time)` — starts a 5-minute countdown timer via `setInterval`.
  - `releaseHold()` — clears the timer and removes the hold.
  - Auto-expires: when the countdown reaches 0, the hold is released automatically.
  - Cleans up the interval on unmount.
- Created **`src/components/SoftHoldBanner.tsx`** — a styled banner that appears when a slot is held:
  - Shows held slot details (date + time) and a live `M:SS` countdown.
  - Soft blue accent styling (matches "Soft Hold" design token) by default.
  - Turns red when under 60 seconds remaining (urgent state).
  - "X" button to release the hold manually.
  - "Continue to Intake" button with arrow icon (wired for Step 5).
- Updated **`src/app/page.tsx`** to `"use client"`, integrated `useSoftHold` hook, and conditionally renders `SoftHoldBanner` below the appointment picker when a slot is selected.
- Build compiles cleanly.
- Marked Step 4 as complete in `tasklist.md`.

## Step 5: Detailed Intake Form (Completed)

### What was done
- Created **`src/components/IntakeForm.tsx`** — a multi-column patient intake form using `react-hook-form` + `zod`:
  - **Name row** (4-column grid): First Name, Middle Name (smaller `w-24`, secondary label styling), Last Name, Suffix (smaller `w-20`, secondary label styling) — per CLAUDE.md constraint.
  - **DOB + Gender row** (2-column): Date input and Select dropdown (Male, Female, Non-binary, Prefer not to say).
  - **Address section**: Street (full width), then City / State (`w-24`) / ZIP (`w-28`) grid.
  - **Contact row** (2-column): Phone and Email.
  - All required fields marked with red asterisk. Inline error messages below each field.
  - Submit button: "Confirm Appointment" with loading spinner state.
- Zod schema validates all required fields, phone format regex, email format, ZIP length.
- Exports `IntakeFormData` type for use by parent components.
- Updated **`src/app/page.tsx`**:
  - Added `showIntake` state toggled by "Continue to Intake" button.
  - `IntakeForm` renders conditionally below the soft-hold banner.
  - Selecting a new slot hides the form; releasing the hold hides the form.
  - Submit handler logs data (persistence deferred to Step 6).
- All inputs use `rounded-xl` (12px) per design tokens.
- Build compiles cleanly.
- Marked Step 5 as complete in `tasklist.md`.

## Step 6: Validation & Mock Persistence (Completed)

### What was done
- Created **`src/services/MockAppointmentService.ts`** — localStorage-backed persistence:
  - `create(date, time, patient)` — generates a `uuid` ID, builds an `Appointment` object, appends to the stored array, and returns it.
  - `getAll()` — reads and parses all appointments from localStorage.
  - `getById(id)` — finds a single appointment by ID.
  - `cancel(id)` — marks an appointment as `"cancelled"`.
  - Stores under the key `"patient_appointments"`.
  - `Appointment` type exported: `{ id, date, time, patient, status, createdAt }`.
- Created **`src/components/Confirmation.tsx`** — success screen shown after booking:
  - Teal checkmark icon in a circle.
  - "Appointment Confirmed" heading with truncated confirmation ID (first 8 chars of uuid).
  - 3-column summary cards: Date (formatted long), Time, Patient full name.
  - "Book Another Appointment" button to reset the flow.
- Updated **`src/app/page.tsx`**:
  - `handleIntakeSubmit` calls `MockAppointmentService.create()` inside a try/catch.
  - On success: releases hold, hides form, shows `Confirmation` with the returned appointment.
  - On error: shows a red error banner.
  - `handleBookAnother` resets all state back to the initial slot-picking view.
  - Zod validation (from Step 5) runs on submit before the service is called.
- Build compiles cleanly.
- Marked Step 6 as complete in `tasklist.md`.

## Step 7: Mobile Responsiveness Polish (Completed)

### What was done
- **IntakeForm** (`src/components/IntakeForm.tsx`):
  - Name row: changed from fixed 4-col to `grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_1fr_auto]` — stacks into 2 rows (First+Middle, Last+Suffix) on mobile, 4-col on sm+.
  - Address row: City spans full width on mobile (`col-span-2 sm:col-span-1`), State+ZIP sit side by side below it.
  - DOB+Gender and Phone+Email rows: changed to `grid-cols-1 sm:grid-cols-2` so they stack on mobile.
  - Middle name field: narrowed to `w-20 sm:w-24` for tighter mobile fit.
- **DatePicker** (`src/components/DatePicker.tsx`):
  - Day buttons changed from `min-w-[4.25rem]` to `flex-1 min-w-[3.5rem]` — they now fill available width evenly while still scrolling horizontally if needed.
  - Padding reduced to `px-1.5` for tighter mobile fit.
- **ProviderHeader** (`src/components/ProviderHeader.tsx`):
  - Metadata row: split gap to `gap-x-4 gap-y-1` for tighter vertical wrapping on small screens.
- **globals.css**: Added `scrollbar-none` utility class (hides scrollbar across WebKit, Firefox, and IE/Edge) for the date picker horizontal scroll.
- Confirmation component already used `grid-cols-1 sm:grid-cols-3` — no changes needed.
- SoftHoldBanner already uses flex with `min-w-0` — no changes needed.
- Build compiles cleanly.
- Marked Step 7 as complete in `tasklist.md`.

## Step 8: Final Validation (Completed)

### What was done
- **Build verification**: `npm run build` passes with zero TypeScript errors and zero compilation warnings.
- **Design token compliance audit** — found and fixed 11 border-radius issues:
  - `src/components/ui/button.tsx`: All `rounded-md` → `rounded-xl` (base + size variants).
  - `src/components/ui/input.tsx`: `rounded-md` → `rounded-xl`.
  - `src/components/ui/select.tsx`: `rounded-md` → `rounded-xl` (trigger + content), `rounded-sm` → `rounded-lg` (items).
  - `src/components/SoftHoldBanner.tsx`: `rounded-lg` → `rounded-xl` (icon bg + close button).
  - `src/components/AppointmentPicker.tsx`: `rounded-lg` → `rounded-xl` (week nav buttons).
- **Typography check**: All headers (`h2`, `h3`) confirmed using `font-semibold` per design spec.
- **Full user flow data integrity trace**:
  - Zod schema validates all 12 fields (firstName, middleName, lastName, suffix, dateOfBirth, gender, street, city, state, zip, phone, email).
  - Fixed `gender` Select to use `shouldValidate: true` in `setValue()` to ensure Zod validation triggers properly.
  - `MockAppointmentService.create()` receives validated `IntakeFormData`, generates uuid, persists to localStorage.
  - `Confirmation` component reads back `appointment.date`, `appointment.time`, and full patient name from the stored object.
  - "Book Another" resets all state cleanly for repeat bookings.
- Final build passes cleanly after all fixes.
- Marked Step 8 as complete in `tasklist.md`.
- **All 8 steps are now complete.**

## Git Setup & Initial Push

- Local git repo initialized by `create-next-app` scaffolding (commit `7cd2638`).
- All widget code committed as `a0a35d9` — "Implement Patient Intake Widget with full booking flow" (26 files, 2931 insertions).
- Remote added: `origin` → `https://github.com/FigsTX/scheduler-widget.git`.
- Pushed `master` branch to remote.

## Post-Roadmap: UX Refinements

### Changes made
- **Date range label on calendar** (`src/components/AppointmentPicker.tsx`):
  - Added a computed `dateRangeLabel` displayed between the chevron arrows (e.g., "Jan 30 – Feb 5").
  - Smart formatting: only shows the month on the end date if it differs from the start month (e.g., "Jan 30 – 5" when same month).
  - Centered with `min-w-[7.5rem]` for stable layout.

- **Streamlined slot → form flow** (`src/app/page.tsx`):
  - Removed intermediate `showIntake` state and `handleContinue` function.
  - Selecting a time slot now immediately shows the timer + intake form (one fewer click).
  - Flow is now: select slot → soft-hold timer + form appear together → fill out → submit.

- **Compact timer banner** (`src/components/SoftHoldBanner.tsx`):
  - Redesigned from a multi-row banner with "Continue to Intake" button into a single-row compact strip.
  - Shows slot info + countdown inline: "Thu, Jan 30 at 10:00 AM · Hold expires in 4:32".
  - Removed `ArrowRight` and `Button` imports (no longer needed).
  - Removed `onContinue` prop from the interface.
  - Still turns red when under 60 seconds. Still has X to release.

- Build compiles cleanly after all changes.

## Step 9: Reason for Visit & Insurance Information (Completed)

### What was done
- **Added shadcn components**: `textarea` and `checkbox` via `npx shadcn@latest add`. Fixed `rounded-md` → `rounded-xl` on Textarea to match design tokens.
- **Extended Zod schema** (`src/components/IntakeForm.tsx`):
  - 7 new fields: `visitReason`, `visitDetails`, `selfPay`, `insuranceProvider`, `memberId`, `groupNumber`, `policyholderRelationship`, `policyholderName`, `policyholderDob`.
  - `.superRefine()` conditional validation:
    - Insurance fields (`insuranceProvider`, `memberId`, `policyholderRelationship`) required unless `selfPay === true`.
    - `policyholderName` and `policyholderDob` required only when `policyholderRelationship ≠ "Self"`.
- **Reason for Visit section** (after Contact row, separated by `border-t` divider):
  - Visit Type select with 8 options: Annual Checkup, Sick Visit, Follow-up, New Patient, Specialist Referral, Prescription Refill, Lab Work, Other.
  - Optional "Additional details" textarea (500 char max, secondary label styling).
- **Insurance Information section** (after Reason for Visit, separated by `border-t` divider):
  - Self-pay checkbox toggle — hides all insurance fields when checked.
  - Insurance Provider + Member ID (required, 2-col grid).
  - Group Number (optional, secondary styling) + Policyholder Relationship select (required, 2-col grid).
  - Policyholder Name + DOB — conditionally shown only when relationship ≠ "Self".
- **Confirmation screen** (`src/components/Confirmation.tsx`):
  - Added "Reason" tile with `Stethoscope` icon — shows visit reason + details.
  - Added "Insurance" tile with `Shield` icon — shows "Provider · ID: memberId" or "Self-pay".
  - Grid changed from `sm:grid-cols-3` to `sm:grid-cols-2 lg:grid-cols-3` for 5 tiles.
  - Added `formatVisitReason()` and `formatInsurance()` helper functions.
- **Dependencies**: `@radix-ui/react-checkbox` added via shadcn.
- Build compiles cleanly.

## Step 10: Embeddable Widget Architecture (Completed)

### What was done
- **Created `src/services/MockProviderService.ts`** — provider data layer:
  - `Provider` interface: `id`, `name`, `avatarUrl`, `specialty`, `location` (city/state), `availability` (days + hours), `theme` (primaryColor).
  - 3 mock providers with distinct themes:
    - **Dr. Sarah Smith** — Family Medicine, Austin TX, Mon–Fri 9–5, Teal (`#0D9488`).
    - **Dr. James Chen** — Internal Medicine, Dallas TX, Mon–Fri 8–4, Blue (`#2563EB`).
    - **Dr. Maria Gonzalez** — Pediatrics, San Antonio TX, Mon/Wed–Fri 10–6, Purple (`#7C3AED`).
  - `getAll()`, `getById()`, `getSlots(provider, date)` methods. `getSlots` generates 30-min intervals from provider availability hours.

- **Created embed route** (`src/app/embed/[providerId]/`):
  - **`layout.tsx`** — minimal layout with transparent background, no nav/footer.
  - **`page.tsx`** — self-contained booking flow optimized for narrow containers:
    - `ProviderMiniHeader` — compact provider card (avatar initials with theme color, name, specialty, location).
    - Full flow in-widget: calendar → soft-hold + intake form → confirmation.
    - `postMessage` protocol: sends `WIDGET_EXPAND` when user selects a slot, `WIDGET_COLLAPSE` when user releases hold, closes, or books another.
    - Dynamically applies provider's `theme.primaryColor` as CSS variable.
    - 404 handling for unknown provider IDs.

- **Created `public/widget-loader.js`** — the "Smart Snippet" for client integration:
  - Reads `data-provider` and `data-element` attributes from `<script>` tag.
  - Injects an iframe (`/embed/{providerId}`) into the target DOM element.
  - Listens for `postMessage` events from the iframe:
    - `WIDGET_EXPAND` — transitions iframe to `position: fixed` centered modal (max 480px wide, 90vh tall) with semi-transparent backdrop overlay.
    - `WIDGET_COLLAPSE` — reverts iframe to inline position within the host page.
  - Backdrop click collapses the widget.
  - Smooth CSS transitions on expand/collapse (0.3s ease).

- **Created `public/test-widget.html`** — integration test page:
  - Simulates a host website with all 3 providers embedded side-by-side.
  - Each widget section shows the provider name, the embedded widget, and the snippet code to copy.

- **Component responsiveness adjustments**:
  - `IntakeForm`: padding `p-4 sm:p-6`, name row gap `gap-2 sm:gap-3`.
  - `Confirmation`: padding `p-4 sm:p-6`, spacing `space-y-4 sm:space-y-5`, grid simplified to `sm:grid-cols-2`.
  - `AppointmentPicker`: padding `p-4 sm:p-6`, spacing `space-y-4 sm:space-y-5`.

- **Routes registered**:
  - `/` — main standalone page (static).
  - `/embed/[providerId]` — dynamic embed route.

- **Test URLs**:
  - Main app: `http://localhost:3000`
  - Single embed: `http://localhost:3000/embed/dr-sarah-smith`
  - Widget test page: `http://localhost:3000/test-widget.html`

- Build compiles cleanly with zero errors.

## Step 10b: Widget Popup Close & Reset Flow (Completed)

### Problem
When clicking the backdrop to dismiss the expanded widget popup, the iframe collapsed back to inline size but the intake form was still rendered inside it, resulting in a cramped/broken layout.

### What was done
- **`public/widget-loader.js`**:
  - Added `collapseAndReset()` function — sends a `WIDGET_RESET` `postMessage` *into* the iframe before collapsing, telling it to reset state back to the calendar view.
  - Backdrop click and close button now call `collapseAndReset()` instead of plain `collapse()`.
  - Added a floating close button (white circle with `×`) that appears top-right of the expanded popup. Hidden when inline.
- **`src/app/embed/[providerId]/page.tsx`**:
  - Added a `message` event listener for `WIDGET_RESET` from the parent window.
  - On reset: calls `releaseHold()`, clears `confirmed` and `error` state — returns widget to clean calendar view.
- Build compiles cleanly.

## Step 11: Microsoft 365 Backend Integration (Steps 3–6 of CMS Tasklist)

### What was done

#### Step 3: Graph Client & Auth
- **Installed SDKs**: `@microsoft/microsoft-graph-client`, `@azure/identity`, `next-auth` (v4).
- **`src/lib/auth.ts`** — NextAuth config with Azure AD provider:
  - Scopes: `User.Read`, `Calendars.ReadWrite`, `Sites.Read.All`, `offline_access`.
  - JWT callback persists `accessToken`, `refreshToken`, `expiresAt` to both the JWT and server-side file.
- **`src/lib/tokenStore.ts`** — Server-side token persistence:
  - `saveTokens()` / `loadTokens()` — writes/reads `.tokens.json` (gitignored).
  - `getAccessToken()` — returns a valid token, auto-refreshing via Microsoft's `/oauth2/v2.0/token` endpoint when expired (5-min buffer).
  - This allows widget API routes (anonymous patient traffic) to use the admin's delegated Graph token.
- **`src/lib/graph.ts`** — Graph client factory:
  - `getGraphClient(accessToken)` — for delegated calls with a specific token.
  - `getWidgetGraphClient()` — uses `getAccessToken()` from token store for widget routes.
- **`src/app/api/auth/[...nextauth]/route.ts`** — NextAuth App Router handler.
- **`src/types/next-auth.d.ts`** — Type augmentation for `Session.accessToken` and `JWT` fields.
- Added `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `SHAREPOINT_SITE_HOSTNAME` to `.env`.

#### Step 4: Provider Service (Read Data)
- **`src/services/ProviderService.ts`**:
  - `getSiteId(client)` — resolves SharePoint site ID from hostname, cached.
  - `getListId(client, siteId, listName)` — resolves list GUID by display name, cached in `Map`.
  - `parseProviderItem()` — maps SharePoint list item fields to `ProviderProfile` interface.
    - Handles complex Location object (Graph returns nested `address.city`/`address.state`).
    - Parses Languages (array or comma-separated string).
    - Parses OverrideWorkDays (comma-separated string to `number[]`).
  - `getAllProviders()` — fetches all active providers from SharePoint.
  - `getProviderBySlug(slug)` — finds a single provider by slug field.
- **API Routes**:
  - `GET /api/providers` — returns all active providers.
  - `GET /api/providers/[slug]` — returns single provider by slug.

#### Step 5: Availability Engine
- **`src/services/AvailabilityService.ts`**:
  - `getGlobalConfig(client)` — reads `GlobalConfig` list from SharePoint, extracts `DefaultOfficeHours` row (`startHour`, `endHour`, `workDays`, `appointmentDuration`). Cached in memory.
  - `getProviderRules(provider)` — merges global config with provider-level overrides.
  - `generatePotentialSlots(startHour, endHour, duration)` — creates time labels at `duration`-minute intervals (e.g., "9:00 AM", "9:30 AM", ..., "4:30 PM").
  - `getSlots(provider, date)`:
    - Returns empty if day not in work days.
    - For Outlook providers: fetches `/users/{email}/calendarView` for the date, filters out slots overlapping with busy/tentative events.
    - For External providers: returns all potential slots.
  - `parseSlotToDate()` — converts slot label + date into a `Date` for overlap comparison.
- **API Route**:
  - `GET /api/providers/[slug]/slots?date=YYYY-MM-DD` — returns available slots.

#### Step 6: Booking Action
- **`src/services/BookingService.ts`**:
  - `bookAppointment({ provider, date, time, patientName, visitReason, phone, email })`:
    - Builds Outlook calendar event: subject `"New Patient: {name}"`, body with visit reason/phone/email, start/end from slot + duration.
    - Posts via `POST /users/{email}/events`.
    - Returns `{ eventId, start, end }`.
- **API Route**:
  - `POST /api/book` — accepts `{ providerSlug, date, time, patientName, visitReason, phone, email }`.

#### Infrastructure
- `.gitignore` updated to exclude `.tokens.json`.
- `tasklist_CMS.md` updated: Steps 1–6 marked complete, Step 7 ready for manual verification.
- Build compiles cleanly. All routes registered:
  - `/api/auth/[...nextauth]`, `/api/providers`, `/api/providers/[slug]`, `/api/providers/[slug]/slots`, `/api/book`.

#### Pending: Admin Consent
- Azure app registration requires IT admin approval before the delegated permissions (Calendars.ReadWrite, Sites.Read.All) can be used.
- IT request submitted. Once approved, admin signs in at `/api/auth/signin` to store tokens, enabling all live API routes.
- Until then, the widget continues to function with `MockProviderService` on existing routes.

## Step 12: Booking Lead Time Rules (Completed)

### What was done
- **Rule 1 — No same-day appointments**: Today's date is always excluded from booking.
- **Rule 2 — Afternoon cutoff**: After 1:00 PM, tomorrow's morning slots (before 1 PM) are removed, leaving only afternoon availability.

#### Changes
- **`src/components/AppointmentPicker.tsx`**:
  - `generateSlots()` returns empty for today, filters morning slots for tomorrow after 1 PM.
  - Default `selectedDate` changed from today to tomorrow.
  - Added helpers: `isSameDay()`, `isTomorrow()`, `parseSlotHour()`.
- **`src/components/DatePicker.tsx`**:
  - Today is now disabled (grayed out, unclickable) alongside Sundays.
  - "Today" label still shows but in muted styling to indicate unavailability.
- **`src/services/AvailabilityService.ts`** (server-side):
  - `getSlots()` returns empty for same-day requests.
  - After 1 PM, tomorrow's morning slots filtered out before calendar overlap check.
  - Added helpers: `isSameDay()`, `isTomorrow()`.
- Build compiles cleanly.
