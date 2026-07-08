import { useState } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { api } from '../api'



interface RegisterTabProps {
  token: string
  onSuccess: () => void
}

const tg = window.Telegram?.WebApp

export default function RegisterTab({ token, onSuccess }: RegisterTabProps) {
  const [form, setForm] = useState({
    full_name: '', phone: '', license_plate: '',
    car_model: '', location: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { t } = useLanguage()

  function setField(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function validatePhone(phone: string): boolean {
    const phoneRegex = /^(?:\+251|251|0)[79]\d{8}$/;
    return phoneRegex.test(phone.trim());
  }

  async function uploadDocument(f: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', f)
    
    api.setToken(token)
    const data = await api.post('/upload/document', formData)
    return data.url
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    
    if (!form.full_name || !form.phone || !form.license_plate || !form.car_model || !form.location) {
      setError('Please fill in all required fields')
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
      let document_url: string | undefined
      if (file) {
        document_url = await uploadDocument(file)
      }

      api.setToken(token)
      await api.post('/drivers', {
        ...form,
        document_url,
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
          </div>
        </div>

        <div className="neu-card rounded-3xl p-6">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Document (Optional)</div>
          <label className={`flex items-center gap-4 p-4 neu-pressed rounded-xl cursor-pointer ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <div className="w-12 h-12 neu-circle flex items-center justify-center shrink-0">
              <span className="text-xl">📎</span>
            </div>
            <div className="truncate">
              <p className="text-sm font-bold text-slate-700 truncate">{file ? file.name : 'Upload document'}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Driver's license, ID, etc.</p>
            </div>
            <input type="file" accept="image/*,.pdf" className="hidden" disabled={submitting} onChange={e => setFile(e.target.files?.[0] || null)} />
          </label>
        </div>

        <button type="submit" disabled={submitting}
          className="w-full p-5 rounded-2xl font-black bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)] transition-colors mt-4">
          {submitting ? t('register.submitting') : t('register.submit')}
        </button>
      </form>
    </div>
  )
}
