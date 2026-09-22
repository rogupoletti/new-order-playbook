# New Order Playbook — Comercial

Site estático de apoio e treinamento do atendimento comercial da 99Food. Ele reúne orientações operacionais, filtros, personalização local e cópia rápida de mensagens e códigos.

## Desenvolvimento

Não há dependências nem variáveis de ambiente. Abra `index.html` em um navegador ou sirva esta pasta por um servidor estático.

Validação:

```bash
npm run codex:check
```

## Arquitetura

O projeto usa HTML, CSS e JavaScript sem dependências. O conteúdo e os modelos são carregados localmente em `playbook.js`, com estilos em `playbook.css`; nenhum campo preenchido, histórico de busca ou conteúdo copiado é enviado ou salvo pelo site. Não há autenticação ou banco de dados porque o playbook é um material interno estático, compatível com GitHub Pages.

## Publicação

O workflow em `.github/workflows/deploy-pages.yml` publica a branch `main` no GitHub Pages. Após o primeiro envio, confira em **Settings → Pages** se a fonte está configurada como **GitHub Actions**.

## Indexação e rastreadores

O site é intencionalmente excluído de mecanismos de pesquisa e rastreadores: `index.html` declara `noindex` e `robots.txt` bloqueia todos os caminhos para todos os agentes. Esses controles dependem da adesão do rastreador e não restringem o acesso de pessoas que já possuam a URL; para tornar o conteúdo realmente privado, seria necessário usar uma camada de autenticação fora do GitHub Pages.
