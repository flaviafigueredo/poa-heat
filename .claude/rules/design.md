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
- Sem fundos de seção alternando cor e sem enfiar conteúdo em cards genéricos.
- Acessibilidade: cada gráfico com descrição em texto do que mostra. Imagens sempre com `alt` descritivo, nunca vazio.
