import { useId } from "react";
import { ResponsiveChart } from "@/components/charts/ResponsiveChart";
import { Reveal } from "@/components/charts/Reveal";
import { StripesChart, stripesChartSizes } from "@/components/charts/StripesChart";
import { SummersChart, summersChartSizes } from "@/components/charts/SummersChart";
import { formatNumber } from "@/lib/format";
import { anomalyColors } from "@/lib/temperatureColor";
import { temperatureData } from "@/lib/temperatureData";
import styles from "./Dashboard.module.css";
import { GlowGrid } from "./GlowGrid";
import { Panel } from "./Panel";
import { Records } from "./Records";
import { YearComparison } from "./YearComparison";

const { comparison, meta, summers, years } = temperatureData;
const { baseline } = comparison;

const baselineLabel = `${baseline.startYear} a ${baseline.endYear}`;
const firstYear = years[0].year;
const lastYear = years.at(-1)!.year;

// Ano que aparece escolhido quando a página abre. Se ele não estiver nos
// dados, o painel usa o último ano.
const initialYear = 1990;

// Seção "Explore os dados": grade de painéis depois do capítulo 4, para a
// pessoa explorar os mesmos dados da matéria.
export function Dashboard() {
  const titleId = useId();

  return (
    <section className={styles.section} aria-labelledby={titleId}>
      <header className={styles.header}>
        <h2 id={titleId} className={styles.title}>
          Explore os dados
        </h2>
        <p className={styles.intro}>
          Os mesmos dados da matéria, de {firstYear} a {lastYear}, para tu explorares.
          Passa o mouse ou toca nos gráficos para ver os valores de cada ano.
        </p>
      </header>

      <GlowGrid>
        <Panel
          area="stripes"
          title="Listras do calor"
          description={`Uma listra por ano, de ${firstYear} a ${lastYear}. A cor mostra quanto o ano ficou acima (laranja) ou abaixo (azul) da média de ${baselineLabel}.`}
        >
          <Reveal>
            <ResponsiveChart
              sizes={stripesChartSizes}
              render={(size) => <StripesChart {...size} />}
            />
          </Reveal>
          <StripesLegend />
        </Panel>

        <Panel
          area="records"
          title="Os recordes"
          description={`Os anos e verões mais extremos desde ${firstYear}.`}
        >
          <Records />
        </Panel>

        <Panel
          area="year"
          title="O teu ano"
          description="Escolhe um ano, como o ano em que tu nasceste, e compara com o último ano completo."
        >
          <YearComparison
            years={years}
            initialYear={years.some((year) => year.year === initialYear) ? initialYear : lastYear}
            thresholds={meta.thresholds}
          />
        </Panel>

        <Panel
          area="summers"
          title="Verão a verão"
          description={`Dias acima de ${meta.thresholds.veryHotDay} °C em cada verão, de ${summers[0].summer} a ${summers.at(-1)!.summer}. A linha tracejada é a média de ${baselineLabel}: ${formatNumber(baseline.summers.daysAbove35, { fractionDigits: 1 })} dias por verão.`}
        >
          <Reveal>
            <ResponsiveChart
              sizes={summersChartSizes}
              render={(size) => <SummersChart {...size} />}
            />
          </Reveal>
        </Panel>
      </GlowGrid>
    </section>
  );
}

// Régua de cores das Listras: as sete cores, do mais frio ao mais quente,
// com rótulos nas pontas e no meio. A cor nunca fica sozinha: o balão do
// gráfico dá o valor exato de cada ano. Cinza vai de -0,15 °C a +0,15 °C da
// média (ver temperatureColor.ts).
function StripesLegend() {
  return (
    <div className={styles.stripesLegend}>
      <div className={styles.stripesScale} aria-hidden="true">
        {anomalyColors.map((color) => (
          <span key={color} style={{ background: color }} />
        ))}
      </div>
      <div className={styles.stripesScaleLabels}>
        <span>mais frio</span>
        <span>cinza: perto da média</span>
        <span>mais quente</span>
      </div>
    </div>
  );
}
