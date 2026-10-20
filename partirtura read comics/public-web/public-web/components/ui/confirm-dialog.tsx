import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: ReactNode
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
  /** Disables the confirmation while the operation is in flight. */
  isPending?: boolean
}

/**
 * Confirmation before an operation that cannot be undone.
 *
 * The destructive action is the one the dialog asks for, so the cancel button
 * comes first and the confirmation is the one with the accent color.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancelar',
  onConfirm,
  onOpenChange,
  isPending = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm text-center">
        <div className="w-12 h-12 rounded-full bg-neps-accent/10 border border-neps-accent/30 text-neps-accent flex items-center justify-center mx-auto">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <DialogHeader className="border-0 pb-0 pt-4">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-xs font-normal text-neps-muted">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="justify-center pt-4">
          <DialogClose asChild>
            <Button variant="secondary" size="sm" disabled={isPending}>
              {cancelLabel}
            </Button>
          </DialogClose>
          <Button variant="destructive" size="sm" onClick={onConfirm} disabled={isPending}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
