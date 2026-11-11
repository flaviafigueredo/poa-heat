# Deploy (situação em 16/10/2026)

- No ar em https://poa-heat.pages.dev/ desde 16/10/2026, com deploy automático a cada push na `main`.
- Cloudflare Pages: framework preset "None", comando de build `npm run build`, pasta de saída `out`. O Node vem do `.nvmrc` (24).
- Nunca usar o preset "Next.js" comum: ele é para sites com servidor e não funciona com `output: "export"`.
- O app do Cloudflare no GitHub só enxerga repos escolhidos um a um. Repo novo precisa ser adicionado em github.com/settings/installations (logada na conta pessoal).
