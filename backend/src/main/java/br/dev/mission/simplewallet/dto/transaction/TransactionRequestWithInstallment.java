package br.dev.mission.simplewallet.dto.transaction;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;

import br.dev.mission.simplewallet.util.LocalDateConverter;

public record TransactionRequestWithInstallment(
    @JsonFormat(pattern = LocalDateConverter.DATE_FORMAT) LocalDate dueDate,
    String description,
    BigDecimal amount,
    Integer type,
    @JsonFormat(pattern = LocalDateConverter.DATE_FORMAT) LocalDate effectiveDate,
    BigDecimal effectiveAmount,
    Long accountId,
    Long categoryId,
    Integer qtdeInstallments

) {}
