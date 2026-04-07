/**
 * YouTube Hook Scripts — Escola dos Véus
 *
 * Scripts completos para os vídeos YouTube de entrada gratuita.
 * Cada curso tem 2-3 hooks. Cada hook segue a estrutura:
 *   1. Abertura visual (sem voz)
 *   2. Pergunta inicial (gancho)
 *   3. Situação humana (reconhecimento)
 *   4. Revelação do padrão (o que está por baixo)
 *   5. Gesto de consciência (algo pequeno para fazer)
 *   6. Frase final + CTA
 *   7. Fecho visual (sem voz)
 *
 * Os textos são para narração com a voz clonada (ElevenLabs).
 * Indicações visuais [entre colchetes] não são narradas — são para montagem.
 */

export type SceneType =
  | "abertura"
  | "pergunta"
  | "situacao"
  | "revelacao"
  | "gesto"
  | "frase_final"
  | "cta"
  | "fecho"
  // Nova estrutura (v2)
  | "gancho"
  | "reconhecimento"
  | "framework"
  | "exemplo"
  | "exercicio"
  | "reframe"
  | "trailer";

export type VideoScene = {
  type: SceneType;
  /** Texto narrado (vazio = cena sem voz) */
  narration: string;
  /** Texto para sobrepor no ecrã */
  overlayText: string;
  /** Duração estimada em segundos */
  durationSec: number;
  /** Nota de direcção visual */
  visualNote: string;
};

export type YouTubeScript = {
  courseSlug: string;
  hookIndex: number;
  title: string;
  durationMin: number;
  thumbnail: {
    mainText: string;
    subText: string;
  };
  scenes: VideoScene[];
  /** URL da música de fundo (ambiente subtil, baixo volume) */
  backgroundMusicUrl?: string;
};

// ─── BACKGROUND MUSIC PER COURSE ───────────────────────────────────────────
// Música ambiente subtil — textura, não melodia. Volume ~10-15% da narração.

export const COURSE_BACKGROUND_MUSIC: Record<string, string> = {
  "ouro-proprio": "https://tdytdamtfillqyklgrmb.supabase.co/storage/v1/object/public/audios/albums/curso-ouro-proprio/faixa-01.mp3",
};

// ─── OURO PRÓPRIO — HOOK 1 ───────────────────────────────────────────────

const ouroProprioHook1: YouTubeScript = {
  courseSlug: "ouro-proprio",
  hookIndex: 0,
  title: "Porque sentes culpa quando gastas dinheiro em ti mesma?",
  durationMin: 6,
  thumbnail: {
    mainText: "A culpa de gastar em ti",
    subText: "um padrão que herdaste",
  },
  scenes: [
    {
      type: "abertura",
      narration: "",
      overlayText: "Porque sentes culpa quando gastas dinheiro em ti mesma?",
      durationSec: 12,
      visualNote:
        "Dark navy background, a very faint barely visible dark silhouette figure standing alone in the distance, almost merged with the darkness, a tiny golden light far away on the horizon",
    },
    {
      type: "pergunta",
      narration:
        "Compraste algo para ti. Não era caro, não era necessário, era só bom. E antes de saíres da loja já estavas a calcular se devias ter comprado.",
      overlayText: "",
      durationSec: 18,
      visualNote:
        "A dark silhouette figure in a shop holding a small bag, the figure is very dark almost blending into the navy background but slightly visible, shelves with warm terracotta colored products beside them, a faint thought bubble with numbers floating above",
    },
    {
      type: "situacao",
      narration:
        "Isto acontece mais do que se pensa. Compras um creme. Chegas a casa, tiras do saco, e não consegues gostar dele completamente. Trouxeste a culpa junto.\n\nNão é por falta de dinheiro. É outra coisa. Uma voz antiga que diz: podias ter guardado. Há coisas mais importantes. Quem é que tu pensas que és para gastar assim?\n\nHá pessoas que pagam o jantar de toda a gente sem pestanejar. Mas hesitam vinte minutos antes de comprar uma vela para si. Não é avareza. Não é mesquinhice. É qualquer coisa muito mais funda.",
      overlayText: "",
      durationSec: 70,
      visualNote:
        "Split scene: on the left a slightly more visible dark silhouette figure happily giving presents to others shown as golden gift boxes, on the right the same figure hesitating alone with one small object in hand, the figure is becoming slightly more terracotta toned now, gender-neutral, starting to emerge from the darkness",
    },
    {
      type: "revelacao",
      narration:
        "Esta culpa não nasce com ninguém. É herdada. Vem de frases que se ouvem antes de ter idade para as questionar.\n\nUma mãe que nunca compra nada para si. Um pai que repete que dinheiro não nasce em árvores. Uma casa onde gastar era perigoso. Onde ter coisas bonitas era sinal de irresponsabilidade.\n\nAs crianças que vivem nessas casas crescem. Começam a ganhar o seu próprio dinheiro. Mas a regra fica. Gastar nos outros é generosidade. Gastar em si é egoísmo.\n\nE quando não te permites gastar contigo, o que estás a dizer — sem palavras — é que o teu bem-estar não é prioridade.",
      overlayText: "",
      durationSec: 80,
      visualNote:
        "A small child silhouette watching a taller adult silhouette who is putting something back on a shelf, both figures in terracotta now more visible, golden phrases floating like falling leaves around them, the child grows into an adult in the same pose — the shadow of the child remains behind them",
    },
    {
      type: "gesto",
      narration:
        "Há uma coisa simples que se pode fazer. Na próxima vez que comprares algo para ti, repara no que aparece no corpo. O aperto. A voz. O desconforto. Não fujas. Fica com isso três segundos.\n\nE depois repara: o mundo não acabou.",
      overlayText: "Repara. Três segundos.",
      durationSec: 40,
      visualNote:
        "A clearly visible terracotta silhouette figure with hand on chest, a warm golden glow radiating from where the hand touches, faint words and phrases dissolving and fading away around them, the figure is now warm and present — clearly emerged from the darkness",
    },
    {
      type: "frase_final",
      narration:
        "O prazer não precisa de justificação. Se precisasse, não seria prazer.",
      overlayText:
        "O prazer não precisa de justificação.\nSe precisasse, não seria prazer.",
      durationSec: 15,
      visualNote:
        "Dark navy background with a warm golden glow at center, the terracotta figure now luminous with a golden outline, standing tall and calm, fully visible and radiant against the dark background",
    },
    {
      type: "cta",
      narration:
        "Se isto fez sentido, subscreve. Há mais a caminho.",
      overlayText: "Subscreve. Há mais a caminho.",
      durationSec: 10,
      visualNote:
        "The luminous terracotta and gold figure walking calmly toward a warm golden light in the distance, a clear path ahead, peaceful and unhurried",
    },
    {
      type: "fecho",
      narration: "",
      overlayText: "Escola dos Véus",
      durationSec: 6,
      visualNote:
        "Dark navy background, the golden light from the figure softly fading, leaving warmth behind, minimal and quiet",
    },
  ],
};

// ─── OURO PRÓPRIO — HOOK 2 ───────────────────────────────────────────────

const ouroProprioHook2: YouTubeScript = {
  courseSlug: "ouro-proprio",
  hookIndex: 1,
  title: "3 frases sobre dinheiro que a tua mãe te ensinou sem saber",
  durationMin: 7,
  thumbnail: {
    mainText: "O que a tua mãe te ensinou\nsobre dinheiro",
    subText: "Sem nunca dizer uma palavra",
  },
  scenes: [
    {
      type: "abertura",
      narration: "",
      overlayText:
        "3 frases sobre dinheiro\nque a tua mãe te ensinou\nsem saber",
      durationSec: 12,
      visualNote:
        "Céu azul-marinho. Título em creme. Casa dos Espelhos Dourados.",
    },
    {
      type: "pergunta",
      narration:
        "Se eu te pedisse agora para me dizeres três coisas que a tua mãe te disse sobre dinheiro, provavelmente ias dizer: ela nunca me disse nada. E é exactamente aí que está o problema.",
      overlayText: "Ela nunca me disse nada.",
      durationSec: 22,
      visualNote:
        "Silhueta adulta e silhueta criança lado a lado. Sombras. Espelhos ao fundo.",
    },
    {
      type: "situacao",
      narration:
        "A primeira frase que nunca foi dita, mas que ouviste mil vezes: nós não somos dessa gente. Talvez não fosse sobre dinheiro directamente. Mas cada vez que passavam por uma loja e a tua mãe desviava o olhar. Cada vez que dizia: isso não é para nós. Cada vez que recusava um convite porque era caro demais — mesmo quando não era — estavas a aprender.\n\nA aprender que há pessoas que podem e pessoas que não podem. E que tu eras das que não podem.\n\nA segunda frase: olha para o teu pai. Se a tua mãe alguma vez disse isto quando o assunto era dinheiro, o que te estava a ensinar era: o dinheiro causa dor. O dinheiro causa conflito. É melhor não falar sobre ele. Então cresceste a evitar o assunto. A mudar de conversa. A fingir que não te importas. Mas importas.\n\nA terceira frase: eu não preciso de nada. Esta é talvez a mais poderosa. Porque parece generosidade. Parece força. Mas o que a tua mãe te mostrou foi: uma boa pessoa não tem necessidades. Quem cuida dos outros não gasta em si. O sacrifício é a moeda de troca do amor.\n\nE tu, sem perceber, adoptaste exactamente a mesma regra.",
      overlayText: "",
      durationSec: 150,
      visualNote:
        "Três cenas separadas por dissolve. 1) Silhueta criança a olhar para um espelho coberto. 2) Duas silhuetas de costas uma para a outra. 3) Silhueta sentada, mãos no colo. Tons dourados e âmbar.",
    },
    {
      type: "revelacao",
      narration:
        "Ninguém te sentou e te deu uma aula sobre dinheiro. Mas aprendeste tudo. Aprendeste pelo corpo. Pelo tom de voz. Pelo que se dizia e pelo que se calava. E agora vives de acordo com um manual financeiro que nunca escolheste. Que nem sequer sabes que existe.\n\nO mais difícil disto não é percebê-lo. É aceitar que podes escrever um manual diferente. Que reescrever as regras não é trair a tua mãe. É honrar o que ela não teve: a possibilidade de escolher.",
      overlayText:
        "Reescrever as regras\nnão é trair a tua mãe.\nÉ honrar o que ela não teve.",
      durationSec: 75,
      visualNote:
        "Espelhos que se descobrem. Reflexos que mudam. Silhueta que se endireita lentamente.",
    },
    {
      type: "gesto",
      narration:
        "Pega num papel. Escreve três frases que nunca te disseram, mas que aprendeste, sobre dinheiro. Não penses demasiado — escreve o que vier. Depois olha para elas. E pergunta: isto ainda é meu? Ou posso devolver?",
      overlayText: "Três frases.\nIsto ainda é meu?",
      durationSec: 40,
      visualNote:
        "Silhueta com mãos abertas. Panos dourados que caem. Gesto de soltar.",
    },
    {
      type: "frase_final",
      narration:
        "A tua mãe ensinou-te o que sabia. Agora podes aprender o que ela não pôde.",
      overlayText:
        "A tua mãe ensinou-te o que sabia.\nAgora podes aprender\no que ela não pôde.",
      durationSec: 15,
      visualNote: "Ecrã escuro. Texto serifado centrado. Silêncio depois.",
    },
    {
      type: "cta",
      narration:
        "O curso Ouro Próprio começa exactamente aqui. Na arqueologia financeira da tua família. O primeiro módulo é gratuito. Está na descrição.",
      overlayText: "Ouro Próprio\nPrimeiro módulo gratuito\nseteveus.space",
      durationSec: 18,
      visualNote: "Casa dos Espelhos Dourados, espelhos limpos. URL no ecrã.",
    },
    {
      type: "fecho",
      narration: "",
      overlayText: "Sete Véus",
      durationSec: 8,
      visualNote: "Dissolve para céu. Logo. Silêncio.",
    },
  ],
};

