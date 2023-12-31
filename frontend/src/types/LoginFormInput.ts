import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'email is required')
    .max(128, 'please enter at max 128 characters')
    .email('format email'),
  password: z
    .string()
    .min(8, 'please enter at least 8 characters')
    .max(128, 'please enter at max 128 characters')
    .refine(
      (password: string) => /[A-Za-z]/.test(password) && /[0-9]/.test(password),
      'password must contain both letters and numbers',
    ),
})

export type LoginInput = z.infer<typeof loginSchema>
