#!/usr/bin/env python3
"""Single source of truth para a produção visual e sonora de "Trinta Manhãs".

Importado por:
  - tools/contos-mensais/generate-slideshow-md.py  (escreve SLIDESHOW.md)
  - tools/contos-mensais/render-slideshow.py       (FFmpeg slideshow render)

A copy das publicações está em generate-metricool-csv.py (CAPITULOS), com as
mesmas estrofes que aqui servem de painéis cinéticos.
"""
from __future__ import annotations

# Estilo MJ partilhado pelos 90 prompts.
MJ_STYLE_SUFFIX = (
    "side-lit ibérian portuguese morning, fine grain, painterly, no human faces, "
    "palette deep night-blue #1A2238 and amber-gold #E8C97A, literary quietude "
    "--ar 9:16 --style raw --stylize 200"
)

# Trilhas Ancient Ground (Loranne instrumental) — 100 faixas em Supabase,
# catálogo em tools/youtube-pipeline/music-ancient-ground.json.
# Atribuímos UMA faixa por véu (recorrência intencional ao longo dos 4 ciclos
# do mês: quem vê uma segunda-feira reconhece a paleta sonora antes do texto).
# Atribuição inicial arbitrária — espalhada pelo catálogo para variedade tonal.
# Para trocar, ouve no admin e edita estes 8 números. O renderer pega.
AG_TRACKS_BY_VEU = {
    "permanencia": 8,
    "memoria":     22,
    "turbilhao":   37,
    "esforco":     49,
    "desolacao":   63,
    "horizonte":   71,
    "dualidade":   84,
    "inteireza":   95,
}

AG_BUCKET_URL = (
    "https://tdytdamtfillqyklgrmb.supabase.co/storage/v1/object/public/audios/"
    "albums/ancient-ground"
)


def ag_track_url(veu: str) -> str:
    """URL pública da faixa Ancient Ground atribuída a este véu."""
    n = AG_TRACKS_BY_VEU[veu]
    return f"{AG_BUCKET_URL}/faixa-{n:02d}.mp3"


def ag_track_label(veu: str) -> str:
    """Etiqueta curta `faixa-NN` para referência."""
    return f"faixa-{AG_TRACKS_BY_VEU[veu]:02d}"

# Mapeamento cap → trilha (véu).
CAP_TRACK = {
    1: "permanencia",  2: "memoria",    3: "turbilhao",  4: "esforco",
    5: "desolacao",    6: "horizonte",  7: "dualidade",  8: "permanencia",
    9: "memoria",     10: "turbilhao", 11: "esforco",   12: "desolacao",
    13: "horizonte",  14: "dualidade", 15: "permanencia", 16: "memoria",
    17: "turbilhao",  18: "esforco",   19: "desolacao", 20: "horizonte",
    21: "dualidade",  22: "permanencia", 23: "memoria", 24: "turbilhao",
    25: "esforco",    26: "desolacao", 27: "horizonte", 28: "dualidade",
    29: "permanencia", 30: "inteireza",
}

