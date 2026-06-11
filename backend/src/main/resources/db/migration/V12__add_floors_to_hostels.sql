-- V12: Add floors to hostels for setup workflow

ALTER TABLE hostels
    ADD COLUMN IF NOT EXISTS floors INTEGER NOT NULL DEFAULT 1;
