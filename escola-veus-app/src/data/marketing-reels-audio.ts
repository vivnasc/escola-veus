/**
 * Narração de voz para Reels e Carrosséis de marketing — Os Sete Espelhos
 *
 * Tom: Voz da Vivianne — calma, sensorial, nunca clínica
 * Todos os textos são versões em voz corrida (sem indicações de cena)
 * prontos para gerar via ElevenLabs e usar como áudio no CapCut
 */

// ── Reels (narração corrida, 25-35s) ─────────────────────────────────────────

export type ReelVoz = {
  id: string;
  nome: string;
  ficheiro: string;
  texto: string;
};

export const REELS_VOZ: ReelVoz[] = [
  {
    id: "reel-ilusao-automatico",
    nome: "Construíste a tua vida inteira...",
    ficheiro: "reel-ilusao-automatico.mp3",
    texto:
      "Construíste a tua vida inteira... sem nunca ter perguntado o que querias. Quando foi que escolhi tomar café em vez de chá? Uma pergunta absurda. Mas foi a pergunta que mudou tudo. O Espelho da Ilusão é a história de uma mulher que, pela primeira vez, pergunta. Não é um livro. É uma experiência. Há mais para ti. Teste gratuito em seteveus.space.",
  },
  {
    id: "reel-3-sinais-automatico",
    nome: "3 sinais de que vives no automático",
    ficheiro: "reel-3-sinais-automatico.mp3",
    texto:
      "Três sinais de que vives no automático. Um: respondes tanto faz a perguntas importantes. Dois: não te lembras da última vez que escolheste uma rua diferente. Três: a tua primeira reacção nunca é o que verdadeiramente pensas. Se te reconheces... não és a única. Escrevi uma história sobre isso. O Espelho da Ilusão. Teste gratuito em seteveus.space.",
  },
  {
    id: "reel-no-heranca-mae-filha",
    nome: "O Nó da Herança — mãe e filha",
    ficheiro: "reel-no-heranca-mae-filha.mp3",
    texto:
      "O que acontece quando uma mãe e uma filha dizem o que sempre calaram? Sara viu o véu. Mas há um nó que ficou por desatar. O Nó da Herança é a história de Sara e Helena — mãe e filha — e o silêncio herdado entre elas. Não é um upsell. É uma continuação emocional. Só se desbloqueia depois de completares o Espelho da Ilusão. Começa pelo Espelho. O Nó espera por ti.",
  },
  {
    id: "reel-livro-fisico-codigo",
    nome: "Tens o livro físico?",
    ficheiro: "reel-livro-fisico-codigo.mp3",
    texto:
      "Tens o livro físico Os 7 Véus do Despertar? Há algo que ainda não sabes sobre ele. O livro abre portas que ainda não conheces. Leitura integrada. Diário pessoal. Comunidade anónima. E se já compraste o livro, o acesso é gratuito. Pede o teu código em menos de um minuto em seteveus.space.",
  },
  {
    id: "reel-medo-voz-interior",
    nome: "Há uma voz que diz não antes de pensares",
    ficheiro: "reel-medo-voz-interior.mp3",
    texto:
      "Há uma voz que diz não... antes de pensares. Não é covardia. É um mecanismo antigo — treinado ao longo de anos de cautela disfarçada de bom senso. E se falhar? E se me arrepender? Reconheces estas vozes? O Espelho do Medo é uma história sobre o Rui — e sobre o que o medo calou durante anos. Março 2026. seteveus.space.",
  },
  {
    id: "reel-nao-livro-espelho",
    nome: "Isto não é um livro. É um espelho.",
    ficheiro: "reel-nao-livro-espelho.mp3",
    texto:
      "Isto não é um livro. É um espelho. Lês. Respiras. Escreves. Sentes. Sete histórias. Sete véus. Cada um esconde algo que já sabes mas nunca disseste. Três minutos. Sete perguntas. Qual Espelho combina contigo? Teste gratuito em seteveus.space.",
  },
  {
    id: "reel-diario-escrita",
    nome: "Não escreveste nada sobre ti em anos",
    ficheiro: "reel-diario-escrita.mp3",
    texto:
      "Não escreveste nada sobre ti em anos. E isso pesa. Na experiência digital, cada capítulo tem um espaço para escreveres o que sentiste. Só tu lês. Não vai a lado nenhum. Só fica. E se quiseres partilhar algo, há uma comunidade anónima. Sem nomes. Tudo desaparece em trinta dias. seteveus.space.",
  },
  {
    id: "reel-reconhecimento-leste-fim",
    nome: "Se leste isto até ao fim...",
    ficheiro: "reel-reconhecimento-leste-fim.mp3",
    texto:
      "Se leste isto até ao fim... este livro é para ti. Via, mas não sentia. Registava, mas não participava. Como quem assiste a um espectáculo por trás de uma janela fechada. Reconheces-te? Então não és a única. O Espelho da Ilusão. Uma história sobre despertar do automático. Disponível agora em seteveus.space.",
  },
  {
    id: "reel-livro-estante-extensao",
    nome: "Tens este livro na estante?",
    ficheiro: "reel-livro-estante-extensao.mp3",
    texto:
      "Tens este livro na estante? Há algo que não sabes sobre ele. O livro físico tem uma extensão digital. Não é uma cópia — é uma experiência diferente. Diário reflexivo. Comunidade anónima. Respiração guiada. E se já compraste o livro, o acesso é gratuito. Pede o teu código em dois minutos em seteveus.space.",
  },
  {
    id: "reel-ler-sem-escrever",
    nome: "Ler sem escrever é como olhar para um espelho de olhos fechados",
    ficheiro: "reel-ler-sem-escrever.mp3",
    texto:
      "Ler sem escrever é como olhar para um espelho de olhos fechados. Na experiência digital, cada capítulo tem um espaço para escreveres o que sentiste. Só tu lês. Só tu decides o que guardas. E na comunidade, descobres que não estás sozinha. Acesso digital gratuito para quem tem o livro físico. seteveus.space.",
  },
  {
    id: "reel-pergunta-que-ninguem-faz",
    nome: "Há uma pergunta que ninguém te faz",
    ficheiro: "reel-pergunta-que-ninguem-faz.mp3",
    texto:
      "Há uma pergunta que ninguém te faz. E que talvez precises de te fazer a ti mesma. Quando foi a última vez que fizeste algo só porque quiseste? Sem explicar. Sem pedir licença. Só porque quiseste. Há mais para ti. Descobre em seteveus.space.",
  },
];

