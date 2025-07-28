package br.dev.mission.simplewallet.service.account;

import br.dev.mission.simplewallet.dto.account.AccountRequest;
import br.dev.mission.simplewallet.dto.account.AccountResponse;
import br.dev.mission.simplewallet.mapper.account.AccountMapper;
import br.dev.mission.simplewallet.model.Account;
import br.dev.mission.simplewallet.repository.account.AccountRepository;
import br.dev.mission.simplewallet.repository.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AccountService {
    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private AccountMapper accountMapper;
    @Autowired
    private UserRepository userRepository;

    public AccountResponse create(AccountRequest request, String userId) {
        Account account = accountMapper.toEntity(request, userId);
        return accountMapper.toResponse(accountRepository.save(account));
    }

    public List<AccountResponse> findByUserId(String userId) {
        return accountRepository.findByUserId(userId).stream().map(accountMapper::toResponse).toList();
    }

    public List<AccountResponse> findAllForFamily(String userId) {
        // Criar lista com o userId atual
        List<String> userIds = new java.util.ArrayList<>();
        userIds.add(userId);
        
        // Buscar todos os filhos (usuários que têm este usuário como parent) e adicionar à lista
        List<String> childrenIds = userRepository.findByParentId(UUID.fromString(userId))
                .stream()
                .map(user -> user.getId().toString())
                .toList();
        userIds.addAll(childrenIds);
        
        // Buscar todas as contas em uma única consulta
        List<Account> accounts = accountRepository.findByUserIdIn(userIds);
        
        return accounts.stream().map(accountMapper::toResponse).toList();
    }

    public Optional<AccountResponse> findById(Long id, String userId) {
        return accountRepository.findById(id)
                .filter(acc -> acc.getUserId().equals(userId))
                .map(accountMapper::toResponse);
    }

    public Optional<AccountResponse> update(Long id, AccountRequest request, String userId) {
        return accountRepository.findById(id)
                .filter(acc -> acc.getUserId().equals(userId))
                .map(acc -> {
                    accountMapper.updateEntity(acc, request);
                    return accountMapper.toResponse(accountRepository.save(acc));
                });
    }

    public boolean delete(Long id, String userId) {
        return accountRepository.findById(id)
                .filter(acc -> acc.getUserId().equals(userId))
                .map(acc -> {
                    accountRepository.delete(acc);
                    return true;
                }).orElse(false);
    }
}
