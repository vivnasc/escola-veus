-- ============================================
-- Escola dos Veus — Tabelas de Progresso
-- ============================================

-- Progresso por curso (estado global da aluna num curso)
CREATE TABLE IF NOT EXISTS public.course_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_slug text NOT NULL,
  current_module int NOT NULL DEFAULT 1,
  current_sublesson text NOT NULL DEFAULT 'A',
  modules_completed int[] NOT NULL DEFAULT '{}',
  started_at timestamptz NOT NULL DEFAULT now(),
  last_activity_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(user_id, course_slug)
);

-- Progresso por sub-aula (granular)
CREATE TABLE IF NOT EXISTS public.sublesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_slug text NOT NULL,
  module_number int NOT NULL,
  sublesson_letter text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  UNIQUE(user_id, course_slug, module_number, sublesson_letter)
);

-- Reflexoes da escola (diario por modulo/sub-aula)
CREATE TABLE IF NOT EXISTS public.escola_journal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_slug text NOT NULL,
  module_number int NOT NULL,
  sublesson_letter text NOT NULL DEFAULT '_', -- '_' = reflexao do modulo inteiro (caderno)
  content text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_slug, module_number, sublesson_letter)
);

-- Certificados
CREATE TABLE IF NOT EXISTS public.escola_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_slug text NOT NULL,
  certificate_code text NOT NULL UNIQUE,
  issued_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_slug)
);

-- RLS
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sublesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escola_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escola_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own course_progress"
  ON public.course_progress FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage own sublesson_progress"
  ON public.sublesson_progress FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage own escola_journal"
  ON public.escola_journal FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users read own escola_certificates"
  ON public.escola_certificates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role inserts escola_certificates"
  ON public.escola_certificates FOR INSERT
  WITH CHECK (true);

-- Indices
CREATE INDEX IF NOT EXISTS idx_course_progress_user ON public.course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_activity ON public.course_progress(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_sublesson_progress_user_course ON public.sublesson_progress(user_id, course_slug);
CREATE INDEX IF NOT EXISTS idx_escola_journal_user ON public.escola_journal(user_id);

-- Trigger para updated_at no journal
CREATE OR REPLACE FUNCTION update_escola_journal_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER escola_journal_updated_at
  BEFORE UPDATE ON public.escola_journal
  FOR EACH ROW
  EXECUTE FUNCTION update_escola_journal_updated_at();
