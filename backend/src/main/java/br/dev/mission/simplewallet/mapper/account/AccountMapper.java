package br.dev.mission.simplewallet.mapper.account;

import br.dev.mission.simplewallet.dto.account.AccountRequest;
import br.dev.mission.simplewallet.dto.account.AccountResponse;
import br.dev.mission.simplewallet.model.Account;
import org.springframework.stereotype.Component;

@Component
public class AccountMapper {
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
        return new AccountResponse(
            account.getId(),
            account.getDescription(),
            account.getBalance(),
            account.getCredit(),
            account.getDueDate()
        );
    }

    public void updateEntity(Account account, AccountRequest request) {
        account.setDescription(request.description());
        account.setBalance(request.balance());
        account.setCredit(request.credit());
        account.setDueDate(request.dueDate());
    }
}
