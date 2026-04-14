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

Tem nome.

Chama-se vergonha.

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

Tem nome.

Chama-se o desconto automático.

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

Tem nome.

Chama-se falta de presença. Falta de pertença. Falta de permissão para ser quem és quando ninguém está a ver.

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

Tem nome.

Chama-se o sim automático. O sim que já existia antes da pergunta. O sim que aprendeste em cada vez que a tua hesitação foi interpretada como rudeza. Em cada vez que alguém ficou zangado contigo por tu teres precisado de tempo. Em cada vez que foi mais fácil concordar do que explicar.

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

Tem nome o que aprendeste.

Chama-se silêncio que mantém a ordem.

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

Tem nome o que aprendeste.

Chama-se vergonha do corpo sem vestido.

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

Tem nome o que cresceu em ti.

Chama-se a vigilância precoce do próprio corpo.

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

Tem nome o que sentes.

Chama-se luto de uma versão de ti que não aconteceu.

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

Tem nome esta fome.

Chama-se fome emocional.

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

Tem nome o que a tua boca faz.

Chama-se o único pedido que aprendeste a fazer sem vergonha.

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
];
