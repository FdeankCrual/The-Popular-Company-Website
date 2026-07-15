"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, FileVideo, Users, TrendingUp, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [workbook, setWorkbook] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const activeProjects = workbook.filter(w => w.status?.toLowerCase() !== 'completed').length;
  const completedTasks = workbook.filter(w => w.status?.toLowerCase() === 'completed').length;
  const totalLeads = leads.length;
  
  // Urgent deadlines: Incomplete tasks that have a date, taking the first 4
  const urgentDeadlines = workbook
    .filter(w => w.status?.toLowerCase() !== 'completed' && (w.finalDate || w.shootDate))
    .slice(0, 4);

  // Recent leads: Assuming newest are appended at the bottom, so reverse the array
  const recentLeads = [...leads].reverse().slice(0, 4);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen text-gray-500 gap-2 bg-[#191919]">
        <Loader2 className="w-6 h-6 animate-spin"/> Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 min-h-screen bg-[#191919] text-[#D4D4D4]">
      <div className="mb-10">
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 text-white">
          Command <span className="text-tpc-orange">Center</span>
        </h2>
        <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">
          Live System Overview
        </p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-tpc-orange/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-tpc-orange/20 transition-colors" />
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="p-3 bg-white/5 rounded-xl text-tpc-orange">
              <FileVideo className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-400">Active Projects</h3>
          </div>
          <div className="text-5xl font-black relative z-10 text-white">{activeProjects}</div>
        </div>

        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-green-500/20 transition-colors" />
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="p-3 bg-white/5 rounded-xl text-green-500">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-400">Tasks Completed</h3>
          </div>
          <div className="text-5xl font-black relative z-10 text-white">{completedTasks}</div>
        </div>

        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-colors" />
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="p-3 bg-white/5 rounded-xl text-blue-500">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-400">Total Leads</h3>
          </div>
          <div className="text-5xl font-black relative z-10 text-white">{totalLeads}</div>
        </div>

        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/20 transition-colors" />
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="p-3 bg-white/5 rounded-xl text-purple-500">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-400">Conversion Rate</h3>
          </div>
          <div className="text-5xl font-black relative z-10 text-white">4.2%</div>
          <div className="mt-2 text-xs font-mono text-purple-500/70 uppercase tracking-widest">Industry Avg</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* URGENT DEADLINES */}
        <div className="bg-[#111] border border-white/10 rounded-3xl p-8 flex flex-col">
           <h3 className="text-xl font-bold uppercase tracking-widest mb-6 flex items-center gap-3 text-white">
             <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
             Pending Tasks
           </h3>
           <div className="space-y-4 flex-1">
              {urgentDeadlines.length === 0 ? (
                <div className="text-gray-500 italic">No pending tasks found!</div>
              ) : (
                urgentDeadlines.map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5 hover:border-tpc-orange/50 transition-colors">
                    <div>
                      <div className="font-bold text-white mb-1">{item.name || "Untitled Task"}</div>
                      <div className="text-xs text-gray-500 font-mono uppercase tracking-widest">{item.client || "No Client"} • {item.status}</div>
                    </div>
                    <div className="text-sm font-bold text-red-400 bg-red-500/10 px-3 py-1 rounded-full whitespace-nowrap ml-4">
                      {item.finalDate || item.shootDate || item.scriptDate || "TBD"}
                    </div>
                  </div>
                ))
              )}
           </div>
           <Link href="/admin/workbook" className="mt-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-tpc-orange hover:text-white transition-colors self-start">
             View Full Workbook <ArrowRight className="w-4 h-4" />
           </Link>
        </div>

        {/* RECENT INBOUND */}
        <div className="bg-[#111] border border-white/10 rounded-3xl p-8 flex flex-col">
           <h3 className="text-xl font-bold uppercase tracking-widest mb-6 flex items-center gap-3 text-white">
             <span className="w-2 h-2 rounded-full bg-blue-500" />
             Recent Leads
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
                      <div className="text-xs text-gray-500 font-mono mt-2">{new Date(item.date).toLocaleDateString() === 'Invalid Date' ? item.date : new Date(item.date).toLocaleDateString()}</div>
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
