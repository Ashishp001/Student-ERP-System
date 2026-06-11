package com.iicmr.eduportal.service;

import com.iicmr.eduportal.dto.request.ResultEntryRequest;
import com.iicmr.eduportal.dto.response.GpaResponse;
import com.iicmr.eduportal.entity.ExamResult;
import com.iicmr.eduportal.entity.Subject;
import com.iicmr.eduportal.entity.User;
import com.iicmr.eduportal.exception.ResourceNotFoundException;
import com.iicmr.eduportal.repository.ExamResultRepository;
import com.iicmr.eduportal.repository.StudentProfileRepository;
import com.iicmr.eduportal.repository.SubjectRepository;
import com.iicmr.eduportal.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ResultService {

    private final ExamResultRepository resultRepo;
    private final SubjectRepository    subjectRepo;
    private final UserRepository       userRepo;
    private final StudentProfileRepository profileRepo;

    /** Enter or update a single exam result — auto-calculates grade and gradePoints */
    @Transactional
    public Map<String, Object> enter(User admin, ResultEntryRequest req) {
        User student   = userRepo.findById(req.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        Subject subject = subjectRepo.findById(req.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));

        double pct = req.getObtainedMarks() / req.getMaxMarks() * 100;
        String grade;
        double gradePoints;
        if      (pct >= 90) { grade = "O";  gradePoints = 10; }
        else if (pct >= 80) { grade = "A+"; gradePoints = 9;  }
        else if (pct >= 70) { grade = "A";  gradePoints = 8;  }
        else if (pct >= 60) { grade = "B+"; gradePoints = 7;  }
        else if (pct >= 50) { grade = "B";  gradePoints = 6;  }
        else if (pct >= 40) { grade = "C";  gradePoints = 5;  }
        else                { grade = "F";  gradePoints = 0;  }

        ExamResult result = resultRepo.findByStudentIdAndSubjectIdAndExamTypeAndAcademicYear(
                req.getStudentId(), req.getSubjectId(), req.getExamType(), req.getAcademicYear())
                .orElse(ExamResult.builder()
                        .student(student)
                        .subject(subject)
                        .examType(req.getExamType())
                        .academicYear(req.getAcademicYear())
                        .semester(req.getSemester())
                        .build());

        result.setMaxMarks(req.getMaxMarks());
        result.setObtainedMarks(req.getObtainedMarks());
        result.setGrade(grade);
        result.setGradePoints(gradePoints);
        result.setEnteredBy(admin);
        return toMap(resultRepo.save(result));
    }

    /** Bulk entry */
    @Transactional
    public List<Map<String, Object>> enterBulk(User admin, List<ResultEntryRequest> requests) {
        List<Map<String, Object>> saved = new ArrayList<>();
        for (ResultEntryRequest req : requests) saved.add(enter(admin, req));
        return saved;
    }

    /** Publish all results for a subject + examType + academicYear — makes them visible to students */
    @Transactional
    public int publish(UUID subjectId, String examType, String academicYear) {
        List<ExamResult> results = resultRepo.findBySubjectIdOrderByStudentIdAsc(subjectId)
                .stream()
                .filter(r -> r.getExamType().equals(examType) && r.getAcademicYear().equals(academicYear))
                .toList();
        results.forEach(r -> r.setIsPublished(true));
        resultRepo.saveAll(results);
        return results.size();
    }

    /** Student: own results, grouped by semester (published only) */
    public Map<Integer, List<Map<String, Object>>> getMyResults(User student) {
        List<ExamResult> all = resultRepo.findByStudentIdOrderBySemesterAsc(student.getId())
                .stream().filter(ExamResult::getIsPublished).toList();

        Map<Integer, List<Map<String, Object>>> grouped = new LinkedHashMap<>();
        for (ExamResult r : all) {
            grouped.computeIfAbsent(r.getSemester(), k -> new ArrayList<>()).add(toMap(r));
        }
        return grouped;
    }

    /** Student: GPA/CGPA calculation */
    public GpaResponse getGpa(User student) {
        List<ExamResult> all = resultRepo.findByStudentIdOrderBySemesterAsc(student.getId())
                .stream().filter(ExamResult::getIsPublished).toList();

        // Group by semester
        Map<Integer, List<ExamResult>> bySemester = new LinkedHashMap<>();
        for (ExamResult r : all) {
            bySemester.computeIfAbsent(r.getSemester(), k -> new ArrayList<>()).add(r);
        }

        List<GpaResponse.SgpaEntry> sgpaList = new ArrayList<>();
        double cgpaNumerator   = 0;
        int    cgpaDenominator = 0;

        for (Map.Entry<Integer, List<ExamResult>> entry : bySemester.entrySet()) {
            int semCredits = 0;
            double gpSum   = 0;
            for (ExamResult r : entry.getValue()) {
                int credits = r.getSubject().getCredits();
                semCredits += credits;
                gpSum      += (r.getGradePoints() != null ? r.getGradePoints() : 0) * credits;
            }
            double sgpa = semCredits > 0 ? Math.round((gpSum / semCredits) * 100.0) / 100.0 : 0;
            sgpaList.add(GpaResponse.SgpaEntry.builder()
                    .semester(entry.getKey())
                    .sgpa(sgpa)
                    .totalCredits(semCredits)
                    .build());
            cgpaNumerator   += gpSum;
            cgpaDenominator += semCredits;
        }

        double cgpa = cgpaDenominator > 0
                ? Math.round((cgpaNumerator / cgpaDenominator) * 100.0) / 100.0 : 0;

        return GpaResponse.builder().cgpa(cgpa).semesters(sgpaList).build();
    }

    /** Admin/Faculty: all results for a subject */
    public List<Map<String, Object>> getBySubject(UUID subjectId) {
        return resultRepo.findBySubjectIdOrderByStudentIdAsc(subjectId)
                .stream().map(this::toMap).toList();
    }

    private Map<String, Object> toMap(ExamResult r) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",             r.getId());
        m.put("studentId",      r.getStudent().getId());
        m.put("studentName",    r.getStudent().getFullName());
        m.put("subjectId",      r.getSubject().getId());
        m.put("subjectName",    r.getSubject().getName());
        m.put("subjectCode",    r.getSubject().getCode());
        m.put("credits",        r.getSubject().getCredits());
        m.put("examType",       r.getExamType());
        m.put("maxMarks",       r.getMaxMarks());
        m.put("obtainedMarks",  r.getObtainedMarks());
        m.put("grade",          r.getGrade());
        m.put("gradePoints",    r.getGradePoints());
        m.put("semester",       r.getSemester());
        m.put("academicYear",   r.getAcademicYear());
        m.put("isPublished",    r.getIsPublished());
        m.put("createdAt",      r.getCreatedAt());
        return m;
    }
}
