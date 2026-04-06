/**
 * Cadernos de Exercicios — Ouro Proprio
 *
 * 8 cadernos (1 por modulo), ~5 paginas cada.
 * Estrutura: exercicio principal + espaco + reflexao + registo + ponte.
 * Tom: convite, nunca imperativo. Corpo como referencia.
 *
 * Formato do PDF: mesma paleta do manual, mais leve, espacos reais de escrita.
 */

export type WorkbookExercise = {
  moduleNumber: number;
  title: string; // titulo do caderno (definido em courses.ts)
  moduleTitle: string;
  territoryStage: string;
  intro: string; // 2-3 frases de contexto
  mainExercise: {
    title: string;
    instructions: string[]; // max 5 passos
  };
  reflectionQuestions: string[]; // 3 perguntas de aprofundamento
  registoColumns: string[]; // colunas da tabela de registo
  bridge: string; // frase que liga ao proximo modulo
};

export const OURO_PROPRIO_WORKBOOKS: WorkbookExercise[] = [
  // ─── CADERNO 1 ─────────────────────────────────────────────────────────────
  {
    moduleNumber: 1,
    title: "Mapa financeiro emocional",
    moduleTitle: "O Extracto como Espelho",
    territoryStage:
      "Sala escura. Espelhos cobertos com panos dourados. Poeira no ar.",
    intro:
      "Este exercicio nao e sobre contas. E sobre o que sentes quando olhas para elas. Vais pegar no teu extracto bancario e le-lo de uma forma que provavelmente nunca fizeste: como um mapa emocional. Cada gasto conta uma historia. O teu trabalho e ouvir.",
    mainExercise: {
      title: "O mapa emocional do teu extracto",
      instructions: [
        "Imprime ou copia o extracto bancario do ultimo mes. Se nao puderes imprimir, abre-o no telemovel ou no computador.",
        "Pega em tres cores diferentes (canetas, lapis, marcadores). Escolhe uma cor para gastos que te deram prazer, outra para gastos por obrigacao, e outra para gastos que nao te lembras porque fizeste.",
        "Vai linha a linha. Sem pressa. Marca cada gasto com a cor correspondente. Se hesitares — essa hesitacao ja e informacao.",
        "Quando terminares, olha para o mapa. Que cor domina? Onde esta o prazer? Onde esta a obrigacao? Onde estas tu?",
        "Escolhe os tres gastos que mais te surpreenderam. Nao os maiores — os que te fizeram sentir algo ao marca-los. Escreve-os no espaco abaixo.",
      ],
    },
    reflectionQuestions: [
      "Se o prazer quase nao aparece no teu mapa, onde e que ele foi parar?",
      "Os gastos que nao te lembras — sao distracao, compensacao, ou automatismo?",
      "Se pudesses mudar a proporcao de cores no proximo mes, o que mudarias primeiro?",
    ],
    registoColumns: [
      "Gasto que me surpreendeu",
      "O que senti ao marca-lo",
      "O que ele me diz sobre mim",
    ],
    bridge:
      "Agora que viste o mapa, a proxima pergunta e: de onde vieram estas cores? No proximo modulo, vamos olhar para as frases sobre dinheiro que herdaste.",
  },

  // ─── CADERNO 2 ─────────────────────────────────────────────────────────────
  {
    moduleNumber: 2,
    title: "Arqueologia financeira familiar",
    moduleTitle: "A Heranca Financeira Emocional",
    territoryStage:
      "Alguns panos comecam a escorregar dos espelhos. Reflexos distorcidos mas visiveis.",
    intro:
      "Vais fazer uma escavacao. Nao no chao — na memoria. Vais procurar as frases, os gestos, os silencios sobre dinheiro que absorveste antes de ter idade para os questionar. Este exercicio pode trazer desconforto. E normal. Estas a desenterrar algo que esteve escondido muito tempo.",
    mainExercise: {
      title: "A escavacao das frases herdadas",
      instructions: [
        "Fecha os olhos. Respira fundo. Volta a cozinha, a sala, ao carro da tua infancia. Sente o chao, a luz, os cheiros. Deixa a memoria chegar.",
        "Escreve 5 a 7 frases sobre dinheiro que ouviste em casa. Nao precisam de ser exactas — podem ser sensacoes convertidas em palavras. Escreve-as no espaco abaixo.",
        "Ao lado de cada frase, escreve quem a dizia (ou quem a vivia sem a dizer). Mae? Pai? Avos? Ninguem — era o silencio?",
        "Agora, para cada frase, pergunta: ainda acredito nisto? Marca com S (sim, acredito) ou N (ja nao).",
        "Por fim, circula a frase que mais influencia a tua vida financeira hoje. Mesmo que ja nao acredites nela com a cabeca — o corpo ainda a segue?",
      ],
    },
    reflectionQuestions: [
      "Havia diferenca entre o que se dizia e o que se fazia com dinheiro na tua casa?",
      "Que frase gostarias de ter ouvido em vez das que ouviste?",
      "Ha alguma frase que queres manter — nao por heranca, mas por escolha?",
    ],
    registoColumns: [
      "Frase herdada",
      "Quem dizia / vivia",
      "Ainda acredito? (S/N)",
    ],
    bridge:
      "Agora sabes de onde vem. A proxima pergunta e mais dificil: o que e que a vergonha fez com esse conhecimento? No proximo modulo, vamos olhar para a vergonha.",
  },

  // ─── CADERNO 3 ─────────────────────────────────────────────────────────────
  {
    moduleNumber: 3,
    title: "Mapa da vergonha financeira",
    moduleTitle: "A Vergonha do Dinheiro",
    territoryStage:
      "Mais espelhos descobertos. Reflexos que tremem mas ja se reconhecem.",
    intro:
      "A vergonha e invisivel. Actua no escuro. Este exercicio vai traze-la a luz — nao para a combater, mas para a ver. A vergonha que se ve perde metade da forca.",
    mainExercise: {
      title: "Os tres rostos da vergonha financeira",
      instructions: [
        "Divide uma folha em tres seccoes. Escreve no topo de cada uma: NAO TER, QUERER MAIS, NAO VALER.",
        "Em cada seccao, escreve uma situacao concreta em que sentiste essa vergonha. Nao teorica — real. Com data, lugar, pessoas presentes. Quanto mais concreta, mais util.",
        "Debaixo de cada situacao, escreve: o que fizeste para esconder a vergonha? Inventaste uma desculpa? Calaste-te? Compraste algo? Afastaste-te?",
        "Agora le as tres historias seguidas. Em voz alta, se puderes. Devagar.",
        "Pergunta-te: quem me ensinou esta vergonha? Foi minha — ou foi-me dada?",
      ],
    },
    reflectionQuestions: [
      "Qual dos tres rostos da vergonha e mais presente na tua vida agora?",
      "Se a vergonha nao estivesse la, o que farias de diferente esta semana?",
      "Ha alguem na tua vida a quem podias dizer a verdade sobre o que sentes em relacao a dinheiro?",
    ],
    registoColumns: [
      "Situacao de vergonha",
      "O que fiz para esconder",
      "De onde veio esta vergonha",
    ],
    bridge:
      "Viste a vergonha. Agora vamos olhar para o que ela bloqueou: a tua capacidade de cobrar, receber e merecer.",
  },

  // ─── CADERNO 4 ─────────────────────────────────────────────────────────────
  {
    moduleNumber: 4,
    title: "Exercicio do preco justo",
    moduleTitle: "Cobrar, Receber, Merecer",
    territoryStage:
      "A maioria dos espelhos esta descoberta. Os reflexos ainda tremem mas sao reconheciveis.",
    intro:
      "Este exercicio e sobre o espaco entre o que vales e o que pedes. Vais dizer um numero em voz alta — e sentir o que aparece. Nao e um exercicio de contas. E um exercicio de permissao.",
    mainExercise: {
      title: "Dizer o teu preco em voz alta",
      instructions: [
        "Pensa no teu trabalho, no teu tempo, ou numa competencia tua. Algo que ofereces — profissional ou nao.",
        "Escreve o valor que cobras (ou cobrarias). Agora escreve o valor que achas que realmente vale — sem desconto, sem medo.",
        "Levanta-te. De pe. Diz o segundo numero em voz alta: o meu trabalho vale X. Sente o que aparece. Encolheste os ombros? Baixaste a voz? Olhaste para o chao?",
        "Repete. Mais devagar. Mais firme. Nao precisas de acreditar ainda. So de dizer.",
        "Escreve abaixo: qual e a distancia entre o que cobro e o que vale? E de onde vem essa distancia?",
      ],
    },
    reflectionQuestions: [
      "O que sentiste no corpo ao dizer o valor real em voz alta?",
      "Para quem e que estas a dar desconto — para o outro ou para ti mesma?",
      "Se alguem que amas te apresentasse o mesmo trabalho, quanto pagarias?",
    ],
    registoColumns: [
      "O que cobro / peco",
      "O que realmente vale",
      "De onde vem a distancia",
    ],
    bridge:
      "Agora que sentiste a distancia entre o preco e a permissao, a proxima pergunta e: onde e que te poes na lista? No proximo modulo, vamos olhar para os teus gastos.",
  },

  // ─── CADERNO 5 ─────────────────────────────────────────────────────────────
  {
    moduleNumber: 5,
    title: "Auditoria de gastos pessoais",
    moduleTitle: "Gastar em Ti",
    territoryStage:
      "Quase todos os espelhos limpos. Os reflexos estao mais calmos. Luz ambar.",
    intro:
      "Este exercicio e simples e revelador. Vais olhar para os teus gastos do ultimo mes e ver onde tu apareces — ou onde nao apareces. Nao e para julgares. E para veres.",
    mainExercise: {
      title: "A lista dos gastos — onde estas tu?",
      instructions: [
        "Faz uma lista dos teus gastos do ultimo mes, agrupados por pessoa: filhos, parceiro/a, casa, trabalho, outros, e tu. Nao precisas de valores exactos — estimativas servem.",
        "Ao lado de cada grupo, escreve a percentagem aproximada do total. Nao precisa de somar 100% — e uma impressao, nao uma auditoria.",
        "Agora olha para a tua fatia. O que esta la? So necessidades ou tambem desejos? So funcional ou tambem prazer?",
        "Escreve uma coisa que compraste para ti este mes que nao era necessaria — so tua, so boa. Se nao conseguires lembrar-te de nenhuma, escreve isso.",
        "Escolhe uma coisa que vais fazer por ti esta semana. Pequena. Concreta. Sem justificacao.",
      ],
    },
    reflectionQuestions: [
      "Se os teus gastos fossem um mapa de prioridades, onde e que tu apareces?",
      "Quando foi a ultima vez que gastaste dinheiro em ti sem culpa?",
      "O que dirias a uma amiga que te mostrasse esta lista e te perguntasse: e tu?",
    ],
    registoColumns: [
      "Para quem gastei",
      "Quanto (aprox.)",
      "Havia prazer ou so obrigacao?",
    ],
    bridge:
      "Agora que viste o teu lugar na lista, a proxima pergunta e mais delicada: o que acontece quando o dinheiro entra nas relacoes?",
  },

  // ─── CADERNO 6 ─────────────────────────────────────────────────────────────
  {
    moduleNumber: 6,
    title: "Guia para a conversa financeira",
    moduleTitle: "Dinheiro e Relacoes",
    territoryStage:
      "Espelhos limpos reflectem duas silhuetas. Luz ambar revela sombras e brilhos entre elas.",
    intro:
      "Ha uma conversa sobre dinheiro que precisas de ter. Talvez com o teu parceiro. Talvez com a tua mae. Talvez contigo mesma. Este exercicio e um ensaio — nao para decorar, mas para ouvir-te.",
    mainExercise: {
      title: "Ensaiar a conversa",
      instructions: [
        "Escreve o nome da pessoa com quem precisas de ter a conversa sobre dinheiro. Se for contigo mesma, escreve o teu nome.",
        "Escreve a primeira frase que gostarias de dizer. Nao a perfeita — a verdadeira. Comeca por: ha uma coisa sobre dinheiro que preciso de te dizer...",
        "Agora escreve o que tens medo que aconteca se disseres isto. Qual e o pior cenario? Escreve-o inteiro.",
        "Le o pior cenario. Respira. Agora pergunta: e mais pesado do que continuar calada?",
        "Reescreve a primeira frase — mas agora como se a outra pessoa fosse a tua melhor amiga. Com cuidado, mas sem filtro.",
      ],
    },
    reflectionQuestions: [
      "O que te custa mais: as palavras ou o silencio?",
      "Se esta conversa ja tivesse acontecido, o que teria mudado na tua vida?",
      "Precisas de ter a conversa perfeita — ou so de a comecar?",
    ],
    registoColumns: [
      "O que quero dizer",
      "O que tenho medo que aconteca",
      "O custo de continuar calada",
    ],
    bridge:
      "Agora que ensaiaste a conversa, vamos olhar para uma ilusao mais profunda: a ideia de que mais dinheiro resolve tudo.",
  },

  // ─── CADERNO 7 ─────────────────────────────────────────────────────────────
  {
    moduleNumber: 7,
    title: "Mapa da sabotagem financeira",
    moduleTitle: "Ganhar Mais Nao Resolve",
    territoryStage:
      "Todos os espelhos descobertos e limpos. A sala esta iluminada. Mas um reflexo mostra algo inesperado.",
    intro:
      "Este exercicio e para quem ja construiu e destruiu. Para quem ja juntou e gastou. Para quem sente que ha um padrao — mas nunca o viu no papel. Vais desenha-lo agora.",
    mainExercise: {
      title: "O grafico da montanha-russa",
      instructions: [
        "Desenha uma linha horizontal no meio do espaco abaixo. Essa linha e o teu zero financeiro — nem bem nem mal. Suficiente.",
        "Agora, dos ultimos 3 anos, marca os momentos em que estiveste acima da linha (tinhas mais, sentias folga) e abaixo (tinhas menos, sentias aperto). Faz uma curva — como uma montanha-russa.",
        "Em cada pico (momento bom), escreve o que aconteceu antes de caires. O que sentias? O que fizeste?",
        "Em cada vale (momento mau), escreve o que te levou la. Foi algo externo ou foi uma decisao tua?",
        "Olha para o grafico inteiro. Ha um padrao? Subir e descer? Construir e destruir? Ou e mais subtil?",
      ],
    },
    reflectionQuestions: [
      "O que sentes quando a conta comeca a crescer — conforto ou desconforto?",
      "A queda e sempre por razoes externas — ou ha momentos em que foste tu?",
      "Se o padrao se repete, o que e que o corpo esta a tentar dizer-te?",
    ],
    registoColumns: [
      "Momento de pico ou vale",
      "O que aconteceu antes",
      "O que sentia",
    ],
    bridge:
      "Agora que viste o padrao, a ultima pergunta e a mais importante: se o dinheiro nao e o destino, o que e? No ultimo modulo, vamos falar de liberdade.",
  },

  // ─── CADERNO 8 ─────────────────────────────────────────────────────────────
  {
    moduleNumber: 8,
    title: "Mapa de liberdade financeira",
    moduleTitle: "Dinheiro como Liberdade",
    territoryStage:
      "Todos os espelhos descobertos. Reflexos claros e calmos. Luz ambar preenche a sala inteira.",
    intro:
      "Este e o ultimo exercicio. Nao e sobre fechar — e sobre abrir. Vais desenhar o mapa de um dia na vida que queres. Nao a vida perfeita. A tua. E vais dar-lhe um preco. Porque quando o sonho tem um numero, deixa de ser sonho e torna-se direcao.",
    mainExercise: {
      title: "Um dia na vida que queres",
      instructions: [
        "Fecha os olhos. Imagina um dia normal daqui a tres anos. Nao o melhor dia da tua vida — um dia normal bom. Onde acordas? Com quem? O que ves pela janela? Que cheiro tem a manha?",
        "Escreve esse dia inteiro no espaco abaixo. Desde que acordas ate que adormeces. Com detalhe. O que comes ao pequeno-almoco? Como vais para o trabalho (ou nao vais)? O que fazes a tarde? Com quem jantas? O que sentes ao deitar?",
        "Agora, ao lado de cada parte do dia, escreve quanto custa. Renda do sitio onde acordas. Comida que comes. Transporte. Actividades. Nao precisa de ser exacto — precisa de ser honesto.",
        "Soma tudo. Este e o custo de um dia na tua vida. Multiplica por 30. Este e o teu numero mensal de liberdade.",
        "Olha para o numero. Compara com o que ganhas agora. A distancia e grande? Pequena? E o que sentes ao ve-la?",
      ],
    },
    reflectionQuestions: [
      "O dia que descreveste e muito diferente do que vives agora — ou a diferenca e mais subtil do que pensavas?",
      "O que te impede de comecar a construir esse dia — falta de dinheiro ou falta de permissao?",
      "Ha alguma parte desse dia que ja podes ter amanha — sem esperar pelo numero?",
    ],
    registoColumns: [
      "Parte do dia",
      "O que quero",
      "Quanto custa (aprox.)",
    ],
    bridge:
      "Este e o teu mapa. Nao e fixo — vai mudar. Mas agora existe. E ter um mapa ja e diferente de estar perdida. O teu ouro e proprio. Sempre foi.",
  },
];
