import { useState, useEffect } from 'react'
import { Paperclip, AlertCircle, CheckCircle } from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'
import { api } from '../api'
import { useQueryClient } from '@tanstack/react-query'
import Modal from './Modal'
import type { Driver } from '../types'

interface AppealModalProps {
  driver: Driver | null
  onClose: () => void
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
  if (!res.ok) throw new Error('Failed to upload document to storage')
  return publicUrl
}

export default function AppealModal({ driver, onClose }: AppealModalProps) {
  const { t } = useLanguage()
  const queryClient = useQueryClient()

  const [form, setForm] = useState({
    full_name: driver?.full_name ?? '',
    phone: driver?.phone ?? '',
    car_model: driver?.car_model ?? '',
    license_plate: driver?.license_plate ?? '',
    location: driver?.location ?? '',
    appeal_reason: '',
  })
  
  const [requirements, setRequirements] = useState<{id: string, name: string, required: boolean}[]>([
    { id: 'primary_document', name: 'Primary Document', required: false }
  ])
  const [files, setFiles] = useState<Record<string, Array<File | string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Keep form in sync when driver changes
  useEffect(() => {
    if (!driver) return
    setForm({
      full_name: driver.full_name ?? '',
      phone: driver.phone ?? '',
      car_model: driver.car_model ?? '',
      license_plate: driver.license_plate ?? '',
      location: driver.location ?? '',
      appeal_reason: '',
    })

    // Load requirements from settings
    api.get('/settings').then(res => {
      if (res?.driver_document_requirements?.length) {
        setRequirements(res.driver_document_requirements)
      }
    }).catch(console.error)

    // Pre-fill existing documents
    const initialFiles: Record<string, string[]> = {}
    const docs: any[] = driver.documents || []
    docs.forEach((doc: any) => {
      if (typeof doc === 'string' && doc) {
        if (!initialFiles['primary_document']) initialFiles['primary_document'] = [];
        initialFiles['primary_document'].push(doc);
      } else if (doc && typeof doc === 'object') {
        const url = doc.url || doc.document_url || doc.file_url || ''
        const type_id = doc.type_id || 'primary_document'
        if (url) {
          if (!initialFiles[type_id]) initialFiles[type_id] = [];
          initialFiles[type_id].push(url);
        }
      }
    })
    if (Object.keys(initialFiles).length === 0 && driver.document_url) {
      initialFiles['primary_document'] = [driver.document_url]
    }
    setFiles(initialFiles)
  }, [driver])

  function setField(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!driver) return
    const d = driver // narrowed, stable across await boundaries
    setError('')
    if (driver.status === 'DECLINED' && form.appeal_reason.trim().length > 0 && form.appeal_reason.trim().length < 10) {
      setError(t('appeal.reason_label') + ' — at least 10 characters required')
      tg?.HapticFeedback?.notificationOccurred('error')
      return
    }

    const missingDocs = requirements.filter(r => r.required && (!files[r.id] || files[r.id].length === 0))
    if (missingDocs.length > 0) {
      setError(`Please provide: ${missingDocs.map(m => m.name).join(', ')}`)
      tg?.HapticFeedback?.notificationOccurred('error')
      return
    }

    setSubmitting(true)
    try {
      const documents: any[] = []
      for (const [type_id, fileArray] of Object.entries(files)) {
        if (!fileArray) continue;
        for (const fileOrUrl of fileArray) {
          if (fileOrUrl instanceof File) {
            const url = await uploadDocument(fileOrUrl)
            documents.push({ type_id, url })
          } else if (typeof fileOrUrl === 'string') {
            documents.push({ type_id, url: fileOrUrl })
          }
        }
      }

      await api.patch(`/drivers/${d.id}/appeal`, {
        appeal_reason: form.appeal_reason.trim(),
        full_name: form.full_name.trim() || undefined,
        phone: form.phone.trim() || undefined,
        car_model: form.car_model.trim() || undefined,
        license_plate: form.license_plate.trim() || undefined,
        location: form.location.trim() || undefined,
        documents,
      })

      tg?.HapticFeedback?.notificationOccurred('success')
      queryClient.invalidateQueries({ queryKey: ['my_drivers'] })
      setSuccess(true)
    } catch (err: unknown) {
      setError((err as Error).message || 'Something went wrong')
      tg?.HapticFeedback?.notificationOccurred('error')
    } finally {
      setSubmitting(false)
    }
  }

  // Guard: no driver selected
  if (!driver) return null

  // The 'already appealed' guard has been removed so agents can edit/appeal more than once.

  const inputCls =
    'w-full neu-pressed text-sm text-slate-700 font-bold placeholder-slate-400 outline-none p-4 rounded-3xl transition-colors disabled:opacity-50'

  if (success) {
    return (
      <Modal isOpen onClose={onClose} title="Edit Registration">
        <div className="p-4 text-center space-y-4">
          <div className="w-16 h-16 neu-circle flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <p className="text-sm font-bold text-slate-600">{t('appeal.success')}</p>
          <button onClick={onClose} className="neu-button px-8 py-3 rounded-3xl font-black text-emerald-600 text-sm">
            {t('common.close')}
          </button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen onClose={onClose} title="Edit Registration">
      <div className="space-y-5 px-1 pb-2">
        {/* Subtitle */}
        <p className="text-xs text-slate-500 font-semibold leading-relaxed">Update driver information or upload additional documents.</p>

        {/* Previous admin note */}
        {driver.admin_note && (
          <div className="flex gap-3 neu-pressed rounded-3xl p-3 border-l-4 border-red-400">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-black text-red-500 uppercase tracking-wider mb-1">Admin Note</p>
              <p className="text-xs text-red-700 font-semibold">{driver.admin_note}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Editable fields */}
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Driver Information</p>
            <input
              type="text"
              placeholder={t('register.full_name')}
              value={form.full_name}
              onChange={e => setField('full_name', e.target.value)}
              className={inputCls}
              disabled={submitting}
            />
            <input
              type="tel"
              placeholder={t('register.phone')}
              value={form.phone}
              onChange={e => setField('phone', e.target.value)}
              className={inputCls}
              disabled={submitting}
            />
            <input
              type="text"
              placeholder="Car Model"
              value={form.car_model}
              onChange={e => setField('car_model', e.target.value)}
              className={inputCls}
              disabled={submitting}
            />
            <input
              type="text"
              placeholder={t('register.license_plate')}
              value={form.license_plate}
              onChange={e => setField('license_plate', e.target.value.toUpperCase())}
              className={`${inputCls} uppercase`}
              disabled={submitting}
            />
            <input
              type="text"
              placeholder={t('register.location')}
              value={form.location}
              onChange={e => setField('location', e.target.value)}
              className={inputCls}
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Documents</p>
            {requirements.map(req => {
              const reqFiles = files[req.id] || []
              return (
                <div key={req.id} className={`p-4 neu-pressed rounded-3xl ${submitting ? 'opacity-50' : ''}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-bold text-slate-700">{req.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{req.required ? t('register.required') : t('register.optional')}</p>
                    </div>
                    <label className="neu-circle w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-slate-50">
                      <Paperclip className="w-4 h-4 text-blue-600" />
                      <input type="file" multiple accept="image/*,.pdf" className="hidden" disabled={submitting} onChange={e => {
                        if (!e.target.files) return;
                        const arr = Array.from(e.target.files);
                        setFiles(prev => ({ ...prev, [req.id]: [...(prev[req.id] || []), ...arr] }))
                      }} />
                    </label>
                  </div>
                  
                  {reqFiles.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {reqFiles.map((file, idx) => {
                        const name = file instanceof File ? file.name : (req.name + ' ' + (idx + 1))
                        return (
                          <div key={idx} className="flex items-center justify-between bg-white/50 border border-slate-200 rounded-2xl p-2 text-xs font-semibold text-slate-600 shadow-sm">
                            <span className="truncate max-w-[200px]">{name}</span>
                            <button type="button" disabled={submitting} onClick={() => {
                              setFiles(prev => ({
                                ...prev,
                                [req.id]: prev[req.id].filter((_, i) => i !== idx)
                              }))
                            }} className="p-1 hover:bg-red-50 text-red-500 rounded">
                              <span className="w-3 h-3">✖</span>
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Note / Appeal Reason (Optional)</p>
            <textarea
              rows={4}
              placeholder={t('appeal.reason_placeholder')}
              value={form.appeal_reason}
              onChange={e => setField('appeal_reason', e.target.value)}
              className={`${inputCls} resize-none`}
              disabled={submitting}
            />
          </div>

          {error && (
            <div className="neu-pressed rounded-3xl p-3 text-xs font-bold text-red-600">{error}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full p-4 rounded-3xl font-black bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white shadow-[0_8px_20px_rgba(59,130,246,0.35)] transition-colors"
          >
            {submitting ? 'Saving...' : 'Save Registration'}
          </button>
        </form>
      </div>
    </Modal>
  )
}
