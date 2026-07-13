import { MessageCircle, PhoneCall, HeartHandshake } from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'

const SUPPORT_TELEGRAM_USERNAME = 'Zeki373'
const SUPPORT_PHONE = '0965787862'
const tg = window.Telegram?.WebApp

export default function HelpCenterTab() {
  const { t } = useLanguage()

  return (
    <div className="space-y-6 pb-4 pt-2">
      {/* Header */}
      <div className="text-center space-y-1 mb-8">
        <div className="w-20 h-20 neu-circle flex items-center justify-center mx-auto mb-4">
          <HeartHandshake className="w-10 h-10 text-blue-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-700">{t('help.title') || 'Support & Help'}</h2>
        <p className="text-sm text-slate-500 font-semibold max-w-[250px] mx-auto leading-relaxed">
          {t('help.subtitle') || 'Need assistance or experiencing a system issue? We are here to help.'}
        </p>
      </div>

      <div className="space-y-4 px-2">
        {/* Call Card */}
        <div className="neu-card rounded-3xl p-5 flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-[0_6px_20px_rgba(34,197,94,0.3)]">
            <PhoneCall className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-black text-slate-700 text-lg">Call Support</p>
            <p className="text-slate-500 text-xs font-semibold">Speak directly with our team</p>
          </div>
          <a
            href={`tel:${SUPPORT_PHONE}`}
            className="w-full mt-2 py-3.5 bg-green-50 hover:bg-green-100 text-green-700 font-black rounded-3xl border-2 border-green-200 transition-colors flex justify-center items-center gap-2"
          >
            <PhoneCall className="w-4 h-4" />
            {SUPPORT_PHONE}
          </a>
        </div>

        {/* Telegram Card */}
        <div className="neu-card rounded-3xl p-5 flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-[0_6px_20px_rgba(37,99,235,0.3)]">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-black text-slate-700 text-lg">Chat on Telegram</p>
            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
              If it's a system issue, please upload a screenshot and message <span className="font-bold text-blue-600">@{SUPPORT_TELEGRAM_USERNAME}</span>.
            </p>
          </div>
          <a
            href={`https://t.me/${SUPPORT_TELEGRAM_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => tg?.HapticFeedback?.impactOccurred('light')}
            className="w-full mt-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-3xl shadow-[0_8px_20px_rgba(37,99,235,0.3)] transition-colors flex justify-center items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Message @{SUPPORT_TELEGRAM_USERNAME}
          </a>
        </div>
      </div>
    </div>
  )
}
