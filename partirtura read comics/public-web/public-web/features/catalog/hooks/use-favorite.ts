import { useMutation, useIsMutating, useQueryClient } from '@tanstack/react-query'
import { addFavorite, removeFavorite } from '../api'
import { FAVORITES_LISTING_KEY } from './query-keys'
import { useWorksListingCache } from './work-listing-cache'

/** Key of the mutation that adds or removes the favorite of a work. */
function favoriteMutationKey(workId: number) {
  return ['favorite', workId] as const
}

/**
 * Adds or removes the favorite of a work.
 *
 * The state shown by the star is the one the backend returned with the work,
 * and it only changes once the operation succeeds: a failed request never
 * leaves a state that contradicts the persisted one.
 */
export function useToggleFavorite(workId: number, isFavorite: boolean) {
  const queryClient = useQueryClient()
  const { updateWork, removeWorkFrom } = useWorksListingCache()

  const mutation = useMutation({
    mutationKey: favoriteMutationKey(workId),
    mutationFn: (shouldBeFavorite: boolean) =>
      shouldBeFavorite ? addFavorite(workId) : removeFavorite(workId),
    onSuccess: (_payload, shouldBeFavorite) => {
      updateWork(workId, (work) => ({ ...work, isFavorite: shouldBeFavorite }))

      if (shouldBeFavorite) {
        // A new favorite has to appear in the favorites listing, and only the
        // backend knows where it belongs in the order and the pagination.
        queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === FAVORITES_LISTING_KEY,
        })
        return
      }

      // A work that stops being a favorite leaves the favorites listing.
      removeWorkFrom(workId, [FAVORITES_LISTING_KEY])
    },
  })

  // The same work can be on screen more than once, so the pending state is
  // counted over every mutation of the work and not over this button only.
  const pendingMutations = useIsMutating({ mutationKey: favoriteMutationKey(workId) })

  return {
    toggle: () => mutation.mutate(!isFavorite),
    isPending: pendingMutations > 0,
    error: mutation.error,
  }
}
