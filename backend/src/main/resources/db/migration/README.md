# Database Migration Scripts

Este diretório contém os scripts de migração do banco de dados PostgreSQL para o Simple Wallet.

## Estrutura das Migrações

### V001__create_users_table.sql
- Cria a tabela `tb_users` para armazenar informações dos usuários
- Inclui suporte a hierarquia de usuários (parent_id)
- Campos: id (UUID), username, password, email, parent_id, timestamps

### V002__create_accounts_table.sql
- Cria a tabela `tb_accounts` para contas financeiras
- Relaciona contas com usuários
- Campos: id, description, balance, credit, due_date, user_id, timestamps

### V003__create_categories_table.sql
- Cria o tipo enum `transaction_type` (INCOME, EXPENSE)
- Cria a tabela `tb_categories` para categorias de transações
- Inclui categorias padrão do sistema
- Campos: id, category, type, user_id, timestamps

### V004__create_transactions_table.sql
- Cria a tabela `tb_transactions` para transações financeiras
- Relaciona com contas, categorias e usuários
- Campos: id, due_date, transaction_date, amount, description, category_id, account_id, type, status, user_id, timestamps

### V005__insert_initial_data.sql
- Insere dados iniciais para teste
- Usuários padrão: admin e user
- Contas de exemplo para cada usuário

## Como Funciona

1. Os scripts são executados automaticamente quando o container PostgreSQL é iniciado
2. A ordem de execução é determinada pelo prefixo numérico (V001, V002, etc.)
3. Cada script é executado apenas uma vez
4. Os scripts são copiados para `/docker-entrypoint-initdb.d/` no container

## Estrutura do Banco

```
tb_users (usuários)
├── tb_accounts (contas do usuário)
└── tb_transactions (transações)
    └── tb_categories (categorias das transações)
```

## Usuários Padrão

- **admin**: admin@simplewallet.com
- **user**: user@simplewallet.com

> **Nota**: As senhas padrão devem ser alteradas em produção.

## Índices Criados

- Índices para otimizar consultas por usuário, categoria, conta e data
- Índices únicos para username e email
- Índices de foreign keys para performance

## Tipos de Dados

- **IDs**: UUID para usuários, BIGSERIAL para demais tabelas
- **Dinheiro**: DECIMAL(15,2) para valores monetários
- **Datas**: DATE para datas, TIMESTAMP para controle de criação/atualização
