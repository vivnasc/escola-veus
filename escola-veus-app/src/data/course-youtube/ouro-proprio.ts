/**
 * Scripts YouTube — Ouro Proprio
 *
 * 3 videos gratuitos como montra emocional.
 * NAO ensinam o conteudo do curso — criam reconhecimento.
 * Tom: o mesmo dos scripts, mas mais curto e mais directo.
 * Terminam SEMPRE com convite para o curso.
 *
 * Estrutura: gancho → situacao → revelacao curta → convite
 * Sem gesto de consciencia (isso e do curso pago).
 */

export type YouTubeScript = {
  number: number;
  title: string;
  durationMin: number;
  gancho: string; // primeiros 15 segundos — a pessoa decide se fica
  situacao: string; // cenario reconhecivel
  revelacao: string; // insight curto — o suficiente para querer mais
  convite: string; // CTA gentil para o curso
  fraseFinal: string; // ultimo frame no ecra
  status: "draft" | "approved" | "produced";
};

export const OURO_PROPRIO_YOUTUBE: YouTubeScript[] = [
  // ─── VIDEO 1 ───────────────────────────────────────────────────────────────
  {
    number: 1,
    title: "Porque sentes culpa quando gastas dinheiro em ti mesma?",
    durationMin: 6,
    gancho:
      "Compraste algo para ti — nao era caro, nao era necessario, era so bom — e antes de saíres da loja ja estavas a calcular se devias ter comprado. Soa familiar? Entao este video e para ti.",
    situacao:
      "Compraste aquele creme. Ou aquele livro. Ou aquele cafe diferente. Algo pequeno, so teu. E por um instante sentiste prazer. Daquele puro, sem funcao. Depois veio a voz. Podias ter guardado esse dinheiro. Nao precisavas. Ha coisas mais importantes. E o prazer desapareceu. Nao porque o objecto perdeu valor — mas porque algo dentro de ti decidiu que nao mereces prazer sem justificacao. Isto acontece com mais mulheres do que imaginas. E nao e mesquinhice. Nao e avareza. E um padrao muito mais antigo do que o teu cartao de credito.",
    revelacao:
      "A culpa de gastar em ti nao e sobre dinheiro. E sobre uma regra invisivel que absorveste antes de ter idade para a questionar: para seres boa, tens de querer pouco. Para seres generosa, tens de vir por ultimo. Para seres decente, o prazer tem de ser justificado. Esta regra nao esta escrita em lado nenhum. Mas esta escrita no teu corpo. No aperto que sentes cada vez que compras algo so bonito. Na necessidade de dizer a alguem: estava em promocao. Na forma como pagas tudo para os outros sem pensar, mas hesitas quando e para ti. A culpa nao e tua — mas a permissao tem de ser.",
    convite:
      "Este video e so a superficie. No curso Ouro Proprio, passamos oito modulos inteiros a olhar para a tua relacao com dinheiro — nao as contas, mas o que sentes quando o dinheiro aparece. A heranca emocional. A vergonha. O merecimento. A liberdade. Se isto te tocou, o curso completo esta em seteveus.space.",
    fraseFinal:
      "O prazer nao precisa de justificacao. Se precisasse, nao seria prazer.",
    status: "draft",
  },

  // ─── VIDEO 2 ───────────────────────────────────────────────────────────────
  {
    number: 2,
    title: "3 frases sobre dinheiro que a tua mae te ensinou sem saber",
    durationMin: 7,
    gancho:
      "A tua mae nunca se sentou contigo a dar-te uma aula sobre dinheiro. Mas ensinou-te tudo. Com frases soltas na cozinha. Com suspiros antes de abrir as contas. Com o silencio. Hoje vou dizer-te tres dessas frases — e talvez reconhecas mais do que esperavas.",
    situacao:
      "A primeira: o dinheiro nao chega para tudo. Talvez nao tenha sido com estas palavras exactas. Talvez tenha sido: temos de escolher. Ou: agora nao pode ser. Ou simplesmente o suspiro. Tu nao estavas a prestar atencao — estavas a brincar, a comer, a olhar pela janela. Mas absorveste. E agora, quando o teu salario entra, ha uma parte de ti que ja sabe: nao vai chegar. Antes de fazeres as contas. Antes de olhar para os numeros. A frase chegou primeiro. A segunda: nao se fala de dinheiro. Ninguem te disse isto directamente. Mas sempre que o assunto surgia, alguem mudava de tema, baixava a voz, ou ficava tenso. Tu aprendeste: dinheiro e perigoso. Falar dele e expor-se. E melhor nao. E agora, quando precisas de ter uma conversa sobre dinheiro com alguem que amas, o corpo trava. Nao porque nao tenhas as palavras — porque te ensinaram que essas palavras sao proibidas. A terceira: nos nao somos dessas pessoas. Dessas que tem. Dessas que podem. Dessas que viajam, que compram, que vivem assim. Ha um lugar para nos — e nao e esse. Tu absorveste um mapa de onde podes e nao podes estar. E cada vez que te aproximas de um sitio que nao era suposto ser teu, algo te puxa de volta.",
    revelacao:
      "Nenhuma destas frases foi dita com maldade. A tua mae nao te quis prender. Estava a proteger-te com as ferramentas que tinha. Mas a proteccao tornou-se prisao. E o mais dificil e isto: nao podes voltar atras e mudar o que ouviste. Mas podes fazer algo que ninguem fez por ti — olhar para essas frases e escolher. Quais ficam? Quais vao? E que frase nova queres por no lugar delas?",
    convite:
      "No curso Ouro Proprio, o segundo modulo chama-se A Heranca Financeira Emocional. E la que desenterramos estas frases — todas. E escolhemos conscientemente o que manter e o que largar. Se quiseres ir mais fundo, seteveus.space.",
    fraseFinal:
      "Metade do que acreditas sobre dinheiro nao e teu. Foi-te dado antes de saberes recusar.",
    status: "draft",
  },

  // ─── VIDEO 3 ───────────────────────────────────────────────────────────────
  {
    number: 3,
    title: "O teste do preco: diz o teu valor em voz alta",
    durationMin: 5,
    gancho:
      "Vou pedir-te para fazeres uma coisa agora — so demora dez segundos, mas vai dizer-te mais sobre a tua relacao com dinheiro do que qualquer livro de financas. Pronta?",
    situacao:
      "Pensa no teu trabalho. No que fazes. No que ofereces — ao teu chefe, aos teus clientes, a quem quer que pague pelo teu tempo. Agora pensa: quanto vale isso? Nao quanto cobras. Nao quanto te pagam. Quanto vale. Tens o numero? Agora diz em voz alta. Diz: o meu trabalho vale X. O que aconteceu? Baixaste a voz? Olhaste a volta para ver se alguem ouviu? Riste de ti mesma? Disseste o numero com um talvez a frente? A maioria das mulheres nao consegue dizer o seu valor em voz alta sem que algo no corpo interfira. Nao e timidez. Nao e falta de confianca. E uma distancia — entre o que sabes que vale e o que te permites pedir.",
    revelacao:
      "A distancia entre o que cobras e o que vale nao e um problema de preco. E um problema de permissao. Algures, aprendeste que pedir o que mereces e arrogancia. Que cobrar bem e ganancia. Que ser acessivel e o mesmo que ser barata. Mas nao e. Ha uma diferenca enorme entre generosidade e medo. A generosidade e uma escolha. O desconto automatico que das antes de alguem pedir e uma reaccao. E cada vez que baixas o preco sem que ninguem te peca, estas a dizer — a ti mesma e ao mundo — que o teu valor e negociavel.",
    convite:
      "No curso Ouro Proprio, ha um modulo inteiro sobre isto: Cobrar, Receber, Merecer. Nao e sobre tacticas de negociacao. E sobre desatar o no entre o que vales e o que te permites pedir. Se quiseres ir mais fundo: seteveus.space.",
    fraseFinal:
      "O desconto que ninguem te pediu e a medida exacta do quanto ainda nao te permites valer.",
    status: "draft",
  },
];
