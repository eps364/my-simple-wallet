package br.dev.mission.simplewallet.repository.transaction;

import br.dev.mission.simplewallet.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserId(String userId);
    List<Transaction> findByUserIdIn(List<String> userIds);
    boolean existsByCategory(Long category);

    boolean existsByAccountId(Long accountId);
}
