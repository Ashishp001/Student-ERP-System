package com.iicmr.eduportal.entity.enums;

/**
 * Lifecycle status of an Assignment.
 *
 * DRAFT     — Created by faculty, not yet visible to students.
 * PUBLISHED — Visible to students, submissions accepted.
 * CLOSED    — Deadline passed or manually closed; no more submissions.
 */
public enum AssignmentStatus {
    DRAFT,
    PUBLISHED,
    CLOSED
}
