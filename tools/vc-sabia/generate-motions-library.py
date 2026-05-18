#!/usr/bin/env python3
"""
Gerador da biblioteca mensal de prompts Midjourney para vc-sabia.

Produz docs/vc-sabia/MOTIONS-LIBRARY.md com 200 prompts (25 temas visuais
x 8 variantes cada), suficiente para 6+ meses de producao diaria com
rotacao sem repeticao directa, e calendarios-tipo de 30 dias para os
6 primeiros meses.

Cada prompt e construido por concatenacao deterministica de:
  - SUBJECT (especifico da variante)
  - ATMOSPHERE (partilhado por categoria)
  - STYLE_BASE (partilhado por toda a biblioteca)
  - MOOD_HINT (consoante o audio do post)
  - SUFFIX --ar 9:16 --style raw --stylize 200 --quality 1 --video

Re-executar este script apos editar CATEGORIES para acrescentar imagens
novas ou ajustar mapeamentos.

Uso:
  python3 tools/vc-sabia/generate-motions-library.py
"""
from __future__ import annotations

from datetime import date, timedelta
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
OUT_PATH = REPO_ROOT / "docs" / "vc-sabia" / "MOTIONS-LIBRARY.md"

STYLE_BASE = (
    "contemplative morning lusophone poetry, "
    "soft golden hour light, "
    "cinematic film grain 35mm, "
    "muted earth tones cream gold dust, "
    "shallow depth of field, "
    "no people no faces no text no logos"
)

SUFFIX = "--ar 9:16 --style raw --stylize 200 --quality 1 --video"

MOOD_HINTS = {
    "birds_dawn": "distant birds and very subtle leaf movement",
    "stream": "water surface gently rippling, slow current",
    "wind": "soft wind through grass or curtains, slow drift",
    "rain": "light rain on glass or stone, slow droplets",
    "silence": "almost still, only dust particles drifting in light",
}

