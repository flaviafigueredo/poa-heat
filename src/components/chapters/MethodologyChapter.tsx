import { mean } from "d3-array";
import { useId } from "react";
import { ChartFigure } from "@/components/charts/ChartFigure";
import { ChartLegend } from "@/components/charts/ChartLegend";
import { distanceKm, GridMap, gridStep } from "@/components/charts/GridMap";
import mapData from "@/data/portoAlegreMap.json";
import { formatDate, formatNumber, formatTemperature } from "@/lib/format";
import { repositoryUrl } from "@/lib/site";
import { temperatureData } from "@/lib/temperatureData";
import chapterStyles from "./Chapter.module.css";
import styles from "./MethodologyChapter.module.css";

const { comparison, meta, summers, years } = temperatureData;
const { baseline, recent } = comparison;

// Coordenadas com duas casas, no padrão brasileiro ("-30,03").
const formatCoordinate = (value: number) => formatNumber(value, { fractionDigits: 2 });

// Diferença dos últimos 10 anos para a base usada na página (1961 a 1990) e
// para a referência oficial atual da Organização Meteorológica Mundial
// (1991 a 2020), para mostrar como a escolha da base muda o número.
const wmoStart = 1991;
const wmoEnd = 2020;
const wmoMean = mean(
  years.filter((year) => year.year >= wmoStart && year.year <= wmoEnd),
  (year) => year.meanTemp,
)!;
const differenceFromBaseline = recent.years.meanTemp - baseline.years.meanTemp;
const differenceFromWmo = recent.years.meanTemp - wmoMean;

// Rótulo acima do título, também usado pelo indicador de progresso.
const kicker = "Capítulo 5 · Os dados";

const firstYear = years[0].year;
const lastYear = years.at(-1)!.year;

// Lado do quadrado da grade em km (no sentido norte-sul, o maior dos dois)
// e distância do ponto pedido até o centro do quadrado, para o texto e a
// descrição do mapa.
const cellSizeKm = distanceKm({ lat: 0, lng: 0 }, { lat: gridStep, lng: 0 });
const requestToGridKm = distanceKm(meta.requestedLocation, meta.gridPoint);

