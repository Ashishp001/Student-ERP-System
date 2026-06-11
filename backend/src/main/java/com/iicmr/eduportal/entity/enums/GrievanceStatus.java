package com.iicmr.eduportal.entity.enums;

/**
 * Workflow status of a student Grievance.
 *
 * OPEN      — Filed and awaiting admin attention.
 * IN_REVIEW — Assigned to a staff member; actively being handled.
 * RESOLVED  — Admin has resolved and added a resolution note.
 * REJECTED  — Admin has rejected the grievance with a reason.
 */
public enum GrievanceStatus {
    OPEN,
    IN_REVIEW,
    RESOLVED,
    REJECTED
}
