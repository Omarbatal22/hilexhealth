# Healthcare Assistance System - Requirements Specification
## Phase 1: System Design & Redesign for .NET 9 Ecosystem

This document details the functional, non-functional, and technical requirements for the redesigned Healthcare Assistance System. It transitions the initial pythonic architecture into a robust, enterprise-ready, Clean-Architecture-compliant ASP.NET Core 9 Web API system.

---

## 1. System Overview & Objectives

The Healthcare Assistance System is a web-based, AI-enhanced platform designed to streamline doctor-patient interactions, provide automated triage services, and simplify scheduling, while ensuring regulatory compliance, auditable activities, data privacy, and premium user experience.

### Key Objectives:
*   **Modernizing Architecture:** Migrate from Python/FastAPI to ASP.NET Core 9.
*   **Security & Compliance:** Enforce JWT + Refresh Token auth, Role-Based Access Control (RBAC), and full system auditing.
*   **System Resiliency:** Implement database soft deletes, domain event notifications, and structural audit logging.
*   **Clinical Efficacy:** Leverage isolated AI Triage models to prioritize high-risk patient concerns before clinical appointments.

---

## 2. System Actors & Role-Based Access Control (RBAC)

The system enforces strict RBAC with three core roles:

| Role | Description | Core Responsibilities |
| :--- | :--- | :--- |
| **Patient** | The primary consumer of the system. | Log symptoms, consult the AI Triage Assistant, book/cancel appointments, message doctors, view records/prescriptions, manage profiles. |
| **Doctor** | Healthcare professional. | Manage clinical schedules, review patient medical history and symptom logs, execute appointments, prescribe treatment, message patients. |
| **Admin** | System operator/IT administrator. | Manage system configurations, register/verify doctors, audit system access and logs, view dashboards, disable compromised accounts. |

---

## 3. Functional Scope & Module Specifications

### 3.1 Patient Management
*   **Self-Registration & Verification:** Patients can register with basic demographic info. Email verification is mandatory before system access is granted.
*   **Demographic & Medical Profile:** Store core details: full name, date of birth, biological sex, contact info, emergency contacts, blood type, known allergies, and chronic conditions.
*   **Dashboard Summary:** Patient-centric dashboard showing upcoming appointments, recent symptom entries, new messages, and direct actions (Book, Chat, Triage).

### 3.2 Doctor Management
*   **Onboarding & Verification:** Admins register doctors and upload credentials (license details, specializations, medical registration numbers). Doctors must be marked as "Verified" by an Admin before they can receive bookings.
*   **Schedule & Slot Management:** Doctors define their working hours, standard slot durations (e.g., 15, 30, 45 minutes), and leave configurations. Slots are automatically generated for booking based on availability.
*   **Patient Directory:** Doctors can access a list of patients who have active or past bookings with them, including access to their shared medical history.

### 3.3 Appointment Scheduling
*   **Booking Engine:** Patients search for verified doctors by specialty, rating, or location. They can select an available time slot and state their primary reason for the visit.
*   **State Machine Transitions:**
    *   `Draft` / `Initiated` (Payment or triage pending)
    *   `Booked` (Confirmed by system, pending review)
    *   `Confirmed` (Accepted by Doctor)
    *   `Cancelled` (Cancelled by Patient or Doctor with a cancellation reason)
    *   `Completed` (Doctor marks session done, uploads clinical summary)
    *   `NoShow` (Patient fails to attend)
*   **Domain Events:** Trigger events upon booking (`AppointmentBookedEvent`) and cancellations (`AppointmentCancelledEvent`) for async notification processing.

### 3.4 Symptom Logging & Tracking
*   **Symptom Entries:** Patients register entries specifying date/time, severity scale (1-10), symptoms chosen from standard taxonomies, and custom notes.
*   **Trend Tracking:** Continuous logging generates chronological records for doctors to view historical patient progression.
*   **Triggering Event:** When a symptom is logged, an `SymptomLoggedEvent` is dispatched.

