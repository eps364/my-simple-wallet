package br.dev.mission.simplewallet.controller.transaction;

import br.dev.mission.simplewallet.dto.ApiResponse;
import br.dev.mission.simplewallet.dto.transaction.TransactionEffectivationRequest;
import br.dev.mission.simplewallet.dto.transaction.TransactionRequest;
import br.dev.mission.simplewallet.dto.transaction.TransactionResponse;
import br.dev.mission.simplewallet.service.transaction.TransactionService;
import br.dev.mission.simplewallet.repository.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {
    @Autowired
    private TransactionService transactionService;
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
    public ResponseEntity<ApiResponse<TransactionResponse>> create(@RequestBody TransactionRequest request) {
        String userId = getLoggedUserId();
        TransactionResponse response = transactionService.create(request, userId);
        return ResponseEntity.ok(new ApiResponse<>(201, "Transação criada com sucesso", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> list() {
        String userId = getLoggedUserId();
        List<TransactionResponse> transactions = transactionService.findByUserId(userId);
        return ResponseEntity.ok(new ApiResponse<>(200, "Transações encontradas", transactions));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionResponse>> getById(@PathVariable Long id) {
        String userId = getLoggedUserId();
        return transactionService.findById(id, userId)
                .map(tx -> ResponseEntity.ok(new ApiResponse<>(200, "Transação encontrada", tx)))
                .orElse(ResponseEntity.ok(new ApiResponse<>(404, "Transação não encontrada", null)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionResponse>> update(@PathVariable Long id, @RequestBody TransactionRequest request) {
        String userId = getLoggedUserId();
        return transactionService.update(id, request, userId)
                .map(tx -> ResponseEntity.ok(new ApiResponse<>(200, "Transação atualizada", tx)))
                .orElse(ResponseEntity.ok(new ApiResponse<>(404, "Transação não encontrada", null)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        String userId = getLoggedUserId();
        boolean deleted = transactionService.delete(id, userId);
        if (deleted) {
            return ResponseEntity.ok(new ApiResponse<>(200, "Transação removida com sucesso", null));
        } else {
            return ResponseEntity.ok(new ApiResponse<>(404, "Transação não encontrada", null));
        }
    }

    @PatchMapping("/{id}/effective")
    public ResponseEntity<ApiResponse<TransactionResponse>> effective(@PathVariable Long id, @RequestBody TransactionEffectivationRequest request) {
        String userId = getLoggedUserId();
        return transactionService.effective(id, request, userId)
                .map(tx -> ResponseEntity.ok(new ApiResponse<>(200, "Transação efetivada com sucesso", tx)))
                .orElse(ResponseEntity.ok(new ApiResponse<>(404, "Transação não encontrada", null)));
    }
}
