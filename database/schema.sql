-- ============================================================================
-- HEALTHCARE ASSISTANCE SYSTEM - DATABASE SCHEMA (POSTGRESQL)
-- Phase 1: Database DDL Script
-- ============================================================================

-- Enable UUID Extension (PostgreSQL 13+ has gen_random_uuid() built-in, 
-- but enabling pg_crypto or uuid-ossp ensures compatibility)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. Table: Users (Core Authentication Accounts)
-- ============================================================================
CREATE TABLE Users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_token VARCHAR(255) NULL,
    is_locked_out BOOLEAN NOT NULL DEFAULT FALSE,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    lockout_end TIMESTAMPTZ NULL,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NULL,
    updated_at TIMESTAMPTZ NULL,
    updated_by UUID NULL,
    
    -- Soft Delete Fields
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMPTZ NULL,
    deleted_by UUID NULL,
    
    -- Constraints
    CONSTRAINT CK_Users_Role CHECK (role IN ('Patient', 'Doctor', 'Admin'))
);

-- Self-referencing Foreign Keys for Audit / Deletes (optional mapping)
ALTER TABLE Users ADD CONSTRAINT FK_Users_CreatedBy FOREIGN KEY (created_by) REFERENCES Users(id) ON DELETE SET NULL;
ALTER TABLE Users ADD CONSTRAINT FK_Users_UpdatedBy FOREIGN KEY (updated_by) REFERENCES Users(id) ON DELETE SET NULL;
ALTER TABLE Users ADD CONSTRAINT FK_Users_DeletedBy FOREIGN KEY (deleted_by) REFERENCES Users(id) ON DELETE SET NULL;

-- ============================================================================
-- 2. Table: Patients (Demographics and Profiles)
-- ============================================================================
CREATE TABLE Patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    biological_sex VARCHAR(10) NOT NULL,
    blood_type VARCHAR(5) NULL,
    emergency_contact_name VARCHAR(100) NOT NULL,
    emergency_contact_phone VARCHAR(20) NOT NULL,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NULL,
    updated_at TIMESTAMPTZ NULL,
    updated_by UUID NULL,
    
    -- Soft Delete Fields
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMPTZ NULL,
    deleted_by UUID NULL,
    
    -- Constraints
    CONSTRAINT FK_Patients_User FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    CONSTRAINT FK_Patients_CreatedBy FOREIGN KEY (created_by) REFERENCES Users(id) ON DELETE SET NULL,
    CONSTRAINT FK_Patients_UpdatedBy FOREIGN KEY (updated_by) REFERENCES Users(id) ON DELETE SET NULL,
    CONSTRAINT FK_Patients_DeletedBy FOREIGN KEY (deleted_by) REFERENCES Users(id) ON DELETE SET NULL,
    CONSTRAINT CK_Patients_Sex CHECK (biological_sex IN ('Male', 'Female', 'Other'))
);

-- ============================================================================
-- 3. Table: Doctors (Medical Professionals Profile)
-- ============================================================================
CREATE TABLE Doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    license_number VARCHAR(100) NOT NULL UNIQUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NULL,
    updated_at TIMESTAMPTZ NULL,
    updated_by UUID NULL,
    
    -- Soft Delete Fields
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMPTZ NULL,
    deleted_by UUID NULL,
    
    -- Constraints
    CONSTRAINT FK_Doctors_User FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    CONSTRAINT FK_Doctors_CreatedBy FOREIGN KEY (created_by) REFERENCES Users(id) ON DELETE SET NULL,
    CONSTRAINT FK_Doctors_UpdatedBy FOREIGN KEY (updated_by) REFERENCES Users(id) ON DELETE SET NULL,
    CONSTRAINT FK_Doctors_DeletedBy FOREIGN KEY (deleted_by) REFERENCES Users(id) ON DELETE SET NULL;
);

