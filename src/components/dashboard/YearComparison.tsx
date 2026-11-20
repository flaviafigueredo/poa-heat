"use client";

import { useId, useState } from "react";
import { formatNumber, formatTemperature } from "@/lib/format";
import type { YearSummary } from "@/lib/temperatureData";
import styles from "./YearComparison.module.css";

type YearComparisonProps = {
  years: YearSummary[];
  // Ano escolhido quando a página abre.
  initialYear: number;
  thresholds: { hotDay: number; veryHotDay: number; warmNight: number };
};

// A pessoa escolhe um ano e vê os números dele ao lado dos do último ano
// completo. Os dados chegam do servidor por props; aqui só se guarda qual
// ano está escolhido.
export function YearComparison({ years, initialYear, thresholds }: YearComparisonProps) {
  const selectId = useId();
  const [selectedYear, setSelectedYear] = useState(initialYear);

  const latest = years.at(-1)!;
  const selected = years.find((year) => year.year === selectedYear) ?? latest;

  const rows = [
    {
      label: "Temperatura média",
      format: (year: YearSummary) => formatTemperature(year.meanTemp),
    },
    {
      label: `Dias acima de ${thresholds.hotDay} °C`,
      format: (year: YearSummary) => formatNumber(year.daysAbove30),
    },
    {
      label: `Dias acima de ${thresholds.veryHotDay} °C`,
      format: (year: YearSummary) => formatNumber(year.daysAbove35),
    },
    {
      label: `Noites com mínima de ${thresholds.warmNight} °C ou mais`,
      format: (year: YearSummary) => formatNumber(year.warmNights),
    },
  ];

  // Resumo em uma frase, com os dias acima de 35 °C, que são o centro da
  // matéria. Também é lido pelos leitores de tela quando o ano muda.
  const difference = latest.daysAbove35 - selected.daysAbove35;
  let summary: string;
  if (selected.year === latest.year) {
    summary = `Este é o último ano completo dos dados.`;
  } else if (difference === 0) {
    summary = `${latest.year} teve o mesmo número de dias acima de ${thresholds.veryHotDay} °C que ${selected.year}.`;
  } else {
    const amount = Math.abs(difference);
    summary = `${latest.year} teve ${amount} ${amount === 1 ? "dia" : "dias"} acima de ${thresholds.veryHotDay} °C a ${difference > 0 ? "mais" : "menos"} que ${selected.year}.`;
  }

  return (
    <div>
      <label className={styles.field} htmlFor={selectId}>
        <span className={styles.fieldLabel}>Escolhe um ano</span>
        <select
          id={selectId}
          className={styles.select}
          value={selectedYear}
          onChange={(event) => setSelectedYear(Number(event.target.value))}
        >
          {years.map((year) => (
            <option key={year.year} value={year.year}>
              {year.year}
            </option>
          ))}
        </select>
      </label>

      <table className={styles.table}>
        <caption className="visually-hidden">
          Números de {selected.year} comparados com os de {latest.year}
        </caption>
        <thead>
          <tr>
            <td />
            <th scope="col">{selected.year}</th>
            <th scope="col">{latest.year}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              <td>{row.format(selected)}</td>
              <td>{row.format(latest)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className={styles.summary} aria-live="polite">
        {summary}
      </p>
    </div>
  );
}
