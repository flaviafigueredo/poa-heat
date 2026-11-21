import type { CSSProperties } from "react";
import mapData from "@/data/portoAlegreMap.json";
import { temperatureData } from "@/lib/temperatureData";
import styles from "./GridMap.module.css";

const { meta } = temperatureData;
const { bounds, cities } = mapData;

// Espaço entre os pontos da grade do ERA5-Land, em graus. Cada ponto
// representa o quadrado em volta dele, que vai até meio passo para cada lado.
export const gridStep = 0.1;
const halfStep = gridStep / 2;

// Quilômetros por grau de latitude (quase constante na Terra).
const kmPerDegree = 111.32;

// Projeção simples para uma área pequena: longitude e latitude viram x e y
// em linha reta. Perto de Porto Alegre, um grau de longitude é mais curto
// que um de latitude (cerca de 87%), então a largura é corrigida pelo
// cosseno da latitude. Sem isso, o mapa sairia esticado para os lados.
const centerLat = (bounds.north + bounds.south) / 2;
const lngScale = Math.cos((centerLat * Math.PI) / 180);

const width = 1000;
const height =
  (width * (bounds.north - bounds.south)) / ((bounds.east - bounds.west) * lngScale);

// Proporção do mapa (largura dividida pela altura). O capítulo 5 usa para
// dar à coluna do mapa a largura exata dele.
export const mapAspect = width / height;

const projectX = (lng: number) => ((lng - bounds.west) / (bounds.east - bounds.west)) * width;
const projectY = (lat: number) => ((bounds.north - lat) / (bounds.north - bounds.south)) * height;

// Distância aproximada em km entre dois pontos próximos, com a mesma
// correção da longitude.
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  return Math.hypot((a.lng - b.lng) * lngScale, a.lat - b.lat) * kmPerDegree;
}

// Contorno de um polígono (com os buracos, se tiver) no formato do atributo
// `d` do <path>: "M" começa um contorno, "L" liga os pontos e "Z" fecha.
function polygonPath(polygon: number[][][]): string {
  return polygon
    .map(
      (ring) =>
        `M${ring.map(([lng, lat]) => `${projectX(lng).toFixed(1)},${projectY(lat).toFixed(1)}`).join("L")}Z`,
    )
    .join("");
}

// Linhas da grade: as bordas dos quadrados ficam a meio passo dos pontos
// (em -51,25, -51,15...), então começam no primeiro meio passo do recorte.
function gridEdges(start: number, end: number): number[] {
  const first = Math.ceil((start - halfStep) / gridStep) * gridStep + halfStep;
  const edges: number[] = [];
  for (let edge = first; edge < end; edge += gridStep) edges.push(edge);
  return edges;
}

// Rótulos de lugares, em HTML por cima do mapa: assim o texto tem sempre o
// mesmo tamanho, enquanto o desenho cresce ou encolhe com a tela. As
// posições foram conferidas com os contornos do IBGE (o do Guaíba cai na
// água, entre Porto Alegre e Eldorado do Sul).
const placeLabels = [
  { name: "Porto Alegre", lng: -51.12, lat: -30.17, kind: "city" },
  { name: "Guaíba", lng: -51.3, lat: -30.15, kind: "water" },
] as const;

// Mapa que explica a reanálise: Porto Alegre e as cidades em volta, a grade
// do ERA5-Land por cima, o quadrado de onde vêm os números da página e o
// ponto que foi pedido. Roda no servidor; não tem parte no navegador.
export function GridMap() {
  const { gridPoint, requestedLocation } = meta;

  const cell = {
    x: projectX(gridPoint.lng - halfStep),
    y: projectY(gridPoint.lat + halfStep),
    width: projectX(gridPoint.lng + halfStep) - projectX(gridPoint.lng - halfStep),
    height: projectY(gridPoint.lat - halfStep) - projectY(gridPoint.lat + halfStep),
  };

  // Barra de escala de 10 km no canto de baixo, à esquerda.
  const scaleKm = 10;
  const scaleStartLng = bounds.west + 0.02;
  const scaleLat = bounds.south + 0.02;
  const scaleEndLng = scaleStartLng + scaleKm / (kmPerDegree * lngScale);

  return (
    <div
      className={styles.map}
      // Proporção do mapa (largura dividida pela altura), para o CSS limitar
      // a largura pela altura da tela.
      style={{ "--map-aspect": mapAspect } as CSSProperties}
    >
      <svg viewBox={`0 0 ${width} ${height.toFixed(0)}`} aria-hidden="true">
        {/* Fundo: tudo que não é cidade é água (o Guaíba e o delta). */}
        <rect className={styles.water} width={width} height={height} />

        {cities.map((city) => (
          <path
            key={city.name}
            className={city.isPortoAlegre ? styles.portoAlegre : styles.land}
            d={city.polygons.map(polygonPath).join("")}
          />
        ))}

        {/* Grade do ERA5-Land: um quadrado de 0,1 grau por ponto. */}
        {gridEdges(bounds.west, bounds.east).map((lng) => (
          <line
            key={`lng${lng}`}
            className={styles.grid}
            x1={projectX(lng)}
            x2={projectX(lng)}
            y1={0}
            y2={height}
          />
        ))}
        {gridEdges(bounds.south, bounds.north).map((lat) => (
          <line
            key={`lat${lat}`}
            className={styles.grid}
            x1={0}
            x2={width}
            y1={projectY(lat)}
            y2={projectY(lat)}
          />
        ))}

        {/* O quadrado de onde vêm todos os números da página. */}
        <rect className={styles.cell} {...cell} />
        <circle
          className={styles.gridPoint}
          cx={projectX(gridPoint.lng)}
          cy={projectY(gridPoint.lat)}
          r={9}
        />
        <circle
          className={styles.requestedPoint}
          cx={projectX(requestedLocation.lng)}
          cy={projectY(requestedLocation.lat)}
          r={9}
        />

        <line
          className={styles.scale}
          x1={projectX(scaleStartLng)}
          x2={projectX(scaleEndLng)}
          y1={projectY(scaleLat)}
          y2={projectY(scaleLat)}
        />
      </svg>

      {placeLabels.map((label) => (
        <span
          key={label.name}
          className={label.kind === "water" ? styles.waterLabel : styles.cityLabel}
          style={{
            left: `${(projectX(label.lng) / width) * 100}%`,
            top: `${(projectY(label.lat) / height) * 100}%`,
          }}
          aria-hidden="true"
        >
          {label.name}
        </span>
      ))}
      <span
        className={styles.scaleLabel}
        style={{
          left: `${(projectX(scaleStartLng) / width) * 100}%`,
          top: `${(projectY(scaleLat) / height) * 100}%`,
        }}
        aria-hidden="true"
      >
        {scaleKm} km
      </span>
    </div>
  );
}
