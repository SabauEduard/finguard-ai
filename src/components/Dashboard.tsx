import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  Receipt,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
  Sparkles
} from 'lucide-react';
import { fiscalDeadlines } from '../lib/deadlines';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, limit, getDocs } from 'firebase/firestore';
import InvoiceDetailSidebar from './InvoiceDetailSidebar';

const StatCard = ({ title, value, change, icon: Icon, color, explanation }: any) => (
  <div className="glass-panel p-6 border-white/10 cursor-default group relative">
    <div className="absolute inset-x-4 -top-8 bg-slate-900 border border-white/10 text-white text-xs p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
      {explanation}
    </div>
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-3 rounded-2xl shadow-lg", color)}>
        <Icon size={24} className="text-white" />
      </div>
      {change !== undefined && (
        <div className={cn(
          "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full",
          change > 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
        )}>
          {change > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(change)}%
        </div>
      )}
    </div>
    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{title}</p>
    <h3 className="text-2xl font-bold tracking-tight text-white">{value}</h3>
  </div>
);

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

interface Invoice {
  id: string;
  vendor: string;
  total: number;
  date: string;
  category: string;
  isComplete: boolean;
  currency: string;
  imageUrl?: string;
  fileType?: string;
  tax?: number;
  createdAt: any;
}

import { useUI } from '../lib/UIContext';
import { useReport } from '../lib/ReportContext';

