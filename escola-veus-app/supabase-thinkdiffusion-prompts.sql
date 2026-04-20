-- ============================================
-- ThinkDiffusion Prompts — editaveis sem deploy
-- ============================================

CREATE TABLE IF NOT EXISTS public.thinkdiffusion_prompts (
  id text PRIMARY KEY,
  category text NOT NULL,
  mood text[] NOT NULL DEFAULT '{}',
  prompt text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_thinkdiffusion_prompts_category
  ON public.thinkdiffusion_prompts(category);

CREATE INDEX IF NOT EXISTS idx_thinkdiffusion_prompts_sort
  ON public.thinkdiffusion_prompts(sort_order);

-- RLS: apenas service role escreve; leitura publica (pagina admin esta protegida por layout)
ALTER TABLE public.thinkdiffusion_prompts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read thinkdiffusion_prompts"
  ON public.thinkdiffusion_prompts;
CREATE POLICY "Anyone can read thinkdiffusion_prompts"
  ON public.thinkdiffusion_prompts
  FOR SELECT
  USING (true);

-- Config global (negative prompt, checkpoint, etc)
CREATE TABLE IF NOT EXISTS public.thinkdiffusion_config (
  id text PRIMARY KEY DEFAULT 'default',
  checkpoint text NOT NULL DEFAULT 'RealVisXL v4',
  width int NOT NULL DEFAULT 1920,
  height int NOT NULL DEFAULT 1080,
  cfg_scale numeric NOT NULL DEFAULT 6,
  steps int NOT NULL DEFAULT 35,
  sampler_name text NOT NULL DEFAULT 'DPM++ 2M Karras',
  batch_size int NOT NULL DEFAULT 4,
  negative_prompt text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.thinkdiffusion_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read thinkdiffusion_config"
  ON public.thinkdiffusion_config;
CREATE POLICY "Anyone can read thinkdiffusion_config"
  ON public.thinkdiffusion_config
  FOR SELECT
  USING (true);
