// ─── TYPES ───────────────────────────────────────────────────────────────────

export type Platform = "instagram" | "whatsapp" | "ambos";

export type CarouselSlide = {
  bg: string;
  text: string;
  accent: string;
  title: string;
  body: string;
  footer?: string;
  /** Background image path (from /public). Rendered blurred behind the color overlay. */
  bgImage?: string;
};

export type ReelScript = {
  hook: string;         // first 3 seconds — must stop the scroll
  scenes: string[];     // scene-by-scene description / voiceover
  cta: string;          // call to action at the end
  music: string;        // suggested music/mood
  duration: string;     // e.g. "30-45s"
  canvaTemplate?: string; // Canva template suggestion
};

export type ContentSlot = {
  platform: Platform;
  type: string;
  visual?: {
    bg: string;
    text: string;
    accent: string;
    format: "square" | "vertical";
    title: string;
    body: string;
    footer?: string;
    highlight?: string;
  };
  carousel?: CarouselSlide[];
  reelScript?: ReelScript;
  caption?: string;
  notes?: string;
  broadcast?: string;
};

export type DayPlan = {
  day: string;
  dayShort: string;
  theme: string;
  slots: ContentSlot[];
};

export type WeekPlan = {
  weekNumber: number;
  title: string;
  subtitle: string;
  days: DayPlan[];
};

// ─── SEMANA 1: LAN\u00c7AMENTO DA PLATAFORMA ──────────────────────────────────────

const week1: WeekPlan = {
  weekNumber: 1,
  title: "Lan\u00e7amento da nova plataforma",
  subtitle: "Anunciar o revamp, mostrar novidades, convidar a explorar",
  days: [
    {
      day: "Segunda-feira",
      dayShort: "Seg",
      theme: "An\u00fancio principal",
      slots: [
        {
          platform: "instagram",
          type: "Post Feed",
          visual: {
            bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", format: "square",
            title: "H\u00e1 um momento\nem que paras\ne percebes que\nest\u00e1s a assistir\n\u00e0 tua pr\u00f3pria vida.",
            body: "N\u00e3o \u00e9 burnout.\nN\u00e3o \u00e9 ingratid\u00e3o.\n\u00c9 algo mais subtil.\n\nH\u00e1 uma hist\u00f3ria sobre isso.",
            footer: "seteveus.space",
            highlight: "Os Sete V\u00e9us",
          },
          caption: "H\u00e1 um momento em que paras e percebes que est\u00e1s a assistir \u00e0 tua pr\u00f3pria vida.\n\nN\u00e3o \u00e9 burnout. N\u00e3o \u00e9 ingratid\u00e3o. \u00c9 algo mais subtil.\n\nO Espelho da Ilus\u00e3o \u00e9 uma hist\u00f3ria sobre isso. E sobre a mulher que, pela primeira vez, perguntou.\n\nEnvia a quem precisar de ouvir isto.\n\nseteveus.space\n\n#OsSeteVeus #EspelhoDaIlusao #Autoconhecimento",
        },
        {
          platform: "whatsapp",
          type: "Status",
          visual: {
            bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", format: "vertical",
            title: "Fazes tudo certo.\nAs coisas funcionam.\nMas n\u00e3o \u00e9 bem\na tua vida.",
            body: "Reconheces esta sensa\u00e7\u00e3o?\n\nH\u00e1 uma hist\u00f3ria sobre isso.",
            footer: "seteveus.space",
          },
        },
      ],
    },
    {
      day: "Ter\u00e7a-feira",
      dayShort: "Ter",
      theme: "Mostrar o interior da plataforma",
      slots: [
        {
          platform: "instagram",
          type: "Carrossel (prints reais)",
          notes: "Faz screenshot destas p\u00e1ginas no telem\u00f3vel e usa como slides do carrossel:\n\n1. seteveus.space/membro (dashboard)\n2. seteveus.space/membro/leitura (leitor)\n3. seteveus.space/membro/leitura/1 (cap\u00edtulo aberto)\n4. seteveus.space/comunidade (comunidade)\n5. seteveus.space/recursos/teste (quiz)\n\nLegenda: \u201cN\u00e3o \u00e9 um livro. \u00c9 uma experi\u00eancia. Swipe para ver por dentro.\u201d",
          caption: "N\u00e3o \u00e9 um livro. \u00c9 uma experi\u00eancia.\n\n\u27a1\ufe0f Leitura integrada com pausas de reflex\u00e3o\n\u27a1\ufe0f Di\u00e1rio pessoal auto-guardado\n\u27a1\ufe0f Respira\u00e7\u00e3o guiada entre cap\u00edtulos\n\u27a1\ufe0f Comunidade an\u00f3nima\n\u27a1\ufe0f Chatbot para todas as d\u00favidas\n\nSwipe para ver por dentro \u2192\n\n#OsSeteV\u00e9us #LeituraIntegrada #Autoconhecimento",
        },
        {
          platform: "whatsapp",
          type: "Status",
          visual: {
            bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", format: "vertical",
            title: "A vida que tens\nfoi escolhida por ti?\nOu apenas\nherdada?",
            body: "H\u00e1 uma pergunta que n\u00e3o tem resposta f\u00e1cil.\nMas que muda tudo quando a fazes.",
            footer: "seteveus.space/recursos/teste",
          },
        },
      ],
    },
    {
      day: "Quarta-feira",
      dayShort: "Qua",
      theme: "Recurso gratuito",
      slots: [
        {
          platform: "instagram",
          type: "Post Feed",
          visual: {
            bg: "#f7f5f0", text: "#3d3630", accent: "#7a8c6e", format: "square",
            title: "Come\u00e7a sem pagar nada.",
            body: "Teste de autoconhecimento\nDi\u00e1rio de 7 dias\nArtigos\nMini-guia\nWallpapers\nGloss\u00e1rio\n\nTudo gratuito.",
            footer: "seteveus.space/recursos",
            highlight: "Gratuito",
          },
          caption: "Sabes que na plataforma Os Sete V\u00e9us h\u00e1 v\u00e1rios recursos completamente gratuitos?\n\nTeste de autoconhecimento (3 min)\nDi\u00e1rio de 7 dias\nArtigos sobre os v\u00e9us\nMini-guia\nWallpapers\n\n#OsSeteV\u00e9us #Gratuito #TesteDeAutoconhecimento",
        },
        {
          platform: "whatsapp",
          type: "Status",
          visual: {
            bg: "#f7f5f0", text: "#3d3630", accent: "#c9b896", format: "vertical",
            title: "Descobre qual v\u00e9u\nte esconde.",
            body: "Teste de autoconhecimento gratuito.\n3 minutos.\nSem compromisso.",
            footer: "seteveus.space/recursos/teste",
          },
        },
      ],
    },
    {
      day: "Quinta-feira",
      dayShort: "Qui",
      theme: "Novidades da plataforma",
      slots: [
        {
          platform: "instagram",
          type: "Post Feed",
          visual: {
            bg: "#f7f5f0", text: "#3d3630", accent: "#7a8c6e", format: "square",
            title: "E se ler\nfosse uma forma\nde voltar\na ti mesma?",
            body: "Leitura com pausas de reflex\u00e3o\nDi\u00e1rio pessoal integrado\nRespira\u00e7\u00e3o guiada entre cap\u00edtulos\nComunidade an\u00f3nima e impermanente",
            footer: "seteveus.space",
          },
          caption: "E se ler fosse uma forma de voltar a ti mesma?\n\nN\u00e3o \u00e9 s\u00f3 leitura. \u00c9 uma experi\u00eancia com:\n\u2192 Pausas de reflex\u00e3o entre cap\u00edtulos\n\u2192 Di\u00e1rio pessoal auto-guardado\n\u2192 Respira\u00e7\u00e3o guiada\n\u2192 Comunidade an\u00f3nima\n\nEnvia a algu\u00e9m que precisa de parar para se encontrar.\n\nseteveus.space\n\n#OsSeteVeus #LeituraImersiva #Autoconhecimento",
        },
      ],
    },
    {
      day: "Sexta-feira",
      dayShort: "Sex",
      theme: "Convite leitores livro f\u00edsico",
      slots: [
        {
          platform: "instagram",
          type: "Post Feed",
          visual: {
            bg: "#ebe7df", text: "#3d3630", accent: "#c9b896", format: "square",
            title: "O teu livro\nabre portas que ainda\nn\u00e3o conheces.",
            body: "Tens Os 7 V\u00e9us do Despertar?\n\nRegista o teu interesse\ne recebe acesso \u00e0\nplataforma digital completa.\n\nGratuito.",
            footer: "seteveus.space/pedir-código",
            highlight: "Leitores do livro",
          },
          caption: "Se tens o livro f\u00edsico Os 7 V\u00e9us do Despertar, tens direito a uma experi\u00eancia digital completa.\n\nLeitura integrada, di\u00e1rio de reflex\u00e3o, comunidade e muito mais.\n\n#OsSeteV\u00e9us #LivroF\u00edsico #AcessoDigital",
        },
        {
          platform: "whatsapp",
          type: "Status",
          visual: {
            bg: "#f7f5f0", text: "#3d3630", accent: "#c9b896", format: "vertical",
            title: "Tens o livro físico?",
            body: "Acesso digital gratuito.\nLeitura integrada, diário, comunidade.",
            footer: "seteveus.space/pedir-código",
          },
        },
      ],
    },
    {
      day: "S\u00e1bado",
      dayShort: "S\u00e1b",
      theme: "Engagement",
      slots: [
        {
          platform: "ambos",
          type: "Responder DMs e mensagens",
          notes: "Responder todas as DMs do Instagram.\nResponder mensagens WhatsApp.\nComentar em 5-10 posts de seguidoras.\nEnviar mensagem de obrigada a quem partilhou conte\u00fado.",
        },
      ],
    },
    {
      day: "Domingo",
      dayShort: "Dom",
      theme: "Descanso + prepara\u00e7\u00e3o",
      slots: [
        {
          platform: "ambos",
          type: "Planear semana seguinte",
          notes: "Rever m\u00e9tricas da semana.\nAnotar o que funcionou.\nPreparar screenshots para a pr\u00f3xima semana.\nPr\u00e9-gravar 1-2 reels se poss\u00edvel.",
        },
      ],
    },
  ],
};

// ─── SEMANA 2: ESPELHO DA Ilusão ─────────────────────────────────────────────

const week2: WeekPlan = {
  weekNumber: 2,
  title: "O Espelho da Ilus\u00e3o",
  subtitle: "Promover a experi\u00eancia de leitura principal",
  days: [
    {
      day: "Segunda-feira",
      dayShort: "Seg",
      theme: "Cita\u00e7\u00e3o impactante",
      slots: [
        {
          platform: "instagram",
          type: "Post Feed",
          visual: {
            bg: "#f7f5f0", text: "#3d3630", accent: "#c9b896", format: "square",
            title: "Quando foi que escolhi\ntomar caf\u00e9\nem vez de ch\u00e1?",
            body: "Uma pergunta absurda\nque muda tudo.",
            footer: "O Espelho da Ilus\u00e3o ~ seteveus.space",
            highlight: "Espelho da Ilus\u00e3o",
          },
          caption: "\"Quando foi que escolhi tomar caf\u00e9 em vez de ch\u00e1?\"\n\nUma pergunta absurda que muda tudo.\n\nO Espelho da Ilus\u00e3o come\u00e7a assim \u2014 com uma manh\u00e3 igual a todas as outras e uma mulher que, pela primeira vez, pergunta.\n\nFaz o quiz gratuito e descobre o teu espelho:\n\n#OsSeteV\u00e9us #EspelhoDaIlus\u00e3o #Autoconhecimento",
        },
        {
          platform: "whatsapp",
          type: "Status",
          visual: {
            bg: "#f7f5f0", text: "#3d3630", accent: "#c9b896", format: "vertical",
            title: "H\u00e1 mais para ti\ndo que aquilo que\ntens vivido.",
            body: "O Espelho da Ilus\u00e3o.\nUma experi\u00eancia de leitura integrada.",
            footer: "seteveus.space",
          },
        },
      ],
    },
    {
      day: "Ter\u00e7a-feira",
      dayShort: "Ter",
      theme: "O que inclui a experi\u00eancia",
      slots: [
        {
          platform: "instagram",
          type: "Post Feed",
          visual: {
            bg: "#f7f5f0", text: "#3d3630", accent: "#7a8c6e", format: "square",
            title: "N\u00e3o \u00e9 um livro.\n\u00c9 uma experi\u00eancia.",
            body: "7 cap\u00edtulos de fic\u00e7\u00e3o\n+ respira\u00e7\u00e3o guiada\n+ di\u00e1rio de reflex\u00e3o\n+ o teu Espelho pessoal\n\nL\u00eas. Respiras. Escreves.\nE no final, v\u00eas-te.",
            footer: "seteveus.space/experiencias",
          },
          caption: "N\u00e3o \u00e9 um livro que se l\u00ea. \u00c9 uma experi\u00eancia que se vive.\n\n7 cap\u00edtulos de fic\u00e7\u00e3o\nRespira\u00e7\u00e3o guiada\nDi\u00e1rio de reflex\u00e3o\nO teu Espelho pessoal\n\n$19 USD / 1.200 MZN\nAcesso vital\u00edcio.\n\n#OsSeteV\u00e9us #ExperienciaImersiva #LeituraIntegrada",
        },
      ],
    },
    {
      day: "Quarta-feira",
      dayShort: "Qua",
      theme: "Cita\u00e7\u00e3o profunda",
      slots: [
        {
          platform: "instagram",
          type: "Post Feed",
          visual: {
            bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", format: "square",
            title: "Via, mas n\u00e3o sentia.",
            body: "Registava, mas n\u00e3o participava.\nComo quem assiste a um\nespect\u00e1culo por tr\u00e1s de uma\njanela fechada.",
            footer: "O Espelho da Ilus\u00e3o ~ seteveus.space",
          },
          caption: "\"Via, mas n\u00e3o sentia. Registava, mas n\u00e3o participava. Como quem assiste a um espect\u00e1culo por tr\u00e1s de uma janela fechada.\"\n\n\u2014 O Espelho da Ilus\u00e3o\n\n#OsSeteV\u00e9us #EspelhoDaIlus\u00e3o #Fic\u00e7\u00e3oPsicol\u00f3gica",
        },
        {
          platform: "whatsapp",
          type: "Status",
          visual: {
            bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", format: "vertical",
            title: "A vida que tens\nfoi escolhida por ti?",
            body: "O Espelho da Ilusão.\n7 capítulos. Respiração guiada. Diário.",
            footer: "seteveus.space/recursos/teste",
          },
        },
      ],
    },
    {
      day: "Quinta-feira",
      dayShort: "Qui",
      theme: "Pre\u00e7os",
      slots: [
        {
          platform: "instagram",
          type: "Post Feed",
          visual: {
            bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", format: "square",
            title: "Quanto custa\nescolher-te?",
            body: "Espelho da Ilus\u00e3o\n$19 USD / 1.200 MZN\n\nN\u00f3 da Heran\u00e7a\n$8 USD / 500 MZN\n\nLivro f\u00edsico\n$23 USD / 1.495 MZN\n\nAcesso vital\u00edcio.",
            footer: "seteveus.space/comprar",
          },
          caption: "Quanto custa escolher-te?\n\nEspelho da Ilus\u00e3o: $19 USD (1.200 MZN)\nN\u00f3 da Heran\u00e7a: $8 USD (500 MZN)\nLivro f\u00edsico: $23 USD (1.495 MZN)\n\nAcesso vital\u00edcio. Sem subscri\u00e7\u00f5es.\nPayPal, Millenium BIM ou M-Pesa.\n\n#OsSeteV\u00e9us #Autoconhecimento",
        },
      ],
    },
    {
      day: "Sexta-feira",
      dayShort: "Sex",
      theme: "Cita\u00e7\u00e3o final",
      slots: [
        {
          platform: "instagram",
          type: "Post Feed",
          visual: {
            bg: "#3d3630", text: "#c9b896", accent: "#f7f5f0", format: "square",
            title: "Perguntar,\nmesmo tarde,\n\u00e9 o primeiro gesto\nde se escolher.",
            body: "",
            footer: "O Espelho da Ilus\u00e3o ~ seteveus.space",
          },
          caption: "\"Perguntar, mesmo tarde, \u00e9 o primeiro gesto de se escolher.\"\n\n\u2014 O Espelho da Ilus\u00e3o\n\n#OsSeteV\u00e9us #EspelhoDaIlus\u00e3o #DesenvolvimentoPessoal",
        },
        {
          platform: "whatsapp",
          type: "Status",
          visual: {
            bg: "#3d3630", text: "#c9b896", accent: "#f7f5f0", format: "vertical",
            title: "Perguntar,\nmesmo tarde,\n\u00e9 o primeiro gesto\nde se escolher.",
            body: "",
            footer: "O Espelho da Ilus\u00e3o",
          },
        },
      ],
    },
    {
      day: "S\u00e1bado",
      dayShort: "S\u00e1b",
      theme: "Engagement",
      slots: [{ platform: "ambos", type: "Responder DMs e mensagens", notes: "Responder todas as DMs. Comentar em posts de seguidoras. Agradecer partilhas." }],
    },
    {
      day: "Domingo",
      dayShort: "Dom",
      theme: "Prepara\u00e7\u00e3o",
      slots: [{ platform: "ambos", type: "Planear semana 3", notes: "Rever m\u00e9tricas. Preparar conte\u00fado do N\u00f3 da Heran\u00e7a e Comunidade." }],
    },
  ],
};

// ─── SEMANA 3: NO DA HERANCA + COMUNIDADE ────────────────────────────────────

const week3: WeekPlan = {
  weekNumber: 3,
  title: "N\u00f3 da Heran\u00e7a + Comunidade",
  subtitle: "Apresentar a segunda colec\u00e7\u00e3o e a comunidade Ecos",
  days: [
    {
      day: "Segunda-feira",
      dayShort: "Seg",
      theme: "N\u00f3 da Heran\u00e7a",
      slots: [
        {
          platform: "instagram",
          type: "Post Feed",
          visual: {
            bg: "#ebe7df", text: "#3d3630", accent: "#c9b896", format: "square",
            title: "A m\u00e3e sempre viu.\nEsperou anos.",
            body: "Agora que Sara acordou,\nHelena tem algo\npara lhe dizer.",
            footer: "O N\u00f3 da Heran\u00e7a ~ seteveus.space",
            highlight: "Colec\u00e7\u00e3o N\u00f3s",
          },
          caption: "Os Espelhos olham para dentro.\nOs N\u00f3s olham para a rela\u00e7\u00e3o.\n\nO N\u00f3 da Heran\u00e7a \u00e9 a hist\u00f3ria de Sara e Helena \u2014 m\u00e3e e filha \u2014 é o sil\u00eancio herdado entre elas.\n\nS\u00f3 se desbloqueia ao completar o Espelho da Ilus\u00e3o.\n\n#OsSeteV\u00e9us #N\u00f3DaHeran\u00e7a #Fic\u00e7\u00e3oRelacional",
        },
      ],
    },
    {
      day: "Ter\u00e7a-feira",
      dayShort: "Ter",
      theme: "Comunidade Ecos",
      slots: [
        {
          platform: "instagram",
          type: "Post Feed",
          visual: {
            bg: "#7a8c6e", text: "#f7f5f0", accent: "#ebe7df", format: "square",
            title: "Onde as vozes\nse encontram.",
            body: "Ecos. Mar\u00e9. C\u00edrculo. Fogueira.\n\nQuatro salas.\nTudo an\u00f3nimo.\nTudo impermanente.",
            footer: "Comunidade Ecos ~ seteveus.space",
            highlight: "Comunidade",
          },
          caption: "A comunidade Ecos \u00e9 o espa\u00e7o onde as vozes se encontram.\n\nQuatro salas:\nEcos \u2014 reflex\u00f5es an\u00f3nimas\nMar\u00e9 \u2014 consci\u00eancia colectiva\nC\u00edrculo \u2014 espelho partilhado\nFogueira \u2014 contempla\u00e7\u00e3o silenciosa\n\nTudo an\u00f3nimo. Tudo impermanente.\nInclu\u00edda com qualquer experi\u00eancia de leitura.\n\n#OsSeteV\u00e9us #ComunidadeEcos",
        },
      ],
    },
    {
      day: "Quarta-feira",
      dayShort: "Qua",
      theme: "N\u00f3 da Heran\u00e7a",
      slots: [
        {
          platform: "instagram",
          type: "Story",
          visual: {
            bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", format: "vertical",
            title: "O N\u00f3\nda Heran\u00e7a",
            body: "O que se passa entre\nm\u00e3e e filha quando\no v\u00e9u cai.\n\nSara e Helena.\nO sil\u00eancio herdado.",
            footer: "$8 USD ~ seteveus.space",
            highlight: "Novo",
          },
        },
        {
          platform: "whatsapp",
          type: "Status",
          visual: {
            bg: "#c9a87c", text: "#3d3630", accent: "#c9b896", format: "vertical",
            title: "O Nó da Herança",
            body: "Sara e Helena. Mãe e filha.\nQuando o véu cai entre duas pessoas.",
            footer: "seteveus.space/colecção-nos",
          },
        },
      ],
    },
    {
      day: "Quinta-feira",
      dayShort: "Qui",
      theme: "Testemunho",
      slots: [
        {
          platform: "instagram",
          type: "Post Feed",
          visual: {
            bg: "#ebe7df", text: "#4a433b", accent: "#c9b896", format: "square",
            title: "\"N\u00e3o \u00e9 um livro que\nse l\u00ea \u2014 \u00e9 um livro\nque se vive.\"",
            body: "",
            footer: "Carla S., Lisboa",
          },
          caption: "\"N\u00e3o \u00e9 um livro que se l\u00ea \u2014 \u00e9 um livro que se vive.\"\n\u2014 Carla S., Lisboa\n\n#OsSeteV\u00e9us #Testemunho",
        },
      ],
    },
    {
      day: "Sexta-feira",
      dayShort: "Sex",
      theme: "Recursos gratuitos",
      slots: [
        {
          platform: "ambos",
          type: "Status",
          visual: {
            bg: "#f7f5f0", text: "#3d3630", accent: "#c9b896", format: "vertical",
            title: "Recursos gratuitos",
            body: "Teste de autoconhecimento\nDiário de 7 dias\nArtigos e mini-guia",
            footer: "seteveus.space/recursos",
          },
        },
      ],
    },
    {
      day: "S\u00e1bado",
      dayShort: "S\u00e1b",
      theme: "Engagement",
      slots: [{ platform: "ambos", type: "Responder DMs e mensagens", notes: "Engagement habitual." }],
    },
    {
      day: "Domingo",
      dayShort: "Dom",
      theme: "Prepara\u00e7\u00e3o",
      slots: [{ platform: "ambos", type: "Planear semana 4", notes: "Preparar teasers do Espelho do Medo." }],
    },
  ],
};

// ─── SEMANA 4: TEASER MEDO + REFORCO ────────────────────────────────────────

const week4: WeekPlan = {
  weekNumber: 4,
  title: "Teaser Espelho do Medo + Refor\u00e7o",
  subtitle: "Criar antecipa\u00e7\u00e3o para Mar\u00e7o + refor\u00e7ar produtos actuais",
  days: [
    {
      day: "Segunda-feira",
      dayShort: "Seg",
      theme: "Teaser do Medo",
      slots: [
        {
          platform: "instagram",
          type: "Post Feed",
          visual: {
            bg: "#8b9b8e", text: "#f7f5f0", accent: "#ebe7df", format: "square",
            title: "Sabes o que queres.\nMas o medo decide\nantes de ti.",
            body: "O segundo espelho\nest\u00e1 quase a chegar.",
            footer: "O Espelho do Medo ~ Mar\u00e7o 2026",
            highlight: "Mar\u00e7o 2026",
          },
          caption: "O segundo espelho est\u00e1 quase a chegar.\n\n\"Sabes o que queres. Mas o medo decide antes de ti.\"\n\nO Espelho do Medo \u2014 Mar\u00e7o 2026.\n\n#OsSeteV\u00e9us #EspelhoDoMedo #EmBreve",
        },
        {
          platform: "whatsapp",
          type: "Status",
          visual: {
            bg: "#8b9b8e", text: "#f7f5f0", accent: "#ebe7df", format: "vertical",
            title: "O primeiro passo\nn\u00e3o precisa\nde ser grande.",
            body: "Precisa apenas\nde ser teu.",
            footer: "O Espelho do Medo ~ Mar\u00e7o 2026",
          },
        },
        {
          platform: "whatsapp",
          type: "Status",
          visual: {
            bg: "#8b9b8e", text: "#f7f5f0", accent: "#c9b896", format: "vertical",
            title: "O segundo espelho\nestá quase a chegar.",
            body: "Sabes o que queres.\nMas o medo decide antes de ti.",
            footer: "seteveus.space/experiencias",
          },
        },
      ],
    },
    {
      day: "Ter\u00e7a-feira",
      dayShort: "Ter",
      theme: "Livro f\u00edsico",
      slots: [
        {
          platform: "instagram",
          type: "Story",
          visual: {
            bg: "#ebe7df", text: "#3d3630", accent: "#c9b896", format: "vertical",
            title: "Os 7 V\u00e9us\ndo Despertar",
            body: "O ensaio filos\u00f3fico\nque deu origem a tudo.\n\n$23 USD / 1.495 MZN\nEnvio para Mo\u00e7ambique\ne outros pa\u00edses.",
            footer: "Encomendar via WhatsApp",
            highlight: "232 p\u00e1ginas",
          },
        },
      ],
    },
    {
      day: "Quarta-feira",
      dayShort: "Qua",
      theme: "Livro f\u00edsico \u2192 digital",
      slots: [
        {
          platform: "instagram",
          type: "Post Feed",
          visual: {
            bg: "#c9b896", text: "#3d3630", accent: "#f7f5f0", format: "square",
            title: "Do livro f\u00edsico\n\u00e0 experi\u00eancia digital.",
            body: "Se j\u00e1 tens\nOs 7 V\u00e9us do Despertar,\nregista o teu interesse\ne recebe o c\u00f3digo de acesso\n\u00e0 plataforma completa.",
            footer: "seteveus.space/pedir-código",
            highlight: "Gratuito",
          },
          caption: "Tens o livro f\u00edsico? Regista o teu interesse e recebe acesso gratuito \u00e0 plataforma digital.\n\n#OsSeteV\u00e9us #AcessoDigital",
        },
        {
          platform: "whatsapp",
          type: "Status",
          visual: {
            bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", format: "vertical",
            title: "Livro físico?",
            body: "Acesso digital gratuito.\nPlataforma completamente nova.",
            footer: "seteveus.space/pedir-código",
          },
        },
      ],
    },
    {
      day: "Quinta-feira",
      dayShort: "Qui",
      theme: "Cita\u00e7\u00e3o",
      slots: [
        {
          platform: "instagram",
          type: "Post Feed",
          visual: {
            bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", format: "square",
            title: "Uma mulher descobre,\nno meio de uma manh\u00e3\nigual a todas as outras,\nque construiu uma vida\ninteira sem nunca ter\nperguntado o que queria.",
            body: "",
            footer: "O Espelho da Ilus\u00e3o ~ seteveus.space",
          },
          caption: "\"Uma mulher descobre, no meio de uma manh\u00e3 igual a todas as outras, que construiu uma vida inteira sem nunca ter perguntado o que queria.\"\n\n\u2014 O Espelho da Ilus\u00e3o, Pref\u00e1cio\n\n#OsSeteV\u00e9us #EspelhoDaIlus\u00e3o",
        },
      ],
    },
    {
      day: "Sexta-feira",
      dayShort: "Sex",
      theme: "Quiz gratuito",
      slots: [
        {
          platform: "ambos",
          type: "Status + Post",
          visual: {
            bg: "#f7f5f0", text: "#3d3630", accent: "#c9b896", format: "square",
            title: "Descobre qual v\u00e9u\nte esconde.",
            body: "Teste gratuito.\n3 minutos.\n7 perguntas.\nO resultado pode\nsurpreender-te.",
            footer: "seteveus.space/recursos/teste",
            highlight: "Gratuito",
          },
          caption: "Qual v\u00e9u te esconde?\n\nTeste gratuito de autoconhecimento.\n3 minutos. 7 perguntas.\nO resultado pode surpreender-te.\n\n#OsSeteV\u00e9us #TesteGratuito #Autoconhecimento",
        },
      ],
    },
    {
      day: "S\u00e1bado",
      dayShort: "S\u00e1b",
      theme: "Engagement",
      slots: [{ platform: "ambos", type: "Responder DMs e mensagens", notes: "Engagement habitual." }],
    },
    {
      day: "Domingo",
      dayShort: "Dom",
      theme: "Reciclar",
      slots: [{ platform: "ambos", type: "Reciclar semana 1", notes: "Voltar ao calend\u00e1rio da semana 1 com varia\u00e7\u00f5es. Manter o ritmo." }],
    },
  ],
};

