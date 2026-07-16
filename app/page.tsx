import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Home() {
  const session = await getSession()

  // If user is logged in, redirect to game
  if (session) {
    redirect('/game')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <main className="w-full max-w-4xl space-y-8 px-4 py-16 text-center">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white md:text-7xl">
            🎮 Clicker Game
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-400">
            Welcome to the ultimate clicking experience! Create an account to
            start playing and compete with others.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="w-full rounded-lg bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-indigo-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600 sm:w-auto"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="w-full rounded-lg border-2 border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-900 shadow-md transition-all hover:border-gray-400 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-500 sm:w-auto"
          >
            Login
          </Link>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <div className="mb-4 text-4xl">👆</div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              Simple & Fun
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Easy to play, hard to master. Start clicking and watch your score
              grow!
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <div className="mb-4 text-4xl">🏆</div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              Track Progress
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your account saves your progress and achievements automatically.
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <div className="mb-4 text-4xl">⚡</div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              Fast & Secure
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Built with modern tech for a smooth, secure gaming experience.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
