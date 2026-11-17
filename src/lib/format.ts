// Formatação de números no padrão brasileiro (vírgula decimal). Fica num
// arquivo só para o servidor e o navegador escreverem os números do mesmo
// jeito: se o texto mudar entre os dois, o React acusa erro de hidratação.

// Espaço que não quebra linha, para "19,3" e "°C" nunca ficarem separados.
const nonBreakingSpace = " ";

type NumberOptions = {
  fractionDigits?: number;
  // Mostra o sinal de "+" nos positivos, para diferenças como "+0,5 °C".
  signed?: boolean;
};

export function formatNumber(
  value: number,
  { fractionDigits = 0, signed = false }: NumberOptions = {},
): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
    signDisplay: signed ? "exceptZero" : "auto",
  }).format(value);
}

export function formatTemperature(value: number, options: NumberOptions = {}): string {
  return `${formatNumber(value, { fractionDigits: 1, ...options })}${nonBreakingSpace}°C`;
}
