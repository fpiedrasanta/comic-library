import { useState, useEffect, useRef } from 'react'
import { fetchApiBlob } from '@/infrastructure/api/client/api-client'

export function useProtectedImage(url: string | null | undefined): string | null | undefined {
  const [objectUrl, setObjectUrl] = useState<string | null | undefined>(undefined)
  const blobUrlRef = useRef<string | null>(null)

  useEffect(() => {
    if (!url) {
      setObjectUrl(undefined)
      return
    }

    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      setObjectUrl(url)
      return
    }

    let isMounted = true

    fetchApiBlob(url)
      .then((blob) => {
        if (!isMounted) return
        const blobUrl = URL.createObjectURL(blob)
        blobUrlRef.current = blobUrl
        setObjectUrl(blobUrl)
      })
      .catch(() => {
        if (!isMounted) return
        setObjectUrl(null)
      })

    return () => {
      isMounted = false
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
        blobUrlRef.current = null
      }
    }
  }, [url])

  return objectUrl
}
