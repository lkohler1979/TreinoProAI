# PRD — Módulo Personal Trainer

Status: rascunho para validação
Autor: Claude (assistido), a pedido de Luiz Kohler
Última atualização: 2026-08-04

## 1. Contexto

Hoje o TreinoPro.AI é um app B2C: o próprio usuário cria conta (Google ou anônimo), preenche seu perfil de bio-impedância e monta o treino (via IA ou manualmente). Não existe conceito de um profissional gerenciando terceiros, nem cobrança recorrente.

Este documento define um novo módulo B2B2C: um **Personal Trainer** cadastra e gerencia seus **alunos**, monta o treino de cada um e paga uma assinatura mensal baseada no número de alunos ativos.

## 2. Problema / Motivação

Personal trainers hoje usam planilhas, PDFs ou apps genéricos para gerenciar alunos. Não há uma ferramenta que:
- centralize dados de saúde/bio-impedância do aluno com histórico;
- permita montar e versionar treinos por aluno;
- dê ao aluno acesso a um app dedicado sem que ele precise se cadastrar;
- monetize via assinatura escalada pelo número de alunos.

## 3. Personas

- **Personal Trainer (PT)**: profissional pagante, gerencia N alunos, monta treinos, acompanha evolução.
- **Aluno de Personal (Student)**: recebe credenciais por e-mail, usa o app normalmente (treino, água, refeições, etc.), mas **não** monta seu próprio treino — isso é feito pelo PT. Tem acesso por tempo limitado (padrão 30 dias, renovável pelo PT).

O usuário "autônomo" (fluxo atual, sem PT) continua existindo sem alteração.

## 4. Objetivos e Métricas de Sucesso

- Nº de PTs cadastrados e com assinatura ativa em 60 dias.
- Nº de alunos ativos gerenciados por PT.
- Taxa de conversão da landing de preços → cadastro de PT.
- Churn mensal da assinatura.
- Tempo entre "PT criou conta" e "PT cadastrou o 1º aluno" (ativação).

## 5. Fora de escopo (v1)

- Chat/mensagens entre PT e aluno dentro do app.
- App nativo separado para o PT (será a mesma PWA, com área `/personal`).
- Split de pagamento / repasse financeiro a terceiros.
- Múltiplos PTs por aluno (um aluno pertence a exatamente um PT).
- Autoatendimento de reembolso/cancelamento fora do portal do gateway de pagamento.
- Aluno "virar" autônomo automaticamente quando o acesso expira (v1: apenas bloqueia acesso; migração de dados fica para v2).

## 6. Fluxos principais (user stories)

1. Como visitante, quero encontrar na tela de login um botão "Sou Personal Trainer" para acessar uma área comercial dedicada.
2. Como visitante interessado, quero ver os planos e preços (até 10 alunos R$140, até 50 R$599, acima de 51 R$987) antes de criar minha conta de PT.
3. Como PT, quero criar minha conta e assinar um plano para poder cadastrar alunos.
4. Como PT, quero cadastrar um aluno com nome, e-mail, lesões e problemas metabólicos.
5. Como PT, ao cadastrar o aluno, quero que o sistema gere uma senha aleatória e envie um e-mail de boas-vindas com login (e-mail) e senha, para que o aluno possa acessar o app imediatamente.
6. Como PT, quero registrar medições de bio-impedância do aluno ao longo do tempo (data, peso, %gordura etc.) para acompanhar a evolução.
7. Como PT, quero montar/editar o treino de cada aluno livremente, e quero que versões anteriores do treino fiquem preservadas no histórico quando eu alterar.
8. Como PT, quero definir por quantos dias o aluno terá acesso ao app (padrão 30 dias) e poder estender esse prazo.
9. Como aluno cadastrado por um PT, quero logar com meu e-mail e a senha recebida, e usar o app normalmente até meu acesso expirar.
10. Como aluno com acesso expirado, quero ver uma mensagem clara orientando a contatar meu personal trainer, em vez de um erro genérico.
11. Como PT, quero ver quantos alunos tenho ativos frente ao limite do meu plano, e ser avisado/bloqueado antes de exceder o limite.

## 7. Requisitos funcionais

### 7.1 Acesso público / comercial
- Tela de login atual (`/auth`) recebe, na parte inferior, um botão "Sou Personal Trainer".
- O botão leva a uma nova área `/personal` com: login/cadastro de PT +, abaixo, a tabela de preços (3 faixas fixas descritas acima, cobrança mensal recorrente).

### 7.2 Conta e autenticação do PT
- Cadastro de PT via e-mail/senha (auto-atendido, sem aprovação manual).
- Login de PT usa e-mail/senha, em tela própria (`/personal/auth`), separada do login do aluno.
- Sessão do PT dá acesso a `/personal/**`; PT não usa as telas de aluno diretamente.

