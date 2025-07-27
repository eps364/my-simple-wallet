package br.dev.mission.simplewallet.mapper.account;

import br.dev.mission.simplewallet.dto.account.AccountRequest;
import br.dev.mission.simplewallet.dto.account.AccountResponse;
import br.dev.mission.simplewallet.model.Account;
import br.dev.mission.simplewallet.repository.user.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class AccountMapper {
    @Autowired
    private UserRepository userRepository;
    public Account toEntity(AccountRequest request, String userId) {
        Account account = new Account();
        account.setDescription(request.description());
        account.setBalance(request.balance());
        account.setCredit(request.credit());
        account.setDueDate(request.dueDate());
        account.setUserId(userId);
        return account;
    }

    public AccountResponse toResponse(Account account) {
        String username = null;
        if (account.getUserId() != null) {
            username = userRepository.findById(java.util.UUID.fromString(account.getUserId()))
                .map(user -> user.getUsername())
                .orElse(null);
        }
        return new AccountResponse(
            account.getId(),
            account.getDescription(),
            account.getBalance(),
            account.getCredit(),
            account.getDueDate(),
            account.getUserId(),
            username
        );
    }

    public void updateEntity(Account account, AccountRequest request) {
        account.setDescription(request.description());
        account.setBalance(request.balance());
        account.setCredit(request.credit());
        account.setDueDate(request.dueDate());
    }
}
