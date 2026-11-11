# Capítulos da página

Cada capítulo de gráfico (1 a 4) abre com um número em destaque vindo do JSON (ver "Referência para os gráficos" em `design.md`).

1. **A tendência:** temperatura média por ano desde 1940, com linha de tendência.
2. **Os extremos:** quantos dias por ano passaram de 30°C ou 35°C, agrupados por década.
3. **As noites:** quantas noites não baixaram de 20°C.
4. **O teu verão vs o dos teus pais:** comparação entre uma década recente e uma antiga, numa frase simples.
5. **Como os dados foram feitos:** fonte, o que é reanálise e limites da análise.
   - É uma `<section>` com título próprio no fim do `<main>`, não o footer: fontes e metodologia são conteúdo da matéria (padrão "Metodologia" do NYT e do The Pudding).
   - Conteúdo: Open-Meteo com licença CC BY 4.0, modelo usado (ERA5 ou ERA5-Land) e o ponto da grade devolvido pela API; o que é reanálise em linguagem simples; limites da análise (mostra o que aconteceu, não prova a causa sozinha); créditos das imagens da Terra (NASA Blue Marble Next Generation e GEBCO); data da última atualização.
   - Criar só quando o script de dados existir, porque modelo, ponto da grade e data vêm do JSON.

## Painel final

- Fica depois do capítulo 4 e antes do capítulo 5 (metodologia).
- É um dashboard em grade de painéis, para explorar os dados da matéria (ver "Painel final" em `design.md`).
- Os capítulos 1 a 4 continuam contando a história na rolagem, sem caixas.

## Footer

- Curto, depois do `<main>`: nome da Flávia, link para o portfólio e link para o repositório no GitHub.
- Nada de fontes ou metodologia aqui (ficam no capítulo 5).
