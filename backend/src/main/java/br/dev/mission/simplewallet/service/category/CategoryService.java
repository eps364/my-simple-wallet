package br.dev.mission.simplewallet.service.category;

import br.dev.mission.simplewallet.dto.category.CategoryRequest;
import br.dev.mission.simplewallet.dto.category.CategoryResponse;
import br.dev.mission.simplewallet.mapper.category.CategoryMapper;
import br.dev.mission.simplewallet.model.Category;
import br.dev.mission.simplewallet.repository.category.CategoryRepository;
import br.dev.mission.simplewallet.repository.transaction.TransactionRepository;
import br.dev.mission.simplewallet.repository.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private CategoryMapper categoryMapper;
    @Autowired
    private TransactionRepository transactionRepository;
    @Autowired
    private UserRepository userRepository;

    public CategoryResponse create(CategoryRequest request, String userId) {
        Category category = categoryMapper.toEntity(request, userId);
        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    public List<CategoryResponse> findByUserId(String userId) {
        return categoryRepository.findByUserId(userId).stream().map(categoryMapper::toResponse).toList();
    }

    public List<CategoryResponse> findAllForFamily(String userId) {
        // Criar lista com o userId atual
        List<String> userIds = new java.util.ArrayList<>();
        userIds.add(userId);
        
        // Buscar todos os filhos (usuários que têm este usuário como parent) e adicionar à lista
        List<String> childrenIds = userRepository.findByParentId(UUID.fromString(userId))
                .stream()
                .map(user -> user.getId().toString())
                .toList();
        userIds.addAll(childrenIds);
        
        // Buscar todas as categorias em uma única consulta
        List<Category> categories = categoryRepository.findByUserIdIn(userIds);
        
        return categories.stream().map(categoryMapper::toResponse).toList();
    }

    public Optional<CategoryResponse> findById(Long id, String userId) {
        return categoryRepository.findById(id)
                .filter(cat -> cat.getUserId().equals(userId))
                .map(categoryMapper::toResponse);
    }

    public Optional<CategoryResponse> update(Long id, CategoryRequest request, String userId) {
        return categoryRepository.findById(id)
                .filter(cat -> cat.getUserId().equals(userId))
                .map(cat -> {
                    categoryMapper.updateEntity(cat, request);
                    return categoryMapper.toResponse(categoryRepository.save(cat));
                });
    }

    public boolean delete(Long id, String userId) {
        return categoryRepository.findById(id)
                .filter(cat -> cat.getUserId().equals(userId))
                .map(cat -> {
                    if (transactionRepository.existsByCategory(cat.getId())) {
                        throw new DataIntegrityViolationException("Não é possível remover a categoria pois existem transações vinculadas.");
                    }
                    categoryRepository.delete(cat);
                    return true;
                }).orElse(false);
    }
}
