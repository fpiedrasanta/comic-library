import { useState, useEffect, FormEvent } from 'react'
import { useVoteListRating, useUpdateListRating } from '@/features/catalog/hooks/use-ratings'
import { StarRatingInput } from '@/features/catalog/components/star-rating-input'
import type { ListRatingVoteRequest, ListRatingVoteResponse } from '@/features/catalog/api/list-ratings-repository'
import type { ListReaderListRatingDto } from '../types/list-reader-context'

interface ListRatingFormProps {
  listId: number
  existingRating: ListReaderListRatingDto | null
  onSaved: (rating: ListRatingVoteResponse) => void
  variant?: 'work' | 'list'
}

const RATING_STAR_SIZE = 48
const MIN_RATING_STARS = 1

export function ListRatingForm({ listId, existingRating, onSaved, variant }: ListRatingFormProps) {
  const voteMutation = useVoteListRating(listId)
  const updateMutation = useUpdateListRating(listId)
  const isSubmitting = voteMutation.isPending || updateMutation.isPending

  const [stars, setStars] = useState<number>(0)
  const [review, setReview] = useState<string>('')
  const [isEditing, setIsEditing] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submittedRating, setSubmittedRating] = useState<ListRatingVoteResponse | null>(null)

  const activeRating = submittedRating ?? existingRating
  const hasExistingRating = activeRating !== null
  const canSubmit = stars >= MIN_RATING_STARS

  useEffect(() => {
    if (activeRating) {
      setStars(activeRating.stars ?? 0)
      setReview(activeRating.review ?? '')
    }
  }, [activeRating])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!canSubmit) {
      setSubmitError('Seleccioná al menos una estrella')
      return
    }

    try {
      if (hasExistingRating && !isEditing) {
        setIsEditing(true)
        return
      }

      const body: ListRatingVoteRequest = {
        stars,
        review: review.trim() || null,
      }

      const saved = hasExistingRating
        ? await updateMutation.mutateAsync(body)
        : await voteMutation.mutateAsync(body)

      setSubmittedRating(saved)
      onSaved(saved)
      setIsEditing(false)
      setSubmitError(null)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar la valoración'
      setSubmitError(message)
    }
  }

  const handleCancel = () => {
    if (hasExistingRating && isEditing) {
      setStars(activeRating!.stars ?? 0)
      setReview(activeRating!.review ?? '')
      setIsEditing(false)
      setSubmitError(null)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-4 p-4 rounded-xl ${
        variant === 'list' ? 'bg-brand-500/10 border-brand-500/30' : 'bg-slate-900/50 border-slate-800'
      }`}
    >
      <h3 className="text-sm font-semibold text-white">
        Valora esta lista, que fue hecha con mucho amor para vos.
      </h3>

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">Puntuación</label>
        <div className="flex justify-center">
          <StarRatingInput
            value={stars}
            onChange={setStars}
            allowZero={true}
            size={RATING_STAR_SIZE}
            disabled={isSubmitting}
          />
        </div>
        <p className="text-xs text-slate-500 mt-1 text-center">
          {stars === 0 ? 'Sin puntuación' : `${stars} estrella${stars > 1 ? 's' : ''}`}
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">Reseña (opcional)</label>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
          placeholder="Escribe tu opinión..."
          disabled={isSubmitting}
        />
      </div>

      {submitError && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded p-2">
          {submitError}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={handleCancel}
          className="flex-1 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-medium border border-slate-700 hover:bg-slate-700 transition disabled:opacity-50"
          disabled={isSubmitting}
        >
          {hasExistingRating ? 'Cancelar' : 'Cerrar'}
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 rounded-lg bg-brand-500 text-white font-semibold hover:bg-brand-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting || !canSubmit}
        >
          {isSubmitting ? 'Guardando...' : (hasExistingRating ? 'Actualizar' : 'Votar')}
        </button>
      </div>
    </form>
  )
}
