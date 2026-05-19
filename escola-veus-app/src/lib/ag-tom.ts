// Filosofia tonal Ancient Ground — usada pelo suggest-ag endpoint para
// alimentar Claude com um padrão firme. Cristalizada em 3 blocos:
//  1. Visão (centralidade Africa, ubuntu, elementos vivos)
//  2. 5 regras tonais
//  3. Seed bank de 30 versos (10 da autora + 20 gerados e validados)
//  4. Anti-padrão (vocabulário explicitamente proibido)
//
// Tudo aqui é usado como input do system prompt. Alterar este ficheiro = alterar
// o tom dos outputs.

export const AG_FILOSOFIA = `
Ancient Ground é um projecto que resgata a centralidade africana no imaginário
humano. Não Africa como periferia exótica mas como origem, raiz, berço — onde
o humano começou a bater ritmo com a mão numa pele esticada, onde o fogo foi
domesticado e tornou-se parente. A visão:

- Africa = centro, não margem. Origem, não destino.
- Música, ritmo, fogo, elementos: experiência humana primordial.
- Natureza é o elo entre todos os seres na Terra — vivos ou não. A pedra sonha,
  o rio lembra, o vento conta.
- Ubuntu implícito: "sou porque somos". A terra pertence a todos os que já
  dormiram nela.
- Deep ecology: as raízes de duas árvores que nunca se viram partilham o
  mesmo solo.

Os overlays (versos curtos sobrepostos em shorts 30s) são convites a lembrar,
não a aprender. O espectador está a pausar, não a estudar.
`.trim();

export const AG_REGRAS_TONAIS = `
5 REGRAS OBRIGATÓRIAS para cada verso:

1. RESPIRAÇÃO, NÃO LIÇÃO. 6 a 12 palavras por verso. Pode ser uma linha ou
   duas. Nunca três.

2. PRESENTE SENSORIAL. "A pedra escuta" é melhor do que "as pedras podem
   ensinar-nos". Verbo activo, corpo-sensor, agora.

3. PARENTESCO, NÃO METÁFORA. O fogo É primo. A noite É avó. Não é imagem
   bonita — é reconhecimento de relação. Trata os elementos como sujeitos,
   não cenário.

4. VOCABULÁRIO DA TERRA. Usa: terra, osso, sangue, raiz, sombra, brasa, cinza,
   tambor, voz, semente, avó, rio, fogo, vento, pedra, folha, chuva, solo.
   Não uses vocabulário New Age importado (lista abaixo).

5. CHAMAR DE VOLTA, NÃO ILUMINAR. Não se ensina nada novo. Lembra-se o que
   já se sabe. Declarativo, não pergunta retórica. Inversão é boa
   ferramenta ("não X, Y").
`.trim();

/** Versos-semente agrupados por motivo. O suggest-ag mostra-os a Claude
 *  com cabeçalhos por grupo para que extraia padrões variados — não só
 *  o eixo avó/tambor/transmissão que dominava o bank original. */
