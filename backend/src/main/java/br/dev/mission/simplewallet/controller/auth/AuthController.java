package br.dev.mission.simplewallet.controller.auth;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

import br.dev.mission.simplewallet.dto.ApiResponse;
import br.dev.mission.simplewallet.dto.auth.LoginRequest;
import br.dev.mission.simplewallet.dto.auth.LoginResponse;
import br.dev.mission.simplewallet.dto.auth.RefreshRequest;
import br.dev.mission.simplewallet.dto.user.UserRequestCreate;
import br.dev.mission.simplewallet.dto.user.UserResponse;
import br.dev.mission.simplewallet.model.User;
import br.dev.mission.simplewallet.repository.user.UserRepository;
import br.dev.mission.simplewallet.security.JwtUtil;
import br.dev.mission.simplewallet.service.user.UserService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService, UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@RequestBody @Valid UserRequestCreate request) {
        UserResponse response = userService.save(request);
        ApiResponse<UserResponse> apiResponse = new ApiResponse<>(201, "Usuário registrado com sucesso", response);
        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<String>> login(@RequestBody @Valid LoginRequest request, HttpServletResponse response) {
        Optional<User> userOpt = userRepository.findByUsername(request.username());
        if (userOpt.isEmpty() || !passwordEncoder.matches(request.password(), userOpt.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponse<>(401, "Usuário ou senha inválidos", null));
        }
        
        User user = userOpt.get();
        String token = jwtUtil.generateToken(user.getUsername());
        String refreshToken = jwtUtil.generateRefreshToken(user.getUsername());
        
        // Criar cookie httpOnly para o token
        Cookie tokenCookie = new Cookie("token", token);
        tokenCookie.setHttpOnly(true);
        tokenCookie.setSecure(true); // Para HTTPS
        tokenCookie.setPath("/");
        tokenCookie.setMaxAge((int) jwtUtil.getExpirationInSeconds());
        response.addCookie(tokenCookie);
        
        // Criar cookie httpOnly para o refresh token
        Cookie refreshCookie = new Cookie("refreshToken", refreshToken);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(true);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(7 * 24 * 60 * 60); // 7 dias
        response.addCookie(refreshCookie);
        
        return ResponseEntity.ok(new ApiResponse<>(200, "Login realizado com sucesso", "Autenticado"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<String>> refresh(@RequestBody RefreshRequest request, HttpServletResponse response) {
        // Validação básica do refresh token
        if (request.refreshToken() == null || request.refreshToken().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(400, "Refresh token é obrigatório", null));
        }

        // Extrai o username do refresh token (formato: refresh_username_timestamp)
        try {
            String[] parts = request.refreshToken().split("_");
            if (parts.length < 3 || !parts[0].equals("refresh")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(401, "Refresh token inválido", null));
            }
            
            String username = parts[1];
            
            // Verifica se o usuário ainda existe
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(401, "Usuário não encontrado", null));
            }
            
            User user = userOpt.get();
            
            // Gera novos tokens
            String newToken = jwtUtil.generateToken(user.getUsername());
            String newRefreshToken = jwtUtil.generateRefreshToken(user.getUsername());
            
            // Criar novos cookies httpOnly
            Cookie tokenCookie = new Cookie("token", newToken);
            tokenCookie.setHttpOnly(true);
            tokenCookie.setSecure(true);
            tokenCookie.setPath("/");
            tokenCookie.setMaxAge((int) jwtUtil.getExpirationInSeconds());
            response.addCookie(tokenCookie);
            
            Cookie refreshCookie = new Cookie("refreshToken", newRefreshToken);
            refreshCookie.setHttpOnly(true);
            refreshCookie.setSecure(true);
            refreshCookie.setPath("/");
            refreshCookie.setMaxAge(7 * 24 * 60 * 60); // 7 dias
            response.addCookie(refreshCookie);
            
            return ResponseEntity.ok(new ApiResponse<>(200, "Token renovado com sucesso", "Token atualizado"));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponse<>(401, "Refresh token inválido", null));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(HttpServletResponse response) {
        // Limpar cookie do token
        Cookie tokenCookie = new Cookie("token", "");
        tokenCookie.setHttpOnly(true);
        tokenCookie.setSecure(true);
        tokenCookie.setPath("/");
        tokenCookie.setMaxAge(0); // Remove o cookie
        response.addCookie(tokenCookie);
        
        // Limpar cookie do refresh token
        Cookie refreshCookie = new Cookie("refreshToken", "");
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(true);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(0); // Remove o cookie
        response.addCookie(refreshCookie);
        
        return ResponseEntity.ok(new ApiResponse<>(200, "Logout realizado com sucesso", "Desconectado"));
    }
}
