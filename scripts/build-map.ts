// Monta o mapa de Porto Alegre do capítulo 5 a partir da malha de municípios
// do IBGE e salva em src/data/portoAlegreMap.json.
//
// Roda com `npm run map`. Só precisa rodar de novo se o recorte ou a
// simplificação mudarem: os limites das cidades quase nunca mudam, então o
// workflow mensal não chama este script.
//
// A malha do IBGE não tem rios nem lagos. A água aparece como o espaço entre
// as cidades: no recorte em volta de Porto Alegre, esse espaço é o Guaíba e o
// delta do Jacuí.

import { mkdir, writeFile } from "node:fs/promises";

// Malha de todos os municípios do Rio Grande do Sul (código 43).
const meshUrl =
  "https://servicodados.ibge.gov.br/api/v3/malhas/estados/43?intrarregiao=municipio&formato=application/vnd.geo%2Bjson&qualidade=maxima";
// Nomes dos municípios, para guardar o nome de cada contorno no JSON.
const namesUrl = "https://servicodados.ibge.gov.br/api/v1/localidades/estados/43/municipios";
const portoAlegreCode = "4314902";
const outputPath = new URL("../src/data/portoAlegreMap.json", import.meta.url);

// Recorte do mapa, em graus. Cobre Porto Alegre inteira e um pouco das
// cidades em volta, para o Guaíba aparecer entre elas. É um pouco mais largo
// que alto, para o mapa ocupar bem a coluna nas telas largas.
const bounds = { west: -51.48, east: -50.92, south: -30.3, north: -29.88 };

// Tolerância da simplificação: pontos que mudam o contorno em menos de
// 0,001 grau (cerca de 100 metros) são descartados. No tamanho do desenho,
// a diferença não aparece, e o arquivo fica bem menor.
const tolerance = 0.001;

type Position = [number, number];
type Ring = Position[];
type Feature = {
  properties: { codarea: string };
  geometry:
    | { type: "Polygon"; coordinates: Ring[] }
    | { type: "MultiPolygon"; coordinates: Ring[][] };
};

// Distância de um ponto até o segmento entre `start` e `end`.
function distanceToSegment(point: Position, start: Position, end: Position): number {
  const [x, y] = point;
  const [x1, y1] = start;
  const [x2, y2] = end;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSquared = dx * dx + dy * dy;
  const t =
    lengthSquared === 0
      ? 0
      : Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / lengthSquared));
  return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy));
}

// Simplificação de Douglas-Peucker: liga o primeiro ao último ponto e
// procura o ponto mais longe dessa reta. Se ele estiver perto (abaixo da
// tolerância), todos os pontos do meio somem. Se não, ele fica, e a conta se
// repete para as duas metades.
function simplify(points: Ring): Ring {
  if (points.length < 3) return points;

  let farthestIndex = 0;
  let farthestDistance = 0;
  for (let index = 1; index < points.length - 1; index++) {
    const distance = distanceToSegment(points[index], points[0], points.at(-1)!);
    if (distance > farthestDistance) {
      farthestDistance = distance;
      farthestIndex = index;
    }
  }

  if (farthestDistance < tolerance) return [points[0], points.at(-1)!];

  const left = simplify(points.slice(0, farthestIndex + 1));
  const right = simplify(points.slice(farthestIndex));
  return [...left.slice(0, -1), ...right];
}

// Quatro casas decimais (cerca de 10 metros) bastam para o desenho.
const round = (value: number) => Math.round(value * 10_000) / 10_000;

const isInsideBounds = ([lng, lat]: Position) =>
  lng >= bounds.west && lng <= bounds.east && lat >= bounds.south && lat <= bounds.north;

