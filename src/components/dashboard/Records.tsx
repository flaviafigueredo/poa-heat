import { max } from "d3-array";
import { formatNumber, formatTemperature } from "@/lib/format";
import { temperatureData } from "@/lib/temperatureData";
import styles from "./Records.module.css";

const { meta, summers, years } = temperatureData;

// Todos os itens com o maior valor, e não só o primeiro: se dois anos
// empatarem no recorde, os dois aparecem.
function findRecords<T>(list: T[], value: (item: T) => number) {
  const highest = max(list, value)!;
  return { value: highest, items: list.filter((item) => value(item) === highest) };
}

const listFormat = new Intl.ListFormat("pt-BR");

const hottestYear = findRecords(years, (year) => year.meanTemp);
const mostVeryHotDays = findRecords(years, (year) => year.daysAbove35);
const hottestSummer = findRecords(summers, (summer) => summer.meanTemp);
const mostWarmNights = findRecords(years, (year) => year.warmNights);

const records = [
  {
    label: "Ano mais quente",
    when: listFormat.format(hottestYear.items.map((year) => String(year.year))),
    value: `média de ${formatTemperature(hottestYear.value)}`,
  },
  {
    label: `Ano com mais dias acima de ${meta.thresholds.veryHotDay} °C`,
    when: listFormat.format(mostVeryHotDays.items.map((year) => String(year.year))),
    value: `${formatNumber(mostVeryHotDays.value)} dias`,
  },
  {
    label: "Verão mais quente",
    when: listFormat.format(hottestSummer.items.map((summer) => String(summer.summer))),
    value: `média de ${formatTemperature(hottestSummer.value)}`,
  },
  {
    label: `Ano com mais noites de mínima de ${meta.thresholds.warmNight} °C ou mais`,
    when: listFormat.format(mostWarmNights.items.map((year) => String(year.year))),
    value: `${formatNumber(mostWarmNights.value)} noites`,
  },
];

// Lista curta dos recordes da série. Cada item: o que é, quando foi (em
// destaque) e o valor.
export function Records() {
  return (
    <dl className={styles.list}>
      {records.map((record) => (
        <div key={record.label} className={styles.item}>
          <dt className={styles.label}>{record.label}</dt>
          <dd className={styles.when}>{record.when}</dd>
          <dd className={styles.value}>{record.value}</dd>
        </div>
      ))}
    </dl>
  );
}
