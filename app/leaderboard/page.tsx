import { getSession } from '@/lib/session'
import Link from 'next/link'
import Leaderboard from '../game/Leaderboard'
import { getLeaderboard } from '../actions/scores'
import { logout } from '../actions/auth'

export default async function LeaderboardPage() {
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
                Leaderboard
              </h1>
              {session ? (
                <p className="text-sm text-muted">
                  Global rankings for <span className="font-medium text-foreground">{session.displayName}</span>
                </p>
              ) : (
                <p className="text-sm text-muted">
                  Global rankings
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

      <main className="w-full flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Stats Section */}
          <div className="mb-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
              <div className="mb-2 text-xs font-medium tracking-[0.18em] text-muted uppercase">Total Players</div>
              <div className="text-3xl font-semibold tabular-nums">{Math.max(topTen.length, userEntry ? userEntry.rank : 0)}</div>
            </div>
            {session && userEntry && (
              <>
                <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                  <div className="mb-2 text-xs font-medium tracking-[0.18em] text-muted uppercase">Your Rank</div>
                  <div className="text-3xl font-semibold tabular-nums">#{userEntry.rank}</div>
                </div>
                <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                  <div className="mb-2 text-xs font-medium tracking-[0.18em] text-muted uppercase">Your Score</div>
                  <div className="text-3xl font-semibold tabular-nums">{userEntry.score}</div>
                </div>
              </>
            )}
          </div>

          {/* Leaderboard Section */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <div className="mb-6 flex items-baseline justify-between gap-4">
              <h2 className="text-xl font-semibold tracking-tight">Top Players</h2>
              <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">Global</p>
            </div>

            {topTen.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">No scores yet. Be the first to play.</p>
            ) : (
              <div className="space-y-2">
                {topTen.map((entry, index) => {
                  const isCurrentUser = session?.userId === entry.user_id

                  return (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between rounded-xl p-4 transition-colors ${isCurrentUser
                          ? 'border border-accent/60 bg-accent/10'
                          : 'border border-transparent hover:bg-foreground/5'
                        }`}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-4">
                        <span className="w-10 shrink-0 text-center text-lg font-semibold tabular-nums text-muted">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-base font-medium">
                            {entry.display_name}
                            {isCurrentUser && <span className="ml-2 text-xs font-medium text-muted">(You)</span>}
                          </p>
                          <p className="truncate text-sm text-muted">{entry.email}</p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-2xl font-semibold tabular-nums">{entry.score}</p>
                        <p className="text-xs text-muted">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )
                })}

                {/* Show user's rank if outside top 10 */}
                {session && userEntry && userEntry.rank > 10 && (
                  <>
                    <div className="my-4 border-t border-border pt-4">
                      <p className="mb-3 text-center text-xs font-medium tracking-[0.18em] text-muted uppercase">Your Rank</p>
                    </div>
                    <div
                      className="flex items-center justify-between rounded-xl border border-accent/60 bg-accent/10 p-4"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-4">
                        <span className="w-10 shrink-0 text-center text-lg font-semibold tabular-nums text-muted">
                          {userEntry.rank}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-base font-medium">
                            {userEntry.display_name}
                            <span className="ml-2 text-xs font-medium text-muted">(You)</span>
                          </p>
                          <p className="truncate text-sm text-muted">{userEntry.email}</p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-2xl font-semibold tabular-nums">{userEntry.score}</p>
                        <p className="text-xs text-muted">
                          {new Date(userEntry.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <h3 className="mb-3 text-base font-semibold">About the leaderboard</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li>Only your highest score is displayed.</li>
              <li>Scores are ranked globally in real time.</li>
              <li>Play the game to improve your score.</li>
              <li>Sign up to save and track your progress.</li>
            </ul>
          </div>

          {/* CTA Section */}
          {!session && (
            <div className="mt-8 text-center">
              <p className="mb-4 text-sm text-muted">Ready to compete? Sign up now to save your scores.</p>
              <Link
                href="/signup"
                className="inline-block rounded-xl bg-foreground px-8 py-3 text-base font-semibold text-background shadow-sm transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
