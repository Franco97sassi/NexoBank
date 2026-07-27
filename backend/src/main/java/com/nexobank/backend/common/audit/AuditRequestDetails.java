package com.nexobank.backend.common.audit;

import jakarta.servlet.http.HttpServletRequest;

public final class AuditRequestDetails {
    private AuditRequestDetails() { }

    public static String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        return forwarded == null || forwarded.isBlank()
                ? request.getRemoteAddr()
                : forwarded.split(",", 2)[0].trim();
    }

    public static String userAgent(HttpServletRequest request) {
        return request.getHeader("User-Agent");
    }
}
