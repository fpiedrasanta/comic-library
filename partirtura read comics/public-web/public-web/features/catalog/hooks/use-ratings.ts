import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { voteWork, updateWorkRating, getMyRating, getWorkRatings, type WorkRatingVoteRequest, type WorkRatingListItemDto, type ListResponse } from '../api/ratings-repository'
import { voteListRating, updateListRating, type ListRatingVoteRequest, type ListRatingVoteResponse } from '../api/list-ratings-repository'

export function useMyRating(workId: number) {
  return useQuery({
    queryKey: ['myRating', workId],
    queryFn: () => getMyRating(workId),
    enabled: workId > 0,
    staleTime: 5 * 60 * 1000,
  })
}

export function useVoteWork(workId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: WorkRatingVoteRequest) => voteWork(workId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myRating', workId] })
      queryClient.invalidateQueries({ queryKey: ['workRatings', workId] })
      queryClient.invalidateQueries({ queryKey: ['catalog', 'work-detail', workId] })
    },
  })
}

export function useUpdateWorkRating(workId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: WorkRatingVoteRequest) => updateWorkRating(workId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myRating', workId] })
      queryClient.invalidateQueries({ queryKey: ['workRatings', workId] })
      queryClient.invalidateQueries({ queryKey: ['catalog', 'work-detail', workId] })
    },
  })
}

export function useWorkRatings(
  workId: number,
  params: { currentPage?: number; pageSize?: number; orderBy?: 'Stars' | 'CreatedAt'; orderDir?: 'ASC' | 'DESC' }
) {
  return useQuery<ListResponse<WorkRatingListItemDto>>({
    queryKey: ['workRatings', workId, params],
    queryFn: () => getWorkRatings(workId, params),
    enabled: workId > 0,
    staleTime: 5 * 60 * 1000,
  })
}

export function listRatingContextKey(listId: number) {
  return ['listRating', listId]
}

/** `POST /api/catalog/lists/{listId}/ratings` (create). */
export function useVoteListRating(listId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: ListRatingVoteRequest) => voteListRating(listId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: listRatingContextKey(listId) })
      void queryClient.invalidateQueries({ queryKey: ['catalog', 'list-detail', listId] })
    },
  })
}

/** `PUT /api/catalog/lists/{listId}/ratings` (update / upsert). */
export function useUpdateListRating(listId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: ListRatingVoteRequest) => updateListRating(listId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: listRatingContextKey(listId) })
      void queryClient.invalidateQueries({ queryKey: ['catalog', 'list-detail', listId] })
    },
  })
}

export type { ListRatingVoteRequest, ListRatingVoteResponse }