#!/usr/bin/env python3
"""
Prepara as imagens para treino do LoRA no Kohya SS.

O que faz:
1. Redimensiona todas as imagens para 1024x1024 (SDXL)
2. Converte para RGB (remove alpha channel se existir)
3. Copia os .txt (captions) para a pasta de treino
4. Organiza na estrutura que o Kohya SS espera

Uso:
    python preparar-imagens.py

Requer: pip install Pillow
"""

import os
import shutil
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("ERRO: Pillow nao instalado. Corre: pip install Pillow")
    exit(1)

# Paths
IMAGENS_DIR = Path(__file__).parent.parent / "imagens"
OUTPUT_DIR = Path(__file__).parent / "dataset" / "seteveus" / "20_seteveus_style"

# A pasta "20_seteveus_style" segue a convencao do Kohya SS:
# {repeticoes}_{trigger_word}
# 20 repeticoes x 59 imagens = 1180 steps por epoch
# Com 20 epochs = ~23600 steps total

TARGET_SIZE = 1024  # SDXL base resolution


def preparar():
    # Criar pasta de output
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    png_files = sorted(IMAGENS_DIR.glob("*.png"))
    txt_files = sorted(IMAGENS_DIR.glob("*.txt"))

    print(f"Encontradas {len(png_files)} imagens PNG")
    print(f"Encontrados {len(txt_files)} ficheiros de caption")
    print(f"Output: {OUTPUT_DIR}")
    print()

    processadas = 0

    for png_file in png_files:
        txt_file = png_file.with_suffix(".txt")

        if not txt_file.exists():
            print(f"  AVISO: Sem caption para {png_file.name}, a saltar...")
            continue

        # Abrir e redimensionar imagem
        img = Image.open(png_file)

        # Converter para RGB (remover alpha)
        if img.mode != "RGB":
            img = img.convert("RGB")

        # Redimensionar para 1024x1024 mantendo aspect ratio com crop central
        width, height = img.size
        min_dim = min(width, height)

        # Crop central quadrado
        left = (width - min_dim) // 2
        top = (height - min_dim) // 2
        right = left + min_dim
        bottom = top + min_dim
        img = img.crop((left, top, right, bottom))

        # Resize para target
        img = img.resize((TARGET_SIZE, TARGET_SIZE), Image.LANCZOS)

        # Guardar imagem
        output_img = OUTPUT_DIR / png_file.name
        img.save(output_img, "PNG", quality=95)

        # Copiar caption
        output_txt = OUTPUT_DIR / txt_file.name
        shutil.copy2(txt_file, output_txt)

        processadas += 1
        print(f"  OK: {png_file.name}")

    print()
    print(f"Processadas {processadas} imagens com sucesso.")
    print(f"Dataset pronto em: {OUTPUT_DIR}")
    print()
    print("Proximos passos:")
    print("1. Transfere a pasta 'dataset/' para o ThinkDiffusion")
    print("2. Segue o guia em GUIA-TREINO-LORA.md")


if __name__ == "__main__":
    preparar()
