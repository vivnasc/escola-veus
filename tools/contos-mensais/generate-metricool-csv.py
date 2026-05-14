#!/usr/bin/env python3
"""
Gerador de CSV de bulk upload para Metricool — série Trinta Manhãs (Junho 2026).

Produz:
  - docs/contos-mensais/MES-01-JUNHO-2026-METRICOOL.csv  (formato Metricool)
  - docs/contos-mensais/MES-01-JUNHO-2026-METRICOOL-LONG.csv  (formato genérico com texto completo IG/FB)

Uso:
  python3 tools/contos-mensais/generate-metricool-csv.py

Formato do Metricool (importação manual via Planner > Importar):
  date, time, network, text, link, media_filename

Notas:
  - Hora IG/TT/YT: 07:30 Europe/Lisbon
  - Hora Facebook: 08:30 Europe/Lisbon
  - Link em todas as plataformas: seteveus.space
  - O `media_filename` aponta para o ficheiro de vídeo final que será renderizado.
    Convenção: trinta-manhas-cap-{NN}.mp4
"""
from __future__ import annotations

import csv
from pathlib import Path
from datetime import date, timedelta

LINK = "seteveus.space"
HASHTAGS_FIXAS = "#TrintaManhas #EscolaDosVeus #ContoDiario #LiteraturaCurta #PortugalLiterario"

REPO_ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = REPO_ROOT / "docs" / "contos-mensais"

