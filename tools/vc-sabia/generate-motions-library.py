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
OUT_PATH = REPO_ROOT / "docs" / "vc-sabia" / "MOTIONS-LIBRARY.md"


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
