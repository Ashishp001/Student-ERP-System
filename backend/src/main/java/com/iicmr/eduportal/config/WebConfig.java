package com.iicmr.eduportal.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Web MVC configuration.
 * Registers resource handlers so that files in the uploads/ directory
 * are served as static content via HTTP (e.g. GET /uploads/avatars/uuid.jpg).
 *
 * Access is still controlled by SecurityConfig — the /uploads/** path
 * requires authentication before serving.
 */
@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final AppProperties appProperties;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String uploadDir = appProperties.getFile().getUploadDir();

        // Resolve to absolute path and build file:// URI
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        String resourceLocation = "file:" + uploadPath.toString().replace("\\", "/") + "/";

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(resourceLocation)
                .setCachePeriod(3600)          // 1-hour browser cache for uploaded files
                .resourceChain(true);
    }
}
