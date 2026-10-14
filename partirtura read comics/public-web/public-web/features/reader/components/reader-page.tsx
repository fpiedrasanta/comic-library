import { useParams } from 'react-router-dom'
import { Reader } from './reader'

export function ReaderPageRoute() {
  const { id } = useParams<{ id: string }>()
  const workId = Number(id)

  if (!Number.isFinite(workId)) {
    return null
  }

  return <Reader workId={workId} />
}
