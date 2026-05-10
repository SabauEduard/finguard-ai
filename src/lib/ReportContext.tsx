import React, { createContext, useContext, useState, ReactNode } from 'react';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { collection, addDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { getTaxAdvice } from '../services/geminiService';

interface ReportContextType {
  isGenerating: boolean;
  currentReport: any | null;
  generateReport: (invoices: any[], timeRange: string, periodLabel?: string) => Promise<any>;
  setCurrentReport: (report: any) => void;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export function ReportProvider({ children }: { children: ReactNode }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentReport, setCurrentReport] = useState<any | null>(null);

  const generateReport = async (invoices: any[], timeRange: string, periodLabel: string = 'Q2 2026') => {
    if (!auth.currentUser || isGenerating) return;
    
    setIsGenerating(true);
    try {
      // Filter invoices based on timeRange
      const filteredInvoices = invoices.filter(inv => {
        if (!inv.date) return false;
        
        const parts = inv.date.split('-');
        if (parts.length !== 3) return false;
        const y = parseInt(parts[0]);
        const m = parseInt(parts[1]) - 1;
        const d = parseInt(parts[2]);
        
        const invDate = new Date(y, m, d);
        const now = new Date(); 
        const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const diffTime = nowMidnight.getTime() - invDate.getTime();
        if (diffTime < 0) return false; 
        
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= parseInt(timeRange);
      });

      // Calculate real stats from FILTERED data
      const totalIncome = filteredInvoices.filter(i => i.type === 'income').reduce((sum, i) => sum + (Number(i.total) || 0), 0);
      const totalExpenses = filteredInvoices.filter(i => i.type !== 'income').reduce((sum, i) => sum + (Number(i.total) || 0), 0);
      const totalTax = filteredInvoices.reduce((sum, i) => sum + (Number(i.tax) || 0), 0);
      
      const incomeByCategory = filteredInvoices.filter(i => i.type === 'income').reduce((acc: any, inv) => {
        const cat = inv.category || 'Altele';
        acc[cat] = (acc[cat] || 0) + (Number(inv.total) || 0);
        return acc;
      }, {});

      const expensesByCategory = filteredInvoices.filter(i => i.type !== 'income').reduce((acc: any, inv) => {
        const cat = inv.category || 'Altele';
        acc[cat] = (acc[cat] || 0) + (Number(inv.total) || 0);
        return acc;
      }, {});

      const userData = {
        totalIncome,
        totalExpenses,
        totalTax,
        categories: Array.from(new Set([...Object.keys(incomeByCategory), ...Object.keys(expensesByCategory)])),
        invoiceCount: filteredInvoices.length,
        incomeByCategory,
        expensesByCategory,
        period: periodLabel
      };

      const userProfile = {
        type: 'SRL Micro',
        employees: 1,
        dividendTaxRate: 0.08
      };

      const advice = await getTaxAdvice(userData, userProfile);
      
      const reportData = {
        userId: auth.currentUser.uid,
        title: `Audit Fiscal - ${periodLabel} (${new Date().toLocaleDateString('ro-RO', { month: 'short', year: 'numeric' })})`,
        period: periodLabel,
        summary: advice.summary,
        riskScore: advice.riskScore,
        riskDescription: advice.riskDescription,
        totalIncome,
        totalExpenses,
        totalTax,
        incomeByCategory,
        expensesByCategory,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'reports'), reportData);
      
      // For immediate UI update, we use a local timestamp since serverTimestamp() 
      // returns a field value that isn't a date until synced
      const finalReport = { 
        id: docRef.id, 
        ...reportData,
        createdAt: Timestamp.now() // Local approximation for immediate view
      };
      
      setCurrentReport(finalReport);
      return finalReport;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'reports');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ReportContext.Provider value={{ isGenerating, currentReport, generateReport, setCurrentReport }}>
      {children}
    </ReportContext.Provider>
  );
}

export function useReport() {
  const context = useContext(ReportContext);
  if (context === undefined) {
    throw new Error('useReport must be used within a ReportProvider');
  }
  return context;
}
