package br.dev.mission.simplewallet.security;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {
    private final SecretKey key;
    private static final long EXPERATION_MS = 86400000;

    public JwtUtil(@Value("${JWT_SECRET}") String secret) {
        if (secret == null || secret.length() < 32) {
            throw new IllegalStateException("JWT_SECRET não definido ou muito curto (mínimo 32 caracteres)");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(String username) {
        JwtBuilder builder = Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPERATION_MS))
                .signWith(key);
        return builder.compact();
    }

    public String getUsernameFromToken(String token) {
        return Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token).getPayload().getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public long getExpirationInSeconds() {
        return EXPERATION_MS / 1000;
    }

    public String getExpirationDateISO() {
        return Instant.ofEpochMilli(System.currentTimeMillis() + EXPERATION_MS)
                .atZone(ZoneOffset.UTC)
                .format(DateTimeFormatter.ISO_INSTANT);
    }

    public String generateRefreshToken(String username) {
        // Por enquanto, vamos retornar um token simples
        // Em uma implementação real, você deveria usar um mecanismo separado
        return "refresh_" + username + "_" + System.currentTimeMillis();
    }
}
