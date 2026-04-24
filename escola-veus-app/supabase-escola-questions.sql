-- ============================================
-- Escola dos Veus — Q&A com Claude API
-- ============================================
-- Conversas por aluna x modulo. Cada modulo tem o seu
-- contexto proprio (3 scripts + capitulo manual + caderno),
-- por isso a chave e (user_id, course_slug, module_number).
-- A sublesson_letter e guardada apenas como hint de onde a
-- pergunta foi feita — nao divide a conversa.

CREATE TABLE IF NOT EXISTS public.escola_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_slug text NOT NULL,
  module_number int NOT NULL,
  sublesson_letter text,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  model text,
  usage jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.escola_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own escola_questions"
  ON public.escola_questions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own escola_questions"
  ON public.escola_questions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role manages escola_questions"
  ON public.escola_questions FOR ALL
  USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_escola_questions_thread
  ON public.escola_questions(user_id, course_slug, module_number, created_at);
