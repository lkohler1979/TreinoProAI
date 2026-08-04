# TASKS — Módulo Personal Trainer

Referência: [`PRD.md`](./PRD.md). Este documento quebra o PRD em tarefas de engenharia, fase a fase.

## Convenções a seguir (já usadas no projeto)

- **Backend** (`bootcamp-treinos-api`): Rota (Fastify) → Usecase (`src/usecases/*.ts`, classe com `InputDto`/`OutputDto`) → Prisma. Validação de request/response via Zod em `src/schemas/index.ts`. Migrations via `prisma migrate dev`.
- **Frontend** (`bootcamp-treinos-frontend`): Server Components para fetch inicial (via `app/_lib/api/fetch-generated`, gerado pelo Orval — rodar `npx orval` sempre que o schema do backend mudar), Server Actions para mutações a partir de páginas server-side, React Hook Form + Zod para formulários, componentes shadcn/ui (nunca `<button>` nativo), `dayjs` para datas, sem comentários no código, kebab-case em arquivos/pastas.
- Cada tarefa de rota nova pode, se o time achar útil, gerar depois um arquivo granular no padrão já usado em `bootcamp-treinos-api/tasks/NN.md` (seções Descrição/Requisitos Técnicos/Autenticação/Request/Response/Regras de Negócio), continuando a numeração existente. Não fizemos isso aqui para não gerar ~20 arquivos antes de validar o plano.
- Antes de iniciar a Fase 2, confirmar o provedor de e-mail transacional (assunção: Resend). Antes de iniciar a Fase 5, confirmar o gateway de pagamento (assunção: Mercado Pago Assinaturas).

---

## Fase 0 — Fundamentos (schema e papéis) ✅ concluída

**Backend**
- [x] Migration: adicionar `role` (`UserRole`: `STUDENT` default, `PERSONAL_TRAINER`) em `User`.
- [x] Migration: adicionar `trainerId String?` (self-relation em `User`) e `accessExpiresAt DateTime?`.
- [x] Migration: adicionar `injuries String?` e `metabolicConditions String?` em `User`.
- [x] Criar helper central de sessão autenticada (`src/lib/get-authenticated-session.ts`) que já valida `accessExpiresAt` quando `role=STUDENT`. Ainda **não foi adotado pelas rotas existentes** (treino, água, refeições) — cada uma continua chamando `auth.api.getSession` diretamente; retrofit fica pendente.
- [x] Definir constantes de planos (`PLAN_TIERS`) em `src/lib/plan-tiers.ts`.

**Frontend**
- [x] Nenhuma tarefa de UI nesta fase (fundação de dados apenas).

---

## Fase 1 — Autenticação e conta do Personal Trainer ✅ concluída

**Backend**
- [x] Habilitar plugin `emailAndPassword` do better-auth em `src/lib/auth.ts` (plugin `admin` descartado — ver PRD §9).
- [x] Rota/usecase de cadastro de PT (`role=PERSONAL_TRAINER`) via `auth.api.signUpEmail` + `prisma.user.update`.
- [x] `GET /personal/me` para o frontend identificar se a sessão atual é de um PT.

**Frontend**
- [x] Página `app/personal/auth/page.tsx` — login/cadastro de PT via e-mail/senha, com abas.
- [x] Componentes de formulário de login/cadastro (RHF + Zod).
- [x] Layout `app/personal/(dashboard)/layout.tsx` com verificação de sessão de PT.
- [x] (Antecipado da Fase 6) Botão "Sou Personal Trainer" em `/auth` + tabela de preços em `/personal/auth`.

---

## Fase 2 — Gestão de alunos, e-mail de boas-vindas, expiração de acesso e histórico de pagamentos ✅ concluída

> Provedor de e-mail: **Resend** (free tier 3.000 e-mails/mês). Sem `RESEND_API_KEY` configurada, o e-mail é apenas logado no console (modo dev) — validado assim nesta fase.
> Decisão do usuário (2026-08-04): pagamento aluno→PT **sem gateway**, apenas um histórico manual (data, valor, situação) lançado pelo próprio PT — ver PRD §7.8.

**Backend**
- [x] Migration: model `StudentPaymentRecord` + enum `StudentPaymentStatus` (`PAID`/`PENDING`/`OVERDUE`).
- [x] Dependência `resend` + `src/lib/email.ts` com `sendWelcomeEmail`.
- [x] Usecase `CreateStudent`: gera senha aleatória segura (`src/lib/generate-random-password.ts`), cria a conta via `auth.api.signUpEmail` e atualiza os campos de negócio via `prisma.user.update`, envia e-mail de boas-vindas.
- [x] Usecases `ListStudents` e `GetStudent`: status de acesso (ativo/expirado) calculado com `dayjs`.
- [x] Usecase `UpdateStudent`: edita nome, lesões, problemas metabólicos, `accessExpiresAt` (estender prazo).
- [x] Usecases `Get/UpsertPersonalTrainerSettings`: `defaultAccessDurationInDays` por PT.
- [x] Usecases `CreateStudentPaymentRecord` / `ListStudentPaymentRecords`: validam que o aluno pertence ao PT autenticado antes de ler/escrever.
- [x] Helper `src/lib/require-personal-trainer.ts`: centraliza a checagem de sessão + `role=PERSONAL_TRAINER` para as novas rotas.
- [x] Rotas Fastify: `POST/GET /personal/students`, `GET/PATCH /personal/students/:studentId`, `POST/GET /personal/students/:studentId/payments`, `GET/PATCH /personal/settings`.
- [x] Limite de alunos por plano (Fase 5) **não aplicado nesta fase** — sem bloqueio de cadastro por enquanto.
- [ ] Pendente (não incluído nesta fase): retrofit das rotas de aluno existentes (treino, água, refeições) para usar `getAuthenticatedSession` e bloquear de fato quando `accessExpiresAt` vencer.

