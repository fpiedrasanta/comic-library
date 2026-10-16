import { useParams } from 'react-router-dom'
import { ListReader } from './list-reader'

export function ListReaderPageRoute() {
  const { listId, workId } = useParams<{ listId: string; workId: string }>()
  const parsedListId = Number(listId)
  const parsedWorkId = Number(workId)

  if (!Number.isFinite(parsedListId) || !Number.isFinite(parsedWorkId)) {
    return null
  }

  return <ListReader listId={parsedListId} workId={parsedWorkId} />
}
