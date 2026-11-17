# Capítulos da página

Cada capítulo de gráfico (1 a 4) abre com um número em destaque vindo do JSON (ver "Capítulos 1 a 4" em `design.md`).

Layout (decisão de 16/11/2026): a partir de 1280px, o capítulo usa a mesma largura da abertura, com as mesmas margens (`--page-gutter`) dos dois lados, em qualquer tamanho de tela. Texto à esquerda (coluna de 26rem a 32rem) e gráfico à direita ocupando o resto, preso na tela (`sticky`) enquanto se lê. Abaixo de 1280px, uma coluna só, centralizada. Os gráficos têm três versões (`ResponsiveChart`): celular (até 899px), larga (900px a 1799px) e extralarga, mais achatada (a partir de 1800px). O texto não contorna o gráfico, porque as linhas embaixo dele ficariam longas demais para ler. Tudo isso já está no componente `Chapter`.

Comparação comum a todos os capítulos (decisão de 16/11/2026): os últimos 10 anos completos contra a base de 1961 a 1990 (ver `analysis-care.md`). A janela anda sozinha quando o workflow traz um ano novo. Não comparar década com década no número em destaque, porque a década atual está incompleta.

Os valores entre parênteses são dos dados de 12/11/2026 (2016 a 2025) e servem só de referência: na página, tudo vem do JSON.

1. **A tendência:** temperatura média por ano desde 1950, com linha de tendência e a faixa de 1961 a 1990 marcada.
   - Pergunta: Porto Alegre está mais quente do que antes?
   - Destaque: diferença da média dos últimos 10 anos para a base (+0,5 °C).
   - Anotação possível: quantos anos desde 2000 ficaram acima da média da base (19 de 26).
   - Texto: a alta é lenta e varia muito de ano para ano. Sem exagero.
2. **Os extremos:** quantos dias por ano passaram de 30°C ou 35°C, agrupados por década.
   - Pergunta: os dias de calor forte ficaram mais comuns?
   - Destaque: dias por ano acima de 35 °C (6,8, contra 2,8 na base). Os dias acima de 30 °C ficam no gráfico, não no destaque.
   - Anotação possível: quatro dos cinco anos com mais dias acima de 35 °C são de 2012 para cá.
   - A década atual leva o aviso "década em andamento".
3. **As noites:** quantas noites não baixaram de 20°C.
   - Pergunta: as noites ficaram mais quentes?
   - Destaque: noites por ano com mínima de 20 °C ou mais (77, contra 62 na base).
   - Texto: o número subiu de uma vez nos anos 1980 e depois ficou estável. Não vender como subida contínua.
4. **O teu verão vs o dos teus pais:** uma frase simples comparando o verão (dezembro a fevereiro) dos últimos 10 anos com o da base.
   - Pergunta: como é um verão hoje, comparado com o de uma geração atrás?
   - Foco só nos dias acima de 35 °C (5,6 por verão, contra 1,8 na base). Ex.: "Um verão típico hoje tem 5 ou 6 dias acima de 35 °C. No verão dos teus pais, eram 1 ou 2."
5. **Como os dados foram feitos:** fonte, o que é reanálise e limites da análise.
   - É uma `<section>` com título próprio no fim do `<main>`, não o footer: fontes e metodologia são conteúdo da matéria (padrão "Metodologia" do NYT e do The Pudding).
   - Conteúdo: Open-Meteo com licença CC BY 4.0, modelo usado (ERA5-Land) e o ponto da grade devolvido pela API; o que é reanálise em linguagem simples; limites da análise (mostra o que aconteceu, não prova a causa sozinha); créditos das imagens da Terra (NASA Blue Marble Next Generation e GEBCO); data da última atualização.
   - Criar só quando o script de dados existir, porque modelo, ponto da grade e data vêm do JSON.

## Painel final

- Fica depois do capítulo 4 e antes do capítulo 5 (metodologia).
- É um dashboard em grade de painéis, para explorar os dados da matéria (ver "Painel final" em `design.md`).
- Os capítulos 1 a 4 continuam contando a história na rolagem, sem caixas.
- Título da seção: "Explore os dados".

### Painéis (decisão de 16/11/2026)

Todos usam só o que o JSON já tem (`years` e `summers`) e comparam com a base de 1961 a 1990.

1. **Listras do calor** (painel grande): uma listra por ano desde 1950, colorida pela diferença para a média da base, com a paleta de temperatura. No hover ou toque, ano e diferença em °C.
   - Pergunta: quais anos foram mais quentes ou mais frios que a média de 1961 a 1990?
2. **O teu ano**: a pessoa escolhe um ano e vê a média, os dias acima de 30 °C e de 35 °C e as noites quentes daquele ano, ao lado dos mesmos números do último ano completo.
   - Pergunta: como foi o ano em que tu nasceste, comparado com hoje?
3. **Os recordes**: lista curta com o ano mais quente, o ano com mais dias acima de 35 °C, o verão mais quente e o ano com mais noites quentes, cada um com o valor.
   - Pergunta: quais foram os anos e verões mais extremos?
4. **Verão a verão**: barras com os dias acima de 35 °C em cada verão desde 1951, com a média da base marcada.
   - Pergunta: quais verões tiveram mais dias acima de 35 °C?

## Footer

- Curto, depois do `<main>`: nome da Flávia, link para o portfólio e link para o repositório no GitHub.
- Nada de fontes ou metodologia aqui (ficam no capítulo 5).
