# Deploy em produção - VPS 187.77.53.197

Guia passo a passo para subir o TreinoPro.AI no servidor, sem Docker
(instalação direta: Node.js + PostgreSQL nativo + PM2 + NGINX).

## Arquitetura

```
Internet
  |
  v
NGINX (porta 80/443)
  |
  |-- treino.nexux360.com.br      -> 127.0.0.1:3000 (Next.js, gerenciado pelo PM2)
  |-- api.treino.nexux360.com.br  -> 127.0.0.1:8080 (Fastify, gerenciado pelo PM2)
  v
PostgreSQL (local, porta 5432, só acesso via localhost)
```

Layout final em `/var/www/treino`:

```
/var/www/treino/
├── app/                 <- clone do repositório git (fonte da verdade, atualizado com `git pull`)
├── backend  -> app/bootcamp-treinos-api        (symlink)
├── frontend -> app/bootcamp-treinos-frontend   (symlink)
└── ecosystem.config.js  <- copiado de app/prod/ecosystem.config.js (config do PM2)
```

Os nomes `backend` e `frontend` existem como symlinks para as pastas reais
dentro do clone `app/`. Assim, um `git pull` dentro de `app/` já atualiza o
código usado pelos dois processos, sem precisar duplicar nada.

Pré-requisito: os domínios `treino.nexux360.com.br` e
`api.treino.nexux360.com.br` já apontam (registro A) para `187.77.53.197`.

---

## 1. Acessar o servidor

```bash
ssh root@187.77.53.197
```

## 2. Instalar Node.js 24.x e o pnpm

```bash
sudo apt update && sudo apt upgrade -y

curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs

node -v   # confirme que é v24.x

corepack enable
corepack prepare pnpm@10.30.0 --activate

pnpm -v
```

## 3. Instalar o PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

Criar o usuário e o banco (troque `SENHA_FORTE_AQUI`):

```bash
sudo -u postgres psql -c "CREATE USER treino WITH PASSWORD 'SENHA_FORTE_AQUI';"
sudo -u postgres psql -c "CREATE DATABASE \"treino-ai\" OWNER treino;"
```

A `DATABASE_URL` resultante (usada no passo 6) é:

```
postgresql://treino:SENHA_FORTE_AQUI@localhost:5432/treino-ai
```

## 4. Instalar o PM2 (gerenciador de processos)

```bash
sudo npm install -g pm2
pm2 -v
```

## 5. Instalar o NGINX e o Certbot

```bash
sudo apt install -y nginx certbot python3-certbot-nginx

sudo systemctl enable nginx
sudo systemctl start nginx
```

Se houver firewall (`ufw`) ativo:

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
```

## 6. Clonar o repositório e criar a estrutura de pastas

```bash
sudo mkdir -p /var/www/treino
cd /var/www/treino

sudo git clone https://github.com/lkohler1979/TreinoProAI.git app

sudo ln -s app/bootcamp-treinos-api backend
sudo ln -s app/bootcamp-treinos-frontend frontend

sudo cp app/prod/ecosystem.config.js ecosystem.config.js
```

Confirme que `backend` e `frontend` aparecem (como symlinks):

```bash
ls -la /var/www/treino
```

## 7. Configurar e buildar o backend

```bash
cd /var/www/treino/backend
sudo cp .env.example .env
sudo nano .env
```

Preencha:

```
PORT=8080
DATABASE_URL="postgresql://treino:SENHA_FORTE_AQUI@localhost:5432/treino-ai"
BETTER_AUTH_SECRET="<gere com: openssl rand -base64 32>"
API_BASE_URL="https://api.treino.nexux360.com.br"
GOOGLE_CLIENT_ID="<seu client id do Google OAuth>"
GOOGLE_CLIENT_SECRET="<seu client secret>"
GOOGLE_GENERATIVE_AI_API_KEY="<sua key do Gemini>"
OPENAI_API_KEY="<sua key da OpenAI (opcional)>"
WEB_APP_BASE_URL="https://treino.nexux360.com.br"
NODE_ENV=production
```

No Google Cloud Console, o **redirect URI autorizado** do OAuth precisa ser:
`https://api.treino.nexux360.com.br/api/auth/callback/google`

Instalar dependências, buildar e rodar as migrations:

