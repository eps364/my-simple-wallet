package br.dev.mission.simplewallet.repository.account;

import br.dev.mission.simplewallet.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByUserId(String userId);
    List<Account> findByUserIdIn(List<String> userIds);
}
