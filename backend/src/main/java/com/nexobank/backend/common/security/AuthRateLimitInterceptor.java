package com.nexobank.backend.common.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexobank.backend.common.error.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class AuthRateLimitInterceptor implements HandlerInterceptor {
    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;
    private final int requestLimit;
    private final long windowSeconds;

    public AuthRateLimitInterceptor(
            ObjectMapper objectMapper,
            @Value("${app.security.auth-rate-limit.requests:10}") int requestLimit,
            @Value("${app.security.auth-rate-limit.window-seconds:60}") long windowSeconds
    ) {
        this.objectMapper = objectMapper;
        this.requestLimit = requestLimit;
        this.windowSeconds = windowSeconds;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        long now = Instant.now().getEpochSecond();
        String key = request.getRemoteAddr() + ':' + request.getRequestURI();
        Window window = windows.compute(key, (ignored, current) ->
                current == null || now >= current.startedAt() + windowSeconds
                        ? new Window(now, 1)
                        : new Window(current.startedAt(), current.requests() + 1));

        long retryAfter = Math.max(1, window.startedAt() + windowSeconds - now);
        response.setHeader("X-RateLimit-Limit", String.valueOf(requestLimit));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(Math.max(0, requestLimit - window.requests())));
        if (window.requests() <= requestLimit) {
            return true;
        }

        response.setStatus(429);
        response.setHeader("Retry-After", String.valueOf(retryAfter));
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getOutputStream(), ApiErrorResponse.of(
                429, "Too Many Requests", "Too many authentication attempts", request.getRequestURI()));
        return false;
    }

    private record Window(long startedAt, int requests) {
    }
}
