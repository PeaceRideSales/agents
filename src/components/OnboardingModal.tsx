import { useLanguage } from '../hooks/useLanguage'
import { Car, Clock, CheckCircle } from 'lucide-react'

interface OnboardingModalProps {
  onComplete: () => void
}

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const { t, language, setLanguage } = useLanguage()

  return (
    <div className="fixed inset-0 z-50 neu-bg flex flex-col">
      {/* Header with Language Toggle */}
      <div className="flex justify-end p-4">
        <div className="flex items-center neu-pressed rounded-xl p-1.5">
          <button
            onClick={() => setLanguage('en')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${language === 'en' ? 'neu-card text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('am')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${language === 'am' ? 'neu-card text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            አማርኛ
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/30 mx-auto mb-6">
            <img src="/logo.png" alt="Peace Ride" className="w-12 h-12 object-contain filter brightness-0 invert"
              onError={e => (e.currentTarget.style.display = 'none')} />
          </div>
          <h1 className="text-3xl font-black text-slate-700 mb-2">{t('onboarding.welcome')}</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{t('onboarding.subtitle')}</p>
        </div>

        <div className="space-y-6">
          <div className="flex gap-5 p-5 rounded-3xl neu-card items-center">
            <div className="shrink-0 w-14 h-14 neu-circle flex items-center justify-center">
              <Car className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-black text-slate-700 text-lg mb-1">{t('onboarding.step1.title')}</h3>
              <p className="text-slate-500 font-semibold text-sm leading-relaxed">{t('onboarding.step1.desc')}</p>
            </div>
          </div>

          <div className="flex gap-5 p-5 rounded-3xl neu-card items-center">
            <div className="shrink-0 w-14 h-14 neu-circle flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-black text-slate-700 text-lg mb-1">{t('onboarding.step2.title')}</h3>
              <p className="text-slate-500 font-semibold text-sm leading-relaxed">{t('onboarding.step2.desc')}</p>
            </div>
          </div>

          <div className="flex gap-5 p-5 rounded-3xl neu-card items-center">
            <div className="shrink-0 w-14 h-14 neu-circle flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-black text-slate-700 text-lg mb-1">{t('onboarding.step3.title')}</h3>
              <p className="text-slate-500 font-semibold text-sm leading-relaxed">{t('onboarding.step3.desc')}</p>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <button
            onClick={onComplete}
            className="w-full bg-blue-600 text-white font-black uppercase tracking-widest text-sm py-5 rounded-2xl shadow-[5px_5px_15px_rgba(37,99,235,0.4),-5px_-5px_15px_rgba(255,255,255,0.5)] hover:bg-blue-700 transition-colors"
          >
            {t('onboarding.button')}
          </button>
        </div>
      </div>
    </div>
  )
}
