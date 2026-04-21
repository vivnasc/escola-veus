-- ============================================
-- Escola dos Veus — Storage Buckets + Policies
-- Correr no Supabase SQL Editor
-- (idempotente — pode ser corrido várias vezes sem erros)
-- ============================================

-- 1. Criar buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('escola-videos', 'escola-videos', true, 524288000, ARRAY['video/mp4', 'video/webm', 'video/quicktime']),
  ('escola-workbooks', 'escola-workbooks', true, 10485760, ARRAY['application/pdf']),
  ('escola-shorts', 'escola-shorts', true, 209715200, ARRAY['video/mp4', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO NOTHING;

-- 2. Policies para escola-videos

DROP POLICY IF EXISTS "escola-videos: public read" ON storage.objects;
CREATE POLICY "escola-videos: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'escola-videos');

DROP POLICY IF EXISTS "escola-videos: admin insert" ON storage.objects;
CREATE POLICY "escola-videos: admin insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'escola-videos'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

DROP POLICY IF EXISTS "escola-videos: admin update" ON storage.objects;
CREATE POLICY "escola-videos: admin update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'escola-videos'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

DROP POLICY IF EXISTS "escola-videos: admin delete" ON storage.objects;
CREATE POLICY "escola-videos: admin delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'escola-videos'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 3. Policies para escola-workbooks

DROP POLICY IF EXISTS "escola-workbooks: public read" ON storage.objects;
CREATE POLICY "escola-workbooks: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'escola-workbooks');

DROP POLICY IF EXISTS "escola-workbooks: admin insert" ON storage.objects;
CREATE POLICY "escola-workbooks: admin insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'escola-workbooks'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

DROP POLICY IF EXISTS "escola-workbooks: admin update" ON storage.objects;
CREATE POLICY "escola-workbooks: admin update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'escola-workbooks'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

DROP POLICY IF EXISTS "escola-workbooks: admin delete" ON storage.objects;
CREATE POLICY "escola-workbooks: admin delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'escola-workbooks'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 4. Policies para escola-shorts
-- Conteudo: clips Runway + shorts finais + thumbnails (pasta separada de cursos)

DROP POLICY IF EXISTS "escola-shorts: public read" ON storage.objects;
CREATE POLICY "escola-shorts: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'escola-shorts');

DROP POLICY IF EXISTS "escola-shorts: admin insert" ON storage.objects;
CREATE POLICY "escola-shorts: admin insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'escola-shorts'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

DROP POLICY IF EXISTS "escola-shorts: admin update" ON storage.objects;
CREATE POLICY "escola-shorts: admin update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'escola-shorts'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

DROP POLICY IF EXISTS "escola-shorts: admin delete" ON storage.objects;
CREATE POLICY "escola-shorts: admin delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'escola-shorts'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