### 7.3 Gestão de alunos
- CRUD de alunos: nome, e-mail, lesões (texto livre), problemas metabólicos (texto livre), data de expiração de acesso (padrão hoje+30 dias, editável).
- Ao criar um aluno: sistema gera senha aleatória seguramente, cria a conta (role=STUDENT, vinculada ao `trainerId`), e dispara e-mail de boas-vindas com e-mail de login e senha em texto claro (única vez — a senha não fica visível depois na UI).
- PT pode desativar/reativar um aluno e estender o prazo de acesso.
- Lista de alunos mostra status (ativo, expira em N dias, expirado) e contagem frente ao limite do plano.

### 7.4 Bio-impedância com histórico
- PT pode adicionar uma nova medição para o aluno em qualquer data, com os campos da ficha antropométrica real usada em avaliações físicas: altura, peso, IMC, peso ideal, % massa gorda, % massa magra, massa gorda (kg), massa magra (kg), área muscular do braço, área de gordura do braço; circunferências (cm) de cintura, abdômen, coxa direita/esquerda, braço relaxado direito/esquerdo; e pregas cutâneas (mm) de bíceps, tríceps, abdominal, axilar média, suprailíaca, subescapular e tórax. **Todos os campos de medida são opcionais** — o PT preenche apenas o que mediu naquela avaliação.
- Histórico completo (lista) por aluno, ordenado por data, mostrando apenas os campos preenchidos em cada registro.
- Isso é um novo registro histórico, distinto e adicional aos campos "snapshot" já existentes em `User` (peso/altura/idade/%gordura atuais, usados pelo app de treino/IA).

### 7.5 Treinos montados pelo PT
- PT acessa e edita o plano de treino do aluno reaproveitando o construtor manual já existente (dias, exercícios, séries, carga, tempo de descanso).
- Toda alteração relevante gera uma nova versão; versões antigas continuam acessíveis no histórico do aluno (não são sobrescritas/apagadas).
- O aluno continua enxergando/executando o treino normalmente pelo app (mesmas telas atuais de treino), sem poder editá-lo.

### 7.6 Controle de acesso por expiração
- Toda sessão de um usuário com `role=STUDENT` e `trainerId` preenchido é validada contra `accessExpiresAt`.
- Acesso expirado → aluno não consegue usar o app; tela informativa orientando contato com o PT.
- PT pode configurar a duração padrão (dias) aplicada a novos alunos, e ajustar individualmente por aluno.

### 7.7 Assinatura e cobrança (PT → plataforma)
- 3 planos fixos, cobrança mensal recorrente: até 10 alunos (R$140), até 50 alunos (R$599), acima de 51 alunos (R$987).
- PT precisa de assinatura ativa para cadastrar/manter alunos ativos além do limite do plano vigente.
- Ao exceder o limite do plano atual, sistema bloqueia novo cadastro e sugere upgrade.
- Página de billing no `/personal` mostra plano atual, uso (X/Y alunos) e link para gerenciar pagamento no portal do gateway escolhido.
- **Ainda depende da confirmação do gateway de pagamento (ver §11)** — enquanto isso, os limites de plano não são aplicados automaticamente (nenhum bloqueio real na Fase 2).

### 7.8 Histórico de pagamentos (aluno → PT)
- Decisão explícita do usuário: **sem gateway de pagamento nesta relação**. O PT recebe de seus alunos por fora da plataforma (pix, dinheiro, etc.) e só precisa de um registro manual.
- Para cada aluno, o PT pode lançar entradas de pagamento com **data, valor e situação** (`PAID`, `PENDING`, `OVERDUE`).
- É apenas um histórico/checklist — não dispara cobrança, não integra com gateway, não envia lembrete automático (pode virar melhoria futura).

## 8. Modelo de dados (proposta, sujeita a revisão na fase de design técnico)

```
enum UserRole { STUDENT, PERSONAL_TRAINER }
enum SubscriptionPlanTier { UP_TO_10, UP_TO_50, ABOVE_51 }
enum SubscriptionStatus { TRIALING, ACTIVE, PAST_DUE, CANCELED }

User (alterações)
  role                 UserRole  @default(STUDENT)
  trainerId            String?   // FK para User (self-relation), preenchido só para alunos de PT
  accessExpiresAt      DateTime? // só para alunos de PT
  injuries             String?
  metabolicConditions  String?

BioimpedanceRecord (novo) — espelha a ficha antropométrica real do PT; todos os campos de medida são opcionais
  id, studentId (FK User), recordedAt,
  heightInCentimeters?, weightInGrams?, bodyMassIndex?, idealWeightInGrams?,
  bodyFatPercentage?, leanMassPercentage?, fatMassInGrams?, leanMassInGrams?,
  armMuscleAreaInCm2?, armFatAreaInCm2?,
  waistCircumferenceInCm?, abdomenCircumferenceInCm?,
  rightThighCircumferenceInCm?, leftThighCircumferenceInCm?,
  rightArmCircumferenceInCm?, leftArmCircumferenceInCm?,
  bicepsSkinfoldInMm?, tricepsSkinfoldInMm?, abdominalSkinfoldInMm?,
  midAxillarySkinfoldInMm?, suprailiacSkinfoldInMm?, subscapularSkinfoldInMm?,
  chestSkinfoldInMm?, notes?, createdAt

PersonalTrainerSettings (novo)
  trainerId (PK/FK User), defaultAccessDurationInDays @default(30)

StudentPaymentRecord (novo)
  id, studentId (FK User), amountInCents, paymentDate,
  status (PAID | PENDING | OVERDUE), createdAt, updatedAt

Subscription (novo)
  trainerId (PK/FK User), planTier, status,
  currentPeriodEnd?, paymentProviderCustomerId?,
  paymentProviderSubscriptionId?, createdAt, updatedAt
```

