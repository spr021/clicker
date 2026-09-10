'use client'

import { signup } from '@/app/actions/auth'
import { useActionState } from 'react'
import Link from 'next/link'
import { GoogleSignInButton } from '@/app/components/GoogleSignInButton'

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined)

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground">
      <div className="w-full max-w-md space-y-7 rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-foreground text-sm font-semibold text-background">
            LM
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Create account
          </h1>
          <p className="text-sm text-muted">
            Sign up to start playing
          </p>
        </div>

        <form action={action} className="space-y-5">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1.5 block w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm shadow-sm placeholder:text-muted focus:border-foreground/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
                placeholder="Enter your email"
              />
              {state?.errors?.email && (
                <div className="mt-1.5 space-y-1">
                  {state.errors.email.map((error) => (
                    <p key={error} className="text-sm text-muted">
                      {error}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1.5 block w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm shadow-sm placeholder:text-muted focus:border-foreground/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
                placeholder="Create a password"
              />
              {state?.errors?.password && (
                <div className="mt-1.5 space-y-1">
                  {state.errors.password.map((error) => (
                    <p key={error} className="text-sm text-muted">
                      {error}
                    </p>
                  ))}
                </div>
              )}
              <p className="mt-1.5 text-xs text-muted">
                At least 6 characters
              </p>
            </div>
          </div>

          {state?.message && (
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-sm text-muted">
                {state.message}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-background shadow-sm transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {pending ? 'Creating account…' : 'Sign up'}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-surface px-4 text-xs font-medium tracking-[0.14em] text-muted uppercase">
              Or continue with
            </span>
          </div>
        </div>

        <GoogleSignInButton mode="signup" />

        <div className="text-center text-sm">
          <span className="text-muted">
            Already have an account?{' '}
          </span>
          <Link
            href="/login"
            className="font-medium underline decoration-border underline-offset-4 hover:decoration-foreground"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  )
}
