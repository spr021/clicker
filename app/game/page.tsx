import { getSession } from '@/lib/session'
import { logout } from '@/app/actions/auth'
import LockpickGame from './LockpickGame'
import { getUserHighScore } from '@/app/actions/scores'
import Link from 'next/link'

export default async function GamePage() {
  const session = await getSession()
  const userHighScore = session ? await getUserHighScore() : null

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
                {userHighScore !== null && (
                  <span className="ml-2 text-yellow-400">
                    High Score: {userHighScore}
                  </span>
                )}
              </p>
            ) : (
              <p className="text-sm text-slate-400">
                Playing as guest - <Link href="/login" className="text-yellow-400 hover:underline">Login to save scores</Link>
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-lg border-2 border-slate-600 bg-transparent px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors hover:border-slate-500 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              Leaderboard
            </Link>
            {session ? (
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  Logout
                </button>
              </form>
            ) : (
              <Link
                href="/login"
                className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-md transition-colors hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Game Content */}
      <main className="flex flex-1 items-center justify-center p-4 sm:p-8">
        <div className="w-full">
          <LockpickGame userId={session?.userId} />
        </div>
      </main>
    </div>
  )
}