// ─── OURO PRÓPRIO — HOOK 3 ───────────────────────────────────────────────

const ouroProprioHook3: YouTubeScript = {
  courseSlug: "ouro-proprio",
  hookIndex: 2,
  title: "O teste do preço: diz o teu valor em voz alta",
  durationMin: 5,
  thumbnail: {
    mainText: "Diz o teu valor\nem voz alta",
    subText: "O teste do preço",
  },
  scenes: [
    {
      type: "abertura",
      narration: "",
      overlayText: "O teste do preço\nDiz o teu valor em voz alta",
      durationSec: 12,
      visualNote:
        "Céu azul-marinho. Título. Casa dos Espelhos Dourados, close nos espelhos.",
    },
    {
      type: "pergunta",
      narration:
        "Se eu te pedisse agora para me dizeres em voz alta quanto cobras pelo teu trabalho — ou quanto achas que vale uma hora do teu tempo — conseguias? Sem baixar os olhos. Sem rir. Sem dizer: ah, depende.",
      overlayText: "Quanto vale uma hora do teu tempo?",
      durationSec: 25,
      visualNote:
        "Silhueta de frente. Espelho dourado à frente. Reflexo nítido.",
    },
    {
      type: "situacao",
      narration:
        "Há uma cena que se repete em versões diferentes. Quem manda o orçamento e pede desculpa no email. Quem aceita o salário sem negociar. Quem faz desconto antes de alguém pedir. Quem oferece o trabalho de graça porque sente que cobrar é rude.\n\nEm todos estes casos, há um momento invisível. O momento em que pensas num valor — o valor real — e depois baixas. Trinta por cento, às vezes mais. Não porque a outra pessoa pediu. Mas porque uma voz dentro de ti decidiu que esse valor é demasiado. Que quem és tu para cobrar isso.\n\nE depois aceitas. Trabalhas. Entregas. E no final sentes uma coisa que não sabes bem nomear. Não é raiva. É mais como traição. Como se tivesses vendido algo que era teu por menos do que vale.",
      overlayText: "",
      durationSec: 100,
      visualNote:
        "Silhueta sentada, curvada ligeiramente. Moedas douradas no chão. Espelhos com reflexos distorcidos — a silhueta parece mais pequena no reflexo.",
    },
    {
      type: "revelacao",
      narration:
        "O que está por baixo disto não é falta de jeito para negociar. É uma crença profunda de que o teu valor pessoal está ligado ao teu valor monetário. E como algures no caminho decidiste que não vales muito — cobrar pouco torna-se uma forma de te proteger. Porque se cobras pouco, ninguém te pode rejeitar. Ninguém pode dizer: isto é caro demais. E rejeição — essa palavra — é o que realmente estás a evitar.\n\nO preço não é um número. É uma declaração. E cada vez que o baixas sem motivo, estás a declarar: eu não mereço isto.",
      overlayText: "O preço não é um número.\nÉ uma declaração.",
      durationSec: 80,
      visualNote:
        "Espelhos que limpam. Reflexo da silhueta cresce — fica do tamanho real. Luz dourada.",
    },
    {
      type: "gesto",
      narration:
        "O exercício é simples e desconfortável. Escolhe o valor mais importante que cobras — o teu salário, o teu serviço, a tua hora. E diz em voz alta. A sós. No carro, no chuveiro, onde quiseres. Diz o número. Sem acrescentar nada. Sem justificar. Repara no que acontece no corpo quando o dizes.\n\nDepois, aumenta dez por cento. E diz outra vez.",
      overlayText: "Diz o número.\nSem justificar.",
      durationSec: 50,
      visualNote:
        "Silhueta de pé, postura aberta. Mãos ao lado do corpo. Brilho dourado no peito.",
    },
    {
      type: "frase_final",
      narration:
        "O preço que cobras é o espelho do lugar que te dás. Muda o preço — e olha o que muda em ti.",
      overlayText:
        "O preço que cobras\né o espelho do lugar\nque te dás.",
      durationSec: 14,
      visualNote: "Ecrã escuro. Texto serifado. Silêncio.",
    },
    {
      type: "cta",
      narration:
        "No curso Ouro Próprio, o módulo quatro chama-se Cobrar, Receber, Merecer. É exactamente sobre isto. O primeiro módulo é gratuito. Link na descrição.",
      overlayText: "Ouro Próprio\nPrimeiro módulo gratuito\nseteveus.space",
      durationSec: 16,
      visualNote: "Território final. URL. Logo.",
    },
    {
      type: "fecho",
      narration: "",
      overlayText: "Sete Véus",
      durationSec: 8,
      visualNote: "Dissolve. Logo. Silêncio.",
    },
  ],
};

// ─── O FIO INVISÍVEL — HOOK 1 ─────────────────────────────────────────────

const fioInvisivelHook1: YouTubeScript = {
  courseSlug: "o-fio-invisivel",
  hookIndex: 0,
  title: "Porque choras sem razão aparente",
  durationMin: 7,
  thumbnail: {
    mainText: "Porque choras\nsem razão aparente",
    subText: "Talvez não seja só teu",
  },
  scenes: [
    {
      type: "abertura",
      narration: "",
      overlayText: "Porque choras sem razão aparente",
      durationSec: 12,
      visualNote:
        "Céu azul-marinho (#1A1A2E). Fade in lento do título em creme. Território do Lago dos Reflexos Partilhados ao longe — superfície opaca, prata.",
    },
    {
      type: "pergunta",
      narration:
        "Já te aconteceu chorares sem saber porquê? Não é tristeza. Não é cansaço. É uma coisa que sobe do fundo e que não tem nome. E quando alguém te pergunta o que se passa, dizes: nada. Porque realmente não sabes.",
      overlayText: "Nada. Porque realmente não sabes.",
      durationSec: 30,
      visualNote:
        "Silhueta de pé, mãos no peito. Lago opaco ao fundo. Reflexos indistintos na superfície.",
    },
    {
      type: "situacao",
      narration:
        "Imagina esta cena. Estás na cozinha. Acabaste de por as crianças a dormir. A casa está em silêncio. Sentas-te. E de repente — sem aviso — os olhos enchem-se de água.\n\nNão aconteceu nada. O dia foi normal. Ninguém te magoou. Mas algo pesa. Algo aperta. Algo quer sair e tu não sabes o que é.\n\nOu então estás a ver um filme. Uma cena qualquer — uma mãe que abraça uma filha, duas amigas que se reencontram — e começas a chorar de uma forma que não corresponde ao que estás a ver. Não é o filme. É outra coisa.\n\nE se eu te dissesse que talvez esse choro não seja só teu?",
      overlayText: "",
      durationSec: 100,
      visualNote:
        "Silhueta sentada, reflexiva. Lago com superfície que começa a ter ondulações suaves. Outros reflexos aparecem vagamente — silhuetas de outras figuras que não estão presentes.",
    },
    {
      type: "revelacao",
      narration:
        "Há uma ideia que a ciência está cada vez mais a confirmar: nós não somos tão separados como pensamos. O que a tua mãe sentiu e não disse, o teu corpo ouviu. O que a tua avó viveu e engoliu, ficou registado. A ansiedade de quem amas e nunca te contou — tu sentiste-a na última vez que estiveram juntos.\n\nNão é magia. Não é energia. É biologia. O sistema nervoso humano foi feito para se ligar. Para sentir o outro. Para carregar o que não é nomeado.\n\nE quando choras sem razão, pode ser que estejas a chorar por muitos. Por quem veio antes de ti e nunca chorou. Por quem não podia. Por quem ainda não sabe que vai precisar.\n\nEsse choro não é fraqueza. É a prova de que estás ligado a algo maior do que tu.",
      overlayText: "Quando choras sem razão,\npode ser que estejas\na chorar por muitos.",
      durationSec: 120,
      visualNote:
        "Lago a tornar-se transparente. Reflexos de várias silhuetas visíveis na água — gerações. Fios dourados a conectar os reflexos. Luz a crescer.",
    },
    {
      type: "gesto",
      narration:
        "A próxima vez que chorares sem razão, não limpes as lágrimas logo. Fica. Põe a mão no peito. E pergunta em silêncio: isto é meu ou é de alguém que veio antes de mim? Não precisas de resposta. Só de pergunta. O corpo sabe o que fazer com a pergunta certa.",
      overlayText: "Isto é meu\nou é de alguém\nque veio antes de mim?",
      durationSec: 45,
      visualNote:
        "Silhueta com mãos no peito. Lago calmo. Reflexos que se fundem suavemente.",
    },
    {
      type: "frase_final",
      narration:
        "Não estás só no que sentes. Nunca estiveste. Há um fio invisível que te liga a quem veio antes — e a quem vem depois.",
      overlayText:
        "Não estás só no que sentes.\nNunca estiveste.\nHá um fio invisível.",
      durationSec: 18,
      visualNote:
        "Ecrã escuro. Texto em creme, serifado, centrado. Pausa longa.",
    },
    {
      type: "cta",
      narration:
        "Se isto te tocou, o curso O Fio Invisível vai muito mais fundo. Oito módulos sobre a ligação entre todos nós — e como a tua cura toca o todo. O link está na descrição.",
      overlayText: "O Fio Invisível\nseteveus.space",
      durationSec: 18,
      visualNote:
        "Lago dos Reflexos Partilhados com superfície transparente. Fios dourados visíveis. URL no ecrã.",
    },
    {
      type: "fecho",
      narration: "",
      overlayText: "Sete Véus",
      durationSec: 8,
      visualNote:
        "Território dissolve no céu. Logo Sete Véus. Silêncio. Fade para negro.",
    },
  ],
};

