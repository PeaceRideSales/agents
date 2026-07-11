import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Paperclip, Send } from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'
import { api } from '../api'

interface StatusScreensProps {
  screen: 'loading' | 'pending' | 'success'
  error?: string
  agent?: { status: string; appealed?: boolean } | null
  onSuccessContinue: () => void
}

const tg = window.Telegram?.WebApp

async function uploadDocument(f: File): Promise<string> {
  const { signedUrl, publicUrl } = await api.post('/upload/document/presigned', {
    filename: f.name,
  })
  const res = await fetch(signedUrl, {
    method: 'PUT',
    body: f,
    headers: { 'Content-Type': f.type || 'application/octet-stream' },
  })
  if (!res.ok) throw new Error('Failed to upload document')
  return publicUrl
}

function AgentAccountAppeal({ onAppealed }: { onAppealed: () => void }) {
  const { t } = useLanguage()
  const [reason, setReason] = useState('')
  const [requirements, setRequirements] = useState<{id: string, name: string, required: boolean}[]>([
    { id: 'primary_document', name: 'Primary Document', required: false }
  ])
  const [files, setFiles] = useState<Record<string, File>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    api.get('/settings').then(res => {
      if (res.data?.agent_document_requirements) {
        setRequirements(res.data.agent_document_requirements)
      }
    }).catch(console.error)
  }, [])

  const inputCls =
    'w-full neu-pressed text-sm text-slate-700 font-bold placeholder-slate-400 outline-none p-4 rounded-xl transition-colors disabled:opacity-50'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (reason.trim().length < 10) {
      setError('Please provide at least 10 characters for your appeal reason.')
      tg?.HapticFeedback?.notificationOccurred('error')
      return
    }

    const missingDocs = requirements.filter(r => r.required && !files[r.id])
    if (missingDocs.length > 0) {
      setError(`Please provide: ${missingDocs.map(m => m.name).join(', ')}`)
      tg?.HapticFeedback?.notificationOccurred('error')
      return
    }

    setSubmitting(true)
    try {
      const documents: any[] = []
      for (const [type_id, fileObj] of Object.entries(files)) {
        const url = await uploadDocument(fileObj)
        documents.push({ type_id, url })
      }
      
      await api.patch('/agents/me/appeal', {
        appeal_reason: reason.trim(),
        documents,
      })
      tg?.HapticFeedback?.notificationOccurred('success')
      setSuccess(true)
      setTimeout(() => onAppealed(), 1500)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      tg?.HapticFeedback?.notificationOccurred('error')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4 p-4">
        <div className="w-14 h-14 neu-circle flex items-center justify-center mx-auto">
          <CheckCircle className="w-7 h-7 text-emerald-500" />
        </div>
        <p className="text-sm font-bold text-emerald-600">{t('appeal.success')}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
      <p className="text-xs text-slate-500 font-semibold leading-relaxed text-center">{t('appeal.account_subtitle')}</p>

      <textarea
        rows={5}
        placeholder={t('appeal.reason_placeholder')}
        value={reason}
        onChange={e => setReason(e.target.value)}
        className={`${inputCls} resize-none`}
        disabled={submitting}
      />

      {requirements.map(req => {
        const fileObj = files[req.id]
        return (
          <label key={req.id} className={`flex items-center gap-3 p-4 neu-pressed rounded-xl cursor-pointer ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <div className="w-10 h-10 neu-circle flex items-center justify-center shrink-0">
              {fileObj ? <span className="text-lg">✅</span> : <Paperclip className="w-4 h-4 text-blue-500" />}
            </div>
            <div className="truncate flex-1 text-left">
              <p className="text-sm font-bold text-slate-700 truncate">
                {fileObj ? fileObj.name : t('register.upload') + req.name}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                {req.required ? t('register.required') : t('register.optional')}
              </p>
            </div>
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              disabled={submitting}
              onChange={e => {
                const newFile = e.target.files?.[0]
                if (newFile) setFiles(f => ({ ...f, [req.id]: newFile }))
              }}
            />
          </label>
        )
      })}

      {error && (
        <div className="neu-pressed rounded-xl p-3 text-xs font-bold text-red-600">{error}</div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full p-4 rounded-2xl font-black bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white shadow-[0_8px_20px_rgba(245,158,11,0.3)] transition-colors flex items-center justify-center gap-2"
      >
        <Send className="w-4 h-4" />
        {submitting ? t('appeal.submitting') : t('appeal.account_submit')}
      </button>
    </form>
  )
}

export default function StatusScreens({ screen, error, agent, onSuccessContinue }: StatusScreensProps) {
  const { t } = useLanguage()
  const [showAppeal, setShowAppeal] = useState(false)

  // ── Loading ──────────────────────────────────────────────────────────────
  if (screen === 'loading') return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 min-h-screen bg-blue-600">
      <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl mb-8 p-4 border border-white/20 animate-pulse">
        <img src="/logo.png" alt="Peace Ride Logo" className="w-full h-full object-contain filter brightness-0 invert opacity-90" />
      </div>
      <h1 className="text-3xl font-black text-white tracking-tighter mb-2">Peace Ride</h1>
      <p className="text-blue-100 font-medium tracking-widest uppercase text-xs">Agent Reporting Portal</p>
    </div>
  )

  // ── Rejected (with optional appeal) ──────────────────────────────────────
  if (screen === 'pending' && agent?.status === 'REJECTED') {
    const canAppeal = !agent.appealed
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-6 min-h-screen neu-bg">
        <div className="w-24 h-24 neu-circle flex items-center justify-center text-5xl mb-2">❌</div>
        <h2 className="text-2xl font-black text-slate-700">{t('status.rejected_title')}</h2>
        <p className="text-slate-500 font-semibold leading-relaxed max-w-xs">{t('status.rejected_desc')}</p>

        {canAppeal && !showAppeal && (
          <>
            <p className="text-sm font-semibold text-amber-600 max-w-xs">{t('status.rejected_appeal_available')}</p>
            <button
              onClick={() => setShowAppeal(true)}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-black bg-amber-500 text-white shadow-[0_8px_20px_rgba(245,158,11,0.3)] hover:bg-amber-600 transition-colors"
            >
              <AlertCircle className="w-4 h-4" />
              {t('appeal.account_title')}
            </button>
          </>
        )}

        {canAppeal && showAppeal && (
          <AgentAccountAppeal onAppealed={() => setShowAppeal(false)} />
        )}

        {!canAppeal && (
          <p className="text-sm font-semibold text-slate-400 max-w-xs">{t('status.rejected_no_appeal')}</p>
        )}

        {error && (
          <div className="neu-pressed rounded-xl p-4 text-sm font-bold text-red-600 mt-2">{error}</div>
        )}
      </div>
    )
  }

  // ── Pending ──────────────────────────────────────────────────────────────
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

  // ── Success ──────────────────────────────────────────────────────────────
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
