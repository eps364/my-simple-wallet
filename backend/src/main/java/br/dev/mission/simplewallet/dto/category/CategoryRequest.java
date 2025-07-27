package br.dev.mission.simplewallet.dto.category;

import br.dev.mission.simplewallet.model.TransactionType;

public record CategoryRequest(
    String category, 
    TransactionType type,
    String color
) {}
