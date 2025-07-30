package br.dev.mission.simplewallet.controller.loan;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.dev.mission.simplewallet.dto.ApiResponse;
import br.dev.mission.simplewallet.dto.loan.LoanRequest;
import br.dev.mission.simplewallet.dto.loan.LoanResponse;
import br.dev.mission.simplewallet.repository.user.UserRepository;
import br.dev.mission.simplewallet.service.loan.LoanService;

@RestController
@RequestMapping("/api/loan")
public class LoanController {

    @Autowired
    private LoanService loanService;

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
    public ResponseEntity<ApiResponse<LoanResponse>> createLoan(@RequestBody LoanRequest request) {
        String userId = getLoggedUserId();
        System.out.println("User ID: " + userId);
        LoanResponse response = loanService.createLoan(request, userId);
        return ResponseEntity.ok(new ApiResponse<>(201, "Transação criada com sucesso", response));
    }
}