# 30 capítulos: (cap_n, dia_semana, véu, hashtags_veu, copy_ig_fb, copy_tiktok, yt_title, yt_desc)
CAPITULOS = [
    (1, "Seg", "Permanencia",
     "#Permanencia #ManhaCedo #LerNoCelular",
     "Acordou às quatro e treze.\n\nNão foi o telemóvel.\nNão foi um som.\n\nFoi como se alguém tivesse aberto a porta — e fechado outra vez.\n\nCap. 1 de 30 · Trinta Manhãs\n\nContinua amanhã. seteveus.space",
     "Acordou às 4:13. Sem motivo.\n\nCap. 1 de 30 · Trinta Manhãs\nseteveus.space",
     "Trinta Manhãs · 1/30 · Acordou às 4:13",
     "Cap. 1 de um conto em 30 manhãs de Junho. seteveus.space"),
    (2, "Ter", "Memoria",
     "#Memoria #CartaAntiga #Maes",
     "Procurava um carregador.\n\nEncontrou uma carta da mãe.\nLetra antiga. Dezassete anos.\n\nPesou-a na mão. Não pesava nada.\nVoltou a fechar a gaveta.\n\nCap. 2 de 30 · Trinta Manhãs\n\nContinua amanhã. seteveus.space",
     "Encontrou uma carta da mãe.\nNão a abriu.\n\nCap. 2 de 30 · Trinta Manhãs\nseteveus.space",
     "Trinta Manhãs · 2/30 · A carta na gaveta",
     "Procurava um carregador. Encontrou outra coisa. seteveus.space"),
    (3, "Qua", "Turbilhao",
     "#Turbilhao #Silencio #Mindfulness",
     "A chaleira começou a apitar.\n\nEla ficou na cadeira.\nDisse a si mesma: agora levanto.\n\nNão se levantou.\nA chaleira apitou até parar sozinha.\n\nCap. 3 de 30 · Trinta Manhãs\n\nContinua amanhã. seteveus.space",
     "A chaleira apitou até parar sozinha.\nA cabeça também.\n\nCap. 3 de 30 · Trinta Manhãs\nseteveus.space",
     "Trinta Manhãs · 3/30 · A chaleira que apitou sozinha",
     "Quando o som parou, ela percebeu. seteveus.space"),
    (4, "Qui", "Esforco",
     "#Esforco #Pais #Descanso",
     "A cadeira do pai estava sempre vazia.\n\nHoje, sem perceber porquê,\nsentou-se nela.\n\nPensou: descanso quando isto acalmar.\nE ficou.\n\nO chá ficou frio.\nEla não.\n\nCap. 4 de 30 · Trinta Manhãs\n\nContinua amanhã. seteveus.space",
     "\"Descanso quando isto acalmar.\"\n\nE ficou na cadeira.\n\nCap. 4 de 30 · Trinta Manhãs\nseteveus.space",
     "Trinta Manhãs · 4/30 · A cadeira vazia",
     "Descansar agora, não depois. seteveus.space"),
    (5, "Sex", "Desolacao",
     "#Desolacao #Solidao #SextaFeira",
     "A amiga cancelou.\nO outro nunca chegou a confirmar.\n\nPensou que ia sentir pena.\nNão sentiu.\n\nO vazio cheirava a terra molhada.\nA vasos por regar. A chuva nova.\n\nAlgo ali ia nascer.\n\nCap. 5 de 30 · Trinta Manhãs\n\nContinua amanhã. seteveus.space",
     "Os planos caíram.\nO vazio cheirava a terra molhada.\n\nCap. 5 de 30 · Trinta Manhãs\nseteveus.space",
     "Trinta Manhãs · 5/30 · O vazio que cheira a chuva",
     "Quando os planos caem. seteveus.space"),
    (6, "Sab", "Horizonte",
     "#Horizonte #SabadoDeManha #VidaQuotidiana",
     "A mesma colina ao longe.\nJá a tinha visto quatro mil vezes.\n\nHoje, sem decidir, olhou.\n\nTinha duas cores.\nUma do sol. Outra da sombra.\n\nA vida não estava depois.\nEstava ali.\n\nCap. 6 de 30 · Trinta Manhãs\n\nContinua amanhã. seteveus.space",
     "A vida não estava depois.\nEstava ali.\n\nCap. 6 de 30 · Trinta Manhãs\nseteveus.space",
     "Trinta Manhãs · 6/30 · A colina de duas cores",
     "Quatro mil vezes. Hoje, viu. seteveus.space"),
    (7, "Dom", "Dualidade",
     "#Dualidade #PaoCaseiro #Domingo",
     "Domingo.\nFez pão pela primeira vez em anos.\n\nAs mãos eram quentes.\nA massa fria.\n\nPor minutos inteiros,\nnão estava separada de nada.\n\nCap. 7 de 30 · Trinta Manhãs\n\nContinua amanhã. seteveus.space",
     "As mãos e a massa.\nA mesma coisa.\n\nCap. 7 de 30 · Trinta Manhãs\nseteveus.space",
     "Trinta Manhãs · 7/30 · As mãos na massa",
     "Domingo. Pão. Silêncio. seteveus.space"),
    (8, "Seg", "Permanencia",
     "#Permanencia #Insonia #Reparar",
     "Segunda.\nQuatro e treze. Outra vez.\n\nDesta vez não se assustou.\n\nA casa estava igual.\nMas alguma coisa nela\nnão estava.\n\nCap. 8 de 30 · Trinta Manhãs\n\nContinua amanhã. seteveus.space",
     "Sete dias depois.\nJá não se assusta.\n\nCap. 8 de 30 · Trinta Manhãs\nseteveus.space",
     "Trinta Manhãs · 8/30 · A segunda vez às 4:13",
     "Já não estranha a casa. seteveus.space"),
    (9, "Ter", "Memoria",
     "#Memoria #CartasDaMae #Heranca",
     "Voltou à gaveta.\nTirou a carta.\n\nDemorou três minutos a abrir o envelope.\n\nA última linha dizia:\n\"espero que tenhas aprendido a parar.\"\n\nDezassete anos depois,\nainda estava a aprender.\n\nCap. 9 de 30 · Trinta Manhãs\n\nContinua amanhã. seteveus.space",
     "\"Espero que tenhas aprendido a parar.\"\n— Mãe, há 17 anos.\n\nCap. 9 de 30 · Trinta Manhãs\nseteveus.space",
     "Trinta Manhãs · 9/30 · A carta aberta",
     "Dezassete anos depois. seteveus.space"),
    (10, "Qua", "Turbilhao",
     "#Turbilhao #Respiracao #Calma",
     "A chaleira apitou.\nHoje respirou com ela.\n\nInspirou na subida.\nExpirou na descida.\n\nA cabeça não acalma\nquando se manda calar.\nAcalma quando se respira ao lado dela.\n\nCap. 10 de 30 · Trinta Manhãs\n\nContinua amanhã. seteveus.space",
     "Respirou ao ritmo da chaleira.\nA cabeça acalmou.\n\nCap. 10 de 30 · Trinta Manhãs\nseteveus.space",
     "Trinta Manhãs · 10/30 · Respirar com a chaleira",
     "Acalma ao lado, não por cima. seteveus.space"),
    (11, "Qui", "Esforco",
     "#Esforco #Lisboa #Cidades",
     "Autocarro das 8:14.\n\nUma mulher mais velha\nlevanta-se para deixar\num homem cansado sentar.\n\nA gente ainda sabe\ndescansar uns aos outros.\n\nÉ a única coisa\nque aguenta as cidades.\n\nCap. 11 de 30 · Trinta Manhãs\n\nContinua amanhã. seteveus.space",
     "Ainda sabemos\ndescansar uns aos outros.\n\nCap. 11 de 30 · Trinta Manhãs\nseteveus.space",
     "Trinta Manhãs · 11/30 · O lugar cedido",
     "O que aguenta as cidades. seteveus.space"),
    (12, "Sex", "Desolacao",
     "#Desolacao #MercadoLocal #Vizinhanca",
     "Mercado ao fim do dia.\nTrês peras numa banca quase arrumada.\n\n\"Leva. São as últimas. Dou-tas.\"\n\nEm casa, mordeu uma.\nA casca rasgada.\nA polpa ainda doce.\n\nAs coisas amassadas\ncontinuam doces\nse ninguém as deitar fora cedo demais.\n\nCap. 12 de 30 · Trinta Manhãs\n\nContinua amanhã. seteveus.space",
     "As coisas amassadas\ncontinuam doces.\n\nCap. 12 de 30 · Trinta Manhãs\nseteveus.space",
     "Trinta Manhãs · 12/30 · Três peras quase no fim",
     "O que ainda é doce. seteveus.space"),
    (13, "Sab", "Horizonte",
     "#Horizonte #Caminhadas #Sabedoria",
     "Caminhada longa.\nUm homem velho sentado numa pedra.\n\n— Está à espera de quê?\n— Não estou à espera. Estou só.\n\nLevou a frase a casa.\n\nCap. 13 de 30 · Trinta Manhãs\n\nContinua amanhã. seteveus.space",
     "— Está à espera de quê?\n— Não estou à espera. Estou só.\n\nCap. 13 de 30 · Trinta Manhãs\nseteveus.space",
     "Trinta Manhãs · 13/30 · \"Estou só.\"",
     "O homem da pedra. seteveus.space"),
    (14, "Dom", "Dualidade",
     "#Dualidade #Maes #Familia",
     "Domingo. Ligou à mãe.\n\nFalaram do tempo.\nDa sopa.\n\n— Estou bem, mãe.\n— Eu sei, filha.\n\nDez segundos de silêncio.\nSem sentir o silêncio.\n\nNada para resolver.\nSó presença.\n\nCap. 14 de 30 · Trinta Manhãs\n\nContinua amanhã. seteveus.space",
     "— Estou bem, mãe.\n— Eu sei, filha.\n\nCap. 14 de 30 · Trinta Manhãs\nseteveus.space",
     "Trinta Manhãs · 14/30 · A chamada sem motivo",
     "Dez segundos de silêncio. seteveus.space"),
    (15, "Seg", "Permanencia",
     "#Permanencia #Madrugada #Cidade",
     "4:13.\nHoje sem peso.\n\nÀ janela.\nA cidade ainda dormia.\n\nNão estava sozinha.\nEstava acordada com a cidade.\n\nQuando o céu aclarou,\npercebeu que estava a sorrir.\nSem motivo.\n\nCap. 15 de 30 · Trinta Manhãs\n\nContinua amanhã. seteveus.space",
     "Não estava sozinha.\nEstava acordada com a cidade.\n\nCap. 15 de 30 · Trinta Manhãs\nseteveus.space",
     "Trinta Manhãs · 15/30 · A cidade que respira",
     "Metade do caminho. seteveus.space"),
    (16, "Ter", "Memoria",
     "#Memoria #Amizades #ReencontrarSe",
     "Mensagem de uma amiga antiga.\nSeis anos depois.\n\n\"Lembras-te?\"\n\nLembrava.\n\nNão respondeu logo.\nO coração não tinha fechado.\nSó estava a aprender\noutra forma de responder.\n\nCap. 16 de 30 · Trinta Manhãs\n\nContinua amanhã. seteveus.space",
     "\"Lembras-te?\"\n\nLembrava.\nMas hoje respondia diferente.\n\nCap. 16 de 30 · Trinta Manhãs\nseteveus.space",
     "Trinta Manhãs · 16/30 · A mensagem antiga",
     "Outra forma de responder. seteveus.space"),
    (17, "Qua", "Turbilhao",
     "#Turbilhao #Produtividade #Trabalho",
     "Seis da tarde.\nA lista de tarefas: igual.\n\n\"Hoje não fiz nada.\"\n\nMas alguma coisa tinha acontecido.\nAlgures por baixo.\n\nUma decisão pequena.\nUma frase que não disse.\nUm pedido recusado com calma.\n\nNão tudo é lista.\n\nCap. 17 de 30 · Trinta Manhãs\n\nContinua amanhã. seteveus.space",
     "\"Hoje não fiz nada.\"\nMas alguma coisa aconteceu.\n\nCap. 17 de 30 · Trinta Manhãs\nseteveus.space",
     "Trinta Manhãs · 17/30 · Não tudo é lista",
     "O que acontece por baixo. seteveus.space"),
    (18, "Qui", "Esforco",
     "#Esforco #Caminhar #DescansoAtivo",
     "Saiu à rua sem destino.\nMeia hora.\n\nCumprimentou um cão.\nNão entrou no café.\n\nVoltou.\n\nNão fez nada.\nE fez tudo.\n\nA diferença não estava no relógio.\nEstava em quem voltou.\n\nCap. 18 de 30 · Trinta Manhãs\n\nContinua amanhã. seteveus.space",
     "Saiu sem destino.\nVoltou sem culpa.\n\nCap. 18 de 30 · Trinta Manhãs\nseteveus.space",
     "Trinta Manhãs · 18/30 · Meia hora sem destino",
     "Quem voltou. seteveus.space"),
    (19, "Sex", "Desolacao",
     "#Desolacao #Luto #Velas",
     "Acendeu uma vela velha.\n\nNão rezou.\nNão pediu.\n\nSentou-se em frente.\nFicou até o pavio se apagar.\n\nA paz não vinha depois do choro.\nVinha da presença.\n\nCap. 19 de 30 · Trinta Manhãs\n\nContinua amanhã. seteveus.space",
     "Acendeu uma vela.\nFicou até se apagar.\n\nCap. 19 de 30 · Trinta Manhãs\nseteveus.space",
     "Trinta Manhãs · 19/30 · A vela e a hora",
     "A paz da presença. seteveus.space"),
    (20, "Sab", "Horizonte",
     "#Horizonte #Solsticio #Verao",
     "Solstício.\nDia mais longo do ano.\n\nFoi à mercearia.\nLavou roupa.\nEstendeu na varanda.\n\nÀ noite, a luz ainda era de tarde.\n\nO sol não tinha pressa.\n\"Porque é que eu tenho.\"\n\nAlgo dentro dela\ntambém demorou mais hoje.\n\nCap. 20 de 30 · Trinta Manhãs\n\nContinua amanhã. seteveus.space",
     "O sol não tinha pressa.\n\"Porque é que eu tenho.\"\n\nCap. 20 de 30 · Trinta Manhãs\nseteveus.space",
     "Trinta Manhãs · 20/30 · Solstício",
     "Dois terços. seteveus.space"),
    (21, "Dom", "Dualidade",
     "#Dualidade #Jardim #DomingoLento",
     "Domingo. Banco do jardim. Livro aberto.\n\nUma criança a correr atrás de um pombo.\nA mãe a levantar os olhos do telemóvel.\n\nO livro e a criança\nsão o mesmo domingo.\n\nEu estou nos dois.\n\nCap. 21 de 30 · Trinta Manhãs\n\nContinua amanhã. seteveus.space",
     "O livro e a criança\nsão o mesmo domingo.\n\nCap. 21 de 30 · Trinta Manhãs\nseteveus.space",
     "Trinta Manhãs · 21/30 · Livro e criança",
     "Estar nos dois. seteveus.space"),
    (22, "Seg", "Permanencia",
     "#Permanencia #Espelhos #VerSe",
     "O espelho estava limpo.\n\nNão se lembrava de o ter limpado.\nNão havia pano por perto.\n\nOlhou.\nA mesma cara.\n\nMas a poeira fina\nde há semanas\ntinha-se ido.\n\nÀs vezes não é preciso limpar.\nÉ preciso olhar.\n\nCap. 22 de 30 · Trinta Manhãs\n\nContinua amanhã. seteveus.space",
     "O espelho ficou limpo\nsem ela ter limpado.\n\nCap. 22 de 30 · Trinta Manhãs\nseteveus.space",
     "Trinta Manhãs · 22/30 · O espelho que se limpou",
     "Olhar de outra forma. seteveus.space"),
    (23, "Ter", "Memoria",
     "#Memoria #Amizades #Retomar",
     "Sete dias depois,\nrespondeu à amiga.\n\nTrês frases.\n\n\"Hesitei.\nLembrei-me de ti.\nEstou aqui.\"\n\nEla respondeu sete minutos depois.\nUma palavra:\n\"também.\"\n\nFoi suficiente.\n\nCap. 23 de 30 · Trinta Manhãs\n\nContinua amanhã. seteveus.space",
     "\"Hesitei.\nLembrei-me de ti.\nEstou aqui.\"\n\n— \"também.\"\n\nCap. 23 de 30 · Trinta Manhãs\nseteveus.space",
     "Trinta Manhãs · 23/30 · Três frases",
     "Recolocar a mão na corda. seteveus.space"),
    (24, "Qua", "Turbilhao",
     "#Turbilhao #Cozinha #Presenca",
     "Chaleira. Apito. Respiração.\n\nHoje a cozinha não tinha mente nenhuma.\n\nSó água, gás, vapor, mãos.\n\nNão foi meditação.\nFoi cozinha.\n\nCap. 24 de 30 · Trinta Manhãs\n\nContinua amanhã. seteveus.space",
     "Não foi meditação.\nFoi cozinha.\n\nCap. 24 de 30 · Trinta Manhãs\nseteveus.space",
     "Trinta Manhãs · 24/30 · Cozinha sem mente",
     "Quietude na chávena. seteveus.space"),
    (25, "Qui", "Esforco",
     "#Esforco #DizerNao #Limites",
     "Pequeno pedido.\nGrande por dentro.\n\nHá um mês teria dito sim.\nHoje, parou.\n\n\"Não posso.\nObrigada por pensares em mim.\"\n\nA pessoa: \"tudo bem.\"\n\nO mundo não caiu.\nOs ombros desceram um centímetro.\n\nCap. 25 de 30 · Trinta Manhãs\n\nContinua amanhã. seteveus.space",
     "Disse \"não\".\nSem explicar.\n\nO mundo não caiu.\n\nCap. 25 de 30 · Trinta Manhãs\nseteveus.space",
     "Trinta Manhãs · 25/30 · O não que não caiu",
     "Um centímetro de ombro. seteveus.space"),
    (26, "Sex", "Desolacao",
     "#Desolacao #Chuva #Verao",
     "Primeira chuva depois de semanas.\n\nAs pessoas a correr.\nEla ficou.\n\nSaiu para a varanda.\nSem casaco.\n\nEm segundos estava molhada.\nNão correu. Riu-se.\n\nVoltou para dentro a pingar.\nNão secou logo.\n\nCap. 26 de 30 · Trinta Manhãs\n\nContinua amanhã. seteveus.space",
     "Choveu.\nEla não correu.\nRiu-se.\n\nCap. 26 de 30 · Trinta Manhãs\nseteveus.space",
     "Trinta Manhãs · 26/30 · Sete minutos de chuva",
     "Não fugir. seteveus.space"),
    (27, "Sab", "Horizonte",
     "#Horizonte #SabadoLento #SemPressa",
     "Decidiu não decidir.\n\nSem agenda.\nSem plano.\n\nOlhou pela janela.\nSaiu. Voltou.\nLeu. Cozinhou.\nFalou com a vizinha sobre flores.\n\nCinco horas\nsem olhar o relógio.\n\nO dia chegou na mesma.\n\nCap. 27 de 30 · Trinta Manhãs\n\nContinua amanhã. seteveus.space",
     "Não fez planos.\nO dia chegou na mesma.\n\nCap. 27 de 30 · Trinta Manhãs\nseteveus.space",
     "Trinta Manhãs · 27/30 · O dia sem plano",
     "Sem empurrar nem puxar. seteveus.space"),
    (28, "Dom", "Dualidade",
     "#Dualidade #Corpo #Chao",
     "Deitou-se no chão de madeira.\nSem motivo.\n\nAs costas reconheceram a casa.\n\n\"O frio do chão\ntambém sou eu.\"\n\nNão no sentido místico.\nNo sentido óbvio.\n\nCap. 28 de 30 · Trinta Manhãs\n\nContinua amanhã. seteveus.space",
     "\"O frio do chão\ntambém sou eu.\"\n\nCap. 28 de 30 · Trinta Manhãs\nseteveus.space",
     "Trinta Manhãs · 28/30 · Chão de madeira",
     "O corpo e a casa. seteveus.space"),
    (29, "Seg", "Fechamento",
     "#Espelho #VerSe #Penultimo",
     "Segunda. Seis da manhã.\nO corpo escolheu.\n\nNo corredor,\num espelho coberto há anos.\n\nTirou o pano.\n\nA mesma cara.\nDiferente.\n\nNão mais nova.\nNão mais bonita.\nMais sua.\n\nCap. 29 de 30 · Trinta Manhãs\n\nContinua amanhã. seteveus.space",
     "Tirou o pano do espelho.\n\nA mesma cara.\nMais sua.\n\nCap. 29 de 30 · Trinta Manhãs\nseteveus.space",
     "Trinta Manhãs · 29/30 · O pano que caiu",
     "Penúltima. seteveus.space"),
    (30, "Ter", "Inteireza",
     "#Final #Inteireza #Junho",
     "Última terça-feira de Junho.\n\nPôs a chaleira.\nVerteu a água.\nSentou-se à mesa.\n\nA gaveta com a carta: fechada.\nO espelho do corredor: destapado.\n\nNão prometeu nada para amanhã.\nMas sabia que amanhã ia chegar.\n\nCap. 30 de 30 · Trinta Manhãs · Fim\n\nRecomeça amanhã. seteveus.space",
     "Última manhã de Junho.\n\nNão prometeu nada.\nSabia que amanhã ia chegar.\n\nCap. 30 de 30 · Fim\nseteveus.space",
     "Trinta Manhãs · 30/30 · A última manhã",
     "Fim. Recomeça. seteveus.space"),
]


