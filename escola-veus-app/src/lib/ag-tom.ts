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

/** 30 versos-semente: 10 originais + 20 gerados e validados pela autora. */
export const AG_SEED_VERSOS: string[] = [
  // Originais (10)
  "o fogo lembra\no que a água esqueceu",
  "a pedra também respira\nsó mais devagar",
  "o ritmo existia\nantes do tambor",
  "os teus antepassados\njá ouviram este som",
  "não viemos de África\nsomos África",
  "a terra não pertence a ninguém\npertence a todos os que já dormiram nela",
  "as raízes de duas árvores\nque nunca se viram\npartilham o mesmo solo",
  "aqui começou tudo\no primeiro fogo, a primeira voz",
  "isto não é música nova\né memória antiga que voltou",
  "o vento não tem fronteiras\nnunca teve",

  // Validados (20)
  "a cinza sabe\no que a madeira viveu",
  "há uma avó em cada brasa",
  "o primeiro nome\nainda está na tua boca",
  "não é silêncio\né a terra a descansar",
  "o que pertence à noite\nnão precisa de nome",
  "o tambor não se inventou\nfoi lembrado",
  "somos feitos do que nunca morre\nterra, fogo, osso",
  "cada gota de chuva\njá foi mar, já foi nuvem, já foi lágrima",
  "primeiro veio o som\ndepois a palavra",
  "a árvore nunca está sozinha\nmesmo quando cai",
  "o sol também nasceu aqui",
  "entre a semente e o fruto\nhá milhares de avós",
  "o ritmo não precisa de ser ensinado\njá bate no peito",
  "a água do teu corpo\njá correu em rios que não existem mais",
  "a noite não é ausência\né outro tipo de luz",
  "o que a raiz sabe\na folha ainda vai descobrir",
  "o silêncio tem sotaque",
  "ninguém ensinou o rio a correr\nninguém o vai parar",
  "a tua voz\né um fogo mais antigo do que tu",
  "não há terras estrangeiras\nhá pessoas que esqueceram",
];

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
