#!/usr/bin/env python3
"""Renderiza docs/contos-mensais/MES-01-JUNHO-2026-SLIDESHOW.md a partir de:
  - content.py (prompts MJ, trilhas AG, frases-âncora)
  - generate-metricool-csv.py CAPITULOS (estrofes dos painéis)
"""
from __future__ import annotations

from importlib.machinery import SourceFileLoader
from pathlib import Path
from datetime import date, timedelta

REPO_ROOT = Path(__file__).resolve().parents[2]
TOOLS = REPO_ROOT / "tools" / "contos-mensais"

content = SourceFileLoader("content", str(TOOLS / "content.py")).load_module()
gen = SourceFileLoader("gen", str(TOOLS / "generate-metricool-csv.py")).load_module()

OUT = REPO_ROOT / "docs" / "contos-mensais" / "MES-01-JUNHO-2026-SLIDESHOW.md"

DAY_NAMES = {
    "Seg": "Segunda", "Ter": "Terça", "Qua": "Quarta", "Qui": "Quinta",
    "Sex": "Sexta", "Sab": "Sábado", "Dom": "Domingo",
}


def panels_from_copy_ig(copy_ig: str) -> list[str]:
    """Extrai estrofes do copy IG (separadas por linhas em branco), excluindo
    o bloco 'Cap. N de 30' e o 'Continua amanhã …'.
    """
    blocks = copy_ig.split("\n\n")
    panels = []
    for b in blocks:
        s = b.strip()
        if not s:
            continue
        if s.startswith("Cap."):
            continue
        if s.startswith("Continua amanhã") or s.startswith("Recomeça amanhã"):
            continue
        panels.append(s)
    return panels


def normalize_to_three(panels: list[str]) -> list[str]:
    """Reduz n painéis a 3, fundindo os intermédios."""
    if len(panels) <= 3:
        return panels + [""] * (3 - len(panels))
    if len(panels) == 4:
        return [panels[0], panels[1] + "\n\n" + panels[2], panels[3]]
    if len(panels) == 5:
        return [panels[0] + "\n\n" + panels[1], panels[2] + "\n\n" + panels[3], panels[4]]
    # >=6 (não acontece, mas safe)
    third = len(panels) // 3
    return [
        "\n\n".join(panels[:third]),
        "\n\n".join(panels[third:2*third]),
        "\n\n".join(panels[2*third:]),
    ]


def cap_track_label(cap_n: int) -> str:
    return content.CAP_TRACK[cap_n]