def build_rows():
    """Gera 120 linhas: 4 plataformas × 30 dias."""
    start = date(2026, 6, 1)
    rows = []
    for entry in CAPITULOS:
        cap_n, _dow, _veu, hashtags_veu, copy_ig, copy_tt, yt_title, yt_desc = entry
        d = start + timedelta(days=cap_n - 1)
        date_str = d.isoformat()
        media = f"trinta-manhas-cap-{cap_n:02d}.mp4"
        hashtags_all = f"{HASHTAGS_FIXAS} {hashtags_veu}"

        # Instagram Reels — 07:30
        ig_text = f"{copy_ig}\n\n{hashtags_all}"
        rows.append({
            "date": date_str, "time": "07:30", "network": "Instagram",
            "text": ig_text, "link": LINK, "media": media,
        })

        # TikTok — 07:30
        tt_text = f"{copy_tt}\n\n{hashtags_all}"
        rows.append({
            "date": date_str, "time": "07:30", "network": "TikTok",
            "text": tt_text, "link": LINK, "media": media,
        })

        # YouTube Shorts — 07:30 — usa título + descrição + hashtags
        yt_text = f"{yt_title}\n\n{yt_desc}\n\n{hashtags_all}"
        rows.append({
            "date": date_str, "time": "07:30", "network": "YouTube",
            "text": yt_text, "link": LINK, "media": media,
        })

        # Facebook — 08:30 — mesma copy de IG
        fb_text = f"{copy_ig}\n\n{hashtags_all}"
        rows.append({
            "date": date_str, "time": "08:30", "network": "Facebook",
            "text": fb_text, "link": LINK, "media": media,
        })

    return rows


def write_csv(rows, out_path: Path):
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["date", "time", "network", "text", "link", "media"],
            quoting=csv.QUOTE_ALL,
        )
        writer.writeheader()
        writer.writerows(rows)


def main():
    rows = build_rows()
    out = OUT_DIR / "MES-01-JUNHO-2026-METRICOOL.csv"
    write_csv(rows, out)
    print(f"OK · {len(rows)} linhas escritas em {out.relative_to(REPO_ROOT)}")
    by_net = {}
    for r in rows:
        by_net[r["network"]] = by_net.get(r["network"], 0) + 1
    for net, n in sorted(by_net.items()):
        print(f"  · {net}: {n} posts")


if __name__ == "__main__":
    main()