// ─── SEMANA 5: CAMPANHA REEL + CARROSSEL PROFISSIONAL ─────────────────────────

const week5: WeekPlan = {
  weekNumber: 5,
  title: "Campanha visual: Reels + Carrosséis",
  subtitle: "Conteúdo visual forte para crescer alcance e engagement",
  days: [
    {
      day: "Segunda-feira",
      dayShort: "Seg",
      theme: "Reel — O momento do despertar",
      slots: [
        {
          platform: "instagram",
          type: "Reel (micro-video 15-30s)",
          visual: {
            bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", format: "vertical",
            title: "Aquele momento\nem que percebes\nque a vida que tens\nnão foi escolhida\npor ti.",
            body: "",
            footer: "O Espelho da Ilusão ~ seteveus.space",
          },
          notes: "ROTEIRO DO REEL:\n\nCena 1 (0-3s): Ecrã preto. Texto aparece letra a letra: \"Aquele momento...\"\nCena 2 (3-8s): Print da página seteveus.space/experiencias no telemóvel, scroll lento\nCena 3 (8-15s): Print do leitor aberto (capítulo 1), zoom suave\nCena 4 (15-20s): Print da respiração guiada entre capítulos\nCena 5 (20-25s): Texto: \"Não é um livro. É uma experiência.\"\nCena 6 (25-30s): Logo + seteveus.space\n\nMÚSICA: Ambiente calmo, piano suave\nTRANSIÇÕES: Fade lento entre cenas\n\nPRINTS NECESSÁRIOS:\n- seteveus.space/experiencias (página de compra)\n- seteveus.space/membro/leitura/1 (capítulo aberto)\n- seteveus.space/membro/leitura (lista de capítulos com respiração)",
          caption: "Aquele momento em que percebes que a vida que tens não foi escolhida por ti.\n\nO Espelho da Ilusão é uma experiência de leitura imersiva:\n7 capítulos + respiração guiada + diário de reflexão\n\n#OsSeteVeus #Reel #Autoconhecimento #EspelhoDaIlusão #FicçãoPsicológica",
        },
        {
          platform: "whatsapp",
          type: "Status (video)",
          visual: {
            bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", format: "vertical",
            title: "Novo reel\nno Instagram.",
            body: "Uma experiência de leitura\nque muda a forma\ncomo te vês.",
            footer: "@os7veus",
          },
        },
      ],
    },
    {
      day: "Terça-feira",
      dayShort: "Ter",
      theme: "Carrossel — 7 sinais de que vives no piloto automático",
      slots: [
        {
          platform: "instagram",
          type: "Carrossel (7 slides)",
          visual: {
            bg: "#f7f5f0", text: "#3d3630", accent: "#c9b896", format: "square",
            title: "7 sinais de que vives\nno piloto automático",
            body: "",
            footer: "Swipe ~",
          },
          notes: "SLIDES DO CARROSSEL:\n\nSlide 1 (capa): Fundo #f7f5f0, texto #3d3630\n\"7 sinais de que vives no piloto automático\"\nSubtitulo: \"Quantos reconheces?\"\n\nSlide 2: Fundo #ebe7df\n\"1. Fazes as mesmas coisas todos os dias sem questionar porque.\"\n\nSlide 3: Fundo #f7f5f0\n\"2. Quando alguém te pergunta o que queres, não tens resposta.\"\n\nSlide 4: Fundo #ebe7df\n\"3. Sentes que a vida passa mas não estás realmente presente.\"\n\nSlide 5: Fundo #f7f5f0\n\"4. As tuas decisões são baseadas no que os outros esperam de ti.\"\n\nSlide 6: Fundo #ebe7df\n\"5. Há algo dentro de ti que quer mais, mas não sabes o que.\"\n\nSlide 7: Fundo #f7f5f0\n\"6. Tens medo de parar porque não sabes o que vais encontrar.\"\n\nSlide 8 (CTA): Fundo #3d3630, texto #c9b896\n\"7. Leste isto tudo e reconheceste-te.\"\n\"Reconheces-te? Ha mais para ti:\"\n\"seteveus.space/recursos/teste\"\n\nFONTE: Serif elegante para títulos, sans-serif para corpo\nTODOS os slides devem ter o logo discreto no canto inferior",
          caption: "7 sinais de que vives no piloto automático.\n\nQuantos reconheces? Conta nos comentários.\n\nSe reconheceste mais de 3, o teste gratuito pode revelar algo importante.\n\n#OsSeteVeus #PilotoAutomatico #Autoconhecimento #Despertar #Carrossel",
        },
        {
          platform: "whatsapp",
          type: "Status",
          visual: {
            bg: "#8b9b8e", text: "#f7f5f0", accent: "#c9b896", format: "vertical",
            title: "7 sinais de que vives\nno piloto automático.",
            body: "Quantos reconheces?",
            footer: "seteveus.space/recursos/teste",
          },
        },
      ],
    },
    {
      day: "Quarta-feira",
      dayShort: "Qua",
      theme: "Post visual — Citação com imagem",
      slots: [
        {
          platform: "instagram",
          type: "Post Feed (imagem com citação)",
          visual: {
            bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", format: "square",
            title: "A ilusão mais perigosa\né acreditar que\nescolheste\nquando apenas\nrepetiste.",
            body: "",
            footer: "O Espelho da Ilusão",
            highlight: "~ seteveus.space",
          },
          caption: "\"A ilusão mais perigosa é acreditar que escolheste quando apenas repetiste.\"\n\n-- O Espelho da Ilusão\n\nUma experiência de leitura que te convida a parar. E a perguntar.\n\n#OsSeteVeus #EspelhoDaIlusão #Citação #FicçãoPsicológica #Autoconhecimento",
        },
        {
          platform: "whatsapp",
          type: "Status",
          visual: {
            bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", format: "vertical",
            title: "A ilusão mais perigosa\né acreditar que\nescolheste\nquando apenas\nrepetiste.",
            body: "",
            footer: "O Espelho da Ilusão",
          },
        },
      ],
    },
    {
      day: "Quinta-feira",
      dayShort: "Qui",
      theme: "Reel — Por dentro da plataforma",
      slots: [
        {
          platform: "instagram",
          type: "Reel (screen recording 20-30s)",
          visual: {
            bg: "#f7f5f0", text: "#3d3630", accent: "#7a8c6e", format: "vertical",
            title: "Por dentro\nda experiência",
            body: "Leitura integrada\nRespiração guiada\nDiário pessoal\nComunidade anónima",
            footer: "seteveus.space",
          },
          notes: "ROTEIRO DO REEL (screen recording do telemóvel):\n\nGravar screen recording no telemóvel mostrando:\n1. (0-5s) Abrir seteveus.space/membro — dashboard com progresso\n2. (5-10s) Clicar em \"Continuar leitura\" — abre capítulo\n3. (10-15s) Scroll pelo texto do capítulo — mostrar tipografia bonita\n4. (15-20s) Chegar a pausa de reflexão — mostrar a caixa do diário\n5. (20-25s) Mostrar respiração guiada entre capítulos\n6. (25-30s) Final: texto overlay \"Não é um livro. É uma experiência.\"\n\nMÚSICA: Lo-fi calmo ou piano ambiente\nTEXTO OVERLAY: Adicionar legendas em cada transição\n\nPRINTS/GRAVAÇÃO NECESSÁRIA:\n- Screen recording completo no telemóvel (Safari ou Chrome)\n- Começar em seteveus.space/membro\n- Navegar até um capítulo e fazer scroll",
          caption: "Por dentro da experiência Os Sete Véus.\n\nNão é um livro que se lê. É uma experiência que se vive.\n\nLeitura integrada. Respiração guiada. Diário pessoal. Comunidade anónima.\n\n#OsSeteVeus #PlataformaDigital #LeituraImersiva #Reel #Bookstagram",
        },
      ],
    },
    {
      day: "Sexta-feira",
      dayShort: "Sex",
      theme: "Carrossel — O que é a colecção Espelhos",
      slots: [
        {
          platform: "instagram",
          type: "Carrossel (5 slides)",
          visual: {
            bg: "#ebe7df", text: "#3d3630", accent: "#c9b896", format: "square",
            title: "O que é a colecção\nEspelhos?",
            body: "",
            footer: "Swipe para descobrir ~",
          },
          notes: "SLIDES DO CARROSSEL:\n\nSlide 1 (capa): Fundo #ebe7df\n\"O que é a colecção Espelhos?\"\nImagem: Print da página seteveus.space/experiencias\n\nSlide 2: Fundo #f7f5f0\n\"7 experiências de leitura imersiva.\nCada uma revela um véu diferente.\nIlusão. Medo. Culpa. Identidade.\nControlo. Desejo. Separação.\"\n\nSlide 3: Fundo #ebe7df\n\"Cada experiência inclui:\n7 capítulos de ficção\nRespiração guiada\nDiário de reflexão\nO teu Espelho pessoal\"\nImagem: Print do leitor com capítulos\n\nSlide 4: Fundo #f7f5f0\n\"Disponível agora:\nO Espelho da Ilusão — $19 USD\n\nEm breve:\nO Espelho do Medo — Março 2026\"\nImagem: Print da página de compra\n\nSlide 5 (CTA): Fundo #3d3630, texto #c9b896\n\"Reconheces-te nalgum deles?\nComeca pelo teste gratuito.\nseteveus.space/recursos/teste\"",
          caption: "A coleccao Espelhos sao 7 experiencias de leitura imersiva.\n\nCada uma ilumina algo diferente em ti. Algo que ja sabes mas ainda nao disseste.\n\nDisponível agora: O Espelho da Ilusão\nEm breve: O Espelho do Medo (Março 2026)\n\nComeça pelo teste gratuito.\n\n#OsSeteVeus #ColeccaoEspelhos #Autoconhecimento #LeituraImersiva",
        },
        {
          platform: "whatsapp",
          type: "Status",
          visual: {
            bg: "#ebe7df", text: "#3d3630", accent: "#c9b896", format: "vertical",
            title: "7 véus.\n7 espelhos.\n7 experiências.",
            body: "Reconheces-te? Comeca por aqui.",
            footer: "seteveus.space/recursos/teste",
          },
        },
      ],
    },
    {
      day: "Sábado",
      dayShort: "Sáb",
      theme: "Engagement + Story interactivo",
      slots: [
        {
          platform: "instagram",
          type: "Story interactivo (enquete)",
          visual: {
            bg: "#f7f5f0", text: "#3d3630", accent: "#c9b896", format: "vertical",
            title: "Qual destes\nte descreve melhor?",
            body: "A) Faço tudo pelos outros e esqueço-me de mim\nB) Tenho medo de mudar\nC) Não sei quem sou sem a máscara\nD) Controlo tudo para não sofrer",
            footer: "Responde no poll",
          },
          notes: "Criar Story com a funcionalidade de Poll do Instagram.\nOpções:\nA) Faço tudo pelos outros\nB) Tenho medo de mudar\nC) Não sei quem sou\nD) Controlo tudo\n\nDepois do resultado, publicar segundo Story com:\n\"Cada resposta corresponde a um Espelho.\nDescobre o teu: seteveus.space/recursos/teste\"",
          caption: "Reconheces-te? Responde no story e descobre qual Espelho combina contigo.",
        },
        {
          platform: "ambos",
          type: "Responder DMs e mensagens",
          notes: "Responder TODAS as DMs. Comentar em 10 posts de seguidoras. Agradecer quem partilhou.",
        },
      ],
    },
    {
      day: "Domingo",
      dayShort: "Dom",
      theme: "Preparação + conteúdo extra",
      slots: [
        {
          platform: "instagram",
          type: "Story (bastidores)",
          visual: {
            bg: "#ebe7df", text: "#3d3630", accent: "#c9b896", format: "vertical",
            title: "A escrever\no próximo espelho.",
            body: "O Espelho do Medo\nchega em Março.",
            footer: "~ Vivianne",
          },
          notes: "Story informal: foto do espaço de escrita, computador, caderno, chá.\nTexto overlay: \"A escrever o próximo espelho. O Medo chega em Março.\"\nSticker: countdown para Março 2026",
        },
        {
          platform: "ambos",
          type: "Planear semana 6",
          notes: "Rever métricas da semana. Anotar quais reels/carrosséis tiveram melhor performance. Preparar conteúdo da semana 6.",
        },
      ],
    },
  ],
};

// ─── SEMANA 6: PROFUNDIDADE + TESTEMUNHOS + CAMPANHA NON ─────────────────────

const week6: WeekPlan = {
  weekNumber: 6,
  title: "Profundidade + Testemunhos + Nó da Herança",
  subtitle: "Conteúdo emocional profundo com provas sociais e campanha do Nó",
  days: [
    {
      day: "Segunda-feira",
      dayShort: "Seg",
      theme: "Reel — A história de Sara (teaser)",
      slots: [
        {
          platform: "instagram",
          type: "Reel (texto animado 20s)",
          visual: {
            bg: "#ebe7df", text: "#3d3630", accent: "#c9b896", format: "vertical",
            title: "Sara acordou\nnuma manhã igual\na todas as outras.",
            body: "Mas desta vez\nperguntou.",
            footer: "O Espelho da Ilusão",
          },
          notes: "ROTEIRO DO REEL (texto animado sobre fundo):\n\nFundo: Cores quentes, #ebe7df ou gradiente suave\n\n(0-3s) \"Sara acordou numa manhã igual a todas as outras.\"\n(3-6s) \"Fez café. Vestiu-se. Saiu.\"\n(6-9s) \"Mas desta vez...\"\n(9-12s) \"...perguntou.\"\n(12-15s) Pausa. Ecrã quase vazio.\n(15-18s) \"Quando foi que escolhi esta vida?\"\n(18-20s) Logo + \"O Espelho da Ilusão\" + seteveus.space\n\nMÚSICA: Piano suave, algo melancólico mas esperançoso\nFONTE: Serif elegante, letras grandes centralizadas\nTRANSIÇÕES: Fade lento, cada frase aparece sozinha",
          caption: "Sara acordou numa manhã igual a todas as outras. Mas desta vez, perguntou.\n\n\"Quando foi que escolhi esta vida?\"\n\nO Espelho da Ilusão. Uma experiência de leitura imersiva.\n\n#OsSeteVeus #EspelhoDaIlusão #Reel #FicçãoPsicológica #Sara",
        },
        {
          platform: "whatsapp",
          type: "Status",
          visual: {
            bg: "#ebe7df", text: "#3d3630", accent: "#c9b896", format: "vertical",
            title: "Sara acordou\ne perguntou.",
            body: "Novo reel no Instagram.\nUma história que muda tudo.",
            footer: "@os7veus",
          },
        },
      ],
    },
    {
      day: "Terça-feira",
      dayShort: "Ter",
      theme: "Carrossel — Espelhos vs Nós (explicar as duas colecções)",
      slots: [
        {
          platform: "instagram",
          type: "Carrossel (6 slides)",
          visual: {
            bg: "#f7f5f0", text: "#3d3630", accent: "#c9b896", format: "square",
            title: "Espelhos e Nós.\nDuas colecções.\nUma jornada.",
            body: "",
            footer: "Swipe ~",
          },
          notes: "SLIDES DO CARROSSEL:\n\nSlide 1 (capa): Fundo #f7f5f0\n\"Espelhos e Nós. Duas colecções. Uma jornada.\"\n\nSlide 2: Fundo #ebe7df\n\"Os Espelhos olham para dentro.\nSão 7 experiências de ficção.\nCada uma revela um véu.\nLês. Respiras. Escreves. E vês-te.\"\nImagem: Print da página /experiências\n\nSlide 3: Fundo #f7f5f0\n\"Os Nós olham para a relação.\nO que acontece entre duas pessoas\nquando o véu cai.\"\nImagem: Print da página /colecção-nos\n\nSlide 4: Fundo #ebe7df\n\"O Nó só se desbloqueia\não completar o Espelho.\nNão é upsell.\nÉ continuação emocional.\"\n\nSlide 5: Fundo #f7f5f0\nTabela visual:\n\"Espelho da Ilusão → Nó da Herança\n(Sara sozinha) → (Sara + Helena, mãe)\nO despertar → O silêncio herdado\"\n\nSlide 6 (CTA): Fundo #3d3630, texto #c9b896\n\"Começa pelo Espelho.\nO Nó espera por ti.\nseteveus.space/experiencias\"",
          caption: "Os Espelhos olham para dentro. Os Nós olham para a relação.\n\nDuas colecções. Uma jornada.\n\nO Nó da Herança é a história de Sara e Helena — mãe e filha. Só se desbloqueia ao completar o Espelho da Ilusão.\n\n#OsSeteVeus #Espelhos #Nos #ColecçãoCompleta #Autoconhecimento",
        },
      ],
    },
    {
      day: "Quarta-feira",
      dayShort: "Qua",
      theme: "Post visual — Testemunho real",
      slots: [
        {
          platform: "instagram",
          type: "Post Feed (testemunho com design)",
          visual: {
            bg: "#ebe7df", text: "#4a433b", accent: "#c9b896", format: "square",
            title: "\"Chorei no capítulo 5.\nNão de tristeza.\nDe reconhecimento.\"",
            body: "",
            footer: "Ana M., Maputo",
          },
          notes: "DESIGN: Fundo texturizado cor creme. Citação centrada em fonte serif grande. Nome e cidade em fonte menor abaixo. Logo discreto no canto inferior direito.\n\nSe não tiver testemunho real, usar variação do existente ou pedir a leitoras.",
          caption: "\"Chorei no capítulo 5. Não de tristeza. De reconhecimento.\"\n-- Ana M., Maputo\n\nO Espelho da Ilusão.\n\n#OsSeteVeus #Testemunho #EspelhoDaIlusão #Maputo",
        },
        {
          platform: "whatsapp",
          type: "Status",
          visual: {
            bg: "#3d3630", text: "#c9b896", accent: "#c9b896", format: "vertical",
            title: "Chorei no capítulo 5.\nNão de tristeza.\nDe reconhecimento.",
            body: "O Espelho da Ilusão.",
            footer: "seteveus.space/experiencias",
          },
        },
      ],
    },
    {
      day: "Quinta-feira",
      dayShort: "Qui",
      theme: "Reel — Nó da Herança (mãe e filha)",
      slots: [
        {
          platform: "instagram",
          type: "Reel (texto emocional 20s)",
          visual: {
            bg: "#c9b896", text: "#3d3630", accent: "#f7f5f0", format: "vertical",
            title: "A mãe sempre viu.\nEsperou anos.",
            body: "Agora que Sara acordou,\nHelena tem algo\npara lhe dizer.",
            footer: "O Nó da Herança",
          },
          notes: "ROTEIRO DO REEL:\n\n(0-3s) Fundo quente, dourado. \"A mãe sempre viu.\"\n(3-6s) \"Esperou anos.\"\n(6-9s) Pausa dramática. Ecrã quase vazio.\n(9-12s) \"Agora que Sara acordou...\"\n(12-16s) \"...Helena tem algo para lhe dizer.\"\n(16-18s) \"O Nó da Herança.\"\n(18-20s) \"A continuação emocional do Espelho da Ilusão.\"\n+ seteveus.space/colecção-nos\n\nMÚSICA: Algo emocional mas contido. Violino suave ou piano.\nFONTE: Serif grande, centralizadas",
          caption: "A mãe sempre viu. Esperou anos.\n\nO Nó da Herança é a história de Sara e Helena — mãe e filha — e o silêncio herdado entre elas.\n\nSó se desbloqueia ao completar o Espelho da Ilusão.\n\n#OsSeteVeus #NoDaHerança #Reel #MãeEFilha",
        },
      ],
    },
    {
      day: "Sexta-feira",
      dayShort: "Sex",
      theme: "Carrossel — Preços e packs",
      slots: [
        {
          platform: "instagram",
          type: "Carrossel (5 slides)",
          visual: {
            bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", format: "square",
            title: "Quanto custa\nescolher-te?",
            body: "",
            footer: "Swipe para ver preços ~",
          },
          notes: "SLIDES DO CARROSSEL:\n\nSlide 1 (capa): Fundo escuro #3d3630, texto dourado #c9b896\n\"Quanto custa escolher-te?\"\n\nSlide 2: Fundo #f7f5f0\n\"Espelho da Ilusão\n$19 USD / 1.200 MZN / R$119 / 27EUR\nAcesso vitalício\n7 capítulos + respiração + diário + espelho pessoal\"\n\nSlide 3: Fundo #ebe7df\n\"Nó da Herança\n$8 USD / 500 MZN / R$49 / 11EUR\nSó desbloqueia ao completar o Espelho\nA continuação emocional\"\n\nSlide 4: Fundo #f7f5f0\n\"Pack 3 Espelhos: $69 (18% desconto)\n→ 3 Nós incluídos!\n\nJornada Completa: $149 (27% desconto)\n→ Todos os Nós incluídos!\"\n\nSlide 5 (CTA): Fundo #3d3630, texto #c9b896\n\"Começa pelo teste gratuito.\nOu pelo Espelho da Ilusão.\nPayPal, M-Pesa ou Millenium BIM.\nseteveus.space/comprar\"",
          caption: "Quanto custa escolher-te?\n\nEspelho da Ilusão: $19 USD (1.200 MZN)\nNó da Herança: $8 USD (500 MZN)\nPack 3 Espelhos: $69 (Nós incluídos!)\nJornada Completa: $149\n\nAcesso vitalício. Sem subscrições.\nPayPal, M-Pesa ou Millenium BIM.\n\n#OsSeteVeus #Preços #Autoconhecimento",
        },
        {
          platform: "whatsapp",
          type: "Status",
          visual: {
            bg: "#3d3630", text: "#c9b896", accent: "#f7f5f0", format: "vertical",
            title: "Espelho da Ilusão\n$19 USD\n1.200 MZN",
            body: "Acesso vitalício.\nSem subscrições.",
            footer: "seteveus.space/comprar",
          },
        },
      ],
    },
    {
      day: "Sábado",
      dayShort: "Sáb",
      theme: "Story bastidores + engagement",
      slots: [
        {
          platform: "instagram",
          type: "Story (3 frames)",
          visual: {
            bg: "#f7f5f0", text: "#3d3630", accent: "#c9b896", format: "vertical",
            title: "Sabias que\na comunidade Ecos\né completamente\nanónima?",
            body: "Quatro salas. Tudo impermanente.\nIncluída com qualquer experiência.",
            footer: "seteveus.space/comunidade",
          },
          notes: "Story 1: \"Sabias que a comunidade Ecos é completamente anónima?\"\nStory 2: Print de seteveus.space/comunidade\nStory 3: \"Incluída com qualquer experiência de leitura. seteveus.space\"",
        },
        {
          platform: "ambos",
          type: "Responder DMs e mensagens",
          notes: "Engagement profundo: responder DMs, agradecer partilhas, comentar em posts de seguidoras.",
        },
      ],
    },
    {
      day: "Domingo",
      dayShort: "Dom",
      theme: "Reflexão + preparação",
      slots: [
        {
          platform: "instagram",
          type: "Post Feed (citação dominical)",
          visual: {
            bg: "#f7f5f0", text: "#3d3630", accent: "#7a8c6e", format: "square",
            title: "Não precisas\nde estar pronta.\nPrecisas apenas\nde estar disposta.",
            body: "",
            footer: "Os Sete Véus ~ seteveus.space",
          },
          caption: "Não precisas de estar pronta. Precisas apenas de estar disposta.\n\n#OsSeteVeus #Reflexão #Domingo #Autoconhecimento",
        },
        {
          platform: "ambos",
          type: "Planear semana 7",
          notes: "Rever métricas. Preparar conteúdo da campanha Medo. Gravar reels se possível.",
        },
      ],
    },
  ],
};