```bash
sudo pnpm install --frozen-lockfile
sudo pnpm run build            # gera o prisma client e compila para dist/
sudo pnpm exec prisma migrate deploy
```

## 8. Configurar e buildar o frontend

```bash
cd /var/www/treino/frontend
sudo cp .env.example .env.production
sudo nano .env.production
```

Preencha:

```
NEXT_PUBLIC_API_URL=https://api.treino.nexux360.com.br
NEXT_PUBLIC_BASE_URL=https://treino.nexux360.com.br
```

> Essas variáveis são embutidas no HTML/JS durante o build. Se precisar
> trocar depois, edite o `.env.production` e rode `pnpm run build` de novo.

Instalar dependências e buildar:

```bash
sudo pnpm install --frozen-lockfile
sudo pnpm run build
```

## 9. Subir os processos com o PM2

```bash
cd /var/www/treino
pm2 start ecosystem.config.js

pm2 status
```

Configurar o PM2 para iniciar junto com o servidor (sobrevive a reboot):

```bash
pm2 save
pm2 startup
```

O `pm2 startup` imprime um comando `sudo env PATH=... pm2 startup systemd -u root --hp /root`
— copie e execute exatamente o que ele mostrar.

## 10. Configurar o NGINX

```bash
sudo cp /var/www/treino/app/prod/nginx/treino.conf /etc/nginx/sites-available/treino.conf
sudo cp /var/www/treino/app/prod/nginx/api.conf /etc/nginx/sites-available/api.conf

sudo ln -s /etc/nginx/sites-available/treino.conf /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/api.conf /etc/nginx/sites-enabled/

# opcional: remova o site default do nginx pra evitar conflito
sudo rm -f /etc/nginx/sites-enabled/default

sudo nginx -t
sudo systemctl reload nginx
```

Neste ponto, `http://treino.nexux360.com.br` e
`http://api.treino.nexux360.com.br` já devem funcionar (ainda sem HTTPS).

## 11. Ativar HTTPS com Certbot

```bash
sudo certbot --nginx -d treino.nexux360.com.br
sudo certbot --nginx -d api.treino.nexux360.com.br
```

O certbot edita os arquivos em `/etc/nginx/sites-available/` automaticamente,
adicionando o bloco `listen 443 ssl` e o redirect de HTTP para HTTPS. Não é
necessário editar nada manualmente.

Testar a renovação automática (o certbot já instala um timer):

```bash
sudo certbot renew --dry-run
```

## 12. Testar

```bash
curl -I https://treino.nexux360.com.br
curl -I https://api.treino.nexux360.com.br
curl https://api.treino.nexux360.com.br/    # deve retornar {"message":"Hello World"}
```

Abra `https://treino.nexux360.com.br` no navegador e confirme que o login
com Google funciona.

---

## Atualizações futuras (novo deploy)

Sempre que o código mudar, rode o script `deploy.sh` (já vem no repo, em
`app/prod/deploy.sh`):

```bash
cd /var/www/treino
./app/prod/deploy.sh
```

Ele faz, em ordem, parando no primeiro erro: `git pull` (recusa rodar se
houver mudanças locais não commitadas em `app/`), instala e builda o
backend, roda `prisma migrate deploy`, instala e builda o frontend,
reinicia os dois processos no PM2 e testa se `127.0.0.1:8080` e
`127.0.0.1:3000` respondem.

Um deploy já em andamento é detectado (lock file em `/tmp/treino-deploy.lock`)
e uma segunda execução simultânea é recusada.

Equivalente manual, passo a passo (caso quira rodar sem o script):

```bash
cd /var/www/treino/app
git pull

cd /var/www/treino/backend
pnpm install --frozen-lockfile
pnpm run build
pnpm exec prisma migrate deploy   # só se houver migration nova

cd /var/www/treino/frontend
pnpm install --frozen-lockfile
pnpm run build

cd /var/www/treino
pm2 restart ecosystem.config.js
```

## Comandos úteis / troubleshooting

```bash
# status e logs dos processos
pm2 status
pm2 logs treino-api
pm2 logs treino-frontend

# reiniciar um processo
pm2 restart treino-api

# logs do nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# validar config do nginx antes de recarregar
sudo nginx -t

# status do postgres
sudo systemctl status postgresql
```
