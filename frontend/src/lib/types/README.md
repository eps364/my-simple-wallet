# Types Documentation

Esta pasta contém todos os tipos TypeScript organizados por domínio da aplicação.

## Estrutura

```text
types/
├── index.ts          # Exportações centrais
├── api.ts           # Tipos de API e respostas
├── auth.ts          # Tipos de autenticação
├── user.ts          # Tipos de usuário
├── account.ts       # Tipos de conta
├── transaction.ts   # Tipos de transação
└── category.ts      # Tipos de categoria
```

## Como usar

### Importação simples (recomendado)

```typescript
import { User, Transaction, ApiResponse } from '@/lib/types';
```

### Importação específica por módulo

```typescript
import { User } from '@/lib/types/user';
import { Transaction } from '@/lib/types/transaction';
```

## Convenções

- **Interfaces principais**: Representam entidades do domínio
- **Request types**: Sufixo `Request` para dados enviados à API
- **Response types**: Sufixo `Response` para dados recebidos da API
- **Enums**: Para valores fixos (ex: `TransactionType`, `AccountType`)
- **Filtros**: Para parâmetros de busca e filtros

## Exemplos de uso

### Criando uma transação

```typescript
const newTransaction: TransactionCreateRequest = {
  description: "Compra supermercado",
  amount: 150.50,
  type: TransactionType.EXPENSE,
  accountId: 1,
  date: "2025-07-26"
};
```

### Trabalhando com categorias

```typescript
const category: CategoryCreateRequest = {
  name: "Alimentação",
  color: CATEGORY_COLORS[0], // Vermelho
  description: "Gastos com comida"
};
```
