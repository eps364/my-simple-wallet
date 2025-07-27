package br.dev.mission.simplewallet.repository.category;

import br.dev.mission.simplewallet.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByUserId(String userId);
    List<Category> findByUserIdIn(List<String> userIds);
}
