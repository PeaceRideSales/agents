import { Trophy, Star } from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'
import { useLeaderboard } from '../hooks/useLeaderboard'

export default function LeaderboardTab() {
  const { data: leaders = [], isLoading } = useLeaderboard()
  const { t } = useLanguage()

  if (isLoading) return (
    <div className="space-y-6 animate-pulse px-2 pb-8 pt-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-slate-200/50 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-40 bg-slate-200/60 rounded" />
          <div className="h-3 w-24 bg-slate-200/40 rounded" />
        </div>
      </div>
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
    <div className="space-y-8 pb-6 pt-2">
      
      {/* Header */}
      <div className="neu-card rounded-3xl p-8 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 neu-circle flex items-center justify-center mb-4">
          <Trophy className="w-10 h-10 text-yellow-500" />
        </div>
        <h2 className="text-xl font-black text-slate-700 mb-2">{t('leaderboard.title')}</h2>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed">Compete for the top spot by verifying more drivers!</p>
      </div>

      {/* Leaderboard List */}
      <div className="neu-card rounded-3xl overflow-hidden py-4 px-4 space-y-4">
        {leaders.map((leader: any, index: number) => {
          const isTop3 = index < 3
          const rankColors = ['text-yellow-500', 'text-slate-400', 'text-amber-600']
          const badgeClass = rankColors[index] || 'text-slate-400'

          return (
            <div key={leader.id} className="flex items-center justify-between p-4 neu-pressed rounded-2xl transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full neu-circle flex items-center justify-center font-black text-lg ${badgeClass}`}>
                  {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </div>
                <div>
                  <h4 className={`font-black ${isTop3 ? 'text-slate-700' : 'text-slate-600'}`}>
                    {leader.name}
                  </h4>
                  {isTop3 && (
                    <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1 flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> Elite Agent
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right neu-card px-4 py-2 rounded-xl">
                <div className="font-black text-lg text-blue-600">{leader.verified_drivers}</div>
                <div className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">{t('leaderboard.verified')}</div>
              </div>
            </div>
          )
        })}
        {leaders.length === 0 && (
          <div className="p-8 text-center font-bold text-slate-400 text-sm">
            No agents found on the leaderboard yet.
          </div>
        )}
      </div>

    </div>
  )
}
