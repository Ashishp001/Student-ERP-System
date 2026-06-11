-- V6: Create internal_marks and exam_results tables

CREATE TABLE internal_marks (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id     UUID         NOT NULL REFERENCES users(id),
    subject_id     UUID         NOT NULL REFERENCES subjects(id),
    component      VARCHAR(100) NOT NULL,
    max_marks      FLOAT        NOT NULL,
    obtained_marks FLOAT,
    entered_by     UUID         REFERENCES users(id),
    is_locked      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, subject_id, component)
);

CREATE TABLE exam_results (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id     UUID         NOT NULL REFERENCES users(id),
    subject_id     UUID         NOT NULL REFERENCES subjects(id),
    exam_type      VARCHAR(50)  NOT NULL,
    max_marks      FLOAT        NOT NULL,
    obtained_marks FLOAT,
    grade          VARCHAR(5),
    grade_points   FLOAT,
    semester       INTEGER      NOT NULL,
    academic_year  VARCHAR(20)  NOT NULL,
    is_published   BOOLEAN      NOT NULL DEFAULT FALSE,
    entered_by     UUID         REFERENCES users(id),
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, subject_id, exam_type, academic_year)
);

CREATE INDEX idx_internal_marks_student_subject ON internal_marks (student_id, subject_id);
CREATE INDEX idx_exam_results_student           ON exam_results (student_id, semester);
