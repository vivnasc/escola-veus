/**
 * Course Production Guidelines — Escola dos Véus
 *
 * This file is the single source of truth for how every course asset
 * (script, audio, visual, PDF) should be produced.
 * Referenced by the admin production page and by any automated pipeline.
 */

// ─── SCRIPT STRUCTURE ───────────────────────────────────────────────────────

export const SCRIPT_STRUCTURE = {
  sections: [
    {
      name: "abertura",
      label: "Abertura",
      durationSec: { min: 10, max: 15 },
      instruction:
        "Ceu do Mundo dos Veus. Camara desce ao territorio. Nome do curso + modulo + sub-aula em texto creme. Fade.",
      voiceNote: "Sem voz. Apenas musica ambiente e titulo no ecra.",
    },
    {
      name: "pergunta_inicial",
      label: "Pergunta Inicial",
      durationSec: { min: 15, max: 30 },
      instruction:
        "Gancho emocional. Uma pergunta forte que activa algo na aluna. Deve ser algo que ela reconhece imediatamente no corpo.",
      voiceNote:
        "Voz calma, pausada. Deixar silencio depois da pergunta (2-3 segundos).",
    },
    {
      name: "situacao_humana",
      label: "Situacao Humana",
      durationSec: { min: 120, max: 180 },
      instruction:
        "Descricao de algo concreto e reconhecivel. A aluna pensa 'isto sou eu'. Cenario real: terca-feira, supermercado, conversa com a mae, reuniao de trabalho. Nunca abstracto.",
      voiceNote: "Voz proxima, quase em tom de conversa. Ritmo natural.",
    },
    {
      name: "revelacao_padrao",
      label: "Revelacao do Padrao",
      durationSec: { min: 120, max: 180 },
      instruction:
        "O que esta por baixo. O que nunca foi nomeado. A lente invisivel dos veus actua aqui — mas nunca se diz 'veu', 'espelho' ou 'no' como conceito. Revelar o padrao sem jargao.",
      voiceNote: "Voz ligeiramente mais lenta. Gravidade sem peso.",
    },
    {
      name: "gesto_consciencia",
      label: "Gesto de Consciencia",
      durationSec: { min: 60, max: 120 },
      instruction:
        "Algo pequeno que a aluna pode fazer. Nao uma revolucao — um gesto. Concreto, praticavel, ligado ao corpo. Ex: 'esta semana, antes de pagar uma conta, para. Sente o que aparece.'",
      voiceNote: "Voz gentil, de convite. Nunca imperativa.",
    },
    {
      name: "frase_final",
      label: "Frase Final",
      durationSec: { min: 15, max: 30 },
      instruction:
        "Uma frase que fica. Que a aluna leva para o chuveiro, para a cama, para o carro. Deve poder ser escrita num post-it.",
      voiceNote:
        "Voz com peso. Pausa antes e depois. A frase e o ultimo som antes do silencio.",
    },
    {
      name: "fecho",
      label: "Fecho",
      durationSec: { min: 10, max: 15 },
      instruction:
        "Territorio dissolve-se no ceu. Logo Sete Veus. Silencio. Sem voz.",
      voiceNote: "Sem voz. Apenas visual e silencio.",
    },
  ],
  totalDurationMin: { min: 6, max: 10 },
} as const;

// ─── TONE GUIDELINES ────────────────────────────────────────────────────────

export const TONE_GUIDELINES = {
  voice: {
    who: "A guia que ja esteve onde tu estas. Nao e coach. Nao e terapeuta.",
    pronoun: "tu" as const,
    style: "Calmo, proximo, filosofico. Usa o corpo como referencia. Faz perguntas que ficam. Usa silencio como ferramenta.",
    forbidden: [
      "Nunca dizer 'veu', 'espelho' ou 'no' como conceito",
      "Nunca usar tom de coach motivacional",
      "Nunca usar jargao espiritual ou terapeutico",
      "Nunca usar emojis",
      "Nunca dizer 'vamos la' ou expressoes de entusiasmo",
      "Nunca prometer transformacao — apenas convidar a olhar",
      "Nunca usar 'voce' — sempre 'tu'",
    ],
    encouraged: [
      "Perguntas que ficam ('Quando foi a ultima vez que...')",
      "Referencias ao corpo ('Sente onde isso vive no teu corpo')",
      "Situacoes concretas do dia-a-dia",
      "Silencio como pontuacao",
      "Frases curtas depois de paragrafos longos",
      "Metaforas visuais (nunca abstractas)",
    ],
  },
  writing: {
    sentenceLength: "Variar. Frases longas que envolvem, seguidas de curtas que cortam.",
    paragraphLength: "Curto. Cada paragrafo e uma respiracao.",
    rhythm: "Lento. Cada palavra pesa. Nada de pressa.",
    references: "Vida real: contas, cozinha, madrugada, espelho do elevador, fila do supermercado.",
  },
} as const;