// ─── SEMANA 7: CAMPANHA ESPELHO DO MEDO (LANCAMENTO MARCO) ──────────────────

const week7: WeekPlan = {
  weekNumber: 7,
  title: "Campanha: Espelho do Medo (Março 2026)",
  subtitle: "Lançamento do segundo espelho com campanha visual forte",
  days: [
    {
      day: "Segunda-feira",
      dayShort: "Seg",
      theme: "Reel — Teaser do Medo",
      slots: [
        {
          platform: "instagram",
          type: "Reel (teaser cinemático 15s)",
          visual: {
            bg: "#8b9b8e", text: "#f7f5f0", accent: "#ebe7df", format: "vertical",
            title: "Sabes o que queres.\nMas o medo\ndecide antes de ti.",
            body: "",
            footer: "O Espelho do Medo ~ Março 2026",
            highlight: "Em breve",
          },
          notes: "ROTEIRO DO REEL:\n\n(0-3s) Ecrã escuro. Texto branco aparece: \"Sabes o que queres.\"\n(3-5s) \"Mas o medo...\"\n(5-8s) \"...decide antes de ti.\"\n(8-10s) Pausa. Cor muda para #8b9b8e (verde-acinzentado do véu do Medo)\n(10-13s) \"O Espelho do Medo.\"\n(13-15s) \"Março 2026. seteveus.space\"\n\nMÚSICA: Tensão subtil que resolve em calma\nEFEITO: Texto aparece com glitch suave ou typewriter",
          caption: "Sabes o que queres. Mas o medo decide antes de ti.\n\nO Espelho do Medo. O segundo espelho da colecção.\nMarço 2026.\n\n#OsSeteVeus #EspelhoDoMedo #EmBreve #Marco2026 #Reel",
        },
        {
          platform: "whatsapp",
          type: "Status",
          visual: {
            bg: "#8b9b8e", text: "#f7f5f0", accent: "#ebe7df", format: "vertical",
            title: "O segundo espelho\nestá quase a chegar.",
            body: "O Espelho do Medo.\nMarço 2026.",
            footer: "seteveus.space",
          },
        },
      ],
    },
    {
      day: "Terça-feira",
      dayShort: "Ter",
      theme: "Carrossel — Os 7 Espelhos explicados",
      slots: [
        {
          platform: "instagram",
          type: "Carrossel (9 slides)",
          visual: {
            bg: "#f7f5f0", text: "#3d3630", accent: "#c9b896", format: "square",
            title: "Os 7 Espelhos",
            body: "Cada Espelho revela um véu.\nQual é o teu?",
            footer: "Swipe ~",
          },
          notes: "SLIDES DO CARROSSEL (um Espelho por slide):\n\nSlide 1 (capa): Fundo #f7f5f0\n\"Os 7 Espelhos. Qual é o teu?\"\n\nSlide 2: Fundo #c9b896 (dourado)\n\"1. Ilusão\nA vida que tens foi escolhida por ti?\nEspelho da Ilusão — Disponível agora\"\n\nSlide 3: Fundo #8b9b8e (verde-cinza)\n\"2. Medo\nSabes o que queres mas o medo decide.\nEspelho do Medo — Março 2026\"\n\nSlide 4: Fundo #b39b7d (terra)\n\"3. Culpa\nA culpa que te prende a escolhas que não são tuas.\nEspelho da Culpa — Abril 2026\"\n\nSlide 5: Fundo #a09088 (rosa-terra)\n\"4. Identidade\nQuem és tu sem a máscara?\nEspelho da Identidade — Maio 2026\"\n\nSlide 6: Fundo #7a8c6e (verde-musgo)\n\"5. Controlo\nO controlo que isola quem mais amas.\nEspelho do Controlo — Junho 2026\"\n\nSlide 7: Fundo #b08d8d (rosa-antigo)\n\"6. Desejo\nO desejo que esvazia em vez de preencher.\nEspelho do Desejo — Julho 2026\"\n\nSlide 8: Fundo #8c9bab (azul-acinzentado)\n\"7. Separação\nA separação que reinventa o lar.\nEspelho da Separação — Agosto 2026\"\n\nSlide 9 (CTA): Fundo #3d3630, texto #c9b896\n\"Reconheces-te nalgum deles?\nTeste gratuito: seteveus.space/recursos/teste\"",
          caption: "Os 7 Espelhos:\n\n1. Ilusao — Disponivel agora\n2. Medo — Marco 2026\n3. Culpa — Abril 2026\n4. Identidade — Maio 2026\n5. Controlo — Junho 2026\n6. Desejo — Julho 2026\n7. Separacao — Agosto 2026\n\n#OsSeteVeus #Os7Espelhos #Autoconhecimento #Carrossel",
        },
      ],
    },
    {
      day: "Quarta-feira",
      dayShort: "Qua",
      theme: "Post visual — Citação do Medo",
      slots: [
        {
          platform: "instagram",
          type: "Post Feed (imagem com citação)",
          visual: {
            bg: "#8b9b8e", text: "#f7f5f0", accent: "#ebe7df", format: "square",
            title: "O primeiro passo\nnão precisa\nde ser grande.\n\nPrecisa apenas\nde ser teu.",
            body: "",
            footer: "O Espelho do Medo ~ seteveus.space",
          },
          caption: "\"O primeiro passo não precisa de ser grande. Precisa apenas de ser teu.\"\n\n-- O Espelho do Medo (Março 2026)\n\n#OsSeteVeus #EspelhoDoMedo #Citação #Medo #Coragem",
        },
        {
          platform: "whatsapp",
          type: "Status",
          visual: {
            bg: "#8b9b8e", text: "#f7f5f0", accent: "#ebe7df", format: "vertical",
            title: "O primeiro passo\nnão precisa\nde ser grande.",
            body: "Precisa apenas\nde ser teu.",
            footer: "O Espelho do Medo",
          },
        },
      ],
    },
    {
      day: "Quinta-feira",
      dayShort: "Qui",
      theme: "Reel — Antes e depois (leitora)",
      slots: [
        {
          platform: "instagram",
          type: "Reel (antes/depois emocional 20s)",
          visual: {
            bg: "#ebe7df", text: "#3d3630", accent: "#c9b896", format: "vertical",
            title: "Antes de ler:\n\"Está tudo bem.\"\n\nDepois de ler:\n\"Estava tudo\na fingir.\"",
            body: "",
            footer: "O Espelho da Ilusão",
          },
          notes: "ROTEIRO DO REEL:\n\n(0-5s) Split screen ou transição:\nLADO ESQUERDO / ANTES: Texto cinza sobre fundo claro\n\"Antes de ler o Espelho da Ilusão:\"\n\"Está tudo bem comigo.\"\n\n(5-10s) Transição dramática (zoom ou glitch)\n\n(10-15s) LADO DIREITO / DEPOIS: Texto dourado sobre fundo escuro\n\"Depois de ler:\"\n\"Estava tudo a fingir.\"\n\n(15-20s) Logo + \"O Espelho da Ilusão. Uma experiência que muda a forma como te vês.\"\nseteveus.space\n\nMÚSICA: Transição de algo casual para algo profundo\nEFEITO: Mudança de cor/humor dramática",
          caption: "Antes: \"Está tudo bem.\"\nDepois: \"Estava tudo a fingir.\"\n\nO Espelho da Ilusão muda a forma como te vês.\n\n#OsSeteVeus #AntesEDepois #Reel #Transformação #EspelhoDaIlusão",
        },
      ],
    },
    {
      day: "Sexta-feira",
      dayShort: "Sex",
      theme: "Post visual — Livro físico + digital",
      slots: [
        {
          platform: "instagram",
          type: "Post Feed (composicao visual)",
          visual: {
            bg: "#ebe7df", text: "#3d3630", accent: "#c9b896", format: "square",
            title: "Dois caminhos.\nA mesma jornada.",
            body: "Livro físico: Os 7 Véus do Despertar\n232 páginas — $23 USD\n\nPlataforma digital: Espelho da Ilusão\n7 capítulos imersivos — $19 USD\n\nLeitores do livro físico\ntem acesso digital gratuito.",
            footer: "seteveus.space/comprar",
            highlight: "Físico + Digital",
          },
          notes: "DESIGN: Composição com foto do livro físico ao lado de print do telemóvel com a plataforma. Se não tiver foto profissional, usar mockup.\n\nFOTO NECESSÁRIA: Livro físico numa mesa bonita (ou mockup)",
          caption: "Dois caminhos. A mesma jornada.\n\nLivro físico: Os 7 Véus do Despertar (232 páginas, $23 USD)\nPlataforma digital: Espelho da Ilusão (7 capítulos imersivos, $19 USD)\n\nLeitores do livro físico tem acesso digital gratuito.\n\n#OsSeteVeus #LivroFísico #PlataformaDigital #Autoconhecimento",
        },
        {
          platform: "whatsapp",
          type: "Status",
          visual: {
            bg: "#f7f5f0", text: "#3d3630", accent: "#c9b896", format: "vertical",
            title: "Livro físico?",
            body: "Acesso digital gratuito.\nRegista e recebe o teu código.",
            footer: "seteveus.space/pedir-código",
          },
        },
      ],
    },
    {
      day: "Sábado",
      dayShort: "Sáb",
      theme: "Story interactivo + engagement",
      slots: [
        {
          platform: "instagram",
          type: "Story (quiz interactivo)",
          visual: {
            bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", format: "vertical",
            title: "Quiz rápido:",
            body: "O que te impede mais\nde ser quem realmente és?",
            footer: "Responde",
          },
          notes: "Story com sticker de Quiz:\n\"O que te impede mais?\"\nA) O medo do que vão pensar\nB) A culpa de querer mais\nC) Não saber quem sou\nD) O hábito de controlar tudo\n\nSegundo story: \"Cada resposta corresponde a um Espelho. Descobre o teu: seteveus.space/recursos/teste\"",
        },
        {
          platform: "ambos",
          type: "Responder DMs e mensagens",
          notes: "Engagement profundo. Responder quem participou nos quizzes e polls.",
        },
      ],
    },
    {
      day: "Domingo",
      dayShort: "Dom",
      theme: "Conteúdo leve + preparação",
      slots: [
        {
          platform: "instagram",
          type: "Story (bastidores)",
          visual: {
            bg: "#f7f5f0", text: "#3d3630", accent: "#7a8c6e", format: "vertical",
            title: "O Espelho do Medo\njá tem nome\ne rosto.",
            body: "Rui e Ana.\nO que o medo calou\nentre eles.",
            footer: "~ Em breve",
          },
          notes: "Story de bastidores: partilhar algo sobre a escrita do novo espelho. Foto do caderno, notas, ou simplesmente texto bonito sobre fundo.\n\"O Espelho do Medo já tem nome e rosto. Rui e Ana. O que o medo calou entre eles.\"",
        },
        {
          platform: "ambos",
          type: "Planear semana 8",
          notes: "Rever métricas. Identificar top posts. Preparar conteúdo da semana 8.",
        },
      ],
    },
  ],
};

// ─── SEMANA 8: CONSOLIDACAO + CRESCIMENTO ─────────────────────────────────────

const week8: WeekPlan = {
  weekNumber: 8,
  title: "Consolidação + Crescimento orgânico",
  subtitle: "Reciclar melhores conteúdos + novos formatos para crescer",
  days: [
    {
      day: "Segunda-feira",
      dayShort: "Seg",
      theme: "Reel — Pergunta provocadora",
      slots: [
        {
          platform: "instagram",
          type: "Reel (texto + música 15s)",
          visual: {
            bg: "#f7f5f0", text: "#3d3630", accent: "#c9b896", format: "vertical",
            title: "E se tudo o que\nacreditas sobre ti\nfoi escolhido\npor outra pessoa?",
            body: "",
            footer: "seteveus.space",
          },
          notes: "ROTEIRO DO REEL:\n\n(0-5s) Fundo claro. Pergunta aparece palavra a palavra:\n\"E se tudo o que acreditas sobre ti...\"\n(5-8s) \"...foi escolhido por outra pessoa?\"\n(8-12s) Pausa. Depois: \"Há 7 véus entre ti e a verdade.\"\n(12-15s) Logo + seteveus.space/recursos/teste\n\nMÚSICA: Algo que cresce em intensidade\nEFEITO: Texto em typewriter ou kinetic typography",
          caption: "E se tudo o que acreditas sobre ti foi escolhido por outra pessoa?\n\nHa mais para ti do que aquilo que tens vivido.\n\n#OsSeteVeus #Reel #Pergunta #Autoconhecimento #Despertar",
        },
        {
          platform: "whatsapp",
          type: "Status",
          visual: {
            bg: "#f7f5f0", text: "#3d3630", accent: "#c9b896", format: "vertical",
            title: "E se tudo o que\nacreditas sobre ti\nfoi escolhido\npor outra pessoa?",
            body: "Há 7 véus entre ti\ne a verdade.",
            footer: "seteveus.space/recursos/teste",
          },
        },
      ],
    },
    {
      day: "Terça-feira",
      dayShort: "Ter",
      theme: "Carrossel — 5 coisas que ninguém te diz sobre autoconhecimento",
      slots: [
        {
          platform: "instagram",
          type: "Carrossel (7 slides)",
          visual: {
            bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", format: "square",
            title: "5 coisas que ninguém\nte diz sobre\nautoconhecimento",
            body: "",
            footer: "Swipe ~",
          },
          notes: "SLIDES DO CARROSSEL:\n\nSlide 1 (capa): Fundo #3d3630, texto #c9b896\n\"5 coisas que ninguém te diz sobre autoconhecimento\"\n\nSlide 2: Fundo #f7f5f0\n\"1. Não é um destino. É um processo que nunca acaba.\"\n\nSlide 3: Fundo #ebe7df\n\"2. Vai doer. E isso é sinal de que está a funcionar.\"\n\nSlide 4: Fundo #f7f5f0\n\"3. Não precisas de um retiro de 10 dias. Precisas de 10 minutos honestos.\"\n\nSlide 5: Fundo #ebe7df\n\"4. O que descobres sobre ti pode assustar-te. E está tudo bem.\"\n\nSlide 6: Fundo #f7f5f0\n\"5. A maioria das pessoas desiste no momento em que finalmente ia mudar.\"\n\nSlide 7 (CTA): Fundo #3d3630, texto #c9b896\n\"Não desistas de ti.\nComeça aqui: seteveus.space/recursos/teste\"",
          caption: "5 coisas que ninguém te diz sobre autoconhecimento:\n\n1. Não é um destino\n2. Vai doer\n3. 10 minutos honestos bastam\n4. Pode assustar-te\n5. A maioria desiste antes de mudar\n\nNão desistas de ti.\n\n#OsSeteVeus #Autoconhecimento #Carrossel #DesenvolvimentoPessoal",
        },
        {
          platform: "whatsapp",
          type: "Status",
          visual: {
            bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", format: "vertical",
            title: "5 coisas que ninguém\nte diz sobre\nautoconhecimento.",
            body: "A número 5 é a mais importante.",
            footer: "seteveus.space/recursos/teste",
          },
        },
      ],
    },
    {
      day: "Quarta-feira",
      dayShort: "Qua",
      theme: "Post visual — Citação forte",
      slots: [
        {
          platform: "instagram",
          type: "Post Feed (citação)",
          visual: {
            bg: "#3d3630", text: "#c9b896", accent: "#f7f5f0", format: "square",
            title: "O véu não cai.\nTu é que\ndecides tirá-lo.",
            body: "",
            footer: "Os Sete Véus ~ seteveus.space",
          },
          caption: "\"O véu não cai. Tu é que decides tirá-lo.\"\n\n#OsSeteVeus #Citação #Despertar #Coragem #Autoconhecimento",
        },
        {
          platform: "whatsapp",
          type: "Status",
          visual: {
            bg: "#3d3630", text: "#c9b896", accent: "#f7f5f0", format: "vertical",
            title: "O véu não cai.\nTu é que\ndecides tirá-lo.",
            body: "",
            footer: "Os Sete Véus",
          },
        },
      ],
    },
    {
      day: "Quinta-feira",
      dayShort: "Qui",
      theme: "Reel — Comunidade Ecos",
      slots: [
        {
          platform: "instagram",
          type: "Reel (screen recording 20s)",
          visual: {
            bg: "#7a8c6e", text: "#f7f5f0", accent: "#ebe7df", format: "vertical",
            title: "Onde as vozes\nse encontram.",
            body: "Ecos. Maré. Círculo. Fogueira.\nTudo anónimo.\nTudo impermanente.",
            footer: "Comunidade Ecos",
          },
          notes: "ROTEIRO DO REEL (screen recording):\n\n(0-3s) Texto: \"Há um espaço onde as vozes se encontram.\"\n(3-8s) Screen recording: abrir seteveus.space/comunidade no telemóvel\n(8-12s) Mostrar as 4 salas: Ecos, Maré, Círculo, Fogueira\n(12-16s) Clicar numa sala, mostrar os posts anónimos\n(16-18s) Texto overlay: \"Tudo anónimo. Tudo impermanente.\"\n(18-20s) \"Incluída com qualquer experiência.\" + seteveus.space\n\nPRINTS/GRAVAÇÃO NECESSÁRIA:\n- Screen recording de seteveus.space/comunidade no telemóvel\n- Mostrar navegação entre salas",
          caption: "Onde as vozes se encontram.\n\nA comunidade Ecos: 4 salas, tudo anónimo, tudo impermanente.\n\nIncluída com qualquer experiência de leitura.\n\n#OsSeteVeus #ComunidadeEcos #Reel #Anonimato",
        },
      ],
    },
    {
      day: "Sexta-feira",
      dayShort: "Sex",
      theme: "Carrossel — FAQ visual",
      slots: [
        {
          platform: "instagram",
          type: "Carrossel (6 slides)",
          visual: {
            bg: "#ebe7df", text: "#3d3630", accent: "#c9b896", format: "square",
            title: "Perguntas\nque nos fazem\nsempre",
            body: "",
            footer: "Swipe ~",
          },
          notes: "SLIDES DO CARROSSEL:\n\nSlide 1 (capa): \"Perguntas que nos fazem sempre\"\n\nSlide 2: \"É um livro?\"\n\"Não. É uma experiência de leitura imersiva com ficção, respiração guiada, diário e espelho pessoal.\"\n\nSlide 3: \"Preciso ler por ordem?\"\n\"Sim. Os capítulos desbloqueiam sequencialmente. Cada um prepara o próximo.\"\n\nSlide 4: \"Como pago em Moçambique?\"\n\"M-Pesa ou Millenium BIM. Envias o comprovativo e confirmamos em 24h.\"\n\nSlide 5: \"Tenho o livro físico. Tenho acesso?\"\n\"Sim! Regista em seteveus.space/pedir-código e recebe o código.\"\n\nSlide 6 (CTA): Fundo #3d3630\n\"Mais perguntas? Fala connosco no chatbot da plataforma.\nseteveus.space\"",
          caption: "As perguntas que nos fazem sempre:\n\nÉ um livro? Não, é uma experiência.\nPreciso ler por ordem? Sim.\nComo pago em Moçambique? M-Pesa ou BIM.\nTenho o livro físico, tenho acesso? Sim!\n\n#OsSeteVeus #FAQ #Perguntas #Autoconhecimento",
        },
        {
          platform: "whatsapp",
          type: "Status",
          visual: {
            bg: "#ebe7df", text: "#3d3630", accent: "#c9b896", format: "vertical",
            title: "Tens dúvidas\nsobre a plataforma?",
            body: "Ve o novo post\nno Instagram\ncom respostas\nàs perguntas mais comuns.",
            footer: "@os7veus",
          },
        },
      ],
    },
    {
      day: "Sábado",
      dayShort: "Sáb",
      theme: "Story + engagement profundo",
      slots: [
        {
          platform: "instagram",
          type: "Story (caixa de perguntas)",
          visual: {
            bg: "#f7f5f0", text: "#3d3630", accent: "#c9b896", format: "vertical",
            title: "Faz-me uma pergunta\nsobre Os Sete Véus.",
            body: "Respondo a tudo.\nSem filtro.",
            footer: "Sticker de pergunta",
          },
          notes: "Usar sticker de pergunta do Instagram.\nResponder as perguntas nos stories seguintes ao longo do dia.\nGuardar as melhores respostas em destaque \"FAQ\".",
        },
        {
          platform: "ambos",
          type: "Responder DMs e mensagens",
          notes: "Dia de engagement profundo. Responder todas as DMs, comentários e perguntas. Comentar em posts de seguidoras.",
        },
      ],
    },
    {
      day: "Domingo",
      dayShort: "Dom",
      theme: "Reciclar + planear ciclo seguinte",
      slots: [
        {
          platform: "instagram",
          type: "Post Feed (resumo visual)",
          visual: {
            bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", format: "square",
            title: "Há um espaço\nonde podes\nser quem és.\n\nSem pressa.\nSem máscara.\nSem julgamento.",
            body: "",
            footer: "Os Sete Véus ~ seteveus.space",
          },
          caption: "Há um espaço onde podes ser quem és.\n\nSem pressa. Sem máscara. Sem julgamento.\n\n#OsSeteVeus #EspaçoSeguro #Autoconhecimento #Domingo",
        },
        {
          platform: "ambos",
          type: "Planear próximo ciclo",
          notes: "Rever todas as métricas das 8 semanas.\nIdentificar top 5 posts por engagement.\nReciclar conteúdos que funcionaram com variações.\nPreparar conteúdo para lançamento do Espelho do Medo.",
        },
      ],
    },
  ],
};

// ─── SEMANA ESPECIAL: CAMPANHA ONBOARDING — PEDE O TEU CODIGO ────────────────

