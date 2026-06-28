# Healthcare Assistance System - UI/UX Prototyping Plan
## Phase 1: Screen Specifications & User Journeys

This document defines the interface layout, interaction requirements, security permissions, and user experience journeys for the Healthcare Assistance System. The design is optimized for a premium dark glassmorphism aesthetic.

---

## 1. System Navigation Map & Core Layouts

### 1.1 Core Layout Shells
*   **Patient Portal:** Left sidebar navigation, responsive header with notifications and quick profile link, central glass container for page content.
*   **Doctor Console:** Left sidebar with collapsible schedule indicator, primary data pane with split screens for clinical tools.
*   **Admin Dashboard:** Fixed-width metrics header, wide-screen data tables, and modal overlay controllers for system adjustments.

### 1.2 Navigation Routes

```
[Anonymous Visitor]
      │
      ├─► [Login Screen] ◄───► [Password Reset]
      │
      └─► [Registration Screen] ──► [Email Verification Pending]
            │
            ▼
[Authorized Patient]
      ├──► Dashboard (Metrics, Quick Actions)
      ├──► AI Assistant (Chat Interface, Triage)
      ├──► Book Appointment (Doctor Search, Calendar Slots)
      ├──► Appointment History (Clinical Summary download)
      ├──► Symptom Tracking (Log history, Severity trends chart)
      ├──► Messages (Secure Doctor Chat)
      └──► Profile (Medical Records, Avatar)

[Authorized Doctor]
      ├──► Dashboard (Today's metrics, pending reviews)
      ├──► Schedule (Calendar, Appointment Actions)
      ├──► Patient Details (History, Logs, Records)
      └──► Messages (Secure Patient Chat)

[Authorized Admin]
      ├──► Dashboard (Server status, activity throughput)
      ├──► User Management (Role modifications, lockout overrides)
      ├──► Doctor Management (Credential uploads, verification)
      ├──► Audit Logs (Entity state diff logs, IP search)
      └──► System Settings (Rate limits, token durations)
```

---

## 2. Screen Specifications

### 2.1 Patient Screens

#### 1. Login Screen
*   **Screen Goal:** Secure portal entry.
*   **Layout:** Centered glass card overlaying a deep navy radial gradient background.
*   **Key Components:**
    *   Email Input, Password Input (toggle visibility icon).
    *   Login Button (with loading spinner state).
    *   Forgot Password link, Sign Up link.
*   **Actions:**
    *   `ExecuteLogin`: Authenticates credentials, stores JWT/Refresh tokens, routes based on role.
*   **Permissions:** Anonymous.

#### 2. Registration Screen
*   **Screen Goal:** Onboard new patients.
*   **Layout:** Two-column grid: left side holds promotional branding and HIPAA notice; right side holds scrollable registration form.
*   **Key Components:**
    *   Fields: Email, Password, Name, DOB, Phone, Sex, Emergency Contacts.
    *   Agreement Checkbox for medical data terms.
    *   Submit Button.
*   **Actions:**
    *   `RegisterPatient`: Triggers validation, inserts records, dispatches verification email.
*   **Permissions:** Anonymous.

#### 3. Patient Dashboard
*   **Screen Goal:** Hub for immediate care priorities.
*   **Layout:** Dashboard grid containing card widgets.
*   **Key Components:**
    *   **Hero Card:** Greeting message with dynamic daily health tip.
    *   **AI Triage Shortcut:** High-contrast accent card.
    *   **Next Appointment Card:** Shows Doctor Name, Date, Location, and Countdown.
    *   **Recent Symptoms Panel:** Quick log tracker.
*   **Actions:**
    *   `QuickCancelAppointment`, `NavigateToTriage`.
*   **Permissions:** `Role == Patient` + Email Verified.

#### 4. Book Appointment Screen
*   **Screen Goal:** Streamlined appointment scheduling.
*   **Layout:** Sidebar filter panel (specialty, rating, date) + main results list. Clicking a doctor opens a scheduling calendar drawer.
*   **Key Components:**
    *   Filter dropdowns and search inputs.
    *   Doctor List Cards (profile image, specialties, verified badge).
    *   Weekly Calendar Grid showing available slot intervals.
*   **Actions:**
    *   `SearchDoctors`, `SelectSlot`, `ConfirmBooking`.
*   **Permissions:** `Role == Patient` + Email Verified.

#### 5. Appointment History Screen
*   **Screen Goal:** View past clinical visits and details.
*   **Layout:** Wide-grid list, filterable by date and status, expanding to show details inline.
*   **Key Components:**
    *   Status indicator badges (Completed, Cancelled).
    *   Doctor metadata block.
    *   "Download Summary" and "Download Prescription" actions.
