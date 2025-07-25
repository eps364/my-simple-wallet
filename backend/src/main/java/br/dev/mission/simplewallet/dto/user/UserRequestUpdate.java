package br.dev.mission.simplewallet.dto.user;

public record UserRequestUpdate(String id, String username, String email) {
    public UserRequestUpdate {
        if (id != null)
            id = id.trim();
        if (username != null)
            username = username.trim();
        if (email != null)
            email = email.trim();
    }
}
