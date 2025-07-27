package br.dev.mission.simplewallet.dto.user;

import java.util.UUID;

public record UserResponse(String id, String username, String email, String name, UUID parentId) {
}
