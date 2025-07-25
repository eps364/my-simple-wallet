package br.dev.mission.simplewallet.dto.account;

import java.math.BigDecimal;

public record AccountResponse(
    Long id,
    String description,
    BigDecimal balance,
    BigDecimal credit,
    Integer dueDate
) {}
