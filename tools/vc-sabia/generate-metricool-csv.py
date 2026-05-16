#!/usr/bin/env python3
"""
Gerador de CSV de bulk upload para Metricool — VC Sabia Que…?

Mesmo formato do `tools/contos-mensais/generate-metricool-csv.py`:
6 colunas `date,time,network,text,link,media`, todas com aspas (QUOTE_ALL).

Lê as frases de `escola-veus-app/src/data/vc-sabia-frases.seed.json`,
replica a logica de captions de `escola-veus-app/src/lib/vc-sabia/captions.ts`
(Sabias que… + frase + assinatura + hashtags por tema + base) e escreve:

  docs/vc-sabia/VC-SABIA-METRICOOL.csv

Por defeito agenda 1 post/dia a partir de 2026-06-01 (Instagram 10:00 + TikTok
10:30, hora Maputo, como no metricool-csv.ts em-app). O campo `media` aponta
para `vc-sabia-{id}.mp4` (ficheiro produzido pelo pipeline Remotion).

Uso:
  python3 tools/vc-sabia/generate-metricool-csv.py
"""
from __future__ import annotations

import csv
import json
from datetime import date, timedelta
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
SEED_PATH = REPO_ROOT / "escola-veus-app" / "src" / "data" / "vc-sabia-frases.seed.json"
OUT_PATH = REPO_ROOT / "docs" / "vc-sabia" / "VC-SABIA-METRICOOL.csv"

START_DATE = date(2026, 6, 1)
TIME_INSTAGRAM = "10:00"
TIME_TIKTOK = "10:30"

HASHTAGS_BASE = [
    "viviannedossantos", "seteveus", "escoladosveus",
    "manhãs", "despertar", "consciencia", "espiritualidade",
    "pt", "portugal",
]

HASHTAGS_POR_TEMA = {
    "autoconhecimento": ["autoconhecimento", "selfknowledge", "introspeccao"],
    "autoamor": ["autoamor", "amorproprio", "selflove"],
    "autoperdao": ["autoperdao", "liberta", "recomeço"],
    "florescer-no-tempo-certo": ["florescer", "lotusflower", "lotus", "paciencia"],
    "presenca-leve": ["presenca", "mindfulness", "aquiagora"],
    "suavidade-e-descanso": ["suavidade", "descanso", "equilibrio"],
    "sonhar-com-raizes": ["sonhar", "manifestar", "raizes"],
    "inteireza": ["inteireza", "integridade", "unidade"],
    "corpo-como-casa": ["corpo", "respiracao", "embodiment"],
    "confianca-no-caminho": ["confianca", "fé", "fluir"],
    "gratidao": ["gratidao", "gratitude", "abundancia"],
    "alegria-simples": ["alegria", "alegriasimples", "pequenasalegrias"],
    "beleza-de-existir": ["beleza", "poesiadavida", "manhã"],
}

HASHTAGS_TIKTOK_EXTRA = ["fyp", "foryou", "fypシ"]


def hashes(tags):
    return " ".join(f"#{t}" for t in tags)


def caption_instagram(phrase: str, theme: str) -> str:
    theme_tags = HASHTAGS_POR_TEMA.get(theme, [])
    all_tags = theme_tags + HASHTAGS_BASE
    return "\n".join([
        "Sabias que...",
        "",
        phrase,
        "",
        "Vivianne dos Santos · seteveus.space",
        "",
        ".", ".", ".",
        "",
        hashes(all_tags),
    ])


def caption_tiktok(phrase: str, theme: str) -> str:
    theme_tags = HASHTAGS_POR_TEMA.get(theme, [])
    tt_tags = HASHTAGS_TIKTOK_EXTRA + theme_tags + [
        "viviannedossantos", "seteveus", "manhãs", "pt",
    ]
    return "\n".join([
        f"Sabias que... {phrase}",
        "",
        hashes(tt_tags),
    ])


def build_rows():
    data = json.loads(SEED_PATH.read_text(encoding="utf-8"))
    rows = []
    for i, f in enumerate(data["frases"]):
        d = (START_DATE + timedelta(days=i)).isoformat()
        media = f"{f['id']}.mp4"
        rows.append({
            "date": d, "time": TIME_INSTAGRAM, "network": "Instagram",
            "text": caption_instagram(f["texto"], f["tema"]),
            "link": "", "media": media,
        })
        rows.append({
            "date": d, "time": TIME_TIKTOK, "network": "TikTok",
            "text": caption_tiktok(f["texto"], f["tema"]),
            "link": "", "media": media,
        })
    return rows


def write_csv(rows, out_path: Path):
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(
            f,
            fieldnames=["date", "time", "network", "text", "link", "media"],
            quoting=csv.QUOTE_ALL,
        )
        w.writeheader()
        w.writerows(rows)


def main():
    rows = build_rows()
    write_csv(rows, OUT_PATH)
    by_net = {}
    for r in rows:
        by_net[r["network"]] = by_net.get(r["network"], 0) + 1
    print(f"OK · {len(rows)} linhas escritas em {OUT_PATH.relative_to(REPO_ROOT)}")
    for net, n in sorted(by_net.items()):
        print(f"  · {net}: {n} posts")
    print(f"  · Início: {START_DATE.isoformat()} · Fim: {(START_DATE + timedelta(days=len(rows)//2 - 1)).isoformat()}")


if __name__ == "__main__":
    main()
