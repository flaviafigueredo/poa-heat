"use client";

import dynamic from "next/dynamic";
import { GlobeErrorBoundary } from "./GlobeErrorBoundary";

// O globo usa WebGL, que só existe no navegador. `ssr: false` faz o Next pular
// esse componente no build e carregá-lo só no cliente, num arquivo JS separado.
// Assim o texto da abertura aparece na hora, sem esperar o three.js baixar.
// No Next, `ssr: false` só é permitido dentro de um Client Component,
// por isso este arquivo pequeno existe.
const EarthGlobe = dynamic(() => import("./EarthGlobe"), { ssr: false });

export function GlobeLoader() {
  return (
    <GlobeErrorBoundary>
      <EarthGlobe />
    </GlobeErrorBoundary>
  );
}
