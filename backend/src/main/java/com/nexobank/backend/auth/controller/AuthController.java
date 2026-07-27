package com.nexobank.backend.auth.controller;

import com.nexobank.backend.auth.dto.*;
import com.nexobank.backend.auth.service.AuthService;
import com.nexobank.backend.common.audit.AuditRequestDetails;
import com.nexobank.backend.domain.audit.AuditEventService;
import com.nexobank.backend.domain.user.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService authService;
    private final AuditEventService audit;

    public AuthController(AuthService authService, AuditEventService audit) {
        this.authService = authService;
        this.audit = audit;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest body, HttpServletRequest request) {
        AuthResponse response = authService.register(body);
        record(response.user().id(), "REGISTER", request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest body, HttpServletRequest request) {
        AuthResponse response = authService.login(body);
        record(response.user().id(), "LOGIN", request);
        return response;
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return authService.refresh(request.refreshToken());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody LogoutRequest body, HttpServletRequest request) {
        User user = authService.logout(body.refreshToken());
        record(user.getId(), "LOGOUT", request);
        return ResponseEntity.noContent().build();
    }

    private void record(java.util.UUID actorId, String eventType, HttpServletRequest request) {
        audit.record(actorId, eventType, "AUTHENTICATION", actorId, null,
                AuditRequestDetails.clientIp(request), AuditRequestDetails.userAgent(request));
    }
}
