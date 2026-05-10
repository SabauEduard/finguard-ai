import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  type: 'terms' | 'privacy' | null;
  onClose: () => void;
}

export default function LegalModal({ isOpen, type, onClose }: LegalModalProps) {
  return (
    <AnimatePresence>
      {isOpen && type && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-bg-deep/90 backdrop-blur-xl">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="glass-panel max-w-2xl w-full max-h-[80vh] overflow-hidden border-white/20 relative flex flex-col bg-slate-900"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-accent/5 pointer-events-none" />
            
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors cursor-pointer z-20"
            >
              <X size={24} />
            </button>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 relative z-10">
              <div className="mb-8">
                <h2 className="text-3xl font-black text-white mb-2">
                  {type === 'terms' ? 'Termeni și Condiții' : 'Politica de Confidențialitate'}
                </h2>
                <div className="w-12 h-1 bg-accent rounded-full"></div>
              </div>

              <div className="prose prose-invert max-w-none space-y-6 text-slate-400 font-medium">
                {type === 'terms' ? (
                  <>
                    <p>Bun venit la FinGuard AI. Prin utilizarea serviciilor noastre, sunteți de acord cu următorii termeni:</p>
                    <h3 className="text-white font-bold text-lg">1. Acceptarea Serviciului</h3>
                    <p>Utilizarea aplicației reprezintă acordul dumneavoastră implicit cu privire la acești termeni. Serviciul este oferit "ca atare".</p>
                    <h3 className="text-white font-bold text-lg">2. Responsabilitatea Utilizatorului</h3>
                    <p>Sunteți responsabil pentru acuratețea datelor introduse și pentru menținerea confidențialității contului dumneavoastră.</p>
                    <h3 className="text-white font-bold text-lg">3. Modificări ale Serviciului</h3>
                    <p>Ne rezervăm dreptul de a modifica sau întrerupe serviciul cu o notificare prealabilă.</p>
                    <h3 className="text-white font-bold text-lg">4. Plăți și Abonamente</h3>
                    <p>Abonamentele sunt facturate lunar. Puteți anula oricând, dar sumele deja plătite nu sunt rambursabile.</p>
                  </>
                ) : (
                  <>
                    <p>Respectăm confidențialitatea datelor dumneavoastră financiare și personale.</p>
                    <h3 className="text-white font-bold text-lg">1. Colectarea Datelor</h3>
                    <p>Colectăm doar datele necesare pentru funcționarea serviciilor fiscale solicitate de dumneavoastră și sincronizarea cu ANAF.</p>
                    <h3 className="text-white font-bold text-lg">2. Utilizarea Informațiilor</h3>
                    <p>Datele sunt utilizate exclusiv pentru generarea rapoartelor fiscale și auditarea cheltuielilor prin agenți AI proprii.</p>
                    <h3 className="text-white font-bold text-lg">3. Securitatea Datelor</h3>
                    <p>Implementăm standarde bank-grade de criptare (AES-256) pentru a asigura protecția totală a informațiilor dumneavoastră.</p>
                    <h3 className="text-white font-bold text-lg">4. Drepturile Dumneavoastră</h3>
                    <p>Aveți dreptul de a solicita ștergerea sau exportul datelor dumneavoastră oricând din setările contului.</p>
                  </>
                )}
              </div>
              
              <div className="mt-12 flex justify-end">
                <button 
                  onClick={onClose}
                  className="px-8 py-3 bg-white/5 hover:bg-white text-white hover:text-bg-deep rounded-xl font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer"
                >
                  Am înțeles
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
