import { useState } from 'react'
import Modal from './Modal'
import { CheckCircle, Clock, XCircle, Car, DollarSign } from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'

interface DashboardTabProps {
  stats: any
  drivers: any[]
  loading: boolean
}

export default function DashboardTab({ stats, drivers, loading }: DashboardTabProps) {
  const [selected, setSelected] = useState<any | null>(null)
  const { t } = useLanguage()

  const driverStatusBadge = {
    VERIFIED: { Icon: CheckCircle, cls: 'text-emerald-600 font-bold', label: t('dashboard.verified') },
    PENDING:  { Icon: Clock,       cls: 'text-amber-600 font-bold',   label: t('dashboard.pending') },
    DECLINED: { Icon: XCircle,     cls: 'text-red-500 font-bold',     label: t('dashboard.declined') },
  }

  if (loading) return (
    <div className="py-16 flex justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const hasEarnings = (stats?.pricePerDriver ?? 0) > 0
  const verified = stats?.verified ?? 0
  const pending = stats?.pending ?? 0
  const declined = stats?.declined ?? 0
  const total = stats?.total ?? 0

  return (
    <div className="space-y-8 pb-4 pt-2">
      <div className="text-center">
        <h2 className="text-lg font-bold text-slate-700">{t('dashboard.welcome_back')}</h2>
        <p className="text-sm text-slate-500">Here is your performance</p>
      </div>

      {/* Impressive Neumorphic Circular Dashboard Widget */}
      <div className="flex justify-center my-8">
        <div className="relative w-64 h-64 neu-circle flex flex-col items-center justify-center border-4 border-transparent">
          
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
          <p className="text-xs text-slate-500 font-semibold text-center mt-2">
            Earnings paid for <span className="text-emerald-600 font-bold">{verified} {t('dashboard.verified')}</span> drivers × ${stats?.pricePerDriver?.toFixed(2)}/driver
          </p>
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
                  {d.status === 'DECLINED' && d.admin_note && (
                    <div className="text-xs text-red-500 font-bold mt-1 italic">"{d.admin_note}"</div>
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
          </div>
        )}
      </Modal>
    </div>
  )
}