# 30 capítulos × (3 prompts MJ + frase-âncora).
# Os prompts são fragmentos curtos — o style suffix é apenso pelo gerador.
SHOTS = {
    1: {
        "prompts": [
            "old white-tiled bathroom, oval wall mirror with a film of fine dust, predawn cobalt window light low and lateral",
            "single drop on a porcelain basin, vintage brass tap, faint amber reflection in early light",
            "dust motes drifting in a single beam of sun across a bathroom corner, still air",
        ],
        "anchor": "A mesma cara. Outra luz.",
    },
    2: {
        "prompts": [
            "old wooden drawer half-open, a yellowed sealed envelope inside, lacework cloth nearby",
            "a woman's hand approaching a folded letter without lifting it, soft hesitation",
            "the drawer closed again, dark wood with faint fingerprints, dust motes",
        ],
        "anchor": "Não era a primeira vez. Era a primeira vez que reparava.",
    },
    3: {
        "prompts": [
            "vintage stovetop kettle whistling, steam plume catching a low sun beam",
            "an empty wooden kitchen chair foreground, blurred kettle behind, curtain light",
            "the kettle silent on the burner, last steam dissipating, soft heat haze",
        ],
        "anchor": "A chaleira apitou até parar sozinha.",
    },
    4: {
        "prompts": [
            "an empty wooden kitchen chair backed to a window, oblique morning light",
            "a woman seen from behind sitting in the chair, hands in lap, no face",
            "a forgotten cup of tea on the table, cup near the edge, light dropping",
        ],
        "anchor": "O chá ficou frio. Ela não.",
    },
    5: {
        "prompts": [
            "evening kitchen table, a half-full glass of wine, empty chair opposite, warm low lamp",
            "a phone face-down on the table, a single notification glow leaking out from beneath",
            "open window letting in damp earthen rain smell, curtain barely moving",
        ],
        "anchor": "Não era inimigo. Era terra preparada.",
    },
    6: {
        "prompts": [
            "tiled iberian balcony foreground, distant hill with two shades of light, dawn-pink sky",
            "ceramic mug on a balcony rail with steam rising, hill in soft focus behind",
            "the hill closer now, sun ridge bright and shadowed face darker, layered relief",
        ],
        "anchor": "A vida não estava depois. Estava ali.",
    },
    7: {
        "prompts": [
            "hands kneading bread dough on flour-dusted light wood, Sunday window light",
            "risen bread dough in a ceramic bowl under a cloth, kitchen calm and warm",
            "rough hands meeting pliant dough, warm earth tones, presence as a verb",
        ],
        "anchor": "As mãos e a massa. A mesma coisa.",
    },
    8: {
        "prompts": [
            "digital alarm clock reading 04:13, dim red glow, bedroom in cobalt night",
            "a hand resting on a pillow not moving, ceiling shadows, calm awakeness",
            "soft light slipping under a closed door, the still room breathing slowly",
        ],
        "anchor": "A casa estava igual. Alguma coisa nela não estava.",
    },
    9: {
        "prompts": [
            "an opened letter unfolded on a wooden table, mother's handwriting visible obliquely",
            "a hand smoothing a crease across the page, soft morning light",
            "the letter resting alone, a cooling coffee cup nearby, time settling",
        ],
        "anchor": "Espero que tenhas aprendido a parar.",
    },
    10: {
        "prompts": [
            "kettle steaming in soft focus, a hand on the chest in foreground, no face",
            "kitchen counter with kettle and a slow breathing torso, side light",
            "the kettle silent, steam tapering off, calm air rebuilding",
        ],
        "anchor": "A cabeça acalma quando se respira ao lado dela.",
    },
    11: {
        "prompts": [
            "interior of a portuguese morning bus, vertical handrail in sharp focus, passengers blurred",
            "an empty bus seat between two standing figures, low cinematic light",
            "bus window with city dawn passing by, soft motion blur",
        ],
        "anchor": "Ainda sabemos descansar uns aos outros.",
    },
    12: {
        "prompts": [
            "a wooden market stall almost empty at dusk, three pears huddled at one end",
            "a vendor's hand offering the pears wrapped in newspaper, warm market light",
            "a single bitten pear on a plain kitchen plate, jagged skin, soft amber",
        ],
        "anchor": "As coisas amassadas continuam doces.",
    },
    13: {
        "prompts": [
            "wide landscape with an elderly figure sitting on a rock far away, dawn light",
            "the same scene closer, no facial detail, posture relaxed, alone with the air",
            "the rock empty, a path of footprints leading away, sky widening",
        ],
        "anchor": "Não estou à espera. Estou só.",
    },
    14: {
        "prompts": [
            "smartphone face-down on a wooden table, sunlight angled across",
            "the phone screen lit with an incoming call labelled MÃE, soft glow on the hands nearby",
            "the phone again face-down after the call, two cups on the table, silence settling",
        ],
        "anchor": "Nada para resolver. Só presença.",
    },
    15: {
        "prompts": [
            "an open window before dawn, faint city skyline in pale blue, curtain still",
            "a small balcony rail with the city quietly awakening below, soft amber edges",
            "the sun touching distant rooftops with golden filaments, breath of new air",
        ],
        "anchor": "Acordada com a cidade. Não sozinha.",
    },
    16: {
        "prompts": [
            "phone screen showing a message preview from an old friend, gentle glow",
            "the phone laid on a notebook, a hand resting near but not grabbing",
            "phone in shadow on a side table, a window's light moving across slowly",
        ],
        "anchor": "O coração não fechou. Só está a aprender.",
    },
    17: {
        "prompts": [
            "laptop screen with a to-do list barely touched, office dusk light",
            "a hand pausing over the trackpad, no decision in motion",
            "the laptop closed on the desk, the room ready to rest",
        ],
        "anchor": "Não tudo é lista.",
    },
    18: {
        "prompts": [
            "a narrow neighbourhood street, simple worn shoes mid-stride, low sun",
            "a dog wagging in a doorway, the silhouette of a woman passing without stopping",
            "the front door of a house slightly ajar, returning, no rush",
        ],
        "anchor": "A diferença não estava no relógio.",
    },
    19: {
        "prompts": [
            "an old beeswax candle on a wooden table, the flame steady, dim room",
            "the candle burning down, wax pooling slowly, soft amber glow",
            "blackened wick with a thin ribbon of smoke rising, presence remaining",
        ],
        "anchor": "A paz que vem da presença.",
    },
    20: {
        "prompts": [
            "balcony with white laundry catching late golden light, summer solstice",
            "the long evening sky still bright, a chair facing it, a woman from behind",
            "twilight finally settling, a hand reaching for the laundry, slow time",
        ],
        "anchor": "O sol não tinha pressa. Porque é que eu tenho.",
    },
    21: {
        "prompts": [
            "park bench with an open book on it, fallen leaves nearby, soft Sunday light",
            "in the distance a child running blurred, a pigeon taking flight, mother glancing up",
            "the book held loosely, a finger marking a page, child's laughter implied",
        ],
        "anchor": "Eu estou nos dois.",
    },
    22: {
        "prompts": [
            "a clean bathroom mirror reflecting morning, no smudges, simple frame",
            "a hand touching the mirror's frame, fingertips just visible, light from behind",
            "the mirror reflecting a window across the room, calm geometry",
        ],
        "anchor": "Às vezes não é preciso limpar. É preciso olhar.",
    },
    23: {
        "prompts": [
            "hands typing on a phone over a kitchen table, careful and slow",
            "phone screen showing three short lines of text, soft glow on the hands",
            "the phone laid down after sending, hands intertwined nearby",
        ],
        "anchor": "Hesitei. Lembrei-me de ti. Estou aqui.",
    },
    24: {
        "prompts": [
            "a single ceramic mug steaming on a plain table, light from one window",
            "the steam folding into itself, no other detail, contemplative",
            "the mug emptied, steam gone, the light still gentle",
        ],
        "anchor": "Não foi meditação. Foi cozinha.",
    },
    25: {
        "prompts": [
            "a fingertip just above the send button on a phone, slight hesitation",
            "the sent-message confirmation softly visible, fingers relaxing",
            "the phone laid aside, shoulders relaxing in soft window light",
        ],
        "anchor": "O mundo não caiu. Os ombros desceram um centímetro.",
    },
    26: {
        "prompts": [
            "heavy summer rain hitting a balcony, drops bouncing high, warm light behind",
            "open hands receiving rainwater, no face, joyful posture",
            "wet apartment floor with footprints, a towel resting nearby, lit window",
        ],
        "anchor": "Não correu. Riu-se.",
    },
    27: {
        "prompts": [
            "an open window with a thin curtain moving slowly, no clock in sight",
            "the same window with afternoon light, indoor plants growing patient",
            "evening light dimming through the curtain, the day having arrived anyway",
        ],
        "anchor": "O dia chegou na mesma.",
    },
    28: {
        "prompts": [
            "wooden apartment floor seen from above, a woman lying with arms slightly open",
            "the floor texture in detail, a hand resting palm down, calm light",
            "the floor empty, the imprint of warmth lingering, soft window light",
        ],
        "anchor": "O frio do chão também sou eu.",
    },
    29: {
        "prompts": [
            "a hand pulling a white cloth off a hallway mirror, slow revelation",
            "the mirror appearing in pieces, the reflection emerging gently",
            "fully revealed mirror, a quiet hallway lit by clean morning",
        ],
        "anchor": "Mais sua. Sustentou o olhar.",
    },
    30: {
        "prompts": [
            "a kettle, a closed drawer, a hallway mirror — soft visual triptych in fade",
            "a single cup of tea on a kitchen table at sunrise, peaceful",
            "a window open to a portuguese morning, light moving across the room",
        ],
        "anchor": "Não prometeu nada. Sabia que amanhã ia chegar.",
    },
}

