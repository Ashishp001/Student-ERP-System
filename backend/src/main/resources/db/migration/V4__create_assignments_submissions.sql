-- V4: Create assignments and submissions tables

CREATE TABLE assignments (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id   UUID         NOT NULL REFERENCES users(id),
    subject_id   UUID         NOT NULL REFERENCES subjects(id),
    title        VARCHAR(300) NOT NULL,
    instructions TEXT,
    total_marks  FLOAT        NOT NULL,
    file_url     VARCHAR(500),
    file_name    VARCHAR(255),
    status       VARCHAR(20)  NOT NULL DEFAULT 'DRAFT'
                     CHECK (status IN ('DRAFT','PUBLISHED','CLOSED')),
    deadline     TIMESTAMPTZ  NOT NULL,
    allow_late   BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE submissions (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id  UUID         NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id     UUID         NOT NULL REFERENCES users(id),
    file_url       VARCHAR(500) NOT NULL,
    file_name      VARCHAR(255) NOT NULL,
    file_size      INTEGER,
    obtained_marks FLOAT,
    feedback       TEXT,
    status         VARCHAR(20)  NOT NULL DEFAULT 'SUBMITTED'
                       CHECK (status IN ('SUBMITTED','GRADED','RETURNED')),
    is_late        BOOLEAN      NOT NULL DEFAULT FALSE,
    submitted_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    graded_at      TIMESTAMPTZ,
    graded_by      UUID         REFERENCES users(id),
    UNIQUE (assignment_id, student_id)
);

CREATE INDEX idx_assignments_subject  ON assignments (subject_id);
CREATE INDEX idx_assignments_faculty  ON assignments (faculty_id);
CREATE INDEX idx_assignments_deadline ON assignments (deadline);
CREATE INDEX idx_submissions_assignment ON submissions (assignment_id);
CREATE INDEX idx_submissions_student    ON submissions (student_id);