### 3.5 AI Symptom Triage Assistant
*   **Conversational Assistant:** Isolated, secure AI module parses patient symptom descriptions using Large Language Models.
*   **Triage Assessment:** Assigns a severity flag: `Low` (Self-care, rest), `Medium` (Book routine appointment), `High` (Urgent care / Emergency room recommended).
*   **Integration Isolation:** The AI logic is kept behind a clean domain abstraction (`IAiTriageService`) in the Application layer, making it fully mockable and decoupling it from specific LLM providers.
*   **System Action:** High/Medium results prompt the user to instantly book an appointment with a recommended specialist.

### 3.6 Secure Messaging
*   **Patient-Doctor Channels:** Direct messaging channel generated automatically when an appointment is booked. Channels remain active for up to 72 hours post-appointment for follow-up.
*   **Real-time Synchronization:** Backed by SignalR for immediate message delivery, read receipts, and typing indicators.
*   **Auditing:** Message creation is logged for safety compliance without storing decrypted messages in plaintext audit logs (only metadata like sender, receiver, timestamp).

### 3.7 Admin Dashboard
*   **System Metrics:** Active appointments count, AI triage triage distribution, server status, and daily user registrations.
*   **User Management:** Edit, lock, or disable user profiles; reset passwords; update roles.
*   **Audit Viewer:** Advanced UI to filter and search the system audit logs.

---

## 4. Extended Enterprise Requirements

### 4.1 Audit Trail
Every security-sensitive or business-critical transaction must write a record to the `AuditLogs` table. This tracking must occur at the persistence level (via EF Core interceptors).

*   **Audited Actions:**
    *   `User.Login`, `User.Logout`, `User.PasswordReset`
    *   `Appointment.Create`, `Appointment.StatusUpdate`, `Appointment.Cancel`
    *   `Symptom.Log`, `Symptom.Modify`
    *   `Admin.UserLockout`, `Admin.SystemConfigChange`
*   **Standard Audit Columns:**
    *   Every major database table must inherit from a common base entity containing:
        *   `CreatedAt` (TIMESTAMPTZ, default: now)
        *   `CreatedBy` (UUID, nullable for anonymous operations like registration)
        *   `UpdatedAt` (TIMESTAMPTZ, nullable)
        *   `UpdatedBy` (UUID, nullable)
    *   `AuditLogs` table metadata:
        *   `Id` (UUID, PK)
        *   `UserId` (UUID, action performer)
        *   `Action` (VARCHAR, name of event)
        *   `EntityName` (VARCHAR, target table name)
        *   `EntityId` (UUID, target record identifier)
        *   `OldValues` (TEXT/JSON, pre-state)
        *   `NewValues` (TEXT/JSON, post-state)
        *   `Timestamp` (TIMESTAMPTZ, default: now)
        *   `IpAddress` (VARCHAR)
        *   `UserAgent` (VARCHAR)

### 4.2 Soft Delete
To prevent accidental data loss and maintain historical clinical integrity, records must not be physically deleted.
*   **Implementation:** Entities implementing `ISoftDelete` interface will expose:
    *   `IsDeleted` (BOOLEAN, default: false)
    *   `DeletedAt` (TIMESTAMPTZ, nullable)
    *   `DeletedBy` (UUID, nullable)
*   **Query Filtering:** EF Core `HasQueryFilter` must be applied globally to exclude records where `IsDeleted == true`, with an escape hatch of `.IgnoreQueryFilters()` for admin tools.

### 4.3 Notification System
A unified messaging interface dispatching notifications through three channels:

```
                  ┌──────────────────────┐
                  │ INotificationService │
                  └──────────┬───────────┘
            ┌────────────────┼────────────────┐
            ▼                ▼                ▼
     ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
     │  IEmail     │  │    ISms     │  │   IPush     │
     │  Service    │  │   Service   │  │  Service    │
     └─────────────┘  └─────────────┘  └─────────────┘
```

*   **Email Service:** Transactional templates (verification links, booking confirmations, invoice attachments).
*   **SMS Service:** MFA codes, urgent triage alerts, and day-of-appointment reminders.
*   **Push Service:** Real-time mobile alerts and web-app alerts for direct messaging.

