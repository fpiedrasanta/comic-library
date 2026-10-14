interface EntityListingStateProps {
  title: string
  message: string
  /** Rendered under the message, e.g. "Restablecer búsqueda". */
  action?: React.ReactNode
  tone: 'empty' | 'error'
}

const TONES = {
  empty: {
    shell: 'bg-neps-card/40 border-neps-border',
    icon: 'bg-neps-input border-neps-border text-neps-muted',
  },
  error: {
    shell: 'bg-red-950/10 border-red-500/20',
    icon: 'bg-red-500/10 border-red-500/30 text-red-400',
  },
} as const

/**
 * Empty and error states for a listing. Same layout for both, only the tone
 * and the copy differ.
 */
export function EntityListingState({ title, message, action, tone }: EntityListingStateProps) {
  const styles = TONES[tone]

  return (
    <div className={`py-16 text-center border rounded-2xl space-y-4 px-4 ${styles.shell}`}>
      <div className={`w-14 h-14 border rounded-2xl flex items-center justify-center mx-auto ${styles.icon}`}>
        {tone === 'error' ? (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        ) : (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        )}
      </div>

      <div className="space-y-1 max-w-sm mx-auto">
        <h3 className="text-base font-bold text-white">{title}</h3>
        <p className="text-xs text-neps-muted">{message}</p>
      </div>

      {action}
    </div>
  )
}
