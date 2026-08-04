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

## Fase 3 — Bio-impedância com histórico ✅ concluída

> Decisão do usuário (2026-08-04): o modelo de medição segue exatamente a ficha antropométrica real do personal trainer (altura, peso, IMC, peso ideal, % massa gorda/magra, massa gorda/magra em kg, área muscular/gordura do braço, circunferências de cintura/abdômen/coxas/braços, e pregas cutâneas de bíceps/tríceps/abdominal/axilar média/suprailíaca/subescapular/tórax) — todos os campos são sempre opcionais.

**Backend**
- [x] Migration: model `BioimpedanceRecord` com os ~22 campos da ficha (todos opcionais, exceto `recordedAt`).
- [x] Usecases `CreateBioimpedanceRecord` e `ListBioimpedanceRecords` (por `studentId`, ordenado por `recordedAt` desc), validando que o aluno pertence ao PT autenticado.
- [x] Rotas: `POST/GET /personal/students/:studentId/bioimpedance-records`. Zod schemas correspondentes em `src/schemas/index.ts`.

**Frontend**
- [x] `app/personal/(dashboard)/students/[studentId]/bioimpedance/page.tsx` — histórico em cards, mostrando apenas os campos preenchidos de cada medição, + botão "Nova medição".
- [x] Formulário de nova medição (RHF + Zod) gerado dinamicamente a partir de `_lib/fields.ts` (agrupado em Medidas gerais / Circunferências / Pregas cutâneas), com campo de data e todos os campos numéricos opcionais.
- [x] Link "Bio-impedância" na tela de detalhe do aluno.
- [x] `npx orval` + testado ponta a ponta no navegador (medição salva e exibida corretamente, conversão kg↔gramas confirmada no banco).

---

## Fase 4 — Treinos montados pelo Personal (com histórico de versões) ✅ concluída

> Achado importante: `CreateWorkoutPlan` já implementava "manter histórico" desde antes desta fase (desativa o plano ativo anterior em vez de apagar, ao criar um novo) — reaproveitado sem alteração.

**Backend**
- [x] Rotas espelhadas em `src/routes/personal-workout-plan.ts` (prefixo `/personal/students`), reaproveitando os usecases **existentes e inalterados** (`CreateWorkoutPlan`, `GetWorkoutPlanDetails`, `DeleteWorkoutPlan`, `UpdateWorkoutDay`, `Create/Update/DeleteWorkoutExercise`, `ListWorkoutPlanHistory`) com `userId = studentId` — nenhuma lógica de negócio duplicada.
- [x] Helper `src/lib/require-trainer-student.ts` (`isTrainerStudent`): valida o vínculo PT↔aluno na rota antes de delegar ao usecase.
- [x] Regra "manter histórico": confirmado que já existia (ver achado acima); validado no navegador criando 2 planos para o mesmo aluno — o 1º permanece na lista sem a badge "Ativo", o 2º passa a ativo.

**Frontend**
- [x] `ManualWorkoutPlanForm` e a árvore de edição (`EditWorkoutDaySection`/`EditDayDetailsForm`/`AddExerciseForm`/`EditExerciseRow`) refatoradas para receber as Server Actions via prop (`onCreate` / bundle `WorkoutPlanEditActions` em `app/workout-plans/[id]/edit/_lib/actions-types.ts`) em vez de importar diretamente — permite reaproveitar os MESMOS componentes de UI no fluxo do PT sem duplicar nada visual. O fluxo self-service (`/workout-plans/new`, `/workout-plans/[id]/edit`) continua funcionando sem alteração de comportamento.
- [x] **Pegadinha do React Server Components**: passar uma arrow function fechando sobre `studentId` como prop para um Client Component quebra ("Event handlers cannot be passed to Client Component props") — resolvido usando `.bind(null, studentId)` nas Server Actions, que o Next.js reconhece como referência de Server Action válida.
- [x] `app/personal/(dashboard)/students/[studentId]/workout-plans/new/page.tsx`, `.../[workoutPlanId]/edit/page.tsx` e `.../workout-plans/page.tsx` (histórico, reaproveitando `SessionHistoryItem` e um `StudentPlanHistorySection`/`DeleteStudentPlanButton` próprios para o link de editar + exclusão).
- [x] Link "Treinos" na tela de detalhe do aluno.
- [x] `npx orval` + testado ponta a ponta no navegador/via API: criar plano → editar dia/exercício → segundo plano criado → histórico preserva o plano antigo (inativo) e mostra o novo como ativo.

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
