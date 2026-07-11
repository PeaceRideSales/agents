import { Trophy, Star, CheckCircle, Clock } from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api'

export default function LeaderboardTab() {
  const { data: leaders = [], isLoading } = useLeaderboard()
  const { t } = useLanguage()

  // Fetch current agent profile to show their rank
  const { data: me } = useQuery({
    queryKey: ['agent_me'],
    queryFn: () => api.get('/agents/me'),
  })

  const myRank = me ? leaders.findIndex((l: any) => l.id === me.id) + 1 : null
  const myEntry = me ? leaders.find((l: any) => l.id === me.id) : null

  if (isLoading) return (
    <div className="space-y-6 animate-pulse px-2 pb-8 pt-4">
      <div className="h-32 bg-slate-200/50 rounded-3xl" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="neu-card p-4 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-200/50 rounded-full shrink-0" />
          <div className="flex-1">
            <div className="h-4 w-28 bg-slate-200/60 rounded mb-2" />
            <div className="h-3 w-16 bg-slate-200/40 rounded" />
          </div>
          <div className="w-12 h-8 bg-slate-200/50 rounded-xl" />
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-6 pb-6 pt-2">

      {/* My Rank Card */}
      {me && (
        <div className="neu-card rounded-3xl p-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-[0_16px_40px_rgba(37,99,235,0.35)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-blue-200 text-[11px] font-black uppercase tracking-widest mb-1">Your Ranking</p>
              <h2 className="text-2xl font-black">{me.full_name || `@${me.telegram_username}`}</h2>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
              {myRank && myRank <= 3 ? (
                <span className="text-3xl">{myRank === 1 ? '🏆' : myRank === 2 ? '🥈' : '🥉'}</span>
              ) : (
                <span className="text-2xl font-black text-white">#{myRank || '—'}</span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/15 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle className="w-3.5 h-3.5 text-green-300" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">Verified</span>
              </div>
              <div className="text-2xl font-black">{myEntry?.verified_drivers ?? 0}</div>
            </div>
            <div className="bg-white/15 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="w-3.5 h-3.5 text-yellow-300" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">Total Drivers</span>
              </div>
              <div className="text-2xl font-black">{me.driver_count ?? 0}</div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="neu-card rounded-3xl p-6 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 neu-circle flex items-center justify-center mb-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
        </div>
        <h2 className="text-lg font-black text-slate-700 mb-1">{t('leaderboard.title')}</h2>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Top agents by verified drivers</p>
      </div>

      {/* Leaderboard List */}
      <div className="neu-card rounded-3xl overflow-hidden py-4 px-4 space-y-3">
        {leaders.map((leader: any, index: number) => {
          const isMe = me && leader.id === me.id
          const isTop3 = index < 3
          const rankColors = ['text-yellow-500', 'text-slate-400', 'text-amber-600']
          const badgeClass = rankColors[index] || 'text-slate-400'

          return (
            <div
              key={leader.id}
              className={`flex items-center justify-between p-4 rounded-2xl transition-colors ${
                isMe
                  ? 'bg-blue-50 border-2 border-blue-200'
                  : 'neu-pressed'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full neu-circle flex items-center justify-center font-black text-lg ${badgeClass}`}>
                  {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </div>
                <div>
                  <h4 className={`font-black text-sm ${isMe ? 'text-blue-700' : isTop3 ? 'text-slate-700' : 'text-slate-600'}`}>
                    {leader.name} {isMe && <span className="text-blue-400">(You)</span>}
                  </h4>
                  {isTop3 && (
                    <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-0.5 flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> Elite Agent
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right neu-card px-3 py-2 rounded-xl min-w-[56px]">
                <div className="font-black text-lg text-blue-600">{leader.verified_drivers}</div>
                <div className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">{t('leaderboard.verified')}</div>
              </div>
            </div>
          )
        })}
        {leaders.length === 0 && (
          <div className="p-8 text-center font-bold text-slate-400 text-sm">
            No agents on the leaderboard yet.
          </div>
        )}
      </div>

    </div>
  )
}
