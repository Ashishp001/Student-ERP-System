package com.iicmr.eduportal.util;

import com.iicmr.eduportal.exception.BadRequestException;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Utility class for validating uploaded files.
 * Checks MIME type, file size, and sanitizes filenames to prevent path traversal attacks.
 */
public class FileValidator {

    // Allowed MIME types per category
    public static final List<String> IMAGE_TYPES   = List.of("image/jpeg", "image/png", "image/webp");
    public static final List<String> DOC_TYPES     = List.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "text/plain"
    );
    public static final List<String> ALL_TYPES;

    static {
        ALL_TYPES = new java.util.ArrayList<>();
        ALL_TYPES.addAll(IMAGE_TYPES);
        ALL_TYPES.addAll(DOC_TYPES);
    }

    private FileValidator() { /* utility class — no instantiation */ }

    /**
     * Validates avatar upload: must be an image under 2 MB.
     */
    public static void validateAvatar(MultipartFile file) {
        requireNonEmpty(file);
        validateMimeType(file, IMAGE_TYPES, "Avatar must be a JPG, PNG, or WebP image");
        validateSize(file, 2 * 1024 * 1024L, "Avatar must be under 2 MB");
    }

    /**
     * Validates assignment file upload: any document type under 10 MB.
     */
    public static void validateAssignment(MultipartFile file) {
        requireNonEmpty(file);
        validateMimeType(file, ALL_TYPES, "Assignment must be a PDF, Word, PowerPoint, or image file");
        validateSize(file, 10 * 1024 * 1024L, "Assignment file must be under 10 MB");
    }

    /**
     * Validates study material upload: any document type under 20 MB.
     */
    public static void validateMaterial(MultipartFile file) {
        requireNonEmpty(file);
        validateMimeType(file, ALL_TYPES, "Material must be a PDF, Word, PowerPoint, image, or text file");
        validateSize(file, 20 * 1024 * 1024L, "Material file must be under 20 MB");
    }

    /**
     * Sanitizes a filename to prevent path traversal attacks.
     * Strips directory separators, null bytes, and limits length.
     */
    public static String sanitizeFilename(String originalFilename) {
        if (originalFilename == null || originalFilename.isBlank()) {
            return "file_" + System.currentTimeMillis();
        }
        // Strip path components and dangerous chars
        String name = originalFilename
                .replaceAll("[/\\\\:*?\"<>|]", "_")  // replace FS-illegal chars
                .replaceAll("\\.\\.", "_")              // prevent traversal
                .replaceAll("[\\x00-\\x1F]", "")       // strip control chars
                .trim();

        // Limit filename length to 200 chars
        if (name.length() > 200) {
            int dotIdx = name.lastIndexOf('.');
            String ext = (dotIdx >= 0) ? name.substring(dotIdx) : "";
            name = name.substring(0, 200 - ext.length()) + ext;
        }
        return name.isBlank() ? "file_" + System.currentTimeMillis() : name;
    }

    // --- Private helpers ---

    private static void requireNonEmpty(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file must not be empty");
        }
    }

    private static void validateMimeType(MultipartFile file, List<String> allowed, String message) {
        String contentType = file.getContentType();
        if (contentType == null || !allowed.contains(contentType)) {
            throw new BadRequestException(message + ". Received: " + contentType);
        }
    }

    private static void validateSize(MultipartFile file, long maxBytes, String message) {
        if (file.getSize() > maxBytes) {
            throw new BadRequestException(message);
        }
    }
}
