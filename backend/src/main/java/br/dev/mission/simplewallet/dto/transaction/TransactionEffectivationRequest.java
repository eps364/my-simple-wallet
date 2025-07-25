package br.dev.mission.simplewallet.dto.transaction;

import java.math.BigDecimal;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonFormat;

import br.dev.mission.simplewallet.util.LocalDateConverter;

public record TransactionEffectivationRequest(
    @JsonFormat(pattern = LocalDateConverter.DATE_FORMAT) LocalDate effectiveDate,
    BigDecimal effectiveAmount
) {}
