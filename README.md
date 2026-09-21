# New Orden — Playbook comercial

Site estático de apoio ao atendimento comercial da 99Food. Ele reúne 18 modelos de mensagem, filtros por etapa e situação, personalização local e cópia rápida de mensagens e códigos.

## Desenvolvimento

Não há dependências nem variáveis de ambiente. Abra `index.html` em um navegador ou sirva esta pasta por um servidor estático.

Validação:

```bash
npm run codex:check
```

## Arquitetura

O projeto usa HTML, CSS e JavaScript sem dependências. Todos os modelos são carregados localmente em `app.js`; nenhum campo preenchido, histórico de busca ou conteúdo copiado é enviado ou salvo pelo site. Não há autenticação ou banco de dados porque o playbook é um material interno estático, compatível com GitHub Pages.

## Publicação

O workflow em `.github/workflows/deploy-pages.yml` publica a branch `main` no GitHub Pages. Após o primeiro envio, confira em **Settings → Pages** se a fonte está configurada como **GitHub Actions**.
