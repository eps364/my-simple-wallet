
package br.dev.mission.simplewallet.service.transaction;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import br.dev.mission.simplewallet.dto.transaction.TransactionEffectivationRequest;
import br.dev.mission.simplewallet.dto.transaction.TransactionRequest;
import br.dev.mission.simplewallet.dto.transaction.TransactionRequestWithInstallment;
import br.dev.mission.simplewallet.dto.transaction.TransactionResponse;
import br.dev.mission.simplewallet.exception.ForbiddenResourceException;
import br.dev.mission.simplewallet.mapper.transaction.TransactionMapper;
import br.dev.mission.simplewallet.model.Transaction;
import br.dev.mission.simplewallet.repository.account.AccountRepository;
import br.dev.mission.simplewallet.repository.category.CategoryRepository;
import br.dev.mission.simplewallet.repository.transaction.TransactionRepository;
import br.dev.mission.simplewallet.repository.user.UserRepository;

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
    @Autowired
    private UserRepository userRepository;

    public TransactionResponse create(TransactionRequest request, String userId) {
        if (!accountRepository.findById(request.accountId()).filter(acc -> acc.getUserId().equals(userId))
                .isPresent()) {
            throw new ForbiddenResourceException("Conta não pertence ao usuário logado");
        }
        if (!categoryRepository.findById(request.categoryId()).filter(cat -> cat.getUserId().equals(userId))
                .isPresent()) {
            throw new ForbiddenResourceException("Categoria não pertence ao usuário logado");
        }
        Transaction transaction = transactionMapper.toEntity(request, userId);
        return transactionMapper.toResponse(transactionRepository.save(transaction));
    }

    public Page<TransactionResponse> findByUserId(String userId, Pageable pageable) {
        return transactionRepository.findByUserId(userId, pageable).map(transactionMapper::toResponse);
    }

    public Page<TransactionResponse> findByUserIdWithChildren(String userId, Pageable pageable) {
        // Criar lista com o userId atual
        List<String> userIds = new java.util.ArrayList<>();
        userIds.add(userId);

        // Buscar todos os filhos (usuários que têm este usuário como parent) e
        // adicionar à lista
        List<String> childrenIds = userRepository.findByParentId(UUID.fromString(userId)).stream()
                .map(user -> user.getId().toString()).toList();
        userIds.addAll(childrenIds);

        // Buscar todas as transações paginadas
        return transactionRepository.findByUserIdIn(userIds, pageable).map(transactionMapper::toResponse);
    }

    public Optional<TransactionResponse> findById(Long id, String userId) {
        return transactionRepository.findById(id).filter(tx -> tx.getUserId().equals(userId))
                .map(transactionMapper::toResponse);
    }

    public Optional<TransactionResponse> update(Long id, TransactionRequest request, String userId) {
        if (!accountRepository.findById(request.accountId()).filter(acc -> acc.getUserId().equals(userId))
                .isPresent()) {
            throw new ForbiddenResourceException("Conta não pertence ao usuário logado");
        }
        if (!categoryRepository.findById(request.categoryId()).filter(cat -> cat.getUserId().equals(userId))
                .isPresent()) {
            throw new ForbiddenResourceException("Categoria não pertence ao usuário logado");
        }
        return transactionRepository.findById(id).filter(tx -> tx.getUserId().equals(userId)).map(tx -> {
            transactionMapper.updateEntity(tx, request);
            return transactionMapper.toResponse(transactionRepository.save(tx));
        });
    }

    public Optional<TransactionResponse> effective(Long id, TransactionEffectivationRequest request, String userId) {
        return transactionRepository.findById(id).filter(tx -> tx.getUserId().equals(userId)).map(tx -> {
            tx.setEffectiveDate(request.effectiveDate());
            tx.setEffectiveAmount(request.effectiveAmount());
            return transactionMapper.toResponse(transactionRepository.save(tx));
        });
    }

    public boolean delete(Long id, String userId) {
        return transactionRepository.findById(id).filter(tx -> tx.getUserId().equals(userId)).map(tx -> {
            transactionRepository.delete(tx);
            return true;
        }).orElse(false);
    }

    public List<TransactionResponse> installments(TransactionRequest request, Integer qtde, String userId,
            Long creditId) {
        List<TransactionResponse> installments = new ArrayList<>();
        LocalDate dueDateFirstInstallment = request.dueDate();

        for (int i = 0; i < qtde; i++) {

            LocalDate dueDateInstallment = dueDateFirstInstallment.plusMonths(i);

            TransactionRequest installmentRequest = new TransactionRequest(dueDateInstallment,
                    request.description() + " ID: " + creditId + " - " + (i + 1) + " de " + qtde, request.amount(),
                    request.type(), request.effectiveDate(), request.effectiveAmount(), request.accountId(),
                    request.categoryId());

            installments.add(transactionMapper
                    .toResponse(transactionRepository.save(transactionMapper.toEntity(installmentRequest, userId))));
        }

        return installments;
    }

    public List<TransactionResponse> createBatch(TransactionRequestWithInstallment request, String userId) {
        if (!accountRepository.findById(request.accountId()).filter(acc -> acc.getUserId().equals(userId))
                .isPresent()) {
            throw new ForbiddenResourceException("Conta não pertence ao usuário logado");
        }
        if (!categoryRepository.findById(request.categoryId()).filter(cat -> cat.getUserId().equals(userId))
                .isPresent()) {
            throw new ForbiddenResourceException("Categoria não pertence ao usuário logado");
        }

        List<TransactionResponse> installments = new ArrayList<>();
        LocalDate dueDateFirstInstallment = request.dueDate();

        for (int i = 0; i < request.qtdeInstallments(); i++) {

            LocalDate dueDateInstallment = dueDateFirstInstallment.plusMonths(i);

            TransactionRequest installmentRequest = new TransactionRequest(dueDateInstallment,
                    request.description() + " - " + (i + 1) + " de " + request.qtdeInstallments(), request.amount(),
                    request.type(), request.effectiveDate(), request.effectiveAmount(), request.accountId(),
                    request.categoryId());

            installments.add(transactionMapper
                    .toResponse(transactionRepository.save(transactionMapper.toEntity(installmentRequest, userId))));
        }

        return installments;

    }
}
