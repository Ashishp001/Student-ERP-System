package com.iicmr.eduportal.util;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

/**
 * Utility class for building Spring Data Pageable objects from HTTP request parameters.
 * Enforces sensible defaults and max-size limits to prevent unbounded queries.
 */
public class PaginationUtil {

    public static final int DEFAULT_PAGE      = 0;
    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final int MAX_PAGE_SIZE     = 100;

    private PaginationUtil() { /* utility class — no instantiation */ }

    /**
     * Builds a Pageable with no sorting.
     *
     * @param page     0-based page index (null → 0)
     * @param size     page size (null → 20, capped at 100)
     */
    public static Pageable of(Integer page, Integer size) {
        return PageRequest.of(normalizePage(page), normalizeSize(size));
    }

    /**
     * Builds a Pageable sorted by a single field.
     *
     * @param page      0-based page index
     * @param size      page size
     * @param sortBy    field name to sort by (e.g. "createdAt")
     * @param direction "asc" or "desc" (case-insensitive)
     */
    public static Pageable of(Integer page, Integer size, String sortBy, String direction) {
        Sort sort = resolveSort(sortBy, direction);
        return PageRequest.of(normalizePage(page), normalizeSize(size), sort);
    }

    /**
     * Builds a Pageable with a default sort applied.
     * Useful when the caller doesn't provide sort params.
     *
     * @param page           0-based page index
     * @param size           page size
     * @param defaultSortBy  field name for default sort (e.g. "createdAt")
     */
    public static Pageable ofWithDefaultSort(Integer page, Integer size, String defaultSortBy) {
        return PageRequest.of(normalizePage(page), normalizeSize(size),
                Sort.by(Sort.Direction.DESC, defaultSortBy));
    }

    // --- Private helpers ---

    private static int normalizePage(Integer page) {
        return (page == null || page < 0) ? DEFAULT_PAGE : page;
    }

    private static int normalizeSize(Integer size) {
        if (size == null || size <= 0) return DEFAULT_PAGE_SIZE;
        return Math.min(size, MAX_PAGE_SIZE);
    }

    private static Sort resolveSort(String sortBy, String direction) {
        if (sortBy == null || sortBy.isBlank()) {
            return Sort.unsorted();
        }
        Sort.Direction dir = "asc".equalsIgnoreCase(direction)
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        return Sort.by(dir, sortBy);
    }
}
