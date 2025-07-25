package br.dev.mission.simplewallet.controller.category;

import br.dev.mission.simplewallet.dto.ApiResponse;
import br.dev.mission.simplewallet.dto.category.CategoryRequest;
import br.dev.mission.simplewallet.dto.category.CategoryResponse;
import br.dev.mission.simplewallet.service.category.CategoryService;
import br.dev.mission.simplewallet.repository.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    @Autowired
    private CategoryService categoryService;
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
    public ResponseEntity<ApiResponse<CategoryResponse>> create(@RequestBody CategoryRequest request) {
        String userId = getLoggedUserId();
        CategoryResponse response = categoryService.create(request, userId);
        return ResponseEntity.ok(new ApiResponse<>(201, "Categoria criada com sucesso", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> list() {
        String userId = getLoggedUserId();
        List<CategoryResponse> categories = categoryService.findByUserId(userId);
        return ResponseEntity.ok(new ApiResponse<>(200, "Categorias encontradas", categories));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getById(@PathVariable Long id) {
        String userId = getLoggedUserId();
        return categoryService.findById(id, userId)
                .map(cat -> ResponseEntity.ok(new ApiResponse<>(200, "Categoria encontrada", cat)))
                .orElse(ResponseEntity.ok(new ApiResponse<>(404, "Categoria não encontrada", null)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> update(@PathVariable Long id, @RequestBody CategoryRequest request) {
        String userId = getLoggedUserId();
        return categoryService.update(id, request, userId)
                .map(cat -> ResponseEntity.ok(new ApiResponse<>(200, "Categoria atualizada", cat)))
                .orElse(ResponseEntity.ok(new ApiResponse<>(404, "Categoria não encontrada", null)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        String userId = getLoggedUserId();
        boolean deleted = categoryService.delete(id, userId);
        if (deleted) {
            return ResponseEntity.ok(new ApiResponse<>(200, "Categoria removida com sucesso", null));
        } else {
            return ResponseEntity.ok(new ApiResponse<>(404, "Categoria não encontrada", null));
        }
    }
}
