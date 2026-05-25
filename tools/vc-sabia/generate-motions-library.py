#!/usr/bin/env python3
"""
Gerador da biblioteca mensal de prompts Midjourney para vc-sabia.

Produz docs/vc-sabia/MOTIONS-LIBRARY.md a partir de
escola-veus-app/src/data/vc-sabia-motions.seed.json (fonte unica que
o componente PromptsLibrary tambem consome em-app).

Para editar/acrescentar imagens: editar o JSON e correr este script.

Cada prompt e construido por concatenacao deterministica de:
  - SUBJECT (especifico da variante)
  - ATMOSPHERE (partilhado por categoria)
  - STYLE_BASE (partilhado por toda a biblioteca)
  - MOOD_HINT (consoante o audio do post)
  - SUFFIX --ar 9:16 --style raw --stylize 200 --quality 1 --video

Uso:
  python3 tools/vc-sabia/generate-motions-library.py
"""
from __future__ import annotations

import json
from datetime import date, timedelta
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
SEED_PATH = REPO_ROOT / "escola-veus-app" / "src" / "data" / "vc-sabia-motions.seed.json"
PHRASES_PATH = REPO_ROOT / "escola-veus-app" / "src" / "data" / "vc-sabia-frases.seed.json"
OUT_PATH = REPO_ROOT / "docs" / "vc-sabia" / "MOTIONS-LIBRARY.md"
CAL_OUT_PATH = REPO_ROOT / "docs" / "vc-sabia" / "CALENDARIO-IMAGENS-6MESES.md"


def load_seed() -> dict:
    return json.loads(SEED_PATH.read_text(encoding="utf-8"))


SEED = load_seed()
STYLE_BASE: str = SEED["style_base"]
SUFFIX: str = SEED["suffix"]
MOOD_HINTS: dict[str, str] = SEED["mood_hints"]
CATEGORIES: list[dict] = SEED["categories"]



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
    start = date(2026, 7, 1)
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


DOW_PT = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]


def _normalize(s: str) -> str:
    import unicodedata
    n = unicodedata.normalize("NFD", s)
    n = "".join(c for c in n if unicodedata.category(c) != "Mn")
    return n.lower()


def match_category_for_phrase(
    phrase_text: str,
    phrase_tema: str,
    usage_counts: dict[str, int],
) -> tuple[dict, str]:
    """Devolve (categoria, modo).

    1. Keyword match: primeira keyword que bate na frase normalizada.
    2. Tema fallback: categoria com mesmo tema E menor uso (distribui).
    3. Ultimo recurso: categoria com menor uso global.
    """
    norm = _normalize(phrase_text)
    norm_padded = f" {norm} "
    for cat in CATEGORIES:
        for kw in cat.get("keywords", []):
            kn = _normalize(kw)
            if " " in kn:
                if kn in norm:
                    return cat, "keyword"
            else:
                if f" {kn} " in norm_padded or f" {kn}s " in norm_padded:
                    return cat, "keyword"
    # fallback tema — pega a categoria menos usada dentro do mesmo tema
    same_tema = [c for c in CATEGORIES if c["tema"] == phrase_tema]
    if same_tema:
        best = min(same_tema, key=lambda c: usage_counts.get(c["name"], 0))
        return best, "tema"
    # ultimo recurso — menos usada globalmente
    best = min(CATEGORIES, key=lambda c: usage_counts.get(c["name"], 0))
    return best, "fallback"


def calendar_markers(d: date) -> list[str]:
    """Marcadores do dia: abertura/encerramento de mes ou ano, solsticios, equinocios."""
    markers: list[str] = []
    next_day = d + timedelta(days=1)
    last_of_month = next_day.day == 1
    if d.month == 1 and d.day == 1:
        markers.append("1.º dia do ano")
    if d.month == 12 and d.day == 31:
        markers.append("último dia do ano")
    if d.day == 1:
        markers.append("abertura de mês")
    if last_of_month:
        markers.append("encerramento de mês")
    if 14 <= d.day <= 16:
        markers.append("meio do mês")
    if d.weekday() == 6:
        markers.append("domingo")
    def in_window(m: int, target_d: int) -> bool:
        return d.month == m and abs(d.day - target_d) <= 1
    if in_window(12, 21):
        markers.append("solstício de inverno")
    if in_window(6, 21):
        markers.append("solstício de verão")
    if in_window(3, 20):
        markers.append("equinócio da primavera")
    if in_window(9, 22):
        markers.append("equinócio de outono")
    return markers


