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

// Data por extenso, como "16 de novembro de 2026", a partir de "2026-11-16".
// A data é lida e escrita em UTC: sem isso, o fuso do computador poderia
// mudar o dia (meia-noite em UTC ainda é o dia anterior no Brasil).
// O primeiro dia do mês leva o "º" ("1º de janeiro"), como se escreve no
// Brasil; o Intl escreveria só "1 de janeiro".
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const text = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
  return day === 1 ? text.replace(/^1 /, "1º ") : text;
}