// Capítulo 5: fonte, o que é reanálise, como as contas foram feitas e os
// limites da análise. Fica no fim do <main>, depois do painel, porque faz
// parte da matéria (como a seção de metodologia das redações de dados).
export function MethodologyChapter() {
  const titleId = useId();

  return (
    <section
      className={chapterStyles.chapter}
      aria-labelledby={titleId}
      data-progress-label={kicker}
    >
      {/* Grade própria do capítulo 5 (ver o CSS): na tela larga, a abertura
          fica ao lado do mapa, e os outros quatro blocos vêm embaixo, em
          pares, lidos linha a linha. Cada bloco é completo: o texto nunca
          continua na outra coluna. */}
      <div className={styles.layout}>
        <div className={styles.intro}>
          <p className={chapterStyles.kicker}>{kicker}</p>
          <h2 id={titleId} className={chapterStyles.title}>
            Como os dados foram feitos
          </h2>

          <div className={styles.body}>
            <h3>De onde vêm os números</h3>
            <p>
              Os dados são da <a href={meta.sourceUrl}>Open-Meteo</a>, um serviço gratuito de
              dados do tempo, com licença{" "}
              <a href="https://creativecommons.org/licenses/by/4.0/deed.pt-br">
                {meta.license}
              </a>
              . O modelo usado é o ERA5-Land, do Copernicus, o programa europeu de observação
              da Terra.
            </p>
            <p>
              O pedido foi para o centro de Porto Alegre ({formatCoordinate(meta.requestedLocation.lat)},{" "}
              {formatCoordinate(meta.requestedLocation.lng)}). O modelo devolveu o ponto mais
              próximo da grade dele, em {formatCoordinate(meta.gridPoint.lat)},{" "}
              {formatCoordinate(meta.gridPoint.lng)}, a {meta.gridPoint.elevation} metros de
              altitude.
            </p>
            <p>
              A série vai de {formatDate(meta.startDate)} a {formatDate(meta.endDate)}. Os
              dados são buscados de novo todo mês, de forma automática. Última atualização:{" "}
              {formatDate(meta.updatedAt)}.
            </p>

            <h3>O que é reanálise</h3>
            <p>
              Os números não vêm de um termômetro. Vêm de uma reanálise: um modelo de
              computador junta milhões de medições (de estações, balões, navios e satélites) e
              calcula como estava o tempo em cada ponto de uma grade que cobre o planeta. No
              ERA5-Land, a grade tem um ponto a cada {formatNumber(gridStep, { fractionDigits: 1 })}{" "}
              grau, o que dá quadrados de cerca de {formatNumber(cellSizeKm)} km de lado, como
              mostra o mapa deste capítulo.
            </p>
            <p>
              A vantagem é ter uma série longa, desde {firstYear}, sem dias faltando. O custo
              é que cada número representa uma área, e não o que um termômetro marcaria numa
              rua da cidade.
            </p>
          </div>
        </div>
        <div className={styles.map}>
          <MapFigure />
        </div>
        <div className={`${styles.body} ${styles.calculations}`}>
          <h3>Como as contas foram feitas</h3>
          <ul>
            <li>
              Dia acima de {meta.thresholds.hotDay}&nbsp;°C ou de{" "}
              {meta.thresholds.veryHotDay}&nbsp;°C: dia em que a temperatura máxima passou
              desse valor.
            </li>
            <li>
              Noite quente: noite em que a temperatura mínima ficou em{" "}
              {meta.thresholds.warmNight}&nbsp;°C ou mais.
            </li>
            <li>
              Verão: dezembro, janeiro e fevereiro. Cada verão leva o ano de janeiro (o
              verão de {summers.at(-1)!.summer} foi de dezembro de {summers.at(-1)!.summer - 1}{" "}
              a fevereiro de {summers.at(-1)!.summer}).
            </li>
            <li>
              Só entram anos e verões completos: os anos de {firstYear} a {lastYear} e os
              verões de {summers[0].summer} a {summers.at(-1)!.summer}.
            </li>
            <li>
              &ldquo;Hoje&rdquo; é sempre a média dos últimos 10 anos (ou verões) completos.
              Quando entra um ano novo, a página se atualiza sozinha.
            </li>
          </ul>
        </div>
        <div className={`${styles.body} ${styles.baseline}`}>
          <h3>Por que comparar com {baseline.startYear} a {baseline.endYear}</h3>
          <p>
            É a referência clássica nos estudos de clima, de antes da maior parte do
            aquecimento. Também é a época de &ldquo;o verão dos teus pais&rdquo;, do
            capítulo 4.
          </p>
          <p>
            A referência oficial atual da Organização Meteorológica Mundial é de {wmoStart}{" "}
            a {wmoEnd}. Com ela, os últimos 10 anos ficariam{" "}
            {formatTemperature(differenceFromWmo, { signed: true })} acima da média, em vez
            de {formatTemperature(differenceFromBaseline, { signed: true })}. A diferença é
            menor porque essa referência já inclui anos mais quentes.
          </p>
        </div>
        <div className={`${styles.body} ${styles.limits}`}>
          <h3>Limites da análise</h3>
          <ul>
            <li>
              A página mostra o que aconteceu com a temperatura em Porto Alegre. Ela não
              prova sozinha por que aconteceu. Explicar as causas pede outros estudos.
            </li>
            <li>
              Antes de 1979, a reanálise tinha bem menos medições: cerca de 53 mil por dia em
              1950, contra 570 mil no fim de 1978, segundo o{" "}
              <a href="https://doi.org/10.1002/qj.4174">
                artigo que estendeu o ERA5 até 1950
              </a>
              . A partir de 1979, ela passa a usar muito mais dados de satélite. O salto das
              noites quentes, no capítulo 3, cai bem nessa virada. Estudos com estações do
              INMET no Rio Grande do Sul mostram a mínima subindo, o que indica que o aumento
              é real. Mas não dá para separar quanto do salto é clima e quanto é mudança nos
              dados.
            </li>
            <li>
              Como cada número representa uma área, a reanálise tende a suavizar os
              extremos. O número exato de dias acima de {meta.thresholds.veryHotDay}&nbsp;°C
              pode ser diferente do de uma estação. O que a página compara é a mudança ao
              longo do tempo, sempre com o mesmo modelo.
            </li>
            <li>
              A década de 2020 ainda não terminou. Os números dela são a média dos anos que
              já passaram e ainda podem mudar.
            </li>
          </ul>
        </div>
        <div className={`${styles.body} ${styles.credits}`}>
          <h3>Imagens e código</h3>
          <p>
            A Terra da abertura usa imagens da NASA:{" "}
            <a href="https://visibleearth.nasa.gov/collection/1484/blue-marble">
              Blue Marble Next Generation
            </a>
            , com relevo e fundo do mar, e o mapa de relevo da mesma coleção, feito com
            dados GEBCO. O mapa deste capítulo usa os limites das cidades da{" "}
            <a href={mapData.sourceUrl}>malha municipal do IBGE</a>.
          </p>
          <p>
            O código da página, o script que busca os dados e os números prontos estão no{" "}
            <a href={repositoryUrl}>GitHub</a>.
          </p>
        </div>
      </div>
    </section>
  );
}

// Mapa do capítulo, com legenda e descrição em texto.
function MapFigure() {
  return (
    <ChartFigure
      legend={
        <ChartLegend
          items={[
            {
              kind: "bar",
              color: "var(--temp-hot-2)",
              label: `quadrado de onde vêm os números (cerca de ${formatNumber(cellSizeKm)} km)`,
            },
            { kind: "dot", color: "var(--temp-hot-2)", label: "centro do quadrado" },
            { kind: "dot", color: "var(--color-text)", label: "centro da cidade (ponto pedido)" },
          ]}
        />
      }
      description={
        <>
          Mapa de Porto Alegre e das cidades em volta, com o Guaíba a oeste e a grade do
          ERA5-Land por cima. Todos os números da página vêm de um só quadrado da grade,
          centrado em {formatCoordinate(meta.gridPoint.lat)},{" "}
          {formatCoordinate(meta.gridPoint.lng)}. O centro da cidade, que foi o ponto
          pedido, fica a cerca de {formatNumber(requestToGridKm)} km do centro desse
          quadrado. Limites das cidades: IBGE.
        </>
      }
    >
      <GridMap />
    </ChartFigure>
  );
}
