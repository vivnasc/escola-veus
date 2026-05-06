// Pequeno wrapper sobre as APIs admin existentes.
//
// Todas as rotas correm contra o Next dev server local (default
// http://localhost:3000). Em produção, podes apontar com --base-url.

let _baseUrl = "http://localhost:3000";

export function setBaseUrl(url) {
  _baseUrl = url.replace(/\/$/, "");
}

async function api(path, init = {}) {
  const res = await fetch(`${_baseUrl}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
  });
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = { raw: text }; }
  if (!res.ok) {
    const msg = body?.erro || body?.error || text.slice(0, 300);
    throw new Error(`${path} ${res.status}: ${msg}`);
  }
  return body;
}

// ── suggest (Loranne) ──────────────────────────────────────────────────────

export async function suggestLoranne({ albumSlug, trackNumber, theme }) {
  return api("/api/admin/shorts/suggest", {
    method: "POST",
    body: JSON.stringify({ albumSlug, trackNumber, theme }),
  });
}

// ── suggest-ag (Ancient Ground) ────────────────────────────────────────────

export async function suggestAG({ temas, trackNumber }) {
  return api("/api/admin/shorts/suggest-ag", {
    method: "POST",
    body: JSON.stringify({ temas, trackNumber }),
  });
}

// ── música — listar faixas dum álbum ────────────────────────────────────────

export async function listAlbumTracks(albumSlug) {
  const r = await api(`/api/admin/music/list-album?album=${encodeURIComponent(albumSlug)}`);
  return r.tracks || [];
}

// ── clips pool ──────────────────────────────────────────────────────────────

export async function listLoranneClips() {
  const r = await api("/api/admin/shorts/list-clips-ag");
  return r.clips || [];
}

export async function listAGRaizesClips() {
  const r = await api("/api/admin/ancient-ground/raizes-clips");
  return r.clips || r;
}

// ── render dispatch ─────────────────────────────────────────────────────────

export async function dispatchRenderShort(manifest) {
  return api("/api/admin/shorts/render-short-submit", {
    method: "POST",
    body: JSON.stringify(manifest),
  });
}

export async function getRenderStatus(jobId) {
  return api(`/api/admin/shorts/render-short-status?jobId=${encodeURIComponent(jobId)}`);
}
