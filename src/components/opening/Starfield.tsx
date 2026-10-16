import styles from "./Starfield.module.css";

// Gerador de números "aleatórios" com semente (algoritmo mulberry32).
// Com a mesma semente, ele sempre devolve a mesma sequência. Assim as estrelas
// ficam no mesmo lugar em todo build e em toda visita, e o HTML gerado no
// servidor nunca diverge do que o navegador espera.
function createRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Área de desenho do SVG. Não são pixels: o SVG estica para cobrir a abertura.
const viewWidth = 1600;
const viewHeight = 1000;
const starCount = 320;

// Classes de cor das estrelas (as cores ficam em globals.css). O branco
// aparece três vezes para sair sorteado com mais frequência que o azul e o
// amarelo.
const starColorClasses = [
  styles.starWhite,
  styles.starWhite,
  styles.starWhite,
  styles.starCool,
  styles.starWarm,
];

const random = createRandom(1940);

const stars = Array.from({ length: starCount }, (_, index) => {
  // Elevar o sorteio ao quadrado ou ao cubo concentra os valores perto de 0:
  // a maioria das estrelas fica pequena e apagada, e só poucas brilham mais,
  // como no céu de verdade.
  const brightness = random() ** 3;
  return {
    id: index,
    x: random() * viewWidth,
    y: random() * viewHeight,
    radius: 0.4 + brightness * 1.2,
    opacity: 0.25 + brightness * 0.65,
    colorClass:
      starColorClasses[Math.floor(random() * starColorClasses.length)],
  };
});

// Componente de servidor: as estrelas são calculadas no build e chegam prontas
// no HTML, sem nenhum JavaScript no navegador.
export function Starfield() {
  return (
    <svg
      className={styles.starfield}
      viewBox={`0 0 ${viewWidth} ${viewHeight}`}
      // `slice` cobre a área toda e corta o que sobrar, como `object-fit: cover`.
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {stars.map((star) => (
        <circle
          key={star.id}
          cx={star.x.toFixed(1)}
          cy={star.y.toFixed(1)}
          r={star.radius.toFixed(2)}
          className={star.colorClass}
          opacity={star.opacity.toFixed(2)}
        />
      ))}
    </svg>
  );
}
