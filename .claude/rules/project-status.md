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

- Capítulo 2 (os extremos) aprovado e com merge em 19/11/2026 (PR #15): `ExtremesChapter` e `ExtremesChart`.
  - Dois painéis de barras por década empilhados (acima de 30 °C e acima de 35 °C), cada um com a própria escala, porque no mesmo eixo as barras de 35 °C ficariam achatadas.
  - Década em andamento com barra tracejada, aviso embaixo e na legenda. Barras crescem uma por vez, da década mais antiga para a mais recente.
  - `ChartHover` aceita ponto sem bolinha (`y` opcional, para barras) e `ChartLegend` ganhou a marca `bar`.
  - Teste de celular com o Edge sem janela: ele não desce de 492px de largura, então o celular foi simulado com a página dentro de um iframe de 390px.

- Capítulo 3 (as noites) aprovado em 19/11/2026: `NightsChapter` e `NightsChart`.
  - Um ponto cinza por ano e a média de cada década em degraus laranja, com o eixo começando em zero. Os degraus mostram o salto dos anos 1980 e o platô depois, sem vender subida contínua.
  - O maior salto entre décadas completas é calculado (`biggestJump`) e anotado no gráfico.
  - Aviso no texto de que o salto coincide com a era dos satélites na reanálise (ver `analysis-care.md`).

- Capítulo 4 (o teu verão vs o dos teus pais) aprovado em 19/11/2026: `SummerChapter` e `SummerChart`.
  - Gráfico de quadradinhos: 90 por verão, um por dia, em duas grades (últimos 10 verões e 1961 a 1990). Os dias acima de 35 °C acendem um por um, e o último fica preenchido só pela fração da média, sem arredondar.
  - Sem linha guia nem balão, porque não há eixo de anos: os números estão nos rótulos.
  - A frase principal vem do JSON e fala como no dia a dia ("5 ou 6 dias", não "5,9").

- Painel final ("Explore os dados") aprovado em 19/11/2026, em `src/components/dashboard/`.
  - Grade bento: a partir de 1280px, três colunas (Listras e Recordes em cima, O teu ano e Verão a verão embaixo); de 900px a 1279px, duas colunas; no celular, uma.
  - Luz que segue o cursor: `GlowGrid` passa a posição do ponteiro para cada painel (`--glow-x`, `--glow-y`), e o CSS desenha a borda acesa (máscara com `exclude`) e o brilho fraco por dentro. No toque, a luz fica onde o dedo tocou.
  - Painéis: `StripesChart` e `SummersChart` (em `charts/`, com `ChartHover`), `Records` (empates mostram todos os anos) e `YearComparison` (única parte no navegador, começa em 1990).
  - `temperatureColor.ts` exporta os limites e as cores, para a régua das Listras.
  - No teste com o Edge sem janela, as transições não avançam no relógio virtual. Para ver a luz no print, rodar com `--force-prefers-reduced-motion`.

- Capítulo 5 ("Como os dados foram feitos") com conteúdo aprovado em 21/11/2026: `MethodologyChapter`, no fim do `<main>`, depois do painel.
  - Blocos: de onde vêm os números (fonte, licença, modelo, ponto da grade, período e atualização, tudo do JSON), o que é reanálise, como as contas foram feitas, por que comparar com 1961 a 1990 (com a diferença calculada para a referência da OMM, 1991 a 2020), limites da análise (inclusive o salto de 1979) e créditos das imagens da NASA e do código.
  - `format.ts` ganhou `formatDate` ("1º de janeiro de 1950").
  - Layout (revisão do design, 21/11/2026): a partir de 1280px, duas colunas com as medidas dos outros capítulos. Em cima, a abertura (fonte e reanálise) ao lado do mapa. Embaixo, os outros quatro blocos em pares, lidos linha a linha, cada um completo e com uma linha fina em cima (como um FAQ). O texto nunca continua de uma coluna para a outra. No celular, o mapa vem logo depois de "O que é reanálise".
  - Mapa (`GridMap`): Porto Alegre e cidades vizinhas, o Guaíba, a grade de 0,1 grau do ERA5-Land, o quadrado de onde vêm os números e o ponto pedido. Escolhido pela Flávia em 21/11/2026.
  - Contornos da malha municipal do IBGE, gerados por `scripts/build-map.ts` (`npm run map`) em `src/data/portoAlegreMap.json` (14,5 KB, recortados e simplificados). A malha não tem água: o Guaíba é o espaço entre as cidades. Não entra no workflow mensal.
  - Os nomes no mapa são HTML por cima do SVG, para o texto ter o mesmo tamanho em qualquer tela. O mapa sai uma vez só no HTML, sem `ResponsiveChart`.

- Footer aprovado em 21/11/2026: `Footer`, depois do `<main>`, com "Feito com 🧡 por Flávia Figueredo" (link para o portfólio, flaviafigueredo.dev.br) e o link do repositório. Os dois endereços ficam em `src/lib/site.ts`. Quando as duas frases não cabem na mesma linha, elas empilham no centro (consulta `@container` pela largura do próprio footer).

- Textos da abertura e descrição da página vindo do JSON, aprovados em 21/11/2026: `seriesLengthText` ("Mais de 76 anos", conta os anos completos e põe "Mais de" quando há meses do ano seguinte) e `seriesStartYear`, em `temperatureData.ts`.

- Indicador de progresso (21/11/2026): `ProgressIndicator`. Na tela larga, um pontinho por seção na margem direita (botões que levam à seção, com o nome no hover ou foco); no celular, linha fina no topo. Só aparece depois da abertura. As seções são achadas pelo atributo `data-progress-label`.

- Revisão do design concluída em 21/11/2026, na branch `feat/design-review`: página inteira cresce junto acima de 1440px, indicador de progresso, rótulo dos capítulos como abertura de capítulo de livro, larguras iguais em todas as seções em qualquer tela, versões dos gráficos escolhidas pela largura que ocupam, colunas de texto e gráfico equilibradas (texto até 40%) e capítulo 5 em blocos lidos linha a linha.

## Próximos passos

Ordem combinada com a Flávia em 19/11/2026:

1. No fim do projeto: reescrever o `README.md` (hoje é o padrão do create-next-app) para apresentar o projeto a quem visita o repo.

## Pendências pequenas

- `npm audit` zerado em 16/11/2026 (Next e `eslint-config-next` 16.4.6, mais `npm audit fix`). Nunca rodar `npm audit fix --force`, que pode instalar versões antigas do `eslint-config-next`.