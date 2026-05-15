#!/usr/bin/env bash
# Wrapper de conveniência sobre render-slideshow.py (Python).
# Pipeline atual: slideshow editorial sem voz — 3 imagens MJ + drawtext + música AG.
# Ver MES-01-JUNHO-2026-SLIDESHOW.md para prompts, painéis e timings.
#
# Uso:
#   bash tools/contos-mensais/render-batch.sh                # todos os 30
#   bash tools/contos-mensais/render-batch.sh 1 7            # caps 1-7
#   bash tools/contos-mensais/render-batch.sh 15 15          # só o cap 15
#   bash tools/contos-mensais/render-batch.sh --dry-run      # imprime ffmpeg sem correr

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
exec python3 "$REPO_ROOT/tools/contos-mensais/render-slideshow.py" "$@"