// ─── VISUAL GUIDELINES ──────────────────────────────────────────────────────

export const VISUAL_PALETTE = {
  background: "#1A1A2E",
  silhouette: "#C4745A",
  gold: "#C9A96E",
  accent: "#8B5CF6",
  text: "#F5F0E6",
  light: "#D4A853",
} as const;

export const VISUAL_GUIDELINES = {
  sky: {
    description:
      "Azul-marinho profundo (#1A1A2E). O momento antes do amanhecer. Nunca dia pleno, nunca noite total.",
    progression:
      "Modulos 1-2: mais escuro. Modulos 7-8: quase amanhecer (mas nunca chega — o amanhecer e da aluna).",
  },
  silhouette: {
    description:
      "Sem rosto. Sem raca. Sem idade. Terracota (#C4745A) com brilho dourado (#C9A96E). Sempre a mesma 'pessoa'.",
    poses: {
      standing: "De pe, imovel = presenca",
      bent: "Curvada = peso, medo",
      seated: "Sentada = reflexao",
      hands_chest: "Maos no peito = auto-conexao",
      hands_open: "Maos abertas = recepcao",
      walking: "A caminhar = avanco",
      back_turned: "De costas = contemplacao",
      hand_extended: "Mao estendida = coragem",
    },
  },
  typography: {
    font: "Playfair Display ou Cormorant Garamond (serifada elegante)",
    color: "#F5F0E6 (creme sobre fundo escuro)",
    animation: "Fade suave in/out",
  },
  transitions: {
    style: "Dissolve lento entre cenas. Ecra escuro com respiracao entre sub-aulas.",
    forbidden: "Nunca corte seco, nunca wipe, nunca zoom brusco.",
  },
  sound: {
    voice: "Clone ElevenLabs da Vivianne",
    music: "Ambiente subtil, quase inaudivel — textura, nao melodia",
    silence: "Silencio intencional entre seccoes",
  },
} as const;

// ─── TERRITORY VISUAL MAPPING ───────────────────────────────────────────────

export type TerritoryVisualGuide = {
  course: string;
  territory: string;
  color: string;
  transformation: string;
  stageDescriptions: [string, string, string, string];
  connections: string[];
};