export default function Dashboard() {
  const { setActiveView, setCalendarEventId } = useUI();
  const { setCurrentReport } = useReport();
  const [timeRange, setTimeRange] = useState('30');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    // Fetch Invoices
    const qInvoices = query(
      collection(db, 'invoices'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc'),
      limit(1000)
    );

    const unsubscribeInvoices = onSnapshot(qInvoices, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Invoice[];
      setInvoices(docs);
      setLoading(false);
    }, (error) => {
      if (error.code === 'permission-denied' && !auth.currentUser) return;
      handleFirestoreError(error, OperationType.LIST, 'invoices');
    });

    // Fetch Reports
    const qReports = query(
      collection(db, 'reports'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(3)
    );

    const unsubscribeReports = onSnapshot(qReports, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReports(docs);
    }, (error) => {
      if (error.code === 'permission-denied' && !auth.currentUser) return;
      handleFirestoreError(error, OperationType.LIST, 'reports');
    });

    return () => {
      unsubscribeInvoices();
      unsubscribeReports();
    };
  }, [user]);

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

  const totalExpenses = filteredInvoices
    .filter(inv => (inv as any).type !== 'income')
    .reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
    
  const totalIncome = filteredInvoices
    .filter(inv => (inv as any).type === 'income')
    .reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);

  const netIncome = totalIncome - totalExpenses;
  
  // Calculate stats per month for chart
  const uniqueMonthsSet = new Set(filteredInvoices.map(inv => {
      // Robust ISO parsing
      const parts = inv.date.split('-');
      return `${parts[0]}-${parseInt(parts[1]) - 1}`;
  }));
  
  // Sort the string keys or convert them back to dates to sort
  const uniqueMonths = Array.from(uniqueMonthsSet).sort((a,b) => {
      const [yearA, monthA] = (a as string).split('-').map(Number);
      const [yearB, monthB] = (b as string).split('-').map(Number);
      if (yearA !== yearB) return yearA - yearB;
      return monthA - monthB;
  });
  
  const chartData = uniqueMonths.map(monthKey => {
      const [yearStr, monthStr] = monthKey.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr);
      const monthName = new Date(year, month).toLocaleString('ro-RO', { month: 'short' });
      
      const monthInvoices = filteredInvoices.filter(inv => {
        const parts = inv.date.split('-');
        const y = parseInt(parts[0]);
        const m = parseInt(parts[1]) - 1;
        return m === month && y === year;
      });

      const expenses = monthInvoices
        .filter(inv => (inv as any).type !== 'income')
        .reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
        
      const income = monthInvoices
        .filter(inv => (inv as any).type === 'income')
        .reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
        
      return { name: monthName, income: income, expenses: expenses };
  });

  const formatDateRO = (dateStr: string) => {
    if (!dateStr || !dateStr.includes('-')) return dateStr;
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(val);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-accent font-bold uppercase text-[10px] tracking-widest mb-1">PROFIL FREELANCER</p>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Salut, {user?.displayName?.split(' ')[0] || 'Utilizator'}
          </h1>
        </div>
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10">
          <button 
            onClick={() => setTimeRange('30')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border cursor-pointer",
              timeRange === '30' ? "bg-white/10 text-white border-white/20 shadow-lg" : "text-slate-400 border-transparent hover:text-white"
            )}
          >
            <Calendar size={16} className={timeRange === '30' ? "text-accent" : ""} />
            <span>Ultimele 30 Zile</span>
          </button>
          <button 
            onClick={() => setTimeRange('180')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border cursor-pointer",
              timeRange === '180' ? "bg-white/10 text-white border-white/20 shadow-lg" : "text-slate-400 border-transparent hover:text-white"
            )}
          >
            <Calendar size={16} className={timeRange === '180' ? "text-accent" : ""} />
            <span>6 Luni</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Venit Total Real" 
          value={formatCurrency(totalIncome)} 
          change={totalIncome > 0 ? 12.4 : 0} 
          icon={TrendingUp} 
          color="bg-emerald-500 shadow-emerald-500/20" 
          explanation="Totalul încasărilor identificate prin facturile emise detectate automat."
        />
        <StatCard 
          title="Cheltuieli Totale" 
          value={formatCurrency(totalExpenses)} 
          icon={TrendingDown} 
          color="bg-orange-500 shadow-orange-500/20" 
          explanation="Totalul cheltuielilor identificate prin facturile primite scanate."
        />
        <StatCard 
          title="Net (Cash-Flow)" 
          value={formatCurrency(netIncome)} 
          change={netIncome > 0 ? 2.1 : -2.1} 
          icon={Receipt} 
          color="bg-indigo-500 shadow-indigo-500/20" 
          explanation="Diferența dintre veniturile totale și cheltuielile totale pe perioada selectată."
        />
        <StatCard 
          title="Rata de Profit Reală" 
          value={`${totalIncome > 0 ? ((netIncome / totalIncome) * 100).toFixed(1) : 0}%`}
          change={totalIncome > 0 ? 18.5 : 0} 
          icon={TrendingUp} 
          color="bg-accent shadow-accent/20" 
          explanation="Procentul de profit calculat din veniturile totale reale vs cheltuieli."
        />
      </div>

      {/* Main Charts & Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-panel p-8 min-h-[400px]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-white">Evoluție Flux Numerar</h3>
                <p className="text-sm text-slate-500">Comparație venituri vs. cheltuieli afacere</p>
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart key={timeRange} data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    contentStyle={{ 
                      borderRadius: '16px', 
                      backgroundColor: '#1e293b',
                      border: '1px solid rgba(255,255,255,0.1)', 
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="income" fill="var(--color-accent)" radius={[4, 4, 0, 0]} barSize={24} />
                  <Bar dataKey="expenses" fill="#fb923c" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <Sparkles size={20} className="text-accent" />
                Audituri Fiscale Recente
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reports.length === 0 ? (
                <div className="col-span-3 py-10 bg-white/5 border border-white/10 rounded-2xl text-center">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                    Niciun audit generat. <br /> Accesează secțiunea "Strategie" pentru a începe.
                  </p>
                </div>
              ) : (
                reports.map((rep) => (
                  <button 
                    key={rep.id} 
                    onClick={() => {
                      setCurrentReport(rep);
                      setActiveView('tax');
                    }}
                    className="p-5 bg-white/5 border border-white/10 rounded-2xl group hover:border-accent transition-all relative overflow-hidden text-left cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-accent/20 rounded-xl text-accent">
                        <FileText size={18} />
                      </div>
                      <span className="text-[10px] font-black text-slate-500">
                        {rep.createdAt?.toDate ? rep.createdAt.toDate().toLocaleDateString('ro-RO') : 'Nu e disponibil'}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-white mb-1 truncate">{rep.title}</p>
                    <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">
                      {rep.totalExpenses?.toLocaleString()} RON Auditați
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="glass-panel p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar size={20} className="text-accent" />
              Calendar Fiscal
            </h3>
            <button 
              onClick={() => setActiveView('calendar')}
              className="text-[10px] font-black uppercase tracking-widest text-accent hover:text-white transition-colors cursor-pointer"
            >
              Vezi tot
            </button>
          </div>
          <div className="space-y-4">
            {fiscalDeadlines
              .filter(d => d.actualDate >= new Date(2026, 4, 9)) // Using the simulated today
              .slice(0, 6)
              .map((deadline) => { 
              const typeColor = deadline.type === 'High' 
                ? "bg-rose-500/20 text-rose-500" 
                : deadline.type === 'Medium' 
                  ? "bg-amber-500/20 text-amber-500" 
                  : "bg-emerald-500/20 text-emerald-500";
              
              const badgeColor = deadline.type === 'High' 
                ? "bg-rose-500 text-white" 
                : deadline.type === 'Medium' 
                  ? "bg-amber-500 text-bg-deep" 
                  : "bg-emerald-500 text-white";

              return (
                <div 
                  key={deadline.id} 
                  onClick={() => {
                    setCalendarEventId(String(deadline.id));
                    setActiveView('calendar');
                  }}
                  className="flex gap-4 p-4 rounded-2xl hover:bg-white/[0.05] transition-all group border border-transparent hover:border-white/10 cursor-pointer"
                >
                  <div className={cn(
                    "w-12 h-12 shrink-0 rounded-xl flex items-center justify-center transition-colors",
                    typeColor
                  )}>
                    <Calendar size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{deadline.title}</p>
                    <p className="text-[11px] text-slate-500">{deadline.date}</p>
                  </div>
                  <div className={cn(
                    "px-2 py-1 rounded-lg text-[9px] font-black uppercase self-start mt-1 shadow-sm",
                    badgeColor
                  )}>
                    {deadline.type}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass-panel overflow-hidden">
        <div className="p-8 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">Ultimele Documente Auditate</h3>
            <p className="text-xs text-slate-500">Documente sincronizate în timp real</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Furnizor</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Tip</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Categorie</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Dată</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Sumă</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-10 text-center">
                    <Loader2 className="animate-spin text-accent mx-auto" />
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-10 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                    Niciun document scanat încă
                  </td>
                </tr>
              ) : (
                filteredInvoices.slice(0, 5).map((tx) => (
                  <tr 
                    key={tx.id} 
                    onClick={() => setSelectedInvoice(tx)}
                    className="group hover:bg-white/[0.03] transition-all cursor-pointer"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center font-bold text-[10px] text-accent border border-white/10 group-hover:border-accent/40 transition-all">
                          {tx.vendor[0]}
                        </div>
                        <span className="text-sm font-bold text-white leading-none">{tx.vendor}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest",
                        (tx as any).type === 'income' ? "text-emerald-400" : "text-amber-400"
                      )}>
                        {(tx as any).type === 'income' ? 'Venit' : 'Cost'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-xs text-slate-400 font-bold">{tx.category}</td>
                    <td className="px-8 py-5 text-[11px] text-slate-500 font-medium">{formatDateRO(tx.date)}</td>
                    <td className="px-8 py-5 text-sm font-bold tracking-tight text-white">{tx.total} {tx.currency}</td>
                    <td className="px-8 py-5">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider",
                        tx.isComplete ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/20 text-amber-400 border border-amber-500/20"
                      )}>
                        {tx.isComplete ? 'Auditat' : 'Partial'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <InvoiceDetailSidebar 
        invoice={selectedInvoice} 
        onClose={() => setSelectedInvoice(null)} 
      />
    </div>
  );
}

