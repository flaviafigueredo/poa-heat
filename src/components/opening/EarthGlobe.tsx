"use client";

import { useEffect, useRef, useState } from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";
import { MeshPhongMaterial } from "three";
import { portoAlegre } from "@/lib/portoAlegre";
import styles from "./EarthGlobe.module.css";

// Foto de satélite Blue Marble Next Generation da NASA (domínio público), com
// topografia e profundidade do oceano. Reduzida para 4096 px de largura: é o
// maior tamanho de textura que celulares mais antigos aceitam. Acima disso,
// alguns mostram o globo todo preto.
const earthTextureUrl = "/textures/earth-topo-bathy.webp";

// Onde a câmera começa: longe, com a Terra inteira e pequena no meio das
// estrelas. `altitude` é a distância da superfície medida em raios da Terra
// (3.5 = três vezes e meia o raio).
const startView = { lat: -12, lng: -25, altitude: 3.5 };

// Onde a câmera termina: sobre Porto Alegre, perto o bastante para reconhecer
// a costa do Rio Grande do Sul, mas ainda vendo a curva da Terra contra o
// espaço. No celular a câmera fica um pouco mais longe porque a tela é estreita.
function getEndView(isWide: boolean) {
  const altitude = isWide ? 1.25 : 2.2;
  return { lat: portoAlegre.lat, lng: portoAlegre.lng, altitude };
}

// `globeOffset` desloca o globo na tela, em pixels, sem mexer na câmera.
// Tela larga: globo para a direita, deixando o espaço da esquerda para o texto.
// A abertura tem uma faixa extra embaixo (ver Opening.module.css), então o
// globo também sobe metade dessa faixa: assim o centro dele continua no meio
// da primeira tela, e a faixa recebe só a parte de baixo da Terra.
// Celular: globo para cima, deixando a parte de baixo para o texto.
function getGlobeOffset(
  width: number,
  height: number,
  isWide: boolean,
): [number, number] {
  if (!isWide) return [0, Math.round(height * -0.17)];

  const extraHeight = Math.max(0, height - window.innerHeight);
  return [Math.round(width * 0.2), Math.round(extraHeight / -2)];
}

// Lê uma variável CSS definida em `globals.css`. Assim cores e o tipo de
// layout têm uma fonte só, mesmo quando quem precisa delas é o JavaScript.
function readCssVariable(name: string) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

// O CSS troca `--layout` de "narrow" para "wide" no breakpoint de tela larga.
// Ler a variável, em vez de repetir a largura aqui, garante que o globo e o
// texto sempre mudam de layout juntos.
function readIsWide() {
  return readCssVariable("--layout") === "wide";
}

// Pausa curta depois do globo aparecer, para o olho se situar antes do zoom.
const zoomDelayMs = 600;
const zoomDurationMs = 3500;

// Material da superfície da Terra. O padrão do three.js tem reflexo especular
// (o "brilho" de superfície lisa), que no globo aparecia como uma mancha
// cinza borrada. `shininess: 0` e reflexo preto desligam esse brilho; a foto
// e o relevo continuam iguais, porque o globo aplica as texturas por cima.
// Fica fora do componente para ser criado uma vez só.
const earthMaterial = new MeshPhongMaterial({ shininess: 0, specular: 0x000000 });

// Lista de marcadores do globo. Fica fora do componente para ser sempre o
// mesmo array: um array novo a cada render faria o globo recriar o marcador.
const markers = [portoAlegre];

// O globo desenha o marcador como um elemento HTML comum posicionado sobre a
// esfera. Ele chama esta função uma vez para cada item de `htmlElementsData`.
// O globo centraliza o elemento que recebe sobre a coordenada e sobrescreve
// o `transform` dele. Por isso ele recebe uma âncora de tamanho zero (o
// centro dela é exatamente a cidade) e o marcador fica dentro, livre para
// ser posicionado pelo CSS.
function createMarker() {
  const anchor = document.createElement("div");
  anchor.className = styles.markerAnchor;

  const marker = document.createElement("div");
  marker.className = styles.marker;

  const dot = document.createElement("span");
  dot.className = styles.markerDot;

  const label = document.createElement("span");
  label.className = styles.markerLabel;
  label.textContent = portoAlegre.name;

  marker.append(dot, label);
  anchor.append(marker);
  return anchor;
}

type TextureStatus = "loading" | "loaded" | "failed";

