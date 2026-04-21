import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure @ffmpeg-installer/ffmpeg binary is included in Vercel serverless bundles.
  // Sem isto, routes que usam ffmpeg (funil/generate-thumbnail, funil/render-ffmpeg,
  // shorts/render-ffmpeg) falham com "Could not find ffmpeg executable".
  outputFileTracingIncludes: {
    "/api/admin/funil/generate-thumbnail": [
      "./node_modules/@ffmpeg-installer/**/*",
    ],
    "/api/admin/funil/render-ffmpeg": [
      "./node_modules/@ffmpeg-installer/**/*",
    ],
    "/api/admin/shorts/render-ffmpeg": [
      "./node_modules/@ffmpeg-installer/**/*",
    ],
    "/api/admin/shorts/render-thumbnail": [
      "./node_modules/@ffmpeg-installer/**/*",
    ],
  },
};

export default nextConfig;
