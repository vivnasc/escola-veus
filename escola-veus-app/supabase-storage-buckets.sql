-- ============================================
-- Escola dos Veus — Storage Buckets + Policies
-- Correr no Supabase SQL Editor
-- ============================================

-- 1. Criar buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('escola-videos', 'escola-videos', true, 524288000, ARRAY['video/mp4', 'video/webm', 'video/quicktime']),
  ('escola-workbooks', 'escola-workbooks', true, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- 2. Policies para escola-videos

-- Qualquer pessoa pode ver (publico)
CREATE POLICY "escola-videos: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'escola-videos');

-- Apenas admins podem fazer upload
CREATE POLICY "escola-videos: admin insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'escola-videos'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Apenas admins podem actualizar (upsert)
CREATE POLICY "escola-videos: admin update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'escola-videos'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Apenas admins podem apagar
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

-- Qualquer pessoa pode ver (publico)
CREATE POLICY "escola-workbooks: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'escola-workbooks');

-- Apenas admins podem fazer upload
CREATE POLICY "escola-workbooks: admin insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'escola-workbooks'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Apenas admins podem actualizar
CREATE POLICY "escola-workbooks: admin update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'escola-workbooks'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Apenas admins podem apagar
CREATE POLICY "escola-workbooks: admin delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'escola-workbooks'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
