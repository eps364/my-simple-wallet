package br.dev.mission.simplewallet.mapper.category;

import br.dev.mission.simplewallet.dto.category.CategoryRequest;
import br.dev.mission.simplewallet.dto.category.CategoryResponse;
import br.dev.mission.simplewallet.model.Category;
import br.dev.mission.simplewallet.repository.user.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {
    @Autowired
    private UserRepository userRepository;
    public Category toEntity(CategoryRequest request, String userId) {
        Category category = new Category();
        category.setCategory(request.category());
        category.setType(request.type());
        category.setUserId(userId);
        category.setColor(request.color());
        return category;
    }

    public CategoryResponse toResponse(Category category) {
        String username = null;
        if (category.getUserId() != null) {
            username = userRepository.findById(java.util.UUID.fromString(category.getUserId()))
                .map(user -> user.getUsername())
                .orElse(null);
        }
        return new CategoryResponse(
            category.getId(),
            category.getCategory(),
            category.getType(),
            category.getColor(),
            category.getUserId(),
            username
        );
    }

    public void updateEntity(Category category, CategoryRequest request) {
        category.setCategory(request.category());
        if (request.color() != null) {
            category.setColor(request.color());
        }
    }
}
