-- V2: Create student_profiles and faculty_profiles tables

CREATE TABLE student_profiles (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID         NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    enrollment_number VARCHAR(50)  UNIQUE,
    current_semester  INTEGER      DEFAULT 1 CHECK (current_semester >= 1),
    academic_year     VARCHAR(20),
    address           TEXT,
    date_of_birth     DATE,
    guardian_name     VARCHAR(255),
    guardian_phone    VARCHAR(20)
);

CREATE TABLE faculty_profiles (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID         NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    department   VARCHAR(100),
    designation  VARCHAR(100),
    qualification VARCHAR(255),
    address      TEXT,
    joining_date DATE
);

CREATE INDEX idx_student_profiles_user_id  ON student_profiles (user_id);
CREATE INDEX idx_faculty_profiles_user_id  ON faculty_profiles (user_id);
