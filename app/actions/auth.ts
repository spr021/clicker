'use server'

import { SignupFormSchema, LoginFormSchema, FormState } from '@/lib/definitions'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function signup(state: FormState, formData: FormData): Promise<FormState> {
  // 1. Validate form fields
  const validatedFields = SignupFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data

  // 2. Generate display name from email
  // Extract the part before @ and clean it up
  const emailPrefix = email.split('@')[0]
  // Remove dots, hyphens and make it more readable
  const displayName = emailPrefix
    .replace(/[._-]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')

  // 3. Create Supabase client
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // 4. Sign up user with Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Save display name in user metadata
      data: {
        display_name: displayName,
      },
      // Disable email confirmation for development
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/game`,
    }
  })

  if (error) {
    return {
      message: error.message || 'An error occurred while creating your account.',
    }
  }

  if (!data.user) {
    return {
      message: 'An error occurred while creating your account.',
    }
  }

  // Check if email confirmation is required
  if (data.user && !data.session) {
    return {
      message: 'Please check your email to verify your account before logging in.',
    }
  }

  // 5. Redirect user to game
  redirect('/game')
}

export async function login(state: FormState, formData: FormData): Promise<FormState> {
  // 1. Validate form fields
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data

  // 2. Create Supabase client
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // 3. Sign in user with Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Provide more detailed error messages
    if (error.message.includes('Email not confirmed')) {
      return {
        message: 'Please verify your email address before logging in. Check your inbox for the confirmation link.',
      }
    }
    return {
      message: error.message || 'Invalid email or password.',
    }
  }

  if (!data.session) {
    return {
      message: 'Could not create session. Please try again.',
    }
  }

  // 4. Redirect user to game
  redirect('/game')
}

export async function logout() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  await supabase.auth.signOut()
  redirect('/login')
}
