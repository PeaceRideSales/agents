import { useState } from 'react'
import Modal from './Modal'
import AppealModal from './AppealModal'
import { CheckCircle, Clock, XCircle, Car, DollarSign, AlertCircle } from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'
import { useMyDrivers } from '../hooks/useDrivers'
import { api } from '../api'

export default function DashboardTab() {
  const { data, isLoading: loading } = useMyDrivers(api.getToken() || '')
  const stats = data?.stats
  const drivers = data?.drivers || []
  const [selected, setSelected] = useState<any | null>(null)
  const [appealDriver, setAppealDriver] = useState<any | null>(null)
  const { t } = useLanguage()

  const driverStatusBadge = {
    VERIFIED: { Icon: CheckCircle, cls: 'text-emerald-600 font-bold', label: t('dashboard.verified') },
    PENDING:  { Icon: Clock,       cls: 'text-amber-600 font-bold',   label: t('dashboard.pending') },
    DECLINED: { Icon: XCircle,     cls: 'text-red-500 font-bold',     label: t('dashboard.declined') },
  }

  if (loading) return (
    <div className="space-y-8 pb-4 pt-2 px-2 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col items-center gap-2">
        <div className="h-6 w-32 bg-slate-200/60 rounded-full" />
        <div className="h-4 w-48 bg-slate-200/50 rounded-full" />
      </div>
      
      {/* Circle Skeleton */}
      <div className="flex justify-center my-12">
        <div className="w-64 h-64 bg-slate-200/50 rounded-full border-4 border-white/50 shadow-inner" />
      </div>

      {/* Cards Skeleton */}
      <div className="space-y-4">
        <div className="h-28 w-full bg-slate-200/50 rounded-2xl" />
        <div className="h-24 w-full bg-slate-200/50 rounded-2xl" />
      </div>
    </div>
  )

  const hasEarnings = stats?.hasEarnings
  const priceLatest = stats?.priceLatest ?? 150
  const priceOlder = stats?.priceOlder ?? 120
  const verified = stats?.verified ?? 0
  const pending = stats?.pending ?? 0
  const declined = stats?.declined ?? 0
  const total = stats?.total ?? 0

  // Targets
  const thisDay = stats?.thisDay ?? 0
  const thisWeek = stats?.thisWeek ?? 0
  const thisMonth = stats?.thisMonth ?? 0
  
  const dailyTarget = stats?.dailyTarget || 0
  const weeklyTarget = stats?.weeklyTarget || 0
  const monthlyTarget = stats?.monthlyTarget || 0

  const dailyPct = dailyTarget > 0 ? Math.min((thisDay / dailyTarget) * 100, 100) : 0;
  const weeklyPct = weeklyTarget > 0 ? Math.min((thisWeek / weeklyTarget) * 100, 100) : 0;
  const monthlyPct = monthlyTarget > 0 ? Math.min((thisMonth / monthlyTarget) * 100, 100) : 0;

  // SVG calculations
  const radiusDaily = 142;
  const radiusWeekly = 158;
  const radiusMonthly = 174;
  const circDaily = 2 * Math.PI * radiusDaily;
  const circWeekly = 2 * Math.PI * radiusWeekly;
  const circMonthly = 2 * Math.PI * radiusMonthly;

  return (
    <div className="space-y-8 pb-4 pt-2">
      <div className="text-center">
        <h2 className="text-lg font-bold text-slate-700">{t('dashboard.welcome_back')}</h2>
        <p className="text-sm text-slate-500">Here is your performance</p>
      </div>

      {/* Global Goal Progress */}
      <div className="neu-card p-5 mx-2 mt-6">
        <div className="flex justify-between items-end mb-2">
          <div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Goal</h3>
            <p className="text-xl font-black text-slate-700">
              {stats?.globalVerified?.toLocaleString() || 0} <span className="text-xs text-slate-400 font-semibold">/ 4,000</span>
            </p>
          </div>
          <div className="text-right">
            <span className="text-emerald-500 font-bold text-sm">
              {Math.min(100, Math.round(((stats?.globalVerified || 0) / 4000) * 100))}%
            </span>
          </div>
        </div>
        <div className="w-full neu-pressed rounded-full h-3 overflow-hidden">
          <div 
            className="bg-emerald-500 h-3 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
            style={{ width: `${Math.min(100, ((stats?.globalVerified || 0) / 4000) * 100)}%` }}
          />
        </div>
      </div>

      {/* Impressive Neumorphic Circular Dashboard Widget with Target Rings */}
      <div className="flex justify-center my-12">
        <div className="relative w-[360px] h-[360px] flex items-center justify-center">
          
          {/* Concentric SVG Target Rings */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none drop-shadow-md" viewBox="0 0 360 360">
            <defs>
              <filter id="watery" x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise">
                  <animate attributeName="baseFrequency" values="0.04; 0.06; 0.04" dur="5s" repeatCount="indefinite" />
                </feTurbulence>
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>

            {/* Background tracks (Neumorphic inset effect via dark stroke with opacity) */}
            <circle cx="180" cy="180" r={radiusMonthly} stroke="#a3b1c6" strokeWidth="8" fill="none" opacity="0.3" />
            <circle cx="180" cy="180" r={radiusWeekly} stroke="#a3b1c6" strokeWidth="8" fill="none" opacity="0.3" />
            <circle cx="180" cy="180" r={radiusDaily} stroke="#a3b1c6" strokeWidth="8" fill="none" opacity="0.3" />

            {/* Progress tracks */}
            {monthlyTarget > 0 && (
              <circle cx="180" cy="180" r={radiusMonthly} stroke="#8b5cf6" strokeWidth="8" fill="none" strokeLinecap="round"
                strokeDasharray={circMonthly} strokeDashoffset={circMonthly - (monthlyPct / 100) * circMonthly}
                className="transition-all duration-1000 ease-out" />
            )}
            {weeklyTarget > 0 && (
              <circle cx="180" cy="180" r={radiusWeekly} stroke="#3b82f6" strokeWidth="8" fill="none" strokeLinecap="round"
                strokeDasharray={circWeekly} strokeDashoffset={circWeekly - (weeklyPct / 100) * circWeekly}
                className="transition-all duration-1000 ease-out" />
            )}
            {dailyTarget > 0 && (
              <circle cx="180" cy="180" r={radiusDaily} stroke="#06b6d4" strokeWidth="8" fill="none" strokeLinecap="round"
                strokeDasharray={circDaily} strokeDashoffset={circDaily - (dailyPct / 100) * circDaily}
                className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" filter="url(#watery)" />
            )}
          </svg>

          {/* Central Neumorphic Circle */}
          <div className="relative w-64 h-64 neu-circle flex flex-col items-center justify-center border-4 border-transparent z-10">
            {/* Logo inset ring */}
            <div className="absolute inset-2 rounded-full neu-pressed pointer-events-none"></div>

            {/* Logo at the top of the circle */}
            <div className="absolute top-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                <img src="/logo.png" alt="Peace Ride" className="w-7 h-7 object-contain filter brightness-0 invert" onError={e => (e.currentTarget.style.display = 'none')} />
              </div>
            </div>

            <div className="text-center z-10 mt-8">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{t('dashboard.drivers_registered')}</span>
              <span className="block text-6xl font-black text-slate-700 tracking-tighter leading-none">
                {total}
              </span>
            </div>

            {/* Bottom badge inside the circle */}
            {hasEarnings && (
              <div className="absolute bottom-6 flex items-center gap-1.5 neu-pressed text-emerald-600 px-5 py-2 rounded-full text-sm font-black">
                <DollarSign className="w-4 h-4" />
                {stats?.earnings?.toFixed(2) || '0.00'}
              </div>
            )}
            {!hasEarnings && (
              <div className="absolute bottom-6 flex items-center gap-1.5 neu-pressed text-blue-600 px-5 py-2 rounded-full text-sm font-black">
                <Car className="w-4 h-4" />
                {stats?.thisMonth || 0} this month
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Target Setup Prompt if no targets set */}
      {!dailyTarget && !weeklyTarget && !monthlyTarget && (
        <div className="neu-card p-4 mx-2 text-center text-sm font-bold text-slate-500 flex flex-col gap-2 rounded-2xl border border-blue-100">
          <p>You haven't set any registration targets yet.</p>
          <p className="text-[10px] uppercase text-blue-500">Go to Wallet &gt; Target Goals to set them up!</p>
        </div>
      )}
      
      {/* Target Legend */}
      {(dailyTarget > 0 || weeklyTarget > 0 || monthlyTarget > 0) && (
        <div className="flex justify-center gap-4 px-2 mt-4">
          {dailyTarget > 0 && (
            <div className="text-center bg-cyan-50/50 rounded-xl py-2 px-3 flex-1 border border-cyan-100">
              <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest mb-0.5">Daily</p>
              <p className="text-xs font-bold text-slate-700">{thisDay}/{dailyTarget}</p>
            </div>
          )}
          {weeklyTarget > 0 && (
            <div className="text-center bg-blue-50/50 rounded-xl py-2 px-3 flex-1 border border-blue-100">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5">Weekly</p>
              <p className="text-xs font-bold text-slate-700">{thisWeek}/{weeklyTarget}</p>
            </div>
          )}
          {monthlyTarget > 0 && (
            <div className="text-center bg-purple-50/50 rounded-xl py-2 px-3 flex-1 border border-purple-100">
              <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-0.5">Monthly</p>
              <p className="text-xs font-bold text-slate-700">{thisMonth}/{monthlyTarget}</p>
            </div>
          )}
        </div>
      )}

      {/* Verification breakdown */}
      <div className="neu-card p-5 space-y-4">
        <p className="text-xs font-black text-slate-500 uppercase tracking-wider text-center">Verification Breakdown</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center neu-pressed rounded-xl py-4">
            <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
            <p className="text-2xl font-black text-slate-700">{verified}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{t('dashboard.verified')}</p>
          </div>
          <div className="text-center neu-pressed rounded-xl py-4">
            <Clock className="w-5 h-5 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-black text-slate-700">{pending}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{t('dashboard.pending')}</p>
          </div>
          <div className="text-center neu-pressed rounded-xl py-4">
            <XCircle className="w-5 h-5 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-black text-slate-700">{declined}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{t('dashboard.declined')}</p>
          </div>
        </div>
        {hasEarnings && (
          <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100 text-xs font-semibold text-center mt-2 space-y-1">
            <p>Total earnings: <span className="font-black text-emerald-600 text-sm">{stats?.earnings?.toFixed(2)} Birr</span></p>
            <p className="text-[10px] text-emerald-600/80 uppercase font-bold tracking-wider">
              {priceLatest} Birr (Latest/EV) • {priceOlder} Birr (Older)
            </p>
          </div>
        )}
      </div>

      {/* Weekly stat */}
      <div className="neu-card p-4 flex justify-between items-center px-6">
        <span className="text-sm text-slate-600 font-bold uppercase tracking-wider">Added This Week</span>
        <span className="text-xl font-black text-blue-600">+{stats?.thisWeek || 0}</span>
      </div>

      {/* Driver list */}
      <div className="pt-2">
        <h3 className="text-xs font-black text-slate-500 mb-4 uppercase tracking-wider pl-2">{t('dashboard.recent_drivers')}</h3>
        <div className="space-y-4">
          {drivers.slice(0, 15).map(d => {
            const sb = driverStatusBadge[d.status as keyof typeof driverStatusBadge] || driverStatusBadge.PENDING
            const Icon = sb.Icon
            return (
              <div key={d.id} onClick={() => setSelected(d)}
                className="neu-button p-4 rounded-2xl flex justify-between items-center cursor-pointer">
                <div>
                  <div className="font-bold text-slate-700 text-sm">{d.full_name}</div>
                  <div className="text-xs text-slate-500 font-semibold mt-1">{d.car_model} • {d.location || 'Unknown'}</div>
                  {d.status === 'VERIFIED' && d.payout_amount && (
                    <div className="text-xs text-emerald-600 font-bold mt-1">Paid: {d.payout_amount} Birr</div>
                  )}
                  {d.status === 'DECLINED' && d.admin_note && (
                    <div className="text-xs text-red-500 font-bold mt-1 italic">"{d.admin_note}"</div>
                  )}
                  {d.status === 'DECLINED' && !d.appealed && (
                    <button
                      onClick={e => { e.stopPropagation(); setAppealDriver(d) }}
                      className="mt-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-600 neu-pressed px-3 py-1.5 rounded-full"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {t('appeal.submit')}
                    </button>
                  )}
                  {d.status === 'DECLINED' && d.appealed && (
                    <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wide">Appeal submitted ✓</div>
                  )}
                </div>
                <div className={`flex items-center gap-1.5 text-[10px] uppercase neu-pressed px-3 py-1.5 rounded-full ${sb.cls}`}>
                  <Icon className="w-3.5 h-3.5" />
                  <span>{sb.label}</span>
                </div>
              </div>
            )
          })}
          {drivers.length === 0 && (
            <div className="text-center py-12 text-slate-500 font-bold text-sm neu-pressed rounded-2xl">
              {t('dashboard.no_drivers')}
            </div>
          )}
        </div>
      </div>

      {/* Driver detail modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Driver Profile">
        {selected && (
          <div className="space-y-5 p-2">
            <div className="text-center pb-4">
              <div className="w-16 h-16 neu-circle flex items-center justify-center mx-auto mb-4 text-3xl">🚗</div>
              <h3 className="font-black text-slate-700 text-xl">{selected.full_name}</h3>
              <p className="text-slate-500 font-bold text-sm mt-1">{selected.phone}</p>
            </div>
            {[
              { label: 'Status',       value: selected.status },
              { label: 'Location',     value: selected.location || 'Unknown' },
              { label: 'Vehicle',      value: selected.car_model },
              { label: 'License',      value: selected.license_plate },
              { label: 'Registered',   value: new Date(selected.created_at).toLocaleDateString() },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center neu-pressed px-5 py-3 rounded-xl">
                <span className="text-xs font-black text-slate-400 uppercase">{row.label}</span>
                <span className="text-sm font-bold text-slate-700">{row.value}</span>
              </div>
            ))}
            {selected.admin_note && (
              <div className="neu-pressed border-none rounded-xl p-4 text-sm text-red-600 font-bold">
                <span className="uppercase tracking-wider text-xs block mb-1">Admin note:</span> {selected.admin_note}
              </div>
            )}
            {selected.status === 'DECLINED' && !selected.appealed && (
              <button
                onClick={() => { setSelected(null); setAppealDriver(selected) }}
                className="w-full p-4 rounded-2xl font-black bg-amber-500 text-white shadow-[0_8px_20px_rgba(245,158,11,0.3)] hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <AlertCircle className="w-4 h-4" />
                {t('appeal.title')}
              </button>
            )}
          </div>
        )}
      </Modal>

      {/* Appeal modal */}
      <AppealModal driver={appealDriver} onClose={() => setAppealDriver(null)} />
    </div>
  )
}
