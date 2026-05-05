/**
 * Scripts das aulas, Ouro Proprio
 *
 * Curso 1: A relação com dinheiro como espelho de ti
 * Territorio: A Casa dos Espelhos Dourados
 *
 * INSTRUCOES PARA ESCRITA:
 * - Ler course-guidelines.ts para tom e estrutura
 * - Cada sub-aula tem 5 seccoes (pergunta, situação, revelacao, gesto, frase)
 * - Tom: calmo, proximo, filosofico. Fala a "tu". Corpo como referencia.
 * - NUNCA usar: "veu", "espelho", "no" como conceito
 * - NUNCA usar frases listadas em TONE_GUIDELINES.forbidden
 * - Vida real, não teoria. Terca-feira, não transcendencia.
 *
 * STATUS: draft → approved → produced
 * Actualizar status apos revisao da Vivianne.
 */

export type ScriptStatus = "not_started" | "draft" | "approved" | "produced";

export type LessonScript = {
  moduleNumber: number;
  subLetter: string;
  title: string;
  perguntaInicial: string;
  situacaoHumana: string;
  revelacaoPadrao: string;
  gestoConsciencia: string;
  fraseFinal: string;
  status: ScriptStatus;
  notes?: string; // notas de revisao da Vivianne
};

export const OURO_PROPRIO_SCRIPTS: Record<string, LessonScript> = {
  // ─── MODULO 1: O Extracto como Espelho ──────────────────────────────────

  m1a: {
    moduleNumber: 1,
    subLetter: "A",
    title: "O medo de olhar",
    perguntaInicial:
      "Quando foi a última vez que abriste o teu extracto bancário sem aperto no peito? Sem desviar o olhar. Sem fechar a app depressa. Quando foi a última vez que olhaste para os teus números como quem olha para a propria cara, sem medo do que ia encontrar?",
    situacaoHumana:
      "E segunda-feira a noite. Estas no sofa. O telefone está ali, a distância de um gesto. Sabes que a notificacao do banco chegou há três dias. Ainda não abriste. Não porque não tenhas tempo, tens. Não porque não saibas, sabes mais ou menos o que está la. Não abres porque há algo no corpo que trava. Uma especie de aperto entre o estômago e o peito, como se abrir aquele ecra fosse abrir uma porta que preferias manter fechada. Entao fazes outra coisa. Abres o Instagram. Respondes a uma mensagem. Verificas o email do trabalho. Tudo menos aquilo. E a conta continua ali, fechada, a espera. Como se os números pudessem desaparecer se não olhares para eles.",
    revelacaoPadrao:
      "O que está a acontecer não e preguica. Não e desorganizacao. E proteccao. O teu corpo aprendeu, em algum momento, que olhar para o dinheiro doi. Que os números não são neutros, são um veredicto. Se o saldo está baixo, diz algo sobre ti. Se está alto, também diz, e talvez te assuste de outra forma. Algures, associaste dinheiro a julgamento. E agora, cada vez que abres o extracto, não estas a ler números. Estas a ler uma sentenca sobre o teu valor. E quem quer ler a propria sentenca a segunda-feira a noite?",
    gestoConsciencia:
      "Está semana, escolhe um momento calmo. Abre o extracto bancário, pode ser do mes passado, não precisa ser o de hoje. Antes de ler os números, poe a mao no peito. Respira. E depois le. Devagar. Sem fazer contas de cabeca, sem planear nada, sem corrigir nada. Apenas le. E nota: o que aparece no corpo? Onde? Não precisas de resolver nada. Só olhar.",
    fraseFinal:
      "O dinheiro não e o problema. O medo de olhar e que te mantem presa.",
    status: "draft",
  },

  m1b: {
    moduleNumber: 1,
    subLetter: "B",
    title: "Ler o extracto como um diario",
    perguntaInicial:
      "Se alguem lesse o teu extracto bancário sem saber quem es, o que diria sobre a pessoa que fez aquelas escolhas? Que história contam os teus gastos sobre aquilo que realmente te importa?",
    situacaoHumana:
      "Olha para o extracto do último mes. Não para os totais, para as linhas. Uma a uma. Cafe no sitio do costume: 1,20. Supermercado, sexta a noite: 47,83. Transferencia para a tua mae: 50. Uber de madrugada: 12,40. Presente para a amiga que fez anos: 35. Medicamento na farmacia: 8,60. Cada linha e um dia. Cada dia e uma decisão que tomaste sem pensar. Ninguem olha para o extracto assim, como quem le um diario. Mas e exactamente isso que ele e. Um registo honesto de onde poes a tua atenção, a tua energia, o teu cuidado. E também: onde não poes.",
    revelacaoPadrao:
      "Quando les o extracto como um diario, comecas a notar coisas que a calculadora não mostra. Há meses em que gastas muito nos outros e quase nada em ti. Há semanas em que os gastos pequenos se acumulam, não por necessidade, mas por compensacao. Aquele café depois da reuniao dificil. A encomenda online as duas da manha, quando não conseguias dormir. A comida de fora porque não tinhas energia para cozinhar. Não há nada de errado com nenhuma destas coisas. Mas quando as ves juntas, comecas a perceber: há um padrao. E o padrao não e financeiro, e emocional. Gastas de uma certa forma quando estas cansada. De outra quando tens medo. De outra quando te sentes sozinha. O extracto não mente. Tu podes mentir a ti mesma, ele não.",
    gestoConsciencia:
      "Imprime ou copia o extracto do último mes. Pega numa caneta. Ao lado de cada gasto, escreve uma única palavra: o que sentias quando fizeste aquela compra. Não o que estavas a fazer, o que sentias. Cansaco. Alivio. Culpa. Prazer. Obrigacao. Solidao. Não precisas de mudar nada. Só de ler a história que o dinheiro conta sobre ti.",
    fraseFinal:
      "O teu extracto já sabe o que sentes. A questao e se tu também sabes.",
    status: "draft",
  },

  m1c: {
    moduleNumber: 1,
    subLetter: "C",
    title: "O corpo e o dinheiro",
    perguntaInicial:
      "Onde e que o dinheiro vive no teu corpo? Se te perguntasse agora, onde sentes o dinheiro?, para onde iria a tua atenção? Para o estômago? Para o peito? Para os ombros? Para a garganta?",
    situacaoHumana:
      "Estas no restaurante com amigos. A conta chega. Alguem diz: dividimos? E naquele segundo, antes de qualquer calculo, antes de qualquer palavra, há uma reaccao no teu corpo. Talvez um aperto no estômago. Talvez um calor na cara. Talvez os ombros que sobem. Talvez a mandibula que cerra. Dizes que sim, claro, dividimos. Mas o corpo já disse outra coisa. O corpo reagiu ao dinheiro antes de tu teres tido tempo de pensar. E isto acontece mais vezes do que imaginas. No supermercado, quando pos o artigo de volta na prateleira. Na loja, quando viras a etiqueta ao contrario para ninguem ver o preco. Quando recebes o salario e o alivio dura exactamente três segundos antes da lista de contas aparecer.",
    revelacaoPadrao:
      "O dinheiro não e abstracto. Nunca foi. Mesmo que a tua mente finja que e só matematica, cada decisão financeira passa pelo corpo primeiro. E o corpo guarda tudo: a vez que ouviste os teus pais a discutir por causa de dinheiro. A vez que pediste algo e te disseram que não havia. A vez que viste vergonha no rosto de alguem que amas por causa de uma conta. Essas memorias não ficaram na cabeca, ficaram nos músculos, na respiracao, na postura. E agora, cada vez que o dinheiro aparece, a reaccao chega antes do pensamento. Antes da razão. Antes da calculadora. Antes de ti. Se não reconheces essa reaccao, não estas a tomar decisões financeiras. Estas a obedecer a memorias antigas.",
    gestoConsciencia:
      "Na proxima vez que pagares algo, qualquer coisa, um café, uma conta, uma compra online, para um segundo antes. Poe uma mao na barriga. Onde está a tensao? Onde está o alivio? Há aperto ou há expansao? Respira. Fica com o que sentires sem tentar muda-lo. Faz isto três vezes está semana. Ao terceiro dia, vais começar a reconhecer algo que sempre esteve la, mas que nunca teve nome.",
    fraseFinal:
      "O teu corpo tem uma relação com o dinheiro. E mais antiga do que qualquer conta bancária.",
    status: "draft",
  },

  // ─── MODULO 2: A Heranca Financeira Emocional ───────────────────────────

  m2a: {
    moduleNumber: 2,
    subLetter: "A",
    title: "Os scripts de infancia",
    perguntaInicial:
      "Qual e a primeira frase sobre dinheiro que te lembras de ouvir em casa? Não a mais importante, a primeira. A que aparece quando fechas os olhos e pensas: dinheiro, na minha casa, era assim.",
    situacaoHumana:
      "Tinhas sete, talvez oito anos. Estavas na cozinha, ou no corredor, ou no banco de tras do carro. E alguem disse uma frase. Talvez fosse a tua mae: o dinheiro não chega para tudo. Talvez fosse o teu pai: na minha casa ninguem passa fome. Talvez ninguem dissesse nada, e o silêncio já era a frase. Tu não estavas a prestar atenção. Estavas a brincar, ou a comer, ou a olhar pela janela. Mas o teu corpo ouviu. E guardou. Anos depois, quando o teu salario entra e tu pensas automaticamente que não vai chegar, não es tu a pensar. E aquela frase. Quando alguem te oferece algo e tu recusas antes de considerar, não es tu a recusar. E a voz de alguem que já nem se lembra de ter falado.",
    revelacaoPadrao:
      "Antes dos dez anos, absorves frases como verdades absolutas. Não as questionas porque não tens com que comparar. O dinheiro e dificil. Quem tem dinheiro e diferente de nos. Não se fala de dinheiro. Dinheiro não da em arvores. Temos que poupar para o que vem. Estas frases não são conselhos, são instruções de funcionamento. E tu seguiste-as. Sem saber. Sem escolher. A tua relação com dinheiro não começou quando abriste a primeira conta bancária. Comecou na cozinha da tua infancia, com frases que nem te lembras de ter ouvido.",
    gestoConsciencia:
      "Pega num papel. Escreve, sem pensar muito, as cinco primeiras frases sobre dinheiro que te veem a cabeca quando pensas na tua infancia. Não precisam de ser exactas, podem ser sensacoes traduzidas em palavras. Depois le-as em voz alta. Devagar. E pergunta: ainda acredito nisto? Ainda quero que isto me guie?",
    fraseFinal:
      "Metade do que acreditas sobre dinheiro não e teu. Foi-te dado antes de saberes recusar.",
    status: "draft",
  },

  m2b: {
    moduleNumber: 2,
    subLetter: "B",
    title: "O que viste vs. o que ouviste",
    perguntaInicial:
      "Na tua casa, o que se dizia sobre dinheiro era igual ao que se fazia? Ou havia uma distância entre as palavras e os gestos, uma distância que tu sentias no corpo sem conseguir nomear?",
    situacaoHumana:
      "A tua mae dizia: não precisamos de coisas caras. Mas notavas como olhava para a montra quando passavam por aquela loja. O teu pai dizia: o dinheiro não e importante. Mas via-lo contar as notas na carteira antes de sair, sempre com aquele vinco entre as sobrancelhas. Diziam-te: não te preocupes com isso. Mas a preocupacao estava em todo o lado, na conversa que baixava de tom quando entravas na sala, no suspiro antes de abrir as cartas, na tensao a mesa quando alguem pedia mais. Tu aprendeste duas coisas ao mesmo tempo: a versao oficial e a versao verdadeira. E como ninguem te explicou a diferenca, ficaste com as duas. Até hoje, quando alguem te diz que dinheiro não importa, algo dentro de ti reconhece a mentira. Mas a tua boca repete a frase.",
    revelacaoPadrao:
      "As criancas não aprendem o que lhes dizem. Aprendem o que veem. Se o teu pai dizia que dinheiro não era problema mas vivia tenso por causa dele, tu aprendeste: o dinheiro e um problema que se esconde. Se a tua mae dizia que era preciso poupar mas comprava coisas as escondidas, tu aprendeste: gastar e culpa, e a culpa esconde-se. Estas contradicoes não te confundiram, programaram-te. Deram-te duas instruções simultaneas que se anulam. Ganha dinheiro, mas não o mostres. Poupa, mas não sejas avarenta. Quer mais, mas não sejas ambiciosa. E tu ficas paralisada no meio. Não por falta de vontade. Por excesso de instruções contraditorias.",
    gestoConsciencia:
      "Faz duas colunas num papel. Na esquerda, escreve: o que se dizia sobre dinheiro em casa. Na direita: o que eu via acontecer. Preenche as duas. Depois olha para as diferencas. Não para julgar ninguem, para perceber de onde vem a tua confusao. Para perceber que a paralisia não e tua. E herdada.",
    fraseFinal:
      "Tu não estas confusa sobre dinheiro. Estas a seguir duas instruções que se contradizem.",
    status: "draft",
  },

  m2c: {
    moduleNumber: 2,
    subLetter: "C",
    title: "Reescrever os scripts",
    perguntaInicial:
      "Se pudesses escolher, agora, hoje, com tudo o que sabes, que frase sobre dinheiro gostarias de ter ouvido em crianca? Que frase te teria dado mais espaco?",
    situacaoHumana:
      "Imagina que estas sentada a mesa da tua cozinha de infancia. Mas agora es tu a adulta. E a crianca que foste está sentada a tua frente, a olhar para ti com os olhos de quem ainda não decidiu o que acreditar. Ela ainda não sabe se o dinheiro e perigoso ou seguro. Se querer mais e ganancia ou e saudavel. Se falar de dinheiro e permitido ou proibido. Ela está a espera. O que lhe dizes? Talvez algo que ninguem te disse a ti. Talvez: podes querer coisas boas e continuar a ser boa pessoa. Talvez: o dinheiro e uma ferramenta, não uma sentenca. Talvez: não precisas de ter medo disto. Talvez: eu também estou a aprender.",
    revelacaoPadrao:
      "Não podes voltar atras e mudar o que ouviste. Mas podes fazer uma coisa que ninguem fez por ti: escolher conscientemente o que fica e o que vai. Os scripts de infancia não são destino, são ponto de partida. Alguns servem-te: talvez o cuidado, a atenção, o respeito pelo que se tem. Outros prendem-te: o medo, a vergonha, o silêncio. A diferenca entre repetir um padrao e escolher uma direcao está aqui: na consciência. Enquanto não nomeias o que herdaste, ages no automático. Quando nomeias, podes decidir. Não tens de rejeitar tudo. Não tens de honrar tudo. Tens de escolher.",
    gestoConsciencia:
      "Pega nas frases que escreveste nos exercícios anteriores, as que ouviste em casa. Escolhe uma que já não te serve. Escreve-a num papel. Debaixo, escreve a frase que escolhes para a substituir. Não precisa de ser perfeita, precisa de ser tua. Cola-a num sitio onde a vejas todos os dias está semana. No frigorifico. No espelho da casa de banho. Deixa-a entrar devagar.",
    fraseFinal:
      "A heranca não se apaga. Escolhe-se. E escolher já e liberdade.",
    status: "draft",
  },

  // ─── MODULO 3: A Vergonha do Dinheiro ───────────────────────────────────

  m3a: {
    moduleNumber: 3,
    subLetter: "A",
    title: "Vergonha de não ter",
    perguntaInicial:
      "Já inventaste uma desculpa para não ir a um jantar porque não querias que vissem que não podias pagar? Já disseste que não te apetecia quando, na verdade, não tinhas como?",
    situacaoHumana:
      "O grupo de amigas combina um jantar num restaurante novo. Tu ves o preco no Instagram e o estômago contrai. Não e fome. E vergonha. Sabes que se fores, vais ter de escolher o prato mais barato e fingir que era o que querias. Ou vais dividir a conta por igual e ficar sem dinheiro para o resto da semana. Entao dizes: hoje não posso, tenho um compromisso. E ficas em casa. Sozinha. Com a vergonha intacta. Porque a vergonha não era do jantar. Era de não ter. E não ter, nesta história que carregas, significa não ser suficiente. Já fizeste isto com viagens. Com presentes. Com o dentista que adias. Com o curso que querias fazer. Cada vez que dizes não por vergonha, a vergonha cresce. Porque a confirmaste.",
    revelacaoPadrao:
      "A vergonha de não ter não e sobre dinheiro. E sobre pertenca. Quando não tens o que os outros tem, o corpo sente que não pertences. Que es de fora. Que há um clube ao qual não tens acesso, e o bilhete de entrada e o saldo da tua conta. Está vergonha e silenciosa. Ninguem fala dela. Ninguem diz: tenho vergonha de ser pobre. Ninguem diz: tenho vergonha de não conseguir pagar o jantar. Porque a propria vergonha tem vergonha de si mesma. E entao esconde-se. Atras de desculpas. Atras de silêncio. Atras de uma vida mais pequena do que precisava de ser. E o mais cruel: a vergonha faz-te sentir que mereces a vida pequena. Que e o teu lugar.",
    gestoConsciencia:
      "Da proxima vez que sentires aquele aperto, o da vergonha financeira, o que te faz inventar uma desculpa, para. Antes de responder. Poe os pés bem assentes no chao. Sente o peso do teu corpo na cadeira ou no chao. E pergunta-te: o que e que eu diria se não tivesse vergonha? Não precisas de dizer. Só de saber. Saber a resposta verdadeira já e diferente de fugir dela.",
    fraseFinal:
      "A vergonha de não ter faz-te viver menos. E viver menos nunca resolveu a falta.",
    status: "draft",
  },

  m3b: {
    moduleNumber: 3,
    subLetter: "B",
    title: "Vergonha de querer mais",
    perguntaInicial:
      "Já te sentiste culpada por querer ganhar mais dinheiro? Já pensaste: devia ser grata pelo que tenho, e usaste a gratidao como forma de calar o desejo?",
    situacaoHumana:
      "Estas numa conversa com alguem, uma amiga, uma irma, uma colega. E surge o assunto. Ela fala dos seus planos: quer mudar de casa, quer investir, quer crescer. E tu sentes uma coisa estranha. Não e inveja, e mais subtil. E uma voz que diz: eu também quero. Mas logo atras vem outra: quem es tu para querer mais? Tens tecto. Tens comida. Há gente que não tem nada. O que e que te falta? E engoles o desejo. Mudas de assunto. Dizes: eu estou bem assim. Mas não estas. Há algo dentro de ti que sabe que querer mais não e ganancia. Que sabe que podes ser grata e ambiciosa ao mesmo tempo. Mas essa voz, a que te permite querer, foi silenciada tantas vezes que já quase não a ouves.",
    revelacaoPadrao:
      "Há um pacto silencioso que muitas mulheres fazem sem saber: para ser boa, tens de querer pouco. Para ser humilde, tens de te contentar. Para ser decente, tens de não ambicionar demais. Este pacto não foi escrito, foi sentido. Sentiste-o quando a tua mae se sacrificou e foi elogiada por isso. Quando viste mulheres ambiciosas serem chamadas frias, calculistas, egoistas. Quando aprendeste que querer para ti era tirar aos outros. Mas isto e mentira. Uma mentira comoda para quem beneficia de mulheres que não pedem. Querer mais não e ingratidao. Querer mais e ouvir-te. E há uma diferenca enorme entre ganancia e permissao. Ganancia e querer sem fim. Permissao e dizer: eu também posso.",
    gestoConsciencia:
      "Fecha os olhos. Respira fundo. E diz, em voz alta, devagar: eu quero mais. Só isso. Eu quero mais. Repara no que acontece. Encolheste os ombros? Baixaste a voz? Olhaste a volta para ver se alguem ouviu? Agora diz outra vez. Mais devagar. Sem pedir desculpa. Se a vergonha vier, deixa-a estar. Não es tu a vergonha. Es tu a dizer a verdade.",
    fraseFinal:
      "A vergonha de querer mais protege um mundo que nunca te protegeu a ti.",
    status: "draft",
  },

  m3c: {
    moduleNumber: 3,
    subLetter: "C",
    title: "Dinheiro e dignidade",
    perguntaInicial:
      "Alguma vez sentiste que o teu valor como pessoa dependia do número na tua conta? Que eras mais ou menos digna conforme o que tinhas, ou não tinhas?",
    situacaoHumana:
      "Foste a uma consulta. Ou a uma loja. Ou a uma reuniao. E algo na forma como te olharam mudou quando perceberam que não tinhas tanto quanto pensavam. Talvez tenha sido subtil, um tom de voz, um olhar, uma pausa a mais. Talvez tenha sido explicito. Mas sentiste. No corpo, sentiste. Uma contraccao. Uma vontade de te fazer mais pequena. Ou o contrario: uma vontade de provar que es mais do que a tua carteira. Compraste algo que não precisavas para não parecer que não podias. Ou ficaste calada quando devias ter falado porque sentiste que não tinhas crédito, não financeiro, mas humano. Como se o dinheiro fosse uma lingua e tu estivesses a falar com sotaque.",
    revelacaoPadrao:
      "Vivemos num mundo que confunde valor economico com valor humano. Não e suposto, mas e assim que funciona. E tu absorveste isso. Não porque sejas fraca, mas porque e quase impossivel não absorver. Quando toda a gente a tua volta trata o dinheiro como medida de competencia, de inteligencia, de merecimento, o corpo aprende: quanto tenho e quanto valho. Mas isto e uma ilusao. Uma ilusao poderosa, porque toda a gente acredita nela. Separar o teu valor do teu saldo e um dos actos mais dificeis e mais necessarios que podes fazer. Não porque o dinheiro não importa, importa. Mas porque tu importas independentemente dele. A tua dignidade não tem cifrao.",
    gestoConsciencia:
      "Completa está frase por escrito: eu valho o mesmo quando tenho muito e quando tenho pouco porque... Le a tua resposta. Se não acreditares nela, tudo bem. Escreve-a na mesma. Escreve-a todos os dias desta semana. Não porque repetir mude tudo, mas porque começar a ouvir-te e o primeiro passo para te acreditares.",
    fraseFinal:
      "O teu valor não e um número. Nunca foi.",
    status: "draft",
  },

  // ─── MODULO 4: Cobrar, Receber, Merecer ────────────────────────────────

  m4a: {
    moduleNumber: 4,
    subLetter: "A",
    title: "O desconto automático",
    perguntaInicial:
      "Quando foi a última vez que deste desconto no teu trabalho antes de alguem pedir? Quando foi a última vez que baixaste o preco, não porque era justo, mas porque sentiste que não podias pedir o valor inteiro?",
    situacaoHumana:
      "Alguem te pede um orcamento. Pelo teu trabalho, pela tua consultoria, pelo teu tempo, pelo produto que fizeste. Tu sabes quanto vale. Fizeste as contas. E um número justo. Mas na hora de escrever o valor, a mao treme. Não literalmente, mas algo dentro de ti hesita. E antes de enviar, tiras um bocado. Só um pouco. Para não assustar. Para não parecer demais. Para não ouvir não. O desconto já estava dado antes de a outra pessoa abrir a boca. Ninguem regateou. Ninguem pressionou. Foste tu. Tu e a voz que diz: se pedir o valor inteiro, vao achar que não valho tanto. Ou pior: vao perceber que não valho tanto. Entao baixas. E cada vez que baixas, o corpo aprende que e assim que se faz. Que o teu preco real e demasiado. Que precisas de ser mais barata para ser escolhida.",
    revelacaoPadrao:
      "O desconto automático não e generosidade. E medo disfarçado. Medo de rejeicao, medo de confronto, medo de ocupar espaco com o teu valor. E muitas vezes vem de um lugar antigo: a ideia de que pedir o que mereces e arrogancia. Que cobrar bem e ganancia. Que ser acessivel e o mesmo que ser barata. Mas não e. Acessibilidade e uma escolha consciente. Desconto automático e uma reaccao ao medo. E há uma diferenca enorme entre as duas coisas. Uma vem da generosidade. A outra vem da falta de permissao. Quando baixas o preco por medo, não estas a ser generosa, estas a dizer ao mundo e a ti mesma que o teu valor e negociavel. E o mundo aceita. O mundo aceita sempre o desconto que ofereces.",
    gestoConsciencia:
      "Na proxima vez que tiveres de dizer um preco, qualquer preco, mesmo que não seja profissional, nota o momento exacto em que a vontade de baixar aparece. Não baixas. Não sobes. Apenas nota. Sente onde isso vive: no peito? Na garganta? Nas maos? Depois, diz o número. O número que realmente querias dizer. E ve o que acontece. Não no outro, em ti.",
    fraseFinal:
      "O desconto que ninguem te pediu e a medida exacta do quanto ainda não te permites valer.",
    status: "draft",
  },

  m4b: {
    moduleNumber: 4,
    subLetter: "B",
    title: "A ligacao cobrar-merecer",
    perguntaInicial:
      "Já reparaste que cobrar e merecer, para ti, são a mesma coisa? Que quando sentes que não mereces, não consegues cobrar, e quando não cobras, confirmas que não mereces?",
    situacaoHumana:
      "Fizeste um trabalho excelente. Sabes que ficou bom. O cliente também sabe, agradeceu, elogiou, disse que superaste as expectativas. Chega o momento de cobrar. E algo emperra. Não e o valor, o valor está definido. E o acto de dizer: paga-me. Há uma resistencia quase fisica. Como se cobrar fosse rude. Como se pedir o que e teu fosse pedir demais. Entao esperas. Mandas a factura com um pedido de desculpa embutido: quando puderes. Sem pressa. A tua conveniencia. Usas palavras suaves para suavizar o facto de que estas a pedir dinheiro pelo teu trabalho. E se a pessoa demora a pagar, não cobras de novo. Esperas. Porque cobrar uma vez já custou. Cobrar duas seria demais.",
    revelacaoPadrao:
      "Cobrar não e um acto financeiro. E um acto de identidade. Quando não cobras o que vale, não e porque não saibas o valor, e porque não sentes que tens direito a ele. Há uma parte de ti que ainda acredita que receber e um privilegio, não um direito. Que o dinheiro e algo que se ganha por merito excepcional, não pelo simples facto de teres dado algo de valor. Está crenca cria um ciclo: não cobras porque não sentes que mereces. Não recebes porque não cobras. E como não recebes, confirmas a crenca: vês, não era para mim. Mas a crenca veio primeiro. O resultado e só a prova que ela inventou.",
    gestoConsciencia:
      "Pensa no último trabalho que fizeste e que sentiste dificuldade em cobrar. Escreve: este trabalho vale X porque... Preenche com razoes concretas. Tempo, competencia, resultado, dedicacao. Le a lista. Le-a como se fosse de outra pessoa. Estarias confortavel a pagar este valor a outra pessoa? Se sim, o problema não e o valor. E a permissao.",
    fraseFinal:
      "Cobrar o que vale não e pedir demais. E tratar-te como tratas os outros.",
    status: "draft",
  },

  m4c: {
    moduleNumber: 4,
    subLetter: "C",
    title: "Receber sem devolver imediatamente",
    perguntaInicial:
      "Quando alguem te da algo, um presente, um elogio, uma ajuda, qual e o teu primeiro impulso? Receber? Ou devolver imediatamente para não ficar a dever?",
    situacaoHumana:
      "Uma amiga paga-te o almoco. Tu dizes: não, deixa, eu pago o meu. Ela insiste. Tu aceitas, mas já estas a calcular quando vais poder retribuir. Na semana seguinte pagas o café, o almoco e o estacionamento, para ficar quite. Alguem te oferece um presente caro. Agradeces, mas o pensamento imediato e: tenho de lhe dar algo a altura. Não depois, agora. O teu chefe da-te um bonus. Em vez de sentir: mereco isto, sentes: agora vou ter de trabalhar o dobro para justificar. Nunca estas só a receber. Estas sempre a compensar. Cada coisa que te dao abre uma conta no teu corpo, e o teu corpo não descansa até a fechar. Como se receber criasse uma divida. Como se aceitar fosse perigoso.",
    revelacaoPadrao:
      "A dificuldade de receber não e educação, e proteccao. Algures aprendeste que receber te coloca em posicao de vulnerabilidade. Que quem da tem poder. Que ficar a dever e ficar em perigo. Talvez na tua família receber vinha com condicoes. Talvez a generosidade era uma moeda de troca. Talvez alguem te deu algo e depois usou isso contra ti. E ficou gravado: receber não e seguro. E agora, cada vez que algo bom chega, a tua primeira reaccao não e prazer, e calcular o custo. Isto estende-se ao dinheiro de forma directa: se não consegues receber um presente sem angustia, como vais receber um aumento? Uma proposta melhor? Uma oportunidade que não pediste? Receber e uma capacidade. E pode estar atrofiada.",
    gestoConsciencia:
      "Está semana, quando alguem te der algo, um elogio, um café, uma ajuda, experimenta só dizer: obrigada. Sem adicionar nada. Sem oferecer nada de volta. Sem justificar. Só obrigada. Sente o desconforto. Fica com ele. Não o resolvas. Deixa o corpo aprender que receber não e divida.",
    fraseFinal:
      "Receber não e ficar a dever. E deixar entrar o que já era teu.",
    status: "draft",
  },

  // ─── MODULO 5: Gastar em Ti ─────────────────────────────────────────────

  m5a: {
    moduleNumber: 5,
    subLetter: "A",
    title: "A hierarquia dos gastos",
    perguntaInicial:
      "Se olhares para os teus gastos do último mes, onde e que tu apareces? No topo da lista, ou no fim, depois de todos os outros?",
    situacaoHumana:
      "Compras roupa nova para os filhos sem pensar. Pagas a mensalidade do ginasio do teu parceiro. Ofereces presentes generosos. Contribuis para jantares. Mas quando e para ti, aquele livro, aquele creme, aquele curso, aquela consulta, hesitas. Não porque não tenhas dinheiro. Mas porque há sempre algo mais urgente, mais importante, mais justificavel. O teu nome está no fundo da lista. Depois da renda. Depois das contas. Depois da escola das criancas. Depois do carro. Depois dos imprevistos. Depois de tudo. Se sobrar, e quase nunca sobra, talvez. Não e que te esquecas de ti. E que te habituaste a vir depois. E a vir depois tornou-se tão natural que já nem notas. Já nem sentes que falta alguma coisa. Até que um dia o corpo reclama. Cansaco que não passa. Irritacao sem causa. Uma tristeza mansa que não sabes de onde vem.",
    revelacaoPadrao:
      "A hierarquia dos teus gastos e um mapa da tua importancia propria. Não e o que dizes sobre ti mesma, e o que fazes. E o que fazes, repetidamente, e colocar-te em último lugar. Isto não e generosidade, e um padrao. Um padrao que te foi ensinado, não escolhido. Muitas mulheres aprendem desde cedo que cuidar de si e egoismo. Que gastar em si e frivolidade. Que o bom e dar. E entao dao. Até não terem mais nada para dar. E quando chegam a esse ponto, vazias, cansadas, ressentidas, sentem culpa por estarem cansadas. Porque até o cansaco lhes parece egoismo. A hierarquia dos gastos não e só financeira. E um retrato da permissao que te das para existir.",
    gestoConsciencia:
      "Está semana, gasta dinheiro em ti. Não muito, não precisa de ser caro. Mas algo que seja só teu. Que não tenha funcao para mais ninguem. Um café diferente. Um livro. Um banho de espuma com um produto que cheira bem. Paga sem justificar. Sem calcular se mereces. Nota como o corpo reage. Se aparecer culpa, não a empurres. Nota-a. E gasta na mesma.",
    fraseFinal:
      "O lugar onde te poes na lista dos teus gastos e o lugar onde te poes na tua propria vida.",
    status: "draft",
  },

  m5b: {
    moduleNumber: 5,
    subLetter: "B",
    title: "Culpa e prazer",
    perguntaInicial:
      "Quando gastas dinheiro em algo que te da prazer, prazer real, sem funcao pratica, quanto tempo demora até a culpa aparecer? Segundos? Minutos? Ou chega antes, e impede-te de comprar?",
    situacaoHumana:
      "Compraste aquele vestido. Ou aqueles sapatos. Ou aquela viagem. Algo que não era necessario. Algo que era bonito, que te fez sentir bem, que era só para ti. E sentiste prazer. Por um momento. Depois veio a culpa. Podia ter guardado este dinheiro. Não precisava mesmo disto. Há coisas mais importantes. A culpa não veio de fora, ninguem te criticou. Veio de dentro. De um lugar automático que diz: prazer e desperdicio. Gastar em ti e frivolidade. Merecimento tem de ser ganho, não comprado. E entao fizeste uma de duas coisas: ou devolveste o que compraste, ou ficaste com ele mas sem conseguir aproveitar. Porque a culpa sentou-se ao lado do prazer e não saiu mais.",
    revelacaoPadrao:
      "A culpa que sentes quando gastas em prazer não e sobre o dinheiro. E sobre a permissao. Algures aprendeste que o prazer tem de ser justificado. Que gastar em ti só e aceitavel se for util, um curso, uma ferramenta, algo que te torne mais produtiva. Prazer puro, sem funcao, sem justificacao, sem retorno, esse e perigoso. E este e o padrao mais silencioso: não e que não tenhas dinheiro para prazer. E que não te permites ter prazer com o dinheiro. A culpa e a guarda que fica a porta. Cada vez que tentas entrar, ela pede-te a justificacao. E se não tens uma boa o suficiente, não entras. O resultado e uma vida funcional. Eficiente. Util. E seca. Uma vida onde tudo serve para alguma coisa menos para ti.",
    gestoConsciencia:
      "Compra algo está semana que seja só bonito. Que não sirva para nada. Que não tenhas de justificar a ninguem, nem a ti. Pode ser pequeno. Uma flor. Uma vela. Um chocolate bom. Quando a culpa vier, e vai vir, não a combatas. Diz-lhe: eu sei que estas ai. Mas hoje estou a praticar prazer. E depois fica com o que compraste. Sem devolver. Sem compensar.",
    fraseFinal:
      "O prazer não precisa de justificacao. Se precisasse, não seria prazer.",
    status: "draft",
  },

  m5c: {
    moduleNumber: 5,
    subLetter: "C",
    title: "O investimento em ti como acto politico",
    perguntaInicial:
      "E se gastar dinheiro em ti não fosse egoismo, mas a decisão mais quieta e mais importante que podes tomar por ti mesma?",
    situacaoHumana:
      "Estas a pensar em investir em algo para ti. Um curso. Uma terapia. Uma formacao. Uma mudanca. Mas o pensamento vem logo: isto e caro. Seguido de: há coisas mais urgentes. Seguido de: quem sou eu para gastar isto em mim? E adias. Mais um mes. Mais um trimestre. Mais um ano. Enquanto isso, pagas a formacao de outra pessoa. Investes no negocio de outra pessoa. Apoias o sonho de outra pessoa. E o teu fica no fundo da gaveta, com o rotulo de luxo. Porque algures decidiste que investir nos outros e nobre, mas investir em ti e excesso. Que quando se trata dos outros, o dinheiro e investimento. Quando se trata de ti, e gasto.",
    revelacaoPadrao:
      "Quando uma mulher investe em si, algo muda a sua volta. Não de forma espectacular, de forma quieta. Os limites ficam mais claros. As escolhas ficam mais honestas. A energia muda. Não porque o dinheiro tenha poderes, mas porque a decisão de te incluir na tua propria vida muda a forma como habitas tudo o resto. Investir em ti não e egoismo. E a diferenca entre dar porque queres e dar porque te esqueceste de que também existes. Não es frivola por querer crescer. Não es egoista por te escolher. Es alguem que percebeu, talvez pela primeira vez, que não podes dar o que nunca te deste a ti mesma.",
    gestoConsciencia:
      "Pensa naquilo que tens adiado investir em ti. Agora levanta-te. Vai ao sitio da casa onde tomas decisões, a mesa, o sofa, o lugar onde te sentas quando precisas de pensar. Senta-te la. E diz em voz alta: isto e para mim. Não como declaracao, como ensaio. Como quem experimenta uma roupa nova. Repete se precisares. O gesto de te sentares, de ocupares espaco, de dizeres as palavras, já e investimento.",
    fraseFinal:
      "Quando investes em ti, não estas a gastar. Estas a decidir que existes.",
    status: "draft",
  },

  // ─── MODULO 6: Dinheiro e Relacoes ──────────────────────────────────────

  m6a: {
    moduleNumber: 6,
    subLetter: "A",
    title: "Quem paga, manda?",
    perguntaInicial:
      "Na tua relação, quem paga mais tem mais poder? Quem ganha mais decide mais? Há uma conta invisivel a correr entre voces, e quem está a ganhar?",
    situacaoHumana:
      "Ele paga o jantar. Ela escolhe o restaurante, mas dentro do orcamento dele. Ele paga a renda. Ela sente que não pode reclamar do apartamento porque não contribui com a mesma parte. Ela quer comprar algo. Ele não diz que não, mas ergue a sobrancelha. E ela guarda o cartao. Ninguem gritou. Ninguem proibiu. Ninguem disse: tu não decides. Mas há algo que registou tudo. Há uma assimetria que não está nos números, está nos gestos. Na pausa antes de comprar. No olhar antes de pedir. Na justificacao antes de gastar. Se ganhas menos, sentes que tens menos voz. Se não ganhas nada, sentes que não tens direito a voz nenhuma. Não porque te digam isso, mas porque o dinheiro fala uma lingua que o corpo entende sem traducao.",
    revelacaoPadrao:
      "Nas relações, o dinheiro nunca e só dinheiro. E poder. E seguranca. E controlo. E liberdade. Quem paga mais sente, mesmo sem querer, que decide mais. Quem recebe mais sente, mesmo sem razão, que deve mais. E cria-se uma dinamica invisivel: um que pode e outro que pede. Um que da e outro que agradece. Um que decide e outro que se adapta. Isto não e necessariamente intencional. Muitas vezes, quem paga mais nem sabe que está a exercer poder. E quem recebe mais nem sabe que está a ceder espaco. Mas tu sentes. Sentes cada vez que encolhes a tua vontade porque o dinheiro não e teu. E cada vez que engoles uma opiniao porque não pagas a tua parte.",
    gestoConsciencia:
      "Pensa na tua relação actual, ou na última. Quem paga mais? Quem decide mais? Há uma correlacao? Escreve dois momentos em que sentiste que o dinheiro influenciou quem tinha voz. Não para acusar ninguem, para ver a dinamica com clareza. Porque só o que se ve se pode mudar.",
    fraseFinal:
      "O dinheiro numa relação nunca e só dinheiro. E a linguagem silenciosa do poder.",
    status: "draft",
  },

  m6b: {
    moduleNumber: 6,
    subLetter: "B",
    title: "Dependencia financeira e medo",
    perguntaInicial:
      "Se a tua relação acabasse amanha, conseguirias pagar as tuas contas? Se a resposta te assusta, de onde vem o medo? Do dinheiro ou da solidao?",
    situacaoHumana:
      "Há mulheres que ficam em relações não por amor, mas por matematica. O apartamento está no nome dele. A poupanca e partilhada mas só um tem acesso. Se sair, vai para onde? Com que dinheiro? A conversa com as amigas e sobre sentimentos. Mas a noite, sozinha, a conta que se faz e financeira. Quanto custa a minha liberdade? As vezes a resposta e: mais do que tenho. Entao fica. Não porque queira, mas porque não pode. E cada dia que fica por não poder, perde um bocado de si mesma. Aos poucos. Como um gotejamento.",
    revelacaoPadrao:
      "A dependencia financeira não prende o corpo, prende a vontade. Não precisas de estar trancada para não sair. Basta não ter para onde ir. Está e a prisao mais invisivel: não tem grades. Tem contas. Tem rendas. Tem a vergonha de voltar para casa dos pais. Quando todo o teu mundo material depende de outra pessoa, sair não e uma mudanca, e um colapso. E muitas mulheres ficam exactamente aqui: com o suficiente para não sair, mas nunca com o suficiente para se sentir livres.",
    gestoConsciencia:
      "Faz uma conta simples, sozinha, em silêncio. Quanto precisas por mes para viver, só tu? Renda, comida, transporte, o básico. Agora olha para o que ganhas, ou para o que ganharias se voltasses a ganhar. Não e para tomar decisões agora. E para veres o número com clareza. Porque o medo odeia números concretos. O medo alimenta-se de vago, de talvez, de não sei. Quando sabes o número exacto, o medo perde metade da forca.",
    fraseFinal:
      "A liberdade não e um sentimento. E um número que precisas de conhecer.",
    status: "draft",
  },

  m6c: {
    moduleNumber: 6,
    subLetter: "C",
    title: "A conversa sobre dinheiro que evitas",
    perguntaInicial:
      "Há uma conversa sobre dinheiro que precisas de ter com alguem que amas. Sabes qual e. Há quanto tempo a adias?",
    situacaoHumana:
      "Pode ser com o teu parceiro: precisamos de falar sobre como dividimos as coisas. Pode ser com a tua mae: não posso continuar a pagar isto sozinha. Pode ser com uma amiga: não tenho condicoes de ir a esse sitio. Pode ser contigo mesma: preciso de ganhar mais. Sabes a conversa. Já a ensaiaste na cabeca dezenas de vezes. No chuveiro. No carro. A noite, antes de dormir. Tens as palavras. Tens os argumentos. Mas nunca e o momento certo. Nunca está tudo calmo o suficiente. Nunca tens a certeza de que não vai correr mal. E entao adias. Mais um dia. Mais uma semana. E a conversa que não tens torna-se um peso que carregas sozinha. Porque o problema não e só o dinheiro, e o silêncio que o dinheiro cria quando ninguem fala dele.",
    revelacaoPadrao:
      "A maioria das conversas sobre dinheiro que evitas não são sobre dinheiro. São sobre medo. Medo de conflito: e se a outra pessoa se zangar? Medo de vulnerabilidade: e se percebem que não tenho tanto quanto pensam? Medo de rejeicao: e se me acham mesquinha por levantar o assunto? O dinheiro e o último tabu. Podes falar de sexo, de morte, de saúde mental. Mas dinheiro? A conversa sobre dinheiro obriga-te a ser honesta sobre o que tens, o que não tens, o que precisas e o que sentes. E essa honestidade, para muita gente, e mais assustadora do que qualquer outro tema. Mas o custo de não falar e sempre maior do que o custo de falar. O silêncio não protege, acumula. Até ao dia em que rebenta.",
    gestoConsciencia:
      "Escreve a conversa que precisas de ter. Toda. Num papel, como se estivesses a falar com a pessoa. Não para enviar, para ouvir-te. Depois le em voz alta. E repara: o que e que custa mais, as palavras ou o silêncio? Não tens de ter a conversa está semana. Mas tens de a tirar de dentro de ti e po-la num sitio onde a possas ver.",
    fraseFinal:
      "O silêncio sobre dinheiro não e elegancia. E peso. E podes pousa-lo.",
    status: "draft",
  },

  // ─── MODULO 7: Ganhar Mais Não Resolve ──────────────────────────────────

  m7a: {
    moduleNumber: 7,
    subLetter: "A",
    title: "O buraco que o dinheiro não enche",
    perguntaInicial:
      "Já tiveste mais dinheiro do que o costume, e mesmo assim a inquietacao não passou? Já recebeste aquilo que querias e, em vez de alivio, sentiste: e agora?",
    situacaoHumana:
      "Recebes o aumento. Ou o bonus. Ou o pagamento daquele projecto grande. O dinheiro entra na conta e, por um instante, respiras. Finalmente. Mas o instante dura pouco. Horas, talvez. Um dia. Depois o corpo volta ao mesmo sitio. A mesma ansiedade. A mesma sensacao de que não chega. A mesma conta mental que nunca fecha. Pensavas que quando chegasses aqui, a este valor, a este salario, a está estabilidade, a paz viria. Mas não veio. Veio outra lista. Veio outro objectivo. Veio a mesma inquietacao com um número diferente. E comecas a desconfiar: se isto não resolveu, o que resolve? Porque a promessa era essa: ganha mais e vais estar bem. E ganhaste mais. E não estas bem.",
    revelacaoPadrao:
      "Há um buraco que o dinheiro não enche. Não porque o dinheiro seja insuficiente, mas porque o buraco não e financeiro. E emocional. Muitas pessoas usam o dinheiro como substituto: de seguranca, de valor proprio, de controlo, de amor. Se não me sinto segura, preciso de mais dinheiro. Se não me sinto valorizada, preciso de ganhar mais. Se não tenho controlo sobre a minha vida, preciso de ter controlo sobre a minha conta. O dinheiro torna-se a resposta para perguntas que não são financeiras. E como a resposta nunca encaixa na pergunta, a insatisfacao permanece. Mais dinheiro tapa o sintoma, mas não toca na causa. E a causa, quase sempre, e outra fome. Uma fome de algo que o dinheiro não compra: presenca, pertenca, permissao de ser quem es.",
    gestoConsciencia:
      "Senta-te num sitio calmo. Fecha os olhos. Imagina que a tua conta bancária tem exactamente o dobro do que tem agora. Sente isso no corpo. Onde está o alivio? Agora pergunta: o que e que farias com esse alivio? Não com o dinheiro, com o alivio. O que te permitirias sentir? Ser? Fazer? A resposta a essa pergunta e o que realmente procuras. E talvez não tenha preco.",
    fraseFinal:
      "Há fomes que o dinheiro não mata. Reconhece-las e o primeiro passo para parar de comer a coisa errada.",
    status: "draft",
  },

  m7b: {
    moduleNumber: 7,
    subLetter: "B",
    title: "Sabotagem financeira",
    perguntaInicial:
      "Já conseguiste juntar dinheiro e depois gastaste tudo de uma vez, quase sem perceber como? Já estiveste perto de uma estabilidade financeira e algo aconteceu que te levou de volta ao zero?",
    situacaoHumana:
      "Estiveste meses a poupar. A conta crescia. E comecaste a sentir-te estranha. Não confortavel, estranha. Como se aquele dinheiro não fosse teu. Como se houvesse uma data de validade invisivel. Depois, sem razão clara, gastaste. Uma compra grande. Pequenas fugas de madrugada. Coisas que já nem te lembras. Quando viste a conta de novo, estava quase onde começou. E sentiste duas coisas ao mesmo tempo: frustacao e alivio. Frustacao porque perdeste o que juntaste. Alivio porque estar sem dinheiro e mais familiar do que ter.",
    revelacaoPadrao:
      "A sabotagem financeira não e falta de disciplina. E um regresso ao que conheces. Se cresceste com pouco, a abundancia pode ser desconfortavel. Se associas dinheiro a conflito, ter pode sentir-se como estar em perigo. Se acreditas, la no fundo, que não mereces, encontras formas de garantir que não tens. Decisoes que parecem razoaveis no momento mas que, vistas de longe, formam um padrao claro. Ganhas e perdes. Constróis e destróis. A sabotagem não e o problema. E o sintoma. O que está por baixo e uma crenca sobre o teu lugar no mundo.",
    gestoConsciencia:
      "Pensa no último momento em que gastaste dinheiro que tinhas poupado, sem planear, sem precisar. Não no que compraste. No que sentias antes. Fecha os olhos e volta la. Estavas ansiosa? Inquieta? Havia algo que não querias sentir? Poe a mao onde essa sensacao vivia. Respira para esse sitio. A sabotagem começa sempre antes da compra. Comeca na sensacao que não quiseste ficar a sentir.",
    fraseFinal:
      "Não estas a falhar com o dinheiro. Estas a regressar ao único lugar que o teu corpo conhece como casa.",
    status: "draft",
  },

  m7c: {
    moduleNumber: 7,
    subLetter: "C",
    title: "Suficiente: quando e suficiente?",
    perguntaInicial:
      "Tens um número na cabeca, um valor a partir do qual tudo ficaria bem? E se atingisses esse número, acreditas mesmo que pararias? Ou o número subiria?",
    situacaoHumana:
      "Quando ganhavas mil, pensavas: se ganhasse dois mil. Quando ganhaste dois mil, pensaste: se ganhasse três mil. O número muda. A sensacao não. Há sempre um proximo patamar, uma proxima meta, uma proxima prova de que ainda não chega. Não e ambicao, ambicao tem direcao. Isto e outra coisa. E uma incapacidade de dizer: chega. E suficiente. Estou bem. Porque no momento em que paras, aparece o medo. Se paro de querer mais, o que acontece? Se me contento, não estou a desistir? Se não corro, não fico para tras? E entao continuas. Não porque queiras mais, mas porque tens medo de parar. A corrida financeira não e sobre dinheiro. E sobre o silêncio que ficaria se parasses.",
    revelacaoPadrao:
      "Se nunca e suficiente, o problema não está no quanto. Está no que o dinheiro está a substituir. Para algumas pessoas, acumular e seguranca contra o caos. Para outras, e prova de valor. Para outras ainda, e a única linguagem de sucesso que aprenderam. Quando o suficiente não existe, estas a pedir ao dinheiro que te de algo que ele não pode dar: paz. Porque a paz não vem de um número, vem de uma decisão. A decisão de dizer: o que tenho, neste momento, permite-me viver com dignidade. E o que me falta não e mais dinheiro, e mais presenca no que já tenho. Isto não e conformismo. E lucidez. E há uma diferenca enorme entre estar conforme e estar presente.",
    gestoConsciencia:
      "Escreve o teu número. Aquele valor mensal a partir do qual acreditas que ficarias bem. Agora olha para ele. E pergunta: o que e que esse número me daria que eu não tenho agora? Seguranca? Liberdade? Reconhecimento? Paz? Depois pergunta: há alguma parte disso que já posso ter, sem esperar pelo número? Não para desistires do número. Mas para não adiares a vida até la chegares.",
    fraseFinal:
      "Suficiente não e um número. E uma decisão de estar presente no que já existe.",
    status: "draft",
  },

  // ─── MODULO 8: Dinheiro como Liberdade ──────────────────────────────────

  m8a: {
    moduleNumber: 8,
    subLetter: "A",
    title: "De sobrevivencia a direccao",
    perguntaInicial:
      "O teu dinheiro serve para sobreviver ou para viver? Há quanto tempo estas no modo de sobrevivencia, a pagar contas, a cobrir buracos, a reagir ao que aparece, sem nunca te perguntares: para onde quero ir?",
    situacaoHumana:
      "O mes começa e tu já sabes como vai ser. Entra o salario. Sai a renda. Sai a agua, a luz, a internet. Sai o supermercado. Sai o transporte. Sai a escola. Sai o imprevisto que aparece sempre. E quando tudo sai, o que resta não e teu, e do proximo imprevisto. Não há sobra. Não há folga. Não há direcao. Há sobrevivencia. E a sobrevivencia financeira e eficiente: mantem-te a tona. Mas não te leva a lado nenhum. Estas no mesmo sitio há meses, talvez anos. Não porque sejas incapaz, mas porque toda a tua energia vai para a reaccao. Pagar o que aparece. Resolver o que surge. Apagar o fogo. Nunca sobra atenção para pensar: se o dinheiro não fosse só para sobreviver, para que o queria?",
    revelacaoPadrao:
      "A sobrevivencia financeira e um modo. Não e um destino. Mas quando ficas nele tempo demais, parece ser tudo o que existe. Parece que o dinheiro só serve para isso: cobrir custos. E perdes de vista a outra funcao do dinheiro: a de construir. Construir não significa ser rica. Significa ter direcao. Saber para onde vai o proximo euro que sobrar, não por obrigacao, mas por escolha. A diferenca entre sobrevivencia e direcao não e o quanto ganhas. E a pergunta que fazes. Na sobrevivencia, a pergunta e: como vou pagar? Na direcao, a pergunta e: para onde quero ir? E está segunda pergunta, a da direcao, assusta mais. Porque obriga-te a querer. A imaginar. A permitir-te um futuro. E muitas mulheres pararam de se permitir futuro há tanto tempo que já nem sabem o que querem.",
    gestoConsciencia:
      "Amanha de manha, antes de comecares o dia, fica parada dois minutos. De pé. Em silêncio. E em vez de pensares no que tens de pagar, pergunta: para onde quero ir? Não precisas de resposta. Só de fazer a pergunta. Repete isto durante três manhas. Ao terceiro dia, repara se algo mudou, na forma como entras no dia, na forma como olhas para o dinheiro, na forma como sentes o peso das contas. A pergunta não resolve. Mas muda a direcao do olhar.",
    fraseFinal:
      "Sobreviver e reagir. Viver e escolher para onde vai o proximo passo.",
    status: "draft",
  },

  m8b: {
    moduleNumber: 8,
    subLetter: "B",
    title: "O mapa do futuro que queres financiar",
    perguntaInicial:
      "Se o dinheiro fosse um veiculo, não um problema, não um peso, não uma fonte de ansiedade, mas um veiculo, para onde o conduzirias? Que vida construirias se pudesses usar o dinheiro com intenção em vez de desespero?",
    situacaoHumana:
      "Imagina que estas sentada a mesa. Não a mesa da cozinha cheia de contas, outra mesa. Uma mesa limpa, com uma folha em branco. E alguem te diz: desenha a vida que queres. Não a perfeita, a tua. Onde vives? Com quem? Como passas as manhas? O que fazes com o teu tempo? Que tipo de cansaco sentes, o bom ou o que te desgasta? Quanto precisas por mes para isso? A maioria das pessoas nunca fez este exercício. Não porque não queiram, porque nunca se permitiram. Porque quando vives em modo sobrevivencia, imaginar um futuro parece luxo. Parece ingratidao. Parece delirio. Mas não e nada disso. E o acto mais pratico que podes fazer: saber para onde queres ir para poderes começar a caminhar.",
    revelacaoPadrao:
      "Sem mapa, qualquer caminho serve. E e assim que muitas pessoas vivem a sua vida financeira: sem mapa. Ganham. Gastam. Sobra ou não sobra. Reagem. Mas nunca param para perguntar: isto está a levar-me para algum sitio? O mapa não e um orcamento. O orcamento e o como. O mapa e o para que. O orcamento diz: não gastes mais de X em comida. O mapa diz: quero viver num sitio com mais luz, perto do mar, com tempo para ler. O orcamento sem mapa e uma prisao. O mapa sem orcamento e um sonho. Precisas dos dois. Mas o mapa vem primeiro. Porque sem saber para onde vais, não há número que te de paz.",
    gestoConsciencia:
      "Escreve, em detalhe, um dia normal na vida que queres ter daqui a três anos. Não a vida perfeita, a tua. Desde que acordas até que adormeces. Com quem estas. O que fazes. O que comes. O que sentes. Depois le o que escreveste e pergunta: quanto custa este dia? Não precisa de ser exacto. Mas precisa de ser real. E quando tiveres o número, já não e um sonho. E um destino.",
    fraseFinal:
      "O dinheiro não te da uma vida. Mas pode levar-te até ela, se souberes para onde queres ir.",
    status: "draft",
  },

  m8c: {
    moduleNumber: 8,
    subLetter: "C",
    title: "Liberdade, não acumulacao",
    perguntaInicial:
      "Se o objectivo do dinheiro não for ter mais, mas ser mais livre, o que muda? O que farias diferente amanha se o teu norte não fosse acumulacao, mas liberdade?",
    situacaoHumana:
      "Há pessoas que tem muito e não são livres. Trabalham setenta horas por semana para manter o que tem. Não dormem. Não param. Não aproveitam. O dinheiro está la, mas a vida não. E há pessoas que tem pouco e são livres. Não porque o pouco baste, mas porque fizeram uma escolha. Escolheram o que importa. E o dinheiro serve isso. Só isso. Tu estas algures no meio. Talvez com mais do que precisas para sobreviver e menos do que achas que precisas para viver. Mas a pergunta não e quanto. A pergunta e: para que? Se o teu dinheiro te permite fazer o que importa, tens o suficiente. Se o teu dinheiro te prende a fazer o que não importa para ter mais do que não precisas, não tens liberdade. Tens gaiola dourada.",
    revelacaoPadrao:
      "O mundo ensinou-te que o objectivo do dinheiro e ter mais. Mais poupanca. Mais investimento. Mais seguranca. Mais, mais, mais. Mas mais não e um destino, e uma esteira. E quem corre numa esteira está sempre a mexer-se e nunca sai do sitio. A liberdade financeira não e ter tanto que nunca mais precisas de trabalhar. E ter clareza suficiente para que cada euro que gastas ou guardas esteja alinhado com a vida que queres. E quando isso acontece, algo muda no corpo. O aperto desaparece. Não porque os números mudaram, mas porque a relação mudou. O dinheiro deixa de ser um juiz e torna-se uma ferramenta. Deixa de ser uma sentenca e torna-se uma escolha. E tu, finalmente, podes olhar para o extracto sem medo. Porque o que está la dentro já não te define. Serves-te dele, ele não te serve a si mesmo.",
    gestoConsciencia:
      "Escreve três coisas que o dinheiro te permite fazer que te fazem sentir livre. E três coisas que o dinheiro te obriga a fazer que te prendem. Olha para as duas listas. E pergunta: posso ter mais da primeira e menos da segunda? Não amanha, ao longo do proximo ano? Comeca por uma. Uma única mudanca. Pequena. Concreta. Que te aproxime da liberdade e te afaste da acumulacao sem sentido.",
    fraseFinal:
      "O dinheiro nunca foi o destino. E o caminho. E o caminho só tem valor se souberes para onde te leva.",
    status: "draft",
  },
};
