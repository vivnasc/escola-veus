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
    // generate-thumbnail: ffmpeg drawtext com fontfile=<abs-path> dos TTFs
    // bundled (evita fontconfig que nao existe em Vercel).
    "/api/admin/funil/generate-thumbnail": [
      "./node_modules/@ffmpeg-installer/**/*",
      "./node_modules/@ffmpeg-installer/linux-x64/**/*",
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
    "/api/admin/shorts/short-from-nomear": [
      "./node_modules/@ffmpeg-installer/**/*",
      "./node_modules/@ffmpeg-installer/linux-x64/**/*",
      "./assets/fonts/*.ttf",
    ],
    "/api/admin/shorts/crop-funil-video": [
      "./node_modules/@ffmpeg-installer/**/*",
      "./node_modules/@ffmpeg-installer/linux-x64/**/*",
    ],
  },
};

export default nextConfig;
