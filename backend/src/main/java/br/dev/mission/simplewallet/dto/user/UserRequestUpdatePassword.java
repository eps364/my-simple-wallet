package br.dev.mission.simplewallet.dto.user;

public record UserRequestUpdatePassword(String id, String password) {
    public UserRequestUpdatePassword {
        if (id != null)
            id = id.trim();
        if (password != null)
            password = password.trim();
    }
}
