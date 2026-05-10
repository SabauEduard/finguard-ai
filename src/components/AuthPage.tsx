/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowLeft, Chrome } from 'lucide-react';
import { cn } from '../lib/utils';

interface AuthPageProps {
  onGoogleLogin: () => void;
  onBack: () => void;
  isLoggingIn?: boolean;
  onLegalClick?: (type: 'terms' | 'privacy') => void;
}

export default function AuthPage({ onGoogleLogin, onBack, isLoggingIn = false, onLegalClick }: AuthPageProps) {
  const providers = [
    { 
      id: 'google', 
      name: 'Google', 
      icon: Chrome, 
      color: 'bg-white text-bg-deep',
      onClick: onGoogleLogin,
      active: true 
    }
  ];

  return (
    <div className="min-h-screen bg-bg-deep flex items-center justify-center p-6 relative overflow-hidden">
      <div className="mesh-bg opacity-30" />
      
      <button 
        onClick={onBack}
        className="absolute top-12 left-12 p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all flex items-center gap-2 group z-50 cursor-pointer"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold text-sm uppercase tracking-widest">Înapoi</span>
      </button>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full glass-panel p-12 rounded-[3.5rem] border-white/10 backdrop-blur-3xl shadow-2xl relative z-10"
      >
        <div className="mb-12 text-center">
          <div className="w-16 h-16 bg-accent rounded-3xl flex items-center justify-center text-bg-deep mx-auto mb-6 shadow-2xl shadow-accent/20">
            <TrendingUp size={32} />
          </div>
          <h2 className="text-3xl font-black text-white mb-3">Bun venit înapoi</h2>
          <p className="text-slate-400 font-medium">Conectează-te cu contul tău Google.</p>
        </div>

        <div className="space-y-4">
          {providers.map((p) => (
            <button
              key={p.id}
              onClick={p.onClick}
              disabled={isLoggingIn || !p.active}
              className={cn(
                "w-full p-5 rounded-2xl flex items-center justify-between transition-all group relative overflow-hidden cursor-pointer",
                p.color,
                !p.active && "opacity-40 grayscale cursor-not-allowed",
                p.active && "active:scale-95 shadow-xl hover:shadow-2xl"
              )}
            >
              <div className="flex items-center gap-4 relative z-10">
                <p.icon size={22} />
                <span className="font-bold text-lg">
                  {p.id === 'google' && isLoggingIn ? "Se conectează..." : `Continuă cu ${p.name}`}
                </span>
              </div>
              {!p.active && (
                <span className="text-[10px] font-black uppercase tracking-widest opacity-50 relative z-10">Curând</span>
              )}
              {p.active && p.id === 'google' && (
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
              )}
            </button>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-sm text-slate-500 font-medium">
            Prin continuarea procedurii, ești de acord cu <br />
            <button 
              onClick={() => onLegalClick?.('terms')}
              className="text-slate-300 hover:text-accent transition-colors cursor-pointer"
            >
              Termenii de Utilizare
            </button> 
            {' și '} 
            <button 
              onClick={() => onLegalClick?.('privacy')}
              className="text-slate-300 hover:text-accent transition-colors cursor-pointer"
            >
              Politica de Confidențialitate
            </button>.
          </p>
        </div>
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-accent/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -z-10" />
    </div>
  );
}
