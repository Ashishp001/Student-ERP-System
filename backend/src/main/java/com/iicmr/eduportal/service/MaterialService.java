package com.iicmr.eduportal.service;

import com.iicmr.eduportal.dto.request.MaterialCreateRequest;
import com.iicmr.eduportal.entity.StudyMaterial;
import com.iicmr.eduportal.entity.Subject;
import com.iicmr.eduportal.entity.User;
import com.iicmr.eduportal.exception.ForbiddenException;
import com.iicmr.eduportal.exception.ResourceNotFoundException;
import com.iicmr.eduportal.repository.StudyMaterialRepository;
import com.iicmr.eduportal.repository.SubjectRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@Service
@RequiredArgsConstructor
public class MaterialService {

    private final StudyMaterialRepository materialRepo;
    private final SubjectRepository subjectRepo;
    private final FileStorageService fileStorageService;

    @Transactional
    public Map<String, Object> upload(User faculty, MaterialCreateRequest req, MultipartFile file) throws IOException {
        Subject subject = subjectRepo.findById(req.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));

        if (file == null || file.isEmpty())
            throw new IllegalArgumentException("File is required");

        String fileUrl = fileStorageService.store(file, "materials", 20 * 1024 * 1024);

        StudyMaterial material = StudyMaterial.builder()
                .faculty(faculty)
                .subject(subject)
                .title(req.getTitle())
                .description(req.getDescription())
                .topic(req.getTopic())
                .fileUrl(fileUrl)
                .fileName(file.getOriginalFilename())
                .fileType(file.getContentType())
                .fileSize((int) file.getSize())
                .downloadCount(0)
                .build();

        return toMap(materialRepo.save(material));
    }

    public List<Map<String, Object>> getBySubject(UUID subjectId) {
        return materialRepo.findBySubjectIdOrderByCreatedAtDesc(subjectId)
                .stream().map(this::toMap).toList();
    }

    public List<Map<String, Object>> getMy(User faculty) {
        return materialRepo.findByFacultyIdOrderByCreatedAtDesc(faculty.getId())
                .stream().map(this::toMap).toList();
    }

    public List<Map<String, Object>> getAll() {
        return materialRepo.findAll().stream().map(this::toMap).toList();
    }

    @Transactional
    public Map<String, Object> incrementDownload(UUID id) {
        StudyMaterial m = materialRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found: " + id));
        m.setDownloadCount(m.getDownloadCount() + 1);
        return toMap(materialRepo.save(m));
    }

    @Transactional
    public void delete(UUID id, User user) {
        StudyMaterial m = materialRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found: " + id));
        boolean isOwner = m.getFaculty().getId().equals(user.getId());
        boolean isAdmin  = user.getRole().name().equals("ADMIN");
        if (!isOwner && !isAdmin)
            throw new ForbiddenException("Not authorized to delete this material");

        fileStorageService.delete(m.getFileUrl());
        materialRepo.delete(m);
    }

    private Map<String, Object> toMap(StudyMaterial m) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", m.getId());
        map.put("subjectId", m.getSubject().getId());
        map.put("subjectName", m.getSubject().getName());
        map.put("subjectCode", m.getSubject().getCode());
        map.put("facultyId", m.getFaculty().getId());
        map.put("facultyName", m.getFaculty().getFullName());
        map.put("title", m.getTitle());
        map.put("description", m.getDescription());
        map.put("topic", m.getTopic());
        map.put("fileUrl", m.getFileUrl());
        map.put("fileName", m.getFileName());
        map.put("fileType", m.getFileType());
        map.put("fileSize", m.getFileSize());
        map.put("downloadCount", m.getDownloadCount());
        map.put("createdAt", m.getCreatedAt());
        return map;
    }
}
