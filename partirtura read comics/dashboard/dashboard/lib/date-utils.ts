export function pad(value: number): string {
  return String(value).padStart(2, '0')
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const day = pad(date.getDate())
  const month = pad(date.getMonth() + 1)
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}
