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
  | "fecho";

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
        "Ilustração: céu escuro com uma luz dourada ao longe. Título aparece lentamente em texto creme.",
    },
    {
      type: "pergunta",
      narration:
        "Compraste algo para ti. Não era caro, não era necessário, era só bom. E antes de saíres da loja já estavas a calcular se devias ter comprado.",
      overlayText: "",
      durationSec: 18,
      visualNote:
        "Ilustração flat: uma figura genérica (sem rosto, sem cor de pele definida) numa loja, a segurar um saco de compras. Expressão neutra. Estilo editorial simples, traço fino.",
    },
    {
      type: "situacao",
      narration:
        "Isto acontece mais do que se pensa. Uma mulher compra um creme. Chega a casa, tira do saco, e não consegue gostar dele completamente. Trouxe a culpa junto.\n\nNão é por falta de dinheiro. É outra coisa. Uma voz antiga que diz: podias ter guardado. Há coisas mais importantes. Quem é que tu pensas que és para gastar assim?\n\nHá mulheres que pagam o jantar de toda a gente sem pestanejar. Mas hesitam vinte minutos antes de comprar uma vela para si mesmas. Não é avareza. Não é mesquinhice. É qualquer coisa muito mais funda.",
      overlayText: "",
      durationSec: 70,
      visualNote:
        "Sequência de ilustrações estilo School of Life: 1) figura a tirar um objecto de um saco, a olhar para ele com incerteza 2) balão de pensamento com contas e números 3) split screen: mesma figura a pagar um jantar com naturalidade vs a hesitar com uma vela na mão",
    },
    {
      type: "revelacao",
      narration:
        "Esta culpa não nasce com ninguém. É herdada. Vem de frases que se ouvem antes de ter idade para as questionar.\n\nUma mãe que nunca compra nada para si. Um pai que repete que dinheiro não nasce em árvores. Uma casa onde gastar era perigoso. Onde ter coisas bonitas era sinal de irresponsabilidade.\n\nAs crianças que vivem nessas casas crescem. Começam a ganhar o seu próprio dinheiro. Mas a regra fica. Gastar nos outros é generosidade. Gastar em si é egoísmo.\n\nE quando uma pessoa não se permite gastar em si mesma, o que está a dizer — sem palavras — é que o seu bem-estar não é prioridade.",
      overlayText: "",
      durationSec: 80,
      visualNote:
        "Ilustrações: 1) uma criança pequena a observar a mãe — a mãe a pousar algo numa prateleira de loja e a ir embora 2) frases a flutuar como folhas: 'não chega', 'não precisas', 'não somos dessas pessoas' 3) a criança cresce — dissolve para adulta — mas a sombra da criança continua lá 4) balança: lado 'outros' cheio de presentes, lado 'eu' vazio",
    },
    {
      type: "gesto",
      narration:
        "Há uma coisa simples que se pode fazer. Na próxima vez que comprares algo para ti, repara no que aparece no corpo. O aperto. A voz. O desconforto. Não fujas. Fica com isso três segundos.\n\nE depois repara: o mundo não acabou.",
      overlayText: "Repara. Três segundos.",
      durationSec: 40,
      visualNote:
        "Ilustração: figura com a mão no peito. À volta, as frases-fantasma estão a desvanecer. Uma pequena luz onde a mão toca o peito. O mundo à volta continua normal.",
    },
    {
      type: "frase_final",
      narration:
        "O prazer não precisa de justificação. Se precisasse, não seria prazer.",
      overlayText:
        "O prazer não precisa de justificação.\nSe precisasse, não seria prazer.",
      durationSec: 15,
      visualNote:
        "Fundo escuro. Frase em texto creme, centrada. Silêncio.",
    },
    {
      type: "cta",
      narration:
        "Se isto fez sentido, subscreve. Há mais a caminho.",
      overlayText: "Subscreve. Há mais a caminho.",
      durationSec: 10,
      visualNote:
        "Ilustração: a figura a caminhar calmamente. Texto simples com convite.",
    },
    {
      type: "fecho",
      narration: "",
      overlayText: "Escola dos Véus",
      durationSec: 6,
      visualNote:
        "Logo Escola dos Véus. Fundo escuro. Silêncio.",
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
        "A primeira frase que nunca foi dita, mas que ouviste mil vezes: nós não somos dessa gente. Talvez não fosse sobre dinheiro directamente. Mas cada vez que passavam por uma loja e a tua mãe desviava o olhar. Cada vez que dizia: isso não é para nós. Cada vez que recusava um convite porque era caro demais — mesmo quando não era — estavas a aprender.\n\nA aprender que há pessoas que podem e pessoas que não podem. E que tu eras das que não podem.\n\nA segunda frase: olha para o teu pai. Se a tua mãe alguma vez disse isto quando o assunto era dinheiro, o que te estava a ensinar era: o dinheiro causa dor. O dinheiro causa conflito. É melhor não falar sobre ele. Então cresceste a evitar o assunto. A mudar de conversa. A fingir que não te importas. Mas importas.\n\nA terceira frase: eu não preciso de nada. Esta é talvez a mais poderosa. Porque parece generosidade. Parece força. Mas o que a tua mãe te mostrou foi: uma boa mulher não tem necessidades. Uma boa mãe não gasta em si. O sacrifício é a moeda de troca do amor.\n\nE tu, sem perceber, adoptaste exactamente a mesma regra.",
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
        "Há uma cena que se repete em versões diferentes. A freelancer que manda o orçamento e pede desculpa no email. A profissional que aceita o salário sem negociar. A dona do negócio que faz desconto antes de alguém pedir. A mulher que oferece o trabalho de graça porque sente que cobrar é rude.\n\nEm todos estes casos, há um momento invisível. O momento em que pensas num valor — o valor real — e depois baixas. Trinta por cento, às vezes mais. Não porque a outra pessoa pediu. Mas porque uma voz dentro de ti decidiu que esse valor é demasiado. Que quem és tu para cobrar isso.\n\nE depois aceitas. Trabalhas. Entregas. E no final sentes uma coisa que não sabes bem nomear. Não é raiva. É mais como traição. Como se tivesses vendido algo que era teu por menos do que vale.",
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
        "O exercício é simples e desconfortável. Escolhe o valor mais importante que cobras — o teu salário, o teu serviço, a tua hora. E diz em voz alta. Sozinha. No carro, no chuveiro, onde quiseres. Diz o número. Sem acrescentar nada. Sem justificar. Repara no que acontece no corpo quando o dizes.\n\nDepois, aumenta dez por cento. E diz outra vez.",
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
        "Há uma ideia que a ciência está cada vez mais a confirmar: nós não somos tão separados como pensamos. O que a tua mãe sentiu e não disse, o teu corpo ouviu. O que a tua avó viveu e engoliu, ficou registado. A ansiedade da tua melhor amiga que nunca te contou — tu sentiste-a na última vez que estiveram juntas.\n\nNão é magia. Não é energia. É biologia. O sistema nervoso humano foi feito para se ligar. Para sentir o outro. Para carregar o que não é nomeado.\n\nE quando choras sem razão, pode ser que estejas a chorar por muitas. Pela tua mãe que nunca chorou. Pela tua avó que não podia. Pela tua filha que ainda não sabe que vai precisar.\n\nEsse choro não é fraqueza. É a prova de que estás ligada a algo maior do que tu.",
      overlayText: "Quando choras sem razão,\npode ser que estejas\na chorar por muitas.",
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
        "Não estás sozinha no que sentes. Nunca estiveste. Há um fio invisível que te liga a todas as que vieram antes — e a todas as que vêm depois.",
      overlayText:
        "Não estás sozinha no que sentes.\nNunca estiveste.\nHá um fio invisível.",
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
        "Há alguém na tua vida — pode ser uma colega, uma cunhada, uma amiga de uma amiga — que te irrita de uma forma que não faz sentido. Não te fez nada de grave. Mas cada vez que fala, algo dentro de ti contrai. Já te perguntaste porquê?",
      overlayText: "Cada vez que fala,\nalgo dentro de ti contrai.",
      durationSec: 28,
      visualNote:
        "Duas silhuetas frente a frente. Uma tensa, outra relaxada. Galeria com espelhos vivos ao fundo.",
    },
    {
      type: "situacao",
      narration:
        "Imagina. Estás num jantar. Ela está lá. Fala alto. Ocupa espaço. Diz o que pensa sem pedir licença. E tu, que passas a vida a medir palavras, a ponderar, a ter cuidado com o que dizes — sentes um calor a subir.\n\nNão é raiva exactamente. É irritação. Uma irritação que parece desproporcionada. Porque ela não te fez nada. Não te insultou. Não te traiu.\n\nMas irrita-te.\n\nE quando contas a alguém, dizes: não sei, há qualquer coisa nela que me incomoda. E essa qualquer coisa — essa coisa que não sabes nomear — é a pista mais importante que vais receber hoje.",
      overlayText: "",
      durationSec: 100,
      visualNote:
        "Silhueta sentada a observar outra silhueta que gesticula livremente. Espelhos na galeria que reflectem não a cena mas emoções — distorções cromáticas.",
    },
    {
      type: "revelacao",
      narration:
        "O que te irrita no outro é quase sempre algo que vive em ti e que não te permites. Ela fala alto — e tu calaste-te a vida inteira. Ela ocupa espaço — e tu aprendeste a encolher. Ela diz o que pensa — e tu medes cada palavra com medo de incomodar.\n\nA irritação não é sobre ela. É sobre a parte de ti que gostava de ser assim mas que decidiu, há muito tempo, que isso não era permitido.\n\nIsto não significa que ela tem razão ou que é melhor. Significa que o teu corpo está a reagir a algo que reconhece — algo que é teu e que escondeste.\n\nO outro é um espelho. E quando o espelho te incomoda, raramente é por causa do espelho.",
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
        "Estás num almoço com amigas. Alguém diz algo com que não concordas. Sobre educação dos filhos. Sobre politica. Sobre a forma como outra amiga foi tratada.\n\nE sentes aquilo dentro de ti — a vontade de dizer. A tua versão. A tua verdade. Mas olhas à volta. E decides que não vale a pena. Que vai criar atrito. Que vão olhar para ti de lado.\n\nEntão sorris. Acenas. Mudas de assunto. E no caminho de volta para casa, no carro, sozinha — dizes tudo o que devias ter dito. Mas já não conta.\n\nIsto não acontece uma vez. Acontece sempre. Em cada grupo, em cada relação, em cada contexto onde sentes que a tua verdade pode custar-te o lugar.\n\nE a pergunta é: que lugar é esse, se para lá estar tens de desaparecer?",
      overlayText: "",
      durationSec: 110,
      visualNote:
        "Silhueta em grupo — sorri mas o corpo está tenso. Fios entrelaçados que a prendem subtilmente. Depois: silhueta sozinha no carro, boca aberta, finalmente a falar — mas sem ninguém a ouvir.",
    },
    {
      type: "revelacao",
      narration:
        "Pertencer é a necessidade humana mais antiga. O cérebro trata a rejeição como uma ameaça de morte — literalmente. As mesmas zonas do cérebro que se activam com dor física activam-se quando és excluída.\n\nPor isso aprendeste cedo a adaptar-te. A ler a sala. A perceber o que é aceite e o que não é. A moldar-te ao formato do grupo.\n\nMas há um preço. E o preço é este: cada vez que te moldas, perdes um pedaço de contorno. E ao fim de anos, olhas para ti e não sabes quem és sem o grupo. Sem a aprovação. Sem o sorriso do outro.\n\nA boa notícia é que podes pertencer sem desaparecer. Mas primeiro precisas de perceber o que abdicaste para caber.",
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
        "Pertencer não é desaparecer. Pertencer de verdade é ser vista como és — e ainda assim ter lugar.",
      overlayText:
        "Pertencer não é desaparecer.\nÉ ser vista como és\ne ainda assim ter lugar.",
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
        "Na reunião disseram-te que o projecto que fizeste sozinha ia ser apresentado por outra pessoa. Sentiste o calor subir. A mandíbula cerrar. Os olhos arder.\n\nMas o que fizeste? Sorriste. Disseste 'claro, faz sentido'. E no carro, sozinha, as mãos tremiam no volante. Não de medo. De raiva.\n\nUma raiva que nunca te ensinaram a ter. Porque meninas boas não gritam. Mulheres fortes não perdem o controlo. E tu — tu aprendeste tão bem a engolir que já nem sabes o que é raiva e o que é cansaço.\n\nA mandíbula dói. As costas travam. O estômago fecha. E tu chamas a tudo isto 'stress'.",
      overlayText: "",
      durationSec: 110,
      visualNote:
        "Silhueta a sorrir numa reunião — corpo tenso. Depois: silhueta no carro, mãos a tremer. Fissuras a aparecer na superfície do vulcão.",
    },
    {
      type: "revelacao",
      narration:
        "A raiva é a emoção mais censurada nas mulheres. Um homem com raiva é assertivo. Uma mulher com raiva é histérica. E tu aprendeste isso antes de teres palavras.\n\nAprendeste que a raiva era perigosa. Que se a mostrasses, perdias amor. Perdias aprovação. Perdias o teu lugar.\n\nEntão guardaste-a. Na mandíbula. Nas costas. No estômago. Transformaste-a em cansaço, em sarcasmo, em controlo, em choro.\n\nMas a raiva não desaparece porque a escondes. Cresce. E um dia sai — nos sítios errados, nas pessoas erradas, da forma errada.\n\nNão porque sejas má. Porque nunca te deixaram ser inteira.",
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

// ─── EXPORTS ──────────────────────────────────────────────────────────────

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
