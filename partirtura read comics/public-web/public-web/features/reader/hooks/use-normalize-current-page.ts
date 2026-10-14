import { useCallback } from 'react'

/**
 * Normaliza el valor `currentPage` del Backend a un índice 0-based válido para el Reader.
 *
 * Reglas:
 * - `null` o `< 1` → 0 (página 1)
 * - `>= totalPages` → `totalPages - 1` (última página, incluida la de fin)
 * - entre `1` y `totalPages - 1` → `currentPage - 1`
 */
export function useNormalizeCurrentPage() {
  return useCallback((currentPage: number | null, totalPages: number) => {
    if (currentPage === null || currentPage < 1) return 0
    if (currentPage >= totalPages) return totalPages - 1
    return currentPage - 1
  }, [])
}