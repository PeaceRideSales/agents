import { useState, useMemo } from 'react'
import { Wallet, DollarSign, Save, CreditCard, ChevronRight, TrendingUp } from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'
import { api } from '../api'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useMyDrivers } from '../hooks/useDrivers'

const tg = window.Telegram?.WebApp

const PAYMENT_METHODS = ['M-Pesa', 'Bank Transfer', 'Telebirr', 'CBE', 'PayPal', 'Cash']

interface WalletTabProps {
  agent: any
  onUpdateAgent?: () => void
}

export default function WalletTab({ agent, onUpdateAgent }: WalletTabProps) {
  const { data } = useMyDrivers(api.getToken() || '')
  const stats = data?.stats
  const drivers = data?.drivers || []

  const [method, setMethod] = useState(agent?.payment_method || '')
  const [details, setDetails] = useState(agent?.payment_details || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  
  // Targets State
  const [dailyTarget, setDailyTarget] = useState(stats?.dailyTarget || '')
  const [weeklyTarget, setWeeklyTarget] = useState(stats?.weeklyTarget || '')
  const [monthlyTarget, setMonthlyTarget] = useState(stats?.monthlyTarget || '')
  const [savingTargets, setSavingTargets] = useState(false)
  const [savedTargets, setSavedTargets] = useState(false)

  const { t } = useLanguage()

  // Determine Agent Tier
  const verified = stats?.verified || 0
  let tier = { name: 'Bronze', color: 'text-amber-700 bg-amber-100', icon: '🥉' }
  if (verified >= 50) tier = { name: 'Gold', color: 'text-yellow-600 bg-yellow-100', icon: '🏆' }
  else if (verified >= 10) tier = { name: 'Silver', color: 'text-slate-600 bg-slate-200', icon: '🥈' }

  // Compute 7-day Analytics
  const { chartData, projectedMonthly } = useMemo(() => {
    const data = []
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    let total7Days = 0

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' })
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
      const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1

      const driversThatDay = (drivers || []).filter(drv => {
        const time = new Date(drv.created_at).getTime()
        return drv.status === 'VERIFIED' && time >= startOfDay && time <= endOfDay
      })

      const earned = driversThatDay.reduce((sum, drv) => sum + Number(drv.payout_amount || 0), 0)
      total7Days += earned

      data.push({
        name: dateStr,
        earned
      })
    }
    
    // Smooth out projection (if 0, don't project 0 forever)
    const projectedMonthly = (total7Days / 7) * 30

    return { chartData: data, projectedMonthly }
  }, [drivers])

  async function handleSave() {
    setSaving(true)
    try {
      await api.patch('/agents/me/payment-details', { 
        payment_method: method, 
        payment_details: details 
      })
      tg?.HapticFeedback?.notificationOccurred('success')
      setSaved(true)
      if (onUpdateAgent) onUpdateAgent()
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Failed to save payment details:', error)
      tg?.HapticFeedback?.notificationOccurred('error')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveTargets() {
    setSavingTargets(true)
    try {
      await api.patch('/agents/me/targets', { 
        daily_target: dailyTarget, 
        weekly_target: weeklyTarget,
        monthly_target: monthlyTarget
      })
      tg?.HapticFeedback?.notificationOccurred('success')
      setSavedTargets(true)
      if (onUpdateAgent) onUpdateAgent()
      setTimeout(() => setSavedTargets(false), 3000)
    } catch (error) {
      console.error('Failed to save targets:', error)
      tg?.HapticFeedback?.notificationOccurred('error')
    } finally {
      setSavingTargets(false)
    }
  }

  // Custom tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-lg">
          <p className="mb-1 text-slate-400">{label}</p>
          <p className="text-blue-400">${payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-6">
      
      {/* Balance Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 shadow-lg shadow-blue-500/30 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <Wallet className="w-24 h-24" />
        </div>
        <h2 className="text-blue-100 font-semibold mb-1 relative z-10 flex items-center gap-2">
          {t('wallet.total_earned')}
        </h2>
        <div className="text-4xl font-bold mb-4 relative z-10">
          ${stats?.earnings?.toFixed(2) || '0.00'}
        </div>
        <div className="flex gap-4 relative z-10">
          <div className="bg-white/20 px-3 py-1.5 rounded-lg text-sm font-semibold backdrop-blur-sm flex items-center gap-1">
            <DollarSign className="w-4 h-4" />{stats?.priceLatest || 150} <span className="text-[10px] opacity-80 uppercase">Latest/EV</span>
          </div>
          <div className="bg-white/20 px-3 py-1.5 rounded-lg text-sm font-semibold backdrop-blur-sm flex items-center gap-1">
            <DollarSign className="w-4 h-4" />{stats?.priceOlder || 120} <span className="text-[10px] opacity-80 uppercase">Older</span>
          </div>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="neu-card rounded-2xl p-5">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h3 className="font-black text-slate-700 text-sm">7-Day Earnings Trend</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Based on verified registrations</p>
          </div>
          <div className="text-right">
            <h3 className="font-black text-emerald-500 text-sm flex items-center gap-1 justify-end">
              <TrendingUp className="w-4 h-4" /> ${projectedMonthly.toFixed(2)}
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Projected Monthly</p>
          </div>
        </div>
        
        <div className="h-40 w-full -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEarned" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} width={40} tickFormatter={(val) => `$${val}`} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '3 3' }} />
              <Area type="monotone" dataKey="earned" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorEarned)" activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Agent Tier */}
      <div className="neu-button rounded-2xl p-5 flex items-center justify-between">
        <div>
          <h3 className="font-black text-slate-700 text-sm">{t('wallet.current_tier')}</h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Unlock better rates</p>
        </div>
        <div className={`px-4 py-2 rounded-xl font-black flex items-center gap-2 neu-pressed border-none ${tier.color.split(' ')[0]}`}>
          <span className="text-xl">{tier.icon}</span>
          {tier.name}
        </div>
      </div>

      {/* Payment Settings */}
      <div className="neu-card rounded-2xl overflow-hidden pb-4">
        <div className="p-5 flex items-center gap-3">
          <div className="w-10 h-10 neu-circle flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-black text-slate-700">{t('wallet.payment_details_title')}</h3>
        </div>
        <div className="px-5 space-y-5">
          <p className="text-xs font-bold text-slate-500">
            {t('wallet.payment_details_desc')}
          </p>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              {t('wallet.method')}
            </label>
            <div className="relative">
              <select 
                value={method}
                onChange={e => {
                  setMethod(e.target.value)
                  tg?.HapticFeedback?.selectionChanged()
                }}
                className="w-full appearance-none neu-pressed text-slate-700 font-bold text-sm rounded-xl block p-4 pr-8 outline-none border-none"
                disabled={saving}
              >
                <option value="" disabled>Select method...</option>
                {PAYMENT_METHODS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              {t('wallet.account_info')}
            </label>
            <input 
              type="text" 
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="e.g. 100012345678"
              className="w-full neu-pressed text-slate-700 font-bold text-sm rounded-xl block p-4 outline-none border-none placeholder-slate-400"
              disabled={saving}
            />
          </div>

          <button 
            onClick={handleSave}
            disabled={saving || !method || !details}
            className={`w-full flex justify-center items-center gap-2 font-black rounded-xl px-4 py-4 text-white transition-colors ${
              saved ? 'bg-emerald-500 shadow-[0_10px_20px_rgba(16,185,129,0.3)]' : 'bg-blue-600 shadow-[0_10px_20px_rgba(37,99,235,0.3)] hover:bg-blue-700 disabled:opacity-50 disabled:shadow-none'
            }`}
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : saved ? (
              <><Save className="w-5 h-5" /> {t('wallet.saved')}</>
            ) : (
              <><Save className="w-5 h-5" /> {t('wallet.save_details')}</>
            )}
          </button>
        </div>
      </div>

      {/* Target Goals Settings */}
      <div className="neu-card rounded-2xl overflow-hidden pb-4">
        <div className="p-5 flex items-center gap-3">
          <div className="w-10 h-10 neu-circle flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="font-black text-slate-700">Target Goals</h3>
        </div>
        <div className="px-5 space-y-5">
          <p className="text-xs font-bold text-slate-500">
            Set your registration targets. These will appear as progress rings on your Dashboard.
          </p>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 text-center">Daily</label>
              <input 
                type="number" 
                value={dailyTarget}
                onChange={e => setDailyTarget(e.target.value)}
                placeholder="0"
                className="w-full neu-pressed text-slate-700 font-bold text-sm rounded-xl block p-3 text-center outline-none border-none placeholder-slate-400"
                disabled={savingTargets}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 text-center">Weekly</label>
              <input 
                type="number" 
                value={weeklyTarget}
                onChange={e => setWeeklyTarget(e.target.value)}
                placeholder="0"
                className="w-full neu-pressed text-slate-700 font-bold text-sm rounded-xl block p-3 text-center outline-none border-none placeholder-slate-400"
                disabled={savingTargets}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-purple-500 uppercase tracking-widest mb-2 text-center">Monthly</label>
              <input 
                type="number" 
                value={monthlyTarget}
                onChange={e => setMonthlyTarget(e.target.value)}
                placeholder="0"
                className="w-full neu-pressed text-slate-700 font-bold text-sm rounded-xl block p-3 text-center outline-none border-none placeholder-slate-400"
                disabled={savingTargets}
              />
            </div>
          </div>

          <button 
            onClick={handleSaveTargets}
            disabled={savingTargets}
            className={`w-full flex justify-center items-center gap-2 font-black rounded-xl px-4 py-4 text-white transition-colors ${
              savedTargets ? 'bg-emerald-500 shadow-[0_10px_20px_rgba(16,185,129,0.3)]' : 'bg-slate-700 shadow-[0_10px_20px_rgba(51,65,85,0.3)] hover:bg-slate-800 disabled:opacity-50 disabled:shadow-none'
            }`}
          >
            {savingTargets ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : savedTargets ? (
              <><Save className="w-5 h-5" /> Saved!</>
            ) : (
              <><Save className="w-5 h-5" /> Save Targets</>
            )}
          </button>
        </div>
      </div>

    </div>
  )
}
