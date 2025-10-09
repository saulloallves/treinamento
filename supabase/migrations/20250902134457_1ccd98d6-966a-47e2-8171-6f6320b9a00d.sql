-- Atualizar bucket para aceitar todos os tipos de arquivo de vídeo
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
  'video/avi',
  'video/mov',
  'video/wmv',
  'video/flv',
  'video/m4v',
  'video/3gp',
  'video/3gpp',
  'video/x-ms-wmv',
  'video/x-flv',
  'video/mp2t',
  'video/x-m4v'
]
WHERE id = 'course-videos';

-- Verificar se o bucket existe, caso não exista, criar
INSERT INTO storage.buckets (id, name, public, allowed_mime_types)
SELECT 'course-videos', 'course-videos', true, ARRAY[
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
  'video/avi',
  'video/mov',
  'video/wmv',
  'video/flv',
  'video/m4v',
  'video/3gp',
  'video/3gpp',
  'video/x-ms-wmv',
  'video/x-flv',
  'video/mp2t',
  'video/x-m4v'
]
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'course-videos');