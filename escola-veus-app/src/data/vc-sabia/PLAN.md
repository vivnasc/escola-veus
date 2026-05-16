# VC Sabia Que…? — Plano de trabalho

Sub-produção diária da página pessoal **Vivianne dos Santos**.
Posts de manhã: Instagram + TikTok (via Metricool) + WhatsApp Status (manual).

## Estado actual

- [x] Seed de 80 frases (13 temas, capital inicial, didácticas, manhã)
- [x] Página de preview com 3 variantes A/B/C
- [x] 3ª tab VC Sabia no Bulk semanal (ao lado de Loranne / AG)
- [x] Variante C escolhida (vidro transparente + moldura dourada)
- [x] Assinatura `seteveus.space`
- [x] Removido título redundante do topo do post
- [ ] **Fase 1** · Captions IG/TikTok/WhatsApp + copy buttons no preview
- [ ] **Fase 2** · Áudios manhã via ElevenLabs SFX API
- [ ] **Fase 3** · UI "Gerar semana N" com 7 dias × frase × motion × áudio
- [ ] **Fase 4** · Composition Remotion `<VcSabiaPost />`
- [ ] **Fase 5** · ZIP Metricool semanal + TXT WhatsApp Status

## Decisões técnicas tomadas

| Tema | Decisão |
|---|---|
| Variante visual | **C** — vidro fosco transparente (opacidade 0.14, blur 6px) + moldura dourada + cantos |
| Assinatura no vídeo | `seteveus.space` (footer pequeno) |
| Marca destino | Vivianne dos Santos (separada de Loranne e Ancient Ground) |
| Áudios | ElevenLabs Sound Effects API (gerados on-demand, mood: birds_dawn / stream / wind / rain) |
| Motions | **Midjourney v6/v7 `--video`** (cinematográfico, contemplativo). Runway descartado — não consegue o tom de manhã moçambicana/lusófona. Prompts gerados em `lib/vc-sabia/midjourney.ts` por tema+mood, copiáveis a partir do plano. |
| Render | Remotion (mesma infra que Loranne) |
| Tipografia | Cormorant Garamond italic (frase) + Inter caps (kicker, assinatura) |
| Cadência | 7 posts/semana, manhã (~10:00 Maputo IG, ~10:30 Maputo TikTok · CAT, UTC+2) |
| Output | MP4 1080×1920 H.264, 10-15s |

## Pendente — preciso de ti

- [ ] `ELEVENLABS_API_KEY` em `.env.local` e em Vercel (necessário para Fase 2)
- [ ] MP4 motions Midjourney 9:16 carregados em `vc-sabia-motions/` (1 por dia da semana). Usa o botão "⌘ copy MJ prompt" no plano para obter o prompt determinista por (tema, mood).
- [ ] Confirmar horário publicação por canal

## Arquitectura

```
src/
├── data/
│   ├── vc-sabia-frases.seed.json    [✓ 80 frases]
│   └── vc-sabia-audios.seed.json    [Fase 2]
├── lib/vc-sabia/
│   ├── captions.ts                  [Fase 1]
│   ├── audio.ts                     [Fase 2 — ElevenLabs SFX]
│   ├── weekly-plan.ts               [Fase 3]
│   └── package.ts                   [Fase 5 — ZIP Metricool]
├── components/vc-sabia/
│   ├── PreviewPanel.tsx             [✓]
│   ├── CaptionsPanel.tsx            [Fase 1]
│   └── WeeklyPlanPanel.tsx          [Fase 3]
├── remotion/
│   └── VcSabiaPost.tsx              [Fase 4]
├── app/api/admin/vc-sabia/
│   ├── audio/route.ts               [Fase 2]
│   ├── weekly/plan/route.ts         [Fase 3]
│   └── weekly/package/route.ts      [Fase 5]
└── app/admin/producao/vc-sabia/
    └── preview/page.tsx             [✓]
public/assets/vc-sabia/
├── motions/                         [arrastas MP4 MJ]
│   ├── db5056e4-...mp4              [✓ teste]
│   └── IMG_8599.webp                [✓ still teste]
└── audios/morning/                  [gerados pela API]
```

## Fluxo de produção semanal

1. Domingo à noite → `Gerar plano semana N`
2. Sistema escolhe 7 frases × 7 motions × gera 7 áudios via ElevenLabs
3. Render queue produz 7 MP4 finais
4. `Empacotar` → ZIP com:
   - `mp4/seg.mp4` … `mp4/dom.mp4`
   - `metricool.csv` (IG + TikTok schedule + captions)
   - `whatsapp-status.txt` (7 entradas, uma por dia)
5. Drop do CSV em Metricool, copy/paste manual para WhatsApp Status

---

**Próximo commit (Fase 1):** captions module + UI no preview com 3 botões copy.
