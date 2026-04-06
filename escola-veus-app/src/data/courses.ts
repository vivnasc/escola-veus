import type { CourseData, CourseSlug } from "@/types/course";

const COURSES: CourseData[] = [
  // ─── CURSO 1 — Ouro Próprio ───
  {
    slug: "ouro-proprio",
    number: 1,
    title: "Ouro Próprio",
    subtitle: "A relação com dinheiro como espelho de ti",
    arcoEmocional:
      "Começa pelo desconforto de olhar para números. Passa pela descoberta dos padrões herdados. Atravessa a vergonha, a culpa de querer mais, o medo de perder. Chega a reconstrução: separar valor pessoal de valor monetário. Termina com direcção: o que quero que o dinheiro financie na minha vida?",
    diferencial:
      "Não é um curso de finanças pessoais. Ensina a desfazer o nó emocional que impede a mulher de ganhar, guardar e gastar de forma alinhada com quem ela realmente é.",
    modules: [
      {
        number: 1,
        title: "O Extracto como Espelho",
        description: "A relação com dinheiro começa por olhar.",
        subLessons: [
          { letter: "A", title: "O medo de olhar", description: "O primeiro passo é abrir o extracto sem desviar o olhar." },
          { letter: "B", title: "Ler o extracto como um diário", description: "Cada linha conta uma história sobre o que valorizas." },
          { letter: "C", title: "O corpo e o dinheiro", description: "Onde sentes o dinheiro no corpo? Tensão, vergonha, alívio." },
        ],
        workbook: "Mapa financeiro emocional",
      },
      {
        number: 2,
        title: "A Herança Financeira Emocional",
        description: "O dinheiro que herdaste sem saber.",
        subLessons: [
          { letter: "A", title: "Os scripts de infância", description: "As frases sobre dinheiro que absorveste antes dos 10 anos." },
          { letter: "B", title: "O que viste vs. o que ouviste", description: "O que os teus pais faziam com dinheiro vs. o que diziam." },
          { letter: "C", title: "Reescrever os scripts", description: "Escolher conscientemente o que mantes e o que largas." },
        ],
        workbook: "Arqueologia financeira familiar",
      },
      {
        number: 3,
        title: "A Vergonha do Dinheiro",
        description: "A vergonha que silencia a conversa sobre dinheiro.",
        subLessons: [
          { letter: "A", title: "Vergonha de não ter", description: "A vergonha de não ter o suficiente e o que ela esconde." },
          { letter: "B", title: "Vergonha de querer mais", description: "A vergonha de ambicionar e o que ela protege." },
          { letter: "C", title: "Dinheiro e dignidade", description: "Separar o que tens do que vales." },
        ],
        workbook: "Mapa da vergonha financeira",
      },
      {
        number: 4,
        title: "Cobrar, Receber, Merecer",
        description: "O no entre o que cobras e o que acreditas merecer.",
        subLessons: [
          { letter: "A", title: "O desconto automático", description: "Porque baixas o preço antes de alguém pedir." },
          { letter: "B", title: "A ligação cobrar-merecer", description: "Cobrar o que vale é sentir que mereces receber." },
          { letter: "C", title: "Receber sem devolver imediatamente", description: "A dificuldade de receber sem compensar de volta." },
        ],
        workbook: "Exercício do preço justo",
      },
      {
        number: 5,
        title: "Gastar em Ti",
        description: "A hierarquia invisível dos teus gastos.",
        subLessons: [
          { letter: "A", title: "A hierarquia dos gastos", description: "Onde te colocas na lista de prioridades financeiras." },
          { letter: "B", title: "Culpa e prazer", description: "Gastar em ti sem a voz que diz que és egoísta." },
          { letter: "C", title: "O investimento em ti como acto político", description: "Investir em ti não é luxo — é posicionamento." },
        ],
        workbook: "Auditoria de gastos pessoais",
      },
      {
        number: 6,
        title: "Dinheiro e Relações",
        description: "O dinheiro como linguagem nas relações.",
        subLessons: [
          { letter: "A", title: "Quem paga, manda?", description: "A dinâmica de poder escondida nas contas partilhadas." },
          { letter: "B", title: "Dependência financeira e medo", description: "Quando a dependência financeira alimenta o medo de sair." },
          { letter: "C", title: "A conversa sobre dinheiro que evitas", description: "A conversa que precisas de ter com quem amas." },
        ],
        workbook: "Guia para a conversa financeira",
      },
      {
        number: 7,
        title: "Ganhar Mais Não Resolve",
        description: "O buraco que o dinheiro não enche.",
        subLessons: [
          { letter: "A", title: "O buraco que o dinheiro não enche", description: "Quando mais dinheiro não traz mais paz." },
          { letter: "B", title: "Sabotagem financeira", description: "Os padrões que te fazem perder o que ganhas." },
          { letter: "C", title: "Suficiente: quando é suficiente?", description: "Definir o teu suficiente sem comparação." },
        ],
        workbook: "Mapa da sabotagem financeira",
      },
      {
        number: 8,
        title: "Dinheiro como Liberdade",
        description: "De sobrevivência a direcção.",
        subLessons: [
          { letter: "A", title: "De sobrevivência a direcção", description: "Sair do modo sobrevivência e entrar no modo escolha." },
          { letter: "B", title: "O mapa do futuro que queres financiar", description: "Desenhar o futuro que queres e calcular o que custa." },
          { letter: "C", title: "Liberdade, não acumulação", description: "Dinheiro como ferramenta de liberdade, não de segurança compulsiva." },
        ],
        workbook: "Mapa de liberdade financeira",
      },
    ],
    youtubeHooks: [
      { title: "Porque sentes culpa quando gastas dinheiro em ti mesma?", durationMin: 6 },
      { title: "3 frases sobre dinheiro que a tua mãe te ensinou sem saber", durationMin: 7 },
      { title: "O teste do preço: diz o teu valor em voz alta", durationMin: 5 },
    ],
  },

  // ─── CURSO 2 — Sangue e Seda ───
  {
    slug: "sangue-e-seda",
    number: 2,
    title: "Sangue e Seda",
    subtitle: "A herança invisível entre mães e filhas",
    arcoEmocional:
      "Começa na idealização ou na raiva. Passa pela diferenciação: onde acabo eu e começa ela? Atravessa a herança não-dita, a culpa de crescer, a lealdade que prende. Chega ao lugar mais livre: ver a mãe como mulher inteira e escolher o que levas.",
    diferencial:
      "Não é um curso sobre perdoar a tua mãe. É sobre ver a mulher antes de ti — e devolver-lhe o que é dela sem deixar de a amar.",
    modules: [
      {
        number: 1,
        title: "A Mãe que Carregas",
        description: "A mãe-personagem vs. a mãe-pessoa.",
        subLessons: [
          { letter: "A", title: "A mãe-personagem vs. a mãe-pessoa", description: "A distância entre a mãe que construíste e a mulher que ela e." },
          { letter: "B", title: "Memória ou interpretação?", description: "O que lembras e o que realmente aconteceu." },
        ],
        workbook: "Retrato da mãe interior",
      },
      {
        number: 2,
        title: "A Herança que Não Pediste",
        description: "O que herdaste sem saber.",
        subLessons: [
          { letter: "A", title: "O que herdaste sem saber", description: "Os padrões que passaram de mãe para filha sem palavras." },
          { letter: "B", title: "Repetição e oposição: ambas são herança", description: "Repetir a mãe ou fazer o oposto — ambas são respostas a ela." },
          { letter: "C", title: "Escolher o que mantens", description: "Separar conscientemente o que levas e o que devolves." },
        ],
        workbook: "Inventário da herança materna",
      },
      {
        number: 3,
        title: "A Culpa de Crescer",
        description: "Crescer como traição silenciosa.",
        subLessons: [
          { letter: "A", title: "Crescer como traição", description: "A sensação de que evoluir é abandonar a mãe." },
          { letter: "B", title: "A lealdade invisível", description: "Os compromissos inconscientes que te prendem ao passado." },
          { letter: "C", title: "Ser livre sem abandonar", description: "Crescer sem cortar — diferenciar sem destruir." },
        ],
        workbook: "Mapa da lealdade invisível",
      },
      {
        number: 4,
        title: "A Raiva Sagrada",
        description: "A raiva que nunca te permitiste.",
        subLessons: [
          { letter: "A", title: "A raiva que nunca te permitiste", description: "A raiva guardada que pesa mais do que a expressada." },
          { letter: "B", title: "Raiva vs. rejeição", description: "Sentir raiva da mãe não é rejeitá-la." },
          { letter: "C", title: "O que fazer com a raiva", description: "Canais saudáveis para a raiva que guardaste." },
        ],
        workbook: "Carta a raiva",
      },
      {
        number: 5,
        title: "O Silêncio entre Mãe e Filha",
        description: "O que nunca foi dito entre vos.",
        subLessons: [
          { letter: "A", title: "O que nunca foi dito", description: "As palavras que ficaram por dizer entre mãe e filha." },
          { letter: "B", title: "O silêncio como protecção", description: "O silêncio que protege mas também aprisiona." },
          { letter: "C", title: "Quebrar o silêncio sem destruir", description: "Dizer sem explodir. Falar sem ferir." },
        ],
        workbook: "A carta não enviada",
      },
      {
        number: 6,
        title: "O Corpo da Mãe, o Corpo da Filha",
        description: "O que a mãe te ensinou sobre o teu corpo.",
        subLessons: [
          { letter: "A", title: "O que a mãe te ensinou sobre o teu corpo", description: "As mensagens sobre o corpo feminino que absorveste." },
          { letter: "B", title: "O corpo como territorio herdado", description: "O teu corpo como extensao do corpo da tua mãe." },
        ],
        workbook: "Mapa corporal geracional",
      },
      {
        number: 7,
        title: "Quando a Mãe Não Foi Suficiente",
        description: "A mãe que não pode dar o que não tinha.",
        subLessons: [
          { letter: "A", title: "A mãe que não pode", description: "Distinguir entre não quis e não pôde." },
          { letter: "B", title: "Lamentar sem culpar", description: "Sentir a falta sem transformar em acusação." },
          { letter: "C", title: "A mãe interior", description: "Construir internamente o que não recebeste externamente." },
        ],
        workbook: "A mãe que precisavas vs. a mãe que tiveste",
      },
      {
        number: 8,
        title: "Ser Filha e Ser Mãe ao Mesmo Tempo",
        description: "O loop geracional e como interrompê-lo.",
        subLessons: [
          { letter: "A", title: "O loop geracional", description: "O que passas adiante sem querer." },
          { letter: "B", title: "Interromper o padrão", description: "Escolher conscientemente o que transmites." },
          { letter: "C", title: "A materia que passas adiante", description: "O que queres que a próxima geração receba de ti." },
        ],
        workbook: "Carta a próxima geração",
      },
      {
        number: 9,
        title: "Ver a Mulher, Não Só a Mãe",
        description: "A despedida da filha que precisava.",
        subLessons: [
          { letter: "A", title: "A mãe antes de ti", description: "A mulher que a tua mãe era antes de ser tua mãe." },
          { letter: "B", title: "Ver sem perdoar (se não quiseres)", description: "Compreender não exige perdao. Ver é suficiente." },
          { letter: "C", title: "A despedida da filha que precisava", description: "Despedir-te da filha que esperava e tornar-te a mulher que és." },
        ],
        workbook: "Ritual de encerramento",
      },
    ],
    youtubeHooks: [
      { title: "3 sinais de que estás a repetir a vida da tua mãe sem saber", durationMin: 8 },
      { title: "Porque discutir com a tua mãe te faz sentir como se tivesses 12 anos", durationMin: 6 },
      { title: "A diferença entre perdoar e compreender", durationMin: 7 },
    ],
  },

  // ─── CURSO 3 — A Arte da Inteireza ───
  {
    slug: "a-arte-da-inteireza",
    number: 3,
    title: "A Arte da Inteireza",
    subtitle: "Amar sem te perderes no outro",
    arcoEmocional:
      "Começa pelo reconhecimento: em que momento deixas de te sentir? Passa pelos padrões. Atravessa a dor de relações passadas onde te perdeste. Reconstrói a imagem do que é estar com alguém sem abandonar o centro. Termina com a prática diaria de presença relacional.",
    diferencial:
      "Não é um curso sobre relações. É sobre o momento exacto em que desapareces dentro de uma — e como voltar.",
    modules: [
      {
        number: 1,
        title: "O Momento em que Desapareces",
        description: "O ponto de mutação em que deixas de ser tu.",
        subLessons: [
          { letter: "A", title: "O ponto de mutação", description: "O momento exacto em que deixas de te sentir dentro da relação." },
          { letter: "B", title: "Os sinais no corpo", description: "O corpo avisa antes da mente perceber." },
          { letter: "C", title: "O tanto faz que não é tanto faz", description: "A indiferença como mecanismo de protecção." },
        ],
        workbook: "Mapa dos pontos de desaparecimento",
      },
      {
        number: 2,
        title: "O Modelo de Amor que Absorveste",
        description: "O modelo de amor que carregas sem saber.",
        subLessons: [
          { letter: "A", title: "Amor como sacrifício", description: "Quando aprendeste que amar é abdicar." },
          { letter: "B", title: "Amor como salvação", description: "Quando procuras no outro o que falta em ti." },
          { letter: "C", title: "Amor como fusão", description: "Quando amar significa fundir-se até desaparecer." },
        ],
        workbook: "Arqueologia do modelo de amor",
      },
      {
        number: 3,
        title: "Atrair o Mesmo Padrão",
        description: "A repetição não é azar.",
        subLessons: [
          { letter: "A", title: "A repetição não é azar", description: "Porque atrais o mesmo tipo de relação." },
          { letter: "B", title: "O familiar confundido com amor", description: "Quando o que doi é confundido com intimidade." },
          { letter: "C", title: "Interromper o ciclo", description: "Como quebrar o padrão sem esperar pela relação perfeita." },
        ],
        workbook: "Mapa de padrões relacionais",
      },
      {
        number: 4,
        title: "Ter Necessidades Não é Ser Carente",
        description: "Nomear o que precisas sem pedir desculpa.",
        subLessons: [
          { letter: "A", title: "A arma da palavra 'carente'", description: "Como a palavra 'carente' é usada para te silenciar." },
          { letter: "B", title: "Nomear o que precisas", description: "A diferença entre necessidade e dependência." },
          { letter: "C", title: "Pedir sem pedir desculpa", description: "Pedir o que precisas como acto de dignidade, não de fraqueza." },
        ],
        workbook: "Inventário de necessidades",
      },
      {
        number: 5,
        title: "Os Limites Dentro do Amor",
        description: "Limites não são muros.",
        subLessons: [
          { letter: "A", title: "Limites não são muros", description: "A diferença entre proteger-te e fechar-te." },
          { letter: "B", title: "O medo de perder ao limitar", description: "O medo de que limites afastem quem amas." },
          { letter: "C", title: "Limites práticos", description: "Frases, gestos e práticas concretas para o dia-a-dia." },
        ],
        workbook: "Guia prático de limites",
      },
      {
        number: 6,
        title: "Solidao vs. Solitude",
        description: "A diferença entre estar sozinha e estar contigo.",
        subLessons: [
          { letter: "A", title: "O medo de ficar sozinha", description: "O medo que te faz aceitar menos do que mereces." },
          { letter: "B", title: "Aprender a estar contigo", description: "A prática de solitude como fundação do amor." },
          { letter: "C", title: "A relação contigo como fundação", description: "A qualidade da relação contigo define a qualidade das outras." },
        ],
        workbook: "Práticas de solitude",
      },
      {
        number: 7,
        title: "O Sexo como Termometro",
        description: "O que o desejo revela sobre a relação.",
        subLessons: [
          { letter: "A", title: "Desejo autêntico vs. desejo performativo", description: "A diferença entre querer e achar que deves querer." },
          { letter: "B", title: "Prazer como direito", description: "O prazer não é bónus — é linguagem." },
          { letter: "C", title: "Falar sobre sexo sem vergonha", description: "A conversa sobre desejo como acto de intimidade." },
        ],
        workbook: "Mapa do desejo autêntico",
      },
      {
        number: 8,
        title: "Dois Corpos Inteiros",
        description: "Amor como proximidade entre corpos inteiros.",
        subLessons: [
          { letter: "A", title: "A imagem do amor saudável", description: "O que é realmente estar com alguém sem te perder." },
          { letter: "B", title: "O espaço entre os dois", description: "O espaço como sinal de saúde, não de distância." },
          { letter: "C", title: "Ficar de forma diferente ou sair de forma inteira", description: "Quando mudar a relação é quando terminá-la." },
        ],
        workbook: "Visão da relação inteira",
      },
    ],
    youtubeHooks: [
      { title: "5 sinais de que estás a desaparecer numa relação", durationMin: 7 },
      { title: "Porque atrais sempre o mesmo tipo de pessoa", durationMin: 8 },
      { title: "A diferença entre estar disponivel e não ter vida própria", durationMin: 6 },
    ],
  },

  // ─── CURSO 4 — Depois do Fogo ───
  {
    slug: "depois-do-fogo",
    number: 4,
    title: "Depois do Fogo",
    subtitle: "Quando a vida te pede para começar de novo",
    arcoEmocional:
      "Começa no luto do que acabou. Passa pelo vazio entre o fim e o início. Reconstrói identidade fora dos papéis que desempenhaste. Atravessa o medo do desconhecido. Termina com os primeiros passos a partir de onde estas.",
    diferencial:
      "Não é um curso motivacional sobre recomeços. É sobre o espaço entre o fim e o início — e como habitá-lo sem fugir.",
    modules: [
      {
        number: 1,
        title: "Chorar o que Acabou",
        description: "A permissão de acabar de acabar.",
        subLessons: [
          { letter: "A", title: "A permissão de acabar de acabar", description: "Dar tempo ao luto antes de correr para o novo." },
          { letter: "B", title: "O elogio fúnebre ao que foi", description: "Honrar o que existiu, mesmo que tenha doido." },
          { letter: "C", title: "O corpo no luto", description: "Onde mora o luto no teu corpo." },
        ],
        workbook: "Ritual de encerramento",
      },
      {
        number: 2,
        title: "O Vazio que Assusta",
        description: "O espaço entre o fim e o início.",
        subLessons: [
          { letter: "A", title: "O espaço entre o fim e o início", description: "O limbo onde já não és quem eras e ainda não és quem vais ser." },
          { letter: "B", title: "O vazio como solo", description: "O vazio não é ausência — é preparação." },
          { letter: "C", title: "A diferença entre pausa e paralisia", description: "Como distinguir repouso necessário de medo disfarçado." },
        ],
        workbook: "Mapa do vazio",
      },
      {
        number: 3,
        title: "Quem Sou Eu Sem Aquilo?",
        description: "Identidade além dos papéis.",
        subLessons: [
          { letter: "A", title: "Identidade ligada a papéis", description: "O que sobra quando tiras o título, a relação, o papel." },
          { letter: "B", title: "Os papéis que te definiram", description: "Mãe, esposa, profissional — quem és sem isso?" },
          { letter: "C", title: "Reconstruir identidade", description: "Construir a partir do que resta, não do que falta." },
        ],
        workbook: "Inventário de identidade",
      },
      {
        number: 4,
        title: "O Medo do Desconhecido",
        description: "Avancar com medo.",
        subLessons: [
          { letter: "A", title: "Porque o conhecido doi menos que o incerto", description: "A preferencia pelo sofrimento familiar." },
          { letter: "B", title: "O corpo no medo", description: "As respostas físicas ao desconhecido." },
          { letter: "C", title: "Avancar com medo", description: "Não esperar que o medo passe para começar a andar." },
        ],
        workbook: "Mapa do medo do desconhecido",
      },
      {
        number: 5,
        title: "O Peso das Opiniões",
        description: "Recomeçar em silêncio.",
        subLessons: [
          { letter: "A", title: "O que os outros esperam de ti", description: "As expectativas externas que pesam no recomeço." },
          { letter: "B", title: "A vergonha do 'falhanço'", description: "O estigma de recomeçar como se fosse fracasso." },
          { letter: "C", title: "Recomeçar em silêncio", description: "O direito de recomeçar sem anunciar." },
        ],
        workbook: "Filtro de opiniões",
      },
      {
        number: 6,
        title: "Recomeçar aos 30, 40, 50",
        description: "A mentira do tarde demais.",
        subLessons: [
          { letter: "A", title: "A mentira do 'tarde demais'", description: "Desmontar a narrativa do prazo de validade." },
          { letter: "B", title: "A sabedoria que a idade traz ao recomeço", description: "O que sabes agora que não sabias antes." },
          { letter: "C", title: "O corpo que já viveu", description: "Honrar o corpo como arquivo de experiência." },
        ],
        workbook: "Linha do tempo dos recomeços",
      },
      {
        number: 7,
        title: "O Dinheiro do Recomeço",
        description: "A insegurança financeira do recomeço.",
        subLessons: [
          { letter: "A", title: "A insegurança financeira", description: "O medo financeiro como barreira ao recomeço." },
          { letter: "B", title: "Começar com pouco", description: "O mínimo viável para dar o primeiro passo." },
          { letter: "C", title: "O mínimo viável emocional", description: "O que precisas emocionalmente para recomeçar." },
        ],
        workbook: "Plano mínimo viável",
      },
      {
        number: 8,
        title: "Começar a Partir de Aqui",
        description: "Não apagar — integrar.",
        subLessons: [
          { letter: "A", title: "Não apagar — integrar", description: "Recomeçar não é apagar. É construir com o que tens." },
          { letter: "B", title: "Os primeiros passos", description: "Ações pequenas que mudam a direção." },
          { letter: "C", title: "A mulher que já recomeçou", description: "Reconhecer que o recomeço já está em curso." },
        ],
        workbook: "Os 7 primeiros passos",
      },
    ],
    youtubeHooks: [
      { title: "Porque recomeçar da mais medo do que ficar", durationMin: 7 },
      { title: "A mentira do 'voltar à estaca zero'", durationMin: 6 },
      { title: "Como saber se é cedo ou tarde demais", durationMin: 8 },
    ],
  },

  // ─── CURSO 5 — Olhos Abertos ───
  {
    slug: "olhos-abertos",
    number: 5,
    title: "Olhos Abertos",
    subtitle: "Decidir a partir de clareza, não de medo",
    arcoEmocional:
      "Começa na paralisia. Passa pelas vozes que não são tuas. Aprende a ouvir o corpo. Desmonta falsas dicotomias. Termina a viver com a escolha sem remorso.",
    diferencial:
      "Não ensina a tomar decisões melhores. Ensina a distinguir as decisões do medo das da clareza — e a confiar no processo, mesmo sem certezas.",
    modules: [
      {
        number: 1,
        title: "A Paralisia e o que Ela Protege",
        description: "Não decidir é decidir.",
        subLessons: [
          { letter: "A", title: "Não decidir é decidir", description: "A indecisão como decisão disfarçada." },
          { letter: "B", title: "A ilusão de manter todas as opções abertas", description: "O custo de não escolher." },
          { letter: "C", title: "O custo real da indecisão", description: "O que perdes enquanto não decides." },
        ],
        workbook: "Inventário das decisões adiadas",
      },
      {
        number: 2,
        title: "A Voz que Não é Tua",
        description: "Quem fala quando decides.",
        subLessons: [
          { letter: "A", title: "Quem fala quando 'decides'", description: "As vozes internas que se mascaram de tuas." },
          { letter: "B", title: "O 'devias' como alarme", description: "Cada 'devias' é sinal de uma voz que não é tua." },
          { letter: "C", title: "Encontrar a tua voz no ruido", description: "Distinguir a tua voz das vozes herdadas." },
        ],
        workbook: "Mapa das vozes internas",
      },
      {
        number: 3,
        title: "Decidir com o Corpo",
        description: "O corpo sabe primeiro.",
        subLessons: [
          { letter: "A", title: "O corpo sabe primeiro", description: "A inteligência somática na tomada de decisão." },
          { letter: "B", title: "Calibrar o sim e o não corporal", description: "Aprender a ler a expansao e a contratura." },
          { letter: "C", title: "Integrar corpo e mente", description: "Quando o corpo e a mente discordam." },
        ],
        workbook: "Exercícios de decisão somática",
      },
      {
        number: 4,
        title: "Falsas Dicotomias",
        description: "Ou isto ou aquilo — sera?",
        subLessons: [
          { letter: "A", title: "Ou isto ou aquilo", description: "A maioria das decisões não é binária." },
          { letter: "B", title: "A pressao de urgência artificial", description: "Nem tudo precisa de ser decidido agora." },
          { letter: "C", title: "Decidir por fases", description: "O direito de decidir aos poucos." },
        ],
        workbook: "Desconstrução de dilemas",
      },
      {
        number: 5,
        title: "O Medo de Errar",
        description: "O erro como informação.",
        subLessons: [
          { letter: "A", title: "Errar é humano", description: "Retirar o peso catastrófico do erro." },
          { letter: "B", title: "O erro como informação", description: "Cada erro traz dados que a indecisão não traz." },
          { letter: "C", title: "A decisão imperfeita vs. a indecisão perfeita", description: "Uma decisão imperfeita move. A indecisão perfeita paralisa." },
        ],
        workbook: "Diário de erros úteis",
      },
      {
        number: 6,
        title: "Decidir por Ti (Não por Todos)",
        description: "A mulher que decide por todos e nada por si.",
        subLessons: [
          { letter: "A", title: "A mulher que decide por todos e nada por si", description: "O padrão de priorizar as decisões dos outros." },
          { letter: "B", title: "Culpa de priorizar", description: "A culpa de te colocares em primeiro." },
          { letter: "C", title: "O 'egoísmo' saudável", description: "Decidir por ti não é egoísmo — é sobrevivência." },
        ],
        workbook: "Mapa de decisões delegadas",
      },
      {
        number: 7,
        title: "Decisões Irrevogáveis e Revogáveis",
        description: "A maioria é revogável.",
        subLessons: [
          { letter: "A", title: "A maioria é revogável", description: "Quase tudo pode ser refeito, ajustado, redirecionado." },
          { letter: "B", title: "As poucas irrevogaveis", description: "Identificar as decisões que merecem mais tempo." },
          { letter: "C", title: "Decidir sem garantias", description: "A coragem de decidir sem saber o resultado." },
        ],
        workbook: "Classificação de decisões",
      },
      {
        number: 8,
        title: "Viver com a Escolha",
        description: "A paz da decisão tomada.",
        subLessons: [
          { letter: "A", title: "O remorso como hábito", description: "Quando o remorso é padrão, não resposta a uma má decisão." },
          { letter: "B", title: "Cada sim implica um não", description: "Aceitar o luto de cada escolha feita." },
          { letter: "C", title: "A paz da decisão tomada", description: "A liberdade que vem depois de decidir." },
        ],
        workbook: "Ritual de encerramento da decisão",
      },
    ],
    youtubeHooks: [
      { title: "Porque decides por todos e nada por ti", durationMin: 6 },
      { title: "O mito da decisão perfeita", durationMin: 7 },
      { title: "Exercício de 2 minutos para saber o que queres", durationMin: 5 },
    ],
  },

  // ─── CURSO 6 — Pele Nua ───
  {
    slug: "pele-nua",
    number: 6,
    title: "Pele Nua",
    subtitle: "Aprender a ouvir o corpo antes de a mente racionalizar",
    arcoEmocional:
      "Começa pela desconexão. Aprende literacia corporal. Passa pelos sintomas como linguagem. Calibra o sim e o não do corpo. Aprende a habitar, não só usar. Termina com o corpo como primeiro conselheiro.",
    diferencial:
      "Não é um curso de wellness ou mindfulness. É sobre reconectar com a inteligência do teu corpo — que sempre soube antes de ti.",
    modules: [
      {
        number: 1,
        title: "O Corpo que Ignoras",
        description: "Décadas a calar o corpo.",
        subLessons: [
          { letter: "A", title: "Décadas a calar o corpo", description: "O hábito de ignorar o que o corpo diz." },
          { letter: "B", title: "A desconexão como norma", description: "Quando não sentir se torna normal." },
          { letter: "C", title: "O body scan como primeiro passo", description: "A prática de voltar a habitar o corpo." },
        ],
        workbook: "Body scan guiado",
      },
      {
        number: 2,
        title: "Sintomas como Linguagem",
        description: "O corpo fala quando a boca se cala.",
        subLessons: [
          { letter: "A", title: "A enxaqueca antes do Natal", description: "Os padrões entre o corpo e os eventos da vida." },
          { letter: "B", title: "A insónia da conversa evitada", description: "Quando o corpo acorda o que a mente quer esquecer." },
          { letter: "C", title: "Ler sintomas como frases", description: "Traduzir a linguagem do corpo para palavras." },
        ],
        workbook: "Dicionário corporal pessoal",
      },
      {
        number: 3,
        title: "A Memória do Corpo",
        description: "O corpo guarda o que a mente esquece.",
        subLessons: [
          { letter: "A", title: "O corpo guarda o que a mente esquece", description: "A memória somática e como se manifesta." },
          { letter: "B", title: "Triggers corporais", description: "Reacções físicas a estímulos que a mente não reconhece." },
          { letter: "C", title: "Honrar sem reviver", description: "Reconhecer a memória sem retraumatizar." },
        ],
        workbook: "Mapa de memórias corporais",
      },
      {
        number: 4,
        title: "O Sim e o Não do Corpo",
        description: "Expansao vs. contratura.",
        subLessons: [
          { letter: "A", title: "Expansao vs. contratura", description: "As duas respostas básicas do corpo a qualquer estímulo." },
          { letter: "B", title: "Calibrar no quotidiano", description: "Praticar a leitura corporal nas decisões do dia-a-dia." },
          { letter: "C", title: "Confiar na bússola", description: "Confiar no corpo como instrumento de navegação." },
        ],
        workbook: "Exercícios de calibração corporal",
      },
      {
        number: 5,
        title: "O Corpo e as Emocoes",
        description: "Onde vivem as emoções no corpo.",
        subLessons: [
          { letter: "A", title: "Onde vivem as emoções no corpo", description: "Mapear onde cada emoção se aloja fisicamente." },
          { letter: "B", title: "Emocoes suprimidas", description: "O custo físico de emoções não expressadas." },
          { letter: "C", title: "Dar espaço sem explodir", description: "Criar espaço para a emoção sem ser engolida por ela." },
        ],
        workbook: "Mapa emocional corporal",
      },
      {
        number: 6,
        title: "O Corpo e a Alimentação",
        description: "Ouvir o corpo à mesa.",
        subLessons: [
          { letter: "A", title: "Comer para calar", description: "A alimentação como forma de silenciar emoções." },
          { letter: "B", title: "Fome fisica vs. fome emocional", description: "Distinguir as duas fomes." },
          { letter: "C", title: "Ouvir o corpo à mesa", description: "Comer como acto de presença, não de fuga." },
        ],
        workbook: "Diário alimentar emocional",
      },
      {
        number: 7,
        title: "O Corpo e o Descanso",
        description: "Descanso real vs. distracção.",
        subLessons: [
          { letter: "A", title: "Descanso real vs. distracção", description: "A diferença entre descansar e apenas parar de trabalhar." },
          { letter: "B", title: "O que o TEU corpo precisa para descansar", description: "O descanso personalizado — não existe receita universal." },
          { letter: "C", title: "Parar sem culpa", description: "A prática de parar sem justificar." },
        ],
        workbook: "Plano de descanso personalizado",
      },
      {
        number: 8,
        title: "Habitar (Não Só Usar) o Corpo",
        description: "O corpo como casa, não como ferramenta.",
        subLessons: [
          { letter: "A", title: "O corpo como ferramenta vs. o corpo como casa", description: "A diferença entre usar o corpo e habitá-lo." },
          { letter: "B", title: "Presenca corporalizada", description: "Viver no corpo, não só na mente." },
          { letter: "C", title: "O corpo como conselheiro", description: "O corpo como o teu primeiro e mais fiel conselheiro." },
        ],
        workbook: "Práticas de presença corporal",
      },
    ],
    youtubeHooks: [
      { title: "O teu corpo esta a tentar dizer-te algo", durationMin: 7 },
      { title: "Porque ficas doente nas férias", durationMin: 6 },
      { title: "Reconectar com o corpo em 3 minutos", durationMin: 5 },
    ],
  },

  // ─── CURSO 7 — Limite Sagrado ───
  {
    slug: "limite-sagrado",
    number: 7,
    title: "Limite Sagrado",
    subtitle: "Limites, o preço de agradar, a culpa da recusa",
    arcoEmocional:
      "Começa pela arqueologia: de onde vem a incapacidade de recusar? Passa pelo custo real de dizer sim a tudo. Treina o não. Termina com o não como espaço para o sim.",
    diferencial:
      "Não é um curso sobre assertividade. É sobre a raiz da dificuldade em dizer não — e o preço que pagas por cada sim que não é teu.",
    modules: [
      {
        number: 1,
        title: "A Boa Menina que Cresceu",
        description: "O software de infância que ainda corre.",
        subLessons: [
          { letter: "A", title: "O software de infância", description: "Os programas de obediência que ainda correm em ti." },
          { letter: "B", title: "O preço de ser 'boa'", description: "O custo acumulado de agradar." },
          { letter: "C", title: "Actualizar o sistema", description: "Decidir conscientemente que regras ainda servem." },
        ],
        workbook: "Auditoria do software interno",
      },
      {
        number: 2,
        title: "O Preço do Sim Automatico",
        description: "Contabilizar o custo de dizer sim a tudo.",
        subLessons: [
          { letter: "A", title: "Contabilizar o custo", description: "Quanto te custa cada sim que não é teu." },
          { letter: "B", title: "Os últimos 7 dias", description: "Exercício: quantos sins automáticos nos últimos 7 dias?" },
          { letter: "C", title: "O corpo do sim falso", description: "Como o corpo reage quando dizes sim e sentes não." },
        ],
        workbook: "Diário dos sins automáticos",
      },
      {
        number: 3,
        title: "A Culpa de Recusar",
        description: "De onde vem a culpa de dizer não.",
        subLessons: [
          { letter: "A", title: "De onde vem a culpa", description: "A arqueologia da culpa: quando aprendeste que não = má pessoa." },
          { letter: "B", title: "Culpa vs. responsabilidade", description: "Separar culpa real de culpa herdada." },
          { letter: "C", title: "Atravessar a culpa", description: "Dizer não é sentir a culpa sem voltar atras." },
        ],
        workbook: "Mapa da culpa",
      },
      {
        number: 4,
        title: "A Diferença entre Ser Amada e Ser Útil",
        description: "Quando confundes ser útil com ser amada.",
        subLessons: [
          { letter: "A", title: "Quando confundes ser útil com ser amada", description: "A armadilha de pensar que so serves se serves." },
          { letter: "B", title: "O valor além da utilidade", description: "O que és quando não estás a fazer nada por ninguém." },
          { letter: "C", title: "Relações transaccionais", description: "Identificar relações onde o amor depende da tua utilidade." },
        ],
        workbook: "Teste das relações transaccionais",
      },
      {
        number: 5,
        title: "Não Sem Desculpa",
        description: "O não curto e sem justificação.",
        subLessons: [
          { letter: "A", title: "A anatomia da justificação", description: "Porque sentes necessidade de justificar cada não." },
          { letter: "B", title: "O não curto", description: "Prática: dizer não em menos de 10 palavras." },
          { letter: "C", title: "O desconforto do silêncio depois", description: "Sustentar o silêncio apos o não sem preencher." },
        ],
        workbook: "Treino do não",
      },
      {
        number: 6,
        title: "Limites no Trabalho",
        description: "Dizer não ao chefe, aos colegas, ao sistema.",
        subLessons: [
          { letter: "A", title: "A mulher que faz tudo no escritório", description: "O padrão de carregar o peso emocional e prático do trabalho." },
          { letter: "B", title: "Dizer não ao chefe", description: "Estratégias para limitar sem sabotar a carreira." },
          { letter: "C", title: "Promoção pelo sim vs. respeito pelo não", description: "O que ganha respeito a longo prazo." },
        ],
        workbook: "Guia de limites profissionais",
      },
      {
        number: 7,
        title: "Limites com Familia",
        description: "A família como teste máximo.",
        subLessons: [
          { letter: "A", title: "A família como teste máximo", description: "Porque é mais difícil dizer não a família." },
          { letter: "B", title: "A chantagem emocional", description: "Reconhecer e responder a chantagem emocional." },
          { letter: "C", title: "Amar com limites", description: "O amor não exige ausência de limites." },
        ],
        workbook: "Mapa de limites familiares",
      },
      {
        number: 8,
        title: "O Não como Espaco para o Sim",
        description: "O que cabe quando largas.",
        subLessons: [
          { letter: "A", title: "O que cabe quando largas", description: "O espaço que se abre quando dizes não ao que não é teu." },
          { letter: "B", title: "O sim autêntico", description: "Quando o sim nasce da liberdade, não da obrigação." },
          { letter: "C", title: "Celebrar o não", description: "Cada não é um sim a ti." },
        ],
        workbook: "Celebração dos não",
      },
    ],
    youtubeHooks: [
      { title: "Porque dizer não te faz sentir culpada", durationMin: 7 },
      { title: "A diferença entre ser amada e ser útil", durationMin: 8 },
      { title: "Treino de 7 dias para a mulher que diz sim a tudo", durationMin: 6 },
    ],
  },

  // ─── CURSO 8 — Flores no Escuro ───
  {
    slug: "flores-no-escuro",
    number: 8,
    title: "Flores no Escuro",
    subtitle: "As perdas que não são morte mas doem como se fossem",
    arcoEmocional:
      "Começa pelo reconhecimento. Passa pela permissão de chorar o que não têm funeral. Localiza o luto no corpo. Integra a perda na paisagem de quem es.",
    diferencial:
      "Não é um curso sobre superar perdas. É sobre fazer luto das perdas que ninguém valida — as que não têm funeral, flores ou condolências.",
    modules: [
      {
        number: 1,
        title: "As Perdas que Não Têm Funeral",
        description: "Nomear o inomeável.",
        subLessons: [
          { letter: "A", title: "Nomear o inomeável", description: "Dar nome às perdas que o mundo não reconhece." },
          { letter: "B", title: "Porque ninguém valida", description: "A solidão de um luto sem testemunhas." },
          { letter: "C", title: "Dar peso ao que pesa", description: "Validar a dor sem comparar com a dor dos outros." },
        ],
        workbook: "Inventário das perdas silenciosas",
      },
      {
        number: 2,
        title: "A Permissão que Ninguém Te Deu",
        description: "A única permissão que precisas.",
        subLessons: [
          { letter: "A", title: "As frases que calam", description: "'Segue em frente', 'já passou', 'há quem esteja pior'." },
          { letter: "B", title: "A única permissão que precisas", description: "A tua própria permissão para sentir." },
          { letter: "C", title: "Chorar sem horário", description: "A liberdade de chorar quando o corpo pede." },
        ],
        workbook: "Carta de permissão",
      },
      {
        number: 3,
        title: "O Luto que Vive no Corpo",
        description: "Localizar a perda no corpo.",
        subLessons: [
          { letter: "A", title: "Garganta fechada, peito apertado", description: "Os locais fisicos onde o luto se instala." },
          { letter: "B", title: "Localizar a perda", description: "Mapear onde a perda vive no teu corpo." },
          { letter: "C", title: "Dar espaço ao que esta preso", description: "Práticas para libertar o que o corpo segura." },
        ],
        workbook: "Body scan do luto",
      },
      {
        number: 4,
        title: "Luto de Relações que Não Acabaram",
        description: "Chorar o que era enquanto estas no que e.",
        subLessons: [
          { letter: "A", title: "A relação que mudou", description: "Quando a relação não acabou mas já não e a mesma." },
          { letter: "B", title: "Chorar o que era enquanto estas no que e", description: "Fazer luto de uma versão da relação sem sair dela." },
          { letter: "C", title: "Aceitar a versão actual", description: "Receber o que existe em vez de chorar o que existia." },
        ],
        workbook: "Mapa relacional: antes e agora",
      },
      {
        number: 5,
        title: "Luto de Versoes de Ti",
        description: "A mulher que eras é a que nunca foste.",
        subLessons: [
          { letter: "A", title: "A mulher que eras", description: "Fazer luto de quem eras antes de tudo mudar." },
          { letter: "B", title: "A mulher que nunca foste", description: "Chorar a versão de ti que nunca chegou a existir." },
          { letter: "C", title: "Honrar sem prender", description: "Guardar sem agarrar. Lembrar sem paralisar." },
        ],
        workbook: "Carta às versões de ti",
      },
      {
        number: 6,
        title: "Luto e Culpa",
        description: "A culpa como companheira do luto.",
        subLessons: [
          { letter: "A", title: "A culpa do sobrevivente", description: "A culpa de continuar quando alguém ou algo ficou para tras." },
          { letter: "B", title: "A culpa de sentir alívio", description: "Quando o fim traz alívio e o alívio traz culpa." },
          { letter: "C", title: "Libertar a culpa sem negar a perda", description: "Largar a culpa sem minimizar o que perdeste." },
        ],
        workbook: "Separação luto-culpa",
      },
      {
        number: 7,
        title: "Rituais de Encerramento",
        description: "Porque os rituais importam.",
        subLessons: [
          { letter: "A", title: "Porque os rituais importam", description: "O ritual como ponte entre o dentro e o fora." },
          { letter: "B", title: "Rituais simples", description: "Rituais que podes fazer sozinha, hoje, sem nada especial." },
          { letter: "C", title: "O ritual como corpo em acção", description: "Quando o corpo faz o que as palavras não conseguem." },
        ],
        workbook: "Guia de rituais pessoais",
      },
      {
        number: 8,
        title: "Carregar Sem Ser Esmagada",
        description: "A perda como paisagem, não como destino.",
        subLessons: [
          { letter: "A", title: "Superar é violência", description: "'Superar' é uma palavra violenta para quem perdeu." },
          { letter: "B", title: "A perda como paisagem", description: "A perda não desaparece — integra-se na paisagem de quem es." },
          { letter: "C", title: "Viver com e não apesar de", description: "Viver com a perda, não apesar dela." },
        ],
        workbook: "Integração da perda",
      },
    ],
    youtubeHooks: [
      { title: "As perdas que ninguém te deixou chorar", durationMin: 8 },
      { title: "Porque 'segue em frente' e o pior conselho", durationMin: 6 },
      { title: "Como honrar o que perdeste sem te afogares nele", durationMin: 7 },
    ],
  },

  // ─── CURSO 9 — O Peso e o Chão ───
  {
    slug: "o-peso-e-o-chao",
    number: 9,
    title: "O Peso e o Chão",
    subtitle: "Quando descansar não resolve",
    arcoEmocional:
      "Começa pelo inventário do peso. Passa pelo que carregas que não é teu. Distingue tipos de cansaco. Termina com a prática de largar.",
    diferencial:
      "Não é um curso sobre produtividade ou gestão de tempo. É sobre perceber que o que te falta não é férias — e pores coisas no chão.",
    modules: [
      {
        number: 1,
        title: "O Inventário do Peso",
        description: "O que carregas.",
        subLessons: [
          { letter: "A", title: "O que carregas", description: "Fazer o inventário honesto de tudo o que trazes às costas." },
          { letter: "B", title: "O que escolheste vs. o que te caiu em cima", description: "Separar o peso escolhido do peso imposto." },
          { letter: "C", title: "O peso normalizado", description: "O peso que carregas há tanto tempo que já não sentes." },
        ],
        workbook: "Inventário do peso",
      },
      {
        number: 2,
        title: "A Carga Mental Invisível",
        description: "O trabalho que ninguém vê.",
        subLessons: [
          { letter: "A", title: "O trabalho que ninguém vê", description: "A carga mental que não aparece em nenhuma lista." },
          { letter: "B", title: "O CEO emocional da família", description: "Quando és a gestora emocional de toda a gente." },
          { letter: "C", title: "Tornar visível para negociar", description: "Nomear a carga invisível para poder partilha-lá." },
        ],
        workbook: "Mapa da carga mental",
      },
      {
        number: 3,
        title: "A Mulher que Segura Tudo",
        description: "O mito da mulher forte.",
        subLessons: [
          { letter: "A", title: "Quem segura a mulher que segura tudo?", description: "A pergunta que ninguém faz." },
          { letter: "B", title: "O mito da mulher forte", description: "A armadilha de ser admirada pela resistência." },
          { letter: "C", title: "Pedir ajuda como acto de coragem", description: "Pedir ajuda não é fraqueza — é sabedoria." },
        ],
        workbook: "Rede de suporte",
      },
      {
        number: 4,
        title: "Tipos de Cansaco",
        description: "Nem todo o cansaco se resolve da mesma forma.",
        subLessons: [
          { letter: "A", title: "Cansaco físico", description: "O cansaco que o sono resolve." },
          { letter: "B", title: "Cansaco emocional", description: "O cansaco que o sono não resolve." },
          { letter: "C", title: "Cansaco existencial", description: "O cansaco que pede mudança, não descanso." },
        ],
        workbook: "Diagnóstico do cansaco",
      },
      {
        number: 5,
        title: "O Falso Descanso",
        description: "Scroll não é descanso.",
        subLessons: [
          { letter: "A", title: "Scroll não é descanso", description: "As actividades que parecem descanso mas esgotam." },
          { letter: "B", title: "Vinho não é descanso", description: "A diferença entre anestesiar e descansar." },
          { letter: "C", title: "Descanso real", description: "O que realmente regenera." },
        ],
        workbook: "Auditoria do descanso",
      },
      {
        number: 6,
        title: "A Exaustão como Mensagem",
        description: "O corpo em greve.",
        subLessons: [
          { letter: "A", title: "O corpo em greve", description: "Quando o corpo para porque tu não paras." },
          { letter: "B", title: "Burn-out não é fraqueza", description: "Burn-out e o resultado de um sistema, não de uma falha pessoal." },
          { letter: "C", title: "Ouvir antes de colapsar", description: "Os sinais de aviso que antecedem o colapso." },
        ],
        workbook: "Sinais de alarme pessoais",
      },
      {
        number: 7,
        title: "Largar Sem Culpa",
        description: "O medo de que tudo desmorone.",
        subLessons: [
          { letter: "A", title: "O medo de que tudo desmorone", description: "O medo de que se largares, tudo cai." },
          { letter: "B", title: "Largar não e abandonar", description: "A diferença entre largar e ser irresponsável." },
          { letter: "C", title: "O teste de largar", description: "Exercício: o que acontece se não fizeres isto durante uma semana?" },
        ],
        workbook: "O teste de largar",
      },
      {
        number: 8,
        title: "Pôr no Chão",
        description: "A arte de pôr no chão.",
        subLessons: [
          { letter: "A", title: "A arte de pôr no chão", description: "A prática de pousar o que não é teu." },
          { letter: "B", title: "O que fica e o que vai", description: "Escolher conscientemente o que continuas a carregar." },
          { letter: "C", title: "Viver mais leve", description: "A leveza como prática diaria, não como destino." },
        ],
        workbook: "Ritual de pousar",
      },
    ],
    youtubeHooks: [
      { title: "Porque estás sempre cansada e férias não resolvem", durationMin: 7 },
      { title: "A carga mental invisível", durationMin: 8 },
      { title: "Como largar sem culpa: o exercício do papel no chão", durationMin: 5 },
    ],
  },

  // ─── CURSO 10 — Voz de Dentro ───
  {
    slug: "voz-de-dentro",
    number: 10,
    title: "Voz de Dentro",
    subtitle: "Dizer o que precisas de dizer a quem mais importa",
    arcoEmocional:
      "Começa por identificar a conversa. Passa pela preparação. Aprende a começar. Aprende a sustentar. Prepara-te para o depois.",
    diferencial:
      "Não é um curso de comunicação. É sobre ter a conversa que adias há meses — não como confronto, mas como verdade dita com cuidado.",
    modules: [
      {
        number: 1,
        title: "A Conversa que Vive em Ti",
        description: "O loop mental da conversa que adias.",
        subLessons: [
          { letter: "A", title: "O loop mental", description: "A conversa que ensaias no chuveiro, no carro, antes de dormir." },
          { letter: "B", title: "Porque evitas", description: "O que te impede de ter a conversa." },
          { letter: "C", title: "O custo do silêncio", description: "O que te custa não dizer o que precisas de dizer." },
        ],
        workbook: "Identificação da conversa adiada",
      },
      {
        number: 2,
        title: "O que Queres Dizer vs. O que Queres que Aconteça",
        description: "Separar expressão de resultado.",
        subLessons: [
          { letter: "A", title: "Separar as duas coisas", description: "O que queres dizer e o que queres que mude são coisas diferentes." },
          { letter: "B", title: "Ter a conversa sem depender do resultado", description: "Falar para ti, não para controlar a resposta do outro." },
          { letter: "C", title: "Abdicar do controlo do desfecho", description: "A coragem de dizer sem saber o que vem depois." },
        ],
        workbook: "Exercício de separação intenção-resultado",
      },
      {
        number: 3,
        title: "As Palavras que Ajudam e as que Destroem",
        description: "A verdade dita com corpo.",
        subLessons: [
          { letter: "A", title: "'Tu sempre' e 'Tu nunca'", description: "As frases que activam defesa em vez de escuta." },
          { letter: "B", title: "O tom conta mais que as palavras", description: "O corpo fala mais alto que o vocabulário." },
          { letter: "C", title: "A verdade dita com corpo", description: "Dizer a verdade com presença, não com agressividade." },
        ],
        workbook: "Guia de linguagem não-violenta",
      },
      {
        number: 4,
        title: "Começar a Conversa",
        description: "A primeira frase.",
        subLessons: [
          { letter: "A", title: "A primeira frase", description: "A frase que abre a porta sem a partir." },
          { letter: "B", title: "Começar sem acusar", description: "Iniciar pela experiência, não pela acusação." },
          { letter: "C", title: "O timing", description: "Quando é o momento certo (e quando não e)." },
        ],
        workbook: "Treino de primeiras frases",
      },
      {
        number: 5,
        title: "Sustentar a Conversa",
        description: "Quando o outro reage mal.",
        subLessons: [
          { letter: "A", title: "Quando o outro reage mal", description: "O que fazer quando a reacção não é a que esperavas." },
          { letter: "B", title: "Ouvir sem desistir", description: "A capacidade de ouvir a resposta sem abandonar a tua verdade." },
          { letter: "C", title: "Pausar sem fugir", description: "A pausa como ferramenta, não como fuga." },
        ],
        workbook: "Estratégias de sustentação",
      },
      {
        number: 6,
        title: "Conversas com Parceiros",
        description: "O não-dito no casamento.",
        subLessons: [
          { letter: "A", title: "O não-dito no casamento", description: "As conversas que o casamento acumula em silêncio." },
          { letter: "B", title: "Intimidade e verdade", description: "A verdade como fundação da intimidade real." },
          { letter: "C", title: "Conversas sobre sexo, dinheiro, futuro", description: "Os três temas que a maioria dos casais evita." },
        ],
        workbook: "Guia de conversas de casal",
      },
      {
        number: 7,
        title: "Conversas com Pais",
        description: "Falar com quem te criou.",
        subLessons: [
          { letter: "A", title: "Falar com quem te criou", description: "A complexidade de dizer a verdade a quem te deu a vida." },
          { letter: "B", title: "Quando não vale a pena", description: "Quando a conversa é para ti, não para ele." },
          { letter: "C", title: "Falar para ti, não para ele", description: "Dizer a verdade mesmo que o outro não a ouca." },
        ],
        workbook: "Carta não enviada (exercício)",
      },
      {
        number: 8,
        title: "O Depois",
        description: "O silêncio pós-conversa.",
        subLessons: [
          { letter: "A", title: "O silêncio pós-conversa", description: "O espaço estranho depois de dizer o que precisavas." },
          { letter: "B", title: "O alívio inesperado", description: "O alívio que vem depois de teres sido verdadeira." },
          { letter: "C", title: "A relação depois da verdade", description: "O que muda na relação quando a verdade entra." },
        ],
        workbook: "Reflexão pós-conversa",
      },
    ],
    youtubeHooks: [
      { title: "A conversa que ensaias no chuveiro", durationMin: 7 },
      { title: "Porque o silêncio doi mais que a verdade", durationMin: 6 },
      { title: "Como começar sem as 3 palavras que arruinam tudo", durationMin: 8 },
    ],
  },

  // ─── CURSO 11 — O Fio Invisível ───
  {
    slug: "o-fio-invisivel",
    number: 11,
    title: "O Fio Invisível",
    subtitle: "A ligação entre todos nós e como a tua cura toca o todo",
    arcoEmocional:
      "Começa pela ilusão de que estás sozinha no que sentes. Passa pela descoberta de que carregas dores que não são tuas. Atravessa o reconhecimento de que o que fazes a ti mesma fazes ao todo. Chega à compreensão de que curar-te não é egoísmo — é o acto mais generoso que existe. Termina com a experiência de que quando uma mulher se liberta, algo se liberta em todas.",
    diferencial:
      "Não é um curso de espiritualidade nem de energia. É sobre a ciência e a experiência da ligação humana — como o que sentes afecta quem te rodeia, como o que carregas veio de quem veio antes de ti, e como a tua cura individual é a semente da cura colectiva.",
    modules: [
      {
        number: 1,
        title: "A Ilusão da Separação",
        description: "Pensas que o que sentes é só teu.",
        subLessons: [
          { letter: "A", title: "Sozinha no que sentes", description: "A crença de que ninguém sente o que tu sentes — e como isso te isola." },
          { letter: "B", title: "O espelho invisível", description: "Cada pessoa que te irrita, te inspira ou te magoa está a mostrar-te algo sobre ti." },
          { letter: "C", title: "O fio que não vês", description: "A ligação que existe entre todos nós — no corpo, no sistema nervoso, no campo emocional." },
        ],
        workbook: "Mapa das minhas ligações invisíveis",
      },
      {
        number: 2,
        title: "O que Carregas que Não É Teu",
        description: "As dores herdadas que vivem no teu corpo.",
        subLessons: [
          { letter: "A", title: "A herança emocional", description: "Os medos, vergonhas e silêncios que absorveste da tua família sem ninguém te dizer." },
          { letter: "B", title: "O corpo como arquivo", description: "Onde guardas a dor dos outros — nas costas, no estômago, na garganta." },
          { letter: "C", title: "Devolver o que não te pertence", description: "O exercício de separar a tua dor da dor que herdaste." },
        ],
        workbook: "Inventário do que carrego e do que é meu",
      },
      {
        number: 3,
        title: "O Contágio Emocional",
        description: "Como o que sentes passa para quem te rodeia.",
        subLessons: [
          { letter: "A", title: "A sala muda quando entras", description: "Como o teu estado interno altera o ambiente à tua volta — sem dizeres uma palavra." },
          { letter: "B", title: "Os teus filhos sentem tudo", description: "O que não dizes em voz alta, o corpo das crianças ouve." },
          { letter: "C", title: "A ansiedade partilhada", description: "Como a ansiedade, a raiva e a tristeza se transmitem entre pessoas que se amam." },
        ],
        workbook: "Diário do contágio emocional",
      },
      {
        number: 4,
        title: "A Dualidade",
        description: "Tu és individual e és o todo ao mesmo tempo.",
        subLessons: [
          { letter: "A", title: "Separada e ligada", description: "O paradoxo: és completamente tua e completamente parte de algo maior." },
          { letter: "B", title: "O que faço a mim, faço ao mundo", description: "Quando te maltratas, há algo no colectivo que também se contrai." },
          { letter: "C", title: "A responsabilidade gentil", description: "Isto não é culpa — é consciência. Cuidar de ti é cuidar do todo." },
        ],
        workbook: "Exercício da dualidade: eu e o todo",
      },
      {
        number: 5,
        title: "A Ferida Colectiva",
        description: "O que todas as mulheres carregam.",
        subLessons: [
          { letter: "A", title: "A dor que não tem dono", description: "Há dores que são de todas — o silêncio, a submissão, a vergonha do corpo." },
          { letter: "B", title: "A história que não foi contada", description: "Gerações de mulheres que engoliram o que sentiam para que tu pudesses existir." },
          { letter: "C", title: "Sentir o colectivo no corpo", description: "Quando choras sem razão aparente, talvez estejas a chorar por muitas." },
        ],
        workbook: "Carta às mulheres que vieram antes",
      },
      {
        number: 6,
        title: "Curar-te Não É Egoísmo",
        description: "A culpa de olhar para ti quando o mundo precisa de ajuda.",
        subLessons: [
          { letter: "A", title: "A armadilha do sacrifício", description: "A crença de que cuidar de ti é tirar algo aos outros." },
          { letter: "B", title: "O oxigénio é para ti primeiro", description: "Não consegues dar o que não tens. A tua cura é a primeira oferenda." },
          { letter: "C", title: "O egoísmo sagrado", description: "Quando te curas, libertas espaço para que outros se curem também." },
        ],
        workbook: "O que muda à minha volta quando eu mudo",
      },
      {
        number: 7,
        title: "Quebrar a Corrente",
        description: "O padrão pára em ti.",
        subLessons: [
          { letter: "A", title: "O padrão que atravessa gerações", description: "A mãe da tua mãe também carregava isto. E a mãe dela." },
          { letter: "B", title: "A decisão de não passar adiante", description: "O momento em que decides que isto pára aqui — não com raiva, com consciência." },
          { letter: "C", title: "O que os teus filhos não vão herdar", description: "A liberdade que nasce quando quebras um padrão que tem séculos." },
        ],
        workbook: "Mapa do padrão intergeracional",
      },
      {
        number: 8,
        title: "A Ondulação",
        description: "Quando uma se liberta, algo se liberta em todas.",
        subLessons: [
          { letter: "A", title: "A pedra na água", description: "Cada gesto de consciência cria ondas que não consegues ver mas que existem." },
          { letter: "B", title: "A tua vida como oferenda", description: "Viver com clareza não é só para ti — é a contribuição mais silenciosa e mais poderosa." },
          { letter: "C", title: "O fio que agora vês", description: "Não estás sozinha. Nunca estiveste. E agora sabes." },
        ],
        workbook: "Reflexão final: o que muda quando eu vejo o fio",
      },
    ],
    youtubeHooks: [
      { title: "Porque choras sem razão aparente", durationMin: 7 },
      { title: "O que os teus filhos sentem quando tu não estás bem", durationMin: 8 },
      { title: "A cura que começa em ti e toca quem te rodeia", durationMin: 6 },
    ],
  },

  // ─── CURSO 12 — O Espelho do Outro ───
  {
    slug: "o-espelho-do-outro",
    number: 12,
    title: "O Espelho do Outro",
    subtitle: "O que te incomoda no outro vive em ti",
    arcoEmocional:
      "Começa pela irritação que não entendes. Passa pela descoberta de que o outro te mostra o que rejeitas em ti. Atravessa a sombra — o que escondes, o que negas, o que invejas. Chega ao ponto em que o inimigo se torna professor. Termina com a capacidade de te veres através de cada relação.",
    diferencial:
      "Não é um curso sobre relações nem sobre empatia. É sobre usar cada pessoa que te incomoda, te fascina ou te magoa como espelho — para veres o que ainda não olhaste em ti.",
    modules: [
      {
        number: 1,
        title: "A Irritação como Pista",
        description: "O que te irrita no outro diz mais sobre ti.",
        subLessons: [
          { letter: "A", title: "A pessoa que te tira do sério", description: "Porque te afecta tanto alguém que devia ser indiferente." },
          { letter: "B", title: "O gatilho escondido", description: "O que vês no outro que não queres ver em ti." },
          { letter: "C", title: "O corpo quando reages", description: "Onde mora a irritação no teu corpo antes de vir à boca." },
        ],
        workbook: "Mapa dos meus gatilhos",
      },
      {
        number: 2,
        title: "A Projecção",
        description: "O que pões no outro que é teu.",
        subLessons: [
          { letter: "A", title: "O mecanismo invisível", description: "Como projectamos nos outros o que não aceitamos em nós." },
          { letter: "B", title: "Ele é egoísta ou tu não pedes?", description: "A diferença entre o que o outro faz e o que tu interpretas." },
          { letter: "C", title: "Recolher a projecção", description: "O exercício de trazer de volta o que puseste no outro." },
        ],
        workbook: "Exercício de recolha de projecções",
      },
      {
        number: 3,
        title: "A Sombra",
        description: "O que rejeitas em ti.",
        subLessons: [
          { letter: "A", title: "A parte que escondes", description: "Todos temos uma parte que não mostramos — e ela não desaparece." },
          { letter: "B", title: "A raiva negada", description: "A raiva que dizes não sentir mas que governa as tuas reacções." },
          { letter: "C", title: "Integrar a sombra", description: "Não é eliminá-la. É reconhecê-la e dar-lhe lugar." },
        ],
        workbook: "Diálogo com a sombra",
      },
      {
        number: 4,
        title: "A Admiração como Mapa",
        description: "O que admiras no outro também é teu.",
        subLessons: [
          { letter: "A", title: "A inveja que não admites", description: "A inveja como sinal daquilo que queres mas não te permites." },
          { letter: "B", title: "O outro como possibilidade", description: "O que admiras mostra o que já existe em ti, adormecido." },
          { letter: "C", title: "Reclamar o que é teu", description: "Deixar de admirar de longe e começar a viver de perto." },
        ],
        workbook: "Inventário do que admiro e do que já é meu",
      },
      {
        number: 5,
        title: "O Inimigo como Professor",
        description: "Quem mais te magoa mais te ensina.",
        subLessons: [
          { letter: "A", title: "A pessoa que não perdoas", description: "O que essa pessoa te mostrou que ninguém mais podia." },
          { letter: "B", title: "A lição dentro da ferida", description: "Encontrar o ensinamento sem desculpar o que aconteceu." },
          { letter: "C", title: "Soltar sem absolver", description: "Não precisas de perdoar para te libertar." },
        ],
        workbook: "Carta ao professor involuntário",
      },
      {
        number: 6,
        title: "O Parceiro como Espelho",
        description: "Quem escolhes revela quem és.",
        subLessons: [
          { letter: "A", title: "Porque o escolheste", description: "O que te atraiu no início conta a história do que precisavas resolver." },
          { letter: "B", title: "O espelho diário", description: "Viver com alguém é ser espelhada todos os dias — e isso cansa e cura." },
          { letter: "C", title: "Crescer juntos ou separados", description: "Quando o espelho muda e a relação precisa de acompanhar." },
        ],
        workbook: "Mapa relacional: o que o outro me mostra",
      },
      {
        number: 7,
        title: "O Filho como Espelho",
        description: "O espelho que não mente.",
        subLessons: [
          { letter: "A", title: "Ele faz o que tu fazes", description: "Os filhos não ouvem o que dizes — copiam o que vives." },
          { letter: "B", title: "A ferida que se repete", description: "Quando vês no teu filho o que mais temes em ti." },
          { letter: "C", title: "Deixá-lo ser diferente", description: "O acto de permitir que o filho não te espelhe — e amá-lo igual." },
        ],
        workbook: "Reflexão: o que o meu filho me mostra",
      },
      {
        number: 8,
        title: "Ver-te Através do Outro",
        description: "O mundo inteiro é espelho.",
        subLessons: [
          { letter: "A", title: "Cada relação como porta", description: "Usar cada encontro como oportunidade de autoconhecimento." },
          { letter: "B", title: "O reflexo limpo", description: "Quando já não projectas, o que vês no outro é o que está lá." },
          { letter: "C", title: "O espelho que és para os outros", description: "Tu também és espelho. O que mostras a quem te rodeia." },
        ],
        workbook: "Prática diária do espelho relacional",
      },
    ],
    youtubeHooks: [
      { title: "Porque aquela pessoa te irrita tanto", durationMin: 7 },
      { title: "O que a inveja te está a tentar dizer", durationMin: 6 },
      { title: "Os teus filhos copiam o que vives, não o que dizes", durationMin: 8 },
    ],
  },

  // ─── CURSO 13 — O Silêncio que Grita ───
  {
    slug: "o-silencio-que-grita",
    number: 13,
    title: "O Silêncio que Grita",
    subtitle: "O que a tua família nunca disse vive no teu corpo",
    arcoEmocional:
      "Começa pelo peso que sentes e não sabes nomear. Passa pela descoberta de que há segredos na tua família que nunca foram ditos mas que moldaram tudo. Atravessa a lealdade ao silêncio e o medo de o quebrar. Chega à compreensão de que dar voz ao que foi calado liberta gerações. Termina com a tua primeira palavra.",
    diferencial:
      "Não é um curso de terapia familiar nem de constelações. É sobre ouvir o que nunca foi dito na tua família — e perceber como esses silêncios vivem no teu corpo, nas tuas escolhas e nos teus medos.",
    modules: [
      {
        number: 1,
        title: "O Peso sem Nome",
        description: "Algo pesa e não sabes o quê.",
        subLessons: [
          { letter: "A", title: "O peso que não é teu", description: "A sensação de carregar algo que não consegues explicar." },
          { letter: "B", title: "O corpo sabe antes de ti", description: "Os sintomas que aparecem sem causa — e a causa que ninguém nomeou." },
          { letter: "C", title: "O que ninguém te contou", description: "A intuição de que há algo na tua família que ficou por dizer." },
        ],
        workbook: "Mapa do peso sem nome",
      },
      {
        number: 2,
        title: "O Segredo Familiar",
        description: "O não-dito que moldou tudo.",
        subLessons: [
          { letter: "A", title: "O segredo que todos sabem", description: "Quando toda a família sabe mas ninguém diz — e o efeito disso." },
          { letter: "B", title: "O silêncio como regra", description: "Famílias que aprenderam a não falar. O preço dessa aprendizagem." },
          { letter: "C", title: "Os temas proibidos", description: "Dinheiro, doença, sexo, morte — os assuntos que a tua família evita." },
        ],
        workbook: "Inventário dos silêncios familiares",
      },
      {
        number: 3,
        title: "A Vergonha Herdada",
        description: "A vergonha que veio antes de ti.",
        subLessons: [
          { letter: "A", title: "A vergonha da avó", description: "Vergonhas que passam de geração em geração sem serem nomeadas." },
          { letter: "B", title: "O corpo da vergonha", description: "Onde vive a vergonha herdada: na postura, na voz, no olhar." },
          { letter: "C", title: "Separar vergonhas", description: "Distinguir a tua vergonha da vergonha que absorveste." },
        ],
        workbook: "Arqueologia da vergonha familiar",
      },
      {
        number: 4,
        title: "A Doença como Linguagem",
        description: "O corpo fala o que a boca calou.",
        subLessons: [
          { letter: "A", title: "O sintoma como mensagem", description: "Quando o corpo adoece para dizer o que ninguém disse." },
          { letter: "B", title: "Padrões de doença na família", description: "As doenças que se repetem — e o que podem estar a dizer." },
          { letter: "C", title: "Ouvir o corpo", description: "Aprender a escutar antes que o corpo precise de gritar." },
        ],
        workbook: "Diário corpo-silêncio",
      },
      {
        number: 5,
        title: "A Lealdade ao Silêncio",
        description: "Calar por amor a quem calou.",
        subLessons: [
          { letter: "A", title: "A lealdade invisível", description: "Calamos para proteger quem amamos — mesmo que isso nos destrua." },
          { letter: "B", title: "Trair o silêncio", description: "A sensação de traição quando pensas em falar sobre o que foi calado." },
          { letter: "C", title: "Leal a quem?", description: "A pergunta que muda tudo: és leal ao silêncio ou és leal a ti?" },
        ],
        workbook: "Mapa das lealdades silenciosas",
      },
      {
        number: 6,
        title: "O Silêncio que Protege",
        description: "Nem todo o silêncio é prisão.",
        subLessons: [
          { letter: "A", title: "O silêncio necessário", description: "Há silêncios que protegem. Aprender a distingui-los." },
          { letter: "B", title: "Escolher o silêncio", description: "A diferença entre calar por medo e calar por escolha." },
          { letter: "C", title: "O silêncio como presença", description: "Quando o silêncio deixa de ser fuga e se torna escuta." },
        ],
        workbook: "Exercício de discernimento: silêncio-prisão vs. silêncio-presença",
      },
      {
        number: 7,
        title: "Dar Voz ao Calado",
        description: "Dizer pela primeira vez.",
        subLessons: [
          { letter: "A", title: "A primeira palavra", description: "O momento em que dizes o que nunca foi dito — nem que seja a ti mesma." },
          { letter: "B", title: "Não é preciso gritar", description: "Dar voz não é confrontar. Pode ser um sussurro, uma carta, um diário." },
          { letter: "C", title: "O corpo depois de falar", description: "O que acontece no corpo quando finalmente dizes." },
        ],
        workbook: "A carta ao silêncio",
      },
      {
        number: 8,
        title: "O Silêncio que Cura",
        description: "Quando o silêncio deixa de pesar.",
        subLessons: [
          { letter: "A", title: "O que muda na família", description: "Quando uma pessoa fala, algo se reorganiza em todo o sistema." },
          { letter: "B", title: "A herança que deixas", description: "Os teus filhos não vão carregar o que tu nomeaste." },
          { letter: "C", title: "O novo silêncio", description: "O silêncio depois da verdade é diferente. É leve. É escolhido." },
        ],
        workbook: "Reflexão final: o que nomeei e o que libertei",
      },
    ],
    youtubeHooks: [
      { title: "O segredo que toda a tua família sabe mas ninguém diz", durationMin: 7 },
      { title: "Porque adoeces sem razão aparente", durationMin: 6 },
      { title: "A vergonha que sentes e que não é tua", durationMin: 8 },
    ],
  },

  // ─── CURSO 14 — A Teia ───
  {
    slug: "a-teia",
    number: 14,
    title: "A Teia",
    subtitle: "Pertencer sem desaparecer",
    arcoEmocional:
      "Começa pela fome de pertencer. Passa pelo preço que já pagaste para caber. Atravessa a rejeição como ferida fundadora. Aprende a distinguir grupos que te definem de grupos que te libertam. Chega ao paradoxo de pertencer a ti primeiro. Termina na teia que sustenta sem prender.",
    diferencial:
      "Não é um curso sobre socialização nem sobre solidão. É sobre a ecologia das emoções — como vivem entre pessoas, famílias e comunidades — e como encontrar o teu lugar sem te moldares ao que esperam de ti.",
    modules: [
      {
        number: 1,
        title: "A Fome de Pertencer",
        description: "O desejo mais antigo.",
        subLessons: [
          { letter: "A", title: "A criança que queria caber", description: "O momento em que percebeste que eras diferente — e decidiste esconder isso." },
          { letter: "B", title: "Pertencer como sobrevivência", description: "O cérebro trata a rejeição como ameaça de morte. Literalmente." },
          { letter: "C", title: "A fome que fica", description: "Mesmo adulta, a fome de pertencer governa mais do que imaginas." },
        ],
        workbook: "Mapa da minha fome de pertença",
      },
      {
        number: 2,
        title: "O Preço da Pertença",
        description: "O que abdicaste para caber.",
        subLessons: [
          { letter: "A", title: "O que calaste para ser aceite", description: "As opiniões, desejos e verdades que guardaste para não seres excluída." },
          { letter: "B", title: "A máscara social", description: "A versão de ti que criaste para funcionar no grupo." },
          { letter: "C", title: "O custo invisível", description: "O cansaço de ser quem não és para pertencer a quem não te vê." },
        ],
        workbook: "Inventário do que abdiquei",
      },
      {
        number: 3,
        title: "A Rejeição Fundadora",
        description: "A primeira vez que ficaste de fora.",
        subLessons: [
          { letter: "A", title: "A memória que ficou", description: "A primeira rejeição que moldou a tua forma de te relacionares." },
          { letter: "B", title: "O corpo da rejeição", description: "Onde vive a rejeição no teu corpo — e como se activa." },
          { letter: "C", title: "A ferida que se repete", description: "Como recrias a rejeição em situações que não a pedem." },
        ],
        workbook: "Arqueologia da rejeição",
      },
      {
        number: 4,
        title: "O Grupo que Define",
        description: "Quando pertencer te apaga.",
        subLessons: [
          { letter: "A", title: "O grupo como identidade", description: "Quando o 'nós' substitui o 'eu' e perdes o contorno." },
          { letter: "B", title: "A pressão do igual", description: "O desconforto de pensares diferente dentro do grupo." },
          { letter: "C", title: "Sair sem te perder", description: "O medo de ficar sozinha se deixares de concordar." },
        ],
        workbook: "Mapa dos meus grupos: onde me perco, onde me encontro",
      },
      {
        number: 5,
        title: "Emoções entre Pessoas",
        description: "O campo emocional colectivo.",
        subLessons: [
          { letter: "A", title: "A emoção que não é tua", description: "Quando entras numa sala e sentes algo que não é teu." },
          { letter: "B", title: "O contágio invisível", description: "Como absorves o medo, a raiva e a tristeza dos outros." },
          { letter: "C", title: "Proteger sem fechar", description: "Estar presente sem absorver. Sentir sem te perderes." },
        ],
        workbook: "Exercício de fronteira emocional",
      },
      {
        number: 6,
        title: "A Solidão no Grupo",
        description: "Rodeada de gente e sozinha.",
        subLessons: [
          { letter: "A", title: "A solidão disfarçada", description: "Estar acompanhada e sentir-te completamente sozinha." },
          { letter: "B", title: "Ligação vs. presença", description: "Estar ligada não é estar presente. Presença é outra coisa." },
          { letter: "C", title: "A coragem de estar presente", description: "Mostrar-te como és no grupo — sem filtro, sem máscara." },
        ],
        workbook: "Diário da presença autêntica",
      },
      {
        number: 7,
        title: "Pertencer a Ti Primeiro",
        description: "A pertença começa por dentro.",
        subLessons: [
          { letter: "A", title: "O lar interno", description: "Antes de pertenceres a qualquer grupo, precisas de pertencer a ti." },
          { letter: "B", title: "A relação contigo como raiz", description: "Quando te tens a ti, a necessidade de pertencer muda de forma." },
          { letter: "C", title: "De fome a escolha", description: "Pertencer deixa de ser necessidade e torna-se escolha." },
        ],
        workbook: "Práticas de pertença interior",
      },
      {
        number: 8,
        title: "A Teia que Sustenta",
        description: "Ligada sem estar presa.",
        subLessons: [
          { letter: "A", title: "A teia como escolha", description: "Construir ligações que sustentam sem sufocar." },
          { letter: "B", title: "Dar e receber na medida", description: "O equilíbrio entre o que ofereces e o que recebes na teia." },
          { letter: "C", title: "A pertença que liberta", description: "Quando pertencer já não é prisão nem necessidade — é casa." },
        ],
        workbook: "Visão da minha teia: quem sustenta, quem sufoca",
      },
    ],
    youtubeHooks: [
      { title: "O que calaste para ser aceite", durationMin: 7 },
      { title: "Porque te sentes sozinha mesmo acompanhada", durationMin: 6 },
      { title: "A rejeição que ainda governa a tua vida", durationMin: 8 },
    ],
  },

  // ─── CURSO 15 — A Chama ───
  {
    slug: "a-chama",
    number: 15,
    title: "Brasa Viva",
    subtitle: "A raiva que nunca te deixaram sentir",
    arcoEmocional:
      "Começa pela negação da raiva. Passa pelo reconhecimento de que a raiva vive no corpo há anos. Atravessa o medo do que acontece se a deixares sair. Aprende a distinguir raiva destrutiva de raiva informativa. Chega à raiva como combustível para mudança. Termina com a chama que ilumina em vez de queimar.",
    diferencial:
      "Não é um curso de gestão de raiva nem de controlo emocional. É sobre a relação proibida que a maioria das mulheres tem com a raiva — e como recuperá-la como força, não como vergonha.",
    modules: [
      {
        number: 1,
        title: "A Raiva Proibida",
        description: "A emoção que te ensinaram a esconder.",
        subLessons: [
          { letter: "A", title: "Boa menina não grita", description: "O momento em que aprendeste que a raiva era proibida para ti." },
          { letter: "B", title: "Onde guardaste a raiva", description: "Se não a expressaste, onde foi parar? Mandíbula, costas, estômago." },
          { letter: "C", title: "A raiva disfarçada", description: "Quando a raiva se mascara de cansaço, sarcasmo, controlo ou choro." },
        ],
        workbook: "Mapa da minha raiva escondida",
      },
      {
        number: 2,
        title: "O Medo de Explodir",
        description: "Se abro a porta, o que sai?",
        subLessons: [
          { letter: "A", title: "A panela de pressão", description: "O medo de que se deixares sair um pouco, sai tudo." },
          { letter: "B", title: "A crença de que vais destruir", description: "O terror de magoar quem amas se mostrares a raiva." },
          { letter: "C", title: "A raiva contida vs. a raiva expressa", description: "Nenhuma é saudável nos extremos. Há um caminho do meio." },
        ],
        workbook: "Inventário dos medos sobre a raiva",
      },
      {
        number: 3,
        title: "A Raiva como Informação",
        description: "O que a raiva te está a dizer.",
        subLessons: [
          { letter: "A", title: "A raiva como alarme", description: "A raiva diz-te que algo foi ultrapassado, violado ou ignorado." },
          { letter: "B", title: "De que tens raiva realmente?", description: "Debaixo da raiva do trânsito está a raiva da vida que levas." },
          { letter: "C", title: "A raiva justa", description: "Há raivas que estão certas. Que são a resposta correcta ao que te fizeram." },
        ],
        workbook: "Diário da raiva: o que ela me diz",
      },
      {
        number: 4,
        title: "A Raiva Antiga",
        description: "A raiva que tem anos.",
        subLessons: [
          { letter: "A", title: "A raiva da infância", description: "O que sentiste aos 8 anos e ainda carregas aos 40." },
          { letter: "B", title: "A raiva da mãe, do pai", description: "A raiva que não te permitiste sentir por quem te criou." },
          { letter: "C", title: "A raiva de ti mesma", description: "A mais difícil de todas — a raiva por teres ficado, calado, aceite." },
        ],
        workbook: "Carta à raiva que guardaste",
      },
      {
        number: 5,
        title: "A Raiva no Corpo",
        description: "Sentir a raiva sem a pensar.",
        subLessons: [
          { letter: "A", title: "O corpo da raiva", description: "Calor, tensão, punhos cerrados — o vocabulário físico da raiva." },
          { letter: "B", title: "Mover a raiva", description: "Exercícios que movem a energia da raiva pelo corpo sem destruir nada." },
          { letter: "C", title: "A raiva como fogo controlado", description: "Aprender a sentir o fogo sem te queimares nem queimares os outros." },
        ],
        workbook: "Práticas corporais para a raiva",
      },
      {
        number: 6,
        title: "A Raiva e os Limites",
        description: "Sem raiva não há limites.",
        subLessons: [
          { letter: "A", title: "A raiva como combustível", description: "Os limites nascem da raiva — sem ela, não sabes onde terminas." },
          { letter: "B", title: "Dizer não com fogo", description: "A diferença entre dizer não com medo e dizer não com raiva limpa." },
          { letter: "C", title: "A raiva que protege", description: "A raiva que te defende, que defende os teus filhos, que defende a tua dignidade." },
        ],
        workbook: "Exercício: limites nascidos da raiva",
      },
      {
        number: 7,
        title: "A Raiva e o Amor",
        description: "Podes amar e ter raiva ao mesmo tempo.",
        subLessons: [
          { letter: "A", title: "A raiva dentro do amor", description: "Ter raiva de quem amas não significa que não amas." },
          { letter: "B", title: "A raiva como intimidade", description: "Mostrar a raiva a alguém é um acto de confiança, não de agressão." },
          { letter: "C", title: "Raiva vs. violência", description: "A raiva é uma emoção. A violência é uma escolha. São coisas diferentes." },
        ],
        workbook: "Mapa: raiva e amor na mesma relação",
      },
      {
        number: 8,
        title: "A Chama que Ilumina",
        description: "Da raiva à clareza.",
        subLessons: [
          { letter: "A", title: "A raiva transformada", description: "Quando a raiva já não queima — ilumina o que precisa de mudar." },
          { letter: "B", title: "A mulher com fogo", description: "Uma mulher com acesso à sua raiva é uma mulher inteira." },
          { letter: "C", title: "A chama que fica", description: "Não apagar a chama. Aprender a viver com ela acesa." },
        ],
        workbook: "Reflexão final: a minha relação com a chama",
      },
    ],
    youtubeHooks: [
      { title: "Porque sorris quando queres gritar", durationMin: 7 },
      { title: "A raiva que guardas há anos e que o corpo já não aguenta", durationMin: 8 },
      { title: "Sem raiva não há limites", durationMin: 6 },
    ],
  },

  // ─── CURSO 16 — A Mulher Antes de Mãe ───
  {
    slug: "a-mulher-antes-de-mae",
    number: 16,
    title: "Antes do Ninho",
    subtitle: "Quem eras antes de seres de alguém",
    arcoEmocional:
      "Começa pela perda de identidade que ninguém nomeia. Passa pela culpa de sentir falta de quem eras. Atravessa a raiva e o ressentimento secretos. Aprende a separar a mãe da mulher. Chega à reconstrução de uma identidade que inclua ambas. Termina com a permissão de existir para além dos teus filhos.",
    diferencial:
      "Não é um curso de parentalidade nem de maternidade consciente. É sobre a mulher que desapareceu quando se tornou mãe — e como encontrá-la sem culpa.",
    modules: [
      {
        number: 1,
        title: "A Mulher que Desapareceu",
        description: "O dia em que deixaste de ser tu.",
        subLessons: [
          { letter: "A", title: "O dia em que nasceram dois", description: "Quando o teu filho nasceu, uma versão de ti morreu. Ninguém te disse." },
          { letter: "B", title: "A saudade de ti mesma", description: "Sentir falta de quem eras antes — e a culpa que vem com essa saudade." },
          { letter: "C", title: "O nome antes de mãe", description: "Quando foi a última vez que alguém te chamou pelo nome, não por 'mãe'?" },
        ],
        workbook: "Retrato da mulher antes de mãe",
      },
      {
        number: 2,
        title: "A Culpa Infinita",
        description: "O que quer que faças, nunca é suficiente.",
        subLessons: [
          { letter: "A", title: "A culpa de trabalhar", description: "Se trabalhas, devias estar com eles. Se estás com eles, devias estar a produzir." },
          { letter: "B", title: "A culpa de querer tempo", description: "O luxo proibido de querer uma hora só tua." },
          { letter: "C", title: "A culpa como corrente", description: "A culpa materna como sistema de controlo que te impede de viver." },
        ],
        workbook: "Inventário das culpas maternas",
      },
      {
        number: 3,
        title: "O Ressentimento Secreto",
        description: "O que não podes dizer em voz alta.",
        subLessons: [
          { letter: "A", title: "Amo-os e ressinto-me", description: "As duas coisas existem ao mesmo tempo. E nenhuma anula a outra." },
          { letter: "B", title: "O ressentimento do parceiro", description: "Quando o desequilíbrio de carga se torna raiva silenciosa." },
          { letter: "C", title: "Dizer o indizível", description: "Dar voz ao ressentimento sem destruir o que construíste." },
        ],
        workbook: "A carta que não posso enviar",
      },
      {
        number: 4,
        title: "O Corpo Depois dos Filhos",
        description: "O corpo que já não reconheces.",
        subLessons: [
          { letter: "A", title: "O corpo que deu vida", description: "O que aconteceu ao teu corpo — e o que ninguém te preparou para sentir." },
          { letter: "B", title: "Tocar e ser tocada", description: "Quando o corpo está tão requisitado pelos filhos que o toque do parceiro é invasão." },
          { letter: "C", title: "Habitar o corpo de novo", description: "Voltar ao corpo como teu, não como de alguém." },
        ],
        workbook: "Mapa corporal: antes e depois",
      },
      {
        number: 5,
        title: "Mãe Perfeita, Mãe Real",
        description: "A imagem impossível.",
        subLessons: [
          { letter: "A", title: "A mãe do Instagram", description: "A comparação com uma imagem que não existe." },
          { letter: "B", title: "A mãe que a tua mãe foi", description: "Repetir ou rejeitar — ambas são reacções ao modelo que tiveste." },
          { letter: "C", title: "A mãe suficiente", description: "Não perfeita. Não negligente. Suficiente. E isso basta." },
        ],
        workbook: "Retrato da mãe que quero ser vs. a que sou",
      },
      {
        number: 6,
        title: "O Desejo Adormecido",
        description: "Querer coisas que não são sobre os filhos.",
        subLessons: [
          { letter: "A", title: "O que querias antes?", description: "Os sonhos que puseste de lado quando te tornaste mãe." },
          { letter: "B", title: "Desejar sem pedir licença", description: "Querer coisas para ti sem precisar de justificar." },
          { letter: "C", title: "O exemplo que dás", description: "Uma mãe que vive é o melhor exemplo que um filho pode ter." },
        ],
        workbook: "Lista dos desejos adormecidos",
      },
      {
        number: 7,
        title: "Separar a Mãe da Mulher",
        description: "Tu não és só mãe.",
        subLessons: [
          { letter: "A", title: "A fusão de identidades", description: "Quando 'mãe' come todas as outras versões de ti." },
          { letter: "B", title: "Espaço para as duas", description: "A mulher e a mãe podem coexistir — mas precisam de espaço separado." },
          { letter: "C", title: "Sair sem abandonar", description: "Teres vida própria não é abandonar os teus filhos." },
        ],
        workbook: "Mapa das minhas identidades",
      },
      {
        number: 8,
        title: "A Mulher Inteira",
        description: "Mãe e tudo o resto.",
        subLessons: [
          { letter: "A", title: "Recuperar o nome", description: "Voltar a ser chamada pelo teu nome. Voltar a sentir-te tu." },
          { letter: "B", title: "O legado que queres deixar", description: "Não o que fizeste por eles — mas quem foste enquanto os criavas." },
          { letter: "C", title: "A mulher inteira", description: "Mãe. Mulher. Pessoa. Tudo ao mesmo tempo, sem hierarquia." },
        ],
        workbook: "Carta à mulher inteira que sou",
      },
    ],
    youtubeHooks: [
      { title: "Quando foi a última vez que alguém te chamou pelo teu nome", durationMin: 7 },
      { title: "O ressentimento que nenhuma mãe pode dizer em voz alta", durationMin: 8 },
      { title: "Sentir falta de ti mesma não é egoísmo", durationMin: 6 },
    ],
  },

  // ─── CURSO 17 — O Ofício de Ser ───
  {
    slug: "o-oficio-de-ser",
    number: 17,
    title: "Mãos Cansadas",
    subtitle: "Quando o trabalho te define e o propósito te escapa",
    arcoEmocional:
      "Começa pelo cansaço que não passa com férias. Passa pela descoberta de que te defines pelo que produzes. Atravessa o burnout como sintoma, não como fraqueza. Separa produtividade de valor. Chega à pergunta: o que farias se ninguém estivesse a ver? Termina com a reconstrução de um propósito que não te consuma.",
    diferencial:
      "Não é um curso de produtividade nem de carreira. É sobre a mulher que se esconde atrás do trabalho para não ter de olhar para si — e o que acontece quando o trabalho já não a sustenta.",
    modules: [
      {
        number: 1,
        title: "O Cansaço que Não Passa",
        description: "Férias não resolvem isto.",
        subLessons: [
          { letter: "A", title: "Cansada de quê exactamente?", description: "Quando o cansaço não é do corpo — é da vida que levas." },
          { letter: "B", title: "Ocupada não é viva", description: "A agenda cheia como fuga de ti mesma." },
          { letter: "C", title: "O burnout como mensagem", description: "O burnout não é fraqueza. É o corpo a dizer que algo precisa de mudar." },
        ],
        workbook: "Mapa do meu cansaço",
      },
      {
        number: 2,
        title: "Eu Sou o que Produzo",
        description: "A identidade presa ao trabalho.",
        subLessons: [
          { letter: "A", title: "Sem título, quem sou?", description: "O que sobra de ti quando tiras o cargo, o projeto, a empresa." },
          { letter: "B", title: "Produzir para existir", description: "Quando parar é desaparecer — e desaparecer é insuportável." },
          { letter: "C", title: "O vício do reconhecimento", description: "Trabalhar para ser vista, validada, aplaudida — e o vazio quando ninguém aplaude." },
        ],
        workbook: "Inventário: quem sou sem o trabalho",
      },
      {
        number: 3,
        title: "A Ambição Envergonhada",
        description: "Querer mais e sentir que não devias.",
        subLessons: [
          { letter: "A", title: "Querer e esconder", description: "A ambição que guardas porque te disseram que é demasiado." },
          { letter: "B", title: "Ambição feminina", description: "O que acontece quando uma mulher diz: eu quero mais. Sem pedir desculpa." },
          { letter: "C", title: "Ambição vs. ganância", description: "A diferença entre querer crescer e querer possuir." },
        ],
        workbook: "A minha ambição nomeada",
      },
      {
        number: 4,
        title: "O Trabalho como Fuga",
        description: "O que evitas quando te entregues ao trabalho.",
        subLessons: [
          { letter: "A", title: "Trabalhar para não sentir", description: "Quando o trabalho é o anestésico mais socialmente aceite." },
          { letter: "B", title: "O que aparece quando paras", description: "A solidão, a tristeza, o vazio que surgem nos dias de folga." },
          { letter: "C", title: "Parar sem colapsar", description: "Aprender a parar antes de o corpo te obrigar." },
        ],
        workbook: "Diário dos dias em que paro",
      },
      {
        number: 5,
        title: "O Dinheiro e o Propósito",
        description: "Fazer o que amas e pagar as contas.",
        subLessons: [
          { letter: "A", title: "O conflito eterno", description: "A tensão entre o que precisas de ganhar e o que te faz sentir viva." },
          { letter: "B", title: "Propósito não paga renda", description: "A honestidade de que precisas de dinheiro — e isso não invalida o propósito." },
          { letter: "C", title: "O suficiente", description: "Quanto é suficiente? E suficiente para quem?" },
        ],
        workbook: "Mapa: dinheiro vs. sentido",
      },
      {
        number: 6,
        title: "A Síndrome da Impostora",
        description: "Não mereço estar aqui.",
        subLessons: [
          { letter: "A", title: "A voz que diz que vão descobrir", description: "O medo constante de que percebam que não és tão boa como pareces." },
          { letter: "B", title: "Competência invisível", description: "Quando o que fazes bem se torna invisível porque parece 'natural'." },
          { letter: "C", title: "Ocupar o lugar", description: "Estás aqui porque mereces. Ponto." },
        ],
        workbook: "Exercício: provas da minha competência",
      },
      {
        number: 7,
        title: "O que Farias se Ninguém Visse?",
        description: "O propósito para lá da validação.",
        subLessons: [
          { letter: "A", title: "A pergunta incómoda", description: "Se ninguém soubesse, se ninguém aplaudisse — o que farias?" },
          { letter: "B", title: "O chamamento silencioso", description: "A coisa que te puxa e que ignoras porque não é 'prática'." },
          { letter: "C", title: "Propósito pequeno", description: "Nem todo o propósito é mudar o mundo. Às vezes é cozinhar, ensinar, cuidar." },
        ],
        workbook: "O meu propósito sem audiência",
      },
      {
        number: 8,
        title: "Trabalhar sem Desaparecer",
        description: "O trabalho como parte, não como tudo.",
        subLessons: [
          { letter: "A", title: "Trabalhar com presença", description: "Estar no trabalho sem que o trabalho te consuma." },
          { letter: "B", title: "A mulher que trabalha e vive", description: "O equilíbrio não é 50/50. É presença em cada coisa." },
          { letter: "C", title: "O ofício de ser", description: "O maior ofício não é o que fazes. É quem és enquanto fazes." },
        ],
        workbook: "Visão: o trabalho no lugar certo",
      },
    ],
    youtubeHooks: [
      { title: "Porque o cansaço não passa com férias", durationMin: 7 },
      { title: "O que evitas quando te entregues ao trabalho", durationMin: 6 },
      { title: "A síndrome da impostora explicada em 7 minutos", durationMin: 8 },
    ],
  },

  // ─── CURSO 18 — O Relógio Partido ───
  {
    slug: "o-relogio-partido",
    number: 18,
    title: "Estações Partidas",
    subtitle: "A relação com o tempo que te rouba o presente",
    arcoEmocional:
      "Começa pela pressa crónica. Passa pelo medo de envelhecer e pelo luto da juventude. Atravessa a narrativa do 'já é tarde'. Descobre que o tempo vivido conta mais que o tempo passado. Chega à presença. Termina com a liberdade de viver sem relógio.",
    diferencial:
      "Não é um curso de gestão do tempo nem de mindfulness. É sobre a relação emocional com o tempo — o medo de envelhecer, a pressa de viver, a invisibilidade que a idade traz, e a liberdade de largar o relógio.",
    modules: [
      {
        number: 1,
        title: "A Pressa de Viver",
        description: "Corres mas não chegas.",
        subLessons: [
          { letter: "A", title: "A urgência sem nome", description: "A sensação constante de que devias estar noutro sítio, a fazer outra coisa." },
          { letter: "B", title: "O corpo em modo pressa", description: "O sistema nervoso que nunca desliga — e o preço que pagas." },
          { letter: "C", title: "Para onde corres?", description: "Se parasses agora, o que te esperava? E porque tens medo disso?" },
        ],
        workbook: "Mapa da minha pressa",
      },
      {
        number: 2,
        title: "O Medo de Envelhecer",
        description: "O corpo que muda e o espelho que assusta.",
        subLessons: [
          { letter: "A", title: "O espelho que mudou", description: "Quando o reflexo já não corresponde à imagem que tens de ti." },
          { letter: "B", title: "A invisibilidade", description: "O momento em que a sociedade começa a não te ver — e o que isso faz." },
          { letter: "C", title: "O luto da juventude", description: "Chorar a mulher que foste sem te agarrares a ela." },
        ],
        workbook: "Carta ao meu corpo que envelhece",
      },
      {
        number: 3,
        title: "Já É Tarde Demais",
        description: "A mentira mais cruel.",
        subLessons: [
          { letter: "A", title: "Os prazos inventados", description: "Casar até aos 30. Filhos até aos 35. Carreira até aos 40. Quem decidiu isto?" },
          { letter: "B", title: "As vidas não vividas", description: "O luto pelas versões de ti que ficaram por viver." },
          { letter: "C", title: "Nunca é tarde para agora", description: "O único momento real é este. Tudo o resto é história." },
        ],
        workbook: "Desconstrução dos prazos",
      },
      {
        number: 4,
        title: "A Menopausa como Território",
        description: "A passagem que ninguém preparou.",
        subLessons: [
          { letter: "A", title: "O corpo que muda de novo", description: "Calores, insónia, humor — e a sensação de que perdeste o controlo." },
          { letter: "B", title: "O luto da fertilidade", description: "Mesmo que não quisesses mais filhos, o fim da possibilidade pesa." },
          { letter: "C", title: "A mulher que nasce depois", description: "Depois da menopausa há uma mulher mais livre do que imaginas." },
        ],
        workbook: "Diário da passagem",
      },
      {
        number: 5,
        title: "O Tempo Roubado",
        description: "Os anos que deste a quem não merecia.",
        subLessons: [
          { letter: "A", title: "Os anos que deste", description: "A relação, o trabalho, a situação que te roubou tempo — e a raiva disso." },
          { letter: "B", title: "O tempo não volta", description: "A aceitação mais difícil: não podes recuperar o que já passou." },
          { letter: "C", title: "Reclamar o que resta", description: "Não podes ter o tempo de volta. Mas podes usar o que resta de forma diferente." },
        ],
        workbook: "O que faço com o tempo que me resta",
      },
      {
        number: 6,
        title: "A Sabedoria do Corpo Vivido",
        description: "O que sabes agora que não sabias antes.",
        subLessons: [
          { letter: "A", title: "O que a idade trouxe", description: "As certezas, a paciência, o não que se diz sem culpa." },
          { letter: "B", title: "Cicatrizes como mapa", description: "Cada marca no corpo conta uma história de sobrevivência." },
          { letter: "C", title: "A beleza do vivido", description: "O corpo vivido tem uma beleza que o corpo jovem não tem: a da verdade." },
        ],
        workbook: "Inventário da minha sabedoria",
      },
      {
        number: 7,
        title: "Presença",
        description: "Largar o passado e o futuro.",
        subLessons: [
          { letter: "A", title: "O vício do futuro", description: "Viver para o 'quando' em vez do 'agora'." },
          { letter: "B", title: "O peso do passado", description: "Viver presa ao 'se tivesse' em vez do 'estou aqui'." },
          { letter: "C", title: "O presente como casa", description: "O único sítio onde realmente vives é agora." },
        ],
        workbook: "Práticas de presença",
      },
      {
        number: 8,
        title: "O Relógio Partido",
        description: "Viver sem contar o tempo.",
        subLessons: [
          { letter: "A", title: "Partir o relógio", description: "Largar a urgência. Largar os prazos. Largar a contagem." },
          { letter: "B", title: "O tempo vivido", description: "Medir a vida pelo que sentiste, não pelo que cumpriste." },
          { letter: "C", title: "A mulher sem pressa", description: "Uma mulher sem pressa é uma mulher perigosa — porque vê tudo." },
        ],
        workbook: "Reflexão final: a minha relação com o tempo",
      },
    ],
    youtubeHooks: [
      { title: "Porque sentes que já é tarde demais", durationMin: 7 },
      { title: "O medo de envelhecer que ninguém admite", durationMin: 8 },
      { title: "O que a menopausa não te disseram", durationMin: 6 },
    ],
  },

  // ─── CURSO 19 — A Coroa Escondida ───
  {
    slug: "a-coroa-escondida",
    number: 19,
    title: "Ouro e Sombra",
    subtitle: "O poder que tens e te assusta",
    arcoEmocional:
      "Começa pelo encolhimento — o hábito de te fazeres pequena. Passa pela descoberta de que o medo de brilhar é tão forte como o medo de falhar. Atravessa a auto-sabotagem como protecção. Aprende a ocupar espaço sem pedir desculpa. Chega ao poder como responsabilidade, não como ameaça. Termina de coroa na cabeça.",
    diferencial:
      "Não é um curso de empowerment nem de liderança feminina. É sobre a mulher que sabe que pode mais mas se esconde — e o que acontece quando para de se esconder.",
    modules: [
      {
        number: 1,
        title: "A Mulher que Encolhe",
        description: "O hábito de te fazeres pequena.",
        subLessons: [
          { letter: "A", title: "Desculpa, posso falar?", description: "O reflexo de pedir permissão para existir." },
          { letter: "B", title: "O corpo que encolhe", description: "A postura, o tom de voz, o espaço que não ocupas." },
          { letter: "C", title: "Quando começaste a encolher", description: "O momento em que percebeste que brilhar incomodava alguém." },
        ],
        workbook: "Mapa dos sítios onde encolho",
      },
      {
        number: 2,
        title: "O Medo de Brilhar",
        description: "Se me virem, o que acontece?",
        subLessons: [
          { letter: "A", title: "Visibilidade como perigo", description: "Ser vista é ser julgada. E ser julgada é ser destruída. Será?" },
          { letter: "B", title: "O medo do sucesso", description: "O medo de que se conseguires, perdes algo — amigos, normalidade, segurança." },
          { letter: "C", title: "O brilho dos outros", description: "Quando o sucesso dos outros te incomoda — e o que isso revela sobre o teu." },
        ],
        workbook: "Inventário dos medos de ser vista",
      },
      {
        number: 3,
        title: "A Auto-Sabotagem",
        description: "A forma mais subtil de te protegeres.",
        subLessons: [
          { letter: "A", title: "Quase mas não", description: "O padrão de chegares perto e recuares. De quase conseguires e depois estragares." },
          { letter: "B", title: "A protecção inconsciente", description: "A sabotagem protege-te de quê? De ser invejada? Rejeitada? Abandonada?" },
          { letter: "C", title: "Parar de te trair", description: "Reconhecer o momento exacto em que te sabotais — e escolher diferente." },
        ],
        workbook: "Diário da auto-sabotagem",
      },
      {
        number: 4,
        title: "Ocupar Espaço",
        description: "Sem pedir desculpa.",
        subLessons: [
          { letter: "A", title: "A sala inteira é tua", description: "O exercício de entrar num espaço e não te desculpares por existir." },
          { letter: "B", title: "Falar sem diminuir", description: "Dizer o que sabes sem 'talvez', sem 'não sei se', sem 'desculpa, mas'." },
          { letter: "C", title: "O corpo que ocupa", description: "Postura, voz, olhar — o vocabulário físico do poder." },
        ],
        workbook: "Exercícios de presença e espaço",
      },
      {
        number: 5,
        title: "O Poder e a Solidão",
        description: "Quanto mais forte, mais sozinha?",
        subLessons: [
          { letter: "A", title: "A mulher forte e sozinha", description: "O mito de que poder feminino afasta. E o que realmente acontece." },
          { letter: "B", title: "Mudar de círculo", description: "Quando cresces, nem todos vêm contigo. E isso não é perda." },
          { letter: "C", title: "Poder com ligação", description: "O verdadeiro poder não isola — atrai quem está ao mesmo nível." },
        ],
        workbook: "Mapa: poder e relações",
      },
      {
        number: 6,
        title: "O Dinheiro como Poder",
        description: "A mulher que ganha e o que isso muda.",
        subLessons: [
          { letter: "A", title: "Ganhar mais que ele", description: "O desconforto quando a mulher ganha mais — e o que isso revela." },
          { letter: "B", title: "Pedir o que vales", description: "A dificuldade de cobrar, negociar, pedir aumento." },
          { letter: "C", title: "Dinheiro como liberdade", description: "Quando o dinheiro deixa de ser sobrevivência e se torna escolha." },
        ],
        workbook: "Exercício: o que peço e o que mereço",
      },
      {
        number: 7,
        title: "A Responsabilidade do Poder",
        description: "Com poder vem clareza.",
        subLessons: [
          { letter: "A", title: "Poder não é dominação", description: "O poder feminino não é sobre controlar — é sobre estar inteira." },
          { letter: "B", title: "O impacto que tens", description: "Quando reconheces o impacto que a tua presença tem nos outros." },
          { letter: "C", title: "Usar o poder com cuidado", description: "Poder com consciência. Força com gentileza. Verdade com amor." },
        ],
        workbook: "Reflexão: o meu poder e a minha responsabilidade",
      },
      {
        number: 8,
        title: "A Coroa",
        description: "Põe a coroa na cabeça.",
        subLessons: [
          { letter: "A", title: "A coroa que escondes", description: "O poder que tens e que guardas para não incomodar." },
          { letter: "B", title: "Brilhar não tira luz", description: "O teu brilho não diminui o dos outros. Ilumina o caminho." },
          { letter: "C", title: "A mulher inteira e poderosa", description: "De coroa na cabeça. Sem pedir permissão. Sem pedir desculpa." },
        ],
        workbook: "Carta à mulher poderosa que sou",
      },
    ],
    youtubeHooks: [
      { title: "Porque te fazes pequena quando devias ocupar espaço", durationMin: 7 },
      { title: "A auto-sabotagem explicada: porque estragas quando está a correr bem", durationMin: 8 },
      { title: "O medo de brilhar é maior que o medo de falhar", durationMin: 6 },
    ],
  },

  // ─── CURSO 20 — A Fome ───
  {
    slug: "a-fome",
    number: 20,
    title: "Pão e Silêncio",
    subtitle: "O que comes quando não tens fome de comida",
    arcoEmocional:
      "Começa pela fome que não é de comida. Passa pela descoberta de que o corpo usa a comida como linguagem. Atravessa a guerra com o espelho e com a balança. Aprende a ouvir o que a fome realmente pede. Chega à paz com o corpo e com o prato. Termina a comer com presença, não com culpa.",
    diferencial:
      "Não é um curso de nutrição nem de dieta. É sobre a relação emocional com a comida — o que comes quando estás triste, ansiosa, vazia — e o que realmente precisas quando abres o frigorífico à meia-noite.",
    modules: [
      {
        number: 1,
        title: "A Fome que Não É de Comida",
        description: "O frigorífico à meia-noite.",
        subLessons: [
          { letter: "A", title: "O que procuras no prato", description: "Quando abres o frigorífico, não é fome. É outra coisa. O quê?" },
          { letter: "B", title: "Comer para não sentir", description: "A comida como anestésico — rápido, acessível, socialmente aceite." },
          { letter: "C", title: "A fome emocional", description: "Distinguir a fome do estômago da fome do coração." },
        ],
        workbook: "Diário: o que sinto antes de comer",
      },
      {
        number: 2,
        title: "A Guerra com o Espelho",
        description: "O corpo como inimigo.",
        subLessons: [
          { letter: "A", title: "O reflexo que rejeitas", description: "O que vês quando te olhas ao espelho — e o que realmente está lá." },
          { letter: "B", title: "O corpo que aprendeste a odiar", description: "Quem te ensinou que o teu corpo não estava bem? E quando?" },
          { letter: "C", title: "A balança como juiz", description: "O número que define o teu dia — e como isso te controla." },
        ],
        workbook: "Arqueologia da imagem corporal",
      },
      {
        number: 3,
        title: "O Peso como Armadura",
        description: "O corpo que se protege.",
        subLessons: [
          { letter: "A", title: "O peso que protege", description: "Quando o corpo ganha peso para te proteger — de quê?" },
          { letter: "B", title: "Invisível por escolha", description: "O peso como forma de desaparecer, de não ser desejada, de não ser vista." },
          { letter: "C", title: "O que está debaixo do peso", description: "Se tirasses o peso, o que ficava exposto?" },
        ],
        workbook: "Diálogo com o peso",
      },
      {
        number: 4,
        title: "A Dieta como Castigo",
        description: "Privar-te para te redimires.",
        subLessons: [
          { letter: "A", title: "Restringir para controlar", description: "Quando a dieta é a única coisa que sentes que controlas." },
          { letter: "B", title: "O ciclo culpa-privação", description: "Comes, culpas-te, privar-te, cedes, culpas-te. O ciclo sem fim." },
          { letter: "C", title: "Comer sem regras", description: "A ideia assustadora de comer sem dieta. O que acontece?" },
        ],
        workbook: "Mapa do meu ciclo alimentar",
      },
      {
        number: 5,
        title: "A Comida como Amor",
        description: "O que a comida representou na tua família.",
        subLessons: [
          { letter: "A", title: "A cozinha da tua mãe", description: "A comida como linguagem de amor — e o que isso te ensinou." },
          { letter: "B", title: "Recusar comida é recusar amor", description: "Quando dizer 'não, obrigada' à mesa é sentido como rejeição." },
          { letter: "C", title: "Separar comida de afecto", description: "Aprender a receber amor de formas que não passam pelo prato." },
        ],
        workbook: "A história da comida na minha família",
      },
      {
        number: 6,
        title: "O Corpo como Casa",
        description: "Habitar em vez de punir.",
        subLessons: [
          { letter: "A", title: "Viver no corpo", description: "A diferença entre viver no corpo e viver contra o corpo." },
          { letter: "B", title: "Ouvir a fome real", description: "Reaprender os sinais: fome, saciedade, prazer, rejeição." },
          { letter: "C", title: "Mover por prazer", description: "Movimento como celebração do corpo, não como castigo." },
        ],
        workbook: "Práticas de escuta corporal",
      },
      {
        number: 7,
        title: "Comer com Presença",
        description: "O prato como espelho.",
        subLessons: [
          { letter: "A", title: "Comer devagar", description: "O acto radical de comer com atenção." },
          { letter: "B", title: "O prazer sem culpa", description: "Comer chocolate sem tribunal interno. Comer pão sem remorso." },
          { letter: "C", title: "A refeição como ritual", description: "Transformar a refeição num momento de presença, não de guerra." },
        ],
        workbook: "Diário de refeições conscientes",
      },
      {
        number: 8,
        title: "A Paz com o Prato",
        description: "Quando a comida deixa de ser luta.",
        subLessons: [
          { letter: "A", title: "O corpo que já não é inimigo", description: "Quando olhas para o espelho e o que vês é suficiente." },
          { letter: "B", title: "A fome que sabe o que quer", description: "Quando a fome já não é confusa — é clara, simples, tua." },
          { letter: "C", title: "A mulher que come em paz", description: "Sem guerra. Sem culpa. Sem tribunal. Só comida, corpo e presença." },
        ],
        workbook: "Carta ao meu corpo e ao meu prato",
      },
    ],
    youtubeHooks: [
      { title: "O que procuras no frigorífico à meia-noite", durationMin: 7 },
      { title: "A guerra com o espelho que ninguém admite", durationMin: 6 },
      { title: "Porque a dieta nunca funciona de verdade", durationMin: 8 },
    ],
  },
];

export function getCourseBySlug(slug: string): CourseData | undefined {
  return COURSES.find((c) => c.slug === slug);
}

export function getAllCourses(): CourseData[] {
  return COURSES;
}

export function getAllCourseSlugs(): CourseSlug[] {
  return COURSES.map((c) => c.slug);
}

export { COURSES };
export default COURSES;
