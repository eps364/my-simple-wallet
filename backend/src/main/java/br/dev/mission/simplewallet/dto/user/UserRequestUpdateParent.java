package br.dev.mission.simplewallet.dto.user;

import java.util.UUID;

public record UserRequestUpdateParent(String id, UUID parentId) {

}
