package br.dev.mission.simplewallet.service.account;

import br.dev.mission.simplewallet.dto.account.AccountRequest;
import br.dev.mission.simplewallet.dto.account.AccountResponse;
import br.dev.mission.simplewallet.mapper.account.AccountMapper;
import br.dev.mission.simplewallet.model.Account;
import br.dev.mission.simplewallet.repository.account.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AccountService {
    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private AccountMapper accountMapper;

    public AccountResponse create(AccountRequest request, String userId) {
        Account account = accountMapper.toEntity(request, userId);
        return accountMapper.toResponse(accountRepository.save(account));
    }

    public List<AccountResponse> findByUserId(String userId) {
        return accountRepository.findByUserId(userId).stream().map(accountMapper::toResponse).toList();
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
