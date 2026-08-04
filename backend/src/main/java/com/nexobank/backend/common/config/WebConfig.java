package com.nexobank.backend.common.config;

import com.nexobank.backend.common.audit.AuditRequestInterceptor;
import com.nexobank.backend.common.security.AuthRateLimitInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    private final AuditRequestInterceptor auditRequestInterceptor;
    private final AuthRateLimitInterceptor authRateLimitInterceptor;

    public WebConfig(AuditRequestInterceptor auditRequestInterceptor,
                     AuthRateLimitInterceptor authRateLimitInterceptor) {
        this.auditRequestInterceptor = auditRequestInterceptor;
        this.authRateLimitInterceptor = authRateLimitInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(auditRequestInterceptor).addPathPatterns("/api/v1/**");
        registry.addInterceptor(authRateLimitInterceptor)
                .addPathPatterns("/api/v1/auth/login", "/api/v1/auth/register", "/api/v1/auth/refresh");
    }
}
