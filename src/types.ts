export type FiscalProfile = 'PFA_REAL' | 'PFA_NORMA' | 'SRL_MICRO';

export interface UserProfile {
  name: string;
  fiscalType: FiscalProfile;
  annualSafeIncome?: number;
  vatPayer: boolean;
}

export interface Expense {
  id: string;
  vendor: string;
  amount: number;
  currency: string;
  date: string;
  vatAmount: number;
  category: string;
  deductiblePercentage: number;
  description: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  imageUrl?: string;
  createdAt: string;
}

export interface Income {
  id: string;
  source: string;
  amount: number;
  currency: string;
  date: string;
  category: string;
  createdAt: string;
}
