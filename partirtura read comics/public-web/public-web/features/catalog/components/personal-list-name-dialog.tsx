import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

/** Maximum length the backend accepts for the name of a list. */
export const PERSONAL_LIST_NAME_MAX_LENGTH = 200

interface PersonalListNameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  /** The name the dialog starts with. Empty when the list is created. */
  initialName?: string
  submitLabel: string
  isPending: boolean
  /** The error of the last attempt, shown by the dialog. */
  error?: string | null
  onSubmit: (name: string) => void
}

/**
 * The dialog that asks for the name of a personal list, both to create one and
 * to rename one.
 */
export function PersonalListNameDialog({
  open,
  onOpenChange,
  title,
  initialName = '',
  submitLabel,
  isPending,
  error,
  onSubmit,
}: PersonalListNameDialogProps) {
  const [name, setName] = useState(initialName)
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setName(initialName)
    setValidationError(null)
  }, [open, initialName])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedName = name.trim()
    if (!trimmedName) {
      setValidationError('El nombre de la lista no puede estar vacío.')
      return
    }
    if (trimmedName.length > PERSONAL_LIST_NAME_MAX_LENGTH) {
      setValidationError(
        `El nombre de la lista no puede tener más de ${PERSONAL_LIST_NAME_MAX_LENGTH} caracteres.`
      )
      return
    }

    setValidationError(null)
    onSubmit(trimmedName)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" hideCloseButton>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader className="border-0 pb-0">
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-1.5">
            <label htmlFor="personal-list-name" className="block text-[11px] font-semibold text-neps-muted">
              Nombre de la lista
            </label>
            <input
              id="personal-list-name"
              type="text"
              value={name}
              maxLength={PERSONAL_LIST_NAME_MAX_LENGTH}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ingrese el nombre de la lista"
              autoFocus
              className="w-full bg-neps-input border border-neps-border focus:border-neps-primary text-xs text-white placeholder-slate-600 rounded-xl px-3.5 py-2.5 outline-none transition-all"
            />
          </div>

          {(validationError || error) && (
            <p role="alert" className="text-[11px] text-neps-accent">
              {validationError ?? error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
