import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera um site 100% estático na pasta `out` durante o build.
  // O Cloudflare Pages só precisa servir esses arquivos, sem servidor Node.
  // Por isso ficam de fora `cacheComponents` e `partialPrefetching`, que o
  // create-next-app liga por padrão: os dois dependem de um servidor rodando.
  output: "export",
  reactCompiler: true,
};

export default nextConfig;
