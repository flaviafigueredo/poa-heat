# Stack e arquitetura

- Next.js com TypeScript.
- Deploy no Cloudflare Pages, automático a cada push.
- Repo público no GitHub.
- Fluxo de dados:
  1. Um script em TypeScript busca os dados na Open-Meteo, calcula os números e salva um JSON no repo.
  2. Um workflow do GitHub Actions roda o script uma vez por mês (schedule) e faz commit só se o JSON mudou.
  3. O push dispara o deploy.
- O site nunca chama a API no navegador. Ele só lê o JSON gerado.

## Gráficos (decisão de 16/11/2026)

- D3 só para os cálculos, React para desenhar o SVG.
- Instalar só os módulos usados (`d3-scale`, `d3-shape`, `d3-array` e outros quando precisar), nunca o pacote `d3` inteiro.
- O D3 nunca mexe no DOM (nada de `d3.select`). Quem desenha é o JSX, assim o SVG sai pronto no HTML do build estático.
- Interações (linha guia, balão, animações) são feitas à mão, em React e CSS.
- Motivos: visual totalmente próprio, gráfico visível antes do JavaScript carregar, SVG acessível, pacote leve no celular, e é o jeito como redações de dados trabalham.
