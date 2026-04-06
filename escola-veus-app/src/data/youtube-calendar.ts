/**
 * Calendário YouTube — A Escola dos Véus
 * ────────────────────────────────────────
 * 7 semanas | 21 vídeos | 3 por semana (Terça, Quinta, Sábado)
 *
 * Horário: 18h Maputo / 15h Lisboa / 13h São Paulo
 * Duração: 5-7 minutos cada
 *
 * Estrutura de cada vídeo:
 *   0:00 - 0:15  Gancho forte
 *   0:15 - 1:30  Situação reconhecível
 *   1:30 - 3:30  O padrão por baixo
 *   3:30 - 5:00  Gesto de consciência
 *   5:00 - 5:30  Frase final + CTA
 *
 * CTA (primeiras 4 semanas):
 *   "Se isto te tocou, inscreve-te. A Escola dos Véus está a chegar
 *    — e o primeiro curso é sobre a tua relação com dinheiro."
 */

import type { CourseSlug } from "@/types/course";

// ─── Types ──────────────────────────────────────────────────────────────────────

export type YouTubeDay = "terca" | "quinta" | "sabado";

export type VideoStatus =
  | "draft"        // script por escrever
  | "script_ready" // script pronto, aguarda aprovação
  | "approved"     // script aprovado, pronto para produção
  | "producing"    // em produção (áudio + imagens + montagem)
  | "review"       // montagem feita, aguarda revisão final
  | "scheduled"    // agendado no YouTube
  | "published";   // publicado

export type VideoScene = {
  timestamp: string;
  section: "gancho" | "situacao" | "padrao" | "gesto" | "fecho";
  visual: string;
  narration: string;
};

export type YouTubeVideo = {
  number: number;
  title: string;
  courseOrigin: CourseSlug;
  secondaryCourse?: CourseSlug;
  territory: string;
  week: number;
  day: YouTubeDay;
  gancho: string;
  fraseFinal: string;
  description: string;
  status: VideoStatus;
  script: VideoScene[];
};

export type YouTubeWeek = {
  number: number;
  theme: string;
  objective: string;
  videos: YouTubeVideo[];
};

// ─── Publishing schedule ────────────────────────────────────────────────────────

export const YOUTUBE_SCHEDULE = {
  daysOfWeek: ["terca", "quinta", "sabado"] as YouTubeDay[],
  publishTime: "18:00",
  timezone: "Africa/Maputo",
  durationRange: { min: 5, max: 7 },
  ctaDefault:
    "Se isto te tocou, inscreve-te. A Escola dos Véus está a chegar — e o primeiro curso é sobre a tua relação com dinheiro.",
} as const;

export const YOUTUBE_DESCRIPTION_TEMPLATE = `[TITULO]

[DESCRICAO_VIDEO]

A Escola dos Véus é um lugar onde entras para ver o que estava invisível. Cursos sobre a vida real — dinheiro, relações, corpo, limites, luto, decisões — ensinados pela lente do corpo, não da mente.

O primeiro curso está a chegar.

Inscreve-te para não perderes.
seteveus.space

#autoconhecimento #desenvolvimentopessoal #escoladosveus #corpo #emoções`;

export const YOUTUBE_TAGS = [
  "autoconhecimento",
  "desenvolvimento pessoal",
  "escola dos véus",
  "corpo",
  "emoções",
  "mulheres",
  "sete véus",
];

// ─── Checklist de publicação ────────────────────────────────────────────────────

export const VIDEO_CHECKLIST = [
  "Título atractivo e emocional?",
  "Thumbnail com visual do Mundo dos Véus?",
  "Gancho nos primeiros 15 segundos?",
  "Duração 5-7 minutos?",
  "Voz natural, ritmo calmo?",
  "Visuais consistentes com a paleta Sete Véus?",
  "Texto animado com frases-chave?",
  "Frase final que fica?",
  "CTA: inscrição no canal + 'A Escola dos Véus está a chegar'?",
  "Legendas activas?",
  "Descrição com: resumo + link seteveus.space + 'curso a chegar'?",
  "Tags: autoconhecimento, desenvolvimento pessoal, mulheres, corpo, emoções?",
] as const;

// ─── Produção pipeline ──────────────────────────────────────────────────────────

export const PRODUCTION_STEPS = [
  { step: 1, label: "Script aprovado", responsible: "Claude Code" },
  { step: 2, label: "Gerar áudio (ElevenLabs — voz clonada)", responsible: "Vivianne" },
  { step: 3, label: "Gerar 4-6 imagens das cenas do território", responsible: "ElevenLabs" },
  { step: 4, label: "Transformar imagens em clips de vídeo", responsible: "ElevenLabs" },
  { step: 5, label: "Montar clips + áudio + texto + música + legendas", responsible: "ElevenLabs Studio" },
  { step: 6, label: "Export MP4", responsible: "Vivianne" },
  { step: 7, label: "Revisão final", responsible: "Vivianne" },
  { step: 8, label: "Upload YouTube (agendar para dia seguinte 18h)", responsible: "Vivianne" },
] as const;

// ─── The 12 videos ──────────────────────────────────────────────────────────────

