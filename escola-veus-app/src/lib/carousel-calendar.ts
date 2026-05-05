// Calendário anual de 52 semanas para Maputo / Sete Ecos.
//
// Cada semana é uma colecção de 7 dias × 6 slides. Os "seeds" abaixo são
// pontos de partida — Vivianne edita / regera com Claude se quiser outra
// direcção. O ano civil em Maputo:
//   • Chuvas / calor: Out-Abr (semanas ~40-17)
//   • Seca / fresco: Mai-Set (semanas 18-39)
//   • Estação fria curta: Jun-Ago
// Datas-marco usadas: equinócio (Mar/Set), solstício (Jun/Dez), 8 Mar,
// 7 Abr (Mulher Moç), 25 Jun (Independência), Natal, Ano Novo.

export type WeekSeed = {
  /** ISO week number 1..52 */
  week: number;
  /** Mês principal — só para agrupamento visual */
  monthLabel: string;
  /** Título sugerido (Vivianne pode mudar) */
  title: string;
  /** Brief — passado ao Claude para gerar os 7 dias */
  brief: string;
  /** Tag visual (estação / lua / data) */
  tag: string;
};

export const ANNUAL_WEEKS: WeekSeed[] = [
  // ─── JANEIRO — fim das chuvas, calor pesado ────────────────────────────
  { week: 1, monthLabel: "Janeiro", tag: "Limiar", title: "Limiar", brief:
    "Primeira semana do ano em Maputo. Calor pleno, ainda chove. Tema: limiar — entre o que ficou e o que pode ser, sem promessas vazias. Cada dia explora um véu que se levanta no início do ciclo: pressa de definir o ano, lista de propósitos, comparação com outros, perfeccionismo, urgência, expectativa, presença. Voz contemplativa, sem 'novo ano nova vida'." },
  { week: 2, monthLabel: "Janeiro", tag: "Calor", title: "Calor que expõe", brief:
    "Calor de Janeiro em Maputo expõe o que o frio guarda. Tema: o que o corpo pede quando a temperatura aperta — descanso, água, devagar, presença. Cada dia: véu da pressa, da produtividade, do corpo invisível, do não-parar, do desconforto, da culpa de descansar, do retorno ao ritmo." },
  { week: 3, monthLabel: "Janeiro", tag: "Trovoada", title: "Trovoada", brief:
    "Trovoadas de Janeiro em Maputo. Tema: o que se solta no relâmpago — emoções represadas, raiva sagrada, lágrimas adiadas, intensidade que pede passagem. Cada dia explora um aspecto da intensidade emocional: medo dela, vergonha, expressão, contenção, alívio, integração." },
  { week: 4, monthLabel: "Janeiro", tag: "Chuva", title: "Chuva que limpa", brief:
    "Chuva de Janeiro lava as ruas de Maputo. Tema: o que se deixa ir — relações, padrões, identidades velhas, expectativas dos outros. Cada dia: véu do controlo, da memória, da repetição, do papel social, da culpa, do agarrar, da rendição." },
  // ─── FEVEREIRO — chuvas plenas ────────────────────────────────────────
  { week: 5, monthLabel: "Fevereiro", tag: "Lua nova", title: "Lua nova de Fev", brief:
    "Lua nova em Fevereiro — escuridão fértil. Tema: o que se planta no escuro. Cada dia explora um tipo de sementeira interior: intenções (não objectivos), perguntas, presença, escuta, lentidão, gestação, espera." },
  { week: 6, monthLabel: "Fevereiro", tag: "Águas", title: "Águas de Maputo", brief:
    "Águas de Fevereiro: rios cheios, mar tépido, pele molhada. Tema: fluidez vs rigidez. Cada dia: véu da rigidez do plano, do corpo armadura, do pensamento que circula em loop, da fala que repete, da escuta que se fecha, da fluidez como prática, da entrega." },
  { week: 7, monthLabel: "Fevereiro", tag: "Mangas", title: "Mangueiras carregadas", brief:
    "As mangueiras de Maputo dobram com fruta em Fevereiro. Tema: o que é dado sem mereceres — graça, abundância, beleza inocente. Cada dia: véu do mérito, da escassez, da gratidão performativa, da gratidão real, do receber, do partilhar, da abundância silenciosa." },
  { week: 8, monthLabel: "Fevereiro", tag: "Lua cheia", title: "Lua cheia de Fev", brief:
    "Lua cheia de Fevereiro — luz que expõe. Tema: o que vem ao de cima quando há demasiada luz. Cada dia: véu da imagem, do desempenho, da máscara social, do conforto da noite, do ver-se sem maquilhagem, da nudez interior, da paz com o que é." },
  // ─── MARÇO — equinócio, fim das chuvas ────────────────────────────────
  { week: 9, monthLabel: "Março", tag: "Mulher", title: "Mulher invisível", brief:
    "Semana do 8 de Março em Maputo. Tema: a mulher que se serve a todos e desaparece para si. Cada dia: véu do cuidar dos outros, do esquecer-se, da culpa de cuidar de si, da raiva escondida, da exaustão, do reconhecimento, do regresso a si." },
  { week: 10, monthLabel: "Março", tag: "Equinócio", title: "Equinócio de Outono", brief:
    "Equinócio de Março — em Maputo, virada para o Outono. Tema: equilíbrio aparente, transição real. Cada dia: véu do meio do ano, da metade que escapou, do que falta, do que sobra, da pausa, do reposicionamento, da continuação sem promessa." },
  { week: 11, monthLabel: "Março", tag: "Brisa", title: "Primeira brisa fresca", brief:
    "Primeiras brisas frescas em Maputo. Tema: o corpo que se abre quando o calor afrouxa. Cada dia: véu do corpo enrijado, da tensão crónica, do toque suave, da respiração que se desbloqueia, do prazer doméstico, do silêncio físico, da paz neuromuscular." },
  { week: 12, monthLabel: "Março", tag: "Memória", title: "Memória do corpo", brief:
    "Tema: memória somática. O que o corpo arquiva e a mente nem sabe. Cada dia: véu do trauma silencioso, do gesto repetido, da postura herdada, da emoção encarnada, da terapia do toque, da fala do corpo, da liberdade pelo movimento." },
  // ─── ABRIL — mais fresco ──────────────────────────────────────────────
  { week: 13, monthLabel: "Abril", tag: "Mulher Moç", title: "Mulher moçambicana", brief:
    "Semana do 7 de Abril (Dia da Mulher Moçambicana). Tema: as várias mulheres em ti — a que cuida, a que luta, a que descansa, a que é. Cada dia: véu da identidade fixa, da força performativa, da fragilidade negada, da herança feminina, da linhagem, da irmandade, da liberdade." },
  { week: 14, monthLabel: "Abril", tag: "Lua nova", title: "Lua nova de Abril", brief:
    "Lua nova em Abril — outono já claro em Maputo. Tema: começar pequeno. Cada dia: véu do grande gesto, da ambição vazia, do passo invisível, da paciência, do compromisso silencioso, do micro-hábito, da regularidade como amor." },
  { week: 15, monthLabel: "Abril", tag: "Recolhimento", title: "Recolhimento", brief:
    "Tarde de Abril em Maputo, casas mais fechadas. Tema: introversão como prática. Cada dia: véu da extroversão obrigatória, da culpa de querer estar só, do barulho como evasão, do silêncio fértil, do diário, da leitura, do retiro doméstico." },
  { week: 16, monthLabel: "Abril", tag: "Lua cheia", title: "Lua cheia de Abril", brief:
    "Lua cheia de Abril. Tema: o que está pronto para colher. Cada dia: véu da espera infinita, do não-merecer, do colher antes do tempo, do reconhecimento próprio, do agradecer ao corpo, da celebração discreta, do partilhar a colheita." },
  // ─── MAIO — fresco confirmado ─────────────────────────────────────────
  { week: 17, monthLabel: "Maio", tag: "Fresco", title: "Fresco que pede manta", brief:
    "Maio em Maputo, primeiras mantas saem do armário. Tema: aconchego como direito. Cada dia: véu do estoicismo, da auto-negação, do conforto envergonhado, do prazer do quente, da casa como útero, da pele em contacto, da intimidade silenciosa." },
  { week: 18, monthLabel: "Maio", tag: "Memória", title: "O que ficou", brief:
    "Maio: balanço silencioso. Tema: o que ficou do ano que passa, sem julgamento. Cada dia: véu da auto-crítica, do arrependimento, da lista de erros, da aceitação das fases, da continuidade, da curva, do amor por quem és agora." },
  { week: 19, monthLabel: "Maio", tag: "Lua nova", title: "Lua nova de Maio", brief:
    "Lua nova em Maio. Tema: silêncio como semente. Cada dia: véu da fala constante, do ruído digital, da opinião, da escuta de si, da escuta dos outros, do silêncio entre frases, da pausa antes de responder." },
  { week: 20, monthLabel: "Maio", tag: "Solidão", title: "Solidão fértil", brief:
    "Tema: distinguir solidão (vazio doloroso) de solitude (presença consigo). Cada dia: véu do horror ao só, do telemóvel como muleta, da solitude desejada, do encontro consigo, da escuta interior, da paz na própria companhia, do regresso aos outros mais cheia." },
  // ─── JUNHO — frio + Independência ─────────────────────────────────────
  { week: 21, monthLabel: "Junho", tag: "Frio", title: "Frio que ensina", brief:
    "Junho em Maputo: frio breve e intenso. Tema: o que o frio te ensina sobre limite. Cada dia: véu da omnipotência, do excesso, do limite como dom, do parar, do dizer não, do cuidar dos limites dos outros, da fronteira amorosa." },
  { week: 22, monthLabel: "Junho", tag: "Solstício", title: "Solstício de Inverno", brief:
    "Solstício de Junho — noite mais longa em Moçambique. Tema: o escuro como mestre. Cada dia: véu do medo do escuro, da luz forçada, do mistério, do não-saber, da fé no processo, da gestação invisível, da paciência com o escuro." },
  { week: 23, monthLabel: "Junho", tag: "Independência", title: "Independência interior", brief:
    "Semana do 25 de Junho. Tema: independência interior — não da família, do sistema, mas dos teus próprios padrões. Cada dia: véu do papel herdado, da expectativa internalizada, da voz da mãe, do pai, da cultura, da auto-autoria, da liberdade vivida." },
  { week: 24, monthLabel: "Junho", tag: "Lua cheia", title: "Lua cheia de Junho", brief:
    "Lua cheia de Junho — fria e clara. Tema: clareza que dói. Cada dia: véu da auto-mentira, da racionalização, da clareza brutal, da dor da verdade, da reconciliação, do realinhamento, da nova rota." },
  // ─── JULHO — meio-ano, frio máximo ────────────────────────────────────
  { week: 25, monthLabel: "Julho", tag: "Meio-ano", title: "Meio do ano", brief:
    "Tema: avaliação suave do ano. Não do que falhaste, do que mudaste em ti. Cada dia: véu do performance review interior, da gratidão real, do que dispensaste, do que aprendeste, do que ainda escapa, da continuação, da paz com o ritmo." },
  { week: 26, monthLabel: "Julho", tag: "Recolher", title: "Recolher cedo", brief:
    "Maputo escurece cedo em Julho. Tema: o ritmo solar do corpo. Cada dia: véu da agenda artificial, do horário social, do corpo cansado às 19h, do dormir cedo sem culpa, do sono como sagrado, do despertar com o sol, da harmonia natural." },
  { week: 27, monthLabel: "Julho", tag: "Pele", title: "Pele seca, alma seca", brief:
    "Tema: secura — da pele, das ideias, do entusiasmo. Cada dia: véu da exaustão criativa, do creme como ritual, do beber água como prática, da hidratação emocional, da nutrição lenta, do contacto com o que te molha por dentro, da humidade da alma." },
  { week: 28, monthLabel: "Julho", tag: "Lua nova", title: "Lua nova de Julho", brief:
    "Lua nova de Julho — escuridão fria. Tema: a viagem interior do meio-ano. Cada dia: véu da viagem como evasão, da viagem como descoberta, da viagem sem mover, do sonho lúcido, da imaginação como portal, do regresso, da partida." },
  // ─── AGOSTO — fresco, fim do frio ─────────────────────────────────────
  { week: 29, monthLabel: "Agosto", tag: "Vento", title: "Vento de Agosto", brief:
    "Vento de Agosto em Maputo. Tema: o que se solta quando o vento entra. Cada dia: véu do agarrar, do controlo, do soltar como prática, da inquietação, da raiva como força, da limpeza, do espaço vazio." },
  { week: 30, monthLabel: "Agosto", tag: "Identidade", title: "Quem sou agora", brief:
    "Tema: identidade fluida. Tu não és quem eras há 5 anos. Cada dia: véu do nome fixo, do papel social, da auto-imagem desactualizada, da permissão para mudar, da consistência interior através das mudanças, da nova versão, do amor pela passagem." },
  { week: 31, monthLabel: "Agosto", tag: "Lua cheia", title: "Lua cheia de Agosto", brief:
    "Lua cheia de Agosto. Tema: revelação suave. Cada dia: véu da revelação chocante, da dor lenta, da intuição confiável, da escuta do corpo, do sonho lúcido, da sincronia, da fé no que vai chegando." },
  { week: 32, monthLabel: "Agosto", tag: "Limpeza", title: "Limpeza de fim-de-frio", brief:
    "Fim do frio em Maputo, limpeza de armários, casas, ideias. Tema: deixar ir como amor. Cada dia: véu do guardar tudo, da nostalgia tóxica, do deixar ir como cuidado, do ritual de despedida, do espaço criado, da chegada do novo, da gratidão pelo que foi." },
  // ─── SETEMBRO — primavera, equinócio ──────────────────────────────────
  { week: 33, monthLabel: "Setembro", tag: "Brotar", title: "Brotar de novo", brief:
    "Setembro em Maputo: primeiras flores, dias mais longos. Tema: brotar sem pressa. Cada dia: véu do florir prematuro, da pressão de produzir, do brotar discreto, da raiz primeiro, da ambição doce, do crescimento orgânico, da paciência da terra." },
  { week: 34, monthLabel: "Setembro", tag: "Lua nova", title: "Lua nova primaveril", brief:
    "Lua nova de Setembro. Tema: começar (de novo) sem peso do velho. Cada dia: véu da continuação por inércia, do recomeço como rito, da limpeza simbólica, da intenção sem objectivo, da fé na semente, do tempo da terra, do mistério da germinação." },
  { week: 35, monthLabel: "Setembro", tag: "Equinócio", title: "Equinócio de Primavera", brief:
    "Equinócio de Setembro. Tema: equilíbrio dia/noite, luz/sombra. Cada dia: véu da pureza performativa, da sombra negada, da integração, do auto-conhecimento corajoso, da aceitação de tudo, da paz com a sombra, do amor inteiro." },
  { week: 36, monthLabel: "Setembro", tag: "Sol", title: "Sol que volta", brief:
    "Sol forte volta a Maputo. Tema: visibilidade, exposição, ser vista. Cada dia: véu do esconder-se, da auto-sabotagem, do brilho como medo, do mostrar-se aos poucos, da generosidade da presença, do impacto sem performance, da contribuição." },
  // ─── OUTUBRO — calor + chuvas a chegar ────────────────────────────────
  { week: 37, monthLabel: "Outubro", tag: "Calor", title: "Calor que chega", brief:
    "Outubro em Maputo: calor sobe, primeiros aguaceiros. Tema: o corpo no calor. Cada dia: véu do corpo escondido, da vergonha, do prazer do calor, da pele exposta, do desejo, da sensualidade quotidiana, do corpo como casa." },
  { week: 38, monthLabel: "Outubro", tag: "Lua cheia", title: "Lua cheia de Outubro", brief:
    "Lua cheia de Outubro. Tema: o que está visível e ainda finges não ver. Cada dia: véu da auto-evitação, da clareza adiada, do reconhecimento, da decisão, da coragem suave, da acção pequena, da consequência." },
  { week: 39, monthLabel: "Outubro", tag: "Chuva", title: "Primeiras chuvas", brief:
    "Primeiras chuvas grandes em Maputo. Tema: a queda como presente. Cada dia: véu da subida obrigatória, da queda como falha, da queda como dádiva, do solo, da humildade da terra, do crescimento depois, do ciclo." },
  { week: 40, monthLabel: "Outubro", tag: "Sementes", title: "Sementeira", brief:
    "Sementeira em Outubro. Tema: o que plantas agora colhes em Março. Cada dia: véu da gratificação imediata, da paciência da agricultora, do cuidado diário, da fé invisível, do trabalho silencioso, da espera fértil, da colheita futura." },
  // ─── NOVEMBRO — chuvas plenas, festas ─────────────────────────────────
  { week: 41, monthLabel: "Novembro", tag: "Festa", title: "Festa interior", brief:
    "Novembro em Maputo: festas começam. Tema: festa para ti, sem performance. Cada dia: véu da socialização obrigatória, da culpa de não ir, da festa íntima, do prazer de estar só, da celebração discreta, da gratidão por estar viva, da paz festiva." },
  { week: 42, monthLabel: "Novembro", tag: "Lua nova", title: "Lua nova de Novembro", brief:
    "Lua nova de Novembro. Tema: o que pede para nascer antes do fim do ano. Cada dia: véu do não-é-altura, do agora como hora, do parto pequeno, do começar imperfeito, da urgência sagrada, do passo um, do compromisso." },
  { week: 43, monthLabel: "Novembro", tag: "Águas", title: "Cheias", brief:
    "Cheias em Maputo, ruas alagadas. Tema: o que transborda quando há demasiado. Cada dia: véu da contenção, da emoção contida, do choro libertador, da fala que verte, da escuta com generosidade, do acolher a abundância, do partilhar." },
  { week: 44, monthLabel: "Novembro", tag: "Corpo", title: "Corpo molhado", brief:
    "Tema: o corpo na chuva, no mar, no banho. Pele em água. Cada dia: véu do corpo seco, da sensorialidade negada, do banho como meditação, do mar como oração, da chuva como presente, do corpo dourado, da volta a si pela pele." },
  // ─── DEZEMBRO — solstício, festas, balanço ────────────────────────────
  { week: 45, monthLabel: "Dezembro", tag: "Lua cheia", title: "Lua cheia de Dezembro", brief:
    "Lua cheia de Dezembro. Tema: a luz no meio do calor. Cada dia: véu da exaustão de fim de ano, da auto-empurrão, do parar para ver, do balanço interior, do agradecer ao corpo, do agradecer aos que te seguraram, do agradecer-te." },
  { week: 46, monthLabel: "Dezembro", tag: "Solstício", title: "Solstício de Verão", brief:
    "Solstício de Dezembro — noite mais curta em Maputo. Tema: o pico da luz. Cada dia: véu da plenitude como obrigação, do brilho cansado, do pico breve, do declínio gentil, do corpo que abranda, da contemplação do ano, da paz." },
  { week: 47, monthLabel: "Dezembro", tag: "Família", title: "Família que enche e cansa", brief:
    "Tema: famílias em Maputo no Natal. Cada dia: véu da família ideal, das tensões reais, do papel obrigatório, da fronteira amorosa, do cuidar sem desaparecer, do receber sem culpa, do estar presente como és." },
  { week: 48, monthLabel: "Dezembro", tag: "Natal", title: "Natal sem performance", brief:
    "Semana do Natal. Tema: festa interior, sem teatro. Cada dia: véu da consumir-para-amar, da prenda performativa, do gesto verdadeiro, da presença como prenda, da escuta como dádiva, da paz como riqueza, do retorno a si." },
  { week: 49, monthLabel: "Dezembro", tag: "Fim", title: "Fim que é meio", brief:
    "Última semana do ano. Tema: fim como continuação, não corte. Cada dia: véu do encerramento dramático, do balanço de auditoria, do balanço de coração, do que dispensas com gratidão, do que levas, do passo seguinte, do colo a ti." },
  // ─── BÓNUS / SEMANAS DE TRANSIÇÃO ─────────────────────────────────────
  { week: 50, monthLabel: "Bónus 1", tag: "Sangue", title: "Ciclo menstrual", brief:
    "Tema: ciclo menstrual como mestre. Cada dia: véu da vergonha do sangue, da dor invalidada, da fase folicular como criatividade, da ovulação como abertura, da fase lútea como recolhimento, do sangrar como descanso sagrado, do ciclo como bússola." },
  { week: 51, monthLabel: "Bónus 2", tag: "Avós", title: "Linhagem feminina", brief:
    "Tema: a linhagem das mulheres antes de ti — bisavó, avó, mãe. Cada dia: véu da mãe perfeita, do trauma herdado, da força recebida, da escolha do que continuas, do que paras em ti, do amor que cura para trás, da continuação consciente." },
  { week: 52, monthLabel: "Bónus 3", tag: "Solidão", title: "Solidão acompanhada", brief:
    "Tema: estar só sem estar isolada. Cada dia: véu do isolamento doentio, da solidão fértil, da comunidade silenciosa, da rede invisível, do amigo certo na hora certa, da intimidade sem proximidade física, da casa em ti." },
];
