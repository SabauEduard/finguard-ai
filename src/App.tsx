/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  ShieldAlert, 
  TrendingUp, 
  Settings, 
  Plus, 
  LogOut,
  Bell,
  Search,
  ScanQrCode,
  Calendar,
  Wallet,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import Dashboard from './components/Dashboard';
import ExpenseAuditor from './components/ExpenseAuditor';
import TaxStrategy from './components/TaxStrategy';
import SettingsView from './components/SettingsView';
import LandingPage from './components/LandingPage';
import InvoiceHistory from './components/InvoiceHistory';
import AuthPage from './components/AuthPage';
import { FiscalCalendar } from './components/FiscalCalendar';
import { fiscalDeadlines } from './lib/deadlines';
import LegalModal from './components/LegalModal';
import { ReportProvider } from './lib/ReportContext';
import { UIProvider, useUI } from './lib/UIContext';

import { auth, db } from './lib/firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

import { useReport } from './lib/ReportContext';
import { verifySync } from 'otplib';

type View = 'dashboard' | 'auditor' | 'history' | 'tax' | 'settings' | 'calendar';

import { BrowserRouter } from 'react-router-dom';

export default function App() {
  return (
    <BrowserRouter>
      <UIProvider>
        <ReportProvider>
          <AppContent />
        </ReportProvider>
      </UIProvider>
    </BrowserRouter>
  );
}

