import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateReadingProgress } from '../api/reader-repository'
import { readerWorkPagesKey } from './use-work-pages'
import type { ReaderWorkPagesDto } from '../types/reader'

export function useUpdateReadingProgress(workId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (currentPage: number) => updateReadingProgress(workId, currentPage),
    onSuccess: (_data, currentPage) => {
      // Actualizar cache local de GET /works/{id}/pages con el nuevo currentPage
      queryClient.setQueryData<ReaderWorkPagesDto>(
        readerWorkPagesKey(workId),
        (prev) => {
          if (!prev) return prev
          return { ...prev, currentPage }
        }
      )
      // El mismo avance se expone en el detalle (`myReadingProgress`). Sin esta
      // invalidación la página seguiría mostrando el progreso cacheado al volver
      // del Reader, porque ese query tiene staleTime de 5 minutos.
      queryClient.invalidateQueries({ queryKey: ['catalog', 'work-detail', workId] })
    },
    onError: (error) => {
      // Persistencia es secundaria: no bloquear la lectura
      console.warn('Error al persistir CurrentPage:', error)
    },
  })
}