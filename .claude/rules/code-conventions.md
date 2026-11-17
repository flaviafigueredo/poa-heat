---
paths:
  - "**/*.{ts,tsx,js,jsx,mjs,cjs,css,svg}"
  - ".github/workflows/*.{yml,yaml}"
---

# Convenções de código

- Identificadores (funções, variáveis, tipos) sempre em inglês.
- Só camelCase em todos os identificadores, inclusive constantes. Nada de SCREAMING_SNAKE_CASE.
- Exceção: nomes de parâmetros e campos que a API exige (como `temperature_2m_min`) ficam como a API espera na requisição, mas os dados são convertidos para camelCase no código do projeto.
- Comentários em português, explicando o que cada trecho faz e por quê, principalmente nas partes menos óbvias (cálculos, transformação de dados, configuração do workflow).
- Comentários servem só para explicar o código. Nunca recados, lembretes, TODOs ou marcadores de tarefa.
- Componentizar e reaproveitar sempre que fizer sentido (ex.: o mesmo componente de número em destaque nos quatro capítulos). Não é regra rígida: se encaixar um componente existente exige dar voltas, escrever um novo é melhor.
