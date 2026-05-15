#!/usr/bin/env python3
"""Render dos 30 slideshows "Trinta Manhãs" (Junho 2026).

Cada short:
  - 3 imagens MJ em assets/trinta-manhas/imagens/cap-NN-{1,2,3}.jpg
  - 1 trilha AG em assets/trinta-manhas/musica/veu-{nome}.mp3 (compartilhada por véu)
  - 3 painéis de texto + 1 cartão final (frase-âncora + Continua/Recomeça [+ link em caps âncora])
  - 1080×1920, 25s, H.264, ~5-8MB

Uso:
    python3 tools/contos-mensais/render-slideshow.py            # todos os 30
    python3 tools/contos-mensais/render-slideshow.py 1 7        # caps 1-7
    python3 tools/contos-mensais/render-slideshow.py 15 15      # só o 15
    python3 tools/contos-mensais/render-slideshow.py --dry-run  # imprime comandos

Override de fonts:
    FONT_SERIF=/path/CormorantGaramond-Italic.ttf python3 ... # para a frase-âncora
    FONT_SANS=/path/Inter-Regular.ttf python3 ...
"""
from __future__ import annotations

import os
import sys
import subprocess
import tempfile
from pathlib import Path
from importlib.machinery import SourceFileLoader

REPO_ROOT = Path(__file__).resolve().parents[2]
TOOLS = REPO_ROOT / "tools" / "contos-mensais"
ASSETS = REPO_ROOT / "assets" / "trinta-manhas"
RENDERS = REPO_ROOT / "renders" / "trinta-manhas"

content = SourceFileLoader("content", str(TOOLS / "content.py")).load_module()
gen = SourceFileLoader("gen", str(TOOLS / "generate-metricool-csv.py")).load_module()
md_gen = SourceFileLoader("md", str(TOOLS / "generate-slideshow-md.py")).load_module()

W, H = 1080, 1920
TOTAL_DUR = 25.0
T_IMG2 = 7.0   # cross-fade img1→img2 starts
T_IMG3 = 14.0  # cross-fade img2→img3 starts
T_CARD = 21.0  # card window starts

FONT_SERIF = os.environ.get(
    "FONT_SERIF",
    "/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf",
)
FONT_SANS = os.environ.get(
    "FONT_SANS",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
)

CREAM = "0xF5F0E6"
GOLD = "0xE8C97A"


def _drawtext(textfile: Path, fontfile: str, fontsize: int, color: str,
              y_expr: str, start: float, end: float, fade: float = 0.4) -> str:
    """Constrói uma cláusula drawtext FFmpeg com alpha-fade in/out por janela temporal."""
    fade_out = 0.3
    alpha = (
        f"if(lt(t,{start}),0,"
        f"if(lt(t,{start}+{fade}),(t-{start})/{fade},"
        f"if(lt(t,{end - fade_out}),1,"
        f"if(lt(t,{end}),({end}-t)/{fade_out},0))))"
    )
    parts = [
        f"drawtext=fontfile='{fontfile}'",
        f"textfile='{textfile}'",
        "reload=0",
        f"fontsize={fontsize}",
        f"fontcolor={color}",
        "borderw=2",
        "bordercolor=0x000000@0.55",
        "shadowx=0",
        "shadowy=2",
        "shadowcolor=0x000000@0.6",
        "text_align=center",
        "line_spacing=8",
        "x=(w-text_w)/2",
        f"y={y_expr}",
        f"alpha='{alpha}'",
    ]
    return ":".join(parts)


def _write(d: Path, name: str, text: str) -> Path:
    p = d / name
    p.write_text(text, encoding="utf-8")
    return p


