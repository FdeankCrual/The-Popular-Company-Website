"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, FileVideo, Users, TrendingUp, Loader2, ArrowRight, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [workbook, setWorkbook] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterEmployee, setFilterEmployee] = useState("All");
  const [filterClient, setFilterClient] = useState("All");

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [wbRes, leadsRes] = await Promise.all([
          fetch("/api/admin/data?action=getWorkbook"),
          fetch("/api/admin/data?action=getLeads")
        ]);

        if (wbRes.ok) {
          const wbData = await wbRes.json();
          if (Array.isArray(wbData)) setWorkbook(wbData);
        }

        if (leadsRes.ok) {
          const lData = await leadsRes.json();
          if (Array.isArray(lData)) setLeads(lData);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  const employeesList = Array.from(new Set(workbook.flatMap(w => w.assigned ? w.assigned.split(',').map((s:string) => s.trim()) : []))).filter(Boolean);
  const clientsList = Array.from(new Set(workbook.map(w => w.client))).filter(Boolean);

  const filteredWorkbook = workbook.filter(w => {
    if (filterEmployee !== "All" && !(w.assigned || "").includes(filterEmployee)) return false;
    if (filterClient !== "All" && w.client !== filterClient) return false;
    return true;
  });

  const activeTasksList = filteredWorkbook.filter(w => w.status?.toLowerCase() !== 'completed');
  const completedTasksList = filteredWorkbook.filter(w => w.status?.toLowerCase() === 'completed');
  
  const underReviewTasks = filteredWorkbook.filter(w => w.status?.toLowerCase().startsWith('reviewing') || w.status === 'Under Review');
  const fixesTasks = filteredWorkbook.filter(w => w.status === 'Fixes Required');

  const totalLeads = leads.length;
  
  const urgentDeadlines = filteredWorkbook
    .filter(w => w.status?.toLowerCase() !== 'completed' && (w.finalDate || w.shootDate))
    .slice(0, 4);

  const recentLeads = [...leads].reverse().slice(0, 4);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen text-gray-500 gap-2 bg-[#191919]">
        <Loader2 className="w-6 h-6 animate-spin"/> Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 md:p-12 min-h-screen bg-[#191919] text-[#D4D4D4]">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-2 text-white">
            Command <span className="text-tpc-orange">Center</span>
          </h2>
          <p className="text-gray-500 font-mono text-xs md:text-sm uppercase tracking-widest">
            Master Analytics & Bottlenecks
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full md:w-auto">
          <select value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)} className="w-full sm:w-auto bg-[#111] border border-white/10 text-white rounded-lg px-4 py-3 sm:py-2 text-sm font-bold uppercase tracking-widest outline-none focus:border-tpc-orange transition-colors">
            <option value="All">All Agents</option>
            {employeesList.map(emp => <option key={emp as string} value={emp as string}>{emp as string}</option>)}
          </select>
          <select value={filterClient} onChange={e => setFilterClient(e.target.value)} className="w-full sm:w-auto bg-[#111] border border-white/10 text-white rounded-lg px-4 py-3 sm:py-2 text-sm font-bold uppercase tracking-widest outline-none focus:border-tpc-orange transition-colors">
            <option value="All">All Clients</option>
            {clientsList.map(c => <option key={c as string} value={c as string}>{c as string}</option>)}
          </select>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
        {/* Active Tasks */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative group cursor-pointer transition-colors hover:border-white/20">
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="p-3 bg-white/5 rounded-xl text-tpc-orange">
              <FileVideo className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-400">Active Tasks</h3>
          </div>
          <div className="text-5xl font-black relative z-10 text-white">{activeTasksList.length}</div>
          
          {/* HOVER DROPDOWN */}
          <div className="absolute top-[calc(100%+8px)] left-0 w-full min-w-[250px] bg-[#151515] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-4 max-h-64 overflow-y-auto">
            <h4 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-3">Active Tasks</h4>
            <div className="flex flex-col gap-2">
              {activeTasksList.length === 0 && <div className="text-xs text-gray-500 italic">No active tasks</div>}
              {activeTasksList.slice(0, 10).map((t, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="text-white font-medium truncate pr-2">{t.name || "Untitled"}</span>
                  <span className="text-tpc-orange bg-tpc-orange/10 px-2 py-0.5 rounded uppercase font-bold tracking-widest text-[8px] whitespace-nowrap">{t.client || "TBD"}</span>
                </div>
              ))}
              {activeTasksList.length > 10 && <div className="text-[10px] text-gray-500 text-center mt-1 font-bold">+ {activeTasksList.length - 10} more</div>}
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative group cursor-pointer transition-colors hover:border-white/20">
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="p-3 bg-white/5 rounded-xl text-green-500">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-400">Completed</h3>
          </div>
          <div className="text-5xl font-black relative z-10 text-white">{completedTasksList.length}</div>

          {/* HOVER DROPDOWN */}
          <div className="absolute top-[calc(100%+8px)] left-0 w-full min-w-[250px] bg-[#151515] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-4 max-h-64 overflow-y-auto">
            <h4 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-3">Completed</h4>
            <div className="flex flex-col gap-2">
              {completedTasksList.length === 0 && <div className="text-xs text-gray-500 italic">No completed tasks</div>}
              {completedTasksList.slice(0, 10).map((t, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="text-white font-medium truncate pr-2">{t.name || "Untitled"}</span>
                  <span className="text-green-500 bg-green-500/10 px-2 py-0.5 rounded uppercase font-bold tracking-widest text-[8px] whitespace-nowrap">{t.client || "TBD"}</span>
                </div>
              ))}
              {completedTasksList.length > 10 && <div className="text-[10px] text-gray-500 text-center mt-1 font-bold">+ {completedTasksList.length - 10} more</div>}
            </div>
          </div>
        </div>

        {/* Under Review */}
        <div className="bg-[#111] border border-yellow-500/30 rounded-2xl p-6 relative group cursor-pointer transition-colors hover:border-yellow-500/50">
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          </div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500">
              <Loader2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-yellow-500">Under Review</h3>
          </div>
          <div className="text-5xl font-black relative z-10 text-white">{underReviewTasks.length}</div>

          {/* HOVER DROPDOWN */}
          <div className="absolute top-[calc(100%+8px)] left-0 w-full min-w-[250px] bg-[#151515] border border-yellow-500/20 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-4 max-h-64 overflow-y-auto">
            <h4 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-3">Under Review</h4>
            <div className="flex flex-col gap-2">
              {underReviewTasks.length === 0 && <div className="text-xs text-gray-500 italic">No tasks under review</div>}
              {underReviewTasks.slice(0, 10).map((t, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="text-white font-medium truncate pr-2">{t.name || "Untitled"}</span>
                  <span className="text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded uppercase font-bold tracking-widest text-[8px] whitespace-nowrap">{t.assigned || "Unassigned"}</span>
                </div>
              ))}
              {underReviewTasks.length > 10 && <div className="text-[10px] text-gray-500 text-center mt-1 font-bold">+ {underReviewTasks.length - 10} more</div>}
            </div>
          </div>
        </div>

        {/* Fixes Required */}
        <div className="bg-[#111] border border-red-500/30 rounded-2xl p-6 relative group cursor-pointer transition-colors hover:border-red-500/50">
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          </div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-red-500">Fixes Required</h3>
          </div>
          <div className="text-5xl font-black relative z-10 text-white">{fixesTasks.length}</div>

          {/* HOVER DROPDOWN */}
          <div className="absolute top-[calc(100%+8px)] right-0 md:left-0 lg:right-0 lg:left-auto xl:left-0 xl:right-auto w-full min-w-[250px] bg-[#151515] border border-red-500/20 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-4 max-h-64 overflow-y-auto">
            <h4 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-3">Fixes Required</h4>
            <div className="flex flex-col gap-2">
              {fixesTasks.length === 0 && <div className="text-xs text-gray-500 italic">No fixes required</div>}
              {fixesTasks.slice(0, 10).map((t, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="text-white font-medium truncate pr-2">{t.name || "Untitled"}</span>
                  <span className="text-red-500 bg-red-500/10 px-2 py-0.5 rounded uppercase font-bold tracking-widest text-[8px] whitespace-nowrap">{t.assigned || "Unassigned"}</span>
                </div>
              ))}
              {fixesTasks.length > 10 && <div className="text-[10px] text-gray-500 text-center mt-1 font-bold">+ {fixesTasks.length - 10} more</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* URGENT DEADLINES */}
        <div className="bg-[#111] border border-white/10 rounded-3xl p-8 flex flex-col">
           <h3 className="text-xl font-bold uppercase tracking-widest mb-6 flex items-center gap-3 text-white">
             <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
             Pending Deadlines
           </h3>
           <div className="space-y-4 flex-1">
              {urgentDeadlines.length === 0 ? (
                <div className="text-gray-500 italic">No pending tasks found!</div>
              ) : (
                urgentDeadlines.map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                    <div>
                      <div className="font-bold text-white mb-1">{item.name || "Untitled Task"}</div>
                      <div className="text-xs text-gray-500 font-mono uppercase tracking-widest">{item.client || "No Client"} • {item.assigned || "Unassigned"}</div>
                    </div>
                    <div className="text-sm font-bold text-red-400 bg-red-500/10 px-3 py-1 rounded-full whitespace-nowrap ml-4">
                      {item.finalDate || item.shootDate || item.scriptDate || "TBD"}
                    </div>
                  </div>
                ))
              )}
           </div>
           <Link href="/admin/workbook" className="mt-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-tpc-orange hover:text-white transition-colors self-start">
             Open Workbook <ArrowRight className="w-4 h-4" />
           </Link>
        </div>

        {/* RECENT INBOUND */}
        <div className="bg-[#111] border border-white/10 rounded-3xl p-8 flex flex-col">
           <h3 className="text-xl font-bold uppercase tracking-widest mb-6 flex items-center gap-3 text-white">
             <span className="w-2 h-2 rounded-full bg-blue-500" />
             Recent Leads ({totalLeads} Total)
           </h3>
           <div className="space-y-4 flex-1">
              {recentLeads.length === 0 ? (
                <div className="text-gray-500 italic">No leads found!</div>
              ) : (
                recentLeads.map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-4 border-b border-white/10 last:border-0 hover:bg-white/5 transition-colors rounded-lg">
                    <div>
                      <div className="font-bold text-white text-lg">{item.name || "Unknown"}</div>
                      <div className="text-sm text-gray-400 mt-1">{item.email}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full inline-block">
                        {item.target || "General"}
                      </div>
                    </div>
                  </div>
                ))
              )}
           </div>
           <Link href="/admin/leads" className="mt-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-blue-400 hover:text-white transition-colors self-start">
             View All Leads <ArrowRight className="w-4 h-4" />
           </Link>
        </div>
      </div>
    </div>
  );
}
