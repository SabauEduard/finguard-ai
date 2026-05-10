/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, CreditCard, Bell, Globe, Search, ChevronRight, Building, Zap, Save, CheckCircle2, Shield, Smartphone, QrCode, Copy, X, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { useUI } from '../lib/UIContext';
import { motion, AnimatePresence } from 'motion/react';
import { verifySync, generateSecret, generateURI } from 'otplib';

import { QRCodeSVG } from 'qrcode.react';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function SettingsView() {
  const { settingsSection, setSettingsSection, settings, setSettings } = useUI();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isConnectingSPV, setIsConnectingSPV] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [is2FASetupOpen, setIs2FASetupOpen] = useState(false);
  const [setupStep, setSetupStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [twoFASecret, setTwoFASecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationError, setVerificationError] = useState(false);

  // Initialize 2FA data
  useEffect(() => {
    if (is2FASetupOpen && !twoFASecret) {
      const secret = generateSecret();
      const userEmail = auth.currentUser?.email || 'utilizator@finguard.ro';
      const otpauth = generateURI({ label: userEmail, issuer: 'FinGuard', secret });
      setTwoFASecret(secret);
      setQrCodeUrl(otpauth);
    }
  }, [is2FASetupOpen, twoFASecret]);

  const handleVerify2FA = () => {
    setIsVerifying(true);
    setVerificationError(false);
    
    // Simulate a slight delay for better UX
    setTimeout(() => {
      try {
        const secret = String(twoFASecret || '');
        const { valid } = verifySync({ token: verificationCode.trim(), secret });
        
        if (valid) {
          setIsVerifying(false);
          const updatedSecurity = { 
            ...localSettings.security, 
            twoFactorEnabled: true,
            twoFASecret: twoFASecret
          };
          
          const updatedSettings = {
            ...localSettings,
            security: updatedSecurity
          };

          setLocalSettings(updatedSettings);
          
          // Auto-save security settings immediately
          if (auth.currentUser) {
            setDoc(doc(db, 'users', auth.currentUser.uid), {
              ...updatedSettings,
              updatedAt: serverTimestamp()
            }, { merge: true });
          }

          setIs2FASetupOpen(false);
        } else {
          setIsVerifying(false);
          setVerificationError(true);
          // Auto-clear error after 2s
          setTimeout(() => setVerificationError(false), 2000);
        }
      } catch (err) {
        setIsVerifying(false);
        setVerificationError(true);
      }
    }, 1000);
  };

  // Local state for editing before save
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (settingsSection) {
      setActiveSection(settingsSection);
    } else {
      setActiveSection(null);
    }
  }, [settingsSection]);

  const handleBack = () => {
    setActiveSection(null);
    setSettingsSection(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          ...localSettings,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
      
      setSettings(localSettings);
      setIsSaving(false);
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setIsSaving(false);
    }
  };

  const handleConnectSPV = () => {
    setIsConnectingSPV(true);
    setTimeout(() => {
      setIsConnectingSPV(false);
      alert('Token SPV conectat cu succes! Sincronizarea e-Factura a început.');
    }, 2500);
  };

  const sections = [
    { id: 'fiscal', name: 'Profil Fiscal', desc: 'CIF, Sediu Social, Regim Impozitare', icon: Building, color: 'text-accent' },
    { id: 'notif', name: 'Notificări & Alerte', desc: 'Termene ANAF, Praguri CASS', icon: Bell, color: 'text-amber-400' },
    { id: 'security', name: 'Securitate & 2FA', desc: 'Autentificare în doi pași, Token SPV', icon: Shield, color: 'text-indigo-400' },
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'fiscal':
        return (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nume Firmă</label>
                <input 
                  type="text" 
                  value={localSettings.fiscal.companyName}
                  onChange={(e) => setLocalSettings({...localSettings, fiscal: {...localSettings.fiscal, companyName: e.target.value}})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-accent outline-none transition-all font-medium" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">CIF</label>
                <input 
                  type="text" 
                  value={localSettings.fiscal.cif}
                  onChange={(e) => setLocalSettings({...localSettings, fiscal: {...localSettings.fiscal, cif: e.target.value}})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-accent outline-none transition-all font-medium" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Reg. Com.</label>
                <input 
                  type="text" 
                  value={localSettings.fiscal.regCom}
                  onChange={(e) => setLocalSettings({...localSettings, fiscal: {...localSettings.fiscal, regCom: e.target.value}})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-accent outline-none transition-all font-medium" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Regim Fiscal</label>
                <select 
                  value={localSettings.fiscal.taxRegime}
                  onChange={(e) => setLocalSettings({...localSettings, fiscal: {...localSettings.fiscal, taxRegime: e.target.value}})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-accent outline-none transition-all font-medium cursor-pointer"
                >
                  <option value="micro" className="bg-bg-deep">Microîntreprindere (1% / 3%)</option>
                  <option value="profit" className="bg-bg-deep">Impozit pe Profit (16%)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Număr Angajați</label>
                <input 
                  type="number" 
                  min="0"
                  value={(localSettings.fiscal as any).employees ?? 1}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setLocalSettings({...localSettings, fiscal: {...localSettings.fiscal, employees: isNaN(val) ? 1 : val} as any})
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-accent outline-none transition-all font-medium" 
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sediu Social</label>
                <input 
                  type="text" 
                  value={localSettings.fiscal.address}
                  onChange={(e) => setLocalSettings({...localSettings, fiscal: {...localSettings.fiscal, address: e.target.value}})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-accent outline-none transition-all font-medium" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">IBAN Principal</label>
                <input 
                  type="text" 
                  value={localSettings.fiscal.iban}
                  onChange={(e) => setLocalSettings({...localSettings, fiscal: {...localSettings.fiscal, iban: e.target.value}})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-accent outline-none transition-all font-medium" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Reprezentant Legal</label>
                <input 
                  type="text" 
                  value={localSettings.fiscal.legalRep}
                  onChange={(e) => setLocalSettings({...localSettings, fiscal: {...localSettings.fiscal, legalRep: e.target.value}})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-accent outline-none transition-all font-medium" 
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl">
              <input 
                type="checkbox" 
                id="vat_payer"
                checked={localSettings.fiscal.isVatPayer}
                onChange={(e) => setLocalSettings({...localSettings, fiscal: {...localSettings.fiscal, isVatPayer: e.target.checked}})}
                className="w-5 h-5 rounded border-white/20 bg-white/5 text-accent focus:ring-accent accent-accent transition-all cursor-pointer" 
              />
              <label htmlFor="vat_payer" className="text-sm font-bold text-white cursor-pointer select-none">Plătitor de TVA (RO)</label>
            </div>
          </div>
        );
      case 'notif':
        return (
          <div className="space-y-6">
            {[
              { id: 'cassAlert', label: 'Alertă Prag CASS', desc: 'Primești notificare când te apropii de pragurile de 6, 12 sau 24 salarii.' },
              { id: 'deadlineReminder', label: 'Memento Termene ANAF', desc: 'Notificări cu 3 zile și 1 zi înainte de termenele limită de depunere.' },
              { id: 'weeklyReport', label: 'Raport Săptămânal AI', desc: 'Analiza automată a sănătății financiare trimisă duminică seara.' },
              { id: 'eFacturaAlert', label: 'Alerte e-Factura Noi', desc: 'Să fii anunțat imediat ce o factură nouă apare în SPV.' },
              { id: 'emailNotifications', label: 'Notificări pe Email', desc: 'Trimite toate alertele și pe adresa de email principală.' },
              { id: 'smsNotifications', label: 'Notificări prin SMS (Premium)', desc: 'Primești mementourile critice direct pe telefon.' },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl group hover:border-white/20 transition-all">
                <div className="max-w-md">
                  <h4 className="text-white font-bold mb-1">{item.label}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                </div>
                <div 
                  onClick={() => setLocalSettings({
                    ...localSettings, 
                    notif: {...localSettings.notif, [item.id]: !localSettings.notif[item.id as keyof typeof localSettings.notif]}
                  })}
                  className={cn(
                    "w-14 h-8 rounded-full relative transition-all cursor-pointer",
                    localSettings.notif[item.id as keyof typeof localSettings.notif] ? "bg-accent" : "bg-white/10"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-lg",
                    localSettings.notif[item.id as keyof typeof localSettings.notif] ? "left-7" : "left-1"
                  )} />
                </div>
              </div>
            ))}
          </div>
        );
      case 'security':
        return (
          <div className="space-y-10">
            <div className="p-8 bg-indigo-500/5 border border-indigo-500/20 rounded-3xl relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-2">Autentificare în Doi Pași (2FA)</h3>
                <p className="text-slate-400 text-sm mb-8 max-w-sm">Adaugă un strat suplimentar de securitate contului tău folosind o aplicație de autentificare (Google Authenticator, Authy).</p>
                
                {localSettings.security.twoFactorEnabled ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm font-bold text-emerald-400">Protecție Activă</span>
                      </div>
                      <button 
                        onClick={async () => {
                          const updatedSecurity = {
                            ...localSettings.security, 
                            twoFactorEnabled: false, 
                            twoFASecret: null
                          };
                          const updated = {
                            ...localSettings, 
                            security: updatedSecurity
                          };
                          
                          setLocalSettings(updated);
                          
                          if (auth.currentUser) {
                            await setDoc(doc(db, 'users', auth.currentUser.uid), {
                              security: updatedSecurity,
                              updatedAt: serverTimestamp()
                            }, { merge: true });
                          }
                        }}
                        className="px-6 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Dezactivează
                      </button>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Dispozitiv de încredere</p>
                        <p className="text-[10px] text-slate-500 font-medium">Configurat la 09 Mai 2026</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <span className="text-sm font-bold text-slate-300">Stare actuală: Dezactivat</span>
                    <button 
                      onClick={() => {
                        setSetupStep(1);
                        setVerificationCode('');
                        setIs2FASetupOpen(true);
                      }}
                      className="px-6 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-lg shadow-indigo-500/20"
                    >
                      Configurează 2FA
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sesiuni Active</h4>
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center">
                    <Globe size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Browser Curent (București)</p>
                    <p className="text-[10px] text-slate-500 font-medium">Ultima activitate: Chiar acum</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-500 rounded-lg text-[9px] font-black uppercase tracking-widest">Activ</span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 relative">
      {activeSection ? (
        <>
          {showSavedToast && (
            <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce">
              <CheckCircle2 size={20} />
              <span className="font-bold text-sm">Modificări salvate cu succes!</span>
            </div>
          )}

          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-all font-bold uppercase text-[10px] tracking-widest mb-8 group cursor-pointer"
          >
            <ChevronRight size={16} className="rotate-180" />
            Înapoi la Setări
          </button>

          <div className="glass-panel p-10 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 p-10 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
              {(function() {
                const section = sections.find(s => s.id === activeSection);
                return section && <section.icon size={100} />;
              })()}
            </div>

            <div className="flex items-center gap-6 mb-12 relative z-10">
              {(function() {
                const section = sections.find(s => s.id === activeSection);
                return (
                  <>
                    <div className={cn("w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-xl", section?.color)}>
                      {section && <section.icon size={32} />}
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-1">{section?.name}</h1>
                      <p className="text-slate-500">{section?.desc}</p>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="space-y-12 relative z-10">
              {renderSectionContent()}

              <div className="p-8 bg-accent/5 rounded-[2.5rem] border border-accent/20 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-accent text-bg-deep rounded-2xl flex items-center justify-center shadow-lg shadow-accent/20 shrink-0">
                    <Zap size={24} fill="currentColor" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white mb-0.5">Sincronizare Automată</p>
                    <p className="text-xs text-slate-400 font-medium">Modificările sunt aplicate instant de toți agenții tăi digitali.</p>
                  </div>
                </div>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full md:w-auto bg-accent text-bg-deep px-10 py-4 rounded-2xl font-bold text-sm hover:bg-white transition-all shadow-xl shadow-accent/20 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <Zap className="animate-spin" size={18} /> : <Save size={18} />}
                  {isSaving ? 'Se salvează...' : 'Salvează Modificările'}
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="mb-12">
            <p className="text-accent font-bold uppercase text-[10px] tracking-widest mb-1">Configurații</p>
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-white">Setări Platformă</h1>
            <p className="text-slate-500">Personalizează FinGuard pentru nevoile specifice ale afacerii tale</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {sections.map((section, i) => (
              <button 
                key={i} 
                onClick={() => setActiveSection(section.id)}
                className="w-full group glass-panel p-6 flex items-center justify-between hover:bg-white/[0.08] border-transparent hover:border-accent/30 transition-all cursor-pointer text-left"
              >
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center transition-all shadow-lg group-hover:shadow-accent/20",
                    "group-hover:bg-accent group-hover:text-bg-deep group-hover:border-accent group-hover:scale-110",
                    section.color
                  )}>
                    <section.icon size={26} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-white group-hover:text-accent transition-colors">{section.name}</h3>
                    <p className="text-sm text-slate-500 font-medium">{section.desc}</p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 group-hover:text-accent group-hover:translate-x-1 transition-all">
                  <ChevronRight size={20} />
                </div>
              </button>
            ))}

            <div className="mt-12 p-10 glass-panel border-white/10 overflow-hidden relative group hover:border-accent/30 transition-all">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/20 text-accent rounded-full text-[9px] font-black uppercase tracking-widest mb-6">
                  RO E-FACTURA
                </div>
                <h3 className="text-3xl font-black mb-3 text-white tracking-tight">Expert Sincronizare ANAF</h3>
                <p className="text-slate-400 mb-10 max-w-sm font-medium leading-relaxed">Conectează token-ul tău SPV pentru a autoriza FinGuard să descarce automat toate facturile din sistemul național.</p>
                <button 
                  onClick={handleConnectSPV}
                  disabled={isConnectingSPV}
                  className="bg-accent text-bg-deep px-10 py-4 rounded-2xl font-bold text-sm hover:bg-white transition-all shadow-xl shadow-accent/20 disabled:opacity-50 disabled:cursor-wait cursor-pointer flex items-center gap-3"
                >
                  <Zap size={18} fill="currentColor" />
                  {isConnectingSPV ? 'Se conectează...' : 'Conectează Token acum'}
                </button>
              </div>
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-accent/5 rounded-full border border-white/5 group-hover:scale-110 transition-transform duration-1000" />
              <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-accent/10 rounded-full border border-white/5 group-hover:rotate-12 transition-transform duration-1000" />
              <div className="absolute bottom-10 right-10 text-accent/[0.03] group-hover:text-accent/[0.08] transition-colors pointer-events-none">
                <Globe size={180} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* 2FA Setup Modal */}
      <AnimatePresence>
        {is2FASetupOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-bg-deep/95 backdrop-blur-2xl">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="glass-panel max-w-md w-full relative border-white/20 overflow-hidden bg-slate-900"
            >
              <button 
                onClick={() => setIs2FASetupOpen(false)}
                className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors z-10 cursor-pointer"
              >
                <X size={24} />
              </button>

              <div className="p-10">
                {setupStep === 1 ? (
                  <div className="space-y-8">
                    <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-3xl flex items-center justify-center">
                      <Smartphone size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Configurează 2FA</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">Pentru a continua, trebuie să scanezi codul QR folosind aplicația ta de autentificare preferată.</p>
                    </div>
                    
                    <div className="p-4 bg-white rounded-3xl flex items-center justify-center shadow-inner">
                      {qrCodeUrl ? (
                        <QRCodeSVG value={qrCodeUrl} size={180} level="H" includeMargin={true} />
                      ) : (
                        <div className="w-[180px] h-[180px] bg-slate-100 animate-pulse rounded-2xl" />
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cheie Secretă</p>
                          <button 
                            onClick={() => {
                              const newSecret = generateSecret();
                              const userEmail = auth.currentUser?.email || 'utilizator@finguard.ro';
                              setTwoFASecret(newSecret);
                              setQrCodeUrl(generateURI({ label: userEmail, issuer: 'FinGuard', secret: newSecret }));
                            }}
                            className="text-indigo-400 hover:text-white transition-colors"
                            title="Generează alt secret"
                          >
                            <RefreshCw size={12} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <code className="text-xs font-mono text-indigo-400 truncate tracking-wider">{twoFASecret}</code>
                          <button 
                            onClick={() => navigator.clipboard.writeText(twoFASecret)}
                            className="text-slate-500 hover:text-white transition-colors"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSetupStep(2)}
                        className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20"
                      >
                        Am scanat codul
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-3xl flex items-center justify-center">
                      <Shield size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Verifică Codul</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">Introdu codul de 6 cifre generat de aplicația de autentificare.</p>
                    </div>

                    <div className="space-y-6">
                      <input 
                        type="text" 
                        maxLength={6}
                        placeholder="000000"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 text-center text-3xl font-black tracking-[0.5em] text-white focus:border-indigo-500 outline-none transition-all placeholder:opacity-20"
                      />
                      
                      <div className="flex gap-4">
                        <button 
                          onClick={() => setSetupStep(1)}
                          className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl font-bold text-sm transition-all"
                        >
                          Înapoi
                        </button>
                        <button 
                          disabled={verificationCode.length !== 6 || isVerifying}
                          onClick={handleVerify2FA}
                          className={cn(
                            "flex-[2] py-4 rounded-2xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2",
                            verificationError 
                              ? "bg-rose-500 text-white shadow-rose-500/20 animate-shake" 
                              : "bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20",
                            (verificationCode.length !== 6 || isVerifying) && !verificationError && "opacity-50 cursor-not-allowed grayscale"
                          )}
                        >
                          {isVerifying ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : verificationError ? (
                            'Cod Invalid!'
                          ) : 'Verifică și Activează'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
