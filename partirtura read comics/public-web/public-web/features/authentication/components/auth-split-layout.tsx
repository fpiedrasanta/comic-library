import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AuthSplitLayoutProps {
  heroTitle: ReactNode
  heroDescription: ReactNode
  statusText?: string
  children: ReactNode
  className?: string
}

export default function AuthSplitLayout({
  heroTitle,
  heroDescription,
  statusText = 'Registro Seguro',
  children,
  className,
}: AuthSplitLayoutProps) {
  return (
    <main
      className={cn(
        'w-full max-w-4xl bg-neps-card border border-neps-border rounded-2xl shadow-glow-blue overflow-hidden my-auto relative z-10',
        className,
      )}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[580px]">
        <div className="relative hidden md:flex flex-col justify-between p-8 lg:p-12 bg-gradient-to-b from-neps-card to-neps-bg border-r border-neps-border overflow-hidden">
          <div className="absolute -top-16 -left-16 w-56 h-56 bg-neps-accent/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-neps-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="text-2xl font-bold tracking-tight text-white">
              &lt;neps<span className="text-neps-accent">/</span>&gt;
            </div>
            <p className="text-[11px] uppercase tracking-widest text-neps-muted mt-1 font-semibold">
              Comic Library Platform
            </p>
          </div>

          <div className="relative z-10 my-auto py-8">
            <h2 className="text-2xl lg:text-3xl font-extrabold leading-tight text-white mb-3">
              {heroTitle}
            </h2>
            <p className="text-xs sm:text-sm text-neps-muted leading-relaxed">
              {heroDescription}
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-between text-[11px] text-neps-muted border-t border-neps-border pt-4">
            <span>v1.0.0</span>
            <span className="inline-flex items-center gap-1.5 text-neps-text">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {statusText}
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center bg-neps-card">
          {children}
        </div>
      </div>
    </main>
  )
}
