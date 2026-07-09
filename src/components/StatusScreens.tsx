import { useLanguage } from '../hooks/useLanguage'

interface StatusScreensProps {
  screen: 'loading' | 'pending' | 'success'
  error?: string
  onSuccessContinue: () => void
}

export default function StatusScreens({ screen, error, onSuccessContinue }: StatusScreensProps) {
  const { t } = useLanguage()
  
  if (screen === 'loading') return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 min-h-screen bg-blue-600">
      <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl mb-8 p-4 border border-white/20 animate-pulse">
        <img src="/logo.png" alt="Peace Ride Logo" className="w-full h-full object-contain filter brightness-0 invert opacity-90" />
      </div>
      <h1 className="text-3xl font-black text-white tracking-tighter mb-2">Peace Ride</h1>
      <p className="text-blue-100 font-medium tracking-widest uppercase text-xs">Agent Reporting Portal</p>
    </div>
  )

  if (screen === 'pending') return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-6 min-h-screen neu-bg">
      <div className="w-24 h-24 neu-circle flex items-center justify-center text-5xl mb-2">⏳</div>
      <h2 className="text-2xl font-black text-slate-700">{t('status.pending_title')}</h2>
      <p className="text-slate-500 font-semibold leading-relaxed max-w-xs">{t('status.pending_desc')}</p>
      {error && (
        <div className="neu-pressed rounded-xl p-4 text-sm font-bold text-red-600 mt-2">{error}</div>
      )}
    </div>
  )

  if (screen === 'success') return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-6 min-h-screen neu-bg">
      <div className="w-24 h-24 neu-circle flex items-center justify-center text-5xl mb-2">✅</div>
      <h2 className="text-2xl font-black text-slate-700">{t('status.success_title')}</h2>
      <p className="text-slate-500 font-semibold text-sm">{t('status.success_desc')}</p>
      <button
        className="w-full max-w-[240px] mt-6 p-4 rounded-2xl font-black uppercase tracking-widest text-sm bg-blue-600 text-white shadow-[5px_5px_15px_rgba(37,99,235,0.4),-5px_-5px_15px_rgba(255,255,255,0.5)] hover:bg-blue-700 transition-colors"
        onClick={onSuccessContinue}
      >
        {t('status.view_dashboard')}
      </button>
    </div>
  )

  return null
}