// ─── O ESPELHO DO OUTRO — HOOK 1 ─────────────────────────────────────────

const espelhoOutroHook1: YouTubeScript = {
  courseSlug: "o-espelho-do-outro",
  hookIndex: 0,
  title: "Porque aquela pessoa te irrita tanto",
  durationMin: 7,
  thumbnail: {
    mainText: "Porque aquela pessoa\nte irrita tanto",
    subText: "O que o outro te mostra sobre ti",
  },
  scenes: [
    {
      type: "abertura",
      narration: "",
      overlayText: "Porque aquela pessoa te irrita tanto",
      durationSec: 12,
      visualNote:
        "Céu azul-marinho. Título em creme. Território da Galeria dos Reflexos Vivos ao longe.",
    },
    {
      type: "pergunta",
      narration:
        "Há alguém na tua vida — pode ser um colega, alguém da família, uma pessoa que mal conheces — que te irrita de uma forma que não faz sentido. Não te fez nada de grave. Mas cada vez que fala, algo dentro de ti contrai. Já te perguntaste porquê?",
      overlayText: "Cada vez que fala,\nalgo dentro de ti contrai.",
      durationSec: 28,
      visualNote:
        "Duas silhuetas frente a frente. Uma tensa, outra relaxada. Galeria com espelhos vivos ao fundo.",
    },
    {
      type: "situacao",
      narration:
        "Imagina. Estás num jantar. Essa pessoa está lá. Fala alto. Ocupa espaço. Diz o que pensa sem pedir licença. E tu, que passas a vida a medir palavras, a ponderar, a ter cuidado com o que dizes — sentes um calor a subir.\n\nNão é raiva exactamente. É irritação. Uma irritação que parece desproporcionada. Porque não te fez nada. Não te insultou. Não te traiu.\n\nMas irrita-te.\n\nE quando contas a alguém, dizes: não sei, há qualquer coisa nessa pessoa que me incomoda. E essa qualquer coisa — essa coisa que não sabes nomear — é a pista mais importante que vais receber hoje.",
      overlayText: "",
      durationSec: 100,
      visualNote:
        "Silhueta sentada a observar outra silhueta que gesticula livremente. Espelhos na galeria que reflectem não a cena mas emoções — distorções cromáticas.",
    },
    {
      type: "revelacao",
      narration:
        "O que te irrita no outro é quase sempre algo que vive em ti e que não te permites. Essa pessoa fala alto — e tu calaste-te a vida inteira. Ocupa espaço — e tu aprendeste a encolher. Diz o que pensa — e tu medes cada palavra com medo de incomodar.\n\nA irritação não é sobre o outro. É sobre a parte de ti que gostava de ser assim mas que decidiu, há muito tempo, que isso não era permitido.\n\nIsto não significa que essa pessoa tem razão ou que é melhor. Significa que o teu corpo está a reagir a algo que reconhece — algo que é teu e que escondeste.\n\nO outro é um espelho. E quando o espelho te incomoda, raramente é por causa do espelho.",
      overlayText: "Quando o espelho te incomoda,\nraramente é por causa\ndo espelho.",
      durationSec: 110,
      visualNote:
        "Espelhos da galeria que se tornam mais claros. A silhueta vê o seu próprio reflexo no lugar da outra pessoa. Momento de reconhecimento.",
    },
    {
      type: "gesto",
      narration:
        "Esta semana, quando alguém te irritar, pára. Não rejas logo. Pergunta-te: o que é que esta pessoa está a fazer que eu gostava de fazer e não me permito? Escreve a resposta. Não para ela. Para ti.",
      overlayText: "O que é que eu gostava de fazer\ne não me permito?",
      durationSec: 40,
      visualNote:
        "Silhueta com mão no peito, olhando para o próprio reflexo no espelho. Luz dourada.",
    },
    {
      type: "frase_final",
      narration:
        "As pessoas que mais te incomodam são as que mais te ensinam. Não porque tenham razão — mas porque te mostram o que ainda está escondido.",
      overlayText:
        "As pessoas que mais te incomodam\nsão as que mais te ensinam.",
      durationSec: 16,
      visualNote:
        "Ecrã escuro. Texto em creme, serifado. Pausa longa.",
    },
    {
      type: "cta",
      narration:
        "Se isto te tocou, o curso O Espelho do Outro vai muito mais fundo. Oito módulos para aprenderes a ver-te através de cada relação. O link está na descrição.",
      overlayText: "O Espelho do Outro\nseteveus.space",
      durationSec: 18,
      visualNote:
        "Galeria dos Reflexos Vivos com espelhos claros. URL no ecrã.",
    },
    {
      type: "fecho",
      narration: "",
      overlayText: "Sete Véus",
      durationSec: 8,
      visualNote:
        "Território dissolve no céu. Logo Sete Véus. Silêncio.",
    },
  ],
};

// ─── O SILÊNCIO QUE GRITA — HOOK 1 ───────────────────────────────────────

const silencioGritaHook1: YouTubeScript = {
  courseSlug: "o-silencio-que-grita",
  hookIndex: 0,
  title: "O segredo que toda a tua família sabe mas ninguém diz",
  durationMin: 7,
  thumbnail: {
    mainText: "O segredo que toda a família\nsabe mas ninguém diz",
    subText: "O silêncio que vive no teu corpo",
  },
  scenes: [
    {
      type: "abertura",
      narration: "",
      overlayText: "O segredo que toda a tua família sabe\nmas ninguém diz",
      durationSec: 12,
      visualNote:
        "Céu azul-marinho. Título em creme. Caverna dos Ecos Mudos ao longe — escura, silenciosa.",
    },
    {
      type: "pergunta",
      narration:
        "Na tua família, há alguma coisa de que ninguém fala? Um assunto que todos evitam? Uma pessoa que desapareceu da conversa? Uma história que muda de versão cada vez que alguém a conta?",
      overlayText: "Uma história que muda de versão\ncada vez que alguém a conta.",
      durationSec: 25,
      visualNote:
        "Silhueta de pé numa caverna escura. Paredes que parecem absorver o som. Silêncio visual.",
    },
    {
      type: "situacao",
      narration:
        "Todas as famílias têm segredos. Não precisa de ser um drama. Às vezes é um divórcio que foi tratado como se nunca tivesse existido. Uma doença mental que se chamava 'nervos'. Uma gravidez que se escondeu. Um avô que ninguém menciona.\n\nE tu cresceste nesse silêncio. Não te disseram para não falar — simplesmente percebeste. Pelo olhar da tua mãe quando o assunto se aproximava. Pela mudança de conversa. Pela tensão que entrava na sala quando alguém tocava no tema.\n\nE aprendeste: há coisas de que não se fala.\n\nO problema é que o corpo não aprendeu. O corpo guarda tudo. O que foi dito e o que foi calado. E o que foi calado pesa mais.",
      overlayText: "",
      durationSec: 110,
      visualNote:
        "Várias silhuetas numa sala — família. Algumas viradas de costas umas para as outras. Sombras de palavras não ditas flutuam como ecos escuros nas paredes.",
    },
    {
      type: "revelacao",
      narration:
        "Os segredos familiares não desaparecem quando ninguém fala deles. Passam para o corpo. Para a geração seguinte. Para ti.\n\nA ansiedade que sentes e não sabes explicar. A vergonha que aparece sem razão. O medo de certas conversas. O aperto na garganta quando alguém se aproxima de um tema proibido.\n\nNão é teu. Ou melhor — tornou-se teu porque ninguém lhe deu nome antes de ti.\n\nE o mais estranho é isto: quando uma pessoa na família finalmente fala, algo muda no sistema inteiro. Como se o silêncio fosse uma represa — e uma única palavra bastasse para a água voltar a correr.",
      overlayText: "Quando uma pessoa fala,\nalgo muda\nno sistema inteiro.",
      durationSec: 100,
      visualNote:
        "Caverna que começa a ter ecos visíveis — ondas de luz nas paredes. Silhueta que abre a boca. Primeiro som visual.",
    },
    {
      type: "gesto",
      narration:
        "Não precisas de confrontar ninguém. Pega num papel. Escreve uma frase que começa assim: na minha família, nunca se fala sobre... Não penses. Escreve. Depois lê o que escreveste. E repara no que sentes no corpo ao ler.",
      overlayText: "Na minha família,\nnunca se fala sobre...",
      durationSec: 40,
      visualNote:
        "Silhueta com mão estendida. Eco dourado a sair. Paredes da caverna a vibrar.",
    },
    {
      type: "frase_final",
      narration:
        "O que a tua família nunca disse não desapareceu. Vive no teu corpo. E talvez seja a tua vez de dar voz ao que foi calado.",
      overlayText:
        "O que a tua família nunca disse\nnão desapareceu.\nVive no teu corpo.",
      durationSec: 16,
      visualNote:
        "Ecrã escuro. Texto em creme. Pausa longa. Peso.",
    },
    {
      type: "cta",
      narration:
        "Se isto te tocou, o curso O Silêncio que Grita vai muito mais fundo. Oito módulos para ouvir o que nunca foi dito — e começar a libertar o que já não te pertence. O link está na descrição.",
      overlayText: "O Silêncio que Grita\nseteveus.space",
      durationSec: 18,
      visualNote:
        "Caverna dos Ecos Mudos com ondas de luz dourada. URL no ecrã.",
    },
    {
      type: "fecho",
      narration: "",
      overlayText: "Sete Véus",
      durationSec: 8,
      visualNote:
        "Território dissolve no céu. Logo Sete Véus. Silêncio.",
    },
  ],
};

