#!/usr/bin/env bash
# Render em batch dos 30 shorts de "Trinta Manhãs" (Junho 2026).
#
# Cada capítulo combina:
#   1. Vídeo base (Ancient Ground ou outro stock vertical 1080x1920)
#   2. Narração feminina (WAV/MP3 mono)
#   3. Música Loranne (track instrumental sob a narração, -18dB)
#   4. SRT com legendas (queimadas via FFmpeg subtitles filter)
#   5. Vinheta de entrada (3s) + vinheta de saída (2s) opcionais
#
# Output: 1080x1920 H.264 30fps ≤30MB por short, MP4.
#
# Estrutura de assets esperada (criar antes de correr):
#   assets/trinta-manhas/
#     base/cap-NN.mp4         (vídeo base ~45s, 1080x1920)
#     narracao/cap-NN.wav     (narração ~30s)
#     musica/cap-NN.mp3       (track Loranne cortada)
#     srt/cap-NN.srt          (legendas a queimar)
#   renders/trinta-manhas/
#     trinta-manhas-cap-NN.mp4 (output)
#
# Uso:
#   bash tools/contos-mensais/render-batch.sh                # todos os 30
#   bash tools/contos-mensais/render-batch.sh 1 7            # caps 1-7
#   bash tools/contos-mensais/render-batch.sh 15 15          # só o cap 15

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ASSETS="$REPO_ROOT/assets/trinta-manhas"
OUT="$REPO_ROOT/renders/trinta-manhas"

# Estilo de legendas (alinhado com ESTADO-SHORTS-LORANNE-2026-05-11.md mas em dourado)
SUB_STYLE="FontName=Liberation Serif,FontSize=24,PrimaryColour=&H00E8C97A,OutlineColour=&H80000000,BorderStyle=3,Outline=2,Shadow=0,Alignment=2,MarginV=200,Italic=1"

MUSIC_DB="-18"   # ducking da música sob a narração
NARRATION_DB="0" # narração ao volume natural

START="${1:-1}"
END="${2:-30}"

mkdir -p "$OUT"

for i in $(seq -f "%02g" "$START" "$END"); do
    BASE="$ASSETS/base/cap-$i.mp4"
    NARRA="$ASSETS/narracao/cap-$i.wav"
    MUSIC="$ASSETS/musica/cap-$i.mp3"
    SRT="$ASSETS/srt/cap-$i.srt"
    OUT_FILE="$OUT/trinta-manhas-cap-$i.mp4"

    echo ""
    echo "=== CAP $i ==="

    for f in "$BASE" "$NARRA" "$MUSIC" "$SRT"; do
        if [[ ! -f "$f" ]]; then
            echo "  ✗ falta: $f"
            echo "  → pulando cap $i"
            continue 2
        fi
    done

    # 1. Mix de áudio: música -18dB + narração 0dB
    # 2. Vídeo base + subtitles burnt-in
    # 3. Crop/scale para 1080x1920 (caso o base não esteja exato)
    # 4. Encode H.264 + AAC
    ffmpeg -hide_banner -y \
        -i "$BASE" \
        -i "$NARRA" \
        -i "$MUSIC" \
        -filter_complex "
            [0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,subtitles='$SRT':force_style='$SUB_STYLE'[v];
            [2:a]volume=${MUSIC_DB}dB[bg];
            [1:a]volume=${NARRATION_DB}dB[nar];
            [bg][nar]amix=inputs=2:duration=longest:dropout_transition=0[a]
        " \
        -map "[v]" -map "[a]" \
        -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p \
        -r 30 \
        -c:a aac -b:a 128k \
        -shortest \
        -movflags +faststart \
        "$OUT_FILE"

    SIZE=$(du -h "$OUT_FILE" | cut -f1)
    echo "  ✓ $OUT_FILE ($SIZE)"
done

echo ""
echo "=== FIM ==="
ls -lh "$OUT"/*.mp4 2>/dev/null | awk '{print "  "$9, "→", $5}'
