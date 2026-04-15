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
];
