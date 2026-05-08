# 🎵 LORANNE — 5 álbuns Elevar/Gospel

## Contexto da tarefa

Catálogo Loranne actual: 168 álbuns escritos, 19 produzidos. Análise da cobertura por mood revelou défice em **Elevar** — só 12 tracks reais de gospel/libertação espiritual, e várias dessas são metáfora física (treino, salto). Vivianne quer **5 álbuns NOVOS** que encham o Elevar com gospel real.

## Restrições

**Slugs proibidos** (já existem outros álbuns com palavras-chave próximas): `festa, voz, luz, coroa`.

**Conteúdo proibido** — não te sobreponhas a estes 19 álbuns existentes:

```
incenso-frequencia, incenso-salto-bonito, incenso-maos-abertas,
incenso-maos-juntas, incenso-oferenda, incenso-folego,
livro-filosofico, espelho-ilusao, fibra-sangue-aceso, fibra-corpo-aberto,
eter-raiz-vermelha, eter-viagem, sangue-raiz, sangue-mae,
nua-inteira, nua-por-dentro, nua-boa, nua-duas-vozes, grao-o-tear
```

## Os 5 álbuns

### 1. ACENDE (`incenso-acende`) — `#FFB347`

Para quem está em rock-bottom (depressão, luto, falência, anos sem sentir). **A pequena chama que volta sem permissão.** Ressurreição involuntária. NÃO é "tudo vai ficar bem" — é o testemunho.

### 2. CORO (`incenso-coro`) — `#E8B86F`

Para quem se sente isolada na sua dor (diáspora, mãe solo, "só eu sei"). **Vozes que se unem · ubuntu · não sozinha.** Voicings colectivos, choros, hand claps, "eu sou porque tu és". Centralidade africana.

### 3. MILAGRE (`incenso-milagre`) — `#D4A853`

Para quem desistiu de pedir e mesmo assim a coisa aparece. **Graça pequena, súbita, não pedida.** O café quente sem pedir. A mensagem aos 4 da manhã. A pessoa certa no autocarro. Misericórdias do quotidiano.

### 4. AMEN (`incenso-amen`) — `#A088C0`

Para quem luta contra o que já é (diagnóstico, idade, perda irreversível). **Receber. Render-se. Dizer sim.** Não resignação — entrega activa. O alívio de parar de empurrar a água.

### 5. ALELUIA (`incenso-aleluia`) — `#E07050`

Para quem perdeu o riso (anos a aguentar, a sobreviver). **Alegria como resistência. Festa antes da razão.** Marrabenta + gospel + house. Suor que vira oração. Celebrar como acto político.

## Mix de energy/flavor para Elevar

Maioria das 50 tracks com `flavor: "gospel"` ou `energy: "anthem"`. **Não todas** — varia o arco dentro do álbum.

Por álbum (10 tracks):

```
Track  Energy           Função
1      whisper/raw      Abertura — onde a pessoa está
2      raw              Reconhecimento
3-4    steady/pulse     Primeiro movimento
5      anthem+gospel    1º PEAK
6      whisper          Recolher
7      raw/steady       Reabrir
8      pulse/anthem     2º PEAK
9      anthem+gospel    PEAK FINAL
10     whisper          Outro — o que fica
```

Aleluia pode ter 3 anthems (mais celebração). Amen pode ter mais whispers (entrega).

## Output — JSON puro, sem preâmbulo

```json
{
  "albums": [
    {
      "slug": "incenso-acende",
      "title": "Acende",
      "subtitle": "...",
      "mood": "elevar",
      "color": "#FFB347",
      "purpose": "Para quem está em rock-bottom — a chama que volta sem permissão.",
      "tracks": [
        {
          "number": 1,
          "title": "Pequena Chama",
          "description": "A luz mais pequena que sobreviveu — a primeira a notar.",
          "lang": "PT",
          "energy": "whisper",
          "flavor": null,
          "lyrics": "[Intro]\n...\n\n[Verse 1]\n...\n\n[Chorus]\n...",
          "keyVerse": "Não me apaguei toda. / Repara: ainda há fogo aqui dentro.",
          "sunoPrompt": "Style: ambient gospel · intimate whisper · piano + soft pads · single voice close-mic, breath audible · hand-claps entering at chorus 2 · 60-70bpm building to 90 · 3:30 length · key Db major · Track 1 of Acende (Loranne)"
        }
      ]
    }
  ]
}
```

## Regras do `sunoPrompt`

- EN, 200-400 chars
- Inclui: style · genre · instrumentação · vocal · tempo (BPM range) · duração · key · ID ("Track N of [álbum] (Loranne)")
- Gospel: refere "gospel choir entering at chorus", "anthemic release", "warm Hammond", "tambourine"
- Whisper: "intimate close-mic", "breath audible", "minimal arrangement"
- Marrabenta (Aleluia): "polyrhythmic percussion", "timbila", "walking bass"

## Regras do `keyVerse`

1-2 versos, 25-70 chars, cantável fora de contexto, vai sobrepor-se em shorts.

## Distribuição PT/EN

Por álbum: ~60% PT + ~40% EN. Tracks alternam, raramente bilingue na mesma. Mistura intencional só em chorus PT + bridge EN ou similar.

## Distribuição de mood secundário (opcional)

Cada track pode ter mood secundário além de Elevar:

- Acende → secundário `atravessar` (limiar) ou `respirar`
- Coro → secundário `lembrar` (raiz, ubuntu)
- Milagre → secundário `respirar`
- Amen → secundário `atravessar` (entrega)
- Aleluia → secundário `aterrar` (corpo, dança)

Adiciona campo `moodSecondary` opcional no JSON quando aplicável.

## Entrega

50 tracks completas — `lyrics` integrais (verses + chorus + bridges), `keyVerse` e `sunoPrompt` cada uma. JSON puro, num só output, sem markdown fences, sem comentários.

Podes começar por **só Acende (10 tracks)** para validação rápida. Depois sigues para os 4 restantes num segundo output.

Começa.