*   **Actions:**
    *   `RequestPrescriptionPdf`, `DownloadClinicalSummary`.
*   **Permissions:** `Role == Patient` + Email Verified.

#### 6. Symptom Tracking Screen
*   **Screen Goal:** Chronological entry and visual analysis of physical symptoms.
*   **Layout:** Split-screen: Left is the new entry form; right is a dynamic line-chart showing severity over time.
*   **Key Components:**
    *   Severity slider (1-10), text area for description.
    *   Symptom category multi-select tag array.
    *   Line chart representing tracked entries.
*   **Actions:**
    *   `SaveSymptomLog`, `FilterGraphRange`.
*   **Permissions:** `Role == Patient` + Email Verified.

#### 7. AI Assistant Screen
*   **Screen Goal:** Chat-based AI triage evaluation.
*   **Layout:** Immersive full-height instant-messaging layout.
*   **Key Components:**
    *   Message history container (patient bubbles vs AI bubbles).
    *   Typing indicator, message input bar.
    *   Floating recommendation panel (displays severity: High, Medium, Low, with booking buttons).
*   **Actions:**
    *   `SendMessageToAi`, `AcceptTriageAndBook`.
*   **Permissions:** `Role == Patient` + Email Verified.

#### 8. Messages Screen (Secure Messaging)
*   **Screen Goal:** Real-time HIPAA-compliant communication with active doctors.
*   **Layout:** Split-pane: Left holds active conversation channels; right displays the selected chat window.
*   **Key Components:**
    *   Channel list indicating doctor name and online/offline status.
    *   Chat header specifying active appointment reference.
    *   Attachment button (restricts to PDF/Image, max 5MB).
*   **Actions:**
    *   `SendMessage`, `UploadAttachment`, `EndConversation`.
*   **Permissions:** `Role == Patient` + Active/Past appointment constraint.

#### 9. Profile Screen
*   **Screen Goal:** Manage demographic, notification, and safety settings.
*   **Layout:** Tabbed profile settings: Account, Medical Info, Security.
*   **Key Components:**
    *   Avatar editor, personal field forms.
    *   Allergies/Conditions tag fields.
    *   "Enable MFA" check, "Request Data Deletion" (GDPR).
*   **Actions:**
    *   `UpdateProfile`, `ChangePassword`, `RequestDataAnonymization`.
*   **Permissions:** `Role == Patient`.

---

### 2.2 Doctor Screens

#### 1. Doctor Dashboard
*   **Screen Goal:** Provide clinical overview of the day's schedules.
*   **Layout:** Analytical grid focused on current schedule tracking.
*   **Key Components:**
    *   **Today's Schedule Widget:** Timeline of today's bookings.
    *   **Pending Confirmations:** Appointments needing Doctor acceptance.
    *   **Quick Metrics:** Total patients seen, hours worked, urgent triages.
*   **Actions:**
    *   `AcceptBooking`, `DenyBooking` (requires reason modal).
*   **Permissions:** `Role == Doctor` + Admin Verified.

#### 2. Schedule Screen
*   **Screen Goal:** Complete calendar availability management.
*   **Layout:** Full-screen monthly/weekly calendar overlay with booking configurations.
*   **Key Components:**
    *   Day/Week/Month toggles.
    *   "Set Blocked Out Hours" drawer.
    *   Time slots configuration dashboard.
*   **Actions:**
    *   `BlockHours`, `ModifyAvailability`, `RescheduleAppointment`.
*   **Permissions:** `Role == Doctor` + Admin Verified.

#### 3. Patient Details & Medical History Screen
*   **Screen Goal:** Review historical records before or during appointments.
*   **Layout:** Side-by-side view: Patient profile on the left; timeline of past notes, lab results, and symptom logs on the right.
*   **Key Components:**
    *   Basic stats header (allergies marked in blinking red glass).
    *   Interactive clinical history timeline.
    *   Add Clinical Note button.
*   **Actions:**
    *   `UploadPrescription`, `AppendClinicalNote`, `ViewSymptomCharts`.
*   **Permissions:** `Role == Doctor` + Must have appointment association.

#### 4. Messages Screen
*   **Screen Goal:** Secure communication with patients.
*   **Layout:** Messaging interface with patient list. Includes clinical indicators.
*   **Key Components:**
    *   Patient contact list sorted by urgent message receipt.
    *   Patient context widget overlay showing the reason for their appointment.
*   **Actions:**
    *   `SendDoctorMessage`, `AttachPrescriptionMetadata`.
*   **Permissions:** `Role == Doctor` + Active appointment link.

---

### 2.3 Admin Screens

