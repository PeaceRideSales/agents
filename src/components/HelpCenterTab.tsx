import { useState } from 'react'
import {
  MessageCircle,
  Mail,
  Clock,
  ChevronDown,
  ChevronUp,
  Send,
  HeartHandshake,
} from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'
import { api } from '../api'

// ── Config — update these values ──────────────────────────────────────────
const SUPPORT_TELEGRAM_USERNAME = 'PeaceRideSupport'  // Change to your bot/account
const SUPPORT_EMAIL = 'support@peacerideapp.com'
// ──────────────────────────────────────────────────────────────────────────

const tg = window.Telegram?.WebApp

type MessageType = 'general' | 'appeal' | 'payment' | 'technical' | 'other'

interface FaqItem {
  q: string
  a: string
}

function FaqCard({ q, a }: FaqItem) {
  const [open, setOpen] = useState(false)
  return (
    <button
      type="button"
      className="w-full text-left"
      onClick={() => setOpen(o => !o)}
    >
      <div className="neu-button rounded-2xl p-4 space-y-2">
        <div className="flex justify-between items-start gap-3">
          <p className="text-sm font-bold text-slate-700 leading-snug">{q}</p>
          {open ? (
            <ChevronUp className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          )}
        </div>
        {open && (
          <p className="text-xs text-slate-500 font-semibold leading-relaxed border-t border-slate-200/60 pt-3">
            {a}
          </p>
        )}
      </div>
    </button>
  )
}

export default function HelpCenterTab() {
  const { t } = useLanguage()
  const [messageType, setMessageType] = useState<MessageType>('general')
  const [messageBody, setMessageBody] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const messageTypeOptions: { value: MessageType; label: string }[] = [
    { value: 'general',    label: t('help.message_type_general') },
    { value: 'appeal',     label: t('help.message_type_appeal') },
    { value: 'payment',    label: t('help.message_type_payment') },
    { value: 'technical',  label: t('help.message_type_technical') },
    { value: 'other',      label: t('help.message_type_other') },
  ]

  const faqs: FaqItem[] = [
    { q: t('help.faq1_q'), a: t('help.faq1_a') },
    { q: t('help.faq2_q'), a: t('help.faq2_a') },
    { q: t('help.faq3_q'), a: t('help.faq3_a') },
  ]

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!messageBody.trim() || messageBody.trim().length < 10) {
      setError('Please write a message of at least 10 characters.')
      tg?.HapticFeedback?.notificationOccurred('error')
      return
    }

    setSending(true)
    try {
      // We queue a Telegram message to admin via the support endpoint
      await api.post('/support/message', {
        type: messageType,
        body: messageBody.trim(),
      })
      tg?.HapticFeedback?.notificationOccurred('success')
      setSent(true)
      setMessageBody('')
    } catch (err: any) {
      setError(err.message || 'Failed to send message. Please try again.')
      tg?.HapticFeedback?.notificationOccurred('error')
    } finally {
      setSending(false)
    }
  }

  const inputCls =
    'w-full neu-pressed text-sm text-slate-700 font-bold placeholder-slate-400 outline-none p-4 rounded-xl transition-colors disabled:opacity-50'

  return (
    <div className="space-y-6 pb-4 pt-2">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="w-16 h-16 neu-circle flex items-center justify-center mx-auto mb-3">
          <HeartHandshake className="w-7 h-7 text-blue-500" />
        </div>
        <h2 className="text-lg font-black text-slate-700">{t('help.title')}</h2>
        <p className="text-sm text-slate-500 font-semibold">{t('help.subtitle')}</p>
      </div>

      {/* Telegram Support Card */}
      <div className="neu-card rounded-3xl p-5 space-y-3">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 neu-circle flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-700">{t('help.support_title')}</p>
            <p className="text-xs text-slate-500 font-semibold">{t('help.support_desc')}</p>
          </div>
        </div>
        <a
          href={`https://t.me/${SUPPORT_TELEGRAM_USERNAME}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full p-4 rounded-2xl font-black text-sm bg-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.3)] hover:bg-blue-700 transition-colors"
          onClick={() => tg?.HapticFeedback?.impactOccurred('light')}
        >
          <MessageCircle className="w-4 h-4" />
          {t('help.support_btn')}
        </a>
      </div>

      {/* Contact Info */}
      <div className="neu-card rounded-3xl p-5 space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('help.contact_title')}</p>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="flex items-center gap-3 neu-button rounded-xl p-3"
        >
          <Mail className="w-4 h-4 text-blue-500 shrink-0" />
          <div>
            <p className="text-xs font-black text-slate-600">{t('help.contact_email')}</p>
            <p className="text-[11px] text-slate-400 font-semibold">{SUPPORT_EMAIL}</p>
          </div>
        </a>
        <div className="flex items-center gap-3 neu-pressed rounded-xl p-3">
          <Clock className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-xs font-semibold text-slate-500">{t('help.contact_hours')}</p>
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">{t('help.faq_title')}</p>
        {faqs.map((faq, i) => (
          <FaqCard key={i} q={faq.q} a={faq.a} />
        ))}
      </div>

      {/* Send Message Form */}
      <div className="neu-card rounded-3xl p-5 space-y-4">
        <div>
          <p className="text-sm font-black text-slate-700">{t('help.message_title')}</p>
          <p className="text-xs text-slate-500 font-semibold mt-1">{t('help.message_desc')}</p>
        </div>

        {sent ? (
          <div className="text-center space-y-3 py-4">
            <div className="w-14 h-14 neu-circle flex items-center justify-center mx-auto">
              <Send className="w-6 h-6 text-emerald-500" />
            </div>
            <p className="text-sm font-bold text-emerald-600">{t('help.sent_success')}</p>
            <button
              onClick={() => setSent(false)}
              className="text-xs font-bold text-blue-500 underline"
            >
              {t('common.cancel')} / {t('common.submit')} another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('help.message_type')}</p>
              <select
                value={messageType}
                onChange={e => setMessageType(e.target.value as MessageType)}
                className={inputCls}
                disabled={sending}
              >
                {messageTypeOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('help.message_body')}</p>
              <textarea
                rows={5}
                placeholder={t('help.message_placeholder')}
                value={messageBody}
                onChange={e => setMessageBody(e.target.value)}
                className={`${inputCls} resize-none`}
                disabled={sending}
              />
            </div>

            {error && (
              <div className="neu-pressed rounded-xl p-3 text-xs font-bold text-red-600">{error}</div>
            )}

            <button
              type="submit"
              disabled={sending}
              className="w-full p-4 rounded-2xl font-black bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-[0_8px_20px_rgba(37,99,235,0.3)] transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {sending ? t('help.sending') : t('help.send')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
