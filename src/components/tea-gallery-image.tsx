export function TeaGalleryImage({ teaId, fallback, alt, className }: { teaId: string; fallback: string; alt: string; className: string }) {
  // Tea Guardian is a fixed catalogue. Its canonical artwork ships with the
  // application under /public/tea-guardians, so public result cards should not
  // spend a Supabase table lookup + Storage request just to replace an asset we
  // already own in the production bundle. Owner Gallery management remains
  // available for genuinely dynamic categories elsewhere.
  return (
    <img
      src={fallback}
      alt={alt}
      className={className}
      data-tea-id={teaId}
      loading="lazy"
      decoding="async"
    />
  );
}