Observação: `WorkoutPlan` já existente não precisa mudar de schema — "manter histórico ao editar" é resolvido mantendo planos antigos como inativos/arquivados em vez de deletados (mesmo padrão que planos hoje já suportam múltiplos registros por usuário).

## 9. Decisões técnicas e suposições (a validar)

- **Autenticação**: usar o `better-auth` já existente, habilitando apenas o plugin `emailAndPassword` (hoje só há Google + anônimo). O plugin `admin` do better-auth foi avaliado e **descartado**: ele usa um campo `role` global (`admin`/`user`) para liberar endpoints como `createUser`/`banUser`/`impersonateUser` para QUALQUER usuário, o que daria a cada Personal Trainer poderes de administrador do sistema (impersonar/banir qualquer usuário), não só gerenciar seus próprios alunos — risco de segurança desnecessário. Em vez disso, o backend cria a conta do aluno chamando `auth.api.signUpEmail({ body: { name, email, password } })` diretamente (server-side, sem passar pela rota HTTP) com a senha gerada, e depois atualiza os campos de negócio (`role`, `trainerId`, `injuries`, `metabolicConditions`, `accessExpiresAt`) via `prisma.user.update`.
- **E-mail transacional**: nenhum provedor de e-mail existe hoje no projeto. **Assunção**: usar um provedor tipo Resend (API simples, bom para transacional, fácil de configurar domínio/SPF/DKIM). Alternativas: AWS SES, Postmark. **Precisa confirmação do usuário antes da Fase 2.**
- **Gateway de pagamento**: nenhum existe hoje. **Assunção**: Mercado Pago (Assinaturas / `preapproval`), por ser BR-first, suportar cobrança recorrente em R$ e ter checkout hospedado. Alternativas: Asaas (BR, focado em SaaS/marketplace), Stripe Billing. **Precisa confirmação do usuário antes da Fase 5.**
- **Separação de rotas "PT agindo por aluno"**: em vez de um mecanismo genérico de impersonation (maior risco de escalonamento de privilégio), criar rotas dedicadas `PATCH/POST /personal/students/:studentId/...` que verificam explicitamente que o aluno pertence ao PT autenticado antes de operar.

## 10. Requisitos não-funcionais

- **LGPD**: lesões e problemas metabólicos são dado pessoal sensível (saúde). Necessário: base legal clara (execução de contrato / consentimento explícito no cadastro), armazenamento seguro (já via Postgres gerenciado), e mecanismo futuro de exclusão/exportação de dados do aluno.
- **Segurança de senha**: geração via gerador criptográfico (não `Math.random`), nunca logada, enviada uma única vez por e-mail; hash de senha delegado ao better-auth.
- **Entregabilidade de e-mail**: domínio de envio verificado (SPF/DKIM) para reduzir risco de cair em spam, já que o e-mail contém credenciais de acesso.
- **Idempotência de billing**: webhooks do gateway de pagamento devem ser tratados de forma idempotente (evitar duplicar ativação/renovação por reentrega de webhook).

## 11. Riscos e questões abertas

1. Provedor de e-mail transacional — confirmar antes da Fase 2 (bloqueia envio de boas-vindas).
2. Gateway de pagamento — confirmar antes da Fase 5 (bloqueia cobrança recorrente).
3. O que acontece com os dados do aluno quando o PT cancela a assinatura ou o aluno é removido? (v1: soft-delete + bloqueio de acesso; exclusão definitiva fica para v2/LGPD self-service).
4. Alunos cadastrados por PT podem também logar via Google? (Recomendação v1: não — login exclusivamente e-mail/senha para simplificar controle de expiração e vínculo com o PT.)
5. Consentimento explícito do aluno para tratamento de dado de saúde: quem coleta — o PT no cadastro, ou o próprio aluno no primeiro login? (Recomendação: checkbox de aceite no primeiro login do aluno, já que é ele o titular do dado.)

## 12. Fases (visão macro)

Ver detalhamento em [`TASKS.md`](./TASKS.md).

0. Fundamentos (schema, roles, migrations)
1. Autenticação e conta do PT (`/personal/auth`, e-mail+senha, admin plugin)
2. Gestão de alunos + e-mail de boas-vindas + expiração de acesso
3. Bio-impedância com histórico
4. Treinos montados pelo PT (reaproveitando o builder existente) + histórico de versões
5. Assinatura e cobrança (gateway a confirmar)
6. Entradas públicas (botão na tela de login + landing de preços)
7. Notificações e polimento (avisos de expiração, lembretes, etc.)
