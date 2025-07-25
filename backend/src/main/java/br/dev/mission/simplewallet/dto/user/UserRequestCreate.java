package br.dev.mission.simplewallet.dto.user;

public record UserRequestCreate(
    String username, 
    String email,
    String password) {
}
