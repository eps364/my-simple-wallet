package br.dev.mission.simplewallet.service.loan;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.dev.mission.simplewallet.dto.loan.LoanRequest;
import br.dev.mission.simplewallet.dto.loan.LoanResponse;
import br.dev.mission.simplewallet.dto.transaction.TransactionResponse;
import br.dev.mission.simplewallet.mapper.loan.LoanMapper;
import br.dev.mission.simplewallet.service.transaction.TransactionService;

@Service
public class LoanService {

    @Autowired
    TransactionService transactionService;

    @Autowired
    LoanMapper loanMapper;

    public LoanResponse createLoan(LoanRequest request, String userId) {

        TransactionResponse creditInAccount = transactionService.create(loanMapper.toTransactionRequest(request), userId);

        List<TransactionResponse> installments = transactionService.installments(
            loanMapper.toTransactionRequestInstallment(request), 
            request.qtdeInstallments(),
            userId);

        return new LoanResponse(
            creditInAccount.id(), 
            creditInAccount.description(),
            creditInAccount.amount(), 
            creditInAccount.type(), 
            creditInAccount.dueDate(), 
            creditInAccount.effectiveDate(),
            creditInAccount.effectiveAmount(),
            creditInAccount.accountId(), 
            creditInAccount.account(),
            creditInAccount.categoryId(),
            creditInAccount.category(),
            creditInAccount.userId(), 
            creditInAccount.username(), 
            installments.stream()
                .map(installment -> new LoanResponse.InstallmentResponse(
                    installment.dueDate(), 
                    installment.amount()))
                .toList()
        );
    }
}
