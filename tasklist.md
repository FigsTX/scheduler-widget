# Implementation Roadmap

- [x] **Step 1: Scaffolding.** Setup Next.js App Router structure and install dependencies (Lucide, RHF, Zod, Tailwind, UUID).
- [x] **Step 2: The Provider Header.** Create the "Dr. Sarah Smith" profile component with "Medical Modern" styling.
- [x] **Step 3: Horizontal Calendar.** Implement the 7-day scrollable date picker and availability slots.
- [x] **Step 4: Soft-Hold Logic.** Build the state management that triggers the countdown timer upon slot selection.
- [x] **Step 5: Detailed Intake Form.** Implement the multi-column form from the reference image (Names, DOB, Gender, Address, Contact).
- [x] **Step 6: Validation & Mock Persistence.**
    - Implement Zod schemas for all inputs.
    - Create a `MockAppointmentService` to persist data to localStorage.
    - Validate success/error states and data integrity.
- [x] **Step 7: Mobile Responsiveness Polish.** Final pass on layout for small screens.
- [x] **Step 8: Final Validation.** Run through the full user flow to ensure data integrity, design fidelity, and "Medical Modern" compliance.
- [x] **Step 9: Reason for Visit & Insurance Information.** Added visit reason (select + textarea) and insurance information (self-pay toggle, conditional provider/member/policyholder fields) sections to IntakeForm with Zod superRefine validation. Updated Confirmation screen with Stethoscope and Shield summary tiles.
