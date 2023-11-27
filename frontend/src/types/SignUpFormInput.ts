import { z } from 'zod'

export const signUpScheme = z.object({
  name: z
    .string()
    .min(8, 'please enter at latest 8 characters')
    .max(128, 'please enter at max 128 characters'),
  email: z
    .string()
    .min(1, 'email is required')
    .max(128, 'please enter at max 128 characters')
    .email(),
  password: z
    .string()
    .min(8, 'please enter at least 8 characters')
    .max(128, 'please enter at max 128 characters')
    .refine(
      (password: string) => /[A-Za-z]/.test(password) && /[0-9]/.test(password),
      'password must contain both letters and numbers',
    ),
})

export type SignUpInput = z.infer<typeof signUpScheme>