### 4.4 File Storage & Metadata Management
Allows upload of medical scans, laboratory results, prescriptions, and profile avatars.
*   **Security Principle:** No files are stored directly in the database or the web root. Files are placed in a secure local directory or a private S3-compatible cloud bucket. Access is mediated via pre-signed, temporary URLs.
*   **File Metadata Table (`FileMetadata`):**
    *   `Id` (UUID, PK)
    *   `FileName` (VARCHAR, sanitized file name)
    *   `StoragePath` (VARCHAR, unique storage key/path)
    *   `ContentType` (VARCHAR, e.g., application/pdf)
    *   `FileSizeInBytes` (BIGINT)
    *   `UploaderId` (UUID, referencing User)
    *   `OwnerId` (UUID, e.g., PatientId or AppointmentId)
    *   `AccessLevel` (VARCHAR, e.g., Private, SharedWithDoctor, Public)

### 4.5 Security Enhancements
*   **JWT & Refresh Token Flow:** Short-lived Access Tokens (15 mins) coupled with secure, database-persisted Refresh Tokens (7 days, single-use, rotating).
*   **Password Lockout Strategy:** Five consecutive failed login attempts within a 15-minute window lock the account for 30 minutes.
*   **Email Verification:** A cryptographically signed token is emailed post-registration. Account is flagged as restricted until verification is complete.
*   **Rate Limiting:** Enforced at the API level (e.g., maximum 60 requests per minute per IP, and tighter limits for authentication endpoints like login/register).
*   **Secrets Management:** Secure separation of development environments (using User Secrets) and production (using environment variables, Azure Key Vault, or HashiCorp Vault).

---

## 5. Non-Functional Requirements (NFR)

### 5.1 Performance
*   **API Response Time:** 95% of read requests must resolve under 150ms.
*   **Write Transactions:** Must process and respond under 300ms (excluding external AI calls which are handled asynchronously or via loading states).
*   **Caching Strategy:** Redis cache deployed in persistent memory to optimize Doctor Schedule lookups, active token validation, and reference configurations.

### 5.2 Scalability
*   **Stateless Services:** All micro-slices must be stateless. Session data is never kept on localized application nodes.
*   **Horizontal Scalability:** Dockerized containers ready to scale under NGINX or Kubernetes load-balancing.

### 5.3 Availability & Disaster Recovery
*   **Uptime SLA:** target 99.9% uptime.
*   **Database Backup:** Nightly full backups with point-in-time recovery (PITR) up to 7 days.
*   **Geographic Redundancy:** Database cluster setup to allow high-availability read replication.

### 5.4 Compliance & Security
*   **Encryption at Rest:** AES-256 for all stored database records and file attachments.
*   **Encryption in Transit:** Strict TLS 1.3 enforced for all API routes.
*   **HIPAA & GDPR Alignment:** Data classification applied. Patients have the right to request account deletion (triggering personal data obfuscation/anonymization in audit trails and soft-deletes).

---

## 6. Key User Journeys & Acceptance Criteria

### Use Case 1: Booking a Doctor Appointment (with AI Triage)
*   **Actor:** Patient
*   **Flow:**
    1. Patient logs symptoms into the AI Assistant.
    2. System determines severity. If `High` or `Medium`, the system recommends relevant specialties.
    3. Patient searches for a specialist and views open time slots.
    4. Patient selects a slot, enters details, and clicks "Book".
    5. Database transaction commits (`Appointment` created in `Booked` status).
    6. System dispatches `AppointmentBookedEvent`.
    7. Notification worker dispatches an email to the Doctor and Patient.
*   **Acceptance Criteria:**
    *   System must prevent booking a slot already reserved (concurrency handling).
    *   Patients must have verified status to book.
    *   Audit record must be created indicating the initiator.

### Use Case 2: System Audit Integrity on Modify
*   **Actor:** Doctor (updating appointment status)
*   **Flow:**
    1. Doctor accesses their Schedule page and clicks "Confirm" on a booked appointment.
    2. MediatR pipeline processes the `ConfirmAppointmentCommand`.
    3. EF Core interceptor detects state modifications on the `Appointment` entity.
    4. Interceptor populates `UpdatedAt` and `UpdatedBy` properties.
    5. Interceptor serializes old values (`Status: Booked`) and new values (`Status: Confirmed`).
    6. System saves changes to the database as a single transaction (Appointment update + AuditLog creation).
*   **Acceptance Criteria:**
    *   If the database commit fails, no audit record is written.
    *   Audit logs must capture the exact change payload.
