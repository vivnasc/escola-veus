/**
 * Calendario de Producao e Publicacao — Escola dos Veus
 * ─────────────────────────────────────────────────────
 *
 * PRINCIPIO: Nao produzir tudo de uma vez.
 * Producao faseada — um curso de cada vez.
 * Prioridade imediata: YouTube do Ouro Proprio.
 *
 * 20 cursos | 4 categorias | ~400-480 video-aulas + YouTube hooks
 *
 * Fases:
 *   FASE 0 — YouTube pre-lancamento (JA — Marco/Abril 2026)
 *   FASE 1 — Ouro Proprio completo (curso + materiais)
 *   FASE 2 — Cursos 2-5 (um de cada vez, trimestral)
 *   FASE 3 — Cursos 6-10 (originais)
 *   FASE 4 — Cursos 11-20 (dualidade)
 */

import type { CourseSlug } from "@/types/course";

// ─── Types ──────────────────────────────────────────────────────────────────────

export type ProductionPhase =
  | "youtube_pre_launch"  // Videos YouTube antes do curso existir
  | "script_writing"      // Scripts das video-aulas
  | "voice_generation"    // Audio com ElevenLabs
  | "visual_generation"   // Imagens/video com ThinkDiffusion
  | "video_assembly"      // Montagem final
  | "materials_pdf"       // Manual + cadernos de exercicios
  | "platform_setup"      // Pagina na plataforma, pagamento, acesso
  | "review_approval"     // Vivianne revê e aprova
  | "soft_launch"         // Lancamento para early access
  | "public_launch";      // Lancamento publico

export type TaskStatus =
  | "not_started"
  | "in_progress"
  | "blocked"
  | "done";

export type ProductionTask = {
  phase: ProductionPhase;
  description: string;
  status: TaskStatus;
  blockedBy?: string;
  estimatedDays?: number;
  notes?: string;
};

export type CourseProductionPlan = {
  courseSlug: CourseSlug;
  courseTitle: string;
  courseNumber: number;
  category: "materia" | "herancas" | "ciclos" | "fronteiras";
  wave: number;           // Onda de lancamento (1-7)
  targetQuarter: string;  // Ex: "Q2 2026"
  youtubeHooks: number;   // Quantos videos YouTube de gancho
  videoLessons: number;   // Quantas video-aulas (~20-24)
  tasks: ProductionTask[];
};

export type YouTubeProductionTask = {
  videoNumber: number;
  title: string;
  courseOrigin: CourseSlug;
  week: number;
  status: TaskStatus;
  scriptStatus: "draft" | "script_ready" | "approved";
  audioStatus: TaskStatus;
  visualsStatus: TaskStatus;
  assemblyStatus: TaskStatus;
  publishDate?: string;   // YYYY-MM-DD
};

// ─── YouTube Pre-Launch Calendar (PRIORIDADE IMEDIATA) ──────────────────────

/**
 * FASE 0: YouTube — 21 videos em 7 semanas
 * Comeca JA. 3 por semana (Terca, Quinta, Sabado) 18h Maputo.
 *
 * Semana 1-4: scripts prontos (12 videos)
 * Semana 5-7: scripts em draft (9 videos) — escrever AGORA
 *
 * Pipeline por video:
 *   1. Script aprovado pela Vivianne (~1 dia)
 *   2. Audio gerado via ElevenLabs (~15 min)
 *   3. Imagens geradas via ThinkDiffusion (~2-4h)
 *   4. Montagem (a definir ferramenta)
 *   5. Review Vivianne (~1 dia)
 *   6. Upload + agendamento YouTube
 *
 * Para publicar 3/semana, precisa de 1 semana de avanco minimo.
 * Objectivo: ter semana 1 (3 videos) prontos para publicar ESTA SEMANA.
 */

