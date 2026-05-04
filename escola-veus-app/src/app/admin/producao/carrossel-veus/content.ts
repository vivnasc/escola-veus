// Conteúdo do Carrossel "A Estação dos Véus" — 42 slides (7 dias × 6).
// Espelha carrossel-veus/content.json. Mantêr os dois sincronizados se editares.

export type SlideCapa = {
  tipo: "capa";
  linha1: string;
  linha2: string;
};

export type SlideConteudo = {
  tipo: "conteudo";
  estilo: "poetico" | "prosa";
  texto: string;
  titulo?: string;
};

export type SlideCta = {
  tipo: "cta";
  icone: string;
  recurso: string;
  descricao: string;
  url: string;
};

export type Slide = SlideCapa | SlideConteudo | SlideCta;

export type Dia = {
  numero: number;
  veu: string;
  subtitulo: string;
  romano: string;
  slides: Slide[];
};

export const CAMPANHA = "A Estação dos Véus";

export const DIAS: Dia[] = [
  {
    numero: 1,
    veu: "PERMANÊNCIA",
    subtitulo: "Encobre a impermanência da vida.",
    romano: "I / VII",
    slides: [
      { tipo: "capa", linha1: "Maputo está a esfriar.", linha2: "Algo em ti também." },
      { tipo: "conteudo", estilo: "poetico", texto: "A estação fria é curta aqui.\nPor isso te ensina depressa:\nnada fica como está." },
      { tipo: "conteudo", estilo: "prosa", texto: "O Véu da Permanência é o que te faz acreditar que tu és sempre a mesma. Que esta fase é definitiva. Que o que sentes hoje vai durar." },
      { tipo: "conteudo", estilo: "poetico", texto: "Não vai.\n\nE essa é a boa notícia." },
      { tipo: "conteudo", estilo: "prosa", titulo: "Hábito da estação", texto: "Escreve uma frase por dia sobre o que está a mudar em ti — mesmo que pareça mínimo." },
      { tipo: "cta", icone: "📖", recurso: "Os 7 Véus do Despertar", descricao: "Começa pelo primeiro véu. Edição impressa + digital.", url: "seteveus.space/livro-fisico" },
    ],
  },
  {
    numero: 2,
    veu: "MEMÓRIA",
    subtitulo: "Encobre a liberdade do presente.",
    romano: "II / VII",
    slides: [
      { tipo: "capa", linha1: "Tens uma história.", linha2: "Não és a tua história." },
      { tipo: "conteudo", estilo: "prosa", texto: "O frio que vem aí convida ao recolhimento. E no recolhimento, a memória sobe. Tudo o que ficou por dizer, por chorar, por encerrar." },
      { tipo: "conteudo", estilo: "prosa", texto: "O Véu da Memória mantém-te presa ao passado a fingir que é presente. Repetes padrões, escolhes igual, magoas-te igual." },
      { tipo: "conteudo", estilo: "prosa", titulo: "Hábito da estação", texto: "Identifica uma história que continuas a contar sobre ti — e pergunta se ainda é verdade." },
      { tipo: "conteudo", estilo: "prosa", texto: "A Colecção Espelhos foi escrita pra isto. Sete ficções onde te reconheces. Espelho da Ilusão é o primeiro." },
      { tipo: "cta", icone: "📚", recurso: "Colecção Espelhos", descricao: "7 ficções de transformação. Acesso vitalício.", url: "seteveus.space/comprar/espelhos" },
    ],
  },
  {
    numero: 3,
    veu: "TURBILHÃO",
    subtitulo: "Encobre o silêncio do ser.",
    romano: "III / VII",
    slides: [
      { tipo: "capa", linha1: "A mente não pára.", linha2: "E tu confundes-te com ela." },
      { tipo: "conteudo", estilo: "prosa", texto: "Quando o frio chegar, a tendência vai ser encher: séries, scroll, conversas, comida. Tudo pra não ficar com o turbilhão." },
      { tipo: "conteudo", estilo: "poetico", texto: "Mas o silêncio não é vazio.\nÉ o sítio onde te encontras\ndebaixo do ruído." },
      { tipo: "conteudo", estilo: "prosa", titulo: "Hábito da estação", texto: "10 minutos. Sem telemóvel. Sem música. Só tu e o que aparece." },
      { tipo: "conteudo", estilo: "prosa", texto: "Quando o silêncio for muito, há som feito pra atravessá-lo — não pra preencher. Paisagens Interiores, em Music Véus." },
      { tipo: "cta", icone: "🎧", recurso: "Music Véus", descricao: "Banda sonora pra escutar dentro. Primeira faixa de cada álbum gratuita.", url: "music.seteveus.space" },
    ],
  },
  {
    numero: 4,
    veu: "ESFORÇO",
    subtitulo: "Encobre o repouso interior.",
    romano: "IV / VII",
    slides: [
      { tipo: "capa", linha1: "Achas que mereces descansar", linha2: "quando tudo estiver feito." },
      { tipo: "conteudo", estilo: "poetico", texto: "Não vai estar." },
      { tipo: "conteudo", estilo: "prosa", texto: "O Véu do Esforço faz-te entrar em modo \"produzir antes do fim do ano\" — exactamente quando o corpo vai pedir o contrário." },
      { tipo: "conteudo", estilo: "prosa", texto: "A estação fria em Maputo é breve. Usa-a pra parar, não pra acelerar. E pra cuidar do corpo com calma — sem dieta, sem culpa." },
      { tipo: "conteudo", estilo: "prosa", titulo: "Hábito da estação", texto: "VITALIS é reeducação alimentar com comida nossa: xima, matapa, caril. Plano personalizado, check-in de 30 segundos por dia." },
      { tipo: "cta", icone: "🌿", recurso: "VITALIS", descricao: "Plano alimentar moçambicano. Sem balança, sem extremos.", url: "app.seteecos.com/vitalis" },
    ],
  },
  {
    numero: 5,
    veu: "DESOLAÇÃO",
    subtitulo: "Encobre a fertilidade do vazio.",
    romano: "V / VII",
    slides: [
      { tipo: "capa", linha1: "Sentes-te vazia.", linha2: "E tens medo disso." },
      { tipo: "conteudo", estilo: "prosa", texto: "O frio expõe o que o calor disfarça. Solidão, tédio, ausência de sentido. Aparecem." },
      { tipo: "conteudo", estilo: "poetico", texto: "Mas o vazio que sentes\nnão é abandono.\nÉ terra preparada." },
      { tipo: "conteudo", estilo: "prosa", titulo: "Hábito da estação", texto: "Em vez de fugir do vazio: senta-te com ele. Cinco minutos. Sem resolver, sem explicar, sem encher." },
      { tipo: "conteudo", estilo: "prosa", texto: "Há um diagnóstico gratuito que te mostra onde estás agora — corpo, mente, emoção. Sete perguntas, dois minutos. Chama-se LUMINA." },
      { tipo: "cta", icone: "✨", recurso: "LUMINA — Diagnóstico Energético", descricao: "Gratuito. 2 minutos. Mostra o que estava invisível.", url: "app.seteecos.com/lumina" },
    ],
  },
  {
    numero: 6,
    veu: "HORIZONTE",
    subtitulo: "Encobre a infinitude da consciência.",
    romano: "VI / VII",
    slides: [
      { tipo: "capa", linha1: "Achas que vais chegar.", linha2: "Não vais." },
      { tipo: "conteudo", estilo: "prosa", texto: "O Véu do Horizonte é a ilusão do destino: quando eu emagrecer, quando o livro sair, quando os filhos crescerem, quando tiver tempo, então sim, vou viver." },
      { tipo: "conteudo", estilo: "poetico", texto: "Não é assim que funciona.\nA vida não está depois.\nEstá agora." },
      { tipo: "conteudo", estilo: "prosa", titulo: "Hábito da estação", texto: "Faz uma coisa que estavas a adiar pra \"quando estivesse pronta\". Pequena. Imperfeita. Agora." },
      { tipo: "conteudo", estilo: "prosa", texto: "Estão a chegar 10 cursos de transformação interior — Ouro Próprio, Limite Sagrado, A Arte da Inteireza, e mais. Manifesta interesse pra seres das primeiras a entrar." },
      { tipo: "cta", icone: "🕯️", recurso: "Escola dos Véus — em breve", descricao: "Manifesta interesse e recebe acesso prioritário.", url: "seteveus.space/cursos" },
    ],
  },
  {
    numero: 7,
    veu: "DUALIDADE",
    subtitulo: "Encobre a unidade do real.",
    romano: "VII / VII",
    slides: [
      { tipo: "capa", linha1: "Pensas: eu", linha2: "e o resto." },
      { tipo: "conteudo", estilo: "prosa", texto: "O último véu é o que te faz acreditar que estás separada. Da tua família. Do teu corpo. De ti mesma. Da vida." },
      { tipo: "conteudo", estilo: "poetico", texto: "Não estás.\nNunca estiveste." },
      { tipo: "conteudo", estilo: "prosa", texto: "O frio que vem aí é o mesmo que vai arrefecer esta cidade inteira. O cansaço que sentes é partilhado. O desejo de recomeçar também." },
      { tipo: "conteudo", estilo: "prosa", texto: "Os Ecos são onde isto se torna visível: comunidade anónima, partilha sem máscara, reconhecimento mútuo. Incluído em qualquer experiência." },
      { tipo: "cta", icone: "🌀", recurso: "Começa onde sentires", descricao: "Livro · Espelhos · Music Véus · Vitalis · Lumina · Ecos", url: "seteveus.space + app.seteecos.com" },
    ],
  },
];
