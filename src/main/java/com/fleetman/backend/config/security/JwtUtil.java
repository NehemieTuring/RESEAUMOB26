package com.fleetman.backend.config.security;

import com.fleetman.backend.controller.dto.UserDetail;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration-ms}")
    private long expirationMs;

    @Value("${app.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    private SecretKey key() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(UserDetail user) {
        return build(user, expirationMs);
    }

    public String generateRefreshToken(UserDetail user) {
        return build(user, refreshExpirationMs);
    }

    private String build(UserDetail user, long ttl) {
        Date now = new Date();
        return Jwts.builder()
                .subject(user.id().toString())
                .claim("roles", user.roles())
                .claim("email", user.email())
                .claim("firstName", user.firstName())
                .claim("lastName", user.lastName())
                .issuedAt(now)
                .expiration(new Date(now.getTime() + ttl))
                .signWith(key())
                .compact();
    }

    private Claims parse(String token) {
        return Jwts.parser().verifyWith(key()).build().parseSignedClaims(token).getPayload();
    }

    public UUID extractUserId(String token) {
        return UUID.fromString(parse(token).getSubject());
    }

    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) {
        Object roles = parse(token).get("roles");
        return roles instanceof List ? (List<String>) roles : List.of();
    }

    public boolean isValid(String token) {
        try {
            parse(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
