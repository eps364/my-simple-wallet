package br.dev.mission.simplewallet.dto.category;

import br.dev.mission.simplewallet.model.TransactionType;

public record CategoryResponse(
    Long id, 
    String category, 
    TransactionType type
) {}
