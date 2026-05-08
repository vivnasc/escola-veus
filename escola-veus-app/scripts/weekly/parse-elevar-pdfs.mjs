#!/usr/bin/env node
// parse-elevar-pdfs.mjs — extrai os 50 tracks dos 5 PDFs em
// loranne-lyrics/Novos8may/ e gera:
//   loranne-lyrics/lyrics-elevadora.ts     (lyrics map)
//   escola-veus-app/src/data/weekly-social/loranne-suno-prompts.json
//   escola-veus-app/src/data/weekly-social/loranne-key-verses.json
//
// + actualiza:
//   loranne-track-meta.json                (energy/flavor/lang dos 50)
//   loranne-track-titles.json              (titles dos 50)
//
// Não toca em LORANNE_AVAILABLE_ALBUMS — isso faço-o depois manualmente.

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const TXT_FILES = [
  { slug: "incenso-acende",    txt: "/tmp/01-acende.txt"    },
  { slug: "incenso-coro",      txt: "/tmp/02-coro.txt"      },
  { slug: "incenso-milagre",   txt: "/tmp/03-milagre.txt"   },
  { slug: "incenso-amen",      txt: "/tmp/04-amen.txt"      },
  { slug: "incenso-aleluia",   txt: "/tmp/05-aleluia.txt"   },
];

const ROOT = "/home/user/escola-veus";
const META_PATH = `${ROOT}/escola-veus-app/src/data/weekly-social/loranne-track-meta.json`;
const TITLES_PATH = `${ROOT}/escola-veus-app/src/data/weekly-social/loranne-track-titles.json`;
const SUNO_PATH = `${ROOT}/escola-veus-app/src/data/weekly-social/loranne-suno-prompts.json`;
const KEYVERSES_PATH = `${ROOT}/escola-veus-app/src/data/weekly-social/loranne-key-verses.json`;
const LYRICS_TS_PATH = `${ROOT}/loranne-lyrics/lyrics-elevadora.ts`;

function unsmart(s) {
  return s
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/—/g, "—") // mantém em-dash
    .replace(/–/g, "-")
    .replace(/ /g, " ");
}

function parseAlbum(slug, text) {
  const tracks = [];
  // Divide por "Track N —" — manteve qualquer texto entre eles.
  const trackBlocks = text.split(/\n\s*Track\s+(\d+)\s*[—-]\s*([^\n]+)/);
  // Result: [pre, num, title, content, num, title, content, ...]
  for (let i = 1; i < trackBlocks.length; i += 3) {
    const num = parseInt(trackBlocks[i], 10);
    const title = unsmart(trackBlocks[i + 1].trim());
    const content = trackBlocks[i + 2];

    // Lang
    const lang = (content.match(/Lang:\s*([A-Z]+)/) || [])[1] || null;
    // Energy
    const energy = (content.match(/Energy:\s*(\w+)/) || [])[1] || null;
    // Flavor
    const flavorRaw = (content.match(/Flavor:\s*([^\n]+)/) || [])[1] || "";
    const flavor = flavorRaw && !flavorRaw.includes("—") && flavorRaw.trim() !== "—"
      ? flavorRaw.trim().toLowerCase()
      : null;
    // Description
    const description = unsmart(((content.match(/Description:\s*([^\n]+(?:\n\s+[^\n]+)*)/) || [])[1] || "").trim());

    // Key verse — entre "Key verse" e "Suno prompt"
    const keyMatch = content.match(/Key verse\s*\n+([\s\S]*?)\n\s*Suno prompt/);
    let keyVerse = "";
    if (keyMatch) {
      keyVerse = unsmart(keyMatch[1])
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
        .join(" / ")
        .trim();
    }

    // Suno prompt — entre "Suno prompt" e "Lyrics"
    const sunoMatch = content.match(/Suno prompt\s*\n+([\s\S]*?)\n\s*Lyrics/);
    let sunoPrompt = "";
    if (sunoMatch) {
      sunoPrompt = unsmart(sunoMatch[1])
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
        .join(" ")
        .trim();
    }

    // Lyrics — depois de "Lyrics" até ao fim ou próximo Track
    const lyricsMatch = content.match(/Lyrics\s*\n+([\s\S]*)/);
    let lyrics = "";
    if (lyricsMatch) {
      // Limpa indentação herdada do PDF e corta no fim do texto.
      lyrics = unsmart(lyricsMatch[1])
        .split("\n")
        .map((l) => l.replace(/^\s{1,4}/, ""))
        .join("\n")
        .trim();
    }

    tracks.push({ num, title, lang, energy, flavor, description, keyVerse, sunoPrompt, lyrics });
  }
  return tracks;
}