export const TERRITORY_GUIDES: Record<string, TerritoryVisualGuide> = {
  "ouro-proprio": {
    course: "Ouro Proprio",
    territory: "A Casa dos Espelhos Dourados",
    color: "Ambar",
    transformation:
      "Espelhos cobertos → descobertos, reflexos distorcidos → claros",
    stageDescriptions: [
      "Sala escura, espelhos cobertos com panos dourados. Poeira no ar. Luz fraca de uma vela.",
      "Alguns panos comecam a escorregar. Reflexos distorcidos mas visiveis. Mais luz.",
      "Maioria dos espelhos descobertos. Reflexos ainda tremem mas sao reconheciveis. Luz dourada.",
      "Todos os espelhos descobertos. Reflexos claros e calmos. Luz ambar preenche a sala.",
    ],
    connections: [],
  },
  "sangue-e-seda": {
    course: "Sangue e Seda",
    territory: "A Arvore das Raizes Visiveis",
    color: "Vermelho escuro, seda",
    transformation:
      "Raizes emaranhadas → reorganizadas, amanhecer atras da arvore",
    stageDescriptions: [
      "Arvore antiga, raizes expostas e emaranhadas. Fios de seda vermelha entre raizes. Escuridao.",
      "Raizes comecam a separar-se. Fios de seda mais visiveis. Primeira luz no horizonte.",
      "Raizes organizadas, algumas cortadas conscientemente. Seda como decoracao. Aurora.",
      "Arvore inteira e forte. Raizes visiveis mas organizadas. Amanhecer atras da arvore.",
    ],
    connections: [
      "A Casa dos Espelhos Dourados reflecte brevemente esta arvore (dinheiro vem da familia)",
    ],
  },
  "a-arte-da-inteireza": {
    course: "A Arte da Inteireza",
    territory: "A Ponte entre Duas Margens",
    color: "Violeta agua",
    transformation:
      "Rio sem ponte → ponte completa, duas silhuetas inteiras com espaco",
    stageDescriptions: [
      "Rio violeta largo, duas margens distantes. Nevoeiro. Sem ponte.",
      "Primeiras pedras no rio. Uma silhueta na margem esquerda, outra na direita. Nevoeiro parcial.",
      "Ponte de luz a meio, incompleta. Duas silhuetas mais proximas. Rio mais calmo.",
      "Ponte completa. Duas silhuetas inteiras, cada uma na sua margem, com espaco entre elas. Agua calma.",
    ],
    connections: [
      "O Corpo-Paisagem tem o mesmo rio (corpo e relacoes conectados)",
    ],
  },
  "depois-do-fogo": {
    course: "Depois do Fogo",
    territory: "O Campo Queimado",
    color: "Cinza carvao, laranja brasa, verde broto",
    transformation: "Destruicao → vida nova, diferente do que era",
    stageDescriptions: [
      "Campo completamente queimado. Cinzas, troncos negros. Silencio. Ceu pesado de fumo.",
      "Primeiras brasas visíveis sob as cinzas. Calor residual. Um broto impossivel.",
      "Brotos verdes entre cinzas. Vida diferente da original. Ceu a limpar.",
      "Campo verde novo, diferente do anterior. Cicatrizes visiveis mas belas. Ceu limpo.",
    ],
    connections: [
      "A Encruzilhada ao longe e visivel (recomecar implica decidir)",
    ],
  },
  "olhos-abertos": {
    course: "Olhos Abertos",
    territory: "A Encruzilhada Infinita",
    color: "Azul nevoeiro, branco",
    transformation:
      "Nevoeiro total → parcialmente claro, silhueta da o primeiro passo",
    stageDescriptions: [
      "Encruzilhada com caminhos infinitos. Nevoeiro total. Impossivel ver para onde vao.",
      "Nevoeiro parcial. Alguns caminhos visiveis. Silhueta imovel no centro.",
      "Nevoeiro a dissipar. Menos caminhos, mais claros. Silhueta virada para um.",
      "Poucos caminhos, claros. Nevoeiro quase desfeito. Silhueta a dar o primeiro passo.",
    ],
    connections: [],
  },
  "pele-nua": {
    course: "Pele Nua",
    territory: "O Corpo-Paisagem",
    color: "Terracota rosado",
    transformation: "Paisagem desconhecida → reconhecida e habitada",
    stageDescriptions: [
      "Paisagem que sugere formas corporais. Desconhecida, quase assustadora. Tons frios.",
      "Paisagem mais reconhecivel. Colinas como ombros, vales como costas. Tons a aquecer.",
      "Paisagem habitada. Silhueta deitada que se confunde com o terreno. Terracota rosado.",
      "Corpo e paisagem sao o mesmo. Harmonia. Habitada, conhecida, em paz.",
    ],
    connections: [
      "O mesmo rio da Ponte (corpo e relacoes conectados)",
    ],
  },
  "limite-sagrado": {
    course: "Limite Sagrado",
    territory: "A Muralha que Nasce do Chao",
    color: "Dourado luminoso",
    transformation:
      "Sem limite → muralha de luz, com porta que a silhueta abre",
    stageDescriptions: [
      "Espaco aberto sem limites. Silhueta pequena e exposta. Vulnerabilidade.",
      "Linhas de luz no chao. Esbocos de muralha. Silhueta a observar.",
      "Muralha de luz a subir. Porta visivel. Silhueta junto a porta.",
      "Muralha de luz dourada completa. Porta aberta pela silhueta. Proteccao com liberdade.",
    ],
    connections: [],
  },
  "flores-no-escuro": {
    course: "Flores no Escuro",
    territory: "O Jardim Subterraneo",
    color: "Azul profundo + bioluminescentes",
    transformation:
      "Caverna escura → iluminada pela luz das proprias flores",
    stageDescriptions: [
      "Caverna completamente escura. Apenas a sensacao de espaco. Silencio.",
      "Primeiras flores bioluminescentes. Luz azulada fraca. Contornos de jardim.",
      "Jardim visivel. Flores de varias cores bioluminescentes. Beleza no escuro.",
      "Jardim completo, iluminado pela propria luz. Flores vibrantes. Escuro agora e contexto, nao ameaca.",
    ],
    connections: [
      "Flores da cor da Sala do Eco (luto e silencio ligados)",
    ],
  },
  "o-peso-e-o-chao": {
    course: "O Peso e o Chao",
    territory: "O Caminho de Pedras",
    color: "Cinza pedra",
    transformation:
      "Curvada sob peso → de pe, leve, pedras no chao",
    stageDescriptions: [
      "Caminho de pedras empilhadas nos ombros da silhueta. Curvada. Peso visivel.",
      "Algumas pedras no chao. Silhueta menos curvada. Respira.",
      "Maioria das pedras no chao, organizadas. Silhueta quase de pe. Caminho formado pelas pedras.",
      "Silhueta de pe. Pedras no chao formam o caminho. O peso virou direccao.",
    ],
    connections: [],
  },
  "voz-de-dentro": {
    course: "Voz de Dentro",
    territory: "A Sala do Eco",
    color: "Violeta escuro, dourado eco",
    transformation: "Silencio/sombra → voz/luz",
    stageDescriptions: [
      "Sala circular, escura. Paredes que parecem absorver som. Silhueta de boca fechada.",
      "Eco fraco. Ondas subtis nas paredes. Silhueta entreabre a boca.",
      "Eco visivel como ondas douradas. Paredes respondem. Silhueta a falar.",
      "Sala cheia de ecos dourados. Paredes vibram. Silhueta de boca aberta, voz livre.",
    ],
    connections: [
      "Flores do Jardim Subterraneo tem esta mesma cor (luto e silencio ligados)",
    ],
  },
  "o-fio-invisivel": {
    course: "O Fio Invisivel",
    territory: "O Lago dos Reflexos Partilhados",
    color: "Azul-prata, fios dourados",
    transformation:
      "Superficie opaca → transparente, reflexos individuais fundem-se num so",
    stageDescriptions: [
      "Lago de superficie opaca, prata escura. Silhueta sozinha na margem. Nenhum reflexo visivel. Isolamento.",
      "Superficie com ondulacoes. Reflexos vagos de outras figuras aparecem na agua. Fios dourados subtis.",
      "Lago mais transparente. Reflexos claros de varias silhuetas — geracoes. Fios dourados ligam os reflexos.",
      "Lago completamente transparente. Reflexos individuais fundem-se num reflexo colectivo. Fios dourados brilham. Unidade.",
    ],
    connections: [
      "Reflecte todos os outros territorios na sua superficie (a dualidade contem tudo)",
    ],
  },
  "o-espelho-do-outro": {
    course: "O Espelho do Outro",
    territory: "A Galeria dos Reflexos Vivos",
    color: "Verde-esmeralda, dourado reflexo",
    transformation:
      "Espelhos que mostram outros → espelhos que mostram a propria silhueta",
    stageDescriptions: [
      "Galeria escura com espelhos vivos que mostram outras pessoas. Silhueta a olhar para fora, nunca para si. Confusao.",
      "Alguns espelhos comecam a reflectir a propria silhueta misturada com o outro. Reconhecimento parcial.",
      "Maioria dos espelhos mostra a silhueta claramente, com sombras do outro ao fundo. Integracao.",
      "Espelhos claros. A silhueta ve-se com clareza. O outro aparece como contexto, nao como identidade. Paz.",
    ],
    connections: [
      "Casa dos Espelhos Dourados e esta galeria sao versoes uma da outra (um olha para dentro, outro olha atraves do outro)",
    ],
  },
  "o-silencio-que-grita": {
    course: "O Silencio que Grita",
    territory: "A Caverna dos Ecos Mudos",
    color: "Cinza-azulado, branco fantasma",
    transformation:
      "Caverna silenciosa com ecos presos → caverna com ecos libertados como luz",
    stageDescriptions: [
      "Caverna profunda, silencio total. Paredes com marcas de palavras nao ditas — sombras de letras. Pesadez.",
      "Primeiros ecos visiveis como ondas cinzentas nas paredes. Silhueta com boca entreaberta. Medo.",
      "Ecos mais fortes, alguns dourados. Paredes a vibrar. Silhueta a falar — som visivel a sair.",
      "Caverna cheia de ecos dourados e brancos. Silencio transformado em resonancia. Palavras libertadas iluminam as paredes.",
    ],
    connections: [
      "Sala do Eco e esta caverna sao complementares (uma e a voz propria, outra e a voz familiar)",
      "Arvore das Raizes Visiveis partilha raizes com esta caverna (heranca materna e silencio familiar)",
    ],
  },
  "a-teia": {
    course: "A Teia",
    territory: "O Bosque dos Fios Entrelacados",
    color: "Verde-musgo, dourado fio",
    transformation:
      "Fios emaranhados que prendem → teia organizada que sustenta",
    stageDescriptions: [
      "Bosque escuro com fios emaranhados entre arvores. Silhueta presa nos fios. Sufoco.",
      "Fios a reorganizar-se. Alguns cortados. Silhueta com mais espaco. Bosque com primeira luz.",
      "Teia visivel e organizada. Fios que ligam sem prender. Silhueta no centro, livre. Luz verde-dourada.",
      "Teia bela e equilibrada. Fios dourados entre arvores. Silhueta ligada mas inteira. Bosque luminoso.",
    ],
    connections: [
      "Ponte entre Duas Margens partilha o tema da ligacao (relacoes intimas vs. relacoes colectivas)",
      "Lago dos Reflexos Partilhados reflecte este bosque (conexao individual vs. conexao colectiva)",
    ],
  },
  "a-chama": {
    course: "Brasa Viva",
    territory: "O Vulcao Adormecido",
    color: "Vermelho-fogo, negro lava",
    transformation:
      "Vulcao selado e escuro → vulcao com lava controlada que ilumina",
    stageDescriptions: [
      "Vulcao adormecido, selado. Superficie negra e fria. Silhueta rigida, mandibula cerrada. Pressao invisivel.",
      "Fissuras na superficie. Lava visivel por baixo. Calor a subir. Silhueta tensa mas consciente.",
      "Lava a fluir em canais controlados. Fogo visivel mas nao destrutivo. Silhueta de pe, punhos abertos.",
      "Vulcao activo e belo. Lava ilumina a paisagem. Fogo controlado como fonte de luz. Silhueta poderosa.",
    ],
    connections: [
      "Muralha de Limite Sagrado usa este fogo como combustivel (sem raiva nao ha limites)",
    ],
  },
  "a-mulher-antes-de-mae": {
    course: "Antes do Ninho",
    territory: "O Ninho que Pesa",
    color: "Ocre quente, branco ovo",
    transformation:
      "Ninho que engole a silhueta → ninho com espaco para a silhueta inteira",
    stageDescriptions: [
      "Ninho enorme que engole a silhueta. So se ve a mae — a mulher desapareceu. Ocre pesado.",
      "Silhueta comeca a emergir do ninho. Contorno proprio visivel. Primeiro espaco entre mae e ninho.",
      "Silhueta dentro e fora do ninho. Duas formas da mesma pessoa. Luz ocre quente.",
      "Ninho bonito com espaco. Silhueta inteira — mae e mulher ao mesmo tempo. Equilíbrio. Luz dourada.",
    ],
    connections: [
      "Arvore das Raizes Visiveis partilha raizes com este ninho (ser filha e ser mae)",
    ],
  },
  "o-oficio-de-ser": {
    course: "Maos Cansadas",
    territory: "A Oficina Infinita",
    color: "Bronze, castanho quente",
    transformation:
      "Oficina frenetica sem pausa → oficina com ritmo proprio e janela aberta",
    stageDescriptions: [
      "Oficina escura, maquinas a trabalhar sem parar. Silhueta curvada sobre a mesa. Sem janela. Exaustao.",
      "Algumas maquinas param. Silhueta endireita-se. Uma fresta de luz. Primeira pausa.",
      "Oficina mais calma. Janela entreaberta. Silhueta trabalha com ritmo proprio. Luz bronze quente.",
      "Oficina com janela aberta. Silhueta trabalha e para. Dentro e fora. Ritmo. Proposito sem prisao.",
    ],
    connections: [
      "Casa dos Espelhos Dourados reflecte esta oficina (dinheiro e trabalho como espelhos de identidade)",
    ],
  },
  "o-relogio-partido": {
    course: "Estacoes Partidas",
    territory: "O Jardim das Estacoes",
    color: "Prateado, ambar outonal",
    transformation:
      "Relogio gigante que aprisiona → relogio partido, jardim com todas as estacoes ao mesmo tempo",
    stageDescriptions: [
      "Jardim dominado por relogio gigante. Tudo acelerado — flores nascem e morrem em segundos. Silhueta a correr. Angustia.",
      "Relogio com fissuras. Tempo a abrandar. Algumas flores param. Silhueta mais lenta.",
      "Relogio partido. Estacoes coexistem — primavera e outono lado a lado. Silhueta parada, a observar.",
      "Sem relogio. Jardim com todas as estacoes em harmonia. Silhueta sentada, presente. Paz ambar-prateada.",
    ],
    connections: [
      "Campo Queimado partilha a ideia de estacoes (recomecos e tempo ligados)",
    ],
  },
  "a-coroa-escondida": {
    course: "Ouro e Sombra",
    territory: "O Trono Coberto",
    color: "Dourado real, purpura",
    transformation:
      "Trono coberto por panos e sombras → trono descoberto, silhueta sentada de coroa",
    stageDescriptions: [
      "Sala escura com trono coberto por panos. Silhueta de costas, encolhida. Nao sabe que o trono e seu.",
      "Panos a escorregar. Trono parcialmente visivel. Silhueta olha para ele. Medo e curiosidade.",
      "Trono descoberto, dourado e purpura. Silhueta de pe junto ao trono. Hesitacao.",
      "Silhueta sentada no trono. Coroa na cabeca. Sem pedir permissao. Luz dourada e purpura. Presenca total.",
    ],
    connections: [
      "Muralha de Limite Sagrado e este trono complementam-se (limites protegem, poder ocupa)",
      "Vulcao Adormecido fornece o fogo para este trono (raiva como combustivel do poder)",
    ],
  },
  "a-fome": {
    course: "Pao e Silencio",
    territory: "A Mesa Vazia",
    color: "Terracota rosado, branco porcelana",
    transformation:
      "Mesa vazia com silhueta faminta → mesa com comida e silhueta em paz",
    stageDescriptions: [
      "Mesa enorme e vazia. Silhueta sentada a frente, faminta. Prato vazio. Escuridao. Carencia.",
      "Mesa com alguns alimentos. Silhueta hesitante. Conflito entre fome e culpa. Luz fraca.",
      "Mesa com comida variada. Silhueta a comer com atencao. Sem culpa. Luz rosada quente.",
      "Mesa bonita, comida simples. Silhueta em paz com o prato. Corpo habitado. Presenca. Terracota e porcelana.",
    ],
    connections: [
      "Corpo-Paisagem partilha o mesmo territorio corporal (sexualidade e alimentacao como linguagens do corpo)",
    ],
  },
} as const;