def render_cap(cap_n: int, dry_run: bool = False) -> bool:
    veu = content.CAP_TRACK[cap_n]
    img1 = ASSETS / "imagens" / f"cap-{cap_n:02d}-1.jpg"
    img2 = ASSETS / "imagens" / f"cap-{cap_n:02d}-2.jpg"
    img3 = ASSETS / "imagens" / f"cap-{cap_n:02d}-3.jpg"
    music = ASSETS / "musica" / f"veu-{veu}.mp3"
    out = RENDERS / f"trinta-manhas-cap-{cap_n:02d}.mp4"

    missing = [str(p.relative_to(REPO_ROOT)) for p in (img1, img2, img3, music) if not p.exists()]
    if missing:
        print(f"  CAP {cap_n:02d} ✗ falta: " + ", ".join(missing))
        return False

    entry = next(e for e in gen.CAPITULOS if e[0] == cap_n)
    copy_ig = entry[4]
    raw_panels = md_gen.panels_from_copy_ig(copy_ig)
    panels = md_gen.normalize_to_three(raw_panels)
    anchor = content.SHOTS[cap_n]["anchor"]
    card = content.card_lines(cap_n, anchor)

    RENDERS.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix=f"trinta-{cap_n:02d}-") as td_str:
        td = Path(td_str)
        tf_p1 = _write(td, "p1.txt", panels[0])
        tf_p2 = _write(td, "p2.txt", panels[1])
        tf_p3 = _write(td, "p3.txt", panels[2])
        tf_c1 = _write(td, "c1.txt", card[0])
        tf_c2 = _write(td, "c2.txt", card[1]) if len(card) > 1 else None
        tf_c3 = _write(td, "c3.txt", card[2]) if len(card) > 2 else None
        tf_num = _write(td, "num.txt", f"{cap_n}/30")

        # Pré-processamento das 3 imagens — scale + crop, durações que cobrem o slot + xfade margin.
        v1 = (
            f"[0:v]scale={W}:{H}:force_original_aspect_ratio=increase,"
            f"crop={W}:{H},setsar=1,fps=30,trim=duration=8.5,setpts=PTS-STARTPTS[v1pre]"
        )
        v2 = (
            f"[1:v]scale={W}:{H}:force_original_aspect_ratio=increase,"
            f"crop={W}:{H},setsar=1,fps=30,trim=duration=8.5,setpts=PTS-STARTPTS[v2pre]"
        )
        v3 = (
            f"[2:v]scale={W}:{H}:force_original_aspect_ratio=increase,"
            f"crop={W}:{H},setsar=1,fps=30,trim=duration=12,setpts=PTS-STARTPTS[v3pre]"
        )

        xf1 = f"[v1pre][v2pre]xfade=transition=fade:duration=1:offset=7[vx12]"
        xf2 = f"[vx12][v3pre]xfade=transition=fade:duration=1:offset=14[vbase]"

        darken = (
            f"[vbase]drawbox=x=0:y=0:w={W}:h={H}:color=black@0.45:t=fill:"
            f"enable='gte(t,{T_CARD})'[vdark]"
        )

        # Top-right N/30 (sempre visível)
        dt_num = (
            f"drawtext=fontfile='{FONT_SANS}':textfile='{tf_num}':"
            f"fontsize=26:fontcolor={CREAM}:"
            f"borderw=1:bordercolor=0x000000@0.7:"
            f"x=w-tw-40:y=50"
        )

        # 3 painéis no terço inferior
        dt_p1 = _drawtext(tf_p1, FONT_SERIF, 46, CREAM, "h*0.70", 0.5, 7.0, fade=0.5)
        dt_p2 = _drawtext(tf_p2, FONT_SERIF, 46, CREAM, "h*0.70", 8.0, 14.0, fade=0.5)
        dt_p3 = _drawtext(tf_p3, FONT_SERIF, 46, CREAM, "h*0.70", 15.0, 21.0, fade=0.5)

        # Cartão final — frase-âncora em dourado + 1-2 linhas em cream
        dt_c1 = _drawtext(tf_c1, FONT_SERIF, 54, GOLD, "h*0.42", T_CARD, TOTAL_DUR, fade=0.6)

        clauses = [v1, v2, v3, xf1, xf2, darken]

        chain = f"[vdark]{dt_num},{dt_p1},{dt_p2},{dt_p3},{dt_c1}[vc1]"
        clauses.append(chain)
        last_label = "vc1"

        if tf_c2:
            dt_c2 = _drawtext(tf_c2, FONT_SANS, 38, CREAM, "h*0.55", T_CARD + 0.5, TOTAL_DUR, fade=0.5)
            clauses.append(f"[{last_label}]{dt_c2}[vc2]")
            last_label = "vc2"
        if tf_c3:
            dt_c3 = _drawtext(tf_c3, FONT_SANS, 32, CREAM, "h*0.62", T_CARD + 1.0, TOTAL_DUR, fade=0.5)
            clauses.append(f"[{last_label}]{dt_c3}[vc3]")
            last_label = "vc3"

        clauses.append(
            f"[3:a]aloop=loop=-1:size=2e9,atrim=duration={TOTAL_DUR},"
            f"volume=-14dB,afade=in:st=0:d=0.8,afade=out:st={TOTAL_DUR - 2}:d=2[a]"
        )

        filtergraph = ";".join(clauses)

        cmd = [
            "ffmpeg", "-hide_banner", "-y",
            "-loop", "1", "-t", "8.5", "-i", str(img1),
            "-loop", "1", "-t", "8.5", "-i", str(img2),
            "-loop", "1", "-t", "12",  "-i", str(img3),
            "-i", str(music),
            "-filter_complex", filtergraph,
            "-map", f"[{last_label}]", "-map", "[a]",
            "-c:v", "libx264", "-preset", "medium", "-crf", "22", "-pix_fmt", "yuv420p",
            "-r", "30",
            "-c:a", "aac", "-b:a", "128k",
            "-t", str(TOTAL_DUR),
            "-movflags", "+faststart",
            str(out),
        ]

        if dry_run:
            print(f"\n# CAP {cap_n:02d}")
            print(" ".join(cmd))
            return True

        try:
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
            size_mb = out.stat().st_size / 1024 / 1024
            print(f"  CAP {cap_n:02d} ✓ {out.name} ({size_mb:.1f}MB)")
            return True
        except subprocess.CalledProcessError as e:
            print(f"  CAP {cap_n:02d} ✗ ffmpeg falhou")
            print(e.stderr.decode("utf-8", errors="replace")[-1200:])
            return False


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    flags = [a for a in sys.argv[1:] if a.startswith("--")]
    dry_run = "--dry-run" in flags

    start = int(args[0]) if len(args) >= 1 else 1
    end = int(args[1]) if len(args) >= 2 else 30

    print(f"Trinta Manhãs · slideshow render · caps {start}-{end}")
    print(f"FONT_SERIF = {FONT_SERIF}")
    print(f"FONT_SANS  = {FONT_SANS}")
    if not Path(FONT_SERIF).exists():
        print(f"⚠ FONT_SERIF não existe — override via env var FONT_SERIF")
    if not Path(FONT_SANS).exists():
        print(f"⚠ FONT_SANS não existe — override via env var FONT_SANS")

    ok = fail = 0
    for n in range(start, end + 1):
        if render_cap(n, dry_run=dry_run):
            ok += 1
        else:
            fail += 1

    print(f"\nFim · {ok} ok · {fail} a fazer")


if __name__ == "__main__":
    main()
