/** Global route loading fallback — keeps navigation feeling instant. */
export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-cream">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blush-200 border-t-blush-500" />
    </div>
  );
}