# 25 categorias visuais x 8 variantes = 200 prompts.
# Cada categoria mapeada para um tema vc-sabia + mood de audio sugerido.
CATEGORIES: list[dict] = [
    # ───────────── 🪶 AVES ─────────────
    {
        "name": "Pássaros pequenos ao amanhecer",
        "tema": "confianca-no-caminho",
        "mood": "birds_dawn",
        "atmosphere": "the way ahead unhurried, trust in the next step",
        "subjects": [
            "tiny sparrows perched on a wire at first light, gentle silhouettes against soft pink sky",
            "small finches drinking from a clay bowl on a wooden windowsill at dawn",
            "a single robin singing on a fence post at sunrise, breath visible in cool air",
            "small birds gathering on a flowering branch in soft pink dawn light",
            "wagtail perched on a wet stone by a stream at first light, tail flicking",
            "swallows on a rooftop antenna against a pale lilac dawn sky",
            "tiny goldcrest among pine needles backlit by warm morning sun",
            "house sparrows bathing in a shallow puddle on terracotta tiles at sunrise",
        ],
    },
    {
        "name": "Colibris",
        "tema": "presenca-leve",
        "mood": "birds_dawn",
        "atmosphere": "here-now suspension, breath made visible",
        "subjects": [
            "a single hummingbird hovering at a wild orange flower at sunrise, frozen suspended motion",
            "hummingbird approaching a dew-covered hibiscus in slow motion, ultra detailed feathers",
            "hummingbird drinking from a trumpet flower at golden hour, iridescent throat glowing",
            "hummingbird suspended beside a red bottlebrush flower against soft morning sky",
            "two hummingbirds in mirrored flight above a still garden pond at dawn",
            "hummingbird at a single hibiscus bloom with morning mist around the leaves",
            "hummingbird hovering at a passionflower with soft sun rays in the background",
            "hummingbird perched briefly on a thin branch at first light, wings folded",
        ],
    },
    {
        "name": "Andorinhas",
        "tema": "confianca-no-caminho",
        "mood": "wind",
        "atmosphere": "the way ahead unhurried, trust in the next step",
        "subjects": [
            "silhouettes of swallows arcing across a pastel morning sky over red roofs",
            "a pair of swallows perched on a clothesline at dawn before flight",
            "swallows weaving over a sunlit field of dry grass at golden hour",
            "swallows nesting under terracotta eaves at sunrise, two arriving in flight",
            "swallow gliding low over still river water with soft reflections",
            "single swallow against a vast pale dawn sky, almost a brushstroke",
            "swallows perched in a row on a stone wall warmed by morning sun",
            "swallows circling above an abandoned chapel tower at first light",
        ],
    },
    {
        "name": "Penas flutuando",
        "tema": "presenca-leve",
        "mood": "wind",
        "atmosphere": "here-now suspension, breath made visible",
        "subjects": [
            "a single white feather drifting slowly through a shaft of golden morning light",
            "two pale feathers floating above still water at sunrise, soft reflection below",
            "a dove feather caught on a thin spider web at dawn, dew on the strands",
            "feather suspended in a glass jar on a windowsill bathed in warm morning light",
            "feather resting on damp stones beside a forest stream at first light",
            "a small grey feather floating in slow motion against pale linen curtains",
            "feathers scattered on dewy moss in a soft sunbeam through trees",
            "single feather rotating slowly in a shaft of sun through dust particles",
        ],
    },

    # ───────────── 🌸 FLORES ─────────────
    {
        "name": "Girassóis molhados de orvalho",
        "tema": "confianca-no-caminho",
        "mood": "wind",
        "atmosphere": "the way ahead unhurried, trust in the next step",
        "subjects": [
            "a field of sunflowers covered in heavy morning dew, droplets catching first golden light",
            "a single sunflower wet with dew bending toward the rising sun, soft halo of light",
            "row of young sunflowers with curled wet leaves at sunrise, mist between stems",
            "close up of a sunflower head with bees barely visible, dew on every seed",
            "wide field of sunflowers backlit by low pink dawn sun, soft fog around bases",
            "sunflower stem with a single droplet sliding down at first light",
            "small sunflower in a clay pot on a stone wall at dawn, dew on petals",
            "sunflowers at the edge of a wheat field, soft golden mist between them",
        ],
    },
    {
        "name": "Lavanda",
        "tema": "suavidade-e-descanso",
        "mood": "wind",
        "atmosphere": "rest as virtue, gentle weight of body, slow exhale",
        "subjects": [
            "rows of lavender swaying gently in a quiet field at dawn, soft purple haze and golden mist",
            "close up of a single lavender stem with bees barely visible in soft focus",
            "lavender bouquet in a clay jug on a wooden table by an open window at sunrise",
            "lavender field with a stone path winding through, morning light low across the rows",
            "dried lavender bundle hanging from a rustic wooden beam in warm light",
            "lavender stems in a glass jar with dew condensing on the inside",
            "lavender at the edge of an olive grove in soft dawn fog",
            "single lavender sprig on a linen napkin beside a clay teacup at first light",
        ],
    },
    {
        "name": "Flores silvestres",
        "tema": "alegria-simples",
        "mood": "wind",
        "atmosphere": "uncomplicated happiness, small bright pleasures",
        "subjects": [
            "a meadow of wildflowers in muted yellow white and lilac at sunrise, dew clinging to petals",
            "wild daisies and small grasses backlit by warm low sun, butterflies barely visible",
            "poppies and chamomile in a stone-walled garden at golden hour",
            "wild yellow daffodils bending over a quiet path at first light",
            "blue cornflowers among wheat at dawn, single bee in soft focus",
            "small white wildflowers along a sunlit forest edge with dust in the air",
            "patch of clover with morning dew, soft sun rays from one side",
            "wildflowers in a chipped ceramic vase on a wooden windowsill at sunrise",
        ],
    },
    {
        "name": "Dente-de-leão ao vento",
        "tema": "autoperdao",
        "mood": "wind",
        "atmosphere": "release, soft cleansing, second chance after rain",
        "subjects": [
            "a single dandelion clock releasing seeds into warm morning light, seeds suspended mid air",
            "field of dandelions glowing translucent against rising sun, seeds drifting one by one",
            "close up of dandelion seeds detaching one at a time in slow breeze",
            "dandelion silhouette against blue hour sky just before sunrise",
            "two dandelion clocks side by side, half-empty, in golden grass",
            "dandelion seed caught mid-flight against a soft cream background",
            "dandelion at the edge of a stone wall with morning fog drifting behind",
            "child-height view of a dandelion clock in a meadow at first light",
        ],
    },

    # ───────────── 🌳 ÁRVORES E FOLHAS ─────────────
    {
        "name": "Folhas translúcidas",
        "tema": "beleza-de-existir",
        "mood": "wind",
        "atmosphere": "awe at simply being here, life as quiet miracle",
        "subjects": [
            "backlit translucent young leaves at sunrise, veins glowing gold, soft cream sky behind",
            "single olive leaf held by morning sun, sap droplet shining, blurred green canopy behind",
            "translucent fig leaves with morning light revealing every vein, soft wind",
            "vine leaves backlit by low sun, dew sparkling on each",
            "a single autumn leaf glowing amber held by a thin branch at dawn",
            "young birch leaves shimmering against a pale blue morning sky",
            "translucent eucalyptus leaves with a single dewdrop catching first light",
            "fern fronds backlit by warm low sun in a forest clearing",
        ],
    },
    {
        "name": "Árvores com neblina matinal",
        "tema": "sonhar-com-raizes",
        "mood": "silence",
        "atmosphere": "dream anchored in ground, future grown from past",
        "subjects": [
            "ancient olive trees half-veiled in soft morning fog, red earth between roots",
            "a baobab tree silhouette emerging from low golden mist at dawn, savannah floor",
            "row of cypress trees in deep fog at sunrise, soft warm halos around tops",
            "pine forest with golden sun beams piercing thick low mist",
            "single ancient oak alone in a fog-filled valley at first light",
            "cork oaks in misty meadow with slow drifting fog around trunks",
            "almond trees in bloom emerging from morning fog, petals barely moving",
            "mafurreira tree silhouette in soft golden mist on red African soil at dawn",
        ],
    },

    # ───────────── 💧 ÁGUA ─────────────
    {
        "name": "Rios com reflexos de luz",
        "tema": "confianca-no-caminho",
        "mood": "stream",
        "atmosphere": "the way ahead unhurried, trust in the next step",
        "subjects": [
            "a slow river at sunrise reflecting pink and gold sky, gentle current carrying soft light streaks",
            "a quiet river bend with overhanging branches, fragments of sunlight dancing on the water",
            "wide river at first light with mist rising from the surface, gold reflections",
            "river stones in shallow water catching first sun, soft current",
            "narrow stream through a meadow at dawn, golden ripples around small rocks",
            "river meeting the sea at sunrise, soft swirls of light on the surface",
            "calm river with a single fallen leaf drifting through warm reflections",
            "ribbon of river through a forest with sun beams across the surface",
        ],
    },
    {
        "name": "Reflexos na água",
        "tema": "autoconhecimento",
        "mood": "stream",
        "atmosphere": "introspective stillness, deep listening, room for echo",
        "subjects": [
            "still surface of a pond reflecting a single tree and pale morning sky, single leaf falling",
            "mirror puddle on red stone after night rain reflecting pink dawn clouds",
            "still lake at dawn with perfect symmetrical reflection of mountains",
            "rain barrel filled to the brim reflecting morning sky and one branch above",
            "small pond at first light with a single ripple expanding from the centre",
            "dewdrop on a leaf reflecting the entire morning landscape upside down",
            "still water in a clay basin on a stone wall reflecting golden clouds",
            "garden fountain still at dawn, surface mirror-flat with first light",
        ],
    },

    # ───────────── 🦌 ANIMAIS ─────────────
    {
        "name": "Cervos etéreos",
        "tema": "autoconhecimento",
        "mood": "silence",
        "atmosphere": "introspective stillness, deep listening, room for echo",
        "subjects": [
            "a single deer standing in golden morning mist at the edge of a forest, head turned softly",
            "a young doe in tall grass at dawn, sun rays piercing through fog behind",
            "deer drinking from a still forest pond at first light, soft reflection",
            "a small herd of deer crossing a misty meadow at sunrise",
            "single antlered deer silhouette against pale dawn sky on a hilltop",
            "fawn resting in dewy grass at sunrise, soft light on its coat",
            "deer half-hidden between trees with golden sun beams between branches",
            "deer ear flicking in slow motion in tall morning grass",
        ],
    },
    {
        "name": "Gatos ao sol da manhã",
        "tema": "suavidade-e-descanso",
        "mood": "silence",
        "atmosphere": "rest as virtue, gentle weight of body, slow exhale",
        "subjects": [
            "a tabby cat curled on terracotta tiles in a soft morning sun beam, slow breathing",
            "white cat stretching slowly on a windowsill against linen curtains and dawn light",
            "black cat sitting upright in a sunbeam on wooden floor, tail tip flicking",
            "ginger cat asleep on a folded blanket by an open window at sunrise",
            "kitten paw extended into a warm sunbeam on a cool tile floor",
            "cat half-asleep on a stone wall in golden hour, eyes barely open",
            "cat watching dust particles in a sun ray, body still on a wooden chair",
            "two cats curled together on a warm stoop at dawn",
        ],
    },

    # ───────────── ☀️ LUZ, CÉU E PAISAGEM ─────────────
    {
        "name": "Campos dourados",
        "tema": "gratidao",
        "mood": "wind",
        "atmosphere": "grateful attention to small ordinary gifts",
        "subjects": [
            "a wheat field at golden hour with low sun grazing the tops, rolling slow waves of light",
            "amber savannah grass at sunrise with distant acacia silhouettes",
            "field of barley with single tree on horizon at first light",
            "rolling hills of golden wheat with morning mist between them",
            "rye field with dew on tips, soft pink dawn sky above",
            "tall dry grass at sunset golden hour, slow swaying",
            "wheat field with a single bird flying across at dawn",
            "endless meadow of yellow grass with one dirt path through it",
        ],
    },
    {
        "name": "Caminhos de floresta iluminados",
        "tema": "sonhar-com-raizes",
        "mood": "silence",
        "atmosphere": "dream anchored in ground, future grown from past",
        "subjects": [
            "a soft dirt path winding through pine forest with sun beams cutting through morning fog",
            "narrow stone path through ancient cork oaks, low sun behind trees",
            "moss-covered path in a beech forest with golden light from one side",
            "forest trail at dawn with leaves falling through warm sun rays",
            "wooden boardwalk through misty woods at first light",
            "path between olive trees with golden grass and morning fog",
            "stone steps in an old chestnut forest with warm dawn light from above",
            "narrow track through bamboo with soft green light filtering down",
        ],
    },
    {
        "name": "Luas suaves no amanhecer azul",
        "tema": "inteireza",
        "mood": "silence",
        "atmosphere": "wholeness, return to center, circle closing softly",
        "subjects": [
            "a fading pale moon over soft blue dawn sky above a sleeping valley",
            "crescent moon hanging low over a quiet lake at blue hour, single bird crossing the frame",
            "half moon visible behind thin morning clouds at first light",
            "full moon setting over the sea as the sun rises behind",
            "pale moon framed by branches of a flowering almond tree at dawn",
            "moon reflected in a still rice paddy at blue hour",
            "ghost moon barely visible in pastel pink dawn sky",
            "crescent moon and morning star above a distant mountain ridge",
        ],
    },
    {
        "name": "Céu pastel com nuvens brilhantes",
        "tema": "beleza-de-existir",
        "mood": "silence",
        "atmosphere": "awe at simply being here, life as quiet miracle",
        "subjects": [
            "a pastel pink and cream dawn sky with soft golden edged clouds, single bird passing",
            "peach and lilac dawn sky above a still ocean horizon, single sail far away",
            "lavender pink clouds above a quiet city skyline at first light",
            "soft cotton candy sky above a calm wheat field at sunrise",
            "salmon coloured clouds drifting slowly above a misty valley",
            "sky in soft pinks and blues above a still lake at dawn",
            "high cirrus clouds catching first light in cream and rose pink",
            "wide open sky in pastel tones above an empty road at sunrise",
        ],
    },
    {
        "name": "Montanhas etéreas",
        "tema": "confianca-no-caminho",
        "mood": "silence",
        "atmosphere": "the way ahead unhurried, trust in the next step",
        "subjects": [
            "layers of misty mountain ridges fading into pink dawn light, no foreground details",
            "serene mountain top above a sea of clouds at sunrise",
            "distant blue mountains beyond a foreground of golden grass at first light",
            "snow-capped peaks barely visible through morning haze",
            "rolling hills disappearing into soft golden mist toward the horizon",
            "single peak emerging from cloud cover at dawn, sun rays from behind",
            "mountain valley filled with low cloud at first light, peaks above",
            "horizon line of distant mountains painted in soft pastels at sunrise",
        ],
    },

    # ───────────── 🏠 INTERIOR E OBJECTOS ─────────────
    {
        "name": "Chá fumegante junto à janela",
        "tema": "suavidade-e-descanso",
        "mood": "silence",
        "atmosphere": "rest as virtue, gentle weight of body, slow exhale",
        "subjects": [
            "a clay teacup on a wooden windowsill with steam rising into morning sunlight, linen curtains softly in focus behind",
            "ceramic mug of tea steaming on a kitchen table beside an open book, dawn light through the window",
            "rustic teapot pouring tea into a cup at first light, gentle steam rising",
            "two cups of tea side by side on a wooden tray on a windowsill at sunrise",
            "hand-thrown clay mug of tea on a stone ledge with morning fog outside",
            "tea steeping in a glass cup, steam curling against soft golden light",
            "saucer with a sprig of fresh mint beside a steaming cup at dawn",
            "japanese-style teacup on a tatami with morning sun across the wood",
        ],
    },
    {
        "name": "Janelas abertas com cortinas leves",
        "tema": "corpo-como-casa",
        "mood": "wind",
        "atmosphere": "body as dwelling, slow rituals, sensory return",
        "subjects": [
            "linen curtains breathing in summer wind through an open wooden window, soft golden light spilling onto a tile floor",
            "sheer curtains glowing against a pale blue morning sky behind an open shutter, dust motes drifting",
            "white cotton curtains gently rising in morning breeze through an open balcony door",
            "lace curtains casting patterned shadows on a wooden floor at first light",
            "open wooden window framing a misty garden, curtain barely moving",
            "kitchen window with linen curtain and a glass jar of wildflowers at dawn",
            "curtains drawn aside to reveal a sunrise over rooftops",
            "open shutters with light blue paint, soft cotton curtain catching the morning wind",
        ],
    },
    {
        "name": "Lanternas suaves",
        "tema": "beleza-de-existir",
        "mood": "silence",
        "atmosphere": "awe at simply being here, life as quiet miracle",
        "subjects": [
            "a single warm paper lantern hanging from a low branch at dawn, soft glow against blue hour sky",
            "row of small lanterns lining a stone path at blue hour, warm pools of light on cobblestone",
            "rustic metal lantern on a wooden bench at first light, soft flame inside",
            "paper lanterns floating gently in a quiet courtyard at sunrise",
            "single lantern on a stone wall beside an arched doorway at dawn",
            "lantern on a wooden boat moored at a misty shore",
            "warm lantern in a window with curtain glowing pink from morning sky",
            "small lanterns hanging from a tree in a quiet garden at first light",
        ],
    },
    {
        "name": "Café da manhã minimalista poético",
        "tema": "gratidao",
        "mood": "silence",
        "atmosphere": "grateful attention to small ordinary gifts",
        "subjects": [
            "a wooden table at sunrise with a single ceramic plate, a fig cut in half, a slice of bread and a small glass of water",
            "overhead view of breakfast tableau: clay cup of coffee, half papaya, sprig of fresh herbs, dawn light from the side",
            "rustic table with bread, honey jar and a clay cup of tea in soft morning light",
            "small wooden tray on a stone wall with a single fruit and a cup, golden hour",
            "kitchen counter at dawn with a peach, a knife and a linen napkin",
            "ceramic bowl of berries and yogurt on a wooden table beside an open window",
            "single boiled egg in a cup with a wooden spoon on a sunlit windowsill",
            "wooden plate with sliced bread and olive oil bottle in soft dawn light",
        ],
    },
    {
        "name": "Livros + luz dourada",
        "tema": "autoamor",
        "mood": "silence",
        "atmosphere": "tender warmth, self-embrace, home as body",
        "subjects": [
            "an open vintage book on a worn wooden desk, golden morning light catching the pages",
            "stack of old books on a windowsill bathed in warm dawn light, dust particles in the rays",
            "leather-bound notebook open on a stone wall with morning sun across one page",
            "books and a small clay cup on a wooden table in soft golden light",
            "single book open with a pressed flower between pages at sunrise",
            "library shelf with sun streaking across the spines at dawn",
            "open book on a linen cloth on a balcony at first light",
            "old hardback book and round glasses on a desk in warm morning light",
        ],
    },
    {
        "name": "Vela acesa ao nascer do sol",
        "tema": "presenca-leve",
        "mood": "silence",
        "atmosphere": "here-now suspension, breath made visible",
        "subjects": [
            "a single beeswax candle burning on a wooden table at dawn, soft pink light from a window behind",
            "small votive candle near a clay bowl of water at sunrise, gentle reflection on the water",
            "three small candles on a stone altar at first light, slow flickering",
            "candle in a glass jar on a windowsill with morning mist outside",
            "candle on a folded linen napkin beside a sprig of rosemary at dawn",
            "single tall candle in a bronze holder catching first golden light",
            "candle on a wooden tray with petals around it at sunrise",
            "candle in an arched stone niche with soft warm glow at dawn",
        ],
    },
]


