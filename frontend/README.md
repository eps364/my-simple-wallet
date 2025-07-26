# Simple Wallet - Frontend

Este é o frontend da aplicação Simple Wallet, desenvolvido com [Next.js](https://nextjs.org), TypeScript e Tailwind CSS.

## Tecnologias Utilizadas

- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **ESLint** - Linting de código

## Começando

Primeiro, instale as dependências:

```bash
npm install
```

Em seguida, execute o servidor de desenvolvimento:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera a build de produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linting do código

## Estrutura do Projeto

O projeto utiliza o App Router do Next.js 13+ com a estrutura:

- `src/app/` - Páginas e layouts da aplicação
- `src/components/` - Componentes reutilizáveis
- `public/` - Arquivos estáticos

## Funcionalidades

O Simple Wallet permite:

- Gerenciamento de contas bancárias
- Controle de transações financeiras
- Categorização de gastos
- Dashboard com relatórios

## Backend

O frontend se conecta com uma API REST desenvolvida em Spring Boot. Certifique-se de que o backend esteja rodando na porta 8080.
