import { LeaderboardEntry } from '@/app/actions/scores'

type LeaderboardProps = {
  topTen: LeaderboardEntry[]
  userEntry: LeaderboardEntry | null
  currentUserId?: string
}

export default function Leaderboard({ topTen, userEntry, currentUserId }: LeaderboardProps) {
  return (
    <div className="w-full max-w-2xl rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h3 className="text-lg font-semibold tracking-tight">Leaderboard</h3>
        <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">Top 10</p>
      </div>

      {topTen.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted">No scores yet. Be the first.</p>
      ) : (
        <div className="space-y-2">
          {topTen.map((entry, index) => {
            const isCurrentUser = currentUserId === entry.user_id

            return (
              <div
                key={entry.id}
                className={`flex items-center justify-between rounded-xl p-3 transition-colors ${
                  isCurrentUser
                    ? 'border border-accent/60 bg-accent/10'
                    : 'border border-transparent hover:bg-foreground/5'
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="w-8 shrink-0 text-base font-semibold tabular-nums text-muted">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <p className="truncate text-sm font-medium">
                    {entry.display_name}
                    {isCurrentUser && <span className="ml-2 text-xs font-medium text-muted">(You)</span>}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xl font-semibold tabular-nums">{entry.score}</p>
                  <p className="text-xs text-muted">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )
          })}

          {/* Show user's entry if they're not in top 10 */}
          {userEntry && userEntry.rank > 10 && (
            <>
              <div className="my-3 border-t border-border pt-3">
                <p className="mb-2 text-center text-xs font-medium tracking-[0.18em] text-muted uppercase">Your Rank</p>
              </div>
              <div
                className="flex items-center justify-between rounded-xl border border-accent/60 bg-accent/10 p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="w-8 shrink-0 text-base font-semibold tabular-nums text-muted">
                    {userEntry.rank}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {userEntry.display_name}
                      <span className="ml-2 text-xs font-medium text-muted">(You)</span>
                    </p>
                    <p className="truncate text-xs text-muted">{userEntry.email}</p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xl font-semibold tabular-nums">{userEntry.score}</p>
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
  )
}
