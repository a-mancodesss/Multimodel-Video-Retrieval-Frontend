import { useState, useRef, useEffect, type FormEvent } from 'react'
import { uploadVideo } from '../api/upload'
import { postPromptStream } from '../api/prompt'
import { downloadClipUrl } from '../api/download'
import type { StreamOutput, HistoryEntry } from '../api/types'
import { PromptWizard } from '../components/PromptWizard'
import { HistorySidebar } from '../components/HistorySidebar'

export function MainPage() {
  const [file, setFile] = useState<File | null>(null)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'idle' | 'wizard' | 'uploading' | 'processing' | 'complete' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [stream, setStream] = useState<StreamOutput | null>(null)
  const [lastFilename, setLastFilename] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const activeQueryRef = useRef('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  function formatTime(secs: number): string {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    if (m === 0) return `${s}s`
    return `${m}m${s.toString().padStart(2, '0')}s`
  }

  useEffect(() => {
    if (!file) { setVideoUrl(null); return }
    const url = URL.createObjectURL(file)
    setVideoUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  function handleSubmit(e?: FormEvent) {
    if (e) e.preventDefault()
    if (!file || !query.trim()) {
      setErrorMsg('Please select a video and enter a query.')
      setStatus('error')
      return
    }
    activeQueryRef.current = query.trim()
    setErrorMsg('')
    setStatus('wizard')
  }

  async function proceedWithPrompt(finalPrompt: string) {
    if (!file) return

    setStatus('uploading')
    setStream(null)
    setLastFilename('')
    setActiveHistoryId(null)

    const capturedFile = file
    const capturedQuery = activeQueryRef.current

    try {
      const ac = new AbortController()

      await uploadVideo(capturedFile, ac.signal)
      const uploadedFilename = capturedFile.name

      setStatus('processing')
      await postPromptStream(
        finalPrompt,
        uploadedFilename,
        (ev) => {
          setStream(ev)
          if (ev.status === 'complete') {
            setStatus('complete')
            setLastFilename(uploadedFilename)

            const entry: HistoryEntry = {
              id: crypto.randomUUID(),
              prompt: capturedQuery || finalPrompt,
              filename: uploadedFilename,
              timestamps: ev.timestamps,
              file: capturedFile,
              createdAt: new Date(),
            }
            setHistory((prev) => [...prev, entry])
            setActiveHistoryId(entry.id)
            setSidebarOpen(true)
          }
        },
        ac.signal
      )
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  function restoreHistoryEntry(entry: HistoryEntry) {
    setFile(entry.file)
    setQuery(entry.prompt)
    setLastFilename(entry.filename)
    setStream({ status: 'complete', timestamps: entry.timestamps })
    setStatus('complete')
    setActiveHistoryId(entry.id)
    setCurrentTime(0)
    setDuration(0)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files?.[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type.startsWith('video/')) {
        setFile(droppedFile)
        setErrorMsg('')
      } else {
        setErrorMsg('Please upload a valid video file.')
      }
    }
  }

  return (
    <div className="flex min-h-screen bg-[#09090b] text-[#fafafa]">
      <HistorySidebar
        entries={history}
        activeId={activeHistoryId}
        onSelect={restoreHistoryEntry}
        onClear={() => { setHistory([]); setActiveHistoryId(null) }}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
      />

      {/* Main content — shifts right when sidebar open */}
      <div
        className={`flex-1 relative flex items-center justify-center p-4 sm:p-8 overflow-hidden selection:bg-white/20 transition-[margin-left] duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-0'}`}
      >
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-2 bg-[#18181b] rounded-2xl mb-4 border border-white/[0.05] shadow-lg">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <polygon points="23 7 16 12 23 17 23 7"></polygon>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-3">
            Video Retrieval
          </h1>
          <p className="text-[#a1a1aa] text-sm sm:text-base max-w-md mx-auto">
            Upload your video and use natural language to find and extract the exact moments you're looking for.
          </p>
        </div>

        <div className="glass-panel p-6 sm:p-10 rounded-3xl shadow-2xl">
          
          {status === 'wizard' ? (
            <PromptWizard
              prompt={query.trim()}
              onComplete={(finalPrompt) => proceedWithPrompt(finalPrompt)}
              onSkip={() => proceedWithPrompt(query.trim())}
            />
          ) : status === 'idle' || status === 'error' ? (
            <div className="flex flex-col gap-8">
              
              {/* Upload Section */}
              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-white/80 px-1">Video File</label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative group cursor-pointer w-full rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-10 ${
                    isDragging 
                      ? 'border-white/50 bg-white/[0.05]' 
                      : file 
                        ? 'border-[#27272a] bg-[#18181b] hover:border-white/30' 
                        : 'border-[#27272a] bg-[#09090b] hover:border-white/30 hover:bg-[#18181b]/50'
                  }`}
                >
                  {file ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 bg-white/10 rounded-full">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-white break-all line-clamp-1">{file.name}</p>
                        <p className="text-xs text-[#a1a1aa] mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                      <p className="text-xs text-white/40 mt-2 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-4">Click to change</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-[#18181b] rounded-full border border-white/[0.05] group-hover:scale-110 transition-transform duration-300 shadow-sm">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-white mb-1">Click to upload or drag and drop</p>
                        <p className="text-xs text-[#a1a1aa]">MP4, MOV, AVI</p>
                      </div>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setFile(e.target.files[0])
                  }}
                />
              </div>

              {/* Query Section */}
              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-white/80 px-1">Search Query</label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-[#a1a1aa]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. a person running in the park"
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-[#a1a1aa] focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {errorMsg}
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleSubmit}
                disabled={!file || !query.trim()}
                className="w-full bg-white text-black font-semibold rounded-xl py-4 flex items-center justify-center gap-2 transition-all hover:bg-white/90 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100"
              >
                <span>Extract Moment</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>

            </div>
          ) : status === 'uploading' || status === 'processing' ? (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in duration-500">
              
              <div className="relative w-20 h-20 mb-8 flex items-center justify-center">
                <svg className="absolute w-full h-full text-[#27272a] animate-[spin_3s_linear_infinite]" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="10 10" />
                </svg>
                <div className="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
              
              <h2 className="text-xl font-medium text-white mb-2">
                {status === 'uploading' ? 'Uploading your video...' : 'Analyzing content...'}
              </h2>
              <p className="text-sm text-[#a1a1aa] max-w-xs">
                {status === 'uploading' 
                  ? 'Please wait while we securely transfer your file to our servers.'
                  : 'Searching through the video frames to find your requested moment.'}
              </p>

              {status === 'processing' && stream && (
                <div className="w-full mt-10 text-left bg-[#09090b] border border-[#27272a] p-5 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium uppercase tracking-wider text-[#a1a1aa]">Current Status</span>
                    <span className="text-xs font-medium bg-white/10 text-white px-2 py-1 rounded-md capitalize">
                      {stream.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  {stream.timestamps.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[#27272a]">
                      <span className="text-xs font-medium uppercase tracking-wider text-[#a1a1aa] mb-3 block">Matches Found</span>
                      <ul className="space-y-2">
                        {stream.timestamps.map(([start, end], idx) => (
                          <li key={idx} className="flex items-center gap-3 text-sm text-white bg-[#18181b] p-2 px-3 rounded-lg border border-white/[0.02]">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            {start.toFixed(1)}s <span className="text-[#a1a1aa] text-xs">→</span> {end.toFixed(1)}s
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-6 animate-in zoom-in-95 duration-500">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center border border-green-500/20">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Extraction Complete</h2>
                  <p className="text-xs text-[#a1a1aa]">{stream?.timestamps.length ?? 0} segment{(stream?.timestamps.length ?? 0) !== 1 ? 's' : ''} matched</p>
                </div>
              </div>

              {/* Video Player */}
              {videoUrl && (
                <div className="rounded-2xl overflow-hidden bg-black border border-[#27272a]">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full max-h-64 object-contain"
                    controls={false}
                    onLoadedMetadata={(e) => setDuration((e.target as HTMLVideoElement).duration)}
                    onTimeUpdate={(e) => setCurrentTime((e.target as HTMLVideoElement).currentTime)}
                    onClick={() => {
                      const v = videoRef.current
                      if (!v) return
                      v.paused ? v.play() : v.pause()
                    }}
                  />

                  {/* Custom Timeline */}
                  <div className="px-4 pb-4 pt-3">
                    <div
                      className="relative h-2 bg-[#27272a] rounded-full cursor-pointer group"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        const pct = (e.clientX - rect.left) / rect.width
                        if (videoRef.current && duration) {
                          videoRef.current.currentTime = pct * duration
                        }
                      }}
                    >
                      {/* Blue matched segments */}
                      {duration > 0 && stream?.timestamps.map(([s, end], i) => (
                        <div
                          key={i}
                          className="absolute top-0 h-full rounded-full bg-blue-500/80"
                          style={{ left: `${(s / duration) * 100}%`, width: `${((end - s) / duration) * 100}%` }}
                        />
                      ))}
                      {/* Playhead */}
                      {duration > 0 && (
                        <div
                          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md -translate-x-1/2 transition-[left] duration-100"
                          style={{ left: `${(currentTime / duration) * 100}%` }}
                        />
                      )}
                    </div>

                    {/* Time + controls row */}
                    <div className="flex items-center justify-between mt-3">
                      <button
                        onClick={() => { const v = videoRef.current; if (v) v.paused ? v.play() : v.pause() }}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </button>
                      <span className="text-xs text-[#a1a1aa] font-mono">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                      {/* Timestamp chips */}
                      <div className="flex gap-1.5 flex-wrap justify-end">
                        {stream?.timestamps.map(([s, end], i) => (
                          <button
                            key={i}
                            onClick={() => { if (videoRef.current) videoRef.current.currentTime = s }}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-500/20 border border-blue-500/40 text-blue-300 hover:bg-blue-500/40 transition-colors"
                          >
                            {formatTime(s)}–{formatTime(end)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href={downloadClipUrl(lastFilename)}
                  download
                  className="flex-1 bg-white text-black font-semibold rounded-xl py-3.5 px-6 flex items-center justify-center gap-2 transition-all hover:bg-white/90 active:scale-[0.98]"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download Clip
                </a>
                <button
                  onClick={() => {
                    setStatus('idle')
                    setFile(null)
                    setQuery('')
                    setStream(null)
                    setLastFilename('')
                    setCurrentTime(0)
                    setDuration(0)
                    setActiveHistoryId(null)
                  }}
                  className="flex-1 bg-[#18181b] border border-[#27272a] text-white font-semibold rounded-xl py-3.5 px-6 flex items-center justify-center gap-2 transition-all hover:bg-[#27272a] active:scale-[0.98]"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 2v6h-6" />
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 2v6h6" />
                  </svg>
                  Start Over
                </button>
              </div>
            </div>
          )}

        </div>
        
        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-[#a1a1aa]">
          Powered by Multimodal Retrieval Engine
        </div>
      </div>
      </div>
    </div>
  )
}
