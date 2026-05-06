// Selecciona clips/música deterministicamente para um post da semana.

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Pick N elementos distintos de pool, ordenado deterministicamente por seed. */
export function pickN(pool, n, seed) {
  if (pool.length === 0) return [];
  // Fisher-Yates determinístico — cada item ganha um score (hash(seed+i)).
  const scored = pool.map((p, i) => ({ p, s: hash(`${seed}::${i}`) }));
  scored.sort((a, b) => a.s - b.s);
  return scored.slice(0, n).map((x) => x.p);
}

/**
 * Escolhe 3 clips Loranne (paisagem) da pool dada, deterministicamente por
 * (album, track, week). Garante diversidade entre semanas.
 */
export function pickLoranneClips(pool, albumSlug, trackNumber, weekNumber) {
  const seed = `${albumSlug}/${trackNumber}/w${weekNumber}`;
  return pickN(pool, 3, seed).map((c) => c.url);
}

/**
 * Escolhe 1 clip AG por tema (3 temas), filtrando pool pelo tema do prefixo
 * do nome do ficheiro (e.g., "batuque-01.mp4" → tema "batuque").
 *
 * Devolve 3 URLs, na ordem dos temas. Se algum tema não tiver clips,
 * lança erro descritivo.
 */
export function pickAGClips(pool, temas, weekNumber) {
  const urls = [];
  for (const tema of temas) {
    const filtered = pool.filter((c) =>
      (c.name || c.url || "").toLowerCase().includes(`${tema}-`),
    );
    if (filtered.length === 0) {
      throw new Error(
        `Sem clips AG raízes para tema "${tema}" — gera em /admin/producao/ancient-ground.`,
      );
    }
    const seed = `ag/${tema}/w${weekNumber}`;
    const [pick] = pickN(filtered, 1, seed);
    urls.push(pick.url);
  }
  return urls;
}

/**
 * Encontra o MP3 da faixa N de um álbum. Convenção típica: nome contém
 * "faixa-NN" ou começa com "NN". Se nada match, faz fallback ao Nº-ésimo
 * ordenado por nome.
 */
export function findTrackUrl(albumTracks, trackNumber) {
  const padded = String(trackNumber).padStart(2, "0");
  const byPrefix = albumTracks.find((t) =>
    new RegExp(`(^|[^0-9])${padded}([^0-9]|$)`).test(t.name),
  );
  if (byPrefix) return byPrefix.url;
  // Fallback: posição N (1-indexed) na lista ordenada.
  if (trackNumber >= 1 && trackNumber <= albumTracks.length) {
    return albumTracks[trackNumber - 1].url;
  }
  return null;
}
