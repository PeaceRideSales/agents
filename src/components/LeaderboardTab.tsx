import { useState, useEffect } from 'react'
import { Trophy, Star } from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'
import { api } from '../api'

export default function LeaderboardTab() {
  const [leaders, setLeaders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const data = await api.get('/agents/leaderboard')
        setLeaders(data)
      } catch (e) { 
        console.error('Failed to fetch leaderboard:', e)
      } finally { 
        setLoading(false) 
      }
    }
    fetchLeaderboard()
  }, [])

  if (loading) return (
    <div className="py-16 flex justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
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
        {leaders.map((leader, index) => {
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
