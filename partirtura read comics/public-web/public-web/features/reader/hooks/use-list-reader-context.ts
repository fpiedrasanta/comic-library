import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getListReaderContext, setListCurrentWork } from '../api/reader-repository'
import type { ListReaderContextDto, ListReaderListItemDto, ListReaderPageDto } from '../types/list-reader-context'

export function listReaderContextKey(listId: number, workId: number) {
  return ['reader', 'list-context', listId, workId]
}

export function useListReaderContext(listId: number, workId: number) {
  return useQuery<ListReaderContextDto>({
    queryKey: listReaderContextKey(listId, workId),
    queryFn: () => getListReaderContext(listId, workId),
    enabled: Number.isFinite(listId) && Number.isFinite(workId),
    retry: false,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  })
}

/**
 * Persists the current work of a list when the user moves to another work.
 * Only touches `ListReadingProgress.CurrentWork` / `LastReadAt`; it never
 * alters the page progress of any work (TASK-API-0309).
 */
export function useSetListCurrentWork(listId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (workId: number) => setListCurrentWork(listId, workId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['catalog', 'list-detail', listId] })
    },
    onError: (error) => {
      console.warn('Error al actualizar el Work actual de la lista:', error)
    },
  })
}

export type { ListReaderContextDto, ListReaderListItemDto, ListReaderPageDto }