#### 1. Admin Dashboard
*   **Screen Goal:** Infrastructure overview and operational health.
*   **Layout:** Grid panel with real-time analytics.
*   **Key Components:**
    *   **System Health Widgets:** CPU load, DB latency, API throughput.
    *   **Registration Requests Card:** Doctors awaiting verification.
    *   **Audit Alerts:** Lockout and error alerts.
*   **Actions:**
    *   `VerifyDoctor`, `ClearDbCache`.
*   **Permissions:** `Role == Admin`.

#### 2. User Management Screen
*   **Screen Goal:** Profile access and security modifications.
*   **Layout:** Multi-column grid table, searchable by name/email/role.
*   **Key Components:**
    *   Search and filter filters.
    *   User row containing lockout status.
    *   "Edit Roles" and "Force Lock/Unlock" actions.
*   **Actions:**
    *   `UpdateUserRoles`, `ToggleUserLockout`, `ResetUserMfa`.
*   **Permissions:** `Role == Admin`.

#### 3. Doctor Verification Screen
*   **Screen Goal:** Authenticate and onboarding medical professionals.
*   **Layout:** Row list displaying pending doctors. Clicking opens credential validation drawer.
*   **Key Components:**
    *   Document Viewer (displays uploaded license PDF files).
    *   Approve / Reject Action Buttons.
*   **Actions:**
    *   `ApproveDoctorProfile`, `RejectDoctorProfile` (sends rejection email).
*   **Permissions:** `Role == Admin`.

#### 4. Audit Logs Screen
*   **Screen Goal:** Deep activity tracking viewer.
*   **Layout:** Data table showing system events, logs, and state differences.
*   **Key Components:**
    *   Time-range date pickers.
    *   Action and Table entity filter dropdowns.
    *   Expandable table rows displaying old vs. new values (diff format).
*   **Actions:**
    *   `ExportAuditLogCsv`, `TraceUserActivity`.
*   **Permissions:** `Role == Admin`.

#### 5. System Settings Screen
*   **Screen Goal:** Configure application thresholds.
*   **Layout:** Form card container.
*   **Key Components:**
    *   Rate limiting config inputs.
    *   Token lifespan configurations (Access vs Refresh token values).
    *   MFA enforcement toggle.
*   **Actions:**
    *   `SaveSystemConfig`.
*   **Permissions:** `Role == Admin`.

---

## 3. Core User Journeys (Step-by-Step UI Flow)

### Journey 1: Patient Logs Symptoms & Receives AI Recommendation
```
[Patient logs in] ──► [Goes to AI Assistant] ──► [Types "Chest tightness and coughing"]
                                                            │
                                                            ▼
[AI Triage Evaluates] ◄─────────────────────────────────────┘
      │
      ├─► Severity: High ──► Display emergency warning blinking panel + urgent specialists list
      │
      ├─► Severity: Medium ─► Suggest scheduling routine consultation + load Doctor list
      │
      └─► Severity: Low ───► Render recommendation card (self-care) + option to log history
```

### Journey 2: Patient Searches & Books a Doctor Slot
```
[Patient hits "Book Appointment"] ──► [Enters search criteria (e.g. "Cardiology")]
                                                │
                                                ▼
[Selects Doctor Card] ◄─────────────────────────┘
      │
      ▼
[Calendar Slider Opens] ──► [Selects June 20, 10:00 AM Slot]
                                    │
                                    ▼
[Inputs Reason & Clicks Book] ──────┘
      │
      ▼
[Modal Loader] ──► [Success Checkmark Overlay] ──► [Redirects to Dashboard]
```

### Journey 3: Doctor Conducts Appointment & Logs Summary
```
[Doctor Dashboard] ──► [Clicks "Start Session" on active timeline card]
                                 │
                                 ▼
[Patient Clinical Board Opens] ◄─┘
      │
      ├──► Left panel: Shows Patient details, historical logs, AI results
      ├──► Right panel: Active chat and prescription portal
      │
      ▼
[Enters diagnosis and notes] ──► [Clicks "Upload Prescription" (Filemetadata created)]
                                          │
                                          ▼
[Clicks "Mark Completed"] ──► [Triggers status update] ──► [Generates Patient invoice summary]
```

### Journey 4: Admin Audits System Modification
```
[Admin Logged In] ──► [Clicks "Audit Logs" in Sidebar]
                                 │
                                 ▼
[Filters: UserID = "Doc_UUID", Action = "Appointment.StatusUpdate"]
                                 │
                                 ▼
[Finds Target Row] ──► [Clicks "Expand Diffs"]
                                 │
                                 ▼
[Review Changes Pane] ──► "Old: Booked" / "New: Confirmed" + "IP: 192.168.1.45"
```