export const YOUTUBE_PRODUCTION: YouTubeProductionTask[] = [
  // ── Semana 1: Entrada no Mundo ──
  {
    videoNumber: 1,
    title: "Porque sentes culpa quando gastas dinheiro em ti mesma?",
    courseOrigin: "ouro-proprio" as CourseSlug,
    week: 1,
    status: "in_progress",
    scriptStatus: "script_ready",
    audioStatus: "not_started",
    visualsStatus: "not_started",
    assemblyStatus: "not_started",
  },
  {
    videoNumber: 2,
    title: "3 frases sobre dinheiro que a tua mae te ensinou sem saber",
    courseOrigin: "ouro-proprio" as CourseSlug,
    week: 1,
    status: "in_progress",
    scriptStatus: "script_ready",
    audioStatus: "not_started",
    visualsStatus: "not_started",
    assemblyStatus: "not_started",
  },
  {
    videoNumber: 3,
    title: "A diferenca entre ser amada e ser util",
    courseOrigin: "limite-sagrado" as CourseSlug,
    week: 1,
    status: "not_started",
    scriptStatus: "script_ready",
    audioStatus: "not_started",
    visualsStatus: "not_started",
    assemblyStatus: "not_started",
  },
  // ── Semana 2: Alargar o Territorio ──
  {
    videoNumber: 4,
    title: "Porque estas sempre cansada e ferias nao resolvem",
    courseOrigin: "o-peso-e-o-chao" as CourseSlug,
    week: 2,
    status: "not_started",
    scriptStatus: "script_ready",
    audioStatus: "not_started",
    visualsStatus: "not_started",
    assemblyStatus: "not_started",
  },
  {
    videoNumber: 5,
    title: "O teste do preco: diz o teu valor em voz alta",
    courseOrigin: "ouro-proprio" as CourseSlug,
    week: 2,
    status: "not_started",
    scriptStatus: "script_ready",
    audioStatus: "not_started",
    visualsStatus: "not_started",
    assemblyStatus: "not_started",
  },
  {
    videoNumber: 6,
    title: "A conversa que ensaias no chuveiro ha meses",
    courseOrigin: "voz-de-dentro" as CourseSlug,
    week: 2,
    status: "not_started",
    scriptStatus: "script_ready",
    audioStatus: "not_started",
    visualsStatus: "not_started",
    assemblyStatus: "not_started",
  },
  // ── Semana 3: Profundidade ──
  {
    videoNumber: 7,
    title: "5 sinais de que estas a desaparecer numa relacao",
    courseOrigin: "a-arte-da-inteireza" as CourseSlug,
    week: 3,
    status: "not_started",
    scriptStatus: "script_ready",
    audioStatus: "not_started",
    visualsStatus: "not_started",
    assemblyStatus: "not_started",
  },
  {
    videoNumber: 8,
    title: "As perdas que ninguem te deixou chorar",
    courseOrigin: "flores-no-escuro" as CourseSlug,
    week: 3,
    status: "not_started",
    scriptStatus: "script_ready",
    audioStatus: "not_started",
    visualsStatus: "not_started",
    assemblyStatus: "not_started",
  },
  {
    videoNumber: 9,
    title: "Porque discutir com a tua mae te faz sentir como se tivesses 12 anos",
    courseOrigin: "sangue-e-seda" as CourseSlug,
    week: 3,
    status: "not_started",
    scriptStatus: "script_ready",
    audioStatus: "not_started",
    visualsStatus: "not_started",
    assemblyStatus: "not_started",
  },
  // ── Semana 4: Fecho e Promessa ──
  {
    videoNumber: 10,
    title: "O teu corpo esta a tentar dizer-te algo — estas a ouvir?",
    courseOrigin: "pele-nua" as CourseSlug,
    week: 4,
    status: "not_started",
    scriptStatus: "script_ready",
    audioStatus: "not_started",
    visualsStatus: "not_started",
    assemblyStatus: "not_started",
  },
  {
    videoNumber: 11,
    title: "O mito da decisao perfeita",
    courseOrigin: "olhos-abertos" as CourseSlug,
    week: 4,
    status: "not_started",
    scriptStatus: "script_ready",
    audioStatus: "not_started",
    visualsStatus: "not_started",
    assemblyStatus: "not_started",
  },
  {
    videoNumber: 12,
    title: "3 sinais de que estas a repetir a vida da tua mae sem saber",
    courseOrigin: "sangue-e-seda" as CourseSlug,
    week: 4,
    status: "not_started",
    scriptStatus: "script_ready",
    audioStatus: "not_started",
    visualsStatus: "not_started",
    assemblyStatus: "not_started",
  },
  // ── Semana 5: A Dualidade ── (scripts em draft — escrever JA)
  {
    videoNumber: 13,
    title: "Porque choras sem razao aparente",
    courseOrigin: "o-fio-invisivel" as CourseSlug,
    week: 5,
    status: "not_started",
    scriptStatus: "draft",
    audioStatus: "not_started",
    visualsStatus: "not_started",
    assemblyStatus: "not_started",
  },
  {
    videoNumber: 14,
    title: "O segredo que toda a tua familia sabe mas ninguem diz",
    courseOrigin: "o-silencio-que-grita" as CourseSlug,
    week: 5,
    status: "not_started",
    scriptStatus: "draft",
    audioStatus: "not_started",
    visualsStatus: "not_started",
    assemblyStatus: "not_started",
  },
  {
    videoNumber: 15,
    title: "O que calaste para ser aceite",
    courseOrigin: "a-teia" as CourseSlug,
    week: 5,
    status: "not_started",
    scriptStatus: "draft",
    audioStatus: "not_started",
    visualsStatus: "not_started",
    assemblyStatus: "not_started",
  },
  // ── Semana 6: Corpo e Furia ──
  {
    videoNumber: 16,
    title: "Porque sorris quando queres gritar",
    courseOrigin: "a-chama" as CourseSlug,
    week: 6,
    status: "not_started",
    scriptStatus: "draft",
    audioStatus: "not_started",
    visualsStatus: "not_started",
    assemblyStatus: "not_started",
  },
  {
    videoNumber: 17,
    title: "Quando foi a ultima vez que alguem te chamou pelo teu nome",
    courseOrigin: "a-mulher-antes-de-mae" as CourseSlug,
    week: 6,
    status: "not_started",
    scriptStatus: "draft",
    audioStatus: "not_started",
    visualsStatus: "not_started",
    assemblyStatus: "not_started",
  },
  {
    videoNumber: 18,
    title: "Porque o cansaco nao passa com ferias",
    courseOrigin: "o-oficio-de-ser" as CourseSlug,
    week: 6,
    status: "not_started",
    scriptStatus: "draft",
    audioStatus: "not_started",
    visualsStatus: "not_started",
    assemblyStatus: "not_started",
  },
  // ── Semana 7: Fecho Total ──
  {
    videoNumber: 19,
    title: "Porque sentes que ja e tarde demais",
    courseOrigin: "o-relogio-partido" as CourseSlug,
    week: 7,
    status: "not_started",
    scriptStatus: "draft",
    audioStatus: "not_started",
    visualsStatus: "not_started",
    assemblyStatus: "not_started",
  },
  {
    videoNumber: 20,
    title: "A auto-sabotagem explicada: porque estragas quando esta a correr bem",
    courseOrigin: "a-coroa-escondida" as CourseSlug,
    week: 7,
    status: "not_started",
    scriptStatus: "draft",
    audioStatus: "not_started",
    visualsStatus: "not_started",
    assemblyStatus: "not_started",
  },
  {
    videoNumber: 21,
    title: "O que procuras no frigorifico a meia-noite",
    courseOrigin: "a-fome" as CourseSlug,
    week: 7,
    status: "not_started",
    scriptStatus: "draft",
    audioStatus: "not_started",
    visualsStatus: "not_started",
    assemblyStatus: "not_started",
  },
];

