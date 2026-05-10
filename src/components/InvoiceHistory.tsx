/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { FileText, Download, Filter, Trash2, Calendar, Wallet, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import InvoiceDetailSidebar from './InvoiceDetailSidebar';

import { useUI } from '../lib/UIContext';

interface Invoice {
  id: string;
  vendor: string;
  total: number;
  date: string;
  currency: string;
  category: string;
  isComplete: boolean;
  imageUrl?: string;
  fileType?: string;
  createdAt: any;
  tax?: number;
  deductiblePercentage?: number;
  deductionInsight?: string;
}

export default function InvoiceHistory() {
  const { searchQuery, setSearchQuery } = useUI();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const categories = ['all', ...Array.from(new Set(invoices.map(inv => inv.category.toLowerCase())))];

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'invoices'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
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

    return () => unsubscribe();
  }, []);

  const formatDateRO = (dateStr: string) => {
    if (!dateStr || !dateStr.includes('-')) return dateStr;
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesCategory = filter === 'all' || inv.category.toLowerCase().includes(filter.toLowerCase());
    const matchesSearch = inv.vendor.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inv.total.toString().includes(searchQuery) ||
                          inv.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Istoric Documente</h1>
          <div className="flex items-center gap-3">
            <p className="text-slate-500 font-medium">Gestionare facturi și bonuri auditate de Vision AI</p>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="bg-accent/10 border border-accent/20 px-3 py-1 rounded-full text-accent text-[10px] font-black uppercase tracking-widest hover:bg-accent/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                Search: {searchQuery}
                <span className="text-lg leading-none">&times;</span>
              </button>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3 relative">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl group transition-all hover:border-white/20">
            <Filter size={16} className="text-slate-500" />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-pointer outline-none appearance-none pr-8"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-bg-deep text-white">
                  {cat.toUpperCase()}
                </option>
              ))}
            </select>
            <div className="absolute right-4 pointer-events-none text-slate-500">
              <ChevronDown size={14} />
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel overflow-hidden border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[11px] font-black uppercase tracking-widest text-slate-500">
                <th className="px-8 py-6">Document</th>
                <th className="px-8 py-6">Tip</th>
                <th className="px-8 py-6">Categoria</th>
                <th className="px-8 py-6">Data Factură</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Sumă Totală</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Se încarcă arhiva...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-600">
                      <FileText size={48} className="opacity-20" />
                      <p className="text-sm font-bold uppercase tracking-widest">Niciun document găsit</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {filteredInvoices.map((inv) => (
                    <motion.tr 
                      key={inv.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => setSelectedInvoice(inv)}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group cursor-pointer"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-slate-500 group-hover:text-accent transition-colors">
                            <FileText size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white group-hover:text-accent transition-colors">{inv.vendor}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{inv.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest",
                          (inv as any).type === 'income' ? "text-emerald-400" : "text-amber-400"
                        )}>
                          {(inv as any).type === 'income' ? 'Venit' : 'Cheltuială'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {inv.category}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
                          <Calendar size={14} className="text-slate-600" />
                          {formatDateRO(inv.date)}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            inv.isComplete ? "bg-emerald-400" : "bg-amber-400"
                          )} />
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                            {inv.isComplete ? 'Auditat' : 'Partial'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <p className="text-sm font-black text-white">{inv.total} {inv.currency}</p>
                        <p className="text-[10px] text-emerald-400/70 font-bold uppercase tracking-widest italic">Factură Validă</p>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
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
