import { cn } from '@/lib/utils'

export interface AiResult {
  title?: string | null
  publisher?: string | null
  number?: string | number | null
  description?: string | null
  summary?: string | null
  publicationDate?: string | null
  writers?: string[]
  artists?: string[]
  inkers?: string[]
  tags?: string[]
  characters?: string[]
}

interface WorkAiResultsSectionProps {
  result: AiResult | null
}

export default function WorkAiResultsSection({ result }: WorkAiResultsSectionProps) {
  if (!result) return null

  const displayNumber = result.number ?? 'N/D'
  const displayPublisher = result.publisher ?? 'N/D'
  const displayPublicationDate = result.publicationDate
    ? new Date(result.publicationDate).toLocaleDateString('es-AR')
    : 'N/D'

  const fieldClasses =
    'bg-nepsInput/60 p-3 rounded-xl border border-nepsBorder space-y-1'

  return (
    <div className="bg-gradient-to-b from-purple-950/20 to-nepsCard border border-nepsAi/40 rounded-2xl p-5 space-y-4 shadow-2xl">
      <div className="flex items-center justify-between border-b border-nepsAi/30 pb-3">
        <div className="flex items-center gap-2 text-nepsAi font-bold text-xs uppercase tracking-wider">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <span>Datos sugeridos por IA</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className={fieldClasses}>
          <span className="text-[10px] text-nepsMuted font-bold uppercase">
            Número detectado
          </span>
          <p className="font-bold text-white">{displayNumber}</p>
        </div>

        <div className={fieldClasses}>
          <span className="text-[10px] text-nepsMuted font-bold uppercase">
            Título detectado
          </span>
          <p className="font-bold text-white">{result.title || 'N/D'}</p>
        </div>

        <div className={fieldClasses}>
          <span className="text-[10px] text-nepsMuted font-bold uppercase">
            Editorial
          </span>
          <p className="font-bold text-white">{displayPublisher}</p>
        </div>

        <div className={fieldClasses}>
          <span className="text-[10px] text-nepsMuted font-bold uppercase">
            Fecha de publicación
          </span>
          <p className="font-bold text-white">{displayPublicationDate}</p>
        </div>

        <div className={cn(fieldClasses, 'lg:col-span-2')}>
          <span className="text-[10px] text-nepsMuted font-bold uppercase">
            Descripción
          </span>
          <p className="text-slate-200">{result.description || 'N/D'}</p>
        </div>

        <div className={cn(fieldClasses, 'lg:col-span-2')}>
          <span className="text-[10px] text-nepsMuted font-bold uppercase">
            Resumen
          </span>
          <p className="text-slate-200">{result.summary || 'N/D'}</p>
        </div>

        <div className={fieldClasses}>
          <span className="text-[10px] text-nepsMuted font-bold uppercase">
            Escritores
          </span>
          <p className="text-slate-200">
            {result.writers?.length ? result.writers.join(', ') : 'N/D'}
          </p>
        </div>

        <div className={fieldClasses}>
          <span className="text-[10px] text-nepsMuted font-bold uppercase">
            Artistas
          </span>
          <p className="text-slate-200">
            {result.artists?.length ? result.artists.join(', ') : 'N/D'}
          </p>
        </div>

        <div className={fieldClasses}>
          <span className="text-[10px] text-nepsMuted font-bold uppercase">
            Entintadores
          </span>
          <p className="text-slate-200">
            {result.inkers?.length ? result.inkers.join(', ') : 'N/D'}
          </p>
        </div>

        <div className={cn(fieldClasses, 'lg:col-span-2')}>
          <span className="text-[10px] text-nepsMuted font-bold uppercase">
            Etiquetas
          </span>
          <div className="flex flex-wrap gap-1 mt-1">
            {result.tags?.length
              ? result.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] bg-nepsBorder/60 text-nepsMuted px-2 py-1 rounded-md"
                  >
                    {tag}
                  </span>
                ))
              : 'N/D'}
          </div>
        </div>

        <div className={cn(fieldClasses, 'lg:col-span-2')}>
          <span className="text-[10px] text-nepsMuted font-bold uppercase">
            Personajes
          </span>
          <div className="flex flex-wrap gap-1 mt-1">
            {result.characters?.length
              ? result.characters.map((character) => (
                  <span
                    key={character}
                    className="text-[10px] bg-nepsBorder/60 text-nepsMuted px-2 py-1 rounded-md"
                  >
                    {character}
                  </span>
                ))
              : 'N/D'}
          </div>
        </div>
      </div>
    </div>
  )
}
