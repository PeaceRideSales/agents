import { useState, useEffect } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { api } from '../api'
import { X, UploadCloud } from 'lucide-react'

interface DocumentRequirement {
  id: string
  name: string
  required: boolean
}

interface RegisterTabProps {
  onSuccess: () => void
}

const tg = window.Telegram?.WebApp

export default function RegisterTab({ onSuccess }: RegisterTabProps) {
  const [form, setForm] = useState({
    full_name: '', phone: '', license_plate: '',
    car_model: '',
    vehicle_category: 'OLDER',
    location: 'Addis Ababa'
  })
  const [requirements, setRequirements] = useState<DocumentRequirement[]>([
    { id: 'primary_document', name: 'Primary Document', required: false }
  ])
  const [files, setFiles] = useState<Record<string, File[]>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { t } = useLanguage()

  useEffect(() => {
    api.get('/settings').then(res => {
      if (res.data?.driver_document_requirements) {
        setRequirements(res.data.driver_document_requirements)
      }
    }).catch(console.error)
  }, [])

  function setField(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function validatePhone(phone: string): boolean {
    const phoneRegex = /^(?:\+251|251|0)[79]\d{8}$/;
    return phoneRegex.test(phone.trim());
  }

  async function uploadDocument(f: File): Promise<string> {
    const { signedUrl, publicUrl } = await api.post('/upload/document/presigned', {
      filename: f.name
    })

    const res = await fetch(signedUrl, {
      method: 'PUT',
      body: f,
      headers: {
        'Content-Type': f.type || 'application/octet-stream',
      }
    })

    if (!res.ok) {
      throw new Error('Failed to upload file to storage')
    }
    return publicUrl
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    
    if (!form.full_name || !form.phone || !form.license_plate || !form.car_model || !form.location) {
      setError('Please fill in all required fields')
      tg?.HapticFeedback?.notificationOccurred('error')
      return
    }

    const missingDocs = requirements.filter(r => r.required && (!files[r.id] || files[r.id].length === 0))
    if (missingDocs.length > 0) {
      setError(`Please upload: ${missingDocs.map(m => m.name).join(', ')}`)
      tg?.HapticFeedback?.notificationOccurred('error')
      return
    }

    if (!validatePhone(form.phone)) {
      setError('Please enter a valid Ethiopian phone number (e.g. 0911234567 or +251911234567)')
      tg?.HapticFeedback?.notificationOccurred('error')
      return
    }

    setSubmitting(true)
    try {
      const documents: any[] = []
      
      const uploadPromises = []
      for (const [type_id, fileArray] of Object.entries(files)) {
        for (const file of fileArray) {
           uploadPromises.push(
             uploadDocument(file).then(url => ({ type_id, url }))
           )
        }
      }
      
      const uploadedDocs = await Promise.all(uploadPromises)
      documents.push(...uploadedDocs)

      await api.post('/drivers', {
        ...form,
        documents,
        telegram_init_data: tg?.initData || 'dev'
      })

      tg?.HapticFeedback?.notificationOccurred('success')
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      tg?.HapticFeedback?.notificationOccurred('error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleFileChange = (reqId: string, newFiles: FileList | null) => {
    if (!newFiles) return
    const arr = Array.from(newFiles)
    setFiles(prev => ({
      ...prev,
      [reqId]: [...(prev[reqId] || []), ...arr]
    }))
  }

  const removeFile = (reqId: string, index: number) => {
    setFiles(prev => ({
      ...prev,
      [reqId]: prev[reqId].filter((_, i) => i !== index)
    }))
  }

  const inputCls = "w-full neu-pressed text-sm text-slate-700 font-bold placeholder-slate-400 outline-none p-4 rounded-xl transition-colors disabled:opacity-50"

  return (
    <div className="pb-4 pt-2">
      {error && (
        <div className="neu-pressed rounded-xl p-4 text-sm font-bold text-red-600 mb-6">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="neu-card rounded-3xl p-6">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">{t('register.title')}</div>
          <div className="space-y-4">
            <input type="text" placeholder={`${t('register.full_name')} *`} value={form.full_name} onChange={e => setField('full_name', e.target.value)} className={inputCls} disabled={submitting} />
            <input type="tel" placeholder={`${t('register.phone')} (e.g. 09...) *`} value={form.phone} onChange={e => setField('phone', e.target.value)} className={inputCls} disabled={submitting} />
            <input type="text" placeholder={`${t('register.location')} *`} value={form.location} onChange={e => setField('location', e.target.value)} className={inputCls} disabled={submitting} />
          </div>
        </div>

        <div className="neu-card rounded-3xl p-6">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Vehicle Details</div>
          <div className="space-y-4">
            <input type="text" placeholder={`${t('register.license_plate')} *`} value={form.license_plate}
              onChange={e => setField('license_plate', e.target.value.toUpperCase())}
              className={`${inputCls} uppercase`} disabled={submitting} />
            <input type="text" placeholder="Car Model (e.g. Toyota Axio, Vitz, Corolla) *" value={form.car_model}
              onChange={e => setField('car_model', e.target.value)} className={inputCls} disabled={submitting} />
            <select
              value={form.vehicle_category}
              onChange={e => setField('vehicle_category', e.target.value)}
              className={inputCls}
              disabled={submitting}
            >
              <option value="OLDER">Standard / Older Model (Pre-2020)</option>
              <option value="LATEST_OR_EV">Latest Model (2020+) or EV</option>
            </select>
          </div>
        </div>

        <div className="neu-card rounded-3xl p-6">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Documents</div>
          <div className="space-y-4">
            {requirements.map(req => {
              const reqFiles = files[req.id] || []
              return (
                <div key={req.id} className={`p-4 neu-pressed rounded-xl ${submitting ? 'opacity-50' : ''}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-bold text-slate-700">{req.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{req.required ? t('register.required') : t('register.optional')}</p>
                    </div>
                    <label className="neu-circle w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-slate-50">
                      <UploadCloud className="w-4 h-4 text-blue-600" />
                      <input type="file" multiple accept="image/*,.pdf" className="hidden" disabled={submitting} onChange={e => handleFileChange(req.id, e.target.files)} />
                    </label>
                  </div>
                  
                  {reqFiles.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {reqFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white/50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-600 shadow-sm">
                          <span className="truncate max-w-[200px]">{file.name}</span>
                          <button type="button" disabled={submitting} onClick={() => removeFile(req.id, idx)} className="p-1 hover:bg-red-50 text-red-500 rounded">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <button type="submit" disabled={submitting}
          className="w-full p-5 rounded-2xl font-black bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)] transition-colors mt-4">
          {submitting ? t('register.submitting') : t('register.submit')}
        </button>
      </form>
    </div>
  )
}