// ─── Course Production Waves ────────────────────────────────────────────────────

/**
 * LANCAMENTO POR ONDAS — Nao tudo de uma vez
 *
 * Onda 1 (Q2 2026): Ouro Proprio — porta de entrada universal
 *   YouTube ja a correr → curso lanca no fim das 7 semanas YouTube
 *
 * Onda 2 (Q3 2026): Limite Sagrado + Sangue e Seda
 *   Ponte natural a partir do dinheiro + relacao mae-filha
 *
 * Onda 3 (Q4 2026): A Arte da Inteireza + Pele Nua
 *   Relacoes + corpo — temas com grande procura
 *
 * Onda 4 (Q1 2027): Depois do Fogo + Flores no Escuro
 *   Recomecos + perdas — mais profundo
 *
 * Onda 5 (Q2 2027): O Peso e o Chao + Olhos Abertos + Voz de Dentro
 *   Cansaco + decisoes + comunicacao — completa os 10 originais
 *
 * Onda 6 (Q3 2027): O Fio Invisivel + O Espelho do Outro + O Silencio que Grita + A Teia
 *   Dualidade — eu e o colectivo
 *
 * Onda 7 (Q4 2027 - Q1 2028): Brasa Viva + Antes do Ninho + Maos Cansadas +
 *   Estacoes Partidas + Ouro e Sombra + Pao e Silencio
 *   Dualidade — corpo, tempo, poder, fome
 */