-- ============================================================================
-- 4. Table: Appointments (Booking State Machine)
-- ============================================================================
CREATE TABLE Appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    doctor_id UUID NOT NULL,
    appointment_date TIMESTAMPTZ NOT NULL,
    duration_minutes INT NOT NULL,
    reason VARCHAR(500) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Booked',
    cancellation_reason VARCHAR(500) NULL,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NULL,
    updated_at TIMESTAMPTZ NULL,
    updated_by UUID NULL,
    
    -- Soft Delete Fields
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMPTZ NULL,
    deleted_by UUID NULL,
    
    -- Constraints
    CONSTRAINT FK_Appointments_Patient FOREIGN KEY (patient_id) REFERENCES Patients(id) ON DELETE RESTRICT,
    CONSTRAINT FK_Appointments_Doctor FOREIGN KEY (doctor_id) REFERENCES Doctors(id) ON DELETE RESTRICT,
    CONSTRAINT FK_Appointments_CreatedBy FOREIGN KEY (created_by) REFERENCES Users(id) ON DELETE SET NULL,
    CONSTRAINT FK_Appointments_UpdatedBy FOREIGN KEY (updated_by) REFERENCES Users(id) ON DELETE SET NULL,
    CONSTRAINT FK_Appointments_DeletedBy FOREIGN KEY (deleted_by) REFERENCES Users(id) ON DELETE SET NULL,
    CONSTRAINT CK_Appointments_Duration CHECK (duration_minutes IN (15, 30, 45, 60)),
    CONSTRAINT CK_Appointments_Status CHECK (status IN ('Booked', 'Confirmed', 'Cancelled', 'Completed', 'NoShow'))
);

-- ============================================================================
-- 5. Table: Symptoms (Historical Patient Logs)
-- ============================================================================
CREATE TABLE Symptoms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    description TEXT NOT NULL,
    severity_scale INT NOT NULL,
    ai_triage_result VARCHAR(50) NOT NULL DEFAULT 'PendingTriage',
    ai_recommendation TEXT NULL,
    logged_at TIMESTAMPTZ NOT NULL,
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NULL,
    updated_at TIMESTAMPTZ NULL,
    updated_by UUID NULL,
    
    -- Soft Delete Fields
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMPTZ NULL,
    deleted_by UUID NULL,
    
    -- Constraints
    CONSTRAINT FK_Symptoms_Patient FOREIGN KEY (patient_id) REFERENCES Patients(id) ON DELETE CASCADE,
    CONSTRAINT FK_Symptoms_CreatedBy FOREIGN KEY (created_by) REFERENCES Users(id) ON DELETE SET NULL,
    CONSTRAINT FK_Symptoms_UpdatedBy FOREIGN KEY (updated_by) REFERENCES Users(id) ON DELETE SET NULL,
    CONSTRAINT FK_Symptoms_DeletedBy FOREIGN KEY (deleted_by) REFERENCES Users(id) ON DELETE SET NULL,
    CONSTRAINT CK_Symptoms_Severity CHECK (severity_scale BETWEEN 1 AND 10),
    CONSTRAINT CK_Symptoms_AiTriage CHECK (ai_triage_result IN ('Low', 'Medium', 'High', 'PendingTriage'))
);

-- ============================================================================
-- 6. Table: Messages (Patient-Doctor Encrypted Direct Chat)
-- ============================================================================
CREATE TABLE Messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL,
    recipient_id UUID NOT NULL,
    appointment_id UUID NOT NULL,
    encrypted_content TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ NULL,
    
    -- Constraints
    CONSTRAINT FK_Messages_Sender FOREIGN KEY (sender_id) REFERENCES Users(id) ON DELETE RESTRICT,
    CONSTRAINT FK_Messages_Recipient FOREIGN KEY (recipient_id) REFERENCES Users(id) ON DELETE RESTRICT,
    CONSTRAINT FK_Messages_Appointment FOREIGN KEY (appointment_id) REFERENCES Appointments(id) ON DELETE CASCADE
);

