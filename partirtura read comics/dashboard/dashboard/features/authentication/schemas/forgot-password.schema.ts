import { z } from 'zod'

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'El email es obligatorio.').email('El email no tiene un formato válido.'),
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
