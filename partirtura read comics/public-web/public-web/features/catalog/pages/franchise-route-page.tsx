import { useParams } from 'react-router-dom'
import { ContextPage } from './context-page'

export function FranchiseRoutePage() {
  const { id } = useParams<{ id: string }>()
  const entityId = Number(id)

  if (!Number.isFinite(entityId)) {
    return null
  }

  return <ContextPage type="franchise" entityId={entityId} />
}