export const YOUTUBE_WEEKS: YouTubeWeek[] = [
  // ━━━ SEMANA 1 — ENTRADA NO MUNDO ━━━
  {
    number: 1,
    theme: "Entrada no Mundo",
    objective:
      "Apresentar a voz, o estilo visual, e tocar nos temas mais universais. Ninguém te conhece ainda. Estes vídeos são a primeira impressão.",
    videos: [
      {
        number: 1,
        title: "Porque sentes culpa quando gastas dinheiro em ti mesma?",
        courseOrigin: "ouro-proprio",
        territory: "Casa dos Espelhos Dourados",
        week: 1,
        day: "terca",
        gancho:
          "Gastas nos filhos sem pensar. Gastas na casa sem pestanejar. Mas quando é para ti — um creme, um livro, um café a sós — aparece a culpa. Porquê?",
        fraseFinal:
          "A culpa não é tua. Foi ensinada. E o que foi ensinado pode ser desaprendido.",
        description:
          "É o tema mais universal e activador. Toda a mulher que comprou algo para si e sentiu culpa vai clicar. É emocional, é concreto, e abre a porta para tudo o resto.",
        status: "script_ready",
        script: [
          {
            timestamp: "0:00 - 0:15",
            section: "gancho",
            visual: "Céu azul-marinho profundo. Câmara desce lentamente para a Casa dos Espelhos Dourados. Silhueta terracota de pé, imóvel, frente a um espelho coberto.",
            narration: "Gastas nos filhos sem pensar. Gastas na casa sem pestanejar. Mas quando é para ti — um creme, um livro, um café a sós — aparece a culpa. Porquê?",
          },
          {
            timestamp: "0:15 - 1:30",
            section: "situacao",
            visual: "Silhueta sentada frente a vários espelhos. Cada espelho reflecte uma cena diferente: um carrinho de compras, uma factura, uma prateleira de loja. Tons dourados suaves.",
            narration: "Imagina isto. Estás numa loja. Vês algo bonito. Algo só para ti. Não é caro. Não é um luxo absurdo. Pegas. Olhas. E depois vem aquela voz. 'Precisas mesmo disto?' 'Há coisas mais importantes.' 'E se o dinheiro fizer falta?' Pousas. Sais. E no caminho para casa, sentes um alívio estranho — como se tivesses evitado um erro. Mas não evitaste nenhum erro. Evitaste-te a ti. Agora pensa na última vez que compraste algo para os teus filhos. Ou para a casa. Ou para alguém que amas. Houve hesitação? Houve culpa? Provavelmente não. Porque gastar nos outros sente-se certo. Gastar em ti sente-se egoísta. E esta diferença — esta diferença entre o que aceitas para os outros e o que te negas a ti — não é acidental. Foi construída.",
          },
          {
            timestamp: "1:30 - 3:30",
            section: "padrao",
            visual: "Silhueta de pé numa sala de espelhos. Nos reflexos, aparecem silhuetas mais pequenas — a mesma pessoa em criança. Os espelhos estão embaciados, com frases escritas na condensação. A luz dourada começa a entrar por uma fresta.",
            narration: "A culpa que sentes quando gastas em ti não nasceu contigo. Nasceu antes de ti. Nasceu na cozinha da tua mãe, quando ela dizia 'não precisamos disso' com a voz cansada. Nasceu no olhar do teu pai quando alguém falava de dinheiro e ele mudava de assunto. Nasceu nas vezes que viste a tua mãe negar-se tudo — o creme, o vestido, o descanso — e chamarem-lhe boa mulher por isso. Tu absorveste uma equação invisível: mulher boa igual a mulher que não gasta em si. Mulher egoísta igual a mulher que se coloca primeiro. E esta equação ficou gravada. Não no pensamento — no corpo. É por isso que a culpa não é uma ideia. É uma sensação. Um aperto. Um desconforto físico quando a caixa regista o valor. É por isso que não basta dizeres a ti mesma 'eu mereço'. O corpo não acredita em frases. O corpo acredita em padrões. E o padrão que aprendeste diz: tu és a última da fila. Sempre.",
          },
          {
            timestamp: "3:30 - 5:00",
            section: "gesto",
            visual: "Silhueta de pé, mãos no peito. A luz dourada cresce. Os espelhos começam a desembaciar. A silhueta dá um passo em frente, para mais perto de um espelho limpo.",
            narration: "Quero propor-te uma coisa pequena. Não uma revolução. Um gesto. Na próxima semana, compra uma coisa só para ti. Algo pequeno. Pode ser um café especial, uma vela, um caderno. Algo que não 'precisas'. Algo que existe só porque te dá prazer. E quando a culpa aparecer — porque vai aparecer — não a empurres. Não te julgues por a sentires. Para. Respira. E pergunta-lhe: de quem és tu? De quem é esta voz que me diz que não mereço? Não precisas de responder agora. Só precisas de ouvir a pergunta. Porque a culpa que não se questiona repete-se para sempre. A culpa que se olha de frente começa a perder força.",
          },
          {
            timestamp: "5:00 - 5:30",
            section: "fecho",
            visual: "Território dissolve-se no céu azul-marinho. Frase final em texto creme no ecrã. Fade para escuro. Logo Sete Véus. Silêncio.",
            narration: "A culpa não é tua. Foi ensinada. E o que foi ensinado pode ser desaprendido. Se isto te tocou, inscreve-te. A Escola dos Véus está a chegar — e o primeiro curso é sobre a tua relação com dinheiro.",
          },
        ],
      },
      {
        number: 2,
        title: "3 frases sobre dinheiro que a tua mãe te ensinou sem saber",
        courseOrigin: "ouro-proprio",
        secondaryCourse: "sangue-e-seda",
        territory: "Casa dos Espelhos Dourados + Árvore das Raízes",
        week: 1,
        day: "quinta",
        gancho:
          "'Dinheiro não cresce em árvores.' 'Nós não somos dessa gente.' 'Rico é tudo egoísta.' — Reconheces alguma?",
        fraseFinal:
          "Antes dos 12 anos, já tinhas um script completo sobre dinheiro. Não te foi ensinado. Foi absorvido.",
        description:
          "Mantém o tema dinheiro mas liga à família. As pessoas que viram o vídeo 1 reconhecem a continuidade. As que não viram entram por outro ângulo.",
        status: "script_ready",
        script: [
          {
            timestamp: "0:00 - 0:15",
            section: "gancho",
            visual: "Céu azul-marinho. Câmara desce para a Casa dos Espelhos Dourados, transita para a Árvore das Raízes Visíveis ao fundo. Silhueta terracota de pé entre os dois territórios.",
            narration: "'Dinheiro não cresce em árvores.' 'Nós não somos dessa gente.' 'Rico é tudo egoísta.' Reconheces alguma?",
          },
          {
            timestamp: "0:15 - 1:30",
            section: "situacao",
            visual: "Silhueta sentada junto à Árvore das Raízes. As raízes são visíveis, brilham em dourado. Nos ramos da árvore, aparecem silhuetas mais pequenas — figuras parentais. Tons quentes de terracota e âmbar.",
            narration: "Há frases que ninguém se senta a ensinar-te. Ninguém abre um livro e diz 'agora vou explicar-te o que o dinheiro significa'. Não funciona assim. Funciona no jantar, quando o teu pai suspira ao abrir uma carta do banco. Funciona na feira, quando a tua mãe pousa o vestido que gostava e diz 'não é para nós'. Funciona no tom de voz com que alguém dizia 'aquele lá tem dinheiro' — como se ter dinheiro fosse uma doença moral. Tu não aprendeste o que o dinheiro é. Aprendeste o que o dinheiro significa na tua família. E essas duas coisas são muito diferentes.",
          },
          {
            timestamp: "1:30 - 3:30",
            section: "padrao",
            visual: "Silhueta de pé frente à Árvore. As raízes envolvem-na suavemente. Em cada raiz, texto em creme com frases herdadas. A silhueta toca numa raiz e ela brilha — depois escurece. Alternância entre Casa dos Espelhos e Árvore.",
            narration: "Vou dar-te três frases. E quero que sintas — não que penses — sintas qual delas mora em ti. A primeira: 'Dinheiro não traz felicidade.' Parece sabedoria. Mas ouve o que está por baixo. O que está por baixo é: não queiras demasiado. Não ambiciones. Fica onde estás. Esta frase protege — mas também prende. A segunda: 'Nós não somos dessa gente.' Esta é sobre pertença. Sobre a ideia de que dinheiro é para outros. Que há um lugar onde tu cabes — e não é o lugar da abundância. Esta frase define o tecto do que te permites ter. A terceira: 'Cuidado com quem tem dinheiro.' Esta é mais subtil. Ensina que riqueza é suspeita. Que quem ganha bem deve ter feito algo errado. E então tu, inconscientemente, tratas o dinheiro como algo sujo. Algo de que te tens de manter longe para seres uma boa pessoa. Três frases. Nenhuma foi dita com maldade. Todas foram ditas com medo. E o medo dos teus pais tornou-se o teu tecto.",
          },
          {
            timestamp: "3:30 - 5:00",
            section: "gesto",
            visual: "Silhueta sentada, mãos abertas. A Árvore começa a mudar — as raízes reorganizam-se suavemente. Luz dourada entra por entre os ramos. Uma raiz nova, mais fina, brota com uma cor diferente — mais clara.",
            narration: "Pega num papel. Ou abre as notas do telemóvel. E escreve as frases sobre dinheiro que cresceram contigo. Não as que leste em livros. As que ouviste em casa. As que estavam no tom de voz, no suspiro, no olhar. Escreve-as como as ouviste. Depois, por baixo de cada uma, escreve: 'Isto não é meu. Isto é de quem veio antes de mim.' Não precisas de as apagar. Não precisas de as substituir por afirmações positivas. Só precisas de as devolver. De perceber que estás a viver com um mapa financeiro que foi desenhado por alguém que tinha medo. E o medo deles não tem de ser o teu.",
          },
          {
            timestamp: "5:00 - 5:30",
            section: "fecho",
            visual: "Território dissolve-se no céu. Frase final em texto creme. Fade para escuro. Logo Sete Véus. Silêncio.",
            narration: "Antes dos 12 anos, já tinhas um script completo sobre dinheiro. Não te foi ensinado. Foi absorvido. Se isto te tocou, inscreve-te. A Escola dos Véus está a chegar — e o primeiro curso é sobre a tua relação com dinheiro.",
          },
        ],
      },
      {
        number: 3,
        title: "A diferença entre ser amada e ser útil",
        courseOrigin: "limite-sagrado",
        territory: "Muralha que Nasce do Chão",
        week: 1,
        day: "sabado",
        gancho:
          "Se parasses de ajudar, de resolver, de estar disponível — continuariam a ligar-te? Ou só te procuram quando precisam?",
        fraseFinal:
          "Ser útil não é ser amada. E confundir as duas coisas custa-te mais do que imaginas.",
        description:
          "Mais reflexivo, mais pesado. O sábado dá espaço para sentar com isto. Muda de tema (sai do dinheiro, entra nos limites) para mostrar que o canal é mais do que um assunto.",
        status: "script_ready",
        script: [
          {
            timestamp: "0:00 - 0:15",
            section: "gancho",
            visual: "Céu azul-marinho. Câmara desce para a Muralha que Nasce do Chão. Silhueta terracota de pé, mão estendida para o lado — como se oferecesse algo. Não há muralha ainda. O chão está vazio.",
            narration: "Se parasses de ajudar, de resolver, de estar disponível — continuariam a ligar-te? Ou só te procuram quando precisam?",
          },
          {
            timestamp: "0:15 - 1:30",
            section: "situacao",
            visual: "Silhueta rodeada de outras figuras. Todas estendem as mãos para ela. A silhueta central dá, dá, dá — as mãos abertas, o corpo ligeiramente curvado. As outras figuras vão-se embora depois de receberem. A silhueta fica sozinha.",
            narration: "És a pessoa a quem toda a gente liga quando precisa de alguma coisa. A amiga que ouve. A irmã que resolve. A colega que fica até mais tarde. A filha que nunca diz que não. E sentes-te bem com isso. Ou pelo menos, dizias que sim. Porque ajudar dá-te um lugar. Um propósito. Uma certeza de que és necessária. Mas há uma pergunta que evitas. Uma que mora no fundo e que só aparece de noite, quando estás cansada demais para te distraíres: se eu parasse de dar — alguém ficava? Se eu não fosse útil — alguém me escolhia na mesma?",
          },
          {
            timestamp: "1:30 - 3:30",
            section: "padrao",
            visual: "Silhueta sentada no chão, sozinha. As outras figuras são sombras distantes. Do chão começa a nascer um brilho dourado — o início da muralha, mas ainda frágil, quase invisível. A silhueta olha para as mãos vazias.",
            narration: "Há uma confusão antiga entre ser amada e ser necessária. Aprendeste cedo que o amor se ganha. Que não é dado — é merecido. E a forma de o merecer era ser boa. Ser disponível. Ser aquela que nunca falha. Então construíste uma identidade inteira em cima disso. És a que ajuda. És a que resolve. És a que aguenta. E sim — as pessoas gostam de ti. Mas gostam de ti ou gostam do que fazes por elas? Esta pergunta dói. Eu sei. Mas é necessária. Porque o que acontece quando confundes utilidade com amor é isto: deixas de ter limites. Porque dizer não é arriscar perder o amor. E se o amor depende do que dás — então tens de dar sempre. Sem parar. Mesmo quando já não tens. E chamas isso de generosidade. Mas não é generosidade. É medo. Medo de descobrires que sem a tua função, não sobra razão para ficarem.",
          },
          {
            timestamp: "3:30 - 5:00",
            section: "gesto",
            visual: "Silhueta de pé. Do chão nasce uma linha de luz dourada — o início de um limite. A silhueta coloca a mão sobre o peito. As figuras ao longe continuam lá, mas a uma distância respeitosa. A muralha não é alta — é apenas uma linha de luz.",
            narration: "Esta semana, quero que faças uma coisa. Uma única coisa. Quando alguém te pedir algo — um favor, o teu tempo, a tua energia — antes de dizeres sim, para. Não digas nada durante cinco segundos. Cinco segundos de silêncio. E nesses cinco segundos, pergunta ao teu corpo: eu quero fazer isto? Ou estou a fazer isto para que me continuem a querer? Não tens de dizer não. Só tens de ouvir a diferença entre o sim genuíno e o sim por medo. Porque o dia em que começares a distinguir os dois é o dia em que começas a descobrir quem fica quando tu paras de dar.",
          },
          {
            timestamp: "5:00 - 5:30",
            section: "fecho",
            visual: "Território dissolve-se no céu. Frase final em texto creme. Fade para escuro. Logo Sete Véus. Silêncio.",
            narration: "Ser útil não é ser amada. E confundir as duas coisas custa-te mais do que imaginas. Se isto te tocou, inscreve-te. A Escola dos Véus está a chegar — e o primeiro curso é sobre a tua relação com dinheiro.",
          },
        ],
      },
    ],
  },

  // ━━━ SEMANA 2 — ALARGAR O TERRITÓRIO ━━━
  {
    number: 2,
    theme: "Alargar o Território",
    objective:
      "A audiência que ficou da semana 1 espera mais. Esta semana tocamos em 3 temas diferentes para mostrar a amplitude do universo.",
    videos: [
      {
        number: 4,
        title: "Porque estás sempre cansada e férias não resolvem",
        courseOrigin: "o-peso-e-o-chao",
        territory: "Caminho de Pedras",
        week: 2,
        day: "terca",
        gancho:
          "Dormiste 8 horas. Tiraste férias. Fizeste spa. E continuas exausta. E se o problema não for falta de descanso?",
        fraseFinal:
          "Não estás cansada porque descansas mal. Estás cansada porque carregas demais. A solução não é um banho de espuma — é pôr peso no chão.",
        description:
          "Tema do cansaço crónico — toca em muitas mulheres que se sentem exaustas apesar de descansarem.",
        status: "script_ready",
        script: [
          {
            timestamp: "0:00 - 0:15",
            section: "gancho",
            visual: "Céu azul-marinho. Câmara desce para o Caminho de Pedras. Silhueta terracota curvada, a carregar pedras invisíveis nos ombros. O caminho é longo, cinzento, sem fim à vista.",
            narration: "Dormiste 8 horas. Tiraste férias. Fizeste spa. E continuas exausta. E se o problema não for falta de descanso?",
          },
          {
            timestamp: "0:15 - 1:30",
            section: "situacao",
            visual: "Silhueta a caminhar pelo caminho de pedras. Cada passo é pesado. Atrás dela, o caminho está cheio de pedras já percorridas. À frente, mais pedras. Tons cinza-pedra com acentos terracota.",
            narration: "Conheces aquele cansaço que não sai? Acordas cansada. Trabalhas cansada. Chegas a casa cansada. Ao fim-de-semana, tentas descansar — mas até o descanso cansa, porque pensas em tudo o que devias estar a fazer. E então tentas soluções. Dormir mais. Chá. Meditação. Férias. E por uns dias parece melhor. Mas volta. Volta sempre. Porque o cansaço não é físico. Ou melhor — é físico, mas não começou no corpo. Começou no que carregas. E o que carregas não sai com férias. Porque tu nem sequer sabes o que estás a carregar.",
          },
          {
            timestamp: "1:30 - 3:30",
            section: "padrao",
            visual: "Silhueta parada no meio do caminho. As pedras tornam-se visíveis — cada uma tem uma palavra gravada em luz creme: 'expectativas', 'culpa', 'controlo', 'perfeição', 'agradar'. A silhueta olha para elas como se as visse pela primeira vez.",
            narration: "O cansaço que não passa com descanso tem um nome. Chama-se peso emocional. E são as coisas que carregas sem ninguém te pedir. A expectativa de ser perfeita no trabalho. A responsabilidade de manter toda a gente feliz. A culpa quando descansas porque 'há tanta coisa para fazer'. O controlo de tudo — porque se tu não fizeres, quem faz? A necessidade de provar que és capaz, que aguentas, que dás conta. Cada uma destas coisas é uma pedra. Pequena, invisível, mas real. E tu carregas-as todas ao mesmo tempo. Há anos. Sem parar. E o mais cruel é isto: ninguém te pediu para carregar a maior parte delas. Tu assumiste. Porque aprendeste que ser boa é carregar tudo sem te queixar. Que pedir ajuda é fraqueza. Que parar é luxo. Então não paras. E o corpo cobra. Cobra em exaustão. Em insónia. Em dores que não têm explicação médica. Em irritação com tudo e todos. O corpo está a gritar o que tu te recusas a dizer: estou cheia.",
          },
          {
            timestamp: "3:30 - 5:00",
            section: "gesto",
            visual: "Silhueta de pé, a segurar uma pedra. Lentamente, abre as mãos e deixa a pedra cair no chão. O som é suave. O corpo endireita-se ligeiramente. Mais luz dourada entra na cena.",
            narration: "Quero que faças uma lista. Não uma lista de tarefas — uma lista de peso. Escreve tudo o que carregas. Tudo. O trabalho. As expectativas. As pessoas que dependem de ti. As coisas que fazes por obrigação. As que fazes por culpa. As que fazes porque 'alguém tem de fazer'. Escreve tudo. E depois olha para essa lista e marca as que são realmente tuas. As que escolheste. As que queres. Vais notar uma coisa: metade do que carregas não é teu. É peso herdado. É expectativa alheia. É culpa que não te pertence. E não precisas de largar tudo de uma vez. Mas precisas de ver o que estás a carregar. Porque só se larga o que se vê.",
          },
          {
            timestamp: "5:00 - 5:30",
            section: "fecho",
            visual: "Território dissolve-se no céu. Frase final em texto creme. Fade para escuro. Logo Sete Véus. Silêncio.",
            narration: "Não estás cansada porque descansas mal. Estás cansada porque carregas demais. A solução não é um banho de espuma — é pôr peso no chão. Se isto te tocou, inscreve-te. A Escola dos Véus está a chegar — e o primeiro curso é sobre a tua relação com dinheiro.",
          },
        ],
      },
      {
        number: 5,
        title: "O teste do preço: diz o teu valor em voz alta",
        courseOrigin: "ouro-proprio",
        territory: "Casa dos Espelhos Dourados",
        week: 2,
        day: "quinta",
        gancho:
          "Vou pedir-te para fazeres uma coisa agora. Pensa no preço que cobras pelo teu trabalho. Ou no salário que achas que mereces. Agora diz esse número em voz alta. Alto. Onde é que a voz tremeu?",
        fraseFinal: "A voz treme onde o merecimento hesita.",
        description:
          "Vídeo interactivo — pede à pessoa para fazer algo enquanto vê. Gera engagement e comentários.",
        status: "script_ready",
        script: [
          {
            timestamp: "0:00 - 0:15",
            section: "gancho",
            visual: "Céu azul-marinho. Câmara desce para a Casa dos Espelhos Dourados. Silhueta terracota de pé frente a um espelho grande. No espelho, um reflexo ligeiramente diferente — mais pequeno, mais hesitante.",
            narration: "Vou pedir-te para fazeres uma coisa agora. Pensa no preço que cobras pelo teu trabalho. Ou no salário que achas que mereces. Agora diz esse número em voz alta. Alto. Onde é que a voz tremeu?",
          },
          {
            timestamp: "0:15 - 1:30",
            section: "situacao",
            visual: "Silhueta frente ao espelho. O reflexo mostra números dourados a flutuar — alguns brilham, outros apagam-se. A silhueta tenta tocar num número mais alto e a mão hesita.",
            narration: "Fizeste? Disseste o número em voz alta? Se disseste — repara no que aconteceu no corpo. Se a voz saiu firme, inteira, sem hesitação — provavelmente já fizeste um trabalho importante sobre o teu valor. Mas se tremeu. Se baixou. Se ficou presa na garganta. Se sentiste vergonha. Ou se nem conseguiste dizer — isso é informação. Não é fraqueza. É informação. Porque o preço que cobras é o reflexo directo do que acreditas merecer. E a maioria das mulheres cobra menos. Aceita menos. Pede menos. Não porque valha menos — mas porque dizer o seu valor em voz alta ativa qualquer coisa antiga. Qualquer coisa que diz: quem és tu para pedir tanto?",
          },
          {
            timestamp: "1:30 - 3:30",
            section: "padrao",
            visual: "Silhueta sentada. Os espelhos à volta mostram cenas: a criança na escola com a mão levantada que ninguém vê, a adolescente que pede e ouve 'não há', a mulher jovem que aceita o primeiro salário sem negociar. Cada espelho é um momento. Tons dourados com sombras.",
            narration: "O que acontece quando dizes o teu preço em voz alta é que o corpo activa uma memória. Não uma memória específica — uma acumulação. Todas as vezes que pediste e ouviste não. Todas as vezes que viste alguém olhar para ti como se estivesses a pedir demais. Todas as vezes que baixaste o preço antes de alguém sequer negociar — porque era mais seguro pedir menos do que arriscar a rejeição. Há um padrão aqui. E é este: tu negoceias contra ti mesma antes de o outro abrir a boca. O desconto já vem aplicado. Já decidiste que é demais. Já te convenceste de que ninguém vai pagar isso. E sabes porquê? Porque no fundo, não é sobre o preço. É sobre a crença de que tu — tu, não o teu trabalho, não o teu serviço — tu não vales aquilo. O preço é um espelho. E o que ele reflecte não é o mercado. É o que sentes sobre ti mesma quando ninguém está a ver.",
          },
          {
            timestamp: "3:30 - 5:00",
            section: "gesto",
            visual: "Silhueta de pé frente ao espelho. Desta vez, o reflexo é do mesmo tamanho. A silhueta coloca as mãos no peito. No espelho, os números reorganizam-se — o mais alto fica no centro, a brilhar em dourado quente.",
            narration: "Quero que faças este exercício esta semana. Escolhe um momento em que estejas sozinha. De pé. Olha para um espelho — pode ser o do quarto, o da casa-de-banho, qualquer um. E diz em voz alta: 'O meu trabalho vale' — e diz o número. O número real. Não o desconto. O número que sentirias se acreditasses em ti sem condições. Diz e observa. Observa o corpo. Onde trava? Onde a voz encolhe? Onde aparece o calor, ou a vergonha, ou a vontade de rir para desvalorizar? Não corrijas nada. Só observa. Repete no dia seguinte. E no outro. Cada dia que dizes o teu valor em voz alta, o corpo assusta-se menos. E o dia em que a voz sair inteira — sem tremer, sem pedir desculpa — nesse dia algo muda. Não lá fora. Cá dentro.",
          },
          {
            timestamp: "5:00 - 5:30",
            section: "fecho",
            visual: "Território dissolve-se no céu. Frase final em texto creme. Fade para escuro. Logo Sete Véus. Silêncio.",
            narration: "A voz treme onde o merecimento hesita. Se isto te tocou, inscreve-te. A Escola dos Véus está a chegar — e o primeiro curso é sobre a tua relação com dinheiro.",
          },
        ],
      },
      {
        number: 6,
        title: "A conversa que ensaias no chuveiro há meses",
        courseOrigin: "voz-de-dentro",
        territory: "Sala do Eco",
        week: 2,
        day: "sabado",
        gancho:
          "Há uma conversa que vive em ti. Ensaias no chuveiro. Reescreves às 3 da manhã. Mas nunca dizes. A quem é? E porque é que o silêncio te parece mais seguro do que a verdade?",
        fraseFinal:
          "O silêncio não protege. Corrói. E o corpo sabe — mesmo que tu finjas que não.",
        description:
          "Toca no tema da voz interior e do silêncio — forte para engagement ao fim de semana.",
        status: "script_ready",
        script: [
          {
            timestamp: "0:00 - 0:15",
            section: "gancho",
            visual: "Céu azul-marinho. Câmara desce para a Sala do Eco. Paredes de violeta escuro. Silhueta terracota de costas, a olhar para uma parede onde ecos de luz dourada pulsam suavemente — palavras que quase se ouvem.",
            narration: "Há uma conversa que vive em ti. Ensaias no chuveiro. Reescreves às 3 da manhã. Mas nunca dizes. A quem é? E porque é que o silêncio te parece mais seguro do que a verdade?",
          },
          {
            timestamp: "0:15 - 1:30",
            section: "situacao",
            visual: "Silhueta sentada no centro da Sala do Eco. As paredes reflectem fragmentos de frases em creme — todas incompletas, todas meio apagadas. A silhueta tem as mãos fechadas sobre os joelhos.",
            narration: "Tu sabes exactamente qual é a conversa. Sabes a quem é. Sabes o que dirias se tivesses coragem. Já a ensaiaste tantas vezes que conheces cada palavra, cada pausa, cada resposta possível. No chuveiro. No carro. Antes de adormecer. E há versões. A versão calma. A versão onde explodes. A versão onde choras. A versão onde finalmente dizes tudo o que engoliste. Mas nenhuma dessas versões sai. Porque entre o ensaio e a boca há um muro. E esse muro tem um nome: e se estrago tudo? E se depois não há volta atrás? E se me rejeitam? E se confirmo aquilo que tenho medo de saber — que esta pessoa não me ama o suficiente para ouvir a minha verdade?",
          },
          {
            timestamp: "1:30 - 3:30",
            section: "padrao",
            visual: "Silhueta de pé na Sala do Eco. As paredes começam a aproximar-se lentamente. Os ecos ficam mais intensos, sobrepostos, confusos. A silhueta põe as mãos sobre os ouvidos. Depois tira-as. Escuta.",
            narration: "O silêncio parece protecção. Parece a escolha segura. Parece que ao não dizer, manténs a paz. Mas repara no que acontece no corpo quando engoles uma verdade. Há um aperto. Uma tensão na garganta. Um peso no estômago. Uma irritação que aparece do nada — com coisas pequenas, com pessoas que não têm culpa. Isso não é paz. Isso é pressão. O corpo está a armazenar tudo o que a boca se recusa a dizer. E o corpo tem limites. Há um padrão aqui que vale a pena ver. Tu aprendeste que falar é perigoso. Não porque alguém te disse — mas porque viste. Viste o que aconteceu quando alguém disse a verdade na tua família. Viste o silêncio que se seguiu. Ou o grito. Ou o abandono. E decidiste, sem saber que decidias: é mais seguro calar. Só que agora já não és criança. E o preço de calar já não é segurança. É corrosão. Corrói a relação porque está cheia de coisas não ditas. Corrói-te a ti porque vives com uma versão editada de quem és. Corrói a confiança porque como pode alguém conhecer-te se nunca dizes o que sentes?",
          },
          {
            timestamp: "3:30 - 5:00",
            section: "gesto",
            visual: "Silhueta de pé, mãos abertas. As paredes da Sala do Eco afastam-se. Os ecos acalmam-se. Uma única frase de luz dourada flutua no ar à frente da silhueta. A silhueta dá um passo na direcção dela.",
            narration: "Não te vou pedir para teres a conversa. Ainda não. Vou pedir-te algo mais pequeno. Pega no telemóvel. Abre as notas. E escreve a conversa. Toda. Sem filtro. Sem te preocupares com o tom. Sem pensares na reacção da outra pessoa. Escreve como se só tu fosses ler. O que dirias se não tivesses medo? Que palavras escolherias? O que precisas que a outra pessoa saiba? Escreve tudo. E depois guarda. Não mandes. Não partilhes. Guarda. Porque o primeiro passo não é dizer a verdade ao outro. É dizê-la a ti mesma. Dar-lhe forma. Tirá-la do corpo e pô-la em palavras. Quando a verdade deixa de ser um eco dentro de ti e passa a ser uma frase escrita — ela fica mais pequena. Mais manejável. Menos assustadora.",
          },
          {
            timestamp: "5:00 - 5:30",
            section: "fecho",
            visual: "Território dissolve-se no céu. Frase final em texto creme. Fade para escuro. Logo Sete Véus. Silêncio.",
            narration: "O silêncio não protege. Corrói. E o corpo sabe — mesmo que tu finjas que não. Se isto te tocou, inscreve-te. A Escola dos Véus está a chegar — e o primeiro curso é sobre a tua relação com dinheiro.",
          },
        ],
      },
    ],
  },

  // ━━━ SEMANA 3 — PROFUNDIDADE ━━━
  {
    number: 3,
    theme: "Profundidade",
    objective:
      "A audiência que está cá na semana 3 já confia na voz. Podemos ir mais fundo. Temas mais emocionais.",
    videos: [
      {
        number: 7,
        title: "5 sinais de que estás a desaparecer numa relação",
        courseOrigin: "a-arte-da-inteireza",
        territory: "Ponte entre Duas Margens",
        week: 3,
        day: "terca",
        gancho:
          "1. Já não sabes o que queres para jantar. 2. Ris das piadas dele mesmo quando não tem graça. 3. Dizes 'tanto faz' quando não é tanto faz. 4. Os teus amigos dizem que mudaste. 5. Olhas para o espelho e não te reconheces.",
        fraseFinal:
          "Desaparecer numa relação não acontece de repente. Acontece uma cedência de cada vez.",
        description:
          "Lista concreta que gera identificação imediata. Forte potencial de partilha.",
        status: "script_ready",
        script: [
          {
            timestamp: "0:00 - 0:15",
            section: "gancho",
            visual: "Céu azul-marinho. Câmara desce para a Ponte entre Duas Margens. Um rio violeta-água separa duas margens. Na ponte, duas silhuetas — mas uma está a desvanecer-se, a perder cor.",
            narration: "1. Já não sabes o que queres para jantar. 2. Ris das piadas dele mesmo quando não tem graça. 3. Dizes 'tanto faz' quando não é tanto faz. 4. Os teus amigos dizem que mudaste. 5. Olhas para o espelho e não te reconheces.",
          },
          {
            timestamp: "0:15 - 1:30",
            section: "situacao",
            visual: "Duas silhuetas na ponte. Uma é sólida, terracota. A outra está translúcida — quase transparente. A translúcida move-se sempre na direcção da outra. Nunca ao contrário.",
            narration: "Aconteceu devagar. Tão devagar que não deste por nada. Primeiro foram as preferências pequenas. O restaurante que ele gostava passou a ser o que 'vocês' gostavam. Depois foi o grupo de amigos. Os teus foram ficando para trás. Depois foram as opiniões. Passaste a concordar mais — não porque concordavas, mas porque discordar dava trabalho. Dava conflito. E tu queres paz. Queres harmonia. Queres que funcione. Então cedes. Uma vez. Outra. E outra. E cada cedência é tão pequena que parece insignificante. Mas quando as juntas todas, o resultado é este: já não sabes onde ele acaba e tu começas.",
          },
          {
            timestamp: "1:30 - 3:30",
            section: "padrao",
            visual: "A silhueta translúcida olha para as próprias mãos — quase invisíveis. A ponte começa a inclinar-se para o lado da silhueta sólida. O rio por baixo reflecte uma única silhueta inteira — a que já foi, antes da ponte.",
            narration: "Vamos olhar para os cinco sinais devagar. O primeiro: já não sabes o que queres. Não só para jantar — para a vida. Se alguém te perguntasse agora 'o que queres?' a resposta mais honesta seria 'não sei'. Porque passaste tanto tempo a adaptar-te ao que o outro quer que perdeste o acesso ao teu próprio desejo. O segundo: ris quando não tem graça. Concordas quando não concordas. Dizes 'está bem' quando não está. Isto parece simpatia. Mas é apagamento. Cada vez que finges uma reacção, uma parte de ti desliga. O terceiro: 'tanto faz' tornou-se a tua frase mais usada. Mas não é indiferença — é rendimento. Desististe de escolher porque escolher é arriscar o conflito. O quarto: as pessoas que te conhecem há mais tempo — os amigos antigos, a família — dizem que mudaste. E tu ficas irritada. Porque sabes que é verdade. Mas admitir isso é admitir o que perdeste. O quinto — e este é o mais difícil: olhas para o espelho e a pessoa que está lá já não é bem tu. Parece-se contigo. Mas falta algo. Falta intensidade. Falta presença. Falta a mulher que eras antes de aprenderes a encolher para caber numa relação.",
          },
          {
            timestamp: "3:30 - 5:00",
            section: "gesto",
            visual: "A silhueta translúcida para de andar. Senta-se no meio da ponte. Sozinha. As mãos no peito. Lentamente, a cor começa a voltar — primeiro os contornos, depois o centro. A outra silhueta continua na sua margem.",
            narration: "Esta semana, faz uma coisa por dia que seja só tua. Uma coisa que não tenha nada a ver com a relação. Pode ser ouvir uma música que ele não gosta e tu adoras. Pode ser comer algo que só tu queres. Pode ser ligar a uma amiga antiga. Pode ser sentar-te em silêncio durante dez minutos sem estar disponível para ninguém. Uma coisa por dia. Pequena. Que te pertença. Não é egoísmo. É resgate. Cada vez que fazes algo que é só teu, estás a dizer ao corpo: eu ainda estou aqui. E o corpo responde. Com alívio. Com uma faísca de reconhecimento. Com a sensação, quase esquecida, de ser inteira.",
          },
          {
            timestamp: "5:00 - 5:30",
            section: "fecho",
            visual: "Território dissolve-se no céu. Frase final em texto creme. Fade para escuro. Logo Sete Véus. Silêncio.",
            narration: "Desaparecer numa relação não acontece de repente. Acontece uma cedência de cada vez. Se isto te tocou, inscreve-te. A Escola dos Véus está a chegar — e o primeiro curso é sobre a tua relação com dinheiro.",
          },
        ],
      },
      {
        number: 8,
        title: "As perdas que ninguém te deixou chorar",
        courseOrigin: "flores-no-escuro",
        territory: "Jardim Subterrâneo",
        week: 3,
        day: "quinta",
        gancho:
          "A amizade que acabou sem explicação. O bebé que não veio. A mudança de país que ninguém entendeu como perda. O casamento que não aconteceu. A juventude. Ninguém morreu — mas dói como se.",
        fraseFinal:
          "Se ninguém te deu permissão para chorar isto — eu dou. É real. Merece nome.",
        description:
          "O mais emocional dos 12. Pode ser o que viraliza — porque toca numa dor que quase ninguém nomeia.",
        status: "script_ready",
        script: [
          {
            timestamp: "0:00 - 0:15",
            section: "gancho",
            visual: "Céu azul-marinho. Câmara desce para o Jardim Subterrâneo. Uma caverna escura. Silhueta terracota de pé, a olhar para baixo. No chão, pequenas flores bioluminescentes — azul profundo, quase invisíveis.",
            narration: "A amizade que acabou sem explicação. O bebé que não veio. A mudança de país que ninguém entendeu como perda. O casamento que não aconteceu. A juventude. Ninguém morreu — mas dói como se.",
          },
          {
            timestamp: "0:15 - 1:30",
            section: "situacao",
            visual: "Silhueta sentada na caverna. À volta, flores bioluminescentes brotam do chão — cada uma representa uma perda. São bonitas mas melancólicas. A silhueta toca numa flor e ela brilha mais forte por um instante.",
            narration: "Há perdas que ninguém conta. Que não têm funeral. Que não têm cartão de condolências. Que não têm nome. A amiga que um dia deixou de responder — e nunca soubeste porquê. O bebé que não veio — e toda a gente disse 'ainda és nova' ou 'talvez não fosse a altura'. A mudança de país, de cidade, de vida — que toda a gente celebrou como coragem, mas ninguém viu como perda. O casamento que não aconteceu. O divórcio que ninguém lamentou contigo porque 'era o melhor'. A juventude que passou sem avisares. Tu carregas estas perdas. Todas. E carregas em silêncio. Porque quando tentaste falar, ouviste: 'mas ninguém morreu'. 'Não é para tanto.' 'Tens de seguir em frente.' E seguiste. Com a perda lá dentro. Sem nome. Sem choro. Sem espaço.",
          },
          {
            timestamp: "1:30 - 3:30",
            section: "padrao",
            visual: "A caverna expande-se. Mais flores aparecem. A silhueta caminha entre elas, devagar. Cada flor que toca ilumina uma pequena área — como se cada perda, ao ser vista, criasse luz. As flores têm cores diferentes: azul, violeta, âmbar. A caverna já não é tão escura.",
            narration: "Há um tipo de perda que a sociedade não reconhece. Os psicólogos chamam-lhe luto não reconhecido. É a perda que não tem espaço social. Ninguém te dá licença para a chorar. Ninguém te pergunta como estás. Porque, oficialmente, não aconteceu nada. Mas aconteceu. E o corpo sabe. O corpo guarda cada perda que a mente se recusou a processar. Guarda na tensão crónica. Na insónia. Na irritação que explode sem razão. No choro que aparece a ver um filme e tu não sabes explicar porquê. O padrão é este: quando uma perda não é nomeada, ela não desaparece. Transforma-se. Transforma-se em ansiedade. Em raiva. Em adormecimento emocional. Em medo de amar de novo, de sonhar de novo, de querer de novo. Porque se da última vez doeu — e ninguém sequer reconheceu que doeu — porque é que te ias expor outra vez? E então fechas-te. Não completamente. Mas o suficiente para te sentires protegida. E chamas isso de maturidade. Mas não é maturidade. É luto congelado.",
          },
          {
            timestamp: "3:30 - 5:00",
            section: "gesto",
            visual: "Silhueta sentada no centro do jardim. As flores bioluminescentes à volta brilham com intensidade suave. A silhueta tem as mãos abertas, viradas para cima. Uma lágrima de luz dourada cai — e ao tocar no chão, nasce uma flor nova.",
            narration: "Quero fazer uma coisa contigo agora. Quero que penses na perda que nunca choraste. Não na maior — na que ninguém viu. A que guardaste. A que engoliste. Quando a encontrares, para. Respira. E diz — em silêncio ou em voz alta: 'eu perdi isto. E doeu.' Só isto. Não precisas de resolver. Não precisas de encontrar o lado positivo. Não precisas de aceitar. Só precisas de nomear. Porque a perda sem nome ocupa mais espaço do que a perda nomeada. Quando dizes 'eu perdi isto e doeu', estás a dar a essa dor o que ela sempre precisou: reconhecimento. Não é fraqueza. É a coisa mais corajosa que podes fazer. Olhar para o que perdeste e dizer: isto foi real. Isto importou. Eu tenho direito a sentir isto.",
          },
          {
            timestamp: "5:00 - 5:30",
            section: "fecho",
            visual: "Território dissolve-se no céu. O jardim fica atrás, iluminado. Frase final em texto creme. Fade para escuro. Logo Sete Véus. Silêncio.",
            narration: "Se ninguém te deu permissão para chorar isto — eu dou. É real. Merece nome. Se isto te tocou, inscreve-te. A Escola dos Véus está a chegar — e o primeiro curso é sobre a tua relação com dinheiro.",
          },
        ],
      },
      {
        number: 9,
        title: "Porque discutir com a tua mãe te faz sentir como se tivesses 12 anos",
        courseOrigin: "sangue-e-seda",
        territory: "Árvore das Raízes Visíveis",
        week: 3,
        day: "sabado",
        gancho:
          "Tens 35, 40, 50 anos. Mas basta a tua mãe dizer uma frase — uma — e voltas a ter 12. A voz muda. O corpo encolhe. Porquê?",
        fraseFinal:
          "Não é fraqueza. É o corpo a lembrar quem eras quando aprendeste a funcionar com ela. Cresceste — mas o padrão ficou.",
        description:
          "Toca na relação mãe-filha adulta — tema profundo para reflexão de fim de semana.",
        status: "script_ready",
        script: [
          {
            timestamp: "0:00 - 0:15",
            section: "gancho",
            visual: "Céu azul-marinho. Câmara desce para a Árvore das Raízes Visíveis. Raízes enormes, emaranhadas, em vermelho escuro e seda. Duas silhuetas — uma adulta, uma mais velha — frente a frente, com raízes a ligá-las pelo chão.",
            narration: "Tens 35, 40, 50 anos. Mas basta a tua mãe dizer uma frase — uma — e voltas a ter 12. A voz muda. O corpo encolhe. Porquê?",
          },
          {
            timestamp: "0:15 - 1:30",
            section: "situacao",
            visual: "Silhueta adulta ao telefone. À medida que ouve, o corpo começa a encolher — fica mais pequeno, os ombros sobem, a cabeça baixa. Atrás dela, a sombra de uma criança aparece, sobreposta. As raízes da árvore pulsam.",
            narration: "Pensa na última discussão com a tua mãe. Ou na última vez que ela disse algo que te magoou. Pode ter sido uma crítica. Um comentário sobre o teu peso, a tua casa, as tuas escolhas. Pode ter sido o tom — aquele tom que só ela tem, que te atravessa o corpo como se tivesses feito algo errado. E o que aconteceu? Reagiste como adulta? Ou sentiste aquela coisa — aquela regressão instantânea — em que o teu corpo voltou a ter 12 anos? A voz ficou mais aguda. Ou mais calada. Os olhos encheram-se de água. Ou fechaste-te completamente. E depois ficaste furiosa. Não só com ela — contigo. Porque tens 40 anos. Porque devias saber lidar com isto. Porque já leste livros, já fizeste terapia, já percebeste tudo. E mesmo assim — ela diz uma frase e tu desabas.",
          },
          {
            timestamp: "1:30 - 3:30",
            section: "padrao",
            visual: "A silhueta sentada junto às raízes da Árvore. As raízes contam histórias — em cada uma, pequenas cenas de luz: uma criança a ouvir, a obedecer, a chorar, a calar. A silhueta adulta vê estas cenas nas raízes. A árvore é enorme, antiga, impossível de ignorar.",
            narration: "Isto não é fraqueza. É neurologia. O teu sistema nervoso aprendeu a funcionar com a tua mãe antes de teres palavras. Antes de teres lógica. Antes de teres defesas. Quando eras criança, o teu corpo mapeou tudo: o tom de voz que significava perigo, o silêncio que significava desaprovação, o olhar que significava 'desiludiste-me'. E criou respostas automáticas. Encolher. Calar. Agradar. Explodir. Estas respostas ficaram gravadas. Não na mente — no corpo. E o corpo não sabe que já cresceste. O corpo reage ao mesmo estímulo da mesma forma. Sempre. Independentemente de teres 12 ou 45 anos. É por isso que podes estar perfeitamente funcional no trabalho, com amigos, em qualquer relação — mas basta a tua mãe usar aquele tom e todo o teu sistema adulto desliga. E activa a criança. A criança que aprendeu que a única forma de sobreviver àquela relação era adaptar-se. Ceder. Desaparecer. Ou lutar. O padrão não é consciente. Não é uma escolha. É um reflexo. E o reflexo mais antigo que tens.",
          },
          {
            timestamp: "3:30 - 5:00",
            section: "gesto",
            visual: "Silhueta de pé, de costas para a Árvore. Olha para a frente. As raízes continuam atrás, mas já não a envolvem. A silhueta coloca uma mão sobre o próprio ombro — como se confortasse a versão mais nova de si mesma. Luz dourada suave.",
            narration: "Da próxima vez que isto acontecer — da próxima vez que a tua mãe disser algo e o teu corpo reagir como se tivesses 12 anos — faz uma coisa. Para. Não respondas imediatamente. Põe a mão no peito. E diz internamente: 'Eu já não sou criança. O meu corpo lembra-se. Mas eu já cresci.' Não é para anular a emoção. É para criares um espaço — mesmo que seja de três segundos — entre o estímulo e a reacção. Nesses três segundos, a adulta pode aparecer. Pode escolher responder em vez de reagir. Pode dizer 'mãe, isso magoa-me' em vez de explodir ou calar. Não é fácil. Não vai funcionar sempre. Mas cada vez que crias esse espaço, estás a ensinar ao teu corpo algo novo: que há uma terceira opção. Não é lutar nem fugir. É ficar de pé. Inteira. Adulta. Com a criança dentro de ti protegida — mas já não a comandar.",
          },
          {
            timestamp: "5:00 - 5:30",
            section: "fecho",
            visual: "Território dissolve-se no céu. Frase final em texto creme. Fade para escuro. Logo Sete Véus. Silêncio.",
            narration: "Não é fraqueza. É o corpo a lembrar quem eras quando aprendeste a funcionar com ela. Cresceste — mas o padrão ficou. Se isto te tocou, inscreve-te. A Escola dos Véus está a chegar — e o primeiro curso é sobre a tua relação com dinheiro.",
          },
        ],
      },
    ],
  },

  // ━━━ SEMANA 4 — FECHO E PROMESSA ━━━
  {
    number: 4,
    theme: "Fecho e Promessa",
    objective:
      "Última semana antes do período de produção do curso acelerar. Estes vídeos fecham o ciclo e deixam a audiência a querer mais.",
    videos: [
      {
        number: 10,
        title: "O teu corpo está a tentar dizer-te algo — estás a ouvir?",
        courseOrigin: "pele-nua",
        territory: "Corpo-Paisagem",
        week: 4,
        day: "terca",
        gancho:
          "A enxaqueca que aparece antes do Natal na casa da família. A insónia na semana em que evitas uma conversa. A dor lombar que começou quando disseste sim a algo que querias recusar. Coincidência? O corpo não acha.",
        fraseFinal:
          "O corpo não mente. A mente sim. Aprende a ouvir quem nunca te enganou.",
        description:
          "Liga corpo e emoções — tema que ressoa fortemente com o público-alvo.",
        status: "script_ready",
        script: [
          {
            timestamp: "0:00 - 0:15",
            section: "gancho",
            visual: "Céu azul-marinho. Câmara desce para o Corpo-Paisagem. Uma paisagem que é ao mesmo tempo terreno e corpo — montanhas que parecem ombros, rios que parecem veias. Terracota rosado. Silhueta de pé, mãos sobre o próprio corpo, a escutar.",
            narration: "A enxaqueca que aparece antes do Natal na casa da família. A insónia na semana em que evitas uma conversa. A dor lombar que começou quando disseste sim a algo que querias recusar. Coincidência? O corpo não acha.",
          },
          {
            timestamp: "0:15 - 1:30",
            section: "situacao",
            visual: "Silhueta no Corpo-Paisagem. Em zonas do corpo, pequenas luzes pulsam — vermelhas na garganta, amarelas no estômago, azuis na lombar. Cada luz é um sinal. A silhueta toca no estômago e a paisagem à volta treme.",
            narration: "Pensa nisto. Tens uma reunião difícil na segunda. No domingo à noite, a insónia aparece. Ou aparece a dor de cabeça. Ou o estômago fecha. Tu tomas um comprimido. Segues. Ignoras. E na terça já passou. Até à próxima vez. Ou isto: toda a vez que vais a casa da tua família, algo no corpo muda. Tensão nos ombros. Aperto no peito. Uma irritação que aparece do nada, antes sequer de chegares. Tu dizes que é stresse. Que é cansaço. Que é normal. Mas não é normal. É informação. O teu corpo está a falar contigo. Há anos. E tu estás a tratar a mensagem como ruído.",
          },
          {
            timestamp: "1:30 - 3:30",
            section: "padrao",
            visual: "A paisagem-corpo expande-se. Vemos mais detalhes: cicatrizes no terreno que são memórias, zonas secas que são emoções bloqueadas, um rio que corre mas está represado numa zona. A silhueta caminha pela paisagem do próprio corpo, a descobri-la.",
            narration: "O corpo tem uma linguagem. Não é poética — é literal. Quando sentes medo, o corpo contrai. A garganta fecha, o estômago aperta, os ombros sobem. Não é metáfora — é fisiologia. O sistema nervoso reage antes da mente processar. E quando a mente decide ignorar — quando tu decides que não é para tanto, que aguentas, que 'é só stresse' — o corpo não para. Guarda. Acumula. E transforma. A raiva que nunca expressaste vive nos ombros. A tristeza que nunca choraste vive no peito. O medo que nunca enfrentaste vive no estômago. A culpa que nunca questionaste vive nas costas. Cada emoção que a mente rejeita, o corpo acolhe. E guarda até não poder mais. E quando o corpo não pode mais, fala mais alto. A enxaqueca torna-se crónica. A insónia torna-se permanente. A dor que não tem explicação médica torna-se companhia. E tu vais ao médico. Fazes exames. Tudo normal. Porque não é doença — é acumulação. O corpo está cheio do que tu te recusaste a sentir.",
          },
          {
            timestamp: "3:30 - 5:00",
            section: "gesto",
            visual: "Silhueta sentada na paisagem-corpo. Mãos no peito. Os olhos fechados. As luzes no corpo começam a pulsar mais devagar, mais suaves. A paisagem à volta acalma-se. O rio represado começa a fluir. Cores mais quentes.",
            narration: "Esta noite, antes de adormeceres, faz isto. Deita-te. Fecha os olhos. E faz um scan lento pelo teu corpo. Começa pela cabeça. Desce pelo pescoço, ombros, peito, estômago, ancas, pernas, pés. Não tentes mudar nada. Não tentes relaxar. Só observa. Onde há tensão? Onde há desconforto? Onde há vazio? E quando encontrares uma zona que chama a atenção — para. Respira para essa zona. E pergunta, gentilmente: o que estás a guardar? Não esperes uma resposta em palavras. Espera em sensação. Espera em emoção. Espera em memória. Pode vir agora. Pode vir amanhã no chuveiro. Pode vir daqui a uma semana. Não importa quando. Importa que perguntaste. Porque perguntar ao corpo é o primeiro acto de respeito. E ele tem esperado muito tempo por isso.",
          },
          {
            timestamp: "5:00 - 5:30",
            section: "fecho",
            visual: "Território dissolve-se no céu. Frase final em texto creme. Fade para escuro. Logo Sete Véus. Silêncio.",
            narration: "O corpo não mente. A mente sim. Aprende a ouvir quem nunca te enganou. Se isto te tocou, inscreve-te. A Escola dos Véus está a chegar — e o primeiro curso é sobre a tua relação com dinheiro.",
          },
        ],
      },
      {
        number: 11,
        title: "O mito da decisão perfeita",
        courseOrigin: "olhos-abertos",
        territory: "Encruzilhada Infinita",
        week: 4,
        day: "quinta",
        gancho:
          "Estás parada há meses. Não porque não sabes o que fazer — mas porque tens medo de escolher errado. E se eu te disser que a decisão perfeita não existe? Que escolher imperfeito é melhor que não escolher?",
        fraseFinal:
          "A paz não vem de decidir certo. Vem de decidir. Ponto.",
        description:
          "Toca no tema da indecisão crónica — forte para engagement e comentários.",
        status: "script_ready",
        script: [
          {
            timestamp: "0:00 - 0:15",
            section: "gancho",
            visual: "Céu azul-marinho. Câmara desce para a Encruzilhada Infinita. Nevoeiro azul e branco. Vários caminhos em todas as direcções. Silhueta terracota no centro, imóvel, a olhar para todos os lados sem dar um passo.",
            narration: "Estás parada há meses. Não porque não sabes o que fazer — mas porque tens medo de escolher errado. E se eu te disser que a decisão perfeita não existe? Que escolher imperfeito é melhor que não escolher?",
          },
          {
            timestamp: "0:15 - 1:30",
            section: "situacao",
            visual: "Silhueta na encruzilhada. O nevoeiro move-se. Os caminhos aparecem e desaparecem — como se mudassem. Cada vez que a silhueta se inclina para um lado, outro caminho surge e ela hesita de novo. Paralisia.",
            narration: "Conheces a sensação. Tens uma decisão para tomar. Pode ser grande — mudar de emprego, acabar uma relação, mudar de país. Ou pode ser média — começar algo novo, dizer que sim a uma oportunidade, dizer que não a uma obrigação. E sabes o que queres. No fundo, sabes. Mas não avanças. Porque e se é a decisão errada? E se daqui a um ano te arrependes? E se há uma opção melhor que ainda não viste? Então pesquisas mais. Pedes mais opiniões. Fazes listas de prós e contras. Meditas sobre o assunto. E continuas exactamente onde estavas. Parada. Com a ilusão de que estás a ser prudente. Mas não és prudente. Estás com medo.",
          },
          {
            timestamp: "1:30 - 3:30",
            section: "padrao",
            visual: "A silhueta senta-se na encruzilhada. O nevoeiro começa a levantar ligeiramente — não desaparece, mas suaviza. Vemos que os caminhos, na verdade, não são tão diferentes quanto parecem no nevoeiro. Alguns até se cruzam mais à frente.",
            narration: "O mito da decisão perfeita é isto: a crença de que existe uma opção certa e todas as outras são erradas. E que se escolheres a errada, a tua vida estraga-se. Este mito é paralisante. E falso. Na realidade, a maioria das decisões não são irreversíveis. Podes mudar de emprego e perceber que não era — e mudar outra vez. Podes ir embora e voltar. Podes dizer sim e depois dizer não. A vida não é uma porta que se fecha para sempre. É uma série de correcções de rota. Mas o medo não te deixa ver isso. O medo mostra-te um cenário catastrófico por cada opção. E não te mostra o custo de ficar parada. E o custo de ficar parada é enorme. É a vida a passar enquanto tu esperas pela certeza. É a energia gasta em analisar em vez de viver. É o ressentimento silencioso de saberes que podias ter ido — e não foste. A inacção não é segurança. É outra forma de escolha. É escolheres o medo.",
          },
          {
            timestamp: "3:30 - 5:00",
            section: "gesto",
            visual: "Silhueta de pé. O nevoeiro suaviza-se. A silhueta dá o primeiro passo — não com certeza, mas com intenção. O caminho por baixo dos pés ilumina-se com cada passo. Os outros caminhos não desaparecem — ficam, mas já não paralisam.",
            narration: "Quero que faças uma coisa. Pensa na decisão que andas a adiar. E responde a esta pergunta — não no papel, no corpo: se não houvesse forma de errar, o que escolherias? Esquece as consequências por um momento. Esquece o que os outros vão pensar. Esquece o 'e se'. O que sentes que é certo — não na cabeça, no estômago? Agora — não tens de agir amanhã. Mas faz uma coisa: tira a decisão do abstracto. Dá-lhe um primeiro passo concreto. Não 'vou mudar de vida'. Mas 'vou ligar para saber como funciona'. Não 'vou acabar tudo'. Mas 'vou ter a conversa esta semana'. Um passo. Só um. Porque uma decisão imperfeita move-te. A espera pela perfeição congela-te. E a vida não acontece no congelador.",
          },
          {
            timestamp: "5:00 - 5:30",
            section: "fecho",
            visual: "Território dissolve-se no céu. Frase final em texto creme. Fade para escuro. Logo Sete Véus. Silêncio.",
            narration: "A paz não vem de decidir certo. Vem de decidir. Ponto. Se isto te tocou, inscreve-te. A Escola dos Véus está a chegar — e o primeiro curso é sobre a tua relação com dinheiro.",
          },
        ],
      },
      {
        number: 12,
        title: "3 sinais de que estás a repetir a vida da tua mãe sem saber",
        courseOrigin: "sangue-e-seda",
        territory: "Árvore das Raízes Visíveis",
        week: 4,
        day: "sabado",
        gancho:
          "Fazes exactamente como ela. Ou fazes exactamente o contrário. Ambas são heranças. Nenhuma é escolha. Aqui estão 3 sinais de que ainda estás a reagir à tua mãe em vez de viver a tua própria vida.",
        fraseFinal:
          "Repetir é hereditário. Escolher é liberdade. A Escola dos Véus abre em breve — e o primeiro curso ajuda-te a ver o que herdaste sem saber.",
        description:
          "O último vídeo fecha com o tema mais profundo — herança. Deixa a audiência a querer o curso.",
        status: "script_ready",
        script: [
          {
            timestamp: "0:00 - 0:15",
            section: "gancho",
            visual: "Céu azul-marinho. Câmara desce para a Árvore das Raízes Visíveis. A árvore é enorme, antiga. Duas silhuetas de pé — uma adulta, uma mais velha — em lados opostos da árvore, ligadas pelas mesmas raízes. As raízes pulsam em vermelho escuro e seda.",
            narration: "Fazes exactamente como ela. Ou fazes exactamente o contrário. Ambas são heranças. Nenhuma é escolha. Aqui estão 3 sinais de que ainda estás a reagir à tua mãe em vez de viver a tua própria vida.",
          },
          {
            timestamp: "0:15 - 1:30",
            section: "situacao",
            visual: "A silhueta adulta caminha. Atrás dela, como uma sombra, a silhueta mais velha faz o mesmo movimento. Quando a adulta para, a sombra para. Quando muda de direcção, a sombra também muda — mas para o lado oposto. Espelho invertido.",
            narration: "Há duas formas de herdar a vida da tua mãe. A mais óbvia: repetir. Casar com o mesmo tipo de pessoa. Reagir da mesma forma a conflitos. Carregar o mesmo peso. Sacrificar-te da mesma maneira. Olhar para ti aos 40 e reconhecer os gestos dela nas tuas mãos. A outra forma é menos óbvia mas igualmente poderosa: rejeitar tudo. Fazer exactamente o oposto. Ela era submissa — tu és controladora. Ela calava — tu explodes. Ela ficou — tu foges. Parece liberdade. Parece que te libertaste. Mas não te libertaste. Estás a reagir a ela. Cada escolha que fazes 'para não ser como ela' continua a ser sobre ela. A referência continua a ser a tua mãe. E enquanto ela for a referência — a favor ou contra — tu não és livre.",
          },
          {
            timestamp: "1:30 - 3:30",
            section: "padrao",
            visual: "A silhueta sentada entre as raízes da Árvore. Três raízes maiores brilham — uma por sinal. A silhueta toca em cada uma e vê uma cena de luz. Na primeira raiz: a mãe a sacrificar-se. Na segunda: a mãe a calar. Na terceira: a mãe a negar prazer. A silhueta reconhece-se em cada cena — como reflexo ou como oposto.",
            narration: "Os três sinais. O primeiro: sacrificas-te sem ninguém pedir. Olhas para a tua vida e percebes que estás a dar mais do que recebes. Em todas as relações. E quando alguém te pergunta o que precisas, não sabes responder. Isto não é generosidade — é programação. Aprendeste que o valor de uma mulher se mede pelo que sacrifica. Se a tua mãe se anulou pelos outros, tu absorveste essa regra. E mesmo que racionalmente discordes — o corpo obedece. O segundo: tens dificuldade em receber prazer sem culpa. Descanso, dinheiro, sexo, elogios — qualquer forma de prazer vem com um 'mas'. 'Gostei, mas devia estar a fazer outra coisa.' 'Mereço, mas há quem precise mais.' A tua mãe provavelmente não se permitia prazer. E ensinou-te, sem palavras, que prazer é egoísmo. O terceiro — e este é o mais profundo: reages emocionalmente como ela. Ou exactamente ao contrário. A forma como lidas com raiva, com tristeza, com medo — não é tua. É dela. Copiada ou invertida. Mas em ambos os casos, é uma resposta ao que viste. Não ao que sentes.",
          },
          {
            timestamp: "3:30 - 5:00",
            section: "gesto",
            visual: "Silhueta de pé, frente à Árvore. Não corta as raízes — mas planta algo novo ao lado. Uma raiz mais fina, de cor diferente — dourada — começa a crescer. A raiz nova não nega as antigas. Coexiste. A silhueta olha para cima, para os ramos, onde começa a entrar luz.",
            narration: "Não te vou pedir para perdoar a tua mãe. Não é disso que se trata. Vou pedir-te algo diferente. Pega num papel e divide-o em duas colunas. Na esquerda, escreve: 'O que herdei dela'. Na direita: 'O que é meu'. Na coluna da esquerda, põe tudo. O bom e o mau. A força e o medo. A generosidade e o sacrifício. O silêncio e a resiliência. Na coluna da direita, escreve o que escolheste. Não o que reagiste — o que escolheste. As coisas que são tuas, não dela. Pode ser pouco. Pode ser uma lista curta. Não faz mal. Porque o objectivo não é apagar a herança. É ver a herança. É distinguir o que é raiz dela do que é raiz tua. E a partir daí, escolher conscientemente o que fica. O que queres manter — porque é bonito, porque é teu, porque faz sentido. E o que queres devolver — com gentileza, com respeito, mas com firmeza. Porque não te pertence.",
          },
          {
            timestamp: "5:00 - 5:30",
            section: "fecho",
            visual: "Território dissolve-se no céu. Frase final em texto creme. Fade para escuro. Logo Sete Véus. Silêncio mais longo — este é o último vídeo.",
            narration: "Repetir é hereditário. Escolher é liberdade. A Escola dos Véus abre em breve — e o primeiro curso ajuda-te a ver o que herdaste sem saber. Se isto te tocou, inscreve-te. Há mais para ti.",
          },
        ],
      },
    ],
  },
  // ━━━ SEMANA 5 — A DUALIDADE: EU E O TODO ━━━
  {
    number: 5,
    theme: "A Dualidade: Eu e o Todo",
    objective:
      "Introduzir a vertente colectiva — como a cura individual toca o todo, como estamos ligados, como o silencio familiar vive no corpo.",
    videos: [
      {
        number: 13,
        title: "Porque choras sem razão aparente",
        courseOrigin: "o-fio-invisivel",
        territory: "O Lago dos Reflexos Partilhados",
        week: 5,
        day: "terca",
        gancho:
          "Já te aconteceu chorares sem saber porquê? E se esse choro não for só teu?",
        fraseFinal:
          "Não estás sozinha no que sentes. Nunca estiveste. Há um fio invisível.",
        description:
          "Há choros que não são nossos. Há dores que vêm de antes. Hoje falamos do fio invisível que nos liga — e do que acontece quando o vemos.",
        status: "draft",
        script: [
          {
            timestamp: "0:00 - 0:15",
            section: "gancho",
            visual:
              "Céu azul-marinho. Câmara desce para o Lago dos Reflexos Partilhados. Superfície opaca, prata escura. Silhueta sozinha na margem.",
            narration:
              "Já te aconteceu chorares sem saber porquê? Não é tristeza. Não é cansaço. É algo que sobe do fundo e não tem nome. E se esse choro não for só teu?",
          },
          {
            timestamp: "0:15 - 1:30",
            section: "situacao",
            visual:
              "Silhueta sentada junto ao lago. Reflexos vagos de outras figuras aparecem na água — gerações. Ondulações suaves.",
            narration:
              "Estás na cozinha. Acabaste de por as crianças a dormir. Sentas-te. E de repente os olhos enchem-se de água. Não aconteceu nada. O dia foi normal. Mas algo pesa. Algo quer sair. E se eu te dissesse que talvez não seja só teu? Que o que sentes pode vir de quem veio antes de ti?",
          },
          {
            timestamp: "1:30 - 3:30",
            section: "padrao",
            visual:
              "Lago a tornar-se transparente. Fios dourados a conectar reflexos de várias silhuetas na água — mãe, avó, bisavó. Sistema nervoso visível como rede de luz.",
            narration:
              "O sistema nervoso humano foi feito para se ligar. Para sentir o outro. Para carregar o que não é nomeado. O que a tua mãe sentiu e não disse, o teu corpo ouviu. O que a tua avó viveu e engoliu, ficou registado. E quando choras sem razão, pode ser que estejas a chorar por muitas. Não é fraqueza. É a prova de que estás ligada a algo maior do que tu.",
          },
          {
            timestamp: "3:30 - 5:00",
            section: "gesto",
            visual:
              "Silhueta com mãos no peito junto ao lago. Reflexos que se acalmam. Fios dourados brilham suavemente.",
            narration:
              "A próxima vez que chorares sem razão, não limpes as lágrimas logo. Põe a mão no peito e pergunta em silêncio: isto é meu ou é de alguém que veio antes de mim? Não precisas de resposta. O corpo sabe o que fazer com a pergunta certa.",
          },
          {
            timestamp: "5:00 - 5:30",
            section: "fecho",
            visual:
              "Lago transparente com fios dourados brilhantes. Dissolve no céu. Logo Sete Véus.",
            narration:
              "Não estás sozinha no que sentes. Nunca estiveste. Há um fio invisível que te liga a todas as que vieram antes. Se isto te tocou, inscreve-te. A Escola dos Véus está a chegar.",
          },
        ],
      },
      {
        number: 14,
        title: "O segredo que toda a tua família sabe mas ninguém diz",
        courseOrigin: "o-silencio-que-grita",
        secondaryCourse: "o-fio-invisivel",
        territory: "A Caverna dos Ecos Mudos",
        week: 5,
        day: "quinta",
        gancho:
          "Na tua família, há alguma coisa de que ninguém fala? Uma pessoa que desapareceu da conversa?",
        fraseFinal:
          "O que a tua família nunca disse não desapareceu. Vive no teu corpo.",
        description:
          "Os segredos familiares não desaparecem quando ninguém fala deles. Passam para o corpo. Para a geração seguinte. Para ti.",
        status: "draft",
        script: [
          {
            timestamp: "0:00 - 0:15",
            section: "gancho",
            visual:
              "Céu azul-marinho. Câmara desce para a Caverna dos Ecos Mudos. Escura, silenciosa. Paredes com marcas de palavras não ditas.",
            narration:
              "Na tua família, há alguma coisa de que ninguém fala? Um assunto que todos evitam? Uma história que muda de versão cada vez que alguém a conta?",
          },
          {
            timestamp: "0:15 - 1:30",
            section: "situacao",
            visual:
              "Várias silhuetas numa sala — família. Algumas viradas de costas. Sombras de palavras flutuam como ecos escuros.",
            narration:
              "Todas as famílias têm segredos. Às vezes é um divórcio que foi tratado como se nunca tivesse existido. Uma doença mental que se chamava 'nervos'. Uma gravidez que se escondeu. E tu cresceste nesse silêncio. Não te disseram para não falar — simplesmente percebeste. Pelo olhar da tua mãe quando o assunto se aproximava.",
          },
          {
            timestamp: "1:30 - 3:30",
            section: "padrao",
            visual:
              "Caverna com ecos visíveis. Ondas de luz nas paredes. Silhueta que abre a boca — primeiro som visual.",
            narration:
              "Os segredos familiares não desaparecem quando ninguém fala deles. Passam para o corpo. A ansiedade que sentes e não sabes explicar. A vergonha que aparece sem razão. O aperto na garganta quando alguém se aproxima de um tema proibido. Não é teu. Tornou-se teu porque ninguém lhe deu nome antes de ti. E quando uma pessoa na família finalmente fala, algo muda no sistema inteiro.",
          },
          {
            timestamp: "3:30 - 5:00",
            section: "gesto",
            visual:
              "Silhueta com mão estendida. Eco dourado a sair. Paredes da caverna a vibrar com luz.",
            narration:
              "Pega num papel. Escreve uma frase que começa assim: na minha família, nunca se fala sobre... Não penses. Escreve. Depois lê o que escreveste. E repara no que sentes no corpo ao ler.",
          },
          {
            timestamp: "5:00 - 5:30",
            section: "fecho",
            visual:
              "Caverna com ecos dourados. Dissolve no céu. Logo Sete Véus.",
            narration:
              "O que a tua família nunca disse não desapareceu. Vive no teu corpo. E talvez seja a tua vez de dar voz ao que foi calado. Se isto te tocou, inscreve-te. A Escola dos Véus está a chegar.",
          },
        ],
      },
      {
        number: 15,
        title: "O que calaste para ser aceite",
        courseOrigin: "a-teia",
        secondaryCourse: "o-espelho-do-outro",
        territory: "O Bosque dos Fios Entrelaçados",
        week: 5,
        day: "sabado",
        gancho:
          "Quando foi a última vez que disseste o que realmente pensavas num grupo? A versão verdadeira.",
        fraseFinal:
          "Pertencer não é desaparecer. É ser vista como és e ainda assim ter lugar.",
        description:
          "O que abdicaste para pertencer? A fome de pertença governa mais do que pensas. Hoje falamos do que calaste para caber — e de como encontrar o teu lugar sem desaparecer.",
        status: "draft",
        script: [
          {
            timestamp: "0:00 - 0:15",
            section: "gancho",
            visual:
              "Céu azul-marinho. Câmara desce para o Bosque dos Fios Entrelaçados. Fios emaranhados entre árvores. Silhueta presa.",
            narration:
              "Quando foi a última vez que disseste o que realmente pensavas num grupo? Não a versão educada. A versão verdadeira. A que guardas para o caminho de volta para casa.",
          },
          {
            timestamp: "0:15 - 1:30",
            section: "situacao",
            visual:
              "Silhueta em grupo — sorri mas o corpo está tenso. Fios que a prendem subtilmente. Depois: silhueta sozinha, boca aberta, finalmente a falar sem ninguém a ouvir.",
            narration:
              "Estás num almoço com amigas. Alguém diz algo com que não concordas. Sentes a vontade de dizer. Mas olhas à volta. E decides que não vale a pena. Então sorris. Acenas. E no carro, sozinha, dizes tudo o que devias ter dito. Mas já não conta.",
          },
          {
            timestamp: "1:30 - 3:30",
            section: "padrao",
            visual:
              "Fios que se afrouxam. Silhueta que recupera contorno. Bosque com luz verde-dourada a crescer.",
            narration:
              "Pertencer é a necessidade humana mais antiga. O cérebro trata a rejeição como ameaça de morte. Por isso aprendeste a adaptar-te. A moldar-te ao formato do grupo. Mas há um preço. Cada vez que te moldas, perdes um pedaço de contorno. E ao fim de anos, não sabes quem és sem a aprovação do outro. A boa notícia: podes pertencer sem desaparecer. Mas primeiro precisas de perceber o que abdicaste para caber.",
          },
          {
            timestamp: "3:30 - 5:00",
            section: "gesto",
            visual:
              "Silhueta no grupo, de pé, contorno definido. Fios que a ligam sem prender. Equilíbrio. Espelhos da Galeria dos Reflexos Vivos visíveis ao longe.",
            narration:
              "Esta semana, numa conversa em grupo, diz uma coisa verdadeira. Pode ser: eu penso diferente. Ou simplesmente: não. E repara no que acontece no teu corpo quando dizes.",
          },
          {
            timestamp: "5:00 - 5:30",
            section: "fecho",
            visual:
              "Bosque luminoso com teia equilibrada. Dissolve no céu. Logo Sete Véus.",
            narration:
              "Pertencer não é desaparecer. É ser vista como és e ainda assim ter lugar. Se isto te tocou, inscreve-te. A Escola dos Véus está a chegar — e há muito mais para ver.",
          },
        ],
      },
    ],
  },
  // ━━━ SEMANA 6 — O FOGO INTERIOR: RAIVA, MATERNIDADE E TRABALHO ━━━
  {
    number: 6,
    theme: "O Fogo Interior: Raiva, Maternidade e Trabalho",
    objective:
      "Três temas intensos e universais — a raiva proibida, a identidade perdida na maternidade, e o trabalho como fuga. Temas que activam forte identificação.",
    videos: [
      {
        number: 16,
        title: "Porque sorris quando queres gritar",
        courseOrigin: "a-chama",
        territory: "O Vulcão Adormecido",
        week: 6,
        day: "terca",
        gancho:
          "A última vez que sentiste raiva a sério — o que fizeste com ela? Gritaste? Choraste? Ou sorriste e disseste 'está tudo bem'?",
        fraseFinal:
          "A raiva não é o contrário do amor. O silêncio forçado é.",
        description:
          "A raiva como emoção proibida para mulheres. O corpo que guarda o que a boca não diz. Tema com forte activação emocional.",
        status: "draft",
        script: [
          {
            timestamp: "0:00 - 0:15",
            section: "gancho",
            visual:
              "Céu azul-marinho. Câmara desce para o Vulcão Adormecido. Superfície negra e fria. Silhueta rígida, mandíbula cerrada.",
            narration:
              "A última vez que sentiste raiva a sério — o que fizeste com ela? Gritaste? Choraste? Ou sorriste e disseste 'está tudo bem'?",
          },
          {
            timestamp: "0:15 - 1:30",
            section: "situacao",
            visual:
              "Silhueta a sorrir numa reunião enquanto o corpo fica tenso. Depois: silhueta sozinha no carro, mãos a tremer no volante. Fissuras subtis na superfície do vulcão.",
            narration:
              "Na reunião disseram-te que o projecto que fizeste sozinha ia ser apresentado por outra pessoa. Sentiste o calor subir. A mandíbula cerrar. Os olhos arder. Mas o que fizeste? Sorriste. Disseste 'claro, faz sentido'. E no carro, sozinha, as mãos tremiam no volante. Não de medo. De raiva. Uma raiva que nunca te ensinaram a ter. Porque meninas boas não gritam. Mulheres fortes não perdem o controlo. E tu — tu aprendeste tão bem a engolir que já nem sabes o que é raiva e o que é cansaço.",
          },
          {
            timestamp: "1:30 - 3:30",
            section: "padrao",
            visual:
              "Fissuras a abrir na superfície do vulcão. Lava visível por baixo. Silhueta que começa a sentir o calor. Mãos a abrir lentamente.",
            narration:
              "A raiva é a emoção mais censurada nas mulheres. Um homem com raiva é assertivo. Uma mulher com raiva é histérica. E tu aprendeste isso antes de teres palavras. Aprendeste que a raiva era perigosa. Que se a mostrasses, perdias amor. Perdias aprovação. Perdias o teu lugar. Então guardaste-a. Na mandíbula. Nas costas. No estômago. Transformaste-a em cansaço, em sarcasmo, em controlo, em choro. E o corpo aguentou — durante anos. Mas a raiva não desaparece porque a escondes. Cresce. E um dia sai — nos sítios errados, nas pessoas erradas, da forma errada. Não porque sejas má. Porque nunca te deixaram ser inteira.",
          },
          {
            timestamp: "3:30 - 5:00",
            section: "gesto",
            visual:
              "Silhueta de pé junto ao vulcão. Lava a fluir em canais controlados. Fogo que ilumina sem destruir. Silhueta com punhos abertos.",
            narration:
              "Esta semana, repara. Quando sorrires e o corpo disser outra coisa — para. Pergunta-te: estou a sorrir ou estou a engolir? Não precisas de gritar. Não precisas de explodir. Só precisas de notar. O primeiro passo para recuperar a raiva é reconhecê-la quando ela aparece.",
          },
          {
            timestamp: "5:00 - 5:30",
            section: "fecho",
            visual:
              "Vulcão com lava controlada. Dissolve no céu. Logo Sete Véus.",
            narration:
              "A raiva não é o contrário do amor. O silêncio forçado é. Se isto te tocou, inscreve-te. A Escola dos Véus abre em breve.",
          },
        ],
      },
      {
        number: 17,
        title: "Quando foi a última vez que alguém te chamou pelo teu nome",
        courseOrigin: "a-mulher-antes-de-mae",
        territory: "O Ninho que Pesa",
        week: 6,
        day: "quinta",
        gancho:
          "Pensa. Quando foi a última vez que alguém te chamou pelo teu nome? Não 'mãe'. Não 'amor'. O teu nome.",
        fraseFinal:
          "Sentir falta de ti mesma não é egoísmo. É o primeiro sinal de que ainda estás lá.",
        description:
          "A perda de identidade na maternidade. Tema de forte identificação para mães de todas as idades.",
        status: "draft",
        script: [
          {
            timestamp: "0:00 - 0:15",
            section: "gancho",
            visual:
              "Céu azul-marinho. Câmara desce para o Ninho que Pesa. Ninho enorme. Silhueta quase invisível dentro dele.",
            narration:
              "Quando foi a última vez que alguém te chamou pelo teu nome? Não 'mãe'. Não 'amor'. O teu nome. O que sentiste?",
          },
          {
            timestamp: "0:15 - 1:30",
            section: "situacao",
            visual:
              "Silhueta dentro do ninho, rodeada de movimento — pequenas silhuetas que precisam, puxam, chamam. Depois: silhueta sozinha na casa de banho, olhar perdido no espelho. Primeiro momento de silêncio.",
            narration:
              "São sete da manhã. Já fizeste três coisas antes de abrir os olhos — o lanche, a mochila, o banho. O teu café ficou frio. Outra vez. Na casa de banho, cinco minutos. É o único sítio onde ninguém bate. Olhas-te ao espelho e por um segundo não reconheces quem está ali. Não é que estejas mal. É que não estás. A mulher que eras antes dos filhos — a que dançava, a que lia, a que tinha opiniões sobre cinema — onde foi?",
          },
          {
            timestamp: "1:30 - 3:30",
            section: "padrao",
            visual:
              "Silhueta a emergir lentamente do ninho. Contorno próprio a aparecer. Duas formas da mesma pessoa — mãe e mulher — começam a separar-se.",
            narration:
              "Ninguém te avisou que quando um filho nasce, uma mulher morre. Não fisicamente. Mas a versão de ti que existia antes — a que tinha tempo, corpo, desejo, nome — essa desapareceu. E no lugar dela ficou 'mãe'. Uma função. Uma lista de tarefas. Uma culpa infinita. E o mais cruel: se sentes falta de ti mesma, a culpa duplica. Porque uma boa mãe não devia querer ser outra coisa. Devia bastar. Mas não basta. E sentir isso não te faz má mãe. Faz-te humana. Faz-te inteira. Faz-te uma mulher que existia antes dos filhos e que merece continuar a existir.",
          },
          {
            timestamp: "3:30 - 5:00",
            section: "gesto",
            visual:
              "Silhueta fora do ninho, mão no próprio peito. Ninho bonito atrás. Espaço entre as duas. Luz ocre quente.",
            narration:
              "Esta semana, faz uma coisa só tua. Não para os filhos. Não para a casa. Não para o parceiro. Pode ser ler dez páginas. Pode ser andar à chuva. Pode ser sentar-te e não fazer nada durante quinze minutos. E quando a culpa aparecer — e vai aparecer — repara nela. Não a obedeças. Só repara.",
          },
          {
            timestamp: "5:00 - 5:30",
            section: "fecho",
            visual:
              "Ninho com espaço. Silhueta inteira. Dissolve no céu. Logo Sete Véus.",
            narration:
              "Sentir falta de ti mesma não é egoísmo. É o primeiro sinal de que ainda estás lá. Se isto te tocou, inscreve-te. A Escola dos Véus abre em breve.",
          },
        ],
      },
      {
        number: 18,
        title: "Porque o cansaço não passa com férias",
        courseOrigin: "o-oficio-de-ser",
        territory: "A Oficina Infinita",
        week: 6,
        day: "sabado",
        gancho:
          "Voltaste de férias. Descansaste. Dormiste. E na segunda-feira, quando abriste o portátil, sentiste exactamente o mesmo cansaço de antes. Porquê?",
        fraseFinal:
          "O cansaço que não passa com férias não é do corpo. É da vida que levas.",
        description:
          "O burnout como mensagem, não como fraqueza. O trabalho como fuga de si mesma. Tema com forte ressonância em mulheres profissionais.",
        status: "draft",
        script: [
          {
            timestamp: "0:00 - 0:15",
            section: "gancho",
            visual:
              "Céu azul-marinho. Câmara desce para a Oficina Infinita. Máquinas a trabalhar sem parar. Silhueta curvada sobre a mesa. Sem janela.",
            narration:
              "Voltaste de férias. Descansaste. Dormiste. E na segunda-feira, quando abriste o portátil, o cansaço era exactamente o mesmo. Como se nunca tivesses saído. Porquê?",
          },
          {
            timestamp: "0:15 - 1:30",
            section: "situacao",
            visual:
              "Silhueta a correr entre máquinas. Agenda cheia visível como engrenagens. Depois: silhueta parada num domingo — vazia, sem saber o que fazer consigo.",
            narration:
              "A tua semana é uma máquina perfeita. Reuniões, entregas, emails, decisões. Tens orgulho de ser eficiente. De dar conta. De nunca falhar. Mas num domingo, quando não há nada para fazer, sentes um vazio. Não sabes o que fazer contigo quando não estás a produzir. E o que fazes? Abres o portátil. Respondes a emails. Crias tarefas. Porque parar é sentir. E sentir — isso não está na agenda.",
          },
          {
            timestamp: "1:30 - 3:30",
            section: "padrao",
            visual:
              "Algumas máquinas a parar. Janela a abrir. Luz bronze a entrar. Silhueta a endireitar-se lentamente.",
            narration:
              "O burnout não é trabalhar demais. É viver de menos. O corpo cansa-se de manter uma vida que não alimenta. E o trabalho torna-se o anestésico perfeito — é o único sítio onde sentes que vales alguma coisa. Tiras valor do que produzes. Do cargo. Do reconhecimento. E quando isso para — nas férias, numa pausa, numa doença — não há nada por baixo. Só o vazio. O burnout é o corpo a dizer: estou cansado de ser uma máquina. Quero ser uma pessoa. Não é fraqueza. É a mensagem mais importante que vais receber.",
          },
          {
            timestamp: "3:30 - 5:00",
            section: "gesto",
            visual:
              "Oficina mais calma. Janela aberta. Silhueta sentada, sem fazer nada. Luz bronze quente. Paz.",
            narration:
              "Amanhã, quando abrires o portátil, para. Antes de responderes ao primeiro email, pergunta-te: estou a fazer isto porque preciso ou porque parar me assusta? Se a resposta te incomodar, fica com ela. Não a resolvas. Só nota.",
          },
          {
            timestamp: "5:00 - 5:30",
            section: "fecho",
            visual:
              "Oficina com janela aberta. Dissolve no céu. Logo Sete Véus.",
            narration:
              "O cansaço que não passa com férias não é do corpo. É da vida que levas. Se isto te tocou, inscreve-te. A Escola dos Véus abre em breve.",
          },
        ],
      },
    ],
  },
  // ━━━ SEMANA 7 — TEMPO, PODER E O CORPO QUE FALA ━━━
  {
    number: 7,
    theme: "Tempo, Poder e o Corpo que Fala",
    objective:
      "Fechar o ciclo com temas de maturidade — o tempo, o poder escondido, e a relação com a comida. Temas que completam o panorama da Escola.",
    videos: [
      {
        number: 19,
        title: "Porque sentes que já é tarde demais",
        courseOrigin: "o-relogio-partido",
        territory: "O Jardim das Estações",
        week: 7,
        day: "terca",
        gancho:
          "Já é tarde para mudar de vida. Já é tarde para começar algo novo. Já é tarde para seres quem querias ser. Tens a certeza?",
        fraseFinal:
          "Nunca é tarde para agora. O único momento que tens é este.",
        description:
          "A narrativa do 'já é tarde' como prisão. O medo de envelhecer. Os prazos inventados pela sociedade. Forte ressonância em mulheres 35+.",
        status: "draft",
        script: [
          {
            timestamp: "0:00 - 0:15",
            section: "gancho",
            visual:
              "Céu azul-marinho. Câmara desce para o Jardim das Estações. Relógio gigante. Flores a nascer e morrer em segundos. Silhueta a correr.",
            narration:
              "Já é tarde para mudar. Já é tarde para começar. Já é tarde para seres quem querias ser. Tens a certeza? Ou é o relógio a falar por ti?",
          },
          {
            timestamp: "0:15 - 1:30",
            section: "situacao",
            visual:
              "Silhueta a olhar para trás — versões mais jovens de si a desaparecer. Depois: silhueta parada a meio do jardim, relógio enorme atrás. Imobilizada.",
            narration:
              "Tinhas planos. Ias viajar. Ias escrever. Ias começar aquele negócio. Ias dizer o que sentias. E depois a vida aconteceu. Os filhos. O trabalho. As contas. E agora olhas para trás e pensas: perdi tempo. Devia ter feito há dez anos. E olhas para a frente e pensas: já não vale a pena. É tarde. Tenho 42 anos. Ou 48. Ou 55. E o relógio bate mais alto que qualquer desejo.",
          },
          {
            timestamp: "1:30 - 3:30",
            section: "padrao",
            visual:
              "Relógio com fissuras. Tempo a abrandar. Estações a coexistir — primavera e outono lado a lado. Silhueta a parar de correr.",
            narration:
              "Casar até aos 30. Filhos até aos 35. Carreira até aos 40. Corpo perfeito até aos 45. Quem decidiu isto? Não foste tu. Foram regras que absorveste antes de teres voz. E agora vives com um relógio interno que te diz que cada ano que passa é um ano perdido. Mas repara: quando dizes 'é tarde', o que realmente sentes é medo. Medo de falhar. Medo de parecer ridícula. Medo de começar do zero quando os outros parecem ter chegado. Mas 'tarde' é uma ilusão. Não existe um horário certo para a tua vida. Existe este momento. E neste momento ainda estás aqui. Ainda estás viva. E isso é o suficiente para começar.",
          },
          {
            timestamp: "3:30 - 5:00",
            section: "gesto",
            visual:
              "Relógio partido. Jardim com todas as estações em paz. Silhueta sentada, presente. Luz âmbar-prateada.",
            narration:
              "Pega num papel. Escreve uma coisa que adias porque achas que é tarde. Uma só. Agora escreve por baixo: o que me impede não é o tempo — é o medo de quê? Lê o que escreveste. O inimigo nunca foi o relógio. Foi o que acreditas sobre ti.",
          },
          {
            timestamp: "5:00 - 5:30",
            section: "fecho",
            visual:
              "Jardim sem relógio. Todas as estações. Dissolve no céu. Logo Sete Véus.",
            narration:
              "Nunca é tarde para agora. O único momento que tens é este. Se isto te tocou, inscreve-te. A Escola dos Véus abre em breve.",
          },
        ],
      },
      {
        number: 20,
        title: "A auto-sabotagem explicada: porque estragas quando está a correr bem",
        courseOrigin: "a-coroa-escondida",
        territory: "O Trono Coberto",
        week: 7,
        day: "quinta",
        gancho:
          "Estava a correr bem. Tinhas finalmente conseguido. E depois fizeste aquela coisa — sabotaste. Porquê?",
        fraseFinal:
          "Não estragas porque não mereces. Estragas porque ter é mais assustador que querer.",
        description:
          "A auto-sabotagem como protecção inconsciente. O medo de brilhar, de ter sucesso, de ser vista. Tema que gera forte reconhecimento.",
        status: "draft",
        script: [
          {
            timestamp: "0:00 - 0:15",
            section: "gancho",
            visual:
              "Céu azul-marinho. Câmara desce para o Trono Coberto. Sala escura. Trono coberto por panos. Silhueta encolhida, de costas.",
            narration:
              "Estava a correr bem. Tinhas finalmente conseguido. E depois fizeste aquela coisa. Sabotaste. Porquê?",
          },
          {
            timestamp: "0:15 - 1:30",
            section: "situacao",
            visual:
              "Silhueta quase a sentar-se no trono — recua. Panos voltam a cobrir. Depois: silhueta pequena num canto, alívio e vergonha ao mesmo tempo.",
            narration:
              "Recebeste a promoção. Ou o convite. Ou o elogio. E durante cinco minutos sentiste-te bem. Mas depois começou. O pensamento: vão descobrir. Não sou assim tão boa. Foi sorte. E sem perceberes, começaste a fazer coisas que estragavam tudo. Chegaste atrasada. Não respondeste ao email. Arranjaste uma discussão. Desististe antes de começar. E quando tudo desmoronou, sentiste uma coisa estranha: alívio. Não era felicidade. Era: pelo menos já não tenho de sustentar aquilo.",
          },
          {
            timestamp: "1:30 - 3:30",
            section: "padrao",
            visual:
              "Panos a cair do trono. Dourado e púrpura a aparecer. Silhueta a olhar para o trono com medo e curiosidade. Luz a crescer.",
            narration:
              "A auto-sabotagem não é estupidez. É protecção. O teu sistema nervoso aprendeu que ter é perigoso. Talvez porque quando eras pequena, ter atenção significava inveja. Ou porque quando brilhavas, alguém te apagava. Ou porque aprendeste que o sucesso significa solidão — que se fores demasiado, os outros vão embora. Então o corpo cria um mecanismo: destrói antes que seja destruído. Sabota antes que alguém te tire o que conquistaste. É um reflexo de sobrevivência. Mas já não precisas dele. A criança que aprendeu que brilhar era perigoso já cresceu. E a adulta pode decidir: desta vez, fico.",
          },
          {
            timestamp: "3:30 - 5:00",
            section: "gesto",
            visual:
              "Silhueta de pé junto ao trono. Mão a tocar no encosto. Hesitação a transformar-se em decisão. Luz dourada-púrpura.",
            narration:
              "A próxima vez que algo correr bem — e sentires a vontade de estragar — para. Respira. E diz internamente: isto é medo, não verdade. Posso ter isto. Não precisas de sentar no trono hoje. Só precisas de parar de o cobrir.",
          },
          {
            timestamp: "5:00 - 5:30",
            section: "fecho",
            visual:
              "Trono descoberto. Silhueta de pé. Dissolve no céu. Logo Sete Véus.",
            narration:
              "Não estragas porque não mereces. Estragas porque ter é mais assustador que querer. Se isto te tocou, inscreve-te. A Escola dos Véus abre em breve.",
          },
        ],
      },
      {
        number: 21,
        title: "O que procuras no frigorífico à meia-noite",
        courseOrigin: "a-fome",
        territory: "A Mesa Vazia",
        week: 7,
        day: "sabado",
        gancho:
          "Não tens fome. Sabes que não tens fome. Mas abres o frigorífico na mesma. O que procuras lá dentro?",
        fraseFinal:
          "A fome que te leva ao frigorífico à meia-noite não é de comida. É de ti.",
        description:
          "A relação emocional com a comida. O corpo como campo de batalha. Tema profundamente íntimo que gera forte identificação. Fecho do ciclo de vídeos.",
        status: "draft",
        script: [
          {
            timestamp: "0:00 - 0:15",
            section: "gancho",
            visual:
              "Céu azul-marinho. Câmara desce para a Mesa Vazia. Mesa enorme e vazia. Silhueta sentada à frente. Prato vazio. Escuridão.",
            narration:
              "Não tens fome. Sabes que não tens fome. Mas abres o frigorífico na mesma. De pé, no escuro da cozinha. O que procuras lá dentro?",
          },
          {
            timestamp: "0:15 - 1:30",
            section: "situacao",
            visual:
              "Silhueta na cozinha escura, luz do frigorífico no rosto. Come de pé, rápido, quase escondida. Depois: silhueta sentada na cama, culpa visível como sombra sobre o corpo.",
            narration:
              "São onze da noite. O dia foi longo. Os miúdos dormiram. O parceiro dorme. E tu estás na cozinha. De pé. A comer pão com manteiga. Ou chocolate. Ou restos. Não com prazer — com urgência. Como se enchesses um buraco. Comes rápido. Quase sem respirar. E quando paras, a culpa chega. O tribunal interno abre sessão: outra vez. Devias ter mais controlo. Amanhã começas a dieta. Mas amanhã o buraco volta. E tu também.",
          },
          {
            timestamp: "1:30 - 3:30",
            section: "padrao",
            visual:
              "Mesa a ganhar alimentos. Silhueta a sentar-se. Luz rosada a crescer. Conflito entre fome e culpa visível — duas sombras.",
            narration:
              "A fome emocional não é gula. É linguagem. É o corpo a pedir o que não sabe pedir com palavras. Conforto. Presença. Prazer. Segurança. Aprendeste cedo que a comida era tudo isso. Na cozinha da tua mãe, comida era amor. Recusar era rejeitar. E agora, quando te sentes vazia, o corpo vai buscar o que conhece: o frigorífico. Mas o frigorífico não tem o que procuras. Não há queijo suficiente para preencher solidão. Não há chocolate suficiente para compensar a vida que adias. O que procuras no prato é o que te falta na vida. E enquanto não nomeares essa falta, vais continuar a comer de pé, no escuro, às onze da noite.",
          },
          {
            timestamp: "3:30 - 5:00",
            section: "gesto",
            visual:
              "Silhueta sentada à mesa com comida. Come devagar. Luz rosada quente. Presença. Sem culpa.",
            narration:
              "Da próxima vez que fores ao frigorífico fora de horas — para. Antes de abrir, pergunta-te: do que tenho fome realmente? Não da comida — do quê? E espera pela resposta. Pode ser: descanso. Pode ser: atenção. Pode ser: silêncio. Pode ser: prazer. Quando souberes, podes decidir: como é que me alimento disso sem usar o prato?",
          },
          {
            timestamp: "5:00 - 5:30",
            section: "fecho",
            visual:
              "Mesa bonita. Silhueta em paz. Dissolve no céu. Logo Sete Véus. Silêncio mais longo.",
            narration:
              "A fome que te leva ao frigorífico à meia-noite não é de comida. É de ti. Se isto te tocou, inscreve-te. A Escola dos Véus abre em breve — e há mais para ver.",
          },
        ],
      },
    ],
  },
  // ━━━ SEMANA 8 — RECOMEÇO E PROJECÇÃO ━━━
  {
    number: 8,
    theme: "Recomeço e Projecção",
    objective:
      "Fechar o ciclo com os dois cursos que faltam — a reinvenção após a destruição e o que vemos no outro como espelho de nós.",
    videos: [
      {
        number: 22,
        title: "O dia em que a tua vida ardeu — e o que cresceu depois",
        courseOrigin: "depois-do-fogo" as CourseSlug,
        territory: "Campo Queimado",
        week: 8,
        day: "terca" as const,
        gancho:
          "Houve um dia em que tudo mudou. O emprego, a relação, a saúde, a confiança — algo ardeu. E tu ficaste de pé no meio das cinzas. A pergunta não é como reconstruir o que era. É: o que pode crescer agora que o terreno está livre?",
        fraseFinal:
          "O que cresce depois do fogo nunca é igual ao que ardeu. E isso não é tragédia — é território novo.",
        description:
          "O tema do recomeço forçado. Para quem perdeu algo grande — emprego, relação, identidade — e precisa de reconstruir sem saber como.",
        status: "draft" as const,
        script: [
          {
            timestamp: "0:00 - 0:15",
            section: "gancho",
            visual:
              "Céu azul-marinho. Câmara desce para o Campo Queimado. Terra negra, cinzas, troncos carbonizados. Silhueta de pé no meio da devastação.",
            narration:
              "Houve um dia em que tudo mudou. O emprego, a relação, a saúde, a confiança — algo ardeu. E tu ficaste de pé no meio das cinzas.",
          },
          {
            timestamp: "0:15 - 1:30",
            section: "situacao",
            visual:
              "Silhueta caminha pelo campo queimado. Cinzas levantam-se com cada passo. Ao longe, vê-se a Encruzilhada — recomeçar implica decidir.",
            narration:
              "Acordas e por um segundo esqueces. Depois lembras. E o peso volta. A relação que acabou. O emprego que perdeste. A pessoa que eras e já não és. Olhas à volta e nada se parece com o que era. Os amigos dizem que vai ficar bem. Que o tempo cura. Que o que não mata fortalece. Mas tu não queres ser forte. Queres que doa menos. Queres acordar sem aquele segundo de esquecimento seguido do impacto da realidade.",
          },
          {
            timestamp: "1:30 - 3:30",
            section: "padrao",
            visual:
              "Campo com primeiros brotos verdes entre cinzas. Brasas alaranjadas sob a terra. Silhueta ajoelhada, a tocar na terra.",
            narration:
              "O erro que quase toda a gente comete depois do fogo é tentar reconstruir o que era. A mesma casa, a mesma vida, o mesmo formato. Como se o objectivo fosse voltar ao ponto de partida. Mas o terreno mudou. Tu mudaste. E o que cresce em terra queimada não é o que lá estava antes — é outra coisa. Diferente. Às vezes mais forte. Sempre diferente. O luto não é só pelo que perdeste. É pela versão de ti que existia naquele contexto. Essa versão morreu com o fogo. E enquanto tentares ressuscitá-la, vais sofrer. Porque ela não volta. O que vem a seguir é novo.",
          },
          {
            timestamp: "3:30 - 5:00",
            section: "gesto",
            visual:
              "Brotos verdes crescem. Silhueta de pé, a olhar para o horizonte onde o céu começa a clarear. Não é dia ainda — mas já não é noite.",
            narration:
              "Esta semana, faz uma coisa. Pega num caderno e escreve no topo: 'O que é possível agora que não era antes.' Não o que perdeste. O que se abriu. Pode ser pouco. Pode ser uma linha. Mas obriga-te a olhar para o espaço — não para o buraco. Porque o fogo destruiu. Mas também limpou o terreno. E há coisas que só crescem em terra que já ardeu.",
          },
          {
            timestamp: "5:00 - 5:30",
            section: "fecho",
            visual:
              "Campo com vida nova. Dissolve no céu. Logo Sete Véus. Silêncio.",
            narration:
              "O que cresce depois do fogo nunca é igual ao que ardeu. E isso não é tragédia — é território novo. Se isto te tocou, inscreve-te. A Escola dos Véus está a chegar.",
          },
        ],
      },
      {
        number: 23,
        title: "Porque é que certas pessoas te irritam tanto?",
        courseOrigin: "o-espelho-do-outro" as CourseSlug,
        territory: "Galeria dos Reflexos Vivos",
        week: 8,
        day: "quinta" as const,
        gancho:
          "Há pessoas que te irritam sem razão aparente. Não fizeram nada de grave. Mas algo nelas te incomoda profundamente. E se o que te irrita no outro for exactamente o que não aceitas em ti?",
        fraseFinal:
          "O outro não é o problema. O outro é o espelho que não pediste mas de que precisavas.",
        description:
          "A projecção como mecanismo inconsciente. O que vemos nos outros como reflexo de nós. Tema com forte potencial de engagement.",
        status: "draft" as const,
        script: [
          {
            timestamp: "0:00 - 0:15",
            section: "gancho",
            visual:
              "Céu azul-marinho. Câmara desce para a Galeria dos Reflexos Vivos. Espelhos vivos em molduras verde-esmeralda. Cada espelho mostra uma pessoa diferente. Silhueta de costas, a olhar para os espelhos.",
            narration:
              "Há pessoas que te irritam sem razão aparente. Não fizeram nada de grave. Mas algo nelas te incomoda profundamente. E se o que te irrita no outro for exactamente o que não aceitas em ti?",
          },
          {
            timestamp: "0:15 - 1:30",
            section: "situacao",
            visual:
              "Silhueta a caminhar pela galeria. Cada espelho mostra um rosto diferente — o colega arrogante, a amiga dramática, o parceiro distante. A silhueta reage a cada um com tensão visível.",
            narration:
              "Pensas na colega do trabalho. A que fala alto. A que se promove. A que ocupa espaço sem pedir licença. Irrita-te. Dizes que é arrogância. Que é falta de noção. Mas há algo mais. Pensas no amigo que cancelou à última hora. Outra vez. Dizes que é falta de respeito. Que não te valoriza. Mas a irritação que sentes é desproporcional. Porque não é só sobre ele. É sobre ti.",
          },
          {
            timestamp: "1:30 - 3:30",
            section: "padrao",
            visual:
              "Os espelhos começam a mudar. Em vez de mostrarem outros, começam a reflectir a própria silhueta. Mistura de reflexos — o rosto do outro com a forma da silhueta. Reconhecimento parcial.",
            narration:
              "A colega que te irrita com a sua 'arrogância' — talvez te irrite porque ocupa o espaço que tu não te permites. O amigo que cancela — talvez te irrite porque tu nunca te dás permissão de cancelar. A pessoa excessivamente emocional — talvez te irrite porque tu bloqueaste as tuas emoções há anos. Isto chama-se projecção. E não é fraqueza — é informação. Cada vez que alguém te irrita desproporcionalmente, essa pessoa está a mostrar-te algo sobre ti. Pode ser uma qualidade que reprimes. Um desejo que negas. Uma ferida que não curastes. O outro não é o problema. O outro é o mensageiro.",
          },
          {
            timestamp: "3:30 - 5:00",
            section: "gesto",
            visual:
              "Silhueta frente a um espelho que agora mostra o seu próprio reflexo com clareza. Verde-esmeralda suave. Mãos no peito.",
            narration:
              "Pensa numa pessoa que te irrita. Não alguém que te fez mal — alguém que te incomoda sem razão proporcional. Agora pergunta: o que é que essa pessoa faz que eu não me permito? O que é que essa pessoa tem que eu gostaria de ter? O que é que essa pessoa mostra que eu prefiro esconder? A resposta pode surpreender-te. E pode ser a coisa mais útil que aprendes esta semana.",
          },
          {
            timestamp: "5:00 - 5:30",
            section: "fecho",
            visual:
              "Galeria com espelhos claros. Silhueta em paz. Dissolve no céu. Logo Sete Véus.",
            narration:
              "O outro não é o problema. O outro é o espelho que não pediste mas de que precisavas. Se isto te tocou, inscreve-te. A Escola dos Véus está a chegar.",
          },
        ],
      },
    ],
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────────

export function getAllVideos(): YouTubeVideo[] {
  return YOUTUBE_WEEKS.flatMap((w) => w.videos);
}

export function getVideoByNumber(n: number): YouTubeVideo | undefined {
  return getAllVideos().find((v) => v.number === n);
}

export function getVideosByWeek(week: number): YouTubeVideo[] {
  return YOUTUBE_WEEKS.find((w) => w.number === week)?.videos ?? [];
}

export function getVideosByCourse(slug: CourseSlug): YouTubeVideo[] {
  return getAllVideos().filter(
    (v) => v.courseOrigin === slug || v.secondaryCourse === slug
  );
}

export function getWeekByNumber(week: number): YouTubeWeek | undefined {
  return YOUTUBE_WEEKS.find((w) => w.number === week);
}

const DAY_LABELS: Record<YouTubeDay, string> = {
  terca: "Terça-feira",
  quinta: "Quinta-feira",
  sabado: "Sábado",
};

export function getDayLabel(day: YouTubeDay): string {
  return DAY_LABELS[day];
}

const STATUS_LABELS: Record<VideoStatus, string> = {
  draft: "Rascunho",
  script_ready: "Script pronto",
  approved: "Aprovado",
  producing: "Em produção",
  review: "Em revisão",
  scheduled: "Agendado",
  published: "Publicado",
};

export function getStatusLabel(status: VideoStatus): string {
  return STATUS_LABELS[status];
}
