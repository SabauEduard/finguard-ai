/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Zap, 
  Brain, 
  FileText, 
  TrendingUp, 
  CheckCircle2, 
  ChevronRight, 
  Menu, 
  X, 
  Clock, 
  Wallet, 
  ArrowRight,
  Target,
  Globe,
  Database,
  Search,
  AlertCircle,
  ScanQrCode,
  ShieldCheck,
  Cpu,
  MessageSquareText,
  LineChart,
  Lock,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface LandingPageProps {
  onLogin: () => void;
  isLoggingIn?: boolean;
}

const Navbar = ({ onLogin, isLoggingIn }: { onLogin: () => void, isLoggingIn?: boolean }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-24 px-8 md:px-12 flex items-center justify-between",
      isScrolled ? "bg-bg-deep/80 backdrop-blur-xl border-b border-white/5" : "bg-transparent"
    )}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-bg-deep shadow-lg shadow-accent/20">
          <TrendingUp size={24} />
        </div>
        <span className="text-2xl font-black tracking-tighter text-white">FinGuard AI</span>
      </div>
      
      <div className="hidden md:flex items-center gap-10 text-sm font-bold uppercase tracking-widest text-slate-400">
        <a href="#features" className="hover:text-accent transition-colors cursor-pointer">Funcționalități</a>
        <a href="#agents" className="hover:text-accent transition-colors cursor-pointer">Agenți AI</a>
        <a href="#pricing" className="hover:text-accent transition-colors cursor-pointer">Prețuri</a>
        <a href="#security" className="hover:text-accent transition-colors cursor-pointer">Securitate</a>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={onLogin}
          disabled={isLoggingIn}
          className="hidden md:block bg-white/5 border border-white/10 hover:bg-white/10 px-6 py-2.5 rounded-full font-bold text-sm transition-all text-white disabled:opacity-50 cursor-pointer"
        >
          {isLoggingIn ? "Se conectează..." : "Conectare"}
        </button>
        <button className="md:hidden text-white cursor-pointer" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 right-0 bg-bg-deep/95 backdrop-blur-2xl border-b border-white/5 p-8 flex flex-col gap-6 shadow-2xl"
          >
            <a href="#features" className="text-lg font-bold text-slate-300 cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>Funcționalități</a>
            <a href="#agents" className="text-lg font-bold text-slate-300 cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>Agenți AI</a>
            <a href="#pricing" className="text-lg font-bold text-slate-300 cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>Prețuri</a>
            <button 
              onClick={() => { setIsMobileMenuOpen(false); onLogin(); }}
              disabled={isLoggingIn}
              className="bg-accent text-bg-deep px-6 py-4 rounded-2xl font-bold w-full mt-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoggingIn ? "Se încarcă..." : "Începe Acum"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = ({ onLogin, isLoggingIn }: { onLogin: () => void, isLoggingIn?: boolean }) => {
  return (
    <section className="relative pt-48 pb-32 px-8 md:px-12 max-w-7xl mx-auto overflow-hidden">
      <div className="md:flex md:items-center md:gap-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="md:w-1/2"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/20 text-accent rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border border-accent/20">
            <Cpu size={14} />
            Specializat Cod Fiscal RO 2026
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 text-white">
            Fără Stres. <br />
            <span className="text-accent">Doar Rezultate.</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-md mb-12 leading-relaxed">
            Automatizează-ți contabilitatea cu agenți AI care scanează facturi, 
            detectează deduceri și se sincronizează direct cu e-Factura ANAF.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-16">
            <button 
              onClick={onLogin}
              disabled={isLoggingIn}
              className="w-full sm:w-auto bg-accent text-bg-deep px-10 py-5 rounded-3xl font-black text-xl transition-all shadow-2xl shadow-accent/40 flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
            >
              {isLoggingIn ? "Se încarcă..." : "Începe Acum Gratuit"}
              <ArrowRight size={24} />
            </button>
            <button 
              onClick={onLogin} 
              disabled={isLoggingIn}
              className="w-full sm:w-auto bg-white/5 text-white px-8 py-5 rounded-3xl font-bold border border-white/10 hover:bg-white/10 transition-all disabled:opacity-50 cursor-pointer"
            >
              Vezi Demo
            </button>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-12">
            <div className="flex flex-col">
              <span className="text-3xl font-black text-emerald-400">98%</span>
              <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Timp Economisit</span>
            </div>
            <div className="w-px h-10 bg-white/10"></div>
            <div className="flex flex-col">
              <span className="text-3xl font-black text-white">100%</span>
              <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Conformitate ANAF</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, x: 40 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="hidden md:flex md:w-1/2 flex-col gap-6"
        >
          <div className="glass-panel p-8 border-white/10 relative overflow-hidden group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <FileText className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Expense Auditor Agent</h3>
                <p className="text-sm text-slate-500">OCR automat & Clasificare Cod Fiscal</p>
              </div>
            </div>
            <div className="text-sm text-white p-4 bg-white/5 rounded-2xl border-l-4 border-accent">
              "Cheltuială transport identificată: 100% deductibilă conform OUG 89/2025. Economie fiscală: 7 RON."
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-accent/10 transition-colors" />
          </div>

          <div className="glass-panel p-8 border-white/10 relative overflow-hidden group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Tax Strategy Advisor</h3>
                <p className="text-sm text-slate-500">Optimizare Dividend vs PFA</p>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex-1 bg-white/5 h-2 rounded-full overflow-hidden">
                <div className="w-[85%] bg-emerald-500 h-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              </div>
              <span className="text-xs text-emerald-400 font-black tracking-widest whitespace-nowrap uppercase">85% Optimizat</span>
            </div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full -ml-16 -mb-16 blur-3xl" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Problem = () => {
  return (
    <section className="py-32 bg-bg-deep relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-8 md:px-12">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <p className="text-accent font-black uppercase text-xs tracking-[0.3em] mb-4">Problema</p>
            <h2 className="text-5xl md:text-6xl font-black text-white leading-tight mb-10 tracking-tighter text-balance">
              Birocrația te costă mai mult <span className="text-slate-500">decât crezi.</span>
            </h2>
            <div className="space-y-8">
              {[
                { title: "Categorizarea cheltuielilor", desc: "Timp pierdut cu deductibile vs nedeductibile conform noului Cod Fiscal RO." },
                { title: "Calcularea impozitelor", desc: "Calcul manual eronat pentru CAS, CASS și impozit pe venit." },
                { title: "Termene-limită ANAF", desc: "Stres constant legat de e-Factura și declarații fiscale lunare." }
              ].map((p, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mt-1 transition-transform">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{p.title}</h3>
                    <p className="text-slate-400 font-medium leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-12 p-8 rounded-3xl bg-accent/20 border border-accent/20 text-white flex items-center gap-8 relative overflow-hidden shadow-2xl shadow-accent/10">
              <div className="text-4xl font-black text-white tracking-tighter">12 ORE</div>
              <div className="text-sm font-bold text-slate-300 max-w-[200px]">Timp recuperat lunar prin automatizarea proceselor administrative și fiscale.</div>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/5 rounded-full blur-3xl animate-pulse" />
            </div>
          </div>
          <div className="relative">
             <div className="absolute inset-0 bg-accent/10 blur-[100px] rounded-full blur-3xl opacity-50" />
             <div className="relative glass-panel p-12 overflow-hidden backdrop-blur-2xl border-white/10 group">
                <div className="flex justify-between items-center mb-10">
                   <div className="space-y-1">
                     <span className="font-black text-xl text-white uppercase tracking-tighter">Unde pierzi timpul?</span>
                     <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Distribuția celor 12 ore de efort administrativ</p>
                   </div>
                   <span className="text-rose-500 font-black text-sm uppercase tracking-widest bg-rose-500/10 px-3 py-1 rounded-lg border border-rose-500/20 shadow-lg shadow-rose-500/10 animate-pulse">12 Ore Pierdute</span>
                </div>
                <div className="grid grid-cols-1 gap-4">
                   {[
                     { label: 'Procesare Facturi', manual: '5 ORE', ai: '5 MIN', color: 'bg-rose-500' },
                     { label: 'Calcul Taxe & Verificare', manual: '3 ORE', ai: 'INSTANT', color: 'bg-amber-500' },
                     { label: 'Sincronizare SPV / e-Factura', manual: '2.5 ORE', ai: 'AUTOMAT', color: 'bg-accent' },
                     { label: 'Export Date Contabile', manual: '1.5 ORE', ai: '1 CLICK', color: 'bg-slate-500' }
                   ].map((item, i) => (
                     <div key={i} className="group/item relative p-6 rounded-2xl border border-white/5 transition-all duration-300" style={{
                        background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.08) 0%, rgba(126, 34, 206, 0.08) 50%, rgba(219, 39, 119, 0.08) 100%)'
                      }}>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                          <div className={cn("w-1.5 h-1.5 rounded-full", item.color)} />
                          {item.label}
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Efort Manual</div>
                            <div className="text-xl font-black text-rose-500/80 line-through tracking-tighter italic decoration-2">{item.manual}</div>
                          </div>
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                            <ArrowRight size={14} className="text-slate-500 group-hover/item:translate-x-1 transition-transform" />
                          </div>
                          <div className="flex-1 text-right">
                            <div className="text-[8px] font-black text-accent uppercase tracking-widest mb-1">Efort cu FinGuard</div>
                            <div className="text-xl font-black text-accent tracking-tighter">{item.ai}</div>
                          </div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Agents = () => {
  return (
    <section id="agents" className="py-32 px-8 md:px-12 bg-white/[0.01] border-y border-white/5 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <p className="text-accent font-black uppercase text-xs tracking-[0.3em] mb-4">Agenți AI</p>
          <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">
            Echipa ta de <span className="text-accent">Specialiști.</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
            Doi agenți AI antrenați special pe legislația fiscală din România, integrați nativ.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div 
            whileHover={{ y: -10 }}
            className="glass-panel p-12 border-white/10 group relative overflow-hidden"
          >
            <div className="w-16 h-16 bg-accent/10 border border-accent/20 rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:bg-accent group-hover:text-bg-deep transition-all shadow-xl shadow-accent/10">
              <ScanQrCode className="w-8 h-8 text-accent group-hover:text-bg-deep transition-colors" />
            </div>
            <h3 className="text-4xl font-black text-white mb-4 tracking-tighter">Expense Auditor</h3>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed font-medium">
              Folosește Vision AI pentru a scana și clasifica facturile instantaneu conform legii.
            </p>
            <ul className="space-y-5 mb-10">
              {[
                "OCR automat pentru facturi și bonuri",
                "Clasificare automată Cod Fiscal 2026",
                "Identificare oportunități deducere",
                "Validare directă prin Registrul CIF"
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-4 text-slate-300 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="p-5 rounded-2xl bg-white/5 border-l-4 border-accent text-xs font-black text-accent uppercase tracking-widest shadow-lg">
              "Cheltuială software: 100% deductibilă. Economie TVA: 45.20 RON"
            </div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/15 transition-all" />
          </motion.div>

          <motion.div 
            whileHover={{ y: -10 }}
            className="glass-panel p-12 border-white/10 group relative overflow-hidden"
          >
            <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-xl shadow-indigo-500/10">
              <Brain className="w-8 h-8 text-indigo-400 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-4xl font-black text-white mb-4 tracking-tighter">Strategy Advisor</h3>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed font-medium">
              Minte strategică pentru optimizarea taxelor și prognoza dividendelor tale.
            </p>
            <ul className="space-y-5 mb-10">
              {[
                "Simulări PFA vs SRL vs Dividende",
                "Prognoză praguri CAS și CASS",
                "Alertare proactivă termene ANAF",
                "Integrare directă e-Factura"
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-4 text-slate-300 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="p-5 rounded-2xl bg-white/5 border-l-4 border-indigo-500 text-xs font-black text-indigo-400 uppercase tracking-widest shadow-lg">
              "În 16 zile este termenul D300. Prognoză plată: 1.250 RON"
            </div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/15 transition-all" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const FeaturesList = () => {
  const features = [
    { title: "Specializare RO", desc: "Singura platformă antrenată pe Codul Fiscal RO 2026 și noile OUG-uri.", icon: Globe, color: "text-accent" },
    { title: "Integrare ANAF", desc: "Sincronizare completă cu e-Factura pentru documente primite și trimise.", icon: Zap, color: "text-amber-400" },
    { title: "Calendar Fiscal", desc: "Urmărește termenele limită pentru declarații și plăți într-un mod vizual.", icon: Clock, color: "text-emerald-400" },
    { title: "Auditor OCR", desc: "Scanează facturile instant și clasifică-le deductibil conform legii.", icon: ScanQrCode, color: "text-indigo-400" },
    { title: "Strategie AI", desc: "Consultanță proactivă pentru optimizarea taxelor și prognoza dividendelor.", icon: Brain, color: "text-rose-500" },
    { title: "Export Contabil", desc: "Rapoarte gata de trimis contabilului tău, formatate conform cerințelor.", icon: FileText, color: "text-slate-300" },
  ];

  return (
    <section id="features" className="py-32 px-8 md:px-12 bg-bg-deep">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-12">
          <div className="max-w-2xl">
            <p className="text-accent font-black uppercase text-xs tracking-[0.3em] mb-4">Ecosistem</p>
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter leading-tight">
              Construit pentru digitalizarea <br /><span className="text-accent">din România.</span>
            </h2>
            <p className="text-xl text-slate-400 font-medium">
              O platformă AI-first care înțelege specificul legislativ și bancar local.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="p-10 rounded-[2.5rem] glass-panel border-white/5 hover:border-accent/30 transition-all hover:bg-white/5 group"
            >
              <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-8 transition-transform shadow-xl">
                <f.icon className={cn("w-7 h-7", f.color)} />
              </div>
              <h3 className="text-2xl font-black text-white mb-4 tracking-tighter">{f.title}</h3>
              <p className="text-slate-400 text-[15px] font-medium leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Security = () => {
  return (
    <section id="security" className="py-32 px-8 md:px-12 bg-white/[0.01] border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <p className="text-accent font-black uppercase text-xs tracking-[0.3em] mb-4">Securitate</p>
          <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">
            Datele tale sunt în siguranță.
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
            Folosim tehnologii de ultimă oră pentru a proteja informațiile tale financiare.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="glass-panel p-10 border-white/5 bg-white/[0.02]">
            <Lock className="w-10 h-10 text-accent mb-6" />
            <h3 className="text-2xl font-black text-white mb-4 tracking-tighter">Criptare End-to-End</h3>
            <p className="text-slate-400 leading-relaxed font-medium">
              Toate datele trimise către serverele noastre sunt criptate folosind AES-256, standardul utilizat de bănci și instituții guvernamentale.
            </p>
          </div>
          <div className="glass-panel p-10 border-white/5 bg-white/[0.02]">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mb-6" />
            <h3 className="text-2xl font-black text-white mb-4 tracking-tighter">Auditare Constantă</h3>
            <p className="text-slate-400 leading-relaxed font-medium">
              Sistemele noastre sunt verificate zilnic pentru vulnerabilități și scurgeri de date, asigurând o protecție continuă împotriva atacurilor cibernetice.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const Pricing = ({ onLogin, isLoggingIn }: { onLogin: () => void, isLoggingIn?: boolean }) => {
  const tiers = [
    { 
      name: "Gratuit", 
      price: "0", 
      target: "Trial (max 10 tranzacții)", 
      features: ["Categorizare de bază a cheltuielilor", "Calcul taxe manual", "Suport comunitate", "Fără sincronizare bancară"],
      color: "bg-white/5"
    },
    { 
      name: "Starter", 
      price: "49", 
      target: "Freelanceri la început", 
      features: ["Audit automat al cheltuielilor", "Sincronizare bancară (1 cont)", "Alerte Termene ANAF", "Suport prioritar pe email"],
      color: "bg-white/5"
    },
    { 
      name: "Pro", 
      price: "99", 
      target: "Freelanceri activi", 
      features: ["2 Agenți AI integrați", "Sincronizare bancară (3 conturi)", "Optimizare inteligentă taxe", "Sincronizare e-Factura directă"],
      popular: true,
      color: "bg-accent/10 border-accent shadow-2xl shadow-accent/10"
    },
    { 
      name: "Business", 
      price: "199", 
      target: "SRL Micro (>10k RON)", 
      features: ["Conturi multiple (3 utilizatori)", "Colaborare contabilă", "Rapoarte complexe de audit", "Suport prioritar 24/7"],
      color: "bg-white/5"
    },
  ];

  return (
    <section id="pricing" className="py-32 px-8 bg-bg-deep relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <p className="text-accent font-black uppercase text-xs tracking-[0.3em] mb-4">Abonamente</p>
          <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">Investește în <span className="text-accent">Liniștea Ta.</span></h2>
          <p className="text-xl text-slate-400 max-w-xl mx-auto font-medium">Alege planul potrivit pentru volumul tău de activitate financiară.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {tiers.map((t, i) => (
            <div 
              key={i} 
              className={cn(
                "p-10 rounded-[2.5rem] flex flex-col h-full glass-panel border-white/10 backdrop-blur-3xl transition-all hover:-translate-y-2 group",
                t.popular ? "scale-110 z-10 border-accent" : "hover:border-white/30"
              )}
            >
              {t.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-bg-deep text-[9px] font-black uppercase tracking-widest px-5 py-2 rounded-full shadow-xl shadow-accent/40 ring-4 ring-bg-deep">
                  RECOMANDAT
                </div>
              )}
              <div className="mb-8">
                <h3 className="text-2xl font-black text-white mb-2 tracking-tighter">{t.name}</h3>
                <p className="text-[10px] text-accent font-black uppercase tracking-[0.2em]">{t.target}</p>
              </div>
              <div className="mb-12">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-white tracking-tighter">{t.price}</span>
                  <span className="text-slate-500 font-black text-sm uppercase">RON/lună</span>
                </div>
              </div>
              <ul className="space-y-5 mb-12 flex-grow">
                {t.features.map((f, j) => (
                  <li key={j} className="flex gap-4 text-sm text-slate-300 font-bold leading-tight">
                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button 
                onClick={onLogin}
                disabled={isLoggingIn}
                className={cn(
                  "w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all disabled:opacity-50 cursor-pointer",
                  t.popular ? "bg-accent text-bg-deep hover:bg-white shadow-xl shadow-accent/20" : "bg-white/5 text-white border border-white/10 hover:bg-white/10"
                )}
              >
                {isLoggingIn ? "Așteaptă..." : `Alege ${t.name}`}
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[100px] -z-10" />
    </section>
  );
};

const CTA = ({ onLogin, isLoggingIn }: { onLogin: () => void, isLoggingIn?: boolean }) => {
  return (
    <section className="py-40 px-8 relative overflow-hidden">
      <div className="max-w-5xl mx-auto text-center relative z-10 glass-panel p-20 rounded-[4rem] border-white/10 backdrop-blur-3xl shadow-2xl">
         <div className="absolute top-0 right-0 w-80 h-80 bg-accent/10 rounded-full blur-[80px] -mr-40 -mt-40" />
         <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-[80px] -ml-40 -mb-40" />
         
         <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-10 border border-white/10">
           Beta Access 2026
         </div>
         <h2 className="text-5xl md:text-8xl font-black text-white mb-10 tracking-tighter leading-none text-balance">
            Ești gata să scapi de <br /><span className="text-accent">stresul fiscal?</span>
         </h2>
         <p className="text-2xl text-slate-400 max-w-2xl mx-auto mb-16 leading-relaxed font-medium">
           Alătură-te celor <span className="text-white font-black">3.000+</span> freelanceri români care și-au automatizat afacerea cu FinGuard AI.
         </p>
         <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
           <button 
             onClick={onLogin}
             disabled={isLoggingIn}
             className="w-full sm:w-auto bg-white text-bg-deep px-12 py-6 rounded-3xl text-2xl font-black active:scale-95 transition-all shadow-2xl shadow-white/20 disabled:opacity-50 cursor-pointer"
           >
             {isLoggingIn ? "Se încarcă..." : "Începe Acum Gratuit"}
           </button>
           <button 
            onClick={onLogin} 
            disabled={isLoggingIn}
            className="w-full sm:w-auto text-white border border-white/10 px-12 py-6 rounded-3xl text-xl font-bold hover:bg-white/5 transition-all backdrop-blur shadow-xl disabled:opacity-50 cursor-pointer"
          >
             Vreau un Demo
           </button>
         </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-bg-deep text-white pt-32 pb-16 px-8 md:px-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-20 mb-24">
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-8 group">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-bg-deep shadow-lg shadow-accent/20 group-hover:rotate-12 transition-transform">
                <TrendingUp size={24} />
              </div>
              <span className="text-3xl font-black tracking-tighter">FinGuard AI</span>
            </div>
            <p className="text-lg text-slate-500 font-medium leading-relaxed mb-10">
              Următoarea generație de management financiar. Agenți AI lucrați special pentru legislația din România.
            </p>
            <div className="flex gap-4">
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-20">
            <div>
              <h4 className="font-black text-xs uppercase tracking-[0.3em] text-accent mb-10">Produs</h4>
              <ul className="space-y-6 text-[15px] font-bold text-slate-500">
                <li><a href="#features" className="hover:text-white transition-colors cursor-pointer">Funcționalități</a></li>
                <li><a href="#agents" className="hover:text-white transition-colors cursor-pointer">Agenți AI</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors cursor-pointer">Prețuri</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-xs uppercase tracking-[0.3em] text-accent mb-10">Companie</h4>
              <ul className="space-y-6 text-[15px] font-bold text-slate-500">
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Despre Noi</a></li>
                <li><a href="#security" className="hover:text-white transition-colors cursor-pointer">Securitate</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-end items-center gap-8">
          <div className="flex flex-col md:items-end gap-2">
            <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest text-slate-600">
              <button 
                onClick={() => (window as any).showLegalModal('terms')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Termeni și Condiții
              </button>
              <button 
                onClick={() => (window as any).showLegalModal('privacy')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Politica de Confidențialitate
              </button>
            </div>
            <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
              &copy; 2026 FINGUARD AI. TOATE DREPTURILE REZERVATE.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function LandingPage({ onLogin, isLoggingIn }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-bg-deep text-slate-50 font-sans overflow-x-hidden selection:bg-accent selection:text-bg-deep">
      <div className="mesh-bg opacity-40" />
      <Navbar onLogin={onLogin} isLoggingIn={isLoggingIn} />
      <Hero onLogin={onLogin} isLoggingIn={isLoggingIn} />
      <Problem />
      <Agents />
      <FeaturesList />
      <Security />
      <Pricing onLogin={onLogin} isLoggingIn={isLoggingIn} />
      <CTA onLogin={onLogin} isLoggingIn={isLoggingIn} />
      <Footer />
    </div>
  );
}
