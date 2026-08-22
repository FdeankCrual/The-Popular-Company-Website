"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Play, GripHorizontal } from "lucide-react";

const STAGES = ["Ideation", "Scripting", "Shooting", "Editing", "Review", "Completed", "Posted"];

// Map current statuses to our 7 Kanban stages
const mapStatusToStage = (status: string) => {
  const s = (status || "").toLowerCase();
  if (s.includes('ideation') || s.includes('planning')) return "Ideation";
  if (s.includes('script')) return "Scripting";
  if (s.includes('shoot')) return "Shooting";
  if (s.includes('edit')) return "Editing";
  if (s.includes('review') || s === "fixes required") return "Review";
  if (s === "completed") return "Completed";
  if (s === "posted") return "Posted";
  return "Ideation"; // Default
};

export function KanbanView({ 
  data, 
  handleInlineChange, 
  onTaskClick,
  allowedStages 
}: { 
  data: any[], 
  handleInlineChange: (id: string, field: string, value: string) => void, 
  onTaskClick?: (task: any) => void,
  allowedStages?: string[]
}) {
  
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("taskId", id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;
    
    let mappedStatus = stage;
    if (stage === "Review") mappedStatus = "Under Review";
    if (stage === "Ideation") mappedStatus = "Planning";
    
    handleInlineChange(taskId, "status", mappedStatus);
  };

  const activeStages = allowedStages || STAGES;

  // Group data by stage
  const columns: Record<string, any[]> = {};
  activeStages.forEach(s => columns[s] = []);
  
  data.forEach(task => {
    const stage = mapStatusToStage(task.status);
    if (columns[stage]) {
      columns[stage].push(task);
    }
  });

  const [draggableTask, setDraggableTask] = useState<string | null>(null);

  return (
    <div className="flex h-[calc(100dvh-200px)] min-w-full gap-4 p-4 overflow-x-auto overflow-y-hidden snap-x snap-mandatory bg-[#111] overscroll-x-contain">
      {activeStages.map((stage) => (
        <div 
          key={stage} 
          className="flex flex-col w-[85vw] md:w-[320px] min-w-[85vw] md:min-w-[320px] shrink-0 snap-center bg-[#1a1a1a] rounded-xl border border-white/5 overflow-hidden"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, stage)}
        >
          {/* Column Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/20">
            <h3 className="font-bold text-sm tracking-widest uppercase text-white/80">{stage}</h3>
            <span className="bg-white/10 text-white/50 text-xs px-2 py-0.5 rounded-full font-mono">{columns[stage].length}</span>
          </div>

          {/* Task Cards */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {columns[stage].map(task => (
              <motion.div
                layoutId={task.id}
                key={task.id}
                draggable={draggableTask === task.id}
                onDragStart={(e: any) => handleDragStart(e, task.id)}
                onDragEnd={() => setDraggableTask(null)}
                onClick={() => onTaskClick?.(task)}
                className={`bg-[#252525] p-4 rounded-lg border hover:border-tpc-orange/50 transition-colors shadow-lg ${draggableTask === task.id ? 'border-tpc-orange bg-[#2a2a2a]' : 'border-white/10'}`}
              >
                <div 
                  onMouseDown={(e) => { e.stopPropagation(); setDraggableTask(task.id); }}
                  onMouseUp={() => setDraggableTask(null)}
                  onMouseLeave={() => setDraggableTask(null)}
                  className="flex justify-center mb-3 cursor-grab active:cursor-grabbing hover:bg-white/5 rounded p-1 -mt-2 -mx-2 transition-colors text-gray-600 hover:text-white"
                >
                  <GripHorizontal className="w-4 h-4" />
                </div>
                
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono text-tpc-orange uppercase tracking-widest bg-tpc-orange/10 px-2 py-0.5 rounded">
                    {task.client || "No Client"}
                  </span>
                  {task.platform && (
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                      {task.platform}
                    </span>
                  )}
                </div>
                
                <h4 className="font-bold text-white text-sm mb-3 leading-snug">{task.name || "Untitled Task"}</h4>
                
                {task.assigned && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {task.assigned.split(',').map((a: string, i: number) => (
                      <span key={i} className="text-[9px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded uppercase tracking-wider">
                        {a.trim()}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500 font-mono mt-4 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 
                    {task.month || "No Month"}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
