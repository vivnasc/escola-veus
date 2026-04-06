# Guia Completo: Treinar LoRA "seteveus_style" no ThinkDiffusion

## Resumo

- **Modelo base:** SDXL 1.0
- **Ferramenta:** Kohya SS (dentro do ThinkDiffusion)
- **Dataset:** 59 imagens + captions
- **Trigger word:** `seteveus_style`
- **Tempo estimado de treino:** 2-4 horas GPU
- **Custo estimado:** $2-4 (ThinkDiffusion Hobby) ou incluido no Pro ($19.99/mes)

---

## FASE 1: Preparar as Imagens (no teu computador)

### 1.1. Verificar que tens tudo

Na pasta `CURSOS/imagens/` deves ter:
- 59 ficheiros `.png` (as imagens)
- 59 ficheiros `.txt` (os captions — ja criados)

Cada `.txt` tem o mesmo nome que o `.png` correspondente:
```
01-ouro-proprio-casa-espelhos.png
01-ouro-proprio-casa-espelhos.txt
```

### 1.2. Executar o script de preparacao

```bash
cd CURSOS/lora-training
pip install Pillow
python preparar-imagens.py
```

Isto cria a pasta:
```
CURSOS/lora-training/dataset/seteveus/20_seteveus_style/
  ├── 01-ouro-proprio-casa-espelhos.png  (1024x1024)
  ├── 01-ouro-proprio-casa-espelhos.txt
  ├── 02-sangue-seda-arvore-raizes.png   (1024x1024)
  ├── 02-sangue-seda-arvore-raizes.txt
  └── ... (59 pares)
```

A convencao de nomes da pasta `20_seteveus_style` significa:
- `20` = numero de repeticoes por imagem por epoch
- `seteveus_style` = trigger word

### 1.3. Verificar os captions

Abre alguns `.txt` e confirma que:
- Comecam todos com `seteveus_style,`
- Descrevem a imagem com precisao
- Incluem tags de estilo consistentes: `oil painting style`, `moody atmospheric`, `editorial poetic illustration`
- Nao sao demasiado longos (ideal: 1-2 linhas)

Se quiseres editar algum caption, edita o `.txt` na pasta `CURSOS/imagens/` e volta a correr o script.

---

## FASE 2: Configurar o ThinkDiffusion

### 2.1. Aceder ao ThinkDiffusion