// ─── A TEIA — HOOK 1 ─────────────────────────────────────────────────────

const teiaHook1: YouTubeScript = {
  courseSlug: "a-teia",
  hookIndex: 0,
  title: "O que calaste para ser aceite",
  durationMin: 7,
  thumbnail: {
    mainText: "O que calaste\npara ser aceite",
    subText: "O preço da pertença",
  },
  scenes: [
    {
      type: "abertura",
      narration: "",
      overlayText: "O que calaste para ser aceite",
      durationSec: 12,
      visualNote:
        "Céu azul-marinho. Título em creme. Bosque dos Fios Entrelaçados ao longe — fios verde-musgo e dourado.",
    },
    {
      type: "pergunta",
      narration:
        "Quando foi a última vez que disseste o que realmente pensavas num grupo? Não a versão educada. Não a versão aceite. A versão verdadeira. A que guardas para ti no caminho de volta para casa.",
      overlayText: "A versão que guardas\npara o caminho de volta.",
      durationSec: 25,
      visualNote:
        "Silhueta rodeada por outras silhuetas — em grupo. A silhueta central ligeiramente mais pequena, encolhida.",
    },
    {
      type: "situacao",
      narration:
        "Estás num almoço com amigos. Alguém diz algo com que não concordas. Sobre educação dos filhos. Sobre politica. Sobre a forma como outra pessoa foi tratada.\n\nE sentes aquilo dentro de ti — a vontade de dizer. A tua versão. A tua verdade. Mas olhas à volta. E decides que não vale a pena. Que vai criar atrito. Que vão olhar para ti de lado.\n\nEntão sorris. Acenas. Mudas de assunto. E no caminho de volta para casa, no carro, a sós — dizes tudo o que devias ter dito. Mas já não conta.\n\nIsto não acontece uma vez. Acontece sempre. Em cada grupo, em cada relação, em cada contexto onde sentes que a tua verdade pode custar-te o lugar.\n\nE a pergunta é: que lugar é esse, se para lá estar tens de desaparecer?",
      overlayText: "",
      durationSec: 110,
      visualNote:
        "Silhueta em grupo — sorri mas o corpo está tenso. Fios entrelaçados que a prendem subtilmente. Depois: silhueta sozinha no carro, boca aberta, finalmente a falar — mas sem ninguém a ouvir.",
    },
    {
      type: "revelacao",
      narration:
        "Pertencer é a necessidade humana mais antiga. O cérebro trata a rejeição como uma ameaça de morte — literalmente. As mesmas zonas do cérebro que se activam com dor física activam-se quando és excluído.\n\nPor isso aprendeste cedo a adaptar-te. A ler a sala. A perceber o que é aceite e o que não é. A moldar-te ao formato do grupo.\n\nMas há um preço. E o preço é este: cada vez que te moldas, perdes um pedaço de contorno. E ao fim de anos, olhas para ti e não sabes quem és sem o grupo. Sem a aprovação. Sem o sorriso do outro.\n\nA boa notícia é que podes pertencer sem desaparecer. Mas primeiro precisas de perceber o que abdicaste para caber.",
      overlayText: "Cada vez que te moldas,\nperdes um pedaço de contorno.",
      durationSec: 100,
      visualNote:
        "Fios que se afrouxam gradualmente. Silhueta que recupera o contorno. Bosque que se torna mais luminoso — verde e dourado.",
    },
    {
      type: "gesto",
      narration:
        "Esta semana, numa conversa em grupo, diz uma coisa verdadeira. Não precisa de ser polémica. Não precisa de ser grande. Pode ser: eu não concordo. Ou: eu penso diferente. Ou simplesmente: não. E repara no que acontece no teu corpo quando dizes.",
      overlayText: "Eu penso diferente.",
      durationSec: 40,
      visualNote:
        "Silhueta no grupo, agora de pé, com contorno definido. Fios que a ligam sem a prender. Equilíbrio.",
    },
    {
      type: "frase_final",
      narration:
        "Pertencer não é desaparecer. Pertencer de verdade é ser visto como és — e ainda assim ter lugar.",
      overlayText:
        "Pertencer não é desaparecer.\nÉ ser visto como és\ne ainda assim ter lugar.",
      durationSec: 16,
      visualNote:
        "Ecrã escuro. Texto em creme, serifado. Pausa.",
    },
    {
      type: "cta",
      narration:
        "Se isto te tocou, o curso A Teia vai muito mais fundo. Oito módulos para aprenderes a pertencer sem desaparecer. O link está na descrição.",
      overlayText: "A Teia\nseteveus.space",
      durationSec: 18,
      visualNote:
        "Bosque dos Fios Entrelaçados com fios dourados equilibrados. URL no ecrã.",
    },
    {
      type: "fecho",
      narration: "",
      overlayText: "Sete Véus",
      durationSec: 8,
      visualNote:
        "Território dissolve no céu. Logo Sete Véus. Silêncio.",
    },
  ],
};

// ─── A CHAMA — HOOK 1 ────────────────────────────────────────────────────

const chamaHook1: YouTubeScript = {
  courseSlug: "a-chama",
  hookIndex: 0,
  title: "Porque sorris quando queres gritar",
  durationMin: 7,
  thumbnail: {
    mainText: "Porque sorris\nquando queres gritar",
    subText: "A raiva que guardas",
  },
  scenes: [
    {
      type: "abertura",
      narration: "",
      overlayText: "Porque sorris quando queres gritar",
      durationSec: 12,
      visualNote:
        "Céu azul-marinho. Título em creme. Vulcão Adormecido ao longe — superfície negra, brilho vermelho por baixo.",
    },
    {
      type: "pergunta",
      narration:
        "A última vez que sentiste raiva a sério — o que fizeste com ela? Gritaste? Choraste? Ou sorriste e disseste 'está tudo bem'?",
      overlayText: "O que fizeste\ncom a tua raiva?",
      durationSec: 20,
      visualNote:
        "Silhueta rígida, mandíbula cerrada. Fundo escuro com brilho vermelho subtil por baixo da superfície.",
    },
    {
      type: "situacao",
      narration:
        "Na reunião disseram-te que o projecto que fizeste sozinho ia ser apresentado por outra pessoa. Sentiste o calor subir. A mandíbula cerrar. Os olhos arder.\n\nMas o que fizeste? Sorriste. Disseste 'claro, faz sentido'. E no carro, a sós, as mãos tremiam no volante. Não de medo. De raiva.\n\nUma raiva que nunca te ensinaram a ter. Porque pessoas boas não gritam. Pessoas fortes não perdem o controlo. E tu — tu aprendeste tão bem a engolir que já nem sabes o que é raiva e o que é cansaço.\n\nA mandíbula dói. As costas travam. O estômago fecha. E tu chamas a tudo isto 'stress'.",
      overlayText: "",
      durationSec: 110,
      visualNote:
        "Silhueta a sorrir numa reunião — corpo tenso. Depois: silhueta no carro, mãos a tremer. Fissuras a aparecer na superfície do vulcão.",
    },
    {
      type: "revelacao",
      narration:
        "A raiva é uma das emoções mais censuradas. Desde cedo aprendes que mostrar raiva é perigoso. Que se a mostrasses, perdias amor. Perdias aprovação. Perdias o teu lugar.\n\nEntão guardaste-a. Na mandíbula. Nas costas. No estômago. Transformaste-a em cansaço, em sarcasmo, em controlo, em choro.\n\nMas a raiva não desaparece porque a escondes. Cresce. E um dia sai — nos sítios errados, nas pessoas erradas, da forma errada.\n\nNão porque sejas má pessoa. Porque nunca te deixaram ser inteiro.",
      overlayText: "A raiva não desaparece\nporque a escondes.\nCresce.",
      durationSec: 100,
      visualNote:
        "Fissuras a abrir na superfície do vulcão. Lava visível. Calor a subir. Silhueta que começa a sentir — mãos a abrir lentamente.",
    },
    {
      type: "gesto",
      narration:
        "Esta semana, repara. Quando sorrires e o corpo disser outra coisa — para. Pergunta-te: estou a sorrir ou estou a engolir? Não precisas de gritar. Não precisas de explodir. Só precisas de notar.",
      overlayText: "Estou a sorrir\nou estou a engolir?",
      durationSec: 35,
      visualNote:
        "Silhueta de pé junto ao vulcão. Lava em canais controlados. Fogo que ilumina sem destruir.",
    },
    {
      type: "frase_final",
      narration:
        "A raiva não é o contrário do amor. O silêncio forçado é.",
      overlayText: "A raiva não é o contrário do amor.\nO silêncio forçado é.",
      durationSec: 14,
      visualNote:
        "Ecrã escuro. Texto em creme, serifado. Pausa.",
    },
    {
      type: "cta",
      narration:
        "Se isto te tocou, o curso Brasa Viva vai muito mais fundo. Oito módulos para recuperares a tua raiva como força. O link está na descrição.",
      overlayText: "Brasa Viva\nseteveus.space",
      durationSec: 18,
      visualNote:
        "Vulcão com lava controlada. Luz vermelha e dourada. URL no ecrã.",
    },
    {
      type: "fecho",
      narration: "",
      overlayText: "Sete Véus",
      durationSec: 8,
      visualNote:
        "Território dissolve no céu. Logo Sete Véus. Silêncio.",
    },
  ],
};

// ─── A MULHER ANTES DE MÃE — HOOK 1 ────────────────────────────────────

