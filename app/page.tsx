import { getSession } from '@/lib/session'
import Link from 'next/link'
import Leaderboard from './game/Leaderboard'
import { getLeaderboard } from './actions/scores'
import { logout } from './actions/auth'

export default async function Home() {
  const session = await getSession()
  const { topTen, userEntry } = await getLeaderboard()

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
                </p>
              ) : (
                <p className="text-sm text-muted">
                  Master the art of lockpicking
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {session ? (
              <>
                <Link
                  href="/game"
                  className="rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background shadow-sm transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
                >
                  Play Game
                </Link>
                <form action={logout}>
                  <button
                    type="submit"
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
                  >
                    Log out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background shadow-sm transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-12 px-4 py-12">
        {/* Welcome Section */}
        <div className="space-y-5 py-8 text-center">
          <p className="text-xs font-medium tracking-[0.22em] text-muted uppercase">
            Precision timing instrument
          </p>
          <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Lockpick Master
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted">
            Test your timing and precision. Strike at the right moment to pick the lock.
          </p>
          {!session && (
            <div className="flex flex-col items-center gap-3 pt-4 sm:flex-row sm:justify-center">
              <Link
                href="/game"
                className="w-full rounded-xl bg-foreground px-8 py-3 text-base font-semibold text-background shadow-sm transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 sm:w-auto"
              >
                Play Now
              </Link>
              <Link
                href="/signup"
                className="w-full rounded-xl border border-border px-8 py-3 text-base font-medium transition-colors hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 sm:w-auto"
              >
                Sign Up to Save Scores
              </Link>
            </div>
          )}
        </div>

        {/* Leaderboard Preview */}
        <div className="flex flex-col items-center gap-5">
          <Link
            href="/leaderboard"
            className="rounded-lg border border-border px-6 py-2 text-sm font-medium transition-colors hover:bg-foreground/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
          >
            View Full Leaderboard
          </Link>
          <Leaderboard
            topTen={topTen}
            userEntry={userEntry}
            currentUserId={session?.userId}
          />
        </div>

        {/* Features */}
        <div className="grid gap-4 pt-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <p className="mb-3 text-xs font-medium tracking-[0.18em] text-muted uppercase">Timing</p>
            <h3 className="mb-2 text-lg font-semibold">
              Perfect Timing
            </h3>
            <p className="text-sm text-muted">
              Hit the sectors at just the right moment. Chain combos for massive scores.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <p className="mb-3 text-xs font-medium tracking-[0.18em] text-muted uppercase">Rankings</p>
            <h3 className="mb-2 text-lg font-semibold">
              Global Rankings
            </h3>
            <p className="text-sm text-muted">
              Compete with players worldwide and climb to the top of the leaderboard.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <p className="mb-3 text-xs font-medium tracking-[0.18em] text-muted uppercase">Sessions</p>
            <h3 className="mb-2 text-lg font-semibold">
              Fast Sessions
            </h3>
            <p className="text-sm text-muted">
              Quick sessions, refined mechanics. Can you beat your high score?
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