// ── Carrosséis (narração corrida dos slides, ~45-60s) ────────────────────────

export type CarrosselVoz = {
  id: string;
  /** ID do carrossel em professionalCarousels para fazer match */
  carouselId: string;
  nome: string;
  ficheiro: string;
  texto: string;
};

export const CARROSSEIS_VOZ: CarrosselVoz[] = [
  {
    id: "carousel-voz-cansaco-automatico",
    carouselId: "carousel-cansaco-automatico",
    nome: "Há um tipo de cansaço que não é sono",
    ficheiro: "carousel-voz-cansaco-automatico.mp3",
    texto:
      "Há um tipo de cansaço que não é sono. Acordas. Fazes o que tens de fazer. As coisas funcionam. És competente. Eficiente. E sentes-te a assistir. Não é depressão. Não é ingratidão. É algo mais subtil: a sensação de que a vida é quase tua. Como se um dia, sem aviso, tivesses parado de escolher. E continuado a funcionar. Reconheces-te? Há uma história sobre isto. E sobre a mulher que, numa manhã comum, decidiu perguntar. O Espelho da Ilusão — em seteveus.space.",
  },
  {
    id: "carousel-voz-sara-pergunta",
    carouselId: "carousel-sara-pergunta",
    nome: "Sara fez uma pergunta absurda",
    ficheiro: "carousel-voz-sara-pergunta.mp3",
    texto:
      "Quando foi que escolhi tomar café em vez de chá? Era uma pergunta sem importância. Sara sabia isso. E não conseguia deixar de a fazer. Porque depois de café versus chá, vinha a roupa que usava. O trabalho que tinha. A vida que levava. E se tudo tinha sido assim — recebido, não escolhido? Isto não é uma crise. É um acordar. Devagar. Ao ritmo de quem primeiro tem de notar. A história de Sara é um espelho. O que ela vê, talvez vejas. O que ela pergunta, talvez precises de perguntar. O Espelho da Ilusão — seteveus.space.",
  },
  {
    id: "carousel-voz-o-que-sao-espelhos",
    carouselId: "carousel-o-que-sao-espelhos",
    nome: "O que são os Espelhos",
    ficheiro: "carousel-voz-o-que-sao-espelhos.mp3",
    texto:
      "Às vezes precisas de ver a tua vida noutros olhos para reconhecer os teus. Os Espelhos são histórias. Ficção. Mas a personagem vive o que tu calavas. Não te dizem o que fazer. Não te ensinam nada. Deixam-te reconhecer o que já sabes. São sete histórias. Cada uma revela um véu: Ilusão, Medo, Culpa, Identidade, Controlo, Desejo, Separação. Lês ao teu ritmo. Capítulo a capítulo. Com um diário pessoal. E uma comunidade que desaparece. Começa pelo Espelho da Ilusão. seteveus.space.",
  },
  {
    id: "carousel-voz-no-heranca-historia",
    carouselId: "carousel-no-depois-do-espelho",
    nome: "O Nó — a história que só existe depois",
    ficheiro: "carousel-voz-no-heranca-historia.mp3",
    texto:
      "Há uma segunda história. Mas só existe depois da primeira. Quando Sara completou o Espelho da Ilusão, um texto novo abriu. A história de Helena. A mãe. Helena sempre soube. Viu os mesmos sinais que Sara não via. Calou os mesmos medos. Esperou anos. Agora que Sara acordou, Helena tem algo para lhe dizer. O Nó não é uma continuação. É o que estava a acontecer do outro lado. Só se vê depois de ver o espelho. O Nó da Herança. Disponível para quem completou o Espelho da Ilusão. seteveus.space.",
  },
  {
    id: "carousel-voz-5-citacoes-ilusao",
    carouselId: "carousel-5-citacoes-ilusao",
    nome: "5 frases do Espelho da Ilusão",
    ficheiro: "carousel-voz-5-citacoes-ilusao.mp3",
    texto:
      "Cinco frases que mudam a forma como te vês. Quando foi que escolhi tomar café em vez de chá? Via, mas não sentia. Registava, mas não participava. Como quem assiste a um espectáculo por trás de uma janela fechada. Não era que não tivesse opinião. Era que a sua primeira reacção nunca era o que verdadeiramente pensava. Perguntar, mesmo tarde, é o primeiro gesto de se escolher. O Espelho da Ilusão — seteveus.space.",
  },
  {
    id: "carousel-voz-ecos-efemeros",
    carouselId: "carousel-ecos-efemeros",
    nome: "A única comunidade onde tudo desaparece",
    ficheiro: "carousel-voz-ecos-efemeros.mp3",
    texto:
      "O que escreveres aqui desaparece em trinta dias. Não há histórico. Não há perfil. Ninguém sabe quem és. E isso muda o que dizes. Há coisas que só se consegue dizer quando não ficam para sempre. Não há likes. Há reconhecimentos. Um toque silencioso que diz: eu também. E há sussurros. Mensagens de uma só via. Cem caracteres. Expiram em sete dias. É o único sítio onde a honestidade não tem consequências permanentes. Comunidade Ecos — incluída em qualquer acesso. seteveus.space.",
  },
  {
    id: "carousel-voz-antes-depois-ver",
    carouselId: "carousel-antes-depois-ver",
    nome: "Não muda o que fizeste — muda a forma como te vês",
    ficheiro: "carousel-voz-antes-depois-ver.mp3",
    texto:
      "Não muda o que fizeste. Muda a forma como te vês a fazê-lo. Antes: sabia exactamente quem era. Depois: sei cada vez menos. Mas o que sei é meu. Não herdado. Antes: chorava só quando ninguém via. Depois: deixei as lágrimas virem à mesa. Alguém perguntou. Disse que não estava bem. O mundo não acabou. Antes: dizia estou bem antes de verificar o que sentia. Depois: faço uma pausa. Ainda pequena. Mas minha. Não é uma transformação. É um desfazer lento e suave do que não era teu. O Espelho da Ilusão — ao teu ritmo. seteveus.space.",
  },
  {
    id: "carousel-voz-7-espelhos-resumo",
    carouselId: "carousel-7-espelhos-resumo",
    nome: "Os 7 Espelhos — um por um",
    ficheiro: "carousel-voz-7-espelhos-resumo.mp3",
    texto:
      "Sete espelhos. Sete véus. Sete histórias que te devolvem ao que já sabes. O Espelho da Ilusão — a vida que nunca escolheste. O Espelho do Medo — a voz que diz não antes de pensares. O Espelho da Culpa — o amor que se esqueceu de te incluir. O Espelho da Identidade — a máscara que aprendeste a usar. O Espelho do Controlo — o amor que, sem querer, apertou. O Espelho do Desejo — o que guardas sem nome. O Espelho da Separação — o que deixar ir para crescer. Não são diagnósticos. São companhia. Começa pelo que ressoa. Ao teu ritmo. seteveus.space.",
  },
];

