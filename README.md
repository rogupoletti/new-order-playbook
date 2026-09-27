# New Order Playbook — Comercial

Playbook interno hospedado no Cloudflare Pages. O conteúdo estático é protegido no edge por Pages Functions: todo caminho, inclusive `index.html`, `playbook.js`, CSS, imagens e APIs, exige uma sessão válida. A única página pública é `/login` e o único endpoint público é `POST /api/login`.

## Arquitetura

```text
GitHub → Cloudflare Pages → Functions/_middleware.js → D1 → conteúdo privado
```

- `functions/_middleware.js`: autentica cada requisição antes de servir arquivos estáticos ou rotas.
- `functions/_lib/auth.js`: PBKDF2-HMAC-SHA-512 com salt individual, cookies de sessão `HttpOnly`, `Secure`, `SameSite=Lax` e assinatura HMAC-SHA-256.
- `migrations/0001_auth.sql`: usuários, sessões revogáveis e proteção contra tentativas de login repetidas.
- `functions/api/*`: login, logout, perfil e gestão administrativa de usuários.
- `functions/admin/users.js`: painel de usuários disponível apenas para admins.

Senhas não são armazenadas em texto puro. Cada senha usa PBKDF2-SHA-512 com 210.000 iterações e salt aleatório. As sessões usam um identificador aleatório, assinado e com o hash guardado no D1; logout, desativação de usuário e redefinição de senha revogam as sessões no servidor.

## Pré-requisitos de segurança

O repositório atual contém o conteúdo privado em `index.html`, `playbook.js` e `assets/`. Por isso, antes de publicar a autenticação, torne o repositório GitHub **privado** e desative o GitHub Pages. Caso contrário, uma pessoa poderá ler o conteúdo pelo próprio GitHub ou pelo hostname antigo, contornando o middleware do Cloudflare.

Também remova as aplicações Cloudflare Access que protegiam esses domínios anteriormente, somente depois de validar a autenticação própria em produção.

## Configuração do Cloudflare

1. Crie o banco D1:

   ```bash
   npx wrangler d1 create new-order-playbook-auth
   ```

2. Copie `wrangler.jsonc.example` para `wrangler.jsonc` e substitua `REPLACE_WITH_YOUR_D1_DATABASE_ID` pelo ID retornado. Esse arquivo é ignorado pelo Git para não deixar configuração local acidental no repositório.

3. Execute as migrations no banco remoto:

   ```bash
   npx wrangler d1 migrations apply new-order-playbook-auth --remote
   ```

4. No painel Cloudflare: **Workers & Pages → new-order-playbook → Settings → Bindings → Add → D1 database bindings**. Crie o binding com o nome exato `DB` e selecione `new-order-playbook-auth`. Faça isso tanto em Production quanto em Preview, caso previews permaneçam habilitados.

5. Em **Settings → Variables and Secrets**, crie o segredo `SESSION_SECRET` em Production e Preview. Use uma sequência aleatória com pelo menos 32 caracteres. Opcionalmente configure `SESSION_TTL_SECONDS` (padrão: 8 horas; mínimo: 15 minutos; máximo: 30 dias).

6. Faça um novo deploy pela branch `main`. O comando de build precisa gerar `dist`; use:

   ```text
   npm run build
   ```

   No Cloudflare Pages, ajuste o build command para `npm run build` e mantenha o diretório de saída como `dist`.

## Primeiro administrador

Depois das migrations, crie o primeiro usuário sem gerar hash manualmente:

```bash
npm run create-user
```

O script pede nome, e-mail, senha e perfil (`admin` por padrão) e grava somente o hash no D1 remoto. Para usar um banco local, rode `npm run create-user -- --local`.

Defina `D1_DATABASE_NAME=new-order-playbook-auth` no ambiente para pular a primeira pergunta do script, se desejar.

## Desenvolvimento local

```bash
npm install
Copy-Item .dev.vars.example .dev.vars
# Edite .dev.vars com um segredo local aleatório.
Copy-Item wrangler.jsonc.example wrangler.jsonc
# Preencha o ID do D1 (ou use o binding local criado pelo Wrangler).
npm run db:migrate:local
npm run dev
```

`wrangler pages dev` persiste o D1 local por padrão. Para testar usando um ID específico sem arquivo de configuração, use:

```bash
npx wrangler pages dev dist --d1 DB=<DATABASE_ID> --binding SESSION_SECRET=<SEGREDO_LOCAL>
```

## Rotas

| Rota | Acesso |
| --- | --- |
| `GET /login` | pública |
| `POST /api/login` | pública, limitada por IP/e-mail após falhas |
| `POST /api/logout` | usuário autenticado |
| `GET /api/me` | usuário autenticado |
| `GET /logout` | usuário autenticado |
| `GET/POST /api/admin/users` | somente admin |
| `PUT /api/admin/users/:id` | somente admin |
| `/admin/users` | somente admin |
| todo o restante | usuário autenticado |

## Validação

Execute a verificação estática antes de publicar:

```bash
npm run codex:check
npm run build
```

Em uma janela anônima, valide: `/login` abre; `/`, `/playbook.js`, `/assets/referencias/captura-01.svg` redirecionam para `/login`; `/api/me` responde `401`; login correto libera o playbook; logout bloqueia novamente. Valide também que um usuário comum recebe `403` em `/admin/users` e nas APIs `/api/admin/*`.

## Publicação

O deploy continua sendo GitHub → Cloudflare Pages. Não use Cloudflare Access para este fluxo: a proteção é o middleware da aplicação e funciona para domínio customizado, `*.pages.dev` e qualquer preview que entregue esta mesma build.
