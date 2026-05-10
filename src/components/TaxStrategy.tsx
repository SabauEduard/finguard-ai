/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ChevronRight, 
  ArrowRight, 
  PieChart, 
  Target, 
  Zap,
  Info,
  Download,
  Share2,
  CheckCircle2,
  Clock,
  TrendingDown,
  TrendingUp,
  Brain,
  FileText,
  History,
  AlertCircle,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useUI } from '../lib/UIContext';
import { useReport } from '../lib/ReportContext';

export default function TaxStrategy() {
  const { activeView, setActiveView, setSettingsSection, addNotification, settings } = useUI();
  const { isGenerating, currentReport, generateReport, setCurrentReport } = useReport();
  const [report, setReport] = useState<any | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState('90');
  const [historicReports, setHistoricReports] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, [auth.currentUser]);

  // Sync with global context report
  useEffect(() => {
    if (currentReport) {
      const sanitized = {
        ...currentReport,
        summary: currentReport.summary || "Nu există conținut pentru acest raport.",
        riskScore: currentReport.riskScore ?? 3,
        riskDescription: currentReport.riskDescription || (currentReport.riskScore !== undefined ? "Analiză bazată pe datele curente." : "Raport pre-existent (legacy) - Generați un raport nou pentru scor dinamic."),
        totalExpenses: currentReport.totalExpenses ?? 0,
        title: currentReport.title || "Raport Audit"
      };
      setReport(sanitized);
      // Update history if not already there
      setHistoricReports(prev => {
        if (prev.find(r => r.id === currentReport.id)) return prev;
        return [sanitized, ...prev];
      });
    }
  }, [currentReport]);

  const fetchUserData = async () => {
    if (!auth.currentUser) return;
    setIsLoadingData(true);
    try {
      // Fetch Invoices
      const invQuery = query(
        collection(db, 'invoices'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const invSnap = await getDocs(invQuery);
      const invData = invSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInvoices(invData);

      // Fetch Historic Reports
      const repQuery = query(
        collection(db, 'reports'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const repSnap = await getDocs(repQuery);
      const repData = repSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      setHistoricReports(repData);

      // Auto-select latest report if no report is currently active
      if (!report && repData.length > 0) {
        const latest = repData[0];
        setReport({
          ...latest,
          summary: latest.summary || "Nu există conținut pentru acest raport.",
          riskScore: latest.riskScore ?? 3,
          riskDescription: latest.riskDescription || "Analiză bazată pe datele curente.",
          totalIncome: latest.totalIncome ?? 0,
          totalExpenses: latest.totalExpenses ?? 0,
          title: latest.title || "Raport Audit"
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'reports');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleGenerate = async () => {
    const filtered = filteredInvoices;
    if (filtered.length === 0) return;
    try {
      const periodLabel = timeRange === '30' ? 'Ultimele 30 zile' : 
                         timeRange === '90' ? 'Ultimele 90 zile' : 
                         timeRange === '180' ? 'Ultimele 180 zile' : 'Ultimul an';
                         
      const newReport = await generateReport(invoices, timeRange, periodLabel);
      addNotification({
        title: 'Raport Fiscal Generat',
        text: `Analiza pentru ${periodLabel} a fost finalizată cu un scor de risc de ${newReport.riskScore}/10.`,
        type: 'tax'
      });
    } catch (err) {
      // Error handled in context
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    if (!inv.date) return false;
    
    // Robust parsing for YYYY-MM-DD to avoid timezone shifts
    const parts = inv.date.split('-');
    if (parts.length !== 3) return false;
    const y = parseInt(parts[0]);
    const m = parseInt(parts[1]) - 1; // 0-indexed month
    const d = parseInt(parts[2]);
    
    const invDate = new Date(y, m, d);
    const now = new Date(); 
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = nowMidnight.getTime() - invDate.getTime();
    
    // Ignore future dates (allowing today)
    if (diffTime < 0) return false; 
    
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= parseInt(timeRange);
  });

  const currentTotalIncome = filteredInvoices
    .filter(i => i.type === 'income')
    .reduce((sum, i) => sum + (Number(i.total) || 0), 0);
    
  const currentTotalExpenses = filteredInvoices
    .filter(i => i.type !== 'income') // Default to expense for legacy/other
    .reduce((sum, i) => sum + (Number(i.total) || 0), 0);

  const isReportOutdated = report && (
    currentTotalExpenses > (report.totalExpenses || 0) + 100 || 
    (report.totalIncome !== undefined && currentTotalIncome > (report.totalIncome || 0) + 100)
  ); 

  const selectReport = (rep: any) => {
    const sanitizedReport = {
      ...rep,
      summary: rep.summary || "Nu există conținut pentru acest raport.",
      riskScore: rep.riskScore ?? 3,
      riskDescription: rep.riskDescription || (rep.riskScore !== undefined ? "Analiză bazată pe datele curente." : "Raport pre-existent (legacy) - Generați un raport nou pentru scor dinamic."),
      totalIncome: rep.totalIncome ?? 0,
      totalExpenses: rep.totalExpenses ?? 0,
      title: rep.title || "Raport Audit"
    };
    setReport(sanitizedReport);
    setCurrentReport(sanitizedReport);
    setShowHistory(false);
  };

  const getRiskColor = (score: number) => {
    if (score <= 3) return 'bg-emerald-600';
    if (score <= 7) return 'bg-amber-500';
    return 'bg-rose-600';
  };

  const getRiskBorder = (score: number) => {
    if (score <= 3) return 'border-emerald-500/20';
    if (score <= 7) return 'border-amber-500/20';
    return 'border-rose-500/20';
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(val);
  };

  const getRiskScoreDisplay = () => {
    if (report) return `${report.riskScore ?? '?'}/10`;
    if (historicReports.length > 0) return `${historicReports[0].riskScore ?? '?'}/10`;
    if (filteredInvoices.length > 0) return 'Incert';
    return 'N/A';
  };

  const handleDownload = () => {
    if (!report) return;
    const element = document.createElement("a");
    const file = new Blob([report.summary], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${report.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleShare = async () => {
    if (!report) return;
    const shareData = {
      title: report.title,
      text: report.riskDescription,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copiat în clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent text-bg-deep rounded-full text-[10px] font-black uppercase tracking-widest mb-4 shadow-lg shadow-accent/20">
            <Sparkles size={14} />
            Consilier de Strategie AI
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-white">Optimizare Fiscală Personalizată</h1>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <p className="text-lg text-slate-300 leading-relaxed">
              Analizează fluxul tău de numerar real ({filteredInvoices.length} documente)
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">Perioada:</span>
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-white/5 border border-white/10 text-white text-xs font-bold px-3 py-1 rounded-xl outline-none focus:border-accent transition-all cursor-pointer"
              >
                <option value="30" className="bg-bg-deep">30 Zile</option>
                <option value="90" className="bg-bg-deep">90 Zile</option>
                <option value="180" className="bg-bg-deep">180 Zile</option>
                <option value="365" className="bg-bg-deep">1 An</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="shrink-0 bg-white/5 border border-white/10 text-white px-4 py-3 rounded-[1.25rem] font-bold text-[11px] hover:bg-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <History size={16} />
            <span>Arhivă Rapoarte</span>
          </button>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating || invoices.length === 0}
            className={cn(
              "shrink-0 bg-accent text-bg-deep px-5 py-3 rounded-[1.25rem] font-bold text-[12px] hover:bg-white transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer",
              isReportOutdated && !isGenerating && "animate-bounce shadow-accent/30 ring-2 ring-accent/20"
            )}
          >
            {isGenerating ? (
              <>
                <Brain size={24} className="animate-pulse" />
                <span>Analizez Datele...</span>
              </>
            ) : (
              <>
                <Sparkles size={24} />
                <span>Analiză {timeRange === '30' ? 'Lună' : timeRange === '90' ? 'Q' : timeRange === '180' ? 'S' : 'Anuală'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {filteredInvoices.length === 0 && !isLoadingData && (
        <div className="mb-12 p-8 bg-rose-500/10 border border-rose-500/20 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center text-rose-500">
            <AlertCircle size={32} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-lg font-bold text-white mb-1">Nu am găsit date suficiente</h3>
            <p className="text-sm text-slate-400">Nu există facturi sau chitanțe în ultimele {timeRange} zile. Schimbă perioada sau încarcă documente noi.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Profile Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6">
            <h3 className="font-bold text-[10px] text-slate-500 uppercase tracking-widest mb-6">Profil Fiscal</h3>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl flex items-center justify-between border border-white/10 group transition-all">
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase">Regim</p>
                  <p className="text-sm font-bold text-white">SRL Micro</p>
                </div>
                <Info size={16} className="text-accent transition-all" />
              </div>
              <div className="p-4 bg-white/5 rounded-2xl flex items-center justify-between border border-white/10 group transition-all">
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase">Status TVA</p>
                  <p className="text-sm font-bold text-white">Plătitor (RO)</p>
                </div>
                <CheckCircle2 size={16} className="text-emerald-500 transition-all" />
              </div>
              <div className="p-4 bg-white/5 rounded-2xl flex items-center justify-between border border-white/10 group transition-all">
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase">Nr. Angajați</p>
                  <p className="text-sm font-bold text-white">{invoices.length > 0 ? ((settings?.fiscal as any)?.employees ? (settings.fiscal as any).employees + ' Angajați' : '1 Angajat') : '0 Angajați'}</p>
                </div>
                <Users size={16} className="text-accent transition-all" />
              </div>
              <div className="p-4 bg-white/5 rounded-2xl flex items-center justify-between border border-white/10 group transition-all">
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase">Activitate</p>
                  <p className="text-sm font-bold text-white">{filteredInvoices.length} Înregistrări</p>
                </div>
                <Zap size={16} className="text-amber-500 transition-all" />
              </div>
              <div className="p-4 bg-white/5 rounded-2xl flex items-center justify-between border border-white/10 group transition-all">
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase">Venituri ({timeRange}d)</p>
                  <p className="text-sm font-bold text-emerald-400">{formatCurrency(currentTotalIncome)}</p>
                </div>
                <TrendingUp size={16} className="text-emerald-500" />
              </div>
              <div className="p-4 bg-white/5 rounded-2xl flex items-center justify-between border border-white/10 group transition-all">
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase">Cheltuieli ({timeRange}d)</p>
                  <p className="text-sm font-bold text-amber-400">{formatCurrency(currentTotalExpenses)}</p>
                </div>
                <TrendingDown size={16} className="text-amber-500" />
              </div>
            </div>
            <button 
              onClick={() => {
                setSettingsSection('fiscal');
                setActiveView('settings');
              }}
              className="w-full mt-8 flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-accent transition-all active:scale-95 cursor-pointer"
            >
              Modifică Profilul
              <ChevronRight size={16} />
            </button>
          </div>

          {!showHistory && (
            <div className={cn(
              "p-8 rounded-[2rem] text-white shadow-2xl shadow-emerald-900/20 relative overflow-hidden transition-all duration-500",
              isReportOutdated ? "ring-4 ring-amber-500 ring-offset-4 ring-offset-bg-deep" : "",
              report ? getRiskColor(report.riskScore) : (historicReports.length > 0 ? getRiskColor(historicReports[0].riskScore) : (invoices.length > 0 ? 'bg-amber-500' : 'bg-slate-700'))
            )}>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold">Scor Risc Audit</h4>
                  {(isReportOutdated || isGenerating) && (
                    <div className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter animate-pulse flex items-center gap-1">
                      <Zap size={8} />
                      {isGenerating ? 'Generare...' : 'Date Noi'}
                    </div>
                  )}
                </div>
                <div className="text-5xl font-black mb-4">
                  {getRiskScoreDisplay()}
                </div>
                <p className="text-xs text-white opacity-90 leading-relaxed mb-6 font-medium">
                  {report 
                    ? report.riskDescription
                    : (historicReports.length > 0
                        ? historicReports[0].riskDescription
                        : (filteredInvoices.length > 0 
                            ? `Analizăm cele ${filteredInvoices.length} documente pentru a asigura conformitatea.`
                            : "Încarcă documente pentru a calcula riscul de audit."))}
                </p>
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.8)]" 
                    style={{ width: report ? `${report.riskScore * 10}%` : (historicReports.length > 0 ? `${(historicReports[0].riskScore || 0) * 10}%` : '0%') }}
                  />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all" />
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <div className="glass-panel min-h-[600px] flex flex-col relative overflow-hidden backdrop-blur-3xl">
            <AnimatePresence mode="wait">
              {isLoadingData ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center p-12"
                >
                  <div className="w-16 h-16 border-4 border-accent/20 border-t-accent rounded-full animate-spin mb-6" />
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">
                    Încărcăm datele tale fiscale...
                  </p>
                </motion.div>
              ) : showHistory ? (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1 p-8"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold text-white">Arhivă Audituri Fiscale</h3>
                    <button 
                      onClick={() => setShowHistory(false)}
                      className="text-slate-500 hover:text-white transition-all italic text-xs font-bold uppercase tracking-widest cursor-pointer"
                    >
                      Înapoi la Raport
                    </button>
                  </div>
                  
                  {historicReports.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 text-center">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-slate-700 mb-6 border border-white/5">
                        <Clock size={32} />
                      </div>
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Niciun raport salvat încă</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {historicReports.map((rep) => (
                        <button
                          key={rep.id}
                          onClick={() => selectReport(rep)}
                          className="p-6 bg-white/5 border border-white/10 rounded-[2rem] text-left hover:border-accent group transition-all cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent transition-transform">
                              <FileText size={20} />
                            </div>
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                              {rep.createdAt?.toDate ? rep.createdAt.toDate().toLocaleDateString('ro-RO') : 'Data necunoscută'}
                            </span>
                          </div>
                          <h4 className="font-bold text-white mb-2">{rep.title}</h4>
                          <div className="flex items-center gap-2">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex gap-2">
                              <span>Total: <span className="text-emerald-400 font-black">{rep.totalExpenses?.toLocaleString()} RON</span></span>
                              <span>•</span>
                              <span>Scor Risc: <span className={rep.riskScore <= 3 ? "text-emerald-400 font-black" : rep.riskScore <= 7 ? "text-amber-500 font-black" : "text-rose-500 font-black"}>{rep.riskScore ?? 'N/A'}/10</span></span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : isGenerating ? (
                <motion.div 
                  key="analyzing"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center text-center p-12"
                >
                  <div className="relative mb-8">
                    <div className="w-24 h-24 bg-accent rounded-[2rem] flex items-center justify-center animate-pulse shadow-2xl shadow-accent/40">
                      <Sparkles size={48} className="text-bg-deep" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-indigo-500 border-4 border-bg-deep rounded-full flex items-center justify-center text-white animate-bounce">
                      <Zap size={18} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">Analiză Flux Real...</h3>
                  <div className="space-y-3 w-full max-w-xs mx-auto">
                    {[
                      "Analizând cele " + filteredInvoices.length + " documente...",
                      "Calculând totaluri și categorii...",
                      "Proiecție praguri fiscale 2026...",
                      "Generând recomandări de audit..."
                    ].map((text, i) => (
                      <div key={i} className="flex items-center gap-3 text-left group">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent group-hover:scale-150 transition-transform shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
                        <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-all">{text}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : report ? (
                <motion.div 
                  key="report"
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 flex flex-col"
                >
                  {/* Report Header */}
                  <div className="p-8 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center text-accent">
                        <FileText size={28} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg tracking-tight text-white uppercase italic">{report.title}</h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          Audit pe {filteredInvoices.length} Înregistrări • {report.period || 'Periodă Nespecificată'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleDownload}
                        className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all shadow-lg active:scale-95 cursor-pointer"
                        title="Descarcă raportul"
                      >
                        <Download size={20} />
                      </button>
                      <button 
                        onClick={handleShare}
                        className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all shadow-lg active:scale-95 cursor-pointer"
                        title="Distribuie raportul"
                      >
                        <Share2 size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Report Markdown */}
                  <div className="p-8 md:p-12 overflow-y-auto max-h-[750px] custom-scrollbar backdrop-blur-sm custom-report-content">
                    <ReactMarkdown>{report.summary}</ReactMarkdown>
                  </div>

                  {/* Stats Footer Overlay */}
                  <div className="p-10 bg-accent/10 mt-auto border-t border-accent/20 flex flex-wrap items-center justify-between gap-6 relative overflow-hidden">
                    <div className="flex items-center gap-12 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/10">
                          <TrendingUp size={24} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-[9px] font-black text-emerald-500/80 uppercase tracking-widest">Total Venituri</p>
                          <p className="text-lg font-black text-white">{report.totalIncome?.toLocaleString()} RON</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-accent/20 text-accent rounded-full flex items-center justify-center shadow-lg shadow-accent/10">
                          <TrendingDown size={24} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-[9px] font-black text-accent/80 uppercase tracking-widest">Total Cheltuieli</p>
                          <p className="text-lg font-black text-white">{report.totalExpenses?.toLocaleString()} RON</p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                  </div>
                </motion.div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                  <div className="w-32 h-32 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center justify-center text-slate-600 mb-8 shadow-inner">
                    <PieChart size={64} strokeWidth={1} className="opacity-50" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-white">Analiză Fluxuri Reale</h3>
                  <p className="text-sm text-slate-500 max-w-xs mb-12 font-medium">
                    {filteredInvoices.length > 0 
                      ? `Am detectat ${filteredInvoices.length} facturi în ultimele ${timeRange} zile. Ești gata să generezi auditul fiscal.`
                      : `Nu am găsit documente în ultimele ${timeRange} zile.`}
                  </p>
                  <div className="grid grid-cols-2 gap-6 w-full max-w-xl">
                    <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] text-left group hover:border-accent/40 transition-all">
                      <div className="text-indigo-400 mb-4 transition-transform inline-block"><Wallet size={28} className="" /></div>
                      <h4 className="font-bold text-white mb-1">Volum Tranzacții</h4>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{filteredInvoices.length} Documente Active</p>
                    </div>
                    <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] text-left group hover:border-accent/40 transition-all">
                      <div className="text-accent mb-4 transition-transform inline-block"><TrendingUp size={28} /></div>
                      <h4 className="font-bold text-white mb-1">Deduceri</h4>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Calcul în funcție de categorii</p>
                    </div>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-report-content h1 { font-size: 1.75rem; margin-bottom: 1.5rem; color: #fff; line-height: 1.2; font-weight: 800; letter-spacing: -0.02em; }
        .custom-report-content h2 { font-size: 1.25rem; margin-top: 2.5rem; margin-bottom: 1.25rem; color: #fff; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
        .custom-report-content h3 { font-size: 1.1rem; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #00f2fe; font-weight: 700; }
        .custom-report-content p { margin-bottom: 1.25rem; line-height: 1.6; color: #94a3b8; font-size: 1rem; }
        .custom-report-content ul { list-style-type: none; padding-left: 0; margin-bottom: 2rem; }
        .custom-report-content li { margin-bottom: 0.75rem; padding-left: 1.5rem; position: relative; color: #cbd5e1; font-size: 1rem; line-height: 1.6; }
        .custom-report-content li::before { content: ""; position: absolute; left: 0; top: 0.75rem; width: 0.6rem; height: 1px; background: #00f2fe; }
        .custom-report-content strong { color: #fff; font-weight: 800; }
        .custom-report-content blockquote { border-left: 4px solid #00f2fe; background: rgba(0, 242, 254, 0.05); padding: 1.5rem; border-radius: 0 1.25rem 1.25rem 0; font-style: italic; margin: 2.5rem 0; color: #cbd5e1; }
        .custom-report-content code { background: rgba(0, 242, 254, 0.1); color: #00f2fe; padding: 0.2rem 0.4rem; border-radius: 0.4rem; font-family: monospace; font-size: 0.9em; }

        .glass-panel {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 2.5rem;
        }

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
      `}} />
    </div>
  );
}

const Wallet = ({ size, className = "" }: { size: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
);