// ─── AUDIO PRODUCTION ───────────────────────────────────────────────────────

export const AUDIO_GUIDELINES = {
  voiceId: "fnoNuVpfClX7lHKFbyZ2",
  model: "eleven_multilingual_v2",
  modelV3: "eleven_v3",
  settings: {
    stability: 0.65,
    similarity_boost: 0.78,
    style: 0.35,
    use_speaker_boost: true,
  },
  format: "mp3_44100_128",
  naming: "{courseSlug}/audio/m{moduleNum}-{subLetter}.mp3",
  pauseMarkers: {
    shortPause: "[pausa 1s]",
    mediumPause: "[pausa 2s]",
    longPause: "[pausa 3s]",
    breathPause: "[respiracao]",
  },
  ssmlNotes:
    "Se usar SSML: <break time='2s'/> entre seccoes. Rate slow para revelacao do padrao.",
} as const;

// ─── PDF PRODUCTION ─────────────────────────────────────────────────────────

export const MANUAL_GUIDELINES = {
  structure: [
    "CAPA — titulo, subtitulo, ilustracao do territorio, logo",
    "ANTES DE COMECARES — o que e, o que nao e, 'o teu ritmo e o ritmo certo'",
    "MAPA DO CURSO — 8 modulos com check boxes, paisagem no estado inicial",
    "8 CAPITULOS (4 paginas cada): titulo + ilustracao, resumo do modulo (complementa videos, nao repete), 3-5 perguntas de reflexao, espaco para escrever ('As tuas palavras')",
    "DEPOIS DE TERMINARES — reconhecimento, convite para outros cursos",
    "CONTRACAPA — logo, frase, URL",
  ],
  pages: 40,
  design: {
    palette: "Paleta do territorio correspondente",
    background: "Fundo escuro",
    text: "Creme (#F5F0E6)",
    font: "Serifada elegante",
  },
} as const;

