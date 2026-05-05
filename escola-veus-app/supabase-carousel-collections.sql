-- ============================================
-- Carrossel Véus — Colecções de slides
-- ============================================
-- Cada colecção é uma série temática (ex.: "A Estação dos Véus",
-- "Lua Cheia", "Maternidade") com N dias × M slides cada. O conteúdo
-- está em `dias` (jsonb) com a estrutura definida em
-- escola-veus-app/src/lib/carousel-types.ts.

CREATE TABLE IF NOT EXISTS public.carousel_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE, -- usado em URLs e nos render-jobs
  title text NOT NULL,       -- "A Estação dos Véus"
  brief text NOT NULL DEFAULT '', -- prompt original que gerou a colecção
  dias jsonb NOT NULL DEFAULT '[]'::jsonb,
  theme jsonb NOT NULL DEFAULT '{}'::jsonb, -- paleta + tipografia (vazio = default veus)
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS carousel_collections_owner_idx
  ON public.carousel_collections (owner_id, created_at DESC);

-- Trigger: actualiza updated_at em cada UPDATE
CREATE OR REPLACE FUNCTION public.carousel_collections_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS carousel_collections_updated_at ON public.carousel_collections;
CREATE TRIGGER carousel_collections_updated_at
  BEFORE UPDATE ON public.carousel_collections
  FOR EACH ROW EXECUTE FUNCTION public.carousel_collections_set_updated_at();

-- RLS — admin only. A app já filtra por email; aqui mantemos as queries
-- a passarem pela service role (server-side), portanto podemos manter RLS
-- restritivo e bloqueado a clientes não privilegiados.
ALTER TABLE public.carousel_collections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny anon" ON public.carousel_collections;
CREATE POLICY "deny anon" ON public.carousel_collections
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- O acesso é todo via service role nas API routes do admin.
