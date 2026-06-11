-- V10: Create hostel management tables

CREATE TABLE hostels (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(200) NOT NULL,
    type            VARCHAR(20)  NOT NULL CHECK (type IN ('BOYS', 'GIRLS', 'MIXED')),
    address         TEXT,
    warden_name     VARCHAR(255),
    warden_phone    VARCHAR(20),
    total_rooms     INTEGER      NOT NULL DEFAULT 0 CHECK (total_rooms >= 0),
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE hostel_rooms (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    hostel_id       UUID         NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
    room_number     VARCHAR(30)  NOT NULL,
    floor_no        INTEGER,
    capacity        INTEGER      NOT NULL CHECK (capacity > 0),
    occupied_count  INTEGER      NOT NULL DEFAULT 0 CHECK (occupied_count >= 0),
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (hostel_id, room_number)
);

CREATE TABLE hostel_allocations (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_id         UUID         NOT NULL REFERENCES hostel_rooms(id),
    allocated_by    UUID         REFERENCES users(id),
    start_date      DATE         NOT NULL,
    end_date        DATE,
    status          VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE'
                                   CHECK (status IN ('ACTIVE', 'CHECKED_OUT', 'CANCELLED')),
    notes           TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE hostel_complaints (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    allocation_id   UUID         REFERENCES hostel_allocations(id) ON DELETE SET NULL,
    category        VARCHAR(60)  NOT NULL,
    title           VARCHAR(200) NOT NULL,
    description     TEXT         NOT NULL,
    status          VARCHAR(20)  NOT NULL DEFAULT 'OPEN'
                                   CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED')),
    admin_note      TEXT,
    resolved_by     UUID         REFERENCES users(id),
    resolved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hostel_rooms_hostel_id             ON hostel_rooms (hostel_id);
CREATE INDEX idx_hostel_allocations_student_id      ON hostel_allocations (student_id);
CREATE INDEX idx_hostel_allocations_room_id         ON hostel_allocations (room_id);
CREATE INDEX idx_hostel_allocations_status          ON hostel_allocations (status);
CREATE INDEX idx_hostel_complaints_student_id       ON hostel_complaints (student_id);
CREATE INDEX idx_hostel_complaints_status_created   ON hostel_complaints (status, created_at DESC);
