-- V11: Add hostel applications and academic year to allocations

CREATE TABLE hostel_applications (
    id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preferred_hostel_id UUID        REFERENCES hostels(id) ON DELETE SET NULL,
    preferred_room_type VARCHAR(60),
    reason             TEXT         NOT NULL,
    status             VARCHAR(20)  NOT NULL DEFAULT 'PENDING'
                                    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    admin_note         TEXT,
    reviewed_by        UUID         REFERENCES users(id),
    reviewed_at        TIMESTAMPTZ,
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

ALTER TABLE hostel_allocations
    ADD COLUMN IF NOT EXISTS academic_year VARCHAR(20);

CREATE INDEX idx_hostel_applications_student_id ON hostel_applications (student_id);
CREATE INDEX idx_hostel_applications_status_created ON hostel_applications (status, created_at DESC);
