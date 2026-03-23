export function ErrorAlert({ message }: { message: string }) {
  if (!message) return null
  return (
    <div
      className="rounded-xl border border-red-500/20 bg-red-500/10 px-6 py-4 text-sm font-medium text-red-400 backdrop-blur-sm"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-4 w-4 shrink-0 stroke-current stroke-2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4m0 4h.01" strokeLinecap="round" />
        </svg>
        <p>{message}</p>
      </div>
    </div>
  )
}