**Frontend**
- [x] `app/personal/(dashboard)/students/page.tsx` — lista de alunos com status e link para "Adicionar aluno".
- [x] `app/personal/(dashboard)/students/new/page.tsx` + Server Action — formulário (nome, e-mail, lesões, problemas metabólicos, prazo de acesso) via RHF + Zod.
- [x] `app/personal/(dashboard)/students/[studentId]/page.tsx` — dados cadastrais, status de acesso, botão "Renovar por 30 dias", e histórico de pagamentos (lista + formulário para lançar novo pagamento com data/valor/situação).
- [x] `npx orval` para gerar os tipos/funções de API.
- [x] Testado ponta a ponta no navegador: cadastro de aluno → e-mail logado no console → lançamento de pagamento → renovação de acesso.

---

## Fase 3 — Bio-impedância com histórico

**Backend**
- [ ] Migration: model `BioimpedanceRecord` (ver PRD §8).
- [ ] Usecase `CreateBioimpedanceRecord` e `ListBioimpedanceRecords` (por `studentId`, ordenado por `recordedAt`).
- [ ] Rotas: `POST/GET /personal/students/:studentId/bioimpedance-records`. Zod schemas correspondentes.
- [ ] Autorização: validar que `studentId` pertence ao PT autenticado antes de qualquer leitura/escrita.

**Frontend**
- [ ] `app/personal/students/[studentId]/bioimpedance/page.tsx` — histórico (lista, e opcionalmente gráfico simples de evolução de peso/%gordura) + botão para nova medição.
- [ ] Formulário de nova medição (RHF + Zod), com campo de data (dayjs) e campos numéricos opcionais.
- [ ] `npx orval` para os novos endpoints.

---

## Fase 4 — Treinos montados pelo Personal (com histórico de versões)

**Backend**
- [ ] Rotas espelhadas às já existentes de `workout-plans`, mas com prefixo `/personal/students/:studentId/workout-plans/...`, reaproveitando os usecases atuais de criação/edição de plano (parametrizando o `userId` alvo em vez do usuário da sessão), sempre validando vínculo PT↔aluno antes de delegar.
- [ ] Regra de negócio "manter histórico ao editar": ao criar um novo plano para o aluno, o(s) plano(s) anterior(is) passam a `isActive=false` (ou equivalente já existente no schema) em vez de serem apagados — confirmar se esse comportamento já existe hoje para o fluxo autônomo e reaproveitar; caso não exista, implementar aqui.

**Frontend**
- [ ] Reaproveitar as telas existentes do construtor manual (`app/workout-plans/new`, `app/workout-plans/[id]/edit`) através de uma rota espelhada em `app/personal/students/[studentId]/workout-plans/...`, ajustando apenas a origem dos dados (endpoints "as trainer") — evitar duplicar componentes de UI, só trocar a camada de dados/Server Actions.
- [ ] Tela de histórico de planos do aluno (reaproveitar `app/workout-plans/[id]/history` como referência).

---

## Fase 5 — Assinatura e cobrança

> Pré-requisito: gateway de pagamento confirmado (assunção: Mercado Pago Assinaturas).

**Backend**
- [ ] Migration: model `Subscription` (ver PRD §8).
- [ ] Integração com o gateway escolhido: criação de assinatura/checkout hospedado por tier, webhook de confirmação/renovação/falha de pagamento (idempotente).
- [ ] Usecase `GetSubscriptionStatus` / `ChangeSubscriptionPlan`.
- [ ] Enforcement real do limite de alunos por tier (substituindo o valor mock/default da Fase 2) nas rotas de criação de aluno.
- [ ] Rotas: `GET /personal/subscription`, `POST /personal/subscription/checkout`, `POST /webhooks/<gateway>`.

**Frontend**
- [ ] `app/personal/billing/page.tsx` — plano atual, uso (X/Y alunos), botão de upgrade/checkout, link ao portal do gateway.
- [ ] Bloqueio de UI ("Adicionar aluno") com aviso de upgrade quando o limite for atingido.

---

## Fase 6 — Entradas públicas (login + landing de preços)

**Frontend**
- [ ] Adicionar botão "Sou Personal Trainer" na parte inferior de `app/auth/page.tsx` (ou equivalente), linkando para `/personal`.
- [ ] `app/personal/page.tsx` — landing pública: chamada para login/cadastro de PT + tabela de preços fixa (3 tiers do PRD) abaixo.
- [ ] Garantir que `/personal/**` sem sessão de PT redirecione corretamente para a landing/login (não para `/auth` de aluno).

---

## Fase 7 — Notificações e polimento

**Backend**
- [ ] Job/rotina (ex. cron simples) para avisar PT quando um aluno estiver a N dias de expirar (e-mail).
- [ ] Job para marcar assinaturas vencidas/canceladas com base em falhas de pagamento consecutivas.

**Frontend**
- [ ] Indicadores visuais de "expira em breve" na lista de alunos.
- [ ] Revisão geral de UX das telas `/personal/**` (estados vazios, loading, erros) seguindo os mesmos padrões visuais já usados no restante do app.

---

## Riscos/decisões a revisitar antes de codar

- Confirmar provedor de e-mail (Fase 2) e gateway de pagamento (Fase 5) — ver PRD §11.
- Decidir se alunos de PT podem logar via Google (recomendação do PRD: não, só e-mail/senha).
- Decidir onde/quando o consentimento LGPD do aluno é coletado (recomendação do PRD: no primeiro login do aluno).
