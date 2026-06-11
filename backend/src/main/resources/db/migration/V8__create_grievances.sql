-- V8: Create grievances table

CREATE TABLE grievances (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      UUID         REFERENCES users(id),
    category        VARCHAR(50)  NOT NULL,
    subject         VARCHAR(300) NOT NULL,
    description     TEXT         NOT NULL,
    status          VARCHAR(20)  NOT NULL DEFAULT 'OPEN'
                        CHECK (status IN ('OPEN','IN_REVIEW','RESOLVED','REJECTED')),
    is_anonymous    BOOLEAN      NOT NULL DEFAULT FALSE,
    assigned_to     UUID         REFERENCES users(id),
    resolution_note TEXT,
    priority        VARCHAR(10)  NOT NULL DEFAULT 'medium'
                        CHECK (priority IN ('low','medium','high')),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    resolved_at     TIMESTAMPTZ
);

CREATE INDEX idx_grievances_status  ON grievances (status);
CREATE INDEX idx_grievances_student ON grievances (student_id);
