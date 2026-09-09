import { getSession } from '@/lib/session'
import Link from 'next/link'
import Leaderboard from '../game/Leaderboard'
import { getLeaderboard } from '../actions/scores'
import { logout } from '../actions/auth'

export default async function LeaderboardPage() {
  const session = await getSession()
  const { topTen, userEntry } = await getLeaderboard()

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold text-yellow-400">
              🏆 Leaderboard
            </h1>
            {session ? (
              <p className="text-sm text-slate-400">
                Global rankings for <span className="font-semibold text-white">{session.displayName}</span>
              </p>
            ) : (
              <p className="text-sm text-slate-400">
                Global rankings
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {session ? (
              <>
                <Link
                  href="/game"
                  className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-md transition-colors hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  Play Game
                </Link>
                <form action={logout}>
                  <button
                    type="submit"
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                  >
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg border-2 border-slate-600 bg-transparent px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors hover:border-slate-500 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-md transition-colors hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Stats Section */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-slate-800 p-6 shadow-lg border border-slate-700">
              <div className="text-sm text-slate-400 mb-2">Total Players</div>
              <div className="text-3xl font-bold text-yellow-400">{Math.max(topTen.length, userEntry ? userEntry.rank : 0)}</div>
            </div>
            {session && userEntry && (
              <>
                <div className="rounded-lg bg-slate-800 p-6 shadow-lg border border-slate-700">
                  <div className="text-sm text-slate-400 mb-2">Your Rank</div>
                  <div className="text-3xl font-bold text-yellow-400">#{userEntry.rank}</div>
                </div>
                <div className="rounded-lg bg-slate-800 p-6 shadow-lg border border-slate-700">
                  <div className="text-sm text-slate-400 mb-2">Your Score</div>
                  <div className="text-3xl font-bold text-yellow-400">{userEntry.score}</div>
                </div>
              </>
            )}
          </div>

          {/* Leaderboard Section */}
          <div className="rounded-lg bg-slate-800 p-6 shadow-lg border border-slate-700">
            <h2 className="text-2xl font-bold text-yellow-400 mb-6">🏆 Top Players</h2>

            {topTen.length === 0 ? (
              <p className="text-center text-slate-400 py-8">No scores yet. Be the first to play!</p>
            ) : (
              <div className="space-y-3">
                {topTen.map((entry, index) => {
                  const isCurrentUser = session?.userId === entry.user_id
                  const rankEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`

                  return (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between rounded-lg p-4 transition-colors ${isCurrentUser
                          ? 'bg-yellow-500/20 ring-2 ring-yellow-500'
                          : 'bg-slate-700/50 hover:bg-slate-700'
                        }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <span className="text-2xl font-bold text-slate-300 w-10 text-center">
                          {rankEmoji}
                        </span>
                        <div>
                          <p className={`font-semibold text-lg ${isCurrentUser ? 'text-yellow-400' : 'text-white'}`}>
                            {entry.display_name}
                            {isCurrentUser && <span className="ml-2 text-xs text-yellow-300">(You)</span>}
                          </p>
                          <p className="text-sm text-slate-400">{entry.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-yellow-400">{entry.score}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )
                })}

                {/* Show user's rank if outside top 10 */}
                {session && userEntry && userEntry.rank > 10 && (
                  <>
                    <div className="my-4 border-t border-slate-600 pt-4">
                      <p className="text-center text-sm text-slate-400 mb-3">Your Rank</p>
                    </div>
                    <div
                      className="flex items-center justify-between rounded-lg bg-yellow-500/20 p-4 ring-2 ring-yellow-500"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <span className="text-2xl font-bold text-slate-300 w-10 text-center">
                          {userEntry.rank}.
                        </span>
                        <div>
                          <p className="font-semibold text-lg text-yellow-400">
                            {userEntry.display_name}
                            <span className="ml-2 text-xs text-yellow-300">(You)</span>
                          </p>
                          <p className="text-sm text-slate-400">{userEntry.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-yellow-400">{userEntry.score}</p>
                        <p className="text-xs text-slate-400">
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
          <div className="mt-8 rounded-lg bg-slate-700/50 p-6 border border-slate-600">
            <h3 className="text-lg font-semibold text-white mb-3">📊 About the Leaderboard</h3>
            <ul className="space-y-2 text-slate-300">
              <li>• Only your highest score is displayed</li>
              <li>• Scores are ranked globally in real-time</li>
              <li>• Play the game to improve your score</li>
              <li>• Sign up to save and track your progress</li>
            </ul>
          </div>

          {/* CTA Section */}
          {!session && (
            <div className="mt-8 text-center">
              <p className="text-slate-400 mb-4">Ready to compete? Sign up now to save your scores!</p>
              <Link
                href="/signup"
                className="inline-block rounded-lg bg-yellow-500 px-8 py-3 text-lg font-semibold text-slate-900 shadow-lg transition-all hover:bg-yellow-400 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-slate-900"
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
