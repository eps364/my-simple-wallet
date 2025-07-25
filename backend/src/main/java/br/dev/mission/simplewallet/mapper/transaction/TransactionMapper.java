package br.dev.mission.simplewallet.mapper.transaction;

import br.dev.mission.simplewallet.dto.transaction.TransactionRequest;
import br.dev.mission.simplewallet.dto.transaction.TransactionResponse;
import br.dev.mission.simplewallet.model.Transaction;
import br.dev.mission.simplewallet.model.TransactionType;
import br.dev.mission.simplewallet.repository.account.AccountRepository;
import br.dev.mission.simplewallet.repository.category.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class TransactionMapper {
    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public Transaction toEntity(TransactionRequest request, String userId) {
        Transaction transaction = new Transaction();
        transaction.setDescription(request.description());
        transaction.setAmount(request.amount());
        transaction.setType(TransactionType.fromCode(request.type()));
        transaction.setDueDate(request.dueDate());
        transaction.setEffectiveDate(request.effectiveDate());
        transaction.setAccountId(request.accountId());
        transaction.setUserId(userId);
        transaction.setCategory(request.categoryId());
        transaction.setEffectiveAmount(request.effectiveAmount());
        return transaction;
    }

    public TransactionResponse toResponse(Transaction transaction) {
        String account = null;
        if (transaction.getAccountId() != null) {
            account = accountRepository.findById(transaction.getAccountId())
                .map(acc -> acc.getDescription())
                .orElse(null);
        }
        String category = null;
        if (transaction.getCategory() != null) {
            category = categoryRepository.findById(transaction.getCategory())
                .map(cat -> cat.getCategory())
                .orElse(null);
        }
        return new TransactionResponse(
            transaction.getId(),
            transaction.getDescription(),
            transaction.getAmount(),
            transaction.getType() != null ? transaction.getType().getCode() : null,
            transaction.getDueDate(),
            transaction.getEffectiveDate(),
            transaction.getEffectiveAmount(),
            transaction.getAccountId(),
            account,
            transaction.getCategory(),
            category
        );
    }

    public void updateEntity(Transaction transaction, TransactionRequest request) {
        transaction.setDescription(request.description());
        transaction.setAmount(request.amount());
        transaction.setType(TransactionType.fromCode(request.type()));
        transaction.setDueDate(request.dueDate());
        transaction.setEffectiveDate(request.effectiveDate());
        transaction.setAccountId(request.accountId());
        transaction.setCategory(request.categoryId());
        transaction.setEffectiveAmount(request.effectiveAmount());
    }
}
