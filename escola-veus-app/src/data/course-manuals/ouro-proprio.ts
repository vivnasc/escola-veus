/**
 * Manual do Curso — Ouro Proprio
 *
 * Conteudo do manual PDF (~40 paginas).
 * Complementa os videos — nao repete.
 * Tom: intimo, reflexivo, sem pressa.
 *
 * Estrutura por capitulo:
 * - Resumo do modulo (complementar aos videos)
 * - 3-5 perguntas de reflexao
 * - Espaco "As tuas palavras" (no PDF, linhas em branco)
 */

export type ManualChapter = {
  moduleNumber: number;
  title: string;
  territoryStage: string; // descricao visual do territorio neste estagio
  summary: string; // resumo do modulo (complementa, nao repete os videos)
  reflectionQuestions: string[];
};

export type ManualContent = {
  courseSlug: string;
  courseTitle: string;
  courseSubtitle: string;
  territory: string;
  introTitle: string;
  introText: string;
  beforeYouStart: string;
  chapters: ManualChapter[];
  closingTitle: string;
  closingText: string;
  closingInvite: string;
};

export const OURO_PROPRIO_MANUAL: ManualContent = {
  courseSlug: "ouro-proprio",
  courseTitle: "Ouro Proprio",
  courseSubtitle: "A relacao com dinheiro como espelho de ti",
  territory: "A Casa dos Espelhos Dourados",

  introTitle: "Antes de comecares",
  introText:
    "Este manual e teu. Nao e um livro de financas. Nao e um guia de poupanca. Nao e um plano para ficares rica. E um espaco onde podes olhar para a tua relacao com dinheiro — com honestidade, sem pressa, sem julgamento. Vais encontrar aqui resumos de cada modulo, perguntas que te convidam a pensar e espaco para escreveres o que precisares. Nao ha respostas certas. Ha as tuas respostas. Usa este manual ao teu ritmo. Podes le-lo de uma vez ou capitulo a capitulo, acompanhando os videos. Podes escrever muito ou pouco. Podes voltar atras e reescrever. E teu.",
  beforeYouStart:
    "Este curso nao e terapia. Nao e coaching. Nao e aconselhamento financeiro. E um convite a olhar para algo que quase ninguem olha: o que sentes quando o dinheiro aparece. Se em algum momento sentires que precisas de apoio profissional — psicologico, psiquiatrico ou financeiro — procura-o. Este curso e um complemento, nunca um substituto. O teu ritmo e o ritmo certo. Nao ha atrasos. Nao ha prazos. Ha so tu e o que estas pronta para ver.",

  chapters: [
    {
      moduleNumber: 1,
      title: "O Extracto como Espelho",
      territoryStage:
        "Sala escura. Espelhos cobertos com panos dourados. Poeira no ar. Luz fraca de uma vela.",
      summary:
        "Tudo comeca por olhar. Nao para os numeros em si — mas para o que sentes quando os numeros aparecem. O extracto bancario nao e um documento financeiro. E um diario: cada linha conta uma historia sobre o que valorizas, o que te assusta, o que te consola e o que evitas. Neste modulo, exploraste o medo de abrir a app do banco, a historia emocional escondida em cada gasto e a forma como o teu corpo reage ao dinheiro antes de a tua mente ter tempo de pensar. O primeiro passo nao e mudar nada. E olhar sem desviar.",
      reflectionQuestions: [
        "Ha quanto tempo nao olhas para o teu extracto com calma, sem pressa, sem medo?",
        "Se o teu extracto do ultimo mes fosse um diario, que historia contaria sobre ti?",
        "Onde e que sentes o dinheiro no corpo — no estomago, no peito, nos ombros, na garganta?",
        "Qual e a diferenca entre o que o extracto mostra e o que gostarias que mostrasse?",
      ],
    },
    {
      moduleNumber: 2,
      title: "A Heranca Financeira Emocional",
      territoryStage:
        "Alguns panos comecam a escorregar dos espelhos. Reflexos distorcidos mas visiveis. Mais luz entra na sala.",
      summary:
        "A tua relacao com dinheiro nao comecou quando abriste a primeira conta bancaria. Comecou na cozinha da tua infancia, com frases que absorveste antes de saberes questionar. Dinheiro nao chega. Nao se fala de dinheiro. Quem tem dinheiro e diferente de nos. Estas frases nao eram conselhos — eram instrucoes de funcionamento. E tu seguiste-as sem saber. Neste modulo, olhaste para os scripts que herdaste, para a distancia entre o que os teus pais diziam e o que faziam, e para a possibilidade de escolher conscientemente o que manter e o que largar. A heranca nao se apaga. Escolhe-se.",
      reflectionQuestions: [
        "Quais sao as tres frases sobre dinheiro que mais ouviste em casa?",
        "Na tua familia, o que se dizia sobre dinheiro correspondia ao que se fazia?",
        "Que crenca herdada sobre dinheiro ja nao te serve — mas que continuas a seguir?",
        "Se pudesses dar uma unica frase sobre dinheiro a crianca que foste, qual seria?",
      ],
    },
    {
      moduleNumber: 3,
      title: "A Vergonha do Dinheiro",
      territoryStage:
        "Mais espelhos descobertos. Reflexos que tremem mas ja se reconhecem. Luz dourada comeca a filtrar-se.",
      summary:
        "A vergonha e o guardiao mais silencioso da tua relacao com dinheiro. Vergonha de nao ter — que te faz inventar desculpas para nao ir a jantares que nao podes pagar. Vergonha de querer mais — que te faz calar o desejo e chamar-lhe gratidao. Vergonha de nao valer — que te faz confundir o teu saldo com o teu valor. Neste modulo, olhaste para as tres faces desta vergonha e para a forma como ela te faz viver uma vida mais pequena do que mereces. A vergonha nao se combate. Ve-se. E quando se ve, perde forca.",
      reflectionQuestions: [
        "Quando foi a ultima vez que recusaste algo por vergonha financeira — e o que inventaste como desculpa?",
        "Ha algo que queres e que te da vergonha de querer? O que e?",
        "Alguma vez sentiste que te trataram diferente por causa do que tinhas ou nao tinhas?",
        "O que mudaria se separasses completamente o teu valor pessoal do teu valor financeiro?",
        "A vergonha financeira que sentes — e tua ou foi-te ensinada?",
      ],
    },
    {
      moduleNumber: 4,
      title: "Cobrar, Receber, Merecer",
      territoryStage:
        "A maioria dos espelhos esta descoberta. Os reflexos ainda tremem mas sao reconheciveis. Luz dourada mais forte.",
      summary:
        "Ha um triangulo invisivel entre cobrar, receber e merecer. Quando nao sentes que mereces, nao cobras. Quando nao cobras, nao recebes. E quando nao recebes, confirmas a crenca de que nao era para ti. Neste modulo, olhaste para o desconto automatico que das antes de alguem pedir, para a dificuldade de cobrar o que vale, e para a angustia de receber sem devolver imediatamente. Nenhuma destas dificuldades e financeira. Sao sobre permissao — a permissao de ocupar espaco com o teu valor.",
      reflectionQuestions: [
        "Quando foi a ultima vez que baixaste um preco ou recusaste dinheiro antes de alguem te pedir?",
        "O que sentes no corpo quando tens de cobrar por algo que fizeste?",
        "Quando alguem te da algo, qual e o teu primeiro impulso — receber ou compensar?",
        "Achas que cobrar o que vale e arrogancia? De onde vem essa crenca?",
      ],
    },
    {
      moduleNumber: 5,
      title: "Gastar em Ti",
      territoryStage:
        "Quase todos os espelhos limpos. Os reflexos estao mais calmos. A sala enche-se de luz ambar.",
      summary:
        "A hierarquia dos teus gastos e um retrato da tua importancia propria. E quase sempre, tu estas no fundo da lista — depois dos filhos, do parceiro, da renda, dos imprevistos, de tudo. Se sobrar, talvez. Neste modulo, olhaste para o lugar que ocupas nos teus proprios gastos, para a culpa que aparece quando gastas em prazer, e para o acto quieto de investir em ti — nao como luxo, mas como decisao de existir. Gastar em ti nao e egoismo. E a diferenca entre dar porque queres e dar porque te esqueceste que tambem estas la.",
      reflectionQuestions: [
        "Onde e que tu apareces na lista dos teus gastos mensais — no topo ou no fundo?",
        "Quando gastas em algo so para ti, quanto tempo demora ate a culpa aparecer?",
        "Qual e a ultima coisa que adiaste comprar para ti — e porque?",
        "O que mudaria se te tratasses financeiramente como tratas as pessoas que amas?",
      ],
    },
    {
      moduleNumber: 6,
      title: "Dinheiro e Relacoes",
      territoryStage:
        "Espelhos limpos reflectem duas silhuetas. Luz ambar revela sombras e brilhos entre elas.",
      summary:
        "Nas relacoes, o dinheiro nunca e so dinheiro. E poder, seguranca, controlo, liberdade. Quem paga mais sente que decide mais. Quem depende financeiramente sente que tem menos voz. E ha conversas sobre dinheiro que se adiam anos — porque o medo de falar e maior do que o peso de carregar sozinha. Neste modulo, olhaste para a dinamica de poder escondida nas contas partilhadas, para o medo que a dependencia financeira alimenta, e para a conversa que precisas de ter mas que continuas a evitar.",
      reflectionQuestions: [
        "Na tua relacao, quem ganha mais tem mais poder de decisao? Ha uma correlacao?",
        "Se a tua relacao acabasse amanha, saberias exactamente quanto precisas para viver sozinha?",
        "Qual e a conversa sobre dinheiro que tens adiado? Com quem? Ha quanto tempo?",
        "O dinheiro na tua relacao e um tema aberto ou um tabu?",
      ],
    },
    {
      moduleNumber: 7,
      title: "Ganhar Mais Nao Resolve",
      territoryStage:
        "Todos os espelhos descobertos e limpos. A sala esta iluminada. Mas um reflexo mostra algo inesperado.",
      summary:
        "Ha um buraco que o dinheiro nao enche — porque o buraco nao e financeiro. E a fome de seguranca, de valor, de controlo, de presenca. Neste modulo, olhaste para a ilusao de que mais dinheiro traz mais paz, para a sabotagem financeira que te faz regressar ao zero cada vez que constróis, e para a esteira de querer sempre mais sem nunca chegar ao suficiente. O suficiente nao e um numero. E uma decisao — a de estar presente no que ja existe.",
      reflectionQuestions: [
        "Ja tiveste mais dinheiro e mesmo assim nao sentiste paz? O que faltava?",
        "Reconheces um padrao de construir e destruir na tua vida financeira?",
        "Se tivesses o dobro do que tens agora, o que farias diferente? E porque nao podes fazer parte disso agora?",
        "O que e que o dinheiro esta a substituir na tua vida — seguranca, amor, reconhecimento?",
        "Qual e o teu numero de suficiente? E acreditas mesmo que pararias ao chegar la?",
      ],
    },
    {
      moduleNumber: 8,
      title: "Dinheiro como Liberdade",
      territoryStage:
        "Todos os espelhos descobertos. Reflexos claros e calmos. Luz ambar preenche a sala inteira.",
      summary:
        "A liberdade financeira nao e ter tanto que nunca mais precises de trabalhar. E ter clareza suficiente para que cada euro esteja alinhado com a vida que queres. Neste modulo, olhaste para a diferenca entre sobreviver e ter direccao, para o mapa do futuro que queres financiar, e para a escolha entre acumulacao e liberdade. O dinheiro nao e o destino. E o caminho. E so tem valor se souberes para onde te leva.",
      reflectionQuestions: [
        "O teu dinheiro serve para sobreviver ou para viver? Ha quanto tempo estas no modo de sobrevivencia?",
        "Se desenhasses um dia normal na vida que queres ter daqui a tres anos, como seria?",
        "Quanto custa esse dia? Ja alguma vez fizeste essa conta?",
        "O que te impede de comecar a caminhar na direccao que queres — falta de dinheiro ou falta de permissao?",
      ],
    },
  ],

  closingTitle: "Depois de terminares",
  closingText:
    "Chegaste ao fim deste manual — mas nao ao fim do caminho. O que fizeste aqui foi olhar. Olhar para o extracto, para a heranca, para a vergonha, para o merecimento, para os gastos, para as relacoes, para as ilusoes e para a liberdade. Olhar nao e resolver. Mas e o primeiro passo para qualquer mudanca real. Leva este manual contigo. Volta a ele quando precisares. As tuas respostas vao mudar com o tempo — e isso e bom. Significa que estas a mover-te.",
  closingInvite:
    "Se este curso te tocou, o proximo territorio espera por ti. Em Limite Sagrado, vais olhar para os limites que nao poes — e para o preco de nao os por. Mas so quando estiveres pronta. O teu ritmo e o ritmo certo.",
};
