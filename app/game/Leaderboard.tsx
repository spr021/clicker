import { LeaderboardEntry } from '@/app/actions/scores'

type LeaderboardProps = {
  topTen: LeaderboardEntry[]
  userEntry: LeaderboardEntry | null
  currentUserId?: string
}

export default function Leaderboard({ topTen, userEntry, currentUserId }: LeaderboardProps) {
  return (
    <div className="w-full max-w-2xl rounded-lg bg-slate-800 p-6 shadow-lg">
      <h3 className="mb-4 text-2xl font-bold text-yellow-400">🏆 Leaderboard</h3>
      
      {topTen.length === 0 ? (
        <p className="text-center text-slate-400">No scores yet. Be the first!</p>
      ) : (
        <div className="space-y-2">
          {topTen.map((entry, index) => {
            const isCurrentUser = currentUserId === entry.user_id
            const rankEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`
            
            return (
              <div
                key={entry.id}
                className={`flex items-center justify-between rounded-lg p-3 transition-colors ${
                  isCurrentUser
                    ? 'bg-yellow-500/20 ring-2 ring-yellow-500'
                    : 'bg-slate-700/50 hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-slate-300 w-8">
                    {rankEmoji}
                  </span>
                  <div>
                    <p className={`font-semibold ${isCurrentUser ? 'text-yellow-400' : 'text-white'}`}>
                      {entry.display_name}
                      {isCurrentUser && <span className="ml-2 text-xs">(You)</span>}
                    </p>
                    <p className="text-xs text-slate-400">{entry.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-yellow-400">{entry.score}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )
          })}
          
          {/* Show user's entry if they're not in top 10 */}
          {userEntry && userEntry.rank > 10 && (
            <>
              <div className="my-3 border-t border-slate-600 pt-3">
                <p className="text-center text-xs text-slate-400 mb-2">Your Rank</p>
              </div>
              <div
                className="flex items-center justify-between rounded-lg bg-yellow-500/20 p-3 ring-2 ring-yellow-500"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-slate-300 w-8">
                    {userEntry.rank}.
                  </span>
                  <div>
                    <p className="font-semibold text-yellow-400">
                      {userEntry.display_name}
                      <span className="ml-2 text-xs">(You)</span>
                    </p>
                    <p className="text-xs text-slate-400">{userEntry.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-yellow-400">{userEntry.score}</p>
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
  )
}
