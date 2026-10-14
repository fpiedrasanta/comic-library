import { useQuery } from '@tanstack/react-query'
import { getWorkPages } from '../api/reader-repository'
import type { ReaderWorkPagesDto } from '../types/reader'

// currentPage cambia mientras el usuario lee, por lo que siempre pedimos datos frescos
const PAGES_STALE_TIME = 0

export function readerWorkPagesKey(workId: number) {
  return ['reader', 'work-pages', workId]
}

export function useWorkPages(workId: number) {
  return useQuery<ReaderWorkPagesDto>({
    queryKey: readerWorkPagesKey(workId),
    queryFn: () => getWorkPages(workId),
    enabled: Number.isFinite(workId) && workId > 0,
    staleTime: PAGES_STALE_TIME,
    retry: false,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  })
}
