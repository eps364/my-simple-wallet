package br.dev.mission.simplewallet.dto.auth;

public record LoginResponse(
    String token,
    String refreshToken,
    long expiresIn,
    String expiresAt,
    String tokenType
) {}
