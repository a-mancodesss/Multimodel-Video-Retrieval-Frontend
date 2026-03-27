import { useState } from 'react'

type Category = 'yolo' | 'clip' | 'audio' | 'clip-text' | null

interface Props {
  prompt: string
  onComplete: (finalPrompt: string) => void
  onSkip: () => void
}

interface Option {
  id: string
  label: string
  description: string
  icon: React.ReactNode
}

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export function PromptWizard({ prompt, onComplete, onSkip }: Props) {
  const [step, setStep] = useState<1 | 2>(1)
  const [category, setCategory] = useState<Category>(null)
  const [selected, setSelected] = useState<string | null>(null)

  const step1Options: Option[] = [
    {
      id: 'yolo',
      label: 'Objects / items in frame',
      description: 'Looking for presence, count, or combinations of specific objects (e.g. "a red bottle", "a dog and a cat").',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      id: 'clip',
      label: 'A visual scene or action',
      description: 'A described moment, appearance, or action (e.g. "person running", "a sunset", "blue shirt").',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" />
        </svg>
      ),
    },
    {
      id: 'clip-text',
      label: 'Text visible on screen',
      description: 'Words, signs, captions, or on-screen text (e.g. "when the title card appears").',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" />
        </svg>
      ),
    },
    {
      id: 'audio',
      label: 'Something spoken or narrated',
      description: 'Dialogue, commentary, or specific words said in the video.',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      ),
    },
  ]

  const step2Options: Option[] = [
    {
      id: 'single',
      label: 'A single frame is enough',
      description: 'The moment can be identified from one still image — no need to see what happens before or after.',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
    {
      id: 'sequence',
      label: 'Needs a sequence of frames',
      description: 'The clip involves an action unfolding over time (e.g. "someone picks up the bottle and walks away").',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="15" rx="2" /><polyline points="17 2 12 7 7 2" />
        </svg>
      ),
    },
  ]

  const clipTextStep2Options: Option[] = [
    {
      id: 'text-scene',
      label: 'Text appearing in a scene',
      description: 'Find moments where text related to your description is visible on screen (signs, titles, captions, etc.).',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" />
        </svg>
      ),
    },
    {
      id: 'exact-text',
      label: 'Exact text match',
      description: 'Search for the exact words or phrase you wrote in your prompt — character-level match on screen text.',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      ),
    },
  ]

  function buildSuffix(cat: Category, sub?: string): string {
    if (cat === 'yolo') return ' (use yolo)'
    if (cat === 'audio') return ' (use audio)'
    if (cat === 'clip-text') {
      return sub === 'exact-text'
        ? ' (use ocr, exact text search)'
        : ' (use ocr)'
    }
    if (cat === 'clip') {
      return sub === 'sequence'
        ? ' (use xclip)'
        : ' (use clip)'
    }
    return ''
  }

  function handleStep1(id: string) {
    setSelected(id)
    if (id === 'clip' || id === 'clip-text') {
      setCategory(id as Category)
      setTimeout(() => { setStep(2); setSelected(null) }, 150)
    } else {
      const cat = id as Category
      setCategory(cat)
      setTimeout(() => onComplete(prompt + buildSuffix(cat)), 150)
    }
  }

  function handleStep2(id: string) {
    setSelected(id)
    setTimeout(() => onComplete(prompt + buildSuffix(category, id)), 150)
  }

  const currentOptions =
    step === 1 ? step1Options
    : category === 'clip-text' ? clipTextStep2Options
    : step2Options

  const hasStep2 = category === 'clip' || category === 'clip-text' || step === 2

  const question =
    step === 1
      ? 'What best describes what you are searching for?'
      : category === 'clip-text'
        ? 'Are you looking for any text on screen, or the exact words from your prompt?'
        : 'Can a single frame identify this, or does it need a sequence?'
  const subtext =
    step === 1
      ? 'This helps route your query to the right model. You can skip anytime.'
      : category === 'clip-text'
        ? 'Exact text search looks for the precise string in your prompt; scene search is more flexible.'
        : 'Knowing this helps the system decide whether to search frame-by-frame or across a time window.'

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-400">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {step === 2 && (
              <button
                onClick={() => { setStep(1); setSelected(null); setCategory(null) }}
                className="text-[#a1a1aa] hover:text-white transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}
            <span className="text-xs font-medium uppercase tracking-wider text-[#a1a1aa]">
              Step {step} of {hasStep2 ? 2 : 1}
            </span>
          </div>
          <h2 className="text-base font-semibold text-white">{question}</h2>
          <p className="text-xs text-[#a1a1aa] mt-1 max-w-sm">{subtext}</p>
        </div>
      </div>

      {/* Prompt preview */}
      <div className="px-3 py-2 rounded-lg bg-[#18181b] border border-[#27272a] text-xs text-[#a1a1aa] font-mono truncate">
        <span className="text-white/40 mr-2">prompt:</span>
        {prompt}
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {currentOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => step === 1 ? handleStep1(opt.id) : handleStep2(opt.id)}
            className={`w-full text-left flex items-start gap-3 p-4 rounded-xl border transition-all duration-150 ${
              selected === opt.id
                ? 'border-blue-500/60 bg-blue-500/10'
                : 'border-[#27272a] bg-[#18181b] hover:border-white/20 hover:bg-[#27272a]/50'
            }`}
          >
            <div className={`mt-0.5 shrink-0 transition-colors ${selected === opt.id ? 'text-blue-400' : 'text-[#a1a1aa]'}`}>
              {selected === opt.id ? <CheckIcon /> : opt.icon}
            </div>
            <div>
              <p className={`text-sm font-medium transition-colors ${selected === opt.id ? 'text-blue-300' : 'text-white'}`}>
                {opt.label}
              </p>
              <p className="text-xs text-[#a1a1aa] mt-0.5">{opt.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Skip */}
      <div className="flex items-center justify-center pt-1">
        <button
          onClick={onSkip}
          className="text-xs text-[#a1a1aa] hover:text-white transition-colors flex items-center gap-1.5"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
          Skip — let the AI decide based on my prompt only
        </button>
      </div>
    </div>
  )
}
