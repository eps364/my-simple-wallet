package br.dev.mission.simplewallet.dto.loan;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;

import br.dev.mission.simplewallet.util.LocalDateConverter;

public record LoanRequest(
    String description,
    BigDecimal amount,
    Integer type,
    @JsonFormat(pattern = LocalDateConverter.DATE_FORMAT) LocalDate dueDate,
    @JsonFormat(pattern = LocalDateConverter.DATE_FORMAT) LocalDate effectiveDate,
    Long accountId,
    Long categoryId,

    String descriptionLoan,
    Integer qtdeInstallments,
    BigDecimal amountLoan,
    BigDecimal effectiveAmountLoan,
    Integer typeLoan,
    @JsonFormat(pattern = LocalDateConverter.DATE_FORMAT) LocalDate dueDateLoan,
    @JsonFormat(pattern = LocalDateConverter.DATE_FORMAT) LocalDate effectiveDateLoan,
    Long accountIdLoan,
    Long categoryIdLoan
) {}
