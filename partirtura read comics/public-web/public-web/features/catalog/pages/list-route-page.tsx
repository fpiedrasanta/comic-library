import { useParams } from 'react-router-dom'
import { ListDetailPage } from './list-detail-page'

export function ListRoutePage() {
  const { id } = useParams<{ id: string }>()
  const entityId = Number(id)

  if (!Number.isFinite(entityId)) {
    return null
  }

  return <ListDetailPage entityId={entityId} />
}
