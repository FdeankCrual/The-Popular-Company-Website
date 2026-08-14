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
    <div className="flex flex-col h-[calc(100vh-250px)] bg-[#111] p-4 md:p-8 overflow-y-auto">
      
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

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 md:gap-4 mb-4">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="text-center text-xs font-mono font-bold text-gray-500 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 md:gap-4 flex-1">
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
                {tasks.map(task => (
                  <div 
                    key={task.id} 
                    onClick={() => onTaskClick?.(task)}
                    className="text-[10px] bg-[#252525] text-white p-1.5 rounded border border-white/10 flex flex-col gap-1 truncate cursor-pointer hover:border-tpc-orange/50 transition-colors"
                  >
                    <span className="font-bold truncate text-tpc-orange">{task.client || "Untitled"}</span>
                    <span className="truncate opacity-80">{task.name}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
