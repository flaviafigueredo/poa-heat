# Onde paramos (16/11/2026)

## Pronto

- Projeto Next.js 16 + TypeScript criado na raiz, com App Router, pasta `src/`, CSS Modules (sem Tailwind) e React Compiler.
- `next.config.ts` com `output: "export"` (site estático na pasta `out`). `cacheComponents` e `partialPrefetching` foram removidos porque quebram o export estático.
- Abertura pronta e aprovada pela Flávia ("bem como estava na minha cabeça"). Não mexer no visual sem pedido.
  - `src/components/opening/`: `Opening` (layout e texto), `Starfield` (estrelas em SVG geradas no build), `GlobeLoader` (carrega o globo só no navegador) e `EarthGlobe` (globo com `react-globe.gl` e zoom até Porto Alegre).
  - `prefers-reduced-motion`: câmera já começa sobre Porto Alegre, sem animação.
  - Texturas em `public/textures/`: `earth-topo-bathy.webp` (NASA Blue Marble Next Generation, 4096 px) e `earth-bump.webp` (relevo "Topography" da NASA Blue Marble Next Generation, dados GEBCO, 2048 px).
- Cores e paleta de temperatura em `src/app/globals.css`, validadas contra o fundo `#03040a`. Ainda nenhum gráfico usa a paleta.
- Coordenadas de Porto Alegre em `src/lib/portoAlegre.ts`, para o script de dados reaproveitar.
- Favicon próprio em `src/app/icon.svg` (círculo com listras de aquecimento nas cores da paleta), aprovado pela Flávia. O `favicon.ico` padrão do Next foi removido. Comentários dentro do SVG não podem ter `--`, senão o arquivo fica inválido.
- `<body>` com `suppressHydrationWarning`, porque extensões de navegador que alteram o HTML geram aviso de hidratação.
- Instruções do projeto divididas em `.claude/rules/`, com as referências visuais do dashboard e o escopo novo (PRs #1 e #2, já na `main`).
- Modelo de dados escolhido: ERA5-Land, com série desde 1950 (ver `data-source.md`).
- Script de dados em `scripts/fetch-temperature.ts` (PR #6), rodando com `npm run data`. Usa só recursos do Node 24, sem dependências.
  - Gera `src/data/temperature.json` com `meta` (fonte, licença, modelo, ponto da grade, datas, limites) e duas listas: `years` (só anos completos) e `summers` (verão de dezembro a fevereiro, só verões completos).
  - Cada item tem temperatura média, dias com máxima acima de 30 °C e de 35 °C e noites com mínima igual ou acima de 20 °C.
  - Se faltar qualquer valor na resposta da API, o script para com erro e não sobrescreve o JSON.
- Workflow `.github/workflows/update-data.yml` (PR #7): roda no dia 10 de cada mês (o ERA5-Land chega com alguns dias de atraso) e também à mão pela aba Actions. Faz commit só se o JSON mudou, e o push dispara o deploy.

## Próximos passos

1. Escolher os painéis do painel final e o nome da seção. Período de referência (1961 a 1990, em `analysis-care.md`) e perguntas dos capítulos 1 a 4 (em `chapters.md`) já decididos.
2. Escolher a biblioteca de gráficos.
3. Construir os capítulos 1 a 4 (número em destaque, gráfico e interações).
4. Construir o painel final, com a luz no hover.
5. Capítulo 5 (metodologia), footer e os textos da abertura vindo do JSON.
6. No fim do projeto: reescrever o `README.md` (hoje é o padrão do create-next-app) para apresentar o projeto a quem visita o repo.

## Pendências pequenas

- `npm audit` aponta 5 vulnerabilidades altas, todas no `braces` dentro do `eslint-config-next` (só lint, não vai para o site, sem versão corrigida). Aceito por enquanto; nunca rodar `npm audit fix --force`, que instalaria a config do Next 14.
- Textos da abertura (`Opening.tsx`) e da descrição da página (`layout.tsx`) devem passar a vir do JSON. Por enquanto estão escritos à mão ("Mais de 75 anos", "de 1950 até hoje", PR #5).
- A seção de fontes precisa citar a NASA pelas imagens da Terra.