export const COURSE_WAVES: {
  wave: number;
  quarter: string;
  courses: { slug: CourseSlug; title: string; number: number }[];
  focus: string;
}[] = [
  {
    wave: 1,
    quarter: "Q2 2026",
    courses: [
      { slug: "ouro-proprio" as CourseSlug, title: "Ouro Proprio", number: 1 },
    ],
    focus: "Porta de entrada universal. YouTube ja a correr. Curso lanca apos semana 4-5 do YouTube.",
  },
  {
    wave: 2,
    quarter: "Q3 2026",
    courses: [
      { slug: "limite-sagrado" as CourseSlug, title: "Limite Sagrado", number: 7 },
      { slug: "sangue-e-seda" as CourseSlug, title: "Sangue e Seda", number: 2 },
    ],
    focus: "Ponte natural: dinheiro → limites → heranca familiar. 2 cursos mais pedidos apos dinheiro.",
  },
  {
    wave: 3,
    quarter: "Q4 2026",
    courses: [
      { slug: "a-arte-da-inteireza" as CourseSlug, title: "A Arte da Inteireza", number: 3 },
      { slug: "pele-nua" as CourseSlug, title: "Pele Nua", number: 6 },
    ],
    focus: "Relações + corpo. Temas de alta procura. Completa as 4 categorias.",
  },
  {
    wave: 4,
    quarter: "Q1 2027",
    courses: [
      { slug: "depois-do-fogo" as CourseSlug, title: "Depois do Fogo", number: 4 },
      { slug: "flores-no-escuro" as CourseSlug, title: "Flores no Escuro", number: 8 },
    ],
    focus: "Recomeços e perdas. Mais profundo — requer audiência já construída.",
  },
  {
    wave: 5,
    quarter: "Q2 2027",
    courses: [
      { slug: "o-peso-e-o-chao" as CourseSlug, title: "O Peso e o Chão", number: 9 },
      { slug: "olhos-abertos" as CourseSlug, title: "Olhos Abertos", number: 5 },
      { slug: "voz-de-dentro" as CourseSlug, title: "Voz de Dentro", number: 10 },
    ],
    focus: "Completa os 10 cursos originais. Cansaço + decisões + voz.",
  },
  {
    wave: 6,
    quarter: "Q3 2027",
    courses: [
      { slug: "o-fio-invisivel" as CourseSlug, title: "O Fio Invisível", number: 11 },
      { slug: "o-espelho-do-outro" as CourseSlug, title: "O Espelho do Outro", number: 12 },
      { slug: "o-silencio-que-grita" as CourseSlug, title: "O Silêncio que Grita", number: 13 },
      { slug: "a-teia" as CourseSlug, title: "A Teia", number: 14 },
    ],
    focus: "Cursos de dualidade — eu e o colectivo. Comunidade já madura.",
  },
  {
    wave: 7,
    quarter: "Q4 2027",
    courses: [
      { slug: "a-chama" as CourseSlug, title: "Brasa Viva", number: 15 },
      { slug: "a-mulher-antes-de-mae" as CourseSlug, title: "Antes do Ninho", number: 16 },
      { slug: "o-oficio-de-ser" as CourseSlug, title: "Mãos Cansadas", number: 17 },
      { slug: "o-relogio-partido" as CourseSlug, title: "Estações Partidas", number: 18 },
      { slug: "a-coroa-escondida" as CourseSlug, title: "Ouro e Sombra", number: 19 },
      { slug: "a-fome" as CourseSlug, title: "Pão e Silêncio", number: 20 },
    ],
    focus: "Cursos finais de dualidade. Fecho do catálogo completo.",
  },
];

// ─── Ouro Proprio — Plano de Producao Detalhado ────────────────────────────────

/**
 * OURO PROPRIO: O primeiro curso. Tudo comeca aqui.
 *
 * Producao do curso completo:
 * - 8 modulos x 3 sub-aulas = 24 video-aulas
 * - 1 manual PDF (~40 paginas)
 * - 8 cadernos de exercicios PDF
 * - 3 videos YouTube (ganchos) — JA COM SCRIPT PRONTO
 * - Pagina de venda na plataforma
 * - Sistema de pagamento configurado
 *
 * Timeline:
 *   Semana 1-2: YouTube videos 1-6 (producao + publicacao)
 *   Semana 2-3: Scripts das 24 video-aulas
 *   Semana 3-4: Audio (ElevenLabs) + Visuais (ThinkDiffusion)
 *   Semana 4-5: Montagem + PDFs
 *   Semana 5-6: Review Vivianne + ajustes
 *   Semana 6-7: Soft launch (early access) + YouTube semana 4
 *   Semana 7: Lancamento publico
 */

