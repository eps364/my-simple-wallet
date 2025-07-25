package br.dev.mission.simplewallet.service.transaction;

import br.dev.mission.simplewallet.dto.transaction.TransactionEffectivationRequest;
import br.dev.mission.simplewallet.dto.transaction.TransactionRequest;
import br.dev.mission.simplewallet.dto.transaction.TransactionResponse;
import br.dev.mission.simplewallet.exception.ForbiddenResourceException;
import br.dev.mission.simplewallet.mapper.transaction.TransactionMapper;
import br.dev.mission.simplewallet.model.Transaction;
import br.dev.mission.simplewallet.repository.account.AccountRepository;
import br.dev.mission.simplewallet.repository.category.CategoryRepository;
import br.dev.mission.simplewallet.repository.transaction.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TransactionService {
    @Autowired
    private TransactionRepository transactionRepository;
    @Autowired
    private TransactionMapper transactionMapper;
    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private CategoryRepository categoryRepository;

    public TransactionResponse create(TransactionRequest request, String userId) {
        if (!accountRepository.findById(request.accountId()).filter(acc -> acc.getUserId().equals(userId)).isPresent()) {
            throw new ForbiddenResourceException("Conta não pertence ao usuário logado");
        }
        if (!categoryRepository.findById(request.categoryId()).filter(cat -> cat.getUserId().equals(userId)).isPresent()) {
            throw new ForbiddenResourceException("Categoria não pertence ao usuário logado");
        }
        Transaction transaction = transactionMapper.toEntity(request, userId);
        return transactionMapper.toResponse(transactionRepository.save(transaction));
    }

    public List<TransactionResponse> findByUserId(String userId) {
        return transactionRepository.findByUserId(userId).stream().map(transactionMapper::toResponse).toList();
    }

    public Optional<TransactionResponse> findById(Long id, String userId) {
        return transactionRepository.findById(id)
                .filter(tx -> tx.getUserId().equals(userId))
                .map(transactionMapper::toResponse);
    }

    public Optional<TransactionResponse> update(Long id, TransactionRequest request, String userId) {
        if (!accountRepository.findById(request.accountId()).filter(acc -> acc.getUserId().equals(userId)).isPresent()) {
            throw new ForbiddenResourceException("Conta não pertence ao usuário logado");
        }
        if (!categoryRepository.findById(request.categoryId()).filter(cat -> cat.getUserId().equals(userId)).isPresent()) {
            throw new ForbiddenResourceException("Categoria não pertence ao usuário logado");
        }
        return transactionRepository.findById(id)
                .filter(tx -> tx.getUserId().equals(userId))
                .map(tx -> {
                    transactionMapper.updateEntity(tx, request);
                    return transactionMapper.toResponse(transactionRepository.save(tx));
                });
    }

    public Optional<TransactionResponse> effective(Long id, TransactionEffectivationRequest request, String userId) {
        return transactionRepository.findById(id)
                .filter(tx -> tx.getUserId().equals(userId))
                .map(tx -> {
                    tx.setEffectiveDate(request.effectiveDate());
                    tx.setEffectiveAmount(request.effectiveAmount());
                    return transactionMapper.toResponse(transactionRepository.save(tx));
                });
    }

    public boolean delete(Long id, String userId) {
        return transactionRepository.findById(id)
                .filter(tx -> tx.getUserId().equals(userId))
                .map(tx -> {
                    transactionRepository.delete(tx);
                    return true;
                }).orElse(false);
    }
}
