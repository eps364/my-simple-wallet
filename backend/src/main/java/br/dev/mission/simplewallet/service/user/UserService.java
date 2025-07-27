package br.dev.mission.simplewallet.service.user;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.dev.mission.simplewallet.dto.user.UserRequestCreate;
import br.dev.mission.simplewallet.dto.user.UserRequestUpdate;
import br.dev.mission.simplewallet.dto.user.UserRequestUpdateParent;
import br.dev.mission.simplewallet.dto.user.UserRequestUpdatePassword;
import br.dev.mission.simplewallet.dto.user.UserResponse;
import br.dev.mission.simplewallet.mapper.user.UserMapper;
import br.dev.mission.simplewallet.model.User;
import br.dev.mission.simplewallet.repository.user.UserRepository;

@Service
public class UserService {

    @Autowired
    UserMapper userMapper;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public UserResponse save(UserRequestCreate newUser) {
        User savedUser = userMapper.toEntity(newUser);
        return userMapper.toResponse(userRepository.save(savedUser));
    }

    @Transactional
    public UserResponse update(UserRequestUpdate updateUser) {
        User savedUser = userRepository.findById(UUID.fromString(updateUser.id()))
                .orElseThrow(() -> new IllegalArgumentException(""));
        savedUser.setUsername(updateUser.username());
        savedUser.setEmail(updateUser.email());
        savedUser.setNome(updateUser.name());

        return userMapper.toResponse(userRepository.save(savedUser));
    }

    public UserResponse updatePassword(UserRequestUpdatePassword updateUser) {
        User savedUser = userRepository.findById(UUID.fromString(updateUser.id()))
                .orElseThrow(() -> new IllegalArgumentException(""));
        savedUser.setPassword(updateUser.password()); // Listener faz o hash
        return userMapper.toResponse(userRepository.save(savedUser));
    }

    public UserResponse updateParent(UserRequestUpdateParent updateUser) {
        User savedUser = userRepository.findById(UUID.fromString(updateUser.id()))
                .orElseThrow(() -> new IllegalArgumentException(""));

        if (updateUser.parentId() != null) {
            if (savedUser.getId().equals(updateUser.parentId())) {
                throw new IllegalArgumentException("User cannot be its own parent");
            }
            savedUser.setParentId(updateUser.parentId());
        } else {
            savedUser.setParentId(null);
        }
        return userMapper.toResponse(userRepository.save(savedUser));
    }

    @Transactional(readOnly = true)
    public Optional<UserResponse> findByEmail(String email) {
        return Optional.ofNullable(userMapper.toResponse(userRepository.findByEmail(email).orElse(null)));
    }

    @Transactional(readOnly = true)
    public Optional<UserResponse> findByUsername(String username) {
        return Optional.ofNullable(userMapper.toResponse(userRepository.findByUsername(username).orElse(null)));
    }

    @Transactional(readOnly = true)
    public List<UserResponse> findAllByParentId(UUID parentId) {
        return userRepository.findByParentId(parentId).stream().map(userMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public Optional<UserResponse> findById(String id) {
        return Optional.ofNullable(userMapper.toResponse(userRepository.findById(UUID.fromString(id)).orElse(null)));
    }
}
