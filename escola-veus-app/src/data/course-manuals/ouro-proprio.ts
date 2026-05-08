/**
 * Manual do Curso — Ouro Próprio
 *
 * Conteúdo do manual PDF.
 *
 * Estrutura:
 *   1. Capa, intro, mapa do curso
 *   2. Capítulos (livro-companheiro): texto expansivo que complementa os
 *      vídeos com referências, exemplos e desenvolvimentos que não cabem em
 *      vídeo. Cada capítulo é uma leitura de 4-8 páginas. SEM perguntas.
 *   3. Anexo: Caderno de Exercícios — todas as perguntas de reflexão dos
 *      8 módulos, com espaço para escrever. Destacável.
 *
 * Tom: íntimo, reflexivo, sem pressa. Voz da Vivianne.
 *
 * Estado actual: capítulo 1 escrito com profundidade-alvo. Capítulos 2-8 têm
 * 2-3 parágrafos de seed — esperam expansão da autora.
 */

export type ManualChapter = {
  moduleNumber: number;
  title: string;
  territoryStage: string;
  /** Resumo curto (1 parágrafo) — abre o capítulo a seguir ao territoryStage. */
  summary: string;
  /** Texto expansivo do livro-companheiro. Cada string = 1 parágrafo. */
  bookText: string[];
  /** Perguntas que vão para o caderno-anexo (não aparecem no corpo do livro). */
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
  courseTitle: "Ouro Próprio",
  courseSubtitle: "A relação com dinheiro como espelho de ti",
  territory: "A Casa dos Espelhos Dourados",

  introTitle: "Antes de começares",
  introText:
    "Este manual é teu. Não é um livro de finanças. Não é um guia de poupança. Não é um plano para ficares rica. É um espaço onde podes olhar para a tua relação com dinheiro, com honestidade, sem pressa, sem julgamento. Vais encontrar aqui o livro do curso — texto que complementa os vídeos com aquilo que não cabe em vídeo: referências, exemplos, contextos, desenvolvimentos. E no fim, um caderno destacável com todas as perguntas de reflexão e espaço para escreveres. Não há respostas certas. Há as tuas respostas. Usa este manual ao teu ritmo. Podes lê-lo de uma vez ou capítulo a capítulo, acompanhando os vídeos. Podes escrever muito ou pouco. Podes voltar atrás e reescrever. É teu.",
  beforeYouStart:
    "Este curso não é terapia. Não é coaching. Não é aconselhamento financeiro. É um convite a olhar para algo que quase ninguém olha: o que sentes quando o dinheiro aparece. Se em algum momento sentires que precisas de apoio profissional — psicológico, psiquiátrico ou financeiro — procura-o. Este curso é um complemento, nunca um substituto. O teu ritmo é o ritmo certo. Não há atrasos. Não há prazos. Há só tu e o que estás pronta para ver.",

  chapters: [
    {
      moduleNumber: 1,
      title: "O Extracto como Espelho",
      territoryStage:
        "Sala escura. Espelhos cobertos com panos dourados. Poeira no ar. Luz fraca de uma vela.",
      summary:
        "Tudo começa por olhar. Não para os números em si, mas para o que sentes quando os números aparecem. O extracto bancário não é um documento financeiro — é um diário emocional. Cada linha conta uma história sobre o que valorizas, o que te assusta, o que te consola, o que evitas. O primeiro passo não é mudar nada. É olhar sem desviar.",
      bookText: [
        "Há um gesto pequeno que muita gente faz e quase ninguém repara. Abrir a app do banco, ver o saldo, fechar a app. Cinco segundos. Sem respirar. Sem ler nada além do número grande lá em cima. Esse gesto não é financeiro. É emocional. É a forma que o corpo encontrou de não ter de sentir o que sente quando vê números.",
        "O extracto bancário, se o leres com calma, é uma das coisas mais íntimas que tens. Mais íntimo do que o teu calendário, do que as tuas mensagens, do que o teu histórico de pesquisas. Porque o calendário mostra o que decidiste fazer, as mensagens mostram com quem falas, mas o extracto mostra para onde foi a tua atenção quando a atenção tinha um custo. Cada linha é uma escolha. Cada euro foi uma vez uma decisão — consciente ou não, alinhada ou não, tua ou herdada.",
        "Quando reparas que o extracto é um diário, muda a forma como o lês. Já não procuras erros, fraudes, descontos esquecidos. Começas a ver padrões. O Domingo à tarde em que fizeste cinco compras online seguidas. A semana inteira em que só houve cafés. O mês em que apareceram três jantares fora num cartão e zero entradas no espaço onde escreves. O dinheiro deixa pegadas que a memória não deixa. E essas pegadas contam coisas que tu não te lembras de ter sentido.",
        "O corpo sabe disto antes da mente. Repara: como é que ficas mesmo antes de abrir a app? Há quem segure o telemóvel mais firme. Há quem prenda a respiração. Há quem desbloqueie o ecrã e desbloqueie outra coisa qualquer porque \"agora não é boa altura\". O dinheiro não vive na cabeça. Vive nas mãos, no peito, na garganta. E o que aparece no extracto não é o que decidiste com a cabeça — é o que o corpo escolheu quando a cabeça não estava a olhar.",
        "Este capítulo, e este módulo, não pedem que mudes nada. Não pedem que faças orçamento, que cortes despesas, que comeces uma planilha. Pedem só que olhes. Devagar. Como quem abre uma carta antiga sabendo que pode doer. Não é para resolver. É para reconhecer. Porque tudo o que vem a seguir — a herança, a vergonha, o merecimento, a liberdade — assenta nesta primeira capacidade simples e impossível: olhar para os teus próprios números sem desviar a cara.",
        "Se durante esta semana só conseguires fazer uma coisa, faz isto: abre o extracto do mês passado, sem pressa, com uma chávena de chá ou um copo de água, num momento em que ninguém te chame. Lê linha a linha. Não para julgar. Para conhecer. Repara onde respiras melhor e onde apertas. Repara o que evitas ler. Repara a história que ninguém te contou e que aparece ali, escrita por ti, sem te dares conta.",
      ],
      reflectionQuestions: [
        "Há quanto tempo não olhas para o teu extracto com calma, sem pressa, sem medo?",
        "Se o teu extracto do último mês fosse um diário, que história contaria sobre ti?",
        "Onde é que sentes o dinheiro no corpo — no estômago, no peito, nos ombros, na garganta?",
        "Qual é a diferença entre o que o extracto mostra e o que gostarias que mostrasse?",
      ],
    },
    {
      moduleNumber: 2,
      title: "A Herança Financeira Emocional",
      territoryStage:
        "Alguns panos começam a escorregar dos espelhos. Reflexos distorcidos mas visíveis. Mais luz entra na sala.",
      summary:
        "A tua relação com dinheiro não começou quando abriste a primeira conta bancária. Começou na cozinha da tua infância, com frases que absorveste antes de saberes questionar. \"Dinheiro não chega.\" \"Não se fala de dinheiro.\" \"Quem tem dinheiro é diferente de nós.\" Não eram conselhos — eram instruções de funcionamento. A herança não se apaga. Escolhe-se.",
      bookText: [
        "Há uma idade, algures entre os quatro e os sete anos, em que a criança aprende como o dinheiro se sente, antes de aprender o que o dinheiro é. Aprende pela cara da mãe quando chega a factura. Pelo silêncio do pai quando alguém pergunta quanto custou. Pela forma como se baixa a voz no supermercado quando alguém vê o preço. Ninguém ensina explicitamente. Mas tudo se ensina.",
        "Os scripts financeiros que carregamos para a vida adulta vêm em três formatos principais: as frases ditas, as frases silenciadas, e o que se fazia que não combinava com o que se dizia. As frases ditas são as mais visíveis — \"o dinheiro não dá em árvores\", \"trabalha para ganhar\", \"tem cuidado\". As silenciadas são mais difíceis de detectar — mas estavam lá, na forma como ninguém perguntava o salário de ninguém, na forma como certas conversas terminavam de repente. E o desencontro entre dito e feito é o que mais marca: o pai que pregava poupança e gastava em segredo, a mãe que dizia que dinheiro não importa e que contava cada euro com aflição.",
        "Olhar para a herança não é fazer o juízo dos teus pais. É reconhecer que o que recebeste não é a tua identidade. É um conjunto de instruções, das quais umas servem e outras não. A tarefa deste módulo é separar — quais destas frases ainda concordo viver, quais é que me fazem mal e continuo a obedecer por hábito, quais é que nunca disse em voz alta mas sigo todos os dias. A herança não se apaga. Mas escolhe-se o que se mantém em casa.",
      ],
      reflectionQuestions: [
        "Quais são as três frases sobre dinheiro que mais ouviste em casa?",
        "Na tua família, o que se dizia sobre dinheiro correspondia ao que se fazia?",
        "Que crença herdada sobre dinheiro já não te serve, mas que continuas a seguir?",
        "Se pudesses dar uma única frase sobre dinheiro à criança que foste, qual seria?",
      ],
    },
    {
      moduleNumber: 3,
      title: "A Vergonha do Dinheiro",
      territoryStage:
        "Mais espelhos descobertos. Reflexos que tremem mas já se reconhecem. Luz dourada começa a filtrar-se.",
      summary:
        "A vergonha é o guardião mais silencioso da tua relação com dinheiro. Vergonha de não ter, que te faz inventar desculpas. Vergonha de querer mais, que te faz calar o desejo e chamar-lhe gratidão. Vergonha de não valer, que te faz confundir o teu saldo com o teu valor. A vergonha não se combate. Vê-se. E quando se vê, perde força.",
      bookText: [
        "A vergonha do dinheiro é uma das emoções mais bem disfarçadas que existem. Disfarça-se de humildade. Disfarça-se de gratidão. Disfarça-se de \"eu não preciso de muito\". Mas por baixo do disfarce, está a mesma coisa: a sensação de que tu, especificamente tu, não tens direito ao que outros têm. A vergonha tem três faces clássicas, e provavelmente tu conheces pelo menos duas delas.",
        "A primeira é a vergonha de não ter. É a que te faz sair antes de pedirem para dividir a conta, é a que te faz dizer que não tens fome, é a que te faz dizer que estás cansada quando o que estás é sem dinheiro. Esta vergonha rouba-te presença. Faz-te viver a vida em modo defensivo, sempre a calcular antecipadamente como evitar a humilhação possível.",
        "A segunda é a vergonha de querer mais. É mais subtil e mais cruel, porque nem sempre se reconhece. Disfarça-se de \"eu já tenho tanto\", de \"há quem tenha menos\", de \"não sou materialista\". E mata o desejo no próprio nascimento. Antes de te permitires querer uma coisa, já a desqualificaste. A terceira é a vergonha de não valer — a confusão entre o que ganhas e o que vales. Se ganhas pouco, sentes que vales pouco. Se ganhas mais, sentes-te impostora. A conta nunca bate certo, porque o erro está em achar que há uma conta para fazer.",
      ],
      reflectionQuestions: [
        "Quando foi a última vez que recusaste algo por vergonha financeira, e o que inventaste como desculpa?",
        "Há algo que queres e que te dá vergonha de querer? O que é?",
        "Alguma vez sentiste que te trataram diferente por causa do que tinhas ou não tinhas?",
        "O que mudaria se separasses completamente o teu valor pessoal do teu valor financeiro?",
        "A vergonha financeira que sentes, é tua ou foi-te ensinada?",
      ],
    },
    {
      moduleNumber: 4,
      title: "Cobrar, Receber, Merecer",
      territoryStage:
        "A maioria dos espelhos está descoberta. Os reflexos ainda tremem mas são reconhecíveis. Luz dourada mais forte.",
      summary:
        "Há um triângulo invisível entre cobrar, receber e merecer. Quando não sentes que mereces, não cobras. Quando não cobras, não recebes. E quando não recebes, confirmas a crença de que não era para ti. Nenhuma destas dificuldades é financeira — são todas sobre permissão.",
      bookText: [
        "Cobrar é um acto físico. Há quem o sinta no peito, há quem o sinta na garganta, há quem o sinta no estômago como uma náusea breve. O preço sai mais baixo do que pensaste, ou aparece com um sorriso pedinte, ou vem acompanhado de \"se quiseres pagar menos não há problema\". Antes de a outra pessoa abrir a boca, já lhe deste o desconto. E chamas a isso ser flexível — quando o mais honesto seria dizer que tens medo de ocupar o espaço financeiro do teu próprio valor.",
        "Receber é o outro lado. Quando alguém te dá algo — um presente, um elogio, uma transferência por trabalho que fizeste — qual é o teu primeiro impulso? Reparar? Devolver? Compensar? \"Ah, tu não devias\". \"Não era preciso\". \"Eu também tenho uma coisa para ti\". O reflexo de equilibrar é tão automático que muitas mulheres nem sabem o que seria simplesmente receber e ficar com aquilo.",
        "Merecer é o terreno onde os outros dois assentam. E merecer é uma palavra sobre a qual quase ninguém pensa com precisão. Não é uma medida do que produziste. É uma posição que decides ocupar, antes de a vida te dar provas. Enquanto não sentires que mereces, qualquer dinheiro que entre vai parecer um acidente — algo que escapou ao filtro, e que mais cedo ou mais tarde será corrigido. A liberdade não vem de ganhar mais. Vem de mudares a posição interior antes do extracto mudar.",
      ],
      reflectionQuestions: [
        "Quando foi a última vez que baixaste um preço ou recusaste dinheiro antes de alguém te pedir?",
        "O que sentes no corpo quando tens de cobrar por algo que fizeste?",
        "Quando alguém te dá algo, qual é o teu primeiro impulso — receber ou compensar?",
        "Achas que cobrar o que vale é arrogância? De onde vem essa crença?",
      ],
    },
    {
      moduleNumber: 5,
      title: "Gastar em Ti",
      territoryStage:
        "Quase todos os espelhos limpos. Os reflexos estão mais calmos. A sala enche-se de luz âmbar.",
      summary:
        "A hierarquia dos teus gastos é um retrato da tua importância própria. E quase sempre, tu estás no fundo da lista — depois dos filhos, do parceiro, da renda, dos imprevistos. Se sobrar, talvez. Gastar em ti não é egoísmo. É a diferença entre dar porque queres e dar porque te esqueceste que também estás lá.",
      bookText: [
        "Faz uma experiência simples. Pega no extracto do último mês e divide-o em quatro montes: o que pagaste à casa (renda, contas, mercearia), o que gastaste com outras pessoas (filhos, presentes, jantares), o que foi para imprevistos ou dívidas, e o que gastaste só em ti — só em ti, prazer puro, sem justificação utilitária. Conta os euros de cada monte. Olha para o quarto monte. Para muitas mulheres, este monte é zero ou quase zero. E não é por falta de dinheiro. É por falta de permissão.",
        "Há uma diferença entre necessitar e desejar, e a vida de muitas mulheres está organizada em torno do primeiro como se o segundo fosse desnecessário ou suspeito. \"Não preciso\". \"Não é prioridade\". \"Mais à frente, quando estiver tudo em ordem.\" O problema é que essa altura nunca chega — porque a ordem que esperas é a ausência de outras pessoas que precisam de ti, e essas pessoas vão sempre existir.",
        "Gastar em ti, com intenção e sem culpa, é uma prática espiritual disfarçada de transacção bancária. É a forma material de te dizeres a ti mesma que existes — não como suporte da vida dos outros, mas como pessoa com vida própria. Não é luxo. É declaração. Cada euro que gastas em ti, escolhido com presença e não com pressa, é uma frase escrita no extracto: eu fico aqui também.",
      ],
      reflectionQuestions: [
        "Onde é que tu apareces na lista dos teus gastos mensais — no topo ou no fundo?",
        "Quando gastas em algo só para ti, quanto tempo demora até a culpa aparecer?",
        "Qual é a última coisa que adiaste comprar para ti, e porquê?",
        "O que mudaria se te tratasses financeiramente como tratas as pessoas que amas?",
      ],
    },
    {
      moduleNumber: 6,
      title: "Dinheiro e Relações",
      territoryStage:
        "Espelhos limpos reflectem duas silhuetas. Luz âmbar revela sombras e brilhos entre elas.",
      summary:
        "Nas relações, o dinheiro nunca é só dinheiro. É poder, segurança, controlo, liberdade. Quem paga mais sente que decide mais. Quem depende financeiramente sente que tem menos voz. E há conversas sobre dinheiro que se adiam anos, porque o medo de falar é maior do que o peso de carregar sozinha.",
      bookText: [
        "Há uma régua escondida em quase todas as relações longas, e essa régua mede quem decide. A régua não está nos contratos, não está em conversas explícitas — está nas pequenas decisões do dia: quem escolhe o restaurante, quem aprova as férias, quem pode comprar uma coisa cara sem pedir. Quase sempre, quem traz mais dinheiro tem mais peso nesta régua. E quase sempre, ninguém chama a isso poder.",
        "Quando uma mulher depende financeiramente, há um silenciamento subtil que se instala. Ideias que não se dizem. Vontades que se adiam. Pequenas humilhações que se engolem. Não porque a outra pessoa as imponha — muitas vezes não impõe — mas porque o corpo sabe que a margem de manobra é fina, e a voz adapta-se à margem. A independência financeira não garante uma boa relação. Mas a sua ausência tem custos invisíveis que se pagam todos os dias.",
        "A conversa sobre dinheiro com o parceiro é uma das mais adiadas em casais portugueses. Há quem viva décadas sem saber exactamente o que o outro ganha. Há quem nunca tenha falado sobre o que faria se o outro morresse. O medo de falar parece protector — \"se calhar é melhor não levantar a questão\" — mas é só uma forma de adiar o trabalho que mais cedo ou mais tarde a vida obriga a fazer. Falar de dinheiro com clareza, sem acusação, é um dos maiores actos de cuidado que duas pessoas podem ter.",
      ],
      reflectionQuestions: [
        "Na tua relação, quem ganha mais tem mais poder de decisão? Há uma correlação?",
        "Se a tua relação acabasse amanhã, saberias exactamente quanto precisas para viver sozinha?",
        "Qual é a conversa sobre dinheiro que tens adiado? Com quem? Há quanto tempo?",
        "O dinheiro na tua relação é um tema aberto ou um tabu?",
      ],
    },
    {
      moduleNumber: 7,
      title: "Ganhar Mais Não Resolve",
      territoryStage:
        "Todos os espelhos descobertos e limpos. A sala está iluminada. Mas um reflexo mostra algo inesperado.",
      summary:
        "Há um buraco que o dinheiro não enche, porque o buraco não é financeiro. É a fome de segurança, de valor, de controlo, de presença. O suficiente não é um número. É uma decisão — a de estar presente no que já existe.",
      bookText: [
        "Há uma ilusão tão poderosa que estrutura economias inteiras: a de que mais dinheiro traz mais paz. Tu provavelmente já experimentaste o oposto, mesmo que nunca o tenhas dito em voz alta. Houve uma altura em que ganhavas mais e dormias pior. Houve um aumento que veio acompanhado de mais ansiedade, não menos. Se o dinheiro fosse a resposta, as pessoas mais ricas seriam as mais calmas. Sabes que não é assim.",
        "A esteira financeira tem um nome técnico: adaptação hedónica. O cérebro humano normaliza qualquer aumento de rendimento em poucos meses. O que era luxo torna-se obrigação. O que era conforto torna-se mínimo. E o desejo, em vez de se saciar, recalibra-se mais alto. Por isso há gente com cinco vezes o teu rendimento que vive em ansiedade financeira igual à tua. Não é caricatura. É como o cérebro funciona.",
        "A pergunta certa não é \"quanto preciso para parar de me preocupar?\" — porque a resposta é sempre \"um bocadinho mais do que tens agora\". A pergunta certa é: \"o que é que eu quero que o dinheiro financie, especificamente, na minha vida?\". Quando há resposta, o número aparece. Quando não há resposta, qualquer número é insuficiente. O suficiente nasce quando a vida que queres ganha forma — não antes.",
      ],
      reflectionQuestions: [
        "Já tiveste mais dinheiro e mesmo assim não sentiste paz? O que faltava?",
        "Reconheces um padrão de construir e destruir na tua vida financeira?",
        "Se tivesses o dobro do que tens agora, o que farias diferente? E porque não podes fazer parte disso agora?",
        "O que é que o dinheiro está a substituir na tua vida — segurança, amor, reconhecimento?",
        "Qual é o teu número de suficiente? E acreditas mesmo que pararias ao chegar lá?",
      ],
    },
    {
      moduleNumber: 8,
      title: "Dinheiro como Liberdade",
      territoryStage:
        "Todos os espelhos descobertos. Reflexos claros e calmos. Luz âmbar preenche a sala inteira.",
      summary:
        "A liberdade financeira não é ter tanto que nunca mais precises de trabalhar. É ter clareza suficiente para que cada euro esteja alinhado com a vida que queres. O dinheiro não é o destino. É o caminho. E só tem valor se souberes para onde te leva.",
      bookText: [
        "A palavra liberdade, quando associada a dinheiro, foi capturada por uma indústria que a vende como independência total — reformar-te aos quarenta, viver de rendimentos, nunca mais trabalhar. Esta versão é estreita e quase sempre inalcançável. Há outra versão, mais discreta e muito mais útil: liberdade é a capacidade de escolher o que fazes e com quem o fazes, dentro das condições que tens.",
        "A liberdade começa antes do número. Começa em saberes, com precisão, quanto custa o teu mês — não em média, não em estimativa, mas em verdade. Começa em saberes o que farias com mais um zero no rendimento, e em perceberes que algumas dessas coisas talvez já consigas fazer agora, com escolhas mais alinhadas. E começa em poderes dizer não a um trabalho que te suga sem que isso te lance no abismo. É uma liberdade construída em pequenas margens, não em grandes saltos.",
        "Acabaste de atravessar oito territórios — do extracto à liberdade. Olhaste para o medo de olhar, para a herança, para a vergonha, para o merecimento, para os teus gastos, para as tuas relações, para a ilusão do mais. Não sais daqui resolvida. Sais daqui acordada. E uma mulher acordada para a sua relação com dinheiro toma decisões diferentes, mesmo sem se aperceber. O resto vem com o tempo. O ritmo é teu.",
      ],
      reflectionQuestions: [
        "O teu dinheiro serve para sobreviver ou para viver? Há quanto tempo estás no modo de sobrevivência?",
        "Se desenhasses um dia normal na vida que queres ter daqui a três anos, como seria?",
        "Quanto custa esse dia? Já alguma vez fizeste essa conta?",
        "O que te impede de começar a caminhar na direcção que queres — falta de dinheiro ou falta de permissão?",
      ],
    },
  ],

  closingTitle: "Depois de terminares",
  closingText:
    "Chegaste ao fim deste manual, mas não ao fim do caminho. O que fizeste aqui foi olhar — para o extracto, para a herança, para a vergonha, para o merecimento, para os gastos, para as relações, para as ilusões e para a liberdade. Olhar não é resolver. Mas é o primeiro passo para qualquer mudança real. Leva este manual contigo. Volta a ele quando precisares. As tuas respostas vão mudar com o tempo, e isso é bom — significa que estás a mover-te.",
  closingInvite:
    "Se este curso te tocou, o próximo território espera por ti. Em Limite Sagrado, vais olhar para os limites que não pões — e para o preço de não os pôr. Mas só quando estiveres pronta. O teu ritmo é o ritmo certo.",
};
