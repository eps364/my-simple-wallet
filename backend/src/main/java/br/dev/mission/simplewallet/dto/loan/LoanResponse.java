package br.dev.mission.simplewallet.dto.loan;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record LoanResponse(
    Long id,
    String description,
    BigDecimal amount,
    Integer type,
    LocalDate dueDate,
    LocalDate effectiveDate,
    BigDecimal effectiveAmount,
    Long accountId,
    String account,
    Long categoryId,
    String category,
    String userId,
    String username,
    List<InstallmentResponse> installments
) {
    public record InstallmentResponse(
        LocalDate dueDate,
        BigDecimal amount
    ) {}
}
