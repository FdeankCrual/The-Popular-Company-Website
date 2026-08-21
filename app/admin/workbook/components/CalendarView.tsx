"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

export function CalendarView({ data, onTaskClick }: { data: any[], onTaskClick?: (task: any) => void }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  // Group tasks by date
  const getTasksForDate = (date: number) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), date);
    const targetStr = targetDate.toISOString().split('T')[0];
    
    return data.filter(task => {
      const dates = [
        task.scriptDate?.split('T')[0],
        task.shootDate?.split('T')[0],
        task.editDate?.split('T')[0],
        task.finalDate?.split('T')[0]
      ];
      return dates.includes(targetStr);
    });
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-250px)] bg-[#111] p-4 md:p-8 overflow-y-auto">
      
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-black uppercase tracking-widest text-white">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={nextMonth} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* MOBILE AGENDA VIEW */}
      <div className="block md:hidden flex-1 overflow-y-auto space-y-4 pb-12">
        {days.filter(d => getTasksForDate(d).length > 0).length === 0 && (
          <div className="text-center text-gray-500 py-10 font-mono text-xs uppercase tracking-widest">
            No tasks scheduled for this month.
          </div>
        )}
        {days.map(day => {
          const tasks = getTasksForDate(day);
          if (tasks.length === 0) return null;
          const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
          
          return (
            <div key={`mobile-${day}`} className={`p-4 rounded-xl border ${isToday ? 'border-tpc-orange bg-tpc-orange/5' : 'border-white/5 bg-[#1a1a1a]'}`}>
              <h4 className={`text-sm font-bold uppercase tracking-widest mb-4 ${isToday ? 'text-tpc-orange' : 'text-white'}`}>
                {day} {currentDate.toLocaleString('default', { month: 'short' })}
              </h4>
              <div className="space-y-2">
                {tasks.map(task => {
                  const s = (task.status || "").toLowerCase();
                  const isDone = s === "completed" || s === "posted";
                  const colorClass = isDone 
                    ? "bg-green-500/10 text-green-400 border-green-500/30"
                    : "bg-yellow-500/10 text-yellow-500 border-yellow-500/30";

                  const timeStr = task.finalDate ? new Date(task.finalDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";

                  return (
                    <div 
                      key={`mob-${task.id}`} 
                      onClick={() => onTaskClick?.(task)}
                      className={`text-xs p-3 rounded-lg border flex flex-col gap-1 cursor-pointer transition-colors ${colorClass}`}
                    >
                      <span className="font-bold opacity-90">{task.client || "Untitled"}</span>
                      <span className="opacity-80">{task.name}</span>
                      {timeStr && <span className="text-[10px] font-mono opacity-70 mt-1 flex items-center gap-1"><Clock className="w-3 h-3"/> {timeStr}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP CALENDAR GRID */}
      <div className="hidden md:block flex-1 overflow-x-auto pb-4">
        <div className="min-w-[700px]">
          <div className="grid grid-cols-7 gap-4 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="text-center text-xs font-mono font-bold text-gray-500 uppercase tracking-widest">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-4 flex-1">
            {padding.map(i => (
              <div key={`pad-${i}`} className="min-h-[120px] rounded-xl border border-white/5 bg-[#1a1a1a]/50 opacity-50" />
            ))}
            
            {days.map(day => {
              const tasks = getTasksForDate(day);
              const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
              
              return (
                <div 
                  key={day} 
                  className={`min-h-[120px] p-2 rounded-xl border ${isToday ? 'border-tpc-orange bg-tpc-orange/5' : 'border-white/5 bg-[#1a1a1a]'} hover:border-white/20 transition-colors flex flex-col`}
                >
                  <div className={`text-xs font-mono font-bold mb-2 ${isToday ? 'text-tpc-orange' : 'text-gray-400'}`}>
                    {day}
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-1">
                    {tasks.map(task => {
                      const s = (task.status || "").toLowerCase();
                      const isDone = s === "completed" || s === "posted";
                      const colorClass = isDone 
                        ? "bg-green-500/10 text-green-400 border-green-500/30 hover:border-green-500/50"
                        : "bg-yellow-500/10 text-yellow-500 border-yellow-500/30 hover:border-yellow-500/50";

                      const timeStr = task.finalDate ? new Date(task.finalDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";

                      return (
                        <div 
                          key={task.id} 
                          onClick={() => onTaskClick?.(task)}
                          className={`text-[10px] p-1.5 rounded border flex flex-col gap-1 truncate cursor-pointer transition-colors ${colorClass}`}
                        >
                          <span className="font-bold truncate opacity-90">{task.client || "Untitled"}</span>
                          <span className="truncate opacity-80">{task.name}</span>
                          {timeStr && <span className="text-[9px] font-mono opacity-70 mt-1 flex items-center gap-1"><Clock className="w-3 h-3"/> {timeStr}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
