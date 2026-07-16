"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle, Clock, Link as LinkIcon, FileText } from "lucide-react";

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

export default function EmployeeDashboard({ email, name, roles }: { email: string, name: string, roles: string[] }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-screen text-gray-500 bg-[#191919]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const sortTasks = (taskList: any[]) => {
    return taskList.sort((a, b) => {
      const da = new Date(a.finalDate || a.shootDate || a.scriptDate || a.editDate || "9999-12-31").getTime();
      const db = new Date(b.finalDate || b.shootDate || b.scriptDate || b.editDate || "9999-12-31").getTime();
      return da - db;
    });
  };

  const activeTasks = sortTasks(tasks.filter(t => t.status !== "Completed" && !t.status?.toLowerCase().startsWith("review") && t.status !== "Under Review" && t.status !== "Fixes Required"));
  const reviewTasks = sortTasks(tasks.filter(t => t.status?.toLowerCase().startsWith("review") || t.status === "Under Review"));
  const fixesTasks = sortTasks(tasks.filter(t => t.status === "Fixes Required"));
  
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
        {roles.includes("ADMIN_CONTENT") || roles.includes("CONTENT WRITER") ? (
          <a href="/cms" className="px-4 py-3 md:py-2 bg-tpc-orange text-black font-bold uppercase tracking-widest rounded-lg hover:bg-white transition-colors text-xs text-center w-full md:w-auto">
            Website CMS
          </a>
        ) : null}
      </div>

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
                  <TaskRow key={i} task={t} onMarkDone={markDone} updating={updating} roles={roles} isFix />
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
                  <TaskRow key={i} task={t} onMarkDone={markDone} updating={updating} roles={roles} />
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
                  <tr key={i} className="hover:bg-white/5 transition-colors">
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
    </div>
  );
}

function TaskRow({ task, onMarkDone, updating, roles, isFix = false }: any) {
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

          {/* Videographer & Editor Links */}
          {(roles.includes("VIDEOGRAPHER") || roles.includes("EDITOR")) && (
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
        <button 
          onClick={handleMarkDone}
          disabled={isUpdating}
          className="w-full py-2 bg-white/5 hover:bg-green-500 hover:text-black text-white font-bold uppercase tracking-widest text-xs rounded transition-colors flex items-center justify-center gap-2"
        >
          {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Mark Done</>}
        </button>
      </td>
    </tr>
  );
}