const mulherAntesDeMaeHook1: YouTubeScript = {
  courseSlug: "a-mulher-antes-de-mae",
  hookIndex: 0,
  title: "Quando foi a última vez que alguém te chamou pelo teu nome",
  durationMin: 7,
  thumbnail: {
    mainText: "O teu nome\nantes de 'mãe'",
    subText: "A mulher que desapareceu",
  },
  scenes: [
    {
      type: "abertura",
      narration: "",
      overlayText: "Quando foi a última vez que alguém te chamou pelo teu nome?",
      durationSec: 12,
      visualNote:
        "Céu azul-marinho. Título em creme. Ninho que Pesa ao longe — enorme, ocre quente.",
    },
    {
      type: "pergunta",
      narration:
        "Pensa. Quando foi a última vez que alguém te chamou pelo teu nome? Não 'mãe'. Não 'amor'. O teu nome. E o que sentiste?",
      overlayText: "O teu nome.\nLembras-te dele?",
      durationSec: 20,
      visualNote:
        "Silhueta dentro de ninho enorme. Quase invisível. Só se vê 'mãe' — a mulher desapareceu.",
    },
    {
      type: "situacao",
      narration:
        "São sete da manhã. Já fizeste três coisas antes de abrir os olhos — o lanche, a mochila, o banho. O teu café ficou frio. Outra vez.\n\nNa casa de banho, cinco minutos. É o único sítio onde ninguém bate. Olhas-te ao espelho e por um segundo não reconheces quem está ali.\n\nNão é que estejas mal. É que não estás. A mulher que eras antes dos filhos — a que dançava, a que lia, a que tinha opiniões sobre cinema — onde foi?\n\nE quando alguém te pergunta 'como estás?' respondes sempre a mesma coisa: 'estou bem, os miúdos estão bem'. Os miúdos estão bem. E tu?",
      overlayText: "",
      durationSec: 110,
      visualNote:
        "Silhueta no ninho, rodeada de pequenas silhuetas que puxam, precisam, chamam. Depois: silhueta sozinha na casa de banho, olhar perdido no espelho.",
    },
    {
      type: "revelacao",
      narration:
        "Ninguém te avisou que quando um filho nasce, uma mulher morre. Não fisicamente. Mas a versão de ti que existia antes — a que tinha tempo, corpo, desejo, nome — essa desapareceu.\n\nE no lugar dela ficou 'mãe'. Uma função. Uma lista de tarefas. Uma culpa infinita.\n\nE o mais cruel: se sentes falta de ti mesma, a culpa duplica. Porque uma boa mãe não devia querer ser outra coisa. Devia bastar.\n\nMas não basta. E sentir isso não te faz má mãe. Faz-te humana. Faz-te inteira. Faz-te uma mulher que existia antes dos filhos e que merece continuar a existir.",
      overlayText: "Quando um filho nasce,\numa mulher desaparece.\nNinguém te avisou.",
      durationSec: 100,
      visualNote:
        "Silhueta a emergir do ninho. Contorno próprio a aparecer. Duas formas da mesma pessoa — mãe e mulher — a separar-se suavemente.",
    },
    {
      type: "gesto",
      narration:
        "Esta semana, faz uma coisa só tua. Não para os filhos. Não para a casa. Pode ser ler dez páginas. Pode ser andar à chuva. Pode ser sentar-te e não fazer nada durante quinze minutos. E quando a culpa aparecer — repara nela. Não a obedeças. Só repara.",
      overlayText: "Uma coisa só tua.\nSem culpa.",
      durationSec: 40,
      visualNote:
        "Silhueta fora do ninho, mão no próprio peito. Ninho bonito atrás. Espaço entre as duas. Luz ocre quente.",
    },
    {
      type: "frase_final",
      narration:
        "Sentir falta de ti mesma não é egoísmo. É o primeiro sinal de que ainda estás lá.",
      overlayText: "Sentir falta de ti mesma\nnão é egoísmo.",
      durationSec: 14,
      visualNote:
        "Ecrã escuro. Texto em creme, serifado. Pausa.",
    },
    {
      type: "cta",
      narration:
        "Se isto te tocou, o curso Antes do Ninho vai muito mais fundo. Oito módulos para te reencontrares sem culpa. O link está na descrição.",
      overlayText: "Antes do Ninho\nseteveus.space",
      durationSec: 18,
      visualNote:
        "Ninho com espaço. Silhueta inteira. URL no ecrã.",
    },
    {
      type: "fecho",
      narration: "",
      overlayText: "Sete Véus",
      durationSec: 8,
      visualNote:
        "Território dissolve no céu. Logo Sete Véus. Silêncio.",
    },
  ],
};

// ─── O OFÍCIO DE SER — HOOK 1 ───────────────────────────────────────────

const oficioDeSerHook1: YouTubeScript = {
  courseSlug: "o-oficio-de-ser",
  hookIndex: 0,
  title: "Porque o cansaço não passa com férias",
  durationMin: 7,
  thumbnail: {
    mainText: "O cansaço\nque não passa",
    subText: "Férias não resolvem isto",
  },
  scenes: [
    {
      type: "abertura",
      narration: "",
      overlayText: "Porque o cansaço não passa com férias",
      durationSec: 12,
      visualNote:
        "Céu azul-marinho. Título em creme. Oficina Infinita ao longe — máquinas, escuro, sem janela.",
    },
    {
      type: "pergunta",
      narration:
        "Voltaste de férias. Descansaste. Dormiste. E na segunda-feira, quando abriste o portátil, o cansaço era exactamente o mesmo. Como se nunca tivesses saído. Porquê?",
      overlayText: "Porquê?",
      durationSec: 22,
      visualNote:
        "Silhueta curvada sobre mesa. Máquinas a trabalhar. Sem janela. Bronze escuro.",
    },
    {
      type: "situacao",
      narration:
        "A tua semana é uma máquina perfeita. Reuniões, entregas, emails, decisões. Tens orgulho de ser eficiente. De dar conta. De nunca falhar.\n\nMas num domingo, quando não há nada para fazer, sentes um vazio. Não sabes o que fazer contigo quando não estás a produzir. E o que fazes? Abres o portátil. Respondes a emails. Crias tarefas.\n\nPorque parar é sentir. E sentir — isso não está na agenda.\n\nE quando alguém te pergunta 'o que gostas de fazer?' ficas em branco. Porque há anos que 'fazer' significa trabalho. E tudo o resto desapareceu.",
      overlayText: "",
      durationSec: 100,
      visualNote:
        "Silhueta a correr entre máquinas. Agenda cheia como engrenagens. Depois: silhueta parada num domingo — vazia, perdida sem tarefas.",
    },
    {
      type: "revelacao",
      narration:
        "O burnout não é trabalhar demais. É viver de menos. O corpo cansa-se de manter uma vida que não alimenta.\n\nE o trabalho torna-se o anestésico perfeito — é o único sítio onde sentes que vales alguma coisa. Tiras valor do que produzes. Do cargo. Do reconhecimento.\n\nE quando isso para — nas férias, numa pausa, numa doença — não há nada por baixo. Só o vazio.\n\nO burnout é o corpo a dizer: estou cansado de ser uma máquina. Quero ser uma pessoa. Não é fraqueza. É a mensagem mais importante que vais receber.",
      overlayText: "O burnout não é\ntrabalhar demais.\nÉ viver de menos.",
      durationSec: 95,
      visualNote:
        "Máquinas a parar. Janela a abrir. Luz bronze a entrar. Silhueta a endireitar-se lentamente.",
    },
    {
      type: "gesto",
      narration:
        "Amanhã, antes de abrires o portátil, para. Pergunta-te: estou a fazer isto porque preciso ou porque parar me assusta? Se a resposta te incomodar, fica com ela. Não a resolvas. Só nota.",
      overlayText: "Preciso ou parar\nassusta-me?",
      durationSec: 35,
      visualNote:
        "Oficina calma. Janela aberta. Silhueta sentada sem fazer nada. Luz bronze quente.",
    },
    {
      type: "frase_final",
      narration:
        "O cansaço que não passa com férias não é do corpo. É da vida que levas.",
      overlayText: "Não é do corpo.\nÉ da vida que levas.",
      durationSec: 14,
      visualNote:
        "Ecrã escuro. Texto em creme, serifado. Pausa.",
    },
    {
      type: "cta",
      narration:
        "Se isto te tocou, o curso Mãos Cansadas vai muito mais fundo. Oito módulos para trabalhares sem desaparecer. O link está na descrição.",
      overlayText: "Mãos Cansadas\nseteveus.space",
      durationSec: 18,
      visualNote:
        "Oficina com janela aberta. Luz quente. URL no ecrã.",
    },
    {
      type: "fecho",
      narration: "",
      overlayText: "Sete Véus",
      durationSec: 8,
      visualNote:
        "Território dissolve no céu. Logo Sete Véus. Silêncio.",
    },
  ],
};

// ─── O RELÓGIO PARTIDO — HOOK 1 ────────────────────────────────────────

