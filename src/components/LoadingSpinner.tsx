export function LoadingSpinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div
      className="flex items-center gap-4 text-sm font-medium text-zinc-400"
      role="status"
      aria-live="polite"
    >
      <div className="relative flex h-5 w-5 items-center justify-center">
        <span
          className="absolute h-full w-full animate-spin rounded-full border-2 border-[#171717] border-t-[#f5f5f5]"
          aria-hidden
        />
        <span className="absolute h-2 w-2 rounded-full bg-[#f5f5f5] opacity-20 shadow-[0_0_10px_rgba(245,245,245,0.8)]" />
      </div>
      <span>{label}</span>
    </div>
  )
}
