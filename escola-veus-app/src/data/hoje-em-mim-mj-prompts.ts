/**
 * Prompts Midjourney V7 video para a motion library "Hoje, em Mim".
 *
 * 30 prompts (1 por dia, com folga para 1 mês completo). Todos para 9:16
 * vertical, movimento lento e contemplativo. Cada prompt vem emparelhado
 * com um mood de áudio ElevenLabs.
 *
 * Notas:
 *  - O parâmetro --motion foi removido (Midjourney atual não está a aceitar).
 *  - O prompt 'lua-piscina' do batch anterior foi excluído (já gerado).
 *  - Os 5 marcados com ★ (prioritarios) cobrem o leque visual mínimo,
 *    bons para começar enquanto se gera o resto.
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
    id: "mj-01-vela-stucco",
    prioritario: true,
    prompt:
      "Single warm beeswax candle flame flickering against a dark stucco wall, shadow play, intimate sanctuary mood, deep navy background, slow --ar 9:16",
    audioMood: "lareira-respira",
  },
  {
    id: "mj-02-tropical-amber",
    prioritario: true,
    prompt:
      "Tropical broadleaf plants swaying in night breeze, backlit by amber lantern, deep indigo surround, African verandah at night, cinematic depth --ar 9:16",
    audioMood: "brisa-bambu",
  },
  {
    id: "mj-03-brasas",
    prioritario: true,
    prompt:
      "Glowing embers in a low brazier, orange sparks rising slowly, dark earthy background, hypnotic, contemplative, dust particles --ar 9:16",
    audioMood: "lareira-respira",
  },
  {
    id: "mj-04-chuva-janela",
    prioritario: true,
    prompt:
      "Fine rain on a window pane at night, warm interior amber light behind, blurred droplets, melancholic peace --ar 9:16",
    audioMood: "chuva-fina-no-telhado",
  },
  {
    id: "mj-05-incenso",
    prioritario: true,
    prompt:
      "White incense smoke rising slowly in a dark room, single beam of warm light cutting through, very still, contemplative --ar 9:16",
    audioMood: "tigela-grave",
  },
  {
    id: "mj-06-bambu-ocre",
    prompt:
      "Bamboo leaves swaying in night air, soft shadows on earthen ochre wall, low warm lantern light, very slow --ar 9:16",
    audioMood: "brisa-bambu",
  },
  {
    id: "mj-07-baobab-lua",
    prompt:
      "Full moon behind drifting silver clouds, silhouette of a single baobab tree, African savannah at night, wide --ar 9:16",
    audioMood: "coruja-distante",
  },
  {
    id: "mj-08-cortina-linho",
    prompt:
      "White linen curtain billowing in moonlit window, silvery blue light, slow gentle motion, soft sheer fabric --ar 9:16",
    audioMood: "brisa-bambu",
  },
  {
    id: "mj-09-pirilampos",
    prompt:
      "Fireflies floating in a dark forest clearing, faint blue moon above, dreamy slow movement, ambient --ar 9:16",
    audioMood: "grilos-tropicais",
  },
  {
    id: "mj-10-fonte-pedra",
    prompt:
      "Water trickling from a black stone fountain in a moonlit African garden, single low warm lantern nearby, peaceful --ar 9:16",
    audioMood: "lua-sobre-agua",
  },
  {
    id: "mj-11-via-lactea",
    prompt:
      "Milky Way slowly drifting over silhouetted acacia trees, deep cosmic blues and purples, time-lapse feel but slow --ar 9:16",
    audioMood: "sussurro-coro-feminino",
  },
  {
    id: "mj-12-cha-quente",
    prompt:
      "Hands wrapping themselves around a warm clay cup of tea, soft amber kitchen light at night, intimate close framing --ar 9:16",
    audioMood: "lareira-respira",
    notas: "Bom para sábado (corpo). Mãos como protagonistas, sem rosto.",
  },
  {
    id: "mj-13-rede-verandah",
    prompt:
      "Soft amber-lit hammock swaying gently on a verandah, dark tropical garden beyond, calm warm dusk to night --ar 9:16",
    audioMood: "grilos-tropicais",
  },
  {
    id: "mj-14-diario-cera",
    prompt:
      "Pages of an old leather journal turning slowly in candlelight, warm shadows, intimate writing nook --ar 9:16",
    audioMood: "lareira-respira",
    notas: "Bom para segunda (convite) e quinta (aprendi).",
  },
  {
    id: "mj-15-mar-noite",
    prompt:
      "Calm small waves on dark sand at night, distant moon reflection, no people, contemplative, slow --ar 9:16",
    audioMood: "mare-noturna",
  },
  {
    id: "mj-16-tambor-shadow",
    prompt:
      "Single low African udu drum in soft amber light, slight shadow movement on dark wall, no hands visible, contemplative --ar 9:16",
    audioMood: "tambor-lento-distante",
    notas: "Pode tentar 'djembe' se udu não devolver bem.",
  },
  {
    id: "mj-17-velas-mesa",
    prompt:
      "Three warm beeswax candles flickering on a dark wood table, soft amber halo, deep navy room beyond, intimate altar feel --ar 9:16",
    audioMood: "lareira-respira",
  },
  {
    id: "mj-18-sombra-planta",
    prompt:
      "Soft shadow of a single house plant swaying on a creamy plaster wall, warm lamp light, very slow, intimate room --ar 9:16",
    audioMood: "brisa-bambu",
    notas: "Bom para quarta (soltar). Movimento mínimo, quase abstrato.",
  },
  {
    id: "mj-19-vapor-cha",
    prompt:
      "Steam rising slowly from a dark stoneware cup of tea on wooden surface, soft warm side light, dark navy background, intimate --ar 9:16",
    audioMood: "lareira-respira",
  },
  {
    id: "mj-20-silhueta-janela",
    prompt:
      "Silhouette of a woman from behind looking out of an arched window at the moon, deep indigo room, single soft lamp glow, contemplative --ar 9:16",
    audioMood: "sussurro-coro-feminino",
    notas: "Bom para domingo (intenção).",
  },
  {
    id: "mj-21-estrelas-poca",
    prompt:
      "Stars reflected in a still puddle of water on dark earth, gentle ripple, no people, magical realism, contemplative --ar 9:16",
    audioMood: "lua-sobre-agua",
  },
  {
    id: "mj-22-coruja-ramo",
    prompt:
      "Owl silhouette perched on a bare branch under a misty moon, faint blue light, slow gentle camera drift, quiet --ar 9:16",
    audioMood: "coruja-distante",
  },
  {
    id: "mj-23-jasmim-vela",
    prompt:
      "White jasmine flowers in a clay bowl beside a single warm candle, dark earthy background, soft amber glow, intimate --ar 9:16",
    audioMood: "lareira-respira",
    notas: "Bom para terça (gratidão) e sexta (celebrar).",
  },
  {
    id: "mj-24-pes-areia",
    prompt:
      "Bare feet softly stepping on dark cool night sand by water edge, moonlight reflection, no face visible, sensorial --ar 9:16",
    audioMood: "mare-noturna",
    notas: "Bom para sábado (corpo).",
  },
  {
    id: "mj-25-aldeia-distante",
    prompt:
      "Distant African village at night with small warm yellow window lights, silhouette of acacia trees, deep blue sky, quiet --ar 9:16",
    audioMood: "tambor-lento-distante",
  },
  {
    id: "mj-26-teia-orvalho",
    prompt:
      "Close up of a spider web glistening with dew drops under moonlight, very slow drift, dark forest background, delicate --ar 9:16",
    audioMood: "grilos-tropicais",
  },
  {
    id: "mj-27-fogueira-silhuetas",
    prompt:
      "Small fire pit in the desert at night, silhouettes of people sitting around in distance, warm amber light, deep starry sky --ar 9:16",
    audioMood: "tambor-lento-distante",
  },
  {
    id: "mj-28-chocolate-vapor",
    prompt:
      "Steam rising from a mug of dark cacao in soft amber kitchen light at night, hands cradling the mug, intimate close framing --ar 9:16",
    audioMood: "lareira-respira",
  },
  {
    id: "mj-29-caminho-lanternas",
    prompt:
      "Garden path lined with low warm lanterns at night, soft fog, peaceful, no people, depth of field --ar 9:16",
    audioMood: "grilos-tropicais",
  },
  {
    id: "mj-30-pena-cai",
    prompt:
      "Single white feather falling slowly through a beam of moonlight, deep dark background, soft glow, dreamlike --ar 9:16",
    audioMood: "sussurro-coro-feminino",
    notas: "Bom para quarta (soltar) e domingo (intenção).",
  },
];

/** Filtro para o batch prioritário (5 primeiros marcados ★). */
export const MJ_PRIORITARIOS = MJ_VIDEO_PROMPTS.filter((p) => p.prioritario);
