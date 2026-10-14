import { useParams } from 'react-router-dom'
import { WorkDetailPage } from './work-detail-page'

export function WorkRoutePage() {
  const { id } = useParams<{ id: string }>()
  const entityId = Number(id)

  if (!Number.isFinite(entityId)) {
    return null
  }

  return <WorkDetailPage entityId={entityId} />
}