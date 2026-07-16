import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import LockpickGame from './LockpickGame'

export default async function GamePage() {
  const session = await getSession()

  // If user is not logged in, redirect to login page
  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold text-yellow-400">
              🔓 Lockpick Master
            </h1>
            <p className="text-sm text-slate-400">
              Welcome, <span className="font-semibold text-white">{session.displayName}</span>!
            </p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              Logout
            </button>
          </form>
        </div>
      </header>

      {/* Game Content */}
      <main className="flex flex-1 items-center justify-center p-4 sm:p-8">
        <div className="w-full">
          <LockpickGame />
        </div>
      </main>
    </div>
  )
}
