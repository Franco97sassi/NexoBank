package com.nexobank.backend.auth.service;

import com.nexobank.backend.auth.dto.AuthMapper;
import com.nexobank.backend.auth.dto.AuthResponse;
import com.nexobank.backend.auth.dto.LoginRequest;
import com.nexobank.backend.auth.dto.RegisterRequest;
import com.nexobank.backend.auth.security.JwtService;
import com.nexobank.backend.domain.user.Role;
import com.nexobank.backend.domain.user.User;
import com.nexobank.backend.domain.user.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final AuthenticationManager authenticationManager;
    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            RefreshTokenService refreshTokenService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new AuthenticationException("Email already registered");
        }

        User user = userRepository.save(new User(
                email,
                passwordEncoder.encode(request.password()),
                Role.CUSTOMER
        ));
        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, request.password()));
        } catch (org.springframework.security.core.AuthenticationException exception) {
            throw new AuthenticationException("Invalid email or password");
        }
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new AuthenticationException(
                        "Invalid email or password"
                ));
        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse refresh(String refreshToken) {
        User user = refreshTokenService.validateAndGetUser(refreshToken);
        if (!user.isEnabled()) {
            throw new AuthenticationException("User is disabled");
        }
        refreshTokenService.revoke(refreshToken);
        return buildAuthResponse(user);
    }

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenService.revoke(refreshToken);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String refreshToken = refreshTokenService.create(user);
        return new AuthResponse(
                accessToken,
                refreshToken,
                "Bearer",
                jwtService.getAccessTokenExpirationSeconds(),
                AuthMapper.toUserResponse(user)
        );
    }
}