export default function EarthGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const zoomTimerRef = useRef<number | undefined>(undefined);
  // Para qual layout (largo ou estreito) a câmera está apontada agora.
  const cameraIsWideRef = useRef<boolean | undefined>(undefined);
  const [size, setSize] = useState({ width: 0, height: 0, isWide: false });
  const [textureStatus, setTextureStatus] = useState<TextureStatus>("loading");
  const [isReady, setIsReady] = useState(false);
  // Este componente só roda no navegador (ver GlobeLoader), então dá para ler
  // o CSS já no primeiro render.
  const [atmosphereColor] = useState(() =>
    readCssVariable("--color-atmosphere"),
  );

  // Baixa a foto da Terra antes de montar o globo. O globo não avisa quando a
  // imagem falha: ele ficaria invisível para sempre, com o three.js rodando à
  // toa. Baixando antes, dá para desistir do globo se der erro. Quando o
  // globo pede a mesma imagem depois, ela já está no cache do navegador.
  useEffect(() => {
    const image = new Image();
    // Mesmo modo de pedido que o three.js usa, para o cache servir aos dois.
    image.crossOrigin = "anonymous";
    image.onload = () => setTextureStatus("loaded");
    image.onerror = () => setTextureStatus("failed");
    image.src = earthTextureUrl;

    return () => {
      image.onload = null;
      image.onerror = null;
    };
  }, []);

  // O canvas 3D precisa de largura e altura em pixels. O ResizeObserver mede
  // o espaço disponível e avisa sempre que ele muda (girar o celular, redimensionar
  // a janela), para o globo acompanhar.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({
        width: Math.round(width),
        height: Math.round(height),
        isWide: readIsWide(),
      });
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  // Cancela o zoom agendado se a página sair antes dele começar.
  useEffect(() => {
    return () => window.clearTimeout(zoomTimerRef.current);
  }, []);

  // Se o layout muda depois que o globo apareceu (por exemplo, girar o
  // celular), a câmera pula direto para o enquadramento do layout novo.
  useEffect(() => {
    const globe = globeRef.current;
    if (!isReady || !globe || cameraIsWideRef.current === size.isWide) return;

    window.clearTimeout(zoomTimerRef.current);
    globe.pointOfView(getEndView(size.isWide), 0);
    cameraIsWideRef.current = size.isWide;
  }, [isReady, size.isWide]);

  // Chamado quando a textura da Terra terminou de carregar.
  function handleGlobeReady() {
    const globe = globeRef.current;
    if (!globe) return;

    // Lê a preferência do sistema na hora em que o zoom vai começar, que é
    // quando ela importa. Quem pediu menos movimento não vê animação nenhuma.
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const endView = getEndView(size.isWide);
    cameraIsWideRef.current = size.isWide;

    if (prefersReducedMotion) {
      // Versão estática: a câmera já nasce sobre Porto Alegre (transição de 0 ms).
      globe.pointOfView(endView, 0);
    } else {
      globe.pointOfView(startView, 0);
      zoomTimerRef.current = window.setTimeout(() => {
        globe.pointOfView(endView, zoomDurationMs);
      }, zoomDelayMs);
    }

    setIsReady(true);
  }

  // Se a foto falhou, o globo nunca é montado e este bloco fica vazio e
  // invisível: a abertura continua com as estrelas e o texto.
  return (
    <div ref={containerRef} className={styles.globe} data-ready={isReady}>
      {size.width > 0 && textureStatus === "loaded" && (
        <Globe
          ref={globeRef}
          width={size.width}
          height={size.height}
          globeOffset={getGlobeOffset(size.width, size.height, size.isWide)}
          // Fundo transparente: o globo fica sobre o fundo escuro da própria página.
          backgroundColor="rgba(0, 0, 0, 0)"
          rendererConfig={{ antialias: true, alpha: true }}
          globeMaterial={earthMaterial}
          globeImageUrl={earthTextureUrl}
          // Mapa de relevo em tons de cinza (claro = alto). O three.js usa ele
          // para sombrear montanhas como os Andes, dando volume à foto.
          // Fonte: mapa "Topography" da série Blue Marble Next Generation da
          // NASA Earth Observatory (domínio público), feito com dados do
          // GEBCO. Reduzido para 2048 px: o relevo é sutil e não precisa de
          // mais detalhe que isso.
          bumpImageUrl="/textures/earth-bump.webp"
          // Atmosfera: um halo azul fino na borda da Terra, como nas fotos
          // tiradas do espaço. A altitude baixa mantém o brilho estreito.
          showAtmosphere
          atmosphereColor={atmosphereColor}
          atmosphereAltitude={0.1}
          animateIn={false}
          // Desliga a detecção de mouse sobre os objetos do globo, que não é
          // usada. Arrastar, dar zoom e capturar a rolagem já ficam
          // bloqueados pelo `pointer-events: none` em volta do globo
          // (ver Opening.module.css): nenhum toque chega até ele.
          enablePointerInteraction={false}
          htmlElementsData={markers}
          htmlLat="lat"
          htmlLng="lng"
          htmlElement={createMarker}
          onGlobeReady={handleGlobeReady}
        />
      )}
    </div>
  );
}
