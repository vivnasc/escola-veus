#!/usr/bin/env node
/**
 * weekly:plan — gera o plano semanal:
 *  - Selecciona faixas Loranne + tripletes AG via rotação determinística.
 *  - Resolve URLs de música (audios bucket) e clips (escola-shorts).
 *  - Chama suggest / suggest-ag para captions.
 *  - Calcula data+hora por plataforma.
 *  - Grava JSON em dist/weekly/<year>-W<NN>/<brand>-plan.json.
 *
 * Não toca em renders. Output é input para weekly:render e weekly:package.
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import rotationMod from "../../src/data/weekly-social/weekly-rotation.ts";
import brandConfigMod from "../../src/data/weekly-social/brand-config.ts";

import { parseArgs, printGenericHelp } from "./lib/args.mjs";
import { setBaseUrl, suggestLoranne, suggestAG, listAlbumTracks, listLoranneClips, listAGRaizesClips } from "./lib/api-client.mjs";
import { pickLoranneClips, pickAGClips, findTrackUrl } from "./lib/clip-picker.mjs";
import { buildLoranneCaptions, buildAGCaptions } from "./lib/captions.mjs";
import { scheduleFor, currentYear } from "./lib/schedule.mjs";

const { pickWeeklyLoranne, pickWeeklyAG, getTrackTitle, getAlbumTitle } = rotationMod;
const { BRANDS, ALL_PLATFORMS, DAY_ORDER } = brandConfigMod;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, "..", "..");

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { printGenericHelp(); return; }
  setBaseUrl(args.baseUrl);

  const year = currentYear();
  const week = args.semana;
  const outDir = path.join(APP_ROOT, "dist", "weekly", `${year}-W${String(week).padStart(2, "0")}`);
  await mkdir(outDir, { recursive: true });

  console.log(`\n📋 Plano semanal — ${year} W${week}`);
  console.log(`   Output: ${path.relative(APP_ROOT, outDir)}/`);
  console.log(`   Base URL: ${args.baseUrl}`);
  if (args.dryRun) console.log(`   ⚠ DRY RUN — não chama APIs nem escreve ficheiros\n`);

  // ─── Loranne ─────────────────────────────────────────────────────────────
  console.log(`\n🎸 LORANNE (${BRANDS.loranne.publishDays.length} dias)`);

  const loranneClips = args.dryRun ? [] : await listLoranneClips();
  if (!args.dryRun) console.log(`   pool clips: ${loranneClips.length}`);

  const lorannePosts = [];
  for (const day of BRANDS.loranne.publishDays) {
    const dayIdx = DAY_ORDER.indexOf(day);
    const entry = pickWeeklyLoranne(week, dayIdx);
    const trackTitle = getTrackTitle(entry.albumSlug, entry.trackNumber);
    const albumTitle = getAlbumTitle(entry.albumSlug);
    process.stdout.write(`   ${day} → ${trackTitle} · ${albumTitle} ... `);

    let suggest, musicUrl, clipUrls;
    if (args.dryRun) {
      suggest = {
        verses: ["[verso 1 mock]", "[verso 2 mock]"],
        tiktokCaption: "[mock TT caption]",
        youtubeTitle: `${trackTitle} · ${albumTitle} #Shorts`,
        youtubeDescription: "[mock YT desc]",
      };
      musicUrl = `https://example.com/audios/albums/${entry.albumSlug}/faixa-${String(entry.trackNumber).padStart(2,"0")}.mp3`;
      clipUrls = ["[clip-1]", "[clip-2]", "[clip-3]"];
    } else {
      suggest = await suggestLoranne({ albumSlug: entry.albumSlug, trackNumber: entry.trackNumber });
      const tracks = await listAlbumTracks(entry.albumSlug);
      musicUrl = findTrackUrl(tracks, entry.trackNumber);
      if (!musicUrl) throw new Error(`Sem MP3 para ${entry.albumSlug}/${entry.trackNumber}`);
      clipUrls = pickLoranneClips(loranneClips, entry.albumSlug, entry.trackNumber, week);
      if (clipUrls.length < 3) throw new Error(`Pool de clips Loranne tem só ${clipUrls.length}, precisa 3.`);
    }

    const captions = buildLoranneCaptions(suggest, BRANDS.loranne, {
      trackTitle, albumTitle, theme: null,
    });

    // Hora da publicação varia por plataforma — geramos 1 post "lógico" e o
    // CSV expande para 3 linhas (1 por platform) com horas distintas.
    const slug = `loranne-${entry.albumSlug}-f${entry.trackNumber}-w${week}-${day}`;
    lorannePosts.push({
      id: slug,
      brandSlug: "loranne",
      day,
      albumSlug: entry.albumSlug,
      trackNumber: entry.trackNumber,
      trackTitle,
      albumTitle,
      verses: suggest.verses?.slice(0, 2) || [],
      musicUrl,
      clipUrls,
      captions,
      // Datas/horas finais — 3 timestamps, 1 por plataforma.
      schedule: Object.fromEntries(
        ALL_PLATFORMS.map((p) => [
          p, scheduleFor(year, week, day, BRANDS.loranne.hoursByPlatform[p]),
        ]),
      ),
      // Render placeholder — preenchido pelo weekly:render.
      videoUrl: null,
      thumbnailUrl: null,
      jobId: null,
    });
    console.log("✓");
  }

  if (!args.dryRun) {
    await writeFile(
      path.join(outDir, "loranne-plan.json"),
      JSON.stringify({ year, week, brand: "loranne", posts: lorannePosts }, null, 2),
    );
  }
  console.log(`   ${lorannePosts.length} posts planeados.`);

  // ─── Ancient Ground ──────────────────────────────────────────────────────
  console.log(`\n🌍 ANCIENT GROUND (${BRANDS["ancient-ground"].publishDays.length} dias)`);

  const agClips = args.dryRun ? [] : await listAGRaizesClips();
  if (!args.dryRun) console.log(`   pool clips raízes: ${Array.isArray(agClips) ? agClips.length : "?"}`);

  const agPosts = [];
  let slotIdx = 0;
  for (const day of BRANDS["ancient-ground"].publishDays) {
    const entry = pickWeeklyAG(week, slotIdx);
    process.stdout.write(`   ${day} → ${entry.label} (${entry.temas.join("+")}) ... `);

    let suggest, clipUrls;
    if (args.dryRun) {
      suggest = {
        versos: ["[verso AG 1 mock]", "[verso AG 2 mock]"],
        tiktokCaption: "[mock AG TT caption]",
        youtubeTitle: `${entry.label} #Shorts`,
        youtubeDescription: "[mock AG YT desc]",
      };
      clipUrls = entry.temas.map((t) => `[ag-clip-${t}]`);
    } else {
      suggest = await suggestAG({ temas: entry.temas, trackNumber: entry.trackNumber });
      clipUrls = pickAGClips(Array.isArray(agClips) ? agClips : [], entry.temas, week);
    }

    const captions = buildAGCaptions(suggest, BRANDS["ancient-ground"], {
      label: entry.label, trackNumber: entry.trackNumber, temas: entry.temas,
    });

    // Música AG: assume bucket audios/albums/ancient-ground/faixa-NN.mp3
    const padded = String(entry.trackNumber).padStart(2, "0");
    const musicUrl = args.dryRun
      ? `https://example.com/audios/albums/ancient-ground/faixa-${padded}.mp3`
      : (findTrackUrl(await listAlbumTracks("ancient-ground"), entry.trackNumber) ||
         (() => { throw new Error(`Sem MP3 ancient-ground/faixa ${entry.trackNumber}`); })());

    const slug = `ag-${entry.temas.join("-")}-w${week}-${day}`;
    agPosts.push({
      id: slug,
      brandSlug: "ancient-ground",
      day,
      label: entry.label,
      trackNumber: entry.trackNumber,
      temas: entry.temas,
      verses: suggest.versos?.slice(0, 2) || [],
      musicUrl,
      clipUrls,
      captions,
      schedule: Object.fromEntries(
        ALL_PLATFORMS.map((p) => [
          p, scheduleFor(year, week, day, BRANDS["ancient-ground"].hoursByPlatform[p]),
        ]),
      ),
      videoUrl: null,
      thumbnailUrl: null,
      jobId: null,
    });
    console.log("✓");
    slotIdx++;
  }

  if (!args.dryRun) {
    await writeFile(
      path.join(outDir, "ancient-ground-plan.json"),
      JSON.stringify({ year, week, brand: "ancient-ground", posts: agPosts }, null, 2),
    );
  }
  console.log(`   ${agPosts.length} posts planeados.\n`);

  console.log(`✅ Plano completo: ${lorannePosts.length + agPosts.length} posts.`);
  if (!args.dryRun) {
    console.log(`   ${path.relative(APP_ROOT, outDir)}/loranne-plan.json`);
    console.log(`   ${path.relative(APP_ROOT, outDir)}/ancient-ground-plan.json`);
  }
  console.log(`\n   Próximo: npm run weekly:render -- --semana ${week}\n`);
}

main().catch((err) => { console.error("\n✗", err.message); process.exit(1); });
