import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/courses/preview-script
 *
 * Returns the script scenes for preview/editing before production.
 *
 * Body: { courseSlug, scriptType: "youtube" | "lesson", hookIndex?, moduleNum?, subLetter? }
 * Returns: { title, scenes: Array<{ type, narration, overlayText }> }
 */
export async function POST(req: NextRequest) {
  try {
    const { courseSlug, scriptType, hookIndex = 0, moduleNum, subLetter } = await req.json();

    if (!courseSlug || !scriptType) {
      return NextResponse.json({ erro: "courseSlug e scriptType obrigatorios." }, { status: 400 });
    }

    if (scriptType === "youtube") {
      const { YOUTUBE_SCRIPTS } = await import("@/data/youtube-scripts");
      const script = YOUTUBE_SCRIPTS.find(
        (s) => s.courseSlug === courseSlug && s.hookIndex === hookIndex,
      );
      if (!script) {
        return NextResponse.json({ erro: `Script nao encontrado: ${courseSlug} hook ${hookIndex}` }, { status: 404 });
      }

      return NextResponse.json({
        title: script.title,
        scenes: script.scenes.map((s) => ({
          type: s.type,
          narration: s.narration,
          overlayText: s.overlayText,
          visualNote: s.visualNote,
          durationSec: s.durationSec,
        })),
      });
    }

    // Lesson script
    if (moduleNum === undefined || !subLetter) {
      return NextResponse.json({ erro: "moduleNum e subLetter obrigatorios para lessons." }, { status: 400 });
    }

    const mod = await import(`@/data/course-scripts/${courseSlug}`);
    const scripts = mod.scripts || mod.default || [];
    const lesson = scripts.find(
      (s: { moduleNumber: number; subLetter: string }) =>
        s.moduleNumber === moduleNum && s.subLetter.toUpperCase() === subLetter.toUpperCase(),
    );

    if (!lesson) {
      return NextResponse.json({ erro: `Lesson nao encontrada` }, { status: 404 });
    }

    return NextResponse.json({
      title: lesson.title,
      scenes: [
        { type: "abertura", narration: "", overlayText: lesson.title },
        { type: "pergunta", narration: lesson.perguntaInicial, overlayText: "" },
        { type: "situacao", narration: lesson.situacaoHumana, overlayText: "" },
        { type: "revelacao", narration: lesson.revelacaoPadrao, overlayText: "" },
        { type: "gesto", narration: lesson.gestoConsciencia, overlayText: "" },
        { type: "frase_final", narration: lesson.fraseFinal, overlayText: lesson.fraseFinal },
        { type: "fecho", narration: "", overlayText: "Escola dos Veus" },
      ],
    });
  } catch (err: unknown) {
    return NextResponse.json({ erro: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
