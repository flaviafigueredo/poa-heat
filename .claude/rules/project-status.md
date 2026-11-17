# Onde paramos (16/11/2026, fim do dia)

## Pronto

- Projeto Next.js 16 + TypeScript criado na raiz, com App Router, pasta `src/`, CSS Modules (sem Tailwind) e React Compiler.
- `next.config.ts` com `output: "export"` (site estático na pasta `out`). `cacheComponents` e `partialPrefetching` foram removidos porque quebram o export estático.
- Abertura pronta e aprovada pela Flávia ("bem como estava na minha cabeça"). Não mexer no visual sem pedido.
  - `src/components/opening/`: `Opening` (layout e texto), `Starfield` (estrelas em SVG geradas no build), `GlobeLoader` (carrega o globo só no navegador) e `EarthGlobe` (globo com `react-globe.gl` e zoom até Porto Alegre).
  - `prefers-reduced-motion`: câmera já começa sobre Porto Alegre, sem animação.
  - Na tela larga (a partir de 900px), a abertura tem uma faixa extra embaixo (`--globe-overflow`, 25svh) para o globo aparecer inteiro e sumir no escuro antes do capítulo 1. O `EarthGlobe` sobe o globo metade dessa faixa para ele continuar centralizado na primeira tela (pedido da Flávia em 16/11/2026).
  - Texturas em `public/textures/`: `earth-topo-bathy.webp` (NASA Blue Marble Next Generation, 4096 px) e `earth-bump.webp` (relevo "Topography" da NASA Blue Marble Next Generation, dados GEBCO, 2048 px).
- Cores e paleta de temperatura em `src/app/globals.css`, validadas contra o fundo `#03040a`, mais três cores de apoio dos gráficos (`--color-grid`, `--color-border`, `--color-surface`).
- Coordenadas de Porto Alegre em `src/lib/portoAlegre.ts`, para o script de dados reaproveitar.
- Favicon próprio em `src/app/icon.svg` (círculo com listras de aquecimento nas cores da paleta), aprovado pela Flávia. O `favicon.ico` padrão do Next foi removido. Comentários dentro do SVG não podem ter `--`, senão o arquivo fica inválido.
- `<body>` com `suppressHydrationWarning`, porque extensões de navegador que alteram o HTML geram aviso de hidratação.
- Instruções do projeto divididas em `.claude/rules/`, com as referências visuais do dashboard e o escopo novo.
- Modelo de dados escolhido: ERA5-Land, com série desde 1950 (ver `data-source.md`).
- Script de dados em `scripts/fetch-temperature.ts`, rodando com `npm run data` (Node 24 executa TypeScript direto, sem dependências). Gera `src/data/temperature.json` com:
  - `meta`: fonte, licença, modelo, coordenadas pedidas, ponto da grade, período e data da atualização.
  - `years`: um item por ano completo (1950 a 2025), com temperatura média, dias acima de 30 °C e de 35 °C e noites com mínima ≥ 20 °C.
  - `summers`: os mesmos números por verão (dezembro, janeiro e fevereiro; o verão leva o ano de janeiro). Só verões completos (1951 a 2026).
  - `comparison`: médias da base de 1961 a 1990 e dos últimos 10 anos e verões completos, mais a tendência da média anual (`trend.meanTemp`: °C por década e pontos de início e fim da reta).
  - `decades`: médias por década, com `complete: false` e `yearCount` na década em andamento.
  - A data de atualização usa o fuso de Porto Alegre.
  - Se a API falhar ou vier dia sem valor, o script para com erro e não salva nada. A API bloqueia por um minuto quem faz pedidos demais.
- `package.json` com `"type": "module"` e `tsconfig.json` com `allowImportingTsExtensions`, para o script importar `src/lib/portoAlegre.ts`.
- Workflow `.github/workflows/update-data.yml`: roda no dia 10 de cada mês (o ERA5-Land chega com alguns dias de atraso) e tem botão para rodar à mão. Faz commit na `main` só se o JSON mudou. Testado à mão em 12/11/2026, terminou verde.
- Capítulo 1 (a tendência) pronto e aprovado pela Flávia em 16/11/2026, com D3 (`d3-scale`, `d3-shape`, `d3-array`) para as contas e React para o SVG.
  - Peças reaproveitáveis em `src/components/chapters/` (`Chapter`, `HighlightNumber`, `Prose`) e `src/components/charts/` (`ChartFigure`, `ChartLegend`, `ChartHover`, `ResponsiveChart`, `DataTable`, `CountUp`, `Reveal`).
  - Funções compartilhadas em `src/lib/`: `format.ts` (números no padrão brasileiro), `temperatureColor.ts` (cor pela diferença para a base, também para as Listras do painel), `temperatureData.ts` (JSON com tipos) e `useReveal.ts` (animação quando entra na tela, respeitando `prefers-reduced-motion`).
  - Layout do capítulo e as três versões dos gráficos: ver `chapters.md`.
  - Testado com prints e hover automatizados no Edge (celular, 1100, 1280, 1440, 1800 e 2541px). Para isso, foi criada e apagada uma rota temporária `src/app/preview-chapter`.

## Próximos passos

1. Construir os capítulos 2 a 4 com as peças do capítulo 1. Capítulo 2 usa `decades` (barras por década, com aviso na década em andamento); capítulo 4 usa `comparison.*.summers`.
2. Construir o painel final, com a luz no hover.
3. Capítulo 5 (metodologia), footer e os textos da abertura vindo do JSON.
4. No fim do projeto: reescrever o `README.md` (hoje é o padrão do create-next-app) para apresentar o projeto a quem visita o repo.

## Pendências pequenas

- `npm audit` zerado em 16/11/2026 (Next e `eslint-config-next` 16.4.6, mais `npm audit fix`). Nunca rodar `npm audit fix --force`, que pode instalar versões antigas do `eslint-config-next`.
- Textos "Mais de 75 anos" e "de 1950 até hoje" na abertura (`Opening.tsx`) e na descrição da página (`layout.tsx`) ainda estão escritos à mão. Devem passar a vir do JSON (`meta.startDate`).
- A seção de fontes precisa citar a NASA pelas imagens da Terra.