const weekOnboarding: WeekPlan = {
  weekNumber: 9,
  title: "Campanha Onboarding ~ Pede o teu código",
  subtitle: "Para quem já tem o livro físico: pedir o código digital gratuito",
  days: [
    {
      day: "Terça-feira",
      dayShort: "Ter",
      theme: "Anúncio principal",
      slots: [
        {
          platform: "ambos",
          type: "WhatsApp + Instagram Story",
          visual: {
            bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", format: "vertical",
            title: "Já tens o livro físico?",
            body: "Agora existe uma\nexperiência digital\nque complementa\na tua leitura.\n\nO acesso é gratuito.\nPede o teu código.",
            footer: "seteveus.space/pedir-código",
          },
          caption: "O livro que tens nas mãos agora tem uma dimensão digital.\n\nSe já compraste \"Os 7 Véus do Despertar\", tens direito a acesso gratuito à experiência digital — leitura interactiva, diário reflexivo e comunidade.\n\n#OsSeteVeus #AcessoDigital #LivroFísico #Autoconhecimento",
        },
      ],
    },
    {
      day: "Quarta-feira",
      dayShort: "Qua",
      theme: "Carrossel — 5 passos",
      slots: [
        {
          platform: "instagram",
          type: "Carrossel",
          carousel: [
            { bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", title: "Compraste\no livro físico?", body: "", footer: "Os Sete Véus do Despertar" },
            { bg: "#f7f5f0", text: "#3d3630", accent: "#c9b896", title: "Tens direito\não acesso digital\ngratuito.", body: "Tudo o que o livro\nte deu no papel,\nagora vives no ecrã.", footer: "" },
            { bg: "#3d3630", text: "#f7f5f0", accent: "#7a8c6e", title: "Preenche o formulário.", body: "2 minutos.\nNome, email e\n(se quiseres)\numa foto do livro.", footer: "seteveus.space/pedir-código" },
            { bg: "#f7f5f0", text: "#3d3630", accent: "#c9b896", title: "Recebes o código\nem até 24h.", body: "No teu email.\nPessoal. Intransmissível.", footer: "" },
            { bg: "#7a8c6e", text: "#f7f5f0", accent: "#ebe7df", title: "O que ganhas:", body: "Leitura interactiva\nDiário reflexivo\nRespiração guiada\nComunidade anónima\nChatbot de apoio 24/7", footer: "seteveus.space/pedir-código" },
          ],
          caption: "5 passos simples. Se já tens o livro físico, o acesso digital é teu por direito.\n\n1. Compraste o livro? Tens direito ao acesso digital gratuito.\n2. Preenche o formulário (2 minutos).\n3. Recebes o código em até 24h.\n4. O que ganhas: leitura interactiva, diário reflexivo, comunidade.\n\n#OsSeteVeus #AcessoDigital #LivroFísico #Autoconhecimento",
        },
      ],
    },
    {
      day: "Quinta-feira",
      dayShort: "Qui",
      theme: "Tom íntimo — WhatsApp",
      slots: [
        {
          platform: "whatsapp",
          type: "Status",
          visual: {
            bg: "#c9a87c", text: "#3d3630", accent: "#c9b896", format: "vertical",
            title: "O livro físico tem\numa extensão digital.",
            body: "Reflexões, diário, comunidade anónima.\nGratuito. Pessoal. Teu.",
            footer: "seteveus.space/pedir-código",
          },
        },
      ],
    },
    {
      day: "Sexta-feira",
      dayShort: "Sex",
      theme: "Visual — papel ao ecrã",
      slots: [
        {
          platform: "instagram",
          type: "Post Feed / Story",
          visual: {
            bg: "#ebe7df", text: "#3d3630", accent: "#c9b896", format: "square",
            title: "Do papel ao ecrã.",
            body: "A mesma essência,\numa nova forma\nde viver.",
            footer: "seteveus.space/pedir-código",
            highlight: "Livro físico + digital",
          },
          caption: "Cada véu que cai no papel pode agora ecoar no digital.\n\nSe já tens o livro, o acesso gratuito é teu.\n\n#OsSeteVeus #DoPapelAoDigital #LeituraTransformadora #Autoconhecimento",
          notes: "Conceito visual: foto do livro físico lado a lado com ecrã do telemóvel mostrando a versão digital.\nSe não tiveres foto profissional, usa o Gerador Livre com o print 'livro físico' como fundo.",
        },
      ],
    },
    {
      day: "Sábado",
      dayShort: "Sáb",
      theme: "Último lembrete da semana",
      slots: [
        {
          platform: "whatsapp",
          type: "Status",
          visual: {
            bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", format: "vertical",
            title: "Ainda não pediste\no teu código?",
            body: "Se compraste o livro físico,\no acesso digital é teu.",
            footer: "seteveus.space/pedir-código",
          },
        },
        {
          platform: "instagram",
          type: "Story",
          visual: {
            bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", format: "vertical",
            title: "Último lembrete\ndesta semana.",
            body: "Se tens o livro físico\ne ainda não pediste\no teu código digital:\n\neste é o momento.",
            footer: "seteveus.space/pedir-código",
          },
        },
      ],
    },
    {
      day: "Domingo",
      dayShort: "Dom",
      theme: "Descanso + responder mensagens",
      slots: [
        {
          platform: "whatsapp",
          type: "Responder DMs",
          notes: "Responder a todas as mensagens recebidas durante a semana.\nSe alguém perguntou como pedir o código, enviar link directo: seteveus.space/pedir-código\nSe alguém enviou comprovativo, aprovar o código no painel admin.",
        },
      ],
    },
  ],
};


// ─── SEMANA LANCAMENTO: ESPELHO DO MEDO ──────────────────────────────────────

const weekLaunchMedo: WeekPlan = {
  weekNumber: 10,
  title: "LANCAMENTO: Espelho do Medo",
  subtitle: "O segundo espelho esta disponivel — conteudo de lancamento pronto a publicar",
  days: [
    {
      day: "Segunda-feira (Dia do lancamento)",
      dayShort: "Seg",
      theme: "Anuncio principal",
      slots: [
        {
          platform: "instagram",
          type: "Post Feed (Anuncio)",
          carousel: [
            { bg: "#8b9b8e", text: "#f7f5f0", accent: "#ebe7df", title: "O segundo espelho\nchegou.", body: "", footer: "O Espelho do Medo ~ Disponivel agora", bgImage: "/images/mandala-7veus.png" },
            { bg: "#f5f7f5", text: "#3d3630", accent: "#8b9b8e", title: "Rui tem quarenta\ne dois anos.", body: "Familia funcional.\nCarreira estavel.\nTudo organizado\npara funcionar.\n\nNada se move.", footer: "" },
            { bg: "#3d3630", text: "#f7f5f0", accent: "#8b9b8e", title: "\"O meu pai esta\nsempre em casa\nmas as vezes parece\nque nao esta.\"", body: "Miguel, 9 anos.", footer: "" },
            { bg: "#f5f7f5", text: "#3d3630", accent: "#5d7a6d", title: "7 capitulos.\n7 territorios\nonde Rui ficou\npara tras.", body: "Corpo. Trabalho.\nPaternidade. Amizades.\nTempo livre. Intimidade.\nIdentidade.", footer: "" },
            { bg: "#8b9b8e", text: "#f7f5f0", accent: "#ebe7df", title: "Nao e sobre colapso.\nNao e sobre despertar.", body: "E sobre a paralisia\nlucida que se instala\nquando nada obriga\na mudar.", footer: "seteveus.space/experiencias" },
          ],
          caption: "O Espelho do Medo chegou.\n\nRui tem quarenta e dois anos. Familia funcional. Carreira estavel. Tudo organizado para funcionar.\n\nO filho de 9 anos — numa apresentacao escolar sobre a familia — disse: \"O meu pai esta sempre em casa mas as vezes parece que nao esta.\"\n\nUma constatacao de crianca. Sem acusacao. Sem enfase.\nComo quem descreve o tempo que faz la fora.\n\nReconheces este padrao? Ha mais para ti.\nLink na bio →\n\n#OsSeteVeus #EspelhoDoMedo #Autoconhecimento #FiccaoPsicologica #HaMaisParaTi",
        },
        {
          platform: "whatsapp",
          type: "Broadcast + Status",
          visual: {
            bg: "#8b9b8e", text: "#f7f5f0", accent: "#ebe7df", format: "vertical",
            title: "O segundo espelho\nchegou.",
            body: "O Espelho do Medo.\nDisponivel agora.",
            footer: "seteveus.space/experiencias",
          },
          broadcast: "O segundo espelho esta disponivel.\n\nO Espelho do Medo e a historia de Rui — um homem que vive tecnicamente mas permanece existencialmente imovel.\n\nQuarenta e dois anos. Familia funcional. Tudo organizado para funcionar. Nada se move.\n\nAte que o filho de 9 anos diz: \"O meu pai esta sempre em casa mas as vezes parece que nao esta.\"\n\n7 capitulos. $19 USD / 1.200 MZN.\nAcesso vitalicio.\n\nseteveus.space/experiencias\n\n~ Vivianne",
        },
      ],
    },
    {
      day: "Terca-feira",
      dayShort: "Ter",
      theme: "Citacao impactante",
      slots: [
        {
          platform: "instagram",
          type: "Post Feed (Citacao)",
          visual: {
            bg: "#3d3630", text: "#f7f5f0", accent: "#8b9b8e", format: "square",
            title: "\"O meu pai esta\nsempre em casa\nmas as vezes parece\nque nao esta.\"",
            body: "Miguel, 9 anos.\nApresentacao escolar\nsobre a familia.",
            footer: "O Espelho do Medo ~ seteveus.space",
          },
          caption: "\"O meu pai esta sempre em casa mas as vezes parece que nao esta.\"\n\nMiguel tem 9 anos. Numa apresentacao escolar sobre a familia, disse esta frase sem enfase, sem acusacao. Como quem descreve o tempo que faz la fora.\n\nUma constatacao de crianca que captou com precisao involuntaria aquilo que Rui sabia mas nunca ouvira em voz alta.\n\nO Espelho do Medo — disponivel agora. Link na bio.\n\n#OsSeteVeus #EspelhoDoMedo #FiccaoPsicologica #ParalisiaLucida",
        },
        {
          platform: "whatsapp",
          type: "Status",
          visual: {
            bg: "#3d3630", text: "#f7f5f0", accent: "#8b9b8e", format: "vertical",
            title: "\"O meu pai esta\nsempre em casa\nmas as vezes parece\nque nao esta.\"",
            body: "Miguel, 9 anos.",
            footer: "O Espelho do Medo",
          },
        },
      ],
    },
    {
      day: "Quarta-feira",
      dayShort: "Qua",
      theme: "Voce sabia que? + Conteudo educativo",
      slots: [
        {
          platform: "instagram",
          type: "Carrossel (Voce sabia que?)",
          carousel: [
            { bg: "#f5f7f5", text: "#3d3630", accent: "#8b9b8e", title: "Sabias que...", body: "O medo nao e\numa emocao pontual.\nE um modo de vida.", footer: "Espelho do Medo ~ seteveus.space" },
            { bg: "#8b9b8e", text: "#f7f5f0", accent: "#ebe7df", title: "Sabias que\na maioria das decisoes\nque tomas por dia\nsao baseadas no medo?", body: "Nao por covardia.\nPor habito.\nPor um mecanismo\nantigo que confunde\nprudencia com prisao.", footer: "" },
            { bg: "#f5f7f5", text: "#3d3630", accent: "#5d7a6d", title: "Sabias que\no medo se disfarza\nde bom senso?", body: "De maturidade.\nDe responsabilidade.\nAte ja nao conseguires\ndistingui-lo de\numa escolha consciente.", footer: "" },
            { bg: "#3d3630", text: "#f7f5f0", accent: "#8b9b8e", title: "Sabias que\na paralisia lucida\ne mais comum\ndo que pensas?", body: "Ver o veu.\nSaber que esta ali.\nE continuar.\nPorque o custo de sair\nparece maior\ndo que o custo de ficar.", footer: "" },
            { bg: "#8b9b8e", text: "#f7f5f0", accent: "#ebe7df", title: "O Espelho do Medo\nexplora isto.", body: "7 capitulos.\nUm homem. Uma semana.\nA historia de quem vive\nsem estar presente.\n\n$19 USD / 1.200 MZN", footer: "seteveus.space/experiencias" },
          ],
          caption: "Ha uma diferenca entre o medo que avisa e o medo que governa.\n\nO primeiro protege. O segundo instala-se.\nTorna-se habito. Disfarça-se de bom senso, de maturidade, de responsabilidade.\n\nHa um momento em que vês o veu e continues mesmo assim. Nao por fraqueza — pelo custo que parece maior do que o custo de ficar.\n\nO Espelho do Medo acompanha este territorio. 7 capitulos. Disponivel agora.\n\n#OsSeteVeus #EspelhoDoMedo #Autoconhecimento #ParalisiaLucida #HaMaisParaTi",
        },
      ],
    },
    {
      day: "Quinta-feira",
      dayShort: "Qui",
      theme: "Citacoes do livro",
      slots: [
        {
          platform: "instagram",
          type: "Post Feed (Citacao)",
          visual: {
            bg: "#f5f7f5", text: "#3d3630", accent: "#8b9b8e", format: "square",
            title: "\"Via o veu.\nSempre o vira.\nNao era a ilusao\nque o prendia.\nEra a paralisia lucida.\"",
            body: "",
            footer: "O Espelho do Medo ~ seteveus.space",
          },
          caption: "\"Via o veu. Sempre o vira. Nao era a ilusao que o prendia. Era a paralisia lucida. A consciencia perfeita da prisao combinada com a incapacidade de sair.\"\n\n— O Espelho do Medo\n\nDisponivel agora — link na bio.\n\n#OsSeteVeus #EspelhoDoMedo #ParalisiaLucida #FiccaoPsicologica",
        },
        {
          platform: "whatsapp",
          type: "Broadcast",
          broadcast: "Uma frase do novo Espelho do Medo:\n\n\"Via o veu. Sempre o vira. Nao era a ilusao que o prendia. Era a paralisia lucida. A consciencia perfeita da prisao combinada com a incapacidade de sair.\"\n\nO segundo espelho da coleccao esta disponivel.\n7 capitulos. $19 USD / 1.200 MZN.\n\nseteveus.space/experiencias\n\n~ Vivianne",
        },
      ],
    },
    {
      day: "Sexta-feira",
      dayShort: "Sex",
      theme: "O talvez + Convite",
      slots: [
        {
          platform: "instagram",
          type: "Post Feed",
          visual: {
            bg: "#3d3630", text: "#8b9b8e", accent: "#f7f5f0", format: "square",
            title: "\"Amanha sera\nsegunda-feira.\nProvavelmente\ntudo se repetira.\nMas ha agora\num talvez.\"",
            body: "Minusculo. Fragil.\nQuase inaudivel.\nMas novo.",
            footer: "O Espelho do Medo ~ seteveus.space",
          },
          caption: "\"Amanha sera segunda-feira. Acordara antes do despertador. Provavelmente. Mas havia agora um talvez. Minusculo, fragil, quase inaudivel. Mas novo.\"\n\n— O Espelho do Medo, Epilogo\n\nO gesto minimo que muda tudo.\nDisponivel agora — link na bio.\n\n#OsSeteVeus #EspelhoDoMedo #OTalvez #Autoconhecimento",
        },
        {
          platform: "whatsapp",
          type: "Status",
          visual: {
            bg: "#3d3630", text: "#8b9b8e", accent: "#f7f5f0", format: "vertical",
            title: "Ha um talvez.",
            body: "Minusculo. Fragil.\nQuase inaudivel.\nMas novo.",
            footer: "O Espelho do Medo",
          },
        },
      ],
    },
    {
      day: "Sabado",
      dayShort: "Sab",
      theme: "Engagement + Conexao",
      slots: [
        {
          platform: "instagram",
          type: "Story interactivo",
          visual: {
            bg: "#8b9b8e", text: "#f7f5f0", accent: "#ebe7df", format: "vertical",
            title: "Reconheces-te\nnisto?",
            body: "Saberes o que queres\nmas o medo decidir\nantes de ti.",
            footer: "Sim / Nao (poll)",
          },
          notes: "Story com poll do Instagram:\n\"Reconheces-te nisto?\"\n\"Saberes o que queres mas o medo decidir antes de ti.\"\nOpcoes: Sim / Nao\n\nSegundo Story apos resultado:\n\"Se respondeste sim, esta historia foi escrita para ti.\nO Espelho do Medo — seteveus.space/experiencias\"",
        },
        {
          platform: "ambos",
          type: "Responder DMs e mensagens",
          notes: "Responder TODAS as DMs. Agradecer quem partilhou o lancamento. Interagir com comentarios.",
        },
      ],
    },
    {
      day: "Domingo",
      dayShort: "Dom",
      theme: "Reflexao + Espumante no funeral",
      slots: [
        {
          platform: "instagram",
          type: "Post Feed (Citacao)",
          visual: {
            bg: "#ebe7df", text: "#3d3630", accent: "#8b9b8e", format: "square",
            title: "\"A vida e\nbasicamente isto:\nespumante\nno funeral.\"",
            body: "Bruno, amigo de Rui.\nDe quando ainda riam.",
            footer: "O Espelho do Medo ~ seteveus.space",
          },
          caption: "\"A vida e basicamente isto: espumante no funeral.\"\n\nBruno contou esta historia e Rui riu ate lhe doerem os abdominais. Rui com quem ria com o corpo inteiro. Noutras versoes de si.\n\nDepois, Bruno escreveu: \"Tou na cidade sexta. Almoco?\" Rui nao respondeu.\n\nReconheces este padrao?\n\nO Espelho do Medo — link na bio.\n\n#OsSeteVeus #EspelhoDoMedo #Autoconhecimento",
        },
      ],
    },
  ],
};

// ─── SEMANA LANCAMENTO MEDO +1: APROFUNDAMENTO ────────────────────────────────

const weekLaunchMedo2: WeekPlan = {
  weekNumber: 11,
  title: "Espelho do Medo — Aprofundamento",
  subtitle: "Segunda semana de lancamento: citacoes, temas, convite continuo",
  days: [
    {
      day: "Segunda-feira",
      dayShort: "Seg",
      theme: "A sede",
      slots: [
        {
          platform: "instagram",
          type: "Post Feed (Citacao)",
          visual: {
            bg: "#3d3630", text: "#f7f5f0", accent: "#7d9b8e", format: "square",
            title: "\"Sentiu uma coisa\nestranha no peito.\nAlgo mais parecido\ncom sede.\"",
            body: "A sede de quem passou\ntanto tempo sem beber\nque se esqueceu\nde que tinha sede.",
            footer: "O Espelho do Medo ~ seteveus.space",
          },
          caption: "\"Sentiu uma coisa estranha no peito. Nao dor. Nao saudade exactamente. Algo mais parecido com sede. A sede de quem passou tanto tempo sem beber que se esqueceu de que tinha sede, e agora, ao ver agua, o corpo inteiro lembra de repente.\"\n\n— O Espelho do Medo, Parte VI\n\n#OsSeteVeus #EspelhoDoMedo #ASede #Autoconhecimento",
        },
      ],
    },
    {
      day: "Terca-feira",
      dayShort: "Ter",
      theme: "Os 7 territorios do medo",
      slots: [
        {
          platform: "instagram",
          type: "Carrossel educativo",
          carousel: [
            { bg: "#8b9b8e", text: "#f7f5f0", accent: "#ebe7df", title: "Os 7 territorios\nonde o medo\nnos prende.", body: "", footer: "O Espelho do Medo", bgImage: "/images/mandala-7veus.png" },
            { bg: "#7a8a7d", text: "#f7f5f0", accent: "#ebe7df", title: "1. O corpo", body: "Acorda sozinho.\nFunciona sozinho.\nA mao nao se move\npara tocar\nquem dorme ao lado.", footer: "" },
            { bg: "#6d8a7d", text: "#f7f5f0", accent: "#ebe7df", title: "2. O trabalho", body: "Competencia sem\nentusiasmo.\nExecutar sem criar.\nMuseus impossiveis\nguardados numa gaveta.", footer: "" },
            { bg: "#5d7a6d", text: "#f7f5f0", accent: "#ebe7df", title: "3. A paternidade", body: "\"Tens tudo?\"\nquando queria dizer\n\"Importas-me.\"", footer: "" },
            { bg: "#4d6a5d", text: "#f7f5f0", accent: "#ebe7df", title: "4. As amizades", body: "Convite. Hesitacao.\nAdiamento. Alivio.\nCulpa. Esquecimento.\nRepeticao.", footer: "" },
            { bg: "#8b9b8e", text: "#f7f5f0", accent: "#ebe7df", title: "5. O tempo livre", body: "Um corredor sem portas.\nOpcoes visiveis\nmas nenhuma\nchama.", footer: "" },
            { bg: "#7d9b8e", text: "#f7f5f0", accent: "#ebe7df", title: "6. A intimidade", body: "A sede reconhecida\nmas nao saciada.\nO cha aceite\npela primeira vez.", footer: "" },
            { bg: "#6d8b7e", text: "#f7f5f0", accent: "#ebe7df", title: "7. A identidade", body: "Uma fotografia antiga.\nUm homem que ria.\nOnde esta\nesse homem agora?", footer: "" },
            { bg: "#3d3630", text: "#f7f5f0", accent: "#8b9b8e", title: "Em qual destes\nte reconheces?", body: "$19 USD / 1.200 MZN\nAcesso vitalicio.", footer: "seteveus.space/experiencias" },
          ],
          caption: "O medo nao prende em abstracto. Prende em lugares concretos.\n\n1. O corpo — acorda sozinho, funciona sozinho\n2. O trabalho — competencia sem entusiasmo\n3. A paternidade — \"tens tudo?\" quando queria dizer \"importas-me\"\n4. As amizades — suspensas, nao mortas, apenas esquecidas\n5. O tempo livre — um corredor sem portas\n6. A intimidade — a sede que se reconhece mas nao se sacia\n7. A identidade — onde esta quem eu era?\n\nReconheces-te em algum destes? Ha mais para ti.\n\n#OsSeteVeus #EspelhoDoMedo #Autoconhecimento #FiccaoPsicologica #Reconhecimento",
        },
      ],
    },
    {
      day: "Quarta-feira",
      dayShort: "Qua",
      theme: "Espelhos vs Nos — explicar",
      slots: [
        {
          platform: "instagram",
          type: "Post Feed",
          visual: {
            bg: "#f5f7f5", text: "#3d3630", accent: "#8b9b8e", format: "square",
            title: "Os Espelhos\nolham para dentro.\nOs Nos olham\npara a relacao.",
            body: "Primeiro vives o Espelho.\nDepois, se quiseres,\ndesatas o No.",
            footer: "seteveus.space/experiencias",
          },
          caption: "Os Espelhos olham para dentro. Os Nos olham para a relacao.\n\nO Espelho do Medo e a historia de Rui — o que o medo fez a vida dele.\nO No do Silencio (em breve) sera a historia de Rui e Ana — o que o medo calou entre eles.\n\nPrimeiro vives o Espelho. Depois, se quiseres, desatas o No.\n\n#OsSeteVeus #EspelhoDoMedo #ColeccaoEspelhos #ColeccaoNos",
        },
        {
          platform: "whatsapp",
          type: "Broadcast",
          broadcast: "Ja conheces a diferenca entre Espelhos e Nos?\n\nOs Espelhos olham para dentro — a tua relacao contigo.\nOs Nos olham para a relacao — o que se passa entre duas pessoas.\n\nO Espelho do Medo e a historia de Rui.\nO No do Silencio (em breve) sera a historia de Rui e Ana.\n\nComecar: seteveus.space/experiencias\n\n~ Vivianne",
        },
      ],
    },
    {
      day: "Quinta-feira",
      dayShort: "Qui",
      theme: "Precos + Pack",
      slots: [
        {
          platform: "instagram",
          type: "Post Feed",
          visual: {
            bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", format: "square",
            title: "Dois espelhos.\nUma jornada.",
            body: "Espelho da Ilusao\n+ Espelho do Medo\n\nIndividual: $19 cada\nPack 3: $69 (18% desc.)\nJornada Completa: $149\n\nAcesso vitalicio.\nPayPal ou M-Pesa.",
            footer: "seteveus.space/comprar",
          },
          caption: "Ha dois espelhos disponiveis agora. Mais cinco a caminho.\n\nEspelho da Ilusao — $19 USD (1.200 MZN)\nEspelho do Medo — $19 USD (1.200 MZN)\n\nOu começas com um. Ou pegas no Pack 3 ($69). Ou começas a Jornada Completa ($149).\n\nAcesso vitalicio. Sem prazo. Ao teu ritmo.\nPayPal ou M-Pesa. Link na bio →\n\n#OsSeteVeus #Autoconhecimento #FiccaoPsicologica #LeituraImersiva",
        },
      ],
    },
    {
      day: "Sexta-feira",
      dayShort: "Sex",
      theme: "Citacao final da semana",
      slots: [
        {
          platform: "instagram",
          type: "Post Feed",
          visual: {
            bg: "#8b9b8e", text: "#f7f5f0", accent: "#ebe7df", format: "square",
            title: "\"E se os dedos\nque um dia desenharam\nmuseus impossiveis\nainda souberem\nmover-se?\"",
            body: "",
            footer: "O Espelho do Medo ~ seteveus.space",
          },
          caption: "\"E se os dedos que um dia desenharam museus impossiveis ainda souberem mover-se? E se debaixo de toda a contencao houver ainda alguem que sabe rir com o corpo inteiro?\"\n\n— O Espelho do Medo, Epilogo\n\n#OsSeteVeus #EspelhoDoMedo #MuseusImpossiveis #Autoconhecimento",
        },
        {
          platform: "whatsapp",
          type: "Status",
          visual: {
            bg: "#8b9b8e", text: "#f7f5f0", accent: "#ebe7df", format: "vertical",
            title: "\"E se os dedos\nque um dia desenharam\nmuseus impossiveis\nainda souberem\nmover-se?\"",
            body: "",
            footer: "O Espelho do Medo",
          },
        },
      ],
    },
    {
      day: "Sabado",
      dayShort: "Sab",
      theme: "Engagement",
      slots: [{ platform: "ambos", type: "Responder DMs e mensagens", notes: "Responder TODAS as mensagens. Agradecer partilhas. Comentar em posts de seguidoras." }],
    },
    {
      day: "Domingo",
      dayShort: "Dom",
      theme: "Preparacao",
      slots: [{ platform: "ambos", type: "Rever metricas do lancamento", notes: "Rever: alcance, engagement, vendas, DMs recebidas. Planear conteudo da proxima semana." }],
    },
  ],
};

export const allWeeks: WeekPlan[] = [week1, week2, week3, week4, week5, week6, week7, week8, weekOnboarding, weekLaunchMedo, weekLaunchMedo2];

// ─── HUB TEMÁTICO ─────────────────────────────────────────────────────────────
// Organização por tema, não por semana de campanha.
// Tom: "Vejo-te, e há mais para ti." — Da Confrontação ao Convite
// Véus · Espelhos · Nós · Comunidade · Reflexões

export const thematicHub: WeekPlan[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // TEMA 1 — VÉUS
  // Os 7 Véus do Despertar — o ensaio filosófico
  // ══════════════════════════════════════════════════════════════════════════
  {
    weekNumber: 1,
    title: "Véus",
    subtitle: "Os 7 Véus do Despertar — o ensaio filosófico",
    days: [
      {
        day: "Permanência",
        dayShort: "Perm",
        theme: "Reconheces esta frase?",
        slots: [
          {
            platform: "instagram",
            type: "Post Feed",
            visual: {
              bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", format: "square",
              title: "Há uma crença\nque corre\npor baixo de tudo.\n\n«Sempre fui assim.»",
              body: "É confortável\npensar isso.",
              footer: "Véu da Permanência ~ Os 7 Véus do Despertar",
            },
            caption: "Às vezes não é o peso das coisas que nos segura.\n\nÉ a convicção de que sempre foi assim — e que sempre assim será.\n\nO corpo lembra outras versões. A mente convence-se de que nunca existiram.\n\nReconheces?\n\n#OsSeteVeus #VeuDaPermanencia #Autoconhecimento",
          },
          {
            platform: "instagram",
            type: "Carrossel",
            carousel: [
              { bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", title: "«Sempre fui assim.»\n\nÉ a crença\nmais quieta\nde todas.", body: "", footer: "Os 7 Véus do Despertar" },
              { bg: "#f7f5f0", text: "#3d3630", accent: "#3d3630", title: "O corpo lembra\noutra versão.", body: "A mente convence-se\nde que nunca existiu.", footer: "" },
              { bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", title: "Não tens de\nrecusar essa crença\nhoje.", body: "Só de a notar.", footer: "" },
              { bg: "#ebe7df", text: "#3d3630", accent: "#c9b896", title: "Talvez já tenhas\nmudado mais\ndo que pensas.", body: "E não reparaste.", footer: "Há mais para ti." },
            ],
            caption: "Há algo que diz: sempre fui assim.\n\nÉ humano. É confortável.\nE às vezes não é a única verdade disponível.\n\nReconheces?\n\n#OsSeteVeus #VeuDaPermanencia #Autoconhecimento",
          },
          {
            platform: "whatsapp",
            type: "WhatsApp Status",
            carousel: [
              { bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", title: "«Sempre fui assim.»\n\nÉ a crença\nmais quieta\nde todas.\n\nReconheces?", body: "", footer: "Os 7 Véus do Despertar" },
            ],
            caption: "Há algo que diz: sempre fui assim.\n\nO corpo lembra outra versão.\n\nTalvez já tenhas mudado mais do que pensas.\n\nOs 7 Véus do Despertar — seteveus.space\n\n#OsSeteVeus #VeuDaPermanencia",
          },
        ],
      },
      {
        day: "Memória",
        dayShort: "Mem",
        theme: "A história que contas sobre ti",
        slots: [
          {
            platform: "instagram",
            type: "Post Feed",
            visual: {
              bg: "#1a1a2e", text: "#f7f5f0", accent: "#c9b896", format: "square",
              title: "Bebeu o café\nde pé, em três goles.\n\nHouve um tempo\nem que ficava sentada\na beber devagar.",
              body: "O corpo lembrava.\nA mente já não.",
              footer: "Véu da Memória ~ Os 7 Véus do Despertar",
            },
            caption: "A história que contas sobre ti não é tudo o que viveste.\n\nÉ o que ficou. O que o teu cérebro escolheu repetir — e que muitas vezes confirma o que já acreditas sobre ti mesma.\n\nE se houvesse capítulos que esqueceste?\n\nTalvez a história não esteja fechada.\n\n#OsSeteVeus #VeuDaMemoria #Autoconhecimento",
          },
          {
            platform: "instagram",
            type: "Carrossel",
            carousel: [
              { bg: "#1a1a2e", text: "#f7f5f0", accent: "#c9b896", title: "A história\nque contas\nsobre ti.", body: "", footer: "Os 7 Véus do Despertar" },
              { bg: "#f7f5f0", text: "#3d3630", accent: "#3d3630", title: "A memória não guarda\ntudo o que viveste.", body: "Guarda o que confirma\naquilo em que já acreditas.", footer: "" },
              { bg: "#1a1a2e", text: "#f7f5f0", accent: "#c9b896", title: "E as histórias\nque conta sobre ti\ntornam-se\nquem tu és.", body: "Aos poucos.\nSem que percebas.", footer: "" },
              { bg: "#ebe7df", text: "#3d3630", accent: "#c9b896", title: "E se houvesse\ncapítulos\nque esqueceste?", body: "Talvez a história\nnão esteja fechada.", footer: "Há mais para ti." },
            ],
            caption: "Não estamos presas ao que vivemos.\n\nEstamos presas às histórias que contamos sobre o que vivemos.\n\nE às vezes esquecemos capítulos inteiros.\n\nE se a história não estiver fechada?\n\n#OsSeteVeus #VeuDaMemoria #Autoconhecimento",
          },
        ],
      },
      {
        day: "Turbilhão",
        dayShort: "Turb",
        theme: "Há algo em ti que os vê passar",
        slots: [
          {
            platform: "instagram",
            type: "Post Feed",
            visual: {
              bg: "#0d1b2a", text: "#f7f5f0", accent: "#7a8c6e", format: "square",
              title: "A mente não para.\n\nE eu confundo isso\ncom ser eu.",
              body: "",
              footer: "Véu do Turbilhão ~ Os 7 Véus do Despertar",
            },
            caption: "Um pensamento atrás do outro.\n\nO que disseste. O que falhaste. O que pode correr mal. O que tinhas de ter feito.\n\nE de repente já não estás a ter pensamentos — estás a ser eles.\n\nIsso não é a mesma coisa. Mas demora a perceber.\n\nReconheces?\n\n#OsSeteVeus #VeuDoTurbilhao #Autoconhecimento",
          },
        ],
      },
      {
        day: "Esforço",
        dayShort: "Esf",
        theme: "E se parasses um momento",
        slots: [
          {
            platform: "instagram",
            type: "Post Feed",
            visual: {
              bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", format: "square",
              title: "Há uma voz que diz:\nainda não.\nMais um esforço.\nDepois descansas.\n\nIsto há quanto tempo?",
              body: "",
              footer: "Véu do Esforço ~ Os 7 Véus do Despertar",
            },
            caption: "Nunca é suficiente.\n\nMais um projecto. Mais uma meta. Mais um esforço. \"Depois descansas.\"\n\nE essa voz — quando foi a última vez que ficou satisfeita?\n\nE se não houver um depois — só este agora?\n\n#OsSeteVeus #VeuDoEsforco #Autoconhecimento",
          },
        ],
      },
      {
        day: "Desolação",
        dayShort: "Desol",
        theme: "A quietude que assusta",
        slots: [
          {
            platform: "instagram",
            type: "Post Feed",
            visual: {
              bg: "#2a2420", text: "#f7f5f0", accent: "#c9b896", format: "square",
              title: "Há momentos\nem que tudo\nfica quieto.\n\nE a quietude\nassusta mais\ndo que o barulho.",
              body: "",
              footer: "Véu da Desolação ~ Os 7 Véus do Despertar",
            },
            caption: "Não saber o que sentes. Não querer nada em particular. Não conseguir nomear o que se passa.\n\nIsso não é ausência de vida.\n\nÉ um tipo de presença que ainda não encontrou forma.\n\nFica aqui um momento.\n\n#OsSeteVeus #VeuDaDesolacao #Autoconhecimento",
          },
        ],
      },
      {
        day: "Horizonte",
        dayShort: "Hor",
        theme: "O quando que recua sempre",
        slots: [
          {
            platform: "instagram",
            type: "Post Feed",
            visual: {
              bg: "#3d3630", text: "#f7f5f0", accent: "#7a8c6e", format: "square",
              title: "Há um «quando»\nque carregamos\nconnosco.\n\nQuando estiver\ntudo resolvido.",
              body: "Esse quando\nrecua sempre\num pouco mais.",
              footer: "Véu do Horizonte ~ Os 7 Véus do Despertar",
            },
            caption: "Quando tiver este trabalho. Quando resolver este problema. Quando a minha vida estiver assim.\n\nE esse quando recua sempre um pouco mais.\n\nE se o momento que esperavas fosse sempre este?\n\n#OsSeteVeus #VeuDoHorizonte #Autoconhecimento",
          },
        ],
      },
      {
        day: "Dualidade",
        dayShort: "Dual",
        theme: "A janela entre mim e o resto",
        slots: [
          {
            platform: "instagram",
            type: "Post Feed",
            visual: {
              bg: "#f7f5f0", text: "#3d3630", accent: "#c9b896", format: "square",
              title: "Às vezes sinto-me\nseparada de tudo.\n\nComo se houvesse\numa janela\nentre mim\ne o que acontece.",
              body: "",
              footer: "Véu da Dualidade ~ Os 7 Véus do Despertar",
            },
            caption: "É a sensação mais solitária de todas.\n\nE também a mais partilhada.\n\nHá algo do outro lado dessa janela que não te esqueceu.\n\nReconheces?\n\n#OsSeteVeus #VeuDaDualidade #Autoconhecimento",
          },
          {
            platform: "instagram",
            type: "Carrossel — Os 7 Véus",
            carousel: [
              { bg: "#3d3630", text: "#c9b896", accent: "#f7f5f0", title: "7 frases\nque passam\npor verdade.\n\nReconheces\nalguma?", body: "", footer: "Guarda esta publicação.", bgImage: "/images/mandala-7veus.png" },
              { bg: "#c9b896", text: "#3d3630", accent: "#f7f5f0", title: "«Sempre fui assim.»", body: "", footer: "Permanência" },
              { bg: "#1a1a2e", text: "#f7f5f0", accent: "#c9b896", title: "«O que me aconteceu\ndefine quem sou.»", body: "", footer: "Memória" },
              { bg: "#0d1b2a", text: "#f7f5f0", accent: "#7a8c6e", title: "«Não consigo\nparar de pensar.»", body: "", footer: "Turbilhão" },
              { bg: "#2a2420", text: "#f7f5f0", accent: "#c9b896", title: "«Ainda não cheguei\nonde devia.»", body: "", footer: "Esforço" },
              { bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", title: "«Não sei\no que quero.»", body: "", footer: "Desolação" },
              { bg: "#2a3a2a", text: "#f7f5f0", accent: "#7a8c6e", title: "«Quando estiver\ntudo resolvido,\ndescansarei.»", body: "", footer: "Horizonte" },
              { bg: "#f7f5f0", text: "#3d3630", accent: "#c9b896", title: "«Sinto-me separada\nde tudo.»\n\nTalvez.", body: "", footer: "Os 7 Véus do Despertar — seteveus.space" },
            ],
            caption: "7 frases que passam por verdade.\n\nNão são diagnósticos. São reconhecimentos.\n\nSe te reconheceste em alguma — estás no sítio certo.\n\nGuarda. Volta quando precisares.\n\n#OsSeteVeus #7Veus #Autoconhecimento",
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // TEMA 2 — ESPELHOS
  // Colecção de ficção interior
  // ══════════════════════════════════════════════════════════════════════════
  {
    weekNumber: 2,
    title: "Espelhos",
    subtitle: "Colecção de ficção interior — cada espelho revela um véu",
    days: [
      {
        day: "Espelho da Ilusão",
        dayShort: "Ilus",
        theme: "A vida que se tornou automática",
        slots: [
          {
            platform: "instagram",
            type: "Post Feed",
            visual: {
              bg: "#3d3630", text: "#c9b896", accent: "#f7f5f0", format: "square",
              title: "\"Quando foi que\nescolhi tomar café\nem vez de chá?\"",
              body: "Uma pergunta absurda\nque muda tudo.",
              footer: "O Espelho da Ilusão",
            },
            caption: "\"Quando foi que escolhi tomar café em vez de chá?\"\n\nÉ a pergunta mais absurda. Sara sabe isso.\nE foi a que mudou tudo.\n\nseteveus.space\n\n#OsSeteVeus #EspelhoDaIlusao",
          },
          {
            platform: "instagram",
            type: "Carrossel — 5 frases",
            carousel: [
              { bg: "#3d3630", text: "#c9b896", accent: "#f7f5f0", title: "5 frases que mudam\na forma como te vês.", body: "", footer: "O Espelho da Ilusão", bgImage: "/images/espelho-ilusao.png" },
              { bg: "#f7f5f0", text: "#3d3630", accent: "#c9b896", title: "\"Via, mas não sentia.\nRegistava, mas não\nparticipava.\"", body: "Como quem assiste\na um espectáculo\npor trás de uma\njanela fechada.", footer: "" },
              { bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", title: "\"Não era que não\ntivesse opinião.\nEra que a sua primeira\nreacção nunca era\no que verdadeiramente\npensava.\"", body: "", footer: "" },
              { bg: "#ebe7df", text: "#3d3630", accent: "#c9b896", title: "\"A manhã era bonita\nde uma forma que\nnão pedia esforço\npara ser notada.\"", body: "Ela ainda não sabia\no que fazer com essa beleza.", footer: "" },
              { bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", title: "\"Perguntar,\nmesmo tarde,\né o primeiro gesto\nde se escolher.\"", body: "", footer: "seteveus.space", bgImage: "/images/mandala-7veus.png" },
            ],
            caption: "5 frases d'O Espelho da Ilusão que mudam a forma como te vês.\n\nGuarda esta publicação. Volta quando precisares.\n\n#OsSeteVeus #EspelhoDaIlusao #Citacoes #FiccaoPsicologica #Autoconhecimento",
          },
          {
            platform: "instagram",
            type: "Teaser — Nó da Herança",
            visual: {
              bg: "#1a1a2e", text: "#f7f5f0", accent: "#c9b896", format: "square",
              title: "A mãe sempre viu.\nEsperou anos.",
              body: "Agora que Sara acordou,\nHelena tem algo\npara lhe dizer.\n\nO Nó da Herança.",
              footer: "Disponível após completar o Espelho",
            },
            caption: "Sara viu o véu.\n\nMas há um nó que ficou por desatar — o silêncio herdado entre mãe e filha.\n\nO Nó da Herança está disponível para quem completou O Espelho da Ilusão.\n\n#OsSeteVeus #NoDaHeranca #FiccaoRelacional",
          },
          {
            platform: "whatsapp",
            type: "WhatsApp Status",
            carousel: [
              { bg: "#3d3630", text: "#c9b896", accent: "#f7f5f0", title: "\"Quando foi que\nescolhi tomar café\nem vez de chá?\"", body: "Uma pergunta absurda\nque muda tudo.\n\nO Espelho da Ilusão.", footer: "seteveus.space" },
            ],
            caption: "\"Quando foi que escolhi tomar café em vez de chá?\"\n\nUma pergunta absurda. Que não pede resposta. Só atenção.\n\nO Espelho da Ilusão — seteveus.space\n\n#OsSeteVeus #EspelhoDaIlusao",
          },
        ],
      },
      {
        day: "Espelho do Medo",
        dayShort: "Medo",
        theme: "O que o medo calou",
        slots: [
          {
            platform: "instagram",
            type: "Post Feed",
            visual: {
              bg: "#0d1b2a", text: "#f7f5f0", accent: "#7a8c6e", format: "square",
              title: "O medo é humano.\nViver uma vida inteira\nem função dele\né outra coisa.",
              body: "E essa outra coisa\npode mudar.",
              footer: "O Espelho do Medo",
            },
            caption: "O medo avisa. É o seu trabalho.\n\nMas há um ponto em que deixamos de ouvi-lo como aviso e começamos a vivê-lo como instrução.\n\nO Espelho do Medo é sobre o Rui — e sobre o que ele só conseguiu dizer quando parou de obedecer a essa instrução.\n\nReconheces?\n\n#OsSeteVeus #EspelhoDoMedo #FiccaoPsicologica #Autoconhecimento",
          },
          {
            platform: "instagram",
            type: "Carrossel — 5 frases",
            carousel: [
              { bg: "#0d1b2a", text: "#7a8c6e", accent: "#f7f5f0", title: "5 frases d'O\nEspelho do Medo.", body: "", footer: "", bgImage: "/images/espelho-medo.png" },
              { bg: "#f7f5f0", text: "#3d3630", accent: "#7a8c6e", title: "\"E se os dedos\nque um dia desenharam\nmuseus impossíveis\nainda souberem\nmover-se?\"", body: "", footer: "" },
              { bg: "#0d1b2a", text: "#f7f5f0", accent: "#7a8c6e", title: "\"A sede de quem\npassou tanto tempo\nsem beber que\nse esqueceu\nde que tinha sede.\"", body: "", footer: "" },
              { bg: "#ebe7df", text: "#3d3630", accent: "#7a8c6e", title: "\"Ver o medo.\nE continuar\nmesmo assim.\"", body: "Não é fraqueza.\nÉ o custo que parece\nmaior do que o custo de ficar.", footer: "" },
              { bg: "#0d1b2a", text: "#f7f5f0", accent: "#7a8c6e", title: "\"Há agora\num talvez.\"", body: "Minúsculo. Frágil.\nQuase inaudível.\nMas novo.\nÉ a primeira coisa viva.", footer: "O Espelho do Medo", bgImage: "/images/mandala-7veus.png" },
            ],
            caption: "Frases d'O Espelho do Medo — porque às vezes precisamos ler para reconhecer o que sempre soubemos.\n\nGuarda para voltares quando precisares.\n\n#OsSeteVeus #EspelhoDoMedo #Citacoes #FiccaoPsicologica",
          },
          {
            platform: "instagram",
            type: "Teaser — Nó do Silêncio",
            visual: {
              bg: "#0d1b2a", text: "#f7f5f0", accent: "#7a8c6e", format: "square",
              title: "Há coisas que\nficaram por dizer\nentre o Rui e a Ana.",
              body: "O Nó do Silêncio.\nEm breve.",
              footer: "Os Sete Véus",
            },
            caption: "O Rui e a Ana.\n\nO que ficou por dizer entre eles — o que nunca chegou a ter palavras.\n\nO Nó do Silêncio — em breve, para quem completar O Espelho do Medo.\n\n#OsSeteVeus #NodoSilencio #EmBreve",
          },
          {
            platform: "whatsapp",
            type: "WhatsApp Status",
            carousel: [
              { bg: "#0d1b2a", text: "#f7f5f0", accent: "#7a8c6e", title: "O medo é humano.\nViver uma vida\nem função dele\né outra coisa.", body: "E essa outra coisa\npode mudar.\n\nO Espelho do Medo.", footer: "seteveus.space" },
            ],
            caption: "O Espelho do Medo está disponível.\n\nÉ sobre o Rui — e sobre o que o medo calou durante anos.\n\nReconheces-te?\n\nseteveus.space\n\n#OsSeteVeus #EspelhoDoMedo",
          },
        ],
      },
      {
        day: "Em breve",
        dayShort: "→",
        theme: "Culpa · Identidade · Controlo · Desejo · Separação",
        slots: [
          {
            platform: "instagram",
            type: "Post — Espelho da Culpa",
            visual: {
              bg: "#c97070", text: "#f7f5f0", accent: "#ebe7df", format: "square",
              title: "Fazes tanto\npelos outros\nque querer algo\nso para ti\nparece um erro.",
              body: "",
              footer: "O Espelho da Culpa ~ Abril 2026",
            },
            caption: "Não é culpa de ter feito algo errado.\n\nÉ culpa de querer. De existir com necessidades. De não caber no papel que te atribuíram.\n\nO Espelho da Culpa — Abril 2026.\n\n#OsSeteVeus #EspelhoDaCulpa",
          },
          {
            platform: "instagram",
            type: "Post — Espelho da Identidade",
            visual: {
              bg: "#7a7a9e", text: "#f7f5f0", accent: "#ebe7df", format: "square",
              title: "Se tiras o papel\nde mãe, de filha,\nde profissional —\no que sobra?",
              body: "",
              footer: "O Espelho da Identidade ~ Maio 2026",
            },
            caption: "Não é uma pergunta com resposta rápida.\n\nÉ a pergunta que o Espelho da Identidade faz devagar — capítulo a capítulo — até surgir algo que é teu, não construído para agradar.\n\nMaio 2026.\n\n#OsSeteVeus #EspelhoDaIdentidade",
          },
          {
            platform: "instagram",
            type: "Post — Espelhos 5-7",
            visual: {
              bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", format: "square",
              title: "Três histórias\nainda por vir.",
              body: "Controlo — Junho\nDesejo — Julho\nSeparação — Agosto",
              footer: "Os Sete Espelhos ~ seteveus.space",
            },
            caption: "Cada espelho é uma personagem.\nCada personagem vive o que calavas.\n\nControlo. Desejo. Separação.\n\nÀ medida que chegam, estão cá.\n\n#OsSeteVeus #EmBreve",
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // TEMA 3 — NÓS
  // O que se passa entre duas pessoas quando um véu cai
  // ══════════════════════════════════════════════════════════════════════════
  {
    weekNumber: 3,
    title: "Nós",
    subtitle: "O que se passa entre duas pessoas quando um véu cai",
    days: [
      {
        day: "O que são os Nós",
        dayShort: "Intro",
        theme: "Não são sequelas. São o que ficou por dizer.",
        slots: [
          {
            platform: "instagram",
            type: "Carrossel — explicação",
            carousel: [
              { bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", title: "Há histórias\nque só existem\nentre duas pessoas.", body: "", footer: "Os Nós" },
              { bg: "#f7f5f0", text: "#3d3630", accent: "#3d3630", title: "Nos Espelhos,\nvês-te a ti mesma.", body: "A Sara. O Rui. A Luísa.\nPersonagens que se tornam\nesperhos.", footer: "" },
              { bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", title: "Nos Nós,\nvês o que se\npassou entre ti\ne alguém.", body: "O silêncio herdado.\nO medo que calou.\nA culpa disfarçada.", footer: "" },
              { bg: "#ebe7df", text: "#3d3630", accent: "#c9b896", title: "Só lês o Nó\nse viveste\no Espelho.", body: "Não é uma regra.\nÉ uma continuação.", footer: "Os Sete Véus" },
            ],
            caption: "Os Nós não são sequelas.\n\nSão o que ficou por dizer. O que se passou do outro lado da história — entre duas pessoas quando um véu cai.\n\nCada Espelho tem um Nó que lhe corresponde. E só abre depois de teres vivido o Espelho.\n\n#OsSeteVeus #OsNos #FiccaoRelacional",
          },
        ],
      },
      {
        day: "Nó da Herança",
        dayShort: "Her",
        theme: "O silêncio herdado entre mãe e filha",
        slots: [
          {
            platform: "instagram",
            type: "Post Feed",
            visual: {
              bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", format: "square",
              title: "A mãe sempre viu.\nEsperou anos.\n\nAgora que Sara\nacordou, Helena\ntem algo para\nlhe dizer.",
              body: "",
              footer: "O Nó da Herança",
            },
            caption: "O Nó da Herança não é uma continuação.\n\nÉ o que ficou por dizer.\n\nQuando Sara viu o véu da ilusão, não estava sozinha nessa jornada. A Helena — a mãe — viu tudo. E esperou.\n\nDisponível para quem completou O Espelho da Ilusão.\n\n#OsSeteVeus #NoDaHeranca #FiccaoRelacional #MaeFilha",
          },
          {
            platform: "whatsapp",
            type: "WhatsApp Status",
            carousel: [
              { bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", title: "A mãe sempre viu.\nEsperou anos.\n\nAgora que Sara\nacordou, Helena\ntem algo para\nlhe dizer.", body: "", footer: "O Nó da Herança" },
            ],
            caption: "Completaste O Espelho da Ilusão?\n\nHá algo que ficou por dizer.\n\nO Nó da Herança — disponível em seteveus.space\n\n#OsSeteVeus #NoDaHeranca",
          },
        ],
      },
      {
        day: "Em breve",
        dayShort: "→",
        theme: "Os restantes Nós acompanham os Espelhos",
        slots: [
          {
            platform: "instagram",
            type: "Post — Nó do Silêncio",
            visual: {
              bg: "#0d1b2a", text: "#f7f5f0", accent: "#7a8c6e", format: "square",
              title: "O medo calou\ntudo o que\nele queria dizer.",
              body: "O Nó do Silêncio.\nEm breve.",
              footer: "Os Sete Véus",
            },
            caption: "O Rui e a Ana.\n\nO que ficou por dizer quando o medo governou.\n\nO Nó do Silêncio — em breve, para quem completar O Espelho do Medo.\n\n#OsSeteVeus #NodoSilencio #EmBreve",
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // TEMA 4 — COMUNIDADE
  // Ecos — onde as vozes se encontram
  // ══════════════════════════════════════════════════════════════════════════
  {
    weekNumber: 4,
    title: "Comunidade",
    subtitle: "Ecos — reflexões anónimas. Tudo desaparece.",
    days: [
      {
        day: "O que são os Ecos",
        dayShort: "Ecos",
        theme: "Reflexões anónimas. Tudo impermanente.",
        slots: [
          {
            platform: "instagram",
            type: "Post Feed",
            visual: {
              bg: "#1a1a2e", text: "#f7f5f0", accent: "#7a8c6e", format: "square",
              title: "As tuas palavras\ndesaparecem\nem 30 dias.\n\nMas antes,\nalguém se\nreconheceu nelas.",
              body: "",
              footer: "Comunidade Ecos",
            },
            caption: "Na Comunidade Ecos não há nomes. Não há likes.\n\nHá ecos — reflexões que partilhas e que expiram em 30 dias. E há reconhecimentos — o gesto silencioso de dizer \"reconheço-me nisto\".\n\nTudo impermanente. Tudo real.\n\nIncluído com qualquer acesso à plataforma.\n\n#OsSeteVeus #ComunidadeEcos #ReflexoesAnonimas",
          },
          {
            platform: "instagram",
            type: "Carrossel — como funciona",
            carousel: [
              { bg: "#1a1a2e", text: "#f7f5f0", accent: "#7a8c6e", title: "Lês sozinha.\nMas não\nestás só.", body: "", footer: "Comunidade Ecos" },
              { bg: "#f7f5f0", text: "#3d3630", accent: "#7a8c6e", title: "Ecos", body: "Reflexões anónimas.\nPartilhas o que sentiste.\nExpira em 30 dias.", footer: "" },
              { bg: "#1a1a2e", text: "#f7f5f0", accent: "#7a8c6e", title: "Reconhecimentos", body: "Não há likes.\nHá \"reconheço-me\".\n\nUma diferença\nque muda tudo.", footer: "" },
              { bg: "#f7f5f0", text: "#3d3630", accent: "#7a8c6e", title: "Sussurros", body: "Uma mensagem\nde uma só via.\nExpira em 7 dias\nou depois de ser lida.", footer: "" },
              { bg: "#1a1a2e", text: "#f7f5f0", accent: "#7a8c6e", title: "Sem nomes.\nSem fotos.\nTudo desaparece.", body: "Mas o reconhecimento\nfica.", footer: "seteveus.space/comunidade" },
            ],
            caption: "A Comunidade Ecos não é uma rede social.\n\nÉ um espaço de reconhecimento silencioso — onde partilhas o que sentiste e outra pessoa, algures, diz \"eu também\".\n\nSem nomes. Sem fotos. Tudo desaparece.\n\n#OsSeteVeus #ComunidadeEcos #ReflexoesAnonimas #Comunidade",
          },
        ],
      },
      {
        day: "Vozes da Comunidade",
        dayShort: "Vozes",
        theme: "O que dizem as leitoras",
        slots: [
          {
            platform: "instagram",
            type: "Eco anónimo — Espelho da Ilusão",
            visual: {
              bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", format: "square",
              title: "\"saí do modo automático.\nnão sei para onde vou\nmas pelo menos\nestou acordada.\"",
              body: "",
              footer: "~ leitora anónima, Espelho da Ilusão",
            },
            caption: "Isto chegou-me através da Comunidade Ecos.\n\nNão há nome. Não sei quem é. Mas sei que é real.\n\n\"saí do modo automático. não sei para onde vou mas pelo menos estou acordada.\"\n\nÉ assim que começa.\n\n#OsSeteVeus #ComunidadeEcos #EspelhoDaIlusao",
          },
          {
            platform: "instagram",
            type: "Eco anónimo — Espelho do Medo",
            visual: {
              bg: "#0d1b2a", text: "#f7f5f0", accent: "#7a8c6e", format: "square",
              title: "\"o silêncio entre nós\nnão era paz.\nera tudo o que\nnunca dissemos.\"",
              body: "",
              footer: "~ leitora anónima, Espelho do Medo",
            },
            caption: "Da Comunidade Ecos:\n\n\"o silêncio entre nós não era paz. era tudo o que nunca dissemos.\"\n\nÀs vezes a frase certa de outra pessoa torna-se tua.\n\n#OsSeteVeus #ComunidadeEcos #EspelhoDoMedo",
          },
          {
            platform: "instagram",
            type: "Eco anónimo — Reconhecimento",
            visual: {
              bg: "#f7f5f0", text: "#3d3630", accent: "#7a8c6e", format: "square",
              title: "\"chorei no banho.\noutra vez.\nmas desta vez\nnão foi por tristeza.\nfoi por reconhecimento.\"",
              body: "",
              footer: "~ leitora anónima, Espelho da Ilusão",
            },
            caption: "\"chorei no banho. outra vez. mas desta vez não foi por tristeza. foi por reconhecimento.\"\n\nIsso é o que acontece quando algo que leste te devolve algo que sempre soubeste.\n\nDa Comunidade Ecos.\n\n#OsSeteVeus #ComunidadeEcos #Reconhecimento",
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // TEMA 5 — REFLEXÕES
  // Frases, perguntas e observações da autora
  // ══════════════════════════════════════════════════════════════════════════
  {
    weekNumber: 5,
    title: "Reflexões",
    subtitle: "Frases, perguntas e observações da autora",
    days: [
      {
        day: "Há mais para ti",
        dayShort: "Assin",
        theme: "A assinatura da Vivianne",
        slots: [
          {
            platform: "instagram",
            type: "Post Feed",
            visual: {
              bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", format: "square",
              title: "Há mais para ti.",
              body: "Não como promessa.\nComo observação.\nDe alguém que\ntambém passou por aqui.",
              footer: "seteveus.space",
            },
            caption: "Há mais para ti.\n\nNão estou a dizer que a tua vida está errada. Não estou a dizer que precisas de mudar.\n\nEstou a dizer que vejo em ti algo que talvez ainda não vejas. E que há um caminho — não um destino — para explorar.\n\nIsso é tudo.\n\n#OsSeteVeus #HaMaisParaTi #Autoconhecimento",
          },
          {
            platform: "instagram",
            type: "Post Feed — O mundo convida",
            visual: {
              bg: "#ebe7df", text: "#3d3630", accent: "#c9b896", format: "square",
              title: "A manhã era bonita\nde uma forma que\nnão pedia esforço\npara ser notada.",
              body: "Ela ainda não sabia\no que fazer com essa beleza.",
              footer: "Os Sete Véus",
            },
            caption: "Isto é do Espelho da Ilusão. Sara, pela primeira vez, parou e reparou na manhã.\n\nNão fez nada com isso. Só ficou ali.\n\nDurante quanto tempo é que acordas e já estás a pensar no que tens de fazer?\n\nIsso mesmo. Esse espaço entre acordar e começar — onde foi parar?\n\n#OsSeteVeus #EspelhoDaIlusao #Reflexao #Autoconhecimento",
          },
        ],
      },
      {
        day: "Perguntas abertas",
        dayShort: "Perg",
        theme: "Perguntas que não precisam de resposta imediata",
        slots: [
          {
            platform: "instagram",
            type: "Post Feed",
            visual: {
              bg: "#2a2420", text: "#f7f5f0", accent: "#c9b896", format: "square",
              title: "Quando foi a última\nvez que fizeste\nalgo só porque\nquiseste?",
              body: "Sem explicar.\nSem pedir licença.",
              footer: "Os Sete Véus",
            },
            caption: "Quando foi a última vez que fizeste algo só porque quiseste?\n\nSem explicar a ninguém. Sem pedir desculpa por querer. Sem justificar a escolha.\n\nNão precisa de resposta agora. Só de atenção.\n\n#OsSeteVeus #PerguntasAbertas #Autoconhecimento #Reflexao",
          },
          {
            platform: "instagram",
            type: "Post Feed",
            visual: {
              bg: "#f7f5f0", text: "#3d3630", accent: "#c9b896", format: "square",
              title: "O que perdeste\nno caminho de\nte tornares\nquem se espera\nque sejas?",
              body: "",
              footer: "Os Sete Véus",
            },
            caption: "O que perdeste?\n\nNão no sentido de tragédia. No sentido de: há partes de ti que foram ficando para trás, silenciadas, por parecarem inconvenientes.\n\nQue partes são essas?\n\nNão precisas de responder. Só de deixar a pergunta estar.\n\n#OsSeteVeus #PerguntasAbertas #Reflexao #Autoconhecimento",
          },
          {
            platform: "instagram",
            type: "Post Feed — O corpo lembra",
            visual: {
              bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", format: "square",
              title: "O corpo sabe\ncoisas que a mente\ndemora a aceitar.",
              body: "O aperto no peito\nnão é apenas tensão.\nÉ informação.",
              footer: "Os Sete Véus",
            },
            caption: "O corpo é o primeiro a saber.\n\nAntes de a mente nomear o que sente, o corpo já registou — o aperto no peito, a tensão nos ombros, a fadiga que não é de trabalho.\n\nNão é fraqueza. É informação.\n\nO que está o teu corpo a tentar dizer-te?\n\n#OsSeteVeus #OCorpoLembra #Autoconhecimento #Reflexao",
          },
          {
            platform: "instagram",
            type: "Reel — script",
            reelScript: {
              hook: "Há uma pergunta que ninguém te faz. E que talvez precises de te fazer a ti mesma.",
              scenes: [
                "Close nos olhos de alguém — câmara lenta. Silêncio.",
                "Texto aparece: \"Quando foi a última vez que fizeste algo só porque quiseste?\"",
                "Imagens quotidianas: mãos a escrever, janela com chuva, chávena ao amanhecer.",
                "Voz calma (off): \"Sem explicar. Sem pedir licença. Só porque quiseste.\"",
                "Texto final: \"Há mais para ti.\" + logo Os Sete Véus",
              ],
              cta: "Descobre em seteveus.space",
              music: "Música ambiente suave — piano ou natureza. Sem letra.",
              duration: "20-30s",
            },
            caption: "Quando foi a última vez que fizeste algo só porque quiseste?\n\nSem justificar. Sem pedir desculpa.\n\nEssa pergunta é o início.\n\n#OsSeteVeus #Autoconhecimento #Reflexao #Reels",
          },
        ],
      },
      {
        day: "O corpo lembra",
        dayShort: "Corpo",
        theme: "O corpo como testemunha",
        slots: [
          {
            platform: "instagram",
            type: "Carrossel — 5 formas de reconhecer",
            carousel: [
              { bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", title: "5 sinais de que\nalgo em ti\nestá a acordar.", body: "", footer: "Guarda esta publicação." },
              { bg: "#f7f5f0", text: "#3d3630", accent: "#c9b896", title: "O mundo aparece bonito\ne tu não sabes\no que fazer com isso.", body: "Não estás habituada\na receber sem mereceres.", footer: "" },
              { bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", title: "O corpo diz algo\nantes de a mente\nconseguir nomear.", body: "O aperto no peito.\nA tensão nos ombros.\nIsso é informação.", footer: "" },
              { bg: "#ebe7df", text: "#3d3630", accent: "#c9b896", title: "Não precisas de estar\npartida para reconhecer\no que não funciona.", body: "Às vezes é só\numa pergunta pequena\nque não cala.", footer: "" },
              { bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896", title: "Começas a observar-te\nsem te julgar logo\na seguir.", body: "É diferente\ndo que parece.\nE demora.", footer: "" },
              { bg: "#f7f5f0", text: "#3d3630", accent: "#c9b896", title: "As coisas mais difíceis\ncomeçam a poder\nser ditas.", body: "Devagar.\nSem drama.\nSó verdade.", footer: "Os Sete Véus" },
            ],
            caption: "Não é sobre saber tudo. É sobre reparar.\n\nO mundo convida. O corpo lembra. A fissura é a entrada da luz.\n\nIsso é o suficiente para começar.\n\n#OsSeteVeus #Reflexao #Autoconhecimento #PresencaCompassiva",
          },
        ],
      },
    ],
  },
];

// ─── CARROSSEIS PROFISSIONAIS (slide a slide) ────────────────────────────────

export type ProfessionalCarousel = {
  id: string;
  title: string;
  description: string;
  slides: CarouselSlide[];
  caption: string;
  canvaSpecs: {
    dimensions: string;
    fonts: string;
    colorPalette: string[];
  };
};


export const professionalCarousels: ProfessionalCarousel[] = [

  // ─── 1. RECONHECIMENTO — o gancho ────────────────────────────────────────────
  {
    id: "carousel-cansaco-automatico",
    title: "Há um tipo de cansaço que não é sono",
    description: "Gancho de reconhecimento. Para mulheres que funcionam bem mas sentem que estão a assistir à própria vida. Primeiro carrossel a publicar.",
    slides: [
      {
        bg: "#2a2520", text: "#f7f5f0", accent: "#c9b896",
        title: "Há um tipo\nde cansaço\nque não é sono.",
        body: "", footer: "Espelho da Ilusão",
        bgImage: "/images/mandala-7veus.png",
      },
      {
        bg: "#f7f5f0", text: "#3d3630", accent: "#c9b896",
        title: "Acordas.\nFazes o que tens de fazer.\nAs coisas funcionam.",
        body: "És competente.\nEficiente.\nE sentes-te a assistir.",
        footer: "Espelho da Ilusão",
      },
      {
        bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896",
        title: "Não é depressão.\nNão é ingratidão.",
        body: "É algo mais subtil:\na sensação de que\na vida é quase tua.",
        footer: "Espelho da Ilusão",
      },
      {
        bg: "#f7f5f0", text: "#3d3630", accent: "#c9b896",
        title: "Como se um dia,\nsem aviso,\ntivesses parado\nde escolher.",
        body: "E continuado a funcionar.",
        footer: "Espelho da Ilusão",
      },
      {
        bg: "#2a2520", text: "#c9b896", accent: "#f7f5f0",
        title: "Reconheces-te?",
        body: "Há uma história sobre isto.\nE sobre a mulher\nque, numa manhã comum,\ndecidiu perguntar.",
        footer: "Espelho da Ilusão ~ seteveus.space",
        bgImage: "/images/espelho-ilusao.png",
      },
    ],
    caption: "Há um tipo de cansaço que não é sono.\n\nÉ o de fazer exactamente o que se espera de ti — bem — e sentires que estás a assistir. Que a vida funciona, mas não é bem tua.\n\nO Espelho da Ilusão é uma história sobre isso.\n\nSe te reconheceste — envia a quem mais precisa de ouvir isto.\n\nseteveus.space\n\n#OsSeteVeus #EspelhoDaIlusao",
    canvaSpecs: {
      dimensions: "1080x1080px (quadrado)",
      fonts: "Título: Playfair Display / Corpo: Inter Light",
      colorPalette: ["#2a2520", "#f7f5f0", "#3d3630", "#c9b896"],
    },
  },

  // ─── 2. INTRODUÇÃO À SARA ────────────────────────────────────────────────────
  {
    id: "carousel-sara-pergunta",
    title: "Sara fez uma pergunta absurda",
    description: "Apresenta a personagem Sara sem dizer que é um livro. A história puxa antes do produto aparecer.",
    slides: [
      {
        bg: "#3d3630", text: "#c9b896", accent: "#f7f5f0",
        title: "\"Quando foi que\nescolhi tomar café\nem vez de chá?\"",
        body: "", footer: "Sara ~ Espelho da Ilusão",
        bgImage: "/images/espelho-ilusao.png",
      },
      {
        bg: "#f7f5f0", text: "#3d3630", accent: "#c9b896",
        title: "Era uma pergunta\nsem importância.",
        body: "Sara sabia isso.\nE não conseguia\ndeixar de a fazer.",
        footer: "Espelho da Ilusão",
      },
      {
        bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896",
        title: "Porque depois de café vs chá,\nvinha a roupa que usava.",
        body: "O trabalho que tinha.\nA vida que levava.\n\nE se tudo tinha sido assim —\nrecebido, não escolhido?",
        footer: "Espelho da Ilusão",
      },
      {
        bg: "#ebe7df", text: "#3d3630", accent: "#c9b896",
        title: "Isto não é uma crise.",
        body: "É um acordar.\nDevagar.\nAo ritmo de quem\nprimeiro tem de notar.",
        footer: "Espelho da Ilusão",
      },
      {
        bg: "#2a2520", text: "#c9b896", accent: "#f7f5f0",
        title: "A história de Sara\né um espelho.",
        body: "O que ela vê, talvez vejas.\nO que ela pergunta,\ntalvez precises de perguntar.",
        footer: "Espelho da Ilusão ~ seteveus.space",
      },
    ],
    caption: "\"Quando foi que escolhi tomar café em vez de chá?\"\n\nÉ uma pergunta absurda. Sara sabe isso.\n\nMas depois de café vs chá, vinha a roupa, o trabalho, a vida. E a pergunta já não era absurda.\n\nO Espelho da Ilusão — seteveus.space\n\n#OsSeteVeus #EspelhoDaIlusao",
    canvaSpecs: {
      dimensions: "1080x1080px (quadrado)",
      fonts: "Citações: Playfair Display Italic / Corpo: Inter Light",
      colorPalette: ["#3d3630", "#f7f5f0", "#c9b896", "#ebe7df"],
    },
  },

  // ─── 3. O QUE SÃO OS ESPELHOS ────────────────────────────────────────────────
  {
    id: "carousel-o-que-sao-espelhos",
    title: "O que são os Espelhos (sem usar a palavra livro)",
    description: "Apresenta os Espelhos como experiência emocional, não como produto. Para quem ainda não conhece.",
    slides: [
      {
        bg: "#1a1814", text: "#f7f5f0", accent: "#c9b896",
        title: "Às vezes precisas\nde ver a tua vida\nnoutros olhos\npara reconhecer os teus.",
        body: "", footer: "Os Espelhos ~ seteveus.space",
        bgImage: "/images/mandala-7veus.png",
      },
      {
        bg: "#f7f5f0", text: "#3d3630", accent: "#c9b896",
        title: "Os Espelhos são histórias.",
        body: "Ficção.\nMas a personagem\nvive o que tu calavas.",
        footer: "Os Espelhos ~ seteveus.space",
      },
      {
        bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896",
        title: "Não te dizem\no que fazer.",
        body: "Não te ensinam nada.\nDeixam-te reconhecer\no que já sabes.",
        footer: "Os Espelhos ~ seteveus.space",
      },
      {
        bg: "#ebe7df", text: "#3d3630", accent: "#c9b896",
        title: "São 7 histórias.",
        body: "Cada uma revela um véu:\nIlusão. Medo. Culpa.\nIdentidade. Controlo.\nDesejo. Separação.",
        footer: "Os Espelhos ~ seteveus.space",
      },
      {
        bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896",
        title: "Lês ao teu ritmo.\nCapítulo a capítulo.",
        body: "Com um diário pessoal.\nE uma comunidade\nque desaparece.",
        footer: "Os Espelhos ~ seteveus.space",
      },
      {
        bg: "#2a2520", text: "#c9b896", accent: "#f7f5f0",
        title: "Começa pelo\nEspelho da Ilusão.",
        body: "", footer: "Os Espelhos ~ seteveus.space/experiencias",
        bgImage: "/images/mandala-7veus.png",
      },
    ],
    caption: "Não é autoajuda. É ficção.\n\nMas a personagem vive o que tu calavas. E isso muda tudo na forma como lês — porque não estás a aprender. Estás a reconhecer.\n\nOs Espelhos — 7 histórias que te devolvem ao que já sabes.\n\nGuarda este post. Volta quando precisares de lembrar o que és de verdade.\n\nEnvia a alguém que ainda não parou para perguntar.\n\nseteveus.space/experiencias\n\n#OsSeteVeus #FiccaoInterior",
    canvaSpecs: {
      dimensions: "1080x1080px (quadrado)",
      fonts: "Título: Playfair Display / Corpo: Inter Light",
      colorPalette: ["#1a1814", "#f7f5f0", "#3d3630", "#c9b896", "#ebe7df"],
    },
  },

  // ─── 4. O NÓ — O DIFERENCIAL MAIS PODEROSO ───────────────────────────────────
  {
    id: "carousel-no-depois-do-espelho",
    title: "A história que só existe depois",
    description: "Explica o Nó da Herança. O conceito de desbloqueio emocional é único — nenhum outro produto faz isto. Para quem já leu ou está a ler o Espelho.",
    slides: [
      {
        bg: "#3d3630", text: "#c9b896", accent: "#f7f5f0",
        title: "Há uma segunda história.\nSó existe depois da primeira.",
        body: "", footer: "Nó da Herança ~ Véu da Ilusão",
        bgImage: "/images/capa-no-herança2.png",
      },
      {
        bg: "#f7f5f0", text: "#3d3630", accent: "#c9b896",
        title: "Quando Sara completou\no Espelho da Ilusão,\num texto novo abriu.",
        body: "A história de Helena.\nA mãe.",
        footer: "Nó da Herança",
      },
      {
        bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896",
        title: "Helena sempre soube.",
        body: "Viu os mesmos sinais\nque Sara não via.\nCalou os mesmos medos.\nEsperou anos.",
        footer: "Nó da Herança",
      },
      {
        bg: "#ebe7df", text: "#3d3630", accent: "#c9b896",
        title: "\"Agora que Sara\nacordou,\nHelena tem algo\npara lhe dizer.\"",
        body: "", footer: "Nó da Herança",
      },
      {
        bg: "#2a2520", text: "#f7f5f0", accent: "#c9b896",
        title: "O Nó não é\numa continuação.",
        body: "É o que estava a acontecer\ndo outro lado.\nSó se vê depois\nde ver o espelho.",
        footer: "Nó da Herança",
      },
      {
        bg: "#3d3630", text: "#c9b896", accent: "#f7f5f0",
        title: "O Nó da Herança.",
        body: "Disponível para quem\ncompletou o Espelho da Ilusão.",
        footer: "Nó da Herança ~ seteveus.space",
      },
    ],
    caption: "Há uma segunda história. Mas só se desbloqueia depois.\n\nQuando Sara viu o que tinha de ver, um texto novo apareceu — a história de Helena, a mãe. O que ela sempre soube e nunca disse.\n\nO Nó da Herança não é um upsell. É o que acontece do outro lado do espelho.\n\nHá alguém na tua vida com quem tens um nó por desatar?\n\nEnvia-lhe este carrossel.\n\n#OsSeteVeus #NoDaHeranca #MaeFilha",
    canvaSpecs: {
      dimensions: "1080x1080px (quadrado)",
      fonts: "Título: Playfair Display Italic / Corpo: Inter Light",
      colorPalette: ["#3d3630", "#f7f5f0", "#c9b896", "#ebe7df"],
    },
  },

  // ─── 5. CINCO CITAÇÕES DO ESPELHO DA ILUSÃO ──────────────────────────────────
  {
    id: "carousel-5-citacoes-ilusao",
    title: "5 frases do Espelho da Ilusão",
    description: "Citações reais do livro. Cada uma é um momento de reconhecimento. Altamente guardável.",
    slides: [
      {
        bg: "#3d3630", text: "#c9b896", accent: "#f7f5f0",
        title: "5 frases que mudam\na forma como te vês.",
        body: "", footer: "O Espelho da Ilusão",
        bgImage: "/images/espelho-ilusao.png",
      },
      {
        bg: "#f7f5f0", text: "#3d3630", accent: "#c9b896",
        title: "\"Quando foi que\nescolhi tomar café\nem vez de chá?\"",
        body: "Uma pergunta absurda\nque muda tudo.",
        footer: "O Espelho da Ilusão",
      },
      {
        bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896",
        title: "\"Via, mas não sentia.\nRegistava, mas não\nparticipava.\"",
        body: "Como quem assiste\na um espectáculo\npor trás de uma\njanela fechada.",
        footer: "O Espelho da Ilusão",
      },
      {
        bg: "#ebe7df", text: "#3d3630", accent: "#c9b896",
        title: "\"Não era que não\ntivesse opinião.\nEra que a sua primeira\nreacção nunca era\no que verdadeiramente\npensava.\"",
        body: "", footer: "O Espelho da Ilusão",
      },
      {
        bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896",
        title: "\"Perguntar,\nmesmo tarde,\né o primeiro gesto\nde se escolher.\"",
        body: "", footer: "O Espelho da Ilusão ~ seteveus.space",
        bgImage: "/images/mandala-7veus.png",
      },
    ],
    caption: "5 frases do Espelho da Ilusão que mudam a forma como te vês.\n\nGuarda esta publicação. Volta quando precisares de te reencontrar.\n\nQual das 5 te tocou mais? Responde nos comentários.\n\nEnvia a quem precisar de ouvir pelo menos uma.\n\n#OsSeteVeus #EspelhoDaIlusao #FrasesQueTransformam",
    canvaSpecs: {
      dimensions: "1080x1080px (quadrado)",
      fonts: "Citações: Playfair Display Italic / Corpo: Inter Light",
      colorPalette: ["#3d3630", "#f7f5f0", "#c9b896", "#ebe7df"],
    },
  },

  // ─── 6. A COMUNIDADE QUE DESAPARECE ──────────────────────────────────────────
  {
    id: "carousel-ecos-efemeros",
    title: "A única comunidade onde tudo desaparece",
    description: "Apresenta os Ecos pelo que os torna únicos: a efemeridade e o anonimato. Contrasta com todas as comunidades que existem.",
    slides: [
      {
        bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896",
        title: "O que escreveres aqui\ndesaparece em 30 dias.",
        body: "Não há histórico.\nNão há perfil.\nNinguém sabe quem és.",
        footer: "Comunidade Ecos ~ Os Sete Véus",
      },
      {
        bg: "#f7f5f0", text: "#3d3630", accent: "#7a8c6e",
        title: "E isso muda\no que dizes.",
        body: "Há coisas que só se\nconsegue dizer\nquando não ficam\npara sempre.",
        footer: "Comunidade Ecos ~ Os Sete Véus",
      },
      {
        bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896",
        title: "Não há likes.",
        body: "Há reconhecimentos.\nUm toque silencioso\nque diz:\n\"eu também.\"",
        footer: "Comunidade Ecos ~ Os Sete Véus",
      },
      {
        bg: "#ebe7df", text: "#3d3630", accent: "#7a8c6e",
        title: "E há sussurros.",
        body: "Mensagens de uma só via.\n100 caracteres.\nExpiram em 7 dias.",
        footer: "Comunidade Ecos ~ Os Sete Véus",
      },
      {
        bg: "#2a2520", text: "#c9b896", accent: "#f7f5f0",
        title: "É o único sítio\nonde a honestidade\nnão tem\nconsequências permanentes.",
        body: "", footer: "Comunidade Ecos ~ seteveus.space",
        bgImage: "/images/mandala-7veus.png",
      },
    ],
    caption: "O que escreveres desaparece em 30 dias.\n\nNão há perfil. Não há histórico. Ninguém sabe quem és. É a única comunidade onde a honestidade não fica para sempre.\n\nConheces alguém que se sente julgada nas redes sociais? Envia-lhe este carrossel.\n\nComunidade Ecos — incluída em qualquer acesso.\n\nseteveus.space\n\n#OsSeteVeus #ComunidadeEcos",
    canvaSpecs: {
      dimensions: "1080x1080px (quadrado)",
      fonts: "Título: Playfair Display / Corpo: Inter",
      colorPalette: ["#3d3630", "#f7f5f0", "#c9b896", "#7a8c6e", "#ebe7df"],
    },
  },

  // ─── 7. ANTES E DEPOIS — NÃO DE TI, DA FORMA COMO TE VÊS ─────────────────────
  {
    id: "carousel-antes-depois-ver",
    title: "Não muda o que fizeste. Muda a forma como te vês.",
    description: "Testemunhos-tipo. Antes/depois emocional, não de conquistas. Para quem está em cima do muro.",
    slides: [
      {
        bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896",
        title: "Não muda o que fizeste.\n\nMuda a forma como\nte vês a fazê-lo.",
        body: "", footer: "Espelho da Ilusão",
        bgImage: "/images/mandala-7veus.png",
      },
      {
        bg: "#f7f5f0", text: "#3d3630", accent: "#c9b896",
        title: "Antes:\nsabia exactamente\nquem era.",
        body: "Depois:\nsei cada vez menos.\nMas o que sei\né meu.\nNão herdado.",
        footer: "Espelho da Ilusão",
      },
      {
        bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896",
        title: "Antes:\nchorava só quando\nninguém via.",
        body: "Depois:\ndeixei as lágrimas virem\nà mesa.\nAlguém perguntou.\nDisse que não estava bem.\nO mundo não acabou.",
        footer: "Espelho da Ilusão",
      },
      {
        bg: "#ebe7df", text: "#3d3630", accent: "#c9b896",
        title: "Antes:\ndizia \"estou bem\"\nantes de verificar\no que sentia.",
        body: "Depois:\nfaço uma pausa.\nAinda pequena.\nMas minha.",
        footer: "Espelho da Ilusão",
      },
      {
        bg: "#2a2520", text: "#c9b896", accent: "#f7f5f0",
        title: "Não é uma transformação.\nÉ um desfazer\nlento e suave\ndo que não era teu.",
        body: "", footer: "Espelho da Ilusão ~ seteveus.space",
      },
    ],
    caption: "Não muda o que fizeste. Muda a forma como te vês a fazê-lo.\n\nAntes: sabia exactamente quem era.\nDepois: sei cada vez menos. Mas o que sei finalmente é meu.\n\nO Espelho da Ilusão — ao teu ritmo.\n\nseteveus.space\n\n#OsSeteVeus #EspelhoDaIlusao",
    canvaSpecs: {
      dimensions: "1080x1080px (quadrado)",
      fonts: "Título: Playfair Display / Corpo: Inter Light",
      colorPalette: ["#3d3630", "#f7f5f0", "#c9b896", "#ebe7df", "#2a2520"],
    },
  },

  // ─── 8. OS 7 ESPELHOS — UM POR UM ────────────────────────────────────────────
  {
    id: "carousel-7-espelhos-resumo",
    title: "Os 7 Espelhos — um por um",
    description: "Carrossel educativo. Cada slide apresenta um Espelho com frase-chave. Altamente guardável.",
    slides: [
      {
        bg: "#3d3630", text: "#c9b896", accent: "#f7f5f0",
        title: "Os 7 Espelhos\nque te revelam\nquem és de verdade.",
        body: "", footer: "Guarda esta publicação.",
        bgImage: "/images/mandala-7veus.png",
      },
      {
        bg: "#c9b896", text: "#3d3630", accent: "#f7f5f0",
        title: "Espelho 1 — Ilusão",
        body: "A vida que construíste\nsem perguntar\nse era a que querias.",
        footer: "Disponível agora",
      },
      {
        bg: "#8b9b8e", text: "#f7f5f0", accent: "#ebe7df",
        title: "Espelho 2 — Medo",
        body: "Sabes o que queres.\nMas o medo\ndecide antes de ti.",
        footer: "Março 2026",
      },
      {
        bg: "#c97070", text: "#f7f5f0", accent: "#ebe7df",
        title: "Espelho 3 — Culpa\nEspelho 4 — Identidade",
        body: "Castigas-te por quereres mais.\nUsas uma máscara há tanto tempo\nque esqueceste o rosto.",
        footer: "Abril · Maio 2026",
      },
      {
        bg: "#5a7a8a", text: "#f7f5f0", accent: "#ebe7df",
        title: "Espelho 5 — Controlo",
        body: "Seguras tudo.\nE perdes tudo\no que não se deixa prender.",
        footer: "Junho 2026",
      },
      {
        bg: "#7a5a6a", text: "#f7f5f0", accent: "#c9b896",
        title: "Espelho 6 — Desejo\nEspelho 7 — Separação",
        body: "Procuras fora o que só existe dentro.\nSepara-te de ti para pertencer ao mundo.",
        footer: "Julho · Agosto 2026",
      },
      {
        bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896",
        title: "Reconheces-te\nnalgum deles?",
        body: "Descobre em 3 minutos.",
        footer: "Os 7 Espelhos ~ seteveus.space/recursos/teste",
      },
    ],
    caption: "Os 7 Espelhos que te mostram o que já sabes:\n\n1. Ilusão — a vida que não escolheste\n2. Medo — o que não fazes por medo\n3. Culpa — o castigo de quereres mais\n4. Identidade — a máscara que usas\n5. Controlo — o que seguras a mais\n6. Desejo — o que procuras fora\n7. Separação — o que te separa de ti\n\nGuarda este post para voltares quando precisares.\n\nNum qual te reconheces mais? Responde nos comentários — é anónimo e faz a diferença.\n\n#OsSeteVeus #Os7Espelhos #Autoconhecimento",
    canvaSpecs: {
      dimensions: "1080x1080px (quadrado)",
      fonts: "Título: Playfair Display Bold / Subtítulo: Inter Light",
      colorPalette: ["#3d3630", "#c9b896", "#8b9b8e", "#c97070", "#7a7a9e", "#5a7a8a", "#8a6a7a"],
    },
  },

  // ─── 9. TESTEMUNHOS ───────────────────────────────────────────────────────────
  {
    id: "carousel-testemunhos",
    title: "O que dizem as leitoras",
    description: "Testemunhos reais (anónimos). Nomes guardados. Social proof com peso emocional.",
    slides: [
      {
        bg: "#3d3630", text: "#c9b896", accent: "#f7f5f0",
        title: "O que dizem\nas leitoras.",
        body: "", footer: "Espelho da Ilusão ~ Testemunhos reais",
      },
      {
        bg: "#f7f5f0", text: "#3d3630", accent: "#c9b896",
        title: "\"Sai do modo\nautomático.\nNão sei para onde vou\nmas pelo menos\nestou acordada.\"",
        body: "", footer: "~ leitora anónima, Espelho da Ilusão",
      },
      {
        bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896",
        title: "\"Chorei no banho.\nOutra vez.\nMas desta vez\nnão foi por tristeza.\nFoi por reconhecimento.\"",
        body: "", footer: "~ leitora anónima, Espelho da Ilusão",
      },
      {
        bg: "#ebe7df", text: "#3d3630", accent: "#c9b896",
        title: "\"O meu marido\nperguntou: estás bem?\nE eu disse que sim.\nAutomaticamente.\"",
        body: "Parei a meio\nda frase.", footer: "~ leitora anónima, Espelho da Ilusão",
      },
      {
        bg: "#f7f5f0", text: "#3d3630", accent: "#7a8c6e",
        title: "\"Este livro não te\ndá respostas.\nDá-te as perguntas\nque nunca fizeste.\"",
        body: "", footer: "~ leitora anónima, Espelho da Ilusão",
      },
      {
        bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896",
        title: "Reconheces-te?",
        body: "O Espelho da Ilusão\nestá disponível.",
        footer: "Espelho da Ilusão ~ seteveus.space",
      },
    ],
    caption: "\"Sai do modo automático. Não sei para onde vou mas pelo menos estou acordada.\"\n\n\"Chorei no banho. Outra vez. Mas desta vez não foi por tristeza. Foi por reconhecimento.\"\n\nO Espelho da Ilusão — seteveus.space\n\nEstas palavras foram escritas por mulheres reais. Não por uma campanha.\n\nConheces alguém que diria algo parecido? Envia-lhe.\n\n#OsSeteVeus #Testemunhos #Reconhecimento",
    canvaSpecs: {
      dimensions: "1080x1080px (quadrado)",
      fonts: "Citações: Playfair Display Italic / Fonte: Inter Light",
      colorPalette: ["#3d3630", "#f7f5f0", "#c9b896", "#ebe7df"],
    },
  },

  // ─── 10. O ESPELHO DO MEDO — TEASER ──────────────────────────────────────────
  {
    id: "carousel-espelho-medo-teaser",
    title: "O Espelho do Medo — Março 2026",
    description: "Teaser do segundo Espelho. A persona de Rui e Ana. Cria antecipação e waitlist.",
    slides: [
      {
        bg: "#1e2620", text: "#f5f7f5", accent: "#8b9b8e",
        title: "Há uma voz\nque diz não\navant de pensares.",
        body: "", footer: "Espelho do Medo ~ Véu do Medo",
        bgImage: "/images/espelho-medo.png",
      },
      {
        bg: "#3d3630", text: "#f7f5f0", accent: "#8b9b8e",
        title: "Não é covardia.",
        body: "É um mecanismo antigo.\nTreinado ao longo de anos\nde cautela disfarçada\nde bom senso.",
        footer: "Espelho do Medo",
      },
      {
        bg: "#f5f7f5", text: "#2a2a2a", accent: "#8b9b8e",
        title: "\"E se falhar?\"\n\"E se me arrepender?\"\n\"E se não resultar?\"",
        body: "Reconheces estas vozes?",
        footer: "Espelho do Medo",
      },
      {
        bg: "#1e2620", text: "#f5f7f5", accent: "#8b9b8e",
        title: "O Espelho do Medo\né uma história\nsobre Rui.",
        body: "Ele sabe o que quer.\nO medo decide antes dele.\nSempre decidiu.",
        footer: "Espelho do Medo",
      },
      {
        bg: "#3d3630", text: "#8b9b8e", accent: "#f7f5f0",
        title: "Março 2026.",
        body: "Sai primeiro\npara quem já está\ndentro da plataforma.",
        footer: "Espelho do Medo ~ seteveus.space",
      },
    ],
    caption: "O Espelho do Medo chega em Março.\n\nHá uma voz que diz não antes de pensares. Não é covardia — é um mecanismo antigo, treinado ao longo de anos de cautela disfarçada de bom senso.\n\nReconheces?\n\nEnvia a quem vives a dizer \"não posso\" antes de pensar se quer.\n\nSai primeiro para quem já está dentro.\n\n#OsSeteVeus #EspelhoDoMedo #Marco2026",
    canvaSpecs: {
      dimensions: "1080x1080px (quadrado)",
      fonts: "Título: Playfair Display / Corpo: Inter",
      colorPalette: ["#1e2620", "#f5f7f5", "#8b9b8e", "#3d3630"],
    },
  },

  // ─── 11. O LIVRO FÍSICO — PEDE O TEU CÓDIGO ──────────────────────────────────
  {
    id: "carousel-livro-fisico-codigo",
    title: "Tens o livro? Há mais dentro dele.",
    description: "Campanha código digital para quem tem o livro físico. Tom: surpresa, não venda.",
    slides: [
      {
        bg: "#ebe7df", text: "#3d3630", accent: "#c9b896",
        title: "O livro físico\nque tens na estante\ntem uma extensão\ndigital.",
        body: "", footer: "Os 7 Véus do Despertar",
        bgImage: "/images/mandala-7veus.png",
      },
      {
        bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896",
        title: "Não é uma cópia.",
        body: "É a experiência\nde ler com um diário\nao lado. De parar\npara respirar\nentre capítulos.",
        footer: "Os 7 Véus do Despertar",
      },
      {
        bg: "#f7f5f0", text: "#3d3630", accent: "#7a8c6e",
        title: "De partilhar\nsem que ninguém\nsaiba quem és.",
        body: "Numa comunidade\nonde tudo expira.\nAnónima.\nImpermanente.",
        footer: "Os 7 Véus do Despertar",
      },
      {
        bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896",
        title: "É gratuito.\nPara quem tem\no livro físico.",
        body: "Preenches um formulário.\nRecebes o código em 24h.",
        footer: "Os 7 Véus do Despertar",
      },
      {
        bg: "#7a8c6e", text: "#f7f5f0", accent: "#ebe7df",
        title: "Há mais dentro\ndo livro que compraste.",
        body: "", footer: "Os 7 Véus do Despertar ~ seteveus.space/pedir-codigo",
      },
    ],
    caption: "O livro físico que tens na estante tem uma extensão digital.\n\nNão é uma cópia — é a experiência de ler com um diário ao lado, parar para respirar entre capítulos, partilhar numa comunidade onde ninguém sabe quem és.\n\nGratuito para quem tem o livro físico.\n\nConheces alguém que tem o livro e não sabe disto? Envia-lhe.\n\nseteveus.space/pedir-codigo\n\n#OsSeteVeus #PedeOTeuCodigo",
    canvaSpecs: {
      dimensions: "1080x1080px (quadrado)",
      fonts: "Título: Playfair Display / Corpo: Inter",
      colorPalette: ["#ebe7df", "#3d3630", "#f7f5f0", "#c9b896", "#7a8c6e"],
    },
  },

  // ─── 12. O QUE SÃO OS SETE VÉUS (LIVRO FILOSÓFICO) ────────────────────────────
  {
    id: "carousel-o-que-sao-veus",
    title: "Os 7 Véus do Despertar — o livro filosófico",
    description: "Para quem ainda não conhece o livro filosófico. Diferente dos Espelhos — este é ensaio.",
    slides: [
      {
        bg: "#3d3630", text: "#f7f5f0", accent: "#c9b896",
        title: "Já sentiste que a vida\nque tens não foi\na que escolheste?",
        body: "", footer: "Os 7 Véus do Despertar",
        bgImage: "/images/mandala-7veus.png",
      },
      {
        bg: "#f7f5f0", text: "#3d3630", accent: "#c9b896",
        title: "Os Sete Véus\ndo Despertar",
        body: "Um ensaio filosófico\nde Vivianne dos Santos.\n\nNão sobre o que fazer.\nSobre o que ver.",
        footer: "Os 7 Véus do Despertar",
      },
      {
        bg: "#3d3630", text: "#f7f5f0", accent: "#7a8c6e",
        title: "7 véus que escondem\na tua consciência\nde ti mesma.",
        body: "Permanência. Memória.\nTurbilhão. Esforço.\nDesolação. Horizonte.\nDualidade.",
        footer: "Os 7 Véus do Despertar",
      },
      {
        bg: "#ebe7df", text: "#3d3630", accent: "#c9b896",
        title: "Na plataforma digital,\nnão é só ler.",
        body: "Lês. Respiras.\nReflectes. Escreves.\nEm cada capítulo,\numa pausa que é tua.",
        footer: "Os 7 Véus do Despertar",
      },
      {
        bg: "#7a8c6e", text: "#f7f5f0", accent: "#ebe7df",
        title: "Já tens o livro físico?\nO acesso digital\né gratuito.",
        body: "Pede o teu código\nem menos de 2 minutos.",
        footer: "Os 7 Véus do Despertar ~ seteveus.space/pedir-codigo",
      },
    ],
    caption: "Já sentiste que a vida que tens não foi a que escolheste?\n\nOs 7 Véus do Despertar é um ensaio filosófico de Vivianne dos Santos. 7 véus que escondem a tua consciência de ti mesma. Não sobre o que fazer — sobre o que ver.\n\nQual dos 7 véus reconheces mais em ti? Diz nos comentários.\n\nJá tens o livro físico? O acesso digital é gratuito. Envia a quem precisa de parar para perguntar.\n\n#OsSeteVeus #LivroFilosofico #DespertarDeConsciencia",
    canvaSpecs: {
      dimensions: "1080x1080px (quadrado)",
      fonts: "Título: Playfair Display / Corpo: Inter",
      colorPalette: ["#3d3630", "#f7f5f0", "#c9b896", "#7a8c6e", "#ebe7df"],
    },
  },

];
export const reelScripts: ReelScript[] = [
  {
    hook: "Construíste a tua vida inteira sem nunca ter perguntado o que querias.",
    scenes: [
      "CENA 1 (0-3s): Texto aparece letra a letra sobre fundo escuro: \"Construíste a tua vida inteira...\" [pausa dramática]",
      "CENA 2 (3-6s): \"...sem nunca ter perguntado o que querias.\" [texto completo]",
      "CENA 3 (6-12s): Imagem atmosférica — mulher de costas a olhar pela janela, ou mãos a segurar uma chávena. Voz-off ou texto: \"Quando foi que escolhi tomar café em vez de chá? Uma pergunta absurda. Mas foi a pergunta que mudou tudo.\"",
      "CENA 4 (12-20s): Transição suave. Texto: \"O Espelho da Ilusão é a história de uma mulher que, pela primeira vez, pergunta.\"",
      "CENA 5 (20-25s): Preview da plataforma (screenshot do leitor) com texto: \"Não é um livro. É uma experiência.\"",
      "CENA 6 (25-30s): CTA final sobre fundo escuro: \"Ha mais para ti. Teste gratuito.\"",
    ],
    cta: "Ha mais para ti. Teste gratuito.",
    music: "Música ambiente calma, piano suave ou sons de natureza. Sugestões no Canva/CapCut: 'Contemplative', 'Reflective Piano', 'Soft Ambient'",
    duration: "25-30s",
    canvaTemplate: "Procura 'book reveal' ou 'quote animation' nos templates do CapCut",
  },
  {
    hook: "3 sinais de que vives no automático:",
    scenes: [
      "CENA 1 (0-3s): Texto grande e directo: \"3 sinais de que vives no automático\" [prender atenção]",
      "CENA 2 (3-8s): \"1. Respondes 'tanto faz' a perguntas importantes.\" [texto aparece com transição]",
      "CENA 3 (8-13s): \"2. Não te lembras da última vez que escolheste uma rua diferente.\" [transição]",
      "CENA 4 (13-18s): \"3. A tua primeira reacção nunca é o que verdadeiramente pensas.\" [transição]",
      "CENA 5 (18-23s): \"Se te reconheces... não és a única.\" [pausa] \"Escrevi uma história sobre isso.\"",
      "CENA 6 (23-30s): Capa do Espelho da Ilusão ou preview da plataforma. \"O Espelho da Ilusão. Teste gratuito.\"",
    ],
    cta: "Começa pelo teste gratuito.",
    music: "Ritmo suave mas presente. Tipo lo-fi ou ambient electr\u00f3nico. No CapCut: 'Chill Lo-fi' ou 'Minimal Beat'",
    duration: "25-30s",
    canvaTemplate: "Procura 'list reveal' ou 'text animation' nos templates do CapCut",
  },
  {
    hook: "O que acontece quando uma mãe e uma filha dizem o que sempre calaram?",
    scenes: [
      "CENA 1 (0-3s): \"O que acontece quando uma mãe é uma filha dizem o que sempre calaram?\" [texto dramático]",
      "CENA 2 (3-8s): Imagem: mãos de duas gerações diferentes. Texto: \"Sara viu o véu. Mas há um nó que ficou por desatar.\"",
      "CENA 3 (8-15s): \"O Nó da Herança é a história de Sara e Helena — mãe e filha — e o silêncio herdado entre elas.\"",
      "CENA 4 (15-22s): \"Não é um upsell. É uma continuação emocional. Só se desbloqueia depois de completares o Espelho da Ilusão.\"",
      "CENA 5 (22-30s): Preview da plataforma com o card do Nó desbloqueado. CTA: \"Começa pelo Espelho. O Nó espera por ti.\"",
    ],
    cta: "Começa pelo Espelho. O Nó espera por ti.",
    music: "Emocional e íntima. Piano + cordas suaves. No CapCut: 'Emotional Piano' ou 'Cinematic Gentle'",
    duration: "25-30s",
    canvaTemplate: "Procura 'emotional story' ou 'book trailer' nos templates do CapCut",
  },
  {
    hook: "Tens o livro físico? Há algo que ainda não sabes.",
    scenes: [
      "CENA 1 (0-3s): Mostrar o livro físico (foto real se possível). \"Tens este livro?\"",
      "CENA 2 (3-8s): \"Há algo que ainda não sabes sobre ele.\"",
      "CENA 3 (8-15s): \"O livro abre portas que ainda não conheces.\" [transição para screenshots da plataforma]",
      "CENA 4 (15-22s): Mostrar a experiência digital: leitor, diário, comunidade. \"Leitura integrada. Diário pessoal. Comunidade anónima.\"",
      "CENA 5 (22-28s): \"Acesso gratuito para quem tem o livro físico.\"",
      "CENA 6 (28-35s): \"Pede o teu código em menos de 1 minuto.\" + CTA",
    ],
    cta: "Pede o teu código gratuito.",
    music: "Suave e convidativa. No CapCut: 'Warm Acoustic' ou 'Gentle Inspiration'",
    duration: "30-35s",
    canvaTemplate: "Procura 'product reveal' ou 'unboxing' nos templates do CapCut",
  },
  {
    hook: "Há uma voz que diz não antes de pensares.",
    scenes: [
      "CENA 1 (0-3s): Ecrã escuro. Texto aparece devagar: \"Há uma voz que diz não...\" [pausa]",
      "CENA 2 (3-5s): \"...antes de pensares.\" [impacto]",
      "CENA 3 (5-12s): \"Não é covardia. É um mecanismo antigo — treinado ao longo de anos de cautela disfarçada de bom senso.\"",
      "CENA 4 (12-18s): Imagem atmosférica. Voz ou texto: \"'E se falhar?' 'E se me arrepender?' Reconheces estas vozes?\"",
      "CENA 5 (18-24s): \"O Espelho do Medo é uma história sobre o Rui — e sobre o que o medo calou durante anos.\"",
      "CENA 6 (24-30s): \"Março 2026.\" + seteveus.space",
    ],
    cta: "Espelho do Medo — Março 2026. seteveus.space",
    music: "Ambiente contido, quase em silêncio. No CapCut: 'Contemplative' ou 'Slow Ambient'",
    duration: "28-30s",
  },
  {
    hook: "Isto não é um livro. É um espelho.",
    scenes: [
      "CENA 1 (0-3s): Ecrã escuro. Texto aparece devagar: \"Isto não é um livro.\" [pausa]",
      "CENA 2 (3-5s): \"É um espelho.\" [impacto visual — flash suave]",
      "CENA 3 (5-10s): Screenshots rápidos da plataforma: leitor, diário, checklist, comunidade. Texto: \"Lês. Respiras. Escreves. Sentes.\"",
      "CENA 4 (10-18s): \"7 histórias. 7 véus. Cada um esconde algo que já sabes mas nunca disseste.\"",
      "CENA 5 (18-22s): Print do quiz com texto: \"3 minutos. 7 perguntas. Qual Espelho combina contigo?\"",
      "CENA 6 (22-28s): \"Teste gratuito..\" [fundo escuro, dourado]",
    ],
    cta: "Teste gratuito.",
    music: "Ambiente cinematográfico suave. No CapCut: 'Cinematic Soft' ou 'Atmospheric Piano'",
    duration: "25-28s",
  },
  {
    hook: "Não escreveste nada sobre ti em anos. E isso pesa.",
    scenes: [
      "CENA 1 (0-3s): Ecrã escuro. \"Não escreveste nada sobre ti em anos.\" [pausa]",
      "CENA 2 (3-5s): \"E isso pesa.\" [impacto simples]",
      "CENA 3 (5-12s): Screenshot do diário reflexivo na plataforma. \"No leitor dos Espelhos, cada capítulo tem um espaço para escrever o que sentiste.\"",
      "CENA 4 (12-18s): \"Só tu lês. Não vai a lado nenhum. Só fica.\"",
      "CENA 5 (18-24s): Screenshot da comunidade Ecos. \"E se quiseres partilhar algo, há uma comunidade anónima. Sem nomes. Tudo desaparece em 30 dias.\"",
      "CENA 6 (24-30s): \"seteveus.space\" sobre fundo escuro [CTA tranquilo]",
    ],
    cta: "seteveus.space",
    music: "Piano muito suave. No CapCut: 'Slow Piano' ou 'Contemplative'",
    duration: "28-30s",
  },
  {
    hook: "Se leste isto até ao fim, este livro é para ti.",
    scenes: [
      "CENA 1 (0-3s): Ecrã preto. Texto: \"Se leste isto até ao fim...\" [suspense]",
      "CENA 2 (3-5s): \"...este livro é para ti.\" [transição suave]",
      "CENA 3 (5-12s): Citação do livro em texto: \"Via, mas não sentia. Registava, mas não participava. Como quem assiste a um espectáculo por trás de uma janela fechada.\"",
      "CENA 4 (12-18s): \"Reconheces-te?\" [pausa longa] \"Então não és a única.\"",
      "CENA 5 (18-25s): \"O Espelho da Ilusão. Uma história sobre despertar do automático.\"",
      "CENA 6 (25-30s): \"Disponível agora..\" [imagem do espelho]",
    ],
    cta: "Disponível agora.",
    music: "Muito calma, quase silenciosa. No CapCut: 'Ambient Silence' ou 'Slow Piano'",
    duration: "25-30s",
  },

  // ─── REELS: CAMPANHA EXPERIENCIA DIGITAL ──────────────────────────────────

  {
    hook: "Tens este livro na estante? Há algo que não sabes sobre ele.",
    scenes: [
      "CENA 1 (0-3s): Mostrar foto do livro físico. Texto: \"Tens este livro?\" [curiosidade]",
      "CENA 2 (3-6s): \"Há algo que não sabes sobre ele.\" [pausa dramática]",
      "CENA 3 (6-12s): \"O livro físico tem uma extensão digital. Não é uma cópia — é uma experiência diferente.\"",
      "CENA 4 (12-18s): Screenshots rápidos da plataforma: diário, comunidade, respiração. Texto: \"Diário reflexivo. Comunidade anónima. Respiração guiada.\"",
      "CENA 5 (18-24s): \"E se já compraste o livro, o acesso é gratuito.\"",
      "CENA 6 (24-30s): \"Pede o teu código em 2 minutos..\" [CTA]",
    ],
    cta: "Pede o teu código gratuito.",
    music: "Suave e convidativa. No CapCut: 'Warm Acoustic' ou 'Gentle Inspiration'",
    duration: "25-30s",
  },
  {
    hook: "Ler sem escrever é como olhar para um espelho de olhos fechados.",
    scenes: [
      "CENA 1 (0-3s): Texto sobre ecrã escuro: \"Ler sem escrever...\" [suspense]",
      "CENA 2 (3-5s): \"...é como olhar para um espelho de olhos fechados.\" [impacto]",
      "CENA 3 (5-12s): Screenshot do diário reflexivo na plataforma. Texto: \"Na experiência digital, cada capítulo tem um espaço para escreveres o que sentiste.\"",
      "CENA 4 (12-18s): \"Só tu lês. Só tu decides o que guardas.\"",
      "CENA 5 (18-24s): Screenshot da comunidade Ecos. \"E na comunidade, descobres que não estás sozinha.\"",
      "CENA 6 (24-30s): \"Se já tens o livro físico, o acesso digital é gratuito..\" [CTA]",
    ],
    cta: "Acesso digital gratuito para quem tem o livro.",
    music: "Piano suave e contemplativo. No CapCut: 'Reflective Piano' ou 'Contemplative'",
    duration: "25-30s",
  },
];

// ─── CONJUNTOS DE HASHTAGS ───────────────────────────────────────────────────

export type HashtagSet = {
  name: string;
  description: string;
  tags: string[];
};

export const hashtagSets: HashtagSet[] = [
  {
    name: "Principal — Marca",
    description: "Usar em todos os posts. Hashtags da marca. Nota: usar SEMPRE a versão sem acentos para manter um único pool de hashtag no Instagram.",
    tags: [
      "#OsSeteVeus", "#SeteVeus", "#VivianneDosSantos", "#SetevéusSpace",
      "#OsSeteVeusDoDespertar", "#PedeOTeuCodigo",
    ],
  },
  {
    name: "Autoconhecimento",
    description: "Posts sobre despertar, reflexão, jornada interior.",
    tags: [
      "#Autoconhecimento", "#DesenvolvimentoPessoal", "#JornadaInterior",
      "#DespertarDeConsciência", "#Reflexão", "#ConheceTe",
      "#CrescimentoPessoal", "#Consciência", "#Introspecção",
      "#TransformaçãoPessoal",
    ],
  },
  {
    name: "Livros / Leitura",
    description: "Posts sobre o livro, citações, recomendações.",
    tags: [
      "#LivrosQueTransformam", "#DicaDeLeitura", "#BookstagramPortugal",
      "#LivrosEmPortuguês", "#LeituraConsciente", "#Bookstagram",
      "#BookTok", "#BooktokMoçambique", "#LivrosParaAlma",
      "#LiteraturaPortuguesa",
    ],
  },
  {
    name: "Moçambique / Lusófono",
    description: "Alcance regional — Moçambique, Brasil, Portugal.",
    tags: [
      "#Moçambique", "#AutorasMoçambicanas", "#LiteraturaMoçambicana",
      "#MaputoCity", "#EscritorasAfricanas", "#LivrosAfricanos",
      "#LiteraturaLusófona", "#LivrosBrasil", "#LivrosPortugal",
      "#EscritorasLusófonas",
    ],
  },
  {
    name: "Mulheres / Feminino",
    description: "Posts dirigidos ao público feminino.",
    tags: [
      "#MulheresQueDespertam", "#FemininoSagrado", "#MulheresFortes",
      "#Sororidade", "#MulheresConscientes", "#PoderFeminino",
      "#MulheresReais", "#ForçaFeminina", "#MulheresQueInspiram",
      "#JornadaFeminina",
    ],
  },
  {
    name: "Comunidade / Digital",
    description: "Posts sobre a plataforma e comunidade Ecos.",
    tags: [
      "#ComunidadeEcos", "#PlataformaDigital", "#LeituraIntegrada",
      "#DiárioReflexivo", "#ComunidadeAnónima", "#ExperiênciaDigital",
      "#LeituraDigital", "#AcessoGratuito", "#PlataformaDeAutoconhecimento",
      "#LeiturasInteractivas",
    ],
  },
  {
    name: "Engagement — Salvar/Partilhar",
    description: "CTAs para aumentar engagement.",
    tags: [
      "#GuardaEstaPub", "#PartilhaComAlguém", "#MarqueUmaAmiga",
      "#FrasesDoDia", "#ReflexãoDoDia", "#PensaNisto",
      "#CitaçõesDeLivros", "#FrasesQueTransformam", "#InspiraçãoDiária",
      "#PalavrasQueTocam",
    ],
  },
  {
    name: "Véu da Ilusão",
    description: "Posts específicos sobre o 1o véu.",
    tags: [
      "#VeuDaIlusao", "#EspelhoDaIlusao", "#NoDaHeranca",
      "#PrimeiroVeu", "#Ilusao", "#VidaNoAutomatico",
      "#DespertarDaIlusao", "#SairDoAutomatico",
      "#PerguntasQueTransformam",
    ],
  },
  {
    name: "Véu do Medo",
    description: "Posts sobre o 2o véu (Março 2026).",
    tags: [
      "#VeuDoMedo", "#EspelhoDoMedo", "#SegundoVeu",
      "#Medo", "#Coragem", "#MedoDeViver",
      "#EnfrentarOMedo", "#CoragemDeSerQuemSou", "#SuperarOMedo",
      "#OQueMeTrava",
    ],
  },
];

// ─── GUIA DE PRODUCAO ────────────────────────────────────────────────────────

export type ProductionGuide = {
  category: string;
  items: { title: string; detail: string }[];
};

export const productionGuide: ProductionGuide[] = [
  {
    category: "Dimensões e Formatos",
    items: [
      { title: "Post Feed (quadrado)", detail: "1080 x 1080px — para carrosséis e posts estáticos" },
      { title: "Story / Status WhatsApp", detail: "1080 x 1920px (9:16) — para stories e status" },
      { title: "Reel / Cover", detail: "1080 x 1920px (9:16) — capa do reel: 1080x1080 recomendado" },
      { title: "Carrossel", detail: "1080 x 1080px cada slide, máximo 10 slides. Gerados directamente no /painel/marketing — descarrega todos os slides de uma vez." },
    ],
  },
  {
    category: "Paleta de Cores — Os Sete Véus",
    items: [
      { title: "Fundo escuro principal", detail: "#3d3630 — castanho escuro quente" },
      { title: "Fundo claro (cream)", detail: "#f7f5f0 — branco quente" },
      { title: "Dourado (accent)", detail: "#c9b896 — dourado suave" },
      { title: "Verde sage", detail: "#7a8c6e — verde terroso" },
      { title: "Bege médio", detail: "#ebe7df — entre cream e dourado" },
      { title: "Véu do Medo", detail: "#8b9b8e — verde acinzentado" },
      { title: "Véu da Culpa", detail: "#c97070 — vermelho suave" },
    ],
  },
  {
    category: "Tipografia",
    items: [
      { title: "Títulos / Citações", detail: "Playfair Display — serif, elegante, literário. Usada automaticamente nos carrosséis gerados." },
      { title: "Corpo de texto", detail: "Inter ou system font — sans-serif, limpo, legível" },
      { title: "Tamanho títulos", detail: "48-72pt em 1080x1080 — deve ser legível no telemóvel" },
      { title: "Tamanho corpo", detail: "22-32pt em 1080x1080" },
      { title: "Espaço entre linhas", detail: "1.4-1.6 — generoso, para respirar" },
    ],
  },
  {
    category: "Ferramentas Recomendadas (Custo Zero)",
    items: [
      { title: "Gerador integrado (seteveus.space)", detail: "Carrosséis e imagens para redes sociais gerados directamente na plataforma em /painel/marketing. Descarrega PNG pronto para publicar — sem Canva." },
      { title: "CapCut Free", detail: "Para Reels e vídeos. Templates prontos, legendas automáticas em Português, transições suaves." },
      { title: "Meta Business Suite", detail: "Para agendar posts no Instagram e Facebook. Gratuito. Mostra melhores horários para publicar." },
      { title: "WhatsApp Business", detail: "Para Status diários, broadcasts segmentados e catálogo dos livros. Gratuito." },
      { title: "Manychat Free", detail: "Automação de DMs no Instagram. Alguém comenta 'VEU' no post e recebe DM automática com link." },
      { title: "Kit (ConvertKit) Free", detail: "Email marketing até 10.000 subscritores. Landing pages e broadcasts gratuitos." },
    ],
  },
  {
    category: "Screenshots para Conteúdo",
    items: [
      { title: "Dashboard do membro", detail: "/membro — mostra a experiência completa por dentro" },
      { title: "Leitor de capítulo", detail: "/membro/leitura/1 — mostra como é a leitura integrada" },
      { title: "Respiração guiada", detail: "Screenshot durante a pausa de respiração entre capítulos" },
      { title: "Diário pessoal", detail: "Screenshot da área de reflexão (sem texto pessoal)" },
      { title: "Comunidade Ecos", detail: "/comunidade — mostra as 4 salas" },
      { title: "Quiz resultado", detail: "/recursos/teste — mostra o resultado do teste com o véu revelado" },
      { title: "Card do Nó desbloqueado", detail: "/membro/leitura — mostra o teaser do Nó da Herança após completar Espelho" },
      { title: "Página de compra", detail: "/comprar/espelhos — mostra preços e opções" },
    ],
  },
  {
    category: "Automação Manychat (Instagram DMs)",
    items: [
      { title: "Trigger: comentário 'VEU'", detail: "Quando alguém comenta VÉU num post, enviar DM: \"Obrigada pelo teu interesse! Descobre qual Espelho combina contigo com o nosso teste gratuito de 3 minutos: seteveus.space/recursos/teste — Vivianne\"" },
      { title: "Trigger: comentário 'LIVRO'", detail: "Quando alguém comenta LIVRO, enviar DM: \"Tens o livro físico? Pede o teu código de acesso digital gratuito aqui: seteveus.space/pedir-código — Vivianne\"" },
      { title: "Trigger: comentário 'QUERO'", detail: "Quando alguém comenta QUERO, enviar DM: \"O Espelho da Ilusão está disponível por $19 USD / 1.200 MZN. Acesso vitalício. Começa aqui: seteveus.space/comprar/espelhos — Vivianne\"" },
      { title: "Story reply automation", detail: "Quando alguém responde a um Story, enviar agradecimento + link para o teste gratuito automaticamente." },
    ],
  },
];

// ─── RITMO SEMANAL ─────────────────────────────────────────────────────────────
// Mapeia cada dia da semana (0=Dom) para um tema do Hub.
// themeIdx: índice em thematicHub (0=Véus, 1=Espelhos, 2=Nós, 3=Comunidade, 4=Reflexões)
// dayIdx: sub-tema dentro do tema

export type WeekdayRhythm = {
  label: string;
  hint: string;
  themeIdx: number;
  dayIdx: number;
  bestTime: string;
  bestTimeNote: string;
};

export const WEEKLY_RHYTHM: WeekdayRhythm[] = [
  { label: "Dom", hint: "Reflexão",    themeIdx: 4, dayIdx: 0, bestTime: "10h–12h", bestTimeNote: "Manhã calma — reflexão pessoal" },
  { label: "Seg", hint: "Véu",         themeIdx: 0, dayIdx: 0, bestTime: "12h–14h", bestTimeNote: "Pausa do almoço — scroll rápido" },
  { label: "Ter", hint: "Espelho",     themeIdx: 1, dayIdx: 0, bestTime: "18h–20h", bestTimeNote: "Fim do dia — disponibilidade emocional" },
  { label: "Qua", hint: "Véu",         themeIdx: 0, dayIdx: 2, bestTime: "12h–14h", bestTimeNote: "Meio da semana — pausa" },
  { label: "Qui", hint: "Nó",          themeIdx: 2, dayIdx: 0, bestTime: "18h–20h", bestTimeNote: "Melhor dia da semana — engagement alto" },
  { label: "Sex", hint: "Espelho",     themeIdx: 1, dayIdx: 1, bestTime: "17h–19h", bestTimeNote: "Início do fim-de-semana" },
  { label: "Sáb", hint: "Os 7 Véus",  themeIdx: 0, dayIdx: 6, bestTime: "11h–13h", bestTimeNote: "Manhã relaxada — conteúdo longo" },
];

// ─── CONTEÚDO EDUCATIVO DE NICHO ──────────────────────────────────────────────
// Carrosséis visuais que constroem autoridade no nicho de autoconhecimento.
// Não mencionam o produto — falam dos temas como fenómenos universais.

export type NicheCarousel = {
  id: string;
  title: string;
  slides: CarouselSlide[];
  caption: string;
};

export const nicheCarousels: NicheCarousel[] = [
  // ── 1. PADRÕES ──
  {
    id: "edu-1",
    title: "A conversa que se repete",
    slides: [
      { bg: "#2d1f1f", text: "#f0e6e0", accent: "#c4877a", title: "Sabes aquela\nconversa que\njá tiveste\n47 vezes?", body: "", footer: "" },
      { bg: "#f0e6e0", text: "#2d1f1f", accent: "#c4877a", title: "Não é falta\nde inteligência.", body: "É porque o padrão\né mais rápido\nque a consciência.", footer: "" },
      { bg: "#2d1f1f", text: "#f0e6e0", accent: "#c4877a", title: "O corpo entra\nna conversa\nantes de ti.", body: "Já escolheu as palavras.\nJá decidiu o que sentir.\nAntes de pensares.", footer: "" },
      { bg: "#f0e6e0", text: "#2d1f1f", accent: "#2d1f1f", title: "Não precisas\nde parar\no padrão.", body: "Precisas de o reconhecer\nenquanto acontece.", footer: "— Vivianne" },
    ],
    caption: "Sabes aquela conversa que já tiveste 47 vezes?\n\nNão é falta de inteligência. É porque o padrão é mais rápido que a consciência.\n\nO corpo entra na conversa antes de ti. Já preparou a defesa, já escolheu as palavras — antes de pensares.\n\nQual é a conversa que se repete na tua vida?\n\n— Vivianne\n\n#Autoconhecimento #Padroes #ConhecerSe #OsSeteVeus",
  },
  {
    id: "edu-2",
    title: "Escolhas que não são escolhas",
    slides: [
      { bg: "#1f2d2a", text: "#e8f0ec", accent: "#7ab89a", title: "Há escolhas\nque não são\nescolhas.", body: "", footer: "" },
      { bg: "#e8f0ec", text: "#1f2d2a", accent: "#7ab89a", title: "São repetições\ndisfarçadas\nde decisão.", body: "O mesmo tipo de pessoa.\nO mesmo conflito.\nO mesmo silêncio.", footer: "" },
      { bg: "#1f2d2a", text: "#e8f0ec", accent: "#7ab89a", title: "Parece sempre\ndiferente.", body: "Porque o cenário muda.\nMas o mecanismo\né o mesmo.", footer: "" },
      { bg: "#e8f0ec", text: "#1f2d2a", accent: "#1f2d2a", title: "A diferença entre\nrepetir e escolher\né uma só:", body: "Consciência.", footer: "— Vivianne" },
    ],
    caption: "Há escolhas que não são escolhas.\n\nSão repetições disfarçadas de decisão. Escolhes o mesmo tipo de pessoa. O mesmo conflito. O mesmo momento para te calares.\n\nParece sempre diferente — porque o cenário muda. Mas o mecanismo é o mesmo.\n\nA próxima vez que \"escolheres\", pergunta: isto é novo ou é familiar?\n\n— Vivianne\n\n#Autoconhecimento #Padroes #EscolhasConscientes #OsSeteVeus",
  },
  {
    id: "edu-3",
    title: "O que aprendeste cedo demais",
    slides: [
      { bg: "#2a1f2d", text: "#ece0f0", accent: "#a87ac4", title: "Não te tornaste\nassim\nde repente.", body: "", footer: "" },
      { bg: "#ece0f0", text: "#2a1f2d", accent: "#a87ac4", title: "Houve um dia\n— antes dos\n10 anos —", body: "em que aprendeste que\nera mais seguro\nser simpática\ndo que ser honesta.", footer: "" },
      { bg: "#2a1f2d", text: "#ece0f0", accent: "#a87ac4", title: "Não foi trauma.\nFoi adaptação.", body: "E a adaptação funcionou\ntão bem que esqueceste\nque havia outra versão\nde ti antes dela.", footer: "" },
      { bg: "#ece0f0", text: "#2a1f2d", accent: "#2a1f2d", title: "O que aprendeste\ncedo demais?", body: "", footer: "— Vivianne" },
    ],
    caption: "Não te tornaste assim de repente.\n\nHouve um dia — provavelmente antes dos 10 anos — em que aprendeste que era mais seguro ser simpática do que ser honesta.\n\nNão foi trauma. Foi adaptação. E funcionou tão bem que esqueceste que havia outra versão de ti antes dela.\n\nO que aprendeste cedo demais?\n\n— Vivianne\n\n#Autoconhecimento #InfanciaInterior #Adaptacao #OsSeteVeus",
  },

  // ── 2. CORPO ──
  {
    id: "edu-4",
    title: "O corpo sabe antes de ti",
    slides: [
      { bg: "#1f2820", text: "#e5ede6", accent: "#8bba8f", title: "O teu corpo\nsabe coisas\nque tu ainda\nnão admitiste.", body: "", footer: "" },
      { bg: "#e5ede6", text: "#1f2820", accent: "#8bba8f", title: "A dor de estômago\nantes da reunião.", body: "O aperto no peito\nquando o telefone toca.\n\nO cansaço que não\nse explica por\nhoras de sono.", footer: "" },
      { bg: "#1f2820", text: "#e5ede6", accent: "#8bba8f", title: "O corpo\nnão mente.", body: "Não sabe.", footer: "" },
      { bg: "#e5ede6", text: "#1f2820", accent: "#1f2820", title: "Onde é que\no teu corpo\nfala mais alto?", body: "", footer: "— Vivianne" },
    ],
    caption: "O teu corpo sabe coisas que tu ainda não admitiste.\n\nA dor de estômago antes da reunião. O aperto no peito quando o telefone toca. O cansaço que não se explica por horas de sono.\n\nO corpo não mente. Não sabe.\n\nOnde é que o teu corpo fala mais alto?\n\n— Vivianne\n\n#CorpoEMente #Autoconhecimento #EscutarOCorpo #OsSeteVeus",
  },
  {
    id: "edu-5",
    title: "Endireitar a postura",
    slides: [
      { bg: "#282520", text: "#ede9e3", accent: "#baa87a", title: "Já reparaste que\nendireitas a postura\nquando alguém\nentra na sala?", body: "", footer: "" },
      { bg: "#ede9e3", text: "#282520", accent: "#baa87a", title: "Não é vaidade.\nÉ vigilância.", body: "O corpo adapta-se:\nser vista é ser avaliada.\nEntão prepara-se.\nContrai. Performa.", footer: "" },
      { bg: "#282520", text: "#ede9e3", accent: "#baa87a", title: "Relaxar na\npresença de\noutra pessoa", body: "é um dos gestos\nmais corajosos\nque existem.", footer: "" },
      { bg: "#ede9e3", text: "#282520", accent: "#282520", title: "Com quem é que\no teu corpo\nrelaxa?", body: "", footer: "— Vivianne" },
    ],
    caption: "Já reparaste que endireitas a postura quando alguém entra na sala?\n\nNão é vaidade. É vigilância. O corpo adapta-se ao que aprendeu: ser vista é ser avaliada.\n\nRelaxar na presença de outra pessoa é um dos gestos mais corajosos que existem.\n\nCom quem é que o teu corpo relaxa?\n\n— Vivianne\n\n#CorpoEMente #Vulnerabilidade #Autoconhecimento #OsSeteVeus",
  },

  // ── 3. FICÇÃO ──
  {
    id: "edu-6",
    title: "O espelho mais gentil",
    slides: [
      { bg: "#1f1f2d", text: "#e0e0f0", accent: "#7a7ac4", title: "Há coisas que\nsó conseguimos\nver quando\nnão são sobre nós.", body: "", footer: "" },
      { bg: "#e0e0f0", text: "#1f1f2d", accent: "#7a7ac4", title: "As histórias\nfuncionam onde\nos conselhos\nfalham.", body: "Ninguém gosta que\nlhe digam o que\nestá errado.", footer: "" },
      { bg: "#1f1f2d", text: "#e0e0f0", accent: "#7a7ac4", title: "Mas quando lês\numa personagem\nque faz exactamente\no que tu fazes —", body: "e vês as consequências\n— algo muda.", footer: "" },
      { bg: "#e0e0f0", text: "#1f1f2d", accent: "#1f1f2d", title: "A ficção é\no espelho mais\ngentil que existe.", body: "", footer: "— Vivianne" },
    ],
    caption: "Há coisas que só conseguimos ver quando não são sobre nós.\n\nÉ por isso que as histórias funcionam onde os conselhos falham. Quando lês uma personagem que faz exactamente o que tu fazes — e vês as consequências — algo muda.\n\nNão é informação. É reconhecimento.\n\nJá te reconheceste numa personagem que não eras tu?\n\n— Vivianne\n\n#FiccaoTransformativa #Autoconhecimento #LeituraConsciente #OsSeteVeus",
  },
  {
    id: "edu-7",
    title: "Autoajuda vs. história",
    slides: [
      { bg: "#2d2a1f", text: "#f0ece0", accent: "#c4b07a", title: "Um livro de\nautoajuda diz-te\no que fazer.", body: "", footer: "" },
      { bg: "#f0ece0", text: "#2d2a1f", accent: "#c4b07a", title: "Uma história\nmostra-te\nquem és.", body: "", footer: "" },
      { bg: "#2d2a1f", text: "#f0ece0", accent: "#c4b07a", title: "O conselho entra\npela mente.", body: "A história entra\npelo corpo —\npelo reconhecimento,\npelo arrepio,\npelo «isto sou eu».", footer: "" },
      { bg: "#f0ece0", text: "#2d2a1f", accent: "#2d2a1f", title: "Não precisas de\nmais informação\nsobre ti.", body: "Precisas de te ver.", footer: "— Vivianne" },
    ],
    caption: "Um livro de autoajuda diz-te o que fazer. Uma história mostra-te quem és.\n\nA diferença é enorme. O conselho entra pela mente. A história entra pelo corpo — pelo reconhecimento, pelo arrepio, pelo «isto sou eu».\n\nNão precisas de mais informação sobre ti. Precisas de te ver.\n\n— Vivianne\n\n#FiccaoTransformativa #LeituraQueTransforma #Autoconhecimento #OsSeteVeus",
  },

  // ── 4. RELAÇÃO ──
  {
    id: "edu-8",
    title: "O silêncio entre duas pessoas",
    slides: [
      { bg: "#2d1f2a", text: "#f0e0ec", accent: "#c47aaa", title: "O silêncio entre\nduas pessoas\nnunca é vazio.", body: "", footer: "" },
      { bg: "#f0e0ec", text: "#2d1f2a", accent: "#c47aaa", title: "Está cheio de tudo\no que não foi dito.", body: "Das vezes que\nquase disseste.\nDas vezes que ele\nquase perguntou.", footer: "" },
      { bg: "#2d1f2a", text: "#f0e0ec", accent: "#c47aaa", title: "Os silêncios\nacumulam-se\ncomo neve.", body: "Parecem leves.\nMas quando derretes\ntudo de uma vez\n— inunda.", footer: "" },
      { bg: "#f0e0ec", text: "#2d1f2a", accent: "#2d1f2a", title: "A maioria das\nrelações não acaba\npor conflito.", body: "Acaba por acumulação\nde silêncios.", footer: "— Vivianne" },
    ],
    caption: "O silêncio entre duas pessoas nunca é vazio.\n\nEstá cheio de tudo o que não foi dito. Das vezes que quase disseste. Das vezes que ele quase perguntou.\n\nOs silêncios acumulam-se como neve. Parecem leves. Mas quando derretes tudo de uma vez — inunda.\n\nO que é que o silêncio está a guardar?\n\n— Vivianne\n\n#Relacoes #Comunicacao #Autoconhecimento #OsSeteVeus",
  },
  {
    id: "edu-9",
    title: "Cuidar ou controlar",
    slides: [
      { bg: "#1f2a2d", text: "#e0ecf0", accent: "#7aaac4", title: "Cuidar pode ser\numa forma\nde controlar.", body: "", footer: "" },
      { bg: "#e0ecf0", text: "#1f2a2d", accent: "#7aaac4", title: "Parece generosidade.\nParece amor.", body: "Mas às vezes é isto:\nse eu tratar de tudo,\nninguém me pode\nabandonar.", footer: "" },
      { bg: "#1f2a2d", text: "#e0ecf0", accent: "#7aaac4", title: "A pessoa que\ncuida demais\nraramente pede.", body: "Porque pedir é arriscar\nouvir «não».\nE esse «não» confirma\no medo original.", footer: "" },
      { bg: "#e0ecf0", text: "#1f2a2d", accent: "#1f2a2d", title: "Cuidas para dar\n— ou para\nnão perder?", body: "", footer: "— Vivianne" },
    ],
    caption: "Cuidar pode ser uma forma de controlar.\n\nParece generosidade. Parece amor. Mas às vezes é isto: se eu tratar de tudo, ninguém me pode abandonar.\n\nA pessoa que cuida demais raramente pede. Porque pedir é arriscar ouvir «não».\n\nCuidas para dar — ou para não perder?\n\n— Vivianne\n\n#Relacoes #Codependencia #Autoconhecimento #OsSeteVeus",
  },

  // ── 5. PROVOCAÇÃO ──
  {
    id: "edu-10",
    title: "O conselho mais inútil",
    slides: [
      { bg: "#1a1a1a", text: "#f5f0eb", accent: "#e8c87a", title: "«Ama-te a\nti mesma»\né o conselho\nmais inútil\nque existe.", body: "", footer: "" },
      { bg: "#f5f0eb", text: "#1a1a1a", accent: "#e8c87a", title: "Não porque\nseja falso.", body: "Porque é vago.\n\nNinguém te diz como.\nNinguém te diz que\namar-se inclui olhar\npara partes de ti\nque não queres ver.", footer: "" },
      { bg: "#1a1a1a", text: "#f5f0eb", accent: "#e8c87a", title: "Autoconhecimento\nnão é wellness.", body: "É trabalho.\nBonito, necessário\n— mas trabalho.", footer: "" },
      { bg: "#f5f0eb", text: "#1a1a1a", accent: "#1a1a1a", title: "O que é que\n«amar-te»\nsignificaria\nse fosses honesta?", body: "", footer: "— Vivianne" },
    ],
    caption: "«Ama-te a ti mesma» é o conselho mais inútil que existe.\n\nNão porque seja falso. Porque é vago. Ninguém te diz como. Ninguém te diz que amar-se inclui olhar para partes de ti que não queres ver.\n\nAutoconhecimento não é wellness. É trabalho. Bonito, necessário — mas trabalho.\n\nO que é que «amar-te» significaria se fosses honesta?\n\n— Vivianne\n\n#Autoconhecimento #Honestidade #SemFiltro #OsSeteVeus",
  },
  {
    id: "edu-11",
    title: "Rituais matinais",
    slides: [
      { bg: "#1e1a20", text: "#f0eaf2", accent: "#b898c4", title: "Não precisas\nde mais rituais\nmatinais.", body: "", footer: "" },
      { bg: "#f0eaf2", text: "#1e1a20", accent: "#b898c4", title: "Precisas de uma\nconversa honesta\ncontigo às 3\nda manhã.", body: "Sem velas.\nSem journal bonito.\nSem playlist\nde meditação.", footer: "" },
      { bg: "#1e1a20", text: "#f0eaf2", accent: "#b898c4", title: "Só tu e a\npergunta que\ntens evitado.", body: "", footer: "" },
      { bg: "#f0eaf2", text: "#1e1a20", accent: "#1e1a20", title: "Qual é a pergunta\nque continuas\na adiar?", body: "", footer: "— Vivianne" },
    ],
    caption: "Não precisas de mais rituais matinais.\n\nPrecisas de uma conversa honesta contigo às 3 da manhã. Sem velas, nem journal bonito, nem playlist de meditação. Só tu e a pergunta que tens evitado.\n\nO autoconhecimento não acontece na hora que reservas para ele. Acontece quando te apanhas no acto de ser quem não queres ser.\n\nQual é a pergunta que continuas a adiar?\n\n— Vivianne\n\n#Autoconhecimento #SemFiltro #Honestidade #OsSeteVeus",
  },
  {
    id: "edu-12",
    title: "Medo de ser vista a mudar",
    slides: [
      { bg: "#201e1a", text: "#f2f0ea", accent: "#c4a878", title: "A maioria das\npessoas não tem\nmedo de mudar.", body: "", footer: "" },
      { bg: "#f2f0ea", text: "#201e1a", accent: "#c4a878", title: "Tem medo de\nser vista\na mudar.", body: "Porque mudar implica\nadmitir que antes\nestavas errada.\nOu perdida.\nOu a fingir.", footer: "" },
      { bg: "#201e1a", text: "#f2f0ea", accent: "#c4a878", title: "As pessoas à\ntua volta já se\nhabituaram à\nversão antiga.", body: "Algumas até preferem\nessa versão —\nporque a nova\nincomoda.", footer: "" },
      { bg: "#f2f0ea", text: "#201e1a", accent: "#201e1a", title: "O que mudarias\nse ninguém\nestivesse a ver?", body: "", footer: "— Vivianne" },
    ],
    caption: "A maioria das pessoas não tem medo de mudar. Tem medo de ser vista a mudar.\n\nPorque mudar implica admitir que antes estavas errada. Ou perdida. Ou a fingir.\n\nAs pessoas à tua volta já se habituaram à versão antiga. Algumas até preferem essa versão — porque a nova incomoda.\n\nO que mudarias se ninguém estivesse a ver?\n\n— Vivianne\n\n#Autoconhecimento #Mudanca #Coragem #OsSeteVeus",
  },
];
