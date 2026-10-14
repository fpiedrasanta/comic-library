import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/authentication/hooks/use-auth'
import { useContinueReading, useRecommendedWorks } from '@/features/catalog/hooks'
import type { RecommendedSortField } from '@/features/catalog/types/works'
import {
  DashboardWelcome,
  ContinueReadingSection,
  CatalogSection,
} from '@/components/dashboard'

const DEFAULT_RECOMMENDED_SORT: RecommendedSortField = 'MostPopular'

export default function IndexPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const continueReading = useContinueReading()
  const [recommendedSortBy, setRecommendedSortBy] = useState<RecommendedSortField>(DEFAULT_RECOMMENDED_SORT)
  const recommendedWorks = useRecommendedWorks(recommendedSortBy)

  const displayName = user?.fullName || 'Usuario'
  const firstName = user?.firstName || displayName.split(' ')[0]

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 flex-grow w-full space-y-10">
      <DashboardWelcome
        firstName={firstName}
        inProgressCount={0}
        libraryCount={0}
        onExploreCatalog={() => navigate('/catalog')}
      />

      <ContinueReadingSection
        works={continueReading.works}
        isLoading={continueReading.isLoading}
        isError={continueReading.isError}
        error={continueReading.error}
        onRetry={continueReading.refetch}
      />

      <CatalogSection
        works={recommendedWorks.data ?? []}
        sortBy={recommendedSortBy}
        onSortChange={setRecommendedSortBy}
        isLoading={recommendedWorks.isLoading}
        isError={recommendedWorks.isError}
        error={recommendedWorks.error}
        onRetry={recommendedWorks.refetch}
      />
    </main>
  )
}
