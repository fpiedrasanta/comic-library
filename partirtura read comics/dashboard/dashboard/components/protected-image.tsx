import { useProtectedImage } from '@/hooks/use-protected-image'

interface ProtectedImageProps {
  src: string | null | undefined
  alt: string
  className?: string
  fallback?: React.ReactNode
}

export function ProtectedImage({ src, alt, className, fallback }: ProtectedImageProps) {
  const resolvedSrc = useProtectedImage(src)

  if (!resolvedSrc && fallback) {
    return <>{fallback}</>
  }

  if (!resolvedSrc) {
    return null
  }

  return <img src={resolvedSrc} alt={alt} className={className} />
}
