/** Dashboard loading skeleton. */
export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-9 w-64 rounded-lg bg-blush-100" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-40 rounded-2xl bg-blush-50" />
        <div className="h-40 rounded-2xl bg-blush-50" />
      </div>
    </div>
  );
}
