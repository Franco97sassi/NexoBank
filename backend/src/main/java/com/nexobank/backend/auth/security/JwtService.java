package com.nexobank.backend.auth.security;

import com.nexobank.backend.auth.service.AuthenticationException;
import com.nexobank.backend.domain.user.Role;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Clock;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

@Service
public class JwtService {

    private static final String HMAC_ALGORITHM = "HmacSHA256";

    private final String issuer;
    private final String secret;
    private final long accessTokenExpirationSeconds;
    private final Clock clock;

    public JwtService(
            @Value("${app.security.jwt.issuer:nexobank}") String issuer,
            @Value("${app.security.jwt.secret:change-this-development-secret-with-at-least-32-bytes}") String secret,
            @Value("${app.security.jwt.access-token-expiration-seconds:900}") long accessTokenExpirationSeconds,
            Clock clock
    ) {
        this.issuer = issuer;
        this.secret = secret;
        this.accessTokenExpirationSeconds = accessTokenExpirationSeconds;
        this.clock = clock;
    }

    public String generateAccessToken(UUID userId, String email, Role role) {
        Instant now = Instant.now(clock);
        Instant expiresAt = now.plusSeconds(accessTokenExpirationSeconds);
        String header = base64Url("{\"alg\":\"HS256\",\"typ\":\"JWT\"}");
        String payload = base64Url("{"
                + "\"iss\":" + json(issuer) + ","
                + "\"sub\":" + json(userId.toString()) + ","
                + "\"email\":" + json(email) + ","
                + "\"role\":" + json(role.name()) + ","
                + "\"iat\":" + now.getEpochSecond() + ","
                + "\"exp\":" + expiresAt.getEpochSecond()
                + "}");
        return header + "." + payload + "." + sign(header + "." + payload);
    }

    public JwtPrincipal validate(String token) {
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new AuthenticationException("Invalid access token");
        }

        String expectedSignature = sign(parts[0] + "." + parts[1]);
        if (!MessageDigest.isEqual(expectedSignature.getBytes(StandardCharsets.UTF_8), parts[2].getBytes(StandardCharsets.UTF_8))) {
            throw new AuthenticationException("Invalid access token signature");
        }

        String payload = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
        String tokenIssuer = extractString(payload, "iss");
        if (!issuer.equals(tokenIssuer)) {
            throw new AuthenticationException("Invalid access token issuer");
        }

        long expiresAt = extractLong(payload, "exp");
        if (Instant.now(clock).getEpochSecond() >= expiresAt) {
            throw new AuthenticationException("Access token expired");
        }

        return new JwtPrincipal(
                UUID.fromString(extractString(payload, "sub")),
                extractString(payload, "email"),
                Role.valueOf(extractString(payload, "role"))
        );
    }

    public long getAccessTokenExpirationSeconds() {
        return accessTokenExpirationSeconds;
    }

    private String sign(String value) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.GeneralSecurityException exception) {
            throw new IllegalStateException("Unable to sign JWT", exception);
        }
    }

    private String base64Url(String value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    private String json(String value) {
        return "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"") + "\"";
    }

    private String extractString(String payload, String claim) {
        String marker = "\"" + claim + "\":\"";
        int start = payload.indexOf(marker);
        if (start < 0) {
            throw new AuthenticationException("Access token missing claim: " + claim);
        }
        int valueStart = start + marker.length();
        int valueEnd = payload.indexOf('"', valueStart);
        if (valueEnd < 0) {
            throw new AuthenticationException("Access token has invalid claim: " + claim);
        }
        return payload.substring(valueStart, valueEnd);
    }

    private long extractLong(String payload, String claim) {
        String marker = "\"" + claim + "\":";
        int start = payload.indexOf(marker);
        if (start < 0) {
            throw new AuthenticationException("Access token missing claim: " + claim);
        }
        int valueStart = start + marker.length();
        int valueEnd = payload.indexOf(',', valueStart);
        if (valueEnd < 0) {
            valueEnd = payload.indexOf('}', valueStart);
        }
        if (valueEnd < 0) {
            throw new AuthenticationException("Access token has invalid claim: " + claim);
        }
        return Long.parseLong(payload.substring(valueStart, valueEnd));
    }
}
