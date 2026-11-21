# Porto Alegre está ficando mais quente?

Matéria de jornalismo de dados que responde à pergunta com a temperatura diária de Porto Alegre desde 1950. Uma página com rolagem: a Terra em 3D se aproxima da cidade, e os capítulos mostram, com gráficos, o que mudou na média do ano, nos dias de calor forte, nas noites quentes e no verão.

**Veja no ar:** [poa-heat.pages.dev](https://poa-heat.pages.dev/)

## O que a página mostra

1. **A tendência:** a temperatura média de cada ano, com a linha de tendência e a base de 1961 a 1990.
2. **Os extremos:** quantos dias por ano passaram de 30 °C e de 35 °C, por década.
3. **As noites:** quantas noites não baixaram de 20 °C, com a média de cada década.
4. **O teu verão vs o dos teus pais:** um verão típico de hoje comparado com o de 1961 a 1990.
5. **Explore os dados:** painel com as listras do calor, os recordes, a comparação de um ano escolhido com o último e os dias de calor forte em cada verão.
6. **Como os dados foram feitos:** fonte, o que é reanálise, como as contas foram feitas e os limites da análise.

Todos os números da página vêm dos dados. Quando entra um ano novo, textos, destaques e gráficos se atualizam sozinhos.

## Como funciona

```
Open-Meteo (ERA5-Land)
        │  script em TypeScript busca a temperatura diária e calcula os totais
        ▼
src/data/temperature.json  (salvo no repositório)
        │  GitHub Actions roda o script todo dia 10 e faz commit se os dados mudaram
        ▼
Cloudflare Pages  (novo deploy a cada push na main)
```

O site é estático e nunca chama a API no navegador: ele só lê o JSON gerado.

## Escolhas técnicas

- **Next.js com exportação estática**, TypeScript e CSS Modules.
- **Gráficos com D3 só para as contas** (`d3-scale`, `d3-shape` e `d3-array`) e **React para desenhar o SVG**. Os gráficos saem prontos no HTML do build, antes do JavaScript carregar; só a camada de interação roda no navegador.
- **Cada gráfico tem três versões** (celular, larga e extralarga), escolhidas pela largura que ele ocupa, para os rótulos ficarem sempre perto do tamanho do texto. Acima de 1440px, a página inteira cresce junto com a tela.
- **Acessibilidade:** cada gráfico tem descrição em texto e tabela com os números, dá para navegar pelos pontos com as setas do teclado, e quem ativa `prefers-reduced-motion` vê tudo sem animação.
- **Globo 3D com `react-globe.gl`**, carregado só no navegador, com texturas de até 4096 px para funcionar em celulares mais antigos.
- **Mapa da grade de dados** feito com a malha de municípios do IBGE, recortada e simplificada por um script e salva no repositório.

## Rodar na sua máquina

Precisa do Node 24 (a versão está no `.nvmrc`).

```bash
npm install
npm run dev        # página em http://localhost:3000
npm run build      # gera o site estático na pasta out
```

Outros comandos:

```bash
npm run data       # busca os dados na Open-Meteo e atualiza src/data/temperature.json
npm run map        # refaz o mapa do capítulo 5 a partir da malha do IBGE
npm run lint
npm run typecheck
```

## Dados e créditos

- **Temperatura:** [Open-Meteo](https://open-meteo.com/), licença [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), modelo ERA5-Land, do Copernicus.
- **Limites das cidades:** [malha municipal do IBGE](https://servicodados.ibge.gov.br/api/docs/malhas?versao=3).
- **Imagens da Terra:** NASA, [Blue Marble Next Generation](https://visibleearth.nasa.gov/collection/1484/blue-marble), com relevo feito com dados GEBCO.

A página mostra o que aconteceu com a temperatura em Porto Alegre, mas não prova sozinha por que aconteceu. Os limites da análise estão explicados no capítulo 5.

## Autoria

Feito por [Flávia Figueredo](https://flaviafigueredo.dev.br).
