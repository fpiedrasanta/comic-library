export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function formatDateLocal(utcString: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(utcString)
  if (Number.isNaN(date.getTime())) {
    return utcString
  }
  return date.toLocaleString(undefined, {
    ...options,
  })
}

export function toUtcIso(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString()
}

export function toDateTimeLocal(utcString: string): string {
  const date = new Date(utcString)
  if (Number.isNaN(date.getTime())) {
    return utcString
  }
  const pad = (n: number) => n.toString().padStart(2, '0')
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function fromDateTimeLocal(localString: string): string {
  if (!localString) {
    return localString
  }
  const date = new Date(localString)
  if (Number.isNaN(date.getTime())) {
    return localString
  }
  return date.toISOString()
}
