import { z } from 'zod'

// Form validation schemas
export const SignupFormSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters long.' })
    .max(20, { message: 'Username must be no more than 20 characters.' })
    .regex(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores.' })
    .trim(),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long.' })
    .trim(),
})

export const LoginFormSchema = z.object({
  username: z.string().min(1, { message: 'Username is required.' }).trim(),
  password: z.string().min(1, { message: 'Password is required.' }).trim(),
})

export type FormState = {
  errors?: {
    username?: string[]
    password?: string[]
  }
  message?: string
} | undefined

export type SessionPayload = {
  userId: string
  username: string
  expiresAt: Date
}

export type User = {
  id: string
  username: string
  password: string
}
