package com.iicmr.eduportal.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStatsResponse {
    // Student dashboard
    private Long pendingAssignments;
    private Double attendancePercentage;
    private Long unreadNotices;

    // Faculty dashboard
    private Long totalStudents;
    private Long pendingSubmissions;
    private Long subjectsTeaching;

    // Admin dashboard
    private Long totalStudentsCount;
    private Long totalFacultyCount;
    private Long activeCoursesCount;
    private Long openGrievancesCount;
}