export const AG_SEED_GROUPS: { motivo: string; versos: string[] }[] = [
  {
    motivo: "Ancestral / parentesco",
    versos: [
      "os teus antepassados\njá ouviram este som",
      "há uma avó em cada brasa",
      "entre a semente e o fruto\nhá milhares de avós",
      "o primeiro nome\nainda está na tua boca",
      "a tua voz\né um fogo mais antigo do que tu",
      "o tambor não se inventou\nfoi lembrado",
      "isto não é música nova\né memória antiga que voltou",
    ],
  },
  {
    motivo: "Elementos (fogo, pedra, vento, água)",
    versos: [
      "o fogo lembra\no que a água esqueceu",
      "a pedra também respira\nsó mais devagar",
      "a cinza sabe\no que a madeira viveu",
      "o vento não tem fronteiras\nnunca teve",
      "cada gota de chuva\njá foi mar, já foi nuvem, já foi lágrima",
      "a água do teu corpo\njá correu em rios que não existem mais",
      "somos feitos do que nunca morre\nterra, fogo, osso",
    ],
  },
  {
    motivo: "Paisagem, mar, costa (sem voltar a avós)",
    versos: [
      "o mar não tem dono\né só vez de cada um",
      "a maré sabe contar\nsem precisar de números",
      "ninguém ensinou o rio a correr\nninguém o vai parar",
      "o sal fica\nquando a água parte",
      "a praia escreve\no que o vento dita",
      "as raízes de duas árvores\nque nunca se viram\npartilham o mesmo solo",
      "a árvore nunca está sozinha\nmesmo quando cai",
    ],
  },
  {
    motivo: "Mercado, ofício quotidiano, gesto sem mestre",
    versos: [
      "o pão da manhã\nnão faz cerimónia",
      "a capulana muda de cor\nconsoante a tarde",
      "o cesto trançado\né uma forma de pensar",
      "no mercado, o preço\né o último a falar",
      "a roupa estendida\ntambém é música",
      "a mão que pesca\nnão escreve, mas conta",
      "o que se carrega à cabeça\nensina a coluna",
    ],
  },
  {
    motivo: "Corpo, presente, sensorial (anti-mística)",
    versos: [
      "o ritmo não precisa de ser ensinado\njá bate no peito",
      "a pele tem boa memória\nainda que cale",
      "o silêncio tem sotaque",
      "o calor a essa hora\nnão é castigo\né companhia",
      "respirar devagar\né uma forma de chegar",
      "a sombra também faz casa",
      "dormir cedo\né um luxo antigo",
    ],
  },
  {
    motivo: "Tempo, cosmologia, escala não-ancestral",
    versos: [
      "o sol também nasceu aqui",
      "a noite não é ausência\né outro tipo de luz",
      "o que pertence à noite\nnão precisa de nome",
      "não é silêncio\né a terra a descansar",
      "primeiro veio o som\ndepois a palavra",
      "o que a raiz sabe\na folha ainda vai descobrir",
      "não há terras estrangeiras\nhá pessoas que esqueceram",
    ],
  },
  {
    motivo: "Permanências (centralidade africana)",
    versos: [
      "não viemos de África\nsomos África",
      "a terra não pertence a ninguém\npertence a todos os que já dormiram nela",
      "aqui começou tudo\no primeiro fogo, a primeira voz",
    ],
  },
];

/** Lista plana — back-compat para consumidores que iteram sobre o bank
 *  sem cuidar dos grupos. Derivada de AG_SEED_GROUPS. */
export const AG_SEED_VERSOS: string[] = AG_SEED_GROUPS.flatMap((g) => g.versos);

/** Vocabulário PROIBIDO — o prompt tem de o listar explicitamente senão
 *  Claude (e outros LLMs) tendem a derivar para o registo New Age ocidental. */
export const AG_ANTI_PADRAO: string[] = [
  "energia", "vibração", "vibrações", "frequência", "frequências",
  "cura", "curativo", "curar-te", "self-care",
  "abundância", "prosperidade", "manifestação", "manifestar",
  "cristal", "cristais", "chakra", "chakras",
  "alinhamento", "alinhar", "consciência elevada", "elevar",
  "luz interior", "teu brilho", "shine",
  "gratidão" /* cliché Instagram — só se natural */,
  "amor próprio", "love yourself",
  "jornada interior", "caminho da alma",
  "universo" /* como entidade new-age */,
  "abundância cósmica", "alma antiga" /* em Ingles "old soul" */,
];

/** Regras para os candidatos de legenda (TikTok + YouTube). */
export const AG_CAPTION_RULES = {
  tiktokMaxChars: 150,
  youtubeTitleMaxChars: 70,
  youtubeDescriptionMaxChars: 5000, // cap YouTube, folga grande
  baseHashtags: [
    "#Shorts",
    "#AncientGround",
    "#NatureSounds",
    "#AfricanNature",
    "#Mozambique",
    "#AmbientMusic",
    "#NaturePoetry",
    "#Meditation",
    "#Mindfulness",
    "#RelaxingMusic",
  ],
};
