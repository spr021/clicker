'use server'

import { SignupFormSchema, LoginFormSchema, FormState } from '@/lib/definitions'
import { createSession, deleteSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function signup(state: FormState, formData: FormData): Promise<FormState> {
  // 1. Validate form fields
  const validatedFields = SignupFormSchema.safeParse({
    username: formData.get('username'),
    password: formData.get('password'),
  })

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { username, password } = validatedFields.data

  // 2. Check if user already exists
  const existingUser = await db.getUserByUsername(username)
  if (existingUser) {
    return {
      message: 'Username already exists. Please choose a different username.',
    }
  }

  // 3. Hash the user's password
  const hashedPassword = await bcrypt.hash(password, 10)

  // 4. Create user in database
  const user = await db.createUser(username, hashedPassword)

  if (!user) {
    return {
      message: 'An error occurred while creating your account.',
    }
  }

  // 5. Create user session
  await createSession(user.id, user.username)

  // 6. Redirect user to game
  redirect('/game')
}

export async function login(state: FormState, formData: FormData): Promise<FormState> {
  // 1. Validate form fields
  const validatedFields = LoginFormSchema.safeParse({
    username: formData.get('username'),
    password: formData.get('password'),
  })

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { username, password } = validatedFields.data

  // 2. Query the database for the user
  const user = await db.getUserByUsername(username)

  if (!user) {
    return {
      message: 'Invalid username or password.',
    }
  }

  // 3. Compare the password with the hashed password
  const passwordMatch = await bcrypt.compare(password, user.password)

  if (!passwordMatch) {
    return {
      message: 'Invalid username or password.',
    }
  }

  // 4. Create user session
  await createSession(user.id, user.username)

  // 5. Redirect user to game
  redirect('/game')
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}
