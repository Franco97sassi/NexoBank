package com.nexobank.backend.auth.controller;

import com.nexobank.backend.auth.dto.*;
import com.nexobank.backend.auth.service.AuthenticationException;
import com.nexobank.backend.auth.service.AuthService;
import com.nexobank.backend.common.audit.AuditRequestDetails;
import com.nexobank.backend.domain.audit.AuditEventService;
import com.nexobank.backend.domain.user.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private static final String REFRESH_COOKIE = "nexobank_refresh";

    private final AuthService authService;
    private final AuditEventService audit;

    @Value("${app.security.refresh-cookie.secure:false}")
    private boolean secureCookie;

    @Value("${app.security.jwt.refresh-token-expiration-seconds:604800}")
    private long refreshTokenMaxAge;

    public AuthController(AuthService authService, AuditEventService audit) {
        this.authService = authService;
        this.audit = audit;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest body, HttpServletRequest request) {
        AuthResponse response = authService.register(body);
        record(response.user().id(), "REGISTER", request);
        return withRefreshCookie(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest body, HttpServletRequest request) {
        AuthResponse response = authService.login(body);
        record(response.user().id(), "LOGIN", request);
        return withRefreshCookie(response, HttpStatus.OK);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @CookieValue(name = REFRESH_COOKIE, required = false) String refreshToken
    ) {
        return withRefreshCookie(authService.refresh(requireRefreshToken(refreshToken)), HttpStatus.OK);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(name = REFRESH_COOKIE, required = false) String refreshToken,
            HttpServletRequest request
    ) {
        User user = authService.logout(requireRefreshToken(refreshToken));
        record(user.getId(), "LOGOUT", request);
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, refreshCookie("", 0).toString())
                .build();
    }

    private ResponseEntity<AuthResponse> withRefreshCookie(AuthResponse response, HttpStatus status) {
        return ResponseEntity.status(status)
                .header(HttpHeaders.SET_COOKIE,
                        refreshCookie(response.refreshToken(), refreshTokenMaxAge).toString())
                .body(response);
    }

    private ResponseCookie refreshCookie(String value, long maxAge) {
        return ResponseCookie.from(REFRESH_COOKIE, value)
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite("Strict")
                .path("/api/v1/auth")
                .maxAge(maxAge)
                .build();
    }

    private String requireRefreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new AuthenticationException("Refresh token is missing");
        }
        return refreshToken;
    }

    private void record(java.util.UUID actorId, String eventType, HttpServletRequest request) {
        audit.record(actorId, eventType, "AUTHENTICATION", actorId, null,
                AuditRequestDetails.clientIp(request), AuditRequestDetails.userAgent(request));
    }
}
