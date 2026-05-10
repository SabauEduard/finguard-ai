import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { auth, db, OperationType, handleFirestoreError } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

type View = 'dashboard' | 'auditor' | 'history' | 'tax' | 'settings' | 'calendar';

interface UIContextType {
  activeView: View;
  setActiveView: (view: View) => void;
  settingsSection: string | null;
  setSettingsSection: (section: string | null) => void;
  calendarEventId: string | null;
  setCalendarEventId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  notifications: any[];
  setNotifications: (notifications: any[]) => void;
  addNotification: (notification: any) => void;
  settings: {
    fiscal: {
      companyName: string;
      cif: string;
      regCom: string;
      address: string;
      taxRegime: string;
      isVatPayer: boolean;
      iban: string;
      legalRep: string;
    };
    notif: {
      cassAlert: boolean;
      deadlineReminder: boolean;
      weeklyReport: boolean;
      eFacturaAlert: boolean;
      emailNotifications: boolean;
      smsNotifications: boolean;
    };
    security: {
      twoFactorEnabled: boolean;
      twoFASecret: string | null;
    };
  };
  setSettings: (settings: any) => void;
  isSettingsLoaded: boolean;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [calendarEventId, setCalendarEventId] = useState<string | null>(null);
  const [settingsSection, setSettingsSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [settings, setSettings] = useState({
    fiscal: {
      companyName: 'FINTECH SOLUTIONS S.R.L.',
      cif: 'RO12345678',
      regCom: 'J40/1234/2020',
      address: 'Strada Tehnologiei nr. 42, București',
      taxRegime: 'micro',
      isVatPayer: true,
      iban: 'RO12 INGB 0000 9999 1111 2222',
      legalRep: 'Alexandru Ionescu'
    },
    notif: {
      cassAlert: true,
      deadlineReminder: true,
      weeklyReport: true,
      eFacturaAlert: true,
      emailNotifications: true,
      smsNotifications: false
    },
    security: {
      twoFactorEnabled: false,
      twoFASecret: null
    }
  });

  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | undefined;
    
    console.log('UIProvider: Initial auth status', auth.currentUser);
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      console.log('UIProvider: Auth change', user?.uid);
      
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = undefined;
      }

      if (user) {
        setIsSettingsLoaded(false);
        // Real-time synchronization for settings
        const path = `users/${user.uid}`;
        unsubscribeSnapshot = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
          if (docSnap.exists()) {
            setSettings(prev => ({
              ...prev,
              ...docSnap.data() as any
            }));
          }
          setIsSettingsLoaded(true);
        }, (error) => {
          // If we are actively logging out, ignore permission errors briefly
          if (error.code === 'permission-denied' && !auth.currentUser) return;
          handleFirestoreError(error, OperationType.GET, path);
          setIsSettingsLoaded(true);
        });
      } else {
        setIsSettingsLoaded(true); // No user, "loaded" default settings
      }
    });
    
    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  const addNotification = (notification: any) => {
    setNotifications(prev => [{
      id: Date.now(),
      time: 'Acum',
      ...notification
    }, ...prev]);
  };

  return (
    <UIContext.Provider value={{ 
      activeView, 
      setActiveView,
      calendarEventId,
      setCalendarEventId,
      settingsSection, 
      setSettingsSection,
      searchQuery,
      setSearchQuery,
      notifications,
      setNotifications,
      addNotification,
      settings,
      setSettings,
      isSettingsLoaded
    }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
