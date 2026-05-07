// Calendário anual de 52 semanas para Sete Ecos.
//
// Cada semana é uma colecção de 7 dias × 6 slides. Os "seeds" abaixo são
// pontos de partida — Vivianne edita / regera com Claude se quiser outra
// direcção.
//
// Voz UNIVERSAL: as estações estão descritas em ambos os hemisférios
// (frio em Jul para Norte, em Jan para Sul) ou em termos sensoriais
// agnósticos. Datas-marco usam fenómenos cósmicos (lua, equinócio,
// solstício) ou temas universais (ciclo menstrual, linhagem feminina).
// Vivianne pode ajustar para um sítio específico no momento da geração.

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
  // ─── JANEIRO ──────────────────────────────────────────────────────────
  { week: 1, monthLabel: "Janeiro", tag: "Limiar", title: "Limiar", brief:
    "Primeira semana do ano. Tema: limiar — entre o que ficou e o que pode ser, sem promessas vazias. Cada dia explora um véu que se levanta no início do ciclo: pressa de definir o ano, lista de propósitos, comparação com outros, perfeccionismo, urgência, expectativa, presença. Voz contemplativa, sem 'novo ano nova vida'." },
  { week: 2, monthLabel: "Janeiro", tag: "Pausa", title: "O que o corpo pede", brief:
    "Tema: o que o corpo pede no recomeço — descanso, água, devagar, presença. Cada dia: véu da pressa, da produtividade, do corpo invisível, do não-parar, do desconforto, da culpa de descansar, do retorno ao ritmo." },
  { week: 3, monthLabel: "Janeiro", tag: "Intensidade", title: "Intensidade que pede passagem", brief:
    "Tema: o que se solta quando a intensidade chega — emoções represadas, raiva sagrada, lágrimas adiadas. Cada dia explora um aspecto da intensidade emocional: medo dela, vergonha, expressão, contenção, alívio, integração." },
  { week: 4, monthLabel: "Janeiro", tag: "Soltar", title: "O que se deixa ir", brief:
    "Tema: o que se deixa ir — relações, padrões, identidades velhas, expectativas dos outros. Cada dia: véu do controlo, da memória, da repetição, do papel social, da culpa, do agarrar, da rendição." },
  // ─── FEVEREIRO ────────────────────────────────────────────────────────
  { week: 5, monthLabel: "Fevereiro", tag: "Lua nova", title: "Sementeira no escuro", brief:
    "Lua nova de Fevereiro — escuridão fértil. Tema: o que se planta no escuro. Cada dia explora um tipo de sementeira interior: intenções (não objectivos), perguntas, presença, escuta, lentidão, gestação, espera." },
  { week: 6, monthLabel: "Fevereiro", tag: "Fluidez", title: "Fluidez vs rigidez", brief:
    "Tema: fluidez vs rigidez. Cada dia: véu da rigidez do plano, do corpo armadura, do pensamento que circula em loop, da fala que repete, da escuta que se fecha, da fluidez como prática, da entrega." },
  { week: 7, monthLabel: "Fevereiro", tag: "Graça", title: "O dado sem mereceres", brief:
    "Tema: o que é dado sem mereceres — graça, abundância, beleza inocente. Cada dia: véu do mérito, da escassez, da gratidão performativa, da gratidão real, do receber, do partilhar, da abundância silenciosa." },
  { week: 8, monthLabel: "Fevereiro", tag: "Lua cheia", title: "Lua cheia que expõe", brief:
    "Lua cheia — luz que expõe. Tema: o que vem ao de cima quando há demasiada luz. Cada dia: véu da imagem, do desempenho, da máscara social, do conforto da noite, do ver-se sem maquilhagem, da nudez interior, da paz com o que é." },
  // ─── MARÇO ────────────────────────────────────────────────────────────
  { week: 9, monthLabel: "Março", tag: "Mulher", title: "Mulher invisível", brief:
    "Semana do 8 de Março. Tema: a mulher que se serve a todos e desaparece para si. Cada dia: véu do cuidar dos outros, do esquecer-se, da culpa de cuidar de si, da raiva escondida, da exaustão, do reconhecimento, do regresso a si." },
  { week: 10, monthLabel: "Março", tag: "Equinócio", title: "Equinócio — equilíbrio", brief:
    "Equinócio (Outono no Sul, Primavera no Norte). Tema: equilíbrio aparente, transição real. Cada dia: véu do meio do ano, da metade que escapou, do que falta, do que sobra, da pausa, do reposicionamento, da continuação sem promessa." },
  { week: 11, monthLabel: "Março", tag: "Corpo", title: "O corpo que se abre", brief:
    "Tema: o corpo que se abre quando uma estação afrouxa. Cada dia: véu do corpo enrijado, da tensão crónica, do toque suave, da respiração que se desbloqueia, do prazer doméstico, do silêncio físico, da paz neuromuscular." },
  { week: 12, monthLabel: "Março", tag: "Memória", title: "Memória do corpo", brief:
    "Tema: memória somática. O que o corpo arquiva e a mente nem sabe. Cada dia: véu do trauma silencioso, do gesto repetido, da postura herdada, da emoção encarnada, da terapia do toque, da fala do corpo, da liberdade pelo movimento." },
  // ─── ABRIL ────────────────────────────────────────────────────────────
  { week: 13, monthLabel: "Abril", tag: "Identidade", title: "As várias mulheres em ti", brief:
    "Tema: as várias mulheres em ti — a que cuida, a que luta, a que descansa, a que é. Cada dia: véu da identidade fixa, da força performativa, da fragilidade negada, da herança feminina, da linhagem, da irmandade, da liberdade." },
  { week: 14, monthLabel: "Abril", tag: "Lua nova", title: "Começar pequeno", brief:
    "Lua nova. Tema: começar pequeno. Cada dia: véu do grande gesto, da ambição vazia, do passo invisível, da paciência, do compromisso silencioso, do micro-hábito, da regularidade como amor." },
  { week: 15, monthLabel: "Abril", tag: "Recolhimento", title: "Recolhimento", brief:
    "Tema: introversão como prática. Cada dia: véu da extroversão obrigatória, da culpa de querer estar só, do barulho como evasão, do silêncio fértil, do diário, da leitura, do retiro doméstico." },
  { week: 16, monthLabel: "Abril", tag: "Lua cheia", title: "O que está pronto", brief:
    "Lua cheia. Tema: o que está pronto para colher. Cada dia: véu da espera infinita, do não-merecer, do colher antes do tempo, do reconhecimento próprio, do agradecer ao corpo, da celebração discreta, do partilhar a colheita." },
  // ─── MAIO ─────────────────────────────────────────────────────────────
  { week: 17, monthLabel: "Maio", tag: "Aconchego", title: "Aconchego como direito", brief:
    "Tema: aconchego como direito. Cada dia: véu do estoicismo, da auto-negação, do conforto envergonhado, do prazer do quente, da casa como útero, da pele em contacto, da intimidade silenciosa." },
  { week: 18, monthLabel: "Maio", tag: "Memória", title: "O que ficou", brief:
    "Tema: o que ficou do ano que passa, sem julgamento. Cada dia: véu da auto-crítica, do arrependimento, da lista de erros, da aceitação das fases, da continuidade, da curva, do amor por quem és agora." },
  { week: 19, monthLabel: "Maio", tag: "Lua nova", title: "Silêncio como semente", brief:
    "Lua nova. Tema: silêncio como semente. Cada dia: véu da fala constante, do ruído digital, da opinião, da escuta de si, da escuta dos outros, do silêncio entre frases, da pausa antes de responder." },
  { week: 20, monthLabel: "Maio", tag: "Solitude", title: "Solidão fértil", brief:
    "Tema: distinguir solidão (vazio doloroso) de solitude (presença consigo). Cada dia: véu do horror ao só, do telemóvel como muleta, da solitude desejada, do encontro consigo, da escuta interior, da paz na própria companhia, do regresso aos outros mais cheia." },
  // ─── JUNHO ────────────────────────────────────────────────────────────
  { week: 21, monthLabel: "Junho", tag: "Limite", title: "Limite que ensina", brief:
    "Tema: o que o limite te ensina. Cada dia: véu da omnipotência, do excesso, do limite como dom, do parar, do dizer não, do cuidar dos limites dos outros, da fronteira amorosa." },
  { week: 22, monthLabel: "Junho", tag: "Solstício", title: "Solstício — o escuro como mestre", brief:
    "Solstício (Inverno no Sul, Verão no Norte). Tema: o escuro/a luz extrema como mestre. Cada dia: véu do medo do escuro, da luz forçada, do mistério, do não-saber, da fé no processo, da gestação invisível, da paciência com o ciclo." },
  { week: 23, monthLabel: "Junho", tag: "Independência", title: "Independência interior", brief:
    "Tema: independência interior — não da família, do sistema, mas dos teus próprios padrões. Cada dia: véu do papel herdado, da expectativa internalizada, da voz da mãe, do pai, da cultura, da auto-autoria, da liberdade vivida." },
  { week: 24, monthLabel: "Junho", tag: "Lua cheia", title: "Clareza que dói", brief:
    "Lua cheia. Tema: clareza que dói. Cada dia: véu da auto-mentira, da racionalização, da clareza brutal, da dor da verdade, da reconciliação, do realinhamento, da nova rota." },
  // ─── JULHO ────────────────────────────────────────────────────────────
  { week: 25, monthLabel: "Julho", tag: "Meio-ano", title: "Meio do ano", brief:
    "Tema: avaliação suave do ano. Não do que falhaste, do que mudaste em ti. Cada dia: véu do performance review interior, da gratidão real, do que dispensaste, do que aprendeste, do que ainda escapa, da continuação, da paz com o ritmo." },
  { week: 26, monthLabel: "Julho", tag: "Ritmo", title: "Ritmo natural", brief:
    "Tema: o ritmo solar do corpo. Cada dia: véu da agenda artificial, do horário social, do corpo cansado mais cedo, do dormir cedo sem culpa, do sono como sagrado, do despertar com a luz, da harmonia natural." },
  { week: 27, monthLabel: "Julho", tag: "Hidratação", title: "Hidratação interior", brief:
    "Tema: secura — da pele, das ideias, do entusiasmo. Cada dia: véu da exaustão criativa, do creme como ritual, do beber água como prática, da hidratação emocional, da nutrição lenta, do contacto com o que te molha por dentro, da humidade da alma." },
  { week: 28, monthLabel: "Julho", tag: "Lua nova", title: "Viagem interior", brief:
    "Lua nova. Tema: a viagem interior. Cada dia: véu da viagem como evasão, da viagem como descoberta, da viagem sem mover, do sonho lúcido, da imaginação como portal, do regresso, da partida." },
  // ─── AGOSTO ───────────────────────────────────────────────────────────
  { week: 29, monthLabel: "Agosto", tag: "Soltar", title: "Vento que solta", brief:
    "Tema: o que se solta quando o movimento entra. Cada dia: véu do agarrar, do controlo, do soltar como prática, da inquietação, da raiva como força, da limpeza, do espaço vazio." },
  { week: 30, monthLabel: "Agosto", tag: "Identidade", title: "Quem sou agora", brief:
    "Tema: identidade fluida. Tu não és quem eras há 5 anos. Cada dia: véu do nome fixo, do papel social, da auto-imagem desactualizada, da permissão para mudar, da consistência interior através das mudanças, da nova versão, do amor pela passagem." },
  { week: 31, monthLabel: "Agosto", tag: "Lua cheia", title: "Revelação suave", brief:
    "Lua cheia. Tema: revelação suave. Cada dia: véu da revelação chocante, da dor lenta, da intuição confiável, da escuta do corpo, do sonho lúcido, da sincronia, da fé no que vai chegando." },
  { week: 32, monthLabel: "Agosto", tag: "Limpeza", title: "Deixar ir como amor", brief:
    "Tema: deixar ir como amor. Cada dia: véu do guardar tudo, da nostalgia tóxica, do deixar ir como cuidado, do ritual de despedida, do espaço criado, da chegada do novo, da gratidão pelo que foi." },
  // ─── SETEMBRO ─────────────────────────────────────────────────────────
  { week: 33, monthLabel: "Setembro", tag: "Brotar", title: "Brotar sem pressa", brief:
    "Tema: brotar sem pressa. Cada dia: véu do florir prematuro, da pressão de produzir, do brotar discreto, da raiz primeiro, da ambição doce, do crescimento orgânico, da paciência da terra." },
  { week: 34, monthLabel: "Setembro", tag: "Lua nova", title: "Recomeço sem peso", brief:
    "Lua nova. Tema: começar (de novo) sem peso do velho. Cada dia: véu da continuação por inércia, do recomeço como rito, da limpeza simbólica, da intenção sem objectivo, da fé na semente, do tempo da terra, do mistério da germinação." },
  { week: 35, monthLabel: "Setembro", tag: "Equinócio", title: "Equinócio — sombra integrada", brief:
    "Equinócio (Primavera no Sul, Outono no Norte). Tema: equilíbrio dia/noite, luz/sombra. Cada dia: véu da pureza performativa, da sombra negada, da integração, do auto-conhecimento corajoso, da aceitação de tudo, da paz com a sombra, do amor inteiro." },
  { week: 36, monthLabel: "Setembro", tag: "Visibilidade", title: "Ser vista", brief:
    "Tema: visibilidade, exposição, ser vista. Cada dia: véu do esconder-se, da auto-sabotagem, do brilho como medo, do mostrar-se aos poucos, da generosidade da presença, do impacto sem performance, da contribuição." },
  // ─── OUTUBRO ──────────────────────────────────────────────────────────
  { week: 37, monthLabel: "Outubro", tag: "Corpo", title: "Corpo na mudança de estação", brief:
    "Tema: o corpo numa nova estação. Cada dia: véu do corpo escondido, da vergonha, do prazer do toque, da pele exposta, do desejo, da sensualidade quotidiana, do corpo como casa." },
  { week: 38, monthLabel: "Outubro", tag: "Lua cheia", title: "O que está visível", brief:
    "Lua cheia. Tema: o que está visível e ainda finges não ver. Cada dia: véu da auto-evitação, da clareza adiada, do reconhecimento, da decisão, da coragem suave, da acção pequena, da consequência." },
  { week: 39, monthLabel: "Outubro", tag: "Queda", title: "Queda como presente", brief:
    "Tema: a queda como presente. Cada dia: véu da subida obrigatória, da queda como falha, da queda como dádiva, do solo, da humildade da terra, do crescimento depois, do ciclo." },
  { week: 40, monthLabel: "Outubro", tag: "Sementes", title: "Sementeira", brief:
    "Tema: o que plantas agora colhes mais tarde. Cada dia: véu da gratificação imediata, da paciência da agricultora, do cuidado diário, da fé invisível, do trabalho silencioso, da espera fértil, da colheita futura." },
  // ─── NOVEMBRO ─────────────────────────────────────────────────────────
  { week: 41, monthLabel: "Novembro", tag: "Festa", title: "Festa interior", brief:
    "Tema: festa para ti, sem performance. Cada dia: véu da socialização obrigatória, da culpa de não ir, da festa íntima, do prazer de estar só, da celebração discreta, da gratidão por estar viva, da paz festiva." },
  { week: 42, monthLabel: "Novembro", tag: "Lua nova", title: "O que pede para nascer", brief:
    "Lua nova. Tema: o que pede para nascer antes do fim do ano. Cada dia: véu do não-é-altura, do agora como hora, do parto pequeno, do começar imperfeito, da urgência sagrada, do passo um, do compromisso." },
  { week: 43, monthLabel: "Novembro", tag: "Águas", title: "O que transborda", brief:
    "Tema: o que transborda quando há demasiado. Cada dia: véu da contenção, da emoção contida, do choro libertador, da fala que verte, da escuta com generosidade, do acolher a abundância, do partilhar." },
  { week: 44, monthLabel: "Novembro", tag: "Sensorial", title: "O corpo na água", brief:
    "Tema: o corpo na água — banho, mar, chuva, lágrima. Cada dia: véu do corpo seco, da sensorialidade negada, do banho como meditação, da água como oração, da chuva como presente, do corpo dourado, da volta a si pela pele." },
  // ─── DEZEMBRO ─────────────────────────────────────────────────────────
  { week: 45, monthLabel: "Dezembro", tag: "Lua cheia", title: "Lua cheia de Dezembro", brief:
    "Lua cheia de Dezembro. Tema: a luz no fim do ano. Cada dia: véu da exaustão de fim de ano, da auto-empurrão, do parar para ver, do balanço interior, do agradecer ao corpo, do agradecer aos que te seguraram, do agradecer-te." },
  { week: 46, monthLabel: "Dezembro", tag: "Solstício", title: "Solstício — pico da luz/escuro", brief:
    "Solstício (Verão no Sul, Inverno no Norte). Tema: o pico do extremo. Cada dia: véu da plenitude como obrigação, do brilho cansado, do pico breve, do declínio gentil, do corpo que abranda, da contemplação do ano, da paz." },
  { week: 47, monthLabel: "Dezembro", tag: "Família", title: "Família que enche e cansa", brief:
    "Tema: famílias em festas. Cada dia: véu da família ideal, das tensões reais, do papel obrigatório, da fronteira amorosa, do cuidar sem desaparecer, do receber sem culpa, do estar presente como és." },
  { week: 48, monthLabel: "Dezembro", tag: "Festas", title: "Festa sem performance", brief:
    "Semana das festas. Tema: festa interior, sem teatro. Cada dia: véu da consumir-para-amar, da prenda performativa, do gesto verdadeiro, da presença como prenda, da escuta como dádiva, da paz como riqueza, do retorno a si." },
  { week: 49, monthLabel: "Dezembro", tag: "Fim", title: "Fim que é meio", brief:
    "Última semana do ano. Tema: fim como continuação, não corte. Cada dia: véu do encerramento dramático, do balanço de auditoria, do balanço de coração, do que dispensas com gratidão, do que levas, do passo seguinte, do colo a ti." },
  // ─── BÓNUS / SEMANAS DE TRANSIÇÃO ─────────────────────────────────────
  { week: 50, monthLabel: "Bónus 1", tag: "Sangue", title: "Ciclo menstrual", brief:
    "Tema: ciclo menstrual como mestre. Cada dia: véu da vergonha do sangue, da dor invalidada, da fase folicular como criatividade, da ovulação como abertura, da fase lútea como recolhimento, do sangrar como descanso sagrado, do ciclo como bússola." },
  { week: 51, monthLabel: "Bónus 2", tag: "Linhagem", title: "Linhagem feminina", brief:
    "Tema: a linhagem das mulheres antes de ti — bisavó, avó, mãe. Cada dia: véu da mãe perfeita, do trauma herdado, da força recebida, da escolha do que continuas, do que paras em ti, do amor que cura para trás, da continuação consciente." },
  { week: 52, monthLabel: "Bónus 3", tag: "Solidão", title: "Solidão acompanhada", brief:
    "Tema: estar só sem estar isolada. Cada dia: véu do isolamento doentio, da solidão fértil, da comunidade silenciosa, da rede invisível, do amigo certo na hora certa, da intimidade sem proximidade física, da casa em ti." },
];