const relogioPartidoHook1: YouTubeScript = {
  courseSlug: "o-relogio-partido",
  hookIndex: 0,
  title: "Porque sentes que já é tarde demais",
  durationMin: 7,
  thumbnail: {
    mainText: "Já é tarde\ndemais?",
    subText: "A mentira mais cruel",
  },
  scenes: [
    {
      type: "abertura",
      narration: "",
      overlayText: "Porque sentes que já é tarde demais",
      durationSec: 12,
      visualNote:
        "Céu azul-marinho. Título em creme. Jardim das Estações ao longe — relógio gigante, flores aceleradas.",
    },
    {
      type: "pergunta",
      narration:
        "Já é tarde para mudar de vida. Já é tarde para começar algo novo. Já é tarde para seres quem querias ser. Tens a certeza? Ou é o relógio a falar por ti?",
      overlayText: "É o relógio\na falar por ti?",
      durationSec: 22,
      visualNote:
        "Silhueta a correr num jardim com relógio enorme. Flores a nascer e morrer em segundos. Prateado e âmbar.",
    },
    {
      type: "situacao",
      narration:
        "Tinhas planos. Ias viajar. Ias escrever. Ias começar aquele negócio. Ias dizer o que sentias. E depois a vida aconteceu. Os filhos. O trabalho. As contas.\n\nE agora olhas para trás e pensas: perdi tempo. Devia ter feito há dez anos. E olhas para a frente e pensas: já não vale a pena. É tarde. Tenho 42 anos. Ou 48. Ou 55.\n\nE o relógio bate mais alto que qualquer desejo.\n\nVês outras pessoas a começar — mais novas, mais livres — e pensas: para elas ainda dá. Para mim já passou.",
      overlayText: "",
      durationSec: 100,
      visualNote:
        "Silhueta a olhar para trás — versões mais jovens a desaparecer. Depois: silhueta parada, relógio enorme atrás. Imobilizada pelo tempo.",
    },
    {
      type: "revelacao",
      narration:
        "Casar até aos 30. Filhos até aos 35. Carreira até aos 40. Corpo perfeito até aos 45. Quem decidiu isto? Não foste tu.\n\nForam regras que absorveste antes de teres voz. E agora vives com um relógio interno que te diz que cada ano que passa é um ano perdido.\n\nMas repara: quando dizes 'é tarde', o que realmente sentes é medo. Medo de falhar. Medo de parecer ridícula. Medo de começar do zero quando os outros parecem ter chegado.\n\n'Tarde' é uma ilusão. Não existe um horário certo para a tua vida. Existe este momento. E neste momento ainda estás aqui. Ainda estás viva. E isso é o suficiente para começar.",
      overlayText: "'Tarde' é uma ilusão.\nNão existe um horário certo\npara a tua vida.",
      durationSec: 100,
      visualNote:
        "Relógio com fissuras. Tempo a abrandar. Estações a coexistir — primavera e outono lado a lado. Silhueta a parar de correr.",
    },
    {
      type: "gesto",
      narration:
        "Pega num papel. Escreve uma coisa que adias porque achas que é tarde. Uma só. Agora escreve por baixo: o que me impede não é o tempo — é o medo de quê? Lê o que escreveste. O inimigo nunca foi o relógio.",
      overlayText: "O inimigo nunca\nfoi o relógio.",
      durationSec: 40,
      visualNote:
        "Relógio partido. Jardim com todas as estações em paz. Silhueta sentada, presente. Luz âmbar-prateada.",
    },
    {
      type: "frase_final",
      narration:
        "Nunca é tarde para agora. O único momento que tens é este.",
      overlayText: "Nunca é tarde\npara agora.",
      durationSec: 12,
      visualNote:
        "Ecrã escuro. Texto em creme, serifado. Pausa.",
    },
    {
      type: "cta",
      narration:
        "Se isto te tocou, o curso Estações Partidas vai muito mais fundo. Oito módulos para largares a pressa e viveres no presente. O link está na descrição.",
      overlayText: "Estações Partidas\nseteveus.space",
      durationSec: 18,
      visualNote:
        "Jardim sem relógio. Todas as estações. URL no ecrã.",
    },
    {
      type: "fecho",
      narration: "",
      overlayText: "Sete Véus",
      durationSec: 8,
      visualNote:
        "Território dissolve no céu. Logo Sete Véus. Silêncio.",
    },
  ],
};

// ─── A COROA ESCONDIDA — HOOK 1 ────────────────────────────────────────

const coroaEscondidaHook1: YouTubeScript = {
  courseSlug: "a-coroa-escondida",
  hookIndex: 0,
  title: "A auto-sabotagem explicada: porque estragas quando está a correr bem",
  durationMin: 8,
  thumbnail: {
    mainText: "Porque estragas\nquando corre bem",
    subText: "A auto-sabotagem",
  },
  scenes: [
    {
      type: "abertura",
      narration: "",
      overlayText: "Porque estragas quando está a correr bem",
      durationSec: 12,
      visualNote:
        "Céu azul-marinho. Título em creme. Trono Coberto ao longe — sala escura, panos sobre o trono.",
    },
    {
      type: "pergunta",
      narration:
        "Estava a correr bem. Tinhas finalmente conseguido. E depois fizeste aquela coisa. Sabotaste. Porquê?",
      overlayText: "Porquê?",
      durationSec: 18,
      visualNote:
        "Silhueta encolhida de costas para um trono coberto. Sala escura. Dourado e púrpura escondidos sob panos.",
    },
    {
      type: "situacao",
      narration:
        "Recebeste a promoção. Ou o convite. Ou o elogio. E durante cinco minutos sentiste-te bem. Mas depois começou.\n\nO pensamento: vão descobrir. Não sou assim tão boa. Foi sorte.\n\nE sem perceberes, começaste a fazer coisas que estragavam tudo. Chegaste atrasada. Não respondeste ao email. Arranjaste uma discussão. Desististe antes de começar.\n\nE quando tudo desmoronou, sentiste uma coisa estranha: alívio. Não era felicidade. Era: pelo menos já não tenho de sustentar aquilo.\n\nE o padrão repete-se. Sempre que te aproximas de algo bom — sabotais. Como um relógio.",
      overlayText: "",
      durationSec: 110,
      visualNote:
        "Silhueta quase a sentar-se no trono — recua. Panos voltam a cobrir. Silhueta no canto — alívio e vergonha.",
    },
    {
      type: "revelacao",
      narration:
        "A auto-sabotagem não é estupidez. É protecção. O teu sistema nervoso aprendeu que ter é perigoso.\n\nTalvez porque quando eras pequena, ter atenção significava inveja. Ou porque quando brilhavas, alguém te apagava. Ou porque aprendeste que o sucesso significa solidão — que se fores demasiado, os outros vão embora.\n\nEntão o corpo cria um mecanismo: destrói antes que seja destruído. Sabota antes que alguém te tire o que conquistaste.\n\nÉ um reflexo de sobrevivência. Mas já não precisas dele. A criança que aprendeu que brilhar era perigoso já cresceu. E a adulta pode decidir: desta vez, fico.",
      overlayText: "A auto-sabotagem não é\nestupidez.\nÉ protecção.",
      durationSec: 105,
      visualNote:
        "Panos a cair do trono. Dourado e púrpura a aparecer. Silhueta a olhar com medo e curiosidade. Luz a crescer.",
    },
    {
      type: "gesto",
      narration:
        "A próxima vez que algo correr bem — e sentires a vontade de estragar — para. Respira. E diz internamente: isto é medo, não verdade. Posso ter isto. Não precisas de sentar no trono hoje. Só precisas de parar de o cobrir.",
      overlayText: "Isto é medo,\nnão verdade.\nPosso ter isto.",
      durationSec: 40,
      visualNote:
        "Silhueta de pé junto ao trono. Mão a tocar no encosto. Hesitação a transformar-se em decisão.",
    },
    {
      type: "frase_final",
      narration:
        "Não estragas porque não mereces. Estragas porque ter é mais assustador que querer.",
      overlayText: "Ter é mais assustador\nque querer.",
      durationSec: 14,
      visualNote:
        "Ecrã escuro. Texto em creme, serifado. Pausa.",
    },
    {
      type: "cta",
      narration:
        "Se isto te tocou, o curso Ouro e Sombra vai muito mais fundo. Oito módulos para parares de te esconder. O link está na descrição.",
      overlayText: "Ouro e Sombra\nseteveus.space",
      durationSec: 18,
      visualNote:
        "Trono descoberto. Silhueta de pé, coroa visível. Dourado-púrpura. URL no ecrã.",
    },
    {
      type: "fecho",
      narration: "",
      overlayText: "Sete Véus",
      durationSec: 8,
      visualNote:
        "Território dissolve no céu. Logo Sete Véus. Silêncio.",
    },
  ],
};

// ─── A FOME — HOOK 1 ────────────────────────────────────────────────────

