package br.dev.mission.simplewallet.mapper.category;

import br.dev.mission.simplewallet.dto.category.CategoryRequest;
import br.dev.mission.simplewallet.dto.category.CategoryResponse;
import br.dev.mission.simplewallet.model.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {
    public Category toEntity(CategoryRequest request, String userId) {
        Category category = new Category();
        category.setCategory(request.category());
        category.setType(request.type());
        category.setUserId(userId);
        category.setColor(request.color());
        return category;
    }

    public CategoryResponse toResponse(Category category) {
        return new CategoryResponse(
            category.getId(),
            category.getCategory(),
            category.getType(),
            category.getColor()
        );
    }

    public void updateEntity(Category category, CategoryRequest request) {
        category.setCategory(request.category());
        if (request.color() != null) {
            category.setColor(request.color());
        }
    }
}