def render_calendar() -> str:
    phrases = json.loads(PHRASES_PATH.read_text(encoding="utf-8"))["frases"]
    n_phrases = len(phrases)
    start = date(2026, 7, 1)
    total_days = 184  # Julho-Dezembro 2026

    variant_cursor: dict[str, int] = {}
    usage_counts: dict[str, int] = {}

    lines: list[str] = []
    lines.append("# VC Sabia · Calendário de Imagens · 6 meses")
    lines.append("")
    lines.append(
        f"Plano dia-a-dia de **{total_days} posts** ({start.isoformat()} → "
        f"{(start + timedelta(days=total_days - 1)).isoformat()}), no mesmo "
        "formato do `MES-01-JUNHO-2026-SLIDESHOW.md` (Trinta Manhãs)."
    )
    lines.append("")
    lines.append(
        "**Alinhamento frase ↔ imagem:** a categoria visual é escolhida pelo "
        "substantivo da frase (girassol → Girassóis, lótus → Reflexos na água "
        "com keyword `lotus`, baobá → Árvores com neblina, etc). Se a frase não "
        "tem substantivo natureza claro, cai por tema vc-sabia. Variante visual "
        "roda por categoria (cursor independente), nunca repete a mesma imagem "
        "antes de esgotar as 8 variantes."
    )
    lines.append("")
    lines.append("## Estilo fixo")
    lines.append("")
    lines.append("> *" + STYLE_BASE + "*")
    lines.append("")
    lines.append("```")
    lines.append(SUFFIX)
    lines.append("```")
    lines.append("")
    lines.append("---")
    lines.append("")

    current_month = (0, 0)
    months_pt = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
    ]

    for i in range(total_days):
        d = start + timedelta(days=i)
        if (d.year, d.month) != current_month:
            current_month = (d.year, d.month)
            lines.append("")
            lines.append(f"# {months_pt[d.month - 1]} {d.year}")
            lines.append("")

        phrase = phrases[i % n_phrases]
        cat, match_mode = match_category_for_phrase(phrase["texto"], phrase["tema"], usage_counts)
        usage_counts[cat["name"]] = usage_counts.get(cat["name"], 0) + 1
        cursor = variant_cursor.get(cat["name"], 0)
        variant_idx = cursor % len(cat["subjects"])
        variant_cursor[cat["name"]] = cursor + 1
        subject = cat["subjects"][variant_idx]

        markers = calendar_markers(d)
        marker_str = " · ".join(markers) if markers else ""
        dow = DOW_PT[d.weekday()]

        header = f"## DIA {i + 1:03d} · {dow} {d.isoformat()} · {cat['name']}"
        if marker_str:
            header += f"  ·  *{marker_str}*"
        lines.append(header)
        lines.append("")
        lines.append(f"**Frase:** *Sabias que… {phrase['texto']}*")
        lines.append("")
        match_label = {
            "keyword": "🎯 keyword",
            "tema": "🎨 por tema",
            "fallback": "⚠ fallback",
        }[match_mode]
        lines.append(
            f"**Alinhamento:** {match_label}  ·  "
            f"**Tema:** `{cat['tema']}` (frase `{phrase['id']}` · tema `{phrase['tema']}`)  ·  "
            f"**Mood áudio:** `{cat['mood']}`  ·  "
            f"**Variante visual:** v{variant_idx + 1}/{len(cat['subjects'])}"
        )
        lines.append("")
        lines.append("### Prompt Midjourney")
        lines.append("")
        lines.append("```")
        lines.append(build_prompt(subject, cat["atmosphere"], cat["mood"]))
        lines.append("```")
        lines.append("")
        lines.append("---")
        lines.append("")

    # estatistica final
    counts: dict[str, int] = {}
    for c in CATEGORIES:
        counts[c["name"]] = variant_cursor.get(c["name"], 0)
    lines.append("")
    lines.append(f"## Distribuição ({total_days} dias)")
    lines.append("")
    lines.append("| Categoria | Tema | Usos | Vezes variante 1× repete |")
    lines.append("|---|---|---|---|")
    for c in CATEGORIES:
        n = counts[c["name"]]
        rep = max(0, n - len(c["subjects"]))
        lines.append(f"| {c['name']} | `{c['tema']}` | {n} | {rep} |")
    lines.append("")

    return "\n".join(lines) + "\n"


def main():
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(render_doc(), encoding="utf-8")
    total = sum(len(c["subjects"]) for c in CATEGORIES)
    print(f"OK · {total} prompts ({len(CATEGORIES)} categorias) escritos em {OUT_PATH.relative_to(REPO_ROOT)}")
    print(f"  · Calendário (tabelas): 6 meses (2026-06-01 → 2026-11-30, ~180 dias)")

    CAL_OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    CAL_OUT_PATH.write_text(render_calendar(), encoding="utf-8")
    print(f"OK · 180 dias dia-a-dia escritos em {CAL_OUT_PATH.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