// ── Process ─────────────────────────────────────────────────────────────

const allAlbums = {};
for (const { slug, txt } of TXT_FILES) {
  const text = readFileSync(txt, "utf8");
  const tracks = parseAlbum(slug, text);
  console.error(`✓ ${slug}: ${tracks.length} tracks`);
  for (const t of tracks) {
    if (!t.lyrics) console.error(`  ⚠ track ${t.num} "${t.title}" sem lyrics`);
    if (!t.energy) console.error(`  ⚠ track ${t.num} "${t.title}" sem energy`);
  }
  allAlbums[slug] = tracks;
}

// ── Generate lyrics-elevadora.ts ────────────────────────────────────────

const lyricsEntries = [];
for (const [slug, tracks] of Object.entries(allAlbums)) {
  for (const t of tracks) {
    if (!t.lyrics) continue;
    const key = `${slug}/${t.num}`;
    // Escape backticks + ${ in lyrics for template literal.
    const escaped = t.lyrics.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
    lyricsEntries.push(`  "${key}": \`${escaped}\`,`);
  }
}

const tsContent = `// Lyrics dos 5 álbuns Elevar/Gospel — Acende, Coro, Milagre, Amen, Aleluia
// Gerados a partir de loranne-lyrics/Novos8may/*.pdf via parse-elevar-pdfs.mjs.
//
// Key: "albumSlug/trackNumber"

export const ELEVADORA_LYRICS: Record<string, string> = {
${lyricsEntries.join("\n")}
};
`;
writeFileSync(LYRICS_TS_PATH, tsContent);
console.error(`✓ wrote ${LYRICS_TS_PATH} (${lyricsEntries.length} tracks)`);

// ── Update meta JSON ───────────────────────────────────────────────────

const meta = JSON.parse(readFileSync(META_PATH, "utf8"));
for (const [slug, tracks] of Object.entries(allAlbums)) {
  meta[slug] = {};
  for (const t of tracks) {
    meta[slug][String(t.num)] = {
      title: t.title,
      energy: t.energy,
      lang: t.lang,
    };
    if (t.flavor) meta[slug][String(t.num)].flavor = t.flavor;
  }
}
writeFileSync(META_PATH, JSON.stringify(meta, null, 2));
console.error(`✓ updated ${META_PATH}`);

// ── Update titles JSON ─────────────────────────────────────────────────

const titles = JSON.parse(readFileSync(TITLES_PATH, "utf8"));
for (const [slug, tracks] of Object.entries(allAlbums)) {
  titles[slug] = {};
  for (const t of tracks) {
    titles[slug][String(t.num)] = t.title;
  }
}
writeFileSync(TITLES_PATH, JSON.stringify(titles, null, 2));
console.error(`✓ updated ${TITLES_PATH}`);

// ── Suno prompts + key verses ──────────────────────────────────────────

const sunoData = {};
const keyVerseData = {};
for (const [slug, tracks] of Object.entries(allAlbums)) {
  sunoData[slug] = {};
  keyVerseData[slug] = {};
  for (const t of tracks) {
    if (t.sunoPrompt) sunoData[slug][String(t.num)] = t.sunoPrompt;
    if (t.keyVerse) keyVerseData[slug][String(t.num)] = t.keyVerse;
  }
}
writeFileSync(SUNO_PATH, JSON.stringify(sunoData, null, 2));
writeFileSync(KEYVERSES_PATH, JSON.stringify(keyVerseData, null, 2));
console.error(`✓ wrote ${SUNO_PATH} + ${KEYVERSES_PATH}`);

// ── Final summary ──────────────────────────────────────────────────────

const totalTracks = Object.values(allAlbums).reduce((n, ts) => n + ts.length, 0);
console.error(`\n✓ Total: ${totalTracks} tracks across 5 albums.`);
console.error(`  Para usar: adiciona os 5 slugs a LORANNE_AVAILABLE_ALBUMS`);
console.error(`  e import ELEVADORA_LYRICS em src/lib/loranne.ts`);
