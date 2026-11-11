# Stack e arquitetura

- Next.js com TypeScript.
- Deploy no Cloudflare Pages, automático a cada push.
- Repo público no GitHub.
- Fluxo de dados:
  1. Um script em TypeScript busca os dados na Open-Meteo, calcula os números e salva um JSON no repo.
  2. Um workflow do GitHub Actions roda o script uma vez por mês (schedule) e faz commit só se o JSON mudou.
  3. O push dispara o deploy.
- O site nunca chama a API no navegador. Ele só lê o JSON gerado.
