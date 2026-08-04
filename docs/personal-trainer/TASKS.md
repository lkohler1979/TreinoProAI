# TASKS — Módulo Personal Trainer

Referência: [`PRD.md`](./PRD.md). Este documento quebra o PRD em tarefas de engenharia, fase a fase.

## Convenções a seguir (já usadas no projeto)

- **Backend** (`bootcamp-treinos-api`): Rota (Fastify) → Usecase (`src/usecases/*.ts`, classe com `InputDto`/`OutputDto`) → Prisma. Validação de request/response via Zod em `src/schemas/index.ts`. Migrations via `prisma migrate dev`.
- **Frontend** (`bootcamp-treinos-frontend`): Server Components para fetch inicial (via `app/_lib/api/fetch-generated`, gerado pelo Orval — rodar `npx orval` sempre que o schema do backend mudar), Server Actions para mutações a partir de páginas server-side, React Hook Form + Zod para formulários, componentes shadcn/ui (nunca `<button>` nativo), `dayjs` para datas, sem comentários no código, kebab-case em arquivos/pastas.
- Cada tarefa de rota nova pode, se o time achar útil, gerar depois um arquivo granular no padrão já usado em `bootcamp-treinos-api/tasks/NN.md` (seções Descrição/Requisitos Técnicos/Autenticação/Request/Response/Regras de Negócio), continuando a numeração existente. Não fizemos isso aqui para não gerar ~20 arquivos antes de validar o plano.
- Antes de iniciar a Fase 2, confirmar o provedor de e-mail transacional (assunção: Resend). Antes de iniciar a Fase 5, confirmar o gateway de pagamento (assunção: Mercado Pago Assinaturas).

---

## Fase 0 — Fundamentos (schema e papéis)

**Backend**
- [ ] Migration: adicionar `role` (`UserRole`: `STUDENT` default, `PERSONAL_TRAINER`) em `User`.
- [ ] Migration: adicionar `trainerId String?` (self-relation em `User`) e `accessExpiresAt DateTime?`.
- [ ] Migration: adicionar `injuries String?` e `metabolicConditions String?` em `User`.
- [ ] Criar helper central de sessão autenticada (ex.: `src/lib/get-authenticated-session.ts`) que já valida `accessExpiresAt` quando `role=STUDENT` e retorna 401 com código específico (`ACCESS_EXPIRED`) quando vencido — hoje cada rota chama `auth.api.getSession` diretamente, então esse helper deve ser adotado progressivamente pelas rotas existentes também, não só pelas novas.
- [ ] Definir constantes de planos (`PLAN_TIERS`) num único lugar (ex. `src/lib/plan-tiers.ts`): `UP_TO_10` (10 alunos, R$140,00), `UP_TO_50` (50 alunos, R$599,00), `ABOVE_51` (ilimitado, R$987,00).

**Frontend**
- [ ] Nenhuma tarefa de UI nesta fase (fundação de dados apenas).

---

## Fase 1 — Autenticação e conta do Personal Trainer

**Backend**
- [ ] Habilitar plugin `emailAndPassword` do better-auth em `src/lib/auth.ts`.
- [ ] Habilitar plugin `admin` do better-auth (necessário para a Fase 2 criar contas de aluno com senha pré-definida em nome do PT).
- [ ] Rota/usecase de cadastro de PT (`role=PERSONAL_TRAINER`) — pode reaproveitar o signup padrão do better-auth, apenas setando `role` corretamente após a criação.
- [ ] Middleware/guard simples (dentro do helper de sessão da Fase 0) para diferenciar rotas exclusivas de PT das rotas de aluno.

**Frontend**
- [ ] Página `app/personal/auth/page.tsx` — login/cadastro de PT via e-mail/senha (Server Component + Server Actions, mesmo padrão de `app/profile/setup`).
- [ ] Componente de formulário de login/cadastro (RHF + Zod), reaproveitando `Form`/`Input`/`Button` do shadcn.
- [ ] Layout base da área `app/personal/**` (ex. `app/personal/layout.tsx`) com verificação de sessão de PT, redirecionando para `/personal/auth` se não autenticado.

---

## Fase 2 — Gestão de alunos, e-mail de boas-vindas e expiração de acesso

> Pré-requisito: provedor de e-mail confirmado (assunção: Resend).

**Backend**
- [ ] Adicionar dependência do provedor de e-mail escolhido e client em `src/lib/email.ts`.
- [ ] Usecase `CreateStudent` (`src/usecases/CreateStudent.ts`): gera senha aleatória segura, cria usuário via `admin` plugin do better-auth (`role=STUDENT`, `trainerId`, `injuries`, `metabolicConditions`, `accessExpiresAt = now + defaultAccessDurationInDays`), envia e-mail de boas-vindas com login/senha.
- [ ] Usecase `ListStudents` (`src/usecases/ListStudents.ts`): lista alunos do PT autenticado com status de acesso (ativo/expira em N dias/expirado).
- [ ] Usecase `UpdateStudent` (`src/usecases/UpdateStudent.ts`): edita nome, lesões, problemas metabólicos, `accessExpiresAt` (estender prazo).
- [ ] Usecase `DeactivateStudent` / reativação, se necessário para o fluxo de negócio (soft-delete, sem apagar histórico).
- [ ] Usecase/config `UpsertPersonalTrainerSettings`: define `defaultAccessDurationInDays` por PT.
- [ ] Rotas Fastify: `POST/GET/PATCH /personal/students`, `PATCH /personal/settings`. Zod schemas correspondentes em `src/schemas/index.ts`.
- [ ] Regra de negócio: bloquear criação de aluno se `alunos ativos >= limite do plano vigente` (ver Fase 5 para de onde vem o plano vigente — nesta fase pode usar um valor default/mock até a assinatura existir).
- [ ] Atualizar rotas/usecases existentes que dependem de sessão de aluno (ex. treino, água, refeições) para usar o helper da Fase 0, garantindo bloqueio quando `accessExpiresAt` vencer.

**Frontend**
- [ ] `app/personal/students/page.tsx` — lista de alunos com status e link para "Adicionar aluno".
- [ ] `app/personal/students/new/page.tsx` + Server Action — formulário (nome, e-mail, lesões, problemas metabólicos, prazo de acesso) via RHF + Zod.
- [ ] `app/personal/students/[studentId]/page.tsx` — detalhe do aluno: dados cadastrais, status de acesso, botão para estender prazo.
- [ ] Tela/estado de "acesso expirado" para o aluno (ex. interceptar erro `ACCESS_EXPIRED` no client de auth e mostrar mensagem dedicada em vez do fluxo normal de app).
- [ ] `npx orval` para gerar os novos tipos/funções de API assim que as rotas acima existirem no backend.

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
