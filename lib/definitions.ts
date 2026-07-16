import { z } from 'zod'

// Form validation schemas
export const SignupFormSchema = z.object({
  email: z
    .string()
    .email({ message: 'Please enter a valid email address.' })
    .trim(),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long.' })
    .trim(),
})

export const LoginFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }).trim(),
  password: z.string().min(1, { message: 'Password is required.' }).trim(),
})

export type FormState = {
  errors?: {
    email?: string[]
    password?: string[]
  }
  message?: string
} | undefined

export type SessionPayload = {
  userId: string
  email: string
  expiresAt: Date
}

export type User = {
  id: string
  email: string
}