def write_md():
    start = date(2026, 6, 1)
    lines: list[str] = []
    out = lines.append

    out("# Trinta Manhãs · Junho 2026")
    out("## Produção visual e sonora — slideshow editorial sem voz")
    out("")
    out("> Ficheiro técnico para a equipa de produção visual e sonora.")
    out("> Bíblia em `MES-01-JUNHO-2026-BIBLIA.md`. Texto literário em `MES-01-JUNHO-2026-GUIOES.md`.")
    out("> Copy publicável em `MES-01-JUNHO-2026-METRICOOL.csv`.")
    out("")
    out("Cada capítulo entrega:")
    out("- **3 imagens Midjourney v6** (1080×1920, --ar 9:16 --style raw --stylize 200) em `assets/trinta-manhas/imagens/cap-NN-{1,2,3}.jpg`")
    out("- **1 trilha AG do véu** (~30s, instrumental, looped) — reciclada pelos 4 ciclos")
    out("- **3 painéis de texto cinético** + **1 cartão final** com frase-âncora")
    out("")
    out("Duração-alvo: **25 segundos** (slot do cartão final inclusive).")
    out("")
    out("---")
    out("")
    out("## Identidade visual partilhada nos 90 prompts")
    out("")
    out("Adiciona automaticamente a TODO o prompt MJ deste documento:")
    out("")
    out(f"> `{content.MJ_STYLE_SUFFIX}`")
    out("")
    out("Cada cap apresenta abaixo apenas o **fragmento específico** — o sufixo de estilo é apenso pelo renderer (`render-slideshow.py`).")
    out("")
    out("---")
    out("")
    out("## Trilhas AG (ElevenLabs Music) — 8 trilhas, recicladas")
    out("")
    out("Gerar uma vez em `assets/trinta-manhas/musica/veu-{nome}.mp3` (~30s loopable). Cada cap usa a trilha do seu véu.")
    out("")
    out("| Véu | Capítulos | Prompt AG |")
    out("|---|---|---|")
    veu_to_caps: dict[str, list[int]] = {}
    for cap, veu in content.CAP_TRACK.items():
        veu_to_caps.setdefault(veu, []).append(cap)
    order = ["permanencia", "memoria", "turbilhao", "esforco", "desolacao", "horizonte", "dualidade", "inteireza"]
    for veu in order:
        caps_str = ", ".join(str(c) for c in sorted(veu_to_caps.get(veu, [])))
        prompt = content.TRACKS[veu].replace("|", "\\|").replace("\n", " ")
        out(f"| **{veu}** | {caps_str} | {prompt} |")
    out("")
    out("---")
    out("")
    out("## Timings do slideshow (idêntico em todos os 30 caps)")
    out("")
    out("```")
    out("00:00.0 – 00:00.3   imagem 1 entra em fade (300ms)")
    out("00:00.5 – 00:07.0   painel 1 (palavra-a-palavra, ~150ms/palavra; depois holds)")
    out("00:07.0 – 00:08.0   cross-fade imagem 1 → imagem 2 (1s)")
    out("00:08.0 – 00:14.0   painel 2")
    out("00:14.0 – 00:15.0   cross-fade imagem 2 → imagem 3 (1s)")
    out("00:15.0 – 00:21.0   painel 3")
    out("00:21.0 – 00:25.0   cartão final (imagem 3 escurecida a 60%, frase-âncora dourada)")
    out("```")
    out("")
    out("Numeração de capítulo aparece como texto cream 12px no canto topo-direito ao longo do vídeo (`N/30`).")
    out("")
    out("---")
    out("")

    # Cada capítulo
    for entry in gen.CAPITULOS:
        cap_n, dow, veu, _hashtags, copy_ig, _tt, _yt, _yd = entry
        d = start + timedelta(days=cap_n - 1)
        date_str = d.isoformat()
        day_pt = DAY_NAMES.get(dow, dow)
        shot = content.SHOTS[cap_n]
        prompts = shot["prompts"]
        anchor = shot["anchor"]
        track = cap_track_label(cap_n)

        # Painéis a partir do copy IG canónico
        raw_panels = panels_from_copy_ig(copy_ig)
        panels_3 = normalize_to_three(raw_panels)

        cartao = content.card_lines(cap_n, anchor)

        out(f"## CAP {cap_n:02d} · {day_pt} {date_str} · Véu da {veu.upper()}")
        out("")
        out(f"**Trilha:** `veu-{track}.mp3`  ·  **Imagens:** `cap-{cap_n:02d}-{{1,2,3}}.jpg`")
        out("")
        out("### Prompts Midjourney")
        out("")
        for i, p in enumerate(prompts, 1):
            out(f"{i}. `{p}`")
        out("")
        out("### Painéis cinéticos")
        out("")
        out("| Tempo | Texto |")
        out("|---|---|")
        timings = [("00:00.5 – 00:07.0", panels_3[0]),
                   ("00:08.0 – 00:14.0", panels_3[1]),
                   ("00:15.0 – 00:21.0", panels_3[2])]
        for t, txt in timings:
            txt_md = txt.replace("\n", "<br>") if txt else "—"
            out(f"| `{t}` | {txt_md} |")
        out("")
        out("### Cartão final (00:21.0 – 00:25.0)")
        out("")
        for i, line in enumerate(cartao, 1):
            style = {1: "Cormorant Garamond italic 44px dourado #E8C97A",
                     2: "Inter 32px cream #F5F0E6",
                     3: "Inter 28px cream #F5F0E6"}.get(i, "Inter 24px cream")
            out(f"- **Linha {i}** ({style}): *{line}*")
        out("")
        out("---")
        out("")

    out("## Fluxo de produção condensado")
    out("")
    out("```bash")
    out("# 1. Gerar 90 imagens MJ a partir dos prompts acima (Discord ou API).")
    out("#    Convenção: assets/trinta-manhas/imagens/cap-NN-{1,2,3}.jpg")
    out("")
    out("# 2. Gerar 8 trilhas AG (ElevenLabs Music) a partir dos prompts da tabela.")
    out("#    Convenção: assets/trinta-manhas/musica/veu-{nome}.mp3")
    out("")
    out("# 3. Render dos 30 shorts:")
    out("python3 tools/contos-mensais/render-slideshow.py            # todos")
    out("python3 tools/contos-mensais/render-slideshow.py 1 7        # caps 1-7")
    out("python3 tools/contos-mensais/render-slideshow.py 15 15      # só cap 15")
    out("")
    out("# 4. Regenerar copy CSV e importar no Metricool:")
    out("python3 tools/contos-mensais/generate-metricool-csv.py")
    out("```")

    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"OK · {OUT.relative_to(REPO_ROOT)}  ({len(lines)} linhas)")


if __name__ == "__main__":
    write_md()
