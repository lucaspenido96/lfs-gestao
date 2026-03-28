# Deploy Railway — Passos Manuais

O projeto já está criado no Railway (ID: `9a2a9c94-fa4e-48f2-83ba-198283a28e25`).
O PostgreSQL já está rodando no Railway.
As variáveis de ambiente já foram configuradas.

## O que falta: Conectar o GitHub ao Railway

O token fornecido é um **Project Token** (não um Account Token).
O Railway CLI e a integração GitHub precisam de um Account Token.

### Opção 1 — Via Dashboard Railway (recomendado)

1. Acesse: https://railway.app/project/9a2a9c94-fa4e-48f2-83ba-198283a28e25
2. Clique no serviço **lfs-gestao-app**
3. Clique em **Settings** → **Source**
4. Conecte com GitHub e selecione o repositório `lucaspenido96/lfs-gestao`
5. Branch: `main`
6. O Railway irá fazer o deploy automaticamente

### Opção 2 — Via Railway CLI com Account Token

1. Acesse: https://railway.app/account/tokens
2. Crie um **Account Token** (não Project Token)
3. Execute:
```bash
cd "C:/Users/ADMIN/Desktop/lfs-gestao"
RAILWAY_TOKEN=<account-token> railway up --service lfs-gestao-app
```

### Variáveis já configuradas no Railway:
- `DATABASE_URL` = postgresql://postgres:lfsgestao2026@postgres.railway.internal:5432/lfs_gestao
- `NEXTAUTH_SECRET` = lfs-gestao-secret-railway-2026-secure
- `NEXTAUTH_URL` = https://lfs-gestao-app-production.up.railway.app
- `ADMIN_EMAIL` = lucas@lfsfinancial.com.br
- `ADMIN_PASSWORD` = Elevador66
- `NODE_ENV` = production

### URL do app (após deploy):
https://lfs-gestao-app-production.up.railway.app

### Após o primeiro deploy, executar seed:
O comando de start já inclui `prisma migrate deploy`.
Para o seed (cria usuário lucas + bancos):
```bash
RAILWAY_TOKEN=<account-token> railway run --service lfs-gestao-app npm run db:seed
```
