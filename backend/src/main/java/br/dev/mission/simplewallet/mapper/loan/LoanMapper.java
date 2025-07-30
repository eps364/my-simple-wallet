package br.dev.mission.simplewallet.mapper.loan;

import org.springframework.stereotype.Component;

import br.dev.mission.simplewallet.dto.loan.LoanRequest;
import br.dev.mission.simplewallet.dto.transaction.TransactionRequest;
import br.dev.mission.simplewallet.model.Transaction;
import br.dev.mission.simplewallet.model.TransactionType;

@Component
public class LoanMapper {

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

    public TransactionRequest toTransactionRequest(LoanRequest loan) {
        return new TransactionRequest(
            loan.dueDate(),
            loan.description(),
            loan.amount(),
            loan.type(),
            loan.effectiveDate(),
            loan.amount(),
            loan.accountId(),
            loan.categoryId()
        );
    }

    public TransactionRequest toTransactionRequestInstallment(LoanRequest loan) {
        return new TransactionRequest(
            loan.dueDateLoan(),
            loan.descriptionLoan(),
            loan.amountInstallment(),
            loan.typeLoan(),
            null,
            loan.amountInstallment(),
            loan.accountIdLoan(),
            loan.categoryIdLoan()
        );
    }

    
}