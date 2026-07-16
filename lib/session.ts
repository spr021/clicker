import 'server-only'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { User } from '@/lib/definitions'

export async function getSession() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return {
    userId: user.id,
    email: user.email || '',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // For compatibility
  }
}

export async function getUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return {
    id: user.id,
    email: user.email || '',
  }
}
