package br.dev.mission.simplewallet.controller.account;

import br.dev.mission.simplewallet.dto.ApiResponse;
import br.dev.mission.simplewallet.dto.account.AccountRequest;
import br.dev.mission.simplewallet.dto.account.AccountResponse;
import br.dev.mission.simplewallet.service.account.AccountService;
import br.dev.mission.simplewallet.repository.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {
    @Autowired
    private AccountService accountService;
    @Autowired
    private UserRepository userRepository;

    private String getLoggedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .map(user -> user.getId().toString())
                .orElseThrow(() -> new RuntimeException("Usuário autenticado não encontrado"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AccountResponse>> create(@RequestBody AccountRequest request) {
        String userId = getLoggedUserId();
        AccountResponse response = accountService.create(request, userId);
        return ResponseEntity.ok(new ApiResponse<>(201, "Conta criada com sucesso", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AccountResponse>>> list() {
        String userId = getLoggedUserId();
        List<AccountResponse> accounts = accountService.findByUserId(userId);
        return ResponseEntity.ok(new ApiResponse<>(200, "Contas encontradas", accounts));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AccountResponse>> getById(@PathVariable Long id) {
        String userId = getLoggedUserId();
        return accountService.findById(id, userId)
                .map(acc -> ResponseEntity.ok(new ApiResponse<>(200, "Conta encontrada", acc)))
                .orElse(ResponseEntity.ok(new ApiResponse<>(404, "Conta não encontrada", null)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AccountResponse>> update(@PathVariable Long id, @RequestBody AccountRequest request) {
        String userId = getLoggedUserId();
        return accountService.update(id, request, userId)
                .map(acc -> ResponseEntity.ok(new ApiResponse<>(200, "Conta atualizada", acc)))
                .orElse(ResponseEntity.ok(new ApiResponse<>(404, "Conta não encontrada", null)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        String userId = getLoggedUserId();
        boolean deleted = accountService.delete(id, userId);
        if (deleted) {
            return ResponseEntity.ok(new ApiResponse<>(200, "Conta removida com sucesso", null));
        } else {
            return ResponseEntity.ok(new ApiResponse<>(404, "Conta não encontrada", null));
        }
    }
}
