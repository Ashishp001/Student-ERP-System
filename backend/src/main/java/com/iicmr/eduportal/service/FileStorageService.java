package com.iicmr.eduportal.service;

import com.iicmr.eduportal.config.AppProperties;
import com.iicmr.eduportal.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final AppProperties appProperties;

    private static final List<String> ALLOWED_DOC_TYPES = List.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/zip",
            "image/jpeg",
            "image/png"
    );

    /**
     * Store a file in the given subdirectory and return its relative URL.
     *
     * @param file      Incoming multipart file
     * @param subDir    Subdirectory name: "assignments", "submissions", "notices", "materials"
     * @param maxBytes  Maximum allowed file size in bytes
     * @return relative URL like "/uploads/assignments/abc123.pdf"
     */
    public String store(MultipartFile file, String subDir, long maxBytes) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }

        String contentType = file.getContentType();
        if (!ALLOWED_DOC_TYPES.contains(contentType)) {
            throw new BadRequestException("File type not allowed: " + contentType);
        }

        if (file.getSize() > maxBytes) {
            throw new BadRequestException("File exceeds maximum size of " + (maxBytes / 1024 / 1024) + "MB");
        }

        String originalName = file.getOriginalFilename();
        String extension = getExtension(originalName);
        String storedName = UUID.randomUUID() + "." + extension;

        Path dir = Paths.get(appProperties.getFile().getUploadDir(), subDir);
        Files.createDirectories(dir);

        Path target = dir.resolve(storedName);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        log.debug("Stored file: {} -> {}", originalName, target);
        return "/uploads/" + subDir + "/" + storedName;
    }

    /**
     * Delete a file by its relative URL (e.g. "/uploads/submissions/abc.pdf").
     */
    public void delete(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) return;
        try {
            // Remove leading slash and convert to path
            String relativePath = fileUrl.startsWith("/") ? fileUrl.substring(1) : fileUrl;
            Path filePath = Paths.get(appProperties.getFile().getUploadDir())
                    .resolve(relativePath.replace("uploads/", ""));
            Files.deleteIfExists(filePath);
            log.debug("Deleted file: {}", filePath);
        } catch (IOException e) {
            log.warn("Could not delete file: {} — {}", fileUrl, e.getMessage());
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "bin";
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }
}
