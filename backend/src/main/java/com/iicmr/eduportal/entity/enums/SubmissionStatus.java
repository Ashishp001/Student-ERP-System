package com.iicmr.eduportal.entity.enums;

/**
 * Status of a student's assignment Submission.
 *
 * SUBMITTED — File uploaded, awaiting faculty review.
 * GRADED    — Faculty has entered marks and optional feedback.
 * RETURNED  — Faculty returned submission for revision (future use).
 */
public enum SubmissionStatus {
    SUBMITTED,
    GRADED,
    RETURNED
}
