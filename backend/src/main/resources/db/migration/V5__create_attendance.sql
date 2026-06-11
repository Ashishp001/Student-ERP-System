-- V5: Create attendance table
-- Each row = one class session; attendance per student stored in JSONB

CREATE TABLE attendance (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id    UUID        NOT NULL REFERENCES subjects(id),
    faculty_id    UUID        NOT NULL REFERENCES users(id),
    date          DATE        NOT NULL,
    -- JSONB array: [{student_id: "uuid", status: "PRESENT"|"ABSENT"|"LEAVE"}, ...]
    records       JSONB       NOT NULL DEFAULT '[]',
    total_present INTEGER     NOT NULL DEFAULT 0,
    total_absent  INTEGER     NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (subject_id, date)
);

CREATE INDEX idx_attendance_subject_date ON attendance (subject_id, date DESC);
CREATE INDEX idx_attendance_faculty      ON attendance (faculty_id);
