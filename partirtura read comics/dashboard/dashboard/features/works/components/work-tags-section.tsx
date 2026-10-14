import { useWorkForm } from '@/features/works/contexts/work-form-context'
import TagInput from '@/features/numbers/components/tag-input'

interface WorkTagsSectionProps {
  recommendedGeneralTags: string[]
  recommendedCharacters: string[]
  mode?: 'create' | 'edit'
}

export default function WorkTagsSection({
  recommendedGeneralTags,
  recommendedCharacters,
  mode = 'create',
}: WorkTagsSectionProps) {
  const {
    tagInput,
    setTagInput,
    handlers,
  } = useWorkForm()

  return (
    <div className="bg-nepsCard border border-nepsBorder rounded-2xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-nepsBorder/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-nepsPrimary/10 text-nepsPrimary flex items-center justify-center font-bold text-sm border border-nepsPrimary/20">
            5
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Tags del Número
            </h2>
            <p className="text-[11px] text-nepsMuted mt-0.5">
              Etiquetas asociadas para categorización y búsqueda dentro del catálogo.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-200">Tags Guardados</label>
        <TagInput
          label=""
          tags={tagInput}
          onChange={setTagInput}
        />
      </div>

      {(recommendedGeneralTags.length > 0 || recommendedCharacters.length > 0) && mode === 'edit' && (
        <div className="space-y-3 pt-2 border-t border-nepsBorder/60">
          <p className="text-[10px] text-nepsMuted font-bold uppercase tracking-wider">
            Tags Recomendados por IA (Haz clic para incorporar)
          </p>
          {recommendedGeneralTags.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] text-nepsMuted uppercase font-bold">
                Generales
              </p>
              <div className="flex flex-wrap gap-1.5">
                {recommendedGeneralTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handlers.acceptRecommendedTag(tag)}
                    className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-medium transition-all"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {recommendedCharacters.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] text-nepsMuted uppercase font-bold">
                Personajes Detectados
              </p>
              <div className="flex flex-wrap gap-1.5">
                {recommendedCharacters.map((character) => (
                  <button
                    key={character}
                    type="button"
                    onClick={() => handlers.acceptRecommendedCharacter(character)}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-all"
                  >
                    + {character}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
