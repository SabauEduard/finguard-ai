/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Camera,
  X,
  ChevronRight,
  Maximize2,
  Trash2,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { scanDocument, ExtractedExpense } from '../services/geminiService';
import { useUI } from '../lib/UIContext';
import { cn } from '../lib/utils';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ExpenseAuditor() {
  const { addNotification, settings } = useUI();
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string>('');
  const [preview, setPreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [result, setResult] = useState<ExtractedExpense | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 2 * 1024 * 1024) {
        setError("Fișierul este prea mare (> 2MB). Te rugăm să folosești o imagine mai mică sau un PDF optimizat.");
        return;
      }
      setFile(selectedFile);
      setFileType(selectedFile.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        const MAX_DIM = 1200;
        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    });
  };

  const startScan = async () => {
    if (!preview) return;
    setIsScanning(true);
    setError(null);
    try {
      let dataToScan = preview;
      if (fileType.startsWith('image/')) {
        dataToScan = await compressImage(preview);
        setPreview(dataToScan); // Use compressed version for saving too
      }

      const base64Data = dataToScan.split(',')[1];
      const data = await scanDocument(base64Data, settings.fiscal.cif, fileType || "image/jpeg");
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Failed to scan document. Please try again with a clearer image or document.");
    } finally {
      setIsScanning(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setSuccess(false);
  };

  const saveInvoice = async () => {
    if (!result || !auth.currentUser || !preview) return;
    setIsSaving(true);
    try {
      // Check final document size before saving
      const combinedSize = preview.length + JSON.stringify(result).length;
      if (combinedSize > 1000000) {
        throw new Error("Documentul este în continuare prea mare pentru a fi salvat direct. Redu dimensiunea fișierului.");
      }

      await addDoc(collection(db, 'invoices'), {
        userId: auth.currentUser.uid,
        vendor: result.vendor,
        vendorCif: result.vendorCif || '',
        client: result.client,
        clientCif: result.clientCif || '',
        type: result.type,
        date: result.date,
        total: result.amount,
        currency: result.currency,
        tax: result.vatAmount,
        category: result.category,
        deductionInsight: result.legalJustification,
        deductiblePercentage: result.deductiblePercentage,
        isComplete: result.isComplete,
        imageUrl: preview,
        fileType: fileType,
        createdAt: serverTimestamp()
      });

      addNotification({
        title: result.type === 'income' ? 'Venit Înregistrat' : 'Cheltuială Înregistrată',
        text: `Documentul de la ${result.vendor} (${result.amount} ${result.currency}) a fost salvat.`,
        type: 'history'
      });

      setSuccess(true);
      setTimeout(() => {
        removeFile();
      }, 2000);
    } catch (err) {
      if (err instanceof Error && err.message.includes("mare")) {
        setError(err.message);
      } else {
        handleFirestoreError(err, OperationType.WRITE, 'invoices');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Dropzone / Preview */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Procesare Facturi</h2>
              <p className="text-sm text-slate-500">Detectare automată Venituri vs Cheltuieli prin Vision AI</p>
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-accent text-bg-deep rounded-2xl hover:bg-white transition-all shadow-xl shadow-accent/20 cursor-pointer"
            >
              <Camera size={20} />
            </button>
          </div>

          <div 
            className={cn(
              "relative border-2 border-dashed rounded-[2.5rem] bg-white/5 transition-all flex flex-col items-center justify-center min-h-[500px]",
              preview ? "border-white/10 p-4" : "border-white/20 hover:border-accent/40 p-12"
            )}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*,application/pdf"
            />
            
            {preview ? (
              <div className="relative w-full h-full group p-4">
                {fileType.includes('pdf') ? (
                  <div className="flex flex-col items-center justify-center h-64 bg-white/5 rounded-3xl border border-white/10">
                    <FileText size={64} className="text-accent mb-4" />
                    <p className="text-sm font-bold text-white">{file?.name}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">Document PDF</p>
                  </div>
                ) : (
                  <img 
                    src={preview} 
                    alt="Previzualizare Document" 
                    className="w-full h-full max-h-[400px] object-contain rounded-3xl"
                  />
                )}
                <div className="absolute top-8 right-8 flex gap-2">
                  <button 
                    onClick={removeFile}
                    className="p-3 bg-white/90 backdrop-blur shadow-xl rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-500 border border-white/10">
                  <Upload size={32} />
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">Glisează factura aici</h3>
                <p className="text-sm text-slate-500 mb-8">Detectăm automat cine este Clientul și cine este Furnizorul</p>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-8 py-3 bg-white/10 border border-white/20 rounded-2xl font-bold text-sm text-white hover:bg-white/20 transition-all cursor-pointer"
                >
                  Alege din Dispozitiv
                </button>
              </div>
            )}
          </div>

          {preview && !result && (
            <button 
              onClick={startScan}
              disabled={isScanning}
              className="w-full py-4 bg-accent text-bg-deep rounded-2xl font-bold text-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xl shadow-accent/20 flex items-center justify-center gap-3 cursor-pointer"
            >
              {isScanning ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  <span>Scanare Vision AI...</span>
                </>
              ) : (
                <>
                  <Maximize2 size={20} />
                  <span>Analizează Document</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Audit Results */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-white">Analiză AI</h2>
            {result && (
              <div className={cn(
                "flex items-center gap-2 px-3 py-1 border rounded-full text-[10px] font-black uppercase tracking-wider",
                result.type === 'income' 
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20" 
                  : "bg-amber-500/20 text-amber-400 border-amber-500/20"
              )}>
                {result.type === 'income' ? 'Venit (Factură Emisă)' : 'Cheltuială (Factură Primită)'}
              </div>
            )}
          </div>

          <div className="glass-panel p-8 min-h-[500px] flex flex-col">
            <AnimatePresence mode="wait">
              {isScanning ? (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center text-center p-12"
                >
                  <Loader2 className="animate-spin text-accent mb-6" size={48} />
                  <h3 className="text-xl font-bold mb-2 text-white">Interpretare Document...</h3>
                  <p className="text-sm text-slate-500 max-w-xs">
                    Identificăm Furnizorul și Clientul pe baza CIF-urilor pentru a clasifica tranzacția...
                  </p>
                </motion.div>
              ) : result ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-white/10">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Furnizor (Vânzător)</p>
                      {isEditing ? (
                        <div className="space-y-2">
                          <input 
                            type="text" 
                            value={result.vendor} 
                            onChange={(e) => setResult({ ...result, vendor: e.target.value })}
                            placeholder="Nume Furnizor"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white font-bold focus:border-accent outline-none"
                          />
                          <input 
                            type="text" 
                            value={result.vendorCif} 
                            onChange={(e) => setResult({ ...result, vendorCif: e.target.value })}
                            placeholder="CIF Furnizor"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-slate-400 text-xs focus:border-accent outline-none"
                          />
                        </div>
                      ) : (
                        <div>
                          <h4 className="text-xl font-bold text-white">{result.vendor}</h4>
                          <p className="text-xs text-slate-500">CIF: {result.vendorCif || 'Nedetectat'}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Client (Cumpărător)</p>
                      {isEditing ? (
                        <div className="space-y-2">
                          <input 
                            type="text" 
                            value={result.client} 
                            onChange={(e) => setResult({ ...result, client: e.target.value })}
                            placeholder="Nume Client"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white font-bold focus:border-accent outline-none"
                          />
                          <input 
                            type="text" 
                            value={result.clientCif} 
                            onChange={(e) => setResult({ ...result, clientCif: e.target.value })}
                            placeholder="CIF Client"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-slate-400 text-xs focus:border-accent outline-none"
                          />
                        </div>
                      ) : (
                        <div>
                          <h4 className="text-xl font-bold text-white">{result.client}</h4>
                          <p className="text-xs text-slate-500">CIF: {result.clientCif || 'Nedetectat'}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Dată Tranzacție</p>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={result.date} 
                          onChange={(e) => setResult({ ...result, date: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white font-bold focus:border-accent outline-none"
                        />
                      ) : (
                        <p className="text-lg font-bold text-white">{result.date}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Clasificare</p>
                      {isEditing ? (
                        <select 
                          value={result.type} 
                          onChange={(e) => setResult({ ...result, type: e.target.value as any })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-accent font-bold text-xs focus:border-accent outline-none"
                        >
                          <option value="expense" className="bg-bg-deep">Cheltuială</option>
                          <option value="income" className="bg-bg-deep">Venit</option>
                        </select>
                      ) : (
                        <div className={cn(
                          "inline-flex items-center gap-2 px-3 py-1 border rounded-xl text-xs font-bold",
                          result.type === 'income' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        )}>
                          {result.type === 'income' ? 'Venit' : 'Cheltuială'}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Sumă Totală</p>
                      {isEditing ? (
                        <div className="flex gap-2">
                          <input 
                            type="number" 
                            value={result.amount} 
                            onChange={(e) => setResult({ ...result, amount: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white font-bold text-xl focus:border-accent outline-none"
                          />
                          <input 
                            type="text" 
                            value={result.currency} 
                            onChange={(e) => setResult({ ...result, currency: e.target.value })}
                            className="w-16 bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 text-white font-bold focus:border-accent outline-none"
                          />
                        </div>
                      ) : (
                        <p className="text-3xl font-bold tracking-tight text-white">{result.amount} {result.currency}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">VAT (TVA)</p>
                      {isEditing ? (
                        <input 
                          type="number" 
                          value={result.vatAmount} 
                          onChange={(e) => setResult({ ...result, vatAmount: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-slate-400 font-bold focus:border-accent outline-none"
                        />
                      ) : (
                        <p className="text-lg font-bold text-slate-400">{result.vatAmount} {result.currency}</p>
                      )}
                    </div>
                  </div>

                  {result.type === 'expense' && (
                    <div className="p-6 bg-accent/10 rounded-3xl border border-accent/20 overflow-hidden relative">
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-accent text-bg-deep rounded-xl shadow-lg shadow-accent/20">
                            <ShieldAlert size={20} />
                          </div>
                          <h4 className="font-bold text-white">Deducere Fiscală</h4>
                        </div>
                        <div className="text-sm text-slate-300 leading-relaxed mb-4">
                          {isEditing ? (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <span className="text-xs text-slate-500">% Deducere:</span>
                                <input 
                                  type="number" 
                                  value={result.deductiblePercentage} 
                                  onChange={(e) => setResult({ ...result, deductiblePercentage: parseInt(e.target.value) || 0 })}
                                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white font-bold focus:border-accent outline-none"
                                />
                              </div>
                              <div className="space-y-2">
                                <span className="text-xs text-slate-500">Justificare Fiscală:</span>
                                <textarea 
                                  value={result.legalJustification} 
                                  onChange={(e) => setResult({ ...result, legalJustification: e.target.value })}
                                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white text-sm min-h-[80px] focus:border-accent outline-none"
                                />
                              </div>
                            </div>
                          ) : (
                            <p>{result.legalJustification}</p>
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                          <span className="text-[9px] font-black text-accent uppercase tracking-widest">RO-DEDUCTION-CODE</span>
                          <span className="text-sm font-black text-white">{result.deductiblePercentage}%</span>
                        </div>
                      </div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                    </div>
                  )}

                  <div className="flex gap-4 pt-8">
                    {success ? (
                      <div className="w-full py-4 bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-2xl font-bold text-center flex items-center justify-center gap-2">
                        <CheckCircle2 size={18} />
                        Document Salvat în Arhivă
                      </div>
                    ) : (
                      <>
                        <button 
                          onClick={saveInvoice}
                          disabled={isSaving}
                          className="flex-1 py-4 bg-accent text-bg-deep rounded-2xl font-bold text-sm hover:bg-white transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                          {isSaving ? <Loader2 className="animate-spin" size={18} /> : null}
                          {isEditing ? 'Salvează & Aprobă' : 'Aprobă & Salvează'}
                        </button>
                        <button 
                          onClick={() => setIsEditing(!isEditing)}
                          className={cn(
                            "flex-1 py-4 rounded-2xl font-bold text-sm transition-all border cursor-pointer",
                            isEditing 
                              ? "bg-white/20 text-white border-white/40 hover:bg-white/30" 
                              : "bg-white/5 text-white border-white/10 hover:bg-white/10"
                          )}
                        >
                          {isEditing ? 'Finalizează Editarea' : 'Modifică Datele'}
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              ) : error ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-red-500">
                  <AlertCircle size={48} className="mb-6" />
                  <h3 className="text-xl font-bold mb-2">Audit Eșuat</h3>
                  <p className="text-sm opacity-80">{error}</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-[#999]">
                  <FileText size={48} className="mb-6 opacity-20" />
                  <p className="text-sm italic">
                    Analiza automata va detecta cine este Furnizorul si cine este Clientul.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
