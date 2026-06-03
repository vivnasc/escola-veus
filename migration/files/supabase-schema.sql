-- ============================================================
-- Schema Supabase para o pipeline do carrossel
-- Para correr no projecto Supabase NOVO antes de subir o código.
--
-- Cobre:
--   1. Tabela carousel_collections
--   2. Bucket course-assets (storage)
--   3. Folders esperados dentro do bucket
--   4. RLS policies (opcional, ajusta ao teu modelo de auth)
-- ============================================================

-- ─── 1. Tabela carousel_collections ──────────────────────────
create table if not exists public.carousel_collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  brief text default '',
  dias jsonb not null default '[]'::jsonb,
  theme jsonb not null default '{}'::jsonb,
  owner_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists carousel_collections_slug_idx
  on public.carousel_collections (slug);

create index if not exists carousel_collections_owner_idx
  on public.carousel_collections (owner_id);

create index if not exists carousel_collections_created_idx
  on public.carousel_collections (created_at desc);

-- Trigger para updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists carousel_collections_set_updated_at on public.carousel_collections;
create trigger carousel_collections_set_updated_at
  before update on public.carousel_collections
  for each row execute function public.set_updated_at();

-- ─── 2. RLS (Row Level Security) ─────────────────────────────
-- Ajusta consoante o teu modelo de auth. Exemplo: só admins.
alter table public.carousel_collections enable row level security;

-- Política exemplo: leitura pública (carrosséis são partilhados internamente)
create policy "carousel_collections_select_all"
  on public.carousel_collections for select
  using (true);

-- Política exemplo: só dono (ou service-role) pode escrever
create policy "carousel_collections_write_owner"
  on public.carousel_collections for insert
  with check (auth.uid() = owner_id or auth.role() = 'service_role');

create policy "carousel_collections_update_owner"
  on public.carousel_collections for update
  using (auth.uid() = owner_id or auth.role() = 'service_role');

-- ─── 3. Storage bucket course-assets ─────────────────────────
-- Criar manualmente no Dashboard Supabase (Storage → New Bucket).
-- Nome: course-assets
-- Public: true (para os MP4 e PNGs serem servidos sem auth)
--
-- Folders esperados (criados automaticamente ao primeiro upload):
--   render-jobs/                       — manifests + results (JSON)
--   carrossel-veus/<jobId>/videos/     — MP4 finais
--   carrossel-veus/<jobId>/pngs/dia-N/ — PNGs por dia
--   carrossel-veus/fundos/             — imagens MJ por slide
--   carrossel-veus/audios/             — vozes ElevenLabs
--   carrossel-packages/                — ZIPs Metricool

-- ─── 4. (Opcional) Importar coleções existentes ──────────────
-- Se quiseres migrar as coleções actuais do projecto antigo:
--
-- No projecto Supabase ANTIGO, exporta:
--   COPY (SELECT * FROM carousel_collections) TO '/tmp/colecoes.csv' CSV HEADER;
-- ou usa a UI: Table editor → carousel_collections → Export CSV.
--
-- No projecto Supabase NOVO, importa:
--   Table editor → carousel_collections → Insert → Import from CSV.
--
-- Atenção: owner_id pode não existir no novo projecto (ids de utilizador
-- são diferentes). Apaga a coluna do CSV ou faz UPDATE depois para o
-- novo owner_id.

-- ============================================================
-- Schema pronto. Próximo: configurar env vars no Vercel + GitHub Secrets.
-- Ver migration/MIGRATION-PLAYBOOK.md para passos.
-- ============================================================
