import { getSession } from '@/lib/session'
import Link from 'next/link'
import Leaderboard from './game/Leaderboard'
import { getLeaderboard } from './actions/scores'
import { logout } from './actions/auth'

export default async function Home() {
  const session = await getSession()
  const { topTen, userEntry } = await getLeaderboard()

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold text-yellow-400">
              🔓 Lockpick Master
            </h1>
            {session ? (
              <p className="text-sm text-slate-400">
                Welcome, <span className="font-semibold text-white">{session.displayName}</span>!
              </p>
            ) : (
              <p className="text-sm text-slate-400">
                Master the art of lockpicking
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

      <main className="w-full max-w-6xl mx-auto space-y-8 px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4 py-8">
          <h2 className="text-4xl font-bold text-white md:text-5xl">
            Lockpick Master! 🔓
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-400">
            Test your timing and precision. Click at the right moment to pick the lock!
          </p>
          {!session && (
            <>
              <div className="flex flex-col items-center gap-3 pt-4 sm:flex-row sm:justify-center">
                <Link
                  href="/game"
                  className="w-full rounded-lg bg-yellow-500 px-8 py-3 text-lg font-semibold text-slate-900 shadow-lg transition-all hover:bg-yellow-400 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-slate-900 sm:w-auto"
                >
                  Play Now
                </Link>
                <Link
                  href="/signup"
                  className="w-full rounded-lg border-2 border-yellow-500 bg-transparent px-8 py-3 text-lg font-semibold text-yellow-400 shadow-md transition-all hover:bg-yellow-500/10 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-slate-900 sm:w-auto"
                >
                  Sign Up to Save Scores
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Leaderboard */}
        <div className="flex justify-center">
          <Leaderboard 
            topTen={topTen} 
            userEntry={userEntry} 
            currentUserId={session?.userId}
          />
        </div>

        {/* Features */}
        <div className="grid gap-6 sm:grid-cols-3 pt-8">
          <div className="rounded-xl bg-slate-800 p-6 shadow-lg border border-slate-700">
            <div className="mb-4 text-4xl">🎯</div>
            <h3 className="mb-2 text-xl font-semibold text-white">
              Perfect Timing
            </h3>
            <p className="text-slate-400">
              Hit the zones at just the right moment. Chain combos for massive scores!
            </p>
          </div>
          <div className="rounded-xl bg-slate-800 p-6 shadow-lg border border-slate-700">
            <div className="mb-4 text-4xl">🏆</div>
            <h3 className="mb-2 text-xl font-semibold text-white">
              Global Rankings
            </h3>
            <p className="text-slate-400">
              Compete with players worldwide and climb to the top of the leaderboard!
            </p>
          </div>
          <div className="rounded-xl bg-slate-800 p-6 shadow-lg border border-slate-700">
            <div className="mb-4 text-4xl">⚡</div>
            <h3 className="mb-2 text-xl font-semibold text-white">
              Fast & Addictive
            </h3>
            <p className="text-slate-400">
              Quick sessions, endless fun. Can you beat your high score?
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