export const WORKBOOK_GUIDELINES = {
  structure: [
    "CAPA — curso, modulo, ilustracao do territorio naquele estagio",
    "O EXERCICIO PRINCIPAL — titulo, instrucoes (max 5 passos), tom de convite",
    "ESPACO PARA FAZER — estruturado conforme o exercicio (linhas, mapa, carta, silhueta corporal)",
    "REFLEXAO — 3 perguntas de aprofundamento + espaco",
    "REGISTO — tabela: o que notei | onde senti | o que quero lembrar",
    "PONTE — 1 frase que liga ao proximo modulo",
  ],
  pagesPerWorkbook: 5,
  count: 8,
  design: {
    palette: "Mesma do manual, mais leve",
    printable: true,
    writableSpaces: true,
  },
} as const;

// ─── YOUTUBE HOOKS ──────────────────────────────────────────────────────────

export const YOUTUBE_GUIDELINES = {
  countPerCourse: { min: 2, max: 3 },
  durationMin: { min: 5, max: 8 },
  structure:
    "Gancho emocional que activa algo reconhecivel. Parcialmente resolve, deixa fome de mais. Termina com: 'Se isto te tocou, o curso completo esta em seteveus.space.'",
  tone: "Mesmo tom dos videos de curso. Nao e trailer — e conteudo real que para antes de completar.",
} as const;

