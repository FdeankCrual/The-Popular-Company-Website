"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckSquare, X, ChevronDown, User, ExternalLink } from "lucide-react";

export default function MyTasksClient({ initialName }: { initialName: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  
  // The selected admin to view tasks for
  const [selectedAdmin, setSelectedAdmin] = useState(initialName);
  
  // Modals
  const [reviewTask, setReviewTask] = useState<any>(null);
  const [reviewNote, setReviewNote] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [wbRes, userRes] = await Promise.all([
        fetch("/api/admin/data?action=getWorkbook"),
        fetch("/api/admin/data?action=getUsers")
      ]);
      
      if (wbRes.ok) {
        const liveData = await wbRes.json();
        if (Array.isArray(liveData)) setData(liveData);
      }
      
      if (userRes.ok) {
        const liveUsers = await userRes.json();
        if (Array.isArray(liveUsers)) {
          setUsers(liveUsers);
        }
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  }

  const updateTask = async (taskId: string, updates: any) => {
    // Optimistic UI
    const updatedRow = { ...data.find(r => r.id === taskId), ...updates };
    setData(prev => prev.map(item => item.id === taskId ? updatedRow : item));

    // For status changes, apply automation logic on backend or do it here?
    // In My Tasks, we're just hitting the updateWorkbook endpoint with the full row.
    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateWorkbook", data: updatedRow })
      });
    } catch (err) {
      console.error("Failed to update task", err);
    }
  };

  // Extract Admins (or anyone assigned tasks)
  const adminNames = Array.from(new Set([
    initialName,
    "Garv",
    "Dhruv",
    "Bhavik",
    ...users.map(u => u.Name)
  ])).filter(Boolean);

  // Filter tasks
  const myTasks = data.filter(task => {
    if (!task.assigned) return false;
    const assignees = task.assigned.split(',').map((s:string) => s.trim().toLowerCase());
    return assignees.includes(selectedAdmin.toLowerCase());
  });

  const getStatusColor = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s.includes("review")) return "bg-red-500/20 text-red-500 border-red-500/30";
    if (s === "completed") return "bg-green-500/20 text-green-500 border-green-500/30";
    if (s === "shooting") return "bg-purple-500/20 text-purple-500 border-purple-500/30";
    if (s === "editing") return "bg-orange-500/20 text-orange-500 border-orange-500/30";
    return "bg-blue-500/20 text-blue-500 border-blue-500/30";
  };

  return (
    <div className="flex-1 bg-tpc-black p-6 md:p-10 min-h-screen relative overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-white mb-2 flex items-center gap-3">
              <CheckSquare className="w-8 h-8 text-tpc-orange" />
              My Tasks
            </h1>
            <p className="text-gray-400 text-sm">Review and manage your assigned tasks efficiently.</p>
          </div>
          
          <div className="relative">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
              <User className="w-4 h-4 text-gray-400" />
              <select 
                value={selectedAdmin} 
                onChange={(e) => setSelectedAdmin(e.target.value)}
                className="bg-transparent border-none text-white outline-none font-bold text-sm cursor-pointer appearance-none pr-6"
              >
                {adminNames.map(name => (
                  <option key={name} value={name} className="bg-tpc-black text-white">{name}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-500 absolute right-4 pointer-events-none" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="uppercase tracking-widest text-xs font-bold">Loading tasks...</p>
          </div>
        ) : (
          <>
            {myTasks.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                <CheckSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">You're all caught up!</h3>
                <p className="text-gray-400 text-sm">There are no active tasks assigned to {selectedAdmin}.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myTasks.map(task => (
                  <div key={task.id} className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors group flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      <span className="text-xs text-gray-500 font-mono">{task.month}</span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">{task.name}</h3>
                    <p className="text-sm text-gray-400 mb-6">{task.client} • {task.platform}</p>

                    <div className="mt-auto space-y-3">
                      {(task.status || "").toLowerCase().includes("review") ? (
                        <button 
                          onClick={() => setReviewTask(task)}
                          className="w-full py-3 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 border border-yellow-500/30 font-bold uppercase tracking-widest text-xs rounded-xl transition-colors animate-pulse flex items-center justify-center gap-2"
                        >
                          <CheckSquare className="w-4 h-4" /> Review Task
                        </button>
                      ) : (
                        <div className="w-full py-3 bg-white/5 text-gray-500 border border-white/10 font-bold uppercase tracking-widest text-xs rounded-xl text-center cursor-not-allowed">
                          In Progress
                        </div>
                      )}
                      {task.docLink && (
                        <a 
                          href={task.docLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full py-2 bg-transparent hover:bg-white/5 text-blue-400 hover:text-blue-300 border border-white/10 font-bold uppercase tracking-widest text-[10px] rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                          <ExternalLink className="w-3 h-3" /> Open Script Doc
                        </a>
                      )}

                      {task.driveA ? (
                        <a 
                          href={task.driveA} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full py-2 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white border border-white/10 font-bold uppercase tracking-widest text-[10px] rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                          <ExternalLink className="w-3 h-3" /> Open Drive Folder
                        </a>
                      ) : (
                        <p className="text-center text-[10px] text-red-400 italic">No Drive Folder provided.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* REVIEW MODAL */}
      {reviewTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl w-full max-w-lg p-8 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => { setReviewTask(null); setReviewNote(""); }} className="absolute top-4 right-4 text-gray-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold uppercase tracking-widest mb-6 text-yellow-500 flex items-center gap-2">
              <CheckSquare className="w-5 h-5" /> Review Task
            </h3>
            
            <div className="mb-6">
              <h4 className="text-white font-bold text-lg">{reviewTask.name}</h4>
              <p className="text-gray-400 text-sm">{reviewTask.client}</p>
            </div>

            <p className="text-gray-400 mb-4 text-sm">Review the associated files before approving.</p>
            
            <div className="flex flex-col gap-2 mb-6">
              {reviewTask.docLink && (
                 <a href={reviewTask.docLink} target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-white/5 hover:bg-white/10 border border-white/10 text-blue-400 hover:text-blue-300 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                   <ExternalLink className="w-4 h-4" /> Open Script Doc
                 </a>
              )}
              {reviewTask.driveA && (
                 <a href={reviewTask.driveA} target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                   <ExternalLink className="w-4 h-4" /> Open Google Drive Folder
                 </a>
              )}
              {!reviewTask.docLink && !reviewTask.driveA && (
                 <p className="text-red-400 text-xs italic">No review files provided.</p>
              )}
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Admin Fixes Note (Optional)</label>
                <textarea 
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="If rejecting, explain what needs to be fixed..."
                  className="w-full bg-black border border-white/10 p-3 rounded-xl mt-1 text-white min-h-[100px] text-sm focus:border-tpc-orange outline-none"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => {
                  let nextStatus = "Completed";
                  if (reviewTask.status === "Reviewing Script") nextStatus = "Shooting";
                  if (reviewTask.status === "Reviewing Shoot") nextStatus = "Editing";
                  
                  updateTask(reviewTask.id, {
                    status: nextStatus,
                    adminNote: reviewNote || reviewTask.adminNote,
                    assigned: nextStatus === "Completed" ? "" : reviewTask.assigned
                  });
                  
                  setReviewTask(null);
                  setReviewNote("");
                }}
                className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-black font-bold uppercase tracking-widest rounded-lg transition-colors text-xs"
              >
                Approve & Advance
              </button>
              <button 
                onClick={() => {
                  let prevStatus = "Planning";
                  if (reviewTask.status === "Reviewing Script") prevStatus = "Scripting";
                  if (reviewTask.status === "Reviewing Shoot") prevStatus = "Shooting";
                  if (reviewTask.status === "Reviewing Edit") prevStatus = "Editing";
                  
                  updateTask(reviewTask.id, {
                    status: prevStatus,
                    adminNote: reviewNote || reviewTask.adminNote
                  });
                  
                  setReviewTask(null);
                  setReviewNote("");
                }}
                className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-500 font-bold uppercase tracking-widest rounded-lg transition-colors text-xs"
              >
                Reject & Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
