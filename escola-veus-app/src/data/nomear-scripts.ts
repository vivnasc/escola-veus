// Série "Nomear" — Scripts YouTube prontos para gerar audio no ElevenLabs.
// Registo: contemplativo, acolhedor, nomeador. Sem didatismo.
// Cada script inclui tags [pause] / [long pause] que o ElevenLabs v2 e v3 interpretam.

export type NomearScript = {
  id: string;
  titulo: string;
  curso: string; // slug do curso associado
  texto: string;
};

export type NomearPreset = {
  id: string;
  titulo: string;
  descricao: string;
  scripts: NomearScript[];
};

export const NOMEAR_PRESETS: NomearPreset[] = [
  {
    id: "nomear-trailer",
    titulo: "Trailer — Escola dos Véus",
    descricao: "Apresentação do canal. Primeiro vídeo que novos espectadores vêem.",
    scripts: [
      {
        id: "nomear-trailer-00",
        titulo: "Trailer Escola dos Véus",
        curso: "geral",
        texto: `[calm] Há frases que o teu corpo já sabe de cor.

[pause]

Mas que nunca ninguém te disse.

[long pause]

A culpa que chega antes da compra. O sim que sai antes do corpo decidir. A fome que não é fome. [short pause] O silêncio que pesa.

[pause]

[thoughtful] Não aprendeste estas coisas sozinha.

Aprendeste-as em cozinhas que já não existem. Em suspiros que nunca foram explicados. Em olhares que mudaram quando o assunto chegou.

[long pause]

Este canal chama-se Escola dos Véus.

[short pause]

E não se ensina nada aqui.

Nomeia-se.

[pause]

Cada vídeo é uma frase que o teu corpo já sabia — e que finalmente alguém disse em voz alta.

Cada curso é um território que ainda não te tinham mostrado.

[short pause]

Dinheiro. Corpo. Limites. Voz. Fome. Silêncio. Herança.

[short pause]

Tudo o que aprendeste a engolir.

[long pause]

Se alguma destas frases te tocou, [short pause] subscreve.

Há um novo véu a cair de cada vez.

[pause]

Escola dos Véus. [short pause] seteveus.space.`,
      },
    ],
  },
  {
    id: "nomear-serie-1",
    titulo: "Série Nomear — Episódios 1-10",
    descricao: "10 pilares YouTube: Ouro Próprio + Limite Sagrado + transversais.",
    scripts: [
      {
        id: "nomear-ep01",
        titulo: "A culpa que chega antes da compra",
        curso: "ouro-proprio",
        texto: `Há uma culpa que não é culpa.

É uma voz antiga que confunde prazer com desperdício.

Chega antes do saco chegar a casa. Chega antes de abrires a prateleira. Chega, às vezes, antes da compra.

Não aprendeste esta voz sozinha. Foi sussurrada em cozinhas que já não existem, por mulheres que achavam que estavam a proteger-te.

Tem nome.

Chama-se herança.

Está guardada em frases que nunca ouviste directamente. Em suspiros. Em hesitações à porta das lojas. Em jantares em que a tua mãe pedia o prato mais barato e depois insistia em pagar a sobremesa dos outros.

Não estás a ser difícil contigo.

Estás a ouvir mulheres que já não podem decidir se isto ainda te serve.

O que te pesa quando gastas em ti não é a conta bancária.

É o peso de quem veio antes.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep02",
        titulo: "O extracto que te lê de volta",
        curso: "ouro-proprio",
        texto: `Há uma segunda-feira à noite em que quase abriste.

Quase. O dedo pairou sobre o ecrã. O corpo hesitou antes do número.

Não é preguiça. Não é desorganização.

É que há muito tempo aprendeste que o extracto não é uma lista.

É um veredicto.

Aprendeste isto sem ninguém te explicar. Talvez numa cara que mudou quando o cartão foi recusado. Talvez numa pausa antes de uma resposta. Talvez num suspiro que ouviste sem saber que o estavas a ouvir.

O que o extracto guarda não são só os teus gastos.

É cada decisão que tomaste quando estavas cansada. Cada compra feita à uma da manhã porque não conseguias dormir. Cada café pago depois da reunião difícil. Cada presente que deste quando não era dia de presentes — só precisavas de provar alguma coisa.

O extracto sabe coisas sobre ti que tu ainda não tiveste coragem de nomear.

E tu, quando o fechas depressa, não estás a adiar um número.

Estás a adiar uma conversa.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep03",
        titulo: "A vergonha que inventa desculpas",
        curso: "ouro-proprio",
        texto: `Há uma desculpa que repetes há anos.

"Hoje não me apetece." "Tenho um compromisso." "Talvez para a próxima."

As palavras saem fáceis. Já as tens de cor.

Mas não era de cansaço que te protegias. Não era de tempo. Era de uma outra coisa, mais antiga, que não consegues dizer em voz alta sem que o corpo se contraia.

Tem nome — e é antigo.

Vergonha.

A vergonha de não ter como os outros. A vergonha de dividir a conta e ficar sem dinheiro até sexta. A vergonha de escolher o prato mais barato e depois mentir que era isso mesmo que querias.

A vergonha de não ter aprendeu a disfarçar-se tão bem que tu já não a reconheces como vergonha.

Passou a ser "personalidade".

Tu és a que "não gosta muito de jantares". A que "prefere ficar em casa". A que "tem pouco tempo para essas coisas".

E cada vez que dizes não assim, não poupas dinheiro.

Perdes uma noite que era para ser tua.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep04",
        titulo: "O desconto que deste sem ninguém pedir",
        curso: "ouro-proprio",
        texto: `Estavas a escrever o valor. Fizeste as contas. Era justo.

E no último segundo, tiraste um bocado.

Ninguém tinha pedido. Ninguém tinha regateado. Foste tu.

Tu e uma voz que disse, sem tu sequer a ouvires claramente: se pedires o valor inteiro, vão achar que não vales tanto.

O desconto que deste não foi generosidade.

Foi medo a passar por generosidade.

É o desconto automático.

Aprendeste-o antes de saberes cobrar. Aprendeste-o em mulheres da tua família que serviam primeiro os outros e comiam o que restava. Em mães que diziam que não tinham fome para que os filhos pudessem repetir. Em avós que passaram a vida inteira a pedir desculpa por ocuparem espaço que era delas.

O desconto que ninguém te pediu não é um gesto pequeno.

É uma herança a atravessar-te sem que a consultes.

E cada vez que baixas o preço antes da outra pessoa falar, não estás a ser gentil.

Estás a ensinar o mundo onde te colocas.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep05",
        titulo: "As mulheres que ficam por matemática",
        curso: "ouro-proprio",
        texto: `Há uma conversa que nunca se tem em voz alta.

Aparece a sós, à noite, quando a casa já se calou.

Não é uma conversa sobre amor. É sobre matemática.

Quanto custa sair. Para onde ir. Com que dinheiro. Como pagar renda sozinha. Como explicar aos outros.

Há mulheres que ficam em relações não por amor. Por matemática.

Ninguém fala disto em voz alta porque é das coisas mais difíceis de nomear sem sentir que se está a trair alguém. A trair o amor que um dia houve. A trair a versão de si que escolheu ficar. A trair a história que contam aos outros.

Mas a matemática não se trai. Continua a fazer contas, silenciosamente, mês após mês.

E tu, à noite, quando a casa se cala, continuas a fazer contas com ela.

Tem nome.

Chama-se dependência financeira.

E não é uma prisão com grades. Basta não haver para onde ir.

A liberdade não é um sentimento.

É um número que precisas de conhecer.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep06",
        titulo: "A fome que não é fome",
        curso: "ouro-proprio",
        texto: `Há uma fome que não se sacia com comida.

Não se sacia com dinheiro. Não se sacia com presentes. Não se sacia com elogios.

Sacia-se com uma só coisa. E tu ainda não a sabes nomear.

Esta fome aparece à noite. Abre-te o frigorífico quando não tens fome. Abre-te o telefone quando não precisas de ver nada. Faz-te comprar coisas que não querias, ligar a pessoas que não queres ouvir, dizer sim a planos que não te apetecem.

A fome tenta preencher-te com o que estiver à mão.

Raramente acerta.

Porque a fome não é por aquilo que lhe dás. É por aquilo que não lhe consegues dar.

Há palavra antiga para isto: falta de presença. Falta de pertença. Falta de permissão para ser quem és quando ninguém está a ver.

Isto não se compra. Não se poupa. Não se herda.

Faz-se devagar.

Por gestos pequenos que começam por parecer desperdícios.

Até se tornarem a única coisa que faz sentido.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep07",
        titulo: "O sim que sai antes do corpo decidir",
        curso: "limite-sagrado",
        texto: `A pergunta ainda não acabou e o sim já saiu.

Saiu da boca antes de ter passado pelo corpo.

Saiu sozinho, como se tivesse vida própria. Como se já soubesse a resposta desde sempre.

Só depois, horas depois, às vezes dias depois, é que o corpo começa a responder.

Com um aperto. Com um cansaço sem razão. Com aquela vontade estranha de cancelar tudo e ficar sozinha numa sala escura.

O corpo estava a dizer outra coisa. O corpo queria dizer não.

Mas o sim foi mais rápido.

O nome é antigo: o sim automático. O sim que já existia antes da pergunta. O sim que aprendeste em cada vez que a tua hesitação foi interpretada como rudeza. Em cada vez que alguém ficou zangado contigo por tu teres precisado de tempo. Em cada vez que foi mais fácil concordar do que explicar.

O corpo sabe dizer não.

Só não te ensinaram a ouvi-lo a tempo.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep08",
        titulo: "O silêncio que pesa",
        curso: "limite-sagrado",
        texto: `Nem todo o silêncio é paz.

Há silêncios que são acumulação.

A conversa que devias ter. A pergunta que nunca fizeste. A verdade que engoliste porque não era o momento certo. Porque nunca é o momento certo.

Os silêncios não desaparecem.

Sedimentam-se.

Vão-se depositando em lugares do corpo onde passas a sentir uma tensão sem nome. Nos ombros. Na mandíbula. Numa respiração que aprende a ser mais curta para não acordar o que está guardado.

E tu continuas a chamar elegância ao que é, na verdade, peso.

Continuas a chamar paciência ao que é cansaço.

Continuas a chamar maturidade ao que é medo de confronto.

Tem nome.

Chama-se silêncio que pesa.

Não é o silêncio dos que escolheram calar. É o silêncio dos que nunca foram perguntados.

E a boa notícia — se a conseguires ouvir — é esta.

O silêncio também se pousa.

Mas só depois de lhe dares nome.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep09",
        titulo: "As frases que aprendeste sem aula",
        curso: "ouro-proprio",
        texto: `A tua mãe nunca se sentou contigo a dar uma aula.

Mas ensinou-te tudo.

Em frases soltas na cozinha. Em suspiros antes de abrir as contas. Em caras que mudavam quando o assunto aparecia.

Aprendeste sem saber que estavas a aprender.

Tu pensavas que estavas a brincar, a comer, a olhar pela janela.

O corpo, esse, ouvia.

E guardou.

As frases que aprendeste sem aula são as que mais firmemente te prendem. Porque nunca te foram ditas como conselho. Nunca as questionaste porque nunca tiveste com que comparar.

Para ti, não eram frases. Eram a realidade.

"Isto não é para nós."

"Não se fala de dinheiro."

"Temos de ter cuidado."

"Se calhar é melhor não."

E agora, décadas depois, quando o teu salário entra e alguma coisa dentro de ti já sabe — antes de teres visto o número — que não vai chegar.

Não és tu a pensar isso.

É a voz que aprendeste antes de saberes o que era aprender.

Metade do que acreditas sobre dinheiro não é teu.

Foi-te dado antes de saberes recusar.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep10",
        titulo: "A liberdade como número",
        curso: "ouro-proprio",
        texto: `A liberdade não é um sentimento.

Às vezes é. Mas começa antes. Começa num número.

O número de que precisas para viver um mês sozinha, com dignidade, sem pedir nada a ninguém que não queiras pedir.

Renda. Comida. Transporte. O básico do teu corpo. O mínimo da tua vida.

Muitas mulheres passaram a vida inteira sem nunca calcular este número. Porque calcular é admitir que a liberdade tem preço. E admitir que tem preço é admitir que há lugares onde não se é livre.

A vagueza protege. A vagueza mantém a esperança de que um dia, um dia, tudo se resolverá sozinho. Sem teres de fazer uma conta difícil.

Mas enquanto não sabes o teu número, o medo fica maior do que precisa de ser.

Porque o medo alimenta-se de "não sei". Alimenta-se de "talvez". Alimenta-se de "depois vejo".

No dia em que fazes a conta, o medo não desaparece.

Mas deixa de mandar sozinho.

Porque passas a saber exactamente onde estás, e exactamente o que te falta.

E isso, mesmo que não mude a conta amanhã, muda o corpo hoje.

A liberdade começa na hora em que decides saber.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
    ],
  },
  {
    id: "nomear-serie-2",
    titulo: "Série Nomear — Ep 11-16 (Sangue e Seda + Silêncio)",
    descricao: "Sangue e Seda (corpo feminino, ciclo, herança materna) + O Silêncio que Grita (silêncio familiar).",
    scripts: [
      {
        id: "nomear-ep11",
        titulo: "O ciclo que te ensinaram a esconder",
        curso: "sangue-e-seda",
        texto: `Era sempre assim. Um embrulho discreto, um tom mais baixo, um sorriso de canto.

Aprendeste a esconder isto antes de saberes o que era isto.

Tem nome. Chama-se ciclo. Menstruação. Sangue.

Nenhuma destas palavras foi fácil na tua casa. Eram ditas quase em código. Como se o teu corpo tivesse de pedir desculpa por uma coisa que fazia há milhões de anos.

Aprendeste a embalar. A esconder os pensos. A não deixar marcas. A sorrir num dia em que o corpo ardia.

E agora, décadas depois, ainda te calas quando era para dizeres: hoje não posso. Hoje dói. Hoje preciso de parar.

Tem nome o que te prende.

Chama-se vergonha do que o corpo faz sem licença tua.

É das heranças mais antigas que se atravessam entre mulheres. Passam da avó para a mãe, da mãe para ti. Sem ninguém declarar. Como se fosse peso e não legado.

Não és tu que pedes desculpa.

Eram todas as que vieram antes. E deixaram o pedido contigo — sem saber que te estavam a deixar um fardo.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep12",
        titulo: "A dor que tu chamas normal",
        curso: "sangue-e-seda",
        texto: `Há uma dor que tu chamas normal.

Dói-te a cabeça. O peito. A barriga. As costas.

E a primeira reacção já nem é de te doer. É de continuares. De tirar o comprimido. De não parar.

Chamas normal ao que devia parar-te a vida e não para.

Aprendeste isto onde? Em mulheres que continuaram. Em avós que lavaram roupa com as mãos gretadas e não se queixaram. Em mães que foram para o trabalho com febre. Em amigas que disseram "já passou" quando claramente não tinha passado.

O que tu chamas normal é resistência crónica.

E resistência crónica tem um preço.

Sabes o preço.

Não é a dor que pede para ser ouvida. É a parte de ti que decidiu há muito tempo que tinha de aguentar para ser respeitada.

Essa parte está cansada.

E dói-te também por isso.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep13",
        titulo: "As mulheres que vieram antes do teu útero",
        curso: "sangue-e-seda",
        texto: `O teu útero não começou em ti. Começou muito antes.

Cada óvulo que hoje habita o teu corpo já habitou o corpo da tua mãe. Ela já os carregava quando ainda era feto no corpo da tua avó.

Três gerações, ao mesmo tempo, num único corpo.

Tu és fisicamente composta de mulheres que nunca conheceste.

As decisões delas sobre o corpo. O que tiveram de engolir. O que nunca puderam dizer. As escolhas que fizeram por amor, por medo, por falta de outra opção.

Tudo isso corre em ti sem precisar de explicação.

Tem nome.

Chama-se herança biológica.

E quando sentes um aperto sem razão, uma tristeza que não é tua, um cansaço mais antigo que os teus anos — não estás a ser dramática. Estás a sentir uma linha inteira de mulheres que te trouxe até aqui.

Não és só tu que habitas este corpo.

Tu és a primeira destas mulheres que vai ter tempo para se ouvir.

E isso, só isso, muda tudo.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep14",
        titulo: "As coisas que não se falam à mesa",
        curso: "o-silencio-que-grita",
        texto: `Havia uma mesa, na tua infância, onde não se falava.

Falavam. Sobre o tempo. Sobre a comida. Sobre a vizinha. Sobre a novela.

Mas as coisas importantes ficavam do lado de fora da mesa.

A depressão da tua tia. O primeiro casamento da tua mãe. A dívida que se arrastava. A dor que se mascarava de paciência.

Aprendeste a mesa como se aprende uma regra: o que importa não se diz. O que dói cala-se. A harmonia é mais importante do que a verdade.

E agora, já adulta, percebes que não sabes ter certas conversas.

Porque nunca as viste acontecer.

Herdaste palavra para isto: silêncio que mantém a ordem.

Mas a ordem que se mantém com silêncio é apenas silêncio organizado.

Não é paz.

E quando finalmente começas a dizer o que te foi sendo calado, não estás a quebrar a família.

Estás a deixar de a manter inteira sozinha.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep15",
        titulo: "O que o silêncio do teu pai te ensinou",
        curso: "o-silencio-que-grita",
        texto: `O teu pai talvez não fosse violento. Talvez nunca tenha levantado a voz. Talvez fosse, até, um homem bom.

Mas era um homem silencioso.

E o silêncio de um pai ensina.

Ensina que o que sentes é assunto teu. Que pedir ajuda é incomodar. Que perguntar é indiscreto. Que mostrar tristeza é fraco.

Aprendeste a ser forte antes de perceberes que ainda eras criança.

Aprendeste a resolver sozinha coisas que não cabiam nas tuas mãos.

Não foi o que ele disse que te marcou. Foi o que ele não disse.

Tem nome.

Chama-se herança silenciosa.

E agora, já adulta, procuras homens que te perguntem.

E assustas-te quando te perguntam mesmo.

Porque não sabes como se recebe uma pergunta que não tens de resolver sozinha.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep16",
        titulo: "As perguntas que não podias fazer em criança",
        curso: "o-silencio-que-grita",
        texto: `Havia perguntas que sabias, desde muito nova, que não se faziam.

Sobre dinheiro. Sobre sexo. Sobre a morte. Sobre aquela pessoa da família que ninguém mais mencionava. Sobre por que é que o teu pai tinha aquela cicatriz. Sobre por que é que a tua mãe chorava sozinha na cozinha.

Não era ninguém que te tinha proibido. Era uma coisa que aprendias por instinto.

Do silêncio que vinha depois de certas palavras.

Do olhar que se desviava.

Da mão que mudava de assunto.

Aprendeste a censura antes de ter a palavra para ela.

E agora, já adulta, há perguntas que continuas a evitar. Até contigo mesma.

Tem nome.

Chama-se curiosidade morta à nascença.

E a verdade é esta: há perguntas tuas que só tu podes finalmente fazer.

A ti. Em voz alta. Ou em silêncio, se for o caso.

Mas fazer.

Porque enquanto não perguntas, outro silêncio cresce dentro de ti.

E o silêncio que herdaste não precisa de filhos.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
    ],
  },
  {
    id: "nomear-serie-3",
    titulo: "Série Nomear — Ep 17-25 (Pele Nua + A Fome + A Chama)",
    descricao: "Pele Nua (corpo nu, vergonha do corpo) + A Fome (fome emocional) + A Chama (desejo).",
    scripts: [
      {
        id: "nomear-ep17",
        titulo: "O corpo que só olhas com roupa",
        curso: "pele-nua",
        texto: `Há um corpo que só olhas quando está vestido.

No espelho da entrada, antes de saíres. No reflexo da montra, de passagem. Na fotografia em que já escolhes o ângulo antes de aparecer.

Mas sem roupa, não olhas.

Vestes-te depressa depois do banho. Apagas a luz antes de te despires à noite. Evitas o espelho do quarto como quem evita uma sala de interrogatório.

Não é só pudor. É mais antigo.

Aprendeste, em algum momento, que o teu corpo nu não era uma coisa boa.

Talvez numa comparação. Talvez numa piada. Talvez num silêncio da tua mãe quando te mediste. Talvez num manual para meninas que te entregaram sem te perguntarem se o querias.

Há palavra para isto: vergonha do corpo sem vestido.

E o mais cruel é isto: o corpo nunca te deu motivo para essa vergonha.

Ela foi-te ensinada antes dele ter tempo de se mostrar a ti.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep18",
        titulo: "A pele que nunca foi só tua",
        curso: "pele-nua",
        texto: `Desde muito cedo, o teu corpo foi um corpo olhado.

Antes de saberes o que sentias sobre ele, já sabias o que os outros sentiam.

Os comentários dos adultos sobre o teu peso. Sobre a tua altura. Sobre os teus cabelos. Sobre se "estavas a ficar uma mulherzinha".

A avó que te puxava para o colo quando eras fininha e se afastava quando cresceste.

O tio que disse, num jantar, uma frase que nunca esqueceste — mesmo não sendo capaz, agora, de a repetir.

A primeira vez que te sentiste vista de uma forma que não pediste.

A tua pele nunca foi só tua.

O que cresceu em ti tem nome antigo: a vigilância precoce do próprio corpo.

E agora, já adulta, ainda te medes antes de ser medida. Ainda te corriges antes de ser corrigida. Ainda te explicas antes de alguém perguntar.

Mas a pele pode voltar a ser tua.

Começa pelo dia em que deixas de pedir licença para a tua própria forma.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep19",
        titulo: "O espelho que evitas de manhã",
        curso: "pele-nua",
        texto: `Há um espelho que evitas de manhã.

Passas por ele depressa. Fazes o que tens de fazer sem o olhar de frente. Quando, por descuido, o olhas, há um pequeno vazio — como se tivesses apanhado uma estranha no espelho.

Não é que não te reconheças. É que esperavas outra coisa.

A mulher do espelho parece cansada. Parece mais velha. Parece menos do que tu achavas que ias ser nesta altura da tua vida.

É luto. Luto de uma versão de ti que não aconteceu.

E esse luto é silencioso. Não tem ritual. Não tem data. Ninguém te pergunta se estás bem.

Tu simplesmente continuas.

Mas o espelho, esse, nota tudo.

E a cada manhã em que passas por ele sem o olhar, perdes a hipótese de dizer à mulher real: eu vejo-te.

Ela espera por isso há anos.

Não para seres diferente.

Para seres finalmente olhada por ti.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep20",
        titulo: "A fome que chega antes das 11",
        curso: "a-fome",
        texto: `Há uma fome que chega quase sempre à mesma hora.

Não é a das três da tarde, nem a das oito.

É a das onze da manhã. Ou a da meia-noite. Ou a das três, numa madrugada que não conseguias dormir.

Chega quando o trabalho aperta. Quando uma conversa termina mal. Quando alguém diz uma coisa que te abriu um buraco onde não devia haver buraco nenhum.

Vais ao frigorífico. Ao armário. À gaveta das bolachas.

Comes sem fome.

E, enquanto comes, o buraco fecha-se um bocado.

Esta fome tem nome: é a fome emocional.

E não é fraqueza. É inteligência. O corpo encontrou uma forma de regular o que a mente ainda não sabe nomear.

Comes para estar presente. Comes para te distrair. Comes para sentir qualquer coisa além do que estavas a sentir.

Não precisas de parar de comer.

Precisas de saber que comer não é o problema. O problema é a coisa que tu ainda não nomeaste antes de abrires a porta do frigorífico.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep21",
        titulo: "O que a tua boca pede que não é comida",
        curso: "a-fome",
        texto: `Há coisas que a tua boca pede que não são comida.

Pede conversa quando não há ninguém. Pede toque quando estás há semanas sem ser tocada. Pede descanso quando só te dás pausas para comer.

Como a mente não te deixa parar para pedir o que realmente precisas, o corpo aprende a pedir pela boca.

Porque pela boca é aceitável.

Podes sair da reunião para comer. Não podes sair para chorar.

Podes abrir o frigorífico à meia-noite. Não podes ligar a alguém à meia-noite só para dizer que te sentes sozinha.

Chamemos-lhe o único pedido que aprendeste a fazer sem vergonha.

E o truque não é fechar a boca. É aprender a fazer os outros pedidos.

Em voz alta. A ti e aos outros.

A boca já faz o trabalho dela há muito tempo.

Está cansada de pedir sozinha por todo o corpo.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep22",
        titulo: "As noites em que te esqueces de ti até ao frigorífico",
        curso: "a-fome",
        texto: `Há noites em que só te lembras que existes quando chegas ao frigorífico.

Passaste o dia a cuidar. A responder. A resolver. A estar presente para todos menos para ti.

E quando finalmente a casa se cala e tu ficas sozinha, o corpo começa a pedir.

Pede sal. Pede açúcar. Pede gordura.

Pede com urgência. Como se tivesse estado a segurar-se o dia inteiro.

Porque tinha.

O que tu chamas gula, à meia-noite, tem outro nome.

Chama-se a primeira vez que te dás atenção desde que acordaste.

Não é a comida que procuras.

É a presença.

E como a única presença disponível àquela hora é a tua — e a tua só se lembra de ti na boca — vais ao frigorífico.

Não precisas de parar de ir.

Precisas de começares a chegar a ti mais cedo no dia.

Antes do frigorífico.

Antes do cansaço.

Enquanto ainda era possível escolheres de outra forma.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep23",
        titulo: "O desejo que aprendeste a esconder",
        curso: "a-chama",
        texto: `Houve uma idade em que o teu desejo se calou.

Não desapareceu. Só aprendeu que era melhor não ser visto.

Aprendeu com um comentário de família. Com um silêncio estranho quando perguntaste algo a uma amiga. Com a primeira vez que um corpo adulto olhou o teu e tu não soubeste se aquilo era bom ou perigoso.

O desejo recolheu-se.

E tu aprendeste que havia duas versões de ti: a versão aceitável e a que tinha vontades.

A que tinha vontades passou a ser privada. Guardada. Às vezes até a ti mesma.

Tem nome o que aprendeste.

Chama-se educação do desejo feminino. A aprendizagem silenciosa de que querer era perigoso.

E agora, já adulta, há partes de ti que nem sabes se ainda sabem o que querem.

Porque não lhes deste palavras.

Porque nunca ninguém as deixou em voz alta sem escândalo.

O desejo não se perdeu.

Só está à espera de ser devolvido a ti.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep24",
        titulo: "O prazer que pedes sempre desculpa",
        curso: "a-chama",
        texto: `Há um prazer que, mesmo quando o tens, vem com um pedido de desculpa.

A comida que te soube demasiado bem — e tu dizes "hoje exagerei".

A noite em que rires alto demais — e tu dizes "desculpa, estou eufórica".

O prazer físico que chega sem que estivesses à espera — e tu o desmontas depressa, antes de te sentires frívola.

Aprendeste, em algum momento, que sentir bem demais era perigoso.

Que mulheres que se deixavam sentir eram julgadas.

Que ter prazer sem função era indecente.

Então construíste um filtro entre ti e o prazer.

Todo o que sentes passa por ele. Chega-te mais fraco. Mais seguro. Mais apropriado.

Tem nome o filtro.

Chama-se culpa do prazer.

E não tens de o tirar hoje. Mas podes, um dia de cada vez, deixar passar uma coisa sem filtrar.

Um pequeno prazer inteiro.

Sem desculpa.

E o corpo lembra-se, de repente, do que era ser teu.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep25",
        titulo: "As noites em que o corpo pede e tu calas",
        curso: "a-chama",
        texto: `Há noites em que o corpo pede.

Não de uma forma escandalosa. De uma forma quieta. Uma vontade de ser tocada. Uma fome pela tua própria pele. Uma inquietação que não é ansiedade — é vida.

E tu calas.

Achas que é tarde. Que não é a altura. Que não é apropriado desejares sozinha. Que vais dormir em vez disso.

Dormes. Mas algo dentro de ti fica acordado.

Tem nome o que cala.

Chama-se renúncia automática ao próprio corpo.

Aprendeste-a cedo. De cada vez que o teu desejo era mais inconveniente do que o horário. De cada vez que havia mais coisas importantes do que escutar o que o corpo estava a pedir.

Hoje, já adulta, renúncias no automático. Sem pensar. Sem notar.

Mas o corpo nota tudo.

E cada pedido teu que é calado é uma retirada pequena — da vitalidade, da ligação contigo, do sentires-te inteira.

Ouvir o corpo não começa com sexo.

Começa com notar que ele, afinal, estava a pedir alguma coisa.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
    ],
  },
  {
    id: "nomear-serie-4",
    titulo: "Série Nomear — Ep 26-34 (Voz de Dentro + Mulher Antes de Mãe + Peso e Chão)",
    descricao: "Voz de Dentro (intuição) + A Mulher Antes de Mãe (maternidade) + O Peso e o Chão (cansaço, peso).",
    scripts: [
      {
        id: "nomear-ep26",
        titulo: "A voz que sabia primeiro",
        curso: "voz-de-dentro",
        texto: `Houve sempre uma voz que sabia primeiro.

Antes da prova. Antes da confirmação. Antes de teres argumentos para o que estavas a sentir.

Sabia que aquela amizade não era segura, apesar dos sinais todos dizerem o contrário.

Sabia que aquele trabalho não era para ti, mesmo quando todos diziam que era a oportunidade da tua vida.

Sabia que aquela relação já tinha acabado, meses antes de ter acabado oficialmente.

E tu, quase sempre, calavas a voz.

Esperavas pela prova. Achavas que estavas a exagerar. Disseste a ti mesma "não posso decidir assim, sem razão".

Tem nome o que calaste.

Chama-se intuição.

E foi-te ensinado a desconfiar dela. A esperar por argumento racional. A pedir opinião. A procurar consenso.

Mas a voz que sabia primeiro continua lá.

Desde o início, não se enganou uma única vez.

Só não tiveste coragem, nem permissão, nem prática — de a ouvir a tempo.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep27",
        titulo: "O sim que dizes quando o corpo diz não",
        curso: "voz-de-dentro",
        texto: `Há momentos em que dizes sim com a boca e não com o corpo.

O aperto no peito. A respiração que fica curta. A barriga que se fecha. As costas que ficam tensas.

O corpo grita não.

E tu sorris, e dizes claro, e combinas a data.

Aprendeste a interpretar o não do corpo como timidez. Como insegurança. Como dificuldade em ser agradável.

Então passas por cima. Achas que estás a crescer. Achas que é assim que se supera o medo.

Mas nem sempre era medo.

Às vezes era sabedoria.

Tem nome o que atropelas.

Chama-se informação do corpo.

E quando atropelas sistematicamente, o corpo vai deixando de avisar. Torna-se mais quieto. Menos preciso. Mais cansado.

Até um dia em que olhas para a tua vida e não entendes como chegaste aqui.

Chegaste porque disseste muitos sins quando o corpo estava a dizer não.

E agora é bonito começar a ouvir mesmo a primeira resposta que o corpo dá.

Antes de tu a traduzires para o que é aceitável.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep28",
        titulo: "A certeza que chega sem razão",
        curso: "voz-de-dentro",
        texto: `Há certezas que chegam antes das razões.

Não são opiniões. Não são palpites.

São uma espécie de saber anterior à explicação. Uma clareza que nasce sem que consigas dizer de onde vem.

E como não a consegues justificar, desconfias dela.

Procuras argumentos. Pedes opinião. Adias a decisão enquanto tentas montar um caso racional para uma coisa que, no fundo, já está decidida em ti.

Às vezes a razão chega. E confirma.

Às vezes a razão nunca chega. E tu percebes, anos depois, que o saber original estava certo.

Tem nome esta certeza.

Chama-se saber do corpo.

Um conhecimento antigo, anterior à linguagem, que o teu sistema nervoso soube primeiro. Porque leu tudo ao mesmo tempo — o tom de voz, a pausa antes da palavra, a postura da pessoa, a pequena inconsistência que a mente não captou.

Não é magia.

É inteligência mais rápida do que a razão.

E tu podes, a pouco e pouco, aprender a confiar nela outra vez.

Sem pedir autorização a ninguém.

Nem a ti própria.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep29",
        titulo: "A mulher que existia antes de seres mãe",
        curso: "a-mulher-antes-de-mae",
        texto: `Houve uma mulher, antes de seres mãe.

Tinha gostos. Tinha roupa que escolhia para ela. Tinha vontade de ir a sítios. Tinha projectos que não eram sobre ninguém.

Nem sempre te lembras dela.

Porque desde que te tornaste mãe, a tua identidade foi sendo escrita por cima da anterior. Como um palimpsesto. Vê-se vagamente o que estava lá. Mas o que se lê agora é outra coisa.

Ser mãe tornou-se uma categoria total.

Não a tua profissão. Não uma das tuas dimensões. Uma identidade que, se a retirasses, parecia sobrar pouco.

Tem nome o que se apagou.

Chama-se mulher anterior.

E ela não desapareceu. Só se calou porque havia coisas mais urgentes do que ela.

Mas em noites calmas, em silêncios inesperados, quando os miúdos dormem e tu tens uma hora só para ti — ela ainda está ali. A pedir para ser lembrada.

Não é contra os teus filhos. É a favor da mulher que eles precisam de encontrar quando forem adultos.

Uma que ainda saiba quem é.

Sem pedir desculpa por isso.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep30",
        titulo: "O nome que perdeste quando te chamaram mãe",
        curso: "a-mulher-antes-de-mae",
        texto: `A partir de um certo dia, passaram a chamar-te mãe.

Nas consultas. Na escola. Nos grupos de whatsapp. Às vezes até em casa.

"A mãe da Maria." "A mãe do João." "Mãe, podes vir?"

O teu nome foi-se apagando devagar. Sem ninguém o fazer de propósito.

Mas tu foste perdendo o hábito de o ouvir.

E às vezes, numa reunião, quando alguém te pergunta "como é que tu estás?" — ficas sem resposta. Porque o "tu" em ti está sem prática.

Tem nome o que se perdeu.

Chama-se identidade própria, submergida pelo papel.

E não há nada errado em seres mãe. Não há nada errado em amares os teus filhos intensamente.

Mas há algo triste quando a mulher que te habita só é chamada pelo nome dos outros.

Recupera o teu nome. Em silêncio, primeiro. Em voz alta, depois.

Mesmo que seja só uma ou duas vezes por dia.

Tu continuas a ser tu.

Mesmo quando és mãe.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep31",
        titulo: "As coisas que deixaste de querer porque te convenceste que não era hora",
        curso: "a-mulher-antes-de-mae",
        texto: `Houve coisas que querias.

Um curso. Uma viagem. Um projecto. Uma mudança profissional. Um momento só para ti.

E tu foste adiando.

Quando eles forem mais crescidos. Quando a casa estiver mais calma. Quando tiver mais dinheiro. Quando não fizer falta a ninguém.

Aprendeste a versão nobre do adiamento.

Chama-se-lhe sacrifício. Chama-se-lhe dedicação. Chama-se-lhe ser boa mãe.

Mas a verdade, que ninguém diz em voz alta, é esta: os filhos nunca param de precisar. A casa nunca fica calma. O dinheiro nunca é suficiente.

Se esperares pelo momento certo, o momento certo não chega.

E as coisas que querias deixam, a pouco e pouco, de ser desejadas. Não porque desaparecessem.

Porque tu aprendeste a calá-las.

Tem nome o que calaste.

Chama-se renúncia disfarçada de hora errada.

E tu podes querer outra vez. Pequenas coisas primeiro. Uma hora na semana. Uma tarde no mês.

Não para abandonar quem amas.

Para te reencontrares antes de ser tarde.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep32",
        titulo: "O cansaço que não passa com descanso",
        curso: "o-peso-e-o-chao",
        texto: `Há um cansaço que não passa com descanso.

Dormes oito horas. Acordas cansada.

Tens um fim-de-semana inteiro. E quando chega segunda, sentes-te vazia.

Vais de férias. E voltas exausta.

Este cansaço não é físico. É mais profundo.

Tem nome.

Chama-se esgotamento de quem carrega o que não é só seu.

O peso emocional das pessoas à tua volta. As decisões que tens de tomar em silêncio. A vigilância constante por todos os detalhes que ninguém mais nota.

As mulheres, sobretudo as que cuidam, aprendem cedo a fazer isto. E a nunca pousar.

O teu corpo pede descanso.

O teu sistema nervoso pede outra coisa.

Pede um lugar onde possas finalmente não pensar em ninguém. Onde ninguém precise de ti. Onde não tens de ser útil, nem competente, nem responsável.

Esse lugar não é férias.

É um direito.

E enquanto não o tiveres, o cansaço vai parecer um defeito teu.

Não é.

É uma consequência de teres feito tempo inteiro o trabalho que é suposto dividir-se.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep33",
        titulo: "O peso que chamas aguentar",
        curso: "o-peso-e-o-chao",
        texto: `Aprendeste a chamar aguentar ao que não tem nome.

Aguentas o emprego que te desgasta. Aguentas a relação que já não é relação. Aguentas a conversa difícil em família. Aguentas o silêncio em que te sentes sozinha.

Aguentar tornou-se a tua linguagem.

E como aguentar é uma virtude que aprendeste a honrar — vieste de mulheres que aguentaram muito — tu continuas. Sem perguntar até quando.

Tem nome o que cresce por baixo.

Chama-se peso acumulado.

E este peso não se vê num exame. Não se mede num check-up. Não tem diagnóstico.

Mas vê-se nos teus ombros. Nas tuas noites sem dormir. Na forma como, ao fim do dia, pareces mais velha do que estavas de manhã.

Aguentar não é nobre quando é crónico.

É só uma forma lenta de te perderes.

Há alturas em que a coisa mais corajosa não é aguentar mais um pouco.

É dizer, em voz alta ou em silêncio, mas dizer: isto já pesa demais. E eu não tenho de levar isto sozinha.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep34",
        titulo: "O corpo que pede para parar",
        curso: "o-peso-e-o-chao",
        texto: `O teu corpo tem pedido para parar há algum tempo.

Tu já reparaste. A dor nas costas que não desaparece. A tensão na mandíbula que acordas a sentir. A respiração que só consegues aprofundar quando te lembras — e logo volta ao curto.

O corpo pede de várias formas. Primeiro sussurra. Depois fala. Depois grita. Depois força-te a parar.

Se não o ouves, ele escolhe por ti.

Uma gripe que te deita três dias. Uma dor que te impede de trabalhar. Um sintoma que exige atenção médica.

Tem nome o que o corpo faz.

Chama-se protecção forçada.

Porque quando tu não escolhes parar, ele escolhe por ti.

Não é castigo. É sabedoria.

Mas é brutal. E evitável.

O corpo não pede descanso porque és fraca. Pede porque estás a pedir-lhe demais.

E cada vez que o ignoras por mais um dia, estás a confirmar-lhe que ele só será ouvido quando partir.

Podes mudar isto.

Começar a parar antes de seres parada.

Começar a escolher antes de deixares de poder escolher.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
    ],
  },
  {
    id: "nomear-serie-5",
    titulo: "Série Nomear — Ep 35-43 (Depois do Fogo + A Teia + A Coroa Escondida)",
    descricao: "Depois do Fogo (luto, recomeços) + A Teia (rede de mulheres) + A Coroa Escondida (autoridade interna).",
    scripts: [
      {
        id: "nomear-ep35",
        titulo: "O luto que ninguém te deixou fazer",
        curso: "depois-do-fogo",
        texto: `Há perdas que tiveste e nunca pudeste chorar.

Uma amizade que se desfez sem explicação. Um emprego que te mostrou a porta. Uma versão tua que desapareceu sem que ninguém notasse.

Não houve ritual. Não houve condolências. Não houve tempo.

Continuaste a viver como se nada tivesse acontecido.

Mas o corpo sabia. O corpo guardou.

Tem nome o que te aconteceu.

Chama-se luto não autorizado.

E é das formas mais pesadas de tristeza — porque não tem onde cair. Não tem nome social. Não tem apoio.

Continuas com ela dentro. A pesar sem pedir.

Podes fazer o luto agora. Não precisas de autorização de ninguém. Não precisas de data.

Só precisas de admitir que perdeste alguma coisa real.

E dar-te permissão para te despedires dela, mesmo que tenha sido há muito tempo.

O luto não respeita calendário.

Espera para ser finalmente visto.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep36",
        titulo: "As coisas que perdeste sem ninguém te abraçar",
        curso: "depois-do-fogo",
        texto: `Quando morre alguém, há abraços. Há flores. Há quem pergunte se estás bem.

Mas há outras perdas para as quais não há luto público.

A tua saúde mudou — e ninguém veio acompanhar-te nisso. A tua identidade profissional caiu — e os amigos mudaram de assunto. Um relacionamento importante terminou — mas não tinhas casado, então ninguém achou que fosse de verdade.

Perdeste sem testemunhas.

Tem nome o que isso faz.

Chama-se perda invisível.

É das dores mais solitárias — porque tens de chorar sozinha uma coisa que os outros nem consideraram perda.

E continuaste a funcionar porque ninguém te deu a opção de parar.

Hoje, nesta voz, dou-te uma testemunha.

Vi o que perdeste. Sei que foi grande. Sei que não tiveste abraço nenhum.

E isso é injusto.

Mas agora podes começar a honrar, tu mesma, o que outros não souberam honrar.

Um pequeno ritual privado. Um momento em que finalmente te permites chorar o que não choraste a tempo.

Ainda é tempo.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep37",
        titulo: "O dia em que acordas sem a dor",
        curso: "depois-do-fogo",
        texto: `Houve um dia em que a dor te acompanhava desde o momento em que abrias os olhos.

Depois um dia em que ela chegou só a meio da manhã.

Depois um dia em que ela só apareceu ao fim da tarde — e tu pensaste: estava quase a esquecer-me.

E um dia, muito mais tarde, acordaste e ela não veio.

Não percebeste logo. Foste fazendo as coisas da manhã. Fizeste café. Abriste a janela. E, de repente, paraste. Porque algo estava estranhamente em silêncio dentro de ti.

Era a ausência da dor.

Tem nome este dia.

Chama-se o princípio da recuperação.

Não é um fim. Não é "já passou". É apenas isto: houve uma manhã em que acordaste e ela não estava. E isso, só isso, é enorme.

E a partir daqui ela ainda vai voltar. Vai visitar-te. Às vezes com força. Às vezes fraquinha.

Mas os espaços entre as visitas vão crescendo.

E um dia reparas que já há mais vida no meio do que dor.

E foste tu que, sem saberes, fizeste este caminho.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep38",
        titulo: "As amigas que nunca te falaram de dinheiro",
        curso: "a-teia",
        texto: `Há muitos anos que conheces estas amigas.

Sabes o nome dos ex-namorados delas. Sabes os problemas com as mães. Sabes quem tem dificuldades a dormir. Sabes quem está a pensar em terapia.

Mas não sabes quanto ganham.

Não sabes se têm dívidas. Não sabes se estão a conseguir poupar. Não sabes se há meses em que ficam sem conseguir pagar tudo.

Aprendeste, tacitamente, que entre mulheres não se fala de dinheiro.

Fala-se de emoções, de relações, de corpo. Mas dinheiro é o último tabu.

Tem nome o que aprendeste.

Chama-se silêncio que isola.

Porque enquanto cada uma cala sozinha, cada uma pensa que o seu problema é pessoal.

Quando é estrutural. Partilhado. Político.

E uma conversa — uma só — em que uma amiga te diz em voz alta o quanto ganha, o quanto deve, o quanto teme — pode mudar a forma como te vês.

Porque, de repente, já não estás sozinha.

A teia que te falta entre mulheres é, muitas vezes, feita de uma conversa que ninguém teve coragem de começar.

Talvez possas ser tu a começar.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep39",
        titulo: "As mulheres que precisas de encontrar",
        curso: "a-teia",
        texto: `Há mulheres que ainda não encontraste.

Não porque não existam — existem. Estão a viver a versão dos problemas que tu vives. A lutar as lutas que tu lutas. A nomear as coisas que tu ainda não aprendeste a nomear.

Mas não te cruzaste com elas.

Porque vives onde vives. Porque frequentas os mesmos lugares. Porque as tuas amigas são as amigas que a vida te deu — não as que escolherias hoje, conhecendo-te melhor.

Tem nome o que te falta.

Chama-se comunidade escolhida.

É diferente de família. É diferente de amigas antigas. É um grupo de mulheres que te vê não pela tua história — mas pela tua direcção.

Procurar esta comunidade não é infidelidade às amizades antigas.

É admitir que estás a crescer para um lugar que ainda não tem pessoas suficientes à tua volta.

E quando encontrares as primeiras mulheres desta comunidade, vais reconhecê-las imediatamente.

Pelo que dizem em voz alta. Pelo que não precisam de esconder. Pela forma como te olham quando falas.

Elas existem.

Estão à tua espera em lugares onde ainda não estiveste.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep40",
        titulo: "A rede que ainda não sabes que tens",
        curso: "a-teia",
        texto: `Há uma rede que não sabes que tens.

Não são as pessoas óbvias. Não são as tuas amigas de sempre. Não é a tua família.

É uma rede mais discreta.

A colega de trabalho de há dez anos que pensa em ti em silêncio. A ex-aluna que escreveu sobre ti numa entrada de diário que nunca te mostrou. A prima distante que te admira de longe sem te dizer.

Estas pessoas não aparecem nos dias maus.

Porque tu nem sabes que elas existem assim para ti.

Mas elas existem.

E no dia em que precisares de pedir alguma coisa fora do teu círculo óbvio, elas vão ser as primeiras a responder sim.

Tem nome esta rede.

Chama-se presença invisível.

E a maioria das mulheres tem uma muito maior do que imagina. Porque é treinada a pedir pouco e a não chatear.

Quando começares a pedir — mais, melhor, sem desculpa — vais descobrir quem estava ali.

E vais ficar surpreendida.

Não estás tão sozinha quanto te disseram.

Só nunca pediste.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep41",
        titulo: "A coroa que aprendeste a esconder",
        curso: "a-coroa-escondida",
        texto: `Há algo que tu sabes fazer muito bem.

Sabes tão bem que, há muito tempo, deixou de te parecer especial.

Os outros comentam. Os outros pedem. Os outros apoiam-se em ti nesta coisa.

E tu encolhes os ombros. Dizes que não é nada. Dizes que qualquer um faria igual. Dizes que tiveste sorte.

Aprendeste a diminuir o teu talento.

Porque tens medo de ser vista como arrogante. Porque as mulheres que reconhecem as suas próprias forças são chamadas pretensiosas. Porque é mais seguro ser modesta do que ser precisa.

Tem nome o que escondes.

Chama-se coroa disfarçada de humildade.

Mas a tua capacidade é real.

E cada vez que a diminuis em público, estás a dizer-te a ti mesma que não mereces ser vista inteira.

O reconhecimento privado vem primeiro. A coroa começa lá, no silêncio, na intimidade contigo.

Antes de ser vestida em público, ela precisa de existir em casa.

Sem pedir licença.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep42",
        titulo: "O teu sim que não precisa de confirmação",
        curso: "a-coroa-escondida",
        texto: `Há decisões tuas que tu tomas e depois procuras confirmação.

Mandas mensagem a uma amiga. Pergunas à tua mãe. Testas a ideia num jantar. Esperas que alguém te diga: sim, isso faz sentido.

Tu já tinhas decidido. A tua voz já sabia.

Mas não confias que a tua voz chegue, sozinha, como autoridade.

Precisas de coro.

Aprendeste isto onde? Em mulheres que nunca tomaram uma decisão sem consultar o marido. Em avós que pediam opinião antes de comprar o detergente. Em mães que, mesmo aos sessenta anos, ainda perguntavam à família se podiam fazer uma viagem sozinhas.

Aprendeste a decidir consultando.

Tem nome o que aprendeste.

Chama-se autoridade delegada.

Está na hora de repatriar.

As tuas decisões têm o direito de existir antes da confirmação dos outros. O teu sim pode ser sim, sem validação.

Não tens de parar de falar com as pessoas que amas.

Mas podes começar a dizer-lhes a tua decisão — em vez de lha ir pedir.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep43",
        titulo: "O lugar onde a tua autoridade vive",
        curso: "a-coroa-escondida",
        texto: `Há um lugar no teu corpo onde a tua autoridade vive.

Não é na cabeça. A cabeça pensa, duvida, procura evidência.

É mais abaixo. No plexo solar. No centro do teu peito. Num ponto que, quando é respeitado, faz a tua voz sair firme sem que tu tenhas de te preparar.

Tens visitado pouco este lugar.

Porque te habituaste a decidir de cima. A pedir razões. A argumentar antes de sentires.

Mas a tua autoridade não é argumento. É postura. É um saber do corpo que chega antes da frase.

Tem nome este lugar.

Chama-se centro.

E é reconhecível. Pelas manhãs em que sais de casa e sabes exactamente para onde vais. Pelas conversas em que falas devagar e não precisas de o fazer mais alto. Pelas decisões que tomas e, depois, dormes sem as rever.

Quando estás no centro, os outros notam.

Não porque te impones.

Porque não precisas de ganhar a conversa. Já estás no lugar a partir do qual falas.

Podes voltar a este lugar.

Ele nunca saiu de ti. Só andavas a viver em cima dele, sem descer.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
    ],
  },
  {
    id: "nomear-serie-6",
    titulo: "Série Nomear — Ampliação Limite Sagrado (Ep 44-47)",
    descricao: "Mais 4 scripts de Limite Sagrado para equilibrar cobertura.",
    scripts: [
      {
        id: "nomear-ep44",
        titulo: "A raiva que nunca deixaste sair",
        curso: "limite-sagrado",
        texto: `Há uma raiva em ti que nunca deixaste sair.

Não é a pequena irritação do dia-a-dia. É mais antiga. Mais profunda.

É a raiva do que sentiste que não foi justo. Daquilo que te fizeram e ninguém pediu desculpa. Daquilo que engoliste para manter a paz.

Aprendeste cedo que mulheres com raiva eram ingratas. Difíceis. Amargas. Histéricas.

Então calaste-a.

E a raiva calada não desaparece. Transforma-se.

Torna-se cansaço. Torna-se tristeza difusa. Torna-se dor no corpo que os médicos não explicam.

Tem nome o que fizeste.

Chama-se internalização.

E a raiva não é suja. É informação. Diz-te onde foste atravessada. Onde o teu limite foi ignorado. Onde alguém passou por cima de ti.

Não tens de gritar. Não tens de fazer cena.

Mas podes finalmente reconhecer-lhe o nome dentro de ti.

Ela estava certa.

Sempre esteve.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep45",
        titulo: "O obrigada que dizes quando devias dizer não",
        curso: "limite-sagrado",
        texto: `Alguém faz-te um pedido.

O corpo fecha-se. A respiração fica curta.

E tu dizes: obrigada, claro, com todo o gosto.

Obrigada por quê, se ninguém te perguntou se podias?

Mas aprendeste que ser amável era dizer sim com gratidão. Que recusar era rude. Que hesitar era dar mau exemplo.

Então aprendeste a agradecer por aquilo que te custa.

Tem nome o que fazes.

Chama-se cortesia sacrificada.

E cada obrigada que dás quando devias dizer não é uma traição pequena a ti. Uma traição acumulada ao longo dos anos constrói uma mulher exausta, ressentida, e — pior — incapaz de receber quando finalmente alguém oferece algo genuíno.

Porque passaste tanto tempo a agradecer o que não querias, que já não sabes distinguir o que queres.

Começa pelo pequeno. Não precisa de ser uma recusa dramática.

Podes dizer: deixa-me pensar. Ou: hoje não consigo. Ou: prefiro não.

E sobretudo, podes parar de dizer obrigada por coisas que te pesam.

Poupa o obrigada para o que é mesmo recebido com alegria.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep46",
        titulo: "Os limites que só defines depois de já terem sido atravessados",
        curso: "limite-sagrado",
        texto: `Há limites que só definiste depois de já terem sido atravessados muitas vezes.

Não sabias onde estavam. Ninguém te ensinou. E então aprendeste pelos atropelamentos.

Aquela amiga que te pedia sempre favores e nunca retribuía — só percebeste que havia um limite no dia em que disseste, exausta, não posso mais.

Aquele chefe que te fazia trabalhar fins-de-semana — só definiste um limite depois de um burnout que te deitou duas semanas.

Aquela relação em que ias cedendo — só definiste um limite quando já te sentias uma estranha dentro de ti.

Tem nome o que aprendeste.

Chama-se limite por exaustão.

E é válido. Mas é caro. Muito caro.

A próxima vez, podes tentar o limite antes. Antes de doer tanto. Antes de te perderes.

Não tens de esperar o colapso para saberes onde está o teu limite.

Ele está onde já está agora. Pequeno sinal. Aperto no peito antes de dizeres sim. Vontade de cancelar depois de combinar. Cansaço que chega mais depressa do que faz sentido.

Esses sinais são o teu limite a falar devagar.

Antes de precisar de gritar.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep47",
        titulo: "A diferença entre ser boa e ser leal a ti",
        curso: "limite-sagrado",
        texto: `Tu aprendeste que ser boa era pensar primeiro nos outros.

Ceder o lugar. Ouvir sem te impores. Dar sem calcular. Acomodar. Adaptar. Sorrir.

E durante muito tempo pensaste que ser leal a ti e ser boa eram opostos.

Ou és boa para os outros, ou és boa para ti. Não os dois.

Mas isso nunca foi verdade.

Tem nome a confusão.

Chama-se falsa escolha entre bondade e fidelidade a si própria.

Porque uma mulher que se abandona para ser boa para os outros não é, na verdade, boa. É esgotada. E o que parece bondade é, na maioria das vezes, medo disfarçado de virtude.

A verdadeira bondade não te custa a ti.

Se te custa, não é bondade. É sacrifício. E são coisas diferentes.

Podes escolher sacrifícios conscientes, quando faz sentido para ti.

Mas não podes confundir o sacrifício permanente com a tua natureza.

A tua natureza não é sacrifício. É presença. Inteireza. Voz.

E a mulher inteira é, afinal, mais generosa com os outros do que a mulher que se apaga para os acomodar.

Ser boa e ser leal a ti são, no fim, a mesma coisa.

Só precisas de aprender a não as separar mais.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
    ],
  },
  {
    id: "nomear-serie-7",
    titulo: "Série Nomear — Ampliação Sangue e Seda (Ep 48-50)",
    descricao: "Mais 3 scripts de Sangue e Seda.",
    scripts: [
      {
        id: "nomear-ep48",
        titulo: "A primeira vez que sangraste e ninguém te preparou",
        curso: "sangue-e-seda",
        texto: `Aconteceu. E tu estavas sozinha.

Talvez numa casa de banho da escola. Talvez em casa, numa tarde qualquer.

O corpo tinha mudado sem aviso.

E a pergunta na cabeça não era "o que é isto". Era "o que fiz de errado".

Porque ninguém te tinha preparado. Ninguém te tinha dito, em linguagem humana, que isto ia acontecer, que era normal, que podias chegar com uma pergunta.

Aprendeste por ti. Embrulhaste qualquer coisa. Disseste a alguém quando não tinhas outra opção.

E a pessoa a quem disseste, na maior parte dos casos, também não teve palavras.

Tem nome esta estreia.

Chama-se menarca sem testemunho.

E fez uma marca.

Aprendeste que o teu corpo faria coisas sem aviso — e que tu terias de lidar sozinha.

Aprendeste que o essencial do teu corpo era do domínio privado, quase envergonhado.

Ainda hoje, muitas das decisões que tomas sobre o teu corpo são tomadas sozinha, a meio da noite, sem testemunhas.

Não porque escolheste assim.

Porque foi assim que começou.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep49",
        titulo: "A noite em que o teu corpo disse basta",
        curso: "sangue-e-seda",
        texto: `Houve uma noite em que o teu corpo disse basta.

Talvez numa consulta. Talvez numa viagem longa. Talvez numa conversa que se prolongou.

De repente, algo dentro de ti ficou sem força.

Não era cansaço normal. Era mais profundo. Uma rendição do corpo. Uma retirada que a cabeça não pediu.

Ficaste em pânico. Achaste que estavas a ter um ataque. Achaste que estavas a adoecer.

Não estavas.

Era o corpo a dizer o que tu, há muito tempo, não querias ouvir: isto já dura há demasiado tempo.

Tem nome o que aconteceu.

Chama-se colapso regulatório.

Não é doença. É sabedoria num corpo que foi ignorado sistematicamente.

E quando o corpo diz basta desta forma, não é para te assustar. É para te obrigar a parar.

Se tiveres uma noite destas, guarda-a.

Não é um sintoma a tratar. É uma mensagem a ouvir.

O teu corpo já deu muitos sinais mais pequenos antes deste.

Este foi o que não pudeste ignorar.

E isso, por mais assustador que tenha sido, é um favor que ele te fez.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep50",
        titulo: "As mulheres que te olham com o olhar da tua avó",
        curso: "sangue-e-seda",
        texto: `Às vezes olhas para outras mulheres mais velhas e encontras, no rosto delas, um olhar que já conheces.

Um olhar de quem aguentou muito.

Um olhar que, no silêncio, diz: eu sei.

Não é piedade. Não é maternalismo. É reconhecimento.

Elas viram-te a ti porque viram-se a elas mesmas quando tinham a tua idade.

E elas sabem coisas que tu ainda não aprendeste a nomear.

Sabem a conta não dita dos casamentos antigos. Sabem o esforço invisível das mães que não puderam parar. Sabem os silêncios pesados das avós cuja opinião nunca foi pedida.

Tem nome este olhar.

Chama-se linhagem.

E é precioso.

Quando encontrares uma mulher mais velha com este olhar, para. Faz uma pergunta a mais. Deixa a conversa demorar-se.

Ela tem coisas para te dizer que os livros não têm.

E tu, no teu tempo, vais olhar para mulheres mais novas com o mesmo olhar.

E elas vão reconhecer-te.

E a linhagem continua.

Não em livros. Em conversas de cozinha.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
    ],
  },
  {
    id: "nomear-serie-8",
    titulo: "Série Nomear — Ampliação Silêncio que Grita (Ep 51-53)",
    descricao: "Mais 3 scripts de O Silêncio que Grita.",
    scripts: [
      {
        id: "nomear-ep51",
        titulo: "As coisas que descobriste demasiado tarde sobre a tua família",
        curso: "o-silencio-que-grita",
        texto: `Houve coisas sobre a tua família que descobriste demasiado tarde.

Uma doença que a tua mãe teve e nunca te contou. Um aborto que a tua avó sofreu e se enterrou sozinha na cozinha. Um irmão que o teu pai teve e que ninguém nunca mencionou. Uma ruína financeira que atravessou duas gerações sem nome.

Descobriste por acaso. Numa caixa de fotografias. Numa conversa com uma tia no funeral. Num comentário casual que alguém deixou escapar.

E a primeira reacção foi raiva.

Porque se soubesses antes, tantas coisas teriam feito sentido.

O cansaço da tua mãe. O silêncio do teu pai. A tristeza que atravessava a família e que ninguém sabia dizer de onde vinha.

Tem nome o que te esconderam.

Chama-se protecção que se tornou isolamento.

Eles achavam que estavam a poupar-te. Não estavam.

Estavam a deixar-te crescer num mistério.

E o mistério, sem nome, torna-se peso próprio. Herdaste o peso sem herdares a história.

Agora, com a história, podes finalmente pousar o peso.

Não o que aconteceu. Aconteceu.

Mas a parte que era tua sem ser tua.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep52",
        titulo: "O segredo que todos sabiam menos tu",
        curso: "o-silencio-que-grita",
        texto: `Havia um segredo que todos sabiam.

Todos menos tu.

Eras a mais nova. Ou eras a que "não era suposto saber". Ou eras a que falava demais e não podiam arriscar.

Então na tua família, à tua volta, funcionava assim: tu não sabias. Mas sentias.

Sentias as pausas nas conversas. Sentias os olhares entre os adultos. Sentias a tensão de um jantar de família quando alguém chegava tarde.

Aprendeste a ler silêncios com precisão.

E uma criança que aprende a ler silêncios torna-se uma adulta hipervigilante.

Tem nome o que ficou em ti.

Chama-se alerta permanente.

Nas relações, notas tudo. Pequenas mudanças no tom. Sabes quando algo está errado antes da outra pessoa saber. És quase telepática.

Mas é uma habilidade que te custa.

Porque o teu sistema nervoso nunca descansa. Está sempre a rastrear. Sempre a esperar pelo segredo seguinte.

O segredo de infância não te foi dito. Mas treinou-te.

E tu podes, a pouco e pouco, começar a não precisar de antecipar tudo.

Nem todas as pausas escondem segredo.

Algumas são apenas pausas.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep53",
        titulo: "As perguntas que agora fazes ao vazio",
        curso: "o-silencio-que-grita",
        texto: `Há pessoas a quem quereis fazer perguntas que já não podem ser feitas.

A tua avó morreu antes de lhe poderes perguntar sobre a juventude. O teu pai afastou-se antes de lhe poderes perguntar sobre o primeiro casamento. A tua mãe fechou-se em depressão e nunca conseguiu responder ao que lhe perguntavas com os olhos.

As perguntas ficaram contigo.

E agora fazes-lhas ao vazio.

De madrugada, em conversas mentais. Em sonhos. Em memórias que se tornam obsessivas.

Tem nome o que te acontece.

Chama-se luto inacabado pela pergunta sem resposta.

Este luto é difícil. Porque não se trata só da pessoa. Trata-se do que ela poderia ter-te dito e nunca te disse.

Mas há uma forma — inesperada — de encontrar resposta.

Não através delas. Através de ti.

Pergunta ao vazio. Deixa a pergunta ficar no ar.

E nota: em dias improváveis, uma resposta chega. Numa conversa com um estranho. Num livro. Num sonho.

Como se aquela pessoa tivesse deixado, pelo mundo, pedaços do que te queria dizer.

E tu, se ouvires, vais encontrar.

Não tudo. Mas o suficiente.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
    ],
  },
  {
    id: "nomear-serie-9",
    titulo: "Série Nomear — Ampliação Pele Nua (Ep 54-56)",
    descricao: "Mais 3 scripts de Pele Nua.",
    scripts: [
      {
        id: "nomear-ep54",
        titulo: "O peso que aprendeste a detestar antes de saberes o que era",
        curso: "pele-nua",
        texto: `Aprendeste a detestar o teu peso antes de entenderes o que ele era.

Havia uma balança na casa de banho dos teus pais. Viste-a a mais velha pesar-se com uma expressão que te ensinou. Ouviste comentários à mesa sobre quem "tinha engordado". Notaste quem era vista com alívio e quem era vista com reserva.

Cresceste a olhar para o teu corpo à luz desses comentários.

Não era o espelho que te dizia se estavas bem. Eram as outras pessoas.

Aprendeste a controlar antes de entender o que estavas a controlar.

Aprendeste a restringir antes de ter fome. Aprendeste a exercitar como castigo antes de perceber que o corpo merecia outro tipo de atenção.

Tem nome o que aprendeste.

Chama-se vigilância precoce do peso.

E é das heranças mais silenciosas — porque parece cuidado.

Parece saúde. Parece disciplina.

Mas se olhares com atenção, vais ver que não é cuidado que te move. É medo. Medo de seres vista como as mulheres que ouviste serem criticadas em criança.

O teu corpo não é um inimigo a controlar.

É um lugar onde tu vives.

E se passas a vida em vigilância contra a tua própria casa — quem é que está a habitar nela?

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep55",
        titulo: "A cicatriz que sempre escondes mesmo de ti",
        curso: "pele-nua",
        texto: `Há uma cicatriz no teu corpo que escondes mesmo quando estás sozinha.

Pode ser visível. Pode ser um sinal. Pode ser uma prega. Pode ser uma parte que mudou depois de um parto, de uma cirurgia, de algo que te aconteceu.

Não olhas para ela.

Vestes de certa maneira para que, mesmo à frente do espelho, não apareça.

Não é só por vergonha do que os outros veriam.

É por vergonha de olhares tu.

Tem nome.

Chama-se desapropriação da própria pele.

E a cicatriz, quando escondida tanto tempo, deixa de ser parte do corpo — torna-se uma coisa à parte. Uma ameaça. Um território proibido dentro de ti.

Mas a cicatriz é uma palavra do corpo.

Conta uma história. Da vez em que o corpo te protegeu. Da vez em que o corpo aguentou o que não devia ter aguentado. Da vez em que o corpo mudou para dar espaço a outra vida.

Olhar para a cicatriz, finalmente, com atenção — não com avaliação, com atenção — é começar a reconciliar-te com o que o corpo fez por ti.

Não precisas de gostar dela.

Precisas de a reconhecer.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep56",
        titulo: "A primeira vez que alguém te olhou de uma forma que te ensinou",
        curso: "pele-nua",
        texto: `Houve uma primeira vez em que alguém te olhou de uma forma que te ensinou.

Talvez tivesses onze anos. Talvez treze. Estavas num sítio comum — uma rua, um autocarro, uma festa de família.

E percebeste que o teu corpo era olhado de uma maneira nova.

Não sabias o que era. Mas sabias que era.

E o que aprendeste, naquele momento, foi que o teu corpo passou a ser visto pelos outros antes de tu o teres visto por ti.

Aprendeste a vigiar-te de fora.

Antes de sentires o teu corpo por dentro, já o via-lo pelos olhos dos outros.

Tem nome.

Chama-se o olhar antecipado.

E ficou contigo. No shopping. Nas redes sociais. Nas conversas. Estás sempre a antecipar como serás vista antes de decidires como te queres sentir.

É cansativo. Mas aprendeste assim tão cedo que parece normal.

Reclamar o teu corpo passa, primeiro, por parar de o antecipar pelos olhos dos outros.

Por olhar para ti no espelho não para corrigir.

Para conhecer.

Foste desapossada do teu corpo aos treze anos.

Podes reclamá-lo agora.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
    ],
  },
  {
    id: "nomear-serie-10",
    titulo: "Série Nomear — Ampliação A Fome (Ep 57-59)",
    descricao: "Mais 3 scripts de A Fome.",
    scripts: [
      {
        id: "nomear-ep57",
        titulo: "O pedaço que deixas sempre no prato",
        curso: "a-fome",
        texto: `Há um gesto que repetes sem pensar.

Deixas sempre um pedaço no prato. Um bocado de comida. Uma dentada. Uma coisa pequena que ninguém notaria.

Aprendeste este gesto muito cedo.

Aprendeste que uma mulher educada não come tudo. Que deixar um pouco é sinal de delicadeza. Que terminar o prato inteiro é avidez.

E aprendeste isto a par com outra coisa: a mulher deve querer pouco.

Querer pouco de comida. Querer pouco espaço. Querer pouco do tempo dos outros. Querer pouco da atenção.

Tem nome o que deixas no prato.

Chama-se a demonstração silenciosa de que não queres demais.

É um gesto tão pequeno que parece irrelevante.

Mas é uma performance diária de contenção. Um treino. Uma confirmação de que mereces um pouco menos do que o que te foi posto à frente.

O prato vazio, quando finalmente acontece, é um gesto pequeno e político.

Uma confirmação silenciosa de que mereces o que foi posto à tua frente.

A maior parte das mulheres nunca chegará a saber o peso que carregam nestas pequenas contenções diárias.

Mas tu já sabes.

E quando finalmente deixares de deixar o pedaço, não é sobre comida.

É sobre a permissão que decidiste finalmente dar-te.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep58",
        titulo: "A comida que comes escondida",
        curso: "a-fome",
        texto: `Há uma comida que tu comes escondida.

À noite, quando ninguém te vê. No carro, entre casa e trabalho. De pé na cozinha, antes de te sentares à mesa com a família e fingires que é agora que começas a comer.

Não é vergonha do que comes. É vergonha de seres vista a comer.

Porque aprendeste que o teu apetite devia ser controlado — pelo menos em público.

E como não consegues controlar sempre, comes escondida.

Tem nome.

Chama-se comer secreto.

Ele tem sabores particulares. É mais rápido. É mais culposo. É, muitas vezes, mais satisfatório — porque ali, naquele momento, ninguém te avalia.

Mas tem um custo.

Cada vez que comes escondida, confirmas a ti mesma: a minha fome é suja. O meu desejo por comida é demasiado.

E vais vivendo partida entre duas: a que come em público, contida e apropriada. E a que come em privado, escondida e envergonhada.

Nenhuma das duas é, plenamente, tu.

O dia em que comeres em paz à frente dos outros — e em paz contigo em privado — é o dia em que o teu apetite volta a ser só apetite.

Nada mais.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep59",
        titulo: "A fome que chega depois de uma boa notícia",
        curso: "a-fome",
        texto: `Esperas há muito por esta notícia.

A promoção. A aprovação. O convite. O sim.

Ela chega. Tu sentes uma onda de alegria — e em seguida, uma fome.

Não é fome de comemorar. É uma fome estranha, quase ansiosa.

Queres comer. Queres comprar algo. Queres distrair-te com qualquer coisa.

Isto não te parece lógico. Afinal, era suposto estares feliz.

Tem nome o que sentes.

Chama-se desconforto com o bom que chega.

Aprendeste cedo que se tinhas demasiada alegria em público, alguém poderia invejar-te. Que as coisas boas deviam ser contidas. Que celebrar demais era convocar o mau olhado.

Então quando as coisas boas chegam, tens de as diluir. De as gerir. De as tornar mais pequenas do que são.

E a fome — o comer depressa, o comprar, a distracção — faz exactamente isso.

Dilui a alegria num gesto mais controlável.

Não estás a ter um vício.

Estás a ter dificuldade em receber.

E receber, quando não se aprendeu, é tão desconfortável como qualquer outra coisa nova.

Há uma parte de ti que resiste ao bom.

Que quer levantar-se. Que quer fechar o instante depressa. Que precisa de o diluir em comida ou compra ou distracção.

Essa parte aprendeu a proteger-te do que não sabia receber.

E agora pesa.

Porque o bom vai continuar a chegar. E continuas a não saber ficar com ele.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
    ],
  },
  {
    id: "nomear-serie-11",
    titulo: "Série Nomear — Ampliação A Chama (Ep 60-62)",
    descricao: "Mais 3 scripts de A Chama.",
    scripts: [
      {
        id: "nomear-ep60",
        titulo: "A primeira vez que sentiste desejo e te assustaste",
        curso: "a-chama",
        texto: `Houve uma primeira vez em que sentiste desejo e te assustaste.

Tinhas talvez catorze, quinze anos. Talvez mais. Aconteceu por dentro — um calor, uma abertura, uma vontade que não conseguias nomear.

E a primeira reacção, antes de qualquer prazer, foi medo.

Medo de já não seres quem eras. Medo de seres vista como as mulheres que os adultos criticavam. Medo de não conseguires voltar atrás.

Tem nome o que sentiste.

Chama-se pânico do desejo.

Não por o desejo ser mau — mas porque nunca ninguém te disse que ia acontecer assim. Ou, se disseram, foi como um aviso. Como uma coisa a conter, não uma coisa a receber.

Aprendeste a ter medo de uma parte viva de ti antes de a conhecer.

Durante anos, cada vez que o desejo voltou, o medo veio colado.

Por baixo do prazer, sempre o mesmo pânico.

Não é tua culpa. É a educação que as mulheres recebem sobre o próprio desejo — tratar-lo como perigo antes de o tratar como território.

E o teu desejo, apesar de todos estes anos de medo, não desistiu.

Continua ali.

A pedir que o conheças sem susto.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep61",
        titulo: "O prazer que te foi dado como presente",
        curso: "a-chama",
        texto: `Houve prazeres que te foram dados como se fossem presente.

Alguém tocou-te. Alguém beijou-te. Alguém disse-te coisas bonitas. E aquilo foi apresentado como dádiva.

Agradeceste. Devolveste. Compensaste.

Aprendeste que o teu prazer era algo que recebias — não algo que produzias.

E então, mesmo na tua vida adulta, continuaste a esperar. Por alguém que te desse. Alguém que fizesse acontecer. Alguém que te merecesse, com o seu esforço, aquele território.

Tem nome o que aprendeste.

Chama-se prazer condicionado a outro.

E enquanto o teu prazer depender da acção de outra pessoa, ele vai sempre chegar filtrado pela atenção, pelo humor, pela disponibilidade dessa pessoa.

Não é tua.

O teu prazer é teu.

Não precisa de doador. Não precisa de merecedor. Não precisa de permissão.

E há um ponto em que ele se reconhece em silêncio, sem ninguém ter sido o merecedor.

A partir desse ponto, quando é partilhado, é de outro lugar.

De doadora. Não de recebedora.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep62",
        titulo: "A intimidade que não precisa de explicação",
        curso: "a-chama",
        texto: `Há uma intimidade que tu esperaste a vida inteira e ainda não conheceste.

Não é a intimidade física. Essa conheces.

É a intimidade em que não precisas de explicar.

Em que alguém te olha e sabe o que se passa sem te obrigar a traduzir. Em que estás em silêncio e não é desconforto. Em que dizes uma coisa imperfeita e não é corrigida — é recebida.

Aprendeste, desde muito nova, a traduzir-te. A tornar-te legível. A explicar-te antes de ser pedido.

E então habituaste-te a não ter intimidade real.

Porque intimidade real é ser vista sem explicação.

Tem nome o que te falta.

Chama-se intimidade não mediada.

E é rara. Porque quase todas as pessoas à tua volta foram, como tu, ensinadas a pedir tradução.

Mas podes começar por ti.

Deixar de te explicares tanto. Deixar de antecipares o que a outra pessoa poderia precisar de saber. Confiar que, se for para alguém ficar, vai ficar pelo que és — não pelas tuas traduções.

A intimidade real começa no dia em que paras de pedir autorização para existires.

E deixas os outros responderem-te com a intimidade deles — ou com o silêncio.

Ambos são informação.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
    ],
  },
  {
    id: "nomear-serie-12",
    titulo: "Série Nomear — Ampliação Voz de Dentro (Ep 63-65)",
    descricao: "Mais 3 scripts de Voz de Dentro.",
    scripts: [
      {
        id: "nomear-ep63",
        titulo: "O saber que aparece em sonhos",
        curso: "voz-de-dentro",
        texto: `Há coisas que tu só sabes quando dormes.

Acordas com uma certeza estranha sobre alguém. Sabes que aquela relação não vai resistir. Sabes que tens de mudar de casa. Sabes que aquela amiga está a mentir-te.

Não tens provas. Só tens o sonho. E uma sensação clara no corpo, antes mesmo de abrires os olhos.

E depois, durante o dia, a razão chega. E diz: não sejas ridícula. Dormiste mal. Foi só um sonho.

Aprendeste a descartar o que o sonho te mostrou.

Tem nome o que fazes.

Chama-se descarte do saber nocturno.

Mas os sonhos não são aleatórios. São a forma como a mente processa informação que, acordada, tinha de filtrar.

Durante o dia, tu és socialmente funcional. Responde ao que te perguntam, cumpres os compromissos, adaptas-te. O corpo e a intuição ficam em segundo plano.

À noite, no sonho, eles ganham voz.

Não é que os sonhos tenham de ser obedecidos.

É que, quando os descartas sempre, estás a desacreditar a parte de ti que sabia antes do dia começar.

E essa parte aprende.

Aprende que a sua voz não conta.

Vai-se calando.

Até uma noite em que nem os sonhos regista.

O corpo, sem aviso, retira-se para onde já não chegas.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep64",
        titulo: "A voz que se cala em grupo",
        curso: "voz-de-dentro",
        texto: `A sós, a tua voz é clara.

Sabes o que pensas. Sabes o que queres. Sabes o que recusas.

Em grupo, ela desaparece.

Há cinco pessoas à mesa. A conversa flui. Toma um rumo com o qual tu não concordas. Tens a frase certa a formar-se na boca. E não a dizes.

Esperas por outra pessoa. Esperas que alguém diga primeiro. Esperas pela altura certa. E a altura certa não chega.

Tem nome o que te cala.

Chama-se autocensura em grupo.

E o que se torna silêncio em público não é apenas ausência de voz — é, ao longo do tempo, desconfiança na tua própria percepção.

Porque se a tua opinião fosse válida, terias dito.

Como não disseste, deve não ter sido importante.

Aprendeste a concluir isto em vez da coisa mais verdadeira: não disseste porque estavas a avaliar o custo social de dizer.

Custo social é informação, também. Mas não pode ser o único critério.

E o preço de não dizeres não é do grupo. É teu.

Ficas sentada à mesa, a participar do lado de fora da tua própria presença.

À noite, em casa, repões mentalmente a conversa. Dizes agora o que não disseste antes.

Ninguém te ouve.

O grupo sem a tua voz continuou sem notar a ausência.

Só tu ficas com o peso de ter sido quase.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep65",
        titulo: "O que a tua mão já escreveu antes da tua cabeça pensar",
        curso: "voz-de-dentro",
        texto: `Pegas numa caneta sem saber muito bem porquê.

Começas a escrever.

E a mão escreve coisas que tu não sabias que sabias.

Aparecem frases que te surpreendem. Ligações que a mente, a pensar, não teria feito. Emoções que tinhas escondido de ti mesma, escritas com letras em que te reconheces.

Tem nome o que acontece.

Chama-se escrita como saber.

A mão sabe coisas antes da cabeça. Porque a mão está ligada ao corpo. E o corpo guarda muita coisa que a mente, organizada como é, tem vergonha de admitir.

E este acesso — através da mão, ao saber do corpo — é das formas mais antigas de uma mulher se ouvir a si.

As mulheres sempre tiveram diários escondidos. Não por terem menos a dizer em voz alta.

Por saberem que o que vinha quando a mão se movia sozinha era mais verdadeiro do que o que a boca se atrevia a formular.

A cabeça, em voz alta, tem filtros.

A mão, no silêncio da página, tem menos.

É uma porta antiga.

E continua aberta para quem chega com pressa de se ouvir.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
    ],
  },
  {
    id: "nomear-serie-13",
    titulo: "Série Nomear — Ampliação Mulher Antes de Mãe (Ep 66-68)",
    descricao: "Mais 3 scripts de A Mulher Antes de Mãe.",
    scripts: [
      {
        id: "nomear-ep66",
        titulo: "A alegria que tinhas antes de te tornares responsável",
        curso: "a-mulher-antes-de-mae",
        texto: `Havia uma alegria que tinhas antes.

Uma alegria fácil. Uma alegria sem explicação. Uma alegria que podia aparecer numa rua qualquer, num café com um estranho, numa música que passou na rádio.

Era uma alegria leve. Não pesava.

E depois, algures nos teus trinta, começaste a notar que ela já não chegava com a mesma facilidade.

Não é só por causa dos filhos. Não é só por causa do trabalho. É um peso que foi crescendo contigo.

O peso de seres responsável. Por eles. Por eles. Por eles.

E responsabilidade, quando crónica, rouba leveza.

Tem nome o que perdeste.

Chama-se alegria sem função.

A alegria que não serve para nada. A alegria que não comemora nada. A alegria que chega só porque estás viva num dia como outro.

Ela ainda pode voltar. Mas precisa de espaço sem gestão.

Precisa de minutos em que não estás a organizar nada. Em que não és útil a ninguém. Em que não tens de resolver.

A alegria sem função não volta por esforço. Volta quando o teu tempo deixa de estar sempre a caminho de outra coisa.

E aí, sem aviso, ela regressa. Por piscadelas de luz.

Não ao dia todo. Não de uma vez.

Mas o suficiente para te lembrares que existe.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep67",
        titulo: "Os hobbies que eram tuas quando ainda eras só tu",
        curso: "a-mulher-antes-de-mae",
        texto: `Havia coisas que tu fazias só porque te davam prazer.

Tocavas um instrumento. Desenhavas. Lias romances. Dançavas. Ias a exposições. Corrias. Escrevias diários.

Coisas sem utilidade aparente. Coisas que eram tuas.

E, com o passar dos anos, foste deixando. Não foi uma decisão consciente. Foi um desaparecimento gradual — uma prioridade a empurrar a outra, um cansaço a tomar o tempo do hobby, uma culpa em gastar tempo em coisas "para nada".

Tem nome o que se perdeu.

Chama-se desligamento dos próprios prazeres.

E esses hobbies não eram irrelevantes. Eram canais de expressão que te mantinham inteira.

Quando os perdes, perdes uma forma de ti.

Não precisas de voltar a todos. Não precisas de ser exímia em nenhum.

Mas escolhe um — aquele que lembraste enquanto ouvias isto — e devolve-lhe meia hora por semana.

É um gesto pequeno.

Que restitui uma parte tua que já quase não reconhecias.

Porque a mulher antes de ser mãe, de ser profissional, de ser filha cuidadora — fazia estas coisas.

Ela continua aí.

Só precisa de ser chamada pelo nome.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep68",
        titulo: "O corpo que tinhas quando ainda dormias oito horas",
        curso: "a-mulher-antes-de-mae",
        texto: `Lembras-te do corpo que tinhas quando dormias oito horas seguidas?

Não é só a pele. Não é só a energia. É uma qualidade de presença que tinhas.

As coisas magoavam-te menos. Tinhas paciência onde já não tens. Reagias de outra forma às pequenas contrariedades.

Não eras uma pessoa diferente. Eras a mesma pessoa — num corpo descansado.

E foi-te sendo tirado este direito.

Primeiro pelos filhos. Depois pelo trabalho. Depois pelas preocupações a chegarem à noite. Depois pela fase da vida em que dormir se tornou, ele mesmo, um privilégio raro.

Tem nome o que perdeste.

Chama-se direito ao descanso.

E é considerado, para mulheres que cuidam, quase escandaloso reclamá-lo.

Mas o corpo sem descanso crónico é um corpo doente à espera de acontecer.

Dormir bem não é luxo. É fundação.

Se perdeste o direito ao sono, precisas de o reclamar.

Nem que seja pedindo ajuda. Reorganizando tarefas. Falando a sério com quem te rodeia.

Porque a mulher que dorme oito horas é uma mulher diferente.

E merece, no mínimo, uma hipótese de voltar a ser.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
    ],
  },
  {
    id: "nomear-serie-14",
    titulo: "Série Nomear — Ampliação Peso e Chão (Ep 69-71)",
    descricao: "Mais 3 scripts de O Peso e o Chão.",
    scripts: [
      {
        id: "nomear-ep69",
        titulo: "O peso de ser sempre a que resolve",
        curso: "o-peso-e-o-chao",
        texto: `Em qualquer grupo em que entras, acabas por te tornar a que resolve.

No trabalho. Em casa. Na família. Entre amigas.

Há sempre uma crise. Há sempre alguém em descontrolo. Há sempre uma situação que precisa de cabeça fria.

E tu apareces. Organizas. Decides. Acalmas.

Quando tudo se resolve, o grupo respira.

Tu ficas com o peso do que foi resolvido.

Ninguém te pergunta como foi. Ninguém te pergunta se precisas de descansar. Ninguém te pergunta se, depois disto tudo, estás bem.

Assume-se que estás. Porque resolveste.

Tem nome o que te acontece.

Chama-se invisibilidade da resolutora.

E é uma armadilha perversa.

Quanto mais resolves, menos pedem como estás.

Quanto mais aguentas, mais os outros esperam.

E tu, uma noite, percebes que tens cinquenta anos e ninguém — ninguém — nunca te perguntou: e tu?

A competência tornou-se a tua cela.

Começa a deixar cair. Uma coisa pequena por mês. Algo que costumavas resolver e agora não resolves.

E nota quem aparece para preencher.

Vais descobrir-te mais acompanhada do que pensavas.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep70",
        titulo: "A gravidade que se aprende aos trinta",
        curso: "o-peso-e-o-chao",
        texto: `Até aos vinte, tinhas leveza.

As decisões podiam ser mudadas. As relações, refeitas. Os empregos, deixados. A vida tinha uma mobilidade que parecia natural.

E depois, algures nos trinta, algo mudou.

As decisões começaram a ter peso. As consequências, duração. As relações, filhos. Os empregos, carreiras. A vida passou a ter uma espécie de gravidade.

Chegavas a um ponto em que já não podias voltar atrás sem perder muito.

Tem nome o que aprendeste.

Chama-se gravidade acumulada.

E ninguém te preparou para este peso.

As gerações anteriores passaram por ele sem terem linguagem para o que era. Eram avós cansadas. Mães exaustas. Tias amargas.

Agora tu chegaste a este lugar e sentes o mesmo.

Mas tens, ao contrário delas, a possibilidade de nomear.

De dizer em voz alta: isto é pesado. Não é fraqueza minha. É o peso da fase da vida em que estou.

E nomear isto é o primeiro gesto para não acabares, como elas, sem linguagem para a própria exaustão.

A gravidade não vai embora.

Mas quando sabes o seu nome, é menos solitária.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep71",
        titulo: "O chão que só encontras quando paras de lutar com ele",
        curso: "o-peso-e-o-chao",
        texto: `Há um chão que tu nunca encontraste.

Não por falta de esforço. Pelo contrário — passas o dia a pedir a ti mesma que encontres apoio. Que sejas estável. Que resistas.

E quanto mais pedes, menos ele aparece.

O chão não é uma coisa que se procura.

É uma coisa que se deixa encontrar.

Tem nome o que fazes.

Chama-se luta contra a gravidade.

E é das formas mais esgotantes de existir.

Porque o corpo, quando relaxa, já está no chão. Já pertence ao mundo. Já é suportado pela terra.

É a tensão — não a gravidade — que te faz sentir que podes cair.

Não és tu que te seguras.

É a terra que sempre te segurou.

Os teus pés não caem. A cadeira onde te sentas não cede. A cama onde te deitas aguenta.

Mas a tensão com que te habituaste a viver — essa, sim, é tua.

E é ela que te faz parecer que podes cair.

A terra nunca falhou.

Tu é que te esqueceste de lhe entregar o peso.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
    ],
  },
  {
    id: "nomear-serie-15",
    titulo: "Série Nomear — Ampliação Depois do Fogo (Ep 72-74)",
    descricao: "Mais 3 scripts de Depois do Fogo.",
    scripts: [
      {
        id: "nomear-ep72",
        titulo: "As cinzas que guardaste num canto",
        curso: "depois-do-fogo",
        texto: `Houve um fogo na tua vida.

Algo que ardeu. Uma relação. Um emprego. Uma versão tua. Uma família que já não existe como existia.

E depois, quando tudo se acalmou, restaram cinzas.

Não as varreste. Não as lançaste ao vento. Guardaste-as num canto.

Ficam lá. Não as olhas todos os dias. Mas sabes que estão.

E às vezes, sem razão aparente, o cheiro do fogo volta. Numa foto antiga. Num lugar por onde passas. Numa pessoa que te lembra a que perdeste.

Tem nome o que guardaste.

Chama-se luto arquivado.

Não está resolvido. Só está contido.

E contido não é o mesmo que ultrapassado.

Há dias em que precisas de voltar às cinzas. Não para reabrir a ferida — para a honrar.

Acendeste aquela parte da tua vida com tudo o que tinhas.

Não foi nada em vão só por ter acabado em fogo.

As cinzas são o que sobrou da tua entrega.

Merecem, uma vez por ano, pelo menos, que as olhes com cuidado.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep73",
        titulo: "O recomeço que demora mais do que os outros esperam",
        curso: "depois-do-fogo",
        texto: `Os outros querem que já estejas bem.

Passaram-se seis meses. Passaram-se dois anos. Passaram-se cinco.

E a pergunta, feita em tom de quem pensa que isto já foi há muito tempo, aparece: então, já estás melhor?

Tu sorris. Dizes que sim. Não é mentira completa. Estás a viver. Estás a funcionar.

Mas por dentro há uma parte que ainda está em reconstrução. Em silêncio. Em lentidão.

E os outros, já há muito, mudaram de assunto.

Tem nome o que vives.

Chama-se recomeço a solo.

Porque chega um ponto em que ninguém mais acompanha. Todos presumem que já ultrapassaste.

Mas tu sabes que ainda não. E ao mesmo tempo, já não podes continuar a explicar.

Então segues sozinha.

Não é fraqueza teu processo ser mais longo. É profundidade.

As coisas a que te entregaste tinham muito significado. É natural que a reconstrução demore.

Não precisas de pedir desculpa por isso.

Mas também não precisas de continuar a explicar.

Podes simplesmente seguir o teu ritmo.

E quem for para ficar na tua vida vai aprender que tu tens um tempo diferente.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep74",
        titulo: "A vida que não pediste mas vai começar na mesma",
        curso: "depois-do-fogo",
        texto: `Há vidas que tu não pediste.

Casaste, e a vida mudou numa direcção que não escolheste completamente. Tiveste um filho, e a vida nunca mais foi a mesma. Foste despedida, e o caminho que vinha a construir desmoronou. Ficaste doente, e o corpo passou a pedir coisas que tu não querias dar-lhe.

E, em cada uma destas vezes, ficaste por uns tempos em choque.

Como se a vida certa tivesse ficado algures atrás de ti, e esta, a que te apareceu, fosse uma substituta forçada.

Tem nome o que sentes.

Chama-se vida não escolhida.

E é legítimo o teu luto pela vida que pensavas que ias ter.

Mas há uma verdade desconfortável: a vida que não pediste vai começar na mesma.

Vai escrever-se, dia a dia, com ou sem tua permissão.

Podes passar os próximos anos a lamentar a vida que não foi.

Ou podes, em algum ponto, olhar para esta e perguntar: o que é possível aqui?

Não como rendição. Como curiosidade.

Porque a vida que não pediste pode ainda assim ser, a pouco e pouco, uma vida que se torna tua.

Por escolha. Dentro dela.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
    ],
  },
  {
    id: "nomear-serie-16",
    titulo: "Série Nomear — Ampliação A Teia (Ep 75-77)",
    descricao: "Mais 3 scripts de A Teia.",
    scripts: [
      {
        id: "nomear-ep75",
        titulo: "A amizade que terminou sem explicação",
        curso: "a-teia",
        texto: `Houve uma amizade na tua vida que acabou sem explicação.

Não houve discussão. Não houve motivo claro. As mensagens começaram a espaçar-se. Os convites deixaram de chegar. Uma das duas desapareceu primeiro e a outra não foi atrás.

E ficou isso. Uma pessoa que um dia era parte essencial da tua vida — e agora é uma ausência que não tem funeral.

Tem nome o que vives.

Chama-se luto de amizade.

E é das formas de perda mais desrespeitadas.

As pessoas fazem luto por casamentos que acabaram. Por pais que morreram. Por amores que partiram.

Mas por amigas que desapareceram sem explicação — ninguém te oferece condolências.

E tu continuas a carregar essa ausência em silêncio.

Podes fazer o luto agora, anos depois se preciso.

Escreve sobre a amizade. Sobre o que ela te deu. Sobre o que partiu quando terminou.

Não tens de procurar a pessoa. Não tens de exigir uma explicação.

Tens de reconhecer, a ti mesma, que aquilo foi importante.

E que doeu perder — mesmo quando ninguém veio perguntar se estavas bem.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep76",
        titulo: "As mulheres que te ensinaram mais do que sabiam",
        curso: "a-teia",
        texto: `Há mulheres na tua vida que te ensinaram mais do que elas próprias sabiam.

A professora da escola primária que te disse, uma única vez, que eras inteligente. E tu carregaste essa frase durante trinta anos.

A vizinha que te abria a porta quando a tua mãe estava exausta e te deixava ficar sem perguntar nada. E tu aprendeste que havia lugares de acolhimento fora da família.

A estranha numa conferência que te disse uma frase em dez segundos que mudou a forma como vês a tua carreira.

Elas não faziam ideia do que estavam a fazer.

Mas deixaram-te marcas profundas.

Tem nome o que elas foram.

Chama-se mestras acidentais.

E tu, provavelmente, já foste isto para outras mulheres sem teres sabido.

Um comentário teu mudou a vida de alguém. Uma gentileza tua foi guardada por anos. Uma frase que tu nem te lembras de teres dito ficou gravada em alguém.

Não és só a mulher que conheces.

És todas as versões que ficaram em quem te cruzou.

Tens uma influência silenciosa que nunca vais saber dimensionar.

Isso é humildade. E é honra.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep77",
        titulo: "A irmandade que te falta e tens de construir",
        curso: "a-teia",
        texto: `Há uma irmandade que te falta.

Não é família. Não é amizade antiga. É outra coisa.

É um grupo de mulheres com quem podes falar do que é realmente difícil. Sem edição. Sem explicação. Com a certeza de seres reconhecida, não apenas tolerada.

A maioria das mulheres chega à meia-idade sem este grupo.

Porque nunca aprendeu a construí-lo. Porque as amizades eram dadas pela escola, pelo bairro, pelo trabalho. E essas nem sempre se aprofundaram para o lugar onde queres ir agora.

Tem nome o que te falta.

Chama-se comunidade escolhida entre iguais.

E ninguém a entrega.

Não aparece como apareceram as amigas da escola ou do bairro. Essa era outra fase.

Nesta, as mulheres que te podem acompanhar não se cruzam contigo por sorte.

Estão perto. Algumas já as conheces e ainda não reconheceste. Outras vais encontrar em salas onde ainda não entraste.

E a primeira desta irmandade, muitas vezes, é uma mulher antiga — a quem nunca tinhas feito a pergunta maior.

As futuras irmãs não te foram dadas.

Vão ser reconhecidas por ti, uma de cada vez, ao longo dos próximos anos.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
    ],
  },
  {
    id: "nomear-serie-17",
    titulo: "Série Nomear — Ampliação Coroa Escondida (Ep 78-80)",
    descricao: "Mais 3 scripts de A Coroa Escondida (fecho da ampliação).",
    scripts: [
      {
        id: "nomear-ep78",
        titulo: "O poder que aprendeste a esconder para ser querida",
        curso: "a-coroa-escondida",
        texto: `Desde cedo aprendeste: o poder, numa mulher, causava incómodo.

Viste o que acontecia às mulheres que mandavam sem pedir licença. Eram chamadas difíceis. Ambiciosas. Frias. Demasiado.

Viste o que acontecia às mulheres que sabiam muito. Eram desafiadas. Interrompidas. Postas à prova.

Viste o que acontecia às mulheres que tinham posição. Eram avaliadas não pelo que faziam — mas pelo tom, pela roupa, pelo sorriso.

Então aprendeste a suavizar.

A sorrir no fim das frases. A fazer perguntas em vez de afirmações. A deixar o poder dos outros estar à vontade na tua presença.

Tem nome o que fazes.

Chama-se contenção estratégica.

E funcionou. És querida. És boa colega. És a que "sabe estar".

Mas o preço foi este: há uma versão tua que ninguém conhece.

A versão completa. A que sabe. A que decide. A que não precisa de sorrir no final da frase.

Podes começar a deixá-la aparecer. Em pequenas doses. Com pessoas seguras primeiro. Depois em contextos mais visíveis.

Não é arrogância. É devolução.

A tua coroa esteve escondida porque os outros estavam desconfortáveis.

E tu passaste anos a gerir o desconforto deles à custa do teu.

Há uma vida inteira pousada nesse cálculo.

É possível deixar de a fazer.

Não de uma vez. Em pequenas doses, começando pelas salas onde o custo é menor.

A coroa aparece devagar — e, quanto mais aparece, menos desculpas tem de dar.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep79",
        titulo: "A voz que é firme sem ser dura",
        curso: "a-coroa-escondida",
        texto: `Há uma voz que tu ainda não aprendeste a usar.

Não é a voz aguda que usas para agradar. Não é a voz dura que, quando finalmente explodes, te envergonha a ti mesma.

É outra voz.

É uma voz firme. Calma. Sem pedido de desculpa na entoação. Sem agressão na afirmação.

Uma voz que diz o que tem de dizer — e deixa a frase pousar.

Tem nome.

Chama-se voz da autoridade serena.

E as mulheres têm dificuldade particular em encontrá-la. Porque oscilam entre a voz suave que acomoda e a voz dura que se defende — sem o registo intermédio que muitos homens têm como norma.

Esta voz não é característica. É prática.

As mulheres que hoje a têm foram mulheres que, num ponto da vida, decidiram não gritar mais e não sussurrar mais.

Entre os dois registos, havia uma voz intermédia que elas tiveram de inventar.

Muitas vezes inventaram sozinhas. Porque não havia modelo.

E quando a voz começa a sair assim, o mundo ouve diferente. Espera o fim da frase. Responde com mais cuidado.

Não é a voz que muda tudo.

É que finalmente falas de um lugar que os outros reconhecem como autoridade.

E a autoridade, uma vez reconhecida, não precisa de ser repetida.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep80",
        titulo: "A presença que não precisa de grito",
        curso: "a-coroa-escondida",
        texto: `Há uma presença que tu já viste em outras mulheres.

Elas entram numa sala e, sem falarem alto, a sala ajusta-se.

Não é carisma no sentido comum. Não é magnetismo. É outra coisa — uma presença que parece ocupar o seu espaço sem competir pelo dos outros.

Estas mulheres não se esforçam por ser notadas. E são, na mesma.

Tu, se fores honesta, quiseste, em algum ponto, ser uma destas.

Mas não sabias como.

Porque aprendeste que para ser vista tinhas de aumentar o volume. Falar mais. Insistir. Provar.

E quanto mais tentavas, mais pequenas ficavas. Porque a presença real não se constrói com esforço.

Constrói-se com pousos.

Tem nome.

Chama-se centralidade.

Quando uma mulher está centrada em si, ela não precisa de grito. A sua voz, mesmo baixa, chega. O seu silêncio pesa. A sua presença é reconhecida antes do seu nome.

E esta centralidade não é privilégio de umas poucas.

É reconhecimento da posse do próprio lugar.

A maioria das mulheres passa a vida a pedir autorização silenciosa para existir em cada sala que entra.

Entra com a agenda dos outros. Senta-se onde convém. Fala quando há espaço.

A centralidade, que já existia dentro, fica adiada por décadas.

A coroa não é brilho.

É postura.

E os outros começam a ver-te sem teres de te anunciar quando, finalmente, tu mesma, sabes estar.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
    ],
  },
  {
    id: "nomear-serie-18",
    titulo: "Série Nomear — O Fio Invisível (Ep 81-86)",
    descricao: "O Fio Invisível (Heranças) — conexões invisíveis entre mulheres, transmissão silenciosa entre gerações.",
    scripts: [
      {
        id: "nomear-ep81",
        titulo: "O fio que liga a tua avó ao teu cansaço",
        curso: "o-fio-invisivel",
        texto: `Há um cansaço em ti que não começou em ti.

Dormes bem. Comes bem. Fazes o que consegues pelo corpo.

E mesmo assim — às vezes, sem aviso — vem um cansaço que não faz sentido para a tua vida.

Talvez já tenhas sentido em velórios. Em conversas longas com a tua mãe. Numa tarde qualquer em que te sentas e de repente pesa-te tudo.

Este cansaço não é teu sozinho.

É o cansaço de mulheres antes de ti que não tiveram tempo de o pousar.

A tua avó, que acordava às cinco para toda a gente. A sua mãe, que enterrou três filhos sem parar de cozinhar para os outros. Quatro gerações atrás, uma mulher cujo nome já ninguém sabe — que carregou o que nenhum corpo devia carregar sozinho.

A isto chamamos herança somática.

O cansaço delas ficou no fio. E o fio chegou a ti.

Não podes apagá-lo.

Mas podes, em ti, fazer aquilo que elas não puderam.

Pousar.

Por elas. Por ti. Pelas que ainda vêm.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep82",
        titulo: "As heranças que chegam sem carta",
        curso: "o-fio-invisivel",
        texto: `Herdaste coisas que ninguém mencionou em testamento.

Uma certa tendência a suspirar antes de começar uma frase difícil. Uma forma específica de preocupar-te. Uma maneira de olhar que é igual à da tua tia — a que não conheces bem, mas que, quando te mostraram a fotografia, reconheceste no imediato.

Estas heranças não têm escritura. Não pagaste imposto sobre elas. Ninguém te entregou uma lista do que te cabia.

Mas estão em ti.

Alguns gestos são dons. Outros são fardos. E outros, ainda, são as duas coisas ao mesmo tempo.

O nome é transmissão silenciosa.

Recebeste tudo sem teres sido perguntada.

E podes passar a vida inteira a agir segundo heranças que nunca escolheste receber.

Ou, em algum ponto, pôr-te a olhar para cada gesto e perguntar: isto é meu, ou é antigo?

A revisão da herança é o trabalho silencioso das mulheres que finalmente se sentam a sós com a própria vida.

E perguntam: de tudo isto que carrego, quanto é mesmo meu?

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep83",
        titulo: "Os gestos que fazes como ela sem saber",
        curso: "o-fio-invisivel",
        texto: `Há um gesto teu que não te lembras de teres aprendido.

A forma como pões a mão na anca quando estás a ouvir alguém. A maneira como mexes o cabelo quando estás nervosa. O som que fazes antes de dares uma opinião dura.

Alguém — uma tia, talvez — um dia disse-te: és tal e qual a tua avó.

E tu riste. Disseste que não fazias ideia.

Mas fazias.

O teu corpo sabia. Tinha observado durante anos, sem nunca registar que estava a observar. E replicava.

Há nome para isto: memória somática transgeracional.

Os gestos atravessam gerações com mais persistência do que os conselhos. Podes não lembrar-te do que a tua avó te dizia — mas o teu corpo sabe exactamente como ela pousava uma chávena.

E tu, sem saber, continuas-lhe o corpo.

Não te tira a identidade. Tu és nova. És tu. És a versão que ela não conseguiu ser.

Mas és também uma cadeia. Uma forma de ela continuar a mover-se no mundo.

E isso, se olhares bem, é bonito.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep84",
        titulo: "O que a tua mãe não te disse mas tu já sabias",
        curso: "o-fio-invisivel",
        texto: `Há coisas que a tua mãe nunca te disse.

Mas tu já sabias.

Sabias, sem saber como, que ela não tinha sido completamente feliz no casamento. Sabias que aquele emprego dela a tinha esgotado mais do que ela deixava transparecer. Sabias que havia uma amiga em quem ela confiava mais do que em qualquer pessoa da família.

Sabias tudo isto sem que ela te tivesse contado.

Porque as crianças — especialmente as filhas — sabem.

As filhas lêem as mães antes de saberem ler livros. Aprendem a decifrar o que não é dito. Captam o suspiro antes da frase. Reconhecem a cara antes do gesto.

E crescem com um arquivo de informação sobre a mãe que a própria mãe nunca partilhou.

Esse arquivo é incómodo. Porque tu sabias. Mas não podias dizer que sabias.

É conhecimento não autorizado.

É um arquivo que nenhuma amiga pode validar. Ninguém além de ti conhece a tua mãe como tu a conheceste — em silêncio, por leitura de corpo.

É uma solidão filial específica.

E a única forma de a aliviar é reconhecê-la.

Sim. Eu sabia.

Sabia antes de me ser dito.

E isso não é culpa minha. É filial.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep85",
        titulo: "As filhas que recebem o que as mães não puderam deixar",
        curso: "o-fio-invisivel",
        texto: `Há mulheres, às vezes, que terminam o que as mães começaram.

A mãe quis estudar e não pôde. A filha estuda tudo o que a mãe não pôde estudar.

A mãe quis viajar e ficou. A filha atravessa fronteiras como se lhe devessem.

A mãe quis ter voz e não lhe foi dada. A filha expõe-se. Fala em palcos. Escreve livros.

Estas filhas carregam um mandato que nunca foi explicitamente entregue.

Chamemos-lhe continuação silenciosa.

E o mandato tem custos.

Porque a filha que termina o que a mãe começou nem sempre sabe o que é dela e o que é da missão herdada. Nem sempre sabe se quer fazer isto ou se está só a pagar uma dívida emocional antiga.

Muitas mulheres chegam aos quarenta e percebem: fiz tanto, tão bem — e pouco disto era verdadeiramente meu.

Isto é doloroso. Mas não é o fim.

É o início de outra coisa.

Porque depois desta percepção, passa a ser possível escolher pela primeira vez. Com conhecimento de causa. Com a história desmontada.

Tens o direito de continuar — ou de parar.

Honras a tua mãe em qualquer das duas escolhas.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep86",
        titulo: "O silêncio que atravessa gerações",
        curso: "o-fio-invisivel",
        texto: `Há silêncios que atravessam três, quatro, cinco gerações.

Um avô que nunca falou da guerra. Uma avó que nunca falou de um filho perdido. Uma tia-avó que nunca falou da violência de alguém próximo.

Esses silêncios não morrem com quem os guarda.

Atravessam.

Passam para os filhos como peso. Para os netos como inquietação. Para as bisnetas como tema sem rosto.

Tu, talvez, sintas inquietação com certos assuntos sem saber porquê. Uma resistência a certos sítios. Um medo herdado de coisas que nunca te aconteceram.

A isto chamamos silêncio geracional.

É um fantasma sem nome que habita a família.

E há uma geração — normalmente, uma mulher — que se torna a que fala.

Talvez sejas tu.

Talvez sejas a que finalmente faz as perguntas que ninguém fez. Que junta as peças que ninguém juntou. Que dá nome ao que andava sem nome há décadas.

É um trabalho solitário. E muitas vezes incompreendido.

Mas é o trabalho que liberta.

Não só a ti.

A todas as que vêm depois.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
    ],
  },
  {
    id: "nomear-serie-19",
    titulo: "Série Nomear — A Arte da Inteireza (Ep 87-92)",
    descricao: "A Arte da Inteireza (Fronteiras) — integridade, ser quem se é sem se partir para caber nos outros.",
    scripts: [
      {
        id: "nomear-ep87",
        titulo: "As mulheres que aprenderam a dividir-se",
        curso: "a-arte-da-inteireza",
        texto: `Ensinaram-te, desde muito cedo, a dividir-te.

Uma versão tua para a mãe. Outra para o pai. Outra para a escola. Outra para o amigo que não se dava com o outro amigo.

Aprendeste a ser várias antes de seres uma.

E aperfeiçoaste isto ao longo da vida. A mulher no trabalho, a mulher no grupo de amigas, a mulher em casa, a mulher sozinha de madrugada. Todas tuas, todas diferentes, todas geridas.

Aprendeste a ser uma mulher de muitas máscaras.

A isto chamamos fragmentação adaptativa.

Foi estratégia. Foi sobrevivência.

Mas tem preço. Com o tempo, já não sabes bem qual é a tua voz real. Porque todas as versões são tão tuas que nenhuma parece mais tua do que as outras.

E ficas partida sem teres sido quebrada.

Inteira não é uma mulher que nunca se adaptou.

É uma mulher que, debaixo das adaptações, continua a saber qual é a voz que sobra quando está só.

Essa voz, em ti, ainda existe.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep88",
        titulo: "A versão de ti que entra em cada sala",
        curso: "a-arte-da-inteireza",
        texto: `Há uma versão tua que entra em cada sala antes de ti.

Entra numa reunião de trabalho como a mulher profissional. Entra num jantar de família como a filha, ou a irmã, ou a tia. Entra com as amigas como a amiga. Entra com um parceiro como uma versão da amante.

Estas versões não são mentira. São pedaços teus.

O problema não está em existirem.

O problema está em teres deixado de te reconhecer nos intervalos entre elas.

Aqueles cinco minutos a sós no carro, depois de saíres da reunião e antes de entrares em casa. Esses minutos em que nenhuma das versões está activa.

Quem és tu nesse intervalo?

É a mulher entre versões.

E ela é a que mais precisa de ser reconhecida.

Se continuas a preencher os intervalos com outra versão, com o telefone, com pensamentos sobre a próxima sala — não chegas nunca a ti.

Chegas a uma versão tua.

E há uma diferença.

A inteireza não é uma versão perfeita.

É a mulher nos intervalos.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep89",
        titulo: "O cansaço de ser muitas",
        curso: "a-arte-da-inteireza",
        texto: `Há um cansaço específico em ser muitas versões de ti.

Não é físico. Não é emocional, exactamente. É um cansaço de gestão.

Toda a tua energia vai para saber qual versão se apresenta aqui. Qual tom de voz. Qual palavra. Qual conversa serve neste grupo. Qual piada cai bem naquele outro.

Nunca te sentes completamente à vontade — porque estás sempre a escolher.

E a mulher que escolhe sempre é uma mulher exausta.

O nome é carga de performance.

Os homens, em muitos contextos, não conhecem esta carga com a mesma intensidade. Para muitos, há uma versão de si que é mais ou menos estável em vários contextos. Adaptam o tom, mas não se reescrevem.

As mulheres, pelo contrário, aprendem a reescrever-se em cada sala.

E ao fim do dia — quando chegas a casa, quando te deitas, quando finalmente ninguém te observa — és atingida pelo cansaço de teres sido quatro ou cinco mulheres desde que te levantaste.

Não és fraca.

És uma mulher que geriu performances em regime permanente.

E isso, por mais cultural que seja, é ainda assim um peso.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep90",
        titulo: "O dia em que paraste de te adaptar",
        curso: "a-arte-da-inteireza",
        texto: `Há um dia — às vezes é uma decisão, às vezes é uma exaustão — em que paras de te adaptar.

A conversa vai numa direcção. Tu já não a acompanhas. Ficas calada. Ou, pela primeira vez, dizes o que pensas sem suavizar.

E a sala muda.

Alguém olha para ti diferente. Outra pessoa fica desconfortável. Alguém ri com alívio — talvez estivesse à espera que tu falasses.

Chamemos-lhe o dia do descolamento.

Não é dramático. Não precisa de grito.

É só o momento em que deixa de valer o esforço de seres a que se adapta.

E percebes, com espanto, que o mundo continua.

As pessoas ajustam-se. A vida continua. Algumas relações reagem mal — mas outras, que nem sabias que tinhas, ficam de repente mais próximas.

Porque, sem o saberes, havia pessoas à tua volta à espera de te verem inteira.

Só não sabiam se tu ias aparecer.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep91",
        titulo: "A inteireza que assusta",
        curso: "a-arte-da-inteireza",
        texto: `A mulher inteira assusta.

Não por ser agressiva. Não por ter feito algo errado.

Assusta porque é rara.

Numa sala em que todas estão parcialmente adaptadas, uma mulher que não se adapta — que fala do que sente, que discorda sem pedir desculpa, que ri alto sem olhar à volta — parece fora do lugar.

E o grupo nota. Por vezes com admiração. Por vezes com distância.

É o preço da inteireza.

Ser inteira não é ser popular. Não é, necessariamente, ser querida por todos.

É ser reconhecida por quem tem capacidade de te reconhecer.

E isso é menos gente do que gostarias. Pelo menos no início.

As relações que resistirem à tua inteireza são relações reais.

As que não resistirem — eram relações com uma versão tua. Não contigo.

E não ter essas relações não é perda.

É limpeza.

A mulher inteira, aos poucos, tem menos pessoas à volta.

Mas as que tem, conhece.

E elas conhecem-na.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep92",
        titulo: "As mulheres inteiras que reconheceste",
        curso: "a-arte-da-inteireza",
        texto: `Viste, na tua vida, algumas mulheres inteiras.

Não muitas. Talvez três ou quatro. Se tiveste sorte, mais.

Não eram mulheres famosas. Nem, necessariamente, bem-sucedidas nos termos convencionais.

Eram mulheres que entravam numa sala e a sala notava. Que diziam o que pensavam sem pedir desculpa. Que sabiam rir e sabiam ficar em silêncio.

Lembraste-te delas depois de anos sem as ver. Porque fizeram marca.

Chamemos-lhes testemunhas de possibilidade.

Elas, sem saberem, mostraram-te que isto é possível.

Que uma mulher pode, de facto, existir sem se pulverizar.

E isso ficou como referência em ti — mesmo que durante anos tivesses continuado a fragmentar-te.

Agora, no ponto em que estás, podes chamá-las à memória.

Não para as imitares. Não são receita.

São apenas testemunhos de que o que procuras é possível.

Existe. Existiu. Elas conseguiram.

Tu também.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
    ],
  },
  {
    id: "nomear-serie-20",
    titulo: "Série Nomear — O Espelho do Outro (Ep 93-98)",
    descricao: "O Espelho do Outro (Fronteiras) — relações como espelhos, projecção, rejeição, o que vemos no outro que é de nós.",
    scripts: [
      {
        id: "nomear-ep93",
        titulo: "O que te irrita no outro",
        curso: "o-espelho-do-outro",
        texto: `Há algo, numa pessoa, que te irrita desproporcionalmente.

Não é a coisa em si. Outras pessoas fazem-no também e a ti não incomoda.

É naquela pessoa especificamente que aquele pequeno gesto te tira do sério.

A forma como ela pede. A voz que faz. A insistência. A indirecção. O facto de ser como é.

A isto chamamos irritação desproporcional.

E quase sempre, quando a irritação é desproporcional, há um espelho.

A pessoa está a fazer algo que te mostra um pedaço teu que rejeitaste.

Ela pede demais — e tu rejeitaste em ti a parte que pede. Ela fala alto — e tu silenciaste em ti a parte que queria ser ouvida. Ela é insegura — e tu escondeste a tua insegurança tão fundo que nem te lembras dela.

Não é a outra que te irrita.

É o lembrete que ela te dá, sem querer, do que recusaste em ti.

Isto não significa que tenhas de gostar dela.

Mas a irritação é informação. Valiosa.

Aponta para o que tu ainda não te perdoaste.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep94",
        titulo: "As pessoas que te desmontam sem saber",
        curso: "o-espelho-do-outro",
        texto: `Há pessoas que, sem te fazerem nada, te desmontam.

Chegam perto e tu sentes a tua firmeza a desaparecer. Fazem uma pergunta inofensiva e tu respondes de forma que não reconheces. Estão cinco minutos na tua companhia e tu sais daquele momento sem saber o que aconteceu.

Não é maldade delas. Elas nem fazem ideia do efeito.

Tens, apenas, uma sensibilidade específica àquela energia delas.

É permeabilidade relacional.

Algumas mulheres são mais permeáveis a certos tipos de pessoa. Para outras, essas mesmas pessoas não têm nenhum efeito.

Não és frágil.

És especificamente sensível a um padrão.

Normalmente esse padrão vem da tua infância. Aquela pessoa recorda-te, sem saber, alguém da tua família de origem. E o teu corpo, ao reconhecer, entra em modo antigo — de adaptação, de tentativa de agradar, de recolhimento.

A permeabilidade não é defeito.

É memória por integrar.

E quanto mais reconheces o padrão, mais te torna imune à desmontagem.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep95",
        titulo: "O elogio que não consegues receber",
        curso: "o-espelho-do-outro",
        texto: `Alguém fez-te um elogio. Real. Específico. Sem pedir nada.

E tu desviaste.

Disseste: ah, foi sorte. Ou: era o mínimo. Ou: mas tu é que... — e redireccionaste para a outra pessoa.

O elogio ficou no ar. Sem destinatário.

O nome é desvio reflexo.

E é das formas mais subtis de te diminuíres.

Porque o elogio que não é recebido não é apenas rejeição de uma gentileza. É confirmação a ti mesma de que não mereces ser elogiada.

Com o tempo, os elogios começam a aparecer menos. Porque as pessoas cansam-se de ter os seus gestos devolvidos.

E tu ficas no lugar que parece confortável: a que se diminui.

Mas esse lugar não é confortável. É apenas conhecido.

O conforto real está do outro lado do desconforto de dizer, simplesmente: obrigada.

Sem piada. Sem devolver. Sem diminuir.

Obrigada.

Só isso.

A outra pessoa fica em paz. E tu ficas a tremer um pouco — é natural.

Receber elogios, afinal, é uma prática. Não é talento.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep96",
        titulo: "O que vês em quem amas",
        curso: "o-espelho-do-outro",
        texto: `Há características em quem tu amas que já não são objectivas.

Viste-as tantas vezes, com tanto afecto, que estão pintadas com a cor que tu pões.

Achas-lhe inteligente onde talvez seja apenas confiante. Acha-lo vulnerável onde talvez seja fechado. Acha-lo engraçado onde talvez seja só familiar.

Não é que te estejas a enganar.

É que o amor, uma vez instalado, redesenha.

Chamemos-lhe leitura afectuosa.

Pessoas de fora, às vezes, olham para a pessoa que tu amas e vêem algo muito diferente do que tu vês.

Não significa que estejam certas. Nem que tu estejas errada. Significa, apenas, que o amor é uma lente.

E uma lente deforma. Às vezes para melhor. Às vezes para pior.

Isto torna-se relevante quando a pessoa amada mostra algo difícil de ver — uma crueldade pequena, uma desatenção repetida, uma incapacidade de estar presente.

Pelos teus olhos, esse sinal atenua. Pelos olhos de fora, é nítido.

Há um ponto em que ouvir quem não partilha da tua lente deixa de ser deslealdade.

Passa a ser a única forma de não te perderes naquilo que o amor redesenhou.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep97",
        titulo: "A rejeição que fala mais de ti do que da outra pessoa",
        curso: "o-espelho-do-outro",
        texto: `Foste rejeitada.

Numa candidatura. Numa relação. Por alguém de quem esperavas mais.

A primeira reacção foi dor. A segunda, talvez, a leitura da pessoa: ela é assim, ele é assado, faz sentido que tenham feito isso.

Mas há uma terceira camada que raramente se olha.

A rejeição, além de ser sobre a outra pessoa, é um texto sobre ti.

Não sobre o teu valor. Nunca sobre isso.

Sobre o que estava em jogo para ti.

Se a rejeição te desmontou completamente — provavelmente estavas a tentar confirmar algo sobre ti através daquela aceitação.

Se a rejeição te deixou triste mas funcional — provavelmente a tua identidade não estava dependente.

Se quase nem sentiste — provavelmente nem era a coisa certa para ti, e tu, lá no fundo, já sabias.

A isto chamamos a rejeição como informação.

Não sobre como és vista. Sobre como dependes do olhar do outro.

E isso, a longo prazo, é o trabalho mais importante.

Libertar a tua identidade do que os outros dizem sobre ti.

Cada rejeição é uma oportunidade de saberes onde ainda não libertaste.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep98",
        titulo: "As mulheres que te desafiam sem razão aparente",
        curso: "o-espelho-do-outro",
        texto: `Há mulheres que, em certas salas, te desafiam sem razão aparente.

Não tens história com elas. Não lhes fizeste nada. Mas quando falas, elas interrompem. Quando estás a ser ouvida, elas contam uma história maior. Quando ofereces uma ideia, elas encontram um problema.

Parece hostilidade.

Às vezes é.

Mas às vezes é outra coisa.

É que tu, a estares numa sala de forma mais inteira, ameaças uma posição delas — sem saberes e sem quereres.

Elas aprenderam, num contexto em que competiam por espaço escasso, que mulheres inteiras eram ameaça.

E o reflexo defende-se antes da razão decidir.

É competição herdada.

Não é sobre ti especificamente.

É sobre a escassez em que elas aprenderam a operar.

Isto não te obriga a gostar delas. Não te obriga a estar no mesmo espaço se te desgasta.

Mas muda o que sentes.

Já não é pessoal.

É uma herança delas.

E tu, que vês, podes continuar presente — sem competir e sem recuar.

Às vezes, é isso que desarma o reflexo.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
    ],
  },
  {
    id: "nomear-serie-21",
    titulo: "Série Nomear — Olhos Abertos (Ep 99-104)",
    descricao: "Olhos Abertos (Ciclos) — ver sem ilusões, despertar lúcido, consciência ganha.",
    scripts: [
      {
        id: "nomear-ep99",
        titulo: "O dia em que deixaste de conseguir não ver",
        curso: "olhos-abertos",
        texto: `Durante anos, conseguiste não ver.

Era útil. Continuavas a viver. Continuavas a amar. Continuavas a acreditar.

Alguns sinais passavam. Tu explicavas-os. Encaixavas-os numa narrativa que fazia sentido.

E um dia — sem teres decidido — deixou de ser possível.

Aquele sinal que ignoravas começou a não desaparecer. Aquela pergunta que afastavas começou a voltar sozinha. Aquela dúvida que minimizavas começou a pesar.

E tu viste.

Viste inteira. Sem filtro. Sem conforto.

A isto chamamos despertar não solicitado.

Não foi escolha. Foi um acontecimento que chegou sem aviso.

E depois dele, não há regresso. Não podes ver menos. Não podes esquecer a pergunta. Não podes voltar ao estado anterior.

Algumas mulheres tentam. Ficam anos a tentar voltar a não ver.

Não funciona.

A consciência, uma vez acontecida, não desinstala.

E isto, apesar de doer, é um favor.

Porque a vida que seguia sem a tua presença era uma vida a menos.

Agora, pelo menos, é a tua.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep100",
        titulo: "A ingenuidade que já não te protege",
        curso: "olhos-abertos",
        texto: `Durante muito tempo, a ingenuidade funcionou.

Achavas que as pessoas tinham boas intenções. Acreditavas que as coisas se resolveriam se tu continuasses a dar. Pensavas que a verdade acabaria por prevalecer.

Viveste com este conjunto de presunções e até te serviu.

Agora já não serve.

Viste demasiada coisa para ainda presumir. Foste magoada em sítios onde a ingenuidade te deixou exposta. Cresceste, e ver é responsabilidade que chega com a idade.

O nome é fim da inocência útil.

Não é cinismo. O cinismo é cansaço sem análise.

Isto é outra coisa. É lucidez sem amargura — quando consegues chegar lá.

A lucidez não presume o pior. Mas também não presume o melhor sem prova.

É observação sem veredicto antecipado. Escuta sem agenda. Confiança quando há razão. Desconfiança quando há razão.

A ingenuidade, por mais bonita que parecesse, era uma forma de não teres de ler o mundo.

Agora lês.

O mundo, lido, é menos confortável.

Mas é mais teu.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep101",
        titulo: "As verdades que ficam mais claras com os anos",
        curso: "olhos-abertos",
        texto: `Há verdades sobre a tua vida que só ficam claras com os anos.

Aos vinte, certas coisas pareciam dramas. Aos trinta, perspectiva. Aos quarenta, lições. Aos cinquenta, piadas.

O tempo não resolveu. Decantou.

Alguns pedaços que pareciam perdas foram-se revelando protecções. Alguns que pareciam sortes foram-se revelando enganos. Alguns que pareciam importantes perderam cor. Alguns que pareciam triviais ganharam peso.

A isto chamamos decantação.

Não é sabedoria retroactiva. É apenas o que acontece quando se vive o suficiente para ver o que cada acontecimento se tornou.

E esta decantação é uma das pouquíssimas vantagens de envelhecer.

Os que eram teus aos vinte e já não são aos cinquenta — não eram para durar.

Os que continuam a ser teus ao longo das décadas — esses são permanência.

Não sabes à partida quais vão ficar e quais vão embora.

Mas sabes, agora, que a decantação existe.

E podes, já, deixar de lutar tanto contra ela.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep102",
        titulo: "Os filtros que caíram sem tu pedires",
        curso: "olhos-abertos",
        texto: `Havia filtros que te protegiam.

Um filtro pelo qual vias o teu pai sempre como figura protectora, mesmo quando não o era. Um filtro pelo qual certa amiga era sempre leal, mesmo quando não foi. Um filtro pelo qual o teu casamento estava bem, mesmo quando todos à volta já viam que não.

Os filtros existiam porque olhar sem eles era insuportável. O filtro era cuidado do teu sistema psicológico — de te deixar funcionar.

E depois, algures, caíram.

Sem teres pedido. Sem teres decidido.

Viste.

O que viste, em cada caso, foi doloroso. Mas também foi o início de alguma coisa.

Chamemos-lhe queda dos filtros.

Os filtros caem quando o sistema está pronto. Não antes. Nunca antes.

Se caíram agora, é porque já tens estrutura suficiente para suportar o que vês.

Confia no tempo do teu sistema.

Ele protegeu-te até ao ponto em que já não precisavas de ser protegida.

A verdade que agora vês não é cruel.

É pontualidade.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep103",
        titulo: "O que tu vês agora que antes não vias",
        curso: "olhos-abertos",
        texto: `Há coisas que vês hoje, em situações vulgares, que antes passavam despercebidas.

O momento em que alguém te interrompe repetidamente — e tu vês. Antes, aceitavas.

O comentário passivo-agressivo num jantar de família — e tu vês. Antes, atribuías a mau dia.

A forma como certas mulheres se apagam — e tu vês. Antes, pensavas que era personalidade.

É visão afinada.

Não é paranoia. É precisão.

Esta visão tem custo. Muitas situações que antes corriam sem te magoarem agora magoam. Muitas conversas que antes eram normais agora soam como opressão.

Isto não é regressão. É progressão.

O que mudou não foi o mundo.

Foste tu a ganhar olhos novos.

E às vezes, quando a visão é nova, tu duvidas dela. Pensas: talvez seja eu que estou a exagerar.

Não estás.

A visão afinada, no início, assusta.

Mas é a ferramenta que te vai permitir escolher, a partir daqui, o que vais aceitar e o que vais recusar.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep104",
        titulo: "A solidão de quem vê",
        curso: "olhos-abertos",
        texto: `Há uma solidão específica de quem começou a ver.

Vês coisas que pessoas à tua volta ainda não vêem. Dizes-o. Elas não percebem. Ou percebem mas não querem ver. Ou percebem e ficam desconfortáveis contigo por teres visto.

E tu ficas sozinha — com o conhecimento.

Há nome para isto: solidão lúcida.

Não é depressão. Não é isolamento.

É apenas o intervalo entre tu veres e os outros verem.

Esse intervalo pode durar meses. Pode durar anos. Pode durar o resto da vida de algumas relações.

Algumas pessoas nunca vão chegar ao sítio onde tu já estás.

Não por serem inferiores. Por terem escolhido outra coisa, ou por ainda não ter chegado a hora delas, ou por nunca vir a chegar.

E tu, ao longo do tempo, vais encontrando mulheres que vêem contigo.

Elas existem.

São poucas. Mas existem.

Quando se encontram — uma reconhece a outra imediatamente.

Pelos olhos. Pelo que se cala quando a outra fala. Pelo peso do que partilham.

A solidão lúcida é preço do ver.

Mas termina, a certa altura, nas companhias certas.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
    ],
  },
  {
    id: "nomear-serie-22",
    titulo: "Série Nomear — Flores no Escuro (Ep 105-110)",
    descricao: "Flores no Escuro (Ciclos) — esperança sem otimismo, beleza no difícil, vida que insiste.",
    scripts: [
      {
        id: "nomear-ep105",
        titulo: "A alegria que chega no meio do luto",
        curso: "flores-no-escuro",
        texto: `Estás em luto.

E um dia, a meio de uma manhã qualquer, a alegria chega.

Não é grande. É pequena. Uma luz que atravessa a cortina. Uma música na rádio. Uma cor que te agrada sem saberes porquê.

E, por um instante, ris. Ou sorris.

E logo a seguir, culpa.

Como te atreves a rir quando perdeste tanto? Como podes permitir-te alegria quando ainda dói?

É alegria envergonhada.

E é das experiências mais comuns — e menos ditas — no meio do luto.

Mas a alegria que chegou não é deslealdade.

É prova de que estás viva. De que o teu sistema não te abandonou. De que, por dentro, algo continuou a fazer trabalho quando tu nem te apercebias.

A alegria no meio do luto não invalida o luto.

Ela é parte de como se volta.

Não pouco a pouco. Por piscadelas pequenas de luz.

A primeira alegria envergonhada é sempre a mais difícil.

As seguintes chegam mais facilmente.

E um dia, sem notares, a alegria volta a ocupar mais espaço do que a dor.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep106",
        titulo: "As coisas pequenas que continuam a importar",
        curso: "flores-no-escuro",
        texto: `Há pessoas que passaram por muito.

Viram coisas que nenhuma preparação possível podia evitar. Perderam gente. Atravessaram doenças. Viveram anos sem luz à frente.

E quando as conheces, o que te surpreende não é a gravidade delas.

É o cuidado que têm com as coisas pequenas.

O café da manhã feito com atenção. A cama feita antes de saírem. A planta regada. O telefonema curto à velha amiga.

Não é distracção. Não é fingimento.

É outra coisa.

O nome é antigo: o cuidado depois.

Quem passou por muito aprende que a vida não se faz das coisas grandes. As coisas grandes acontecem raramente — e quando acontecem, muitas vezes não podemos contar com elas.

A vida faz-se das coisas pequenas.

E quando chegas a essa compreensão, já não desprezas o café lento. Já não reclamas da rotina. Já não achas que o teu dia foi pouco se só foste passear.

As coisas pequenas ficaram grandes.

Porque eram, sempre, tudo o que verdadeiramente se tinha.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep107",
        titulo: "A esperança que aprendeste a não prometer",
        curso: "flores-no-escuro",
        texto: `Houve um tempo em que fazias promessas.

Ias ser isto. Ias conseguir aquilo. Ias construir. Ias resolver. Ias mudar.

E a vida, a certas alturas, mostrou-te que as promessas não estavam nas tuas mãos.

Algumas coisas que prometeste não aconteceram. Algumas que aconteceram não eram as que prometias. Algumas pessoas que não prometeste apareceram, e foram as mais importantes.

Aprendeste a não prometer.

Não por cinismo. Por humildade.

Chamemos-lhe esperança sem anúncio.

É outra forma de ter esperança.

Não é a esperança dos vinte, pública e ruidosa. É a esperança dos quarenta, privada e paciente.

Continuas a esperar. Continuas a desejar. Continuas a trabalhar para que algumas coisas aconteçam.

Mas já não anuncias. Já não dizes, em voz alta, que sim, vai acontecer, está tudo encaminhado.

Sabes que não está.

E mesmo assim, continuas.

Esta esperança mais silenciosa é mais dura e mais fiel.

Não precisa de plateia. Não precisa de confirmação externa. Vive em ti.

E, por isso, resiste.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep108",
        titulo: "O que floresce quando não estás a olhar",
        curso: "flores-no-escuro",
        texto: `Há coisas que florescem quando tu não estás a olhar.

Estiveste meses a tentar fazer algo acontecer. A forçar. A procurar. A pressionar.

E um dia, desistes. Ou simplesmente distrais-te. Viras a atenção para outra coisa.

E é nesse momento — quando deixas de olhar — que o que tanto quiseste começa a acontecer.

Uma amizade que aparece sem convite. Uma oportunidade que chega por uma via impensável. Uma paz que se instala quando paras de a procurar.

Há um nome para isto: florescimento por distracção.

Não é mágico. É natural.

A pressão constante sobre uma coisa, muitas vezes, impede-a de acontecer. O teu olhar insistente bloqueia o fluxo.

Quando olhas para outro lado, o espaço abre.

E a coisa que esperavas, liberta, chega.

Isto não é incentivo à passividade. Nem todas as coisas acontecem sem esforço.

Mas algumas sim.

E quando começares a reconhecer o padrão, vais saber quando é altura de empurrar.

E quando é altura de olhar para outro lado, por uns dias, e deixar o mundo trabalhar.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep109",
        titulo: "O dia em que sorriste sem motivo",
        curso: "flores-no-escuro",
        texto: `Houve um dia, talvez recente, em que sorriste sem motivo.

Acordaste normal. Não tinha acontecido nada extraordinário. Estavas a fazer uma coisa banal — lavar louça, esperar pelo autocarro, pôr açúcar no café.

E sorriste.

Não porque algo engraçado te tivesse lembrado. Não porque uma boa notícia tivesse chegado.

Apenas sorriste.

Ficaste surpreendida contigo mesma.

Porque há muito tempo que não te acontecia. Ou porque a fase por que tens passado não parecia ter lugar para sorrisos inesperados.

É o reaparecimento da alegria base.

A alegria base é a que existe debaixo de tudo. Não é felicidade com causa. É uma espécie de presença alegre no próprio existir.

Foste-a perdendo com os anos e com os pesos.

E volta, às vezes, quando há menos a bloquear.

Quando sorris sem motivo, não é frivolidade.

É sinal de que alguma coisa dentro de ti está a curar-se sozinha.

Sem tu teres trabalhado.

Sem tu teres pedido.

A cura também acontece assim. Às vezes.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep110",
        titulo: "As mulheres que continuaram sem saber como",
        curso: "flores-no-escuro",
        texto: `Houve mulheres, na tua família, que continuaram.

Não tinham livros sobre resiliência. Não tinham psicólogos. Não tinham comunidade. Tinham, quase sempre, muito menos do que tu tens agora.

E continuaram.

A tua avó, depois de a morte do primeiro filho. A tua tia, depois do divórcio quando isso ainda era escândalo. A tua bisavó, depois da fome, da guerra, do que nunca foi contado.

Não deixaram manuais. Não tinham vocabulário para explicar.

Apenas continuaram.

Chamamos-lhe resistência sem linguagem.

Elas continuaram porque não havia outra opção. Porque ninguém lhes ofereceu colapso.

E essa continuação é, ainda hoje, património silencioso que te pertence.

Tu continuas, de alguma forma, por causa delas.

Não é romantização. Algumas pagaram caro. Muitas estavam em depressão profunda sem saberem o nome.

Mas a capacidade que tu tens, mesmo nos piores dias, de te levantares, de fazeres o que tem de ser feito, de continuares — essa capacidade não começou em ti.

Começou muito antes.

E quando honras as tuas próprias continuações, sem dramatizar mas também sem menosprezar, estás a honrá-las a elas.

A linha de continuação não partiu.

Passou por ti.

E continua depois de ti.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
    ],
  },
  {
    id: "nomear-serie-23",
    titulo: "Série Nomear — O Relógio Partido (Ep 111-116)",
    descricao: "O Relógio Partido (Ciclos) — tempo subjetivo, urgência herdada, fases da vida, comparação.",
    scripts: [
      {
        id: "nomear-ep111",
        titulo: "A pressa que herdaste",
        curso: "o-relogio-partido",
        texto: `Tens pressa.

Acordas com ela. Levas-a para as tuas conversas. Deitas-te com a sensação de que mais alguma coisa ficou por fazer.

A pressa não é novidade. Tens-na há anos.

Mas se pensares com atenção — não começou em ti.

A tua mãe tinha pressa. A tua avó tinha pressa. As mulheres da tua família tinham sempre mais coisas para fazer do que tempo para as fazer.

Aprendeste a pressa antes de saberes ler um relógio.

É pressa hereditária.

É o ritmo em que as mulheres da tua família aprenderam a operar. Porque sempre houve mais um filho a tratar, mais uma refeição a fazer, mais uma exigência invisível a cumprir.

E tu herdaste o andamento.

Mesmo quando a tua vida, hoje, não exige este ritmo, ele continua contigo.

A pressa é um modo de funcionamento. Não tem, muitas vezes, relação com a urgência real.

E o que aparentemente resolves com a pressa paga-se noutros sítios.

No corpo. No sono. Na qualidade de como estás com quem amas.

A pressa herdada é uma das heranças mais invisíveis — e mais universalmente feminina.

Reconhecê-la é o primeiro gesto para decidir se ela ainda é tua.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep112",
        titulo: "O tempo em que já deverias ter X",
        curso: "o-relogio-partido",
        texto: `Há uma lista invisível.

Aos vinte e cinco, já deverias estar a construir carreira. Aos trinta, já deverias estar casada. Aos trinta e cinco, já deverias ter filhos. Aos quarenta, já deverias ter casa. Aos cinquenta, já deverias estar no sossego.

Ninguém escreveu esta lista. Mas ela opera.

Opera dentro de ti, e opera na forma como os outros te olham.

E quando estás fora da lista, há um desconforto constante. Uma sensação de que estás atrasada. Ou, pior, de que algo em ti falhou.

A isto chamamos calendário social herdado.

Ele não é universal. Mudou de geração para geração. Está a mudar em tempo real. E tu, em certos aspectos, vais viver muito fora dele sem que isso seja uma falha.

Mas enquanto não reconheces que é calendário — não tua verdade — ele pesa.

Pesa no momento em que fazes anos e listas, mentalmente, o que não aconteceu ainda. Pesa quando vês os filhos das amigas e sentes um aperto. Pesa quando alguém te pergunta, num jantar, quando é que vais X.

Não é a tua vida que está fora da hora.

É a hora que te deram não serve para a tua vida.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep113",
        titulo: "As fases que ninguém te prepara",
        curso: "o-relogio-partido",
        texto: `Há fases da vida para as quais ninguém te prepara.

A fase em que percebes que os teus pais estão a envelhecer mais depressa do que tu pensavas. A fase em que os filhos deixam de precisar de ti da forma a que estavas habituada. A fase em que o corpo começa a mudar de formas que nenhum livro te explicou. A fase em que o teu trabalho, que sempre foi significativo, deixa de ser suficiente.

Cada uma destas fases chega sem aviso.

E cada uma tem o seu próprio luto. A sua própria reconstrução. A sua própria solidão.

Chamamos-lhes transições invisíveis.

Invisíveis porque não têm rituais. Não há festa. Não há cerimónia. Não há marco claro.

Mas transformam-te tanto como os marcos que se celebram.

Muitas mulheres chegam às transições sem linguagem para elas. Sem terem visto outras mulheres falarem sobre isto. Sem manual.

Isto faz com que cada uma pense, secretamente, que o que sente é estranho. Que mais ninguém está a passar pelo mesmo.

Não é verdade.

Todas as mulheres que atravessaram a fase em que estás agora passaram pelo que tu estás a passar.

Só não te foi dito.

Porque a linguagem, até agora, ainda não chegou plenamente a estas transições.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep114",
        titulo: "O calendário dos outros na tua vida",
        curso: "o-relogio-partido",
        texto: `Há pessoas que operam em ti num calendário que não é o teu.

A tua mãe quer que tu passes lá todos os domingos. A tua amiga espera que respondas às mensagens dela em horas. O teu parceiro espera que as férias sejam as que ele planeia. A família espera que tu compareças a todas as ocasiões.

Cada um tem uma expectativa sobre como o teu tempo deve ser distribuído.

E tu, sem te apercebermos de quando isto aconteceu, passaste a viver segundo o calendário deles.

Os teus fins-de-semana estão preenchidos sem tu teres decidido.

As tuas tardes estão reservadas sem tu teres escolhido.

As tuas férias estão definidas sem tu teres imaginado o que terias vontade de fazer se o tempo fosse mesmo teu.

É tempo colonizado.

E é um dos custos mais invisíveis de seres uma mulher a cuidar.

A tua vida financeira pode ser tua. A tua vida profissional pode ser tua. Mas o teu tempo — esse, muitas vezes, pertence a um conjunto de outras agendas.

Recuperar o teu calendário não é rebeldia. É condição.

Condição para que outras decisões que fazes sobre a tua vida tenham espaço para respirar.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep115",
        titulo: "O tempo que perdeste a comparar-te",
        curso: "o-relogio-partido",
        texto: `Houve momentos, na tua vida, em que perdeste tempo a comparar-te.

Comparaste-te com amigas que pareciam ter tudo resolvido. Com colegas que pareciam mais à frente. Com irmãs que pareciam fazer tudo mais fácil. Com pessoas nas redes sociais que viviam uma vida que não era nada como a tua.

Cada comparação durava minutos. Às vezes horas. Às vezes dias.

E esses minutos, horas, dias — não eram neutros.

Roubavam energia. Roubavam clareza. Roubavam a possibilidade de estares presente na tua própria vida.

É tempo subtraído.

Não é tempo gasto. É tempo tirado.

E se somares — aproximadamente — quanto tempo ao longo da tua vida perdeste em comparação, o número é assustador. Semanas. Meses. Talvez anos.

Isto não é para te culpar. Ninguém te ensinou a não te comparar. Aprendeste em famílias que comparavam filhos. Em escolas que ordenavam por mérito. Em redes sociais cujo modelo de negócio é a comparação.

Mas agora que reconheces, cada vez que a comparação chega e tu a identificas antes de te perderes nela, estás a recuperar minutos.

Minutos que, somados, começam a devolver-te tempo que pensavas perdido.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep116",
        titulo: "A hora que só tu reconheces",
        curso: "o-relogio-partido",
        texto: `Há uma hora do dia que é especificamente tua.

Talvez seja antes de todos acordarem. Talvez seja depois de todos se deitarem. Talvez seja aquela meia-hora a meio da tarde em que, inexplicavelmente, o mundo fica mais silencioso.

Esta hora tem qualidade diferente. Uma espécie de espaço que nem sabias que podia existir.

Tu reconheces esta hora no corpo.

Nem sempre consegues usá-la. Às vezes há exigências. Às vezes há sono. Às vezes há a tentação de a preencher com telefone ou tarefas.

Mas quando consegues, a hora faz-te diferente no resto do dia.

Há nome para isto: hora própria.

Não é igual para todas as mulheres. Cada uma tem a sua.

E quase nenhuma reconheceu ainda qual é a dela.

Porque a maioria vive com um ritmo imposto de fora. O ritmo do trabalho. O ritmo da família. O ritmo dos filhos, se os tem.

A hora própria é a que resiste apesar de todos os outros ritmos. Aquela que insiste em chegar, mesmo quando tu a ignoras.

Descobrir qual é a tua — e dar-lhe nome — é dos actos mais simples e mais revolucionários que podes fazer.

Porque a partir dela, a tua vida ganha um ponto de referência que não é dos outros.

É teu.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
    ],
  },
  {
    id: "nomear-serie-24",
    titulo: "Série Nomear — O Ofício de Ser (Ep 117-122)",
    descricao: "O Ofício de Ser (Ciclos) — identidade, propósito emergente, vocação sem carreira, o que tu és.",
    scripts: [
      {
        id: "nomear-ep117",
        titulo: "A coisa que tu és e não tem nome",
        curso: "o-oficio-de-ser",
        texto: `Há algo em ti que não tem nome.

Não é profissão. Não é papel familiar. Não é função social.

É uma qualidade tua que atravessa todos os contextos em que te encontras. Uma forma de olhar. Uma forma de estar. Uma espécie de cheiro tua que fica nos sítios por onde passas.

As pessoas que te conhecem reconhecem esta coisa, embora também não saibam como se chama.

Tu também a reconheces — mas, muitas vezes, só quando alguém a nomeia por ti.

O nome é ofício de ser.

Não se ensina. Não se formaliza. Não cabe num CV.

Mas é o que torna possível tu fazeres o que fazes à maneira específica como o fazes.

Se amanhã mudares completamente de profissão, de país, de vida — esta coisa vai contigo. É inalienável.

Descobrir o teu ofício de ser é um trabalho de uma vida.

Às vezes só o reconheces aos cinquenta. Às vezes aos setenta.

Mas se fores olhando, vai-se revelando. Peça por peça.

As primeiras pistas costumam estar nas coisas que, quando as fazes, as pessoas dizem: só tu poderias ter feito isto assim.

Essas frases, quando chegam, não são elogio.

São mapa.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep118",
        titulo: "O que fazes bem e nem sabes",
        curso: "o-oficio-de-ser",
        texto: `Há coisas que fazes bem e nem sabes.

Consegues ler uma sala em segundos. Sabes dizer a frase certa a quem está em colapso. Tens um ouvido particular para quando alguém está a mentir. Fazes perguntas que mudam conversas.

Estas coisas, tu fazes sem pensar.

Por isso não lhes chamas competências. Achas que qualquer pessoa faria igual.

Não faria.

A maioria das pessoas é genuinamente má em algumas destas coisas.

É a arte invisível da mulher comum.

E é invisível sobretudo para a própria.

Porque aprendeste, desde sempre, que coisas que fazes facilmente não são valiosas. Só teria valor aquilo que te custasse. Só mereceria reconhecimento aquilo que fosse trabalho duro.

Mas o que é teu chega-te facilmente.

É a definição de talento próprio.

Se te custa imenso, talvez seja trabalho — mas não é necessariamente o teu trabalho.

Se te sai com fluidez, talvez seja precisamente aquilo que foste trazida para fazer.

Muitas vezes, o que parece fácil demais para ter valor é exactamente onde está a pista sobre o que é realmente teu.

E passa despercebido, para ti, toda a vida.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep119",
        titulo: "A vocação que não tem carreira",
        curso: "o-oficio-de-ser",
        texto: `Há pessoas que têm uma vocação que não cabe em nenhuma carreira.

Nasceram para ouvir outras pessoas a sério. Nasceram para cuidar de seres vivos. Nasceram para reconhecer beleza em lugares onde ninguém repara. Nasceram para ter presença estabilizadora nos grupos.

E não há emprego que corresponda exactamente a estas vocações.

Chamemos-lhe vocação sem cargo.

Muitas mulheres, durante décadas, ficam frustradas por não encontrarem uma profissão que corresponda ao que são.

Procuram e não encontram.

Tentam adaptar-se a profissões existentes e fica sempre algo a faltar.

E pensam: talvez a minha vocação seja errada. Talvez o que sinto em mim não seja viável. Talvez tenha de desistir e aceitar fazer outra coisa.

Mas a vocação não falhou.

O mercado é que é pequeno.

Algumas das vocações mais importantes do mundo nunca terão nome de profissão. Nunca estarão no LinkedIn. Nunca vão aparecer nas listas de carreiras mais bem pagas.

E continuam a ser vocação.

Tu podes viver a tua vocação dentro da profissão que tiveres. Ou ao lado dela. Ou em vez dela, se as circunstâncias permitirem.

Mas não tens de a abandonar só porque não há nome formal para ela.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep120",
        titulo: "O que te sai sem esforço",
        curso: "o-oficio-de-ser",
        texto: `Há coisas que te saem sem esforço.

Não as tarefas que te custam. As que saem sem tu pensares.

A facilidade com que explicas um conceito complexo. A naturalidade com que organizas um evento. A intuição com que escolhes a roupa de uma amiga. A forma como resolves um conflito sem gritar.

O que te sai sem esforço é, muito provavelmente, precisamente o que é teu.

Chamemos-lhe natureza expressa.

A tua natureza não se adquire. Está lá. Foi-te dada.

O trabalho de uma vida é reconhecê-la.

E depois, a partir do reconhecimento, alinhar cada vez mais a tua vida com ela.

Muitas pessoas passam a vida inteira a fazer coisas que exigem esforço constante para serem feitas. E interpretam esse esforço como virtude.

Pode ser virtude. Pode também ser sinal de que estás a fazer aquilo que não é teu.

O teu ofício, quando está a acontecer, é reconhecível pela leveza. Não é necessariamente fácil. Mas é alinhado.

E alinhado é diferente de exigente.

O que é exigente pode ser teu. O que é forçado raramente é.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep121",
        titulo: "A mulher que te pedem para ser vs. a que és",
        curso: "o-oficio-de-ser",
        texto: `Há uma mulher que te pedem para seres.

É filha boa. Esposa atenta. Mãe dedicada. Profissional competente. Amiga disponível.

Tu aceitaste esta mulher quase sem pensar. Porque pareceu sempre o que fazia sentido.

E há outra mulher dentro de ti.

Que quer menos. Ou quer outras coisas. Que precisa de silêncio em vez de conversa. Que prefere solidão em vez de grupos. Que tem tendências e gostos que não batem certo com a primeira mulher.

Durante anos, esta segunda mulher foi gerida. Controlada. Oferecida apenas em pequenas doses, em momentos privados, quando ninguém te via.

A isto chamamos duas mulheres numa só.

A mulher que te pedem e a que és verdadeiramente.

Viver em dois registos é cansativo. E progressivamente insustentável.

Porque a segunda mulher não desaparece. Ela tem energia própria. E se for calada demais, começa a manifestar-se em sintomas — inquietação, tristeza, cansaço inexplicável, sonhos repetitivos.

A integração destas duas mulheres não é dramática.

É gradual.

É permitires que a segunda apareça, de cada vez, um pouco mais. Até que a primeira deixe de ser um traje e passe a ser uma versão da segunda, adaptada para certos contextos.

Uma mulher só. Com várias expressões.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
      {
        id: "nomear-ep122",
        titulo: "O ofício que só tu podes fazer",
        curso: "o-oficio-de-ser",
        texto: `Há algo que só tu podes fazer.

Não porque tenhas talento único — há muitas pessoas talentosas.

Porque o teu conjunto específico de vivências, carácter, tempo e corpo cria uma combinação que não se repete.

Tu és a única pessoa, neste momento do mundo, que viu o que viste, sentiu o que sentiste, sobreviveu ao que sobreviveste, amou quem amaste.

E do cruzamento disto tudo emerge uma possibilidade que só tu podes realizar.

Há nome: o ofício irrepetível.

Não precisa de ser grandioso. Não precisa de ser famoso.

Pode ser uma forma de estar com os outros. Uma forma de escrever uma mensagem a uma amiga. Uma forma de cuidar de uma planta. Uma forma de desenhar uma sala. Uma forma de ensinar alguém a fazer uma coisa.

Pequeno ou grande, é teu.

E se tu não o fizeres — ninguém fará igual.

Não sei se isto deve ser uma pressão ou um alívio.

Provavelmente as duas coisas.

Pressão: o que é teu não pode ser delegado.

Alívio: não tens de competir com ninguém. Ninguém está a fazer o que és para fazer.

O teu ofício de ser não vai aparecer numa lista de tarefas.

Vai emergindo, ao longo de uma vida atenta, nas coisas que fazes sem perceberes que já estás a fazer.

E um dia, pela retrospectiva, vais ver que foi isso que, afinal, estavas a fazer desde sempre.

[long pause]

Se isto te nomeou alguma coisa, subscreve para continuar a ouvir.

[pause]

Escola dos Véus. seteveus.space.`,
      },
    ],
  },
  {
    id: "curso-ouro-proprio-m1",
    titulo: "Curso Ouro Próprio — Módulo 1 (Aulas A, B, C)",
    descricao: "O Extracto como Espelho. Material de áudio para alunos — estrutura pedagógica completa.",
    scripts: [
      {
        id: "ouro-proprio-m1a",
        titulo: "M1.A — O medo de olhar",
        curso: "ouro-proprio",
        texto: `Quando foi a última vez que abriste o teu extracto bancário sem aperto no peito?

[pause]

Sem desviar o olhar. Sem fechar a app depressa.

[pause]

Quando foi a última vez que olhaste para os teus números como quem olha para a própria cara — sem medo do que ia encontrar?

[long pause]

É segunda-feira à noite. Estás no sofá.

O telefone está ali, à distância de um gesto.

Sabes que a notificação do banco chegou há três dias. Ainda não abriste.

[pause]

Não porque não tenhas tempo — tens. Não porque não saibas — sabes mais ou menos o que está lá.

Não abres porque há algo no corpo que trava.

[pause]

Uma espécie de aperto entre o estômago e o peito, como se abrir aquele ecrã fosse abrir uma porta que preferias manter fechada.

[short pause]

Então fazes outra coisa. Abres o Instagram. Respondes a uma mensagem. Verificas o email do trabalho. Tudo menos aquilo.

[pause]

E a conta continua ali, fechada, à espera. Como se os números pudessem desaparecer se não olhares para eles.

[long pause]

O que está a acontecer não é preguiça. Não é desorganização.

É protecção.

[pause]

O teu corpo aprendeu, em algum momento, que olhar para o dinheiro dói. Que os números não são neutros — são um veredicto.

[short pause]

Se o saldo está baixo, diz algo sobre ti. Se está alto, também diz — e talvez te assuste de outra forma.

[pause]

Algures, associaste dinheiro a julgamento.

E agora, cada vez que abres o extracto, não estás a ler números. Estás a ler uma sentença sobre o teu valor.

[pause]

E quem quer ler a própria sentença a segunda-feira à noite?

[long pause]

Esta semana, escolhe um momento calmo.

Abre o extracto bancário — pode ser do mês passado, não precisa ser o de hoje.

Antes de ler os números, põe a mão no peito. Respira.

[pause]

E depois lê. Devagar. Sem fazer contas de cabeça, sem planear nada, sem corrigir nada.

Apenas lê.

[pause]

E nota: o que aparece no corpo? Onde?

Não precisas de resolver nada. Só olhar.

[long pause]

O dinheiro não é o problema.

O medo de olhar é que te mantém presa.`,
      },
      {
        id: "ouro-proprio-m1b",
        titulo: "M1.B — Ler o extracto como um diário",
        curso: "ouro-proprio",
        texto: `Se alguém lesse o teu extracto bancário sem saber quem és — o que diria sobre a pessoa que fez aquelas escolhas?

[pause]

Que história contam os teus gastos sobre aquilo que realmente te importa?

[long pause]

Olha para o extracto do último mês.

Não para os totais — para as linhas. Uma a uma.

[pause]

Café no sítio do costume: um euro e vinte.

Supermercado, sexta à noite: quarenta e sete euros e oitenta e três.

Transferência para a tua mãe: cinquenta.

Uber de madrugada: doze e quarenta.

Presente para a amiga que fez anos: trinta e cinco.

Medicamento na farmácia: oito e sessenta.

[pause]

Cada linha é um dia. Cada dia é uma decisão que tomaste sem pensar.

[pause]

Ninguém olha para o extracto assim — como quem lê um diário.

Mas é exactamente isso que ele é.

[short pause]

Um registo honesto de onde pões a tua atenção, a tua energia, o teu cuidado.

E também — onde não pões.

[long pause]

Quando lês o extracto como um diário, começas a notar coisas que a calculadora não mostra.

Há meses em que gastas muito nos outros e quase nada em ti.

Há semanas em que os gastos pequenos se acumulam. Não por necessidade — por compensação.

[pause]

Aquele café depois da reunião difícil. A encomenda online às duas da manhã, quando não conseguias dormir. A comida de fora porque não tinhas energia para cozinhar.

[pause]

Não há nada de errado com nenhuma destas coisas.

Mas quando as vês juntas, começas a perceber: há um padrão.

[short pause]

E o padrão não é financeiro. É emocional.

[pause]

Gastas de uma certa forma quando estás cansada. De outra quando tens medo. De outra quando te sentes sozinha.

[long pause]

O extracto não mente.

Tu podes mentir a ti mesma — ele não.

[long pause]

Imprime ou copia o extracto do último mês. Pega numa caneta.

Ao lado de cada gasto, escreve uma única palavra: o que sentias quando fizeste aquela compra.

[pause]

Não o que estavas a fazer — o que sentias.

Cansaço. Alívio. Culpa. Prazer. Obrigação. Solidão.

[pause]

Não precisas de mudar nada.

Só de ler a história que o dinheiro conta sobre ti.

[long pause]

O teu extracto já sabe o que sentes.

A questão é se tu também sabes.`,
      },
      {
        id: "ouro-proprio-m1c",
        titulo: "M1.C — O corpo e o dinheiro",
        curso: "ouro-proprio",
        texto: `Onde é que o dinheiro vive no teu corpo?

[pause]

Se te perguntasse agora — onde sentes o dinheiro? — para onde iria a tua atenção?

Para o estômago? Para o peito? Para os ombros? Para a garganta?

[long pause]

Estás no restaurante com amigos. A conta chega.

Alguém diz: dividimos?

[pause]

E naquele segundo — antes de qualquer cálculo, antes de qualquer palavra — há uma reacção no teu corpo.

Talvez um aperto no estômago. Talvez um calor na cara. Talvez os ombros que sobem. Talvez a mandíbula que cerra.

[pause]

Dizes que sim, claro, dividimos.

Mas o corpo já disse outra coisa.

[short pause]

O corpo reagiu ao dinheiro antes de tu teres tido tempo de pensar.

[long pause]

E isto acontece mais vezes do que imaginas.

No supermercado, quando pões o artigo de volta na prateleira.

Na loja, quando viras a etiqueta ao contrário para ninguém ver o preço.

Quando recebes o salário e o alívio dura exactamente três segundos antes da lista de contas aparecer.

[long pause]

O dinheiro não é abstracto. Nunca foi.

Mesmo que a tua mente finja que é só matemática, cada decisão financeira passa pelo corpo primeiro.

[short pause]

E o corpo guarda tudo.

A vez que ouviste os teus pais a discutir por causa de dinheiro. A vez que pediste algo e te disseram que não havia. A vez que viste vergonha no rosto de alguém que amas por causa de uma conta.

[pause]

Essas memórias não ficaram na cabeça — ficaram no corpo, na forma como respiras quando o assunto aparece, no aperto que chega antes da palavra.

[long pause]

E agora, cada vez que o dinheiro aparece, a reacção chega antes do pensamento.

Antes da razão. Antes da calculadora.

Antes de ti.

[pause]

Se não reconheces essa reacção, não estás a tomar decisões financeiras.

Estás a seguir memórias antigas sem as ver.

[long pause]

Na próxima vez que pagares algo — qualquer coisa, um café, uma conta, uma compra online — para um segundo antes.

Põe uma mão na barriga.

[pause]

Onde está a tensão? Onde está o alívio? Há aperto ou há expansão?

Respira.

Fica com o que sentires sem tentar mudá-lo.

[pause]

Faz isto algumas vezes ao longo da semana. Ao fim de alguns dias, talvez comeces a reconhecer algo que sempre esteve lá — mas que nunca teve nome.

[long pause]

O teu corpo tem uma relação com o dinheiro.

E é mais antiga do que qualquer conta bancária.`,
      },
    ],
  },
  {
    id: "curso-ouro-proprio-m2",
    titulo: "Curso Ouro Próprio — Módulo 2 (Aulas A, B, C)",
    descricao: "A Herança Financeira Emocional. Material de áudio para alunos.",
    scripts: [
      {
        id: "ouro-proprio-m2a",
        titulo: "M2.A — Os scripts de infância",
        curso: "ouro-proprio",
        texto: `Qual é a primeira frase sobre dinheiro que te lembras de ouvir em casa?

[pause]

Não a mais importante — a primeira.

A que aparece quando fechas os olhos e pensas: dinheiro, na minha casa, era assim.

[long pause]

Tinhas sete, talvez oito anos.

Estavas na cozinha, ou no corredor, ou no banco de trás do carro.

E alguém disse uma frase.

[pause]

Talvez fosse a tua mãe: o dinheiro não chega para tudo.

Talvez fosse o teu pai: na minha casa ninguém passa fome.

Talvez ninguém dissesse nada — e o silêncio já era a frase.

[long pause]

Tu não estavas a prestar atenção. Estavas a brincar, ou a comer, ou a olhar pela janela.

Mas o teu corpo ouviu.

E guardou.

[pause]

Anos depois, quando o teu salário entra e tu pensas automaticamente que não vai chegar — não és tu a pensar. É aquela frase.

Quando alguém te oferece algo e tu recusas antes de considerar — não és tu a recusar. É a voz de alguém que já nem se lembra de ter falado.

[long pause]

Antes dos dez anos, absorves frases como verdades absolutas.

Não as questionas porque não tens com que comparar.

[pause]

O dinheiro é difícil.

Quem tem dinheiro é diferente de nós.

Não se fala de dinheiro.

Dinheiro não dá em árvores.

Temos que poupar para o que vem.

[pause]

Estas frases não são conselhos — são regras que o corpo decora.

[short pause]

E tu seguiste-as. Sem saber. Sem escolher.

A tua relação com dinheiro não começou quando abriste a primeira conta bancária.

Começou na cozinha da tua infância, com frases que nem te lembras de ter ouvido.

[long pause]

Pega num papel.

Escreve, sem pensar muito, as cinco primeiras frases sobre dinheiro que te vêm à cabeça quando pensas na tua infância.

[pause]

Não precisam de ser exactas — podem ser sensações traduzidas em palavras.

Depois lê-as em voz alta. Devagar.

[pause]

E pergunta: ainda acredito nisto? Ainda quero que isto me guie?

[long pause]

Metade do que acreditas sobre dinheiro não é teu.

Foi-te dado antes de saberes recusar.`,
      },
      {
        id: "ouro-proprio-m2b",
        titulo: "M2.B — O que viste vs. o que ouviste",
        curso: "ouro-proprio",
        texto: `Na tua casa, o que se dizia sobre dinheiro era igual ao que se fazia?

[pause]

Ou havia uma distância entre as palavras e os gestos — uma distância que tu sentias no corpo sem conseguir nomear?

[long pause]

A tua mãe dizia: não precisamos de coisas caras.

Mas notavas como olhava para a montra quando passavam por aquela loja.

[pause]

O teu pai dizia: o dinheiro não é importante.

Mas via-lo contar as notas na carteira antes de sair, sempre com aquele vinco entre as sobrancelhas.

[pause]

Diziam-te: não te preocupes com isso.

Mas a preocupação estava em todo o lado — na conversa que baixava de tom quando entravas na sala, no suspiro antes de abrir as cartas, na tensão à mesa quando alguém pedia mais.

[long pause]

Tu aprendeste duas coisas ao mesmo tempo: a versão oficial e a versão verdadeira.

E como ninguém te explicou a diferença, ficaste com as duas.

[pause]

Até hoje, quando alguém te diz que dinheiro não importa, algo dentro de ti reconhece a mentira.

Mas a tua boca repete a frase.

[long pause]

As crianças não aprendem o que lhes dizem. Aprendem o que vêem.

[pause]

Se o teu pai dizia que dinheiro não era problema mas vivia tenso por causa dele, tu aprendeste: o dinheiro é um problema que se esconde.

Se a tua mãe dizia que era preciso poupar mas comprava coisas às escondidas, tu aprendeste: gastar é culpa, e a culpa esconde-se.

[pause]

Estas contradições não te confundiram.

Programaram-te.

[short pause]

Deram-te duas instruções simultâneas que se anulam.

Ganha dinheiro, mas não o mostres. Poupa, mas não sejas avarenta. Quer mais, mas não sejas ambiciosa.

[pause]

E tu ficas paralisada no meio.

Não por falta de vontade.

Por excesso de instruções contraditórias.

[long pause]

Faz duas colunas num papel.

Na esquerda, escreve: o que se dizia sobre dinheiro em casa.

Na direita: o que eu via acontecer.

[pause]

Preenche as duas.

Depois olha para as diferenças.

[pause]

Não para julgar ninguém. Para perceber de onde vem a tua confusão.

Para perceber que a paralisia não é tua.

É herdada.

[long pause]

Tu não estás confusa sobre dinheiro.

Estás a seguir duas instruções que se contradizem.`,
      },
      {
        id: "ouro-proprio-m2c",
        titulo: "M2.C — Reescrever os scripts",
        curso: "ouro-proprio",
        texto: `Se pudesses escolher — agora, hoje, com tudo o que sabes — que frase sobre dinheiro gostarias de ter ouvido em criança?

[pause]

Que frase te teria dado mais espaço?

[long pause]

Se te perguntassem hoje, aos quarenta, o que aprendeste sobre dinheiro em casa — o que dirias?

Provavelmente uma lista de frases que já conheces de cor. Os ditos da tua mãe. A cara que o teu pai fazia quando o assunto aparecia. O silêncio a seguir.

[pause]

Mas essa lista não é só passado. É instrução activa.

[short pause]

Ainda hoje, quando o teu salário entra, há parte de ti que já sabe — antes de teres visto o número — que não vai chegar.

Não és tu a pensar isso. É a voz que aprendeste antes de saberes o que era aprender.

[long pause]

A herança não é só o que está no passado. É o que decide sozinho, no presente, sem te pedir autorização.

[pause]

Não podes voltar atrás e mudar o que ouviste.

Mas podes fazer uma coisa que ninguém fez por ti: escolher conscientemente o que fica e o que vai.

[long pause]

Os scripts de infância não são destino — são ponto de partida.

Alguns servem-te: talvez o cuidado, a atenção, o respeito pelo que se tem.

Outros prendem-te: o medo, a vergonha, o silêncio.

[pause]

A diferença entre repetir um padrão e escolher uma direcção está aqui: na consciência.

[short pause]

Enquanto não nomeias o que herdaste, ages no automático.

Quando nomeias, há escolha.

[pause]

Não tens de rejeitar tudo. Não tens de honrar tudo. Tens de escolher.

[long pause]

Pega nas frases que escreveste nos exercícios anteriores. Escolhe uma que já não te serve.

Essa, especificamente.

[pause]

Durante esta semana, quando reparares que ela apareceu — ao fazer um pagamento, ao olhar a conta, antes de dizeres um preço — não tentes combatê-la.

Diz-lhe, em silêncio: reconheço-te.

[pause]

E depois faz o que ias fazer de qualquer forma.

[short pause]

A frase não desaparece assim. Mas deixa de mandar sozinha.

[long pause]

A herança não se apaga.

Escolhe-se.

E escolher já é liberdade.`,
      },
    ],
  },
  {
    id: "curso-ouro-proprio-m3",
    titulo: "Curso Ouro Próprio — Módulo 3 (Aulas A, B, C)",
    descricao: "A Vergonha do Dinheiro. Material de áudio para alunos.",
    scripts: [
      {
        id: "ouro-proprio-m3a",
        titulo: "M3.A — Vergonha de não ter",
        curso: "ouro-proprio",
        texto: `Já inventaste uma desculpa para não ir a um jantar porque não querias que vissem que não podias pagar?

[pause]

Já disseste que não te apetecia quando, na verdade, não tinhas como?

[long pause]

O grupo de amigas combina um jantar num restaurante novo.

Tu vês o preço no Instagram e o estômago contrai.

[pause]

Não é fome. É vergonha.

[short pause]

Sabes que se fores, vais ter de escolher o prato mais barato e fingir que era o que querias.

Ou vais dividir a conta por igual e ficar sem dinheiro para o resto da semana.

[pause]

Então dizes: hoje não posso, tenho um compromisso.

E ficas em casa. Sozinha. Com a vergonha intacta.

[long pause]

Porque a vergonha não era do jantar.

Era de não ter.

E não ter, nesta história que carregas, significa não ser suficiente.

[long pause]

Já fizeste isto com viagens. Com presentes. Com o dentista que adias. Com o curso que querias fazer.

Cada vez que dizes não por vergonha, a vergonha cresce.

Porque a confirmaste.

[long pause]

A vergonha de não ter não é sobre dinheiro. É sobre pertença.

[pause]

Quando não tens o que os outros têm, o corpo sente que não pertences. Que és de fora. Que há um clube ao qual não tens acesso — e o bilhete de entrada é o saldo da tua conta.

[long pause]

Esta vergonha é silenciosa.

Ninguém fala dela.

Ninguém diz: tenho vergonha de ser pobre. Ninguém diz: tenho vergonha de não conseguir pagar o jantar.

Porque a própria vergonha tem vergonha de si mesma.

[pause]

E então esconde-se. Atrás de desculpas. Atrás de silêncio. Atrás de uma vida mais pequena do que precisava de ser.

[short pause]

E o mais cruel: a vergonha faz-te sentir que mereces a vida pequena.

Que é o teu lugar.

[long pause]

Da próxima vez que sentires aquele aperto — o da vergonha financeira, o que te faz inventar uma desculpa — para.

Antes de responder.

Põe os pés bem assentes no chão.

Sente o peso do teu corpo na cadeira ou no chão.

[pause]

E pergunta-te: o que é que eu diria se não tivesse vergonha?

Não precisas de dizer. Só de saber.

[short pause]

Saber a resposta verdadeira já é diferente de fugir dela.

[long pause]

A vergonha de não ter faz-te viver menos.

E viver menos nunca resolveu a falta.`,
      },
      {
        id: "ouro-proprio-m3b",
        titulo: "M3.B — Vergonha de querer mais",
        curso: "ouro-proprio",
        texto: `Já te sentiste culpada por querer ganhar mais dinheiro?

[pause]

Já pensaste: devia ser grata pelo que tenho — e usaste a gratidão como forma de calar o desejo?

[long pause]

Estás numa conversa com alguém — uma amiga, uma irmã, uma colega.

E surge o assunto.

[pause]

Ela fala dos seus planos: quer mudar de casa, quer investir, quer crescer.

E tu sentes uma coisa estranha.

[short pause]

Não é inveja — é mais subtil.

É uma voz que diz: eu também quero.

[pause]

Mas logo atrás vem outra: quem és tu para querer mais? Tens tecto. Tens comida. Há gente que não tem nada. O que é que te falta?

[pause]

E engoles o desejo.

Mudas de assunto.

Dizes: eu estou bem assim.

[short pause]

Mas não estás.

[long pause]

Há algo dentro de ti que sabe que querer mais não é ganância.

Que sabe que podes ser grata e ambiciosa ao mesmo tempo.

Mas essa voz — a que te permite querer — foi silenciada tantas vezes que já quase não a ouves.

[long pause]

Há um pacto silencioso que muitas mulheres fazem sem saber: para ser boa, tens de querer pouco.

Para ser humilde, tens de te contentar.

Para ser decente, tens de não ambicionar demais.

[pause]

Este pacto não foi escrito — foi sentido.

[short pause]

Sentiste-o quando a tua mãe se sacrificou e foi elogiada por isso.

Quando viste mulheres ambiciosas serem chamadas frias, calculistas, egoístas.

Quando aprendeste que querer para ti era tirar aos outros.

[long pause]

Mas isto é mentira.

Uma mentira cómoda para quem beneficia de mulheres que não pedem.

[short pause]

Querer mais não é ingratidão. Querer mais é ouvires-te.

[pause]

E há uma diferença enorme entre ganância e permissão.

Ganância é querer sem fim.

Permissão é dizer: eu também posso.

[long pause]

Diz, em voz alta, devagar: eu quero mais.

Só isso. Eu quero mais.

[pause]

Repara no que acontece.

Encolheste os ombros? Baixaste a voz? Olhaste à volta para ver se alguém ouviu?

[pause]

Agora diz outra vez. Mais devagar.

Sem pedir desculpa.

[short pause]

Se a vergonha vier, deixa-a estar.

Não és tu a vergonha.

És tu a dizer a verdade.

[long pause]

A vergonha de querer mais protege um mundo que nunca te protegeu a ti.`,
      },
      {
        id: "ouro-proprio-m3c",
        titulo: "M3.C — Dinheiro e dignidade",
        curso: "ouro-proprio",
        texto: `Alguma vez sentiste que o teu valor como pessoa dependia do número na tua conta?

[pause]

Que eras mais ou menos digna conforme o que tinhas — ou não tinhas?

[long pause]

Foste a uma consulta. Ou a uma loja. Ou a uma reunião.

E algo na forma como te olharam mudou quando perceberam que não tinhas tanto quanto pensavam.

[pause]

Talvez tenha sido subtil — um tom de voz, um olhar, uma pausa a mais.

Talvez tenha sido explícito.

[short pause]

Mas sentiste.

No corpo, sentiste.

[long pause]

Uma contracção. Uma vontade de te fazer mais pequena.

Ou o contrário: uma vontade de provar que és mais do que a tua carteira.

Compraste algo que não precisavas para não parecer que não podias.

Ou ficaste calada quando devias ter falado porque sentiste que não tinhas crédito — não financeiro, mas humano.

[pause]

Como se o dinheiro fosse uma língua e tu estivesses a falar com sotaque.

[long pause]

Vivemos num mundo que confunde valor económico com valor humano.

Não é suposto — mas é assim que funciona.

[pause]

E tu absorveste isso.

Não porque sejas fraca, mas porque é quase impossível não absorver.

[short pause]

Quando toda a gente à tua volta trata o dinheiro como medida de competência, de inteligência, de merecimento, o corpo aprende: quanto tenho é quanto valho.

[pause]

Mas isto é uma ilusão.

Uma ilusão poderosa, porque toda a gente acredita nela.

[long pause]

Separar o teu valor do teu saldo é um dos actos mais difíceis e mais necessários que podes fazer.

[pause]

Não porque o dinheiro não importa — importa.

Mas porque tu importas independentemente dele.

[short pause]

A tua dignidade não tem cifrão.

[long pause]

Pensa numa situação recente em que te sentiste menos digna por causa do dinheiro.

Uma consulta em que te olharam diferente. Uma loja onde escondeste a etiqueta. Uma reunião em que te fizeste mais pequena.

[pause]

Escreve essa situação em duas colunas.

Na esquerda, o que aconteceu objectivamente. A conversa, o olhar, o gesto.

Na direita, o que tu sentiste sobre o teu valor.

[short pause]

Olha para as duas colunas.

[pause]

A esquerda é o que a outra pessoa fez.

A direita é o que tu fizeste com isso.

[short pause]

As duas coisas são diferentes.

E a direita — essa — é tua. É o espaço onde há, ainda que pequeno, escolha.

[long pause]

O teu valor não é um número.

Nunca foi.`,
      },
    ],
  },
  {
    id: "curso-ouro-proprio-m4",
    titulo: "Curso Ouro Próprio — Módulo 4 (Aulas A, B, C)",
    descricao: "Cobrar, Receber, Merecer. Material de áudio para alunos.",
    scripts: [
      {
        id: "ouro-proprio-m4a",
        titulo: "M4.A — O desconto automático",
        curso: "ouro-proprio",
        texto: `Quando foi a última vez que deste desconto no teu trabalho antes de alguém pedir?

[pause]

Quando foi a última vez que baixaste o preço — não porque era justo, mas porque sentiste que não podias pedir o valor inteiro?

[long pause]

Alguém te pede um orçamento. Pelo teu trabalho, pela tua consultoria, pelo teu tempo, pelo produto que fizeste.

Tu sabes quanto vale.

[pause]

Fizeste as contas. É um número justo.

[short pause]

Mas na hora de escrever o valor, a mão treme.

Não literalmente — mas algo dentro de ti hesita.

[pause]

E antes de enviar, tiras um bocado.

Só um pouco.

[short pause]

Para não assustar. Para não parecer demais. Para não ouvir não.

[long pause]

O desconto já estava dado antes de a outra pessoa abrir a boca.

Ninguém regateou. Ninguém pressionou.

Foste tu.

[pause]

Tu e a voz que diz: se pedir o valor inteiro, vão achar que não valho tanto. Ou pior: vão perceber que não valho tanto.

[pause]

Então baixas.

E cada vez que baixas, o corpo aprende que é assim que se faz.

Que o teu preço real é demasiado.

[short pause]

Que precisas de ser mais barata para ser escolhida.

[long pause]

O desconto automático não é generosidade.

É medo disfarçado.

[pause]

Medo de rejeição, medo de confronto, medo de ocupar espaço com o teu valor.

E muitas vezes vem de um lugar antigo: a ideia de que pedir o que mereces é arrogância.

Que cobrar bem é ganância.

Que ser acessível é o mesmo que ser barata.

[short pause]

Mas não é.

Acessibilidade é uma escolha consciente.

Desconto automático é uma reacção ao medo.

[pause]

E há uma diferença enorme entre as duas coisas.

[short pause]

Uma vem da generosidade. A outra vem da falta de permissão.

[long pause]

Quando baixas o preço por medo, não estás a ser generosa.

Estás a dizer ao mundo e a ti mesma que o teu valor é negociável.

[pause]

E o mundo aceita.

O mundo aceita sempre o desconto que ofereces.

[long pause]

Na próxima vez que tiveres de dizer um preço — qualquer preço, mesmo que não seja profissional — nota o momento exacto em que a vontade de baixar aparece.

Não baixas. Não sobes.

Apenas nota.

[pause]

Sente onde isso vive: no peito? Na garganta? Nas mãos?

Depois, diz o número.

O número que realmente querias dizer.

[short pause]

E vê o que acontece. Não no outro — em ti.

[long pause]

O desconto que ninguém te pediu é a medida exacta do quanto ainda não te permites valer.`,
      },
      {
        id: "ouro-proprio-m4b",
        titulo: "M4.B — A ligação cobrar-merecer",
        curso: "ouro-proprio",
        texto: `Já reparaste que cobrar e merecer, para ti, são a mesma coisa?

[pause]

Que quando sentes que não mereces, não consegues cobrar — e quando não cobras, confirmas que não mereces?

[long pause]

Fizeste um trabalho excelente.

Sabes que ficou bom.

O cliente também sabe — agradeceu, elogiou, disse que superaste as expectativas.

[pause]

Chega o momento de cobrar.

E algo emperra.

[short pause]

Não é o valor — o valor está definido.

É o acto de dizer: paga-me.

[pause]

Há uma resistência quase física.

Como se cobrar fosse rude.

Como se pedir o que é teu fosse pedir demais.

[long pause]

Então esperas. Mandas a factura com um pedido de desculpa embutido: quando puderes. Sem pressa. À tua conveniência.

[pause]

Usas palavras suaves para suavizar o facto de que estás a pedir dinheiro pelo teu trabalho.

E se a pessoa demora a pagar, não cobras de novo. Esperas.

[short pause]

Porque cobrar uma vez já custou.

Cobrar duas seria demais.

[long pause]

Cobrar não é um acto financeiro. É um acto de identidade.

[pause]

Quando não cobras o que vale, não é porque não saibas o valor.

É porque não sentes que tens direito a ele.

[short pause]

Há uma parte de ti que ainda acredita que receber é um privilégio, não um direito.

Que o dinheiro é algo que se ganha por mérito excepcional, não pelo simples facto de teres dado algo de valor.

[long pause]

Esta crença cria um ciclo: não cobras porque não sentes que mereces. Não recebes porque não cobras. E como não recebes, confirmas a crença: vês, não era para mim.

[pause]

Mas a crença veio primeiro.

O resultado é só a prova que ela inventou.

[long pause]

Pensa no último trabalho que fizeste e que sentiste dificuldade em cobrar.

Escreve: este trabalho vale X porque...

[pause]

Preenche com razões concretas. Tempo, competência, resultado, dedicação.

Lê a lista. Lê-a como se fosse de outra pessoa.

[short pause]

Estarias confortável a pagar este valor a outra pessoa?

Se sim — o problema não é o valor.

É a permissão.

[long pause]

Cobrar o que vale não é pedir demais.

É tratar-te como tratas os outros.`,
      },
      {
        id: "ouro-proprio-m4c",
        titulo: "M4.C — Receber sem devolver imediatamente",
        curso: "ouro-proprio",
        texto: `Quando alguém te dá algo — um presente, um elogio, uma ajuda — qual é o teu primeiro impulso?

[pause]

Receber?

Ou devolver imediatamente para não ficar a dever?

[long pause]

Uma amiga paga-te o almoço.

Tu dizes: não, deixa, eu pago o meu.

Ela insiste. Tu aceitas, mas já estás a calcular quando vais poder retribuir.

[pause]

Na semana seguinte pagas o café, o almoço e o estacionamento — para ficar quite.

[short pause]

Alguém te oferece um presente caro.

Agradeces, mas o pensamento imediato é: tenho de lhe dar algo à altura. Não depois — agora.

[pause]

O teu chefe dá-te um bónus.

Em vez de sentires: mereço isto, sentes: agora vou ter de trabalhar o dobro para justificar.

[long pause]

Nunca estás só a receber.

Estás sempre a compensar.

[pause]

Cada coisa que te dão abre uma conta no teu corpo — e o teu corpo não descansa até a fechar.

[short pause]

Como se receber criasse uma dívida.

Como se aceitar fosse perigoso.

[long pause]

A dificuldade de receber não é educação — é protecção.

[pause]

Algures aprendeste que receber te coloca em posição de vulnerabilidade.

Que quem dá tem poder. Que ficar a dever é ficar em perigo.

[short pause]

Talvez na tua família receber vinha com condições.

Talvez a generosidade era uma moeda de troca.

Talvez alguém te deu algo e depois usou isso contra ti.

[pause]

E ficou gravado: receber não é seguro.

[long pause]

E agora, cada vez que algo bom chega, a tua primeira reacção não é prazer — é calcular o custo.

[pause]

Isto estende-se ao dinheiro de forma directa: se não consegues receber um presente sem angústia, como vais receber um aumento? Uma proposta melhor? Uma oportunidade que não pediste?

[short pause]

Receber é uma capacidade.

E pode estar atrofiada.

[long pause]

Esta semana, quando alguém te der algo — um elogio, um café, uma ajuda — experimenta só dizer: obrigada.

Sem adicionar nada. Sem oferecer nada de volta. Sem justificar.

Só obrigada.

[pause]

Sente o desconforto. Fica com ele. Não o resolvas.

[short pause]

Deixa o corpo aprender que receber não é dívida.

[long pause]

Receber não é ficar a dever.

É deixar entrar o que já era teu.`,
      },
    ],
  },
  {
    id: "curso-ouro-proprio-m5",
    titulo: "Curso Ouro Próprio — Módulo 5 (Aulas A, B, C)",
    descricao: "Gastar em Ti. Material de áudio para alunos.",
    scripts: [
      {
        id: "ouro-proprio-m5a",
        titulo: "M5.A — A hierarquia dos gastos",
        curso: "ouro-proprio",
        texto: `Se olhares para os teus gastos do último mês, onde é que tu apareces?

[pause]

No topo da lista — ou no fim, depois de todos os outros?

[long pause]

Compras roupa nova para os filhos sem pensar.

Pagas a mensalidade do ginásio do teu parceiro.

Ofereces presentes generosos.

Contribuis para jantares.

[pause]

Mas quando é para ti — aquele livro, aquele creme, aquele curso, aquela consulta — hesitas.

Não porque não tenhas dinheiro.

Mas porque há sempre algo mais urgente, mais importante, mais justificável.

[long pause]

O teu nome está no fundo da lista.

Depois da renda. Depois das contas. Depois da escola das crianças. Depois do carro. Depois dos imprevistos.

Depois de tudo.

[pause]

Se sobrar — e quase nunca sobra — talvez.

[short pause]

Não é que te esqueças de ti.

É que te habituaste a vir depois.

[pause]

E a vir depois tornou-se tão natural que já nem notas. Já nem sentes que falta alguma coisa.

Até que um dia o corpo reclama.

[short pause]

Cansaço que não passa. Irritação sem causa. Uma tristeza mansa que não sabes de onde vem.

[long pause]

A hierarquia dos teus gastos é um mapa da tua importância própria.

Não é o que dizes sobre ti mesma — é o que fazes.

[pause]

E o que fazes, repetidamente, é colocar-te em último lugar.

[short pause]

Isto não é generosidade — é um padrão.

Um padrão que te foi ensinado, não escolhido.

[pause]

Muitas mulheres aprendem desde cedo que cuidar de si é egoísmo.

Que gastar em si é frivolidade.

Que o bom é dar.

[short pause]

E então dão. Até não terem mais nada para dar.

E quando chegam a esse ponto — vazias, cansadas, ressentidas — sentem culpa por estarem cansadas.

Porque até o cansaço lhes parece egoísmo.

[long pause]

A hierarquia dos gastos não é só financeira.

É um retrato da permissão que te dás para existir.

[long pause]

Esta semana, escolhe uma conta em que normalmente vens depois de todos os outros.

Medicamento que adias. Consulta que nunca marcas. Algo teu que fica sempre por fazer.

[pause]

E trata disso primeiro — antes de pagares qualquer outra coisa do mês.

Não um extra. Não um luxo.

Uma coisa que já era tua de direito.

[short pause]

Paga-te antes de pagares a toda a gente.

Nota o que isso faz ao corpo.

[long pause]

O lugar onde te pões na lista dos teus gastos é o lugar onde te pões na tua própria vida.`,
      },
      {
        id: "ouro-proprio-m5b",
        titulo: "M5.B — Culpa e prazer",
        curso: "ouro-proprio",
        texto: `Quando gastas dinheiro em algo que te dá prazer — prazer real, sem função prática — quanto tempo demora até a culpa aparecer?

[pause]

Segundos? Minutos?

Ou chega antes, e impede-te de comprar?

[long pause]

Compraste aquele vestido. Ou aqueles sapatos. Ou aquela viagem.

Algo que não era necessário.

Algo que era bonito, que te fez sentir bem, que era só para ti.

[pause]

E sentiste prazer. Por um momento.

Depois veio a culpa.

[short pause]

Podia ter guardado este dinheiro.

Não precisava mesmo disto.

Há coisas mais importantes.

[long pause]

A culpa não veio de fora — ninguém te criticou.

Veio de dentro.

[pause]

De um lugar automático que diz: prazer é desperdício. Gastar em ti é frivolidade. Merecimento tem de ser ganho, não comprado.

[long pause]

E então fizeste uma de duas coisas: ou devolveste o que compraste, ou ficaste com ele mas sem conseguir aproveitar.

Porque a culpa sentou-se ao lado do prazer e não saiu mais.

[long pause]

A culpa que sentes quando gastas em prazer não é sobre o dinheiro.

É sobre a permissão.

[pause]

Algures aprendeste que o prazer tem de ser justificado.

Que gastar em ti só é aceitável se for útil — um curso, uma ferramenta, algo que te torne mais produtiva.

[short pause]

Prazer puro, sem função, sem justificação, sem retorno — esse é perigoso.

[long pause]

E este é o padrão mais silencioso: não é que não tenhas dinheiro para prazer.

É que não te permites ter prazer com o dinheiro.

[pause]

A culpa é a guarda que fica à porta.

Cada vez que tentas entrar, ela pede-te a justificação.

E se não tens uma boa o suficiente, não entras.

[short pause]

O resultado é uma vida funcional. Eficiente. Útil.

E seca.

[pause]

Uma vida onde tudo serve para alguma coisa menos para ti.

[long pause]

Compra algo esta semana que seja só bonito.

Que não sirva para nada.

Que não tenhas de justificar a ninguém — nem a ti.

[pause]

Pode ser pequeno. Uma flor. Uma vela. Um chocolate bom.

Quando a culpa vier — e vai vir — não a combatas.

[short pause]

Diz-lhe: eu sei que estás aí. Mas hoje fico com isto.

E depois fica com o que compraste. Sem devolver. Sem compensar.

[long pause]

A culpa não te protege de nada.

Só te tira o gosto do que já pagaste.`,
      },
      {
        id: "ouro-proprio-m5c",
        titulo: "M5.C — O investimento em ti como acto político",
        curso: "ouro-proprio",
        texto: `E se gastar dinheiro em ti não fosse egoísmo — mas a decisão mais quieta e mais importante que podes tomar por ti mesma?

[long pause]

Durante décadas, as mulheres à tua volta foram treinadas a gastar em tudo menos em si mesmas.

Nos filhos. Nos maridos. Nas casas. Nos pais que envelheciam.

[pause]

A tua avó talvez nunca tenha tido uma conta bancária só dela.

A tua mãe talvez tenha tido uma mas nunca gastasse sem pedir licença — a ninguém em particular, e a toda a gente ao mesmo tempo.

[short pause]

Tu herdaste esse treino.

[pause]

A hesitação antes de comprar um curso. O adiamento daquela consulta. O "ainda não é a altura" que já dura oito anos.

[short pause]

Isto não é coincidência individual.

É história.

[long pause]

Quando uma mulher gasta dinheiro em si — não o mínimo, o necessário — alguma coisa se desloca.

Não é espectacular. É quieta.

[pause]

Os limites ficam mais claros. As relações reajustam. O tempo, que parecia todo dos outros, começa a ter pedaços dela.

[short pause]

Isto parece pessoal, mas não é só pessoal.

[long pause]

Durante gerações, o dinheiro das mulheres serviu os projectos de outros.

Quando decides que o teu serve o teu, estás a interromper um padrão mais antigo do que tu.

[pause]

E os padrões antigos defendem-se.

[short pause]

Por isso vem a culpa.

Por isso vem a sensação de que é demais, é excesso, é egoísmo.

[pause]

Esse ruído não é fraqueza tua.

É o som de um sistema a tentar continuar.

[long pause]

Investir em ti não é apenas cuidar de ti.

É recusar uma herança.

[pause]

E essa recusa, repetida ao longo do tempo, é o que muda tanto a tua vida como a das que vêm depois.

[long pause]

Identifica uma coisa em que tens adiado investir em ti.

Aquela. A mais óbvia. A que já hesitas em dizer em voz alta.

[pause]

Agora define uma data — não "quando sobrar", não "quando acalmar". Uma data. Escreve no calendário.

Na mesma semana, conta a alguém — uma pessoa só, não é um anúncio — que vais fazer isto neste dia.

[short pause]

Não precisas de justificação.

Deixa a data no calendário trabalhar por ti.

[long pause]

Quando investes em ti, não estás a gastar.

Estás a decidir que existes.`,
      },
    ],
  },
  {
    id: "curso-ouro-proprio-m6",
    titulo: "Curso Ouro Próprio — Módulo 6 (Aulas A, B, C)",
    descricao: "Dinheiro e Relações. Material de áudio para alunos.",
    scripts: [
      {
        id: "ouro-proprio-m6a",
        titulo: "M6.A — Quem paga, manda?",
        curso: "ouro-proprio",
        texto: `Na tua relação, quem paga mais tem mais poder?

[pause]

Quem ganha mais decide mais?

Há uma conta invisível a correr entre vocês — e quem está a ganhar?

[long pause]

Ele paga o jantar. Ela escolhe o restaurante — mas dentro do orçamento dele.

Ele paga a renda. Ela sente que não pode reclamar do apartamento porque não contribui com a mesma parte.

Ela quer comprar algo. Ele não diz que não — mas ergue a sobrancelha.

E ela guarda o cartão.

[long pause]

Ninguém gritou. Ninguém proibiu. Ninguém disse: tu não decides.

Mas há algo que registou tudo.

[pause]

Há uma assimetria que não está nos números — está nos gestos.

Na pausa antes de comprar. No olhar antes de pedir. Na justificação antes de gastar.

[long pause]

Se ganhas menos, sentes que tens menos voz.

Se não ganhas nada, sentes que não tens direito a voz nenhuma.

[pause]

Não porque te digam isso — mas porque o dinheiro fala uma língua que o corpo entende sem tradução.

[long pause]

Nas relações, o dinheiro nunca é só dinheiro.

É poder. É segurança. É controlo. É liberdade.

[pause]

Quem paga mais sente, mesmo sem querer, que decide mais.

Quem recebe mais sente, mesmo sem razão, que deve mais.

[short pause]

E cria-se uma dinâmica invisível: um que pode e outro que pede. Um que dá e outro que agradece. Um que decide e outro que se adapta.

[long pause]

Isto não é necessariamente intencional.

Muitas vezes, quem paga mais nem sabe que está a exercer poder.

E quem recebe mais nem sabe que está a ceder espaço.

[pause]

Mas tu sentes.

Sentes cada vez que encolhes a tua vontade porque o dinheiro não é teu.

E cada vez que engoles uma opinião porque não pagas a tua parte.

[long pause]

Pensa na tua relação actual — ou na última.

Quem paga mais? Quem decide mais?

Há uma correlação?

[pause]

Escreve dois momentos em que sentiste que o dinheiro influenciou quem tinha voz.

Não para acusar ninguém — para ver a dinâmica com clareza.

[short pause]

Porque só o que se vê se pode mudar.

[long pause]

O dinheiro numa relação nunca é só dinheiro.

É a linguagem silenciosa do poder.`,
      },
      {
        id: "ouro-proprio-m6b",
        titulo: "M6.B — Dependência financeira e medo",
        curso: "ouro-proprio",
        texto: `Se a tua relação acabasse amanhã, conseguirias pagar as tuas contas?

[pause]

Se a resposta te assusta — de onde vem o medo?

Do dinheiro ou da solidão?

[long pause]

Há mulheres que ficam em relações não por amor — mas por matemática.

[pause]

O apartamento está no nome dele. A poupança é partilhada mas só um tem acesso. Se sair, vai para onde? Com que dinheiro?

[short pause]

A conversa com as amigas é sobre sentimentos.

Mas à noite, sozinha, a conta que se faz é financeira.

[pause]

Quanto custa a minha liberdade?

[long pause]

Às vezes a resposta é: mais do que tenho.

Então fica. Não porque queira — mas porque não pode.

[pause]

E cada dia que fica por não poder, perde um bocado de si mesma.

Aos poucos. Como um gotejamento.

[long pause]

A dependência financeira não prende o corpo — prende a vontade.

[pause]

Não precisas de estar trancada para não sair. Basta não ter para onde ir.

[short pause]

Esta é a prisão mais invisível: não tem grades.

[pause]

Tem contas. Tem rendas. Tem a vergonha de voltar para casa dos pais.

[long pause]

Quando todo o teu mundo material depende de outra pessoa, sair não é uma mudança — é um colapso.

[pause]

E muitas mulheres ficam exactamente aqui: com o suficiente para não sair, mas nunca com o suficiente para se sentir livres.

[long pause]

Faz uma conta simples, sozinha, em silêncio.

Quanto precisas por mês para viver — só tu?

Renda, comida, transporte, o básico.

[pause]

Agora olha para o que ganhas — ou para o que ganharias se voltasses a ganhar.

[short pause]

Não é para tomar decisões agora.

É para veres o número com clareza.

[pause]

Porque o medo odeia números concretos.

O medo alimenta-se de vago, de talvez, de não sei.

[short pause]

Quando sabes o número exacto, o medo perde metade da força.

[long pause]

A liberdade não é um sentimento.

É um número que precisas de conhecer.`,
      },
      {
        id: "ouro-proprio-m6c",
        titulo: "M6.C — A conversa sobre dinheiro que evitas",
        curso: "ouro-proprio",
        texto: `Há uma conversa sobre dinheiro que precisas de ter com alguém que amas.

[pause]

Sabes qual é.

Há quanto tempo a adias?

[long pause]

Pode ser com o teu parceiro: precisamos de falar sobre como dividimos as coisas.

Pode ser com a tua mãe: não posso continuar a pagar isto sozinha.

Pode ser com uma amiga: não tenho condições de ir a esse sítio.

Pode ser contigo mesma: preciso de ganhar mais.

[long pause]

Sabes a conversa.

Já a ensaiaste na cabeça dezenas de vezes.

[pause]

No chuveiro. No carro. À noite, antes de dormir.

Tens as palavras. Tens os argumentos.

[short pause]

Mas nunca é o momento certo.

Nunca está tudo calmo o suficiente.

Nunca tens a certeza de que não vai correr mal.

[pause]

E então adias. Mais um dia. Mais uma semana.

[long pause]

E a conversa que não tens torna-se um peso que carregas sozinha.

Porque o problema não é só o dinheiro — é o silêncio que o dinheiro cria quando ninguém fala dele.

[long pause]

A maioria das conversas sobre dinheiro que evitas não são sobre dinheiro.

São sobre medo.

[pause]

Medo de conflito: e se a outra pessoa se zangar?

Medo de vulnerabilidade: e se percebem que não tenho tanto quanto pensam?

Medo de rejeição: e se me acham mesquinha por levantar o assunto?

[long pause]

O dinheiro é o último tabu.

[pause]

Podes falar de sexo, de morte, de saúde mental.

Mas dinheiro?

[short pause]

A conversa sobre dinheiro obriga-te a ser honesta sobre o que tens, o que não tens, o que precisas e o que sentes.

[pause]

E essa honestidade, para muita gente, é mais assustadora do que qualquer outro tema.

[long pause]

Mas o custo de não falar é sempre maior do que o custo de falar.

[pause]

O silêncio não protege — acumula.

Até ao dia em que rebenta.

[long pause]

Escreve a conversa que precisas de ter. Toda.

Num papel, como se estivesses a falar com a pessoa.

[pause]

Não para enviar — para ouvir-te.

Depois lê em voz alta.

[short pause]

E repara: o que é que custa mais — as palavras ou o silêncio?

[pause]

Não tens de ter a conversa esta semana.

Mas tens de a tirar de dentro de ti e pô-la num sítio onde a possas ver.

[long pause]

O silêncio sobre dinheiro não é elegância.

É peso.

E podes pousá-lo.`,
      },
    ],
  },
  {
    id: "curso-ouro-proprio-m7",
    titulo: "Curso Ouro Próprio — Módulo 7 (Aulas A, B, C)",
    descricao: "Ganhar Mais Não Resolve. Material de áudio para alunos.",
    scripts: [
      {
        id: "ouro-proprio-m7a",
        titulo: "M7.A — O buraco que o dinheiro não enche",
        curso: "ouro-proprio",
        texto: `Já tiveste mais dinheiro do que o costume — e mesmo assim a inquietação não passou?

[pause]

Já recebeste aquilo que querias e, em vez de alívio, sentiste: e agora?

[long pause]

Recebes o aumento. Ou o bónus. Ou o pagamento daquele projecto grande.

O dinheiro entra na conta e, por um instante, respiras.

Finalmente.

[pause]

Mas o instante dura pouco. Horas, talvez. Um dia.

Depois o corpo volta ao mesmo sítio.

[short pause]

A mesma ansiedade. A mesma sensação de que não chega. A mesma conta mental que nunca fecha.

[long pause]

Pensavas que quando chegasses aqui — a este valor, a este salário, a esta estabilidade — a paz viria.

Mas não veio.

Veio outra lista. Veio outro objectivo. Veio a mesma inquietação com um número diferente.

[pause]

E começas a desconfiar: se isto não resolveu, o que resolve?

Porque a promessa era essa: ganha mais e vais estar bem.

E ganhaste mais.

[short pause]

E não estás bem.

[long pause]

Há um buraco que o dinheiro não enche.

Não porque o dinheiro seja insuficiente — mas porque o buraco não é financeiro.

É emocional.

[long pause]

Muitas pessoas usam o dinheiro como substituto: de segurança, de valor próprio, de controlo, de amor.

[pause]

Se não me sinto segura, preciso de mais dinheiro.

Se não me sinto valorizada, preciso de ganhar mais.

Se não tenho controlo sobre a minha vida, preciso de ter controlo sobre a minha conta.

[short pause]

O dinheiro torna-se a resposta para perguntas que não são financeiras.

[pause]

E como a resposta nunca encaixa na pergunta, a insatisfação permanece.

[long pause]

Mais dinheiro tapa o sintoma — mas não toca na causa.

E a causa, quase sempre, é outra fome.

[pause]

Uma fome de algo que o dinheiro não compra: presença, pertença, permissão de ser quem és.

[long pause]

Escreve no topo de uma folha este número: o dobro do teu rendimento mensal actual.

[pause]

Agora, por baixo, responde em três linhas: o que eu faria com esse dobro que não posso fazer agora?

Não escrevas o que comprarias. Escreve o que te permitirias: sentir, ser, fazer.

[short pause]

Olha para as três linhas.

[pause]

O que aparece ali não são coisas que o dinheiro vai trazer.

São permissões que o dinheiro, na tua cabeça, está a substituir.

[pause]

Permissão para descansar. Permissão para escolher. Permissão para parar.

[short pause]

Estas permissões, a maioria delas, não têm preço.

E muitas delas são-te acessíveis agora — sem o dobro do rendimento.

[long pause]

Há fomes que o dinheiro não mata.

Reconhecê-las é o primeiro passo para parar de comer a coisa errada.`,
      },
      {
        id: "ouro-proprio-m7b",
        titulo: "M7.B — Sabotagem financeira",
        curso: "ouro-proprio",
        texto: `Já conseguiste juntar dinheiro e depois gastaste tudo de uma vez — quase sem perceber como?

[pause]

Já estiveste perto de uma estabilidade financeira e algo aconteceu que te levou de volta ao zero?

[long pause]

Estiveste meses a poupar. A conta crescia.

E começaste a sentir-te estranha.

[pause]

Não confortável — estranha.

Como se aquele dinheiro não fosse teu. Como se houvesse uma data de validade invisível.

[short pause]

Depois, sem razão clara, gastaste.

[pause]

Uma compra grande. Pequenas fugas de madrugada. Coisas que já nem te lembras.

[short pause]

Quando viste a conta de novo, estava quase onde começou.

[pause]

E sentiste duas coisas ao mesmo tempo: frustração e alívio.

[short pause]

Frustração porque perdeste o que juntaste.

Alívio porque estar sem dinheiro é mais familiar do que ter.

[long pause]

A sabotagem financeira não é falta de disciplina.

É um regresso ao que conheces.

[pause]

Se cresceste com pouco, ter pode ser desconfortável.

Se associas dinheiro a conflito, ter pode sentir-se como estar em perigo.

[short pause]

Se acreditas, lá no fundo, que não mereces — encontras formas de garantir que não tens.

[long pause]

Decisões que parecem razoáveis no momento mas que, vistas de longe, formam um padrão claro.

[pause]

Ganhas e perdes. Constróis e destróis.

A sabotagem não é o problema.

É o sintoma.

[short pause]

O que está por baixo é uma crença sobre o teu lugar no mundo.

[long pause]

Pensa no último momento em que gastaste dinheiro que tinhas poupado — sem planear, sem precisar.

Não no que compraste.

No que sentias antes.

[pause]

Escreve num papel, em três linhas: que dia da semana era, que conversa tinha acontecido antes, e que sensação no corpo estava já a crescer dentro de ti antes de abrires a carteira.

[short pause]

Olha para o que escreveste.

[pause]

A compra não começou na loja.

Começou horas ou dias antes, numa sensação que tu não quiseste ficar a sentir.

[long pause]

A sabotagem financeira não é falta de disciplina.

É a estratégia mais rápida que o corpo encontrou para não habitar uma sensação difícil.

[pause]

Quando não sabes o que precedeu, a compra parece aleatória.

Quando sabes o que precedeu, a compra tem nome.

[short pause]

Não precisas de te impedir.

Precisas de voltar a reconhecer o ponto em que a sensação começou.

[long pause]

Não estás a falhar com o dinheiro.

Estás a regressar ao único lugar que o teu corpo conhece como casa.`,
      },
      {
        id: "ouro-proprio-m7c",
        titulo: "M7.C — Suficiente: quando é suficiente?",
        curso: "ouro-proprio",
        texto: `Tens um número na cabeça — um valor a partir do qual tudo ficaria bem?

[pause]

E se atingisses esse número, acreditas mesmo que pararias?

Ou o número subiria?

[long pause]

Quando ganhavas mil, pensavas: se ganhasse dois mil.

Quando ganhaste dois mil, pensaste: se ganhasse três mil.

[pause]

O número muda.

A sensação não.

[long pause]

Há sempre um próximo patamar, uma próxima meta, uma próxima prova de que ainda não chega.

Não é ambição — ambição tem direcção.

Isto é outra coisa.

[pause]

É uma incapacidade de dizer: chega. É suficiente. Estou bem.

[short pause]

Porque no momento em que paras, aparece o medo.

[pause]

Se paro de querer mais, o que acontece?

Se me contento, não estou a desistir?

Se não corro, não fico para trás?

[short pause]

E então continuas.

Não porque queiras mais — mas porque tens medo de parar.

[long pause]

A corrida financeira não é sobre dinheiro.

É sobre o silêncio que ficaria se parasses.

[long pause]

Se nunca é suficiente, o problema não está no quanto.

Está no que o dinheiro está a substituir.

[pause]

Para algumas pessoas, acumular é segurança contra o caos.

Para outras, é prova de valor.

Para outras ainda, é a única linguagem de sucesso que aprenderam.

[short pause]

Quando o suficiente não existe, estás a pedir ao dinheiro que te dê algo que ele não pode dar: paz.

[long pause]

Porque a paz não vem de um número — vem de uma decisão.

[pause]

A decisão de dizer: o que tenho, neste momento, permite-me viver com dignidade.

E o que me falta não é mais dinheiro — é mais presença no que já tenho.

[short pause]

Isto não é conformismo.

É lucidez.

[pause]

E há uma diferença enorme entre estar conforme e estar presente.

[long pause]

Escreve o teu número.

Aquele valor mensal a partir do qual acreditas que ficarias bem.

[pause]

Agora olha para ele. E pergunta: o que é que esse número me daria que eu não tenho agora?

Segurança? Liberdade? Reconhecimento? Paz?

[short pause]

Depois pergunta: há alguma parte disso que já posso ter — sem esperar pelo número?

[pause]

Não para desistires do número.

Mas para não adiares a vida até lá chegares.

[long pause]

Suficiente não é um número.

É uma decisão de estar presente no que já existe.`,
      },
    ],
  },
  {
    id: "curso-ouro-proprio-m8",
    titulo: "Curso Ouro Próprio — Módulo 8 (Aulas A, B, C)",
    descricao: "Dinheiro como Liberdade. Fecho do curso. Material de áudio para alunos.",
    scripts: [
      {
        id: "ouro-proprio-m8a",
        titulo: "M8.A — De sobrevivência a direcção",
        curso: "ouro-proprio",
        texto: `O teu dinheiro serve para sobreviver ou para viver?

[pause]

Há quanto tempo estás no modo de sobrevivência — a pagar contas, a cobrir buracos, a reagir ao que aparece — sem nunca te perguntares: para onde quero ir?

[long pause]

O mês começa e tu já sabes como vai ser.

Entra o salário. Sai a renda. Sai a água, a luz, a internet. Sai o supermercado. Sai o transporte. Sai a escola. Sai o imprevisto que aparece sempre.

[pause]

E quando tudo sai, o que resta não é teu — é do próximo imprevisto.

Não há sobra. Não há folga. Não há direcção.

[short pause]

Há sobrevivência.

[long pause]

E a sobrevivência financeira é eficiente: mantém-te à tona.

Mas não te leva a lado nenhum.

[pause]

Estás no mesmo sítio há meses, talvez anos.

Não porque sejas incapaz, mas porque toda a tua energia vai para a reacção.

[short pause]

Pagar o que aparece. Resolver o que surge. Apagar o fogo.

[pause]

Nunca sobra atenção para pensar: se o dinheiro não fosse só para sobreviver — para que o queria?

[long pause]

A sobrevivência financeira é um modo.

Não é um destino.

[pause]

Mas quando ficas nele tempo demais, parece ser tudo o que existe.

Parece que o dinheiro só serve para isso: cobrir custos.

[short pause]

E perdes de vista a outra função do dinheiro: a de construir.

[long pause]

Construir não significa ser rica.

Significa ter direcção.

[pause]

Saber para onde vai o próximo euro que sobrar — não por obrigação, mas por escolha.

[short pause]

A diferença entre sobrevivência e direcção não é o quanto ganhas.

É a pergunta que fazes.

[pause]

Na sobrevivência, a pergunta é: como vou pagar?

Na direcção, a pergunta é: para onde quero ir?

[long pause]

E esta segunda pergunta — a da direcção — assusta mais.

Porque obriga-te a querer. A imaginar. A permitir-te um futuro.

[pause]

E muitas mulheres pararam de se permitir futuro há tanto tempo que já nem sabem o que querem.

[long pause]

Esta semana, no momento exacto em que normalmente abres a app do banco — e sentes o aperto — não abras.

Antes de abrir, escreve numa frase só: o que quero ver aqui daqui a um ano?

[pause]

Não "o que tenho medo de ver". O que quero ver.

Depois abre.

[short pause]

Nem precisas de resposta final.

A pergunta, feita uma vez, começa a mudar a direcção do olhar.

[pause]

Porque até agora, cada vez que abrias a app, vinhas com a pergunta errada.

A pergunta do medo é sempre a mesma: quanto sobra?

A pergunta da direcção é outra: para onde isto vai?

[long pause]

Sobreviver é reagir.

Viver é escolher para onde vai o próximo passo.`,
      },
      {
        id: "ouro-proprio-m8b",
        titulo: "M8.B — O mapa do futuro que queres financiar",
        curso: "ouro-proprio",
        texto: `Se o dinheiro fosse um veículo — não um problema, não um peso, não uma fonte de ansiedade, mas um veículo — para onde o conduzirias?

[pause]

Que vida construirias se pudesses usar o dinheiro com intenção em vez de desespero?

[long pause]

Pega num papel em branco e senta-te onde ninguém te interrompe.

Não à mesa da cozinha cheia de contas — noutra mesa.

[pause]

Escreve, sem pensar muito: um dia normal na vida que quero ter daqui a três anos.

Não a vida perfeita. A tua.

[short pause]

Onde vives? Com quem? Como passas as manhãs? O que fazes com o teu tempo?

Que tipo de cansaço sentes — o bom ou o que te desgasta?

Quanto precisas por mês para isso?

[long pause]

A maioria das pessoas nunca fez este exercício.

Não porque não queiram — porque nunca se permitiram.

[pause]

Porque quando vives em modo sobrevivência, imaginar um futuro parece luxo.

Parece ingratidão. Parece delírio.

[short pause]

Mas não é nada disso.

[pause]

É o acto mais prático que podes fazer: saber para onde queres ir para poderes começar a caminhar.

[long pause]

Sem mapa, qualquer caminho serve.

E é assim que muitas pessoas vivem a sua vida financeira: sem mapa.

[pause]

Ganham. Gastam. Sobra ou não sobra. Reagem.

Mas nunca param para perguntar: isto está a levar-me para algum sítio?

[long pause]

O mapa não é um orçamento.

O orçamento é o como.

O mapa é o para quê.

[pause]

O orçamento diz: não gastes mais de X em comida.

O mapa diz: quero viver num sítio com mais luz, perto do mar, com tempo para ler.

[short pause]

O orçamento sem mapa é uma prisão.

O mapa sem orçamento é um sonho.

Precisas dos dois.

[pause]

Mas o mapa vem primeiro.

Porque sem saber para onde vais, não há número que te dê paz.

[long pause]

Escreve, em detalhe, um dia normal na vida que queres ter daqui a três anos.

Não a vida perfeita — a tua.

[pause]

Desde que acordas até que adormeces. Com quem estás. O que fazes. O que comes. O que sentes.

Depois lê o que escreveste e pergunta: quanto custa este dia?

[short pause]

Não precisa de ser exacto. Mas precisa de ser real.

[pause]

E quando tiveres o número, já não é um sonho.

É um destino.

[long pause]

O dinheiro não te dá uma vida.

Mas pode levar-te até ela — se souberes para onde queres ir.`,
      },
      {
        id: "ouro-proprio-m8c",
        titulo: "M8.C — Liberdade, não acumulação",
        curso: "ouro-proprio",
        texto: `Se o objectivo do dinheiro não for ter mais — mas ser mais livre — o que muda?

[pause]

O que farias diferente amanhã se o teu norte não fosse acumulação, mas liberdade?

[long pause]

Há mulheres que têm muito e ainda pagam em tempo, em sono, em saúde, em paciência. O dinheiro está lá — a vida já foi.

E há mulheres que têm pouco e passam a vida inteira a mover-se a partir do que é seu. O dinheiro é menos, mas faz exactamente o que tem de fazer.

[pause]

A diferença entre as duas não é o quanto.

É para onde aponta cada euro que entra.

[long pause]

Tu estás algures no meio.

Com mais do que precisas para sobreviver e menos do que achas que precisas para viver.

[pause]

Mas a pergunta não é quanto.

A pergunta é: para onde aponta?

[short pause]

Se o teu dinheiro te permite fazer o que importa, tens o que precisas.

Se o teu dinheiro te obriga a fazer o que não importa para manteres o que já não queres — esse dinheiro não é liberdade.

É só outra forma de obediência.

[long pause]

Herdaste a ideia de que o objectivo do dinheiro é crescer indefinidamente.

Mais poupança, mais investimento, mais reserva.

[pause]

Mas uma vida inteira a acumular sem direcção é vida a servir a acumulação.

E a acumulação — se não a domesticares — pede sempre mais.

[short pause]

A liberdade financeira não é ter tanto que nunca mais trabalhas.

É ter clareza suficiente para que cada euro vá, conscientemente, para a vida que queres.

[pause]

Quando isso se instala, não é o saldo que muda primeiro. É o olhar.

[short pause]

Olhar para o extracto deixa de ser exame.

Passa a ser mapa.

[pause]

Deixas de te submeter ao número.

Começas a servir-te dele.

[long pause]

Escreve três coisas que o dinheiro te permite fazer que te fazem sentir livre.

E três coisas que o dinheiro te obriga a fazer que te prendem.

[pause]

Olha para as duas listas.

E pergunta: posso ter mais da primeira e menos da segunda?

[short pause]

Não amanhã — ao longo do próximo ano?

Começa por uma. Uma única mudança.

Pequena. Concreta.

[pause]

Que te aproxime da liberdade e te afaste da acumulação sem sentido.

[long pause]

O dinheiro nunca foi o destino.

É o caminho.

E o caminho só tem valor se souberes para onde te leva.`,
      },
    ],
  },
  {
    id: "curso-limite-sagrado-m1",
    titulo: "Curso Limite Sagrado — Módulo 1 (Aulas A, B, C)",
    descricao: "O Sim Automático. Material de áudio para alunos.",
    scripts: [
      {
        id: "limite-sagrado-m1a",
        titulo: "M1.A — O sim que sai antes do corpo decidir",
        curso: "limite-sagrado",
        texto: `Quantas vezes, esta semana, disseste sim antes de saberes o que te estavam a perguntar?

[pause]

Antes da frase da outra pessoa terminar, a tua boca já tinha respondido.

[long pause]

Alguém pede ajuda. Tu dizes sim.

Alguém pergunta se tens tempo. Tu dizes sim.

Alguém convida. Tu dizes sim.

[pause]

Só depois, quando fica em silêncio, é que o corpo começa a responder.

[short pause]

Com um aperto. Com um cansaço sem razão. Com aquela vontade estranha de cancelar tudo e ficar sozinha numa sala escura.

[long pause]

O sim saiu sozinho.

Não passou pelo corpo. Não passou pela vontade. Não passou pela verdade.

[pause]

Saiu por um caminho mais rápido — o caminho do que aprendeste há muito tempo a fazer.

[short pause]

Antes de saberes ler, aprendeste a ler o ambiente.

Aprendeste que a hesitação causava desconforto. Que a pergunta sobre se querias ou não era, ela própria, uma imposição.

[pause]

Aprendeste que era mais simples — e mais seguro — dizer sim primeiro e resolver depois.

[long pause]

O sim automático é uma das formas mais invisíveis de te traíres.

Invisível porque parece gentileza.

Invisível porque é socialmente premiado.

Invisível porque a própria pessoa que o diz, muitas vezes, nem nota que disse.

[pause]

Mas o corpo nota.

Sempre nota.

[short pause]

E cada sim que saiu sem passar por ti adiciona uma pequena dívida. Um pequeno recuo. Um pequeno passo para longe da vida que é realmente tua.

[long pause]

Durante os próximos dias, presta atenção a um momento específico.

O momento exacto entre a pergunta e a tua resposta.

[pause]

Esse espaço — que parece não existir — é onde vive o sim automático.

[short pause]

Não te pedimos para mudar a resposta. Só para notar o espaço.

[pause]

Uma respiração entre a pergunta e o sim. Uma pausa pequena.

[short pause]

Nessa pausa, alguma coisa começa a mudar. Sem forçar. Sem decidir.

Simplesmente porque, pela primeira vez, o espaço existe.

[long pause]

O corpo sabe dizer não.

Só não te ensinaram a ouvi-lo a tempo.`,
      },
      {
        id: "limite-sagrado-m1b",
        titulo: "M1.B — Onde aprendeste a dizer sim sem pensar",
        curso: "limite-sagrado",
        texto: `Quando foi que começaste a dizer sim antes de pensares?

[pause]

Foi em criança, provavelmente. Cedo.

Antes de teres palavras para nomear o que estava a acontecer.

[long pause]

Tinhas cinco, seis anos.

Alguém te ofereceu comida que não querias. Alguém te pediu um beijo que não te apetecia dar. Alguém te perguntou se estavas bem quando claramente não estavas.

[pause]

Em cada um destes momentos, houve uma resposta pequena dentro de ti.

Uma preferência real. Uma verdade que nem precisava de argumento.

[short pause]

E em cada um destes momentos, aprendeste algo.

Aprendeste que a tua resposta real causava desconforto.

Aprendeste que a tua verdade era inconveniente.

Aprendeste que era mais simples ajustar.

[pause]

Sorriste. Aceitaste a comida. Deste o beijo. Disseste que estavas bem.

[long pause]

E ninguém te elogiou por ajustares.

Não precisou de elogio. O alívio das pessoas à tua volta, quando cedeste, foi a prova mais clara de que ajustar era a resposta correcta.

[pause]

Aprendeste por confirmação.

Uma confirmação que se repetiu centenas de vezes ao longo da infância.

[short pause]

Aos dez anos, já sabias: o meu sim protege-os. O meu não perturba-os.

Aos quinze, o teu sim era automático. Sabias dá-lo sem pensar.

Aos trinta, já não te lembras de como se dizia o contrário.

[long pause]

Isto não é culpa tua.

É um mecanismo que qualquer criança num ambiente imperfeito desenvolve para sobreviver emocionalmente.

[pause]

Fez sentido.

Protegeu-te naquele tempo.

[short pause]

Mas já não estás aos cinco anos.

[pause]

E o mecanismo que te protegeu na infância é o mesmo que agora te esvazia.

[long pause]

Recorda, se conseguires, um momento específico da tua infância em que aprendeste que o teu sim era o caminho mais fácil.

Não precisas de resolver nada. Não precisas de confrontar ninguém.

[pause]

Só de reconhecer: foi ali. Foi então.

A partir dali comecei a dizer sim antes de saber o que queria.

[short pause]

Reconhecer é o primeiro gesto de separação entre a criança que aprendeu e a adulta que agora escolhe.

[long pause]

O sim que te custou tanto a vida inteira nasceu de um gesto pequeno.

Mas o não que está a chegar — esse também nasce assim.`,
      },
      {
        id: "limite-sagrado-m1c",
        titulo: "M1.C — O corpo que sabia que era não",
        curso: "limite-sagrado",
        texto: `Pensa numa vez em que disseste sim e, horas ou dias depois, te arrependeste.

[pause]

Antes de dizeres sim — onde é que o corpo estava?

[long pause]

Provavelmente houve um aperto.

Um aperto pequeno, no peito ou na barriga, que durou menos de um segundo.

[short pause]

Talvez a respiração tenha ficado mais curta. Talvez os ombros tenham subido. Talvez tenha havido um arrepio breve.

[pause]

O teu corpo estava a dizer não.

[short pause]

A dizer não com todos os meios que tinha, mas sem palavras.

[pause]

E tu, por cima, disseste sim com palavras.

[long pause]

Durante toda a tua vida, o teu corpo tem dado estes sinais antes das tuas respostas verbais.

Antes das tuas decisões conscientes.

Antes até de tu saberes que estavas a ser perguntada.

[pause]

O corpo é mais rápido que a mente.

Lê a situação em milissegundos. Detecta micro-expressões, tons de voz, pausas, tensões.

[short pause]

E quando algo te ameaça — ameaça a tua paz, o teu tempo, a tua integridade — ele reage antes de tu decidires.

[pause]

Mas tu, há muito tempo, aprendeste a não confiar nele.

[long pause]

Foste ensinada a que as reacções do corpo eram fraqueza, exagero, histeria.

Que uma mulher séria decidia com a cabeça.

Que sentir era impreciso.

[pause]

Então começaste a silenciá-lo.

Cada vez que o corpo dizia não, tu disseste sim por cima.

Cada vez que o corpo dizia para parares, tu continuaste.

[short pause]

Com o tempo, o corpo começou a desistir de avisar.

Ou pior — começou a avisar mais alto, através de sintomas. Insónia. Dores inexplicáveis. Infecções recorrentes. Exaustão crónica.

[pause]

O corpo ainda diz não.

Só que agora grita porque a voz normal há muito não é ouvida.

[long pause]

Durante os próximos dias, quando alguém te fizer uma pergunta, não respondas imediatamente.

Dá-te três segundos.

[pause]

Nesses três segundos, presta atenção ao corpo.

Há aperto? Há alívio? Há neutralidade?

[short pause]

Não é obrigatório usares a informação para decidir.

Apenas nota o que está lá.

[pause]

O corpo esperou muito tempo para voltar a ser ouvido.

Três segundos, por agora, são muito para ele.

[long pause]

O corpo não precisa de aprender a dizer não.

Ele sabe dizer não desde sempre.

[pause]

Só precisa de voltar a ter alguém que o escute.`,
      },
    ],
  },
  {
    id: "curso-limite-sagrado-m2",
    titulo: "Curso Limite Sagrado — Módulo 2 (Aulas A, B, C)",
    descricao: "A Escuta do Corpo. Material de áudio para alunos.",
    scripts: [
      {
        id: "limite-sagrado-m2a",
        titulo: "M2.A — Os sinais que o teu corpo dá quando te trai",
        curso: "limite-sagrado",
        texto: `Já te aconteceu saberes que disseste a coisa errada antes de o teu cérebro processar o que aconteceu?

[pause]

O corpo sabia antes.

[long pause]

Estavas numa conversa.

Alguém disse alguma coisa. Tu respondeste. Todos continuaram.

[pause]

Mas dentro de ti, algo se apertou.

Uma sensação pequena no peito. Um nó breve na garganta. Uma tensão nas mãos.

[short pause]

Não sabias o que era. Continuaste a falar.

[pause]

E só mais tarde, a horas de distância da conversa, percebeste: eu devia ter dito outra coisa. Eu concordei com algo com que não concordo. Eu deixei passar.

[long pause]

O corpo tinha-te avisado.

No momento exacto.

E tu não estavas a ouvir.

[long pause]

Os sinais são sempre os mesmos. Cada mulher tem os seus.

Para algumas é um aperto no peito. Para outras é a barriga que se contrai. Para outras ainda são os ombros que se levantam sozinhos.

[pause]

Estes sinais são rápidos. Duram menos de dois segundos.

Passam antes de teres tempo de os perceber conscientemente.

[short pause]

Mas o corpo regista.

E guarda.

[pause]

Cada vez que ignoras um sinal, acrescentas mais um ao arquivo.

[long pause]

Ao fim de uns anos, este arquivo torna-se tão grande que o corpo começa a ter sintomas crónicos.

Dores que não têm causa médica óbvia.

Cansaço que não desaparece com descanso.

Insónias que chegam em fases específicas da vida.

[pause]

Estes sintomas não são aleatórios.

São a conta que o corpo finalmente cobra pelo que tu ignoraste.

[long pause]

Esta semana, escolhe uma conversa em que saíste a sentir-te estranha.

Escreve num papel, passo a passo: o que foi dito, o que foi respondido, em que momento o corpo começou a apertar.

[pause]

Em que momento é que o corpo começou a dar sinal?

Não o momento em que tu notaste. O momento em que o corpo começou.

[short pause]

Há sempre uma diferença.

O corpo sabe antes de ti.

[pause]

Identificar esse momento é começar a recalibrar o tempo entre o sinal e a tua consciência.

Com a prática, esse tempo diminui.

[short pause]

Até que um dia, o sinal e a consciência chegam ao mesmo tempo.

E tu, aí, podes finalmente escolher.

[long pause]

O corpo não é lento.

Foste treinada a não o ouvir a tempo.`,
      },
      {
        id: "limite-sagrado-m2b",
        titulo: "M2.B — A tensão como informação, não sintoma",
        curso: "limite-sagrado",
        texto: `Aquele nó na garganta é sintoma ou é mensagem?

[pause]

A tensão nos ombros é patológica ou é resposta?

[long pause]

Cresceste num mundo que te ensinou a tratar as reacções do corpo como defeitos a resolver.

Dói-te a cabeça — tomas comprimido.

Tens insónia — tomas indutor de sono.

Dói-te a barriga — cortas glúten.

[pause]

Todas estas respostas podem ser úteis.

Mas partem de uma premissa: o sintoma é o problema.

[short pause]

E às vezes — muitas vezes — o sintoma não é o problema.

É a mensagem.

[long pause]

O teu corpo não produz tensão aleatória.

Cada tensão está ligada a alguma coisa.

[pause]

Os ombros que se levantam diante de certas pessoas. A mandíbula que cerra em certas conversas. O estômago que se contrai ao ver certas mensagens chegarem.

[short pause]

Estas reacções não são inimigas tuas.

São diagnóstico.

[pause]

Estão a dizer-te: esta pessoa exige-te mais do que podes dar. Esta conversa está a atravessar um limite que ainda não nomeaste. Esta relação leva-te mais do que devolve.

[long pause]

Mas tu, em vez de escutares a mensagem, tentas eliminar o sintoma.

Tomas magnésio. Vais a yoga. Meditas. Respiras fundo.

[pause]

Nada disto é errado.

Mas se o corpo continua a reagir quando entras em certos sítios, nenhum magnésio do mundo vai resolver.

[short pause]

O corpo está a pedir-te que mudes de contexto, não que alivies o sintoma.

[long pause]

A diferença entre tratar sintoma e ouvir mensagem é esta.

O sintoma é pedido para a tensão sair.

A mensagem é pedido para a situação mudar.

[pause]

Quando tratas apenas o sintoma, continuas a expor o corpo ao mesmo estímulo.

E o corpo, para sobreviver, aumenta o volume do aviso.

[short pause]

Sintomas crónicos são muitas vezes mensagens ignoradas durante anos.

[long pause]

Faz uma lista das tensões mais frequentes no teu corpo.

Dor nas costas. Aperto no peito. Insónia. Enxaqueca.

[pause]

Ao lado de cada uma, escreve: quando aparece?

Sê específica. Que dia da semana. Que conversa. Que tipo de situação.

[short pause]

Olha para a lista.

Os teus sintomas têm um mapa.

[pause]

E o mapa está a apontar para algo específico da tua vida que ainda não mudou.

[long pause]

Os teus sintomas não são fraqueza.

São cartas que o teu corpo te escreve quando tu não ouves o que ele sussurra.`,
      },
      {
        id: "limite-sagrado-m2c",
        titulo: "M2.C — Aprender a pausar",
        curso: "limite-sagrado",
        texto: `Quantos segundos passam entre tu seres perguntada e tu responderes?

[pause]

Um? Dois?

Ou é quase zero — a resposta sai antes da pergunta terminar?

[long pause]

A maioria das pessoas responde antes de ter acabado de receber a informação.

Já tinham uma resposta preparada.

[pause]

Ou responderam para preencher o silêncio.

Ou responderam porque não conseguiriam aguentar o olhar de espera.

[short pause]

Qualquer que seja a razão, a resposta saiu sem passar por um lugar importante: a pausa.

[long pause]

A pausa é o espaço entre a pergunta e a resposta.

Um espaço que, para a maioria das mulheres, quase não existe.

[pause]

E nesse espaço é onde vive a tua verdadeira resposta.

A tua verdadeira vontade.

A tua verdadeira preferência.

[short pause]

Se não há pausa, não há tua resposta.

Há apenas o reflexo.

[long pause]

Aprender a pausar é o trabalho mais discreto e mais subversivo que uma mulher pode fazer.

Discreto porque ninguém nota. Uma pausa de dois segundos passa quase despercebida aos outros.

Subversivo porque muda completamente a dinâmica de toda a tua vida social.

[pause]

Quando há pausa, há tu.

Quando há pausa, o teu corpo consegue entrar na conversa.

Quando há pausa, a outra pessoa começa, lentamente, a acostumar-se à ideia de que tu não és automática.

[long pause]

No início, a pausa é desconfortável.

Quem recebeu anos da tua resposta imediata vai notar. Alguns vão pressionar. Outros vão ficar ligeiramente confusos.

[pause]

Aguenta.

A pausa é território. E território, uma vez criado, protege-se.

[short pause]

Ao fim de umas semanas, os que te conhecem começam a adaptar-se.

Aprendem que contigo há um momento de silêncio antes da resposta.

Esperam.

[pause]

E tu, nesses segundos ganhos, voltas a ter acesso a ti.

[long pause]

Esta semana, faz um exercício específico.

Cada vez que alguém te faz uma pergunta — qualquer pergunta — respira uma vez antes de responder.

[pause]

Uma respiração. Completa. Pelo nariz.

Só isso.

[short pause]

Não te obriga a mudar a resposta.

Só cria espaço.

[pause]

No fim da semana, vais notar uma coisa estranha: algumas das tuas respostas começaram a ser diferentes.

Não porque tenhas decidido mudar.

[short pause]

Porque finalmente tiveram tempo de passar por ti.

[long pause]

A tua resposta real vive na pausa.

E a pausa é a tua casa quando ninguém te vê.`,
      },
    ],
  },
  {
    id: "curso-limite-sagrado-m3",
    titulo: "Curso Limite Sagrado — Módulo 3 (Aulas A, B, C)",
    descricao: "A Arte de Não Fazer. Material de áudio para alunos.",
    scripts: [
      {
        id: "limite-sagrado-m3a",
        titulo: "M3.A — Fazer menos é um acto radical",
        curso: "limite-sagrado",
        texto: `O que aconteceria se, amanhã, fizesses metade?

[pause]

Metade dos compromissos. Metade das mensagens respondidas. Metade das tarefas resolvidas.

[long pause]

A primeira resposta honesta é medo.

O mundo ruiria. As pessoas zangariam-se. Alguém ficaria à espera.

[pause]

Mas espera — olha com cuidado.

A maioria das coisas que tu fazes num dia, não tinhas sido tu que as pediste.

Apareceram no teu tempo por expectativa, por hábito, por medo de decepcionar.

[short pause]

E tu, sem pensar, absorveste como tarefas tuas.

[long pause]

Fazer menos, numa sociedade que mede o valor pela produção, é um gesto radical.

Não porque a preguiça seja virtude.

Porque a possibilidade de fazer menos é a possibilidade de escolher o que fazes.

[pause]

Enquanto fazes tudo, não escolhes nada.

[short pause]

Quando reduzes, começas a ver — pela primeira vez em anos — o que é realmente essencial.

O que era rotina automática. O que era obrigação invisível. O que era verdadeiramente tua escolha.

[long pause]

A arte de não fazer não é desistir.

É uma prática de discernimento.

[pause]

Requer que reconheças três categorias de tarefas.

As que são tuas por escolha. As que são tuas por hábito. As que são tuas por imposição.

[short pause]

Só as primeiras merecem atenção plena.

As outras duas precisam de ser repensadas.

[long pause]

Esta semana, faz uma lista de todas as tarefas que assumiste na última semana.

Tudo. Do mais pequeno ao mais exigente.

[pause]

Ao lado de cada uma, escreve uma das três letras: E (escolha), H (hábito), ou I (imposição).

Não penses muito. Primeira resposta.

[short pause]

Depois olha para o resultado.

A proporção de E, H e I é o mapa da tua autonomia.

[pause]

Quando mais de metade é H ou I, tens um diagnóstico claro: a tua vida está a acontecer sem ti no assento do condutor.

[long pause]

Fazer menos não é preguiça.

É o primeiro movimento para voltar a escolher.`,
      },
      {
        id: "limite-sagrado-m3b",
        titulo: "M3.B — Quando recusar é cuidado",
        curso: "limite-sagrado",
        texto: `Já sentiste que, ao dizeres sim a alguém, estavas a abandonar outra pessoa?

[pause]

A dizer sim a um convite e, ao mesmo tempo, a dizer não ao teu corpo cansado?

A dizer sim a um pedido e, ao mesmo tempo, a dizer não a um projecto teu há muito adiado?

[long pause]

Cada sim que dás é, em silêncio, um não para outra coisa.

Este não acontece nos bastidores.

[pause]

E na maioria das vezes, a outra coisa que perde o espaço — és tu.

[long pause]

As mulheres são treinadas a ver o sim como cuidado e o não como agressão.

Mas a verdade é mais subtil.

[pause]

Um sim automático não é cuidado. É adaptação.

Um não consciente, dito com respeito pela outra pessoa e por ti, pode ser o gesto mais cuidadoso da conversa.

[short pause]

Porque o não consciente protege a qualidade do que vais dar a seguir.

[long pause]

Quem diz sim a tudo, eventualmente, dá tudo mal.

Chega à próxima pessoa cansada. Chega à conversa seguinte ausente. Chega ao próprio corpo vazia.

[pause]

O não, nesta lógica, é uma protecção de qualidade.

Recusas agora para poderes dar mais inteiramente ao que fica.

[short pause]

Isto não é cálculo frio.

É respeito pela finitude do teu corpo.

[long pause]

Pensa numa pessoa a quem tens dificuldade em dizer não.

Pensa numa situação recente em que deste sim mas, horas depois, te ressentiste.

[pause]

Escreve em duas colunas. Na esquerda: o que dei ao dizer sim. Na direita: o que deixei de dar a outra pessoa — ou a mim — por ter dito sim.

[short pause]

A coluna da direita é, quase sempre, mais significativa do que imaginas.

[pause]

E é esta coluna que torna o não, quando ele aparecer, num acto de cuidado alargado.

Não estás a dizer não a uma pessoa.

Estás a dizer sim ao que fica fora da visão dela.

[long pause]

Recusar bem é uma forma de amor mais rara do que concordar mal.`,
      },
      {
        id: "limite-sagrado-m3c",
        titulo: "M3.C — A paz dos que sabem parar",
        curso: "limite-sagrado",
        texto: `Observaste alguma vez uma mulher que, inexplicavelmente, parece em paz?

[pause]

Não em euforia. Em paz.

Uma qualidade quieta, que resiste à agitação ao redor.

[long pause]

Se olhares com atenção, vais notar uma coisa específica sobre esta mulher.

Ela sabe parar.

[pause]

Não literalmente — nem sempre está parada.

Mas quando chega um ponto, ela pára.

Pára de discutir quando a discussão já não avança. Pára de trabalhar quando o dia cumpriu o que podia cumprir. Pára de esperar quando a espera já não faz sentido.

[short pause]

A capacidade de parar é uma das mais raras e mais respeitadas.

[long pause]

A maioria das pessoas não pára porque parar parece perigoso.

Parar significa aceitar que algo não vai ficar resolvido hoje.

Parar significa admitir que há um limite ao que o esforço pode fazer.

Parar significa confiar que o mundo vai continuar sem a nossa intervenção constante.

[pause]

Quem parou pela primeira vez descobriu que o mundo, de facto, continuou.

E que algumas coisas que pareciam urgentes, quando não foram atendidas, desapareceram sozinhas.

[short pause]

Outras, que eram importantes, voltaram no dia seguinte — mais definidas, mais claras.

[long pause]

Parar é um teste de fé.

Fé em que a vida não depende de ti estares activa.

Fé em que o teu valor não está ligado à tua produtividade.

Fé em que, ao parares, estás a permitir que o teu corpo recupere o que é dele.

[pause]

A primeira pessoa a beneficiar da tua paragem é aquela com quem vais falar a seguir.

A segunda é o teu corpo, que há muito pedia.

A terceira — estranha mas verdadeira — é a tarefa que estavas a fazer, que, quando retomada, terá mais qualidade.

[long pause]

Escolhe um momento esta semana em que, normalmente, continuarias.

Um momento previsível — o fim da tarde de quinta-feira, por exemplo. Ou o domingo à noite. Ou a hora antes de deitar.

[pause]

Nesse momento, pára.

Não faças nada mais produtivo. Não mudes para outra tarefa.

Senta-te. Deixa o silêncio ocupar o espaço que normalmente ocuparias com acção.

[short pause]

É desconfortável no início.

Sente-o passar.

Fica até o desconforto se tornar quietude.

[pause]

Esse ponto — o ponto em que o desconforto vira quietude — é a entrada para uma qualidade de vida que tu, há muito, esqueceste que era acessível.

[long pause]

A paz dos que sabem parar não é privilégio.

É fruto de uma recusa específica: recusar a ditadura do fazer sempre mais.`,
      },
    ],
  },
  {
    id: "curso-limite-sagrado-m4",
    titulo: "Curso Limite Sagrado — Módulo 4 (Aulas A, B, C)",
    descricao: "Pessoas que Atravessam Limites. Material de áudio para alunos.",
    scripts: [
      {
        id: "limite-sagrado-m4a",
        titulo: "M4.A — Quem não ouve o teu não",
        curso: "limite-sagrado",
        texto: `Há pessoas na tua vida a quem já disseste não.

Várias vezes.

E elas continuam a perguntar o mesmo.

[long pause]

Não é falta de atenção. É outra coisa.

[pause]

Há uma categoria específica de pessoas para quem o teu não é uma proposta a ser negociada, não uma resposta final.

Insistem com doçura. Voltam mais tarde. Apresentam a mesma pergunta com novas palavras.

[short pause]

E tu, ao fim de umas vezes, acabas por ceder. Não porque tenhas mudado de ideia.

Por exaustão.

[long pause]

Aprendeste isto cedo, em casa.

Alguém da tua família não aceitava um não como resposta definitiva.

Talvez tenha sido um pai que insistia até tu cederes. Uma mãe que usava a culpa como forma de renegociação. Um irmão que transformava a tua recusa num problema de relação.

[pause]

Aprendeste que dizer não uma vez raramente bastava.

Que precisavas de sustentar o não várias vezes, com crescente desconforto, até a outra pessoa desistir.

[short pause]

E muitas vezes a outra pessoa não desistia. Tu é que desistias primeiro.

[long pause]

Isto treinou-te para uma realidade específica: o teu não é uma sugestão.

Por isso, hoje, quando alguém te pede uma coisa pela primeira vez, tu já te estás a preparar para ceder.

[pause]

A primeira recusa é apenas o começo da negociação, na tua cabeça.

Uma formalidade. Uma abertura de processo.

[short pause]

Este é um dos treinos mais invisíveis — e mais corrosivos — que uma mulher pode receber.

[long pause]

O primeiro passo para romper este padrão é reconhecê-lo especificamente.

Quem, na tua vida, não aceita o teu primeiro não?

Faz a lista.

[pause]

Não precisas de confrontar ninguém. Só de reconhecer.

Depois, quando essas pessoas te pedirem algo, tem em mente uma regra.

A tua resposta é definitiva à primeira vez. Não à terceira.

[short pause]

E se insistirem, a tua segunda resposta é igual à primeira.

E a terceira. E a quarta.

[pause]

Não é rigidez. É coerência.

Esta coerência — repetida ao longo do tempo — ensina as pessoas a ouvirem-te à primeira.

E liberta-te do trabalho constante de manter limites que nunca são reconhecidos.

[long pause]

O teu não é uma frase completa.

Mesmo que alguém precise de ouvi-la dez vezes para aprender que é.`,
      },
      {
        id: "limite-sagrado-m4b",
        titulo: "M4.B — A energia que te drena",
        curso: "limite-sagrado",
        texto: `Há pessoas que, depois de estares com elas uma hora, tu precisas de duas para recuperar.

[pause]

Não fizeram nada de errado.

Foram educadas. Pagaram o café. Disseram coisas interessantes.

[short pause]

E mesmo assim, saíste esgotada.

[long pause]

Outras pessoas, pelo contrário, deixam-te ligeiramente mais leve.

Mesmo quando falam de assuntos difíceis. Mesmo quando tu não falas muito. Mesmo quando o encontro foi curto.

[pause]

Há algo na qualidade de presença delas que alivia.

[long pause]

A diferença entre estes dois tipos não é carácter.

É um mecanismo muito concreto.

[pause]

As pessoas que te drenam, quase sempre, pedem algo de ti em permanência — atenção, validação, cuidado, reflexo. Mesmo quando não estão a pedir explicitamente, o corpo delas está a puxar o teu.

[short pause]

As pessoas que te recuperam, pelo contrário, não estão a pedir.

Estão apenas a estar.

[long pause]

E tu, por seres sensível a este pedido implícito, respondes sem te aperceberes.

Ajustas o teu tom ao tom delas.

Ouves com mais concentração do que precisarias.

Antecipas as respostas para não as fazeres esperar.

[pause]

Ao fim de uma hora, deste muita energia sem te aperceberes.

Por isso saíste vazia.

[long pause]

Isto não é bom ou mau da outra pessoa.

É uma configuração relacional que, para mulheres sensíveis, é especialmente desgastante.

[short pause]

A identificação é a protecção.

Quando sabes que uma pessoa te drena, podes preparar-te antes do encontro. Podes planear um tempo de recuperação depois. Podes limitar a frequência.

[pause]

Não precisas de cortar relações.

Precisas de orçamentar o custo.

[long pause]

Esta semana, faz uma lista pequena.

Três pessoas à tua volta que te drenam.

Três pessoas que te recuperam.

[pause]

Ao lado de cada uma, escreve quantas horas ao mês costumas passar com elas.

[short pause]

Olha para a lista.

Provavelmente vais descobrir algo desconfortável: passas mais tempo com as que te drenam do que com as que te recuperam.

[pause]

Muitas mulheres vivem nesta configuração sem se aperceberem.

[short pause]

Uma mudança pequena nesta proporção ao longo dos meses muda a qualidade da tua vida inteira.`,
      },
      {
        id: "limite-sagrado-m4c",
        titulo: "M4.C — O afastamento silencioso",
        curso: "limite-sagrado",
        texto: `Há relações que precisam de um confronto explícito para serem resolvidas.

[pause]

E há outras que não.

[long pause]

Para algumas pessoas, cada vez que tu te afastas, elas voltam.

Escrevem a perguntar o que se passa. Fazem-se próximas de novo. Insistem.

[pause]

Para outras, basta tu espaçares.

Respondes mais devagar. Sugeres encontros menos frequentes. Dás menos detalhes sobre a tua vida.

[short pause]

E elas, sem precisar de explicação, começam a espaçar também.

A relação, sem nunca ter havido um confronto, vai-se tornando periférica.

[long pause]

A isto chamamos afastamento silencioso.

E é, para muitas mulheres, o único tipo de recolocação possível.

[pause]

Porque as mulheres foram ensinadas que a ruptura de relações exige justificação, discussão, desculpa.

Que não podes simplesmente afastar-te sem explicar.

[short pause]

Mas esta regra não se aplica a todas as relações.

[pause]

Algumas relações mereceram conversa difícil — e tu deves essa conversa a quem já foi, ao longo do tempo, fiel ao teu bem.

[short pause]

Outras relações não mereceram. Não porque sejam más — mas porque nunca tiveram a profundidade que exigiria a cortesia de um término explicado.

[long pause]

Para estas, o afastamento silencioso é suficiente.

É respeitoso. Não humilha ninguém. Não exige a outra pessoa a confrontar aspectos de si que talvez não queira ver.

[pause]

Deixa a relação diminuir até não ser mais relação.

Sem drama. Sem acusação. Sem fantasmas.

[long pause]

O afastamento silencioso é, muitas vezes, a forma mais gentil de recuperares tempo e energia.

Tempo que estava a ser comido por dinâmicas sem futuro.

Energia que não ia para lado nenhum.

[pause]

E este tempo e energia, de volta a ti, transformam-se noutra coisa.

Em disponibilidade para as pessoas que realmente importam.

[short pause]

Em silêncio para te escutares.

Em atenção para o teu próprio corpo.

[long pause]

Pensa em duas ou três pessoas na tua vida com quem a energia há muito não flui.

Não inimigas. Não pessoas com problema grave.

Apenas relações que já não são.

[pause]

Não é preciso anúncio.

Nos próximos meses, responde com um dia de atraso. Não marques novos encontros. Sê menos acessível.

[short pause]

E vê o que acontece.

A maioria destas relações vai-se dissolver sozinha. Sem ressentimento.

[pause]

E tu, ao fim de uns meses, vais olhar para trás e perceber: afastei-me de quem precisava de me afastar. Sem nunca ter tido a conversa. Sem nunca ter gerado conflito.

[long pause]

Esta é uma competência feminina antiga, muitas vezes subestimada.

A arte de deixar sair sem ter de expulsar.`,
      },
    ],
  },
  {
    id: "curso-limite-sagrado-m5",
    titulo: "Curso Limite Sagrado — Módulo 5 (Aulas A, B, C)",
    descricao: "Limites com Família. Material de áudio para alunos.",
    scripts: [
      {
        id: "limite-sagrado-m5a",
        titulo: "M5.A — Dizer não a uma mãe",
        curso: "limite-sagrado",
        texto: `O limite mais difícil que uma mulher enfrenta na sua vida adulta raramente é no trabalho.

[pause]

É com a mãe.

[long pause]

Há uma razão biológica e emocional para isto.

A tua mãe foi a primeira pessoa a quem disseste sim — antes de teres linguagem, antes de teres consciência, antes de teres escolha.

[pause]

O corpo teve de se adaptar ao corpo dela para sobreviver.

E durante muitos anos, isto foi a única forma de existir.

[short pause]

Esta memória é mais antiga do que qualquer decisão que tomas hoje.

Está no sistema nervoso, não no raciocínio.

[long pause]

Por isso, quando tu tentas dizer não a uma mãe, acontecem coisas estranhas.

A garganta fecha-se. A respiração muda. As palavras saem hesitantes. Ou nem saem — dizes sim, outra vez, quase sem saber porquê.

[pause]

Não és fraca.

Estás a tentar mudar um padrão que foi instalado antes de teres palavras para o questionar.

[short pause]

Isso exige tempo, repetição, e compaixão por ti.

[long pause]

As mães não são iguais.

Algumas aceitam o não dos filhos com relativa facilidade. Outras interpretam qualquer recusa como traição, ingratidão, ou ataque.

[pause]

Se a tua mãe é do segundo tipo, há uma coisa que precisas de saber.

[short pause]

A reacção dela ao teu não não é proporcional ao tamanho do teu não.

Podes dizer não a uma coisa pequena — um almoço, um favor — e receberes a reacção como se a tivesses abandonado.

[pause]

Esta desproporção entre o pedido e a reacção é informação.

Diz-te que, para esta mãe, o teu não não é sobre o assunto específico.

É sobre o facto de tu estares a ter autonomia.

[long pause]

Autonomia, para algumas mães, é perda.

Cada passo teu para te definires fora da relação com ela é, para ela, um pequeno abandono.

[pause]

Isto não te torna responsável pela tristeza dela.

Mas ajuda-te a não internalizares a culpa como se ela fosse prova de que fizeste algo mal.

[short pause]

A tua mãe pode estar triste e tu podes continuar a ter limites.

As duas coisas ao mesmo tempo.

[long pause]

Escolhe um limite pequeno que tens vindo a adiar com a tua mãe.

Algo concreto — um telefonema semanal reduzido, uma visita combinada com menos frequência, uma pergunta que ela faz repetidamente e a que queres deixar de responder.

[pause]

Não precisas de anúncio. Não precisas de explicar. Não precisas de justificar em voz alta.

Introduz a mudança. Uma vez. Sem dramatizar.

[short pause]

Ela vai reagir. Talvez mal.

Não respondas à reacção com argumento ou culpa. Responde com presença calma.

[pause]

Mantém a mudança.

A tua mãe — mesmo uma mãe difícil — vai-se habituar mais depressa do que imaginas.

Porque a maioria das pessoas, quando encontra resistência firme e gentil ao longo do tempo, adapta-se.

[long pause]

Dizer não a uma mãe não é destruir a relação.

É pedir-lhe para adaptar-se a uma versão mais adulta de ti.

E algumas mães, ao serem pedidas, até descobrem que preferem esta versão.`,
      },
      {
        id: "limite-sagrado-m5b",
        titulo: "M5.B — O filho que espera demais",
        curso: "limite-sagrado",
        texto: `Tens filhos, e há uma coisa que tu não consegues dizer em voz alta.

[pause]

Que eles esperam demais de ti.

[long pause]

Não no sentido de serem crianças com necessidades normais.

No sentido de se terem acostumado a uma disponibilidade tua que já não te serve — e talvez nunca tenha realmente servido.

[pause]

Estão à espera de respostas imediatas às mensagens. De conselhos permanentes. De logística que resolves enquanto resolves tudo o resto.

Esperam de ti o que, em geração anterior, era dividido entre várias mulheres — a mãe, a avó, as tias, as vizinhas.

[short pause]

Tu és, sozinha, a rede inteira.

[long pause]

Muitas mães modernas encontram-se neste lugar sem nome.

Filhos com vinte e cinco, trinta anos, que tecnicamente são adultos, mas que ainda chamam a mãe para decisões pequenas. Para validação. Para organização emocional.

[pause]

E tu, por amor, respondes sempre.

Não percebes que cada resposta tua confirma a dependência. Ensina-lhes que a tua presença infinita é a única opção.

[short pause]

Eles, por seu lado, nunca pediram. Não aprenderam a não pedir.

[long pause]

Este padrão tem um custo silencioso.

Não para eles — eles, pelo menos no curto prazo, beneficiam.

Para ti.

Tu estás a viver uma fase da vida que devia ser de maior autonomia e estás a viver, ainda, como mãe de crianças de idades passadas.

[pause]

Os teus sonhos, os teus projectos, a tua recuperação — tudo isto está continuamente adiado porque há sempre uma chamada, uma mensagem, uma logística.

[short pause]

E tu dizes a ti própria: eles precisam de mim.

Mas a verdade é mais complicada.

[pause]

Eles habituaram-se à tua disponibilidade.

Habituar-se não é o mesmo que precisar.

[long pause]

Uma das tarefas mais difíceis e mais necessárias da maternidade tardia é ensinar filhos adultos a precisarem menos.

Não porque os deixas. Porque os libertas.

[pause]

Libertar um filho é confiar que ele tem capacidade de resolver sem a tua resposta imediata.

É não responder à primeira mensagem.

É, quando te pedem conselho sobre algo pequeno, devolver a pergunta: e tu, o que é que achas?

É estar disponível em crises reais, não em dilemas de dia-a-dia.

[short pause]

Isto não é abandono.

É o último acto pedagógico.

[long pause]

Esta semana, escolhe um pedido recorrente do teu filho ou filha adulta a que costumas responder imediatamente.

Não respondas imediatamente.

Espera.

[pause]

Na maioria das vezes, a situação resolve-se sozinha antes de tu precisares responder.

E ele, sem se aperceber, começa a aprender que é capaz.

[short pause]

Este pequeno gesto, repetido ao longo de meses, transforma a relação.

[pause]

A maternidade tem fases.

A fase em que tu recuas para que eles avancem é tão importante como a fase em que tu avançavas para os proteger.

[long pause]

Recuar não é desamar.

É amar de forma adequada à idade que eles, agora, têm.`,
      },
      {
        id: "limite-sagrado-m5c",
        titulo: "M5.C — Irmãos e dívidas antigas",
        curso: "limite-sagrado",
        texto: `Entre irmãos, as dívidas não aparecem em contas.

Aparecem em expectativas.

[long pause]

O irmão que sempre esteve em dificuldade e esperou que tu ajudasses.

A irmã que foi a preferida e nunca soube.

A irmã mais velha que assumiu responsabilidade cedo e continua a assumir, décadas depois.

O irmão mais novo que foi protegido pelos outros e continua a precisar de ser.

[pause]

Cada família distribui papéis sem anúncio.

E cada irmão, sem escolha, absorve o seu.

[short pause]

Depois a vida adulta começa.

E os papéis persistem — mesmo quando a realidade já não os justifica.

[long pause]

Se tu foste a que resolvia, continuas a resolver.

Se tu foste a que cuidava, continuas a cuidar.

Se tu foste a que foi protegida, continuas, em certa forma, a ser.

[pause]

E entre estas dinâmicas há, muitas vezes, ressentimentos que nunca são nomeados.

O irmão que recebeu mais ajuda financeira não agradece. A irmã que sempre foi elogiada não reconhece o privilégio. O mais velho que sustentou carrega em silêncio.

[short pause]

Estas dívidas não ditas acumulam-se.

E nos funerais, nas heranças, nas crises — explodem.

[long pause]

Reajustar limites entre irmãos adultos é, para muitas pessoas, o trabalho relacional mais difícil da vida.

Porque os irmãos não podem ser substituídos. Não podes mudar de irmãos como mudas de amigos.

E a relação foi formada em condições que já não existem.

[pause]

Mas podes, no presente, mudar a forma como funciona.

[short pause]

Começa por um reconhecimento silencioso: que papel me foi dado na família? Que papel continuo a desempenhar mesmo sem razão actual?

[pause]

Algumas mulheres continuam a ser a resolutora da família aos quarenta, cinquenta anos — quando os pais já não estão, e a função já não é necessária.

Continuam por hábito.

[long pause]

Reajustar o limite com um irmão exige, muitas vezes, parar de fazer uma coisa específica.

Não mandar a mensagem habitual. Não lembrar do aniversário dele pelo terceiro ano. Não organizar o jantar de família sozinha.

[pause]

A ausência desta acção é mais eloquente do que qualquer conversa.

[short pause]

A família vai notar. Alguém vai ter de preencher o espaço.

[pause]

E só aí, com a tua ausência temporária, os outros vão começar a reconhecer o peso real do que tu fazias sem ser pedida.

[long pause]

Esta semana, escolhe uma responsabilidade que tenhas assumido em relação a um irmão ou irmã sem ninguém te ter pedido explicitamente.

Não faças.

[pause]

Uma única vez. Uma semana.

Vê o que acontece.

[short pause]

Se ninguém nota e tudo continua na mesma, tens a tua resposta: a responsabilidade era invisível.

Se alguém reage, tens a tua resposta: estavas a fazer algo que importava — e agora podes ter uma conversa sobre como redistribuir.

[long pause]

A família adulta só funciona quando cada pessoa reconhece o que traz.

E isso, muitas vezes, só fica visível quando tu, pela primeira vez, não trazes.`,
      },
    ],
  },
  {
    id: "curso-limite-sagrado-m6",
    titulo: "Curso Limite Sagrado — Módulo 6 (Aulas A, B, C)",
    descricao: "Limites no Trabalho. Material de áudio para alunos.",
    scripts: [
      {
        id: "limite-sagrado-m6a",
        titulo: "M6.A — O trabalho que invade o domingo",
        curso: "limite-sagrado",
        texto: `Quando foi o último domingo em que não pensaste no trabalho?

[pause]

Não só não trabalhaste — não pensaste.

[long pause]

Há uma fronteira invisível que foi caindo ao longo dos últimos anos.

A fronteira entre trabalho e o resto da vida.

[pause]

Não caiu de uma vez.

Caiu num telefonema atendido à hora do jantar. Num email respondido a caminho da casa de banho. Numa reunião agendada para as oito da manhã de segunda.

[short pause]

Cada pequena rendição pareceu razoável no momento.

Mas o conjunto de todas — ao longo do tempo — apagou a tua vida pessoal.

[long pause]

O trabalho actual está desenhado para se expandir até ao limite do que aceitares.

Não é paranoia. É estrutural.

[pause]

Há mais estímulos, mais canais, mais notificações, mais expectativa de resposta rápida.

E nenhum limite é dado por quem te paga — porque cada pessoa a dar-te trabalho beneficia da tua disponibilidade sem custo.

[short pause]

O limite só existe se tu o impores.

[long pause]

Mas há uma coisa que complica.

Tu, provavelmente, internalizaste a ética do trabalho como parte da tua identidade.

Trabalhar muito é virtude.

Estar sempre disponível é ser profissional.

Recusar pedidos fora do horário é ser difícil.

[pause]

E então o conflito não é só com o empregador. É contigo.

Cada vez que ignoras um email fora de horas, algo dentro de ti sussurra: devia ter respondido.

[short pause]

Esta voz não é tua.

É a voz da cultura laboral que foste absorvendo desde que começaste a trabalhar.

[long pause]

Recuperar o domingo — ou seja que tempo pessoal for teu — começa por uma decisão silenciosa.

Decidir que há uma parte da tua semana em que o trabalho não existe.

[pause]

Não que trabalhas menos. Que, num bloco específico, deixa de existir.

O telefone fica do outro lado da casa. O email não se abre. As notificações desligam-se.

[short pause]

Durante as primeiras semanas, a ansiedade vai estar alta.

O corpo habituou-se a uma vigilância permanente.

Vai haver momentos em que tu sentes: tenho de ir ver, pode haver algo urgente.

[pause]

Resiste.

Na enorme maioria das vezes, não há nada urgente.

E se houver, a pessoa vai ligar. Emails podem esperar seis horas.

[short pause]

Ao fim de umas semanas, o corpo começa a descansar outra vez.

E o domingo — ou o bloco que escolheste — torna-se, pela primeira vez em muito tempo, realmente teu.

[long pause]

Esta semana, escolhe um único bloco de tempo pessoal.

Pode ser uma tarde de sábado. Pode ser a primeira hora do dia. Pode ser duas horas à noite.

Nesse bloco, não há trabalho.

Nem o email. Nem mensagens profissionais. Nem pensamentos sobre projectos.

[pause]

Se aparecer um pensamento sobre trabalho, não o combatas.

Diz-lhe: agora não. Volto a ti amanhã às nove.

[short pause]

E continua com o que estavas a fazer.

A repetição deste gesto, semana após semana, devolve-te território.

[long pause]

A vida pessoal não é o que sobra depois do trabalho.

É o que escolhes proteger antes de o trabalho começar a pedir.`,
      },
      {
        id: "limite-sagrado-m6b",
        titulo: "M6.B — Pedidos que chegam como ordens",
        curso: "limite-sagrado",
        texto: `Há pedidos de trabalho que chegam com a forma de pergunta mas o peso de ordem.

[pause]

"Consegues ver isto até ao fim do dia?"

"Podias só confirmar aquela coisa?"

"Achas que conseguias pôr isto para amanhã de manhã?"

[long pause]

Gramaticalmente, são perguntas.

Emocionalmente, são obrigações.

[pause]

Porque quem pergunta — um chefe, um cliente, uma colega de hierarquia maior — não está realmente a perguntar.

Está a anunciar a expectativa.

[short pause]

E tu, treinada a ser agradável, respondes ao verbo: sim, consigo.

Mesmo quando o corpo, o calendário, e o bom senso dizem que não devias.

[long pause]

A diferença entre um pedido real e um pedido disfarçado de ordem é esta.

Um pedido real aceita um não sem consequências.

Um pedido disfarçado de ordem aceita um não mas regista-o como problema.

[pause]

E tu aprendeste, ao longo dos anos, a distinguir os dois.

Sabes, pelo tom, pelo momento, pelo tipo de pessoa — qual é qual.

[short pause]

O problema é que tens respondido a ambos da mesma forma: com um sim.

[long pause]

Há uma resposta intermédia que muitas mulheres não praticam.

Não é sim nem é não.

É: deixa-me ver e volto a ti.

[pause]

Esta frase, pequena, cria espaço.

Quebra a dinâmica imediata. Indica que tu estás a considerar, não a reagir.

[short pause]

E muitas vezes — mais vezes do que tu imaginas — a pessoa que fez o pedido responde: ok, não é urgente, podes dizer-me amanhã.

[pause]

A urgência implícita desaparece quando encontra resistência educada.

[long pause]

Porque a maioria dos pedidos disfarçados de ordem não é urgente.

A urgência é invocada para forçar aceitação imediata — antes de tu teres tempo de considerar.

Quando crias pausa, desconstróis a urgência.

[short pause]

E fica visível o pedido real: algo que pode ou não fazer sentido, num timing que pode ou não te servir.

[long pause]

Esta semana, quando receberes um pedido de trabalho que normalmente aceitarias imediatamente, pratica a frase intermédia.

Deixa-me ver e volto a ti.

[pause]

Não precisas de justificar. Não precisas de dar data concreta.

Só precisas de não dizer sim imediatamente.

[short pause]

Depois, com calma, decides.

Podes aceitar. Podes recusar. Podes negociar prazo.

A partir de um lugar teu — não do reflexo que foi instalado em ti pela dinâmica profissional.

[long pause]

O sim que dás de um lugar teu vale mais do que dez sins reflexos.

E a pessoa que te pediu — mesmo que não saiba articular — vai começar a respeitar-te mais.`,
      },
      {
        id: "limite-sagrado-m6c",
        titulo: "M6.C — Reuniões que não te pertencem",
        curso: "limite-sagrado",
        texto: `Estás numa reunião que podia ter sido um email.

[pause]

Alguém está a falar há cinco minutos sobre algo que não te diz respeito.

Outra pessoa acrescenta detalhes.

Tu olhas para o relógio, contas quantas horas de trabalho perdeste esta semana assim.

[long pause]

E no fim, há um "resumo" que poderia ter sido enviado desde o início.

[pause]

Esta reunião, e as outras como ela, são um dos ladrões mais silenciosos do teu tempo profissional.

[short pause]

E tu, quase sempre, não podes recusar.

A cultura de trabalho actual normalizou reuniões como forma default de colaboração — mesmo quando não são necessárias.

[long pause]

Há, no entanto, mais espaço para negociar do que tu pensas.

Nem todas as reuniões a que és convidada têm o mesmo peso.

[pause]

Algumas são obrigatórias, hierarquicamente impostas. Estas aceitas.

Outras são convites informais, de colegas ou projectos paralelos. Estas podem ser recusadas ou participadas parcialmente.

[short pause]

O problema é que, ao longo dos anos, tu aceitaste todas. E o teu calendário tornou-se uma colagem de compromissos que não te pertencem.

[long pause]

A recuperação começa por uma distinção.

Olha para a tua semana passada.

Lista as reuniões em que estiveste.

Ao lado de cada uma, escreve: era obrigatória, ou eu podia ter recusado?

[pause]

Depois, ao lado de cada reunião em que podias ter recusado, escreve: precisava mesmo de estar lá? Fiz diferença?

[short pause]

Se tiveste diferença — perfeito, foi tempo bem gasto.

Se não tiveste diferença, foi tempo roubado a ti por uma norma cultural que não questionaste.

[long pause]

A partir de próxima semana, pratica uma recusa educada a reuniões pouco relevantes.

Formulações úteis.

"Consigo participar nos primeiros dez minutos, depois tenho outro compromisso."

"Podes actualizar-me depois por email?"

"Vou ler a acta — não sinto que precisa da minha contribuição activa."

[pause]

Nenhuma destas frases é agressiva.

Todas marcam posição.

[short pause]

Inicialmente, as pessoas vão ficar ligeiramente surpreendidas.

Gradualmente, adaptam-se. E o teu calendário começa a voltar a ti.

[long pause]

O tempo profissional de uma mulher adulta deve ser ocupado com trabalho real.

Não com performance de presença.

[pause]

Cada hora de reunião inútil é uma hora que não estás a fazer o trabalho para que foste paga.

E é uma hora que não estás a fazer outras coisas também importantes — descanso, pensamento próprio, preparação para tarefas que exigem concentração.

[long pause]

Recuperar o calendário é, para mulheres adultas, um dos limites mais concretos que podem praticar.

Menos convites aceites.

Mais tempo para o trabalho que importa.

E para a mulher que faz esse trabalho.`,
      },
    ],
  },
  {
    id: "curso-limite-sagrado-m7",
    titulo: "Curso Limite Sagrado — Módulo 7 (Aulas A, B, C)",
    descricao: "O Custo dos Não-Limites. Material de áudio para alunos.",
    scripts: [
      {
        id: "limite-sagrado-m7a",
        titulo: "M7.A — O cansaço que ninguém vê",
        curso: "limite-sagrado",
        texto: `Há um cansaço dentro de ti que ninguém à tua volta reconhece.

[pause]

Funcionas. Respondes. Apareces.

As pessoas dizem que és incansável, dedicada, uma mulher forte.

[short pause]

E tu, por dentro, estás exausta de forma que nenhuma soneca resolve.

[long pause]

Este é o cansaço específico de quem não tem limites.

Não é cansaço de trabalho excessivo apenas.

É cansaço de gestão emocional permanente.

[pause]

Tu geres os humores dos outros. Antecipas as necessidades alheias. Absorves tensões que não são tuas. Corriges silenciosamente pequenos problemas antes deles se tornarem grandes.

[short pause]

Tudo isto acontece sem que os outros percebam.

E acontece sem que tu mesma notes o tempo real que dedicas a este trabalho emocional.

[long pause]

Numa sociedade que mede trabalho pelo que é visível, este trabalho não existe.

Não aparece em relatórios. Não tem salário. Não é reconhecido como competência.

[pause]

Mas é, na verdade, o trabalho mais exigente que fazes.

[short pause]

E é o que te deixa exausta ao fim do dia, sem que consigas explicar porquê.

[long pause]

Porque se tentas explicar, a descrição soa pequena.

"Estou cansada."

"De quê? Tu não fizeste assim tanto hoje."

[pause]

Não fizeste "assim tanto" — porque "assim tanto" é medido em tarefas concretas, visíveis.

O que fizeste, na realidade, foi invisível. E por isso incontável.

[long pause]

Esta semana, durante um dia qualquer, faz uma coisa específica.

Anota, ao longo do dia, cada vez que:

- Te preocupas com alguém à tua volta
- Resolves silenciosamente um problema alheio
- Sentes tensão no corpo por causa de uma situação que não é tua
- Antecipas algo que outra pessoa podia fazer sozinha mas não faz

[pause]

Ao fim do dia, conta.

Provavelmente vais encontrar entre vinte e cinquenta ocorrências.

[short pause]

Cada uma, individualmente, parece pequena.

O conjunto é trabalho a tempo inteiro.

[pause]

Esta contagem, feita uma única vez num papel, muda a forma como tu interpretas o teu próprio cansaço.

Deixa de ser preguiça. Deixa de ser queixume.

Passa a ter peso concreto.

[long pause]

E o que está no papel pesa diferente do que está solto na cabeça.

Começa, sozinho, a pedir ar.`,
      },
      {
        id: "limite-sagrado-m7b",
        titulo: "M7.B — O ressentimento que chamas paciência",
        curso: "limite-sagrado",
        texto: `Há um sentimento que tu ainda não aprendeste a nomear.

[pause]

Chama-se-lhe paciência.

Ou dedicação. Ou generosidade.

[short pause]

Mas, se olhares com cuidado, não é nenhuma destas coisas.

É ressentimento.

[long pause]

O ressentimento é um sentimento específico.

Não é raiva. A raiva é aguda, sobe e desce.

O ressentimento é lento. Instala-se. Cresce em silêncio.

[pause]

E é sempre o resultado de uma relação em que deste mais do que estava bem para ti dares.

[short pause]

Deste por amor. Deste por hábito. Deste por medo de não ser amada se não desses.

[pause]

Mas deste demais.

[short pause]

E cada vez que deste demais e não disseste nada, uma pequena conta ficou aberta dentro de ti.

Sem ninguém saber.

[long pause]

Ao longo dos anos, estas contas somam-se.

E tu acordas um dia, numa manhã de domingo qualquer, sentindo uma coisa estranha em relação à tua mãe, ou ao teu parceiro, ou à tua irmã, ou à tua amiga mais antiga.

[pause]

Um desgosto que não tem causa imediata.

Uma frieza que tu não pediste.

Uma vontade estranha de te afastares.

[short pause]

E não percebes porquê.

[long pause]

Percebes, quando olhas para trás, que há anos que estás a carregar estas pequenas contas que nunca foram ditas.

[pause]

O ressentimento não vem de uma coisa grande que te fizeram.

Vem de centenas de coisas pequenas que tu não tiveste linguagem para nomear.

[short pause]

Era mais fácil, no momento, ceder.

Era mais socialmente aceitável dizer que estavas bem, que não precisavas, que podias fazer.

[pause]

E cada uma destas pequenas cedências foi guardada.

Sem nome. Sem data. Sem endereço.

Mas guardada.

[long pause]

Pensa em três relações importantes na tua vida.

Escreve, para cada uma, o nome da pessoa seguido de uma linha única: a conta que está por dizer.

[pause]

Não é para enviar. Não é para confrontar.

É para veres a lista.

[short pause]

Às vezes, o simples ver das contas acumuladas muda a sua temperatura por dentro.

Algumas dissolvem-se apenas por terem sido nomeadas.

Outras ficam. Mas passam a ser visíveis — e o que é visível deixa de atacar por baixo.

[short pause]

O ressentimento não se dissolve por atenção, mas a atenção é o primeiro passo.

Porque enquanto tu chamas paciência ao que é ressentimento, não podes trabalhar com ele.

[pause]

Quando lhe chamas o nome certo, passa a poder ser atendido.

[long pause]

E muitas vezes, o simples acto de nomear um ressentimento antigo, em privado, alivia-o mais do que imaginas.

Como se ele precisasse de ser reconhecido — não necessariamente comunicado, não necessariamente resolvido.

Apenas visto.

[pause]

Tu, finalmente, a ver o que tu mesma guardaste em silêncio.`,
      },
      {
        id: "limite-sagrado-m7c",
        titulo: "M7.C — A vida menor do que podia ser",
        curso: "limite-sagrado",
        texto: `Tu estás a viver uma vida menor do que podia ser.

[pause]

Não porque te falte talento. Não porque te falte sorte. Não porque te falte esforço.

Porque te falta espaço.

[long pause]

Cada não que não disseste transformou-se num pequeno compromisso.

Cada cedência tornou-se uma rotina.

Cada cedência na rotina reduziu o teu espaço para outras coisas.

[pause]

E, ao longo dos anos, o espaço que estava reservado para ti — para o que tu quererias, para quem tu poderias tornar-te — foi ficando cada vez mais pequeno.

[short pause]

Até que um dia, olhas para a tua vida e sentes uma coisa difícil de nomear.

Não é infelicidade, necessariamente.

É estreiteza.

[long pause]

A tua vida cabe bem dentro das expectativas dos outros.

Mas não cabe tu inteira.

[pause]

Há partes tuas que nunca apareceram porque nunca houve espaço.

Há escolhas que nunca fizeste porque estavas ocupada a acomodar outras.

Há versões tuas que não existem ainda, mas existiriam se tivesses tido, ao longo dos anos, um bocadinho mais de recusa e um bocadinho menos de aceitação.

[short pause]

Isto é o custo real dos não-limites.

Não são os dias isolados em que ficaste mais cansada.

É a vida alternativa que não aconteceu.

[long pause]

Esta é a parte mais dolorosa de se olhar com honestidade.

Porque a vida que não aconteceu não pode ser recuperada.

[pause]

Mas há uma boa notícia dentro desta má notícia.

[short pause]

A vida que ainda não aconteceu — os próximos anos, a próxima fase, as próximas escolhas — essa pode ser diferente.

E depende quase exclusivamente de uma coisa.

[pause]

De quanto espaço estás disposta, agora, a reclamar de volta.

[long pause]

Cada não que disseres nos próximos meses é um pedaço de espaço que volta.

Cada recusa silenciosa é um canto da tua vida que reabre.

Cada conversa adiada que finalmente fizeres é tempo que te é devolvido.

[pause]

Não vai acontecer tudo de uma vez.

Mas vai começar a acontecer, a partir do momento em que tu começares a reclamar.

[short pause]

A vida menor é o lugar onde estás. Não é o lugar onde tens de ficar.

[long pause]

Esta semana, escolhe um único sítio onde a tua vida foi ficando mais pequena do que tu quererias.

Pode ser pequeno — um hábito, uma relação, uma tarefa assumida por ti que não é tua.

[pause]

E reclama esse sítio.

Silenciosa. Gradualmente. Sem anúncio.

Mas reclama.

[short pause]

Uma semana, um sítio. Mais nada.

Ao fim de um ano, serão cinquenta e dois sítios reclamados.

[pause]

E a tua vida, sem anúncio público, vai-se expandir.

Até caberes tu inteira.`,
      },
    ],
  },
  {
    id: "curso-limite-sagrado-m8",
    titulo: "Curso Limite Sagrado — Módulo 8 (Aulas A, B, C)",
    descricao: "O Limite como Amor. Fecho do curso.",
    scripts: [
      {
        id: "limite-sagrado-m8a",
        titulo: "M8.A — Dizer não é dizer sim a ti",
        curso: "limite-sagrado",
        texto: `Aprendeste, durante muito tempo, que dizer não era egoísmo.

[pause]

Que uma mulher generosa dá primeiro. Que uma mulher boa encontra sempre forma. Que uma mulher digna não incomoda os outros com as suas recusas.

[long pause]

Por isso, quando dizes não, sentes culpa.

Mesmo quando o não é completamente justificado, a culpa aparece.

[pause]

Pequena, nos casos simples.

Grande, nos casos importantes.

[short pause]

Esta culpa não é moral.

É memória.

[long pause]

É a memória de ter sido ensinada — por palavras, por olhares, por dinâmicas familiares — que o teu não tinha um custo relacional.

[pause]

Esse custo era alguém que ficava chateado. Alguém que se afastava. Alguém que te punha num lugar diferente.

E tu, que precisavas de pertença, calibraste o teu comportamento para não pagar esse custo.

[short pause]

Disseste sim quando querias dizer não. Muitas vezes.

E cada vez que disseste sim, a pertença ficou. Mas tu perdeste um bocadinho.

[long pause]

Há uma reformulação que muda tudo.

[pause]

Dizer não não é egoísmo.

É dizer sim a outra coisa.

[short pause]

Dizer não a um pedido é dizer sim ao teu tempo. Dizer não a uma conversa é dizer sim à tua paz. Dizer não a um compromisso é dizer sim ao que já estava combinado — contigo.

[long pause]

O não e o sim são, afinal, a mesma frase dita de ângulos diferentes.

[pause]

Quando dizes não a uma pessoa, estás a dizer sim a uma outra coisa — seja uma outra pessoa, um projecto teu, um direito ao descanso, uma conversa que não aconteceu ainda.

[short pause]

E essa outra coisa merece o teu sim.

[long pause]

Quando a culpa aparecer depois de um não, há uma pergunta que redefine o que se está a passar.

A que é que eu, com este não, estou a dizer sim?

[pause]

A resposta não é uma lista pronta. É uma só palavra, uma só frase — tua, nesse momento.

Escreve-a, se precisares de a ver fora da cabeça. Uma palavra basta.

Dizer não é, afinal, um acto de amor por alguém.

Por ti.

[long pause]

Quando começas a perceber isto, a culpa por dizer não começa a desaparecer.

Porque já não estás apenas a recusar algo.

Estás a confirmar algo.

[pause]

E nenhuma confirmação merece culpa.

[long pause]

Esta semana, depois de dizeres um não — qualquer não — faz a pergunta.

A que é que eu, agora, estou a dizer sim?

[short pause]

Encontra a resposta concreta.

E guarda-a.

[pause]

Ao longo do tempo, vais acumular uma lista dos teus sins implícitos.

E essa lista é o desenho real da vida que estás a construir.`,
      },
      {
        id: "limite-sagrado-m8b",
        titulo: "M8.B — Relações que sobrevivem à verdade",
        curso: "limite-sagrado",
        texto: `Há uma suspeita antiga na tua cabeça.

[pause]

Se eu começar a dizer não, se eu começar a pôr limites, se eu começar a ser mais eu mesma — as pessoas vão afastar-se.

[short pause]

Esta suspeita é meia verdade.

[long pause]

Algumas pessoas, de facto, vão afastar-se.

Não porque tu tenhas feito algo mal.

Porque a relação que elas tinham contigo dependia da tua adaptação.

[pause]

A relação existia no espaço entre as expectativas delas e a tua disponibilidade constante.

Quando essa disponibilidade muda, a relação deixa de ter onde existir.

[short pause]

Para estas pessoas, tu não és uma pessoa completa com quem elas têm relação.

És uma função que elas ocupam.

[pause]

Quando reclamas limite, elas perdem a função.

E, sem a função, não sabem como se relacionar contigo.

[long pause]

Estas perdas são reais. E, no início, dolorosas.

Mesmo quando a relação não era saudável, o afastamento cria um vazio.

[pause]

O corpo estranha a ausência de pessoas que estavam sempre lá.

Mesmo quando essas pessoas estavam lá de forma que te desgastava.

[short pause]

Isto é normal. O luto é necessário. A adaptação é gradual.

[long pause]

Mas há uma outra parte — mais esperançosa — desta dinâmica.

[pause]

Algumas relações sobrevivem à tua mudança.

E não só sobrevivem — florescem.

[short pause]

Há pessoas à tua volta, agora, que estão à espera de te encontrarem inteira.

[pause]

Elas intuem que tu tens escondido partes tuas. Sentem a adaptação mesmo quando tu pensas que é imperceptível. E esperam, em silêncio, pela versão mais completa de ti.

[short pause]

Quando essa versão começa a aparecer, estas pessoas recebem-na com alívio.

Não com estranheza.

[long pause]

São as pessoas que permanecem, mesmo quando tu mudas.

E estas pessoas, apesar de menos numerosas, são incomparavelmente mais valiosas do que as que dependiam da tua adaptação.

[pause]

Reconhecê-las, a partir de um certo ponto da vida, torna-se claro.

As que recuam quando tu avanças, perdem-se pelo caminho.

As que te acompanham, mesmo quando tu mudas de direcção, são família escolhida.

[long pause]

Pensa em duas ou três pessoas na tua vida que já viram versões tuas diferentes ao longo dos anos.

Que aceitaram mudanças tuas sem drama.

Que te amam agora diferente do que te amavam há dez anos — mas amam tal como és agora.

[pause]

Estas pessoas merecem o teu cuidado explícito.

Merecem uma mensagem a dizer-lhes que tu reconheces que elas ficaram.

[short pause]

Não é cerimónia. É economia relacional.

[pause]

Tu vais precisar destas pessoas ao longo da vida.

E elas, provavelmente, vão precisar de ti de forma equivalente.

[long pause]

As relações que sobrevivem à tua verdade não são as que exigem menos de ti.

São as que te permitem dar o que é teu — e recusar o que não é — sem pôr a relação em risco.

[pause]

Estas relações existem.

E vão continuar, independentemente dos limites que precisares de pôr.`,
      },
      {
        id: "limite-sagrado-m8c",
        titulo: "M8.C — A mulher com limites",
        curso: "limite-sagrado",
        texto: `Imagina, por um momento, a mulher que vais ser daqui a cinco anos.

[pause]

Uma mulher que aprendeu, a pouco e pouco, a recusar.

A pausar antes de responder. A ouvir o corpo antes da boca. A dar — quando dá — por escolha.

[long pause]

Esta mulher tem uma qualidade específica.

Não é dureza. Não é frieza. Não é distância.

[pause]

É uma presença inteira.

[short pause]

Ela entra numa sala e a sala ajusta-se. Não porque seja dominante — porque é precisa.

As pessoas respondem-lhe com mais cuidado. Não por ela exigir — porque ela ocupa o seu lugar sem pedir licença.

[pause]

E os pedidos que ela aceita, aceita inteiramente.

Os nãos que ela dá, dá com clareza.

[long pause]

Esta mulher não é uma versão mais dura de ti.

É uma versão mais completa.

[pause]

Porque no centro da mulher com limites há uma coisa importante que tu, agora, talvez não tenhas em proporção suficiente.

[short pause]

Há uma relação respeitosa consigo mesma.

[long pause]

Os limites não são muralhas contra os outros.

São a linha que define onde a tua identidade começa e termina.

[pause]

Sem esta linha, a tua identidade dilui-se no que os outros esperam.

Com esta linha, tu existes como pessoa distinta — capaz de relação real, precisamente porque é uma pessoa.

[short pause]

A mulher sem limites não consegue ter relação plena.

Porque o que ela oferece não é ela — é uma adaptação dela.

[pause]

A mulher com limites pode oferecer-se inteira.

Porque ela existe antes da oferta.

[long pause]

Este é o fim deste curso.

Mas é o início de uma prática.

[pause]

Dizer não. Ouvir o corpo. Pausar antes de responder. Recusar quando é preciso. Dar quando é escolha.

Uma vez. Outra vez. Ao longo dos próximos anos.

[short pause]

Não vai ser linear. Algumas semanas, vais recuar. Algumas, vais avançar mais do que esperavas.

[pause]

O que importa não é a velocidade.

É a direcção.

[long pause]

A direcção é para onde a mulher com limites vive.

Para um lugar onde o teu sim tem peso e o teu não tem paz.

Para uma vida que é tua.

[pause]

E quando chegares lá, reconhecerás o lugar.

Não pelos limites que puseste.

Por ti — finalmente inteira, finalmente em casa.

[long pause]

O limite é sagrado porque é a forma do teu sagrado.

Sem ele, tu dissolves-te.

Com ele, tu és.`,
      },
    ],
  },
  {
    id: "curso-sangue-e-seda-m1",
    titulo: "Curso Sangue e Seda — Módulo 1 (Aulas A, B, C)",
    descricao: "O Sangue como Linguagem. Material de áudio para alunos.",
    scripts: [
      {
        id: "sangue-e-seda-m1a",
        titulo: "M1.A — O ciclo que te ensinaram a esconder",
        curso: "sangue-e-seda",
        texto: `Qual foi a primeira palavra que ouviste para nomear o teu ciclo menstrual?

[pause]

Não a palavra técnica da escola. A palavra que se usava em casa.

Talvez fosse "aqueles dias". Talvez fosse "coisas de mulheres". Talvez fosse um silêncio, e tu nem sabias como perguntar.

[long pause]

Desde muito cedo aprendeste que havia uma coisa que acontecia ao teu corpo e que tinha regras.

Regras de esconder.

[pause]

O penso era embrulhado num lenço de papel antes de ir para o lixo. A dor era engolida com uma bolsa de água quente e um sorriso. O mau humor era chamado mau humor — não dor hormonal real, não parte de um ciclo que o corpo faz há milhares de anos.

[short pause]

E em público, jamais se mencionava.

[long pause]

Esta discrição foi-te ensinada como delicadeza.

Na verdade, era outra coisa.

[pause]

Era a continuação de uma longa tradição em que o corpo feminino, quando fazia o que o corpo feminino sempre fez, era tratado como problema a gerir.

[short pause]

As mulheres da tua linhagem aprenderam a esconder-se delas mesmas em proporção directa à visibilidade do ciclo.

E ensinaram-te a fazer o mesmo.

[long pause]

Há uma sensação específica, para muitas mulheres, quando chegam os dias de sangue.

Uma vontade de desaparecer.

Não de descansar — de desaparecer.

[pause]

Como se o corpo estivesse a fazer uma coisa inconveniente e a melhor resposta fosse tornar-te invisível enquanto ela se passa.

[short pause]

Esta vontade não é hormonal. É cultural.

Foi-te transmitida por gerações de mulheres que precisavam de continuar a funcionar mesmo quando o corpo pedia pausa.

[long pause]

E tu, hoje, aos trinta, quarenta, cinquenta anos, ainda carregas a regra.

Ainda escondes o penso. Ainda finges que não estás em dor. Ainda te desculpas por precisares de parar.

[pause]

Mas o ciclo não é problema.

O ciclo é informação.

[short pause]

Cada fase, cada subida hormonal, cada descida, cada dia de sangue — tudo isto é um mapa de energia que o teu corpo faz.

[pause]

Se soubesses lê-lo, organizavas a tua vida de forma diferente.

Mas não te ensinaram a lê-lo.

Ensinaram-te a escondê-lo.

[long pause]

Durante um mês inteiro, faz uma coisa nova.

Pega num caderno pequeno.

Cada dia, escreve uma palavra. Uma só. Que diga como o teu corpo está hoje.

[pause]

Cansado. Forte. Sensível. Agitado. Calmo. Furioso. Disponível.

[short pause]

Marca também — sem rodeios — os dias de sangue. De que dia a que dia.

No final do mês, lê a lista.

[pause]

Vais ver um padrão que nunca ninguém te ensinou a ver.

O teu ciclo tem uma música.

E a música tem, afinal, coerência.

[long pause]

Durante séculos, as mulheres chamaram a isto lunática — porque seguia a lua.

Não era loucura.

Era sabedoria corporal que uma sociedade apressada não sabe aceitar.

[pause]

E que tu, agora, podes começar a escutar.`,
      },
      {
        id: "sangue-e-seda-m1b",
        titulo: "M1.B — A dor que tu chamaste normal",
        curso: "sangue-e-seda",
        texto: `Há uma dor no teu corpo que tu chamas normal.

[pause]

A dor antes do sangue. A dor durante o sangue. A dor nas costas que acompanha o ciclo. A dor de cabeça hormonal.

Chamas normal porque se repete há anos.

[short pause]

E porque toda a gente à tua volta chama normal.

[long pause]

A tua mãe também tinha estas dores. A tua avó também. A tua irmã, a tua prima, a tua melhor amiga.

Todas tiveram. Todas engoliram comprimidos. Todas continuaram a funcionar.

[pause]

Então aprendeste que esta dor era parte de ser mulher.

Como quem aprende que chover no inverno faz parte do inverno.

[short pause]

Dor como estação.

[long pause]

Mas há algo desconfortável de admitir.

Nem toda a dor de ciclo é inevitável. Nem toda a dor é proporcional ao que está a acontecer biologicamente.

[pause]

Muitas mulheres sofrem dores intensas que, se fossem investigadas com atenção médica séria, teriam causa específica — endometriose, adenomiose, quistos, fibromialgia hormonal, desequilíbrios tiroideus.

[short pause]

Condições que têm nome. Que têm tratamento. Que não deviam ser invisíveis.

[pause]

Mas como as mulheres foram ensinadas a não se queixar, a não dramatizar, a não valorizar a sua própria dor — estas condições passam décadas sem diagnóstico.

[long pause]

A tua avó talvez tivesse endometriose.

A tua mãe talvez tenha tido.

E tu, talvez, também tenhas.

Nenhuma foi investigada. Todas chamaram dor normal ao que era dor de diagnóstico pendente.

[pause]

Isto é herança.

Herança de silêncio médico que atravessa gerações de mulheres.

[short pause]

E não é culpa de ninguém em particular.

É produto de uma medicina que foi desenhada, durante muito tempo, com o corpo masculino como padrão — e que só recentemente começa a prestar atenção séria às condições específicas do corpo feminino.

[long pause]

A tua dor pode ser normal.

Ou pode ser sinal de algo específico que merece investigação.

[pause]

A única forma de saber é ser honesta sobre a intensidade real do que sentes.

[short pause]

Não a versão que tu contas às amigas — "estou com cólicas, nada de mais".

A versão verdadeira — o que tu sentes sozinha na casa de banho, no momento em que ninguém te está a ver.

[long pause]

Esta semana, escreve num papel: qual é a pior dor menstrual que já tive?

Descreve-a. Com detalhes corporais. Onde, como, quanto tempo, o que te impediu de fazer.

[pause]

Lê o que escreveste.

Se a descrição te parece excessiva para ter sido chamada de normal por ti durante anos — então não era normal.

[short pause]

Era algo que merecia ser olhado, nomeado, medicado ou investigado.

[pause]

Se nunca fizeste uma ecografia ginecológica detalhada, ou se a última foi há mais de três anos, pede uma.

Não como drama. Como direito.

[long pause]

A dor das mulheres foi invisibilizada durante séculos.

Tu, neste século, não tens de continuar a tradição.`,
      },
      {
        id: "sangue-e-seda-m1c",
        titulo: "M1.C — O que o sangue diz que a boca não diz",
        curso: "sangue-e-seda",
        texto: `Nos dias antes do sangue, dizes coisas que não dirias nos outros dias.

[pause]

Às pessoas à tua volta, pode parecer irracional. Pode parecer hormonal. Pode parecer exagero.

Mas se olhares com honestidade, quase nunca é irracional.

[short pause]

Quase sempre é — simplesmente — verdadeiro.

[long pause]

O que acontece nos dias antes do sangue é que o filtro social afrouxa.

O filtro que normalmente mantém as frases diplomáticas. O filtro que transforma o cansaço em amabilidade. O filtro que traduz "isto está a magoar-me" em "não faz mal".

[pause]

Este filtro é trabalho. Energia. Esforço constante.

E o corpo, quando entra na fase pré-menstrual, desliga-o parcialmente — para poupar recursos.

[short pause]

O que resta é a verdade, desprotegida.

[long pause]

Durante séculos, esta verdade foi chamada histeria.

Foi medicada. Foi silenciada. Foi tratada como anomalia.

[pause]

Quando, na realidade, é diagnóstico.

[short pause]

As coisas que tu dizes nos dias pré-menstruais são, na sua grande maioria, verdade adiada.

Verdade que tu andaste a engolir nas outras três semanas.

[long pause]

Se olhares para o que disseste no último período difícil — não com vergonha, com atenção — vais ver que não foste injusta.

Foste directa.

[pause]

Disseste o que viste e ninguém ouvia. Nomeaste o que sentias e toda a gente fingia que não era nada. Recusaste o que outras vezes terias aceitado em silêncio.

[short pause]

E a outra pessoa, assustada com a tua clareza súbita, chamou-te hormonal.

Como se hormonal fosse menos verdadeiro.

[long pause]

A verdade que sai dos dias antes do sangue é filha da observação acumulada das semanas anteriores.

É apenas dita sem o filtro que normalmente a amortece.

[pause]

Isto não significa que toda a palavra pré-menstrual é perfeita.

Algumas são mais ásperas do que precisariam. Algumas magoam mais do que querias.

[short pause]

Mas o conteúdo, na grande maioria dos casos, não é inventado.

É apenas libertado.

[long pause]

Observa, neste ciclo, o que o teu corpo te puxa a dizer nos dias antes do sangue.

Escreve essas frases num caderno.

[pause]

Não para as comunicar. Só para as ver.

[short pause]

E depois, dias depois, quando o sangue tiver passado e o filtro tiver voltado — lê o que escreveste.

[pause]

Com calma. Sem autocrítica.

[short pause]

Pergunta-te: o que disse era verdadeiro?

[pause]

Na maioria das vezes, a resposta vai ser sim.

E a parte verdadeira, agora que podes escolher, pode ser dita de forma mais suave, com as palavras medidas, no momento certo.

[long pause]

Mas dita.

[pause]

Porque se o corpo esteve a empurrar para fora aquela verdade com tanta força que rasgou o filtro, então era mesmo para sair.

[short pause]

A fase pré-menstrual é um editor intransigente.

Corta o desnecessário e revela o essencial.

[long pause]

Usa-o a teu favor.

Não como desculpa. Como diagnóstico do que, no resto do mês, está por dizer.`,
      },
    ],
  },
  {
    id: "curso-sangue-e-seda-m2",
    titulo: "Curso Sangue e Seda — Módulo 2 (Aulas A, B, C)",
    descricao: "A Linha Materna. Material de áudio para alunos.",
    scripts: [
      {
        id: "sangue-e-seda-m2a",
        titulo: "M2.A — As mulheres que vieram antes do teu útero",
        curso: "sangue-e-seda",
        texto: `Sabias que cada óvulo que hoje habita o teu corpo já habitou o corpo da tua mãe?

[pause]

Que ela já os carregava quando ainda era feto no corpo da tua avó?

[long pause]

Três gerações, ao mesmo tempo, num único corpo.

A tua avó, grávida da tua mãe.

A tua mãe, dentro da tua avó, já com o que seria a matéria-prima de ti.

[pause]

Tu és, literalmente, feita de mulheres que nunca conheceste.

[short pause]

Esta não é uma metáfora poética.

É biologia.

[long pause]

A ciência deu-lhe um nome nas últimas décadas: herança epigenética.

Significa que as experiências que as tuas antepassadas tiveram — traumas, fomes, perdas, alegrias, desregulações hormonais — marcaram o material genético que te formou.

[pause]

Não alteraram o ADN.

Alteraram a forma como o ADN se expressa.

[short pause]

E essa alteração passou para a tua mãe.

E dela, para ti.

[long pause]

Tu podes ter inquietações que não são exactamente tuas.

Sensações de fome residual ainda que sempre tenhas tido comida. Medos de abandono mesmo sem experiência pessoal de abandono. Vigilância excessiva sem razão biográfica clara.

[pause]

Isto não significa que estás condenada a reviver o passado delas.

Mas significa que, às vezes, o que sentes não começou em ti.

E isso, estranhamente, é um alívio.

[long pause]

Porque se parte do teu peso emocional vem de séculos de mulheres que carregaram o que não podiam largar, então o teu cansaço não é fraqueza tua.

É herança.

[pause]

Herança com nome. Herança com história. Herança com início antes de ti.

[short pause]

E por ser herança, pode ser revisitada. Nomeada. Trabalhada.

Não em vida única — em gestos pequenos ao longo dos anos.

[long pause]

Pensa numa mulher da tua linhagem que já partiu. Pode ser uma avó, uma bisavó, uma tia-avó.

Alguém de quem tu sabes alguma coisa, por mais vaga que seja.

[pause]

Escreve num papel, em duas linhas: o que sei da vida dela, o que imagino que ela sentiu e nunca pôde dizer.

[short pause]

Guarda o papel.

Algumas das coisas que ela não pôde dizer, tu é que agora as vais conseguir.

[pause]

Não porque lhe pertencessem — mas porque passaram por ti enquanto estavas a ser feita.

E agora fazem parte do que tu podes finalmente transformar.

[long pause]

A linha materna não é metáfora.

É material.

E cada mulher consciente, na sua geração, pode interromper padrões que vêm de longe.

[pause]

Não para todas as que vêm antes.

Para todas as que vêm depois.`,
      },
      {
        id: "sangue-e-seda-m2b",
        titulo: "M2.B — O que a tua mãe não te contou sobre o corpo dela",
        curso: "sangue-e-seda",
        texto: `Há coisas sobre o corpo da tua mãe que ela nunca te contou.

[pause]

Não porque te quisesse esconder.

Porque, na geração dela, estas coisas não se diziam.

[long pause]

Talvez ela tenha tido dores menstruais severas durante décadas, sem investigação médica.

Talvez tenha tido um aborto espontâneo — ou mais do que um — e enterrou-os sozinha, sem ritual, sem palavras.

[pause]

Talvez tenha tido um parto traumático que a marcou e sobre o qual ninguém lhe perguntou, depois, como ela estava.

Talvez tenha atravessado a menopausa sem informação, sem acompanhamento, sem saber distinguir o normal do que merecia atenção.

[short pause]

Talvez tenha tido uma relação difícil com o próprio corpo que nunca soube como nomear.

[long pause]

Se olhares com atenção, a mulher que te pariu provavelmente carregou várias destas coisas.

E carregou-as sozinha.

[pause]

Porque quando ela tinha a tua idade, não havia linguagem pública para o que acontecia ao corpo feminino fora do consultório.

As amigas não falavam disto. As irmãs escondiam. As mães daquela geração tinham ainda menos ferramentas.

[short pause]

A tua mãe herdou o silêncio. E, em grande parte, transmitiu-o.

Não por escolha consciente — por falta de modelo.

[long pause]

Isto tem consequências para ti.

[pause]

Há coisas que te acontecem no corpo — dores, mudanças, inquietações — sobre as quais tu nem sabes se podes perguntar à tua mãe.

Porque ela nunca normalizou conversar sobre isto.

[short pause]

E tu, por respeito ou por receio, também não abres a porta.

[pause]

O silêncio continua.

[long pause]

Mas há uma forma — para algumas mulheres — de começar a desmontar isto.

Não em confrontação. Em curiosidade.

[pause]

Se a tua mãe ainda está viva, há perguntas que podes fazer-lhe num jantar tranquilo, numa tarde sem pressa.

Não perguntas dramáticas. Perguntas comuns que, na verdade, nunca foram feitas.

[short pause]

"Como é que foi o teu primeiro período?"

"Tiveste cólicas muito fortes ao longo da vida?"

"Como é que era a menopausa para ti quando começou?"

[pause]

A maioria das mães, quando tais perguntas são feitas sem drama, responde.

Respondem com espanto pela pergunta. Respondem a hesitar, mas respondem.

[short pause]

E nessas respostas, tu recebes informação que te pertence.

Informação sobre o teu próprio corpo, via a mulher que o gerou.

[long pause]

Se a tua mãe já partiu, há outras formas.

Tias-avós. Irmãs mais velhas. Mulheres da família que conheceram a tua mãe quando ela estava no corpo que hoje tu herdas.

[pause]

Ou, se ninguém estiver disponível, uma carta para a tua mãe imaginária.

Escrita. Perguntando-lhe o que ela nunca te disse.

[short pause]

A resposta vai aparecer dentro de ti — sob a forma de intuição, de memória inesperada, de uma frase que sobe sem aviso.

[pause]

Porque o corpo que ela te deu ainda guarda parte do que ela sabia.

E, com paciência, podes aceder a isso.

[long pause]

A tua mãe disse-te pouco sobre o corpo.

Mas o corpo que ela te deu — esse — guarda a informação toda.

E é teu direito recuperá-la.`,
      },
      {
        id: "sangue-e-seda-m2c",
        titulo: "M2.C — As avós que não tiveram escolha",
        curso: "sangue-e-seda",
        texto: `As mulheres que vieram antes da tua mãe viveram num tempo em que o corpo feminino não era objecto de escolha.

[pause]

A tua avó, talvez.

A tua bisavó, quase certamente.

[long pause]

Engravidaram quando engravidaram. Tiveram os filhos que tiveram. Ficaram com as dores que ficaram. Envelheceram como podiam.

[pause]

A ideia de "escolher" como viver no corpo — quando engravidar, quando não, se fazer sexo por prazer, se usar ou não contracepção — era, para a maioria delas, abstracta ou proibida.

[short pause]

O corpo delas era terreno de obrigação.

Obrigação para com o marido. Obrigação para com a família. Obrigação para com uma ordem social em que a autonomia corporal de uma mulher era quase inexistente.

[long pause]

Quando tu, hoje, fazes escolhas sobre o teu corpo — tomar a pílula, adiar a maternidade, recusar um parto com intervenção excessiva, procurar prazer por ti mesma — estás a fazer algo que as tuas antepassadas não tiveram direito de fazer.

[pause]

Isto é privilégio histórico raro.

[short pause]

E tem um peso específico.

[pause]

Porque, quando tu fazes uma escolha corporal que te favorece, há uma sombra emocional que, às vezes, chega junto.

Uma culpa vaga. Uma tristeza sem endereço.

[short pause]

Talvez sintas isto quando decides não ter filhos e alguém te diz "a tua mãe teria adorado ser avó". Talvez sintas quando interrompes uma gravidez. Talvez sintas quando recusas um parto natural que te impuseram como ideal. Talvez sintas quando escolhes um parceiro que a tua avó teria julgado.

[long pause]

Esta culpa vaga, na maior parte das vezes, não é tua.

É ecoada.

[pause]

É a memória das mulheres anteriores a ti que não tiveram aquela escolha e que, por isso, têm dentro de ti uma espécie de voz silenciosa que duvida.

[short pause]

Elas não te estão a julgar — não têm, já, capacidade de julgar.

Mas as suas vidas, atravessadas por renúncia, deixaram um eco.

E esse eco, em ti, veste-se de culpa.

[long pause]

Reconhecer isto é libertador.

[pause]

A culpa que sentes por escolher o que elas não puderam escolher não é proporcional a nada que tenhas feito de mal.

É proporcional ao tamanho da liberdade que estás a exercer.

[short pause]

Quanto maior a liberdade, maior a sombra da impossibilidade anterior.

[pause]

E isto é paradoxo — mas é também dádiva.

[long pause]

Porque se tu, nesta geração, conseguires fazer as escolhas que te cabem sem seres consumida pela culpa herdada, estás a abrir caminho.

Não só para ti.

Para as filhas, sobrinhas, afilhadas, alunas que vêm depois.

[pause]

Para as mulheres que vão viver no teu rasto e que poderão fazer, um dia, as mesmas escolhas com menos culpa do que tu.

[short pause]

Porque tu, tendo ido à frente, diluíste o eco.

[long pause]

Pensa nas escolhas corporais que já fizeste ao longo da tua vida que as tuas antepassadas não teriam podido fazer.

Lista três.

[pause]

Depois, ao lado de cada uma, escreve a quem da tua linhagem isso teria sido impossível.

[short pause]

Esta consciência — não celebração nem lamento, apenas consciência — transforma a escolha em acto histórico.

[pause]

E transforma a culpa vaga em reconhecimento de dívida.

[short pause]

Mas a dívida não é para pagar renunciando ao que conquistaste.

É para pagar exercendo o direito com mais plenitude — e deixando o rasto para quem vem depois.

[long pause]

As tuas avós não tiveram escolha.

Tu tens.

A forma mais fiel de as honrar não é renunciar ao que elas não puderam ter.

É viver inteiramente o que elas não puderam viver.`,
      },
    ],
  },
  {
    id: "curso-sangue-e-seda-m3",
    titulo: "Curso Sangue e Seda — Módulo 3 (Aulas A, B, C)",
    descricao: "O Corpo como Arquivo. Material de áudio para alunos.",
    scripts: [
      {
        id: "sangue-e-seda-m3a",
        titulo: "M3.A — A memória do corpo é mais antiga que tu",
        curso: "sangue-e-seda",
        texto: `Há sensações no teu corpo que não têm origem nesta vida.

[pause]

Medo que aparece sem razão. Vigilância que nunca desliga. Tensão que não se dissolve com descanso.

Procuras a causa na tua biografia e não encontras correspondência proporcional.

[long pause]

Isto não é imaginação.

O teu corpo tem memória que precede a tua memória consciente.

[pause]

Parte desta memória é individual — registos corporais dos teus primeiros anos, antes de teres linguagem para os nomear.

Parte é mais antiga — transmitida por gerações de corpos que te antecederam.

[short pause]

O sistema nervoso não se limita a registar o que tu vives.

Regista também o que os corpos anteriores ao teu precisaram de aprender para sobreviver.

[long pause]

Uma mulher cuja avó viveu a guerra pode ter reflexos de alerta que não se explicam pela sua própria vida.

Uma mulher cuja bisavó foi empobrecida pode ter ansiedade financeira que excede em muito a sua situação real.

Uma mulher cuja linhagem atravessou violência pode reagir, sem razão aparente, a situações que apenas evocam vagamente essa história.

[pause]

Estas reacções não são patológicas.

São adaptativas.

[short pause]

Foram úteis para quem esteve antes de ti.

Para ti, podem ser desproporcionais.

[long pause]

Reconhecer isto muda a forma como olhas para as tuas próprias reacções.

[pause]

Quando o teu corpo reage com uma intensidade que a situação presente não justifica, não tens de te julgar como exagerada.

Podes perguntar, em vez disso, onde começou isto.

[short pause]

Não para encontrar resposta exacta — muitas vezes não há.

Mas para reconhecer que a intensidade pode não ser proporcional à situação actual porque a memória que está a responder é mais antiga do que a situação.

[long pause]

Quando tu falas com o teu corpo a partir deste entendimento, muitas coisas mudam.

[pause]

A vergonha por reagir demais diminui.

A raiva contra ti mesma por ser "demasiado sensível" afrouxa.

E abre-se espaço para uma conversa nova entre ti e o que te habita.

[short pause]

Uma conversa onde tu não tentas expulsar as reacções.

Tentas, apenas, compreender a origem delas.

[long pause]

Faz uma lista curta. Três reacções corporais tuas que te parecem desproporcionais às situações que as provocam.

[pause]

Ao lado de cada uma, escreve o que sabes sobre a vida das mulheres que te antecederam — avós, bisavós, tias-avós — que pudesse ter gerado essa mesma reacção nelas.

[short pause]

Não precisas de certeza. Podes escrever "talvez".

Mas olha para a lista inteira.

[pause]

Provavelmente vais encontrar correspondências que nunca tinhas feito.

[long pause]

O teu corpo é um arquivo.

E muitas das tuas reacções aparentemente inexplicáveis começam a fazer sentido quando entendes que o arquivo tem capítulos que vêm de antes do teu nascimento.

[pause]

Não para te resignares a elas.

Mas para parares de as tratar como defeito teu — quando são, na verdade, herança.`,
      },
      {
        id: "sangue-e-seda-m3b",
        titulo: "M3.B — Sintomas sem nome",
        curso: "sangue-e-seda",
        texto: `Há sintomas no teu corpo para os quais nenhum médico te deu nome.

[pause]

Cansaço crónico que não aparece em exames. Dores migratórias que mudam de sítio. Inflamações pontuais que vêm e vão. Desequilíbrios hormonais que ficam no limite do normal mas que tu sabes que não são só tua imaginação.

[long pause]

Fazes análises. Os resultados vêm "dentro do normal".

O médico diz que está tudo bem.

Tu sais da consulta com a sensação estranha de teres sido invalidada — porque tu sabes que não está tudo bem, mesmo que nenhum exame o prove.

[pause]

Isto acontece muito às mulheres.

[short pause]

Mais do que aos homens.

[long pause]

Uma das razões é que muita investigação médica, durante décadas, foi feita com o corpo masculino como padrão.

Os "normais" dos exames foram calibrados em populações maioritariamente masculinas.

O que nelas é normal pode não ser neles.

[pause]

Outra razão é que o corpo feminino tem variações cíclicas complexas que os exames pontuais não captam.

Tu fazes uma análise hormonal num dia qualquer. O resultado reflecte o estado hormonal daquele dia — não do ciclo inteiro.

[short pause]

Uma terceira razão, mais difícil de admitir, é cultural.

[pause]

Médicos, por mais bem-intencionados que sejam, ainda têm viés treinado de subestimar o relato subjectivo das mulheres.

As queixas femininas são ouvidas com filtro. "Estás a trabalhar demais." "É stress." "É idade."

[short pause]

Estas respostas, por vezes, são verdadeiras.

Por vezes, são tampa para sintomas que mereciam investigação mais profunda.

[long pause]

Tu, como paciente, precisas de aprender a distinguir as duas coisas.

[pause]

Se um médico te desvaloriza um sintoma e tu saíste da consulta com a sensação de não teres sido levada a sério, há algo importante a fazer.

Pedir segunda opinião.

[short pause]

Não por desconfiança do primeiro médico.

Por respeito ao teu próprio corpo.

[pause]

A medicina, como qualquer profissão, tem variação de qualidade e atenção.

Um médico que te desvaloriza não tem, necessariamente, razão.

[long pause]

Se tens sintomas persistentes que foram sistematicamente desvalorizados, faz uma coisa específica.

Escreve um diário corporal durante um mês inteiro.

Cada dia, anota: o que senti, em que parte do corpo, quanto tempo durou, em que fase do ciclo estava.

[pause]

No fim do mês, lê o diário inteiro.

Vais encontrar padrões que um exame pontual nunca podia ter detectado.

[short pause]

Leva o diário à próxima consulta.

Apresenta-o como dado clínico.

[pause]

Um médico sério — e existem — vai valorizar esta informação.

Se não valorizar, muda de médico.

[long pause]

O teu corpo tem sintomas que merecem nome.

E tu tens o direito de insistir até encontrares um profissional que te ajude a encontrar esse nome — sem te fazer sentir que és exagerada.

[pause]

A paciência para investigar é investimento.

O tempo que ganhas agora, a pedir uma segunda opinião ou a mudar de médico, é tempo que poupas depois em anos de sintomas não explicados.

[long pause]

As mulheres têm sido ensinadas a suportar.

Mas suportar não é o mesmo que investigar.

[pause]

E muitas vezes, o suporte silencioso transforma-se em condição crónica que, se tivesse sido investigada a tempo, seria tratável.

[short pause]

A tua saúde merece investigação — mesmo quando o primeiro médico te diz que não.`,
      },
      {
        id: "sangue-e-seda-m3c",
        titulo: "M3.C — O que o corpo sabe sobre a tua história",
        curso: "sangue-e-seda",
        texto: `Pensa numa história difícil que tu viveste e que preferirias esquecer.

[pause]

Talvez uma separação. Um luto. Uma traição. Uma rejeição. Um momento em que te sentiste profundamente só.

[long pause]

A tua mente, ao longo dos anos, foi arrumando essa história.

Arrumou-a num sítio onde não incomoda tanto. Deu-lhe uma narrativa que permite funcionar. Suavizou algumas partes.

[pause]

Mas o teu corpo não arrumou.

[short pause]

O corpo guarda a história original. Não a versão editada. A versão crua, tal como aconteceu no momento.

[long pause]

Por isso, às vezes, o teu corpo reage de forma que a tua mente não compreende.

[pause]

Passas por um sítio que te recorda vagamente o passado e o peito contrai.

Ouves uma música que tocava na altura e algo no estômago aperta.

Vês uma pessoa que se parece com alguém que te magoou e a respiração fica mais curta por segundos.

[short pause]

A tua mente diz: aquilo foi há anos, já não interessa.

O teu corpo, em dois segundos, prova que ainda interessa.

[long pause]

Isto não é patologia.

É arquivo.

[pause]

O corpo guarda o que a mente preferiu esquecer porque guardar é função dele.

Não guarda por maldade. Não guarda por apego. Guarda porque foi treinado, ao longo da evolução, a lembrar-se do que pode voltar a ameaçar — para te proteger.

[short pause]

A questão não é fazer o corpo esquecer.

É trazer para consciência o que ele ainda guarda — não em meditação, em registo simples, depois.

[long pause]

E o registo simples é mais eficaz do que parece.

[pause]

Porque o que liberta o arquivo corporal não é introspecção dirigida em tempo real.

É padrão visível ao longo do tempo.

[short pause]

E padrão só aparece quando há dados a olhar.

[long pause]

Esta semana, tem ao alcance um caderno pequeno.

[pause]

Pode ser uma agenda. Um bloco de notas no telemóvel. Uma folha dobrada na carteira.

Não importa o suporte. Importa estar acessível.

[short pause]

E, sempre que reparares que o teu corpo reagiu a alguma coisa sem causa presente óbvia, escreves uma única linha.

[pause]

Não no momento.

Depois.

[long pause]

Quando estiveres em casa, ou ao fim do dia, escreve apenas três coisas:

[pause]

O que estavas a fazer.

Que reacção apareceu no corpo — e onde.

E uma palavra ou frase, se te ocorrer, sobre a que cheirou aquela reacção.

[short pause]

Por exemplo:

"Estava a passar pelo café da minha rua. Peito apertou. Cheirou à conversa com a minha mãe há dois meses."

"Estava a ouvir uma música no carro. Estômago contraiu. Cheirou ao verão antes do divórcio."

"Estava numa reunião com X. Garganta fechou. Cheirou a uma chefia antiga."

[long pause]

Três linhas por entrada. Não mais.

[pause]

Não tens de saber porquê. Não tens de elaborar. Não tens de chorar.

[short pause]

Só registar.

[long pause]

Ao fim de duas ou três semanas, lê todas as entradas em sequência.

[pause]

Vais reparar em padrões que sozinhos eram invisíveis.

[short pause]

Os mesmos cheiros emocionais aparecem em sítios diferentes.

A mesma reacção corporal repete-se em contextos aparentemente sem ligação.

Há uma ou duas memórias-base que estão a operar em vinte situações diferentes, sem que tu o soubesses.

[long pause]

Este mapa, escrito em letra tua, faz uma coisa que a meditação interior não faz.

[pause]

Mostra-te, em factos, o que o teu corpo carrega.

[short pause]

E o que é visto em factos perde, devagar, o poder de operar invisivelmente.

[long pause]

O corpo guarda para te proteger.

Quando tu, em letra escrita, mostras ao corpo que já viste o que ele guarda, ele pode, finalmente, largar parte da vigilância.

[pause]

Não pelo mistério da introspecção.

Pela clareza simples do que está, finalmente, anotado num caderno.`,
      },
    ],
  },
  {
    id: "curso-sangue-e-seda-m4",
    titulo: "Curso Sangue e Seda — Módulo 4 (Aulas A, B, C)",
    descricao: "A Primeira Vez. Material de áudio para alunos.",
    scripts: [
      {
        id: "sangue-e-seda-m4a",
        titulo: "M4.A — A menarca sem testemunho",
        curso: "sangue-e-seda",
        texto: `Lembras-te do dia em que sangraste pela primeira vez?

[pause]

Da hora. Do sítio. De quem estava por perto. Do que te disseram — ou do que não te foi dito.

[long pause]

A maioria das mulheres não se lembra com clareza cerimonial.

Lembra-se do susto. Da roupa. Do encontro com aquela cor que o corpo nunca tinha mostrado.

E depois, lembra-se — quase sempre — de estar sozinha.

[pause]

Talvez a mãe tenha aparecido com um penso e uma frase curta.

Talvez não tenha havido frase nenhuma.

Talvez tenhas tido de perguntar e o silêncio da resposta foi mais pesado do que qualquer explicação.

[short pause]

A menarca — a primeira menstruação — é, em muitas culturas, um rito de passagem.

Na tua cultura, para a maioria, não é.

[pause]

Foi um incómodo a gerir em privado.

Uma transição sem testemunhas.

[long pause]

O corpo regista isto.

Regista que o seu primeiro sangue não foi celebrado. Que foi escondido. Que foi coisa a resolver depressa.

E a partir dali, toda a relação futura com o ciclo carrega este tom.

[pause]

Não é coincidência que muitas mulheres, ao longo da vida, tratem a menstruação como inconveniência privada.

Foi assim que começou.

[short pause]

Sem testemunho. Sem ritual. Sem palavra.

[long pause]

Algumas mulheres conseguem, anos depois, fazer uma reparação simbólica da menarca.

Não é drama. Não é teatro.

É uma atenção consciente, retroactiva, a um momento que foi deixado sem atenção.

[pause]

Podes escrever uma carta, em privado, à rapariga que eras no dia em que sangraste pela primeira vez.

Dizer-lhe o que ela precisaria de ouvir na altura e ninguém lhe disse.

[short pause]

Que o que está a acontecer é normal. Que ela não está a fazer nada de mal. Que isto é o corpo a entrar numa fase antiga e respeitada. Que há milhões de mulheres antes dela que passaram por aqui.

[pause]

Que ela pode ficar em paz.

[long pause]

Esta carta não é para ser lida em voz alta a ninguém.

É para ser escrita e guardada.

[pause]

O que acontece quando escreves é surpreendente.

A menarca que não foi testemunhada começa a ser testemunhada agora, décadas depois, por ti mesma.

[short pause]

E o corpo regista esta atenção retroactiva.

[pause]

Não como ilusão. Como atenção real. Porque o corpo não distingue, emocionalmente, entre a atenção dada naquele momento e a atenção dada agora, deliberadamente.

[long pause]

As mulheres que fazem este gesto descrevem uma mudança subtil na sua relação com o ciclo.

Um respeito novo pelos próprios dias de sangue. Uma vontade menor de os esconder. Uma atenção mais gentil aos sinais que o corpo dá nestas fases.

[pause]

Nada disto é dramático.

Mas é real.

[short pause]

Porque o corpo, quando se sente finalmente visto, começa a relaxar uma vigilância antiga.

[long pause]

Escreve a carta.

Não tem de ser perfeita.

Tem, apenas, de chegar à rapariga que tu eras no dia em que o corpo começou a fazer aquilo que o corpo faz — e que ninguém, nesse dia, soube ou quis testemunhar.`,
      },
      {
        id: "sangue-e-seda-m4b",
        titulo: "M4.B — A primeira vergonha do corpo",
        curso: "sangue-e-seda",
        texto: `Qual foi a primeira vez que sentiste vergonha do teu corpo?

[pause]

Nem sempre é uma memória nítida. Às vezes, é uma sensação antiga, cuja origem se perdeu.

[long pause]

Talvez tivesses oito anos e alguém comentou que estavas a engordar.

Talvez tivesses onze e a primeira visita da menstruação coincidiu com zombaria na escola.

Talvez tivesses catorze e percebeste, pela primeira vez, que o teu corpo era olhado de uma forma que tu não tinhas pedido.

[pause]

O momento preciso pode já não estar claro.

Mas a sensação ficou.

[short pause]

A partir dali, o teu corpo deixou de ser apenas o corpo onde tu vivias.

Tornou-se, também, objecto de olhar alheio.

[long pause]

Esta transição é, para muitas raparigas, o fim da infância corporal.

Até ali, o corpo era território onde se corria, se caía, se brincava.

A partir dali, passa a ser território onde se é vista.

[pause]

E ser vista, numa cultura que julga corpos femininos com particular rigidez, é ser avaliada.

[short pause]

Nesse momento, instalou-se em ti uma vigilância.

Uma vigilância que avalia, antes dos outros avaliarem. Que ajusta, antes dos outros comentarem. Que corrige, para não ser corrigida.

[pause]

Esta vigilância nunca desligou.

[long pause]

Hoje, aos teus trinta, quarenta, cinquenta anos, ela continua activa em sítios subtis.

Quando passas por uma montra e te avalias no reflexo. Quando evitas roupa que te mostraria mais. Quando te fotografas a ti mesma para ver se estás como gostarias de estar.

[pause]

Mesmo quando pensas que já passaste da fase em que isto te afectava, a vigilância continua. Só ficou mais silenciosa.

[short pause]

A vergonha do corpo não desaparece sozinha com os anos.

[pause]

Transforma-se — torna-se mais sofisticada, mais disfarçada, mais integrada na personalidade — mas não sai.

[short pause]

Apenas um trabalho específico, ao longo do tempo, a desmonta.

[long pause]

Este trabalho não é motivacional.

Não é dizeres a ti própria "amo o meu corpo" todas as manhãs.

Isso não funciona. A parte de ti que foi programada para vergonha não acredita nessas afirmações — reconhece-as como tentativa de sobrepor algo mais superficial a uma memória mais antiga.

[pause]

O que funciona, com paciência, é outra coisa.

É começar a distinguir entre ti e a voz que avalia o teu corpo.

[short pause]

A voz é antiga. Não é tua, propriamente.

Foi instalada em ti por cultura, por família, por comentários, por imagens.

[pause]

Quando começas a ouvi-la como voz externa que te habita — e não como tua voz interior — algo muda.

[long pause]

Podes responder-lhe.

Não em confronto dramático. Em pequenas frases silenciosas.

[pause]

"Reconheço-te. És a vergonha. Não vens de mim."

[short pause]

Isto parece pequeno. Parece inócuo.

Mas é, ao longo de meses, o gesto mais eficaz para enfraquecer uma voz interna.

[pause]

Porque cada vez que a nomeias como externa, ela perde peso de legitimidade.

Deixa de ser verdade absoluta.

Passa a ser intrusão histórica.

[long pause]

Esta semana, quando te avaliares corporalmente — num espelho, numa fotografia, num comentário a ti mesma — pára.

Nomeia a voz.

"Isto é vergonha antiga."

[pause]

Não tens de a expulsar. Não tens de a combater.

Só de a nomear.

[short pause]

E vê o que acontece.

[pause]

Ao fim de algumas semanas, a voz começa a aparecer com menos frequência.

Porque uma voz nomeada perde poder.`,
      },
      {
        id: "sangue-e-seda-m4c",
        titulo: "M4.C — O que aprendeste sem palavras",
        curso: "sangue-e-seda",
        texto: `Muito do que tu sabes sobre o corpo feminino, aprendeste sem palavras.

[pause]

Aprendeste observando a tua mãe a vestir-se.

Aprendeste a ouvir conversas entre tias.

Aprendeste a ler silêncios quando certos assuntos surgiam à mesa.

[long pause]

Estas lições sem palavras são as que mais firmemente persistem.

[pause]

Porque não foram questionadas — não foram, sequer, conscientes.

Entraram em ti como atmosfera, não como informação.

[short pause]

E a atmosfera, uma vez respirada, torna-se parte do ar interno.

[long pause]

Há regras corporais que tu cumpres sem saber que estás a cumprir.

Não mostrar certo tipo de pele. Não falar de certos temas em público. Não rir demasiado alto. Não olhar de frente para alguns homens. Não ocupar espaço demais com o corpo.

[pause]

Não foi ninguém que te ensinou explicitamente.

Aprendeste por absorção.

[short pause]

E agora, décadas depois, estas regras operam automaticamente, sem que tu penses nelas.

[long pause]

Tornam-se visíveis apenas quando alguém, próxima de ti, as quebra com naturalidade.

[pause]

Uma amiga que, de repente, fala abertamente sobre algo que tu não fazias ideia que se podia falar. Uma mulher que se senta de uma forma que tu nunca te sentaste. Uma colega que ri a gargalhar numa reunião onde tu terias sorrido contidamente.

[short pause]

Nesse momento, tu notas a regra — pela primeira vez — porque vês alguém a não cumpri-la.

[pause]

E fica a pergunta dentro de ti: porque é que eu, sem ninguém me obrigar, ainda cumpro isto?

[long pause]

A resposta honesta é: porque absorveste.

Não foi decisão. Foi osmose.

[pause]

E a osmose, uma vez detectada, pode ser revertida.

Não de repente. Não por decreto.

Com pequenos gestos conscientes de quebra.

[long pause]

Observa-te ao longo de uma semana.

Quantas vezes, por dia, ajustas o teu corpo a uma regra que nunca ninguém te ditou explicitamente?

[pause]

Cruzar as pernas quando não estás confortável assim. Baixar a voz em espaços públicos. Encolher o corpo em transportes. Cobrir o decote com a mão quando alguém olha.

[short pause]

Estas regras parecem triviais individualmente.

No conjunto, são treino permanente de ocupar menos.

[long pause]

Escolhe uma. Uma só.

Durante um mês, pratica a sua quebra consciente.

[pause]

Não dramaticamente. Apenas deixando de a seguir, quando ela aparecer.

[short pause]

Descruza as pernas se estavam cruzadas por hábito. Fala com a voz normal em público. Deixa de cobrir o decote quando sentires o reflexo.

[pause]

Vais notar, no início, desconforto. A voz da regra vai aparecer — "não é apropriado", "estão a olhar", "é desrespeitoso".

[short pause]

Esta voz não vem de ti. Vem de séculos de ensinamento sem palavras.

[pause]

Pára e diz-lhe, em silêncio: reconheço-te. Continua.

E, sem dramatizar, continua com o corpo a ocupar o espaço que ocuparia se a regra não existisse.

[long pause]

Ao longo do mês, a regra começa a perder força.

Porque ela precisava da tua colaboração para existir.

[pause]

E quando tu deixas, silenciosamente, de colaborar, ela enfraquece.

[short pause]

Outras mulheres à tua volta podem começar a imitar-te, sem saberem porquê.

Porque a quebra de uma regra silenciosa, quando feita por uma mulher, dá permissão invisível a todas as outras.

[pause]

Assim se desmontam, geração a geração, ensinamentos que foram instalados por atmosfera.

[long pause]

Começa pela mais pequena.

É suficiente.`,
      },
    ],
  },
  {
    id: "curso-sangue-e-seda-m5",
    titulo: "Curso Sangue e Seda — Módulo 5 (Aulas A, B, C)",
    descricao: "O Desejo Feminino. Material de áudio para alunos.",
    scripts: [
      {
        id: "sangue-e-seda-m5a",
        titulo: "M5.A — O que te disseram que era pecado",
        curso: "sangue-e-seda",
        texto: `Há palavras que, em criança, tu aprendeste a temer.

[pause]

Palavras que adultos diziam em voz baixa. Palavras que tu sentias que era melhor nem perguntar. Palavras cuja força precisa tu só viste quando alguém reagiu mal ao ouvi-las.

[long pause]

Muitas destas palavras eram sobre o corpo feminino.

Sobre aquilo que as mulheres sentem. Sobre aquilo que as mulheres desejam. Sobre aquilo que as mulheres fazem em privado.

[pause]

O léxico inteiro do desejo feminino foi construído, durante séculos, num campo semântico carregado.

Pecado. Culpa. Impureza. Tentação. Perigo.

[short pause]

Isto não foi casual.

[long pause]

Durante gerações, houve um interesse institucional em manter o desejo feminino dentro de certas fronteiras.

Fronteiras matrimoniais. Fronteiras reprodutivas. Fronteiras hierárquicas.

[pause]

O desejo livre de uma mulher ameaçava essas fronteiras.

Por isso foi patologizado, moralizado, criminalizado, consoante a época.

[short pause]

Tu herdaste este campo semântico.

[pause]

Mesmo que nunca tenhas crescido num ambiente religioso rigoroso, absorveste-o.

Porque está na língua. Está nas piadas. Está nas histórias. Está nos ditos populares.

[long pause]

E agora, adulta, tu carregas dentro de ti um léxico contaminado.

[pause]

Quando pensas em desejar, surge culpa.

Quando pensas em prazer, surge a palavra egoísmo.

Quando pensas em tomar iniciativa sexual, surge a ideia vaga de que não é apropriado.

[short pause]

Estas associações não são tuas.

São herança linguística de uma cultura que teve, durante muito tempo, interesse em mantê-las activas.

[long pause]

Reconhecer isto é um acto intelectual — mas tem efeito corporal.

[pause]

Quando uma mulher começa a ver que as suas próprias reacções de culpa face ao desejo são produto de herança cultural — não de consciência individual — a culpa começa a perder força.

[short pause]

Não desaparece de um dia para o outro.

Mas perde legitimidade.

[pause]

Passa a ser vista como voz externa que precisa de ser reconhecida e gentilmente ignorada.

[long pause]

Esta semana, escreve numa folha três coisas que tu sentes serem "erradas" em relação ao teu desejo ou ao teu prazer.

[pause]

Não para as justificares. Não para te defenderes.

Só para as nomeares.

[short pause]

Ao lado de cada uma, pergunta: quem foi que me ensinou isto?

De onde veio esta ideia?

[pause]

Raramente vais encontrar origem pessoal clara.

Quase sempre, a origem é cultural difusa.

[long pause]

O desejo feminino não é pecado.

Foi chamado pecado durante séculos por razões que não se aplicavam realmente ao desejo — aplicavam-se ao controlo.

[pause]

E tu, neste século, tens o direito de desmontar o léxico herdado.

[short pause]

Não em protesto. Em silêncio.

[pause]

Uma frase de cada vez. Uma associação de cada vez.

Até o teu interior deixar de tratar como pecado o que é, simplesmente, parte do que és.`,
      },
      {
        id: "sangue-e-seda-m5b",
        titulo: "M5.B — A descoberta do prazer próprio",
        curso: "sangue-e-seda",
        texto: `Há uma parte do teu corpo que tu, provavelmente, conheces muito menos do que conheces o corpo de outros.

[pause]

O teu próprio corpo, no que toca a prazer.

[long pause]

A maior parte das mulheres, durante grande parte da vida, descobre o prazer através de outra pessoa.

Alguém toca-te de certa forma e tu sentes.

E a partir daí, o mapa do teu próprio prazer vai-se construindo em função de como outros te tocam.

[pause]

Mas este mapa é incompleto.

Porque depende de outra pessoa.

[short pause]

Há outro mapa — mais íntimo, mais específico — que só tu podes desenhar.

O mapa do prazer que tu descobres sozinha, sem ninguém a observar, sem ninguém a tocar, sem ninguém a avaliar o que tu fazes com o teu próprio corpo.

[long pause]

Durante séculos, este mapa foi proibido.

As mulheres não deviam explorar o próprio corpo. Não deviam saber o que lhes dava prazer. Não deviam ter acesso directo àquilo que, em teoria, era prazer a ser administrado por outro.

[pause]

Esta proibição não tinha base fisiológica.

Tinha base política.

[short pause]

Uma mulher que conhece o seu próprio prazer é uma mulher menos dependente.

Menos dependente da aprovação. Menos dependente do parceiro. Menos dependente da performance alheia.

[pause]

E essa independência, durante muito tempo, era inconveniente.

[long pause]

Tu, se pertences a uma geração que cresceu num tempo mais aberto, talvez aches que isto não te afectou.

Mas olha com atenção.

[pause]

Muitas mulheres adultas, mesmo modernas, mesmo informadas, ainda têm, em relação ao seu próprio prazer solitário, uma sombra.

Uma sombra pequena — de culpa, de vergonha, de sensação de que é algo a fazer depressa, sem atenção consciente.

[short pause]

Esta sombra é herdada.

[long pause]

O que muitas mulheres descobrem, quando dedicam atenção consciente ao próprio prazer — sem performance, sem pressa, sem comparação — é que conhecem o próprio corpo muito menos do que pensavam.

[pause]

Há sensibilidades que nunca foram activadas. Há ritmos que nunca foram respeitados. Há partes do corpo que não são especificamente zonas erógenas mas que, com atenção lenta, revelam prazer inesperado.

[short pause]

O mapa do prazer próprio é específico de cada mulher.

E só se desenha com tempo, paciência, e ausência de observador.

[long pause]

Esta semana — ou este mês, se precisares de mais tempo — reserva uma noite em que estejas completamente sozinha.

Sem pressa. Sem objectivo. Sem plano.

[pause]

Não é encontro sexual contigo.

É exploração corporal.

[short pause]

Sem roteiro prescrito. Sem ordem certa. Sem partes que tens de tocar primeiro.

[pause]

Apenas tempo livre, sem plano, em que o corpo pode ser descoberto onde calhar.

[short pause]

Sem saltar para os sítios que já conheces como "certos" — porque os "certos" foram, em geral, ensinados.

E sem repetir a coreografia rápida que aprendeste para acabar depressa.

[pause]

Fica com o inesperado.

[short pause]

Uma mulher que conhece o seu próprio mapa corporal tem, depois, uma qualidade diferente em qualquer relação.

Não porque se torne melhor amante.

Porque se torna mais difícil de acomodar a algo que não lhe serve.

[long pause]

O prazer próprio não é substituto da intimidade com outros.

É fundação da intimidade com outros.

[pause]

Sem o primeiro, o segundo depende sempre de sorte.

Com o primeiro, o segundo depende de escolha informada.`,
      },
      {
        id: "sangue-e-seda-m5c",
        titulo: "M5.C — Intimidade sem performance",
        curso: "sangue-e-seda",
        texto: `Há uma pergunta honesta que muitas mulheres não se fazem.

[pause]

Quanto do que eu faço na intimidade é por prazer real, e quanto é performance?

[long pause]

A performance, aqui, não significa fingir.

Significa responder a uma ideia do que é "apropriado" para aquela cena.

[pause]

Gemer no momento certo. Fazer o som certo. Mostrar o rosto certo. Mover-se de forma que pareça suficientemente entusiasmada para o outro não sentir que precisa de se esforçar mais.

[short pause]

Tudo isto é trabalho.

Trabalho que muitas mulheres fazem sem se aperceberem.

[long pause]

Este trabalho tem origem em duas fontes.

Uma é a pornografia, que durante décadas ditou uma gramática específica do que uma mulher "deve" fazer em intimidade — gramática que quase nunca corresponde ao que uma mulher real faria livremente.

A outra é a ansiedade relacional — medo de que, se não performar bem, o parceiro perca interesse.

[pause]

As duas fontes, juntas, criam um contexto em que a intimidade deixa de ser troca autêntica e torna-se teatro consensual.

[short pause]

As duas pessoas sabem que há performance. As duas pessoas participam. E as duas perdem algo importante.

[long pause]

O que se perde é a possibilidade de presença real.

[pause]

Presença real significa estar no teu próprio corpo, a sentir o que estás realmente a sentir, a responder de forma honesta ao que te acontece.

Por vezes isso significa silêncio. Por vezes significa som espontâneo. Por vezes significa lentidão. Por vezes significa parar.

[short pause]

A performance não permite nada disto.

A performance exige resposta imediata, gestão contínua, atenção ao efeito.

[pause]

Enquanto performas, não estás presente.

E enquanto não estás presente, o prazer que experimentas é parcial.

[long pause]

Muitas mulheres descobrem, a certa altura da vida, que tiveram décadas de intimidade performada sem quase nenhum prazer real profundo.

[pause]

Isto é mais comum do que se admite.

E não é culpa de ninguém em particular — é produto de uma cultura que treinou duas pessoas a encenar algo que nenhuma delas está realmente a viver.

[short pause]

A saída não é confronto.

É uma desaceleração.

[long pause]

Experimenta, num momento de intimidade futuro, fazer uma coisa pequena.

Quando o corpo te pedir para fazer a resposta habitual — o som, o movimento, a expressão — pára.

[pause]

Respira.

E não faças.

[short pause]

Fica em silêncio, em quietude, se for o que o corpo real pediu.

[pause]

O teu parceiro vai notar. Pode ficar desconcertado. Pode perguntar.

[short pause]

A tua resposta pode ser simples: estou a sentir devagar.

[pause]

Esta resposta, dita sem drama, muda o tom da cena.

Passa de performance mútua para atenção mútua.

[long pause]

Nem toda a gente consegue acompanhar este tipo de intimidade.

Algumas pessoas estão tão habituadas à performance que a ausência dela parece ausência de interesse.

[pause]

Se o teu parceiro for uma dessas pessoas, isto vai criar desconforto.

E o desconforto vai obrigar a conversa.

[short pause]

A conversa pode ser difícil.

Pode também ser a conversa mais importante que já tiveram.

[pause]

Porque dela pode nascer uma intimidade diferente — mais lenta, mais honesta, mais próxima do que cada corpo realmente é, em vez do que cada corpo aprendeu a fingir ser.

[long pause]

A intimidade sem performance é mais rara do que parece.

Mas é mais nutritiva do que a intimidade performada em doze anos seguidos.

[pause]

E só pode começar quando uma das duas pessoas — normalmente a mulher — decide que já não quer continuar no teatro.`,
      },
    ],
  },
  {
    id: "curso-sangue-e-seda-m6",
    titulo: "Curso Sangue e Seda — Módulo 6 (Aulas A, B, C)",
    descricao: "A Maternidade. Material de áudio para alunos.",
    scripts: [
      {
        id: "sangue-e-seda-m6a",
        titulo: "M6.A — A escolha de ser ou não ser mãe",
        curso: "sangue-e-seda",
        texto: `Quando foi a primeira vez que pensaste seriamente sobre se querias ser mãe?

[pause]

Foi decisão consciente? Ou foi algo que assumiste que ias ser, porque era o que se esperava?

[long pause]

Para muitas mulheres, a maternidade não foi decidida.

Foi assumida.

[pause]

Assumida como fase natural. Como próximo capítulo óbvio. Como uma coisa que iria acontecer quando chegasse o momento certo.

[short pause]

Este pressuposto não é inocente.

É cultural.

[long pause]

Durante séculos, a única pergunta legítima sobre a maternidade de uma mulher era quando, nunca se.

E esta estrutura antiga, apesar de legalmente desmontada, persiste emocionalmente.

[pause]

Mesmo em países onde a escolha é protegida por lei, a maioria das mulheres chega à idade adulta sem ter realmente escolhido ser mãe.

Escolheu quando. Escolheu com quem. Escolheu quantos.

Mas o se, na maioria das vezes, foi pressuposto.

[short pause]

Isto tem uma consequência silenciosa.

[pause]

Muitas mães, em algum ponto, descobrem que amam os filhos — mas não escolheram, realmente, a maternidade.

E a distinção entre estas duas coisas é importante.

[long pause]

Amar os filhos é automático depois de os ter.

Escolher a maternidade é acto anterior.

[pause]

Se o primeiro aconteceu sem o segundo, há uma complexidade emocional que fica em silêncio.

[short pause]

Amor genuíno pelos filhos. E, por baixo, algo não resolvido sobre a decisão que nunca foi propriamente feita.

[long pause]

Isto não tem de ser fonte de culpa.

Pode ser fonte de consciência.

[pause]

Porque reconhecer que a maternidade foi mais absorvida do que decidida ajuda a entender certas inquietações que, de outra forma, parecem inexplicáveis.

[short pause]

O cansaço que é mais profundo do que deveria ser. O ressentimento vago que aparece em certos momentos. A saudade estranha de uma vida que nunca viveste.

[pause]

Estas sensações não significam que não ames a tua vida actual.

Significam que há uma dimensão da decisão que nunca foi confrontada conscientemente.

[long pause]

Se hoje, como mãe, conseguires olhar para trás e reconhecer em que momento da tua vida esta escolha foi, na verdade, feita — ou não feita — muita coisa alivia.

[pause]

Não porque possas voltar atrás. Não podes.

Mas porque o reconhecimento honesto da história real liberta-te da ficção de que tudo foi planeado perfeitamente.

[short pause]

E as mães que conseguem esta honestidade, muitas vezes, tornam-se mães mais presentes.

Porque deixam de ter de defender uma versão arrumada da sua própria trajectória.

[long pause]

Se não tens filhos, e estás em idade em que a decisão ainda está aberta — o reconhecimento é diferente, mas igualmente necessário.

[pause]

Qual é a origem real do teu "sim" ou do teu "não"?

Quanto é desejo verdadeiro? Quanto é expectativa herdada?

[short pause]

Não há resposta correcta. Há apenas resposta honesta.

[pause]

E esta honestidade, mais cedo do que tarde, é o melhor serviço que podes fazer a ti mesma.

[long pause]

Escreve, num caderno, a história real da tua relação com a maternidade.

Quando pensaste pela primeira vez. O que sentias. O que te disseram que devias sentir. O que acabou por acontecer.

[pause]

Não para partilhar. Para ver.

[short pause]

Uma vida vista, sem ficção arrumada, é uma vida que pode finalmente ser habitada.`,
      },
      {
        id: "sangue-e-seda-m6b",
        titulo: "M6.B — O corpo depois do parto",
        curso: "sangue-e-seda",
        texto: `Se tiveste filhos, o teu corpo depois do parto não é o corpo de antes.

[pause]

Não é uma versão pior. Não é uma versão melhor.

É outra.

[long pause]

A cultura contemporânea tem uma obsessão específica com o "recuperar o corpo de antes".

Revistas, programas, influenciadores — todos focados em mostrar mulheres que "voltaram ao que eram" meses depois de parir.

[pause]

Esta narrativa é cruel.

Porque parte de um pressuposto falso: que o corpo anterior era o corpo certo, e o corpo actual é o corpo a corrigir.

[short pause]

O corpo anterior não era mais certo.

Era, apenas, anterior.

[long pause]

O corpo depois do parto é um corpo que atravessou uma coisa enorme.

Uma vida cresceu dentro dele. Uma separação aconteceu. Uma reconfiguração biológica profunda ocorreu em meses.

[pause]

É irreal esperar que este corpo volte a ser como o anterior.

Seria como esperar que um edifício voltasse a ser como era antes de lhe terem construído um andar novo.

[short pause]

A estrutura mudou. E mudou porque fez trabalho.

[long pause]

Reconciliar-te com este corpo novo exige um acto específico.

[pause]

Deixar de o comparar com o corpo que ele já não é.

E começar a conhecê-lo como corpo novo, com as suas próprias capacidades, sensações, necessidades.

[short pause]

Este reconhecimento raramente é imediato.

Vem por fases. Por vezes com retrocessos.

[pause]

Há dias em que sentes que finalmente aceitas o teu corpo actual. Há outros em que voltas a ter saudades do anterior.

[short pause]

Os dois estados são válidos. Nenhum define o fim da história.

[long pause]

Uma parte importante desta reconciliação é parar de te desculpar pelo corpo actual.

[pause]

Em frente ao espelho. Em conversas com amigas. Em conversas íntimas com um parceiro.

As desculpas automáticas — "estou mais gorda", "não voltei a ser como era", "já não sou como antes" — não são humildade.

[short pause]

São a internalização de um padrão que diz que o teu corpo actual é inferior.

E cada vez que pronuncias esta desculpa, reforças o padrão em ti mesma.

[pause]

Experimenta parar de as dizer.

[short pause]

Não é preciso afirmar o contrário ("estou melhor do que nunca").

Basta não afirmar o deficit.

[pause]

Apenas: este é o meu corpo agora.

[long pause]

Esta frase, repetida silenciosamente quando a voz automática aparecer, começa a reorganizar o teu interior.

[pause]

Deixas de colaborar com a narrativa de que o corpo pós-parto é problema a corrigir.

Passas a tratar o corpo pós-parto como o corpo em que habitas agora.

[short pause]

Não porque "deves amá-lo incondicionalmente" — isso é slogan.

Porque é, simplesmente, o teu.

[long pause]

E vem com novas capacidades que o corpo anterior não tinha.

[pause]

Força de sustentar uma criança durante horas. Sensibilidade nova em alguns pontos que antes não tinhas explorado. Cansaço real que te ensinou a exigir descanso de forma que antes não sabias fazer.

[short pause]

Nem tudo é perda.

Mas só quando paras de comparar começas a ver o que foi ganho.

[long pause]

O teu corpo não é o corpo que era.

E, com paciência, podes descobrir que isto não é problema.

É dado.

E o dado, quando bem habitado, pode ser melhor do que a versão ficcional do corpo anterior que a saudade te propõe.`,
      },
      {
        id: "sangue-e-seda-m6c",
        titulo: "M6.C — A maternidade invisível",
        curso: "sangue-e-seda",
        texto: `Nem toda a maternidade tem filhos biológicos.

[pause]

Há mulheres que cuidam como mães sem nunca terem parido.

Cuidam de sobrinhos com dedicação quase parental. Cuidam de alunas que lhes ficam na memória durante anos. Cuidam de afilhadas, de mulheres mais novas do trabalho, de amigas em crises que duram anos.

[long pause]

Esta maternidade é real.

Mas é culturalmente invisível.

[pause]

Não há dia dedicado a ela. Não há categoria social que a reconheça. Não há rituais que a celebrem.

[short pause]

E as mulheres que a praticam, muitas vezes, não a reconhecem em si mesmas.

Pensam que estão a ser "só amigas" ou "só tias" ou "só professoras".

[pause]

Na verdade, estão a praticar forma antiga e legítima de maternidade.

[long pause]

Durante a maior parte da história humana, cuidar de crianças não era tarefa de uma mulher só.

Era tarefa de uma rede.

[pause]

A mãe biológica. As tias. As avós. As primas. As vizinhas.

Esta rede distribuía o cuidado e, ao fazê-lo, transformava todas as mulheres do círculo em figuras maternas, em diferentes graus.

[short pause]

A concentração exclusiva do cuidado materno numa única mulher — a mãe biológica — é fenómeno relativamente recente.

E é, biologicamente, insustentável.

[long pause]

Muitas mulheres hoje, sem filhos biológicos, cumprem funções maternas na vida de outras pessoas.

Mas não o sabem, porque a cultura não lhes dá linguagem para isso.

[pause]

Se isto é o teu caso, há uma coisa importante a reconhecer.

O teu cuidado por outras pessoas — crianças que não são tuas biologicamente, mulheres mais novas, pessoas em crise a quem dedicaste anos — conta.

[short pause]

Conta historicamente, culturalmente, e emocionalmente.

[pause]

Reconheceres-te como tendo praticado esta forma de maternidade não é sentimentalismo.

É precisão.

[long pause]

E se tens filhos biológicos e, ao mesmo tempo, cuidas de outras pessoas fora do núcleo biológico — é importante reconhecer que esse segundo cuidado também é maternal.

[pause]

A maternidade não é campo restrito aos que partilham o teu ADN.

É disposição de te importares com o bem-estar e o crescimento de alguém a um grau que envolve tempo, atenção, e sacrifício parcial.

[short pause]

Se estás a fazer isto, estás a praticar maternidade.

Em diferentes formas, com diferentes intensidades.

[pause]

Mas estás.

[long pause]

Esta semana, identifica uma ou duas pessoas na tua vida que beneficiam de um cuidado teu que, se olhado com atenção, é maternal.

Não precisas de dizer-lhes.

Só de reconhecer, para ti mesma, que este trabalho existe.

[pause]

Porque quando é invisível mesmo para quem o faz, esgota de forma silenciosa.

Quando é reconhecido, mesmo que só por ti, ganha densidade que o justifica.

[short pause]

Tu cuidas de vidas que não são a tua.

Isso, na história humana, é uma das formas mais antigas de amor.

[long pause]

Não precisa de ser celebrado externamente.

Precisa, apenas, de ser visto — por ti — como o que é.

Maternidade real.

Em forma diferente. Mas real.`,
      },
    ],
  },
  {
    id: "curso-sangue-e-seda-m7",
    titulo: "Curso Sangue e Seda — Módulo 7 (Aulas A, B, C)",
    descricao: "A Transformação do Corpo. Material de áudio para alunos.",
    scripts: [
      {
        id: "sangue-e-seda-m7a",
        titulo: "M7.A — O corpo que deixa de ser o que era",
        curso: "sangue-e-seda",
        texto: `Há um momento, algures entre os trinta e poucos e os cinquenta, em que o teu corpo deixa de ser o que era.

[pause]

Não é catástrofe.

Mas não é, também, apenas imaginação.

[long pause]

Acordas numa manhã e há uma dor nas costas que não costumava estar lá.

A tua pele reage diferente ao sol.

O teu cabelo muda de textura sem tu teres mudado de champô.

A tua digestão já não é a mesma.

[pause]

E, mais subtilmente, a tua energia distribui-se de outra forma ao longo do dia.

[short pause]

Isto não é sinal de decadência.

É informação de transição.

[long pause]

Mas a cultura contemporânea trata esta transição como problema a adiar.

Há um discurso permanente de "manter-se como era".

Manter a pele. Manter o peso. Manter a energia. Manter tudo.

[pause]

O custo deste discurso é alto.

Mulheres que passam a vida inteira em guerra com o próprio corpo por ele estar a mudar naturalmente.

[short pause]

Esta guerra está perdida à partida.

Porque o corpo vai mudar, com ou sem a tua permissão.

[pause]

A única coisa que podes escolher é se acompanhas a mudança com conhecimento, ou se a resistes com cansaço.

[long pause]

O primeiro sinal de que estás em transição, muitas vezes, não é corporal óbvio.

É emocional.

[pause]

Uma paciência menor com coisas que antes toleravas. Uma clareza nova sobre relações que antes aguentavas. Uma vontade quieta de mudanças que antes adiavas.

[short pause]

Isto não é crise de meia-idade.

É recalibração interior que acompanha a recalibração hormonal.

[long pause]

Se pudesses olhar para o ciclo da vida feminina sem o filtro da cultura que exige juventude, verias algo diferente.

[pause]

Verias que cada fase tem um tipo específico de inteligência.

A juventude tem energia, pouca experiência.

A meia-idade tem experiência, alguma energia.

A idade mais avançada tem sabedoria, menos energia.

[short pause]

Nenhuma fase é melhor. Cada uma tem capacidades próprias.

[pause]

Mas a cultura actual tenta manter todas as fases com a aparência da juventude — e com isso, impede que cada fase mostre o que tem de bom.

[long pause]

Se consegues habitar a tua meia-idade como fase própria — não como juventude prolongada nem como antecipação da velhice — algo muda na forma como vives este corpo.

[pause]

Começas a vestir-te para o corpo que tens, não para o corpo que já não tens.

Começas a organizar o teu tempo em função da energia real, não da energia que tinhas aos vinte.

Começas a fazer escolhas relacionais com critério diferente.

[short pause]

E descobres que esta fase, se vivida com consciência, tem autoridade própria que as anteriores não tinham.

[long pause]

Esta semana, olha para três coisas no teu corpo que mudaram nos últimos anos e que te incomodam.

Ao lado de cada uma, escreve: o que é que esta mudança me está a dizer?

[pause]

Não é pergunta filosófica.

É pergunta concreta.

[short pause]

Muitas vezes, a resposta tem a ver com ritmo. Com limites. Com atenção ao que o corpo já não suporta.

[pause]

E esta informação, se for ouvida a tempo, poupa-te anos de resistência inútil.

[long pause]

O corpo que tu tens não é o corpo de antes.

Mas é corpo.

E merece — como o anterior mereceu — ser habitado com atenção, respeito, e escuta das suas novas indicações.`,
      },
      {
        id: "sangue-e-seda-m7b",
        titulo: "M7.B — A meia-idade e os sintomas",
        curso: "sangue-e-seda",
        texto: `Há sintomas específicos que aparecem na meia-idade feminina sobre os quais quase ninguém fala.

[pause]

Não a menopausa em si. Isso já tem alguma visibilidade.

Os anos antes da menopausa. A peri-menopausa.

[long pause]

Que pode durar dez anos.

E durante os quais muitas mulheres não sabem o que lhes está a acontecer.

[pause]

Ondas de calor esporádicas que aparecem antes do fim do ciclo.

Ciclos que ficam irregulares.

Insónias novas sem razão aparente.

Ansiedade que aparece do nada, sem evento que a justifique.

Alterações de humor que não batem certo com a tua história habitual.

[short pause]

Palpitações. Dores articulares novas. Queda de cabelo. Pele mais seca. Memória menos ágil.

[pause]

Tudo isto, durante a peri-menopausa, pode aparecer — antes de qualquer "ausência de menstruação".

[long pause]

E a maioria das mulheres, quando procura ajuda médica para qualquer um destes sintomas isoladamente, é diagnosticada como algo diferente.

Stress. Depressão. Ansiedade. Mau estilo de vida.

[pause]

Porque poucos médicos de clínica geral — e mesmo alguns ginecologistas — reconhecem a peri-menopausa como quadro coerente.

[short pause]

As mulheres são, muitas vezes, medicadas para cada sintoma individual em vez de serem vistas como um todo em transição.

[long pause]

Isto tem consequências sérias.

[pause]

Uma mulher recebe antidepressivos para ansiedade que, na verdade, é hormonal.

Recebe sonífero para insónia que, na verdade, é flutuação de estrogénio.

Recebe dieta para subida de peso que, na verdade, é reconfiguração metabólica natural da fase.

[short pause]

Nenhum destes tratamentos é errado em absoluto. Mas se a causa de fundo é hormonal, os tratamentos sintomáticos nunca atingem a raiz.

[pause]

E a mulher passa anos a acumular medicações e a sentir-se cada vez mais distante do próprio corpo.

[long pause]

Se tens mais de trinta e cinco anos e começaste a notar sintomas novos, há algo concreto a fazer.

[pause]

Procura um ginecologista com especialização em climatério.

Não um ginecologista geral. Um especialista em peri-menopausa e menopausa.

[short pause]

Estes profissionais vão fazer exames hormonais mais completos do que os standard.

Vão olhar para os teus sintomas em conjunto.

Vão propor, se for o caso, acompanhamento hormonal adequado à tua situação específica.

[pause]

Em muitos países, há escassez destes especialistas. Investiga, pede referências, viaja se preciso.

Este investimento é dos mais importantes que podes fazer na tua saúde durante esta década da vida.

[long pause]

A peri-menopausa mal acompanhada é causa silenciosa de deterioração de qualidade de vida em milhões de mulheres.

[pause]

Tu tens o direito de atravessar esta fase com apoio adequado.

Não com antidepressivos genéricos. Não com "é da idade". Não com "é stress".

[short pause]

Com acompanhamento hormonal sério, quando indicado.

Com informação clara sobre o que está a acontecer.

Com escolhas informadas sobre as opções disponíveis.

[long pause]

Escreve numa lista todos os sintomas novos que começaram a aparecer nos últimos anos.

Mesmo os que pareciam desligados entre si.

[pause]

Leva a lista ao especialista.

Pede leitura integrada.

[short pause]

E depois decide, em conjunto com profissional qualificado, o que fazer.

[pause]

A tua saúde na meia-idade depende desta investigação activa — mais do que dependeu em qualquer outra fase anterior da tua vida.`,
      },
      {
        id: "sangue-e-seda-m7c",
        titulo: "M7.C — A menopausa sem drama",
        curso: "sangue-e-seda",
        texto: `A menopausa, na cultura contemporânea, é apresentada de duas formas.

[pause]

Ou como fim — perda de algo essencial, envelhecimento inevitável, declínio.

Ou como libertação triunfal — "agora és livre do ciclo, podes finalmente tudo".

[long pause]

As duas narrativas são falsas.

Ou, mais precisamente, são parciais.

[pause]

A menopausa é transição.

Como a adolescência foi transição. Como a gravidez, se tiveste, foi transição.

Uma mudança de fase biológica e emocional que tem luzes e sombras, ganhos e perdas, facilidades e dificuldades.

[short pause]

E tratar a menopausa como "fim" ou como "libertação" é forçá-la a um enquadramento que não cabe.

[long pause]

O que acontece de facto na menopausa?

[pause]

Fisicamente: termina a fase reprodutiva. As hormonas principais descem. O corpo reorganiza-se em termos metabólicos, ósseos, cardiovasculares.

Esta reorganização tem consequências reais — algumas benignas, outras que exigem atenção médica.

[short pause]

Emocionalmente: muitas mulheres experienciam clareza nova sobre a própria vida. Paciência menor com o que já não serve. Vontade de fazer mudanças que adiaram por décadas.

[pause]

Algumas experienciam também depressão, ansiedade, perda de interesse em actividades que antes gostavam.

[short pause]

Estes estados não são inevitáveis — muitas vezes estão ligados a desequilíbrios hormonais tratáveis ou a factores de vida que a menopausa expõe.

[long pause]

O grande erro cultural em relação à menopausa é tratá-la como fim da feminilidade.

Como se a menstruação fosse a feminilidade.

[pause]

A feminilidade não está na menstruação.

Está numa configuração biológica complexa que dura a vida inteira — da infância à idade mais avançada.

[short pause]

A menopausa não encerra esta configuração. Apenas modifica uma das suas dimensões.

[pause]

Mulheres pós-menopausa continuam a ter feminilidade plena. Desejo. Presença. Corpo. História.

[long pause]

Na maior parte das culturas tradicionais — antes da medicalização moderna — a pós-menopausa era, de facto, uma fase de autoridade.

[pause]

As mulheres mais velhas eram conselheiras da comunidade. Eram a memória cultural. Eram quem orientava as gerações mais novas sem ter de competir por recursos reprodutivos.

[short pause]

Esta posição social foi, em grande parte, apagada pela cultura ocidental contemporânea.

Mas está a voltar, lentamente, à medida que cada vez mais mulheres vivem décadas depois da menopausa com saúde e presença.

[pause]

Tu, quando chegares a esta fase, tens a oportunidade de a habitar com outra qualidade.

[long pause]

Não como fim.

Não como libertação triunfal.

Como transição respeitada.

[pause]

Com acompanhamento médico adequado.

Com consciência de que o corpo está a reorganizar-se, não a colapsar.

Com abertura para descobrir o que esta fase permite que fases anteriores não permitiam.

[short pause]

Porque há coisas que só aparecem depois.

[pause]

Clareza sobre o que importa. Autoridade que vem da experiência acumulada. Uma relação com o corpo que já não depende de produtividade reprodutiva.

[long pause]

Se estás perto da menopausa, faz uma coisa simples.

Procura uma mulher mais velha — dez, quinze, vinte anos mais velha que tu — e pergunta-lhe, sem pressa, como foi esta fase para ela.

[pause]

Não peças conselhos genéricos. Pergunta pela experiência concreta.

[short pause]

O que ela te disser é mapa real.

[pause]

Cada mulher que te conta a sua versão da menopausa, honestamente, está a fazer um acto silencioso de partilha de sabedoria entre gerações.

Sabedoria que a cultura mais ampla não partilha.

[long pause]

E esta sabedoria, acumulada ao longo dos anos, vai preparar-te muito melhor do que qualquer livro ou artigo.

Porque vem da vida. Da boca de mulheres reais. Com todas as nuances.

[pause]

A menopausa sem drama é possível.

Mas exige informação real, acompanhamento adequado, e conversa intergeracional.

[short pause]

Os três estão disponíveis — se os procurares.`,
      },
    ],
  },
  {
    id: "curso-sangue-e-seda-m8",
    titulo: "Curso Sangue e Seda — Módulo 8 (Aulas A, B, C)",
    descricao: "A Mulher que Habita o Corpo. Fecho do curso.",
    scripts: [
      {
        id: "sangue-e-seda-m8a",
        titulo: "M8.A — O corpo como lugar",
        curso: "sangue-e-seda",
        texto: `Pensa, por um momento, no teu corpo não como ferramenta — mas como lugar.

[pause]

Um lugar onde tu vives desde que nasceste. Um lugar que nunca abandonaste, nem por um dia.

[long pause]

A cultura contemporânea trata o corpo, sobretudo o corpo feminino, como objecto.

Objecto a melhorar. Objecto a exibir. Objecto a manter.

[pause]

Quando tratas o teu corpo como objecto, ele torna-se estranho para ti.

Ficas de fora, a olhá-lo criticamente.

[short pause]

Nunca realmente dentro dele.

[long pause]

Mas o teu corpo não é objecto.

É o único lugar que nunca perdes.

[pause]

Perdes casas. Perdes relações. Perdes trabalhos. Perdes até pessoas.

O corpo fica.

Muda, envelhece, reorganiza-se. Mas fica.

[short pause]

E habitá-lo bem é uma das aprendizagens mais longas da vida.

[long pause]

A mulher que habita o corpo é diferente da mulher que o administra.

[pause]

A administradora passa o dia a verificar-se. Avaliar-se. Ajustar-se.

A habitante apenas está. Sabe como se sente hoje. Reconhece o que o corpo pede. Responde conforme pode.

[short pause]

A habitante tem uma relação com o corpo que se parece mais com uma relação duradoura do que com uma gestão de projecto.

[pause]

Aceita os dias difíceis sem dramatizar.

Recebe os dias bons sem se apegar.

[short pause]

E, com o tempo, conhece o seu corpo de forma íntima que não tem equivalente em nenhuma outra intimidade.

[long pause]

Esta qualidade de habitação não vem por decisão única.

Vem por prática repetida, ao longo de anos.

[pause]

Pequenos gestos de atenção ao corpo. Sem objectivo. Sem correcção.

Apenas presença.

[short pause]

Uma manhã em que reparas, ao levantar-te, em como te sentes de facto.

Uma tarde em que paras para notar o cansaço, sem tentar fazê-lo desaparecer.

Uma noite em que, ao deitares-te, registas numa frase como o corpo passou o dia.

[pause]

Estes momentos parecem pequenos.

Acumulados ao longo dos anos, transformam a relação.

[long pause]

A mulher que habita o corpo não é invulnerável.

Tem dias em que ainda se critica. Momentos em que ainda se avalia.

Mas essas reacções já não são o estado dominante.

[pause]

O estado dominante é uma espécie de cooperação serena entre ela e o corpo dela.

[short pause]

Uma cooperação que dura — com todas as mudanças — até ao fim da vida.

[long pause]

Esta semana, vais começar a construir essa cooperação por uma via concreta.

[pause]

Pega numa folha — ou usa a contracapa de uma agenda, ou um caderno pequeno que fique perto da tua cama.

[short pause]

E em cima escreve um cabeçalho:

"Como o meu corpo passou hoje —"

[long pause]

À noite, antes de dormires, em vez de fazeres meditações ou exercícios mentais, escreves uma única linha.

[pause]

Não como o teu corpo te pareceu. Como ele realmente passou o dia.

[short pause]

Pode ser:

"Hoje aguentou seis horas em pé na consulta da minha mãe. Tem o pé esquerdo a doer."

"Hoje digeriu mal o jantar de ontem. Sentiu peso na barriga até à tarde."

"Hoje teve mais energia do que o habitual a meio da tarde. Não sei porquê."

"Hoje passou por dentro de uma reunião difícil sem se queixar. Mas a mandíbula ficou apertada."

[long pause]

Uma linha por dia. Sem comentário moral. Sem auto-cuidado prescrito. Sem agradecer.

[pause]

Apenas relato factual de como o corpo passou o dia.

[short pause]

Como quem regista as condições meteorológicas de uma casa onde vive.

[long pause]

Ao fim de duas semanas, lê tudo de uma vez.

[pause]

Vais ter, em letra escrita, um retrato do teu corpo que nunca tinhas tido.

[short pause]

Não imaginado. Observado.

[pause]

E é a partir desse retrato observado — não da meditação, não da gratidão silenciosa — que a cooperação serena entre tu e o corpo começa, devagar, a instalar-se.

[long pause]

O teu corpo não está à espera de ser perfeito para ser tua casa.

Já é tua casa.

[pause]

A única coisa que ele espera é que tu, finalmente, prestes atenção a como ele passa o dia em que vive contigo.`,
      },
      {
        id: "sangue-e-seda-m8b",
        titulo: "M8.B — A reconciliação com o próprio corpo",
        curso: "sangue-e-seda",
        texto: `A reconciliação com o próprio corpo raramente acontece de uma vez.

[pause]

Não é um dia em que decides amá-lo e tudo se resolve.

É um processo longo, com avanços e recuos, que dura praticamente a vida inteira.

[long pause]

Algumas mulheres chegam aos setenta sem se terem reconciliado plenamente com o próprio corpo.

Outras começam a reconciliação aos trinta e fazem-na em etapas.

[pause]

A idade não determina o momento.

Determina, apenas, a quantidade de tempo que ficou por usar.

[short pause]

Começar agora, independentemente da idade, é sempre melhor do que adiar.

[long pause]

A reconciliação tem, normalmente, três fases.

[pause]

A primeira é de reconhecimento — perceberes o quanto tens vivido em guerra com o teu corpo.

A segunda é de tréguas — parares, activamente, de atacá-lo com palavras internas, comparações, exigências.

A terceira é de intimidade — começares a conhecê-lo como parceiro, não como adversário.

[short pause]

Estas três fases não são lineares.

Podes estar na segunda com um aspecto do corpo e na primeira com outro.

[pause]

É normal. O corpo é vasto.

[long pause]

Uma coisa que acelera a reconciliação é, inesperadamente, a observação do corpo doente ou ferido.

[pause]

Quando tu — ou alguém próximo — atravessa um problema de saúde sério, a relação com o corpo muda.

De repente, as queixas que pareciam grandes encolhem.

A celulite, os quilos a mais, a pele menos firme — tudo isto torna-se profundamente irrelevante quando estão em causa coisas mais sérias.

[short pause]

Não é preciso passar por doença grave para aceder a esta clareza.

Podes acedê-la por observação.

[pause]

Pensa em mulheres que conheces — ou de que já ouviste falar — que passaram por doença grave.

Como é que elas falam do corpo delas depois da doença?

[short pause]

Na grande maioria das vezes, falam com outra humildade.

Uma humildade que reconhece que o corpo fez o trabalho dele mesmo quando foi atacado.

[pause]

Esta humildade não precisa de ser paga com doença.

Pode ser cultivada em silêncio, antes que ela apareça.

[long pause]

Outra coisa que acelera a reconciliação é a comparação com mulheres mais velhas.

[pause]

Quando estás com mulheres de setenta, oitenta anos que estão em paz com o próprio corpo — mesmo com todas as marcas da idade — algo se move em ti.

Vês que a paz é possível.

Mesmo depois de mudanças que tu, hoje, temes.

[short pause]

E começas a perguntar: o que é que elas fizeram que eu posso começar a fazer agora?

[pause]

Quase sempre, o que elas fizeram foi deixar de lutar mais cedo.

Não se resignaram.

Apenas pararam de travar guerra contra a passagem do tempo no próprio corpo.

[long pause]

Reconciliação não significa celebração constante.

Significa trégua sustentada.

[pause]

A trégua é diferente da celebração.

A celebração é declarativa: "amo o meu corpo".

A trégua é prática: "paro de o atacar".

[short pause]

A prática é mais eficaz.

[pause]

Porque remove o sintoma principal da guerra — o ataque verbal interno — sem exigir um entusiasmo que pode não estar disponível.

[long pause]

Esta semana, em vez de tentares amar o teu corpo, pratica parar de o atacar.

[pause]

Cada vez que uma voz interna criticar o teu corpo, não a combatas. Não lhe respondas com afirmação positiva.

Apenas: não a repitas em voz alta. Não a confirmes por comentário. Não a alimentes.

[short pause]

Deixa-a passar.

E segue em silêncio.

[pause]

Este silêncio, repetido ao longo do tempo, é a trégua.

E a trégua é a fundação da reconciliação.

[long pause]

Amor virá — se vier — depois.

Mas a trégua é o que tu podes começar a fazer hoje.`,
      },
      {
        id: "sangue-e-seda-m8c",
        titulo: "M8.C — A mulher inteira",
        curso: "sangue-e-seda",
        texto: `No fim deste curso, pensa na mulher que queres ser daqui a cinco anos.

[pause]

Não a versão ideal. Não a versão rejuvenescida.

A versão inteira.

[long pause]

Uma mulher inteira, na altura da vida em que estará, conhece o seu corpo.

Conhece as suas fases. Conhece os seus ritmos. Conhece as suas exigências e os seus prazeres.

[pause]

Conhece as heranças que carrega e trabalha com elas, não contra elas.

[short pause]

Sabe o que o corpo dela sempre soube, e começa — finalmente — a confiar nesse saber.

[long pause]

A mulher inteira não é perfeita.

Tem dias difíceis. Tem momentos em que ainda se critica. Tem memórias antigas que ainda doem.

[pause]

Mas já não tenta esconder nada disto.

Porque aprendeu, ao longo dos anos, que o que é escondido não desaparece — apenas se infiltra em outros sítios onde se torna mais difícil de tratar.

[short pause]

E aprendeu que o que é reconhecido, mesmo quando não é resolvido imediatamente, começa a abrandar.

[long pause]

Esta mulher tem linhagem consciente.

[pause]

Reconhece as mulheres que a antecederam. Sabe, com razoável precisão, o que cada uma atravessou. Honra o que recebeu delas — e liberta-se do que já não serve.

[short pause]

Não por confronto com o passado.

Por respeito pelo futuro.

[pause]

As mulheres que vêm depois dela — filhas biológicas ou não — merecem receber menos peso inconsciente.

Merecem uma linhagem mais leve.

[short pause]

E ela, com o trabalho que fez, pode ser o ponto em que esse peso começa a ser reduzido.

[long pause]

Ela conhece o seu ciclo — ou, se já passou por ele, conhece o que o ciclo lhe deixou como herança emocional.

Conhece o seu desejo — e não o esconde de si mesma.

Conhece a sua dor — e sabe quando pedir acompanhamento em vez de aguentar em silêncio.

[pause]

E, sobretudo, conhece o seu corpo como lugar.

O lugar onde vive.

O único lugar que nunca vai abandonar.

[short pause]

Este reconhecimento transforma tudo.

[pause]

Porque a mulher que reconhece o corpo como casa, trata-o diferente.

Não como projecto. Não como produto. Não como problema.

Como casa.

[long pause]

Se este curso te deixou alguma coisa, que seja isto.

A possibilidade de chegares, devagar, à mulher inteira que já existe dentro de ti.

[pause]

Não como versão futura distante.

Como versão que está em construção lenta, todos os dias, em gestos pequenos.

[short pause]

Cada escuta do corpo. Cada pergunta à linhagem. Cada honestidade sobre a dor. Cada recusa de performance.

[pause]

Tudo isto, somado, desenha a mulher que vais ser.

[long pause]

A vida é longa.

E a mulher inteira não se faz de uma vez.

[pause]

Mas faz-se. Se tu, com paciência, continuas.

[short pause]

E no fim — quando olhares para trás — vais perceber que a inteireza nunca foi destino.

[pause]

Foi caminho.

E o caminho, por si só, já era a mulher que procuravas.`,
      },
    ],
  },
  {
    id: "curso-o-silencio-que-grita-m1",
    titulo: "Curso O Silêncio que Grita — Módulo 1 (Aulas A, B, C)",
    descricao: "Os Silêncios que Aprendeste. Material de áudio para alunos.",
    scripts: [
      {
        id: "o-silencio-que-grita-m1a",
        titulo: "M1.A — As coisas que não se falavam à mesa",
        curso: "o-silencio-que-grita",
        texto: `Em casa, na tua infância, havia uma mesa onde se reuniam para comer.

[pause]

Talvez todos os dias. Talvez aos fins-de-semana. Talvez só nos almoços de família.

[long pause]

Nessa mesa, havia conversa.

Sobre o trabalho do pai, talvez. Sobre os vizinhos. Sobre a comida. Sobre os pequenos eventos da semana.

[pause]

E havia, simultaneamente, um conjunto de assuntos que nunca apareciam.

[short pause]

A depressão da tia que ninguém visitava. O divórcio do primo que se mudou para outra cidade. A doença do avô que morreu sem que tu soubesses ao certo do quê. O dinheiro que faltava em certos meses.

[pause]

Estes assuntos não foram explicitamente proibidos.

Foram, simplesmente, deixados de fora.

[long pause]

Tu, em criança, percebeste isto sem que ninguém te explicasse.

Aprendeste, por absorção, que havia conversas que se tinham e conversas que não se tinham.

[pause]

E aprendeste a distinguir as duas categorias com precisão de adulto.

[short pause]

Antes de saberes o que era importante na vida, sabias o que se podia mencionar à mesa.

[long pause]

Esta aprendizagem — que parece pequena — molda a tua relação com a verdade durante o resto da vida.

[pause]

Aprendes que a verdade tem zonas de admissão.

Que algumas verdades servem para o público — e outras pertencem ao silêncio.

E que tu, como pessoa decente, deves saber distinguir.

[short pause]

Esta lição, que herdaste sem te aperceberes, governa hoje muitas das tuas conversas adultas.

[pause]

Nas reuniões de família. Nos jantares com amigos. Nas conversas com o teu parceiro.

[short pause]

Há sempre, em ti, um filtro automático que avalia se um assunto é "para falar" ou "para deixar".

[long pause]

Este filtro foi útil enquanto te mantinha integrada na família de origem.

Mas tornou-se, ao longo dos anos, um obstáculo a relações mais profundas.

[pause]

Porque a intimidade real exige falar do que normalmente se não fala.

E o teu filtro, treinado durante décadas, recusa-se a deixar passar.

[short pause]

Mesmo quando tu, conscientemente, querias falar.

[pause]

Há uma resistência que vem antes da decisão racional.

[long pause]

Esta semana, faz uma lista privada.

Quais eram os assuntos que, em criança, percebeste que não se falavam à mesa em tua casa?

[pause]

Escreve cada um. Sem desenvolver. Apenas o nome do assunto.

[short pause]

Olha para a lista.

[pause]

Provavelmente vais ficar surpreendida com o número.

[short pause]

E vais começar a ver, em retrospectiva, o quanto da tua família real ficou fora das conversas oficiais.

[long pause]

Esta lista é a primeira ferramenta deste curso.

Vamos voltar a ela várias vezes.

[pause]

Porque cada assunto silenciado em criança continua, hoje, a ter peso na forma como tu falas — ou não falas — em adulta.

[short pause]

Reconhecê-los é o primeiro passo para deixares de obedecer ao silêncio sem o teres escolhido.`,
      },
      {
        id: "o-silencio-que-grita-m1b",
        titulo: "M1.B — O que o silêncio do pai te ensinou",
        curso: "o-silencio-que-grita",
        texto: `O teu pai, na tua infância, era silencioso?

[pause]

Não necessariamente um homem mau. Talvez fosse, até, um pai amoroso à sua maneira.

Mas silencioso.

[long pause]

Não falava do que sentia. Não pedia o que precisava. Não respondia em palavras quando algo lhe pesava.

[pause]

Quando estava bem, comia em silêncio.

Quando estava mal, ficava em silêncio mais grosso.

[short pause]

E tu, como filha, aprendeste a ler estes silêncios com precisão.

[long pause]

Aprendeste, sem que ninguém te ensinasse, qual silêncio era cansaço normal e qual era preocupação séria.

Qual era distância afectuosa e qual era zanga contida.

Qual era sinal de aprovação tácita e qual era sinal de desaprovação que talvez nunca chegasse a ser dita.

[pause]

Esta literacia do silêncio paterno tornou-se, no teu sistema nervoso, uma capacidade especializada.

[short pause]

E essa capacidade ficou contigo.

[pause]

Hoje, em adulta, tu lês silêncios alheios com sensibilidade que poucas pessoas têm.

[long pause]

Esta sensibilidade é, em parte, dádiva.

Em parte, peso.

[pause]

É dádiva quando te permite compreender pessoas próximas mesmo quando elas não dizem em palavras o que sentem.

É peso quando te obriga a estar permanentemente em estado de leitura — interpretando silêncios mesmo onde eles podem não ter o significado que tu lhes atribuis.

[short pause]

Este peso aparece sobretudo em relações com homens.

[pause]

Quando o teu parceiro fica em silêncio, alguma parte de ti automaticamente entra em modo de decifração.

Está chateado? Está cansado? Está a guardar algo? Está a recuar?

[short pause]

Esta vigilância, embora venha de origem afectuosa, é exaustiva.

[pause]

E muitas vezes nem chega a ser necessária — o silêncio do teu parceiro pode ser, simplesmente, silêncio.

Sem mensagem oculta.

[long pause]

Esta diferença — entre silêncio com mensagem e silêncio sem mensagem — é uma das aprendizagens mais difíceis da vida adulta.

[pause]

Porque a tua infância te treinou a presumir que todo o silêncio significa algo.

E a vida adulta exige que aprendas que muitos silêncios não significam nada de particular.

[short pause]

São apenas pausa, descanso, ausência de necessidade de palavra.

[long pause]

Reconhecer esta diferença liberta uma quantidade impressionante de energia mental.

[pause]

Energia que tu, durante décadas, gastaste a interpretar silêncios que não precisavam de interpretação.

[short pause]

Esta semana, quando alguém próximo de ti ficar em silêncio, faz uma coisa diferente.

[pause]

Em vez de o interpretares automaticamente, espera.

Não perguntes. Não decifres. Apenas espera.

[short pause]

Vai notar duas coisas.

[pause]

Primeira: a maioria dos silêncios passa sem que ninguém precise de explicar nada. Eram apenas silêncios.

Segunda: quando há, de facto, algo importante por trás do silêncio, a outra pessoa, com tempo, costuma trazer.

[short pause]

Tu não precisas de fazer o trabalho pelos outros.

[pause]

Os silêncios alheios, na maior parte das vezes, podem ficar por interpretar.

[long pause]

Isto é libertação que o teu sistema nervoso espera há décadas.

A possibilidade de existir sem estar permanentemente a decifrar.`,
      },
      {
        id: "o-silencio-que-grita-m1c",
        titulo: "M1.C — As perguntas que não podiam ser feitas",
        curso: "o-silencio-que-grita",
        texto: `Lembras-te de uma pergunta que, em criança, quiseste fazer e percebeste que não devias?

[pause]

Sobre alguém da família. Sobre algo do passado. Sobre uma situação presente que ninguém explicava.

[long pause]

A maioria das crianças, em famílias com silêncios, aprende cedo a inibir perguntas.

[pause]

Não foi necessário ninguém te dizer "não perguntes".

Bastou veres a reacção que outras perguntas provocaram.

[short pause]

A pausa estranha. O olhar que se desviou. A resposta vaga que claramente terminava o assunto.

[pause]

Aprendeste que algumas perguntas geravam desconforto.

E o desconforto, para uma criança que precisa do amor da família, é mais ameaçador do que a curiosidade não saciada.

[long pause]

Então engoliste as perguntas.

Algumas, ao longo do tempo, perdeste-as por completo.

Outras, ainda ressurgem em silêncio quando, em adulta, pensas na família de origem.

[pause]

Há perguntas que tu, hoje, ainda gostarias de fazer e nunca vais ter resposta.

[short pause]

Porque as pessoas que poderiam responder já partiram.

Ou porque, mesmo vivas, continuariam a recuar perante a pergunta.

[long pause]

Esta é uma dor específica.

[pause]

Não é dor de algo que te tenha sido feito directamente.

É dor de algo que nunca te foi explicado.

[short pause]

E a falta de explicação, para uma criança, transforma-se em mistério.

E o mistério, em adulta, transforma-se em peso vago.

[long pause]

Há, no entanto, uma forma de lidar com perguntas que nunca tiveram resposta.

[pause]

Não é encontrar a resposta. Muitas vezes, isso já não é possível.

É reconhecer que a pergunta existiu — e que a inibição dela foi imposta, não escolhida.

[short pause]

Quando reconheces a pergunta como tua, mesmo sem resposta, ela perde parte do peso.

[pause]

Porque o que pesava não era a ausência de resposta.

Era a impossibilidade de sequer formular a pergunta em voz alta.

[long pause]

Esta semana, pega num caderno.

Escreve, durante alguns dias, todas as perguntas que tu, em criança, gostarias de ter feito e não pudeste.

[pause]

Não escrevas só uma vez. Volta ao caderno várias vezes.

Algumas perguntas só vão aparecer depois de outras já terem sido escritas.

[short pause]

Não te preocupes em encontrar respostas.

A escrita das perguntas é, em si mesma, um acto de libertação parcial.

[pause]

Estás a fazer o que a criança não pôde fazer.

A formular as perguntas em palavras concretas.

[short pause]

E essa formulação, mesmo silenciosa, recupera alguma da capacidade que te foi inibida.

[long pause]

Algumas das perguntas, com o tempo, podem encontrar resposta inesperada.

Por uma conversa casual com uma tia. Por um documento que aparece. Por uma memória que outro familiar partilha.

[pause]

Outras nunca vão ter resposta.

E está bem.

[short pause]

A pergunta, escrita, deixa de pertencer ao silêncio inquieto.

Passa a pertencer à tua história consciente — e isso, por si só, é diferença significativa.

[long pause]

Faz a lista.

Não para confrontar ninguém.

Para te confrontares com o quanto te foi inibido.

E a partir desse reconhecimento, decidires o que queres fazer com a inibição residual que ainda te habita.`,
      },
    ],
  },
  {
    id: "curso-o-silencio-que-grita-m2",
    titulo: "Curso O Silêncio que Grita — Módulo 2 (Aulas A, B, C)",
    descricao: "O Código Silencioso da Família. Material de áudio para alunos.",
    scripts: [
      {
        id: "o-silencio-que-grita-m2a",
        titulo: "M2.A — As regras que nunca foram ditas",
        curso: "o-silencio-que-grita",
        texto: `A tua família tem regras.

[pause]

Algumas foram ditas em voz alta — sobre horários, sobre comportamento à mesa, sobre o que se podia fazer ou não na infância.

Outras nunca foram ditas. Mas tu sabes-as todas.

[long pause]

Sabes que, em certos dias do ano, há que estar presente.

Sabes que, com certa pessoa da família, certos assuntos não se mencionam.

Sabes que, em certas situações, há uma resposta esperada de ti — uma postura, um sorriso, um silêncio.

[pause]

Estas regras nunca foram escritas.

Mas tu cumpres todas, automaticamente, há décadas.

[short pause]

E quando, ocasionalmente, alguém da família as quebra, tu sentes — antes da razão se pronunciar — que algo importante foi atravessado.

[long pause]

As regras tácitas são, em muitas famílias, mais poderosas do que as regras explícitas.

[pause]

Porque as explícitas podem ser questionadas.

As tácitas, não. Não estão sequer disponíveis para questionamento, porque a sua existência não é admitida.

[short pause]

A primeira pessoa que questiona uma regra tácita é, normalmente, vista como provocadora ou desrespeitosa — mesmo quando a sua intenção é apenas curiosidade.

[long pause]

Se te puseres a olhar para a tua família com atenção, vais encontrar dezenas destas regras.

[pause]

Que filho recebe o que. Que opiniões podem ser ditas em frente a quem. Quem espera ser cuidado por quem. Quem é responsável por organizar que ocasiões. Quem nunca é chamado a contribuir.

[short pause]

Cada uma destas distribuições foi feita sem reunião familiar, sem voto, sem acordo explícito.

[pause]

Foi-se sedimentando ao longo de gerações.

[long pause]

Esta semana, escolhe uma regra tácita da tua família que tu, hoje em adulta, reconheces.

Escreve-a numa frase: "Na minha família, sem ninguém ter dito, é regra que..."

[pause]

Repara como te sentes ao escrever.

[short pause]

Algumas pessoas, ao escreverem, sentem alívio — finalmente puseram em palavras algo que sempre estava lá.

Outras sentem culpa — como se o simples acto de nomear a regra fosse já uma traição.

[pause]

A culpa, se vier, é informação importante.

Mostra o quão activa a regra ainda é em ti.

[long pause]

Não precisas de quebrar a regra.

Precisas, apenas, de a ver.

[pause]

Porque uma regra vista pode ser, eventualmente, escolhida ou recusada.

Uma regra invisível só pode ser obedecida.`,
      },
      {
        id: "o-silencio-que-grita-m2b",
        titulo: "M2.B — Os rituais tácitos",
        curso: "o-silencio-que-grita",
        texto: `Há rituais na tua família que ninguém chamou de rituais.

[pause]

A forma como se organizam os almoços de domingo. A pessoa que sempre se senta à cabeceira. O acordo silencioso sobre quem traz o quê. A conversa que sempre acontece num determinado momento da refeição.

[long pause]

Tudo isto é coreografia.

Coreografia não escrita, ensaiada ao longo de anos, repetida com fidelidade.

[pause]

E tu, há décadas, executas o teu papel sem o teres escolhido.

[short pause]

Talvez tu sejas a que ajuda a tua mãe na cozinha.

A que faz perguntas educadas a um tio que não te interessa muito.

A que fica até mais tarde a arrumar a louça.

A que liga primeiro nos aniversários.

[pause]

Em alguma ocasião, isto começou.

E continuou. E continuou. E continuou.

[short pause]

Sem ninguém ter ratificado este papel como teu.

[long pause]

Os rituais tácitos têm uma característica perigosa.

[pause]

Quando alguém, em algum momento, decide fazer diferente, há reacção.

A reacção pode ser pequena — uma sobrancelha levantada, um silêncio mais pesado.

Pode ser grande — um comentário ácido, uma queixa indirecta a outras pessoas.

[short pause]

E esta reacção tem efeito.

[pause]

Faz com que, na vez seguinte, a pessoa volte a executar o ritual como antes.

E o ritual continua, geração após geração.

[long pause]

Reconhecer estes rituais não é sentimento de revolta.

É curiosidade.

[pause]

Pergunta-te: que coisas eu faço, em ocasiões familiares, que ninguém propriamente me pediu para fazer mas que toda a gente espera que eu faça?

[short pause]

Lista quatro ou cinco.

Olha para a lista.

[pause]

Cada item é um ritual tácito que sustentas.

[short pause]

Estes rituais, em si, não são bons nem maus.

São coreografia.

[pause]

Mas saberes que existem dá-te a opção de, em algum momento, recusar a tua parte.

[long pause]

Se quiseres experimentar, escolhe um — apenas um — para deixar de fazer numa próxima reunião.

[pause]

Não anuncies. Apenas não faças.

E observa o que acontece.

[short pause]

Algumas vezes, ninguém nota.

Outras, alguém vai notar e vai pedir-te explicitamente — e aí terás de responder.

[pause]

Esta é a primeira pequena conversa real sobre algo que, durante anos, foi assumido sem nunca ser falado.

[short pause]

E destas conversas, ao longo do tempo, transforma-se uma família inteira.`,
      },
      {
        id: "o-silencio-que-grita-m2c",
        titulo: "M2.C — A lealdade sem palavras",
        curso: "o-silencio-que-grita",
        texto: `Em muitas famílias, há uma lealdade que ninguém articula em palavras.

[pause]

A lealdade ao silêncio sobre certos temas. A lealdade à versão oficial dos eventos do passado. A lealdade à imagem pública que a família mostra ao mundo.

[long pause]

Esta lealdade não é negociada.

É absorvida.

[pause]

E os filhos, em particular, são tacitamente recrutados para ela desde muito pequenos.

[short pause]

Aprendem o que se diz fora de casa e o que fica dentro de casa.

Aprendem a versão "oficial" das histórias de família mesmo quando intuem que a versão real é diferente.

Aprendem a defender a família perante pessoas que perguntem demais.

[long pause]

Esta lealdade tácita, em algumas famílias, é leve e relativamente saudável.

Em outras, torna-se um fardo.

[pause]

Quando há, na família, dor que nunca foi processada, abuso que nunca foi reconhecido, ou injustiças sistemáticas que nunca foram nomeadas — a lealdade tácita transforma-se em silêncio cúmplice.

[short pause]

E os membros da família, sem terem escolhido, tornam-se guardiões de algo que, se fosse falado, mudaria muita coisa.

[long pause]

Identificar esta forma de lealdade é, para muitas pessoas, um dos passos mais difíceis na vida adulta.

[pause]

Porque romper a lealdade, mesmo só na própria cabeça, sente-se como traição.

E a traição, para alguém que cresceu numa família com forte lealdade tácita, é tabu emocional.

[short pause]

A pessoa fica numa posição complicada.

Sabe que algo precisa de ser dito.

Sabe que dizê-lo é trair a lealdade.

E a paralisia é o resultado mais frequente.

[long pause]

Há uma distinção que ajuda.

[pause]

Romper a lealdade ao silêncio não é o mesmo que romper a lealdade às pessoas.

Podes continuar a amar a tua família e, ao mesmo tempo, deixar de proteger silêncios que se mantiveram à custa do bem-estar de alguém — talvez teu, talvez de outro membro.

[short pause]

A verdadeira lealdade, em muitos casos, exige falar — não calar.

[pause]

Porque o silêncio cúmplice prolonga sofrimento.

E o falar — quando feito com cuidado, no momento certo, com a pessoa certa — pode ser o gesto mais leal possível.

[long pause]

Esta semana, identifica uma lealdade tácita da tua família que tu, em algum nível, sustentas.

[pause]

Não precisas de a romper agora.

Precisas, apenas, de a ver.

E de te perguntar: a quem é que esta lealdade serve?

[short pause]

Se serve principalmente à manutenção da imagem familiar — e não ao bem-estar das pessoas — talvez precise de ser, em algum momento, revista.

[pause]

Não em explosão pública.

Em pequenas decisões privadas, ao longo dos anos, sobre o que tu vais e não vais continuar a calar.`,
      },
    ],
  },
  {
    id: "curso-o-silencio-que-grita-m3",
    titulo: "Curso O Silêncio que Grita — Módulo 3 (Aulas A, B, C)",
    descricao: "O Que Foi Calado e Pesa. Material de áudio para alunos.",
    scripts: [
      {
        id: "o-silencio-que-grita-m3a",
        titulo: "M3.A — Os segredos que toda a gente sabia",
        curso: "o-silencio-que-grita",
        texto: `Há segredos na tua família que toda a gente sabia.

[pause]

Toda a gente menos tu. Pelo menos durante muito tempo.

[long pause]

Talvez tenhas descoberto, em adolescente ou em adulta, que aquele tio teve um filho fora do casamento. Que aquela tia teve uma depressão grave. Que o avô tinha problemas de dinheiro de que ninguém falava. Que houve um aborto, uma traição, uma quase ruptura.

[pause]

Quando descobriste, a primeira reacção foi espanto.

A segunda foi raiva.

[short pause]

Raiva específica: porque é que toda a gente sabia menos eu?

[long pause]

A resposta não é simples.

A justificação habitual — "queríamos proteger-te" — é parcialmente verdadeira e parcialmente falsa.

[pause]

Verdadeira porque, em criança, não havia capacidade de processar.

Falsa porque, em adulta, o silêncio continuou — não para te proteger, mas para proteger a estrutura familiar.

[short pause]

Estrutura que se mantinha em pé porque ninguém dizia o que sabia.

[long pause]

Esta dinâmica tem nome.

[pause]

A pessoa que é mantida fora da informação é colocada numa posição assimétrica em relação ao resto do grupo.

Os outros sabem mais sobre ti — sobre a tua história, sobre o teu contexto familiar, sobre o que tu carregas — do que tu sabes sobre ti mesma.

[short pause]

E essa assimetria tem efeito.

[pause]

Cresceste em ambiente em que parte da informação sobre a tua família era manipulada acima da tua cabeça.

Isto distorce a forma como percebes o mundo, mesmo em adulta.

[long pause]

Quando finalmente descobres o que toda a gente sabia, há um trabalho específico a fazer.

[pause]

Não tanto sobre o segredo em si.

Sobre o facto de te ter sido escondido.

[short pause]

Esta é a ferida real, muitas vezes mais profunda do que o conteúdo do segredo.

[pause]

A ferida de ter sido tratada como criança até demasiado tarde. De ter sido excluída de informação sobre a tua própria origem. De ter sido considerada incapaz de saber.

[long pause]

Reconciliar-te com isto exige tempo.

[pause]

Não exige confronto com toda a família.

Mas exige reconhecimento honesto de que a omissão foi uma forma de poder — exercido sobre ti, sem o teu consentimento.

[short pause]

E que esta omissão tem consequências legítimas no que tu sentes.

[long pause]

Esta semana, se há algum segredo de família que tu, em adulta, descobriste tarde, escreve uma frase específica num caderno.

"O que mais me magoou neste segredo não foi o conteúdo. Foi..."

[pause]

Completa a frase honestamente.

[short pause]

Provavelmente vais escrever algo como: foi descobrir que durante anos tantas pessoas me olharam sabendo o que eu não sabia.

Ou: foi sentir que sou a última a saber.

Ou: foi perceber que a minha versão da história nunca foi completa.

[pause]

Esta dor merece ser nomeada.

[short pause]

E nomeada, mesmo só em privado, deixa de ocupar espaço difuso e passa a ter contorno reconhecível.

[long pause]

Os segredos que toda a gente sabia podem agora, em adulta, ser tratados como informação.

Não como fonte de vergonha. Não como cumplicidade obrigatória.

Como dado da tua história que finalmente tens em tua posse.`,
      },
      {
        id: "o-silencio-que-grita-m3b",
        titulo: "M3.B — As tragédias sem nome",
        curso: "o-silencio-que-grita",
        texto: `Em quase todas as famílias, há tragédias que nunca foram propriamente nomeadas.

[pause]

Uma morte que ficou em volta de uma palavra ambígua. Uma doença grave de que se falava por insinuação. Um problema mental que nunca foi diagnosticado em voz alta. Uma violência que ficou marcada como "uma coisa que aconteceu".

[long pause]

Estas tragédias não nomeadas têm uma característica particular.

Atravessam gerações.

[pause]

A primeira geração viveu o evento. Talvez parcialmente compreendido, parcialmente reprimido.

A segunda geração ouviu fragmentos. Não sabe a história inteira mas sente o peso.

A terceira geração — talvez tu — não tem versão coerente, mas vive com uma sombra residual sem rosto.

[short pause]

Esta sombra opera silenciosamente.

[pause]

Pode aparecer como ansiedade que tu sentes em relação a certos temas sem saber porquê.

Como receio de certas idades — porque foi naquela idade que a tragédia tocou alguém da família.

Como reactividade em situações que evocam, vagamente, algo que nunca te foi explicado.

[long pause]

Trabalhar com tragédias sem nome exige um movimento específico.

[pause]

Reconstruir, com a informação disponível, a história mais aproximada do que aconteceu.

Não para reviver o trauma.

Para o nomear.

[short pause]

Porque o que tem nome perde grande parte do poder difuso.

[pause]

A tia que teve "uma coisa esquisita aos quarenta anos" pode ter tido depressão pós-parto. A avó que "morreu sem se saber bem" pode ter morrido de cancro do útero por falta de acesso médico. O irmão da bisavó que "desapareceu" pode ter morrido na guerra.

[short pause]

A informação concreta, quando recuperada, dá rosto à sombra.

[long pause]

Recuperar esta informação exige paciência.

Conversas com tias-avós, primas mais velhas, vizinhas antigas que ainda se lembrem.

Documentos: certidões, registos paroquiais, fotografias antigas.

Por vezes, simples imaginação informada — pondo-se na pele de quem viveu a época, perguntando o que era, naquela altura, "uma coisa esquisita".

[pause]

À medida que reconstróis, algo dentro de ti alivia.

[short pause]

A sombra começa a ter contorno.

E o contorno permite trabalho consciente onde antes só havia peso difuso.

[long pause]

Esta semana, escolhe uma tragédia familiar sobre a qual tens informação parcial.

Faz uma lista de tudo o que sabes — mesmo os fragmentos.

[pause]

Depois, faz uma lista de quem ainda está vivo que poderia saber mais.

[short pause]

Identifica uma pessoa. Marca um café com ela, sem agenda explícita.

[pause]

Numa conversa relaxada, pergunta com naturalidade sobre essa parte do passado.

[short pause]

Vais ficar surpreendida com o quanto as pessoas, quando não são confrontadas, contam.

[pause]

Fragmentos vão começar a juntar-se.

E a tragédia sem nome vai começar a ter forma.

[long pause]

Não é ressentimento o que procuras.

É história.

[pause]

A tua história, finalmente conhecida.

E a tua relação com a sombra, finalmente possível.`,
      },
      {
        id: "o-silencio-que-grita-m3c",
        titulo: "M3.C — O que a tua família combinou nunca dizer",
        curso: "o-silencio-que-grita",
        texto: `Em algumas famílias, há um acordo implícito sobre o que nunca será dito em voz alta.

[pause]

Não foi assinado. Não foi explicitado. Mas existe.

[long pause]

Pode ser sobre uma pessoa específica que magoou alguém da família e nunca foi confrontada. Sobre uma injustiça antiga que continua a operar. Sobre uma forma de tratamento desigual entre filhos que toda a gente nota mas ninguém menciona.

[pause]

Este acordo é mantido por todos os membros da família, simultaneamente.

Quando alguém quase o quebra, há uma reacção colectiva — quase como se o ar mudasse.

[short pause]

Tu sentes-a, mesmo quando não consegues nomeá-la.

[long pause]

Os acordos de "nunca dizer" têm grande poder porque dependem da participação de todos.

[pause]

Se uma só pessoa começar a dizer, o acordo enfraquece.

E é por isso que tantas famílias têm formas subtis — e não tão subtis — de pressionar quem ameaça quebrá-lo.

[short pause]

A pessoa que tenta nomear é, muitas vezes, marginalizada.

Etiquetada como "complicada", como "demasiado sensível", como "a que faz sempre questão de complicar tudo".

[pause]

Esta etiquetagem é instrumento de pressão.

Funciona porque, em ambientes familiares, a marginalização emocional dói genuinamente.

[long pause]

Se tu, em alguma altura da tua vida adulta, tentaste falar de algo que a família combinou nunca dizer — provavelmente experimentaste esta pressão.

[pause]

E talvez tenhas recuado.

Não por cobardia. Por sensatez.

[short pause]

A sensatez de perceber que o custo de insistir era, naquele momento, maior do que o benefício.

[pause]

Recuar foi escolha legítima.

[long pause]

Mas o assunto, mesmo silenciado, continua.

[pause]

E há uma pergunta que vale a pena fazer-te a ti mesma agora, em silêncio.

[short pause]

O custo de continuar a manter este silêncio é maior ou menor do que o custo de finalmente o quebrar?

[pause]

A resposta varia muito conforme a pessoa, a situação, e a fase da vida.

[short pause]

Em alguns casos, a resposta sincera é: continua a valer a pena calar. As pessoas envolvidas estão velhas, frágeis, ou ausentes. Quebrar o silêncio só serviria para gerar dor sem benefício real.

Em outros casos, a resposta sincera é: já não vale a pena calar. O silêncio está a custar-me em saúde, em qualidade de relação, em autenticidade.

[long pause]

Não há regra universal.

Há resposta tua, neste momento da tua vida.

[pause]

E a única forma de chegar à resposta é fazer a pergunta — sem fugir dela.

[short pause]

Esta semana, pega no caderno.

Escreve no topo da página: o que é que a minha família combinou nunca dizer?

[pause]

Lista os assuntos que te vêm à cabeça.

Em frente a cada um, escreve duas linhas: o que custa continuar a calar, e o que custaria começar a falar.

[short pause]

Não é decisão para tomar agora.

É clareza para ter agora.

[pause]

E a clareza, mesmo sem decisão imediata, muda a forma como tu, daqui em diante, vais viver com estes silêncios.

[long pause]

Algumas famílias só conseguem mudar quando alguém tem coragem de quebrar acordos antigos.

Outras famílias mudam menos do que se gostaria.

[pause]

Mas mesmo nas que mudam pouco, tu — internamente — podes mudar.

[short pause]

E isto, ao longo do tempo, transforma a forma como habitas a tua família de origem.

[pause]

Mesmo quando ela continua, à superfície, exactamente como sempre foi.`,
      },
    ],
  },
  {
    id: "curso-o-silencio-que-grita-m4",
    titulo: "Curso O Silêncio que Grita — Módulo 4 (Aulas A, B, C)",
    descricao: "A Criança que Ouviu Sem Entender. Material de áudio para alunos.",
    scripts: [
      {
        id: "o-silencio-que-grita-m4a",
        titulo: "M4.A — Conversas que absorveste sem perceber",
        curso: "o-silencio-que-grita",
        texto: `Quando és pequena, estás a ouvir o tempo todo.

[pause]

Mesmo quando estás a brincar. Mesmo quando pareces distraída. Mesmo quando os adultos pensam que tu não estás a prestar atenção.

[long pause]

A capacidade auditiva de uma criança é muito mais activa do que os adultos imaginam.

[pause]

Tu estavas, sem saber, a guardar.

A entoação das vozes. As pausas estranhas. As palavras que não compreendias mas que ficavam.

[short pause]

Anos depois, em adulta, certas frases voltam-te à cabeça vindas do nada.

E tu não sabes onde as ouviste.

[pause]

Não sabes — mas elas existem. Estão lá, registadas, à espera.

[long pause]

Esta absorção infantil é particularmente activa em conversas de adultos sobre temas que envolvem emoção forte.

[pause]

Discussões em voz baixa que tu não eras suposta ouvir.

Conversas telefónicas em que a tua mãe falava de algo importante e tu, do outro lado da porta, captavas fragmentos.

Frases ditas a um adulto sobre outro adulto, com tom diferente do habitual.

[short pause]

Estes momentos ficaram registados em ti.

Mesmo sem contexto. Mesmo sem compreensão.

[long pause]

Em adulta, isto pode aparecer de formas estranhas.

[pause]

Reagir intensamente a uma situação que, racionalmente, não deveria provocar tanto.

Sentir aversão a uma pessoa que mal conheces porque algo nela te recorda alguém de quem ouviste falar em criança.

Ter intuições sobre dinâmicas familiares que não tens explicação racional para sustentar.

[short pause]

Estas reacções não são imaginação.

São o resultado de informação que absorveste antes de ter linguagem para a processar.

[pause]

E que continua a operar dentro de ti, em silêncio.

[long pause]

Reconhecer esta absorção é parte do trabalho de auto-conhecimento adulto.

[pause]

Não para acusar quem falou na tua presença sem te respeitar.

Para perceberes que parte do que tu sentes hoje vem de informação que entrou em ti antes da tua capacidade de filtrar.

[short pause]

Esta perspectiva muda a forma como tu olhas para certas das tuas reacções.

[pause]

Deixam de ser irracionais.

Tornam-se ecos de algo que entrou e ficou.

[long pause]

Esta semana, escreve numa folha três reacções tuas — em adulta — que sempre te pareceram desproporcionais.

Pessoas com quem tens dificuldade sem razão clara. Lugares que evitas sem saber porquê. Conversas que te activam mais do que parece justificado.

[pause]

Em frente a cada uma, escreve uma segunda coluna: que conversa de adultos podes ter ouvido em criança que se relacionasse com isto?

Tia em depressão. Discussão financeira. Doença que ninguém explicava. Ausência de alguém. Frase repetida sobre certo tipo de pessoa.

[short pause]

Não precisas de certeza. Podes escrever "talvez" ou pôr um ponto de interrogação.

[pause]

Olha para as duas colunas em paralelo.

[short pause]

Para algumas reacções, vais encontrar correspondência clara — e isso, sozinho, alivia.

Para outras, a resposta vai chegar nas semanas seguintes, em conversas com familiares ou em memórias que sobem do nada.

[pause]

Volta à folha quando isso acontecer. Adiciona o que aparecer.

Aos poucos, o mapa entre o que ouviste em criança e o que sentes em adulta começa a desenhar-se.`,
      },
      {
        id: "o-silencio-que-grita-m4b",
        titulo: "M4.B — Cenas que ficaram sem tradução",
        curso: "o-silencio-que-grita",
        texto: `Há cenas, na tua infância, que tu te lembras com clareza visual mas sem perceber o que aconteceu.

[pause]

Uma discussão entre os teus pais, da qual te lembras das caras mas não das palavras exactas.

Uma vez em que choraste e ninguém te perguntou porquê.

Um momento em que sentiste que algo grave estava a acontecer mas ninguém te explicou.

[long pause]

Estas cenas ficaram em ti como imagens sem legenda.

Estão lá. Mas não tens narrativa que as integre.

[pause]

E o cérebro humano, quando não tem narrativa, faz uma de duas coisas.

Inventa. Ou enterra.

[short pause]

Se inventou, tu cresceste com uma versão da cena que pode não corresponder ao que realmente se passou.

Se enterrou, a cena ficou armazenada num sítio onde quase não tens acesso — mas que continua a influenciar o teu sistema nervoso.

[long pause]

Em adulta, podes recuperar parte da tradução destas cenas.

[pause]

Não a tradução exacta — essa muitas vezes já não é possível.

Mas tradução suficiente para a cena fazer sentido como evento, em vez de ficar como imagem suspensa sem significado.

[short pause]

Para isto, há um trabalho lento que vale a pena.

[pause]

Conversas com pessoas que estavam por perto na altura. Tias. Primas. Vizinhos antigos. Pessoas que talvez se lembrem do contexto que tu não tens.

[long pause]

Quando perguntas com calma, sem dramatizar, muitas vezes recebes pedaços que dão sentido.

[pause]

"Aquela discussão? Foi quando descobriram a doença do teu avô."

"Aquela tarde em que choraste? A tua mãe estava a atravessar a depressão dela."

"Aquele momento? Acho que foi quando o teu pai recebeu a notícia do despedimento."

[short pause]

Pequenas frases que, juntas, transformam imagens em narrativas.

[pause]

E narrativas, mesmo as difíceis, dão alívio que imagens suspensas não dão.

[long pause]

Porque as narrativas têm princípio, meio e — sobretudo — fim.

As imagens suspensas continuam a flutuar dentro de ti como se ainda estivessem em curso.

[pause]

Mesmo décadas depois.

[short pause]

Traduzir uma cena antiga é, em certa medida, fechá-la.

Não significa esquecê-la. Significa pô-la num lugar onde já não opera no presente como se estivesse a acontecer agora.

[long pause]

Esta semana, escolhe uma cena da tua infância que te lembras visualmente mas que nunca teve tradução clara.

Escreve-a num caderno. Em detalhe. Tudo o que te lembras visualmente.

[pause]

Depois, faz uma lista de quem ainda está vivo e estava por perto na altura.

Identifica uma pessoa para conversar.

[short pause]

Sem agenda dramática. Apenas: lembras-te daquele dia em que aconteceu X?

[pause]

A resposta, mesmo parcial, vai começar a dar legenda à imagem que durante anos ficou em silêncio.

[short pause]

E, com a legenda, vem alívio que tu nem sabias que estava à espera.`,
      },
      {
        id: "o-silencio-que-grita-m4c",
        titulo: "M4.C — As tuas memórias partidas",
        curso: "o-silencio-que-grita",
        texto: `Algumas das tuas memórias de infância estão partidas.

[pause]

Não no sentido de estarem traumáticas — embora algumas possam estar.

No sentido de estarem fragmentadas. Incompletas. Com pedaços em falta.

[long pause]

Lembras-te do princípio de uma cena mas não do fim. Lembras-te do fim mas não do princípio. Lembras-te de uma sensação intensa mas não do contexto que a gerou.

[pause]

Estas memórias partidas são particularmente comuns em famílias com muito silêncio.

[short pause]

Porque o silêncio impediu que os eventos importantes fossem comentados, contados, processados.

[pause]

E sem processamento partilhado, o cérebro não consegue construir memórias coerentes.

[long pause]

Imagina uma cena difícil em que a família, depois, conversa entre si sobre o que aconteceu.

Cada membro acrescenta detalhes. Discutem. Lembram-se em conjunto.

[pause]

A criança presente, mesmo sem participar na conversa, beneficia.

A cena ganha contorno através das vozes dos adultos.

E a memória forma-se, ao longo dos anos, com clareza.

[short pause]

Agora imagina a mesma cena, mas com silêncio depois.

Ninguém comenta. Ninguém processa em conjunto. Tudo continua como se nada tivesse acontecido.

[pause]

A criança fica com uma memória sem ancoragem partilhada.

E a memória, isolada, fragmenta.

[long pause]

Tu, hoje em adulta, podes ter dezenas destas memórias fragmentadas.

[pause]

E a sensação difusa de que partes da tua infância são mistério mesmo para ti.

[short pause]

Não tens ainda forma de as completar inteiramente — porque o tempo passou e os adultos que poderiam ajudar nem sempre estão disponíveis.

Mas há algo que podes fazer.

[long pause]

Escrever as memórias partidas, exactamente como elas estão.

[pause]

Sem tentar completá-las. Sem inventar o que falta. Sem forçar coerência.

Apenas: este pedaço lembro, este pedaço não.

[short pause]

Esta escrita honesta, em si mesma, tem efeito.

[pause]

Porque a memória partida, quando reconhecida como partida, deixa de funcionar como verdade absoluta sobre a tua infância.

Passa a ser fragmento — entre outros — de uma história mais vasta que tu nunca tiveste em mãos.

[long pause]

E muitas mulheres descobrem, ao escrever, que algumas memórias começam a recompor.

[pause]

Não imediatamente. Ao longo dos meses.

Pedaços que estavam separados começam a juntar-se.

Memórias semelhantes ajudam-se mutuamente.

E o mosaico, lentamente, mostra mais imagem do que tinhas.

[short pause]

Não vais reconstruir tudo.

Mas vais reconstruir o suficiente para sentires que conheces a tua história — em vez de a temeres como bloco escuro.

[long pause]

Esta semana, escolhe três memórias de infância que sentes incompletas.

Escreve cada uma honestamente. Com os buracos preservados como buracos.

[pause]

Guarda o caderno num sítio onde possas voltar.

[short pause]

E, quando uma nova lembrança surgir nas próximas semanas — em sonho, em conversa, em momento inesperado — adiciona-a ao caderno.

[pause]

A reconstrução de uma infância silenciada é trabalho de anos.

Mas começa com uma decisão simples: deixar de aceitar o silêncio como verdade final.

[short pause]

E começar, em privado, a juntar o que ainda é possível juntar.

[long pause]

Não vais ficar com a história inteira.

Mas vais ficar com história suficiente para já não viveres como órfã da tua própria infância.`,
      },
    ],
  },
  {
    id: "curso-o-silencio-que-grita-m5",
    titulo: "Curso O Silêncio que Grita — Módulo 5 (Aulas A, B, C)",
    descricao: "O Silêncio na Tua Vida Adulta. Material de áudio para alunos.",
    scripts: [
      {
        id: "o-silencio-que-grita-m5a",
        titulo: "M5.A — O que continuas a não dizer",
        curso: "o-silencio-que-grita",
        texto: `Há uma frase que tu, em adulta, ainda não disseste.

[pause]

A alguém específico. Sobre algo específico.

E que continua a pesar exactamente porque continua por dizer.

[long pause]

Pode ser uma frase a um pai, a uma mãe, a um irmão, a um parceiro, a uma amiga antiga.

Pode ser sobre uma situação concreta — algo que aconteceu há anos.

Ou sobre uma sensação acumulada — algo que se foi formando ao longo do tempo.

[pause]

Tu sabes qual é a frase.

[short pause]

Mesmo agora, ao ouvires isto, ela apareceu na tua cabeça com clareza.

[long pause]

E há uma parte de ti que tem desculpas há anos.

"Não vale a pena. Não muda nada."

"Vai magoar a outra pessoa."

"Vou parecer dramática."

"Já passou tanto tempo."

[pause]

Estas desculpas têm uma parte de verdade.

Talvez a frase, dita agora, não mude completamente a relação.

Talvez magoe.

[short pause]

Mas a verdade que as desculpas escondem é outra.

[pause]

A frase não dita continua a operar dentro de ti.

E o custo de não a dizer é, muitas vezes, maior do que o custo de a dizer.

[long pause]

O custo de não dizer aparece em sítios subtis.

[pause]

Tensão no corpo quando vês a pessoa.

Sonhos repetitivos com o tema.

Pensamentos involuntários sobre a frase em momentos calmos do dia.

Frustração que te aparece sem razão aparente nessa relação.

[short pause]

Tudo isto é o silêncio a cobrar.

[pause]

Em silêncio. Mas continuamente.

[long pause]

A decisão de dizer ou não dizer é tua e só tua.

[pause]

Mas a decisão deve ser feita com consciência do custo de cada via.

Não com consciência só do custo de dizer.

[short pause]

A maioria das pessoas calcula apenas o risco de falar.

Quase nunca calcula o que é, todos os dias, manter o silêncio.

[long pause]

Esta semana, identifica uma frase tua que está há demasiado tempo por dizer.

Escreve-a num caderno.

Escreve, debaixo, duas listas.

[pause]

À esquerda: o que custa não dizer. (Com honestidade.)

À direita: o que poderia custar dizer.

[short pause]

Olha para as duas.

[pause]

A decisão informada exige ver as duas em paralelo.

[short pause]

Não decidas agora.

Apenas vê.

[long pause]

E nas próximas semanas, vais começar a sentir, com mais clareza, o que faz sentido.

[pause]

Algumas frases vão continuar legitimamente caladas.

Outras vão começar a pedir, com força crescente, para sair.

[short pause]

E quando uma delas estiver pronta — a urgência interna vai deixar saber — vais ter capacidade nova para a dizer com cuidado, no momento certo.

[pause]

Não em explosão.

Em conversa preparada, num lugar tranquilo, com a pessoa certa.

[long pause]

E a frase, dita finalmente, vai libertar dentro de ti um espaço que tu não sabias que estava ocupado.

[pause]

Espaço que pode, agora, ser preenchido com outra coisa.`,
      },
      {
        id: "o-silencio-que-grita-m5b",
        titulo: "M5.B — As relações com silêncios pesados",
        curso: "o-silencio-que-grita",
        texto: `Em algumas relações da tua vida adulta, há um silêncio pesado.

[pause]

Não é silêncio de paz.

É silêncio de coisas por dizer que ambos os lados sabem que existem — mas que ninguém quer abrir.

[long pause]

Estas relações funcionam por evitamento.

Há temas que se contornam. Há perguntas que não se fazem. Há respostas que se aceitam mesmo sabendo que são parciais.

[pause]

E tudo isto cria uma forma específica de cumplicidade.

[short pause]

Cumplicidade no silêncio.

Onde os dois lados são, em alguma medida, guardiões de algo que prefeririam não enfrentar.

[long pause]

Estas relações têm vantagem clara.

Não há explosões. Não há crises. A relação dura.

[pause]

Têm também desvantagem profunda.

Não há intimidade real. Não há crescimento. A relação fica num estado intermédio que nunca aprofunda.

[short pause]

Ambos os lados acabam, com o tempo, a sentir uma forma específica de solidão.

[pause]

A solidão de estar acompanhada por alguém que, na verdade, não conhece partes essenciais de ti.

E vice-versa.

[long pause]

Esta solidão é particularmente comum em casamentos longos, em relações com pais, em algumas amizades antigas.

[pause]

Pessoas que estão fisicamente próximas de ti.

E emocionalmente mantidas a uma distância específica.

[short pause]

Por acordo silencioso de não atravessar certas zonas.

[long pause]

Há um momento, na vida adulta, em que muitas mulheres começam a notar este custo.

[pause]

E uma decisão precisa de ser feita.

[short pause]

Continuar como está. Aceitando a relação no seu formato actual, com plena consciência das suas limitações.

Ou tentar, em algum ponto, atravessar uma das zonas evitadas.

[pause]

A segunda opção é arriscada.

Pode aprofundar a relação. Pode também rompê-la.

[short pause]

Não há garantia.

[long pause]

Mas a primeira opção também tem custo.

[pause]

Continuar a aceitar uma relação parcial significa aceitar uma vida em que partes tuas não são vistas pelas pessoas próximas.

E a invisibilidade prolongada, no longo prazo, custa cara.

[long pause]

Esta semana, identifica uma relação tua em que há silêncio pesado.

Não a primeira que te ocorrer. Aquela que continua a aparecer mesmo quando tentas ignorá-la.

[pause]

Pega num papel.

Em cima, escreve o nome dessa pessoa.

Por baixo, faz duas listas curtas.

[short pause]

Lista A: os três temas que vocês os dois evitam.

Lista B: o que cada um destes silêncios já te custou — em sono, em corpo, em qualidade de presença na relação.

[pause]

Olha para as duas listas em conjunto.

[short pause]

Esta visualização — concreta, escrita — torna visível o que normalmente fica difuso na cabeça.

[pause]

Não tens de tomar decisão imediata.

Mas, com as duas listas em frente, podes começar a sentir, com mais clareza, qual delas pesa mais.

[short pause]

Algumas relações merecem ser tentadas com nova honestidade.

Outras merecem ser aceites no formato actual, com plena consciência.

[pause]

Nenhuma merece a ilusão de que está tudo bem quando, dentro de ti, tu sabes que não está.`,
      },
      {
        id: "o-silencio-que-grita-m5c",
        titulo: "M5.C — O silêncio com quem mais amas",
        curso: "o-silencio-que-grita",
        texto: `Os silêncios mais difíceis da tua vida adulta são, muitas vezes, com as pessoas que tu mais amas.

[pause]

Não com inimigas. Não com colegas distantes.

Com a tua mãe. Com o teu parceiro. Com os teus filhos.

[long pause]

Estes silêncios são particularmente difíceis porque o amor está envolvido.

[pause]

Falar implica risco real. A relação importa demasiado para arriscar comprometê-la.

E então cala-se.

Por amor — paradoxalmente.

[short pause]

Calar por amor é uma das formas mais nobres e, ao mesmo tempo, mais corrosivas de relação.

[pause]

Nobre porque preserva a relação no curto prazo.

Corrosiva porque, no longo prazo, esvazia-a.

[long pause]

A questão complicada é que a maioria das pessoas que cala por amor não percebe que o amor próprio também precisa de espaço.

[pause]

Calar por amor pelo outro, mas em prejuízo do amor por si — é equação impossível ao longo dos anos.

[short pause]

Acumula. E uma vez instalado o silêncio em relação a uma pessoa amada, tudo o que vem depois cresce sob esse silêncio.

[pause]

Os anos vão passando.

E a pessoa amada começa a tornar-se, paradoxalmente, mais distante quanto mais tempo se evita falar.

[long pause]

Reconhecer isto não te obriga a falar imediatamente.

[pause]

Obriga, sim, a perceber que o silêncio é escolha activa — mesmo quando se disfarça de gentileza.

[short pause]

E que a escolha tem consequências.

[pause]

Algumas consequências boas. Estabilidade. Continuidade.

Outras consequências menos boas. Distância silenciosa. Solidão dentro da intimidade aparente.

[long pause]

Há, em algumas relações com pessoas amadas, uma altura em que se torna clara a necessidade de uma conversa.

[pause]

Essa altura raramente é convidativa.

Aparece em momentos inesperados — depois de um pequeno desentendimento, num jantar tranquilo, durante uma viagem.

[short pause]

E se tu reparares, e tiveres coragem, podes seguir a abertura.

[pause]

A conversa difícil que se segue pode ser confusa. Pode ser dolorosa. Pode ser inconclusiva.

Mas é, quase sempre, libertadora.

[long pause]

Porque liberta a relação do peso acumulado de tudo o que estava por dizer.

[pause]

Mesmo que a conversa não resolva tudo, a relação muda.

Passa a ter ar.

[short pause]

E pessoas amadas que, durante anos, viviam em silêncio uma com a outra começam, lentamente, a falar com mais liberdade.

[long pause]

Esta semana, identifica uma pessoa que tu amas e com quem há silêncio pesado.

[pause]

Não para forçar uma conversa.

Para te preparares para o momento em que a oportunidade aparecer.

[short pause]

Escreve, em privado, o que tu gostarias de dizer se a oportunidade chegasse.

Em frases simples, sem retórica.

[pause]

Esta escrita prepara-te.

Para que, quando o momento vier — e vem sempre, quando estás aberta —, tu tenhas as palavras prontas.

[short pause]

Não para as recitares.

Para teres clareza interna sobre o essencial.

[long pause]

O silêncio com quem amas não tem de durar para sempre.

[pause]

Mas só termina quando alguém — quase sempre tu — decide que prefere o desconforto da verdade ao conforto da distância silenciosa.

[short pause]

Esta é, em muitas relações importantes, a decisão mais corajosa da vida adulta.`,
      },
    ],
  },
  {
    id: "curso-o-silencio-que-grita-m6",
    titulo: "Curso O Silêncio que Grita — Módulo 6 (Aulas A, B, C)",
    descricao: "Quebrar o Ciclo. Material de áudio para alunos.",
    scripts: [
      {
        id: "o-silencio-que-grita-m6a",
        titulo: "M6.A — A primeira pergunta que podes fazer",
        curso: "o-silencio-que-grita",
        texto: `Para quebrar um ciclo de silêncio familiar, raramente se começa por uma declaração.

[pause]

Começa-se por uma pergunta.

[long pause]

Uma pergunta pequena, feita num momento tranquilo, sobre um tema que sempre foi evitado.

Sem dramatizar. Sem agenda visível. Apenas curiosidade serena.

[pause]

A primeira pergunta tem efeito desproporcional ao seu tamanho.

[short pause]

Porque mesmo a pergunta mais simples, sobre um tema que durante décadas foi cercado de silêncio, abre uma porta.

[pause]

A outra pessoa pode passar pela porta.

Pode também recuar.

Mas a porta foi aberta — e isso, sozinho, muda algo.

[long pause]

A escolha da primeira pergunta é importante.

[pause]

Não deve ser pergunta-armadilha. Não deve ser pergunta carregada. Não deve forçar uma resposta específica.

Deve ser pergunta genuína, que admite múltiplas respostas — incluindo "não me lembro" ou "não quero falar disso".

[short pause]

A função da primeira pergunta não é obter informação completa.

É demonstrar que tu, como adulta, tens interesse em conhecer.

[pause]

E que estás disponível para ouvir o que vier — sem julgamento.

[long pause]

Esta postura, quando é genuína, costuma desbloquear coisas.

[pause]

Pessoas mais velhas, em particular, têm muitas vezes vontade não-expressa de partilhar histórias da família que ninguém lhes pediu para contar.

A primeira pergunta abre essa possibilidade.

[short pause]

E, com paciência, vão começando a contar.

[long pause]

Esta semana, identifica uma pessoa mais velha da tua família com quem possas tentar uma primeira pergunta.

Pode ser a tua mãe, uma tia, uma prima mais velha, mesmo uma amiga antiga da família.

[pause]

Escolhe um momento sem pressa.

Um café tranquilo. Uma visita sem agenda definida.

[short pause]

E faz uma única pergunta — sobre algo da família que sempre te intrigou.

[pause]

Não pergunta acusatória. Pergunta curiosa.

"Lembras-te de como era a vida no tempo da tua avó?"

"Sabes por que é que aqueles dois tios não se falavam?"

"Como é que a família atravessou aquela altura difícil?"

[long pause]

E depois cala-te.

Escuta.

Sem interromper.

[pause]

Vais ficar surpreendida com o que aparece.

E mais surpreendida com o quanto tu, depois, vais sentir-te diferente em relação à tua família.

[short pause]

Porque uma pergunta feita honestamente, e uma resposta recebida sem julgamento, podem mudar a temperatura emocional de uma relação inteira — em uma única conversa.

[pause]

E essa mudança de temperatura, repetida ao longo dos meses com outras perguntas, é o início real da quebra do ciclo de silêncio.`,
      },
      {
        id: "o-silencio-que-grita-m6b",
        titulo: "M6.B — A conversa que ninguém quis ter",
        curso: "o-silencio-que-grita",
        texto: `Há uma conversa, na tua família, que ninguém quis ter.

[pause]

Talvez a conversa sobre a doença mental de alguém. Sobre a verdade do divórcio dos pais. Sobre uma morte que ficou mal contada. Sobre uma escolha que dividiu a família.

[long pause]

Esta conversa, quando finalmente é tida, costuma ser feita por uma pessoa.

Uma pessoa que, em algum momento, decide que prefere o desconforto da verdade ao conforto continuado do silêncio.

[pause]

Essa pessoa raramente é a mais velha. Raramente é a mais autoritária.

É, muitas vezes, uma mulher de meia-idade que, por razões que nem sempre consegue articular, não suporta mais o silêncio.

[short pause]

Talvez sejas tu.

[pause]

Ou talvez vás ser, em algum ponto.

[long pause]

Ter esta conversa exige preparação.

Não preparação para confrontar. Preparação para conduzir um processo difícil com cuidado.

[pause]

Primeiro, escolhe a pessoa certa.

Não toda a família ao mesmo tempo. Uma pessoa.

Aquela com quem a conversa pode efectivamente acontecer com alguma profundidade.

[short pause]

Segundo, escolhe o momento certo.

Não numa ocasião familiar formal. Não em momento de crise.

Num encontro privado, num lugar tranquilo, com tempo suficiente.

[pause]

Terceiro, escolhe a forma certa.

Não acusação. Não interrogatório.

Convite.

[long pause]

Frase tipo: "Há uma coisa de que nunca falámos e que tem estado em mim. Podemos falar?"

[pause]

Esta abertura é poderosa precisamente porque é simples.

Não dramatiza. Não acusa. Apenas reconhece que há algo por dizer.

[short pause]

E dá à outra pessoa a possibilidade de aceitar ou recusar.

[pause]

Algumas pessoas aceitam imediatamente, com alívio.

Outras precisam de tempo.

Algumas recusam — e isso também é resposta válida.

[long pause]

Se a pessoa aceita, a conversa pode tomar muitas direcções.

[pause]

Tu não controlas o que vai aparecer. Só controlas a tua presença, a tua escuta, e a tua honestidade no que tu mesma trouxeres.

[short pause]

Esta conversa, mesmo quando é difícil, costuma deixar ambos os lados com sensação específica.

Cansaço pelo esforço.

E, ao mesmo tempo, alívio profundo.

[pause]

Alívio de que algo finalmente foi posto em palavras, depois de anos a operar em silêncio.

[long pause]

Identifica, esta semana, a conversa que ninguém quis ter na tua família.

Identifica também a pessoa com quem podia ser tida.

[pause]

Escreve, num papel, a frase de abertura que tu usarias.

A frase concreta. A real. A que tu, se a coragem aparecesse, ias dizer.

[short pause]

Depois, num momento em que estejas sozinha em casa, lê a frase em voz alta.

Em frente a um espelho, se quiseres. Ou simplesmente para o ar.

[pause]

Lê devagar. Como se a outra pessoa estivesse à tua frente.

[short pause]

Vai sentir, no corpo, como é.

[pause]

A primeira vez é estranha. A segunda também.

À terceira ou quarta, a frase começa a sair com peso natural — em vez de forçado.

[short pause]

Esta prática privada faz duas coisas.

Familiariza o corpo com a frase. E mostra-te se a frase tal como está formulada serve, ou se precisa de ajuste antes de ser dita à pessoa real.

[long pause]

Não vais marcar a conversa só pelo facto de teres ensaiado.

Mas quando o momento certo aparecer — em jantar tranquilo, em conversa que abre por acaso — a frase vai estar disponível na tua boca.

Pronta para sair sem hesitação.

[short pause]

E a conversa que ninguém quis ter pode, finalmente, começar a acontecer.

[long pause]

Não para resolver tudo de uma vez.

Para iniciar um processo de honestidade que, lentamente, vai libertar a família inteira de pesos que durante décadas foram suportados por todos sem nunca serem nomeados.`,
      },
      {
        id: "o-silencio-que-grita-m6c",
        titulo: "M6.C — Falar sem ter respostas todas",
        curso: "o-silencio-que-grita",
        texto: `Há uma razão pela qual muitas pessoas nunca abrem conversas difíceis.

[pause]

Sentem que precisam de ter respostas todas antes de começar.

[long pause]

Esta crença é falsa — e muito limitante.

[pause]

Porque conversas difíceis raramente requerem que tu chegues com tudo claro.

Requerem, sim, que tu chegues com disponibilidade para descobrir, em conjunto com a outra pessoa, o que vocês não conseguiam descobrir sozinhos.

[short pause]

Esta diferença é fundamental.

[pause]

A pessoa que espera ter todas as respostas para começar a conversa nunca começa.

Porque, em temas difíceis, as respostas todas raramente existem.

[long pause]

A pessoa que aceita começar com perguntas em vez de respostas, com hesitação em vez de certezas, descobre algo importante.

[pause]

A conversa em si gera entendimento que nenhum dos dois lados tinha sozinho.

[short pause]

Isto é particularmente verdadeiro em conversas familiares.

[pause]

Porque cada pessoa carrega uma versão parcial dos eventos. E cada versão parcial, quando partilhada com honestidade, ilumina as outras.

[long pause]

Tu podes começar uma conversa difícil com uma frase como: "Estou a tentar perceber uma coisa e não tenho ainda clareza. Posso pensar em voz alta contigo?"

[pause]

Esta frase muda completamente a dinâmica.

[short pause]

A outra pessoa não se sente atacada — porque tu não chegaste com acusação.

A outra pessoa não se sente forçada a ter respostas — porque tu também não tens.

[pause]

E o que se cria é um espaço de exploração partilhada — em vez de confrontação.

[long pause]

Nem todas as conversas difíceis precisam de chegar a conclusão.

[pause]

Muitas valem a pena pelo simples facto de terem acontecido.

Por mostrarem a ambos os lados que o tema pode ser falado, mesmo que não seja resolvido.

[short pause]

E esta demonstração — de que se pode falar — abre a possibilidade de outras conversas no futuro.

[pause]

Conversas que vão sendo cada vez mais aprofundadas, à medida que a confiança no formato se instala.

[long pause]

Esta semana, se tens uma conversa difícil pendente, experimenta uma coisa nova.

Não esperes ter clareza completa antes de começar.

[pause]

Começa com a clareza parcial que tens.

Convida a outra pessoa a explorar contigo.

E aceita, à partida, que a conversa pode terminar sem conclusão definitiva.

[short pause]

Não é ineficiência.

É honestidade sobre como funcionam, na realidade, as conversas verdadeiramente difíceis.

[pause]

E é a única forma de muitas dessas conversas começarem alguma vez a acontecer.

[long pause]

A clareza completa raramente vem antes da conversa.

Vem durante. E continua a chegar nas semanas e meses seguintes — à medida que tu e a outra pessoa processam o que foi dito.

[pause]

Mas para esse processo todo começar, alguém precisa de aceitar começar sem a clareza completa.

[short pause]

E, nas tuas relações importantes, essa pessoa, muitas vezes, és tu.

[long pause]

Aceita ir com perguntas.

Aceita ir com hesitação.

Aceita ir com clareza parcial.

[pause]

E começa.

[short pause]

A clareza vem.

Mas só depois — não antes — da conversa começar.`,
      },
    ],
  },
  {
    id: "curso-o-silencio-que-grita-m7",
    titulo: "Curso O Silêncio que Grita — Módulo 7 (Aulas A, B, C)",
    descricao: "O Custo de Continuar Calada. Material de áudio para alunos.",
    scripts: [
      {
        id: "o-silencio-que-grita-m7a",
        titulo: "M7.A — O que o silêncio consome",
        curso: "o-silencio-que-grita",
        texto: `O silêncio prolongado consome.

[pause]

Não com explosão. Com lentidão.

[long pause]

Cada coisa que tu cala — em relações, em família, em trabalho — ocupa, dentro de ti, uma porção pequena de espaço.

Sozinha, é insignificante.

[pause]

Acumulada ao longo dos anos, é peso que tu já mal consegues quantificar.

[short pause]

Porque o peso do silêncio não aparece num exame médico.

Não aparece numa balança.

Aparece em sintomas difusos que tu chamas cansaço, idade, stress.

[long pause]

Mas o silêncio, na verdade, está a fazer trabalho dentro de ti.

[pause]

Trabalho de manter o que ficou por dizer organizado e contido.

Trabalho de gerir as emoções associadas a esse não-dito.

Trabalho de recordar — todos os dias, mesmo sem te aperceberes — qual a versão que se mantém perante quem.

[short pause]

Este trabalho consome energia.

Energia que poderia estar disponível para outras coisas.

[long pause]

A maioria das mulheres com silêncios acumulados, em algum ponto da meia-idade, sente uma exaustão que não se explica pela rotina.

[pause]

Médicos diagnosticam fadiga adrenal. Stress crónico. Burnout.

Por vezes, todos correctos.

Mas raramente alguém pergunta: quanto silêncio tu carregas?

[short pause]

Esta pergunta podia ser, em muitos casos, a mais reveladora de todas.

[pause]

Porque o silêncio carregado durante décadas é, em si mesmo, condição de saúde mental e física.

[long pause]

A boa notícia é que o efeito de quebrar o silêncio é mais rápido do que se imagina.

[pause]

Uma única conversa importante, tida ao fim de anos de silêncio, pode aliviar o sistema nervoso de forma que se nota dentro de poucas semanas.

[short pause]

Sono que melhora. Tensão que diminui. Energia que reaparece em sítios onde não estava.

[pause]

Não é magia. É a libertação de recursos que estavam alocados a manter o silêncio.

[long pause]

Esta semana, faz uma estimativa privada.

Quantos silêncios importantes tu carregas neste momento?

[pause]

Não precisa de ser exacto.

Apenas ordem de grandeza. Cinco? Dez? Vinte?

[short pause]

E pergunta-te, com honestidade: qual seria o efeito, no meu corpo, de quebrar três deles ao longo do próximo ano?

[pause]

Não todos.

Três.

[short pause]

Esta possibilidade — concreta, limitada, exequível — pode ser a base de uma decisão consciente sobre como tu vais gastar a tua energia nos próximos doze meses.

[long pause]

Manter os silêncios todos é continuar a pagar o preço.

Quebrar três pode reduzir o preço significativamente — sem te exigir transformação dramática.

[pause]

Esta é, em muitas vidas adultas, a economia emocional mais importante que se pode fazer.

[short pause]

E, ao contrário das economias materiais, esta tem efeito imediato no corpo.`,
      },
      {
        id: "o-silencio-que-grita-m7b",
        titulo: "M7.B — A solidão dentro das famílias",
        curso: "o-silencio-que-grita",
        texto: `Há uma forma específica de solidão que aparece em famílias com muito silêncio.

[pause]

Não é a solidão de quem vive longe.

É a solidão de quem está rodeado de pessoas próximas — e nunca é, completamente, vista por nenhuma delas.

[long pause]

Esta solidão é particular porque inverte a expectativa.

[pause]

Esperarias que o teu núcleo familiar fosse o sítio onde és mais conhecida.

Mas se o silêncio impede o conhecimento mútuo, o teu núcleo familiar pode tornar-se o sítio onde és menos conhecida — porque é o sítio onde a versão pública de ti se mantém com mais consistência.

[short pause]

Estranhos podem, por vezes, conhecer aspectos de ti que a tua família nunca conheceu.

[pause]

Porque com estranhos não há toda uma estrutura de silêncio histórico para defender.

[long pause]

Esta inversão é causa de uma das ironias dolorosas da vida adulta.

[pause]

Mulheres rodeadas de família, com filhos, com pais ainda vivos, com irmãos próximos — sentem-se profundamente sós.

E não sabem como nomear o que sentem, porque socialmente parece absurdo dizer que se está só quando se está rodeado.

[short pause]

Mas a solidão real não é função do número de pessoas à tua volta.

É função da quantidade de partes tuas que essas pessoas conhecem.

[pause]

Se elas conhecem só a versão pública — a função, o papel, a parte da família — tu estás, em todos os sentidos importantes, só.

[long pause]

Reconhecer esta solidão — em vez de a negar — é o primeiro passo para a aliviar.

[pause]

Porque a negação consome energia. E a energia gasta em negação é energia que poderia ser usada para a aliviar.

[short pause]

Aceitar que estás só dentro da tua família é admissão dolorosa.

Mas é também libertadora.

[pause]

Liberta-te da exigência de fingir que tudo está bem dentro do núcleo.

E permite-te começar a procurar, fora ou dentro do núcleo, ligações mais reais.

[long pause]

Algumas mulheres, depois desta admissão, conseguem aprofundar relações dentro do próprio núcleo.

Através das conversas difíceis que aprenderam a iniciar.

[pause]

Outras, descobrem que o núcleo já não é onde podem encontrar a intimidade real — e começam a investir noutras relações que se tornam, de facto, a sua família escolhida.

[short pause]

Nenhum dos dois caminhos é melhor.

Cada uma escolhe o que faz sentido na sua situação concreta.

[pause]

Mas ambos começam com a mesma admissão: estou só dentro da minha família.

[long pause]

Esta semana, faz uma lista — privada — de duas colunas.

À esquerda, lista as pessoas do teu núcleo familiar com quem mais convives.

À direita, ao lado de cada nome, escreve qual a parte tua que essa pessoa, na verdade, não conhece. A versão tua que, perto dela, fica sempre por mostrar.

[pause]

Olha para a lista.

[short pause]

Provavelmente vais ver, repetidamente, partes tuas que nenhuma das pessoas do núcleo conhece.

[pause]

Faz agora uma terceira coluna, à direita.

Quem, fora do núcleo, conhece estas partes — ou poderia conhecê-las se tu deixasses?

[short pause]

Pode ser uma amiga. Uma colega. Uma terapeuta. Uma prima distante. Uma mulher que conheceste recentemente e em quem sentiste algo diferente.

[pause]

Esta terceira coluna é mapa de possibilidade.

Mostra-te onde, fora do núcleo, podes começar a investir tempo e presença.

[short pause]

Não para abandonar o núcleo. Para deixar de exigir dele a totalidade da intimidade.

[pause]

A solidão dentro da família não tem cura imediata.

Tem, sim, atenuação ao longo do tempo — quando começas a construir, em paralelo, relações onde mais partes tuas cabem.`,
      },
      {
        id: "o-silencio-que-grita-m7c",
        titulo: "M7.C — As versões de ti que ficaram sem voz",
        curso: "o-silencio-que-grita",
        texto: `Há versões de ti que nunca chegaram a falar.

[pause]

Não porque não existissem. Porque foram caladas antes de poderem aparecer.

[long pause]

A criança que tu eras tinha opiniões. Tinha desejos. Tinha curiosidades específicas.

Algumas delas conseguiram chegar a adulta.

Outras foram caladas tantas vezes — por adultos cansados, por silêncios familiares, por reacções desencorajadoras — que nunca se desenvolveram.

[pause]

E ficaram dentro de ti como possibilidades não cumpridas.

[short pause]

Versões de ti que poderiam ter florescido em adulta — mas que foram silenciadas em criança.

[long pause]

Tu, hoje, podes não saber quais foram.

Mas sentes, em momentos calmos, uma sensação difícil de nomear.

Saudade de algo que nunca viveste. Inquietação face a determinadas pessoas que parecem ter escolhido caminhos que tu também terias escolhido se as condições tivessem sido outras.

[pause]

Esta sensação não é frustração simples.

É luto pelas versões de ti que ficaram sem voz.

[short pause]

E o luto por possibilidades não vividas é, em algumas alturas da vida, mais doloroso do que o luto por coisas que aconteceram.

[long pause]

Não há forma de viver retroactivamente as versões que foram silenciadas.

Mas há forma de as reconhecer.

[pause]

E o reconhecimento, mesmo sem cumprimento, alivia.

[short pause]

Porque permite que o que ficou em ti como inquietação difusa ganhe forma de história.

E a história, ao contrário da inquietação, pode ser carregada com dignidade.

[long pause]

Algumas mulheres, em meia-idade, descobrem que ainda há tempo para dar voz a algumas das versões silenciadas.

[pause]

Não a todas.

Mas a algumas.

[short pause]

A mulher que tinha curiosidade pela arte e foi desencorajada, pode começar a pintar aos cinquenta.

A que tinha vocação para escrita e foi desviada para algo "prático", pode escrever aos sessenta.

A que sempre quis viajar sozinha mas foi convencida que não era próprio, pode finalmente partir aos setenta.

[pause]

Nenhuma destas mulheres recupera as décadas perdidas.

Mas todas recuperam alguma coisa que estava à espera dentro delas.

[long pause]

Esta semana, escreve numa folha.

Quais são as versões de mim que ficaram sem voz?

[pause]

Vai pensando ao longo de vários dias.

Provavelmente vão aparecer mais do que tu inicialmente esperavas.

[short pause]

Quando tiveres a lista, olha para ela.

[pause]

Pergunta, para cada uma: ainda há, na minha vida actual, algum espaço para esta voz aparecer — mesmo que parcialmente?

[short pause]

Para algumas, a resposta vai ser não. Esses ficam como reconhecimento.

Para outras, a resposta vai ser sim — e tu, ao longo dos próximos anos, podes começar a dar-lhes lugar.

[long pause]

A vida adulta tardia tem esta possibilidade rara.

[pause]

A possibilidade de começar a dar voz ao que durante décadas foi calado.

[short pause]

Não para reescrever o passado.

Para tornar o futuro mais inteiro do que o passado conseguiu ser.

[long pause]

E esta inteireza — mesmo parcial, mesmo tardia — é uma das formas mais profundas de liberdade que uma mulher pode alcançar.

[pause]

A liberdade de já não calar tudo o que durante demasiado tempo foi calado.`,
      },
    ],
  },
  {
    id: "curso-o-silencio-que-grita-m8",
    titulo: "Curso O Silêncio que Grita — Módulo 8 (Aulas A, B, C)",
    descricao: "A Voz que Fica. Fecho do curso.",
    scripts: [
      {
        id: "o-silencio-que-grita-m8a",
        titulo: "M8.A — Começar a falar sem drama",
        curso: "o-silencio-que-grita",
        texto: `Quebrar décadas de silêncio não tem de ser dramático.

[pause]

Não é cena. Não é confronto. Não é ruptura.

[long pause]

Pode ser, simplesmente, começar a dizer pequenas verdades em momentos comuns.

[pause]

Numa conversa banal com a tua mãe, dizer "tenho andado cansada" em vez de "está tudo bem" automático.

Num jantar de família, mencionar discretamente uma coisa que tu pensas e que normalmente não dizes.

Numa conversa com o teu parceiro, partilhar uma observação que normalmente engoles.

[short pause]

Cada uma destas pequenas verdades é movimento de descoincidência.

Descoincidência entre a versão pública de ti e a versão real.

[long pause]

Quando começas a praticar pequenas descoincidências, dois efeitos aparecem.

[pause]

O primeiro é desconforto. Tu sentes a estranheza de dizer algo verdadeiro num contexto onde costumavas dizer algo conveniente.

O segundo é alívio. Pequeno mas real. Por baixo do desconforto.

[short pause]

Com o tempo, o alívio cresce e o desconforto diminui.

[pause]

E tu, sem cena, começas a ser mais inteira nas relações.

[long pause]

Esta forma de mudança — gradual, sem drama — é mais sustentável do que mudanças explosivas.

[pause]

Conversas dramáticas, em que tudo é dito de uma vez, costumam custar mais do que produzem.

A relação fica em choque. As pessoas defendem-se. E muitas vezes as conversas seguintes voltam ao silêncio.

[short pause]

Pequenas descoincidências, ao longo dos meses, alteram a temperatura sem desencadear defesa.

[pause]

E ao fim de um ano, a relação é diferente — sem que ninguém possa apontar uma única conversa específica em que tudo mudou.

[long pause]

Esta semana, escolhe três contextos diferentes onde costumas dizer algo conveniente.

Identifica, para cada um, a pequena verdade que normalmente fica por dizer.

[pause]

Não vais dizer todas de uma vez.

Vais começar a praticar — em momentos confortáveis — a substituição da resposta automática pela resposta um pouco mais verdadeira.

[short pause]

Pequenos passos.

Sem cena.

[pause]

E, ao longo do ano, vais notar que muitas das tuas relações têm mais ar do que tinham antes.

[long pause]

Falar sem drama é a forma mais sustentável de quebrar décadas de silêncio.

[pause]

E é também, ironicamente, a forma que produz mais transformação real ao longo do tempo.`,
      },
      {
        id: "o-silencio-que-grita-m8b",
        titulo: "M8.B — O direito de ser compreendida mesmo imperfeitamente",
        curso: "o-silencio-que-grita",
        texto: `Há uma exigência interna que muitas mulheres carregam.

[pause]

A exigência de ser compreendida perfeitamente quando finalmente decidem falar.

[long pause]

Esta exigência é, em parte, sequela do silêncio prolongado.

[pause]

Quando uma pessoa cala durante anos algo importante, e finalmente decide dizer, espera — implícita ou explicitamente — que a outra pessoa receba com profundidade equivalente ao tempo de silêncio.

[short pause]

Esta expectativa raramente é cumprida.

[pause]

A outra pessoa, ao receber a comunicação, processa em tempo real. Não tem o contexto interior que tu construíste durante décadas.

E responde da forma que consegue no momento — quase sempre incompleta, por vezes até insatisfatória.

[long pause]

Quando a resposta é insatisfatória, a tendência é recolher.

"Não valeu a pena. Não foi compreendida. Vou voltar ao silêncio."

[pause]

Esta tendência, embora compreensível, é trágica.

Porque deixa morrer uma comunicação que, com paciência, podia evoluir.

[short pause]

A outra pessoa, depois da primeira reacção imperfeita, continua a processar.

E muitas vezes, dias depois, semanas depois, mostra que afinal compreendeu mais do que parecia inicialmente.

[pause]

Mas se tu já recolheste, e voltaste ao silêncio, perdeu-se a oportunidade dessa compreensão se manifestar.

[long pause]

Aceita, à partida, que vais ser compreendida imperfeitamente.

[pause]

A primeira reacção da outra pessoa raramente é proporcional ao que tu estás a partilhar.

E não é necessariamente desinteresse — é, simplesmente, processamento em tempo limitado.

[short pause]

A compreensão real costuma vir depois.

Em pequenos sinais. Em comentários nas semanas seguintes. Em mudanças subtis na forma como a outra pessoa se relaciona contigo.

[long pause]

Tu tens o direito de ser compreendida — mesmo imperfeitamente, mesmo lentamente.

[pause]

E tens a responsabilidade, se queres realmente comunicar, de não exigir compreensão perfeita à primeira tentativa.

[short pause]

Esta paciência relacional é difícil. Especialmente para quem calou muito durante muito tempo.

[pause]

Mas é o único caminho realista para que a comunicação verdadeira aconteça nas relações importantes.

[long pause]

Esta semana, se tens uma conversa importante por ter, faz uma preparação concreta.

Pega num papel.

[pause]

Escreve, em três linhas separadas, as três reacções imperfeitas mais prováveis da outra pessoa.

A defesa que ela vai fazer. A minimização. A mudança de assunto.

[short pause]

Em frente a cada uma, escreve uma resposta breve tua.

Não para vencer. Para continuar a conversa em vez de a fechar.

[pause]

Por exemplo.

Se ela disser "estás a exagerar", a tua resposta pode ser: "Sei que pode parecer assim. Mas para mim isto é importante. Posso continuar?"

Se ela mudar de assunto, a tua resposta pode ser: "Vamos voltar a isto. Não terminámos."

Se ela ficar ofendida, a tua resposta pode ser: "Não te quero magoar. Quero que finalmente percebas como me sinto."

[short pause]

Estas frases prontas, escritas antes da conversa, evitam que tu fiques sem palavras quando a primeira reacção imperfeita aparecer.

[pause]

E mantêm a porta aberta para a compreensão real que, quase sempre, chega depois — mas só se tu não tiveres recolhido entretanto.

[long pause]

Compreensão imperfeita imediata pode ser o início de compreensão profunda eventual.

Mas só se tu tiveres paciência para deixar a compreensão crescer no seu tempo.`,
      },
      {
        id: "o-silencio-que-grita-m8c",
        titulo: "M8.C — A voz é legado",
        curso: "o-silencio-que-grita",
        texto: `No fim deste curso, pensa numa coisa.

[pause]

A voz que tu encontrares nos próximos anos não fica em ti.

[long pause]

Vai para as filhas. Para as sobrinhas. Para as alunas. Para as mulheres mais novas que te observam.

[pause]

Cada vez que tu falas algo que durante décadas foi calado na tua família, abres possibilidade de fala para quem vem depois.

[short pause]

Não porque elas tenham que repetir o que tu disseste.

Mas porque o exemplo de uma mulher que conseguiu finalmente falar — depois de anos a calar — torna-se referência interna para outras.

[long pause]

Esta é a transmissão silenciosa mais importante.

[pause]

Não passa por palavras.

Passa por presença.

[short pause]

Uma rapariga que cresce a ver a tia dizer o que pensa, mesmo quando é desconfortável, aprende algo que nenhum livro lhe pode ensinar.

Aprende que isso é possível.

[pause]

E essa possibilidade, depositada nela em criança, opera o resto da vida.

[long pause]

Se tu, com este curso, começares a quebrar alguns silêncios das tuas relações, estás a fazer trabalho que beneficia muito mais gente do que imaginas.

[pause]

A tua filha, mesmo que não tenhas filha biológica.

A tua sobrinha. A tua afilhada. A tua aluna. A tua amiga mais nova.

[short pause]

Cada uma destas mulheres está, de alguma forma, a observar-te.

E cada vez que tu fizeres algo novo — falar onde antes calavas, perguntar onde antes não perguntavas, recusar onde antes aceitavas — estás a expandir o reportório de possibilidades delas.

[long pause]

Isto é legado.

[pause]

Não é legado escrito. Não é legado financeiro.

É legado relacional.

[short pause]

E é, em muitas linhagens femininas, o legado que mais transforma.

[pause]

Porque rompe ciclos que podiam continuar indefinidamente.

E abre, em quem vem depois, capacidade de viver de forma mais inteira do que as gerações anteriores conseguiram.

[long pause]

A voz que tu encontrares nos próximos anos não é só tua.

[pause]

Pertence-te.

Mas ressoa para fora.

E o eco dessa ressonância chega muito mais longe do que tu vais alguma vez saber.

[long pause]

Termina este curso com uma pergunta para guardar.

[pause]

Daqui a vinte anos, quando tu já fores uma mulher mais velha, qual é a voz que vais querer ter sido?

[short pause]

Calada — porque foi mais fácil?

Ou tua — porque, em algum ponto, decidiste valer a pena dizer o que tinhas para dizer?

[pause]

A resposta a esta pergunta, repetida em silêncio nos próximos anos, vai orientar mais decisões do que tu imaginas.

[long pause]

A voz que fica é a voz que outras vão lembrar.

[pause]

Não pelo que disseste especificamente.

Pela forma como, num momento da tua vida, decidiste finalmente falar — depois de gerações de mulheres que não puderam.

[short pause]

E essa decisão, mesmo que tu não a celebres, fica.

[pause]

Como semente.

[short pause]

Em mulheres que vão crescer com mais hipóteses de fala porque tu, antes delas, soubeste recuperar a tua.`,
      },
    ],
  },
  {
    id: "curso-pele-nua-m1",
    titulo: "Curso Pele Nua — Módulo 1 (Aulas A, B, C)",
    descricao: "O Corpo Olhado. Material de áudio para alunos.",
    scripts: [
      {
        id: "pele-nua-m1a",
        titulo: "M1.A — O olhar antecipado",
        curso: "pele-nua",
        texto: `Antes de te veres a ti mesma, foste vista por outros.

[pause]

Em algum ponto da infância — talvez aos onze, doze, treze anos — começaste a notar que o teu corpo era olhado.

[long pause]

Não pediste esta atenção. Mas ela chegou.

[pause]

E mudou tudo.

[short pause]

A partir desse momento, deixaste de habitar o corpo apenas como ferramenta para correr, brincar, comer, dormir.

Passaste a habitá-lo também como objecto a ser visto.

[long pause]

Esta transição, para muitas raparigas, é o fim da infância corporal.

[pause]

E o início de uma vigilância que vai durar décadas.

[short pause]

A vigilância de antecipar como será visto o teu corpo antes de ser efectivamente visto.

[pause]

Antes de saíres de casa, avalia-lo.

Antes de tirares uma foto, posiciona-lo.

Antes de entrares numa sala, ajusta-lo.

[long pause]

Esta antecipação tornou-se hábito tão profundo que tu já nem a notas.

[pause]

Acontece automaticamente. Em milissegundos. Antes de qualquer pensamento consciente.

[short pause]

E é uma das principais razões pelas quais tantas mulheres se sentem cansadas sem razão aparente.

[pause]

Antecipar permanentemente o olhar alheio sobre o próprio corpo é trabalho mental constante.

[long pause]

Reconhecer este trabalho é o primeiro passo para o reduzir.

[pause]

Não para o eliminar — em alguns contextos, alguma vigilância é razoável.

Mas para o reduzir aos contextos onde efectivamente faz sentido.

[short pause]

E libertar o resto do tempo desta vigilância automática.

[long pause]

Esta semana, durante alguns momentos do dia, repara.

Quando te avalias num reflexo. Quando ajustas a roupa em frente a uma sala. Quando antecipas a impressão que vais causar antes de entrares.

[pause]

Quantas vezes ao dia fazes isto?

[short pause]

A maioria das mulheres, quando começa a contar, fica em choque.

Pode ser dezenas. Pode ser centenas.

[pause]

E cada uma destas micro-avaliações consome energia.

[long pause]

Não tens de mudar o comportamento imediatamente.

Apenas de o tornar visível.

[pause]

Porque o que é visível pode, com tempo, ser modulado.

E o automático invisível continua, sem fim.

[short pause]

A vigilância sobre o próprio corpo, instalada em criança, persiste em adulta — até que tu, conscientemente, comeces a desinstalá-la.`,
      },
      {
        id: "pele-nua-m1b",
        titulo: "M1.B — O corpo que só olhas com roupa",
        curso: "pele-nua",
        texto: `Há um corpo que tu só olhas quando está vestido.

[pause]

No espelho da entrada, antes de saíres de casa.

No reflexo da montra, de passagem.

Na fotografia em que escolheste o ângulo antes de a tirares.

[long pause]

Mas sem roupa, não olhas.

[pause]

Vestes-te depressa depois do banho. Apagas a luz antes de te despires à noite. Evitas o espelho do quarto como quem evita uma sala de interrogatório.

[short pause]

Isto não é só pudor.

É mais antigo.

[long pause]

Aprendeste, em algum momento, que o teu corpo nu não era uma coisa boa.

[pause]

Talvez numa comparação. Talvez numa piada. Talvez num silêncio da tua mãe quando te mediste em frente ao espelho. Talvez num manual implícito que te ensinou que o corpo da mulher é coisa a esconder.

[short pause]

Tem nome o que aprendeste.

Vergonha do corpo sem vestido.

[pause]

E o mais cruel é isto: o corpo nunca te deu motivo para essa vergonha.

A vergonha foi-te ensinada antes dele ter tempo de se mostrar a ti.

[long pause]

Em adulta, isto tem consequências subtis.

[pause]

Conheces o teu corpo vestido com muita precisão.

Sabes que roupa te assenta. Sabes que ângulos funcionam. Sabes que cores te favorecem.

[short pause]

Mas o teu corpo nu — esse, conheces mal.

Não sabes ao certo a forma das tuas costas. Não te lembras como são as tuas pernas vistas de baixo. Não conheces a verdadeira textura da tua pele em diferentes zonas.

[pause]

Porque há décadas que evitas olhar.

[long pause]

Esta noite, antes de dormir, faz uma coisa nova.

Estás sozinha, no teu quarto, com luz baixa.

Despe-te calmamente.

[pause]

Vai a um espelho.

Não para te avaliares — para te conheceres.

[short pause]

Olha para o teu corpo nu sem julgamento.

Percorre-o com o olhar como se estivesses a ver pela primeira vez.

[pause]

A primeira reacção, provavelmente, vai ser desconforto. Talvez crítica. Talvez vontade de te vestir depressa.

[short pause]

Resiste. Por dois minutos.

[pause]

Olha para as partes que costumas evitar. Sem mudar nada. Sem corrigir nada. Apenas observar.

[long pause]

Este gesto, repetido algumas noites por semana, durante alguns meses, transforma a relação com o próprio corpo.

[pause]

Não em amor declarado. Em familiaridade.

[short pause]

E familiaridade é, em muitos casos, a fundação para qualquer relação saudável que se siga.

[pause]

O teu corpo nu não tem de ser amado.

Tem, sim, de ser conhecido.

[long pause]

Conhecimento substitui, lentamente, a vergonha herdada.

E o que era zona de evitamento começa, com o tempo, a tornar-se território familiar.`,
      },
      {
        id: "pele-nua-m1c",
        titulo: "M1.C — O espelho que evitas de manhã",
        curso: "pele-nua",
        texto: `Há um espelho em casa que tu evitas de manhã.

[pause]

Passas por ele depressa. Fazes o que tens de fazer sem o olhar de frente.

E quando, por descuido, o olhas, há um pequeno vazio — como se tivesses apanhado uma estranha no espelho.

[long pause]

Não é que não te reconheças.

É que esperavas outra coisa.

[pause]

A mulher do espelho parece cansada. Parece mais velha. Parece menos do que tu achavas que ias ser nesta altura da tua vida.

[short pause]

Tem nome o que sentes.

Luto de uma versão de ti que não aconteceu.

[pause]

Esse luto é silencioso. Não tem ritual. Não tem data. Ninguém te pergunta se estás bem.

[short pause]

Tu simplesmente continuas.

[pause]

Mas o espelho, esse, nota tudo.

[long pause]

E a cada manhã em que passas por ele sem o olhar, perdes a hipótese de dizer à mulher real: eu vejo-te.

[pause]

Ela espera por isso há anos.

[short pause]

Não para seres diferente.

Para seres finalmente olhada por ti.

[long pause]

Esta semana, faz uma experiência.

Quando passares pelo espelho de manhã, em vez de evitar, para.

Olha para a mulher que está lá.

[pause]

Não com avaliação. Não com correcção.

Apenas com reconhecimento.

[short pause]

Tu estás aí.

Esta é a mulher que sou agora.

[pause]

Diz isto, em silêncio, à mulher do espelho.

Sem dramatizar. Sem celebrar.

Apenas reconhecer.

[long pause]

Este gesto pequeno, repetido todas as manhãs durante algumas semanas, muda algo profundo.

[pause]

A mulher do espelho deixa de ser estranha.

Volta a ser tua.

[short pause]

E tu, ao reconhecê-la, começas a tornar-te capaz de a habitar mais inteiramente.

[pause]

Porque o que é evitado não pode ser habitado.

E o que é olhado, com paciência, pode finalmente tornar-se casa.

[long pause]

Não tens de amar a mulher do espelho.

Tens, apenas, de a olhar.

[pause]

E no olhar, com tempo, ela começa a relaxar.

[short pause]

Como se finalmente, depois de anos a ser evitada, alguém se tivesse sentado perto dela.

E essa alguém és tu.

[pause]

A mulher mais velha, mais cansada, mais real do que tu querias.

E, ao mesmo tempo, a única que efectivamente existe.

[long pause]

Olhar-te de manhã, sem fugir, é dos actos mais simples e mais profundos que podes fazer pela tua paz interior.

[pause]

Não custa dinheiro. Não exige tempo extra.

Pede, apenas, dois segundos de coragem por dia.

[short pause]

Multiplicados por trezentos e sessenta e cinco dias, esses dois segundos transformam uma vida inteira de relação consigo mesma.`,
      },
    ],
  },
  {
    id: "curso-pele-nua-m2",
    titulo: "Curso Pele Nua — Módulo 2 (Aulas A, B, C)",
    descricao: "Vergonhas Pequenas Que Fazem História.",
    scripts: [
      {
        id: "pele-nua-m2a",
        titulo: "M2.A — A primeira vez que comparaste",
        curso: "pele-nua",
        texto: `Lembras-te da primeira vez que comparaste o teu corpo com o de outra rapariga?

[pause]

Talvez no balneário da escola. Talvez numa praia. Talvez no quarto de uma amiga, a experimentarem roupa.

[long pause]

Antes desse momento, o teu corpo era apenas o teu corpo.

Não tinhas com que comparar — e por isso, em certo sentido, ele estava em paz.

[pause]

A partir desse momento, deixou de estar.

[short pause]

A comparação inaugurou em ti uma forma de olhar que te ia acompanhar décadas.

[pause]

A medição constante.

A pergunta silenciosa: como é que o meu corpo se compara ao das outras?

[long pause]

Esta pergunta, que pode parecer trivial, opera como filtro permanente.

[pause]

Cada corpo que vês nas redes sociais. Cada amiga que se desfaz da camisola num dia de calor. Cada anúncio com modelo. Cada actriz, cantora, influenciadora.

[short pause]

O teu cérebro compara automaticamente.

E, na maioria das vezes, conclui que tu sais a perder.

[pause]

Não porque saias mesmo a perder.

Porque a comparação é desigual.

[long pause]

Estás a comparar o teu corpo real, em estado normal, com corpos que foram preparados para ser olhados.

[pause]

Iluminação. Pose. Edição. Filtros. Anos de treino específico para certo tipo de aparência.

[short pause]

Mesmo as amigas que tu vês ao vivo, em momentos em que mostram o corpo, estão em situação de ser vistas — e isso, naturalmente, leva a algum ajuste.

[pause]

Tu, em casa, no espelho da casa de banho, estás em estado natural.

A comparação é entre realidades diferentes.

[long pause]

Reconhecer isto não acaba com a comparação. Mas reduz o seu impacto.

[pause]

Quando o cérebro automaticamente comparar, podes lembrar-te: estou a comparar o que vejo de fora com o que vejo de dentro.

[short pause]

E isto é desigual à partida.

[pause]

A consciência da desigualdade não elimina a comparação. Mas tira-lhe a autoridade.

[long pause]

Esta semana, sempre que te apanhares a comparar — em frente a uma rede social, num espaço público — pratica uma frase silenciosa.

"Estou a comparar realidades diferentes."

[pause]

Não te combates. Não te julgas.

Apenas reconheces.

[short pause]

E, lentamente, o automatismo perde força.

[pause]

Não desaparece. Mas deixa de mandar tanto.`,
      },
      {
        id: "pele-nua-m2b",
        titulo: "M2.B — Comentários que ficaram",
        curso: "pele-nua",
        texto: `Há comentários sobre o teu corpo, feitos há décadas, que tu ainda lembras com precisão.

[pause]

Quem disse. Em que altura. Que palavras exactas.

[long pause]

Talvez tenha sido um adulto na infância.

Talvez uma colega de escola.

Talvez um namorado de adolescência.

Talvez alguém de quem nem te lembras o nome — mas a frase ficou.

[pause]

Estes comentários, dependendo da idade em que te chegaram, têm peso desproporcional na forma como tu, hoje em adulta, te vês.

[short pause]

Particularmente os que vieram entre os dez e os dezassete anos.

[pause]

Nessa idade, o cérebro está em fase de formação intensa da auto-imagem.

E qualquer comentário sobre o corpo, recebido nessa fase, fica gravado de forma muito mais funda do que receberia hoje.

[long pause]

Tu, em adulta, podes ter consciência de que aquele comentário antigo foi cruel, injusto, ou simplesmente errado.

[pause]

Mas a parte de ti que o recebeu em criança não tem essa consciência.

Continua a operar como se o comentário fosse verdade.

[short pause]

E quando te olhas ao espelho, a parte adulta de ti vê o que vê — mas a parte criança ainda ouve a frase antiga.

[pause]

A frase antiga, repetida silenciosamente sempre que tu olhas para o ponto específico que ela visou.

[long pause]

Isto não é fraqueza. É como o cérebro funciona.

[pause]

Memórias emocionais formadas em fases-chave de desenvolvimento têm persistência específica que memórias formadas em adulta não têm.

[short pause]

Mas há trabalho que se pode fazer.

[pause]

Identificar a frase. Nomear quem a disse. Reconhecer a idade em que chegou.

[long pause]

E depois, em diálogo interno, oferecer outra resposta — não à parte adulta de ti, mas à parte criança que ainda ouve.

[pause]

Não afirmações motivacionais. Algo mais simples e mais verdadeiro.

[short pause]

"Aquela frase não era verdade. Era a opinião de uma pessoa que falou sem cuidado."

"Tinhas onze anos. Não merecias ouvir aquilo."

"Aquilo não te define."

[pause]

Estas frases, dirigidas em silêncio à criança que tu foste, têm efeito mensurável ao longo do tempo.

[long pause]

Esta semana, identifica um comentário antigo sobre o teu corpo que ainda ressoa em ti.

Escreve-o num papel.

Escreve por baixo: tinha eu X anos. A pessoa era Y.

[pause]

E depois escreve uma frase de resposta que tu, em adulta, gostarias que alguém tivesse dito naquela altura.

[short pause]

Não precisas de a recitar.

A escrita, em si mesma, oferece à criança que tu foste algo que ela não recebeu na altura.

[pause]

E esta oferta, mesmo retroactiva, faz trabalho dentro de ti.`,
      },
      {
        id: "pele-nua-m2c",
        titulo: "M2.C — As correcções silenciosas",
        curso: "pele-nua",
        texto: `Há correcções que tu fazes ao teu corpo várias vezes por dia, sem te aperceberes.

[pause]

Encolher a barriga quando alguém entra na sala.

Endireitar os ombros quando alguém te vai tirar uma fotografia.

Ajustar o cabelo antes de uma chamada de vídeo.

Cobrir o decote com a mão quando notas alguém olhar.

Cruzar as pernas para esconder uma parte que normalmente esconderias.

[long pause]

Cada uma destas correcções, individualmente, parece insignificante.

[pause]

No conjunto, são coreografia constante.

[short pause]

Coreografia que mantém o teu corpo permanentemente ajustado a uma versão que tu antecipas ser mais aceitável do que a versão natural.

[pause]

Esta coreografia consome energia.

E consome também relação com o próprio corpo.

[long pause]

Porque cada correcção é, no fundo, uma pequena rejeição.

[pause]

A barriga que encolhes está a dizer ao teu corpo: tu não és aceitável como estás.

Os ombros que endireitas estão a dizer: a tua postura natural não serve.

A mão que cobre o decote está a dizer: o que aconteceria sem a mão é problema.

[short pause]

Estas mensagens, repetidas milhares de vezes, ensinam ao teu corpo que ele tem de estar permanentemente em modo de espera de correcção.

[pause]

E o teu corpo, treinado durante décadas, obedece.

[long pause]

A mudança não vem por força de vontade.

Vem por consciência.

[pause]

Esta semana, observa-te.

Quantas vezes ao dia fazes uma correcção corporal automática?

[short pause]

Conta. Numa folha. Durante um dia.

[pause]

Vais ficar surpreendida.

[short pause]

Trinta? Cinquenta? Cem?

[long pause]

Depois desta consciência, podes começar a interromper algumas das correcções automáticas.

[pause]

Não todas — algumas são razoáveis em certos contextos.

Mas muitas são reflexos automáticos sem função real.

[short pause]

Quando notares uma correcção automática a acontecer, podes pausar.

E perguntar: esta correcção é necessária neste momento?

[pause]

Em metade dos casos, vais perceber que não é.

[short pause]

E podes, conscientemente, deixar o teu corpo na posição natural — sem corrigir.

[long pause]

Isto vai gerar desconforto, no início.

A parte de ti que está habituada à correcção vai sentir vulnerabilidade.

[pause]

Aceita o desconforto. Ele passa.

E a relação com o teu corpo começa a relaxar.

[short pause]

Porque, pela primeira vez em muito tempo, tu estás a confiar nele para existir sem permanente intervenção tua.

[pause]

E o corpo, sentindo essa confiança, vai-se assentando em si mesmo.

[long pause]

A coreografia constante das correcções silenciosas é um dos maiores consumidores de energia mental nas mulheres modernas.

[pause]

Reduzi-la — não eliminá-la, reduzi-la — liberta uma quantidade impressionante de capacidade para outras coisas.

[short pause]

E, com o tempo, transforma a relação com o corpo numa relação mais parecida com habitação tranquila.

E menos com administração permanente.`,
      },
    ],
  },
  {
    id: "curso-pele-nua-m3",
    titulo: "Curso Pele Nua — Módulo 3 (Aulas A, B, C)",
    descricao: "O Corpo no Espaço Público.",
    scripts: [
      {
        id: "pele-nua-m3a",
        titulo: "M3.A — Roupa como armadura",
        curso: "pele-nua",
        texto: `Há roupa, no teu armário, que tu vestes para te sentires protegida.

[pause]

Para reuniões importantes. Para situações em que tu antecipas ser olhada com mais atenção. Para dias em que estás emocionalmente vulnerável.

[long pause]

Esta roupa funciona como armadura.

[pause]

Cobre. Estrutura. Compõe.

E permite que tu enfrentes o mundo com sensação reduzida de exposição.

[short pause]

Esta função é legítima. Toda a gente, em algum grau, usa a roupa assim.

[pause]

Mas para muitas mulheres, a função armadura tornou-se quase a única função da roupa.

[long pause]

Quase tudo o que tens no armário foi escolhido com critério defensivo.

[pause]

Esconde isto. Estrutura aquilo. Não chama atenção para o outro.

[short pause]

E, ao longo dos anos, o teu armário tornou-se inventário de defesas — não inventário de expressão.

[pause]

A pergunta "o que é que eu gostaria de vestir hoje?" desaparece.

E é substituída por "o que é que tem menos risco de ser comentado hoje?"

[long pause]

Esta substituição opera silenciosamente durante anos.

Até que, em algum momento, tu percebes que já não sabes ao certo qual seria a tua escolha de roupa se as considerações defensivas desaparecessem.

[pause]

Não é fácil aceder a esta resposta — porque a vigilância está tão integrada que parece a tua preferência genuína.

[short pause]

Mas é, no fundo, herança defensiva.

[long pause]

Faz uma experiência, esta semana.

Vai a uma loja onde nunca ias normalmente. Não para comprar.

Apenas para experimentar.

[pause]

Experimenta peças que normalmente nunca experimentarias.

Cores que evitas. Silhuetas que rejeitas. Estilos que consideras "não para ti".

[short pause]

Algumas vão confirmar que não te servem. Outras — e estas são as importantes — vão surpreender-te.

[pause]

Vais descobrir que algumas peças que tinhas excluído por hábito defensivo são, na verdade, peças que te ficam bem ou que te dão prazer ao ver.

[short pause]

Estas peças contêm informação sobre a versão de ti que vivia atrás da armadura.

[long pause]

Não tens de comprar tudo.

Mas leva uma para casa.

[pause]

Uma única peça que tu, normalmente, nunca terias escolhido.

E que, na cabine de prova, te fez sentir alguma coisa nova.

[short pause]

Esta peça é experiência.

[pause]

Vai-te ensinar, ao longo das próximas semanas, como te sentes a sair de casa com algo escolhido por outra parte de ti — não pela parte defensiva.

[long pause]

A roupa pode ser armadura.

Pode também ser exploração.

[pause]

E, em algumas alturas da vida, vale a pena reconfigurar o equilíbrio entre as duas — para o lado da exploração ganhar algum espaço de volta.`,
      },
      {
        id: "pele-nua-m3b",
        titulo: "M3.B — A postura herdada",
        curso: "pele-nua",
        texto: `A tua postura foi-te ensinada antes de saberes.

[pause]

Como te sentas. Como ficas em pé. Como caminhas. Como ocupas o teu corpo no espaço.

[long pause]

Tudo isto, em ti, tem influência directa de quem foi a primeira mulher próxima.

[pause]

A tua mãe.

[short pause]

A forma como ela ocupava o espaço, em criança, foi a tua referência inicial.

E a maioria das pessoas, ao longo da vida, mantém uma postura semelhante à da figura materna — mesmo sem se aperceber.

[pause]

Se a tua mãe encolhia os ombros, tu provavelmente também.

Se ela se sentava com pernas cruzadas e os pés escondidos, tu provavelmente também.

Se ela falava com a mão à frente da boca, tu provavelmente também.

[long pause]

Esta herança postural é tão profunda que muitas mulheres só a notam quando alguém lha aponta.

"És mesmo igual à tua mãe na forma como te sentas."

[pause]

E tu, em geral, ris desconfortavelmente. Porque até esse momento não tinhas reparado.

[short pause]

A herança postural tem implicações para além do estético.

[pause]

A postura que herdaste reflecte, de alguma forma, a posição emocional que a tua mãe tinha em relação ao mundo.

[short pause]

Ombros encolhidos sugerem proteção habitual.

Pernas escondidas sugerem instinto de não tomar muito espaço.

Mão à frente da boca sugere autocensura corporal.

[pause]

Estas posturas podem ter sido necessárias para ela, na época em que ela viveu.

Mas podem já não ser necessárias para ti.

[long pause]

Mudar a postura é difícil.

Não por preguiça — por enraizamento.

[pause]

A postura está integrada no sistema nervoso a um nível que nenhuma decisão consciente, isolada, consegue alterar.

[short pause]

Mas pode ser modulada com prática lenta.

[pause]

Algumas semanas de yoga. Algumas sessões com fisioterapeuta especializada. Aulas de dança com foco em alinhamento.

[short pause]

Ou, mais simples, exercício diário de tomar consciência de como ocupas o espaço.

[long pause]

Esta semana, observa-te durante o dia.

Como te sentas em reuniões? Como ocupas o lugar no autocarro? Como caminhas em ruas movimentadas?

[pause]

Vais notar padrões.

E em quase todos eles, vais reconhecer ecos da tua mãe.

[short pause]

Não para a julgar. Apenas para reconhecer a influência.

[pause]

Depois desta consciência, podes começar a experimentar pequenos ajustes.

[short pause]

Senta-te com as pernas a ocupar mais espaço durante uma reunião. Caminha com os ombros mais relaxados durante um passeio. Fala em voz natural sem cobrir a boca durante uma conversa.

[pause]

Sente o que muda — em ti e na reacção das pessoas.

[long pause]

A postura é um dos veículos silenciosos de transmissão entre gerações de mulheres.

[pause]

Quebrar parte desta herança, conscientemente, é dos actos mais discretos e mais importantes que podes fazer pela tua autonomia corporal.

[short pause]

Não para ser diferente da tua mãe.

Para descobrir, finalmente, qual seria a tua postura se ela tivesse sido escolhida por ti — e não absorvida em criança.`,
      },
      {
        id: "pele-nua-m3c",
        titulo: "M3.C — Onde o corpo se encolhe",
        curso: "pele-nua",
        texto: `Há sítios específicos onde o teu corpo se encolhe.

[pause]

Nem te apercebes que aconteceu — mas aconteceu.

[long pause]

No autocarro, quando se senta alguém ao teu lado.

Em reuniões com pessoas que te intimidam.

Em jantares de família onde determinada pessoa está presente.

Em consultórios médicos.

[pause]

Em cada um destes contextos, o teu corpo encolheu uns centímetros.

Sem ordem consciente. Por reflexo.

[short pause]

E permaneceu encolhido durante o tempo que durou a situação.

[long pause]

Estes encolhimentos automáticos são informação importante.

[pause]

Dizem-te onde, dizem-te quando, dizem-te perto de quem o teu corpo não se sente seguro.

[short pause]

Não no sentido de perigo físico necessariamente. Mas no sentido de não ter espaço para ser inteiro.

[pause]

E o teu corpo, sabiamente, recolhe-se quando antecipa que o seu tamanho natural não vai caber.

[long pause]

Reconhecer estes encolhimentos transforma a tua leitura das situações sociais.

[pause]

Onde antes pensavas "esta pessoa intimida-me", podes agora dizer "o meu corpo encolhe perto desta pessoa".

A diferença é importante.

[short pause]

A primeira frase é vaga. A segunda é diagnóstica.

[pause]

E o diagnóstico permite escolha consciente sobre a continuação da relação.

[long pause]

Em algumas situações, o encolhimento é razoável e adaptativo.

Quando estás num espaço público apertado, encolheres-te ligeiramente é cortesia.

[pause]

Quando estás com alguém que efectivamente tem autoridade legítima sobre ti — um chefe directo numa avaliação importante — encolheres-te ligeiramente é estratégia.

[short pause]

Estes encolhimentos não são problemáticos.

[pause]

Mas há outros que merecem atenção.

[long pause]

Os encolhimentos repetidos com pessoas próximas, ao longo dos anos, são sinal de uma dinâmica relacional que está a custar-te corpo.

[pause]

Se há uma pessoa específica perto de quem o teu corpo automaticamente se encolhe, há informação relacional ali a precisar de ser ouvida.

[short pause]

Não significa que tens de cortar a relação.

Significa que vale a pena pensar no que está a fazer com que o teu corpo recolha quando essa pessoa está presente.

[pause]

Pode ser histórico. Pode ser dinâmica actual. Pode ser ambas.

[long pause]

Esta semana, faz uma observação cuidadosa.

Em que situações é que o teu corpo se encolhe?

Em que momentos do dia? Perto de quem?

[pause]

Faz uma lista.

[short pause]

Provavelmente vai aparecer uma pessoa, ou uma situação, em que isto acontece com regularidade.

[pause]

E essa pessoa ou situação merece reflexão consciente.

[long pause]

O corpo encolhido não é fraqueza.

É sinalização.

[pause]

Ouvir esta sinalização é o primeiro passo para começar a ter relações em que o teu corpo possa, finalmente, ocupar o espaço que naturalmente ocuparia.

[short pause]

Sem encolhimentos automáticos.

Sem recolhimentos defensivos.

Apenas o teu corpo, em tamanho real, em ambientes onde isso é seguro.

[pause]

E quanto mais tu reduzires o tempo passado em ambientes onde tens de te encolher, mais o teu corpo lembra como é estar inteiro.

E começa a expandir-se de novo.`,
      },
    ],
  },
  {
    id: "curso-pele-nua-m4",
    titulo: "Curso Pele Nua — Módulo 4 (Aulas A, B, C)",
    descricao: "A Pele Como Fronteira.",
    scripts: [
      {
        id: "pele-nua-m4a",
        titulo: "M4.A — O toque que dispensavas e calavas",
        curso: "pele-nua",
        texto: `Há toques que tu, ao longo da vida, dispensavas e calavas.

[pause]

Beijos de cumprimento que não te apetecia receber.

Abraços de tias que te apertavam mais do que era confortável.

Mãos no ombro de chefes ou colegas que tu, internamente, recuavas.

[long pause]

Cada um destes momentos foi pequeno.

E em cada um deles, tu deixaste passar.

[pause]

Sem dizer nada. Sem proteger o teu corpo. Sem reclamar uma fronteira que era tua.

[short pause]

Não por falta de instinto.

Por treino antigo.

[long pause]

As raparigas, em geral, são treinadas a aceitar contacto físico que não desejam.

[pause]

Para serem educadas. Para não fazerem cena. Para não magoarem a outra pessoa.

[short pause]

Estas razões são apresentadas como cortesia.

[pause]

Mas têm efeito acumulado preocupante.

[long pause]

Tu chegas à idade adulta com um corpo que aprendeu a tolerar contacto que não pediu.

[pause]

E essa tolerância, instalada em criança, opera silenciosamente em todas as relações da tua vida adulta.

[short pause]

Quando alguém te toca de uma forma que tu não desejarias, há ainda hoje uma parte de ti que aceita por reflexo.

[pause]

E só horas depois — às vezes dias depois — é que tu reconheces o desconforto que sentiste.

[long pause]

Recuperar a fronteira da pele é trabalho lento e específico.

[pause]

Começa por reconhecer, em retrospectiva, os toques que dispensavas mas que aceitaste.

Não para te castigares.

Para começar a notar o padrão.

[short pause]

Quando o padrão fica visível, podes começar a interrompê-lo em situações futuras.

[pause]

Não em confronto dramático.

Em pequenos ajustes.

[long pause]

Inclinares a cabeça antes de um beijo de cumprimento, sugerindo um aceno em vez do beijo.

Encolheres ligeiramente quando alguém te vai abraçar de forma que não te serve, criando distância sem palavras.

Recuares ligeiramente quando uma mão se aproxima do teu ombro.

[pause]

Estes pequenos gestos, repetidos com paciência, ensinam às pessoas à tua volta a respeitar a tua fronteira física.

[short pause]

Algumas pessoas vão notar e ajustar.

Outras vão tentar continuar a invadir, e nessas a tua estratégia tem de ser mais explícita.

[pause]

Mas começa pelo subtil.

[long pause]

Esta semana, observa.

Em quantos cumprimentos tu aceitas contacto que, se tivesses escolha, dispensarias?

[pause]

Nem precisas de mudar nada ainda.

Apenas observa.

[short pause]

A consciência muda muito.

[pause]

Porque o corpo, ao saber que tu finalmente notas, começa a ganhar coragem para sinalizar com mais clareza.`,
      },
      {
        id: "pele-nua-m4b",
        titulo: "M4.B — O contacto que pedes sem pedir",
        curso: "pele-nua",
        texto: `Há contacto físico que tu queres mas que não pedes.

[pause]

Toque suave nas mãos. Um abraço prolongado. Um cabelo a ser acariciado.

Carícia sem destino sexual — apenas presença na pele.

[long pause]

Em algumas relações da tua vida, este contacto acontece naturalmente.

Em outras, falta.

[pause]

E tu, em vez de o pedir, esperas que aconteça espontaneamente.

[short pause]

Esperas durante dias. Semanas. Por vezes anos.

[pause]

E, quando não acontece, sentes uma tristeza vaga que não consegues nomear.

[long pause]

A tristeza tem nome.

É a tristeza de não pedires o contacto que precisas — e, por isso, não o receberes na quantidade que precisas.

[pause]

As mulheres são treinadas a esperar pelo contacto.

A receber se for oferecido. A não pedir se não for.

[short pause]

Esta passividade, instalada cedo, custa caro em adulta.

[pause]

Porque os parceiros, mesmo bem-intencionados, não são telepatas.

E sem pedido explícito, podem oferecer contacto em momentos que não correspondem ao que tu precisas.

[long pause]

Pedir contacto é mais difícil do que parece.

[pause]

Há vergonha. Há receio de parecer carente. Há receio de ser recusada — recusa que doeria mais do que a ausência actual.

[short pause]

Mas pedir é, na verdade, gesto de confiança.

[pause]

E pessoas que te amam, em geral, acolhem o pedido com gosto.

Porque é confiança nelas. E porque, sem o pedido, elas próprias podem estar a sentir-se em distância sem saber como aproximar-se.

[long pause]

Esta semana, identifica uma pessoa próxima a quem podes pedir um contacto específico.

Não tem de ser dramático. Pode ser pequeno.

[pause]

"Posso ficar um bocado deitada aqui?"

"Apetecia-me que me pegasses na mão durante este filme."

"Posso pedir-te um abraço?"

[short pause]

Estas frases pequenas, ditas com naturalidade, mudam relações.

[pause]

Não em transformação dramática.

Em proximidade renovada.

[long pause]

E ao fim de algumas semanas a praticar, vais descobrir uma coisa importante.

[pause]

Quando começas a pedir contacto, deixas de o esperar.

E a pessoa próxima começa, sem combinar nada, a oferecer com mais frequência — porque se sente convidada a aproximar-se de uma forma que antes não era explícita.

[short pause]

A intimidade física, em muitas relações, está a aguardar apenas que alguém abra a porta.

[pause]

E essa alguém, normalmente, és tu.`,
      },
      {
        id: "pele-nua-m4c",
        titulo: "M4.C — A pele que precisa de paz",
        curso: "pele-nua",
        texto: `Em algumas alturas da vida, a tua pele precisa de paz.

[pause]

Não de mais cuidado. Não de melhor creme. Não de novo tratamento.

De paz.

[long pause]

Pele em paz é pele que não está a ser permanentemente tratada como projecto.

[pause]

Não está a ser examinada todas as manhãs em busca de imperfeições novas.

Não está a ser submetida a rotinas de produtos sucessivos.

Não está a ser comparada com a pele de outras mulheres.

[short pause]

Está, simplesmente, a ser pele.

[long pause]

Esta forma de habitar a pele é rara hoje.

[pause]

A indústria cosmética constrói-se na ansiedade permanente sobre a pele.

E muitas mulheres, sem se aperceberem, vivem em estado de vigilância dermatológica constante.

[short pause]

Esta vigilância tem custo.

[pause]

Não só financeiro — também emocional.

[short pause]

Cada vez que olhas para a tua pele com olhos críticos, estás a confirmar a ela própria que ela não está bem como está.

[long pause]

A pele, como o resto do corpo, beneficia de ser olhada com aceitação.

[pause]

Não sem cuidado básico — limpeza, hidratação, protecção solar.

Mas sem o excesso de intervenção que a indústria sugere ser indispensável.

[short pause]

Em alguns momentos, fazer menos é melhor.

[pause]

Reduzir produtos. Simplificar rotinas. Deixar a pele ser pele.

[long pause]

Esta semana, faz uma experiência específica.

Durante uma semana inteira, usa apenas três produtos no rosto.

Limpeza simples. Hidratação. Protecção solar.

[pause]

Mais nada.

[short pause]

Sem séruns. Sem máscaras. Sem tratamentos especiais.

[pause]

Vais descobrir, em geral, que a tua pele se mantém bem ou melhora.

E vais descobrir também algo mais importante.

[short pause]

A relação com a tua pele relaxa.

[pause]

Deixas de a olhar todos os dias com a expectativa de ver melhoria visível.

E começas a olhar para ela como olhas para o resto do corpo — com habitação tranquila.

[long pause]

A pele em paz não é objectivo estético.

É qualidade relacional.

[pause]

A relação entre tu e a tua pele.

[short pause]

E essa relação, quando deixa de ser de gestão constante, beneficia tu — e, paradoxalmente, beneficia também a pele.

[pause]

Porque pele permanentemente trabalhada, como qualquer parte do corpo permanentemente trabalhada, fica reactiva.

E pele que não está em estado reactivo costuma estar mais bonita do que pele tratada em excesso.

[long pause]

Não tens de cancelar todos os produtos.

Mas vale a pena, de tempos em tempos, fazer pausa.

[pause]

E redescobrir a pele que existe debaixo do tratamento.

[short pause]

Ela está aí.

E, com paciência, aceita ser deixada em paz.`,
      },
    ],
  },
  {
    id: "curso-pele-nua-m5",
    titulo: "Curso Pele Nua — Módulo 5 (Aulas A, B, C)",
    descricao: "A Cicatriz, A Estria, A Marca.",
    scripts: [
      {
        id: "pele-nua-m5a",
        titulo: "M5.A — As marcas que são histórias",
        curso: "pele-nua",
        texto: `O teu corpo tem marcas.

[pause]

Cicatrizes de operações antigas. Marcas de partos. Estrias de fases em que o corpo cresceu mais depressa do que a pele conseguia acompanhar. Manchas que apareceram com o sol acumulado dos anos.

[long pause]

Cada uma destas marcas é uma história.

[pause]

Não estética. Histórica.

[short pause]

A cicatriz da apendicite que tiveste aos catorze. A estria que apareceu na adolescência. A linha que ficou depois do parto. A marca de uma queda que nunca mais saiu.

[pause]

Cada uma marca uma vida que aconteceu no teu corpo.

[long pause]

A cultura cosmética contemporânea ensina que estas marcas são problemas a corrigir.

[pause]

Cremes para reduzir cicatrizes. Tratamentos para apagar estrias. Lasers para tirar manchas.

[short pause]

Mensagem implícita: o corpo ideal é corpo sem marca de história.

[pause]

Como se viver não tivesse efeito.

E o corpo perfeito fosse o que aparenta nunca ter atravessado nada.

[long pause]

Mas as marcas são, na verdade, prova de vida.

[pause]

Um corpo sem marca é corpo de quem não viveu.

E muitas vezes, o que parece marca de imperfeição é, vista de outra forma, marca de coragem.

[short pause]

A cicatriz que ficou depois daquela operação difícil. A estria que veio depois da gravidez que escolheste. A mancha que está ali há anos porque tu vives, ao sol, como uma mulher que sai de casa.

[long pause]

Reconciliar-te com as marcas exige uma alteração de olhar.

[pause]

Não decisão de "amar as cicatrizes". Isso é frase motivacional vazia.

Mas reconhecimento honesto do que cada marca representa.

[short pause]

Nesta cicatriz, salvei a vida ao meu filho.

Nesta estria, o meu corpo abriu para fazer espaço a outra vida.

Nesta marca, vivi anos de sol sem me esconder do mundo.

[pause]

Estas frases, ditas em silêncio quando olhas para as marcas, mudam a sua qualidade emocional.

[short pause]

Deixam de ser defeitos a esconder.

Passam a ser indicações de uma vida real.

[long pause]

Esta semana, escolhe três marcas no teu corpo.

Para cada uma, escreve numa folha o que aconteceu para a marca aparecer.

[pause]

Lê o que escreveste.

Olha para a marca enquanto lês.

[short pause]

A marca, à luz da história, ganha outra dignidade.

[pause]

Não fica mais bonita esteticamente.

Mas torna-se mais bela existencialmente.

[long pause]

E há diferença importante entre os dois tipos de beleza.

[pause]

A primeira passa com a idade.

A segunda só cresce.`,
      },
      {
        id: "pele-nua-m5b",
        titulo: "M5.B — A reconciliação com o que mudou",
        curso: "pele-nua",
        texto: `O teu corpo já não é o de há vinte anos.

[pause]

E a partir desta verdade simples começa, para muitas mulheres, um luto silencioso.

[long pause]

Luto por uma firmeza que era automática e deixou de ser.

Por uma silhueta que não voltou ao normal depois do último parto.

Por braços, ombros, mãos que envelheceram de uma forma que tu não estavas a esperar.

[pause]

Este luto raramente é admitido em voz alta.

[short pause]

Porque admiti-lo soa a vaidade. Soa a falta de aceitação. Soa a inveja da juventude alheia.

[pause]

E nada disto é elogio social.

Por isso o luto fica em privado.

E em silêncio.

[long pause]

Mas o luto silencioso continua a operar.

[pause]

Aparece em momentos pequenos.

Quando vês uma fotografia tua de há anos. Quando experimentas uma roupa que costumava assentar de outra forma. Quando alguém te chama "senhora" num sítio em que antes te chamava "menina".

[short pause]

Estes momentos doem.

Mais do que tu, em geral, admite.

[long pause]

Reconciliar-te com o que mudou exige permitir-te o luto.

[pause]

Não negá-lo. Não envergonhar-te dele.

Reconhecê-lo como reacção legítima a uma transição real.

[short pause]

O teu corpo mudou. E é razoável sentir alguma coisa em relação a isso.

[pause]

Não tens de celebrar a mudança imediatamente.

Tens, primeiro, de chorar — em silêncio, em privado — o corpo que já não é.

[long pause]

Algumas mulheres encontram alívio em escrever uma carta de despedida ao corpo de uma fase anterior.

[pause]

Não é exercício teatral. É reconhecimento.

[short pause]

"Corpo de meus vinte anos, obrigada por tudo o que fizeste comigo. Já não és. E está bem assim. Agora habito um corpo diferente."

[pause]

Esta despedida explícita liberta espaço interno.

[short pause]

Espaço que estava ocupado, sem saberes, com a esperança de que o corpo de antes pudesse, com algum esforço, voltar.

[pause]

Quando tu reconheces que não vai voltar — e que está bem assim — uma quantidade de energia mental fica disponível para a relação com o corpo actual.

[long pause]

E a relação com o corpo actual, sem a sombra constante do corpo anterior, pode finalmente começar a desenvolver-se.

[pause]

Como uma relação nova.

Não comparada com nada.

[short pause]

Apenas presente.

[pause]

Esta semana, se te apetecer, escreve a carta.

Em privado. Sem público. Sem propósito além do reconhecimento.

[short pause]

E guarda-a.

[pause]

Vais perceber, ao longo das semanas seguintes, que algo dentro de ti relaxou.

[short pause]

A despedida foi feita.

E o corpo actual, sem mais comparação, pode começar a ser habitado em paz.`,
      },
      {
        id: "pele-nua-m5c",
        titulo: "M5.C — Aceitar o corpo que aguentou muito",
        curso: "pele-nua",
        texto: `O teu corpo aguentou muito.

[pause]

Décadas de funcionamento contínuo. Doenças que ele resolveu sem que tu sequer soubesses. Esforços que ele fez quando tu nem percebeste a exigência.

[long pause]

Se pudesses ver, em vídeo acelerado, tudo o que o teu corpo fez por ti desde que nasceste, ficavas espantada.

[pause]

Cada infecção que ele combateu silenciosamente. Cada noite mal dormida que ele compensou. Cada refeição mal feita que ele processou apesar das circunstâncias. Cada queda, cada gripe, cada período de stress — superados sem te mandar conta directa.

[short pause]

O teu corpo é a infraestrutura silenciosa que tornou tudo possível.

[pause]

E na maioria dos dias, tu nem reparas nele — excepto quando algo dói.

[long pause]

Esta é a relação que muitas pessoas têm com o próprio corpo.

[pause]

Tomam-no como dado.

Notam-no apenas quando algo está mal.

E queixam-se dele com regularidade pelos defeitos estéticos que ele tem.

[short pause]

Há injustiça nesta relação.

[pause]

Estás a tratar como problema o que, na verdade, é um dos maiores aliados da tua vida.

[long pause]

Aceitar o corpo que aguentou muito não é gratidão performativa.

[pause]

Não é repetir frases bonitas em frente ao espelho.

[short pause]

É outra coisa, mais concreta.

[pause]

É começar a ter dados específicos sobre o trabalho que ele fez.

[long pause]

A maior parte das mulheres consegue listar com facilidade tudo o que não gosta no próprio corpo.

[pause]

A celulite. A flacidez. A barriga. As pernas.

[short pause]

Mas, se lhes pedires para listar cinco coisas concretas que o corpo fez bem na última semana, ficam paradas.

[pause]

Não conseguem.

Porque nunca olharam por esse ângulo.

[long pause]

Esta semana, vais corrigir esse desequilíbrio.

[pause]

Numa folha, escreve uma lista com cabeçalho:

"Esta semana, o meu corpo —"

[short pause]

E, ao longo de sete dias, vais juntando entradas concretas.

[pause]

Não abstractas. Concretas.

[long pause]

Pode ser:

"Combateu uma constipação que mal cheguei a sentir."

"Compensou uma noite em que dormi quatro horas."

"Digeriu o jantar pesado de sábado sem se queixar."

"Aguentou três horas de pé na consulta da minha mãe."

"Recuperou da semana intensa de trabalho num único fim-de-semana."

[short pause]

São coisas pequenas.

São coisas que tu darias por garantidas.

[pause]

Mas escreves.

Uma por dia, no mínimo. Mais, se reparares.

[long pause]

Ao fim da semana, lê a lista inteira de uma só vez.

[pause]

E repara no que sentes ao ler.

[short pause]

A maioria das mulheres, quando faz este exercício pela primeira vez, sente uma coisa específica.

[pause]

Surpresa.

[long pause]

Surpresa porque é a primeira vez na vida que viram, em letra escrita, o trabalho real do corpo.

[pause]

Não em discurso bonito sobre auto-cuidado.

Em factos.

[short pause]

E os factos, ao contrário das frases, ficam.

[long pause]

O corpo que aguentou muito merece ser visto pelo que tem feito.

[pause]

Não pelo que aparenta.

Pelo que tem sustentado.

[short pause]

E uma lista escrita, à mão, é a forma mais simples e mais sólida de começar a ver.`,
      },
    ],
  },
  {
    id: "curso-pele-nua-m6",
    titulo: "Curso Pele Nua — Módulo 6 (Aulas A, B, C)",
    descricao: "Olhar-se Outra Vez.",
    scripts: [
      {
        id: "pele-nua-m6a",
        titulo: "M6.A — O espelho em casa",
        curso: "pele-nua",
        texto: `O espelho em tua casa não é objecto neutro.

[pause]

É um dos lugares onde mais decisões se tomam sobre ti — sem que ninguém esteja a olhar.

[long pause]

Pensa, por um momento, em como o tens posicionado.

Onde está. Que luz recebe. Quanto tempo passas em frente dele por dia.

[pause]

A maioria das mulheres tem espelhos em sítios funcionais — casa de banho para arranjar o cabelo, entrada para ajustar a roupa, quarto para vestir-se.

[short pause]

Quase nenhum espelho está colocado para ser olhado com calma.

[pause]

Os funcionais convidam à avaliação rápida.

E tu, em cada interacção, fazes-a sem te aperceberes.

[long pause]

Há, porém, uma forma diferente de relacionar com o espelho.

Como local de reconhecimento — não de avaliação.

[pause]

Esta diferença é mais do que semântica.

[short pause]

A avaliação compara o que vê com um padrão. Reconhecimento apenas regista o que está.

[pause]

Avaliação produz julgamento.

Reconhecimento produz familiaridade.

[long pause]

Esta semana, escolhe um espelho que ainda não tem função clara em tua casa.

Ou move um espelho para um sítio diferente daquele em que está agora.

[pause]

Coloca-o num lugar onde a luz seja suave — não fluorescente, não dura.

Onde tu possas estar dois minutos sem pressa.

[short pause]

Este é o teu novo espelho de reconhecimento.

[pause]

Não para te arranjares.

Para te veres.

[long pause]

Uma vez por semana, vai a esse espelho durante dois minutos.

Sem maquilhagem nova. Sem ajustar a roupa. Sem avaliar.

Apenas estar.

[pause]

Olha para o teu rosto. Para os teus olhos. Para a forma como respiras.

[short pause]

Diz, em silêncio, uma única frase: vejo-te.

[pause]

Não tens de sentir nada de especial.

Não tens de pensar nada de profundo.

Apenas estar perto, dois minutos, sem pressa.

[long pause]

Ao fim de algumas semanas, este ritual mínimo transforma a relação com a tua imagem reflectida.

[pause]

A pessoa do espelho começa a deixar de ser objecto a corrigir.

E começa a ser pessoa a quem tu, finalmente, presta atenção sem propósito.

[short pause]

Esta atenção desinteressada — sem agenda, sem objectivo — é dos presentes mais raros que tu te podes dar.

[pause]

E vem por intermédio de algo tão simples como um espelho colocado de propósito num sítio diferente do habitual.`,
      },
      {
        id: "pele-nua-m6b",
        titulo: "M6.B — Deixar o corpo ser visto por ti",
        curso: "pele-nua",
        texto: `Há uma diferença entre olhar para o corpo e ser olhada por ele.

[pause]

Quase toda a tua vida, tu olhaste o teu corpo.

Avaliando. Comparando. Corrigindo.

[long pause]

Mas em poucas ocasiões deixaste o teu corpo ser olhado por ti — sem que tu fosses a juíza.

[pause]

Esta diferença é subtil mas mudou tudo, em mulheres que a praticam.

[short pause]

Olhar avaliando coloca-te numa posição de exterioridade — como se fosses uma pessoa diferente da que está a olhar.

Ser olhada por ti — sem juízo — coloca-te no mesmo lado que o corpo. Lado da habitação, não do exame.

[long pause]

Esta posição é difícil de assumir, no início.

[pause]

Porque o reflexo de avaliar é tão automático que parece a única forma possível de relação com o corpo.

[short pause]

Mas há outra forma.

[pause]

Uma forma em que tu olhas para uma parte do corpo — uma mão, um pé, o peito, uma perna — e simplesmente reparas no que está.

A textura. A cor. A temperatura.

Sem comparar com nada. Sem comentar nada.

[long pause]

Esta semana, faz uma experiência específica.

Senta-te num momento tranquilo, sozinha.

Escolhe uma parte do teu corpo. Pequena.

Uma mão.

[pause]

Olha para essa mão durante um minuto inteiro.

Sem pensar "está envelhecida" ou "tem manchas" ou "devia ser cuidada melhor".

Apenas olha.

[short pause]

A forma dos dedos. As linhas da palma. As pequenas cicatrizes que ela acumulou.

[pause]

Esta mão fez muita coisa. Tocou pessoas. Escreveu cartas. Cozinhou refeições. Acariciou cabeças.

[short pause]

Está aqui.

[pause]

E tu estás a olhar para ela sem agenda.

Talvez pela primeira vez na vida adulta.

[long pause]

Este olhar — desinteressado, atento, sem juízo — pode parecer pequeno.

[pause]

Mas é, em si mesmo, prática reparadora.

[short pause]

Porque o corpo, durante décadas avaliado, sente a diferença quando finalmente é olhado sem agenda.

[pause]

E começa, lentamente, a relaxar uma defesa antiga.

[long pause]

Repete a experiência com outras partes do corpo, ao longo das semanas seguintes.

Um pé. Uma orelha. Uma cicatriz específica.

[pause]

Cada minuto destes acrescenta-se ao anterior.

E tu vais, devagar, construindo uma relação nova com o teu corpo.

Uma relação onde tu já não és apenas avaliadora.

És habitante.

[short pause]

E o corpo, a sentir habitação em vez de exame, começa a tornar-se mais teu do que alguma vez foi.`,
      },
      {
        id: "pele-nua-m6c",
        titulo: "M6.C — O acto silencioso de habitar a pele",
        curso: "pele-nua",
        texto: `Habitar a pele é acto silencioso.

[pause]

Não tem ritual público. Não tem fotografia. Não tem testemunhas.

[long pause]

Acontece em momentos pequenos, sem narração.

[pause]

E acontece, sobretudo, fora da auto-observação consciente.

[short pause]

Tu não habitas a pele a tentar habitá-la.

Habitas quando te esqueces que estás a habitá-la.

[long pause]

Esta é a inversão importante.

[pause]

Quanto mais tu vigias a tua presença no corpo, menos presente ficas.

[short pause]

Porque a vigilância é, em si, uma forma de saída do corpo. É um pedaço de ti a observar, em vez de outro pedaço a viver.

[long pause]

Habitar a pele não se constrói por exercício de atenção.

[pause]

Constrói-se por redução das coisas que te tiram dela.

[short pause]

E essa redução é mais prática do que mística.

[long pause]

A maioria das mulheres adultas tem três a cinco hábitos diários que retiram presença do corpo.

[pause]

O telemóvel à mesa.

A televisão durante o jantar.

A cabeça em três conversas ao mesmo tempo enquanto vais a conduzir.

A planear amanhã enquanto estás a tomar banho hoje.

[short pause]

Cada um destes hábitos, sozinho, parece pequeno.

No conjunto, são horas por dia em que o teu corpo está a fazer coisas sem ti.

[long pause]

Esta semana, em vez de prescrever atenção em tempo real — o que costuma virar mais um trabalho —, vais mapear o que te tira do corpo.

[pause]

Numa folha, escreve em cima:

"Hoje saí do corpo quando —"

[short pause]

E, ao longo do dia, escreves entradas.

[pause]

Não em tempo real. Não a interromper.

À noite, antes de dormir, lembra-te do dia e escreve.

[long pause]

Pode ser:

"Saí do corpo quando estava a almoçar com o telemóvel ao lado e nem reparei no que comi."

"Saí do corpo quando ia a conduzir a planear a reunião e cheguei sem dar conta do percurso."

"Saí do corpo quando tomei banho a recapitular a discussão com a minha filha."

[short pause]

Três entradas por dia.

Sete dias.

[pause]

Ao fim da semana, lê a lista.

[long pause]

Vais reparar num padrão.

[pause]

Há momentos do dia que te tiram do corpo quase sempre.

E há outros, talvez, em que ainda consegues estar.

[short pause]

A lista, sozinha, não muda nada.

[pause]

Mas mostra-te onde, especificamente, começar.

[long pause]

Habitar a pele não é objectivo a alcançar.

É consequência de teres reduzido, em pequenos pontos, o que te tira dela.

[pause]

Não pelo que o corpo aparenta.

Pelo facto de tu, pela primeira vez em muito tempo, estares finalmente nele.`,
      },
    ],
  },
  {
    id: "curso-pele-nua-m7",
    titulo: "Curso Pele Nua — Módulo 7 (Aulas A, B, C)",
    descricao: "O Corpo na Idade.",
    scripts: [
      {
        id: "pele-nua-m7a",
        titulo: "M7.A — A pele depois dos quarenta",
        curso: "pele-nua",
        texto: `Algures depois dos quarenta, a pele muda.

[pause]

Não de forma dramática.

De forma persistente.

[long pause]

Marcas que antes desapareciam ao fim de uns dias passam a ficar mais tempo.

A textura altera-se em sítios específicos.

A pele em torno dos olhos, do pescoço, das mãos, mostra história que antes ficava escondida.

[pause]

Tu reparas. E não consegues parar de reparar.

[short pause]

Cada manhã, pequeno inventário.

[pause]

Quando começou esta linha. Quanto mais marcado este sítio. Quando deixou de voltar ao normal aquela parte.

[long pause]

Esta atenção constante à mudança da pele é, em si mesma, um peso.

[pause]

Não pelo que se nota.

Pelo trabalho mental constante de notar.

[short pause]

A maioria das mulheres adultas dedica, sem se aperceber, uma quantidade significativa de atenção diária a este inventário.

[pause]

Que poderia estar a ser usada para outras coisas.

[long pause]

A indústria que vive desta atenção alimentou-a deliberadamente.

[pause]

Os anúncios estão organizados para te ensinar a ver tudo o que muda como problema a corrigir.

[short pause]

Se aceitares esta lente, vives o resto da vida adulta numa relação adversária com a tua própria pele.

[pause]

Cada nova marca é inimiga.

Cada produto novo é prometido como solução.

[short pause]

E a relação, ano após ano, fica cada vez mais cansativa.

[long pause]

Há outra forma possível.

[pause]

Aceitar que a pele depois dos quarenta tem a textura de uma pele que viveu quarenta anos.

E que esta textura, em si mesma, não é problema.

[short pause]

É consequência natural de um corpo a continuar.

[pause]

Pele perfeita aos quarenta seria, biologicamente, anomalia.

[long pause]

Reconciliar-te com a pele depois dos quarenta exige uma decisão repetida ao longo dos anos.

[pause]

A decisão de não comprar, todos os meses, a história de que a tua pele está a falhar.

[short pause]

A pele não está a falhar.

Está, simplesmente, a continuar a viver — visível.

[pause]

E pele que mostra história é pele real.

[long pause]

Esta semana, observa a tua relação com produtos de pele.

Quanto compras. Com que frequência tens necessidade de algo novo. Como te sentes a aplicar produtos diariamente.

[pause]

Pergunta-te: o que aconteceria se eu fizesse menos durante um mês?

[short pause]

Não cancelar tudo. Reduzir.

[pause]

A pele responde, em geral, melhor do que a indústria sugere.

E tu libertarias atenção, dinheiro, e relação adversária com a tua própria face.

[long pause]

A pele depois dos quarenta não precisa de mais intervenção.

Precisa, na maioria das vezes, de menos.

[pause]

Menos produtos. Menos atenção crítica. Menos reparação.

[short pause]

Mais aceitação de que ela está a fazer exactamente o que se pode esperar de uma pele desta idade.

[pause]

E a partir desta aceitação, a relação relaxa.

E a pele, paradoxalmente, costuma ficar melhor.`,
      },
      {
        id: "pele-nua-m7b",
        titulo: "M7.B — A vergonha residual da menopausa",
        curso: "pele-nua",
        texto: `Há uma vergonha que aparece muito específicamente quando alguém te pergunta a idade.

[pause]

Tu já reparaste.

[long pause]

A pergunta chega — num jantar, numa consulta, num formulário.

E o teu corpo, antes de a tua cabeça responder, faz qualquer coisa.

[pause]

Os ombros sobem ligeiramente.

A respiração interrompe-se durante meio segundo.

A face fica ligeiramente mais quente.

Há um cálculo silencioso a acontecer dentro de ti — quanto custa dizer o número exacto, quanto custa arredondar, quanto custa mentir.

[short pause]

Este cálculo é vergonha residual a aparecer no corpo em tempo real.

[long pause]

Não é a tua vergonha individual.

[pause]

É vergonha colectiva, herdada de décadas a ouvir que mulher acima de certa idade vale menos.

[short pause]

E o teu corpo, sem te perguntar, aprendeu a contrair-se quando a idade é mencionada.

[long pause]

Repara nos sítios onde isto acontece em ti.

[pause]

A boca, que por momentos não consegue formar a sílaba do número exacto.

A barriga, que se aperta um bocadinho sem razão aparente.

Os olhos, que evitam o contacto visual da pessoa que perguntou.

[short pause]

A vergonha da idade não vive na cabeça.

Vive em pontos específicos do corpo.

[long pause]

E é por isso que argumentos racionais — "não tenho razão para sentir vergonha", "a idade é só um número" — não a dissolvem.

[pause]

Porque ela não é argumento.

É reacção corporal aprendida.

[short pause]

E reacções corporais aprendidas só se desinstalam por outra reacção corporal.

[long pause]

Esta semana, durante sete dias, vais fazer uma observação muito específica.

[pause]

De cada vez que alguém te perguntar a idade — ou que tu mesma a tiveres de mencionar, num formulário, num cartão, numa apresentação — repara, em vez de responder em automático.

[short pause]

Repara onde, no corpo, sentes alguma coisa.

São os ombros? É o estômago? É a respiração? É a garganta?

[pause]

Não tentes mudar a reacção.

Só repara.

[long pause]

À noite, antes de dormir, anota numa folha:

"Hoje, quando a idade apareceu, senti em —"

[pause]

E completa com o sítio do corpo. Uma frase. Sem comentário.

[short pause]

Ao fim da semana, lê as anotações em sequência.

[long pause]

Vais reparar duas coisas.

[pause]

A primeira: a reacção repete-se quase sempre no mesmo sítio. O teu corpo tem um lugar específico onde guarda esta vergonha.

[short pause]

A segunda: o simples acto de reparar começa, lentamente, a reduzir a intensidade.

[pause]

Não desaparece numa semana.

Mas começa a deixar de operar invisivelmente.

[long pause]

A vergonha que tu não sabes que tens dirige-te.

A vergonha que tu sabes onde mora deixa, devagar, de te dirigir.

[pause]

E o corpo que reconhece a sua reacção tem, pela primeira vez, hipótese de a recompor.`,
      },
      {
        id: "pele-nua-m7c",
        titulo: "M7.C — O direito de envelhecer sem desculpas",
        curso: "pele-nua",
        texto: `Tens o direito de envelhecer sem desculpas.

[pause]

Esta frase é simples.

E, para muitas mulheres, é difícil de acreditar.

[long pause]

A cultura ensinou-te a desculpar a tua idade.

A pedir desculpa por uma fotografia em que pareces mais velha.

A explicar que não usas certo tipo de roupa "porque já não tem idade".

A justificar mudanças do corpo como se fossem falha tua.

[pause]

Estas pequenas desculpas, repetidas ao longo dos anos, ensinam-te a ti mesma que a tua idade é defeito a ser explicado.

[short pause]

E uma mulher que se sente em defeito por algo tão básico como ter idade não pode habitar a sua vida com plenitude.

[long pause]

Há um movimento simples — em diferentes culturas, ao longo dos séculos — em que as mulheres mais velhas começam a deixar de pedir desculpa.

[pause]

Não em revolta dramática.

Em pequenos gestos diários.

[short pause]

Vestir aquilo que lhes apetece sem se preocupar com "se ainda têm idade".

Falar do que sabem sem suavizar a autoridade que os anos lhes deram.

Aparecer em fotografias sem exigir filtros.

[pause]

Estes gestos parecem pequenos.

Acumulados, são revolução silenciosa.

[long pause]

Tu podes começar isto agora — qualquer que seja a tua idade.

[pause]

Esta semana, presta atenção a uma desculpa específica que tu costumas dar pela tua idade.

Pode ser numa frase concreta. "Já não tenho idade para isto." "Para a minha idade, ainda...". "Nunca pensei chegar a esta fase com..."

[short pause]

Identifica essa desculpa.

[pause]

E, nas próximas semanas, pratica a sua omissão.

[short pause]

Quando o reflexo te puxar para a frase, não a digas.

Substitui por silêncio. Ou pela frase sem a desculpa.

[pause]

"Vou usar este vestido."

Em vez de "vou usar este vestido apesar de já não ter idade para isto."

[long pause]

A desculpa, repetida, instala-se. A omissão, repetida, desinstala-se.

[pause]

E ao longo dos meses, vais notar que a tua relação com a tua idade muda.

[short pause]

Não porque mudaste a idade.

Porque mudaste a forma como falas dela.

[pause]

E a forma como falas, em adulta, determina a forma como vives.

[long pause]

O direito de envelhecer sem desculpas não é declaração teórica.

É prática diária — pequena, silenciosa, persistente.

[pause]

E é uma das formas mais discretas e mais profundas de habitar a tua própria vida.

[short pause]

Não a vida que tu terias com vinte anos.

A vida que tu tens — com a idade que efectivamente tens.

[pause]

E essa vida é, neste momento, a única real.

E merece ser vivida sem desculpa permanente pelo simples facto de existir.`,
      },
    ],
  },
  {
    id: "curso-pele-nua-m8",
    titulo: "Curso Pele Nua — Módulo 8 (Aulas A, B, C)",
    descricao: "A Pele que é Tua. Fecho do curso.",
    scripts: [
      {
        id: "pele-nua-m8a",
        titulo: "M8.A — A pele como casa",
        curso: "pele-nua",
        texto: `A tua pele é a primeira casa que tu já tiveste.

[pause]

Antes de qualquer apartamento. Antes de qualquer quarto. Antes de qualquer país.

A pele é onde tu chegaste à vida.

[long pause]

E é, biologicamente, a única casa que vai ficar contigo do princípio ao fim.

[pause]

Outras casas mudam. Esta, não.

[short pause]

Tu vais habitá-la — em estados diferentes, em formas diferentes — durante todos os anos da tua existência.

[pause]

Esta continuidade radical é, em algum sentido, espantosa.

[long pause]

A maioria das pessoas trata a sua casa física com mais respeito do que trata a sua pele.

[pause]

Investe em mobília. Pinta as paredes. Repara o que se estraga. Mantém limpo. Acolhe visitas.

[short pause]

E à pele — a casa permanente — dá apenas atenção quando há queixa.

[pause]

A inversão de prioridades é estranha quando se olha de fora.

[long pause]

Reconhecer a pele como casa permanente muda o tom da relação.

[pause]

Não como problema a corrigir.

Como espaço a habitar.

[short pause]

E habitar implica conhecer.

[pause]

Conhecer os cantos. As particularidades. O que precisa de mais luz. O que prefere mais sombra.

[long pause]

Tu, ao longo dos anos, foste habitando a tua pele.

Mas raramente com atenção consciente.

[pause]

Esta semana, faz uma coisa simples.

Pensa na tua pele como casa.

[short pause]

Onde, nessa casa, tu te sentes mais à vontade?

Onde, nessa casa, há sítios que tu evitas?

Onde, nessa casa, há lugares que precisariam de mais atenção do que tu tens dado?

[pause]

Estas perguntas não exigem resposta filosófica.

São perguntas pragmáticas — sobre uma casa.

[long pause]

E, ao responderes, podes começar a planear cuidados específicos.

[pause]

Não rotina cosmética genérica.

Atenção real às zonas que precisam.

[short pause]

A pele é casa.

E uma casa bem habitada é uma casa com presença atenta — não com produtos a mais.

[pause]

Tu és, em última análise, a única pessoa qualificada para habitar esta casa específica.

[long pause]

E essa qualificação vai-se desenvolvendo ao longo da vida.

À medida que tu prestas, conscientemente, mais atenção à casa que tu sempre tiveste.

[pause]

E que, com paciência, vai-se tornando cada vez mais reconhecivelmente tua.`,
      },
      {
        id: "pele-nua-m8b",
        titulo: "M8.B — A reconciliação possível",
        curso: "pele-nua",
        texto: `A reconciliação com o próprio corpo não é evento dramático.

[pause]

É processo lento, sem testemunhas.

[long pause]

Não há momento específico em que se passa de relação adversária para relação acolhedora.

Há, antes, uma série de pequenos gestos repetidos ao longo dos anos.

[pause]

Olhar sem corrigir, durante alguns segundos.

Tocar uma parte do corpo sem agenda.

Vestir algo que te dá prazer sem se preocupar com a opinião alheia.

Recusar uma comparação que ia começar.

Parar de pedir desculpa por uma marca que tens há anos.

[short pause]

Cada um destes gestos, individualmente, não muda nada.

[pause]

O conjunto, ao longo do tempo, muda tudo.

[long pause]

A reconciliação não significa amar o teu corpo todos os dias.

Há dias em que vais voltar a criticá-lo. Há semanas em que vais voltar a comparar.

[pause]

Estes recuos são parte do processo.

Não significam que falhaste.

Significam que estás, como qualquer pessoa, em movimento — com avanços e recuos.

[short pause]

A direcção geral, no entanto, vai sendo de aproximação.

[long pause]

Há um momento, em algumas vidas femininas, em que o corpo deixa de ser inimigo principal.

[pause]

Não que se torna favorito.

Apenas que deixa de ser inimigo.

[short pause]

E a vida ganha leveza nova quando esta transição se completa.

[pause]

Porque uma quantidade imensa de energia deixa de ser gasta em batalha interna.

E fica disponível para tudo o resto.

[long pause]

Para amar pessoas. Para fazer trabalho. Para descansar. Para ter prazer simples.

[pause]

A reconciliação com o corpo liberta capacidade para a vida.

[short pause]

E essa libertação é, em si mesma, recompensa que justifica o trabalho.

[long pause]

Esta semana, faz uma reflexão privada.

Em relação ao teu corpo, há quanto tempo tu te encontras em batalha activa?

[pause]

Décadas, provavelmente.

[short pause]

E quanto da tua atenção, em cada dia, é gasta nessa batalha?

[pause]

Provavelmente mais do que tu queres admitir.

[long pause]

Reconciliação parcial é objectivo realista.

Reconciliação total — para a maioria das pessoas — não acontece.

[pause]

Mas mesmo a parcial transforma.

[short pause]

Alguns dias em paz com o corpo. Algumas zonas finalmente aceites. Alguns reflexos automáticos finalmente questionados.

[pause]

Isto, se for o teu caminho nos próximos anos, é mais do que muitas mulheres conseguem na vida inteira.

[long pause]

E é mais do que suficiente para uma vida significativamente diferente daquela que tu tiveste até aqui.`,
      },
      {
        id: "pele-nua-m8c",
        titulo: "M8.C — A mulher que habita a sua pele",
        curso: "pele-nua",
        texto: `Este curso acaba.

[pause]

E tu continuas nele.

[long pause]

Não vais sair daqui transformada.

[pause]

Vais sair com instrumentos que ainda há semanas não tinhas.

[short pause]

Que é coisa diferente. E mais honesta.

[long pause]

Antes de fechar, vamos fazer um inventário.

[pause]

Não de futuro imaginado.

De presente real — o que tu, ao longo destes oito módulos, aprendeste a fazer.

[short pause]

Pega numa folha. Escreve em cima:

"Antes deste curso, eu não fazia —"

[long pause]

E vai escrevendo, devagar, à medida que reconheces.

[pause]

Não fazia contas dos olhares automáticos sobre o meu corpo durante o dia.

Não tinha lista escrita do que o meu corpo aguentou esta semana.

Não sabia em que sítio do corpo se aperta a vergonha quando alguém me pergunta a idade.

Não tinha nomeado as três marcas que carrego e as histórias delas.

Não tinha mapeado os momentos em que saio do corpo sem dar conta.

Não tinha admitido em letra escrita o que aprendi a calar sobre a relação com a minha pele.

[short pause]

Vai escrevendo o que for verdadeiro para ti.

Algumas linhas. Não muitas. As que importam.

[long pause]

Quando acabares, lê a lista.

[pause]

E repara numa coisa.

[short pause]

Cada um destes pontos é um instrumento que ficou em ti.

[pause]

Não é frase motivacional. Não é insight passageiro. É hábito novo, pequeno, instalado.

[long pause]

A mulher que habita a sua pele não é versão idealizada que aparece daqui a cinco anos.

[pause]

É a soma dos pequenos hábitos que tu, ao longo dos meses, vais continuando a praticar depois deste curso terminar.

[short pause]

É a mulher que continua a fazer a contagem dos olhares.

A mulher que continua a escrever a lista do que o corpo aguentou.

A mulher que continua a notar onde a vergonha mora — e, por isso, deixa lentamente de ser dirigida por ela.

[long pause]

Esta mulher não chega.

Constrói-se em cada gesto pequeno repetido.

[pause]

E tu, neste momento, és exactamente isso — uma mulher a meio dessa construção.

[short pause]

Não no fim.

A meio.

[long pause]

Este curso acaba. Os instrumentos ficam.

[pause]

Cada vez que pegas num deles, mesmo sem te lembrares deste curso, estás a continuar o trabalho.

[short pause]

A pele é tua. A casa é tua. Os instrumentos para a habitar agora também.

[pause]

E o que vier a seguir não é transformação prometida.

É o que tu, com estes instrumentos na mão, fizeres todos os dias quando ninguém estiver a ver.`,
      },
    ],
  },
  {
    id: "curso-a-fome-m1",
    titulo: "Curso A Fome — Módulo 1 (Aulas A, B, C)",
    descricao: "A Fome que Não é Fome.",
    scripts: [
      {
        id: "a-fome-m1a",
        titulo: "M1.A — A fome que chega antes das onze",
        curso: "a-fome",
        texto: `Há uma fome que chega quase sempre à mesma hora.

[pause]

Não a das três da tarde. Não a das oito.

A das onze da manhã. Ou a da meia-noite. Ou a das três numa madrugada que não conseguias dormir.

[long pause]

Esta fome chega sem ter passado fisicamente muito tempo desde a refeição anterior.

[pause]

Aparece quando o trabalho aperta.

Quando uma conversa termina mal.

Quando alguém diz uma coisa que te abriu um buraco onde não devia haver buraco nenhum.

[short pause]

Vais ao frigorífico. Ao armário. À gaveta das bolachas.

E comes sem fome real.

[pause]

Enquanto comes, o buraco fecha-se um bocado.

[long pause]

Esta fome tem nome.

É fome emocional.

[pause]

E não é fraqueza tua.

É inteligência.

[short pause]

O teu corpo encontrou uma forma de regular o que a tua mente ainda não sabe nomear.

[pause]

Comer é regulação rápida. Distrai. Acalma. Preenche.

[short pause]

Não resolve o que estava na origem — mas alivia o sintoma imediato.

[long pause]

Reconhecer esta fome como emocional não é diagnóstico para vergonha.

É informação.

[pause]

Informação sobre o que o teu sistema está a tentar gerir.

[short pause]

Quando tu vais ao frigorífico às onze, normalmente, é porque algo aconteceu na hora anterior que precisava de processamento.

E o teu sistema escolheu o atalho disponível.

[pause]

A maioria das mulheres modernas pratica esta regulação várias vezes por semana.

Sem se aperceber.

[long pause]

Esta semana, durante alguns dias, faz uma observação.

Cada vez que te aproximares de comida fora dos horários de refeição, para um segundo.

[pause]

Pergunta-te uma única coisa: o que aconteceu na hora anterior?

[short pause]

Não para te impedires de comer. Apenas para registar.

[pause]

Algumas vezes a resposta vai ser: nada de especial.

Outras vezes vai aparecer: discuti com X. Recebi um email difícil. Pensei naquela coisa que me preocupa.

[long pause]

Esta consciência, em si mesma, muda a relação com a fome emocional.

[pause]

Porque deixa de ser comportamento inexplicável que tu fazes envergonhada.

Passa a ser comportamento com causa identificada.

[short pause]

E uma causa identificada pode, com tempo, ser tratada de outras formas.

[pause]

Não imediatamente. Mas com prática.

[long pause]

A fome que chega antes das onze é mensagem.

Se a souberes ler, podes começar a responder ao que ela está realmente a pedir — em vez de oferecer apenas comida que ela aceita por falta de outra opção.`,
      },
      {
        id: "a-fome-m1b",
        titulo: "M1.B — O que a tua boca pede que não é comida",
        curso: "a-fome",
        texto: `Há coisas que a tua boca pede que não são comida.

[pause]

Pede conversa quando não há ninguém.

Pede toque quando estás há semanas sem ser tocada.

Pede descanso quando só te dás pausas para comer.

[long pause]

Como a mente não te deixa parar para pedir o que realmente precisas, o corpo aprende a pedir pela boca.

[pause]

Porque pela boca é aceitável.

[short pause]

Podes sair da reunião para comer. Não podes sair para chorar.

Podes abrir o frigorífico à meia-noite. Não podes ligar a alguém à meia-noite só para dizer que te sentes sozinha.

[pause]

A boca passou a ser canal universal de pedido.

[long pause]

Tem nome o que a tua boca faz.

É o único pedido que aprendeste a fazer sem vergonha.

[pause]

Esta substituição funciona — em parte.

[short pause]

Comer alivia algumas das fomes que não são alimentares.

Mas raramente as resolve.

[pause]

E ao longo dos anos, a substituição acumula.

[long pause]

A mulher que come muito quando se sente só tem, no fim de cinco anos, ganho de peso que não corresponde à sua relação com comida.

Corresponde à sua relação com solidão.

[pause]

A mulher que come quando está cansada tem, no fim de uma década, problemas de saúde que se diagnosticam como alimentares.

Mas a causa é exaustão crónica.

[short pause]

Tratar o sintoma — a comida — sem tratar a causa não funciona.

[pause]

E muitas mulheres passam décadas a fazer dietas sem entender que o problema não é o que está no prato.

É o que falta na vida.

[long pause]

Esta semana, identifica três coisas que a tua boca pede mas que não são comida.

Pode ser: conversa profunda, toque físico, descanso real, silêncio sem agenda, atenção genuína.

[pause]

Para cada uma, escreve: a quem podia pedir esta coisa explicitamente?

[short pause]

Algumas pessoas vão aparecer com facilidade.

Outras vão exigir reflexão.

[pause]

E para algumas das tuas fomes não-alimentares, talvez não haja ainda pessoa disponível na tua vida — e essa percepção é, em si mesma, dado importante.

[long pause]

A boca está cansada de pedir tudo.

E começar a fazer pedidos diferentes em sítios diferentes alivia o trabalho que ela tem feito sozinha durante anos.

[pause]

Não vais parar de comer emocionalmente de uma vez.

Mas, ao longo do tempo, a frequência reduz.

[short pause]

Porque outras fomes começam a ser atendidas onde realmente pertencem.

E a comida pode voltar a ser, simplesmente, comida.`,
      },
      {
        id: "a-fome-m1c",
        titulo: "M1.C — As noites em que te esqueces de ti até ao frigorífico",
        curso: "a-fome",
        texto: `Há noites em que só te lembras que existes quando chegas ao frigorífico.

[pause]

Passaste o dia a cuidar. A responder. A resolver. A estar presente para todos menos para ti.

[long pause]

E quando finalmente a casa se cala e tu ficas sozinha, o corpo começa a pedir.

[pause]

Pede sal. Pede açúcar. Pede gordura.

Pede com urgência. Como se tivesse estado a segurar-se o dia inteiro.

[short pause]

Porque tinha.

[pause]

O que tu chamas gula, à meia-noite, tem outro nome.

[long pause]

É a primeira vez que te dás atenção desde que acordaste.

[pause]

Não é a comida que procuras.

É a presença.

[short pause]

E como a única presença disponível àquela hora é a tua — e a tua só se lembra de ti na boca — vais ao frigorífico.

[pause]

Esta dinâmica é particularmente comum em mulheres que cuidam — de filhos, de pais, de equipas, de alunos, de qualquer pessoa que dependa delas durante o dia.

[long pause]

A culpa que sentes a comer à meia-noite não é proporcional ao que comeste.

É proporcional ao quanto te abandonaste durante o dia.

[pause]

E a comida está, simplesmente, a tentar resolver o sintoma do abandono.

[short pause]

Não vai conseguir.

[pause]

Mas é a única ferramenta que tu, sozinha em cozinha silenciosa às onze da noite, tens disponível naquele momento.

[long pause]

A solução não é parar de comer à noite.

É começar a chegar a ti mais cedo no dia.

[pause]

Antes do frigorífico.

Antes do cansaço.

Enquanto ainda era possível escolheres de outra forma.

[long pause]

Esta semana, identifica os momentos do dia em que tu, normalmente, te perdes.

[pause]

Em geral, são os momentos depois das transições — quando termina uma tarefa exigente e tu, em vez de fazeres uma pausa, partes imediatamente para a próxima.

[short pause]

Estes momentos são oportunidade.

[pause]

Cinco minutos de presença para ti.

Não cinco minutos no telefone. Cinco minutos sentada, em silêncio, sem fazer nada.

[short pause]

Estes pequenos momentos, repetidos ao longo do dia, reduzem a urgência da fome nocturna.

[long pause]

Porque o corpo, sentindo presença ao longo do dia, não chega à noite com sede acumulada de atenção.

[pause]

E a comida da noite, quando vier, vem sem tanta urgência.

E pode ser, por isso, comida e não substituto.

[short pause]

Esta é a forma mais sustentável de mudar a relação com a fome emocional nocturna.

[pause]

Não restringir à noite.

Mas começar a chegar a ti durante o dia.`,
      },
    ],
  },
  {
    id: "curso-a-fome-m2",
    titulo: "Curso A Fome — Módulo 2 (Aulas A, B, C)",
    descricao: "Comer Escondida.",
    scripts: [
      {
        id: "a-fome-m2a",
        titulo: "M2.A — A comida que comes sem testemunhas",
        curso: "a-fome",
        texto: `Há comida que tu só comes quando ninguém vê.

[pause]

Não é a comida que pões no prato à mesa.

Não é a que registas mentalmente como refeição.

[long pause]

É outra.

[pause]

É o pedaço de pão arrancado da broa quando vais buscar a água.

É a colher de manteiga de amendoim directamente do frasco, em pé, com a porta do armário aberta.

É o bocado de chocolate partido no escuro do frigorífico aberto às onze da noite.

[long pause]

São pequenas. Cada uma, sozinha, parece insignificante.

[pause]

Mas tu sabes que existem.

E sabes que, se alguém te perguntasse o que comeste hoje, não as nomearias.

[short pause]

Porque elas existem precisamente fora do registo.

Existem na zona da casa onde a tua relação com a comida não é vista, não é contada, não é avaliada.

[long pause]

Esta zona tem nome.

Chama-se comer escondida.

[pause]

E quase todas as mulheres que vivem com vigilância sobre o corpo conhecem-na intimamente.

[long pause]

A comida escondida não acontece por fome.

Acontece porque há um pedaço de ti que tem fome — emocional, real, antiga — e que aprendeu que esta fome não pode aparecer à mesa.

[pause]

À mesa, tu comes a porção razoável. A salada. A peça de fruta como sobremesa.

[short pause]

Em frente aos outros, a tua relação com a comida tem que demonstrar moderação.

[long pause]

E então a parte de ti que tem fome a sério — ou desejo a sério, ou cansaço a sério — vai buscar o pedaço escondido.

[pause]

Vai buscar quando ninguém está a ver.

Porque foi a única forma que encontrou de comer sem ser julgada.

[long pause]

E aqui está a inversão importante.

[pause]

A maioria das pessoas pensa que comer escondida é problema de descontrolo.

Não é.

[short pause]

Comer escondida é problema de exposição.

[pause]

É problema de não te sentires com licença para comer aquilo, naquela quantidade, à frente de outras pessoas.

E então comes igual.

Mas comes em segredo.

[long pause]

A comida fica a mesma. O peso, igual. Mas o teu sistema nervoso fica em estado de vigilância silenciosa permanente.

[pause]

Porque uma parte de ti está sempre a esconder. Sempre a calcular se alguém vai entrar na cozinha. Sempre a apagar o vestígio.

[short pause]

Esta vigilância cansa mais do que a comida engorda.

[long pause]

Esta semana, faz uma coisa muito simples.

[pause]

Numa folha, escreve uma lista honesta. Sem ninguém ver, podes — esta lista é só para ti.

[short pause]

Escreve o que comeste hoje sem ter contado a ninguém. Sem ter pousado no prato. Sem ter chamado refeição.

[pause]

O bocado de queijo do frigorífico. A colher de doce. O biscoito que partiste a meio para te convenceres de que era metade.

[long pause]

Não estás a fazer isto para te julgares.

Estás a fazer isto para teres dados.

[pause]

Para começares a saber, com precisão, quanto da tua relação com a comida acontece em segredo.

[short pause]

Quase todas ficam em choque com o tamanho da lista.

[pause]

Não porque seja muita comida.

Mas porque é muita escondida.

[long pause]

E quando consegues ver — em letra escrita, na tua própria mão — quanto comes em segredo, alguma coisa começa a mudar.

[pause]

Não a quantidade.

A vergonha.

[short pause]

A comida deixa de ser inimigo silencioso.

Passa a ser informação.`,
      },
      {
        id: "a-fome-m2b",
        titulo: "M2.B — O pedaço que deixas no prato",
        curso: "a-fome",
        texto: `Há um gesto que tu fazes em restaurantes que aprendeste sem ninguém te ensinar.

[pause]

Deixas um pedaço no prato.

[long pause]

Não porque estás cheia.

Não porque a comida não estava boa.

Não porque, fisicamente, o teu corpo já não conseguia.

[pause]

Deixas porque limpar o prato em frente aos outros — ou pior, em frente a outro homem, ou em frente a uma sogra, ou em frente a uma colega magra — parece falta de educação. Falta de moderação. Falta de feminilidade aprendida.

[long pause]

Aprendeste em algum momento que a mulher com fome a sério é mulher pouco feminina.

[pause]

Aprendeste que pôr o garfo a raspar o prato é coisa de homem. De pessoa de campo. De pessoa sem formação.

[short pause]

A mulher distinta deixa qualquer coisa.

A mulher delicada come o suficiente para parecer educada, não o suficiente para ficar saciada.

[long pause]

E então tu ficas com fome.

[pause]

Sais do restaurante. Conversas mais um bocado. Vais para casa.

E em casa, sozinha, abres o frigorífico.

[short pause]

E comes mais.

[pause]

Mas agora, em segredo. Como vimos no áudio anterior.

[long pause]

Repara na coreografia.

[pause]

Em público — restrição visível.

Em privado — compensação invisível.

[short pause]

A quantidade total que comes pode até ser igual à quantidade que comerias se simplesmente acabasses o prato no restaurante.

Mas a tua cabeça vive em ginástica permanente.

[long pause]

E a tua relação com a comida fica partida em dois pedaços.

[pause]

O pedaço performativo — o que mostras.

O pedaço real — o que comes mesmo.

[short pause]

E os dois nunca coincidem.

[long pause]

Esta semana, quando saíres a comer fora — pode ser jantar com alguém, almoço de trabalho, café com bolo —, faz uma experiência.

[pause]

Se acabares o prato sem teres ficado cheia, acaba-o.

[short pause]

Sem deixar pedaço educado.

Sem dizer "ai, já estou cheia" antes de estares.

Sem rejeitar a sobremesa que querias só porque a outra mulher à mesa também rejeitou.

[long pause]

Não te peço que faças isto sempre.

Peço que faças uma vez. Numa refeição.

[pause]

Para reparares no que acontece dentro de ti enquanto comes a porção real.

[short pause]

Vai aparecer desconforto.

Vai aparecer a sensação de que estás a ser observada — mesmo que ninguém esteja a olhar.

Vai aparecer a vontade de pedir desculpa por teres fome.

[long pause]

Repara nisto sem fugires.

[pause]

Porque o que estás a sentir é a vergonha aprendida há décadas a operar em tempo real.

[short pause]

E a única forma de a desinstalar é deixá-la aparecer e não fazer nada para a esconder.

[long pause]

Comer a porção real, em público, uma vez, é gesto político pequeno.

[pause]

Mas é dos mais subversivos que uma mulher pode fazer.

[short pause]

Porque é declaração silenciosa de que o teu corpo tem fome legítima.

E que essa fome merece ser saciada à luz, e não em segredo.`,
      },
      {
        id: "a-fome-m2c",
        titulo: "M2.C — A vergonha de ter fome",
        curso: "a-fome",
        texto: `Há mulheres que pedem repetição num restaurante.

[pause]

Não muitas.

[long pause]

A maioria, mesmo com fome, não pede.

[pause]

Porque pedir mais comida é, em algum lugar profundo da educação que recebeste, admissão pública de coisa.

[short pause]

De quê, exactamente, é difícil de nomear.

De gula. De falta de controlo. De ter um corpo que pede mais do que o socialmente esperado.

[long pause]

A fome, em mulher adulta, traz vergonha.

[pause]

Não a fome de quem passou fome a sério.

A outra. A fome doméstica. A fome de quem comeu uma porção razoável e ainda quer mais.

[short pause]

Esta fome é tratada, na maioria dos contextos, como fraqueza moral.

[long pause]

Repara que, num grupo misto à mesa, os homens podem pedir segunda dose sem que ninguém comente.

Os homens podem dizer "esta sopa estava tão boa, vou repetir" e ninguém pisca o olho.

[pause]

Uma mulher que diz a mesma frase — sobretudo se já tem algum peso a mais — sente, instantaneamente, o silêncio à mesa.

[short pause]

O silêncio das outras mulheres, que estão a calcular mentalmente quanto é que ela vai comer.

O silêncio de algum homem que está a registar que ela tem apetite "para mulher".

[long pause]

Tu sabes deste silêncio.

[pause]

Conheces o calor súbito na cara quando, num jantar, te apeteceu a segunda dose e em vez disso disseste "estava óptimo" e ficaste com fome.

[short pause]

A vergonha de ter fome é uma das coisas mais antigas que carregas.

[long pause]

E é coisa que não se dissolve por argumento racional.

[pause]

Não se dissolve porque sabes intelectualmente que é absurdo.

Dissolve-se por exposição lenta.

[short pause]

Por sentir a vergonha aparecer e — em vez de obedecer — fazer ainda assim o gesto.

[long pause]

Esta semana, escreve numa folha três momentos da tua vida em que tiveste fome a sério e não pediste mais.

[pause]

Pode ser um jantar de família onde repetir parecia mal.

Pode ser uma refeição em casa de alguém onde tinhas medo de gostar demasiado.

Pode ser um almoço de trabalho onde te limitaste à entrada porque era o que as outras mulheres estavam a pedir.

[short pause]

Escreve esses três momentos.

[pause]

Ao lado de cada um, escreve o que sentiste depois — quando, em casa, sozinha, foste compensar.

[long pause]

Provavelmente vais reparar num padrão.

[pause]

Os momentos em que comes menos do que o teu corpo pede em público são quase sempre seguidos de momentos em que comes mais do que o teu corpo pede em privado.

[short pause]

Não é a tua falta de controlo.

É a tua tentativa de equilibrar uma conta que ficou em aberto à mesa.

[long pause]

E aqui está o ponto que poucos cursos de alimentação dizem.

[pause]

A solução para a chamada compulsão nocturna não é mais disciplina à noite.

[short pause]

É menos restrição à mesa.

É deixar-te ter a porção real à frente dos outros.

É admitir que tens fome humana, normal, viva.

[long pause]

A vergonha de ter fome só se dissolve quando começas, em pequenos gestos, a dar-te licença pública de a ter.

[pause]

Não tens que pedir repetição amanhã.

Mas podes começar a notar quantas vezes não pedes só por causa do silêncio dos outros.

[short pause]

E essa atenção, sozinha, já começa a reduzir o tamanho da fome escondida que aparece à noite.`,
      },
    ],
  },
  {
    id: "curso-a-fome-m3",
    titulo: "Curso A Fome — Módulo 3 (Aulas A, B, C)",
    descricao: "A Fome de Outras Coisas.",
    scripts: [
      {
        id: "a-fome-m3a",
        titulo: "M3.A — A fome que era na verdade cansaço",
        curso: "a-fome",
        texto: `Há um momento, quase todos os dias, em que a tua mão vai automaticamente buscar comida.

[pause]

Costuma ser ao fim da tarde.

Costuma ser entre uma reunião e outra. Entre arrumar a casa e começar o jantar. Entre acabar o trabalho e ir buscar os filhos.

[long pause]

A mão vai. E tu nem reparas que foi.

[pause]

Já estás com o biscoito, com a fatia, com a barra, com o café e o pastel — antes de teres feito uma única pergunta.

[short pause]

A pergunta seria muito simples.

Tenho fome?

[long pause]

Mas tu não fazes esta pergunta.

[pause]

Porque a comida é resposta automática a outra coisa que ainda não aprendeste a nomear.

[short pause]

E essa outra coisa, na maioria das mulheres adultas, é cansaço.

[long pause]

Cansaço acumulado de várias horas a funcionar.

Cansaço que não pediu para ser cansaço, porque o teu dia ainda não acabou.

Cansaço que, se fosse reconhecido, exigiria uma pausa que tu não te dás.

[pause]

A comida é, neste momento, substituto da pausa.

[short pause]

É energia rápida que te permite continuar sem teres que parar.

[long pause]

Repara na inversão.

[pause]

Tu não comes porque tens fome.

Tu comes porque é a única forma socialmente aceitável de te dares uma pausa de cinco minutos.

[short pause]

Sentar e não fazer nada por cinco minutos sem comer chama-se preguiça.

Sentar e comer um bolo nesses mesmos cinco minutos chama-se merenda.

[long pause]

A diferença é cultural.

[pause]

E é por isso que mulheres em alta exigência — mães, profissionais, cuidadoras — comem mais do que precisariam.

[short pause]

Não é apetite.

É a única forma de pararem.

[long pause]

Esta semana, faz uma experiência.

[pause]

Quando sentires a mão a ir automaticamente buscar comida ao fim da tarde, não a impeças.

[short pause]

Mas, antes de comeres, senta-te.

Senta-te numa cadeira. Não em pé. Não a andar.

Numa cadeira.

[pause]

Pousa o que ias comer à tua frente, mas ainda não comas.

Olha para a coisa durante um minuto.

[long pause]

Provavelmente, em vinte segundos, vais reparar que o que querias não era a comida.

[pause]

Era a cadeira.

[short pause]

Era o gesto de parar.

Era os cinco minutos sentada sem ter que justificar.

[long pause]

Quando reparares nisto, podes fazer uma escolha.

[pause]

Podes comer e levantar-te imediatamente — como costumas fazer.

Ou podes ficar sentada cinco minutos, mesmo depois de comer, mesmo sem fazer nada.

[short pause]

A segunda opção desinstala lentamente o automatismo.

[pause]

Porque ensina ao teu sistema nervoso uma coisa nova:

[long pause]

Que parar é permitido.

Sem ter que comer para o justificar.`,
      },
      {
        id: "a-fome-m3b",
        titulo: "M3.B — A fome que era na verdade tristeza",
        curso: "a-fome",
        texto: `Há mulheres que sabem exactamente o que comem quando estão tristes.

[pause]

Tu provavelmente sabes.

[long pause]

Para algumas, é gelado.

Para outras, pão com manteiga.

Para outras ainda, batatas fritas. Chocolate. O bolo da padaria do bairro que ninguém em casa come.

[pause]

Cada mulher tem o seu repertório de tristeza-comida.

[short pause]

E este repertório foi-se construindo ao longo da vida, refeição emocional após refeição emocional.

[long pause]

A primeira vez que comeste a comida da tristeza, provavelmente eras nova.

Provavelmente alguém te tinha magoado. Ou tinha morrido alguém. Ou tinhas chumbado num exame que querias passar.

[pause]

E alguém — uma mãe, uma avó, uma amiga — pegou em comida e deu-ta.

Não para te alimentar.

Para te consolar.

[short pause]

Isto não é mau.

Comida é, em muitas culturas, gesto de cuidado.

[long pause]

O problema é que, se este foi o único cuidado que aprendeste a receber em momentos difíceis, ele tornou-se hábito.

[pause]

E em adulta, sozinha, quando aparece tristeza — a tua mão vai buscar a mesma coisa que te deram em criança.

[short pause]

Não porque tens fome.

Porque tens tristeza e a tristeza, no teu corpo, foi sempre acompanhada de comida.

[long pause]

A comida não cura a tristeza.

Tu sabes isto.

[pause]

Mas distrai. Ocupa as mãos. Ocupa a boca. Ocupa o estômago.

[short pause]

E enquanto comes, há um espaço de cinco a quinze minutos em que a tristeza fica em segundo plano.

[long pause]

Depois volta.

[pause]

E, frequentemente, volta acompanhada de uma segunda tristeza — a vergonha de teres comido aquilo, naquela quantidade, naquela hora.

[short pause]

Duas tristezas em vez de uma.

[long pause]

Esta semana, quando reparares que estás a comer com tristeza no peito, faz uma coisa.

[pause]

Não pares de comer.

[short pause]

Acaba a porção que ias comer.

Mas, quando acabares, em vez de te levantares, fica.

[pause]

Pega numa folha. Pega num caderno. Pega num bocado de papel onde possas escrever.

[long pause]

E escreve uma única frase:

Estou triste por causa de —

[pause]

E completa.

[short pause]

Pode ser específico — "estou triste porque a minha irmã não me ligou no aniversário".

Pode ser difuso — "estou triste e não sei muito bem porquê".

Pode ser antigo — "estou triste por uma coisa que aconteceu há vinte anos e ainda dói".

[long pause]

Quando escreves a tristeza, ela passa de difusa para nomeada.

[pause]

E a tristeza nomeada deixa de precisar de ser comida.

[short pause]

Não em todas as vezes.

Não imediatamente.

[long pause]

Mas, com o tempo, a tua mão vai começar a ir buscar a folha em vez do biscoito.

[pause]

Porque vai aprender que escrever a tristeza alivia mais do que a comer.

[short pause]

E que, ao contrário da comida, escrever a tristeza não traz a segunda tristeza atrás.`,
      },
      {
        id: "a-fome-m3c",
        titulo: "M3.C — A fome que era na verdade solidão",
        curso: "a-fome",
        texto: `Há um tipo de fome que aparece muito especificamente em mulheres que vivem sozinhas.

[pause]

Mas não é só dessas.

Aparece também em mulheres que vivem cercadas de gente — marido, filhos, netos — e que, ainda assim, sentem por dentro um silêncio que ninguém ocupa.

[long pause]

Esta fome chega quase sempre à mesma hora.

[pause]

Costuma ser depois do jantar.

Quando a casa fica quieta. Quando os filhos foram dormir. Quando o homem está a ver televisão na sala e não há nada para fazer.

[short pause]

E, de repente, apetece.

[long pause]

Apetece comer qualquer coisa.

Não é fome física.

É outra coisa.

[pause]

É a sensação de que falta companhia para a noite.

É a sensação de que a casa é grande demais e tu pequena demais.

É a sensação, antiga e sem nome, de que se houvesse alguém ali com quem partilhar uma chávena de chá, talvez não precisasses do bolo.

[short pause]

Mas não há.

E então comes.

[long pause]

A comida, neste momento, é substituto de presença.

[pause]

É pseudo-companhia.

É o gesto de pôr alguma coisa em contacto com a tua boca quando o que querias era pôr palavras em contacto com a boca de outra pessoa.

[short pause]

Comer sozinha à noite, no escuro, sem fome física — é uma das formas mais discretas em que a solidão aparece em mulheres adultas.

[long pause]

E é especialmente discreta porque é socialmente invisível.

[pause]

Ninguém te vê. Tu própria, na manhã seguinte, não a chamas solidão.

Chamas-lhe descontrolo. Chamas-lhe falta de força de vontade. Chamas-lhe, quando és muito honesta, ansiedade.

[short pause]

Mas raramente lhe chamas o que ela é.

Estou só, e a comida ocupa o lugar de quem não está.

[long pause]

Esta semana, à hora em que costumas ter esta fome — provavelmente entre as nove e as onze da noite — faz uma coisa diferente.

[pause]

Pega no telemóvel.

[short pause]

Manda uma mensagem a uma única pessoa. Pode ser uma irmã, uma amiga antiga, uma colega que gostas mas com quem nunca falas fora do trabalho.

[pause]

A mensagem pode ser banal:

"Estava só a pensar em ti. Como tens andado?"

[long pause]

Não esperes resposta imediata.

Não condiciones nada à resposta.

[pause]

O acto de mandares já é, em si, gesto de companhia.

É gesto de te lembrares que existem pessoas. Que estás em rede. Que não és só corpo sozinho na cozinha às dez da noite.

[short pause]

Provavelmente, depois de mandares, a fome diminui.

[long pause]

Não vai sempre.

Não em todas as noites.

[pause]

Mas o suficiente para começares a perceber que muito do que tu comes à noite — não é fome.

[short pause]

É um pedido de companhia que aprendeste a fazer com a boca, em vez de fazer com palavras.

[pause]

E mudar a direcção do pedido — da boca para o telemóvel, da comida para a mensagem — é uma das coisas mais simples e mais eficazes que podes fazer pela tua relação com a fome.

[long pause]

Comer é alimentar o corpo.

[pause]

Mandar mensagem a alguém à noite é alimentar a parte de ti que tem fome de ser vista.

[short pause]

E, ao contrário do bolo, não traz vergonha na manhã seguinte.`,
      },
    ],
  },
  {
    id: "curso-a-fome-m4",
    titulo: "Curso A Fome — Módulo 4 (Aulas A, B, C)",
    descricao: "A Comida da Mãe.",
    scripts: [
      {
        id: "a-fome-m4a",
        titulo: "M4.A — A frase à mesa que ficou em ti",
        curso: "a-fome",
        texto: `Quase todas as mulheres carregam, na relação com a comida, uma frase específica que alguém disse à mesa.

[pause]

Nem sempre te lembras claramente.

Mas a frase está lá. A operar.

[long pause]

Pode ter sido a mãe a olhar para o teu prato e dizer:

"Tens a certeza de que precisas de mais?"

[pause]

Pode ter sido o pai a comentar, sem maldade, num jantar de família:

"Esta menina, se não a controlamos, come tudo."

[short pause]

Pode ter sido uma tia, uma avó, um irmão a brincar:

"Olha quem está a engordar."

[long pause]

Provavelmente foi dito num momento aparentemente banal.

[pause]

Provavelmente quem disse já se esqueceu há décadas.

[short pause]

Mas tu não esqueceste.

Não no plano consciente — talvez não te lembres de imediato. Mas no plano corporal, sim.

[long pause]

Esta frase ficou registada como regra.

[pause]

E desde aí, todas as vezes que tu te sentas à mesa, há uma parte de ti que está a obedecer a essa regra, mesmo que tu já não a saibas dizer em voz alta.

[short pause]

A regra pode ser:

"Não comas tudo o que está no prato."

"Não peças mais do que os outros."

"Tem cuidado, ou vais ficar como aquela tia."

"Mulher bonita não tem apetite."

[long pause]

Estas regras não foram escolhidas por ti.

[pause]

Foram instaladas em ti.

[short pause]

Por palavras casuais ditas em momentos casuais por pessoas que não tinham ideia do peso que essas palavras iam ter.

[long pause]

Esta semana, vais fazer um exercício pequeno mas importante.

[pause]

Numa folha, escreve em cima:

"Frases sobre comida que ficaram em mim."

[short pause]

E vai escrevendo, ao longo dos dias, à medida que te lembras.

[pause]

Não esforces a memória.

Quando estiveres a comer e reparares que algo te fez pousar o garfo antes de estares cheia, repara.

Quando estiveres a calcular se podes ou não pedir a sobremesa, repara.

Quando sentires vergonha sem razão presente, repara.

[long pause]

Em cada um destes momentos, a tua cabeça tem uma frase a operar.

[pause]

Não é tua. Foi-te dada.

E a tua tarefa é, durante esta semana, identificar o nome de quem ta deu.

[short pause]

Ao lado de cada frase que escreveres, escreve um segundo dado:

"Esta frase, na minha cabeça, soa à voz de —"

[pause]

Pode ser a mãe. O pai. Uma irmã mais velha. Uma chefe. Uma amiga da adolescência.

[long pause]

Quando consegues atribuir a frase a alguém específico, ela perde alguma coisa.

[pause]

Deixa de parecer verdade tua.

Passa a parecer empréstimo.

[short pause]

E o que é empréstimo pode, com tempo, ser devolvido.

[long pause]

Não amanhã.

Mas a partir do momento em que a frase tem nome de outra pessoa, a tua relação com ela começa a mudar.

[pause]

Já não a obedeces porque é tua.

Começas a obedecê-la, ou não, sabendo que é dela.`,
      },
      {
        id: "a-fome-m4b",
        titulo: "M4.B — A relação que ela tinha com o próprio corpo",
        curso: "a-fome",
        texto: `Antes de tu teres uma relação com a comida, viste a relação que a tua mãe tinha.

[pause]

Antes de qualquer livro, qualquer conselho, qualquer aula de educação alimentar.

[long pause]

Viste-a aos seis, sete, dez anos, sem saber que estavas a aprender.

[pause]

Viste-a olhar-se ao espelho de manhã.

Viste-a queixar-se da barriga depois das festas.

Viste-a dizer "hoje não como, ainda estou cheia de ontem" — e percebeste, sem palavras, que isso era forma adulta de ser mulher.

[short pause]

Viste-a a fazer uma dieta. Depois outra. Depois outra.

Viste-a celebrar quilos perdidos como se fosse vitória pessoal.

Viste-a ficar de mau humor quando a balança não cooperava.

[long pause]

Tu não imitaste o que ela disse sobre o corpo.

Imitaste o que ela fez com o corpo.

[pause]

E o que ela fez foi, em quase todos os casos, uma versão da guerra silenciosa que ela própria tinha aprendido com a tua avó.

[short pause]

Esta cadeia é longa.

[pause]

Avó. Mãe. Tu.

[long pause]

E a maior parte das mulheres adultas vive com uma relação com o corpo e com a comida que não desenharam.

[pause]

Herdaram.

[short pause]

Herdaram a vigilância matinal ao espelho.

Herdaram as frases ao prato.

Herdaram a culpa pela sobremesa.

Herdaram a sensação de que comer com prazer, em adulta, é forma de fraqueza.

[long pause]

Esta semana, vais fazer um exercício de genealogia.

[pause]

Numa folha grande, divide-a em três colunas.

[short pause]

Em cima da primeira escreve o nome da tua avó.

Em cima da segunda escreve o nome da tua mãe.

Em cima da terceira escreve o teu nome.

[pause]

E em cada coluna, escreve três frases.

[long pause]

Como é que ela falava do próprio corpo?

Como é que ela comia em frente aos outros?

O que é que ela disse, em algum momento, sobre comida e mulheres?

[short pause]

Algumas destas perguntas tu não saberás responder pela tua avó.

[pause]

Tudo bem.

Escreve o que sabes. Pergunta à tua mãe, ou a uma tia, se conseguires.

[short pause]

A coluna pode ficar com lacunas.

A própria lacuna é informação — a tua avó pode ter tido uma relação com a comida que ninguém na família registou.

[long pause]

Quando acabares as três colunas, lê-as em sequência.

[pause]

Da esquerda para a direita.

[short pause]

Vais reparar numa coisa.

[pause]

Há frases que se repetem, com pequenas variações, em todas as três colunas.

[long pause]

Há gestos que tu fazes hoje à mesa que a tua avó já fazia há cinquenta anos.

[pause]

Não porque te ensinou.

Porque atravessou três gerações sem te perguntar.

[short pause]

Quando vês isto desenhado, em letra escrita, alguma coisa muda.

[long pause]

A tua relação com a comida deixa de parecer falha tua.

Passa a parecer herança a ser gerida.

[pause]

E as heranças, ao contrário das falhas, podem ser reorganizadas.

[short pause]

Pode haver itens da herança que escolhes manter.

E há outros que, sabendo agora a origem, podes começar a recusar.

[pause]

Não para a tua mãe.

Não para a tua avó.

Para a próxima geração — tua filha, tua sobrinha, qualquer mulher nova que te observe à mesa sem que tu te apercebas.`,
      },
      {
        id: "a-fome-m4c",
        titulo: "M4.C — O prato que tu ainda comes por causa dela",
        curso: "a-fome",
        texto: `Há um prato que tu ainda comes hoje, em adulta, pelo qual tu não escolherias.

[pause]

Mas comes.

[long pause]

Pode ser o assado de domingo.

Pode ser a sopa que ela fazia sempre quando estavas constipada.

Pode ser o doce típico do Natal que ninguém em tua casa actualmente gosta a sério, mas que tu insistes em fazer todos os anos.

[short pause]

Estes pratos não são neutros.

[pause]

São pontes.

[long pause]

Cada um deles é uma forma silenciosa de continuares uma relação com alguém que talvez já não esteja.

[pause]

Ou que está, mas com quem a relação se tornou complicada.

Ou que tu, há muito tempo, deixaste de saber como te aproximar — mas que ainda alimentas, em ti, através do prato.

[short pause]

A comida, neste caso, não é alimento.

É memória.

[long pause]

Quase todas as mulheres adultas têm pelo menos um destes pratos.

[pause]

E quase todas o comem sem reparar no que ele está, na verdade, a fazer.

[short pause]

A acordar, em ti, uma criança que ainda quer estar perto da mãe, da avó, da tia.

[pause]

A trazer-te de volta a uma cozinha que provavelmente já não existe.

A repor, durante quinze minutos, uma sensação de ser cuidada que tu, em adulta, raramente recebes.

[long pause]

Isto não é mau.

[pause]

A comida-memória é, em muitas culturas, das formas mais saudáveis de manter relação com quem nos foi importante.

[short pause]

O problema só aparece quando tu, sem saberes, comes este prato com mais frequência do que faz sentido.

[pause]

Quando reparas que te apetece o doce da avó num momento em que estás sozinha, triste, sem ninguém para conversar.

E quando, depois de o comer, ficas com a sensação difusa de que aquilo, afinal, não preencheu o que precisavas.

[long pause]

Esta semana, identifica o teu prato-ponte.

[pause]

O que é? De quem vem? Quando é que apetece?

[short pause]

Numa folha, escreve três coisas:

[pause]

Primeira — que prato é.

Segunda — a quem te liga.

Terceira — que fome real está a tentar resolver, para além da fome física.

[long pause]

A terceira é a mais difícil de escrever.

[pause]

Mas é a mais útil.

[short pause]

Porque revela, por exemplo, que o doce da avó aparece quando tens saudades de ter alguém que te trate como criança.

Que o assado de domingo aparece quando a casa está silenciosa demais.

Que a sopa de constipações aparece quando estás a precisar de ser cuidada e ninguém o está a fazer.

[long pause]

Quando tens esta informação, podes fazer duas coisas.

[pause]

A primeira: continuar a comer o prato. Mas agora com consciência do que ele faz por ti.

[short pause]

Comê-lo lentamente. Fazer dele uma pequena cerimónia. Lembrar quem o fazia.

[pause]

A segunda: começar a procurar formas alternativas de obter o que o prato está a tentar dar.

[long pause]

Se o prato é forma de teres saudades de uma avó morta, podes ler uma carta antiga dela.

Se o prato é forma de te sentires cuidada, podes ligar a alguém que ainda está vivo e que ainda te trata bem.

Se o prato é forma de teres companhia, podes convidar alguém para o partilhar.

[short pause]

A comida-memória, quando bem usada, é gesto de amor.

[pause]

Quando usada em automático, no escuro, sozinha — torna-se substituto da relação que ela queria comemorar.

[short pause]

E essa diferença, sabendo-a, podes começar a viver melhor.`,
      },
    ],
  },
  {
    id: "curso-a-fome-m5",
    titulo: "Curso A Fome — Módulo 5 (Aulas A, B, C)",
    descricao: "O Ciclo da Vergonha.",
    scripts: [
      {
        id: "a-fome-m5a",
        titulo: "M5.A — O remorso depois de comer",
        curso: "a-fome",
        texto: `Há um momento, depois de comeres mais do que tinhas planeado, em que aparece sempre a mesma coisa.

[pause]

Não é fome.

Não é cansaço.

É remorso.

[long pause]

Aparece nos primeiros vinte minutos depois da última garfada.

[pause]

Antes ainda da digestão começar a sério.

Antes de teres tempo para racionalizar.

[short pause]

É reacção automática que se instala em ti há tantos anos que tu já não a notas como reacção — pareces achar que é apenas como te sentes.

[long pause]

Mas é reacção. E foi treinada.

[pause]

Ninguém nasce a sentir remorso depois de comer.

Cada uma de nós aprendeu, em algum momento da infância ou da adolescência, que comer com prazer trazia consequência emocional negativa.

[short pause]

Talvez tenhas aprendido com uma frase à mesa.

Talvez tenhas aprendido a ver a tua mãe a recusar a sobremesa enquanto se queixava do peso.

Talvez tenhas aprendido a ver outras raparigas, a partir dos doze anos, a comentar entre elas o que tinham comido nesse dia.

[long pause]

A partir daí, comer deixou de ser apenas necessidade biológica.

[pause]

Passou a ser acto com peso moral.

[short pause]

E todas as vezes que tu, em adulta, comes mais do que o teu critério interno permite, esse critério aparece imediatamente a cobrar.

[long pause]

Repara no que o remorso faz em ti.

[pause]

Faz-te ficar em silêncio nos cinco minutos a seguir à refeição.

Faz-te abrir o telemóvel para te distraíres da sensação.

Faz-te começar a planear, mentalmente, o que vais fazer no dia seguinte para compensar.

[short pause]

E, sobretudo, faz-te ficar com uma sensação difusa de que falhaste.

[pause]

Falhaste o quê, exactamente, é difícil de nomear.

Mas a sensação está lá.

[long pause]

Esta semana, vais começar a separar duas coisas que estão coladas em ti.

[pause]

A refeição em si.

E a reacção emocional à refeição.

[short pause]

Numa folha, desenha duas colunas.

Em cima da primeira escreve: "O que comi de facto."

Em cima da segunda escreve: "O que senti depois."

[long pause]

E ao longo de uma semana, sempre que terminares uma refeição em que sentiste qualquer coisa para além de saciedade neutra, escreves nas duas colunas.

[pause]

Na primeira, factos: "Comi um prato de massa, salada, dois bocados de pão, uma sobremesa pequena."

Na segunda, sensação: "Senti culpa. Senti que tinha comido demais. Comecei a planear o jantar mais leve."

[short pause]

Sem comentário moral. Sem julgar a sensação.

Apenas registar.

[long pause]

Ao fim da semana, lê as duas colunas em paralelo.

[pause]

Vais reparar numa coisa importante.

[short pause]

A reacção emocional, na maior parte dos dias, não é proporcional ao que comeste.

[pause]

Há refeições normais que geraram remorso desproporcional.

Há refeições maiores que, por algum motivo, passaram sem culpa.

[long pause]

A partir destes dados, fica claro que o remorso não é informação sobre a refeição.

[pause]

É reacção independente, com vida própria, treinada em ti há décadas.

[short pause]

E o que tem vida própria pode, com tempo, ser observado em vez de obedecido.

[long pause]

Não pares de comer porque o remorso aparece.

Continua a comer conforme o teu corpo precisa.

[pause]

E deixa o remorso aparecer ao lado, como visita não convidada que tu já conheces de cor.

[short pause]

Com o tempo, a visita começa a ficar menos demorada.

E, em alguns dias, começa a não aparecer.`,
      },
      {
        id: "a-fome-m5b",
        titulo: "M5.B — A promessa de amanhã começo",
        curso: "a-fome",
        texto: `Há uma frase que tu já disseste mil vezes na tua vida.

[pause]

Provavelmente disseste-a esta semana.

Provavelmente vais voltar a dizê-la dentro de alguns dias.

[long pause]

Amanhã começo.

[pause]

Amanhã começo a comer melhor.

Amanhã começo a beber dois litros de água.

Amanhã começo a fazer exercício a sério.

[short pause]

Amanhã. Sempre amanhã.

[long pause]

Esta frase parece inocente.

[pause]

Parece motivação.

Parece compromisso.

[short pause]

Mas é, em quase todos os casos, uma das coisas mais sabotadoras que dizes a ti mesma.

[long pause]

Porque ela permite-te, hoje, comer o que te apetece sem estares presente nessa decisão.

[pause]

Comes em piloto automático, com a justificação implícita de que isto é a "última vez antes de começar".

E como tu já disseste isto cinquenta vezes nos últimos dois anos, sabes, no fundo, que o "amanhã começo" não é compromisso real.

[short pause]

É amortecedor.

[pause]

Permite-te continuar a comer no padrão antigo sem ter que sentir a contradição entre o que estás a comer e o que dizes que queres.

[long pause]

A frase "amanhã começo" tem uma função específica.

[pause]

Adia o trabalho real.

[short pause]

E o trabalho real não é o "começar".

É olhar honestamente para o que está a acontecer agora.

[long pause]

Esta semana, vais fazer um exercício que vai parecer estranho.

[pause]

Vais banir a frase "amanhã começo" do teu vocabulário interno durante sete dias.

[short pause]

Sempre que ela aparecer — e vai aparecer muitas vezes — substituis por outra frase.

[pause]

A frase é:

"Hoje estou a comer isto, e isto é o que estou a comer."

[long pause]

Sem promessa de futuro.

Sem amortecedor.

Sem desculpa.

[pause]

Apenas reconhecimento factual do que está, neste momento, a entrar em ti.

[short pause]

Esta frase parece banal.

[pause]

Mas tem efeito específico.

[long pause]

Quando tu não podes mais dizer "amanhã começo", tens duas opções.

[pause]

Ou começas, agora, a comer com mais atenção — porque já não tens o amortecedor para te justificares depois.

Ou continuas a comer como antes — mas agora, sem a promessa de futuro, tens de aceitar conscientemente que estás a fazer essa escolha.

[short pause]

Os dois caminhos são honestos.

O "amanhã começo" não.

[long pause]

Esta semana, escreve numa folha que ponhas em sítio visível — perto da cozinha, na agenda — esta frase:

"Hoje estou a comer isto. Isto é o que estou a comer."

[pause]

Cada vez que reparares no automatismo do "amanhã começo", olha para a folha.

[short pause]

E nota o que muda em ti.

[long pause]

Vais perceber, ao longo dos dias, uma coisa importante.

[pause]

A maior parte das tuas decisões alimentares não é consciente.

[short pause]

É feita por uma parte de ti que está sempre a apostar no futuro hipotético — na "tua vida quando começares" — para te permitir adiar a relação real com a comida no presente.

[long pause]

E quando tu retiras o amortecedor, a relação no presente fica visível.

[pause]

A primeira semana é desconfortável.

[short pause]

Mas a partir da segunda, acontece uma coisa nova.

Começas a comer com mais consciência sem teres tido de te disciplinar.

[pause]

Não porque te obrigaste a mudar.

Porque, sem o "amanhã começo", a parte de ti que estava em piloto automático finalmente percebe que tu estás a olhar.

[short pause]

E o olhar honesto, sozinho, muda mais do que qualquer dieta começada na segunda-feira.`,
      },
      {
        id: "a-fome-m5c",
        titulo: "M5.C — A semana de restrição que vira a noite de descontrolo",
        curso: "a-fome",
        texto: `Há um padrão que se repete em quase todas as mulheres que tentaram alguma vez controlar a alimentação.

[pause]

Começa na segunda-feira.

[long pause]

Começa com vontade. Com lista de coisas a comprar. Com refeições preparadas em frascos no frigorífico.

[pause]

Segunda corre bem. Terça também. Quarta, com algum esforço. Quinta, alguma irritabilidade.

[short pause]

Sexta — ou, no mais tardar, sábado à noite — algo cede.

[long pause]

Pode ser num jantar com amigas. Pode ser sozinha em casa depois de uma semana exaustiva. Pode ser numa visita à família.

[pause]

E o que cede não é um bocadinho.

É tudo.

[short pause]

Comes muito mais do que terias comido se tivesses comido normalmente toda a semana.

[long pause]

Na manhã seguinte, acordas com a sensação familiar.

[pause]

Vergonha. Frustração. Sensação de teres falhado outra vez.

E a decisão imediata: a partir de segunda-feira, vou começar a sério.

[short pause]

E o ciclo recomeça.

[long pause]

Este ciclo tem nome.

[pause]

Restrição-descontrolo.

[short pause]

Não é falta de força de vontade tua.

É como o teu sistema nervoso responde a privação.

[long pause]

Quando tu restringes — quando comes menos do que precisas durante dias seguidos — o teu corpo entra em modo de alarme.

[pause]

E o teu cérebro começa a libertar sinais cada vez mais fortes a dizer que precisa de comida.

[short pause]

Tu, durante a semana, consegues ignorar estes sinais por força de vontade.

[pause]

Mas a força de vontade é recurso finito.

E quando se esgota — em geral, à sexta à noite — os sinais ficam mais fortes do que tu.

[long pause]

E aquilo a que tu chamas "descontrolo" é, na verdade, o teu corpo a forçar a entrada de calorias que andou dias a pedir e não recebeu.

[pause]

Não é falha tua.

É biologia a ganhar à determinação.

[short pause]

E a biologia ganha sempre, ao longo do tempo.

[long pause]

A partir desta semana, vais fazer uma experiência incómoda mas reveladora.

[pause]

Vais escolher um dia da semana em que normalmente restringes.

E nesse dia, vais comer normalmente.

[short pause]

Não em excesso.

Normalmente.

[pause]

Três refeições. Um lanche se te apetecer. Pão se for o que te apetece. Sobremesa se for o caso.

[long pause]

Sem cálculo de calorias. Sem comparação com o que comeste ontem. Sem promessa de compensação amanhã.

[pause]

Apenas comer como pessoa que tem fome e responde à fome.

[short pause]

Vai ser estranho.

[pause]

A tua cabeça vai protestar.

Vai aparecer ansiedade — "se eu comer assim todos os dias, vou engordar".

[long pause]

À noite, antes de dormir, escreve numa folha o que aconteceu nesse dia.

[pause]

Como te sentiste.

Se houve momento em que apareceu a vontade de comer descontroladamente.

Se houve momento em que reparaste que estavas saciada e simplesmente paraste.

[short pause]

Repete a experiência durante quatro ou cinco semanas, num dia diferente cada semana.

[long pause]

A maior parte das mulheres que faz isto descobre uma coisa que parece inacreditável no primeiro mês.

[pause]

Quando tu comes normalmente — sem restrição — durante a semana, o ciclo de descontrolo de fim-de-semana começa a desaparecer.

[short pause]

Não porque tu te disciplinaste.

Porque o teu corpo deixou de estar em alarme.

[pause]

E quando o corpo não está em alarme, ele come o que precisa, pára quando está cheio, e segue em frente.

[long pause]

A "perda de controlo" não é a tua tendência natural.

[pause]

É a resposta inevitável a períodos de restrição.

[short pause]

Tira a restrição. E a maior parte do "descontrolo" desaparece sozinho, sem que tu tenhas de o controlar.`,
      },
    ],
  },
  {
    id: "curso-a-fome-m6",
    titulo: "Curso A Fome — Módulo 6 (Aulas A, B, C)",
    descricao: "As Dietas que Tentaste.",
    scripts: [
      {
        id: "a-fome-m6a",
        titulo: "M6.A — A primeira dieta de que te lembras",
        curso: "a-fome",
        texto: `Tenta lembrar-te da primeira dieta da tua vida.

[pause]

Não a primeira séria.

A primeira de todas. A inicial.

[long pause]

Para muitas mulheres, foi por volta dos doze, treze anos.

[pause]

Talvez foi a tua mãe a sugerir, com cuidado, que talvez fosse altura de "começares a ter atenção".

Talvez foi o pediatra a mencionar, num contexto banal, que a curva de peso estava "um pouco acima".

Talvez foi tu sozinha, depois de uma comparação com uma colega, a decidir parar de comer pão ao lanche.

[short pause]

Foi pequena. Quase inocente.

[long pause]

Mas foi a porta de entrada.

[pause]

Porque, a partir desse momento, tu começaste a viver com uma camada nova entre ti e a comida.

[short pause]

Antes desse momento, comias o que te apetecia, parando quando estavas cheia, sem pensar.

[pause]

Depois desse momento, começou a haver cálculo.

Cálculo silencioso, em segundo plano, todas as vezes que abrias um pacote, escolhias um prato, pegavas numa fatia de pão.

[long pause]

Esta camada de cálculo nunca mais foi embora.

[pause]

Pode ter mudado de forma — uma dieta diferente, um regime novo, um nutricionista actual — mas a camada permaneceu.

[short pause]

E é por isso que a relação com a comida, em quase todas as mulheres adultas, tem uma qualidade específica.

[pause]

Vigilância.

[long pause]

Vigilância silenciosa, contínua, instalada há tantos anos que tu já a confundes com responsabilidade.

[pause]

Mas não é responsabilidade.

É hábito mental que se instalou em ti antes de teres tido voz para o recusar.

[short pause]

E que continua a operar agora, em ti adulta, sem que tu tenhas alguma vez decidido conscientemente continuar com ele.

[long pause]

Esta semana, faz uma coisa de arqueologia pessoal.

[pause]

Numa folha, escreve em cima:

"Linha do tempo das minhas dietas — desde a primeira."

[short pause]

E vai escrevendo, em ordem cronológica, todas as tentativas de controlar a alimentação que tu te lembras.

[pause]

A primeira: a idade. Quem sugeriu. O que era.

A segunda. A terceira. E por aí fora.

[long pause]

Algumas vão estar muito presentes na tua memória.

Outras vais ter dificuldade em distinguir umas das outras.

[pause]

Tudo bem. Escreve o que vier.

[short pause]

Quando acabares, conta quantas há.

[long pause]

A maior parte das mulheres, quando faz este exercício pela primeira vez, fica em choque.

[pause]

Não é uma. Não são duas. São quinze. Vinte. Trinta tentativas em vinte ou trinta anos.

[short pause]

Ao lado de cada uma, escreve uma única palavra: "resultado."

E completa.

[pause]

Quase todas vão acabar com a mesma coisa.

[long pause]

Algumas semanas de perda. Alguns meses. Volta gradual ao peso anterior. Por vezes, um peso ligeiramente acima do que tinhas antes de começar.

[pause]

Quando tu vês isto desenhado em letra escrita, alguma coisa muda.

[short pause]

A tua relação com as dietas deixa de parecer caminho para a solução.

[pause]

Passa a parecer ciclo repetido que, em duas ou três décadas, não te deu o que prometia.

[long pause]

Esta informação é dura.

[pause]

Mas é a primeira honesta que tu olhas há muito tempo.

[short pause]

E a partir daqui, podes começar a desenhar uma relação com a comida que não dependa de mais uma dieta.

[pause]

Não porque te tornaste mais disciplinada.

Porque, finalmente, viste em letra escrita que esse caminho não te leva lá.`,
      },
      {
        id: "a-fome-m6b",
        titulo: "M6.B — O que cada dieta te ensinou contra ti",
        curso: "a-fome",
        texto: `Cada dieta que tu fizeste deixou em ti uma frase.

[pause]

A frase ficou. Mesmo quando a dieta acabou.

[long pause]

A dieta dos hidratos ensinou-te que o pão é inimigo.

A dieta detox ensinou-te que o teu corpo precisa de ser limpo, como se estivesse sujo.

A dieta low-carb ensinou-te que comer fruta é problema.

A dieta de jejum intermitente ensinou-te que comer ao pequeno-almoço é fraqueza.

[short pause]

Cada uma destas frases parece neutra. Apenas regra alimentar.

[pause]

Mas todas elas têm uma coisa em comum.

[short pause]

Estão a treinar-te, em silêncio, a desconfiar do teu corpo.

[long pause]

Nenhuma dieta começa por dizer:

"O teu corpo sabe o que precisa. Aprende a escutá-lo."

[pause]

Todas começam por dizer:

"O teu corpo, sozinho, vai escolher mal. Por isso, segue as minhas regras."

[short pause]

E todas as vezes que tu segues uma destas regras, estás a reforçar a ideia de que tu, sozinha, não consegues comer bem.

[long pause]

Esta ideia é a maior consequência de décadas de dietas.

[pause]

Não os quilos perdidos e recuperados.

A perda de confiança no teu próprio corpo.

[short pause]

Em pessoas que nunca fizeram dieta, observas, em geral, que comem com naturalidade.

[pause]

Comem o que lhes apetece, na quantidade que precisam, e param quando estão cheias.

Sem cálculo. Sem culpa. Sem preocupação no dia seguinte.

[short pause]

Tu, ao contrário, vives com a sensação permanente de que a tua relação com a comida é problema a gerir.

[long pause]

Não nasceste assim.

[pause]

Foste treinada a pensar assim por cada dieta que fizeste.

[short pause]

E a partida dolorosa é que mesmo quando tu paras de fazer dietas, a desconfiança no corpo permanece.

[pause]

Continuas a achar que comer maçã ao final do dia é demais.

Continuas a achar que pão à noite é descontrolo.

Continuas a achar que se não calculares, vais comer demais.

[long pause]

Esta semana, vais fazer um exercício pequeno.

[pause]

Numa folha, escreve em cima:

"Frases que aprendi com dietas e que ainda dirigem a minha relação com a comida."

[short pause]

E lista cinco a dez frases.

[pause]

Pode ser:

"Comer depois das oito engorda."

"Hidratos à noite acumulam."

"Fruta tem demasiado açúcar."

"Não devo comer entre refeições."

"Se sinto fome às onze da manhã, é porque comi mal ao pequeno-almoço."

[long pause]

Olha para a tua lista.

[pause]

Cada uma destas frases foi-te dada por uma dieta, um livro, uma revista, uma médica.

[short pause]

Nenhuma delas foi descoberta pelo teu corpo.

[pause]

E, sem que tu tenhas dado por isso, todas elas se instalaram em ti como verdades pessoais.

[long pause]

Ao lado de cada frase, escreve a fonte.

[pause]

Quem ta disse?

A dieta de quê? O livro de qual?

[short pause]

Quando tu vês a fonte, a frase deixa de parecer saber teu.

Passa a parecer ideia comprada.

[pause]

E o que é comprado pode, com tempo, ser devolvido.

[long pause]

Esta semana, escolhe uma única frase da lista — a que mais frequentemente te dirige — e fica atenta a ela.

[pause]

Quando ela aparecer na tua cabeça, repara.

E faz uma pergunta:

"Esta frase, quando aparece, está a responder ao meu corpo? Ou está a responder a uma regra antiga?"

[short pause]

Em quase todos os casos, vais perceber que está a responder à regra.

[pause]

E o teu corpo, sozinho, queria outra coisa.

[long pause]

Esta atenção, sozinha, não muda imediatamente como comes.

[pause]

Mas começa a abrir, lentamente, espaço para o teu corpo voltar a ter voz na decisão.

[short pause]

E quando o corpo recupera voz, a relação com a comida começa a recuperar a sanidade que tinha antes da primeira dieta.`,
      },
      {
        id: "a-fome-m6c",
        titulo: "M6.C — A indústria que vive da tua insatisfação",
        curso: "a-fome",
        texto: `Há uma verdade incómoda sobre a indústria das dietas.

[pause]

Se as dietas funcionassem, a indústria não existiria.

[long pause]

Pensa nisto por um momento.

[pause]

Se uma dieta — qualquer uma — efectivamente resolvesse a relação de uma mulher com o corpo e com a comida, ela faria essa dieta uma vez na vida e nunca mais precisaria.

[short pause]

A indústria perderia clientes em massa.

[pause]

Mas a indústria continua a crescer todos os anos.

[long pause]

Cresce porque depende de uma coisa específica.

[pause]

Da tua insatisfação contínua com o teu corpo.

[short pause]

Quanto mais insatisfeita tu estás, mais produtos compras.

Mais regimes experimentas.

Mais consultas marcas.

Mais aplicações descarregas.

[long pause]

Esta é a estrutura económica que está por detrás da maior parte da informação que tu recebes sobre alimentação.

[pause]

Não é informação neutra.

É informação concebida para te manter num ciclo de tentar, falhar, voltar a tentar.

[short pause]

Se tu encontrasses paz com o teu corpo, a indústria perdia uma cliente.

[pause]

E a indústria sabe disto melhor do que tu.

[long pause]

Por isso, cada novo método aparece com promessas ligeiramente diferentes do anterior.

[pause]

Para tu poderes recomeçar, com esperança nova, o ciclo que já fizeste vinte vezes.

[short pause]

Não estou a dizer que toda a informação sobre alimentação é falsa.

[pause]

Há saber médico real e útil. Há nutricionistas honestos. Há mudanças que efectivamente fazem diferença em saúde.

[short pause]

Mas a maior parte do que chega a uma mulher adulta sobre o seu corpo — através de revistas, redes sociais, publicidade, livros de auto-ajuda alimentar — é informação concebida para a manter dependente.

[long pause]

Esta semana, vais fazer um inventário.

[pause]

Numa folha, escreve em cima:

"Dinheiro que gastei em dietas, suplementos, programas, consultas, aplicações, livros sobre alimentação."

[short pause]

E começa a fazer estimativa, década a década.

[pause]

Dos vinte aos trinta. Dos trinta aos quarenta. Dos quarenta para cá.

[long pause]

Algumas mulheres, quando fazem este exercício pela primeira vez, ficam em silêncio diante do número.

[pause]

Pode chegar a milhares de euros.

Em alguns casos, dezenas de milhares.

[short pause]

E, ao lado do número, podes escrever um segundo dado:

"Resultado durável dessa despesa."

[pause]

Quase sempre vai ser zero.

Ou negativo — porque alguns regimes deixaram danos metabólicos ou alimentares.

[long pause]

Esta tomada de consciência não é para te culpar.

[pause]

A culpa é mais um produto da indústria.

Querem que sintas culpa por não conseguires manter os resultados — e que voltes a comprar.

[short pause]

A tomada de consciência é diferente.

[pause]

É veres, em letra escrita, que tu não és cliente fácil de uma indústria.

És cliente capturada por uma indústria que te ensinou, durante décadas, a comprar soluções para um problema que só se desfaz com trabalho de atenção, sem produto.

[long pause]

E dentro, neste caso, não é frase espiritual.

[pause]

É exactamente o trabalho que estás a fazer agora.

Escutar o corpo. Identificar as frases instaladas. Distinguir fome real de outras coisas. Comer sem cálculo.

[short pause]

Este trabalho não tem produto à venda.

Não tem aplicação. Não tem livro novo todos os meses. Não tem programa de seis semanas com garantia de resultado.

[pause]

Tens só tu, contigo, ao longo dos anos.

[long pause]

E é por isso que a indústria nunca fala sobre este caminho.

[pause]

Porque, neste caminho, ninguém ganha dinheiro com o teu corpo.

Excepto tu — em saúde, em paz, em tempo recuperado para a tua vida real.`,
      },
    ],
  },
  {
    id: "curso-a-fome-m7",
    titulo: "Curso A Fome — Módulo 7 (Aulas A, B, C)",
    descricao: "Comer com Outros.",
    scripts: [
      {
        id: "a-fome-m7a",
        titulo: "M7.A — A mesa de família onde aprendeste",
        curso: "a-fome",
        texto: `Antes de teres opinião própria sobre comida, viste como se comia em tua casa.

[pause]

E o que viste ficou.

[long pause]

Quem servia primeiro.

Quem comia mais.

Quem deixava sempre alguma coisa no prato e quem limpava como se fosse a última refeição.

Quem fazia comentários sobre o que os outros estavam a comer.

Quem se levantava com pressa antes de acabar.

[short pause]

Tu não decoraste estas regras.

[pause]

Absorveste.

[short pause]

Da mesma forma que aprendeste a língua materna sem aulas formais.

[long pause]

A mesa de família é a primeira escola alimentar que existe na tua vida.

[pause]

E é a mais influente — porque acontece todos os dias, durante anos, antes de qualquer outra ideia entrar em ti.

[short pause]

Por isso, em adulta, há gestos que tu fazes à mesa sem perceber porquê.

[pause]

Comer depressa, mesmo quando tens tempo.

Servir os outros antes de te servires.

Pôr menos no prato do que comerias se ninguém estivesse a olhar.

Recusar a sobremesa em sociedade e comê-la depois, sozinha, no frigorífico.

[long pause]

Estes gestos não são teus.

[pause]

São da tua mesa de origem.

[short pause]

E continuam a operar em ti, em adulta, em mesas completamente diferentes — em jantares de trabalho, em encontros, em casa de pessoas que nem conheces.

[long pause]

Esta semana, vais fazer um exercício de memória.

[pause]

Numa folha, escreve em cima:

"A mesa onde aprendi a comer."

[short pause]

E desenha, em palavras, essa mesa.

[pause]

Quem se sentava onde.

Quem servia.

Quem mandava em silêncio na refeição.

Quem comentava o prato dos outros.

Quem comia com prazer e quem comia com vergonha.

[long pause]

Não tens de ser exaustiva. Escreve o que vier — sete a dez observações chegam.

[pause]

Quando acabares, lê.

[short pause]

E faz uma única pergunta a seguir, e escreve a resposta noutra folha:

"Quais destas coisas eu ainda faço hoje, mesmo sem reparar?"

[long pause]

Provavelmente vais reparar em três ou quatro coisas.

[pause]

Coisas pequenas. Mas que se repetem em todas as mesas em que te sentas há trinta anos.

[short pause]

Comes sempre depressa, mesmo quando ninguém te vai cobrar a tigela.

Pões-te sempre a servir os outros, mesmo quando não és anfitriã.

Reduzes sempre a porção quando há uma mulher mais magra à mesa.

Calas a fome real para evitar comentário antigo que já ninguém faria.

[long pause]

Este reconhecimento, sozinho, não muda o gesto imediatamente.

[pause]

Mas começa, devagar, a tirar-lhe a invisibilidade.

[short pause]

E o que é visível pode, com tempo, ser escolhido em vez de obedecido.

[long pause]

Não tens de mudar tudo da tua mesa de origem.

[pause]

Há coisas que aprendeste lá que são boas — partilhar, conversar a comer, cuidar de quem se senta contigo.

Essas, mantém.

[short pause]

Mas as outras — as que te tiraram a fome legítima sem te perguntar — essas, com o tempo, podes começar a deixar para trás.

[pause]

E a tua mesa, em adulta, pode finalmente passar a parecer mais tua e menos da mesa onde aprendeste.`,
      },
      {
        id: "a-fome-m7b",
        titulo: "M7.B — O jantar com amigas onde escolhes em função delas",
        curso: "a-fome",
        texto: `Quando jantas com amigas, raramente escolhes o que te apetece.

[pause]

Escolhes em função do que elas estão a escolher.

[long pause]

Repara na coreografia.

[pause]

A primeira amiga abre o menu e diz "vou pedir só uma salada, não tenho muita fome."

A segunda olha para ti e para a terceira: "também vou só pelo leve."

E tu, que entraste no restaurante com vontade de pedir massa com queijo, fechas o menu e dizes "também acho que vou pela salada."

[short pause]

Não foi escolha.

Foi adaptação.

[long pause]

Esta adaptação acontece em quase todas as mulheres adultas, em quase todos os contextos sociais.

[pause]

E acontece tão automaticamente que tu nem reparas que a fizeste.

[short pause]

Só dás conta, mais tarde, quando chegas a casa e abres o frigorífico.

[pause]

Comes a sério aquilo que querias ter pedido no restaurante.

Sozinha. Em pé. Sem o copo de vinho. Sem a conversa.

[long pause]

A pergunta é honesta.

[pause]

Porque é que, num jantar com amigas, tu não consegues pedir o que te apetece?

[short pause]

A resposta tem várias camadas.

[long pause]

Primeira camada: medo do julgamento silencioso das outras mulheres.

[pause]

Se tu pedes o prato pesado e elas pedem salada, tu, mesmo sem ninguém comentar, sentes que ficaste exposta.

[short pause]

Ficaste como a "que não tem auto-controlo".

A "que come sem cuidado".

A "que provavelmente é por isso que está com peso a mais".

[long pause]

Estes julgamentos podem nem existir nas cabeças delas.

Mas existem na tua cabeça, projectados nelas.

[pause]

E isso chega para te fazer mudar a escolha.

[long pause]

Segunda camada: solidariedade reflexa.

[pause]

Se elas estão a "ter cuidado", tu, ao pedires um prato pesado, sentes que estás a quebrar a aliança feminina implícita.

[short pause]

A aliança implícita é: "todas nós somos mulheres em vigilância sobre o nosso corpo, todas estamos juntas neste esforço."

[pause]

Pedir o prato pesado é traição silenciosa a esta aliança.

[long pause]

Esta aliança é, em si, uma das coisas mais danosas entre mulheres adultas.

[pause]

Porque transforma um momento que devia ser de prazer partilhado em momento de vigilância partilhada.

[short pause]

E a vigilância partilhada não alimenta amizades. Esgota-as.

[long pause]

Esta semana, vais fazer um exercício pequeno mas corajoso.

[pause]

Da próxima vez que jantares com amigas, antes de chegares ao restaurante, decide o que te apetece comer.

[short pause]

Decide na rua, no carro, antes de ver o menu.

[pause]

E quando chegares e abrires o menu, pede o que decidiste.

Independentemente do que as outras estão a pedir.

[long pause]

Vai ser desconfortável.

[pause]

Vais sentir, durante alguns minutos, que ficaste exposta.

[short pause]

Mas há uma coisa que vai acontecer que não esperas.

[pause]

Frequentemente, uma das outras mulheres à mesa, ao ver-te pedir o que querias, vai mudar a escolha dela e pedir o que ela queria mesmo.

[long pause]

Porque tu deste, sem palavras, permissão.

[pause]

A aliança da vigilância só se mantém enquanto todas concordarem.

[short pause]

Basta uma quebrar para as outras poderem, devagar, começar a quebrar também.

[long pause]

Este gesto pequeno — pedir o que te apetece num jantar com amigas — é gesto político maior do que parece.

[pause]

Porque liberta tu e, em consequência, liberta as outras.

[short pause]

E à noite, em casa, não vais precisar de abrir o frigorífico para comeres em segredo o que devias ter pedido à mesa.`,
      },
      {
        id: "a-fome-m7c",
        titulo: "M7.C — O encontro romântico onde finges não ter fome",
        curso: "a-fome",
        texto: `Há uma situação muito específica em que quase todas as mulheres adultas comem mal.

[pause]

O encontro romântico inicial.

[long pause]

Sobretudo se for jantar.

Sobretudo se for com homem que te interessa.

Sobretudo se for nas primeiras três ou quatro saídas.

[pause]

Repara no padrão.

[short pause]

Pedes algo leve.

Não acabas o prato.

Recusas a sobremesa, mesmo quando ele a pede e te oferece.

Bebes com moderação para "controlar" a forma como te apresentas.

[long pause]

Tudo isto, em conjunto, é uma performance.

[pause]

A performance de mulher pequena.

[short pause]

Mulher que come pouco. Mulher que ocupa pouco espaço. Mulher que não tem necessidades incómodas.

[long pause]

Esta performance não é tua decisão consciente.

[pause]

É roteiro cultural antigo, instalado em ti em adolescente, que te diz que para seres desejável tens de parecer pouco exigente.

[short pause]

E pouco exigente, na cabeça do roteiro, começa pela mesa.

[long pause]

Porque uma mulher que tem fome real, que pede uma segunda dose, que limpa o prato, que pede sobremesa e a come com prazer — é mulher que mostra apetite.

[pause]

E o roteiro antigo diz: mulher com apetite é mulher difícil.

[short pause]

Mulher difícil afasta o homem.

[pause]

Por isso, sem te perguntar se concordas, o teu corpo aprende a esconder o apetite na presença masculina inicial.

[long pause]

A consequência desta performance é dupla.

[pause]

A primeira: chegas a casa com fome real e comes sozinha, no escuro, o que devias ter comido à mesa.

[short pause]

A segunda, mais grave: estás a estabelecer, desde o início da relação, um precedente.

[pause]

O precedente de mulher que esconde necessidades.

[long pause]

Se a relação avançar, esse precedente vai pesar.

[pause]

A mulher que escondeu fome no encontro inicial vai esconder cansaço no terceiro mês.

Vai esconder vontade de não fazer sexo na sexta-feira em que está esgotada.

Vai esconder o que pensa sobre a família dele que não gosta dela.

[short pause]

A mulher pequena, instalada à mesa do primeiro encontro, instala-se também em todas as áreas da relação.

[long pause]

Esta semana — ou no próximo encontro romântico que tiveres, mesmo que demore semanas — vais fazer uma coisa diferente.

[pause]

Vais comer o que te apetece comer.

[short pause]

Sem performance. Sem cálculo. Sem roteiro.

[pause]

Vais pedir o prato que te apetece. Vais comer a porção que precisas para ficar saciada. Vais aceitar a sobremesa, se te apetecer. Vais beber o copo de vinho extra, se for o caso.

[long pause]

E vais ver o que acontece.

[pause]

Há duas hipóteses.

[short pause]

Primeira hipótese: ele acolhe. Acha graça. Aprecia mulher que come com prazer. Sente-se mais à vontade na presença de pessoa real do que na presença de pessoa em performance.

[pause]

Segunda hipótese: ele recua subtilmente. Faz comentário sobre quanto comeste. Volta a sair com mulher mais "discreta" na próxima vez.

[long pause]

A segunda hipótese não é falha tua.

[pause]

É informação preciosa sobre o tipo de homem com quem estavas a sair.

[short pause]

Se ele recua porque tu comeste o que querias num jantar, ele ia recuar mais tarde por motivos piores.

[pause]

Por teres opinião. Por teres limites. Por teres dia mau.

[long pause]

A performance de mulher pequena à mesa filtra para fora os homens que não te queriam de qualquer forma — mas só percebes isso ao quinto mês.

[pause]

Comer como tu comes desde o primeiro encontro filtra-os logo. Em uma noite.

[short pause]

E poupa-te tempo, energia, e relação que ia acabar mal de qualquer forma.

[long pause]

Não comes como tu comes para o impressionar.

[pause]

Comes para descobrires, com o mínimo de tempo perdido, se ele consegue jantar com a mulher que tu és.

[short pause]

Esta é, na verdade, uma das ferramentas mais simples e mais eficazes que tens para escolheres bem com quem ficar.`,
      },
    ],
  },
  {
    id: "curso-a-fome-m8",
    titulo: "Curso A Fome — Módulo 8 (Aulas A, B, C)",
    descricao: "A Fome em Paz.",
    scripts: [
      {
        id: "a-fome-m8a",
        titulo: "M8.A — A primeira refeição em que comeste sem calcular",
        curso: "a-fome",
        texto: `Houve, em algum momento, uma primeira refeição em que tu comeste sem calcular.

[pause]

Talvez tenhas sido pequena.

Talvez tenhas sido tão pequena que não te lembras.

[long pause]

Mas houve.

[pause]

Houve uma fase, na tua infância, em que tu comias o que te apetecia, parando quando estavas cheia, sem conta nenhuma a fazer.

[short pause]

Comias bolacha ao lanche sem te perguntares se podias.

Comias massa ao jantar sem hesitar entre primeiro ou segundo prato.

Pedias mais sumo sem te sentires culpada.

[pause]

E nem sequer te lembravas, no dia seguinte, do que tinhas comido na véspera.

Porque comer não era tema. Era apenas coisa que se fazia.

[long pause]

Esta fase, em ti, existiu mesmo.

[pause]

Não é fantasia.

Não é idealização.

[short pause]

Existiu até alguém — uma mãe, uma avó, um médico, uma colega de escola — entrar na tua relação com a comida e instalar a primeira camada de cálculo.

[long pause]

A partir daí, comer deixou de ser apenas comer.

[pause]

Passou a ser acto carregado de regras, expectativas, julgamentos.

[short pause]

E essa camada nunca mais foi totalmente embora.

[long pause]

A maioria das mulheres adultas tem, sobre a comida, um trabalho mental contínuo.

[pause]

Pensam no que comeram. Pensam no que vão comer. Pensam no que outros estão a comer. Pensam na balança. Pensam no espelho. Pensam na próxima dieta.

[short pause]

Este trabalho mental, somado, é equivalente a um segundo emprego não pago que ocupa horas por dia, todos os dias, durante décadas.

[long pause]

E é por isso que muitas mulheres, ao final do dia, estão exaustas sem razão aparente.

[pause]

A razão está aparente. É só silenciosa.

[short pause]

Tu passaste o dia a fazer cálculo alimentar de fundo, mesmo enquanto fazias todas as outras coisas.

[long pause]

A reconciliação com a fome não significa esquecer todo este aprendizado.

[pause]

Significa, com o tempo, devolver-lhe o lugar que a comida tinha quando tu eras criança.

[short pause]

Necessidade humana básica. Coisa que se faz quando se tem fome. Coisa que se pára quando se está cheia. Coisa que se esquece logo a seguir.

[long pause]

Esta semana, vais experimentar uma única refeição como criança.

[pause]

Escolhe um almoço ou um jantar. Quando puderes estar sozinha, sem pressa.

[short pause]

E faz uma única regra: vais comer sem qualquer cálculo.

[pause]

Não vais pensar em calorias. Não vais pensar em proteínas. Não vais pensar no jantar. Não vais pensar no peso.

[long pause]

Vais escolher o que te apetece.

Vais comer a porção que te apetece.

Vais parar quando estiveres cheia.

E vais levantar-te da mesa sem registo mental do que comeste.

[short pause]

Vai ser estranho.

[pause]

Provavelmente, vais conseguir manter o silêncio mental durante apenas dez minutos da refeição.

Depois disso, a cabeça vai voltar a tentar calcular alguma coisa.

[short pause]

Tudo bem. Não te exijas perfeição.

[pause]

Volta ao silêncio. Continua a comer. Pára quando estiveres cheia.

[long pause]

Numa folha, à noite, escreve apenas uma frase:

"Hoje tive uma refeição sem cálculo. Senti —"

[pause]

E completa com a sensação que ficou.

[short pause]

A maioria das mulheres, da primeira vez que faz isto, escreve uma palavra.

[pause]

Liberdade.

[long pause]

Não liberdade abstracta.

[pause]

Liberdade pequena, concreta, quase esquecida — a de comer um almoço como qualquer pessoa que não foi treinada a calcular.

[short pause]

Repete uma vez por semana, durante alguns meses.

[pause]

E lentamente, sem te aperceberes, esta forma de comer começa a contaminar outras refeições da tua semana.

[long pause]

Não todas. Não imediatamente.

[pause]

Mas o suficiente para tu, ao fim de meses, perceberes que estás a comer com mais paz do que comias há anos.

[short pause]

Não porque encontraste a dieta certa.

Porque, finalmente, lembraste-te do que era comer sem dieta nenhuma.`,
      },
      {
        id: "a-fome-m8b",
        titulo: "M8.B — O dia em que não te pesaste",
        curso: "a-fome",
        texto: `Há um pequeno ritual matinal que organiza, em silêncio, o resto do teu dia.

[pause]

Tu pesas-te.

[long pause]

Talvez todos os dias.

Talvez algumas vezes por semana.

Talvez só ao fim-de-semana.

[pause]

Mas pesas-te com regularidade.

E o número que aparece na balança organiza, sem tu reparares, o tom interior das próximas horas.

[short pause]

Se o número desceu, sentes ligeireza. Estás de bom humor. Permites-te a chávena de café com leite. Falas com o teu marido com mais paciência.

[pause]

Se o número subiu, sentes peso emocional muito superior aos cem gramas físicos.

Ficas em silêncio. Decides reduzir o pequeno-almoço. Estás mais irritável durante a manhã.

[long pause]

A balança, em ti, não é instrumento neutro de medida.

[pause]

É juíza.

[short pause]

E juíza com poder desproporcional sobre como tu vais habitar o teu próprio dia.

[long pause]

Repara que tu, neste momento, estás a entregar o teu humor matinal a um pedaço de plástico no chão da casa de banho.

[pause]

Um pedaço de plástico que não sabe como é que tu dormiste.

Que não sabe se a tua filha esteve doente toda a noite.

Que não sabe se estás na fase do ciclo em que reténs líquidos.

Que não sabe se ontem comeste sal a mais.

Que não sabe nada, na verdade, sobre a tua vida.

[short pause]

E, ainda assim, é a primeira coisa que tu consultas de manhã.

[long pause]

Esta semana, vais fazer uma experiência.

[pause]

Vais tirar a balança da casa de banho.

[short pause]

Não tens de a deitar fora. Não tens de a partir.

[pause]

Pega na balança e leva-a para outro lado. Pode ser um arrumo, um sótão, a despensa, a garagem, a casa de uma amiga.

[short pause]

Algum lugar onde não a vejas todas as manhãs.

[long pause]

E durante sete dias, não te peses.

[pause]

A primeira manhã vai ser estranha.

[short pause]

A tua mão vai procurar instintivamente a balança. Vais sentir um vazio pequeno. Vais sentir que falta uma informação.

[pause]

Vai aparecer ansiedade — "como é que sei se estou bem se não me peso?"

[long pause]

Continua. Não desistas no segundo dia.

[pause]

Ao fim de quatro ou cinco dias, vai acontecer uma coisa que não esperas.

[short pause]

Vais começar a perceber, sem o número, como o teu corpo se sente.

[pause]

Vais reparar se estás com energia ou sem energia.

Vais reparar se a barriga está confortável ou apertada.

Vais reparar se as roupas estão como costumam ou diferentes.

[long pause]

Toda esta informação estava sempre lá.

[pause]

Mas estava abafada por uma única medida que a substituía.

[short pause]

Quando tiras o número, o corpo recupera voz.

[long pause]

Ao fim da semana, antes de pores a balança de volta — se decidires que queres pô-la de volta — escreve numa folha:

"Sem balança, esta semana, o meu corpo —"

[pause]

E completa.

[short pause]

A maior parte das mulheres descobre, ao fim de uma semana, que a balança não estava a dar-lhes informação.

Estava a dar-lhes ansiedade.

[pause]

E que sem ela, conseguem perceber muito melhor como o seu corpo está realmente.

[long pause]

Algumas mulheres, depois deste exercício, decidem voltar a pesar-se mas com menos frequência.

Outras decidem deixar a balança fora da casa de banho permanentemente.

[pause]

Não há resposta certa. Há a resposta tua, depois de finalmente teres tido uma semana para ver o que sentes sem ela.

[short pause]

A balança não é o teu corpo.

É um instrumento.

[long pause]

E quando tu deixas de tratar o instrumento como autoridade sobre como te sentes, recuperas autoridade tu — sobre a tua relação com a tua própria carne.`,
      },
      {
        id: "a-fome-m8c",
        titulo: "M8.C — A relação possível com a fome",
        curso: "a-fome",
        texto: `Este curso acaba.

[pause]

E tu continuas nele.

[long pause]

Não vais sair daqui curada da relação com a comida.

[pause]

Vais sair com instrumentos que não tinhas há oito módulos.

[short pause]

E os instrumentos, ao contrário das curas prometidas, ficam.

[long pause]

Antes de fechar, vamos fazer um inventário do que tu, agora, sabes fazer.

[pause]

Pega numa folha. Escreve em cima:

"Antes deste curso, eu não sabia —"

[long pause]

E vai escrevendo, devagar, à medida que reconheces.

[pause]

Não sabia que comer escondida, em segredo no frigorífico, era forma de gerir vergonha pública à mesa.

Não sabia que a fome que aparece ao fim da tarde podia não ser fome — mas cansaço, tristeza, ou pedido de companhia.

Não tinha mapa das frases sobre comida que herdei da minha mãe e da minha avó.

Não tinha visto, em letra escrita, quantas dietas fiz na vida e qual foi o resultado real.

Não tinha percebido que a "perda de controlo" de fim-de-semana era resposta inevitável à restrição da semana.

Não tinha reparado que, em jantares com amigas e em encontros românticos, comia em função delas e dele, quase nunca em função de mim.

Não tinha experimentado, em adulta, uma única refeição sem cálculo.

[short pause]

Vai escrevendo o que for verdadeiro para ti.

Algumas linhas. Não muitas. As que importam.

[long pause]

Quando acabares, lê em voz baixa, para ti.

[pause]

E repara numa coisa.

[short pause]

Cada linha desta lista é um instrumento.

[pause]

Não é frase motivacional. Não é resolução de Ano Novo. É hábito novo, pequeno, instalado em ti depois de oito módulos de trabalho silencioso.

[long pause]

A mulher em paz com a fome não é versão idealizada que aparece daqui a dois anos.

[pause]

É a soma dos pequenos hábitos que tu, ao longo dos meses, vais continuando a praticar depois deste curso terminar.

[short pause]

É a mulher que continua a perguntar-se, antes de comer, se é fome ou outra coisa.

A mulher que continua a notar quem está à mesa antes de escolher a porção.

A mulher que continua a olhar para a balança como instrumento, e não como juíza.

[long pause]

Esta mulher não chega.

Constrói-se em cada gesto pequeno repetido.

[pause]

E tu, neste momento, és exactamente isso — uma mulher a meio dessa construção.

[short pause]

Não no fim.

A meio.

[long pause]

A relação possível com a fome não é a ausência de fome.

[pause]

Não é a ausência de prazer pela comida.

Não é a perda de peso permanente.

Não é a indiferença ao corpo.

[short pause]

É outra coisa.

[long pause]

É chegar a um ponto em que a comida volta a ser comida.

[pause]

Coisa que se prepara, se come com gosto, se partilha quando há gente boa por perto.

E que se esquece a seguir, porque há outras coisas mais interessantes para fazer com a vida.

[short pause]

Este é o objectivo.

[pause]

Não a magreza. Não a perfeição alimentar. Não a iluminação corporal.

A devolução da comida ao seu lugar — necessidade humana entre muitas outras, deixada de ser tema central da tua existência diária.

[long pause]

E a partir daí, o resto da tua vida — o trabalho, as relações, a criação, o descanso, o prazer — recupera o espaço que a comida lhe estava a roubar.

[pause]

Este espaço é, em última análise, o que este curso te dá.

[short pause]

Não menos quilos.

Mais vida.

[pause]

E o que vier a seguir não é transformação prometida.

É o que tu, com estes instrumentos na mão, fizeres todos os dias quando ninguém estiver a ver.`,
      },
    ],
  },
  {
    id: "curso-a-chama-m1",
    titulo: "Curso A Chama — Módulo 1 (Aulas A, B, C)",
    descricao: "A Chama que Apagou.",
    scripts: [
      {
        id: "a-chama-m1a",
        titulo: "M1.A — A noite em que percebeste que já não tinhas vontade",
        curso: "a-chama",
        texto: `Houve uma noite — talvez recente, talvez há anos — em que tu percebeste, sem aviso, que já não tinhas vontade.

[pause]

Não foi conclusão dramática.

Não foi crise.

[long pause]

Foi mais subtil do que isso.

[pause]

Foi um momento em que estavas, talvez na cama, e o teu marido — ou o teu companheiro, ou alguém que te interessava — fez aquele gesto que antes te acendia.

[short pause]

E desta vez, nada se acendeu.

[pause]

Pior — apareceu, em segundo plano, uma sensação de cansaço.

[long pause]

Naquela noite, provavelmente, fingiste alguma coisa.

[pause]

Ou disseste que estavas com sono.

Ou inventaste uma razão pequena.

[short pause]

E adormeceste com uma sensação difusa de que algo importante se tinha desligado em ti.

[pause]

Sem ninguém te ter pedido permissão.

[long pause]

Esta noite — esta noite específica — é uma noite que quase todas as mulheres adultas reconhecem.

[pause]

Algumas situam-na nos trinta e poucos.

Algumas nos quarenta.

Algumas, mais cedo do que esperariam, nos vinte e nove.

[short pause]

Mas todas, em algum ponto, têm essa noite.

[long pause]

A partir dela, alguma coisa muda silenciosamente.

[pause]

A iniciativa começa a vir só dele, ou de outros.

A frequência diminui sem se falar.

E tu, em vez de te perguntares o que se passou, começas a contornar.

[short pause]

Contornar o tema. Contornar a cama, em alguns dias. Contornar o teu próprio corpo nessa zona inteira.

[long pause]

A ausência de desejo torna-se, lentamente, hábito.

[pause]

E o hábito, em poucos meses, parece identidade.

[short pause]

Começas a explicar-te a ti mesma com frases como:

"Eu já não sou pessoa muito sexual."

"Já não tenho idade para isto."

"Está fase de vida — é normal."

[long pause]

Estas frases, quando as dizes em silêncio, dão alguma paz.

[pause]

Porque transformam falta numa característica.

Em vez de te perguntares o que perdeste, decides que era assim que deveria ser.

[short pause]

Mas não era.

[long pause]

A tua chama não se apagou por idade. Não se apagou por fase. Não se apagou por ser mulher adulta.

[pause]

Apagou-se por razões específicas, identificáveis, na maior parte dos casos reversíveis.

[short pause]

Cansaço acumulado de cuidar de toda a gente.

Relação que se foi tornando logística antes de ser intimidade.

Vergonha herdada que nunca foi nomeada.

Corpo que, ao longo dos anos, foi sendo tratado mais como objecto de gestão e menos como casa onde se vive.

[long pause]

Cada uma destas razões é tema deste curso.

[pause]

Cada uma, vista, pode começar a ser desfeita.

[short pause]

Esta semana, vais fazer apenas uma coisa.

[pause]

Numa folha, escreve em cima:

"A noite em que percebi que já não tinha vontade."

[long pause]

E escreve, em três ou quatro frases, o que te lembras dessa noite.

[pause]

Quando foi, aproximadamente. Onde estavas. Com quem. O que aconteceu — ou não aconteceu.

[short pause]

E o que sentiste depois.

[pause]

Não tens de elaborar. Não tens de psicanalisar. Não tens de chorar.

[long pause]

Apenas registar, em letra escrita, que essa noite existiu.

[pause]

Porque, na maior parte das mulheres, essa noite nunca foi nomeada para fora.

[short pause]

Vive como segredo silencioso, há anos, sem que ninguém saiba — incluindo, frequentemente, tu própria.

[long pause]

Quando a escreves, ela passa de segredo para informação.

[pause]

E a informação, ao contrário do segredo, pode começar a ser trabalhada.`,
      },
      {
        id: "a-chama-m1b",
        titulo: "M1.B — Quando o corpo deixou de pedir",
        curso: "a-chama",
        texto: `O teu corpo, em criança e adolescente, pedia.

[pause]

Pedia coisas. Comida. Movimento. Toque. Atenção. Descanso.

E pedia em alto. Sem filtro. Sem cálculo.

[long pause]

Em algum momento da tua vida adulta, o teu corpo deixou de pedir.

[pause]

Não pediu mais comida quando tinhas fome — porque aprendeste a controlar.

Não pediu mais descanso quando estavas exausta — porque havia coisas a fazer.

Não pediu toque quando tinhas falta — porque ninguém te tinha ensinado que isso era um pedido legítimo.

E, em algum momento subtil, deixou de pedir desejo.

[short pause]

Deixou de pedir porque, ao longo dos anos, aprendeu que pedir não levava a nada.

[long pause]

O corpo é uma criatura inteligente.

[pause]

Quando faz pedidos durante anos e não recebe resposta, pára de fazer.

Não por desistência.

Por economia de energia.

[short pause]

E quando o corpo pára de pedir, a tua experiência subjectiva do corpo muda.

[pause]

Deixas de notar que tens fome até estares com tonturas.

Deixas de notar que estás cansada até caíres com gripe.

Deixas de notar que tens vontade de toque até teres uma crise relacional.

E deixas de notar que tens desejo — porque o desejo, sem provocação externa, deixa simplesmente de aparecer.

[long pause]

Isto é diferente de não ter desejo.

[pause]

Isto é o desejo a estar lá, em ti, mas a não ter via de saída para a tua consciência.

[short pause]

A diferença parece subtil. Mas é gigante.

[long pause]

Mulheres que fizeram trabalho terapêutico ou corporal de longa duração descobrem, com frequência, que o desejo nunca tinha desaparecido.

[pause]

Tinha apenas deixado de chegar à superfície.

E ao reaparecer — devagar, em pequenas ondas — provoca surpresa.

[short pause]

"Achei que isto já não me acontecia."

[long pause]

A primeira parte do trabalho não é fazer aparecer desejo.

[pause]

É começar a notar os sinais pequenos que o teu corpo ainda dá — e que tu, há muito tempo, não estás a ouvir.

[short pause]

Estes sinais são subtis.

[pause]

Uma vontade momentânea de te tocares quando vais ao banho.

Um momento de atracção pequena por uma pessoa na rua.

Uma sensação de calor passageira ao ler uma cena num livro.

Um sonho em que reapareceu uma sensação que já não tinhas há meses.

[long pause]

Em mulheres com desejo "apagado", estes sinais ainda aparecem.

[pause]

Mas são tão pequenos, tão breves, que tu os descartas antes de os reconheceres.

Acontecem em dois segundos. Não são dramáticos. Não interrompem o teu dia.

[short pause]

E tu, sem reparar, não os contas.

[long pause]

Esta semana, vais começar a contar.

[pause]

Numa folha, escreve em cima:

"Sinais pequenos do meu desejo, esta semana."

[short pause]

E ao longo de sete dias, sempre que reparares num desses sinais — por mais minúsculo que seja — escreves uma linha.

[pause]

Não tens de ser literata.

[short pause]

Pode ser:

"Quarta-feira de manhã, debaixo do chuveiro, senti vontade súbita de me tocar. Não fiz, tinha de sair. Mas registei."

"Sexta à tarde, na padaria, reparei nos antebraços do homem que servia. Senti calor pequeno. Saí."

"Sábado à noite, ao ler um livro, uma cena fez-me parar. Reli duas vezes."

[long pause]

Não interpretes os sinais.

Não ajas sobre eles.

Apenas regista.

[pause]

Ao fim da semana, lê a tua lista.

[short pause]

A maior parte das mulheres que faz isto, pela primeira vez, descobre uma coisa.

[pause]

Os sinais existem em maior número do que pareciam.

[long pause]

O desejo não está apagado.

[pause]

Está apenas a operar abaixo do nível em que tu o costumavas reconhecer.

[short pause]

E reconhecê-lo — em letra escrita, à tua frente — é o primeiro acto de o reanimar.`,
      },
      {
        id: "a-chama-m1c",
        titulo: "M1.C — O dia em que paraste de notar o teu próprio desejo",
        curso: "a-chama",
        texto: `Houve um dia em que tu paraste de notar o teu próprio desejo.

[pause]

Provavelmente não te lembras desse dia.

Os dias importantes raramente vêm com aviso.

[long pause]

Foi, provavelmente, um dia banal.

[pause]

Estavas a fazer várias coisas. A trabalhar. A cuidar de alguém. A organizar uma casa. A resolver um problema que outra pessoa não te quis resolver.

[short pause]

E nesse dia, o teu desejo apareceu por momentos — uma onda pequena, banal, normal.

E tu, sem pensar, descartaste.

[pause]

"Agora não."

"Depois."

"Não é altura."

[long pause]

Esse "depois" nunca chegou.

[pause]

E o teu desejo, sem feedback, foi aprendendo que não era prioridade.

[short pause]

Não que fosse mau.

Apenas que vinha sempre depois das outras coisas.

[pause]

E como as outras coisas nunca acabavam, ele nunca chegava à frente da fila.

[long pause]

Esta hierarquia silenciosa instala-se em quase todas as mulheres adultas.

[pause]

O desejo dos outros vem primeiro.

A produtividade vem primeiro.

A casa vem primeiro.

O cuidado dos filhos vem primeiro.

O cansaço dos colegas vem primeiro.

O teu desejo, em algum lugar da lista, vem por último.

[short pause]

Ou, mais frequentemente, não vem na lista.

[long pause]

Esta posição não é por culpa tua.

[pause]

Foi-te ensinada.

[short pause]

A mulher boa, na cultura em que tu cresceste, é a que cuida dos outros antes de cuidar de si.

A mulher boa não interrompe o que está a fazer pelos outros para se ouvir a si.

A mulher boa adia o seu prazer indefinidamente em nome de um futuro hipotético em que finalmente vai ter tempo.

[pause]

Mas o futuro hipotético nunca chega.

[short pause]

E o desejo, sem expressão, atrofia.

[long pause]

Atrofia da mesma forma que um músculo que não é usado.

Não desaparece — está lá, biologicamente.

Mas fica fraco. Lento. Difícil de activar.

[pause]

E quando, em algum momento, tu decides que queres voltar a desejar, o músculo não responde imediatamente.

[short pause]

Precisa de tempo.

De treino.

De atenção repetida.

[long pause]

Esta semana, vais começar uma prática pequena.

[pause]

Uma única vez por dia, durante sete dias, vais fazer uma coisa.

[short pause]

Pára o que estiveres a fazer.

Por trinta segundos.

Em qualquer ponto do dia que escolheres.

[pause]

E pergunta — não em voz alta, em silêncio — uma única coisa.

[long pause]

"Neste momento, o que o meu corpo gostaria?"

[pause]

Não o que devia.

Não o que era razoável.

Não o que tu vais fazer.

Apenas o que ele gostaria.

[short pause]

A primeira vez, vai aparecer "nada".

[pause]

Não acredites no "nada" imediatamente.

[short pause]

Espera mais cinco segundos.

[long pause]

Em geral, depois desses cinco segundos, aparece alguma coisa pequena.

[pause]

"Gostaria de me deitar dois minutos."

"Gostaria de comer aquele bocado de chocolate que está na gaveta."

"Gostaria de dizer não a esta reunião."

"Gostaria de te tocar a mim mesma esta noite."

[short pause]

Algumas destas vontades vais ignorar.

Algumas vais cumprir.

[pause]

Mas, à noite, antes de dormir, escreve numa folha:

"Hoje, ao perguntar ao corpo, ele respondeu —"

E completa com a frase, ou com algumas frases.

[long pause]

Sete dias. Sete entradas.

[pause]

Ao fim da semana, lê.

[short pause]

E vais ver, em letra escrita, uma coisa que te vai surpreender.

[pause]

O teu corpo tem opinião sobre tudo.

A toda a hora.

Em todas as pequenas situações do dia.

[long pause]

E nunca tinhas perguntado.

[pause]

Há décadas.

[short pause]

A reanimação do desejo começa, na maior parte dos casos, não na cama.

Começa em pequenas perguntas a ti, ao longo do dia, sobre o que o teu corpo gostaria.

[pause]

E na decisão, lentamente repetida, de começar a contar com a resposta — em vez de a continuar a descartar.`,
      },
    ],
  },
  {
    id: "curso-a-chama-m2",
    titulo: "Curso A Chama — Módulo 2 (Aulas A, B, C)",
    descricao: "O Que te Disseram Sobre o Desejo.",
    scripts: [
      {
        id: "a-chama-m2a",
        titulo: "M2.A — A primeira frase que ouviste sobre desejo",
        curso: "a-chama",
        texto: `Tenta lembrar-te da primeira frase que ouviste sobre desejo, sobre sexo, sobre o teu próprio corpo nessa zona.

[pause]

Não a primeira aula de educação sexual.

A primeira frase casual, dita em casa, num jantar de família, num pátio de escola.

[long pause]

Provavelmente foi cedo.

[pause]

Provavelmente foi entre os oito e os doze anos.

[short pause]

E, em quase todos os casos, foi uma frase com peso negativo.

[long pause]

Talvez tenha sido a tua mãe a baixar a voz quando tu entraste numa conversa entre mulheres.

[pause]

Talvez tenha sido um adulto a comentar uma cena de televisão com palavras como "isto não se vê" ou "isto é vergonha".

Talvez tenha sido uma frase entre raparigas no recreio sobre uma colega que se desenvolveu cedo.

Talvez tenha sido um padre, um professor, uma vizinha, a fazer alusão a "raparigas que se respeitam" e "raparigas que não se respeitam".

[short pause]

A frase específica era diferente em cada casa.

A função era a mesma.

[pause]

Instalar em ti, antes de teres puberdade sequer, uma associação:

[short pause]

Desejo, em mulher, é tema que se trata em silêncio. Em vergonha. Com cuidado para não chamar a atenção.

[long pause]

Esta primeira frase entrou em ti como verdade incontestável.

[pause]

Tu não tinhas, aos dez anos, ferramentas para a contestar.

[short pause]

E ela ficou. A operar em silêncio.

[pause]

Em adulta, quando reparas que sentes desejo e imediatamente te julgas, é essa frase a operar.

Quando te tocas a ti mesma e sentes culpa que não tem causa lógica, é essa frase.

Quando hesitas em pedir o que te apetece à pessoa com quem estás, é essa frase.

[long pause]

A frase tem trinta, quarenta anos.

[pause]

E continua a dirigir, em ti adulta, a relação com o teu próprio prazer.

[short pause]

Sem nunca ter sido revista.

[long pause]

Esta semana, vais fazer uma escavação pessoal.

[pause]

Numa folha, escreve em cima:

"Frases que ouvi em criança e adolescente sobre sexo, desejo, e corpo de mulher."

[short pause]

E vai escrevendo, à medida que te lembras.

[pause]

Não tens de lembrar tudo.

Escreve cinco a oito frases.

[long pause]

Pode ser:

"Mulher que se dá com facilidade não vale nada."

"Aquela rapariga é fresca."

"Não andes assim na rua que os homens olham."

"Mulheres não falam dessas coisas."

"Casa-te primeiro, esse assunto resolve-se depois."

"Isso é coisa que se faz, não se diz."

"Olha como estás vestida, queres que pensem o quê?"

[short pause]

Ao lado de cada frase, escreve dois dados:

[pause]

Quem disse — pelo menos a quem é que aquela frase soa, na tua cabeça.

E que idade tu tinhas, aproximadamente, quando a ouviste pela primeira vez.

[long pause]

Quando acabares, lê.

[pause]

E faz uma pergunta a seguir, escrita noutra folha:

"Quais destas frases ainda dirigem, hoje, a minha relação com o meu próprio prazer?"

[short pause]

Vais reconhecer pelo menos duas ou três.

[pause]

São as que aparecem em ti, sem aviso, em momentos específicos.

[long pause]

Quando estás na cama com alguém e, em vez de te entregares, ficas em segundo plano a calcular como pareces.

Quando te tocas a ti mesma e, em vez de prazer, aparece uma vergonha pequena que te faz parar antes de tempo.

Quando uma vontade aparece em ti durante o dia e, sem pensar, a calas.

[short pause]

Em cada um desses momentos, há uma frase antiga a operar.

[pause]

E enquanto a frase operar invisivelmente, vai continuar a dirigir.

[short pause]

Quando passa a operar visivelmente — em letra escrita, atribuída a uma idade e a uma voz — começa a perder força.

[long pause]

Não desaparece imediatamente.

[pause]

Mas começas a poder dizer, em silêncio, na tua cabeça:

"Esta frase não é minha. Foi-me dada. E eu, em adulta, não tenho de continuar a obedecer a uma frase que aprendi aos dez anos."

[short pause]

Esta única consciência, repetida, é uma das ferramentas mais profundas para começares a recuperar o desejo que essa frase te ajudou a calar.`,
      },
      {
        id: "a-chama-m2b",
        titulo: "M2.B — A diferença entre o que aprendeste e o que sentes",
        curso: "a-chama",
        texto: `Há uma distância entre o que tu aprendeste sobre desejo e o que tu, no teu corpo, realmente sentes.

[pause]

Esta distância, na maior parte das mulheres adultas, é enorme.

[long pause]

E a maior parte das mulheres não se apercebe dela.

[pause]

Porque vive, há décadas, no campo do que aprendeu — confundindo-o com o que sente.

[short pause]

Se tu aprendeste que mulher boa não tem fantasias, vais achar, em adulta, que as tuas fantasias raras devem ser problema teu.

Se tu aprendeste que sexo serve para dar prazer ao homem, vais achar que o teu prazer é secundário — mesmo quando o teu corpo te diz que precisa de algo diferente.

Se tu aprendeste que orgasmo na mulher é difícil, complicado, requer paciência do parceiro, vais aceitar passivamente situações em que ele não acontece, em vez de te perguntares o que faltou.

[pause]

Cada uma destas crenças aprendidas substituiu o teu sentir.

[long pause]

E o sentir, em ti, foi ficando enterrado.

[pause]

Não morto. Enterrado.

[short pause]

À espera do dia em que tu, finalmente, perguntes ao corpo — e não à educação que recebeste — o que ele quer mesmo.

[long pause]

Esta semana, vais fazer um exercício que separa estas duas coisas.

[pause]

Numa folha, faz duas colunas.

[short pause]

Em cima da primeira escreve: "O que aprendi que devia querer."

Em cima da segunda escreve: "O que o meu corpo, se for honesta, pede."

[pause]

Na primeira coluna, escreve cinco a sete frases.

[long pause]

Pode ser:

"Sexo deve acontecer pelo menos uma vez por semana."

"Mulher boa quer fazer sexo com o seu marido."

"Posições novas demonstram criatividade."

"Tem de haver penetração."

"Tem de haver orgasmo."

"Devo querer mais do que quero."

[short pause]

Agora a segunda coluna.

[pause]

E aqui pede honestidade que pode ser desconfortável.

[short pause]

O que é que o teu corpo, se ninguém estivesse a julgar, pede mesmo?

[long pause]

Pode ser:

"Quero ser tocada de uma forma específica que nunca pedi."

"Quero ter uma noite por semana sem ninguém me tocar de todo, só para descansar."

"Quero sexo menos vezes do que tenho — mas com mais presença."

"Quero ser olhada, antes de ser tocada."

"Quero ser eu a ter iniciativa, mas tenho medo de parecer ridícula."

"Quero, às vezes, sexo intenso e rápido. Outras vezes, lento e quase preguiçoso."

"Quero conversar primeiro. Sem pressa para chegar à cama."

[short pause]

Estas duas colunas, lado a lado, geralmente não coincidem.

[pause]

Há sobreposição, mas há mais discrepância do que sobreposição.

[long pause]

Quando tu vês isto desenhado em letra escrita, alguma coisa muda.

[pause]

A distância entre o aprendido e o sentido, que era invisível, fica visível.

[short pause]

E a partir do momento em que está visível, podes começar a escolher.

[pause]

Não tens de mudar tudo de uma vez.

Não tens de comunicar tudo ao teu parceiro amanhã.

[long pause]

Mas podes, internamente, começar a dar mais peso à segunda coluna do que à primeira.

[pause]

E em pequenos momentos, podes começar a agir conforme a segunda coluna, em vez da primeira.

[short pause]

Recusar uma noite porque o teu corpo pede descanso, em vez de obedecer ao calendário implícito da relação.

Pedir, pela primeira vez, uma forma de toque específica que nunca tinhas verbalizado.

Iniciar, num dia em que te apetece, sem esperar que ele inicie primeiro.

[long pause]

Cada vez que escolhes a segunda coluna em detrimento da primeira, estás a fazer uma coisa específica.

[pause]

Estás a devolver autoridade ao teu corpo sobre o teu desejo.

[short pause]

E o desejo, com tempo, recupera vivacidade quando deixa de ser dirigido por crenças aprendidas e passa a ser dirigido por sinais corporais reais.`,
      },
      {
        id: "a-chama-m2c",
        titulo: "M2.C — A liberdade que nunca te disseram que tinhas",
        curso: "a-chama",
        texto: `Há uma liberdade que tu, provavelmente, nunca soubeste que tinhas.

[pause]

A liberdade de não querer.

[long pause]

Em quase toda a literatura, em quase todos os filmes, em quase todos os manuais sobre sexualidade feminina, o trabalho proposto é o mesmo.

[pause]

Como ter mais desejo.

Como reanimar o desejo.

Como manter o desejo na relação longa.

[short pause]

A pressuposição sempre é: o desejo é coisa boa, tu deves querer mais, e se queres menos do que devias, há algo a corrigir.

[long pause]

Esta pressuposição é, em si, prisão.

[pause]

Porque te coloca, mais uma vez, numa posição onde o teu corpo está sempre em défice em relação a um padrão exterior.

[short pause]

Antigamente, o défice era ter desejo demais — mulher boa tinha pouco.

Hoje, o défice é ter desejo de menos — mulher moderna deve ser sexual, livre, activa.

[pause]

Os padrões inverteram-se.

A posição da mulher — sempre em défice — manteve-se.

[long pause]

A liberdade real, neste tema, não é ter mais desejo.

[pause]

É ter o desejo que tens. Sem comparação.

[short pause]

Pode ser muito.

Pode ser pouco.

Pode oscilar ao longo do mês, do ano, da década.

[pause]

Pode estar dormente durante uma fase de criação intensa, de cuidado de criança pequena, de luto.

Pode estar especialmente vivo numa fase de viagem, de novidade, de mudança.

[long pause]

Tudo isto é normal.

[pause]

Tudo isto é parte da vida real de uma mulher real.

[short pause]

E a tentativa de te encaixares num padrão constante de desejo — alto e disponível — é, em si, fonte de muito do mal-estar que tu sentes em relação a esta zona da tua vida.

[long pause]

Esta semana, vais fazer um exercício de libertação.

[pause]

Numa folha, escreve em cima:

"Permissão escrita."

[short pause]

E escreve, a seguir, em letra grande:

"Eu, esta semana, dou-me permissão para não querer."

[pause]

E continua:

"Permissão para ter dias em que o meu corpo não pede.

Permissão para recusar sexo sem ter de explicar.

Permissão para não fingir entusiasmo.

Permissão para descobrir que, em algumas semanas, o que o meu corpo pede é descanso, e não actividade."

[long pause]

Assina a folha.

Põe a data.

[pause]

Pode parecer ridículo. Pode parecer infantil. Pode parecer demasiado simbólico.

[short pause]

Não é.

[pause]

A maior parte das mulheres adultas nunca, na vida inteira, deu a si mesma esta permissão por escrito.

[long pause]

Vivem com pressão silenciosa para querer.

E essa pressão é, paradoxalmente, uma das coisas que mais mata o desejo real.

[pause]

Porque o desejo, em mulher, tem uma característica específica.

[short pause]

Não responde bem a obrigação.

[pause]

Floresce em ausência de pressão.

E murcha, quase imediatamente, em presença dela.

[long pause]

Quando tu te dás permissão escrita para não querer, retiras a pressão.

[pause]

E o paradoxo é o seguinte.

[short pause]

Sem pressão, o desejo, em geral, começa a aparecer outra vez.

[pause]

Não imediatamente. Não dramaticamente. Não sempre.

[short pause]

Mas começa a aparecer.

[long pause]

Porque, sem ter de cumprir um padrão exterior, ele finalmente tem espaço para se manifestar conforme a tua biologia real, a tua fase de vida real, o teu cansaço real, e os teus interesses reais.

[pause]

E é nesse desejo — vivo porque livre — que a chama se acende.

[short pause]

Não no desejo prescrito.

No desejo permitido.`,
      },
    ],
  },
  {
    id: "curso-a-chama-m3",
    titulo: "Curso A Chama — Módulo 3 (Aulas A, B, C)",
    descricao: "O Corpo que Esqueceu.",
    scripts: [
      {
        id: "a-chama-m3a",
        titulo: "M3.A — As partes do teu corpo que tu não tocas há anos",
        curso: "a-chama",
        texto: `Faz uma conta honesta.

[pause]

Há quanto tempo tu não tocas, com prazer e sem pressa, na pele atrás dos joelhos?

[long pause]

Há quanto tempo não passas devagar a mão pelo lado interior do braço?

[pause]

Há quanto tempo não te olhas, demoradamente, no espelho do quarto, sem objectivo de avaliar?

[short pause]

Há quanto tempo não pões a mão no centro do peito e a deixas lá ficar, simplesmente?

[long pause]

Para muitas mulheres adultas, a resposta a estas perguntas é "não sei. Anos."

[pause]

E não é por falta de tempo.

É por hábito.

[short pause]

O teu corpo, em adulta, é território onde tu praticamente só tocas com função.

[pause]

Tocas para te lavares.

Tocas para te vestires.

Tocas para verificar uma dor.

[short pause]

Tocas para te depilares, para te avaliares, para corrigires.

[pause]

Mas não tocas só para tocar.

[long pause]

E tocar só para tocar é coisa que tu, antes dos doze ou treze anos, fazias com naturalidade.

[pause]

Crianças tocam-se a si próprias o tempo todo. Pés. Cabelo. Pescoço. Nariz. Em silêncio. Sem objectivo.

[short pause]

Em algum momento, tu paraste.

[pause]

Aprendeste que tocar-se em público era inadequado.

E, ao longo dos anos, generalizaste para tocar-se em privado também.

[long pause]

Sem te aperceberes, deixaste de ter relação táctil com larga parte do teu próprio corpo.

[pause]

Há regiões inteiras de pele que tu, em adulta, só tocas para verificar problemas.

[short pause]

A barriga só quando dói. A face só para passar creme. As coxas só para depilar. A nuca só para arranjar o cabelo.

[long pause]

Esta perda táctil tem uma consequência subtil mas profunda.

[pause]

A tua pele, sem toque sem função, deixa de comunicar com a tua consciência.

[short pause]

Há receptores nervosos por todo o teu corpo que estão lá, biologicamente activos, mas que há anos não recebem estímulo de exploração não-utilitária.

[pause]

E sem estímulo, a tua sensibilidade nessas zonas reduz.

Não fisicamente — biologicamente continuam a funcionar.

[short pause]

Mas a tua consciência aprende a não as registar.

[long pause]

Esta semana, vais fazer um exercício de cartografia tua.

[pause]

Numa folha, desenha um corpo simples. Pode ser figurinho de palitos. Não importa.

[short pause]

E pinta, ou marca, as zonas em que tu, na última semana, tocaste.

[pause]

Mas não basta marcar. Distingue:

Vermelho — zonas que tocaste só com função.

Verde — zonas que tocaste com algum prazer ou atenção sem função.

[long pause]

Faz isto à noite, ao fim de cada dia, durante uma semana.

[pause]

A maioria das mulheres, quando vê o desenho ao fim da semana, fica em silêncio.

[short pause]

A figura está quase toda vermelha.

E o verde, quando aparece, está concentrado em duas ou três zonas — em geral, mãos e cara.

[long pause]

Há zonas inteiras do corpo que tu não tocaste de forma não-utilitária durante uma semana inteira.

[pause]

Provavelmente, durante muitas semanas inteiras.

[short pause]

Provavelmente, durante anos.

[long pause]

A partir desta semana, vais começar a expandir a área verde do teu desenho.

[pause]

Não em prática complicada.

[short pause]

Quando estiveres a ver televisão à noite, passa a mão casualmente pelo braço enquanto vês.

Quando estiveres a tomar banho, em vez de te lavares com pressa, não saltes zonas — passa a mão por toda a pele, em vez de só nas zonas utilitárias.

Quando vestires uma camisola, repara na textura do tecido em contacto com o abdómen, em vez de a pores em automático.

[pause]

Sem objectivo sexual.

Sem prescrição de tempo.

[short pause]

Apenas reabertura de contacto casual com a tua própria pele.

[long pause]

Repete a cartografia ao fim de duas semanas.

[pause]

Vais ver a área verde a aumentar.

[short pause]

E à medida que aumenta, vais reparar numa coisa que não esperas.

[pause]

A tua relação geral com o teu corpo começa a mudar.

[long pause]

Sentes-te ligeiramente mais habitada.

Ligeiramente mais presente.

Ligeiramente menos em fuga da pele que carregas.

[pause]

Esta mudança é pequena.

Mas é base.

[short pause]

Sem toque sem função, o desejo não tem onde acordar.

Com toque sem função, há terreno para ele voltar a aparecer.`,
      },
      {
        id: "a-chama-m3b",
        titulo: "M3.B — Os sítios onde aprendeste a não sentir",
        curso: "a-chama",
        texto: `Há sítios no teu corpo onde tu aprendeste, ao longo dos anos, a não sentir.

[pause]

Não por dano físico.

Por treino emocional.

[long pause]

A maior parte das mulheres tem, no corpo, um ou dois ou três sítios assim.

[pause]

Sítios onde, em algum momento da vida, alguma coisa aconteceu que ficou difícil de processar.

[short pause]

E o teu sistema nervoso, sem te perguntar, decidiu reduzir a sensação naquele lugar.

[pause]

Para te proteger.

[long pause]

Pode ser uma zona da nuca onde alguém, há muitos anos, te magoou e tu nunca conseguiste ficar à vontade com toque ali.

Pode ser a parte interior das coxas, em mulheres que tiveram experiências sexuais difíceis.

Pode ser a barriga, em mulheres que cresceram com vergonha do volume.

Pode ser o peito, em mulheres que foram comentadas demais cedo demais.

Pode ser o pescoço inteiro, em mulheres que aprenderam que esse era o sítio onde se ficava em desvantagem.

[short pause]

Cada zona tem uma história específica.

[pause]

E em cada uma dessas zonas, a tua consciência aprendeu, por defesa, a não estar.

[long pause]

Esta ausência, no longo prazo, tem custo.

[pause]

Porque essas zonas, quando alguém te toca nelas — mesmo um parceiro com quem te sentes segura — não respondem.

[short pause]

Ou respondem com tensão.

Ou respondem com dissociação subtil — de repente estás a pensar noutra coisa qualquer, sem perceberes que saíste mentalmente.

[pause]

E o desejo, nessas zonas, fica enrolado em medo antigo que ninguém sabe que está lá.

[long pause]

Esta semana, vais fazer um trabalho lento. Sem pressa. Sem dramatismo.

[pause]

Numa folha, escreve em cima:

"Sítios do meu corpo onde sinto menos do que devia."

[short pause]

E lista, com calma, o que reconheces.

[pause]

Não tens de saber porquê.

Não tens de explicar.

[short pause]

Apenas: "Nuca." "Lado direito da barriga." "Coxas, parte de cima." "Peito, sobretudo o esquerdo."

[long pause]

Quando tens a lista, lê.

[pause]

E ao lado de cada zona, escreve uma única coisa:

"O que me lembro que aconteceu nesta zona, ou a esta zona, em algum momento da vida."

[short pause]

Pode ser muito vago.

Pode ser específico.

[pause]

Pode ser: "Não me lembro de nada concreto, mas sei que esta zona está sempre tensa."

Pode ser: "Lembro-me de uma situação aos quinze anos."

Pode ser: "Esta zona ficou diferente depois do nascimento da minha filha."

[long pause]

Não estás a fazer terapia.

Não estás a tentar resolver nada hoje.

[pause]

Estás apenas a registar que essas zonas existem, têm história, e merecem ser, em algum momento, reconhecidas.

[short pause]

A partir deste reconhecimento escrito, abrem-se duas vias concretas.

[pause]

A primeira — para zonas com história mais simples, sem ligação a trauma agudo.

A segunda — para zonas onde a história é mais pesada.

[long pause]

Para as primeiras, o trabalho pode acontecer ao longo das semanas através de comunicação escrita.

[pause]

Numa folha separada, escreve uma carta curta à zona identificada.

[short pause]

Não em linguagem mística.

[pause]

Em linguagem directa:

"Zona da nuca, reconheço que te ignorei durante anos por causa do que aconteceu em x. Sei que estás aí. Vou passar a reparar em ti."

[long pause]

Três, cinco frases. Não mais.

[pause]

Ao longo das semanas, quando essa zona aparecer em situação concreta — alguém te toca ali, tu reparas na tensão, uma roupa fica mal em cima dela — regista numa linha o que aconteceu.

[short pause]

Vais construir, em letra escrita, um histórico da relação com essa zona.

[pause]

E o histórico, acumulado, faz o que a prática silenciosa não consegue fazer sozinha: traz a zona para dentro do campo da linguagem.

[long pause]

Para as zonas de história mais pesada — sobretudo se estão ligadas a experiências sexuais difíceis, violência, ou trauma corporal específico — este curso não substitui acompanhamento profissional.

[pause]

Se uma das zonas que escreveste está nesta categoria, o gesto desta semana é outro.

[short pause]

Numa folha, escreve o nome de um profissional em quem tens confiança — terapeuta, psicóloga, médica de família — a quem podes, em algum ponto, falar sobre isto.

[pause]

Se não tens, escreve como primeiro passo "procurar recomendações com amigas em quem confio".

[long pause]

O corpo que guarda trauma específico precisa de ser acompanhado, não apenas observado.

[pause]

E reconhecer isto — em letra escrita, com nome — é, em si, acto de cuidado com a própria história.

[short pause]

Algumas zonas do teu corpo vão reabrir devagar, por registo escrito e comunicação com pessoas próximas.

[pause]

Outras vão reabrir em outro contexto, mais protegido, com ajuda qualificada.

[long pause]

A tarefa desta semana não é reabrir tudo.

[pause]

É mapear, em letra tua, onde estão as zonas — e escolher, para cada uma, a via adequada à história que ela carrega.`,
      },
      {
        id: "a-chama-m3c",
        titulo: "M3.C — A pele que precisava de toque sem função",
        curso: "a-chama",
        texto: `A tua pele tem uma necessidade que raramente é nomeada em adulta.

[pause]

Toque sem função.

[long pause]

Toque que não serve para nada.

[pause]

Que não está a lavar. Que não está a curar. Que não está a preparar para algo.

Que não está, sequer, a iniciar sexo.

[short pause]

Apenas toque que existe pelo prazer de tocar.

[long pause]

Em criança, recebias muito deste toque.

[pause]

Adultos pegavam-te ao colo. Davam-te beijos sem motivo. Despenteavam-te o cabelo enquanto te falavam de outra coisa. Faziam-te festas no braço enquanto viam televisão.

[short pause]

Este toque ocupava uma parte significativa do teu dia.

[pause]

E o teu sistema nervoso, em desenvolvimento, organizava-se em torno desta presença táctil constante.

[long pause]

Em adulta, o toque sem função reduziu-se drasticamente.

[pause]

Os adultos não se tocam casualmente como as crianças.

E mesmo nas relações próximas — casais, amizades, família — o toque sem função tornou-se raro.

[short pause]

Há toque com função sexual. Há toque com função de saudação. Há toque com função de consolo num momento difícil.

[pause]

Mas o toque casual, prolongado, sem destino — que era a base da tua infância — quase não existe.

[long pause]

Esta privação táctil tem nome.

[pause]

Em estudos sobre adultos isolados, o termo é skin hunger — fome de pele.

[short pause]

E muitas mulheres que vivem em relações longas têm, paradoxalmente, fome de pele.

[pause]

Porque o toque que recebem dos seus parceiros é predominantemente sexualizado — caminha sempre, em poucos minutos, para um pedido mais.

[short pause]

E o toque casual, prolongado, não-direccionado, simplesmente não acontece.

[long pause]

A consequência é específica.

[pause]

A tua pele aprendeu, ao longo dos anos, que toque é prelúdio.

E qualquer toque, em ti, activa imediatamente o cálculo: o que vai ele querer a seguir?

[short pause]

Este cálculo, repetido durante anos, mata a possibilidade de prazer puramente táctil.

[pause]

Porque tu não estás presente no toque. Estás em segundo plano, a antecipar o pedido.

[long pause]

Esta semana, vais fazer um pedido específico ao teu parceiro — se tens parceiro.

[pause]

Se não tens, podes adaptar com uma amiga próxima.

[short pause]

O pedido é o seguinte:

"Quero que me toques durante quinze minutos sem que isto leve a nada. Sem sexo. Sem início de sexo. Sem expectativa de qualquer outra coisa a seguir."

[pause]

Vai ser estranho para ele. Provavelmente.

[long pause]

Porque o toque sem destino sexual, em casais de longa data, pode parecer artificial.

[pause]

Mas pede.

[short pause]

E sê específica sobre o tipo de toque.

[pause]

"Quero que me passes a mão pelo braço, devagar."

"Quero que me massajes os pés sem pressa."

"Quero que me deites a cabeça ao colo enquanto vês televisão."

[long pause]

Ao fim destes quinze minutos, repara como te sentes.

[pause]

A maioria das mulheres, quando recebe toque puramente casual prolongado, sente uma coisa específica.

[short pause]

Saciedade.

[pause]

A pele, finalmente, recebeu o que andava a pedir.

[long pause]

E aqui há uma reviravolta interessante.

[pause]

Mulheres que conseguem instalar este tipo de toque sem-função na rotina da relação, ao fim de algumas semanas, descobrem que o desejo sexual aumenta.

[short pause]

Não diminui, como elas temiam.

Aumenta.

[pause]

Porque a pele, finalmente saciada na sua necessidade básica de toque, fica disponível para também receber toque sexual.

[long pause]

Sem fome de pele acumulada, o sexo deixa de ser a única forma que tu tens de receber proximidade física.

[pause]

E quando deixa de ser a única forma, pode voltar a ser o que devia ter sido sempre.

[short pause]

Coisa que escolhes quando te apetece.

Não única via possível para um pedido mais antigo, mais simples, e raramente nomeado: o de seres tocada sem que ninguém te peça nada em troca.`,
      },
    ],
  },
  {
    id: "curso-a-chama-m4",
    titulo: "Curso A Chama — Módulo 4 (Aulas A, B, C)",
    descricao: "O Prazer Solitário.",
    scripts: [
      {
        id: "a-chama-m4a",
        titulo: "M4.A — A primeira vez que tocaste em ti mesma",
        curso: "a-chama",
        texto: `Houve, em algum ponto da tua vida, uma primeira vez em que tu te tocaste a ti mesma com alguma forma de prazer.

[pause]

Não estou a falar de sexo. Estou a falar de toque com alguma carga de curiosidade.

[long pause]

Provavelmente foi cedo.

[pause]

Entre os sete e os onze, para a maior parte das mulheres.

[short pause]

Aconteceu, em geral, por acidente.

[pause]

Estavas deitada na cama, ou a brincar no chão, ou a tomar banho — e sentiste algo.

Uma sensação nova. Interessante. Confusa.

[short pause]

E tu, sem pensar, exploraste um pouco mais.

[long pause]

Nesse momento, pela primeira vez na vida, tu tinhas uma relação directa, privada, com o teu próprio prazer.

[pause]

Sem palavras. Sem autoridade externa. Sem modelo aprendido.

[short pause]

Apenas tu e uma sensação tua.

[long pause]

Na maior parte das mulheres adultas, esta memória existe.

[pause]

Mas está enterrada debaixo de camadas.

[short pause]

Camadas de vergonha. Camadas de aviso. Camadas de uma frase que alguém disse em algum momento que transformou aquela primeira experiência em algo sobre o qual não se fala.

[long pause]

Talvez foi a mãe a entrar inesperadamente no quarto e a fazer uma cara.

Talvez foi uma catequista a explicar que certos toques eram pecado.

Talvez foi uma colega mais velha a rir de uma conversa sobre isto no recreio.

[pause]

Ou, mais subtil, talvez não foi ninguém especificamente.

Foi apenas a ausência total de qualquer conversa adulta sobre o facto de que o teu corpo era fonte de prazer legítimo.

[short pause]

E essa ausência, em si, foi mensagem.

[long pause]

A mensagem era: isto não se nomeia. Isto não se partilha. Isto é zona privada onde tu, sozinha, terás de descobrir o que está bem e o que não está.

[pause]

E a maior parte das mulheres, aos onze, doze anos, não tinha ferramentas para fazer essa descoberta sozinha.

[short pause]

Por isso, simplificou.

[pause]

Decidiu que era melhor não tocar.

Ou, se tocasse, fazer depressa, no escuro, sem pensar.

[long pause]

Esta decisão infantil manteve-se.

[pause]

E é por isso que, em adulta, o teu prazer solitário — se o tens — tem ainda, muitas vezes, qualidade apressada.

[short pause]

É feito em poucos minutos. Por vezes no banho. Com ansiedade difusa. Com culpa residual.

[pause]

Raramente com a vagareza, a curiosidade e o prazer táctil que poderia ter.

[long pause]

Esta semana, vais fazer uma coisa simples mas subversiva.

[pause]

Reservar uma noite.

[short pause]

Trinta, quarenta minutos, sem ninguém em casa ou todos a dormir.

[pause]

Não é encontro com orgasmo como objectivo.

É reencontro com a curiosidade que tinhas aos oito anos.

[long pause]

Sem roteiro. Sem ordem certa. Sem partes que "tens de tocar primeiro".

[pause]

Apenas tempo em que o teu corpo pode ser descoberto devagar, sem pressa, sem performance.

[short pause]

Podes descobrir que há sítios em que ainda não tinhas reparado há décadas.

Podes descobrir que o que te dava prazer aos vinte já não é exactamente o mesmo.

Podes descobrir que algumas zonas, quando tocadas sem pressa, acordam sensibilidades que tinhas esquecido.

[pause]

Ou podes descobrir, simplesmente, que está difícil.

[short pause]

Que não apareceu sensação nenhuma.

Que a tua cabeça não parava de planear o dia de amanhã.

Que o teu corpo, sem estímulo de outro, não respondeu.

[long pause]

Tudo isto é informação.

[pause]

Se correu bem, tomaste contacto com uma zona de ti que estava adormecida.

Se correu difícil, tomaste contacto com a dimensão da distância entre tu e o teu prazer próprio.

[short pause]

Ambas as descobertas são ponto de partida.

[pause]

Numa folha, à noite, escreve três linhas:

"Esta noite, ao tocar em mim mesma sem pressa —

Reparei —

E senti —"

[long pause]

Pode ser dez palavras. Pode ser meia página.

[pause]

O importante é deixar em letra escrita que aconteceu.

[short pause]

Porque, na maior parte das mulheres adultas, este tipo de encontro privado com o próprio corpo nunca foi registado por escrito.

[pause]

Vive como secreto, mesmo dentro de ti.

[long pause]

Quando passa a ser registado, mesmo que só para ti, muda de estatuto.

[pause]

Deixa de ser coisa sobre a qual não se fala.

Passa a ser coisa que existe na tua vida, que tem lugar, que faz parte do que tu és.

[short pause]

E esse passo — o de reconhecer, em letra própria, o que costumavas ter apenas no escuro — é maior do que parece.`,
      },
      {
        id: "a-chama-m4b",
        titulo: "M4.B — A culpa que não tinhas mas ficou",
        curso: "a-chama",
        texto: `Depois de te tocares, aparece, muitas vezes, uma coisa pequena.

[pause]

Culpa.

[long pause]

Não violenta. Não dramática.

[pause]

Culpa difusa. Sensação de ter feito algo que devia ser guardado em silêncio.

Vontade de não olhar ninguém nos olhos nos minutos seguintes.

Uma tristeza pequena e difícil de explicar.

[short pause]

Esta reacção é tão comum em mulheres adultas que muitas nem lhe ligam.

[pause]

Assumem que é normal.

[short pause]

Não é.

[long pause]

Em mulheres que tiveram educação sexual saudável, que cresceram em ambientes onde o corpo feminino não era tabu, esta reacção simplesmente não aparece.

[pause]

Elas tocam-se. Sentem prazer. Dormem.

E no dia seguinte não sentem nada de especial relacionado com o acto.

[short pause]

A culpa pós-prazer não é característica do prazer feminino.

[pause]

É característica da educação que tu recebeste.

[long pause]

Pensa, por um momento, onde é que a culpa te chega.

[pause]

Chega sob a forma de uma voz?

Chega sob a forma de uma imagem — a tua mãe, uma catequista, alguém a olhar-te com cara de reprovação?

Chega sob a forma de pensamento racional — "isto foi ridículo"?

Chega sob a forma de sensação corporal — peso no peito, vazio no estômago?

[short pause]

Cada mulher tem a sua forma.

[pause]

Mas se te observares atentamente, consegues identificar a tua.

[long pause]

Esta semana, depois de qualquer momento de prazer próprio — sozinha ou em casal — vais fazer uma coisa pequena.

[pause]

Em vez de abrir o telemóvel imediatamente ou de te levantares logo, fica ali um momento.

Sem fugir da sensação.

[short pause]

E depois, com o caderno ou o telemóvel ao lado, regista em uma linha o que reparaste.

[pause]

Se apareceu culpa: em que forma. De onde te parece vir. Em que parte do corpo a notaste.

[long pause]

Não lutes contra ela.

Não tentes convencer-te de que não devia estar ali.

[pause]

Apenas observa.

[short pause]

Depois, nesse dia ou no dia seguinte, numa folha, escreve:

"Quando sinto culpa depois de prazer, ela aparece em —

E faz-me sentir —

E soa à voz de —"

[long pause]

Esta terceira pergunta — à voz de — é a mais importante.

[pause]

A culpa pós-prazer, em mulheres adultas, raramente é tua.

É voz de outra pessoa, incorporada em ti há décadas.

[short pause]

Pode ser a tua mãe. Pode ser a tua avó. Pode ser uma catequista que te marcou aos nove anos. Pode ser um professor de religião. Pode ser uma frase específica de um livro antigo que leste.

[long pause]

Quando consegues atribuir a culpa a alguém específico, ela muda.

[pause]

Deixa de parecer verdade sobre ti.

Passa a parecer eco de uma voz exterior que se alojou em ti sem o teu consentimento.

[short pause]

E os ecos, ao contrário das verdades, podem ser reduzidos com o tempo.

[long pause]

Não por força de vontade.

Por repetição.

[pause]

Todas as vezes que tu sentes prazer e, imediatamente, observas a culpa como eco em vez de a obedecer como verdade — a culpa perde, ligeiramente, poder.

[short pause]

Não desaparece numa semana.

Não desaparece num mês.

[pause]

Mas ao fim de alguns meses de atenção regular, muitas mulheres descobrem que a culpa pós-prazer simplesmente aparece menos frequentemente.

[short pause]

E quando aparece, já não dirige o resto do dia.

[long pause]

O teu prazer, em ti adulta, não precisa de pagar imposto emocional a uma voz que te foi imposta aos oito, nove, dez anos.

[pause]

Mas não basta saberes isto intelectualmente.

[short pause]

A desinstalação acontece por observação repetida em tempo real — no momento em que a culpa aparece — até que o sistema nervoso percebe que não está em perigo e deixa de activar a reacção.

[pause]

Esta observação é trabalho paciente.

E é dos mais libertadores que podes fazer contigo mesma.`,
      },
      {
        id: "a-chama-m4c",
        titulo: "M4.C — O que não tens de pedir permissão a ninguém",
        curso: "a-chama",
        texto: `Há uma lista de coisas que tu fazes, em adulta, e que tu, sem perceber, continuas a pedir permissão silenciosa para fazer.

[pause]

Permissão que ninguém te pede.

Permissão que tu, em algum momento, foste treinada a pedir.

[long pause]

Pedes permissão silenciosa para comer uma sobremesa num jantar.

Pedes permissão silenciosa para descansar um fim-de-semana.

Pedes permissão silenciosa para sair sozinha ao cinema.

Pedes permissão silenciosa para ter uma tarde em que ninguém te chateia.

Pedes permissão silenciosa para te tocares.

[short pause]

Estas permissões silenciosas são pedidas a ninguém específico.

[pause]

São pedidas a uma autoridade difusa — a soma de todas as vozes que, ao longo da tua vida, te ensinaram que precisavas de autorização para prazer próprio.

[long pause]

O teu prazer solitário pertence a esta lista.

[pause]

Em adulta, tu tens legalmente, fisicamente, moralmente, todo o direito de te tocares quando quiseres, como quiseres, e quantas vezes quiseres.

[short pause]

Ninguém — nenhum marido, nenhuma religião, nenhuma mãe, nenhuma cultura — tem autoridade real sobre esta zona da tua vida.

[pause]

Esta é, talvez, uma das únicas zonas em que a tua autoridade é absoluta.

[long pause]

E, no entanto, muitas mulheres adultas continuam a pedir permissão silenciosa para exercer este direito.

[pause]

Permissão que nunca lhes foi concedida explicitamente.

E que, por isso, elas continuam a adiar.

[short pause]

"Quando o meu marido estiver fora."

"Quando os miúdos estiverem a dormir profundamente."

"Quando eu tiver mais tempo."

"Quando me sentir mais confortável."

[pause]

O quando chega raramente.

[long pause]

Este módulo termina com um gesto escrito, privado, que pode parecer estranho, mas que tem efeito específico.

[pause]

Numa folha que só tu vais ver, vais escrever uma autorização.

[short pause]

Escrita por ti. Assinada por ti. Dirigida a ti.

[long pause]

Podes escrever qualquer coisa como:

"Eu, pela minha própria autoridade, dou-me permissão a partir de hoje para tocar em mim mesma quando me apetecer. Não preciso de autorização de ninguém. Não tenho de justificar a ninguém. Este é o meu corpo e o meu prazer. Não devo nada a ninguém nesta zona da minha vida."

[pause]

Assina. Põe a data.

[short pause]

E guarda esta folha num sítio onde a voltes a ver daqui a alguns meses.

[long pause]

O gesto parece infantil.

[pause]

Mas é, na verdade, um dos actos mais adultos que podes fazer contigo mesma.

[short pause]

Porque pôr em letra escrita aquilo que está implícito — a tua autoridade sobre o teu próprio prazer — dá a essa autoridade uma presença tangível.

[pause]

Ela deixa de ser ideia abstracta.

Passa a ser documento que existe em papel, com a tua letra, com a tua assinatura.

[long pause]

E na próxima vez que a culpa silenciosa, ou a permissão silenciosa, voltar a aparecer, tu tens algo a que recorrer.

[pause]

Não em pensamento.

Em objecto real.

[short pause]

Podes ir buscar a folha. Ler.

E lembrar-te, em letra concreta, que a autorização já foi dada.

[long pause]

Por ti. A ti. Há quanto tempo for necessário.

[pause]

E ao longo dos meses, vais deixar de precisar de ir buscar a folha.

[short pause]

Porque a autorização, à medida que vai sendo exercida, vai deixando de precisar de ser reactivada.

[pause]

Torna-se, finalmente, estado interior.

[long pause]

A mulher que não pede permissão silenciosa para o seu próprio prazer é mulher em outro estado de liberdade.

[pause]

Não é mulher mais sexual, necessariamente.

É mulher mais livre na relação com este pedaço da sua vida.

[short pause]

E essa liberdade, pequena no papel, é uma das bases sobre a qual a chama, com tempo, volta a acender.`,
      },
    ],
  },
  {
    id: "curso-a-chama-m5",
    titulo: "Curso A Chama — Módulo 5 (Aulas A, B, C)",
    descricao: "O Desejo na Relação Longa.",
    scripts: [
      {
        id: "a-chama-m5a",
        titulo: "M5.A — A semana em que deixaste de ter iniciativa",
        curso: "a-chama",
        texto: `Houve, na tua relação longa, uma semana em que tu deixaste de ter iniciativa.

[pause]

Provavelmente nunca disseste isso a ninguém.

Provavelmente nem a ti própria disseste, em letra clara.

[long pause]

Mas aconteceu.

[pause]

Em algum ponto da relação, uma mudança silenciosa instalou-se.

A iniciativa passou a vir só dele.

E tu, em vez de iniciares quando te apetecia, começaste a esperar.

[short pause]

Às vezes, apetecia-te.

Mas não fazias nada.

[pause]

Talvez por timidez repentina em alguém com quem vives há anos.

Talvez por medo de ele recusar — e teres de lidar com a rejeição que nunca tiveras de gerir enquanto era ele a pedir.

Talvez, simplesmente, por cansaço aprendido — por teres aprendido que é mais fácil deixar ele organizar este pedaço da relação.

[long pause]

Esta assimetria, quando se instala, raramente é revista.

[pause]

E ao longo dos anos, torna-se realidade inquestionada.

[short pause]

"Ele é que costuma iniciar."

"Eu não sou muito de começar."

"A libido masculina é diferente — ele precisa mais."

[pause]

Estas frases, repetidas em silêncio, parecem descrever o que é.

[short pause]

Na verdade, descrevem o que foi ficando — por falta de revisão.

[long pause]

A questão honesta é esta.

[pause]

Quando foi a última vez que tu tiveste iniciativa sexual?

[short pause]

Não no sentido óbvio. Também num sentido mais subtil — tu a aproximares-te dele, a procurares-lhe o toque, a pedires-lhe a noite.

[pause]

Para muitas mulheres em relação longa, a resposta é: "não me lembro. Meses? Um ano? Mais?"

[long pause]

Esta perda de iniciativa tem consequência específica.

[pause]

Tu começas a receber o sexo.

Já não o provocas.

[short pause]

E o sexo que tu recebes, sem nunca provocares, é diferente do que tu provocas.

[pause]

Porque o desejo, em mulher, precisa de vias de saída.

E se a via de saída "iniciar" está bloqueada, o desejo, sem saída, atrofia.

[long pause]

Esta semana, vais fazer um gesto pequeno.

[pause]

Num dia em que te apeteça — mesmo subtilmente — ser tu a ter iniciativa.

[short pause]

Não tem de ser iniciativa óbvia. Não tem de ser proposta verbal explícita.

[pause]

Pode ser um olhar mantido mais do que o habitual durante o jantar.

Pode ser a tua mão no joelho dele enquanto vêem televisão, de uma forma diferente do habitual.

Pode ser uma frase curta: "Esta noite, quando for para dormir, queria estar contigo."

[long pause]

Este gesto, pequeno, desmonta uma estrutura antiga.

[pause]

Desmonta a estrutura em que ele pede e tu respondes.

E reintroduz uma estrutura em que tu também desejas — e comunicas esse desejo.

[short pause]

Ele vai reparar.

[pause]

Pode ficar surpreendido. Pode estranhar. Pode até, momentaneamente, sentir-se desconfortável com a mudança de papel.

[short pause]

Mas, na grande maioria dos casos, o que acontece a seguir é que alguma coisa, na dinâmica erótica de vocês, muda.

[long pause]

Deixa de ser ritual desempenhado.

Passa a ser encontro efectivo.

[pause]

Porque há duas pessoas a desejar, não uma a pedir e outra a ceder.

[short pause]

E a diferença, mesmo quando subtil, é grande.

[long pause]

Depois do gesto, numa folha — que não precisas de mostrar a ninguém — escreve três linhas.

[pause]

"Hoje tive iniciativa. Ele reagiu com —. Eu senti —."

[short pause]

Não tens de repetir todas as semanas.

Mas mesmo uma vez, ao fim de anos sem, começa a recalibrar algo interior.

[pause]

A parte de ti que tinha iniciativa, há anos, e que foi aprendendo a desligar-se — fica a saber que ainda pode voltar.

[long pause]

E essa informação, nela, é semente.

[pause]

De quê, exactamente, tu descobres com o tempo.`,
      },
      {
        id: "a-chama-m5b",
        titulo: "M5.B — O sexo que já fazem há dez anos igual",
        curso: "a-chama",
        texto: `Em muitas relações longas, o sexo, quando acontece, acontece igual.

[pause]

Mesma hora aproximada.

Mesmo quarto.

Mesma coreografia — em linhas gerais.

[long pause]

Começa mais ou menos da mesma forma.

Progride mais ou menos da mesma forma.

Acaba mais ou menos da mesma forma.

[pause]

E no dia seguinte, tu e ele raramente falam sobre o que aconteceu.

[short pause]

Isso passou a ser normal entre vocês. Banal. Quase administrativo.

[long pause]

Este estado é tão comum em casais de longa duração que muitos casais nem lhe chamam problema.

[pause]

Chamam-lhe rotina.

E aceitam-no como preço natural da vida partilhada.

[short pause]

Mas há uma diferença entre rotina e repetição mecânica.

[pause]

A rotina tem alguma presença. Tem gosto. Tem atenção do que está a acontecer.

A repetição mecânica é fazer os mesmos gestos sem presença nenhuma — apenas por reflexo aprendido.

[long pause]

Muitos casais longos deslizaram da rotina para a repetição mecânica, sem marcarem o momento em que isso aconteceu.

[pause]

E o sexo, quando é repetição mecânica, tem custo.

[short pause]

Tu, durante o acto, estás em segundo plano. A tua cabeça pensa em coisas banais. A tua atenção não está ali.

[pause]

Ele, provavelmente, nota. Mas não fala.

Ou fala, uma vez ou outra, de forma vaga — "ultimamente está diferente."

[short pause]

E vocês os dois decidem, sem palavras, que isto é o que é, e não há muito a fazer.

[long pause]

Esta semana, vais fazer um exercício pequeno.

[pause]

Não vais mudar tudo. Não vais propor experiências dramáticas.

[short pause]

Vais apenas mudar uma coisa — qualquer uma — no próximo encontro sexual que tiveres.

[pause]

Pode ser tão pequeno como:

Fazer amor com a luz ligeiramente acesa, em vez do escuro habitual.

Começar noutra divisão da casa.

Pedir-lhe, explicitamente, uma coisa específica que te apetece — em vez de esperar que ele adivinhe.

Parar a meio e beijá-lo de uma forma diferente, sem pressa.

Dizer-lhe, em voz baixa, uma frase sobre o que estás a sentir.

[long pause]

Não é coreografia nova.

É interrupção de coreografia antiga.

[pause]

E a interrupção, mesmo pequena, reintroduz presença.

[short pause]

Porque, de repente, vocês os dois têm de prestar atenção — em vez de deslizarem em piloto automático.

[long pause]

A maior parte das mulheres que faz este exercício descreve a mesma coisa.

[pause]

"Foi como se, pela primeira vez em muito tempo, tivéssemos estado os dois presentes no mesmo sítio."

[short pause]

Não foi sexo melhor, objectivamente.

Foi sexo em que houve os dois.

[long pause]

Esta presença renovada, quando se repete algumas vezes, começa a descongelar a dinâmica erótica.

[pause]

E o casal que fazia sexo há dez anos igual começa, subtilmente, a fazer sexo diferente.

[short pause]

Não porque aprendeu técnicas novas.

Porque voltou a estar presente no que estava a acontecer.

[pause]

E a presença, em sexo, é variável com mais peso do que a técnica.

[long pause]

À noite, depois do gesto, numa folha, escreve uma linha.

[pause]

"Esta noite, mudei esta coisa pequena. E notei que —"

[short pause]

Ao fim de algumas semanas, vais ter um pequeno diário de interrupções.

[pause]

E podes olhar para ele como quem olha para um mapa de reencontro.

[long pause]

Entre tu e a pessoa com quem vives há anos.

[pause]

Através de pequenos gestos que, no aparente, parecem banais.

Mas que, no profundo, são actos de reacendimento.`,
      },
      {
        id: "a-chama-m5c",
        titulo: "M5.C — A conversa que nunca tiveste com ele sobre prazer",
        curso: "a-chama",
        texto: `Há uma conversa que tu, na tua relação longa, provavelmente nunca tiveste com ele.

[pause]

A conversa sobre o que te dá prazer.

[long pause]

Tiveram a conversa sobre filhos.

Sobre dinheiro.

Sobre famílias respectivas.

Sobre planos de férias, casas, carros, reformas.

[pause]

Mas a conversa específica em que tu, em voz clara, explicas a ele o que te dá prazer sexual — nunca a tiveram.

[short pause]

Ou tiveram-na de forma rudimentar, muito cedo na relação, e nunca a actualizaram.

[long pause]

Esta ausência não é por falta de intimidade.

[pause]

É por estrutura cultural.

[short pause]

Tu foste treinada para não falar nestes termos.

Ele foi treinado para saber sem ter de perguntar.

E vocês os dois, quando entraram na relação, assumiram implicitamente que isto se descobria.

[pause]

Descobre-se parcialmente.

[short pause]

Mas raramente chega ao nível de detalhe que seria útil.

[long pause]

E ao fim de muitos anos, ele sabe o que te dá algum prazer.

[pause]

Sabe a sequência que funciona na maior parte das vezes.

Sabe a zona que costuma ser eficaz.

[short pause]

Mas não sabe:

O que te daria ainda mais prazer, se ele soubesse.

Os pedidos específicos que tu tens há anos e nunca verbalizaste.

As coisas que ele faz e que não são as que tu preferirias.

As zonas do teu corpo que ele nunca explorou suficientemente.

Os momentos do dia em que o teu desejo é maior e que ele não sabe aproveitar.

[long pause]

Esta informação está em ti.

[pause]

Vive como mapa privado que tu, há anos, não partilhas com a pessoa que mais precisaria dele.

[short pause]

Não partilhas por várias razões.

Porque te foi ensinado que mulher que pede muito é exigente.

Porque tens medo de o ferir na vaidade se sugerires que há coisas que ele podia fazer diferente.

Porque, num momento inicial da relação, assumiste que ele ia perceber — e agora, vinte anos depois, parece estranho levantar o assunto.

[pause]

Porque, no fundo, não sabes bem como começar uma conversa destas.

[long pause]

Esta semana — ou este mês, se precisares de mais tempo — vais iniciar essa conversa.

[pause]

Não de uma vez. Não numa frase.

[short pause]

Em pequenas pílulas, ao longo de algumas semanas.

[long pause]

A primeira pílula pode ser simples.

[pause]

Num momento de relaxamento — não na cama, não durante sexo — podes dizer-lhe algo como:

"Há uma coisa pequena que me apetece pedir. Quando me tocas aqui, gosto se for um bocadinho mais lento. Há uma diferença."

[short pause]

Uma coisa. Uma vez. Sem drama.

[pause]

Observa como ele reage.

[long pause]

A maioria dos homens em relações longas, quando recebe informação específica sobre o prazer da parceira, reage de uma de duas formas.

[pause]

Alguns ficam ligeiramente desconfortáveis na hora — com um leve sentimento de terem estado a fazer mal durante anos.

[short pause]

Mas, nos dias seguintes, experimentam a sugestão.

E, na maior parte dos casos, tornam-se melhores parceiros.

[pause]

Outros, menos frequentemente, recusam.

Dizem "sempre foi assim", "se gostasses a fazer diferente tinhas dito antes", "tu mudaste".

[long pause]

A segunda reacção é informação importante.

[pause]

Não significa, necessariamente, que a relação não tem solução.

Mas significa que o trabalho vai ser maior do que apenas uma conversa.

[short pause]

Na maior parte das vezes, porém, a reacção é a primeira.

[pause]

E, ao longo de algumas semanas em que tu vais partilhando pequenas informações — uma aqui, outra ali, nunca todas de vez — a dinâmica entre vocês começa a mudar.

[long pause]

Ele começa a saber-te melhor.

Tu começas a ter mais do que pedes.

E o sexo entre vocês deixa de ser coreografia herdada e passa a ser encontro informado.

[pause]

A conversa sobre prazer, em relação longa, é das mais difíceis de iniciar.

[short pause]

Mas é também das mais transformadoras.

[pause]

Porque põe em palavras o que, há décadas, vivia em suposição.

[long pause]

E a suposição, em intimidade de longo prazo, é terreno onde a chama se apaga.

[pause]

As palavras, mesmo desajeitadas, são oxigénio.`,
      },
    ],
  },
  {
    id: "curso-a-chama-m6",
    titulo: "Curso A Chama — Módulo 6 (Aulas A, B, C)",
    descricao: "A Vergonha Herdada.",
    scripts: [
      {
        id: "a-chama-m6a",
        titulo: "M6.A — O que a tua mãe nunca te disse sobre prazer",
        curso: "a-chama",
        texto: `A tua mãe, muito provavelmente, nunca te falou sobre prazer.

[pause]

Falou sobre perigos. Sobre cuidado. Sobre contracepção — talvez, se foste de uma geração com sorte.

[long pause]

Mas sobre prazer em si, raramente.

[pause]

Sobre o teu direito ao teu próprio orgasmo.

Sobre a legitimidade de quereres toque que te apetece.

Sobre a diferença entre sexo que te dá prazer e sexo que apenas acontece.

[short pause]

Estas conversas, em quase todas as casas portuguesas, nunca aconteceram.

[long pause]

Não é culpa dela.

[pause]

A tua mãe não foi ensinada por ninguém. A avó da tua mãe provavelmente sabia ainda menos.

[short pause]

A ignorância sobre prazer feminino atravessa gerações.

E chega a ti.

[pause]

Não como gesto hostil. Como ausência transmitida.

[long pause]

Mas a ausência, em educação, é uma forma de educação.

[pause]

Ensina-te, implicitamente, que este tema não se discute.

Que é coisa que se gere em silêncio.

Que não tem lugar legítimo na conversa entre mulheres de uma mesma família.

[short pause]

E tu, em adulta, herdas este silêncio sem sequer reparares.

[long pause]

Repara numa coisa curiosa.

[pause]

Em conversas entre mulheres da tua geração — amigas, colegas, irmãs — é raro falar-se sobre prazer sexual com detalhe.

[short pause]

Fala-se sobre relações.

Fala-se sobre homens.

Fala-se sobre queixas genéricas — "anda tudo parado", "já não há grande entusiasmo".

[pause]

Mas a conversa específica — o que me dá prazer, como é o meu orgasmo, o que descobri que o meu corpo quer — essa não acontece.

[long pause]

Este silêncio não é timidez pessoal.

[pause]

É herança de gerações de mulheres que, antes de ti, aprenderam que este assunto não tinha palavras.

[short pause]

Esta semana, vais fazer um exercício de quebra de herança.

[pause]

Escolhe uma única amiga com quem tenhas proximidade real.

[short pause]

Pode ser irmã. Pode ser amiga de infância. Pode ser prima. Pode ser colega de trabalho chegada.

[pause]

Alguém em quem confias.

[long pause]

E vais iniciar, com ela, uma conversa sobre prazer.

[pause]

Não tem de ser conversa longa.

Não tem de ser confessional.

[short pause]

Pode começar com uma frase simples:

"Tenho andado a pensar numa coisa. Acho que nunca, na minha vida, tive uma conversa a sério com outra mulher sobre prazer sexual. Tu tiveste?"

[long pause]

Vai acontecer uma de duas coisas.

[pause]

Ou ela fica desconfortável — e a conversa morre.

Ou ela fica aliviada — e descobres que ela também andava a precisar.

[short pause]

Na segunda hipótese, começa uma conversa que, em quase todos os casos, se torna uma das mais libertadoras que tu tens há muito tempo.

[pause]

Porque, pela primeira vez, tu descobres que as tuas dúvidas, as tuas perguntas, as tuas confusões não são tuas individualmente.

[short pause]

São colectivas.

[long pause]

Outras mulheres da tua idade têm as mesmas perguntas.

[pause]

Têm a mesma falta de informação básica sobre o seu próprio corpo.

Têm os mesmos silêncios antigos.

Têm a mesma vergonha residual que nunca foi nomeada.

[short pause]

E quando vocês nomeiam, juntas, alguma coisa muda.

[pause]

Deixa de ser problema teu.

Passa a ser herança partilhada que, partilhada, começa a dissolver-se.

[long pause]

Este gesto pequeno — uma conversa a sério com uma amiga — é corte histórico.

[pause]

Estás a quebrar uma cadeia que, antes de ti, passou de mãe para filha durante gerações sem ser interrompida.

[short pause]

E a cadeia, quando se quebra com uma conversa honesta, deixa de transmitir o silêncio.

[pause]

Se tiveres filha, e ela já é grande, este corte tem ainda mais peso.

[long pause]

Porque a próxima geração de mulheres da tua família pode herdar, em vez do silêncio, a linguagem que tu começaste.

[pause]

Não precisas de ter uma conversa directa com a tua filha amanhã.

Mas podes, devagar, começar a mostrar-lhe que este assunto tem palavras.

[short pause]

E as palavras, transmitidas, mudam tudo.`,
      },
      {
        id: "a-chama-m6b",
        titulo: "M6.B — A frase religiosa que ainda opera",
        curso: "a-chama",
        texto: `Mesmo que tu não sejas religiosa, a religião formou-te.

[pause]

Formou a tua mãe. Formou a tua avó. Formou a cultura onde cresceste.

E, por essa via, formou-te a ti.

[long pause]

Em Portugal, a maior parte das mulheres da tua idade cresceu em ambiente católico.

[pause]

Podes ter sido baptizada.

Podes ter feito catequese.

Podes ter tido professora de moral e religião na escola.

[short pause]

Ou, mais subtilmente, podes nunca ter praticado — mas cresceste rodeada de pessoas que praticavam, em vilas, em famílias, em pequenas comunidades onde a moral sexual católica era o ar.

[long pause]

A doutrina católica tradicional sobre sexualidade feminina, durante séculos, teve quatro mensagens principais.

[pause]

O sexo existe para procriar.

O prazer da mulher é secundário.

A masturbação feminina é pecado.

A mulher boa é casta; a mulher má, não.

[short pause]

Estas quatro mensagens, mesmo nas casas mais secularizadas, contaminaram o ar durante gerações.

[pause]

E tu, em adulta, provavelmente ainda tens, em algum lugar interior, traços destas mensagens — mesmo sem partilhares a fé que as gerou.

[long pause]

Este módulo não é sobre religião.

[pause]

É sobre reconhecer em ti a presença de estruturas religiosas antigas que continuam a dirigir a tua relação com o prazer, mesmo que tu já não te consideres religiosa.

[short pause]

Em mulheres portuguesas adultas, isto aparece em pequenos detalhes.

[pause]

A vergonha pequena depois do prazer solitário que falamos no módulo anterior.

A sensação, vaga mas persistente, de que mulher muito sexual é, em algum grau, menos respeitável.

A dificuldade em falar sobre o teu corpo em termos explícitos, mesmo com pessoas próximas.

A hesitação diante de uma fantasia que te desce à cabeça e que tu achas, por algum motivo, que "não devia ter".

[short pause]

Cada um destes sinais pode ter origem em frase religiosa antiga que tu nunca, conscientemente, aceitaste.

[long pause]

Esta semana, vais fazer um exercício de escavação específica.

[pause]

Numa folha, escreve em cima:

"Frases religiosas ou morais sobre corpo, sexo e mulher que ouvi em criança ou adolescente."

[short pause]

E tenta lembrar-te.

[pause]

Pode ser:

"O corpo é templo. Tens de o respeitar."

"Mulher honrada chega virgem ao casamento."

"O prazer por prazer é pecado."

"Mulher que anda na rua de olho desperto é fresca."

"Deus vê tudo o que fazes no escuro."

"Isso é coisa de mulher perdida."

[long pause]

Não tens de ter ouvido exactamente estas frases.

[pause]

Escreve as que apareceram, em alguma versão, na tua infância ou adolescência.

[short pause]

Quando tens a lista, faz uma segunda coisa.

[pause]

Ao lado de cada frase, escreve uma nota — uma única linha — em resposta.

[long pause]

A nota pode ser uma refutação honesta. Pode ser:

"Esta frase não reflecte o que eu penso em adulta."

"Esta frase deu-me medo durante anos."

"Esta frase ainda, às vezes, aparece em mim sem aviso."

"Esta frase fez-me sentir suja durante décadas."

[pause]

Escreves a tua resposta em adulta.

[short pause]

Este simples acto — a tua resposta em letra escrita, em oposição à frase — é trabalho subterrâneo.

[long pause]

Estás a fazer, em letra tua, aquilo que nunca ninguém fez por ti enquanto crescias.

[pause]

Estás a contrapor. A corrigir. A actualizar.

[short pause]

A voz que antes chegava sem resposta agora tem resposta.

[pause]

E a resposta, ao longo das semanas em que a relês, começa a ganhar peso próprio.

[long pause]

Não é que a frase religiosa antiga desapareça.

[pause]

É que, ao lado dela, passa a existir a tua.

E a tua, com o tempo, começa a ter mais autoridade do que a herdada.

[short pause]

Porque é tua. Foi escrita por ti. Em adulta. Depois de pensares.

[long pause]

A religião pode ter formado a tua infância.

[pause]

Mas tu, em adulta, tens o direito — e os meios — de rever as formações que não te servem.

[short pause]

E a revisão, escrita em letra tua, é acto de adulta plena.

[pause]

Não contra a fé, se a tens. Mas a favor da tua relação real com o teu próprio corpo.`,
      },
      {
        id: "a-chama-m6c",
        titulo: "M6.C — Os filmes e livros que te ensinaram a desejar mal",
        curso: "a-chama",
        texto: `A cultura ensinou-te a desejar.

[pause]

Não conscientemente.

Por acumulação.

[long pause]

Desde criança, tu recebeste, através de filmes, livros, revistas, música, uma ideia específica do que era o desejo feminino.

[pause]

Na maior parte dos casos, a ideia era errada.

[short pause]

Os filmes mostravam, em geral, o desejo da mulher a servir a história do homem.

O prazer feminino, quando aparecia, era como resposta à competência masculina.

[pause]

Raramente aparecia mulher a desejar por ela, por conta própria, com a sua própria lógica.

[long pause]

Os livros de romance, por seu turno, ensinaram-te outra coisa igualmente problemática.

[pause]

Ensinaram-te que o desejo real aparecia em relações cheias de drama.

Que o homem mais desejável era o mais difícil.

Que o prazer verdadeiro tinha de passar por resistência, conquista, intensidade.

[short pause]

E a relação calma, segura, construída — a relação adulta real — era, na linguagem desses livros, chata.

[long pause]

Esta educação cultural contaminou a tua biologia.

[pause]

Em adulta, quando te encontras numa relação estável e boa, uma parte de ti sente que falta algo.

Falta o drama.

Falta a tensão.

Falta a conquista.

[short pause]

E tu, sem perceber, começas a confundir falta de desejo com falta de intensidade cinematográfica.

[long pause]

Mas a intensidade cinematográfica nunca foi desejo real.

[pause]

Era ficção desenhada para vender bilhetes de cinema.

[short pause]

O desejo real, na vida adulta sustentável, tem outra textura.

[pause]

É menos espectacular.

Mais lento.

Mais subtil.

[short pause]

Aparece em pequenos momentos — olhar mantido por mais meio segundo do que o habitual, vontade de toque casual no cotovelo, sensação de alívio quando ouves a chave na porta à noite.

[long pause]

Estes sinais, em mulher educada por ficção dramática, passam desapercebidos.

[pause]

Porque tu estás à espera de algo maior.

Algo que nunca vai aparecer — porque nunca existiu na vida real.

[short pause]

Apenas em filmes.

[long pause]

Esta semana, vais fazer um exercício de contra-educação.

[pause]

Numa folha, escreve em cima:

"O que a ficção me ensinou que era desejo, e que provavelmente não é."

[short pause]

E enumera o que te ocorre.

[pause]

Pode ser:

"Aprendi que o desejo tinha de ser intenso. Dramático. Urgente."

"Aprendi que o homem tinha de ser difícil para ser desejável."

"Aprendi que o sexo verdadeiro tinha de ter alguma dose de perigo ou proibido."

"Aprendi que o toque calmo e conhecido era menos desejável do que o toque novo e incerto."

"Aprendi que mulher apaixonada é mulher perturbada."

[long pause]

Olha para a tua lista.

[pause]

E faz uma pergunta a seguir:

"Quantas destas ideias ainda dirigem, hoje, a minha expectativa sobre o meu próprio desejo?"

[short pause]

Em geral, quase todas.

[long pause]

A reanimação do desejo em mulher adulta passa, em grande parte, por desmontar esta educação ficcional.

[pause]

E por aprender a reconhecer como desejo real o que a educação ficcional te ensinou a descartar.

[short pause]

O olhar mantido meio segundo a mais é desejo.

A vontade de toque casual é desejo.

A sensação boa quando ele entra na sala é desejo.

O pequeno enervamento quando ele se afasta numa festa é desejo.

[pause]

Nada disto parece intenso o suficiente para ser desejo — segundo a ficção.

Mas é exactamente disto que o desejo adulto se faz.

[long pause]

Quando tu passas a reconhecer estes sinais pequenos como legítimos — em vez de os descartar por não serem dramáticos — a tua percepção do teu próprio desejo aumenta drasticamente.

[pause]

Não porque o desejo aumentou.

Porque deixaste de o descartar.

[short pause]

E com o desejo visto, vem vontade de o exercer.

[pause]

Em pequenos momentos, à escala real, sem tensão cinematográfica.

[short pause]

Apenas na escala humana em que, ao longo dos anos, ele é sustentável.`,
      },
    ],
  },
  {
    id: "curso-a-chama-m7",
    titulo: "Curso A Chama — Módulo 7 (Aulas A, B, C)",
    descricao: "A Chama Fora da Cama.",
    scripts: [
      {
        id: "a-chama-m7a",
        titulo: "M7.A — O que te dava entusiasmo aos vinte e que já não sentes",
        curso: "a-chama",
        texto: `A chama, nesta altura do curso, já percebeste que não é só sobre sexo.

[pause]

É sobre capacidade geral de desejar.

[long pause]

E esta capacidade, em mulheres adultas, afecta todas as áreas da vida — não só a cama.

[pause]

Se tu não desejas nada durante o dia, é pouco provável que desejes muito à noite.

[short pause]

A chama é, no fundo, uma qualidade de relação com a vida.

[pause]

E quando ela se apaga em ti, apaga-se em várias frentes ao mesmo tempo.

[long pause]

Pensa em ti aos vinte, vinte e dois anos.

[pause]

O que te dava entusiasmo na altura?

[short pause]

Coisas específicas. Concretas.

[pause]

Pode ter sido um projecto que começaste. Um grupo de amigas com quem fazias planos constantemente. Uma disciplina na universidade que te fascinava. Um estilo de música, um hobby, um sonho concreto que te animava todas as manhãs.

[short pause]

Pode ter sido a ideia de viver sozinha. Ou de viajar. Ou de aprender uma língua. Ou de começar uma carreira.

[long pause]

Agora pensa em ti hoje.

[pause]

Qual destes entusiasmos ainda está em ti, com a mesma intensidade?

[short pause]

Em quase todas as mulheres adultas, a resposta honesta é: "quase nenhum."

[long pause]

Isto não é necessariamente sinal de depressão.

[pause]

É sinal de outra coisa, mais subtil.

[short pause]

Ao longo dos anos, tu foste substituindo os entusiasmos próprios pelos entusiasmos dos outros.

[pause]

Os sonhos do teu marido.

Os projectos dos teus filhos.

As necessidades da tua família alargada.

O trabalho que pagava as contas, independentemente de te interessar ou não.

[long pause]

Cada uma destas substituições foi, no seu momento, legítima.

[pause]

Não se pode viver em vida adulta partilhada sem atender aos entusiasmos dos outros em algum grau.

[short pause]

O problema não foi atender aos outros.

Foi parar de atender aos teus.

[long pause]

Esta semana, vais fazer um exercício de arqueologia do entusiasmo.

[pause]

Numa folha, escreve em cima:

"Coisas que me davam entusiasmo aos vinte, antes de ter responsabilidades grandes."

[short pause]

E escreve tudo o que te lembras.

[pause]

Não filtres.

Não julgues.

Não digas "aquilo era infantil".

[short pause]

Escreve: leituras específicas, projectos que tinhas em mente, pessoas com quem te via com frequência, estilos de vida que te atraíam, conversas que podias ter durante horas, sonhos pequenos e grandes.

[long pause]

Pode ter quinze entradas. Pode ter trinta.

Quanto mais, melhor.

[pause]

Quando acabares, lê.

[short pause]

E faz uma pergunta seca, em folha separada:

"De todas estas coisas, quais ainda existem na minha vida, em alguma forma?"

[long pause]

A maioria das mulheres, ao fazer este exercício, fica em silêncio diante da folha.

[pause]

Porque percebe que cinco ou seis dos entusiasmos que a definiam aos vinte simplesmente desapareceram sem ela ter tomado consciência disso.

[short pause]

Não foram abandonados por decisão.

Foram abandonados por acumulação.

[long pause]

A pergunta a seguir, então, é:

"Qual destes entusiasmos, se eu o recuperasse em pequena dose, mudaria a qualidade do meu ar diário?"

[pause]

Não tens de recuperar tudo.

Não tens de voltar a ser a pessoa de vinte anos.

[short pause]

Escolhe um.

[pause]

Um único entusiasmo pequeno — uma leitura, um grupo, uma prática, um tema.

[long pause]

E introduz, esta semana, uma mini-versão dele na tua vida actual.

[pause]

Pode ser uma hora por semana. Pode ser menos.

[short pause]

Mas de forma regular, durante algumas semanas.

[pause]

E repara no que acontece.

[long pause]

A maioria das mulheres, quando reintroduz um único entusiasmo antigo, descreve uma sensação curiosa.

[pause]

"Pareço eu outra vez."

[short pause]

E esta sensação — pareceres tu outra vez — é, em si, reabertura da chama.

[pause]

Porque a chama, antes de ser desejo sexual, é capacidade de quereres coisas.

[short pause]

E a mulher que quer coisas — mesmo coisas pequenas, mesmo hobbies, mesmo temas aparentemente banais — é mulher com chama.

[pause]

O resto segue-se.`,
      },
      {
        id: "a-chama-m7b",
        titulo: "M7.B — A vontade de coisas que não tem nome",
        curso: "a-chama",
        texto: `Há uma vontade, em algumas mulheres adultas, que não tem nome.

[pause]

Não é vontade de sexo.

Não é vontade de mudar de vida.

Não é vontade de nada específico.

[long pause]

É uma vontade difusa, silenciosa, que aparece em momentos estranhos.

[pause]

No carro, a caminho do trabalho.

A fazer o jantar numa terça-feira.

A olhar pela janela numa tarde em que devias estar a fazer outra coisa.

[short pause]

Aparece, fica alguns segundos, e vai-se embora.

[pause]

E tu, sem perceber bem o que era, continuas com o que estavas a fazer.

[long pause]

Esta vontade sem nome é sinal de vitalidade.

[pause]

É a tua chama a tentar comunicar — ainda não sabes sobre o quê.

[short pause]

A maioria das mulheres, quando sente esta vontade difusa, descarta.

Porque não tem alvo. Porque não serve para nada prático. Porque parece perda de tempo considerá-la.

[pause]

E a chama, descartada vezes suficientes, deixa de enviar o sinal.

[long pause]

Esta semana, em vez de descartares, vais registar.

[pause]

Arranja um caderno pequeno. Ou um bloco de notas no telemóvel.

[short pause]

E todas as vezes que, durante a semana, sentires aparecer em ti uma vontade difusa e sem nome, escreves uma linha.

[pause]

Não tens de saber o que ela era.

Escreves:

"Hoje, na cozinha, apareceu uma vontade sem nome. Veio devagar. Durou poucos minutos. Foi."

[short pause]

Ou:

"Terça de tarde, a caminho do supermercado, apareceu uma vontade que eu não sei nomear. Tinha algo a ver com movimento. Foi."

[long pause]

Não tens de interpretar. Não tens de elaborar. Apenas registar que aconteceu.

[pause]

Ao fim da semana, lê as entradas em sequência.

[short pause]

Vai aparecer um padrão.

[pause]

As vontades sem nome aparecem, em geral, em momentos específicos.

Em transições. Em instantes em que tu não estás a fazer nada demasiado exigente. Em pequenas pausas entre actividades.

[long pause]

E elas têm, frequentemente, um tom consistente.

[pause]

Algumas mulheres descobrem que as suas vontades sem nome apontam todas para movimento físico — caminhar, nadar, dançar.

Outras descobrem que apontam para criação — escrever, pintar, tocar.

Outras, para intimidade de outro tipo — conversas profundas, amizades novas, tempo sozinha.

Outras, para experiências sensoriais — luz, música, texturas, cheiros.

[short pause]

A tua tem tom específico.

E quando começas a registar, o tom torna-se visível.

[long pause]

A partir daí, podes começar a responder a estas vontades em pequenas doses.

[pause]

Não mudar a vida toda.

Apenas, quando reparares na vontade, responder uma vez, em pequena escala.

[short pause]

Se aponta para movimento, sai para caminhar cinco minutos.

Se aponta para criação, escreve duas linhas num caderno.

Se aponta para intimidade, manda mensagem a uma amiga.

Se aponta para experiência sensorial, põe música que gostas durante cinco minutos.

[long pause]

Estas pequenas respostas são treino.

[pause]

Estás a ensinar ao teu sistema interior que as suas vontades difusas são ouvidas.

[short pause]

E o teu sistema interior, quando percebe que é ouvido, começa a enviar mais sinais.

[pause]

E mais claros.

[long pause]

Ao fim de alguns meses deste treino, muitas mulheres descobrem que a sua capacidade de querer aumentou.

[pause]

Não só em vontades sem nome. Também em vontades nomeáveis.

[short pause]

Querem mais. Sentem mais. Decidem mais.

[pause]

A chama difusa, ao ser registada e respondida em pequenas doses, torna-se, devagar, chama mais clara e mais exigente.

[long pause]

E essa chama, em adulta, dirige muito mais do que a cama.

[pause]

Dirige o tom da tua vida.

[short pause]

Dirige as escolhas pequenas que, somadas, compõem a qualidade do teu tempo.

[pause]

E quando a tua vida inteira está alinhada com a tua chama — mesmo que em pequena escala — a tua chama sexual acende-se como consequência.

[short pause]

Não como objectivo.

Como resultado natural de estares finalmente a viver uma vida em que tu, também, queres alguma coisa.`,
      },
      {
        id: "a-chama-m7c",
        titulo: "M7.C — O prazer das pequenas coisas recuperado",
        curso: "a-chama",
        texto: `Há uma forma de prazer, em adulta, que não tem nada de sexual e que, ainda assim, é base da chama.

[pause]

O prazer das pequenas coisas.

[long pause]

O prazer da primeira chávena de café da manhã.

O prazer de uma conversa rápida com uma pessoa simpática na padaria.

O prazer de abrir uma janela e sentir o ar fresco no rosto.

O prazer de caminhar em passo próprio, sem pressa, por um caminho familiar.

O prazer de ler, deitada, uma página de um livro que gostas.

[pause]

Este prazer existia em ti, em grande quantidade, em algum momento da vida.

[short pause]

Provavelmente em criança.

[pause]

Tu, em criança, tinhas um acesso directo ao prazer das pequenas coisas que, em adulta, foste perdendo.

[long pause]

Em adulta, o teu cérebro aprendeu a não registar estas pequenas satisfações como prazer.

[pause]

Porque aprendeu, ao longo dos anos, a reservar o rótulo "prazer" para coisas grandes.

[short pause]

Férias. Festas. Compras especiais. Sexo. Refeições elaboradas.

[pause]

E o prazer quotidiano de uma chávena quente, de uma luz bonita, de um som bem colocado — foi ficando abaixo do limiar da tua atenção.

[long pause]

Esta perda é silenciosa mas tem custo grande.

[pause]

Porque o prazer quotidiano é a fundação sobre a qual os prazeres maiores se apoiam.

[short pause]

Mulheres que perderam contacto com os prazeres das pequenas coisas, em geral, também têm dificuldade com os grandes.

[pause]

Vão de férias e não conseguem estar completamente presentes.

Recebem uma prenda e sentem satisfação breve.

Têm sexo e registam como momento banal.

[short pause]

Porque o aparelho de registo de prazer, em ti, foi ficando desafinado por anos de não treino.

[long pause]

Esta semana, vais fazer um exercício de recalibração.

[pause]

Numa folha pequena que possas trazer contigo, escreve em cima:

"Pequenos prazeres de hoje."

[short pause]

E ao longo do dia, sempre que reparares num pequeno prazer, anotas.

[pause]

Não tens de fotografar. Não tens de elaborar. Uma linha chega.

[long pause]

Pode ser:

"A luz da manhã no chão da cozinha às sete e meia."

"O primeiro cheiro a café de hoje."

"O momento em que encontrei estacionamento em frente a casa."

"A sensação do lençol frio nos pés antes de adormecer ontem."

[short pause]

Cinco a dez entradas por dia.

[pause]

Durante sete dias.

[long pause]

Ao fim da semana, lê tudo em sequência.

[pause]

E repara numa coisa curiosa.

[short pause]

A quantidade de pequenos prazeres no teu dia — que antes passavam despercebidos — é muito maior do que tu pensavas.

[long pause]

Eles estavam sempre lá.

[pause]

Mas o teu aparelho de registo estava desligado.

[short pause]

Quando tu começas a registar, o aparelho reactiva.

[pause]

E os pequenos prazeres, registados, começam a contar.

[short pause]

Começam a dar densidade ao teu dia.

[long pause]

E a densidade de prazer quotidiano, acumulada ao longo das semanas, tem efeito específico.

[pause]

Mudas de qualidade interior.

[short pause]

A sensação difusa de que a tua vida "anda em baixo" — que muitas mulheres adultas têm — começa a diluir-se.

[pause]

Não porque a tua vida mudou.

Porque tu, pela primeira vez em anos, estás a registar o que de bom, em pequena dose, ela sempre teve.

[long pause]

E quando esta densidade de prazer pequeno se instala, o teu sistema inteiro fica mais receptivo aos prazeres maiores.

[pause]

Incluindo os prazeres sexuais, que antes pareciam distantes.

[short pause]

Porque a chama, afinal, não se reacende por força de vontade sexual.

[pause]

Reacende-se por recuperação da capacidade de sentires prazer — em todas as escalas, a começar pela mais pequena.

[long pause]

E essa recuperação começa em coisas aparentemente banais.

[pause]

Uma chávena quente. Uma janela aberta. Uma conversa sem pressa na padaria.

[short pause]

Tudo isto, junto, é base da chama.

[pause]

Não é acessório.

É a terra em que ela volta a crescer.`,
      },
    ],
  },
  {
    id: "curso-a-chama-m8",
    titulo: "Curso A Chama — Módulo 8 (Aulas A, B, C)",
    descricao: "A Chama Acesa.",
    scripts: [
      {
        id: "a-chama-m8a",
        titulo: "M8.A — A mulher que tem desejo em adulta",
        curso: "a-chama",
        texto: `A mulher que tem desejo em adulta não é a que tem desejo constante.

[pause]

Não é a que está sempre disponível.

Não é a que responde ao parceiro com entusiasmo automático em qualquer situação.

[long pause]

A mulher que tem desejo em adulta é outra coisa, mais real.

[pause]

É a mulher que conhece o próprio ritmo.

[short pause]

Sabe quando tem. Sabe quando não tem. Sabe quando está no meio.

[pause]

E, sobretudo, respeita estas três estações dentro de si.

[long pause]

Esta mulher tem, à sua disposição, uma qualidade que a maior parte das mulheres adultas perdeu.

[pause]

Escuta interior.

[short pause]

Ela sabe o que o seu corpo pede em cada semana porque, ao longo dos meses, treinou-se a perguntar.

[long pause]

Em semanas de cansaço acumulado, sabe que o que precisa é descanso e colo — não sexo.

[pause]

Em semanas de tensão profissional, sabe que o desejo pode simplesmente não aparecer — e que isso é biologia normal, não falha pessoal.

[short pause]

Em semanas em que, por algum motivo, o corpo pede mais — ela reconhece, ela comunica, ela vive.

[long pause]

Esta mulher não está em permanente negociação interna sobre se devia ou não devia desejar.

[pause]

Esse debate foi resolvido nela.

[short pause]

Ela desejar ou não desejar é informação, não problema.

[pause]

E o parceiro, quando ela tem parceiro, aprende a ler essa informação.

[long pause]

Aprende que a ausência de desejo de uma semana não é rejeição pessoal.

Aprende que a presença de desejo numa tarde inesperada não é pressão sua.

Aprende a acompanhar, em vez de exigir.

[short pause]

Esta mulher, na relação, deixa de ter vida sexual avaliada por métricas quantitativas — quantas vezes por semana, quantas por mês.

[pause]

Passa a ter vida sexual avaliada por métricas qualitativas — presença, comunicação, satisfação real.

[long pause]

E as métricas qualitativas, ao contrário das quantitativas, toleram flutuação.

[pause]

Porque entendem que a vida adulta de uma mulher não é linear.

[short pause]

Tem anos intensos. Anos leves. Anos em que, por razões várias, o corpo pede pausa.

[pause]

Todos são vida real.

[long pause]

Esta é, em última análise, a mulher que este curso quer ajudar a construir em ti.

[pause]

Não a mulher sexualmente disponível.

[short pause]

A mulher sexualmente presente.

[pause]

Presente no que sente. Presente no que pede. Presente no que recusa. Presente em cada encontro — ou ausência de encontro — com alguma forma de consciência.

[long pause]

Esta semana, vais escrever o primeiro esboço desta mulher em ti.

[pause]

Numa folha, escreve em cima:

"A mulher que eu estou a tornar-me em relação ao meu desejo."

[short pause]

E escreve, em termos próprios, o que reconheces que já mudou — ou que está a mudar — em ti ao longo deste curso.

[long pause]

Pode ser pouco.

[pause]

Pode ser:

"Comecei a reparar nos sinais pequenos do meu desejo em vez de os descartar."

"Dei-me permissão escrita para o meu prazer próprio."

"Iniciei uma conversa com uma amiga sobre este tema pela primeira vez."

"Tive iniciativa com o meu parceiro pela primeira vez em meses."

"Identifiquei as frases antigas que ainda me dirigem."

[short pause]

Três a cinco linhas chegam.

[pause]

E no fim da folha, escreve uma última linha:

"A mulher que estou a tornar-me é, em comparação com a que eu era há três meses, ligeiramente mais —"

E completa.

[long pause]

Podes descobrir que completas com palavras pequenas.

[pause]

Atenta.

Honesta.

Presente.

Livre.

[short pause]

Qualquer uma destas palavras, verdadeira para ti, é sinal do trabalho a operar.

[pause]

A mulher com desejo em adulta não chega numa semana.

Não chega num curso.

[short pause]

Chega, devagar, em meses e anos de trabalho silencioso.

[pause]

E tu, agora, estás nesse caminho.

[long pause]

Isto, só por si, é muito.`,
      },
      {
        id: "a-chama-m8b",
        titulo: "M8.B — O que muda quando tu passas a escolher",
        curso: "a-chama",
        texto: `Há um momento, em algumas mulheres adultas, em que tudo começa a mudar.

[pause]

Não muda no corpo.

Muda dentro.

[long pause]

Muda no facto de tu, pela primeira vez em anos, começares a escolher.

[pause]

A escolher o que queres comer, sem cálculo.

A escolher quando queres sexo, sem obrigação.

A escolher o que queres fazer num domingo, sem ter de justificar a toda a gente.

A escolher, em pequenas doses, em vez de reagir a tudo o que te é pedido.

[short pause]

Esta mudança, vista de fora, parece pequena.

[pause]

Mas, vivida de dentro, muda tudo.

[long pause]

Porque a mulher que não escolhe, em geral, é mulher que reage.

[pause]

Alguém pede, ela responde.

Alguém sugere, ela aceita.

Alguém precisa, ela cede.

[short pause]

E a sua vida inteira é composta de respostas a pedidos de outros — não de decisões próprias.

[long pause]

A chama, em mulher que reage, tem pouco espaço.

[pause]

Porque o desejo próprio precisa de ter tempo para se formar.

E numa vida totalmente reactiva, esse tempo não existe.

[short pause]

Tu, ao longo deste curso, começaste a fazer pequenas coisas diferentes.

[pause]

A perguntar ao teu corpo o que ele gostaria.

A registar os sinais que antes descartavas.

A comer uma refeição sem cálculo.

A tirar a balança do lugar habitual.

A dar-te permissão escrita para alguma coisa.

A ter iniciativa num momento em que antes esperarias.

[long pause]

Cada um destes gestos é, no fundo, um acto de escolha.

[pause]

Tu, num pequeno momento, escolheste. Em vez de reagir.

[short pause]

E a escolha, mesmo em pequena escala, tem efeito acumulativo.

[pause]

Porque ensina ao teu sistema interior que tu, aqui, tens agência.

[long pause]

Ao fim de alguns meses deste trabalho, muitas mulheres descrevem a mesma coisa.

[pause]

"Sinto-me mais dona da minha vida."

[short pause]

Não é que a sua vida tenha mudado radicalmente.

[pause]

É que a sua relação com a própria vida mudou.

[short pause]

Deixaram de viver por omissão.

Começaram a viver por presença.

[long pause]

E esta mudança, no longo prazo, repercute-se em todas as áreas.

[pause]

Na relação — porque se tornam parceiras mais interessantes, com opinião, com desejo próprio, com capacidade de pedir.

No trabalho — porque param de aceitar tudo e começam a escolher o que realmente querem fazer.

Nas amizades — porque deixam de se manter em relações por hábito e começam a investir nas que nutrem.

Na saúde — porque param de se descuidar e começam a responder aos sinais que o corpo dá.

[short pause]

E no desejo — porque, finalmente, têm estrutura interior para o exercer.

[long pause]

Esta semana, vais fazer um exercício pequeno de reconhecimento.

[pause]

Numa folha, escreve em cima:

"Coisas que eu, nos últimos meses, comecei a escolher em vez de reagir."

[short pause]

E escreve o que reconheces.

[pause]

Pode ser:

"Comecei a escolher quando digo sim e quando digo não a pedidos de família."

"Comecei a escolher a hora de ir para a cama em função de mim, não dos outros."

"Comecei a escolher quando tenho iniciativa sexual em vez de esperar sempre."

"Comecei a escolher o que comer em função do meu corpo, não das dietas antigas."

[long pause]

Três a cinco linhas chegam.

[pause]

E depois uma última linha:

"Antes de começar a escolher, a minha vida era — Agora, é — "

[short pause]

Completa.

[pause]

Podes descobrir que a diferença, embora subtil, é imensa.

[long pause]

A mulher que escolhe tem chama.

Mesmo que, em algumas semanas, a chama esteja baixa.

[pause]

Porque a chama não é intensidade constante.

É a qualidade geral de quem dirige a sua própria vida.

[short pause]

E a mulher que dirige, mesmo em pequena escala, tem sempre, algures em si, fogo a arder.`,
      },
      {
        id: "a-chama-m8c",
        titulo: "M8.C — A relação possível com a tua chama",
        curso: "a-chama",
        texto: `Este curso acaba.

[pause]

E tu continuas nele.

[long pause]

Não vais sair daqui com a chama constantemente acesa.

[pause]

Não era esse o objectivo.

[short pause]

Vais sair com instrumentos que não tinhas há oito módulos — e, sobretudo, com uma forma nova de olhar para ti mesma nesta zona da vida.

[long pause]

Antes de fechar, vamos fazer um inventário.

[pause]

Não de futuro imaginado.

De presente real — o que tu, ao longo destes oito módulos, aprendeste a fazer.

[short pause]

Pega numa folha. Escreve em cima:

"Antes deste curso, eu não sabia —"

[long pause]

E vai escrevendo, devagar, à medida que reconheces.

[pause]

Não sabia notar os sinais pequenos do meu desejo que apareciam ao longo do dia.

Não tinha mapa das frases antigas que ainda dirigem a minha relação com prazer.

Não tinha dado a mim mesma permissão escrita para o meu prazer próprio.

Não tinha identificado os sítios do corpo onde aprendi, ao longo dos anos, a não sentir.

Não tinha tido, com uma amiga, uma conversa a sério sobre este tema.

Não tinha percebido que a minha chama se reanima por coisas que não têm nada a ver com sexo — pequenos prazeres, vontades sem nome, entusiasmos antigos.

Não sabia que escolher, em pequena escala, é base da capacidade de desejar.

[short pause]

Vai escrevendo o que for verdadeiro para ti.

Algumas linhas. Não muitas. As que importam.

[long pause]

Quando acabares, lê em voz baixa, para ti.

[pause]

E repara numa coisa.

[short pause]

Cada linha desta lista é um instrumento.

[pause]

Não é frase motivacional. Não é revelação passageira. É hábito novo, pequeno, instalado em ti ao longo de oito módulos de trabalho silencioso.

[long pause]

A mulher em paz com a sua chama não é versão idealizada que aparece daqui a dois anos.

[pause]

É a soma dos pequenos hábitos que tu, ao longo dos meses, vais continuando a praticar depois deste curso terminar.

[short pause]

É a mulher que continua a perguntar ao corpo, antes de reagir, o que ele quer.

A mulher que continua a registar os sinais pequenos em vez de os descartar.

A mulher que continua a dar-se permissão, em pequenos momentos, para exercer prazer sem pedir autorização a ninguém.

[long pause]

Esta mulher não chega.

Constrói-se em cada gesto pequeno repetido.

[pause]

E tu, neste momento, és exactamente isso — uma mulher a meio dessa construção.

[short pause]

Não no fim.

A meio.

[long pause]

A relação possível com a tua chama não é a de a ter sempre alta.

[pause]

É a de saber onde ela está — em cada semana, em cada fase — e de respeitar o que ela te diz.

[short pause]

Semanas em que está baixa pedem descanso, não esforço.

Semanas em que está alta pedem expressão, não desperdício em obrigações.

Semanas no meio pedem atenção, para que tu saibas, com precisão, em que fase estás.

[long pause]

A mulher que tem esta relação com a sua chama não é submetida a ela.

[pause]

Nem a reprime.

Nem a persegue em excesso.

[short pause]

Vive com ela como vive com qualquer outro ritmo interior importante.

[pause]

Com respeito, com presença, com escuta.

[long pause]

E essa escuta, ao longo dos anos, é o que mantém a chama viva em mulher adulta.

[pause]

Não a intensidade constante.

A presença fiel.

[short pause]

A tua chama não vai estar sempre alta.

Mas vai estar sempre em ti.

[pause]

E tu, agora, sabes como a procurar quando ela parece estar longe, como a acolher quando ela aparece, e como respeitar as suas pausas naturais sem interpretar essas pausas como falha.

[long pause]

Este curso acaba. Os instrumentos ficam.

[pause]

Cada vez que pegas num deles, mesmo sem te lembrares deste curso, estás a continuar o trabalho.

[short pause]

A tua chama é tua. A tua casa é tua. Os instrumentos para a cuidar agora também.

[pause]

E o que vier a seguir não é transformação prometida.

É o que tu, com estes instrumentos na mão, fizeres todos os dias quando ninguém estiver a ver.

[long pause]

Bem-vinda a ti mesma.

[pause]

Outra vez.

[short pause]

Desta vez, em pleno dia.

[pause]

Em adulta.

Com olhos abertos.

E com chama — mesmo que devagar — acesa.`,
      },
    ],
  },
];
