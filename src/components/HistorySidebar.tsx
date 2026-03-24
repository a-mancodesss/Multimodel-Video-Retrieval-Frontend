import type { HistoryEntry } from '../api/types'

interface Props {
  entries: HistoryEntry[]
  activeId: string | null
  onSelect: (entry: HistoryEntry) => void
  onClear: () => void
  isOpen: boolean
  onToggle: () => void
}

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  if (m === 0) return `${s}s`
  return `${m}m${s.toString().padStart(2, '0')}s`
}

export function HistorySidebar({ entries, activeId, onSelect, onClear, isOpen, onToggle }: Props) {
  return (
    <>
      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40 flex flex-col
          bg-[#0c0c0e] border-r border-white/[0.06]
          transition-[width,opacity] duration-300 ease-in-out overflow-hidden
          ${isOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 pointer-events-none'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-5 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#a1a1aa]">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <line x1="12" y1="7" x2="12" y2="12" />
              <line x1="12" y1="12" x2="15" y2="14" />
            </svg>
            <span className="text-sm font-medium text-white whitespace-nowrap">History</span>
            {entries.length > 0 && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-white/10 text-[#a1a1aa]">
                {entries.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {entries.length > 0 && (
              <button
                onClick={onClear}
                title="Clear history"
                className="p-1.5 rounded-lg text-[#a1a1aa] hover:text-white hover:bg-white/10 transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </button>
            )}
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg text-[#a1a1aa] hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/[0.06] mx-3 mb-3 shrink-0" />

        {/* Entry list */}
        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1 scrollbar-thin">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center px-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/20 mb-3">
                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </svg>
              <p className="text-xs text-[#52525b]">No searches yet</p>
            </div>
          ) : (
            [...entries].reverse().map((entry) => (
              <button
                key={entry.id}
                onClick={() => onSelect(entry)}
                className={`
                  w-full text-left px-3 py-2.5 rounded-xl transition-all duration-150 group
                  ${activeId === entry.id
                    ? 'bg-white/10 border border-white/10'
                    : 'hover:bg-white/[0.05] border border-transparent'}
                `}
              >
                {/* Prompt title */}
                <p className={`text-sm leading-snug line-clamp-2 mb-1.5 ${activeId === entry.id ? 'text-white' : 'text-white/80 group-hover:text-white'} transition-colors`}>
                  {entry.prompt}
                </p>

                {/* Meta row */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] text-[#52525b] truncate max-w-[110px]">
                    {entry.filename}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {entry.timestamps.length > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/20">
                        {entry.timestamps.length} match{entry.timestamps.length !== 1 ? 'es' : ''}
                      </span>
                    )}
                    <span className="text-[10px] text-[#52525b]">{timeAgo(entry.createdAt)}</span>
                  </div>
                </div>

                {/* Timestamp pills */}
                {entry.timestamps.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {entry.timestamps.slice(0, 3).map(([s, end], i) => (
                      <span key={i} className="text-[9px] font-mono px-1.5 py-px rounded bg-white/[0.05] text-[#71717a]">
                        {formatTime(s)}–{formatTime(end)}
                      </span>
                    ))}
                    {entry.timestamps.length > 3 && (
                      <span className="text-[9px] text-[#52525b]">+{entry.timestamps.length - 3} more</span>
                    )}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Floating toggle button (shown when sidebar is closed) */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed top-4 left-4 z-50 p-2 rounded-xl bg-[#18181b] border border-white/[0.08] text-[#a1a1aa] hover:text-white hover:bg-[#27272a] transition-all shadow-lg"
          title="Open history"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      )}
    </>
  )
}
