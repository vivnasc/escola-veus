import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ffmpeg-installer/ffmpeg carrega o subpacote platform-specific em runtime
  // (ex: @ffmpeg-installer/linux-x64). Se o Next tentar bundlar, perde o
  // require dinâmico e os assets nativos. serverExternalPackages diz ao Next
  // para tratar este módulo como externo — require nativo a partir de
  // node_modules. Combinado com outputFileTracingIncludes abaixo, assegura
  // que os binários + package.json viajam no deploy serverless.
  serverExternalPackages: ["@ffmpeg-installer/ffmpeg"],

  outputFileTracingIncludes: {
    // generate-thumbnail agora usa sharp + SVG com fonte embebida (TTF),
    // não mais ffmpeg/drawtext. Precisa apenas da mandala + fontes bundled.
    "/api/admin/funil/generate-thumbnail": [
      "./public/hero-mandala.png",
      "./assets/fonts/*.ttf",
    ],
    "/api/admin/funil/render-ffmpeg": [
      "./node_modules/@ffmpeg-installer/**/*",
      "./node_modules/@ffmpeg-installer/linux-x64/**/*",
    ],
    "/api/admin/shorts/render-ffmpeg": [
      "./node_modules/@ffmpeg-installer/**/*",
      "./node_modules/@ffmpeg-installer/linux-x64/**/*",
    ],
    "/api/admin/shorts/render-thumbnail": [
      "./node_modules/@ffmpeg-installer/**/*",
      "./node_modules/@ffmpeg-installer/linux-x64/**/*",
    ],
  },
};

export default nextConfig;