def build_prompt(subject: str, atmosphere: str, mood: str | None) -> str:
    mood_hint = MOOD_HINTS.get(mood or "silence", MOOD_HINTS["silence"])
    return f"{subject}, {atmosphere}, {STYLE_BASE}, {mood_hint} {SUFFIX}"


def category_anchor(name: str) -> str:
    return (
        name.lower()
        .replace(" ", "-")
        .replace("ç", "c")
        .replace("ã", "a")
        .replace("á", "a")
        .replace("é", "e")
        .replace("í", "i")
        .replace("ó", "o")
        .replace("ú", "u")
        .replace("ê", "e")
        .replace("ô", "o")
        .replace("â", "a")
    )


def render_doc() -> str:
    total = sum(len(c["subjects"]) for c in CATEGORIES)
    lines: list[str] = []
    lines.append("# VC Sabia — Biblioteca de Motions Midjourney (6 meses)")
    lines.append("")
    lines.append(
        f"Stock de **{total} prompts** ({len(CATEGORIES)} temas × ~{total // len(CATEGORIES)} variações) "
        "prontos a colar no Midjourney v6/v7. Cobre **6 meses** de produção diária com rotação "
        "controlada — cada variante usada uma única vez por semestre."
    )
    lines.append("")
    lines.append("## Estilo fixo")
    lines.append("")
    lines.append("Todos os prompts terminam em:")
    lines.append("")
    lines.append("```")
    lines.append(SUFFIX)
    lines.append("```")
    lines.append("")
    lines.append("Paleta partilhada:")
    lines.append("")
    lines.append(f"> *{STYLE_BASE}*")
    lines.append("")
    lines.append(
        "Cada bloco indica o **tema vc-sabia** sugerido e o **mood de áudio** para casar com a frase do post."
    )
    lines.append("")

    # Indice
    lines.append("## Índice")
    lines.append("")
    for c in CATEGORIES:
        lines.append(f"- [{c['name']}](#{category_anchor(c['name'])}) — {c['tema']} · {c['mood']} · {len(c['subjects'])} prompts")
    lines.append("")
    lines.append("---")
    lines.append("")

    # Prompts por categoria
    for c in CATEGORIES:
        lines.append(f"## {c['name']}")
        lines.append("")
        lines.append(f"*vc-sabia: `{c['tema']}` · mood: `{c['mood']}`*")
        lines.append("")
        for i, subj in enumerate(c["subjects"], 1):
            prompt = build_prompt(subj, c["atmosphere"], c["mood"])
            lines.append(f"**Variante {i}.**")
            lines.append("")
            lines.append("```")
            lines.append(prompt)
            lines.append("```")
            lines.append("")
        lines.append("---")
        lines.append("")

    # Calendarios 6 meses (rotacao cat[i % N], variant[i // N])
    lines.append("## Calendário de 6 meses")
    lines.append("")
    lines.append(
        "Rotação determinista — cada dia mapeia para uma categoria e variante. "
        "Em 180 dias cada categoria aparece ~7× e cada variante 1×."
    )
    lines.append("")

    n_cats = len(CATEGORIES)
    start = date(2026, 6, 1)
    months_pt = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
    ]

    cursor_day = 0  # dia 0 = 1 Junho 2026
    for month_offset in range(6):
        # primeiro e ultimo dia desse mes
        # avancamos para o 1º do mes
        month_start = start
        for _ in range(month_offset):
            # passa para o proximo mes
            if month_start.month == 12:
                month_start = date(month_start.year + 1, 1, 1)
            else:
                month_start = date(month_start.year, month_start.month + 1, 1)
        # quantos dias tem este mes
        if month_start.month == 12:
            next_month = date(month_start.year + 1, 1, 1)
        else:
            next_month = date(month_start.year, month_start.month + 1, 1)
        days_in_month = (next_month - month_start).days

        lines.append(f"### {months_pt[month_start.month - 1]} {month_start.year}")
        lines.append("")
        lines.append("| Dia | Data | Categoria | Variante |")
        lines.append("|---|---|---|---|")
        for d in range(days_in_month):
            this_date = month_start + timedelta(days=d)
            cat = CATEGORIES[cursor_day % n_cats]
            variant_idx = (cursor_day // n_cats) % len(cat["subjects"])
            lines.append(
                f"| {d + 1} | {this_date.isoformat()} | {cat['name']} | v{variant_idx + 1} |"
            )
            cursor_day += 1
        lines.append("")

    lines.append("---")
    lines.append("")
    lines.append("## Fluxo de produção")
    lines.append("")
    lines.append("1. Abre o Midjourney (web ou Discord).")
    lines.append("2. Copia o prompt da variante do dia.")
    lines.append("3. Espera o still + clip vídeo (`--video` ativa o modo motion na v6/v7).")
    lines.append("4. Download MP4 9:16.")
    lines.append("5. Upload no Motion Library do vc-sabia. `Auto-classificar` do Claude atribui o mood.")
    lines.append("6. No plano, clica a thumbnail da linha → grelha de thumbs → escolhe o motion.")
    lines.append("")

    return "\n".join(lines) + "\n"


def main():
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    content = render_doc()
    OUT_PATH.write_text(content, encoding="utf-8")
    total = sum(len(c["subjects"]) for c in CATEGORIES)
    print(f"OK · {total} prompts ({len(CATEGORIES)} categorias) escritos em {OUT_PATH.relative_to(REPO_ROOT)}")
    print(f"  · Calendário: 6 meses (2026-06-01 → 2026-11-30, ~180 dias)")


if __name__ == "__main__":
    main()
