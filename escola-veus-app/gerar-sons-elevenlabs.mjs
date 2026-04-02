/**
 * Gerador de Sons — ElevenLabs Sound Effects API
 * Os Sete Véus
 *
 * Uso:
 *   ELEVENLABS_API_KEY=sk-... node scripts/gerar-sons-elevenlabs.mjs
 *
 * Os sons são guardados em: public/sons/
 * Depois podes misturá-los com os áudios no Audacity, GarageBand, CapCut, etc.
 */

import fs from 'fs'
import path from 'path'
import https from 'https'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = path.join(__dirname, '../public/sons')
const API_KEY = process.env.ELEVENLABS_API_KEY

if (!API_KEY) {
  console.error('❌  Falta a API key. Corre assim:')
  console.error('   ELEVENLABS_API_KEY=sk-... node scripts/gerar-sons-elevenlabs.mjs')
  process.exit(1)
}

// Sons a gerar — edita os prompts à vontade
const SONS = [

  // ── TRANSIÇÕES (usas no início e fim de cada prática) ─────────────────────
  {
    ficheiro: 'sino-abertura.mp3',
    descricao: 'Single Tibetan singing bowl strike, resonant and warm, slowly fading into silence',
    duracao: 8,
  },
  {
    ficheiro: 'sino-fecho.mp3',
    descricao: 'Soft Tibetan bowl gong, gentle fade in then slow decay into complete silence',
    duracao: 10,
  },
  {
    ficheiro: 'transicao-suspiro.mp3',
    descricao: 'Soft gentle exhale breath sound, peaceful, barely audible, like wind through silk',
    duracao: 5,
  },

  // ── DRONES / FUNDO (um por véu, ~22 segundos — podes fazer loop) ──────────
  {
    ficheiro: 'drone-ilusao.mp3',
    descricao: 'Ethereal soft drone, dreamlike haze, gentle high overtones, barely there, meditative',
    duracao: 22,
  },
  {
    ficheiro: 'drone-medo.mp3',
    descricao: 'Warm low drone, steady grounding hum, reassuring and gentle, like a heartbeat slowing',
    duracao: 22,
  },
  {
    ficheiro: 'drone-culpa.mp3',
    descricao: 'Soft warm tonal drone, forgiving and tender, like sunlight through thin curtains',
    duracao: 22,
  },
  {
    ficheiro: 'drone-identidade.mp3',
    descricao: 'Deep earthy resonant drone, grounding, still, like stone and root, meditative',
    duracao: 22,
  },
  {
    ficheiro: 'drone-controlo.mp3',
    descricao: 'Flowing water-like ambient drone, fluid, releasing, gentle movement, meditative',
    duracao: 22,
  },
  {
    ficheiro: 'drone-desejo.mp3',
    descricao: 'Warm glowing ambient hum, golden tones, soft and intimate, like candlelight as sound',
    duracao: 22,
  },
  {
    ficheiro: 'drone-separacao.mp3',
    descricao: 'Tender ambient drone, sense of coming home, gentle and whole, peaceful resolution',
    duracao: 22,
  },

  // ── NATUREZA (opcional, para as práticas de escrita guiada e limpeza) ──────
  {
    ficheiro: 'chuva-suave.mp3',
    descricao: 'Very soft gentle rain falling on leaves, peaceful, steady, quiet, meditative ambience',
    duracao: 22,
  },
  {
    ficheiro: 'vento-floresta.mp3',
    descricao: 'Gentle breeze through a forest, soft rustling leaves, peaceful, distant birds, quiet',
    duracao: 22,
  },
  {
    ficheiro: 'agua-riacho.mp3',
    descricao: 'Soft trickling stream, gentle water flowing over smooth stones, peaceful, quiet',
    duracao: 22,
  },
]

// ── API call ───────────────────────────────────────────────────────────────

function gerarSom(prompt, duracaoSegundos) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      text: prompt,
      duration_seconds: duracaoSegundos,
      prompt_influence: 0.3,
    })

    const options = {
      hostname: 'api.elevenlabs.io',
      path: '/v1/sound-generation',
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }

    const req = https.request(options, (res) => {
      if (res.statusCode !== 200) {
        let err = ''
        res.on('data', (d) => (err += d))
        res.on('end', () => reject(new Error(`HTTP ${res.statusCode}: ${err}`)))
        return
      }
      const chunks = []
      res.on('data', (chunk) => chunks.push(chunk))
      res.on('end', () => resolve(Buffer.concat(chunks)))
    })

    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  console.log(`\n🎵  Gerador de Sons — Os Sete Véus`)
  console.log(`📁  Output: public/sons/`)
  console.log(`🔢  Sons a gerar: ${SONS.length}\n`)

  let ok = 0
  let falhou = 0

  for (const som of SONS) {
    const destino = path.join(OUTPUT_DIR, som.ficheiro)

    // Salta se já existe
    if (fs.existsSync(destino)) {
      console.log(`⏭️   Já existe — ${som.ficheiro}`)
      ok++
      continue
    }

    process.stdout.write(`⏳  A gerar: ${som.ficheiro} ...`)

    try {
      const audio = await gerarSom(som.descricao, som.duracao)
      fs.writeFileSync(destino, audio)
      console.log(` ✓  (${(audio.length / 1024).toFixed(0)} KB)`)
      ok++
    } catch (err) {
      console.log(` ✗  ERRO: ${err.message}`)
      falhou++
    }

    // Pausa entre chamadas para não exceder rate limit
    await new Promise((r) => setTimeout(r, 1500))
  }

  console.log(`\n────────────────────────────────`)
  console.log(`✅  ${ok} sons gerados`)
  if (falhou > 0) console.log(`❌  ${falhou} falharam`)
  console.log(`📂  Pasta: public/sons/\n`)
  console.log(`Próximo passo: mistura estes sons com os teus áudios no Audacity ou CapCut.`)
}

main()