function AppContent() {
  const { isGenerating } = useReport();
  const { 
    activeView, 
    setActiveView, 
    searchQuery, 
    setSearchQuery, 
    notifications, 
    setNotifications,
    addNotification,
    settings,
    isSettingsLoaded
  } = useUI();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = React.useRef<HTMLDivElement>(null);
  const dismissedRef = React.useRef<Set<string>>(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | null>(null);

  useEffect(() => {
    (window as any).showLegalModal = (type: 'terms' | 'privacy') => setLegalModal(type);
    return () => { delete (window as any).showLegalModal; };
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'history': return FileText;
      case 'tax': return ShieldAlert;
      case 'calendar': return Calendar;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'history': return 'text-emerald-400';
      case 'tax': return 'text-amber-400';
      case 'calendar': return 'text-indigo-400';
      default: return 'text-indigo-400';
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isNotificationsOpen]);

  useEffect(() => {
    if (user && settings.notif.deadlineReminder) {
      const now = new Date(2026, 4, 9); // current simulated date
      const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      
      const upcomingDeadlines = fiscalDeadlines.filter(deadline => {
        return deadline.actualDate >= now && deadline.actualDate <= twoWeeksFromNow;
      });

      upcomingDeadlines.forEach(deadline => {
        const id = `deadline-${deadline.id}`;
        const alreadyNotified = notifications.some(n => n.id === id);
        if (!alreadyNotified && !dismissedRef.current.has(id)) {
          addNotification({
            id: id,
            title: `Deadline: ${deadline.title}`,
            text: `Termen limită pe ${deadline.date}. Nu uita să depui documentele!`,
            type: 'calendar'
          });
        }
      });
    }
  }, [user, notifications.length, settings.notif.deadlineReminder]);

  // Filter notifications based on settings for display
  const filteredNotifications = notifications.filter(n => {
    if (n.type === 'calendar' && !settings.notif.deadlineReminder) return false;
    if (n.type === 'tax' && !settings.notif.cassAlert) return false;
    return true;
  });

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [is2FAVerified, setIs2FAVerified] = useState(false);
  const [challengeCode, setChallengeCode] = useState('');
  const [challengeError, setChallengeError] = useState(false);
  const [isChallengeVerifying, setIsChallengeVerifying] = useState(false);

  // If user changes or logs out, reset 2FA verification
  useEffect(() => {
    if (!user) {
      setIs2FAVerified(false);
      setChallengeCode('');
    } else {
      const isVerified = sessionStorage.getItem(`2fa_verified_${user.uid}`) === 'true';
      if (isVerified) {
        setIs2FAVerified(true);
      }
    }
  }, [user]);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        console.log("Login popup was closed or cancelled.");
        return;
      }
      console.error("Login failed:", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleVerifyChallenge = () => {
    setIsChallengeVerifying(true);
    setChallengeError(false);

    setTimeout(() => {
        try {
          const secret = String(settings.security.twoFASecret || '');
          if (!secret) { 
            setChallengeError(true);
            return;
          }
          
          const { valid } = verifySync({ token: challengeCode.trim(), secret });

          if (valid) {
            setIs2FAVerified(true);
            sessionStorage.setItem('2fa_verified', 'true');
            if (user) {
              sessionStorage.setItem(`2fa_verified_${user.uid}`, 'true');
            }
          } else {
            setChallengeError(true);
            setTimeout(() => setChallengeError(false), 2000);
          }
        } catch (err) {
          console.error("2FA Challenge Error:", err);
          setChallengeError(true);
        } finally {
          setIsChallengeVerifying(false);
        }
      }, 1000);
  };

  const handleLogout = async () => {
    try {
      if (user) {
        sessionStorage.removeItem(`2fa_verified_${user.uid}`);
      }
      sessionStorage.removeItem('2fa_verified');
      setIs2FAVerified(false);
      await auth.signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navigation = [
    { id: 'dashboard', name: 'Panou de Control', icon: LayoutDashboard },
    { id: 'auditor', name: 'Procesare Facturi', icon: ScanQrCode },
    { id: 'history', name: 'Istoric Facturi', icon: FileText },
    { id: 'tax', name: 'Strategie Fiscală', icon: ShieldAlert },
    { id: 'calendar', name: 'Calendar Fiscal', icon: Calendar },
    { id: 'settings', name: 'Setări', icon: Settings },
  ];

  if (isAuthLoading || (user && !isSettingsLoaded)) {
    return (
      <div className="min-h-screen bg-bg-deep flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/5 via-transparent to-accent/5 pointer-events-none" />
        <div className="flex flex-col items-center gap-6 relative z-10">
          <div className="w-16 h-16 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
          <div className="text-center">
            <p className="text-white font-bold text-lg mb-1">FinGuard AI</p>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Sincronizare Profil Securizat...</p>
          </div>
        </div>
      </div>
    );
  }

  const show2FAChallenge = user && settings.security.twoFactorEnabled && !is2FAVerified;

  if (!user || show2FAChallenge) {
    if (show2FAChallenge) {
      return (
        <div className="min-h-screen bg-bg-deep flex items-center justify-center p-6 bg-grid-slate-900/[0.04] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/5 via-transparent to-accent/5 pointer-events-none" />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="glass-panel max-w-md w-full p-10 relative z-10 border-white/20 bg-slate-900 shadow-2xl"
          >
            <div className="w-20 h-20 bg-indigo-500/20 text-indigo-400 rounded-3xl flex items-center justify-center mb-8 mx-auto">
              <ShieldAlert size={40} />
            </div>
            
            <div className="text-center mb-10">
              <h2 className="text-2xl font-black text-white mb-3">Verificare 2FA</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Contul tău este protejat. Te rugăm să introduci codul de securitate generat de aplicația ta de autentificare.
              </p>
            </div>

            <div className="space-y-8">
              <input 
                type="text" 
                maxLength={6}
                placeholder="000000"
                value={challengeCode}
                onChange={(e) => setChallengeCode(e.target.value.replace(/\D/g, ''))}
                className={cn(
                  "w-full bg-white/5 border border-white/10 rounded-2xl py-5 text-center text-4xl font-black tracking-[0.4em] text-white focus:border-indigo-500 outline-none transition-all placeholder:opacity-20",
                  challengeError && "border-rose-500 animate-shake"
                )}
              />
              
              <button 
                disabled={challengeCode.length !== 6 || isChallengeVerifying}
                onClick={handleVerifyChallenge}
                className={cn(
                  "w-full py-5 rounded-2xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-3",
                  challengeError 
                    ? "bg-rose-500 text-white shadow-rose-500/20" 
                    : "bg-indigo-500 hover:bg-indigo-400 text-white shadow-indigo-500/30",
                  (challengeCode.length !== 6 || isChallengeVerifying) && !challengeError && "opacity-50 cursor-not-allowed grayscale"
                )}
              >
                {isChallengeVerifying ? (
                  <RefreshCw className="animate-spin" size={18} />
                ) : <ShieldAlert size={18} />}
                {isChallengeVerifying ? 'Se verifică...' : challengeError ? 'Cod Invalid' : 'Verifică Codul'}
              </button>

              <button 
                onClick={handleLogout}
                className="w-full text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all py-2"
              >
                Renunță și deconectează-te
              </button>
            </div>
          </motion.div>
        </div>
      );
    }
    if (showAuth) {
      return (
        <>
          <AuthPage 
            onGoogleLogin={handleLogin} 
            onBack={() => setShowAuth(false)} 
            isLoggingIn={isLoggingIn} 
            onLegalClick={(type) => setLegalModal(type)}
          />
          <LegalModal 
            isOpen={!!legalModal} 
            type={legalModal} 
            onClose={() => setLegalModal(null)} 
          />
        </>
      );
    }
    return (
      <>
        <LandingPage onLogin={() => setShowAuth(true)} isLoggingIn={isLoggingIn} />
        <LegalModal 
          isOpen={!!legalModal} 
          type={legalModal} 
          onClose={() => setLegalModal(null)} 
        />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-bg-deep font-sans text-slate-50 overflow-hidden relative">
      <div className="mesh-bg" />
      <LegalModal 
        isOpen={!!legalModal} 
        type={legalModal} 
        onClose={() => setLegalModal(null)} 
      />
      
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-white/5 border-r border-white/10 backdrop-blur-xl flex flex-col z-20"
      >
        <div className="p-6 flex items-center gap-3 cursor-pointer" onClick={() => setActiveView('dashboard')}>
          <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-bg-deep shrink-0 shadow-lg shadow-accent/20">
            <TrendingUp size={24} />
          </div>
          {isSidebarOpen && (
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold tracking-tight text-white"
            >
              FinGuard AI
            </motion.h1>
          )}
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as View)}
              className={cn(
                "flex items-center w-full p-3 rounded-xl transition-all group relative cursor-pointer",
                activeView === item.id 
                  ? "bg-white/10 text-white shadow-xl border border-white/20" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={22} className={cn("shrink-0", activeView === item.id ? "text-accent" : "text-slate-400 group-hover:text-white")} />
              {isSidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="ml-3 font-medium"
                >
                  {item.name}
                </motion.span>
              )}
              {activeView === item.id && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-6 bg-accent rounded-r-full"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto space-y-2">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center w-full p-3 rounded-xl transition-all group text-slate-400 hover:bg-red-500/10 hover:text-red-500 cursor-pointer",
              !isSidebarOpen && "justify-center"
            )}
          >
            <LogOut size={22} />
            {isSidebarOpen && <span className="ml-3 font-medium">Deconectare</span>}
          </button>

          <div className={cn(
            "bg-white/5 rounded-2xl p-4 transition-all border border-white/10",
            !isSidebarOpen && "flex justify-center p-2"
          )}>
            {isSidebarOpen ? (
              <>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Stare Sincronizare</p>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                  <p className="text-xs font-bold text-emerald-400">Conectat ANAF</p>
                </div>
              </>
            ) : (
              <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden backdrop-blur-sm bg-white/[0.02]">
        {/* Header */}
        <header className="h-20 bg-white/5 backdrop-blur-md border-b border-white/10 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-white">
              {navigation.find(n => n.id === activeView)?.name}
            </h2>
            <div className="hidden md:flex items-center bg-white/5 px-3 py-2 rounded-full border border-white/10 focus-within:border-accent/50 transition-all">
              <Search size={18} className="text-slate-500" />
              <input 
                type="text" 
                placeholder="Caută tranzacții..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setActiveView('history');
                  }
                }}
                className="bg-transparent border-none focus:ring-0 text-sm w-64 ml-2 placeholder:text-slate-600 text-white"
              />
            </div>
            {isGenerating && (
              <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full animate-pulse">
                <TrendingUp size={14} className="text-accent" />
                <span className="text-[10px] font-black text-accent uppercase tracking-widest">Generăm Audit AI...</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 relative" ref={notificationsRef}>
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={cn(
                "p-2 text-slate-400 hover:bg-white/10 rounded-full transition-all relative cursor-pointer",
                isNotificationsOpen && "bg-white/10 text-white"
              )}
            >
              <Bell size={20} />
              {filteredNotifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-900 shadow-[0_0_5px_rgba(244,63,94,0.5)]" />
              )}
            </button>

            <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-4 w-96 bg-slate-900/98 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-2xl p-4 z-50 overflow-hidden shadow-black/80"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-accent/5 pointer-events-none" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4 px-2">
                      <h3 className="font-bold text-white">Notificări</h3>
                      {filteredNotifications.length > 0 && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-accent bg-accent/10 px-2 py-0.5 rounded">
                          {filteredNotifications.length} Noi
                        </span>
                      )}
                    </div>
                    <div className="px-2">
                      {filteredNotifications.length === 0 ? (
                        <div className="py-12 text-center">
                          <div className="w-16 h-16 rounded-[2rem] bg-white/5 mx-auto flex items-center justify-center mb-6 border border-white/10 shadow-inner">
                            <Bell size={24} className="text-slate-600 opacity-50" />
                          </div>
                          <h4 className="text-sm font-bold text-white mb-1">Toate la zi!</h4>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">
                            Nu ai notificări noi pentru moment. Te vom anunța când apar noutăți.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                          {filteredNotifications.map((n) => (
                            <div 
                              key={n.id} 
                              onClick={() => {
                                if (n.type === 'calendar') {
                                  setActiveView('calendar');
                                } else {
                                  setActiveView(n.type as any);
                                }
                                dismissedRef.current.add(n.id);
                                setNotifications(notifications.filter(notif => notif.id !== n.id));
                                setIsNotificationsOpen(false);
                              }}
                              className="p-4 bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl transition-all cursor-pointer group"
                            >
                              <div className="flex gap-4">
                                <div className={cn("w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0", getNotificationColor(n.type))}>
                                  {React.createElement(getNotificationIcon(n.type), { size: 18 })}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-0.5">
                                    <h4 className="text-sm font-bold text-white group-hover:text-accent transition-colors">{n.title}</h4>
                                    <span className="text-[10px] text-slate-500 font-medium">{n.time}</span>
                                  </div>
                                  <p className="text-xs text-slate-300 line-clamp-1">{n.text}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {filteredNotifications.length > 0 && (
                      <button 
                        onClick={() => {
                          filteredNotifications.forEach(n => dismissedRef.current.add(n.id));
                          setNotifications(notifications.filter(n => !filteredNotifications.some(fn => fn.id === n.id)));
                        }}
                        className="w-full mt-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all cursor-pointer"
                      >
                        Marchează toate ca citite
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              onClick={() => setActiveView('auditor')}
              className="bg-accent text-bg-deep px-5 py-2.5 rounded-full flex items-center gap-2 hover:bg-white transition-all shadow-xl shadow-accent/20 text-sm font-bold cursor-pointer"
            >
              <Plus size={18} />
              <span>Document Nou</span>
            </button>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeView === 'dashboard' && <Dashboard />}
              {activeView === 'auditor' && <ExpenseAuditor />}
              {activeView === 'history' && <InvoiceHistory />}
              {activeView === 'tax' && <TaxStrategy />}
              {activeView === 'settings' && <SettingsView />}
              {activeView === 'calendar' && <FiscalCalendar />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
}
