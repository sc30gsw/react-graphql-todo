import { z } from 'zod'

export const todoSchema = z.object({
  text: z
    .string()
    .min(1, 'text is required')
    .max(128, 'please enter at max 128 characters'),
})

export type TodoInput = z.infer<typeof todoSchema>
