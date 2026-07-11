import { useQuery } from '@tanstack/react-query'
import { api } from '../api'
import { Trophy, Star, TrendingUp, CheckCircle, Car, ArrowUp } from 'lucide-react'

interface RankData {
  rank: number | null
  total_agents: number
  verified_drivers: number
  total_drivers: number
  drivers_to_next_rank: number
  rank_above_verified: number | null
  rank_below_verified: number | null
}

export default function LeaderboardTab() {
  const { data: me } = useQuery({
    queryKey: ['agent_me'],
    queryFn: () => api.get('/agents/me'),
  })

  const { data: rankData, isLoading } = useQuery<RankData>({
    queryKey: ['my_rank'],
    queryFn: () => api.get('/agents/me/rank'),
    refetchInterval: 30000,
  })

  const rank = rankData?.rank ?? null
  const totalAgents = rankData?.total_agents ?? 0
  const myVerified = rankData?.verified_drivers ?? 0
  const myTotal = rankData?.total_drivers ?? 0
  const toNext = rankData?.drivers_to_next_rank ?? 0
  const aboveVerified = rankData?.rank_above_verified ?? null
  const belowVerified = rankData?.rank_below_verified ?? null

  const rankEmoji = (r: number | null) => {
    if (r === 1) return '🏆'
    if (r === 2) return '🥈'
    if (r === 3) return '🥉'
    return null
  }

  const rankOrdinal = (r: number | null) => {
    if (!r) return '—'
    if (r === 1) return '1st'
    if (r === 2) return '2nd'
    if (r === 3) return '3rd'
    return `${r}th`
  }

  const getTier = (r: number | null) => {
    if (!r) return { label: 'Unranked', color: 'text-slate-400', dot: 'bg-slate-300' }
    if (r === 1) return { label: 'Champion', color: 'text-yellow-600', dot: 'bg-yellow-400' }
    if (r <= 3) return { label: 'Elite', color: 'text-purple-600', dot: 'bg-purple-400' }
    if (r <= 10) return { label: 'Top 10', color: 'text-blue-600', dot: 'bg-blue-400' }
    return { label: 'Rising', color: 'text-slate-500', dot: 'bg-slate-400' }
  }

  if (isLoading) {
    return (
      <div className="space-y-5 animate-pulse pt-4 pb-8">
        <div className="rounded-[28px] bg-slate-200/60 h-64" />
        <div className="neu-card rounded-3xl h-36" />
        <div className="neu-card rounded-3xl h-44" />
      </div>
    )
  }

  const tier = getTier(rank)
  const emoji = rankEmoji(rank)

  // Progress % toward next rank
  const progressPct = (() => {
    if (!rank || rank <= 1 || aboveVerified === null) return 100
    const base = belowVerified ?? 0
    const range = Math.max(aboveVerified - base, 1)
    return Math.min(100, Math.round(((myVerified - base) / range) * 100))
  })()

  return (
    <div className="space-y-5 pb-8 pt-2">

      {/* ── HERO RANK CARD ── */}
      <div className="relative overflow-hidden rounded-[28px]"
        style={{ background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)', boxShadow: '0 20px 60px rgba(37,99,235,0.4)' }}>

        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full opacity-10 bg-white pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full opacity-10 bg-white pointer-events-none" />

        <div className="relative p-6">
          {/* Name + tier */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.2em] mb-1">My Ranking</p>
              <h2 className="text-white font-black text-xl leading-tight">
                {me?.full_name || `@${me?.telegram_username}` || 'Agent'}
              </h2>
              <div className="flex items-center gap-1.5 mt-2">
                <span className={`w-1.5 h-1.5 rounded-full ${tier.dot}`} />
                <span className={`text-[11px] font-black uppercase tracking-widest ${tier.color} bg-white/90 px-2.5 py-0.5 rounded-full`}>
                  {tier.label}
                </span>
              </div>
            </div>

            {/* Rank badge */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)' }}>
                {emoji ? (
                  <span className="text-4xl leading-none">{emoji}</span>
                ) : (
                  <>
                    <span className="text-white/50 text-[9px] font-black uppercase tracking-widest">Rank</span>
                    <span className="text-white font-black text-3xl leading-none">{rank ?? '—'}</span>
                  </>
                )}
              </div>
              <p className="text-blue-200 text-[10px] font-bold uppercase tracking-wider">
                {rankOrdinal(rank)} of {totalAgents}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <CheckCircle className="w-4 h-4 text-green-300" />, value: myVerified, label: 'Verified' },
              { icon: <Car className="w-4 h-4 text-blue-200" />, value: myTotal, label: 'Total' },
              { icon: <TrendingUp className="w-4 h-4 text-yellow-300" />, value: rank ? `#${rank}` : '—', label: 'Position' },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl p-3 text-center"
                style={{ background: 'rgba(255,255,255,0.12)' }}>
                <div className="flex justify-center mb-1">{s.icon}</div>
                <div className="text-white font-black text-xl">{s.value}</div>
                <div className="text-blue-200 text-[9px] font-black uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── NEXT RANK PROGRESS ── */}
      {rank && rank > 1 && aboveVerified !== null && (
        <div className="neu-card rounded-3xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: '#fff7ed', boxShadow: '4px 4px 10px rgba(0,0,0,0.06), -2px -2px 8px rgba(255,255,255,0.9)' }}>
              <ArrowUp className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="font-black text-slate-700 text-sm">Climb to #{rank - 1}</p>
              <p className="text-slate-400 text-xs font-semibold">
                {toNext > 0 ? `${toNext} more verified driver${toNext !== 1 ? 's' : ''} needed` : "You're almost there!"}
              </p>
            </div>
          </div>

          <div className="neu-pressed rounded-2xl p-4">
            <div className="w-full rounded-full h-3 mb-2 overflow-hidden"
              style={{ background: '#e2e8f0', boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.1)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progressPct}%`,
                  background: 'linear-gradient(90deg, #f97316, #ea580c)',
                  boxShadow: '0 2px 8px rgba(249,115,22,0.5)'
                }}
              />
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] font-black text-slate-400">You: {myVerified} ✓</span>
              <span className="text-[10px] font-black text-orange-500">Target: {aboveVerified} ✓</span>
            </div>
          </div>
        </div>
      )}

      {/* ── #1 CELEBRATION ── */}
      {rank === 1 && (
        <div className="neu-card rounded-3xl p-6 text-center">
          <div className="text-5xl mb-3 animate-bounce">🏆</div>
          <h3 className="font-black text-xl text-yellow-600 mb-1">You're #1!</h3>
          <p className="text-slate-500 text-sm font-semibold">Keep verifying to defend your title!</p>
          <div className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl"
            style={{ background: '#fefce8', boxShadow: '4px 4px 10px rgba(0,0,0,0.06), -2px -2px 8px rgba(255,255,255,0.9)' }}>
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-yellow-700 text-xs font-black uppercase tracking-widest">Champion Agent</span>
          </div>
        </div>
      )}

      {/* ── POSITION LADDER ── */}
      {rank && totalAgents > 1 && (
        <div className="neu-card rounded-3xl p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5" />
            Position Ladder
          </p>

          <div className="space-y-2">
            {/* Slot above */}
            {rank > 1 && aboveVerified !== null && (
              <div className="flex items-center gap-3 p-3 rounded-xl opacity-50"
                style={{ background: '#f8fafc', boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.05)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-black text-slate-400"
                  style={{ background: '#e2e8f0' }}>
                  #{rank - 1}
                </div>
                <div className="flex-1 h-2.5 rounded-full bg-slate-200" />
                <div className="text-xs font-black text-slate-400">{aboveVerified} ✓</div>
              </div>
            )}

            {/* You */}
            <div className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 6px 20px rgba(37,99,235,0.35)' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white"
                style={{ background: 'rgba(255,255,255,0.2)' }}>
                {emoji || `#${rank}`}
              </div>
              <div className="flex-1">
                <p className="text-white font-black text-sm">You</p>
              </div>
              <div className="flex items-center gap-1 text-white text-xs font-black">
                {myVerified} <CheckCircle className="w-3.5 h-3.5 text-green-300" />
              </div>
            </div>

            {/* Slot below */}
            {belowVerified !== null && (
              <div className="flex items-center gap-3 p-3 rounded-xl opacity-50"
                style={{ background: '#f8fafc', boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.05)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-black text-slate-400"
                  style={{ background: '#e2e8f0' }}>
                  #{rank + 1}
                </div>
                <div className="flex-1 h-2.5 rounded-full bg-slate-200" />
                <div className="text-xs font-black text-slate-400">{belowVerified} ✓</div>
              </div>
            )}
          </div>

          <p className="text-center text-[10px] text-slate-400 font-semibold mt-3 italic">
            Other agents' names are kept private
          </p>
        </div>
      )}

      {/* ── MOTIVATION ── */}
      <div className="neu-card rounded-3xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 6px 20px rgba(37,99,235,0.3)' }}>
          <Trophy className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-black text-slate-700 text-sm">Keep Growing!</p>
          <p className="text-slate-400 text-xs font-semibold mt-0.5 leading-relaxed">
            Every verified driver moves you up. Rankings refresh every 30 seconds.
          </p>
        </div>
      </div>

    </div>
  )
}
