"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, FileVideo, Users, Loader2, ArrowRight, AlertTriangle, TrendingUp, BarChart3, Target, Activity, Database, CheckSquare, DollarSign, Clock, CalendarDays } from "lucide-react";
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

  // Basic Metrics
  const activeTasks = filteredWorkbook.filter(w => w.status?.toLowerCase() !== 'completed' && w.status?.toLowerCase() !== 'posted');
  const completedTasks = filteredWorkbook.filter(w => w.status?.toLowerCase() === 'completed' || w.status?.toLowerCase() === 'posted');
  const totalLeads = leads.length;

  // Pipeline Bottleneck Analysis
  const stages = {
    "Planning": 0,
    "Scripting": 0,
    "Shooting": 0,
    "Editing": 0,
    "Review": 0
  };

  activeTasks.forEach(w => {
    const s = (w.status || "").toLowerCase();
    if (s.includes('ideation') || s.includes('planning')) stages["Planning"]++;
    else if (s.includes('script')) stages["Scripting"]++;
    else if (s.includes('shoot')) stages["Shooting"]++;
    else if (s.includes('edit')) stages["Editing"]++;
    else if (s.includes('review') || s === "fixes required") stages["Review"]++;
    else stages["Planning"]++; // Default fallback
  });

  const maxStageCount = Math.max(...Object.values(stages), 1);

  // Employee Leaderboard & Workload
  const employeeStats: Record<string, { active: number, completed: number }> = {};
  filteredWorkbook.forEach(w => {
    if (!w.assigned) return;
    const isComp = w.status?.toLowerCase() === 'completed' || w.status?.toLowerCase() === 'posted';
    w.assigned.split(',').map((s:string) => s.trim()).forEach((emp:string) => {
      if (!emp) return;
      if (!employeeStats[emp]) employeeStats[emp] = { active: 0, completed: 0 };
      if (isComp) employeeStats[emp].completed++;
      else employeeStats[emp].active++;
    });
  });

  const topEmployees = Object.entries(employeeStats)
    .sort((a, b) => b[1].completed - a[1].completed)
    .slice(0, 5);

  // Client Distribution
  const clientStats: Record<string, number> = {};
  filteredWorkbook.forEach(w => {
    if (!w.client) return;
    if (!clientStats[w.client]) clientStats[w.client] = 0;
    clientStats[w.client]++;
  });
  const topClients = Object.entries(clientStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  const maxClientTasks = Math.max(...topClients.map(c => c[1]), 1);

  // NEW METRICS

  // 1. Pipeline Value & Conversions
  const activeLeads = leads.filter(l => l.status !== 'Rejected');
  let pipelineValue = 0;
  activeLeads.forEach(l => {
    if (l.budget) {
      const num = parseInt(l.budget.replace(/[^0-9]/g, ''));
      if (!isNaN(num)) pipelineValue += num;
    }
  });

  const leadConversion = {
    new: leads.filter(l => l.status === 'New' || !l.status).length,
    contacted: leads.filter(l => l.status === 'Contacted').length,
    converted: leads.filter(l => l.status === 'Converted').length,
  };
  const totalConvLeads = leadConversion.new + leadConversion.contacted + leadConversion.converted || 1; // avoid div by 0

  // 2. SLA Tracker (Critical Path)
  const isStageCompleted = (stage: 'script' | 'shoot' | 'edit' | 'final', status: string) => {
    const s = (status || "").toLowerCase();
    const stagesList = ["ideation", "planning", "scripting", "reviewing script", "shooting", "reviewing shoot", "editing", "reviewing edit", "under review", "completed", "posted"];
    let currentIndex = stagesList.indexOf(s);
    if (currentIndex === -1) {
      if (s.includes('reviewing script')) currentIndex = 3;
      else if (s.includes('reviewing shoot')) currentIndex = 5;
      else if (s.includes('reviewing edit')) currentIndex = 7;
      else if (s.includes('review')) currentIndex = 8;
      else currentIndex = 0;
    }
    if (stage === 'script') return currentIndex >= 4;
    if (stage === 'shoot') return currentIndex >= 6;
    if (stage === 'edit') return currentIndex >= 8;
    if (stage === 'final') return currentIndex >= 9;
    return false;
  };

  const urgentTasksRaw: any[] = [];
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  activeTasks.forEach(task => {
    const checkDeadline = (dateStr: string, stageName: string, isCompleted: boolean) => {
      if (!dateStr || isCompleted) return;
      const d = new Date(dateStr);
      if (d < now) {
        urgentTasksRaw.push({ ...task, urgentReason: `OVERDUE: ${stageName}`, isOverdue: true });
      } else if (d < tomorrow) {
        urgentTasksRaw.push({ ...task, urgentReason: `DUE 24H: ${stageName}`, isOverdue: false });
      }
    };
    
    checkDeadline(task.scriptDate, "Scripting", isStageCompleted('script', task.status));
    checkDeadline(task.shootDate, "Shooting", isStageCompleted('shoot', task.status));
    checkDeadline(task.editDate, "Editing", isStageCompleted('edit', task.status));
    checkDeadline(task.finalDate, "Final Output", isStageCompleted('final', task.status));
  });
  
  // Deduplicate by ID
  const uniqueUrgentTasks = Array.from(new Map(urgentTasksRaw.map(item => [item.id, item])).values());
  
  // 3. Monthly Volume Trend
  const monthlyStats: Record<string, number> = {};
  filteredWorkbook.forEach(w => {
    if (!w.month) return;
    if (!monthlyStats[w.month]) monthlyStats[w.month] = 0;
    monthlyStats[w.month]++;
  });
  const topMonths = Object.entries(monthlyStats)
    .sort((a, b) => b[1] - a[1]) // highest volume first
    .slice(0, 4);
  const maxMonthTasks = Math.max(...topMonths.map(m => m[1]), 1);


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-screen text-tpc-orange gap-4 bg-tpc-black">
        <Loader2 className="w-10 h-10 animate-spin"/> 
        <span className="font-bold uppercase tracking-widest text-sm">Aggregating Data...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 md:p-12 min-h-screen bg-tpc-black text-[#D4D4D4] font-sans selection:bg-tpc-orange selection:text-black overflow-x-hidden">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6">
        <div>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-2 text-white flex items-center gap-3">
            <Activity className="w-8 h-8 md:w-10 md:h-10 text-tpc-orange" />
            Analytics
          </h2>
          <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">
            Company Performance & Bottleneck Analysis
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <select value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)} className="w-full sm:w-auto bg-white/5 border border-white/10 text-white rounded-xl px-5 py-3 text-sm font-bold uppercase tracking-widest outline-none focus:border-tpc-orange transition-all cursor-pointer hover:bg-white/10">
            <option value="All" className="bg-tpc-black">All Agents</option>
            {employeesList.map(emp => <option key={emp as string} value={emp as string} className="bg-tpc-black">{emp as string}</option>)}
          </select>
          <select value={filterClient} onChange={e => setFilterClient(e.target.value)} className="w-full sm:w-auto bg-white/5 border border-white/10 text-white rounded-xl px-5 py-3 text-sm font-bold uppercase tracking-widest outline-none focus:border-tpc-orange transition-all cursor-pointer hover:bg-white/10">
            <option value="All" className="bg-tpc-black">All Clients</option>
            {clientsList.map(c => <option key={c as string} value={c as string} className="bg-tpc-black">{c as string}</option>)}
          </select>
        </div>
      </div>

      {/* Primary KPI Grid (Now includes Pipeline Value) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-3xl p-6 relative overflow-hidden group shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-tpc-orange/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-tpc-orange/30 transition-colors" />
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-2.5 bg-tpc-orange/20 rounded-xl text-tpc-orange border border-tpc-orange/30">
              <FileVideo className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-300 text-sm uppercase tracking-widest">Active Pipeline</h3>
          </div>
          <div className="text-5xl font-black relative z-10 text-white tracking-tighter">{activeTasks.length}</div>
        </div>

        <div className="bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-3xl p-6 relative overflow-hidden group shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-green-500/20 transition-colors" />
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-2.5 bg-green-500/20 rounded-xl text-green-500 border border-green-500/30">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-300 text-sm uppercase tracking-widest">Est. Revenue</h3>
          </div>
          <div className="text-4xl font-black relative z-10 text-white tracking-tighter truncate">${pipelineValue.toLocaleString()}</div>
        </div>

        <div className="bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-3xl p-6 relative overflow-hidden group shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-red-500/20 transition-colors" />
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-2.5 bg-red-500/20 rounded-xl text-red-500 border border-red-500/30">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-300 text-sm uppercase tracking-widest">Urgent / Overdue</h3>
          </div>
          <div className="text-5xl font-black relative z-10 text-white tracking-tighter">{uniqueUrgentTasks.length}</div>
        </div>

        <div className="bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-3xl p-6 relative overflow-hidden group shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-colors" />
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-500 border border-blue-500/30">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-300 text-sm uppercase tracking-widest">Total Leads</h3>
          </div>
          <div className="text-5xl font-black relative z-10 text-white tracking-tighter">{totalLeads}</div>
        </div>
      </div>

      {/* NEW: SLA Tracker / Critical Path */}
      {uniqueUrgentTasks.length > 0 && (
        <div className="mb-10 bg-red-500/5 border border-red-500/30 rounded-3xl p-8 shadow-[0_0_30px_rgba(239,68,68,0.05)]">
          <h3 className="text-xl font-black uppercase tracking-tighter mb-6 text-red-500 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 animate-pulse" /> Critical Path
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uniqueUrgentTasks.map(task => (
              <div key={task.id} className="bg-black/40 border border-red-500/20 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${task.isOverdue ? 'bg-red-500/20 text-red-500 border-red-500/30' : 'bg-orange-500/20 text-orange-500 border-orange-500/30'}`}>
                      {task.urgentReason}
                    </span>
                  </div>
                  <h4 className="text-white font-bold text-lg mb-1">{task.name || "Untitled"}</h4>
                  <p className="text-xs text-gray-400 mb-4">{task.client} • {task.assigned || "Unassigned"}</p>
                </div>
                <Link href="/admin/workbook" className="text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-white transition-colors flex items-center gap-2">
                  Open Workbook <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Insights Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">
        
        {/* PIPELINE FUNNEL */}
        <div className="xl:col-span-2 bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter mb-1 text-white flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-tpc-orange" /> Bottleneck Visualizer
            </h3>
            <p className="text-sm text-gray-500 mb-8 font-medium">Real-time breakdown of active tasks across production stages.</p>
          </div>
          
          <div className="flex-1 flex flex-col justify-end">
            <div className="space-y-6">
              {Object.entries(stages).map(([stageName, count]) => (
                <div key={stageName} className="relative">
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-bold uppercase tracking-widest text-xs text-gray-300">{stageName}</span>
                    <span className="font-black text-lg text-white leading-none">{count}</span>
                  </div>
                  <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,255,255,0.1)] ${count === maxStageCount && count > 0 ? 'bg-tpc-orange' : 'bg-white/20'}`}
                      style={{ width: `${maxStageCount > 0 ? (count / maxStageCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TOP PERFORMERS & WORKLOAD */}
        <div className="bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col">
          <h3 className="text-xl font-black uppercase tracking-tighter mb-1 text-white flex items-center gap-3">
            <Target className="w-6 h-6 text-green-500" /> Leaderboard
          </h3>
          <p className="text-sm text-gray-500 mb-8 font-medium">Top active and completed workloads.</p>
          
          <div className="space-y-6 flex-1">
            {topEmployees.length === 0 ? (
              <p className="text-gray-600 text-sm italic">No employee data found.</p>
            ) : (
              topEmployees.map(([emp, stats], index) => (
                <div key={emp} className="flex items-center gap-4 group">
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-black text-white text-xs group-hover:bg-tpc-orange group-hover:text-black transition-colors">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-white text-sm mb-1">{emp}</div>
                    <div className="flex gap-4 text-[10px] uppercase tracking-widest font-bold">
                      <span className="text-green-500">{stats.completed} Completed</span>
                      <span className="text-tpc-orange">{stats.active} Active</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEAD CONVERSION & PIPELINE */}
        <div className="bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h3 className="text-lg font-black uppercase tracking-tighter mb-6 text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" /> Lead Conversion
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="font-bold text-sm text-gray-300">Converted Clients</span>
                <span className="font-bold text-green-500 text-xs">{leadConversion.converted}</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full rounded-full" style={{ width: `${(leadConversion.converted / totalConvLeads) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="font-bold text-sm text-gray-300">Contacted</span>
                <span className="font-bold text-yellow-500 text-xs">{leadConversion.contacted}</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div className="bg-yellow-500 h-full rounded-full" style={{ width: `${(leadConversion.contacted / totalConvLeads) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="font-bold text-sm text-gray-300">New / Uncontacted</span>
                <span className="font-bold text-blue-500 text-xs">{leadConversion.new}</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(leadConversion.new / totalConvLeads) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* MONTHLY VOLUME TREND */}
        <div className="bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h3 className="text-lg font-black uppercase tracking-tighter mb-6 text-white flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-purple-400" /> Monthly Volume
          </h3>
          <div className="space-y-5 flex-1">
            {topMonths.length === 0 ? (
              <p className="text-gray-600 text-sm italic">No monthly data found.</p>
            ) : (
              topMonths.map(([month, count]) => (
                <div key={month}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-bold text-sm text-gray-300">{month}</span>
                    <span className="font-bold text-purple-400 text-xs">{count} tasks</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-purple-500 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${(count / maxMonthTasks) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CLIENT DISTRIBUTION */}
        <div className="bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h3 className="text-lg font-black uppercase tracking-tighter mb-6 text-white flex items-center gap-2">
             <Users className="w-5 h-5 text-gray-400" /> Top Clients
          </h3>
          <div className="space-y-5">
            {topClients.length === 0 ? (
              <p className="text-gray-600 text-sm italic">No client data found.</p>
            ) : (
              topClients.map(([client, count]) => (
                <div key={client}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-bold text-sm text-gray-300">{client}</span>
                    <span className="font-bold text-gray-500 text-xs">{count}</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gray-500 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${(count / maxClientTasks) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
