package br.dev.mission.simplewallet.dto.user;

public record UserRequestUpdate(String id, String username, String email, String name) {
    public UserRequestUpdate {
        if (id != null)
            id = id.trim();
        if (username != null)
            username = username.trim();
        if (email != null)
            email = email.trim();
        if (name != null)
            name = name.trim();
    }
}
