import { useLanguage } from '../hooks/useLanguage'

interface StatusScreensProps {
  screen: 'loading' | 'pending' | 'success'
  error?: string
  onSuccessContinue: () => void
}

export default function StatusScreens({ screen, error, onSuccessContinue }: StatusScreensProps) {
  const { t } = useLanguage()
  
  if (screen === 'loading') return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-6 min-h-screen neu-bg">
      <div className="w-16 h-16 neu-circle flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">{error || t('common.loading')}</p>
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
