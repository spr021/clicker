import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/game'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Generate display name from user metadata or email
      const displayName = data.user.user_metadata.full_name || 
                         data.user.user_metadata.name ||
                         data.user.email?.split('@')[0]
                           .replace(/[._-]/g, ' ')
                           .split(' ')
                           .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                           .join(' ')
      
      // Update user metadata with display name if it doesn't exist
      if (!data.user.user_metadata.display_name && displayName) {
        await supabase.auth.updateUser({
          data: { display_name: displayName }
        })
      }
      
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`http://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
