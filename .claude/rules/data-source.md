# Fonte de dados

- Open-Meteo Historical Weather API: `https://archive-api.open-meteo.com/v1/archive`
- Sem chave, sem cadastro, grátis para uso não comercial.
- Licença CC BY 4.0: a página precisa citar a fonte.
- São dados de reanálise (estimativa calculada a partir de várias observações, numa grade), não o termômetro de uma estação específica.
- Buscar com `fetch` comum pedindo JSON. Não usar o pacote `openmeteo` (formato binário, mais difícil de ler e desnecessário para uma execução por mês).

## Parâmetros atuais

- `latitude`: -30.0328
- `longitude`: -51.2302 (centro de Porto Alegre, preenchido pela busca da própria documentação)
- `daily`: `temperature_2m_min,temperature_2m_max,temperature_2m_mean`
- `timezone`: `America/Sao_Paulo`
- `start_date`: `1940-01-01`
- `end_date`: último dia do último mês completo
- `models`: obrigatório fixar um único modelo (ERA5 ou ERA5-Land) para todo o projeto. Sem esse parâmetro a API usa "best match", que mistura modelos ao longo do tempo e quebra a comparação entre décadas. Escolha ainda em aberto.
- Registrar as coordenadas devolvidas pela API (o ponto da grade usado de fato), porque elas entram na seção de metodologia.
