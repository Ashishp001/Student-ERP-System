package com.iicmr.eduportal.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
@Getter
@Setter
public class AppProperties {
    private Jwt jwt = new Jwt();
    private File file = new File();
    private Cors cors = new Cors();

    @Getter @Setter
    public static class Jwt {
        private String secret;
        private long accessTokenExpiration = 1800000;
        private long refreshTokenExpiration = 604800000;
    }

    @Getter @Setter
    public static class File {
        private String uploadDir = "./uploads";
    }

    @Getter @Setter
    public static class Cors {
        private String allowedOrigins = "http://localhost:5173";
    }
}