// Corta um contorno no retângulo do recorte (algoritmo de Sutherland-Hodgman):
// passa o contorno por cada um dos quatro lados, um de cada vez. Em cada
// lado, os pontos de fora somem e, onde o contorno cruza o lado, entra um
// ponto novo bem em cima dele. Assim as cidades grandes, como Viamão, guardam
// só o pedaço que aparece no mapa.
function clipRing(ring: Ring): Ring {
  const edges: { inside: (point: Position) => boolean; cross: (a: Position, b: Position) => Position }[] = [
    { inside: ([lng]) => lng >= bounds.west, cross: (a, b) => crossAtLng(a, b, bounds.west) },
    { inside: ([lng]) => lng <= bounds.east, cross: (a, b) => crossAtLng(a, b, bounds.east) },
    { inside: ([, lat]) => lat >= bounds.south, cross: (a, b) => crossAtLat(a, b, bounds.south) },
    { inside: ([, lat]) => lat <= bounds.north, cross: (a, b) => crossAtLat(a, b, bounds.north) },
  ];

  let points = ring;
  for (const edge of edges) {
    const clipped: Ring = [];
    points.forEach((current, index) => {
      const previous = points[(index + points.length - 1) % points.length];
      if (edge.inside(current)) {
        if (!edge.inside(previous)) clipped.push(edge.cross(previous, current));
        clipped.push(current);
      } else if (edge.inside(previous)) {
        clipped.push(edge.cross(previous, current));
      }
    });
    points = clipped;
    if (points.length === 0) break;
  }
  return points;
}

// Ponto onde o segmento de `a` até `b` cruza uma longitude ou latitude.
function crossAtLng([x1, y1]: Position, [x2, y2]: Position, lng: number): Position {
  return [lng, y1 + ((lng - x1) / (x2 - x1)) * (y2 - y1)];
}

function crossAtLat([x1, y1]: Position, [x2, y2]: Position, lat: number): Position {
  return [x1 + ((lat - y1) / (y2 - y1)) * (x2 - x1), lat];
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`O IBGE respondeu com erro ${response.status} em ${url}`);
  }
  return (await response.json()) as T;
}

const mesh = await fetchJson<{ features: Feature[] }>(meshUrl);
const names = await fetchJson<{ id: number; nome: string }[]>(namesUrl);
const nameByCode = new Map(names.map((city) => [String(city.id), city.nome]));

const cities = mesh.features
  .map((feature) => {
    // Polygon e MultiPolygon viram a mesma coisa: uma lista de polígonos,
    // cada um com o contorno de fora e, se tiver, os buracos.
    const polygons =
      feature.geometry.type === "Polygon"
        ? [feature.geometry.coordinates]
        : feature.geometry.coordinates;
    return { code: feature.properties.codarea, polygons };
  })
  // Só as cidades com pelo menos um ponto dentro do recorte.
  .filter((city) => city.polygons.some((polygon) => polygon[0].some(isInsideBounds)))
  .map((city) => ({
    name: nameByCode.get(city.code) ?? city.code,
    isPortoAlegre: city.code === portoAlegreCode,
    polygons: city.polygons
      .map((polygon) =>
        polygon
          .map((ring) =>
            simplify(clipRing(ring)).map(([lng, lat]) => [round(lng), round(lat)] as Position),
          )
          // Contornos (ou buracos) que ficaram fora do recorte, ou pequenos
          // demais para aparecer no desenho, somem.
          .filter((ring) => ring.length >= 4),
      )
      // Um polígono sem o contorno de fora não tem o que desenhar.
      .filter((polygon) => polygon.length > 0),
  }));

if (!cities.some((city) => city.isPortoAlegre)) {
  throw new Error("Porto Alegre não veio na malha do IBGE. Nada foi salvo.");
}

const output = {
  source: "IBGE, Malha Municipal",
  sourceUrl: "https://servicodados.ibge.gov.br/api/docs/malhas?versao=3",
  bounds,
  cities,
};

await mkdir(new URL(".", outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output)}\n`);

const pointCount = cities.reduce(
  (total, city) =>
    total + city.polygons.reduce((sum, polygon) => sum + polygon.flat().length, 0),
  0,
);
console.log(
  `Mapa salvo: ${cities.length} cidades, ${pointCount} pontos (${cities.map((city) => city.name).join(", ")}).`,
);
