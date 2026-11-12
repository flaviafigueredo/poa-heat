import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { siteTitle } from "@/lib/site";
import "./globals.css";

// next/font baixa as fontes no build e serve do próprio site: sem pedido ao
// Google no navegador e sem o texto "piscar" trocando de fonte.
// Serifada para títulos (tom de jornal) e sem serifa para o texto corrido.
const serif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: siteTitle,
  description:
    "Mais de 75 anos de temperatura diária em Porto Alegre, de 1950 até hoje, contados em gráficos.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${serif.variable} ${sans.variable}`}>
      {/* Extensões de navegador (como a ColorZilla) colocam atributos no
          <body> antes de o React carregar, e o React acusa diferença entre o
          HTML do servidor e o da página. `suppressHydrationWarning` ignora
          isso só nos atributos desta tag; erros no conteúdo continuam aparecendo. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
