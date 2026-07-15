import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import StatusScreens from './components/StatusScreens'
import DashboardTab from './components/DashboardTab'
import RegisterTab from './components/RegisterTab'
import WalletTab from './components/WalletTab'
import LeaderboardTab from './components/LeaderboardTab'
import HelpCenterTab from './components/HelpCenterTab'
import OnboardingModal from './components/OnboardingModal'
import { LayoutDashboard, UserPlus, Wallet, Trophy, LifeBuoy } from 'lucide-react'
import { useLanguage } from './hooks/useLanguage'
import { api } from './api'

type Screen = 'loading' | 'pending' | 'main' | 'success'
type Tab = 'dashboard' | 'register' | 'wallet' | 'leaderboard' | 'help'

interface Agent {
  id: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  document_update_used: boolean
  full_name: string | null
}

const tg = window.Telegram?.WebApp

export default function App() {
  const [screen, setScreen] = useState<Screen>('loading')
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const { t, language, setLanguage } = useLanguage()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [error, setError] = useState('')

  const { data: agentData } = useQuery<Agent>({
    queryKey: ['agent_me'],
    queryFn: async () => await api.get('/agents/me'),
    enabled: !!agent && agent.status === 'PENDING',
    refetchInterval: (query: any) => {
      const status = query.state?.data?.status || agent?.status;
      return status === 'PENDING' ? 5000 : false;
    }
  })

  useEffect(() => {
    if (agentData && agentData.status !== agent?.status) {
      setAgent(agentData)
      if (agentData.status === 'APPROVED') setScreen('main')
      else if (agentData.status === 'PENDING') setScreen('pending')
      else { setError('Your account has been rejected.'); setScreen('pending') }
    }
  }, [agentData, agent?.status])

  // Configure Telegram Theme
  useEffect(() => {
    tg?.ready();
    tg?.expand();
    
    // We disable Telegram background sync because Neumorphism strictly requires a specific #e0e5ec hex
    // if (tg?.themeParams?.bg_color) {
    //   document.body.style.backgroundColor = tg.themeParams.bg_color;
    // }
  }, [])

  const applyReferralCode = useCallback(async (code: string, agentId: string) => {
    try {
      await api.post('/referral/validate', { code, agent_id: agentId })
    } catch (e) {
      console.warn('Failed to apply referral code:', e)
    }
  }, [])

  const init = useCallback(async () => {
    const initData = tg?.initData
    if (!initData) { setScreen('main'); return }
    try {
      const data = await api.post('/auth/telegram', { telegram_init_data: initData })
      
      if (data.token) {
        api.setToken(data.token);
      }
      setAgent(data.agent)
      
      const startParam = tg?.initDataUnsafe?.start_param
      if (startParam && data.agent.status === 'PENDING') {
        await applyReferralCode(startParam, data.agent.id)
        setAgent(prev => prev ? { ...prev, status: 'APPROVED' } : prev)
        setScreen('main')
        return
      }

      if (data.agent.status === 'APPROVED') setScreen('main')
      else if (data.agent.status === 'PENDING') setScreen('pending')
      else { setError('Your account has been rejected.'); setScreen('pending') }
    } catch (e: any) {
      setError('Connection error. Please try again.')
      setScreen('loading')
    }
  }, [applyReferralCode])


  useEffect(() => {
    init()
  }, [init])


  useEffect(() => {
    if (screen === 'main' && !localStorage.getItem('agent_onboarding_v2')) {
      setShowOnboarding(true)
    }
  }, [screen])

  // Non-main screens
  if (screen !== 'main') {
    return (
      <StatusScreens
        screen={screen}
        error={error}
        agent={agent}
        onSuccessContinue={() => { setScreen('main'); setActiveTab('dashboard') }}
      />
    )
  }

  if (showOnboarding) {
    return <OnboardingModal onComplete={() => {
      localStorage.setItem('agent_onboarding_v2', 'true')
      setShowOnboarding(false)
    }} />
  }

  return (
    <div className="flex flex-col min-h-screen neu-bg pb-20">

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-blue-600 sticky top-0 z-50 shadow-md">
        <div className="w-10 h-10 bg-blue-700 rounded-3xl flex items-center justify-center shadow-inner">
          <img src="/logo.png" alt="Peace Ride" className="w-7 h-7 object-contain "
            onError={e => (e.currentTarget.style.display = 'none')} />
        </div>
        <div className="flex-1">
          <h1 className="text-base font-bold text-white leading-tight">{t('app.title')}</h1>
          <p className="text-[11px] text-blue-200">{agent?.full_name || t('app.agent_portal')}</p>
        </div>
        
        {/* Language Toggle */}
        <div className="flex items-center bg-blue-700 rounded-2xl p-1 shrink-0 shadow-inner">
          <button
            onClick={() => {
              setLanguage('en')
              tg?.HapticFeedback?.selectionChanged()
            }}
            className={`px-2 py-1 text-xs font-bold rounded-xl transition-colors ${language === 'en' ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-200 hover:text-white'}`}
          >
            EN
          </button>
          <button
            onClick={() => {
              setLanguage('am')
              tg?.HapticFeedback?.selectionChanged()
            }}
            className={`px-2 py-1 text-xs font-bold rounded-xl transition-colors ${language === 'am' ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-200 hover:text-white'}`}
          >
            አማ
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 max-w-md mx-auto w-full">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'register' && (
          <RegisterTab onSuccess={() => setScreen('success')} />
        )}
        {activeTab === 'wallet' && <WalletTab agent={agent} onUpdateAgent={init} />}
        {activeTab === 'leaderboard' && <LeaderboardTab />}
        {activeTab === 'help' && <HelpCenterTab />}
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 w-full bg-blue-600 pb-safe shadow-[0_-10px_20px_rgba(37,99,235,0.3)] z-50">
        <div className="flex justify-around items-center h-16 px-2">
          <button onClick={() => { setActiveTab('dashboard'); tg?.HapticFeedback?.selectionChanged() }} className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === 'dashboard' ? 'text-white' : 'text-blue-200 hover:text-white'}`}>
            <LayoutDashboard className={`w-5 h-5 ${activeTab === 'dashboard' ? 'fill-blue-400/30' : ''}`} />
            <span className="text-[10px] font-bold tracking-wide">{t('nav.home')}</span>
          </button>
          <button onClick={() => { setActiveTab('register'); tg?.HapticFeedback?.selectionChanged() }} className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === 'register' ? 'text-white' : 'text-blue-200 hover:text-white'}`}>
            <UserPlus className={`w-5 h-5 ${activeTab === 'register' ? 'fill-blue-400/30' : ''}`} />
            <span className="text-[10px] font-bold tracking-wide">{t('nav.register')}</span>
          </button>
          <button onClick={() => { setActiveTab('wallet'); tg?.HapticFeedback?.selectionChanged() }} className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === 'wallet' ? 'text-white' : 'text-blue-200 hover:text-white'}`}>
            <Wallet className={`w-5 h-5 ${activeTab === 'wallet' ? 'fill-blue-400/30' : ''}`} />
            <span className="text-[10px] font-bold tracking-wide">{t('nav.wallet')}</span>
          </button>
          <button onClick={() => { setActiveTab('leaderboard'); tg?.HapticFeedback?.selectionChanged() }} className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === 'leaderboard' ? 'text-white' : 'text-blue-200 hover:text-white'}`}>
            <Trophy className={`w-5 h-5 ${activeTab === 'leaderboard' ? 'fill-blue-400/30' : ''}`} />
            <span className="text-[10px] font-bold tracking-wide">{t('nav.top_agents')}</span>
          </button>
          <button onClick={() => { setActiveTab('help'); tg?.HapticFeedback?.selectionChanged() }} className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === 'help' ? 'text-white' : 'text-blue-200 hover:text-white'}`}>
            <LifeBuoy className={`w-5 h-5 ${activeTab === 'help' ? 'fill-blue-400/30' : ''}`} />
            <span className="text-[10px] font-bold tracking-wide">{t('nav.help')}</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
