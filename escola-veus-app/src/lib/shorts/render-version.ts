/**
 * Versão semântica do worker/composição Remotion. Bump sempre que houver
 * mudança no render que altere o output (duração, sync, motion, layout).
 *
 * - É injectada no manifest pelo dispatch.
 * - O worker GHA escreve-a em result.json.
 * - A status route armazena por (post, mode).
 * - A UI mostra-a por vídeo, e marca como "antigo" quando difere da
 *   versão actual — assim sabes ao olhar quais re-renderizar (não precisa
 *   re-render às cegas).
 *
 * Ficheiro isolado (sem imports server-only) para poder ser importado
 * tanto no servidor (route handlers) como no cliente (PostCard).
 */
export const RENDER_VERSION = "2026-05-11-force-clip-uniform-and-landscape";
