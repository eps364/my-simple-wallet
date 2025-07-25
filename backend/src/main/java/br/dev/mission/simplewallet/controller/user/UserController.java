package br.dev.mission.simplewallet.controller.user;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.context.MessageSource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.dev.mission.simplewallet.dto.ApiResponse;
import br.dev.mission.simplewallet.dto.user.UserRequestUpdate;
import br.dev.mission.simplewallet.dto.user.UserRequestUpdateParent;
import br.dev.mission.simplewallet.dto.user.UserRequestUpdatePassword;
import br.dev.mission.simplewallet.dto.user.UserResponse;
import br.dev.mission.simplewallet.repository.user.UserRepository;
import br.dev.mission.simplewallet.service.user.UserService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final MessageSource messageSource;
    private final UserRepository userRepository;

    public UserController(UserService userService, MessageSource messageSource, UserRepository userRepository) {
        this.userService = userService;
        this.messageSource = messageSource;
        this.userRepository = userRepository;
    }

    private String getMessage(String code) {
        return messageSource.getMessage(code, null, Locale.getDefault());
    }

    private String getLoggedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .map(user -> user.getId().toString())
                .orElseThrow(() -> new RuntimeException("Usuário autenticado não encontrado"));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(@RequestBody @Valid UserRequestUpdate request) {
        String id = getLoggedUserId();
        UserRequestUpdate reqWithId = new UserRequestUpdate(id, request.username(), request.email());
        UserResponse response = userService.update(reqWithId);
        ApiResponse<UserResponse> apiResponse = new ApiResponse<>(200, getMessage("user.update.success"), response);
        return ResponseEntity.ok(apiResponse);
    }

    @PatchMapping("/me/parent")
    public ResponseEntity<ApiResponse<UserResponse>> updateParent(@RequestBody @Valid UserRequestUpdateParent request) {
        String id = getLoggedUserId();
        UserRequestUpdateParent reqWithId = new UserRequestUpdateParent(id, request.parentId());
        UserResponse response = userService.updateParent(reqWithId);
        ApiResponse<UserResponse> apiResponse = new ApiResponse<>(200, getMessage("user.parent.update.success"), response);
        return ResponseEntity.ok(apiResponse);
    }

    @PatchMapping("/me/password")
    public ResponseEntity<ApiResponse<UserResponse>> updatePassword(@RequestBody @Valid UserRequestUpdatePassword request) {
        String id = getLoggedUserId();
        UserRequestUpdatePassword reqWithId = new UserRequestUpdatePassword(id, request.password());
        UserResponse response = userService.updatePassword(reqWithId);
        ApiResponse<UserResponse> apiResponse = new ApiResponse<>(200, getMessage("user.password.update.success"), response);
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/me/parent")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllByLoggedUserAsParent() {
        UUID parentId = UUID.fromString(getLoggedUserId());
        List<UserResponse> users = userService.findAllByParentId(parentId);
        ApiResponse<List<UserResponse>> apiResponse = new ApiResponse<>(200, getMessage("user.list.success"), users);
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getById(@PathVariable String id) {
        return userService.findById(id)
                .map(user -> ResponseEntity.ok(new ApiResponse<>(200, getMessage("user.found.success"), user)))
                .orElse(ResponseEntity.ok(new ApiResponse<>(404, getMessage("user.notfound"), null)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMe() {
        String id = getLoggedUserId();
        return userService.findById(id)
                .map(user -> ResponseEntity.ok(new ApiResponse<>(200, getMessage("user.found.success"), user)))
                .orElse(ResponseEntity.ok(new ApiResponse<>(404, getMessage("user.notfound"), null)));
    }
}