export const OURO_PROPRIO_PRODUCTION: ProductionTask[] = [
  // YouTube (PRIORIDADE MAXIMA — fazer JA)
  {
    phase: "youtube_pre_launch",
    description: "Gerar audio dos 3 scripts YouTube do Ouro Proprio (ElevenLabs)",
    status: "not_started",
    estimatedDays: 1,
    notes: "Scripts prontos: 'Porque sentes culpa...', '3 frases sobre dinheiro...', 'O teste do preco...'",
  },
  {
    phase: "youtube_pre_launch",
    description: "Gerar visuais para os 3 videos YouTube (ThinkDiffusion — territorio Casa dos Espelhos)",
    status: "not_started",
    blockedBy: "LoRA treinado com estilo Mundo dos Veus",
    estimatedDays: 2,
    notes: "~6 imagens por video. Silhueta + Casa dos Espelhos Dourados.",
  },
  {
    phase: "youtube_pre_launch",
    description: "Montagem dos 3 videos YouTube do Ouro Proprio",
    status: "not_started",
    blockedBy: "Audio + visuais prontos. Ferramenta de montagem definida.",
    estimatedDays: 2,
  },
  {
    phase: "review_approval",
    description: "Vivianne aprova os 3 videos YouTube do Ouro Proprio",
    status: "not_started",
    estimatedDays: 1,
  },

  // Video-aulas do curso
  {
    phase: "script_writing",
    description: "Escrever scripts das 24 video-aulas (8 modulos x 3 sub-aulas)",
    status: "not_started",
    estimatedDays: 5,
    notes: "Estrutura definida no catalogo. Cada sub-aula: ~5-7 min narrados.",
  },
  {
    phase: "review_approval",
    description: "Vivianne revê e aprova scripts das video-aulas",
    status: "not_started",
    estimatedDays: 3,
  },
  {
    phase: "voice_generation",
    description: "Gerar audio das 24 video-aulas (ElevenLabs)",
    status: "not_started",
    blockedBy: "Scripts aprovados",
    estimatedDays: 2,
  },
  {
    phase: "visual_generation",
    description: "Gerar visuais para 24 video-aulas (ThinkDiffusion — Casa dos Espelhos, 4 estagios)",
    status: "not_started",
    blockedBy: "LoRA treinado. Scripts aprovados (para saber poses/cenas).",
    estimatedDays: 5,
    notes: "~6 imagens por video = ~144 imagens. Reutilizar biblioteca de assets.",
  },
  {
    phase: "video_assembly",
    description: "Montagem das 24 video-aulas",
    status: "not_started",
    blockedBy: "Audio + visuais + ferramenta de montagem",
    estimatedDays: 7,
  },

  // Materiais PDF
  {
    phase: "materials_pdf",
    description: "Gerar manual completo PDF (~40 paginas)",
    status: "not_started",
    blockedBy: "Scripts aprovados (conteudo do manual baseia-se nos scripts)",
    estimatedDays: 2,
  },
  {
    phase: "materials_pdf",
    description: "Gerar 8 cadernos de exercicios PDF",
    status: "not_started",
    estimatedDays: 3,
  },

  // Plataforma
  {
    phase: "platform_setup",
    description: "Pagina de venda do Ouro Proprio na plataforma",
    status: "not_started",
    estimatedDays: 2,
  },
  {
    phase: "platform_setup",
    description: "Player de video + sistema de progresso por modulo",
    status: "not_started",
    estimatedDays: 3,
  },
  {
    phase: "platform_setup",
    description: "Sistema de pagamento para cursos (Stripe/manual)",
    status: "not_started",
    estimatedDays: 2,
  },

  // Lancamento
  {
    phase: "soft_launch",
    description: "Lancamento early access (leitoras com has_early_access)",
    status: "not_started",
    notes: "Modulo 1 gratuito. Early access: 7 dias antes do publico.",
  },
  {
    phase: "public_launch",
    description: "Lancamento publico do Ouro Proprio",
    status: "not_started",
    notes: "Coincide com fim das 7 semanas YouTube. Audiencia ja aquecida.",
  },
];

// ─── Production Pipeline per Video ──────────────────────────────────────────────