// ─── PRODUCTION PIPELINE ────────────────────────────────────────────────────

export const PIPELINE_STAGES = [
  {
    stage: "script",
    label: "Script",
    description: "Texto completo de cada sub-aula, seguindo a estrutura de 7 seccoes.",
  },
  {
    stage: "audio",
    label: "Audio",
    description: "Voz gerada via ElevenLabs (clone da Vivianne). MP3 44.1kHz 128kbps.",
  },
  {
    stage: "visuals",
    label: "Visuais",
    description: "Paisagens do territorio (4 estagios) + silhuetas via ComfyUI/ThinkDiffusion.",
  },
  {
    stage: "assembly",
    label: "Montagem",
    description: "Juntar audio + visuais + texto animado. Ferramenta pendente.",
  },
  {
    stage: "review",
    label: "Revisao",
    description: "Vivianne aprova script, audio, visuais e video final.",
  },
  {
    stage: "publish",
    label: "Publicacao",
    description: "Upload para Supabase Storage. Disponivel na plataforma.",
  },
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number]["stage"];

// ─── LAUNCH ORDER ───────────────────────────────────────────────────────────

export const LAUNCH_ORDER = [
  { slug: "ouro-proprio", priority: 1, reason: "Porta universal — dinheiro e o tema mais activador" },
  { slug: "limite-sagrado", priority: 2, reason: "Ponte natural a partir do dinheiro" },
  { slug: "a-arte-da-inteireza", priority: 3, reason: "Relacoes — tema com grande procura" },
  { slug: "sangue-e-seda", priority: 4, reason: "Decisao da Vivianne" },
  { slug: "depois-do-fogo", priority: 5, reason: "Decisao da Vivianne" },
  { slug: "olhos-abertos", priority: 6, reason: "Decisao da Vivianne" },
  { slug: "pele-nua", priority: 7, reason: "Decisao da Vivianne" },
  { slug: "flores-no-escuro", priority: 8, reason: "Decisao da Vivianne" },
  { slug: "o-peso-e-o-chao", priority: 9, reason: "Decisao da Vivianne" },
  { slug: "voz-de-dentro", priority: 10, reason: "Decisao da Vivianne" },
  { slug: "o-fio-invisivel", priority: 11, reason: "Dualidade — porta de entrada para a vertente colectiva" },
  { slug: "o-espelho-do-outro", priority: 12, reason: "Decisao da Vivianne" },
  { slug: "o-silencio-que-grita", priority: 13, reason: "Decisao da Vivianne" },
  { slug: "a-teia", priority: 14, reason: "Decisao da Vivianne" },
  { slug: "a-chama", priority: 15, reason: "Raiva — emocao mais proibida, ponte para limites e poder" },
  { slug: "a-mulher-antes-de-mae", priority: 16, reason: "Decisao da Vivianne" },
  { slug: "o-oficio-de-ser", priority: 17, reason: "Decisao da Vivianne" },
  { slug: "o-relogio-partido", priority: 18, reason: "Decisao da Vivianne" },
  { slug: "a-coroa-escondida", priority: 19, reason: "Decisao da Vivianne" },
  { slug: "a-fome", priority: 20, reason: "Decisao da Vivianne" },
] as const;

