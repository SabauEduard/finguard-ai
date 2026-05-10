/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  FileText, 
  Calendar, 
  Wallet, 
  Tag, 
  ShieldCheck, 
  Download,
  Trash2,
  ExternalLink,
  Receipt,
  Loader2,
  AlertCircle,
  FileEdit,
  Save,
  Check
} from 'lucide-react';
import { cn } from '../lib/utils';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';

import { createPortal } from 'react-dom';

interface InvoiceDetailSidebarProps {
  invoice: any | null;
  onClose: () => void;
}

export default function InvoiceDetailSidebar({ invoice, onClose }: InvoiceDetailSidebarProps) {
  const [showDocModal, setShowDocModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [editedInvoice, setEditedInvoice] = useState<any>(null);

  useEffect(() => {
    if (invoice) {
      setEditedInvoice({ ...invoice });
      setIsEditing(false);
      setSuccess(false);
      setError(null);
    }
  }, [invoice]);

  if (!invoice || !editedInvoice) return null;

  const formatCurrency = (val: number, currency: string = 'RON') => {
    return new Intl.NumberFormat('ro-RO', { style: 'currency', currency }).format(val);
  };

  const toDisplayDate = (isoDate: string) => {
    if (!isoDate || !isoDate.includes('-')) return isoDate;
    const [y, m, d] = isoDate.split('-');
    return `${d}/${m}/${y}`;
  };

  const toISODate = (displayDate: string) => {
    if (!displayDate || !displayDate.includes('/')) return displayDate;
    const parts = displayDate.split('/');
    if (parts.length !== 3) return displayDate;
    const [d, m, y] = parts;
    // Basic zero padding
    const pad = (s: string) => s.length === 1 ? '0' + s : s;
    return `${y}-${pad(m)}-${pad(d)}`;
  };

  const handleDelete = async () => {
    if (!invoice || isDeleting) return;

    setIsDeleting(true);
    setError(null);
    try {
      await deleteDoc(doc(db, 'invoices', invoice.id));
      setShowDeleteModal(false);
      onClose();
    } catch (err: any) {
      console.error("Delete error:", err);
      setError("Nu s-a putut șterge documentul. Verifică conexiunea.");
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    if (!invoice || isSaving) return;

    setIsSaving(true);
    setError(null);
    try {
      const { id, ...dataToUpdate } = editedInvoice;
      await updateDoc(doc(db, 'invoices', invoice.id), dataToUpdate);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setIsEditing(false);
    } catch (err: any) {
      console.error("Update error:", err);
      setError("Nu s-a putut salva modificarea. Verifică conexiunea.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    if (!invoice?.imageUrl) return;
    
    try {
      const link = document.createElement('a');
      link.href = invoice.imageUrl;
      const isPdf = invoice.fileType?.includes('pdf') || invoice.imageUrl.startsWith('data:application/pdf');
      const extension = isPdf ? 'pdf' : 'jpg';
      link.download = `Invoice_${invoice.vendor.replace(/\s+/g, '_')}_${invoice.id.slice(0, 8)}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download error:", err);
      setError("Eroare la descărcare. Te rugăm să încerci din nou.");
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {invoice && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-bg-deep/80 backdrop-blur-sm z-[100]"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-lg bg-slate-900 border-l border-white/10 z-[101] flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-accent/5 pointer-events-none" />
              
              {/* Header */}
              <div className="p-8 border-b border-white/5 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-bg-deep shadow-lg shadow-accent/20">
                    <FileText size={24} />
                  </div>
                  <div>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={editedInvoice.vendor}
                        onChange={(e) => setEditedInvoice({ ...editedInvoice, vendor: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-lg font-bold outline-none focus:border-accent w-full"
                      />
                    ) : (
                      <h2 className="text-xl font-bold text-white leading-tight">{editedInvoice.vendor}</h2>
                    )}
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Document ID: {invoice.id.slice(0, 12)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className={cn(
                      "p-3 rounded-xl transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-widest",
                      isEditing ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-500 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {isSaving ? <Loader2 size={20} className="animate-spin" /> : isEditing ? <><Save size={18} /> Salvează</> : <FileEdit size={20} />}
                  </button>
                  <button 
                    onClick={onClose}
                    className="p-3 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar relative z-10">
                {error && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-bold text-center">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 text-xs font-bold text-center flex items-center justify-center gap-2 uppercase tracking-widest">
                    <Check size={16} />
                    Modificări Salvate
                  </div>
                )}

                {/* Image Preview */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Receipt size={12} className="text-accent" />
                    Document Scanat
                  </p>
                  <div className="aspect-[3/4] bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden group relative flex items-center justify-center">
                    {invoice.imageUrl ? (
                      invoice.fileType?.includes('pdf') || invoice.imageUrl.startsWith('data:application/pdf') ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 p-12 text-center group">
                          <div className="w-24 h-24 bg-accent/20 rounded-3xl flex items-center justify-center text-accent mb-6 transition-transform">
                            <FileText size={48} />
                          </div>
                          <p className="text-lg font-bold text-white mb-2">Document PDF</p>
                          <p className="text-xs text-slate-500 uppercase tracking-widest leading-relaxed">
                            Arhivat și Securizat <br /> in Vision Vault
                          </p>
                        </div>
                      ) : (
                        <img 
                          src={invoice.imageUrl} 
                          alt="Invoice" 
                          className="w-full h-full object-cover transition-transform"
                          referrerPolicy="no-referrer"
                        />
                      )
                    ) : (
                      <div className="text-center p-8 opacity-20">
                        <FileText size={64} className="mx-auto mb-4" />
                        <p className="text-sm font-bold uppercase tracking-widest underline underline-offset-4">Placeholder Document</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-bg-deep/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={() => setShowDocModal(true)}
                        className="bg-white text-bg-deep px-6 py-3 rounded-2xl font-bold text-sm shadow-xl flex items-center gap-2 cursor-pointer"
                      >
                        <ExternalLink size={16} />
                        Vezi Document Complet
                      </button>
                    </div>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-panel p-6 border-white/5 bg-white/[0.02]">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Wallet size={12} className="text-emerald-400" />
                      Total Achitat
                    </p>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          value={editedInvoice.total}
                          onChange={(e) => setEditedInvoice({ ...editedInvoice, total: parseFloat(e.target.value) || 0 })}
                          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white font-bold outline-none focus:border-accent w-full"
                        />
                        <span className="text-xs text-slate-500">{editedInvoice.currency}</span>
                      </div>
                    ) : (
                      <p className="text-xl font-bold text-white">{formatCurrency(editedInvoice.total, editedInvoice.currency)}</p>
                    )}
                  </div>
                  <div className="glass-panel p-6 border-white/5 bg-white/[0.02]">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Tag size={12} className="text-accent" />
                      TVA (Dedus)
                    </p>
                    {isEditing ? (
                      <input 
                        type="number" 
                        value={editedInvoice.tax || 0}
                        onChange={(e) => setEditedInvoice({ ...editedInvoice, tax: parseFloat(e.target.value) || 0 })}
                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white font-bold outline-none focus:border-accent w-full"
                      />
                    ) : (
                      <p className="text-xl font-bold text-white">{formatCurrency(editedInvoice.tax || 0, editedInvoice.currency)}</p>
                    )}
                  </div>
                </div>

                {/* Details List */}
                <div className="space-y-6">
                  {editedInvoice.deductionInsight && (
                    <div className="p-6 bg-accent/5 border border-accent/10 rounded-3xl space-y-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-accent" />
                        <span className="text-[10px] font-black text-accent uppercase tracking-widest">Analiză Fiscală AI</span>
                      </div>
                      {isEditing ? (
                        <textarea 
                          value={editedInvoice.deductionInsight}
                          onChange={(e) => setEditedInvoice({ ...editedInvoice, deductionInsight: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm min-h-[80px] focus:border-accent outline-none italic"
                        />
                      ) : (
                        <p className="text-sm text-slate-300 leading-relaxed italic">
                          "{editedInvoice.deductionInsight}"
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-accent/10">
                        <span className="text-[9px] font-bold text-slate-500 uppercase">Procent Deducere</span>
                        {isEditing ? (
                          <input 
                            type="number" 
                            value={editedInvoice.deductiblePercentage}
                            onChange={(e) => setEditedInvoice({ ...editedInvoice, deductiblePercentage: parseInt(e.target.value) || 0 })}
                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-0.5 text-white text-xs font-bold w-16"
                          />
                        ) : (
                          <span className="text-xs font-black text-white">{editedInvoice.deductiblePercentage ?? 100}%</span>
                        )}
                      </div>
                    </div>
                  )}

                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Atribute Fiscale</p>
                  <div className="space-y-1">
                    {[
                      { label: 'Tip Document', key: 'type', value: editedInvoice.type === 'income' ? 'Venit (Factură Emisă)' : 'Cheltuială (Primită)', icon: Receipt, color: editedInvoice.type === 'income' ? 'text-emerald-400' : 'text-amber-400', isSelect: true, options: [{value: 'income', label: 'Venit'}, {value: 'expense', label: 'Cheltuială'}] },
                      { label: 'Furnizor', key: 'vendor', value: editedInvoice.vendor, subKey: 'vendorCif', subValue: editedInvoice.vendorCif ? `CIF: ${editedInvoice.vendorCif}` : 'CIF: -', icon: Tag },
                      { label: 'Client', key: 'client', value: editedInvoice.client || '-', subKey: 'clientCif', subValue: editedInvoice.clientCif ? `CIF: ${editedInvoice.clientCif}` : 'CIF: -', icon: Tag },
                      { label: 'Data Achiziție', key: 'date', value: toDisplayDate(editedInvoice.date), icon: Calendar, isDate: true },
                      { label: 'Categoria', key: 'category', value: editedInvoice.category, icon: Tag },
                      { label: 'Status Audit', key: 'isComplete', value: editedInvoice.isComplete ? 'Validat 100%' : 'În Verificare', icon: ShieldCheck, isStatus: true, isBoolean: true },
                    ].map((item: any, i) => (
                      <div key={i} className="flex flex-col py-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] px-2 rounded-xl transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <item.icon size={16} className="text-slate-500" />
                            <span className="text-sm font-medium text-slate-400">{item.label}</span>
                          </div>
                          
                          {isEditing ? (
                            item.isSelect ? (
                              <select 
                                value={editedInvoice[item.key]}
                                onChange={(e) => setEditedInvoice({ ...editedInvoice, [item.key]: e.target.value })}
                                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-accent text-xs font-bold outline-none"
                              >
                                {item.options.map((opt: any) => <option key={opt.value} value={opt.value} className="bg-bg-deep">{opt.label}</option>)}
                              </select>
                            ) : item.isDate ? (
                              <input 
                                type="text"
                                value={toDisplayDate(editedInvoice[item.key])}
                                onChange={(e) => setEditedInvoice({ ...editedInvoice, [item.key]: toISODate(e.target.value) })}
                                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-xs font-bold outline-none w-1/2 text-right"
                                placeholder="DD/MM/YYYY"
                              />
                            ) : item.isBoolean ? (
                              <div 
                                onClick={() => setEditedInvoice({ ...editedInvoice, [item.key]: !editedInvoice[item.key] })}
                                className={cn(
                                  "w-10 h-5 rounded-full relative transition-all cursor-pointer",
                                  editedInvoice[item.key] ? "bg-emerald-500" : "bg-white/10"
                                )}
                              >
                                <div className={cn(
                                  "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                                  editedInvoice[item.key] ? "left-6" : "left-1"
                                )} />
                              </div>
                            ) : (
                              <input 
                                type="text"
                                value={editedInvoice[item.key]}
                                onChange={(e) => setEditedInvoice({ ...editedInvoice, [item.key]: e.target.value })}
                                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-xs font-bold text-right outline-none w-1/2"
                              />
                            )
                          ) : (
                            <span className={cn(
                              "text-sm font-bold text-right",
                              item.isStatus && editedInvoice[item.key] ? "text-emerald-400" : (item.color || "text-white")
                            )}>
                              {item.value}
                            </span>
                          )}
                        </div>
                        
                        {(item.subValue || isEditing) && item.subKey && (
                          <div className="ml-7 mt-1">
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-500 font-bold uppercase">CIF:</span>
                                <input 
                                  type="text"
                                  value={editedInvoice[item.subKey] || ''}
                                  onChange={(e) => setEditedInvoice({ ...editedInvoice, [item.subKey]: e.target.value })}
                                  className="bg-white/5 border border-white/10 rounded px-2 py-0.5 text-[10px] text-slate-400 font-bold outline-none grow"
                                  placeholder="CIF/CUI"
                                />
                              </div>
                            ) : (
                              <p className="text-[10px] text-slate-500 font-bold">{item.subValue}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-8 border-t border-white/5 grid grid-cols-2 gap-4">
                <button 
                  onClick={handleDownload}
                  disabled={isEditing}
                  className="flex items-center justify-center gap-2 py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-bold text-sm hover:bg-white/10 transition-all border-dashed disabled:opacity-50"
                >
                  <Download size={18} />
                  Download
                </button>
                <button 
                  onClick={() => setShowDeleteModal(true)}
                  disabled={isDeleting || isEditing}
                  className="flex items-center justify-center gap-2 py-4 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl font-bold text-sm hover:bg-rose-500/20 transition-all disabled:opacity-50"
                >
                  <Trash2 size={18} />
                  Șterge
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Document View Modal */}
      {showDocModal && invoice && (
        <div className="fixed inset-0 z-[10005] flex items-center justify-center p-4 bg-bg-deep/95 backdrop-blur-md">
          <button 
            onClick={() => setShowDocModal(false)}
            className="absolute top-6 right-6 p-3 text-slate-500 hover:text-white bg-white/5 rounded-xl transition-all z-[10006]"
          >
            <X size={24} />
          </button>
          {invoice.fileType?.includes('pdf') || invoice.imageUrl.startsWith('data:application/pdf') ? (
            <iframe src={invoice.imageUrl} className="w-full h-full max-w-5xl max-h-[90vh] rounded-3xl" title="Document PDF" />
          ) : (
            <img src={invoice.imageUrl} alt="Document" className="max-w-full max-h-[90vh] object-contain rounded-3xl shadow-2xl" referrerPolicy="no-referrer" />
          )}
        </div>
      )}

      {/* Delete Confirmation Modal - Using Portal to ensure it's on top of everything */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showDeleteModal && invoice && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDeleteModal(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-sm bg-bg-deep border border-rose-500/30 p-8 rounded-[2.5rem] shadow-2xl shadow-rose-500/10 z-[10001]"
              >
                <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-6">
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-white text-center mb-2">Confirmă Ștergerea</h3>
                <p className="text-sm text-slate-400 text-center mb-8 leading-relaxed">
                  Ești sigur că vrei să elimini documentul de la <span className="text-white font-bold">{invoice.vendor}</span>? Această acțiune nu poate fi anulată.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setShowDeleteModal(false)}
                    className="py-4 bg-white/5 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    Anulează
                  </button>
                  <button 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="py-4 bg-rose-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center"
                  >
                    {isDeleting ? <Loader2 size={18} className="animate-spin" /> : "Șterge Definitiv"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