# Timings em segundos (sliding com pequena variação se nº de painéis ≠ 3).
TIMINGS_3_PANELS = {
    "img1_in": 0.3,
    "panel1_in": 0.5,    "panel1_out": 7.0,
    "img_xfade_1": (7.0, 8.0),
    "panel2_in": 8.0,    "panel2_out": 14.0,
    "img_xfade_2": (14.0, 15.0),
    "panel3_in": 15.0,   "panel3_out": 21.0,
    "card_in": 21.0,     "card_out": 25.0,
    "total": 25.0,
}

LINK_CAPS = {1, 15, 29, 30}


def card_lines(cap_n: int, anchor: str) -> list[str]:
    """Linhas do cartão final (4s).
    Linha 1: frase-âncora (dourado, Cormorant italic 44px)
    Linha 2: 'Continua amanhã.' ou 'Recomeça amanhã.' (cream, Inter 32px)
    Linha 3 (só caps-âncora): 'seteveus.space' (cream, Inter 28px)
    """
    lines = [anchor]
    if cap_n == 30:
        lines.append("Recomeça amanhã.")
        lines.append("seteveus.space")
    elif cap_n in LINK_CAPS:
        lines.append("Continua amanhã.")
        lines.append("seteveus.space")
    else:
        lines.append("Continua amanhã.")
    return lines
