import { useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto'
    return () => { document.body.style.overflow = 'auto' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative neu-bg rounded-t-3xl sm:rounded-3xl shadow-[0_-10px_40px_rgba(37,99,235,0.15)] w-full max-w-sm border-t-2 border-slate-50 overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-700 truncate pr-4">{title}</h3>
          <button onClick={onClose}
            className="text-slate-500 w-10 h-10 rounded-full neu-button flex items-center justify-center shrink-0">
            ✕
          </button>
        </div>
        <div className="p-5 overflow-y-auto max-h-[75vh]">
          {children}
        </div>
      </div>
    </div>
  )
}
