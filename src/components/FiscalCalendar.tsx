import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  Info, 
  Clock, 
  X,
  Filter as FilterIcon,
  Target as TargetIcon
} from 'lucide-react';
import { useUI } from '../lib/UIContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

import { fiscalDeadlines as deadlines } from '../lib/deadlines';

export function FiscalCalendar() {
  const { setActiveView, calendarEventId, setCalendarEventId } = useUI();
  const [viewMode, setViewMode] = useState<'list' | 'month'>('list');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');
  const [selectedDayTasks, setSelectedDayTasks] = useState<typeof deadlines | null>(null);
  const [selectedSingleTask, setSelectedSingleTask] = useState<typeof deadlines[0] | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)); // Start at May 2026

  useEffect(() => {
    if (calendarEventId) {
      const task = deadlines.find(t => String(t.id) === calendarEventId);
      if (task) {
        setSelectedSingleTask(task);
        // We need to show the modal. selectedDayTasks controls the modal visibility
        setSelectedDayTasks([task]);
      }
      setCalendarEventId(null); // Clear after handling
    }
  }, [calendarEventId, setCalendarEventId]);

  const monthNames = [
    "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
    "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"
  ];

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const getPriorityScore = (p: string) => {
    switch(p) {
      case 'High': return 3;
      case 'Medium': return 2;
      case 'Low': return 1;
      default: return 0;
    }
  };

  const now = new Date(2026, 4, 9); // today in simulation

  const filteredAndSorted = deadlines
    .filter(d => (filterPriority === 'all' || d.type === filterPriority))
    .filter(d => viewMode === 'month' || d.actualDate >= new Date(now.getFullYear(), now.getMonth(), now.getDate()))
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return (priorityOrder[b.type as keyof typeof priorityOrder] || 0) - (priorityOrder[a.type as keyof typeof priorityOrder] || 0);
      }
      return a.actualDate.getTime() - b.actualDate.getTime();
    });

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    // Adjust for Monday start (0: Sun, 1: Mon...) -> (0: Mon, 6: Sun)
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <div className="glass-panel p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold text-white min-w-[140px]">{monthNames[month]} {year}</h3>
            <div className="flex gap-1">
              <button 
                onClick={handlePrevMonth}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          <div className="flex gap-4 text-slate-500 text-xs font-bold uppercase tracking-widest">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500" /> High</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500" /> Medium</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Low</span>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/10">
          {['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum'].map(d => (
            <div key={d} className="bg-white/[0.02] p-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
              {d}
            </div>
          ))}
          {Array.from({ length: adjustedFirstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-transparent p-4 h-36" />
          ))}
          {days.map(day => {
            const dayDate = new Date(year, month, day);
            const dayDeadlines = deadlines.filter(d => 
              d.actualDate.getFullYear() === dayDate.getFullYear() &&
              d.actualDate.getMonth() === dayDate.getMonth() &&
              d.actualDate.getDate() === dayDate.getDate() &&
              (filterPriority === 'all' || d.type === filterPriority)
            );
            
            const isToday = day === 9 && month === 4 && year === 2026;
            
            return (
              <div 
                key={day} 
                onClick={() => dayDeadlines.length > 0 && setSelectedDayTasks(dayDeadlines)}
                className={cn(
                  "bg-white/[0.02] h-36 border-r border-b border-white/5 hover:bg-white/[0.05] transition-colors group relative",
                  dayDeadlines.length > 0 ? "cursor-pointer" : "cursor-default",
                  isToday && "bg-accent/10 sm:bg-accent/5 ring-1 ring-inset ring-accent/30"
                )}
              >
                <div className="p-2 h-full flex flex-col relative z-0">
                  <span className={cn(
                    "text-xs font-bold transition-colors",
                    isToday ? "text-accent" : "text-slate-500 group-hover:text-white"
                  )}>
                    {day}
                    {isToday && <span className="ml-2 text-[8px] font-black uppercase tracking-widest opacity-70">Azi</span>}
                  </span>
                  <div className="mt-1 space-y-0.5 flex-1">
                    {dayDeadlines.map(d => (
                      <div 
                        key={d.id}
                        className={cn(
                          "text-[9px] p-1 rounded-sm font-bold truncate transition-all",
                          d.type === 'High' ? "bg-rose-500/20 text-rose-300" :
                          d.type === 'Medium' ? "bg-amber-500/20 text-amber-300" :
                          "bg-emerald-500/20 text-emerald-300"
                        )}
                      >
                        {d.title}
                      </div>
                    ))}
                  </div>
                </div>
                {dayDeadlines.length > 3 && (
                  <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-bg-deep/80 via-bg-deep/40 to-transparent flex items-end justify-center pointer-events-none pb-1.5 z-10">
                    <span className="text-[8px] font-black text-accent bg-bg-deep/60 px-2 py-0.5 rounded-full backdrop-blur-md border border-accent/20 shadow-2xl shadow-accent/5 uppercase tracking-tighter">
                      +{dayDeadlines.length - 3}
                    </span>
                  </div>
                )}
              </div>
            );
        })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <button 
            onClick={() => setActiveView('dashboard')}
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-4 group cursor-pointer"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Inapoi la Dashboard</span>
          </button>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/20 rounded-2xl text-accent">
              <CalendarIcon size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-white mb-1">Calendar Fiscal</h1>
              <p className="text-slate-500 font-medium">Urmărește termenele limită și obligațiile fiscale pe 2026</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
          <button 
            onClick={() => setViewMode('list')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer",
              viewMode === 'list' ? "bg-white/10 text-white border border-white/10 shadow-lg" : "text-slate-400 hover:text-white"
            )}
          >
            Lista
          </button>
          <button 
            onClick={() => setViewMode('month')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer",
              viewMode === 'month' ? "bg-white/10 text-white border border-white/10 shadow-lg" : "text-slate-400 hover:text-white"
            )}
          >
            Lună
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Info size={16} className="text-indigo-400" />
              Filtrează Prioritate
            </h3>
            <div className="space-y-2">
              {['all', 'High', 'Medium', 'Low'].map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border outline-none cursor-pointer",
                    filterPriority === p 
                      ? "bg-accent/10 border-accent/20 text-accent ring-1 ring-accent/20" 
                      : "bg-white/5 border-transparent text-slate-400 hover:bg-white/10 hover:border-white/20 hover:text-white active:scale-95"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      p === 'High' ? "bg-rose-500" : p === 'Medium' ? "bg-amber-500" : p === 'Low' ? "bg-emerald-500" : "bg-slate-400"
                    )} />
                    {p === 'all' ? 'Toate' : p}
                  </div>
                </button>
              ))}
            </div>
            
            {viewMode === 'list' && (
              <>
                <h3 className="font-bold text-white mt-8 mb-4 flex items-center gap-2">
                  <FilterIcon size={16} className="text-emerald-400" />
                  Sortează după
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSortBy('date')}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border outline-none cursor-pointer",
                      sortBy === 'date' ? "bg-white/10 border-white/20 text-white ring-1 ring-white/10" : "bg-white/5 border-transparent text-slate-500 hover:bg-white/10 hover:text-white active:scale-95"
                    )}
                  >
                    Dată
                  </button>
                  <button
                    onClick={() => setSortBy('priority')}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border outline-none cursor-pointer",
                      sortBy === 'priority' ? "bg-white/10 border-white/20 text-white ring-1 ring-white/10" : "bg-white/5 border-transparent text-slate-500 hover:bg-white/10 hover:text-white active:scale-95"
                    )}
                  >
                    Prioritate
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="glass-panel p-6 bg-accent/5 border-accent/20">
            <h3 className="font-bold text-white mb-2 flex items-center gap-2">
              <AlertCircle size={16} className="text-accent" />
              Sfat FinGuard
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Plățile efectuate cu cel puțin 3 zile înainte de termen elimină riscul de blocare a conturilor din cauza procesării interbancare.
            </p>
          </div>
        </div>

        <div className="lg:col-span-3">
          {viewMode === 'list' ? (
            <div className="space-y-4">
              {filteredAndSorted.map((item, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={item.id}
                  className="glass-panel p-6 hover:border-white/20 transition-all group"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 border",
                      item.type === 'High' ? "bg-rose-500/10 border-rose-500/20 text-rose-500" :
                      item.type === 'Medium' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                      "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                    )}>
                      <span className="text-[10px] font-black uppercase opacity-60">
                        {item.date.split(' ')[1].replace(',', '').substring(0, 3)}
                      </span>
                      <span className="text-2xl font-black">{item.date.split(' ')[0]}</span>
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h4 className="text-xl font-bold text-white">{item.title}</h4>
                        </div>
                        <div className="flex gap-2">
                          {item.tags.map(tag => (
                            <span key={tag} className="text-[9px] font-black uppercase text-slate-600 border border-white/5 bg-white/[0.02] px-2 py-1 rounded-lg">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">{item.description}</p>
                      
                      <div className="pt-4 flex items-center justify-between border-t border-white/5">
                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} />
                            Termen: {item.date}
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            setSelectedDayTasks([item]);
                            setSelectedSingleTask(item);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white text-slate-400 hover:text-bg-deep rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                        >
                          Detalii Procedură
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : renderMonthView()}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedDayTasks && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-bg-deep/95 backdrop-blur-2xl">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="glass-panel max-w-2xl w-full relative border-white/20 overflow-hidden flex flex-col max-h-[90vh] bg-slate-900"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-accent/5 pointer-events-none" />
                <button 
                  onClick={() => {
                    setSelectedDayTasks(null);
                    setSelectedSingleTask(null);
                  }}
                  className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors z-[110] cursor-pointer"
                >
                  <X size={24} />
                </button>

                <div className="p-8 pb-12 overflow-y-auto custom-scrollbar flex-1 relative z-10">
                  {!selectedSingleTask ? (
                <>
                  <div className="mb-8">
                    <h2 className="text-3xl font-black text-white mb-2">Termene pe {selectedDayTasks[0]?.date.split(',')[0]}</h2>
                    <p className="text-slate-500 font-medium">Selectează un eveniment pentru a vedea procedura completă</p>
                  </div>

                  <div className="space-y-4">
                    {selectedDayTasks.map((task) => (
                      <div 
                        key={task.id} 
                        onClick={() => setSelectedSingleTask(task)}
                        className="p-6 bg-white/5 border border-white/5 hover:border-white/20 rounded-2xl transition-all group cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                              task.type === 'High' ? "bg-rose-500/10 text-rose-500" :
                              task.type === 'Medium' ? "bg-amber-500/10 text-amber-500" :
                              "bg-emerald-500/10 text-emerald-500"
                            )}>
                              <CalendarIcon size={20} />
                            </div>
                            <div>
                              <h3 className="font-bold text-white group-hover:text-accent transition-colors">{task.title}</h3>
                              <p className="text-xs text-slate-500">{task.type} • {task.status}</p>
                            </div>
                          </div>
                          <ChevronRight size={20} className="text-slate-600 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-start gap-3 mb-2">
                    {selectedDayTasks.length > 1 && (
                      <button 
                        onClick={() => setSelectedSingleTask(null)}
                        className="flex items-center gap-2 text-accent hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-4 cursor-pointer"
                      >
                        <ChevronLeft size={14} />
                        Inapoi la listă
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-3 rounded-xl",
                      selectedSingleTask.type === 'High' ? "bg-rose-500/10 text-rose-500" :
                      selectedSingleTask.type === 'Medium' ? "bg-amber-500/10 text-amber-500" :
                      "bg-emerald-500/10 text-emerald-500"
                    )}>
                      <CalendarIcon size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-white">{selectedSingleTask.title}</h3>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                          selectedSingleTask.type === 'High' ? "bg-rose-500 text-white" : "bg-white/10 text-slate-400"
                        )}>
                          {selectedSingleTask.type}
                        </span>
                      </div>
                      <p className="text-slate-500 font-medium text-xs">{selectedSingleTask.date}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-accent mb-2">Descriere</h4>
                      <p className="text-slate-300 text-sm leading-relaxed">{selectedSingleTask.description}</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-white mb-4">Pași pentru conformare</h4>
                      <div className="space-y-4">
                        {[
                          'Colectarea tuturor facturilor de intrare/ieșire pentru perioada vizată.',
                          'Generarea fișierului XML sau completarea formularului smart PDF.',
                          'Semnarea digitală folosind certificatul calificat.',
                          'Încărcarea documentului pe portalul e-Guvernare (SPV).'
                        ].map((step, i) => (
                          <div key={i} className="flex gap-4">
                            <div className="w-5 h-5 rounded bg-accent/20 text-accent flex items-center justify-center text-[9px] font-black shrink-0">{i + 1}</div>
                            <p className="text-xs text-slate-400 leading-snug">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-white/10 flex justify-end relative z-10">
              <button 
                onClick={() => {
                  setSelectedDayTasks(null);
                  setSelectedSingleTask(null);
                }}
                className="px-8 py-3 bg-white/5 hover:bg-white text-white hover:text-bg-deep rounded-xl font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer"
              >
                Închide
              </button>
            </div>
          </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TargetIconHelper({ size, className }: any) {
  return <TargetIcon size={size} className={className} />;
}
