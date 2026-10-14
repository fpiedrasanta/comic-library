import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AuthCenteredCardProps {
  icon?: ReactNode
  title?: string
  subtitle?: ReactNode
  children: ReactNode
  className?: string
}

export default function AuthCenteredCard({
  icon,
  title,
  subtitle,
  children,
  className,
}: AuthCenteredCardProps) {
  const showHeader = icon || title || subtitle

  return (
    <main
      className={cn(
        'w-full max-w-md bg-neps-card border border-neps-border rounded-2xl p-6 sm:p-8 shadow-glow-blue relative z-10',
        className,
      )}
    >
      {showHeader && (
        <div className="text-center mb-6">
          {icon && (
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-neps-primary/10 text-neps-primary mb-3 border border-neps-primary/20">
              {icon}
            </div>
          )}
          {title && (
            <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
          )}
          {subtitle && (
            <p className="text-xs text-neps-muted mt-1 leading-relaxed">{subtitle}</p>
          )}
        </div>
      )}

      {children}
    </main>
  )
}