1. Vai a [thinkdiffusion.com](https://thinkdiffusion.com)
2. Faz login (ou cria conta)
3. Escolhe o plano:
   - **Hobby ($0.99/hora)** — bom para testar
   - **Pro ($19.99/mes)** — melhor se vais usar regularmente

### 2.2. Lancar o Kohya SS

1. No dashboard do ThinkDiffusion, clica **"Launch"**
2. Selecciona **"Kohya SS"** como aplicacao
3. Escolhe uma maquina com GPU:
   - **Minimo:** RTX 3090 (24GB VRAM) — suficiente para SDXL LoRA
   - **Ideal:** RTX 4090 ou A100 — mais rapido
4. Aguarda o ambiente iniciar (1-3 minutos)

### 2.3. Upload do dataset

Quando o Kohya SS abrir no browser:

1. Abre o **File Browser** (icone de pasta no ThinkDiffusion)
2. Navega ate `/workspace/` ou a pasta raiz
3. Faz upload de TODA a pasta `dataset/` que o script criou:
   ```
   dataset/
     seteveus/
       20_seteveus_style/
         (59 pares .png + .txt)
   ```
4. Confirma que a estrutura esta correcta no file browser

### 2.4. Upload do modelo base SDXL

Se o modelo SDXL nao estiver ja disponivel:

1. No File Browser, vai a `/workspace/models/` (ou pasta equivalente)
2. O modelo `sd_xl_base_1.0.safetensors` pode ja estar pre-instalado
3. Se nao estiver, podes descarrega-lo dentro do terminal do ThinkDiffusion:
   ```bash
   cd /workspace/models
   wget https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_base_1.0.safetensors
   ```

---

## FASE 3: Configurar o Treino no Kohya SS

### 3.1. Abrir o Kohya SS GUI

O Kohya SS abre como interface web. Vai ao separador **"LoRA"**.

### 3.2. Source model

| Campo | Valor |
|-------|-------|
| Model type | SDXL |
| Pretrained model | `/workspace/models/sd_xl_base_1.0.safetensors` |
| Save trained model as | safetensors |
| Save precision | fp16 |

### 3.3. Folders

| Campo | Valor |
|-------|-------|
| Training images folder | `/workspace/dataset/seteveus` |
| Output folder | `/workspace/output` |
| Logging folder | `/workspace/logs` |
| Model output name | `seteveus_style` |

**NOTA IMPORTANTE:** O "Training images folder" aponta para a pasta `seteveus/`, NAO para a pasta `20_seteveus_style/`. O Kohya SS le automaticamente as subpastas e interpreta o numero de repeticoes.

### 3.4. Training parameters

| Campo | Valor | Notas |
|-------|-------|-------|
| Train batch size | 1 | Com 24GB VRAM. Se tiveres A100 (80GB), podes usar 2-4 |
| Epoch | 20 | Total: 20 repeticoes x 59 imgs x 20 epochs = ~23600 steps |
| Save every N epochs | 1 | Para poderes comparar epochs |
| Mixed precision | fp16 | Obrigatorio para SDXL |
| Cache latents | ON | Acelera significativamente |
| Cache latents to disk | ON | |
| Clip skip | 2 | Standard para estilos artisticos |
| Seed | 42 | Reprodutibilidade |
| Gradient checkpointing | ON | Poupa VRAM |
| Noise offset | 0.05 | Melhora contraste escuro (importante para o nosso estilo dark) |

### 3.5. Optimizer

| Campo | Valor | Notas |
|-------|-------|-------|
| Optimizer | AdamW8bit | Bom equilibrio velocidade/qualidade |
| Learning rate | 1e-4 | Rate principal |
| Unet learning rate | 1e-4 | |
| Text encoder learning rate | 5e-5 | Metade do unet — queremos que aprenda o estilo visual, nao so as palavras |
| LR scheduler | cosine_with_restarts | Oscila para encontrar melhor resultado |
| LR warmup steps | 100 | Aquecimento suave |
| Number of cycles | 3 | Para o cosine_with_restarts |

### 3.6. Network (LoRA)

| Campo | Valor | Notas |
|-------|-------|-------|
| Network rank (dim) | 32 | Bom para estilo com 59 imagens. Se o resultado for fraco, tenta 64 |
| Network alpha | 16 | Metade do dim = regularizacao standard |
| Train UNet | ON | |
| Train Text Encoder | ON | |

### 3.7. Sample images (opcional mas recomendado)

| Campo | Valor |
|-------|-------|
| Sample every N epochs | 5 |
| Sample prompt | `seteveus_style, dark moody landscape with golden light, deep navy blue sky, oil painting style, atmospheric, editorial poetic illustration` |
| Sample sampler | Euler a |

Isto gera uma imagem de teste a cada 5 epochs para poderes ver a evolucao.

---

## FASE 4: Treinar

### 4.1. Iniciar o treino

1. Revisa todas as configuracoes
2. Clica **"Start Training"**
3. O treino demora **2-4 horas** dependendo da GPU:
   - RTX 3090: ~3-4 horas
   - RTX 4090: ~2-3 horas
   - A100: ~1.5-2 horas

### 4.2. Monitorizar

- O terminal mostra o progresso (loss, step, epoch)
- O loss deve descer gradualmente
- Loss tipico bom para LoRA: **0.06 - 0.10**
- Se o loss ficar abaixo de 0.04: possivel overfitting
- Se o loss nunca descer de 0.12: learning rate pode ser baixo

### 4.3. Resultado

Ao terminar, tera em `/workspace/output/`:
```
seteveus_style.safetensors          (ultimo epoch)
seteveus_style-000001.safetensors   (epoch 1)
seteveus_style-000005.safetensors   (epoch 5)
seteveus_style-000010.safetensors   (epoch 10)
seteveus_style-000015.safetensors   (epoch 15)
seteveus_style-000020.safetensors   (epoch 20)
```

E na pasta de samples, imagens de teste geradas nos epochs 5, 10, 15, 20.

---

## FASE 5: Testar no ComfyUI

### 5.1. Lancar ComfyUI no ThinkDiffusion

1. No dashboard do ThinkDiffusion, lanca o **ComfyUI**
2. Copia o ficheiro `seteveus_style.safetensors` para `/workspace/ComfyUI/models/loras/`

### 5.2. Workflow de teste

No ComfyUI, cria este workflow basico (ou importa o JSON em `comfyui-test-workflow.json`):

```
[CheckpointLoaderSimple] → modelo SDXL base
        ↓
[LoraLoader] → seteveus_style.safetensors (strength: 0.7-1.0)
        ↓
[CLIPTextEncode] → prompt positivo
[CLIPTextEncode] → prompt negativo
        ↓
[KSampler] → Steps: 30, CFG: 7, Sampler: euler_a, Scheduler: normal
        ↓
[VAEDecode] → [SaveImage]
```

### 5.3. Prompts de teste

Testa com diferentes cenarios para validar a consistencia:

**Teste 1 — Paisagem nova (que NAO existe no dataset):**
```
Positivo: seteveus_style, ancient library with floating golden books, deep navy blue walls, warm amber candlelight, oil painting style, moody atmospheric, editorial poetic illustration
Negativo: bright, colorful, cartoon, anime, photo, realistic face, text, watermark
```

**Teste 2 — Silhueta nova:**
```
Positivo: seteveus_style, faceless woman silhouette dancing with flowing golden fabric, deep navy blue background, terracotta and gold tones, oil painting style, moody atmospheric, editorial poetic illustration
Negativo: face, eyes, realistic skin, photo, bright colors, cartoon, text, watermark
```

**Teste 3 — Composicao nova:**
```
Positivo: seteveus_style, faceless woman silhouette standing before ancient tree with red leaves, deep navy blue night sky, golden moonlight, oil painting style, moody atmospheric, editorial poetic illustration
Negativo: face, realistic, photo, bright, cartoon, text, watermark
```

**Teste 4 — Territorio novo (que nao existe):**
```
Positivo: seteveus_style, vast dark ocean with golden light reflecting on water surface, deep navy blue sky, single small boat, oil painting style, moody atmospheric, editorial poetic illustration
Negativo: bright, colorful, cartoon, text, watermark, realistic face
```

### 5.4. Ajustar o LoRA strength

- **0.5-0.6** — Influencia subtil (bom para misturar com outros estilos)
- **0.7-0.8** — Equilibrio ideal (recomendado para producao)
- **0.9-1.0** — Estilo forte (pode ficar "queimado" se overfit)

Se o resultado estiver demasiado "queimado" ou repetitivo, usa um epoch anterior (ex: epoch 10 ou 15 em vez de 20) ou reduz o strength.

### 5.5. Qual epoch escolher?

Gera a mesma imagem com diferentes epochs e compara:
1. O estilo esta presente? (cores, mood, atmosfera)
2. A imagem e criativa? (nao e copia directa de uma imagem do dataset)
3. As proporcoes e composicao sao boas?

Normalmente, o **epoch 10-15** e o ponto ideal para 59 imagens com 20 repeticoes. O epoch 20 pode ter overfitting.

---

## FASE 6: Guardar e Integrar

### 6.1. Descarregar o LoRA

1. No File Browser do ThinkDiffusion, vai a `/workspace/output/`
2. Descarrega o `.safetensors` do epoch escolhido
3. Renomeia para `seteveus_style.safetensors`

### 6.2. Guardar no projecto

Coloca o ficheiro em:
```
CURSOS/lora-training/output/seteveus_style.safetensors
```

(NAO fazer commit do .safetensors ao git — e demasiado grande. Adicionar ao .gitignore.)

### 6.3. Upload para Supabase Storage (opcional)

Para usar via API mais tarde:
```bash
# Upload para bucket dedicado no Supabase
supabase storage cp seteveus_style.safetensors sb://lora-models/seteveus_style.safetensors
```

---

## Troubleshooting

### "CUDA out of memory"
- Reduz `train_batch_size` para 1
- Liga `gradient_checkpointing`
- Liga `cache_latents` e `cache_latents_to_disk`
- Usa `mixed_precision: fp16`

### O resultado nao se parece com o estilo
- Verifica se os captions comecam todos com `seteveus_style,`
- Aumenta as epochs (tenta 25-30)
- Aumenta o `network_dim` para 64
- Verifica se a pasta tem a estrutura correcta (`20_seteveus_style/`)

### O resultado e demasiado parecido com as imagens de treino (overfitting)
- Usa um epoch anterior (10 ou 15)
- Reduz as repeticoes de 20 para 15 (renomear pasta para `15_seteveus_style`)
- Reduz o learning rate para 5e-5
- Aumenta o noise_offset para 0.1

### Imagens de teste sao escuras demais
- O noise_offset de 0.05 ja ajuda com darks
- Se ainda for problema, aumenta para 0.1
- No prompt de geracao, adiciona "warm lighting" ou "golden light accents"

### O treino esta muito lento
- Confirma que `cache_latents` esta ON
- Confirma `mixed_precision: fp16`
- Usa GPU mais potente (A100 > 4090 > 3090)

---

## Resumo de Custos

| Item | Custo |
|------|-------|
| ThinkDiffusion Hobby (3-4h treino) | $3-4 |
| ThinkDiffusion Hobby (1h teste ComfyUI) | $1 |
| **Total para treinar e testar** | **~$4-5** |

Com ThinkDiffusion Pro ($19.99/mes), o treino esta incluido nas horas mensais.

---

## Proximo Passo

Com o LoRA treinado, o pipeline de producao fica:
1. Claude Code gera script da video-aula
2. Claude Code gera audio via ElevenLabs
3. Claude Code envia prompt ao ComfyUI (ThinkDiffusion) com o LoRA `seteveus_style`
4. ComfyUI gera imagens no estilo correcto
5. Assets armazenados no Supabase
6. Vivianne aprova

Para a integracao via API com o ComfyUI, ver documentacao em [docs.comfy.org](https://docs.comfy.org).
