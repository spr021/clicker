import { getSession } from '@/lib/session'
import { logout } from '@/app/actions/auth'
import LockpickGame from './LockpickGame'
import { getUserHighScore } from '@/app/actions/scores'
import Link from 'next/link'

export default async function GamePage() {
  const session = await getSession()
  const userHighScore = session ? await getUserHighScore() : null

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-sm font-semibold text-background">
              LM
            </span>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                Lockpick Master
              </h1>
              {session ? (
                <p className="text-sm text-muted">
                  Welcome, <span className="font-medium text-foreground">{session.displayName}</span>
                  {userHighScore !== null && (
                    <span className="ml-2 tabular-nums">
                      High score: {userHighScore}
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-sm text-muted">
                  Playing as guest - <Link href="/login" className="font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground">Log in to save scores</Link>
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/leaderboard"
              className="rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
            >
              Leaderboard
            </Link>
            {session ? (
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
                >
                  Log out
                </button>
              </form>
            ) : (
              <Link
                href="/login"
                className="rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background shadow-sm transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Game Content */}
      <main className="flex flex-1 items-start justify-center p-4 sm:p-8">
        <div className="w-full max-w-3xl">
          <LockpickGame userId={session?.userId} />
        </div>
      </main>
    </div>
  )
}
