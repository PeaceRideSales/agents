import { useState, useRef, useEffect } from 'react'
import {
  MessageCircle, Send, HeartHandshake, Image as ImageIcon, X, Loader2
} from 'lucide-react'
import { useLanguage } from '../hooks/useLanguage'
import { api } from '../api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const SUPPORT_TELEGRAM_USERNAME = 'Zeki373'
const tg = window.Telegram?.WebApp

type MessageType = 'general' | 'appeal' | 'payment' | 'technical' | 'other'

interface SupportMessage {
  id: string;
  sender_type: 'AGENT' | 'ADMIN';
  message_type: string;
  message: string;
  attachment_url: string | null;
  is_read: boolean;
  created_at: string;
}

export default function HelpCenterTab() {
  const { t } = useLanguage()
  const queryClient = useQueryClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const [messageType, setMessageType] = useState<MessageType>('general')
  const [messageBody, setMessageBody] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')

  const messageTypeOptions: { value: MessageType; label: string }[] = [
    { value: 'general',    label: t('help.message_type_general') || 'General' },
    { value: 'appeal',     label: t('help.message_type_appeal') || 'Appeal' },
    { value: 'payment',    label: t('help.message_type_payment') || 'Payment' },
    { value: 'technical',  label: t('help.message_type_technical') || 'Technical' },
    { value: 'other',      label: t('help.message_type_other') || 'Other' },
  ]

  const { data: messages = [], isLoading } = useQuery<SupportMessage[]>({
    queryKey: ['support_messages'],
    queryFn: async () => await api.get('/support/messages'),
    refetchInterval: 5000, // Poll every 5s for replies
  })

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMutation = useMutation({
    mutationFn: async () => {
      let document_url = ''
      if (file) {
        // Upload file
        const { signedUrl, publicUrl } = await api.post('/upload/document/presigned', {
          filename: `support_${Date.now()}_${file.name}`,
          contentType: file.type
        })
        const uploadRes = await fetch(signedUrl, { 
          method: 'PUT', 
          headers: { 'Content-Type': file.type || 'application/octet-stream' },
          body: file 
        })
        if (!uploadRes.ok) throw new Error('File upload failed')
        document_url = publicUrl
      }

      await api.post('/support/message', {
        type: messageType,
        body: messageBody.trim(),
        document_url: document_url || undefined
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support_messages'] })
      setMessageBody('')
      setFile(null)
      tg?.HapticFeedback?.notificationOccurred('success')
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to send message')
      tg?.HapticFeedback?.notificationOccurred('error')
    }
  })

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!messageBody.trim() && !file) {
      setError('Please write a message or attach a file.')
      tg?.HapticFeedback?.notificationOccurred('error')
      return
    }
    sendMutation.mutate()
  }

  return (
    <div className="space-y-6 pb-4 pt-2">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="w-16 h-16 neu-circle flex items-center justify-center mx-auto mb-3">
          <HeartHandshake className="w-7 h-7 text-blue-500" />
        </div>
        <h2 className="text-lg font-black text-slate-700">{t('help.title') || 'Support Chat'}</h2>
        <p className="text-sm text-slate-500 font-semibold">{t('help.subtitle') || 'We are here to help'}</p>
      </div>

      {/* Chat History */}
      <div className="neu-card rounded-3xl p-4 flex flex-col h-[60vh] max-h-[500px]">
        <div className="flex-1 overflow-y-auto space-y-4 p-2 custom-scrollbar">
          {isLoading ? (
            <div className="flex justify-center items-center h-full text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
              <MessageCircle className="w-8 h-8 opacity-50" />
              <p className="text-sm font-bold opacity-80">No messages yet. Start a conversation below!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isAdmin = msg.sender_type === 'ADMIN'
              return (
                <div key={msg.id} className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3 ${
                    isAdmin 
                      ? 'bg-slate-100 text-slate-800 rounded-tl-sm' 
                      : 'bg-blue-600 text-white rounded-tr-sm shadow-[0_4px_15px_rgba(37,99,235,0.2)]'
                  }`}>
                    {msg.attachment_url && (
                      <a href={msg.attachment_url} target="_blank" rel="noreferrer">
                        <img src={msg.attachment_url} alt="attachment" className="rounded-lg mb-2 max-w-full object-cover max-h-40" />
                      </a>
                    )}
                    <p className="text-sm font-medium whitespace-pre-wrap leading-snug">{msg.message}</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 mt-1 px-1">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="mt-4 pt-4 border-t border-slate-100/50 space-y-3">
          {error && <div className="text-xs font-bold text-red-500 px-2">{error}</div>}
          
          <div className="flex items-center gap-2">
             <select
              value={messageType}
              onChange={e => setMessageType(e.target.value as MessageType)}
              className="text-xs font-bold text-slate-600 bg-slate-100 rounded-lg p-2 outline-none"
              disabled={sendMutation.isPending}
            >
              {messageTypeOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {file && (
            <div className="flex items-center justify-between bg-blue-50 text-blue-700 text-xs font-bold p-2 rounded-lg">
              <span className="truncate">{file.name}</span>
              <button type="button" onClick={() => setFile(null)} className="p-1 hover:bg-blue-100 rounded">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className="flex items-end gap-2">
            <div className="flex-1 bg-slate-100 rounded-2xl flex items-end p-1">
              <label className="p-2 text-slate-400 hover:text-blue-500 transition-colors cursor-pointer shrink-0">
                <ImageIcon className="w-5 h-5" />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={e => e.target.files && setFile(e.target.files[0])}
                  disabled={sendMutation.isPending}
                />
              </label>
              <textarea
                rows={1}
                placeholder="Type a message..."
                value={messageBody}
                onChange={e => setMessageBody(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend(e)
                  }
                }}
                className="flex-1 bg-transparent text-sm font-medium text-slate-700 placeholder-slate-400 outline-none p-2 resize-none max-h-24 custom-scrollbar"
                disabled={sendMutation.isPending}
              />
            </div>
            <button
              type="submit"
              disabled={sendMutation.isPending || (!messageBody.trim() && !file)}
              className="w-10 h-10 shrink-0 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-[0_4px_10px_rgba(37,99,235,0.3)]"
            >
              {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-1" />}
            </button>
          </div>
        </form>
      </div>

      {/* Telegram Fallback Card */}
      <div className="neu-card rounded-3xl p-5 space-y-3">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 neu-circle flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-700">Need immediate help?</p>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-0.5">
              If it's a system issue, please upload a screenshot and message <span className="font-bold text-blue-600">@Zeki373</span> directly on Telegram.
            </p>
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
          {t('help.support_btn') || 'Message @Zeki373'}
        </a>
      </div>
    </div>
  )
}
