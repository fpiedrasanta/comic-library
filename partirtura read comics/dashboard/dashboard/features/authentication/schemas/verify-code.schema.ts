import { z } from 'zod'

export const verifyCodeSchema = z.object({
  code: z
    .string()
    .length(6, 'El código debe tener exactamente 6 dígitos.')
    .regex(/^\d{6}$/, 'El código debe contener únicamente números.'),
})

export type VerifyCodeFormData = z.infer<typeof verifyCodeSchema>
