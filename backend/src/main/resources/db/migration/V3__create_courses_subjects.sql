-- V3: Create courses and subjects tables; add course_id FK to student_profiles

CREATE TABLE courses (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    code            VARCHAR(20)  NOT NULL UNIQUE,
    total_semesters INTEGER      NOT NULL CHECK (total_semesters >= 1),
    total_credits   INTEGER,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE subjects (
    id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id          UUID         NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    faculty_id         UUID         REFERENCES users(id),
    name               VARCHAR(200) NOT NULL,
    code               VARCHAR(20)  NOT NULL UNIQUE,
    semester           INTEGER      NOT NULL CHECK (semester >= 1),
    credits            INTEGER      NOT NULL,
    type               VARCHAR(20)  NOT NULL DEFAULT 'CORE'
                           CHECK (type IN ('CORE','ELECTIVE','LAB','PROJECT')),
    max_internal_marks FLOAT        NOT NULL DEFAULT 40.0,
    max_external_marks FLOAT        NOT NULL DEFAULT 60.0,
    is_active          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Add optional course_id FK to student_profiles (was omitted in V2)
ALTER TABLE student_profiles
    ADD COLUMN course_id UUID REFERENCES courses(id);

CREATE INDEX idx_subjects_course_semester ON subjects (course_id, semester);
CREATE INDEX idx_subjects_faculty         ON subjects (faculty_id);