// ── Educativos (narração dos carrosséis de nicho, Eleven v3 com pausas) ──────
// Eleven v3: pausas via [pause], [short pause], [long pause]
// Não usam SSML — v3 não suporta <break>

export type EduVoz = {
  id: string;
  /** ID do nicheCarousel correspondente */
  carouselId: string;
  nome: string;
  ficheiro: string;
  texto: string;
};

export const EDUCATIVOS_VOZ: EduVoz[] = [
  {
    id: "edu-voz-1",
    carouselId: "edu-1",
    nome: "A conversa que se repete",
    ficheiro: "edu-voz-conversa-repete.mp3",
    texto:
      "Sabes aquela conversa que já tiveste quarenta e sete vezes? [pause] Não é falta de inteligência. [short pause] É porque o padrão é mais rápido que a consciência. [pause] O corpo entra na conversa antes de ti. Já preparou a defesa... já escolheu as palavras... já decidiu o que sentir — antes de pensares. [pause] Não precisas de parar o padrão. [short pause] Precisas de o reconhecer — enquanto acontece. [long pause] Qual é a conversa que se repete na tua vida?",
  },
  {
    id: "edu-voz-2",
    carouselId: "edu-2",
    nome: "Escolhas que não são escolhas",
    ficheiro: "edu-voz-escolhas.mp3",
    texto:
      "Há escolhas que não são escolhas. [pause] São repetições disfarçadas de decisão. [short pause] Escolhes o mesmo tipo de pessoa. O mesmo tipo de conflito. O mesmo momento para te calares. [pause] E parece sempre diferente — porque o cenário muda. [short pause] Mas o mecanismo... é o mesmo. [pause] A diferença entre repetir e escolher é uma só: [long pause] consciência.",
  },
  {
    id: "edu-voz-3",
    carouselId: "edu-3",
    nome: "O que aprendeste cedo demais",
    ficheiro: "edu-voz-cedo-demais.mp3",
    texto:
      "Não te tornaste assim de repente. [pause] Houve um dia — provavelmente antes dos dez anos — em que aprendeste que era mais seguro ser simpática do que ser honesta. [short pause] Ou que chorar era fraqueza. [short pause] Ou que pedir... era pedir demais. [pause] Não foi trauma. Foi adaptação. [short pause] E a adaptação funcionou tão bem... que esqueceste que havia outra versão de ti antes dela. [long pause] O que aprendeste cedo demais?",
  },
  {
    id: "edu-voz-4",
    carouselId: "edu-4",
    nome: "O corpo sabe antes de ti",
    ficheiro: "edu-voz-corpo-sabe.mp3",
    texto:
      "O teu corpo sabe coisas que tu ainda não admitiste. [pause] A dor de estômago antes da reunião. [short pause] O aperto no peito quando o telefone toca. [short pause] O cansaço que não se explica por horas de sono. [pause] O corpo não mente. [short pause] Não sabe. [pause] Quando alguém te pergunta como estás — e tu dizes bem — o corpo regista a distância entre o que dizes... e o que sentes. [long pause] Onde é que o teu corpo fala mais alto?",
  },
  {
    id: "edu-voz-5",
    carouselId: "edu-5",
    nome: "Endireitar a postura",
    ficheiro: "edu-voz-postura.mp3",
    texto:
      "Já reparaste que endireitas a postura quando alguém entra na sala? [pause] Não é vaidade. [short pause] É vigilância. [pause] O corpo adapta-se ao que aprendeu: ser vista é ser avaliada. Então prepara-se. Contrai. Performa. [pause] Relaxar na presença de outra pessoa — é um dos gestos mais corajosos que existem. [short pause] Porque implica confiança. [short pause] E confiança implica risco. [long pause] Com quem é que o teu corpo relaxa?",
  },
  {
    id: "edu-voz-6",
    carouselId: "edu-6",
    nome: "O espelho mais gentil",
    ficheiro: "edu-voz-espelho-gentil.mp3",
    texto:
      "Há coisas que só conseguimos ver — quando não são sobre nós. [pause] É por isso que as histórias funcionam onde os conselhos falham. [short pause] Ninguém gosta que lhe digam o que está errado. [pause] Mas quando lês uma personagem que faz exactamente o que tu fazes — e vês as consequências — [short pause] algo muda. [pause] Não é informação. [short pause] É reconhecimento. [long pause] A ficção é o espelho mais gentil que existe.",
  },
  {
    id: "edu-voz-7",
    carouselId: "edu-7",
    nome: "Autoajuda vs. história",
    ficheiro: "edu-voz-autoajuda.mp3",
    texto:
      "Um livro de autoajuda diz-te o que fazer. [pause] Uma história mostra-te quem és. [pause] A diferença é enorme. [short pause] O conselho entra pela mente. A história entra pelo corpo — pelo reconhecimento... pelo arrepio... pelo isto sou eu. [pause] Não precisas de mais informação sobre ti. [short pause] Precisas de te ver. [long pause] E às vezes a forma mais segura de te veres — é através de alguém que não existe.",
  },
  {
    id: "edu-voz-8",
    carouselId: "edu-8",
    nome: "O silêncio entre duas pessoas",
    ficheiro: "edu-voz-silencio.mp3",
    texto:
      "O silêncio entre duas pessoas nunca é vazio. [pause] Está cheio de tudo o que não foi dito. [short pause] Das vezes que quase disseste. [short pause] Das vezes que ele quase perguntou. [pause] Os silêncios acumulam-se como neve. Parecem leves. [short pause] Mas quando derretes tudo de uma vez — [short pause] inunda. [pause] A maioria das relações não acaba por conflito. [long pause] Acaba por acumulação de silêncios.",
  },
  {
    id: "edu-voz-9",
    carouselId: "edu-9",
    nome: "Cuidar ou controlar",
    ficheiro: "edu-voz-cuidar.mp3",
    texto:
      "Cuidar pode ser uma forma de controlar. [pause] Parece generosidade. Parece amor. [short pause] Mas às vezes é isto: se eu tratar de tudo... ninguém me pode abandonar. [pause] A pessoa que cuida demais — raramente pede. [short pause] Porque pedir é arriscar ouvir não. [short pause] E esse não confirma o medo original: [pause] não sou suficiente. [long pause] Cuidas para dar — ou para não perder?",
  },
  {
    id: "edu-voz-10",
    carouselId: "edu-10",
    nome: "O conselho mais inútil",
    ficheiro: "edu-voz-conselho-inutil.mp3",
    texto:
      "Ama-te a ti mesma — é o conselho mais inútil que existe. [pause] Não porque seja falso. [short pause] Porque é vago. [pause] Ninguém te diz como. Ninguém te diz que amar-se inclui olhar para partes de ti que não queres ver. [short pause] Que inclui dizer não a pessoas que amas. [short pause] Que inclui falhar — e não te punires. [pause] Autoconhecimento não é wellness. [short pause] É trabalho. Bonito, necessário — mas trabalho. [long pause] O que é que amar-te significaria... se fosses honesta?",
  },
  {
    id: "edu-voz-11",
    carouselId: "edu-11",
    nome: "Rituais matinais",
    ficheiro: "edu-voz-rituais.mp3",
    texto:
      "Não precisas de mais rituais matinais. [pause] Precisas de uma conversa honesta contigo — às três da manhã. [short pause] Sem velas. Sem journal bonito. Sem playlist de meditação. [pause] Só tu — e a pergunta que tens evitado. [pause] O autoconhecimento não acontece na hora que reservas para ele. [short pause] Acontece quando te apanhas no acto de ser quem não queres ser. [long pause] Qual é a pergunta que continuas a adiar?",
  },
  {
    id: "edu-voz-12",
    carouselId: "edu-12",
    nome: "Medo de ser vista a mudar",
    ficheiro: "edu-voz-medo-mudar.mp3",
    texto:
      "A maioria das pessoas não tem medo de mudar. [pause] Tem medo de ser vista a mudar. [pause] Porque mudar implica admitir que antes estavas errada. [short pause] Ou perdida. [short pause] Ou a fingir. [pause] E as pessoas à tua volta já se habituaram à versão antiga. [short pause] Algumas até preferem essa versão — porque a nova incomoda. [pause] Mudar em silêncio é mais fácil. [short pause] Mas em silêncio ninguém te acompanha. [long pause] O que mudarias — se ninguém estivesse a ver?",
  },
];