-- ============================================================================
-- 7. Table: RefreshTokens (Security JWT Rotation Mechanism)
-- ============================================================================
CREATE TABLE RefreshTokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    replaced_by_token VARCHAR(255) NULL,
    
    -- Constraints
    CONSTRAINT FK_RefreshTokens_User FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- ============================================================================
-- 8. Table: Notifications (Asynchronous Channels Pipeline)
-- ============================================================================
CREATE TABLE Notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    channel VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    sent_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT FK_Notifications_User FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    CONSTRAINT CK_Notifications_Channel CHECK (channel IN ('Email', 'SMS', 'Push')),
    CONSTRAINT CK_Notifications_Status CHECK (status IN ('Pending', 'Sent', 'Failed'))
);

-- ============================================================================
-- 9. Table: AuditLogs (System Change Tracker Logs)
-- ============================================================================
CREATE TABLE AuditLogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NULL,
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB NULL,
    new_values JSONB NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45) NULL,
    user_agent VARCHAR(255) NULL,
    
    -- Constraints
    CONSTRAINT FK_AuditLogs_User FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE SET NULL
);

-- ============================================================================
-- 10. Table: FileMetadata (Clinical Attachments Metadata)
-- ============================================================================
CREATE TABLE FileMetadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uploader_id UUID NOT NULL,
    appointment_id UUID NULL,
    file_name VARCHAR(255) NOT NULL,
    storage_path VARCHAR(512) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size_in_bytes BIGINT NOT NULL,
    access_level VARCHAR(50) NOT NULL DEFAULT 'Private',
    
    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NULL,
    updated_at TIMESTAMPTZ NULL,
    updated_by UUID NULL,
    
    -- Soft Delete Fields
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMPTZ NULL,
    deleted_by UUID NULL,
    
    -- Constraints
    CONSTRAINT FK_FileMetadata_Uploader FOREIGN KEY (uploader_id) REFERENCES Users(id) ON DELETE RESTRICT,
    CONSTRAINT FK_FileMetadata_Appointment FOREIGN KEY (appointment_id) REFERENCES Appointments(id) ON DELETE SET NULL,
    CONSTRAINT FK_FileMetadata_CreatedBy FOREIGN KEY (created_by) REFERENCES Users(id) ON DELETE SET NULL,
    CONSTRAINT FK_FileMetadata_UpdatedBy FOREIGN KEY (updated_by) REFERENCES Users(id) ON DELETE SET NULL,
    CONSTRAINT FK_FileMetadata_DeletedBy FOREIGN KEY (deleted_by) REFERENCES Users(id) ON DELETE SET NULL,
    CONSTRAINT CK_FileMetadata_Access CHECK (access_level IN ('Private', 'SharedWithDoctor', 'Public'))
);

-- ============================================================================
-- Database Performance Indexes
-- ============================================================================

-- Users Indexes
CREATE INDEX IX_Users_Email ON Users (email) WHERE is_deleted = FALSE;

-- Appointments Indexes
CREATE INDEX IX_Appointments_Date ON Appointments (appointment_date) WHERE is_deleted = FALSE;
CREATE INDEX IX_Appointments_Doctor ON Appointments (doctor_id) WHERE is_deleted = FALSE;
CREATE INDEX IX_Appointments_Patient ON Appointments (patient_id) WHERE is_deleted = FALSE;

-- Symptoms Indexes
CREATE INDEX IX_Symptoms_LoggedAt ON Symptoms (logged_at) WHERE is_deleted = FALSE;
CREATE INDEX IX_Symptoms_Patient ON Symptoms (patient_id) WHERE is_deleted = FALSE;

-- Messages Indexes
CREATE INDEX IX_Messages_Appointment ON Messages (appointment_id);

-- AuditLogs Indexes
CREATE INDEX IX_AuditLogs_Timestamp ON AuditLogs (timestamp);

-- RefreshTokens Indexes
CREATE INDEX IX_RefreshTokens_Token ON RefreshTokens (token);

-- Notifications Indexes
CREATE INDEX IX_Notifications_Status ON Notifications (status);