const fomeHook1: YouTubeScript = {
  courseSlug: "a-fome",
  hookIndex: 0,
  title: "O que procuras no frigorífico à meia-noite",
  durationMin: 7,
  thumbnail: {
    mainText: "O frigorífico\nà meia-noite",
    subText: "A fome que não é de comida",
  },
  scenes: [
    {
      type: "abertura",
      narration: "",
      overlayText: "O que procuras no frigorífico à meia-noite",
      durationSec: 12,
      visualNote:
        "Céu azul-marinho. Título em creme. Mesa Vazia ao longe — mesa enorme, prato vazio, escuridão.",
    },
    {
      type: "pergunta",
      narration:
        "Não tens fome. Sabes que não tens fome. Mas abres o frigorífico na mesma. De pé, no escuro da cozinha. O que procuras lá dentro?",
      overlayText: "O que procuras\nlá dentro?",
      durationSec: 20,
      visualNote:
        "Silhueta sentada frente a mesa vazia. Prato vazio. Luz fraca terracota-rosada.",
    },
    {
      type: "situacao",
      narration:
        "São onze da noite. O dia foi longo. Os miúdos dormiram. O parceiro dorme. E tu estás na cozinha. De pé. A comer pão com manteiga. Ou chocolate. Ou restos.\n\nNão com prazer — com urgência. Como se enchesses um buraco. Comes rápido. Quase sem respirar.\n\nE quando paras, a culpa chega. O tribunal interno abre sessão: outra vez. Devias ter mais controlo. Amanhã começas a dieta.\n\nMas amanhã o buraco volta. E tu também.",
      overlayText: "",
      durationSec: 100,
      visualNote:
        "Silhueta na cozinha escura, luz do frigorífico no rosto. Come de pé, rápido, escondida. Depois: sentada na cama, culpa como sombra sobre o corpo.",
    },
    {
      type: "revelacao",
      narration:
        "A fome emocional não é gula. É linguagem. É o corpo a pedir o que não sabe pedir com palavras. Conforto. Presença. Prazer. Segurança.\n\nAprendeste cedo que a comida era tudo isso. Na cozinha da tua mãe, comida era amor. Recusar era rejeitar.\n\nE agora, quando te sentes vazia, o corpo vai buscar o que conhece: o frigorífico.\n\nMas o frigorífico não tem o que procuras. Não há queijo suficiente para preencher solidão. Não há chocolate suficiente para compensar a vida que adias.\n\nO que procuras no prato é o que te falta na vida. E enquanto não nomeares essa falta, vais continuar a comer de pé, no escuro, às onze da noite.",
      overlayText: "O que procuras no prato\né o que te falta\nna vida.",
      durationSec: 105,
      visualNote:
        "Mesa a ganhar alimentos. Silhueta a sentar-se. Luz rosada a crescer. Duas sombras: fome e culpa.",
    },
    {
      type: "gesto",
      narration:
        "Da próxima vez que fores ao frigorífico fora de horas — para. Antes de abrir, pergunta-te: do que tenho fome realmente? Não da comida — do quê? E espera pela resposta.",
      overlayText: "Do que tenho fome\nrealmente?",
      durationSec: 35,
      visualNote:
        "Silhueta sentada à mesa com comida. Come devagar. Luz rosada quente. Presença.",
    },
    {
      type: "frase_final",
      narration:
        "A fome que te leva ao frigorífico à meia-noite não é de comida. É de ti.",
      overlayText: "A fome não é de comida.\nÉ de ti.",
      durationSec: 14,
      visualNote:
        "Ecrã escuro. Texto em creme, serifado. Pausa.",
    },
    {
      type: "cta",
      narration:
        "Se isto te tocou, o curso Pão e Silêncio vai muito mais fundo. Oito módulos para fazeres as pazes com o prato e com o corpo. O link está na descrição.",
      overlayText: "Pão e Silêncio\nseteveus.space",
      durationSec: 18,
      visualNote:
        "Mesa bonita. Silhueta em paz. Terracota e porcelana. URL no ecrã.",
    },
    {
      type: "fecho",
      narration: "",
      overlayText: "Sete Véus",
      durationSec: 8,
      visualNote:
        "Território dissolve no céu. Logo Sete Véus. Silêncio.",
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// NOVA ESTRUTURA (v2): gancho → reconhecimento → framework → exemplo →
//                      exercicio → reframe → CTA
// Tom: professor/a acolhedor/a, didactico com camada terapeutica,
//      linguagem inclusiva (genero neutro)
// Duracao alvo: 12-15 min
// ═══════════════════════════════════════════════════════════════════════════

// ─── TRAILER DO CANAL ────────────────────────────────────────────────────

const trailerCanal: YouTubeScript = {
  courseSlug: "geral",
  hookIndex: 0,
  title: "Escola dos Véus — O que escondes de ti?",
  durationMin: 2,
  thumbnail: {
    mainText: "Escola dos Véus",
    subText: "Autoconhecimento com profundidade",
  },
  scenes: [
    {
      type: "trailer",
      narration:
        "Há coisas que sabes sobre ti. E há coisas que escondes — não por maldade, mas por protecção. Camadas que foste pondo ao longo da vida para não sentir demais. Para caber. Para sobreviver.\n\nNa Escola dos Véus, chamamos-lhes véus. Cada véu é um padrão que já foi útil mas que agora te limita. Um que te impede de dizer não. Outro que te faz sentir culpa quando gastas contigo. Outro que te mantém em relações onde desapareces. Outro que te faz engolir a raiva. Outro que te prende a uma herança que nem sabes que carregas.\n\nOs véus são muitos. E cada curso desta escola ajuda-te a levantar um — não de uma vez, mas com cuidado. Com conhecimento. Com exercícios que podes fazer ao teu ritmo.\n\nIsto não é auto-ajuda. Não é motivação. É um caminho de autoconhecimento com base em psicologia, neurociência e experiência vivida. Vinte cursos. Vinte territórios. Cada um com o seu mundo visual, os seus exercícios, o seu arco de transformação.\n\nSe alguma vez sentiste que há qualquer coisa entre ti e a tua vida real — algo que não consegues nomear mas que pesa — estás no sítio certo.\n\nBem-vindo à Escola dos Véus. Subscreve e começa a ver.",
      overlayText: "",
      durationSec: 90,
      visualNote:
        "Sequência cinematográfica: céu navy profundo. Uma silhueta terracota emerge de camadas translúcidas (os véus). Cada véu que se levanta revela mais contorno, mais luz dourada. Flashes rápidos dos territórios: Casa dos Espelhos Dourados, Árvore das Raízes Visíveis, Jardim dos Muros Invisíveis, Campo Queimado, Lago dos Reflexos Partilhados — muitos mundos, muitos véus. Final: silhueta inteira, luminosa, contorno dourado. Logo Escola dos Véus em creme sobre navy.",
    },
    {
      type: "fecho",
      narration: "",
      overlayText: "Escola dos Véus\nAutoconhecimento com profundidade\nseteveus.space",
      durationSec: 10,
      visualNote:
        "Navy background. Logo centrado. URL. Luz dourada suave a pulsar.",
    },
  ],
};

// ─── LIMITE SAGRADO — HOOK 1 (NOVA ESTRUTURA v2) ─────────────────────────

const limiteSagradoHook1: YouTubeScript = {
  courseSlug: "limite-sagrado",
  hookIndex: 0,
  title: "Porque dizes sim quando queres dizer não",
  durationMin: 13,
  thumbnail: {
    mainText: "Porque dizes sim\nquando queres dizer não",
    subText: "O preço invisível",
  },
  scenes: [
    {
      type: "abertura",
      narration: "",
      overlayText: "Porque dizes sim\nquando queres dizer não",
      durationSec: 10,
      visualNote:
        "Céu navy. Título em creme, fade lento. Território: Jardim dos Muros Invisíveis — muros translúcidos, vegetação que cresce entre fissuras.",
    },
    {
      type: "gancho",
      narration:
        "Alguém te pede uma coisa. Não é grande. Não é difícil. Mas por dentro sentes um não claro. E dizes sim. Outra vez. Porquê?",
      overlayText: "Porquê?",
      durationSec: 18,
      visualNote:
        "Silhueta terracota de pé, boca entreaberta. Palavra 'sim' sai em dourado. Palavra 'não' fica presa dentro, a vermelho escuro, invisível para fora.",
    },
    {
      type: "reconhecimento",
      narration:
        "Isto tem muitas versões. A mensagem que chega às onze da noite — e respondes. O favor que aceitas quando já estás a transbordar. O jantar a que vais por obrigação. O sorriso que dás quando devias estar a dizer: não posso.\n\nSempre que acontece, sentes a mesma coisa. Um aperto. Um cansaço. E no caminho para casa, uma irritação que não sabes bem a quem pertence — se a quem pediu, se a ti que disseste sim.",
      overlayText: "",
      durationSec: 50,
      visualNote:
        "Sequência rápida: silhueta a acenar 'sim' em diferentes contextos — telemóvel à noite, mesa de trabalho sobrecarregada, porta de casa de outra pessoa. Em cada cena, uma linha dourada sai do peito da silhueta e fica com quem pediu.",
    },
    {
      type: "framework",
      narration:
        "Na Escola dos Véus, chamamos a isto o Véu da Obediência. É um dos padrões mais antigos e mais invisíveis que existem.\n\nFunciona assim: quando eras criança, aprendeste que dizer sim era seguro. Que concordar era ser aceite. Que recusar — mesmo coisas pequenas — trazia consequências. Um olhar. Um silêncio. Uma retirada de afecto.\n\nNão precisou de ser violento. Bastou ser consistente. E o teu sistema nervoso gravou a regra: sim igual a segurança, não igual a perigo.\n\nO problema é que essa regra foi escrita por uma criança de cinco anos. E ainda está a correr. Agora tens trinta, quarenta, cinquenta — e o software é o mesmo.\n\nCada vez que dizes sim quando sentes não, não estás a ser generoso. Estás a obedecer a um programa antigo que confunde amor com obediência. E o preço — esse, pagas em silêncio. Com o corpo. Com o cansaço. Com a raiva que não sabes de onde vem.",
      overlayText: "O Véu da Obediência:\nsim = segurança\nnão = perigo",
      durationSec: 120,
      visualNote:
        "Animação didáctica: silhueta criança que acena sim e recebe luz (aprovação). Mesma criança que diz não e a luz apaga. Dissolve para silhueta adulta — mesma postura, mesmo reflexo. Um véu translúcido cobre a silhueta — o Véu da Obediência. Texto sobre navy: 'Software de infância. Ainda a correr.' Linhas douradas que saem do peito da silhueta em cada 'sim' — ficam com os outros, a silhueta fica mais escura.",
    },
    {
      type: "exemplo",
      narration:
        "Vou dar-te um exemplo concreto.\n\nImagina que a tua mãe te liga a pedir para ires lá no domingo. Tens planos. Precisas de descansar. Mas ouves o tom de voz — aquele tom — e sentes a culpa a chegar antes de ela dizer mais alguma coisa.\n\nDizes sim. Vais. Sorris. E no caminho de volta, não entendes porque estás tão irritado.\n\nO que aconteceu? O Véu da Obediência activou-se. O teu corpo leu o tom de voz da tua mãe e respondeu com a mesma regra dos cinco anos: se disseres não, perdes o amor.\n\nMas repara: tu não perdeste o amor. Perdeste o domingo. E uma parte de ti sabe que isso também conta.\n\nIsto não é sobre cortar relações. Não é sobre ser egoísta. É sobre perceberes que há uma diferença enorme entre um sim livre e um sim automático. O primeiro é generosidade. O segundo é sobrevivência.",
      overlayText: "",
      durationSec: 100,
      visualNote:
        "Cena doméstica: silhueta com telemóvel ao ouvido, ombros a cair. Dissolve para silhueta num carro, mãos no volante, mandíbula cerrada. Flashback: mesma silhueta em criança, a acenar 'sim' a uma silhueta maior (mãe). Volta ao presente: dois caminhos — um com véu (sim automático, silhueta escura) e outro sem (sim livre, silhueta luminosa).",
    },
    {
      type: "exercicio",
      narration:
        "Há uma coisa simples que podes fazer esta semana. Chama-se a Pausa dos Três Segundos.\n\nDa próxima vez que alguém te pedir algo, antes de responder, conta até três. Em silêncio. Só três segundos.\n\nNão é para dizer não. É para criares um espaço entre o pedido e a resposta. Nesse espaço, pergunta: isto é um sim meu, ou é o software a correr?\n\nSe for teu, diz sim com prazer. Se for o software, experimenta dizer: deixa-me pensar. Ou: agora não consigo. Não precisas de justificar. Não precisas de inventar uma desculpa. Só precisas de parar de responder em automático.\n\nTrês segundos. Começa por aí.",
      overlayText: "Pausa dos 3 Segundos:\n1. Alguém pede.\n2. Conta até 3.\n3. Isto é meu ou é software?",
      durationSec: 70,
      visualNote:
        "Silhueta de pé, mão no peito. Contagem visual: 1... 2... 3... com luz dourada a crescer a cada segundo. Véu translúcido que levanta ligeiramente — espaço visível entre o véu e a silhueta. Texto do exercício aparece em creme sobre navy.",
    },
    {
      type: "reframe",
      narration:
        "Dizer não não te torna má pessoa. Torna-te uma pessoa inteira. Porque cada não verdadeiro abre espaço para um sim que é realmente teu.",
      overlayText: "Cada não verdadeiro\nabre espaço\npara um sim que é teu.",
      durationSec: 16,
      visualNote:
        "Ecrã escuro. Texto serifado em creme, centrado. Silhueta luminosa, contorno dourado, véu caído aos pés. Pausa longa.",
    },
    {
      type: "cta",
      narration:
        "No curso Limite Sagrado, o primeiro módulo chama-se A Boa Pessoa que Cresceu. É onde desinstalamos o software de infância e aprendemos a escolher conscientemente que regras ainda servem. Se isto fez sentido, subscreve — todas as semanas há um novo véu para explorar. E se quiseres ir mais fundo: seteveus.space.",
      overlayText: "Limite Sagrado\nseteveus.space",
      durationSec: 22,
      visualNote:
        "Jardim dos Muros Invisíveis com muros translúcidos a dissolver. Vegetação dourada a crescer. URL no ecrã. Logo Escola dos Véus.",
    },
    {
      type: "fecho",
      narration: "",
      overlayText: "Escola dos Véus",
      durationSec: 8,
      visualNote:
        "Dissolve para navy. Logo. Silêncio.",
    },
  ],
};

// ─── OURO PRÓPRIO — HOOK 1 (NOVA ESTRUTURA v2) ──────────────────────────

const ouroProprioHook1v2: YouTubeScript = {
  courseSlug: "ouro-proprio",
  hookIndex: 0,
  title: "Porque sentes culpa quando gastas contigo",
  durationMin: 13,
  thumbnail: {
    mainText: "A culpa de gastar\nem ti",
    subText: "Um padrão que herdaste",
  },
  scenes: [
    {
      type: "abertura",
      narration: "",
      overlayText: "Porque sentes culpa\nquando gastas contigo",
      durationSec: 10,
      visualNote:
        "Céu navy. Título em creme, fade lento. Território: Casa dos Espelhos Dourados ao longe — espelhos embaciados.",
    },
    {
      type: "gancho",
      narration:
        "Compraste algo para ti. Não era caro. Não era necessário. Era só bom. E antes de saíres da loja já estavas a calcular se devias ter comprado. De onde vem isto?",
      overlayText: "De onde vem isto?",
      durationSec: 18,
      visualNote:
        "Silhueta terracota segurando um pequeno saco. Sombra de culpa visível como uma segunda silhueta mais escura atrás.",
    },
    {
      type: "reconhecimento",
      narration:
        "Há pessoas que pagam o jantar de toda a gente sem pestanejar. Mas hesitam vinte minutos antes de comprar uma vela para si. Não é avareza. É outra coisa. Uma voz antiga — podias ter guardado, há coisas mais importantes — que aparece sempre que o gasto é contigo.",
      overlayText: "",
      durationSec: 40,
      visualNote:
        "Dois lados: à esquerda, silhueta a dar presentes dourados alegremente. À direita, mesma silhueta sozinha com um objecto pequeno, hesitante. Contraste luz/sombra.",
    },
    {
      type: "framework",
      narration:
        "Na Escola dos Véus, chamamos a isto o Véu da Herança Financeira. É um dos padrões mais silenciosos que existem — porque ninguém te ensinou sobre dinheiro. Mas aprendeste tudo.\n\nFunciona assim: antes dos dez anos, absorveste um conjunto de regras sobre dinheiro. Não foram dadas em aulas. Foram absorvidas no corpo. Pelo suspiro da tua mãe quando abria as contas. Pelo tom do teu pai quando dizia que não dava. Pelo silêncio à mesa quando o assunto aparecia.\n\nEstas regras criam três programas que correm em segundo plano.\n\nO primeiro: gastar nos outros é generosidade, gastar em ti é egoísmo. Aprendeste que uma boa pessoa sacrifica-se. E agora cada vez que gastas contigo, o programa activa a culpa.\n\nO segundo: nós não somos dessas pessoas. As que viajam. As que compram. As que podem. Absorveste um mapa de onde podes e não podes estar — e cada vez que te aproximas de um sítio que não era suposto ser teu, algo te puxa de volta.\n\nO terceiro: não se fala de dinheiro. O tema era tabu. E agora, quando precisas de negociar ou de pedir o que mereces, o corpo trava.\n\nNenhuma destas regras foi escrita por ti. Foram herdadas. E a boa notícia é que o que foi herdado pode ser devolvido.",
      overlayText: "O Véu da Herança Financeira:\n3 programas invisíveis",
      durationSec: 140,
      visualNote:
        "Animação didáctica: criança sentada à mesa da cozinha, absorvendo — ondas invisíveis dos pais em direcção à criança. Três painéis aparecem como espelhos embaciados, cada um com um programa: 1) balança culpa/generosidade, 2) mapa com zonas proibidas, 3) boca com véu. Dissolve para adulto com os mesmos três espelhos — programa herdado. Véu translúcido dourado sobre a silhueta.",
    },
    {
      type: "exemplo",
      narration:
        "Vou dar-te um exemplo. Imagina que entras numa loja. Vês algo bonito — um livro, um creme, um objecto para a casa. Gostas. Pegas nele. E começa o diálogo interno.\n\nPrecisas mesmo disto? Não tinhas dito que ias poupar? E os miúdos, não precisam de coisas? Com esse dinheiro podias...\n\nNotaste? Nenhuma destas perguntas é sobre o objecto. São todas sobre permissão. Estás a pedir autorização a uma voz que nem sequer é tua. É a voz da tua mãe. Do teu pai. De uma casa onde gastar era arriscado.\n\nE se comprares, a culpa vem junto. Se não comprares, o alívio é estranho — porque não é alívio de ter poupado. É alívio de ter obedecido.\n\nO Véu da Herança Financeira não te impede de gastar. Impede-te de gastar em paz.",
      overlayText: "",
      durationSec: 90,
      visualNote:
        "Cena numa loja: silhueta a segurar objecto. Balões de pensamento aparecem como frases flutuantes — mas escritas em caligrafia antiga, não moderna (são frases herdadas). Silhueta pousa o objecto — o alívio visual não é luminoso, é cinzento. Alternativa: silhueta leva o objecto, mas uma sombra de culpa acompanha-a até à saída.",
    },
    {
      type: "exercicio",
      narration:
        "Há um exercício que ensino no curso e que podes experimentar agora. Chama-se Isto É Meu ou Herdado?\n\nDa próxima vez que sentires culpa ao gastar contigo, para. Põe a mão no peito. E pergunta em silêncio: esta culpa é minha — ou é de alguém que veio antes de mim?\n\nNão precisas de resposta imediata. O corpo sabe. Se a culpa for herdada, vais sentir um afrouxar — como se a culpa dissesse: tens razão, não sou tua.\n\nE depois compra. Ou não compres. Mas que seja uma decisão tua — não de um programa de infância.",
      overlayText: "Isto é meu\nou herdado?\n\nMão no peito.\nPergunta.\nEspera.",
      durationSec: 60,
      visualNote:
        "Silhueta com mão no peito. Véu translúcido que se levanta ligeiramente — espaço entre o véu e a pele. Frases antigas flutuam e começam a dissolver. Luz dourada cresce no peito.",
    },
    {
      type: "reframe",
      narration:
        "A tua relação com dinheiro é um espelho. Não mostra quanto tens — mostra o que te permites. E cada vez que gastas contigo sem culpa, estás a dizer: o meu bem-estar é prioridade.",
      overlayText: "A tua relação com dinheiro\nnão mostra quanto tens.\nMostra o que te permites.",
      durationSec: 18,
      visualNote:
        "Espelho dourado limpo. Silhueta refletida — inteira, luminosa. Texto serifado em creme.",
    },
    {
      type: "cta",
      narration:
        "No curso Ouro Próprio, o segundo módulo chama-se A Herança Financeira Emocional. É onde desenterramos os três programas — todos — e escolhemos conscientemente o que manter e o que devolver. Se isto fez sentido, subscreve. Todas as semanas há um novo véu. E se quiseres ir mais fundo: seteveus.space.",
      overlayText: "Ouro Próprio\nseteveus.space",
      durationSec: 22,
      visualNote:
        "Casa dos Espelhos Dourados — espelhos agora limpos. Silhueta inteira refletida. URL. Logo.",
    },
    {
      type: "fecho",
      narration: "",
      overlayText: "Escola dos Véus",
      durationSec: 8,
      visualNote:
        "Dissolve para navy. Logo. Silêncio.",
    },
  ],
};

// ─── EXPORTS ──────────────────────────────────────────────────────────────

export const YOUTUBE_SCRIPTS_V2: YouTubeScript[] = [
  trailerCanal,
  limiteSagradoHook1,
  ouroProprioHook1v2,
];

export const YOUTUBE_SCRIPTS: YouTubeScript[] = [
  ouroProprioHook1,
  ouroProprioHook2,
  ouroProprioHook3,
  fioInvisivelHook1,
  espelhoOutroHook1,
  silencioGritaHook1,
  teiaHook1,
  chamaHook1,
  mulherAntesDeMaeHook1,
  oficioDeSerHook1,
  relogioPartidoHook1,
  coroaEscondidaHook1,
  fomeHook1,
];

export function getScriptsForCourse(courseSlug: string): YouTubeScript[] {
  return YOUTUBE_SCRIPTS.filter((s) => s.courseSlug === courseSlug);
}

export function getFullNarration(script: YouTubeScript): string {
  return script.scenes
    .filter((s) => s.narration.length > 0)
    .map((s) => s.narration)
    .join("\n\n---\n\n");
}

export function getTotalDuration(script: YouTubeScript): number {
  return script.scenes.reduce((sum, s) => sum + s.durationSec, 0);
}
