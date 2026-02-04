# Task List: O365 Backend Implementation

## Overview
**Goal:** Transition from `MockProviderService` to a live backend using **Microsoft 365**.
**Architecture:**
- **Database:** Microsoft Lists (SharePoint) stores provider profiles and config.
- **Calendar Engine:** Microsoft Outlook (via Graph API) handles availability.
- **CMS:** No custom UI needed; you manage data directly in Microsoft Lists.

---

## Step 1: Azure App Registration (Auth Setup)
**Goal:** Create the digital "Keycard" that allows Next.js to talk to your Outlook and Lists.

- [x] **Register App**:
    - Go to [Microsoft Entra Admin Center](https://entra.microsoft.com/) > App registrations > New registration.
    - Name: `Scheduler Widget (Dev)`.
    - Account type: "Multitenant and personal accounts" (supports personal Outlook).
    - Redirect URI (Web): `http://localhost:3000/api/auth/callback/microsoft-entra-id`.
- [x] **Generate Secrets**:
    - In "Certificates & secrets", create a new Client Secret.
    - Copy the **Value** (not ID) immediately to a safe place.
- [x] **Grant Permissions**:
    - In "API permissions", add `Microsoft Graph` (Delegated):
        - `Calendars.ReadWrite` (To check/book slots)
        - `Sites.Read.All` (To read SharePoint Lists)
        - `User.Read` (Default)
    - **Important:** Click "Grant admin consent" if available.
- [x] **Environment Variables**:
    - Update `.env.local` with:
        ```bash
        AZURE_AD_CLIENT_ID="..."
        AZURE_AD_CLIENT_SECRET="..."
        AZURE_AD_TENANT_ID="common"
        NEXTAUTH_SECRET="..." # Generate via `openssl rand -base64 32`
        TEST_PROVIDER_EMAIL="your-email@outlook.com" # For testing
        ```

## Step 2: Configure Microsoft Lists (The Database)
**Goal:** Set up the two lists that act as your database tables.

- [x] **Create "GlobalConfig" List**:
    - Create a blank list named `GlobalConfig`.
    - **Row 1 Data**:
        - Title (Key): `DefaultOfficeHours`
        - StartHour (Number): `9`
        - EndHour (Number): `17`
        - WorkDays (Text): `1,2,3,4,5` (Mon-Fri)
        - AppointmentDuration (Number): `30`
- [x] **Create "Providers" List**:
    - Create a blank list named `Providers`.
    - **Add Columns**:
        - `Name` (Rename Title)
        - `Slug` (Text, Unique)
        - `Email` (Text - Connects to Outlook)
        - `SchedulingSource` (Choice: "Outlook", "External")
        - `ExternalID` (Text - Optional for EHR)
        - `IsActive` (Yes/No - Default Yes)
        - `Specialty` (Choice)
        - `Bio` (Multiple lines)
        - `AvatarUrl` (Text - Paste public link)
        - `Languages` (Choice, Allow multiple)
        - `Location` (Location/Address type)
    - **Add Overrides**:
        - `OverrideStartHour` (Number)
        - `OverrideEndHour` (Number)
        - `OverrideWorkDays` (Text - e.g. "1,3,5")
- [x] **Seed Data**:
    - Add yourself as a provider (Source: Outlook, Email: Your Real Email).
    - Add a mock provider (Source: External).

## Step 3: Graph Client & Auth
**Goal:** Connect the application to the API.

- [x] **Install SDKs**:
    - `npm install @microsoft/microsoft-graph-client @azure/identity next-auth`
- [x] **Auth Handler**:
    - Created `src/lib/auth.ts` with Azure AD provider + token persistence via `src/lib/tokenStore.ts`.
    - NextAuth route at `src/app/api/auth/[...nextauth]/route.ts`.
    - On admin sign-in, tokens saved to `.tokens.json` for widget API routes.
- [x] **Graph Client**:
    - Created `src/lib/graph.ts`.
    - `getGraphClient(accessToken)` — delegated client.
    - `getWidgetGraphClient()` — uses stored admin token with auto-refresh.

## Step 4: Provider Service (Read Data)
**Goal:** Fetch profiles from the SharePoint List instead of the mock file.

- [x] **Implement `getListId(listName)` Helper**:
    - Implemented in `src/services/ProviderService.ts`.
    - Queries `/sites/{siteId}/lists`, filters by `displayName`, caches result in `Map`.
- [x] **Create `src/services/ProviderService.ts`**:
    - `getAllProviders()` — fetches from SharePoint Providers list, parses fields, filters active.
    - `getProviderBySlug(slug)` — filters by slug field.
    - Location parsed from complex Graph object into `"city, state"` string.
- [x] **API Routes**:
    - `GET /api/providers` — list all active providers.
    - `GET /api/providers/[slug]` — get single provider by slug.

## Step 5: Availability Engine (The Logic)
**Goal:** Generate slots based on Master Rules + Overrides - Outlook Busy Times.

- [x] **Implement `getProviderRules(provider)`**:
    - Fetches `GlobalConfig` list from SharePoint.
    - Merges provider overrides (OverrideStartHour, etc.) over global defaults.
    - Returns `{ startHour, endHour, workDays, appointmentDuration }`.
- [x] **Implement `getSlots(provider, date)`**:
    - Step A: Checks if date's day-of-week is in workDays.
    - Step B: Generates potential slots at `appointmentDuration` intervals.
    - Step C: For Outlook providers, fetches `/users/{email}/calendarView` and removes overlapping busy slots.
    - Step D: Returns available slot labels.
- [x] **API Route**:
    - `GET /api/providers/[slug]/slots?date=YYYY-MM-DD` — returns available slots for a provider on a date.

## Step 6: Booking Action
**Goal:** Write data back to Outlook.

- [x] **Create `src/services/BookingService.ts`**:
    - `bookAppointment({ provider, date, time, patientName, visitReason, phone, email })`
- [x] **API Route `POST /api/book`**:
    - Accepts `{ providerSlug, date, time, patientName, visitReason, phone, email }`.
    - Calls `POST /users/{email}/events` with subject, body, start/end calculated from slot + duration.

## Step 7: Final Verification
- [ ] **Auth Test**: Admin signs in at `/api/auth/signin` to store tokens.
- [ ] **Profile Test**: Change your Bio in Microsoft Lists → Refresh Widget → Verify change.
- [ ] **Calendar Test**: Add a "Lunch" event in your personal Outlook for tomorrow at 12pm.
- [ ] **Widget Test**: Check tomorrow's slots in the Widget. 12:00 and 12:30 should be missing.
