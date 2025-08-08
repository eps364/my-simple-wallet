package br.dev.mission.simplewallet.repository.transaction;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.dev.mission.simplewallet.model.Transaction;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Page<Transaction> findByUserId(String userId, Pageable pageable);

    Page<Transaction> findByUserIdIn(List<String> userIds, Pageable pageable);

    boolean existsByCategory(Long category);

    boolean existsByAccountId(Long accountId);
}
