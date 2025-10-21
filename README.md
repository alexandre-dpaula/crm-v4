# PipelineSaaS CRM

CRM multi-tenant para gestão de leads com Kanban personalizável, desenvolvido com Next.js 14, Nest-like API via route handlers e Prisma. O sistema permite cadastro e login de usuários, recuperação de senha, personalização de pipelines e etapas, além de CRUD completo de leads por meio de modais.

## Recursos principais

- **Autenticação completa**: cadastro, login com sessão segura, logout, alteração de senha e reset por token enviado via API (retornado no ambiente de desenvolvimento).
- **Isolamento multi-tenant**: cada usuário enxerga apenas pipelines, etapas e leads associados ao próprio ID.
- **Kanban dinâmico**: pipelines com etapas ordenáveis, renomeáveis e removíveis; cards podem ser movidos entre etapas com atualização otimista.
- **CRUD de leads**: criação, edição e exclusão via modais com validação; campos de contato, valor, prioridade, notas e próxima ação.
- **Dashboard e listagem tabular**: visão Kanban e visão tabela dos leads.
- **Gestão de perfil**: atualização de nome, telefone, avatar e fuso horário, alteração de senha com reautenticação.
- **Landing page pública**: página inicial promocional com CTA para cadastro/login.

## Tecnologias utilizadas

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, React Query, Zustand, react-hook-form, Zod.
- **Backend**: Next.js API Routes com Prisma ORM (SQLite local por padrão).
- **Autenticação**: sessões persistidas em banco com tokens hashed (cookie HTTP only).
- **UI/UX**: Tailwind + componentes customizados, React Hot Toast para notificações.

## Pré-requisitos

- Node.js 18+
- npm, pnpm ou yarn
- (Opcional) SQLite instalado para inspeção local (`dev.db` é gerado automaticamente)

## Configuração do ambiente

1. **Instale as dependências**
   ```bash
   npm install
   ```

2. **Configure variáveis de ambiente**
   - Copie o arquivo `.env.example` para `.env` e ajuste se necessário. Por padrão ele usa SQLite local (`file:./dev.db`) e `APP_URL=http://localhost:3000`.

3. **Execute as migrações e gere o cliente Prisma**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

4. **(Opcional) Popular com dados de demonstração**
   ```bash
   npm run seed
   ```
   Credenciais geradas serão exibidas no terminal (padrão `demo@crm.dev / Demo123!`).

5. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```
   Acesse `http://localhost:3000`.

## Scripts úteis

| Comando                | Descrição                                      |
| ---------------------- | ---------------------------------------------- |
| `npm run dev`          | Inicializa o servidor Next.js em modo dev      |
| `npm run build`        | Gera build de produção                         |
| `npm run start`        | Inicia a aplicação buildada                    |
| `npm run lint`         | Executa ESLint                                 |
| `npm run prisma:generate` | Gera cliente Prisma                         |
| `npm run prisma:migrate` | Aplica migrações em produção                 |
| `npm run prisma:studio`  | Abre o Prisma Studio                         |
| `npm run seed`         | Popula banco com dados de demonstração         |

## Estrutura de pastas

```
app/                     # Páginas (auth, dashboard, landing, API)
components/              # Componentes reutilizáveis (UI, layout, modais)
lib/                     # Utilitários (auth, APIs, validações)
prisma/                  # Schema e seed
store/                   # Zustand store para estado do Kanban
types/                   # Tipos compartilhados
```

## Fluxos suportados

- **Onboarding**: cadastro → criação automática de pipeline padrão → login automático.
- **Recuperação de senha**: solicitação gera token exposto na resposta (útil para dev). Ao redefinir a senha, sessões antigas são revogadas e uma nova é criada.
- **Kanban**: renomeie, mova ou remova etapas; reordene via botões; mova leads entre etapas pelo seletor.
- **Perfil**: edite dados básicos em modal; alteração de senha exige confirmação da senha atual.

## Testes e qualidade

- Inclua testes unitários/e2e conforme necessário (não inclusos neste esqueleto).
- Recomenda-se adicionar Playwright/Cypress para fluxos críticos (auth, Kanban, CRUD) e Jest/Vitest para services.
- Lint (`npm run lint`) garante estilos consistentes em TS/React.

## Deploy

- **Frontend**: otimizado para Vercel (Next.js 14).
- **Backend**: pode ser hospedado na mesma instância Next ou separado. Ajuste `DATABASE_URL` para Postgres em produção.
- **Storage**: configure `NEXT_PUBLIC_APP_URL` / `APP_URL` para geração de links de reset.
- **Segurança**: use HTTPS em produção, mantenha `cookies` com `secure: true`, aplique rate limiting conforme necessário.

## Próximos passos sugeridos

- Integrar provedores de email (SES, SendGrid) e substituir retorno do token de reset por envio real.
- Implementar drag-and-drop (ex.: `@dnd-kit/core`) para movimentação de cards.
- Adicionar testes automatizados e pipeline CI (GitHub Actions).
- Conectar monitoramento (Sentry) e métricas.
- Externalizar storage de arquivos (S3) caso upload de avatar seja implementado via upload real.

---

Desenvolvido como referência inicial para um CRM SaaS multi-tenant de leads. Ajuste, estenda e adapte a infraestrutura segundo as necessidades do projeto/produto.
