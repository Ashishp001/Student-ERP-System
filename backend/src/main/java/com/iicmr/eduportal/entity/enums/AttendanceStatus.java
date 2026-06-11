package com.iicmr.eduportal.entity.enums;

/**
 * Per-student status in an attendance session.
 *
 * PRESENT — Student attended the class.
 * ABSENT  — Student was absent without leave.
 * LEAVE   — Student was on approved leave (counts differently for percentage).
 */
public enum AttendanceStatus {
    PRESENT,
    ABSENT,
    LEAVE
}
