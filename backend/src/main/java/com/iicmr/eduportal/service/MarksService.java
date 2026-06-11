package com.iicmr.eduportal.service;

import com.iicmr.eduportal.dto.request.BulkMarkRequest;
import com.iicmr.eduportal.dto.request.MarkEntryRequest;
import com.iicmr.eduportal.entity.InternalMark;
import com.iicmr.eduportal.entity.Subject;
import com.iicmr.eduportal.entity.User;
import com.iicmr.eduportal.exception.BadRequestException;
import com.iicmr.eduportal.exception.ForbiddenException;
import com.iicmr.eduportal.exception.ResourceNotFoundException;
import com.iicmr.eduportal.repository.InternalMarkRepository;
import com.iicmr.eduportal.repository.SubjectRepository;
import com.iicmr.eduportal.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class MarksService {

    private final InternalMarkRepository markRepo;
    private final SubjectRepository subjectRepo;
    private final UserRepository userRepo;

    /** Enter or update a single mark (upsert) */
    @Transactional
    public Map<String, Object> enter(User faculty, MarkEntryRequest req) {
        Subject subject = subjectRepo.findById(req.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
        User student = userRepo.findById(req.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        InternalMark mark = markRepo
                .findByStudentIdAndSubjectIdAndComponent(req.getStudentId(), req.getSubjectId(), req.getComponent())
                .orElse(InternalMark.builder()
                        .student(student)
                        .subject(subject)
                        .component(req.getComponent())
                        .build());

        if (Boolean.TRUE.equals(mark.getIsLocked()))
            throw new BadRequestException("This component is locked and cannot be edited");

        mark.setMaxMarks(req.getMaxMarks());
        mark.setObtainedMarks(req.getObtainedMarks());
        mark.setEnteredBy(faculty);
        return toMap(markRepo.save(mark));
    }

    /** Bulk enter marks for multiple students in one transaction */
    @Transactional
    public List<Map<String, Object>> enterBulk(User faculty, BulkMarkRequest req) {
        Subject subject = subjectRepo.findById(req.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));

        List<Map<String, Object>> results = new ArrayList<>();
        for (BulkMarkRequest.StudentMarkDto dto : req.getMarks()) {
            User student = userRepo.findById(dto.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + dto.getStudentId()));

            InternalMark mark = markRepo
                    .findByStudentIdAndSubjectIdAndComponent(dto.getStudentId(), req.getSubjectId(), req.getComponent())
                    .orElse(InternalMark.builder()
                            .student(student)
                            .subject(subject)
                            .component(req.getComponent())
                            .build());

            if (Boolean.TRUE.equals(mark.getIsLocked())) continue; // skip locked

            mark.setMaxMarks(req.getMaxMarks());
            mark.setObtainedMarks(dto.getObtainedMarks());
            mark.setEnteredBy(faculty);
            results.add(toMap(markRepo.save(mark)));
        }
        return results;
    }

    /** Lock all entries for a subject+component — irreversible */
    @Transactional
    public void lockComponent(User faculty, UUID subjectId, String component) {
        List<InternalMark> marks = markRepo.findBySubjectIdOrderByStudentIdAscComponentAsc(subjectId)
                .stream()
                .filter(m -> m.getComponent().equalsIgnoreCase(component))
                .toList();
        marks.forEach(m -> m.setIsLocked(true));
        markRepo.saveAll(marks);
    }

    /** Faculty: all marks for a subject, grouped by component then student */
    public Map<String, Object> getBySubject(UUID subjectId) {
        List<InternalMark> marks = markRepo.findBySubjectIdOrderByStudentIdAscComponentAsc(subjectId);
        List<Map<String, Object>> list = marks.stream().map(this::toMap).toList();

        // Collect distinct components
        Set<String> components = new LinkedHashSet<>();
        marks.forEach(m -> components.add(m.getComponent()));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("subjectId", subjectId);
        result.put("components", components);
        result.put("marks", list);
        return result;
    }

    /** Student: own marks grouped by subject */
    public List<Map<String, Object>> getMyMarks(User student) {
        List<InternalMark> marks = markRepo.findByStudentIdOrderByCreatedAtDesc(student.getId());

        // Group by subject
        Map<UUID, List<InternalMark>> bySubject = new LinkedHashMap<>();
        for (InternalMark m : marks) {
            bySubject.computeIfAbsent(m.getSubject().getId(), k -> new ArrayList<>()).add(m);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<UUID, List<InternalMark>> entry : bySubject.entrySet()) {
            Map<String, Object> subjectGroup = new LinkedHashMap<>();
            InternalMark first = entry.getValue().get(0);
            subjectGroup.put("subjectId", first.getSubject().getId());
            subjectGroup.put("subjectName", first.getSubject().getName());
            subjectGroup.put("subjectCode", first.getSubject().getCode());

            double totalMax = entry.getValue().stream().mapToDouble(m -> m.getMaxMarks() != null ? m.getMaxMarks() : 0).sum();
            double totalObt = entry.getValue().stream().mapToDouble(m -> m.getObtainedMarks() != null ? m.getObtainedMarks() : 0).sum();
            subjectGroup.put("totalObtained", totalObt);
            subjectGroup.put("totalMax", totalMax);

            List<Map<String, Object>> components = entry.getValue().stream().map(this::toMap).toList();
            subjectGroup.put("components", components);
            result.add(subjectGroup);
        }
        return result;
    }

    private Map<String, Object> toMap(InternalMark m) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", m.getId());
        map.put("studentId", m.getStudent().getId());
        map.put("studentName", m.getStudent().getFullName());
        map.put("subjectId", m.getSubject().getId());
        map.put("subjectName", m.getSubject().getName());
        map.put("component", m.getComponent());
        map.put("maxMarks", m.getMaxMarks());
        map.put("obtainedMarks", m.getObtainedMarks());
        map.put("isLocked", m.getIsLocked());
        map.put("createdAt", m.getCreatedAt());
        return map;
    }
}
