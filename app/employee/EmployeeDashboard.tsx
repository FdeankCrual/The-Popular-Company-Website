"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2, CheckCircle, Clock, Link as LinkIcon, FileText, X, MessageSquare } from "lucide-react";

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "TBD";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  } catch(e) {
    return dateStr;
  }
};

import { CalendarView } from "../admin/workbook/components/CalendarView";
import { KanbanView } from "../admin/workbook/components/KanbanView";
import { Calendar, KanbanSquare, List } from "lucide-react";

export default function EmployeeDashboard({ email, name, roles }: { email: string, name: string, roles: string[] }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [activeQueryTask, setActiveQueryTask] = useState<any>(null);
  const [activeActionTask, setActiveActionTask] = useState<any>(null);
  const [activeView, setActiveView] = useState<'List' | 'Kanban' | 'Calendar'>('List');
  const [activeMonth, setActiveMonth] = useState(() => new Date().toLocaleString('default', { month: 'long' }));

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/admin/data?action=getWorkbook");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const myTasks = data.filter(row => {
            const assignedArray = (row.assigned || "").split(",").map((s: string) => s.trim().toLowerCase());
            return assignedArray.includes(name.toLowerCase()) || assignedArray.includes(email.toLowerCase());
          });
          setTasks(myTasks);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const markDone = async (task: any, updates: any) => {
    setUpdating(task.id);
    try {
      const getNextStatus = () => {
        if (roles.includes("CONTENT WRITER")) return "Reviewing Script";
        if (roles.includes("VIDEOGRAPHER")) return "Reviewing Shoot";
        if (roles.includes("EDITOR")) return "Reviewing Edit";
        return "Under Review";
      };

      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateWorkbook",
          data: {
            ...task,
            ...updates,
            status: getNextStatus()
          }
        })
      });

      await fetchTasks();
    } catch (e) {
      console.error("Failed to mark done", e);
      alert("Failed to update task.");
    } finally {
      setUpdating(null);
    }
  };

  const updateTaskDetails = async (task: any, updates: any) => {
    setUpdating(task.id);
    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateWorkbook",
          data: {
            ...task,
            ...updates
          }
        })
      });
      await fetchTasks();
    } catch (e) {
      console.error("Failed to update", e);
    } finally {
      setUpdating(null);
    }
  };

  const handleInlineChange = async (id: string, field: string, value: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      await updateTaskDetails(task, { [field]: value });
    }
  };

  const sortTasks = (taskList: any[]) => {
    return taskList.sort((a, b) => {
      const da = new Date(a.finalDate || a.shootDate || a.scriptDate || a.editDate || "9999-12-31").getTime();
      const db = new Date(b.finalDate || b.shootDate || b.scriptDate || b.editDate || "9999-12-31").getTime();
      return da - db;
    });
  };

  const getAllowedKanbanStages = () => {
    let stages: string[] = [];
    if (roles.includes("ADMIN") || roles.includes("ADMIN_CONTENT") || roles.includes("FOUNDER")) {
      return ["Ideation", "Scripting", "Designing", "Shooting", "Editing", "Review", "Completed", "Posted"];
    }
    if (roles.includes("CONTENT WRITER") || roles.includes("ADMIN_CONTENT")) stages.push("Ideation", "Scripting");
    if (roles.includes("GRAPHIC DESIGNER")) stages.push("Designing");
    if (roles.includes("VIDEOGRAPHER")) stages.push("Shooting");
    if (roles.includes("EDITOR")) stages.push("Editing");
    
    if (stages.length > 0) {
      stages.push("Review"); 
      return stages;
    }
    
    return ["Ideation", "Scripting", "Designing", "Shooting", "Editing", "Review", "Completed", "Posted"];
  };

  const filteredTasksByMonth = useMemo(() => {
    if (activeMonth === "All") return tasks;
    return tasks.filter(t => {
      const dates = [t.scriptDate, t.shootDate, t.editDate, t.finalDate].filter(Boolean);
      if (dates.length > 0) {
        return dates.some(d => {
          try {
            const dateObj = new Date(d);
            return dateObj.toLocaleString('default', { month: 'long' }) === activeMonth;
          } catch(e) { return false; }
        });
      }
      return true; 
    });
  }, [tasks, activeMonth]);

  const activeTasks = sortTasks(filteredTasksByMonth.filter(t => t.status !== "Completed" && !t.status?.toLowerCase().startsWith("review") && t.status !== "Under Review" && t.status !== "Fixes Required"));
  const reviewTasks = sortTasks(filteredTasksByMonth.filter(t => t.status?.toLowerCase().startsWith("review") || t.status === "Under Review"));
  const fixesTasks = sortTasks(filteredTasksByMonth.filter(t => t.status === "Fixes Required"));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-screen text-gray-500 bg-[#191919]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }


  
  return (
    <div className="p-4 sm:p-8 md:p-12 text-[#D4D4D4] bg-[#191919] min-h-screen pb-24 md:pb-12">
      <div className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-2 text-white">
            Welcome, <span className="text-tpc-orange">{name}</span>
          </h2>
          <p className="text-gray-500 font-mono text-xs md:text-sm uppercase tracking-widest">
            Personal Task Dashboard
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <select 
            value={activeMonth}
            onChange={e => setActiveMonth(e.target.value)}
            className="bg-black/50 border border-white/10 p-2 text-sm text-white focus:outline-none focus:border-tpc-orange transition-colors rounded"
          >
            <option value="All">All Months</option>
            {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
            <button 
              onClick={() => setActiveView('List')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 ${activeView === 'List' ? 'bg-tpc-orange text-black' : 'text-gray-400 hover:text-white'}`}
            >
              <List className="w-3 h-3" /> List
            </button>
            <button 
              onClick={() => setActiveView('Kanban')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 ${activeView === 'Kanban' ? 'bg-tpc-orange text-black' : 'text-gray-400 hover:text-white'}`}
            >
              <KanbanSquare className="w-3 h-3" /> Kanban
            </button>
            <button 
              onClick={() => setActiveView('Calendar')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 ${activeView === 'Calendar' ? 'bg-tpc-orange text-black' : 'text-gray-400 hover:text-white'}`}
            >
              <Calendar className="w-3 h-3" /> Calendar
            </button>
          </div>

          {roles.includes("ADMIN_CONTENT") || roles.includes("CONTENT WRITER") ? (
            <a href="/cms" className="px-4 py-3 md:py-2 bg-tpc-orange text-black font-bold uppercase tracking-widest rounded-lg hover:bg-white transition-colors text-xs text-center">
              Website CMS
            </a>
          ) : null}
        </div>
      </div>

      {activeView === 'Kanban' ? (
        <KanbanView data={tasks} handleInlineChange={handleInlineChange} onTaskClick={setActiveActionTask} allowedStages={getAllowedKanbanStages()} />
      ) : activeView === 'Calendar' ? (
        <CalendarView data={tasks} onTaskClick={setActiveActionTask} />
      ) : (
        <>
          {fixesTasks.length > 0 && (
        <div className="mb-10">
          <h3 className="text-xl font-bold uppercase tracking-widest text-red-500 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Fixes Required
          </h3>
          <div className="overflow-x-auto border border-red-500/20 rounded-xl bg-red-500/5">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-red-500/10 text-red-500 font-bold uppercase tracking-widest text-[10px]">
                <tr>
                  <th className="px-4 py-3">Task Name</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Admin Note</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Required Links</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-500/10">
                {fixesTasks.map((t, i) => (
                  <TaskRow key={i} task={t} onMarkDone={markDone} updating={updating} roles={roles} isFix onOpenQuery={setActiveQueryTask} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mb-10">
        <h3 className="text-xl font-bold uppercase tracking-widest text-white mb-4">Active Tasks</h3>
        {activeTasks.length === 0 ? (
          <p className="text-gray-500 italic">No active tasks right now.</p>
        ) : (
          <div className="overflow-x-auto border border-white/10 rounded-xl bg-[#111]">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#0a0a0a] text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                <tr>
                  <th className="px-4 py-3">Task Name</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Required Links</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {activeTasks.map((t, i) => (
                  <TaskRow key={i} task={t} onMarkDone={markDone} updating={updating} roles={roles} onOpenQuery={setActiveQueryTask} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mb-10 opacity-70">
        <h3 className="text-xl font-bold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" /> Under Review
        </h3>
        {reviewTasks.length === 0 ? (
          <p className="text-gray-600 italic">No tasks currently under review.</p>
        ) : (
           <div className="overflow-x-auto border border-white/5 rounded-xl bg-[#111]">
            <table className="w-full text-left text-sm whitespace-nowrap pointer-events-none opacity-75 grayscale">
              <thead className="bg-[#0a0a0a] text-gray-600 font-bold uppercase tracking-widest text-[10px]">
                <tr>
                  <th className="px-4 py-3">Task Name</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reviewTasks.map((t, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => setActiveQueryTask(t)}>
                    <td className="px-4 py-4 font-bold text-white">{t.name || "Untitled Task"}</td>
                    <td className="px-4 py-4 text-gray-400">{t.client || "No Client"}</td>
                    <td className="px-4 py-4">
                      <span className="text-[10px] uppercase font-bold tracking-widest bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </>
      )}

      {/* ACTION MODAL (For Calendar & Kanban clicks) */}
      {activeActionTask && (
        <div className="fixed inset-0 z-[15000] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#191919] border border-white/10 rounded-2xl w-full max-w-lg flex flex-col shadow-2xl relative p-8">
            <button onClick={() => setActiveActionTask(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white cursor-pointer">
              <X className="w-5 h-5"/>
            </button>
            
            <h3 className="text-2xl font-bold text-white mb-2">{activeActionTask.name || "Untitled"}</h3>
            <p className="text-sm font-mono text-gray-400 uppercase tracking-widest mb-6">
              {activeActionTask.client || "No Client"} • {activeActionTask.platform || "Platform TBD"}
            </p>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-tpc-orange mb-4">Required Links</h4>
              
              {(roles.includes("CONTENT WRITER") || roles.includes("ADMIN_CONTENT")) && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs uppercase tracking-widest text-gray-300 font-bold flex items-center gap-2"><FileText className="w-4 h-4"/> Script Doc Link</span>
                  <input 
                    type="text" 
                    placeholder="Paste Google Doc link here..."
                    value={activeActionTask.docLink || ""} 
                    onChange={e => updateTaskDetails(activeActionTask, { docLink: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 p-3 rounded-lg text-white text-sm focus:outline-none focus:border-tpc-orange transition-colors"
                  />
                </div>
              )}

              {(roles.includes("VIDEOGRAPHER") || roles.includes("EDITOR") || roles.includes("GRAPHIC DESIGNER")) && (
                <div className="flex flex-col gap-3">
                   {activeActionTask.docLink ? (
                     <a href={activeActionTask.docLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 p-4 rounded-xl text-sm font-bold transition-colors">
                       <FileText className="w-5 h-5"/> Open Script Doc
                     </a>
                   ) : (
                     <div className="text-center text-xs text-gray-500 italic p-2 border border-dashed border-white/10 rounded-lg">No Script Doc available</div>
                   )}
                   {activeActionTask.driveA ? (
                     <a href={activeActionTask.driveA} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white p-4 rounded-xl text-sm font-bold transition-colors">
                       <LinkIcon className="w-5 h-5"/> Open Google Drive Folder
                     </a>
                   ) : (
                     <div className="flex items-center justify-center w-full bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-bold italic">
                       No Drive Folder Provided
                     </div>
                   )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => {
                  markDone(activeActionTask, { docLink: activeActionTask.docLink });
                  setActiveActionTask(null);
                }}
                disabled={updating === activeActionTask.id}
                className="w-full py-4 bg-green-500 hover:bg-green-400 text-black font-black uppercase tracking-widest text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
              >
                {updating === activeActionTask.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle className="w-5 h-5" /> Mark Done</>}
              </button>
              <button 
                onClick={() => {
                  setActiveQueryTask(activeActionTask);
                  setActiveActionTask(null);
                }}
                className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold uppercase tracking-widest text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-5 h-5" /> Ask Support
                {(activeActionTask.adminReply && activeActionTask.adminReply.trim() !== "") && (
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse absolute -mt-6 ml-24"></span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUERY MODAL */}
      {activeQueryTask && (
        <div className="fixed inset-0 z-[20000] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#191919] border border-white/10 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-white/10 shrink-0">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">💬 Task Support: {activeQueryTask.name}</h3>
              <button onClick={() => setActiveQueryTask(null)} className="text-gray-400 hover:text-white cursor-pointer"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-[#111] border border-white/5 rounded-xl p-4">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2 block">Admin Reply / Notes</label>
                <div className="w-full bg-black border border-white/10 rounded-lg p-4 text-gray-300 min-h-[100px] whitespace-pre-wrap text-sm">
                  {activeQueryTask.adminReply ? activeQueryTask.adminReply : <span className="italic opacity-50">No replies from admin yet.</span>}
                </div>
              </div>

              <div className="bg-tpc-orange/5 border border-tpc-orange/20 rounded-xl p-4">
                <label className="text-[10px] uppercase tracking-widest text-tpc-orange font-bold mb-2 flex items-center justify-between">
                  Your Message / Query
                  {updating === activeQueryTask.id && <Loader2 className="w-3 h-3 animate-spin" />}
                </label>
                <textarea 
                  rows={5} 
                  placeholder="Type your questions or status updates here..."
                  value={activeQueryTask.employeeQuery || ""} 
                  onChange={(e) => setActiveQueryTask({...activeQueryTask, employeeQuery: e.target.value})} 
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-tpc-orange text-sm resize-none" 
                />
              </div>

              <div className="flex justify-end gap-4 pt-2">
                <button type="button" onClick={() => setActiveQueryTask(null)} className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white transition-colors cursor-pointer text-sm">Close</button>
                <button 
                  onClick={async () => {
                    await updateTaskDetails(activeQueryTask, { employeeQuery: activeQueryTask.employeeQuery });
                    setActiveQueryTask(null);
                  }}
                  disabled={updating === activeQueryTask.id}
                  className="bg-tpc-orange text-black px-8 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2 cursor-pointer text-sm"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskRow({ task, onMarkDone, updating, roles, isFix = false, onOpenQuery }: any) {
  const isUpdating = updating === task.id;
  
  // Local state for role-specific links
  const [docLink, setDocLink] = useState(task.docLink || "");
  const handleMarkDone = () => {
    onMarkDone(task, { docLink });
  };

  return (
    <tr className="hover:bg-white/5 transition-colors group">
      <td className="px-4 py-4 align-top">
        <div className="font-bold text-white text-base">{task.name || "Untitled"}</div>
        <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{task.platform || "Platform TBD"}</div>
      </td>
      
      <td className="px-4 py-4 align-top text-gray-300 font-mono text-xs uppercase">
        {task.client || "No Client"}
      </td>

      {isFix && (
        <td className="px-4 py-4 align-top">
          <div className="max-w-[200px] whitespace-normal text-xs text-red-300 bg-red-500/10 p-2 rounded border border-red-500/20">
            {task.adminNote}
          </div>
        </td>
      )}

      <td className="px-4 py-4 align-top">
        <div className="inline-block px-2 py-1 bg-white/5 rounded text-xs font-bold text-tpc-orange">
          {formatDate(task.finalDate || task.shootDate || task.scriptDate || task.editDate)}
        </div>
      </td>

      <td className="px-4 py-4 align-top min-w-[250px]">
        <div className="space-y-3">
          {/* Content Writer Links */}
          {(roles.includes("CONTENT WRITER") || roles.includes("ADMIN_CONTENT")) && (
            <div className="flex flex-col gap-1">
              <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold flex items-center gap-1"><FileText className="w-3 h-3"/> Script Doc</span>
              <input 
                type="text" 
                placeholder="Paste Google Doc link..."
                value={docLink} 
                onChange={e => setDocLink(e.target.value)}
                className="w-full bg-black/50 border border-white/10 p-2 rounded text-white text-xs focus:outline-none focus:border-tpc-orange transition-colors"
              />
            </div>
          )}

          {/* Videographer, Editor & Graphic Designer Links */}
          {(roles.includes("VIDEOGRAPHER") || roles.includes("EDITOR") || roles.includes("GRAPHIC DESIGNER")) && (
            <div className="flex flex-col gap-2 mt-2">
               {task.docLink && (
                 <a href={task.docLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 p-3 rounded-lg text-xs font-bold transition-colors">
                   <FileText className="w-4 h-4"/> Open Script Doc
                 </a>
               )}
               {task.driveA ? (
                 <a href={task.driveA} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white p-3 rounded-lg text-xs font-bold transition-colors">
                   <LinkIcon className="w-4 h-4"/> Open Google Drive Folder
                 </a>
               ) : (
                 <div className="flex items-center justify-center w-full bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs font-bold italic">
                   No Drive Folder Provided
                 </div>
               )}
            </div>
          )}
        </div>
      </td>

      <td className="px-4 py-4 align-top w-40">
        <div className="flex flex-col gap-2">
          <button 
            onClick={handleMarkDone}
            disabled={isUpdating}
            className="w-full py-2 bg-white/5 hover:bg-green-500 hover:text-black text-white font-bold uppercase tracking-widest text-xs rounded transition-colors flex items-center justify-center gap-2"
          >
            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Mark Done</>}
          </button>
          <button 
            onClick={() => onOpenQuery(task)}
            className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold uppercase tracking-widest text-[10px] rounded transition-colors flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-3 h-3" /> Support
            {(task.adminReply && task.adminReply.trim() !== "") && (
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse absolute -mt-4 -mr-16"></span>
            )}
          </button>
        </div>
      </td>
    </tr>
  );
}
