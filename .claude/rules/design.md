# Design

- Tom de matéria de jornalismo de dados: limpo, editorial, fácil de ler. Precisa parecer algo que caberia no site de um cliente.
- Página inteira em dark mode, não só a abertura. Tema único: não segue o tema do sistema e não tem botão de troca.
- Referência visual: NASA Eyes on the Solar System. Aparência de espaço real, fotográfica e sóbria, com o texto mantendo o tom editorial (títulos em serifa).
- Fundo praticamente preto, levemente azulado (`#03040a`), nunca cinza.
- Texto em branco suave (`#e6e8ef`), nunca branco puro `#fff`.
- Realismo, não ficção científica: nada de neon, glow exagerado, grades, HUD ou estética cyberpunk.
- Nada de visual de terminal.
- Gráficos com visual próprio, não o padrão da biblioteca.
- Cores definidas como variáveis em `src/app/globals.css`. Usar as variáveis, nunca hex solto nos componentes.
- Contraste mínimo contra o fundo: 4.5:1 para texto e 3:1 para marcas de gráfico (linhas, barras, pontos).
- Paleta de temperatura divergente, do frio ao quente: azul de um lado, vermelho-alaranjado do outro e cinza neutro no meio (`--temp-cold-3` até `--temp-hot-3`). Quanto mais extremo, mais claro e intenso, porque no fundo escuro é o que mais salta aos olhos. Os dois lados têm a mesma claridade em cada degrau. Todos os tons passam de 4:1 contra o fundo. Ao mudar a paleta ou o fundo, validar o contraste de novo com cálculo, não no olho.
- A cor nunca carrega a informação sozinha: sempre junto com rótulo, posição ou texto.
- `border-radius` pequeno, por volta de 4px.
- Largura (decisão de 21/11/2026): todas as seções têm sempre a mesma largura, de margem a margem (`--page-gutter`). Ou tudo cresce, ou tudo para junto: nunca uma seção mais larga que as outras.
- Telas largas (decisão de 21/11/2026): acima de 1440px, o tamanho base das letras cresce com a tela (16px até cerca de 21,5px em 2536px), em `globals.css`. Textos, colunas, espaços e rótulos dos gráficos usam `rem`, então a página inteira cresce junto. Por isso, tamanho de letra sempre em `rem`, nunca em `px`, inclusive dentro dos SVGs.
- Sem fundos de seção alternando cor e sem enfiar conteúdo em cards genéricos.
- Acessibilidade: cada gráfico com descrição em texto do que mostra. Imagens sempre com `alt` descritivo, nunca vazio.

## Referências visuais para os gráficos

As referências são direção visual, não algo para copiar. Todas as regras acima continuam valendo (bordas de 4px, cores das variáveis, contraste, títulos em serifa). O código dos templates (Tailwind) não entra no projeto.

### Capítulos 1 a 4

Referência: imagem do dashboard deste template do 21st.dev: https://cdn.21st.dev/waleedkibhen/saa-s-template/default/bundle.1760472833620.html

O que trazer:

- Número grande em destaque com legenda curta embaixo (ex.: "+1,2 °C" / "mais quente que nos anos 1960"), um por capítulo, perto do gráfico.
- Gráficos limpos sobre o fundo escuro: só linhas de grade horizontais, bem apagadas; rótulos dos eixos pequenos e em cinza suave; sem borda em volta do gráfico.
- Linha com pontos e área preenchida embaixo dela, sumindo em degradê para o fundo.
- Muito espaço vazio e hierarquia clara: número, frase, gráfico.

O que não trazer:

- Caixas e grade de cards nos capítulos: os números ficam soltos na seção, separados por espaço.
- Verde e vermelho para "subiu/caiu" sem texto: a cor segue a paleta de temperatura e sempre vem com rótulo.
- Rosca (donut), avatares, menu lateral e busca: não fazem parte da matéria.
- Tailwind, Poppins e branco puro: o projeto usa CSS Modules, títulos em serifa e `#e6e8ef`.

### Painel final (dashboard)

Referência principal, a preferida da Flávia: bento grid do 21st.dev: https://cdn.21st.dev/themeocean/interactive-tech-stack-bento-grid-with-hover-effects/default/bundle.1793175605062-7d3cabfa-dac5-4619-8db8-3aae177affda.html

A ideia é um dashboard como os montados no Metabase ou no Looker: cara de painel interativo e vivo.

- Grade de painéis de tamanhos diferentes. Aqui o card tem papel claro (cada painel mostra um dado ou gráfico próprio), então é a exceção à regra de cards. A exceção vale só para esta seção.
- Luz que segue o mouse: a borda do painel acende com um círculo de cor que acompanha o cursor, com um brilho fraco por dentro. Cores da paleta do projeto, efeito sutil.
- No celular, onde não há hover, o efeito responde ao toque.

### Interação nos gráficos (capítulos e painel)

- Gráfico interativo: ao passar o mouse (ou tocar), aparece uma linha guia vertical e um balão com o valor daquele ponto.
- Números contando: o número grande sobe ou desce até o valor final.
- Gráficos e números podem se mexer, mas o movimento sempre representa o dado real vindo da API (por exemplo, percorrendo os anos da série). Nunca valores inventados ou aleatórios.
- Sem selo "Live" ou "ao vivo": os dados são atualizados uma vez por mês.
- Com `prefers-reduced-motion`, mostrar direto o valor e o estado final, sem animação.

O que não trazer do bento:

- A grade quadriculada que aparece sob o cursor (regra "nada de grades").
- Brilho forte nas linhas do gráfico e nos pontos (sombra neon).
- Painel de terminal, anéis do Lighthouse e ícones de tecnologias.
- Cantos muito arredondados (`rounded-3xl`): continua 4px.
