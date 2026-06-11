-- V7: Create notices and study_materials tables

CREATE TABLE notices (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by      UUID         NOT NULL REFERENCES users(id),
    title           VARCHAR(300) NOT NULL,
    content         TEXT         NOT NULL,
    category        VARCHAR(50)  NOT NULL DEFAULT 'general',
    target_audience VARCHAR(50)  NOT NULL DEFAULT 'all',
    file_url        VARCHAR(500),
    file_name       VARCHAR(255),
    is_pinned       BOOLEAN      NOT NULL DEFAULT FALSE,
    is_archived     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE study_materials (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id     UUID         NOT NULL REFERENCES users(id),
    subject_id     UUID         NOT NULL REFERENCES subjects(id),
    title          VARCHAR(300) NOT NULL,
    description    TEXT,
    topic          VARCHAR(200),
    file_url       VARCHAR(500) NOT NULL,
    file_name      VARCHAR(255) NOT NULL,
    file_type      VARCHAR(50),
    file_size      INTEGER,
    download_count INTEGER      NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notices_created_at ON notices (created_at DESC);
CREATE INDEX idx_notices_category   ON notices (category);
CREATE INDEX idx_materials_subject  ON study_materials (subject_id);
