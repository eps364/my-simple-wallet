package br.dev.mission.simplewallet.repository.transaction;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.dev.mission.simplewallet.model.Transaction;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Page<Transaction> findByUserId(String userId, Pageable pageable);

    Page<Transaction> findByUserIdIn(List<String> userIds, Pageable pageable);

    boolean existsByCategory(Long category);

    boolean existsByAccountId(Long accountId);

    @Query("SELECT t FROM Transaction t WHERE t.userId IN (:userIds) " +
            "AND ((t.effectiveDate >= :startDate AND t.effectiveDate <= :endDate) OR " +
            "(t.dueDate >= :startDate AND t.dueDate <= :endDate AND t.effectiveDate IS NULL))")
    Page<Transaction> transactionInMonth(@Param("userIds") List<String> userIds,
            @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate, Pageable pageable);

}
