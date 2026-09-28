-- r218: login animations accept every mainstream video container (iPhone screen
-- recordings are video/quicktime). Mirrors src/lib/video-formats.ts and the
-- zhaowu-owner-data LOADING_VIDEO_TYPES list. Images unchanged.
update storage.buckets
set allowed_mime_types = array[
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'video/mp4',
  'video/x-m4v',
  'video/quicktime',
  'video/webm',
  'video/3gpp',
  'video/3gpp2',
  'video/x-matroska',
  'video/ogg',
  'video/x-msvideo',
  'video/x-ms-wmv',
  'video/x-flv',
  'video/mpeg',
  'video/mp2t'
]::text[]
where id = 'zhaowu-gallery';