/**
 * Pipeline de producao por video (YouTube ou video-aula):
 *
 * 1. SCRIPT (Claude Code gera, Vivianne aprova)
 *    Input: catalogo do curso + guidelines
 *    Output: texto narrado + notas visuais
 *    Tempo: ~30 min geracao + 1 dia aprovacao
 *
 * 2. AUDIO (ElevenLabs API)
 *    Input: texto narrado aprovado
 *    Output: ficheiro MP3/WAV
 *    Tempo: ~5 min por video
 *    Custo: ~$0.01-0.05 por video
 *
 * 3. VISUAIS (ThinkDiffusion / ComfyUI API)
 *    Input: notas visuais + pose da silhueta + territorio + estagio
 *    Output: 4-8 imagens por video (+ possivelmente clips animados)
 *    Tempo: ~1-2h por video
 *    Custo: ~$1-2 por video
 *
 * 4. MONTAGEM
 *    Input: audio + imagens + texto overlay
 *    Output: video final MP4
 *    Tempo: ~1-2h por video (se programatico) ou ~30min (se manual)
 *    Ferramenta: A DEFINIR (ffmpeg? CapCut? DaVinci?)
 *
 * 5. REVIEW (Vivianne)
 *    Input: video final
 *    Output: aprovado ou notas de ajuste
 *    Tempo: ~15 min por video
 *
 * 6. PUBLICACAO
 *    YouTube: upload + titulo + descricao + thumbnail + agendamento
 *    Plataforma: upload Supabase Storage + metadata
 */

// ─── Immediate Action Items ─────────────────────────────────────────────────────

/**
 * O QUE FAZER AGORA (Marco 2026):
 *
 * [ ] 1. BLOQUEADOR: Definir ferramenta de montagem de video
 *        Opcoes: ffmpeg (programatico), CapCut, DaVinci Resolve
 *        Sem isto, nada se publica.
 *
 * [ ] 2. BLOQUEADOR: Treinar LoRA com estilo Mundo dos Veus
 *        As imagens de referencia ja existem em CURSOS/imagens/
 *        Sem isto, os visuais nao tem consistencia.
 *
 * [ ] 3. Gerar audio dos 3 primeiros videos YouTube (Ouro Proprio)
 *        Scripts ja prontos em youtube-scripts.ts
 *        ElevenLabs API ja integrada
 *
 * [ ] 4. Gerar visuais para video 1: "Porque sentes culpa quando gastas dinheiro em ti mesma?"
 *        Territorio: Casa dos Espelhos Dourados
 *        Silhueta: sentada → maos no peito → de pe
 *        Cor: ambar (#D4A853)
 *
 * [ ] 5. Montar video 1 (piloto) — testar o pipeline completo
 *        Se funciona, replica para os restantes 20.
 *
 * [ ] 6. Vivianne aprova video 1
 *
 * [ ] 7. Publicar video 1 no YouTube
 *        Titulo, descricao, thumbnail, CTA para Escola dos Veus
 *
 * [ ] 8. Enquanto videos 2-3 sao produzidos, comecar scripts das video-aulas do Ouro Proprio
 */

// ─── Helpers ────────────────────────────────────────────────────────────────────

export function getWaveByCourse(courseSlug: string): number | undefined {
  for (const wave of COURSE_WAVES) {
    if (wave.courses.some((c) => c.slug === courseSlug)) {
      return wave.wave;
    }
  }
  return undefined;
}

export function getNextYouTubeVideo(): YouTubeProductionTask | undefined {
  return YOUTUBE_PRODUCTION.find(
    (v) => v.status === "not_started" || v.status === "in_progress"
  );
}

export function getYouTubeVideosByWeek(week: number): YouTubeProductionTask[] {
  return YOUTUBE_PRODUCTION.filter((v) => v.week === week);
}

export function getReadyToProduceVideos(): YouTubeProductionTask[] {
  return YOUTUBE_PRODUCTION.filter(
    (v) => v.scriptStatus === "script_ready" && v.audioStatus === "not_started"
  );
}

export function getBlockedTasks(): ProductionTask[] {
  return OURO_PROPRIO_PRODUCTION.filter((t) => t.blockedBy);
}

export const PRODUCTION_SUMMARY = {
  totalCourses: 20,
  totalVideoLessons: 480, // 20 cursos x 24 video-aulas
  totalYouTubeHooks: 21,  // 7 semanas x 3
  totalManuals: 20,
  totalWorkbooks: 160,    // 20 cursos x 8
  estimatedCompletionDate: "Q1 2028",
  immediateTarget: "Video YouTube #1 do Ouro Proprio — esta semana",
} as const;
