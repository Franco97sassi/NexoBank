package com.nexobank.backend.common.config;

import com.nexobank.backend.common.audit.AuditRequestInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    private final AuditRequestInterceptor auditRequestInterceptor;

    public WebConfig(AuditRequestInterceptor auditRequestInterceptor) {
        this.auditRequestInterceptor = auditRequestInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(auditRequestInterceptor).addPathPatterns("/api/v1/**");
    }
}
