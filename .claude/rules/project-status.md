# Onde paramos (12/11/2026)

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

## Próximos passos

1. Script de dados: buscar na Open-Meteo, calcular os números e salvar o JSON, junto com o modelo, o ponto da grade e a data de atualização.
2. Workflow do GitHub Actions para rodar o script uma vez por mês.
3. Olhar os dados e montar a história: qual pergunta cada gráfico responde, período de referência e quais painéis entram no painel final.
4. Escolher a biblioteca de gráficos.
5. Construir os capítulos 1 a 4 (número em destaque, gráfico e interações).
6. Construir o painel final, com a luz no hover.
7. Capítulo 5 (metodologia), footer e os textos da abertura vindo do JSON.
8. No fim do projeto: reescrever o `README.md` (hoje é o padrão do create-next-app) para apresentar o projeto a quem visita o repo.

## Pendências pequenas

- `npm audit` aponta 5 vulnerabilidades altas, todas no `braces` dentro do `eslint-config-next` (só lint, não vai para o site, sem versão corrigida). Aceito por enquanto; nunca rodar `npm audit fix --force`, que instalaria a config do Next 14.
- Textos "Mais de 80 anos" e "de 1940 até hoje" na abertura (`Opening.tsx`) e na descrição da página (`layout.tsx`) devem passar a vir do JSON quando o script de dados existir. Por enquanto estão escritos à mão ("Mais de 75 anos", "de 1950 até hoje").
- A seção de fontes precisa citar a NASA pelas imagens da Terra.