// ─── LEGAL DISCLAIMER ───────────────────────────────────────────────────────

export const LEGAL_DISCLAIMER =
  "Este curso nao substitui acompanhamento psicologico ou psiquiatrico. Se estiveres em crise, procura ajuda profissional.";

// ─── HELPER: Build script prompt for a sub-lesson ───────────────────────────

export function buildScriptPrompt(params: {
  courseTitle: string;
  courseSubtitle: string;
  arcoEmocional: string;
  moduleNumber: number;
  moduleTitle: string;
  moduleDescription: string;
  subLetter: string;
  subTitle: string;
  subDescription: string;
  territoryGuide: TerritoryVisualGuide;
}): string {
  const {
    courseTitle,
    courseSubtitle,
    arcoEmocional,
    moduleNumber,
    moduleTitle,
    moduleDescription,
    subLetter,
    subTitle,
    subDescription,
    territoryGuide,
  } = params;

  const stageIndex = Math.min(Math.floor((moduleNumber - 1) / 2), 3);
  const stageDescription = territoryGuide.stageDescriptions[stageIndex];

  return `Escreve o script de uma video-aula para a Escola dos Veus.

CURSO: ${courseTitle} — ${courseSubtitle}
ARCO EMOCIONAL: ${arcoEmocional}
MODULO ${moduleNumber}: ${moduleTitle} — ${moduleDescription}
SUB-AULA ${subLetter}: ${subTitle} — ${subDescription}

TERRITORIO VISUAL: ${territoryGuide.territory}
ESTAGIO ACTUAL (modulo ${moduleNumber}): ${stageDescription}

ESTRUTURA OBRIGATORIA (7 seccoes):
${SCRIPT_STRUCTURE.sections.map((s) => `- ${s.label} (${s.durationSec.min}-${s.durationSec.max}s): ${s.instruction}`).join("\n")}

TOM:
- ${TONE_GUIDELINES.voice.style}
- Pronome: ${TONE_GUIDELINES.voice.pronoun}
- ${TONE_GUIDELINES.voice.who}
${TONE_GUIDELINES.voice.forbidden.map((f) => `- ${f}`).join("\n")}

FORMATO DE SAIDA:
Escreve o script completo, seccao por seccao, com marcadores claros:
[ABERTURA] — descricao visual
[PERGUNTA INICIAL] — texto falado
[SITUACAO HUMANA] — texto falado
[REVELACAO DO PADRAO] — texto falado
[GESTO DE CONSCIENCIA] — texto falado
[FRASE FINAL] — texto falado
[FECHO] — descricao visual

Duracao total falada: 6-10 minutos.
Marca pausas com ${AUDIO_GUIDELINES.pauseMarkers.mediumPause} onde necessario.`;
}

// ─── HELPER: Build visual prompt for a sub-lesson ───────────────────────────

export function buildVisualPrompt(params: {
  courseSlug: string;
  moduleNumber: number;
  sectionName: string;
  silhouettePose?: string;
}): string {
  const { courseSlug, moduleNumber, sectionName, silhouettePose } = params;
  const guide = TERRITORY_GUIDES[courseSlug];
  if (!guide) return "";

  const stageIndex = Math.min(Math.floor((moduleNumber - 1) / 2), 3);
  const stageDesc = guide.stageDescriptions[stageIndex];

  const poseDesc = silhouettePose
    ? VISUAL_GUIDELINES.silhouette.poses[
        silhouettePose as keyof typeof VISUAL_GUIDELINES.silhouette.poses
      ] || ""
    : "";

  return `${guide.territory}, estagio ${stageIndex + 1}/4. ${stageDesc}. Seccao: ${sectionName}. Paleta: fundo #1A1A2E, silhueta #C4745A com brilho #C9A96E, accento #8B5CF6. Cor propria do territorio: ${guide.color}. Estilo: editorial poetico, cinematico, sem rosto.${poseDesc ? ` Silhueta: ${poseDesc}.` : ""} Nao incluir texto.`;
}
