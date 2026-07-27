package com.nexobank.backend.common.audit;

import com.nexobank.backend.auth.security.JwtPrincipal;
import com.nexobank.backend.domain.audit.AuditEventService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Locale;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class AuditRequestInterceptor implements HandlerInterceptor {
    private static final Pattern API_RESOURCE = Pattern.compile("^/api/v1/([^/]+)(?:/([^/]+))?.*$");
    private final AuditEventService audit;

    public AuditRequestInterceptor(AuditEventService audit) { this.audit = audit; }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                                Object handler, Exception exception) {
        if (exception != null || response.getStatus() >= 400 || !isMutation(request.getMethod())) return;
        Matcher matcher = API_RESOURCE.matcher(request.getRequestURI());
        if (!matcher.matches()) return;
        String resource = matcher.group(1);
        if (resource.equals("auth") || resource.equals("audit-events")) return;

        UUID actorId = currentActorId();
        String entityType = entityType(resource);
        UUID entityId = parseUuid(matcher.group(2));
        String eventType = resource.equals("transfers") && request.getMethod().equals("POST")
                ? "TRANSFER_COMPLETED" : request.getMethod() + "_" + entityType;
        String metadata = "{\"method\":\"" + request.getMethod() + "\",\"path\":\""
                + request.getRequestURI() + "\",\"status\":" + response.getStatus() + "}";
        audit.record(actorId, eventType, entityType, entityId, metadata,
                AuditRequestDetails.clientIp(request), AuditRequestDetails.userAgent(request));
    }

    private boolean isMutation(String method) {
        return method.equals("POST") || method.equals("PUT") || method.equals("PATCH") || method.equals("DELETE");
    }

    private UUID currentActorId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getPrincipal() instanceof JwtPrincipal principal
                ? principal.userId() : null;
    }

    private String entityType(String resource) {
        String singular = resource.endsWith("ies")
                ? resource.substring(0, resource.length() - 3) + "y"
                : resource.endsWith("s") ? resource.substring(0, resource.length() - 1) : resource;
        return singular.replace('-', '_').toUpperCase(Locale.ROOT);
    }

    private UUID parseUuid(String value) {
        try { return value == null ? null : UUID.fromString(value); }
        catch (IllegalArgumentException ignored) { return null; }
    }
}
