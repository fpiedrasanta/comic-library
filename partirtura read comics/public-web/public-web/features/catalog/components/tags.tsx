import type { TagDto } from '../types/work-detail'

interface TagsProps {
  tags: TagDto[]
}

/**
 * Displays the tags for a work.
 * Each tag is shown as a styled pill.
 */
export function Tags({ tags }: TagsProps) {
  if (!tags || tags.length === 0) return null

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <span>Tags ({tags.length})</span>
      </h3>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={`${tag.id}-${index}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border bg-neps-input/80 border-neps-border text-slate-300"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {tag.name ?? 'Sin nombre'}
          </span>
        ))}
      </div>
    </section>
  )
}