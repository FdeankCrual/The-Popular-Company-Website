"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2, Calendar, KanbanSquare, Share2, MessageSquare, X, FileText, Link as LinkIcon, CheckCircle, Copy, Check } from "lucide-react";
import { CalendarView } from "../../admin/workbook/components/CalendarView";
import { KanbanView } from "../../admin/workbook/components/KanbanView";

export default function ContentManager({ email, name, roles }: { email: string, name: string, roles: string[] }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeClient, setActiveClient] = useState<string | null>(null);
  const [activeMonth, setActiveMonth] = useState(() => new Date().toLocaleString('default', { month: 'long' }));
  const [activeView, setActiveView] = useState<'Calendar' | 'List'>('List');
  const [updating, setUpdating] = useState<string | null>(null);
  const [activeActionTask, setActiveActionTask] = useState<any>(null);
  const [copyStatus, setCopyStatus] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/admin/data?action=getWorkbook");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setTasks(data);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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

  const clients = useMemo(() => {
    const uniqueClients = new Set<string>();
    tasks.forEach(t => {
      if (t.client && t.client.trim() !== "") {
        uniqueClients.add(t.client.trim());
      }
    });
    return Array.from(uniqueClients).sort();
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (!activeClient) return [];
    
    return tasks.filter(t => {
      if (t.client !== activeClient) return false;
      
      if (activeMonth !== "All") {
        const dates = [t.scriptDate, t.shootDate, t.editDate, t.finalDate].filter(Boolean);
        if (dates.length > 0) {
          const matchesMonth = dates.some(d => {
            try {
              const dateObj = new Date(d);
              return dateObj.toLocaleString('default', { month: 'long' }) === activeMonth;
            } catch(e) { return false; }
          });
          if (!matchesMonth) return false;
        }
      }
      return true;
    });
  }, [tasks, activeClient, activeMonth]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-screen text-gray-500 bg-[#191919]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] md:h-screen bg-[#151515] text-[#D4D4D4] overflow-hidden">
      
      {/* MAIN PANE */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* HEADER WITH CLIENT SELECTOR & VIEW TOGGLES */}
        <div className="p-4 md:p-8 border-b border-white/10 flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0 bg-[#111]">
          
          <div className="flex items-center gap-6 flex-wrap">
            <div className="min-w-[200px]">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Select Client</h2>
              <select 
                value={activeClient || ""}
                onChange={e => setActiveClient(e.target.value)}
                className="w-full bg-black/50 border border-white/10 p-2 text-sm text-white focus:outline-none focus:border-tpc-orange transition-colors rounded"
              >
                <option value="" disabled>-- Select Client --</option>
                {clients.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="min-w-[150px]">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Select Month</h2>
              <select 
                value={activeMonth}
                onChange={e => setActiveMonth(e.target.value)}
                className="w-full bg-black/50 border border-white/10 p-2 text-sm text-white focus:outline-none focus:border-tpc-orange transition-colors rounded"
              >
                <option value="All">All Months</option>
                {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            
            {activeClient && (
              <div className="hidden md:block">
                <h2 className="text-xl font-black uppercase tracking-tighter text-white">
                  {activeClient}
                </h2>
                <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest">
                  Content Schedule
                </p>
              </div>
            )}
          </div>
          
          {activeClient && (
            <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 shrink-0">
              <button 
                onClick={() => setActiveView('Calendar')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 ${activeView === 'Calendar' ? 'bg-tpc-orange text-black' : 'text-gray-400 hover:text-white'}`}
              >
                <Calendar className="w-3 h-3" /> Calendar
              </button>
              <button 
                onClick={() => setActiveView('List')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 ${activeView === 'List' ? 'bg-tpc-orange text-black' : 'text-gray-400 hover:text-white'}`}
              >
                <FileText className="w-3 h-3" /> List View
              </button>
            </div>
          )}
        </div>

        {activeClient ? (
          <>
            <div className="flex-1 overflow-hidden relative">
              {activeView === 'Calendar' ? (
                <CalendarView data={filteredTasks} onTaskClick={setActiveActionTask} />
              ) : (
                <div className="h-full overflow-y-auto p-4 md:p-8 space-y-8">
                  
                  {(() => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);

                    const pending: any[] = [];
                    const todays: any[] = [];
                    const tomorrows: any[] = [];
                    const upcoming: any[] = [];

                    filteredTasks.forEach(task => {
                      if (task.status === "Posted" || task.status === "Completed") return; 
                      
                      if (!task.finalDate) {
                        upcoming.push(task);
                        return;
                      }
                      
                      const taskDate = new Date(task.finalDate);
                      taskDate.setHours(0, 0, 0, 0);

                      if (taskDate.getTime() === today.getTime()) {
                        todays.push(task);
                      } else if (taskDate.getTime() === tomorrow.getTime()) {
                        tomorrows.push(task);
                      } else if (taskDate.getTime() < today.getTime()) {
                        pending.push(task);
                      } else {
                        upcoming.push(task);
                      }
                    });

                    const renderTable = (title: string, tasks: any[], color: string) => {
                      if (tasks.length === 0) return null;
                      return (
                        <div className="mb-8">
                          <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${color}`}>
                            {title} ({tasks.length})
                          </h3>
                          <div className="bg-[#111] rounded-xl border border-white/10 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-gray-500">
                                  <th className="p-4 font-bold border-b border-white/10">Content Title</th>
                                  <th className="p-4 font-bold border-b border-white/10">Platform</th>
                                  <th className="p-4 font-bold border-b border-white/10">Posting Date / Time</th>
                                  <th className="p-4 font-bold border-b border-white/10">Status</th>
                                  <th className="p-4 font-bold border-b border-white/10 text-right">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {tasks.map(task => (
                                  <tr key={task.id} className="hover:bg-white/5 border-b border-white/5 transition-colors cursor-pointer group" onClick={() => setActiveActionTask(task)}>
                                    <td className="p-4 text-white font-bold text-sm">
                                      {task.name || "Untitled"}
                                      {(title.includes("Today") || title.includes("Tomorrow") || title.includes("Pending")) && (!task.driveB || !task.reelCaption) && (
                                        <span className="block mt-1 text-[9px] uppercase tracking-widest text-red-500 font-black">
                                          ⚠️ Missing {(!task.driveB && !task.reelCaption) ? "Video & Caption" : (!task.driveB ? "Final Video" : "Caption")}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-4 text-gray-400 text-xs font-mono uppercase">{task.platform || "N/A"}</td>
                                    <td className="p-4 text-gray-400 text-xs font-mono">
                                      {task.finalDate ? new Date(task.finalDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "TBD"}
                                    </td>
                                    <td className="p-4">
                                      <span className="text-[10px] font-bold uppercase tracking-widest text-tpc-orange bg-tpc-orange/10 px-2 py-1 rounded">
                                        {task.status || "Ideation"}
                                      </span>
                                    </td>
                                    <td className="p-4 text-right">
                                      <button className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors">Manage</button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    };

                    const noTasks = pending.length === 0 && todays.length === 0 && tomorrows.length === 0 && upcoming.length === 0;

                    return (
                      <>
                        {noTasks && <div className="p-8 text-center text-gray-500 italic text-sm">No active tasks found for this client.</div>}
                        {renderTable("Pending (Past Due)", pending, "text-red-500")}
                        {renderTable("Today", todays, "text-tpc-orange")}
                        {renderTable("Tomorrow", tomorrows, "text-blue-400")}
                        {renderTable("Upcoming / No Date", upcoming, "text-gray-400")}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <Share2 className="w-16 h-16 mb-4 opacity-20" />
            <p className="uppercase tracking-widest text-xs font-bold">Select a Client from the sidebar</p>
          </div>
        )}
      </div>

      {/* TASK MODAL */}
      {activeActionTask && (
        <div className="fixed inset-0 z-[20000] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#191919] border border-white/10 rounded-2xl w-full max-w-md flex flex-col shadow-2xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-white/10 shrink-0">
              <h3 className="text-xl font-bold text-white truncate">{activeActionTask.name || "Untitled Task"}</h3>
              <button onClick={() => setActiveActionTask(null)} className="text-gray-400 hover:text-white cursor-pointer"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <p className="text-sm font-mono text-gray-400 uppercase tracking-widest mb-6">
                {activeActionTask.client || "No Client"} • {activeActionTask.platform || "Platform TBD"} • <span className="text-tpc-orange">{activeActionTask.status || "Ideation"}</span>
              </p>

              {/* ASSET LINKS */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Required Assets</h4>
                <div className="flex flex-col gap-3">
                   {activeActionTask.docLink ? (
                     <a href={activeActionTask.docLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 p-3 rounded-lg text-xs font-bold transition-colors">
                       <FileText className="w-4 h-4"/> Open Script Doc
                     </a>
                   ) : (
                     <div className="text-center text-[10px] uppercase tracking-widest text-gray-500 italic p-2 border border-dashed border-white/10 rounded-lg">No Script Linked</div>
                   )}
                   {activeActionTask.driveA ? (
                     <a href={activeActionTask.driveA} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white p-3 rounded-lg text-xs font-bold transition-colors">
                       <LinkIcon className="w-4 h-4"/> Open Raw Assets (Drive A)
                     </a>
                   ) : null}
                   {activeActionTask.driveB ? (
                     <a href={activeActionTask.driveB} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white p-3 rounded-lg text-xs font-bold transition-colors">
                       <LinkIcon className="w-4 h-4"/> Open Final Edit (Drive B)
                     </a>
                   ) : null}
                   {!activeActionTask.docLink && !activeActionTask.driveA && !activeActionTask.driveB && (
                     <div className="text-[10px] uppercase tracking-widest text-gray-500 italic text-center">No assets are available yet for this task.</div>
                   )}
                </div>
              </div>

              {/* CAPTION */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-tpc-orange flex items-center gap-2">
                    Reel Caption / Description
                    {updating === activeActionTask.id && <Loader2 className="w-3 h-3 animate-spin" />}
                    {activeActionTask.captionApproved === 'true' && <span className="bg-green-500/20 text-green-500 px-2 py-0.5 rounded flex items-center gap-1"><Check className="w-3 h-3"/> Approved</span>}
                  </h4>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(activeActionTask.reelCaption || "");
                      setCopyStatus(true);
                      setTimeout(() => setCopyStatus(false), 2000);
                    }}
                    className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                  >
                    {copyStatus ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    {copyStatus ? "Copied!" : "Copy"}
                  </button>
                </div>
                <textarea 
                  rows={4}
                  placeholder="Type the caption or post description here..."
                  value={activeActionTask.reelCaption || ""}
                  onChange={(e) => updateTaskDetails(activeActionTask, { reelCaption: e.target.value })}
                  disabled={activeActionTask.captionApproved === 'true'}
                  className="w-full bg-black/50 border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-tpc-orange rounded resize-none disabled:opacity-50"
                />
                {/* Platform Specific Checks */}
                {(() => {
                  const p = (activeActionTask.platform || "").toLowerCase();
                  const cap = activeActionTask.reelCaption || "";
                  if (p === 'twitter' || p === 'x') {
                    return <div className={`text-[10px] uppercase font-bold tracking-widest mt-2 ${cap.length > 280 ? 'text-red-500' : 'text-gray-500'}`}>{cap.length} / 280 characters</div>;
                  }
                  if (p === 'instagram') {
                    const hasHashtag = cap.includes('#');
                    return (
                      <div className="flex justify-between items-center mt-2">
                         <div className={`text-[10px] uppercase font-bold tracking-widest ${hasHashtag ? 'text-green-500' : 'text-yellow-500'}`}>
                           {hasHashtag ? "✓ Hashtags Included" : "⚠️ Missing Hashtags"}
                         </div>
                         <div className="text-[10px] uppercase font-bold tracking-widest text-gray-500">{cap.length} characters</div>
                      </div>
                    );
                  }
                  return <div className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mt-2 text-right">{cap.length} characters</div>;
                })()}
              </div>

              {/* MARK POSTED */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                 <h4 className="text-[10px] font-bold uppercase tracking-widest text-green-500 mb-4">Post Link (Final Output)</h4>
                 <input 
                   type="text" 
                   placeholder="Paste URL of the live post..."
                   value={activeActionTask.postLink || ""} 
                   onChange={e => updateTaskDetails(activeActionTask, { postLink: e.target.value })}
                   className="w-full bg-black/50 border border-white/10 p-3 rounded-lg text-white text-sm focus:outline-none focus:border-green-500 transition-colors mb-4"
                 />
                 <button 
                   onClick={() => {
                     updateTaskDetails(activeActionTask, { status: "Posted" });
                     setActiveActionTask(null);
                   }}
                   disabled={updating === activeActionTask.id}
                   className="w-full py-3 bg-green-500 hover:bg-green-400 text-black font-black uppercase tracking-widest text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                 >
                   {updating === activeActionTask.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle className="w-5 h-5" /> Mark as Posted</>}
                 </button>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setActiveActionTask(null)}
                  className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
