/**
 * Prompts Midjourney V7 video para a motion library "Hoje, em Mim".
 *
 * Cada prompt gera um clipe 9:16 entre 12 e 15 segundos, motion lento e
 * contemplativo. Ideal para servir de fundo a uma frase de fecho de dia.
 *
 * Sugestão de uso: rodar entre clips por dia/semana para evitar repetição
 * visual. Os 5 primeiros (★) cobrem o leque mínimo (vegetação, água, lume,
 * chuva, vela).
 *
 * Cada entrada inclui:
 *  - id: identificador estável para mood-tags futuras
 *  - prompt: cola direto na Midjourney
 *  - audioMood: mood de áudio recomendado de hoje-em-mim/audio.ts
 *  - notas: ajuste fino opcional
 */

import type { NightMood } from "@/lib/hoje-em-mim/audio";

export type MjVideoPrompt = {
  id: string;
  prompt: string;
  /** Mood de áudio recomendado para acompanhar este visual. */
  audioMood: NightMood;
  /** Notas para a editora. */
  notas?: string;
  /** Marcado como prioritário no primeiro batch da library. */
  prioritario?: boolean;
};

export const MJ_VIDEO_PROMPTS: MjVideoPrompt[] = [
  {
    id: "mj-01-lua-piscina",
    prioritario: true,
    prompt:
      "Slow moonlight reflections on a still dark pool, silvery ripples, no people, indigo and pearl tones, cinematic, ambient nocturnal, soft grain --ar 9:16 --motion 1",
    audioMood: "lua-sobre-agua",
  },
  {
    id: "mj-02-vela-stucco",
    prioritario: true,
    prompt:
      "Single warm candle flame flickering against a dark stucco wall, shadow play, intimate sanctuary mood, deep navy background, slow --ar 9:16 --motion 1",
    audioMood: "lareira-respira",
    notas: "Reescrever 'candle' para 'beeswax candle' se MJ devolver vela genérica.",
  },
  {
    id: "mj-03-tropical-amber",
    prioritario: true,
    prompt:
      "Tropical broadleaf plants swaying in night breeze, backlit by amber lantern, deep indigo surround, African verandah at night, cinematic depth --ar 9:16 --motion 2",
    audioMood: "brisa-bambu",
  },
  {
    id: "mj-04-brasas",
    prioritario: true,
    prompt:
      "Glowing embers in a low brazier, orange sparks rising slowly, dark earthy background, hypnotic, contemplative, dust particles --ar 9:16 --motion 1",
    audioMood: "lareira-respira",
  },
  {
    id: "mj-05-chuva-janela",
    prioritario: true,
    prompt:
      "Fine rain on a window pane at night, warm interior amber light behind, blurred droplets, melancholic peace --ar 9:16 --motion 2",
    audioMood: "chuva-fina-no-telhado",
  },
  {
    id: "mj-06-bambu-ocre",
    prompt:
      "Bamboo leaves swaying in night air, soft shadows on earthen ochre wall, low warm lantern light, very slow --ar 9:16 --motion 1",
    audioMood: "brisa-bambu",
  },
  {
    id: "mj-07-baobab-lua",
    prompt:
      "Full moon behind drifting silver clouds, silhouette of a single baobab tree, African savannah at night, wide --ar 9:16 --motion 2",
    audioMood: "coruja-distante",
  },
  {
    id: "mj-08-cortina-linho",
    prompt:
      "White linen curtain billowing in moonlit window, silvery blue light, slow gentle motion, soft sheer fabric --ar 9:16 --motion 2",
    audioMood: "brisa-bambu",
  },
  {
    id: "mj-09-pirilampos",
    prompt:
      "Fireflies floating in a dark forest clearing, faint blue moon above, dreamy slow movement, ambient --ar 9:16 --motion 2",
    audioMood: "grilos-tropicais",
  },
  {
    id: "mj-10-fonte-pedra",
    prompt:
      "Water trickling from a black stone fountain in a moonlit African garden, single low warm lantern nearby, peaceful --ar 9:16 --motion 1",
    audioMood: "lua-sobre-agua",
  },
  {
    id: "mj-11-via-lactea",
    prompt:
      "Milky Way slowly drifting over silhouetted acacia trees, deep cosmic blues and purples, time-lapse feel but slow --ar 9:16 --motion 2",
    audioMood: "sussurro-coro-feminino",
  },
  {
    id: "mj-12-cha-quente",
    prompt:
      "Hands wrapping themselves around a warm clay cup of tea, soft amber kitchen light at night, intimate close framing --ar 9:16 --motion 1",
    audioMood: "lareira-respira",
    notas: "Para variantes corpo (sábado): mãos como protagonistas, sem rosto.",
  },
  {
    id: "mj-13-incenso",
    prompt:
      "White incense smoke rising slowly in a dark room, single beam of warm light cutting through, very still --ar 9:16 --motion 1",
    audioMood: "tigela-grave",
  },
  {
    id: "mj-14-rede-verandah",
    prompt:
      "Soft amber-lit hammock swaying gently on a verandah, dark tropical garden beyond, calm warm dusk to night --ar 9:16 --motion 2",
    audioMood: "grilos-tropicais",
  },
  {
    id: "mj-15-diario-cera",
    prompt:
      "Pages of an old leather journal turning slowly in candlelight, warm shadows, intimate writing nook --ar 9:16 --motion 1",
    audioMood: "lareira-respira",
    notas: "Bom para segunda (convite) e quinta (aprendi).",
  },
  {
    id: "mj-16-mar-noite",
    prompt:
      "Calm small waves on dark sand at night, distant moon reflection, no people, contemplative, slow --ar 9:16 --motion 2",
    audioMood: "mare-noturna",
  },
  {
    id: "mj-17-tambor-shadow",
    prompt:
      "Single low African udu drum in soft amber light, slight shadow movement on dark wall, no hands visible, contemplative --ar 9:16 --motion 1",
    audioMood: "tambor-lento-distante",
    notas: "Pode usar 'djembe' se udu não devolver bem.",
  },
];

/** Filtro para o batch prioritário (5 primeiros). */
export const MJ_PRIORITARIOS = MJ_VIDEO_PROMPTS.filter((p) => p.prioritario);
