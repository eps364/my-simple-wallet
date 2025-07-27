package br.dev.mission.simplewallet.mapper.user;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import br.dev.mission.simplewallet.dto.user.UserRequestCreate;
import br.dev.mission.simplewallet.dto.user.UserRequestUpdate;
import br.dev.mission.simplewallet.dto.user.UserRequestUpdateParent;
import br.dev.mission.simplewallet.dto.user.UserRequestUpdatePassword;
import br.dev.mission.simplewallet.dto.user.UserResponse;
import br.dev.mission.simplewallet.model.User;

@Component
public class UserMapper {
    private static final UserMapper INSTANCE = new UserMapper();

    public static UserMapper getInstance() {
        return INSTANCE;
    }

    private UserMapper() {
    }

    public User toEntity(UserRequestCreate dto) {
        User user = new User();
        user.setUsername(dto.username());
        user.setEmail(dto.email());
        user.setNome(dto.name());
        user.setPassword(dto.password());
        user.setParentId(null); 
        return user;
    }

    public User toEntity(UserRequestUpdate dto) {
        User user = new User();
        user.setId(dto.id() == null ? null : UUID.fromString(dto.id()));
        user.setUsername(dto.username());
        user.setEmail(dto.email());
        user.setNome(dto.name());
        return user;
    }

    public User toEntity(UserRequestUpdatePassword dto) {
        User user = new User();
        user.setId(dto.id() == null ? null : UUID.fromString(dto.id()));
        user.setPassword(dto.password());
        return user;
    }

    public User toEntity(UserRequestUpdateParent dto) {
        User user = new User();
        user.setId(dto.id() == null ? null : UUID.fromString(dto.id()));
        if (dto.parentId() != null) {
            if (user.getId().equals(dto.parentId())) {
                throw new IllegalArgumentException("User cannot be its own parent");
            }
            user.setParentId(dto.parentId());
        } else {
            user.setParentId(null);
        }
        return user;
    }

    public UserResponse toResponse(User user) {
        return new UserResponse(
            user.getId() != null ? user.getId().toString() : null,
            user.getUsername(),
            user.getEmail(),
            user.getNome(),
            user.getParentId()
        );
    }

    public List<UserResponse> toResponseList(List<User> users) {
        return users.stream().map(this::toResponse).collect(Collectors.toList());
    }
}
